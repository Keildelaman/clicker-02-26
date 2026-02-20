/**
 * item-gen.js - Item Generation Engine
 *
 * Pure function module for generating random items with correct
 * affix rolling, validation, naming, and pricing.
 * No events, no state mutation, no DOM access.
 * Imported only by items.js (Phase 12.4).
 *
 * @see docs/design/item-system-v2.md (Sections 3, 4, 5, 6, 12)
 */

import {
  AFFIXES, SLOT_CATEGORY_WEIGHTS, SKILL_LEVEL_ZONE_RANGES,
  STATUS_AFFIX_IDS, SKILL_LEVEL_AFFIX_IDS, SKILL_BOOST_AFFIX_IDS
} from '../data/affixes.data.js';
import { LEGENDARIES } from '../data/legendaries.data.js';
import {
  BASE_NAMES, PREFIXES, SUFFIXES, EPIC_PREFIXES, SLOT_EMOJIS
} from '../data/item-names.data.js';
import {
  ZONE_TIERS, ZONE_REQUIRED_LEVELS, EQUIPMENT_SLOTS_V2,
  RARITY_AFFIX_COUNTS, RARITY_MAX_MINUS_ONE_CHANCE,
  MAX_STATUS_AFFIXES_PER_ITEM, MAX_SKILL_LEVEL_AFFIXES_PER_ITEM,
  AFFIX_REROLL_MAX_ATTEMPTS, EPIC_RARITY_PREFIX_CHANCE,
  SHOP_RARITY_WEIGHTS_V2
} from '../data/constants.js';
import { rollAffixValue, itemBuyPrice, itemSellPrice, affixValueAtTier } from '../data/balance.js';
import { randomInt } from '../services/utils.js';

// ============================================================
// PRECOMPUTED DATA
// ============================================================

/** Affixes grouped by category for fast lookup */
const AFFIXES_BY_CATEGORY = {};
for (const affix of Object.values(AFFIXES)) {
  if (!AFFIXES_BY_CATEGORY[affix.category]) AFFIXES_BY_CATEGORY[affix.category] = [];
  AFFIXES_BY_CATEGORY[affix.category].push(affix);
}

// ============================================================
// INTERNAL HELPERS
// ============================================================

/**
 * Weighted random selection from a { key: weight } object.
 * @param {Object.<string, number>} weights
 * @returns {string} Selected key
 */
export function weightedRandom(weights) {
  const entries = Object.entries(weights);
  let total = 0;
  for (const [, w] of entries) total += w;
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

/**
 * Determine actual affix count for a rarity.
 * Common/Legendary always return their max.
 * Others have a chance to roll max-1.
 * @param {string} rarity
 * @returns {number}
 */
function rollAffixCount(rarity) {
  const max = RARITY_AFFIX_COUNTS[rarity];
  const minusOneChance = RARITY_MAX_MINUS_ONE_CHANCE[rarity];
  if (minusOneChance === undefined) return max;
  return Math.random() < minusOneChance ? max - 1 : max;
}

/**
 * Validate whether an affix can be added to an item.
 * Rules:
 *   1. No duplicate affix IDs
 *   2. Max 2 status affixes (chance + potency combined)
 *   3. Max 1 skill level affix (covers rule 4: skill_all_level exclusivity)
 * @param {string} affixId
 * @param {Array<{id: string}>} existingAffixes
 * @returns {boolean}
 */
function validateAffix(affixId, existingAffixes) {
  // Rule 1: No duplicate affix IDs
  if (existingAffixes.some(a => a.id === affixId)) return false;

  // Rule 2: Max 2 status affixes
  if (STATUS_AFFIX_IDS.has(affixId)) {
    const statusCount = existingAffixes.filter(a => STATUS_AFFIX_IDS.has(a.id)).length;
    if (statusCount >= MAX_STATUS_AFFIXES_PER_ITEM) return false;
  }

  // Rules 3 & 4: Max 1 skill level affix (skill_all_level can't coexist with others)
  if (SKILL_LEVEL_AFFIX_IDS.has(affixId)) {
    if (existingAffixes.some(a => SKILL_LEVEL_AFFIX_IDS.has(a.id))) return false;
  }

  return true;
}

/**
 * Roll a single affix with category weighting, validation, and retry loop.
 * @param {string} slot - Equipment slot
 * @param {Array<{id: string}>} existingAffixes - Already-rolled affixes on this item
 * @param {number} zoneTier - Zone tier (1-7)
 * @returns {{id: string, value: number, tier: number}|null} Rolled affix or null if all retries fail
 */
export function rollAffix(slot, existingAffixes, zoneTier) {
  for (let attempt = 0; attempt < AFFIX_REROLL_MAX_ATTEMPTS; attempt++) {
    // 1. Roll category from slot weights
    const category = weightedRandom(SLOT_CATEGORY_WEIGHTS[slot]);

    // 2. Get affixes for this category
    const categoryAffixes = AFFIXES_BY_CATEGORY[category];
    if (!categoryAffixes || categoryAffixes.length === 0) continue;

    // 3. Build weight map and roll specific affix
    const weightMap = {};
    for (const affix of categoryAffixes) {
      weightMap[affix.id] = affix.weight;
    }
    const affixId = weightedRandom(weightMap);

    // 4. Validate
    if (!validateAffix(affixId, existingAffixes)) continue;

    // 5. Roll value
    const affix = AFFIXES[affixId];
    let value;
    if (affix.scaleType === 'zoneBased') {
      const zoneRange = SKILL_LEVEL_ZONE_RANGES[zoneTier];
      value = Number(weightedRandom(zoneRange.weights));
    } else {
      value = rollAffixValue(affix.t1Min, affix.t1Max, zoneTier, affix.scaleType);
    }

    return { id: affixId, value, tier: zoneTier };
  }

  // All retries exhausted — skip this affix slot
  return null;
}

/**
 * Generate an item name: "[Prefix] [BaseName] [Suffix]".
 * @param {string} slot
 * @param {string} rarity
 * @param {Array<{id: string}>} affixes
 * @returns {string}
 */
function generateItemName(slot, rarity, affixes) {
  // Pick random base name for the slot
  const names = BASE_NAMES[slot];
  const baseName = names[randomInt(0, names.length - 1)];

  // Determine prefix
  let prefix;
  if (rarity === 'epic' && Math.random() < EPIC_RARITY_PREFIX_CHANCE) {
    prefix = EPIC_PREFIXES[randomInt(0, EPIC_PREFIXES.length - 1)];
  } else {
    // First affix with a PREFIXES entry (offensive + status affixes)
    const prefixAffix = affixes.find(a => PREFIXES[a.id]);
    const options = prefixAffix ? PREFIXES[prefixAffix.id] : PREFIXES.default;
    prefix = options[randomInt(0, options.length - 1)];
  }

  // Determine suffix: first matching defensive/utility/skill affix
  let suffix = '';
  for (const a of affixes) {
    // Direct ID match (defensive + utility affixes)
    if (SUFFIXES[a.id]) {
      const options = SUFFIXES[a.id];
      suffix = options[randomInt(0, options.length - 1)];
      break;
    }
    // Skill boost affixes → generic "of Mastery" etc.
    if (SKILL_BOOST_AFFIX_IDS.has(a.id)) {
      const options = SUFFIXES.skill_boost;
      suffix = options[randomInt(0, options.length - 1)];
      break;
    }
    // skill_all_level → special suffix
    if (a.id === 'skill_all_level') {
      const options = SUFFIXES.skill_all_level;
      suffix = options[randomInt(0, options.length - 1)];
      break;
    }
    // Other skill level affixes
    if (SKILL_LEVEL_AFFIX_IDS.has(a.id)) {
      const options = SUFFIXES.skill_level;
      suffix = options[randomInt(0, options.length - 1)];
      break;
    }
  }
  if (!suffix) {
    suffix = SUFFIXES.default[0];
  }

  return `${prefix} ${baseName} ${suffix}`.trim();
}

/**
 * Calculate buy and sell prices for an item.
 * @param {string} zoneId
 * @param {string} rarity
 * @param {Array<{id: string, value: number, tier: number}>} affixes
 * @param {number} zoneTier
 * @returns {{ buyPrice: number, sellPrice: number }}
 */
function calculatePrices(zoneId, rarity, affixes, zoneTier) {
  if (affixes.length === 0) {
    const buy = itemBuyPrice(zoneId, rarity, 1.0);
    return { buyPrice: buy, sellPrice: itemSellPrice(buy) };
  }

  // Compute average affix quality (value / tier max)
  let qualitySum = 0;
  for (const a of affixes) {
    const affix = AFFIXES[a.id];
    if (affix.scaleType === 'zoneBased') {
      // Heuristic: value / max possible level for this tier
      const maxLevel = Math.max(
        ...Object.keys(SKILL_LEVEL_ZONE_RANGES[zoneTier].weights).map(Number)
      );
      qualitySum += a.value / maxLevel;
    } else {
      const range = affixValueAtTier(affix.t1Min, affix.t1Max, zoneTier, affix.scaleType);
      qualitySum += range.max > 0 ? a.value / range.max : 1.0;
    }
  }

  const affixQuality = Math.max(0.7, Math.min(1.3, qualitySum / affixes.length));
  const buyPrice = itemBuyPrice(zoneId, rarity, affixQuality);
  return { buyPrice, sellPrice: itemSellPrice(buyPrice) };
}

/**
 * Generate a unique item ID.
 * @returns {string}
 */
function generateUUID() {
  const timestamp = Date.now().toString(16);
  const random = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
  return `item_${timestamp}_${random}`;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Generate a random item with affixes, name, and pricing.
 * @param {string} zoneId - Zone ID (e.g. 'whisperwood')
 * @param {string} slot - Equipment slot (e.g. 'weapon')
 * @param {string} rarity - Rarity tier (e.g. 'rare')
 * @returns {Object} Complete item object
 */
export function generateItem(zoneId, slot, rarity) {
  const zoneTier = ZONE_TIERS[zoneId];
  const affixCount = rollAffixCount(rarity);

  const affixes = [];
  for (let i = 0; i < affixCount; i++) {
    const affix = rollAffix(slot, affixes, zoneTier);
    if (affix) affixes.push(affix);
  }

  const name = generateItemName(slot, rarity, affixes);
  const { buyPrice, sellPrice } = calculatePrices(zoneId, rarity, affixes, zoneTier);

  return {
    id: generateUUID(),
    name,
    slot,
    zone: zoneId,
    rarity,
    requiredLevel: ZONE_REQUIRED_LEVELS[zoneId],
    emoji: SLOT_EMOJIS[slot],
    affixes,
    reforgedAffix: null,
    reforgeCount: 0,
    imbued: false,
    temperLevel: 0,
    temperSelections: [],
    temperBrickCount: 0,
    buyPrice,
    sellPrice,
    legendaryId: null,
    uniqueEffect: null
  };
}

/**
 * Generate a legendary item with fixed name and unique effect.
 * @param {string} legendaryId - Legendary definition ID (e.g. 'soulreaver')
 * @param {string} zoneId - Zone where the boss was killed
 * @param {number} [affixTier] - Boss-scaled affix tier (falls back to zone tier)
 * @returns {Object} Complete legendary item object
 */
export function generateLegendaryItem(legendaryId, zoneId, affixTier) {
  const legendary = LEGENDARIES[legendaryId];
  const tier = affixTier || ZONE_TIERS[zoneId];

  const affixes = [];
  for (let i = 0; i < RARITY_AFFIX_COUNTS.legendary; i++) {
    const affix = rollAffix(legendary.slot, affixes, tier);
    if (affix) affixes.push(affix);
  }

  const { buyPrice, sellPrice } = calculatePrices(zoneId, 'legendary', affixes, tier);

  return {
    id: generateUUID(),
    name: legendary.name,
    slot: legendary.slot,
    zone: zoneId,
    rarity: 'legendary',
    requiredLevel: ZONE_REQUIRED_LEVELS[zoneId],
    emoji: legendary.emoji,
    affixes,
    reforgedAffix: null,
    reforgeCount: 0,
    imbued: false,
    temperLevel: 0,
    temperSelections: [],
    temperBrickCount: 0,
    buyPrice,
    sellPrice,
    legendaryId,
    uniqueEffect: {
      id: legendary.uniqueEffectId,
      description: legendary.uniqueEffectDesc
    }
  };
}

/**
 * Generate a random shop item (convenience wrapper).
 * Rolls rarity from shop weights, random slot, delegates to generateItem.
 * @param {string} zoneId - Current zone ID
 * @returns {Object} Complete item object
 */
export function generateShopItem(zoneId) {
  const rarity = weightedRandom(SHOP_RARITY_WEIGHTS_V2);
  const slot = EQUIPMENT_SLOTS_V2[randomInt(0, EQUIPMENT_SLOTS_V2.length - 1)];
  return generateItem(zoneId, slot, rarity);
}

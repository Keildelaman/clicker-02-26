/**
 * item-crafting.js - Item Crafting Engine
 *
 * Pure function module for three item modification systems:
 * Reforge (fix bad rolls), Imbue (add missing affix), Temper (push to perfection).
 * No events, no state mutation beyond the passed item, no DOM access.
 * Imported only by items.js (Phase 12.4).
 *
 * @see docs/design/item-system-v2.md (Section 7)
 */

import { AFFIXES, SKILL_LEVEL_ZONE_RANGES } from '../data/affixes.data.js';
import {
  ZONE_TIERS, RARITY_AFFIX_COUNTS,
  TEMPER_BOOST_PER_CYCLE, TEMPER_SELECTION_LEVELS, TEMPER_MAX_LEVEL,
  TEMPER_BRICK_THRESHOLD
} from '../data/constants.js';
import {
  rollAffixValue, reforgeCost as calcReforgeCost,
  imbueCost as calcImbueCost, temperCost as calcTemperCost
} from '../data/balance.js';
import { rollAffix, weightedRandom } from './item-gen.js';

// ============================================================
// INTERNAL HELPERS
// ============================================================

/**
 * Check if a temper level is a selection level (where an affix is chosen).
 * @param {number} level - Temper level (1-12)
 * @returns {boolean}
 */
function isSelectionLevel(level) {
  return TEMPER_SELECTION_LEVELS.includes(level);
}

/**
 * Get the cycle index (0, 1, or 2) for a temper level.
 * Cycle 0: levels 1-4, Cycle 1: levels 5-8, Cycle 2: levels 9-12.
 * @param {number} level - Temper level (1-12)
 * @returns {0|1|2}
 */
function getCycle(level) {
  return level <= 4 ? 0 : level <= 8 ? 1 : 2;
}

/**
 * Calculate total boost fraction for a specific affix across all temper cycles.
 * For each cycle where this affix was selected, counts completed boost levels
 * and sums boost percentages. Boost is additive across cycles.
 *
 * @param {Object} item - Item with temperLevel and temperSelections
 * @param {number} affixIndex - Index of the affix to calculate boost for
 * @returns {number} Total boost fraction (e.g. 0.15 for 15%)
 */
function calculateAffixBoost(item, affixIndex) {
  let totalBoost = 0;
  for (let cycle = 0; cycle < 3; cycle++) {
    if (cycle >= item.temperSelections.length) break;
    if (item.temperSelections[cycle] !== affixIndex) continue;
    const selLevel = TEMPER_SELECTION_LEVELS[cycle];
    const completedBoosts = Math.max(0, Math.min(4, item.temperLevel - selLevel + 1));
    totalBoost += completedBoosts * TEMPER_BOOST_PER_CYCLE[cycle];
  }
  return totalBoost;
}

/**
 * Apply a boost to an affix value based on its baseValue and total boost.
 * Recalculates from baseValue to avoid floating-point drift.
 * Flat/zoneBased: floor to integer. Percentage: round to 4 decimal places.
 *
 * @param {Object} affix - Affix object with id, baseValue, value
 * @param {number} totalBoost - Total boost fraction
 */
function applyBoostToAffix(affix, totalBoost) {
  const affixDef = AFFIXES[affix.id];
  if (affixDef.scaleType === 'percentage') {
    affix.value = Math.round(affix.baseValue * (1 + totalBoost) * 10000) / 10000;
  } else {
    // flat or zoneBased — integer values
    affix.value = Math.floor(affix.baseValue * (1 + totalBoost));
  }
}

// ============================================================
// REFORGE
// ============================================================

/**
 * Check if an item can be reforged.
 * Must have 2+ affixes and not be common rarity.
 * @param {Object} item
 * @returns {boolean}
 */
export function canReforge(item) {
  return item.rarity !== 'common' && item.affixes.length >= 2;
}

/**
 * Get indices of affixes that can be reforged on this item.
 * If never reforged: all indices available. Once committed: only the locked affix.
 * @param {Object} item
 * @returns {number[]} Array of valid affix indices
 */
export function getReforgeableAffixes(item) {
  if (!canReforge(item)) return [];
  if (item.reforgedAffix !== null) return [item.reforgedAffix];
  return item.affixes.map((_, i) => i);
}

/**
 * Get the gold cost to reforge this item.
 * Cost escalates with reforge count: base × rarityMult × 2.2^reforgeCount.
 * @param {Object} item
 * @returns {number}
 */
export function getReforgeCost(item) {
  return calcReforgeCost(item.zone, item.rarity, item.reforgeCount);
}

/**
 * Reforge an affix on the item, replacing it with a completely new random affix.
 * On first reforge, permanently locks the chosen affix index.
 * Subsequent reforges can only target the locked index.
 *
 * @param {Object} item
 * @param {number} affixIndex - Index of the affix to reforge
 * @returns {{ oldAffix: Object, newAffix: Object }|null} Result or null on failure
 */
export function reforge(item, affixIndex) {
  if (!canReforge(item)) return null;

  const validIndices = getReforgeableAffixes(item);
  if (!validIndices.includes(affixIndex)) return null;

  // Lock affix on first reforge
  if (item.reforgedAffix === null) {
    item.reforgedAffix = affixIndex;
  }

  const oldAffix = { ...item.affixes[affixIndex] };
  const zoneTier = ZONE_TIERS[item.zone];

  // Build list of other affixes (exclude the one being reforged) for duplicate avoidance
  const otherAffixes = item.affixes.filter((_, i) => i !== affixIndex);

  // Roll a completely new affix
  const newAffix = rollAffix(item.slot, otherAffixes, zoneTier);
  if (!newAffix) return null;

  // If item is tempered, apply existing temper boost to the new affix
  if (item.temperLevel > 0 && item.temperSelections) {
    newAffix.baseValue = newAffix.value;
    const totalBoost = calculateAffixBoost(item, affixIndex);
    if (totalBoost > 0) {
      applyBoostToAffix(newAffix, totalBoost);
    }
  }

  item.affixes[affixIndex] = newAffix;
  item.reforgeCount++;

  return { oldAffix, newAffix };
}

// ============================================================
// IMBUE
// ============================================================

/**
 * Check if an item can be imbued (add a missing affix).
 * Not common, not legendary, not already imbued, and has fewer than max affixes.
 * @param {Object} item
 * @returns {boolean}
 */
export function canImbue(item) {
  return item.rarity !== 'common' &&
    item.rarity !== 'legendary' &&
    item.imbued === false &&
    item.affixes.length < RARITY_AFFIX_COUNTS[item.rarity];
}

/**
 * Get the gold cost to imbue this item.
 * @param {Object} item
 * @returns {number}
 */
export function getImbueCost(item) {
  return calcImbueCost(item.zone, item.rarity);
}

/**
 * Imbue an item, adding a new random affix matching the item's zone tier.
 * Uses the full affix rolling pipeline with slot weighting and validation.
 *
 * @param {Object} item
 * @returns {{ affix: Object }|null} The newly added affix, or null on failure
 */
export function imbue(item) {
  if (!canImbue(item)) return null;

  const zoneTier = ZONE_TIERS[item.zone];
  const newAffix = rollAffix(item.slot, item.affixes, zoneTier);
  if (!newAffix) return null;

  item.affixes.push(newAffix);
  item.imbued = true;

  return { affix: newAffix };
}

// ============================================================
// TEMPER
// ============================================================

/**
 * Check if an item can be tempered.
 * Must be rare, epic, or legendary; below max temper level; not bricked.
 * @param {Object} item
 * @returns {boolean}
 */
export function canTemper(item) {
  const validRarities = ['rare', 'epic', 'legendary'];
  return validRarities.includes(item.rarity) &&
    item.temperLevel < TEMPER_MAX_LEVEL &&
    !isBricked(item);
}

/**
 * Get the gold cost for the next temper level.
 * @param {Object} item
 * @returns {number}
 */
export function getTemperCost(item) {
  return calcTemperCost(item.temperLevel, item.zone, item.rarity);
}

/**
 * Advance the item's temper level by one.
 *
 * On first temper (level 0 → 1): snapshots baseValue on all affixes.
 * Selection levels (1, 5, 9): randomly picks an affix to focus.
 * Boost levels (all others): applies boost to the most recently selected affix.
 *
 * Boost is additive on base (not compounding):
 *   value = baseValue × (1 + totalBoostForAffix)
 *
 * @param {Object} item
 * @returns {{ type: 'selection', affixIndex: number }|{ type: 'boost', affixIndex: number, boostPercent: number, newValue: number }|null}
 */
export function temper(item) {
  if (!canTemper(item)) return null;

  // Snapshot baseValues on first temper
  if (item.temperLevel === 0) {
    for (const affix of item.affixes) {
      affix.baseValue = affix.value;
    }
  }

  item.temperLevel++;

  if (isSelectionLevel(item.temperLevel)) {
    // Randomly pick an affix to focus for this cycle
    const affixIndex = Math.floor(Math.random() * item.affixes.length);
    item.temperSelections.push(affixIndex);
    // Also apply first boost (selection level gives value immediately)
    const totalBoost = calculateAffixBoost(item, affixIndex);
    const affix = item.affixes[affixIndex];
    applyBoostToAffix(affix, totalBoost);
    const cycle = getCycle(item.temperLevel);
    return { type: 'selection', affixIndex, boostPercent: TEMPER_BOOST_PER_CYCLE[cycle], newValue: affix.value };
  }

  // Boost level: enhance the most recently selected affix
  const affixIndex = item.temperSelections[item.temperSelections.length - 1];
  const totalBoost = calculateAffixBoost(item, affixIndex);
  const affix = item.affixes[affixIndex];
  applyBoostToAffix(affix, totalBoost);

  const cycle = getCycle(item.temperLevel);
  return {
    type: 'boost',
    affixIndex,
    boostPercent: TEMPER_BOOST_PER_CYCLE[cycle],
    newValue: affix.value
  };
}

/**
 * Reset temper progress on an item, reverting all affix values to baseValue.
 * Increments brick count. After TEMPER_BRICK_THRESHOLD resets, item is bricked.
 *
 * @param {Object} item
 * @returns {boolean} true on success, false if invalid
 */
export function temperReset(item) {
  if (item.temperLevel <= 0 || isBricked(item)) return false;

  // Revert all affixes to their pre-temper values
  for (const affix of item.affixes) {
    if (affix.baseValue !== undefined) {
      affix.value = affix.baseValue;
      delete affix.baseValue;
    }
  }

  item.temperLevel = 0;
  item.temperSelections = [];
  item.temperBrickCount++;

  return true;
}

// ============================================================
// UTILITY
// ============================================================

/**
 * Check if an item is bricked (too many temper resets).
 * Bricked items retain current temper state but cannot be reset or re-tempered.
 * @param {Object} item
 * @returns {boolean}
 */
export function isBricked(item) {
  return item.temperBrickCount >= TEMPER_BRICK_THRESHOLD;
}

/**
 * items.js - Item System v2
 *
 * Owns: Equipment (6 object slots), inventory (30+3), materials,
 * stat aggregation (equipmentStats), item generation delegation.
 *
 * Listens to: item:requestEquip, item:requestUnequip, item:requestScrap,
 *   item:requestBulkScrap, item:requestAdd, materials:dropped,
 *   item:requestReforge, item:requestImbue, item:requestTemper, item:requestTemperReset
 * Emits: item:equipped, item:unequipped, item:scrapped, item:bulkScrapped,
 *   item:added, item:autoScrapped, materials:spent, materials:insufficient,
 *   item:reforged, item:imbued, item:tempered, item:temperReset, item:craftFailed
 *
 * @see docs/architecture/item-system-v2-architecture.md
 * @see docs/design/item-system-v2.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { AFFIXES, SKILL_LEVEL_AFFIX_IDS, SKILL_BOOST_AFFIX_IDS } from '../data/affixes.data.js';
import { WEAPON_DAMAGE_TYPES } from '../data/item-names.data.js';
import { SKILLS } from '../data/skills.data.js';
import {
  EQUIPMENT_SLOTS_V2, INVENTORY_MAX, INVENTORY_OVERFLOW_MAX,
  SELL_PRICE_RATIO_V2, ZONE_MATERIALS
} from '../data/constants.js';
import { saveGame } from '../services/storage.js';

// Sub-module re-exports (items.js is the only entry point for these)
export { generateItem, generateLegendaryItem, generateShopItem } from './item-gen.js';

import {
  LEGENDARY_EFFECT_HANDLERS, initLegendaryEffects,
  updateLegendaryTicks, resubscribeAllLegendaries
} from './item-effects.js';

import {
  canReforge, getReforgeableAffixes, getReforgeCost, reforge,
  canImbue, getImbueCost, imbue,
  canTemper, getTemperCost, temper, temperReset, isBricked
} from './item-crafting.js';

// ============================================================
// AFFIX → STAT MAPPING (30 non-skill-level affixes)
// ============================================================

const AFFIX_STAT_MAP = {
  flat_attack: 'attack',
  flat_magic_power: 'magicPower',
  crit_chance: 'critChance',
  crit_damage: 'critDamage',
  armor_pen: 'armorPen',
  magic_pen: 'magicPen',
  flat_armor: 'armor',
  flat_magic_resist: 'magicResist',
  flat_max_hp: 'maxHP',
  flat_max_shield: 'maxShield',
  hp_regen: 'hpRegen',
  gold_find: 'goldFind',
  xp_bonus: 'xpBonus',
  energy_gain: 'energyGain',
  skill_cooldown: 'skillCooldown',
  bleed_chance: 'bleedChance',
  poison_chance: 'poisonChance',
  burn_chance: 'burnChance',
  slow_chance: 'slowChance',
  freeze_chance: 'freezeChance',
  bleed_potency: 'bleedPotency',
  poison_potency: 'poisonPotency',
  burn_potency: 'burnPotency',
  slow_strength: 'slowStrength',
  freeze_duration: 'freezeDuration',
  skill_speed_boost: 'skillSpeedBoost',
  skill_power_boost: 'skillPowerBoost',
  skill_crit_boost: 'skillCritBoost',
  skill_mage_boost: 'skillMageBoost',
  skill_utility_boost: 'skillUtilityBoost'
};

// ============================================================
// DI DEPENDENCIES
// ============================================================

let deps = {};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize the item system.
 * @param {Object} injected - { getComputedStats, invalidateStatCache, deductGold, addGold }
 */
export function init(injected) {
  deps = injected;

  // Initialize legendary effects sub-module
  state.activeLegendaryEffects = new Set();
  initLegendaryEffects({ getComputedStats: deps.getComputedStats });

  // Intent events from UI / other systems
  on('item:requestEquip', ({ itemId }) => equipItem(itemId));
  on('item:requestUnequip', ({ slot }) => unequipItem(slot));
  on('item:requestScrap', ({ itemId }) => scrapItem(itemId));
  on('item:requestBulkScrap', ({ rarity }) => bulkScrap(rarity));
  on('item:requestAdd', ({ item }) => addItem(item));
  on('materials:dropped', ({ materialId, amount }) => addMaterial(materialId, amount));

  // Crafting intent events
  on('item:requestReforge', ({ itemId, affixIndex }) => {
    const found = findItemAnywhere(itemId);
    if (!found) return emit('item:craftFailed', { operation: 'reforge', reason: 'not_found' });

    const { item } = found;
    if (!canReforge(item)) return emit('item:craftFailed', { operation: 'reforge', reason: 'ineligible', item });

    const validIndices = getReforgeableAffixes(item);
    if (!validIndices.includes(affixIndex)) return emit('item:craftFailed', { operation: 'reforge', reason: 'invalid_affix', item });

    const cost = getReforgeCost(item);
    if (!deps.deductGold(cost)) return emit('item:craftFailed', { operation: 'reforge', reason: 'gold', cost, item });

    const result = reforge(item, affixIndex);
    if (!result) return emit('item:craftFailed', { operation: 'reforge', reason: 'roll_failed', item });
    if (found.equipped) recomputeEquipmentStats();
    emit('item:reforged', { item, affixIndex, oldAffix: result.oldAffix, newAffix: result.newAffix, cost });
    saveGame();
  });

  on('item:requestImbue', ({ itemId }) => {
    const found = findItemAnywhere(itemId);
    if (!found) return emit('item:craftFailed', { operation: 'imbue', reason: 'not_found' });

    const { item } = found;
    if (!canImbue(item)) return emit('item:craftFailed', { operation: 'imbue', reason: 'ineligible', item });

    const cost = getImbueCost(item);
    if (!deps.deductGold(cost)) return emit('item:craftFailed', { operation: 'imbue', reason: 'gold', cost, item });

    const result = imbue(item);
    if (!result) return emit('item:craftFailed', { operation: 'imbue', reason: 'roll_failed', item });

    if (found.equipped) recomputeEquipmentStats();
    emit('item:imbued', { item, newAffix: result.affix, cost });
    saveGame();
  });

  on('item:requestTemper', ({ itemId }) => {
    const found = findItemAnywhere(itemId);
    if (!found) return emit('item:craftFailed', { operation: 'temper', reason: 'not_found' });

    const { item } = found;
    if (!canTemper(item)) return emit('item:craftFailed', { operation: 'temper', reason: 'ineligible', item });

    const cost = getTemperCost(item);
    if (!deps.deductGold(cost)) return emit('item:craftFailed', { operation: 'temper', reason: 'gold', cost, item });

    const result = temper(item);
    if (found.equipped) recomputeEquipmentStats();
    emit('item:tempered', { item, result, cost });
    saveGame();
  });

  on('item:requestTemperReset', ({ itemId }) => {
    const found = findItemAnywhere(itemId);
    if (!found) return emit('item:craftFailed', { operation: 'temperReset', reason: 'not_found' });

    const { item } = found;
    if (item.temperLevel <= 0) return emit('item:craftFailed', { operation: 'temperReset', reason: 'no_temper', item });
    if (isBricked(item)) return emit('item:craftFailed', { operation: 'temperReset', reason: 'bricked', item });

    const success = temperReset(item);
    if (!success) return emit('item:craftFailed', { operation: 'temperReset', reason: 'failed', item });

    if (found.equipped) recomputeEquipmentStats();
    emit('item:temperReset', { item, bricked: isBricked(item) });
    saveGame();
  });

  // Compute initial equipment stats from loaded save
  recomputeEquipmentStats();

  // Re-subscribe legendary effects for equipped items (game load)
  resubscribeAllLegendaries();
}

/**
 * Tick update — runs legendary tick-based effects.
 */
export function update(dt) {
  updateLegendaryTicks(dt);
}

// ============================================================
// INVENTORY MANAGEMENT
// ============================================================

/**
 * Add an item to the player's inventory (or overflow, or auto-scrap).
 * @param {Object} item - Full item object
 * @returns {{ destination: string }} 'inventory' | 'overflow' | 'auto-scrapped'
 */
export function addItem(item) {
  const player = getPlayer();

  // Try main inventory
  if (player.inventory.length < INVENTORY_MAX) {
    player.inventory.push(item);
    emit('item:added', { item, destination: 'inventory' });
    return { destination: 'inventory' };
  }

  // Try overflow
  if (player.inventoryOverflow.length < INVENTORY_OVERFLOW_MAX) {
    player.inventoryOverflow.push(item);
    emit('item:added', { item, destination: 'overflow' });
    return { destination: 'overflow' };
  }

  // Auto-scrap: sell for gold
  const goldValue = item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO_V2);
  deps.addGold(goldValue);
  emit('item:autoScrapped', { item, goldValue });
  return { destination: 'auto-scrapped' };
}

/**
 * Scrap (sell) an item from inventory or overflow.
 * @param {string} itemId - Item's unique ID
 * @returns {number|false} Gold value earned, or false if not found
 */
export function scrapItem(itemId) {
  const found = findItemById(itemId);
  if (!found) return false;

  const { item, source, index } = found;
  const goldValue = item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO_V2);

  removeItemFromSource(source, index);
  deps.addGold(goldValue);
  promoteOverflow();

  emit('item:scrapped', { item, goldValue });
  saveGame();
  return goldValue;
}

/**
 * Bulk-scrap all items of a given rarity from inventory + overflow.
 * @param {string} rarity - Rarity to scrap
 * @returns {{ count: number, totalGold: number } | false}
 */
export function bulkScrap(rarity) {
  const player = getPlayer();
  let count = 0;
  let totalGold = 0;

  // Scan from end so splice indices stay valid
  for (let i = player.inventoryOverflow.length - 1; i >= 0; i--) {
    if (player.inventoryOverflow[i].rarity === rarity) {
      const item = player.inventoryOverflow[i];
      totalGold += item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO_V2);
      player.inventoryOverflow.splice(i, 1);
      count++;
    }
  }
  for (let i = player.inventory.length - 1; i >= 0; i--) {
    if (player.inventory[i].rarity === rarity) {
      const item = player.inventory[i];
      totalGold += item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO_V2);
      player.inventory.splice(i, 1);
      count++;
    }
  }

  if (count === 0) return false;

  deps.addGold(totalGold);
  promoteOverflow();
  emit('item:bulkScrapped', { count, totalGold, rarity });
  saveGame();
  return { count, totalGold };
}

// ============================================================
// EQUIPMENT
// ============================================================

/**
 * Equip an item from inventory/overflow into its equipment slot.
 * If the slot is occupied, the previous item returns to inventory.
 * @param {string} itemId - Item's unique ID
 * @returns {boolean} Success
 */
export function equipItem(itemId) {
  const player = getPlayer();
  const found = findItemById(itemId);
  if (!found) return false;

  const { item, source, index } = found;
  const slot = item.slot;

  // Level check
  if (player.level < item.requiredLevel) {
    emit('item:equipFailed', { item, reason: 'level', requiredLevel: item.requiredLevel });
    return false;
  }

  // Remove from current location
  removeItemFromSource(source, index);

  // Unequip current item in that slot (move to inventory)
  const previousItem = player.equipment[slot];
  if (previousItem) {
    player.inventory.push(previousItem);
    emit('item:unequipped', { item: previousItem, slot });
  }

  // Unequip legendary effect from previous item
  if (previousItem && previousItem.uniqueEffect) {
    const prevEffectId = previousItem.uniqueEffect.id;
    const prevHandler = LEGENDARY_EFFECT_HANDLERS[prevEffectId];
    if (prevHandler?.onUnequip) prevHandler.onUnequip(previousItem);
  }

  // Equip new item
  player.equipment[slot] = item;

  recomputeEquipmentStats();

  // Equip legendary effect on new item
  if (item.uniqueEffect) {
    const effectId = item.uniqueEffect.id;
    const handler = LEGENDARY_EFFECT_HANDLERS[effectId];
    if (handler?.onEquip) handler.onEquip(item);
  }

  promoteOverflow();
  emit('item:equipped', { item, slot, previousItem });
  saveGame();
  return true;
}

/**
 * Unequip an item from an equipment slot.
 * @param {string} slot - Equipment slot name
 * @returns {boolean} Success
 */
export function unequipItem(slot) {
  const player = getPlayer();
  const item = player.equipment[slot];
  if (!item) return false;

  // Check inventory space
  if (player.inventory.length >= INVENTORY_MAX) {
    emit('item:unequipFailed', { item, slot, reason: 'inventory_full' });
    return false;
  }

  // Unequip legendary effect
  if (item.uniqueEffect) {
    const effectId = item.uniqueEffect.id;
    const handler = LEGENDARY_EFFECT_HANDLERS[effectId];
    if (handler?.onUnequip) handler.onUnequip(item);
  }

  player.equipment[slot] = null;
  player.inventory.push(item);

  recomputeEquipmentStats();
  emit('item:unequipped', { item, slot });
  saveGame();
  return true;
}

// ============================================================
// STAT AGGREGATION
// ============================================================

/**
 * Create an empty equipment stats object with all keys zeroed.
 * @returns {Object}
 */
function createEmptyEquipmentStats() {
  return {
    attack: 0, magicPower: 0, critChance: 0, critDamage: 0,
    armorPen: 0, magicPen: 0, armor: 0, magicResist: 0,
    maxHP: 0, maxShield: 0, hpRegen: 0,
    goldFind: 0, xpBonus: 0, energyGain: 0, skillCooldown: 0,
    bleedChance: 0, poisonChance: 0, burnChance: 0,
    slowChance: 0, freezeChance: 0,
    bleedPotency: 0, poisonPotency: 0, burnPotency: 0,
    slowStrength: 0, freezeDuration: 0,
    skillSpeedBoost: 0, skillPowerBoost: 0, skillCritBoost: 0,
    skillMageBoost: 0, skillUtilityBoost: 0
  };
}

/**
 * Recompute aggregated equipment stats from all 6 equipment slots.
 * Stores result on state.equipmentStats and invalidates the stat cache.
 */
function recomputeEquipmentStats() {
  const player = getPlayer();
  const stats = createEmptyEquipmentStats();

  // Rebuild active legendary effects Set
  const activeEffects = new Set();

  for (const slot of EQUIPMENT_SLOTS_V2) {
    const item = player.equipment[slot];
    if (!item) continue;

    // Track legendary effects
    if (item.uniqueEffect && item.uniqueEffect.id) {
      activeEffects.add(item.uniqueEffect.id);
    }

    if (!item.affixes) continue;
    for (const affix of item.affixes) {
      const statKey = AFFIX_STAT_MAP[affix.id];
      if (statKey) {
        stats[statKey] += affix.value;
      }
    }
  }

  state.equipmentStats = stats;
  state.activeLegendaryEffects = activeEffects;
  if (deps.invalidateStatCache) deps.invalidateStatCache();
}

/**
 * Get current aggregated equipment stats.
 * @returns {Object} Equipment stats
 */
export function getEquipmentStatsV2() {
  return state.equipmentStats || createEmptyEquipmentStats();
}

/**
 * Get the total skill level bonus from equipment for a specific skill.
 * Checks individual skill affixes, category level affixes, and all-skills affixes.
 * @param {string} skillId - The skill to check
 * @returns {number} Total bonus levels from equipment
 */
export function getItemSkillLevelBonus(skillId) {
  const player = getPlayer();
  const skillDef = SKILLS[skillId];
  if (!skillDef) return 0;

  let totalBonus = 0;

  for (const slot of EQUIPMENT_SLOTS_V2) {
    const item = player.equipment[slot];
    if (!item || !item.affixes) continue;

    for (const affix of item.affixes) {
      // Skip non-skill-level affixes
      if (!SKILL_LEVEL_AFFIX_IDS.has(affix.id)) continue;

      const affixDef = AFFIXES[affix.id];
      if (!affixDef) continue;

      // Individual skill match
      if (affixDef.skill === skillId) {
        totalBonus += affix.value;
        continue;
      }

      // Category match
      if (affixDef.skillCategory && affixDef.skillCategory === skillDef.category) {
        totalBonus += affix.value;
        continue;
      }

      // All-skills match
      if (affixDef.isAllSkills) {
        totalBonus += affix.value;
      }
    }
  }

  return totalBonus;
}

/**
 * Get the damage type of the equipped weapon based on its base name.
 * @returns {'physical'|'magic'}
 */
export function getWeaponDamageType() {
  const player = getPlayer();
  const weapon = player.equipment.weapon;
  if (!weapon || !weapon.name) return 'physical';

  // Split name into words and check each against the damage type map
  const words = weapon.name.split(' ');
  for (const word of words) {
    if (WEAPON_DAMAGE_TYPES[word]) {
      return WEAPON_DAMAGE_TYPES[word];
    }
  }

  return 'physical';
}

/**
 * Get status effect proc chances from equipment.
 * @returns {{ bleed: number, poison: number, burn: number, slow: number, freeze: number }}
 */
export function getStatusProcChances() {
  const stats = state.equipmentStats || {};
  return {
    bleed: stats.bleedChance || 0,
    poison: stats.poisonChance || 0,
    burn: stats.burnChance || 0,
    slow: stats.slowChance || 0,
    freeze: stats.freezeChance || 0
  };
}

/**
 * Get status effect potency multipliers from equipment.
 * DoT potency (bleed/poison/burn) = 1 + bonus (e.g. 0.15 → 1.15x damage).
 * Slow strength bonus = raw percentage added to base slow strength.
 * Freeze duration bonus = 1 + bonus (e.g. 0.10 → 1.10x duration).
 * @returns {{ bleed: number, poison: number, burn: number, slow: number, freeze: number }}
 */
export function getStatusPotency() {
  const stats = state.equipmentStats || {};
  return {
    bleed: stats.bleedPotency || 0,
    poison: stats.poisonPotency || 0,
    burn: stats.burnPotency || 0,
    slow: stats.slowStrength || 0,
    freeze: stats.freezeDuration || 0
  };
}

// ============================================================
// MATERIALS
// ============================================================

/**
 * Add materials to the player's material store.
 * @param {string} materialId
 * @param {number} amount
 */
export function addMaterial(materialId, amount) {
  const player = getPlayer();
  if (!player.materials[materialId]) {
    player.materials[materialId] = 0;
  }
  player.materials[materialId] += amount;
  emit('materials:added', { materialId, amount, total: player.materials[materialId] });
}

/**
 * Check if the player can afford the boss material cost for a zone.
 * @param {string} zoneId
 * @returns {boolean}
 */
export function canAffordBoss(zoneId) {
  const matInfo = ZONE_MATERIALS[zoneId];
  if (!matInfo) return true; // No material cost for this zone

  const player = getPlayer();
  const current = player.materials[matInfo.id] || 0;
  return current >= matInfo.bossCost;
}

/**
 * Spend boss materials for a zone challenge.
 * @param {string} zoneId
 * @returns {boolean} Success
 */
export function spendBossMaterials(zoneId) {
  const matInfo = ZONE_MATERIALS[zoneId];
  if (!matInfo) return true;

  const player = getPlayer();
  const current = player.materials[matInfo.id] || 0;

  if (current < matInfo.bossCost) {
    emit('materials:insufficient', {
      materialId: matInfo.id,
      required: matInfo.bossCost,
      current
    });
    return false;
  }

  player.materials[matInfo.id] -= matInfo.bossCost;
  emit('materials:spent', {
    materialId: matInfo.id,
    amount: matInfo.bossCost,
    remaining: player.materials[matInfo.id]
  });
  return true;
}

// ============================================================
// INTERNAL HELPERS
// ============================================================

/**
 * Find an item anywhere: inventory, overflow, or equipment.
 * Used by crafting handlers that need to operate on equipped items too.
 * @param {string} itemId
 * @returns {{ item: Object, slot?: string, source?: Array, index?: number, equipped: boolean }|null}
 */
function findItemAnywhere(itemId) {
  const found = findItemById(itemId);
  if (found) return { ...found, equipped: false };

  const player = getPlayer();
  for (const slot of EQUIPMENT_SLOTS_V2) {
    const item = player.equipment[slot];
    if (item && item.id === itemId) {
      return { item, slot, equipped: true };
    }
  }
  return null;
}

/**
 * Find an item by its unique ID across inventory and overflow (not equipment).
 * @param {string} itemId
 * @returns {{ item: Object, source: Array, index: number }|null}
 */
function findItemById(itemId) {
  const player = getPlayer();

  // Search inventory
  for (let i = 0; i < player.inventory.length; i++) {
    if (player.inventory[i].id === itemId) {
      return { item: player.inventory[i], source: player.inventory, index: i };
    }
  }

  // Search overflow
  for (let i = 0; i < player.inventoryOverflow.length; i++) {
    if (player.inventoryOverflow[i].id === itemId) {
      return { item: player.inventoryOverflow[i], source: player.inventoryOverflow, index: i };
    }
  }

  return null;
}

/**
 * Remove an item from a source array by index.
 * @param {Array} source
 * @param {number} index
 */
function removeItemFromSource(source, index) {
  source.splice(index, 1);
}

/**
 * Move items from overflow into inventory until inventory is full or overflow is empty.
 */
function promoteOverflow() {
  const player = getPlayer();
  while (player.inventoryOverflow.length > 0 && player.inventory.length < INVENTORY_MAX) {
    const item = player.inventoryOverflow.shift();
    player.inventory.push(item);
    emit('item:promoted', { item });
  }
}

/**
 * Check if an item is currently equipped.
 * @param {string} itemId
 * @returns {boolean}
 */
export function isEquipped(itemId) {
  const player = getPlayer();
  for (const slot of EQUIPMENT_SLOTS_V2) {
    const item = player.equipment[slot];
    if (item && item.id === itemId) return true;
  }
  return false;
}

// ============================================================
// CRAFTING QUERY RE-EXPORTS (so UI imports from items.js only)
// ============================================================

export {
  canReforge, getReforgeableAffixes, getReforgeCost,
  canImbue, getImbueCost,
  canTemper, getTemperCost, isBricked
};

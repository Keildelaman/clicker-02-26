/**
 * balance.js - Centralized Scaling Formulas
 *
 * Pure functions for XP curves, HP scaling, and damage scaling.
 * No side effects — used by systems that need stat calculations.
 *
 * @see docs/balance/curves.balance.md
 * @see docs/_INDEX.md
 */

import {
  BASE_XP_REQUIREMENT, XP_GROWTH_RATE,
  BASE_PLAYER_HP, HP_PER_LEVEL,
  BASE_PLAYER_ATTACK,
  DEFENSE_SCALING_FACTOR,
  BASE_ARMOR_PER_LEVEL, BASE_MAGIC_RESIST_PER_LEVEL,
  FLAT_TIER_MULTIPLIERS, PERCENT_TIER_MULTIPLIERS,
  SHOP_BUY_ZONE_BASE, SHOP_BUY_RARITY_MULT, SELL_PRICE_RATIO_V2,
  REFORGE_ZONE_BASE, REFORGE_RARITY_MULT, REFORGE_ESCALATION,
  IMBUE_ZONE_BASE, IMBUE_RARITY_MULT,
  TEMPER_LEVEL_BASE, TEMPER_ZONE_MULT, TEMPER_RARITY_MULT,
  MATERIAL_DECAY_FACTOR,
  BOSS_HP_SCALING_FACTOR, BOSS_DAMAGE_SCALING_FACTOR,
  BOSS_LEVEL_BUFFER, BOSS_AFFIX_TIER_DIVISOR,
  BEYOND_MAX_SKILL_BONUS_PER_LEVEL
} from './constants.js';

/**
 * Phase 9 Zone HP Targets — reference data for the balance overhaul.
 *
 * Calculated via the "clicks budget" approach:
 *   expectedAttack = baseAttack(zoneLevelMin) + bestWeaponFromPreviousZone
 *   baseHP = expectedAttack * 15   (target 15 clicks at zone entry with boss weapon)
 *   maxHP  = baseHP * 2.5          (strongest regular monster in zone)
 *
 * Gold/XP averages are per-kill targets (3x old values to maintain gold-per-minute
 * parity with the ~3x increase in clicks-to-kill).
 */
export const ZONE_HP_TARGETS = {
  whisperwood: { baseHP: 75,    maxHP: 190,    avgGold: 15,   avgXP: 35 },
  dustwind:    { baseHP: 630,   maxHP: 1575,   avgGold: 40,   avgXP: 100 },
  shadowmire:  { baseHP: 1485,  maxHP: 3715,   avgGold: 100,  avgXP: 220 },
  ironhold:    { baseHP: 3135,  maxHP: 7840,   avgGold: 250,  avgXP: 440 },
  emberfell:   { baseHP: 6735,  maxHP: 16840,  avgGold: 580,  avgXP: 820 },
  frostpeak:   { baseHP: 14460, maxHP: 36150,  avgGold: 1280, avgXP: 1660 },
  voidrift:    { baseHP: 31185, maxHP: 77960,  avgGold: 3050, avgXP: 3400 }
};

/**
 * XP required to reach the next level.
 * Formula: floor(100 * 1.12^(level-1))
 * @param {number} level - Current player level
 * @returns {number} XP needed for next level
 */
export function xpToNextLevel(level) {
  return Math.floor(BASE_XP_REQUIREMENT * Math.pow(1 + XP_GROWTH_RATE, level - 1));
}

/**
 * Maximum HP at a given level (before equipment/buffs).
 * Formula: 100 + (level - 1) * 10
 * @param {number} level - Player level
 * @returns {number} Base max HP
 */
export function maxHPAtLevel(level) {
  return BASE_PLAYER_HP + HP_PER_LEVEL * (level - 1);
}

/**
 * Base attack at a given level (before equipment/buffs).
 * Formula: 5 + (level - 1)
 * @param {number} level - Player level
 * @returns {number} Base attack power
 */
export function baseAttackAtLevel(level) {
  return BASE_PLAYER_ATTACK + (level - 1);
}

/**
 * Calculate damage reduction from defense (armor or magic resist).
 * Formula: reduction = defense / (defense + 100)
 * With penetration: effective_defense = defense * (1 - penPercent)
 *
 * @param {number} defense - Target's armor or magic resist
 * @param {number} [penPercent=0] - Attacker's penetration (0-1 range, e.g. 0.3 = 30%)
 * @returns {number} Damage reduction as a fraction (0-1 range, e.g. 0.33 = 33% reduction)
 */
export function calcDamageReduction(defense, penPercent = 0) {
  const effectiveDefense = Math.max(defense * (1 - penPercent), 0);
  return effectiveDefense / (effectiveDefense + DEFENSE_SCALING_FACTOR);
}

/**
 * Base armor at a given level (before equipment/buffs).
 * Formula: (level - 1) * 1 — starts at 0, grows linearly.
 * @param {number} level - Player level
 * @returns {number} Base armor
 */
export function baseArmorAtLevel(level) {
  return BASE_ARMOR_PER_LEVEL * (level - 1);
}

/**
 * Base magic resist at a given level (before equipment/buffs).
 * Formula: (level - 1) * 1 — starts at 0, grows linearly.
 * @param {number} level - Player level
 * @returns {number} Base magic resist
 */
export function baseMagicResistAtLevel(level) {
  return BASE_MAGIC_RESIST_PER_LEVEL * (level - 1);
}

/**
 * Check if a target is immune to a status effect.
 *
 * Immunity sources (checked in order):
 * 1. Shield active (shield > 0) — immune to ALL status effects
 * 2. Monster statusImmunities array — immune to specific effects
 *
 * @param {{ shield?: number, statusImmunities?: string[] }} target - Monster or player-like object
 * @param {string} effectId - Status effect id (e.g. 'bleed', 'poison', 'burn', 'slow', 'freeze')
 * @returns {{ immune: boolean, reason: string|null }}
 */
export function checkStatusImmunity(target, effectId) {
  if (target.shield > 0) {
    return { immune: true, reason: 'shielded' };
  }
  if (target.statusImmunities && target.statusImmunities.includes(effectId)) {
    return { immune: true, reason: 'innate' };
  }
  return { immune: false, reason: null };
}

// === ITEM SYSTEM V2 FORMULAS ===
// @see docs/design/item-system-v2.md

/**
 * Calculate the min/max affix value range at a given tier.
 * Flat stats are floored to integers. Percentage stats keep decimal precision.
 *
 * @param {number} t1Min - Base minimum value at tier 1
 * @param {number} t1Max - Base maximum value at tier 1
 * @param {number} tier - Zone tier (1-7)
 * @param {'flat'|'percentage'} scaleType - Determines which multiplier array and rounding
 * @returns {{ min: number, max: number }}
 */
export function affixValueAtTier(t1Min, t1Max, tier, scaleType) {
  const multipliers = scaleType === 'flat' ? FLAT_TIER_MULTIPLIERS : PERCENT_TIER_MULTIPLIERS;
  const mult = multipliers[tier - 1];
  if (scaleType === 'flat') {
    return {
      min: Math.floor(t1Min * mult),
      max: Math.floor(t1Max * mult)
    };
  }
  // Percentage: keep decimal precision (round to 4 decimal places for cleanliness)
  return {
    min: Math.round(t1Min * mult * 10000) / 10000,
    max: Math.round(t1Max * mult * 10000) / 10000
  };
}

/**
 * Roll a random affix value within the tier-scaled range.
 * Flat values: random integer in [min, max].
 * Percentage values: random float rounded to 4 decimal places.
 *
 * @param {number} t1Min - Base minimum value at tier 1
 * @param {number} t1Max - Base maximum value at tier 1
 * @param {number} tier - Zone tier (1-7)
 * @param {'flat'|'percentage'} scaleType
 * @returns {number}
 */
export function rollAffixValue(t1Min, t1Max, tier, scaleType) {
  const range = affixValueAtTier(t1Min, t1Max, tier, scaleType);
  if (scaleType === 'flat') {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }
  // Percentage: uniform float in [min, max], rounded to 4 decimals
  const raw = range.min + Math.random() * (range.max - range.min);
  return Math.round(raw * 10000) / 10000;
}

/**
 * Calculate item buy price.
 * @param {string} zone - Zone ID
 * @param {string} rarity - Rarity ID
 * @param {number} affixQuality - Quality multiplier (0.7-1.3)
 * @returns {number}
 */
export function itemBuyPrice(zone, rarity, affixQuality) {
  return Math.floor(
    (SHOP_BUY_ZONE_BASE[zone] || 100) *
    (SHOP_BUY_RARITY_MULT[rarity] || 1.0) *
    affixQuality
  );
}

/**
 * Calculate item sell price.
 * @param {number} buyPrice
 * @returns {number}
 */
export function itemSellPrice(buyPrice) {
  return Math.floor(buyPrice * SELL_PRICE_RATIO_V2);
}

/**
 * Calculate reforge cost with escalation.
 * @param {string} zone - Zone ID
 * @param {string} rarity - Rarity ID
 * @param {number} reforgeCount - Number of times already reforged
 * @returns {number}
 */
export function reforgeCost(zone, rarity, reforgeCount) {
  return Math.floor(
    (REFORGE_ZONE_BASE[zone] || 200) *
    (REFORGE_RARITY_MULT[rarity] || 1.0) *
    Math.pow(REFORGE_ESCALATION, reforgeCount)
  );
}

/**
 * Calculate imbue cost.
 * @param {string} zone - Zone ID
 * @param {string} rarity - Rarity ID
 * @returns {number}
 */
export function imbueCost(zone, rarity) {
  return Math.floor(
    (IMBUE_ZONE_BASE[zone] || 500) *
    (IMBUE_RARITY_MULT[rarity] || 1.0)
  );
}

/**
 * Calculate temper cost for a given level.
 * @param {number} temperLevel - Current temper level (0-11, cost for advancing to next)
 * @param {string} zone - Zone ID
 * @param {string} rarity - Rarity ID
 * @returns {number}
 */
export function temperCost(temperLevel, zone, rarity) {
  return Math.floor(
    (TEMPER_LEVEL_BASE[temperLevel] || 1000) *
    (TEMPER_ZONE_MULT[zone] || 1.0) *
    (TEMPER_RARITY_MULT[rarity] || 1.0)
  );
}

/**
 * Calculate effective material drop rate with zone decay.
 * @param {number} baseRate - Base drop rate for the zone's material
 * @param {number} zonesAbove - Number of zones above this one that are unlocked
 * @returns {number}
 */
export function materialDropRate(baseRate, zonesAbove) {
  return baseRate * Math.pow(MATERIAL_DECAY_FACTOR, zonesAbove);
}

/**
 * Calculate boss effective level (scales with player level).
 * @param {number} baseLevel - Boss's base level from zone definition
 * @param {number} playerLevel - Current player level
 * @returns {number}
 */
export function bossEffectiveLevel(baseLevel, playerLevel) {
  return Math.max(baseLevel, playerLevel - BOSS_LEVEL_BUFFER);
}

/**
 * Calculate boss scaled HP.
 * @param {number} baseHP - Boss's base HP from monster definition
 * @param {number} effectiveLevel - Boss effective level from bossEffectiveLevel()
 * @returns {number}
 */
export function bossScaledHP(baseHP, effectiveLevel) {
  return Math.floor(baseHP * (1 + BOSS_HP_SCALING_FACTOR * effectiveLevel));
}

/**
 * Calculate boss scaled damage.
 * @param {number} baseDamage - Boss's base damage from monster definition
 * @param {number} effectiveLevel - Boss effective level from bossEffectiveLevel()
 * @returns {number}
 */
export function bossScaledDamage(baseDamage, effectiveLevel) {
  return Math.floor(baseDamage * (1 + BOSS_DAMAGE_SCALING_FACTOR * effectiveLevel));
}

/**
 * Calculate boss affix tier for legendary drop scaling.
 * Maps boss effective level to a zone tier (1-7).
 * @param {number} effectiveLevel
 * @returns {number} Tier 1-7
 */
export function bossAffixTier(effectiveLevel) {
  const tier = Math.ceil(effectiveLevel / BOSS_AFFIX_TIER_DIVISOR);
  return Math.max(1, Math.min(7, tier));
}

/**
 * Get skill level roll weights for a given zone tier.
 * Skill level affixes use zone-based tables instead of tier multipliers.
 * Inlined here to avoid adding a dependency on affixes.data.js.
 *
 * @param {number} zoneTier - Zone tier (1-7)
 * @returns {{ weights: Object.<number, number> }} Weight map: level -> probability
 */
export function skillLevelRangeForZone(zoneTier) {
  switch (zoneTier) {
    case 1: case 2:
      return { weights: { 1: 1.0 } };
    case 3: case 4:
      return { weights: { 1: 0.80, 2: 0.20 } };
    case 5: case 6:
      return { weights: { 1: 0.60, 2: 0.40 } };
    case 7:
      return { weights: { 1: 0.50, 2: 0.35, 3: 0.15 } };
    default:
      return { weights: { 1: 1.0 } };
  }
}

/**
 * Calculate the beyond-max skill level multiplier.
 * Each level beyond max adds +20% (additive) to all numerical skill stats.
 *
 * @param {number} effectiveLevel - Total skill level including item bonuses
 * @param {number} maxLevel - Skill's max upgrade level (typically 5)
 * @returns {number} Multiplier (1.0 if at or below max, 1.2 at max+1, 1.4 at max+2, etc.)
 */
export function beyondMaxSkillMultiplier(effectiveLevel, maxLevel) {
  return 1 + BEYOND_MAX_SKILL_BONUS_PER_LEVEL * Math.max(0, effectiveLevel - maxLevel);
}

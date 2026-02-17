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
  BASE_ARMOR_PER_LEVEL, BASE_MAGIC_RESIST_PER_LEVEL
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

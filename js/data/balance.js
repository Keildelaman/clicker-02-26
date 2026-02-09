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
  BASE_PLAYER_ATTACK
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

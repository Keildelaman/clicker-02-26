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

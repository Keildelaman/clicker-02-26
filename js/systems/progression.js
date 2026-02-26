/**
 * progression.js - XP & Leveling System
 *
 * Owns: XP granting, level-up detection, overflow, milestones.
 * Listens to: combat:monsterKilled
 * Emits: xp:gained, player:levelUp
 *
 * @see docs/systems/progression.system.md
 * @see docs/balance/curves.balance.md
 */

import { on, emit } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { xpToNextLevel } from '../data/balance.js';
import { MAX_PLAYER_LEVEL } from '../data/constants.js';
import { saveGame } from '../services/storage.js';

let computeStats = null;    // Injected: player.getComputedStats
let invalidateStats = null;  // Injected: player.invalidateStatCache

const MILESTONES = {
  25: 'Quarter Century! You are a seasoned warrior.',
  50: 'Halfway There! The legends speak of your deeds.',
  75: 'Master Tier! Few have reached this height.',
  100: 'MAX LEVEL! You have conquered Clickoria!'
};

/**
 * Grant XP and handle level-ups with overflow.
 * Exported for DEBUG use — normal flow goes through combat:monsterKilled event.
 */
export function grantXP(xpReward) {
  const p = getPlayer();

  if (p.level >= MAX_PLAYER_LEVEL) return;

  p.xp += xpReward;
  p.totalXpEarned += xpReward;
  emit('xp:gained', { amount: xpReward, total: p.xp });

  while (p.xp >= p.xpToNextLevel && p.level < MAX_PLAYER_LEVEL) {
    levelUp();
  }
}

/**
 * Process a single level-up. Handles overflow XP.
 */
function levelUp() {
  const p = getPlayer();

  p.xp -= p.xpToNextLevel;
  p.level++;

  // Recalculate XP threshold for next level
  p.xpToNextLevel = xpToNextLevel(p.level);

  // Invalidate stat cache so computed stats reflect new level
  invalidateStats();

  // Update max HP (includes equipment bonuses) and full heal
  const stats = computeStats();
  p.maxHP = stats.maxHP;
  p.hp = p.maxHP;

  emit('player:levelUp', { newLevel: p.level });

  // Check milestones
  checkMilestones(p.level);

  // Auto-save on level up
  saveGame();
}

/**
 * Emit a milestone event at special levels (UI layer handles display).
 */
function checkMilestones(level) {
  const message = MILESTONES[level];
  if (message) {
    emit('progression:milestone', { level, message });
  }
}

// --- System Contract ---

/**
 * @param {Object} deps - Injected dependencies
 * @param {Function} deps.getComputedStats - Returns player computed stats
 * @param {Function} deps.invalidateStatCache - Invalidates the stat cache
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
  invalidateStats = deps.invalidateStatCache;

  // Recalculate XP threshold for current level (handles formula changes across saves)
  const p = getPlayer();
  if (p.level < MAX_PLAYER_LEVEL) {
    p.xpToNextLevel = xpToNextLevel(p.level);
    while (p.xp >= p.xpToNextLevel && p.level < MAX_PLAYER_LEVEL) {
      levelUp();
    }
  }

  on('combat:monsterKilled', ({ xpReward }) => {
    // Apply xpBonus from equipment + passive skills + buffs
    const stats = computeStats();
    const finalXP = Math.floor(xpReward * (1 + (stats.xpBonus || 0)));
    grantXP(finalXP);
  });
}

export function update(dt) {
  // No tick-based logic for now
}

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
import { xpToNextLevel, maxHPAtLevel } from '../data/balance.js';
import { MAX_PLAYER_LEVEL } from '../data/constants.js';
import { saveGame } from '../services/storage.js';
import { showToast } from '../ui/toasts.js';

const MILESTONES = {
  25: 'Quarter Century! You are a seasoned warrior.',
  50: 'Halfway There! The legends speak of your deeds.',
  75: 'Master Tier! Few have reached this height.',
  100: 'MAX LEVEL! You have conquered Clickoria!'
};

/**
 * Grant XP and handle level-ups with overflow.
 */
function grantXP(xpReward) {
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

  // Update max HP and full heal
  p.maxHP = maxHPAtLevel(p.level);
  p.hp = p.maxHP;

  emit('player:levelUp', { newLevel: p.level });

  // Check milestones
  checkMilestones(p.level);

  // Auto-save on level up
  saveGame();
}

/**
 * Show a special toast at milestone levels.
 */
function checkMilestones(level) {
  const message = MILESTONES[level];
  if (message) {
    showToast(message, 'warning', 4000);
  }
}

// --- System Contract ---

export function init() {
  on('combat:monsterKilled', ({ xpReward }) => {
    grantXP(xpReward);
  });
}

export function update(dt) {
  // No tick-based logic for now
}

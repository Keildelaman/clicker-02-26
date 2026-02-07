/**
 * health.js - Health System
 *
 * Owns: HP regen, HP change events, player damage, death handling.
 * Listens to: player:levelUp (full heal + maxHP update), item equip/unequip
 * Emits: player:hpChanged, player:damaged, player:died
 *
 * @see docs/systems/health.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { getComputedStats } from './player.js';
import {
  DEATH_GOLD_LOSS, DEATH_LEVEL_MILESTONE, DEATH_RESPAWN_DELAY
} from '../data/constants.js';
import { xpToNextLevel } from '../data/balance.js';

let respawnTimer = 0;
let isRespawning = false;

export function init() {
  on('player:levelUp', onLevelUp);
  on('item:equipped', syncMaxHP);
  on('item:unequipped', syncMaxHP);
}

function onLevelUp() {
  syncMaxHP();
  const player = getPlayer();
  player.hp = player.maxHP;
  emitHPChanged();
}

/**
 * Sync player.maxHP from computed stats (includes equipment bonuses).
 */
function syncMaxHP() {
  const player = getPlayer();
  const stats = getComputedStats();
  const oldMaxHP = player.maxHP;
  player.maxHP = stats.maxHP;

  // If maxHP increased, heal by the difference
  if (player.maxHP > oldMaxHP) {
    player.hp += (player.maxHP - oldMaxHP);
  }
  // If maxHP decreased, clamp HP
  player.hp = Math.min(player.hp, player.maxHP);

  emitHPChanged();
}

/**
 * Deal damage to the player.
 * @param {number} amount - Raw damage amount
 * @param {string} source - Damage source description (e.g. 'aggressive', 'swift_escape')
 */
export function damagePlayer(amount, source) {
  const player = getPlayer();
  if (!player || isRespawning) return;

  const stats = getComputedStats();
  const reduced = Math.max(1, Math.floor(amount * (1 - stats.damageReduction)));
  player.hp -= reduced;
  player.statistics.totalDamageTaken += reduced;

  emit('player:damaged', { damage: reduced, source });

  if (player.hp <= 0) {
    player.hp = 0;
    handleDeath();
  }

  emitHPChanged();
}

/**
 * Handle player death: gold penalty, level reset, respawn.
 */
function handleDeath() {
  const player = getPlayer();

  // Track death
  player.statistics.totalDeaths++;

  // Lose 50% of current gold
  const goldLost = Math.floor(player.gold * DEATH_GOLD_LOSS);
  player.gold -= goldLost;

  // Reset to last milestone level
  const milestone = Math.floor(player.level / DEATH_LEVEL_MILESTONE) * DEATH_LEVEL_MILESTONE;
  const newLevel = Math.max(milestone, 1);
  const levelsLost = player.level - newLevel;
  player.level = newLevel;
  player.xp = 0;
  player.xpToNextLevel = xpToNextLevel(player.level);

  // Energy resets
  player.energy = 0;

  // Despawn current monster
  state.currentMonster = null;
  state.combatState = 'dead';

  emit('player:died', { goldLost, levelsLost, newLevel });
  emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });

  // Schedule respawn
  isRespawning = true;
  respawnTimer = DEATH_RESPAWN_DELAY / 1000;
}

/**
 * Complete respawn: full heal, trigger new monster spawn.
 */
function completeRespawn() {
  const player = getPlayer();
  const stats = getComputedStats();

  // Recalc maxHP for potentially lower level
  player.maxHP = stats.maxHP;
  player.hp = player.maxHP;

  isRespawning = false;
  state.combatState = 'waiting';

  emitHPChanged();
  emit('player:respawned', {});
}

export function update(dt) {
  const player = getPlayer();
  if (!player) return;

  // Handle respawn timer
  if (isRespawning) {
    respawnTimer -= dt;
    if (respawnTimer <= 0) {
      completeRespawn();
    }
    return; // No regen while dead
  }

  // Passive HP regen: hpRegen % of maxHP per second (includes equipment bonus)
  if (player.hp < player.maxHP) {
    const stats = getComputedStats();
    const regenAmount = player.maxHP * stats.hpRegen * dt;
    player.hp = Math.min(player.hp + regenAmount, player.maxHP);
    player.statistics.totalHealingDone += regenAmount;
    emitHPChanged();
  }
}

function emitHPChanged() {
  const player = getPlayer();
  emit('player:hpChanged', {
    hp: player.hp,
    maxHP: player.maxHP
  });
}

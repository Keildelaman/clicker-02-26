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
import {
  DEATH_GOLD_LOSS, DEATH_LEVEL_MILESTONE, DEATH_RESPAWN_DELAY
} from '../data/constants.js';
import { xpToNextLevel } from '../data/balance.js';
/* Note: state.activeBuffs and state.playerShield accessed for skill interactions */

let respawnTimer = 0;
let isRespawning = false;
let computeStats = null; // Injected: player.getComputedStats

/**
 * @param {Object} deps - Injected dependencies
 * @param {Function} deps.getComputedStats - Returns player computed stats
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
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
  const stats = computeStats();
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

  const stats = computeStats();

  // Invulnerable (Transcendence buff)
  if (stats.invulnerable) {
    emit('player:damaged', { damage: 0, source, blocked: true });
    return;
  }

  // Apply damage taken multiplier (Berserk Rage)
  let finalAmount = amount;
  if (stats.damageTakenMultiplier !== 1.0) {
    finalAmount = Math.floor(finalAmount * stats.damageTakenMultiplier);
  }

  // Apply damage reduction (equipment + Iron Skin buff)
  const reduced = Math.max(1, Math.floor(finalAmount * (1 - stats.damageReduction)));

  // Player shield absorbs damage first
  let remaining = reduced;
  if (state.playerShield && state.playerShield.amount > 0) {
    if (remaining <= state.playerShield.amount) {
      state.playerShield.amount -= remaining;
      remaining = 0;
    } else {
      remaining -= state.playerShield.amount;
      state.playerShield.amount = 0;
      state.playerShield = null;
    }
    emit('skill:effectTriggered', { effect: 'shieldAbsorbed' });
  }

  player.hp -= remaining;
  player.statistics.totalDamageTaken += remaining;

  emit('player:damaged', { damage: remaining, source });

  // Undying: survive fatal blow
  if (player.hp <= 0 && stats.survivePercent > 0) {
    player.hp = Math.max(1, Math.floor(stats.maxHP * stats.survivePercent));
    // Remove the undying buff (consumed) — activeBuffs is a map, not an array
    for (const [id, buff] of Object.entries(state.activeBuffs)) {
      if (buff.effects && buff.effects.survivePercent) {
        delete state.activeBuffs[id];
        emit('skill:buffExpired', { skillId: id });
      }
    }
    emitHPChanged();
    return;
  }

  if (player.hp <= 0) {
    player.hp = 0;
    handleDeath();
  }

  // Reflect: deal damage back to monster
  if (stats.reflectMultiplier > 0 && state.currentMonster && remaining > 0) {
    const reflectDmg = Math.floor(remaining * stats.reflectMultiplier);
    if (reflectDmg > 0) {
      state.currentMonster.currentHealth -= reflectDmg;
      emit('skill:effectTriggered', { effect: 'reflect', damage: reflectDmg });
    }
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
  const stats = computeStats();

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
    const stats = computeStats();
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

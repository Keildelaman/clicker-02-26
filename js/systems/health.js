/**
 * health.js - Health System
 *
 * Owns: HP regen, HP change events.
 * Listens to: player:levelUp (full heal + maxHP update)
 * Emits: player:hpChanged
 *
 * No damage/death logic yet (Phase 5).
 *
 * @see docs/systems/health.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { getComputedStats } from './player.js';

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

export function update(dt) {
  const player = getPlayer();
  if (!player) return;

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

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
import { BASE_HP_REGEN } from '../data/constants.js';

export function init() {
  on('player:levelUp', onLevelUp);
}

function onLevelUp() {
  const player = getPlayer();
  player.hp = player.maxHP;
  emitHPChanged();
}

export function update(dt) {
  const player = getPlayer();
  if (!player) return;

  // Passive HP regen: BASE_HP_REGEN (1.5%) of maxHP per second
  if (player.hp < player.maxHP) {
    const regenAmount = player.maxHP * BASE_HP_REGEN * dt;
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

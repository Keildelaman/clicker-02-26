/**
 * energy.js - Energy System
 *
 * Owns: Energy gain (click + kill), passive regen, cooldown enforcement.
 * Listens to: combat:click, combat:monsterKilled
 * Emits: energy:changed
 *
 * @see docs/systems/energy.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import {
  MAX_ENERGY, ENERGY_PER_CLICK, ENERGY_ON_KILL,
  ENERGY_ON_BOSS_KILL, ENERGY_REGEN_PER_SECOND,
  ENERGY_GAIN_COOLDOWN
} from '../data/constants.js';

// 200ms cooldown between click-based energy gains (in seconds)
const COOLDOWN_SEC = ENERGY_GAIN_COOLDOWN / 1000;
let timeSinceLastGain = COOLDOWN_SEC; // Start ready

export function init() {
  on('combat:click', onCombatClick);
  on('combat:monsterKilled', onMonsterKilled);
}

function onCombatClick() {
  if (timeSinceLastGain < COOLDOWN_SEC) return;

  const player = getPlayer();
  if (player.energy >= MAX_ENERGY) return;

  player.energy = Math.min(player.energy + ENERGY_PER_CLICK, MAX_ENERGY);
  timeSinceLastGain = 0;
  emitChanged();
}

function onMonsterKilled({ isBoss }) {
  const player = getPlayer();
  const bonus = isBoss ? ENERGY_ON_BOSS_KILL : ENERGY_ON_KILL;
  player.energy = Math.min(player.energy + bonus, MAX_ENERGY);
  emitChanged();
}

export function update(dt) {
  const player = getPlayer();
  if (!player) return;

  // Track cooldown
  timeSinceLastGain += dt;

  // Passive regen
  if (player.energy < MAX_ENERGY) {
    player.energy = Math.min(player.energy + ENERGY_REGEN_PER_SECOND * dt, MAX_ENERGY);
    emitChanged();
  }
}

function emitChanged() {
  const player = getPlayer();
  emit('energy:changed', {
    energy: player.energy,
    maxEnergy: MAX_ENERGY
  });
}

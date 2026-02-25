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
import { SKILLS } from '../data/skills.data.js';
import { resolveSkillLevelData } from '../data/balance.js';

// 200ms cooldown between click-based energy gains (in seconds)
const COOLDOWN_SEC = ENERGY_GAIN_COOLDOWN / 1000;
let timeSinceLastGain = COOLDOWN_SEC; // Start ready
let lastClickTime = 0;
let computeStats = null; // Injected: player.getComputedStats
let resolveEffectiveLevel = null; // Injected: skills.getEffectiveSkillLevel

/**
 * @param {Object} deps - Injected dependencies
 * @param {Function} deps.getComputedStats - Returns player computed stats
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
  resolveEffectiveLevel = deps.getEffectiveSkillLevel || null;

  on('combat:click', onCombatClick);
  on('combat:monsterKilled', onMonsterKilled);

  // Tutorial full heal (first zone travel)
  on('tutorial:fullHeal', () => {
    const player = getPlayer();
    player.energy = Math.min(player.energy + MAX_ENERGY, MAX_ENERGY);
    emitChanged();
  });
}

function getEnergyPerClick() {
  const player = getPlayer();
  if (!player) return ENERGY_PER_CLICK;
  if (player.equippedPassive.includes('heavy_handed')) {
    const baseLevel = player.unlockedSkills['heavy_handed'];
    if (baseLevel) {
      const effectiveLevel = resolveEffectiveLevel ? resolveEffectiveLevel('heavy_handed') : baseLevel;
      const { data, bmMult } = resolveSkillLevelData(SKILLS['heavy_handed'], effectiveLevel);
      if (data?.energyPerClick !== undefined) {
        return Math.floor(data.energyPerClick * bmMult);
      }
    }
  }
  return ENERGY_PER_CLICK;
}

function onCombatClick() {
  lastClickTime = performance.now();

  if (timeSinceLastGain < COOLDOWN_SEC) return;

  const player = getPlayer();
  if (player.energy >= MAX_ENERGY) return;

  const mult = computeStats().energyGainMult || 1.0;
  const baseEnergy = getEnergyPerClick();
  player.energy = Math.min(player.energy + Math.floor(baseEnergy * mult), MAX_ENERGY);
  timeSinceLastGain = 0;
  emitChanged();
}

function onMonsterKilled({ isBoss }) {
  const player = getPlayer();
  const mult = computeStats().energyGainMult || 1.0;
  const bonus = isBoss ? ENERGY_ON_BOSS_KILL : ENERGY_ON_KILL;
  player.energy = Math.min(player.energy + Math.floor(bonus * mult), MAX_ENERGY);
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

  // Focused Mind: extra regen when not clicking
  if (player.equippedPassive.includes('focused_mind')) {
    const idleTime = lastClickTime > 0 ? (performance.now() - lastClickTime) / 1000 : 999;
    if (idleTime >= 0.5 && player.energy < MAX_ENERGY) {
      const baseLevel = player.unlockedSkills['focused_mind'];
      if (baseLevel) {
        const effectiveLevel = resolveEffectiveLevel ? resolveEffectiveLevel('focused_mind') : baseLevel;
        const { data, bmMult } = resolveSkillLevelData(SKILLS['focused_mind'], effectiveLevel);
        if (data) {
          player.energy = Math.min(player.energy + data.idleRegen * bmMult * dt, MAX_ENERGY);
          emitChanged();
        }
      }
    }
  }
}

/**
 * Add energy to the player, clamped to MAX_ENERGY.
 * Used by skill effects and passives via DI to avoid duplicating energy logic.
 * @param {number} amount - Energy to add
 * @returns {number} Actual energy gained
 */
export function addEnergy(amount) {
  const player = getPlayer();
  const gained = Math.min(amount, MAX_ENERGY - player.energy);
  if (gained > 0) {
    player.energy += gained;
    emitChanged();
  }
  return gained;
}

function emitChanged() {
  const player = getPlayer();
  emit('energy:changed', {
    energy: player.energy,
    maxEnergy: MAX_ENERGY
  });
}

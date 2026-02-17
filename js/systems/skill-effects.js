/**
 * skill-effects.js - Active Skill Effect Handlers
 *
 * Contains the EFFECT_HANDLERS map: one handler per active skill.
 * Each handler is dispatched by useSkill() after energy/cooldown validation.
 * Also contains the momentum click handler (momentum-specific combat:click logic).
 *
 * Extracted from skills.js for maintainability — adding a new active skill
 * only requires adding a handler here, not modifying the core skill engine.
 *
 * @see docs/data/skills.data.md
 */

import { emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';
import { BARRAGE_HIT_DELAY } from '../data/constants.js';

// Dependency injection — set during initEffects()
let invalidateStats = null;
let cooldownReadyNotified = null;

/**
 * Initialize effect handler dependencies.
 * @param {Object} deps
 * @param {Function} deps.invalidateStatCache
 * @param {Set} deps.cooldownReadyNotified
 */
export function initEffects(deps) {
  invalidateStats = deps.invalidateStatCache;
  cooldownReadyNotified = deps.cooldownReadyNotified;
}

// --- Effect Handlers ---
// Keyed by skill ID. Dispatched by useSkill() after energy/cooldown checks.

export const EFFECT_HANDLERS = {
  // Hit modifier: next click deals multiplier% damage
  power_strike(skillDef, levelData) {
    state.hitModifier = {
      skillId: 'power_strike',
      multiplier: levelData.damage / 100,
      damageType: skillDef.damageType
    };
    emit('skill:hitModifierSet', { skillId: 'power_strike' });
  },

  // Hit modifier: conditional multiplier based on monster HP%
  execute(skillDef, levelData) {
    state.hitModifier = {
      skillId: 'execute',
      type: 'execute',
      threshold: levelData.threshold / 100,
      strongMult: levelData.strongMult / 100,
      weakMult: levelData.weakMult / 100,
      damageType: skillDef.damageType
    };
    emit('skill:hitModifierSet', { skillId: 'execute' });
  },

  // Hit modifier: normal click + bonus %maxHP (ignores armor)
  shatter(skillDef, levelData) {
    state.hitModifier = {
      skillId: 'shatter',
      type: 'shatter',
      multiplier: 1,
      percentHP: levelData.percentHP / 100,
      damageType: skillDef.damageType
    };
    emit('skill:hitModifierSet', { skillId: 'shatter' });
  },

  // Click modifier: N guaranteed crit clicks
  precision(skillDef, levelData) {
    state.clickModifiers['precision'] = { charges: levelData.charges };
    emit('skill:effectTriggered', { effect: 'precision', charges: levelData.charges });
  },

  // Instant multi-hit damage (staggered)
  barrage(skillDef, levelData) {
    emit('skill:instantDamage', {
      hits: levelData.hits,
      damagePerHit: levelData.damagePerHit,
      skillId: 'barrage',
      hitDelay: BARRAGE_HIT_DELAY,
      damageType: skillDef.damageType
    });
  },

  // Instant single-hit damage
  arcane_bolt(skillDef, levelData) {
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: levelData.damage,
      skillId: 'arcane_bolt',
      damageType: skillDef.damageType
    });
  },

  // Instant damage (overkill carry now handled generically by combat system)
  chain_lightning(skillDef, levelData) {
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: levelData.damage,
      skillId: 'chain_lightning',
      damageType: skillDef.damageType
    });
  },

  // Instant damage + player shield
  shield_bash(skillDef, levelData) {
    const player = getPlayer();
    const shieldAmount = Math.floor(player.maxHP * (levelData.shieldPercent / 100));
    state.playerShield = {
      amount: shieldAmount,
      maxAmount: shieldAmount,
      remaining: levelData.shieldDuration
    };
    emit('skill:effectTriggered', { effect: 'shieldGranted', amount: shieldAmount });
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: levelData.damage,
      skillId: 'shield_bash',
      damageType: skillDef.damageType
    });
  },

  // Timed buff: multi-hit per click
  flurry(skillDef, levelData) {
    state.activeBuffs['flurry'] = {
      remaining: levelData.duration,
      effects: { hitsPerClick: levelData.hitsPerClick }
    };
    emit('skill:buffApplied', { skillId: 'flurry', duration: levelData.duration });
  },

  // Timed buff: crit chance = energy%, drains energy per second
  adrenaline_rush(skillDef, levelData) {
    state.activeBuffs['adrenaline_rush'] = {
      remaining: levelData.duration,
      effects: { drainRate: levelData.drainRate, critFromEnergy: true }
    };
    emit('skill:buffApplied', { skillId: 'adrenaline_rush', duration: levelData.duration });
  },

  // Instant energy grant
  energy_surge(skillDef, levelData) {
    const player = getPlayer();
    const gained = Math.min(levelData.energyGained, player.maxEnergy - player.energy);
    player.energy += gained;
    emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });
    emit('skill:effectTriggered', { effect: 'energySurge', gained });
  },

  // Reduce all other equipped skill cooldowns
  overcharge(skillDef, levelData) {
    const player = getPlayer();
    for (const equippedId of player.equippedActive) {
      if (!equippedId || equippedId === 'overcharge') continue;
      if ((player.skillCooldowns[equippedId] || 0) > 0) {
        player.skillCooldowns[equippedId] = Math.max(
          player.skillCooldowns[equippedId] - levelData.cdrAmount, 0
        );
        if (player.skillCooldowns[equippedId] <= 0) {
          player.skillCooldowns[equippedId] = 0;
          if (!cooldownReadyNotified.has(equippedId)) {
            cooldownReadyNotified.add(equippedId);
            emit('skill:cooldownReady', { skillId: equippedId });
          }
        }
      }
    }
    emit('skill:effectTriggered', { effect: 'overcharge', cdrAmount: levelData.cdrAmount });
  },

  // HP cost -> energy gain
  life_tap(skillDef, levelData) {
    const player = getPlayer();
    const hpCost = Math.floor(player.hp * (levelData.hpCostPercent / 100));
    if (hpCost > 0) {
      player.hp = Math.max(1, player.hp - hpCost);
      emit('player:hpChanged', { hp: player.hp, maxHP: player.maxHP });
    }
    const gained = Math.min(levelData.energyGained, player.maxEnergy - player.energy);
    player.energy += gained;
    emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });
    emit('skill:effectTriggered', { effect: 'lifeTap', hpCost, energyGained: gained });
  },

  // Channel: click to queue, hold monster to charge, release for scaled damage
  charge_up(skillDef, levelData) {
    state.channelState = {
      phase: 'queued',
      skillId: 'charge_up',
      startTime: 0,
      channelMin: levelData.channelMin,
      channelMax: levelData.channelMax,
      minMult: levelData.minMult,
      maxMult: levelData.maxMult,
      damageType: skillDef.damageType
    };
    emit('skill:channelStarted', { skillId: 'charge_up', phase: 'queued' });
  },

  // Toggle: builds stacks on fast clicks, drains energy/sec
  momentum(skillDef, levelData) {
    const toggle = state.toggleStates['momentum'];
    if (toggle && toggle.active) {
      state.toggleStates['momentum'] = { active: false, stacks: 0, lastClickTime: 0 };
      invalidateStats();
      emit('skill:toggleOff', { skillId: 'momentum' });
      emit('skill:effectEnded', { skillId: 'momentum', type: 'toggle' });
    } else {
      state.toggleStates['momentum'] = {
        active: true,
        stacks: 0,
        lastClickTime: 0,
        decayTimer: levelData.decayTimer,
        drainPerSec: levelData.drainPerSec,
        dmgPerStack: levelData.dmgPerStack,
        maxStacks: levelData.maxStacks
      };
      emit('skill:toggleOn', { skillId: 'momentum' });
    }
  }
};

// --- Momentum Click Handler ---

/**
 * Track momentum stacks on combat clicks.
 * Subscribed to 'combat:click' by skills.js init().
 */
export function onCombatClickMomentum() {
  const momentum = state.toggleStates['momentum'];
  if (!momentum || !momentum.active) return;
  const now = performance.now();
  const gap = momentum.lastClickTime > 0 ? (now - momentum.lastClickTime) / 1000 : 999;
  if (gap <= 0.8) {
    momentum.stacks = Math.min(momentum.stacks + 1, momentum.maxStacks);
  } else {
    momentum.stacks = 1;
  }
  momentum.lastClickTime = now;
}

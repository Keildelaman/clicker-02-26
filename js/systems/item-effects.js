/**
 * item-effects.js - Legendary Item Effect Handlers
 *
 * Contains the LEGENDARY_EFFECT_HANDLERS map: one handler per legendary
 * unique effect. Each handler has onEquip/onUnequip lifecycle hooks that
 * subscribe/unsubscribe from game events.
 *
 * Sub-module of items.js (like skill-effects.js → skills.js).
 *
 * @see docs/design/item-system-v2.md (Section 6)
 */

import { on, off, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import {
  LEGENDARY_EFFECTS, STATUS_EFFECTS,
  ENERGY_REGEN_PER_SECOND, MAX_ENERGY
} from '../data/constants.js';

// DI dependencies — set during initLegendaryEffects()
let deps = {};

// Track event subscriptions for cleanup (same pattern as skill-passives.js)
const legendaryHandlerRefs = {}; // { effectId: [{ event, fn }, ...] }

// Tick state for glacial_mantle
let lastPlayerDamageTime = 0;
let glacialDamageListenerActive = false;

// ============================================================
// LEGENDARY EFFECT HANDLERS
// ============================================================

export const LEGENDARY_EFFECT_HANDLERS = {

  // --- Category A: Event-Based ---

  /** Thornweave Wraps: bleed ticks deal 50% bonus damage to slowed targets */
  bleed_bonus_vs_slowed: {
    onEquip() {
      const fn = ({ target, effectId, damage }) => {
        if (target !== 'monster') return;
        if (effectId !== STATUS_EFFECTS.BLEED) return;
        const monster = state.currentMonster;
        if (!monster || !monster.slowed) return;

        const bonusDmg = Math.floor(damage * LEGENDARY_EFFECTS.BLEED_SLOW_BONUS);
        if (bonusDmg > 0) {
          emit('statusEffect:damageMonster', {
            damage: bonusDmg,
            damageType: 'physical',
            effectId: 'bleed_legendary_bonus'
          });
        }
      };
      legendaryHandlerRefs['bleed_bonus_vs_slowed'] = [{ event: 'statusEffect:tick', fn }];
      on('statusEffect:tick', fn);
    },
    onUnequip() { cleanupLegendary('bleed_bonus_vs_slowed'); }
  },

  /** Embercaller's Staff: burn damage can critically strike */
  burn_can_crit: {
    onEquip() {
      const fn = ({ target, effectId, damage }) => {
        if (target !== 'monster') return;
        if (effectId !== STATUS_EFFECTS.BURN) return;

        const stats = deps.getComputedStats();
        if (Math.random() < stats.critChance) {
          const bonusDmg = Math.floor(damage * (stats.critDamage - 1));
          if (bonusDmg > 0) {
            emit('statusEffect:damageMonster', {
              damage: bonusDmg,
              damageType: 'magic',
              effectId: 'burn_crit_bonus'
            });
          }
        }
      };
      legendaryHandlerRefs['burn_can_crit'] = [{ event: 'statusEffect:tick', fn }];
      on('statusEffect:tick', fn);
    },
    onUnequip() { cleanupLegendary('burn_can_crit'); }
  },

  /** Frostbite Edge: critical hits freeze the target for 0.5s */
  crit_freeze: {
    onEquip() {
      const fn = ({ isCrit }) => {
        if (!isCrit) return;
        emit('statusEffect:tryApply', {
          target: 'monster',
          effectId: STATUS_EFFECTS.FREEZE,
          stacks: 1,
          source: 'frostbite_edge'
        });
      };
      legendaryHandlerRefs['crit_freeze'] = [{ event: 'combat:hit', fn }];
      on('combat:hit', fn);
    },
    onUnequip() { cleanupLegendary('crit_freeze'); }
  },

  /** Crown of the Void King: 10% chance on kill to fully restore shield */
  kill_restore_shield: {
    onEquip() {
      const fn = () => {
        if (Math.random() >= LEGENDARY_EFFECTS.KILL_SHIELD_CHANCE) return;

        const stats = deps.getComputedStats();
        if (stats.maxShield <= 0) return;

        if (!state.playerShield) {
          state.playerShield = { amount: stats.maxShield };
        } else {
          state.playerShield.amount = stats.maxShield;
        }
        emit('skill:effectTriggered', { effect: 'killRestoreShield', amount: stats.maxShield });
      };
      legendaryHandlerRefs['kill_restore_shield'] = [{ event: 'combat:monsterKilled', fn }];
      on('combat:monsterKilled', fn);
    },
    onUnequip() { cleanupLegendary('kill_restore_shield'); }
  },

  /** Soulreaver: 5% of damage dealt is gained as shield */
  damage_to_shield: {
    onEquip() {
      const fn = ({ damage }) => {
        if (!damage || damage <= 0) return;

        const stats = deps.getComputedStats();
        if (stats.maxShield <= 0) return;

        const shieldGain = Math.floor(damage * LEGENDARY_EFFECTS.DAMAGE_TO_SHIELD_RATIO);
        if (shieldGain <= 0) return;

        if (!state.playerShield) {
          state.playerShield = { amount: Math.min(shieldGain, stats.maxShield) };
        } else {
          state.playerShield.amount = Math.min(
            state.playerShield.amount + shieldGain,
            stats.maxShield
          );
        }
      };
      legendaryHandlerRefs['damage_to_shield'] = [{ event: 'combat:hit', fn }];
      on('combat:hit', fn);
    },
    onUnequip() { cleanupLegendary('damage_to_shield'); }
  },

  /** Void Eternal: all skill cooldowns reduced by 1s on kill */
  kill_reduce_cooldowns: {
    onEquip() {
      const fn = () => {
        const player = getPlayer();
        if (!player) return;
        for (const id of Object.keys(player.skillCooldowns)) {
          if (player.skillCooldowns[id] > 0) {
            player.skillCooldowns[id] = Math.max(
              0, player.skillCooldowns[id] - LEGENDARY_EFFECTS.CDR_ON_KILL
            );
            if (player.skillCooldowns[id] <= 0) {
              player.skillCooldowns[id] = 0;
              emit('skill:cooldownReady', { skillId: id });
            }
          }
        }
      };
      legendaryHandlerRefs['kill_reduce_cooldowns'] = [{ event: 'combat:monsterKilled', fn }];
      on('combat:monsterKilled', fn);
    },
    onUnequip() { cleanupLegendary('kill_reduce_cooldowns'); }
  },

  // --- Category B: System Behavior Modifications ---
  // These use state.activeLegendaryEffects checks in their respective systems.
  // No event handlers needed — just presence/absence in the Set.

  double_hit:                { onEquip() {}, onUnequip() {} },
  dodge_chance:              { onEquip() {}, onUnequip() {} },
  unlimited_poison_stacks:   { onEquip() {}, onUnequip() {} },
  status_duration_bonus:     { onEquip() {}, onUnequip() {} },
  fire_damage_heals:         { onEquip() {}, onUnequip() {} },

  // --- Category C: Stat Pipeline Modifications ---
  // Checked in player.js getComputedStats().

  armor_to_magic_resist:     { onEquip() {}, onUnequip() {} },
  high_hp_damage_bonus:      { onEquip() {}, onUnequip() {} },

  // --- Category D: Tick-Based ---
  // Handled in updateLegendaryTicks(dt).

  energy_regen_low_hp:       { onEquip() {}, onUnequip() {} },

  shield_regen_idle: {
    onEquip() {
      lastPlayerDamageTime = performance.now();
      if (!glacialDamageListenerActive) {
        const fn = () => { lastPlayerDamageTime = performance.now(); };
        legendaryHandlerRefs['shield_regen_idle'] = [{ event: 'player:damaged', fn }];
        on('player:damaged', fn);
        glacialDamageListenerActive = true;
      }
    },
    onUnequip() {
      cleanupLegendary('shield_regen_idle');
      glacialDamageListenerActive = false;
    }
  }
};

// ============================================================
// TICK-BASED EFFECTS
// ============================================================

/**
 * Update tick-based legendary effects. Called by items.update(dt).
 * @param {number} dt - Delta time in seconds
 */
export function updateLegendaryTicks(dt) {
  if (!state.activeLegendaryEffects) return;

  // Whisperwood Heart: energy regen doubled while below 30% HP
  if (state.activeLegendaryEffects.has('energy_regen_low_hp')) {
    const player = getPlayer();
    if (player.hp / player.maxHP < LEGENDARY_EFFECTS.LOW_HP_THRESHOLD) {
      player.energy = Math.min(player.energy + ENERGY_REGEN_PER_SECOND * dt, MAX_ENERGY);
    }
  }

  // Glacial Mantle: shield regen when not taking damage for 3s
  if (state.activeLegendaryEffects.has('shield_regen_idle')) {
    if (state.playerShield && state.playerShield.amount > 0) {
      const stats = deps.getComputedStats();
      const idleTime = (performance.now() - lastPlayerDamageTime) / 1000;
      if (idleTime >= LEGENDARY_EFFECTS.SHIELD_REGEN_IDLE_TIME && stats.maxShield > 0) {
        const regenAmt = stats.maxShield * LEGENDARY_EFFECTS.SHIELD_REGEN_RATE * dt;
        state.playerShield.amount = Math.min(
          state.playerShield.amount + regenAmt,
          stats.maxShield
        );
      }
    }
  }
}

// ============================================================
// LIFECYCLE
// ============================================================

/**
 * Clean up all event subscriptions for a legendary effect.
 * @param {string} effectId
 */
function cleanupLegendary(effectId) {
  const refs = legendaryHandlerRefs[effectId];
  if (refs) {
    for (const { event, fn } of refs) {
      off(event, fn);
    }
    delete legendaryHandlerRefs[effectId];
  }
}

/**
 * Initialize legendary effect dependencies.
 * @param {Object} injected - { getComputedStats }
 */
export function initLegendaryEffects(injected) {
  deps = injected;
}

/**
 * Re-subscribe all currently equipped legendary effects (called on game load).
 * Scans all 6 equipment slots for items with uniqueEffect.id.
 */
export function resubscribeAllLegendaries() {
  const player = getPlayer();
  if (!player) return;

  const slots = ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'accessory'];
  for (const slot of slots) {
    const item = player.equipment[slot];
    if (!item || !item.uniqueEffect) continue;

    const effectId = item.uniqueEffect.id;
    const handler = LEGENDARY_EFFECT_HANDLERS[effectId];
    if (handler?.onEquip) {
      handler.onEquip(item);
    }
  }
}

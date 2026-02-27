/**
 * skill-passives.js - Passive Skill Handlers
 *
 * Contains the PASSIVE_HANDLERS map: one handler per passive skill.
 * Each handler has onEquip/onUnequip lifecycle hooks that subscribe/
 * unsubscribe from game events.
 *
 * Extracted from skills.js for maintainability — adding a new passive
 * only requires adding a handler here and its data definition.
 *
 * @see docs/data/skills.data.md
 */

import { on, off, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';

// Dependency injection — set during initPassives()
let invalidateStats = null;
let notifyCooldownReady = null;
let resolveSkillLevel = null; // Injected: skills.getEffectiveSkillLevel
let addEnergy = null;

// Track event subscriptions for cleanup
const passiveHandlerRefs = {}; // { skillId: [{ event, fn }, ...] }

// --- Passive Skill Handlers ---

export const PASSIVE_HANDLERS = {
  click_mastery: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      state.passiveStates['click_mastery'] = { stacks: 0, lastClickTime: 0 };
      const fn = () => {
        const ps = state.passiveStates['click_mastery'];
        if (!ps) return;
        const now = performance.now();
        const gap = (now - ps.lastClickTime) / 1000;
        if (ps.lastClickTime > 0 && gap <= data.clickWindow) {
          ps.stacks = Math.min(ps.stacks + 1, data.maxStacks);
        } else {
          ps.stacks = 1;
        }
        ps.lastClickTime = now;
      };
      passiveHandlerRefs[skillId] = [{ event: 'combat:click', fn }];
      on('combat:click', fn);
    },
    onUnequip(skillId) {
      cleanupPassive(skillId);
      delete state.passiveStates['click_mastery'];
    }
  },

  vampiric_strikes: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      const fn = ({ damage, isSkillDamage }) => {
        if (isSkillDamage) return;
        const player = getPlayer();
        if (!player) return;
        const heal = Math.floor(damage * (data.healPercent / 100));
        if (heal > 0) {
          player.hp = Math.min(player.hp + heal, player.maxHP);
          player.statistics.totalHealingDone += heal;
          emit('player:hpChanged', { hp: player.hp, maxHP: player.maxHP });
        }
      };
      passiveHandlerRefs[skillId] = [{ event: 'combat:hit', fn }];
      on('combat:hit', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  critical_flow: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      const fn = ({ isCrit }) => {
        if (!isCrit) return;
        addEnergy(data.energyPerCrit);
      };
      passiveHandlerRefs[skillId] = [{ event: 'combat:hit', fn }];
      on('combat:hit', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  // Stat-only passive: bonus applied via getPassiveSkillBonus() in player.js
  // and getEnergyPerClick() in energy.js. No event subscriptions needed.
  heavy_handed: {
    onEquip(skillId, level) {},
    onUnequip(skillId) {}
  },

  combo_artist: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      state.passiveStates['combo_artist'] = { lastSkillId: null, lastSkillTime: 0 };
      const fn = ({ skillId: usedSkillId }) => {
        const ps = state.passiveStates['combo_artist'];
        if (!ps) return;
        const now = performance.now();
        const gap = (now - ps.lastSkillTime) / 1000;
        if (ps.lastSkillId && ps.lastSkillId !== usedSkillId && gap <= data.triggerWindow) {
          state.activeBuffs['combo_artist'] = {
            remaining: data.buffDuration,
            effects: { damageBonus: data.dmgBonus / 100 }
          };
          invalidateStats();
          emit('skill:buffApplied', { skillId: 'combo_artist', duration: data.buffDuration });
        }
        ps.lastSkillId = usedSkillId;
        ps.lastSkillTime = now;
      };
      passiveHandlerRefs[skillId] = [{ event: 'skill:used', fn }];
      on('skill:used', fn);
    },
    onUnequip(skillId) {
      cleanupPassive(skillId);
      delete state.passiveStates['combo_artist'];
      delete state.activeBuffs['combo_artist'];
      invalidateStats();
    }
  },

  // Stat-only passive: bonus applied via getPassiveSkillBonus() in player.js.
  // Conditionally active when HP < threshold. No event subscriptions needed.
  berserker: {
    onEquip(skillId, level) {},
    onUnequip(skillId) {}
  },

  // Stat-only passive: bonus applied via getPassiveSkillBonus() in player.js.
  // Reduces energy cost of skills. No event subscriptions needed.
  efficient_casting: {
    onEquip(skillId, level) {},
    onUnequip(skillId) {}
  },

  spell_weaver: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      const fn = ({ skillId: usedSkillId }) => {
        const player = getPlayer();
        if (!player) return;
        for (const equippedId of player.equippedActive) {
          if (!equippedId || equippedId === usedSkillId) continue;
          if ((player.skillCooldowns[equippedId] || 0) > 0) {
            player.skillCooldowns[equippedId] = Math.max(
              player.skillCooldowns[equippedId] - data.cdrPerUse, 0
            );
            if (player.skillCooldowns[equippedId] <= 0) {
              player.skillCooldowns[equippedId] = 0;
              notifyCooldownReady(equippedId);
            }
          }
        }
      };
      passiveHandlerRefs[skillId] = [{ event: 'skill:used', fn }];
      on('skill:used', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  residual_energy: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      const fn = ({ skillId: endedSkillId, type: endType }) => {
        const def = SKILLS[endedSkillId];
        if (endType !== 'shield' && def && (def.mechanic === 'instant' || def.mechanic === 'cd_utility' || def.mechanic === 'hp_cost')) return;
        const gained = addEnergy(data.energyOnEnd);
        if (gained > 0) {
          emit('skill:effectTriggered', { effect: 'residualEnergy', gained });
        }
      };
      passiveHandlerRefs[skillId] = [{ event: 'skill:effectEnded', fn }];
      on('skill:effectEnded', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  // System-checked passive: read directly in energy.js getEnergyRegenRate().
  // No event subscriptions needed.
  focused_mind: {
    onEquip(skillId, level) {},
    onUnequip(skillId) {}
  },

  // ===========================
  // STATUS PASSIVE HANDLERS (5 new)
  // ===========================

  // Stat-only passive: bonus applied via getPassiveSkillBonus() in player.js.
  // Damage bonus per active status effect on target. System-checked in combat.
  affliction_mastery: {
    onEquip(skillId, level) {},
    onUnequip(skillId) {}
  },

  // DoT damage heals player
  toxic_resilience: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      const fn = ({ target, effectId, damage }) => {
        if (target !== 'monster') return;
        const player = getPlayer();
        if (!player) return;
        const heal = Math.floor(damage * (data.healPercent / 100));
        if (heal > 0) {
          player.hp = Math.min(player.hp + heal, player.maxHP);
          player.statistics.totalHealingDone += heal;
          emit('player:hpChanged', { hp: player.hp, maxHP: player.maxHP });
        }
      };
      passiveHandlerRefs[skillId] = [{ event: 'statusEffect:tick', fn }];
      on('statusEffect:tick', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  // Poison ticks restore energy per stack
  venom_efficiency: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      const fn = ({ target, effectId, stacks }) => {
        if (target !== 'monster' || effectId !== 'poison') return;
        const energy = data.energyPerStack * (stacks || 1);
        if (energy > 0 && addEnergy) addEnergy(energy);
      };
      passiveHandlerRefs[skillId] = [{ event: 'statusEffect:tick', fn }];
      on('statusEffect:tick', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  // Applying Slow or Freeze reduces all skill cooldowns
  frostbite_passive: {
    onEquip(skillId, level) {
      const data = SKILLS[skillId].levels[level];
      const fn = ({ target, effectId, refreshed }) => {
        if (target !== 'monster') return;
        if (effectId !== 'slow' && effectId !== 'freeze') return;
        if (refreshed) return; // Only on fresh applications
        const player = getPlayer();
        if (!player) return;
        for (const equippedId of player.equippedActive) {
          if (!equippedId) continue;
          if ((player.skillCooldowns[equippedId] || 0) > 0) {
            player.skillCooldowns[equippedId] = Math.max(
              player.skillCooldowns[equippedId] - data.cdr, 0
            );
            if (player.skillCooldowns[equippedId] <= 0) {
              player.skillCooldowns[equippedId] = 0;
              notifyCooldownReady(equippedId);
            }
          }
        }
        emit('skill:effectTriggered', { effect: 'frostbite_cdr', cdr: data.cdr });
      };
      passiveHandlerRefs[skillId] = [{ event: 'statusEffect:applied', fn }];
      on('statusEffect:applied', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  // Stat-only passive: status durations + proc chances.
  // System-checked in status-effects.js (duration) and combat.js (proc chance).
  plague_doctor: {
    onEquip(skillId, level) {},
    onUnequip(skillId) {}
  }
};

// --- Internal Helpers ---

function cleanupPassive(skillId) {
  const refs = passiveHandlerRefs[skillId];
  if (refs) {
    for (const { event, fn } of refs) {
      off(event, fn);
    }
    delete passiveHandlerRefs[skillId];
  }
}

/**
 * Refresh all equipped passives: unequip then re-subscribe.
 * Called when item changes affect effective skill levels.
 */
export function refreshAllPassives() {
  const player = getPlayer();
  if (!player) return;
  // Unsubscribe all currently equipped passives
  for (const skillId of player.equippedPassive) {
    if (!skillId) continue;
    const handler = PASSIVE_HANDLERS[skillId];
    if (handler?.onUnequip) handler.onUnequip(skillId);
  }
  // Re-subscribe with updated effective levels
  resubscribeAll();
}

/**
 * Re-subscribe all currently equipped passives (called on game load).
 */
function resubscribeAll() {
  const player = getPlayer();
  if (!player) return;
  for (const skillId of player.equippedPassive) {
    if (!skillId) continue;
    const handler = PASSIVE_HANDLERS[skillId];
    const level = resolveSkillLevel ? resolveSkillLevel(skillId) : player.unlockedSkills[skillId];
    if (handler?.onEquip && level) {
      handler.onEquip(skillId, level);
    }
  }
}

// --- Initialization ---

/**
 * Initialize passive handler dependencies and re-subscribe equipped passives.
 * @param {Object} deps
 * @param {Function} deps.invalidateStatCache
 * @param {Function} deps.notifyCooldownReady
 * @param {Function} deps.addEnergy
 */
export function initPassives(deps) {
  invalidateStats = deps.invalidateStatCache;
  notifyCooldownReady = deps.notifyCooldownReady;
  resolveSkillLevel = deps.getEffectiveSkillLevel || null;
  addEnergy = deps.addEnergy || null;
  resubscribeAll();
}

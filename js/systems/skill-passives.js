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
let cooldownReadyNotified = null;

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
        const player = getPlayer();
        if (!player) return;
        const gained = Math.min(data.energyPerCrit, player.maxEnergy - player.energy);
        if (gained > 0) {
          player.energy += gained;
          emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });
        }
      };
      passiveHandlerRefs[skillId] = [{ event: 'combat:hit', fn }];
      on('combat:hit', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

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

  berserker: {
    onEquip(skillId, level) {},
    onUnequip(skillId) {}
  },

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
            const eDef = SKILLS[equippedId];
            const eLevel = player.unlockedSkills[equippedId];
            const baseCd = eDef?.levels[eLevel]?.cooldown || 0;
            const floor = baseCd * 0.5;
            player.skillCooldowns[equippedId] = Math.max(
              player.skillCooldowns[equippedId] - data.cdrPerUse, floor
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
        const player = getPlayer();
        if (!player) return;
        const gained = Math.min(data.energyOnEnd, player.maxEnergy - player.energy);
        if (gained > 0) {
          player.energy += gained;
          emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });
          emit('skill:effectTriggered', { effect: 'residualEnergy', gained });
        }
      };
      passiveHandlerRefs[skillId] = [{ event: 'skill:effectEnded', fn }];
      on('skill:effectEnded', fn);
    },
    onUnequip(skillId) { cleanupPassive(skillId); }
  },

  focused_mind: {
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
 * Re-subscribe all currently equipped passives (called on game load).
 */
function resubscribeAll() {
  const player = getPlayer();
  if (!player) return;
  for (const skillId of player.equippedPassive) {
    if (!skillId) continue;
    const handler = PASSIVE_HANDLERS[skillId];
    const level = player.unlockedSkills[skillId];
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
 * @param {Set} deps.cooldownReadyNotified
 */
export function initPassives(deps) {
  invalidateStats = deps.invalidateStatCache;
  cooldownReadyNotified = deps.cooldownReadyNotified;
  resubscribeAll();
}

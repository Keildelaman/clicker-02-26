/**
 * skills.js - Skill System (v2)
 *
 * Owns: SP tracking, unlock/upgrade, cooldowns (tick-based), buff management,
 *       skill effect handlers, active/passive equip/unequip, respec.
 * Listens to: player:levelUp, player:died, visibilitychange
 * Emits: skill:unlocked, skill:upgraded, skill:used, skill:equipped,
 *        skill:unequipped, skill:buffApplied, skill:buffExpired,
 *        skill:cooldownReady, skill:hitModifierSet, sp:gained,
 *        player:statsChanged, skill:toggleOn, skill:toggleOff,
 *        skill:channelStarted, skill:channelRelease, skill:channelCancelled,
 *        skill:effectEnded
 *
 * Phase 7.5e: All 25 skills functional. Bug fixes: death cleanup,
 * tab-hide channel cancel, shield expiry + Residual Energy.
 *
 * @see docs/design/skill-system-v2.md
 */

import { on, off, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';
import {
  ACTIVE_SKILL_SLOTS, PASSIVE_SKILL_SLOTS,
  SP_PER_LEVEL_INTERVAL, SP_UPGRADE_COST, RESPEC_COSTS,
  SKILL_SWAP_COOLDOWN_PENALTY
} from '../data/constants.js';
import { invalidateStatCache } from './player.js';

// Dependency injection — set during init()
let computeStats = null;
let hurtPlayer = null;

// Track cooldown-ready notifications to avoid spam
const cooldownReadyNotified = new Set();

// --- Effect Handlers ---
// Keyed by skill ID. Dispatched by useSkill() after energy/cooldown checks.

const EFFECT_HANDLERS = {
  // Hit modifier: next click deals multiplier% damage
  power_strike(skillDef, levelData) {
    state.hitModifier = {
      skillId: 'power_strike',
      multiplier: levelData.damage / 100
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
      weakMult: levelData.weakMult / 100
    };
    emit('skill:hitModifierSet', { skillId: 'execute' });
  },

  // Hit modifier: normal click + bonus %maxHP (ignores armor)
  shatter(skillDef, levelData) {
    state.hitModifier = {
      skillId: 'shatter',
      type: 'shatter',
      multiplier: 1,
      percentHP: levelData.percentHP / 100
    };
    emit('skill:hitModifierSet', { skillId: 'shatter' });
  },

  // Click modifier: N guaranteed crit clicks
  precision(skillDef, levelData) {
    state.clickModifiers['precision'] = { charges: levelData.charges };
    emit('skill:effectTriggered', { effect: 'precision', charges: levelData.charges });
  },

  // Instant multi-hit damage
  barrage(skillDef, levelData) {
    emit('skill:instantDamage', {
      hits: levelData.hits,
      damagePerHit: levelData.damagePerHit,
      skillId: 'barrage'
    });
  },

  // Instant single-hit damage
  arcane_bolt(skillDef, levelData) {
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: levelData.damage,
      skillId: 'arcane_bolt'
    });
  },

  // Instant damage (overkill carry now handled generically by combat system)
  chain_lightning(skillDef, levelData) {
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: levelData.damage,
      skillId: 'chain_lightning'
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
      skillId: 'shield_bash'
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
        const eDef = SKILLS[equippedId];
        const eLevel = player.unlockedSkills[equippedId];
        const baseCd = eDef?.levels[eLevel]?.cooldown || 0;
        const floor = baseCd * 0.5;
        player.skillCooldowns[equippedId] = Math.max(
          player.skillCooldowns[equippedId] - levelData.cdrAmount, floor
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
      maxMult: levelData.maxMult
    };
    emit('skill:channelStarted', { skillId: 'charge_up', phase: 'queued' });
  },

  // Toggle: builds stacks on fast clicks, drains energy/sec
  momentum(skillDef, levelData) {
    const toggle = state.toggleStates['momentum'];
    if (toggle && toggle.active) {
      state.toggleStates['momentum'] = { active: false, stacks: 0, lastClickTime: 0 };
      invalidateStatCache();
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

// --- Public API ---

/**
 * Use an active skill by ID.
 * @param {string} skillId
 * @returns {boolean} Whether the skill was used successfully
 */
export function useSkill(skillId) {
  const player = getPlayer();
  if (!player) return false;

  // Validate: skill unlocked (map-based)
  if (player.unlockedSkills[skillId] === undefined) return false;

  // Validate: equipped in active slot
  if (!player.equippedActive.includes(skillId)) return false;

  const skillDef = SKILLS[skillId];
  if (!skillDef || skillDef.type !== 'active') return false;

  const level = player.unlockedSkills[skillId];
  const levelData = skillDef.levels[level];
  if (!levelData) return false;

  // Validate: not on cooldown
  if (getSkillCooldownRemaining(skillId) > 0) return false;

  // Validate: enough energy (with cost reduction from equipment)
  const stats = computeStats ? computeStats() : {};
  const costReduction = stats.skillEnergyCost || 0;
  const adjustedCost = Math.max(0, Math.floor(levelData.energyCost * (1 - costReduction)));
  if (player.energy < adjustedCost) return false;

  // Deduct energy
  player.energy -= adjustedCost;
  emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });

  // Set cooldown (seconds)
  player.skillCooldowns[skillId] = levelData.cooldown;
  cooldownReadyNotified.delete(skillId);

  // Dispatch to effect handler
  const handler = EFFECT_HANDLERS[skillId];
  if (handler) {
    handler(skillDef, levelData);
  }

  emit('skill:used', { skillId, tags: skillDef.tags });
  return true;
}

/**
 * Unlock a skill with SP.
 * @param {string} skillId
 * @returns {boolean} Success
 */
export function unlockSkill(skillId) {
  const player = getPlayer();
  if (!player) return false;

  // Already unlocked
  if (player.unlockedSkills[skillId] !== undefined) return false;

  const skillDef = SKILLS[skillId];
  if (!skillDef) return false;

  // Level requirement
  if (player.level < skillDef.unlockLevel) return false;

  const cost = skillDef.unlockCost;
  if (player.skillPoints < cost) return false;

  player.skillPoints -= cost;
  player.unlockedSkills[skillId] = 1;

  emit('skill:unlocked', { skillId, spRemaining: player.skillPoints });
  return true;
}

/**
 * Upgrade a skill with SP.
 * @param {string} skillId
 * @returns {boolean} Success
 */
export function upgradeSkill(skillId) {
  const player = getPlayer();
  if (!player) return false;

  const level = player.unlockedSkills[skillId];
  if (level === undefined) return false;

  const skillDef = SKILLS[skillId];
  if (!skillDef) return false;

  if (level >= skillDef.maxLevel) return false;

  const cost = SP_UPGRADE_COST;
  if (player.skillPoints < cost) return false;

  player.skillPoints -= cost;
  player.unlockedSkills[skillId] = level + 1;

  // If skill is equipped, invalidate stat cache
  if (player.equippedPassive.includes(skillId) || player.equippedActive.includes(skillId)) {
    invalidateStatCache();
  }

  emit('skill:upgraded', { skillId, newLevel: level + 1, spRemaining: player.skillPoints });
  return true;
}

/**
 * Equip an active skill in a slot.
 * @param {string} skillId
 * @param {number} slotIndex (0-3)
 * @returns {boolean} Success
 */
export function equipActiveSkill(skillId, slotIndex) {
  const player = getPlayer();
  if (!player) return false;

  if (slotIndex < 0 || slotIndex >= ACTIVE_SKILL_SLOTS) return false;

  const skillDef = SKILLS[skillId];
  if (!skillDef || skillDef.type !== 'active') return false;
  if (player.unlockedSkills[skillId] === undefined) return false;

  // Already equipped in this slot
  if (player.equippedActive[slotIndex] === skillId) return false;

  // Remove from old slot if equipped elsewhere
  const oldSlot = player.equippedActive.indexOf(skillId);
  if (oldSlot !== -1) {
    player.equippedActive[oldSlot] = null;
  }

  // Unequip whatever is in the target slot
  const displaced = player.equippedActive[slotIndex];
  if (displaced) {
    emit('skill:unequipped', { skillId: displaced, slot: slotIndex, type: 'active' });
  }

  player.equippedActive[slotIndex] = skillId;

  // Apply swap cooldown penalty
  const level = player.unlockedSkills[skillId];
  const levelData = skillDef.levels[level];
  if (levelData) {
    player.skillCooldowns[skillId] = levelData.cooldown * SKILL_SWAP_COOLDOWN_PENALTY;
  }

  emit('skill:equipped', { skillId, slot: slotIndex, type: 'active' });
  return true;
}

/**
 * Unequip an active skill from a slot.
 * @param {number} slotIndex (0-3)
 * @returns {boolean} Success
 */
export function unequipActiveSkill(slotIndex) {
  const player = getPlayer();
  if (!player) return false;

  if (slotIndex < 0 || slotIndex >= ACTIVE_SKILL_SLOTS) return false;

  const skillId = player.equippedActive[slotIndex];
  if (!skillId) return false;

  player.equippedActive[slotIndex] = null;
  emit('skill:unequipped', { skillId, slot: slotIndex, type: 'active' });
  return true;
}

/**
 * Equip a passive skill in a slot.
 * @param {string} skillId
 * @param {number} slotIndex (0-2)
 * @returns {boolean} Success
 */
export function equipPassiveSkill(skillId, slotIndex) {
  const player = getPlayer();
  if (!player) return false;

  if (slotIndex < 0 || slotIndex >= PASSIVE_SKILL_SLOTS) return false;

  const skillDef = SKILLS[skillId];
  if (!skillDef || skillDef.type !== 'passive') return false;
  if (player.unlockedSkills[skillId] === undefined) return false;

  if (player.equippedPassive[slotIndex] === skillId) return false;

  // Remove from old slot if equipped elsewhere
  const oldSlot = player.equippedPassive.indexOf(skillId);
  if (oldSlot !== -1) {
    player.equippedPassive[oldSlot] = null;
  }

  // Unequip whatever is in the target slot
  const displaced = player.equippedPassive[slotIndex];
  if (displaced) {
    const dHandler = PASSIVE_HANDLERS[displaced];
    if (dHandler?.onUnequip) dHandler.onUnequip(displaced);
    emit('skill:unequipped', { skillId: displaced, slot: slotIndex, type: 'passive' });
  }

  player.equippedPassive[slotIndex] = skillId;

  // Subscribe new passive
  const handler = PASSIVE_HANDLERS[skillId];
  if (handler?.onEquip) {
    handler.onEquip(skillId, player.unlockedSkills[skillId]);
  }

  invalidateStatCache();
  emit('skill:equipped', { skillId, slot: slotIndex, type: 'passive' });
  emit('player:statsChanged', {});
  return true;
}

/**
 * Unequip a passive skill from a slot.
 * @param {number} slotIndex (0-2)
 * @returns {boolean} Success
 */
export function unequipPassiveSkill(slotIndex) {
  const player = getPlayer();
  if (!player) return false;

  if (slotIndex < 0 || slotIndex >= PASSIVE_SKILL_SLOTS) return false;

  const skillId = player.equippedPassive[slotIndex];
  if (!skillId) return false;

  // Unsubscribe passive before removing
  const handler = PASSIVE_HANDLERS[skillId];
  if (handler?.onUnequip) handler.onUnequip(skillId);

  player.equippedPassive[slotIndex] = null;
  invalidateStatCache();
  emit('skill:unequipped', { skillId, slot: slotIndex, type: 'passive' });
  emit('player:statsChanged', {});
  return true;
}

/**
 * Get remaining cooldown for a skill in seconds.
 * @param {string} skillId
 * @returns {number} Remaining seconds, 0 if ready
 */
export function getSkillCooldownRemaining(skillId) {
  const player = getPlayer();
  if (!player) return 0;
  return Math.max(0, player.skillCooldowns[skillId] || 0);
}

/**
 * Get all currently active buffs.
 * @returns {Object} Active buff map
 */
export function getActiveBuffs() {
  return state.activeBuffs;
}

/**
 * Check if a specific skill's buff is active.
 * @param {string} skillId
 * @returns {boolean}
 */
export function hasActiveBuff(skillId) {
  return !!state.activeBuffs[skillId];
}

/**
 * Transition a queued channel to charging phase (player pressed on monster).
 */
export function startChannelCharging() {
  if (!state.channelState || state.channelState.phase !== 'queued') return false;
  state.channelState.phase = 'charging';
  state.channelState.startTime = performance.now();
  emit('skill:channelCharging', { skillId: 'charge_up' });
  return true;
}

/**
 * Release a channel skill (Charge Up). Computes damage based on hold duration.
 * Only works in 'charging' phase. If released before channelMin, fizzles.
 */
export function releaseChannel() {
  if (!state.channelState) return;
  const ch = state.channelState;

  // If still queued (not charging), cancel without damage
  if (ch.phase === 'queued') {
    cancelChannel();
    return;
  }

  const elapsed = (performance.now() - ch.startTime) / 1000;

  state.channelState = null;

  // Must hold at least channelMin to fire; early release fizzles
  if (elapsed < ch.channelMin) {
    emit('skill:channelCancelled', { skillId: 'charge_up', reason: 'too_short' });
    return;
  }

  // t scales 0→1 over full 0..channelMax window
  const t = Math.min(1, elapsed / ch.channelMax);
  const mult = ch.minMult + t * (ch.maxMult - ch.minMult);

  const stats = computeStats ? computeStats() : {};
  let damage = Math.floor((stats.attack || 1) * (mult / 100));

  const isCrit = Math.random() < (stats.critChance || 0);
  if (isCrit) damage = Math.floor(damage * (stats.critDamage || 2.0));
  damage = Math.max(damage, 1);

  emit('skill:channelRelease', { damage, isCrit, skillId: 'charge_up' });
  emit('skill:effectEnded', { skillId: 'charge_up', type: 'channel' });
}

/**
 * Cancel an active channel without firing damage.
 */
export function cancelChannel() {
  if (!state.channelState) return;
  state.channelState = null;
  emit('skill:channelCancelled', { skillId: 'charge_up' });
}

/**
 * Respec all skills. Refunds all SP, resets to only Power Strike.
 * @returns {boolean} Success
 */
export function respec() {
  const player = getPlayer();
  if (!player) return false;

  // Determine cost
  const costIndex = Math.min(player.respecCount, RESPEC_COSTS.length - 1);
  const cost = RESPEC_COSTS[costIndex];

  if (player.gold < cost) return false;

  // Calculate SP refund
  let refundedSP = 0;
  for (const [skillId, level] of Object.entries(player.unlockedSkills)) {
    const skillDef = SKILLS[skillId];
    if (!skillDef) continue;
    refundedSP += skillDef.unlockCost;
    refundedSP += (level - 1) * skillDef.upgradeCost;
  }

  // Deduct gold
  player.gold -= cost;
  player.totalGoldSpent += cost;

  // Unsubscribe all passives before clearing
  for (const skillId of player.equippedPassive) {
    if (skillId) {
      const handler = PASSIVE_HANDLERS[skillId];
      if (handler?.onUnequip) handler.onUnequip(skillId);
    }
  }

  // Reset skills
  player.skillPoints += refundedSP;
  player.unlockedSkills = { 'power_strike': 1 };
  player.equippedActive = ['power_strike', null, null, null];
  player.equippedPassive = [null, null, null];
  player.skillCooldowns = {};

  // Clear transient state
  state.activeBuffs = {};
  state.hitModifier = null;
  state.clickModifiers = {};
  state.toggleStates = {};
  state.channelState = null;
  state.playerShield = null;
  state.passiveStates = {};

  player.respecCount++;

  invalidateStatCache();
  emit('skill:respecced', { refundedSP, cost, respecCount: player.respecCount });
  emit('player:statsChanged', {});
  return true;
}

// --- Passive Skill Handlers ---

const passiveHandlerRefs = {}; // { skillId: [{ event, fn }, ...] }

const PASSIVE_HANDLERS = {
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
          invalidateStatCache();
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
      invalidateStatCache();
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

function cleanupPassive(skillId) {
  const refs = passiveHandlerRefs[skillId];
  if (refs) {
    for (const { event, fn } of refs) {
      off(event, fn);
    }
    delete passiveHandlerRefs[skillId];
  }
}

function initPassives() {
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

// --- Momentum Click Handler ---

function onCombatClickMomentum() {
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

// --- Event Handlers ---

function onPlayerDied() {
  // Clear buffs — emit individual events so UI can react
  for (const skillId of Object.keys(state.activeBuffs)) {
    emit('skill:buffExpired', { skillId });
  }
  state.activeBuffs = {};

  // Clear hit modifier
  if (state.hitModifier) {
    state.hitModifier = null;
  }

  // Clear click modifiers (Precision charges)
  state.clickModifiers = {};

  // Clear toggles (Momentum)
  for (const [skillId, toggle] of Object.entries(state.toggleStates)) {
    if (toggle?.active) {
      emit('skill:toggleOff', { skillId });
    }
  }
  state.toggleStates = {};

  // Cancel channel (Charge Up)
  if (state.channelState) {
    const chId = state.channelState.skillId;
    state.channelState = null;
    emit('skill:channelCancelled', { skillId: chId });
  }

  // Clear shield
  state.playerShield = null;

  // Reset passive runtime states (stacks/tracking, NOT subscriptions)
  if (state.passiveStates['click_mastery']) {
    state.passiveStates['click_mastery'].stacks = 0;
    state.passiveStates['click_mastery'].lastClickTime = 0;
  }
  if (state.passiveStates['combo_artist']) {
    state.passiveStates['combo_artist'].lastSkillId = null;
    state.passiveStates['combo_artist'].lastSkillTime = 0;
  }

  invalidateStatCache();
}

function onLevelUp({ newLevel }) {
  const player = getPlayer();
  if (!player) return;

  if (newLevel % SP_PER_LEVEL_INTERVAL === 0) {
    player.skillPoints += 1;
    player.totalSPEarned += 1;
    emit('sp:gained', { amount: 1, total: player.skillPoints, source: 'level' });
  }
}

// --- Tick Update ---

export function update(dt) {
  const player = getPlayer();
  if (!player) return;

  // Tick-based cooldown decrements
  for (const skillId in player.skillCooldowns) {
    if (player.skillCooldowns[skillId] <= 0) continue;
    player.skillCooldowns[skillId] -= dt;

    if (player.skillCooldowns[skillId] <= 0) {
      player.skillCooldowns[skillId] = 0;

      if (!cooldownReadyNotified.has(skillId)) {
        cooldownReadyNotified.add(skillId);
        emit('skill:cooldownReady', { skillId });
      }
    }
  }

  // Tick buffs (map-based): drain effects, then expire
  for (const [skillId, buff] of Object.entries(state.activeBuffs)) {
    // Adrenaline Rush: drain energy each tick
    if (skillId === 'adrenaline_rush' && buff.effects.drainRate) {
      const drain = buff.effects.drainRate * dt;
      player.energy = Math.max(0, player.energy - drain);
      emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });
    }

    buff.remaining -= dt;
    if (buff.remaining <= 0) {
      delete state.activeBuffs[skillId];
      invalidateStatCache();
      emit('skill:buffExpired', { skillId });
      emit('skill:effectEnded', { skillId, type: 'buff' });
    }
  }

  // Expire player shield
  if (state.playerShield) {
    state.playerShield.remaining -= dt;
    if (state.playerShield.remaining <= 0) {
      state.playerShield = null;
      emit('skill:effectTriggered', { effect: 'shieldExpired' });
      emit('skill:effectEnded', { skillId: 'shield_bash', type: 'shield' });
    }
  }

  // Channel auto-fire: release automatically when channelMax is reached (only in charging phase)
  if (state.channelState && state.channelState.phase === 'charging') {
    const chElapsed = (performance.now() - state.channelState.startTime) / 1000;
    if (chElapsed >= state.channelState.channelMax) {
      releaseChannel();
    }
  }

  // Momentum toggle: energy drain + stack decay
  const momentum = state.toggleStates['momentum'];
  if (momentum && momentum.active) {
    const stats = computeStats ? computeStats() : {};
    const costReduction = stats.skillEnergyCost || 0;
    const effectiveDrain = momentum.drainPerSec * (1 - costReduction);
    player.energy = Math.max(0, player.energy - effectiveDrain * dt);
    emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });

    if (player.energy <= 0) {
      state.toggleStates['momentum'] = { active: false, stacks: 0, lastClickTime: 0 };
      invalidateStatCache();
      emit('skill:toggleOff', { skillId: 'momentum' });
      emit('skill:effectEnded', { skillId: 'momentum', type: 'toggle' });
    } else {
      const now = performance.now();
      if (momentum.lastClickTime > 0) {
        const gap = (now - momentum.lastClickTime) / 1000;
        if (gap > momentum.decayTimer && momentum.stacks > 0) {
          momentum.stacks = 0;
          invalidateStatCache();
          emit('skill:effectTriggered', { effect: 'momentumDecay' });
        }
      }
    }
  }
}

// --- Initialization ---

/**
 * @param {Object} deps
 * @param {Function} deps.getComputedStats
 * @param {Function} deps.damagePlayer
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
  hurtPlayer = deps.damagePlayer;

  on('player:levelUp', onLevelUp);
  on('player:died', onPlayerDied);
  on('combat:click', onCombatClickMomentum);

  // Cancel channel on tab hide (performance.now() would inflate elapsed time)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.channelState) {
      cancelChannel();
    }
  });

  // Re-subscribe passives on game load
  initPassives();
}

/**
 * skills.js - Skill System Core Engine
 *
 * Owns: SP tracking, unlock/upgrade, cooldowns (tick-based), buff management,
 *       active/passive equip/unequip, channel/toggle tick logic, respec.
 * Delegates: effect execution to skill-effects.js, passive lifecycle to skill-passives.js.
 * Listens to: player:levelUp, player:died, visibilitychange
 * Emits: skill:unlocked, skill:upgraded, skill:used, skill:equipped,
 *        skill:unequipped, skill:buffApplied, skill:buffExpired,
 *        skill:cooldownReady, sp:gained, player:statsChanged,
 *        skill:channelRelease, skill:channelCancelled, skill:effectEnded
 *
 * @see docs/design/skill-system-v2.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';
import {
  ACTIVE_SKILL_SLOTS, PASSIVE_SKILL_SLOTS,
  SP_PER_LEVEL_INTERVAL, SP_UPGRADE_COST, RESPEC_COSTS,
  SKILL_SWAP_COOLDOWN_PENALTY, BASE_SKILL_MAX_LEVEL
} from '../data/constants.js';
import { beyondMaxSkillMultiplier } from '../data/balance.js';
import { EFFECT_HANDLERS, initEffects, onCombatClickMomentum } from './skill-effects.js';
import { PASSIVE_HANDLERS, initPassives } from './skill-passives.js';

// Dependency injection — set during init()
let computeStats = null;
let hurtPlayer = null;
let invalidateStats = null; // Injected: player.invalidateStatCache
let getItemSkillLevelBonus = null; // Injected: items.getItemSkillLevelBonus

// Track cooldown-ready notifications to avoid spam
const cooldownReadyNotified = new Set();

// --- Public API ---

/**
 * Get effective skill level = base level + item bonuses.
 * @param {string} skillId
 * @returns {number} Effective level (0 if not unlocked)
 */
export function getEffectiveSkillLevel(skillId) {
  const player = getPlayer();
  const baseLevel = player.unlockedSkills[skillId];
  if (baseLevel === undefined) return 0;
  const bonusLevels = getItemSkillLevelBonus ? getItemSkillLevelBonus(skillId) : 0;
  return baseLevel + bonusLevels;
}

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

  // Use effective level (base + item bonuses)
  const effectiveLevel = getEffectiveSkillLevel(skillId);
  const maxLevel = skillDef.maxLevel || BASE_SKILL_MAX_LEVEL;
  const cappedLevel = Math.min(effectiveLevel, maxLevel);
  const levelData = skillDef.levels[cappedLevel];
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

  // Beyond-max skill multiplier (item bonuses pushing above max level)
  const bmMult = beyondMaxSkillMultiplier(effectiveLevel, maxLevel);

  // Dispatch to effect handler
  const handler = EFFECT_HANDLERS[skillId];
  if (handler) {
    handler(skillDef, levelData, bmMult);
  }

  // Status effect application (Phase 5)
  if (skillDef.statusEffect) {
    if (state.hitModifier && state.hitModifier.skillId === skillId) {
      // Next-click skills: attach statusEffect to hitModifier (combat.js applies on hit)
      state.hitModifier.statusEffect = skillDef.statusEffect;
    } else if (skillDef.mechanic === 'instant') {
      // Instant skills: roll and apply now (damage is immediate)
      const se = skillDef.statusEffect;
      if (state.currentMonster && state.combatState === 'active' && Math.random() < se.chance) {
        const stats = computeStats ? computeStats() : {};
        emit('statusEffect:tryApply', {
          target: 'monster',
          effectId: se.type,
          stacks: se.stacks || 1,
          source: skillId,
          sourceAttack: stats.attack || 0,
          sourceMagicPower: stats.magicPower || 0
        });
      }
    }
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
    invalidateStats();
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
    handler.onEquip(skillId, getEffectiveSkillLevel(skillId));
  }

  invalidateStats();
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
  invalidateStats();
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

  emit('skill:channelRelease', { damage, isCrit, skillId: 'charge_up', damageType: ch.damageType });
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

  invalidateStats();
  emit('skill:respecced', { refundedSP, cost, respecCount: player.respecCount });
  emit('player:statsChanged', {});
  return true;
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

  invalidateStats();
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
      invalidateStats();
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
      invalidateStats();
      emit('skill:toggleOff', { skillId: 'momentum' });
      emit('skill:effectEnded', { skillId: 'momentum', type: 'toggle' });
    } else {
      const now = performance.now();
      if (momentum.lastClickTime > 0) {
        const gap = (now - momentum.lastClickTime) / 1000;
        if (gap > momentum.decayTimer && momentum.stacks > 0) {
          momentum.stacks = 0;
          invalidateStats();
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
 * @param {Function} deps.invalidateStatCache
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
  hurtPlayer = deps.damagePlayer;
  invalidateStats = deps.invalidateStatCache;
  getItemSkillLevelBonus = deps.getItemSkillLevelBonus || null;

  // Initialize extracted modules with shared deps
  initEffects({ invalidateStatCache: deps.invalidateStatCache, cooldownReadyNotified });
  initPassives({ invalidateStatCache: deps.invalidateStatCache, cooldownReadyNotified, getEffectiveSkillLevel });

  on('player:levelUp', onLevelUp);
  on('player:died', onPlayerDied);
  on('combat:click', onCombatClickMomentum);

  // Intent events from UI
  on('skill:requestUse', ({ skillId }) => {
    if (!useSkill(skillId)) {
      const player = getPlayer();
      const remaining = getSkillCooldownRemaining(skillId);
      if (remaining > 0) {
        emit('skill:useFailed', { skillId, reason: 'cooldown' });
      } else {
        emit('skill:useFailed', { skillId, reason: 'energy' });
      }
    }
  });
  on('skill:requestUnlock', ({ skillId }) => unlockSkill(skillId));
  on('skill:requestUpgrade', ({ skillId }) => upgradeSkill(skillId));
  on('skill:requestEquipActive', ({ skillId, slot }) => equipActiveSkill(skillId, slot));
  on('skill:requestUnequipActive', ({ slot }) => unequipActiveSkill(slot));
  on('skill:requestEquipPassive', ({ skillId, slot }) => equipPassiveSkill(skillId, slot));
  on('skill:requestUnequipPassive', ({ slot }) => unequipPassiveSkill(slot));
  on('skill:requestReleaseChannel', () => releaseChannel());
  on('skill:requestRespec', () => respec());

  // Cancel channel on tab hide (performance.now() would inflate elapsed time)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.channelState) {
      cancelChannel();
    }
  });

}

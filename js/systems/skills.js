/**
 * skills.js - Skill System
 *
 * Owns: MP tracking, unlock/upgrade, cooldowns, buff management,
 *       all skill effect handlers, active/passive equip/unequip.
 * Listens to: combat:monsterKilled, player:levelUp, skill:use
 * Emits: skill:unlocked, skill:upgraded, skill:used, skill:equipped,
 *        skill:unequipped, skill:buffApplied, skill:buffExpired,
 *        skill:cooldownReady, skill:directDamage, skill:effectTriggered,
 *        mastery:gained, player:statsChanged, player:hpChanged
 *
 * @see docs/systems/skill.system.md
 * @see docs/data/skills.data.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';
import {
  ACTIVE_SKILL_SLOTS, PASSIVE_SKILL_SLOTS, BASE_SKILL_MAX_LEVEL,
  MASTERY_PER_BOSS, MASTERY_MILESTONES,
  SKILL_UPGRADE_COSTS, SKILL_SWAP_COOLDOWN_PENALTY
} from '../data/constants.js';
import { invalidateStatCache } from './player.js';

// Dependency injection — set during init()
let computeStats = null;
let hurtPlayer = null;

// Track cooldown-ready notifications to avoid spam
const cooldownReadyNotified = new Set();

// --- Effect Handlers ---

const EFFECT_HANDLERS = {
  nextAttackMultiplier(skillDef, levelData) {
    state.nextAttackModifier = {
      skillId: skillDef.id,
      multiplier: levelData.multiplier
    };
  },

  conditionalMultiplier(skillDef, levelData) {
    state.nextAttackModifier = {
      skillId: skillDef.id,
      multiplier: levelData.multiplier,
      condition: { type: 'hpBelow', threshold: levelData.threshold }
    };
  },

  buff(skillDef, levelData) {
    // Remove existing buff from same skill
    state.activeBuffs = state.activeBuffs.filter(b => b.skillId !== skillDef.id);

    const now = Date.now();
    const effects = { ...levelData };
    delete effects.duration;

    state.activeBuffs.push({
      skillId: skillDef.id,
      effects,
      startedAt: now,
      expiresAt: now + levelData.duration
    });

    invalidateStatCache();
    emit('skill:buffApplied', { skillId: skillDef.id, duration: levelData.duration });
  },

  percentDamage(skillDef, levelData) {
    const monster = state.currentMonster;
    if (!monster) return;

    const stats = computeStats();
    const rawDamage = Math.floor(monster.maxHealth * levelData.percent);
    const minDmg = stats.attack * levelData.minMultiplier;
    const maxDmg = stats.attack * levelData.maxMultiplier;
    const damage = Math.max(minDmg, Math.min(rawDamage, maxDmg));

    monster.currentHealth -= damage;
    if (monster.currentHealth < 0) monster.currentHealth = 0;

    emit('skill:directDamage', { skillId: skillDef.id, damage });
  },

  instantHeal(skillDef, levelData) {
    const player = getPlayer();
    const stats = computeStats();
    const healAmount = Math.floor(stats.maxHP * levelData.healPercent);
    const oldHP = player.hp;
    player.hp = Math.min(player.hp + healAmount, player.maxHP);
    const healed = player.hp - oldHP;
    player.statistics.totalHealingDone += healed;
    emit('player:hpChanged', { hp: player.hp, maxHP: player.maxHP });
  },

  monsterFreeze(skillDef, levelData) {
    const monster = state.currentMonster;
    if (!monster) return;

    monster.frozen = true;
    monster.frozenUntil = Date.now() + levelData.duration;
    emit('skill:effectTriggered', { skillId: skillDef.id, effect: 'freeze', duration: levelData.duration });
  },

  shieldBreak(skillDef, levelData) {
    const monster = state.currentMonster;
    if (!monster) return;

    // Break monster shield if present
    if (monster.shield > 0) {
      monster.shield = 0;
      emit('combat:shieldBroken', { monster });
    }

    // Apply buff for bonus damage vs shielded
    const now = Date.now();
    state.activeBuffs = state.activeBuffs.filter(b => b.skillId !== skillDef.id);
    state.activeBuffs.push({
      skillId: skillDef.id,
      effects: { bonusDamage: levelData.bonusDamage },
      startedAt: now,
      expiresAt: now + levelData.duration
    });

    invalidateStatCache();
    emit('skill:buffApplied', { skillId: skillDef.id, duration: levelData.duration });
  },

  grantShield(skillDef, levelData) {
    const stats = computeStats();
    const shieldAmount = Math.floor(stats.maxHP * levelData.shieldPercent);
    state.playerShield = {
      amount: shieldAmount,
      maxAmount: shieldAmount,
      expiresAt: Date.now() + levelData.duration
    };
    emit('skill:effectTriggered', { skillId: skillDef.id, effect: 'shield', amount: shieldAmount });
  },

  timingMode(skillDef, levelData) {
    state.timingMode = {
      skillId: skillDef.id,
      expiresAt: Date.now() + levelData.duration,
      levels: { ...levelData }
    };
    emit('skill:effectTriggered', { skillId: skillDef.id, effect: 'timingMode', duration: levelData.duration });
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

  // Validate: skill unlocked
  if (!player.unlockedSkills.includes(skillId)) return false;

  // Validate: equipped in active slot
  if (!player.equippedActiveSkills.includes(skillId)) return false;

  const skillDef = SKILLS[skillId];
  if (!skillDef || skillDef.type !== 'active') return false;

  const skillState = player.skills[skillId];
  if (!skillState) return false;

  // Validate: not on cooldown
  if (getSkillCooldownRemaining(skillId) > 0) return false;

  // Validate: enough energy
  if (player.energy < skillDef.energyCost) return false;

  // Deduct energy
  player.energy -= skillDef.energyCost;
  emit('energy:changed', { energy: player.energy, maxEnergy: player.maxEnergy });

  // Set last used for cooldown tracking
  skillState.lastUsed = Date.now();
  cooldownReadyNotified.delete(skillId);

  // Get level data
  const levelData = skillDef.levels[skillState.level];
  if (!levelData) return false;

  // Dispatch to effect handler
  const handler = EFFECT_HANDLERS[skillDef.effectType];
  if (handler) {
    handler(skillDef, levelData);
  }

  emit('skill:used', { skillId, effectType: skillDef.effectType });
  return true;
}

/**
 * Unlock a skill with MP.
 * @param {string} skillId
 * @returns {boolean} Success
 */
export function unlockSkill(skillId) {
  const player = getPlayer();
  if (!player) return false;

  if (player.unlockedSkills.includes(skillId)) return false;

  const skillDef = SKILLS[skillId];
  if (!skillDef) return false;

  const cost = skillDef.unlockCost;
  if (player.masteryPoints < cost) return false;

  player.masteryPoints -= cost;
  player.masterySpent += cost;
  player.unlockedSkills.push(skillId);
  player.skills[skillId] = { level: 1, lastUsed: null };

  emit('skill:unlocked', { skillId, mpRemaining: player.masteryPoints });
  return true;
}

/**
 * Upgrade a skill with MP.
 * @param {string} skillId
 * @returns {boolean} Success
 */
export function upgradeSkill(skillId) {
  const player = getPlayer();
  if (!player) return false;

  if (!player.unlockedSkills.includes(skillId)) return false;

  const skillState = player.skills[skillId];
  if (!skillState) return false;

  if (skillState.level >= BASE_SKILL_MAX_LEVEL) return false;

  const costIndex = skillState.level - 1; // level 1 -> index 0 -> cost to reach level 2
  const cost = SKILL_UPGRADE_COSTS[costIndex];
  if (player.masteryPoints < cost) return false;

  player.masteryPoints -= cost;
  player.masterySpent += cost;
  skillState.level++;

  // If skill is equipped, invalidate stat cache
  if (player.equippedPassiveSkills.includes(skillId) || player.equippedActiveSkills.includes(skillId)) {
    invalidateStatCache();
  }

  emit('skill:upgraded', { skillId, newLevel: skillState.level, mpRemaining: player.masteryPoints });
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
  if (!player.unlockedSkills.includes(skillId)) return false;

  // Already equipped in this slot
  if (player.equippedActiveSkills[slotIndex] === skillId) return false;

  // Remove from old slot if equipped elsewhere
  const oldSlot = player.equippedActiveSkills.indexOf(skillId);
  if (oldSlot !== -1) {
    player.equippedActiveSkills[oldSlot] = null;
  }

  // Unequip whatever is in the target slot
  const displaced = player.equippedActiveSkills[slotIndex];
  if (displaced) {
    emit('skill:unequipped', { skillId: displaced, slot: slotIndex, type: 'active' });
  }

  player.equippedActiveSkills[slotIndex] = skillId;

  // Apply swap cooldown penalty
  const skillState = player.skills[skillId];
  if (skillState) {
    const penaltyMs = skillDef.cooldown * SKILL_SWAP_COOLDOWN_PENALTY;
    skillState.lastUsed = Date.now() - skillDef.cooldown + penaltyMs;
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

  const skillId = player.equippedActiveSkills[slotIndex];
  if (!skillId) return false;

  player.equippedActiveSkills[slotIndex] = null;
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
  if (!player.unlockedSkills.includes(skillId)) return false;

  if (player.equippedPassiveSkills[slotIndex] === skillId) return false;

  // Remove from old slot if equipped elsewhere
  const oldSlot = player.equippedPassiveSkills.indexOf(skillId);
  if (oldSlot !== -1) {
    player.equippedPassiveSkills[oldSlot] = null;
  }

  // Unequip whatever is in the target slot
  const displaced = player.equippedPassiveSkills[slotIndex];
  if (displaced) {
    emit('skill:unequipped', { skillId: displaced, slot: slotIndex, type: 'passive' });
  }

  player.equippedPassiveSkills[slotIndex] = skillId;
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

  const skillId = player.equippedPassiveSkills[slotIndex];
  if (!skillId) return false;

  player.equippedPassiveSkills[slotIndex] = null;
  invalidateStatCache();
  emit('skill:unequipped', { skillId, slot: slotIndex, type: 'passive' });
  emit('player:statsChanged', {});
  return true;
}

/**
 * Get remaining cooldown for a skill in ms.
 * @param {string} skillId
 * @returns {number} Remaining ms, 0 if ready
 */
export function getSkillCooldownRemaining(skillId) {
  const player = getPlayer();
  if (!player) return 0;

  const skillDef = SKILLS[skillId];
  const skillState = player.skills[skillId];
  if (!skillDef || !skillState || !skillState.lastUsed) return 0;

  const elapsed = Date.now() - skillState.lastUsed;
  const remaining = skillDef.cooldown - elapsed;
  return Math.max(0, remaining);
}

/**
 * Get all currently active buffs.
 * @returns {Array} Active buff list
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
  return state.activeBuffs.some(b => b.skillId === skillId);
}

// --- Event Handlers ---

function onMonsterKilled(data) {
  if (!data.isBoss) return;

  // Boss kills handled by zones.js for MP (first kill only)
  // This handler can be used for additional skill-related boss rewards
}

function onLevelUp({ newLevel }) {
  const player = getPlayer();
  if (!player) return;

  const mp = MASTERY_MILESTONES[newLevel];
  if (mp) {
    player.masteryPoints += mp;
    emit('mastery:gained', { amount: mp, total: player.masteryPoints, source: 'level' });
  }
}

// --- Tick Update ---

export function update(dt) {
  const now = Date.now();

  // Expire buffs
  const expiredBuffs = [];
  state.activeBuffs = state.activeBuffs.filter(buff => {
    if (now >= buff.expiresAt) {
      expiredBuffs.push(buff);
      return false;
    }
    return true;
  });

  if (expiredBuffs.length > 0) {
    invalidateStatCache();
    for (const buff of expiredBuffs) {
      emit('skill:buffExpired', { skillId: buff.skillId });
    }
  }

  // Expire player shield
  if (state.playerShield && now >= state.playerShield.expiresAt) {
    state.playerShield = null;
    emit('skill:effectTriggered', { effect: 'shieldExpired' });
  }

  // Expire timing mode
  if (state.timingMode && now >= state.timingMode.expiresAt) {
    state.timingMode = null;
    emit('skill:effectTriggered', { effect: 'timingModeExpired' });
  }

  // Unfreeze monster
  const monster = state.currentMonster;
  if (monster && monster.frozen && monster.frozenUntil && now >= monster.frozenUntil) {
    monster.frozen = false;
    monster.frozenUntil = null;
    emit('skill:effectTriggered', { effect: 'unfrozen' });
  }

  // Check cooldown-ready notifications for equipped active skills
  const player = getPlayer();
  if (player) {
    for (const skillId of player.equippedActiveSkills) {
      if (!skillId) continue;
      if (cooldownReadyNotified.has(skillId)) continue;
      const remaining = getSkillCooldownRemaining(skillId);
      if (remaining === 0) {
        const skillState = player.skills[skillId];
        if (skillState && skillState.lastUsed !== null) {
          cooldownReadyNotified.add(skillId);
          emit('skill:cooldownReady', { skillId });
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

  on('combat:monsterKilled', onMonsterKilled);
  on('player:levelUp', onLevelUp);
}

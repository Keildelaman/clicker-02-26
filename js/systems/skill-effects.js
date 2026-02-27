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
import { BARRAGE_HIT_DELAY, DAMAGE_TYPES } from '../data/constants.js';

// Dependency injection — set during initEffects()
let invalidateStats = null;
let notifyCooldownReady = null;
let addEnergy = null;
let computeStats = null;

/**
 * Initialize effect handler dependencies.
 * @param {Object} deps
 * @param {Function} deps.invalidateStatCache
 * @param {Function} deps.notifyCooldownReady
 * @param {Function} deps.addEnergy
 * @param {Function} deps.getComputedStats
 */
export function initEffects(deps) {
  invalidateStats = deps.invalidateStatCache;
  notifyCooldownReady = deps.notifyCooldownReady;
  addEnergy = deps.addEnergy;
  computeStats = deps.getComputedStats || null;
}

/**
 * Helper: get current monster status effect stacks.
 * @param {string} effectId
 * @returns {number} Stack count (0 if not present)
 */
function getMonsterStatusStacks(effectId) {
  const effect = state.monsterStatusEffects.find(e => e.id === effectId);
  return effect ? (effect.stacks || 1) : 0;
}

/**
 * Helper: remove a monster status effect by ID.
 * @param {string} effectId
 * @returns {Object|null} Removed effect or null
 */
function removeMonsterStatus(effectId) {
  const idx = state.monsterStatusEffects.findIndex(e => e.id === effectId);
  if (idx === -1) return null;
  const effect = state.monsterStatusEffects[idx];
  state.monsterStatusEffects.splice(idx, 1);

  // Clean up mechanical state
  const monster = state.currentMonster;
  if (monster) {
    if (effectId === 'freeze') {
      monster.frozen = false;
      emit('statusEffect:unfrozen', { target: 'monster' });
    }
    if (effectId === 'slow') {
      monster.slowed = false;
      monster.slowStrength = 0;
      emit('statusEffect:slowEnded', { target: 'monster' });
    }
  }

  emit('statusEffect:expired', { target: 'monster', effectId });
  return effect;
}

// --- Effect Handlers ---
// Keyed by skill ID. Dispatched by useSkill() after energy/cooldown checks.

export const EFFECT_HANDLERS = {
  // Hit modifier: next click deals multiplier% damage
  power_strike(skillDef, levelData, bmMult) {
    state.hitModifier = {
      skillId: 'power_strike',
      multiplier: (levelData.damage * bmMult) / 100,
      damageType: skillDef.damageType
    };
    emit('skill:hitModifierSet', { skillId: 'power_strike' });
  },

  // Hit modifier: conditional multiplier based on monster HP%
  execute(skillDef, levelData, bmMult) {
    state.hitModifier = {
      skillId: 'execute',
      type: 'execute',
      threshold: levelData.threshold / 100,
      strongMult: (levelData.strongMult * bmMult) / 100,
      weakMult: (levelData.weakMult * bmMult) / 100,
      damageType: skillDef.damageType
    };
    emit('skill:hitModifierSet', { skillId: 'execute' });
  },

  // Hit modifier: normal click + bonus %maxHP (ignores armor)
  shatter(skillDef, levelData, bmMult) {
    state.hitModifier = {
      skillId: 'shatter',
      type: 'shatter',
      multiplier: 1,
      percentHP: (levelData.percentHP * bmMult) / 100,
      damageType: skillDef.damageType
    };
    emit('skill:hitModifierSet', { skillId: 'shatter' });
  },

  // Click modifier: N guaranteed crit clicks
  precision(skillDef, levelData, bmMult) {
    const charges = Math.floor(levelData.charges * bmMult);
    state.clickModifiers['precision'] = { charges };
    emit('skill:effectTriggered', { effect: 'precision', charges });
  },

  // Instant multi-hit damage (staggered)
  barrage(skillDef, levelData, bmMult) {
    emit('skill:instantDamage', {
      hits: levelData.hits,
      damagePerHit: Math.floor(levelData.damagePerHit * bmMult),
      skillId: 'barrage',
      hitDelay: BARRAGE_HIT_DELAY,
      damageType: skillDef.damageType
    });
  },

  // Instant single-hit damage
  arcane_bolt(skillDef, levelData, bmMult) {
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: Math.floor(levelData.damage * bmMult),
      skillId: 'arcane_bolt',
      damageType: skillDef.damageType
    });
  },

  // Instant damage (overkill carry now handled generically by combat system)
  chain_lightning(skillDef, levelData, bmMult) {
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: Math.floor(levelData.damage * bmMult),
      skillId: 'chain_lightning',
      damageType: skillDef.damageType
    });
  },

  // Instant damage + player shield
  shield_bash(skillDef, levelData, bmMult) {
    const player = getPlayer();
    const shieldAmount = Math.floor(player.maxHP * (levelData.shieldPercent * bmMult / 100));
    state.playerShield = {
      amount: shieldAmount,
      maxAmount: shieldAmount,
      remaining: levelData.shieldDuration
    };
    emit('skill:effectTriggered', { effect: 'shieldGranted', amount: shieldAmount });
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: Math.floor(levelData.damage * bmMult),
      skillId: 'shield_bash',
      damageType: skillDef.damageType
    });
  },

  // Timed buff: multi-hit per click
  flurry(skillDef, levelData, bmMult) {
    state.activeBuffs['flurry'] = {
      remaining: levelData.duration,
      effects: { hitsPerClick: Math.floor(levelData.hitsPerClick * bmMult) }
    };
    emit('skill:buffApplied', { skillId: 'flurry', duration: levelData.duration });
  },

  // Timed buff: crit chance = energy%, drains energy per second
  adrenaline_rush(skillDef, levelData, bmMult) {
    state.activeBuffs['adrenaline_rush'] = {
      remaining: levelData.duration,
      effects: { drainRate: levelData.drainRate, critFromEnergy: true }
    };
    emit('skill:buffApplied', { skillId: 'adrenaline_rush', duration: levelData.duration });
  },

  // Instant energy grant
  energy_surge(skillDef, levelData, bmMult) {
    const gained = addEnergy(Math.floor(levelData.energyGained * bmMult));
    emit('skill:effectTriggered', { effect: 'energySurge', gained });
  },

  // Reduce all other equipped skill cooldowns
  overcharge(skillDef, levelData, bmMult) {
    const player = getPlayer();
    const cdr = levelData.cdrAmount * bmMult;
    for (const equippedId of player.equippedActive) {
      if (!equippedId || equippedId === 'overcharge') continue;
      if ((player.skillCooldowns[equippedId] || 0) > 0) {
        player.skillCooldowns[equippedId] = Math.max(
          player.skillCooldowns[equippedId] - cdr, 0
        );
        if (player.skillCooldowns[equippedId] <= 0) {
          player.skillCooldowns[equippedId] = 0;
          notifyCooldownReady(equippedId);
        }
      }
    }
    emit('skill:effectTriggered', { effect: 'overcharge', cdrAmount: cdr });
  },

  // HP cost -> energy gain
  life_tap(skillDef, levelData, bmMult) {
    const player = getPlayer();
    const hpCost = Math.floor(player.hp * (levelData.hpCostPercent / 100));
    if (hpCost > 0) {
      player.hp = Math.max(1, player.hp - hpCost);
      emit('player:hpChanged', { hp: player.hp, maxHP: player.maxHP });
    }
    const gained = addEnergy(Math.floor(levelData.energyGained * bmMult));
    emit('skill:effectTriggered', { effect: 'lifeTap', hpCost, energyGained: gained });
  },

  // Channel: click to queue, hold monster to charge, release for scaled damage
  charge_up(skillDef, levelData, bmMult) {
    state.channelState = {
      phase: 'queued',
      skillId: 'charge_up',
      startTime: 0,
      channelMin: levelData.channelMin,
      channelMax: levelData.channelMax,
      minMult: levelData.minMult * bmMult,
      maxMult: levelData.maxMult * bmMult,
      damageType: skillDef.damageType
    };
    emit('skill:channelStarted', { skillId: 'charge_up', phase: 'queued' });
  },

  // Toggle: builds stacks on fast clicks, drains energy/sec
  momentum(skillDef, levelData, bmMult) {
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
        dmgPerStack: levelData.dmgPerStack * bmMult,
        maxStacks: Math.floor(levelData.maxStacks * bmMult)
      };
      emit('skill:toggleOn', { skillId: 'momentum' });
    }
  },

  // =============================================
  // STATUS EFFECT SKILL HANDLERS (16 new)
  // =============================================

  // --- BLEED ---

  // Instant damage, guaranteed 2 bleed stacks, bonus per existing bleed stack
  lacerate(skillDef, levelData, bmMult) {
    const stats = computeStats ? computeStats() : {};
    const existingStacks = getMonsterStatusStacks('bleed');
    const bonusMult = 1 + (existingStacks * (levelData.bonusPerStack / 100));
    const totalDamage = Math.floor(levelData.damage * bmMult * bonusMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'lacerate',
      damageType: skillDef.damageType
    });
    // Guaranteed bleed stacks applied via statusEffect on skillDef (handled by useSkill)
  },

  // Consume ALL bleed stacks, deal per-stack damage
  rupture(skillDef, levelData, bmMult) {
    const bleedEffect = state.monsterStatusEffects.find(e => e.id === 'bleed');
    const stacks = bleedEffect ? bleedEffect.stacks : 0;
    if (stacks <= 0) return;
    // Consume bleed
    removeMonsterStatus('bleed');
    const totalDamage = Math.floor(levelData.damagePerStack * bmMult * stacks);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'rupture',
      damageType: skillDef.damageType
    });
    emit('skill:effectTriggered', { effect: 'rupture', stacksConsumed: stacks, totalDamage });
  },

  // --- POISON ---

  // Buff: all hits apply 1 poison stack during duration
  envenom(skillDef, levelData, bmMult) {
    state.activeBuffs['envenom'] = {
      remaining: levelData.duration,
      effects: { poisonOnHit: true }
    };
    emit('skill:buffApplied', { skillId: 'envenom', duration: levelData.duration });
  },

  // Deal damage + bonus per poison stack (does NOT consume)
  venomous_surge(skillDef, levelData, bmMult) {
    const poisonStacks = getMonsterStatusStacks('poison');
    const totalDamage = Math.floor((levelData.baseDamage + levelData.bonusPerStack * poisonStacks) * bmMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'venomous_surge',
      damageType: skillDef.damageType
    });
    emit('skill:effectTriggered', { effect: 'venomous_surge', stacks: poisonStacks });
  },

  // Consume ALL poison, deal per-stack damage, re-apply N stacks
  noxious_burst(skillDef, levelData, bmMult) {
    const poisonEffect = state.monsterStatusEffects.find(e => e.id === 'poison');
    const stacks = poisonEffect ? poisonEffect.stacks : 0;
    if (stacks <= 0) return;
    // Consume poison
    removeMonsterStatus('poison');
    const totalDamage = Math.floor(levelData.damagePerStack * bmMult * stacks);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'noxious_burst',
      damageType: skillDef.damageType
    });
    // Re-apply stacks
    const stats = computeStats ? computeStats() : {};
    emit('statusEffect:tryApply', {
      target: 'monster',
      effectId: 'poison',
      stacks: levelData.reapplyStacks,
      source: 'noxious_burst',
      sourceAttack: stats.attack || 0,
      sourceMagicPower: stats.magicPower || 0
    });
    emit('skill:effectTriggered', { effect: 'noxious_burst', stacksConsumed: stacks, reapplied: levelData.reapplyStacks });
  },

  // --- BURN ---

  // Buff: all attacks apply burn and refresh burn duration
  immolate(skillDef, levelData, bmMult) {
    state.activeBuffs['immolate'] = {
      remaining: levelData.duration,
      effects: { burnOnHit: true }
    };
    emit('skill:buffApplied', { skillId: 'immolate', duration: levelData.duration });
  },

  // Instant magic damage. If burning: supercharge next burn tick
  inferno(skillDef, levelData, bmMult) {
    const totalDamage = Math.floor(levelData.damage * bmMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'inferno',
      damageType: skillDef.damageType
    });
    // If monster has burn, set supercharged tick multiplier
    const burnEffect = state.monsterStatusEffects.find(e => e.id === 'burn');
    if (burnEffect) {
      state.burnTickMultiplier = levelData.burnTickMult * bmMult;
      emit('skill:effectTriggered', { effect: 'inferno_supercharge', mult: state.burnTickMultiplier });
    }
  },

  // Requires Burn. Consume burn, deal magic damage, apply scorched debuff (magic vuln)
  combustion(skillDef, levelData, bmMult) {
    const burnEffect = state.monsterStatusEffects.find(e => e.id === 'burn');
    if (!burnEffect) return;
    // Consume burn
    removeMonsterStatus('burn');
    const totalDamage = Math.floor(levelData.damage * bmMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'combustion',
      damageType: skillDef.damageType
    });
    // Apply scorched debuff (magic vulnerability)
    const monster = state.currentMonster;
    if (monster) {
      monster.scorched = {
        remaining: levelData.vulnDuration,
        magicVuln: (levelData.magicVuln * bmMult) / 100
      };
    }
    emit('skill:effectTriggered', { effect: 'combustion_scorched', magicVuln: levelData.magicVuln * bmMult, duration: levelData.vulnDuration });
  },

  // --- SLOW ---

  // Instant magic damage, guaranteed slow. If already slowed: bonus slow + energy refund
  frostbolt(skillDef, levelData, bmMult) {
    const totalDamage = Math.floor(levelData.damage * bmMult);
    const wasSlowed = getMonsterStatusStacks('slow') > 0;
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'frostbolt',
      damageType: skillDef.damageType
    });
    // Slow applied via statusEffect on skillDef (handled by useSkill)
    // If already slowed: increase slow strength + refund energy
    if (wasSlowed) {
      const monster = state.currentMonster;
      if (monster && monster.slowed) {
        monster.slowStrength = Math.min(0.95, monster.slowStrength + (levelData.bonusSlowStr / 100) * bmMult);
      }
      const refund = Math.floor(levelData.energyCost * (levelData.refundPercent / 100));
      if (refund > 0) addEnergy(refund);
      emit('skill:effectTriggered', { effect: 'frostbolt_refund', refund, bonusSlowStr: levelData.bonusSlowStr });
    }
  },

  // Requires Slow. Deal damage + extend ALL status durations
  permafrost(skillDef, levelData, bmMult) {
    const totalDamage = Math.floor(levelData.damage * bmMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'permafrost',
      damageType: skillDef.damageType
    });
    // Extend all active status effect durations
    const extension = levelData.durationExtend * bmMult;
    for (const effect of state.monsterStatusEffects) {
      effect.remaining += extension;
    }
    emit('skill:effectTriggered', { effect: 'permafrost_extend', extension, effectsExtended: state.monsterStatusEffects.length });
  },

  // Requires Slow. Convert slow to freeze + deal damage
  deep_chill(skillDef, levelData, bmMult) {
    const totalDamage = Math.floor(levelData.damage * bmMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'deep_chill',
      damageType: skillDef.damageType
    });
    // Consume slow, apply freeze
    removeMonsterStatus('slow');
    const stats = computeStats ? computeStats() : {};
    emit('statusEffect:tryApply', {
      target: 'monster',
      effectId: 'freeze',
      stacks: 1,
      source: 'deep_chill',
      sourceAttack: stats.attack || 0,
      sourceMagicPower: stats.magicPower || 0
    });
    emit('skill:effectTriggered', { effect: 'deep_chill_convert' });
  },

  // --- FREEZE ---

  // Guaranteed freeze with custom duration + magic damage
  frost_nova(skillDef, levelData, bmMult) {
    const totalDamage = Math.floor(levelData.damage * bmMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'frost_nova',
      damageType: skillDef.damageType
    });
    // Apply freeze with custom duration
    const stats = computeStats ? computeStats() : {};
    emit('statusEffect:tryApply', {
      target: 'monster',
      effectId: 'freeze',
      stacks: 1,
      source: 'frost_nova',
      sourceAttack: stats.attack || 0,
      sourceMagicPower: stats.magicPower || 0,
      customDuration: levelData.freezeDuration * bmMult
    });
  },

  // Requires Freeze. Consume freeze, deal massive damage, apply slow
  glacial_shatter(skillDef, levelData, bmMult) {
    // Consume freeze
    removeMonsterStatus('freeze');
    const totalDamage = Math.floor(levelData.damage * bmMult);
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'glacial_shatter',
      damageType: skillDef.damageType
    });
    // Apply slow with custom duration
    const stats = computeStats ? computeStats() : {};
    emit('statusEffect:tryApply', {
      target: 'monster',
      effectId: 'slow',
      stacks: 1,
      source: 'glacial_shatter',
      sourceAttack: stats.attack || 0,
      sourceMagicPower: stats.magicPower || 0,
      customDuration: levelData.slowDuration * bmMult
    });
    emit('skill:effectTriggered', { effect: 'glacial_shatter' });
  },

  // --- CROSS-STATUS ---

  // Next click: hit modifier that applies bleed + poison + slow
  plague_touch(skillDef, levelData, bmMult) {
    state.hitModifier = {
      skillId: 'plague_touch',
      multiplier: (levelData.damage * bmMult) / 100,
      damageType: skillDef.damageType,
      multiStatus: [
        { type: 'bleed', stacks: levelData.bleedStacks },
        { type: 'poison', stacks: levelData.poisonStacks },
        { type: 'slow', stacks: 1 }
      ]
    };
    emit('skill:hitModifierSet', { skillId: 'plague_touch' });
  },

  // Buff: dying monsters transfer DoTs to next spawn
  pandemic(skillDef, levelData, bmMult) {
    state.activeBuffs['pandemic'] = {
      remaining: levelData.duration,
      effects: { transferPercent: (levelData.transferPercent * bmMult) / 100 }
    };
    emit('skill:buffApplied', { skillId: 'pandemic', duration: levelData.duration });
  },

  // Consume ALL status effects. Deal per-effect + per-stack damage.
  cataclysm(skillDef, levelData, bmMult) {
    const effects = [...state.monsterStatusEffects];
    let totalStacks = 0;
    const effectCount = effects.length;
    // Consume all effects
    for (const effect of effects) {
      totalStacks += (effect.stacks || 1);
      removeMonsterStatus(effect.id);
    }
    const totalDamage = Math.floor(
      (levelData.damagePerEffect * bmMult * effectCount) +
      (levelData.stackBonus * bmMult * totalStacks)
    );
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHit: totalDamage,
      skillId: 'cataclysm',
      damageType: skillDef.damageType
    });
    emit('skill:effectTriggered', { effect: 'cataclysm', effectsConsumed: effectCount, stacksConsumed: totalStacks });
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

/**
 * status-effects.js - Status Effect System
 *
 * Manages active status effects on monsters and player.
 * Follows system contract: init(deps), update(dt).
 *
 * Effects: bleed, poison, burn (DoT), slow (action speed), freeze (stun).
 *
 * Owns: Effect application, tick processing, immunity checks,
 *       freeze/slow state on targets, effect expiry.
 * Listens to: statusEffect:tryApply, combat:monsterKilled,
 *             combat:requestImmediateSpawn, combat:monsterSpawned,
 *             combat:bossTimeout, combat:monsterEscaped, player:died
 * Emits: statusEffect:applied, statusEffect:immune, statusEffect:expired,
 *        statusEffect:tick, statusEffect:damageMonster,
 *        statusEffect:frozen, statusEffect:unfrozen,
 *        statusEffect:slowed, statusEffect:slowEnded
 */

import { on, emit } from '../core/event-bus.js';
import { state } from '../core/game-state.js';
import {
  STATUS_EFFECTS, DAMAGE_TYPES, MIN_DAMAGE,
  BLEED_MAX_STACKS, BLEED_DURATION, BLEED_TICK_INTERVAL, BLEED_DAMAGE_TYPE,
  BLEED_DAMAGE_PERCENT,
  POISON_MAX_STACKS, POISON_DURATION, POISON_TICK_INTERVAL, POISON_DAMAGE_TYPE,
  POISON_DAMAGE_PERCENT,
  BURN_DURATION, BURN_TICK_INTERVAL, BURN_DAMAGE_TYPE, BURN_DAMAGE_PERCENT,
  SLOW_DURATION, SLOW_STRENGTH,
  FREEZE_DURATION, FREEZE_REAPPLY_COOLDOWN,
  LEGENDARY_EFFECTS
} from '../data/constants.js';
import { calcDamageReduction, checkStatusImmunity } from '../data/balance.js';

// DI deps
let hurtPlayer = null;

// --- Effect Definitions (static config) ---

const EFFECT_DEFS = {
  [STATUS_EFFECTS.BLEED]: {
    maxStacks: BLEED_MAX_STACKS,
    duration: BLEED_DURATION,
    tickInterval: BLEED_TICK_INTERVAL,
    damageType: BLEED_DAMAGE_TYPE,
    damagePercent: BLEED_DAMAGE_PERCENT,
    statKey: 'attack',
    stacking: true
  },
  [STATUS_EFFECTS.POISON]: {
    maxStacks: POISON_MAX_STACKS,
    duration: POISON_DURATION,
    tickInterval: POISON_TICK_INTERVAL,
    damageType: POISON_DAMAGE_TYPE,
    damagePercent: POISON_DAMAGE_PERCENT,
    statKey: 'attack',
    stacking: true
  },
  [STATUS_EFFECTS.BURN]: {
    maxStacks: 1,
    duration: BURN_DURATION,
    tickInterval: BURN_TICK_INTERVAL,
    damageType: BURN_DAMAGE_TYPE,
    damagePercent: BURN_DAMAGE_PERCENT,
    statKey: 'magicPower',
    stacking: false
  },
  [STATUS_EFFECTS.SLOW]: {
    maxStacks: 1,
    duration: SLOW_DURATION,
    strength: SLOW_STRENGTH,
    stacking: false
  },
  [STATUS_EFFECTS.FREEZE]: {
    maxStacks: 1,
    duration: FREEZE_DURATION,
    reapplyCooldown: FREEZE_REAPPLY_COOLDOWN,
    stacking: false
  }
};

// --- Application Logic ---

// DI dep for passive skill bonus (Plague Doctor)
let getPlagueDoctorBonus = null;

/**
 * Handle incoming status effect application request.
 */
function onTryApply({ target, effectId, stacks = 1, source, sourceAttack = 0, sourceMagicPower = 0, potencyBonus = 0, customDuration }) {
  const def = EFFECT_DEFS[effectId];
  if (!def) return;

  if (target === 'monster') {
    applyToMonster(effectId, def, stacks, source, sourceAttack, sourceMagicPower, potencyBonus, customDuration);
  } else if (target === 'player') {
    applyToPlayer(effectId, def, stacks, source, sourceAttack, sourceMagicPower);
  }
}

/**
 * Apply a status effect to the current monster.
 */
function applyToMonster(effectId, def, stacks, source, sourceAttack, sourceMagicPower, potencyBonus = 0, customDuration) {
  const monster = state.currentMonster;
  if (!monster || state.combatState !== 'active') return;

  // Immunity: shield active or innate immunity
  const immunity = checkStatusImmunity(monster, effectId);
  if (immunity.immune) {
    emit('statusEffect:immune', { target: 'monster', effectId, reason: immunity.reason });
    return;
  }

  // Freeze: check reapply cooldown
  if (effectId === STATUS_EFFECTS.FREEZE && monster.freezeCooldown > 0) {
    emit('statusEffect:immune', { target: 'monster', effectId, reason: 'cooldown' });
    return;
  }

  // Legendary: Venom Lord's Grip — unlimited poison stacks
  let maxStacks = def.maxStacks;
  if (effectId === STATUS_EFFECTS.POISON && state.activeLegendaryEffects?.has('unlimited_poison_stacks')) {
    maxStacks = 9999;
  }

  // Use custom duration if provided (e.g., Frost Nova, Glacial Shatter), else default
  let duration = customDuration || def.duration;

  // Legendary: Shadowmire Cowl — 40% longer status effect durations on monsters
  if (state.activeLegendaryEffects?.has('status_duration_bonus')) {
    duration *= (1 + LEGENDARY_EFFECTS.STATUS_DURATION_BONUS);
  }

  // Plague Doctor passive: bonus status duration
  if (getPlagueDoctorBonus) {
    const pdBonus = getPlagueDoctorBonus();
    if (pdBonus.durationBonus > 0) {
      duration *= (1 + pdBonus.durationBonus / 100);
    }
  }

  // Equipment potency: freeze_duration extends freeze duration
  if (effectId === STATUS_EFFECTS.FREEZE && potencyBonus > 0) {
    duration *= (1 + potencyBonus);
  }

  const effects = state.monsterStatusEffects;
  const existing = effects.find(e => e.id === effectId);

  if (existing) {
    if (def.stacking) {
      existing.stacks = Math.min(existing.stacks + stacks, maxStacks);
      existing.remaining = duration;
    } else {
      existing.remaining = duration;
    }
    emit('statusEffect:applied', {
      target: 'monster', effectId, stacks: existing.stacks, refreshed: true
    });
  } else {
    const effect = {
      id: effectId,
      stacks: Math.min(stacks, maxStacks || 1),
      remaining: duration,
      tickTimer: 0,
      source
    };

    // Snapshot DoT damage at application time, boosted by potency
    if (def.damagePercent) {
      const sourceStat = def.statKey === 'magicPower' ? sourceMagicPower : sourceAttack;
      const potencyMult = 1 + potencyBonus;
      effect.damagePerTick = Math.max(1, Math.floor(sourceStat * (def.damagePercent / 100) * potencyMult));
      effect.damageType = def.damageType;
    }

    effects.push(effect);

    // Immediate mechanical effects
    if (effectId === STATUS_EFFECTS.FREEZE) {
      monster.frozen = true;
      emit('statusEffect:frozen', { target: 'monster' });
    }
    if (effectId === STATUS_EFFECTS.SLOW) {
      monster.slowed = true;
      // Base slow strength + potency bonus from equipment
      monster.slowStrength = def.strength + potencyBonus;
      emit('statusEffect:slowed', { target: 'monster', strength: monster.slowStrength });
    }

    emit('statusEffect:applied', {
      target: 'monster', effectId, stacks: effect.stacks, refreshed: false
    });
  }
}

/**
 * Apply a status effect to the player.
 * (Foundation — activated by monster attacks in Phase 6.)
 */
function applyToPlayer(effectId, def, stacks, source, sourceAttack, sourceMagicPower) {
  const playerTarget = {
    shield: state.playerShield ? state.playerShield.amount : 0,
    statusImmunities: []
  };

  const immunity = checkStatusImmunity(playerTarget, effectId);
  if (immunity.immune) {
    emit('statusEffect:immune', { target: 'player', effectId, reason: immunity.reason });
    return;
  }

  if (effectId === STATUS_EFFECTS.FREEZE && state.playerFreezeCooldown > 0) {
    emit('statusEffect:immune', { target: 'player', effectId, reason: 'cooldown' });
    return;
  }

  const effects = state.playerStatusEffects;
  const existing = effects.find(e => e.id === effectId);

  if (existing) {
    if (def.stacking) {
      existing.stacks = Math.min(existing.stacks + stacks, def.maxStacks);
      existing.remaining = def.duration;
    } else {
      existing.remaining = def.duration;
    }
    emit('statusEffect:applied', {
      target: 'player', effectId, stacks: existing.stacks, refreshed: true
    });
  } else {
    const effect = {
      id: effectId,
      stacks: Math.min(stacks, def.maxStacks || 1),
      remaining: def.duration,
      tickTimer: 0,
      source
    };

    if (def.damagePercent) {
      const sourceStat = def.statKey === 'magicPower' ? sourceMagicPower : sourceAttack;
      effect.damagePerTick = Math.max(1, Math.floor(sourceStat * (def.damagePercent / 100)));
      effect.damageType = def.damageType;
    }

    effects.push(effect);

    if (effectId === STATUS_EFFECTS.FREEZE) {
      state.playerFrozen = true;
      emit('statusEffect:frozen', { target: 'player' });
    }
    if (effectId === STATUS_EFFECTS.SLOW) {
      state.playerSlowed = true;
      state.playerSlowStrength = def.strength;
      emit('statusEffect:slowed', { target: 'player', strength: def.strength });
    }

    emit('statusEffect:applied', {
      target: 'player', effectId, stacks: effect.stacks, refreshed: false
    });
  }
}

// --- Tick Processing ---

/**
 * Process all active monster status effects each frame.
 */
function tickMonsterEffects(dt) {
  const monster = state.currentMonster;
  if (!monster || state.combatState !== 'active') return;

  // Tick freeze reapply cooldown
  if (monster.freezeCooldown > 0) {
    monster.freezeCooldown -= dt;
    if (monster.freezeCooldown < 0) monster.freezeCooldown = 0;
  }

  // Iterate effects — use index on live array so mid-loop clears take effect
  for (let i = state.monsterStatusEffects.length - 1; i >= 0; i--) {
    // Safety: monster may have died from a previous tick in this loop
    if (state.currentMonster !== monster || state.combatState !== 'active') return;

    const effect = state.monsterStatusEffects[i];
    if (!effect) continue;

    const def = EFFECT_DEFS[effect.id];
    effect.remaining -= dt;

    // DoT tick processing
    if (effect.damagePerTick && def.tickInterval) {
      effect.tickTimer += dt;
      while (effect.tickTimer >= def.tickInterval) {
        effect.tickTimer -= def.tickInterval;

        // Re-check monster is still alive (previous tick could have killed it)
        if (state.currentMonster !== monster || state.combatState !== 'active') return;

        let rawDmg = effect.damagePerTick * (effect.stacks || 1);

        // Inferno supercharge: multiply burn tick damage once, then clear
        if (effect.id === STATUS_EFFECTS.BURN && state.burnTickMultiplier > 0) {
          rawDmg = Math.floor(rawDmg * state.burnTickMultiplier);
          state.burnTickMultiplier = 0;
          emit('skill:effectTriggered', { effect: 'inferno_supercharge_consumed' });
        }

        const defense = effect.damageType === DAMAGE_TYPES.MAGIC
          ? (monster.magicResist || 0)
          : (monster.armor || 0);
        const reduction = calcDamageReduction(defense, 0);
        const finalDmg = Math.max(MIN_DAMAGE, Math.floor(rawDmg * (1 - reduction)));

        // Combat.js handles shield absorption, kill detection, and UI events
        emit('statusEffect:damageMonster', {
          damage: finalDmg,
          damageType: effect.damageType,
          effectId: effect.id
        });

        emit('statusEffect:tick', {
          target: 'monster',
          effectId: effect.id,
          damage: finalDmg,
          stacks: effect.stacks
        });
      }
    }

    // Expiry
    if (effect.remaining <= 0) {
      if (effect.id === STATUS_EFFECTS.FREEZE) {
        monster.frozen = false;
        monster.freezeCooldown = EFFECT_DEFS[STATUS_EFFECTS.FREEZE].reapplyCooldown;
        emit('statusEffect:unfrozen', { target: 'monster' });
      }
      if (effect.id === STATUS_EFFECTS.SLOW) {
        monster.slowed = false;
        monster.slowStrength = 0;
        emit('statusEffect:slowEnded', { target: 'monster' });
      }

      emit('statusEffect:expired', { target: 'monster', effectId: effect.id });
      state.monsterStatusEffects.splice(i, 1);
    }
  }
}

/**
 * Process all active player status effects each frame.
 */
function tickPlayerEffects(dt) {
  // Tick freeze reapply cooldown
  if (state.playerFreezeCooldown > 0) {
    state.playerFreezeCooldown -= dt;
    if (state.playerFreezeCooldown < 0) state.playerFreezeCooldown = 0;
  }

  for (let i = state.playerStatusEffects.length - 1; i >= 0; i--) {
    const effect = state.playerStatusEffects[i];
    if (!effect) continue;

    const def = EFFECT_DEFS[effect.id];
    effect.remaining -= dt;

    // DoT tick processing
    if (effect.damagePerTick && def.tickInterval) {
      effect.tickTimer += dt;
      while (effect.tickTimer >= def.tickInterval) {
        effect.tickTimer -= def.tickInterval;

        const rawDmg = effect.damagePerTick * (effect.stacks || 1);
        // Pass raw damage to damagePlayer — it applies player's defense reduction
        if (hurtPlayer) {
          hurtPlayer(rawDmg, `dot:${effect.id}`, effect.damageType);
        }

        emit('statusEffect:tick', {
          target: 'player',
          effectId: effect.id,
          damage: rawDmg,
          stacks: effect.stacks
        });
      }
    }

    // Expiry
    if (effect.remaining <= 0) {
      if (effect.id === STATUS_EFFECTS.FREEZE) {
        state.playerFrozen = false;
        state.playerFreezeCooldown = EFFECT_DEFS[STATUS_EFFECTS.FREEZE].reapplyCooldown;
        emit('statusEffect:unfrozen', { target: 'player' });
      }
      if (effect.id === STATUS_EFFECTS.SLOW) {
        state.playerSlowed = false;
        state.playerSlowStrength = 0;
        emit('statusEffect:slowEnded', { target: 'player' });
      }

      emit('statusEffect:expired', { target: 'player', effectId: effect.id });
      state.playerStatusEffects.splice(i, 1);
    }
  }
}

// --- Cleanup ---

/**
 * Snapshot current DoTs for Pandemic transfer before clearing.
 */
function snapshotForPandemic() {
  const pandemicBuff = state.activeBuffs && state.activeBuffs['pandemic'];
  if (!pandemicBuff) return;
  const transferPct = pandemicBuff.effects.transferPercent || 0;
  if (transferPct <= 0) return;

  // Snapshot only DoT effects (bleed, poison, burn)
  const dotEffects = state.monsterStatusEffects.filter(
    e => e.id === 'bleed' || e.id === 'poison' || e.id === 'burn'
  );
  if (dotEffects.length === 0) return;

  state.pandemicTransfer = dotEffects.map(e => ({
    id: e.id,
    stacks: e.stacks || 1,
    remaining: e.remaining * transferPct,
    damagePerTick: e.damagePerTick || 0,
    damageType: e.damageType || 'physical',
    source: 'pandemic'
  }));
}

/**
 * Apply Pandemic-transferred DoTs to a newly spawned monster.
 */
function applyPandemicTransfer() {
  if (!state.pandemicTransfer || state.pandemicTransfer.length === 0) return;
  const monster = state.currentMonster;
  if (!monster || state.combatState !== 'active') {
    state.pandemicTransfer = null;
    return;
  }

  for (const snapshot of state.pandemicTransfer) {
    const effect = {
      id: snapshot.id,
      stacks: snapshot.stacks,
      remaining: snapshot.remaining,
      tickTimer: 0,
      source: 'pandemic',
      damagePerTick: snapshot.damagePerTick,
      damageType: snapshot.damageType
    };
    state.monsterStatusEffects.push(effect);

    if (snapshot.id === 'slow') {
      monster.slowed = true;
      monster.slowStrength = SLOW_STRENGTH;
      emit('statusEffect:slowed', { target: 'monster', strength: SLOW_STRENGTH });
    }

    emit('statusEffect:applied', {
      target: 'monster', effectId: snapshot.id, stacks: snapshot.stacks, refreshed: false
    });
  }

  state.pandemicTransfer = null;
}

function clearMonsterEffects() {
  // Snapshot DoTs for Pandemic before clearing
  snapshotForPandemic();

  const monster = state.currentMonster;
  if (monster) {
    monster.frozen = false;
    monster.slowed = false;
    monster.slowStrength = 0;
    monster.freezeCooldown = 0;
  }
  state.monsterStatusEffects = [];
  // Clear burn tick multiplier and scorched debuff
  state.burnTickMultiplier = 0;
}

function clearPlayerEffects() {
  state.playerFrozen = false;
  state.playerSlowed = false;
  state.playerSlowStrength = 0;
  state.playerFreezeCooldown = 0;
  state.playerStatusEffects = [];
}

// --- Public API ---

/**
 * Get active effects on the current monster (for UI).
 * @returns {Array}
 */
export function getMonsterEffects() {
  return state.monsterStatusEffects;
}

/**
 * Get active effects on the player (for UI).
 * @returns {Array}
 */
export function getPlayerEffects() {
  return state.playerStatusEffects;
}

/**
 * @param {Object} deps
 * @param {Function} deps.damagePlayer - health.damagePlayer(amount, source, damageType)
 */
export function init(deps = {}) {
  hurtPlayer = deps.damagePlayer;
  getPlagueDoctorBonus = deps.getPlagueDoctorBonus || null;

  // Initialize runtime state
  state.monsterStatusEffects = [];
  state.playerStatusEffects = [];
  state.playerFreezeCooldown = 0;
  state.playerFrozen = false;
  state.playerSlowed = false;
  state.playerSlowStrength = 0;
  state.burnTickMultiplier = 0;
  state.pandemicTransfer = null;

  // Effect application requests
  on('statusEffect:tryApply', onTryApply);

  // Clear monster effects on death/spawn transitions
  on('combat:monsterKilled', clearMonsterEffects);
  on('combat:requestImmediateSpawn', clearMonsterEffects);
  // On monster spawned: clear then apply Pandemic transfer
  on('combat:monsterSpawned', () => {
    clearMonsterEffects();
    applyPandemicTransfer();
  });
  on('combat:bossTimeout', clearMonsterEffects);
  on('combat:monsterEscaped', clearMonsterEffects);

  // Clear player effects on death
  on('player:died', clearPlayerEffects);
}

export function update(dt) {
  tickMonsterEffects(dt);
  tickPlayerEffects(dt);
}

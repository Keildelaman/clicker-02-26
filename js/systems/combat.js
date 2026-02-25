/**
 * combat.js - Combat System
 *
 * Owns: Click handling, damage calculation, combat state machine,
 *       monster type mechanics (armored, shielded, aggressive, swift, regen).
 * Listens to: (click events wired by main.js), skill:instantDamage
 * Emits: combat:click, combat:hit, combat:monsterKilled, combat:dyingComplete,
 *        combat:shieldBroken, combat:phaseChange, combat:monsterEscaped,
 *        combat:monsterRegenerated
 *
 * Dependencies injected via init(): getComputedStats from player system,
 *   damagePlayer from health system.
 *
 * @see docs/systems/combat.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import {
  MIN_DAMAGE, DEATH_ANIMATION_DURATION, BOSS_TIMERS,
  OVERKILL_CARRY_PERCENT, OVERKILL_CHAIN_MAX,
  DAMAGE_TYPES, LEGENDARY_EFFECTS
} from '../data/constants.js';
import { calcDamageReduction } from '../data/balance.js';
import { SKILLS as SKILLS_REF } from '../data/skills.data.js';

let dyingTimer = 0;
let computeStats = null;    // Injected dependency
let hurtPlayer = null;      // Injected dependency: damagePlayer(amount, source)
let getWeaponDamageType = null;  // Injected: items.getWeaponDamageType
let getStatusProcChances = null; // Injected: items.getStatusProcChances
let getStatusPotency = null;     // Injected: items.getStatusPotency

// Boss timer state
let bossTimer = null;  // { remaining, duration, bossId } or null

/**
 * Roll a status effect chance and emit tryApply if successful.
 * Deduplicates the repeated pattern of checking statusEffect, rolling chance, and emitting.
 */
function tryApplyStatusEffect(target, statusEffect, source, stats, potencyBonus = 0) {
  if (!statusEffect) return;
  if (Math.random() < statusEffect.chance) {
    emit('statusEffect:tryApply', {
      target,
      effectId: statusEffect.type,
      stacks: statusEffect.stacks || 1,
      source,
      sourceAttack: stats.attack || 0,
      sourceMagicPower: stats.magicPower || 0,
      potencyBonus
    });
  }
}

/**
 * Check if a monster has a given type (supports multi-type "type1+type2").
 */
function hasType(monster, typeName) {
  return monster.type.split('+').includes(typeName);
}

/**
 * Apply damage to the current monster. Handles defense (% formula), shield, and kill detection.
 * Used by handleClick (per-hit), skill:instantDamage, and overkill carry.
 * @param {number} rawDamage
 * @param {Object} opts - { isCrit, ignoreArmor, isSkillDamage, skillId, damageType }
 * @returns {{ finalDamage: number, killed: boolean }}
 */
export function applyDamageToMonster(rawDamage, opts = {}) {
  const monster = state.currentMonster;
  if (!monster || state.combatState !== 'active') return { finalDamage: 0, killed: false };

  const damageType = opts.damageType || DAMAGE_TYPES.PHYSICAL;
  let damage = Math.max(rawDamage, MIN_DAMAGE);

  // Defense: percentage-based reduction (all monsters, not just armored type)
  if (!opts.ignoreArmor) {
    const stats = computeStats();
    const defense = damageType === DAMAGE_TYPES.MAGIC ? monster.magicResist : monster.armor;
    const pen = damageType === DAMAGE_TYPES.MAGIC ? stats.magicPen : stats.armorPen;
    const reduction = calcDamageReduction(defense, pen);
    damage = Math.max(Math.floor(damage * (1 - reduction)), MIN_DAMAGE);
  }

  // Shield: absorb 1:1, overflow to HP
  if (monster.shield > 0) {
    if (damage >= monster.shield) {
      const overflow = damage - monster.shield;
      monster.shield = 0;
      monster.currentHealth -= overflow;
      emit('combat:shieldBroken', { monster });
    } else {
      monster.shield -= damage;
    }
  } else {
    monster.currentHealth -= damage;
  }

  // Emit per-hit event for UI damage numbers
  emit('combat:hit', {
    damage,
    damageType,
    isCrit: !!opts.isCrit,
    isSkillDamage: !!opts.isSkillDamage,
    skillId: opts.skillId || null
  });

  let killed = false;
  if (monster.currentHealth <= 0) {
    monster.overkillAmount = Math.abs(monster.currentHealth);
    monster.currentHealth = 0;
    killed = true;
  }

  return { finalDamage: damage, killed };
}

/**
 * Handle a player click/tap on the monster area.
 * Supports multi-hit (Flurry buff), hit modifiers (Power Strike, Execute, Shatter),
 * click modifiers (Precision), and Adrenaline Rush crit scaling.
 */
export function handleClick() {
  if (state.combatState !== 'active') return;
  if (!state.currentMonster) return;
  // Block normal clicks while channel is charging (queued state handled by main.js)
  if (state.channelState && state.channelState.phase === 'charging') return;

  state.lastClickTime = performance.now();

  const player = getPlayer();
  const stats = computeStats();
  const monster = state.currentMonster;

  // Aggressive check: clicking during attack phase hurts the player
  if (hasType(monster, 'aggressive') && monster.attackPhase === 'attacking') {
    const dmgPct = (monster.mechanics && monster.mechanics.damagePercent) || 0.10;
    const dmg = Math.floor(player.maxHP * dmgPct);
    hurtPlayer(dmg, 'aggressive', monster.damageType || DAMAGE_TYPES.PHYSICAL);

    // Monster status effect on player (Phase 6)
    tryApplyStatusEffect('player', monster.statusEffectOnHit, monster.definitionId, { attack: dmg, magicPower: dmg });

    emit('combat:click', {
      damage: 0,
      isCrit: false,
      blocked: true,
      monsterHP: monster.currentHealth,
      monsterMaxHP: monster.maxHealth
    });
    return;
  }

  // Determine hits per click (Flurry buff)
  const flurryBuff = state.activeBuffs['flurry'];
  const hitsPerClick = (flurryBuff && flurryBuff.effects.hitsPerClick) || 1;

  // Check for Precision (click modifier — guaranteed crits)
  const precisionMod = state.clickModifiers['precision'];
  const hasPrecision = precisionMod && precisionMod.charges > 0;

  // Passive damage multiplier (Click Mastery + Momentum)
  let passiveMultiplier = 1.0;
  const cmState = state.passiveStates['click_mastery'];
  if (cmState && cmState.stacks > 0 && player.equippedPassive.includes('click_mastery')) {
    const cmLevel = player.unlockedSkills['click_mastery'];
    const cmData = SKILLS_REF['click_mastery']?.levels[cmLevel];
    if (cmData) {
      passiveMultiplier *= (1 + (cmState.stacks * cmData.dmgPerStack / 100));
    }
  }
  const momState = state.toggleStates['momentum'];
  if (momState && momState.active && momState.stacks > 0) {
    passiveMultiplier *= (1 + (momState.stacks * momState.dmgPerStack / 100));
  }

  // Sandstorm Fang: double hit at 60% damage each
  const doubleHit = state.activeLegendaryEffects?.has('double_hit');
  const legendaryHitMult = doubleHit ? 2 : 1;
  const legendaryDmgMod = doubleHit ? LEGENDARY_EFFECTS.DOUBLE_HIT_MULT : 1.0;

  // Track if any hit was a crit (for statistics)
  let anyKilled = false;
  let totalDamage = 0;
  let anyCrit = false;

  for (let i = 0; i < hitsPerClick * legendaryHitMult; i++) {
    // Roll crit
    let critChance = stats.critChance;

    // Adrenaline Rush: crit chance = max(base, energy%)
    const adrenalineBuff = state.activeBuffs['adrenaline_rush'];
    if (adrenalineBuff && adrenalineBuff.effects.critFromEnergy) {
      critChance = Math.max(critChance, player.energy / player.maxEnergy);
    }

    let isCrit;
    if (hasPrecision) {
      isCrit = true;
    } else {
      isCrit = Math.random() < critChance;
    }

    if (isCrit) anyCrit = true;

    // Compute damage
    let damage = stats.attack;
    if (isCrit) {
      damage = Math.floor(damage * stats.critDamage);
    }
    damage = Math.max(damage, MIN_DAMAGE);

    // PRIMARY hit only (i === 0): apply hitModifier
    let shatterBonus = 0;
    let hitDamageType = getWeaponDamageType ? getWeaponDamageType() : DAMAGE_TYPES.PHYSICAL;
    if (i === 0 && state.hitModifier) {
      const mod = state.hitModifier;
      hitDamageType = mod.damageType || DAMAGE_TYPES.PHYSICAL;

      if (mod.type === 'execute') {
        const hpRatio = monster.currentHealth / monster.maxHealth;
        const multiplier = hpRatio <= mod.threshold ? mod.strongMult : mod.weakMult;
        damage = Math.floor(damage * multiplier);
      } else if (mod.type === 'shatter') {
        // Normal damage + bonus %maxHP (ignores armor)
        shatterBonus = Math.floor(monster.maxHealth * mod.percentHP);
      } else {
        // Default (power_strike): flat multiplier
        damage = Math.floor(damage * mod.multiplier);
      }

      emit('skill:effectTriggered', { skillId: mod.skillId, result: 'applied', damage });

      // Status effect from hit modifier skill (Phase 5)
      tryApplyStatusEffect('monster', mod.statusEffect, mod.skillId, stats, mod.statusPotencyBonus || 0);

      state.hitModifier = null;
      emit('skill:effectEnded', { skillId: mod.skillId, type: 'hitModifier' });

      // Equipment status procs on skill damage (hit modifier consumed)
      rollEquipmentStatusProcs();
    }

    // Apply passive damage bonuses (Click Mastery + Momentum)
    damage = Math.floor(damage * passiveMultiplier);

    // Sandstorm Fang: scale each hit by 60%
    if (doubleHit) {
      damage = Math.floor(damage * legendaryDmgMod);
    }

    // Shield Breaker equipment bonus: bonus damage vs shielded monsters
    if (stats.bonusDamage > 0 && monster.shield > 0) {
      damage = Math.floor(damage * (1 + stats.bonusDamage));
    }

    // Apply main hit (type from hitModifier skill, or physical for normal clicks)
    const result = applyDamageToMonster(damage, { isCrit, damageType: hitDamageType });
    totalDamage += result.finalDamage;

    // Apply Shatter bonus as separate hit (ignores armor)
    if (shatterBonus > 0 && !result.killed) {
      const shatterResult = applyDamageToMonster(shatterBonus, {
        ignoreArmor: true, isCrit: false, isSkillDamage: true, skillId: 'shatter',
        damageType: hitDamageType
      });
      totalDamage += shatterResult.finalDamage;
      if (shatterResult.killed) { anyKilled = true; break; }
    }

    if (result.killed) { anyKilled = true; break; }
  }

  // Precision: consume one charge after the click (all hits in this click benefit)
  if (hasPrecision) {
    precisionMod.charges--;
    if (precisionMod.charges <= 0) {
      delete state.clickModifiers['precision'];
      emit('skill:effectEnded', { skillId: 'precision', type: 'clickModifier' });
    }
  }

  // Update statistics
  player.statistics.totalClicks++;
  if (anyCrit) player.statistics.totalCriticals++;
  if (totalDamage > player.statistics.highestDamage) {
    player.statistics.highestDamage = totalDamage;
  }

  // Emit click event (for backwards compat with bars-ui, stats-ui, energy)
  emit('combat:click', {
    damage: totalDamage,
    isCrit: anyCrit,
    blocked: false,
    monsterHP: monster.currentHealth,
    monsterMaxHP: monster.maxHealth,
    shieldHP: monster.shield,
    shieldMaxHP: monster.maxShield
  });

  if (anyKilled) {
    killMonster();
  }
}

/**
 * Handle instant skill damage (Barrage, Arcane Bolt, Chain Lightning, Shield Bash).
 * Supports optional hitDelay (ms) between hits for staggered multi-hit skills.
 * Overkill carry is now handled generically by killMonster() for all damage sources.
 */
function onInstantDamage({ hits, damagePerHit, skillId, hitDelay, damageType }) {
  const monster = state.currentMonster;
  if (!monster || state.combatState !== 'active') return;

  const type = damageType || DAMAGE_TYPES.PHYSICAL;

  // No delay or single hit — fire all immediately (original behavior)
  if (!hitDelay || hits <= 1) {
    const stats = computeStats();
    for (let i = 0; i < hits; i++) {
      const isCrit = Math.random() < stats.critChance;
      let dmg = Math.floor(stats.attack * (damagePerHit / 100));
      if (isCrit) dmg = Math.floor(dmg * stats.critDamage);
      dmg = Math.max(dmg, MIN_DAMAGE);

      const result = applyDamageToMonster(dmg, { isCrit, isSkillDamage: true, skillId, damageType: type });
      rollEquipmentStatusProcs();
      if (result.killed) { killMonster(); return; }
    }
    return;
  }

  // Staggered hits — fire each hit after hitDelay * index ms
  for (let i = 0; i < hits; i++) {
    setTimeout(() => {
      // Re-check state before each delayed hit
      if (!state.currentMonster || state.combatState !== 'active') return;

      const stats = computeStats();
      const isCrit = Math.random() < stats.critChance;
      let dmg = Math.floor(stats.attack * (damagePerHit / 100));
      if (isCrit) dmg = Math.floor(dmg * stats.critDamage);
      dmg = Math.max(dmg, MIN_DAMAGE);

      const result = applyDamageToMonster(dmg, { isCrit, isSkillDamage: true, skillId, damageType: type });
      rollEquipmentStatusProcs();
      if (result.killed) killMonster();
    }, i * hitDelay);
  }
}

/**
 * Start boss enrage timer when a boss spawns.
 */
function startBossTimer(monster) {
  const duration = BOSS_TIMERS[monster.definitionId];
  if (!duration) return;

  bossTimer = {
    remaining: duration,
    duration,
    bossId: monster.definitionId
  };

  emit('combat:bossTimerStarted', {
    duration,
    bossId: monster.definitionId
  });
}

/**
 * Clear boss timer (on boss death or timeout).
 */
function clearBossTimer() {
  bossTimer = null;
}

/**
 * Handle boss timeout — reset boss HP, return to normal spawning.
 */
function handleBossTimeout() {
  const monster = state.currentMonster;
  if (!monster || !monster.isBoss) return;

  clearBossTimer();

  // Despawn boss
  state.currentMonster = null;
  state.combatState = 'waiting';

  emit('combat:bossTimeout', {
    bossId: monster.definitionId,
    bossName: monster.name
  });

  // Schedule next normal monster spawn
  emit('combat:dyingComplete', {});
}

/** Track overkill chains to prevent infinite loops. */
let overkillChainCount = 0;

/**
 * Handle monster spawn event — start boss timer, apply overkill carry.
 */
function onMonsterSpawned({ monster }) {
  if (monster.isBoss) {
    startBossTimer(monster);
  }

  // Apply overkill carry from any damage source (skip bosses)
  if (state.overkillCarry > 0 && !monster.isBoss && overkillChainCount < OVERKILL_CHAIN_MAX) {
    const carry = state.overkillCarry;
    state.overkillCarry = 0;
    overkillChainCount++;

    if (state.currentMonster && state.combatState === 'active') {
      const result = applyDamageToMonster(carry, { isSkillDamage: true, skillId: 'overkill_carry' });
      if (result.killed) {
        killMonster();
        return; // killMonster will trigger the next spawn + carry
      }
    }
  }

  // Reset chain counter when a monster survives the carry (or no carry)
  overkillChainCount = 0;
}

/**
 * Process monster death: rewards and schedule next spawn.
 * Non-boss kills trigger instant respawn; boss kills keep the death animation.
 */
function killMonster() {
  const monster = state.currentMonster;

  // Clear boss timer on kill
  if (monster.isBoss) {
    clearBossTimer();
  }

  const player = getPlayer();
  player.statistics.totalKills++;

  // Calculate overkill carry (for all damage sources, not just Chain Lightning)
  const overkill = monster.overkillAmount || 0;
  if (overkill > 0 && !monster.isBoss) {
    state.overkillCarry = Math.floor(overkill * (OVERKILL_CARRY_PERCENT / 100));
  }

  emit('combat:monsterKilled', {
    monster,
    definitionId: monster.definitionId,
    isBoss: monster.isBoss,
    goldReward: monster.goldReward,
    xpReward: monster.xpReward
  });

  if (monster.isBoss) {
    // Boss kills: keep the death animation + spawn delay ceremony
    state.combatState = 'dying';
    dyingTimer = DEATH_ANIMATION_DURATION / 1000;
  } else {
    // Non-boss kills: instant transition to next monster
    emit('combat:requestImmediateSpawn');
  }
}

/**
 * Handle monster escape (swift type): no rewards, player takes damage.
 */
function handleMonsterEscape(monster) {
  const player = getPlayer();
  const dmg = Math.floor(player.maxHP * monster.escapeDamage);
  hurtPlayer(dmg, 'swift_escape', monster.damageType || DAMAGE_TYPES.PHYSICAL);

  // Monster status effect on player (Phase 6)
  tryApplyStatusEffect('player', monster.statusEffectOnHit, monster.definitionId, { attack: dmg, magicPower: dmg });

  emit('combat:monsterEscaped', { monster });

  // Despawn and schedule next
  state.currentMonster = null;
  state.combatState = 'waiting';
  emit('combat:dyingComplete', {});
}

/**
 * Update aggressive monster phase cycling.
 * Cycle: safe -> warning -> attacking -> safe (repeat)
 */
function updateAggressive(monster, dt) {
  const m = monster.mechanics;
  if (!m) return;

  const stats = computeStats();
  const cycle = m.attackCycle || 4000;
  const warningDur = (m.warningDuration || 1500) + (stats.warningBonus || 0);
  const attackDur = m.attackDuration || 500;
  const safeDur = cycle - warningDur - attackDur;

  monster.attackTimer += dt * 1000; // track in ms

  const pos = monster.attackTimer % cycle;
  let newPhase;

  if (pos < safeDur) {
    newPhase = 'safe';
  } else if (pos < safeDur + warningDur) {
    newPhase = 'warning';
  } else {
    newPhase = 'attacking';
  }

  if (newPhase !== monster.attackPhase) {
    monster.attackPhase = newPhase;
    emit('combat:phaseChange', { phase: newPhase, monster });
  }
}

/**
 * Update swift monster escape timer.
 */
function updateSwift(monster, dt) {
  monster.escapeTimer -= dt * 1000; // track in ms

  emit('combat:escapeTimerTick', {
    remaining: monster.escapeTimer,
    max: monster.maxEscapeTimer
  });

  if (monster.escapeTimer <= 0) {
    handleMonsterEscape(monster);
  }
}

/**
 * Update regenerating monster HP recovery.
 */
function updateRegenerating(monster, dt) {
  if (monster.currentHealth < monster.maxHealth) {
    const regenAmount = monster.regenRate * monster.maxHealth * dt;
    monster.currentHealth = Math.min(
      monster.currentHealth + regenAmount,
      monster.maxHealth
    );
    emit('combat:monsterRegenerated', {
      monsterHP: monster.currentHealth,
      monsterMaxHP: monster.maxHealth
    });
  }
}

/**
 * Run per-tick type updates for the active monster.
 */
function updateMonsterTypes(monster, dt) {
  // Frozen monsters skip type updates entirely
  if (monster.frozen) return;

  // Slowed monsters act at reduced speed
  let effectiveDt = dt;
  if (monster.slowed) {
    effectiveDt *= (1 - (monster.slowStrength || 0));
  }

  const types = monster.type.split('+');

  for (const t of types) {
    if (t === 'aggressive') updateAggressive(monster, effectiveDt);
    if (t === 'swift') updateSwift(monster, effectiveDt);
    if (t === 'regenerating') updateRegenerating(monster, effectiveDt);
    // armored and shielded have no tick behavior
  }
}

/**
 * Roll equipment-based status procs on skill damage.
 * Status procs from equipment apply only on skill damage, not basic clicks.
 */
function rollEquipmentStatusProcs() {
  if (!getStatusProcChances) return;

  const monster = state.currentMonster;
  if (!monster || state.combatState !== 'active') return;

  const procs = getStatusProcChances();
  const potency = getStatusPotency ? getStatusPotency() : {};
  const stats = computeStats();

  for (const [effectId, chance] of Object.entries(procs)) {
    if (chance > 0 && Math.random() < chance) {
      emit('statusEffect:tryApply', {
        target: 'monster',
        effectId,
        stacks: 1,
        source: 'equipment',
        sourceAttack: stats.attack || 0,
        sourceMagicPower: stats.magicPower || 0,
        potencyBonus: potency[effectId] || 0
      });
    }
  }
}

/**
 * Handle channel release damage (Charge Up).
 */
function onChannelRelease({ damage, isCrit, skillId, damageType }) {
  if (!state.currentMonster || state.combatState !== 'active') return;
  const result = applyDamageToMonster(damage, {
    isCrit, isSkillDamage: true, skillId,
    damageType: damageType || DAMAGE_TYPES.PHYSICAL
  });
  rollEquipmentStatusProcs();
  if (result.killed) killMonster();
}

/**
 * @param {Object} deps - Injected dependencies
 * @param {Function} deps.getComputedStats - Returns player computed stats
 * @param {Function} deps.damagePlayer - Deals damage to the player
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
  hurtPlayer = deps.damagePlayer;
  getWeaponDamageType = deps.getWeaponDamageType || null;
  getStatusProcChances = deps.getStatusProcChances || null;
  getStatusPotency = deps.getStatusPotency || null;

  on('combat:monsterSpawned', onMonsterSpawned);
  on('skill:instantDamage', onInstantDamage);
  on('skill:channelRelease', onChannelRelease);

  // Status effect DoT damage (Phase 5) — damage is pre-reduced by status-effects.js
  on('statusEffect:damageMonster', ({ damage, damageType, effectId }) => {
    if (!state.currentMonster || state.combatState !== 'active') return;
    const result = applyDamageToMonster(damage, {
      ignoreArmor: true,
      isSkillDamage: true,
      skillId: `dot:${effectId}`,
      damageType
    });
    if (result.killed) killMonster();
  });
}

export function update(dt) {
  // Dying animation timer
  if (state.combatState === 'dying') {
    dyingTimer -= dt;
    if (dyingTimer <= 0) {
      state.currentMonster = null;
      emit('combat:dyingComplete', {});
    }
    return;
  }

  // Active combat: run monster type updates + boss timer
  if (state.combatState === 'active' && state.currentMonster) {
    updateMonsterTypes(state.currentMonster, dt);

    // Boss timer countdown
    if (bossTimer) {
      bossTimer.remaining -= dt * 1000; // dt is seconds, timer is ms

      emit('combat:bossTimerTick', {
        remaining: bossTimer.remaining,
        duration: bossTimer.duration
      });

      if (bossTimer.remaining <= 0) {
        handleBossTimeout();
      }
    }
  }
}

/**
 * combat.js - Combat System
 *
 * Owns: Click handling, damage calculation, combat state machine,
 *       monster type mechanics (armored, shielded, aggressive, swift, regen).
 * Listens to: (click events wired by main.js)
 * Emits: combat:click, combat:monsterKilled, combat:dyingComplete,
 *        combat:shieldBroken, combat:phaseChange, combat:monsterEscaped,
 *        combat:monsterRegenerated
 *
 * Dependencies injected via init(): getComputedStats from player system,
 *   damagePlayer from health system.
 *
 * @see docs/systems/combat.system.md
 */

import { emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { MIN_DAMAGE, DEATH_ANIMATION_DURATION } from '../data/constants.js';

let dyingTimer = 0;
let computeStats = null;    // Injected dependency
let hurtPlayer = null;      // Injected dependency: damagePlayer(amount, source)

/**
 * Check if a monster has a given type (supports multi-type "type1+type2").
 */
function hasType(monster, typeName) {
  return monster.type.split('+').includes(typeName);
}

/**
 * Handle a player click/tap on the monster area.
 */
export function handleClick() {
  if (state.combatState !== 'active') return;
  if (!state.currentMonster) return;

  const player = getPlayer();
  const stats = computeStats();
  const monster = state.currentMonster;

  // Aggressive check: clicking during attack phase hurts the player
  if (hasType(monster, 'aggressive') && monster.attackPhase === 'attacking') {
    const dmgPct = (monster.mechanics && monster.mechanics.damagePercent) || 0.10;
    const dmg = Math.floor(player.maxHP * dmgPct);
    hurtPlayer(dmg, 'aggressive');

    emit('combat:click', {
      damage: 0,
      isCrit: false,
      blocked: true,
      monsterHP: monster.currentHealth,
      monsterMaxHP: monster.maxHealth
    });
    return;
  }

  // Timing mode: random per-click outcome
  let timingResult = null;
  if (state.timingMode) {
    const tm = state.timingMode.levels;
    const roll = Math.random();
    if (roll < 0.30) {
      timingResult = { type: 'perfect', multiplier: tm.perfectMultiplier };
    } else if (roll < 0.70) {
      timingResult = { type: 'good', multiplier: tm.goodMultiplier };
    } else {
      timingResult = { type: 'miss', multiplier: tm.missMultiplier };
      // Miss deals self-damage
      const selfDmg = Math.floor(player.maxHP * tm.missDamage);
      hurtPlayer(selfDmg, 'timing_miss');
    }
    emit('skill:timingResult', timingResult);
  }

  // Calculate base damage
  const isCrit = Math.random() < stats.critChance;
  let damage = stats.attack;
  if (isCrit) {
    damage = Math.floor(damage * stats.critDamage);
  }
  damage = Math.max(damage, MIN_DAMAGE);

  // Apply timing mode multiplier
  if (timingResult) {
    damage = Math.floor(damage * timingResult.multiplier);
    damage = Math.max(damage, MIN_DAMAGE);
  }

  // Apply nextAttackModifier (Power Strike, Execute)
  if (state.nextAttackModifier) {
    const mod = state.nextAttackModifier;
    let shouldApply = true;

    if (mod.condition && mod.condition.type === 'hpBelow') {
      const hpPercent = monster.currentHealth / monster.maxHealth;
      shouldApply = hpPercent <= mod.condition.threshold;
    }

    if (shouldApply) {
      damage = Math.floor(damage * mod.multiplier);
      emit('skill:effectTriggered', { skillId: mod.skillId, result: 'applied', damage });
    } else {
      emit('skill:effectTriggered', { skillId: mod.skillId, result: 'wasted' });
    }
    state.nextAttackModifier = null;
  }

  // Shield Breaker buff: bonus damage vs shielded monsters
  if (stats.bonusDamage > 0 && monster.shield > 0) {
    damage = Math.floor(damage * (1 + stats.bonusDamage));
  }

  // Armored: flat damage reduction
  if (hasType(monster, 'armored')) {
    const effectiveArmor = Math.max(monster.armorValue - stats.armorPen, 0);
    damage = Math.max(damage - effectiveArmor, MIN_DAMAGE);
  }

  // Shielded: absorb into shield with DR, overflow to HP
  if (hasType(monster, 'shielded') && monster.shield > 0) {
    const reducedDamage = Math.max(Math.floor(damage * (1 - monster.shieldDR)), MIN_DAMAGE);

    if (reducedDamage >= monster.shield) {
      const overflow = reducedDamage - monster.shield;
      monster.shield = 0;
      monster.currentHealth -= overflow;
      emit('combat:shieldBroken', { monster });
    } else {
      monster.shield -= reducedDamage;
    }
  } else {
    // Normal HP damage (including armored after reduction)
    monster.currentHealth -= damage;
  }

  // Update statistics
  player.statistics.totalClicks++;
  if (isCrit) player.statistics.totalCriticals++;
  if (damage > player.statistics.highestDamage) {
    player.statistics.highestDamage = damage;
  }

  // Emit click event (UI listens for damage numbers)
  emit('combat:click', {
    damage,
    isCrit,
    blocked: false,
    monsterHP: monster.currentHealth,
    monsterMaxHP: monster.maxHealth,
    shieldHP: monster.shield,
    shieldMaxHP: monster.maxShield
  });

  // Check for kill
  if (monster.currentHealth <= 0) {
    monster.currentHealth = 0;
    killMonster();
  }
}

/**
 * Process monster death: rewards and schedule next spawn.
 */
function killMonster() {
  const monster = state.currentMonster;
  state.combatState = 'dying';
  dyingTimer = DEATH_ANIMATION_DURATION / 1000;

  const player = getPlayer();
  player.statistics.totalKills++;

  emit('combat:monsterKilled', {
    monster,
    definitionId: monster.definitionId,
    isBoss: monster.isBoss,
    goldReward: monster.goldReward,
    xpReward: monster.xpReward
  });
}

/**
 * Handle monster escape (swift type): no rewards, player takes damage.
 */
function handleMonsterEscape(monster) {
  const player = getPlayer();
  const dmg = Math.floor(player.maxHP * monster.escapeDamage);
  hurtPlayer(dmg, 'swift_escape');

  emit('combat:monsterEscaped', { monster });

  // Despawn and schedule next
  state.currentMonster = null;
  state.combatState = 'waiting';
  emit('combat:dyingComplete', {});
}

/**
 * Update aggressive monster phase cycling.
 * Cycle: safe → warning → attacking → safe (repeat)
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
  // Frozen monsters skip type updates
  if (monster.frozen) return;

  const types = monster.type.split('+');

  for (const t of types) {
    if (t === 'aggressive') updateAggressive(monster, dt);
    if (t === 'swift') updateSwift(monster, dt);
    if (t === 'regenerating') updateRegenerating(monster, dt);
    // armored and shielded have no tick behavior
  }
}

/**
 * @param {Object} deps - Injected dependencies
 * @param {Function} deps.getComputedStats - Returns player computed stats
 * @param {Function} deps.damagePlayer - Deals damage to the player
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
  hurtPlayer = deps.damagePlayer;
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

  // Active combat: run monster type updates
  if (state.combatState === 'active' && state.currentMonster) {
    updateMonsterTypes(state.currentMonster, dt);
  }
}

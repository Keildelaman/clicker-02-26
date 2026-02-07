/**
 * combat.js - Combat System
 *
 * Owns: Click handling, damage calculation, combat state machine.
 * Listens to: (click events wired by main.js)
 * Emits: combat:click, combat:monsterKilled, combat:dyingComplete
 *
 * Dependencies injected via init(): getComputedStats from player system.
 *
 * @see docs/systems/combat.system.md
 */

import { emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { MIN_DAMAGE, DEATH_ANIMATION_DURATION } from '../data/constants.js';

let dyingTimer = 0;
let computeStats = null; // Injected dependency

/**
 * Handle a player click/tap on the monster area.
 */
export function handleClick() {
  if (state.combatState !== 'active') return;
  if (!state.currentMonster) return;

  const player = getPlayer();
  const stats = computeStats();
  const monster = state.currentMonster;

  // Calculate damage
  const isCrit = Math.random() < stats.critChance;
  let damage = stats.attack;
  if (isCrit) {
    damage = Math.floor(damage * stats.critDamage);
  }
  damage = Math.max(damage, MIN_DAMAGE);

  // Apply damage to monster
  monster.currentHealth -= damage;

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
    monsterHP: monster.currentHealth,
    monsterMaxHP: monster.maxHealth
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
    isBoss: monster.isBoss,
    goldReward: monster.goldReward,
    xpReward: monster.xpReward
  });
}

/**
 * @param {Object} deps - Injected dependencies
 * @param {Function} deps.getComputedStats - Returns player computed stats
 */
export function init(deps = {}) {
  computeStats = deps.getComputedStats;
}

export function update(dt) {
  if (state.combatState === 'dying') {
    dyingTimer -= dt;
    if (dyingTimer <= 0) {
      state.currentMonster = null;
      emit('combat:dyingComplete', {});
    }
  }
}

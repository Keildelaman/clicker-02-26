/**
 * monster.js - Monster System
 *
 * Owns: Monster selection, instance creation, type initialization.
 * Listens to: (wired by main.js)
 * Emits: combat:monsterSpawned
 *
 * @see docs/systems/combat.system.md
 * @see docs/schemas/monster.schema.md
 */

import { on, emit } from '../core/event-bus.js';
import { state } from '../core/game-state.js';
import { MONSTERS } from '../data/monsters.data.js';
import { ZONES } from '../data/zones.data.js';
import { MONSTER_SPAWN_DELAY } from '../data/constants.js';
import { randomInt } from '../services/utils.js';

let spawnTimer = 0;
let waitingToSpawn = false;

/**
 * Select a random monster from the current zone using weighted selection.
 * @param {string} zoneId
 * @returns {Object} Monster definition
 */
function selectMonster(zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) return MONSTERS.whisperwood_sprite;

  const candidates = zone.monsters
    .map(id => MONSTERS[id])
    .filter(m => m && !m.isBoss);

  const totalWeight = candidates.reduce((sum, m) => sum + m.spawnWeight, 0);
  let roll = Math.random() * totalWeight;

  for (const monster of candidates) {
    roll -= monster.spawnWeight;
    if (roll <= 0) return monster;
  }

  return candidates[0];
}

/**
 * Create a runtime monster instance from a definition.
 * @param {Object} definition - Monster data definition
 * @returns {Object} Monster instance
 */
function createMonsterInstance(definition) {
  const level = randomInt(definition.levelMin, definition.levelMax);
  const levelDelta = level - definition.levelMin;
  const hp = definition.baseHealth + (definition.healthPerLevel * levelDelta);

  const goldBase = randomInt(definition.goldMin, definition.goldMax);
  const goldBonus = definition.goldPerLevel * levelDelta;

  const xpBase = randomInt(definition.xpMin, definition.xpMax);
  const xpBonus = definition.xpPerLevel * levelDelta;

  return {
    definitionId: definition.id,
    name: definition.name,
    emoji: definition.emoji,
    type: definition.type,
    level,
    maxHealth: hp,
    currentHealth: hp,
    isBoss: definition.isBoss || false,
    goldReward: goldBase + goldBonus,
    xpReward: xpBase + xpBonus,
    deathEmoji: definition.deathEmoji,

    // Type-specific runtime state (unused in Phase 0+1, prepped for later)
    shield: 0,
    maxShield: 0,
    escapeTimer: 0,
    attackTimer: 0,
    attackPhase: 'safe',
    frozen: false,
    frozenUntil: 0
  };
}

/**
 * Spawn the next monster from the current zone.
 */
export function spawnNext() {
  const player = state.player;
  if (!player) return;

  const definition = selectMonster(player.currentZone);
  const monster = createMonsterInstance(definition);

  state.currentMonster = monster;
  state.combatState = 'active';

  emit('combat:monsterSpawned', { monster });
}

/**
 * Schedule next monster spawn after delay.
 */
export function scheduleSpawn() {
  waitingToSpawn = true;
  spawnTimer = MONSTER_SPAWN_DELAY / 1000; // convert to seconds
  state.combatState = 'waiting';
}

export function init() {
  on('combat:dyingComplete', scheduleSpawn);
}

export function update(dt) {
  if (!waitingToSpawn) return;

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    waitingToSpawn = false;
    spawnNext();
  }
}

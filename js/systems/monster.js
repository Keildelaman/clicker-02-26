/**
 * monster.js - Monster System
 *
 * Owns: Monster selection, instance creation, type initialization.
 * Listens to: combat:dyingComplete, player:respawned
 * Emits: combat:monsterSpawned
 *
 * @see docs/systems/combat.system.md
 * @see docs/schemas/monster.schema.md
 */

import { on, emit } from '../core/event-bus.js';
import { state } from '../core/game-state.js';
import { MONSTERS } from '../data/monsters.data.js';
import { ZONES } from '../data/zones.data.js';
import {
  MONSTER_SPAWN_DELAY,
  ESCAPE_TIMER_DEFAULT, ESCAPE_DAMAGE_DEFAULT,
  SHIELD_PERCENT_DEFAULT, SHIELD_DR_DEFAULT,
  ARMOR_VALUE_DEFAULT, REGEN_RATE_DEFAULT
} from '../data/constants.js';
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
 * Initialize type-specific runtime state on a monster instance.
 * Supports multi-type via "type1+type2" format.
 * @param {Object} monster - Runtime monster instance
 * @param {Object} definition - Static monster definition
 */
function initializeType(monster, definition) {
  const types = monster.type.split('+');

  for (const t of types) {
    if (t === 'swift') {
      monster.escapeTimer = definition.escapeTimer || ESCAPE_TIMER_DEFAULT;
      monster.maxEscapeTimer = monster.escapeTimer;
      monster.escapeDamage = definition.escapeDamage || ESCAPE_DAMAGE_DEFAULT;
    }
    if (t === 'aggressive') {
      monster.attackTimer = 0;
      monster.attackPhase = 'safe';
      monster.mechanics = definition.mechanics || {};
    }
    if (t === 'shielded') {
      const pct = definition.shieldPercent || SHIELD_PERCENT_DEFAULT;
      monster.shield = Math.floor(monster.maxHealth * pct);
      monster.maxShield = monster.shield;
      monster.shieldDR = definition.shieldDamageReduction || SHIELD_DR_DEFAULT;
    }
    if (t === 'armored') {
      monster.armorValue = definition.armorValue || ARMOR_VALUE_DEFAULT;
    }
    if (t === 'regenerating') {
      monster.regenRate = definition.regenRate || REGEN_RATE_DEFAULT;
    }
  }
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

  const monster = {
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
    lootTable: definition.lootTable || [],

    // Type-specific runtime state (defaults, overridden by initializeType)
    shield: 0,
    maxShield: 0,
    shieldDR: 0,
    escapeTimer: 0,
    maxEscapeTimer: 0,
    escapeDamage: 0,
    attackTimer: 0,
    attackPhase: 'safe',
    mechanics: null,
    armorValue: 0,
    regenRate: 0,
    frozen: false,
    frozenUntil: 0
  };

  // Initialize type-specific mechanics
  if (definition.type !== 'normal') {
    initializeType(monster, definition);
  }

  return monster;
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
  on('player:respawned', scheduleSpawn);
}

export function update(dt) {
  if (!waitingToSpawn) return;

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    waitingToSpawn = false;
    spawnNext();
  }
}

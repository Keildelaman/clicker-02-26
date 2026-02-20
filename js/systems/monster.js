/**
 * monster.js - Monster System
 *
 * Owns: Monster selection, instance creation, type initialization, boss spawning.
 * Listens to: combat:dyingComplete, player:respawned, zone:changed
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
  SHIELD_PERCENT_DEFAULT,
  ARMOR_VALUE_DEFAULT, REGEN_RATE_DEFAULT,
  MONSTER_ARMOR_DEFAULT, MONSTER_MAGIC_RESIST_DEFAULT,
  DAMAGE_TYPES
} from '../data/constants.js';
import { bossEffectiveLevel, bossScaledHP, bossAffixTier } from '../data/balance.js';
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
    }
    if (t === 'armored') {
      // Armored type overrides base armor with higher value
      monster.armor = definition.armor || ARMOR_VALUE_DEFAULT;
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

    // Defense stats (all monsters have these; armored type overrides armor)
    armor: definition.armor || MONSTER_ARMOR_DEFAULT,
    magicResist: definition.magicResist || MONSTER_MAGIC_RESIST_DEFAULT,
    damageType: definition.damageType || DAMAGE_TYPES.PHYSICAL,
    statusImmunities: definition.statusImmunities || [],
    statusEffectOnHit: definition.statusEffectOnHit || null,

    // Type-specific runtime state (defaults, overridden by initializeType)
    shield: 0,
    maxShield: 0,
    escapeTimer: 0,
    maxEscapeTimer: 0,
    escapeDamage: 0,
    attackTimer: 0,
    attackPhase: 'safe',
    mechanics: null,
    regenRate: 0,
    frozen: false,
    frozenUntil: 0,
    slowed: false,
    slowStrength: 0,
    freezeCooldown: 0
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
 * Spawn a specific boss by ID.
 * @param {string} bossId - Monster definition ID
 */
export function spawnBoss(bossId) {
  const definition = MONSTERS[bossId];
  if (!definition || !definition.isBoss) return;

  // Cancel any pending spawn
  waitingToSpawn = false;
  spawnTimer = 0;

  const monster = createMonsterInstance(definition);

  // Phase 12.5: Boss scaling — HP scales with player level
  const effLevel = bossEffectiveLevel(definition.levelMin, state.player.level);
  monster.level = effLevel;
  monster.maxHealth = bossScaledHP(definition.baseHealth, effLevel);
  monster.currentHealth = monster.maxHealth;
  monster.affixTier = bossAffixTier(effLevel);

  // Re-init shielded type (shield scales with new maxHealth)
  if (definition.type.includes('shielded')) {
    const pct = definition.shieldPercent || SHIELD_PERCENT_DEFAULT;
    monster.shield = Math.floor(monster.maxHealth * pct);
    monster.maxShield = monster.shield;
  }

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

/**
 * Immediately spawn the next monster with no delay.
 * Used for non-boss kills to eliminate downtime.
 */
export function spawnImmediate() {
  waitingToSpawn = false;
  spawnTimer = 0;
  spawnNext();
}

/**
 * Handle boss start event from the UI modal.
 * Despawns current monster and spawns the boss.
 */
function handleBossStart({ bossId }) {
  state.currentMonster = null;
  state.combatState = 'idle';
  spawnBoss(bossId);
}

export function init() {
  on('combat:dyingComplete', scheduleSpawn);
  on('combat:requestImmediateSpawn', spawnImmediate);
  on('player:respawned', scheduleSpawn);
  on('zone:changed', scheduleSpawn);
  on('zone:bossStart', handleBossStart);
}

export function update(dt) {
  if (!waitingToSpawn) return;

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    waitingToSpawn = false;
    spawnNext();
  }
}

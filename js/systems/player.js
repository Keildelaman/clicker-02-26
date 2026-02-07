/**
 * player.js - Player System
 *
 * Owns: Stat computation, derived stat caching, new player creation.
 * Listens to: player:levelUp, item:equipped (future)
 * Emits: player:statsChanged
 *
 * @see docs/systems/combat.system.md
 * @see docs/schemas/player.schema.md
 */

import { on, emit } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import {
  BASE_PLAYER_ATTACK, BASE_CRIT_CHANCE, BASE_CRIT_MULTIPLIER,
  BASE_PLAYER_HP, HP_PER_LEVEL, BASE_HP_REGEN,
  MAX_ENERGY, SAVE_VERSION
} from '../data/constants.js';

// --- Stat Cache ---
let statCache = null;
let cacheValid = false;

export function invalidateStatCache() {
  cacheValid = false;
}

/**
 * Get computed player stats (cached).
 * @returns {Object} Computed stats
 */
export function getComputedStats() {
  if (cacheValid && statCache) return statCache;

  const player = getPlayer();

  statCache = {
    attack: computeTotalAttack(player),
    critChance: computeTotalCritChance(player),
    critDamage: computeTotalCritDamage(player),
    maxHP: computeMaxHP(player),
    hpRegen: BASE_HP_REGEN,
    goldFind: 0,
    xpBonus: 0,
    damageReduction: 0,
    armorPen: 0
  };
  cacheValid = true;
  return statCache;
}

function computeTotalAttack(player) {
  return BASE_PLAYER_ATTACK + (player.level - 1);
}

function computeTotalCritChance(player) {
  return BASE_CRIT_CHANCE;
}

function computeTotalCritDamage(player) {
  return BASE_CRIT_MULTIPLIER;
}

function computeMaxHP(player) {
  return BASE_PLAYER_HP + (HP_PER_LEVEL * (player.level - 1));
}

/**
 * Create a fresh player object.
 * @returns {Object} New player state
 */
export function createNewPlayer() {
  return {
    saveVersion: SAVE_VERSION,
    createdAt: Date.now(),
    lastSavedAt: Date.now(),
    totalPlayTime: 0,

    name: 'Hero',

    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXpEarned: 0,

    gold: 0,
    totalGoldEarned: 0,
    totalGoldSpent: 0,

    hp: BASE_PLAYER_HP,
    maxHP: BASE_PLAYER_HP,
    energy: 0,
    maxEnergy: MAX_ENERGY,

    equipment: { weapon: null, armor: null, accessory: null },
    inventory: [],

    unlockedSkills: ['skill_power_strike'],
    masteryPoints: 0,
    masterySpent: 0,
    skills: {
      skill_power_strike: { level: 1, lastUsed: null }
    },
    equippedActiveSkills: ['skill_power_strike', null, null, null],
    equippedPassiveSkills: [null, null, null],

    currentZone: 'whisperwood',
    unlockedZones: ['whisperwood'],
    bossesDefeated: [],

    ascension: {
      level: 0,
      totalAscensions: 0,
      damageBonus: 0,
      goldBonus: 0,
      xpBonus: 0,
      flatHP: 0,
      fastestRun: null,
      history: []
    },

    vault: [],

    statistics: {
      totalClicks: 0,
      totalKills: 0,
      totalBossKills: 0,
      highestDamage: 0,
      totalCriticals: 0,
      timePlayed: 0,
      totalDeaths: 0,
      totalHealingDone: 0,
      totalDamageTaken: 0
    },

    settings: {
      soundVolume: 0.8,
      musicVolume: 0.5,
      showDamageNumbers: true,
      screenShake: false,
      autoSave: true
    },

    tutorial: {
      completed: {},
      tipsShown: 0,
      lastTipTime: null,
      tutorialEnabled: true
    }
  };
}

// --- Initialization ---

export function init() {
  on('player:levelUp', invalidateStatCache);
}

export function update(dt) {
  // Future: track play time
}

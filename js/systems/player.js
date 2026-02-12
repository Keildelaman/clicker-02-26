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
import { state, getPlayer } from '../core/game-state.js';
import {
  BASE_CRIT_CHANCE, BASE_CRIT_MULTIPLIER,
  BASE_PLAYER_HP, BASE_HP_REGEN,
  MAX_ENERGY, SAVE_VERSION
} from '../data/constants.js';
import { maxHPAtLevel, baseAttackAtLevel } from '../data/balance.js';
import { ITEMS } from '../data/items.data.js';
import { SKILLS } from '../data/skills.data.js';

// --- Stat Cache ---
let statCache = null;
let cacheValid = false;

export function invalidateStatCache() {
  cacheValid = false;
}

/**
 * Sum a single stat across all equipped items.
 * @param {Object} player - Player state
 * @param {string} statName - Stat key to sum
 * @returns {number} Total bonus from equipment
 */
function getEquipmentBonus(player, statName) {
  let total = 0;
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const itemId = player.equipment[slot];
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (item && item.stats[statName]) {
      total += item.stats[statName];
    }
  }
  return total;
}

/**
 * Get the bonus value from equipped passive skills for a given stat.
 * Stat-only passives: heavy_handed (damage), berserker (damage + critChance, conditional),
 * efficient_casting (skillEnergyCost).
 * @param {Object} player
 * @param {string} statName - 'damage', 'critChance', 'skillEnergyCost'
 * @returns {number} Fractional bonus (e.g. 0.40 for 40%)
 */
function getPassiveSkillBonus(player, statName) {
  let total = 0;
  for (const skillId of player.equippedPassive) {
    if (!skillId) continue;
    const level = player.unlockedSkills[skillId];
    if (!level) continue;
    const skillDef = SKILLS[skillId];
    if (!skillDef) continue;
    const data = skillDef.levels[level];
    if (!data) continue;

    switch (skillId) {
      case 'heavy_handed':
        if (statName === 'damage') total += data.dmgBonus / 100;
        break;
      case 'berserker':
        if (player.hp / player.maxHP < data.hpThreshold / 100) {
          if (statName === 'damage') total += data.dmgBonus / 100;
          if (statName === 'critChance') total += data.critBonus / 100;
        }
        break;
      case 'efficient_casting':
        if (statName === 'skillEnergyCost') total += data.costReduction / 100;
        break;
    }
  }
  return total;
}

/**
 * Aggregate buff effects from state.activeBuffs.
 * @returns {Object} Combined buff effects
 */
function getBuffEffects() {
  const effects = {
    damageMultiplier: 1.0,
    damageTakenMultiplier: 1.0,
    critBonus: 0,
    damageReduction: 0,
    goldBonus: 0,
    xpBonus: 0,
    reflectMultiplier: 0,
    survivePercent: 0,
    invulnerable: false,
    bonusDamage: 0
  };

  for (const [, buff] of Object.entries(state.activeBuffs)) {
    const e = buff.effects;
    if (e.damageMultiplier) effects.damageMultiplier *= e.damageMultiplier;
    if (e.damageTakenMultiplier) effects.damageTakenMultiplier *= e.damageTakenMultiplier;
    if (e.critBonus) effects.critBonus += e.critBonus;
    if (e.damageReduction) effects.damageReduction += e.damageReduction;
    if (e.goldBonus) effects.goldBonus += e.goldBonus;
    if (e.xpBonus) effects.xpBonus += e.xpBonus;
    if (e.reflectMultiplier) effects.reflectMultiplier += e.reflectMultiplier;
    if (e.survivePercent) effects.survivePercent = Math.max(effects.survivePercent, e.survivePercent);
    if (e.invulnerable) effects.invulnerable = true;
    if (e.bonusDamage) effects.bonusDamage += e.bonusDamage;
    if (e.damageBonus) effects.damageMultiplier *= (1 + e.damageBonus);
  }

  return effects;
}

/**
 * Get computed player stats (cached).
 * @returns {Object} Computed stats
 */
export function getComputedStats() {
  if (cacheValid && statCache) return statCache;

  const player = getPlayer();
  const buffFx = getBuffEffects();

  // Base + equipment
  let attack = computeTotalAttack(player);
  let critChance = computeTotalCritChance(player);
  let critDamage = computeTotalCritDamage(player);
  let maxHP = computeMaxHP(player);
  let hpRegen = BASE_HP_REGEN + getEquipmentBonus(player, 'hpRegen');
  let goldFind = getEquipmentBonus(player, 'goldFind');
  let xpBonus = getEquipmentBonus(player, 'xpBonus');
  let damageReduction = getEquipmentBonus(player, 'damageReduction');
  let armorPen = getEquipmentBonus(player, 'armorPen');
  let energyGainMult = 1.0;
  let warningBonus = 0;

  // Passive skill bonuses
  const dmgPassive = getPassiveSkillBonus(player, 'damage');
  if (dmgPassive) attack = Math.floor(attack * (1 + dmgPassive));

  critChance += getPassiveSkillBonus(player, 'critChance');
  armorPen += getPassiveSkillBonus(player, 'armorPen');

  const hpPassive = getPassiveSkillBonus(player, 'maxHP');
  if (hpPassive) maxHP = Math.floor(maxHP * (1 + hpPassive));

  hpRegen += getPassiveSkillBonus(player, 'hpRegen');
  goldFind += getPassiveSkillBonus(player, 'goldFind');
  xpBonus += getPassiveSkillBonus(player, 'xpBonus');

  const energyPassive = getPassiveSkillBonus(player, 'energyGain');
  if (energyPassive) energyGainMult *= (1 + energyPassive);

  warningBonus += getPassiveSkillBonus(player, 'warningTime');

  // Skill-enhancing stats from equipment + passive
  const skillCooldown = getEquipmentBonus(player, 'skillCooldown');
  const skillEnergyCostEquip = getEquipmentBonus(player, 'skillEnergyCost');
  const skillEnergyCostPassive = getPassiveSkillBonus(player, 'skillEnergyCost');
  const skillEnergyCost = skillEnergyCostEquip + skillEnergyCostPassive;
  const skillBoost_power_strike = getEquipmentBonus(player, 'skillBoost_power_strike');
  const skillBoost_heal = getEquipmentBonus(player, 'skillBoost_heal');
  const skillBoost_execute = getEquipmentBonus(player, 'skillBoost_execute');
  const skillBoost_berserk = getEquipmentBonus(player, 'skillBoost_berserk');

  // Active buff bonuses
  attack = Math.floor(attack * buffFx.damageMultiplier);
  critChance += buffFx.critBonus;
  goldFind += buffFx.goldBonus;
  xpBonus += buffFx.xpBonus;
  damageReduction += buffFx.damageReduction;

  statCache = {
    attack,
    critChance,
    critDamage,
    maxHP,
    hpRegen,
    goldFind,
    xpBonus,
    damageReduction,
    armorPen,
    energyGainMult,
    warningBonus,
    skillCooldown,
    skillEnergyCost,
    skillBoost_power_strike,
    skillBoost_heal,
    skillBoost_execute,
    skillBoost_berserk,
    damageMultiplier: buffFx.damageMultiplier,
    damageTakenMultiplier: buffFx.damageTakenMultiplier,
    reflectMultiplier: buffFx.reflectMultiplier,
    survivePercent: buffFx.survivePercent,
    invulnerable: buffFx.invulnerable,
    bonusDamage: buffFx.bonusDamage
  };
  cacheValid = true;
  return statCache;
}

function computeTotalAttack(player) {
  return baseAttackAtLevel(player.level) + getEquipmentBonus(player, 'attack');
}

function computeTotalCritChance(player) {
  return BASE_CRIT_CHANCE + getEquipmentBonus(player, 'critChance');
}

function computeTotalCritDamage(player) {
  return BASE_CRIT_MULTIPLIER + getEquipmentBonus(player, 'critDamage');
}

function computeMaxHP(player) {
  return maxHPAtLevel(player.level) + getEquipmentBonus(player, 'maxHP');
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

    skillPoints: 0,
    totalSPEarned: 0,
    respecCount: 0,
    unlockedSkills: { 'power_strike': 1 },
    equippedActive: ['power_strike', null, null, null],
    equippedPassive: [null, null, null],
    skillCooldowns: {},

    currentZone: 'whisperwood',
    unlockedZones: ['whisperwood'],
    bossesDefeated: [],
    zoneKills: {},

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
  on('item:equipped', invalidateStatCache);
  on('item:unequipped', invalidateStatCache);
  on('skill:equipped', invalidateStatCache);
  on('skill:unequipped', invalidateStatCache);
  on('skill:buffApplied', invalidateStatCache);
  on('skill:buffExpired', invalidateStatCache);
  on('player:hpChanged', invalidateStatCache);
}

export function update(dt) {
  // Future: track play time
}

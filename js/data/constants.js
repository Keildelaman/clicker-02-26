/**
 * constants.js - Global Game Constants
 *
 * Single source of truth for all magic numbers.
 * Mirrors docs/_INDEX.md — change here = change everywhere.
 *
 * @see docs/_INDEX.md
 */

// Game Identity
export const GAME_NAME = 'Realms of Clickoria';
export const VERSION = '1.0.0';
export const MAX_PLAYER_LEVEL = 100;

// Timing (milliseconds)
export const AUTO_SAVE_INTERVAL = 30000;
export const MONSTER_SPAWN_DELAY = 500;
export const DAMAGE_NUMBER_DURATION = 800;
export const LEVEL_UP_CELEBRATION = 3500;
export const ENERGY_GAIN_COOLDOWN = 200;
export const SPAWN_ANIMATION_DURATION = 200;
export const DEATH_ANIMATION_DURATION = 300;

// Combat Defaults
export const BASE_PLAYER_ATTACK = 5;
export const BASE_CRIT_CHANCE = 0.05;
export const BASE_CRIT_MULTIPLIER = 2.0;
export const MIN_DAMAGE = 1;

// Health Defaults
export const BASE_PLAYER_HP = 100;
export const HP_PER_LEVEL = 10;
export const BASE_HP_REGEN = 0.015;
export const HP_CAUTION_THRESHOLD = 0.5;
export const HP_CRITICAL_THRESHOLD = 0.25;

// Energy Defaults
export const MAX_ENERGY = 100;
export const ENERGY_PER_CLICK = 5;
export const ENERGY_ON_KILL = 15;
export const ENERGY_ON_BOSS_KILL = 50;
export const ENERGY_REGEN_PER_SECOND = 2;

// Death Penalties
export const DEATH_GOLD_LOSS = 0.5;
export const DEATH_LEVEL_MILESTONE = 10;

// Economy Defaults
export const STARTING_GOLD = 0;
export const SELL_PRICE_RATIO = 0.25;

// Equipment Slots
export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'accessory'];

// Progression Defaults
export const STARTING_LEVEL = 1;
export const BASE_XP_REQUIREMENT = 100;
export const XP_GROWTH_RATE = 0.12;

// Skill Defaults
export const ACTIVE_SKILL_SLOTS = 4;
export const PASSIVE_SKILL_SLOTS = 3;
export const BASE_SKILL_MAX_LEVEL = 5;

// Ascension Defaults
export const ASCENSION_DAMAGE_BONUS = 0.05;
export const ASCENSION_GOLD_BONUS = 0.05;
export const ASCENSION_XP_BONUS = 0.05;
export const ASCENSION_HP_BONUS = 50;
export const ASCENSION_MP_BONUS = 3;

// Vault
export const VAULT_MAX_SLOTS = 8;
export const VAULT_WITHDRAW_COST = 0.25;

// Save
export const SAVE_KEY = 'clickoria_save_v2';
export const SAVE_VERSION = 2;

// Shop / Economy
export const SHOP_REFRESH_INTERVAL = 600000; // 10 minutes
export const SHOP_SLOTS = 3;
export const SHOP_RARITY_WEIGHTS = {
  common: 50,
  uncommon: 35,
  rare: 12,
  epic: 3,
  legendary: 0
};
export const SHOP_REFRESH_ESCALATION = 0.5; // +50% per manual refresh
export const SHOP_REFRESH_MAX_MULT = 5.0;

// Rarity System
export const RARITIES = {
  common:    { name: 'Common',    color: '#9d9d9d', weight: 70,  statMult: 1.0 },
  uncommon:  { name: 'Uncommon',  color: '#1eff00', weight: 20,  statMult: 1.5 },
  rare:      { name: 'Rare',      color: '#0070dd', weight: 8,   statMult: 2.0 },
  epic:      { name: 'Epic',      color: '#a335ee', weight: 1.8, statMult: 3.0 },
  legendary: { name: 'Legendary', color: '#ff8000', weight: 0.2, statMult: 5.0 }
};

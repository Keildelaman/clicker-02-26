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
export const ENERGY_PER_CLICK = 1;
export const ENERGY_ON_KILL = 5;
export const ENERGY_ON_BOSS_KILL = 20;
export const ENERGY_REGEN_PER_SECOND = 0;

// Death Penalties
export const DEATH_GOLD_LOSS = 0.5;
export const DEATH_LEVEL_MILESTONE = 10;
export const DEATH_RESPAWN_DELAY = 1500; // ms before respawn after death

// Monster Type Defaults
export const ESCAPE_DAMAGE_DEFAULT = 0.05;   // 5% of player maxHP
export const ESCAPE_TIMER_DEFAULT = 8000;     // ms
export const SHIELD_PERCENT_DEFAULT = 0.30;   // 30% of monster HP
export const SHIELD_DR_DEFAULT = 0.50;        // 50% damage reduction while shielded
export const REGEN_RATE_DEFAULT = 0.03;       // 3% maxHP per second
export const ARMOR_VALUE_DEFAULT = 15;
export const AGGRESSIVE_DAMAGE_DEFAULT = 0.10; // 10% of player maxHP

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

// Mastery Points
export const MASTERY_PER_BOSS = 2;
export const MASTERY_MILESTONES = { 5:3, 10:3, 15:3, 20:3, 30:4, 40:4, 50:5, 60:5, 75:5, 90:5 };

// Skill Unlock Costs by Tier
export const SKILL_UNLOCK_COSTS = { starter:0, basic:3, utility:4, combat:5, advanced:6, elite:8, master:10 };

// Upgrade Costs (index = levels gained, cost to reach level 2,3,4,5)
export const SKILL_UPGRADE_COSTS = [1, 2, 3, 4];

// Swap cooldown penalty (50% of skill's cooldown applied on swap-in)
export const SKILL_SWAP_COOLDOWN_PENALTY = 0.5;

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

// Tutorial
export const FIRST_KILL_BONUS_GOLD = 10;
export const FIRST_SKILL_USE_BONUS_ENERGY = 25;
export const FIRST_ITEM_BONUS_GOLD = 25;
export const FIRST_BOSS_BONUS_MULTIPLIER = 1.5;
export const MIN_TIME_BETWEEN_TIPS = 60000;
export const MAX_TIPS_PER_SESSION = 10;
export const TIP_DISPLAY_DURATION = 5000;
export const TIPS_DISABLED_AFTER_LEVEL = 20;
export const SHOP_SUGGEST_LEVEL = 3;
export const SHOP_SUGGEST_GOLD = 50;

// Rarity System
export const RARITIES = {
  common:    { name: 'Common',    color: '#9d9d9d', weight: 70,  statMult: 1.0 },
  uncommon:  { name: 'Uncommon',  color: '#1eff00', weight: 20,  statMult: 1.5 },
  rare:      { name: 'Rare',      color: '#0070dd', weight: 8,   statMult: 2.0 },
  epic:      { name: 'Epic',      color: '#a335ee', weight: 1.8, statMult: 3.0 },
  legendary: { name: 'Legendary', color: '#ff8000', weight: 0.2, statMult: 5.0 }
};

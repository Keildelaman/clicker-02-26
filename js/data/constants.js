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

// Skill Hit Stagger
export const BARRAGE_HIT_DELAY = 100; // ms between each Barrage hit

// Overkill & Instant Spawn
export const OVERKILL_CARRY_PERCENT = 100;  // % of overkill damage that carries to next monster
export const OVERKILL_CHAIN_MAX = 3;        // Max consecutive overkill chains to prevent infinite loops

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
export const ENERGY_PER_CLICK = 3;
export const ENERGY_ON_KILL = 10;
export const ENERGY_ON_BOSS_KILL = 25;
export const ENERGY_REGEN_PER_SECOND = 1;

// Death Penalties
export const DEATH_GOLD_LOSS = 0.5;
export const DEATH_RESPAWN_DELAY = 1500; // ms before respawn after death

// Damage Types
export const DAMAGE_TYPES = { PHYSICAL: 'physical', MAGIC: 'magic' };

// Defense Formula: reduction = defense / (defense + DEFENSE_SCALING_FACTOR)
export const DEFENSE_SCALING_FACTOR = 100;

// Base defense per level (small gains, feels good to level up)
export const BASE_ARMOR_PER_LEVEL = 1;        // +1 armor per level (0 at L1, 99 at L100)
export const BASE_MAGIC_RESIST_PER_LEVEL = 1; // +1 MR per level (0 at L1, 99 at L100)

// Monster Default Defense
export const MONSTER_ARMOR_DEFAULT = 0;        // most monsters have 0 armor (armored type overrides)
export const MONSTER_MAGIC_RESIST_DEFAULT = 0; // most monsters have 0 MR

// Status Effects
export const STATUS_EFFECTS = {
  BLEED:  'bleed',
  POISON: 'poison',
  BURN:   'burn',
  SLOW:   'slow',
  FREEZE: 'freeze'
};

// Status Effect Defaults
export const BLEED_MAX_STACKS = 5;
export const BLEED_DURATION = 4;           // seconds
export const BLEED_TICK_INTERVAL = 1;      // seconds between ticks
export const BLEED_DAMAGE_TYPE = 'physical';

export const POISON_MAX_STACKS = 10;
export const POISON_DURATION = 5;          // seconds
export const POISON_TICK_INTERVAL = 1;     // seconds between ticks
export const POISON_DAMAGE_TYPE = 'physical';

export const BURN_DURATION = 3.5;          // seconds
export const BURN_TICK_INTERVAL = 0.5;     // seconds between ticks (faster ticks, no stacking)
export const BURN_DAMAGE_TYPE = 'magic';

export const SLOW_DURATION = 4;            // seconds
export const SLOW_STRENGTH = 0.30;         // 30% action speed reduction

export const FREEZE_DURATION = 1.5;        // seconds
export const FREEZE_REAPPLY_COOLDOWN = 5;  // seconds before freeze can be reapplied to same target

// DoT Damage Scaling (% of source stat per tick, snapshotted at application time)
export const BLEED_DAMAGE_PERCENT = 5;     // 5% of attack per stack per tick
export const POISON_DAMAGE_PERCENT = 3;    // 3% of attack per stack per tick
export const BURN_DAMAGE_PERCENT = 10;     // 10% of magicPower per tick

// Monster Type Defaults
export const ESCAPE_DAMAGE_DEFAULT = 0.05;   // 5% of player maxHP
export const ESCAPE_TIMER_DEFAULT = 12000;    // ms (Phase 9: increased for higher HP pools)
export const SHIELD_PERCENT_DEFAULT = 0.30;   // 30% of monster HP
export const REGEN_RATE_DEFAULT = 0.008;      // 0.8% maxHP per second (Phase 9: reduced for higher HP pools)
export const ARMOR_VALUE_DEFAULT = 40;        // legacy — used as monster.armor for armored type
export const AGGRESSIVE_DAMAGE_DEFAULT = 0.10; // 10% of player maxHP

// Boss Timer Durations (milliseconds) — Phase 9: DPS check timers
export const BOSS_TIMERS = {
  boss_mossback: 60000,     // 60s  - tutorial boss, lenient
  boss_redfang: 90000,      // 90s  - first real test
  boss_mire_mother: 120000, // 120s - regen makes it tighter
  boss_grimstone: 150000,   // 150s - armor eats damage
  boss_pyrax: 180000,       // 180s - shield adds complexity
  boss_glacielle: 240000,   // 240s - multi-type nightmare
  boss_xaltheron: 300000    // 300s - final challenge
};

// Economy Defaults
export const STARTING_GOLD = 0;
export const SELL_PRICE_RATIO = 0.25;

// Progression Defaults
export const STARTING_LEVEL = 1;
export const BASE_XP_REQUIREMENT = 100;
export const XP_GROWTH_RATE = 0.12;

// Skill Defaults
export const ACTIVE_SKILL_SLOTS = 4;
export const PASSIVE_SKILL_SLOTS = 3;
export const BASE_SKILL_MAX_LEVEL = 5;

// Skill Points (v2)
export const SP_PER_LEVEL_INTERVAL = 3;
export const SP_UNLOCK_COST = 1;
export const SP_UPGRADE_COST = 1;
export const RESPEC_COSTS = [1000, 3000, 8000, 20000, 50000, 100000];

// Swap cooldown penalty (50% of skill's cooldown applied on swap-in)
export const SKILL_SWAP_COOLDOWN_PENALTY = 0.5;

// Ascension Defaults
export const ASCENSION_DAMAGE_BONUS = 0.05;
export const ASCENSION_GOLD_BONUS = 0.05;
export const ASCENSION_XP_BONUS = 0.05;
export const ASCENSION_HP_BONUS = 50;
export const ASCENSION_SP_BONUS = 3;

// Vault
export const VAULT_MAX_SLOTS = 8;
export const VAULT_WITHDRAW_COST = 0.25;

// Save
export const SAVE_KEY = 'clickoria_save_v5';
export const SAVE_VERSION = 5;

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

// === ITEM SYSTEM V2 ===
// @see docs/design/item-system-v2.md

// Equipment v2 (6 slots)
export const EQUIPMENT_SLOTS_V2 = ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'accessory'];

// Inventory
export const INVENTORY_MAX = 30;
export const INVENTORY_OVERFLOW_MAX = 3;

// Rarity affix counts (max affixes per rarity)
export const RARITY_AFFIX_COUNTS = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 4 };
// Chance of rolling max-1 affixes instead of max
export const RARITY_MAX_MINUS_ONE_CHANCE = { uncommon: 0.40, rare: 0.50, epic: 0.60 };

// Affix validation
export const MAX_STATUS_AFFIXES_PER_ITEM = 2;
export const MAX_SKILL_LEVEL_AFFIXES_PER_ITEM = 1;
export const AFFIX_REROLL_MAX_ATTEMPTS = 10;

// Tier multipliers (index 0 = T1, index 6 = T7)
export const FLAT_TIER_MULTIPLIERS = [1.0, 2.0, 3.8, 6.5, 11.0, 18.0, 30.0];
export const PERCENT_TIER_MULTIPLIERS = [1.0, 1.3, 1.7, 2.2, 2.8, 3.6, 4.5];

// Zone → tier mapping
export const ZONE_TIERS = {
  whisperwood: 1, dustwind: 2, shadowmire: 3, ironhold: 4,
  emberfell: 5, frostpeak: 6, voidrift: 7
};

// Zone required levels for items
export const ZONE_REQUIRED_LEVELS = {
  whisperwood: 1, dustwind: 10, shadowmire: 20, ironhold: 30,
  emberfell: 45, frostpeak: 60, voidrift: 75
};

// Shop v2
export const SHOP_SLOTS_V2 = 4;
export const SHOP_REFRESH_INTERVAL_V2 = 900000; // 15 minutes
export const SHOP_RARITY_WEIGHTS_V2 = { common: 55, uncommon: 35, rare: 10, epic: 0, legendary: 0 };
export const SHOP_REFRESH_COSTS = {
  whisperwood: 200, dustwind: 800, shadowmire: 2000, ironhold: 6000,
  emberfell: 15000, frostpeak: 40000, voidrift: 100000
};
export const SHOP_BUY_ZONE_BASE = {
  whisperwood: 100, dustwind: 400, shadowmire: 1000, ironhold: 3000,
  emberfell: 8000, frostpeak: 20000, voidrift: 50000
};
export const SHOP_BUY_RARITY_MULT = { common: 1.0, uncommon: 2.5, rare: 6.0 };

// Reforge
export const REFORGE_ZONE_BASE = {
  whisperwood: 200, dustwind: 600, shadowmire: 1500, ironhold: 4000,
  emberfell: 10000, frostpeak: 25000, voidrift: 60000
};
export const REFORGE_RARITY_MULT = { uncommon: 1.0, rare: 1.5, epic: 2.5, legendary: 4.0 };
export const REFORGE_ESCALATION = 2.2;

// Imbue
export const IMBUE_ZONE_BASE = {
  whisperwood: 500, dustwind: 1500, shadowmire: 4000, ironhold: 10000,
  emberfell: 25000, frostpeak: 60000, voidrift: 150000
};
export const IMBUE_RARITY_MULT = { uncommon: 1.0, rare: 2.0, epic: 4.0 };

// Temper
export const TEMPER_LEVEL_BASE = [1000, 1500, 2000, 3000, 5000, 7000, 10000, 15000, 25000, 35000, 50000, 75000];
export const TEMPER_ZONE_MULT = {
  whisperwood: 0.3, dustwind: 0.5, shadowmire: 0.8, ironhold: 1.0,
  emberfell: 1.5, frostpeak: 2.5, voidrift: 4.0
};
export const TEMPER_RARITY_MULT = { rare: 1.0, epic: 1.5, legendary: 2.5 };
export const TEMPER_BOOST_PER_CYCLE = [0.05, 0.07, 0.10]; // cycles 1, 2, 3
export const TEMPER_SELECTION_LEVELS = [1, 5, 9];
export const TEMPER_MAX_LEVEL = 12;
export const TEMPER_BRICK_THRESHOLD = 5; // full resets before bricking

// Drop rates
export const DROP_CHANCE_BY_ZONE = {
  whisperwood: 0.04, dustwind: 0.035, shadowmire: 0.03, ironhold: 0.025,
  emberfell: 0.025, frostpeak: 0.02, voidrift: 0.02
};
export const DROP_RARITY_WEIGHTS_BY_ZONE = {
  whisperwood: { common: 70, uncommon: 25, rare: 5, epic: 0 },
  dustwind:    { common: 65, uncommon: 28, rare: 7, epic: 0 },
  shadowmire:  { common: 60, uncommon: 30, rare: 8, epic: 2 },
  ironhold:    { common: 55, uncommon: 30, rare: 10, epic: 5 },
  emberfell:   { common: 50, uncommon: 30, rare: 12, epic: 8 },
  frostpeak:   { common: 45, uncommon: 30, rare: 15, epic: 10 },
  voidrift:    { common: 40, uncommon: 28, rare: 18, epic: 14 }
};
export const BOSS_DROP_RARITY_WEIGHTS = { rare: 60, epic: 35, legendary: 5 };
export const BOSS_SECOND_DROP_CHANCE = 0.40;

// Materials
export const ZONE_MATERIALS = {
  whisperwood: { id: 'mat_whisperwood', name: 'Whisperwood Sap',  dropRate: 0.10, bossCost: 5 },
  dustwind:    { id: 'mat_dustwind',    name: 'Dustwind Crystal', dropRate: 0.08, bossCost: 6 },
  shadowmire:  { id: 'mat_shadowmire',  name: 'Shadow Essence',  dropRate: 0.07, bossCost: 7 },
  ironhold:    { id: 'mat_ironhold',    name: 'Iron Core',       dropRate: 0.06, bossCost: 8 },
  emberfell:   { id: 'mat_emberfell',   name: 'Ember Shard',     dropRate: 0.05, bossCost: 9 },
  frostpeak:   { id: 'mat_frostpeak',   name: 'Frost Fragment',  dropRate: 0.04, bossCost: 10 },
  voidrift:    { id: 'mat_voidrift',    name: 'Void Particle',   dropRate: 0.03, bossCost: 12 }
};
export const MATERIAL_DECAY_FACTOR = 0.7;

// Boss scaling
export const BOSS_HP_SCALING_FACTOR = 0.12;
export const BOSS_DAMAGE_SCALING_FACTOR = 0.10;
export const BOSS_LEVEL_BUFFER = 5;
export const BOSS_AFFIX_TIER_DIVISOR = 14;

// Skill level from items
export const BEYOND_MAX_SKILL_BONUS_PER_LEVEL = 0.20;

// Naming
export const EPIC_RARITY_PREFIX_CHANCE = 0.50;

// Sell price (base only — modifications don't increase sell value)
export const SELL_PRICE_RATIO_V2 = 0.25;

// Legendary Effects (Phase 12.8)
export const LEGENDARY_EFFECTS = {
  DOUBLE_HIT_MULT: 0.6,
  DODGE_CHANCE: 0.2,
  STATUS_DURATION_BONUS: 0.4,
  ARMOR_TO_MR_RATIO: 0.5,
  HIGH_HP_THRESHOLD: 0.8,
  HIGH_HP_DAMAGE_BONUS: 0.25,
  LOW_HP_THRESHOLD: 0.3,
  BLEED_SLOW_BONUS: 0.5,
  CRIT_FREEZE_DURATION: 0.5,
  SHIELD_REGEN_RATE: 0.05,
  SHIELD_REGEN_IDLE_TIME: 3.0,
  KILL_SHIELD_CHANCE: 0.1,
  DAMAGE_TO_SHIELD_RATIO: 0.05,
  CDR_ON_KILL: 1.0
};


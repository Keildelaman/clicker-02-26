/**
 * affixes.data.js - Item Affix Definitions
 *
 * 63 affixes across 6 categories for the Item System v2.
 * Pure data — no imports, no logic.
 *
 * Categories (for slot weighting):
 *   offensive (6), defensive (5), utility (4),
 *   statusChance (5), statusPotency (5), skillCategory (38)
 *
 * Scale types:
 *   flat       — uses FLAT_TIER_MULTIPLIERS, integer values
 *   percentage — uses PERCENT_TIER_MULTIPLIERS, decimal values (0.01 = 1%)
 *   zoneBased  — skill level affixes, uses zone-based +1/+2/+3 table
 *
 * @see docs/design/item-system-v2.md (Section 4)
 */

// ============================================================
// AFFIX DEFINITIONS (63 total)
// ============================================================

export const AFFIXES = {

  // --- Offensive (6) ---

  flat_attack: {
    id: 'flat_attack',
    name: '+X Attack',
    category: 'offensive',
    scaleType: 'flat',
    t1Min: 2, t1Max: 6,
    weight: 25
  },
  flat_magic_power: {
    id: 'flat_magic_power',
    name: '+X Magic Power',
    category: 'offensive',
    scaleType: 'flat',
    t1Min: 2, t1Max: 6,
    weight: 25
  },
  crit_chance: {
    id: 'crit_chance',
    name: '+X% Crit Chance',
    category: 'offensive',
    scaleType: 'percentage',
    t1Min: 0.01, t1Max: 0.02,
    weight: 18
  },
  crit_damage: {
    id: 'crit_damage',
    name: '+X% Crit Damage',
    category: 'offensive',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 18
  },
  armor_pen: {
    id: 'armor_pen',
    name: '+X% Armor Penetration',
    category: 'offensive',
    scaleType: 'percentage',
    t1Min: 0.01, t1Max: 0.03,
    weight: 7
  },
  magic_pen: {
    id: 'magic_pen',
    name: '+X% Magic Penetration',
    category: 'offensive',
    scaleType: 'percentage',
    t1Min: 0.01, t1Max: 0.03,
    weight: 7
  },

  // --- Defensive (5) ---

  flat_armor: {
    id: 'flat_armor',
    name: '+X Armor',
    category: 'defensive',
    scaleType: 'flat',
    t1Min: 3, t1Max: 8,
    weight: 25
  },
  flat_magic_resist: {
    id: 'flat_magic_resist',
    name: '+X Magic Resist',
    category: 'defensive',
    scaleType: 'flat',
    t1Min: 3, t1Max: 8,
    weight: 25
  },
  flat_max_hp: {
    id: 'flat_max_hp',
    name: '+X Max HP',
    category: 'defensive',
    scaleType: 'flat',
    t1Min: 8, t1Max: 20,
    weight: 22
  },
  flat_max_shield: {
    id: 'flat_max_shield',
    name: '+X Max Shield',
    category: 'defensive',
    scaleType: 'flat',
    t1Min: 5, t1Max: 12,
    weight: 15
  },
  hp_regen: {
    id: 'hp_regen',
    name: '+X% HP Regen/sec',
    category: 'defensive',
    scaleType: 'percentage',
    t1Min: 0.002, t1Max: 0.005,
    weight: 13
  },

  // --- Utility (4) ---

  gold_find: {
    id: 'gold_find',
    name: '+X% Gold Find',
    category: 'utility',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 28
  },
  xp_bonus: {
    id: 'xp_bonus',
    name: '+X% XP Bonus',
    category: 'utility',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 28
  },
  energy_gain: {
    id: 'energy_gain',
    name: '+X% Energy Gain',
    category: 'utility',
    scaleType: 'percentage',
    t1Min: 0.02, t1Max: 0.05,
    weight: 24
  },
  skill_cooldown: {
    id: 'skill_cooldown',
    name: '+X% Cooldown Reduction',
    category: 'utility',
    scaleType: 'percentage',
    t1Min: 0.02, t1Max: 0.04,
    weight: 20
  },

  // --- Status Chance (5) ---

  bleed_chance: {
    id: 'bleed_chance',
    name: '+X% Bleed Chance',
    category: 'statusChance',
    scaleType: 'percentage',
    t1Min: 0.02, t1Max: 0.05,
    weight: 25
  },
  poison_chance: {
    id: 'poison_chance',
    name: '+X% Poison Chance',
    category: 'statusChance',
    scaleType: 'percentage',
    t1Min: 0.02, t1Max: 0.05,
    weight: 25
  },
  burn_chance: {
    id: 'burn_chance',
    name: '+X% Burn Chance',
    category: 'statusChance',
    scaleType: 'percentage',
    t1Min: 0.02, t1Max: 0.05,
    weight: 22
  },
  slow_chance: {
    id: 'slow_chance',
    name: '+X% Slow Chance',
    category: 'statusChance',
    scaleType: 'percentage',
    t1Min: 0.01, t1Max: 0.03,
    weight: 18
  },
  freeze_chance: {
    id: 'freeze_chance',
    name: '+X% Freeze Chance',
    category: 'statusChance',
    scaleType: 'percentage',
    t1Min: 0.01, t1Max: 0.02,
    weight: 10
  },

  // --- Status Potency (5) ---

  bleed_potency: {
    id: 'bleed_potency',
    name: '+X% Bleed Damage',
    category: 'statusPotency',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.07,
    weight: 25
  },
  poison_potency: {
    id: 'poison_potency',
    name: '+X% Poison Damage',
    category: 'statusPotency',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.07,
    weight: 25
  },
  burn_potency: {
    id: 'burn_potency',
    name: '+X% Burn Damage',
    category: 'statusPotency',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.07,
    weight: 22
  },
  slow_strength: {
    id: 'slow_strength',
    name: '+X% Slow Effectiveness',
    category: 'statusPotency',
    scaleType: 'percentage',
    t1Min: 0.02, t1Max: 0.05,
    weight: 18
  },
  freeze_duration: {
    id: 'freeze_duration',
    name: '+X% Freeze Duration',
    category: 'statusPotency',
    scaleType: 'percentage',
    t1Min: 0.02, t1Max: 0.05,
    weight: 10
  },

  // --- Skill Category: Power Boost (5) ---

  skill_speed_boost: {
    id: 'skill_speed_boost',
    name: '+X% Speed Skill Power',
    category: 'skillCategory',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 14
  },
  skill_power_boost: {
    id: 'skill_power_boost',
    name: '+X% Power Skill Power',
    category: 'skillCategory',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 14
  },
  skill_crit_boost: {
    id: 'skill_crit_boost',
    name: '+X% Crit Skill Power',
    category: 'skillCategory',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 14
  },
  skill_mage_boost: {
    id: 'skill_mage_boost',
    name: '+X% Mage Skill Power',
    category: 'skillCategory',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 14
  },
  skill_utility_boost: {
    id: 'skill_utility_boost',
    name: '+X% Utility Skill Power',
    category: 'skillCategory',
    scaleType: 'percentage',
    t1Min: 0.03, t1Max: 0.06,
    weight: 14
  },

  // --- Skill Category: Category Level Boost (6) ---

  skill_speed_level: {
    id: 'skill_speed_level',
    name: '+X to Speed Skills',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skillCategory: 'speed',
    weight: 5
  },
  skill_power_level: {
    id: 'skill_power_level',
    name: '+X to Power Skills',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skillCategory: 'power',
    weight: 5
  },
  skill_crit_level: {
    id: 'skill_crit_level',
    name: '+X to Crit Skills',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skillCategory: 'crit',
    weight: 5
  },
  skill_mage_level: {
    id: 'skill_mage_level',
    name: '+X to Mage Skills',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skillCategory: 'mage',
    weight: 5
  },
  skill_utility_level: {
    id: 'skill_utility_level',
    name: '+X to Utility Skills',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skillCategory: 'utility',
    weight: 5
  },
  skill_all_level: {
    id: 'skill_all_level',
    name: '+X to All Skills',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    isAllSkills: true,
    weight: 1
  },

  // --- Skill Category: Individual Skill Level (25) ---
  // Active skills (15)

  skill_power_strike_level: {
    id: 'skill_power_strike_level',
    name: '+X to Power Strike',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'power_strike',
    weight: 2
  },
  skill_charge_up_level: {
    id: 'skill_charge_up_level',
    name: '+X to Charge Up',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'charge_up',
    weight: 2
  },
  skill_shatter_level: {
    id: 'skill_shatter_level',
    name: '+X to Shatter',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'shatter',
    weight: 2
  },
  skill_flurry_level: {
    id: 'skill_flurry_level',
    name: '+X to Flurry',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'flurry',
    weight: 2
  },
  skill_barrage_level: {
    id: 'skill_barrage_level',
    name: '+X to Barrage',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'barrage',
    weight: 2
  },
  skill_momentum_level: {
    id: 'skill_momentum_level',
    name: '+X to Momentum',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'momentum',
    weight: 2
  },
  skill_precision_level: {
    id: 'skill_precision_level',
    name: '+X to Precision',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'precision',
    weight: 2
  },
  skill_execute_level: {
    id: 'skill_execute_level',
    name: '+X to Execute',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'execute',
    weight: 2
  },
  skill_adrenaline_rush_level: {
    id: 'skill_adrenaline_rush_level',
    name: '+X to Adrenaline Rush',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'adrenaline_rush',
    weight: 2
  },
  skill_arcane_bolt_level: {
    id: 'skill_arcane_bolt_level',
    name: '+X to Arcane Bolt',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'arcane_bolt',
    weight: 2
  },
  skill_chain_lightning_level: {
    id: 'skill_chain_lightning_level',
    name: '+X to Chain Lightning',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'chain_lightning',
    weight: 2
  },
  skill_overcharge_level: {
    id: 'skill_overcharge_level',
    name: '+X to Overcharge',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'overcharge',
    weight: 2
  },
  skill_energy_surge_level: {
    id: 'skill_energy_surge_level',
    name: '+X to Energy Surge',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'energy_surge',
    weight: 2
  },
  skill_shield_bash_level: {
    id: 'skill_shield_bash_level',
    name: '+X to Shield Bash',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'shield_bash',
    weight: 2
  },
  skill_life_tap_level: {
    id: 'skill_life_tap_level',
    name: '+X to Life Tap',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'life_tap',
    weight: 2
  },

  // Passive skills (10)

  skill_click_mastery_level: {
    id: 'skill_click_mastery_level',
    name: '+X to Click Mastery',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'click_mastery',
    weight: 2
  },
  skill_heavy_handed_level: {
    id: 'skill_heavy_handed_level',
    name: '+X to Heavy Handed',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'heavy_handed',
    weight: 2
  },
  skill_berserker_level: {
    id: 'skill_berserker_level',
    name: '+X to Berserker',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'berserker',
    weight: 2
  },
  skill_focused_mind_level: {
    id: 'skill_focused_mind_level',
    name: '+X to Focused Mind',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'focused_mind',
    weight: 2
  },
  skill_critical_flow_level: {
    id: 'skill_critical_flow_level',
    name: '+X to Critical Flow',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'critical_flow',
    weight: 2
  },
  skill_vampiric_strikes_level: {
    id: 'skill_vampiric_strikes_level',
    name: '+X to Vampiric Strikes',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'vampiric_strikes',
    weight: 2
  },
  skill_combo_artist_level: {
    id: 'skill_combo_artist_level',
    name: '+X to Combo Artist',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'combo_artist',
    weight: 2
  },
  skill_efficient_casting_level: {
    id: 'skill_efficient_casting_level',
    name: '+X to Efficient Casting',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'efficient_casting',
    weight: 2
  },
  skill_spell_weaver_level: {
    id: 'skill_spell_weaver_level',
    name: '+X to Spell Weaver',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'spell_weaver',
    weight: 2
  },
  skill_residual_energy_level: {
    id: 'skill_residual_energy_level',
    name: '+X to Residual Energy',
    category: 'skillCategory',
    scaleType: 'zoneBased',
    skill: 'residual_energy',
    weight: 2
  }
};

// ============================================================
// CATEGORY LIST
// ============================================================

export const AFFIX_CATEGORIES = [
  'offensive', 'defensive', 'utility',
  'statusChance', 'statusPotency', 'skillCategory'
];

// ============================================================
// SLOT CATEGORY WEIGHTS
// ============================================================
// When rolling an affix for a slot, first pick a category using these weights,
// then pick a specific affix within that category using the affix's weight.

export const SLOT_CATEGORY_WEIGHTS = {
  weapon:    { offensive: 45, defensive: 10, utility: 10, statusChance: 20, statusPotency: 10, skillCategory: 5 },
  helmet:    { offensive: 15, defensive: 35, utility: 20, statusChance: 10, statusPotency: 10, skillCategory: 10 },
  chest:     { offensive: 10, defensive: 50, utility: 15, statusChance: 10, statusPotency: 10, skillCategory: 5 },
  gloves:    { offensive: 35, defensive: 10, utility: 10, statusChance: 25, statusPotency: 15, skillCategory: 5 },
  boots:     { offensive: 10, defensive: 25, utility: 40, statusChance: 10, statusPotency: 10, skillCategory: 5 },
  accessory: { offensive: 20, defensive: 20, utility: 20, statusChance: 20, statusPotency: 10, skillCategory: 10 }
};

// ============================================================
// SKILL LEVEL ZONE RANGES
// ============================================================
// Skill level affixes use zone-based roll tables instead of tier multipliers.
// Keyed by zone tier (1-7). Weights determine probability of each +level value.

export const SKILL_LEVEL_ZONE_RANGES = {
  1: { weights: { 1: 1.0 } },
  2: { weights: { 1: 1.0 } },
  3: { weights: { 1: 0.80, 2: 0.20 } },
  4: { weights: { 1: 0.80, 2: 0.20 } },
  5: { weights: { 1: 0.60, 2: 0.40 } },
  6: { weights: { 1: 0.60, 2: 0.40 } },
  7: { weights: { 1: 0.50, 2: 0.35, 3: 0.15 } }
};

// ============================================================
// AFFIX TAGS — lookup helpers for validation
// ============================================================

/** All 10 status affix IDs (5 chance + 5 potency) */
export const STATUS_AFFIX_IDS = new Set([
  'bleed_chance', 'poison_chance', 'burn_chance', 'slow_chance', 'freeze_chance',
  'bleed_potency', 'poison_potency', 'burn_potency', 'slow_strength', 'freeze_duration'
]);

/** All 31 skill level affix IDs (6 category-level including all-skills + 25 individual) */
export const SKILL_LEVEL_AFFIX_IDS = new Set([
  // Category level (6)
  'skill_speed_level', 'skill_power_level', 'skill_crit_level',
  'skill_mage_level', 'skill_utility_level', 'skill_all_level',
  // Individual active skill level (15)
  'skill_power_strike_level', 'skill_charge_up_level', 'skill_shatter_level',
  'skill_flurry_level', 'skill_barrage_level', 'skill_momentum_level',
  'skill_precision_level', 'skill_execute_level', 'skill_adrenaline_rush_level',
  'skill_arcane_bolt_level', 'skill_chain_lightning_level', 'skill_overcharge_level',
  'skill_energy_surge_level', 'skill_shield_bash_level', 'skill_life_tap_level',
  // Individual passive skill level (10)
  'skill_click_mastery_level', 'skill_heavy_handed_level', 'skill_berserker_level',
  'skill_focused_mind_level', 'skill_critical_flow_level', 'skill_vampiric_strikes_level',
  'skill_combo_artist_level', 'skill_efficient_casting_level', 'skill_spell_weaver_level',
  'skill_residual_energy_level'
]);

/** All 5 skill boost affix IDs (percentage power boosts per category) */
export const SKILL_BOOST_AFFIX_IDS = new Set([
  'skill_speed_boost', 'skill_power_boost', 'skill_crit_boost',
  'skill_mage_boost', 'skill_utility_boost'
]);

export const AFFIX_TAGS = {
  STATUS_AFFIX_IDS,
  SKILL_LEVEL_AFFIX_IDS,
  SKILL_BOOST_AFFIX_IDS
};

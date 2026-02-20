/**
 * legendaries.data.js - Legendary Item Definitions
 *
 * 15 hand-crafted legendary items (2-3 per zone).
 * Pure data — no imports, no logic.
 * Effect handlers are implemented in Phase 12.8 (items.js).
 *
 * @see docs/design/item-system-v2.md (Section 6)
 */

// ============================================================
// LEGENDARY DEFINITIONS (15)
// ============================================================

export const LEGENDARIES = {

  // --- Zone 1: Whisperwood (2) ---

  whisperwood_heart: {
    id: 'whisperwood_heart',
    name: 'Whisperwood Heart',
    slot: 'accessory',
    zone: 'whisperwood',
    emoji: '\u{1F49A}',
    uniqueEffectId: 'energy_regen_low_hp',
    uniqueEffectDesc: 'Energy regen doubled while below 30% HP'
  },
  thornweave_wraps: {
    id: 'thornweave_wraps',
    name: 'Thornweave Wraps',
    slot: 'gloves',
    zone: 'whisperwood',
    emoji: '\u{1F33F}',
    uniqueEffectId: 'bleed_bonus_vs_slowed',
    uniqueEffectDesc: 'Bleed stacks deal 50% bonus damage to slowed targets'
  },

  // --- Zone 2: Dustwind (2) ---

  sandstorm_fang: {
    id: 'sandstorm_fang',
    name: 'Sandstorm Fang',
    slot: 'weapon',
    zone: 'dustwind',
    emoji: '\u{1F32A}\uFE0F',
    uniqueEffectId: 'double_hit',
    uniqueEffectDesc: 'Attacks hit twice at 60% damage each'
  },
  mirage_band: {
    id: 'mirage_band',
    name: 'Mirage Band',
    slot: 'accessory',
    zone: 'dustwind',
    emoji: '\u{1F4AB}',
    uniqueEffectId: 'dodge_chance',
    uniqueEffectDesc: '20% chance to dodge monster attacks (take 0 damage)'
  },

  // --- Zone 3: Shadowmire (2) ---

  venom_lords_grip: {
    id: 'venom_lords_grip',
    name: "Venom Lord's Grip",
    slot: 'gloves',
    zone: 'shadowmire',
    emoji: '\u{1F40D}',
    uniqueEffectId: 'unlimited_poison_stacks',
    uniqueEffectDesc: 'Poison stacks have no maximum limit'
  },
  shadowmire_cowl: {
    id: 'shadowmire_cowl',
    name: 'Shadowmire Cowl',
    slot: 'helmet',
    zone: 'shadowmire',
    emoji: '\u{1F47B}',
    uniqueEffectId: 'status_duration_bonus',
    uniqueEffectDesc: 'Status effect durations on monsters increased by 40%'
  },

  // --- Zone 4: Ironhold (2) ---

  ironforge_crown: {
    id: 'ironforge_crown',
    name: 'Ironforge Crown',
    slot: 'helmet',
    zone: 'ironhold',
    emoji: '\u{1F451}',
    uniqueEffectId: 'armor_to_magic_resist',
    uniqueEffectDesc: 'Armor also applies as 50% Magic Resist'
  },
  titans_greaves: {
    id: 'titans_greaves',
    name: "Titan's Greaves",
    slot: 'boots',
    zone: 'ironhold',
    emoji: '\u{1F9B6}',
    uniqueEffectId: 'high_hp_damage_bonus',
    uniqueEffectDesc: 'While above 80% HP, gain 25% bonus damage'
  },

  // --- Zone 5: Emberfell (2) ---

  embercallers_staff: {
    id: 'embercallers_staff',
    name: "Embercaller's Staff",
    slot: 'weapon',
    zone: 'emberfell',
    emoji: '\u{1F525}',
    uniqueEffectId: 'burn_can_crit',
    uniqueEffectDesc: 'Burn damage can critically strike'
  },
  ashen_plate: {
    id: 'ashen_plate',
    name: 'Ashen Plate',
    slot: 'chest',
    zone: 'emberfell',
    emoji: '\u{1F6E1}\uFE0F',
    uniqueEffectId: 'fire_damage_heals',
    uniqueEffectDesc: 'Taking fire damage heals instead (converts burn to HoT)'
  },

  // --- Zone 6: Frostpeak (2) ---

  frostbite_edge: {
    id: 'frostbite_edge',
    name: 'Frostbite Edge',
    slot: 'weapon',
    zone: 'frostpeak',
    emoji: '\u{1FA93}',
    uniqueEffectId: 'crit_freeze',
    uniqueEffectDesc: 'Critical hits freeze the target for 0.5s'
  },
  glacial_mantle: {
    id: 'glacial_mantle',
    name: 'Glacial Mantle',
    slot: 'chest',
    zone: 'frostpeak',
    emoji: '\u2744\uFE0F',
    uniqueEffectId: 'shield_regen_idle',
    uniqueEffectDesc: 'Shield regenerates 5% per second while not taking damage'
  },

  // --- Zone 7: Voidrift (3) ---

  crown_of_the_void_king: {
    id: 'crown_of_the_void_king',
    name: 'Crown of the Void King',
    slot: 'helmet',
    zone: 'voidrift',
    emoji: '\u{1F480}',
    uniqueEffectId: 'kill_restore_shield',
    uniqueEffectDesc: 'Kills have 10% chance to fully restore shield'
  },
  soulreaver: {
    id: 'soulreaver',
    name: 'Soulreaver',
    slot: 'weapon',
    zone: 'voidrift',
    emoji: '\u{1F5E1}\uFE0F',
    uniqueEffectId: 'damage_to_shield',
    uniqueEffectDesc: '5% of damage dealt is gained as shield'
  },
  void_eternal: {
    id: 'void_eternal',
    name: 'Void Eternal',
    slot: 'accessory',
    zone: 'voidrift',
    emoji: '\u{1F300}',
    uniqueEffectId: 'kill_reduce_cooldowns',
    uniqueEffectDesc: 'All skill cooldowns reduced by 1s on kill'
  }
};

// ============================================================
// ZONE LEGENDARIES — zone ID -> array of legendary IDs
// ============================================================

export const ZONE_LEGENDARIES = {
  whisperwood: ['whisperwood_heart', 'thornweave_wraps'],
  dustwind:    ['sandstorm_fang', 'mirage_band'],
  shadowmire:  ['venom_lords_grip', 'shadowmire_cowl'],
  ironhold:    ['ironforge_crown', 'titans_greaves'],
  emberfell:   ['embercallers_staff', 'ashen_plate'],
  frostpeak:   ['frostbite_edge', 'glacial_mantle'],
  voidrift:    ['crown_of_the_void_king', 'soulreaver', 'void_eternal']
};

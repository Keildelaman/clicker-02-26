/**
 * item-names.data.js - Item Naming Tables
 *
 * Base names, prefixes, suffixes, and weapon damage type mappings
 * for procedurally generated item names.
 * Pure data — no imports, no logic.
 *
 * Naming structure: [Prefix] [Base Name] [Suffix]
 *   - Prefix: determined by strongest offensive/status affix
 *   - Base Name: random per slot
 *   - Suffix: determined by strongest defensive/utility affix
 *   - Epic items: 50% chance to override prefix with rarity prefix
 *   - Legendary items: fixed hand-crafted names (ignore this system)
 *
 * @see docs/design/item-system-v2.md (Section 12)
 */

// ============================================================
// BASE NAMES (per slot)
// ============================================================

export const BASE_NAMES = {
  weapon:    ['Blade', 'Sword', 'Staff', 'Dagger', 'Mace', 'Wand', 'Axe', 'Hammer', 'Spear', 'Scepter'],
  helmet:    ['Crown', 'Hood', 'Helm', 'Circlet', 'Mask', 'Visor', 'Cap', 'Diadem'],
  chest:     ['Plate', 'Robe', 'Vest', 'Chainmail', 'Tunic', 'Hauberk', 'Mantle', 'Cuirass'],
  gloves:    ['Gauntlets', 'Wraps', 'Grips', 'Bracers', 'Mitts', 'Handguards', 'Claws'],
  boots:     ['Greaves', 'Sandals', 'Treads', 'Sabatons', 'Striders', 'Walkers', 'Stompers'],
  accessory: ['Ring', 'Amulet', 'Pendant', 'Charm', 'Talisman', 'Band', 'Brooch', 'Locket']
};

// ============================================================
// WEAPON DAMAGE TYPES
// ============================================================
// Weapon base name -> damage type for basic clicks.
// No weapon equipped defaults to 'physical'.

export const WEAPON_DAMAGE_TYPES = {
  Blade:   'physical',
  Sword:   'physical',
  Dagger:  'physical',
  Mace:    'physical',
  Axe:     'physical',
  Hammer:  'physical',
  Spear:   'physical',
  Staff:   'magic',
  Wand:    'magic',
  Scepter: 'magic'
};

// ============================================================
// PREFIXES (by dominant offensive/status affix)
// ============================================================
// The prefix is chosen based on the item's strongest offensive or status affix.
// If the item has no offensive/status affixes, use the 'default' pool.

export const PREFIXES = {
  flat_attack:    ['Brutal', 'Savage', 'Mighty', 'Heavy'],
  flat_magic_power: ['Arcane', 'Mystic', 'Enchanted', 'Ethereal'],
  crit_chance:    ['Keen', 'Precise', 'Deadly', 'Razor'],
  crit_damage:    ['Keen', 'Precise', 'Deadly', 'Razor'],
  armor_pen:      ['Piercing', 'Sundering', 'Rending', 'Breaching'],
  magic_pen:      ['Piercing', 'Sundering', 'Rending', 'Breaching'],
  bleed_chance:   ['Bleeding', 'Jagged', 'Serrated', 'Barbed'],
  bleed_potency:  ['Bleeding', 'Jagged', 'Serrated', 'Barbed'],
  poison_chance:  ['Venomous', 'Toxic', 'Festering', 'Noxious'],
  poison_potency: ['Venomous', 'Toxic', 'Festering', 'Noxious'],
  burn_chance:    ['Searing', 'Blazing', 'Scorching', 'Molten'],
  burn_potency:   ['Searing', 'Blazing', 'Scorching', 'Molten'],
  slow_chance:    ['Frosted', 'Glacial', 'Chilling', 'Frozen'],
  slow_strength:  ['Frosted', 'Glacial', 'Chilling', 'Frozen'],
  freeze_chance:  ['Frosted', 'Glacial', 'Chilling', 'Frozen'],
  freeze_duration: ['Frosted', 'Glacial', 'Chilling', 'Frozen'],
  default:        ['Sturdy', 'Reliable', 'Solid', 'Stalwart']
};

// ============================================================
// SUFFIXES (by dominant defensive/utility/skill affix)
// ============================================================
// The suffix is chosen based on the item's strongest defensive, utility, or skill affix.
// If none are present, use the 'default' pool (empty string — no suffix).

export const SUFFIXES = {
  flat_armor:         ['of Iron', 'of Stone', 'of the Fortress', 'of Warding'],
  flat_magic_resist:  ['of the Mind', 'of Warding', 'of Spirit', 'of Clarity'],
  flat_max_hp:        ['of the Bear', 'of Vitality', 'of the Giant', 'of Life'],
  flat_max_shield:    ['of the Aegis', 'of Protection', 'of the Barrier', 'of Shelter'],
  hp_regen:           ['of Mending', 'of Recovery', 'of Renewal', 'of the Healer'],
  gold_find:          ['of Greed', 'of Fortune', 'of Wealth', 'of the Merchant'],
  xp_bonus:           ['of Wisdom', 'of the Scholar', 'of Learning', 'of Growth'],
  energy_gain:        ['of Vigor', 'of Zeal', 'of the Dynamo', 'of Flow'],
  skill_cooldown:     ['of Haste', 'of Swiftness', 'of Alacrity', 'of Readiness'],
  skill_boost:        ['of Mastery', 'of Expertise', 'of the Adept', 'of Prowess'],
  skill_level:        ['of Ascendancy', 'of Transcendence', 'of the Sage', 'of Eminence'],
  skill_all_level:    ['of Omniscience', 'of the Paragon', 'of Perfection'],
  default:            ['']
};

// ============================================================
// EPIC RARITY PREFIXES
// ============================================================
// 50% chance for Epic items to use one of these instead of the stat-based prefix.

export const EPIC_PREFIXES = ['Mythic', 'Abyssal', 'Celestial', 'Infernal', 'Primordial'];

// ============================================================
// SLOT EMOJIS
// ============================================================
// Default emoji for non-legendary items, keyed by slot.

export const SLOT_EMOJIS = {
  weapon:    '\u2694\uFE0F',
  helmet:    '\u{1FA96}',
  chest:     '\u{1F6E1}\uFE0F',
  gloves:    '\u{1F9E4}',
  boots:     '\u{1F462}',
  accessory: '\u{1F48D}'
};

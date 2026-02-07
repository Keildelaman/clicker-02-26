/**
 * items.data.js - Item Definitions
 *
 * Static data for all equipment items.
 * Phase 4: Whisperwood + Dustwind items (18 total).
 *
 * @see docs/data/items.data.md
 */

export const ITEMS = {
  // ===== ZONE 1: WHISPERWOOD GLEN =====

  // --- Weapons ---
  weapon_whisperwood_common_01: {
    id: 'weapon_whisperwood_common_01',
    name: 'Rusty Sword',
    description: 'A weathered blade found in the forest. It\'s seen better days, but it\'s better than nothing.',
    type: 'weapon',
    rarity: 'common',
    zone: 'whisperwood',
    requiredLevel: 1,
    stats: { attack: 4 },
    buyPrice: 50,
    sellPrice: 12,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F5E1}\uFE0F'
  },

  weapon_whisperwood_common_02: {
    id: 'weapon_whisperwood_common_02',
    name: 'Wooden Club',
    description: 'A sturdy branch shaped into a crude weapon. Simple but effective against forest creatures.',
    type: 'weapon',
    rarity: 'common',
    zone: 'whisperwood',
    requiredLevel: 3,
    stats: { attack: 6 },
    buyPrice: 50,
    sellPrice: 12,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1FAB5}'
  },

  weapon_whisperwood_uncommon_01: {
    id: 'weapon_whisperwood_uncommon_01',
    name: "Hunter's Blade",
    description: 'A well-crafted hunting knife. The previous owner carved notches for each kill.',
    type: 'weapon',
    rarity: 'uncommon',
    zone: 'whisperwood',
    requiredLevel: 5,
    stats: { attack: 8, critChance: 0.02 },
    buyPrice: 125,
    sellPrice: 31,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F52A}'
  },

  weapon_whisperwood_rare_01: {
    id: 'weapon_whisperwood_rare_01',
    name: "Mossback's Branch",
    description: 'A branch torn from the ancient treant. It pulses with nature magic and seems almost alive.',
    type: 'weapon',
    rarity: 'rare',
    zone: 'whisperwood',
    requiredLevel: 8,
    stats: { attack: 12, critChance: 0.03 },
    buyPrice: 300,
    sellPrice: 75,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F33F}'
  },

  // --- Accessories ---
  accessory_whisperwood_common_01: {
    id: 'accessory_whisperwood_common_01',
    name: 'Lucky Pebble',
    description: 'A smooth stone that feels warm in your pocket. Probably just superstition... probably.',
    type: 'accessory',
    rarity: 'common',
    zone: 'whisperwood',
    requiredLevel: 1,
    stats: { goldFind: 0.05 },
    buyPrice: 50,
    sellPrice: 12,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1FAA8}'
  },

  accessory_whisperwood_uncommon_01: {
    id: 'accessory_whisperwood_uncommon_01',
    name: "Rabbit's Foot",
    description: 'The previous owner wasn\'t so lucky, but you might be. Increases fortune slightly.',
    type: 'accessory',
    rarity: 'uncommon',
    zone: 'whisperwood',
    requiredLevel: 4,
    stats: { goldFind: 0.08, critChance: 0.02 },
    buyPrice: 125,
    sellPrice: 31,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F43E}'
  },

  // --- Armor ---
  armor_whisperwood_common_01: {
    id: 'armor_whisperwood_common_01',
    name: 'Leather Vest',
    description: 'A simple leather vest that offers basic protection against claws and fangs.',
    type: 'armor',
    rarity: 'common',
    zone: 'whisperwood',
    requiredLevel: 2,
    stats: { damageReduction: 0.05, maxHP: 10 },
    buyPrice: 75,
    sellPrice: 18,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F9BA}'
  },

  armor_whisperwood_uncommon_01: {
    id: 'armor_whisperwood_uncommon_01',
    name: 'Forest Scout Armor',
    description: 'Light armor worn by Whisperwood scouts. Flexible enough for quick movement.',
    type: 'armor',
    rarity: 'uncommon',
    zone: 'whisperwood',
    requiredLevel: 5,
    stats: { damageReduction: 0.08, maxHP: 25, hpRegen: 0.005 },
    buyPrice: 150,
    sellPrice: 37,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F94B}'
  },

  armor_whisperwood_rare_01: {
    id: 'armor_whisperwood_rare_01',
    name: "Mossback's Shell",
    description: 'A piece of bark from Old Mossback himself. Remarkably tough and slightly alive.',
    type: 'armor',
    rarity: 'rare',
    zone: 'whisperwood',
    requiredLevel: 8,
    stats: { damageReduction: 0.12, maxHP: 50, hpRegen: 0.01 },
    buyPrice: 400,
    sellPrice: 100,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1FAB5}'
  },

  // ===== ZONE 2: DUSTWIND PLAINS =====

  // --- Weapons ---
  weapon_dustwind_common_01: {
    id: 'weapon_dustwind_common_01',
    name: "Bandit's Dagger",
    description: 'A quick blade favored by the plains bandits. Good for surprise attacks.',
    type: 'weapon',
    rarity: 'common',
    zone: 'dustwind',
    requiredLevel: 10,
    stats: { attack: 12 },
    buyPrice: 200,
    sellPrice: 50,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F5E1}\uFE0F'
  },

  weapon_dustwind_common_02: {
    id: 'weapon_dustwind_common_02',
    name: 'Plains Machete',
    description: 'A broad blade used for clearing brush... and enemies.',
    type: 'weapon',
    rarity: 'common',
    zone: 'dustwind',
    requiredLevel: 12,
    stats: { attack: 16 },
    buyPrice: 200,
    sellPrice: 50,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2694\uFE0F'
  },

  weapon_dustwind_uncommon_01: {
    id: 'weapon_dustwind_uncommon_01',
    name: 'Windcutter',
    description: 'A curved blade that seems to whistle through the air. Cuts cleaner than it should.',
    type: 'weapon',
    rarity: 'uncommon',
    zone: 'dustwind',
    requiredLevel: 15,
    stats: { attack: 22, critChance: 0.03 },
    buyPrice: 500,
    sellPrice: 125,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F4A8}'
  },

  weapon_dustwind_rare_01: {
    id: 'weapon_dustwind_rare_01',
    name: "Redfang's Fang",
    description: 'The crimson blade of the bandit king himself. Still stained with the blood of his victims.',
    type: 'weapon',
    rarity: 'rare',
    zone: 'dustwind',
    requiredLevel: 18,
    stats: { attack: 32, critChance: 0.04, critDamage: 0.2 },
    buyPrice: 1200,
    sellPrice: 300,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F534}'
  },

  // --- Accessories ---
  accessory_dustwind_common_01: {
    id: 'accessory_dustwind_common_01',
    name: 'Dustwind Charm',
    description: 'A trinket that locals believe wards off bad luck on the plains.',
    type: 'accessory',
    rarity: 'common',
    zone: 'dustwind',
    requiredLevel: 10,
    stats: { goldFind: 0.08 },
    buyPrice: 200,
    sellPrice: 50,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F3AA}'
  },

  accessory_dustwind_uncommon_01: {
    id: 'accessory_dustwind_uncommon_01',
    name: "Scout's Spyglass",
    description: 'Helps you spot valuable loot from afar. Also useful for avoiding trouble.',
    type: 'accessory',
    rarity: 'uncommon',
    zone: 'dustwind',
    requiredLevel: 13,
    stats: { goldFind: 0.12, xpBonus: 0.05 },
    buyPrice: 500,
    sellPrice: 125,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F52D}'
  },

  accessory_dustwind_rare_01: {
    id: 'accessory_dustwind_rare_01',
    name: "Bandit King's Medallion",
    description: "Redfang's symbol of authority. Those who carry it are treated with fear... and respect.",
    type: 'accessory',
    rarity: 'rare',
    zone: 'dustwind',
    requiredLevel: 18,
    stats: { goldFind: 0.18, damageReduction: 0.05, energyGain: 0.10 },
    buyPrice: 1200,
    sellPrice: 300,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F3C5}'
  },

  // --- Armor ---
  armor_dustwind_common_01: {
    id: 'armor_dustwind_common_01',
    name: "Dustrunner's Garb",
    description: 'Light armor worn by plains scouts. Protects against dust storms and claws.',
    type: 'armor',
    rarity: 'common',
    zone: 'dustwind',
    requiredLevel: 10,
    stats: { damageReduction: 0.08, maxHP: 30 },
    buyPrice: 250,
    sellPrice: 62,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F94B}'
  },

  armor_dustwind_uncommon_01: {
    id: 'armor_dustwind_uncommon_01',
    name: "Bandit's Chainmail",
    description: 'Stolen from a fallen soldier. The bandits maintain it surprisingly well.',
    type: 'armor',
    rarity: 'uncommon',
    zone: 'dustwind',
    requiredLevel: 14,
    stats: { damageReduction: 0.12, maxHP: 60, hpRegen: 0.008 },
    buyPrice: 600,
    sellPrice: 150,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u26D3\uFE0F'
  },

  armor_dustwind_rare_01: {
    id: 'armor_dustwind_rare_01',
    name: "Redfang's Hide",
    description: 'Armor made from Redfang\'s own pelt. His ferocity seems to linger.',
    type: 'armor',
    rarity: 'rare',
    zone: 'dustwind',
    requiredLevel: 18,
    stats: { damageReduction: 0.15, maxHP: 100, hpRegen: 0.01, critChance: 0.03 },
    buyPrice: 1500,
    sellPrice: 375,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F98A}'
  }
};

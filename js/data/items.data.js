/**
 * items.data.js - Item Definitions
 *
 * Static data for all equipment items across 7 zones.
 * Phase 9 Balance Overhaul: Weapon attack values and prices retuned.
 *
 * Weapon progression creates the "wave" pattern per zone:
 *   Zone N common shop weapon > Zone N-1 boss drop weapon (slight upgrade)
 *   Zone N uncommon shop weapon > Zone N common (bigger upgrade)
 *   Zone N boss drop > Zone N uncommon (reward for beating boss)
 *
 * Prices ~3x old values to maintain the "upgrade every 30-50 kills" target
 * with 3x higher gold-per-kill.
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
    stats: { attack: 8 },
    buyPrice: 150,
    sellPrice: 37,
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
    stats: { attack: 10 },
    buyPrice: 150,
    sellPrice: 37,
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
    stats: { attack: 18, critChance: 0.02 },
    buyPrice: 375,
    sellPrice: 93,
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
    requiredLevel: 10,
    stats: { attack: 28, critChance: 0.03 },
    buyPrice: 900,
    sellPrice: 225,
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
    buyPrice: 150,
    sellPrice: 37,
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
    buyPrice: 375,
    sellPrice: 93,
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
    stats: { maxHP: 10, armor: 10 },
    buyPrice: 225,
    sellPrice: 56,
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
    stats: { maxHP: 25, hpRegen: 0.005, armor: 15 },
    buyPrice: 450,
    sellPrice: 112,
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
    requiredLevel: 10,
    stats: { maxHP: 50, hpRegen: 0.01, armor: 20, magicResist: 5 },
    buyPrice: 1200,
    sellPrice: 300,
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
    stats: { attack: 35 },
    buyPrice: 600,
    sellPrice: 150,
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
    stats: { attack: 42 },
    buyPrice: 600,
    sellPrice: 150,
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
    stats: { attack: 50, critChance: 0.03 },
    buyPrice: 1500,
    sellPrice: 375,
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
    requiredLevel: 22,
    stats: { attack: 75, critChance: 0.04, critDamage: 0.2 },
    buyPrice: 3600,
    sellPrice: 900,
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
    buyPrice: 600,
    sellPrice: 150,
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
    buyPrice: 1500,
    sellPrice: 375,
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
    requiredLevel: 22,
    stats: { goldFind: 0.18, energyGain: 0.10 },
    buyPrice: 3600,
    sellPrice: 900,
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
    stats: { maxHP: 30, armor: 18 },
    buyPrice: 750,
    sellPrice: 187,
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
    stats: { maxHP: 60, hpRegen: 0.008, armor: 25 },
    buyPrice: 1800,
    sellPrice: 450,
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
    requiredLevel: 22,
    stats: { maxHP: 100, hpRegen: 0.01, critChance: 0.03, armor: 35, magicResist: 8 },
    buyPrice: 4500,
    sellPrice: 1125,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F98A}'
  },

  // ===== ZONE 3: SHADOWMIRE SWAMP =====

  // --- Weapons ---
  weapon_shadowmire_common_01: {
    id: 'weapon_shadowmire_common_01',
    name: 'Bog Iron Blade',
    description: 'Forged from iron pulled from the swamp. Has a dark, oily sheen.',
    type: 'weapon',
    rarity: 'common',
    zone: 'shadowmire',
    requiredLevel: 20,
    stats: { attack: 85 },
    buyPrice: 1500,
    sellPrice: 375,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F5E1}\uFE0F'
  },

  weapon_shadowmire_common_02: {
    id: 'weapon_shadowmire_common_02',
    name: 'Cursed Cleaver',
    description: 'A heavy blade that whispers dark thoughts. The curse is weak, but present.',
    type: 'weapon',
    rarity: 'common',
    zone: 'shadowmire',
    requiredLevel: 23,
    stats: { attack: 100 },
    buyPrice: 1500,
    sellPrice: 375,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1FA93}'
  },

  weapon_shadowmire_uncommon_01: {
    id: 'weapon_shadowmire_uncommon_01',
    name: 'Hexblade',
    description: 'A weapon enchanted by swamp witches. Glows faintly green in darkness.',
    type: 'weapon',
    rarity: 'uncommon',
    zone: 'shadowmire',
    requiredLevel: 25,
    stats: { attack: 120, critChance: 0.04, magicPower: 40 },
    buyPrice: 3750,
    sellPrice: 937,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F49A}'
  },

  weapon_shadowmire_rare_01: {
    id: 'weapon_shadowmire_rare_01',
    name: "Mire Mother's Claw",
    description: 'A talon from the swamp\'s dark queen. It drips with eternal poison.',
    type: 'weapon',
    rarity: 'rare',
    zone: 'shadowmire',
    requiredLevel: 33,
    stats: { attack: 175, critChance: 0.05, critDamage: 0.3, magicPower: 60 },
    buyPrice: 9000,
    sellPrice: 2250,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F9B4}'
  },

  // --- Accessories ---
  accessory_shadowmire_common_01: {
    id: 'accessory_shadowmire_common_01',
    name: 'Wisp Lantern',
    description: 'Contains a captured will-o-wisp. Its light reveals hidden treasures.',
    type: 'accessory',
    rarity: 'common',
    zone: 'shadowmire',
    requiredLevel: 20,
    stats: { goldFind: 0.10 },
    buyPrice: 1500,
    sellPrice: 375,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F3EE}'
  },

  accessory_shadowmire_uncommon_01: {
    id: 'accessory_shadowmire_uncommon_01',
    name: "Hag's Eye",
    description: 'A preserved eye that still seems to watch. Grants insight into weakness.',
    type: 'accessory',
    rarity: 'uncommon',
    zone: 'shadowmire',
    requiredLevel: 24,
    stats: { critChance: 0.05, xpBonus: 0.08, magicPen: 0.05 },
    buyPrice: 3750,
    sellPrice: 937,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F441}\uFE0F'
  },

  accessory_shadowmire_rare_01: {
    id: 'accessory_shadowmire_rare_01',
    name: "Mire Mother's Tear",
    description: 'A crystallized tear from the primordial entity. Pulsates with dark vitality.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'shadowmire',
    requiredLevel: 33,
    stats: { maxHP: 50, hpRegen: 0.005, magicResist: 15 },
    buyPrice: 9000,
    sellPrice: 2250,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F4A7}'
  },

  // --- Armor ---
  armor_shadowmire_common_01: {
    id: 'armor_shadowmire_common_01',
    name: "Swamp Stalker's Coat",
    description: 'Treated leather that resists the swamp\'s corrosive waters.',
    type: 'armor',
    rarity: 'common',
    zone: 'shadowmire',
    requiredLevel: 20,
    stats: { maxHP: 60, armor: 20, magicResist: 15 },
    buyPrice: 1800,
    sellPrice: 450,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F9E5}'
  },

  armor_shadowmire_uncommon_01: {
    id: 'armor_shadowmire_uncommon_01',
    name: 'Scaled Hauberk',
    description: 'Made from swamp serpent scales. Surprisingly light and very tough.',
    type: 'armor',
    rarity: 'uncommon',
    zone: 'shadowmire',
    requiredLevel: 25,
    stats: { maxHP: 100, hpRegen: 0.01, armor: 25, magicResist: 20 },
    buyPrice: 4500,
    sellPrice: 1125,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F40D}'
  },

  armor_shadowmire_rare_01: {
    id: 'armor_shadowmire_rare_01',
    name: "Mire Mother's Carapace",
    description: 'Hardened shell from the ancient swamp guardian. Seems to regenerate on its own.',
    type: 'armor',
    rarity: 'rare',
    zone: 'shadowmire',
    requiredLevel: 33,
    stats: { maxHP: 150, hpRegen: 0.015, armor: 35, magicResist: 25 },
    buyPrice: 12000,
    sellPrice: 3000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F41A}'
  },

  // ===== ZONE 4: IRONHOLD PEAKS =====

  // --- Weapons ---
  weapon_ironhold_common_01: {
    id: 'weapon_ironhold_common_01',
    name: 'Dwarven Hand Axe',
    description: 'A sturdy axe of dwarven make. Simple but reliable craftsmanship.',
    type: 'weapon',
    rarity: 'common',
    zone: 'ironhold',
    requiredLevel: 30,
    stats: { attack: 200 },
    buyPrice: 4500,
    sellPrice: 1125,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1FA93}'
  },

  weapon_ironhold_common_02: {
    id: 'weapon_ironhold_common_02',
    name: 'Crystal Shard Blade',
    description: 'A sword with crystal fragments embedded in the edge. Sparkles dangerously.',
    type: 'weapon',
    rarity: 'common',
    zone: 'ironhold',
    requiredLevel: 35,
    stats: { attack: 240, magicPower: 60 },
    buyPrice: 4500,
    sellPrice: 1125,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F48E}'
  },

  weapon_ironhold_uncommon_01: {
    id: 'weapon_ironhold_uncommon_01',
    name: 'Runeforged Blade',
    description: 'Ancient dwarven runes glow along its length. The enchantments still hold power.',
    type: 'weapon',
    rarity: 'uncommon',
    zone: 'ironhold',
    requiredLevel: 38,
    stats: { attack: 280, critChance: 0.05, critDamage: 0.2, magicPower: 80 },
    buyPrice: 11250,
    sellPrice: 2812,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2694\uFE0F'
  },

  weapon_ironhold_rare_01: {
    id: 'weapon_ironhold_rare_01',
    name: "Grimstone's Heart",
    description: 'The crystalline core of the eternal guardian. Pulses with ancient power.',
    type: 'weapon',
    rarity: 'rare',
    zone: 'ironhold',
    requiredLevel: 48,
    stats: { attack: 400, critChance: 0.06, critDamage: 0.4, armorPen: 15 },
    buyPrice: 27000,
    sellPrice: 6750,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F4A0}'
  },

  // --- Accessories ---
  accessory_ironhold_common_01: {
    id: 'accessory_ironhold_common_01',
    name: "Miner's Charm",
    description: 'A good luck charm carried by dwarven miners. Smells faintly of ale.',
    type: 'accessory',
    rarity: 'common',
    zone: 'ironhold',
    requiredLevel: 30,
    stats: { goldFind: 0.12 },
    buyPrice: 4500,
    sellPrice: 1125,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u26CF\uFE0F'
  },

  accessory_ironhold_uncommon_01: {
    id: 'accessory_ironhold_uncommon_01',
    name: 'Gem-Studded Ring',
    description: 'A ring set with small but valuable gems. Attracts wealth to its wearer.',
    type: 'accessory',
    rarity: 'uncommon',
    zone: 'ironhold',
    requiredLevel: 35,
    stats: { goldFind: 0.15, critChance: 0.04 },
    buyPrice: 11250,
    sellPrice: 2812,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F48D}'
  },

  accessory_ironhold_rare_01: {
    id: 'accessory_ironhold_rare_01',
    name: "Grimstone's Core Fragment",
    description: 'A shard of the eternal guardian\'s crystalline heart. Nearly indestructible.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'ironhold',
    requiredLevel: 48,
    stats: { maxHP: 100, armorPen: 10 },
    buyPrice: 27000,
    sellPrice: 6750,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F4A0}'
  },

  // --- Armor ---
  armor_ironhold_common_01: {
    id: 'armor_ironhold_common_01',
    name: 'Mountain Guard Plate',
    description: 'Standard issue for Ironhold\'s mountain defenders. Heavy but reliable.',
    type: 'armor',
    rarity: 'common',
    zone: 'ironhold',
    requiredLevel: 30,
    stats: { maxHP: 100, armor: 40, magicResist: 10 },
    buyPrice: 5400,
    sellPrice: 1350,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F6E1}\uFE0F'
  },

  armor_ironhold_uncommon_01: {
    id: 'armor_ironhold_uncommon_01',
    name: 'Dwarven Forgemail',
    description: 'Crafted in the ancient forges. Each ring is individually tempered.',
    type: 'armor',
    rarity: 'uncommon',
    zone: 'ironhold',
    requiredLevel: 38,
    stats: { maxHP: 180, hpRegen: 0.012, armor: 55, magicResist: 15 },
    buyPrice: 13500,
    sellPrice: 3375,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2699\uFE0F'
  },

  armor_ironhold_rare_01: {
    id: 'armor_ironhold_rare_01',
    name: "Grimstone's Chassis",
    description: 'The outer shell of the mountain golem. Nearly indestructible stone-metal alloy.',
    type: 'armor',
    rarity: 'rare',
    zone: 'ironhold',
    requiredLevel: 48,
    stats: { maxHP: 280, hpRegen: 0.015, armor: 75, magicResist: 20 },
    buyPrice: 36000,
    sellPrice: 9000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F5FF}'
  },

  // ===== ZONE 5: EMBERFELL WASTES =====

  // --- Weapons ---
  weapon_emberfell_common_01: {
    id: 'weapon_emberfell_common_01',
    name: 'Obsidian Edge',
    description: 'A blade of volcanic glass. Incredibly sharp but prone to chipping.',
    type: 'weapon',
    rarity: 'common',
    zone: 'emberfell',
    requiredLevel: 45,
    stats: { attack: 450 },
    buyPrice: 12000,
    sellPrice: 3000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F5A4}'
  },

  weapon_emberfell_common_02: {
    id: 'weapon_emberfell_common_02',
    name: 'Flamesteel Sword',
    description: 'Forged in volcanic heat, this blade never fully cools. Handle with care.',
    type: 'weapon',
    rarity: 'common',
    zone: 'emberfell',
    requiredLevel: 50,
    stats: { attack: 530, magicPower: 150 },
    buyPrice: 12000,
    sellPrice: 3000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F525}'
  },

  weapon_emberfell_uncommon_01: {
    id: 'weapon_emberfell_uncommon_01',
    name: 'Inferno Blade',
    description: 'Fire elementals fear this weapon. It burns with their stolen essence.',
    type: 'weapon',
    rarity: 'uncommon',
    zone: 'emberfell',
    requiredLevel: 53,
    stats: { attack: 630, critChance: 0.06, critDamage: 0.3, magicPower: 200 },
    buyPrice: 30000,
    sellPrice: 7500,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F30B}'
  },

  weapon_emberfell_rare_01: {
    id: 'weapon_emberfell_rare_01',
    name: "Pyrax's Fury",
    description: 'A blade forged from the Flamelord\'s own essence. Burns with eternal fire.',
    type: 'weapon',
    rarity: 'rare',
    zone: 'emberfell',
    requiredLevel: 63,
    stats: { attack: 900, critChance: 0.07, critDamage: 0.5, armorPen: 20, magicPower: 300 },
    buyPrice: 72000,
    sellPrice: 18000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u2600\uFE0F'
  },

  // --- Accessories ---
  accessory_emberfell_common_01: {
    id: 'accessory_emberfell_common_01',
    name: 'Ember Pendant',
    description: 'A gem that glows with inner fire. Warm to the touch, never hot.',
    type: 'accessory',
    rarity: 'common',
    zone: 'emberfell',
    requiredLevel: 45,
    stats: { goldFind: 0.15, magicPower: 30 },
    buyPrice: 12000,
    sellPrice: 3000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F536}'
  },

  accessory_emberfell_uncommon_01: {
    id: 'accessory_emberfell_uncommon_01',
    name: 'Phoenix Feather',
    description: 'A feather from the legendary firebird. Brings fortune from the ashes.',
    type: 'accessory',
    rarity: 'uncommon',
    zone: 'emberfell',
    requiredLevel: 50,
    stats: { goldFind: 0.18, xpBonus: 0.12, magicPen: 0.08 },
    buyPrice: 30000,
    sellPrice: 7500,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1FAB6}'
  },

  accessory_emberfell_rare_01: {
    id: 'accessory_emberfell_rare_01',
    name: "Pyrax's Ember",
    description: 'An eternal flame that once burned at the Flamelord\'s core.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'emberfell',
    requiredLevel: 63,
    stats: { maxHP: 150, hpRegen: 0.01, energyGain: 0.15, magicPower: 80, magicResist: 30 },
    buyPrice: 72000,
    sellPrice: 18000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F525}'
  },

  // --- Armor ---
  armor_emberfell_common_01: {
    id: 'armor_emberfell_common_01',
    name: 'Ashweave Robes',
    description: 'Woven from volcanic fibers. Provides surprising protection from heat and claws.',
    type: 'armor',
    rarity: 'common',
    zone: 'emberfell',
    requiredLevel: 45,
    stats: { maxHP: 150, armor: 20, magicResist: 45 },
    buyPrice: 15000,
    sellPrice: 3750,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F458}'
  },

  armor_emberfell_uncommon_01: {
    id: 'armor_emberfell_uncommon_01',
    name: 'Magma Forged Plate',
    description: 'Armor tempered in liquid rock. The heat never fully leaves the metal.',
    type: 'armor',
    rarity: 'uncommon',
    zone: 'emberfell',
    requiredLevel: 52,
    stats: { maxHP: 250, hpRegen: 0.015, armor: 25, magicResist: 60 },
    buyPrice: 36000,
    sellPrice: 9000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F30B}'
  },

  armor_emberfell_rare_01: {
    id: 'armor_emberfell_rare_01',
    name: "Pyrax's Mantle",
    description: 'The Flamelord\'s own hide, still smoldering with eternal fire.',
    type: 'armor',
    rarity: 'rare',
    zone: 'emberfell',
    requiredLevel: 63,
    stats: { maxHP: 380, hpRegen: 0.018, critChance: 0.05, armor: 30, magicResist: 80 },
    buyPrice: 90000,
    sellPrice: 22500,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F525}'
  },

  // ===== ZONE 6: FROSTPEAK SUMMIT =====

  // --- Weapons ---
  weapon_frostpeak_common_01: {
    id: 'weapon_frostpeak_common_01',
    name: 'Icicle Dagger',
    description: 'A blade of eternal ice. Never melts, never dulls, always cold.',
    type: 'weapon',
    rarity: 'common',
    zone: 'frostpeak',
    requiredLevel: 60,
    stats: { attack: 1000 },
    buyPrice: 30000,
    sellPrice: 7500,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F9CA}'
  },

  weapon_frostpeak_common_02: {
    id: 'weapon_frostpeak_common_02',
    name: 'Frostbite Axe',
    description: 'Its edge causes frostbite on contact. Even a scratch is dangerous.',
    type: 'weapon',
    rarity: 'common',
    zone: 'frostpeak',
    requiredLevel: 65,
    stats: { attack: 1180 },
    buyPrice: 30000,
    sellPrice: 7500,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2744\uFE0F'
  },

  weapon_frostpeak_uncommon_01: {
    id: 'weapon_frostpeak_uncommon_01',
    name: 'Glacial Greatsword',
    description: 'A massive blade of blue ice. Each swing brings winter\'s wrath.',
    type: 'weapon',
    rarity: 'uncommon',
    zone: 'frostpeak',
    requiredLevel: 68,
    stats: { attack: 1400, critChance: 0.07, critDamage: 0.4, magicPower: 450 },
    buyPrice: 75000,
    sellPrice: 18750,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2694\uFE0F'
  },

  weapon_frostpeak_rare_01: {
    id: 'weapon_frostpeak_rare_01',
    name: "Glacielle's Kiss",
    description: 'The frozen blade of the Winter Queen herself. Its touch is death.',
    type: 'weapon',
    rarity: 'rare',
    zone: 'frostpeak',
    requiredLevel: 78,
    stats: { attack: 2000, critChance: 0.08, critDamage: 0.6, armorPen: 30, magicPower: 650 },
    buyPrice: 180000,
    sellPrice: 45000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F48B}'
  },

  // --- Accessories ---
  accessory_frostpeak_common_01: {
    id: 'accessory_frostpeak_common_01',
    name: 'Frozen Heart Gem',
    description: 'A gem that beats with cold energy. Numbs emotions but sharpens focus.',
    type: 'accessory',
    rarity: 'common',
    zone: 'frostpeak',
    requiredLevel: 60,
    stats: { goldFind: 0.18 },
    buyPrice: 30000,
    sellPrice: 7500,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F499}'
  },

  accessory_frostpeak_uncommon_01: {
    id: 'accessory_frostpeak_uncommon_01',
    name: 'Aurora Pendant',
    description: 'Captures the northern lights within crystal. Radiates mysterious fortune.',
    type: 'accessory',
    rarity: 'uncommon',
    zone: 'frostpeak',
    requiredLevel: 65,
    stats: { goldFind: 0.22, critChance: 0.06, magicPen: 0.10 },
    buyPrice: 75000,
    sellPrice: 18750,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F30C}'
  },

  accessory_frostpeak_rare_01: {
    id: 'accessory_frostpeak_rare_01',
    name: "Glacielle's Heart",
    description: 'The frozen heart the Winter Queen discarded for immortality.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'frostpeak',
    requiredLevel: 78,
    stats: { maxHP: 200, hpRegen: 0.015, magicResist: 60 },
    buyPrice: 180000,
    sellPrice: 45000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F499}'
  },

  // --- Armor ---
  armor_frostpeak_common_01: {
    id: 'armor_frostpeak_common_01',
    name: 'Frostweave Cloak',
    description: 'Woven from enchanted snowflakes. Keeps you warm while chilling your enemies.',
    type: 'armor',
    rarity: 'common',
    zone: 'frostpeak',
    requiredLevel: 60,
    stats: { maxHP: 220, armor: 25, magicResist: 55 },
    buyPrice: 36000,
    sellPrice: 9000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2744\uFE0F'
  },

  armor_frostpeak_uncommon_01: {
    id: 'armor_frostpeak_uncommon_01',
    name: 'Avalanche Armor',
    description: 'Forged from glacial metal. Heavy as a mountain, cold as death.',
    type: 'armor',
    rarity: 'uncommon',
    zone: 'frostpeak',
    requiredLevel: 68,
    stats: { maxHP: 350, hpRegen: 0.018, armor: 35, magicResist: 75 },
    buyPrice: 90000,
    sellPrice: 22500,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F3D4}\uFE0F'
  },

  armor_frostpeak_rare_01: {
    id: 'armor_frostpeak_rare_01',
    name: "Glacielle's Embrace",
    description: 'The Winter Queen\'s own armor. Those who wear it feel neither pain nor fear.',
    type: 'armor',
    rarity: 'rare',
    zone: 'frostpeak',
    requiredLevel: 78,
    stats: { maxHP: 500, hpRegen: 0.020, skillCooldown: 0.10, armor: 40, magicResist: 100 },
    buyPrice: 225000,
    sellPrice: 56250,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F451}'
  },

  // ===== ZONE 7: THE VOID RIFT =====

  // --- Weapons ---
  weapon_voidrift_common_01: {
    id: 'weapon_voidrift_common_01',
    name: 'Void Shard Blade',
    description: 'A blade made from solidified void energy. Reality bends around its edge.',
    type: 'weapon',
    rarity: 'common',
    zone: 'voidrift',
    requiredLevel: 75,
    stats: { attack: 2200 },
    buyPrice: 75000,
    sellPrice: 18750,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F311}'
  },

  weapon_voidrift_common_02: {
    id: 'weapon_voidrift_common_02',
    name: 'Chaos Edge',
    description: 'Its form constantly shifts. You can never be sure where it will strike.',
    type: 'weapon',
    rarity: 'common',
    zone: 'voidrift',
    requiredLevel: 82,
    stats: { attack: 2600, magicPower: 800 },
    buyPrice: 75000,
    sellPrice: 18750,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F300}'
  },

  weapon_voidrift_uncommon_01: {
    id: 'weapon_voidrift_uncommon_01',
    name: 'Reality Render',
    description: 'This blade cuts through the fabric of existence itself.',
    type: 'weapon',
    rarity: 'uncommon',
    zone: 'voidrift',
    requiredLevel: 85,
    stats: { attack: 3100, critChance: 0.08, critDamage: 0.5 },
    buyPrice: 187500,
    sellPrice: 46875,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2702\uFE0F'
  },

  weapon_voidrift_rare_01: {
    id: 'weapon_voidrift_rare_01',
    name: "Nightmare's Edge",
    description: 'Forged from the dreams of dying gods. Whispers secrets of destruction.',
    type: 'weapon',
    rarity: 'rare',
    zone: 'voidrift',
    requiredLevel: 90,
    stats: { attack: 4400, critChance: 0.09, critDamage: 0.7, armorPen: 35, magicPower: 1400 },
    buyPrice: 450000,
    sellPrice: 112500,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F631}'
  },

  weapon_voidrift_epic_01: {
    id: 'weapon_voidrift_epic_01',
    name: 'Abyssal Devastator',
    description: 'A weapon that should not exist. It hungers for the end of all things.',
    type: 'weapon',
    rarity: 'epic',
    zone: 'voidrift',
    requiredLevel: 95,
    stats: { attack: 6000, critChance: 0.10, critDamage: 0.9, armorPen: 45, magicPower: 2000 },
    buyPrice: 1125000,
    sellPrice: 281250,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u26AB'
  },

  weapon_voidrift_legendary_01: {
    id: 'weapon_voidrift_legendary_01',
    name: "Xal'theron's Demise",
    description: 'The crystallized essence of the Void King\'s defeat. Contains the power of a dead god.',
    type: 'weapon',
    rarity: 'legendary',
    zone: 'voidrift',
    requiredLevel: 100,
    stats: { attack: 8000, critChance: 0.12, critDamage: 1.0, armorPen: 100, magicPower: 2500 },
    buyPrice: 3750000,
    sellPrice: 937500,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F451}'
  },

  // --- Accessories ---
  accessory_voidrift_common_01: {
    id: 'accessory_voidrift_common_01',
    name: 'Void Fragment',
    description: 'A piece of solidified nothing. Strangely valuable.',
    type: 'accessory',
    rarity: 'common',
    zone: 'voidrift',
    requiredLevel: 75,
    stats: { goldFind: 0.22 },
    buyPrice: 75000,
    sellPrice: 18750,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F52E}'
  },

  accessory_voidrift_uncommon_01: {
    id: 'accessory_voidrift_uncommon_01',
    name: 'Chaos Crystal',
    description: 'Order and chaos wage eternal war within this gem. Both sides grant power.',
    type: 'accessory',
    rarity: 'uncommon',
    zone: 'voidrift',
    requiredLevel: 82,
    stats: { goldFind: 0.25, critChance: 0.07, magicPen: 0.12 },
    buyPrice: 187500,
    sellPrice: 46875,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F48E}'
  },

  accessory_voidrift_rare_01: {
    id: 'accessory_voidrift_rare_01',
    name: 'Reality Anchor',
    description: 'Keeps you grounded in existence. Critical for surviving the Void Rift.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'voidrift',
    requiredLevel: 88,
    stats: { goldFind: 0.30, xpBonus: 0.20, magicResist: 40 },
    buyPrice: 450000,
    sellPrice: 112500,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u2693'
  },

  accessory_voidrift_legendary_01: {
    id: 'accessory_voidrift_legendary_01',
    name: 'Crown of the Void',
    description: 'The crown worn by the Void King himself. You have conquered the ultimate darkness.',
    type: 'accessory',
    rarity: 'legendary',
    zone: 'voidrift',
    requiredLevel: 100,
    stats: { maxHP: 500, hpRegen: 0.02, energyGain: 0.25, critChance: 0.10, magicPower: 500, magicPen: 0.15 },
    buyPrice: 3750000,
    sellPrice: 937500,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F451}'
  },

  // --- Armor ---
  armor_voidrift_common_01: {
    id: 'armor_voidrift_common_01',
    name: 'Voidtouched Vestments',
    description: 'Robes woven from void threads. Reality seems uncertain around you.',
    type: 'armor',
    rarity: 'common',
    zone: 'voidrift',
    requiredLevel: 75,
    stats: { maxHP: 320, armor: 50, magicResist: 50 },
    buyPrice: 90000,
    sellPrice: 22500,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F311}'
  },

  armor_voidrift_uncommon_01: {
    id: 'armor_voidrift_uncommon_01',
    name: 'Entropy Plate',
    description: 'Armor that exists in multiple states simultaneously.',
    type: 'armor',
    rarity: 'uncommon',
    zone: 'voidrift',
    requiredLevel: 85,
    stats: { maxHP: 480, hpRegen: 0.020, armor: 70, magicResist: 70 },
    buyPrice: 225000,
    sellPrice: 56250,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F52E}'
  },

  armor_voidrift_rare_01: {
    id: 'armor_voidrift_rare_01',
    name: 'Abyssal Guardian',
    description: 'Forged from pure void essence. The darkness protects its own.',
    type: 'armor',
    rarity: 'rare',
    zone: 'voidrift',
    requiredLevel: 92,
    stats: { maxHP: 650, hpRegen: 0.022, skillCooldown: 0.12, armor: 90, magicResist: 90 },
    buyPrice: 540000,
    sellPrice: 135000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F6E1}\uFE0F'
  },

  armor_voidrift_legendary_01: {
    id: 'armor_voidrift_legendary_01',
    name: "Xal'theron's Mantle",
    description: 'The physical form of the Void King\'s power. You are now the master of nothingness.',
    type: 'armor',
    rarity: 'legendary',
    zone: 'voidrift',
    requiredLevel: 100,
    stats: { maxHP: 1000, hpRegen: 0.025, skillCooldown: 0.20, skillEnergyCost: 0.15, armor: 120, magicResist: 120 },
    buyPrice: 4500000,
    sellPrice: 1125000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F451}'
  },

  // ===== EPIC & LEGENDARY ITEMS (MID-GAME) =====

  // --- Shadowmire Epic ---
  weapon_shadowmire_epic_01: {
    id: 'weapon_shadowmire_epic_01',
    name: 'Witchbane Edge',
    description: 'Forged to slay the dark witches of the mire. Glows with purifying fire.',
    type: 'weapon',
    rarity: 'epic',
    zone: 'shadowmire',
    requiredLevel: 27,
    stats: { attack: 155, critChance: 0.06, critDamage: 0.35, armorPen: 8, magicPower: 50 },
    buyPrice: 22500,
    sellPrice: 5625,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F52E}'
  },

  // --- Ironhold Epic ---
  weapon_ironhold_epic_01: {
    id: 'weapon_ironhold_epic_01',
    name: "Runemaster's Warhammer",
    description: 'Ancient dwarven runes cover this massive hammer. Each strike echoes through stone.',
    type: 'weapon',
    rarity: 'epic',
    zone: 'ironhold',
    requiredLevel: 40,
    stats: { attack: 360, critChance: 0.07, critDamage: 0.45, armorPen: 25 },
    buyPrice: 67500,
    sellPrice: 16875,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F528}'
  },

  armor_ironhold_epic_01: {
    id: 'armor_ironhold_epic_01',
    name: 'Adamantine Bulwark',
    description: 'Armor forged from the rarest metal in the peaks. Nearly impervious to harm.',
    type: 'armor',
    rarity: 'epic',
    zone: 'ironhold',
    requiredLevel: 42,
    stats: { maxHP: 400, hpRegen: 0.018, armor: 80, magicResist: 20 },
    buyPrice: 67500,
    sellPrice: 16875,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F6E1}\uFE0F'
  },

  // --- Emberfell Epic ---
  weapon_emberfell_epic_01: {
    id: 'weapon_emberfell_epic_01',
    name: 'Phoenix Talon',
    description: 'A blade crafted from phoenix claw. Burns eternally with rebirth fire.',
    type: 'weapon',
    rarity: 'epic',
    zone: 'emberfell',
    requiredLevel: 55,
    stats: { attack: 810, critChance: 0.08, critDamage: 0.55, armorPen: 30, magicPower: 270 },
    buyPrice: 180000,
    sellPrice: 45000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F525}'
  },

  armor_emberfell_epic_01: {
    id: 'armor_emberfell_epic_01',
    name: 'Magmaborn Plate',
    description: 'Armor that emerged from a volcanic eruption, perfectly formed. Radiates intense heat.',
    type: 'armor',
    rarity: 'epic',
    zone: 'emberfell',
    requiredLevel: 55,
    stats: { maxHP: 450, hpRegen: 0.020, critChance: 0.06, armor: 30, magicResist: 85 },
    buyPrice: 180000,
    sellPrice: 45000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F30B}'
  },

  // --- Frostpeak Legendary ---
  weapon_frostpeak_legendary_01: {
    id: 'weapon_frostpeak_legendary_01',
    name: 'Winterheart',
    description: 'A sword blessed by the Winter Queen herself. Its wielder becomes one with the eternal cold.',
    type: 'weapon',
    rarity: 'legendary',
    zone: 'frostpeak',
    requiredLevel: 73,
    stats: { attack: 1800, critChance: 0.10, critDamage: 0.75, armorPen: 40, skillCooldown: 0.15, magicPower: 600 },
    buyPrice: 1500000,
    sellPrice: 375000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u2744\uFE0F'
  },

  armor_frostpeak_legendary_01: {
    id: 'armor_frostpeak_legendary_01',
    name: 'Permafrost Mantle',
    description: "The frozen armor of Glacielle's personal guard. Grants immunity to all that would slow you.",
    type: 'armor',
    rarity: 'legendary',
    zone: 'frostpeak',
    requiredLevel: 73,
    stats: { maxHP: 750, hpRegen: 0.025, skillEnergyCost: 0.20, armor: 45, magicResist: 110 },
    buyPrice: 1500000,
    sellPrice: 375000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F9CA}'
  },

  // ===== SKILL-ENHANCING ACCESSORIES =====

  // --- Berserk Build ---
  accessory_skillboost_berserk_01: {
    id: 'accessory_skillboost_berserk_01',
    name: "Berserker's Torc",
    description: 'A neck ring worn by ancient berserker warriors. Your rage burns hotter.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'dustwind',
    requiredLevel: 18,
    stats: { attack: 15, skillBoost_berserk: 0.20 },
    buyPrice: 5400,
    sellPrice: 1350,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u2B55'
  },

  accessory_skillboost_berserk_02: {
    id: 'accessory_skillboost_berserk_02',
    name: 'Fury Incarnate',
    description: 'Pure rage condensed into physical form. Handle with extreme caution.',
    type: 'accessory',
    rarity: 'legendary',
    zone: 'emberfell',
    requiredLevel: 55,
    stats: { attack: 100, critChance: 0.10, critDamage: 0.50, skillBoost_berserk: 0.50 },
    buyPrice: 750000,
    sellPrice: 187500,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F525}'
  },

  // --- Heal Build ---
  accessory_skillboost_heal_01: {
    id: 'accessory_skillboost_heal_01',
    name: "Healer's Pendant",
    description: 'A crystal pendant that amplifies restorative magic.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'shadowmire',
    requiredLevel: 25,
    stats: { maxHP: 75, skillBoost_heal: 0.30 },
    buyPrice: 12000,
    sellPrice: 3000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F4FF}'
  },

  accessory_skillboost_heal_02: {
    id: 'accessory_skillboost_heal_02',
    name: "Life Guardian's Amulet",
    description: 'The healing energies flow through you like a river of life.',
    type: 'accessory',
    rarity: 'epic',
    zone: 'frostpeak',
    requiredLevel: 65,
    stats: { maxHP: 200, hpRegen: 0.02, skillBoost_heal: 0.50, skillEnergyCost: 0.15, magicResist: 40 },
    buyPrice: 540000,
    sellPrice: 135000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F52E}'
  },

  // --- Power Strike Build ---
  accessory_skillboost_power_strike_01: {
    id: 'accessory_skillboost_power_strike_01',
    name: "Striker's Gauntlet",
    description: 'An ancient gauntlet that channels raw power into your strikes.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'ironhold',
    requiredLevel: 35,
    stats: { attack: 25, skillBoost_power_strike: 0.25 },
    buyPrice: 36000,
    sellPrice: 9000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F9E4}'
  },

  accessory_skillboost_power_strike_02: {
    id: 'accessory_skillboost_power_strike_02',
    name: "Devastator's Ring",
    description: 'Each Power Strike echoes with the force of a thousand warriors.',
    type: 'accessory',
    rarity: 'epic',
    zone: 'emberfell',
    requiredLevel: 50,
    stats: { critDamage: 0.3, skillBoost_power_strike: 0.50, skillCooldown: 0.10 },
    buyPrice: 225000,
    sellPrice: 56250,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F48D}'
  },

  // --- Execute Build ---
  accessory_skillboost_execute_01: {
    id: 'accessory_skillboost_execute_01',
    name: "Executioner's Hood",
    description: 'Worn by those who deliver final judgments. Execution threshold increased.',
    type: 'accessory',
    rarity: 'rare',
    zone: 'ironhold',
    requiredLevel: 40,
    stats: { critChance: 0.05, skillBoost_execute: 0.05 },
    buyPrice: 45000,
    sellPrice: 11250,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F3AD}'
  },

  accessory_skillboost_execute_02: {
    id: 'accessory_skillboost_execute_02',
    name: "Death's Judgment",
    description: 'When you wear this, every monster knows their time is short.',
    type: 'accessory',
    rarity: 'legendary',
    zone: 'voidrift',
    requiredLevel: 85,
    stats: { attack: 150, critChance: 0.08, skillBoost_execute: 0.15, skillCooldown: 0.20, magicPen: 0.10 },
    buyPrice: 1500000,
    sellPrice: 375000,
    shopAvailable: false,
    dropOnly: true,
    emoji: '\u{1F480}'
  },

  // --- General Skill Enhancement ---
  accessory_skillboost_general_01: {
    id: 'accessory_skillboost_general_01',
    name: "Sage's Focus Crystal",
    description: 'A crystal that helps channel your mental focus. All skills become more efficient.',
    type: 'accessory',
    rarity: 'epic',
    zone: 'frostpeak',
    requiredLevel: 60,
    stats: { energyGain: 0.15, skillCooldown: 0.15, skillEnergyCost: 0.10, magicPower: 50 },
    buyPrice: 300000,
    sellPrice: 75000,
    shopAvailable: true,
    dropOnly: false,
    emoji: '\u{1F48E}'
  }
};

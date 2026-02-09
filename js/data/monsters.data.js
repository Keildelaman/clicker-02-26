/**
 * monsters.data.js - Monster Definitions
 *
 * Static data for all monsters and bosses across 7 zones.
 * Phase 6: 35 monsters (28 regular + 7 bosses).
 *
 * Monster types: normal, swift, aggressive, regenerating, armored, shielded
 * Bosses are always aggressive + may have secondary types (e.g. "aggressive+armored")
 *
 * Aggressive monsters use mechanics: { attackCycle (total ms), warningDuration, attackDuration, damagePercent }
 * where safeDuration = attackCycle - warningDuration - attackDuration
 *
 * @see docs/data/monsters.data.md
 */

export const MONSTERS = {
  // ===== ZONE 1: WHISPERWOOD GLEN (Levels 1-10) =====
  // All normal type — types introduced starting from Zone 2

  whisperwood_sprite: {
    id: 'whisperwood_sprite',
    name: 'Forest Sprite',
    description: 'A mischievous nature spirit that flickers between the trees.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 1,
    levelMax: 4,
    baseHealth: 20,
    healthPerLevel: 5,
    goldMin: 2,
    goldMax: 4,
    goldPerLevel: 1,
    xpMin: 8,
    xpMax: 12,
    xpPerLevel: 2,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_01', chance: 0.08 }
    ],
    emoji: '\u{1F9DA}',
    deathEmoji: '\u2728',
    spawnWeight: 30
  },

  whisperwood_boar: {
    id: 'whisperwood_boar',
    name: 'Wild Boar',
    description: 'A territorial beast with sharp tusks. Charges at anything that disturbs its foraging.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 2,
    levelMax: 6,
    baseHealth: 35,
    healthPerLevel: 8,
    goldMin: 3,
    goldMax: 6,
    goldPerLevel: 1,
    xpMin: 10,
    xpMax: 15,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_01', chance: 0.06 },
      { itemId: 'weapon_whisperwood_common_02', chance: 0.06 }
    ],
    emoji: '\u{1F417}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  whisperwood_wolf: {
    id: 'whisperwood_wolf',
    name: 'Timber Wolf',
    description: 'A cunning predator of the forest. Usually hunts in packs, but this one strayed from its family.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 4,
    levelMax: 8,
    baseHealth: 45,
    healthPerLevel: 10,
    goldMin: 4,
    goldMax: 8,
    goldPerLevel: 2,
    xpMin: 12,
    xpMax: 18,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_02', chance: 0.08 },
      { itemId: 'weapon_whisperwood_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u{1F43A}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  whisperwood_treant: {
    id: 'whisperwood_treant',
    name: 'Grumpy Treant',
    description: 'An awakened tree spirit, cranky from centuries of standing in one place.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 6,
    levelMax: 10,
    baseHealth: 70,
    healthPerLevel: 15,
    goldMin: 5,
    goldMax: 10,
    goldPerLevel: 2,
    xpMin: 15,
    xpMax: 22,
    xpPerLevel: 4,
    lootTable: [
      { itemId: 'weapon_whisperwood_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_whisperwood_common_01', chance: 0.06 },
      { itemId: 'weapon_whisperwood_rare_01', chance: 0.005 }
    ],
    emoji: '\u{1F333}',
    deathEmoji: '\u{1FAB5}',
    spawnWeight: 20
  },

  whisperwood_rabbit: {
    id: 'whisperwood_rabbit',
    name: 'Giant Rabbit',
    description: 'An oversized rabbit with surprisingly sharp teeth. Hops erratically to dodge attacks.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 1,
    levelMax: 3,
    baseHealth: 15,
    healthPerLevel: 4,
    goldMin: 1,
    goldMax: 3,
    goldPerLevel: 1,
    xpMin: 6,
    xpMax: 10,
    xpPerLevel: 2,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_01', chance: 0.06 }
    ],
    emoji: '\u{1F407}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 30
  },

  whisperwood_mushroom: {
    id: 'whisperwood_mushroom',
    name: 'Spore Puff',
    description: 'A walking mushroom that releases toxic spores when threatened. Surprisingly sturdy.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 2,
    levelMax: 5,
    baseHealth: 25,
    healthPerLevel: 6,
    goldMin: 2,
    goldMax: 5,
    goldPerLevel: 1,
    xpMin: 8,
    xpMax: 13,
    xpPerLevel: 2,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_01', chance: 0.05 },
      { itemId: 'accessory_whisperwood_common_01', chance: 0.04 }
    ],
    emoji: '\u{1F344}',
    deathEmoji: '\u{1F4A8}',
    spawnWeight: 28
  },

  whisperwood_spider: {
    id: 'whisperwood_spider',
    name: 'Cave Spider',
    description: 'A large arachnid that lurks in shadowy corners of the forest. Its web is sticky and strong.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 3,
    levelMax: 7,
    baseHealth: 30,
    healthPerLevel: 7,
    goldMin: 3,
    goldMax: 6,
    goldPerLevel: 1,
    xpMin: 9,
    xpMax: 14,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_02', chance: 0.06 }
    ],
    emoji: '\u{1F577}\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  whisperwood_bear: {
    id: 'whisperwood_bear',
    name: 'Forest Bear',
    description: 'A massive bear that guards its territory fiercely. Thick fur absorbs blows like armor.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 5,
    levelMax: 9,
    baseHealth: 55,
    healthPerLevel: 12,
    goldMin: 4,
    goldMax: 9,
    goldPerLevel: 2,
    xpMin: 13,
    xpMax: 20,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'weapon_whisperwood_uncommon_01', chance: 0.04 },
      { itemId: 'armor_whisperwood_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F43B}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 22
  },

  whisperwood_owl: {
    id: 'whisperwood_owl',
    name: 'Shadow Owl',
    description: 'A nocturnal predator with piercing eyes that glow in the dark. Silent and deadly.',
    zone: 'whisperwood',
    type: 'normal',
    isBoss: false,
    levelMin: 7,
    levelMax: 10,
    baseHealth: 60,
    healthPerLevel: 13,
    goldMin: 5,
    goldMax: 10,
    goldPerLevel: 2,
    xpMin: 15,
    xpMax: 22,
    xpPerLevel: 4,
    lootTable: [
      { itemId: 'weapon_whisperwood_uncommon_01', chance: 0.05 },
      { itemId: 'weapon_whisperwood_rare_01', chance: 0.004 }
    ],
    emoji: '\u{1F989}',
    deathEmoji: '\u{1FAB6}',
    spawnWeight: 20
  },

  boss_mossback: {
    id: 'boss_mossback',
    name: 'Old Mossback',
    description: 'An ancient treant who has guarded Whisperwood for centuries.',
    zone: 'whisperwood',
    type: 'aggressive',
    isBoss: true,
    levelMin: 10,
    levelMax: 10,
    baseHealth: 500,
    healthPerLevel: 0,
    goldMin: 100,
    goldMax: 150,
    goldPerLevel: 0,
    xpMin: 200,
    xpMax: 250,
    xpPerLevel: 0,
    mechanics: {
      attackCycle: 6000,
      warningDuration: 800,
      attackDuration: 1200,
      damagePercent: 0.10
    },
    lootTable: [
      { itemId: 'weapon_whisperwood_rare_01', chance: 1.0 },
      { itemId: 'armor_whisperwood_rare_01', chance: 1.0 }
    ],
    emoji: '\u{1F332}',
    deathEmoji: '\u{1FAB5}',
    spawnWeight: 0
  },

  // ===== ZONE 2: DUSTWIND PLAINS (Levels 10-20) =====

  dustwind_dog: {
    id: 'dustwind_dog',
    name: 'Prairie Dog',
    description: 'These oversized rodents have adapted to the harsh plains. They bite harder than they look.',
    zone: 'dustwind',
    type: 'normal',
    isBoss: false,
    levelMin: 10,
    levelMax: 13,
    baseHealth: 80,
    healthPerLevel: 12,
    goldMin: 6,
    goldMax: 12,
    goldPerLevel: 2,
    xpMin: 18,
    xpMax: 25,
    xpPerLevel: 4,
    lootTable: [
      { itemId: 'weapon_dustwind_common_01', chance: 0.08 }
    ],
    emoji: '\u{1F43F}\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 30
  },

  dustwind_devil: {
    id: 'dustwind_devil',
    name: 'Dust Devil',
    description: 'A small air elemental that whips up debris into a stinging whirlwind.',
    zone: 'dustwind',
    type: 'swift',
    isBoss: false,
    levelMin: 11,
    levelMax: 15,
    baseHealth: 95,
    healthPerLevel: 15,
    escapeTimer: 8000,
    escapeDamage: 0.05,
    goldMin: 8,
    goldMax: 15,
    goldPerLevel: 2,
    xpMin: 22,
    xpMax: 30,
    xpPerLevel: 4,
    lootTable: [
      { itemId: 'weapon_dustwind_common_01', chance: 0.06 },
      { itemId: 'accessory_dustwind_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F32A}\uFE0F',
    deathEmoji: '\u{1F4A8}',
    spawnWeight: 25
  },

  dustwind_bandit: {
    id: 'dustwind_bandit',
    name: 'Bandit Scout',
    description: 'A lowly member of Redfang\'s gang, sent to patrol the roads and rob unwary travelers.',
    zone: 'dustwind',
    type: 'aggressive',
    isBoss: false,
    levelMin: 13,
    levelMax: 17,
    baseHealth: 120,
    healthPerLevel: 18,
    mechanics: {
      attackCycle: 6400,
      warningDuration: 600,
      attackDuration: 800,
      damagePercent: 0.08
    },
    goldMin: 10,
    goldMax: 20,
    goldPerLevel: 3,
    xpMin: 28,
    xpMax: 38,
    xpPerLevel: 5,
    lootTable: [
      { itemId: 'weapon_dustwind_common_02', chance: 0.08 },
      { itemId: 'weapon_dustwind_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F5E1}\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  dustwind_stalker: {
    id: 'dustwind_stalker',
    name: 'Plains Stalker',
    description: 'A large predatory cat that hunts the grasslands. Silent, fast, and deadly.',
    zone: 'dustwind',
    type: 'swift',
    isBoss: false,
    levelMin: 15,
    levelMax: 20,
    baseHealth: 150,
    healthPerLevel: 20,
    escapeTimer: 7000,
    escapeDamage: 0.08,
    goldMin: 12,
    goldMax: 25,
    goldPerLevel: 3,
    xpMin: 35,
    xpMax: 48,
    xpPerLevel: 6,
    lootTable: [
      { itemId: 'weapon_dustwind_uncommon_01', chance: 0.05 },
      { itemId: 'weapon_dustwind_rare_01', chance: 0.008 },
      { itemId: 'accessory_dustwind_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u{1F406}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 20
  },

  dustwind_scorpion: {
    id: 'dustwind_scorpion',
    name: 'Sand Scorpion',
    description: 'A heavily armored arachnid that burrows beneath the sand. Its stinger delivers a painful venom.',
    zone: 'dustwind',
    type: 'normal',
    isBoss: false,
    levelMin: 10,
    levelMax: 14,
    baseHealth: 90,
    healthPerLevel: 14,
    goldMin: 7,
    goldMax: 14,
    goldPerLevel: 2,
    xpMin: 20,
    xpMax: 28,
    xpPerLevel: 4,
    lootTable: [
      { itemId: 'weapon_dustwind_common_01', chance: 0.07 },
      { itemId: 'armor_dustwind_common_01', chance: 0.04 }
    ],
    emoji: '\u{1F982}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 28
  },

  dustwind_snake: {
    id: 'dustwind_snake',
    name: 'Sidewinder',
    description: 'A swift desert serpent that strikes and retreats before you can react.',
    zone: 'dustwind',
    type: 'swift',
    isBoss: false,
    levelMin: 11,
    levelMax: 15,
    baseHealth: 85,
    healthPerLevel: 12,
    escapeTimer: 8500,
    escapeDamage: 0.04,
    goldMin: 9,
    goldMax: 16,
    goldPerLevel: 2,
    xpMin: 24,
    xpMax: 32,
    xpPerLevel: 5,
    lootTable: [
      { itemId: 'weapon_dustwind_common_02', chance: 0.06 }
    ],
    emoji: '\u{1F40D}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  dustwind_vulture: {
    id: 'dustwind_vulture',
    name: 'Dustwind Vulture',
    description: 'A massive scavenger bird that swoops down on weakened prey. Will flee if the fight turns.',
    zone: 'dustwind',
    type: 'swift',
    isBoss: false,
    levelMin: 12,
    levelMax: 16,
    baseHealth: 100,
    healthPerLevel: 14,
    escapeTimer: 7500,
    escapeDamage: 0.06,
    goldMin: 9,
    goldMax: 17,
    goldPerLevel: 3,
    xpMin: 25,
    xpMax: 34,
    xpPerLevel: 5,
    lootTable: [
      { itemId: 'accessory_dustwind_common_01', chance: 0.06 },
      { itemId: 'weapon_dustwind_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u{1F985}',
    deathEmoji: '\u{1FAB6}',
    spawnWeight: 23
  },

  dustwind_raider: {
    id: 'dustwind_raider',
    name: 'Bandit Raider',
    description: 'A seasoned bandit who attacks with wild abandon. Timing your clicks is key.',
    zone: 'dustwind',
    type: 'aggressive',
    isBoss: false,
    levelMin: 14,
    levelMax: 18,
    baseHealth: 140,
    healthPerLevel: 18,
    mechanics: {
      attackCycle: 5800,
      warningDuration: 550,
      attackDuration: 750,
      damagePercent: 0.09
    },
    goldMin: 12,
    goldMax: 22,
    goldPerLevel: 3,
    xpMin: 30,
    xpMax: 42,
    xpPerLevel: 5,
    lootTable: [
      { itemId: 'weapon_dustwind_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_dustwind_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u2694\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 22
  },

  dustwind_coyote: {
    id: 'dustwind_coyote',
    name: 'Dust Coyote',
    description: 'A large, cunning predator of the plains. Hunts in the twilight hours.',
    zone: 'dustwind',
    type: 'normal',
    isBoss: false,
    levelMin: 16,
    levelMax: 20,
    baseHealth: 160,
    healthPerLevel: 20,
    goldMin: 13,
    goldMax: 25,
    goldPerLevel: 3,
    xpMin: 35,
    xpMax: 48,
    xpPerLevel: 6,
    lootTable: [
      { itemId: 'weapon_dustwind_uncommon_01', chance: 0.06 },
      { itemId: 'weapon_dustwind_rare_01', chance: 0.006 }
    ],
    emoji: '\u{1F415}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 20
  },

  boss_redfang: {
    id: 'boss_redfang',
    name: 'Redfang the Bandit King',
    description: 'The notorious leader of the Dustwind bandits. His crimson blade has ended countless lives.',
    zone: 'dustwind',
    type: 'aggressive',
    isBoss: true,
    levelMin: 20,
    levelMax: 20,
    baseHealth: 1200,
    healthPerLevel: 0,
    goldMin: 300,
    goldMax: 450,
    goldPerLevel: 0,
    xpMin: 500,
    xpMax: 600,
    xpPerLevel: 0,
    mechanics: {
      attackCycle: 5200,
      warningDuration: 700,
      attackDuration: 1000,
      damagePercent: 0.12
    },
    lootTable: [
      { itemId: 'weapon_dustwind_rare_01', chance: 1.0 },
      { itemId: 'accessory_dustwind_rare_01', chance: 0.25 }
    ],
    emoji: '\u{1F451}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 0
  },

  // ===== ZONE 3: SHADOWMIRE SWAMP (Levels 20-30) =====

  shadowmire_crawler: {
    id: 'shadowmire_crawler',
    name: 'Bog Crawler',
    description: 'A many-legged creature that lurks beneath the murky water.',
    zone: 'shadowmire',
    type: 'normal',
    isBoss: false,
    levelMin: 20,
    levelMax: 24,
    baseHealth: 200,
    healthPerLevel: 25,
    goldMin: 15,
    goldMax: 30,
    goldPerLevel: 4,
    xpMin: 45,
    xpMax: 60,
    xpPerLevel: 7,
    lootTable: [
      { itemId: 'weapon_shadowmire_common_01', chance: 0.08 }
    ],
    emoji: '\u{1F982}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 30
  },

  shadowmire_wisp: {
    id: 'shadowmire_wisp',
    name: 'Will-o-Wisp',
    description: 'Deceptive lights that lead travelers astray. Actually malevolent spirits.',
    zone: 'shadowmire',
    type: 'swift',
    isBoss: false,
    levelMin: 21,
    levelMax: 26,
    baseHealth: 180,
    healthPerLevel: 22,
    escapeTimer: 6000,
    escapeDamage: 0.07,
    goldMin: 18,
    goldMax: 35,
    goldPerLevel: 4,
    xpMin: 50,
    xpMax: 68,
    xpPerLevel: 8,
    lootTable: [
      { itemId: 'weapon_shadowmire_common_02', chance: 0.07 },
      { itemId: 'accessory_shadowmire_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F47B}',
    deathEmoji: '\u2728',
    spawnWeight: 25
  },

  shadowmire_hag: {
    id: 'shadowmire_hag',
    name: 'Swamp Hag',
    description: 'A twisted crone who made dark pacts for power. She collects bones and weaves curses.',
    zone: 'shadowmire',
    type: 'regenerating',
    isBoss: false,
    levelMin: 24,
    levelMax: 28,
    baseHealth: 280,
    healthPerLevel: 30,
    regenRate: 0.03,
    goldMin: 25,
    goldMax: 45,
    goldPerLevel: 5,
    xpMin: 60,
    xpMax: 82,
    xpPerLevel: 9,
    lootTable: [
      { itemId: 'weapon_shadowmire_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_shadowmire_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F9D9}\u200D\u2640\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  shadowmire_husk: {
    id: 'shadowmire_husk',
    name: 'Rotting Husk',
    description: 'The animated remains of those who died in the swamp. Shambles forward with mindless hunger.',
    zone: 'shadowmire',
    type: 'aggressive',
    isBoss: false,
    levelMin: 26,
    levelMax: 30,
    baseHealth: 350,
    healthPerLevel: 35,
    mechanics: {
      attackCycle: 6000,
      warningDuration: 600,
      attackDuration: 900,
      damagePercent: 0.08
    },
    goldMin: 30,
    goldMax: 55,
    goldPerLevel: 6,
    xpMin: 72,
    xpMax: 95,
    xpPerLevel: 10,
    lootTable: [
      { itemId: 'weapon_shadowmire_uncommon_01', chance: 0.06 },
      { itemId: 'weapon_shadowmire_rare_01', chance: 0.008 }
    ],
    emoji: '\u{1F9DF}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 20
  },

  shadowmire_toad: {
    id: 'shadowmire_toad',
    name: 'Bloated Toad',
    description: 'An enormous toad that feeds on swamp corruption. Its wounds close unnaturally fast.',
    zone: 'shadowmire',
    type: 'regenerating',
    isBoss: false,
    levelMin: 20,
    levelMax: 25,
    baseHealth: 240,
    healthPerLevel: 28,
    regenRate: 0.025,
    goldMin: 18,
    goldMax: 34,
    goldPerLevel: 4,
    xpMin: 48,
    xpMax: 65,
    xpPerLevel: 7,
    lootTable: [
      { itemId: 'weapon_shadowmire_common_01', chance: 0.07 },
      { itemId: 'armor_shadowmire_common_01', chance: 0.04 }
    ],
    emoji: '\u{1F438}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 28
  },

  shadowmire_vine: {
    id: 'shadowmire_vine',
    name: 'Strangling Vine',
    description: 'A carnivorous plant that lashes out at anything that passes. Attacks from unexpected angles.',
    zone: 'shadowmire',
    type: 'aggressive',
    isBoss: false,
    levelMin: 22,
    levelMax: 27,
    baseHealth: 260,
    healthPerLevel: 28,
    mechanics: {
      attackCycle: 5800,
      warningDuration: 550,
      attackDuration: 850,
      damagePercent: 0.08
    },
    goldMin: 20,
    goldMax: 38,
    goldPerLevel: 5,
    xpMin: 52,
    xpMax: 72,
    xpPerLevel: 8,
    lootTable: [
      { itemId: 'weapon_shadowmire_common_02', chance: 0.06 },
      { itemId: 'accessory_shadowmire_common_01', chance: 0.04 }
    ],
    emoji: '\u{1F33F}',
    deathEmoji: '\u{1FAB4}',
    spawnWeight: 25
  },

  shadowmire_leech: {
    id: 'shadowmire_leech',
    name: 'Giant Leech',
    description: 'A massive blood-sucking parasite that latches on and drains life. Fast but fragile.',
    zone: 'shadowmire',
    type: 'swift',
    isBoss: false,
    levelMin: 23,
    levelMax: 28,
    baseHealth: 210,
    healthPerLevel: 24,
    escapeTimer: 6500,
    escapeDamage: 0.08,
    goldMin: 22,
    goldMax: 40,
    goldPerLevel: 5,
    xpMin: 55,
    xpMax: 75,
    xpPerLevel: 8,
    lootTable: [
      { itemId: 'weapon_shadowmire_uncommon_01', chance: 0.04 },
      { itemId: 'accessory_shadowmire_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u{1FAB1}',
    deathEmoji: '\u{1F4A7}',
    spawnWeight: 24
  },

  shadowmire_shade: {
    id: 'shadowmire_shade',
    name: 'Murk Shade',
    description: 'A dark presence that coalesces from the swamp fog. Difficult to hit and very durable.',
    zone: 'shadowmire',
    type: 'normal',
    isBoss: false,
    levelMin: 25,
    levelMax: 30,
    baseHealth: 320,
    healthPerLevel: 32,
    goldMin: 28,
    goldMax: 50,
    goldPerLevel: 5,
    xpMin: 65,
    xpMax: 88,
    xpPerLevel: 9,
    lootTable: [
      { itemId: 'weapon_shadowmire_uncommon_01', chance: 0.05 },
      { itemId: 'weapon_shadowmire_epic_01', chance: 0.003 }
    ],
    emoji: '\u{1F32B}\uFE0F',
    deathEmoji: '\u{1F4A8}',
    spawnWeight: 22
  },

  shadowmire_serpent: {
    id: 'shadowmire_serpent',
    name: 'Mire Serpent',
    description: 'A colossal snake that strikes from the murky depths with blinding speed.',
    zone: 'shadowmire',
    type: 'aggressive',
    isBoss: false,
    levelMin: 27,
    levelMax: 30,
    baseHealth: 380,
    healthPerLevel: 38,
    mechanics: {
      attackCycle: 5200,
      warningDuration: 500,
      attackDuration: 800,
      damagePercent: 0.09
    },
    goldMin: 32,
    goldMax: 58,
    goldPerLevel: 6,
    xpMin: 75,
    xpMax: 100,
    xpPerLevel: 10,
    lootTable: [
      { itemId: 'weapon_shadowmire_rare_01', chance: 0.01 },
      { itemId: 'weapon_shadowmire_epic_01', chance: 0.005 }
    ],
    emoji: '\u{1F40D}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 18
  },

  boss_mire_mother: {
    id: 'boss_mire_mother',
    name: 'The Mire Mother',
    description: 'A primordial entity born from the swamp\'s corruption. She is the source of the undead.',
    zone: 'shadowmire',
    type: 'aggressive+regenerating',
    isBoss: true,
    levelMin: 30,
    levelMax: 30,
    baseHealth: 3000,
    healthPerLevel: 0,
    goldMin: 700,
    goldMax: 1000,
    goldPerLevel: 0,
    xpMin: 1200,
    xpMax: 1500,
    xpPerLevel: 0,
    mechanics: {
      attackCycle: 4800,
      warningDuration: 700,
      attackDuration: 1100,
      damagePercent: 0.10
    },
    regenRate: 0.02,
    lootTable: [
      { itemId: 'weapon_shadowmire_rare_01', chance: 1.0 },
      { itemId: 'accessory_shadowmire_rare_01', chance: 0.25 }
    ],
    emoji: '\u{1F441}\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 0
  },

  // ===== ZONE 4: IRONHOLD PEAKS (Levels 30-45) =====

  ironhold_elemental: {
    id: 'ironhold_elemental',
    name: 'Rock Elemental',
    description: 'Living stone animated by ancient dwarven magic. Guards the old mining tunnels.',
    zone: 'ironhold',
    type: 'armored',
    isBoss: false,
    levelMin: 30,
    levelMax: 36,
    baseHealth: 450,
    healthPerLevel: 40,
    armorValue: 15,
    goldMin: 40,
    goldMax: 75,
    goldPerLevel: 6,
    xpMin: 90,
    xpMax: 120,
    xpPerLevel: 10,
    lootTable: [
      { itemId: 'weapon_ironhold_common_01', chance: 0.08 }
    ],
    emoji: '\u{1F5FF}',
    deathEmoji: '\u{1F48E}',
    spawnWeight: 30
  },

  ironhold_bat: {
    id: 'ironhold_bat',
    name: 'Cave Bat Swarm',
    description: 'Hundreds of small bats moving as one hungry cloud.',
    zone: 'ironhold',
    type: 'swift',
    isBoss: false,
    levelMin: 32,
    levelMax: 38,
    baseHealth: 400,
    healthPerLevel: 35,
    escapeTimer: 6000,
    escapeDamage: 0.10,
    goldMin: 45,
    goldMax: 85,
    goldPerLevel: 7,
    xpMin: 100,
    xpMax: 135,
    xpPerLevel: 11,
    lootTable: [
      { itemId: 'weapon_ironhold_common_02', chance: 0.07 },
      { itemId: 'accessory_ironhold_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F987}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  ironhold_kobold: {
    id: 'ironhold_kobold',
    name: 'Kobold Miner',
    description: 'Small but vicious creatures who claimed the abandoned mines.',
    zone: 'ironhold',
    type: 'aggressive',
    isBoss: false,
    levelMin: 35,
    levelMax: 42,
    baseHealth: 520,
    healthPerLevel: 45,
    mechanics: {
      attackCycle: 5200,
      warningDuration: 500,
      attackDuration: 700,
      damagePercent: 0.08
    },
    goldMin: 55,
    goldMax: 100,
    goldPerLevel: 8,
    xpMin: 115,
    xpMax: 155,
    xpPerLevel: 12,
    lootTable: [
      { itemId: 'weapon_ironhold_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_ironhold_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u26CF\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  ironhold_golem: {
    id: 'ironhold_golem',
    name: 'Crystal Golem',
    description: 'A construct of pure crystal, refracting light into deadly beams.',
    zone: 'ironhold',
    type: 'shielded',
    isBoss: false,
    levelMin: 38,
    levelMax: 45,
    baseHealth: 700,
    healthPerLevel: 55,
    shieldPercent: 0.30,
    shieldDamageReduction: 0.50,
    goldMin: 70,
    goldMax: 130,
    goldPerLevel: 10,
    xpMin: 140,
    xpMax: 190,
    xpPerLevel: 14,
    lootTable: [
      { itemId: 'weapon_ironhold_uncommon_01', chance: 0.06 },
      { itemId: 'weapon_ironhold_rare_01', chance: 0.01 }
    ],
    emoji: '\u{1F48E}',
    deathEmoji: '\u2728',
    spawnWeight: 20
  },

  ironhold_spider: {
    id: 'ironhold_spider',
    name: 'Crystal Spider',
    description: 'A spider made of living crystal. Skitters across cave walls at blinding speed.',
    zone: 'ironhold',
    type: 'swift',
    isBoss: false,
    levelMin: 30,
    levelMax: 36,
    baseHealth: 420,
    healthPerLevel: 38,
    escapeTimer: 5500,
    escapeDamage: 0.10,
    goldMin: 45,
    goldMax: 80,
    goldPerLevel: 7,
    xpMin: 95,
    xpMax: 128,
    xpPerLevel: 11,
    lootTable: [
      { itemId: 'weapon_ironhold_common_01', chance: 0.07 },
      { itemId: 'weapon_ironhold_common_02', chance: 0.05 }
    ],
    emoji: '\u{1F577}\uFE0F',
    deathEmoji: '\u2728',
    spawnWeight: 25
  },

  ironhold_sentinel: {
    id: 'ironhold_sentinel',
    name: 'Dwarven Sentinel',
    description: 'An ancient construct still patrolling long-abandoned halls. Armored and aggressive.',
    zone: 'ironhold',
    type: 'armored+aggressive',
    isBoss: false,
    levelMin: 33,
    levelMax: 40,
    baseHealth: 600,
    healthPerLevel: 50,
    armorValue: 18,
    mechanics: {
      attackCycle: 5400,
      warningDuration: 550,
      attackDuration: 750,
      damagePercent: 0.08
    },
    goldMin: 55,
    goldMax: 100,
    goldPerLevel: 8,
    xpMin: 110,
    xpMax: 148,
    xpPerLevel: 12,
    lootTable: [
      { itemId: 'weapon_ironhold_uncommon_01', chance: 0.05 },
      { itemId: 'armor_ironhold_uncommon_01', chance: 0.03 },
      { itemId: 'weapon_ironhold_epic_01', chance: 0.004 }
    ],
    emoji: '\u{1F916}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 20
  },

  ironhold_worm: {
    id: 'ironhold_worm',
    name: 'Tunneler Worm',
    description: 'A massive worm that burrows through solid rock. Its wounds close with mineral deposits.',
    zone: 'ironhold',
    type: 'regenerating',
    isBoss: false,
    levelMin: 34,
    levelMax: 41,
    baseHealth: 550,
    healthPerLevel: 48,
    regenRate: 0.035,
    goldMin: 52,
    goldMax: 95,
    goldPerLevel: 8,
    xpMin: 105,
    xpMax: 142,
    xpPerLevel: 12,
    lootTable: [
      { itemId: 'weapon_ironhold_common_02', chance: 0.06 },
      { itemId: 'accessory_ironhold_common_01', chance: 0.04 }
    ],
    emoji: '\u{1FAB1}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 24
  },

  ironhold_drake: {
    id: 'ironhold_drake',
    name: 'Ore Drake',
    description: 'A small dragon that feeds on mineral deposits. Breathes superheated slag at its prey.',
    zone: 'ironhold',
    type: 'aggressive',
    isBoss: false,
    levelMin: 36,
    levelMax: 43,
    baseHealth: 580,
    healthPerLevel: 50,
    mechanics: {
      attackCycle: 4800,
      warningDuration: 450,
      attackDuration: 650,
      damagePercent: 0.09
    },
    goldMin: 60,
    goldMax: 110,
    goldPerLevel: 9,
    xpMin: 120,
    xpMax: 160,
    xpPerLevel: 13,
    lootTable: [
      { itemId: 'weapon_ironhold_uncommon_01', chance: 0.06 },
      { itemId: 'weapon_ironhold_rare_01', chance: 0.008 }
    ],
    emoji: '\u{1F409}',
    deathEmoji: '\u{1F525}',
    spawnWeight: 22
  },

  ironhold_guardian: {
    id: 'ironhold_guardian',
    name: 'Stone Guardian',
    description: 'A massive construct with a crystalline shield. Built to withstand siege weapons.',
    zone: 'ironhold',
    type: 'shielded',
    isBoss: false,
    levelMin: 40,
    levelMax: 45,
    baseHealth: 750,
    healthPerLevel: 60,
    shieldPercent: 0.35,
    shieldDamageReduction: 0.55,
    goldMin: 75,
    goldMax: 140,
    goldPerLevel: 10,
    xpMin: 145,
    xpMax: 195,
    xpPerLevel: 14,
    lootTable: [
      { itemId: 'weapon_ironhold_rare_01', chance: 0.01 },
      { itemId: 'armor_ironhold_epic_01', chance: 0.004 }
    ],
    emoji: '\u{1F6E1}\uFE0F',
    deathEmoji: '\u{1F48E}',
    spawnWeight: 18
  },

  boss_grimstone: {
    id: 'boss_grimstone',
    name: 'Grimstone the Eternal',
    description: 'The last guardian of Ironhold, a golem of immense power created by the dwarven high king.',
    zone: 'ironhold',
    type: 'aggressive+armored',
    isBoss: true,
    levelMin: 45,
    levelMax: 45,
    baseHealth: 8000,
    healthPerLevel: 0,
    goldMin: 1500,
    goldMax: 2200,
    goldPerLevel: 0,
    xpMin: 3000,
    xpMax: 3800,
    xpPerLevel: 0,
    mechanics: {
      attackCycle: 4800,
      warningDuration: 800,
      attackDuration: 1200,
      damagePercent: 0.12
    },
    armorValue: 25,
    lootTable: [
      { itemId: 'weapon_ironhold_rare_01', chance: 1.0 },
      { itemId: 'accessory_ironhold_rare_01', chance: 0.25 }
    ],
    emoji: '\u{1F3D4}\uFE0F',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 0
  },

  // ===== ZONE 5: EMBERFELL WASTES (Levels 45-60) =====

  emberfell_slime: {
    id: 'emberfell_slime',
    name: 'Magma Slime',
    description: 'A blob of living lava that oozes across the volcanic rock.',
    zone: 'emberfell',
    type: 'regenerating',
    isBoss: false,
    levelMin: 45,
    levelMax: 51,
    baseHealth: 800,
    healthPerLevel: 55,
    regenRate: 0.04,
    goldMin: 90,
    goldMax: 170,
    goldPerLevel: 10,
    xpMin: 180,
    xpMax: 240,
    xpPerLevel: 15,
    lootTable: [
      { itemId: 'weapon_emberfell_common_01', chance: 0.08 }
    ],
    emoji: '\u{1F534}',
    deathEmoji: '\u{1F4A7}',
    spawnWeight: 30
  },

  emberfell_imp: {
    id: 'emberfell_imp',
    name: 'Fire Imp',
    description: 'A cackling demon of flame, delighting in setting things ablaze.',
    zone: 'emberfell',
    type: 'aggressive',
    isBoss: false,
    levelMin: 47,
    levelMax: 54,
    baseHealth: 750,
    healthPerLevel: 50,
    mechanics: {
      attackCycle: 4500,
      warningDuration: 400,
      attackDuration: 600,
      damagePercent: 0.08
    },
    goldMin: 100,
    goldMax: 190,
    goldPerLevel: 11,
    xpMin: 200,
    xpMax: 270,
    xpPerLevel: 16,
    lootTable: [
      { itemId: 'weapon_emberfell_common_02', chance: 0.07 },
      { itemId: 'accessory_emberfell_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F608}',
    deathEmoji: '\u{1F525}',
    spawnWeight: 25
  },

  emberfell_wraith: {
    id: 'emberfell_wraith',
    name: 'Ash Wraith',
    description: 'The spirit of one who died in volcanic fire. Now it spreads that suffering to others.',
    zone: 'emberfell',
    type: 'shielded',
    isBoss: false,
    levelMin: 50,
    levelMax: 57,
    baseHealth: 950,
    healthPerLevel: 60,
    shieldPercent: 0.35,
    shieldDamageReduction: 0.50,
    goldMin: 120,
    goldMax: 220,
    goldPerLevel: 13,
    xpMin: 230,
    xpMax: 310,
    xpPerLevel: 18,
    lootTable: [
      { itemId: 'weapon_emberfell_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_emberfell_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F464}',
    deathEmoji: '\u{1F4A8}',
    spawnWeight: 25
  },

  emberfell_giant: {
    id: 'emberfell_giant',
    name: 'Molten Giant',
    description: 'A towering humanoid of living rock and fire. Each step leaves burning footprints.',
    zone: 'emberfell',
    type: 'armored',
    isBoss: false,
    levelMin: 54,
    levelMax: 60,
    baseHealth: 1300,
    healthPerLevel: 80,
    armorValue: 30,
    goldMin: 150,
    goldMax: 280,
    goldPerLevel: 15,
    xpMin: 280,
    xpMax: 380,
    xpPerLevel: 20,
    lootTable: [
      { itemId: 'weapon_emberfell_uncommon_01', chance: 0.06 },
      { itemId: 'weapon_emberfell_rare_01', chance: 0.01 }
    ],
    emoji: '\u{1F525}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 20
  },

  emberfell_hound: {
    id: 'emberfell_hound',
    name: 'Hellhound',
    description: 'A demonic dog wreathed in flame. Incredibly fast and will flee if wounded.',
    zone: 'emberfell',
    type: 'swift',
    isBoss: false,
    levelMin: 45,
    levelMax: 52,
    baseHealth: 780,
    healthPerLevel: 52,
    escapeTimer: 5000,
    escapeDamage: 0.12,
    goldMin: 95,
    goldMax: 180,
    goldPerLevel: 11,
    xpMin: 190,
    xpMax: 255,
    xpPerLevel: 16,
    lootTable: [
      { itemId: 'weapon_emberfell_common_01', chance: 0.07 },
      { itemId: 'weapon_emberfell_common_02', chance: 0.05 }
    ],
    emoji: '\u{1F9AE}',
    deathEmoji: '\u{1F525}',
    spawnWeight: 25
  },

  emberfell_cultist: {
    id: 'emberfell_cultist',
    name: 'Flame Cultist',
    description: 'A fanatical worshipper of fire who attacks relentlessly while regenerating through dark rituals.',
    zone: 'emberfell',
    type: 'aggressive+regenerating',
    isBoss: false,
    levelMin: 48,
    levelMax: 55,
    baseHealth: 900,
    healthPerLevel: 58,
    mechanics: {
      attackCycle: 4600,
      warningDuration: 450,
      attackDuration: 650,
      damagePercent: 0.08
    },
    regenRate: 0.03,
    goldMin: 110,
    goldMax: 200,
    goldPerLevel: 12,
    xpMin: 210,
    xpMax: 285,
    xpPerLevel: 17,
    lootTable: [
      { itemId: 'weapon_emberfell_uncommon_01', chance: 0.04 },
      { itemId: 'weapon_emberfell_epic_01', chance: 0.004 }
    ],
    emoji: '\u{1F9D9}',
    deathEmoji: '\u{1F525}',
    spawnWeight: 20
  },

  emberfell_golem: {
    id: 'emberfell_golem',
    name: 'Obsidian Golem',
    description: 'A construct of volcanic glass with a shield of molten rock. Doubly protected.',
    zone: 'emberfell',
    type: 'armored+shielded',
    isBoss: false,
    levelMin: 50,
    levelMax: 57,
    baseHealth: 1100,
    healthPerLevel: 70,
    armorValue: 25,
    shieldPercent: 0.30,
    shieldDamageReduction: 0.45,
    goldMin: 130,
    goldMax: 240,
    goldPerLevel: 13,
    xpMin: 240,
    xpMax: 325,
    xpPerLevel: 18,
    lootTable: [
      { itemId: 'weapon_emberfell_uncommon_01', chance: 0.05 },
      { itemId: 'armor_emberfell_epic_01', chance: 0.004 }
    ],
    emoji: '\u{1F5FF}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 18
  },

  emberfell_salamander: {
    id: 'emberfell_salamander',
    name: 'Fire Salamander',
    description: 'A large reptile that thrives in lava flows. Its body regenerates from volcanic heat.',
    zone: 'emberfell',
    type: 'regenerating',
    isBoss: false,
    levelMin: 52,
    levelMax: 58,
    baseHealth: 1000,
    healthPerLevel: 65,
    regenRate: 0.045,
    goldMin: 135,
    goldMax: 250,
    goldPerLevel: 14,
    xpMin: 250,
    xpMax: 340,
    xpPerLevel: 19,
    lootTable: [
      { itemId: 'weapon_emberfell_uncommon_01', chance: 0.06 },
      { itemId: 'accessory_emberfell_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F98E}',
    deathEmoji: '\u{1F525}',
    spawnWeight: 22
  },

  emberfell_drake: {
    id: 'emberfell_drake',
    name: 'Cinder Drake',
    description: 'A young dragon that breathes streams of fire. Its attack cycles are dangerously fast.',
    zone: 'emberfell',
    type: 'aggressive',
    isBoss: false,
    levelMin: 55,
    levelMax: 60,
    baseHealth: 1200,
    healthPerLevel: 75,
    mechanics: {
      attackCycle: 4200,
      warningDuration: 400,
      attackDuration: 600,
      damagePercent: 0.10
    },
    goldMin: 150,
    goldMax: 280,
    goldPerLevel: 15,
    xpMin: 280,
    xpMax: 380,
    xpPerLevel: 20,
    lootTable: [
      { itemId: 'weapon_emberfell_rare_01', chance: 0.01 },
      { itemId: 'weapon_emberfell_epic_01', chance: 0.006 }
    ],
    emoji: '\u{1F409}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 18
  },

  boss_pyrax: {
    id: 'boss_pyrax',
    name: 'Pyrax the Flamelord',
    description: 'A fire elemental of immense power who claims the Emberfell as his domain.',
    zone: 'emberfell',
    type: 'aggressive+shielded',
    isBoss: true,
    levelMin: 60,
    levelMax: 60,
    baseHealth: 20000,
    healthPerLevel: 0,
    goldMin: 3500,
    goldMax: 5000,
    goldPerLevel: 0,
    xpMin: 7500,
    xpMax: 9500,
    xpPerLevel: 0,
    mechanics: {
      attackCycle: 4100,
      warningDuration: 600,
      attackDuration: 1000,
      damagePercent: 0.12
    },
    shieldPercent: 0.25,
    shieldDamageReduction: 0.40,
    lootTable: [
      { itemId: 'weapon_emberfell_rare_01', chance: 1.0 },
      { itemId: 'accessory_emberfell_rare_01', chance: 0.25 }
    ],
    emoji: '\u{1F31F}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 0
  },

  // ===== ZONE 6: FROSTPEAK SUMMIT (Levels 60-75) =====

  frostpeak_sprite: {
    id: 'frostpeak_sprite',
    name: 'Frost Sprite',
    description: 'A cold-hearted fae creature made of living ice. Beautiful and deadly.',
    zone: 'frostpeak',
    type: 'swift',
    isBoss: false,
    levelMin: 60,
    levelMax: 66,
    baseHealth: 1400,
    healthPerLevel: 80,
    escapeTimer: 5000,
    escapeDamage: 0.12,
    goldMin: 200,
    goldMax: 380,
    goldPerLevel: 18,
    xpMin: 350,
    xpMax: 470,
    xpPerLevel: 22,
    lootTable: [
      { itemId: 'weapon_frostpeak_common_01', chance: 0.08 }
    ],
    emoji: '\u2744\uFE0F',
    deathEmoji: '\u2728',
    spawnWeight: 30
  },

  frostpeak_prowler: {
    id: 'frostpeak_prowler',
    name: 'Snow Prowler',
    description: 'A massive white-furred predator, nearly invisible against the snow.',
    zone: 'frostpeak',
    type: 'aggressive',
    isBoss: false,
    levelMin: 62,
    levelMax: 68,
    baseHealth: 1600,
    healthPerLevel: 90,
    mechanics: {
      attackCycle: 4200,
      warningDuration: 400,
      attackDuration: 800,
      damagePercent: 0.10
    },
    goldMin: 230,
    goldMax: 430,
    goldPerLevel: 20,
    xpMin: 400,
    xpMax: 540,
    xpPerLevel: 25,
    lootTable: [
      { itemId: 'weapon_frostpeak_common_02', chance: 0.07 },
      { itemId: 'accessory_frostpeak_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F43B}\u200D\u2744\uFE0F',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  frostpeak_wraith: {
    id: 'frostpeak_wraith',
    name: 'Ice Wraith',
    description: 'The frozen soul of a climber who never made it down.',
    zone: 'frostpeak',
    type: 'regenerating',
    isBoss: false,
    levelMin: 65,
    levelMax: 72,
    baseHealth: 1900,
    healthPerLevel: 100,
    regenRate: 0.05,
    goldMin: 270,
    goldMax: 500,
    goldPerLevel: 22,
    xpMin: 470,
    xpMax: 630,
    xpPerLevel: 28,
    lootTable: [
      { itemId: 'weapon_frostpeak_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_frostpeak_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F47B}',
    deathEmoji: '\u2744\uFE0F',
    spawnWeight: 25
  },

  frostpeak_giant: {
    id: 'frostpeak_giant',
    name: 'Frozen Giant',
    description: 'An ancient titan encased in eternal ice. Each blow carries the weight of glaciers.',
    zone: 'frostpeak',
    type: 'armored',
    isBoss: false,
    levelMin: 68,
    levelMax: 75,
    baseHealth: 2500,
    healthPerLevel: 120,
    armorValue: 45,
    goldMin: 320,
    goldMax: 600,
    goldPerLevel: 25,
    xpMin: 560,
    xpMax: 750,
    xpPerLevel: 32,
    lootTable: [
      { itemId: 'weapon_frostpeak_uncommon_01', chance: 0.06 },
      { itemId: 'weapon_frostpeak_rare_01', chance: 0.01 }
    ],
    emoji: '\u{1F9CA}',
    deathEmoji: '\u{1F48E}',
    spawnWeight: 20
  },

  frostpeak_yeti: {
    id: 'frostpeak_yeti',
    name: 'Frost Yeti',
    description: 'A towering beast of ice and fur. Heavily armored by frozen hide and attacks with crushing force.',
    zone: 'frostpeak',
    type: 'armored+aggressive',
    isBoss: false,
    levelMin: 60,
    levelMax: 67,
    baseHealth: 1800,
    healthPerLevel: 95,
    armorValue: 35,
    mechanics: {
      attackCycle: 4400,
      warningDuration: 450,
      attackDuration: 800,
      damagePercent: 0.10
    },
    goldMin: 220,
    goldMax: 410,
    goldPerLevel: 20,
    xpMin: 380,
    xpMax: 510,
    xpPerLevel: 24,
    lootTable: [
      { itemId: 'weapon_frostpeak_common_01', chance: 0.07 },
      { itemId: 'armor_frostpeak_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F9CD}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 22
  },

  frostpeak_elemental: {
    id: 'frostpeak_elemental',
    name: 'Ice Elemental',
    description: 'A being of pure frozen energy. Surrounded by a shield of crystallized frost.',
    zone: 'frostpeak',
    type: 'shielded',
    isBoss: false,
    levelMin: 62,
    levelMax: 69,
    baseHealth: 1700,
    healthPerLevel: 90,
    shieldPercent: 0.38,
    shieldDamageReduction: 0.55,
    goldMin: 240,
    goldMax: 450,
    goldPerLevel: 21,
    xpMin: 410,
    xpMax: 555,
    xpPerLevel: 26,
    lootTable: [
      { itemId: 'weapon_frostpeak_common_02', chance: 0.06 },
      { itemId: 'accessory_frostpeak_common_01', chance: 0.04 }
    ],
    emoji: '\u2744\uFE0F',
    deathEmoji: '\u2728',
    spawnWeight: 24
  },

  frostpeak_wolf: {
    id: 'frostpeak_wolf',
    name: 'Dire Wolf',
    description: 'An enormous wolf adapted to the frozen peaks. Hunts with terrifying speed.',
    zone: 'frostpeak',
    type: 'swift',
    isBoss: false,
    levelMin: 63,
    levelMax: 70,
    baseHealth: 1500,
    healthPerLevel: 85,
    escapeTimer: 4500,
    escapeDamage: 0.12,
    goldMin: 250,
    goldMax: 470,
    goldPerLevel: 22,
    xpMin: 430,
    xpMax: 580,
    xpPerLevel: 27,
    lootTable: [
      { itemId: 'weapon_frostpeak_uncommon_01', chance: 0.04 },
      { itemId: 'accessory_frostpeak_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u{1F43A}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 24
  },

  frostpeak_banshee: {
    id: 'frostpeak_banshee',
    name: 'Frost Banshee',
    description: 'A spectral woman who wails with the blizzard wind. Regenerates and shields herself with ice.',
    zone: 'frostpeak',
    type: 'regenerating+shielded',
    isBoss: false,
    levelMin: 66,
    levelMax: 73,
    baseHealth: 2100,
    healthPerLevel: 105,
    regenRate: 0.04,
    shieldPercent: 0.30,
    shieldDamageReduction: 0.45,
    goldMin: 290,
    goldMax: 540,
    goldPerLevel: 24,
    xpMin: 490,
    xpMax: 660,
    xpPerLevel: 30,
    lootTable: [
      { itemId: 'weapon_frostpeak_uncommon_01', chance: 0.05 },
      { itemId: 'weapon_frostpeak_rare_01', chance: 0.008 }
    ],
    emoji: '\u{1F47B}',
    deathEmoji: '\u2744\uFE0F',
    spawnWeight: 18
  },

  frostpeak_wyrm: {
    id: 'frostpeak_wyrm',
    name: 'Ice Wyrm',
    description: 'A massive serpentine dragon of ice. Its breath freezes everything in an instant.',
    zone: 'frostpeak',
    type: 'aggressive',
    isBoss: false,
    levelMin: 70,
    levelMax: 75,
    baseHealth: 2600,
    healthPerLevel: 125,
    mechanics: {
      attackCycle: 3800,
      warningDuration: 400,
      attackDuration: 800,
      damagePercent: 0.11
    },
    goldMin: 330,
    goldMax: 620,
    goldPerLevel: 26,
    xpMin: 570,
    xpMax: 760,
    xpPerLevel: 33,
    lootTable: [
      { itemId: 'weapon_frostpeak_rare_01', chance: 0.01 },
      { itemId: 'weapon_frostpeak_legendary_01', chance: 0.003 }
    ],
    emoji: '\u{1F432}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 18
  },

  boss_glacielle: {
    id: 'boss_glacielle',
    name: 'Queen Glacielle',
    description: 'The immortal queen of winter, who has ruled Frostpeak since before recorded history.',
    zone: 'frostpeak',
    type: 'aggressive+regenerating',
    isBoss: true,
    levelMin: 75,
    levelMax: 75,
    baseHealth: 50000,
    healthPerLevel: 0,
    goldMin: 8000,
    goldMax: 12000,
    goldPerLevel: 0,
    xpMin: 18000,
    xpMax: 23000,
    xpPerLevel: 0,
    mechanics: {
      attackCycle: 3600,
      warningDuration: 500,
      attackDuration: 900,
      damagePercent: 0.12
    },
    regenRate: 0.015,
    lootTable: [
      { itemId: 'weapon_frostpeak_rare_01', chance: 1.0 },
      { itemId: 'accessory_frostpeak_rare_01', chance: 0.25 }
    ],
    emoji: '\u{1F451}',
    deathEmoji: '\u2744\uFE0F',
    spawnWeight: 0
  },

  // ===== ZONE 7: THE VOID RIFT (Levels 75-100) =====

  voidrift_walker: {
    id: 'voidrift_walker',
    name: 'Void Walker',
    description: 'A humanoid shape made of pure darkness. Phases in and out of reality.',
    zone: 'voidrift',
    type: 'shielded',
    isBoss: false,
    levelMin: 75,
    levelMax: 84,
    baseHealth: 3000,
    healthPerLevel: 150,
    shieldPercent: 0.40,
    shieldDamageReduction: 0.60,
    goldMin: 450,
    goldMax: 850,
    goldPerLevel: 35,
    xpMin: 700,
    xpMax: 950,
    xpPerLevel: 40,
    lootTable: [
      { itemId: 'weapon_voidrift_common_01', chance: 0.08 }
    ],
    emoji: '\u{1F573}\uFE0F',
    deathEmoji: '\u2728',
    spawnWeight: 30
  },

  voidrift_imp: {
    id: 'voidrift_imp',
    name: 'Chaos Imp',
    description: 'A small demon of pure chaos. Its form constantly shifts.',
    zone: 'voidrift',
    type: 'swift',
    isBoss: false,
    levelMin: 78,
    levelMax: 88,
    baseHealth: 2800,
    healthPerLevel: 140,
    escapeTimer: 4000,
    escapeDamage: 0.15,
    goldMin: 500,
    goldMax: 950,
    goldPerLevel: 38,
    xpMin: 780,
    xpMax: 1050,
    xpPerLevel: 45,
    lootTable: [
      { itemId: 'weapon_voidrift_common_02', chance: 0.07 },
      { itemId: 'accessory_voidrift_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F47F}',
    deathEmoji: '\u{1F4AB}',
    spawnWeight: 25
  },

  voidrift_bender: {
    id: 'voidrift_bender',
    name: 'Reality Bender',
    description: 'A creature that doesn\'t obey the laws of physics. Space warps around it.',
    zone: 'voidrift',
    type: 'aggressive',
    isBoss: false,
    levelMin: 82,
    levelMax: 93,
    baseHealth: 4000,
    healthPerLevel: 180,
    mechanics: {
      attackCycle: 3000,
      warningDuration: 300,
      attackDuration: 700,
      damagePercent: 0.10
    },
    goldMin: 600,
    goldMax: 1100,
    goldPerLevel: 42,
    xpMin: 900,
    xpMax: 1200,
    xpPerLevel: 50,
    lootTable: [
      { itemId: 'weapon_voidrift_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_voidrift_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F300}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 25
  },

  voidrift_horror: {
    id: 'voidrift_horror',
    name: 'Eldritch Horror',
    description: 'Something that should not exist. Looking at it too long causes madness.',
    zone: 'voidrift',
    type: 'armored+regenerating',
    isBoss: false,
    levelMin: 88,
    levelMax: 100,
    baseHealth: 5500,
    healthPerLevel: 220,
    armorValue: 50,
    regenRate: 0.03,
    goldMin: 750,
    goldMax: 1400,
    goldPerLevel: 50,
    xpMin: 1100,
    xpMax: 1500,
    xpPerLevel: 60,
    lootTable: [
      { itemId: 'weapon_voidrift_uncommon_01', chance: 0.06 },
      { itemId: 'weapon_voidrift_rare_01', chance: 0.015 },
      { itemId: 'weapon_voidrift_epic_01', chance: 0.003 }
    ],
    emoji: '\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F',
    deathEmoji: '\u{1F573}\uFE0F',
    spawnWeight: 20
  },

  voidrift_stalker: {
    id: 'voidrift_stalker',
    name: 'Phase Stalker',
    description: 'A shadowy assassin that phases between dimensions. Both escapes and attacks unpredictably.',
    zone: 'voidrift',
    type: 'swift+aggressive',
    isBoss: false,
    levelMin: 75,
    levelMax: 85,
    baseHealth: 3200,
    healthPerLevel: 155,
    escapeTimer: 4500,
    escapeDamage: 0.12,
    mechanics: {
      attackCycle: 3500,
      warningDuration: 350,
      attackDuration: 650,
      damagePercent: 0.10
    },
    goldMin: 480,
    goldMax: 900,
    goldPerLevel: 36,
    xpMin: 740,
    xpMax: 1000,
    xpPerLevel: 42,
    lootTable: [
      { itemId: 'weapon_voidrift_common_01', chance: 0.07 },
      { itemId: 'weapon_voidrift_common_02', chance: 0.05 }
    ],
    emoji: '\u{1F977}',
    deathEmoji: '\u{1F4A8}',
    spawnWeight: 22
  },

  voidrift_golem: {
    id: 'voidrift_golem',
    name: 'Void Colossus',
    description: 'A titanic construct of void stone with a shield of pure darkness. Doubly protected.',
    zone: 'voidrift',
    type: 'armored+shielded',
    isBoss: false,
    levelMin: 78,
    levelMax: 89,
    baseHealth: 4500,
    healthPerLevel: 190,
    armorValue: 45,
    shieldPercent: 0.35,
    shieldDamageReduction: 0.55,
    goldMin: 550,
    goldMax: 1000,
    goldPerLevel: 40,
    xpMin: 820,
    xpMax: 1100,
    xpPerLevel: 48,
    lootTable: [
      { itemId: 'weapon_voidrift_uncommon_01', chance: 0.04 },
      { itemId: 'armor_voidrift_rare_01', chance: 0.008 }
    ],
    emoji: '\u{1F3DB}\uFE0F',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 18
  },

  voidrift_leech: {
    id: 'voidrift_leech',
    name: 'Entropy Leech',
    description: 'A creature that feeds on life force. Regenerates constantly and flees when threatened.',
    zone: 'voidrift',
    type: 'regenerating+swift',
    isBoss: false,
    levelMin: 80,
    levelMax: 91,
    baseHealth: 3500,
    healthPerLevel: 165,
    regenRate: 0.04,
    escapeTimer: 4200,
    escapeDamage: 0.14,
    goldMin: 580,
    goldMax: 1050,
    goldPerLevel: 42,
    xpMin: 860,
    xpMax: 1150,
    xpPerLevel: 50,
    lootTable: [
      { itemId: 'weapon_voidrift_uncommon_01', chance: 0.05 },
      { itemId: 'accessory_voidrift_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F419}',
    deathEmoji: '\u{1F4A8}',
    spawnWeight: 20
  },

  voidrift_wraith: {
    id: 'voidrift_wraith',
    name: 'Dimensional Wraith',
    description: 'A being from beyond reality that attacks and heals simultaneously. A terrifying foe.',
    zone: 'voidrift',
    type: 'aggressive+regenerating',
    isBoss: false,
    levelMin: 85,
    levelMax: 96,
    baseHealth: 4800,
    healthPerLevel: 200,
    mechanics: {
      attackCycle: 3200,
      warningDuration: 350,
      attackDuration: 700,
      damagePercent: 0.10
    },
    regenRate: 0.035,
    goldMin: 650,
    goldMax: 1200,
    goldPerLevel: 45,
    xpMin: 950,
    xpMax: 1280,
    xpPerLevel: 55,
    lootTable: [
      { itemId: 'weapon_voidrift_rare_01', chance: 0.012 },
      { itemId: 'weapon_voidrift_epic_01', chance: 0.004 }
    ],
    emoji: '\u{1F47D}',
    deathEmoji: '\u{1F573}\uFE0F',
    spawnWeight: 18
  },

  voidrift_titan: {
    id: 'voidrift_titan',
    name: 'Void Titan',
    description: 'The ultimate defender of the Void. Armored, shielded, and regenerating — a triple threat.',
    zone: 'voidrift',
    type: 'armored+shielded+regenerating',
    isBoss: false,
    levelMin: 92,
    levelMax: 100,
    baseHealth: 6000,
    healthPerLevel: 250,
    armorValue: 55,
    shieldPercent: 0.30,
    shieldDamageReduction: 0.50,
    regenRate: 0.025,
    goldMin: 800,
    goldMax: 1500,
    goldPerLevel: 55,
    xpMin: 1150,
    xpMax: 1550,
    xpPerLevel: 65,
    lootTable: [
      { itemId: 'weapon_voidrift_epic_01', chance: 0.006 },
      { itemId: 'weapon_voidrift_legendary_01', chance: 0.001 },
      { itemId: 'accessory_voidrift_legendary_01', chance: 0.001 }
    ],
    emoji: '\u{1F5FF}',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 15
  },

  boss_xaltheron: {
    id: 'boss_xaltheron',
    name: "Xal'theron, the Void King",
    description: 'The source of the corruption, a god-like entity from beyond reality. This is the final battle.',
    zone: 'voidrift',
    type: 'aggressive+shielded+regenerating',
    isBoss: true,
    levelMin: 100,
    levelMax: 100,
    baseHealth: 150000,
    healthPerLevel: 0,
    goldMin: 25000,
    goldMax: 40000,
    goldPerLevel: 0,
    xpMin: 50000,
    xpMax: 65000,
    xpPerLevel: 0,
    mechanics: {
      attackCycle: 3000,
      warningDuration: 400,
      attackDuration: 800,
      damagePercent: 0.15
    },
    shieldPercent: 0.20,
    shieldDamageReduction: 0.50,
    regenRate: 0.01,
    lootTable: [
      { itemId: 'weapon_voidrift_legendary_01', chance: 1.0 },
      { itemId: 'accessory_voidrift_legendary_01', chance: 0.5 }
    ],
    emoji: '\u26AB',
    deathEmoji: '\u{1F4A5}',
    spawnWeight: 0
  }
};

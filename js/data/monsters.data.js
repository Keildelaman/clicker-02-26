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

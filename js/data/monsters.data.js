/**
 * monsters.data.js - Monster Definitions
 *
 * Static data for all monsters.
 * Whisperwood monsters: 1 normal, 1 swift, 1 armored, 1 regenerating, 1 shielded, 1 aggressive + boss.
 *
 * @see docs/data/monsters.data.md
 */

export const MONSTERS = {
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
      { itemId: 'weapon_whisperwood_common_01', chance: 0.10 },
      { itemId: 'accessory_whisperwood_common_01', chance: 0.05 }
    ],
    emoji: '\u{1F9DA}',
    deathEmoji: '\u2728',
    spawnWeight: 30
  },

  whisperwood_boar: {
    id: 'whisperwood_boar',
    name: 'Wild Boar',
    description: 'A territorial beast with sharp tusks. Its wounds close unnaturally fast.',
    zone: 'whisperwood',
    type: 'regenerating',
    isBoss: false,
    levelMin: 2,
    levelMax: 6,
    baseHealth: 35,
    healthPerLevel: 8,
    regenRate: 0.02,
    goldMin: 3,
    goldMax: 6,
    goldPerLevel: 1,
    xpMin: 10,
    xpMax: 15,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_01', chance: 0.10 },
      { itemId: 'weapon_whisperwood_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u{1F417}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  whisperwood_wolf: {
    id: 'whisperwood_wolf',
    name: 'Timber Wolf',
    description: 'A cunning predator of the forest. Quick to flee if not slain fast.',
    zone: 'whisperwood',
    type: 'swift',
    isBoss: false,
    levelMin: 4,
    levelMax: 8,
    baseHealth: 45,
    healthPerLevel: 10,
    escapeTimer: 8000,
    escapeDamage: 0.05,
    goldMin: 4,
    goldMax: 8,
    goldPerLevel: 2,
    xpMin: 12,
    xpMax: 18,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'weapon_whisperwood_common_02', chance: 0.10 },
      { itemId: 'accessory_whisperwood_uncommon_01', chance: 0.03 },
      { itemId: 'weapon_whisperwood_rare_01', chance: 0.005 }
    ],
    emoji: '\u{1F43A}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  whisperwood_treant: {
    id: 'whisperwood_treant',
    name: 'Grumpy Treant',
    description: 'An awakened tree spirit with bark like iron. Weak hits barely scratch it.',
    zone: 'whisperwood',
    type: 'armored',
    isBoss: false,
    levelMin: 6,
    levelMax: 10,
    baseHealth: 70,
    healthPerLevel: 15,
    armorValue: 3,
    goldMin: 5,
    goldMax: 10,
    goldPerLevel: 2,
    xpMin: 15,
    xpMax: 22,
    xpPerLevel: 4,
    lootTable: [
      { itemId: 'accessory_whisperwood_common_01', chance: 0.10 },
      { itemId: 'weapon_whisperwood_uncommon_01', chance: 0.03 }
    ],
    emoji: '\u{1F333}',
    deathEmoji: '\u{1FAB5}',
    spawnWeight: 20
  },

  whisperwood_wisp: {
    id: 'whisperwood_wisp',
    name: 'Glimmering Wisp',
    description: 'A shimmering ball of forest magic, cloaked in a protective barrier.',
    zone: 'whisperwood',
    type: 'shielded',
    isBoss: false,
    levelMin: 3,
    levelMax: 7,
    baseHealth: 30,
    healthPerLevel: 6,
    shieldPercent: 0.30,
    shieldDamageReduction: 0.50,
    goldMin: 4,
    goldMax: 7,
    goldPerLevel: 1,
    xpMin: 11,
    xpMax: 16,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'accessory_whisperwood_common_01', chance: 0.10 },
      { itemId: 'accessory_whisperwood_uncommon_01', chance: 0.04 }
    ],
    emoji: '\u{1F4AB}',
    deathEmoji: '\u2728',
    spawnWeight: 20
  },

  whisperwood_bear: {
    id: 'whisperwood_bear',
    name: 'Thornback Bear',
    description: 'A ferocious bear that swipes at anyone who gets too close. Watch for its attacks!',
    zone: 'whisperwood',
    type: 'aggressive',
    isBoss: false,
    levelMin: 5,
    levelMax: 9,
    baseHealth: 55,
    healthPerLevel: 12,
    mechanics: {
      attackCycle: 5000,
      warningDuration: 1000,
      attackDuration: 800,
      damagePercent: 0.08
    },
    goldMin: 5,
    goldMax: 9,
    goldPerLevel: 2,
    xpMin: 14,
    xpMax: 20,
    xpPerLevel: 3,
    lootTable: [
      { itemId: 'weapon_whisperwood_uncommon_01', chance: 0.08 },
      { itemId: 'weapon_whisperwood_rare_01', chance: 0.01 }
    ],
    emoji: '\u{1F43B}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 15
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
  }
};

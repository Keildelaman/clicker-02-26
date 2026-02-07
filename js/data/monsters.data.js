/**
 * monsters.data.js - Monster Definitions
 *
 * Static data for all monsters.
 * Phase 0+1: Whisperwood monsters only (4 normal + boss definition).
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
    lootTable: [],
    emoji: '\u{1F9DA}',
    deathEmoji: '\u2728',
    spawnWeight: 30
  },

  whisperwood_boar: {
    id: 'whisperwood_boar',
    name: 'Wild Boar',
    description: 'A territorial beast with sharp tusks.',
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
    lootTable: [],
    emoji: '\u{1F417}',
    deathEmoji: '\u{1F480}',
    spawnWeight: 25
  },

  whisperwood_wolf: {
    id: 'whisperwood_wolf',
    name: 'Timber Wolf',
    description: 'A cunning predator of the forest.',
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
    lootTable: [],
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
    lootTable: [],
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
    lootTable: [],
    emoji: '\u{1F332}',
    deathEmoji: '\u{1FAB5}',
    spawnWeight: 0
  }
};

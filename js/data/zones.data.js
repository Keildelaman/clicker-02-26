/**
 * zones.data.js - Zone Definitions
 *
 * Static data for all 7 game zones.
 * Phase 6: All zones defined with themes, monsters, bosses, and shop items.
 *
 * @see docs/data/zones.data.md
 */

export const ZONES = {
  whisperwood: {
    id: 'whisperwood',
    name: 'Whisperwood Glen',
    description: 'A peaceful forest where new adventurers take their first steps.',
    order: 1,
    levelMin: 1,
    levelMax: 10,
    bossKillReq: 20,
    unlockCondition: { type: 'default' },
    monsters: ['whisperwood_sprite', 'whisperwood_boar', 'whisperwood_wolf', 'whisperwood_treant', 'whisperwood_rabbit', 'whisperwood_mushroom', 'whisperwood_spider', 'whisperwood_bear', 'whisperwood_owl'],
    bossId: 'boss_mossback',
    theme: {
      primary: '#2d5a27',
      secondary: '#1a3518',
      accent: '#90EE90'
    },
    emoji: '\u{1F332}',
    backgroundCSS: 'linear-gradient(180deg, #2d5a27 0%, #1a3518 100%)',
    shopRefreshBase: 75,
    shopItems: [
      'weapon_whisperwood_common_01',
      'weapon_whisperwood_common_02',
      'weapon_whisperwood_uncommon_01',
      'accessory_whisperwood_common_01',
      'accessory_whisperwood_uncommon_01',
      'armor_whisperwood_common_01',
      'armor_whisperwood_uncommon_01'
    ]
  },

  dustwind: {
    id: 'dustwind',
    name: 'Dustwind Plains',
    description: 'Rolling golden plains stretching to the horizon, plagued by roaming bandits and territorial beasts.',
    order: 2,
    levelMin: 10,
    levelMax: 20,
    bossKillReq: 40,
    unlockCondition: { type: 'boss', bossId: 'boss_mossback' },
    monsters: ['dustwind_dog', 'dustwind_devil', 'dustwind_bandit', 'dustwind_stalker', 'dustwind_scorpion', 'dustwind_snake', 'dustwind_vulture', 'dustwind_raider', 'dustwind_coyote'],
    bossId: 'boss_redfang',
    theme: {
      primary: '#c2a366',
      secondary: '#8b7355',
      accent: '#FFD700'
    },
    emoji: '\u{1F33E}',
    backgroundCSS: 'linear-gradient(180deg, #c2a366 0%, #8b7355 100%)',
    shopRefreshBase: 225,
    shopItems: [
      'weapon_dustwind_common_01',
      'weapon_dustwind_common_02',
      'weapon_dustwind_uncommon_01',
      'accessory_dustwind_common_01',
      'accessory_dustwind_uncommon_01',
      'armor_dustwind_common_01',
      'armor_dustwind_uncommon_01',
      'accessory_skillboost_berserk_01'
    ]
  },

  shadowmire: {
    id: 'shadowmire',
    name: 'Shadowmire Swamp',
    description: 'A cursed wetland where dark magic festers in stagnant pools. Strange lights flicker between dead trees.',
    order: 3,
    levelMin: 20,
    levelMax: 30,
    bossKillReq: 60,
    unlockCondition: { type: 'boss', bossId: 'boss_redfang' },
    monsters: ['shadowmire_crawler', 'shadowmire_wisp', 'shadowmire_hag', 'shadowmire_husk', 'shadowmire_toad', 'shadowmire_vine', 'shadowmire_leech', 'shadowmire_shade', 'shadowmire_serpent'],
    bossId: 'boss_mire_mother',
    theme: {
      primary: '#2d4a3e',
      secondary: '#1a2f28',
      accent: '#00ff88'
    },
    emoji: '\u{1F32B}\uFE0F',
    backgroundCSS: 'linear-gradient(180deg, #2d4a3e 0%, #1a2f28 100%)',
    shopRefreshBase: 525,
    shopItems: [
      'weapon_shadowmire_common_01',
      'weapon_shadowmire_common_02',
      'weapon_shadowmire_uncommon_01',
      'accessory_shadowmire_common_01',
      'accessory_shadowmire_uncommon_01',
      'armor_shadowmire_common_01',
      'armor_shadowmire_uncommon_01',
      'accessory_skillboost_heal_01'
    ]
  },

  ironhold: {
    id: 'ironhold',
    name: 'Ironhold Peaks',
    description: 'Ancient mountains riddled with abandoned dwarven mines. Crystal formations glow in the depths.',
    order: 4,
    levelMin: 30,
    levelMax: 45,
    bossKillReq: 80,
    unlockCondition: { type: 'boss', bossId: 'boss_mire_mother' },
    monsters: ['ironhold_elemental', 'ironhold_bat', 'ironhold_kobold', 'ironhold_golem', 'ironhold_spider', 'ironhold_sentinel', 'ironhold_worm', 'ironhold_drake', 'ironhold_guardian'],
    bossId: 'boss_grimstone',
    theme: {
      primary: '#5a5a5a',
      secondary: '#3d3d3d',
      accent: '#87CEEB'
    },
    emoji: '\u26F0\uFE0F',
    backgroundCSS: 'linear-gradient(180deg, #5a5a5a 0%, #3d3d3d 100%)',
    shopRefreshBase: 1500,
    shopItems: [
      'weapon_ironhold_common_01',
      'weapon_ironhold_common_02',
      'weapon_ironhold_uncommon_01',
      'accessory_ironhold_common_01',
      'accessory_ironhold_uncommon_01',
      'armor_ironhold_common_01',
      'armor_ironhold_uncommon_01',
      'accessory_skillboost_power_strike_01',
      'accessory_skillboost_execute_01'
    ]
  },

  emberfell: {
    id: 'emberfell',
    name: 'Emberfell Wastes',
    description: 'A volcanic hellscape where rivers of lava carve through blackened rock. Fire elementals roam freely.',
    order: 5,
    levelMin: 45,
    levelMax: 60,
    bossKillReq: 100,
    unlockCondition: { type: 'boss', bossId: 'boss_grimstone' },
    monsters: ['emberfell_slime', 'emberfell_imp', 'emberfell_wraith', 'emberfell_giant', 'emberfell_hound', 'emberfell_cultist', 'emberfell_golem', 'emberfell_salamander', 'emberfell_drake'],
    bossId: 'boss_pyrax',
    theme: {
      primary: '#8b2500',
      secondary: '#4a1200',
      accent: '#ff4500'
    },
    emoji: '\u{1F30B}',
    backgroundCSS: 'linear-gradient(180deg, #8b2500 0%, #4a1200 100%)',
    shopRefreshBase: 4500,
    shopItems: [
      'weapon_emberfell_common_01',
      'weapon_emberfell_common_02',
      'weapon_emberfell_uncommon_01',
      'accessory_emberfell_common_01',
      'accessory_emberfell_uncommon_01',
      'armor_emberfell_common_01',
      'armor_emberfell_uncommon_01'
    ]
  },

  frostpeak: {
    id: 'frostpeak',
    name: 'Frostpeak Summit',
    description: 'The frozen roof of the world, where eternal blizzards rage and ancient ice creatures dwell.',
    order: 6,
    levelMin: 60,
    levelMax: 75,
    bossKillReq: 120,
    unlockCondition: { type: 'boss', bossId: 'boss_pyrax' },
    monsters: ['frostpeak_sprite', 'frostpeak_prowler', 'frostpeak_wraith', 'frostpeak_giant', 'frostpeak_yeti', 'frostpeak_elemental', 'frostpeak_wolf', 'frostpeak_banshee', 'frostpeak_wyrm'],
    bossId: 'boss_glacielle',
    theme: {
      primary: '#a5c7d3',
      secondary: '#7ba3b3',
      accent: '#00BFFF'
    },
    emoji: '\u2744\uFE0F',
    backgroundCSS: 'linear-gradient(180deg, #a5c7d3 0%, #7ba3b3 100%)',
    shopRefreshBase: 12000,
    shopItems: [
      'weapon_frostpeak_common_01',
      'weapon_frostpeak_common_02',
      'weapon_frostpeak_uncommon_01',
      'accessory_frostpeak_common_01',
      'accessory_frostpeak_uncommon_01',
      'armor_frostpeak_common_01',
      'armor_frostpeak_uncommon_01',
      'accessory_skillboost_general_01'
    ]
  },

  voidrift: {
    id: 'voidrift',
    name: 'The Void Rift',
    description: 'The source of all corruption - a tear in reality itself. Eldritch horrors lurk in the purple darkness.',
    order: 7,
    levelMin: 75,
    levelMax: 100,
    bossKillReq: 150,
    unlockCondition: { type: 'boss', bossId: 'boss_glacielle' },
    monsters: ['voidrift_walker', 'voidrift_imp', 'voidrift_bender', 'voidrift_horror', 'voidrift_stalker', 'voidrift_golem', 'voidrift_leech', 'voidrift_wraith', 'voidrift_titan'],
    bossId: 'boss_xaltheron',
    theme: {
      primary: '#2d1b4e',
      secondary: '#1a0f2e',
      accent: '#9370DB'
    },
    emoji: '\u{1F300}',
    backgroundCSS: 'linear-gradient(180deg, #2d1b4e 0%, #1a0f2e 100%)',
    shopRefreshBase: 30000,
    shopItems: [
      'weapon_voidrift_common_01',
      'weapon_voidrift_common_02',
      'weapon_voidrift_uncommon_01',
      'accessory_voidrift_common_01',
      'accessory_voidrift_uncommon_01',
      'armor_voidrift_common_01',
      'armor_voidrift_uncommon_01'
    ]
  }
};

export const ZONE_ORDER = [
  'whisperwood',
  'dustwind',
  'shadowmire',
  'ironhold',
  'emberfell',
  'frostpeak',
  'voidrift'
];

/**
 * zones.data.js - Zone Definitions
 *
 * Static data for all game zones.
 * Phase 0+1: Only Whisperwood is active; others defined for reference.
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
    unlockCondition: { type: 'default' },
    monsters: ['whisperwood_sprite', 'whisperwood_boar', 'whisperwood_wolf', 'whisperwood_treant'],
    bossId: 'boss_mossback',
    theme: {
      primary: '#2d5a27',
      secondary: '#1a3518',
      accent: '#90EE90'
    },
    emoji: '\u{1F332}',
    backgroundCSS: 'linear-gradient(180deg, #2d5a27 0%, #1a3518 100%)'
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

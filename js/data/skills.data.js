/**
 * skills.data.js - Skill Definitions
 *
 * All 25 skills (16 active + 9 passive) with tier/level data.
 * Pure data — no imports, no logic.
 *
 * @see docs/data/skills.data.md
 */

export const SKILLS = {
  // === Active - Offense ===

  skill_power_strike: {
    id: 'skill_power_strike',
    name: 'Power Strike',
    type: 'active',
    category: 'offense',
    tier: 'starter',
    unlockCost: 0,
    energyCost: 15,
    cooldown: 8000,
    effectType: 'nextAttackMultiplier',
    icon: '\u2694\uFE0F',
    description: 'Next attack deals {multiplier}x damage',
    levels: {
      1: { multiplier: 3.0 },
      2: { multiplier: 3.5 },
      3: { multiplier: 4.0 },
      4: { multiplier: 4.5 },
      5: { multiplier: 5.0 }
    }
  },

  skill_execute: {
    id: 'skill_execute',
    name: 'Execute',
    type: 'active',
    category: 'offense',
    tier: 'combat',
    unlockCost: 5,
    energyCost: 25,
    cooldown: 12000,
    effectType: 'conditionalMultiplier',
    condition: 'monsterHP < threshold',
    icon: '\uD83D\uDC80',
    description: 'Deal {multiplier}x damage to monsters below {threshold}% HP',
    levels: {
      1: { multiplier: 5.0, threshold: 0.30 },
      2: { multiplier: 5.5, threshold: 0.32 },
      3: { multiplier: 6.0, threshold: 0.34 },
      4: { multiplier: 6.5, threshold: 0.36 },
      5: { multiplier: 7.0, threshold: 0.40 }
    }
  },

  skill_berserk_rage: {
    id: 'skill_berserk_rage',
    name: 'Berserk Rage',
    type: 'active',
    category: 'offense',
    tier: 'combat',
    unlockCost: 5,
    energyCost: 30,
    cooldown: 45000,
    effectType: 'buff',
    icon: '\uD83D\uDD25',
    description: 'Deal {damageMultiplier}x damage, take {damageTakenMultiplier}x damage for {duration}s',
    levels: {
      1: { damageMultiplier: 2.0, damageTakenMultiplier: 2.0, duration: 15000 },
      2: { damageMultiplier: 2.2, damageTakenMultiplier: 1.8, duration: 15000 },
      3: { damageMultiplier: 2.4, damageTakenMultiplier: 1.6, duration: 15000 },
      4: { damageMultiplier: 2.6, damageTakenMultiplier: 1.4, duration: 15000 },
      5: { damageMultiplier: 3.0, damageTakenMultiplier: 1.0, duration: 15000 }
    }
  },

  skill_crit_surge: {
    id: 'skill_crit_surge',
    name: 'Crit Surge',
    type: 'active',
    category: 'offense',
    tier: 'combat',
    unlockCost: 5,
    energyCost: 25,
    cooldown: 30000,
    effectType: 'buff',
    icon: '\u2B50',
    description: '+{critBonus}% crit chance for {duration}s',
    levels: {
      1: { critBonus: 0.50, duration: 10000 },
      2: { critBonus: 0.55, duration: 11000 },
      3: { critBonus: 0.60, duration: 12000 },
      4: { critBonus: 0.65, duration: 13000 },
      5: { critBonus: 0.75, duration: 15000 }
    }
  },

  skill_soul_rend: {
    id: 'skill_soul_rend',
    name: 'Soul Rend',
    type: 'active',
    category: 'offense',
    tier: 'elite',
    unlockCost: 8,
    energyCost: 35,
    cooldown: 20000,
    effectType: 'percentDamage',
    icon: '\uD83D\uDC7B',
    description: 'Deal {percent}% of monster\'s max HP as damage',
    levels: {
      1: { percent: 0.10, minMultiplier: 1, maxMultiplier: 10 },
      2: { percent: 0.11, minMultiplier: 1, maxMultiplier: 10 },
      3: { percent: 0.12, minMultiplier: 1, maxMultiplier: 10 },
      4: { percent: 0.13, minMultiplier: 1, maxMultiplier: 10 },
      5: { percent: 0.15, minMultiplier: 1, maxMultiplier: 10 }
    }
  },

  // === Active - Defense ===

  skill_heal: {
    id: 'skill_heal',
    name: 'Heal',
    type: 'active',
    category: 'defense',
    tier: 'basic',
    unlockCost: 3,
    energyCost: 20,
    cooldown: 15000,
    effectType: 'instantHeal',
    icon: '\uD83D\uDC9A',
    description: 'Restore {healPercent}% of max HP',
    levels: {
      1: { healPercent: 0.25 },
      2: { healPercent: 0.30 },
      3: { healPercent: 0.35 },
      4: { healPercent: 0.40 },
      5: { healPercent: 0.50 }
    }
  },

  skill_iron_skin: {
    id: 'skill_iron_skin',
    name: 'Iron Skin',
    type: 'active',
    category: 'defense',
    tier: 'basic',
    unlockCost: 3,
    energyCost: 25,
    cooldown: 30000,
    effectType: 'buff',
    icon: '\uD83D\uDEE1\uFE0F',
    description: 'Reduce damage taken by {damageReduction}% for {duration}s',
    levels: {
      1: { damageReduction: 0.50, duration: 10000 },
      2: { damageReduction: 0.55, duration: 11000 },
      3: { damageReduction: 0.60, duration: 12000 },
      4: { damageReduction: 0.65, duration: 13000 },
      5: { damageReduction: 0.75, duration: 15000 }
    }
  },

  skill_reflect: {
    id: 'skill_reflect',
    name: 'Reflect',
    type: 'active',
    category: 'defense',
    tier: 'utility',
    unlockCost: 4,
    energyCost: 30,
    cooldown: 25000,
    effectType: 'buff',
    icon: '\uD83D\uDD04',
    description: 'Reflect damage at {reflectMultiplier}x for {duration}s',
    levels: {
      1: { reflectMultiplier: 1.0, duration: 30000 },
      2: { reflectMultiplier: 1.25, duration: 30000 },
      3: { reflectMultiplier: 1.50, duration: 30000 },
      4: { reflectMultiplier: 1.75, duration: 30000 },
      5: { reflectMultiplier: 2.00, duration: 30000 }
    }
  },

  skill_undying: {
    id: 'skill_undying',
    name: 'Undying',
    type: 'active',
    category: 'defense',
    tier: 'elite',
    unlockCost: 8,
    energyCost: 50,
    cooldown: 180000,
    effectType: 'buff',
    icon: '\uD83D\uDCAB',
    description: 'Survive fatal blow with {survivePercent}% HP',
    levels: {
      1: { survivePercent: 0.01, duration: 30000 },
      2: { survivePercent: 0.05, duration: 30000 },
      3: { survivePercent: 0.10, duration: 30000 },
      4: { survivePercent: 0.15, duration: 30000 },
      5: { survivePercent: 0.25, duration: 30000 }
    }
  },

  skill_shield_wall: {
    id: 'skill_shield_wall',
    name: 'Shield Wall',
    type: 'active',
    category: 'defense',
    tier: 'elite',
    unlockCost: 8,
    energyCost: 40,
    cooldown: 60000,
    effectType: 'grantShield',
    icon: '\uD83D\uDD37',
    description: 'Gain a shield equal to {shieldPercent}% of max HP for {duration}s',
    levels: {
      1: { shieldPercent: 0.20, duration: 20000 },
      2: { shieldPercent: 0.22, duration: 22000 },
      3: { shieldPercent: 0.25, duration: 25000 },
      4: { shieldPercent: 0.28, duration: 28000 },
      5: { shieldPercent: 0.30, duration: 30000 }
    }
  },

  // === Active - Utility ===

  skill_gold_rush: {
    id: 'skill_gold_rush',
    name: 'Gold Rush',
    type: 'active',
    category: 'utility',
    tier: 'utility',
    unlockCost: 4,
    energyCost: 20,
    cooldown: 60000,
    effectType: 'buff',
    icon: '\uD83E\uDE99',
    description: '+{goldBonus}% gold for {duration}s',
    levels: {
      1: { goldBonus: 1.00, duration: 30000 },
      2: { goldBonus: 1.20, duration: 32000 },
      3: { goldBonus: 1.40, duration: 34000 },
      4: { goldBonus: 1.60, duration: 36000 },
      5: { goldBonus: 2.00, duration: 45000 }
    }
  },

  skill_xp_boost: {
    id: 'skill_xp_boost',
    name: 'XP Boost',
    type: 'active',
    category: 'utility',
    tier: 'utility',
    unlockCost: 4,
    energyCost: 20,
    cooldown: 60000,
    effectType: 'buff',
    icon: '\uD83D\uDCC8',
    description: '+{xpBonus}% XP for {duration}s',
    levels: {
      1: { xpBonus: 1.00, duration: 30000 },
      2: { xpBonus: 1.20, duration: 32000 },
      3: { xpBonus: 1.40, duration: 34000 },
      4: { xpBonus: 1.60, duration: 36000 },
      5: { xpBonus: 2.00, duration: 45000 }
    }
  },

  skill_perfect_strike: {
    id: 'skill_perfect_strike',
    name: 'Perfect Strike',
    type: 'active',
    category: 'utility',
    tier: 'combat',
    unlockCost: 5,
    energyCost: 30,
    cooldown: 30000,
    effectType: 'timingMode',
    icon: '\uD83C\uDFAF',
    description: 'Timing mode: Good={goodMultiplier}x, Perfect={perfectMultiplier}x for {duration}s',
    levels: {
      1: { duration: 5000, goodMultiplier: 2.0, perfectMultiplier: 4.0, missMultiplier: 0.5, missDamage: 0.03 },
      2: { duration: 6000, goodMultiplier: 2.2, perfectMultiplier: 4.4, missMultiplier: 0.5, missDamage: 0.03 },
      3: { duration: 7000, goodMultiplier: 2.4, perfectMultiplier: 4.8, missMultiplier: 0.5, missDamage: 0.03 },
      4: { duration: 8000, goodMultiplier: 2.6, perfectMultiplier: 5.2, missMultiplier: 0.5, missDamage: 0.03 },
      5: { duration: 10000, goodMultiplier: 3.0, perfectMultiplier: 6.0, missMultiplier: 0.5, missDamage: 0.03 }
    }
  },

  skill_time_warp: {
    id: 'skill_time_warp',
    name: 'Time Warp',
    type: 'active',
    category: 'utility',
    tier: 'utility',
    unlockCost: 4,
    energyCost: 40,
    cooldown: 90000,
    effectType: 'monsterFreeze',
    icon: '\u231B',
    description: 'Freeze monster for {duration}s',
    levels: {
      1: { duration: 5000 },
      2: { duration: 6000 },
      3: { duration: 7000 },
      4: { duration: 8000 },
      5: { duration: 10000 }
    }
  },

  skill_shield_breaker: {
    id: 'skill_shield_breaker',
    name: 'Shield Breaker',
    type: 'active',
    category: 'utility',
    tier: 'elite',
    unlockCost: 8,
    energyCost: 25,
    cooldown: 15000,
    effectType: 'shieldBreak',
    icon: '\uD83D\uDCA5',
    description: 'Break shields, +{bonusDamage}% vs shielded for {duration}s',
    levels: {
      1: { bonusDamage: 0.50, duration: 10000 },
      2: { bonusDamage: 0.55, duration: 11000 },
      3: { bonusDamage: 0.60, duration: 12000 },
      4: { bonusDamage: 0.65, duration: 13000 },
      5: { bonusDamage: 0.75, duration: 15000 }
    }
  },

  skill_transcendence: {
    id: 'skill_transcendence',
    name: 'Transcendence',
    type: 'active',
    category: 'utility',
    tier: 'master',
    unlockCost: 10,
    energyCost: 100,
    cooldown: 300000,
    effectType: 'buff',
    icon: '\u2728',
    description: 'Invulnerable, +{damageBonus}% damage/gold/XP for {duration}s',
    levels: {
      1: { invulnerable: true, damageBonus: 1.0, goldBonus: 1.0, xpBonus: 1.0, duration: 30000 },
      2: { invulnerable: true, damageBonus: 1.1, goldBonus: 1.1, xpBonus: 1.1, duration: 32000 },
      3: { invulnerable: true, damageBonus: 1.2, goldBonus: 1.2, xpBonus: 1.2, duration: 34000 },
      4: { invulnerable: true, damageBonus: 1.3, goldBonus: 1.3, xpBonus: 1.3, duration: 36000 },
      5: { invulnerable: true, damageBonus: 1.5, goldBonus: 1.5, xpBonus: 1.5, duration: 45000 }
    }
  },

  // === Passive - Offense ===

  skill_sharp_blades: {
    id: 'skill_sharp_blades',
    name: 'Sharp Blades',
    type: 'passive',
    category: 'offense',
    tier: 'basic',
    unlockCost: 3,
    stat: 'damage',
    icon: '\uD83D\uDDE1\uFE0F',
    description: '+{bonus}% damage',
    levels: {
      1: { bonus: 0.05 },
      2: { bonus: 0.10 },
      3: { bonus: 0.15 },
      4: { bonus: 0.20 },
      5: { bonus: 0.25 }
    }
  },

  skill_killer_instinct: {
    id: 'skill_killer_instinct',
    name: 'Killer Instinct',
    type: 'passive',
    category: 'offense',
    tier: 'basic',
    unlockCost: 3,
    stat: 'critChance',
    icon: '\uD83C\uDFB2',
    description: '+{bonus}% crit chance',
    levels: {
      1: { bonus: 0.03 },
      2: { bonus: 0.06 },
      3: { bonus: 0.09 },
      4: { bonus: 0.12 },
      5: { bonus: 0.15 }
    }
  },

  skill_void_touch: {
    id: 'skill_void_touch',
    name: 'Void Touch',
    type: 'passive',
    category: 'offense',
    tier: 'master',
    unlockCost: 10,
    stat: 'armorPen',
    icon: '\uD83C\uDF00',
    description: 'Ignore {bonus} points of monster armor',
    levels: {
      1: { bonus: 10 },
      2: { bonus: 20 },
      3: { bonus: 30 },
      4: { bonus: 40 },
      5: { bonus: 50 }
    }
  },

  // === Passive - Defense ===

  skill_thick_skin: {
    id: 'skill_thick_skin',
    name: 'Thick Skin',
    type: 'passive',
    category: 'defense',
    tier: 'advanced',
    unlockCost: 6,
    stat: 'maxHP',
    icon: '\uD83D\uDCAA',
    description: '+{bonus}% max HP',
    levels: {
      1: { bonus: 0.10 },
      2: { bonus: 0.20 },
      3: { bonus: 0.30 },
      4: { bonus: 0.40 },
      5: { bonus: 0.50 }
    }
  },

  skill_regeneration: {
    id: 'skill_regeneration',
    name: 'Regeneration',
    type: 'passive',
    category: 'defense',
    tier: 'advanced',
    unlockCost: 6,
    stat: 'hpRegen',
    icon: '\uD83D\uDC9A',
    description: '+{bonus}% HP per second',
    levels: {
      1: { bonus: 0.005 },
      2: { bonus: 0.010 },
      3: { bonus: 0.015 },
      4: { bonus: 0.020 },
      5: { bonus: 0.030 }
    }
  },

  skill_quick_reflexes: {
    id: 'skill_quick_reflexes',
    name: 'Quick Reflexes',
    type: 'passive',
    category: 'defense',
    tier: 'master',
    unlockCost: 10,
    stat: 'warningTime',
    icon: '\uD83D\uDC41\uFE0F',
    description: '+{bonus}ms attack warning time',
    levels: {
      1: { bonus: 200 },
      2: { bonus: 400 },
      3: { bonus: 600 },
      4: { bonus: 800 },
      5: { bonus: 1000 }
    }
  },

  // === Passive - Utility ===

  skill_deep_pockets: {
    id: 'skill_deep_pockets',
    name: 'Deep Pockets',
    type: 'passive',
    category: 'utility',
    tier: 'advanced',
    unlockCost: 6,
    stat: 'goldFind',
    icon: '\uD83D\uDCB0',
    description: '+{bonus}% gold',
    levels: {
      1: { bonus: 0.05 },
      2: { bonus: 0.10 },
      3: { bonus: 0.15 },
      4: { bonus: 0.20 },
      5: { bonus: 0.25 }
    }
  },

  skill_fast_learner: {
    id: 'skill_fast_learner',
    name: 'Fast Learner',
    type: 'passive',
    category: 'utility',
    tier: 'advanced',
    unlockCost: 6,
    stat: 'xpBonus',
    icon: '\uD83D\uDCDA',
    description: '+{bonus}% XP',
    levels: {
      1: { bonus: 0.05 },
      2: { bonus: 0.10 },
      3: { bonus: 0.15 },
      4: { bonus: 0.20 },
      5: { bonus: 0.25 }
    }
  },

  skill_energy_flow: {
    id: 'skill_energy_flow',
    name: 'Energy Flow',
    type: 'passive',
    category: 'utility',
    tier: 'elite',
    unlockCost: 8,
    stat: 'energyGain',
    icon: '\u26A1',
    description: '+{bonus}% Energy gain',
    levels: {
      1: { bonus: 0.10 },
      2: { bonus: 0.20 },
      3: { bonus: 0.30 },
      4: { bonus: 0.40 },
      5: { bonus: 0.50 }
    }
  }
};

export const SKILL_TIERS = {
  starter:  { cost: 0,  skills: ['skill_power_strike'] },
  basic:    { cost: 3,  skills: ['skill_heal', 'skill_iron_skin', 'skill_sharp_blades', 'skill_killer_instinct'] },
  utility:  { cost: 4,  skills: ['skill_gold_rush', 'skill_xp_boost', 'skill_reflect', 'skill_time_warp'] },
  combat:   { cost: 5,  skills: ['skill_execute', 'skill_berserk_rage', 'skill_crit_surge', 'skill_perfect_strike'] },
  advanced: { cost: 6,  skills: ['skill_deep_pockets', 'skill_fast_learner', 'skill_thick_skin', 'skill_regeneration'] },
  elite:    { cost: 8,  skills: ['skill_undying', 'skill_soul_rend', 'skill_shield_breaker', 'skill_energy_flow', 'skill_shield_wall'] },
  master:   { cost: 10, skills: ['skill_transcendence', 'skill_void_touch', 'skill_quick_reflexes'] }
};

export const TIER_ORDER = ['starter', 'basic', 'utility', 'combat', 'advanced', 'elite', 'master'];

export const TIER_COLORS = {
  starter:  '#9d9d9d',
  basic:    '#1eff00',
  utility:  '#0070dd',
  combat:   '#a335ee',
  advanced: '#ff8000',
  elite:    '#e6cc80',
  master:   '#ff4444'
};

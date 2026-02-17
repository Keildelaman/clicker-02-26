/**
 * skills.data.js - Skill Definitions (v2)
 *
 * 25 skills: 15 active + 10 passive. New schema with per-level
 * energyCost/cooldown (seconds), tags, mechanic, unlockLevel.
 * Pure data — no imports, no logic.
 *
 * @see docs/design/skill-system-v2.md
 */

export const SKILLS = {
  // ===========================
  // ACTIVE SKILLS (15)
  // ===========================

  power_strike: {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'Next click deals {damage}% damage.',
    category: 'power',
    type: 'active',
    damageType: 'physical',
    tags: ['power', 'attack'],
    mechanic: 'next_click_hit',
    statusEffect: { type: 'bleed', chance: 0.30, stacks: 1 },
    icon: '\u2694\uFE0F',
    unlockLevel: 1,
    unlockCost: 0,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { damage: 1000, cooldown: 10, energyCost: 35 },
      2: { damage: 1200, cooldown: 10, energyCost: 35 },
      3: { damage: 1500, cooldown: 9,  energyCost: 33 },
      4: { damage: 1800, cooldown: 9,  energyCost: 33 },
      5: { damage: 2200, cooldown: 8,  energyCost: 30 }
    }
  },

  barrage: {
    id: 'barrage',
    name: 'Barrage',
    description: 'Unleash {hits} hits at {damagePerHit}% each ({totalDamage}% total).',
    category: 'speed',
    type: 'active',
    damageType: 'physical',
    tags: ['speed', 'attack'],
    mechanic: 'instant',
    statusEffect: { type: 'poison', chance: 0.35, stacks: 1 },
    icon: '\uD83C\uDF2A\uFE0F',
    unlockLevel: 3,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { hits: 5,  damagePerHit: 60, totalDamage: 300, cooldown: 8, energyCost: 25 },
      2: { hits: 6,  damagePerHit: 60, totalDamage: 360, cooldown: 8, energyCost: 25 },
      3: { hits: 7,  damagePerHit: 65, totalDamage: 455, cooldown: 7, energyCost: 23 },
      4: { hits: 8,  damagePerHit: 65, totalDamage: 520, cooldown: 7, energyCost: 23 },
      5: { hits: 10, damagePerHit: 70, totalDamage: 700, cooldown: 6, energyCost: 20 }
    }
  },

  precision: {
    id: 'precision',
    name: 'Precision',
    description: 'Next {charges} clicks are guaranteed critical hits.',
    category: 'crit',
    type: 'active',
    tags: ['crit', 'buff'],
    mechanic: 'next_click_click',
    icon: '\uD83C\uDFAF',
    unlockLevel: 8,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { charges: 3, cooldown: 12, energyCost: 25 },
      2: { charges: 4, cooldown: 12, energyCost: 25 },
      3: { charges: 5, cooldown: 11, energyCost: 23 },
      4: { charges: 6, cooldown: 10, energyCost: 23 },
      5: { charges: 8, cooldown: 9,  energyCost: 20 }
    }
  },

  execute: {
    id: 'execute',
    name: 'Execute',
    description: 'Next click: {strongMult}% if monster <{threshold}% HP, else {weakMult}%.',
    category: 'crit',
    type: 'active',
    damageType: 'physical',
    tags: ['crit', 'attack'],
    mechanic: 'next_click_hit',
    statusEffect: { type: 'bleed', chance: 0.50, stacks: 2 },
    icon: '\uD83D\uDC80',
    unlockLevel: 12,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { threshold: 30, strongMult: 800,  weakMult: 150, cooldown: 8, energyCost: 20 },
      2: { threshold: 33, strongMult: 1000, weakMult: 150, cooldown: 8, energyCost: 20 },
      3: { threshold: 35, strongMult: 1200, weakMult: 150, cooldown: 7, energyCost: 18 },
      4: { threshold: 38, strongMult: 1500, weakMult: 180, cooldown: 7, energyCost: 18 },
      5: { threshold: 40, strongMult: 1800, weakMult: 200, cooldown: 6, energyCost: 15 }
    }
  },

  energy_surge: {
    id: 'energy_surge',
    name: 'Energy Surge',
    description: 'Instantly restore {energyGained} energy.',
    category: 'utility',
    type: 'active',
    tags: ['utility', 'energy'],
    mechanic: 'instant',
    icon: '\u26A1',
    unlockLevel: 14,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { energyGained: 35, cooldown: 22, energyCost: 0 },
      2: { energyGained: 40, cooldown: 20, energyCost: 0 },
      3: { energyGained: 45, cooldown: 18, energyCost: 0 },
      4: { energyGained: 55, cooldown: 16, energyCost: 0 },
      5: { energyGained: 65, cooldown: 14, energyCost: 0 }
    }
  },

  arcane_bolt: {
    id: 'arcane_bolt',
    name: 'Arcane Bolt',
    description: 'Fire a bolt dealing {damage}% ATK damage.',
    category: 'mage',
    type: 'active',
    damageType: 'magic',
    tags: ['spell', 'attack'],
    mechanic: 'instant',
    statusEffect: { type: 'burn', chance: 0.25 },
    icon: '\uD83D\uDD2E',
    unlockLevel: 16,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { damage: 400,  cooldown: 6, energyCost: 20 },
      2: { damage: 500,  cooldown: 6, energyCost: 20 },
      3: { damage: 650,  cooldown: 5, energyCost: 18 },
      4: { damage: 800,  cooldown: 5, energyCost: 18 },
      5: { damage: 1000, cooldown: 4, energyCost: 15 }
    }
  },

  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    description: 'Deal {damage}% damage and gain a {shieldPercent}% HP shield for {shieldDuration}s.',
    category: 'utility',
    type: 'active',
    damageType: 'physical',
    tags: ['utility', 'attack', 'defensive'],
    mechanic: 'instant',
    icon: '\uD83D\uDEE1\uFE0F',
    unlockLevel: 20,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { damage: 200, shieldPercent: 12, shieldDuration: 6,  cooldown: 15, energyCost: 30 },
      2: { damage: 250, shieldPercent: 14, shieldDuration: 7,  cooldown: 14, energyCost: 30 },
      3: { damage: 300, shieldPercent: 16, shieldDuration: 8,  cooldown: 13, energyCost: 28 },
      4: { damage: 350, shieldPercent: 18, shieldDuration: 9,  cooldown: 12, energyCost: 26 },
      5: { damage: 450, shieldPercent: 22, shieldDuration: 10, cooldown: 10, energyCost: 25 }
    }
  },

  flurry: {
    id: 'flurry',
    name: 'Flurry',
    description: 'For {duration}s, every click strikes {hitsPerClick} times.',
    category: 'speed',
    type: 'active',
    damageType: 'physical',
    tags: ['speed', 'buff'],
    mechanic: 'buff',
    icon: '\uD83C\uDF00',
    unlockLevel: 22,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { hitsPerClick: 2, duration: 4, cooldown: 14, energyCost: 30 },
      2: { hitsPerClick: 2, duration: 5, cooldown: 13, energyCost: 30 },
      3: { hitsPerClick: 2, duration: 5, cooldown: 12, energyCost: 28 },
      4: { hitsPerClick: 3, duration: 5, cooldown: 12, energyCost: 28 },
      5: { hitsPerClick: 3, duration: 6, cooldown: 10, energyCost: 25 }
    }
  },

  adrenaline_rush: {
    id: 'adrenaline_rush',
    name: 'Adrenaline Rush',
    description: 'For {duration}s, crit chance = energy%. Energy drains at {drainRate}/s.',
    category: 'crit',
    type: 'active',
    tags: ['crit', 'buff'],
    mechanic: 'buff',
    icon: '\uD83D\uDCA5',
    unlockLevel: 30,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { duration: 4, drainRate: 12, cooldown: 20, energyCost: 0 },
      2: { duration: 5, drainRate: 11, cooldown: 19, energyCost: 0 },
      3: { duration: 5, drainRate: 10, cooldown: 18, energyCost: 0 },
      4: { duration: 6, drainRate: 9,  cooldown: 17, energyCost: 0 },
      5: { duration: 7, drainRate: 8,  cooldown: 15, energyCost: 0 }
    }
  },

  chain_lightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Deal {damage}% damage. Overkill chains {overkillCarry}% to next spawn.',
    category: 'mage',
    type: 'active',
    damageType: 'magic',
    tags: ['spell', 'attack'],
    mechanic: 'instant',
    statusEffect: { type: 'slow', chance: 0.35 },
    icon: '\u26A1',
    unlockLevel: 36,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { damage: 600,  overkillCarry: 40, cooldown: 12, energyCost: 30 },
      2: { damage: 750,  overkillCarry: 45, cooldown: 11, energyCost: 30 },
      3: { damage: 900,  overkillCarry: 50, cooldown: 10, energyCost: 28 },
      4: { damage: 1100, overkillCarry: 55, cooldown: 9,  energyCost: 26 },
      5: { damage: 1400, overkillCarry: 60, cooldown: 8,  energyCost: 25 }
    }
  },

  charge_up: {
    id: 'charge_up',
    name: 'Charge Up',
    description: 'Hold to charge ({channelMin}-{channelMax}s). Release: {minMult}-{maxMult}% damage.',
    category: 'power',
    type: 'active',
    damageType: 'physical',
    tags: ['power', 'attack', 'channel'],
    mechanic: 'channel',
    icon: '\uD83D\uDD0B',
    unlockLevel: 39,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { minMult: 500,  maxMult: 1500, channelMin: 1, channelMax: 3,   cooldown: 16, energyCost: 40 },
      2: { minMult: 600,  maxMult: 1800, channelMin: 1, channelMax: 3,   cooldown: 15, energyCost: 40 },
      3: { minMult: 700,  maxMult: 2200, channelMin: 1, channelMax: 3,   cooldown: 14, energyCost: 38 },
      4: { minMult: 900,  maxMult: 2800, channelMin: 0.8, channelMax: 2.5, cooldown: 13, energyCost: 35 },
      5: { minMult: 1000, maxMult: 3500, channelMin: 0.8, channelMax: 2.5, cooldown: 12, energyCost: 33 }
    }
  },

  momentum: {
    id: 'momentum',
    name: 'Momentum',
    description: 'Toggle: +{dmgPerStack}%/stack (max {maxStacks}). Drains {drainPerSec}/s.',
    category: 'speed',
    type: 'active',
    tags: ['speed', 'buff', 'toggle'],
    mechanic: 'toggle',
    icon: '\uD83C\uDF1F',
    unlockLevel: 45,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { dmgPerStack: 6,  maxStacks: 8,  maxBonus: 48,  decayTimer: 1.5, drainPerSec: 2,   cooldown: 0, energyCost: 0 },
      2: { dmgPerStack: 7,  maxStacks: 9,  maxBonus: 63,  decayTimer: 1.6, drainPerSec: 2,   cooldown: 0, energyCost: 0 },
      3: { dmgPerStack: 8,  maxStacks: 10, maxBonus: 80,  decayTimer: 1.8, drainPerSec: 1.8, cooldown: 0, energyCost: 0 },
      4: { dmgPerStack: 9,  maxStacks: 11, maxBonus: 99,  decayTimer: 1.9, drainPerSec: 1.5, cooldown: 0, energyCost: 0 },
      5: { dmgPerStack: 10, maxStacks: 12, maxBonus: 120, decayTimer: 2.0, drainPerSec: 1.2, cooldown: 0, energyCost: 0 }
    }
  },

  overcharge: {
    id: 'overcharge',
    name: 'Overcharge',
    description: 'Reduce all other skill cooldowns by {cdrAmount}s.',
    category: 'mage',
    type: 'active',
    tags: ['spell', 'utility'],
    mechanic: 'cd_utility',
    icon: '\u2728',
    unlockLevel: 52,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { cdrAmount: 3,   cooldown: 16, energyCost: 25 },
      2: { cdrAmount: 3.5, cooldown: 15, energyCost: 25 },
      3: { cdrAmount: 4,   cooldown: 14, energyCost: 23 },
      4: { cdrAmount: 4.5, cooldown: 13, energyCost: 21 },
      5: { cdrAmount: 5,   cooldown: 12, energyCost: 20 }
    }
  },

  shatter: {
    id: 'shatter',
    name: 'Shatter',
    description: 'Next click deals bonus {percentHP}% of monster max HP (ignores armor).',
    category: 'power',
    type: 'active',
    damageType: 'physical',
    tags: ['power', 'attack'],
    mechanic: 'next_click_hit',
    icon: '\uD83D\uDCA2',
    unlockLevel: 60,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { percentHP: 8,  cooldown: 12, energyCost: 30 },
      2: { percentHP: 10, cooldown: 12, energyCost: 30 },
      3: { percentHP: 13, cooldown: 11, energyCost: 28 },
      4: { percentHP: 16, cooldown: 10, energyCost: 26 },
      5: { percentHP: 20, cooldown: 9,  energyCost: 25 }
    }
  },

  life_tap: {
    id: 'life_tap',
    name: 'Life Tap',
    description: 'Sacrifice {hpCostPercent}% current HP to gain {energyGained} energy.',
    category: 'utility',
    type: 'active',
    tags: ['utility', 'energy'],
    mechanic: 'hp_cost',
    icon: '\uD83E\uDE78',
    unlockLevel: 65,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { hpCostPercent: 20, energyGained: 25, cooldown: 12, energyCost: 0 },
      2: { hpCostPercent: 20, energyGained: 30, cooldown: 11, energyCost: 0 },
      3: { hpCostPercent: 18, energyGained: 35, cooldown: 10, energyCost: 0 },
      4: { hpCostPercent: 15, energyGained: 40, cooldown: 9,  energyCost: 0 },
      5: { hpCostPercent: 12, energyGained: 50, cooldown: 8,  energyCost: 0 }
    }
  },

  // ===========================
  // PASSIVE SKILLS (10)
  // ===========================

  click_mastery: {
    id: 'click_mastery',
    name: 'Click Mastery',
    description: 'Fast clicks build +{dmgPerStack}%/stack (max {maxStacks}, window {clickWindow}s).',
    category: 'speed',
    type: 'passive',
    tags: ['speed'],
    mechanic: 'passive',
    icon: '\uD83D\uDC4A',
    unlockLevel: 5,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { dmgPerStack: 4,  maxStacks: 8,  clickWindow: 0.50, maxBonus: 32 },
      2: { dmgPerStack: 5,  maxStacks: 9,  clickWindow: 0.55, maxBonus: 45 },
      3: { dmgPerStack: 6,  maxStacks: 10, clickWindow: 0.60, maxBonus: 60 },
      4: { dmgPerStack: 7,  maxStacks: 11, clickWindow: 0.65, maxBonus: 77 },
      5: { dmgPerStack: 8,  maxStacks: 12, clickWindow: 0.70, maxBonus: 96 }
    }
  },

  vampiric_strikes: {
    id: 'vampiric_strikes',
    name: 'Vampiric Strikes',
    description: 'Clicks heal for {healPercent}% of damage dealt.',
    category: 'sustain',
    type: 'passive',
    tags: ['sustain'],
    mechanic: 'passive',
    icon: '\uD83E\uDDDB',
    unlockLevel: 10,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { healPercent: 3 },
      2: { healPercent: 4 },
      3: { healPercent: 5 },
      4: { healPercent: 7 },
      5: { healPercent: 10 }
    }
  },

  critical_flow: {
    id: 'critical_flow',
    name: 'Critical Flow',
    description: 'Critical hits restore {energyPerCrit} energy.',
    category: 'crit',
    type: 'passive',
    tags: ['crit', 'energy'],
    mechanic: 'passive',
    icon: '\uD83D\uDCA7',
    unlockLevel: 18,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { energyPerCrit: 5 },
      2: { energyPerCrit: 7 },
      3: { energyPerCrit: 9 },
      4: { energyPerCrit: 12 },
      5: { energyPerCrit: 15 }
    }
  },

  heavy_handed: {
    id: 'heavy_handed',
    name: 'Heavy Handed',
    description: 'Clicks deal +{dmgBonus}% damage but generate only {energyPerClick} energy/click.',
    category: 'power',
    type: 'passive',
    tags: ['power'],
    mechanic: 'passive',
    icon: '\uD83D\uDD28',
    unlockLevel: 24,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { dmgBonus: 40, energyPerClick: 1.5 },
      2: { dmgBonus: 50, energyPerClick: 1.5 },
      3: { dmgBonus: 60, energyPerClick: 1.8 },
      4: { dmgBonus: 70, energyPerClick: 2.0 },
      5: { dmgBonus: 80, energyPerClick: 2.0 }
    }
  },

  combo_artist: {
    id: 'combo_artist',
    name: 'Combo Artist',
    description: 'Use 2 skills within {triggerWindow}s for +{dmgBonus}% damage ({buffDuration}s).',
    category: 'combo',
    type: 'passive',
    tags: ['combo'],
    mechanic: 'passive',
    icon: '\uD83C\uDFB5',
    unlockLevel: 26,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { dmgBonus: 30, buffDuration: 4.0, triggerWindow: 3.0 },
      2: { dmgBonus: 35, buffDuration: 4.5, triggerWindow: 3.0 },
      3: { dmgBonus: 40, buffDuration: 5.0, triggerWindow: 3.5 },
      4: { dmgBonus: 45, buffDuration: 5.5, triggerWindow: 3.5 },
      5: { dmgBonus: 50, buffDuration: 6.0, triggerWindow: 4.0 }
    }
  },

  berserker: {
    id: 'berserker',
    name: 'Berserker',
    description: 'Below {hpThreshold}% HP: +{dmgBonus}% damage, +{critBonus}% crit.',
    category: 'power',
    type: 'passive',
    tags: ['power', 'crit'],
    mechanic: 'passive',
    icon: '\uD83D\uDD25',
    unlockLevel: 28,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { hpThreshold: 50, dmgBonus: 20, critBonus: 10 },
      2: { hpThreshold: 50, dmgBonus: 25, critBonus: 12 },
      3: { hpThreshold: 55, dmgBonus: 30, critBonus: 15 },
      4: { hpThreshold: 55, dmgBonus: 35, critBonus: 18 },
      5: { hpThreshold: 60, dmgBonus: 40, critBonus: 20 }
    }
  },

  efficient_casting: {
    id: 'efficient_casting',
    name: 'Efficient Casting',
    description: 'All skill energy costs reduced by {costReduction}%.',
    category: 'mage',
    type: 'passive',
    tags: ['spell', 'energy'],
    mechanic: 'passive',
    icon: '\uD83D\uDCDA',
    unlockLevel: 33,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { costReduction: 15 },
      2: { costReduction: 20 },
      3: { costReduction: 25 },
      4: { costReduction: 30 },
      5: { costReduction: 35 }
    }
  },

  spell_weaver: {
    id: 'spell_weaver',
    name: 'Spell Weaver',
    description: 'Using any skill reduces all other cooldowns by {cdrPerUse}s.',
    category: 'mage',
    type: 'passive',
    tags: ['spell'],
    mechanic: 'passive',
    icon: '\uD83E\uDDD9',
    unlockLevel: 42,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { cdrPerUse: 0.8 },
      2: { cdrPerUse: 1.0 },
      3: { cdrPerUse: 1.2 },
      4: { cdrPerUse: 1.4 },
      5: { cdrPerUse: 1.5 }
    }
  },

  residual_energy: {
    id: 'residual_energy',
    name: 'Residual Energy',
    description: 'When a skill effect ends, gain {energyOnEnd} energy.',
    category: 'energy',
    type: 'passive',
    tags: ['energy'],
    mechanic: 'passive',
    icon: '\uD83D\uDD0B',
    unlockLevel: 48,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { energyOnEnd: 8 },
      2: { energyOnEnd: 10 },
      3: { energyOnEnd: 12 },
      4: { energyOnEnd: 15 },
      5: { energyOnEnd: 18 }
    }
  },

  focused_mind: {
    id: 'focused_mind',
    name: 'Focused Mind',
    description: 'While not clicking, gain +{idleRegen} energy/sec.',
    category: 'power',
    type: 'passive',
    tags: ['energy', 'power'],
    mechanic: 'passive',
    icon: '\uD83E\uDDD8',
    unlockLevel: 52,
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 5,
    mutation: null,
    levels: {
      1: { idleRegen: 3 },
      2: { idleRegen: 4 },
      3: { idleRegen: 5 },
      4: { idleRegen: 6 },
      5: { idleRegen: 8 }
    }
  }
};

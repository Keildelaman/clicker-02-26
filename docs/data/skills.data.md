# Skills Data

> Complete definitions for all skills in the game.
> Schema: `schemas/skill.schema.md`
> System: `systems/skill.system.md`

---

## Skill System Overview

- **Active Skills**: 4 slots, use Energy, have cooldowns
- **Passive Skills**: 3 slots, always-on bonuses
- **Choice System**: At milestones, choose 1 of 2 skills (other costs gold later)
- **Level Cap**: 5 base, up to 10 with Ascension

---

## Skill Unlock Schedule

| Level | Choice 1 | Choice 2 | Alt Cost |
|-------|----------|----------|----------|
| 1 | Power Strike (free) | - | - |
| 3 | Sharp Blades | Killer Instinct | 100g |
| 5 | Heal | Iron Skin | 150g |
| 8 | Gold Rush | XP Boost | 200g |
| 10 | Execute | Berserk Rage | 500g |
| 15 | Crit Surge | Perfect Strike | 750g |
| 20 | Reflect | Time Warp | 1,000g |
| 25 | Deep Pockets | Fast Learner | 1,500g |
| 30 | Thick Skin | Regeneration | 2,000g |
| 40 | Undying | - | 5,000g |
| 50 | Soul Rend | Energy Flow | 10,000g |
| 60 | Shield Breaker | Quick Reflexes | 15,000g |
| 75 | Void Touch | - | 25,000g |
| 90 | Transcendence | - | 50,000g |

---

## Active Skills - Offense

### Power Strike
```javascript
{
  id: "skill_power_strike",
  name: "Power Strike",
  type: "active",
  category: "offense",

  unlockLevel: 1,
  unlockCost: 0,
  unlockChoice: null,

  energyCost: 15,
  cooldown: 8000,

  effectType: "nextAttackMultiplier",
  levels: {
    1: { multiplier: 3.0 },
    2: { multiplier: 3.5 },
    3: { multiplier: 4.0 },
    4: { multiplier: 4.5 },
    5: { multiplier: 5.0 }
  },
  upgradeCosts: [0, 100, 250, 500, 1000],

  icon: "⚔️",
  description: "Next attack deals {multiplier}x damage"
}
```

### Execute
```javascript
{
  id: "skill_execute",
  name: "Execute",
  type: "active",
  category: "offense",

  unlockLevel: 10,
  unlockCost: 0,
  unlockChoice: "skill_berserk_rage",
  altUnlockCost: 500,

  energyCost: 25,
  cooldown: 12000,

  effectType: "conditionalMultiplier",
  condition: "monsterHP < threshold",
  levels: {
    1: { multiplier: 5.0, threshold: 0.30 },
    2: { multiplier: 5.5, threshold: 0.32 },
    3: { multiplier: 6.0, threshold: 0.34 },
    4: { multiplier: 6.5, threshold: 0.36 },
    5: { multiplier: 7.0, threshold: 0.40 }
  },
  upgradeCosts: [0, 200, 500, 1000, 2500],

  icon: "💀",
  description: "Deal {multiplier}x damage to monsters below {threshold}% HP"
}
```

### Berserk Rage
```javascript
{
  id: "skill_berserk_rage",
  name: "Berserk Rage",
  type: "active",
  category: "offense",

  unlockLevel: 10,
  unlockCost: 0,
  unlockChoice: "skill_execute",
  altUnlockCost: 500,

  energyCost: 30,
  cooldown: 45000,

  effectType: "buff",
  levels: {
    1: { damageMultiplier: 2.0, damageTakenMultiplier: 2.0, duration: 15000 },
    2: { damageMultiplier: 2.2, damageTakenMultiplier: 1.8, duration: 15000 },
    3: { damageMultiplier: 2.4, damageTakenMultiplier: 1.6, duration: 15000 },
    4: { damageMultiplier: 2.6, damageTakenMultiplier: 1.4, duration: 15000 },
    5: { damageMultiplier: 3.0, damageTakenMultiplier: 1.0, duration: 15000 }
  },
  upgradeCosts: [0, 300, 750, 1500, 3500],

  icon: "🔥",
  description: "Deal {damageMultiplier}x damage, take {damageTakenMultiplier}x damage for {duration}s"
}
```

### Crit Surge
```javascript
{
  id: "skill_crit_surge",
  name: "Crit Surge",
  type: "active",
  category: "offense",

  unlockLevel: 15,
  unlockCost: 0,
  unlockChoice: "skill_perfect_strike",
  altUnlockCost: 750,

  energyCost: 25,
  cooldown: 30000,

  effectType: "buff",
  levels: {
    1: { critBonus: 0.50, duration: 10000 },
    2: { critBonus: 0.55, duration: 11000 },
    3: { critBonus: 0.60, duration: 12000 },
    4: { critBonus: 0.65, duration: 13000 },
    5: { critBonus: 0.75, duration: 15000 }
  },
  upgradeCosts: [0, 300, 750, 1500, 3500],

  icon: "⭐",
  description: "+{critBonus}% crit chance for {duration}s"
}
```

---

## Active Skills - Defense

### Heal
```javascript
{
  id: "skill_heal",
  name: "Heal",
  type: "active",
  category: "defense",

  unlockLevel: 5,
  unlockCost: 0,
  unlockChoice: "skill_iron_skin",
  altUnlockCost: 150,

  energyCost: 20,
  cooldown: 15000,

  effectType: "instantHeal",
  levels: {
    1: { healPercent: 0.25 },
    2: { healPercent: 0.30 },
    3: { healPercent: 0.35 },
    4: { healPercent: 0.40 },
    5: { healPercent: 0.50 }
  },
  upgradeCosts: [0, 150, 400, 800, 2000],

  icon: "💚",
  description: "Restore {healPercent}% of max HP"
}
```

### Iron Skin
```javascript
{
  id: "skill_iron_skin",
  name: "Iron Skin",
  type: "active",
  category: "defense",

  unlockLevel: 5,
  unlockCost: 0,
  unlockChoice: "skill_heal",
  altUnlockCost: 150,

  energyCost: 25,
  cooldown: 30000,

  effectType: "buff",
  levels: {
    1: { damageReduction: 0.50, duration: 10000 },
    2: { damageReduction: 0.55, duration: 11000 },
    3: { damageReduction: 0.60, duration: 12000 },
    4: { damageReduction: 0.65, duration: 13000 },
    5: { damageReduction: 0.75, duration: 15000 }
  },
  upgradeCosts: [0, 200, 500, 1000, 2500],

  icon: "🛡️",
  description: "Reduce damage taken by {damageReduction}% for {duration}s"
}
```

### Reflect
```javascript
{
  id: "skill_reflect",
  name: "Reflect",
  type: "active",
  category: "defense",

  unlockLevel: 20,
  unlockCost: 0,
  unlockChoice: "skill_time_warp",
  altUnlockCost: 1000,

  energyCost: 30,
  cooldown: 25000,

  effectType: "buff",
  levels: {
    1: { reflectMultiplier: 1.0, duration: 30000 },
    2: { reflectMultiplier: 1.25, duration: 30000 },
    3: { reflectMultiplier: 1.50, duration: 30000 },
    4: { reflectMultiplier: 1.75, duration: 30000 },
    5: { reflectMultiplier: 2.00, duration: 30000 }
  },
  upgradeCosts: [0, 500, 1000, 2500, 5000],

  icon: "🔄",
  description: "Reflect next attack at {reflectMultiplier}x damage"
}
```

### Undying
```javascript
{
  id: "skill_undying",
  name: "Undying",
  type: "active",
  category: "defense",

  unlockLevel: 40,
  unlockCost: 5000,
  unlockChoice: null,

  energyCost: 50,
  cooldown: 180000,

  effectType: "buff",
  levels: {
    1: { survivePercent: 0.01, duration: 30000 },
    2: { survivePercent: 0.05, duration: 30000 },
    3: { survivePercent: 0.10, duration: 30000 },
    4: { survivePercent: 0.15, duration: 30000 },
    5: { survivePercent: 0.25, duration: 30000 }
  },
  upgradeCosts: [5000, 2000, 5000, 10000, 25000],

  icon: "💫",
  description: "Survive fatal blow with {survivePercent}% HP"
}
```

---

## Active Skills - Utility

### Gold Rush
```javascript
{
  id: "skill_gold_rush",
  name: "Gold Rush",
  type: "active",
  category: "utility",

  unlockLevel: 8,
  unlockCost: 0,
  unlockChoice: "skill_xp_boost",
  altUnlockCost: 200,

  energyCost: 20,
  cooldown: 60000,

  effectType: "buff",
  levels: {
    1: { goldBonus: 1.00, duration: 30000 },
    2: { goldBonus: 1.20, duration: 32000 },
    3: { goldBonus: 1.40, duration: 34000 },
    4: { goldBonus: 1.60, duration: 36000 },
    5: { goldBonus: 2.00, duration: 45000 }
  },
  upgradeCosts: [0, 250, 600, 1200, 3000],

  icon: "🪙",
  description: "+{goldBonus}% gold for {duration}s"
}
```

### XP Boost
```javascript
{
  id: "skill_xp_boost",
  name: "XP Boost",
  type: "active",
  category: "utility",

  unlockLevel: 8,
  unlockCost: 0,
  unlockChoice: "skill_gold_rush",
  altUnlockCost: 200,

  energyCost: 20,
  cooldown: 60000,

  effectType: "buff",
  levels: {
    1: { xpBonus: 1.00, duration: 30000 },
    2: { xpBonus: 1.20, duration: 32000 },
    3: { xpBonus: 1.40, duration: 34000 },
    4: { xpBonus: 1.60, duration: 36000 },
    5: { xpBonus: 2.00, duration: 45000 }
  },
  upgradeCosts: [0, 250, 600, 1200, 3000],

  icon: "📈",
  description: "+{xpBonus}% XP for {duration}s"
}
```

### Perfect Strike
```javascript
{
  id: "skill_perfect_strike",
  name: "Perfect Strike",
  type: "active",
  category: "utility",

  unlockLevel: 15,
  unlockCost: 0,
  unlockChoice: "skill_crit_surge",
  altUnlockCost: 750,

  energyCost: 30,
  cooldown: 30000,

  effectType: "timingMode",
  levels: {
    1: { duration: 5000, goodMultiplier: 2.0, perfectMultiplier: 4.0, missMultiplier: 0.5, missDamage: 0.03 },
    2: { duration: 6000, goodMultiplier: 2.2, perfectMultiplier: 4.4, missMultiplier: 0.5, missDamage: 0.03 },
    3: { duration: 7000, goodMultiplier: 2.4, perfectMultiplier: 4.8, missMultiplier: 0.5, missDamage: 0.03 },
    4: { duration: 8000, goodMultiplier: 2.6, perfectMultiplier: 5.2, missMultiplier: 0.5, missDamage: 0.03 },
    5: { duration: 10000, goodMultiplier: 3.0, perfectMultiplier: 6.0, missMultiplier: 0.5, missDamage: 0.03 }
  },
  upgradeCosts: [0, 400, 1000, 2000, 5000],

  icon: "🎯",
  description: "Enter timing mode: Good={goodMultiplier}x, Perfect={perfectMultiplier}x for {duration}s"
}
```

### Time Warp
```javascript
{
  id: "skill_time_warp",
  name: "Time Warp",
  type: "active",
  category: "utility",

  unlockLevel: 20,
  unlockCost: 0,
  unlockChoice: "skill_reflect",
  altUnlockCost: 1000,

  energyCost: 40,
  cooldown: 90000,

  effectType: "monsterFreeze",
  levels: {
    1: { duration: 5000 },
    2: { duration: 6000 },
    3: { duration: 7000 },
    4: { duration: 8000 },
    5: { duration: 10000 }
  },
  upgradeCosts: [0, 500, 1200, 2500, 6000],

  icon: "⏳",
  description: "Freeze monster for {duration}s"
}
```

---

## Passive Skills

### Sharp Blades
```javascript
{
  id: "skill_sharp_blades",
  name: "Sharp Blades",
  type: "passive",
  category: "offense",

  unlockLevel: 3,
  unlockCost: 0,
  unlockChoice: "skill_killer_instinct",
  altUnlockCost: 100,

  stat: "damage",
  levels: {
    1: { bonus: 0.05 },
    2: { bonus: 0.10 },
    3: { bonus: 0.15 },
    4: { bonus: 0.20 },
    5: { bonus: 0.25 }
  },
  upgradeCosts: [0, 100, 250, 500, 1000],

  icon: "🗡️",
  description: "+{bonus}% damage"
}
```

### Killer Instinct
```javascript
{
  id: "skill_killer_instinct",
  name: "Killer Instinct",
  type: "passive",
  category: "offense",

  unlockLevel: 3,
  unlockCost: 0,
  unlockChoice: "skill_sharp_blades",
  altUnlockCost: 100,

  stat: "critChance",
  levels: {
    1: { bonus: 0.03 },
    2: { bonus: 0.06 },
    3: { bonus: 0.09 },
    4: { bonus: 0.12 },
    5: { bonus: 0.15 }
  },
  upgradeCosts: [0, 100, 250, 500, 1000],

  icon: "🎲",
  description: "+{bonus}% crit chance"
}
```

### Thick Skin
```javascript
{
  id: "skill_thick_skin",
  name: "Thick Skin",
  type: "passive",
  category: "defense",

  unlockLevel: 30,
  unlockCost: 0,
  unlockChoice: "skill_regeneration",
  altUnlockCost: 2000,

  stat: "maxHP",
  levels: {
    1: { bonus: 0.10 },
    2: { bonus: 0.20 },
    3: { bonus: 0.30 },
    4: { bonus: 0.40 },
    5: { bonus: 0.50 }
  },
  upgradeCosts: [0, 500, 1000, 2000, 4000],

  icon: "💪",
  description: "+{bonus}% max HP"
}
```

### Regeneration
```javascript
{
  id: "skill_regeneration",
  name: "Regeneration",
  type: "passive",
  category: "defense",

  unlockLevel: 30,
  unlockCost: 0,
  unlockChoice: "skill_thick_skin",
  altUnlockCost: 2000,

  stat: "hpRegen",
  levels: {
    1: { bonus: 0.005 },
    2: { bonus: 0.010 },
    3: { bonus: 0.015 },
    4: { bonus: 0.020 },
    5: { bonus: 0.030 }
  },
  upgradeCosts: [0, 500, 1000, 2000, 4000],

  icon: "💚",
  description: "+{bonus}% HP per second"
}
```

### Deep Pockets
```javascript
{
  id: "skill_deep_pockets",
  name: "Deep Pockets",
  type: "passive",
  category: "utility",

  unlockLevel: 25,
  unlockCost: 0,
  unlockChoice: "skill_fast_learner",
  altUnlockCost: 1500,

  stat: "goldFind",
  levels: {
    1: { bonus: 0.05 },
    2: { bonus: 0.10 },
    3: { bonus: 0.15 },
    4: { bonus: 0.20 },
    5: { bonus: 0.25 }
  },
  upgradeCosts: [0, 400, 800, 1600, 3200],

  icon: "💰",
  description: "+{bonus}% gold"
}
```

### Fast Learner
```javascript
{
  id: "skill_fast_learner",
  name: "Fast Learner",
  type: "passive",
  category: "utility",

  unlockLevel: 25,
  unlockCost: 0,
  unlockChoice: "skill_deep_pockets",
  altUnlockCost: 1500,

  stat: "xpBonus",
  levels: {
    1: { bonus: 0.05 },
    2: { bonus: 0.10 },
    3: { bonus: 0.15 },
    4: { bonus: 0.20 },
    5: { bonus: 0.25 }
  },
  upgradeCosts: [0, 400, 800, 1600, 3200],

  icon: "📚",
  description: "+{bonus}% XP"
}
```

### Energy Flow
```javascript
{
  id: "skill_energy_flow",
  name: "Energy Flow",
  type: "passive",
  category: "utility",

  unlockLevel: 50,
  unlockCost: 10000,
  unlockChoice: null,

  stat: "energyGain",
  levels: {
    1: { bonus: 0.10 },
    2: { bonus: 0.20 },
    3: { bonus: 0.30 },
    4: { bonus: 0.40 },
    5: { bonus: 0.50 }
  },
  upgradeCosts: [10000, 2000, 4000, 8000, 16000],

  icon: "⚡",
  description: "+{bonus}% Energy gain"
}
```

### Quick Reflexes
```javascript
{
  id: "skill_quick_reflexes",
  name: "Quick Reflexes",
  type: "passive",
  category: "defense",

  unlockLevel: 60,
  unlockCost: 15000,
  unlockChoice: null,

  stat: "warningTime",
  levels: {
    1: { bonus: 200 },
    2: { bonus: 400 },
    3: { bonus: 600 },
    4: { bonus: 800 },
    5: { bonus: 1000 }
  },
  upgradeCosts: [15000, 3000, 6000, 12000, 24000],

  icon: "👁️",
  description: "+{bonus}ms attack warning time"
}
```

---

## Late-Game Skills

### Soul Rend (Level 50)
```javascript
{
  id: "skill_soul_rend",
  name: "Soul Rend",
  type: "active",
  category: "offense",

  unlockLevel: 50,
  unlockCost: 10000,

  energyCost: 35,
  cooldown: 20000,

  effectType: "percentDamage",
  levels: {
    1: { percent: 0.10, minMultiplier: 1, maxMultiplier: 10 },
    2: { percent: 0.11, minMultiplier: 1, maxMultiplier: 10 },
    3: { percent: 0.12, minMultiplier: 1, maxMultiplier: 10 },
    4: { percent: 0.13, minMultiplier: 1, maxMultiplier: 10 },
    5: { percent: 0.15, minMultiplier: 1, maxMultiplier: 10 }
  },
  upgradeCosts: [10000, 5000, 12000, 25000, 50000],

  icon: "👻",
  description: "Deal {percent}% of monster's max HP as damage"
}
```

### Shield Breaker (Level 60)
```javascript
{
  id: "skill_shield_breaker",
  name: "Shield Breaker",
  type: "active",
  category: "offense",

  unlockLevel: 60,
  unlockCost: 15000,

  energyCost: 25,
  cooldown: 15000,

  effectType: "shieldBreak",
  levels: {
    1: { bonusDamage: 0.50, duration: 10000 },
    2: { bonusDamage: 0.55, duration: 11000 },
    3: { bonusDamage: 0.60, duration: 12000 },
    4: { bonusDamage: 0.65, duration: 13000 },
    5: { bonusDamage: 0.75, duration: 15000 }
  },
  upgradeCosts: [15000, 7500, 15000, 30000, 75000],

  icon: "💥",
  description: "Break shields, +{bonusDamage}% vs shielded for {duration}s"
}
```

### Void Touch (Level 75)
```javascript
{
  id: "skill_void_touch",
  name: "Void Touch",
  type: "passive",
  category: "offense",

  unlockLevel: 75,
  unlockCost: 25000,

  stat: "armorPen",
  levels: {
    1: { bonus: 0.05 },
    2: { bonus: 0.10 },
    3: { bonus: 0.15 },
    4: { bonus: 0.20 },
    5: { bonus: 0.25 }
  },
  upgradeCosts: [25000, 12500, 25000, 50000, 100000],

  icon: "🌀",
  description: "Ignore {bonus}% of monster armor"
}
```

### Transcendence (Level 90)
```javascript
{
  id: "skill_transcendence",
  name: "Transcendence",
  type: "active",
  category: "utility",

  unlockLevel: 90,
  unlockCost: 50000,

  energyCost: 100,
  cooldown: 300000,

  effectType: "buff",
  levels: {
    1: { invulnerable: true, damageBonus: 1.0, goldBonus: 1.0, xpBonus: 1.0, duration: 30000 },
    2: { invulnerable: true, damageBonus: 1.1, goldBonus: 1.1, xpBonus: 1.1, duration: 32000 },
    3: { invulnerable: true, damageBonus: 1.2, goldBonus: 1.2, xpBonus: 1.2, duration: 34000 },
    4: { invulnerable: true, damageBonus: 1.3, goldBonus: 1.3, xpBonus: 1.3, duration: 36000 },
    5: { invulnerable: true, damageBonus: 1.5, goldBonus: 1.5, xpBonus: 1.5, duration: 45000 }
  },
  upgradeCosts: [50000, 25000, 50000, 100000, 250000],

  icon: "✨",
  description: "Invulnerable, +{damageBonus}% damage/gold/XP for {duration}s"
}
```

---

## Build Examples

### Berserker Build
Active: Power Strike, Berserk Rage, Execute, Heal
Passive: Sharp Blades, Killer Instinct, Thick Skin

### Tank Build
Active: Heal, Iron Skin, Reflect, Undying
Passive: Thick Skin, Regeneration, Quick Reflexes

### Farmer Build
Active: Gold Rush, XP Boost, Time Warp, Heal
Passive: Deep Pockets, Fast Learner, Energy Flow

### Precision Build
Active: Perfect Strike, Crit Surge, Execute, Power Strike
Passive: Killer Instinct, Sharp Blades, Energy Flow

---

## Export

```javascript
export const SKILLS = { /* all skills */ };

export const SKILL_UNLOCK_SCHEDULE = [
  { level: 1, skills: ["skill_power_strike"] },
  { level: 3, choice: ["skill_sharp_blades", "skill_killer_instinct"] },
  { level: 5, choice: ["skill_heal", "skill_iron_skin"] },
  // ... etc
];

export const ACTIVE_SKILL_SLOTS = 4;
export const PASSIVE_SKILL_SLOTS = 3;
```

---

*Note: Auto Clicker has been removed. Active engagement is rewarded through the Energy system.*

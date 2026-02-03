# Skills Data

> Complete definitions for all skills in the game.
> Schema: `schemas/skill.schema.md`
> System: `systems/skill.system.md`

---

## Skill System Overview

- **Active Skills**: 4 slots, use Energy, have cooldowns
- **Passive Skills**: 3 slots, always-on bonuses
- **Mastery Points (MP)**: Limited resource (~54 base) to unlock and upgrade skills
- **All Skills Visible**: Buy any skill directly with MP (costs vary by tier)
- **Level Cap**: 5 base, up to 10 with Ascension
- **Full Reset on Ascension**: Each run is a fresh build

**Total Skills: 25** (16 active + 9 passive)

---

## Skill Tiers & Costs

Skills are organized by power tier. Higher tier = higher MP cost to unlock.

| Tier | Unlock Cost | Skills |
|------|-------------|--------|
| **Starter** | FREE | Power Strike |
| **Basic** | 3 MP | Heal, Iron Skin, Sharp Blades, Killer Instinct |
| **Utility** | 4 MP | Gold Rush, XP Boost, Reflect, Time Warp |
| **Combat** | 5 MP | Execute, Berserk Rage, Crit Surge, Perfect Strike |
| **Advanced** | 6 MP | Deep Pockets, Fast Learner, Thick Skin, Regeneration |
| **Elite** | 8 MP | Undying, Soul Rend, Shield Breaker, Energy Flow, Shield Wall |
| **Master** | 10 MP | Transcendence, Void Touch, Quick Reflexes |

### Upgrade Costs (All Skills)

| Level | MP Cost | Cumulative |
|-------|---------|------------|
| 2 | 1 MP | 1 MP |
| 3 | 2 MP | 3 MP |
| 4 | 3 MP | 6 MP |
| 5 | 4 MP | 10 MP |

**Total to max any skill: Unlock Cost + 10 MP**

---

## Active Skills - Offense

### Power Strike
```javascript
{
  id: "skill_power_strike",
  name: "Power Strike",
  type: "active",
  category: "offense",
  tier: "starter",

  unlockCost: 0,  // FREE - everyone starts with this

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
  tier: "combat",

  unlockCost: 5,

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
  tier: "combat",

  unlockCost: 5,

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
  tier: "combat",

  unlockCost: 5,

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

  icon: "⭐",
  description: "+{critBonus}% crit chance for {duration}s"
}
```

### Soul Rend (Elite)
```javascript
{
  id: "skill_soul_rend",
  name: "Soul Rend",
  type: "active",
  category: "offense",
  tier: "elite",

  unlockCost: 8,

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

  icon: "👻",
  description: "Deal {percent}% of monster's max HP as damage"
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
  tier: "basic",

  unlockCost: 3,

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
  tier: "basic",

  unlockCost: 3,

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
  tier: "utility",

  unlockCost: 4,

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

  icon: "🔄",
  description: "Reflect next attack at {reflectMultiplier}x damage"
}
```

### Undying (Elite)
```javascript
{
  id: "skill_undying",
  name: "Undying",
  type: "active",
  category: "defense",
  tier: "elite",

  unlockCost: 8,

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

  icon: "💫",
  description: "Survive fatal blow with {survivePercent}% HP"
}
```

### Shield Wall (Elite)
```javascript
{
  id: "skill_shield_wall",
  name: "Shield Wall",
  type: "active",
  category: "defense",
  tier: "elite",

  unlockCost: 8,

  energyCost: 40,
  cooldown: 60000,

  effectType: "grantShield",
  levels: {
    1: { shieldPercent: 0.20, duration: 20000 },
    2: { shieldPercent: 0.22, duration: 22000 },
    3: { shieldPercent: 0.25, duration: 25000 },
    4: { shieldPercent: 0.28, duration: 28000 },
    5: { shieldPercent: 0.30, duration: 30000 }
  },

  icon: "🔷",
  description: "Gain a shield equal to {shieldPercent}% of max HP for {duration}s"
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
  tier: "utility",

  unlockCost: 4,

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
  tier: "utility",

  unlockCost: 4,

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
  tier: "combat",

  unlockCost: 5,

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
  tier: "utility",

  unlockCost: 4,

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

  icon: "⏳",
  description: "Freeze monster for {duration}s"
}
```

### Shield Breaker (Elite)
```javascript
{
  id: "skill_shield_breaker",
  name: "Shield Breaker",
  type: "active",
  category: "utility",
  tier: "elite",

  unlockCost: 8,

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

  icon: "💥",
  description: "Break shields, +{bonusDamage}% vs shielded for {duration}s"
}
```

### Transcendence (Master)
```javascript
{
  id: "skill_transcendence",
  name: "Transcendence",
  type: "active",
  category: "utility",
  tier: "master",

  unlockCost: 10,

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

  icon: "✨",
  description: "Invulnerable, +{damageBonus}% damage/gold/XP for {duration}s"
}
```

---

## Passive Skills - Offense

### Sharp Blades
```javascript
{
  id: "skill_sharp_blades",
  name: "Sharp Blades",
  type: "passive",
  category: "offense",
  tier: "basic",

  unlockCost: 3,

  stat: "damage",
  levels: {
    1: { bonus: 0.05 },
    2: { bonus: 0.10 },
    3: { bonus: 0.15 },
    4: { bonus: 0.20 },
    5: { bonus: 0.25 }
  },

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
  tier: "basic",

  unlockCost: 3,

  stat: "critChance",
  levels: {
    1: { bonus: 0.03 },
    2: { bonus: 0.06 },
    3: { bonus: 0.09 },
    4: { bonus: 0.12 },
    5: { bonus: 0.15 }
  },

  icon: "🎲",
  description: "+{bonus}% crit chance"
}
```

### Void Touch (Master)
```javascript
{
  id: "skill_void_touch",
  name: "Void Touch",
  type: "passive",
  category: "offense",
  tier: "master",

  unlockCost: 10,

  stat: "armorPen",
  levels: {
    1: { bonus: 10 },
    2: { bonus: 20 },
    3: { bonus: 30 },
    4: { bonus: 40 },
    5: { bonus: 50 }
  },

  icon: "🌀",
  description: "Ignore {bonus} points of monster armor"
}
```

---

## Passive Skills - Defense

### Thick Skin
```javascript
{
  id: "skill_thick_skin",
  name: "Thick Skin",
  type: "passive",
  category: "defense",
  tier: "advanced",

  unlockCost: 6,

  stat: "maxHP",
  levels: {
    1: { bonus: 0.10 },
    2: { bonus: 0.20 },
    3: { bonus: 0.30 },
    4: { bonus: 0.40 },
    5: { bonus: 0.50 }
  },

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
  tier: "advanced",

  unlockCost: 6,

  stat: "hpRegen",
  levels: {
    1: { bonus: 0.005 },
    2: { bonus: 0.010 },
    3: { bonus: 0.015 },
    4: { bonus: 0.020 },
    5: { bonus: 0.030 }
  },

  icon: "💚",
  description: "+{bonus}% HP per second"
}
```

### Quick Reflexes (Master)
```javascript
{
  id: "skill_quick_reflexes",
  name: "Quick Reflexes",
  type: "passive",
  category: "defense",
  tier: "master",

  unlockCost: 10,

  stat: "warningTime",
  levels: {
    1: { bonus: 200 },
    2: { bonus: 400 },
    3: { bonus: 600 },
    4: { bonus: 800 },
    5: { bonus: 1000 }
  },

  icon: "👁️",
  description: "+{bonus}ms attack warning time"
}
```

---

## Passive Skills - Utility

### Deep Pockets
```javascript
{
  id: "skill_deep_pockets",
  name: "Deep Pockets",
  type: "passive",
  category: "utility",
  tier: "advanced",

  unlockCost: 6,

  stat: "goldFind",
  levels: {
    1: { bonus: 0.05 },
    2: { bonus: 0.10 },
    3: { bonus: 0.15 },
    4: { bonus: 0.20 },
    5: { bonus: 0.25 }
  },

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
  tier: "advanced",

  unlockCost: 6,

  stat: "xpBonus",
  levels: {
    1: { bonus: 0.05 },
    2: { bonus: 0.10 },
    3: { bonus: 0.15 },
    4: { bonus: 0.20 },
    5: { bonus: 0.25 }
  },

  icon: "📚",
  description: "+{bonus}% XP"
}
```

### Energy Flow (Elite)
```javascript
{
  id: "skill_energy_flow",
  name: "Energy Flow",
  type: "passive",
  category: "utility",
  tier: "elite",

  unlockCost: 8,

  stat: "energyGain",
  levels: {
    1: { bonus: 0.10 },
    2: { bonus: 0.20 },
    3: { bonus: 0.30 },
    4: { bonus: 0.40 },
    5: { bonus: 0.50 }
  },

  icon: "⚡",
  description: "+{bonus}% Energy gain"
}
```

---

## Skill Summary Tables

### Active Skills (16 Total)

| Skill | Tier | Category | Energy | Cooldown | Key Effect |
|-------|------|----------|--------|----------|------------|
| Power Strike | Starter | Offense | 15 | 8s | 3x-5x next attack |
| Execute | Combat | Offense | 25 | 12s | 5x-7x if <30-40% HP |
| Berserk Rage | Combat | Offense | 30 | 45s | 2x-3x damage (risky) |
| Crit Surge | Combat | Offense | 25 | 30s | +50-75% crit for 10-15s |
| Soul Rend | Elite | Offense | 35 | 20s | 10-15% monster max HP |
| Heal | Basic | Defense | 20 | 15s | 25-50% HP restore |
| Iron Skin | Basic | Defense | 25 | 30s | 50-75% DR for 10-15s |
| Reflect | Utility | Defense | 30 | 25s | Reflect at 100-200% |
| Undying | Elite | Defense | 50 | 180s | Survive at 1-25% HP |
| Shield Wall | Elite | Defense | 40 | 60s | 20-30% HP as shield |
| Gold Rush | Utility | Utility | 20 | 60s | +100-200% gold 30-45s |
| XP Boost | Utility | Utility | 20 | 60s | +100-200% XP 30-45s |
| Perfect Strike | Combat | Utility | 30 | 30s | Timing mode 2-6x |
| Time Warp | Utility | Utility | 40 | 90s | Freeze 5-10s |
| Shield Breaker | Elite | Utility | 25 | 15s | Break shields +50-75% |
| Transcendence | Master | Utility | 100 | 300s | Invuln +100-150% all |

### Passive Skills (9 Total)

| Skill | Tier | Category | Per Level | Max Bonus |
|-------|------|----------|-----------|-----------|
| Sharp Blades | Basic | Offense | +5% damage | +25% |
| Killer Instinct | Basic | Offense | +3% crit | +15% |
| Void Touch | Master | Offense | +10 armor pen | +50 |
| Thick Skin | Advanced | Defense | +10% max HP | +50% |
| Regeneration | Advanced | Defense | +0.5% HP/sec | +3% |
| Quick Reflexes | Master | Defense | +200ms warning | +1000ms |
| Deep Pockets | Advanced | Utility | +5% gold | +25% |
| Fast Learner | Advanced | Utility | +5% XP | +25% |
| Energy Flow | Elite | Utility | +10% Energy | +50% |

---

## Mastery Points Budget

### Earning MP (~54 Base)

| Source | MP |
|--------|-----|
| Level 5 | 3 |
| Level 10 | 3 |
| Level 15 | 3 |
| Level 20 | 3 |
| Level 30 | 4 |
| Level 40 | 4 |
| Level 50 | 5 |
| Level 60 | 5 |
| Level 75 | 5 |
| Level 90 | 5 |
| 7 Bosses (2 each) | 14 |
| **Total** | **54** |

### Ascension Bonus

+3 MP starting bonus per Ascension level.

---

## Example Builds

### "Glass Cannon" (54 MP)

| Skill | Unlock | Upgrades | Total |
|-------|--------|----------|-------|
| Power Strike | 0 | Lv5 (10) | 10 |
| Execute | 5 | Lv5 (10) | 15 |
| Berserk Rage | 5 | Lv3 (3) | 8 |
| Sharp Blades | 3 | Lv5 (10) | 13 |
| Killer Instinct | 3 | Lv2 (1) | 4 |
| **Total** | | | **50** |

*4 MP remaining for flexibility*

### "Immortal Tank" (54 MP)

| Skill | Unlock | Upgrades | Total |
|-------|--------|----------|-------|
| Power Strike | 0 | Lv2 (1) | 1 |
| Heal | 3 | Lv5 (10) | 13 |
| Iron Skin | 3 | Lv4 (6) | 9 |
| Shield Wall | 8 | Lv2 (1) | 9 |
| Thick Skin | 6 | Lv5 (10) | 16 |
| Regeneration | 6 | Lv1 (0) | 6 |
| **Total** | | | **54** |

### "Gold Farmer" (54 MP)

| Skill | Unlock | Upgrades | Total |
|-------|--------|----------|-------|
| Power Strike | 0 | Lv3 (3) | 3 |
| Gold Rush | 4 | Lv5 (10) | 14 |
| Deep Pockets | 6 | Lv5 (10) | 16 |
| Heal | 3 | Lv3 (3) | 6 |
| Sharp Blades | 3 | Lv3 (3) | 6 |
| Fast Learner | 6 | Lv2 (1) | 7 |
| **Total** | | | **52** |

---

## Export

```javascript
export const SKILLS = {
  // Active - Offense
  skill_power_strike: { /* ... */ },
  skill_execute: { /* ... */ },
  skill_berserk_rage: { /* ... */ },
  skill_crit_surge: { /* ... */ },
  skill_soul_rend: { /* ... */ },

  // Active - Defense
  skill_heal: { /* ... */ },
  skill_iron_skin: { /* ... */ },
  skill_reflect: { /* ... */ },
  skill_undying: { /* ... */ },
  skill_shield_wall: { /* ... */ },

  // Active - Utility
  skill_gold_rush: { /* ... */ },
  skill_xp_boost: { /* ... */ },
  skill_perfect_strike: { /* ... */ },
  skill_time_warp: { /* ... */ },
  skill_shield_breaker: { /* ... */ },
  skill_transcendence: { /* ... */ },

  // Passive - Offense
  skill_sharp_blades: { /* ... */ },
  skill_killer_instinct: { /* ... */ },
  skill_void_touch: { /* ... */ },

  // Passive - Defense
  skill_thick_skin: { /* ... */ },
  skill_regeneration: { /* ... */ },
  skill_quick_reflexes: { /* ... */ },

  // Passive - Utility
  skill_deep_pockets: { /* ... */ },
  skill_fast_learner: { /* ... */ },
  skill_energy_flow: { /* ... */ }
};

export const SKILL_TIERS = {
  starter: { cost: 0, skills: ['skill_power_strike'] },
  basic: { cost: 3, skills: ['skill_heal', 'skill_iron_skin', 'skill_sharp_blades', 'skill_killer_instinct'] },
  utility: { cost: 4, skills: ['skill_gold_rush', 'skill_xp_boost', 'skill_reflect', 'skill_time_warp'] },
  combat: { cost: 5, skills: ['skill_execute', 'skill_berserk_rage', 'skill_crit_surge', 'skill_perfect_strike'] },
  advanced: { cost: 6, skills: ['skill_deep_pockets', 'skill_fast_learner', 'skill_thick_skin', 'skill_regeneration'] },
  elite: { cost: 8, skills: ['skill_undying', 'skill_soul_rend', 'skill_shield_breaker', 'skill_energy_flow', 'skill_shield_wall'] },
  master: { cost: 10, skills: ['skill_transcendence', 'skill_void_touch', 'skill_quick_reflexes'] }
};

export const UPGRADE_COSTS = [1, 2, 3, 4];  // Cost to reach levels 2, 3, 4, 5

export const ACTIVE_SKILL_SLOTS = 4;
export const PASSIVE_SKILL_SLOTS = 3;
export const TOTAL_SKILLS = 25;
```

---

*Skills are purchased with Mastery Points. Every run is a fresh build. Choose wisely!*

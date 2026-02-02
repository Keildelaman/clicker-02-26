# Skill Data

> Complete definitions for all passive and active skills.
> Schema: `schemas/skill.schema.md`

---

## Passive Skills

### Sharp Blades (Offense)
```javascript
{
  id: "skill_passive_sharp_blades",
  name: "Sharp Blades",
  description: "Increases attack power by {value}%",
  type: "passive",
  category: "offense",
  unlockLevel: 1,
  unlockCost: 0,
  maxLevel: 10,
  upgradeCosts: [50, 100, 200, 400, 800, 1500, 3000, 6000, 12000],
  effect: {
    type: "stat_bonus",
    stat: "attack",
    baseValue: 5,
    perLevel: 5
  },
  emoji: "⚔️"
}
```

**Level Progression:**

| Level | Effect | Upgrade Cost | Total Investment |
|-------|--------|--------------|------------------|
| 1 | +5% attack | Free | 0 |
| 2 | +10% attack | 50 | 50 |
| 3 | +15% attack | 100 | 150 |
| 4 | +20% attack | 200 | 350 |
| 5 | +25% attack | 400 | 750 |
| 6 | +30% attack | 800 | 1,550 |
| 7 | +35% attack | 1,500 | 3,050 |
| 8 | +40% attack | 3,000 | 6,050 |
| 9 | +45% attack | 6,000 | 12,050 |
| 10 | +50% attack | 12,000 | 24,050 |

---

### Lucky Strikes (Offense)
```javascript
{
  id: "skill_passive_lucky_strikes",
  name: "Lucky Strikes",
  description: "Increases critical hit chance by {value}%",
  type: "passive",
  category: "offense",
  unlockLevel: 5,
  unlockCost: 100,
  maxLevel: 10,
  upgradeCosts: [150, 300, 500, 900, 1600, 2800, 5000, 9000, 16000],
  effect: {
    type: "stat_bonus",
    stat: "critChance",
    baseValue: 2,
    perLevel: 2
  },
  emoji: "🍀"
}
```

**Level Progression:**

| Level | Effect | Upgrade Cost | Total Investment |
|-------|--------|--------------|------------------|
| 1 | +2% crit chance | 100 (unlock) | 100 |
| 2 | +4% crit chance | 150 | 250 |
| 3 | +6% crit chance | 300 | 550 |
| 4 | +8% crit chance | 500 | 1,050 |
| 5 | +10% crit chance | 900 | 1,950 |
| 6 | +12% crit chance | 1,600 | 3,550 |
| 7 | +14% crit chance | 2,800 | 6,350 |
| 8 | +16% crit chance | 5,000 | 11,350 |
| 9 | +18% crit chance | 9,000 | 20,350 |
| 10 | +20% crit chance | 16,000 | 36,350 |

---

### Devastating Blows (Offense)
```javascript
{
  id: "skill_passive_devastating_blows",
  name: "Devastating Blows",
  description: "Increases critical hit damage by {value}%",
  type: "passive",
  category: "offense",
  unlockLevel: 12,
  unlockCost: 250,
  maxLevel: 10,
  upgradeCosts: [400, 700, 1200, 2000, 3500, 6000, 10000, 18000, 32000],
  effect: {
    type: "stat_bonus",
    stat: "critDamage",
    baseValue: 10,
    perLevel: 10
  },
  emoji: "💥"
}
```

**Level Progression:**

| Level | Effect | Upgrade Cost | Total Investment |
|-------|--------|--------------|------------------|
| 1 | +10% crit damage | 250 (unlock) | 250 |
| 2 | +20% crit damage | 400 | 650 |
| 3 | +30% crit damage | 700 | 1,350 |
| 4 | +40% crit damage | 1,200 | 2,550 |
| 5 | +50% crit damage | 2,000 | 4,550 |
| 6 | +60% crit damage | 3,500 | 8,050 |
| 7 | +70% crit damage | 6,000 | 14,050 |
| 8 | +80% crit damage | 10,000 | 24,050 |
| 9 | +90% crit damage | 18,000 | 42,050 |
| 10 | +100% crit damage | 32,000 | 74,050 |

---

### Deep Pockets (Utility)
```javascript
{
  id: "skill_passive_deep_pockets",
  name: "Deep Pockets",
  description: "Increases gold find by {value}%",
  type: "passive",
  category: "utility",
  unlockLevel: 3,
  unlockCost: 75,
  maxLevel: 10,
  upgradeCosts: [100, 200, 350, 600, 1000, 1800, 3200, 5600, 10000],
  effect: {
    type: "stat_bonus",
    stat: "goldFind",
    baseValue: 5,
    perLevel: 5
  },
  emoji: "💰"
}
```

**Level Progression:**

| Level | Effect | Upgrade Cost | Total Investment |
|-------|--------|--------------|------------------|
| 1 | +5% gold find | 75 (unlock) | 75 |
| 2 | +10% gold find | 100 | 175 |
| 3 | +15% gold find | 200 | 375 |
| 4 | +20% gold find | 350 | 725 |
| 5 | +25% gold find | 600 | 1,325 |
| 6 | +30% gold find | 1,000 | 2,325 |
| 7 | +35% gold find | 1,800 | 4,125 |
| 8 | +40% gold find | 3,200 | 7,325 |
| 9 | +45% gold find | 5,600 | 12,925 |
| 10 | +50% gold find | 10,000 | 22,925 |

---

### Fast Learner (Utility)
```javascript
{
  id: "skill_passive_fast_learner",
  name: "Fast Learner",
  description: "Increases XP gain by {value}%",
  type: "passive",
  category: "utility",
  unlockLevel: 3,
  unlockCost: 75,
  maxLevel: 10,
  upgradeCosts: [100, 200, 350, 600, 1000, 1800, 3200, 5600, 10000],
  effect: {
    type: "stat_bonus",
    stat: "xpBonus",
    baseValue: 5,
    perLevel: 5
  },
  emoji: "📚"
}
```

**Level Progression:**

| Level | Effect | Upgrade Cost | Total Investment |
|-------|--------|--------------|------------------|
| 1 | +5% XP | 75 (unlock) | 75 |
| 2 | +10% XP | 100 | 175 |
| 3 | +15% XP | 200 | 375 |
| 4 | +20% XP | 350 | 725 |
| 5 | +25% XP | 600 | 1,325 |
| 6 | +30% XP | 1,000 | 2,325 |
| 7 | +35% XP | 1,800 | 4,125 |
| 8 | +40% XP | 3,200 | 7,325 |
| 9 | +45% XP | 5,600 | 12,925 |
| 10 | +50% XP | 10,000 | 22,925 |

---

### Auto Clicker (Automation)
```javascript
{
  id: "skill_passive_auto_clicker",
  name: "Auto Clicker",
  description: "Automatically attacks {value} times per second",
  type: "passive",
  category: "automation",
  unlockLevel: 10,
  unlockCost: 500,
  maxLevel: 10,
  upgradeCosts: [750, 1500, 3000, 6000, 12000, 24000, 48000, 96000, 200000],
  effect: {
    type: "stat_bonus",
    stat: "autoAttack",
    baseValue: 1,
    perLevel: 1
  },
  emoji: "⚙️"
}
```

**Level Progression:**

| Level | Effect | Upgrade Cost | Total Investment |
|-------|--------|--------------|------------------|
| 1 | 1 click/sec | 500 (unlock) | 500 |
| 2 | 2 clicks/sec | 750 | 1,250 |
| 3 | 3 clicks/sec | 1,500 | 2,750 |
| 4 | 4 clicks/sec | 3,000 | 5,750 |
| 5 | 5 clicks/sec | 6,000 | 11,750 |
| 6 | 6 clicks/sec | 12,000 | 23,750 |
| 7 | 7 clicks/sec | 24,000 | 47,750 |
| 8 | 8 clicks/sec | 48,000 | 95,750 |
| 9 | 9 clicks/sec | 96,000 | 191,750 |
| 10 | 10 clicks/sec | 200,000 | 391,750 |

---

## Active Skills

### Power Strike (Offense)
```javascript
{
  id: "skill_active_power_strike",
  name: "Power Strike",
  description: "Your next attack deals {value}x damage",
  type: "active",
  category: "offense",
  unlockLevel: 2,
  unlockCost: 50,
  maxLevel: 5,
  upgradeCosts: [200, 500, 1200, 3000],
  effect: {
    type: "next_attack",
    baseValue: 5,
    perLevel: 2
  },
  cooldown: 30000,
  emoji: "💥"
}
```

**Level Progression:**

| Level | Damage Multiplier | Cooldown | Upgrade Cost | Total |
|-------|-------------------|----------|--------------|-------|
| 1 | 5x | 30s | 50 (unlock) | 50 |
| 2 | 7x | 30s | 200 | 250 |
| 3 | 9x | 30s | 500 | 750 |
| 4 | 11x | 30s | 1,200 | 1,950 |
| 5 | 13x | 30s | 3,000 | 4,950 |

---

### Gold Rush (Utility)
```javascript
{
  id: "skill_active_gold_rush",
  name: "Gold Rush",
  description: "Double gold drops for {value} seconds",
  type: "active",
  category: "utility",
  unlockLevel: 8,
  unlockCost: 300,
  maxLevel: 5,
  upgradeCosts: [600, 1200, 2400, 5000],
  effect: {
    type: "buff",
    stat: "goldFind",
    baseValue: 1.0,
    perLevel: 0,
    duration: 10000
  },
  cooldown: 60000,
  emoji: "🪙"
}
```

**Level Progression:**

| Level | Duration | Gold Boost | Cooldown | Cost | Total |
|-------|----------|------------|----------|------|-------|
| 1 | 10s | +100% | 60s | 300 | 300 |
| 2 | 12s | +100% | 60s | 600 | 900 |
| 3 | 14s | +100% | 60s | 1,200 | 2,100 |
| 4 | 16s | +100% | 60s | 2,400 | 4,500 |
| 5 | 18s | +100% | 60s | 5,000 | 9,500 |

*Note: Duration increases by 2s per level (10 + 2 × (level-1))*

---

### Critical Frenzy (Offense)
```javascript
{
  id: "skill_active_critical_frenzy",
  name: "Critical Frenzy",
  description: "100% critical hit chance for {value} seconds",
  type: "active",
  category: "offense",
  unlockLevel: 15,
  unlockCost: 800,
  maxLevel: 5,
  upgradeCosts: [1500, 3000, 6000, 12000],
  effect: {
    type: "buff",
    stat: "critChance",
    baseValue: 1.0,
    perLevel: 0,
    duration: 5000
  },
  cooldown: 90000,
  emoji: "⚡"
}
```

**Level Progression:**

| Level | Duration | Crit Chance | Cooldown | Cost | Total |
|-------|----------|-------------|----------|------|-------|
| 1 | 5s | 100% | 90s | 800 | 800 |
| 2 | 6s | 100% | 90s | 1,500 | 2,300 |
| 3 | 7s | 100% | 90s | 3,000 | 5,300 |
| 4 | 8s | 100% | 90s | 6,000 | 11,300 |
| 5 | 9s | 100% | 90s | 12,000 | 23,300 |

*Note: Duration increases by 1s per level (5 + (level-1))*

---

### Monster Slayer (Offense)
```javascript
{
  id: "skill_active_monster_slayer",
  name: "Monster Slayer",
  description: "Instantly kill the current monster (not bosses)",
  type: "active",
  category: "offense",
  unlockLevel: 20,
  unlockCost: 2000,
  maxLevel: 1,
  upgradeCosts: [],
  effect: {
    type: "instant",
    baseValue: 1,
    perLevel: 0
  },
  cooldown: 120000,
  emoji: "☠️"
}
```

**Details:**
- Single level skill (no upgrades)
- Instantly kills current non-boss monster
- Full XP and gold rewards
- Does NOT work on bosses
- 2-minute cooldown

---

### XP Surge (Utility)
```javascript
{
  id: "skill_active_xp_surge",
  name: "XP Surge",
  description: "Double XP gain for {value} seconds",
  type: "active",
  category: "utility",
  unlockLevel: 25,
  unlockCost: 1500,
  maxLevel: 5,
  upgradeCosts: [3000, 6000, 12000, 25000],
  effect: {
    type: "buff",
    stat: "xpBonus",
    baseValue: 1.0,
    perLevel: 0,
    duration: 15000
  },
  cooldown: 120000,
  emoji: "✨"
}
```

**Level Progression:**

| Level | Duration | XP Boost | Cooldown | Cost | Total |
|-------|----------|----------|----------|------|-------|
| 1 | 15s | +100% | 120s | 1,500 | 1,500 |
| 2 | 18s | +100% | 120s | 3,000 | 4,500 |
| 3 | 21s | +100% | 120s | 6,000 | 10,500 |
| 4 | 24s | +100% | 120s | 12,000 | 22,500 |
| 5 | 27s | +100% | 120s | 25,000 | 47,500 |

*Note: Duration increases by 3s per level*

---

## Skill Summary

### Passive Skills

| Skill | Category | Unlock Lv | Unlock Cost | Max Lv | Max Effect | Total Cost |
|-------|----------|-----------|-------------|--------|------------|------------|
| Sharp Blades | Offense | 1 | Free | 10 | +50% ATK | 24,050 |
| Lucky Strikes | Offense | 5 | 100 | 10 | +20% Crit | 36,350 |
| Devastating Blows | Offense | 12 | 250 | 10 | +100% Crit DMG | 74,050 |
| Deep Pockets | Utility | 3 | 75 | 10 | +50% Gold | 22,925 |
| Fast Learner | Utility | 3 | 75 | 10 | +50% XP | 22,925 |
| Auto Clicker | Auto | 10 | 500 | 10 | 10 CPS | 391,750 |

**Total Passive Investment: ~572,050 gold**

### Active Skills

| Skill | Category | Unlock Lv | Unlock Cost | Max Lv | Cooldown | Total Cost |
|-------|----------|-----------|-------------|--------|----------|------------|
| Power Strike | Offense | 2 | 50 | 5 | 30s | 4,950 |
| Gold Rush | Utility | 8 | 300 | 5 | 60s | 9,500 |
| Critical Frenzy | Offense | 15 | 800 | 5 | 90s | 23,300 |
| Monster Slayer | Offense | 20 | 2,000 | 1 | 120s | 2,000 |
| XP Surge | Utility | 25 | 1,500 | 5 | 120s | 47,500 |

**Total Active Investment: ~87,250 gold**

---

## Skill Unlock Timeline

| Player Level | Skills Available |
|--------------|-----------------|
| 1 | Sharp Blades |
| 2 | Power Strike |
| 3 | Deep Pockets, Fast Learner |
| 5 | Lucky Strikes |
| 8 | Gold Rush |
| 10 | Auto Clicker |
| 12 | Devastating Blows |
| 15 | Critical Frenzy |
| 20 | Monster Slayer |
| 25 | XP Surge |

---

## Recommended Build Orders

### Speed Leveling Build
1. Sharp Blades (free, +damage)
2. Fast Learner (75g, +XP)
3. Power Strike (50g, burst damage)
4. Auto Clicker (500g, automation)
5. XP Surge (1500g, XP boost)

### Gold Farming Build
1. Sharp Blades (free)
2. Deep Pockets (75g, +gold)
3. Gold Rush (300g, gold burst)
4. Auto Clicker (500g, automation)
5. Lucky Strikes (100g, more crits = faster kills)

### Boss Killer Build
1. Sharp Blades (free)
2. Power Strike (50g, 5x damage)
3. Lucky Strikes (100g, crits)
4. Devastating Blows (250g, crit damage)
5. Critical Frenzy (800g, 100% crit window)

---

## Implementation Export

```javascript
export const SKILLS = {
  // Passive
  skill_passive_sharp_blades: { /* ... */ },
  skill_passive_lucky_strikes: { /* ... */ },
  skill_passive_devastating_blows: { /* ... */ },
  skill_passive_deep_pockets: { /* ... */ },
  skill_passive_fast_learner: { /* ... */ },
  skill_passive_auto_clicker: { /* ... */ },

  // Active
  skill_active_power_strike: { /* ... */ },
  skill_active_gold_rush: { /* ... */ },
  skill_active_critical_frenzy: { /* ... */ },
  skill_active_monster_slayer: { /* ... */ },
  skill_active_xp_surge: { /* ... */ }
};

export const SKILL_CATEGORIES = {
  offense: ["skill_passive_sharp_blades", "skill_passive_lucky_strikes", "skill_passive_devastating_blows", "skill_active_power_strike", "skill_active_critical_frenzy", "skill_active_monster_slayer"],
  utility: ["skill_passive_deep_pockets", "skill_passive_fast_learner", "skill_active_gold_rush", "skill_active_xp_surge"],
  automation: ["skill_passive_auto_clicker"]
};
```

---

*References: skill.schema.md, player.schema.md, combat.system.md*

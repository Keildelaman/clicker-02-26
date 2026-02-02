# Skill Schema

> Defines the structure for all player skills and abilities.

## Overview

Skills are abilities players unlock and upgrade. There are two types:
- **Active Skills**: Triggered manually, have cooldowns
- **Passive Skills**: Always active, upgrade for stronger effects

---

## Complete Schema

```typescript
interface Skill {
  // === Identity ===
  id: string;                   // Unique identifier
  name: string;                 // Display name
  description: string;          // Effect description (use {value} for dynamic)

  // === Classification ===
  type: "active" | "passive";
  category: SkillCategory;

  // === Unlock ===
  unlockLevel: number;          // Player level required to see/unlock
  unlockCost: number;           // Gold cost to unlock (level 0 → 1)

  // === Upgrade ===
  maxLevel: number;             // Maximum skill level
  upgradeCosts: number[];       // Gold cost per level [1→2, 2→3, ...]

  // === Effect ===
  effect: SkillEffect;

  // === Cooldown (active only) ===
  cooldown?: number;            // Milliseconds between uses

  // === Visuals ===
  emoji: string;
}

type SkillCategory =
  | "offense"      // Damage-related
  | "utility"      // Gold, XP bonuses
  | "automation";  // Auto-attack

interface SkillEffect {
  type: EffectType;
  stat?: string;                // Stat affected (for stat_bonus)
  baseValue: number;            // Value at level 1
  perLevel: number;             // Additional value per level
  duration?: number;            // Effect duration in ms (active skills)
}

type EffectType =
  | "stat_bonus"          // Permanent stat increase
  | "next_attack"         // Modifies next attack
  | "buff"                // Temporary stat boost
  | "instant";            // Immediate effect (like instant kill)
```

---

## Field Details

### Identity Fields

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| `id` | string | Unique, follows convention | `"skill_passive_sharp_blades"` |
| `name` | string | 1-30 characters | `"Sharp Blades"` |
| `description` | string | Use `{value}` placeholder | `"Increases attack by {value}%"` |

**Description Placeholder:**
The `{value}` placeholder is replaced with the calculated effect value:
```javascript
// At level 3, baseValue=5, perLevel=3
// value = 5 + (3 * 2) = 11
// "Increases attack by {value}%" → "Increases attack by 11%"
```

### Classification Fields

| Field | Type | Options | Notes |
|-------|------|---------|-------|
| `type` | string | `active`, `passive` | Determines behavior |
| `category` | SkillCategory | See below | For UI grouping |

**Skill Categories:**

| Category | Description | UI Tab |
|----------|-------------|--------|
| `offense` | Damage, crits | ⚔️ Offense |
| `utility` | Gold, XP | 💰 Utility |
| `automation` | Auto-attack | ⚙️ Auto |

### Unlock Fields

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `unlockLevel` | number | 1-100 | When skill appears in UI |
| `unlockCost` | number | 0+ | Gold to unlock (0 = free) |

**Unlock Flow:**
1. Player reaches `unlockLevel`
2. Skill appears in skill tree (locked state)
3. Player pays `unlockCost` gold
4. Skill becomes level 1, effect activates

### Upgrade Fields

| Field | Type | Notes |
|-------|------|-------|
| `maxLevel` | number | Typical: 5-10 for passive, 1-3 for active |
| `upgradeCosts` | number[] | Array length = maxLevel - 1 |

**Upgrade Cost Example:**
```javascript
{
  maxLevel: 5,
  upgradeCosts: [100, 250, 500, 1000]
  // Level 1→2: 100 gold
  // Level 2→3: 250 gold
  // Level 3→4: 500 gold
  // Level 4→5: 1000 gold
}
```

### Effect Object

```typescript
effect: {
  type: EffectType,
  stat?: string,           // For stat_bonus
  baseValue: number,       // Value at level 1
  perLevel: number,        // Increase per level
  duration?: number        // For buffs (ms)
}
```

**Effect Calculation:**
```javascript
function getEffectValue(skill, level) {
  return skill.effect.baseValue + (skill.effect.perLevel * (level - 1));
}
```

### Effect Types

#### `stat_bonus` - Permanent Stat Increase
```javascript
{
  type: "stat_bonus",
  stat: "attack",           // Which stat to modify
  baseValue: 5,             // +5% at level 1
  perLevel: 3               // +3% per additional level
}
// Level 1: +5% attack
// Level 5: +5 + (3 * 4) = +17% attack
```

#### `next_attack` - Modify Next Click
```javascript
{
  type: "next_attack",
  baseValue: 5,             // 5x damage at level 1
  perLevel: 1               // +1x per level
}
// Level 1: Next click deals 5x damage
// Level 3: Next click deals 7x damage
```

#### `buff` - Temporary Boost
```javascript
{
  type: "buff",
  stat: "critChance",
  baseValue: 1.0,           // 100% crit chance
  perLevel: 0,              // Doesn't scale
  duration: 5000            // 5 seconds
}
// All levels: 100% crit for 5 seconds
```

#### `instant` - Immediate Effect
```javascript
{
  type: "instant",
  baseValue: 1,             // Kills 1 monster
  perLevel: 0
}
// Instantly kills current monster
```

### Cooldown (Active Skills Only)

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `cooldown` | number | 1000-300000 | Milliseconds |

**Cooldown Display:**
```javascript
// Convert to readable format
if (cooldown >= 60000) {
  display = `${cooldown / 60000}m`;  // "2m"
} else {
  display = `${cooldown / 1000}s`;   // "30s"
}
```

---

## Skill Definitions

### Passive Skills

#### Sharp Blades (Offense)
```javascript
{
  id: "skill_passive_sharp_blades",
  name: "Sharp Blades",
  description: "Increases attack power by {value}%",
  type: "passive",
  category: "offense",
  unlockLevel: 1,
  unlockCost: 0,            // Free starter skill
  maxLevel: 10,
  upgradeCosts: [50, 100, 200, 400, 800, 1500, 3000, 6000, 12000],
  effect: {
    type: "stat_bonus",
    stat: "attack",
    baseValue: 5,           // 5% at level 1
    perLevel: 5             // +5% per level
  },
  emoji: "⚔️"
}
// Level 1: +5% attack
// Level 10: +50% attack
```

#### Lucky Strikes (Offense)
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
    baseValue: 2,           // 2% at level 1
    perLevel: 2             // +2% per level
  },
  emoji: "🍀"
}
// Level 10: +20% crit chance
```

#### Deep Pockets (Utility)
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
// Level 10: +50% gold find
```

#### Fast Learner (Utility)
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
// Level 10: +50% XP
```

#### Auto Clicker (Automation)
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
    baseValue: 1,           // 1 click/sec at level 1
    perLevel: 1             // +1 click/sec per level
  },
  emoji: "⚙️"
}
// Level 10: 10 automatic clicks per second
```

### Active Skills

#### Power Strike (Offense)
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
    baseValue: 5,           // 5x damage
    perLevel: 2             // +2x per level
  },
  cooldown: 30000,          // 30 seconds
  emoji: "💥"
}
// Level 5: 13x damage, 30s cooldown
```

#### Gold Rush (Utility)
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
    baseValue: 1.0,         // +100% gold find
    perLevel: 0,
    duration: 10000         // Base 10 seconds
  },
  cooldown: 60000,          // 60 seconds
  emoji: "🪙"
}
// Duration increases: 10s, 12s, 14s, 16s, 18s
```

#### Critical Frenzy (Offense)
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
    baseValue: 1.0,         // 100% crit
    perLevel: 0,
    duration: 5000          // 5 seconds base
  },
  cooldown: 90000,          // 90 seconds
  emoji: "⚡"
}
```

#### Monster Slayer (Offense)
```javascript
{
  id: "skill_active_monster_slayer",
  name: "Monster Slayer",
  description: "Instantly kill the current monster",
  type: "active",
  category: "offense",
  unlockLevel: 20,
  unlockCost: 2000,
  maxLevel: 1,              // No upgrades
  upgradeCosts: [],
  effect: {
    type: "instant",
    baseValue: 1,
    perLevel: 0
  },
  cooldown: 120000,         // 2 minutes
  emoji: "☠️"
}
```

---

## Skill UI Layout

```
┌─────────────────────────────┐
│ SKILLS                      │
├─────────────────────────────┤
│ [⚔️ Offense] [💰 Utility] [⚙️]│  ← Category tabs
├─────────────────────────────┤
│                             │
│ ⚔️ Sharp Blades    Lv.3/10  │
│ [████████░░] +15% ATK       │
│ [UPGRADE 200g]              │
│                             │
│ 🍀 Lucky Strikes   Lv.1/10  │
│ [██░░░░░░░░] +2% CRIT       │
│ [UPGRADE 150g]              │
│                             │
│ 💥 Power Strike    READY    │
│ [████████████] 5x DMG       │
│ [USE] (30s cooldown)        │
│                             │
└─────────────────────────────┘
```

---

## Validation Rules

1. `id` must be unique across all skills
2. `id` must follow convention: `skill_{type}_{name}`
3. `type` must be `active` or `passive`
4. `category` must be valid SkillCategory
5. `unlockLevel` must be 1-100
6. `upgradeCosts.length` must equal `maxLevel - 1`
7. `effect.stat` must be valid stat ID (from _INDEX.md)
8. Active skills must have `cooldown` defined
9. `cooldown` must be >= 1000 (1 second minimum)
10. `emoji` must be a valid emoji character

---

## Skill Balance Notes

- **Early passive skills** (Lv 1-10): Low cost, high impact for new players
- **Mid passive skills** (Lv 10-30): Moderate cost, build diversity
- **Late passive skills** (Lv 30+): Expensive, powerful, build-defining
- **Active skills**: Meaningful cooldowns, impactful when used
- **Auto Clicker**: Expensive to max, but transforms gameplay

See `balance/curves.balance.md` for detailed cost curves.

---

*Referenced by: skills.js, player.js, ui.js*
*References: _INDEX.md (stats), player.schema.md*

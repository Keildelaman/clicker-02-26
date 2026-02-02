# Energy System

> Defines the resource that powers active skills.

---

## Overview

Energy is the resource that gates skill usage:
- Builds through clicking (active engagement)
- Spent on active skills
- Creates strategic decisions about when to use skills
- Rewards consistent play without punishing breaks

---

## Energy Bar

```
Energy: ████████████░░░░░░░░ 62/100
```

- Displayed below the skill bar
- Fills left-to-right as Energy increases
- Glows when full (100/100)
- Pulses briefly when skill is used

---

## Energy Gain

### From Clicking

```javascript
// Base Energy gain per click
const ENERGY_PER_CLICK = 5;

// Internal cooldown prevents spam exploitation
const ENERGY_GAIN_COOLDOWN = 0.2; // seconds

// Example: Clicking 5 times per second
// Actual Energy gain: 5 × 5 = 25 Energy/second (max)
```

**Rules:**
- Each click grants +5 Energy (base)
- 0.2 second internal cooldown on Energy gain
- Clicking faster than 5/sec still does damage, but no extra Energy
- This prevents macro/spam exploitation

### From Monster Kills

```javascript
// Bonus Energy on monster death
const ENERGY_ON_KILL = 15;

// Boss kills grant more
const ENERGY_ON_BOSS_KILL = 50;
```

### Passive Regeneration

```javascript
// Base passive regen (always active)
const ENERGY_REGEN_PER_SECOND = 2;

// With Energy Flow passive skill
// +10% per level, up to +50% at Lv 5
// Lv 5: 2 × 1.5 = 3 Energy/second
```

### Energy Gain Bonuses

| Source | Bonus |
|--------|-------|
| Energy Flow Lv 1 | +10% Energy gain |
| Energy Flow Lv 2 | +20% Energy gain |
| Energy Flow Lv 3 | +30% Energy gain |
| Energy Flow Lv 4 | +40% Energy gain |
| Energy Flow Lv 5 | +50% Energy gain |
| Energy Potion | Instant +50 Energy |
| Accessory (rare) | +5-15% Energy gain |

---

## Energy Spending

### Skill Costs

| Skill | Energy Cost |
|-------|-------------|
| Power Strike | 15 |
| Heal | 20 |
| Iron Skin | 25 |
| Execute | 25 |
| Crit Surge | 25 |
| Reflect | 30 |
| Berserk Rage | 30 |
| Perfect Strike | 30 |
| Soul Rend | 35 |
| Time Warp | 40 |
| Undying | 50 |
| Transcendence | 100 |

### Cannot Use Skill If:
- Energy < skill cost
- Skill is on cooldown
- Player is dead (at 0 HP)

### Visual Feedback

```
When insufficient Energy:
- Skill button shows red flash
- Toast: "Not enough Energy!"
- Energy bar pulses red briefly

When skill used:
- Energy bar depletes visibly (animated)
- Skill button enters cooldown state
```

---

## Energy Strategy

### Early Game (Low Skills)

```
Typical rotation:
1. Click to build Energy (62 → 77 → 92)
2. Use Power Strike when available (92 → 77)
3. Continue clicking
4. Heal if HP is low (77 → 57)
5. Repeat
```

### Late Game (Many Skills)

```
Resource management:
- Don't spam skills immediately
- Save Energy for important moments
- Time skills with monster attack windows
- Keep 50+ Energy for emergency Heal/Undying
```

### Build-Specific Energy Usage

**Berserker Build:**
- Burn Energy fast for damage
- Berserk Rage + Execute combo
- Risk running out for Heal

**Tank Build:**
- Conservative spending
- Always keep 50+ for Heal
- Iron Skin before big attacks

**Farmer Build:**
- Time Gold Rush/XP Boost together
- Maximize uptime of bonuses
- Energy Flow passive essential

---

## Energy Cap

### Base Cap

```javascript
const MAX_ENERGY = 100;
```

### Cap Increase (Future/Ascension)

| Source | Cap Increase |
|--------|--------------|
| Base | 100 |
| Ascension Lv 5+ | +25 |
| Ascension Lv 10+ | +50 |
| Special Items | +10-25 |

---

## Energy Potion

### Consumable Item

```javascript
const ENERGY_POTION = {
  name: "Energy Potion",
  effect: "Instantly restore 50 Energy",
  cost: 150,           // gold to buy
  cooldown: 60,        // seconds between uses
  maxStack: 10         // max inventory
};
```

### Usage
- Bought from Shop (consumables tab)
- Used via dedicated potion button or inventory
- Does not take skill slot
- Cooldown shared between all Energy potions

---

## No Energy State

When Energy = 0:
- Can still click for damage (important!)
- Cannot use any skills
- Must wait for regeneration or click to build
- Shows "Out of Energy" indicator on skill bar

This prevents being "stuck" - you can always click.

---

## Energy UI

### In Combat Screen

```
┌─────────────────────────────────────────┐
│ [Skill1] [Skill2] [Skill3] [Skill4]     │
├─────────────────────────────────────────┤
│ ⚡ ████████████░░░░░░░░  62/100         │
└─────────────────────────────────────────┘
```

### Energy Gain Animation

```
On click:
  "+5" floats up from Energy bar (small, quick)

On monster kill:
  "+15" floats up (larger, gold color)

On boss kill:
  "+50" floats up (large, with particles)
```

---

## Edge Cases

### What if player doesn't click?

```
- Passive regen: +2/sec
- After 50 seconds: Full Energy
- Player can use skills without clicking
- But slower progression
```

### What if Energy is wasted (full bar)?

```
- Clicking at 100 Energy: No Energy gained
- Displayed but not punishing
- Optional: Small visual indicator "Energy Full!"
```

### Skill use during monster death animation?

```
- Skills can be used during death animation
- Energy is spent
- Effect applies to next monster (if relevant)
- Heal/Iron Skin still work normally
```

---

## Constants Reference

```javascript
const ENERGY_CONSTANTS = {
  MAX_ENERGY: 100,
  ENERGY_PER_CLICK: 5,
  ENERGY_GAIN_COOLDOWN: 0.2,    // seconds
  ENERGY_ON_KILL: 15,
  ENERGY_ON_BOSS_KILL: 50,
  ENERGY_REGEN_PER_SECOND: 2,

  // Potion
  ENERGY_POTION_RESTORE: 50,
  ENERGY_POTION_COOLDOWN: 60,
  ENERGY_POTION_COST: 150,
  ENERGY_POTION_MAX_STACK: 10
};
```

---

*Energy rewards active play while preventing skill spam. It creates meaningful decisions about when to use powerful abilities.*

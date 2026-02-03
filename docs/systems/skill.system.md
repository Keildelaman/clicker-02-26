# Skill System

> Defines skill unlocking, mastery, and build choices using limited Mastery Points.

---

## Overview

The skill system creates **meaningful, permanent choices** through:
- **Limited Mastery Points (MP)** - You cannot max everything, forces prioritization
- **All Skills Visible** - Buy any skill directly, costs vary by power
- **Full Reset on Ascension** - Each run is a fresh build
- **Skill Swapping** - Swap equipped skills anytime (discovered skills only)

**Core Philosophy: Every point matters. Every run is a new build.**

---

## Skill Slots

### Active Skill Slots: 4

```
┌─────────────────────────────────────────┐
│  [1]        [2]        [3]        [4]   │
│  Power     Heal       Execute    ???    │
│  Strike    ★★☆       ★★★☆☆     Empty   │
│  ▓▓▓░░     READY      ▓▓▓▓▓░            │
│  2.1s                 4.8s              │
└─────────────────────────────────────────┘
```

- 4 active skill slots on the skill bar
- Only equip skills you've **unlocked** this run
- Swap unlocked skills anytime outside of combat
- Each slot mapped to tap button or keyboard (1-4)

### Passive Skill Slots: 3

```
Equipped Passives:
├── Sharp Blades ★★★ (+15% damage)
├── Deep Pockets ★★ (+10% gold)
└── [EMPTY SLOT]
```

- 3 passive skill slots
- Only equip passives you've **unlocked** this run
- Swap unlocked passives anytime outside of combat

---

## Mastery Points System

### The Core Resource

**Mastery Points (MP)** are the only currency for skills. Gold is NOT used for skills.

- MP is earned through leveling and boss kills
- MP is spent to **unlock** skills AND **upgrade** them
- MP cannot be refunded or reallocated
- Spending MP on >4 active or >3 passive skills is intentionally inefficient (but valid strategy)

### Earning Mastery Points

| Source | MP Earned | Notes |
|--------|-----------|-------|
| Level 5 | 3 MP | First milestone |
| Level 10 | 3 MP | |
| Level 15 | 3 MP | |
| Level 20 | 3 MP | |
| Level 30 | 4 MP | |
| Level 40 | 4 MP | |
| Level 50 | 5 MP | |
| Level 60 | 5 MP | |
| Level 75 | 5 MP | |
| Level 90 | 5 MP | |
| Each Boss Kill | 2 MP | 7 bosses = 14 MP |
| **Base Total** | ~54 MP | Leveling (40) + Bosses (14) |

### Ascension Bonus MP

Each Ascension rank grants bonus MP at run start:

| Ascension | Bonus MP | Total Available |
|-----------|----------|-----------------|
| 0 | 0 | ~54 MP |
| 1 | +3 | ~57 MP |
| 2 | +6 | ~60 MP |
| 3 | +9 | ~63 MP |
| 5 | +15 | ~69 MP |
| 10 | +30 | ~84 MP |

More Ascension = More build flexibility!

---

## Skill Costs

### Unlock Costs (Vary by Power)

Skills cost MP to unlock based on their power tier:

| Tier | Unlock Cost | Examples |
|------|-------------|----------|
| Basic | 3 MP | Sharp Blades, Heal, Iron Skin |
| Utility | 4 MP | Gold Rush, XP Boost, Reflect |
| Combat | 5 MP | Execute, Berserk Rage, Crit Surge |
| Advanced | 6 MP | Deep Pockets, Thick Skin |
| Elite | 8 MP | Undying, Soul Rend, Shield Wall |
| Master | 10 MP | Transcendence, Void Touch |

**Power Strike is FREE** - Every player starts with it unlocked at Level 1.

### Upgrade Costs (Per Level)

Upgrading a skill also costs MP:

| Target Level | MP Cost | Cumulative |
|--------------|---------|------------|
| 2 | 1 MP | 1 MP |
| 3 | 2 MP | 3 MP |
| 4 | 3 MP | 6 MP |
| 5 | 4 MP | 10 MP |

**Total to max one skill (Level 5): Unlock + 10 MP**

Example costs:
- Basic skill maxed: 3 + 10 = **13 MP**
- Elite skill maxed: 8 + 10 = **18 MP**
- Master skill maxed: 10 + 10 = **20 MP**

### Extended Levels (Ascension Only)

Ascension unlocks levels 6-10 with higher costs:

| Target Level | MP Cost | Ascension Required |
|--------------|---------|-------------------|
| 6 | 5 MP | Ascension 1+ |
| 7 | 6 MP | Ascension 2+ |
| 8 | 7 MP | Ascension 3+ |
| 9 | 8 MP | Ascension 5+ |
| 10 | 10 MP | Ascension 10+ |

**Total to max one skill (Level 10): Unlock + 10 + 36 = 46+ MP**

This is VERY expensive - even with max ascension bonuses, you can only fully max 1-2 skills.

---

## Strategic Implications

### Budget Analysis

With ~54 base MP, example builds:

**Specialist Build (2 maxed skills):**
- Power Strike (free) → Level 5: 10 MP
- Execute (5 unlock) → Level 5: 5 + 10 = 15 MP
- Heal (3 unlock) → Level 3: 3 + 3 = 6 MP
- Sharp Blades (3 unlock) → Level 3: 3 + 3 = 6 MP
- Deep Pockets (6 unlock) → Level 1: 6 MP
- **Total: 43 MP** (11 MP left for more unlocks or levels)

**Generalist Build (many Level 3 skills):**
- Power Strike → Level 3: 3 MP
- 7 other skills at Level 3: 7 × (avg 5 + 3) = ~56 MP
- **Total: ~59 MP** (tight budget, needs ascension bonus)

**Intentional Inefficiency:**
If a player unlocks 6+ active skills (but can only equip 4), they're spending MP on flexibility. This is valid for:
- Swapping skills for different monster types
- Covering weaknesses
- Building toward synergies

---

## Skill Swapping

### Rules

```javascript
const SKILL_SWAP_RULES = {
  allowedDuring: ['idle', 'waiting', 'shop', 'skills_screen'],
  blockedDuring: ['combat', 'monster_attacking', 'boss_fight'],
  swapCost: 0,           // Free to swap
  cooldownOnSwap: 0.5    // 50% cooldown penalty when swapping in
};
```

- Swap between **unlocked** skills only
- Cannot swap during active combat
- Swapped-in skill starts at 50% cooldown

### Why Allow Swapping?

- Lets players adapt to monster types
- Rewards having "spare" skills unlocked
- Creates depth without punishing experimentation

---

## Skill Categories

### Active Skills (16 Total)

#### Offense Active (5 skills)

| Skill | Tier | Energy | Cooldown | Effect |
|-------|------|--------|----------|--------|
| **Power Strike** | Starter | 15 | 8s | 3x-5x damage next attack |
| **Execute** | Combat | 25 | 12s | 5x-7x damage if monster <30-40% HP |
| **Berserk Rage** | Combat | 30 | 45s | 2x-3x damage, 2x-1x damage taken, 15s |
| **Crit Surge** | Combat | 25 | 30s | +50-75% crit chance for 10-15s |
| **Soul Rend** | Elite | 35 | 20s | Deal 10-15% of monster max HP |

#### Defense Active (5 skills)

| Skill | Tier | Energy | Cooldown | Effect |
|-------|------|--------|----------|--------|
| **Heal** | Basic | 20 | 15s | Restore 25-50% max HP |
| **Iron Skin** | Basic | 25 | 30s | 50-75% damage reduction for 10-15s |
| **Reflect** | Utility | 30 | 25s | Reflect next attack at 100-200% |
| **Undying** | Elite | 50 | 180s | Survive fatal blow with 1-25% HP |
| **Shield Wall** | Elite | 40 | 60s | Gain 20-30% max HP as absorb shield |

#### Utility Active (6 skills)

| Skill | Tier | Energy | Cooldown | Effect |
|-------|------|--------|----------|--------|
| **Gold Rush** | Utility | 20 | 60s | +100-200% gold for 30-45s |
| **XP Boost** | Utility | 20 | 60s | +100-200% XP for 30-45s |
| **Time Warp** | Utility | 40 | 90s | Freeze monster 5-10s |
| **Perfect Strike** | Combat | 30 | 30s | Timing mode: 2-3x/4-6x damage |
| **Shield Breaker** | Elite | 25 | 15s | Break shields, +50-75% vs shielded |
| **Transcendence** | Master | 100 | 300s | Invulnerable +100-150% everything 30-45s |

### Passive Skills (9 Total)

#### Offense Passive (3 skills)

| Skill | Tier | Effect per Level |
|-------|------|------------------|
| **Sharp Blades** | Basic | +5% damage per level (max +25%) |
| **Killer Instinct** | Basic | +3% crit chance per level (max +15%) |
| **Void Touch** | Master | +5% armor penetration per level (max +25%) |

#### Defense Passive (3 skills)

| Skill | Tier | Effect per Level |
|-------|------|------------------|
| **Thick Skin** | Advanced | +10% max HP per level (max +50%) |
| **Regeneration** | Advanced | +0.5% HP/sec per level (max +3%) |
| **Quick Reflexes** | Master | +0.2s attack warning per level (max +1s) |

#### Utility Passive (3 skills)

| Skill | Tier | Effect per Level |
|-------|------|------------------|
| **Deep Pockets** | Advanced | +5% gold per level (max +25%) |
| **Fast Learner** | Advanced | +5% XP per level (max +25%) |
| **Energy Flow** | Elite | +10% Energy gain per level (max +50%) |

---

## Skills Screen UI

```
┌─────────────────────────────────────────┐
│ ← Back        SKILLS        MP: 12/54   │
├─────────────────────────────────────────┤
│                                         │
│  EQUIPPED ACTIVE (4 Slots):             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ ⚔️ │ │ 💚 │ │ 💀 │ │ ░░ │           │
│  │★★★★│ │★★☆ │ │★☆☆ │ │Emp │           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
│  EQUIPPED PASSIVE (3 Slots):            │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Sharp ★★│ │ Empty  │ │ Empty  │       │
│  └────────┘ └────────┘ └────────┘       │
│                                         │
├─────────────────────────────────────────┤
│  ALL SKILLS                             │
│  [Active] [Passive] [All]               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚔️ Power Strike       ★★★★☆     │    │
│  │ Deal 4.5x damage on next click  │    │
│  │ Energy: 15 | Cooldown: 8s       │    │
│  │ [UPGRADE: 4 MP → ★★★★★]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💚 Heal                  ★★☆☆☆  │    │
│  │ Restore 30% max HP              │    │
│  │ Energy: 20 | Cooldown: 15s      │    │
│  │ [UPGRADE: 2 MP → ★★★]          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔥 Berserk Rage        🔒 LOCKED │    │
│  │ 2x damage dealt AND taken       │    │
│  │ Combat Tier | Unlock: 5 MP      │    │
│  │ [UNLOCK: 5 MP]                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ✨ Transcendence       🔒 LOCKED │    │
│  │ Ultimate invulnerability        │    │
│  │ Master Tier | Unlock: 10 MP     │    │
│  │ [UNLOCK: 10 MP]                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Ascension & Skills

### Full Reset on Ascension

When you ascend:
- All skill unlocks are **RESET** (except Power Strike)
- All skill levels are **RESET** to 0
- All equipped skills are **CLEARED**
- Mastery Points spent are **RESET** to 0
- You receive your Ascension bonus MP at the start

**Every run is a fresh build opportunity!**

### Skill Level Caps

| Ascension Rank | Max Skill Level |
|----------------|-----------------|
| 0 | ★★★★★ (5) |
| 1 | ★★★★★★ (6) |
| 2 | ★★★★★★★ (7) |
| 3 | ★★★★★★★★ (8) |
| 5 | ★★★★★★★★★ (9) |
| 10 | ★★★★★★★★★★ (10) |

### Ascension Skill Reset

```javascript
function resetSkillsOnAscension(player) {
  // Clear all skill unlocks
  player.unlockedSkills = ['skill_power_strike'];  // Power Strike always free

  // Reset all skill levels
  player.skills = {
    'skill_power_strike': { level: 1, lastUsed: null }
  };

  // Clear equipped skills
  player.equippedActiveSkills = ['skill_power_strike', null, null, null];
  player.equippedPassiveSkills = [null, null, null];

  // Reset MP spent (bonus MP applied separately)
  player.masterySpent = 0;

  // Calculate starting MP (ascension bonus)
  player.masteryPoints = player.ascension.level * 3;
}
```

---

## Skill Details

### Power Strike (Starter - FREE)
```
Type: Active (Offense)
Tier: Starter (FREE unlock)
Energy: 15 | Cooldown: 8s

Effect: Next attack deals multiplied damage

Levels:
  ★☆☆☆☆: 3.0x damage
  ★★☆☆☆: 3.5x damage
  ★★★☆☆: 4.0x damage
  ★★★★☆: 4.5x damage
  ★★★★★: 5.0x damage
```

### Heal (Basic - 3 MP)
```
Type: Active (Defense)
Tier: Basic (3 MP unlock)
Energy: 20 | Cooldown: 15s

Effect: Restore percentage of max HP

Levels:
  ★☆☆☆☆: 25% HP
  ★★☆☆☆: 30% HP
  ★★★☆☆: 35% HP
  ★★★★☆: 40% HP
  ★★★★★: 50% HP
```

### Execute (Combat - 5 MP)
```
Type: Active (Offense)
Tier: Combat (5 MP unlock)
Energy: 25 | Cooldown: 12s

Effect: Massive damage to low-HP monsters
        Normal damage if above threshold (Energy refunded)

Levels:
  ★☆☆☆☆: 5x damage below 30%
  ★★☆☆☆: 5.5x damage below 32%
  ★★★☆☆: 6x damage below 34%
  ★★★★☆: 6.5x damage below 36%
  ★★★★★: 7x damage below 40%
```

### Berserk Rage (Combat - 5 MP)
```
Type: Active (Offense)
Tier: Combat (5 MP unlock)
Energy: 30 | Cooldown: 45s

Effect: Damage amp with risk for 15s

Levels:
  ★☆☆☆☆: 2x damage, 2x damage taken
  ★★☆☆☆: 2.2x damage, 1.8x damage taken
  ★★★☆☆: 2.4x damage, 1.6x damage taken
  ★★★★☆: 2.6x damage, 1.4x damage taken
  ★★★★★: 3x damage, 1x damage taken (!)
```

### Shield Wall (Elite - 8 MP)
```
Type: Active (Defense)
Tier: Elite (8 MP unlock)
Energy: 40 | Cooldown: 60s

Effect: Gain a damage-absorbing shield

Levels:
  ★☆☆☆☆: 20% max HP shield, 20s duration
  ★★☆☆☆: 22% max HP shield, 22s duration
  ★★★☆☆: 25% max HP shield, 25s duration
  ★★★★☆: 28% max HP shield, 28s duration
  ★★★★★: 30% max HP shield, 30s duration
```

### Transcendence (Master - 10 MP)
```
Type: Active (Utility)
Tier: Master (10 MP unlock)
Energy: 100 | Cooldown: 300s

Effect: Ultimate power mode

Levels:
  ★☆☆☆☆: Invulnerable, +100% all, 30s
  ★★☆☆☆: Invulnerable, +110% all, 32s
  ★★★☆☆: Invulnerable, +120% all, 34s
  ★★★★☆: Invulnerable, +130% all, 36s
  ★★★★★: Invulnerable, +150% all, 45s
```

*(Full skill details in skills.data.md)*

---

## Build Examples

### Example: "Glass Cannon" (54 MP budget)

| Skill | Unlock | Levels | Total |
|-------|--------|--------|-------|
| Power Strike | 0 | → Lv5 (10) | 10 MP |
| Execute | 5 | → Lv5 (10) | 15 MP |
| Berserk Rage | 5 | → Lv3 (3) | 8 MP |
| Sharp Blades | 3 | → Lv5 (10) | 13 MP |
| Killer Instinct | 3 | → Lv2 (1) | 4 MP |
| **Total** | | | **50 MP** |

Playstyle: Maximum burst damage. Execute finishes, Berserk for big fights.

### Example: "Immortal Tank" (54 MP budget)

| Skill | Unlock | Levels | Total |
|-------|--------|--------|-------|
| Power Strike | 0 | → Lv2 (1) | 1 MP |
| Heal | 3 | → Lv5 (10) | 13 MP |
| Iron Skin | 3 | → Lv4 (6) | 9 MP |
| Thick Skin | 6 | → Lv5 (10) | 16 MP |
| Regeneration | 6 | → Lv3 (3) | 9 MP |
| Deep Pockets | 6 | → Lv1 (0) | 6 MP |
| **Total** | | | **54 MP** |

Playstyle: Never dies. Lower damage but farms safely.

---

## Constants Reference

```javascript
const SKILL_CONSTANTS = {
  // Slots
  ACTIVE_SLOTS: 4,
  PASSIVE_SLOTS: 3,

  // Mastery from Leveling
  MASTERY_MILESTONES: {
    5: 3, 10: 3, 15: 3, 20: 3,
    30: 4, 40: 4,
    50: 5, 60: 5, 75: 5, 90: 5
  },
  MASTERY_PER_BOSS: 2,
  MASTERY_PER_ASCENSION: 3,

  // Unlock Costs by Tier
  UNLOCK_COST: {
    starter: 0,
    basic: 3,
    utility: 4,
    combat: 5,
    advanced: 6,
    elite: 8,
    master: 10
  },

  // Upgrade Costs (level 1→2, 2→3, etc)
  UPGRADE_COST: [1, 2, 3, 4],  // Levels 2-5
  UPGRADE_COST_EXTENDED: [5, 6, 7, 8, 10],  // Levels 6-10

  // Skill Levels
  BASE_MAX_LEVEL: 5,
  ASCENSION_LEVEL_CAPS: {
    0: 5, 1: 6, 2: 7, 3: 8, 5: 9, 10: 10
  },

  // Swap Rules
  SWAP_COOLDOWN_PENALTY: 0.5  // 50% cooldown on swap
};
```

---

## Summary

| Aspect | Design |
|--------|--------|
| Currency | Mastery Points (MP) only |
| Unlock | Buy any skill directly, cost varies (3-10 MP) |
| Upgrade | 1-4 MP per level (10 MP total to Lv5) |
| Total MP | ~54 base + 3 per Ascension |
| On Ascension | FULL RESET - fresh build each run |
| Swapping | Free, anytime outside combat |
| Extended Levels | 6-10 unlocked by Ascension, expensive |

**Result: Every run feels different. Every point matters. No "optimal" build - just YOUR build.**

---

*Skills define your playstyle. Spend wisely.*

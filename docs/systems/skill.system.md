# Skill System

> Defines the skill tree, skill slots, skill acquisition, and skill mechanics.

---

## Overview

The skill system provides strategic depth through:
- **Active Skills** - Manually triggered abilities with cooldowns
- **Passive Skills** - Always-on bonuses (limited slots)
- **Skill Tree** - Unlock paths with meaningful choices
- **Build Diversity** - Limited slots force interesting decisions

---

## Skill Slots

### Active Skill Slots: 4

```
┌─────────────────────────────────────────┐
│  [1]        [2]        [3]        [4]   │
│  Power     Heal       Crit       Gold   │
│  Strike    Surge      Surge      Rush   │
│  ▓▓▓░░     READY      ▓▓▓▓▓░     READY  │
│  2.1s                 4.8s              │
└─────────────────────────────────────────┘
```

- 4 active skill slots on the skill bar
- Can unlock many skills, but only equip 4 at a time
- Swap skills anytime outside of combat
- Each slot mapped to tap button or keyboard (1-4)

### Passive Skill Slots: 3

```
Equipped Passives:
├── Sharp Blades Lv 3 (+15% damage)
├── Deep Pockets Lv 2 (+10% gold)
└── Thick Skin Lv 1 (+5% HP)
```

- 3 passive skill slots
- Passives are always active once equipped
- Can unlock many passives, but only equip 3 at a time
- Swap passives anytime outside of combat

---

## Skill Acquisition

### Choice-Based Unlocks

At milestone levels, players CHOOSE which skill to unlock:

```
┌─────────────────────────────────────────┐
│         ⭐ LEVEL 10 REACHED! ⭐          │
│                                         │
│      Choose your new skill:             │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚔️ EXECUTE                       │    │
│  │ Deal 5x damage to monsters      │    │
│  │ below 30% HP                    │    │
│  │              [CHOOSE]           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔥 BERSERK RAGE                  │    │
│  │ 2x damage dealt AND taken       │    │
│  │ for 15 seconds                  │    │
│  │              [CHOOSE]           │    │
│  └─────────────────────────────────┘    │
│                                         │
│      You can unlock the other           │
│      skill later for 500g               │
└─────────────────────────────────────────┘
```

### Unlock Schedule

| Level | Skill Choice | Alternative |
|-------|--------------|-------------|
| 1 | Power Strike (free) | - |
| 3 | Sharp Blades OR Killer Instinct | 100g later |
| 5 | Heal OR Iron Skin | 150g later |
| 8 | Gold Rush OR XP Boost | 200g later |
| 10 | Execute OR Berserk Rage | 500g later |
| 15 | Crit Surge OR Perfect Strike | 750g later |
| 20 | Reflect OR Time Warp | 1,000g later |
| 25 | Deep Pockets OR Fast Learner | 1,500g later |
| 30 | Regeneration OR Thick Skin | 2,000g later |
| 40 | Undying | 5,000g |
| 50 | Soul Rend | 10,000g |
| 60 | Shield Breaker | 15,000g |
| 75 | Void Touch | 25,000g |
| 90 | Transcendence | 50,000g |

### Buying Skipped Skills

Skills not chosen at milestone can be purchased later:
- Available in Skills screen under "Locked Skills"
- Cost increases based on how long you wait
- All skills eventually accessible, but choices matter early

---

## Skill Categories

### Active Skills (12 Total)

#### Offense (4 skills)

**Power Strike**
```
Type: Active
Unlock: Level 1 (free, tutorial)
Cost: 15 Energy
Cooldown: 8 seconds

Effect: Deal 3x damage on next attack

Upgrades (per level):
  Lv 1: 3x damage
  Lv 2: 3.5x damage
  Lv 3: 4x damage
  Lv 4: 4.5x damage
  Lv 5: 5x damage

Upgrade costs: 100g → 250g → 500g → 1,000g
```

**Execute**
```
Type: Active
Unlock: Level 10 (choice with Berserk Rage)
Cost: 25 Energy
Cooldown: 12 seconds

Effect: Deal 5x damage if monster is below 30% HP
        Deal 1x damage otherwise (Energy refunded)

Upgrades (per level):
  Lv 1: 5x damage, 30% threshold
  Lv 2: 5.5x damage, 32% threshold
  Lv 3: 6x damage, 34% threshold
  Lv 4: 6.5x damage, 36% threshold
  Lv 5: 7x damage, 40% threshold

Upgrade costs: 200g → 500g → 1,000g → 2,500g
```

**Berserk Rage**
```
Type: Active
Unlock: Level 10 (choice with Execute)
Cost: 30 Energy
Cooldown: 45 seconds

Effect: For 15 seconds:
        - Deal 2x damage
        - Take 2x damage

Upgrades (per level):
  Lv 1: 2x damage, 2x damage taken
  Lv 2: 2.2x damage, 1.8x damage taken
  Lv 3: 2.4x damage, 1.6x damage taken
  Lv 4: 2.6x damage, 1.4x damage taken
  Lv 5: 3x damage, 1x damage taken (!)

Upgrade costs: 300g → 750g → 1,500g → 3,500g
```

**Crit Surge**
```
Type: Active
Unlock: Level 15 (choice with Perfect Strike)
Cost: 25 Energy
Cooldown: 30 seconds

Effect: +50% crit chance for 10 seconds

Upgrades (per level):
  Lv 1: +50% crit, 10 seconds
  Lv 2: +55% crit, 11 seconds
  Lv 3: +60% crit, 12 seconds
  Lv 4: +65% crit, 13 seconds
  Lv 5: +75% crit, 15 seconds

Upgrade costs: 300g → 750g → 1,500g → 3,500g
```

#### Defense (4 skills)

**Heal**
```
Type: Active
Unlock: Level 5 (choice with Iron Skin)
Cost: 20 Energy
Cooldown: 15 seconds

Effect: Restore 25% of max HP

Upgrades (per level):
  Lv 1: 25% HP restored
  Lv 2: 30% HP restored
  Lv 3: 35% HP restored
  Lv 4: 40% HP restored
  Lv 5: 50% HP restored

Upgrade costs: 150g → 400g → 800g → 2,000g
```

**Iron Skin**
```
Type: Active
Unlock: Level 5 (choice with Heal)
Cost: 25 Energy
Cooldown: 30 seconds

Effect: Reduce damage taken by 50% for 10 seconds

Upgrades (per level):
  Lv 1: 50% reduction, 10 seconds
  Lv 2: 55% reduction, 11 seconds
  Lv 3: 60% reduction, 12 seconds
  Lv 4: 65% reduction, 13 seconds
  Lv 5: 75% reduction, 15 seconds

Upgrade costs: 200g → 500g → 1,000g → 2,500g
```

**Reflect**
```
Type: Active
Unlock: Level 20 (choice with Time Warp)
Cost: 30 Energy
Cooldown: 25 seconds

Effect: Next monster attack is reflected back
        (Monster takes the damage instead of you)

Upgrades (per level):
  Lv 1: Reflect 100% damage
  Lv 2: Reflect 125% damage
  Lv 3: Reflect 150% damage
  Lv 4: Reflect 175% damage
  Lv 5: Reflect 200% damage

Upgrade costs: 500g → 1,000g → 2,500g → 5,000g
```

**Undying**
```
Type: Active
Unlock: Level 40 (purchase only, 5,000g)
Cost: 50 Energy
Cooldown: 180 seconds (3 minutes)

Effect: When you would take fatal damage,
        survive with 1 HP instead.
        Lasts 30 seconds or until triggered.

Upgrades (per level):
  Lv 1: Survive with 1 HP
  Lv 2: Survive with 5% HP
  Lv 3: Survive with 10% HP
  Lv 4: Survive with 15% HP
  Lv 5: Survive with 25% HP, cooldown 150s

Upgrade costs: 2,000g → 5,000g → 10,000g → 25,000g
```

#### Utility (4 skills)

**Gold Rush**
```
Type: Active
Unlock: Level 8 (choice with XP Boost)
Cost: 20 Energy
Cooldown: 60 seconds

Effect: +100% gold from kills for 30 seconds

Upgrades (per level):
  Lv 1: +100% gold, 30 seconds
  Lv 2: +120% gold, 32 seconds
  Lv 3: +140% gold, 34 seconds
  Lv 4: +160% gold, 36 seconds
  Lv 5: +200% gold, 45 seconds

Upgrade costs: 250g → 600g → 1,200g → 3,000g
```

**XP Boost**
```
Type: Active
Unlock: Level 8 (choice with Gold Rush)
Cost: 20 Energy
Cooldown: 60 seconds

Effect: +100% XP from kills for 30 seconds

Upgrades (per level):
  Lv 1: +100% XP, 30 seconds
  Lv 2: +120% XP, 32 seconds
  Lv 3: +140% XP, 34 seconds
  Lv 4: +160% XP, 36 seconds
  Lv 5: +200% XP, 45 seconds

Upgrade costs: 250g → 600g → 1,200g → 3,000g
```

**Perfect Strike**
```
Type: Active
Unlock: Level 15 (choice with Crit Surge)
Cost: 30 Energy
Cooldown: 30 seconds

Effect: For 5 seconds, enter timing mode:
        - Click when indicator is in zone
        - Good timing: 2x damage
        - Perfect timing: 4x damage
        - Miss timing: 0.5x damage

Upgrades (per level):
  Lv 1: 5 seconds, 2x/4x multipliers
  Lv 2: 6 seconds, 2.2x/4.4x multipliers
  Lv 3: 7 seconds, 2.4x/4.8x multipliers
  Lv 4: 8 seconds, 2.6x/5.2x multipliers
  Lv 5: 10 seconds, 3x/6x multipliers

Upgrade costs: 400g → 1,000g → 2,000g → 5,000g
```

**Time Warp**
```
Type: Active
Unlock: Level 20 (choice with Reflect)
Cost: 40 Energy
Cooldown: 90 seconds

Effect: Freeze monster for 5 seconds
        (Cannot attack, still takes damage)

Upgrades (per level):
  Lv 1: 5 second freeze
  Lv 2: 6 second freeze
  Lv 3: 7 second freeze
  Lv 4: 8 second freeze
  Lv 5: 10 second freeze, cooldown 75s

Upgrade costs: 500g → 1,200g → 2,500g → 6,000g
```

---

### Passive Skills (8 Total)

#### Offense Passives

**Sharp Blades**
```
Type: Passive
Unlock: Level 3 (choice with Killer Instinct)

Effect: +5% damage per level

Levels:
  Lv 1: +5% damage (100g)
  Lv 2: +10% damage (250g)
  Lv 3: +15% damage (500g)
  Lv 4: +20% damage (1,000g)
  Lv 5: +25% damage (2,500g)
```

**Killer Instinct**
```
Type: Passive
Unlock: Level 3 (choice with Sharp Blades)

Effect: +3% crit chance per level

Levels:
  Lv 1: +3% crit (100g)
  Lv 2: +6% crit (250g)
  Lv 3: +9% crit (500g)
  Lv 4: +12% crit (1,000g)
  Lv 5: +15% crit (2,500g)
```

#### Defense Passives

**Thick Skin**
```
Type: Passive
Unlock: Level 30 (choice with Regeneration)

Effect: +10% max HP per level

Levels:
  Lv 1: +10% HP (500g)
  Lv 2: +20% HP (1,000g)
  Lv 3: +30% HP (2,000g)
  Lv 4: +40% HP (4,000g)
  Lv 5: +50% HP (8,000g)
```

**Regeneration**
```
Type: Passive
Unlock: Level 30 (choice with Thick Skin)

Effect: Regenerate HP over time

Levels:
  Lv 1: +0.5% HP/sec (500g)
  Lv 2: +1.0% HP/sec (1,000g)
  Lv 3: +1.5% HP/sec (2,000g)
  Lv 4: +2.0% HP/sec (4,000g)
  Lv 5: +3.0% HP/sec (8,000g)
```

#### Utility Passives

**Deep Pockets**
```
Type: Passive
Unlock: Level 25 (choice with Fast Learner)

Effect: +5% gold from all sources per level

Levels:
  Lv 1: +5% gold (400g)
  Lv 2: +10% gold (800g)
  Lv 3: +15% gold (1,600g)
  Lv 4: +20% gold (3,200g)
  Lv 5: +25% gold (6,400g)
```

**Fast Learner**
```
Type: Passive
Unlock: Level 25 (choice with Deep Pockets)

Effect: +5% XP from all sources per level

Levels:
  Lv 1: +5% XP (400g)
  Lv 2: +10% XP (800g)
  Lv 3: +15% XP (1,600g)
  Lv 4: +20% XP (3,200g)
  Lv 5: +25% XP (6,400g)
```

**Energy Flow**
```
Type: Passive
Unlock: Level 50 (purchase only, 10,000g)

Effect: +10% Energy gain per level

Levels:
  Lv 1: +10% Energy gain (2,000g)
  Lv 2: +20% Energy gain (4,000g)
  Lv 3: +30% Energy gain (8,000g)
  Lv 4: +40% Energy gain (16,000g)
  Lv 5: +50% Energy gain (32,000g)
```

**Quick Reflexes**
```
Type: Passive
Unlock: Level 60 (purchase only, 15,000g)

Effect: Monster attack warning time increased

Levels:
  Lv 1: +0.2s warning (3,000g)
  Lv 2: +0.4s warning (6,000g)
  Lv 3: +0.6s warning (12,000g)
  Lv 4: +0.8s warning (24,000g)
  Lv 5: +1.0s warning (48,000g)
```

---

### Late-Game Skills (4 Total)

Unlocked at high levels, powerful effects:

**Soul Rend** (Level 50)
```
Type: Active
Cost: 35 Energy
Cooldown: 20 seconds

Effect: Deal damage equal to 10% of monster's max HP
        (Minimum: your attack, Maximum: 10x your attack)

Great for high-HP monsters and bosses.
```

**Shield Breaker** (Level 60)
```
Type: Active
Cost: 25 Energy
Cooldown: 15 seconds

Effect: Instantly destroy monster's shield
        Deal 3x damage to shield
        +50% damage to shielded monsters for 10s
```

**Void Touch** (Level 75)
```
Type: Passive
Effect: Attacks ignore 5% of monster armor per level
        At Lv 5: Ignore 25% armor
```

**Transcendence** (Level 90)
```
Type: Active
Cost: 100 Energy
Cooldown: 300 seconds (5 minutes)

Effect: For 30 seconds:
        - Invulnerable (cannot take damage)
        - +100% damage
        - +100% gold and XP

The ultimate skill.
```

---

## Skill Upgrades

### Upgrade Costs

Skills have 5 levels. Upgrade costs scale:

| Level | Cost Multiplier | Example (base 100g) |
|-------|-----------------|---------------------|
| 1→2 | 2.5x base unlock | 250g |
| 2→3 | 5x base unlock | 500g |
| 3→4 | 10x base unlock | 1,000g |
| 4→5 | 25x base unlock | 2,500g |

### Ascension Skill Levels

After Ascension, skills can exceed level 5:

| Ascension Level | Max Skill Level |
|-----------------|-----------------|
| 0 | 5 |
| 1 | 6 |
| 2 | 7 |
| 3 | 8 |
| 5 | 9 |
| 10 | 10 |

Level 6-10 upgrades cost significantly more but provide powerful bonuses.

---

## Build Examples

### "Berserker" Build
```
Active Skills:
  1. Power Strike (burst damage)
  2. Berserk Rage (damage amp)
  3. Execute (finish low HP)
  4. Heal (survive)

Passive Skills:
  - Sharp Blades (+damage)
  - Killer Instinct (+crit)
  - Thick Skin (+HP)

Playstyle: High risk, high reward. Massive damage but vulnerable.
```

### "Tank" Build
```
Active Skills:
  1. Heal (sustain)
  2. Iron Skin (damage reduction)
  3. Reflect (punish attackers)
  4. Undying (safety net)

Passive Skills:
  - Thick Skin (+HP)
  - Regeneration (+regen)
  - Quick Reflexes (+dodge time)

Playstyle: Nearly unkillable. Slow but steady progress.
```

### "Farmer" Build
```
Active Skills:
  1. Gold Rush (bonus gold)
  2. XP Boost (bonus XP)
  3. Time Warp (safe damage)
  4. Heal (sustain)

Passive Skills:
  - Deep Pockets (+gold)
  - Fast Learner (+XP)
  - Energy Flow (+Energy)

Playstyle: Maximum resource gain. Great for grinding zones.
```

### "Precision" Build
```
Active Skills:
  1. Perfect Strike (timing damage)
  2. Crit Surge (crit chance)
  3. Execute (finisher)
  4. Power Strike (backup burst)

Passive Skills:
  - Killer Instinct (+crit)
  - Sharp Blades (+damage)
  - Energy Flow (+Energy)

Playstyle: High skill ceiling. Rewards precise play.
```

---

## Skill UI

### Skills Screen Layout

```
┌─────────────────────────────────────────┐
│ ← Back        SKILLS          💰 12,450 │
├─────────────────────────────────────────┤
│  [⚔️ Active]  [🛡️ Passive]  [🔒 Locked] │
├─────────────────────────────────────────┤
│                                         │
│  EQUIPPED ACTIVE SKILLS (4/4):          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ ⚔️ │ │ 💚 │ │ ⭐ │ │ 🪙 │           │
│  │Pwr │ │Heal│ │Crit│ │Gold│           │
│  │Lv3 │ │Lv2 │ │Lv1 │ │Lv2 │           │
│  └────┘ └────┘ └────┘ └────┘           │
│  [TAP TO SWAP]                          │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ALL ACTIVE SKILLS:                     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚔️ Power Strike        Lv 3/5  │    │
│  │ Deal 4x damage                  │    │
│  │ Cost: 15 Energy  CD: 8s        │    │
│  │ Next: 4.5x damage (500g)       │    │
│  │ [UPGRADE 500g]      [EQUIPPED] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔥 Execute             Lv 1/5  │    │
│  │ Deal 5x to low HP monsters     │    │
│  │ Cost: 25 Energy  CD: 12s       │    │
│  │ Next: 5.5x, 32% threshold      │    │
│  │ [UPGRADE 200g]        [EQUIP]  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Passive Skills Tab

```
┌─────────────────────────────────────────┐
│  EQUIPPED PASSIVES (3/3):               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Sharp Lv3│ │Deep Lv2 │ │Thick Lv1│   │
│  │+15% dmg │ │+10% gold│ │+10% HP  │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  ALL PASSIVE SKILLS:                    │
│  ...                                    │
└─────────────────────────────────────────┘
```

---

## Skill Swap Rules

- Can swap skills anytime in Skills screen
- Cannot swap during active combat (monster spawned)
- Swapping resets cooldowns to 50%
- Swapping does not refund Energy

---

## Constants Reference

```javascript
const SKILL_CONSTANTS = {
  ACTIVE_SLOTS: 4,
  PASSIVE_SLOTS: 3,
  MAX_SKILL_LEVEL: 5,           // Before ascension
  MAX_SKILL_LEVEL_ASCENDED: 10, // After max ascension

  SWAP_COOLDOWN_PENALTY: 0.5,   // 50% cooldown on swap

  // Upgrade cost multipliers
  UPGRADE_MULTIPLIERS: [1, 2.5, 5, 10, 25],

  // Ascension skill level unlocks
  ASCENSION_SKILL_CAPS: {
    0: 5,
    1: 6,
    2: 7,
    3: 8,
    5: 9,
    10: 10
  }
};
```

---

*Skills are the core of build diversity. Every skill must feel impactful and create meaningful choices.*

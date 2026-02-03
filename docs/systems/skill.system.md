# Skill System

> Defines skill discovery, mastery, synergies, and meaningful build choices.

---

## Overview

The skill system creates **meaningful, permanent choices** through:
- **Roguelike Discovery** - Random skill offerings, unchosen skills are LOST
- **Mastery Points** - Limited resource to level skills, forces prioritization
- **Skill Synergies** - Combo bonuses reward themed builds
- **Build Identity** - Each run creates a unique character

**Core Philosophy: Every run should feel different.**

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
- Only equip skills you've **discovered** this run
- Swap discovered skills anytime outside of combat
- Each slot mapped to tap button or keyboard (1-4)

### Passive Skill Slots: 3

```
Equipped Passives:
├── Sharp Blades ★★★ (+15% damage)
├── Deep Pockets ★★ (+10% gold)
└── [EMPTY SLOT]
```

- 3 passive skill slots
- Only equip passives you've **discovered** this run
- Swap discovered passives anytime outside of combat

---

## Skill Discovery (Roguelike System)

### How It Works

At milestone levels, you're offered **3 RANDOM skills** from the available pool:

```
┌─────────────────────────────────────────┐
│         ⭐ LEVEL 10 REACHED! ⭐          │
│                                         │
│    Discover a new skill!                │
│    (Unchosen skills are LOST forever)   │
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
│  ┌─────────────────────────────────┐    │
│  │ 💚 HEAL                          │    │
│  │ Restore 25% of max HP           │    │
│  │              [CHOOSE]           │    │
│  └─────────────────────────────────┘    │
│                                         │
│      ⚠️ You can only pick ONE!          │
│      The others will NOT be available   │
│      this run.                          │
│                                         │
└─────────────────────────────────────────┘
```

### Key Rules

1. **3 Random Offerings** - Each milestone offers 3 skills from the tier pool
2. **Pick 1, Lose 2** - Unchosen skills are GONE this run (not buyable!)
3. **No Guaranteed Skills** - Except Power Strike at Level 1
4. **Weighted Randomness** - Early tiers have more basic skills, later tiers have specialized ones

### Discovery Milestones

| Level | Tier | Pool Size | Skills Offered |
|-------|------|-----------|----------------|
| 1 | Starter | 1 | Power Strike (guaranteed) |
| 3 | Basic | 4 | Sharp Blades, Killer Instinct, Heal, Iron Skin |
| 5 | Basic | 4 | (remaining from Basic pool) |
| 8 | Utility | 4 | Gold Rush, XP Boost, Time Warp, Reflect |
| 10 | Combat | 4 | Execute, Berserk Rage, Crit Surge, Perfect Strike |
| 15 | Combat | 4 | (remaining from Combat pool) |
| 20 | Advanced | 4 | Deep Pockets, Fast Learner, Thick Skin, Regeneration |
| 30 | Advanced | 4 | (remaining from Advanced pool) |
| 40 | Elite | 4 | Undying, Soul Rend, Shield Breaker, Energy Flow |
| 50 | Elite | 4 | (remaining from Elite pool) |
| 60 | Master | 3 | Quick Reflexes, Void Touch, Transcendence |
| 75 | Master | 3 | (remaining from Master pool) |

### Discovery Pool Management

```javascript
const SKILL_POOLS = {
  basic: ['sharp_blades', 'killer_instinct', 'heal', 'iron_skin'],
  utility: ['gold_rush', 'xp_boost', 'time_warp', 'reflect'],
  combat: ['execute', 'berserk_rage', 'crit_surge', 'perfect_strike'],
  advanced: ['deep_pockets', 'fast_learner', 'thick_skin', 'regeneration'],
  elite: ['undying', 'soul_rend', 'shield_breaker', 'energy_flow'],
  master: ['quick_reflexes', 'void_touch', 'transcendence']
};

function getSkillOffering(player, tier) {
  const pool = SKILL_POOLS[tier];
  const undiscovered = pool.filter(s => !player.discoveredSkills.includes(s));

  // Offer 3 random from undiscovered (or all if less than 3 remain)
  return shuffle(undiscovered).slice(0, 3);
}

function discoverSkill(player, skillId, offering) {
  // Add to discovered
  player.discoveredSkills.push(skillId);

  // Mark others as LOST (cannot be discovered this run)
  offering.filter(s => s !== skillId).forEach(s => {
    player.lostSkills.push(s);
  });
}
```

### What This Creates

**Run 1:** Discovered Sharp Blades, Heal, Execute, Deep Pockets...
→ Offensive sustain build

**Run 2:** Discovered Killer Instinct, Iron Skin, Berserk Rage, Thick Skin...
→ Tanky crit build

**Run 3:** Discovered Sharp Blades, Iron Skin, Crit Surge, Gold Rush...
→ Farming build with balanced offense/defense

**Every run is different!**

---

## Mastery Points (Limited Upgrades)

### The Problem with Unlimited Upgrades

If you can max every skill, there's no choice - just grind enough gold.

### The Solution: Mastery Points

**Mastery Points** are a limited resource used to upgrade skills:

```javascript
const MASTERY_CONFIG = {
  // Total Mastery Points available per run
  totalPoints: 20,

  // Points earned at each milestone
  pointsPerMilestone: {
    3: 1, 5: 1, 8: 1, 10: 2,
    15: 2, 20: 2, 30: 2, 40: 3,
    50: 3, 60: 3
  },

  // Cost per skill level
  levelCost: {
    1: 0,  // Discovery gives Level 1 free
    2: 1,
    3: 2,
    4: 3,
    5: 4
  }
};
```

### Upgrade Costs

| Skill Level | Mastery Cost | Gold Cost | Cumulative |
|-------------|--------------|-----------|------------|
| 1 (Discovery) | 0 | 0 | 0 MP |
| 2 | 1 MP | 100g | 1 MP |
| 3 | 2 MP | 250g | 3 MP |
| 4 | 3 MP | 500g | 6 MP |
| 5 | 4 MP | 1,000g | 10 MP |

**To max 1 skill: 10 Mastery Points**
**Total available: 20 Mastery Points**
**Can max only 2 skills OR spread across many**

### Strategic Implications

With only 20 MP total, you must choose:
- **Specialist:** Max 2 skills (10 + 10 = 20 MP)
- **Generalist:** Level 3 on 6-7 skills (3 × 7 = 21 MP, close)
- **Hybrid:** Max 1 skill + Level 3 on 3 skills (10 + 9 = 19 MP)

### Mastery UI

```
┌─────────────────────────────────────────┐
│         MASTERY POINTS                  │
│         ████████░░░░░░░░░░░░  8/20     │
├─────────────────────────────────────────┤
│                                         │
│  ⚔️ Power Strike     ★★★★★  (MAXED)    │
│     [10 MP invested]                    │
│                                         │
│  💚 Heal             ★★☆☆☆             │
│     [1 MP invested]                     │
│     [UPGRADE ★★→★★★: 2 MP + 250g]      │
│                                         │
│  ⚡ Execute          ★☆☆☆☆             │
│     [0 MP invested]                     │
│     [UPGRADE ★→★★: 1 MP + 100g]        │
│                                         │
└─────────────────────────────────────────┘
```

---

## Skill Synergies

### What Are Synergies?

When you discover certain skill combinations, you unlock **bonus effects**:

```
┌─────────────────────────────────────────┐
│  🔗 SYNERGY UNLOCKED!                   │
│                                         │
│  "BERSERKER'S FURY"                     │
│  Power Strike + Berserk Rage            │
│                                         │
│  Bonus: Power Strike deals +50%         │
│  damage while Berserk is active!        │
│                                         │
└─────────────────────────────────────────┘
```

### Synergy List

| Synergy Name | Skills Required | Bonus Effect |
|--------------|-----------------|--------------|
| **Berserker's Fury** | Power Strike + Berserk Rage | Power Strike +50% during Berserk |
| **Executioner** | Execute + Killer Instinct | Execute threshold +10% |
| **Life Siphon** | Heal + Soul Rend | Heal grants +10% lifesteal for 5s |
| **Iron Fortress** | Iron Skin + Thick Skin | +5% permanent damage reduction |
| **Gold Digger** | Gold Rush + Deep Pockets | +10% permanent gold find |
| **Scholar** | XP Boost + Fast Learner | +10% permanent XP |
| **Time Lord** | Time Warp + Perfect Strike | Time Warp also slows YOUR cooldowns |
| **Critical Mass** | Crit Surge + Killer Instinct | Crits have 10% chance to refund Energy |
| **Regenerator** | Heal + Regeneration | Out-of-combat regen doubled |
| **Void Walker** | Void Touch + Soul Rend | Soul Rend ignores all armor |
| **Transcendent** | Transcendence + Any 3 Master skills | Duration +15 seconds |

### Synergy Discovery

Synergies are discovered **automatically** when you have both required skills:

```javascript
function checkSynergies(player) {
  for (const synergy of SYNERGIES) {
    const hasAll = synergy.requiredSkills.every(
      s => player.discoveredSkills.includes(s)
    );

    if (hasAll && !player.unlockedSynergies.includes(synergy.id)) {
      player.unlockedSynergies.push(synergy.id);
      showSynergyUnlockedModal(synergy);
    }
  }
}
```

### Why Synergies Matter

- **Rewards Themed Builds:** Going "all offense" unlocks offensive synergies
- **Adds Discovery Joy:** "I got Execute AND Killer Instinct - that's a synergy!"
- **Strategic Depth:** Sometimes pick a weaker skill to unlock a synergy
- **Replayability:** "This run I'll try to unlock Gold Digger synergy"

---

## Skill Management

### Swapping Equipped Skills

Players can swap **discovered** skills anytime outside combat:

```javascript
const SKILL_SWAP_RULES = {
  allowedDuring: ['idle', 'waiting', 'shop', 'skills_screen'],
  blockedDuring: ['combat', 'monster_attacking', 'boss_fight'],
  swapCost: 0,
  swapCooldown: 0
};
```

**You can only swap between skills you've DISCOVERED this run.**

### What Happens at Milestones?

```javascript
function handleMilestone(player, level) {
  const milestone = MILESTONES[level];
  if (!milestone) return;

  // 1. Award Mastery Points
  const mpGain = MASTERY_CONFIG.pointsPerMilestone[level] || 0;
  player.masteryPoints += mpGain;

  // 2. Offer skill discovery (if applicable)
  const tier = milestone.skillTier;
  if (tier) {
    const offering = getSkillOffering(player, tier);
    if (offering.length > 0) {
      showSkillDiscoveryModal(offering);
    }
  }
}
```

### Skills Screen

```
┌─────────────────────────────────────────┐
│ ← Back     SKILLS     MP: 8/20  💰12,450│
├─────────────────────────────────────────┤
│  [⚔️ Discovered]  [🔗 Synergies]        │
├─────────────────────────────────────────┤
│                                         │
│  EQUIPPED ACTIVE (4/4):                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ ⚔️ │ │ 💚 │ │ 💀 │ │ ░░ │           │
│  │★★★★│ │★★☆ │ │★☆☆ │ │Emp │           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
│  EQUIPPED PASSIVE (2/3):                │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Sharp ★★│ │Deep ★★ │ │ Empty  │       │
│  └────────┘ └────────┘ └────────┘       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  YOUR DISCOVERED SKILLS:                │
│                                         │
│  ⚔️ Power Strike ★★★★★ (MAXED)          │
│  💚 Heal ★★☆☆☆                          │
│     [UPGRADE: 2 MP + 250g]              │
│  💀 Execute ★☆☆☆☆                       │
│     [UPGRADE: 1 MP + 100g]              │
│  🗡️ Sharp Blades ★★☆☆☆                 │
│     [UPGRADE: 2 MP + 250g]              │
│  💰 Deep Pockets ★★☆☆☆                  │
│     [UPGRADE: 2 MP + 250g]              │
│                                         │
│  ─────────────────────────────────────  │
│  LOST THIS RUN: Killer Instinct, Iron   │
│  Skin, Berserk Rage, Gold Rush...       │
│                                         │
└─────────────────────────────────────────┘
```

---

## Skill Categories

### Active Skills (15 Total)

#### Offense Active (5 skills)

| Skill | Pool | Energy | Cooldown | Effect |
|-------|------|--------|----------|--------|
| **Power Strike** | Starter | 15 | 8s | 3x-5x damage next attack |
| **Execute** | Combat | 25 | 12s | 5x-7x damage if monster <30-40% HP |
| **Berserk Rage** | Combat | 30 | 45s | 2x-3x damage, 2x-1x damage taken, 15s |
| **Crit Surge** | Combat | 25 | 30s | +50-75% crit chance for 10-15s |
| **Soul Rend** | Elite | 35 | 20s | Deal 10-15% of monster max HP |

#### Defense Active (4 skills)

| Skill | Pool | Energy | Cooldown | Effect |
|-------|------|--------|----------|--------|
| **Heal** | Basic | 20 | 15s | Restore 25-50% max HP |
| **Iron Skin** | Basic | 25 | 30s | 50-75% damage reduction for 10-15s |
| **Reflect** | Utility | 30 | 25s | Reflect next attack at 100-200% |
| **Undying** | Elite | 50 | 180s | Survive fatal blow with 1-25% HP |

#### Utility Active (6 skills)

| Skill | Pool | Energy | Cooldown | Effect |
|-------|------|--------|----------|--------|
| **Gold Rush** | Utility | 20 | 60s | +100-200% gold for 30-45s |
| **XP Boost** | Utility | 20 | 60s | +100-200% XP for 30-45s |
| **Time Warp** | Utility | 40 | 90s | Freeze monster 5-10s |
| **Perfect Strike** | Combat | 30 | 30s | Timing mode: 2-3x/4-6x damage |
| **Shield Breaker** | Elite | 25 | 15s | Break shields, +50-75% vs shielded |
| **Transcendence** | Master | 100 | 300s | Invulnerable +100-150% everything 30-45s |

### Passive Skills (9 Total)

#### Offense Passive (3 skills)

| Skill | Pool | Effect per Level |
|-------|------|------------------|
| **Sharp Blades** | Basic | +5% damage per level (max +25%) |
| **Killer Instinct** | Basic | +3% crit chance per level (max +15%) |
| **Void Touch** | Master | +5% armor penetration per level (max +25%) |

#### Defense Passive (3 skills)

| Skill | Pool | Effect per Level |
|-------|------|------------------|
| **Thick Skin** | Advanced | +10% max HP per level (max +50%) |
| **Regeneration** | Advanced | +0.5% HP/sec per level (max +3%) |
| **Quick Reflexes** | Master | +0.2s attack warning per level (max +1s) |

#### Utility Passive (3 skills)

| Skill | Pool | Effect per Level |
|-------|------|------------------|
| **Deep Pockets** | Advanced | +5% gold per level (max +25%) |
| **Fast Learner** | Advanced | +5% XP per level (max +25%) |
| **Energy Flow** | Elite | +10% Energy gain per level (max +50%) |

---

## Skill Details

### Starter Pool (Level 1)

**Power Strike** - Guaranteed for all players
```
Type: Active (Offense)
Energy: 15 | Cooldown: 8s

Effect: Next attack deals multiplied damage

Levels:
  ★☆☆☆☆: 3.0x damage
  ★★☆☆☆: 3.5x damage
  ★★★☆☆: 4.0x damage
  ★★★★☆: 4.5x damage
  ★★★★★: 5.0x damage
```

### Basic Pool (Levels 3, 5)

**Sharp Blades** (Passive)
```
Effect: Permanent damage increase

Levels:
  ★☆☆☆☆: +5% damage
  ★★☆☆☆: +10% damage
  ★★★☆☆: +15% damage
  ★★★★☆: +20% damage
  ★★★★★: +25% damage
```

**Killer Instinct** (Passive)
```
Effect: Permanent crit chance increase

Levels:
  ★☆☆☆☆: +3% crit
  ★★☆☆☆: +6% crit
  ★★★☆☆: +9% crit
  ★★★★☆: +12% crit
  ★★★★★: +15% crit
```

**Heal** (Active)
```
Energy: 20 | Cooldown: 15s

Effect: Restore percentage of max HP

Levels:
  ★☆☆☆☆: 25% HP
  ★★☆☆☆: 30% HP
  ★★★☆☆: 35% HP
  ★★★★☆: 40% HP
  ★★★★★: 50% HP
```

**Iron Skin** (Active)
```
Energy: 25 | Cooldown: 30s

Effect: Reduce damage taken for duration

Levels:
  ★☆☆☆☆: 50% reduction, 10s
  ★★☆☆☆: 55% reduction, 11s
  ★★★☆☆: 60% reduction, 12s
  ★★★★☆: 65% reduction, 13s
  ★★★★★: 75% reduction, 15s
```

### Utility Pool (Level 8)

**Gold Rush** (Active)
```
Energy: 20 | Cooldown: 60s

Effect: Bonus gold from kills

Levels:
  ★☆☆☆☆: +100% gold, 30s
  ★★☆☆☆: +120% gold, 32s
  ★★★☆☆: +140% gold, 34s
  ★★★★☆: +160% gold, 36s
  ★★★★★: +200% gold, 45s
```

**XP Boost** (Active)
```
Energy: 20 | Cooldown: 60s

Effect: Bonus XP from kills

Levels:
  ★☆☆☆☆: +100% XP, 30s
  ★★☆☆☆: +120% XP, 32s
  ★★★☆☆: +140% XP, 34s
  ★★★★☆: +160% XP, 36s
  ★★★★★: +200% XP, 45s
```

**Time Warp** (Active)
```
Energy: 40 | Cooldown: 90s

Effect: Freeze monster (can still take damage)

Levels:
  ★☆☆☆☆: 5s freeze
  ★★☆☆☆: 6s freeze
  ★★★☆☆: 7s freeze
  ★★★★☆: 8s freeze
  ★★★★★: 10s freeze, 75s cooldown
```

**Reflect** (Active)
```
Energy: 30 | Cooldown: 25s

Effect: Reflect next monster attack back

Levels:
  ★☆☆☆☆: 100% reflect
  ★★☆☆☆: 125% reflect
  ★★★☆☆: 150% reflect
  ★★★★☆: 175% reflect
  ★★★★★: 200% reflect
```

### Combat Pool (Levels 10, 15)

**Execute** (Active)
```
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

**Berserk Rage** (Active)
```
Energy: 30 | Cooldown: 45s

Effect: Damage amp with risk for 15s

Levels:
  ★☆☆☆☆: 2x damage, 2x damage taken
  ★★☆☆☆: 2.2x damage, 1.8x damage taken
  ★★★☆☆: 2.4x damage, 1.6x damage taken
  ★★★★☆: 2.6x damage, 1.4x damage taken
  ★★★★★: 3x damage, 1x damage taken (!)
```

**Crit Surge** (Active)
```
Energy: 25 | Cooldown: 30s

Effect: Temporary crit chance boost

Levels:
  ★☆☆☆☆: +50% crit, 10s
  ★★☆☆☆: +55% crit, 11s
  ★★★☆☆: +60% crit, 12s
  ★★★★☆: +65% crit, 13s
  ★★★★★: +75% crit, 15s
```

**Perfect Strike** (Active)
```
Energy: 30 | Cooldown: 30s

Effect: Timing mini-game mode
        Good timing: 2x | Perfect timing: 4x | Miss: 0.5x + 3% HP

Levels:
  ★☆☆☆☆: 5s, 2x/4x
  ★★☆☆☆: 6s, 2.2x/4.4x
  ★★★☆☆: 7s, 2.4x/4.8x
  ★★★★☆: 8s, 2.6x/5.2x
  ★★★★★: 10s, 3x/6x
```

### Advanced Pool (Levels 20, 30)

**Deep Pockets** (Passive)
```
Effect: Permanent gold find increase

Levels:
  ★☆☆☆☆: +5% gold
  ★★☆☆☆: +10% gold
  ★★★☆☆: +15% gold
  ★★★★☆: +20% gold
  ★★★★★: +25% gold
```

**Fast Learner** (Passive)
```
Effect: Permanent XP increase

Levels:
  ★☆☆☆☆: +5% XP
  ★★☆☆☆: +10% XP
  ★★★☆☆: +15% XP
  ★★★★☆: +20% XP
  ★★★★★: +25% XP
```

**Thick Skin** (Passive)
```
Effect: Permanent max HP increase

Levels:
  ★☆☆☆☆: +10% HP
  ★★☆☆☆: +20% HP
  ★★★☆☆: +30% HP
  ★★★★☆: +40% HP
  ★★★★★: +50% HP
```

**Regeneration** (Passive)
```
Effect: HP regeneration per second

Levels:
  ★☆☆☆☆: +0.5% HP/sec
  ★★☆☆☆: +1.0% HP/sec
  ★★★☆☆: +1.5% HP/sec
  ★★★★☆: +2.0% HP/sec
  ★★★★★: +3.0% HP/sec
```

### Elite Pool (Levels 40, 50)

**Undying** (Active)
```
Energy: 50 | Cooldown: 180s

Effect: Survive fatal blow (30s duration)

Levels:
  ★☆☆☆☆: Survive with 1% HP
  ★★☆☆☆: Survive with 5% HP
  ★★★☆☆: Survive with 10% HP
  ★★★★☆: Survive with 15% HP
  ★★★★★: Survive with 25% HP
```

**Soul Rend** (Active)
```
Energy: 35 | Cooldown: 20s

Effect: Deal % of monster's max HP
        (Min: 1x attack, Max: 10x attack)

Levels:
  ★☆☆☆☆: 10% max HP
  ★★☆☆☆: 11% max HP
  ★★★☆☆: 12% max HP
  ★★★★☆: 13% max HP
  ★★★★★: 15% max HP
```

**Shield Breaker** (Active)
```
Energy: 25 | Cooldown: 15s

Effect: Break shields, bonus vs shielded

Levels:
  ★☆☆☆☆: +50% vs shielded, 10s
  ★★☆☆☆: +55% vs shielded, 11s
  ★★★☆☆: +60% vs shielded, 12s
  ★★★★☆: +65% vs shielded, 13s
  ★★★★★: +75% vs shielded, 15s
```

**Energy Flow** (Passive)
```
Effect: Permanent Energy gain increase

Levels:
  ★☆☆☆☆: +10% Energy
  ★★☆☆☆: +20% Energy
  ★★★☆☆: +30% Energy
  ★★★★☆: +40% Energy
  ★★★★★: +50% Energy
```

### Master Pool (Levels 60, 75)

**Quick Reflexes** (Passive)
```
Effect: More time to react to monster attacks

Levels:
  ★☆☆☆☆: +0.2s warning
  ★★☆☆☆: +0.4s warning
  ★★★☆☆: +0.6s warning
  ★★★★☆: +0.8s warning
  ★★★★★: +1.0s warning
```

**Void Touch** (Passive)
```
Effect: Ignore monster armor

Levels:
  ★☆☆☆☆: Ignore 5% armor
  ★★☆☆☆: Ignore 10% armor
  ★★★☆☆: Ignore 15% armor
  ★★★★☆: Ignore 20% armor
  ★★★★★: Ignore 25% armor
```

**Transcendence** (Active)
```
Energy: 100 | Cooldown: 300s

Effect: Ultimate power mode

Levels:
  ★☆☆☆☆: Invulnerable, +100% all, 30s
  ★★☆☆☆: Invulnerable, +110% all, 32s
  ★★★☆☆: Invulnerable, +120% all, 34s
  ★★★★☆: Invulnerable, +130% all, 36s
  ★★★★★: Invulnerable, +150% all, 45s
```

---

---

## Build Examples

### Example Run 1: "Glass Cannon"

**Discovered Skills:**
- Power Strike (guaranteed)
- Sharp Blades (from Basic)
- Killer Instinct (from Basic)
- Execute (from Combat)
- Berserk Rage (from Combat) - Unlocked synergy: **Berserker's Fury!**
- Fast Learner (from Advanced)

**Mastery Investment (20 MP):**
- Power Strike ★★★★★ (10 MP) - Main damage
- Killer Instinct ★★★ (3 MP) - Crit foundation
- Execute ★★★ (3 MP) - Finish power
- Berserk Rage ★★ (1 MP) - Synergy active
- Others ★ (free)

**Synergies Unlocked:**
- Berserker's Fury (+50% Power Strike during Berserk)
- Executioner (+10% Execute threshold from Killer Instinct)

**Playstyle:** Burst everything. Use Berserk + Power Strike combo for massive damage, Execute to finish. Squishy but deadly.

---

### Example Run 2: "Immortal Farmer"

**Discovered Skills:**
- Power Strike (guaranteed)
- Heal (from Basic)
- Iron Skin (from Basic)
- Gold Rush (from Utility)
- Deep Pockets (from Advanced)
- Thick Skin (from Advanced)
- Undying (from Elite)

**Mastery Investment (20 MP):**
- Heal ★★★★★ (10 MP) - Max healing
- Thick Skin ★★★★ (6 MP) - Huge HP pool
- Deep Pockets ★★ (1 MP) - Gold bonus
- Gold Rush ★★ (1 MP) - Active gold buff
- Others ★ (free)

**Synergies Unlocked:**
- Iron Fortress (Iron Skin + Thick Skin = +5% permanent DR)

**Playstyle:** Unkillable gold farmer. Lower DPS but never dies. Stack gold bonuses for maximum income.

---

### Example Run 3: "Critical Master"

**Discovered Skills:**
- Power Strike (guaranteed)
- Killer Instinct (from Basic)
- Heal (from Basic)
- Crit Surge (from Combat)
- Perfect Strike (from Combat)
- Energy Flow (from Elite)

**Mastery Investment (20 MP):**
- Killer Instinct ★★★★★ (10 MP) - 15% base crit
- Crit Surge ★★★★ (6 MP) - Huge crit windows
- Energy Flow ★★ (1 MP) - More skill uptime
- Power Strike ★★ (1 MP)
- Others ★ (free)

**Synergies Unlocked:**
- Critical Mass (Crit Surge + Killer Instinct = 10% crit Energy refund)

**Playstyle:** Crit machine. Stack crit to absurd levels during Crit Surge, refund Energy on crits for more skill spam.

---

### Why These Runs Are Different

| Aspect | Glass Cannon | Immortal Farmer | Critical Master |
|--------|--------------|-----------------|-----------------|
| Main Stat | Raw Damage | HP/Sustain | Crit Chance |
| Survivability | Low | Very High | Medium |
| Gold/min | Medium | High | Medium |
| Skill Ceiling | Medium | Low | High |
| Boss Speed | Fast | Slow | Variable |

**Same game, completely different experiences!**

---

## Ascension & Skills

### Skill Level Caps

| Ascension Rank | Max Skill Level |
|----------------|-----------------|
| 0 | ★★★★★ (5) |
| 1 | ★★★★★★ (6) |
| 3 | ★★★★★★★ (7) |
| 5 | ★★★★★★★★ (8) |
| 7 | ★★★★★★★★★ (9) |
| 10 | ★★★★★★★★★★ (10) |

### Ascension Mastery Bonus

Each Ascension rank grants **+2 Mastery Points** for the next run:

| Ascension | Total Mastery Points |
|-----------|---------------------|
| 0 | 20 |
| 1 | 22 |
| 2 | 24 |
| 5 | 30 |
| 10 | 40 |

More Ascension = More build flexibility!

---

## Constants Reference

```javascript
const SKILL_CONSTANTS = {
  // Slots
  ACTIVE_SLOTS: 4,
  PASSIVE_SLOTS: 3,

  // Mastery System
  BASE_MASTERY_POINTS: 20,
  MASTERY_PER_ASCENSION: 2,
  MASTERY_COST_PER_LEVEL: [0, 1, 2, 3, 4],  // Index = target level - 1

  // Skill Levels
  MAX_SKILL_LEVEL: 5,
  MAX_SKILL_LEVEL_ASCENDED: 10,

  // Swap Rules
  SWAP_COOLDOWN_PENALTY: 0.5,  // 50% cooldown on swap

  // Gold costs per level (in addition to Mastery)
  GOLD_COST_PER_LEVEL: [0, 100, 250, 500, 1000],

  // Discovery
  SKILLS_OFFERED_PER_MILESTONE: 3,

  // Pools
  SKILL_POOLS: {
    starter: ['power_strike'],
    basic: ['sharp_blades', 'killer_instinct', 'heal', 'iron_skin'],
    utility: ['gold_rush', 'xp_boost', 'time_warp', 'reflect'],
    combat: ['execute', 'berserk_rage', 'crit_surge', 'perfect_strike'],
    advanced: ['deep_pockets', 'fast_learner', 'thick_skin', 'regeneration'],
    elite: ['undying', 'soul_rend', 'shield_breaker', 'energy_flow'],
    master: ['quick_reflexes', 'void_touch', 'transcendence']
  }
};
```

---

## Summary: Why This System Works

### Old System Problems
- Pick 1 of 2, buy other later = No real choice
- Eventually unlock everything = No identity
- All builds converge = No replayability

### New System Solutions
- Pick 1 of 3, others GONE = Meaningful choice
- Limited Mastery = Can't max everything
- Random offerings = Every run unique
- Synergies = Combos reward themed builds

**Result: Players WANT to replay to try different builds!**

---

*Skills are the soul of your character. Make every choice count.*

# Health System

> Defines player HP, damage, healing, death, and recovery mechanics.

---

## Overview

The health system adds stakes to combat:
- Player has an HP bar (not just monsters)
- Certain monster attacks deal damage to player
- At 0 HP, player "retreats" with penalties
- Healing comes from skills and passive regen

---

## Player HP

### HP Calculation

```javascript
// Base HP
const BASE_HP = 100;

// HP per level
const HP_PER_LEVEL = 10;

// Formula
function calculateMaxHP(level, bonuses) {
  const baseHP = BASE_HP + (HP_PER_LEVEL * (level - 1));
  const percentBonus = 1 + (bonuses.thickSkin + bonuses.items + bonuses.ascension);
  return Math.floor(baseHP * percentBonus);
}

// Examples:
// Level 1:  100 HP
// Level 10: 190 HP
// Level 50: 590 HP
// Level 100: 1,090 HP
```

### HP Bonuses

| Source | Bonus |
|--------|-------|
| Thick Skin Lv 1 | +10% max HP |
| Thick Skin Lv 2 | +20% max HP |
| Thick Skin Lv 3 | +30% max HP |
| Thick Skin Lv 4 | +40% max HP |
| Thick Skin Lv 5 | +50% max HP |
| Accessory (rare) | +5-20% max HP |
| Ascension Lv 1 | +50 flat HP |
| Ascension Lv 5 | +250 flat HP |

### Example HP Values

| Level | Base | With Thick Skin Lv 3 | With Ascension 3 |
|-------|------|----------------------|------------------|
| 1 | 100 | 130 | 250 |
| 25 | 340 | 442 | 490 |
| 50 | 590 | 767 | 740 |
| 100 | 1,090 | 1,417 | 1,240 |

---

## HP Bar Display

```
Player HP:
❤️ ████████████████░░░░░░░░  720 / 1,090

Visual states:
- Green (>50%): Healthy
- Yellow (25-50%): Caution
- Red (<25%): Critical (pulses)
```

---

## Taking Damage

### Damage Sources

| Source | Damage | When |
|--------|--------|------|
| Aggressive monster attack | 10% max HP | Click during attack phase |
| Swift monster escape | 5% max HP | Timer expires |
| Perfect Strike miss | 3% max HP | Bad timing during skill |
| Berserker self-damage | Varies | Berserk Rage active |

### Damage Calculation

```javascript
function calculateDamage(baseDamagePercent, player, monster) {
  // Base damage is % of player max HP
  let damage = Math.floor(player.maxHP * baseDamagePercent);

  // Monster level scaling (higher zones hit harder)
  const levelDiff = monster.level - player.level;
  if (levelDiff > 0) {
    damage = Math.floor(damage * (1 + levelDiff * 0.02)); // +2% per level above
  }

  // Damage reduction from Iron Skin
  if (player.buffs.ironSkin) {
    damage = Math.floor(damage * (1 - player.buffs.ironSkinReduction));
  }

  // Damage reduction from equipment
  damage = Math.floor(damage * (1 - player.stats.damageReduction));

  // Minimum 1 damage
  return Math.max(damage, 1);
}
```

### Damage Numbers (Player)

When player takes damage:
```
Visual:
- Screen flashes red briefly (100ms)
- Damage number floats above HP bar in red
- HP bar depletes with animation
- Low HP warning if below 25%
```

---

## Healing

### Healing Sources

| Source | Amount | Trigger |
|--------|--------|---------|
| Passive Regen | 1.5% HP/sec base | Always |
| Regeneration passive | +0.5-3% HP/sec | Skill equipped |
| Heal skill | 25-50% max HP | Active skill use |
| Level Up | 100% (full heal) | On level up |
| Zone Travel | 25% max HP | Changing zones |
| Death Recovery | 100% (full heal) | After retreat |

### Passive Regeneration

```javascript
// Base regen rate
const BASE_HP_REGEN = 0.015; // 1.5% per second (~66 seconds to full heal)

// With Regeneration skill
function calculateRegenRate(player) {
  let rate = BASE_HP_REGEN;

  // Regeneration passive skill
  const regenSkillLevel = player.passiveSkills.regeneration || 0;
  rate += regenSkillLevel * 0.005; // +0.5% per level

  // Equipment bonuses
  rate += player.stats.hpRegenBonus || 0;

  return rate;
}

// Applied every game tick
function applyRegen(player, deltaTime) {
  if (player.hp < player.maxHP) {
    const regenAmount = player.maxHP * calculateRegenRate(player) * deltaTime;
    player.hp = Math.min(player.hp + regenAmount, player.maxHP);
  }
}
```

### Heal Skill

```javascript
function useHealSkill(player, skillLevel) {
  const healPercents = [0.25, 0.30, 0.35, 0.40, 0.50]; // Lv 1-5
  const healAmount = Math.floor(player.maxHP * healPercents[skillLevel - 1]);

  player.hp = Math.min(player.hp + healAmount, player.maxHP);

  // Visual feedback
  showHealAnimation(healAmount);
  showFloatingNumber(`+${healAmount}`, 'green');
}
```

---

## Death (Retreat)

### At 0 HP

When player HP reaches 0:

```
┌─────────────────────────────────────────┐
│              💀 RETREAT! 💀              │
│                                         │
│     You've been forced to retreat...    │
│                                         │
│  LOST:                                  │
│  ├── Level progress (37 → 30)           │
│  ├── 50% of current gold (1,240g lost)  │
│  └── Current monster escaped            │
│                                         │
│  KEPT:                                  │
│  ├── All equipment                      │
│  ├── All skills                         │
│  └── Zone unlocks                       │
│                                         │
│           [CONTINUE]                    │
└─────────────────────────────────────────┘
```

### Death Penalties

```javascript
function handlePlayerDeath(player) {
  // 1. Reset to last milestone level
  const milestone = Math.floor(player.level / 10) * 10;
  player.level = Math.max(milestone, 1);

  // 2. Lose 50% of current gold
  const goldLost = Math.floor(player.gold * 0.5);
  player.gold -= goldLost;

  // 3. Current monster escapes (no loot)
  player.currentMonster = null;

  // 4. Full heal on respawn
  player.hp = player.maxHP;
  player.energy = player.maxEnergy;

  // 5. Stay in same zone
  // (player can choose to go back if zone is too hard)

  return { goldLost, levelLost: player.level - milestone };
}
```

### Milestone Levels

```
Milestones: 1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100

Examples:
- Die at level 7 → Back to level 1
- Die at level 15 → Back to level 10
- Die at level 37 → Back to level 30
- Die at level 99 → Back to level 90
```

### Undying Skill

If player has Undying skill active:
```javascript
function checkUndying(player, damage) {
  if (player.hp - damage <= 0 && player.buffs.undying) {
    // Trigger Undying
    player.hp = Math.floor(player.maxHP * player.buffs.undyingSurvivePercent);
    player.buffs.undying = false; // Consumed
    showUndyingAnimation();
    return true; // Survived
  }
  return false;
}
```

---

## Damage Reduction

### Sources

| Source | Reduction |
|--------|-----------|
| Iron Skin Lv 1 | 50% for 10s |
| Iron Skin Lv 5 | 75% for 15s |
| Accessory (rare) | 5-15% permanent |
| Reflect (on trigger) | 100% (reflected) |

### Stacking

```javascript
// Damage reduction is multiplicative
// Example: 50% Iron Skin + 10% accessory
// Total reduction: 1 - (0.5 × 0.9) = 55%

function calculateTotalReduction(player) {
  let multiplier = 1;

  if (player.buffs.ironSkin) {
    multiplier *= (1 - player.buffs.ironSkinReduction);
  }

  multiplier *= (1 - player.stats.damageReduction);

  return 1 - multiplier; // Total reduction percentage
}
```

---

## Shield Mechanic

### Shield Bar

```
Shield: 🔷░░░░░░░░░░░░░░░░░░░░  0 / 200

When active:
Shield: 🔷████████████░░░░░░░░  150 / 200
HP:     ❤️████████████████████  1,090 / 1,090
```

### Shield Rules

- Absorbs damage before HP
- Does not regenerate naturally
- Granted by Shield Wall skill (or items)
- Maximum shield = 30% of max HP (default)

---

## HP Events

### Visual Feedback

| Event | Visual |
|-------|--------|
| Take damage | Red flash, damage number, bar depletes |
| Heal | Green glow, heal number, bar fills |
| Low HP | Bar pulses red, warning icon |
| Death | Screen dims, death modal |
| Full heal | Green burst, sparkle effect |

### Sound Effects (Future)

| Event | Sound |
|-------|-------|
| Take damage | Hit sound |
| Low HP | Heartbeat |
| Heal | Healing chime |
| Death | Death sound |

---

## Safe Play vs Risky Play

### Safe Play

```
Strategy:
- Keep HP above 50%
- Use Heal skill preemptively
- Use Iron Skin before boss attacks
- Travel to lower zone if HP is low

Result:
- Slow but steady progress
- Never die
- Never lose levels
```

### Risky Play

```
Strategy:
- Stay at low HP for adrenaline
- Use Berserk Rage (take more damage)
- Skip healing for more DPS
- Push into higher zones early

Result:
- Fast kills when successful
- Risk of death and level loss
- High risk, high reward
```

### Balanced Design

The system should:
- Allow safe players to never die (if they play carefully)
- Reward risky players with faster progression
- Punish reckless play with meaningful but recoverable setbacks
- Never feel unfair (telegraphed attacks, clear mechanics)

---

## Constants Reference

```javascript
const HEALTH_CONSTANTS = {
  BASE_HP: 100,
  HP_PER_LEVEL: 10,

  // Damage percentages (of max HP)
  MONSTER_ATTACK_DAMAGE: 0.10,      // 10%
  SWIFT_ESCAPE_DAMAGE: 0.05,        // 5%
  PERFECT_STRIKE_MISS_DAMAGE: 0.03, // 3%

  // Regeneration
  BASE_HP_REGEN_PERCENT: 0.005,     // 0.5% per second

  // Healing
  LEVEL_UP_HEAL: 1.0,               // 100% (full heal)
  ZONE_TRAVEL_HEAL: 0.25,           // 25%

  // Death
  DEATH_GOLD_LOSS: 0.5,             // 50%
  DEATH_LEVEL_MILESTONE: 10,        // Round down to nearest 10

  // Visual thresholds
  HP_CAUTION_THRESHOLD: 0.5,        // Yellow below 50%
  HP_CRITICAL_THRESHOLD: 0.25       // Red below 25%
};
```

---

*Health creates meaningful stakes. Players should feel tension when low, relief when healed, and learn from deaths without feeling punished unfairly.*

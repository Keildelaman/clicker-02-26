# Ascension System

> Defines the prestige mechanic, permanent bonuses, and post-100 progression.

---

## Overview

Ascension is the end-game prestige system:
- Available at Level 100
- Resets progress in exchange for permanent bonuses
- Increases skill level caps
- Unlocks harder content with better rewards
- Provides infinite replayability

---

## When Can You Ascend?

### Requirements

```
┌─────────────────────────────────────────┐
│           ✨ ASCENSION READY ✨          │
│                                         │
│  Requirements:                          │
│  ✓ Level 100                            │
│  ✓ Defeated Xal'theron (Final Boss)     │
│                                         │
│  [VIEW ASCENSION]                       │
└─────────────────────────────────────────┘
```

Both conditions must be met:
1. Reach Level 100
2. Defeat the final boss (Xal'theron)

### Ascension Button

Once available, shows in:
- Settings screen
- Level display (glowing indicator)
- Zone selection modal

---

## Ascension Screen

```
┌─────────────────────────────────────────┐
│              ✨ ASCENSION ✨             │
│                                         │
│  Current Ascension: 2                   │
│  Next Ascension: 3                      │
│                                         │
│  ═══════════════════════════════════    │
│                                         │
│  YOU WILL GAIN:                         │
│  ┌─────────────────────────────────┐    │
│  │ +5% Base Damage (total: 15%)    │    │
│  │ +5% Base Gold Find (total: 15%) │    │
│  │ +5% Base XP Gain (total: 15%)   │    │
│  │ +50 Base HP (total: 150)        │    │
│  │                                 │    │
│  │ 🆕 Skill Level Cap: 8           │    │
│  │ 🆕 Ascended Monsters (optional) │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ═══════════════════════════════════    │
│                                         │
│  YOU WILL RESET:                        │
│  ┌─────────────────────────────────┐    │
│  │ ⚠️ Level → 1                     │    │
│  │ ⚠️ Gold → 0                      │    │
│  │ ⚠️ Skill Levels → 1 (keep unlocks)│   │
│  │ ⚠️ Zone Progress → Whisperwood   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  YOU WILL KEEP:                         │
│  ┌─────────────────────────────────┐    │
│  │ ✓ All permanent bonuses         │    │
│  │ ✓ All skill unlocks             │    │
│  │ ✓ Equipment (moved to Vault)    │    │
│  │ ✓ Statistics                    │    │
│  │ ✓ Consumables                   │    │
│  └─────────────────────────────────┘    │
│                                         │
│      [ASCEND NOW]      [NOT YET]        │
└─────────────────────────────────────────┘
```

---

## Ascension Bonuses

### Per-Ascension Rewards

Each Ascension grants:

| Bonus | Per Ascension | Cumulative Example (Asc 5) |
|-------|---------------|----------------------------|
| Base Damage | +5% | +25% |
| Base Gold Find | +5% | +25% |
| Base XP Gain | +5% | +25% |
| Base HP | +50 | +250 |

### Bonus Calculation

```javascript
function calculateAscensionBonuses(ascensionLevel) {
  return {
    damageBonus: ascensionLevel * 0.05,      // 5% per ascension
    goldBonus: ascensionLevel * 0.05,        // 5% per ascension
    xpBonus: ascensionLevel * 0.05,          // 5% per ascension
    flatHP: ascensionLevel * 50              // 50 HP per ascension
  };
}

// Example: Ascension Level 5
// +25% damage, +25% gold, +25% XP, +250 HP
```

### Bonuses Are Permanent

- Apply immediately at Level 1
- Stack with all other bonuses
- Never lost, even on death
- Make early game faster each ascension

---

## Skill Level Cap

### Cap Increases

| Ascension Level | Max Skill Level |
|-----------------|-----------------|
| 0 (no ascension) | 5 |
| 1 | 6 |
| 2 | 7 |
| 3 | 8 |
| 5 | 9 |
| 10 | 10 |

### Level 6-10 Upgrades

Higher skill levels provide:
- Stronger effects
- Significantly higher costs
- Sense of continued progression

```javascript
// Example: Power Strike levels 6-10
const POWER_STRIKE_EXTENDED = {
  6: { multiplier: 5.5, cost: 5000 },
  7: { multiplier: 6.0, cost: 10000 },
  8: { multiplier: 6.5, cost: 25000 },
  9: { multiplier: 7.0, cost: 50000 },
  10: { multiplier: 8.0, cost: 100000 }
};
```

---

## What Resets on Ascension

### Full Reset

| Attribute | Before | After |
|-----------|--------|-------|
| Level | 100 | 1 |
| Gold | Any | 0 |
| Skill Levels | Varies | All 1 |
| Zone Progress | All | Whisperwood only |
| Current Monster | Any | None |
| HP | Any | Full |
| Energy | Any | 0 |

### Skills Reset Details

```javascript
function resetSkillsOnAscension(player) {
  // Keep unlocked skills
  // Reset all levels to 1

  for (const skill of player.skills) {
    if (skill.unlocked) {
      skill.level = 1;
    }
  }

  // Keep equipped slots configuration
  // Skills are still equipped, just at level 1
}
```

---

## What You Keep

### Permanent Keeps

| Attribute | Kept | Notes |
|-----------|------|-------|
| Ascension bonuses | ✓ | Cumulative forever |
| Skill unlocks | ✓ | Don't need to unlock again |
| Equipment | ✓ | Moved to Vault |
| Consumables | ✓ | Potions carry over |
| Statistics | ✓ | All-time stats preserved |
| Settings | ✓ | Preferences unchanged |
| Tutorial completion | ✓ | No re-tutorial |

### Equipment Vault

When you ascend, equipment is stored:

```
┌─────────────────────────────────────────┐
│            📦 EQUIPMENT VAULT            │
│                                         │
│  Your pre-ascension equipment is here.  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🗡️ Void Reaver (Lv 80 req)      │    │
│  │ +450 Attack, +15% Crit          │    │
│  │ [WITHDRAW] [SELL 5,000g]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💍 Glacial Band (Lv 65 req)     │    │
│  │ +20% Gold Find, +100 HP         │    │
│  │ [WITHDRAW] [SELL 2,500g]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Note: Items require level to equip     │
└─────────────────────────────────────────┘
```

**Vault Rules:**
- Unlimited vault space
- Can withdraw when you meet level requirement
- Can sell for gold at any level
- Vault is accessible from Shop screen

---

## Ascended Mode

### What Is Ascended Mode?

After Ascension 3, you unlock "Ascended Mode":
- Optional toggle in Zone selection
- Makes monsters harder
- Increases rewards

```
┌─────────────────────────────────────────┐
│              SELECT ZONE                │
├─────────────────────────────────────────┤
│                                         │
│  MODE: [Normal] [⚡ Ascended]           │
│                                         │
│  Ascended Mode:                         │
│  • Monsters have +50% HP                │
│  • Monsters deal +50% damage            │
│  • Gold rewards +75%                    │
│  • XP rewards +75%                      │
│  • Better drop rates                    │
│                                         │
└─────────────────────────────────────────┘
```

### Ascended Monster Scaling

```javascript
const ASCENDED_MODIFIERS = {
  monsterHP: 1.5,           // +50% HP
  monsterDamage: 1.5,       // +50% damage
  goldReward: 1.75,         // +75% gold
  xpReward: 1.75,           // +75% XP
  dropRateMultiplier: 1.5   // +50% drop rates
};
```

### Visual Differences

Ascended monsters have:
- Purple/gold color tint
- "⚡" prefix on name
- Glowing particle effects
- Different death animation

```
Normal: 🐗 Wild Boar
Ascended: ⚡🐗 Ascended Wild Boar (purple tint)
```

---

## Ascension Milestones

### Special Rewards at Milestones

| Ascension | Special Unlock |
|-----------|----------------|
| 1 | Skill level cap 6 |
| 2 | Skill level cap 7 |
| 3 | Ascended Mode, Skill level cap 8 |
| 5 | Skill level cap 9, Title: "Transcendent" |
| 10 | Skill level cap 10, Title: "Void Walker" |
| 25 | Title: "Eternal" |
| 50 | Title: "Legend" |
| 100 | Title: "Clickoria Champion" |

### Titles

Titles display next to player name:
```
⚔️ Hero [Transcendent] - Level 45
```

---

## Ascension Speed Runs

### Why Ascend Multiple Times?

1. **Permanent bonuses stack** - Get stronger base stats
2. **Faster clears** - Early game becomes trivial
3. **Higher skill caps** - Access to powerful upgrades
4. **Ascended mode** - Challenge for experienced players
5. **Titles** - Bragging rights

### Time Estimates

| Ascension | Est. Time to 100 | Total Playtime |
|-----------|------------------|----------------|
| 0 (first) | 8-12 hours | 8-12 hours |
| 1 | 5-7 hours | 13-19 hours |
| 2 | 3-5 hours | 16-24 hours |
| 3 | 2-4 hours | 18-28 hours |
| 5 | 1-2 hours | 20-32 hours |
| 10 | 30-60 min | 25-40 hours |

*Times decrease due to permanent bonuses making early game faster*

---

## Ascension Statistics

### Tracked Stats

```javascript
player.statistics.ascension = {
  totalAscensions: 5,
  fastestRunTime: 3542000,    // ms (59 min)
  totalPlayTime: 126000000,   // ms (35 hours)
  highestAscension: 5,
  ascensionHistory: [
    { level: 1, timestamp: 1234567890, runTime: 28800000 },
    { level: 2, timestamp: 1234600000, runTime: 21600000 },
    // ...
  ]
};
```

### Statistics Display

```
┌─────────────────────────────────────────┐
│            📊 ASCENSION STATS            │
│                                         │
│  Total Ascensions: 5                    │
│  Current Ascension: 5                   │
│                                         │
│  Fastest Run: 59 min (Asc 4→5)          │
│  Slowest Run: 8 hr 12 min (First)       │
│  Total Playtime: 35 hours               │
│                                         │
│  Permanent Bonuses:                     │
│  ├── +25% Damage                        │
│  ├── +25% Gold Find                     │
│  ├── +25% XP Gain                       │
│  └── +250 Base HP                       │
└─────────────────────────────────────────┘
```

---

## Ascension Confirmation

### Safety Check

```
┌─────────────────────────────────────────┐
│           ⚠️ CONFIRM ASCENSION ⚠️        │
│                                         │
│  Are you sure you want to ascend?       │
│                                         │
│  You will LOSE:                         │
│  • Level 100 → Level 1                  │
│  • 125,430 Gold → 0 Gold                │
│  • All zone progress                    │
│                                         │
│  This cannot be undone!                 │
│                                         │
│  Type "ASCEND" to confirm:              │
│  ┌─────────────────────────────────┐    │
│  │ _                               │    │
│  └─────────────────────────────────┘    │
│                                         │
│      [CANCEL]      [CONFIRM]            │
└─────────────────────────────────────────┘
```

Requires typing "ASCEND" to prevent accidents.

---

## Post-Ascension Experience

### First Moments After Ascending

```
┌─────────────────────────────────────────┐
│          ⚡ ASCENSION COMPLETE! ⚡        │
│                                         │
│     You are now Ascension Level 3       │
│                                         │
│     ────────────────────────            │
│                                         │
│     Permanent Bonuses Active:           │
│     +15% Damage                         │
│     +15% Gold                           │
│     +15% XP                             │
│     +150 HP                             │
│                                         │
│     🆕 ASCENDED MODE UNLOCKED!          │
│                                         │
│     Your journey begins anew...         │
│                                         │
│     [BEGIN NEW JOURNEY]                 │
└─────────────────────────────────────────┘
```

### Early Game After Ascension

With bonuses, early zones are much faster:
- Higher base damage = fewer clicks
- More gold = faster upgrades
- More XP = faster levels
- More HP = safer gameplay

---

## Constants Reference

```javascript
const ASCENSION_CONSTANTS = {
  // Requirements
  MIN_LEVEL_TO_ASCEND: 100,
  REQUIRES_FINAL_BOSS: true,

  // Per-ascension bonuses
  DAMAGE_BONUS_PER_ASCENSION: 0.05,    // 5%
  GOLD_BONUS_PER_ASCENSION: 0.05,      // 5%
  XP_BONUS_PER_ASCENSION: 0.05,        // 5%
  HP_BONUS_PER_ASCENSION: 50,          // flat

  // Skill level caps
  SKILL_LEVEL_CAPS: {
    0: 5,
    1: 6,
    2: 7,
    3: 8,
    5: 9,
    10: 10
  },

  // Ascended mode (requires Ascension 3+)
  ASCENDED_MODE_UNLOCK: 3,
  ASCENDED_MONSTER_HP: 1.5,
  ASCENDED_MONSTER_DAMAGE: 1.5,
  ASCENDED_GOLD_MULTIPLIER: 1.75,
  ASCENDED_XP_MULTIPLIER: 1.75,
  ASCENDED_DROP_MULTIPLIER: 1.5,

  // Titles
  TITLES: {
    5: "Transcendent",
    10: "Void Walker",
    25: "Eternal",
    50: "Legend",
    100: "Clickoria Champion"
  }
};
```

---

*Ascension provides infinite end-game progression. Each run feels faster and more powerful, rewarding dedicated players while keeping the core loop engaging.*

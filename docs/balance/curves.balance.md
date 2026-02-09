# Balance Curves

> All scaling formulas, XP tables, and balance tuning numbers.
> This document ensures consistent progression feel across the game.
>
> **Phase 9: "The Grind Matters" Balance Overhaul** — Monster HP, weapon attack,
> gold/XP rewards, and prices retuned to create a "wave" difficulty pattern.

---

## Core Philosophy

1. **Early game is fast** - Constant dopamine, quick levels
2. **Mid game is engaging** - Meaningful choices, steady progress
3. **Late game is rewarding** - Long-term goals, prestige tease
4. **Always:** "Just one more..." feeling
5. **Wave pattern:** Each zone cycles hard → gear → easy → harder → gear → easy (Phase 9)

---

## XP Curve

### Formula

```javascript
function xpToNextLevel(level) {
  const BASE_XP = 100;
  const GROWTH_RATE = 0.12;  // 12% increase per level

  return Math.floor(BASE_XP * Math.pow(1 + GROWTH_RATE, level - 1));
}
```

### Full XP Table

| Level | XP to Next | Cumulative XP | Est. Time* |
|-------|------------|---------------|------------|
| 1 | 100 | 0 | 0:00 |
| 2 | 112 | 100 | 0:30 |
| 3 | 125 | 212 | 1:00 |
| 4 | 140 | 337 | 1:30 |
| 5 | 157 | 477 | 2:00 |
| 6 | 176 | 634 | 2:40 |
| 7 | 197 | 810 | 3:20 |
| 8 | 221 | 1,007 | 4:00 |
| 9 | 247 | 1,228 | 5:00 |
| 10 | 277 | 1,475 | 6:00 |
| 15 | 489 | 3,401 | 12:00 |
| 20 | 861 | 6,827 | 22:00 |
| 25 | 1,517 | 12,638 | 38:00 |
| 30 | 2,674 | 22,414 | 1:00:00 |
| 35 | 4,712 | 38,559 | 1:30:00 |
| 40 | 8,304 | 65,026 | 2:15:00 |
| 45 | 14,636 | 108,353 | 3:30:00 |
| 50 | 25,794 | 179,237 | 5:30:00 |
| 60 | 80,180 | 479,024 | 12:00:00 |
| 70 | 249,222 | 1,262,827 | 26:00:00 |
| 80 | 774,702 | 3,301,135 | 52:00:00 |
| 90 | 2,408,058 | 8,594,437 | 90:00:00 |
| 100 | - | 21,984,765 | 150:00:00 |

*Estimated active play time with average progression

### Level Time Targets

| Level Range | Target Time per Level | Notes |
|-------------|----------------------|-------|
| 1-10 | 30s - 2min | Hook the player |
| 10-25 | 2-5min | Build habits |
| 25-40 | 5-10min | Meaningful sessions |
| 40-60 | 10-20min | Engaged grinding |
| 60-80 | 20-40min | Dedicated play |
| 80-100 | 40min-1hr+ | Endgame dedication |

---

## Monster Scaling (Phase 9)

### Health Formula

Base health is defined per monster, then scales with level:

```javascript
function monsterHealth(monster, level) {
  const levelBonus = level - monster.levelMin;
  return monster.baseHealth + (monster.healthPerLevel * levelBonus);
}
```

### Zone HP Targets (Phase 9)

Calculated via "clicks budget" approach:
- **Zone entry with prev boss weapon** = 12-15 clicks (weakest monster)
- **Zone entry with prev boss weapon** = 25-38 clicks (strongest monster)
- **With zone uncommon weapon** = 8-19 clicks (satisfying power spike)

```javascript
const ZONE_HP_TARGETS = {
  whisperwood: { baseHP: 75,    maxHP: 190,    avgGold: 15,   avgXP: 35 },
  dustwind:    { baseHP: 630,   maxHP: 1575,   avgGold: 40,   avgXP: 100 },
  shadowmire:  { baseHP: 1485,  maxHP: 3715,   avgGold: 100,  avgXP: 220 },
  ironhold:    { baseHP: 3135,  maxHP: 7840,   avgGold: 250,  avgXP: 440 },
  emberfell:   { baseHP: 6735,  maxHP: 16840,  avgGold: 580,  avgXP: 820 },
  frostpeak:   { baseHP: 14460, maxHP: 36150,  avgGold: 1280, avgXP: 1660 },
  voidrift:    { baseHP: 31185, maxHP: 77960,  avgGold: 3050, avgXP: 3400 }
};
```

### Monster HP Reference (Phase 9)

| Zone | Weakest Regular | Strongest Regular | Boss |
|------|-----------------|-------------------|------|
| Whisperwood | 75 HP | 190 HP | 750 HP |
| Dustwind | 630 HP | 1,575 HP | 3,000 HP |
| Shadowmire | 1,485 HP | 3,715 HP | 8,000 HP |
| Ironhold | 3,135 HP | 7,840 HP | 22,000 HP |
| Emberfell | 6,735 HP | 16,840 HP | 55,000 HP |
| Frostpeak | 14,460 HP | 36,150 HP | 140,000 HP |
| Voidrift | 31,185 HP | 77,960 HP | 400,000 HP |

---

## Player Damage Scaling (Phase 9)

### Attack Growth Sources

| Source | Contribution | Notes |
|--------|--------------|-------|
| Base stat | +1 per level | 5 + (level-1) = 5-104 |
| Equipment | +8 to +8,000 | Main damage source (Phase 9 retuned) |
| Sharp Blades | +5% to +50% | Percentage multiplier |

### Weapon Attack Progression (Phase 9)

The "wave" pattern — each zone's weapons create satisfying power spikes:

| Zone | Common Shop | Uncommon Shop | Boss Drop (Rare) |
|------|------------|---------------|-------------------|
| 1 | 8, 10 | 18 | 28 |
| 2 | 35, 42 | 50 | 75 |
| 3 | 85, 100 | 120 | 175 |
| 4 | 200, 240 | 280 | 400 |
| 5 | 450, 530 | 630 | 900 |
| 6 | 1,000, 1,180 | 1,400 | 2,000 |
| 7 | 2,200, 2,600 | 3,100 | 4,400 |

### Expected Attack by Level (Phase 9)

| Level | Base ATK | Gear ATK | Total ATK |
|-------|----------|----------|-----------|
| 1 | 5 | 0 | 5 |
| 5 | 9 | 18 | 27 |
| 10 | 14 | 28 | 42 |
| 20 | 24 | 75 | 99 |
| 30 | 34 | 175 | 209 |
| 45 | 49 | 400 | 449 |
| 60 | 64 | 900 | 964 |
| 75 | 79 | 2,000 | 2,079 |
| 100 | 104 | 4,400 | 4,504 |

### Wave Pattern Example (Zone 3)

```
Entry (Lv 20, prev boss weapon 75): attack = 99
  Weak monster 1,485 HP → 1485/99 = 15 clicks ← NICE ENTRY DIFFICULTY
  Strong monster 3,715 HP → 3715/99 = 38 clicks ← VERY HARD

Got Common weapon (85): attack = 24+85 = 109
  Weak: 1485/109 = 14 clicks (marginal improvement)
  Strong: 3715/109 = 34 clicks (still challenging)

Got Uncommon weapon (120): attack = 24+120 = 144
  Weak: 1485/144 = 10 clicks ← POWER SPIKE!
  Strong: 3715/144 = 26 clicks (manageable)

Boss drop weapon (175): attack = 24+175 = 199
  Weak: 1485/199 = 7 clicks ← FEELING POWERFUL!
  Strong Z3: 3715/199 = 19 clicks (comfortable farm)
  Entry Z4 weak: 3135/199 = 16 clicks ← ZONE RESET, HARD AGAIN!
```

---

## Gold Economy Curve (Phase 9)

### Monster Gold Scaling

Gold/XP values are ~3x old values to maintain gold-per-minute parity
with the ~3x increase in clicks-to-kill.

| Zone | Gold/Kill (avg) | Gold/Minute* | Shop Item Range |
|------|-----------------|--------------|-----------------|
| Whisperwood | 15 | 30-60 | 150-900 |
| Dustwind | 40 | 80-150 | 600-3,600 |
| Shadowmire | 100 | 150-300 | 1,500-9,000 |
| Ironhold | 250 | 300-600 | 4,500-27,000 |
| Emberfell | 580 | 600-1,200 | 12,000-72,000 |
| Frostpeak | 1,280 | 1,200-2,500 | 30,000-180,000 |
| Voidrift | 3,050 | 2,500-6,000 | 75,000-450,000 |

*With average click speed

### Gold Sink Balance

**Target: Upgrade every 30-50 kills**

```javascript
// Verify balance (Phase 9)
const goldPerKill = 100;   // Shadowmire average
const shopCost = 3750;     // Uncommon weapon

const killsNeeded = shopCost / goldPerKill;
// = 37.5 kills (within target!)
```

---

## Monster Type Mechanic Scaling (Phase 9)

### Armor Values

Scaled proportionally to new attack values — armor reduces damage by ~15-25% of expected player attack at zone level.

| Zone | Armor Range | % of Zone Entry Attack |
|------|-------------|----------------------|
| 4 | 40-50 | 19-24% |
| 5 | 90 | 20% |
| 6 | 180 | 19% |
| 7 | 350-400 | 17-19% |

### Regeneration Rates

Reduced from 2-4.5% to 0.5-1.2% of maxHP/sec to compensate for larger HP pools.
Target: regen heals ~30-40% of a single click's damage per second.

| Zone | Regen Rate | Notes |
|------|-----------|-------|
| 3 | 0.008 | Bloated Toad, Swamp Hag |
| 4 | 0.010 | Tunneler Worm |
| 5 | 0.010-0.012 | Magma Slime, Fire Salamander, Flame Cultist |
| 6 | 0.005-0.008 | Ice Wraith, Frost Banshee, Glacielle |
| 7 | 0.004-0.006 | Entropy Leech, Dimensional Wraith, Void Titan, Xal'theron |

### Swift Escape Timers

Increased from 4-8.5s to 9-14s to account for higher HP (more clicks needed).
Target: player needs to click at ~3-4 clicks/sec to beat the timer with zone-appropriate gear.

| Zone | Timer Range | Notes |
|------|------------|-------|
| 2 | 13,000-14,000ms | Sidewinder, Dust Devil, Vulture, Plains Stalker |
| 3 | 12,000ms | Will-o-Wisp, Giant Leech |
| 4 | 11,000ms | Crystal Spider, Cave Bat Swarm |
| 5 | 10,000ms | Hellhound |
| 6 | 9,000ms | Frost Sprite, Dire Wolf |
| 7 | 9,000-10,000ms | Phase Stalker, Chaos Imp, Entropy Leech |

### Default Type Constants

```javascript
ARMOR_VALUE_DEFAULT = 40;     // (was 15)
REGEN_RATE_DEFAULT = 0.008;   // (was 0.03)
ESCAPE_TIMER_DEFAULT = 12000; // (was 8000)
```

---

## Boss Timer System (Phase 9)

### Design

Bosses have an enrage timer (DPS check). If the player doesn't kill the boss within the timer:
- Boss **resets** (HP back to full)
- Player takes **no death penalty**
- Toast: "Boss enraged! You need more power to defeat it."
- Boss button remains available for retry

### Boss Fight Targets (Phase 9)

| Boss | HP | Timer | Target Clicks* | Min DPS @ 4 cps |
|------|-----|-------|----------------|-----------------|
| Mossback | 750 | 60s | ~50 clicks | ~4 atk/click |
| Redfang | 3,000 | 90s | ~47 clicks | ~9 atk/click |
| Mire Mother | 8,000 | 120s | ~56 clicks | ~17 atk/click |
| Grimstone | 22,000 | 150s | ~70 clicks | ~37 atk/click |
| Pyrax | 55,000 | 180s | ~81 clicks | ~77 atk/click |
| Glacielle | 140,000 | 240s | ~96 clicks | ~146 atk/click |
| Xal'theron | 400,000 | 300s | ~126 clicks | ~334 atk/click |

*With zone-appropriate uncommon weapon

### Boss Reward Scaling (Phase 9)

| Boss | Gold | XP | Gear Drop |
|------|------|-----|-----------|
| Mossback | 300-450 | 600-750 | Rare weapon (28 atk) |
| Redfang | 900-1,350 | 1,500-1,800 | Rare weapon (75 atk) |
| Mire Mother | 2,100-3,000 | 3,600-4,500 | Rare weapon (175 atk) |
| Grimstone | 4,500-6,600 | 9,000-11,400 | Rare weapon (400 atk) |
| Pyrax | 10,500-15,000 | 22,500-28,500 | Rare weapon (900 atk) |
| Glacielle | 24,000-36,000 | 54,000-69,000 | Rare weapon (2,000 atk) |
| Xal'theron | 75,000-120,000 | 150,000-195,000 | Legendary weapon (8,000 atk) |

---

## Crit Scaling

### Base Values

| Stat | Base | Max (Skills) | Max (Skills+Gear) |
|------|------|--------------|-------------------|
| Crit Chance | 5% | 25% | ~40-50% |
| Crit Damage | 200% | 300% | ~400-500% |

### Crit Value Formula

```javascript
// Expected damage multiplier from crits
function critDPSMultiplier(critChance, critDamage) {
  // critDamage is total multiplier (2.0 = 200% = 2x damage)
  const extraDamage = critDamage - 1;  // Extra damage beyond base
  return 1 + (critChance * extraDamage);
}

// Example: 25% crit, 300% crit damage
// = 1 + (0.25 * 2.0) = 1.5 = +50% avg DPS
```

---

## Energy & Skill Usage

### Energy Flow

| Source | Energy Gained |
|--------|---------------|
| Click on monster | +1 (max every 200ms) |
| Kill regular monster | +5 |
| Kill boss | +20 |
| Passive regen | +0/second (base) |

### Skill DPS Impact

| Skill | Energy Cost | Damage Boost | Net DPS Gain |
|-------|-------------|--------------|--------------|
| Power Strike | 15 | 3x one hit | ~+15% sustained |
| Berserk | 30 | +50% for 10s | ~+40% during buff |
| Execute | 25 | Instant kill <15% | Variable |

---

## Rarity Weight Distribution

### Standard Loot Weights

```javascript
const RARITY_WEIGHTS = {
  common: 70,
  uncommon: 20,
  rare: 8,
  epic: 1.8,
  legendary: 0.2
};
```

---

## Balance Verification Checklist (Phase 9)

When adding new content, verify:

- [ ] Zone 1 entry (Lv 1, no gear): Weakest monster takes 15-20 clicks
- [ ] Zone 1 with uncommon weapon: Weakest takes 5-8 clicks
- [ ] Zone N entry with prev boss weapon: Weakest takes 12-18 clicks
- [ ] Zone N with uncommon weapon: Weakest takes 8-12 clicks
- [ ] Boss timers work (timeout resets boss, NO penalty)
- [ ] Boss fights completable within timer with zone-appropriate uncommon gear
- [ ] Gold drops allow upgrade every 30-50 kills
- [ ] XP allows level up every 5-20 minutes (varies by level)
- [ ] Armor reduces damage by ~15-25% at zone entry
- [ ] Regen monsters killable with proper gear (out-DPS the regen)
- [ ] Swift monsters killable within escape timers at ~3-4 clicks/sec
- [ ] Wave pattern feels satisfying: hard → gear → easy → harder → gear → easy

---

## Formulas Quick Reference

```javascript
// XP to next level
xp = floor(100 * 1.12^(level-1))

// Monster health
hp = baseHealth + (healthPerLevel * (level - minLevel))

// Gold drop
gold = randInt(goldMin, goldMax) + (goldPerLevel * (level - minLevel))

// Player attack
attack = 5 + (level - 1) + weaponAttack

// Crit DPS multiplier
mult = 1 + (critChance * (critDamage - 1))

// Skill effect value
value = baseValue + (perLevel * (skillLevel - 1))
```

---

*This document is the source of truth for all balance-related numbers.*
*Phase 9 overhaul: Feb 2026.*
*References: _INDEX.md, all system docs, all data docs*

# Balance Curves

> All scaling formulas, XP tables, and balance tuning numbers.
> This document ensures consistent progression feel across the game.

---

## Core Philosophy

1. **Early game is fast** - Constant dopamine, quick levels
2. **Mid game is engaging** - Meaningful choices, steady progress
3. **Late game is rewarding** - Long-term goals, prestige tease
4. **Always:** "Just one more..." feeling

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

## Monster Scaling

### Health Formula

Base health is defined per monster, then scales with level:

```javascript
function monsterHealth(monster, level) {
  const levelBonus = level - monster.levelMin;
  return monster.baseHealth + (monster.healthPerLevel * levelBonus);
}
```

### Zone Health Multipliers

| Zone | Level Range | Base HP Mult | Target Clicks to Kill* |
|------|-------------|--------------|----------------------|
| Whisperwood | 1-10 | 1.0x | 5-15 clicks |
| Dustwind | 10-20 | 2.5x | 10-25 clicks |
| Shadowmire | 20-30 | 5.0x | 15-35 clicks |
| Ironhold | 30-45 | 10x | 20-45 clicks |
| Emberfell | 45-60 | 20x | 25-55 clicks |
| Frostpeak | 60-75 | 40x | 30-70 clicks |
| Voidrift | 75-100 | 80x | 40-100 clicks |

*With appropriate gear for zone

### Monster HP Reference

| Zone | Common Monster | Elite Monster | Boss |
|------|----------------|---------------|------|
| Whisperwood | 20-70 HP | 50-100 HP | 500 HP |
| Dustwind | 80-180 HP | 150-250 HP | 1,200 HP |
| Shadowmire | 200-400 HP | 350-500 HP | 3,000 HP |
| Ironhold | 450-800 HP | 700-1000 HP | 8,000 HP |
| Emberfell | 750-1500 HP | 1300-2000 HP | 20,000 HP |
| Frostpeak | 1400-2800 HP | 2500-3500 HP | 50,000 HP |
| Voidrift | 2800-6000 HP | 5000-8000 HP | 150,000 HP |

---

## Player Damage Scaling

### Attack Growth Sources

| Source | Contribution | Notes |
|--------|--------------|-------|
| Base stat | +1 per level | 5 + (level-1) = 5-104 |
| Equipment | +4 to +2500 | Main damage source |
| Sharp Blades | +5% to +50% | Percentage multiplier |

### Expected Attack by Level

| Level | Base ATK | Gear ATK | Skills | Total ATK |
|-------|----------|----------|--------|-----------|
| 1 | 5 | 0 | 0% | 5 |
| 5 | 9 | 8 | 5% | 18 |
| 10 | 14 | 20 | 15% | 39 |
| 20 | 24 | 50 | 25% | 93 |
| 30 | 34 | 100 | 35% | 181 |
| 45 | 49 | 200 | 45% | 361 |
| 60 | 64 | 400 | 50% | 696 |
| 75 | 79 | 800 | 50% | 1,319 |
| 100 | 104 | 2000 | 50% | 3,156 |

### Damage vs Monster HP Balance

```
Target: 20-50 clicks per monster (average)

At Level 10 in Whisperwood:
- Player ATK: ~39
- Monster HP: ~70-100
- Clicks: 2-3 (player is strong for zone)

At Level 30 in Shadowmire:
- Player ATK: ~181
- Monster HP: ~300-400
- Clicks: 2-3 (with crits: faster)

At Level 75 in Voidrift:
- Player ATK: ~1,319
- Monster HP: ~4000-6000
- Clicks: 3-5 (with crits/skills: faster)
```

---

## Gold Economy Curve

### Monster Gold Scaling

| Zone | Gold/Kill (avg) | Gold/Minute* | Shop Item Range |
|------|-----------------|--------------|-----------------|
| Whisperwood | 5 | 30-60 | 50-300 |
| Dustwind | 14 | 80-150 | 200-1,200 |
| Shadowmire | 35 | 150-300 | 500-3,000 |
| Ironhold | 85 | 300-600 | 1,500-9,000 |
| Emberfell | 200 | 600-1,200 | 4,000-24,000 |
| Frostpeak | 440 | 1,200-2,500 | 10,000-60,000 |
| Voidrift | 1,050 | 2,500-6,000 | 25,000-150,000 |

*With average click speed + auto-clicker

### Gold Sink Balance

**Target: Upgrade every 30-50 kills**

```javascript
// Verify balance
const goldPerKill = 35;  // Shadowmire average
const shopCost = 1250;   // Uncommon weapon

const killsNeeded = shopCost / goldPerKill;
// = 35.7 kills (within target!)
```

### Total Gold Requirements

| Milestone | Gold Needed | Approx. Kills |
|-----------|-------------|---------------|
| Whisperwood gear | ~500 | 100 |
| Dustwind gear | ~2,500 | 250 |
| Shadowmire gear | ~7,500 | 350 |
| Ironhold gear | ~25,000 | 450 |
| Emberfell gear | ~70,000 | 550 |
| Frostpeak gear | ~180,000 | 650 |
| Voidrift gear | ~500,000 | 750 |
| All skills maxed | ~660,000 | 1,000 |

---

## Crit Scaling

### Base Values

| Stat | Base | Max (Skills) | Max (Skills+Gear) |
|------|------|--------------|-------------------|
| Crit Chance | 5% | 25% | ~40-50% |
| Crit Damage | 200% | 300% | ~400-500% |

### Crit Probability Table

| Crit Chance | Avg Hits for 1 Crit | DPS Increase |
|-------------|---------------------|--------------|
| 5% | 20 | +5% |
| 10% | 10 | +10% |
| 20% | 5 | +20% |
| 30% | 3.3 | +30% |
| 40% | 2.5 | +40% |
| 50% | 2 | +50% |

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
| Click on monster | +5 (max every 200ms) |
| Kill regular monster | +15 |
| Kill boss | +50 |
| Passive regen | +2/second |

### Energy Economy

```javascript
// Average energy per monster kill:
// ~10 clicks = 50 energy + 15 kill bonus = 65 energy

// Power Strike costs 15 energy
// Can use ~4x per monster kill cycle

// Heal costs 20 energy
// Can use ~3x per monster kill cycle
```

### Skill DPS Impact

| Skill | Energy Cost | Damage Boost | Net DPS Gain |
|-------|-------------|--------------|--------------|
| Power Strike | 15 | 3x one hit | ~+15% sustained |
| Berserk | 30 | +50% for 10s | ~+40% during buff |
| Execute | 25 | Instant kill <15% | Variable |

---

## Skill Cost Curves

### Passive Skill Upgrade Formula

```javascript
function passiveUpgradeCost(baseCost, level) {
  // Roughly doubles every 2 levels
  return Math.floor(baseCost * Math.pow(1.8, level - 1));
}
```

### Active Skill Upgrade Formula

```javascript
function activeUpgradeCost(baseCost, level) {
  // Roughly doubles every level
  return Math.floor(baseCost * Math.pow(2, level - 1));
}
```

### Recommended Skill Priorities

Level 1: Power Strike (auto-unlocked, free). Then choose at milestones:

| Level | Choice | Recommendation | Reasoning |
|-------|--------|----------------|-----------|
| 3 | Sharp Blades vs Killer Instinct | Sharp Blades | Passive DPS boost |
| 5 | Heal vs Iron Skin | Heal | Active healing for survival |
| 8 | Gold Rush vs XP Boost | Gold Rush | More gold for upgrades |
| 10 | Execute vs Berserk Rage | Execute | Boss killing power |
| 15 | Crit Surge vs Perfect Strike | Crit Surge | More crits = more damage |
| 20 | Reflect vs Time Warp | Time Warp | Utility and burst potential |

*Note: Unchosen skills can always be purchased later with gold*

---

## Boss Scaling

### Boss HP Formula

```javascript
function bossHP(zoneOrder) {
  // Exponential scaling
  const bases = [500, 1200, 3000, 8000, 20000, 50000, 150000];
  return bases[zoneOrder - 1];
}
```

### Boss Fight Targets

| Boss | HP | Target Clicks* | Target Time |
|------|-----|----------------|-------------|
| Mossback | 500 | 100-150 | 1-2 min |
| Redfang | 1,200 | 120-180 | 2-3 min |
| Mire Mother | 3,000 | 150-200 | 3-5 min |
| Grimstone | 8,000 | 180-250 | 4-6 min |
| Pyrax | 20,000 | 200-300 | 5-8 min |
| Glacielle | 50,000 | 250-350 | 7-10 min |
| Xal'theron | 150,000 | 300-500 | 10-15 min |

*With recommended gear for zone

### Boss Reward Scaling

| Boss | Gold | XP | Gear Drop |
|------|------|-----|-----------|
| Mossback | 100-150 | 200-250 | Rare weapon |
| Redfang | 300-450 | 500-600 | Rare weapon |
| Mire Mother | 700-1000 | 1.2K-1.5K | Rare weapon |
| Grimstone | 1.5K-2.2K | 3K-3.8K | Rare weapon |
| Pyrax | 3.5K-5K | 7.5K-9.5K | Rare weapon |
| Glacielle | 8K-12K | 18K-23K | Rare weapon |
| Xal'theron | 25K-40K | 50K-65K | Legendary weapon |

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
// Total: 100

// Probabilities:
// Common: 70%
// Uncommon: 20%
// Rare: 8%
// Epic: 1.8%
// Legendary: 0.2%
```

### Drop Rate by Monster Type

| Monster Type | Common | Uncommon | Rare | Epic | Legendary |
|--------------|--------|----------|------|------|-----------|
| Regular | 5-10% | 2-4% | 0.5-1% | 0.1% | 0.01% |
| Elite | 10-15% | 5-8% | 1-2% | 0.3% | 0.05% |
| Boss | 100%* | 25%* | 100%** | 10% | 5% |

*Boss drops guaranteed specific rare
**First kill only for guaranteed

---

## Balance Verification Checklist

When adding new content, verify:

- [ ] Monster HP takes 15-50 clicks with zone-appropriate gear
- [ ] Gold drops allow upgrade every 30-50 kills
- [ ] XP allows level up every 5-20 minutes (varies by level)
- [ ] New items don't exceed stat ranges for their zone
- [ ] Skill costs align with expected gold at unlock level
- [ ] Boss fights take 5-15 minutes with appropriate gear

---

## Formulas Quick Reference

```javascript
// XP to next level
xp = floor(100 * 1.12^(level-1))

// Monster health
hp = baseHealth + (healthPerLevel * (level - minLevel))

// Gold drop
gold = randInt(goldMin, goldMax) + (goldPerLevel * (level - minLevel))

// Crit DPS multiplier
mult = 1 + (critChance * (critDamage - 1))

// Skill effect value
value = baseValue + (perLevel * (skillLevel - 1))

// Item price
price = zoneBasePrice * rarityMultiplier
```

---

*This document is the source of truth for all balance-related numbers.*
*References: _INDEX.md, all system docs, all data docs*

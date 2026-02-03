# Loot System

> Defines drop tables, item drops, and reward calculations.

## Overview

The loot system handles:
1. Gold rewards from monsters
2. XP rewards from monsters
3. Item drops from monsters
4. Guaranteed boss drops

---

## Gold Rewards

### Base Gold Calculation

From monster definition:
```javascript
function calculateBaseGold(monster, monsterLevel) {
  // Roll within range
  const baseGold = randomInt(monster.goldMin, monster.goldMax);

  // Add level scaling
  const levelBonus = monster.goldPerLevel * (monsterLevel - monster.levelMin);

  return Math.floor(baseGold + levelBonus);
}
```

### Final Gold with Player Bonuses

```javascript
function calculateFinalGold(baseGold, player) {
  const goldFind = getTotalGoldFind(player);
  return Math.floor(baseGold * (1 + goldFind));
}
```

### Gold Find Sources

| Source | Amount |
|--------|--------|
| Base stat | 0% |
| Deep Pockets skill (per level) | +5% |
| Accessory (varies by rarity) | +5% to +30% |
| Gold Rush active skill | +100% (temporary) |

### Example Gold Calculation

```
Monster: Whisperwood Wolf (Level 5)
- goldMin: 4, goldMax: 8, goldPerLevel: 1, levelMin: 1

Base roll: 6 (between 4-8)
Level bonus: 1 × (5 - 1) = 4
Base gold: 6 + 4 = 10

Player has:
- Deep Pockets Lv 3: +15% goldFind
- Uncommon Accessory: +8% goldFind
Total goldFind: 0.23 (23%)

Final gold: floor(10 × 1.23) = 12 gold
```

---

## XP Rewards

### Base XP Calculation

```javascript
function calculateBaseXP(monster, monsterLevel) {
  // Roll within range
  const baseXP = randomInt(monster.xpMin, monster.xpMax);

  // Add level scaling
  const levelBonus = monster.xpPerLevel * (monsterLevel - monster.levelMin);

  return Math.floor(baseXP + levelBonus);
}
```

### Final XP with Player Bonuses

```javascript
function calculateFinalXP(baseXP, player) {
  const xpBonus = getTotalXPBonus(player);
  return Math.floor(baseXP * (1 + xpBonus));
}
```

### XP Bonus Sources

| Source | Amount |
|--------|--------|
| Base stat | 0% |
| Fast Learner skill (per level) | +5% |
| Accessory (varies by rarity) | +5% to +30% |

---

## Item Drops

### Loot Table Structure

Each monster has a `lootTable` array:
```javascript
lootTable: [
  { itemId: "weapon_whisperwood_common_01", chance: 0.10 },   // 10%
  { itemId: "weapon_whisperwood_uncommon_01", chance: 0.03 }, // 3%
  { itemId: "accessory_whisperwood_common_01", chance: 0.05 } // 5%
]
```

### Drop Roll Algorithm

```javascript
function rollLootDrops(monsterId) {
  const monster = getMonster(monsterId);
  const drops = [];

  for (const entry of monster.lootTable) {
    // Each entry is rolled independently
    if (Math.random() < entry.chance) {
      drops.push(entry.itemId);
    }
  }

  return drops;
}
```

**Key Points:**
- Each loot entry is rolled independently
- A monster can drop 0, 1, or multiple items
- Probabilities don't need to sum to 100%

### Applying Drops

```javascript
function giveDrops(player, drops) {
  for (const itemId of drops) {
    const item = getItem(itemId);

    // Add to inventory (unlimited capacity)
    player.inventory.push(itemId);
    showItemDropAnimation(item);
    showMessage(`Found: ${item.name}!`);
  }
}
```

---

## Drop Rates by Rarity

### Base Drop Chances (per monster kill)

| Rarity | Base Chance | Notes |
|--------|-------------|-------|
| Common | 5-15% | Frequent drops |
| Uncommon | 2-5% | Regular finds |
| Rare | 0.5-2% | Exciting finds |
| Epic | 0.1-0.5% | Very rare |
| Legendary | 0.01-0.1% | Ultra rare, memorable |

### Zone-Adjusted Drop Rates

Later zones have slightly better drop rates to maintain excitement:

| Zone | Drop Rate Multiplier |
|------|---------------------|
| Whisperwood | 1.0x |
| Dustwind | 1.1x |
| Shadowmire | 1.2x |
| Ironhold | 1.3x |
| Emberfell | 1.4x |
| Frostpeak | 1.5x |
| Voidrift | 2.0x |

```javascript
function getAdjustedDropChance(baseChance, zoneId) {
  const multiplier = ZONE_DROP_MULTIPLIERS[zoneId];
  return Math.min(baseChance * multiplier, 1.0);  // Cap at 100%
}
```

---

## Boss Loot

### Guaranteed Drops

Bosses have guaranteed drops (chance: 1.0):
```javascript
// Boss Mossback loot table
lootTable: [
  { itemId: "weapon_whisperwood_rare_01", chance: 1.0 }  // Always drops
]
```

### Boss Drop Handling

```javascript
function handleBossDrops(bossId) {
  const boss = getMonster(bossId);

  for (const entry of boss.lootTable) {
    if (entry.chance >= 1.0) {
      // Guaranteed drop - always give
      giveItem(player, entry.itemId);
      showLegendaryDropAnimation(getItem(entry.itemId));
    } else {
      // Bonus drops - roll normally
      if (Math.random() < entry.chance) {
        giveItem(player, entry.itemId);
      }
    }
  }
}
```

### First-Kill vs Re-kill

| Drop Type | First Kill | Re-kill (Future) |
|-----------|------------|------------------|
| Guaranteed | Yes | Yes |
| Bonus rolls | Yes | Yes |
| Zone unlock | Yes | No |
| Achievement | Yes | No |

---

## Loot Tables by Zone

### Whisperwood Glen (Levels 1-10)

**Regular Monsters:**
| Monster | Common (10%) | Uncommon (3%) | Rare (0.5%) |
|---------|--------------|---------------|-------------|
| Forest Sprite | weapon_common_01 | accessory_uncommon_01 | - |
| Wild Boar | weapon_common_01 | weapon_uncommon_01 | - |
| Timber Wolf | weapon_common_02 | accessory_uncommon_01 | weapon_rare_01 |
| Grumpy Treant | accessory_common_01 | weapon_uncommon_01 | - |

**Boss - Old Mossback:**
| Item | Chance |
|------|--------|
| weapon_whisperwood_rare_01 (Mossback's Branch) | 100% |
| accessory_whisperwood_rare_01 | 25% |

### Dustwind Plains (Levels 10-20)

**Regular Monsters:**
| Monster | Common (10%) | Uncommon (3%) | Rare (0.5%) |
|---------|--------------|---------------|-------------|
| Prairie Dog | weapon_common_01 | - | - |
| Dust Devil | accessory_common_01 | accessory_uncommon_01 | - |
| Bandit Scout | weapon_common_02 | weapon_uncommon_01 | weapon_rare_01 |
| Plains Stalker | weapon_common_01 | weapon_uncommon_01 | accessory_rare_01 |

**Boss - Redfang:**
| Item | Chance |
|------|--------|
| weapon_dustwind_rare_01 (Redfang's Fang) | 100% |
| accessory_dustwind_rare_01 | 25% |

*(Continue pattern for other zones...)*

---

## Drop Notification UI

### Regular Drop
```
┌─────────────────────────────┐
│     ✨ ITEM FOUND! ✨        │
│                             │
│     🗡️ Rusty Sword          │
│     Common Weapon           │
│     +4 Attack               │
│                             │
│     [EQUIP]  [INVENTORY]    │
└─────────────────────────────┘
```

### Rare+ Drop (Special Animation)
```
┌─────────────────────────────┐
│    ⭐ RARE DROP! ⭐          │
│    ═══════════════          │
│                             │
│    🌿 Mossback's Branch     │
│    Rare Weapon              │
│    +11 Attack               │
│    +3% Crit Chance          │
│                             │
│    [EQUIP]  [INVENTORY]     │
└─────────────────────────────┘
```

---

## Loot Animation Timings

| Event | Duration | Effect |
|-------|----------|--------|
| Gold collection | 500ms | Coins fly to counter |
| XP collection | 300ms | XP bar flash |
| Common drop | 800ms | Item popup |
| Uncommon drop | 1000ms | Item popup + glow |
| Rare drop | 1500ms | Item popup + particles |
| Epic drop | 2000ms | Screen flash + special |
| Legendary drop | 3000ms | Full celebration |

---

## Future: Luck Stat

For v2.0+, add a `luck` stat that affects drop rates:

```javascript
function getDropChanceWithLuck(baseChance, player) {
  const luck = player.stats.luck || 0;  // 0-100 scale
  const luckBonus = luck / 100;  // 0% to 100% bonus

  // Luck provides diminishing returns on high base chances
  const effectiveBonus = luckBonus * (1 - baseChance);

  return Math.min(baseChance + effectiveBonus, 1.0);
}

// Example:
// Base 10% drop, 50 luck
// effectiveBonus = 0.5 * (1 - 0.1) = 0.45
// Final chance = 0.1 + 0.45 = 0.55 (55%)
```

---

## Constants Reference

```javascript
const LOOT_CONSTANTS = {
  // Drop rate multipliers by zone
  ZONE_DROP_MULTIPLIERS: {
    whisperwood: 1.0,
    dustwind: 1.1,
    shadowmire: 1.2,
    ironhold: 1.3,
    emberfell: 1.4,
    frostpeak: 1.5,
    voidrift: 2.0
  },

  // Animation durations (ms)
  GOLD_ANIMATION: 500,
  XP_ANIMATION: 300,
  DROP_POPUP_COMMON: 800,
  DROP_POPUP_UNCOMMON: 1000,
  DROP_POPUP_RARE: 1500,
  DROP_POPUP_EPIC: 2000,
  DROP_POPUP_LEGENDARY: 3000
};
```

---

*Referenced by: combat.js, monsters.js, items.js, ui.js*
*References: _INDEX.md, monster.schema.md, item.schema.md*

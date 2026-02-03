# Economy System

> Defines gold flow, pricing, sinks, and economic balance.

## Overview

A healthy game economy has:
1. **Gold Sources** - Ways to earn currency
2. **Gold Sinks** - Ways to spend currency
3. **Balance** - Income matches spending opportunities

---

## Gold Sources

### Primary: Monster Kills

```javascript
function calculateMonsterGold(monster, level, player) {
  // Base roll
  const base = randomInt(monster.goldMin, monster.goldMax);

  // Level scaling
  const levelBonus = monster.goldPerLevel * (level - monster.levelMin);

  // Player gold find
  const goldFind = getTotalGoldFind(player);

  return Math.floor((base + levelBonus) * (1 + goldFind));
}
```

### Gold by Zone (Average per Kill)

| Zone | Level Range | Base Gold | With 50% Gold Find |
|------|-------------|-----------|-------------------|
| Whisperwood | 1-10 | 3-8 | 5-12 |
| Dustwind | 10-20 | 8-20 | 12-30 |
| Shadowmire | 20-30 | 20-50 | 30-75 |
| Ironhold | 30-45 | 50-120 | 75-180 |
| Emberfell | 45-60 | 120-280 | 180-420 |
| Frostpeak | 60-75 | 280-600 | 420-900 |
| Voidrift | 75-100 | 600-1500 | 900-2250 |

### Boss Gold Rewards

| Boss | Gold Range |
|------|------------|
| Old Mossback | 100-150 |
| Redfang | 300-450 |
| Mire Mother | 700-1000 |
| Grimstone | 1500-2200 |
| Pyrax | 3500-5000 |
| Glacielle | 8000-12000 |
| Xal'theron | 25000-40000 |

---

## Gold Sinks

### 1. Equipment (Shop)

#### Shop Rotation System

The shop offers a **rotating selection** of items, not all items at once:

```javascript
const SHOP_CONFIG = {
  // How many items shown per category
  slotsPerCategory: {
    weapon: 3,      // 3 weapons available at a time
    armor: 2,       // 2 armor pieces available
    accessory: 3    // 3 accessories available
  },

  // Refresh timing
  refreshInterval: 600000,  // 10 minutes real-time
  refreshOnZoneChange: true,

  // Rarity weights (what appears in shop)
  rarityWeights: {
    common: 40,
    uncommon: 35,
    rare: 20,
    epic: 5,
    legendary: 0    // Legendaries are drop-only!
  }
};
```

#### Shop Refresh

```
┌─────────────────────────────────────────┐
│ ← Back        SHOP           💰 1,234   │
├─────────────────────────────────────────┤
│  [⚔️ Weapons]  [🛡️ Armor]  [💍 Access]  │
├─────────────────────────────────────────┤
│                                         │
│  Today's Selection:        ⏱️ 8:42      │ ← Timer until refresh
│                                         │
│  🗡️ Hunter's Blade (Uncommon)    125g   │
│  🪓 Iron Axe (Common)            50g    │
│  ⚔️ Duelist's Rapier (Rare)     300g    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│        [🔄 REFRESH NOW - 50g]           │ ← Pay to reroll shop
│                                         │
└─────────────────────────────────────────┘
```

#### Shop Mechanics

| Feature | Behavior |
|---------|----------|
| Auto-refresh | Every 10 minutes |
| Zone refresh | New items when entering new zone |
| Manual refresh | Pay gold (zone base price) to reroll |
| Rarity limits | Epic rare, Legendary never in shop |
| Level filter | Only shows items ≤ player level + 5 |

#### Shop Item Selection

```javascript
function generateShopItems(zone, playerLevel) {
  const zoneItems = getAllItems().filter(i =>
    i.zone === zone.id &&
    i.shopAvailable === true &&
    i.requiredLevel <= playerLevel + 5
  );

  const selected = [];

  for (const type of ['weapon', 'armor', 'accessory']) {
    const typeItems = zoneItems.filter(i => i.type === type);
    const count = SHOP_CONFIG.slotsPerCategory[type];

    // Weighted random selection by rarity
    for (let i = 0; i < count && typeItems.length > 0; i++) {
      const item = weightedRandomSelect(typeItems, SHOP_CONFIG.rarityWeights);
      selected.push(item);
      typeItems.splice(typeItems.indexOf(item), 1); // No duplicates
    }
  }

  return selected;
}
```

#### Manual Refresh Cost

| Zone | Refresh Cost |
|------|--------------|
| Whisperwood | 25g |
| Dustwind | 100g |
| Shadowmire | 250g |
| Ironhold | 750g |
| Emberfell | 2,000g |
| Frostpeak | 5,000g |
| Voidrift | 12,500g |

**Pricing Formula:**
```javascript
function calculateItemPrice(zone, rarity) {
  const ZONE_BASE = {
    whisperwood: 50,
    dustwind: 200,
    shadowmire: 500,
    ironhold: 1500,
    emberfell: 4000,
    frostpeak: 10000,
    voidrift: 25000
  };

  const RARITY_MULT = {
    common: 1.0,
    uncommon: 2.5,
    rare: 6.0,
    epic: 15.0,
    legendary: 50.0
  };

  return Math.floor(ZONE_BASE[zone] * RARITY_MULT[rarity]);
}
```

**Price Table:**

| Zone | Common | Uncommon | Rare | Epic | Legendary |
|------|--------|----------|------|------|-----------|
| Whisperwood | 50 | 125 | 300 | 750 | 2,500 |
| Dustwind | 200 | 500 | 1,200 | 3,000 | 10,000 |
| Shadowmire | 500 | 1,250 | 3,000 | 7,500 | 25,000 |
| Ironhold | 1,500 | 3,750 | 9,000 | 22,500 | 75,000 |
| Emberfell | 4,000 | 10,000 | 24,000 | 60,000 | 200,000 |
| Frostpeak | 10,000 | 25,000 | 60,000 | 150,000 | 500,000 |
| Voidrift | 25,000 | 62,500 | 150,000 | 375,000 | 1,250,000 |

### 2. Skills

**Skill Unlock Costs:**

Skills are unlocked at level milestones via choice (pick 1 of 2). Unchosen skills can be bought later:

| Skill | Unlock Cost (if not chosen) | Upgrade Costs (1→5) |
|-------|----------------------------|---------------------|
| Sharp Blades | Free (auto-unlock) | 50→800 |
| Power Strike | 50 | 200→1,500 |
| Heal | 50 | 200→1,500 |
| Deep Pockets | 75 | 100→600 |
| Fast Learner | 75 | 100→600 |
| Lucky Strikes | 100 | 150→900 |
| Gold Rush | 300 | 600→2,500 |
| Execute | 200 | 400→2,000 |
| Shield Wall | 200 | 400→2,000 |
| Berserk | 500 | 800→4,000 |
| Iron Skin | 400 | 600→3,000 |

**Total Skill Costs (all maxed, all purchased):**
- Passive skills (11 skills × 5 levels): ~150,000 gold
- Active skills (11 skills × 5 levels): ~150,000 gold
- **Grand Total: ~300,000 gold**

See `skills.data.md` for complete pricing.

### 3. Selling Items

```javascript
function calculateSellPrice(buyPrice) {
  return Math.floor(buyPrice * SELL_PRICE_RATIO);  // 25%
}
```

**Note:** Selling is not a major economy factor, just inventory management.

---

## Economic Balance

### Gold Earned vs Gold Needed by Zone

| Zone | Gold/Kill (avg) | Shop Costs | Kills for Basic Gear |
|------|-----------------|------------|----------------------|
| Whisperwood | 5 | 50-125 | 10-25 |
| Dustwind | 14 | 200-500 | 15-35 |
| Shadowmire | 35 | 500-1,250 | 15-35 |
| Ironhold | 85 | 1,500-3,750 | 18-45 |
| Emberfell | 200 | 4,000-10,000 | 20-50 |
| Frostpeak | 440 | 10,000-25,000 | 23-55 |
| Voidrift | 1,050 | 25,000-62,500 | 24-60 |

**Target: 20-50 kills per gear upgrade**

### Gold Earning Rate Goals

| Phase | Gold/Minute | Notes |
|-------|-------------|-------|
| Early (Lv 1-10) | 30-100 | Quick dopamine |
| Mid (Lv 10-30) | 100-400 | Steady progress |
| Late (Lv 30-60) | 400-1,500 | Satisfying grind |
| End (Lv 60-100) | 1,500-5,000 | Wealthy feeling |

---

## Shop System

### Shop Structure

```javascript
const shop = {
  whisperwood: {
    weapons: [
      "weapon_whisperwood_common_01",
      "weapon_whisperwood_common_02",
      "weapon_whisperwood_uncommon_01"
    ],
    accessories: [
      "accessory_whisperwood_common_01",
      "accessory_whisperwood_uncommon_01"
    ]
  },
  // ... other zones
};
```

### Shop UI

```
┌─────────────────────────────────────┐
│ SHOP - Whisperwood Glen             │
├─────────────────────────────────────┤
│ [⚔️ Weapons] [🛡️ Armor] [💍 Access] │
├─────────────────────────────────────┤
│                                     │
│ 🗡️ Rusty Sword           50g       │
│    Common | +4 Attack               │
│    [BUY]                            │
│                                     │
│ ⚔️ Hunter's Blade        125g      │
│    Uncommon | +7 Attack             │
│    Requires Level 5                 │
│    [BUY] (grayed if can't afford)   │
│                                     │
│ ══════════════════════════          │
│ Your Gold: 87                       │
└─────────────────────────────────────┘
```

### Purchase Flow

```javascript
function purchaseItem(player, itemId) {
  const item = getItem(itemId);

  // Check level requirement
  if (player.level < item.requiredLevel) {
    showMessage(`Requires Level ${item.requiredLevel}`);
    return false;
  }

  // Check gold
  if (player.gold < item.buyPrice) {
    showMessage("Not enough gold!");
    return false;
  }

  // Check inventory space
  if (player.inventory.length >= MAX_INVENTORY_SIZE) {
    showMessage("Inventory full!");
    return false;
  }

  // Purchase!
  player.gold -= item.buyPrice;
  player.totalGoldSpent += item.buyPrice;
  player.inventory.push(itemId);

  showMessage(`Purchased ${item.name}!`);
  saveGame();
  return true;
}
```

---

## Selling System

### Sell Flow

```javascript
function sellItem(player, itemId) {
  const item = getItem(itemId);
  const sellPrice = Math.floor(item.buyPrice * SELL_PRICE_RATIO);

  // Remove from inventory
  const index = player.inventory.indexOf(itemId);
  if (index === -1) return false;
  player.inventory.splice(index, 1);

  // Give gold
  player.gold += sellPrice;
  player.totalGoldEarned += sellPrice;

  showMessage(`Sold ${item.name} for ${sellPrice}g`);
  return true;
}
```

### Can't Sell Equipped

```javascript
function canSellItem(player, itemId) {
  // Can't sell if equipped
  for (const slot of Object.values(player.equipment)) {
    if (slot === itemId) return false;
  }
  return true;
}
```

---

## Economic Anti-Patterns to Avoid

### 1. Inflation
**Problem:** Gold becomes worthless
**Solution:** Ensure sinks scale with sources

### 2. Deflation
**Problem:** Players can't afford progression
**Solution:** Keep gear affordable within 20-50 kills

### 3. Dead Economy
**Problem:** Nothing worth buying
**Solution:** Always have next upgrade visible and desirable

### 4. Pay Wall Feel
**Problem:** Progress feels blocked by currency
**Solution:** Multiple paths forward (grind OR different zone)

---

## Gold Display

### Formatting

```javascript
function formatGold(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  }
  return amount.toString();
}

// Examples:
// 500 → "500"
// 1500 → "1.5K"
// 2500000 → "2.5M"
```

### Gold Counter Animation

```javascript
function animateGoldGain(amount) {
  // Show floating +gold
  const floater = createFloatingText(`+${amount}`, 'gold');

  // Animate counter incrementing
  const startGold = displayedGold;
  const endGold = player.gold;
  animateCounter(goldCounter, startGold, endGold, 300);
}
```

---

## Future Economy Features

### Daily Login Rewards (v2.0)
```javascript
const DAILY_REWARDS = [
  { day: 1, gold: 100 },
  { day: 2, gold: 200 },
  { day: 3, gold: 300, item: "weapon_common_random" },
  { day: 4, gold: 500 },
  { day: 5, gold: 750 },
  { day: 6, gold: 1000 },
  { day: 7, gold: 2000, item: "weapon_rare_random" }
];
```

### Achievements with Gold Rewards (v2.0)
```javascript
const ACHIEVEMENTS = {
  first_blood: { name: "First Blood", gold: 50 },
  kill_100: { name: "Century", gold: 500 },
  kill_1000: { name: "Slayer", gold: 2000 },
  millionaire: { name: "Millionaire", gold: 0 }  // Reach 1M gold
};
```

### Gold Boosters (v2.0)
- Temporary gold find buffs from skills (Gold Rush)
- Accessories with gold find bonuses
- Not purchasable with real money (no P2W)

---

## Constants Reference

```javascript
const ECONOMY_CONSTANTS = {
  SELL_PRICE_RATIO: 0.25,           // Sell for 25% of buy
  MAX_INVENTORY_SIZE: 100,

  ZONE_BASE_PRICE: {
    whisperwood: 50,
    dustwind: 200,
    shadowmire: 500,
    ironhold: 1500,
    emberfell: 4000,
    frostpeak: 10000,
    voidrift: 25000
  },

  RARITY_PRICE_MULTIPLIER: {
    common: 1.0,
    uncommon: 2.5,
    rare: 6.0,
    epic: 15.0,
    legendary: 50.0
  }
};
```

---

*Referenced by: items.js, shop.js, player.js, ui.js*
*References: _INDEX.md, item.schema.md, monster.schema.md*

# Item Schema

> Defines the structure for all equipment and items in the game.

## Overview

Items are equipment pieces that boost player stats. Players acquire them through shops or monster drops.

---

## Complete Schema

```typescript
interface Item {
  // === Identity ===
  id: string;                   // Unique identifier (see naming convention)
  name: string;                 // Display name
  description: string;          // Flavor text

  // === Classification ===
  type: ItemType;               // Equipment slot type
  rarity: Rarity;               // Rarity tier
  zone: string;                 // Zone where item is available

  // === Requirements ===
  requiredLevel: number;        // Minimum player level to equip

  // === Stats ===
  stats: {
    // Combat stats
    attack?: number;            // Flat attack bonus
    critChance?: number;        // Crit chance bonus (0.0 to 1.0)
    critDamage?: number;        // Crit damage bonus
    armorPen?: number;          // Armor penetration vs armored monsters

    // Defensive stats (armor)
    damageReduction?: number;   // % damage reduction (0.0 to 1.0)
    maxHP?: number;             // Bonus to maximum HP
    hpRegen?: number;           // % HP regen per second

    // Utility stats (accessories)
    goldFind?: number;          // Gold find bonus (0.0 to 1.0)
    xpBonus?: number;           // XP bonus (0.0 to 1.0)
    energyGain?: number;        // % bonus Energy from clicks

    // Skill-enhancing stats (special items)
    skillBoost_power_strike?: number;  // % bonus to Power Strike
    skillBoost_heal?: number;          // % bonus to Heal
    skillBoost_execute?: number;       // Threshold bonus for Execute
    skillBoost_berserk?: number;       // % bonus to Berserk damage
    skillCooldown?: number;            // % cooldown reduction
    skillEnergyCost?: number;          // % energy cost reduction
  };

  // === Economy ===
  buyPrice: number;             // Cost to purchase from shop
  sellPrice: number;            // Value when selling (auto-calculated)

  // === Availability ===
  shopAvailable: boolean;       // Can be bought in shop
  dropOnly: boolean;            // Only obtainable from monster drops

  // === Visuals ===
  emoji: string;                // Display emoji
}

type ItemType = "weapon" | "armor" | "accessory";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
```

---

## Field Details

### Identity Fields

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| `id` | string | Unique, follows convention | `"weapon_whisperwood_common_01"` |
| `name` | string | 1-50 characters | `"Rusty Sword"` |
| `description` | string | 1-200 characters | `"A worn blade, but still sharp..."` |

### Classification Fields

| Field | Type | Options | Notes |
|-------|------|---------|-------|
| `type` | ItemType | `weapon`, `armor`, `accessory` | Determines equip slot |
| `rarity` | Rarity | See rarity table below | Affects stats and color |
| `zone` | string | Valid zone ID | Where item is sold/dropped |

### Item Types

| Type | Slot | Primary Stats | Notes |
|------|------|---------------|-------|
| `weapon` | Weapon | attack, critChance, critDamage, armorPen | Main damage source |
| `armor` | Armor | damageReduction, maxHP, hpRegen | Defensive survivability |
| `accessory` | Accessory | goldFind, xpBonus, skillBoosts | Utility and special effects |

### Rarity Details

From `_INDEX.md`:

| Rarity | Color | Stat Multiplier | Emoji Prefix |
|--------|-------|-----------------|--------------|
| `common` | `#9d9d9d` | 1.0x | (none) |
| `uncommon` | `#1eff00` | 1.5x | ✦ |
| `rare` | `#0070dd` | 2.0x | ★ |
| `epic` | `#a335ee` | 3.0x | ✧ |
| `legendary` | `#ff8000` | 5.0x | ✵ |

### Requirements

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `requiredLevel` | number | 1-100 | Player must be this level to equip |

**Level Requirement Guidelines:**
- Zone 1 items: Level 1-10
- Zone 2 items: Level 10-20
- ...matches zone level ranges

### Stats Object

All stats are optional. Only include stats the item provides.

| Stat | Type | Range | Example Value |
|------|------|-------|---------------|
| `attack` | number | 1-1000+ | `10` (adds 10 attack) |
| `critChance` | number | 0.01-0.50 | `0.05` (adds 5% crit) |
| `critDamage` | number | 0.1-2.0 | `0.5` (adds 50% crit damage) |
| `goldFind` | number | 0.05-1.0 | `0.10` (adds 10% gold find) |
| `xpBonus` | number | 0.05-1.0 | `0.10` (adds 10% XP) |
| `autoAttack` | number | 0.1-5.0 | `1.0` (adds 1 click/sec) |

**Stat Stacking:**
All equipment stats stack additively with player base stats.

### Economy Fields

| Field | Type | Calculation | Notes |
|-------|------|-------------|-------|
| `buyPrice` | number | See formula | Cost in shop |
| `sellPrice` | number | `buyPrice × 0.25` | Auto-calculated |

**Price Formula:**
```javascript
// Base price by zone
const ZONE_BASE_PRICE = {
  whisperwood: 50,
  dustwind: 200,
  shadowmire: 500,
  ironhold: 1500,
  emberfell: 4000,
  frostpeak: 10000,
  voidrift: 25000
};

// Rarity multiplier
const RARITY_PRICE_MULT = {
  common: 1.0,
  uncommon: 2.5,
  rare: 6.0,
  epic: 15.0,
  legendary: 50.0
};

buyPrice = ZONE_BASE_PRICE[zone] * RARITY_PRICE_MULT[rarity];
sellPrice = floor(buyPrice * 0.25);
```

### Availability Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `shopAvailable` | boolean | `true` | Appears in zone shop |
| `dropOnly` | boolean | `false` | Only from monster loot |

**Availability Rules:**
- `shopAvailable: true, dropOnly: false` → In shop AND can drop
- `shopAvailable: false, dropOnly: true` → Drop only (rare finds)
- `shopAvailable: true, dropOnly: true` → Invalid combination
- `shopAvailable: false, dropOnly: false` → Not available (unused)

### Visual Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `emoji` | string | By type | Visual representation |

**Default Emoji by Type:**
- `weapon`: ⚔️
- `armor`: 🛡️
- `accessory`: 💍

---

## Stat Value Guidelines by Zone

### Weapons - Attack Values

| Zone | Common | Uncommon | Rare | Epic | Legendary |
|------|--------|----------|------|------|-----------|
| Whisperwood | 3-5 | 6-8 | 10-12 | 15-18 | 25-30 |
| Dustwind | 8-12 | 14-18 | 22-28 | 35-42 | 55-70 |
| Shadowmire | 18-25 | 30-40 | 48-60 | 75-95 | 120-150 |
| Ironhold | 35-50 | 60-80 | 100-130 | 160-200 | 260-330 |
| Emberfell | 70-100 | 120-160 | 200-260 | 320-400 | 520-660 |
| Frostpeak | 140-200 | 240-320 | 400-520 | 640-800 | 1040-1320 |
| Voidrift | 280-400 | 480-640 | 800-1040 | 1280-1600 | 2080-2640 |

### Accessories - Bonus Values

| Stat | Common | Uncommon | Rare | Epic | Legendary |
|------|--------|----------|------|------|-----------|
| goldFind | 5% | 8% | 12% | 18% | 30% |
| xpBonus | 5% | 8% | 12% | 18% | 30% |
| critChance | 2% | 3% | 5% | 8% | 12% |

---

## Example Items

### Common Weapon
```javascript
{
  id: "weapon_whisperwood_common_01",
  name: "Rusty Sword",
  description: "A weathered blade found in the forest. It's seen better days.",
  type: "weapon",
  rarity: "common",
  zone: "whisperwood",
  requiredLevel: 1,
  stats: {
    attack: 4
  },
  buyPrice: 50,
  sellPrice: 12,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🗡️"
}
```

### Rare Weapon
```javascript
{
  id: "weapon_whisperwood_rare_01",
  name: "Mossback's Branch",
  description: "A branch torn from the ancient treant. It pulses with nature magic.",
  type: "weapon",
  rarity: "rare",
  zone: "whisperwood",
  requiredLevel: 8,
  stats: {
    attack: 11,
    critChance: 0.03
  },
  buyPrice: 300,
  sellPrice: 75,
  shopAvailable: false,
  dropOnly: true,  // Boss drop only
  emoji: "🌿"
}
```

### Accessory
```javascript
{
  id: "accessory_whisperwood_uncommon_01",
  name: "Lucky Rabbit's Foot",
  description: "The previous owner wasn't so lucky, but you might be.",
  type: "accessory",
  rarity: "uncommon",
  zone: "whisperwood",
  requiredLevel: 3,
  stats: {
    goldFind: 0.08,
    critChance: 0.02
  },
  buyPrice: 125,
  sellPrice: 31,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🐾"
}
```

---

## Shop Organization

Items in shops are organized by:
1. **Zone** - Each zone has its own shop section
2. **Type** - Weapons, Armor, Accessories tabs
3. **Rarity** - Sorted common → legendary

**Shop Unlock Rules:**
- Zone shop unlocks when zone is unlocked
- Items with `shopAvailable: false` never appear
- Items above player level shown but grayed out

---

## Validation Rules

1. `id` must be unique across all items
2. `id` must follow convention: `{type}_{zone}_{rarity}_{number}`
3. `type` must be valid ItemType
4. `rarity` must be valid Rarity
5. `zone` must reference valid zone ID
6. `requiredLevel` must be within zone's level range
7. Stats must be positive numbers
8. `buyPrice` must be > 0
9. Cannot have both `shopAvailable: true` and `dropOnly: true`
10. `emoji` must be a valid emoji character

---

## Future Considerations

### Item Sets (v2.0)
```typescript
interface ItemSet {
  id: string;
  name: string;
  items: string[];  // Item IDs in set
  bonuses: {
    2: StatBonus;   // Bonus for 2 pieces
    3: StatBonus;   // Bonus for 3 pieces
  };
}
```

### Item Upgrade (v2.0)
```typescript
interface UpgradeRecipe {
  inputItem: string;
  outputItem: string;
  goldCost: number;
  materials: { itemId: string; count: number }[];
}
```

---

*Referenced by: items.js, shop.js, player.js, ui.js*
*References: _INDEX.md (rarities, stats), zone.schema.md*

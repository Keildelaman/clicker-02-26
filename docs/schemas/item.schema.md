# Item Schema (v2)

> Defines the structure for all equipment items in the Item System v2.
> Items are procedurally generated with random affixes — see `docs/design/item-system-v2.md`.

---

## Overview

Items are equipment pieces that boost player stats via random affixes. Players acquire them through monster drops, boss kills, and the shop. Items can be modified via reforge, imbue, and temper crafting systems. Legendary items have unique build-defining effects.

**Key differences from v1:**
- 6 equipment slots (was 3)
- Procedurally generated names, affixes, and pricing (was hardcoded)
- 63 affixes across 7 categories with tier scaling
- 3 crafting systems (reforge, imbue, temper)
- 15 legendary items with unique effects
- IDs are UUIDs (not `{type}_{zone}_{rarity}_{number}`)

---

## Complete Schema

```typescript
interface Item {
  // === Identity ===
  id: string;                    // UUID: "item_{timestamp}_{random}"
  name: string;                  // Procedurally generated from slot + rarity + affixes

  // === Classification ===
  slot: EquipmentSlot;           // Equipment slot
  zone: string;                  // Zone ID where item originated
  rarity: Rarity;                // Rarity tier
  requiredLevel: number;         // Minimum player level to equip (zone-based)
  emoji: string;                 // Visual representation (slot-based)

  // === Affixes ===
  affixes: Affix[];              // Random stat bonuses (count depends on rarity)

  // === Crafting State ===
  reforgedAffix: number | null;  // Index of affix that was reforged (null = none)
  reforgeCount: number;          // Times this item has been reforged (escalates cost)
  imbued: boolean;               // Whether an affix was added via imbue (one-time)
  temperLevel: number;           // Current temper level (0-12)
  temperSelections: number[];    // Affix indices selected at temper milestones (levels 1, 5, 9)
  temperBrickCount: number;      // Full resets before bricking (max 5)

  // === Economy ===
  buyPrice: number;              // Cost to purchase from shop
  sellPrice: number;             // Scrap value (25% of buy price)

  // === Legendary ===
  legendaryId: string | null;    // Legendary definition ID (e.g. 'soulreaver')
  uniqueEffect: UniqueEffect | null; // Build-defining unique effect
}

interface Affix {
  id: string;                    // Affix definition ID (e.g. 'flat_attack')
  value: number;                 // Rolled value (within tier min/max range)
  tier: number;                  // Zone tier when rolled (1-7)
}

interface UniqueEffect {
  id: string;                    // Effect ID for handler lookup (e.g. 'double_hit')
  description: string;           // Display text for UI
}

type EquipmentSlot = "weapon" | "helmet" | "chest" | "gloves" | "boots" | "accessory";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
```

---

## Field Details

### Equipment Slots

| Slot | Emoji | Primary Role |
|------|-------|--------------|
| `weapon` | Varies by base name | Offensive stats, determines damage type |
| `helmet` | Varies | Mixed stats |
| `chest` | Varies | Defensive stats |
| `gloves` | Varies | Offensive/utility stats |
| `boots` | Varies | Utility/defensive stats |
| `accessory` | Varies | Utility/skill stats |

**Weapon damage type:** Determined by base name. Physical names (Blade, Sword, Axe, etc.) set click damage to physical. Magic names (Staff, Wand, Scepter) set click damage to magic.

### Rarity & Affix Counts

| Rarity | Max Affixes | Chance of max-1 | Unique Effect |
|--------|-------------|-----------------|---------------|
| `common` | 1 | — | No |
| `uncommon` | 2 | 40% | No |
| `rare` | 3 | 50% | No |
| `epic` | 4 | 60% | No |
| `legendary` | 4 | — | Yes (always) |

### Required Levels (by zone)

| Zone | Required Level |
|------|---------------|
| `whisperwood` | 1 |
| `dustwind` | 10 |
| `shadowmire` | 20 |
| `ironhold` | 30 |
| `emberfell` | 45 |
| `frostpeak` | 60 |
| `voidrift` | 75 |

---

## Affix System

63 total affixes across 7 categories. Each affix has a `scaleType` determining how values scale by tier:

- **flat**: Uses `FLAT_TIER_MULTIPLIERS` — values scale up to 30x from T1 to T7
- **percentage**: Uses `PERCENT_TIER_MULTIPLIERS` — values scale up to 4.5x
- **zoneBased**: Skill level affixes — gives +1/+2/+3 based on zone tier ranges

### Affix Categories

| Category | Count | Examples |
|----------|-------|---------|
| offensive | 6 | flat_attack, flat_magic_power, crit_chance, crit_damage, armor_pen, magic_pen |
| defensive | 5 | flat_max_hp, hp_regen, flat_armor, flat_magic_resist, flat_max_shield |
| utility | 4 | gold_find, xp_bonus, energy_gain, cooldown_reduction |
| statusChance | 5 | bleed_chance, poison_chance, burn_chance, slow_chance, freeze_chance |
| statusPotency | 5 | bleed_potency, poison_potency, burn_potency, slow_potency, freeze_potency |
| skillBoost | 5 | General skill boost affixes |
| skillCategory | 33 | Category-level and individual skill-level affixes |

### Slot Category Weights

Each slot has weighted probabilities for which affix categories appear. Weapons favor offensive, chest favors defensive, accessories favor utility/skill.

### Validation Rules

1. Max 2 status effect affixes per item (`MAX_STATUS_AFFIXES_PER_ITEM`)
2. Max 1 skill level affix per item (`MAX_SKILL_LEVEL_AFFIXES_PER_ITEM`)
3. No duplicate affix IDs on the same item
4. Affixes re-roll up to 10 times if validation fails (`AFFIX_REROLL_MAX_ATTEMPTS`)

---

## Crafting State

### Reforge
Re-rolls one affix to a new random affix+value of the same tier. Cost escalates by 2.2x per reforge.

| Field | Meaning |
|-------|---------|
| `reforgedAffix` | Index of last reforged affix (null = never reforged) |
| `reforgeCount` | Total reforges on this item (drives cost escalation) |

### Imbue
Adds one additional affix to items with fewer than their rarity max. One-time operation per item.

| Field | Meaning |
|-------|---------|
| `imbued` | `true` if item has been imbued (cannot imbue again) |

### Temper
12 levels across 3 cycles of 4. At levels 1, 5, and 9 the player selects an affix to boost. Boost amounts: +5% (cycle 1), +7% (cycle 2), +10% (cycle 3).

| Field | Meaning |
|-------|---------|
| `temperLevel` | 0–12, current temper level |
| `temperSelections` | Affix indices selected at milestone levels [1, 5, 9] |
| `temperBrickCount` | Full reset count; at 5 resets the item bricks (cannot temper further) |

---

## Legendary Items

15 legendary items (2-3 per zone), boss-only drops. Each has a fixed name, a unique effect, and random affixes.

### Legendary-specific Fields

| Field | Type | Notes |
|-------|------|-------|
| `legendaryId` | string | References the legendary definition ID (e.g. `'soulreaver'`) |
| `uniqueEffect` | `{ id, description }` | Build-defining effect, active when equipped |

Legendary effects are categorized:
- **Event-based**: Subscribe to events (e.g. "50% bonus bleed vs slowed targets")
- **System-checked**: Checked by systems via `state.activeLegendaryEffects` Set
- **Stat pipeline**: Modify computed stats in player.js
- **Tick-based**: Updated each game tick (e.g. shield regen while idle)

---

## Example Items

### Common Weapon (generated)
```javascript
{
  id: "item_1708905432_7a3f",
  name: "Whispering Blade",
  slot: "weapon",
  zone: "whisperwood",
  rarity: "common",
  requiredLevel: 1,
  emoji: "🗡️",
  affixes: [
    { id: "flat_attack", value: 4, tier: 1 }
  ],
  reforgedAffix: null,
  reforgeCount: 0,
  imbued: false,
  temperLevel: 0,
  temperSelections: [],
  temperBrickCount: 0,
  buyPrice: 100,
  sellPrice: 25,
  legendaryId: null,
  uniqueEffect: null
}
```

### Rare Chest Armor (generated)
```javascript
{
  id: "item_1708906100_b2c1",
  name: "Ironhold Sentinel Plate of Vitality",
  slot: "chest",
  zone: "ironhold",
  rarity: "rare",
  requiredLevel: 30,
  emoji: "🛡️",
  affixes: [
    { id: "flat_max_hp", value: 78, tier: 4 },
    { id: "flat_armor", value: 26, tier: 4 },
    { id: "hp_regen", value: 0.022, tier: 4 }
  ],
  reforgedAffix: null,
  reforgeCount: 0,
  imbued: false,
  temperLevel: 0,
  temperSelections: [],
  temperBrickCount: 0,
  buyPrice: 18000,
  sellPrice: 4500,
  legendaryId: null,
  uniqueEffect: null
}
```

### Legendary Item (boss drop)
```javascript
{
  id: "item_1708910000_d4e5",
  name: "Soulreaver",
  slot: "weapon",
  zone: "shadowmire",
  rarity: "legendary",
  requiredLevel: 20,
  emoji: "💀",
  affixes: [
    { id: "flat_attack", value: 25, tier: 3 },
    { id: "crit_chance", value: 0.034, tier: 3 },
    { id: "crit_damage", value: 0.34, tier: 3 },
    { id: "bleed_chance", value: 0.136, tier: 3 }
  ],
  reforgedAffix: null,
  reforgeCount: 0,
  imbued: false,
  temperLevel: 0,
  temperSelections: [],
  temperBrickCount: 0,
  buyPrice: 30000,
  sellPrice: 7500,
  legendaryId: "soulreaver",
  uniqueEffect: {
    id: "bleed_bonus_vs_slowed",
    description: "Bleed deals 50% bonus damage to slowed targets"
  }
}
```

---

## Item Name Generation

Names are procedurally generated based on slot, rarity, and affixes:

- **Common**: `"{prefix} {baseName}"` — e.g. "Whispering Blade"
- **Uncommon**: `"{prefix} {baseName} of {suffix}"` — e.g. "Iron Blade of the Bear"
- **Rare**: `"{prefix} {baseName} of {suffix}"` — e.g. "Radiant Plate of Vitality"
- **Epic**: 50% chance of epic prefix — e.g. "Infernal Demonforged Axe of Destruction"
- **Legendary**: Fixed name from legendary definition — e.g. "Soulreaver"

Base names are determined by slot. Suffixes are derived from affix types present on the item.

---

## Pricing

Buy price is calculated from zone base price, rarity multiplier, and affix values.
Sell price (scrap) is always 25% of buy price. Crafting modifications do not increase sell value.

---

*Referenced by: items.js, item-gen.js, item-crafting.js, item-effects.js, shop-ui.js, item-detail-ui.js*
*References: _INDEX.md (rarities, tiers), docs/design/item-system-v2.md (canonical spec)*

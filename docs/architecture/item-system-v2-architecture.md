# Item System v2 — Architecture Guide

> **Status:** Implementation-ready reference
> **Design doc:** `docs/design/item-system-v2.md` (canonical design — all questions resolved)
> **Purpose:** How the item system fits into the existing codebase

---

## Table of Contents

1. [New File Structure](#1-new-file-structure)
2. [Domain Ownership](#2-domain-ownership)
3. [Cross-Cutting Operations](#3-cross-cutting-operations)
4. [Event Catalog](#4-event-catalog)
5. [DI Wiring](#5-di-wiring-mainjs)
6. [Integration Points](#6-integration-points)
7. [State Schema Changes](#7-state-schema-changes)
8. [Save Migration](#8-save-migration)

---

## 1. New File Structure

### 1.1 New Data Files

| File | Lines (est.) | Contents |
|------|-------------|----------|
| `js/data/affixes.data.js` | ~400 | 63 affix definitions, category groupings, within-category weights, tier multipliers (flat + percentage), slot weight matrix, zone-based skill level ranges |
| `js/data/legendaries.data.js` | ~150 | 15 legendary items: fixed names, slot, zone, unique effect IDs, unique effect descriptions |
| `js/data/item-names.data.js` | ~200 | Base names per slot, prefix tables (stat-based + rarity), suffix tables, weapon base name → damage type map |

All three are pure data modules with zero imports (except affixes.data.js may import constants.js for tier multiplier arrays).

### 1.2 New System Files

Following the same sub-module pattern as skills.js / skill-effects.js / skill-passives.js:

| File | Lines (est.) | Role |
|------|-------------|------|
| `js/systems/items.js` | ~500 | **Main engine.** Owns equip/unequip, inventory management, material tracking, stat aggregation (`getEquipmentStatsV2()`), effective skill level calc, item scrapping. Subscribes to events, exports public API. Imports sub-modules. |
| `js/systems/item-gen.js` | ~400 | **Sub-module.** Pure functions for random item generation: `generateItem()`, `generateLegendaryItem()`, `generateShopItem()`. Affix rolling with 6 validation rules, tier value calculation, name generation, pricing, UUID. No events. |
| `js/systems/item-crafting.js` | ~350 | **Sub-module.** Pure functions for reforge, imbue, temper, temper reset. Cost calculations, brick detection, selection level logic. No events. |

**Import rules:** Only items.js subscribes to/emits events. item-gen.js and item-crafting.js are imported by items.js only — they are pure function libraries, just like skill-effects.js is imported by skills.js only.

### 1.3 New UI Files

| File | Lines (est.) | Role |
|------|-------------|------|
| `js/ui/equipment-ui.js` | ~400 | 6-slot equipment grid, item detail view, compare panel |
| `js/ui/inventory-ui.js` | ~500 | 30+3 inventory grid, sorting, bulk scrap, overflow section |

### 1.4 Rewritten Files

| File | Change |
|------|--------|
| `js/ui/shop-ui.js` | **Major rewrite.** Random generated items instead of fixed item pool, v2 pricing display, 15-min refresh timer, flat refresh cost |
| `js/data/items.data.js` | **Gutted.** Remove all 96 fixed item definitions. Keep only `LEGACY_ITEM_PRICES` map for v4→v5 migration gold compensation |

### 1.5 Modified Existing Files

| File | Scope of Change |
|------|----------------|
| `js/data/constants.js` | ~50 new constants (item system, crafting, inventory, shop v2) |
| `js/data/balance.js` | ~14 new formula functions (pricing, costs, boss scaling, material decay) |
| `js/systems/player.js` | Rewrite `getEquipmentBonus()` + `createNewPlayer()` (6 slots), add new computed stat fields |
| `js/systems/combat.js` | Weapon damage type for basic clicks, item status proc rolling on skill damage |
| `js/systems/skills.js` | `getEffectiveSkillLevel()` with beyond-max scaling via DI |
| `js/systems/loot.js` | Complete rewrite: random drops + material drops with decay |
| `js/systems/monster.js` | Boss scaling in `spawnBoss()` |
| `js/systems/economy.js` | Shop v2 generation, export `deductGold()`/`addGold()` helpers |
| `js/systems/zones.js` | Material gating for boss challenge |
| `js/services/storage.js` | v4→v5 migration |
| `js/main.js` | DI wiring for items system, register tick, screen navigation |
| `js/debug.js` | New debug tools: `giveItem`, `giveLegendary`, `giveMaterial`, `clearInventory` |
| `index.html` | Equipment, inventory, crafting screen sections + CSS |
| `css/components.css` | Rarity borders, temper bars, lock icons, item cards |

---

## 2. Domain Ownership

| Domain | Owner System | State Slice | Persistence |
|--------|-------------|-------------|-------------|
| Equipment (6 slots) | items.js | `state.player.equipment` | Saved |
| Inventory (30+3) | items.js | `state.player.inventory`, `state.player.inventoryOverflow` | Saved |
| Materials | items.js | `state.player.materials` | Saved |
| Equipment stats (aggregated) | items.js | `state.equipmentStats` | Transient |
| Weapon damage type | items.js | read from equipped weapon | Transient |
| Item skill level bonuses | items.js | computed on demand | Transient |
| Gold | economy.js | `state.player.gold` | Saved |
| Shop rotation | economy.js | `state.shopItems` | Transient |
| Computed stats | player.js | `state.computedStats` | Transient |

**Key principle:** items.js owns all item-related state mutations. economy.js still owns gold mutations. player.js reads `state.equipmentStats` (set by items.js) instead of looking up fixed item definitions.

---

## 3. Cross-Cutting Operations

### 3.1 Purchasing (Shop → Inventory)

```
UI emits 'shop:requestPurchase' { shopIndex }
  → economy.js validates gold, deducts gold
  → economy.js emits 'item:requestAdd' { item }
  → items.js adds item to inventory (or overflow, or auto-scrap)
  → items.js emits 'item:added' { item, destination }  // 'inventory' | 'overflow' | 'auto-scrapped'
```

### 3.2 Equipping (Inventory → Equipment)

```
UI emits 'item:requestEquip' { itemId }
  → items.js validates level requirement, slot availability
  → items.js swaps inventory ↔ equipment (previous item goes to inventory)
  → items.js recomputes equipmentStats
  → items.js emits 'item:equipped' { item, slot, previousItem }
  → player.js invalidates stat cache (listens to 'item:equipped')
```

### 3.3 Crafting (Reforge/Imbue/Temper)

```
UI emits 'item:requestReforge' { itemId, affixIndex }
  → items.js validates item eligibility
  → items.js calls deductGold(cost) via DI from economy.js
  → items.js delegates to item-crafting.js for the reforge logic
  → items.js mutates the item in-place (inventory or equipment)
  → if equipped: recompute equipmentStats, invalidate stat cache
  → items.js emits 'item:reforged' { item, affixIndex, oldValue, newValue }
```

Same flow for imbue (`item:requestImbue`) and temper (`item:requestTemper`).

### 3.4 Monster Kill → Loot Drop

```
combat.js emits 'combat:monsterKilled' { monster, isBoss, zoneId }
  → loot.js rolls drop chance (zone-dependent 4-8%)
  → if drop: loot.js calls generateItem(zoneId, slot, rarity) via DI
  → loot.js calls addItem(item) via DI → items.js handles inventory/overflow/auto-scrap
  → loot.js rolls material drop chance (zone-dependent, with decay)
  → if material: loot.js emits 'materials:dropped' { materialId, amount }
  → items.js handles material addition
```

### 3.5 Boss Challenge (Material Gating)

```
UI / zones.js emits 'zone:requestBossChallenge' { zoneId }
  → zones.js calls canAffordBoss(zoneId) via DI from items.js
  → if affordable: zones.js calls spendBossMaterials(zoneId) via DI
  → items.js deducts materials, emits 'materials:spent'
  → zones.js proceeds with boss spawn
```

---

## 4. Event Catalog

### 4.1 New Events

#### Item Lifecycle

| Event | Payload | Emitted By |
|-------|---------|------------|
| `item:requestAdd` | `{ item }` | economy.js, loot.js (via DI) |
| `item:added` | `{ item, destination }` | items.js |
| `item:autoScrapped` | `{ item, goldValue }` | items.js |
| `item:requestEquip` | `{ itemId }` | UI (intent) |
| `item:equipped` | `{ item, slot, previousItem }` | items.js |
| `item:requestUnequip` | `{ slot }` | UI (intent) |
| `item:unequipped` | `{ item, slot }` | items.js |
| `item:requestScrap` | `{ itemId }` | UI (intent) |
| `item:scrapped` | `{ item, goldValue }` | items.js |
| `item:requestBulkScrap` | `{ rarity }` | UI (intent) |
| `item:bulkScrapped` | `{ count, totalGold, rarity }` | items.js |

#### Crafting

| Event | Payload | Emitted By |
|-------|---------|------------|
| `item:requestReforge` | `{ itemId, affixIndex }` | UI (intent) |
| `item:reforged` | `{ item, affixIndex, oldValue, newValue }` | items.js |
| `item:requestImbue` | `{ itemId }` | UI (intent) |
| `item:imbued` | `{ item, newAffix }` | items.js |
| `item:requestTemper` | `{ itemId }` | UI (intent) |
| `item:tempered` | `{ item, newLevel, selectedAffix }` | items.js |
| `item:requestTemperReset` | `{ itemId }` | UI (intent) |
| `item:temperReset` | `{ item }` | items.js |
| `item:bricked` | `{ item }` | items.js |
| `item:craftFailed` | `{ reason, itemId }` | items.js |

#### Materials

| Event | Payload | Emitted By |
|-------|---------|------------|
| `materials:dropped` | `{ materialId, amount, zoneId }` | loot.js |
| `materials:requestSpend` | `{ materialId, amount }` | zones.js |
| `materials:spent` | `{ materialId, amount }` | items.js |
| `materials:insufficient` | `{ materialId, required, current }` | items.js |

### 4.2 Modified Existing Events

| Event | What Changed |
|-------|-------------|
| `combat:monsterKilled` | Add `zoneId` to payload (needed by loot.js for zone-based drops) |
| `item:equipped` | Payload changes from `{ itemId, slot }` (string ID) to `{ item, slot, previousItem }` (full item objects) |
| `item:unequipped` | Payload changes from `{ itemId, slot }` to `{ item, slot }` (full item object) |
| `shop:requestPurchase` | Payload changes from `{ itemId }` (string) to `{ shopIndex }` (integer index into shop array) |

### 4.3 Removed Events

| Event | Reason |
|-------|--------|
| `item:purchased` (old payload) | Replaced by `item:added` with richer payload |
| `item:sold` (old payload) | Replaced by `item:scrapped` with item object |

---

## 5. DI Wiring (main.js)

### 5.1 New DI Injections

```javascript
// items.js needs gold operations from economy + stat cache from player
items.init({
  getComputedStats: player.getComputedStats,
  invalidateStatCache: player.invalidateStatCache,
  deductGold: economy.deductGold,
  addGold: economy.addGold
});

// loot.js needs item generation + inventory access from items
loot.init({
  generateItem: items.generateItem,
  generateLegendaryItem: items.generateLegendaryItem,
  addItem: items.addItem
});

// economy.js needs shop item generation from items
economy.init({
  generateShopItem: items.generateShopItem
});

// skills.js needs item skill level bonuses from items
skills.init({
  ..., // existing DI
  getItemSkillLevelBonus: items.getItemSkillLevelBonus
});

// combat.js needs weapon damage type from items
combat.init({
  ..., // existing DI
  getWeaponDamageType: items.getWeaponDamageType,
  getStatusProcChances: items.getStatusProcChances
});

// zones.js needs material checking from items
zones.init({
  canAffordBoss: items.canAffordBoss,
  spendBossMaterials: items.spendBossMaterials
});
```

### 5.2 New Exports from economy.js

```javascript
/**
 * Deduct gold from player. Returns true if successful, false if insufficient.
 * Used by items.js for crafting costs via DI.
 */
export function deductGold(amount) { ... }

/**
 * Add gold to player. Used by items.js for scrap/sell income via DI.
 */
export function addGold(amount) { ... }
```

### 5.3 Tick Registration

```javascript
// Register items.update for tick (buff-based equipment effects, etc.)
registerTickSystem(items.update);
```

---

## 6. Integration Points

### 6.1 player.js

**Changes required:**

1. **`createNewPlayer()`** — Expand equipment from 3 string slots to 6 null slots:
   ```javascript
   equipment: {
     weapon: null,
     helmet: null,
     chest: null,
     gloves: null,
     boots: null,
     accessory: null
   }
   ```

2. **`getEquipmentBonus()`** — Rewrite to read from `state.equipmentStats` (computed by items.js) instead of looking up `ITEMS[itemId].stats`:
   ```javascript
   function getEquipmentBonus(player, statName) {
     const eqStats = state.equipmentStats || {};
     return eqStats[statName] || 0;
   }
   ```

3. **`getComputedStats()`** — Add new stat fields from item affixes:
   - `armor`, `magicResist` (flat from items)
   - `armorPen`, `magicPen` (percentage from items)
   - `maxShield` (flat from items)
   - `hpRegen` (percentage boost from items)
   - `goldFind`, `xpBonus`, `energyGain`, `skillCooldown` (percentage from items)
   - `bleedChance`, `poisonChance`, `burnChance`, `slowChance`, `freezeChance` (status chances)
   - `bleedPotency`, `poisonPotency`, `burnPotency`, `slowStrength`, `freezeDuration` (status potencies)
   - `skillSpeedBoost`, `skillPowerBoost`, `skillCritBoost`, `skillMageBoost`, `skillUtilityBoost` (skill category power boosts)

4. **Stat mapping** — items.js computes `state.equipmentStats` by iterating all 6 equipment slots, summing affixes. Affix IDs map directly to stat names (e.g., affix `flat_attack` → stat `attack`, affix `crit_chance` → stat `critChance`). Temper boosts are included in the affix values.

### 6.2 combat.js

**Changes required:**

1. **Weapon damage type** — In `handleClick()`, read damage type via `getWeaponDamageType()` DI instead of hardcoded `DAMAGE_TYPES.PHYSICAL`:
   ```javascript
   const damageType = deps.getWeaponDamageType(); // 'physical' or 'magic'
   ```
   This determines which defense stat the basic click hits (armor vs magic resist).

2. **Item status proc rolling** — On skill damage, check total equipped status chances. Subscribe to a `combat:skillDamage` event (emitted after skill damage is dealt). Roll once per status type per skill use:
   ```javascript
   // In combat.js or a dedicated handler
   on('combat:skillDamage', ({ damage, skillId }) => {
     const chances = deps.getStatusProcChances();
     for (const [statusId, chance] of Object.entries(chances)) {
       if (chance > 0 && Math.random() < chance) {
         // Apply status via existing status-effects system
         emit('status:applyToMonster', { effectId: statusId, source: 'item' });
       }
     }
   });
   ```

### 6.3 skills.js

**Changes required:**

1. **`getEffectiveSkillLevel()`** — New function using `getItemSkillLevelBonus` DI:
   ```javascript
   export function getEffectiveSkillLevel(skillId) {
     const baseLevel = state.player.unlockedSkills[skillId] || 0;
     if (baseLevel === 0) return 0;
     const itemBonus = deps.getItemSkillLevelBonus(skillId);
     return baseLevel + itemBonus;
   }
   ```

2. **Beyond-max scaling** — When effective level > 5 (max), scale all numerical stats:
   ```javascript
   function getSkillStatsAtLevel(skillDef, effectiveLevel) {
     const maxLevel = BASE_SKILL_MAX_LEVEL; // 5
     if (effectiveLevel <= maxLevel) {
       return skillDef.levels[effectiveLevel];
     }
     const baseStats = skillDef.levels[maxLevel];
     const bonusLevels = effectiveLevel - maxLevel;
     const multiplier = 1 + (0.20 * bonusLevels); // +20% per level beyond max
     return scaleNumericalStats(baseStats, multiplier);
   }
   ```

3. **All `useSkill()` calls and passive handlers** — Replace direct level lookups with `getEffectiveSkillLevel()`.

### 6.4 loot.js

**Complete rewrite.** Current implementation uses fixed loot tables from monster definitions. New implementation:

1. **Roll drop chance** — Zone-dependent (8% Zone 1 → 4% Zone 7)
2. **Roll rarity** — Weighted per zone (more Rares/Epics in later zones)
3. **Roll slot** — Equal 1/6 chance per slot
4. **Generate item** — Call `generateItem(zoneId, slot, rarity)` via DI
5. **Add to inventory** — Call `addItem(item)` via DI (handles overflow/auto-scrap)
6. **Roll material drop** — Zone-dependent with decay formula
7. **Boss drops** — Guaranteed Rare+, 5% legendary chance, return 2-4 materials

### 6.5 monster.js

**Changes required:**

1. **`spawnBoss()`** — Boss level scales with player level:
   ```javascript
   const bossEffectiveLevel = Math.max(bossDef.level, player.level - 5);
   ```
2. **Boss HP/damage scaling:**
   ```javascript
   bossHP = baseBossHP * (1 + 0.12 * bossEffectiveLevel);
   bossDamage = baseBossDamage * (1 + 0.10 * bossEffectiveLevel);
   ```
3. **Affix tier for legendary drops:**
   ```javascript
   affixTier = clamp(1, 7, Math.ceil(bossEffectiveLevel / 14));
   ```
   This is stored on the boss instance so loot.js can read it.

### 6.6 economy.js

**Changes required:**

1. **Shop v2** — `refreshShop()` generates 4 random items via `generateShopItem()` DI instead of picking from fixed `zone.shopItems` array.
2. **Shop rarity weights** — Common 55%, Uncommon 35%, Rare 10% (no Epic/Legendary in shop).
3. **Shop refresh** — 15-minute auto-refresh (up from 10), flat per-zone manual refresh cost (no escalation).
4. **Export gold helpers** — `deductGold(amount)` and `addGold(amount)` for items.js DI.
5. **Purchase flow** — `shop:requestPurchase` now takes `{ shopIndex }` instead of `{ itemId }`. Economy validates gold, deducts, then delegates item addition to items.js.
6. **Remove equip/unequip** — Equip/unequip moves to items.js. Economy no longer handles `shop:requestEquip`/`shop:requestUnequip`.

### 6.7 zones.js

**Changes required:**

1. **Material gating** — Before spawning a boss, check `canAffordBoss(zoneId)` via DI. If affordable, call `spendBossMaterials(zoneId)` to deduct materials.
2. **Boss challenge UI** — Emit material cost info so UI can display requirements.

### 6.8 storage.js

**Changes required:**

1. **v4→v5 migration** — See [Section 8](#8-save-migration).
2. **Update `PREVIOUS_SAVE_KEYS`** — Add `'clickoria_save_v4'` to the migration chain.

---

## 7. State Schema Changes

### 7.1 Persistent State (`state.player`)

**New fields:**

```javascript
// Equipment — expanded from 3 string slots to 6 object slots
equipment: {
  weapon: null,     // item object or null
  helmet: null,
  chest: null,
  gloves: null,
  boots: null,
  accessory: null
},

// Inventory — array of item objects (was array of string IDs)
inventory: [],              // max 30 item objects
inventoryOverflow: [],      // max 3 item objects

// Materials
materials: {},              // { mat_whisperwood: 12, mat_dustwind: 3, ... }
```

**Changed fields:**

```javascript
// Equipment values change from string IDs to full item objects
// Before: equipment: { weapon: 'weapon_whisperwood_common_01', armor: null, accessory: null }
// After:  equipment: { weapon: { id, name, slot, zone, rarity, affixes, ... }, helmet: null, ... }

// Inventory values change from string IDs to full item objects
// Before: inventory: ['weapon_dustwind_uncommon_01', 'armor_whisperwood_common_01']
// After:  inventory: [{ id: 'item_uuid_12345', name: 'Searing Blade', ... }, ...]
```

### 7.2 Transient State (`state.*`)

**New fields:**

```javascript
// Aggregated equipment stats (computed by items.js, read by player.js)
state.equipmentStats = {
  attack: 0,
  magicPower: 0,
  critChance: 0,
  critDamage: 0,
  armorPen: 0,
  magicPen: 0,
  armor: 0,
  magicResist: 0,
  maxHP: 0,
  maxShield: 0,
  hpRegen: 0,
  goldFind: 0,
  xpBonus: 0,
  energyGain: 0,
  skillCooldown: 0,
  bleedChance: 0,
  poisonChance: 0,
  burnChance: 0,
  slowChance: 0,
  freezeChance: 0,
  bleedPotency: 0,
  poisonPotency: 0,
  burnPotency: 0,
  slowStrength: 0,
  freezeDuration: 0,
  skillSpeedBoost: 0,
  skillPowerBoost: 0,
  skillCritBoost: 0,
  skillMageBoost: 0,
  skillUtilityBoost: 0
  // skill level bonuses computed on-demand, not stored here
};
```

### 7.3 Item Object Schema (Runtime)

```javascript
{
  id: 'item_uuid_12345',           // Unique UUID
  name: 'Searing Blade of Precision',
  slot: 'weapon',                  // weapon|helmet|chest|gloves|boots|accessory
  zone: 'emberfell',              // Zone that generated it (determines tier)
  rarity: 'rare',                 // common|uncommon|rare|epic|legendary
  requiredLevel: 45,
  emoji: '⚔️',

  affixes: [
    { id: 'flat_attack',   value: 42, tier: 5 },
    { id: 'crit_chance',   value: 0.05, tier: 5 },
    { id: 'burn_chance',   value: 0.11, tier: 5 }
  ],

  // Modification state
  reforgedAffix: null,            // affix index that was selected for reforging
  reforgeCount: 0,
  imbued: false,
  temperLevel: 0,                 // 0-12
  temperSelections: [],           // affix indices selected at levels 1, 5, 9
  temperBrickCount: 0,

  // Pricing
  buyPrice: 24000,
  sellPrice: 6000,

  // Legendary only
  legendaryId: null,
  uniqueEffect: null              // { id, description }
}
```

---

## 8. Save Migration

### 8.1 Version Bump

- **Save key:** `clickoria_save_v4` → `clickoria_save_v5`
- **Save version:** `4` → `5`

### 8.2 Migration Steps (v4 → v5)

```javascript
if (data.saveVersion === 4) {
  // 1. Calculate gold compensation from old items
  let compensation = 0;
  // Sum buyPrice of all equipped items
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const itemId = data.equipment[slot];
    if (itemId && LEGACY_ITEM_PRICES[itemId]) {
      compensation += LEGACY_ITEM_PRICES[itemId];
    }
  }
  // Sum buyPrice of all inventory items
  for (const itemId of data.inventory) {
    if (LEGACY_ITEM_PRICES[itemId]) {
      compensation += LEGACY_ITEM_PRICES[itemId];
    }
  }
  // Grant 50% as compensation
  data.gold += Math.floor(compensation * 0.5);

  // 2. Expand equipment to 6 empty slots
  data.equipment = {
    weapon: null,
    helmet: null,
    chest: null,
    gloves: null,
    boots: null,
    accessory: null
  };

  // 3. Clear inventory
  data.inventory = [];

  // 4. Add new fields
  data.inventoryOverflow = [];
  data.materials = {};

  // 5. Bump version
  data.saveVersion = 5;
}
```

### 8.3 LEGACY_ITEM_PRICES

The gutted `items.data.js` retains a `LEGACY_ITEM_PRICES` map — a simple `{ itemId: buyPrice }` object for all 96 v1 items. This is only used during migration and can be removed after a reasonable migration window.

---

## Appendix: Affix ID → Computed Stat Mapping

For reference when implementing `getEquipmentStatsV2()` in items.js and stat reading in player.js:

| Affix ID | Maps to `equipmentStats.` | Scale Type |
|----------|--------------------------|------------|
| `flat_attack` | `attack` | Flat |
| `flat_magic_power` | `magicPower` | Flat |
| `crit_chance` | `critChance` | Percentage |
| `crit_damage` | `critDamage` | Percentage |
| `armor_pen` | `armorPen` | Percentage |
| `magic_pen` | `magicPen` | Percentage |
| `flat_armor` | `armor` | Flat |
| `flat_magic_resist` | `magicResist` | Flat |
| `flat_max_hp` | `maxHP` | Flat |
| `flat_max_shield` | `maxShield` | Flat |
| `hp_regen` | `hpRegen` | Percentage |
| `gold_find` | `goldFind` | Percentage |
| `xp_bonus` | `xpBonus` | Percentage |
| `energy_gain` | `energyGain` | Percentage |
| `skill_cooldown` | `skillCooldown` | Percentage |
| `bleed_chance` | `bleedChance` | Percentage |
| `poison_chance` | `poisonChance` | Percentage |
| `burn_chance` | `burnChance` | Percentage |
| `slow_chance` | `slowChance` | Percentage |
| `freeze_chance` | `freezeChance` | Percentage |
| `bleed_potency` | `bleedPotency` | Percentage |
| `poison_potency` | `poisonPotency` | Percentage |
| `burn_potency` | `burnPotency` | Percentage |
| `slow_strength` | `slowStrength` | Percentage |
| `freeze_duration` | `freezeDuration` | Percentage |
| `skill_speed_boost` | `skillSpeedBoost` | Percentage |
| `skill_power_boost` | `skillPowerBoost` | Percentage |
| `skill_crit_boost` | `skillCritBoost` | Percentage |
| `skill_mage_boost` | `skillMageBoost` | Percentage |
| `skill_utility_boost` | `skillUtilityBoost` | Percentage |
| `skill_*_level` | *(computed on-demand, not aggregated)* | Zone-based |
| `skill_all_level` | *(computed on-demand, not aggregated)* | Zone-based |

Skill level affixes are NOT aggregated into `equipmentStats`. Instead, `items.getItemSkillLevelBonus(skillId)` iterates equipped items on demand, summing applicable category + individual + all-skills level bonuses.

---

*This document is the implementation reference for Item System v2. For design decisions, see `docs/design/item-system-v2.md`. For the phased build plan, see `docs/design/item-system-v2-roadmap.md`.*

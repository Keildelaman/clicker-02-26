# Item System v2 — Implementation Roadmap

> **Status:** Ready for implementation
> **Design doc:** `docs/design/item-system-v2.md`
> **Architecture guide:** `docs/architecture/item-system-v2-architecture.md`

---

## Progress Tracker

| Phase | Name | Lines (est.) | Status |
|-------|------|-------------|--------|
| 12.1 | Data Layer Foundation | ~800 | ✅ Complete |
| 12.2 | Item Generation Engine | ~400 | ✅ Complete |
| 12.3 | Item Crafting Engine | ~350 | ✅ Complete |
| 12.4 | Core Item System + Migration | ~700 | ✅ Complete |
| 12.5 | System Integrations | ~600 | ✅ Complete |
| 12.6 | Crafting Integration | ~150 | ✅ Complete |
| 12.7 | UI | ~900 | ✅ Complete |
| 12.8 | Legendary Effects + Polish | ~600 | ✅ Complete |

**Total: ~5000 lines across ~15 files, 8-10 sessions**

**Status key:** ⬜ Not Started | 🔨 In Progress | ✅ Complete

---

## Dependency Chain

```
12.1 → 12.2 → 12.3
              ↘
12.1 --------→ 12.4 → 12.5 → 12.6 → 12.7 → 12.8
```

- 12.2 and 12.3 both depend on 12.1 (data definitions must exist first)
- 12.4 depends on 12.1 (and benefits from 12.2/12.3 existing for `generateItem` calls)
- 12.5 through 12.8 are strictly sequential

---

## Phase 12.1: Data Layer Foundation

**Goal:** All static data, constants, and formulas needed by the item system exist and are importable.

**Estimated lines:** ~800 | **Sessions:** 1

### Files to create

| File | Contents |
|------|----------|
| `js/data/affixes.data.js` | 63 affix definitions with categories, within-category weights, base T1 min/max values, scale type (flat/percentage). Tier multiplier arrays. Slot weight matrix (6 categories × 6 slots). Zone-based skill level ranges table. Affix category groupings for validation. |
| `js/data/legendaries.data.js` | 15 legendary definitions: `{ id, name, slot, zone, emoji, uniqueEffectId, uniqueEffectDesc }`. No effect handlers yet (Phase 12.8). |
| `js/data/item-names.data.js` | Base name arrays per slot (8-10 names each). Prefix tables keyed by dominant affix category. Suffix tables keyed by defensive/utility affix. Epic rarity prefix pool. Weapon base name → damage type map (`WEAPON_DAMAGE_TYPES`). Slot emoji map. |

### Files to modify

| File | Changes |
|------|---------|
| `js/data/constants.js` | Add ~50 constants — see list below |
| `js/data/balance.js` | Add ~14 formula functions — see list below |

### New Constants (~50)

```
// Equipment
EQUIPMENT_SLOTS_V2 = ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'accessory']

// Inventory
INVENTORY_MAX = 30
INVENTORY_OVERFLOW_MAX = 3

// Rarity affix counts
RARITY_AFFIX_COUNTS = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 4 }
RARITY_MAX_MINUS_ONE_CHANCE = { uncommon: 0.40, rare: 0.50, epic: 0.60 }

// Affix validation
MAX_STATUS_AFFIXES_PER_ITEM = 2
MAX_SKILL_LEVEL_AFFIXES_PER_ITEM = 1
AFFIX_REROLL_MAX_ATTEMPTS = 10

// Tier multipliers
FLAT_TIER_MULTIPLIERS = [1.0, 2.0, 3.8, 6.5, 11.0, 18.0, 30.0]
PERCENT_TIER_MULTIPLIERS = [1.0, 1.3, 1.7, 2.2, 2.8, 3.6, 4.5]

// Zone → tier mapping
ZONE_TIERS = { whisperwood: 1, dustwind: 2, shadowmire: 3, ironhold: 4, emberfell: 5, frostpeak: 6, voidrift: 7 }

// Zone required levels for items
ZONE_REQUIRED_LEVELS = { whisperwood: 1, dustwind: 10, shadowmire: 20, ironhold: 30, emberfell: 45, frostpeak: 60, voidrift: 75 }

// Shop v2
SHOP_SLOTS_V2 = 4
SHOP_REFRESH_INTERVAL_V2 = 900000  // 15 minutes
SHOP_RARITY_WEIGHTS_V2 = { common: 55, uncommon: 35, rare: 10, epic: 0, legendary: 0 }
SHOP_REFRESH_COSTS = { whisperwood: 200, dustwind: 800, shadowmire: 2000, ironhold: 6000, emberfell: 15000, frostpeak: 40000, voidrift: 100000 }
SHOP_BUY_ZONE_BASE = { whisperwood: 100, dustwind: 400, shadowmire: 1000, ironhold: 3000, emberfell: 8000, frostpeak: 20000, voidrift: 50000 }
SHOP_BUY_RARITY_MULT = { common: 1.0, uncommon: 2.5, rare: 6.0 }

// Reforge
REFORGE_ZONE_BASE = { whisperwood: 200, dustwind: 600, shadowmire: 1500, ironhold: 4000, emberfell: 10000, frostpeak: 25000, voidrift: 60000 }
REFORGE_RARITY_MULT = { uncommon: 1.0, rare: 1.5, epic: 2.5, legendary: 4.0 }
REFORGE_ESCALATION = 2.2

// Imbue
IMBUE_ZONE_BASE = { whisperwood: 500, dustwind: 1500, shadowmire: 4000, ironhold: 10000, emberfell: 25000, frostpeak: 60000, voidrift: 150000 }
IMBUE_RARITY_MULT = { uncommon: 1.0, rare: 2.0, epic: 4.0 }

// Temper
TEMPER_LEVEL_BASE = [1000, 1500, 2000, 3000, 5000, 7000, 10000, 15000, 25000, 35000, 50000, 75000]
TEMPER_ZONE_MULT = { whisperwood: 0.3, dustwind: 0.5, shadowmire: 0.8, ironhold: 1.0, emberfell: 1.5, frostpeak: 2.5, voidrift: 4.0 }
TEMPER_RARITY_MULT = { rare: 1.0, epic: 1.5, legendary: 2.5 }
TEMPER_BOOST_PER_CYCLE = [0.05, 0.07, 0.10]  // cycles 1, 2, 3
TEMPER_SELECTION_LEVELS = [1, 5, 9]
TEMPER_MAX_LEVEL = 12
TEMPER_BRICK_THRESHOLD = 5  // full resets before bricking

// Drop rates
DROP_CHANCE_BY_ZONE = { whisperwood: 0.08, dustwind: 0.07, shadowmire: 0.06, ironhold: 0.05, emberfell: 0.05, frostpeak: 0.04, voidrift: 0.04 }
DROP_RARITY_WEIGHTS_BY_ZONE = {
  whisperwood: { common: 70, uncommon: 25, rare: 5, epic: 0 },
  dustwind:    { common: 65, uncommon: 28, rare: 7, epic: 0 },
  shadowmire:  { common: 60, uncommon: 30, rare: 8, epic: 2 },
  ironhold:    { common: 55, uncommon: 30, rare: 10, epic: 5 },
  emberfell:   { common: 50, uncommon: 30, rare: 12, epic: 8 },
  frostpeak:   { common: 45, uncommon: 30, rare: 15, epic: 10 },
  voidrift:    { common: 40, uncommon: 28, rare: 18, epic: 14 }
}
BOSS_DROP_RARITY_WEIGHTS = { rare: 60, epic: 35, legendary: 5 }
BOSS_SECOND_DROP_CHANCE = 0.40
BOSS_MATERIAL_RETURN = { min: 2, max: 4 }

// Materials
ZONE_MATERIALS = {
  whisperwood: { id: 'mat_whisperwood', name: 'Whisperwood Sap', dropRate: 0.10, bossCost: 5 },
  dustwind:    { id: 'mat_dustwind',    name: 'Dustwind Crystal', dropRate: 0.08, bossCost: 6 },
  shadowmire:  { id: 'mat_shadowmire',  name: 'Shadow Essence',  dropRate: 0.07, bossCost: 7 },
  ironhold:    { id: 'mat_ironhold',    name: 'Iron Core',       dropRate: 0.06, bossCost: 8 },
  emberfell:   { id: 'mat_emberfell',   name: 'Ember Shard',     dropRate: 0.05, bossCost: 9 },
  frostpeak:   { id: 'mat_frostpeak',   name: 'Frost Fragment',  dropRate: 0.04, bossCost: 10 },
  voidrift:    { id: 'mat_voidrift',    name: 'Void Particle',   dropRate: 0.03, bossCost: 12 }
}
MATERIAL_DECAY_FACTOR = 0.7

// Boss scaling
BOSS_HP_SCALING_FACTOR = 0.12
BOSS_DAMAGE_SCALING_FACTOR = 0.10
BOSS_LEVEL_BUFFER = 5
BOSS_AFFIX_TIER_DIVISOR = 14

// Skill level from items
BEYOND_MAX_SKILL_BONUS_PER_LEVEL = 0.20
SELL_PRICE_RATIO_V2 = 0.25

// Sell price — base only (modifications don't increase sell value)
EPIC_RARITY_PREFIX_CHANCE = 0.50

// Save
SAVE_KEY_V5 = 'clickoria_save_v5'
SAVE_VERSION_V5 = 5
```

### New Balance Functions (~14)

| Function | Purpose |
|----------|---------|
| `affixValueAtTier(baseMin, baseMax, tier, scaleType)` | Calculate min/max affix value at a given tier using multiplier arrays |
| `rollAffixValue(baseMin, baseMax, tier, scaleType)` | Roll a random value within the tier-scaled range |
| `itemBuyPrice(zone, rarity, affixQuality)` | Calculate buy price: `zoneBase × rarityMult × affixQualityMult` |
| `itemSellPrice(buyPrice)` | Calculate sell price: `buyPrice × 0.25` |
| `reforgeCost(zone, rarity, reforgeCount)` | Calculate reforge cost with escalation |
| `imbueCost(zone, rarity)` | Calculate imbue cost |
| `temperCost(temperLevel, zone, rarity)` | Calculate temper cost per level |
| `materialDropRate(zoneId, highestUnlockedZoneIndex)` | Effective material drop rate with decay |
| `bossEffectiveLevel(baseLevel, playerLevel)` | `max(baseLevel, playerLevel - 5)` |
| `bossScaledHP(baseHP, effectiveLevel)` | `baseHP × (1 + 0.12 × level)` |
| `bossScaledDamage(baseDamage, effectiveLevel)` | `baseDamage × (1 + 0.10 × level)` |
| `bossAffixTier(effectiveLevel)` | `clamp(1, 7, ceil(level / 14))` |
| `skillLevelRangeForZone(zoneTier)` | Returns `{ min, max, weights }` for skill level affix rolling |
| `beyondMaxSkillMultiplier(effectiveLevel, maxLevel)` | `1 + 0.20 × (effectiveLevel - maxLevel)` |

### Verification

- [x] All three data files import cleanly (`import { AFFIXES } from './affixes.data.js'`)
- [x] Constants are accessible: `console.log(FLAT_TIER_MULTIPLIERS[3])` → `6.5`
- [x] Formula functions callable: `affixValueAtTier(2, 6, 4, 'flat')` → `{ min: 13, max: 39 }`
- [x] No circular dependencies introduced
- [x] Existing game still loads and plays (no regressions)

---

## Phase 12.2: Item Generation Engine

**Goal:** Generate random items with correct affix rolling, validation, naming, and pricing.

**Estimated lines:** ~400 | **Sessions:** 1

### Files to create

| File | Contents |
|------|----------|
| `js/systems/item-gen.js` | Pure function module — no events, no state mutation |

### Key Functions

```javascript
// Main generation entry point
generateItem(zoneId, slot, rarity)          // → item object
generateLegendaryItem(zoneId, legendaryId, affixTier)  // → legendary item object
generateShopItem(zoneId)                     // → item with shop rarity weights

// Internal helpers
rollAffixCount(rarity)                       // Apply max-1 chance
rollAffix(slot, existingAffixes, zoneTier)   // Category → affix → value, with validation
validateAffix(affixId, existingAffixes)      // 6 rules: no dupe, max 2 status, max 1 skill level, etc.
generateItemName(slot, rarity, affixes)      // Prefix + base name + suffix
calculatePrice(zone, rarity, affixes)        // Buy/sell prices
generateUUID()                               // Unique item ID
```

### Affix Rolling Algorithm

```
For each affix slot:
  1. Roll category using slot weight table
  2. Roll specific affix within category using within-category weights
  3. Validate against 6 rules:
     a. No duplicate affix IDs
     b. Max 2 status affixes (chance + potency combined)
     c. Max 1 skill level affix (category, individual, or all-skills)
     d. skill_all_level cannot coexist with other skill level affixes
     e. (Redundant with a — no duplicate individual skill affixes)
     f. (Redundant with c — covered by max 1 rule)
  4. If invalid → re-roll from step 1 (max 10 retries, then skip)
  5. Roll value:
     - Skill level affixes: zone-based table (+1/+2/+3)
     - All others: tier formula (base × multiplier, uniform random in range)
```

### Verification

- [x] `generateItem('whisperwood', 'weapon', 'common')` returns valid item with 1 affix
- [x] `generateItem('voidrift', 'accessory', 'epic')` returns item with 3-4 affixes
- [x] No item has duplicate affixes (generate 1000 items, assert)
- [x] No item has > 2 status affixes (generate 1000 items, assert)
- [x] No item has > 1 skill level affix (generate 1000 items, assert)
- [x] Legendary items have 4 affixes + unique effect
- [x] Item names are sensible (prefix matches dominant affix category)
- [x] Prices scale correctly across zones

---

## Phase 12.3: Item Crafting Engine

**Goal:** Reforge, imbue, and temper logic as pure functions.

**Estimated lines:** ~350 | **Sessions:** 1

### Files to create

| File | Contents |
|------|----------|
| `js/systems/item-crafting.js` | Pure function module — no events, no state mutation |

### Key Functions

```javascript
// Reforge
canReforge(item)                             // → boolean (2+ affixes, not common)
getReforgeablAffixes(item)                   // → array of affix indices (excludes locked)
reforgeCost(item)                            // → gold cost
reforge(item, affixIndex)                    // → mutated item (re-rolls value, locks others)

// Imbue
canImbue(item)                               // → boolean (fewer than max affixes, not common/legendary)
imbueCost(item)                              // → gold cost
imbue(item, zoneId)                          // → mutated item (adds random affix)

// Temper
canTemper(item)                              // → boolean (rare+, not bricked)
temperCost(item)                             // → gold cost for next level
temper(item)                                 // → mutated item (advance level, select/boost)
isSelectionLevel(temperLevel)                // → boolean
getTemperBoostPercent(cycle)                 // → 0.05 | 0.07 | 0.10

// Temper Reset
canTemperReset(item)                         // → boolean (has temper progress, not bricked)
temperReset(item)                            // → mutated item (reset to 0, increment brickCount)
isBricked(item)                              // → boolean (brickCount >= threshold)
```

### Verification

- [x] Reforge re-rolls a single affix value, locks all others (item.reforgedAffix set)
- [x] Reforge cost escalates: `cost × 2.2^reforgeCount`
- [x] Cannot reforge Common items (only 1 affix)
- [x] Imbue adds an affix following slot weighting and validation rules
- [x] Cannot imbue Legendary or already-full items
- [x] Temper at selection levels (1, 5, 9) randomly picks an affix
- [x] Temper at boost levels applies correct % to the focused affix
- [x] Temper reset clears all progress, increments brickCount
- [x] Item bricks after 5 full resets (temperBrickCount >= 5)
- [x] Bricked items retain current temper progress but can't reset/re-temper

---

## Phase 12.4: Core Item System + Migration

**Goal:** items.js operational — equip/unequip, inventory management, stat aggregation. Save migration working.

**Estimated lines:** ~700 | **Sessions:** 1-2

### Files to create

| File | Contents |
|------|----------|
| `js/systems/items.js` | Main item system — init, update, event handlers, public API |

### Files to modify

| File | Changes |
|------|---------|
| `js/systems/player.js` | Rewrite `createNewPlayer()` (6 equipment slots), rewrite `getEquipmentBonus()` to read `state.equipmentStats`, add new computed stat fields |
| `js/services/storage.js` | v4→v5 migration with `LEGACY_ITEM_PRICES`, update `PREVIOUS_SAVE_KEYS` |
| `js/data/items.data.js` | Remove all 96 item definitions, keep only `LEGACY_ITEM_PRICES` export |
| `js/data/constants.js` | Update `SAVE_KEY` → `clickoria_save_v5`, `SAVE_VERSION` → `5`, `EQUIPMENT_SLOTS` → v2 array |

### items.js Public API

```javascript
export function init(deps)                    // Subscribe to events, store DI deps
export function update(dt)                    // Tick (future: legendary effects that need tick)

// Inventory
export function addItem(item)                 // → { destination: 'inventory'|'overflow'|'auto-scrapped' }
export function scrapItem(itemId)             // → gold value
export function bulkScrap(rarity)             // → { count, totalGold }

// Equipment
export function equipItem(itemId)             // Swap inventory↔equipment, recompute stats
export function unequipItem(slot)             // Move to inventory, recompute stats

// Stats
export function getEquipmentStatsV2()         // Recompute and cache equipment stat totals
export function getItemSkillLevelBonus(skillId) // Sum +level from all equipped items
export function getWeaponDamageType()         // 'physical' or 'magic' based on equipped weapon
export function getStatusProcChances()        // { bleed: 0.12, burn: 0.08, ... }

// Generation (delegate to item-gen.js)
export function generateItem(zoneId, slot, rarity)
export function generateLegendaryItem(zoneId, legendaryId, affixTier)
export function generateShopItem(zoneId)

// Materials
export function addMaterial(materialId, amount)
export function canAffordBoss(zoneId)         // Check material count
export function spendBossMaterials(zoneId)    // Deduct materials
```

### Verification

- [x] Fresh game creates player with 6 empty equipment slots
- [x] `state.player.inventory` is empty array, `state.player.materials` is empty object
- [x] v4 save migrates to v5: equipment cleared to 6 slots, inventory emptied, gold compensated
- [x] Gold compensation matches 50% of total buyPrice of old items (check with debug)
- [x] Equip item: moves from inventory to equipment slot, stat cache invalidated
- [x] Unequip item: moves from equipment to inventory
- [x] Equip with item already in slot: previous item returns to inventory
- [x] `getEquipmentStatsV2()` correctly sums affixes across all 6 slots
- [x] `getWeaponDamageType()` returns 'magic' for Staff/Wand/Scepter, 'physical' otherwise
- [x] `getItemSkillLevelBonus('flurry')` correctly sums individual + category + all-skills bonuses
- [x] Inventory cap (30) enforced — overflow and auto-scrap work
- [x] Existing game still loads (v4 saves migrate, fresh games work)

### v1 Code to Remove

- `js/data/items.data.js`: Remove all 96 `ITEMS` entries (keep only `LEGACY_ITEM_PRICES`)
- `js/systems/player.js`: Remove old `getEquipmentBonus()` that reads `ITEMS[itemId].stats` for 3 string slots
- `js/systems/player.js`: Remove `import { ITEMS }` (no longer needed for equipment)
- `js/systems/economy.js`: Remove `equipItem()`, `unequipItem()` functions (ownership moves to items.js)
- `js/systems/economy.js`: Remove `shop:requestEquip` and `shop:requestUnequip` event listeners
- `js/data/constants.js`: Replace `EQUIPMENT_SLOTS` (3 v1 slots) with v2 value, remove `SHOP_RARITY_WEIGHTS` / `SHOP_REFRESH_ESCALATION` / `SHOP_REFRESH_MAX_MULT` (v1 shop constants)

---

## Phase 12.5: System Integrations

**Goal:** All systems wired to the item system. Items drop, shop works, weapons affect damage type, skills use effective levels, bosses scale, materials drop and gate.

**Estimated lines:** ~600 | **Sessions:** 1

### Files to modify

| File | Changes |
|------|---------|
| `js/main.js` | Wire all DI (see architecture guide section 5), register `items.update` tick, add screen navigation for equipment/inventory |
| `js/systems/loot.js` | **Complete rewrite:** random drops per zone, material drops with decay, boss drops |
| `js/systems/economy.js` | Shop v2: generate 4 random items, 15-min refresh, flat refresh cost, export `deductGold()`/`addGold()` |
| `js/systems/combat.js` | Read weapon damage type via DI, emit `combat:skillDamage` for status proc rolling |
| `js/systems/skills.js` | Add `getEffectiveSkillLevel()` using DI, update `useSkill()` and passive handlers to use it |
| `js/systems/monster.js` | Boss scaling: effective level, scaled HP/damage, affix tier on instance |
| `js/systems/zones.js` | Material gating: check `canAffordBoss()`, call `spendBossMaterials()` before boss spawn |

### loot.js Rewrite

```javascript
// New loot flow (replaces fixed loot table lookups)
function handleMonsterKilled({ monster, isBoss, zoneId }) {
  if (isBoss) {
    handleBossLoot(monster, zoneId);
  } else {
    handleNormalLoot(zoneId);
  }
  handleMaterialDrop(zoneId);
}

function handleNormalLoot(zoneId) {
  const dropChance = DROP_CHANCE_BY_ZONE[zoneId];
  if (Math.random() >= dropChance) return;
  const rarity = rollRarity(DROP_RARITY_WEIGHTS_BY_ZONE[zoneId]);
  const slot = rollSlot();  // equal 1/6
  const item = deps.generateItem(zoneId, slot, rarity);
  const result = deps.addItem(item);
  emit('loot:itemDropped', { item, destination: result.destination });
}

function handleBossLoot(monster, zoneId) {
  // Guaranteed Rare+ drop
  const rarity1 = rollRarity(BOSS_DROP_RARITY_WEIGHTS);
  if (rarity1 === 'legendary') {
    // Roll which legendary from this zone
    const item = deps.generateLegendaryItem(zoneId, legendaryId, monster.affixTier);
  } else {
    const item = deps.generateItem(zoneId, rollSlot(), rarity1);
  }
  // ... add to inventory, emit event

  // 40% chance second drop (normal rarity weights)
  if (Math.random() < BOSS_SECOND_DROP_CHANCE) { ... }

  // Return 2-4 materials
  const matReturn = randomInt(BOSS_MATERIAL_RETURN.min, BOSS_MATERIAL_RETURN.max);
  // ... add materials
}
```

### economy.js Shop v2

```javascript
export function refreshShop(manual) {
  // Generate 4 random items using DI
  currentShopItems = [];
  for (let i = 0; i < SHOP_SLOTS_V2; i++) {
    currentShopItems.push(deps.generateShopItem(player.currentZone));
  }
  // ... timer reset, cost handling (flat per zone, no escalation)
}
```

### Verification

- [ ] Items drop from normal monsters (check drop rates by zone)
- [ ] Drop rarity distribution matches spec (verify over 100+ kills)
- [ ] Boss drops guaranteed Rare+, 5% legendary chance
- [ ] Shop shows 4 randomly generated items
- [ ] Shop refresh is 15 minutes, flat cost per zone
- [ ] Weapon damage type affects basic clicks (Staff → magic damage → vs magic resist)
- [ ] No weapon equipped defaults to physical damage
- [ ] Effective skill level includes item bonuses (`getEffectiveSkillLevel` works)
- [ ] Beyond-max skill scaling applies (+20% per level over 5)
- [ ] Boss effective level = `max(baseLv, playerLv - 5)`
- [ ] Boss HP and damage scale with effective level
- [ ] Materials drop from regular monsters
- [ ] Material drop rate decays for lower zones (`0.7 ^ zones_above`)
- [ ] Boss challenge requires materials (blocked if insufficient)
- [ ] Boss challenge spends materials on start
- [ ] Boss returns 2-4 materials on kill

### v1 Code to Remove

- `js/systems/loot.js`: Remove entire old `handleMonsterKilled` that uses `MONSTERS[id].lootTable` with fixed item IDs
- `js/systems/loot.js`: Remove `import { ITEMS }` and `import { MONSTERS }` (no longer needed)
- `js/systems/economy.js`: Remove old `refreshShop()` logic that picks from `zone.shopItems` fixed array
- `js/systems/economy.js`: Remove `weightedRandomItem()` helper (replaced by item-gen.js)
- `js/systems/economy.js`: Remove old `purchaseItem()` that uses string itemId — replace with shopIndex-based purchase
- `js/systems/economy.js`: Remove old `sellItem()` / `sellAllByRarity()` that use string item IDs (selling moves to items.js as "scrap")
- `js/data/zones.data.js`: Remove `shopItems` arrays from each zone definition (no longer used)

---

## Phase 12.6: Crafting Integration

**Goal:** Reforge, imbue, and temper operations wired through the event system with gold deduction and stat updates.

**Estimated lines:** ~150 | **Sessions:** 0.5

### Files to modify

| File | Changes |
|------|---------|
| `js/systems/items.js` | Add event listeners for `item:requestReforge`, `item:requestImbue`, `item:requestTemper`, `item:requestTemperReset`. Delegate to item-crafting.js, handle gold deduction via DI, emit result events. Invalidate stat cache if crafted item is equipped. |

### Crafting Flow (in items.js)

```javascript
on('item:requestReforge', ({ itemId, affixIndex }) => {
  const item = findItem(itemId);  // inventory or equipment
  if (!canReforge(item)) return emit('item:craftFailed', { reason: 'ineligible' });
  const cost = reforgeCost(item);
  if (!deps.deductGold(cost)) return emit('item:craftFailed', { reason: 'gold' });
  const oldValue = item.affixes[affixIndex].value;
  reforge(item, affixIndex);  // mutates item
  if (isEquipped(itemId)) recomputeEquipmentStats();
  emit('item:reforged', { item, affixIndex, oldValue, newValue: item.affixes[affixIndex].value });
});
```

### Verification

- [ ] `emit('item:requestReforge', { itemId, affixIndex: 0 })` reforges the correct affix
- [ ] Gold is deducted on reforge (verify player.gold decreases)
- [ ] Reforge cost escalates with `reforgeCount` (check 1st vs 3rd reforge)
- [ ] Imbue adds an affix, gold deducted
- [ ] Temper advances level, gold deducted
- [ ] Temper at selection level (1, 5, 9) randomly picks affix focus
- [ ] Temper reset clears progress, no gold cost
- [ ] Bricking after 5 resets prevents further tempering
- [ ] Crafting an equipped item updates stat cache immediately
- [ ] Crafting an inventory item does not trigger stat recalc

---

## Phase 12.7: UI

**Goal:** Full UI for equipment, inventory, shop v2, and crafting. All item operations accessible through the interface.

**Estimated lines:** ~1400 | **Sessions:** 2

### Files to create

| File | Contents |
|------|----------|
| `js/ui/equipment-ui.js` | 6-slot equipment grid (2×3 or 3×2), empty slot placeholders, tap to view detail, unequip button |
| `js/ui/inventory-ui.js` | 30-slot grid (5×6), overflow section (3 slots in amber), sort buttons (slot/rarity/zone/newest), bulk scrap button, tap to view item detail |

### Files to modify

| File | Changes |
|------|---------|
| `js/ui/shop-ui.js` | **Major rewrite:** display generated items (not fixed), show affixes, rarity colors, refresh timer (15 min), flat refresh cost |
| `index.html` | Add equipment screen, inventory screen, crafting modals. Add equipment/inventory nav buttons. |
| `css/components.css` | Rarity color borders, item cards, affix display, temper progress bar, lock icons, overflow highlight |
| `css/variables.css` | Rarity colors as CSS variables (if not already defined) |
| `js/ui/zones-ui.js` | Material cost display on boss challenge button |
| `js/ui/modals.js` | Crafting confirmation modals (reforge, imbue, temper) |
| `js/main.js` | Screen navigation for equipment/inventory screens |

### UI Components

#### Item Card (reusable)
- Rarity-colored border
- Item name (colored by rarity)
- Slot icon + zone tier badge
- Affix list with values
- Temper level bar (if tempered)
- Lock icons on reforge-locked affixes
- Legendary unique effect text (gold highlight)

#### Item Detail Panel
- Full item card (expanded)
- Compare panel: currently equipped item in same slot, side-by-side
- Green/red stat comparison indicators
- Action buttons: Equip | Scrap | Reforge | Imbue | Temper (contextual)

#### Crafting Modals
- **Reforge modal:** Select affix to target, show cost, confirm, animation, show result
- **Imbue modal:** Show empty slot indicator, show cost, confirm, animation, reveal new affix
- **Temper modal:** Show 12-level progress bar, show cost for next level, on selection levels show which affix was picked, option to continue or reset

#### Boss Challenge
- Material count display on boss entry modal
- "Challenge Boss (costs X materials)" button
- Greyed out with red text if insufficient materials

### Verification

- [ ] Equipment screen shows 6 slots with correct layout
- [ ] Empty slots show ghost outline with slot name
- [ ] Tap equipped item → detail view with unequip option
- [ ] Inventory shows 30 slots in 5×6 grid
- [ ] Overflow section visible below main grid (amber highlight)
- [ ] Sort buttons work: by slot, rarity, zone, newest
- [ ] "Scrap All Common" button works (bulk scrap)
- [ ] Tap inventory item → detail view with compare panel
- [ ] Compare panel shows green/red stat differences
- [ ] Equip button works from detail view
- [ ] Scrap button works from detail view
- [ ] Shop shows 4 generated items with affixes
- [ ] Shop refresh timer counts down from 15 minutes
- [ ] Manual refresh costs flat amount per zone
- [ ] Reforge/imbue/temper accessible from item detail
- [ ] Crafting modals show costs and confirmation
- [ ] Boss challenge shows material requirements
- [ ] All interactions work on mobile (44px targets)
- [ ] Rarity colors match spec (grey/green/blue/purple/orange)

### v1 Code to Remove

- `js/ui/shop-ui.js`: Remove all v1 shop rendering that reads `ITEMS[itemId]` — fully replaced by generated item display

---

## Phase 12.8: Legendary Effects + Polish

**Goal:** All 15 legendary unique effects functional. Debug tools. Edge cases. Final polish.

**Estimated lines:** ~600 | **Sessions:** 1-2

### Files to create/modify

| File | Changes |
|------|---------|
| `js/systems/items.js` | Add `LEGENDARY_EFFECT_HANDLERS` map with 15 effect implementations. Subscribe/unsubscribe on equip/unequip (same lifecycle as passive skills). |
| `js/debug.js` | Add debug tools: `giveItem(zoneId, rarity)`, `giveLegendary(legendaryId)`, `giveMaterial(materialId, amount)`, `clearInventory()`, `maxTemper(itemId)` |

### Legendary Effects (15)

| # | Name | Effect Implementation |
|---|------|----------------------|
| 1 | Whisperwood Heart | Subscribe to energy regen tick → double regen when player HP < 30% |
| 2 | Thornweave Wraps | Subscribe to `status:bleedTick` → check if target has slow → +50% bleed damage |
| 3 | Sandstorm Fang | Modify `combat:click` handler → split each hit into 2 hits at 60% damage |
| 4 | Mirage Band | Subscribe to `player:damaged` → 20% chance to negate damage |
| 5 | Venom Lord's Grip | Override `POISON_MAX_STACKS` check → allow unlimited stacks |
| 6 | Shadowmire Cowl | Modify status duration calculation → +40% duration on monsters |
| 7 | Ironforge Crown | Add armor value × 0.5 to magic resist in stat calculation |
| 8 | Titan's Greaves | Check HP > 80% in `getComputedStats()` → +25% damage bonus |
| 9 | Embercaller's Staff | Modify burn tick → allow crit rolls |
| 10 | Ashen Plate | Subscribe to `player:burned` → convert damage to healing |
| 11 | Frostbite Edge | Subscribe to `combat:crit` → apply 0.5s freeze |
| 12 | Glacial Mantle | Subscribe to tick → regen 5% shield/sec when not recently damaged |
| 13 | Crown of the Void King | Subscribe to `combat:monsterKilled` → 10% chance full shield restore |
| 14 | Soulreaver | Subscribe to `combat:click` → 5% of damage dealt → add to shield |
| 15 | Void Eternal | Subscribe to `combat:monsterKilled` → reduce all skill cooldowns by 1s |

### Polish Items

- Toast messages for: item dropped, inventory full (overflow), auto-scrapped, crafting results
- Edge case: equip item while in combat (should work, stats update immediately)
- Edge case: scrap equipped item (should unequip first)
- Edge case: crafting an item that's currently being compared
- Edge case: inventory full during boss loot (overflow → auto-scrap chain)
- Edge case: death during boss fight after spending materials (materials already spent, boss despawns)

### Debug Tools

```javascript
window.DEBUG.giveItem = (zone = 'whisperwood', rarity = 'rare') => { ... }
window.DEBUG.giveLegendary = (legendaryId) => { ... }
window.DEBUG.giveMaterial = (materialId, amount = 10) => { ... }
window.DEBUG.clearInventory = () => { ... }
window.DEBUG.maxTemper = (itemId) => { ... }
```

### Verification

- [ ] Whisperwood Heart: energy regen doubles below 30% HP
- [ ] Thornweave Wraps: bleed deals +50% to slowed targets
- [ ] Sandstorm Fang: each click hits twice at 60% damage
- [ ] Mirage Band: 20% of incoming damage negated (verify over 100 hits)
- [ ] Venom Lord's Grip: poison stacks exceed normal max (10)
- [ ] Shadowmire Cowl: status durations +40% on monsters
- [ ] Ironforge Crown: magic resist includes 50% of armor value
- [ ] Titan's Greaves: +25% damage when HP > 80%
- [ ] Embercaller's Staff: burn ticks can crit
- [ ] Ashen Plate: fire damage heals instead of hurting
- [ ] Frostbite Edge: crits freeze target for 0.5s
- [ ] Glacial Mantle: shield regens when not being hit
- [ ] Crown of the Void King: 10% chance of full shield on kill
- [ ] Soulreaver: shield gains 5% of damage dealt
- [ ] Void Eternal: all cooldowns -1s on kill
- [ ] Legendary effects subscribe on equip, unsubscribe on unequip (no orphaned listeners)
- [ ] Debug tools all functional
- [ ] No console errors across all operations
- [ ] Save/load preserves all item state (equipment, inventory, materials, craft state)
- [ ] Full play session: drops feel rewarding, shop is useful, crafting is meaningful gold sink

---

## Workflow Per Phase

```
1. "Let's do Phase 12.X"
2. Claude reads this roadmap + architecture guide + design doc
3. Claude implements the files listed for that phase
4. User tests in browser (python -m http.server 8000 or npx serve .)
5. Fix any issues found
6. Git commit
7. Update this roadmap (mark phase ✅)
8. Next phase
```

---

*Each phase is independently verifiable and builds on the previous. The game remains playable after every phase.*

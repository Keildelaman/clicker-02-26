# Plan: Fix C1+C2 — Consistent Dependency Pattern for Cross-System/Cross-Layer Communication

## Goal

Eliminate all direct cross-layer imports so the dependency graph matches the documented architecture:
```
Systems ──emit──> EventBus ──notify──> UI (reads state only)
```

## Approach

Two complementary patterns, both already partially established in the codebase:

1. **C1 (System→System):** Dependency Injection via `init(deps)` — already used by `combat.js` and `skills.js`, extend to all systems that need cross-system access
2. **C2 (UI→System mutations):** Intent Events — UI emits `request:*` events, systems handle them and emit result events that UI already listens to. Read-only data is exposed on `state` so UI reads from the central store.

## Violations to Fix (10 total)

### C1: System→System / System→UI (5 violations)

| # | File | Imports | Used For |
|---|------|---------|----------|
| 1 | `health.js:13` | `player.js → getComputedStats` | `syncMaxHP()`, `damagePlayer()`, `update()`, `completeRespawn()` |
| 2 | `energy.js:18` | `player.js → getComputedStats` | `onCombatClick()`, `onMonsterKilled()` |
| 3 | `progression.js:18` | `player.js → getComputedStats, invalidateStatCache` | `levelUp()`, `init()` handler |
| 4 | `skills.js:28` | `player.js → invalidateStatCache` | `upgradeSkill()`, equip/unequip, `respec()`, buff expiry, death |
| 5 | `progression.js:17` | `ui/toasts.js → showToast` | `checkMilestones()` |

### C2: UI→System (5 violations)

| # | File | Imports | Mutation Calls | Read-Only Calls |
|---|------|---------|----------------|-----------------|
| 6 | `shop-ui.js:14` | `economy.js (*)` | `purchaseItem`, `sellItem`, `sellAllByRarity`, `equipItem`, `unequipItem`, `refreshShop` | `getCurrentShopItems`, `getRefreshCost`, `getTimeToRefresh` |
| 7 | `skills-ui.js:17` | `skills.js (*)` | `useSkill`, `unlockSkill`, `upgradeSkill`, `equipActiveSkill`, `unequipActiveSkill`, `equipPassiveSkill`, `unequipPassiveSkill`, `releaseChannel`, `respec` | `getSkillCooldownRemaining` |
| 8 | `zones-ui.js:16` | `zones.js` | `travelToZone`, `challengeBoss` | `canTravelToZone`, `getBossKillProgress` |
| 9 | `stats-ui.js:12` | `player.js` | (none) | `getComputedStats` |
| 10 | `shop-ui.js:57-60` | (DOM hack) | Programmatically clicks nav button | — |

---

## Implementation Steps

### Phase A: C1 Fixes — System-to-System DI (5 files)

#### Step 1: `health.js` — Inject `getComputedStats`

- Remove: `import { getComputedStats } from './player.js'`
- Add module-level: `let computeStats = null;`
- Change `init()` signature to `init(deps = {})`, store `computeStats = deps.getComputedStats`
- Replace all 4 calls to `getComputedStats()` with `computeStats()`
- Update `main.js`: change `health.init()` → `health.init({ getComputedStats: player.getComputedStats })`

#### Step 2: `energy.js` — Inject `getComputedStats`

- Remove: `import { getComputedStats } from './player.js'`
- Add module-level: `let computeStats = null;`
- Change `init()` to `init(deps = {})`, store `computeStats = deps.getComputedStats`
- Replace 2 calls to `getComputedStats()` with `computeStats()`
- Update `main.js`: change `energy.init()` → `energy.init({ getComputedStats: player.getComputedStats })`

#### Step 3: `progression.js` — Inject `getComputedStats` + `invalidateStatCache`, remove toast import

- Remove: `import { getComputedStats, invalidateStatCache } from './player.js'`
- Remove: `import { showToast } from '../ui/toasts.js'`
- Add module-level: `let computeStats = null; let invalidateStats = null;`
- Change `init(deps = {})`, store both
- Replace 2 calls to `getComputedStats()` with `computeStats()`
- Replace 1 call to `invalidateStatCache()` with `invalidateStats()`
- Replace `showToast(message, 'warning', 4000)` with `emit('progression:milestone', { level, message })`
- Add listener in a UI module (e.g., `stats-ui.js` or `combat-ui.js`) or `renderer.js`: `on('progression:milestone', ({ message }) => showToast(message, 'warning', 4000))`
- Update `main.js`: `progression.init({ getComputedStats: player.getComputedStats, invalidateStatCache: player.invalidateStatCache })`

#### Step 4: `skills.js` — Inject `invalidateStatCache`

- Remove: `import { invalidateStatCache } from './player.js'`
- Add module-level: `let invalidateStats = null;`
- In existing `init(deps)`, add: `invalidateStats = deps.invalidateStatCache`
- Replace all ~10 calls to `invalidateStatCache()` with `invalidateStats()`
- Update `main.js`: add `invalidateStatCache: player.invalidateStatCache` to skills.init() deps

#### Step 5: Update `main.js` init calls

Wire all the new deps in the boot sequence. The init order already handles dependencies correctly (player.init() runs first).

---

### Phase B: C2 Fixes — UI→System Intent Events (5 files)

#### Step 6: `shop-ui.js` — Replace economy imports with intent events + state reads

**Mutations → Intent Events:**
- `economy.purchaseItem(itemId)` → `emit('shop:requestPurchase', { itemId })`
- `economy.sellItem(itemId)` → `emit('shop:requestSell', { itemId })`
- `economy.sellAllByRarity(rarity, type)` → `emit('shop:requestBulkSell', { rarity, typeFilter: type })`
- `economy.equipItem(itemId)` → `emit('shop:requestEquip', { itemId })`
- `economy.unequipItem(slot)` → `emit('shop:requestUnequip', { slot })`
- `economy.refreshShop(true)` → `emit('shop:requestRefresh')`

**Read-only → State exposure:**
- In `economy.js`, write transient data to `state`: `state.shopItems`, `state.shopRefreshTimer`, `state.shopRefreshCount`
- In `shop-ui.js`, read from `state` instead of calling getters

**Toast feedback:**
- Move inline toasts to event handlers: `on('item:purchased', ...)`, `on('item:sold', ...)`, etc.

**Economy.js changes:**
- Add event listeners in `init()` for all `shop:request*` intent events
- These handlers call the existing internal functions and emit appropriate result/failure events

**Remove:** `import * as economy from '../systems/economy.js'`

#### Step 7: `skills-ui.js` — Replace skills imports with intent events + state reads

**Mutations → Intent Events:**
- `skills.useSkill(skillId)` → `emit('skill:requestUse', { skillId })`
- `skills.unlockSkill(skillId)` → `emit('skill:requestUnlock', { skillId })`
- `skills.upgradeSkill(skillId)` → `emit('skill:requestUpgrade', { skillId })`
- `skills.equipActiveSkill(skillId, slot)` → `emit('skill:requestEquipActive', { skillId, slot })`
- `skills.unequipActiveSkill(slot)` → `emit('skill:requestUnequipActive', { slot })`
- `skills.equipPassiveSkill(skillId, slot)` → `emit('skill:requestEquipPassive', { skillId, slot })`
- `skills.unequipPassiveSkill(slot)` → `emit('skill:requestUnequipPassive', { slot })`
- `skills.releaseChannel()` → `emit('skill:requestReleaseChannel')`
- `skills.respec()` → `emit('skill:requestRespec')`

**Read-only → State exposure:**
- Cooldowns are already on `state.player.skillCooldowns` — compute remaining from there, or expose a helper on state
- Add `getSkillCooldownRemaining` logic directly in skills-ui (it's a one-liner: `Math.max(0, player.skillCooldowns[id] || 0)`)

**Skills.js changes:**
- Add event listeners in `init()` for all `skill:request*` intent events
- These delegate to existing internal functions

**Special: `useSkill` return value** — Currently the UI checks the boolean return to decide whether to show "not enough energy" toast. Solution: have skills.js emit `skill:useFailed` with a reason, and have the UI listen.

**Remove:** `import * as skills from '../systems/skills.js'`

#### Step 8: `zones-ui.js` — Replace zones imports with intent events + state reads

**Mutations → Intent Events:**
- `travelToZone(zoneId)` → `emit('zone:requestTravel', { zoneId })`
- `challengeBoss()` → `emit('zone:requestBoss')`

**Read-only → Inline computation from state:**
- `canTravelToZone(zoneId)` — replace with `state.player.unlockedZones.includes(zoneId)` (one-liner)
- `getBossKillProgress()` — inline the logic reading from `state.player.zoneKills`, `state.player.bossesDefeated`, and zone data

**Zones.js changes:**
- Add listeners for `zone:requestTravel`, `zone:requestBoss` in `init()`
- `zone:requestTravel` already has a handler via `zone:autoTravel` — unify

**Remove:** `import { travelToZone, challengeBoss, canTravelToZone, getBossKillProgress } from '../systems/zones.js'`

#### Step 9: `stats-ui.js` — Remove player.js import

**Read-only → Expose computed stats on state:**
- In `player.js`: after computing stats, write `state.computedStats = statCache` in `getComputedStats()`
- In `stats-ui.js`: read `state.computedStats.attack` instead of calling `getComputedStats().attack`
- The cache is already invalidated on relevant events, so this is always fresh when UI reads it

**Remove:** `import { getComputedStats } from '../systems/player.js'`

#### Step 10: `shop-ui.js` — Fix DOM click hack for navigation

- Replace the `btn.click()` hack with `emit('nav:navigate', { screen: 'combat' })` (event already exists in `main.js:140`)

---

## Files Changed Summary

| File | Phase | Changes |
|------|-------|---------|
| `js/systems/health.js` | A | DI for getComputedStats |
| `js/systems/energy.js` | A | DI for getComputedStats |
| `js/systems/progression.js` | A | DI for getComputedStats + invalidateStatCache, remove toast import |
| `js/systems/skills.js` | A+B | DI for invalidateStatCache, add intent event listeners |
| `js/systems/economy.js` | B | Add intent event listeners, expose shop state on `state` |
| `js/systems/zones.js` | B | Add intent event listeners |
| `js/systems/player.js` | B | Expose computedStats on state |
| `js/ui/shop-ui.js` | B | Replace economy import with events + state reads |
| `js/ui/skills-ui.js` | B | Replace skills import with events + state reads |
| `js/ui/zones-ui.js` | B | Replace zones import with events + state reads |
| `js/ui/stats-ui.js` | B | Replace player import with state reads |
| `js/ui/combat-ui.js` | A | Add milestone toast listener (from progression) |
| `js/main.js` | A+B | Update init() calls with deps |

**Total: 13 files**

## Risk Assessment

- **Phase A** is low-risk: DI is a mechanical refactor, no behavior changes
- **Phase B** is medium-risk: changing the mutation flow requires careful event wiring; bugs would manifest as silent failures (intent emitted but no handler)
- **Mitigation**: Run the game after each step and verify the feature still works

## What This Does NOT Address

- H1 (skills.js God Object) — separate concern, separate PR
- H3 (hardcoded skill IDs) — needs data-driven passive system first
- C4 (unguarded state) — deeper refactor, separate PR

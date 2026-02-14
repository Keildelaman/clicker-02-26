# Refactoring Plan — Realms of Clickoria

## Priority 1: Fix C1+C2 — Consistent Dependency Pattern [COMPLETED]

**Status:** DONE (Phase A + Phase B committed)

**Goal:** Eliminate all direct cross-layer imports so the dependency graph matches the documented architecture.

**Result:** Zero `js/systems/ → js/systems/` imports. Zero `js/ui/ → js/systems/` imports.

<details>
<summary>Original Plan (click to expand)</summary>

### Goal

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

</details>

---

## Priority 2: Fix H1 — Extract Skill Effect/Passive Handlers from God Object

**Status:** PLANNED

**Goal:** Break `skills.js` (1,001 lines, 13+ responsibilities) into focused modules. Extract the 15 active effect handlers and 10 passive handlers into separate files so that adding a new skill doesn't require modifying the core skill system.

### Problem

`skills.js` currently handles:
1. SP tracking, level-up SP grants
2. Skill unlock/upgrade logic
3. Active skill equip/unequip
4. Passive skill equip/unequip with lifecycle hooks
5. **15 individual `EFFECT_HANDLERS`** (one per active skill) — 184 lines
6. **10 `PASSIVE_HANDLERS`** with event subscription management — 169 lines
7. Cooldown tick management
8. Buff expiry and drain logic
9. Channel mechanic (start/release/cancel)
10. Toggle mechanic (momentum with stack decay)
11. Shield expiry
12. Respec logic
13. Death cleanup

Every new skill requires modifying this file. At 25 skills it's 1,001 lines. At 50 it would be unmanageable.

### Approach

Split into 3 files:

| File | Responsibility | Est. Lines |
|------|---------------|------------|
| `skills.js` | Core skill engine (unlock, upgrade, equip, cooldowns, respec, ticks) | ~550 |
| `skill-effects.js` | Active skill effect handlers (EFFECT_HANDLERS map) | ~220 |
| `skill-passives.js` | Passive skill handlers (PASSIVE_HANDLERS map) | ~200 |

### Phase C: Extract Active Effect Handlers

#### Step 1: Create `js/systems/skill-effects.js`

Extract the `EFFECT_HANDLERS` map (15 handlers) into a new file.

**Dependencies the handlers need (passed via a context object):**
- `emit()` — from event-bus (imported directly)
- `state` — from game-state (imported directly)
- `getPlayer()` — from game-state (imported directly)
- `invalidateStats()` — module-level DI var (passed via registration context)

**New file structure:**
```javascript
// skill-effects.js
import { emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';

let invalidateStats = null;

export function initEffects(deps) {
  invalidateStats = deps.invalidateStatCache;
}

export const EFFECT_HANDLERS = {
  power_strike(skillDef, levelData) { ... },
  execute(skillDef, levelData) { ... },
  // ... all 15 handlers
};
```

**Skills.js changes:**
- Remove `EFFECT_HANDLERS` map definition (lines 39-222)
- Add: `import { EFFECT_HANDLERS, initEffects } from './skill-effects.js';`
- In `init()`: call `initEffects({ invalidateStatCache: deps.invalidateStatCache })`
- `useSkill()` dispatch remains unchanged (already uses `EFFECT_HANDLERS[skillId]`)

#### Step 2: Create `js/systems/skill-passives.js`

Extract `PASSIVE_HANDLERS`, `passiveHandlerRefs`, `cleanupPassive()`, and `initPassives()`.

**Dependencies:**
- `emit()`, `on()`, `off()` — from event-bus
- `state`, `getPlayer()` — from game-state
- `SKILLS` — from skills.data.js
- `invalidateStats()` — DI via init
- `cooldownReadyNotified` — shared Set (pass via context or import)

**New file structure:**
```javascript
// skill-passives.js
import { on, off, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';

let invalidateStats = null;
let cooldownReadyNotified = null;
const passiveHandlerRefs = {};

export function initPassives(deps) {
  invalidateStats = deps.invalidateStatCache;
  cooldownReadyNotified = deps.cooldownReadyNotified;
  // Re-subscribe on game load
  resubscribePassives();
}

export const PASSIVE_HANDLERS = { ... };
export function cleanupPassive(skillId) { ... }
export function resubscribePassives() { ... }
```

**Skills.js changes:**
- Remove `PASSIVE_HANDLERS`, `passiveHandlerRefs`, `cleanupPassive()`, `initPassives()` (lines 598-793)
- Add: `import { PASSIVE_HANDLERS, initPassives, cleanupPassive } from './skill-passives.js';`
- In `init()`: call `initPassives({ invalidateStatCache: deps.invalidateStatCache, cooldownReadyNotified })`
- Equip/unequip/respec dispatch remains unchanged (already uses `PASSIVE_HANDLERS[skillId]`)

#### Step 3: Extract `onCombatClickMomentum()` and channel/toggle tick logic

The `update()` function (lines 871-952) handles momentum toggle ticks, buff expiry, channel auto-fire, and shield expiry. These are tightly coupled to the core tick loop, so they stay in `skills.js`. However, the momentum click handler (`onCombatClickMomentum`, lines 797-808) is momentum-specific and could move to `skill-effects.js`.

**Decision:** Keep `update()` in `skills.js` (it's the tick coordinator) but move `onCombatClickMomentum` alongside the `momentum` effect handler in `skill-effects.js`.

#### Step 4: Update `main.js` — no changes needed

`main.js` only calls `skills.init(deps)`. The internal split is transparent to the bootstrap.

#### Step 5: Update `CLAUDE.md` — add new files to project structure

### Files Changed

| File | Changes |
|------|---------|
| `js/systems/skill-effects.js` | NEW — 15 active effect handlers |
| `js/systems/skill-passives.js` | NEW — 10 passive handlers + lifecycle |
| `js/systems/skills.js` | MODIFIED — import from new files, remove extracted code |
| `CLAUDE.md` | MODIFIED — update project structure |

### Risk Assessment

- **Low risk**: Pure extraction, no behavior changes
- **Key invariant**: `EFFECT_HANDLERS[skillId](skillDef, levelData)` dispatch signature unchanged
- **Key invariant**: `PASSIVE_HANDLERS[skillId].onEquip/onUnequip` lifecycle unchanged
- **Test**: Use every active skill, equip/unequip every passive, respec, and verify behavior matches

---

## Priority 3: Fix C3+H5 — Move Business Logic Out of `main.js` and `tutorial.js`

**Status:** PLANNED

**Goal:** Restore `main.js` to pure orchestration (import, init, wire). Fix `tutorial.js` System→UI import and direct state mutations.

### Problems

1. **main.js:91-114** — gold reward calculation, zone kill tracking, auto-save logic (belongs in economy/rewards system)
2. **main.js:175-257** — 12 DEBUG functions that directly mutate state (belongs in separate debug module)
3. **tutorial.js:14** — imports `showToast` from `ui/toasts.js` (System→UI violation, same pattern as the C1 `progression→toasts` fix)
4. **tutorial.js** — 10 direct player state mutations (gold, hp, energy) that should be intent events

### Phase D: Clean up `main.js`

#### Step 1: Move gold/reward logic to `economy.js`

Move the `combat:monsterKilled` gold handler (lines 91-114) into `economy.js`:
- `economy.js` already has access to `state` and can compute `goldFind` via `state.computedStats`
- Add event listener in `economy.init()`: `on('combat:monsterKilled', handleRewards)`
- Zone kill tracking (`zoneKills`) moves here too, or to a dedicated function in `zones.js`
- Auto-save on milestone stays in `main.js` (that's orchestration)

#### Step 2: Extract DEBUG to `js/debug.js`

Create `js/debug.js` with the 12 debug functions.
- Import systems via EventBus (emit intent events) rather than direct state mutation
- Wire up in `main.js`: `import './debug.js'` (side-effect import)
- `main.js` shrinks by ~85 lines

### Phase E: Fix `tutorial.js` architecture

#### Step 3: Replace `showToast` import with event emission

- Remove: `import { showToast } from '../ui/toasts.js'`
- Replace all 3 `showToast()` calls with `emit('tutorial:tip', { message, type, duration })`
- Add listener in `tutorial-ui.js`: `on('tutorial:tip', ({ message, type, duration }) => showToast(message, type, duration))`

#### Step 4: Replace direct state mutations with intent events

Replace 10 direct mutations with intent events:

| Current Mutation | Replace With |
|-----------------|--------------|
| `p.gold += amount; p.totalGoldEarned += amount; emit('gold:earned')` | `emit('tutorial:grantGold', { amount, reason })` |
| `p.hp = p.maxHP; p.energy = p.maxEnergy` | `emit('tutorial:fullHeal')` |

- `economy.js` listens for `tutorial:grantGold` → handles gold mutation + emits `gold:earned`
- `health.js` listens for `tutorial:fullHeal` → heals to max + emits `player:hpChanged`
- `energy.js` listens for `tutorial:fullHeal` → fills energy + emits `energy:changed`

### Files Changed

| File | Changes |
|------|---------|
| `js/systems/economy.js` | Add reward handler from main.js, add tutorial:grantGold listener |
| `js/systems/health.js` | Add tutorial:fullHeal listener |
| `js/systems/energy.js` | Add tutorial:fullHeal listener |
| `js/systems/tutorial.js` | Remove showToast import, replace mutations with intents |
| `js/ui/tutorial-ui.js` | Add tutorial:tip listener |
| `js/debug.js` | NEW — extracted debug tools |
| `js/main.js` | Remove business logic, import debug.js |
| `CLAUDE.md` | Update project structure |

### Risk Assessment

- **Phase D**: Low risk — moving existing logic between files
- **Phase E**: Medium risk — tutorial mutations are event-driven and need careful ordering
- **Mitigation**: Test full tutorial flow (first kill bonus, first boss bonus, death recovery, zone change heal)

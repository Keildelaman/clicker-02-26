# Architecture Analysis: Realms of Clickoria

**Date:** 2026-02-14
**Scope:** Full codebase review (~14,600 lines across 40 files)
**Focus:** Separation of concerns, coupling, cohesion, DRY, SOLID, clean code, maintainability
**Last Updated:** 2026-02-14 (post Phase A+B+C+D+E refactor — all critical/high priority items resolved)

---

## Resolution Status

| Finding | Severity | Status | Commit |
|---------|----------|--------|--------|
| C1. System-to-system imports | CRITICAL | **RESOLVED** | Phase A — DI via `init(deps)` |
| C2. UI-to-system mutation calls | CRITICAL | **RESOLVED** | Phase B — Intent events + state reads |
| C3. `main.js` business logic | CRITICAL | **RESOLVED** | Phase D — gold reward → economy.js, zone kills → zones.js, DEBUG → debug.js |
| C4. Unguarded state | CRITICAL | Open | — |
| H1. `skills.js` God Object | HIGH | **RESOLVED** | Phase C — extracted to skill-effects.js + skill-passives.js |
| H2. `handleClick()` mega-function | HIGH | Open | — |
| H3. Hardcoded skill IDs | HIGH | Open | — |
| H4. innerHTML rendering | HIGH | Open | — |
| H5. Tutorial state mutation + UI import | HIGH | **RESOLVED** | Phase E — showToast → tutorial:tip event, mutations → intent events |
| L3. DEBUG tools in main.js | LOW | **RESOLVED** | Phase D — extracted to js/debug.js |
| L5. shop-ui DOM click hack | LOW | **RESOLVED** | Phase B — uses `emit('nav:navigate')` |

---

## Codebase Overview

| Category | Files | Lines | Size |
|----------|-------|-------|------|
| JS Core | 3 | 131 | 3.4K |
| JS Systems | 11 | 3,549 | 107K |
| JS UI | 10 | 3,122 | 78K |
| JS Data | 6 | 4,750 | 136K |
| JS Services | 2 | 158 | 3.9K |
| JS Main | 1 | 258 | 7.8K |
| CSS | 6 | 2,385 | 50K |
| HTML | 1 | 238 | 9.3K |
| **Total** | **40** | **~14,600** | **~395K** |

---

## Findings by Severity

### CRITICAL — Architectural violations that compound as the codebase grows

#### C1. Broken event-driven architecture — systems directly import each other

The `CLAUDE.md` and architecture docs state: *"Systems talk via EventBus, never import each other"* and *"Systems → EventBus → UI (one-way)."* This core principle is violated in at least 5 places:

| Importing Module | Imports From | What |
|---|---|---|
| `health.js:13` | `player.js` | `getComputedStats` |
| `energy.js:18` | `player.js` | `getComputedStats` |
| `progression.js:18` | `player.js` | `getComputedStats`, `invalidateStatCache` |
| `skills.js:28` | `player.js` | `invalidateStatCache` |
| `progression.js:17` | `ui/toasts.js` | `showToast` (system importing UI!) |

Meanwhile, `combat.js` and `skills.js` receive the same `getComputedStats` via dependency injection in `init()`. This inconsistency means there are two competing patterns for cross-system communication, making it unclear which to follow.

The `progression.js → toasts.js` import is the most alarming — a system module directly depending on a UI module breaks the one-way data flow entirely.

#### C2. UI modules directly call system mutations (violates "UI never modifies state")

The architecture rule is *"UI layer never modifies game state — only reads and displays."* This is violated systematically:

| UI Module | Imports | Mutation Example |
|---|---|---|
| `shop-ui.js:14` | `economy.js` | `economy.purchaseItem()`, `economy.equipItem()`, `economy.sellItem()` |
| `skills-ui.js:17` | `skills.js` | `skills.useSkill()`, `skills.unlockSkill()`, `skills.equipActiveSkill()` |
| `zones-ui.js:16` | `zones.js` | `zones.travelToZone()`, `zones.challengeBoss()` |

These UI modules are not just displaying state — they are the primary callers of game mutations. This creates tight coupling between UI and systems and makes it impossible to swap, test, or extend either layer independently.

#### C3. `main.js` contains business logic instead of pure orchestration

Lines 91–113 of `main.js` contain gold-granting logic, goldFind bonus calculation, and zone kill tracking:

```javascript
// main.js:91-113 — business logic that doesn't belong here
on('combat:monsterKilled', ({ goldReward, isBoss }) => {
  const stats = player.getComputedStats();
  const finalGold = Math.floor(goldReward * (1 + stats.goldFind));
  p.gold += finalGold;
  // ... zone kill tracking, auto-save logic
});
```

The bootstrap file should only import, initialize, and wire — not compute gold bonuses.

#### C4. `game-state.js` is an unguarded, untyped property bag

The central state object has no schema, no validation, no access control. Any module can write any property:

```javascript
// Any file can do this with zero guardrails:
state.player.gold += 999;
state.currentMonster.currentHealth = -1;
state.activeBuffs['anything'] = { whatever: true };
```

The transient skill state (`activeBuffs`, `hitModifier`, `clickModifiers`, `toggleStates`, `channelState`, `playerShield`, `passiveStates`, `lastClickTime`, `overkillCarry`) keeps growing on the state object with no structure. There are currently 10 top-level transient properties, and every new skill mechanic adds more.

Without any mutation tracking or controlled access, debugging state corruption is extremely difficult.

---

### HIGH — Significant maintainability issues

#### H1. `skills.js` is a God Object (979 lines, 7+ responsibilities)

This single file handles:

1. SP tracking and level-up SP grants
2. Skill unlock/upgrade logic
3. Active skill equip/unequip
4. Passive skill equip/unequip with lifecycle hooks
5. 15 individual `EFFECT_HANDLERS` (one per active skill)
6. 9 `PASSIVE_HANDLERS` with event subscription management
7. Cooldown tick management
8. Buff expiry and drain logic
9. Channel mechanic (start/release/cancel)
10. Toggle mechanic (momentum with stack decay)
11. Shield expiry
12. Respec logic
13. Death cleanup

Every new skill requires modifying this file. The `EFFECT_HANDLERS` and `PASSIVE_HANDLERS` maps will grow linearly. At 25 skills, it's already 979 lines. At 50 skills, it will be unmanageable.

#### H2. `handleClick()` in `combat.js` is a 150-line mega-function

Lines 97–253 contain a single function that:

- Checks aggressive phase
- Calculates flurry multi-hit
- Checks precision click modifier
- Computes passive multipliers (Click Mastery, Momentum)
- Rolls crits with Adrenaline Rush override
- Applies hit modifiers (Power Strike, Execute, Shatter) with three different code paths
- Applies Shield Breaker equipment bonus
- Calls `applyDamageToMonster` in a loop
- Consumes precision charges
- Updates 3 different statistics
- Emits the click event

This function has high cyclomatic complexity and is the single most likely place for bugs when adding new mechanics.

#### H3. Hardcoded skill IDs scattered across multiple system files

Specific skill IDs are hardcoded as string literals throughout the codebase, far outside `skills.js`:

| File | Hardcoded Skill IDs |
|---|---|
| `combat.js:125-145` | `'flurry'`, `'precision'`, `'click_mastery'`, `'momentum'`, `'adrenaline_rush'` |
| `energy.js:34,81` | `'heavy_handed'`, `'focused_mind'` |
| `player.js:69-82` | `'heavy_handed'`, `'berserker'`, `'efficient_casting'` |

Adding a new passive skill with combat effects requires modifying `combat.js`, `energy.js`, or `player.js` — not just the skills system. This defeats the purpose of having a skills system at all.

#### H4. innerHTML string-template rendering with event re-wiring

`shop-ui.js`, `skills-ui.js`, and `combat-ui.js` all build HTML via string concatenation and replace entire DOM subtrees with `innerHTML`:

```javascript
// shop-ui.js:149 — entire shop rebuilt on every render
shopContent.innerHTML = html;
// Then immediately re-wire ALL event handlers:
shopContent.querySelectorAll('[data-buy]').forEach(btn => {
  btn.addEventListener('click', () => { ... });
});
```

Every render destroys and recreates DOM nodes and event listeners:

- DOM thrashing (scroll position reset, focus loss)
- Memory churn from detached listeners on GC'd elements
- Fragile render-then-wire pattern where forgetting to call `wireInventoryHandlers()` silently breaks all interactions

#### H5. Tutorial system violates separation of concerns by directly mutating player state

`tutorial.js` directly modifies gold, HP, and energy:

```javascript
// tutorial.js:87-89
p.gold += FIRST_KILL_BONUS_GOLD;
p.totalGoldEarned += FIRST_KILL_BONUS_GOLD;

// tutorial.js:194-195
p.hp = p.maxHP;
p.energy = p.maxEnergy || MAX_ENERGY;
```

The tutorial should emit events (e.g., `tutorial:grantBonus`) and let the appropriate systems handle rewards. This would keep the tutorial system read-only and testable.

---

### MEDIUM — Code quality issues affecting maintainability

#### M1. Duplicated utility functions

- `hasType(monster, typeName)` is defined identically in `combat.js:35` and `combat-ui.js:95`
- `formatGold()` in `shop-ui.js:478` duplicates similar logic to `formatNumber()` in `utils.js:33`

#### M2. `components.css` is 1,843 lines in a single file

Every component's styles — buttons, bars, cards, badges, modals, shop, skills, zones, toasts — are in one monolithic CSS file. Finding and editing styles for a specific component requires scrolling through nearly 2,000 lines.

#### M3. Inconsistent timer units (ms vs seconds)

Timers are defined in milliseconds in constants but used in seconds in the game loop:

```javascript
// constants.js
export const MONSTER_SPAWN_DELAY = 500; // ms

// monster.js:180
spawnTimer = MONSTER_SPAWN_DELAY / 1000; // manual conversion

// combat.js:539
bossTimer.remaining -= dt * 1000; // dt is seconds, timer is ms
```

Some timers run in ms (`bossTimer.remaining`, `escapeTimer`), others in seconds (`spawnTimer`, `dyingTimer`). Every timer interaction requires a mental unit conversion.

#### M4. Event subscription leaks and never-cleared intervals

- `combat-ui.js:90`: `setInterval(renderBuffRow, 100)` — runs continuously, even when not on combat screen
- `skills-ui.js:147`: `setInterval(updateCooldowns, 100)` — same problem
- Most `on()` subscribers are never paired with `off()` calls
- No lifecycle management for subscriptions

#### M5. Renderer coordinator is dead code

`renderer.js` subscribes to 35+ events to set a `dirty` flag, but its `update(dt)` method does nothing useful:

```javascript
export function update(dt) {
  if (!dirty) return;
  dirty = false;
  // Each UI module subscribes to its own events and updates.
}
```

The dirty flag is cleared but never acted upon. Each UI module handles its own rendering via direct event subscriptions, making the renderer's tracking overhead pure waste.

#### M6. Monster instances carry unused properties for every type

`createMonsterInstance()` in `monster.js:102-130` initializes all type-specific fields on every monster:

```javascript
const monster = {
  // Every monster gets these, even normal ones:
  shield: 0, maxShield: 0, shieldDR: 0,
  escapeTimer: 0, maxEscapeTimer: 0, escapeDamage: 0,
  attackTimer: 0, attackPhase: 'safe',
  armorValue: 0, regenRate: 0, frozen: false, frozenUntil: 0
};
```

Normal monsters (the majority) carry 12 unused fields. This conflates the monster model and makes it unclear which properties are relevant for a given monster type.

#### M7. Data files are very large single exports

`monsters.data.js` (2,189 lines) and `items.data.js` (1,490 lines) put all game content in single files. Adding a new zone's monsters requires scrolling through thousands of lines.

---

### LOW — Minor issues and code hygiene

#### L1. Magic event strings with no central registry

~40+ event names are plain strings (`'combat:monsterKilled'`, `'skill:buffApplied'`, etc.). A typo in an event name is a silent failure — the event fires but nobody listens, or a subscriber waits for an event that never arrives. There's no way to discover all events in the system without grepping.

#### L2. Empty `update()` methods registered in the game loop

`player.update()`, `loot.update()`, `zones.update()`, and `progression.update()` are empty functions registered via `registerTickSystem()` and called every frame (~60 times/second). Minor CPU waste but more importantly conceptual noise.

#### L3. `main.js` debug tools are 80+ lines (lines 175–258)

The `window.DEBUG` object takes up a third of the bootstrap file. This should be in a separate `dev-tools.js` module.

#### L4. Save migration code will grow linearly

`storage.js:76-100` has inline migration chains with sequential if-blocks. Each new save version will add another block. A migration registry pattern would scale better.

#### L5. `shop-ui.js` back button uses DOM click delegation hack

```javascript
// shop-ui.js:58-60 — programmatically clicks a nav button instead of calling showScreen
document.querySelectorAll('.nav-btn').forEach(btn => {
  if (btn.dataset.screen === 'combat') btn.click();
});
```

This queries the entire DOM and simulates a click instead of using the event system or calling the navigation function directly.

#### L6. No error handling at system boundaries

While `EventBus.emit()` wraps handlers in try/catch (good), system methods called directly from UI have no error boundaries. A failed `economy.purchaseItem()` silently returns `false` but the UI has no way to distinguish "not enough gold" from "item doesn't exist" from a thrown error.

---

## Dependency Graph

### Current (Post Phase A+B+C+D+E)

```
Systems ──emit──> EventBus ──notify──> UI (reads state + emits intents)
   │                  ▲                 │
   │                  │                 │
   └──DI via init()───┘                 └──reads──> state (central store)
```

**No remaining cross-layer violations.** All 7 audit checks PASS.

### Original (Pre-refactor)

```
DOCUMENTED:   Systems ──emit──> EventBus ──notify──> UI
                                                      │
                                              (reads state only)

ACTUAL:       Systems ◄──import──► Systems  (health→player, energy→player, etc.)
                 │                    ▲
                 ├──emit──> EventBus  │
                 │              │     │
                 ▼              ▼     │
                 UI ──import──► Systems  (shop-ui→economy, skills-ui→skills)
                 ▲              │
                 │              │
                 └──import──────┘  (progression→toasts)
```

---

## Priority Recommendations

| Priority | Issue | Impact | Status |
|----------|-------|--------|--------|
| 1 | **C1+C2**: Establish consistent DI or mediator pattern for cross-system deps | Prevents dependency graph from worsening | **DONE** |
| 2 | **H1**: Extract skill effect handlers to per-skill modules or a registry | Unblocks skill content addition | **DONE** |
| 3 | **C3+H5**: Move business logic out of `main.js` and `tutorial.js` | Restores separation of concerns to core architecture | **DONE** |
| 4 | **H3**: Centralize skill ID references; make passives data-driven | Reduces shotgun surgery for new skills | Open |
| 5 | **H2**: Decompose `handleClick()` into a damage pipeline | Reduces bug surface in core combat loop | Open |
| 6 | **C4**: Add structured mutation API to game-state | Enables debugging, undo, and state validation | Open |
| 7 | **M2+M7**: Split large files | Improves navigability | Open |
| 8 | **H4**: Move from innerHTML to lightweight DOM diffing or template cloning | Fixes render fragility | Open |
| 9 | **M3**: Standardize all timers to one unit (seconds) | Eliminates conversion bugs | Open |
| 10 | **L1**: Create event name constants | Catches typo errors at definition time | Open |

---

## Summary

The codebase has a well-conceived architecture (event-driven, system-isolated, unidirectional data flow) that is documented clearly. However, the implementation has drifted from that design in several fundamental ways. The most damaging patterns are:

1. **Direct cross-system imports** that create a tangled dependency graph
2. **UI modules calling system mutations** instead of emitting intent events
3. **The skills system concentrating too much logic** in a single file with hardcoded references leaking into other systems

These three issues compound with each other: adding a new skill with combat effects currently requires changes to `skills.js` + `combat.js` + possibly `energy.js` + possibly `player.js` + `skills-ui.js`. That's 5 files for what the architecture promises should be a data-driven, single-file operation.

The good news is that the core framework (`event-bus.js`, `game-loop.js`, `game-state.js`) is clean and minimal (131 lines total). The refactoring path is clear: enforce the event-driven contract that's already documented, extract skill handlers into data-driven registries, and restore the one-way dependency flow.

# Software Architecture

> Production-grade architecture for Realms of Clickoria.
> Designed for 35 monsters (6 types), 25 skills, 96 items, 7 zones, ascension, and beyond.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                            index.html                               │
│                     (Entry Point + UI Shell)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                          main.js                             │  │
│   │          (Bootstrap, Event Wiring, Game Loop Host)           │  │
│   └──────────────────────┬───────────────────────────────────────┘  │
│                          │                                          │
│          ┌───────────────┼───────────────┐                          │
│          ▼               ▼               ▼                          │
│   ┌────────────┐  ┌────────────┐  ┌────────────────┐               │
│   │  EventBus  │  │ GameState  │  │  GameLoop      │               │
│   │ (Pub/Sub)  │  │ (Central   │  │ (rAF + delta)  │               │
│   │            │  │  Store)    │  │                │               │
│   └─────┬──────┘  └─────┬──────┘  └───────┬────────┘               │
│         │               │                 │                         │
│   ══════╪═══════════════╪═════════════════╪══════════════════════   │
│         │          SYSTEMS LAYER          │                         │
│   ══════╪═══════════════╪═════════════════╪══════════════════════   │
│         │               │                 │                         │
│   ┌─────▼───────────────▼─────────────────▼─────────────────────┐  │
│   │                    Game Systems                              │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│   │  │ Combat   │ │  Player  │ │  Skills  │ │  Progression  │  │  │
│   │  │ System   │ │  System  │ │  System  │ │  System       │  │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│   │  │ Health   │ │  Energy  │ │  Loot    │ │   Economy     │  │  │
│   │  │ System   │ │  System  │ │  System  │ │   System      │  │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│   │  │ Monster  │ │  Zone    │ │ Ascension│ │   Tutorial    │  │  │
│   │  │ System   │ │  System  │ │  System  │ │   System      │  │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │  │
│   └─────────────────────────────────────────────────────────────┘  │
│         │                                                           │
│   ══════╪════════════════════════════════════════════════════════   │
│         │              UI LAYER                                     │
│   ══════╪════════════════════════════════════════════════════════   │
│         │                                                           │
│   ┌─────▼───────────────────────────────────────────────────────┐  │
│   │                       UI Modules                             │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│   │  │ CombatUI │ │  ShopUI  │ │ SkillsUI │ │ ScreenMgr     │  │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│   │  │ Modals   │ │  Toasts  │ │  Bars    │ │  Animations   │  │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │  │
│   └─────────────────────────────────────────────────────────────┘  │
│         │                                                           │
│   ══════╪════════════════════════════════════════════════════════   │
│         │              DATA LAYER                                   │
│   ══════╪════════════════════════════════════════════════════════   │
│         │                                                           │
│   ┌─────▼───────────────────────────────────────────────────────┐  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│   │  │ zones    │ │ monsters │ │  items   │ │  skills       │  │  │
│   │  │ .data.js │ │ .data.js │ │ .data.js │ │  .data.js     │  │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │  │
│   │  ┌──────────┐ ┌──────────────────────────────────────────┐  │  │
│   │  │constants │ │  balance.js (formulas & curves)          │  │  │
│   │  │  .js     │ │                                          │  │  │
│   │  └──────────┘ └──────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                       Services                               │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │  │
│   │  │ storage  │ │  utils   │ │  save-    │                    │  │
│   │  │  .js     │ │  .js     │ │  migrate  │                    │  │
│   │  └──────────┘ └──────────┘ └──────────┘                    │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Event-Driven Communication

Systems never call each other directly. They communicate through the EventBus.

```
Combat System kills monster
    → emits "monster:killed" event
        → Loot System hears it, rolls drops
        → Progression System hears it, grants XP
        → Energy System hears it, grants bonus energy
        → Tutorial System hears it, checks first-kill
        → UI updates automatically
```

**Why:** Prevents circular dependencies, makes systems testable in isolation, and allows adding new behavior without modifying existing code.

### 2. Single Source of Truth

`GameState` is the one canonical state object. Systems read from it and write to it through controlled mutation functions. UI only reads.

### 3. Systems Own Their Domain

Each system fully owns its slice of game logic. No system reaches into another system's internals.

| System | Owns |
|--------|------|
| Combat | Click handling, damage calculation, monster type behavior |
| Player | Stat computation, level-up stat grants, derived stats |
| Skills | Skill unlock/upgrade, MP spending, cooldowns, buff application |
| Health | HP regen, damage taken, death/retreat, shield absorption |
| Energy | Energy gain/spend, regen, cooldown gating |
| Monster | Spawning, selection, instance creation, type initialization |
| Loot | Drop rolls, item granting, boss loot |
| Progression | XP grants, level-up checks, milestone detection |
| Economy | Gold flow, buy/sell, shop rotation, pricing |
| Zone | Zone travel, unlock checks, boss access |
| Ascension | Prestige reset, vault, permanent bonuses |
| Tutorial | First-time detection, tips, onboarding flow |

### 4. Unidirectional Data Flow

```
User Input (click/tap)
    │
    ▼
Game System (processes logic, mutates state)
    │
    ▼
EventBus (broadcasts what happened)
    │
    ▼
UI Layer (reads state, renders)
```

UI **never** mutates game state. It calls system functions or emits user-intent events.

### 5. Tick-Based Game Loop

Time-dependent mechanics (regen, swift timers, aggressive attack cycles, buff expiry) all run through a single `update(deltaTime)` loop, not independent `setInterval` calls.

---

## File Structure

```
clicker-02-26/
├── index.html                  # Single HTML file, minimal markup
│
├── css/
│   ├── styles.css              # Main (imports all others via @import)
│   ├── variables.css           # CSS custom properties (colors, spacing, zone themes)
│   ├── layout.css              # Page structure, screen containers
│   ├── components.css          # Buttons, bars, cards, badges
│   ├── animations.css          # All @keyframes definitions
│   └── responsive.css          # Media queries only
│
├── js/
│   ├── main.js                 # Bootstrap: init state, wire events, start loop
│   │
│   ├── core/                   # Framework-level modules
│   │   ├── event-bus.js        # Pub/sub event system
│   │   ├── game-state.js       # Central state store + controlled mutation
│   │   └── game-loop.js        # requestAnimationFrame loop with delta time
│   │
│   ├── systems/                # Game logic (one file per system)
│   │   ├── combat.js           # Click handling, damage calc, monster type behavior
│   │   ├── player.js           # Stat computation, derived stats, level-up grants
│   │   ├── monster.js          # Spawning, selection, instance creation, type init
│   │   ├── skills.js           # Unlock, upgrade, MP, cooldowns, effects, buffs
│   │   ├── health.js           # HP regen, damage taken, death, shield absorption
│   │   ├── energy.js           # Energy gain/spend, regen
│   │   ├── loot.js             # Drop rolls, item granting, boss loot
│   │   ├── progression.js      # XP, level-up, milestones
│   │   ├── economy.js          # Gold, shop rotation, buy/sell, pricing
│   │   ├── zones.js            # Zone travel, unlock, boss access
│   │   ├── ascension.js        # Prestige, vault, permanent bonuses
│   │   └── tutorial.js         # Onboarding, tips, first-time bonuses
│   │
│   ├── data/                   # Static game data (pure objects, no imports)
│   │   ├── constants.js        # All magic numbers from _INDEX.md
│   │   ├── balance.js          # Scaling formulas (XP curve, damage, HP)
│   │   ├── zones.data.js       # 7 zone definitions
│   │   ├── monsters.data.js    # 35 monster definitions
│   │   ├── items.data.js       # 96 item definitions
│   │   └── skills.data.js      # 25 skill definitions
│   │
│   ├── ui/                     # View layer (DOM only)
│   │   ├── renderer.js         # Master render coordinator
│   │   ├── screens.js          # Screen show/hide management
│   │   ├── combat-ui.js        # Monster display, damage numbers, attack phases
│   │   ├── bars-ui.js          # HP bar, energy bar, XP bar, shield bar
│   │   ├── stats-ui.js         # Stats display (attack, gold, crit)
│   │   ├── skills-ui.js        # Skill bar, cooldown timers, skill screen
│   │   ├── shop-ui.js          # Shop, inventory, vault screens
│   │   ├── zones-ui.js         # Zone selection modal
│   │   ├── modals.js           # Level-up, death, boss intro, ascension modals
│   │   ├── toasts.js           # Toast notification queue
│   │   └── animations.js       # JS-driven animations (damage floats, particles)
│   │
│   └── services/               # Utilities
│       ├── storage.js          # Save/load/export/import + migration
│       └── utils.js            # randomInt, formatGold, clamp, etc.
│
├── assets/
│   ├── images/                 # Future: sprites, icons
│   └── sounds/                 # Future: sound effects
│
├── docs/                       # Specification documents (read-only reference)
├── CLAUDE.md                   # AI context
├── GAME_DESIGN.md              # Design overview
└── README.md                   # Public readme
```

---

## Core Modules

### EventBus (`core/event-bus.js`)

The nervous system of the application. All cross-system communication flows through here.

```javascript
/**
 * event-bus.js — Lightweight pub/sub.
 *
 * Systems emit events. Other systems and UI subscribe.
 * No system imports another system — only the EventBus.
 */

const listeners = {};

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function off(event, callback) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(cb => cb !== callback);
}

export function emit(event, data) {
  if (!listeners[event]) return;
  for (const cb of listeners[event]) {
    cb(data);
  }
}
```

#### Event Catalog

Every event in the game, organized by source system:

| Event | Payload | Emitted By |
|-------|---------|------------|
| **Combat** | | |
| `combat:click` | `{ damage, isCrit, monsterHP }` | combat.js |
| `combat:monsterKilled` | `{ monster, isBoss }` | combat.js |
| `combat:monsterEscaped` | `{ monster, playerDamage }` | combat.js |
| `combat:monsterSpawned` | `{ monster }` | monster.js |
| `combat:stateChanged` | `{ from, to }` | combat.js |
| `combat:attackPhaseChanged` | `{ phase }` | combat.js |
| **Player** | | |
| `player:damaged` | `{ amount, source }` | health.js |
| `player:healed` | `{ amount, source }` | health.js |
| `player:died` | `{ goldLost, levelsLost, newLevel }` | health.js |
| `player:levelUp` | `{ newLevel, statsGained }` | progression.js |
| `player:statsChanged` | `{ stat, oldValue, newValue }` | player.js |
| **Skills** | | |
| `skill:used` | `{ skillId, level, energyCost }` | skills.js |
| `skill:unlocked` | `{ skillId, mpCost }` | skills.js |
| `skill:upgraded` | `{ skillId, newLevel }` | skills.js |
| `skill:cooldownReady` | `{ skillId }` | skills.js |
| `skill:buffApplied` | `{ buffId, duration }` | skills.js |
| `skill:buffExpired` | `{ buffId }` | skills.js |
| **Energy** | | |
| `energy:changed` | `{ current, max }` | energy.js |
| `energy:full` | `{}` | energy.js |
| `energy:insufficient` | `{ required, current }` | energy.js |
| **Economy** | | |
| `gold:changed` | `{ amount, total }` | economy.js |
| `gold:earned` | `{ amount, source }` | economy.js |
| `gold:spent` | `{ amount, item }` | economy.js |
| `shop:refreshed` | `{ items }` | economy.js |
| `item:purchased` | `{ itemId }` | economy.js |
| `item:sold` | `{ itemId, gold }` | economy.js |
| `item:equipped` | `{ itemId, slot }` | player.js |
| `item:dropped` | `{ itemId, rarity }` | loot.js |
| **Zones** | | |
| `zone:changed` | `{ from, to }` | zones.js |
| `zone:unlocked` | `{ zoneId }` | zones.js |
| `zone:bossStarted` | `{ bossId }` | zones.js |
| **Progression** | | |
| `xp:gained` | `{ amount, total }` | progression.js |
| `mastery:gained` | `{ amount, total }` | progression.js |
| **Ascension** | | |
| `ascension:completed` | `{ newLevel, bonuses }` | ascension.js |
| **Tutorial** | | |
| `tutorial:stepCompleted` | `{ step }` | tutorial.js |
| `tutorial:tipShown` | `{ tipId }` | tutorial.js |
| **Save** | | |
| `save:completed` | `{}` | storage.js |
| `save:failed` | `{ error }` | storage.js |

---

### GameState (`core/game-state.js`)

The single source of truth. Holds all mutable game data.

```javascript
/**
 * game-state.js — Central state store.
 *
 * Persistent state (saved to localStorage) lives in state.player.
 * Transient state (combat, UI) lives at top level and resets on load.
 */

export const state = {
  // === PERSISTENT (saved) ===
  player: null,               // Full player object (see player.schema.md)

  // === TRANSIENT (not saved, reset on load) ===
  currentMonster: null,       // Active monster instance
  combatState: 'idle',        // 'idle' | 'spawning' | 'active' | 'attacking' | 'dying' | 'waiting'
  activeBuffs: {},            // { buffId: { ...effect, expiresAt } }
  shopInventory: [],          // Current 3 shop items
  shopRefreshCount: 0,        // Manual refresh escalation counter
  shopLastRefresh: 0,         // Timestamp of last auto-refresh

  // UI state
  currentScreen: 'combat',    // 'combat' | 'shop' | 'skills' | 'inventory' | 'vault'
  isModalOpen: false,
  modalStack: []
};

// Controlled state access
export function getState() { return state; }
export function getPlayer() { return state.player; }
```

---

### GameLoop (`core/game-loop.js`)

Drives all time-dependent mechanics through a single loop.

```javascript
/**
 * game-loop.js — requestAnimationFrame loop.
 *
 * Calls every registered system's update(dt) function.
 * dt = seconds since last frame (typically 0.016 at 60fps).
 */

const tickSystems = [];   // Systems that need per-frame updates
let lastTimestamp = 0;
let running = false;

export function registerTickSystem(updateFn) {
  tickSystems.push(updateFn);
}

export function startLoop() {
  running = true;
  lastTimestamp = performance.now();
  requestAnimationFrame(tick);
}

export function stopLoop() {
  running = false;
}

function tick(timestamp) {
  if (!running) return;

  const dt = (timestamp - lastTimestamp) / 1000;  // Convert to seconds
  lastTimestamp = timestamp;

  // Cap delta to prevent spiral of death after tab switch
  const cappedDt = Math.min(dt, 0.1);  // Max 100ms per tick

  for (const update of tickSystems) {
    update(cappedDt);
  }

  requestAnimationFrame(tick);
}
```

**Systems that register for tick updates:**

| System | What it updates per tick |
|--------|------------------------|
| Combat | Swift escape timer, aggressive attack cycle, frozen status |
| Health | Passive HP regen |
| Energy | Passive energy regen |
| Skills | Buff expiry checks |
| Monster | Regenerating monster HP regen |
| Economy | Shop auto-refresh timer |
| Tutorial | Contextual tip timer |

---

## System Design

### System Contract

Every system follows this pattern:

```javascript
/**
 * {name}.js — {System Name}
 *
 * Owns: {what this system controls}
 * Listens to: {events it subscribes to}
 * Emits: {events it publishes}
 * Reads: GameState (never writes outside its domain)
 *
 * @see docs/systems/{name}.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { getState, getPlayer } from '../core/game-state.js';

// === INITIALIZATION ===
export function init() {
  // Subscribe to events from other systems
  // Set up initial state
}

// === TICK UPDATE (if time-dependent) ===
export function update(dt) {
  // Called every frame by game loop
}

// === PUBLIC API (called by main.js or event handlers) ===
export function doSomething() {
  // Mutate state within this system's domain
  // Emit events for what happened
}
```

---

### Combat System (`systems/combat.js`)

The core game loop handler.

**Owns:** Click handling, damage calculation, monster type behavior per tick, combat state machine.

**State Machine:**

```
                ┌──────────┐
                │   IDLE   │ ← No monster present
                └────┬─────┘
                     │ spawnMonster()
                     ▼
                ┌──────────┐
                │ SPAWNING │ ← Spawn animation playing
                └────┬─────┘
                     │ animation complete
                     ▼
          ┌──────────────────────┐
          │       ACTIVE         │ ← Player can click
          │                      │
          │  (Aggressive cycle:) │
          │  SAFE → WARNING →    │
          │  ATTACKING → SAFE    │
          └──────┬───────────────┘
                 │ monster HP ≤ 0
                 ▼
            ┌──────────┐
            │  DYING   │ ← Death animation, rewards
            └────┬─────┘
                 │ animation complete
                 ▼
            ┌──────────┐
            │ WAITING  │ ← 500ms spawn delay
            └────┬─────┘
                 │ delay elapsed
                 └──────────────► back to SPAWNING
```

**Damage Pipeline (per click):**

```
1. Base attack = getTotalAttack(player)
2. Crit roll = random() < getTotalCritChance(player)
3. Raw damage = crit ? floor(attack × critDamage) : attack
4. Apply next-attack modifier (Power Strike, etc.)
5. Apply ascension bonus: damage × (1 + ascension.damageBonus)
6. Apply monster defenses:
   a. Armored: damage = max(damage - effectiveArmor, 1)
   b. Shielded: damage routed to shield first (with 50% reduction)
7. Final damage = max(result, MIN_DAMAGE)
8. Apply to monster HP
9. Emit "combat:click" event
```

**Monster Type Tick Updates:**

| Type | Per-tick behavior |
|------|-------------------|
| Swift | Decrement escape timer → emit escape if 0 |
| Aggressive | Cycle through safe/warning/attack phases |
| Regenerating | Heal monster HP by regenPercent × maxHP × dt |
| Armored | No tick needed (flat reduction on hit) |
| Shielded | No tick needed (checked on damage) |
| Multi-type | Run all applicable type updates |

---

### Player System (`systems/player.js`)

**Owns:** Stat computation, equipment management, derived stat caching.

**Derived Stats (computed, not stored):**

```javascript
function getTotalAttack(player) {
  let attack = BASE_PLAYER_ATTACK + (player.level - 1);  // Base + level

  // Equipment
  attack += getEquipmentStat(player, 'attack');

  // Passive skills (Sharp Blades: +5% per level)
  const sharpBladesLevel = getPassiveLevel(player, 'skill_sharp_blades');
  attack = Math.floor(attack * (1 + sharpBladesLevel * 0.05));

  // Active buffs (Berserk Rage)
  if (player.buffs.berserkRage) {
    attack = Math.floor(attack * player.buffs.berserkRage.damageMultiplier);
  }

  // Ascension bonus
  attack = Math.floor(attack * (1 + player.ascension.damageBonus));

  return attack;
}
```

**Stat Cache Pattern:**

To avoid recalculating derived stats every click, cache them and invalidate on change:

```javascript
let statCache = null;
let cacheValid = false;

export function invalidateStatCache() {
  cacheValid = false;
}

export function getComputedStats() {
  if (cacheValid && statCache) return statCache;

  statCache = {
    attack: computeTotalAttack(),
    critChance: computeTotalCritChance(),
    critDamage: computeTotalCritDamage(),
    goldFind: computeTotalGoldFind(),
    xpBonus: computeTotalXPBonus(),
    maxHP: computeMaxHP(),
    damageReduction: computeDamageReduction(),
    armorPen: computeArmorPen()
  };
  cacheValid = true;
  return statCache;
}

// Invalidate on: equip/unequip, skill change, buff apply/expire, level up, ascension
on('item:equipped', invalidateStatCache);
on('skill:unlocked', invalidateStatCache);
on('skill:upgraded', invalidateStatCache);
on('skill:buffApplied', invalidateStatCache);
on('skill:buffExpired', invalidateStatCache);
on('player:levelUp', invalidateStatCache);
```

---

### Monster System (`systems/monster.js`)

**Owns:** Monster selection, instance creation, multi-type initialization.

**Monster Instance Factory:**

```javascript
function createMonsterInstance(definition, zone) {
  // Roll actual level within zone range
  const level = randomInt(definition.levelMin, definition.levelMax);

  // Calculate scaled stats
  const levelDelta = level - definition.levelMin;
  const hp = definition.baseHealth + (definition.healthPerLevel * levelDelta);

  const instance = {
    definitionId: definition.id,
    name: definition.name,
    emoji: definition.emoji,
    type: definition.type,         // "normal" | "swift" | "aggressive+armored" etc.
    level,
    maxHealth: hp,
    currentHealth: hp,
    isBoss: definition.isBoss || false,
    mechanics: { ...definition.mechanics },

    // Type-specific runtime state (initialized below)
    shield: 0,
    maxShield: 0,
    escapeTimer: 0,
    attackTimer: 0,
    attackPhase: 'safe',
    frozen: false,
    frozenUntil: 0
  };

  // Initialize each type in a multi-type monster
  const types = instance.type.split('+');
  for (const t of types) {
    initMonsterType(instance, t);
  }

  return instance;
}

function initMonsterType(monster, type) {
  switch (type) {
    case 'swift':
      monster.escapeTimer = monster.mechanics.escapeTime / 1000; // store as seconds
      break;
    case 'shielded':
      monster.shield = Math.floor(monster.maxHealth * monster.mechanics.shieldPercent);
      monster.maxShield = monster.shield;
      break;
    case 'aggressive':
      monster.attackTimer = 0;
      monster.attackPhase = 'safe';
      break;
    // armored, regenerating, normal: no runtime init needed
  }
}
```

---

### Skills System (`systems/skills.js`)

**Owns:** Unlock, upgrade, MP spending, cooldown tracking, effect application, buff management.

**Skill Effect Dispatch:**

Each skill has an `effectType` that maps to a handler. This avoids a massive switch and keeps effects extensible:

```javascript
const EFFECT_HANDLERS = {
  nextAttackMultiplier: applyNextAttackMultiplier,
  buff: applyBuff,
  instantHeal: applyInstantHeal,
  monsterFreeze: applyMonsterFreeze,
  percentDamage: applyPercentDamage,
  shieldBreak: applyShieldBreak,
  playerShield: applyPlayerShield,
  perfectStrike: applyPerfectStrike,
  invulnerable: applyInvulnerable
};

function activateSkill(skillId) {
  const skill = getSkillData(skillId);
  const handler = EFFECT_HANDLERS[skill.effectType];
  if (handler) {
    handler(skill, getPlayerSkillLevel(skillId));
  }
}
```

**Buff Tick (called from game loop):**

```javascript
function updateBuffs(dt) {
  const now = Date.now();
  const player = getPlayer();

  for (const [buffId, buff] of Object.entries(player.buffs)) {
    if (buff.expiresAt && buff.expiresAt <= now) {
      delete player.buffs[buffId];
      emit('skill:buffExpired', { buffId });
    }
  }
}
```

---

## Data Flow Examples

### Click Attack (Full Flow)

```
1. User taps monster area
   │
   ├─► main.js: click event listener fires
   │
   ├─► combat.js: handleClick()
   │   ├── Check combatState === 'active'
   │   ├── Check aggressive attack phase (if attacking → damage player, return)
   │   ├── player.js: getComputedStats() → { attack, critChance, critDamage }
   │   ├── Roll crit, calculate raw damage
   │   ├── Apply monster defenses (armor/shield)
   │   ├── Mutate: currentMonster.currentHealth -= finalDamage
   │   ├── emit('combat:click', { damage, isCrit, monsterHP })
   │   │
   │   └── If monster HP ≤ 0:
   │       ├── Set combatState = 'dying'
   │       ├── emit('combat:monsterKilled', { monster, isBoss })
   │       └── Schedule next spawn after delay
   │
   ├─► energy.js: on('combat:click') → grant energy (with cooldown)
   │   └── emit('energy:changed', { current, max })
   │
   ├─► [on monster kill]:
   │   ├── loot.js: on('combat:monsterKilled') → roll drops
   │   │   └── emit('item:dropped', { itemId, rarity }) for each drop
   │   │
   │   ├── progression.js: on('combat:monsterKilled') → grant XP
   │   │   ├── emit('xp:gained', { amount })
   │   │   └── If level up: emit('player:levelUp', { newLevel })
   │   │
   │   ├── economy.js: on('combat:monsterKilled') → grant gold
   │   │   └── emit('gold:earned', { amount })
   │   │
   │   ├── energy.js: on('combat:monsterKilled') → grant bonus energy
   │   │
   │   └── tutorial.js: on('combat:monsterKilled') → check first-kill
   │
   └─► UI Layer: listens to all events above, updates DOM
       ├── combat-ui.js: on('combat:click') → show damage number
       ├── bars-ui.js: on('energy:changed') → update energy bar
       ├── stats-ui.js: on('gold:earned') → animate gold counter
       └── modals.js: on('player:levelUp') → show celebration
```

### Shop Purchase (Full Flow)

```
1. User taps "BUY" on item
   │
   ├─► shop-ui.js: emits user intent → calls economy.purchaseItem(itemId)
   │
   ├─► economy.js: purchaseItem(itemId)
   │   ├── Validate: player.level >= item.requiredLevel
   │   ├── Validate: player.gold >= item.buyPrice
   │   ├── Mutate: player.gold -= item.buyPrice
   │   ├── Mutate: player.inventory.push(itemId)
   │   ├── emit('gold:spent', { amount, item })
   │   ├── emit('item:purchased', { itemId })
   │   └── return { success: true }
   │
   ├─► tutorial.js: on('item:purchased') → check first-buy
   │
   └─► UI Layer:
       ├── shop-ui.js: on('item:purchased') → update shop display
       ├── stats-ui.js: on('gold:spent') → update gold counter
       └── toasts.js: on('item:purchased') → show success toast
```

---

## Module Dependency Rules

### Allowed Imports

```
main.js           → ALL modules (orchestrator, wires everything)

core/event-bus.js → nothing (leaf module)
core/game-state.js→ nothing (leaf module)
core/game-loop.js → nothing (leaf module)

systems/*.js      → core/event-bus.js   (emit & subscribe)
                  → core/game-state.js  (read/write state)
                  → data/*.js           (read static definitions)
                  → services/utils.js   (helpers)

ui/*.js           → core/event-bus.js   (subscribe only)
                  → core/game-state.js  (READ only, never write)
                  → data/*.js           (read for display)
                  → services/utils.js   (formatting helpers)

data/*.js         → nothing (pure data, zero imports)

services/*.js     → core/game-state.js  (storage needs state)
                  → data/constants.js   (save version, keys)
```

### Forbidden

```
✗ systems/*.js → systems/*.js    (systems never import each other)
✗ systems/*.js → ui/*.js         (logic doesn't know about DOM)
✗ ui/*.js → systems/*.js         (UI doesn't call system functions directly*)
✗ data/*.js → anything           (data is pure)
✗ Any circular dependency        (A → B → A)
```

*Exception: UI calls system functions passed via main.js event wiring (e.g., click handler calls `combat.handleClick()`). These are set up in main.js, not imported directly by UI.

---

## State Management

### What Gets Saved

Only `state.player` is serialized to localStorage. Everything else is transient.

```javascript
// Saved (persistent across sessions)
state.player = {
  // Identity & progress
  name, level, xp, xpToNextLevel, gold,

  // Resources
  hp, maxHP, energy,

  // Equipment & inventory
  equipment: { weapon, armor, accessory },
  inventory: [],

  // Skills
  masteryPoints, masterySpent,
  unlockedSkills: [],
  skills: {},
  equippedActiveSkills: [4 slots],
  equippedPassiveSkills: [3 slots],

  // Progression
  currentZone, unlockedZones: [], bossesDefeated: [],

  // Ascension
  ascension: { level, damageBonus, goldBonus, xpBonus, flatHP },
  vault: [],

  // Tutorial
  tutorial: { completed: {}, tipsShown, tutorialEnabled },

  // Statistics
  statistics: { totalClicks, totalKills, totalGoldEarned, ... },

  // Meta
  saveVersion, lastSavedAt, totalPlayTime
};
```

### What's NOT Saved (Transient)

```javascript
// Reset on every load
state.currentMonster = null;
state.combatState = 'idle';
state.activeBuffs = {};
state.shopInventory = [];
state.currentScreen = 'combat';
```

### Save Triggers

| Event | Auto-save? |
|-------|------------|
| Level up | Yes |
| Boss kill | Yes |
| Zone change | Yes |
| Item equip/buy/sell | Yes |
| Skill unlock/upgrade | Yes |
| Every 30 seconds | Yes |
| `beforeunload` | Yes |

---

## Initialization Sequence

```javascript
// main.js — Bootstrap sequence

import { state } from './core/game-state.js';
import { on, emit } from './core/event-bus.js';
import { registerTickSystem, startLoop } from './core/game-loop.js';
import { loadGame, setupAutoSave } from './services/storage.js';

// 1. Import all systems
import * as combat from './systems/combat.js';
import * as player from './systems/player.js';
import * as monster from './systems/monster.js';
import * as skills from './systems/skills.js';
import * as health from './systems/health.js';
import * as energy from './systems/energy.js';
import * as loot from './systems/loot.js';
import * as progression from './systems/progression.js';
import * as economy from './systems/economy.js';
import * as zones from './systems/zones.js';
import * as ascension from './systems/ascension.js';
import * as tutorial from './systems/tutorial.js';

// 2. Import all UI modules
import * as renderer from './ui/renderer.js';

// 3. Load or create game state
const savedData = loadGame();
if (savedData) {
  state.player = savedData;
} else {
  state.player = player.createNewPlayer();
}

// 4. Initialize all systems (subscribe to events)
combat.init();
player.init();
monster.init();
skills.init();
health.init();
energy.init();
loot.init();
progression.init();
economy.init();
zones.init();
ascension.init();
tutorial.init();

// 5. Initialize UI
renderer.init();

// 6. Register tick systems
registerTickSystem(combat.update);
registerTickSystem(health.update);
registerTickSystem(energy.update);
registerTickSystem(skills.update);
registerTickSystem(monster.update);
registerTickSystem(economy.update);
registerTickSystem(tutorial.update);
registerTickSystem(renderer.update);  // UI render pass

// 7. Wire DOM events → system calls
document.getElementById('combat-area')
  .addEventListener('click', combat.handleClick);

// 8. Start
setupAutoSave();
startLoop();
monster.spawnNext();  // First monster
```

---

## Performance Guidelines

### DOM Access

```javascript
// Cache all DOM references at init time
const DOM = {
  monsterHP: document.getElementById('monster-hp-fill'),
  playerHP: document.getElementById('player-hp-fill'),
  goldDisplay: document.getElementById('gold-display'),
  // ... all elements
};

// Never query DOM in hot paths (click handler, game loop)
```

### Batched Rendering

UI updates are batched into a single `requestAnimationFrame` pass via `renderer.update()`:

```javascript
// renderer.js
let dirty = false;

export function markDirty() { dirty = true; }

export function update(dt) {
  if (!dirty) return;
  dirty = false;

  // One pass: read state, write DOM
  updateMonsterDisplay();
  updatePlayerBars();
  updateStatsDisplay();
  updateSkillCooldowns(dt);
}

// Systems mark dirty when state changes
on('combat:click', markDirty);
on('gold:earned', markDirty);
on('energy:changed', markDirty);
// etc.
```

### Event Delegation

```javascript
// Single listener on skill bar, not per-button
document.getElementById('skill-bar').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-skill-slot]');
  if (btn) {
    skills.activateSlot(parseInt(btn.dataset.skillSlot));
  }
});
```

### Throttle Click Energy

Energy gain from clicks has a 200ms internal cooldown to prevent macro exploitation. This is handled in `energy.js`, not with DOM event throttling (damage always applies).

---

## Error Handling

### Strategy

| Layer | Approach |
|-------|----------|
| Data loading | Validate + fallback to defaults |
| Save/load | Try/catch + user notification |
| Combat math | `Math.max(result, MIN_DAMAGE)` — never NaN or negative |
| Event handlers | Individual try/catch per listener (one failure doesn't break others) |
| DOM updates | Null-check cached elements |

### Save Error Recovery

```javascript
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    if (data.saveVersion !== CURRENT_SAVE_VERSION) {
      return migrateData(data);
    }

    if (!validateSaveData(data)) {
      console.error('Invalid save data — starting fresh');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Load failed:', error);
    return null;
  }
}
```

---

## Debug Tooling

For development only. Gated behind a flag or removed in production.

```javascript
// Exposed on window for console access
window.DEBUG = {
  giveGold: (n) => { getPlayer().gold += n; emit('gold:earned', { amount: n }); },
  giveXP: (n) => progression.grantXP(n),
  setLevel: (n) => { /* reset XP, recalc stats */ },
  giveMP: (n) => { getPlayer().masteryPoints += n; },
  unlockAllZones: () => { /* push all zone IDs */ },
  killMonster: () => combat.forceKill(),
  spawnBoss: (zoneId) => monster.spawnBoss(zoneId),
  logState: () => console.log(JSON.parse(JSON.stringify(state))),
  listEvents: () => console.log(Object.keys(listeners))
};
```

---

## Future Extensibility

### Adding a New System

1. Create `systems/new-system.js` following the system contract
2. Subscribe to relevant events in `init()`
3. Register for tick updates if time-dependent
4. Wire up in `main.js`
5. Add UI module if it needs a screen

### Adding a New Monster Type

1. Add type definition in `data/monsters.data.js`
2. Add `initMonsterType` case in `monster.js`
3. Add tick update case in `combat.js`
4. Add damage handling case in `combat.js`
5. Add visual indicator in `combat-ui.js`

### Adding a New Skill

1. Add skill definition in `data/skills.data.js`
2. Add effect handler in `skills.js` EFFECT_HANDLERS map
3. Add UI in `skills-ui.js` (auto-generated from data)

### Adding a New Zone

1. Add zone + monsters + items in respective data files
2. Update previous boss unlock condition
3. Add theme CSS variables

No system code changes needed — data-driven design.

---

## Testing Strategy

### Manual Testing Checklist

```
Core Loop:
- [ ] Click deals correct damage (base + equipment + skills)
- [ ] Crit chance and multiplier are correct
- [ ] All 6 monster types behave correctly
- [ ] Multi-type monsters combine mechanics
- [ ] Monster death triggers rewards
- [ ] New monster spawns after delay

Resources:
- [ ] Energy gains from clicks (with cooldown)
- [ ] Energy gains from kills (15 normal, 50 boss)
- [ ] HP regen ticks correctly
- [ ] Skills cost correct energy
- [ ] Skills respect cooldowns

Progression:
- [ ] XP grants and level-up work
- [ ] Level-up grants stats and full heal
- [ ] Mastery points awarded at milestones
- [ ] Boss kill unlocks next zone
- [ ] Zone travel works

Economy:
- [ ] Shop shows 3 items, rotates every 10min
- [ ] Buy/sell at correct prices
- [ ] Manual refresh escalation works
- [ ] Legendary never appears in shop

Skills:
- [ ] Unlock costs correct MP
- [ ] Upgrade costs scale correctly
- [ ] All 25 skill effects work
- [ ] Buff timers expire correctly
- [ ] Skill swap works (outside combat only)

Persistence:
- [ ] Auto-save every 30s
- [ ] Save on level-up, boss kill, zone change
- [ ] Load restores full state
- [ ] Export/import works
- [ ] Save migration handles version differences

Death:
- [ ] Death resets to milestone level
- [ ] Death loses 50% gold
- [ ] First death has no gold penalty
- [ ] Undying prevents death once

Ascension:
- [ ] Requires level 100 + final boss
- [ ] Vault selection works (max 8 items)
- [ ] Full reset (level, gold, skills, zones)
- [ ] Permanent bonuses apply
- [ ] Starting MP bonus applies
```

### Console Debug Commands

```javascript
// Quick test any system
DEBUG.giveGold(99999);
DEBUG.giveXP(100000);
DEBUG.giveMP(50);
DEBUG.setLevel(100);
DEBUG.spawnBoss('whisperwood');
DEBUG.killMonster();
```

---

*This architecture supports the full scope of Realms of Clickoria while maintaining clean separation of concerns. Systems communicate through events, state is centralized, and the UI is a pure reflection of state.*

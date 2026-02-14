# CLAUDE.md - Project Context

## Project Overview

**Realms of Clickoria** - A mobile-first browser clicker/idle RPG inspired by classic MMO grinding experiences. Built with vanilla web technologies for simplicity and portability.

**Status:** Design complete, ready for implementation.

---

## Tech Stack

| Technology | Purpose | Notes |
|------------|---------|-------|
| HTML5 | Markup | Semantic elements, mobile viewport |
| CSS3 | Styling | Flexbox/Grid, animations, CSS variables |
| JavaScript ES6+ | Logic | Modules, classes, no frameworks |
| localStorage | Persistence | Save/load game state |
| GitHub Pages | Hosting | Free, auto-deploys from main |

---

## Documentation Structure

All game specifications are in the `docs/` folder:

```
docs/
├── _INDEX.md                    # MASTER REFERENCE - Start here!
│
├── architecture/                # How to build
│   ├── architecture.md          # System design, module structure
│   └── coding-standards.md      # Code conventions to follow
│
├── schemas/                     # Data contracts
│   ├── player.schema.md         # Player state (HP, Energy, skills, etc.)
│   ├── monster.schema.md        # Monster definitions
│   ├── item.schema.md           # Equipment system
│   ├── zone.schema.md           # World structure
│   └── skill.schema.md          # Skill system
│
├── systems/                     # Game logic
│   ├── combat.system.md         # Combat, monster types (6 types), damage
│   ├── skill.system.md          # Skills, slots, unlocks, upgrades
│   ├── energy.system.md         # Energy resource system
│   ├── health.system.md         # Player HP, damage, healing, death
│   ├── loot.system.md           # Drops & rewards
│   ├── progression.system.md    # XP & leveling
│   ├── economy.system.md        # Gold flow & pricing
│   ├── tutorial.system.md       # Onboarding, tips, first-time bonuses
│   ├── ascension.system.md      # Prestige system (post-100)
│   └── ui.system.md             # Screens, navigation, feedback
│
├── data/                        # Actual content
│   ├── zones.data.md            # 7 zones with themes
│   ├── monsters.data.md         # 35 monsters with types and stats
│   ├── items.data.md            # Weapons, accessories, new stats
│   └── skills.data.md           # 22 skills (active + passive)
│
└── balance/
    └── curves.balance.md        # XP tables, scaling formulas
```

---

## Project Structure (Implementation)

```
clicker-02-26/
├── index.html                  # Single entry point
│
├── css/
│   ├── styles.css              # Main (imports all via @import)
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
│   │   ├── event-bus.js        # Pub/sub event system (system communication)
│   │   ├── game-state.js       # Central state store + controlled mutation
│   │   └── game-loop.js        # requestAnimationFrame loop with delta time
│   │
│   ├── systems/                # Game logic (one file per system, event-driven)
│   │   ├── combat.js           # Click handling, damage calc, monster type behavior
│   │   ├── player.js           # Stat computation, derived stats, equipment
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
│   ├── ui/                     # View layer (DOM only, reads state, never writes)
│   │   ├── renderer.js         # Master render coordinator (batched updates)
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
├── docs/                       # Specifications (READ FIRST!)
├── CLAUDE.md                   # This file
├── GAME_DESIGN.md              # High-level vision
└── README.md                   # Public readme
```

---

## Development Workflow

### Local Testing
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Then open: http://localhost:8000
```

### GitHub Pages
1. Push to main branch
2. Settings → Pages → Source: main branch
3. Access at: `https://[username].github.io/clicker-02-26`

---

## Coding Standards Summary

**Full standards:** `docs/architecture/coding-standards.md`

### Quick Rules

```javascript
// Variables: const > let, never var
const MAX_LEVEL = 100;
let currentHealth = 50;

// Naming: camelCase for vars, UPPER_SNAKE for constants
const playerName = "Hero";
const BASE_ATTACK = 5;

// Functions: regular for named, arrow for callbacks
function calculateDamage() { }
const doubled = arr.map(n => n * 2);

// Modules: ES6 import/export only
import { getPlayer } from './player.js';
export function giveGold(amount) { }
```

### Architecture Rules

1. **Event-driven communication** - Systems talk via EventBus, never import each other. Cross-system access uses dependency injection via `init(deps)` (e.g., `health.init({ getComputedStats: player.getComputedStats })`)
2. **UI emits intent events, never calls system functions** - UI triggers actions via `emit('shop:requestPurchase', { itemId })` style events. Systems listen for intents and emit result events.
3. **UI reads from state, never imports systems** - Transient data (shop items, computed stats) is exposed on the central `state` object. UI reads `state.computedStats`, `state.shopItems`, etc.
4. **Game state is the single source of truth** - Central GameState store
5. **No circular dependencies** - Systems → EventBus → UI (one-way for data). UI → EventBus → Systems (one-way for intents).
6. **DOM is touched only in ui/ folder** - Separation of concerns
7. **Tick-based game loop** - All time-dependent mechanics via single rAF loop
8. **Systems own their domain** - 12 isolated systems (combat, player, skills, etc.)

---

## Key Design Decisions

### Why Vanilla JS?
- No build step = simpler mobile development
- GitHub Pages serves directly
- Easier to understand and modify
- Perfect for this scope

### Why Mobile-First?
- Primary target: phone browsers
- Touch-optimized: 44px min tap targets
- Progressive enhancement for desktop

### Why Single Currency (Gold)?
- Simpler economy to balance
- No confusion about what to spend
- Skills, items all use gold

---

## Common Tasks

### Add New Monster
1. Define in `docs/data/monsters.data.md` following schema
2. Add to `js/data/monsters.data.js`
3. Add to zone's monster list in `js/data/zones.data.js`
4. Verify balance with `docs/balance/curves.balance.md`

### Add New Monster Type
1. Add type definition in `js/data/monsters.data.js`
2. Add `initMonsterType` case in `js/systems/monster.js`
3. Add tick update case in `js/systems/combat.js`
4. Add damage handling case in `js/systems/combat.js`
5. Add visual indicator in `js/ui/combat-ui.js`

### Add New Item
1. Define in `docs/data/items.data.md` following schema
2. Add to `js/data/items.data.js`
3. Add to zone's shop in `js/data/zones.data.js`
4. Check pricing against economy doc

### Add New Skill
1. Define in `docs/data/skills.data.md` following schema
2. Add to `js/data/skills.data.js`
3. Add effect handler in `js/systems/skills.js` EFFECT_HANDLERS map
4. UI auto-generates from skill data (no manual UI changes needed)

### Add New Zone
1. Define in `docs/data/zones.data.md` following schema
2. Add zone + monsters + items in respective data files
3. Update previous zone's boss unlock condition
4. Add theme colors to CSS variables

### Add New System
1. Create `js/systems/new-system.js` following the system contract
2. Subscribe to relevant events in `init()`
3. Register for tick updates if time-dependent
4. Wire up in `js/main.js`
5. Add UI module if it needs a screen

---

## Implementation Priority (MVP)

### Must Have (v1.0)
- [x] Specifications complete
- [ ] Click combat loop
- [ ] Monster spawning & death (with 6 types)
- [ ] Gold & XP rewards
- [ ] Player leveling
- [ ] Player HP and Energy system
- [ ] Skill system (4 active + 3 passive slots)
- [ ] All 7 zones with bosses
- [ ] Shop (weapons, accessories, consumables)
- [ ] Save/Load system
- [ ] Tutorial system
- [ ] Mobile-responsive UI

### Nice to Have (v1.1)
- [ ] Equipment drops from monsters
- [ ] Sound effects
- [ ] Advanced monster AI patterns

### Future (v2.0)
- [ ] Ascension/Prestige system
- [ ] Achievements
- [ ] Offline progress
- [ ] PWA support

---

## Quick Reference

### Global Constants (from _INDEX.md)
```javascript
// Game
GAME_NAME = "Realms of Clickoria"
MAX_PLAYER_LEVEL = 100

// Combat
BASE_PLAYER_ATTACK = 5
BASE_CRIT_CHANCE = 0.05
BASE_CRIT_MULTIPLIER = 2.0

// Health
BASE_PLAYER_HP = 100
HP_PER_LEVEL = 10

// Energy
MAX_ENERGY = 100
ENERGY_PER_CLICK = 5
ENERGY_ON_KILL = 15

// Skills
ACTIVE_SKILL_SLOTS = 4
PASSIVE_SKILL_SLOTS = 3

// Timing
AUTO_SAVE_INTERVAL = 30000  // 30 seconds
MONSTER_SPAWN_DELAY = 500   // 0.5 seconds
```

### Monster Types
| Type | Mechanic |
|------|----------|
| Normal | Standard HP |
| Swift | Escape timer, damages player on escape |
| Aggressive | Attack cycle, damages player if clicked during attack |
| Regenerating | Regenerates HP over time |
| Armored | Flat damage reduction |
| Shielded | Shield bar + damage reduction |

### XP Formula
```javascript
xpToNextLevel = floor(100 * 1.12^(level-1))
```

### Damage Formula
```javascript
damage = isCrit ? floor(attack * critDamage) : attack
```

### HP Formula
```javascript
maxHP = 100 + (level - 1) * 10 + bonuses
```

---

## Before You Code

1. **Check `docs/ROADMAP.md`** for the current phase and what to build next
2. **Read the relevant spec** in `docs/`
3. **Check _INDEX.md** for global constants
4. **Follow coding-standards.md** for style
5. **Match architecture.md** for module structure
6. **Test on mobile** (primary target)

---

*All design work is complete. Implementation is "just typing."*

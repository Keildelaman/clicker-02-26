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
├── index.html              # Single entry point
│
├── css/
│   ├── styles.css          # Main (imports others)
│   ├── variables.css       # CSS custom properties
│   ├── components.css      # Reusable styles
│   ├── animations.css      # @keyframes
│   └── responsive.css      # Media queries
│
├── js/
│   ├── main.js             # Bootstrap & game loop
│   │
│   ├── core/               # Game logic modules
│   │   ├── game.js         # State & main loop
│   │   ├── player.js       # Player mutations
│   │   ├── combat.js       # Combat logic
│   │   ├── monsters.js     # Monster management
│   │   ├── items.js        # Equipment logic
│   │   ├── zones.js        # Zone management
│   │   ├── skills.js       # Skill system
│   │   └── shop.js         # Purchase logic
│   │
│   ├── data/               # Static data (from docs)
│   │   ├── zones.data.js
│   │   ├── monsters.data.js
│   │   ├── items.data.js
│   │   └── skills.data.js
│   │
│   ├── ui/                 # View layer
│   │   ├── ui.js           # Main UI controller
│   │   ├── screens.js      # Screen management
│   │   ├── combat-ui.js    # Combat rendering
│   │   ├── shop-ui.js      # Shop interface
│   │   ├── skills-ui.js    # Skills interface
│   │   ├── modals.js       # Modal dialogs
│   │   └── notifications.js# Toast system
│   │
│   ├── services/           # Utilities
│   │   ├── storage.js      # Save/load
│   │   └── utils.js        # Helpers
│   │
│   └── config/
│       └── constants.js    # All magic numbers
│
├── assets/                 # Future: images, sounds
├── docs/                   # Specifications (READ FIRST!)
├── CLAUDE.md               # This file
├── GAME_DESIGN.md          # High-level vision
└── README.md               # Public readme
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

1. **UI layer never modifies game state** - Only reads and displays
2. **Game state is the single source of truth** - Player object
3. **No circular dependencies** - One-way data flow
4. **DOM is touched only in ui/ folder** - Separation of concerns

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

### Add New Item
1. Define in `docs/data/items.data.md` following schema
2. Add to `js/data/items.data.js`
3. Add to zone's shop in `js/data/zones.data.js`
4. Check pricing against economy doc

### Add New Skill
1. Define in `docs/data/skills.data.md` following schema
2. Add to `js/data/skills.data.js`
3. Add effect handler in `js/core/skills.js`
4. Add UI button in `js/ui/skills-ui.js`

### Add New Zone
1. Define in `docs/data/zones.data.md` following schema
2. Add monsters, items, boss
3. Update previous zone's boss unlock condition
4. Add theme colors to CSS variables

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

1. **Read the relevant spec** in `docs/`
2. **Check _INDEX.md** for global constants
3. **Follow coding-standards.md** for style
4. **Match architecture.md** for module structure
5. **Test on mobile** (primary target)

---

*All design work is complete. Implementation is "just typing."*

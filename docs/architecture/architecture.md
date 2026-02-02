# Software Architecture

> Defines how the codebase is structured, how modules communicate, and how to maintain clean code.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│                    (Entry Point + UI Shell)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                        main.js                               ││
│  │              (Bootstrap + Game Loop + Events)                ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│              ┌───────────────┼───────────────┐                   │
│              ▼               ▼               ▼                   │
│  ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐        │
│  │    game.js      │ │   ui.js     │ │  storage.js     │        │
│  │ (Game State)    │ │ (DOM/View)  │ │ (Persistence)   │        │
│  └────────┬────────┘ └──────┬──────┘ └─────────────────┘        │
│           │                 │                                    │
│           ▼                 │                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     Core Modules                             ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        ││
│  │  │ player.js│ │combat.js │ │monsters.js│ │ items.js │        ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        ││
│  │  ┌──────────┐ ┌──────────┐                                   ││
│  │  │ zones.js │ │skills.js │                                   ││
│  │  └──────────┘ └──────────┘                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Data Layer                              ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        ││
│  │  │ config.js│ │ data/*.js│ │constants │ │ utils.js │        ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Separation of Concerns
- **Data Layer**: Pure data definitions (zones, monsters, items, skills)
- **Logic Layer**: Game mechanics (combat, progression, economy)
- **State Layer**: Current game state (player object)
- **View Layer**: DOM manipulation (ui.js only touches DOM)

### 2. Unidirectional Data Flow
```
User Action → Game Logic → State Update → UI Update
     │                          │              │
     └──────────────────────────┴──────────────┘
              (No reverse flow)
```

### 3. Single Source of Truth
- `player` object is THE state
- All modules read from it, only designated functions modify it
- UI reflects state, never stores independent state

### 4. Module Independence
- Modules should be testable in isolation
- Circular dependencies are forbidden
- Each module has a single responsibility

---

## File Structure (Detailed)

```
clicker-02-26/
├── index.html              # Single HTML file, minimal markup
│
├── css/
│   ├── styles.css          # Main styles (imports others)
│   ├── variables.css       # CSS custom properties (colors, sizes)
│   ├── components.css      # Reusable component styles
│   ├── animations.css      # All @keyframes definitions
│   └── responsive.css      # Media queries only
│
├── js/
│   ├── main.js             # Entry point - imports & bootstraps
│   │
│   ├── core/               # Core game modules
│   │   ├── game.js         # Game state & main loop
│   │   ├── player.js       # Player object manipulation
│   │   ├── combat.js       # Click handling, damage, death
│   │   ├── monsters.js     # Monster instance management
│   │   ├── items.js        # Equipment logic
│   │   ├── zones.js        # Zone management
│   │   ├── skills.js       # Skill activation & effects
│   │   └── shop.js         # Purchase logic
│   │
│   ├── data/               # Static game data (from docs)
│   │   ├── zones.data.js   # Zone definitions
│   │   ├── monsters.data.js# Monster definitions
│   │   ├── items.data.js   # Item definitions
│   │   └── skills.data.js  # Skill definitions
│   │
│   ├── ui/                 # UI layer
│   │   ├── ui.js           # Main UI controller
│   │   ├── screens.js      # Screen management
│   │   ├── combat-ui.js    # Combat area rendering
│   │   ├── stats-ui.js     # Stats bar rendering
│   │   ├── shop-ui.js      # Shop interface
│   │   ├── skills-ui.js    # Skills interface
│   │   ├── modals.js       # Modal dialogs
│   │   └── notifications.js# Toast notifications
│   │
│   ├── services/           # Utilities & services
│   │   ├── storage.js      # Save/load/export/import
│   │   ├── events.js       # Event bus (optional)
│   │   └── utils.js        # Helper functions
│   │
│   └── config/             # Configuration
│       └── constants.js    # All magic numbers from _INDEX.md
│
├── assets/
│   ├── images/             # Future: sprites, icons
│   └── sounds/             # Future: sound effects
│
├── docs/                   # Specification documents
│   ├── _INDEX.md
│   ├── architecture/
│   ├── schemas/
│   ├── systems/
│   ├── data/
│   └── balance/
│
├── CLAUDE.md               # AI context
├── GAME_DESIGN.md          # Design overview
└── README.md               # Public readme
```

---

## Module Responsibilities

### main.js - Bootstrap
```javascript
// Responsibilities:
// 1. Import all modules
// 2. Initialize game state (new or loaded)
// 3. Start game loop
// 4. Set up event listeners

import { initGame, gameLoop } from './core/game.js';
import { loadGame } from './services/storage.js';
import { initUI, bindEvents } from './ui/ui.js';

async function bootstrap() {
  const savedGame = loadGame();
  initGame(savedGame);
  initUI();
  bindEvents();
  requestAnimationFrame(gameLoop);
}

bootstrap();
```

### game.js - State & Loop
```javascript
// Responsibilities:
// 1. Hold game state (player, currentMonster, combatState)
// 2. Run game loop (auto-attack, buffs, timers)
// 3. Coordinate between modules
// 4. Never touch DOM directly

// Exports:
export const state = {
  player: null,
  currentMonster: null,
  combatState: 'idle'
};

export function initGame(savedData) { }
export function gameLoop(timestamp) { }
export function getPlayer() { return state.player; }
```

### player.js - Player Mutations
```javascript
// Responsibilities:
// 1. Create new player
// 2. Modify player state (give gold, give XP, equip items)
// 3. Calculate derived stats
// 4. Validate player state

// Exports:
export function createNewPlayer() { }
export function giveGold(amount) { }
export function giveXP(amount) { }
export function equipItem(itemId) { }
export function getTotalAttack() { }
export function getTotalCritChance() { }
```

### combat.js - Combat Logic
```javascript
// Responsibilities:
// 1. Handle click attacks
// 2. Calculate damage
// 3. Process monster death
// 4. Manage combat state

// Exports:
export function onPlayerClick() { }
export function calculateDamage() { }
export function killMonster() { }
export function spawnMonster() { }
```

### ui.js - DOM Layer
```javascript
// Responsibilities:
// 1. Update DOM elements
// 2. Handle animations
// 3. Show/hide screens
// 4. NEVER modify game state

// Exports:
export function updateHealthBar(current, max) { }
export function updateGoldDisplay(amount) { }
export function showDamageNumber(damage, isCrit) { }
export function showLevelUpCelebration(level) { }
```

---

## State Management

### Game State Structure
```javascript
// Located in game.js
const state = {
  // Player state (saved to localStorage)
  player: { /* ... from player.schema.md */ },

  // Combat state (not saved, reset on load)
  currentMonster: null,
  combatState: 'idle',  // 'idle' | 'active' | 'dying' | 'waiting'

  // Active buffs (derived from player.buffs, cached)
  activeBuffs: {},

  // UI state (not saved)
  currentScreen: 'combat',  // 'combat' | 'shop' | 'skills' | 'zones'
  isModalOpen: false
};
```

### State Update Pattern
```javascript
// GOOD: Update through dedicated functions
import { giveGold } from './player.js';
giveGold(100);

// BAD: Direct mutation
state.player.gold += 100;  // Never do this outside player.js!
```

### State Access Pattern
```javascript
// GOOD: Use getter functions
import { getPlayer, getTotalAttack } from './player.js';
const attack = getTotalAttack();

// BAD: Direct property access in UI
const attack = state.player.stats.attack;  // Missing equipment + skills!
```

---

## Event Handling

### DOM Events (main.js)
```javascript
// All DOM event listeners set up in main.js
document.getElementById('combat-area').addEventListener('click', () => {
  onPlayerClick();
});

document.getElementById('shop-btn').addEventListener('click', () => {
  showScreen('shop');
});
```

### Game Events (Optional Event Bus)
```javascript
// For complex scenarios, use event bus
// Located in services/events.js

const events = {};

export function on(event, callback) {
  if (!events[event]) events[event] = [];
  events[event].push(callback);
}

export function emit(event, data) {
  if (events[event]) {
    events[event].forEach(cb => cb(data));
  }
}

// Usage:
emit('monster-killed', { monster, rewards });
on('monster-killed', (data) => updateKillCount(data));
```

---

## Data Flow Examples

### Click Attack Flow
```
1. User clicks combat area
   └─► main.js: click event listener
       └─► combat.js: onPlayerClick()
           ├─► player.js: getTotalAttack()
           ├─► combat.js: calculateDamage()
           ├─► game.js: update currentMonster.health
           └─► ui.js: showDamageNumber()
               └─► (if monster dead)
                   ├─► combat.js: killMonster()
                   │   ├─► player.js: giveGold(), giveXP()
                   │   └─► player.js: checkLevelUp()
                   └─► ui.js: updateAll()
```

### Purchase Flow
```
1. User clicks "Buy" button
   └─► shop-ui.js: onBuyClick(itemId)
       └─► shop.js: purchaseItem(itemId)
           ├─► player.js: canAfford(price) → boolean
           ├─► player.js: spendGold(price)
           ├─► player.js: addToInventory(itemId)
           └─► return { success: true }
       └─► shop-ui.js: updateShopDisplay()
           └─► ui.js: showNotification("Purchased!")
```

---

## Module Communication Rules

### Allowed Dependencies
```
main.js ──────► ALL modules (orchestrator)

game.js ──────► player.js, combat.js, monsters.js, zones.js
              └► storage.js (save triggers)

player.js ────► config/constants.js, data/*.js
              └► utils.js

combat.js ────► player.js, monsters.js
              └► config/constants.js

ui.js ────────► game.js (read only!)
              └► NO WRITES to game state

storage.js ───► game.js (get state to save)
```

### Forbidden Dependencies
```
✗ player.js → ui.js       (logic should not know about view)
✗ data/*.js → anything    (data is pure, no imports)
✗ ui.js → player.js       (UI reads state, doesn't call mutations)
✗ Any circular deps       (A→B→A is forbidden)
```

---

## Error Handling

### Error Boundaries
```javascript
// Wrap critical operations
function safeOperation(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    console.error('Operation failed:', error);
    return fallback;
  }
}

// Usage in combat
const damage = safeOperation(
  () => calculateDamage(),
  MIN_DAMAGE  // fallback to minimum damage
);
```

### Save Error Handling
```javascript
function saveGame() {
  try {
    const state = getGameState();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    showNotification('Save failed! Storage may be full.', 'error');
    return false;
  }
}
```

### Load Error Handling
```javascript
function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved);

    // Validate save version
    if (data.saveVersion !== CURRENT_SAVE_VERSION) {
      return migrateData(data);
    }

    // Validate required fields
    if (!validateSaveData(data)) {
      console.error('Invalid save data');
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

## Performance Guidelines

### DOM Updates
```javascript
// BAD: Multiple DOM updates
element1.textContent = value1;
element2.textContent = value2;
element3.textContent = value3;

// GOOD: Batch updates
function updateUI() {
  requestAnimationFrame(() => {
    element1.textContent = value1;
    element2.textContent = value2;
    element3.textContent = value3;
  });
}
```

### Event Delegation
```javascript
// BAD: Listener on each button
buttons.forEach(btn => btn.addEventListener('click', handler));

// GOOD: Single listener on parent
container.addEventListener('click', (e) => {
  if (e.target.matches('.skill-btn')) {
    handleSkillClick(e.target.dataset.skillId);
  }
});
```

### Throttle High-Frequency Events
```javascript
// Throttle auto-save
let saveTimeout = null;
function queueSave() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveGame();
    saveTimeout = null;
  }, AUTO_SAVE_INTERVAL);
}
```

---

## Testing Strategy

### Manual Testing Checklist
```markdown
## Core Loop
- [ ] Click deals damage
- [ ] Monster dies at 0 HP
- [ ] Gold awarded on kill
- [ ] XP awarded on kill
- [ ] Level up works correctly
- [ ] New monster spawns after delay

## Progression
- [ ] Boss appears when triggered
- [ ] Boss death unlocks zone
- [ ] Zone travel works
- [ ] Skills can be purchased
- [ ] Equipment can be bought/equipped

## Persistence
- [ ] Game saves automatically
- [ ] Game loads correctly on refresh
- [ ] Export/import works
- [ ] New game resets all data
```

### Console Testing Helpers
```javascript
// Add to game.js for debugging (remove in production)
window.DEBUG = {
  giveGold: (n) => giveGold(n),
  giveXP: (n) => giveXP(n),
  setLevel: (n) => { state.player.level = n; },
  unlockAllZones: () => { /* ... */ },
  killCurrentMonster: () => killMonster(),
  logState: () => console.log(state)
};
```

---

## Future Extensibility

### Adding New Zone
1. Add zone data to `data/zones.data.js`
2. Add monsters to `data/monsters.data.js`
3. Add items to `data/items.data.js`
4. Update previous boss to unlock new zone
5. Add zone theme colors to CSS variables

### Adding New Skill
1. Add skill data to `data/skills.data.js`
2. Add effect handler to `core/skills.js`
3. Add UI button to `ui/skills-ui.js`
4. Test balance with `balance/curves.balance.md`

### Adding New Feature
1. Spec in appropriate `docs/` file first
2. Create module in appropriate folder
3. Wire up in `main.js`
4. Add UI components
5. Update save schema if persistent

---

*This architecture ensures maintainability as the game grows.*
*All team members (human or AI) should follow these patterns.*

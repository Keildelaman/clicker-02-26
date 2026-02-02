# Coding Standards

> Consistent code style ensures maintainability. Follow these standards.

---

## JavaScript Standards

### General Rules

```javascript
// Use const by default, let when reassignment needed, never var
const MAX_LEVEL = 100;
let currentHealth = 50;

// Use meaningful, descriptive names
const playerCurrentHealth = 100;     // GOOD
const pch = 100;                     // BAD

// Use camelCase for variables and functions
const playerName = "Hero";
function calculateDamage() { }

// Use UPPER_SNAKE_CASE for constants
const BASE_ATTACK = 5;
const MAX_INVENTORY_SIZE = 100;

// Use PascalCase for classes (if used)
class Monster { }
```

### Functions

```javascript
// Use arrow functions for short callbacks
const doubled = numbers.map(n => n * 2);

// Use regular functions for named functions (better debugging)
function calculateTotalAttack(player) {
  // Implementation
}

// Document complex functions with JSDoc
/**
 * Calculates final damage including crits and bonuses.
 * @param {Object} player - The player object
 * @param {boolean} isCrit - Whether this is a critical hit
 * @returns {number} The final damage value
 */
function calculateDamage(player, isCrit) {
  // Implementation
}

// Keep functions short (< 30 lines ideally)
// Extract helper functions for complex logic
function processMonsterDeath() {
  awardRewards();
  updateStatistics();
  checkLevelUp();
  rollLoot();
  scheduleNextSpawn();
}

// Single responsibility - each function does ONE thing
function giveGold(amount) {
  state.player.gold += amount;
  state.player.totalGoldEarned += amount;
}
```

### Modules

```javascript
// Use ES6 modules exclusively
// Named exports for multiple exports
export function calculateDamage() { }
export function spawnMonster() { }
export const COMBAT_STATES = { ... };

// Default export for main module function (optional)
export default function initCombat() { }

// Import with destructuring
import { calculateDamage, spawnMonster } from './combat.js';

// Group imports logically
// 1. External libraries (none in this project)
// 2. Core modules
import { getPlayer, getTotalAttack } from './player.js';
// 3. Data modules
import { ZONES } from '../data/zones.data.js';
// 4. Utilities
import { randomInt } from '../services/utils.js';
```

### Objects and Arrays

```javascript
// Use object shorthand
const name = "Hero";
const level = 1;
const player = { name, level };  // GOOD
const player = { name: name, level: level };  // BAD

// Use spread operator for immutable updates
const newPlayer = { ...player, level: player.level + 1 };

// Use destructuring for cleaner code
function processReward({ gold, xp }) {
  giveGold(gold);
  giveXP(xp);
}

// Prefer array methods over loops
const aliveMonsters = monsters.filter(m => m.health > 0);
const totalGold = drops.reduce((sum, d) => sum + d.gold, 0);

// Use const for arrays/objects you won't reassign
const skills = [];  // You can still push() to this
skills.push(newSkill);  // This is fine
```

### Conditionals

```javascript
// Use early returns to avoid nesting
function canPurchase(player, item) {
  if (player.gold < item.price) return false;
  if (player.level < item.requiredLevel) return false;
  if (player.inventory.length >= MAX_INVENTORY_SIZE) return false;
  return true;
}

// Use ternary for simple conditions
const message = isSuccess ? "Victory!" : "Defeat!";

// Use && for conditional execution
isAlive && processAttack();

// Prefer switch for multiple conditions
switch (combatState) {
  case 'idle':
    spawnMonster();
    break;
  case 'active':
    processClick();
    break;
  case 'dying':
    playAnimation();
    break;
}
```

### Error Handling

```javascript
// Always handle potential errors
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
} catch (error) {
  console.error('Failed to parse save data:', error);
  return createNewPlayer();
}

// Use specific error messages
if (!zone) {
  throw new Error(`Zone not found: ${zoneId}`);
}

// Fail gracefully in non-critical operations
function playSound(soundId) {
  try {
    audio.play();
  } catch (error) {
    // Sound failed, but game continues
    console.warn('Sound playback failed:', error);
  }
}
```

---

## CSS Standards

### Organization

```css
/* Variables at top of file */
:root {
  /* Colors */
  --color-primary: #2d5a27;
  --color-secondary: #1a3518;
  --color-accent: #90EE90;

  /* Typography */
  --font-main: 'Segoe UI', system-ui, sans-serif;
  --font-size-base: 16px;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Sizing */
  --touch-target-min: 44px;  /* Mobile accessibility */
}

/* Order properties logically */
.element {
  /* Positioning */
  position: relative;
  top: 0;
  left: 0;
  z-index: 1;

  /* Display & Box Model */
  display: flex;
  width: 100%;
  padding: var(--spacing-md);
  margin: 0;

  /* Visual */
  background: var(--color-primary);
  border: 1px solid var(--color-secondary);
  border-radius: 8px;

  /* Typography */
  font-family: var(--font-main);
  font-size: var(--font-size-base);
  color: white;

  /* Animation */
  transition: transform 0.2s ease;
}
```

### Naming Convention (BEM-like)

```css
/* Block: Standalone component */
.monster-card { }

/* Element: Part of a block */
.monster-card__name { }
.monster-card__health-bar { }

/* Modifier: Different state */
.monster-card--boss { }
.monster-card--dead { }
.monster-card__health-bar--critical { }

/* State classes (use for JS toggling) */
.is-active { }
.is-hidden { }
.is-disabled { }
```

### Mobile-First

```css
/* Base styles for mobile */
.container {
  padding: var(--spacing-sm);
  flex-direction: column;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-lg);
    flex-direction: row;
  }
}
```

### Touch Targets

```css
/* Minimum touch target size (44x44px per WCAG) */
.button,
.clickable {
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

---

## HTML Standards

### Semantic Structure

```html
<!-- Use semantic elements -->
<header class="game-header">
  <h1>Realms of Clickoria</h1>
</header>

<main class="game-main">
  <section class="combat-area" id="combat-area">
    <!-- Combat content -->
  </section>

  <nav class="game-nav">
    <button class="nav-btn" data-screen="shop">Shop</button>
    <button class="nav-btn" data-screen="skills">Skills</button>
  </nav>
</main>

<!-- Use data attributes for JS hooks -->
<button data-action="attack">Attack</button>
<div data-monster-id="whisperwood_sprite"></div>

<!-- Use aria labels for accessibility -->
<button aria-label="Open shop menu">🛒</button>
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-fill" style="width: 75%"></div>
</div>
```

### ID Usage

```html
<!-- IDs for unique elements (JS access) -->
<div id="monster-health-bar"></div>
<span id="gold-display"></span>

<!-- Classes for styling -->
<div id="monster-health-bar" class="health-bar health-bar--monster"></div>
```

---

## Documentation Standards

### Code Comments

```javascript
// Single line for brief explanations
const damage = baseDamage * critMultiplier;  // Apply crit bonus

/*
 * Multi-line for complex logic explanations.
 * Use when the "why" isn't obvious from the code.
 */
function calculateXPToNextLevel(level) {
  /*
   * XP curve uses exponential growth:
   * - Base: 100 XP for level 2
   * - Growth: 12% per level
   * This creates fast early progression, slower late game.
   */
  return Math.floor(100 * Math.pow(1.12, level - 1));
}

// TODO: Add feature
// FIXME: Known bug
// HACK: Temporary workaround
// NOTE: Important context
```

### JSDoc for Public Functions

```javascript
/**
 * Spawns a random monster from the current zone.
 *
 * @param {string} zoneId - The zone to spawn from
 * @returns {Object} The spawned monster instance
 * @throws {Error} If zone not found
 *
 * @example
 * const monster = spawnMonster('whisperwood');
 * console.log(monster.name); // "Forest Sprite"
 */
export function spawnMonster(zoneId) {
  // Implementation
}
```

### File Headers

```javascript
/**
 * combat.js - Combat System
 *
 * Handles all combat-related logic including:
 * - Click attack processing
 * - Damage calculation
 * - Monster death and rewards
 * - Auto-attack system
 *
 * @see docs/systems/combat.system.md for specifications
 */
```

---

## Git Standards

### Commit Messages

```
type: Short description (50 chars max)

Longer description if needed. Wrap at 72 characters.
Explain the "why" not the "what".

Refs: #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change, no feature/fix
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build process, dependencies

**Examples:**
```
feat: Add auto-attack skill system

Implements the auto-clicker passive skill that enables
automatic attacks based on skill level.

- Added autoAttack stat to player
- Added interval-based attack in game loop
- Added UI for auto-attack toggle

Refs: docs/data/skills.data.md
```

```
fix: Prevent negative gold on failed purchase

Gold was going negative when purchase validation
failed after the gold deduction. Moved validation
before deduction.
```

### Branch Names

```
feature/auto-attack
fix/negative-gold-bug
docs/update-combat-spec
refactor/separate-ui-modules
```

---

## Performance Rules

### Avoid These

```javascript
// DON'T: Query DOM in loops
for (let i = 0; i < 100; i++) {
  document.getElementById('counter').textContent = i;  // BAD
}

// DO: Cache DOM reference
const counter = document.getElementById('counter');
for (let i = 0; i < 100; i++) {
  counter.textContent = i;  // GOOD
}

// DON'T: Create functions in loops
items.forEach(item => {
  element.addEventListener('click', () => handleClick(item));  // BAD
});

// DO: Use event delegation
container.addEventListener('click', (e) => {
  const item = e.target.closest('[data-item-id]');
  if (item) handleClick(item.dataset.itemId);  // GOOD
});

// DON'T: Mutate during iteration
for (const item of items) {
  if (item.expired) items.remove(item);  // BAD - modifying while iterating
}

// DO: Filter to new array
items = items.filter(item => !item.expired);  // GOOD
```

### Optimize These

```javascript
// Cache expensive calculations
let cachedTotalAttack = null;
let attackCacheInvalid = true;

function getTotalAttack() {
  if (!attackCacheInvalid && cachedTotalAttack !== null) {
    return cachedTotalAttack;
  }
  cachedTotalAttack = calculateTotalAttack();
  attackCacheInvalid = false;
  return cachedTotalAttack;
}

function onEquipmentChange() {
  attackCacheInvalid = true;  // Invalidate cache
}
```

---

## Accessibility Rules

### Required Practices

```html
<!-- All images need alt text -->
<img src="monster.png" alt="Forest Sprite monster">

<!-- Interactive elements need focus styles -->
<style>
  .button:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>

<!-- Color contrast minimum 4.5:1 for text -->
<!-- Use WebAIM contrast checker -->

<!-- Support keyboard navigation -->
<button tabindex="0">Click me</button>

<!-- Announce dynamic changes -->
<div role="status" aria-live="polite" id="notifications">
  <!-- Screen readers will announce content changes -->
</div>
```

### Testing Checklist

- [ ] Tab through entire interface
- [ ] All actions possible via keyboard
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces important changes
- [ ] Text readable at 200% zoom
- [ ] Color not only indicator of state

---

## Checklist Before Commit

- [ ] Code follows naming conventions
- [ ] No console.log (use console.error for errors)
- [ ] No commented-out code (delete it)
- [ ] Functions < 30 lines (or justified)
- [ ] No magic numbers (use constants)
- [ ] Error cases handled
- [ ] Mobile-first CSS
- [ ] Touch targets >= 44px
- [ ] Accessible (keyboard, aria)
- [ ] JSDoc on public functions
- [ ] Matches specification docs

---

*Consistent code is maintainable code. Follow these standards.*

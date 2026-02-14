/**
 * main.js - Bootstrap Sequence
 *
 * Imports all modules, loads/creates state, initializes systems,
 * registers tick systems, wires DOM events, starts the game loop.
 *
 * @see docs/architecture/architecture.md
 */

import { state } from './core/game-state.js';
import { on, emit } from './core/event-bus.js';
import { registerTickSystem, startLoop } from './core/game-loop.js';
import { loadGame, setupAutoSave, clearSave } from './services/storage.js';

// Systems
import * as player from './systems/player.js';
import * as monster from './systems/monster.js';
import * as combat from './systems/combat.js';
import * as health from './systems/health.js';
import * as energy from './systems/energy.js';
import * as progression from './systems/progression.js';
import * as economy from './systems/economy.js';
import * as loot from './systems/loot.js';
import * as zones from './systems/zones.js';
import * as skills from './systems/skills.js';
import * as tutorial from './systems/tutorial.js';

// Debug
import { initDebug } from './debug.js';

// UI
import * as renderer from './ui/renderer.js';
import * as shopUI from './ui/shop-ui.js';
import * as zonesUI from './ui/zones-ui.js';
import * as skillsUI from './ui/skills-ui.js';

// --- Boot ---

// 1. Load or create game state
const savedData = loadGame();
if (savedData) {
  state.player = savedData;
} else {
  state.player = player.createNewPlayer();
}

// 2. Initialize systems (inject cross-system dependencies)
player.init();
monster.init();
combat.init({ getComputedStats: player.getComputedStats, damagePlayer: health.damagePlayer });
health.init({ getComputedStats: player.getComputedStats });
energy.init({ getComputedStats: player.getComputedStats });
progression.init({ getComputedStats: player.getComputedStats, invalidateStatCache: player.invalidateStatCache });
economy.init();
loot.init();
zones.init();
skills.init({ getComputedStats: player.getComputedStats, damagePlayer: health.damagePlayer, invalidateStatCache: player.invalidateStatCache });
tutorial.init();

// 3. Initialize UI
renderer.init();

// 4. Register tick systems
registerTickSystem(combat.update);
registerTickSystem(monster.update);
registerTickSystem(health.update);
registerTickSystem(energy.update);
registerTickSystem(progression.update);
registerTickSystem(economy.update);
registerTickSystem(skills.update);
registerTickSystem(renderer.update);

// 5. Wire DOM events
document.getElementById('monster-area').addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  combat.handleClick();
});

// Keyboard support (space/enter to attack)
document.getElementById('monster-area').addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    combat.handleClick();
  }
});

// 6. Screen navigation
function showScreen(name) {
  document.getElementById('combat-screen').style.display = name === 'combat' ? 'flex' : 'none';
  document.getElementById('shop-screen').style.display = name === 'shop' ? 'flex' : 'none';
  document.getElementById('zones-screen').style.display = name === 'zones' ? 'flex' : 'none';
  document.getElementById('skills-screen').style.display = name === 'skills' ? 'flex' : 'none';
  document.querySelector('.game-header').style.display = name === 'combat' ? '' : 'none';
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('nav-btn--active', btn.dataset.screen === name);
  });
  state.currentScreen = name;
  if (name === 'shop') shopUI.onShow();
  if (name === 'zones') zonesUI.onShow();
  if (name === 'skills') skillsUI.onShow();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  if (btn.disabled) return;
  btn.addEventListener('click', () => {
    showScreen(btn.dataset.screen);
  });
});

// Event-driven navigation (used by tutorial modal buttons)
on('nav:navigate', ({ screen }) => {
  showScreen(screen);
});

// Zones back button
document.getElementById('zones-back-btn').addEventListener('click', () => {
  showScreen('combat');
});

// Skills back button
document.getElementById('skills-back-btn').addEventListener('click', () => {
  showScreen('combat');
});

// 7. Dev reset button
document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Reset ALL progress and start fresh?')) {
    clearSave();
    location.reload();
  }
});

// 8. Set up auto-save
setupAutoSave();

// 9. Start the game
startLoop();
monster.spawnNext();

// 10. Tutorial: show welcome screen for new players
if (!savedData) {
  emit('tutorial:welcome');
}

// 11. Debug tools (dev only)
initDebug({
  grantXP: progression.grantXP,
  damagePlayer: health.damagePlayer,
  handleClick: combat.handleClick,
  refreshShop: economy.refreshShop,
  travelToZone: zones.travelToZone,
  challengeBoss: zones.challengeBoss,
  useSkill: skills.useSkill
});

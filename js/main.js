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
import * as statusEffects from './systems/status-effects.js';
import * as zones from './systems/zones.js';
import * as skills from './systems/skills.js';
import * as items from './systems/items.js';
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
player.init({ getEffectiveSkillLevel: skills.getEffectiveSkillLevel });
monster.init();
combat.init({
  getComputedStats: player.getComputedStats,
  damagePlayer: health.damagePlayer,
  getWeaponDamageType: items.getWeaponDamageType,
  getStatusProcChances: items.getStatusProcChances,
  getStatusPotency: items.getStatusPotency
});
health.init({ getComputedStats: player.getComputedStats });
energy.init({ getComputedStats: player.getComputedStats, getEffectiveSkillLevel: skills.getEffectiveSkillLevel });
progression.init({ getComputedStats: player.getComputedStats, invalidateStatCache: player.invalidateStatCache });
economy.init({
  generateShopItem: items.generateShopItem,
  addItem: items.addItem
});
items.init({
  getComputedStats: player.getComputedStats,
  invalidateStatCache: player.invalidateStatCache,
  deductGold: economy.deductGold,
  addGold: economy.addGold
});
loot.init({
  generateItem: items.generateItem,
  generateLegendaryItem: items.generateLegendaryItem,
  addItem: items.addItem
});
zones.init({
  canAffordBoss: items.canAffordBoss,
  spendBossMaterials: items.spendBossMaterials
});
skills.init({
  getComputedStats: player.getComputedStats,
  damagePlayer: health.damagePlayer,
  invalidateStatCache: player.invalidateStatCache,
  getItemSkillLevelBonus: items.getItemSkillLevelBonus,
  getStatusPotency: items.getStatusPotency
});
statusEffects.init({ damagePlayer: health.damagePlayer });
tutorial.init();

// 3. Initialize UI
renderer.init();

// 4. Register tick systems
// Order matters: combat processes clicks/damage first, then monster handles
// spawning/death, health/energy regen next, progression awards XP, economy
// updates shop timers, items/skills tick buffs/cooldowns, status effects
// apply DoT/timers, and renderer runs last to reflect the final frame state.
registerTickSystem(combat.update);
registerTickSystem(monster.update);
registerTickSystem(health.update);
registerTickSystem(energy.update);
registerTickSystem(progression.update);
registerTickSystem(economy.update);
registerTickSystem(items.update);
registerTickSystem(skills.update);
registerTickSystem(statusEffects.update);
registerTickSystem(renderer.update);

// 5. Wire DOM events
const monsterArea = document.getElementById('monster-area');

monsterArea.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();

  // If Charge Up is queued, start charging on monster press (don't normal click)
  if (state.channelState && state.channelState.phase === 'queued') {
    skills.startChannelCharging();
    return;
  }

  combat.handleClick();
});

monsterArea.addEventListener('pointerup', () => {
  // Release Charge Up when player lifts finger from monster
  if (state.channelState && state.channelState.phase === 'charging') {
    skills.releaseChannel();
  }
});

monsterArea.addEventListener('pointerleave', () => {
  // Release Charge Up if finger drifts off monster area
  if (state.channelState && state.channelState.phase === 'charging') {
    skills.releaseChannel();
  }
});

// Keyboard support (space/enter to attack)
monsterArea.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    combat.handleClick();
  }
});

// Cancel channel on tab hide (performance.now() would inflate elapsed time)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    skills.cancelChannel();
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
  useSkill: skills.useSkill,
  generateItem: items.generateItem,
  generateLegendaryItem: items.generateLegendaryItem,
  addItem: items.addItem,
  getEffectiveSkillLevel: skills.getEffectiveSkillLevel
});

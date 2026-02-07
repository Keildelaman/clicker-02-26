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
import { loadGame, saveGame, setupAutoSave } from './services/storage.js';
import { BASE_XP_REQUIREMENT, XP_GROWTH_RATE } from './data/constants.js';

// Systems
import * as player from './systems/player.js';
import * as monster from './systems/monster.js';
import * as combat from './systems/combat.js';
import * as health from './systems/health.js';
import * as energy from './systems/energy.js';

// UI
import * as renderer from './ui/renderer.js';
import { showToast } from './ui/toasts.js';

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
combat.init({ getComputedStats: player.getComputedStats });
health.init();
energy.init();

// 3. Initialize UI
renderer.init();

// 4. Register tick systems
registerTickSystem(combat.update);
registerTickSystem(monster.update);
registerTickSystem(health.update);
registerTickSystem(energy.update);
registerTickSystem(renderer.update);

// 5. Wire DOM events
document.getElementById('monster-area').addEventListener('click', () => {
  combat.handleClick();
});

// Keyboard support (space/enter to attack)
document.getElementById('monster-area').addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    combat.handleClick();
  }
});

// 6. Wire game logic events (gold & XP granting for Phase 0+1)
on('combat:monsterKilled', ({ goldReward, xpReward }) => {
  const p = state.player;

  // Grant gold
  p.gold += goldReward;
  p.totalGoldEarned += goldReward;
  emit('gold:earned', { amount: goldReward, total: p.gold });

  // Grant XP
  p.xp += xpReward;
  p.totalXpEarned += xpReward;
  emit('xp:gained', { amount: xpReward, total: p.xp });

  // Check level up
  while (p.xp >= p.xpToNextLevel) {
    p.xp -= p.xpToNextLevel;
    p.level++;

    // Recalculate XP for next level
    p.xpToNextLevel = Math.floor(BASE_XP_REQUIREMENT * Math.pow(1 + XP_GROWTH_RATE, p.level - 1));

    // Update max HP
    const stats = player.getComputedStats();
    p.maxHP = stats.maxHP;
    p.hp = p.maxHP; // Full heal on level up

    emit('player:levelUp', { newLevel: p.level });
    showToast(`Level Up! You are now level ${p.level}`, 'success', 2500);
  }

  // Auto-save on kill milestones
  if (p.statistics.totalKills % 10 === 0) {
    saveGame();
  }
});

// 7. Set up auto-save
setupAutoSave();

// 8. Start the game
startLoop();
monster.spawnNext();

// 9. Debug tools (dev only)
window.DEBUG = {
  state: () => JSON.parse(JSON.stringify(state)),
  giveGold: (n) => {
    state.player.gold += n;
    emit('gold:earned', { amount: n, total: state.player.gold });
  },
  giveXP: (n) => {
    state.player.xp += n;
    emit('xp:gained', { amount: n, total: state.player.xp });
  },
  setHP: (n) => {
    state.player.hp = Math.max(0, Math.min(n, state.player.maxHP));
    emit('player:hpChanged', { hp: state.player.hp, maxHP: state.player.maxHP });
  },
  setEnergy: (n) => {
    state.player.energy = Math.max(0, Math.min(n, state.player.maxEnergy));
    emit('energy:changed', { energy: state.player.energy, maxEnergy: state.player.maxEnergy });
  },
  killMonster: () => {
    if (state.currentMonster) {
      state.currentMonster.currentHealth = 0;
      combat.handleClick();
    }
  }
};

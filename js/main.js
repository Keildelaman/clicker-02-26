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
import { loadGame, saveGame, setupAutoSave, clearSave } from './services/storage.js';

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

// Data
import { ITEMS } from './data/items.data.js';
import { ZONES, ZONE_ORDER } from './data/zones.data.js';
import { SKILLS } from './data/skills.data.js';

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
health.init();
energy.init();
progression.init();
economy.init();
loot.init();
zones.init();
skills.init({ getComputedStats: player.getComputedStats, damagePlayer: health.damagePlayer });
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

// 6. Wire game logic events (gold granting — XP handled by progression.js)
on('combat:monsterKilled', ({ goldReward, isBoss }) => {
  const p = state.player;

  // Apply goldFind bonus from equipment
  const stats = player.getComputedStats();
  const finalGold = Math.floor(goldReward * (1 + stats.goldFind));

  // Grant gold
  p.gold += finalGold;
  p.totalGoldEarned += finalGold;
  emit('gold:earned', { amount: finalGold, total: p.gold });

  // Track zone kills (non-boss only) for boss kill gate
  if (!isBoss) {
    if (!p.zoneKills) p.zoneKills = {};
    p.zoneKills[p.currentZone] = (p.zoneKills[p.currentZone] || 0) + 1;
    emit('zone:killTracked', { zoneId: p.currentZone, kills: p.zoneKills[p.currentZone] });
  }

  // Auto-save on kill milestones
  if (p.statistics.totalKills % 10 === 0) {
    saveGame();
  }
});

// 7. Screen navigation
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
window.DEBUG = {
  state: () => JSON.parse(JSON.stringify(state)),
  giveGold: (n) => {
    state.player.gold += n;
    emit('gold:earned', { amount: n, total: state.player.gold });
  },
  giveXP: (n) => {
    progression.grantXP(n);
  },
  setHP: (n) => {
    state.player.hp = Math.max(0, Math.min(n, state.player.maxHP));
    emit('player:hpChanged', { hp: state.player.hp, maxHP: state.player.maxHP });
  },
  setEnergy: (n) => {
    state.player.energy = Math.max(0, Math.min(n, state.player.maxEnergy));
    emit('energy:changed', { energy: state.player.energy, maxEnergy: state.player.maxEnergy });
  },
  damagePlayer: (n) => {
    health.damagePlayer(n, 'debug');
  },
  killPlayer: () => {
    health.damagePlayer(state.player.maxHP * 2, 'debug');
  },
  killMonster: () => {
    if (state.currentMonster) {
      state.currentMonster.currentHealth = 0;
      combat.handleClick();
    }
  },
  giveItem: (id) => {
    if (!ITEMS[id]) { console.error('Unknown item:', id); return; }
    state.player.inventory.push(id);
    emit('loot:itemDropped', { itemId: id, item: ITEMS[id] });
  },
  refreshShop: () => {
    economy.refreshShop(false);
  },
  listItems: () => {
    console.table(Object.values(ITEMS).map(i => ({
      id: i.id, name: i.name, type: i.type, rarity: i.rarity, zone: i.zone
    })));
  },
  travelZone: (id) => {
    if (!ZONES[id]) { console.error('Unknown zone:', id); return; }
    // Force-unlock if needed
    if (!state.player.unlockedZones.includes(id)) {
      state.player.unlockedZones.push(id);
    }
    zones.travelToZone(id);
  },
  challengeBoss: () => {
    zones.challengeBoss();
  },
  unlockAllZones: () => {
    for (const id of ZONE_ORDER) {
      if (!state.player.unlockedZones.includes(id)) {
        state.player.unlockedZones.push(id);
      }
    }
    console.log('All zones unlocked:', state.player.unlockedZones);
  },
  giveMP: (n) => {
    state.player.masteryPoints += n;
    emit('mastery:gained', { amount: n, total: state.player.masteryPoints, source: 'debug' });
  },
  useSkill: (id) => {
    return skills.useSkill(id);
  },
  unlockAllSkills: () => {
    for (const id of Object.keys(SKILLS)) {
      if (!state.player.unlockedSkills.includes(id)) {
        skills.unlockSkill(id);
      }
    }
    console.log('All skills unlocked. Remaining MP:', state.player.masteryPoints);
  },
  reset: () => {
    clearSave();
    location.reload();
  }
};

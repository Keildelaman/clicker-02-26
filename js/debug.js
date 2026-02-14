/**
 * debug.js - Developer Debug Tools
 *
 * Exposes window.DEBUG with cheat/inspection helpers.
 * Development-only — does not follow normal architecture rules
 * (direct system imports are acceptable here).
 *
 * Loaded by main.js after all systems are initialized.
 */

import { state } from './core/game-state.js';
import { emit } from './core/event-bus.js';
import { clearSave } from './services/storage.js';

// Data
import { ITEMS } from './data/items.data.js';
import { ZONES, ZONE_ORDER } from './data/zones.data.js';
import { SKILLS } from './data/skills.data.js';

/**
 * Initialize debug tools. Receives system references from main.js
 * so debug.js doesn't need to import every system module.
 * @param {Object} deps - System function references
 */
export function initDebug(deps) {
  const { grantXP, damagePlayer, handleClick, refreshShop, travelToZone, challengeBoss, useSkill } = deps;

  window.DEBUG = {
    state: () => JSON.parse(JSON.stringify(state)),
    giveGold: (n) => {
      state.player.gold += n;
      emit('gold:earned', { amount: n, total: state.player.gold });
    },
    giveXP: (n) => {
      grantXP(n);
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
      damagePlayer(n, 'debug');
    },
    killPlayer: () => {
      damagePlayer(state.player.maxHP * 2, 'debug');
    },
    killMonster: () => {
      if (state.currentMonster) {
        state.currentMonster.currentHealth = 0;
        handleClick();
      }
    },
    giveItem: (id) => {
      if (!ITEMS[id]) { console.error('Unknown item:', id); return; }
      state.player.inventory.push(id);
      emit('loot:itemDropped', { itemId: id, item: ITEMS[id] });
    },
    refreshShop: () => {
      refreshShop(false);
    },
    listItems: () => {
      console.table(Object.values(ITEMS).map(i => ({
        id: i.id, name: i.name, type: i.type, rarity: i.rarity, zone: i.zone
      })));
    },
    travelZone: (id) => {
      if (!ZONES[id]) { console.error('Unknown zone:', id); return; }
      if (!state.player.unlockedZones.includes(id)) {
        state.player.unlockedZones.push(id);
      }
      travelToZone(id);
    },
    challengeBoss: () => {
      challengeBoss();
    },
    unlockAllZones: () => {
      for (const id of ZONE_ORDER) {
        if (!state.player.unlockedZones.includes(id)) {
          state.player.unlockedZones.push(id);
        }
      }
      console.log('All zones unlocked:', state.player.unlockedZones);
    },
    giveSP: (n) => {
      state.player.skillPoints += n;
      state.player.totalSPEarned += n;
      emit('sp:gained', { amount: n, total: state.player.skillPoints, source: 'debug' });
    },
    useSkill: (id) => {
      return useSkill(id);
    },
    unlockAllSkills: () => {
      for (const id of Object.keys(SKILLS)) {
        if (state.player.unlockedSkills[id] === undefined) {
          state.player.unlockedSkills[id] = 1;
        }
      }
      emit('skill:unlocked', {});
      console.log('All skills unlocked. Remaining SP:', state.player.skillPoints);
    },
    reset: () => {
      clearSave();
      location.reload();
    }
  };
}

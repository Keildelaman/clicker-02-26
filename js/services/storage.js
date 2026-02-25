/**
 * storage.js - Save/Load System
 *
 * Basic persistence via localStorage.
 * Only state.player is saved.
 *
 * @see docs/schemas/player.schema.md
 */

import { SAVE_KEY, SAVE_VERSION, AUTO_SAVE_INTERVAL } from '../data/constants.js';
import { getPlayer } from '../core/game-state.js';
import { emit } from '../core/event-bus.js';
import { LEGACY_ITEM_PRICES } from '../data/items.data.js';

const PREVIOUS_SAVE_KEYS = ['clickoria_save_v4', 'clickoria_save_v3', 'clickoria_save_v2'];

let autoSaveTimer = null;
let savingDisabled = false;

/**
 * Clear saved game data and disable further saves.
 * Prevents beforeunload from re-saving during reload.
 */
export function clearSave() {
  savingDisabled = true;
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
  localStorage.removeItem(SAVE_KEY);
}

/**
 * Save current player state to localStorage.
 */
export function saveGame() {
  if (savingDisabled) return;
  try {
    const player = getPlayer();
    if (!player) return;

    player.lastSavedAt = Date.now();
    const json = JSON.stringify(player);
    localStorage.setItem(SAVE_KEY, json);
    emit('save:completed', {});
  } catch (error) {
    console.error('Save failed:', error);
    emit('save:failed', { error });
  }
}

/**
 * Load player state from localStorage.
 * @returns {Object|null} Player data or null if no save exists
 */
export function loadGame() {
  try {
    // Try current save key first
    let raw = localStorage.getItem(SAVE_KEY);

    // If not found, try previous save keys for migration
    if (!raw) {
      for (const oldKey of PREVIOUS_SAVE_KEYS) {
        raw = localStorage.getItem(oldKey);
        if (raw) {
          // Remove old key — will be saved under new key
          localStorage.removeItem(oldKey);
          break;
        }
      }
    }

    if (!raw) return null;

    const data = JSON.parse(raw);

    // Migrate from v2 -> v3: add zoneKills
    if (data.saveVersion === 2) {
      data.zoneKills = {};
      data.saveVersion = 3;
    }

    // Migrate from v3 -> v4: skill system v2 (MP→SP, new skill schema)
    if (data.saveVersion === 3) {
      const earnedSP = Math.floor(data.level / 3);
      data.skillPoints = earnedSP;
      data.totalSPEarned = earnedSP;
      data.respecCount = 0;
      data.unlockedSkills = { 'power_strike': 1 };
      data.equippedActive = ['power_strike', null, null, null];
      data.equippedPassive = [null, null, null];
      data.skillCooldowns = {};
      delete data.masteryPoints;
      delete data.masterySpent;
      delete data.skills;
      delete data.equippedActiveSkills;
      delete data.equippedPassiveSkills;
      data.saveVersion = 4;
    }

    // Migrate from v4 -> v5: item system v2 (complete item wipe + gold compensation)
    if (data.saveVersion === 4) {
      // 1. Gold compensation (50% of old item buyPrices)
      let compensation = 0;
      for (const slot of ['weapon', 'armor', 'accessory']) {
        const itemId = data.equipment[slot];
        if (itemId && LEGACY_ITEM_PRICES[itemId]) {
          compensation += LEGACY_ITEM_PRICES[itemId];
        }
      }
      if (data.inventory) {
        for (const itemId of data.inventory) {
          if (LEGACY_ITEM_PRICES[itemId]) {
            compensation += LEGACY_ITEM_PRICES[itemId];
          }
        }
      }
      data.gold += Math.floor(compensation * 0.5);

      // 2. Expand equipment to 6 empty slots
      data.equipment = {
        weapon: null, helmet: null, chest: null,
        gloves: null, boots: null, accessory: null
      };

      // 3. Clear inventory + add new fields
      data.inventory = [];
      data.inventoryOverflow = [];
      data.materials = {};

      data.saveVersion = 5;
    }

    if (data.saveVersion !== SAVE_VERSION) {
      console.error('Save version mismatch — starting fresh');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Load failed:', error);
    return null;
  }
}

/**
 * Set up auto-save on interval and beforeunload.
 */
export function setupAutoSave() {
  autoSaveTimer = setInterval(saveGame, AUTO_SAVE_INTERVAL);

  window.addEventListener('beforeunload', () => {
    saveGame();
  });
}

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

let autoSaveTimer = null;

/**
 * Save current player state to localStorage.
 */
export function saveGame() {
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
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

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

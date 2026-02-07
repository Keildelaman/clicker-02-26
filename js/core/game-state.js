/**
 * game-state.js - Central State Store
 *
 * Persistent state (saved to localStorage) lives in state.player.
 * Transient state (combat, UI) lives at top level and resets on load.
 *
 * @see docs/architecture/architecture.md
 */

export const state = {
  // === PERSISTENT (saved) ===
  player: null,

  // === TRANSIENT (not saved, reset on load) ===
  currentMonster: null,
  combatState: 'idle',  // 'idle' | 'spawning' | 'active' | 'dying' | 'waiting'

  // UI state
  currentScreen: 'combat'
};

export function getState() {
  return state;
}

export function getPlayer() {
  return state.player;
}

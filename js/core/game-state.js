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
  combatState: 'idle',  // 'idle' | 'spawning' | 'active' | 'dying' | 'waiting' | 'dead'

  // UI state
  currentScreen: 'combat',

  // Skill runtime state (transient, not saved)
  activeBuffs: [],          // [{ skillId, effects:{...}, expiresAt, startedAt }]
  nextAttackModifier: null,  // { skillId, multiplier, condition? } — consumed on click
  playerShield: null,        // { amount, maxAmount, expiresAt } — from Shield Wall
  timingMode: null            // { skillId, expiresAt, levels:{...} } — from Perfect Strike
};

export function getState() {
  return state;
}

export function getPlayer() {
  return state.player;
}

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

  // Skill v2 runtime state (transient, not saved)
  activeBuffs: {},          // { skillId: { remaining, effects:{...} } }
  hitModifier: null,        // { skillId, multiplier, ... } — consumed on click
  clickModifiers: {},       // { skillId: { charges } }
  toggleStates: {},         // { skillId: { active, stacks, ... } }
  channelState: null,       // { skillId, startTime, ... }
  playerShield: null,       // { amount, maxAmount, remaining }
  passiveStates: {},        // { skillId: { ... } }
  lastClickTime: 0,          // performance.now() of last combat click
  overkillCarry: 0            // Chain Lightning overkill damage for next spawn
};

export function getState() {
  return state;
}

export function getPlayer() {
  return state.player;
}

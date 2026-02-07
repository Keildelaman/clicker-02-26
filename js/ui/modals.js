/**
 * modals.js - Modal System
 *
 * Non-blocking floating modal for level-up celebrations.
 * Uses pointer-events: none so clicks pass through to monsters.
 * Future phases add boss intro, death, ascension modals (blocking).
 *
 * Subscribes to events, reads state — never mutates game state.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { LEVEL_UP_CELEBRATION } from '../data/constants.js';

let container = null;
let dismissTimer = null;

/**
 * Create the level-up modal container (fixed, non-blocking).
 */
function createContainer() {
  container = document.createElement('div');
  container.className = 'level-modal-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
}

/**
 * Show the level-up celebration as a floating modal card.
 * Non-blocking — player can keep clicking underneath.
 * @param {number} level - The new level reached
 */
function showLevelUpModal(level) {
  if (!container) return;

  // Clear any existing dismiss timer
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  // Build modal content
  container.innerHTML = '';

  const modal = document.createElement('div');
  modal.className = 'level-modal';

  const title = document.createElement('div');
  title.className = 'level-modal__title';
  title.textContent = 'LEVEL UP!';

  const levelNum = document.createElement('div');
  levelNum.className = 'level-modal__level';
  levelNum.textContent = `Level ${level}`;

  const stats = document.createElement('div');
  stats.className = 'level-modal__stats';

  const statAtk = document.createElement('div');
  statAtk.className = 'level-modal__stat';
  statAtk.textContent = '+1 Attack';

  const statHP = document.createElement('div');
  statHP.className = 'level-modal__stat';
  statHP.textContent = '+10 Max HP';

  const statHeal = document.createElement('div');
  statHeal.className = 'level-modal__stat level-modal__stat--highlight';
  statHeal.textContent = 'Full HP Restored';

  stats.appendChild(statAtk);
  stats.appendChild(statHP);
  stats.appendChild(statHeal);

  modal.appendChild(title);
  modal.appendChild(levelNum);
  modal.appendChild(stats);
  container.appendChild(modal);

  container.setAttribute('aria-label', `Level up! You reached level ${level}`);

  // Show with animation
  container.classList.remove('level-modal-container--exit');
  requestAnimationFrame(() => {
    container.classList.add('level-modal-container--visible');
  });

  // Auto-dismiss after celebration duration
  dismissTimer = setTimeout(dismissModal, LEVEL_UP_CELEBRATION);
}

/**
 * Dismiss the level-up modal with exit animation.
 */
function dismissModal() {
  if (!container) return;

  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  container.classList.add('level-modal-container--exit');

  // Clean up after exit animation
  setTimeout(() => {
    if (container) {
      container.classList.remove('level-modal-container--visible', 'level-modal-container--exit');
      container.innerHTML = '';
    }
  }, 500);
}

// --- System Contract ---

export function init() {
  createContainer();
  on('player:levelUp', ({ newLevel }) => {
    showLevelUpModal(newLevel);
  });
}

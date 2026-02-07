/**
 * modals.js - Modal Overlay System
 *
 * Creates and manages modal overlays. Phase 3 adds the level-up celebration.
 * Future phases add boss intro, death, ascension modals.
 *
 * Subscribes to events, reads state — never mutates game state.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { LEVEL_UP_CELEBRATION } from '../data/constants.js';

let overlay = null;
let dismissTimer = null;

/**
 * Create the shared modal overlay element (appended to body).
 */
function createOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.addEventListener('click', dismiss);
  document.body.appendChild(overlay);
}

/**
 * Show the level-up celebration modal.
 * @param {number} level - The new level reached
 */
function showLevelUpModal(level) {
  if (!overlay) return;

  // Clear any existing dismiss timer
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  // Build modal content
  const modal = document.createElement('div');
  modal.className = 'modal modal--level-up';

  const title = document.createElement('div');
  title.className = 'modal__title';
  title.textContent = 'LEVEL UP!';

  const levelNum = document.createElement('div');
  levelNum.className = 'modal__level';
  levelNum.textContent = `Level ${level}`;

  const stats = document.createElement('div');
  stats.className = 'modal__stats';

  const statAttack = document.createElement('div');
  statAttack.className = 'modal__stat';
  statAttack.textContent = '+1 Attack';

  const statHP = document.createElement('div');
  statHP.className = 'modal__stat';
  statHP.textContent = '+10 Max HP';

  const statHeal = document.createElement('div');
  statHeal.className = 'modal__stat modal__stat--highlight';
  statHeal.textContent = 'Full HP Restored';

  stats.appendChild(statAttack);
  stats.appendChild(statHP);
  stats.appendChild(statHeal);

  const dismissHint = document.createElement('div');
  dismissHint.className = 'modal__dismiss';
  dismissHint.textContent = 'Tap to dismiss';

  modal.appendChild(title);
  modal.appendChild(levelNum);
  modal.appendChild(stats);
  modal.appendChild(dismissHint);

  // Replace overlay content and show
  overlay.innerHTML = '';
  overlay.appendChild(modal);
  overlay.setAttribute('aria-label', `Level up! You reached level ${level}`);

  // Trigger visibility (next frame so transition fires)
  requestAnimationFrame(() => {
    overlay.classList.add('modal-overlay--visible');
  });

  // Auto-dismiss after celebration duration
  dismissTimer = setTimeout(dismiss, LEVEL_UP_CELEBRATION);
}

/**
 * Dismiss the current modal.
 */
function dismiss() {
  if (!overlay) return;

  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  overlay.classList.remove('modal-overlay--visible');

  // Clean up content after fade-out transition
  setTimeout(() => {
    if (overlay) overlay.innerHTML = '';
  }, 300);
}

// --- System Contract ---

export function init() {
  createOverlay();
  on('player:levelUp', ({ newLevel }) => {
    showLevelUpModal(newLevel);
  });
}

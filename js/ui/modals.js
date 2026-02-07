/**
 * modals.js - Modal / Banner System
 *
 * Non-blocking banners and blocking modals for game events.
 * Level-up uses a top banner so players can keep clicking.
 * Future phases add boss intro, death, ascension modals (blocking).
 *
 * Subscribes to events, reads state — never mutates game state.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { LEVEL_UP_CELEBRATION } from '../data/constants.js';

let banner = null;
let dismissTimer = null;

/**
 * Create the level-up banner container (fixed at top, non-blocking).
 */
function createBanner() {
  banner = document.createElement('div');
  banner.className = 'level-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  document.body.appendChild(banner);
}

/**
 * Show the level-up celebration as a top banner.
 * Non-blocking — player can keep clicking underneath.
 * @param {number} level - The new level reached
 */
function showLevelUpBanner(level) {
  if (!banner) return;

  // Clear any existing dismiss timer
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  // Build banner content
  banner.innerHTML = '';

  const title = document.createElement('span');
  title.className = 'level-banner__title';
  title.textContent = 'LEVEL UP!';

  const levelNum = document.createElement('span');
  levelNum.className = 'level-banner__level';
  levelNum.textContent = `Level ${level}`;

  const stats = document.createElement('span');
  stats.className = 'level-banner__stats';
  stats.textContent = '+1 ATK  +10 HP  Full Heal';

  banner.appendChild(title);
  banner.appendChild(levelNum);
  banner.appendChild(stats);
  banner.setAttribute('aria-label', `Level up! You reached level ${level}`);

  // Show with animation
  banner.classList.remove('level-banner--exit');
  requestAnimationFrame(() => {
    banner.classList.add('level-banner--visible');
  });

  // Auto-dismiss after celebration duration
  dismissTimer = setTimeout(dismissBanner, LEVEL_UP_CELEBRATION);
}

/**
 * Dismiss the level-up banner with exit animation.
 */
function dismissBanner() {
  if (!banner) return;

  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  banner.classList.add('level-banner--exit');

  // Clean up after animation
  setTimeout(() => {
    if (banner) {
      banner.classList.remove('level-banner--visible', 'level-banner--exit');
      banner.innerHTML = '';
    }
  }, 300);
}

// --- System Contract ---

export function init() {
  createBanner();
  on('player:levelUp', ({ newLevel }) => {
    showLevelUpBanner(newLevel);
  });
}

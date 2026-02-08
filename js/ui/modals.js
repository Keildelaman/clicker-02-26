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

import { on, emit } from '../core/event-bus.js';
import { LEVEL_UP_CELEBRATION } from '../data/constants.js';
import { ZONES } from '../data/zones.data.js';
import { formatNumber } from '../services/utils.js';

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

// === Boss Modals ===

let bossBackdrop = null;
let bossModal = null;

function createBossContainer() {
  bossBackdrop = document.getElementById('boss-modal-backdrop');
  bossModal = document.getElementById('boss-modal');
}

/**
 * Show boss intro modal (blocking).
 * @param {Object} boss - Monster definition
 * @param {Object} zone - Zone definition
 */
function showBossIntroModal({ boss, zone }) {
  if (!bossBackdrop || !bossModal) return;

  const types = boss.type.split('+').filter(t => t !== 'aggressive');
  const typeWarning = types.length > 0
    ? `Also: ${types.join(', ').toUpperCase()}`
    : '';

  bossModal.innerHTML = `
    <div class="boss-modal__emoji">${boss.emoji}</div>
    <div class="boss-modal__name">${boss.name}</div>
    <div class="boss-modal__type">BOSS - AGGRESSIVE${typeWarning ? ' + ' + types.join(' + ').toUpperCase() : ''}</div>
    <div class="boss-modal__hp">HP: ${formatNumber(boss.baseHealth)}</div>
    <div class="boss-modal__desc">${boss.description}</div>
    <div class="boss-modal__warning">Watch for attack phases!</div>
    <div class="boss-modal__buttons">
      <button class="boss-modal__btn boss-modal__btn--fight" id="boss-fight-btn">BEGIN BATTLE</button>
      <button class="boss-modal__btn boss-modal__btn--retreat" id="boss-retreat-btn">RETREAT</button>
    </div>
  `;

  bossBackdrop.style.display = 'flex';

  document.getElementById('boss-fight-btn').addEventListener('click', () => {
    bossBackdrop.style.display = 'none';
    emit('zone:bossStart', { bossId: boss.id });
  });

  document.getElementById('boss-retreat-btn').addEventListener('click', () => {
    bossBackdrop.style.display = 'none';
  });
}

/**
 * Show boss defeat modal.
 * @param {Object} data - { bossId, firstKill, nextZoneId, nextZone }
 */
function showBossDefeatModal(data) {
  if (!data.firstKill) return; // Repeat kills don't get a blocking modal

  if (!bossBackdrop || !bossModal) return;

  const nextZoneName = data.nextZone ? data.nextZone.name : null;
  const nextZoneEmoji = data.nextZone ? data.nextZone.emoji : '';

  bossModal.innerHTML = `
    <div class="boss-modal__emoji">&#x1F389;</div>
    <div class="boss-modal__name">VICTORY!</div>
    <div class="boss-modal__desc">You have defeated the boss!</div>
    ${nextZoneName ? `
      <div class="boss-modal__unlock">
        <div class="boss-modal__unlock-label">NEW ZONE UNLOCKED!</div>
        <div class="boss-modal__unlock-zone">${nextZoneEmoji} ${nextZoneName}</div>
      </div>
    ` : ''}
    <div class="boss-modal__buttons">
      <button class="boss-modal__btn boss-modal__btn--fight" id="boss-continue-btn">${nextZoneName ? `TRAVEL TO ${nextZoneName.toUpperCase()}` : 'CONTINUE'}</button>
    </div>
  `;

  bossBackdrop.style.display = 'flex';

  document.getElementById('boss-continue-btn').addEventListener('click', () => {
    bossBackdrop.style.display = 'none';
    if (data.nextZoneId) {
      emit('zone:autoTravel', { zoneId: data.nextZoneId });
    }
  });
}

// --- System Contract ---

export function init() {
  createContainer();
  createBossContainer();

  on('player:levelUp', ({ newLevel }) => {
    showLevelUpModal(newLevel);
  });
  on('zone:bossIntro', showBossIntroModal);
  on('zone:bossDefeated', showBossDefeatModal);
}

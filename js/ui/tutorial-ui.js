/**
 * tutorial-ui.js - Tutorial UI (Welcome Screen + Blocking Modals + Highlights)
 *
 * Shows/hides the welcome overlay, displays blocking tutorial modals
 * with [CONTINUE] buttons, queues competing modals, and adds pulsing
 * highlights to guide new players. Purely event-driven.
 *
 * @see docs/systems/tutorial.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { showToast } from './toasts.js';

let overlay;
let backdrop;
let modal;
let modalVisible = false;
const modalQueue = [];

export function init() {
  overlay = document.getElementById('tutorial-overlay');
  backdrop = document.getElementById('tutorial-modal-backdrop');
  modal = document.getElementById('tutorial-modal');

  on('tutorial:welcome', showWelcome);
  on('tutorial:showModal', showTutorialModal);
  on('tutorial:tip', ({ message, type, duration }) => showToast(message, type, duration));
  on('tutorial:highlight', ({ target }) => highlightElement(target));
  on('tutorial:clearHighlight', clearHighlight);
}

// --- Welcome Screen ---

function showWelcome() {
  if (!overlay) return;
  overlay.style.display = 'flex';

  function dismiss() {
    overlay.removeEventListener('click', dismiss);
    hideWelcome();
  }
  overlay.addEventListener('click', dismiss);
}

function hideWelcome() {
  if (!overlay) return;
  overlay.style.display = 'none';
  emit('tutorial:start');
}

// --- Tutorial Modal System ---

/**
 * Show a blocking tutorial modal.
 * @param {Object} config
 * @param {string} config.icon - Emoji icon
 * @param {string} config.title - Modal title
 * @param {string} config.body - HTML body content
 * @param {Array} config.buttons - [{ label, primary, action?, actionData? }]
 * @param {string} [config.highlight] - CSS selector to highlight
 * @param {Function} [config.onDismiss] - Callback after modal dismissed
 */
function showTutorialModal(config) {
  if (modalVisible) {
    modalQueue.push(config);
    return;
  }
  presentModal(config);
}

function presentModal(config) {
  if (!backdrop || !modal) return;

  modalVisible = true;

  // Highlight target element
  if (config.highlight) {
    highlightElement(config.highlight);
  }

  // Build modal HTML
  const buttonsHTML = config.buttons.map(btn => {
    const cls = btn.primary ? 'tutorial-modal__btn--primary' : 'tutorial-modal__btn--secondary';
    return `<button class="${cls}" data-action="${btn.action || ''}" data-action-data='${JSON.stringify(btn.actionData || {})}'>${btn.label}</button>`;
  }).join('');

  modal.innerHTML = `
    <div class="tutorial-modal__icon">${config.icon}</div>
    <div class="tutorial-modal__title">${config.title}</div>
    <div class="tutorial-modal__body">${config.body}</div>
    <div class="tutorial-modal__buttons">${buttonsHTML}</div>
  `;

  backdrop.style.display = 'flex';

  // Disable buttons for 2 seconds to prevent spam-clicking
  const buttons = modal.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = true);
  setTimeout(() => {
    buttons.forEach(btn => btn.disabled = false);
  }, 2000);

  // Wire button handlers
  modal.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action) {
        const actionData = JSON.parse(btn.dataset.actionData || '{}');
        emit(action, actionData);
      }
      dismissModal(config);
    });
  });
}

function dismissModal(config) {
  if (!backdrop) return;

  // Clear highlights
  clearHighlight();

  // Hide modal
  backdrop.style.display = 'none';
  modal.innerHTML = '';
  modalVisible = false;

  // Call onDismiss callback
  if (config && config.onDismiss) {
    config.onDismiss();
  }

  // Show next queued modal after delay
  if (modalQueue.length > 0) {
    const next = modalQueue.shift();
    setTimeout(() => presentModal(next), 400);
  }
}

// --- Highlight System ---

function highlightElement(selector) {
  // Support CSS selectors (#id, .class, [attr]) or plain IDs
  let el;
  if (selector.startsWith('#') || selector.startsWith('.') || selector.startsWith('[')) {
    el = document.querySelector(selector);
  } else {
    el = document.getElementById(selector);
  }
  if (el) el.classList.add('tutorial-highlight');
}

function clearHighlight() {
  const highlighted = document.querySelectorAll('.tutorial-highlight');
  highlighted.forEach(el => el.classList.remove('tutorial-highlight'));
}

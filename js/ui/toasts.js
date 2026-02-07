/**
 * toasts.js - Toast Notification System
 *
 * Lightweight notification queue (max 3 visible).
 *
 * @see docs/systems/ui.system.md
 */

let container;
const MAX_VISIBLE = 3;

export function init() {
  container = document.getElementById('toast-container');
}

/**
 * Show a toast notification.
 * @param {string} message - Text to display
 * @param {string} type - 'success' | 'info' | 'warning' | 'error'
 * @param {number} duration - Auto-dismiss in ms (default 2000)
 */
export function showToast(message, type = 'info', duration = 2000) {
  if (!container) return;

  // Limit visible toasts
  while (container.children.length >= MAX_VISIBLE) {
    container.removeChild(container.firstChild);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--exiting');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

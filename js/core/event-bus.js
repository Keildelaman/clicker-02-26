/**
 * event-bus.js - Lightweight Pub/Sub
 *
 * Systems emit events. Other systems and UI subscribe.
 * No system imports another system — only the EventBus.
 *
 * @see docs/architecture/architecture.md
 */

const listeners = {};

/**
 * Subscribe to an event.
 * @param {string} event - Event name
 * @param {Function} callback - Handler function
 */
export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

/**
 * Unsubscribe from an event.
 * @param {string} event - Event name
 * @param {Function} callback - Handler to remove
 */
export function off(event, callback) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(cb => cb !== callback);
}

/**
 * Subscribe to an event for a single firing, then auto-unsubscribe.
 * @param {string} event - Event name
 * @param {Function} callback - Handler function
 */
export function once(event, callback) {
  const wrapper = (data) => { off(event, wrapper); callback(data); };
  on(event, wrapper);
}

/**
 * Emit an event to all subscribers.
 * @param {string} event - Event name
 * @param {*} data - Event payload
 */
export function emit(event, data) {
  if (!listeners[event]) return;
  for (const cb of listeners[event]) {
    try {
      cb(data);
    } catch (error) {
      console.error(`EventBus error in "${event}" handler (${cb.name || 'anonymous'}):`, error);
    }
  }
}

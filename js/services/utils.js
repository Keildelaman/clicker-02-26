/**
 * utils.js - Utility Functions
 *
 * Pure helper functions used across the codebase.
 */

/**
 * Random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp a value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format a number for display (e.g., 1234 → "1,234").
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return Math.floor(n).toLocaleString();
}

/**
 * stats-panel-ui.js - Full Stats Panel Overlay
 *
 * Tap the stats bar to expand a categorized view of all player stats.
 * Follows the item-detail-ui.js pattern: backdrop + panel + live refresh.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { formatNumber } from '../services/utils.js';

let backdrop, panel, statsBar;
let isOpen = false;

// ============================================================
// INITIALIZATION
// ============================================================

export function init() {
  backdrop = document.getElementById('stats-panel-backdrop');
  panel = document.getElementById('stats-panel');
  statsBar = document.getElementById('stats-bar');

  // Toggle on stats bar tap (if it exists)
  statsBar?.addEventListener('click', toggle);
  statsBar?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });

  // Toggle on header stats button
  const headerStatsBtn = document.getElementById('header-stats-btn');
  if (headerStatsBtn) {
    headerStatsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
  }

  // Dismiss on backdrop tap
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) hide();
  });

  // Live refresh on stat-changing events
  on('player:statsChanged', refreshIfOpen);
  on('item:equipped', refreshIfOpen);
  on('item:unequipped', refreshIfOpen);
  on('skill:buffApplied', refreshIfOpen);
  on('skill:buffExpired', refreshIfOpen);
  on('player:levelUp', refreshIfOpen);
}

// ============================================================
// SHOW / HIDE / TOGGLE
// ============================================================

function toggle() {
  if (isOpen) hide();
  else show();
}

function show() {
  if (!backdrop) return;
  render();
  backdrop.style.display = 'flex';
  isOpen = true;
}

function hide() {
  if (!backdrop) return;
  backdrop.style.display = 'none';
  isOpen = false;
}

function refreshIfOpen() {
  if (!isOpen) return;
  render();
}

// ============================================================
// RENDER
// ============================================================

function render() {
  if (!panel) return;

  const stats = state.computedStats || {};
  const eqStats = state.equipmentStats || {};
  const player = getPlayer();

  let html = '';

  // Close button
  html += '<button class="stats-panel__close" id="stats-panel-close">&times;</button>';

  // Title
  html += '<div class="stats-panel__title">Player Stats</div>';

  // --- Offense ---
  html += buildCategory('Offense', [
    row('Attack', stats.attack, 'flat'),
    row('Magic Power', stats.magicPower, 'flat'),
    row('Crit Chance', stats.critChance, 'percent'),
    row('Crit Damage', stats.critDamage, 'multiplier'),
    row('Armor Pen', stats.armorPen, 'percent'),
    row('Magic Pen', stats.magicPen, 'percent'),
  ], 0);

  // --- Defense ---
  html += buildCategory('Defense', [
    row('Max HP', stats.maxHP, 'flat'),
    row('HP Regen', stats.hpRegen, 'percentPerSec'),
    row('Armor', stats.armor, 'flat'),
    row('Magic Resist', stats.magicResist, 'flat'),
    row('Damage Reduction', stats.damageReduction, 'percent'),
    row('Max Shield', stats.maxShield, 'flat'),
  ], 1);

  // --- Status Effects (only show if any chance > 0) ---
  const statusRows = [];
  if (eqStats.bleedChance > 0) {
    statusRows.push(row('Bleed Chance', eqStats.bleedChance, 'percent'));
    statusRows.push(row('Bleed Potency', eqStats.bleedPotency, 'percent'));
  }
  if (eqStats.poisonChance > 0) {
    statusRows.push(row('Poison Chance', eqStats.poisonChance, 'percent'));
    statusRows.push(row('Poison Potency', eqStats.poisonPotency, 'percent'));
  }
  if (eqStats.burnChance > 0) {
    statusRows.push(row('Burn Chance', eqStats.burnChance, 'percent'));
    statusRows.push(row('Burn Potency', eqStats.burnPotency, 'percent'));
  }
  if (eqStats.slowChance > 0) {
    statusRows.push(row('Slow Chance', eqStats.slowChance, 'percent'));
    statusRows.push(row('Slow Strength', eqStats.slowStrength, 'percent'));
  }
  if (eqStats.freezeChance > 0) {
    statusRows.push(row('Freeze Chance', eqStats.freezeChance, 'percent'));
    statusRows.push(row('Freeze Duration', eqStats.freezeDuration, 'percent'));
  }
  if (statusRows.length > 0) {
    html += buildCategory('Status Effects', statusRows, 2);
  }

  // --- Utility ---
  html += buildCategory('Utility', [
    row('Gold Find', stats.goldFind, 'percent'),
    row('XP Bonus', stats.xpBonus, 'percent'),
    row('Energy Gain', stats.energyGainMult, 'multiplier'),
    row('Cooldown Reduction', stats.skillCooldown, 'percent'),
    row('Skill Energy Cost', stats.skillEnergyCost, 'percent'),
  ], 3);

  // --- Skill Boosts (only show if any > 0) ---
  const skillBoostRows = [];
  if (eqStats.skillSpeedBoost > 0) skillBoostRows.push(row('Speed Skills', eqStats.skillSpeedBoost, 'flat', '+'));
  if (eqStats.skillPowerBoost > 0) skillBoostRows.push(row('Power Skills', eqStats.skillPowerBoost, 'flat', '+'));
  if (eqStats.skillCritBoost > 0) skillBoostRows.push(row('Crit Skills', eqStats.skillCritBoost, 'flat', '+'));
  if (eqStats.skillMageBoost > 0) skillBoostRows.push(row('Mage Skills', eqStats.skillMageBoost, 'flat', '+'));
  if (eqStats.skillUtilityBoost > 0) skillBoostRows.push(row('Utility Skills', eqStats.skillUtilityBoost, 'flat', '+'));
  if (skillBoostRows.length > 0) {
    html += buildCategory('Skill Boosts', skillBoostRows, 4);
  }

  // --- Active Buffs (only show if any are non-default) ---
  const buffRows = [];
  if (stats.damageMultiplier !== undefined && stats.damageMultiplier !== 1.0) {
    buffRows.push(row('Damage Multiplier', stats.damageMultiplier, 'multiplier'));
  }
  if (stats.bonusDamage > 0) {
    buffRows.push(row('Bonus Damage', stats.bonusDamage, 'flat', '+'));
  }
  if (stats.damageTakenMultiplier !== undefined && stats.damageTakenMultiplier !== 1.0) {
    buffRows.push(row('Damage Taken', stats.damageTakenMultiplier, 'multiplier'));
  }
  if (stats.reflectMultiplier > 0) {
    buffRows.push(row('Reflect', stats.reflectMultiplier, 'percent'));
  }
  if (stats.survivePercent > 0) {
    buffRows.push(row('Survive at', stats.survivePercent, 'percent'));
  }
  if (stats.invulnerable) {
    buffRows.push(rowRaw('Invulnerable', 'Yes'));
  }
  if (buffRows.length > 0) {
    html += buildCategory('Active Buffs', buffRows, 5, true);
  }

  // --- Player Info ---
  if (player) {
    html += buildCategory('Info', [
      rowRaw('Level', player.level),
      rowRaw('Gold', formatNumber(player.gold)),
      rowRaw('XP', `${formatNumber(player.xp)} / ${formatNumber(player.xpToNextLevel)}`),
      rowRaw('SP Available', player.sp || 0),
    ], 6);
  }

  panel.innerHTML = html;

  // Wire close button
  document.getElementById('stats-panel-close')?.addEventListener('click', hide);
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Build a single stat row descriptor.
 */
function row(label, value, format, prefix) {
  return { label, value: value || 0, format, prefix: prefix || '' };
}

/**
 * Build a raw (pre-formatted) stat row descriptor.
 */
function rowRaw(label, displayValue) {
  return { label, displayValue: String(displayValue) };
}

/**
 * Build a category section with title and rows.
 */
function buildCategory(title, rows, staggerIndex, isBuff) {
  const delay = staggerIndex * 0.05;
  const buffClass = isBuff ? ' stats-panel__category--buffs' : '';

  let html = `<div class="stats-panel__category${buffClass}" style="animation-delay: ${delay}s">`;
  html += `<div class="stats-panel__category-title">${title}</div>`;
  for (const r of rows) {
    const valueStr = r.displayValue !== undefined ? r.displayValue : formatStatValue(r.value, r.format, r.prefix);
    html += `<div class="stats-panel__row">
      <span class="stats-panel__label">${r.label}</span>
      <span class="stats-panel__value">${valueStr}</span>
    </div>`;
  }
  html += '</div>';
  return html;
}

/**
 * Format a stat value based on its type.
 */
function formatStatValue(value, format, prefix) {
  switch (format) {
    case 'percent':
      return `${prefix}${Math.round(value * 100)}%`;
    case 'multiplier':
      return `${prefix}${value.toFixed(2)}x`;
    case 'perSec':
      return `${prefix}${value.toFixed(1)}/s`;
    case 'percentPerSec':
      return `${prefix}${(value * 100).toFixed(1)}%/s`;
    case 'flat':
    default:
      return `${prefix}${formatNumber(value)}`;
  }
}

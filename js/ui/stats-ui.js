/**
 * stats-ui.js - Stats Display
 *
 * Renders attack power, gold counter, and XP bar.
 * Subscribes to events, reads state, never mutates.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { formatNumber } from '../services/utils.js';
import { ZONES } from '../data/zones.data.js';
import { showToast } from './toasts.js';

let attackDisplay, magicDisplay, armorDisplay, goldDisplay, levelDisplay, xpFill, xpText, zoneNameDisplay;

export function init() {
  attackDisplay = document.getElementById('attack-display');
  magicDisplay = document.getElementById('magic-display');
  armorDisplay = document.getElementById('armor-display');
  goldDisplay = document.getElementById('gold-display');
  levelDisplay = document.getElementById('level-display');
  xpFill = document.getElementById('xp-fill');
  xpText = document.getElementById('xp-text');
  zoneNameDisplay = document.getElementById('zone-name');

  on('gold:earned', renderGold);
  on('xp:gained', renderXP);
  on('player:levelUp', renderAll);
  on('combat:monsterSpawned', renderAll);
  on('player:statsChanged', renderAttack);
  on('item:equipped', renderAll);
  on('item:unequipped', renderAll);
  on('zone:changed', renderZoneName);
  on('progression:milestone', ({ message }) => showToast(message, 'warning', 4000));
}

function renderAll() {
  renderAttack();
  renderGold();
  renderXP();
  renderLevel();
}

function renderAttack() {
  const stats = state.computedStats || {};
  if (attackDisplay) attackDisplay.textContent = stats.attack || 0;
  if (magicDisplay) magicDisplay.textContent = stats.magicPower || 0;
  if (armorDisplay) armorDisplay.textContent = stats.armor || 0;
}

export function renderGold() {
  const player = getPlayer();
  if (goldDisplay && player) goldDisplay.textContent = formatNumber(player.gold);
}

function renderXP() {
  const player = getPlayer();
  if (!player || !xpFill) return;

  const pct = (player.xp / player.xpToNextLevel) * 100;
  xpFill.style.width = `${Math.min(pct, 100)}%`;
  if (xpText) xpText.textContent = `${formatNumber(player.xp)} / ${formatNumber(player.xpToNextLevel)}`;
}

function renderLevel() {
  const player = getPlayer();
  if (levelDisplay && player) levelDisplay.textContent = `Lv. ${player.level}`;
}

function renderZoneName() {
  const player = getPlayer();
  if (!zoneNameDisplay || !player) return;
  const zone = ZONES[player.currentZone];
  if (zone) zoneNameDisplay.textContent = zone.name;
}

export function renderInitial() {
  renderAll();
  renderZoneName();
}

/**
 * stats-ui.js - Stats Display
 *
 * Renders attack power, gold counter, and XP bar.
 * Subscribes to events, reads state, never mutates.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { getComputedStats } from '../systems/player.js';
import { formatNumber } from '../services/utils.js';

let attackDisplay, goldDisplay, levelDisplay, xpFill, xpText;

export function init() {
  attackDisplay = document.getElementById('attack-display');
  goldDisplay = document.getElementById('gold-display');
  levelDisplay = document.getElementById('level-display');
  xpFill = document.getElementById('xp-fill');
  xpText = document.getElementById('xp-text');

  on('gold:earned', renderGold);
  on('xp:gained', renderXP);
  on('player:levelUp', renderAll);
  on('combat:monsterSpawned', renderAll);
}

function renderAll() {
  renderAttack();
  renderGold();
  renderXP();
  renderLevel();
}

function renderAttack() {
  const stats = getComputedStats();
  if (attackDisplay) attackDisplay.textContent = stats.attack;
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

export function renderInitial() {
  renderAll();
}

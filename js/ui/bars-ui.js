/**
 * bars-ui.js - Player Resource Bars
 *
 * Renders HP bar (with color thresholds) and energy bar.
 * Subscribes to events, reads state, never mutates.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { state } from '../core/game-state.js';
import { HP_CAUTION_THRESHOLD, HP_CRITICAL_THRESHOLD, MAX_ENERGY } from '../data/constants.js';

let hpFill, hpText, energyFill, energyText;
let shieldBar, shieldFill, shieldText;

export function init() {
  hpFill = document.getElementById('player-hp-fill');
  hpText = document.getElementById('player-hp-text');
  energyFill = document.getElementById('energy-fill');
  energyText = document.getElementById('energy-text');
  shieldBar = document.getElementById('player-shield-bar');
  shieldFill = document.getElementById('player-shield-fill');
  shieldText = document.getElementById('player-shield-text');

  on('player:hpChanged', renderHP);
  on('player:hpChanged', renderShield);
  on('player:shieldBroken', renderShield);
  on('skill:buffApplied', renderShield);
  on('item:equipped', renderShield);
  on('item:unequipped', renderShield);
  on('player:statsChanged', renderShield);
  on('energy:changed', renderEnergy);
  on('player:levelUp', renderAll);
  on('combat:monsterSpawned', renderAll);
}

export function renderInitial() {
  renderAll();
}

function renderAll() {
  renderHP();
  renderShield();
  renderEnergy();
}

function renderHP() {
  const player = getPlayer();
  if (!player || !hpFill) return;

  const pct = (player.hp / player.maxHP) * 100;
  hpFill.style.width = `${Math.min(pct, 100)}%`;
  hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHP}`;

  // Color thresholds
  hpFill.classList.remove('hp-fill--caution', 'hp-fill--critical');
  const ratio = player.hp / player.maxHP;
  if (ratio <= HP_CRITICAL_THRESHOLD) {
    hpFill.classList.add('hp-fill--critical');
  } else if (ratio <= HP_CAUTION_THRESHOLD) {
    hpFill.classList.add('hp-fill--caution');
  }
}

function renderShield() {
  if (!shieldBar) return;
  const shield = state.playerShield;
  const maxShield = (state.computedStats && state.computedStats.maxShield) || 0;

  // Case 1: Active shield with amount > 0
  if (shield && shield.amount > 0) {
    shieldBar.style.display = '';
    const pct = (shield.amount / shield.max) * 100;
    if (shieldFill) shieldFill.style.width = `${Math.min(pct, 100)}%`;
    if (shieldText) shieldText.textContent = `${Math.ceil(shield.amount)} / ${shield.max}`;
    return;
  }

  // Case 2: No active shield, but maxShield > 0 from equipment — show empty bar
  if (maxShield > 0) {
    shieldBar.style.display = '';
    if (shieldFill) shieldFill.style.width = '0%';
    if (shieldText) shieldText.textContent = `0 / ${maxShield}`;
    return;
  }

  // Case 3: No shield at all — hide bar
  shieldBar.style.display = 'none';
}

function renderEnergy() {
  const player = getPlayer();
  if (!player || !energyFill) return;

  const pct = (player.energy / MAX_ENERGY) * 100;
  energyFill.style.width = `${Math.min(pct, 100)}%`;
  energyText.textContent = `${Math.floor(player.energy)} / ${MAX_ENERGY}`;
}

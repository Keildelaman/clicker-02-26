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
import { HP_CAUTION_THRESHOLD, HP_CRITICAL_THRESHOLD, MAX_ENERGY } from '../data/constants.js';

let hpFill, hpText, energyFill, energyText;

export function init() {
  hpFill = document.getElementById('player-hp-fill');
  hpText = document.getElementById('player-hp-text');
  energyFill = document.getElementById('energy-fill');
  energyText = document.getElementById('energy-text');

  on('player:hpChanged', renderHP);
  on('energy:changed', renderEnergy);
  on('player:levelUp', renderAll);
  on('combat:monsterSpawned', renderAll);
}

export function renderInitial() {
  renderAll();
}

function renderAll() {
  renderHP();
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

function renderEnergy() {
  const player = getPlayer();
  if (!player || !energyFill) return;

  const pct = (player.energy / MAX_ENERGY) * 100;
  energyFill.style.width = `${Math.min(pct, 100)}%`;
  energyText.textContent = `${Math.floor(player.energy)} / ${MAX_ENERGY}`;
}

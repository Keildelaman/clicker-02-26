/**
 * combat-ui.js - Combat UI
 *
 * Renders monster display, HP bar, damage numbers, death animation.
 * Subscribes to combat events, reads state, never mutates.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { state } from '../core/game-state.js';
import { DAMAGE_NUMBER_DURATION } from '../data/constants.js';

// Cached DOM references
let monsterArea, monsterEmoji, monsterName, monsterLevel;
let monsterHPFill, monsterHPText, monsterHPBar;
let damageContainer;

export function init() {
  monsterArea = document.getElementById('monster-area');
  monsterEmoji = document.getElementById('monster-emoji');
  monsterName = document.getElementById('monster-name');
  monsterLevel = document.getElementById('monster-level');
  monsterHPFill = document.getElementById('monster-hp-fill');
  monsterHPText = document.getElementById('monster-hp-text');
  monsterHPBar = document.getElementById('monster-hp-bar');
  damageContainer = document.getElementById('damage-container');

  on('combat:monsterSpawned', onMonsterSpawned);
  on('combat:click', onCombatClick);
  on('combat:monsterKilled', onMonsterKilled);
}

function onMonsterSpawned({ monster }) {
  monsterEmoji.textContent = monster.emoji;
  monsterName.textContent = monster.name;
  monsterLevel.textContent = `Lv. ${monster.level}`;
  monsterArea.classList.remove('monster-area--dead');
  monsterArea.classList.add('monster-area--spawning');

  setTimeout(() => {
    monsterArea.classList.remove('monster-area--spawning');
  }, 200);

  updateHPBar(monster);
}

function onCombatClick({ damage, isCrit }) {
  const monster = state.currentMonster;
  if (monster) updateHPBar(monster);
  showDamageNumber(damage, isCrit);
}

function onMonsterKilled({ monster }) {
  monsterArea.classList.add('monster-area--dead');
  monsterEmoji.textContent = monster.deathEmoji;
}

function updateHPBar(monster) {
  const pct = Math.max(0, monster.currentHealth / monster.maxHealth) * 100;
  monsterHPFill.style.width = `${pct}%`;
  monsterHPText.textContent = `${Math.max(0, Math.ceil(monster.currentHealth))} / ${monster.maxHealth}`;

  monsterHPFill.classList.remove('hp-fill--caution', 'hp-fill--critical');
  if (pct <= 25) {
    monsterHPFill.classList.add('hp-fill--critical');
  } else if (pct <= 50) {
    monsterHPFill.classList.add('hp-fill--caution');
  }
}

function showDamageNumber(damage, isCrit) {
  const el = document.createElement('div');
  el.className = 'damage-number' + (isCrit ? ' damage-number--crit' : '');
  el.textContent = isCrit ? `${damage}!` : damage;

  // Random horizontal offset for visual variety
  const offsetX = (Math.random() - 0.5) * 60;
  el.style.left = `calc(50% + ${offsetX}px)`;

  damageContainer.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, DAMAGE_NUMBER_DURATION);
}

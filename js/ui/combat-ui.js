/**
 * combat-ui.js - Combat UI
 *
 * Renders monster display, HP bar, shield bar, type indicators,
 * damage numbers, escape timer, phase indicators, death animation.
 * Subscribes to combat events, reads state, never mutates.
 *
 * @see docs/systems/ui.system.md
 */

import { on } from '../core/event-bus.js';
import { state } from '../core/game-state.js';
import { DAMAGE_NUMBER_DURATION } from '../data/constants.js';
import { showToast } from './toasts.js';
import { formatNumber } from '../services/utils.js';

// Cached DOM references
let monsterArea, monsterEmoji, monsterName, monsterLevel;
let monsterHPFill, monsterHPText, monsterHPBar;
let damageContainer;
let typeBadge, escapeTimerEl, escapeTimerText;
let shieldContainer, shieldFill, shieldText;
let bossTimerEl, bossTimerFill, bossTimerText;
let playerBars, gameContainer;

// Type badge labels
const TYPE_LABELS = {
  swift: '\u23F1 Swift',
  aggressive: '\u2757 Aggressive',
  armored: '\u{1F6E1} Armored',
  shielded: '\u{1F537} Shielded',
  regenerating: '\u{1F49A} Regen'
};

export function init() {
  monsterArea = document.getElementById('monster-area');
  monsterEmoji = document.getElementById('monster-emoji');
  monsterName = document.getElementById('monster-name');
  monsterLevel = document.getElementById('monster-level');
  monsterHPFill = document.getElementById('monster-hp-fill');
  monsterHPText = document.getElementById('monster-hp-text');
  monsterHPBar = document.getElementById('monster-hp-bar');
  damageContainer = document.getElementById('damage-container');
  typeBadge = document.getElementById('monster-type-badge');
  escapeTimerEl = document.getElementById('monster-escape-timer');
  escapeTimerText = document.getElementById('escape-timer-text');
  shieldContainer = document.getElementById('monster-shield');
  shieldFill = document.getElementById('monster-shield-fill');
  shieldText = document.getElementById('monster-shield-text');
  bossTimerEl = document.getElementById('boss-timer');
  bossTimerFill = document.getElementById('boss-timer-fill');
  bossTimerText = document.getElementById('boss-timer-text');
  playerBars = document.querySelector('.player-bars');
  gameContainer = document.querySelector('.game-container');

  on('combat:monsterSpawned', onMonsterSpawned);
  on('combat:click', onCombatClick);
  on('combat:monsterKilled', onMonsterKilled);
  on('combat:shieldBroken', onShieldBroken);
  on('combat:phaseChange', onPhaseChange);
  on('combat:monsterEscaped', onMonsterEscaped);
  on('combat:escapeTimerTick', onEscapeTimerTick);
  on('combat:monsterRegenerated', onMonsterRegenerated);
  on('combat:bossTimerStarted', onBossTimerStarted);
  on('combat:bossTimerTick', onBossTimerTick);
  on('combat:bossTimeout', onBossTimeout);
  on('player:damaged', onPlayerDamaged);
  on('player:died', onPlayerDied);
}

function hasType(monster, typeName) {
  return monster.type.split('+').includes(typeName);
}

function onMonsterSpawned({ monster }) {
  monsterEmoji.textContent = monster.emoji;
  monsterName.textContent = monster.name;
  monsterLevel.textContent = `Lv. ${monster.level}`;
  monsterArea.classList.remove('monster-area--dead', 'monster-area--warning', 'monster-area--attacking', 'monster-area--regen-pulse');
  monsterArea.classList.add('monster-area--spawning');

  // Hide boss timer for non-boss monsters (boss timer is shown via bossTimerStarted event)
  if (!monster.isBoss && bossTimerEl) {
    bossTimerEl.style.display = 'none';
  }

  setTimeout(() => {
    monsterArea.classList.remove('monster-area--spawning');
  }, 200);

  updateHPBar(monster);
  updateTypeBadge(monster);
  updateShieldBar(monster);
  updateEscapeTimer(monster);
}

function onCombatClick({ damage, isCrit, blocked }) {
  const monster = state.currentMonster;
  if (monster) {
    updateHPBar(monster);
    if (hasType(monster, 'shielded')) updateShieldBar(monster);
  }
  if (!blocked) {
    showDamageNumber(damage, isCrit);
  }
}

function onMonsterKilled({ monster }) {
  monsterArea.classList.add('monster-area--dead');
  monsterArea.classList.remove('monster-area--warning', 'monster-area--attacking', 'monster-area--regen-pulse');
  monsterEmoji.textContent = monster.deathEmoji;
  hideTypeIndicators();

  // Hide boss timer on kill
  if (bossTimerEl) bossTimerEl.style.display = 'none';
}

function onShieldBroken() {
  // Flash and hide shield bar
  if (shieldContainer) {
    shieldContainer.style.display = 'none';
  }
}

function onPhaseChange({ phase }) {
  monsterArea.classList.remove('monster-area--warning', 'monster-area--attacking');
  if (phase === 'warning') {
    monsterArea.classList.add('monster-area--warning');
  } else if (phase === 'attacking') {
    monsterArea.classList.add('monster-area--attacking');
  }
}

function onMonsterEscaped({ monster }) {
  hideTypeIndicators();
  monsterEmoji.textContent = '\u{1F4A8}'; // dash away emoji
  monsterName.textContent = `${monster.name} escaped!`;
  monsterArea.classList.add('monster-area--dead');
  showToast(`${monster.name} escaped!`, 'warning', 2000);
}

function onEscapeTimerTick({ remaining, max }) {
  if (!escapeTimerText) return;
  const secs = Math.max(0, remaining / 1000).toFixed(1);
  escapeTimerText.textContent = `${secs}s`;

  // Urgent when less than 3 seconds
  if (remaining < 3000) {
    escapeTimerEl.classList.add('monster-escape-timer--urgent');
  } else {
    escapeTimerEl.classList.remove('monster-escape-timer--urgent');
  }
}

function onMonsterRegenerated({ monsterHP, monsterMaxHP }) {
  const monster = state.currentMonster;
  if (monster) {
    updateHPBar(monster);
    monsterArea.classList.add('monster-area--regen-pulse');
    setTimeout(() => {
      monsterArea.classList.remove('monster-area--regen-pulse');
    }, 500);
  }
}

function onBossTimerStarted({ duration }) {
  if (!bossTimerEl) return;
  bossTimerEl.style.display = '';
  bossTimerFill.style.width = '100%';
  bossTimerFill.classList.remove('boss-timer-fill--caution', 'boss-timer-fill--critical');

  const secs = Math.ceil(duration / 1000);
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  bossTimerText.textContent = `${min}:${String(sec).padStart(2, '0')}`;
}

function onBossTimerTick({ remaining, duration }) {
  if (!bossTimerEl) return;

  const pct = Math.max(0, remaining / duration) * 100;
  bossTimerFill.style.width = `${pct}%`;

  const secs = Math.max(0, Math.ceil(remaining / 1000));
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  bossTimerText.textContent = `${min}:${String(sec).padStart(2, '0')}`;

  // Color transitions
  bossTimerFill.classList.remove('boss-timer-fill--caution', 'boss-timer-fill--critical');
  if (pct <= 15) {
    bossTimerFill.classList.add('boss-timer-fill--critical');
  } else if (pct <= 40) {
    bossTimerFill.classList.add('boss-timer-fill--caution');
  }
}

function onBossTimeout({ bossName }) {
  if (bossTimerEl) {
    bossTimerEl.style.display = 'none';
  }

  // Screen flash effect
  if (gameContainer) {
    gameContainer.classList.add('game-container--death-flash');
    setTimeout(() => gameContainer.classList.remove('game-container--death-flash'), 500);
  }

  showToast(`${bossName} enraged! You need more power to defeat it.`, 'warning', 4000);
  hideTypeIndicators();
}

function onPlayerDamaged({ damage, source }) {
  if (playerBars) {
    playerBars.classList.remove('player-bars--damaged');
    // Force reflow to restart animation
    void playerBars.offsetWidth;
    playerBars.classList.add('player-bars--damaged');
    setTimeout(() => playerBars.classList.remove('player-bars--damaged'), 300);
  }

  showToast(`-${damage} HP`, 'error', 1500);
}

function onPlayerDied({ goldLost, levelsLost, newLevel }) {
  // Death flash on game container
  if (gameContainer) {
    gameContainer.classList.add('game-container--death-flash');
    setTimeout(() => gameContainer.classList.remove('game-container--death-flash'), 500);
  }

  const goldStr = formatNumber(goldLost);
  let msg = `You have fallen! Lost ${goldStr} gold.`;
  if (levelsLost > 0) {
    msg += ` Level reset to ${newLevel}.`;
  }
  showToast(msg, 'error', 4000);
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

function updateTypeBadge(monster) {
  if (!typeBadge) return;

  if (monster.type === 'normal') {
    typeBadge.style.display = 'none';
    return;
  }

  // Show the primary type (first in multi-type)
  const types = monster.type.split('+');
  const primaryType = types[0];
  const label = types.length > 1
    ? types.map(t => TYPE_LABELS[t] || t).join(' + ')
    : TYPE_LABELS[primaryType] || primaryType;

  typeBadge.textContent = label;
  // Reset classes
  typeBadge.className = 'monster-type-badge';
  typeBadge.classList.add(`monster-type-badge--${primaryType}`);
  typeBadge.style.display = '';
}

function updateShieldBar(monster) {
  if (!shieldContainer) return;

  if (!hasType(monster, 'shielded') || monster.maxShield <= 0) {
    shieldContainer.style.display = 'none';
    return;
  }

  shieldContainer.style.display = '';
  const pct = Math.max(0, monster.shield / monster.maxShield) * 100;
  shieldFill.style.width = `${pct}%`;
  shieldText.textContent = `\u{1F537} ${Math.ceil(monster.shield)} / ${monster.maxShield}`;
}

function updateEscapeTimer(monster) {
  if (!escapeTimerEl) return;

  if (!hasType(monster, 'swift') || monster.maxEscapeTimer <= 0) {
    escapeTimerEl.style.display = 'none';
    return;
  }

  escapeTimerEl.style.display = '';
  escapeTimerEl.classList.remove('monster-escape-timer--urgent');
  const secs = (monster.escapeTimer / 1000).toFixed(1);
  escapeTimerText.textContent = `${secs}s`;
}

function hideTypeIndicators() {
  if (typeBadge) typeBadge.style.display = 'none';
  if (escapeTimerEl) escapeTimerEl.style.display = 'none';
  if (shieldContainer) shieldContainer.style.display = 'none';
  monsterArea.classList.remove('monster-area--warning', 'monster-area--attacking', 'monster-area--regen-pulse');
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

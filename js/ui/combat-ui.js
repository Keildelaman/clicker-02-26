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
import { SKILLS } from '../data/skills.data.js';
import { showToast } from './toasts.js';
import { formatNumber } from '../services/utils.js';

// Status effect emoji map
const EFFECT_ICONS = {
  bleed: '\u{1FA78}',   // drop of blood
  poison: '\u2620\uFE0F', // skull and crossbones
  burn: '\u{1F525}',    // fire
  slow: '\u{1F4A7}',    // droplet (ice)
  freeze: '\u2744\uFE0F'  // snowflake
};

// Cached DOM references
let monsterArea, monsterEmoji, monsterName, monsterLevel;
let monsterHPFill, monsterHPText, monsterHPBar;
let damageContainer;
let typeBadge, escapeTimerEl, escapeTimerText;
let shieldContainer, shieldFill, shieldText;
let bossTimerEl, bossTimerFill, bossTimerText;
let playerBars, gameContainer;
let executeMarker = null;
let buffRow = null;
let monsterStatusRow = null;
let playerStatusRow = null;

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
  buffRow = document.getElementById('buff-row');
  monsterStatusRow = document.getElementById('monster-status-effects');
  playerStatusRow = document.getElementById('player-status-effects');

  on('combat:monsterSpawned', onMonsterSpawned);
  on('combat:click', onCombatClick);
  on('combat:hit', onCombatHit);
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

  // Skill UI events
  on('skill:equipped', onSkillEquipChange);
  on('skill:unequipped', onSkillEquipChange);
  on('skill:buffApplied', renderBuffRow);
  on('skill:buffExpired', renderBuffRow);
  on('skill:toggleOn', renderBuffRow);
  on('skill:toggleOff', renderBuffRow);
  on('skill:hitModifierSet', renderBuffRow);
  on('skill:effectEnded', renderBuffRow);
  on('combat:hit', renderBuffRow);
  on('skill:channelStarted', renderBuffRow);
  on('skill:channelCharging', renderBuffRow);
  on('skill:channelRelease', renderBuffRow);
  on('skill:channelCancelled', renderBuffRow);

  // Status effect events
  on('statusEffect:applied', renderStatusEffects);
  on('statusEffect:expired', renderStatusEffects);
  on('statusEffect:tick', onStatusEffectTick);
  on('statusEffect:immune', onStatusEffectImmune);
  on('statusEffect:frozen', onFrozenStateChange);
  on('statusEffect:unfrozen', onFrozenStateChange);
  on('statusEffect:slowed', onSlowedStateChange);
  on('statusEffect:slowEnded', onSlowedStateChange);
  on('combat:monsterKilled', clearMonsterStatusUI);
  on('combat:monsterEscaped', clearMonsterStatusUI);
  on('combat:bossTimeout', clearMonsterStatusUI);
  on('player:died', clearPlayerStatusUI);

  // Buff/status countdown display refresh. Event subscriptions above handle
  // immediate state changes; this interval only updates duration countdowns
  // and channel charge indicators that tick continuously.
  setInterval(() => {
    if (buffRow && (buffRow.children.length > 0 || state.channelState)) renderBuffRow();
    renderStatusEffects();
  }, 100);
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
  updateExecuteMarker();
}

function onCombatClick({ blocked }) {
  const monster = state.currentMonster;
  if (monster) {
    updateHPBar(monster);
    if (hasType(monster, 'shielded')) updateShieldBar(monster);
  }
  // Damage numbers now handled by combat:hit events
}

function onCombatHit({ damage, isCrit, isSkillDamage, skillId, damageType }) {
  const monster = state.currentMonster;
  if (monster) {
    updateHPBar(monster);
    if (hasType(monster, 'shielded')) updateShieldBar(monster);
  }
  showDamageNumber(damage, isCrit, isSkillDamage, skillId, damageType);
}

function onMonsterKilled({ monster }) {
  // Hide boss timer on kill
  if (bossTimerEl) bossTimerEl.style.display = 'none';

  if (monster.isBoss) {
    // Boss kills: blocking death animation (old behavior)
    monsterArea.classList.add('monster-area--dead');
    monsterArea.classList.remove('monster-area--warning', 'monster-area--attacking', 'monster-area--regen-pulse');
    monsterEmoji.textContent = monster.deathEmoji;
    hideTypeIndicators();
  } else {
    // Non-boss kills: non-blocking death particle overlay
    showDeathParticle(monster.deathEmoji);
    monsterArea.classList.remove('monster-area--warning', 'monster-area--attacking', 'monster-area--regen-pulse');
  }
}

/**
 * Show a floating death emoji particle that fades out independently.
 * Does not block the monster area — new monster is already clickable underneath.
 */
function showDeathParticle(emoji) {
  const el = document.createElement('div');
  el.className = 'death-particle';
  el.textContent = emoji;
  monsterArea.appendChild(el);

  el.addEventListener('animationend', () => el.remove(), { once: true });
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

}

function onPlayerDied({ goldLost }) {
  // Death flash on game container
  if (gameContainer) {
    gameContainer.classList.add('game-container--death-flash');
    setTimeout(() => gameContainer.classList.remove('game-container--death-flash'), 500);
  }

  const goldStr = formatNumber(goldLost);
  showToast(`You have fallen! Lost ${goldStr} gold and XP progress.`, 'error', 4000);
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

function showDamageNumber(damage, isCrit, isSkillDamage = false, skillId = null, damageType = null) {
  const el = document.createElement('div');
  let cls = 'damage-number';
  if (isCrit) cls += ' damage-number--crit';

  if (isSkillDamage && skillId) {
    const skillDef = SKILLS[skillId];
    if (skillDef) {
      cls += ` damage-number--skill-${skillDef.category}`;
      if (skillDef.mechanic === 'channel') {
        cls += ' damage-number--skill-channel';
      }
    }
  } else if (damageType) {
    // Color by damage type when not a skill (basic attacks)
    cls += ` damage-number--${damageType}`;
  }

  el.className = cls;
  el.textContent = isCrit ? `${damage}!` : damage;

  // Random horizontal offset for visual variety
  const offsetX = (Math.random() - 0.5) * 60;
  el.style.left = `calc(50% + ${offsetX}px)`;

  damageContainer.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, DAMAGE_NUMBER_DURATION);
}

/**
 * Show a DoT tick damage number (smaller, effect-colored).
 */
function showDotDamageNumber(damage, effectId) {
  const el = document.createElement('div');
  el.className = `damage-number damage-number--dot damage-number--${effectId}`;
  el.textContent = damage;

  const offsetX = (Math.random() - 0.5) * 80;
  el.style.left = `calc(50% + ${offsetX}px)`;

  damageContainer.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// --- Execute Threshold Marker ---

function updateExecuteMarker() {
  const player = state.player;
  if (!player) return;

  const hasExecute = player.equippedActive.includes('execute');
  if (!hasExecute || !player.unlockedSkills['execute']) {
    if (executeMarker) { executeMarker.remove(); executeMarker = null; }
    return;
  }

  const level = player.unlockedSkills['execute'];
  const skillData = SKILLS['execute']?.levels[level];
  if (!skillData) return;

  if (!executeMarker) {
    executeMarker = document.createElement('div');
    executeMarker.className = 'execute-marker';
    monsterHPBar.appendChild(executeMarker);
  }

  executeMarker.style.left = `${skillData.threshold}%`;
}

function onSkillEquipChange() {
  updateExecuteMarker();
}

// --- Buff Row Rendering ---

// Track which buff keys were present last render so we only animate new ones
let previousBuffKeys = new Set();

function renderBuffRow() {
  if (!buffRow) return;
  let html = '';
  const currentKeys = new Set();

  // Hit modifier indicator (Power Strike, Execute, Shatter queued)
  if (state.hitModifier) {
    const skillDef = SKILLS[state.hitModifier.skillId];
    if (skillDef) {
      const key = `hit-${state.hitModifier.skillId}`;
      currentKeys.add(key);
      html += `<div class="buff-indicator buff-indicator--hit-mod" data-buff-key="${key}">
        <span class="buff-indicator__icon">${skillDef.icon}</span>
        <span class="buff-indicator__timer">NEXT</span>
      </div>`;
    }
  }

  // Channel indicator (Charge Up — queued or charging)
  if (state.channelState) {
    const skillDef = SKILLS[state.channelState.skillId];
    if (skillDef) {
      const key = `channel-${state.channelState.skillId}`;
      currentKeys.add(key);
      if (state.channelState.phase === 'queued') {
        // Queued: show "CHARGE" token like Power Strike's "NEXT"
        html += `<div class="buff-indicator buff-indicator--channel" data-buff-key="${key}">
          <span class="buff-indicator__icon">${skillDef.icon}</span>
          <span class="buff-indicator__timer">CHARGE</span>
        </div>`;
      } else {
        // Charging: show progress with intensity
        const elapsed = (performance.now() - state.channelState.startTime) / 1000;
        const pct = Math.min(100, Math.floor((elapsed / state.channelState.channelMax) * 100));
        let intensity = 'low';
        if (pct >= 67) intensity = 'high';
        else if (pct >= 34) intensity = 'mid';
        html += `<div class="buff-indicator buff-indicator--channel buff-indicator--charge-${intensity}" data-buff-key="${key}">
          <span class="buff-indicator__icon">${skillDef.icon}</span>
          <span class="buff-indicator__timer">${pct}%</span>
          <span class="buff-indicator__charge-bar" style="width:${pct}%"></span>
        </div>`;

        // Apply screen intensity effect to game container
        if (gameContainer) {
          gameContainer.classList.add('charging-screen');
          gameContainer.dataset.chargeIntensity = intensity;
        }
      }
    }
  } else {
    // Remove screen intensity when not charging
    if (gameContainer && gameContainer.classList.contains('charging-screen')) {
      gameContainer.classList.remove('charging-screen');
      delete gameContainer.dataset.chargeIntensity;
    }
  }

  // Click modifiers (Precision charges)
  for (const [id, mod] of Object.entries(state.clickModifiers || {})) {
    const skillDef = SKILLS[id];
    if (skillDef && mod.charges > 0) {
      const key = `click-${id}`;
      currentKeys.add(key);
      html += `<div class="buff-indicator buff-indicator--hit-mod" data-buff-key="${key}">
        <span class="buff-indicator__icon">${skillDef.icon}</span>
        <span class="buff-indicator__timer">x${mod.charges}</span>
      </div>`;
    }
  }

  // Toggle states (Momentum ON)
  for (const [id, toggle] of Object.entries(state.toggleStates || {})) {
    if (!toggle.active) continue;
    const skillDef = SKILLS[id];
    if (skillDef) {
      const key = `toggle-${id}`;
      currentKeys.add(key);
      html += `<div class="buff-indicator buff-indicator--toggle" data-buff-key="${key}">
        <span class="buff-indicator__icon">${skillDef.icon}</span>
        <span class="buff-indicator__timer">${toggle.stacks || 0}</span>
      </div>`;
    }
  }

  // Active buffs (timed — Adrenaline Rush, Flurry, Combo Artist, etc.)
  for (const [id, buff] of Object.entries(state.activeBuffs || {})) {
    const skillDef = SKILLS[id];
    if (skillDef) {
      const key = `buff-${id}`;
      currentKeys.add(key);
      html += `<div class="buff-indicator" data-buff-key="${key}">
        <span class="buff-indicator__icon">${skillDef.icon}</span>
        <span class="buff-indicator__timer">${buff.remaining.toFixed(1)}s</span>
      </div>`;
    }
  }

  buffRow.innerHTML = html;

  // Only play entry animation on newly-appeared indicators
  for (const el of buffRow.children) {
    const key = el.dataset.buffKey;
    if (key && !previousBuffKeys.has(key)) {
      el.classList.add('buff-indicator--entering');
    }
  }

  previousBuffKeys = currentKeys;
}

// --- Status Effect Indicators ---

let previousMonsterEffectKeys = new Set();
let previousPlayerEffectKeys = new Set();

function renderStatusEffects() {
  renderMonsterEffects();
  renderPlayerEffects();
}

function renderMonsterEffects() {
  if (!monsterStatusRow) return;
  const effects = state.monsterStatusEffects || [];
  if (effects.length === 0) {
    monsterStatusRow.innerHTML = '';
    previousMonsterEffectKeys = new Set();
    return;
  }

  const currentKeys = new Set();
  monsterStatusRow.innerHTML = effects.map(e => {
    const key = `monster-${e.id}`;
    currentKeys.add(key);
    const icon = EFFECT_ICONS[e.id] || '?';
    const stacks = e.stacks > 1 ? `<span class="status-effect__stacks">x${e.stacks}</span>` : '';
    const timer = `<span class="status-effect__timer">${e.remaining.toFixed(1)}s</span>`;
    return `<div class="status-effect status-effect--${e.id}" data-effect-key="${key}">
      <span class="status-effect__icon">${icon}</span>
      <span class="status-effect__info">${stacks}${timer}</span>
    </div>`;
  }).join('');

  // Only play entry animation on newly-appeared effects
  for (const el of monsterStatusRow.children) {
    const key = el.dataset.effectKey;
    if (key && !previousMonsterEffectKeys.has(key)) {
      el.classList.add('status-effect--entering');
    }
  }

  previousMonsterEffectKeys = currentKeys;
}

function renderPlayerEffects() {
  if (!playerStatusRow) return;
  const effects = state.playerStatusEffects || [];
  if (effects.length === 0) {
    playerStatusRow.innerHTML = '';
    previousPlayerEffectKeys = new Set();
    return;
  }

  const currentKeys = new Set();
  playerStatusRow.innerHTML = effects.map(e => {
    const key = `player-${e.id}`;
    currentKeys.add(key);
    const icon = EFFECT_ICONS[e.id] || '?';
    const stacks = e.stacks > 1 ? `<span class="status-effect__stacks">x${e.stacks}</span>` : '';
    const timer = `<span class="status-effect__timer">${e.remaining.toFixed(1)}s</span>`;
    return `<div class="status-effect status-effect--${e.id}" data-effect-key="${key}">
      <span class="status-effect__icon">${icon}</span>
      <span class="status-effect__info">${stacks}${timer}</span>
    </div>`;
  }).join('');

  // Only play entry animation on newly-appeared effects
  for (const el of playerStatusRow.children) {
    const key = el.dataset.effectKey;
    if (key && !previousPlayerEffectKeys.has(key)) {
      el.classList.add('status-effect--entering');
    }
  }

  previousPlayerEffectKeys = currentKeys;
}

function onStatusEffectTick({ target, effectId, damage }) {
  if (target === 'monster') {
    showDotDamageNumber(damage, effectId);
  }
}

function onStatusEffectImmune({ target, effectId, reason }) {
  if (target === 'monster') {
    const label = reason === 'shield' ? 'SHIELDED' : 'IMMUNE';
    showToast(`${label}! ${effectId} blocked`, 'info', 1500);
  }
}

function onFrozenStateChange({ target }) {
  if (target === 'monster' && monsterArea) {
    const frozen = state.currentMonster && state.currentMonster.frozen;
    monsterArea.classList.toggle('monster-area--frozen', !!frozen);
  }
}

function onSlowedStateChange({ target }) {
  if (target === 'monster' && monsterArea) {
    const slowed = state.currentMonster && state.currentMonster.slowed;
    monsterArea.classList.toggle('monster-area--slowed', !!slowed);
  }
}

function clearMonsterStatusUI() {
  if (monsterStatusRow) monsterStatusRow.innerHTML = '';
  if (monsterArea) {
    monsterArea.classList.remove('monster-area--frozen', 'monster-area--slowed');
  }
}

function clearPlayerStatusUI() {
  if (playerStatusRow) playerStatusRow.innerHTML = '';
}

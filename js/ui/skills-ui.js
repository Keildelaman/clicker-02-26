/**
 * skills-ui.js - Skills Screen & Skill Bar UI (v2)
 *
 * Renders skills screen (full screen with tabs), skill bar (4 active slots on combat screen).
 * Emits intent events for all state mutations; reads state directly.
 *
 * @see docs/design/skill-system-v2.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';
import {
  ACTIVE_SKILL_SLOTS, PASSIVE_SKILL_SLOTS,
  SP_UPGRADE_COST, RESPEC_COSTS
} from '../data/constants.js';
import { showToast } from './toasts.js';

// Category grouping constants
const CATEGORY_ORDER = ['speed', 'power', 'crit', 'mage', 'utility', 'sustain', 'combo', 'energy'];
const CATEGORY_LABELS = {
  speed: 'Speed', power: 'Power', crit: 'Critical',
  mage: 'Magic', utility: 'Utility', sustain: 'Sustain',
  combo: 'Combo', energy: 'Energy'
};
const CATEGORY_COLORS = {
  speed: '#1eff00', power: '#ff8000', crit: '#a335ee',
  mage: '#0070dd', utility: '#e6cc80', sustain: '#1eff00',
  combo: '#ff8000', energy: '#ffdd00'
};
const MECHANIC_LABELS = {
  next_click_hit: 'Hit Mod', next_click_click: 'Click Mod',
  instant: 'Instant', buff: 'Buff', channel: 'Channel',
  toggle: 'Toggle', cd_utility: 'Utility', hp_cost: 'HP Cost',
  passive: 'Passive'
};

// DOM refs
let spDisplay;
let skillsList;
let equippedContainer;
let activeTab = 'active';
let skillBarSlots = [];
let cooldownIntervalId = null;

// --- Initialization ---

export function init() {
  spDisplay = document.getElementById('skills-sp-display');
  skillsList = document.getElementById('skills-list');
  equippedContainer = document.getElementById('skills-equipped');

  // Cache skill bar slot elements
  for (let i = 0; i < ACTIVE_SKILL_SLOTS; i++) {
    skillBarSlots.push(document.getElementById(`skill-slot-${i}`));
  }

  // Tab switching
  document.querySelectorAll('.skills-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Skill bar: all skills fire on pointerdown (channel queues, others fire immediately)
  skillBarSlots.forEach((slot, i) => {
    slot.addEventListener('pointerdown', (e) => {
      const player = getPlayer();
      if (!player) return;
      const skillId = player.equippedActive[i];
      if (!skillId) return;

      // Fire intent — skills.js handles validation, cooldown, energy
      emit('skill:requestUse', { skillId });
    });
  });

  // Event subscriptions
  on('skill:unlocked', ({ skillId }) => {
    const def = SKILLS[skillId];
    if (def) showToast(`Unlocked: ${def.icon} ${def.name}!`, 'success', 2000);
    renderSkillsScreen(); renderSkillBar();
  });
  on('skill:upgraded', ({ skillId, newLevel }) => {
    const def = SKILLS[skillId];
    if (def) showToast(`${def.icon} ${def.name} \u2192 Lv.${newLevel}!`, 'success', 2000);
    renderSkillsScreen(); renderSkillBar();
  });
  on('skill:used', () => { renderSkillBar(); });
  on('skill:equipped', () => { renderSkillsScreen(); renderSkillBar(); });
  on('skill:unequipped', () => { renderSkillsScreen(); renderSkillBar(); });
  on('skill:buffApplied', () => { renderSkillBar(); });
  on('skill:buffExpired', () => { renderSkillBar(); });
  on('skill:cooldownReady', () => { renderSkillBar(); });
  on('skill:respecced', () => {
    showToast('Skills reset! SP refunded.', 'success', 3000);
    renderSkillsScreen(); renderSkillBar();
  });
  on('skill:useFailed', ({ reason }) => {
    if (reason === 'energy') {
      showToast('Not enough energy!', 'error', 1500);
    }
  });
  on('sp:gained', ({ amount, source }) => {
    const label = source === 'level' ? 'Level up' : source;
    showToast(`+${amount} Skill Points! (${label})`, 'warning', 3000);
    updateSP();
  });
  on('energy:changed', () => { renderSkillBar(); });
  on('combat:monsterSpawned', () => { renderSkillBar(); });
  on('skill:toggleOn', () => { renderSkillBar(); });
  on('skill:toggleOff', () => { renderSkillBar(); });
  on('skill:channelStarted', () => { renderSkillBar(); });
  on('skill:channelCharging', () => { renderSkillBar(); });
  on('skill:channelRelease', () => { renderSkillBar(); });
  on('skill:channelCancelled', () => { renderSkillBar(); });
  on('skill:effectEnded', () => { renderSkillBar(); });

  // Start cooldown timer update
  cooldownIntervalId = setInterval(updateCooldowns, 100);

  // Initial render
  renderSkillBar();
}

// --- Skills Screen ---

export function onShow() {
  updateSP();
  renderSkillsScreen();
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.skills-tab').forEach(t => {
    t.classList.toggle('skills-tab--active', t.dataset.tab === tab);
  });
  renderSkillsScreen();
}

function updateSP() {
  const player = getPlayer();
  if (spDisplay && player) {
    spDisplay.textContent = `SP: ${player.skillPoints}`;
  }
}

function renderSkillsScreen() {
  const player = getPlayer();
  if (!player || !skillsList) return;

  updateSP();
  renderEquippedSlots();
  renderSkillCards();
  renderRespecButton();
}

function renderEquippedSlots() {
  const player = getPlayer();
  if (!equippedContainer || !player) return;

  if (activeTab === 'active') {
    const slots = player.equippedActive.map((skillId, i) => {
      const skill = skillId ? SKILLS[skillId] : null;
      const filled = skill ? 'skills-slot--filled' : '';
      return `<div class="skills-slot ${filled}" data-slot="${i}" data-type="active">
        <span class="skills-slot__icon">${skill ? skill.icon : '+'}</span>
        <span class="skills-slot__label">${skill ? skill.name : `Slot ${i + 1}`}</span>
      </div>`;
    }).join('');
    equippedContainer.innerHTML = slots;
  } else {
    const slots = player.equippedPassive.map((skillId, i) => {
      const skill = skillId ? SKILLS[skillId] : null;
      const filled = skill ? 'skills-slot--filled' : '';
      return `<div class="skills-slot ${filled}" data-slot="${i}" data-type="passive">
        <span class="skills-slot__icon">${skill ? skill.icon : '+'}</span>
        <span class="skills-slot__label">${skill ? skill.name : `Slot ${i + 1}`}</span>
      </div>`;
    }).join('');
    equippedContainer.innerHTML = slots;
  }

  // Click to unequip
  equippedContainer.querySelectorAll('.skills-slot--filled').forEach(el => {
    el.addEventListener('click', () => {
      const slot = parseInt(el.dataset.slot);
      const type = el.dataset.type;
      if (type === 'active') {
        emit('skill:requestUnequipActive', { slot });
      } else {
        emit('skill:requestUnequipPassive', { slot });
      }
    });
  });
}

function renderSkillCards() {
  const player = getPlayer();
  if (!skillsList || !player) return;

  const filteredSkills = Object.values(SKILLS).filter(s =>
    activeTab === 'active' ? s.type === 'active' : s.type === 'passive'
  );

  // Group by category
  const grouped = {};
  for (const skill of filteredSkills) {
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category].push(skill);
  }

  // Sort within each group by unlockLevel
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a, b) => a.unlockLevel - b.unlockLevel);
  }

  let html = '';
  for (const cat of CATEGORY_ORDER) {
    if (!grouped[cat] || grouped[cat].length === 0) continue;
    const color = CATEGORY_COLORS[cat] || '#fff';
    html += `<div class="skills-tier-header" style="border-color: ${color}; color: ${color};">
      ${CATEGORY_LABELS[cat] || cat}
    </div>`;
    for (const skillDef of grouped[cat]) {
      html += renderSkillCard(skillDef, player);
    }
  }

  skillsList.innerHTML = html;

  // Wire up action buttons
  skillsList.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleSkillAction);
  });
}

function renderRespecButton() {
  const player = getPlayer();
  if (!player || !skillsList) return;

  // Only show if player has skills beyond the default power_strike
  const hasSkillsToRespec = Object.keys(player.unlockedSkills).length > 1;
  if (!hasSkillsToRespec) return;

  const costIndex = Math.min(player.respecCount, RESPEC_COSTS.length - 1);
  const cost = RESPEC_COSTS[costIndex];
  const canAfford = player.gold >= cost;

  const section = document.createElement('div');
  section.className = 'skill-respec-section';
  section.innerHTML = `<button class="skill-card__btn skill-card__btn--respec"
    ${!canAfford ? 'disabled' : ''}>
    RESPEC ALL (${cost.toLocaleString()} gold)
  </button>`;
  skillsList.appendChild(section);

  const btn = section.querySelector('button');
  if (btn && canAfford) {
    btn.addEventListener('click', () => {
      if (confirm(`Reset ALL skills for ${cost.toLocaleString()} gold?\nYou'll get your SP back.`)) {
        emit('skill:requestRespec');
      }
    });
  }
}

function renderSkillCard(skillDef, player) {
  const level = player.unlockedSkills[skillDef.id];
  const isUnlocked = level !== undefined;
  const isMaxLevel = isUnlocked && level >= skillDef.maxLevel;
  const meetsLevelReq = player.level >= skillDef.unlockLevel;

  // Check if equipped
  const isEquippedActive = player.equippedActive.includes(skillDef.id);
  const isEquippedPassive = player.equippedPassive.includes(skillDef.id);
  const isEquipped = isEquippedActive || isEquippedPassive;

  const cardClass = [
    'skill-card',
    !isUnlocked ? 'skill-card--locked' : '',
    isEquipped ? 'skill-card--equipped' : ''
  ].filter(Boolean).join(' ');

  const catColor = CATEGORY_COLORS[skillDef.category] || '#fff';

  // Description with current level values
  let desc = skillDef.description;
  const displayLevel = isUnlocked ? level : 1;
  const displayData = skillDef.levels[displayLevel];
  if (displayData) {
    desc = desc.replace(/\{(\w+)\}/g, (_, key) => {
      const val = displayData[key];
      if (val === undefined) return `{${key}}`;
      return val;
    });
  }

  // Action button
  let actionBtn = '';
  if (!isUnlocked && !meetsLevelReq) {
    // Not at required level — show lock message
    actionBtn = `<button class="skill-card__btn skill-card__btn--unlock" disabled>UNLOCKS AT LV.${skillDef.unlockLevel}</button>`;
  } else if (!isUnlocked) {
    const cost = skillDef.unlockCost;
    const canAfford = player.skillPoints >= cost;
    const costText = cost === 0 ? 'FREE' : `${cost} SP`;
    actionBtn = `<button class="skill-card__btn skill-card__btn--unlock" data-action="unlock" data-skill="${skillDef.id}" ${!canAfford ? 'disabled' : ''}>UNLOCK (${costText})</button>`;
  } else if (isEquipped) {
    const type = skillDef.type === 'active' ? 'active' : 'passive';
    actionBtn = `<button class="skill-card__btn skill-card__btn--unequip" data-action="unequip" data-skill="${skillDef.id}" data-type="${type}">UNEQUIP</button>`;
    if (!isMaxLevel) {
      const canUpgrade = player.skillPoints >= SP_UPGRADE_COST;
      actionBtn += ` <button class="skill-card__btn" data-action="upgrade" data-skill="${skillDef.id}" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${SP_UPGRADE_COST} SP)</button>`;
    }
  } else if (isMaxLevel) {
    actionBtn = `<button class="skill-card__btn" data-action="equip" data-skill="${skillDef.id}">EQUIP</button>`;
  } else {
    // Unlocked, not equipped, not max
    const canUpgrade = player.skillPoints >= SP_UPGRADE_COST;
    actionBtn = `<button class="skill-card__btn" data-action="equip" data-skill="${skillDef.id}">EQUIP</button>`;
    actionBtn += ` <button class="skill-card__btn" data-action="upgrade" data-skill="${skillDef.id}" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${SP_UPGRADE_COST} SP)</button>`;
  }

  // Info line for active skills
  let infoLine = '';
  if (skillDef.type === 'active') {
    const infoLevel = isUnlocked ? level : 1;
    const infoData = skillDef.levels[infoLevel];
    if (infoData) {
      infoLine = `<div class="skill-card__info-line">
        <span class="skill-card__energy">\u26A1 ${infoData.energyCost}</span>
        <span class="skill-card__cooldown">\u23F1 ${infoData.cooldown}s</span>
      </div>`;
    }
  }

  // Next-level stat preview
  let previewLine = '';
  if (isUnlocked && !isMaxLevel) {
    const nextLevel = level + 1;
    const nextData = skillDef.levels[nextLevel];
    const currentData = skillDef.levels[level];
    if (nextData && currentData) {
      const diffs = [];
      for (const key of Object.keys(nextData)) {
        if (key === 'cooldown' || key === 'energyCost') continue;
        const curr = currentData[key];
        const next = nextData[key];
        if (typeof next === 'number' && curr !== next) {
          const arrow = next > curr ? '\u2191' : '\u2193';
          diffs.push(`${key}: ${curr} <span class="skill-card__preview-arrow">${arrow}</span> <span class="skill-card__preview-val">${next}</span>`);
        }
      }
      if (diffs.length > 0) {
        previewLine = `<div class="skill-card__preview">${diffs.join(' &middot; ')}</div>`;
      }
    }
  }

  return `<div class="${cardClass}">
    <div class="skill-card__header">
      <span class="skill-card__icon">${skillDef.icon}</span>
      <div class="skill-card__title-area">
        <span class="skill-card__name">${skillDef.name}</span>
        <span class="skill-card__tier" style="color: ${catColor};">${skillDef.category}</span>
      </div>
      <span class="skill-card__level">${isUnlocked ? (isMaxLevel ? 'MAX' : `Lv.${level}/${skillDef.maxLevel}`) : 'LOCKED'}</span>
      <span class="skill-card__badge">${MECHANIC_LABELS[skillDef.mechanic] || ''}</span>
    </div>
    <div class="skill-card__desc">${desc}</div>
    ${infoLine}
    ${previewLine}
    <div class="skill-card__actions">${actionBtn}</div>
  </div>`;
}

function handleSkillAction(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const skillId = btn.dataset.skill;
  const player = getPlayer();
  if (!player || !skillId) return;

  const skillDef = SKILLS[skillId];
  if (!skillDef) return;

  switch (action) {
    case 'unlock': {
      emit('skill:requestUnlock', { skillId });
      break;
    }
    case 'upgrade': {
      emit('skill:requestUpgrade', { skillId });
      break;
    }
    case 'equip': {
      if (skillDef.type === 'active') {
        // Find first empty slot, or last slot
        const emptyIdx = player.equippedActive.indexOf(null);
        const slot = emptyIdx !== -1 ? emptyIdx : ACTIVE_SKILL_SLOTS - 1;
        emit('skill:requestEquipActive', { skillId, slot });
      } else {
        const emptyIdx = player.equippedPassive.indexOf(null);
        const slot = emptyIdx !== -1 ? emptyIdx : PASSIVE_SKILL_SLOTS - 1;
        emit('skill:requestEquipPassive', { skillId, slot });
      }
      break;
    }
    case 'unequip': {
      if (skillDef.type === 'active') {
        const slot = player.equippedActive.indexOf(skillId);
        if (slot !== -1) emit('skill:requestUnequipActive', { slot });
      } else {
        const slot = player.equippedPassive.indexOf(skillId);
        if (slot !== -1) emit('skill:requestUnequipPassive', { slot });
      }
      break;
    }
  }
}

// --- Skill Bar (Combat Screen) ---

function renderSkillBar() {
  const player = getPlayer();
  if (!player) return;

  for (let i = 0; i < ACTIVE_SKILL_SLOTS; i++) {
    const el = skillBarSlots[i];
    if (!el) continue;

    const skillId = player.equippedActive[i];
    if (!skillId) {
      el.className = 'skill-btn skill-btn--empty';
      el.innerHTML = '';
      el.title = `Slot ${i + 1} (empty)`;
      continue;
    }

    const skillDef = SKILLS[skillId];
    if (!skillDef) continue;

    const level = player.unlockedSkills[skillId];
    const levelData = skillDef.levels[level];
    const energyCost = levelData ? levelData.energyCost : 0;

    // Toggle active state (Momentum)
    const toggleState = state.toggleStates[skillId];
    if (toggleState && toggleState.active) {
      el.className = 'skill-btn skill-btn--toggle-on';
      el.title = `${skillDef.name} (ON)`;
      const stackText = toggleState.stacks > 0
        ? `<span class="skill-btn__stacks">${toggleState.stacks}</span>`
        : '';
      el.innerHTML = `<span class="skill-btn__icon">${skillDef.icon}</span>
        <span class="skill-btn__cost">\u26A1ON</span>
        ${stackText}`;
      continue;
    }

    // Channel state — queued or charging
    if (state.channelState && state.channelState.skillId === skillId) {
      if (state.channelState.phase === 'queued') {
        // Queued: show "CHARGE" like Power Strike shows "NEXT" indicator
        el.className = 'skill-btn skill-btn--channel-queued';
        el.title = `${skillDef.name} (Tap monster to charge!)`;
        el.innerHTML = `<span class="skill-btn__icon">${skillDef.icon}</span>
          <span class="skill-btn__cost">CHARGE</span>`;
      } else {
        // Charging: show live percentage with fill bar
        const elapsed = (performance.now() - state.channelState.startTime) / 1000;
        const pct = Math.min(100, Math.floor((elapsed / state.channelState.channelMax) * 100));
        el.className = 'skill-btn skill-btn--channeling';
        el.title = `${skillDef.name} (Charging ${pct}%)`;
        el.innerHTML = `<span class="skill-btn__icon">${skillDef.icon}</span>
          <span class="skill-btn__cost">${pct}%</span>
          <span class="skill-btn__charge-fill" style="height:${pct}%"></span>`;
      }
      continue;
    }

    const remaining = Math.max(0, player.skillCooldowns[skillId] || 0);
    const noEnergy = player.energy < energyCost;
    const onCooldown = remaining > 0;

    let cls = 'skill-btn';
    if (onCooldown) cls += ' skill-btn--cooldown';
    else if (noEnergy) cls += ' skill-btn--no-energy';

    el.className = cls;
    el.title = `${skillDef.name} (\u26A1${energyCost})`;

    let timerText = '';
    if (onCooldown) {
      timerText = `<span class="skill-btn__timer">${remaining.toFixed(1)}s</span>`;
    }

    el.innerHTML = `<span class="skill-btn__icon">${skillDef.icon}</span>
      <span class="skill-btn__cost">\u26A1${energyCost}</span>
      ${timerText}`;
  }
}

function updateCooldowns() {
  const player = getPlayer();
  if (!player || state.currentScreen !== 'combat') return;

  // Re-render during active channel (charge % updates) or active cooldowns
  if (state.channelState) {
    renderSkillBar();
    return;
  }

  let needsUpdate = false;
  for (const skillId of player.equippedActive) {
    if (!skillId) continue;
    if ((player.skillCooldowns[skillId] || 0) > 0) {
      needsUpdate = true;
      break;
    }
  }
  if (needsUpdate) renderSkillBar();
}

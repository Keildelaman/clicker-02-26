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
  SP_UPGRADE_COST, RESPEC_COSTS, BASE_SKILL_MAX_LEVEL
} from '../data/constants.js';
import { beyondMaxSkillMultiplier } from '../data/balance.js';
import { showToast } from './toasts.js';

// Category grouping constants
const CATEGORY_ORDER = ['speed', 'power', 'crit', 'mage', 'status', 'utility', 'sustain', 'combo', 'energy'];
const CATEGORY_LABELS = {
  speed: 'Speed', power: 'Power', crit: 'Critical',
  mage: 'Magic', status: 'Status', utility: 'Utility',
  sustain: 'Sustain', combo: 'Combo', energy: 'Energy'
};
const CATEGORY_COLORS = {
  speed: '#1eff00', power: '#ff8000', crit: '#a335ee',
  mage: '#0070dd', status: '#e040fb', utility: '#e6cc80',
  sustain: '#1eff00', combo: '#ff8000', energy: '#ffdd00'
};
const MECHANIC_LABELS = {
  next_click_hit: 'Hit Mod', next_click_click: 'Click Mod',
  instant: 'Instant', buff: 'Buff', channel: 'Channel',
  toggle: 'Toggle', cd_utility: 'Utility', hp_cost: 'HP Cost',
  passive: 'Passive'
};

// Status effect display info
const STATUS_EFFECT_DISPLAY = {
  bleed:  { color: 'var(--effect-bleed)',  label: 'Bleed',  icon: '\uD83E\uDE78' },
  poison: { color: 'var(--effect-poison)', label: 'Poison', icon: '\u2620' },
  burn:   { color: 'var(--effect-burn)',   label: 'Burn',   icon: '\uD83D\uDD25' },
  slow:   { color: 'var(--effect-slow)',   label: 'Slow',   icon: '\u2744' },
  freeze: { color: 'var(--effect-freeze)', label: 'Freeze', icon: '\u2748' }
};

// DOM refs
let spDisplay;
let skillsList;
let equippedContainer;
let categoryFilterContainer;
let activeTab = 'active';
let activeFilter = 'all'; // 'all' or category name
let expandedSkillId = null; // accordion: only one expanded at a time
let skillBarSlots = [];
let cooldownIntervalId = null;

// --- Initialization ---

export function init() {
  spDisplay = document.getElementById('skills-sp-display');
  skillsList = document.getElementById('skills-list');
  equippedContainer = document.getElementById('skills-equipped');
  categoryFilterContainer = document.getElementById('skills-category-filter');

  // Cache skill bar slot elements
  for (let i = 0; i < ACTIVE_SKILL_SLOTS; i++) {
    skillBarSlots.push(document.getElementById(`skill-slot-${i}`));
  }

  // Tab switching
  document.querySelectorAll('.skills-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Delegated click handler for equipped skill slots (unequip)
  if (equippedContainer) {
    equippedContainer.addEventListener('click', (e) => {
      const slot = e.target.closest('.skills-slot--filled');
      if (slot) {
        const slotIndex = parseInt(slot.dataset.slot, 10);
        const type = slot.dataset.type;
        if (type === 'active') {
          emit('skill:requestUnequipActive', { slot: slotIndex });
        } else {
          emit('skill:requestUnequipPassive', { slot: slotIndex });
        }
      }
    });
  }

  // Category filter chip clicks
  if (categoryFilterContainer) {
    categoryFilterContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.skills-filter-chip');
      if (!chip) return;
      activeFilter = chip.dataset.category;
      expandedSkillId = null;
      renderSkillsScreen();
    });
  }

  // Delegated click handler for skill cards (unlock, upgrade, equip, unequip, respec, expand)
  if (skillsList) {
    skillsList.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        handleSkillAction({ currentTarget: actionBtn });
        return;
      }
      const respecBtn = e.target.closest('.skill-card__btn--respec');
      if (respecBtn && !respecBtn.disabled) {
        const player = getPlayer();
        const costIndex = Math.min(player.respecCount, RESPEC_COSTS.length - 1);
        const cost = RESPEC_COSTS[costIndex];
        if (confirm(`Reset ALL skills for ${cost.toLocaleString()} gold?\nYou'll get your SP back.`)) {
          emit('skill:requestRespec');
        }
        return;
      }
      // Expand/collapse accordion — click on card header area
      const card = e.target.closest('.skill-card');
      if (card && !e.target.closest('.skill-card__actions') && !e.target.closest('[data-action]')) {
        const skillId = card.dataset.skillId;
        if (skillId) {
          expandedSkillId = expandedSkillId === skillId ? null : skillId;
          renderSkillCards();
          renderRespecButton();
        }
      }
    });
  }

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
  on('skill:useFailed', ({ reason, message }) => {
    if (reason === 'energy') {
      showToast('Not enough energy!', 'error', 1500);
    } else if (reason === 'condition') {
      showToast(message || 'Condition not met!', 'error', 1500);
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
  on('item:equipped', () => { renderSkillsScreen(); renderSkillBar(); });
  on('item:unequipped', () => { renderSkillsScreen(); renderSkillBar(); });

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
  activeFilter = 'all';
  expandedSkillId = null;
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
  renderCategoryFilters();
  renderEquippedSlots();
  renderSkillCards();
  renderRespecButton();
}

function renderCategoryFilters() {
  if (!categoryFilterContainer) return;

  const filteredSkills = Object.values(SKILLS).filter(s =>
    activeTab === 'active' ? s.type === 'active' : s.type === 'passive'
  );

  // Get unique categories present in current tab
  const categories = new Set(filteredSkills.map(s => s.category));

  let html = `<button class="skills-filter-chip ${activeFilter === 'all' ? 'skills-filter-chip--active' : ''}" data-category="all">All</button>`;

  for (const cat of CATEGORY_ORDER) {
    if (!categories.has(cat)) continue;
    const color = CATEGORY_COLORS[cat] || '#fff';
    const isActive = activeFilter === cat;
    html += `<button class="skills-filter-chip ${isActive ? 'skills-filter-chip--active' : ''}" data-category="${cat}" style="${isActive ? `background:${color}33; border-color:${color}; color:${color}` : `border-color:${color}40; color:${color}90`}">${CATEGORY_LABELS[cat] || cat}</button>`;
  }

  categoryFilterContainer.innerHTML = html;
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

}

function renderSkillCards() {
  const player = getPlayer();
  if (!skillsList || !player) return;

  let filteredSkills = Object.values(SKILLS).filter(s =>
    activeTab === 'active' ? s.type === 'active' : s.type === 'passive'
  );

  // Apply category filter
  if (activeFilter !== 'all') {
    filteredSkills = filteredSkills.filter(s => s.category === activeFilter);
  }

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
    // Only show category headers when showing all
    if (activeFilter === 'all') {
      html += `<div class="skills-tier-header" style="border-color: ${color}; color: ${color};">
        ${CATEGORY_LABELS[cat] || cat}
      </div>`;
    }
    for (const skillDef of grouped[cat]) {
      const isExpanded = expandedSkillId === skillDef.id;
      html += renderSkillCard(skillDef, player, isExpanded);
    }
  }

  skillsList.innerHTML = html;
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
}

/**
 * Build status effect dot indicators (compact mode) or full badges (expanded mode).
 */
function renderStatusDots(skillDef) {
  const dots = [];
  // Direct status effect on skill
  if (skillDef.statusEffect) {
    const se = STATUS_EFFECT_DISPLAY[skillDef.statusEffect.type];
    if (se) {
      dots.push(`<span class="skill-card__status-dot" style="background:${se.color}" title="${se.label}${skillDef.statusEffect.chance < 1 ? ` ${Math.round(skillDef.statusEffect.chance * 100)}%` : ''}"></span>`);
    }
  }
  // Multi-status from tags or known skill mechanics
  if (skillDef.id === 'plague_touch') {
    dots.push(`<span class="skill-card__status-dot" style="background:var(--effect-bleed)" title="Bleed"></span>`);
    dots.push(`<span class="skill-card__status-dot" style="background:var(--effect-poison)" title="Poison"></span>`);
    dots.push(`<span class="skill-card__status-dot" style="background:var(--effect-slow)" title="Slow"></span>`);
  }
  // Status-interacting skills (condition-based)
  if (skillDef.condition?.requiresStatus) {
    const se = STATUS_EFFECT_DISPLAY[skillDef.condition.requiresStatus];
    if (se && !dots.length) {
      dots.push(`<span class="skill-card__status-dot skill-card__status-dot--req" style="border-color:${se.color}" title="Requires ${se.label}"></span>`);
    }
  }
  // Specific skills that interact with status effects
  const statusSkills = { inferno: 'burn', immolate: 'burn', envenom: 'poison', frost_nova: 'freeze', frostbolt: 'slow', deep_chill: 'freeze', glacial_shatter: 'slow' };
  if (statusSkills[skillDef.id] && !dots.length) {
    const se = STATUS_EFFECT_DISPLAY[statusSkills[skillDef.id]];
    if (se) dots.push(`<span class="skill-card__status-dot" style="background:${se.color}" title="${se.label}"></span>`);
  }
  return dots.join('');
}

function renderStatusBadges(skillDef) {
  const badges = [];
  if (skillDef.statusEffect) {
    const se = STATUS_EFFECT_DISPLAY[skillDef.statusEffect.type];
    if (se) {
      const chanceText = skillDef.statusEffect.chance < 1 ? ` ${Math.round(skillDef.statusEffect.chance * 100)}%` : '';
      const stackText = skillDef.statusEffect.stacks > 1 ? ` (${skillDef.statusEffect.stacks} stacks)` : '';
      badges.push(`<span class="skill-card__status-badge" style="background:${se.color}22; border-color:${se.color}; color:${se.color}">${se.icon}${chanceText} ${se.label}${stackText}</span>`);
    }
  }
  if (skillDef.condition) {
    if (skillDef.condition.requiresStatus) {
      const se = STATUS_EFFECT_DISPLAY[skillDef.condition.requiresStatus];
      if (se) {
        const minStacks = skillDef.condition.minStacks ? ` ${skillDef.condition.minStacks}+` : '';
        badges.push(`<span class="skill-card__condition-badge">${se.icon} Requires${minStacks} ${se.label}</span>`);
      }
    }
    if (skillDef.condition.requiresStatusCount) {
      badges.push(`<span class="skill-card__condition-badge">Requires ${skillDef.condition.requiresStatusCount}+ effects</span>`);
    }
  }
  return badges.join(' ');
}

function renderSkillCard(skillDef, player, isExpanded) {
  const level = player.unlockedSkills[skillDef.id];
  const isUnlocked = level !== undefined;
  const isMaxLevel = isUnlocked && level >= skillDef.maxLevel;
  const bonus = (state.skillBonusLevels && state.skillBonusLevels[skillDef.id]) || 0;
  const effectiveLevel = (state.effectiveSkillLevels && state.effectiveSkillLevels[skillDef.id]) || level || 0;
  const maxLevel = skillDef.maxLevel || BASE_SKILL_MAX_LEVEL;

  // Check if equipped
  const isEquippedActive = player.equippedActive.includes(skillDef.id);
  const isEquippedPassive = player.equippedPassive.includes(skillDef.id);
  const isEquipped = isEquippedActive || isEquippedPassive;

  const catColor = CATEGORY_COLORS[skillDef.category] || '#fff';

  const cardClass = [
    'skill-card',
    !isUnlocked ? 'skill-card--locked' : '',
    isEquipped ? 'skill-card--equipped' : '',
    isExpanded ? 'skill-card--expanded' : ''
  ].filter(Boolean).join(' ');

  // Description with effective level values
  let desc = skillDef.description;
  const cappedEffective = isUnlocked ? Math.min(effectiveLevel, maxLevel) : 1;
  const displayData = skillDef.levels[cappedEffective] || skillDef.levels[1];
  const bmMult = isUnlocked ? beyondMaxSkillMultiplier(effectiveLevel, maxLevel) : 1;
  if (displayData) {
    desc = desc.replace(/\{(\w+)\}/g, (_, key) => {
      const val = displayData[key];
      if (val === undefined) return `{${key}}`;
      if (typeof val !== 'number') return val;
      if (key === 'cooldown' || key === 'energyCost') return val;
      if (bmMult !== 1) {
        const scaled = Number.isInteger(val) ? Math.floor(val * bmMult) : +(val * bmMult).toFixed(1);
        return scaled;
      }
      return val;
    });
  }

  // Level display
  const levelText = isUnlocked
    ? (isMaxLevel && !bonus ? 'MAX' : `Lv.${level}/${skillDef.maxLevel}${bonus > 0 ? ` <span class="skill-card__level-bonus">(+${bonus})</span>` : ''}`)
    : `Lv.${skillDef.unlockLevel}`;

  // Status dots for compact view
  const statusDots = renderStatusDots(skillDef);
  const statusDotsHtml = statusDots ? `<span class="skill-card__status-dots">${statusDots}</span>` : '';

  // --- COMPACT VIEW (always shown) ---
  let compactHtml = `<div class="skill-card__compact">
    <span class="skill-card__icon">${skillDef.icon}</span>
    <div class="skill-card__title-area">
      <span class="skill-card__name">${skillDef.name}</span>
      <span class="skill-card__meta">
        <span class="skill-card__tier" style="color: ${catColor};">${skillDef.category}</span>
        <span class="skill-card__badge">${MECHANIC_LABELS[skillDef.mechanic] || ''}</span>
        ${statusDotsHtml}
      </span>
    </div>
    <span class="skill-card__level">${levelText}</span>
  </div>`;

  // --- EXPANDED VIEW (only if expanded) ---
  let expandedHtml = '';
  if (isExpanded) {
    // Status badges
    const statusBadgesHtml = renderStatusBadges(skillDef);
    const statusLine = statusBadgesHtml ? `<div class="skill-card__status-line">${statusBadgesHtml}</div>` : '';

    // Damage type badge
    let dtypeBadge = '';
    if (skillDef.damageType) {
      const dtLabel = skillDef.damageType === 'physical' ? '\u2694 Physical' : '\u2728 Magic';
      dtypeBadge = `<span class="skill-card__dtype skill-card__dtype--${skillDef.damageType}">${dtLabel}</span>`;
    }

    // Info line for active skills
    let infoLine = '';
    if (skillDef.type === 'active') {
      const infoLevel = isUnlocked ? Math.min(effectiveLevel, maxLevel) : 1;
      const infoData = skillDef.levels[infoLevel];
      if (infoData) {
        infoLine = `<div class="skill-card__info-line">
          <span class="skill-card__energy">\u26A1 ${infoData.energyCost}</span>
          <span class="skill-card__cooldown">\u23F1 ${infoData.cooldown}s</span>
          ${dtypeBadge}
        </div>`;
      }
    }

    // Next-level stat preview
    let previewLine = '';
    if (isUnlocked && !isMaxLevel) {
      const currCapped = Math.min(effectiveLevel, maxLevel);
      const currentData = skillDef.levels[currCapped];
      const currBmMult = bmMult;
      const nextEffective = (level + 1) + bonus;
      const nextCapped = Math.min(nextEffective, maxLevel);
      const nextData = skillDef.levels[nextCapped];
      const nextBmMult = beyondMaxSkillMultiplier(nextEffective, maxLevel);

      if (nextData && currentData) {
        const diffs = [];
        for (const key of Object.keys(nextData)) {
          if (key === 'cooldown' || key === 'energyCost') continue;
          const rawCurr = currentData[key];
          const rawNext = nextData[key];
          if (typeof rawNext !== 'number' || typeof rawCurr !== 'number') continue;
          const curr = Number.isInteger(rawCurr) ? Math.floor(rawCurr * currBmMult) : +(rawCurr * currBmMult).toFixed(1);
          const next = Number.isInteger(rawNext) ? Math.floor(rawNext * nextBmMult) : +(rawNext * nextBmMult).toFixed(1);
          if (curr !== next) {
            const arrow = next > curr ? '\u2191' : '\u2193';
            diffs.push(`${key}: ${curr} <span class="skill-card__preview-arrow">${arrow}</span> <span class="skill-card__preview-val">${next}</span>`);
          }
        }
        if (diffs.length > 0) {
          previewLine = `<div class="skill-card__preview">${diffs.join(' &middot; ')}</div>`;
        }
      }
    }

    // Action buttons
    let actionBtn = '';
    if (!isUnlocked) {
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
      const canUpgrade = player.skillPoints >= SP_UPGRADE_COST;
      actionBtn = `<button class="skill-card__btn" data-action="equip" data-skill="${skillDef.id}">EQUIP</button>`;
      actionBtn += ` <button class="skill-card__btn" data-action="upgrade" data-skill="${skillDef.id}" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${SP_UPGRADE_COST} SP)</button>`;
    }

    expandedHtml = `<div class="skill-card__expanded">
      <div class="skill-card__desc">${desc}</div>
      ${statusLine}
      ${infoLine}
      ${previewLine}
      <div class="skill-card__actions">${actionBtn}</div>
    </div>`;
  }

  return `<div class="${cardClass}" data-skill-id="${skillDef.id}">
    ${compactHtml}
    ${expandedHtml}
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

    const effLevel = (state.effectiveSkillLevels && state.effectiveSkillLevels[skillId]) || player.unlockedSkills[skillId] || 1;
    const barMaxLevel = skillDef.maxLevel || BASE_SKILL_MAX_LEVEL;
    const barCappedLevel = Math.min(effLevel, barMaxLevel);
    const levelData = skillDef.levels[barCappedLevel];
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

    // Check condition for conditional skills
    let conditionNotMet = false;
    if (skillDef.condition && !onCooldown) {
      conditionNotMet = !checkConditionMet(skillDef.condition);
    }

    let cls = 'skill-btn';
    if (onCooldown) cls += ' skill-btn--cooldown';
    else if (conditionNotMet) cls += ' skill-btn--condition-not-met';
    else if (noEnergy) cls += ' skill-btn--no-energy';

    if (skillDef.damageType) cls += ' skill-btn--dtype-' + skillDef.damageType;
    el.className = cls;
    el.title = `${skillDef.name} (\u26A1${energyCost})`;

    let timerText = '';
    if (onCooldown) {
      timerText = `<span class="skill-btn__timer">${remaining.toFixed(1)}s</span>`;
    }

    // Lock icon for condition-gated skills
    let lockIcon = '';
    if (conditionNotMet) {
      lockIcon = `<span class="skill-btn__lock">\uD83D\uDD12</span>`;
    }

    el.innerHTML = `<span class="skill-btn__icon">${skillDef.icon}</span>
      <span class="skill-btn__cost">\u26A1${energyCost}</span>
      ${timerText}${lockIcon}`;
  }
}

/**
 * Check if a skill condition is met (UI-side, reads state directly).
 */
function checkConditionMet(condition) {
  if (!condition) return true;
  const effects = state.monsterStatusEffects || [];
  if (condition.requiresStatusCount) {
    const unique = new Set(effects.map(e => e.id));
    return unique.size >= condition.requiresStatusCount;
  }
  if (condition.requiresStatus) {
    const effect = effects.find(e => e.id === condition.requiresStatus);
    if (!effect) return false;
    if (condition.minStacks && effect.stacks < condition.minStacks) return false;
    return true;
  }
  return true;
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

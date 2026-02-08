/**
 * skills-ui.js - Skills Screen & Skill Bar UI
 *
 * Renders skills screen (full screen with tabs), skill bar (4 active slots on combat screen).
 * Calls skills.js for all state mutations.
 *
 * @see docs/systems/skill.system.md
 * @see docs/data/skills.data.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { SKILLS, SKILL_TIERS, TIER_ORDER, TIER_COLORS } from '../data/skills.data.js';
import {
  ACTIVE_SKILL_SLOTS, PASSIVE_SKILL_SLOTS, BASE_SKILL_MAX_LEVEL,
  SKILL_UPGRADE_COSTS
} from '../data/constants.js';
import * as skills from '../systems/skills.js';
import { showToast } from './toasts.js';

// DOM refs
let mpDisplay;
let skillsList;
let equippedContainer;
let activeTab = 'active';
let skillBarSlots = [];
let cooldownIntervalId = null;

// --- Initialization ---

export function init() {
  mpDisplay = document.getElementById('skills-mp-display');
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

  // Skill bar clicks
  skillBarSlots.forEach((slot, i) => {
    slot.addEventListener('click', () => {
      const player = getPlayer();
      if (!player) return;
      const skillId = player.equippedActiveSkills[i];
      if (skillId) {
        const result = skills.useSkill(skillId);
        if (!result) {
          // Check why it failed for feedback
          const remaining = skills.getSkillCooldownRemaining(skillId);
          if (remaining > 0) {
            // On cooldown — no toast, UI shows timer
          } else if (player.energy < SKILLS[skillId].energyCost) {
            showToast('Not enough energy!', 'error', 1500);
          }
        }
      }
    });
  });

  // Event subscriptions
  on('skill:unlocked', () => { renderSkillsScreen(); renderSkillBar(); });
  on('skill:upgraded', () => { renderSkillsScreen(); renderSkillBar(); });
  on('skill:used', () => { renderSkillBar(); });
  on('skill:equipped', () => { renderSkillsScreen(); renderSkillBar(); });
  on('skill:unequipped', () => { renderSkillsScreen(); renderSkillBar(); });
  on('skill:buffApplied', () => { renderSkillBar(); });
  on('skill:buffExpired', () => { renderSkillBar(); });
  on('skill:cooldownReady', () => { renderSkillBar(); });
  on('mastery:gained', ({ amount, source }) => {
    const label = source === 'boss' ? 'Boss defeated' : `Level milestone`;
    showToast(`+${amount} Mastery Points! (${label})`, 'warning', 3000);
    updateMP();
  });
  on('energy:changed', () => { renderSkillBar(); });
  on('combat:monsterSpawned', () => { renderSkillBar(); });

  // Start cooldown timer update
  cooldownIntervalId = setInterval(updateCooldowns, 250);

  // Initial render
  renderSkillBar();
}

// --- Skills Screen ---

export function onShow() {
  updateMP();
  renderSkillsScreen();
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.skills-tab').forEach(t => {
    t.classList.toggle('skills-tab--active', t.dataset.tab === tab);
  });
  renderSkillsScreen();
}

function updateMP() {
  const player = getPlayer();
  if (mpDisplay && player) {
    mpDisplay.textContent = `MP: ${player.masteryPoints}`;
  }
}

function renderSkillsScreen() {
  const player = getPlayer();
  if (!player || !skillsList) return;

  updateMP();
  renderEquippedSlots();
  renderSkillCards();
}

function renderEquippedSlots() {
  const player = getPlayer();
  if (!equippedContainer || !player) return;

  if (activeTab === 'active') {
    const slots = player.equippedActiveSkills.map((skillId, i) => {
      const skill = skillId ? SKILLS[skillId] : null;
      const filled = skill ? 'skills-slot--filled' : '';
      return `<div class="skills-slot ${filled}" data-slot="${i}" data-type="active">
        <span class="skills-slot__icon">${skill ? skill.icon : '+'}</span>
        <span class="skills-slot__label">${skill ? skill.name : `Slot ${i + 1}`}</span>
      </div>`;
    }).join('');
    equippedContainer.innerHTML = slots;
  } else {
    const slots = player.equippedPassiveSkills.map((skillId, i) => {
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
        skills.unequipActiveSkill(slot);
      } else {
        skills.unequipPassiveSkill(slot);
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

  // Group by tier
  let html = '';
  for (const tierName of TIER_ORDER) {
    const tierSkills = filteredSkills.filter(s => s.tier === tierName);
    if (tierSkills.length === 0) continue;

    const tierColor = TIER_COLORS[tierName] || '#fff';
    html += `<div class="skills-tier-header" style="color: ${tierColor}; border-color: ${tierColor};">${tierName.toUpperCase()}</div>`;

    for (const skillDef of tierSkills) {
      html += renderSkillCard(skillDef, player);
    }
  }

  skillsList.innerHTML = html;

  // Wire up action buttons
  skillsList.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleSkillAction);
  });
}

function renderSkillCard(skillDef, player) {
  const isUnlocked = player.unlockedSkills.includes(skillDef.id);
  const skillState = player.skills[skillDef.id];
  const level = skillState ? skillState.level : 0;
  const isMaxLevel = level >= BASE_SKILL_MAX_LEVEL;

  // Check if equipped
  const isEquippedActive = player.equippedActiveSkills.includes(skillDef.id);
  const isEquippedPassive = player.equippedPassiveSkills.includes(skillDef.id);
  const isEquipped = isEquippedActive || isEquippedPassive;

  const cardClass = [
    'skill-card',
    !isUnlocked ? 'skill-card--locked' : '',
    isEquipped ? 'skill-card--equipped' : ''
  ].filter(Boolean).join(' ');

  const tierColor = TIER_COLORS[skillDef.tier] || '#fff';

  // Description with current level values
  let desc = skillDef.description;
  if (isUnlocked && skillDef.levels[level]) {
    const data = skillDef.levels[level];
    desc = desc.replace(/\{(\w+)\}/g, (_, key) => {
      const val = data[key];
      if (val === undefined) return `{${key}}`;
      if (typeof val === 'number' && val < 1 && val > 0) return `${Math.round(val * 100)}`;
      if (typeof val === 'number' && key.includes('duration')) return `${val / 1000}`;
      return val;
    });
  } else if (skillDef.levels[1]) {
    const data = skillDef.levels[1];
    desc = desc.replace(/\{(\w+)\}/g, (_, key) => {
      const val = data[key];
      if (val === undefined) return `{${key}}`;
      if (typeof val === 'number' && val < 1 && val > 0) return `${Math.round(val * 100)}`;
      if (typeof val === 'number' && key.includes('duration')) return `${val / 1000}`;
      return val;
    });
  }

  // Action button
  let actionBtn = '';
  if (!isUnlocked) {
    const cost = skillDef.unlockCost;
    const canAfford = player.masteryPoints >= cost;
    const costText = cost === 0 ? 'FREE' : `${cost} MP`;
    actionBtn = `<button class="skill-card__btn skill-card__btn--unlock" data-action="unlock" data-skill="${skillDef.id}" ${!canAfford ? 'disabled' : ''}>UNLOCK (${costText})</button>`;
  } else if (isEquipped) {
    const type = skillDef.type === 'active' ? 'active' : 'passive';
    actionBtn = `<button class="skill-card__btn skill-card__btn--unequip" data-action="unequip" data-skill="${skillDef.id}" data-type="${type}">UNEQUIP</button>`;
    if (!isMaxLevel) {
      const upgradeCost = SKILL_UPGRADE_COSTS[level - 1];
      const canUpgrade = player.masteryPoints >= upgradeCost;
      actionBtn += ` <button class="skill-card__btn" data-action="upgrade" data-skill="${skillDef.id}" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${upgradeCost} MP)</button>`;
    }
  } else if (isMaxLevel) {
    actionBtn = `<button class="skill-card__btn" data-action="equip" data-skill="${skillDef.id}">EQUIP</button>`;
  } else {
    // Unlocked, not equipped, not max
    const upgradeCost = SKILL_UPGRADE_COSTS[level - 1];
    const canUpgrade = player.masteryPoints >= upgradeCost;
    actionBtn = `<button class="skill-card__btn" data-action="equip" data-skill="${skillDef.id}">EQUIP</button>`;
    actionBtn += ` <button class="skill-card__btn" data-action="upgrade" data-skill="${skillDef.id}" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${upgradeCost} MP)</button>`;
  }

  // Info line for active skills
  let infoLine = '';
  if (skillDef.type === 'active') {
    infoLine = `<div class="skill-card__info-line">
      <span class="skill-card__energy">\u26A1 ${skillDef.energyCost}</span>
      <span class="skill-card__cooldown">\u23F1 ${skillDef.cooldown / 1000}s</span>
    </div>`;
  }

  return `<div class="${cardClass}">
    <div class="skill-card__header">
      <span class="skill-card__icon">${skillDef.icon}</span>
      <div class="skill-card__title-area">
        <span class="skill-card__name">${skillDef.name}</span>
        <span class="skill-card__tier" style="color: ${tierColor};">${skillDef.tier}</span>
      </div>
      <span class="skill-card__level">${isUnlocked ? (isMaxLevel ? 'MAX' : `Lv.${level}/${BASE_SKILL_MAX_LEVEL}`) : 'LOCKED'}</span>
    </div>
    <div class="skill-card__desc">${desc}</div>
    ${infoLine}
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
      const ok = skills.unlockSkill(skillId);
      if (ok) showToast(`Unlocked: ${skillDef.icon} ${skillDef.name}!`, 'success', 2000);
      break;
    }
    case 'upgrade': {
      const ok = skills.upgradeSkill(skillId);
      if (ok) {
        const newLvl = player.skills[skillId].level;
        showToast(`${skillDef.icon} ${skillDef.name} \u2192 Lv.${newLvl}!`, 'success', 2000);
      }
      break;
    }
    case 'equip': {
      if (skillDef.type === 'active') {
        // Find first empty slot, or last slot
        const emptyIdx = player.equippedActiveSkills.indexOf(null);
        const slot = emptyIdx !== -1 ? emptyIdx : ACTIVE_SKILL_SLOTS - 1;
        skills.equipActiveSkill(skillId, slot);
      } else {
        const emptyIdx = player.equippedPassiveSkills.indexOf(null);
        const slot = emptyIdx !== -1 ? emptyIdx : PASSIVE_SKILL_SLOTS - 1;
        skills.equipPassiveSkill(skillId, slot);
      }
      break;
    }
    case 'unequip': {
      if (skillDef.type === 'active') {
        const slot = player.equippedActiveSkills.indexOf(skillId);
        if (slot !== -1) skills.unequipActiveSkill(slot);
      } else {
        const slot = player.equippedPassiveSkills.indexOf(skillId);
        if (slot !== -1) skills.unequipPassiveSkill(slot);
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

    const skillId = player.equippedActiveSkills[i];
    if (!skillId) {
      el.className = 'skill-btn skill-btn--empty';
      el.innerHTML = '';
      el.title = `Slot ${i + 1} (empty)`;
      continue;
    }

    const skillDef = SKILLS[skillId];
    if (!skillDef) continue;

    const remaining = skills.getSkillCooldownRemaining(skillId);
    const noEnergy = player.energy < skillDef.energyCost;
    const onCooldown = remaining > 0;

    let cls = 'skill-btn';
    if (onCooldown) cls += ' skill-btn--cooldown';
    else if (noEnergy) cls += ' skill-btn--no-energy';

    el.className = cls;
    el.title = `${skillDef.name} (\u26A1${skillDef.energyCost})`;

    let timerText = '';
    if (onCooldown) {
      timerText = `<span class="skill-btn__timer">${(remaining / 1000).toFixed(1)}s</span>`;
    }

    el.innerHTML = `<span class="skill-btn__icon">${skillDef.icon}</span>
      <span class="skill-btn__cost">\u26A1${skillDef.energyCost}</span>
      ${timerText}`;
  }
}

function updateCooldowns() {
  const player = getPlayer();
  if (!player || state.currentScreen !== 'combat') return;

  let needsUpdate = false;
  for (const skillId of player.equippedActiveSkills) {
    if (!skillId) continue;
    if (skills.getSkillCooldownRemaining(skillId) > 0) {
      needsUpdate = true;
      break;
    }
  }
  if (needsUpdate) renderSkillBar();
}

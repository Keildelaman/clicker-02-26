/**
 * tooltip.js - Mobile Long-Press Tooltip System
 *
 * Shows contextual info panels on touch-and-hold (mobile) or hover (desktop)
 * for any element with a data-tooltip attribute.
 *
 * Usage: Add data-tooltip="type:id" to any element.
 * Supported types: stat, bar, skill, item, monster-type, buff, status, equip
 *
 * Pure UI module — reads from state and data, never mutates game state.
 *
 * @see docs/systems/ui.system.md
 */

import { state, getPlayer } from '../core/game-state.js';
import { SKILLS } from '../data/skills.data.js';
import { ITEMS } from '../data/items.data.js';

// --- Configuration ---
const LONG_PRESS_DELAY = 400;  // ms before tooltip appears
const HOVER_DELAY = 600;       // ms before desktop hover tooltip
const MOVE_THRESHOLD = 10;     // px — cancel if finger drifts

// --- Static tooltip content ---

const STAT_TOOLTIPS = {
  attack: {
    title: 'Attack Power',
    icon: '\u2694\uFE0F',
    body: 'Physical damage dealt per click. Increased by weapons, passive skills, and level-based bonuses.'
  },
  magic: {
    title: 'Magic Power',
    icon: '\uD83D\uDD2E',
    body: 'Increases damage of magic-type skills like Arcane Bolt and Inferno. Gained from equipment and passive bonuses.'
  },
  armor: {
    title: 'Armor',
    icon: '\uD83D\uDEE1\uFE0F',
    body: 'Reduces physical damage taken from aggressive and swift monsters. Gained from armor equipment and level.'
  },
  gold: {
    title: 'Gold',
    icon: '\uD83D\uDCB0',
    body: 'Currency for buying equipment and refreshing the shop. Earned from monster kills. 50% lost on death.'
  }
};

const BAR_TOOLTIPS = {
  hp: {
    title: 'Health Points',
    icon: '\u2764\uFE0F',
    body: 'Your life force. Regenerates slowly over time. If HP reaches 0, you die and lose gold and XP progress.'
  },
  energy: {
    title: 'Energy',
    icon: '\u26A1',
    body: 'Resource used to cast active skills. Gained from clicking monsters (+3) and killing them (+10). Regenerates at 1/sec.'
  },
  xp: {
    title: 'Experience',
    icon: '\u2728',
    body: 'Fill the XP bar to level up. Gain skill points every 3 levels. Higher levels unlock new skills and zones.'
  },
  shield: {
    title: 'Shield',
    icon: '\uD83D\uDEE1\uFE0F',
    body: 'Temporary barrier that absorbs damage before HP. Granted by Iron Guard skill. Decays over time.'
  }
};

const MONSTER_TYPE_TOOLTIPS = {
  swift: {
    title: 'Swift',
    icon: '\u23F1\uFE0F',
    body: 'Has an escape timer. Kill it before time runs out or it flees and deals 5% of your max HP as damage.'
  },
  aggressive: {
    title: 'Aggressive',
    icon: '\u2757',
    body: 'Attacks in cycles: idle \u2192 warning \u2192 attack. Stop clicking during the red "STOP!" phase or take 10% max HP damage.'
  },
  armored: {
    title: 'Armored',
    icon: '\uD83D\uDEE1',
    body: 'Has flat damage reduction on every hit. Use high single-hit damage or magic damage to bypass armor.'
  },
  shielded: {
    title: 'Shielded',
    icon: '\uD83D\uDD37',
    body: 'Has a separate shield bar that absorbs damage first. While shielded, also takes reduced damage.'
  },
  regenerating: {
    title: 'Regenerating',
    icon: '\uD83D\uDC9A',
    body: 'Recovers HP over time. You need to deal damage faster than it heals. Status effects like bleed and poison help counter regen.'
  }
};

const STATUS_TOOLTIPS = {
  bleed: {
    title: 'Bleed',
    icon: '\uD83E\uDE78',
    body: 'Physical DoT. Deals 5% of your ATK per stack each second. Stacks up to 5 times. Lasts 4 seconds.'
  },
  poison: {
    title: 'Poison',
    icon: '\u2620\uFE0F',
    body: 'Physical DoT. Deals 3% of your ATK per stack each second. Stacks up to 10 times. Lasts 5 seconds.'
  },
  burn: {
    title: 'Burn',
    icon: '\uD83D\uDD25',
    body: 'Magic DoT. Deals 10% of Magic Power every 0.5s. Does not stack but refreshes duration. Lasts 3.5 seconds.'
  },
  slow: {
    title: 'Slow',
    icon: '\uD83D\uDCA7',
    body: 'Reduces monster action speed by 30% for 4 seconds. Slows escape timers, attack cycles, and regen rate.'
  },
  freeze: {
    title: 'Freeze',
    icon: '\u2744\uFE0F',
    body: 'Completely stuns the monster for 1.5 seconds. Cannot be reapplied for 5 seconds after expiring.'
  }
};

const EQUIP_SLOT_TOOLTIPS = {
  weapon: {
    title: 'Weapon Slot',
    icon: '\u2694\uFE0F',
    body: 'Equip a weapon here to increase your Attack Power. Higher rarity weapons provide more stats.'
  },
  armor: {
    title: 'Armor Slot',
    icon: '\uD83D\uDEE1\uFE0F',
    body: 'Equip armor to gain Armor, HP, and other defensive stats. Reduces damage from monster attacks.'
  },
  accessory: {
    title: 'Accessory Slot',
    icon: '\uD83D\uDC8D',
    body: 'Equip an accessory for bonus stats like Crit Chance, Gold Find, XP Bonus, or Energy Gain.'
  }
};

const STAT_LABELS = {
  attack: 'ATK',
  magicPower: 'Magic',
  critChance: 'Crit%',
  critDamage: 'CritDmg',
  maxHP: 'HP',
  hpRegen: 'HP Regen',
  armor: 'Armor',
  magicResist: 'MR',
  armorPen: 'Armor Pen',
  magicPen: 'Magic Pen',
  goldFind: 'Gold Find',
  xpBonus: 'XP Bonus',
  energyGain: 'Energy'
};

const MECHANIC_LABELS = {
  next_click_hit: 'Hit Modifier',
  next_click_click: 'Click Modifier',
  instant: 'Instant',
  buff: 'Buff',
  channel: 'Channel',
  toggle: 'Toggle',
  cd_utility: 'Utility',
  hp_cost: 'HP Cost',
  passive: 'Passive'
};

// --- Module state ---
let tooltipEl = null;
let pressTimer = null;
let startX = 0;
let startY = 0;
let isShowing = false;
let preventNextClick = false;
let hoverTimer = null;
let currentHoverTarget = null;

// --- Initialization ---

export function init() {
  tooltipEl = document.getElementById('tooltip-panel');
  if (!tooltipEl) return;

  const container = document.querySelector('.game-container');

  // Touch: long-press detection via event delegation
  container.addEventListener('touchstart', onTouchStart, { passive: false });
  container.addEventListener('touchmove', onTouchMove, { passive: true });
  container.addEventListener('touchend', onTouchEnd);
  container.addEventListener('touchcancel', onTouchEnd);

  // Block click after long-press (capture phase intercepts before action handlers)
  container.addEventListener('click', onClickCapture, true);

  // Prevent browser context menu on long-press for tooltip targets
  container.addEventListener('contextmenu', (e) => {
    if (e.target.closest('[data-tooltip]')) {
      e.preventDefault();
    }
  });

  // Desktop: hover with delay via delegation
  container.addEventListener('mouseover', onMouseOver);
  container.addEventListener('mouseout', onMouseOut);

  // Hide tooltip on scroll (for scrollable panels like shop/inventory)
  container.addEventListener('scroll', () => { if (isShowing) hide(); }, true);
}

// --- Touch handlers ---

function onTouchStart(e) {
  const target = e.target.closest('[data-tooltip]');
  if (!target) return;

  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;

  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    // Prevent default to stop context menus / text selection on this long-press
    show(target);
  }, LONG_PRESS_DELAY);
}

function onTouchMove(e) {
  if (!pressTimer && !isShowing) return;

  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;

  if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
    clearTimeout(pressTimer);
    pressTimer = null;
    if (isShowing) hide();
  }
}

function onTouchEnd() {
  clearTimeout(pressTimer);
  pressTimer = null;

  if (isShowing) {
    hide();
    preventNextClick = true;
    // Reset after current event cycle (click fires synchronously after touchend)
    setTimeout(() => { preventNextClick = false; }, 300);
  }
}

function onClickCapture(e) {
  if (preventNextClick) {
    e.stopPropagation();
    e.preventDefault();
    preventNextClick = false;
  }
}

// --- Desktop hover handlers ---

function onMouseOver(e) {
  // Only for mouse, not touch-generated events
  if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;

  const target = e.target.closest('[data-tooltip]');
  if (target && target !== currentHoverTarget) {
    currentHoverTarget = target;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => show(target), HOVER_DELAY);
  }
}

function onMouseOut(e) {
  const target = e.target.closest('[data-tooltip]');
  const related = e.relatedTarget ? e.relatedTarget.closest('[data-tooltip]') : null;

  if (target === currentHoverTarget && related !== currentHoverTarget) {
    clearTimeout(hoverTimer);
    currentHoverTarget = null;
    if (isShowing) hide();
  }
}

// --- Show / Hide ---

function show(target) {
  const key = target.dataset.tooltip;
  if (!key) return;

  const content = resolveContent(key);
  if (!content) return;

  renderTooltip(content);
  positionTooltip(target);

  tooltipEl.classList.add('tooltip-panel--visible');
  isShowing = true;
}

function hide() {
  if (!tooltipEl) return;
  tooltipEl.classList.remove('tooltip-panel--visible');
  isShowing = false;
}

// --- Rendering ---

function renderTooltip(content) {
  let html = '';

  if (content.title) {
    html += '<div class="tooltip-panel__header">';
    if (content.icon) html += `<span class="tooltip-panel__icon">${content.icon}</span>`;
    html += `<span class="tooltip-panel__title">${content.title}</span>`;
    if (content.badge) html += `<span class="tooltip-panel__badge">${content.badge}</span>`;
    html += '</div>';
  }

  if (content.body) {
    html += `<div class="tooltip-panel__body">${content.body}</div>`;
  }

  if (content.footer) {
    html += `<div class="tooltip-panel__footer">${content.footer}</div>`;
  }

  tooltipEl.innerHTML = html;
}

function positionTooltip(target) {
  const targetRect = target.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Temporarily show to measure
  tooltipEl.style.left = '0';
  tooltipEl.style.top = '0';
  tooltipEl.style.visibility = 'hidden';
  tooltipEl.style.display = 'block';
  const tipRect = tooltipEl.getBoundingClientRect();
  tooltipEl.style.visibility = '';
  tooltipEl.style.display = '';

  // Center horizontally on target, clamp to viewport
  let left = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
  left = Math.max(12, Math.min(left, vw - tipRect.width - 12));

  // Position above target if room, otherwise below
  let top;
  const gap = 8;
  if (targetRect.top > tipRect.height + gap + 12) {
    top = targetRect.top - tipRect.height - gap;
  } else {
    top = targetRect.bottom + gap;
  }
  // Clamp vertically
  top = Math.max(8, Math.min(top, vh - tipRect.height - 8));

  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

// --- Content Resolution ---

function resolveContent(key) {
  const [type, ...rest] = key.split(':');
  const id = rest.join(':'); // rejoin in case id contains colons

  switch (type) {
    case 'stat':  return STAT_TOOLTIPS[id] || null;
    case 'bar':   return resolveBarTooltip(id);
    case 'skill': return resolveSkillTooltip(id);
    case 'item':  return resolveItemTooltip(id);
    case 'monster-type': return resolveMonsterTypeTooltip(id);
    case 'buff':  return resolveBuffTooltip(id);
    case 'status': return STATUS_TOOLTIPS[id] || null;
    case 'equip': return EQUIP_SLOT_TOOLTIPS[id] || null;
    default:      return null;
  }
}

function resolveBarTooltip(id) {
  const base = BAR_TOOLTIPS[id];
  if (!base) return null;

  const player = getPlayer();
  if (!player) return base;

  // Add current values as footer
  let footer = '';
  switch (id) {
    case 'hp': {
      const stats = state.computedStats || {};
      const regen = stats.hpRegen || 0;
      footer = `${Math.ceil(player.hp)} / ${player.maxHP}`;
      if (regen > 0) footer += ` \u00B7 Regen: ${(regen * 100).toFixed(1)}%/s`;
      break;
    }
    case 'energy':
      footer = `${Math.floor(player.energy)} / 100`;
      break;
    case 'xp':
      footer = `${player.xp} / ${player.xpToNextLevel}`;
      break;
  }

  return { ...base, footer };
}

function resolveSkillTooltip(skillId) {
  const skillDef = SKILLS[skillId];
  if (!skillDef) return null;

  const player = getPlayer();
  const level = player?.unlockedSkills[skillId] || 1;
  const levelData = skillDef.levels[level];

  // Resolve description template
  let desc = skillDef.description;
  if (levelData) {
    desc = desc.replace(/\{(\w+)\}/g, (_, key) => {
      const val = levelData[key];
      if (val === undefined) return `{${key}}`;
      return val;
    });
  }

  // Build footer with energy/cooldown for active skills
  let footer = '';
  if (skillDef.type === 'active' && levelData) {
    const parts = [];
    parts.push(`\u26A1 ${levelData.energyCost} energy`);
    parts.push(`\u23F1 ${levelData.cooldown}s cooldown`);
    if (skillDef.damageType) {
      parts.push(skillDef.damageType === 'physical' ? '\u2694 Physical' : '\u2728 Magic');
    }
    footer = parts.join(' \u00B7 ');
  }

  const mechLabel = MECHANIC_LABELS[skillDef.mechanic] || '';
  const levelText = player?.unlockedSkills[skillId] !== undefined
    ? `Lv.${level}/${skillDef.maxLevel}`
    : 'LOCKED';
  const badge = [mechLabel, levelText].filter(Boolean).join(' \u00B7 ');

  return {
    title: skillDef.name,
    icon: skillDef.icon,
    badge,
    body: desc,
    footer
  };
}

function resolveItemTooltip(itemId) {
  const item = ITEMS[itemId];
  if (!item) return null;

  const statsText = Object.entries(item.stats)
    .map(([key, val]) => {
      const label = STAT_LABELS[key] || key;
      const display = typeof val === 'number' && val < 1 && val > 0
        ? `+${Math.round(val * 100)}%`
        : `+${val}`;
      return `${display} ${label}`;
    })
    .join(' \u00B7 ');

  const rarityLabel = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);

  return {
    title: item.name,
    icon: item.emoji,
    badge: `${rarityLabel} ${item.type}`,
    body: item.description,
    footer: statsText
  };
}

function resolveMonsterTypeTooltip(typeStr) {
  // Handle multi-type like "swift+aggressive"
  const types = typeStr.split('+');
  if (types.length === 1) {
    return MONSTER_TYPE_TOOLTIPS[types[0]] || null;
  }

  // Multi-type: combine descriptions
  const parts = types.map(t => MONSTER_TYPE_TOOLTIPS[t]).filter(Boolean);
  if (parts.length === 0) return null;

  return {
    title: parts.map(p => p.title).join(' + '),
    icon: parts[0].icon,
    body: parts.map(p => `<strong>${p.title}:</strong> ${p.body}`).join('<br><br>')
  };
}

function resolveBuffTooltip(buffKey) {
  // buffKey format: "hit:skillId", "channel:skillId", "click:skillId",
  // "toggle:skillId", "buff:skillId"
  const [buffType, ...idParts] = buffKey.split(':');
  const skillId = idParts.join(':');
  const skillDef = SKILLS[skillId];
  if (!skillDef) return null;

  // Use the skill tooltip as the base
  const skillTooltip = resolveSkillTooltip(skillId);
  if (!skillTooltip) return null;

  // Add context about the current buff state
  let extra = '';
  switch (buffType) {
    case 'hit':
      extra = 'Queued \u2014 your next click will trigger this skill.';
      break;
    case 'channel':
      if (state.channelState && state.channelState.phase === 'queued') {
        extra = 'Queued \u2014 press and hold the monster to charge.';
      } else if (state.channelState) {
        extra = 'Charging \u2014 release to fire. Longer charge = more damage.';
      }
      break;
    case 'click':
      extra = 'Active \u2014 your next clicks will use this effect.';
      break;
    case 'toggle':
      extra = 'Active \u2014 tap the skill again to deactivate.';
      break;
    case 'buff': {
      const buff = state.activeBuffs?.[skillId];
      if (buff) {
        extra = `Active \u2014 ${buff.remaining.toFixed(1)}s remaining.`;
      }
      break;
    }
  }

  if (extra) {
    skillTooltip.body = `${skillTooltip.body}<br><br><em>${extra}</em>`;
  }

  return skillTooltip;
}

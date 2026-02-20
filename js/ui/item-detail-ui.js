/**
 * item-detail-ui.js - Item Detail Panel
 *
 * Modal overlay shown when tapping any item (inventory, equipment, or shop).
 * Shows full affix details, stat comparison, contextual actions, and crafting.
 *
 * Documented exception: imports pure query functions from items.js
 * (canReforge, getReforgeCost, etc.) — these are read-only, no state mutation.
 *
 * @see docs/design/item-system-v2.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { AFFIXES } from '../data/affixes.data.js';
import {
  EQUIPMENT_SLOTS_V2, RARITIES, SELL_PRICE_RATIO_V2,
  TEMPER_MAX_LEVEL, TEMPER_SELECTION_LEVELS, TEMPER_BRICK_THRESHOLD,
  RARITY_AFFIX_COUNTS
} from '../data/constants.js';
import {
  canReforge, getReforgeableAffixes, getReforgeCost,
  canImbue, getImbueCost,
  canTemper, getTemperCost, isBricked
} from '../systems/items.js';

let backdrop;
let panel;
let currentItem = null;
let currentContext = null; // { source: 'inventory'|'equipment'|'shop', shopIndex?, slot? }
let temperResetConfirming = false;
let temperResetTimer = null;
let reforgeConfirmIndex = null;
let reforgeConfirmTimer = null;

// ============================================================
// INITIALIZATION
// ============================================================

export function init() {
  backdrop = document.getElementById('item-detail-backdrop');
  panel = document.getElementById('item-detail-panel');

  // Dismiss on backdrop tap
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) hide();
  });

  // Result events → close panel or refresh
  on('item:equipped', hide);
  on('item:unequipped', hide);
  on('item:scrapped', hide);
  on('item:purchased', hide);
  on('item:unequipFailed', ({ reason }) => {
    if (reason === 'inventory_full') showInlineError('Inventory full!');
  });

  // Crafting result events → refresh panel in-place
  on('item:reforged', () => refreshIfOpen());
  on('item:imbued', () => refreshIfOpen());
  on('item:tempered', () => refreshIfOpen());
  on('item:temperReset', () => refreshIfOpen());
  on('item:craftFailed', ({ reason, cost }) => {
    if (reason === 'gold') showInlineError(`Not enough gold! (${formatGold(cost)}g needed)`);
    else if (reason === 'ineligible') showInlineError('Item cannot be crafted');
    else if (reason === 'bricked') showInlineError('Item is permanently locked');
    else showInlineError('Crafting failed');
  });
}

// ============================================================
// SHOW / HIDE
// ============================================================

/**
 * Show the detail panel for an item.
 * @param {Object} item - Full item object
 * @param {Object} context - { source: 'inventory'|'equipment'|'shop', shopIndex?, slot? }
 */
export function show(item, context) {
  currentItem = item;
  currentContext = context;
  temperResetConfirming = false;
  clearTimeout(temperResetTimer);
  reforgeConfirmIndex = null;
  clearTimeout(reforgeConfirmTimer);

  render();
  backdrop.style.display = 'flex';
}

export function hide() {
  backdrop.style.display = 'none';
  currentItem = null;
  currentContext = null;
  temperResetConfirming = false;
  clearTimeout(temperResetTimer);
  reforgeConfirmIndex = null;
  clearTimeout(reforgeConfirmTimer);
}

function refreshIfOpen() {
  if (!currentItem || backdrop.style.display === 'none') return;
  render();
}

// ============================================================
// MAIN RENDER
// ============================================================

function render() {
  const item = currentItem;
  if (!item) return;

  const player = getPlayer();
  const rarity = RARITIES[item.rarity] || {};
  const rarityColor = rarity.color || '#9d9d9d';

  let html = '';

  // Close button
  html += `<button class="item-detail__close" data-detail-close>&times;</button>`;

  // Header
  html += `<div class="item-detail__header">
    <span class="item-detail__emoji">${item.emoji || ''}</span>
    <div class="item-detail__title">
      <div class="item-detail__name" style="color: ${rarityColor}">${item.name}</div>
      <div class="item-detail__meta">
        <span class="item-detail__rarity" style="color: ${rarityColor}">${rarity.name || item.rarity}</span>
        <span class="item-detail__slot">${item.slot}</span>
        ${item.zone ? `<span class="item-detail__zone">${item.zone}</span>` : ''}
        ${item.requiredLevel > 1 ? `<span class="item-detail__req-level">Req. Lv ${item.requiredLevel}</span>` : ''}
      </div>
    </div>
  </div>`;

  // Affixes
  if (item.affixes && item.affixes.length > 0) {
    html += '<div class="item-detail__affixes">';
    item.affixes.forEach((affix, i) => {
      const locked = item.reforgedAffix === i;
      const formatted = formatAffix(affix);
      const boostText = getAffixBoostText(item, i);
      html += `<div class="item-detail__affix${locked ? ' item-detail__affix--locked' : ''}">
        ${locked ? '<span class="item-detail__lock-icon">&#x1F512;</span>' : ''}
        <span>${formatted}</span>
        ${boostText ? `<span class="item-detail__affix-boost">${boostText}</span>` : ''}
      </div>`;
    });
    html += '</div>';
  }

  // Legendary unique effect
  if (item.uniqueEffect) {
    const isActive = state.activeLegendaryEffects?.has(item.uniqueEffect.id);
    const activeCls = isActive ? 'item-detail__unique--active' : 'item-detail__unique--inactive';
    const badge = isActive
      ? '<span class="item-detail__unique-badge">ACTIVE</span>'
      : '<span class="item-detail__unique-badge item-detail__unique-badge--inactive">Equip to activate</span>';
    html += `<div class="item-detail__unique ${activeCls}">${badge} ${item.uniqueEffect.description}</div>`;
  }

  // Compare panel
  html += buildCompareHTML(item, player);

  // Action buttons
  html += buildActionsHTML(item, player);

  // Crafting section
  html += buildCraftingHTML(item, player);

  // Inline error area
  html += '<div class="item-detail__error" id="item-detail-error"></div>';

  panel.innerHTML = html;
  wireDetailHandlers();
}

// ============================================================
// AFFIX FORMATTING
// ============================================================

/**
 * Format an affix for display using AFFIXES[id].name template.
 * Replaces X with the formatted value.
 */
function formatAffix(affix) {
  const def = AFFIXES[affix.id];
  if (!def) return `+${affix.value} ${affix.id.replace(/_/g, ' ')}`;

  let valueStr;
  if (def.scaleType === 'percentage') {
    valueStr = `${Math.round(affix.value * 100)}`;
  } else {
    valueStr = `${Math.round(affix.value)}`;
  }

  return def.name.replace('X', valueStr);
}

/**
 * Get boost text for a tempered affix showing the actual stat increase.
 * e.g., "(+2)" for flat stats or "(+0.15%)" for percentage stats.
 */
function getAffixBoostText(item, affixIndex) {
  if (!item.temperSelections || item.temperLevel === 0) return '';

  const affix = item.affixes[affixIndex];
  if (!affix || affix.baseValue === undefined) return '';

  const diff = affix.value - affix.baseValue;
  const def = AFFIXES[affix.id];
  if (!def) return '';

  // If diff is 0, only show (+0) if this affix is a temper target
  if (diff <= 0) {
    const isTemperTarget = item.temperSelections && item.temperSelections.includes(affixIndex);
    if (!isTemperTarget) return '';
    return def.scaleType === 'percentage' ? '(+0%)' : '(+0)';
  }

  if (def.scaleType === 'percentage') {
    const diffPercent = Math.round(diff * 10000) / 100;
    return `(+${diffPercent}%)`;
  }
  return `(+${Math.round(diff)})`;
}

// ============================================================
// COMPARE PANEL
// ============================================================

function buildCompareHTML(item, player) {
  // Only compare for inventory/shop items (not already equipped)
  if (currentContext.source === 'equipment') return '';

  const equippedItem = player.equipment[item.slot];
  if (!equippedItem) {
    return '<div class="item-detail__compare item-detail__compare--empty">No item equipped in this slot</div>';
  }

  // Build stat maps for both items
  const newStats = buildStatMap(item);
  const oldStats = buildStatMap(equippedItem);

  // Merge all stat keys
  const allKeys = new Set([...Object.keys(newStats), ...Object.keys(oldStats)]);
  if (allKeys.size === 0) return '';

  let rows = '';
  for (const key of allKeys) {
    const newVal = newStats[key] || 0;
    const oldVal = oldStats[key] || 0;
    const diff = newVal - oldVal;
    if (diff === 0) continue;

    const label = STAT_LABELS[key] || key.replace(/_/g, ' ');
    const isPercent = isPercentStat(key);
    const diffStr = isPercent
      ? `${diff > 0 ? '+' : ''}${Math.round(diff * 100)}%`
      : `${diff > 0 ? '+' : ''}${Math.round(diff)}`;
    const cls = diff > 0 ? 'item-detail__compare-better' : 'item-detail__compare-worse';

    rows += `<div class="item-detail__compare-row">
      <span class="item-detail__compare-label">${label}</span>
      <span class="${cls}">${diffStr}</span>
    </div>`;
  }

  if (!rows) return '<div class="item-detail__compare item-detail__compare--empty">Stats are identical</div>';

  return `<div class="item-detail__compare">
    <div class="item-detail__compare-title">vs ${equippedItem.name}</div>
    ${rows}
  </div>`;
}

const STAT_LABELS = {
  attack: 'ATK', magicPower: 'Magic', critChance: 'Crit', critDamage: 'Crit Dmg',
  armorPen: 'Armor Pen', magicPen: 'Magic Pen', armor: 'Armor', magicResist: 'MR',
  maxHP: 'HP', maxShield: 'Shield', hpRegen: 'HP Regen', goldFind: 'Gold Find',
  xpBonus: 'XP Bonus', energyGain: 'Energy', skillCooldown: 'CDR',
  bleedChance: 'Bleed', poisonChance: 'Poison', burnChance: 'Burn',
  slowChance: 'Slow', freezeChance: 'Freeze',
  bleedPotency: 'Bleed Dmg', poisonPotency: 'Poison Dmg', burnPotency: 'Burn Dmg',
  slowStrength: 'Slow Str', freezeDuration: 'Freeze Dur'
};

const PERCENT_STATS = new Set([
  'critChance', 'critDamage', 'armorPen', 'magicPen', 'hpRegen',
  'goldFind', 'xpBonus', 'energyGain', 'skillCooldown',
  'bleedChance', 'poisonChance', 'burnChance', 'slowChance', 'freezeChance',
  'bleedPotency', 'poisonPotency', 'burnPotency', 'slowStrength', 'freezeDuration'
]);

function isPercentStat(key) {
  return PERCENT_STATS.has(key);
}

const AFFIX_STAT_MAP = {
  flat_attack: 'attack', flat_magic_power: 'magicPower',
  crit_chance: 'critChance', crit_damage: 'critDamage',
  armor_pen: 'armorPen', magic_pen: 'magicPen',
  flat_armor: 'armor', flat_magic_resist: 'magicResist',
  flat_max_hp: 'maxHP', flat_max_shield: 'maxShield', hp_regen: 'hpRegen',
  gold_find: 'goldFind', xp_bonus: 'xpBonus', energy_gain: 'energyGain',
  skill_cooldown: 'skillCooldown',
  bleed_chance: 'bleedChance', poison_chance: 'poisonChance', burn_chance: 'burnChance',
  slow_chance: 'slowChance', freeze_chance: 'freezeChance',
  bleed_potency: 'bleedPotency', poison_potency: 'poisonPotency', burn_potency: 'burnPotency',
  slow_strength: 'slowStrength', freeze_duration: 'freezeDuration'
};

function buildStatMap(item) {
  const stats = {};
  if (!item.affixes) return stats;
  for (const affix of item.affixes) {
    const key = AFFIX_STAT_MAP[affix.id];
    if (key) stats[key] = (stats[key] || 0) + affix.value;
  }
  return stats;
}

// ============================================================
// ACTION BUTTONS
// ============================================================

function buildActionsHTML(item, player) {
  const source = currentContext.source;
  let html = '<div class="item-detail__actions">';

  if (source === 'inventory') {
    const meetsLevel = player.level >= (item.requiredLevel || 1);
    html += `<button class="item-detail__btn item-detail__btn--equip" data-detail-equip ${meetsLevel ? '' : 'disabled'}>Equip</button>`;
    const sellPrice = item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO_V2);
    html += `<button class="item-detail__btn item-detail__btn--scrap" data-detail-scrap>Scrap (${formatGold(sellPrice)}g)</button>`;
  } else if (source === 'equipment') {
    html += `<button class="item-detail__btn item-detail__btn--unequip" data-detail-unequip>Unequip</button>`;
  } else if (source === 'shop') {
    const canAfford = player.gold >= item.buyPrice;
    const meetsLevel = player.level >= (item.requiredLevel || 1);
    const canBuy = canAfford && meetsLevel;
    html += `<button class="item-detail__btn item-detail__btn--buy" data-detail-buy ${canBuy ? '' : 'disabled'}>Buy (${formatGold(item.buyPrice)}g)</button>`;
  }

  html += '</div>';
  return html;
}

// ============================================================
// CRAFTING UI (12.7b)
// ============================================================

function buildCraftingHTML(item, player) {
  // No crafting for shop items or common rarity
  if (currentContext.source === 'shop') return '';
  if (item.rarity === 'common') {
    return '<div class="item-detail__crafting-note">Common items cannot be crafted</div>';
  }

  let html = '<div class="item-detail__crafting">';
  html += '<div class="item-detail__crafting-title">Crafting</div>';

  // Reforge section
  html += buildReforgeHTML(item, player);

  // Imbue section
  html += buildImbueHTML(item, player);

  // Temper section
  html += buildTemperHTML(item, player);

  html += '</div>';
  return html;
}

function buildReforgeHTML(item, player) {
  if (!canReforge(item)) return '';

  const cost = getReforgeCost(item);
  const canPay = player.gold >= cost;
  const reforgeableIndices = getReforgeableAffixes(item);

  let html = '<div class="item-detail__craft-section">';
  html += '<div class="item-detail__craft-label">Reforge</div>';

  if (item.reforgedAffix === null) {
    // First time: select which affix to target
    html += '<div class="item-detail__reforge-hint">Select an affix to reforge:</div>';
    reforgeableIndices.forEach(i => {
      const affix = item.affixes[i];
      const isConfirming = reforgeConfirmIndex === i;
      const confirmCls = isConfirming ? ' item-detail__reforge-affix--confirm' : '';
      const label = isConfirming ? `Confirm Reforge (${formatGold(cost)}g)` : formatAffix(affix);
      html += `<button class="item-detail__reforge-affix${confirmCls}" data-reforge-index="${i}">
        ${label}
      </button>`;
    });
  } else {
    // Locked: show reforge button for locked affix
    const affix = item.affixes[item.reforgedAffix];
    html += `<div class="item-detail__reforge-locked">
      &#x1F512; ${formatAffix(affix)}
    </div>`;
    const isConfirming = reforgeConfirmIndex === item.reforgedAffix;
    const confirmCls = isConfirming ? ' item-detail__craft-btn--confirm' : '';
    const label = isConfirming ? 'Confirm Reforge' : 'Reforge';
    html += `<button class="item-detail__craft-btn${confirmCls}" data-reforge-index="${item.reforgedAffix}" ${canPay ? '' : 'disabled'}>
      ${label}
      <span class="item-detail__craft-cost${canPay ? '' : ' item-detail__craft-cost--unaffordable'}">${formatGold(cost)}g</span>
    </button>`;
  }

  html += '</div>';
  return html;
}

function buildImbueHTML(item, player) {
  const maxAffixes = RARITY_AFFIX_COUNTS[item.rarity] || 1;
  const currentCount = item.affixes ? item.affixes.length : 0;

  if (item.imbued) {
    return `<div class="item-detail__craft-section">
      <div class="item-detail__craft-label">Imbue</div>
      <div class="item-detail__craft-disabled">Already imbued</div>
    </div>`;
  }

  if (!canImbue(item)) return '';

  const cost = getImbueCost(item);
  const canPay = player.gold >= cost;

  return `<div class="item-detail__craft-section">
    <div class="item-detail__craft-label">Imbue</div>
    <div class="item-detail__imbue-count">Affixes: ${currentCount} / ${maxAffixes}</div>
    <button class="item-detail__craft-btn" data-detail-imbue ${canPay ? '' : 'disabled'}>
      Add Affix
      <span class="item-detail__craft-cost${canPay ? '' : ' item-detail__craft-cost--unaffordable'}">${formatGold(cost)}g</span>
    </button>
  </div>`;
}

function buildTemperHTML(item, player) {
  const validRarities = ['rare', 'epic', 'legendary'];
  if (!validRarities.includes(item.rarity)) return '';

  const bricked = isBricked(item);
  const level = item.temperLevel || 0;

  let html = '<div class="item-detail__craft-section">';
  html += '<div class="item-detail__craft-label">Temper</div>';

  if (bricked) {
    html += '<div class="item-detail__bricked">BRICKED</div>';
    html += `<div class="item-detail__temper-info">Temper Lv ${level} / ${TEMPER_MAX_LEVEL} (locked)</div>`;
    html += buildTemperBar(level);
    html += '</div>';
    return html;
  }

  html += buildTemperBar(level);
  html += `<div class="item-detail__temper-info">Temper Lv ${level} / ${TEMPER_MAX_LEVEL}</div>`;

  if (level < TEMPER_MAX_LEVEL) {
    const cost = getTemperCost(item);
    const canPay = player.gold >= cost;
    html += `<button class="item-detail__craft-btn" data-detail-temper ${canPay ? '' : 'disabled'}>
      Temper
      <span class="item-detail__craft-cost${canPay ? '' : ' item-detail__craft-cost--unaffordable'}">${formatGold(cost)}g</span>
    </button>`;
  }

  // Reset button (only if tempered)
  if (level > 0) {
    const resetsLeft = TEMPER_BRICK_THRESHOLD - (item.temperBrickCount || 0);
    if (temperResetConfirming) {
      html += `<button class="item-detail__temper-reset item-detail__temper-reset--confirm" data-detail-temper-reset>
        Confirm Reset (${resetsLeft} left before brick)
      </button>`;
    } else {
      html += `<button class="item-detail__temper-reset" data-detail-temper-reset>
        Reset Temper (${resetsLeft} resets left)
      </button>`;
    }
  }

  html += '</div>';
  return html;
}

function buildTemperBar(level) {
  let html = '<div class="item-detail__temper-bar">';
  for (let i = 1; i <= TEMPER_MAX_LEVEL; i++) {
    const filled = i <= level;
    const isSelection = TEMPER_SELECTION_LEVELS.includes(i);
    const cycle = i <= 4 ? 0 : i <= 8 ? 1 : 2;
    const classes = [
      'item-detail__temper-pip',
      filled ? 'item-detail__temper-pip--filled' : '',
      isSelection ? 'item-detail__temper-pip--selection' : '',
      `item-detail__temper-pip--cycle-${cycle}`
    ].filter(Boolean).join(' ');
    html += `<div class="${classes}">${isSelection ? '&#x25C6;' : ''}</div>`;
  }
  html += '</div>';
  return html;
}

// ============================================================
// EVENT WIRING
// ============================================================

function wireDetailHandlers() {
  // Close button
  panel.querySelector('[data-detail-close]')?.addEventListener('click', hide);

  // Equip
  panel.querySelector('[data-detail-equip]')?.addEventListener('click', () => {
    emit('item:requestEquip', { itemId: currentItem.id });
  });

  // Unequip
  panel.querySelector('[data-detail-unequip]')?.addEventListener('click', () => {
    emit('item:requestUnequip', { slot: currentContext.slot });
  });

  // Scrap
  panel.querySelector('[data-detail-scrap]')?.addEventListener('click', () => {
    emit('item:requestScrap', { itemId: currentItem.id });
  });

  // Buy
  panel.querySelector('[data-detail-buy]')?.addEventListener('click', () => {
    emit('shop:requestPurchase', { shopIndex: currentContext.shopIndex });
  });

  // Reforge (two-click confirm)
  panel.querySelectorAll('[data-reforge-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const affixIndex = parseInt(btn.dataset.reforgeIndex);
      if (reforgeConfirmIndex === affixIndex) {
        // Confirmed — execute reforge
        clearTimeout(reforgeConfirmTimer);
        reforgeConfirmIndex = null;
        emit('item:requestReforge', { itemId: currentItem.id, affixIndex });
      } else {
        // First click — enter confirm state
        reforgeConfirmIndex = affixIndex;
        render();
        reforgeConfirmTimer = setTimeout(() => {
          reforgeConfirmIndex = null;
          if (currentItem) render();
        }, 3000);
      }
    });
  });

  // Imbue
  panel.querySelector('[data-detail-imbue]')?.addEventListener('click', () => {
    emit('item:requestImbue', { itemId: currentItem.id });
  });

  // Temper
  panel.querySelector('[data-detail-temper]')?.addEventListener('click', () => {
    emit('item:requestTemper', { itemId: currentItem.id });
  });

  // Temper reset (two-tap confirm)
  panel.querySelector('[data-detail-temper-reset]')?.addEventListener('click', () => {
    if (temperResetConfirming) {
      clearTimeout(temperResetTimer);
      temperResetConfirming = false;
      emit('item:requestTemperReset', { itemId: currentItem.id });
    } else {
      temperResetConfirming = true;
      render(); // re-render to show confirm state
      temperResetTimer = setTimeout(() => {
        temperResetConfirming = false;
        if (currentItem) render();
      }, 3000);
    }
  });
}

// ============================================================
// INLINE ERROR
// ============================================================

function showInlineError(message) {
  const el = document.getElementById('item-detail-error');
  if (!el) return;
  el.textContent = message;
  el.classList.add('item-detail__error--visible');
  setTimeout(() => {
    el.classList.remove('item-detail__error--visible');
  }, 2500);
}

// ============================================================
// HELPERS
// ============================================================

function formatGold(amount) {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K';
  return amount.toString();
}

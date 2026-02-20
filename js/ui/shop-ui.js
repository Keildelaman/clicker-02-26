/**
 * shop-ui.js - Shop & Inventory UI (v2)
 *
 * Renders shop items, inventory, equipment slots, and overflow.
 * Tapping any item opens the item-detail-ui panel.
 * Emits intent events for mutations; economy.js / items.js handle them.
 *
 * @see docs/systems/economy.system.md
 * @see docs/design/item-system-v2.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { AFFIXES } from '../data/affixes.data.js';
import {
  RARITIES, SELL_PRICE_RATIO_V2, EQUIPMENT_SLOTS_V2, ZONE_MATERIALS
} from '../data/constants.js';
import { showToast } from './toasts.js';
import * as itemDetailUI from './item-detail-ui.js';

let shopContent;
let inventoryContent;
let shopGoldDisplay;
let activeTab = 'shop';

// Inventory filter/sort state (persists across re-renders)
let activeFilter = 'all';   // 'all' | slot name
let activeSort = 'rarity';  // 'rarity' | 'name' | 'level' | 'slot' | 'newest'
let bulkPanelOpen = false;

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
const SLOT_ORDER = { weapon: 0, helmet: 1, chest: 2, gloves: 3, boots: 4, accessory: 5 };

// Track bulk sell confirmation timers
let confirmTimers = {};

export function init() {
  shopContent = document.getElementById('shop-content');
  inventoryContent = document.getElementById('inventory-content');
  shopGoldDisplay = document.getElementById('shop-gold-display');

  // Tab switching
  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Back button
  document.getElementById('shop-back-btn').addEventListener('click', () => {
    emit('nav:navigate', { screen: 'combat' });
  });

  // Listen for state changes (result events from economy / items systems)
  on('shop:refreshed', renderShop);
  on('item:purchased', ({ item }) => {
    showToast(`Purchased ${item.emoji} ${item.name}!`, 'success');
    renderShop(); renderInventory(); updateGold();
  });
  on('item:equipped', ({ item }) => {
    showToast(`Equipped ${item.emoji} ${item.name}!`, 'success');
    renderInventory(); updateGold();
  });
  on('item:unequipped', () => {
    showToast('Item unequipped', 'info');
    renderInventory(); updateGold();
  });
  on('loot:itemDropped', ({ item }) => {
    showToast(`Found: ${item.emoji} ${item.name}!`, 'success', 3000);
    if (activeTab === 'inventory') renderInventory();
  });
  on('item:equipFailed', ({ item, requiredLevel }) => {
    showToast(`${item.emoji} ${item.name} requires Lv ${requiredLevel}!`, 'warning', 3000);
  });
  on('gold:earned', updateGold);
  on('player:levelUp', () => {
    if (activeTab === 'inventory') renderInventory();
  });
  on('item:bulkScrapped', ({ rarity, count, totalGold }) => {
    showToast(`Scrapped ${count} ${rarity} items for ${formatGold(totalGold)}g`, 'info');
    renderInventory();
    updateGold();
  });
  on('item:scrapped', ({ item, goldValue }) => {
    showToast(`Scrapped ${item.name} for ${formatGold(goldValue)}g`, 'info');
    renderInventory();
    updateGold();
  });

  // Crafting toasts
  on('item:reforged', ({ item, oldValue, newValue }) => {
    const dir = newValue > oldValue ? '\u2191' : newValue < oldValue ? '\u2193' : '=';
    showToast(`Reforged ${item.name}: ${dir}`, newValue >= oldValue ? 'success' : 'warning');
    if (activeTab === 'inventory') renderInventory();
  });
  on('item:imbued', ({ item, newAffix }) => {
    const affixDef = AFFIXES[newAffix.id];
    const affixName = affixDef ? affixDef.name.replace('X', '') : newAffix.id;
    showToast(`Imbued ${item.name} with ${affixName.trim()}!`, 'success');
    if (activeTab === 'inventory') renderInventory();
  });
  on('item:tempered', ({ item, result }) => {
    const msg = result.type === 'selection'
      ? `Temper Lv${item.temperLevel}: Selected affix!`
      : `Temper Lv${item.temperLevel}: Boosted!`;
    showToast(msg, 'success');
    if (activeTab === 'inventory') renderInventory();
  });
  on('item:temperReset', ({ item, bricked }) => {
    if (bricked) {
      showToast(`${item.name} is now BRICKED!`, 'error', 4000);
    } else {
      showToast('Temper reset', 'info');
    }
    if (activeTab === 'inventory') renderInventory();
  });
  on('item:craftFailed', ({ reason, cost }) => {
    if (reason === 'gold') showToast(`Not enough gold! (${formatGold(cost)}g needed)`, 'error');
    else if (reason === 'ineligible') showToast('Item cannot be crafted', 'warning');
    else if (reason === 'bricked') showToast('Item is permanently locked', 'error');
    else showToast('Crafting failed', 'warning');
  });
  on('item:autoScrapped', ({ item, goldValue }) => {
    showToast(`${item.name} auto-scrapped for ${formatGold(goldValue)}g (inventory full)`, 'warning', 3000);
  });
  on('materials:added', ({ materialId, amount }) => {
    const matEntry = Object.values(ZONE_MATERIALS).find(m => m.id === materialId);
    const name = matEntry ? matEntry.name : materialId;
    showToast(`+${amount} ${name}`, 'info', 2000);
  });

  // Live timer update (no full re-render)
  on('shop:timerTick', ({ timeLeft }) => {
    if (activeTab !== 'shop') return;
    const el = shopContent && shopContent.querySelector('.shop-refresh__timer');
    if (!el) return;
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    el.textContent = `Refreshes in ${minutes}:${String(seconds).padStart(2, '0')}`;
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.shop-tab').forEach(t => {
    t.classList.toggle('shop-tab--active', t.dataset.tab === tab);
  });
  shopContent.style.display = tab === 'shop' ? 'flex' : 'none';
  inventoryContent.style.display = tab === 'inventory' ? 'flex' : 'none';

  if (tab === 'shop') renderShop();
  if (tab === 'inventory') renderInventory();
}

function updateGold() {
  const player = getPlayer();
  if (shopGoldDisplay) shopGoldDisplay.textContent = formatGold(player.gold);
}

// --- Shop Rendering ---

function renderShop() {
  if (!shopContent) return;
  updateGold();

  const player = getPlayer();
  const items = state.shopItems || [];

  let html = '';

  // Refresh bar
  const refreshCost = state.shopRefreshCost || 0;
  const canRefresh = player.gold >= refreshCost;
  const timeLeft = state.shopRefreshTimer || 0;
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  html += `<div class="shop-refresh">
    <span class="shop-refresh__timer">Refreshes in ${timeStr}</span>
    <button class="shop-refresh__btn" id="shop-refresh-btn" ${canRefresh ? '' : 'disabled'}>
      Refresh (${formatGold(refreshCost)}g)
    </button>
  </div>`;

  // Item cards
  for (let i = 0; i < items.length; i++) {
    if (!items[i]) continue; // null = already purchased
    html += createShopItemCard(items[i], player, i);
  }

  if (items.length === 0) {
    html += '<div class="inventory-empty">No items available</div>';
  }

  shopContent.innerHTML = html;

  // Wire refresh button
  const refreshBtn = document.getElementById('shop-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      emit('shop:requestRefresh');
    });
  }

  // Wire shop item card taps → detail panel
  shopContent.querySelectorAll('[data-shop-index]').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.shopIndex);
      const item = items[idx];
      if (item) itemDetailUI.show(item, { source: 'shop', shopIndex: idx });
    });
  });
}

function createShopItemCard(item, player, shopIndex) {
  const canAfford = player.gold >= item.buyPrice;
  const meetsLevel = player.level >= (item.requiredLevel || 1);

  let priceHtml = '';
  if (!meetsLevel) {
    priceHtml += `<span class="item-card__level-req">Req. Lv ${item.requiredLevel}</span>`;
  }
  priceHtml += `<span class="item-card__price ${canAfford ? '' : 'item-card__price--unaffordable'}">${formatGold(item.buyPrice)}g</span>`;

  return `<div class="item-card item-card--${item.rarity}" data-shop-index="${shopIndex}">
    <div class="item-card__header">
      <span class="item-card__emoji">${item.emoji || ''}</span>
      <div class="item-card__info">
        <div class="item-card__name">${item.name}</div>
        <div class="item-card__rarity item-card__rarity--${item.rarity}">${item.rarity} ${item.slot}</div>
      </div>
    </div>
    <div class="item-card__stats">${buildAffixTags(item)}</div>
    <div class="item-card__actions">${priceHtml}</div>
  </div>`;
}

// --- Inventory Filter / Sort Helpers ---

function getFilteredSortedItems(player) {
  let items = player.inventory
    .map(entry => ({ id: entry.id, item: entry }))
    .filter(e => e.item);

  // Filter by slot
  if (activeFilter !== 'all') {
    items = items.filter(e => e.item.slot === activeFilter);
  }

  // Sort
  items.sort((a, b) => {
    if (activeSort === 'rarity') {
      const diff = (RARITY_ORDER[a.item.rarity] ?? 5) - (RARITY_ORDER[b.item.rarity] ?? 5);
      if (diff !== 0) return diff;
      return a.item.name.localeCompare(b.item.name);
    }
    if (activeSort === 'name') {
      return a.item.name.localeCompare(b.item.name);
    }
    if (activeSort === 'level') {
      const diff = (b.item.requiredLevel || 0) - (a.item.requiredLevel || 0);
      if (diff !== 0) return diff;
      return a.item.name.localeCompare(b.item.name);
    }
    if (activeSort === 'slot') {
      const diff = (SLOT_ORDER[a.item.slot] ?? 9) - (SLOT_ORDER[b.item.slot] ?? 9);
      if (diff !== 0) return diff;
      return (RARITY_ORDER[a.item.rarity] ?? 5) - (RARITY_ORDER[b.item.rarity] ?? 5);
    }
    if (activeSort === 'newest') {
      // Items added later have higher IDs (timestamp-based)
      return (b.id || '').localeCompare(a.id || '');
    }
    return 0;
  });

  return items;
}

function buildToolbarHTML() {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'weapon', label: 'Wpn' },
    { key: 'helmet', label: 'Helm' },
    { key: 'chest', label: 'Chest' },
    { key: 'gloves', label: 'Glvs' },
    { key: 'boots', label: 'Boots' },
    { key: 'accessory', label: 'Acc' }
  ];

  const filterPills = filters.map(f =>
    `<button class="inv-filter${activeFilter === f.key ? ' inv-filter--active' : ''}" data-filter="${f.key}">${f.label}</button>`
  ).join('');

  const sortOptions = [
    { key: 'rarity', label: 'Rarity' },
    { key: 'name', label: 'Name' },
    { key: 'level', label: 'Level' },
    { key: 'slot', label: 'Slot' },
    { key: 'newest', label: 'Newest' }
  ];

  const sortSelect = sortOptions.map(s =>
    `<option value="${s.key}"${activeSort === s.key ? ' selected' : ''}>${s.label}</option>`
  ).join('');

  return `<div class="inv-toolbar">
    <div class="inv-toolbar__filters">${filterPills}</div>
    <select class="inv-toolbar__sort" data-inv-sort>${sortSelect}</select>
  </div>`;
}

function buildBulkSellHTML(player) {
  // Count items per rarity in inventory + overflow (unequipped only)
  const counts = {};
  const totals = {};

  const allItems = [...player.inventory, ...(player.inventoryOverflow || [])];
  for (const item of allItems) {
    if (!item) continue;
    if (activeFilter !== 'all' && item.slot !== activeFilter) continue;
    if (!counts[item.rarity]) {
      counts[item.rarity] = 0;
      totals[item.rarity] = 0;
    }
    counts[item.rarity]++;
    totals[item.rarity] += item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO_V2);
  }

  // Only show rarities that have items, ordered common-first (safest to sell first)
  const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const available = order.filter(r => counts[r] > 0);

  if (available.length === 0) return '';

  const toggleText = bulkPanelOpen ? 'Hide Bulk Scrap' : 'Scrap All...';

  let html = `<button class="inv-bulk-toggle" data-bulk-toggle>${toggleText}</button>`;

  if (bulkPanelOpen) {
    html += '<div class="inv-bulk-panel">';
    for (const rarity of available) {
      const rarityInfo = RARITIES[rarity];
      const slotLabel = activeFilter !== 'all' ? ` ${activeFilter}` : '';
      const label = `Scrap ${counts[rarity]} ${rarityInfo.name}${slotLabel}`;
      const goldLabel = `${formatGold(totals[rarity])}g`;
      html += `<button class="inv-bulk-btn inv-bulk-btn--${rarity}" data-bulk-sell="${rarity}">
        ${label} &mdash; ${goldLabel}
      </button>`;
    }
    html += '</div>';
  }

  return html;
}

// --- Inventory Rendering ---

function renderInventory() {
  if (!inventoryContent) return;
  updateGold();

  const player = getPlayer();
  let html = '';

  // Equipment slots (6 v2 object slots)
  html += '<div class="equipment-slots">';
  for (const slot of EQUIPMENT_SLOTS_V2) {
    const item = player.equipment[slot];

    if (item) {
      const rarityColor = RARITIES[item.rarity]?.color || '#9d9d9d';
      html += `<div class="equipment-slot equipment-slot--filled equipment-slot--${item.rarity}" data-equip-slot="${slot}">
        <span class="equipment-slot__emoji">${item.emoji || ''}</span>
        <span class="equipment-slot__name">${item.name}</span>
        <span class="equipment-slot__label">tap to view</span>
      </div>`;
    } else {
      html += `<div class="equipment-slot">
        <span class="equipment-slot__label">${slot}</span>
      </div>`;
    }
  }
  html += '</div>';

  // Overflow section (amber highlight, at top of inventory)
  const overflow = player.inventoryOverflow || [];
  if (overflow.length > 0) {
    html += `<div class="inventory-overflow-label">Overflow (${overflow.length}/3) &mdash; Scrap to make room!</div>`;
    for (const item of overflow) {
      html += `<div class="item-card item-card--${item.rarity} item-card--overflow" data-overflow-id="${item.id}">
        <div class="item-card__header">
          <span class="item-card__emoji">${item.emoji || ''}</span>
          <div class="item-card__info">
            <div class="item-card__name">${item.name}</div>
            <div class="item-card__rarity item-card__rarity--${item.rarity}">${item.rarity} ${item.slot}</div>
          </div>
        </div>
        <div class="item-card__stats">${buildAffixTags(item)}</div>
      </div>`;
    }
  }

  // Inventory label
  html += `<div class="inventory-label">Inventory (${player.inventory.length}/30)</div>`;

  // Toolbar (filter pills + sort)
  html += buildToolbarHTML();

  // Bulk sell
  html += buildBulkSellHTML(player);

  // Filtered + sorted items
  if (player.inventory.length === 0) {
    html += '<div class="inventory-empty">No items in inventory</div>';
  } else {
    const filtered = getFilteredSortedItems(player);

    if (filtered.length === 0) {
      html += '<div class="inventory-empty">No matching items</div>';
    }

    for (const { id: itemId, item } of filtered) {
      html += `<div class="item-card item-card--${item.rarity}" data-inv-id="${itemId}">
        <div class="item-card__header">
          <span class="item-card__emoji">${item.emoji || ''}</span>
          <div class="item-card__info">
            <div class="item-card__name">${item.name}</div>
            <div class="item-card__rarity item-card__rarity--${item.rarity}">${item.rarity} ${item.slot}</div>
          </div>
        </div>
        <div class="item-card__stats">${buildAffixTags(item)}</div>
      </div>`;
    }
  }

  inventoryContent.innerHTML = html;
  wireInventoryHandlers();
}

function wireInventoryHandlers() {
  // Wire equipment slot taps → detail panel
  inventoryContent.querySelectorAll('[data-equip-slot]').forEach(el => {
    el.addEventListener('click', () => {
      const slot = el.dataset.equipSlot;
      const player = getPlayer();
      const item = player.equipment[slot];
      if (item) itemDetailUI.show(item, { source: 'equipment', slot });
    });
  });

  // Wire inventory item taps → detail panel
  inventoryContent.querySelectorAll('[data-inv-id]').forEach(card => {
    card.addEventListener('click', () => {
      const itemId = card.dataset.invId;
      const player = getPlayer();
      const item = player.inventory.find(i => i.id === itemId);
      if (item) itemDetailUI.show(item, { source: 'inventory' });
    });
  });

  // Wire overflow item taps → detail panel
  inventoryContent.querySelectorAll('[data-overflow-id]').forEach(card => {
    card.addEventListener('click', () => {
      const itemId = card.dataset.overflowId;
      const player = getPlayer();
      const item = (player.inventoryOverflow || []).find(i => i.id === itemId);
      if (item) itemDetailUI.show(item, { source: 'inventory' });
    });
  });

  // Wire filter pills
  inventoryContent.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderInventory();
    });
  });

  // Wire sort select
  const sortEl = inventoryContent.querySelector('[data-inv-sort]');
  if (sortEl) {
    sortEl.addEventListener('change', () => {
      activeSort = sortEl.value;
      renderInventory();
    });
  }

  // Wire bulk sell toggle
  const toggleBtn = inventoryContent.querySelector('[data-bulk-toggle]');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      bulkPanelOpen = !bulkPanelOpen;
      renderInventory();
    });
  }

  // Wire bulk sell buttons (two-tap confirm)
  inventoryContent.querySelectorAll('[data-bulk-sell]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleBulkSell(btn, btn.dataset.bulkSell);
    });
  });
}

function handleBulkSell(btn, rarity) {
  // If already confirming this rarity, execute the sell
  if (btn.classList.contains('inv-bulk-btn--confirming')) {
    clearTimeout(confirmTimers[rarity]);
    delete confirmTimers[rarity];
    emit('item:requestBulkScrap', { rarity });
    return;
  }

  // Enter confirmation state
  const originalText = btn.textContent;
  btn.textContent = 'Confirm? Tap again';
  btn.classList.add('inv-bulk-btn--confirming');

  // Clear any existing timer for this rarity
  if (confirmTimers[rarity]) clearTimeout(confirmTimers[rarity]);

  // Auto-revert after 3 seconds
  confirmTimers[rarity] = setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('inv-bulk-btn--confirming');
    delete confirmTimers[rarity];
  }, 3000);
}

// --- Shared Helpers ---

/**
 * Build compact affix tag HTML for item cards.
 * Uses AFFIXES[id].name formatting.
 */
function buildAffixTags(item) {
  if (!item.affixes || item.affixes.length === 0) return '';
  return item.affixes.map((affix, i) => {
    const def = AFFIXES[affix.id];
    let text;
    if (def) {
      const val = def.scaleType === 'percentage'
        ? `${Math.round(affix.value * 100)}`
        : `${Math.round(affix.value)}`;
      text = def.name.replace('X', val);
    } else {
      text = `+${affix.value} ${affix.id.replace(/_/g, ' ')}`;
    }
    const lockIcon = item.reforgedAffix === i ? '&#x1F512; ' : '';
    return `<span class="item-card__stat">${lockIcon}${text}</span>`;
  }).join('');
}

function formatGold(amount) {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K';
  return amount.toString();
}

/**
 * Called when shop screen becomes visible.
 */
export function onShow() {
  updateGold();
  if (activeTab === 'shop') renderShop();
  if (activeTab === 'inventory') renderInventory();
}

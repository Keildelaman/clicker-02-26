/**
 * shop-ui.js - Shop & Inventory UI
 *
 * Renders shop items, inventory, and equipment slots.
 * Calls economy.js for all state mutations.
 *
 * @see docs/systems/economy.system.md
 */

import { on } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { ITEMS } from '../data/items.data.js';
import { RARITIES, SELL_PRICE_RATIO } from '../data/constants.js';
import * as economy from '../systems/economy.js';
import { showToast } from './toasts.js';

let shopContent;
let inventoryContent;
let shopGoldDisplay;
let activeTab = 'shop';
let refreshTimerEl = null;

// Inventory filter/sort state (persists across re-renders)
let activeFilter = 'all';   // 'all' | 'weapon' | 'armor' | 'accessory'
let activeSort = 'rarity';  // 'rarity' | 'name' | 'level'
let bulkPanelOpen = false;

const STAT_LABELS = {
  attack: 'ATK',
  critChance: 'Crit',
  critDamage: 'CritDmg',
  maxHP: 'HP',
  hpRegen: 'HP Regen',
  goldFind: 'Gold Find',
  xpBonus: 'XP Bonus',
  damageReduction: 'DR',
  energyGain: 'Energy',
  armorPen: 'Armor Pen'
};

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };

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
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.screen === 'combat') btn.click();
    });
  });

  // Listen for state changes
  on('shop:refreshed', renderShop);
  on('item:purchased', () => { renderShop(); renderInventory(); updateGold(); });
  on('item:sold', () => { renderInventory(); updateGold(); });
  on('item:equipped', () => { renderInventory(); updateGold(); });
  on('item:unequipped', () => { renderInventory(); updateGold(); });
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
  on('items:bulkSold', ({ rarity, count, totalGold }) => {
    showToast(`Sold ${count} ${rarity} items for ${formatGold(totalGold)}g`, 'info');
    renderInventory();
    updateGold();
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
  const items = economy.getCurrentShopItems();

  let html = '';

  // Refresh bar
  const refreshCost = economy.getRefreshCost();
  const canRefresh = player.gold >= refreshCost;
  const timeLeft = economy.getTimeToRefresh();
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
  for (const item of items) {
    html += createShopItemCard(item, player);
  }

  if (items.length === 0) {
    html += '<div class="inventory-empty">No items available</div>';
  }

  shopContent.innerHTML = html;

  // Wire refresh button
  const refreshBtn = document.getElementById('shop-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (economy.refreshShop(true)) {
        renderShop();
      }
    });
  }

  // Wire buy buttons
  shopContent.querySelectorAll('[data-buy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.buy;
      const item = ITEMS[itemId];
      if (economy.purchaseItem(itemId)) {
        showToast(`Purchased ${item.emoji} ${item.name}!`, 'success');
      }
    });
  });
}

function createShopItemCard(item, player) {
  const canAfford = player.gold >= item.buyPrice;
  const meetsLevel = player.level >= item.requiredLevel;
  const canBuy = canAfford && meetsLevel;

  let actionsHtml = '';
  if (!meetsLevel) {
    actionsHtml += `<span class="item-card__level-req">Req. Lv ${item.requiredLevel}</span>`;
  }
  actionsHtml += `<span class="item-card__price ${canAfford ? '' : 'item-card__price--unaffordable'}">${formatGold(item.buyPrice)}g</span>`;
  actionsHtml += `<button class="item-card__btn" data-buy="${item.id}" ${canBuy ? '' : 'disabled'}>Buy</button>`;

  return createItemCardHTML(item, actionsHtml);
}

// --- Inventory Filter / Sort Helpers ---

function getFilteredSortedItems(player) {
  let items = player.inventory
    .map(id => ({ id, item: ITEMS[id] }))
    .filter(e => e.item);

  // Filter by type
  if (activeFilter !== 'all') {
    items = items.filter(e => e.item.type === activeFilter);
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
      const diff = b.item.requiredLevel - a.item.requiredLevel;
      if (diff !== 0) return diff;
      return a.item.name.localeCompare(b.item.name);
    }
    return 0;
  });

  return items;
}

function buildToolbarHTML() {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'weapon', label: 'Wpn' },
    { key: 'armor', label: 'Arm' },
    { key: 'accessory', label: 'Acc' }
  ];

  const filterPills = filters.map(f =>
    `<button class="inv-filter${activeFilter === f.key ? ' inv-filter--active' : ''}" data-filter="${f.key}">${f.label}</button>`
  ).join('');

  const sortOptions = [
    { key: 'rarity', label: 'Rarity' },
    { key: 'name', label: 'Name' },
    { key: 'level', label: 'Level' }
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
  // Count items per rarity in inventory (unequipped only — inventory doesn't include equipped)
  const counts = {};
  const totals = {};
  for (const itemId of player.inventory) {
    const item = ITEMS[itemId];
    if (!item) continue;
    if (activeFilter !== 'all' && item.type !== activeFilter) continue;
    if (!counts[item.rarity]) {
      counts[item.rarity] = 0;
      totals[item.rarity] = 0;
    }
    counts[item.rarity]++;
    totals[item.rarity] += item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO);
  }

  // Only show rarities that have items, ordered common-first (safest to sell first)
  const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const available = order.filter(r => counts[r] > 0);

  if (available.length === 0) return '';

  const toggleText = bulkPanelOpen ? 'Hide Bulk Sell' : 'Sell All...';

  let html = `<button class="inv-bulk-toggle" data-bulk-toggle>${toggleText}</button>`;

  if (bulkPanelOpen) {
    html += '<div class="inv-bulk-panel">';
    for (const rarity of available) {
      const rarityInfo = RARITIES[rarity];
      const typeLabel = activeFilter !== 'all' ? ` ${activeFilter}s` : '';
      const label = `Sell ${counts[rarity]} ${rarityInfo.name}${typeLabel}`;
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

  // Equipment slots
  html += '<div class="equipment-slots">';
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const itemId = player.equipment[slot];
    const item = itemId ? ITEMS[itemId] : null;

    if (item) {
      html += `<div class="equipment-slot equipment-slot--filled" data-unequip="${slot}">
        <span class="equipment-slot__emoji">${item.emoji}</span>
        <span class="equipment-slot__name">${item.name}</span>
        <span class="equipment-slot__label">tap to unequip</span>
      </div>`;
    } else {
      html += `<div class="equipment-slot">
        <span class="equipment-slot__label">${slot}</span>
      </div>`;
    }
  }
  html += '</div>';

  // Inventory label
  html += '<div class="inventory-label">Inventory</div>';

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
      const sellPrice = item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO);
      const meetsLevel = player.level >= item.requiredLevel;
      let actionsHtml = '';
      if (!meetsLevel) {
        actionsHtml += `<span class="item-card__level-req">Req. Lv ${item.requiredLevel}</span>`;
      }
      actionsHtml += `<button class="item-card__btn item-card__btn--equip" data-equip="${itemId}" ${meetsLevel ? '' : 'disabled'}>Equip</button>`;
      actionsHtml += `<button class="item-card__btn item-card__btn--sell" data-sell="${itemId}">Sell (${formatGold(sellPrice)}g)</button>`;

      html += createItemCardHTML(item, actionsHtml);
    }
  }

  inventoryContent.innerHTML = html;
  wireInventoryHandlers();
}

function wireInventoryHandlers() {
  // Wire unequip
  inventoryContent.querySelectorAll('[data-unequip]').forEach(el => {
    el.addEventListener('click', () => {
      const slot = el.dataset.unequip;
      if (economy.unequipItem(slot)) {
        showToast('Item unequipped', 'info');
      }
    });
  });

  // Wire equip
  inventoryContent.querySelectorAll('[data-equip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.equip;
      const item = ITEMS[itemId];
      if (economy.equipItem(itemId)) {
        showToast(`Equipped ${item.emoji} ${item.name}!`, 'success');
      }
    });
  });

  // Wire sell
  inventoryContent.querySelectorAll('[data-sell]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.sell;
      const item = ITEMS[itemId];
      if (economy.sellItem(itemId)) {
        showToast(`Sold ${item.emoji} ${item.name}`, 'info');
      }
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
    const typeArg = activeFilter !== 'all' ? activeFilter : null;
    economy.sellAllByRarity(rarity, typeArg);
    // renderInventory is triggered by items:bulkSold event
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

function createItemCardHTML(item, actionsHtml) {
  const statsHtml = Object.entries(item.stats)
    .map(([key, val]) => {
      const label = STAT_LABELS[key] || key;
      const display = typeof val === 'number' && val < 1 && val > 0
        ? `+${Math.round(val * 100)}%`
        : `+${val}`;
      return `<span class="item-card__stat">${display} ${label}</span>`;
    })
    .join('');

  return `<div class="item-card item-card--${item.rarity}">
    <div class="item-card__header">
      <span class="item-card__emoji">${item.emoji}</span>
      <div class="item-card__info">
        <div class="item-card__name">${item.name}</div>
        <div class="item-card__rarity item-card__rarity--${item.rarity}">${item.rarity} ${item.type}</div>
      </div>
    </div>
    <div class="item-card__stats">${statsHtml}</div>
    <div class="item-card__actions">${actionsHtml}</div>
  </div>`;
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

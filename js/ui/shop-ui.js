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
import * as economy from '../systems/economy.js';
import { showToast } from './toasts.js';

let shopContent;
let inventoryContent;
let shopGoldDisplay;
let activeTab = 'shop';
let refreshTimerEl = null;

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

  // Inventory list
  html += '<div class="inventory-label">Inventory</div>';

  if (player.inventory.length === 0) {
    html += '<div class="inventory-empty">No items in inventory</div>';
  }

  for (const itemId of player.inventory) {
    const item = ITEMS[itemId];
    if (!item) continue;

    const sellPrice = item.sellPrice || Math.floor(item.buyPrice * 0.25);
    const meetsLevel = player.level >= item.requiredLevel;
    let actionsHtml = '';
    if (!meetsLevel) {
      actionsHtml += `<span class="item-card__level-req">Req. Lv ${item.requiredLevel}</span>`;
    }
    actionsHtml += `<button class="item-card__btn item-card__btn--equip" data-equip="${itemId}" ${meetsLevel ? '' : 'disabled'}>Equip</button>`;
    actionsHtml += `<button class="item-card__btn item-card__btn--sell" data-sell="${itemId}">Sell (${formatGold(sellPrice)}g)</button>`;

    html += createItemCardHTML(item, actionsHtml);
  }

  inventoryContent.innerHTML = html;

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

/**
 * economy.js - Economy System
 *
 * Owns: Shop rotation (v2: randomly generated items), buy, gold helpers.
 * Listens to: zone:changed, shop:requestPurchase, shop:requestRefresh,
 *   combat:monsterKilled, tutorial:grantGold
 * Emits: shop:refreshed, item:purchased, gold:earned, gold:spent
 *
 * Phase 12.5: Sell/bulkSell removed — items.js owns scrap operations.
 * Purchase is now index-based (shop items are generated objects, not static IDs).
 *
 * @see docs/systems/economy.system.md
 * @see docs/design/item-system-v2.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { saveGame } from '../services/storage.js';
import {
  SELL_PRICE_RATIO,
  SHOP_SLOTS_V2, SHOP_REFRESH_INTERVAL_V2,
  SHOP_REFRESH_COSTS
} from '../data/constants.js';

// --- Shop State (transient, not saved) ---
let currentShopItems = [];
let shopRefreshTimer = SHOP_REFRESH_INTERVAL_V2;
let tickAccumulator = 0;

// --- DI Dependencies ---
let deps = {};

// --- Initialization ---

export function init(injected = {}) {
  deps = injected;

  on('zone:changed', () => refreshShop(false));

  // Intent events from UI
  on('shop:requestPurchase', ({ shopIndex }) => purchaseItem(shopIndex));
  on('shop:requestRefresh', () => {
    if (refreshShop(true)) syncShopState();
  });

  // Reward handler (gold granting on monster kill)
  on('combat:monsterKilled', handleMonsterReward);

  // Tutorial bonus gold grants
  on('tutorial:grantGold', ({ amount }) => {
    const p = getPlayer();
    p.gold += amount;
    p.totalGoldEarned += amount;
    emit('gold:earned', { amount, total: p.gold });
  });

  refreshShop(false);
}

// --- Tick ---

export function update(dt) {
  // dt is in seconds; timer is in milliseconds
  shopRefreshTimer -= dt * 1000;
  if (shopRefreshTimer <= 0) {
    refreshShop(false);
  }

  // Sync timer to state + emit tick once per second for live UI updates
  state.shopRefreshTimer = Math.max(0, shopRefreshTimer);
  tickAccumulator += dt;
  if (tickAccumulator >= 1) {
    tickAccumulator -= 1;
    state.shopRefreshCost = getRefreshCost();
    emit('shop:timerTick', { timeLeft: state.shopRefreshTimer });
  }
}

// --- Gold Helpers (used by items.js via DI) ---

/**
 * Deduct gold from player. Returns true if successful, false if insufficient.
 * @param {number} amount
 * @returns {boolean}
 */
export function deductGold(amount) {
  const player = getPlayer();
  if (player.gold < amount) return false;
  player.gold -= amount;
  player.totalGoldSpent += amount;
  emit('gold:spent', { amount, total: player.gold });
  return true;
}

/**
 * Add gold to player.
 * @param {number} amount
 */
export function addGold(amount) {
  const player = getPlayer();
  player.gold += amount;
  player.totalGoldEarned += amount;
  emit('gold:earned', { amount, total: player.gold });
}

// --- Monster Reward ---

/**
 * Grant gold on monster kill (applies goldFind bonus + auto-save).
 */
function handleMonsterReward({ goldReward }) {
  const p = getPlayer();

  // Apply goldFind bonus from equipment/buffs
  const stats = state.computedStats || {};
  const finalGold = Math.floor(goldReward * (1 + (stats.goldFind || 0)));

  p.gold += finalGold;
  p.totalGoldEarned += finalGold;
  emit('gold:earned', { amount: finalGold, total: p.gold });

  // Auto-save on kill milestones
  if (p.statistics.totalKills % 10 === 0) {
    saveGame();
  }
}

// --- Shop v2 Rotation ---

/**
 * Refresh the shop with randomly generated items for the current zone.
 * @param {boolean} manual - If true, charge gold
 * @returns {boolean} Whether refresh succeeded
 */
export function refreshShop(manual) {
  const player = getPlayer();

  if (manual) {
    const cost = getRefreshCost();
    if (player.gold < cost) return false;
    player.gold -= cost;
    player.totalGoldSpent += cost;
    emit('gold:spent', { amount: cost, total: player.gold });
  }

  shopRefreshTimer = SHOP_REFRESH_INTERVAL_V2;

  // Generate SHOP_SLOTS_V2 random items for current zone
  currentShopItems = [];
  if (deps.generateShopItem) {
    for (let i = 0; i < SHOP_SLOTS_V2; i++) {
      currentShopItems.push(deps.generateShopItem(player.currentZone));
    }
  }

  syncShopState();
  emit('shop:refreshed', { items: currentShopItems, manual });
  return true;
}

// --- Purchase (index-based) ---

/**
 * Purchase an item from the shop by index.
 * @param {number} shopIndex - Index in currentShopItems array
 * @returns {boolean} Success
 */
export function purchaseItem(shopIndex) {
  if (shopIndex < 0 || shopIndex >= currentShopItems.length) return false;

  const item = currentShopItems[shopIndex];
  if (!item) return false;

  const player = getPlayer();
  if (player.level < (item.requiredLevel || 1)) return false;
  if (player.gold < item.buyPrice) return false;

  player.gold -= item.buyPrice;
  player.totalGoldSpent += item.buyPrice;
  emit('gold:spent', { amount: item.buyPrice, total: player.gold });

  // Add item via items.js
  if (deps.addItem) {
    deps.addItem(item);
  }

  // Remove from shop display
  currentShopItems[shopIndex] = null;

  emit('item:purchased', { item, shopIndex });
  saveGame();
  return true;
}

/**
 * Sync transient shop data to state so UI can read without importing economy.
 */
function syncShopState() {
  state.shopItems = currentShopItems;
  state.shopRefreshCost = getRefreshCost();
  state.shopRefreshTimer = Math.max(0, shopRefreshTimer);
}

// --- Getters ---

/**
 * Get the current shop refresh cost (flat per zone).
 */
export function getRefreshCost() {
  const player = getPlayer();
  return SHOP_REFRESH_COSTS[player.currentZone] || 200;
}

export function getCurrentShopItems() {
  return currentShopItems;
}

export function getTimeToRefresh() {
  return Math.max(0, shopRefreshTimer);
}

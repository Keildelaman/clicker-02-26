/**
 * economy.js - Economy System
 *
 * Owns: Shop rotation, buy/sell/equip, pricing.
 * Listens to: zone:changed
 * Emits: shop:refreshed, item:purchased, item:sold, item:equipped, item:unequipped
 *
 * @see docs/systems/economy.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { ITEMS } from '../data/items.data.js';
import { ZONES } from '../data/zones.data.js';
import { saveGame } from '../services/storage.js';
import {
  SELL_PRICE_RATIO,
  SHOP_REFRESH_INTERVAL, SHOP_SLOTS, SHOP_RARITY_WEIGHTS,
  SHOP_REFRESH_ESCALATION, SHOP_REFRESH_MAX_MULT
} from '../data/constants.js';

// --- Shop State (transient, not saved) ---
let currentShopItems = [];
let shopRefreshCount = 0;
let shopRefreshTimer = SHOP_REFRESH_INTERVAL;
let tickAccumulator = 0;

// --- Initialization ---

export function init() {
  on('zone:changed', () => {
    shopRefreshCount = 0;
    refreshShop(false);
  });

  // Intent events from UI
  on('shop:requestPurchase', ({ itemId }) => purchaseItem(itemId));
  on('shop:requestSell', ({ itemId }) => sellItem(itemId));
  on('shop:requestBulkSell', ({ rarity, typeFilter }) => sellAllByRarity(rarity, typeFilter));
  on('shop:requestEquip', ({ itemId }) => equipItem(itemId));
  on('shop:requestUnequip', ({ slot }) => unequipItem(slot));
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
    shopRefreshCount = 0;
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

// --- Shop Rotation ---

/**
 * Refresh the shop with random items from the current zone.
 * @param {boolean} manual - If true, charge gold
 * @returns {boolean} Whether refresh succeeded
 */
export function refreshShop(manual) {
  const player = getPlayer();
  const zone = ZONES[player.currentZone];
  if (!zone || !zone.shopItems) return false;

  if (manual) {
    const cost = getRefreshCost();
    if (player.gold < cost) return false;
    player.gold -= cost;
    player.totalGoldSpent += cost;
    shopRefreshCount++;
  }

  shopRefreshTimer = SHOP_REFRESH_INTERVAL;

  // Pick SHOP_SLOTS random items using rarity weights
  const available = zone.shopItems
    .map(id => ITEMS[id])
    .filter(Boolean);

  currentShopItems = [];
  for (let i = 0; i < SHOP_SLOTS; i++) {
    const picked = weightedRandomItem(available);
    if (picked) currentShopItems.push(picked);
  }

  syncShopState();
  emit('shop:refreshed', { items: currentShopItems, manual });
  return true;
}

/**
 * Pick a random item weighted by rarity.
 */
function weightedRandomItem(items) {
  if (items.length === 0) return null;

  const weighted = items.map(item => ({
    item,
    weight: SHOP_RARITY_WEIGHTS[item.rarity] || 0
  })).filter(e => e.weight > 0);

  const totalWeight = weighted.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight === 0) return items[Math.floor(Math.random() * items.length)];

  let roll = Math.random() * totalWeight;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return weighted[weighted.length - 1].item;
}

// --- Purchase ---

/**
 * Purchase an item from the shop.
 * @param {string} itemId - Item to buy
 * @returns {boolean} Success
 */
export function purchaseItem(itemId) {
  const item = ITEMS[itemId];
  if (!item) return false;

  const player = getPlayer();

  if (player.level < item.requiredLevel) return false;
  if (player.gold < item.buyPrice) return false;

  player.gold -= item.buyPrice;
  player.totalGoldSpent += item.buyPrice;
  player.inventory.push(itemId);

  emit('item:purchased', { itemId, item });
  emit('gold:earned', { amount: -item.buyPrice, total: player.gold });
  saveGame();
  return true;
}

// --- Sell ---

/**
 * Sell an item from inventory.
 * @param {string} itemId - Item to sell
 * @returns {boolean} Success
 */
export function sellItem(itemId) {
  const player = getPlayer();

  const idx = player.inventory.indexOf(itemId);
  if (idx === -1) return false;

  const item = ITEMS[itemId];
  if (!item) return false;

  const sellPrice = item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO);

  player.inventory.splice(idx, 1);
  player.gold += sellPrice;
  player.totalGoldEarned += sellPrice;

  emit('item:sold', { itemId, item, sellPrice });
  emit('gold:earned', { amount: sellPrice, total: player.gold });
  saveGame();
  return true;
}

// --- Bulk Sell ---

/**
 * Sell all unequipped inventory items of a given rarity.
 * @param {string} rarity - 'common', 'uncommon', 'rare', 'epic', 'legendary'
 * @returns {{ count: number, totalGold: number } | false}
 */
export function sellAllByRarity(rarity, typeFilter = null) {
  const player = getPlayer();
  const toSell = [];

  // Scan from end so splice indices stay valid
  for (let i = player.inventory.length - 1; i >= 0; i--) {
    const item = ITEMS[player.inventory[i]];
    if (item && item.rarity === rarity && (!typeFilter || item.type === typeFilter)) {
      toSell.push({ index: i, item });
    }
  }
  if (toSell.length === 0) return false;

  let totalGold = 0;
  for (const { index, item } of toSell) {
    const price = item.sellPrice || Math.floor(item.buyPrice * SELL_PRICE_RATIO);
    totalGold += price;
    player.inventory.splice(index, 1);
  }
  player.gold += totalGold;
  player.totalGoldEarned += totalGold;

  emit('items:bulkSold', { rarity, count: toSell.length, totalGold });
  emit('gold:earned', { amount: totalGold, total: player.gold });
  saveGame();
  return { count: toSell.length, totalGold };
}

// --- Equip / Unequip ---

/**
 * Equip an item from inventory.
 * @param {string} itemId - Item to equip
 * @returns {boolean} Success
 */
export function equipItem(itemId) {
  const item = ITEMS[itemId];
  if (!item) return false;

  const player = getPlayer();
  const slot = item.type; // 'weapon', 'armor', or 'accessory'

  // Level check — items have requiredLevel that must be met
  if (player.level < item.requiredLevel) {
    emit('item:equipFailed', { itemId, item, reason: 'level', requiredLevel: item.requiredLevel });
    return false;
  }

  // Remove from inventory
  const idx = player.inventory.indexOf(itemId);
  if (idx === -1) return false;
  player.inventory.splice(idx, 1);

  // Unequip current item in that slot (move to inventory)
  const previousId = player.equipment[slot];
  if (previousId) {
    player.inventory.push(previousId);
    emit('item:unequipped', { itemId: previousId, slot });
  }

  // Equip new item
  player.equipment[slot] = itemId;

  emit('item:equipped', { itemId, item, slot });
  emit('player:statsChanged', {});
  saveGame();
  return true;
}

/**
 * Unequip an item from a slot.
 * @param {string} slot - 'weapon', 'armor', or 'accessory'
 * @returns {boolean} Success
 */
export function unequipItem(slot) {
  const player = getPlayer();
  const itemId = player.equipment[slot];
  if (!itemId) return false;

  player.equipment[slot] = null;
  player.inventory.push(itemId);

  emit('item:unequipped', { itemId, slot });
  emit('player:statsChanged', {});
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

export function getRefreshCost() {
  const player = getPlayer();
  const zone = ZONES[player.currentZone];
  const baseCost = zone ? zone.shopRefreshBase : 25;
  const mult = Math.min(1.0 + shopRefreshCount * SHOP_REFRESH_ESCALATION, SHOP_REFRESH_MAX_MULT);
  return Math.floor(baseCost * mult);
}

export function getCurrentShopItems() {
  return currentShopItems;
}

export function getTimeToRefresh() {
  return Math.max(0, shopRefreshTimer);
}

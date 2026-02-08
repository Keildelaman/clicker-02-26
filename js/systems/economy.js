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
import { getPlayer } from '../core/game-state.js';
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

  // Emit timer tick once per second for live UI updates
  tickAccumulator += dt;
  if (tickAccumulator >= 1) {
    tickAccumulator -= 1;
    emit('shop:timerTick', { timeLeft: Math.max(0, shopRefreshTimer) });
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

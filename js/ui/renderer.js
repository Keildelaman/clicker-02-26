/**
 * renderer.js - Master Render Coordinator
 *
 * Batches all UI updates into a single rAF pass.
 * Systems mark dirty when state changes; renderer reads state and writes DOM.
 *
 * @see docs/architecture/architecture.md
 */

import { on } from '../core/event-bus.js';
import * as combatUI from './combat-ui.js';
import * as statsUI from './stats-ui.js';
import * as barsUI from './bars-ui.js';
import * as toasts from './toasts.js';
import * as modals from './modals.js';
import * as shopUI from './shop-ui.js';
import * as zonesUI from './zones-ui.js';

let dirty = true;

export function markDirty() {
  dirty = true;
}

export function init() {
  // Initialize all UI modules
  combatUI.init();
  statsUI.init();
  barsUI.init();
  toasts.init();
  modals.init();
  shopUI.init();
  zonesUI.init();

  // Mark dirty on state-changing events
  on('combat:click', markDirty);
  on('combat:monsterSpawned', markDirty);
  on('combat:monsterKilled', markDirty);
  on('gold:earned', markDirty);
  on('xp:gained', markDirty);
  on('player:levelUp', markDirty);
  on('player:hpChanged', markDirty);
  on('energy:changed', markDirty);
  on('item:purchased', markDirty);
  on('item:sold', markDirty);
  on('item:equipped', markDirty);
  on('item:unequipped', markDirty);
  on('shop:refreshed', markDirty);
  on('loot:itemDropped', markDirty);
  on('player:damaged', markDirty);
  on('player:died', markDirty);
  on('player:respawned', markDirty);
  on('combat:shieldBroken', markDirty);
  on('combat:phaseChange', markDirty);
  on('combat:monsterEscaped', markDirty);
  on('combat:monsterRegenerated', markDirty);
  on('zone:changed', markDirty);
  on('zone:bossDefeated', markDirty);
  on('zone:bossIntro', markDirty);

  // Initial render
  statsUI.renderInitial();
  barsUI.renderInitial();
}

export function update(dt) {
  if (!dirty) return;
  dirty = false;

  // Batched DOM writes happen via event-driven sub-renderers.
  // Each UI module subscribes to its own events and updates.
  // This update() is a safety net for any state that needs periodic refresh.
}

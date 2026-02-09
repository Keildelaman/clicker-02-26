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
import * as skillsUI from './skills-ui.js';
import * as tutorialUI from './tutorial-ui.js';

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
  skillsUI.init();
  tutorialUI.init();

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
  on('skill:used', markDirty);
  on('skill:unlocked', markDirty);
  on('skill:upgraded', markDirty);
  on('skill:equipped', markDirty);
  on('skill:unequipped', markDirty);
  on('skill:buffApplied', markDirty);
  on('skill:buffExpired', markDirty);
  on('mastery:gained', markDirty);
  on('skill:directDamage', markDirty);
  on('skill:effectTriggered', markDirty);
  on('tutorial:completed', markDirty);

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

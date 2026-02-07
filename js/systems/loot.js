/**
 * loot.js - Loot System
 *
 * Owns: Drop rolls on monster kill.
 * Listens to: combat:monsterKilled
 * Emits: loot:itemDropped
 *
 * @see docs/systems/loot.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { MONSTERS } from '../data/monsters.data.js';
import { ITEMS } from '../data/items.data.js';
import { saveGame } from '../services/storage.js';

export function init() {
  on('combat:monsterKilled', handleMonsterKilled);
}

function handleMonsterKilled({ monster }) {
  if (!monster || !monster.definitionId) return;

  const def = MONSTERS[monster.definitionId];
  if (!def || !def.lootTable || def.lootTable.length === 0) return;

  const player = getPlayer();

  for (const entry of def.lootTable) {
    if (Math.random() < entry.chance) {
      const item = ITEMS[entry.itemId];
      if (!item) continue;

      player.inventory.push(entry.itemId);
      emit('loot:itemDropped', { itemId: entry.itemId, item });
    }
  }
}

export function update(dt) {
  // No tick logic needed
}

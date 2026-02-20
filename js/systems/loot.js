/**
 * loot.js - Loot System v2
 *
 * Owns: Item drops, material drops, boss loot.
 * Listens to: combat:monsterKilled
 * Emits: loot:itemDropped, loot:bossLoot, loot:materialDropped
 *
 * Dependencies injected via init(): generateItem, generateLegendaryItem, addItem
 * from items.js (via main.js DI wiring).
 *
 * @see docs/design/item-system-v2.md
 * @see docs/architecture/item-system-v2-architecture.md
 */

import { on, emit } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { ZONE_ORDER } from '../data/zones.data.js';
import { LEGENDARIES } from '../data/legendaries.data.js';
import {
  DROP_CHANCE_BY_ZONE, DROP_RARITY_WEIGHTS_BY_ZONE,
  BOSS_DROP_RARITY_WEIGHTS, BOSS_SECOND_DROP_CHANCE,
  ZONE_MATERIALS, EQUIPMENT_SLOTS_V2
} from '../data/constants.js';
import { materialDropRate } from '../data/balance.js';

let deps = {};

export function init(injected = {}) {
  deps = injected;
  on('combat:monsterKilled', handleMonsterKilled);
}

export function update(dt) {
  // No tick logic needed
}

// --- Event Handler ---

function handleMonsterKilled({ monster, isBoss }) {
  const zoneId = getPlayer().currentZone;

  if (isBoss) {
    handleBossLoot(monster, zoneId);
  } else {
    handleNormalLoot(zoneId);
    handleMaterialDrop(zoneId);
  }
}

// --- Normal Monster Loot ---

function handleNormalLoot(zoneId) {
  const dropChance = DROP_CHANCE_BY_ZONE[zoneId];
  if (!dropChance || Math.random() >= dropChance) return;

  const rarity = rollRarity(DROP_RARITY_WEIGHTS_BY_ZONE[zoneId]);
  const slot = rollSlot();

  if (!deps.generateItem || !deps.addItem) return;

  const item = deps.generateItem(zoneId, slot, rarity);
  const result = deps.addItem(item);
  emit('loot:itemDropped', { item, destination: result.destination });
}

// --- Boss Loot ---

function handleBossLoot(monster, zoneId) {
  if (!deps.generateItem || !deps.addItem) return;

  const affixTier = monster.affixTier || 1;
  const items = [];

  // Guaranteed Rare+ drop
  const rarity1 = rollRarity(BOSS_DROP_RARITY_WEIGHTS);
  const item1 = generateBossDropItem(rarity1, zoneId, affixTier);
  const result1 = deps.addItem(item1);
  items.push({ item: item1, destination: result1.destination });

  // 40% chance for second drop (same rarity weights)
  if (Math.random() < BOSS_SECOND_DROP_CHANCE) {
    const rarity2 = rollRarity(BOSS_DROP_RARITY_WEIGHTS);
    const item2 = generateBossDropItem(rarity2, zoneId, affixTier);
    const result2 = deps.addItem(item2);
    items.push({ item: item2, destination: result2.destination });
  }

  emit('loot:bossLoot', { items, zoneId });
}

/**
 * Generate a single boss drop item. Legendary rarity attempts zone-specific legendary.
 */
function generateBossDropItem(rarity, zoneId, affixTier) {
  if (rarity === 'legendary') {
    const legendaryId = rollLegendaryForZone(zoneId);
    if (legendaryId && deps.generateLegendaryItem) {
      return deps.generateLegendaryItem(legendaryId, zoneId, affixTier);
    }
    // Fallback: no legendary available for zone, give epic instead
    return deps.generateItem(zoneId, rollSlot(), 'epic');
  }
  return deps.generateItem(zoneId, rollSlot(), rarity);
}

// --- Material Drops ---

function handleMaterialDrop(zoneId) {
  const matInfo = ZONE_MATERIALS[zoneId];
  if (!matInfo) return;

  // Calculate effective drop rate with decay
  const player = getPlayer();
  const highestZoneIdx = Math.max(
    ...player.unlockedZones.map(z => ZONE_ORDER.indexOf(z))
  );
  const currentZoneIdx = ZONE_ORDER.indexOf(zoneId);
  const zonesAbove = Math.max(0, highestZoneIdx - currentZoneIdx);
  const effectiveRate = materialDropRate(matInfo.dropRate, zonesAbove);

  if (Math.random() < effectiveRate) {
    emit('materials:dropped', { materialId: matInfo.id, amount: 1 });
    emit('loot:materialDropped', { materialId: matInfo.id, materialName: matInfo.name, zoneId });
  }
}

// --- Helpers ---

function rollRarity(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return entries[entries.length - 1][0];
}

function rollSlot() {
  return EQUIPMENT_SLOTS_V2[Math.floor(Math.random() * EQUIPMENT_SLOTS_V2.length)];
}

function rollLegendaryForZone(zoneId) {
  const zoneLegendaries = Object.values(LEGENDARIES).filter(l => l.zone === zoneId);
  if (zoneLegendaries.length === 0) return null;
  return zoneLegendaries[Math.floor(Math.random() * zoneLegendaries.length)].id;
}

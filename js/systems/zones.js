/**
 * zones.js - Zone System
 *
 * Owns: Zone travel, unlock progression, boss challenge flow.
 * Listens to: combat:monsterKilled, zone:bossStart
 * Emits: zone:changed, zone:bossIntro, zone:bossDefeated
 *
 * @see docs/data/zones.data.md
 */

import { on, emit } from '../core/event-bus.js';
import { state, getPlayer } from '../core/game-state.js';
import { ZONES, ZONE_ORDER } from '../data/zones.data.js';
import { MONSTERS } from '../data/monsters.data.js';
import { saveGame } from '../services/storage.js';
import { MASTERY_PER_BOSS } from '../data/constants.js';

/**
 * Check if the player can travel to a zone.
 * @param {string} zoneId
 * @returns {boolean}
 */
export function canTravelToZone(zoneId) {
  const player = getPlayer();
  if (!player) return false;
  return player.unlockedZones.includes(zoneId);
}

/**
 * Travel to a zone. Validates unlock, updates state, despawns monster.
 * @param {string} zoneId
 * @returns {boolean} Success
 */
export function travelToZone(zoneId) {
  const player = getPlayer();
  if (!player) return false;

  const zone = ZONES[zoneId];
  if (!zone) return false;

  if (!canTravelToZone(zoneId)) return false;
  if (player.currentZone === zoneId) return false;

  player.currentZone = zoneId;

  // Despawn current monster
  state.currentMonster = null;
  state.combatState = 'idle';

  emit('zone:changed', { zoneId, zone });
  saveGame();
  return true;
}

/**
 * Check if the player has met the kill requirement for the current zone's boss.
 * Already-defeated bosses skip the kill gate (rematches are free).
 * @returns {{ met: boolean, current: number, required: number }}
 */
export function getBossKillProgress() {
  const player = getPlayer();
  if (!player) return { met: false, current: 0, required: 0 };

  const zone = ZONES[player.currentZone];
  if (!zone || !zone.bossId) return { met: true, current: 0, required: 0 };

  // Already-defeated bosses can always be re-challenged
  if (player.bossesDefeated.includes(zone.bossId)) {
    return { met: true, current: zone.bossKillReq || 0, required: zone.bossKillReq || 0 };
  }

  const required = zone.bossKillReq || 0;
  const current = (player.zoneKills && player.zoneKills[player.currentZone]) || 0;
  return { met: current >= required, current, required };
}

/**
 * Start a boss challenge — show the intro modal.
 * Does NOT spawn the boss yet (the modal's "Begin Battle" does that).
 * Gated behind zone kill requirement (skipped for re-challenges).
 */
export function challengeBoss() {
  const player = getPlayer();
  if (!player) return;

  const zone = ZONES[player.currentZone];
  if (!zone || !zone.bossId) return;

  const boss = MONSTERS[zone.bossId];
  if (!boss) return;

  // Check kill gate (re-challenges skip this)
  const progress = getBossKillProgress();
  if (!progress.met) {
    emit('zone:bossLocked', { current: progress.current, required: progress.required, zone });
    return;
  }

  emit('zone:bossIntro', { boss, zone });
}

/**
 * Handle a monster kill — check if it's a boss and process unlock.
 */
function handleMonsterKilled(data) {
  if (!data.isBoss) return;

  const player = getPlayer();
  if (!player) return;

  const bossId = data.definitionId;
  const isFirstKill = !player.bossesDefeated.includes(bossId);

  if (isFirstKill) {
    player.bossesDefeated.push(bossId);
    player.statistics.totalBossKills++;

    // Grant Mastery Points for first boss kill
    player.masteryPoints += MASTERY_PER_BOSS;
    emit('mastery:gained', { amount: MASTERY_PER_BOSS, total: player.masteryPoints, source: 'boss' });

    // Find and unlock the next zone
    const nextZoneId = findNextZone(bossId);
    if (nextZoneId && !player.unlockedZones.includes(nextZoneId)) {
      player.unlockedZones.push(nextZoneId);
    }

    emit('zone:bossDefeated', {
      bossId,
      firstKill: true,
      nextZoneId,
      nextZone: nextZoneId ? ZONES[nextZoneId] : null
    });

    saveGame();
  } else {
    player.statistics.totalBossKills++;

    emit('zone:bossDefeated', {
      bossId,
      firstKill: false,
      nextZoneId: null,
      nextZone: null
    });
  }
}

/**
 * Find the zone that is unlocked by defeating a given boss.
 * @param {string} bossId
 * @returns {string|null} Zone ID
 */
function findNextZone(bossId) {
  for (const zoneId of ZONE_ORDER) {
    const zone = ZONES[zoneId];
    if (zone.unlockCondition.type === 'boss' && zone.unlockCondition.bossId === bossId) {
      return zoneId;
    }
  }
  return null;
}

// --- System Contract ---

export function init() {
  on('combat:monsterKilled', handleMonsterKilled);
  on('zone:autoTravel', ({ zoneId }) => travelToZone(zoneId));
}

export function update(dt) {
  // No tick-based updates needed for zones
}

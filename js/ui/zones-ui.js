/**
 * zones-ui.js - Zone Screen & Boss UI
 *
 * Renders zone selection screen, boss challenge button,
 * and applies zone theme colors.
 *
 * Subscribes to events, reads state — never mutates game state.
 *
 * @see docs/systems/ui.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { getPlayer } from '../core/game-state.js';
import { ZONES, ZONE_ORDER } from '../data/zones.data.js';
import { MONSTERS } from '../data/monsters.data.js';
import { travelToZone, challengeBoss, canTravelToZone } from '../systems/zones.js';

let zonesList = null;
let bossChallenge = null;
let bossChallengeBtn = null;

export function init() {
  zonesList = document.getElementById('zones-list');
  bossChallenge = document.getElementById('boss-challenge');
  bossChallengeBtn = document.getElementById('boss-challenge-btn');

  // Boss challenge button
  if (bossChallengeBtn) {
    bossChallengeBtn.addEventListener('click', () => {
      challengeBoss();
    });
  }

  // Subscribe to events
  on('zone:changed', ({ zoneId }) => {
    applyZoneTheme(zoneId);
    updateBossButton();
  });
  on('zone:bossDefeated', updateBossButton);
  on('combat:monsterSpawned', updateBossButton);

  // Apply initial theme from player's current zone
  const player = getPlayer();
  if (player) {
    applyZoneTheme(player.currentZone);
    updateBossButton();
  }
}

/**
 * Called when zones screen becomes visible.
 */
export function onShow() {
  renderZoneList();
}

/**
 * Render the list of zone cards.
 */
function renderZoneList() {
  if (!zonesList) return;
  const player = getPlayer();
  if (!player) return;

  zonesList.innerHTML = '';

  for (const zoneId of ZONE_ORDER) {
    const zone = ZONES[zoneId];
    if (!zone) continue;

    const isUnlocked = player.unlockedZones.includes(zoneId);
    const isCurrent = player.currentZone === zoneId;
    const bossDefeated = zone.bossId && player.bossesDefeated.includes(zone.bossId);

    const card = document.createElement('div');
    card.className = 'zone-card';
    if (isCurrent) card.classList.add('zone-card--current');
    if (!isUnlocked) card.classList.add('zone-card--locked');

    // Zone info
    const header = document.createElement('div');
    header.className = 'zone-card__header';

    const emoji = document.createElement('span');
    emoji.className = 'zone-card__emoji';
    emoji.textContent = zone.emoji;

    const info = document.createElement('div');
    info.className = 'zone-card__info';

    const name = document.createElement('div');
    name.className = 'zone-card__name';
    name.textContent = zone.name;

    const levels = document.createElement('div');
    levels.className = 'zone-card__levels';
    levels.textContent = `Lv. ${zone.levelMin} - ${zone.levelMax}`;

    info.appendChild(name);
    info.appendChild(levels);
    header.appendChild(emoji);
    header.appendChild(info);

    // Status / Action
    const actions = document.createElement('div');
    actions.className = 'zone-card__actions';

    if (!isUnlocked) {
      // Show unlock condition
      const lockText = document.createElement('div');
      lockText.className = 'zone-card__lock';
      const unlockBoss = zone.unlockCondition.bossId ? MONSTERS[zone.unlockCondition.bossId] : null;
      lockText.textContent = unlockBoss ? `Defeat ${unlockBoss.name}` : 'Locked';
      actions.appendChild(lockText);
    } else if (isCurrent) {
      const currentBadge = document.createElement('div');
      currentBadge.className = 'zone-card__current-badge';
      currentBadge.textContent = 'CURRENT';
      actions.appendChild(currentBadge);

      if (bossDefeated) {
        const bossStatus = document.createElement('div');
        bossStatus.className = 'zone-card__boss-status zone-card__boss-status--defeated';
        bossStatus.textContent = 'Boss defeated';
        actions.appendChild(bossStatus);
      }
    } else {
      const travelBtn = document.createElement('button');
      travelBtn.className = 'zone-card__btn';
      travelBtn.textContent = 'TRAVEL';
      travelBtn.addEventListener('click', () => {
        travelToZone(zoneId);
        renderZoneList(); // Re-render after travel
      });
      actions.appendChild(travelBtn);

      if (bossDefeated) {
        const bossStatus = document.createElement('div');
        bossStatus.className = 'zone-card__boss-status zone-card__boss-status--defeated';
        bossStatus.textContent = 'Boss defeated';
        actions.appendChild(bossStatus);
      }
    }

    card.appendChild(header);
    card.appendChild(actions);
    zonesList.appendChild(card);
  }
}

/**
 * Show/hide boss challenge button on the combat screen.
 */
function updateBossButton() {
  if (!bossChallenge) return;
  const player = getPlayer();
  if (!player) return;

  const zone = ZONES[player.currentZone];
  if (!zone || !zone.bossId) {
    bossChallenge.style.display = 'none';
    return;
  }

  bossChallenge.style.display = '';

  const boss = MONSTERS[zone.bossId];
  const defeated = player.bossesDefeated.includes(zone.bossId);

  if (bossChallengeBtn) {
    bossChallengeBtn.textContent = defeated
      ? `RE-CHALLENGE ${boss ? boss.name.toUpperCase() : 'BOSS'}`
      : `CHALLENGE ${boss ? boss.name.toUpperCase() : 'BOSS'}`;
  }
}

/**
 * Apply zone theme colors to CSS custom properties.
 * @param {string} zoneId
 */
export function applyZoneTheme(zoneId) {
  const zone = ZONES[zoneId];
  if (!zone || !zone.theme) return;

  const root = document.documentElement;
  root.style.setProperty('--zone-primary', zone.theme.primary);
  root.style.setProperty('--zone-secondary', zone.theme.secondary);
  root.style.setProperty('--zone-accent', zone.theme.accent);

  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', zone.theme.primary);
}

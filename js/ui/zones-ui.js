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
import { ZONE_MATERIALS } from '../data/constants.js';
import { showToast } from './toasts.js';

let zonesList = null;
let bossChallenge = null;
let bossChallengeBtn = null;
let bossKillProgress = null;

export function init() {
  zonesList = document.getElementById('zones-list');
  bossChallenge = document.getElementById('boss-challenge');
  bossChallengeBtn = document.getElementById('boss-challenge-btn');
  bossKillProgress = document.getElementById('boss-kill-progress');

  // Boss challenge button (stopPropagation so taps don't hit monster area)
  if (bossChallengeBtn) {
    bossChallengeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emit('zone:requestBoss');
    });
  }

  // Delegated click handler for zone travel buttons
  if (zonesList) {
    zonesList.addEventListener('click', (e) => {
      const travelBtn = e.target.closest('[data-zone-id]');
      if (travelBtn) {
        emit('zone:requestTravel', { zoneId: travelBtn.dataset.zoneId });
      }
    });
  }

  // Subscribe to events
  on('zone:changed', ({ zoneId }) => {
    applyZoneTheme(zoneId);
    updateBossButton();
    renderZoneList();
  });
  on('zone:bossDefeated', updateBossButton);
  on('combat:monsterSpawned', updateBossButton);
  on('zone:killTracked', updateBossButton);
  on('zone:bossLocked', ({ current, required }) => {
    showToast(`Defeat ${required - current} more monsters!`, 'warning');
  });
  on('zone:insufficientMaterials', ({ materialName, current, required }) => {
    showToast(`Need ${required - current} more ${materialName}!`, 'warning');
  });
  on('materials:added', updateBossButton);
  on('materials:spent', updateBossButton);

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
      travelBtn.dataset.zoneId = zoneId;
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
 * Derive boss kill progress from player state + zone data (read-only).
 */
function deriveBossKillProgress(player, zone) {
  if (!zone || !zone.bossId) return { met: true, current: 0, required: 0 };
  if (player.bossesDefeated.includes(zone.bossId)) {
    return { met: true, current: zone.bossKillReq || 0, required: zone.bossKillReq || 0 };
  }
  const required = zone.bossKillReq || 0;
  const current = (player.zoneKills && player.zoneKills[player.currentZone]) || 0;
  return { met: current >= required, current, required };
}

/**
 * Show/hide boss challenge button on the combat screen.
 * Shows kill progress bar when boss is locked behind kill gate.
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
  const progress = deriveBossKillProgress(player, zone);

  // Check material sufficiency
  const matInfo = ZONE_MATERIALS[player.currentZone];
  const hasMaterials = !matInfo || (player.materials[matInfo.id] || 0) >= matInfo.bossCost;

  if (bossChallengeBtn) {
    if (defeated || progress.met) {
      bossChallengeBtn.textContent = '\u{1F480} BOSS';
      bossChallengeBtn.disabled = false;
      // Only pulse when truly ready (kills met AND materials sufficient)
      bossChallengeBtn.classList.toggle('boss-badge__btn--no-materials', !hasMaterials && !defeated);
    } else {
      bossChallengeBtn.textContent = `\u{1F480} ${progress.current}/${progress.required}`;
      bossChallengeBtn.disabled = true;
      bossChallengeBtn.classList.remove('boss-badge__btn--no-materials');
    }
  }

  // Update material cost display
  updateMaterialDisplay(player);

  // Hide kill progress (folded into button text now)
  if (bossKillProgress) {
    bossKillProgress.style.display = 'none';
  }
}

/**
 * Show material cost below the boss button.
 * @param {Object} player
 */
function updateMaterialDisplay(player) {
  const zone = ZONES[player.currentZone];
  const matInfo = ZONE_MATERIALS[player.currentZone];

  // Remove existing material display
  const existing = document.getElementById('boss-material-display');
  if (existing) existing.remove();

  if (!matInfo || !zone || !zone.bossId) return;

  const current = player.materials[matInfo.id] || 0;
  const required = matInfo.bossCost;
  const sufficient = current >= required;
  const cls = sufficient ? 'boss-material--sufficient' : 'boss-material--insufficient';

  const el = document.createElement('div');
  el.id = 'boss-material-display';
  el.className = `boss-material ${cls}`;
  el.textContent = `${current}/${required}`;
  el.title = matInfo.name;

  if (bossChallenge) {
    bossChallenge.appendChild(el);
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

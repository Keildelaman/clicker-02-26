/**
 * tutorial.js - Tutorial & Onboarding System
 *
 * Event-driven tutorial: subscribes to game events, emits UI events
 * (tutorial:showModal, tutorial:tip) for display, and delegates
 * bonuses to owning systems via intent events (tutorial:grantGold,
 * tutorial:fullHeal). Tracks completion state on state.player.tutorial.
 * No tick updates needed — purely reactive.
 *
 * @see docs/systems/tutorial.system.md
 */

import { on, emit } from '../core/event-bus.js';
import { state } from '../core/game-state.js';
import {
  FIRST_KILL_BONUS_GOLD,
  FIRST_ITEM_BONUS_GOLD,
  FIRST_BOSS_BONUS_MULTIPLIER,
  MIN_TIME_BETWEEN_TIPS,
  MAX_TIPS_PER_SESSION,
  TIP_DISPLAY_DURATION,
  TIPS_DISABLED_AFTER_LEVEL,
  SHOP_SUGGEST_LEVEL,
  SHOP_SUGGEST_GOLD,
  LEVEL_UP_CELEBRATION
} from '../data/constants.js';

let sessionTipCount = 0;

// --- Helpers ---

function isCompleted(key) {
  return !!state.player.tutorial.completed[key];
}

function markCompleted(key) {
  state.player.tutorial.completed[key] = true;
  emit('tutorial:completed', { step: key });
}

function canShowTip() {
  const tut = state.player.tutorial;
  if (!tut.tutorialEnabled) return false;
  if (state.player.level >= TIPS_DISABLED_AFTER_LEVEL) return false;
  if (sessionTipCount >= MAX_TIPS_PER_SESSION) return false;
  if (tut.lastTipTime && (Date.now() - tut.lastTipTime < MIN_TIME_BETWEEN_TIPS)) return false;
  return true;
}

function showTip(message, type = 'info') {
  if (!canShowTip()) return;
  emit('tutorial:tip', { message, type, duration: TIP_DISPLAY_DURATION });
  state.player.tutorial.lastTipTime = Date.now();
  state.player.tutorial.tipsShown++;
  sessionTipCount++;
}

function showModal(config) {
  emit('tutorial:showModal', config);
  state.player.tutorial.lastTipTime = Date.now();
  state.player.tutorial.tipsShown++;
  sessionTipCount++;
}

// --- Event Handlers ---

function onTutorialStart() {
  if (!isCompleted('first_load')) {
    markCompleted('first_load');
    emit('tutorial:highlight', { target: 'monster-area' });
  }
}

function onCombatClick() {
  if (!isCompleted('first_click')) {
    markCompleted('first_click');
    emit('tutorial:clearHighlight');
  }
}

function onMonsterKilled({ goldReward, isBoss }) {
  // First kill bonus
  if (!isCompleted('first_kill')) {
    markCompleted('first_kill');
    emit('tutorial:grantGold', { amount: FIRST_KILL_BONUS_GOLD });

    showModal({
      icon: '\u2694\uFE0F',
      title: 'FIRST BLOOD!',
      body: `You defeated your first monster!<br><span class="tutorial-bonus">+${FIRST_KILL_BONUS_GOLD} bonus gold!</span><br><br>Keep clicking to grow stronger!`,
      buttons: [{ label: 'CONTINUE', primary: true }]
    });
  }

  // Shop suggestion (on kill check since gold just changed)
  checkShopSuggestion();
}

function showSkillBarIntro() {
  if (isCompleted('skill_bar_intro')) return;
  markCompleted('skill_bar_intro');

  showModal({
    icon: '\u2B50',
    title: 'SKILL BAR',
    body: 'This is your <strong>Skill Bar</strong>! You have <strong>Power Strike</strong> equipped.<div class="tutorial-tip">Tap it when you have enough Energy!</div>',
    buttons: [{ label: 'GOT IT!', primary: true }],
    highlight: '#skill-slot-0'
  });
}

function onLevelUp({ newLevel }) {
  if (!isCompleted('first_level_up')) {
    markCompleted('first_level_up');
    // Show tutorial modal after level-up celebration auto-dismisses
    setTimeout(() => {
      showModal({
        icon: '\u2728',
        title: 'LEVEL UP!',
        body: 'Your stats improved!<div class="tutorial-tip">+1 Attack, +10 Max HP<br>Full HP Restored!</div>',
        buttons: [{ label: 'AWESOME!', primary: true }]
      });
    }, LEVEL_UP_CELEBRATION + 300);
  }

  // Shop suggestion at level threshold
  checkShopSuggestion();
}

function onSkillUsed() {
  if (!isCompleted('first_skill_use')) {
    markCompleted('first_skill_use');
  }
}

function onEnergyChanged({ energy, maxEnergy }) {
  // Skill bar intro when player first has enough energy for Power Strike (15)
  if (!isCompleted('skill_bar_intro') && energy >= 15) {
    showSkillBarIntro();
  }

  if (!isCompleted('energy_full') && energy >= maxEnergy) {
    markCompleted('energy_full');
    showModal({
      icon: '\u26A1',
      title: 'ENERGY FULL!',
      body: 'Your Energy bar is full!<div class="tutorial-tip">Use a <strong>Skill</strong> to spend it!<br>Tap Power Strike now!</div>',
      buttons: [{ label: 'GOT IT!', primary: true }],
      highlight: '#skill-slot-0'
    });
  }
}

function onMonsterSpawned({ monster }) {
  if (!monster) return;
  const types = (monster.type || '').split('+');
  if (types.includes('aggressive') && !isCompleted('first_aggressive')) {
    markCompleted('first_aggressive');
    showModal({
      icon: '\u26A0\uFE0F',
      title: 'NEW THREAT!',
      body: 'This monster <strong>fights back</strong>!<div class="tutorial-warning">When it GLOWS RED: <strong>DON\'T CLICK!</strong><br>Wait for the attack to end, then resume clicking.</div>',
      buttons: [{ label: "I'M READY!", primary: true }]
    });
  }
}

function onBossDefeated({ bossId, firstKill }) {
  if (!isCompleted('first_boss_killed') && firstKill) {
    markCompleted('first_boss_killed');
    // Grant 50% bonus gold — read boss goldReward from current monster
    const m = state.currentMonster;
    if (m) {
      const bonusGold = Math.floor(m.goldReward * (FIRST_BOSS_BONUS_MULTIPLIER - 1));
      emit('tutorial:grantGold', { amount: bonusGold });
      emit('tutorial:tip', { message: `Boss Slayer! +${bonusGold} bonus gold!`, type: 'success', duration: TIP_DISPLAY_DURATION });
      sessionTipCount++;
    }
  }
}

function onZoneChanged({ zoneId }) {
  if (!isCompleted('first_zone_travel') && zoneId !== 'whisperwood') {
    markCompleted('first_zone_travel');
    emit('tutorial:fullHeal');
    emit('tutorial:tip', { message: 'New lands! Full HP & Energy restored!', type: 'success', duration: TIP_DISPLAY_DURATION });
    sessionTipCount++;
  }
}

function onPlayerDied({ goldLost }) {
  if (!isCompleted('first_death')) {
    markCompleted('first_death');
    // Mercy: refund lost gold
    if (goldLost > 0) {
      emit('tutorial:grantGold', { amount: goldLost });
    }
    showModal({
      icon: '\uD83D\uDC80',
      title: 'DEFEATED!',
      body: `Normally you lose <strong>half your gold</strong> on death.<div class="tutorial-tip">Mercy! Refunded this time. Watch your HP!</div>`,
      buttons: [{ label: "I'LL BE BACK!", primary: true }]
    });
  }
}

function onItemPurchased() {
  if (!isCompleted('first_item_bought')) {
    markCompleted('first_item_bought');
    emit('tutorial:grantGold', { amount: FIRST_ITEM_BONUS_GOLD });
    showModal({
      icon: '\uD83D\uDDE1\uFE0F',
      title: 'NICE GEAR!',
      body: `Go to <strong>Inventory</strong> to equip your gear!<br><span class="tutorial-bonus">+${FIRST_ITEM_BONUS_GOLD} gold bonus!</span>`,
      buttons: [{ label: 'START SLAYING!', primary: true }]
    });
  }
}

function checkShopSuggestion() {
  if (isCompleted('shop_suggestion')) return;
  const p = state.player;
  if (p.level >= SHOP_SUGGEST_LEVEL && p.gold >= SHOP_SUGGEST_GOLD) {
    markCompleted('shop_suggestion');
    showModal({
      icon: '\uD83D\uDED2',
      title: 'VISIT THE SHOP!',
      body: 'You have some gold! Buy better equipment to deal more damage!',
      buttons: [
        { label: 'GO TO SHOP', primary: true, action: 'nav:navigate', actionData: { screen: 'shop' } },
        { label: 'LATER', primary: false }
      ],
      highlight: '.nav-btn[data-screen="shop"]'
    });
  }
}

// --- Initialization ---

export function init() {
  on('tutorial:start', onTutorialStart);
  on('combat:click', onCombatClick);
  on('combat:monsterKilled', onMonsterKilled);
  on('player:levelUp', onLevelUp);
  on('skill:used', onSkillUsed);
  on('energy:changed', onEnergyChanged);
  on('combat:monsterSpawned', onMonsterSpawned);
  on('zone:bossDefeated', onBossDefeated);
  on('zone:changed', onZoneChanged);
  on('player:died', onPlayerDied);
  on('item:purchased', onItemPurchased);
}

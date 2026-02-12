# Skill System v2 — Architecture & Implementation Guide

> Developer reference for implementing the skill system v2.
> **Canonical specification:** `docs/design/skill-system-v2.md`
> **This document:** How to build it. Code patterns, data structures, contracts, integration points.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Skill Data Schema](#2-skill-data-schema)
3. [Player State Schema](#3-player-state-schema)
4. [Transient State Schema](#4-transient-state-schema)
5. [Mechanic Types](#5-mechanic-types)
6. [Effect Handler Contract](#6-effect-handler-contract)
7. [Passive Handler Contract](#7-passive-handler-contract)
8. [Combat Integration](#8-combat-integration)
9. [Cooldown System](#9-cooldown-system)
10. [Event Catalog](#10-event-catalog)
11. [Adding a New Skill](#11-adding-a-new-skill)

---

## 1. System Overview

### What v2 Replaces

| Component | v1 (Phase 7) | v2 (Phase 7.5) |
|-----------|-------------|----------------|
| Currency | Mastery Points (MP) — from boss kills + level milestones | Skill Points (SP) — 1 every 3 levels |
| Unlock cost | Variable per tier (3-10 MP) | 1 SP per skill (Power Strike free) |
| Upgrade cost | 1, 2, 3, 4 MP | 1 SP per level |
| Skill count | 25 (16 active + 9 passive) | 25 (15 active + 10 passive) |
| Effect model | Simple: nextAttackMultiplier, buff, instantHeal | Rich: hit modifiers, click modifiers, toggle, channel, instant, HP-cost, CDR utility |
| Passive model | Stat bonuses in `getComputedStats()` | Event-driven: subscribe/unsubscribe on equip/unequip |
| Energy values | 5/click, 15/kill, 2/sec regen | 3/click, 10/kill, 1/sec regen |
| Cooldown model | `Date.now()` timestamps | Tick-based decrement in `update(dt)` |

### Key Design Differences

1. **Skills transform gameplay** — not just stat bonuses. Hit modifiers change how your next click works. Toggles change your energy economy. Channels pause clicking entirely.
2. **Only one hit modifier at a time** — prevents multiplicative exploits. Last activated replaces previous.
3. **Click modifiers vs hit modifiers** — different scopes. Hit modifiers affect primary hit only. Click modifiers affect all hits in a click (including Flurry bonus hits).
4. **Passives are event-driven** — they subscribe to events when equipped and unsubscribe when removed. No polling.
5. **Energy is scarce by design** — 3/click, 10/kill, 1/sec forces real decisions about which skills to use.

### Files Involved

| File | Role |
|------|------|
| `js/data/skills.data.js` | All 25 skill definitions (pure data, no imports) |
| `js/data/constants.js` | SP system, energy v2, respec costs |
| `js/systems/skills.js` | Skill logic: unlock, upgrade, use, cooldowns, effects, passives |
| `js/systems/combat.js` | Click damage pipeline, instant skill damage, channel release |
| `js/systems/player.js` | `createNewPlayer()`, `getComputedStats()` with passive modifiers |
| `js/systems/energy.js` | Energy gain/spend with v2 values |
| `js/core/game-state.js` | Transient skill state (hitModifier, toggleStates, etc.) |
| `js/services/storage.js` | Save migration v3→v4 |
| `js/ui/skills-ui.js` | Skills screen, skill bar, buff indicators |

---

## 2. Skill Data Schema

Every skill in `js/data/skills.data.js` follows this shape:

```javascript
{
  id: 'power_strike',              // Unique identifier (snake_case)
  name: 'Power Strike',            // Display name
  description: 'Next click deals {damage}% damage.',  // {key} tokens replaced at render
  category: 'power',               // 'speed' | 'power' | 'crit' | 'spell' | 'utility'
  type: 'active',                  // 'active' | 'passive'
  tags: ['power', 'attack'],       // For filtering, combo detection
  mechanic: 'next_click_hit',      // See Mechanic Types table
  unlockLevel: 1,                  // Player level required to see/unlock
  unlockCost: 0,                   // SP cost (0 = free, Power Strike only)
  upgradeCost: 1,                  // SP per upgrade level (constant)
  maxLevel: 5,                     // Maximum upgrade level
  mutation: null,                  // null for v1.0 (future hook)
  levels: {
    1: { damage: 1000, cooldown: 10, energyCost: 35 },
    2: { damage: 1200, cooldown: 10, energyCost: 35 },
    3: { damage: 1500, cooldown: 9,  energyCost: 33 },
    4: { damage: 1800, cooldown: 9,  energyCost: 33 },
    5: { damage: 2200, cooldown: 8,  energyCost: 30 }
  }
}
```

### Level Data Shapes by Mechanic

Different mechanics require different fields in the `levels` object:

| Mechanic | Level Data Fields |
|----------|------------------|
| `next_click_hit` | `damage`, `cooldown`, `energyCost` |
| `next_click_hit` (Execute) | `hpThreshold`, `strongMult`, `weakMult`, `cooldown`, `energyCost` |
| `next_click_hit` (Shatter) | `hpPercent`, `cooldown`, `energyCost` |
| `next_click_click` | `charges`, `cooldown`, `energyCost` |
| `instant` | `hits`, `damagePerHit`, `cooldown`, `energyCost` (Barrage) |
| `instant` | `damage`, `cooldown`, `energyCost` (Arcane Bolt) |
| `instant` (Chain Lightning) | `damage`, `overkillCarry`, `cooldown`, `energyCost` |
| `instant` (Shield Bash) | `damage`, `shieldPercent`, `shieldDuration`, `cooldown`, `energyCost` |
| `instant` (Energy Surge) | `energyGained`, `cooldown` (no energyCost) |
| `instant` (Life Tap) | `hpCostPercent`, `energyGained`, `cooldown` |
| `buff` | `hitsPerClick`, `duration`, `cooldown`, `energyCost` (Flurry) |
| `buff` (Adrenaline Rush) | `duration`, `drainRate`, `cooldown` (no energyCost) |
| `toggle` | `damagePerStack`, `maxStacks`, `decayTimer`, `drainPerSec` |
| `channel` | `minMult`, `maxMult`, `minDuration`, `maxDuration`, `cooldown`, `energyCost` |
| `cd_utility` | `cdrAmount`, `cooldown`, `energyCost` |
| Passive: `click_mastery` | `damagePerStack`, `maxStacks`, `clickWindow` |
| Passive: `vampiric_strikes` | `healPercent` |
| Passive: `critical_flow` | `energyPerCrit` |
| Passive: `heavy_handed` | `damageBonus`, `energyPerClick` |
| Passive: `combo_artist` | `damageBonus`, `buffDuration`, `triggerWindow` |
| Passive: `berserker` | `hpThreshold`, `damageBonus`, `critBonus` |
| Passive: `efficient_casting` | `costReduction` |
| Passive: `spell_weaver` | `cdrPerUse` |
| Passive: `residual_energy` | `energyOnEnd` |
| Passive: `focused_mind` | `idleRegenPerSec` |

---

## 3. Player State Schema

Persistent state stored in `state.player` (saved to localStorage):

```javascript
player: {
  // ... existing fields (name, level, xp, gold, hp, energy, equipment, inventory, etc.)

  // === SKILL v2 FIELDS (replace v1 masteryPoints/masterySpent/etc.) ===
  skillPoints: 0,                   // Current unspent SP
  totalSPEarned: 0,                 // Lifetime SP earned (tracking only)
  respecCount: 0,                   // Number of respecs done (for cost scaling)

  unlockedSkills: {                 // Map of skill_id → current level
    'power_strike': 1               // Power Strike starts unlocked at Lv1
  },

  equippedActive: [                 // 4 active skill slots
    'power_strike',                 // Slot 0 — Power Strike pre-equipped
    null,                           // Slot 1
    null,                           // Slot 2
    null                            // Slot 3
  ],

  equippedPassive: [                // 3 passive skill slots
    null,                           // Slot 0
    null,                           // Slot 1
    null                            // Slot 2
  ],

  skillCooldowns: {},               // skill_id → remaining seconds (float)
}
```

### Fields Removed from v1

```javascript
// DELETE these in save migration:
masteryPoints       // → replaced by skillPoints
masterySpent        // → replaced by totalSPEarned - skillPoints
unlockedSkills: []  // → replaced by unlockedSkills: {} (array → map)
skills: {}          // → merged into unlockedSkills map
equippedActiveSkills: []   // → replaced by equippedActive
equippedPassiveSkills: []  // → replaced by equippedPassive
```

### Save Migration (v3→v4)

```javascript
function migrateV3toV4(data) {
  // Calculate SP refund based on level
  const spRefund = Math.floor(data.level / 3);

  data.skillPoints = spRefund;
  data.totalSPEarned = spRefund;
  data.respecCount = 0;
  data.unlockedSkills = { 'power_strike': 1 };
  data.equippedActive = ['power_strike', null, null, null];
  data.equippedPassive = [null, null, null];
  data.skillCooldowns = {};

  // Clean up old fields
  delete data.masteryPoints;
  delete data.masterySpent;
  delete data.skills;
  // Old equippedActiveSkills/equippedPassiveSkills cleaned up

  data.saveVersion = 4;
  return data;
}
```

---

## 4. Transient State Schema

Non-persistent state in `game-state.js` — resets on every page load:

```javascript
state: {
  // ... existing transient fields (currentMonster, combatState, etc.)

  // === SKILL v2 TRANSIENT STATE ===

  hitModifier: null,
  // Currently queued hit modifier. Only one at a time.
  // Shape: { skillId: 'power_strike', multiplier: 10.0 }
  // Shape (Execute): { skillId: 'execute', hpThreshold: 0.30, strongMult: 8.0, weakMult: 1.5 }
  // Shape (Shatter): { skillId: 'shatter', hpPercent: 0.08 }
  // Set by setHitModifier(), consumed by combat.js on next click.

  clickModifiers: {},
  // Active click modifiers with remaining charges.
  // Shape: { 'precision': { charges: 3 } }
  // Decremented per click (not per hit). Removed when charges reach 0.

  toggleStates: {},
  // Active toggle skills.
  // Shape: { 'momentum': { active: true, stacks: 5, lastClickTime: 0 } }
  // Managed by skills.js update(dt) for drain/decay.

  channelState: null,
  // Active channel state (only one channel at a time).
  // Shape: { skillId: 'charge_up', startTime: <ms>, minDuration: 1.0, maxDuration: 3.0, minMult: 5.0, maxMult: 15.0 }
  // Set by startChannel(), consumed by releaseChannel().

  activeBuffs: {},
  // Timed buffs from active skills.
  // Shape: { 'flurry': { remaining: 4.0, hitsPerClick: 2 },
  //          'adrenaline_rush': { remaining: 4.0, drainRate: 12 },
  //          'combo_artist': { remaining: 4.0, damageBonus: 0.30 } }
  // Decremented in skills.update(dt). Removed when remaining ≤ 0.

  playerShield: null,
  // Active shield from Shield Bash.
  // Shape: { amount: 70, remaining: 6.0, source: 'shield_bash' }
  // Amount decremented by damage in health.js. Timer decremented in skills.update(dt).

  passiveStates: {},
  // Runtime state for equipped passives.
  // Shape: { 'click_mastery': { stacks: 5, lastClickTime: 0 },
  //          'combo_artist': { lastSkillTime: 0, lastSkillId: null } }
  // Initialized on passive equip, cleared on unequip.

  lastClickTime: 0,
  // Timestamp (ms) of last combat click. Used by Focused Mind, Click Mastery.
}
```

---

## 5. Mechanic Types

### Active Skill Mechanics

| Mechanic ID | Behavior | State Required | Lifecycle |
|-------------|----------|----------------|-----------|
| `next_click_hit` | Sets a hit modifier on `state.hitModifier`. Consumed on next click's PRIMARY hit only. | `hitModifier` | Activate → set modifier → wait → click consumes → emit `skill:hitModifierConsumed` |
| `next_click_click` | Sets a click modifier on `state.clickModifiers`. Affects entire click (all hits). Counter decrements per click. | `clickModifiers` | Activate → set modifier → clicks decrement charges → last charge consumed → emit `skill:effectEnded` |
| `buff` | Adds timed buff to `state.activeBuffs`. Enhances attacks for duration. | `activeBuffs` | Activate → add buff → update(dt) decrements → expires → emit `skill:effectEnded` |
| `toggle` | Flips toggle state in `state.toggleStates`. Drains energy while ON. | `toggleStates` | Toggle ON → drain energy/tick → build stacks → toggle OFF or auto-OFF at 0 energy → emit `skill:toggleChanged` |
| `channel` | Sets `state.channelState`. Blocks clicks. Auto-fires on release. | `channelState` | Activate → set channel → block clicks → UI hold → release → calculate damage → auto-fire → emit `skill:channelRelease` |
| `instant` | Fires immediately. Deals damage or grants resource. No lingering state. | None | Activate → emit `skill:instantDamage` or grant resource → done |
| `hp_cost` | Costs HP instead of energy. Grants energy. | None | Activate → deduct HP → grant energy → done |
| `cd_utility` | Reduces other skills' cooldowns. No damage. | None | Activate → reduce all other CDs → done |

### Passive Skill Model

Passives don't have mechanic IDs. They use the PASSIVE_HANDLERS map (see section 7). Each passive subscribes to events when equipped and stores any runtime state in `state.passiveStates[skillId]`.

---

## 6. Effect Handler Contract

### Active Skill Handler Signature

```javascript
const EFFECT_HANDLERS = {
  power_strike: (skillDef, levelData, ctx) => {
    ctx.setHitModifier('power_strike', { multiplier: levelData.damage / 100 });
  },
  // ... one entry per active skill id
};
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `skillDef` | Object | Full skill definition from `skills.data.js` |
| `levelData` | Object | The `levels[currentLevel]` data for the skill |
| `ctx` | Object | Effect context with methods (see below) |

### Effect Context Methods

The context object is created fresh for each skill activation:

```javascript
function createEffectContext() {
  return {
    // --- Hit Modifier ---
    setHitModifier(skillId, data) {
      // Replaces any existing hit modifier.
      // data shape varies by skill:
      //   Power Strike: { multiplier: 10.0 }
      //   Execute: { hpThreshold: 0.30, strongMult: 8.0, weakMult: 1.5 }
      //   Shatter: { hpPercent: 0.08 }
      state.hitModifier = { skillId, ...data };
      emit('skill:hitModifierSet', { skillId });
    },

    // --- Click Modifier ---
    setClickModifier(skillId, charges) {
      // Adds/replaces a click modifier with N charges.
      // Consumed per click (not per hit). All hits in the click benefit.
      state.clickModifiers[skillId] = { charges };
      emit('skill:clickModifierSet', { skillId, charges });
    },

    // --- Instant Damage ---
    dealInstantDamage(hits, damagePerHitPercent) {
      // Emits event for combat.js to apply damage to current monster.
      // Each hit can crit independently. Benefits from passive damage bonuses.
      emit('skill:instantDamage', { hits, damagePerHitPercent });
    },

    dealInstantDamageFlat(damage) {
      // For Chain Lightning: emit a single instance of flat damage.
      emit('skill:instantDamage', { hits: 1, flatDamage: damage });
    },

    // --- Buffs ---
    startBuff(skillId, duration, effects) {
      // Adds a timed buff. effects is an object with buff-specific data.
      // Same buff ID refreshes duration (does not stack with itself).
      state.activeBuffs[skillId] = { remaining: duration, ...effects };
      emit('skill:buffApplied', { skillId, duration });
    },

    // --- Resource ---
    grantEnergy(amount) {
      // Add energy, capped at MAX_ENERGY.
      const player = getPlayer();
      player.energy = Math.min(player.energy + amount, MAX_ENERGY);
      emit('energy:changed', { current: player.energy, max: MAX_ENERGY });
    },

    grantShield(amount, duration) {
      // Set player shield. Does not stack (refreshes).
      state.playerShield = { amount, remaining: duration, source: 'shield_bash' };
      emit('skill:shieldApplied', { amount, duration });
    },

    costHP(percent) {
      // Deduct % of CURRENT HP. Returns amount deducted.
      const player = getPlayer();
      const cost = Math.floor(player.hp * percent);
      player.hp -= cost;
      emit('player:damaged', { amount: cost, source: 'life_tap' });
      return cost;
    },

    // --- Toggle ---
    toggleSkill(skillId) {
      // Flip toggle state. If turning OFF, resets stacks.
      const current = state.toggleStates[skillId];
      if (current && current.active) {
        // Toggle OFF
        current.active = false;
        current.stacks = 0;
        emit('skill:toggleChanged', { skillId, active: false });
        emit('skill:effectEnded', { skillId, reason: 'toggle_off' });
      } else {
        // Toggle ON
        state.toggleStates[skillId] = { active: true, stacks: 0, lastClickTime: 0 };
        emit('skill:toggleChanged', { skillId, active: true });
      }
    },

    // --- Channel ---
    startChannel(skillId, minDuration, maxDuration, minMult, maxMult) {
      // Begin charging. Blocks clicks until release.
      state.channelState = { skillId, startTime: performance.now(), minDuration, maxDuration, minMult, maxMult };
      emit('skill:channelStart', { skillId });
    },

    // --- Cooldown Utility ---
    reduceAllCooldowns(amount) {
      // Reduce all OTHER equipped active skill cooldowns by amount.
      // Enforces 50% base CD floor.
      const player = getPlayer();
      for (const [id, remaining] of Object.entries(player.skillCooldowns)) {
        if (id === 'overcharge') continue; // Don't reduce self
        const skillDef = getSkillById(id);
        const level = player.unlockedSkills[id];
        const baseCd = skillDef.levels[level].cooldown;
        const floor = baseCd * 0.5;
        player.skillCooldowns[id] = Math.max(remaining - amount, floor);
      }
    }
  };
}
```

### Handler Examples

```javascript
const EFFECT_HANDLERS = {
  // --- Hit Modifiers ---
  power_strike: (skill, lvl, ctx) => {
    ctx.setHitModifier('power_strike', { multiplier: lvl.damage / 100 });
  },

  execute: (skill, lvl, ctx) => {
    ctx.setHitModifier('execute', {
      hpThreshold: lvl.hpThreshold,
      strongMult: lvl.strongMult / 100,
      weakMult: lvl.weakMult / 100
    });
  },

  shatter: (skill, lvl, ctx) => {
    ctx.setHitModifier('shatter', { hpPercent: lvl.hpPercent / 100 });
  },

  // --- Click Modifier ---
  precision: (skill, lvl, ctx) => {
    ctx.setClickModifier('precision', lvl.charges);
  },

  // --- Instant Damage ---
  barrage: (skill, lvl, ctx) => {
    ctx.dealInstantDamage(lvl.hits, lvl.damagePerHit);
  },

  arcane_bolt: (skill, lvl, ctx) => {
    ctx.dealInstantDamage(1, lvl.damage);
  },

  chain_lightning: (skill, lvl, ctx) => {
    // Special: handled directly because of overkill chaining.
    // Emit with overkillCarry for combat.js to handle.
    emit('skill:instantDamage', {
      hits: 1,
      damagePerHitPercent: lvl.damage,
      overkillCarry: lvl.overkillCarry / 100,
      source: 'chain_lightning'
    });
  },

  shield_bash: (skill, lvl, ctx) => {
    ctx.dealInstantDamage(1, lvl.damage);
    const maxHP = getComputedStats().maxHP;
    ctx.grantShield(Math.floor(maxHP * lvl.shieldPercent / 100), lvl.shieldDuration);
  },

  // --- Buffs ---
  flurry: (skill, lvl, ctx) => {
    ctx.startBuff('flurry', lvl.duration, { hitsPerClick: lvl.hitsPerClick });
  },

  adrenaline_rush: (skill, lvl, ctx) => {
    ctx.startBuff('adrenaline_rush', lvl.duration, { drainRate: lvl.drainRate });
  },

  // --- Utility ---
  energy_surge: (skill, lvl, ctx) => {
    ctx.grantEnergy(lvl.energyGained);
  },

  life_tap: (skill, lvl, ctx) => {
    ctx.costHP(lvl.hpCostPercent / 100);
    ctx.grantEnergy(lvl.energyGained);
  },

  overcharge: (skill, lvl, ctx) => {
    ctx.reduceAllCooldowns(lvl.cdrAmount);
  },

  // --- Toggle ---
  momentum: (skill, lvl, ctx) => {
    ctx.toggleSkill('momentum');
  },

  // --- Channel ---
  charge_up: (skill, lvl, ctx) => {
    ctx.startChannel('charge_up', lvl.minDuration, lvl.maxDuration, lvl.minMult / 100, lvl.maxMult / 100);
  }
};
```

---

## 7. Passive Handler Contract

### Handler Signature

```javascript
const PASSIVE_HANDLERS = {
  click_mastery: {
    events: ['combat:click'],     // Events to subscribe to
    init(skillDef, levelData) {   // Called on equip. Set up passiveStates.
      state.passiveStates['click_mastery'] = { stacks: 0, lastClickTime: 0 };
    },
    handler(eventName, eventData, skillDef, levelData) {
      // Called when any subscribed event fires.
      // Read/write state.passiveStates[skillId].
    },
    cleanup() {                   // Called on unequip. Clean up passiveStates.
      delete state.passiveStates['click_mastery'];
    }
  },
  // ... one entry per passive skill id
};
```

### Lifecycle

```
Equip passive:
  1. Call PASSIVE_HANDLERS[id].init(skillDef, levelData)
  2. For each event in PASSIVE_HANDLERS[id].events:
     EventBus.on(event, boundHandler)
  3. If passive modifies getComputedStats(), invalidate stat cache

Unequip passive:
  1. For each event in PASSIVE_HANDLERS[id].events:
     EventBus.off(event, boundHandler)
  2. Call PASSIVE_HANDLERS[id].cleanup()
  3. Invalidate stat cache
```

### Handler Implementations

```javascript
const PASSIVE_HANDLERS = {
  // --- Click Mastery: consecutive click stacking ---
  click_mastery: {
    events: ['combat:click'],
    init(skill, lvl) {
      state.passiveStates['click_mastery'] = { stacks: 0, lastClickTime: 0 };
    },
    handler(event, data, skill, lvl) {
      const ps = state.passiveStates['click_mastery'];
      const now = performance.now();
      const gap = (now - ps.lastClickTime) / 1000;
      if (gap <= lvl.clickWindow) {
        ps.stacks = Math.min(ps.stacks + 1, lvl.maxStacks);
      } else {
        ps.stacks = 1; // Reset to 1 (this click starts a new chain)
      }
      ps.lastClickTime = now;
    },
    cleanup() { delete state.passiveStates['click_mastery']; }
  },

  // --- Vampiric Strikes: heal on click damage ---
  vampiric_strikes: {
    events: ['combat:click'],
    init() {},
    handler(event, data, skill, lvl) {
      const healAmount = Math.floor(data.damage * lvl.healPercent / 100);
      if (healAmount > 0) {
        const player = getPlayer();
        const maxHP = getComputedStats().maxHP;
        player.hp = Math.min(player.hp + healAmount, maxHP);
        emit('player:healed', { amount: healAmount, source: 'vampiric_strikes' });
      }
    },
    cleanup() {}
  },

  // --- Critical Flow: energy on crit ---
  critical_flow: {
    events: ['combat:crit'],
    init() {},
    handler(event, data, skill, lvl) {
      const player = getPlayer();
      player.energy = Math.min(player.energy + lvl.energyPerCrit, MAX_ENERGY);
      emit('energy:changed', { current: player.energy, max: MAX_ENERGY });
    },
    cleanup() {}
  },

  // --- Heavy Handed: more damage, less energy per click ---
  // NOTE: This passive modifies getComputedStats() and energy.js behavior.
  // The handler doesn't need events — it's checked in stat computation and energy gain.
  heavy_handed: {
    events: [],
    init() {},
    handler() {},
    cleanup() {}
    // Stat effect applied in player.js getComputedStats():
    //   if (isPassiveEquipped('heavy_handed')) attack *= (1 + lvl.damageBonus / 100)
    // Energy override applied in energy.js:
    //   if (isPassiveEquipped('heavy_handed')) energyPerClick = lvl.energyPerClick
  },

  // --- Combo Artist: 2 skills in window → damage buff ---
  combo_artist: {
    events: ['skill:used'],
    init(skill, lvl) {
      state.passiveStates['combo_artist'] = { lastSkillTime: 0, lastSkillId: null };
    },
    handler(event, data, skill, lvl) {
      const ps = state.passiveStates['combo_artist'];
      const now = performance.now();
      const gap = (now - ps.lastSkillTime) / 1000;
      if (gap <= lvl.triggerWindow && data.skillId !== ps.lastSkillId) {
        // Two different skills within window → proc buff
        state.activeBuffs['combo_artist'] = {
          remaining: lvl.buffDuration,
          damageBonus: lvl.damageBonus / 100
        };
        emit('skill:buffApplied', { skillId: 'combo_artist', duration: lvl.buffDuration });
      }
      ps.lastSkillTime = now;
      ps.lastSkillId = data.skillId;
    },
    cleanup() { delete state.passiveStates['combo_artist']; }
  },

  // --- Berserker: conditional damage/crit below HP threshold ---
  // NOTE: Checked in getComputedStats(), not via events.
  berserker: {
    events: [],
    init() {},
    handler() {},
    cleanup() {}
    // Stat effect applied in player.js getComputedStats():
    //   if (isPassiveEquipped('berserker') && player.hp < maxHP * lvl.hpThreshold / 100) {
    //     attack *= (1 + lvl.damageBonus / 100);
    //     critChance += lvl.critBonus / 100;
    //   }
  },

  // --- Efficient Casting: reduce energy costs ---
  // NOTE: Applied in skills.js useSkill() energy cost calculation.
  efficient_casting: {
    events: [],
    init() {},
    handler() {},
    cleanup() {}
    // Cost modifier applied in skills.js useSkill():
    //   if (isPassiveEquipped('efficient_casting'))
    //     effectiveCost = Math.floor(baseCost * (1 - lvl.costReduction / 100))
  },

  // --- Spell Weaver: CDR on any skill use ---
  spell_weaver: {
    events: ['skill:used'],
    init() {},
    handler(event, data, skill, lvl) {
      // Reduce all OTHER active skill cooldowns
      const player = getPlayer();
      for (const [id, remaining] of Object.entries(player.skillCooldowns)) {
        if (id === data.skillId) continue; // Don't reduce the skill that was just used
        const skillDef = getSkillById(id);
        const skillLevel = player.unlockedSkills[id];
        const baseCd = skillDef.levels[skillLevel].cooldown;
        const floor = baseCd * 0.5;
        player.skillCooldowns[id] = Math.max(remaining - lvl.cdrPerUse, floor);
      }
    },
    cleanup() {}
  },

  // --- Residual Energy: energy when skill effects end ---
  residual_energy: {
    events: ['skill:effectEnded', 'skill:hitModifierConsumed'],
    init() {},
    handler(event, data, skill, lvl) {
      const player = getPlayer();
      player.energy = Math.min(player.energy + lvl.energyOnEnd, MAX_ENERGY);
      emit('energy:changed', { current: player.energy, max: MAX_ENERGY });
    },
    cleanup() {}
  },

  // --- Focused Mind: idle energy regen ---
  // NOTE: Checked in skills.update(dt), not via events.
  focused_mind: {
    events: [],
    init() {},
    handler() {},
    cleanup() {}
    // Tick effect in skills.update(dt):
    //   if (isPassiveEquipped('focused_mind')) {
    //     const elapsed = performance.now() - state.lastClickTime;
    //     if (elapsed > 500) { // 0.5s idle threshold
    //       player.energy = min(player.energy + lvl.idleRegenPerSec * dt, MAX_ENERGY);
    //     }
    //   }
  }
};
```

---

## 8. Combat Integration

### Click Damage Pipeline (v2)

The `handleClick()` function in `combat.js` is rewritten for v2. Step-by-step:

```
1. CHANNEL CHECK
   - If state.channelState is active, IGNORE the click (cannot click during channel)
   - Return early

2. AGGRESSIVE CHECK (unchanged from v1)
   - If monster is aggressive and in 'attacking' phase, damage player instead
   - Return early

3. DETERMINE HITS PER CLICK
   - hitsPerClick = 1 (default)
   - If state.activeBuffs['flurry'] exists: hitsPerClick = buff.hitsPerClick

4. DETERMINE CLICK MODIFIERS
   - isGuaranteedCrit = false
   - If state.clickModifiers['precision'] exists: isGuaranteedCrit = true

5. FOR EACH HIT (i = 0 to hitsPerClick - 1):
   a. Get base attack from getComputedStats().attack
   b. Roll crit: isCrit = isGuaranteedCrit || random() < getComputedStats().critChance
   c. Calculate base damage: isCrit ? floor(attack * critDamage) : attack
   d. APPLY HIT MODIFIER (PRIMARY HIT ONLY, i === 0):
      - If state.hitModifier exists:
        - Power Strike: damage = floor(attack * hitModifier.multiplier)
        - Execute: check monster HP ratio vs threshold → strong or weak multiplier
        - Shatter: damage += floor(monster.maxHealth * hitModifier.hpPercent) [ignores armor]
        - Consume hitModifier (set to null)
        - Emit 'skill:hitModifierConsumed'
   e. APPLY PASSIVE BONUSES:
      - Click Mastery: damage *= (1 + stacks * damagePerStack / 100)
      - Combo Artist buff: damage *= (1 + damageBonus)
      - Berserker (if active): already in getComputedStats()
      - Momentum stacks: damage *= (1 + stacks * damagePerStack / 100)
   f. APPLY ASCENSION BONUS: damage *= (1 + ascension.damageBonus)
   g. APPLY MONSTER DEFENSES:
      - Armored: damage = max(damage - effectiveArmor, 1)
        [Exception: Shatter %HP portion bypasses armor]
      - Shielded: route to shield first with 50% reduction
   h. APPLY DAMAGE: monster.currentHealth -= finalDamage
   i. EMIT: 'combat:click' with { damage: finalDamage, isCrit, hitIndex: i }
   j. IF CRIT: emit 'combat:crit' with { damage: finalDamage }

6. CONSUME CLICK MODIFIERS
   - If state.clickModifiers['precision']:
     - Decrement charges by 1
     - If charges ≤ 0: delete modifier, emit 'skill:effectEnded' { skillId: 'precision' }

7. UPDATE LAST CLICK TIME
   - state.lastClickTime = performance.now()

8. CHECK MONSTER DEATH (unchanged from v1)
   - If monster HP ≤ 0: set combatState = 'dying', emit 'combat:monsterKilled'
```

### Instant Skill Damage Handler

`combat.js` listens for `skill:instantDamage`:

```javascript
on('skill:instantDamage', ({ hits, damagePerHitPercent, flatDamage, overkillCarry, source }) => {
  const monster = state.currentMonster;
  if (!monster || state.combatState !== 'active') return;

  const stats = getComputedStats();

  for (let i = 0; i < hits; i++) {
    let damage;
    if (flatDamage) {
      damage = flatDamage;
    } else {
      damage = Math.floor(stats.attack * (damagePerHitPercent / 100));
    }

    // Crit roll (instant skills CAN crit)
    const isCrit = Math.random() < stats.critChance;
    if (isCrit) {
      damage = Math.floor(damage * stats.critDamage);
      emit('combat:crit', { damage });
    }

    // Apply passive damage bonuses (Combo Artist, Berserker — already in stats)
    // Apply ascension bonus
    damage = Math.floor(damage * (1 + getPlayer().ascension.damageBonus));

    // Apply monster defenses
    damage = applyMonsterDefenses(monster, damage);

    // Apply damage
    monster.currentHealth -= damage;

    emit('combat:instantHit', { damage, isCrit, source, hitIndex: i });

    // Check death mid-barrage
    if (monster.currentHealth <= 0) {
      // Handle overkill carry for Chain Lightning
      if (overkillCarry && source === 'chain_lightning') {
        const overkill = Math.abs(monster.currentHealth);
        const carryDamage = Math.floor(overkill * overkillCarry);
        // Store carry damage for next monster spawn
        state.chainLightningCarry = carryDamage;
      }
      handleMonsterDeath(monster);
      break;
    }
  }
});
```

### Channel Release

When the player releases the channel button, UI calls `releaseChannel()`:

```javascript
export function releaseChannel() {
  const channel = state.channelState;
  if (!channel) return;

  const elapsed = (performance.now() - channel.startTime) / 1000;
  const clampedTime = clamp(elapsed, channel.minDuration, channel.maxDuration);
  const t = (clampedTime - channel.minDuration) / (channel.maxDuration - channel.minDuration);
  const multiplier = channel.minMult + t * (channel.maxMult - channel.minMult);

  state.channelState = null;

  // Fire the channel hit at current monster
  const stats = getComputedStats();
  let damage = Math.floor(stats.attack * multiplier);

  // Can crit
  const isCrit = Math.random() < stats.critChance;
  if (isCrit) damage = Math.floor(damage * stats.critDamage);

  emit('skill:channelRelease', { skillId: channel.skillId, damage, isCrit });
}
```

`combat.js` listens for `skill:channelRelease` and applies the damage to the current monster (with defenses, ascension bonus, etc.).

---

## 9. Cooldown System

### Tick-Based Decrement

Cooldowns are stored as remaining seconds (float) in `player.skillCooldowns`. Decremented every frame in `skills.update(dt)`:

```javascript
export function update(dt) {
  const player = getPlayer();

  // --- Decrement cooldowns ---
  for (const [skillId, remaining] of Object.entries(player.skillCooldowns)) {
    const newRemaining = remaining - dt;
    if (newRemaining <= 0) {
      delete player.skillCooldowns[skillId];
      emit('skill:cooldownReady', { skillId });
    } else {
      player.skillCooldowns[skillId] = newRemaining;
    }
  }

  // --- Decrement buff timers ---
  for (const [buffId, buff] of Object.entries(state.activeBuffs)) {
    buff.remaining -= dt;

    // Adrenaline Rush: drain energy
    if (buffId === 'adrenaline_rush') {
      const player = getPlayer();
      player.energy = Math.max(0, player.energy - buff.drainRate * dt);
      emit('energy:changed', { current: player.energy, max: MAX_ENERGY });
    }

    if (buff.remaining <= 0) {
      delete state.activeBuffs[buffId];
      emit('skill:effectEnded', { skillId: buffId, reason: 'expired' });
      emit('skill:buffExpired', { buffId });
    }
  }

  // --- Shield timer ---
  if (state.playerShield) {
    state.playerShield.remaining -= dt;
    if (state.playerShield.remaining <= 0 || state.playerShield.amount <= 0) {
      state.playerShield = null;
      emit('skill:effectEnded', { skillId: 'shield_bash', reason: 'expired' });
    }
  }

  // --- Toggle drain (Momentum) ---
  for (const [skillId, toggle] of Object.entries(state.toggleStates)) {
    if (!toggle.active) continue;
    const skillDef = getSkillById(skillId);
    const level = player.unlockedSkills[skillId];
    const lvl = skillDef.levels[level];
    let drainRate = lvl.drainPerSec;

    // Efficient Casting reduces drain
    if (isPassiveEquipped('efficient_casting')) {
      const ecLvl = getPassiveLevelData('efficient_casting');
      drainRate *= (1 - ecLvl.costReduction / 100);
    }

    player.energy -= drainRate * dt;
    if (player.energy <= 0) {
      player.energy = 0;
      toggle.active = false;
      toggle.stacks = 0;
      emit('skill:toggleChanged', { skillId, active: false });
      emit('skill:effectEnded', { skillId, reason: 'energy_depleted' });
    }
    emit('energy:changed', { current: player.energy, max: MAX_ENERGY });

    // Momentum: decay stacks if no click within decay timer
    if (skillId === 'momentum' && toggle.stacks > 0) {
      const elapsed = (performance.now() - toggle.lastClickTime) / 1000;
      if (elapsed > lvl.decayTimer) {
        toggle.stacks = 0;
      }
    }
  }

  // --- Focused Mind: idle energy regen ---
  if (isPassiveEquipped('focused_mind')) {
    const elapsed = (performance.now() - state.lastClickTime) / 1000;
    if (elapsed > 0.5) {
      const fmLvl = getPassiveLevelData('focused_mind');
      player.energy = Math.min(player.energy + fmLvl.idleRegenPerSec * dt, MAX_ENERGY);
      emit('energy:changed', { current: player.energy, max: MAX_ENERGY });
    }
  }
}
```

### Cooldown Floor

All CDR applications enforce a minimum cooldown of 50% of the skill's base cooldown at its current level:

```javascript
function applycdR(skillId, reduction) {
  const player = getPlayer();
  const remaining = player.skillCooldowns[skillId];
  if (remaining === undefined) return; // Not on cooldown

  const skillDef = getSkillById(skillId);
  const level = player.unlockedSkills[skillId];
  const baseCd = skillDef.levels[level].cooldown;
  const floor = baseCd * 0.5;

  player.skillCooldowns[skillId] = Math.max(remaining - reduction, floor);
}
```

### Starting a Cooldown

When a skill is used:

```javascript
function startCooldown(skillId) {
  const player = getPlayer();
  const skillDef = getSkillById(skillId);
  const level = player.unlockedSkills[skillId];
  const baseCd = skillDef.levels[level].cooldown;
  player.skillCooldowns[skillId] = baseCd;
}
```

---

## 10. Event Catalog

### New Events (v2)

| Event | Payload | Emitted By | Consumed By |
|-------|---------|------------|-------------|
| `sp:gained` | `{ amount, total }` | skills.js | UI (SP counter) |
| `skill:hitModifierSet` | `{ skillId }` | skills.js | UI (buff indicator) |
| `skill:hitModifierConsumed` | `{ skillId }` | combat.js | Residual Energy passive, UI |
| `skill:clickModifierSet` | `{ skillId, charges }` | skills.js | UI (charge counter) |
| `skill:instantDamage` | `{ hits, damagePerHitPercent, flatDamage?, overkillCarry?, source? }` | skills.js | combat.js (apply damage) |
| `skill:channelStart` | `{ skillId }` | skills.js | combat.js (block clicks), UI (charge animation) |
| `skill:channelRelease` | `{ skillId, damage, isCrit }` | skills.js | combat.js (apply damage), UI (damage number) |
| `skill:toggleChanged` | `{ skillId, active }` | skills.js | UI (toggle indicator), Residual Energy |
| `skill:shieldApplied` | `{ amount, duration }` | skills.js | health.js (absorb damage), UI (shield bar) |
| `skill:effectEnded` | `{ skillId, reason }` | skills.js | Residual Energy passive, UI |
| `skill:respecCompleted` | `{ spRefunded }` | skills.js | UI (refresh skills screen) |
| `combat:crit` | `{ damage }` | combat.js | Critical Flow passive |
| `combat:instantHit` | `{ damage, isCrit, source, hitIndex }` | combat.js | UI (damage floats) |

### Modified Events (v1→v2)

| Event | Change |
|-------|--------|
| `skill:used` | Payload now includes `{ skillId, level, energyCost, tags }` (added tags) |
| `skill:unlocked` | Payload: `{ skillId, spCost }` (was `mpCost`) |
| `skill:upgraded` | Payload: `{ skillId, newLevel, spCost }` (added spCost) |
| `skill:buffApplied` | Payload: `{ skillId, duration }` (was `buffId`) |
| `skill:buffExpired` | Payload: `{ buffId }` (unchanged) |
| `mastery:gained` | **REMOVED** — replaced by `sp:gained` |

### Removed Events (v1)

| Event | Reason |
|-------|--------|
| `mastery:gained` | MP system removed; replaced by `sp:gained` |

---

## 11. Adding a New Skill

### 5-Step Checklist

**Step 1: Define the skill data**

Add an entry to `js/data/skills.data.js`:

```javascript
{
  id: 'new_skill',
  name: 'New Skill',
  description: 'Does something cool.',
  category: 'power',           // speed | power | crit | spell | utility
  type: 'active',              // active | passive
  tags: ['power', 'attack'],
  mechanic: 'instant',         // choose from mechanic types table
  unlockLevel: 30,
  unlockCost: 1,
  upgradeCost: 1,
  maxLevel: 5,
  mutation: null,
  levels: {
    1: { damage: 500, cooldown: 10, energyCost: 25 },
    2: { damage: 600, cooldown: 10, energyCost: 25 },
    3: { damage: 750, cooldown: 9,  energyCost: 23 },
    4: { damage: 900, cooldown: 8,  energyCost: 21 },
    5: { damage: 1100, cooldown: 7, energyCost: 20 }
  }
}
```

**Step 2: Add the effect handler** (active skills only)

In `js/systems/skills.js`, add to `EFFECT_HANDLERS`:

```javascript
new_skill: (skill, lvl, ctx) => {
  ctx.dealInstantDamage(1, lvl.damage);
},
```

**Step 3: Add the passive handler** (passive skills only)

In `js/systems/skills.js`, add to `PASSIVE_HANDLERS`:

```javascript
new_passive: {
  events: ['combat:click'],
  init(skill, lvl) { state.passiveStates['new_passive'] = { ... }; },
  handler(event, data, skill, lvl) { /* effect logic */ },
  cleanup() { delete state.passiveStates['new_passive']; }
},
```

**Step 4: Balance check**

Use the DPS framework from `docs/design/skill-system-v2.md` section 12:

```
cycle_dps = (damage_multiplier × ATK) / cooldown
target: +30-60% DPS at Lv1, +80-120% at Lv5
energy cost ≈ 2-4 seconds of clicking energy income
no skill combo should exceed 5× pure clicking DPS
```

**Step 5: Test**

- Unlock the skill (use `DEBUG.giveSP(5)`)
- Equip and activate
- Verify effect applies correctly
- Verify cooldown, energy cost, and damage output
- Verify interaction with existing passives and buffs
- Verify UI displays correctly (skills screen + skill bar)

### No UI changes needed

The skills screen auto-generates from skill data. The skill bar renders equipped skills dynamically. New skills appear automatically once their data and handler are defined.

---

*This document is the implementation companion to `docs/design/skill-system-v2.md`. The design doc defines WHAT to build; this doc defines HOW to build it. When in doubt, the design doc is authoritative for game mechanics and the architecture doc (`docs/architecture/architecture.md`) is authoritative for code patterns.*

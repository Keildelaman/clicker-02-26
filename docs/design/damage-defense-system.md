# Damage & Defense Type System — Design & Implementation Plan

> **Status:** Implementation in progress (Phase 3 of 7)
> **Created:** 2026-02-17
> **Scope:** Core combat rework — 2 damage types, 5 status effects, percentage-based defense

---

## Table of Contents

1. [System Design (Agreed)](#1-system-design-agreed)
2. [Current State Analysis](#2-current-state-analysis)
3. [Integration Complexity Analysis](#3-integration-complexity-analysis)
4. [Phased Implementation Plan](#4-phased-implementation-plan)
5. [Phase Details](#5-phase-details)
6. [Risk Assessment](#6-risk-assessment)
7. [Open Items (Future)](#7-open-items-future)

---

## 1. System Design (Agreed)

### 1.1 Damage Types (2)

| Type | Reduced By | Status Effects |
|------|-----------|----------------|
| **Physical** | Armor | Bleed, Poison |
| **Magic** | Magic Resist | Burn, Slow, Freeze |

- Every attack deals **one** damage type (physical or magic) by default.
- Skills/items may override this (e.g. a skill dealing both types is a special case, not the norm).
- Crit chance and crit damage apply to **both** types equally.

### 1.2 Defense Formula (Percentage-Based)

```
reduction = defense / (defense + 100)
effective_damage = damage × (1 - reduction)
```

**Examples:**

| Defense | Reduction | 100 raw dmg → |
|---------|-----------|---------------|
| 0 | 0% | 100 |
| 25 | 20% | 80 |
| 50 | 33% | 67 |
| 100 | 50% | 50 |
| 200 | 67% | 33 |
| 300 | 75% | 25 |

This gives diminishing returns — stacking defense is always useful but never reaches 100%.

### 1.3 Penetration Stats

```
effective_defense = defense × (1 - pen%)
```

- **Armor Penetration (%)** — ignores a percentage of target's Armor
- **Magic Penetration (%)** — ignores a percentage of target's Magic Resist

**Example:** 100 armor, 30% armor pen → 70 effective armor → 41% reduction (vs 50% without pen)

Pen is most valuable against high-defense targets. Raw damage is better vs low-defense targets. This creates a real itemization choice.

### 1.4 Player Stats (New)

```
EXISTING (renamed/kept):
  attack         → physical damage (from base + weapon + buffs)
  critChance     → unchanged
  critDamage     → unchanged
  maxHP          → unchanged
  hpRegen        → unchanged
  damageReduction → REMOVED (replaced by armor/MR system)
  armorPen       → REWORKED: now percentage-based (was flat)

NEW:
  magicPower     → magic damage (from weapon + buffs)
  armor          → reduces incoming physical damage (% formula)
  magicResist    → reduces incoming magic damage (% formula)
  magicPen       → ignores % of target's magic resist
  maxShield      → shield pool (from gear/skills)

PER-LEVEL BASE GAINS (small, feels good):
  armor:        +1 per level (0 at level 1, 99 at level 100)
  magicResist:  +1 per level (0 at level 1, 99 at level 100)
  (attack already scales: 5 + (level-1) = 5 at L1, 104 at L100)
```

### 1.5 Monster Stats (New)

```
EXISTING (kept):
  baseHealth, currentHealth, maxHealth
  type (normal, swift, aggressive, armored, shielded, regenerating)
  shield (for shielded type)

REWORKED:
  armorValue → armor (now used in % formula, not flat subtraction)

NEW:
  magicResist       → reduces incoming magic damage (% formula)
  physicalAttack    → damage dealt to player (physical)
  magicAttack       → damage dealt to player (magic)
  damageType        → 'physical' | 'magic' | 'mixed' (what type the monster deals)
  statusImmunities  → [] array of status effect IDs this monster is immune to
                       (e.g. ice monster immune to ['slow', 'freeze'])
```

### 1.6 Shield System (Reworked)

**Core rule: While shield > 0, target is immune to status effects.**

- Shield absorbs damage before HP (any damage type, no type preference)
- Shield does NOT regenerate passively (gained from skills/gear/buffs)
- Shield can decay over time (optional, per-source)
- Both player AND monsters follow the same shield rules
- Shielded monster type: starts with shield equal to X% of maxHP

**Current → New:**
- Monster `shieldDR` (50% damage reduction while shielded) → **REMOVED**. Shield is now a flat HP buffer, no DR. This is simpler and makes shield breaking more rewarding.
- Player `playerShield` → stays, but gains status immunity property.

### 1.7 Status Effects

| Effect | Type | Scaling | Stacking | Duration | Description |
|--------|------|---------|----------|----------|-------------|
| **Bleed** | Physical | `X% of attack` per tick, reduced by target armor | Stacks up to 5x | 3-5 sec | Physical DoT, rewards sustained attacks |
| **Poison** | Physical | `X% of attack` per tick, reduced by target armor | Stacks up to 10x | 4-5 sec | Slower tick, higher max stacks than bleed |
| **Burn** | Magic | `X% of magicPower` per tick, reduced by target MR | Does NOT stack, refreshes duration | 3-4 sec | Magic DoT, consistent damage |
| **Slow** | Magic | N/A (utility) | Does not stack, refreshes | 3-5 sec | Reduces monster action speed OR player energy regen |
| **Freeze** | Magic | N/A (utility) | Cannot stack | 1-2 sec | Stun — target cannot act. Cooldown before reapply (anti-perma-freeze) |

**Status effect rules:**
- Blocked entirely while target has shield > 0
- Applied by skills (proc method defined per-skill: guaranteed, % chance, conditional)
- Damage ticks from Bleed/Poison are reduced by target's Armor
- Damage ticks from Burn are reduced by target's Magic Resist
- Monsters can be immune to specific effects (e.g. ice monsters immune to slow/freeze)
- Both player and monsters can be affected by status effects

**Status effect proc flexibility (per-skill):**
- Fixed chance per hit (e.g. "15% chance to apply Bleed")
- Guaranteed on skill use (e.g. "Poison Strike always poisons")
- Start with X stacks (e.g. "Applies 3 stacks of Poison immediately")
- Conditional (e.g. "When target is Burning, this skill deals 50% more damage")
- Future skills can interact with status effects creatively

### 1.8 Monster Threat Model

Monsters deal **typed damage** to the player. Sources:
- **Aggressive type:** attack phase deals damage (physical, magic, or mixed per monster)
- **Swift type:** escape damage (physical or magic per monster)
- **Passive tick damage:** some monsters deal X damage/sec just by being alive (new mechanic, later phase)
- **Monster status effects:** monsters can apply status effects to the player (poison spider → poisons you, fire mage → burns you) (later phase)

### 1.9 Build Identity

Build identity comes from **items + skills**, not a class system:
- **Weapon** defines primary damage type (physical sword vs magic staff)
- **Armor/Accessories** provide defensive stats (armor, MR, HP, shield)
- **Active skills** (4 slots) define your damage profile and utility
- **Passive skills** (3 slots) amplify your chosen playstyle

A player who equips a physical weapon + bleed/poison skills + armor pen = physical build.
A player who equips a magic weapon + burn/freeze skills + magic pen = mage build.
Both can beat the game. Some matchups are faster than others (Diablo model).

### 1.10 Fight Duration Targets

| Stage | Normal Monster | Boss |
|-------|---------------|------|
| Early game (Zone 1-2) | 2-4 seconds | 30-45 seconds |
| Mid game (Zone 3-4) | 5-8 seconds | 45-90 seconds |
| Late game (Zone 5-7) | 8-15 seconds | 90-300 seconds |

Status effects (3-5 sec) must have time to matter → fights can't be 1-second kills.

---

## 2. Current State Analysis

### What Exists Today

| Component | Current Behavior | What Changes |
|-----------|-----------------|--------------|
| **combat.js** `applyDamageToMonster()` | Flat armor: `damage - armorValue`. Shield: DR + absorption. | % formula, damageType param, remove shieldDR |
| **combat.js** `handleClick()` | Deals `stats.attack` damage, no type concept | Pass damageType='physical' (weapon-based) |
| **combat.js** `onInstantDamage()` | Skills deal `attack × damagePerHit%`, no type | Accept damageType from skill data |
| **player.js** `getComputedStats()` | Returns attack, armorPen (flat), damageReduction | Add magicPower, armor, MR, magicPen, maxShield |
| **player.js** `getEquipmentBonus()` | Sums stat from 3 equipment slots | Same pattern, just more stat keys |
| **health.js** `damagePlayer()` | Flat `damageReduction`, shield absorbs | Typed damage → armor OR MR reduction |
| **monster.js** `createMonsterInstance()` | Copies stats from definition | Add armor, MR, damageType, statusImmunities |
| **monster.js** `initializeType()` | Sets armorValue (flat), shield + DR | armorValue → armor (for % formula), remove DR |
| **constants.js** | ARMOR_VALUE_DEFAULT=40, SHIELD_DR_DEFAULT=0.50 | New type constants, remove flat armor/DR defaults |
| **balance.js** | No defense formulas | Add `calcDamageReduction(defense)`, base armor/MR per level |
| **monsters.data.js** | 35 monsters, armorValue as flat | Add armor, MR, damageType per monster |
| **items.data.js** | ~96 items, `attack`/`armorPen`/`damageReduction` | Add magicPower, armor, MR, magicPen stats |
| **skills.data.js** | 25 skills, no damageType | Add damageType per active skill |
| **skill-effects.js** | 15 handlers, emit `skill:instantDamage` | Pass damageType in event payload |

---

## 3. Integration Complexity Analysis

### Effort Breakdown

| Area | Files | Effort | Risk | Notes |
|------|-------|--------|------|-------|
| **Defense formula** | balance.js, constants.js | Small | Low | Pure functions, no side effects |
| **Combat damage pipeline** | combat.js | Medium | **Medium** | Core loop — must not break existing flow |
| **Player stats** | player.js | Medium | Low | Additive — new stats alongside existing |
| **Player defense (typed)** | health.js | Small | Low | Swap damageReduction for typed calc |
| **Monster data** | monsters.data.js, monster.js | Medium | Low | Bulk data entry + small init changes |
| **Item data** | items.data.js | Medium | Low | Bulk data entry, new stat keys |
| **Skill data + effects** | skills.data.js, skill-effects.js | Medium | Low | Add field + propagate through handlers |
| **Status effect engine** | NEW: status-effects.js | **Large** | **Medium** | New system — tick-based, stacking, immunity |
| **Shield rework** | combat.js, health.js, monster.js | Small | Low | Simplify (remove DR), add status immunity |
| **UI updates** | combat-ui.js, bars-ui.js, stats-ui.js | Medium | Low | Display only, no logic risk |
| **Save migration** | storage.js | Small | Low | Bump version, add defaults for new fields |

### Total Estimate

| Category | Story Points | Description |
|----------|-------------|-------------|
| Core formula + stats | ~8 | Defense formula, player stats, constants |
| Combat pipeline rework | ~8 | Typed damage flow through combat.js + health.js |
| Data files (monsters, items, skills) | ~10 | Bulk but straightforward data additions |
| Status effect system | ~13 | New system, most complex piece |
| Shield rework | ~3 | Simplification + status immunity |
| UI updates | ~5 | Damage type colors, new stat displays |
| Testing + tuning | ~5 | Integration testing, number tuning |
| **Total** | **~52** | |

---

## 4. Phased Implementation Plan

### Overview

```
Phase 1: Foundation         — Defense formula, stats, constants          ✅ DONE
Phase 2: Combat Pipeline    — Typed damage through combat.js + health.js ✅ DONE
Phase 3: Data Migration     — Monsters, items, skills get type data      ✅ DONE
Phase 4: Shield Rework      — Simplify shield, add status immunity
Phase 5: Status Effects     — New system: bleed, poison, burn, slow, freeze
Phase 6: Monster Threat     — Monsters deal typed damage to player
Phase 7: UI & Polish        — Visual feedback, damage colors, stat display
```

Each phase is **independently testable** — the game works after every phase, just with more features.

---

## 5. Phase Details

### Phase 1: Foundation

**Goal:** Add the defense formula, new stat keys, and constants. No behavior changes yet.

**Files modified:**
- `js/data/constants.js` — Add damage type enum, defense formula constant, status effect defaults
- `js/data/balance.js` — Add `calcDamageReduction(defense, pen)`, `baseArmorAtLevel(level)`, `baseMagicResistAtLevel(level)`
- `js/systems/player.js` — Add new stats to `getComputedStats()`: magicPower, armor, magicResist, magicPen, maxShield

**Files created:** None

**Behavior change:** None. New stats exist but nothing reads them yet.

**Effort:** Small (1-2 sessions)

**Deliverables:**
- [ ] `DAMAGE_TYPES` constant: `{ PHYSICAL: 'physical', MAGIC: 'magic' }`
- [ ] `DEFENSE_SCALING_FACTOR = 100` (the "+100" in the formula)
- [ ] Status effect constants (max stacks, base durations, reapply cooldowns)
- [ ] `calcDamageReduction(defense, penPercent)` in balance.js
- [ ] `baseArmorAtLevel(level)` and `baseMagicResistAtLevel(level)` in balance.js
- [ ] `getComputedStats()` returns: magicPower, armor, magicResist, magicPen, maxShield
- [ ] `getEquipmentBonus()` supports new stat keys
- [ ] `createNewPlayer()` — no schema changes needed (stats are computed, not stored)

---

### Phase 2: Combat Pipeline

**Goal:** All damage flows through the type system. Damage to monsters uses % defense formula. Damage to player uses % defense formula.

**Files modified:**
- `js/systems/combat.js` — Rework `applyDamageToMonster()` to accept `damageType`, use % formula
- `js/systems/health.js` — Rework `damagePlayer()` to accept `damageType`, use player armor/MR

**Key changes in combat.js:**

```javascript
// BEFORE (flat armor):
const effectiveArmor = Math.max(monster.armorValue - stats.armorPen, 0);
damage = Math.max(damage - effectiveArmor, MIN_DAMAGE);

// AFTER (% formula):
import { calcDamageReduction } from '../data/balance.js';

const defense = damageType === 'magic' ? monster.magicResist : monster.armor;
const pen = damageType === 'magic' ? stats.magicPen : stats.armorPen;
const reduction = calcDamageReduction(defense, pen);
damage = Math.max(Math.floor(damage * (1 - reduction)), MIN_DAMAGE);
```

**Key changes in health.js:**

```javascript
// BEFORE:
const reduced = Math.max(1, Math.floor(finalAmount * (1 - stats.damageReduction)));

// AFTER:
import { calcDamageReduction } from '../data/balance.js';

const defense = damageType === 'magic' ? stats.magicResist : stats.armor;
const reduction = calcDamageReduction(defense, 0); // monsters don't have pen (yet)
const reduced = Math.max(1, Math.floor(finalAmount * (1 - reduction)));
```

**Backward compatibility:**
- `damageType` defaults to `'physical'` if not provided → existing code works unchanged
- `handleClick()` always passes `'physical'` (weapon type comes later in Phase 3)
- `onInstantDamage()` reads `damageType` from event payload, falls back to `'physical'`
- Remove `damageReduction` stat from player (replaced by armor/MR)
- Monster `armorValue` → `armor` rename during this phase

**Shield handling (interim):**
- Keep current shield behavior for now (absorption without DR)
- Remove `shieldDR` — shield just absorbs damage 1:1
- Full shield rework in Phase 4

**Effort:** Medium (2-3 sessions)

**Deliverables:**
- [ ] `applyDamageToMonster(rawDamage, opts)` — opts gains `damageType` field
- [ ] All armor handling uses `calcDamageReduction()` with % formula
- [ ] `damagePlayer(amount, source, damageType)` — uses player armor or MR
- [ ] `damageReduction` stat removed from player, replaced by armor/MR
- [ ] Monster `armorValue` → `armor`, shielded type loses `shieldDR`
- [ ] Default damageType = 'physical' everywhere for backward compat
- [ ] All existing functionality still works (regression-free)

---

### Phase 3: Data Migration

**Goal:** All monsters, items, and skills have type data. The system is now type-aware end-to-end.

**Files modified:**
- `js/data/monsters.data.js` — Add armor, magicResist, damageType, statusImmunities per monster
- `js/data/items.data.js` — Add magicPower, armor, magicResist, magicPen to relevant items
- `js/data/skills.data.js` — Add damageType per active skill
- `js/systems/skill-effects.js` — Pass damageType in `skill:instantDamage` events
- `js/systems/monster.js` — Initialize new fields from definition

**Monster data strategy:**
- Each monster gets `armor` and `magicResist` values based on zone + theme
- Armored type monsters have HIGH armor (physical-resistant)
- New concept: some monsters are magic-resistant instead (no type change needed, just high MR stat)
- `damageType`: what the monster deals to the player ('physical', 'magic', or 'mixed')
- `statusImmunities`: array, e.g. ice-themed monsters → `['slow', 'freeze']`

**Item data strategy:**
- Existing `attack` stat = physical damage (unchanged)
- New `magicPower` stat on magic-oriented weapons/accessories
- New `armor` and `magicResist` stats on armor pieces
- New `magicPen` stat on magic-oriented accessories
- Existing `armorPen` stays (now interpreted as % by the formula)
- Remove `damageReduction` from items (replaced by armor/MR)
- Zone progression: early zones have mostly physical gear, magic gear appears mid-game

**Skill data strategy:**
- Each active damage skill gets `damageType: 'physical' | 'magic'`
- Suggested mapping (adjustable):
  - Physical: power_strike, barrage, shatter, flurry, execute
  - Magic: arcane_bolt, chain_lightning, shield_bash (arcane shield)
  - Utility (no type): heal, precision, adrenaline_rush, iron_skin, etc.
- `skill-effects.js`: each handler reads `damageType` from skill definition and includes it in event payload

**Effort:** Medium-Large (3-4 sessions — mostly data entry)

**Deliverables:**
- [ ] All 35 monsters have: armor, magicResist, damageType, statusImmunities
- [ ] All relevant items have: magicPower, armor, magicResist, magicPen stats
- [ ] All 15 active skills have: damageType field
- [ ] skill-effects.js passes damageType through event chain
- [ ] monster.js initializes new fields from definition
- [ ] Game is fully type-aware: physical weapon → armor reduction, magic skill → MR reduction

---

### Phase 4: Shield Rework

**Goal:** Shield blocks status effects. Both player and monster shields follow same rules.

**Files modified:**
- `js/systems/combat.js` — Shield absorbs 1:1 (no DR), check shield for status immunity
- `js/systems/health.js` — Player shield blocks status effects
- `js/systems/monster.js` — Monster shield initialization (simplified)
- `js/data/constants.js` — Shield-related constants

**Shield rules:**
```
1. Shield absorbs damage before HP (any type, 1:1 ratio)
2. While shield > 0 → immune to ALL status effects
3. Shield does not regenerate passively
4. Shield sources: skills (Shield Bash), gear (future), buffs
5. Breaking a shield = important tactical moment
```

**What changes from current:**
- Remove `shieldDR` (was 50% damage reduction while shielded) — shield is now just extra HP that blocks status effects
- Shielded monsters become: "extra HP buffer that protects from status effects" instead of "damage sponge with 50% DR"
- This is actually a **simplification** — less math, cleaner mental model

**Effort:** Small (1 session)

**Deliverables:**
- [ ] Shield absorbs damage 1:1 (no DR multiplier)
- [ ] Shield > 0 = status effect immunity (checked before applying effects in Phase 5)
- [ ] `shieldDR` removed from monster data and combat.js
- [ ] Player shield gains same immunity rule
- [ ] `combat:shieldBroken` event = "target is now vulnerable to status effects"

---

### Phase 5: Status Effect System

**Goal:** New status effect engine. Bleed, Poison, Burn, Slow, Freeze — applied by skills, ticking over time, interacting with the type system.

**Files created:**
- `js/systems/status-effects.js` — New system (follows system contract pattern)

**Files modified:**
- `js/systems/combat.js` — Check status immunity (shield), apply effects on hit
- `js/systems/health.js` — Player status effects (damage ticks, slow, freeze)
- `js/data/constants.js` — Status effect tuning constants
- `js/data/skills.data.js` — Add statusEffect config per skill
- `js/systems/skill-effects.js` — Trigger status effects from skill handlers
- `js/main.js` — Wire new system

**Status Effect System Contract:**

```javascript
// status-effects.js

// Manages active status effects on monsters and player
// tick(dt): process all active effects (damage ticks, duration countdown, expiry)
// applyEffect(target, effectId, source): attempt to apply (check shield, immunity)
// removeEffect(target, effectId): remove all stacks
// getEffects(target): return active effects array
// init(deps): wire events, register tick

// Data structure per active effect:
{
  id: 'bleed',           // effect type
  stacks: 3,             // current stacks (bleed/poison)
  remaining: 4.0,        // seconds remaining
  tickTimer: 0,          // time until next damage tick
  tickInterval: 1.0,     // seconds between ticks
  damagePerTick: 15,     // damage per stack per tick
  damageType: 'physical', // for armor/MR reduction on tick
  source: 'skill:power_strike' // what applied it
}
```

**Effect implementations:**

| Effect | Apply | Tick | Expire |
|--------|-------|------|--------|
| Bleed | Add stack (max 5), refresh duration | Deal `dmgPerTick × stacks` physical dmg to target | Remove all stacks |
| Poison | Add stack (max 10), refresh duration | Deal `dmgPerTick × stacks` physical dmg to target | Remove all stacks |
| Burn | Refresh duration (no stack) | Deal `dmgPerTick` magic dmg to target | Remove |
| Slow | Refresh duration (no stack) | Reduce target action speed by X% | Restore normal speed |
| Freeze | Apply if not on cooldown | Stun target (skip type updates) | Unfreeze, start reapply cooldown |

**Skill → Status Effect config (in skills.data.js):**

```javascript
power_strike: {
  damageType: 'physical',
  statusEffect: {
    type: 'bleed',
    chance: 0.30,        // 30% chance per hit
    stacks: 1,           // applies 1 stack
    // damage/duration from constants
  }
}
```

**Effort:** Large (4-5 sessions — most complex phase)

**Deliverables:**
- [ ] `status-effects.js` created following system contract
- [ ] 5 status effects implemented: bleed, poison, burn, slow, freeze
- [ ] Shield immunity check before applying
- [ ] Monster status immunity check (per-monster list)
- [ ] Status effect damage ticks respect armor/MR
- [ ] Freeze reapply cooldown (anti-perma-freeze)
- [ ] Slow affects monster mechanics (aggressive cycle, swift timer, regen rate)
- [ ] Skills can define statusEffect config (chance, stacks, etc.)
- [ ] Wired into main.js tick loop
- [ ] Status effects on player (from monsters — foundation only, activated in Phase 6)

---

### Phase 6: Monster Threat (Typed)

**Goal:** Monsters deal typed damage to the player. Aggressive/Swift damage uses the type system. Foundation for monster-applied status effects.

**Files modified:**
- `js/systems/combat.js` — Pass monster's damageType to `damagePlayer()`
- `js/systems/health.js` — Already accepts damageType from Phase 2
- `js/data/monsters.data.js` — Verify all monsters have damageType set

**Changes:**
```javascript
// Aggressive attack — BEFORE:
hurtPlayer(dmg, 'aggressive');

// AFTER:
hurtPlayer(dmg, 'aggressive', monster.damageType || 'physical');

// Swift escape — BEFORE:
hurtPlayer(dmg, 'swift_escape');

// AFTER:
hurtPlayer(dmg, 'swift_escape', monster.damageType || 'physical');
```

**Monster status effects on player (foundation):**
- Some monsters can apply status effects to the player on their attack
- Poison spider → applies poison to player during aggressive attack phase
- Fire mage → applies burn to player
- Ice golem → applies slow to player
- This uses the same `status-effects.js` system from Phase 5, just targeting player instead of monster

**Effort:** Small-Medium (1-2 sessions)

**Deliverables:**
- [ ] Aggressive damage uses monster.damageType → player armor/MR reduces it
- [ ] Swift escape damage uses monster.damageType
- [ ] Monster attacks can apply status effects to player
- [ ] Player needs armor for physical zones, MR for magic zones — gear choices matter

---

### Phase 7: UI & Polish

**Goal:** Visual feedback for the type system. Damage numbers colored by type. Status effect icons. Stat display updates.

**Files modified:**
- `js/ui/combat-ui.js` — Damage number colors (orange=physical, blue=magic, green=poison, etc.)
- `js/ui/bars-ui.js` — Shield bar, status effect indicators
- `js/ui/stats-ui.js` — Show armor, MR, magicPower, pen stats
- `js/ui/skills-ui.js` — Skill type indicator (physical/magic icon)
- `css/variables.css` — Color variables for damage types
- `css/components.css` — Status effect indicator styles

**Visual language:**
- Physical damage numbers: white/orange
- Magic damage numbers: blue/purple
- Bleed ticks: red
- Poison ticks: green
- Burn ticks: orange
- Slow indicator: light blue overlay on monster
- Freeze indicator: ice crystal overlay, monster stops moving
- Shield bar: separate bar above HP (cyan/white)

**Effort:** Medium (2-3 sessions)

**Deliverables:**
- [ ] Damage numbers color-coded by type
- [ ] Status effect icons on monster (with stack count/timer)
- [ ] Status effect icons on player
- [ ] Stats screen shows all new stats
- [ ] Skill tooltips show damage type
- [ ] Item tooltips show new stats
- [ ] Shield bar visual (distinct from HP bar)

---

## 6. Risk Assessment

### Low Risk
- **Phase 1 (Foundation):** Pure additions, no behavior changes. Zero regression risk.
- **Phase 3 (Data):** Bulk data entry. Tedious but safe. Wrong numbers are easy to fix.
- **Phase 4 (Shield):** Actually a simplification — removing complexity (shieldDR).

### Medium Risk
- **Phase 2 (Combat Pipeline):** This is the core loop. The `applyDamageToMonster()` rework touches every damage path. **Mitigation:** Default damageType='physical', keep MIN_DAMAGE floor, test all monster types.
- **Phase 5 (Status Effects):** New system with tick-based logic, stacking, and immunity. Most complex piece. **Mitigation:** Build incrementally (bleed first, then add others). Each effect is independent.
- **Phase 6 (Monster Threat):** Balance risk — if monster typed damage + player low MR = instant death. **Mitigation:** Start with low monster damage values, tune up gradually.

### High Risk
- **Balance breaking across phases:** Each phase changes the damage math. What was balanced before may not be after. **Mitigation:** Don't balance-tune until all phases are in. Use 1.0x multipliers as starting point. Balance pass is a separate effort AFTER the system is complete.

### Architecture Risk: None
- No new imports between systems (status-effects.js follows the same event-driven pattern)
- No architectural changes — the layer rules are preserved
- All cross-system communication via events or DI

---

## 7. Open Items (Future)

These are **not part of this implementation** but are enabled by it:

| Item | Description | Depends On |
|------|-------------|------------|
| **Passive tick damage** | Monsters deal damage/sec just by being alive | Phase 6 |
| **Hybrid damage skills** | Skills that deal both physical + magic | Phase 3 |
| **Type-boosting passives** | New passive skills: "Fire Mastery: +20% magic damage" | Phase 3 |
| **Elemental weapons** | Weapons that convert physical → magic damage | Phase 3 |
| **Status-reactive skills** | Skills that change behavior based on active status effects | Phase 5 |
| **Monster status effects on player** | Expansion beyond foundation (more monsters apply effects) | Phase 6 |
| **Resistance-shredding debuffs** | Skills/effects that temporarily lower target armor/MR | Phase 5 |
| **Item set bonuses** | Wearing matching items boosts a damage type | Phase 3 |
| **Ascension type bonuses** | Permanent damage type bonuses from prestige | Phase 1 |
| **Weak point mechanic** | Click timing/spatial bonus damage (parked from brainstorm) | Independent |

---

## Summary

| Phase | Scope | Effort | Status |
|-------|-------|--------|--------|
| 1. Foundation | Stats, formula, constants | Small | **DONE** |
| 2. Combat Pipeline | Typed damage flow | Medium | **DONE** |
| 3. Data Migration | Monsters, items, skills | Medium-Large | **DONE** |
| 4. Shield Rework | Simplify + status immunity | Small | Pending |
| 5. Status Effects | New system (5 effects) | Large | Pending |
| 6. Monster Threat | Typed monster damage | Small-Medium | Pending |
| 7. UI & Polish | Visual feedback | Medium | Pending |

**The game remains playable after every phase.** Phase 1-2 changes the math but defaults to physical. Phase 3 makes it type-aware. Phase 4-5 adds the status layer. Phase 6 makes monsters dangerous. Phase 7 makes it all visible.

**No balance pass during implementation.** Numbers will be off — that's expected. Balance tuning is a separate effort once the system is complete and all mechanics interact.

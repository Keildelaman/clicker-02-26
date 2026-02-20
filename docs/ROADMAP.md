# Implementation Roadmap

> Phased build plan for Realms of Clickoria.
> Each phase produces a playable, testable game. Commit after each phase.

---

## Progress Tracker

| Phase | Name | Status | Commit |
|-------|------|--------|--------|
| 0+1 | Skeleton + Click Combat | ✅ Complete | — |
| 2 | Player Bars & Resources | ✅ Complete | — |
| 3 | Progression (XP & Leveling) | ✅ Complete | — |
| 4 | Economy & Equipment | ✅ Complete | — |
| 5 | Monster Types (all 6) | ✅ Complete | — |
| 6 | Zones & Bosses | ✅ Complete | — |
| 7 | Skills v1 (25 skills, MP system) | ✅ Complete (superseded by 7.5) | — |
| 8 | Tutorial System | ✅ Complete | — |
| 8.5 | Content Expansion (35 monsters + 16 items) | ✅ Complete | — |
| 7.5a | Skill v2: Foundation | ✅ Complete | — |
| 7.5b | Skill v2: Core Mechanics | ✅ Complete | — |
| 7.5c | Skill v2: Advanced Mechanics | ✅ Complete | — |
| 7.5d | Skill v2: UI & UX | ✅ Complete | — |
| 7.5e | Skill v2: Balance & Cleanup | ✅ Complete | — |
| 9 | Ascension & Vault | ⬜ Not Started | — |
| 10 | Save/Load Hardening | ⬜ Not Started | — |
| 11 | Polish & Accessibility | ⬜ Not Started | — |
| 12 | Item System v2 (8 sub-phases) | ✅ Complete | — |

**Status key:** ⬜ Not Started | 🔨 In Progress | ✅ Complete

---

## Phase 0+1: Skeleton + Click Combat

**Goal:** Tappable game in the browser. Click monster, see damage, monster dies, new one spawns.

### What to build

**Core framework:**
- `index.html` — minimal markup shell (header, monster area, stats bar, skill bar, nav)
- `css/` — variables.css, layout.css, components.css, animations.css, responsive.css, styles.css
- `js/core/event-bus.js` — pub/sub system
- `js/core/game-state.js` — central state store
- `js/core/game-loop.js` — rAF loop with delta time
- `js/main.js` — bootstrap sequence

**Systems:**
- `js/systems/combat.js` — click handler, damage calculation, combat state machine
- `js/systems/player.js` — createNewPlayer(), getComputedStats(), stat cache
- `js/systems/monster.js` — monster selection, instance creation (normal type only)

**Data:**
- `js/data/constants.js` — all constants from _INDEX.md
- `js/data/monsters.data.js` — Whisperwood monsters only (4 normal + boss definition)
- `js/data/zones.data.js` — Whisperwood zone only

**UI:**
- `js/ui/renderer.js` — master render coordinator
- `js/ui/combat-ui.js` — monster display, damage numbers, HP bar
- `js/ui/stats-ui.js` — attack, gold display
- `js/ui/toasts.js` — basic toast notifications

**Services:**
- `js/services/utils.js` — randomInt, clamp, formatNumber
- `js/services/storage.js` — basic save/load (simple version)

### Docs to reference
- `docs/architecture/architecture.md`
- `docs/architecture/coding-standards.md`
- `docs/systems/combat.system.md`
- `docs/schemas/monster.schema.md`
- `docs/schemas/player.schema.md`
- `docs/data/monsters.data.md` (Whisperwood section only)

### Playtest checklist
- [ ] Page loads without errors
- [ ] Monster appears with name and HP bar
- [ ] Clicking deals damage (number floats up)
- [ ] Monster HP bar decreases
- [ ] Monster dies at 0 HP (death animation)
- [ ] Gold awarded on kill (counter updates)
- [ ] New monster spawns after 500ms delay
- [ ] Game loop runs smoothly (no jank)
- [ ] Works on mobile viewport

---

## Phase 2: Player Bars & Resources

**Goal:** Player HP bar, energy bar, XP bar visible. HP regen ticking. Energy builds on clicks.

### What to build

**Systems:**
- `js/systems/health.js` — HP regen, max HP calculation
- `js/systems/energy.js` — energy gain from clicks (with 200ms cooldown), energy regen

**UI:**
- `js/ui/bars-ui.js` — HP bar (green/yellow/red), energy bar, XP bar

### Docs to reference
- `docs/systems/health.system.md`
- `docs/systems/energy.system.md`
- `docs/systems/ui.system.md`

### Playtest checklist
- [ ] Player HP bar visible with correct max HP
- [ ] HP bar colors change at thresholds (green >50%, yellow 25-50%, red <25%)
- [ ] HP regenerates passively (~1.5%/sec)
- [ ] Energy bar fills on clicks (+5 per click, max 5/sec)
- [ ] Energy bar fills on monster kill (+15)
- [ ] Energy passive regen (+2/sec)
- [ ] Energy caps at 100
- [ ] XP bar shows current progress

---

## Phase 3: Progression (XP & Leveling)

**Goal:** Killing monsters grants XP. Level up with celebration. Stats increase per level.

### What to build

**Systems:**
- `js/systems/progression.js` — XP granting, level-up detection, milestone checks

**Data:**
- `js/data/balance.js` — XP curve formula, level stat scaling

**UI:**
- `js/ui/modals.js` — level-up celebration modal

### Docs to reference
- `docs/systems/progression.system.md`
- `docs/balance/curves.balance.md`

### Playtest checklist
- [ ] Monsters grant XP on kill
- [ ] XP bar fills correctly
- [ ] Level up triggers at correct XP threshold
- [ ] Level-up celebration modal appears
- [ ] +1 attack and +10 max HP per level
- [ ] Full heal on level up
- [ ] Overflow XP carries to next level
- [ ] XP requirement increases per level (12% growth)

---

## Phase 4: Economy & Equipment

**Goal:** Gold economy, shop with 3 rotating items, buy/equip/sell items, inventory screen.

### What to build

**Systems:**
- `js/systems/economy.js` — gold grants, shop rotation, buy/sell, refresh escalation
- `js/systems/loot.js` — drop rolls on monster kill

**Data:**
- `js/data/items.data.js` — Whisperwood + Dustwind items

**UI:**
- `js/ui/shop-ui.js` — shop screen, inventory tab, equip/sell
- `js/ui/screens.js` — screen navigation (combat ↔ shop)

### Docs to reference
- `docs/systems/economy.system.md`
- `docs/systems/loot.system.md`
- `docs/schemas/item.schema.md`
- `docs/data/items.data.md`

### Playtest checklist
- [ ] Gold counter updates on monster kill
- [ ] Shop screen accessible from nav
- [ ] Shop shows 3 random items from current zone
- [ ] Shop refreshes every 10 minutes
- [ ] Manual refresh costs gold (escalating)
- [ ] Can buy items (gold deducted, item in inventory)
- [ ] Can equip items (stats change)
- [ ] Can sell items (25% of buy price)
- [ ] Items drop from monsters (chance-based)
- [ ] Drop notification shows with equip option
- [ ] Attack stat updates when equipping weapon

---

## Phase 5: Monster Types (all 6)

**Goal:** All 6 monster types working with unique mechanics and visual indicators.

### What to build (incremental, one type at a time)

1. **Swift** — escape timer, damage on escape
2. **Aggressive** — attack cycle (safe/warning/attack), damage on mistimed click
3. **Regenerating** — HP regen per tick
4. **Armored** — flat damage reduction
5. **Shielded** — shield bar, reduced damage while shielded
6. **Multi-type** — combine mechanics (split on "+")

### Docs to reference
- `docs/systems/combat.system.md` (monster types section)
- `docs/data/monsters.data.md`

### Playtest checklist
- [ ] Swift: timer visible, escape deals damage, no loot on escape
- [ ] Aggressive: phases cycle (safe→warning→attack), clicking during attack hurts player
- [ ] Regenerating: monster HP recovers over time, must out-DPS regen
- [ ] Armored: damage reduced by armor value, minimum 1 damage
- [ ] Shielded: shield bar visible, 50% reduction while shielded, shield breaks
- [ ] Multi-type: aggressive+armored works, aggressive+shielded works
- [ ] Visual indicators correct for each type

---

## Phase 6: Zones & Bosses

**Goal:** All 7 zones accessible, zone travel, boss fights, zone unlock progression.

### What to build

**Systems:**
- `js/systems/zones.js` — zone travel, unlock checks, boss access

**Data:**
- Complete all zone/monster/item data files for zones 2-7

**UI:**
- `js/ui/zones-ui.js` — zone selection modal
- Boss intro modal, boss defeat celebration in modals.js

### Docs to reference
- `docs/data/zones.data.md`
- `docs/data/monsters.data.md` (all zones)
- `docs/data/items.data.md` (all zones)
- `docs/schemas/zone.schema.md`

### Playtest checklist
- [ ] Zone selection modal shows all 7 zones
- [ ] Locked zones show lock icon and unlock condition
- [ ] Zone travel works (monster spawns from new zone)
- [ ] Boss button visible in zone panel
- [ ] Boss intro modal with type warning
- [ ] Boss fights work (aggressive + secondary type)
- [ ] Boss death unlocks next zone
- [ ] Boss guaranteed drops work
- [ ] Zone theme colors change on travel
- [ ] Can return to previous zones

---

## Phase 7: Skills v1 (Superseded by Phase 7.5)

**Goal:** ~~Full skill system — mastery points, unlock, upgrade, active/passive skills, buffs.~~ **Replaced by Skill System v2.**

**Status:** ✅ Complete, but superseded. The v1 system (25 skills, MP-based unlocks) is implemented and functional. Phase 7.5 replaces it with a redesigned system that creates meaningful build diversity.

**Why replaced:** v1 skills don't create meaningful build diversity. All builds feel similar. The MP economy has flat unlock costs that don't reward specialization. Skill effects are simple stat modifications without interesting interactions.

**Reference:** `docs/design/skill-system-v2.md` (canonical specification for the replacement)

---

## Phase 8: Tutorial System

**Goal:** New player onboarding, contextual tips, first-time bonuses.

### What to build

**Systems:**
- `js/systems/tutorial.js` — first-time detection, tip scheduling, bonus granting

### Docs to reference
- `docs/systems/tutorial.system.md`

### Playtest checklist
- [ ] Welcome screen on first load
- [ ] "Tap the monster" prompt with highlight
- [ ] First kill celebration (+10 gold bonus)
- [ ] Level-up tutorial
- [ ] Energy full tip
- [ ] Shop suggestion at level 3
- [ ] Aggressive monster warning on first encounter
- [ ] Boss fight tips
- [ ] Zone unlock explanation
- [ ] First death mercy (no gold loss)
- [ ] Tips respect cooldown (60s between)
- [ ] Tips disabled after level 20
- [ ] Tutorial state saved (no re-triggers)

---

## Phase 8.5: Content Expansion

**Goal:** Fill out remaining content — all 35 monsters and 16 additional items across all zones.

**Status:** ✅ Complete

---

## Phase 7.5a: Skill v2 — Foundation

**Goal:** Replace the data layer, constants, state schema, and save migration for the new skill system. Stub the skills system so the game boots and Power Strike works with SP-based progression.

### Files to modify

| File | Change |
|------|--------|
| `js/data/skills.data.js` | **REWRITE** — 25 new skills (15 active + 10 passive), new data schema |
| `js/data/constants.js` | Modify — SP system constants, energy v2 values, respec costs; remove MP constants |
| `js/core/game-state.js` | Modify — add transient fields: `hitModifier`, `clickModifiers`, `toggleStates`, `channelState`, `passiveStates` |
| `js/systems/player.js` | Modify — update `createNewPlayer()`: `masteryPoints`→`skillPoints`, `unlockedSkills` array→map, `equippedActiveSkills`→`equippedActive` |
| `js/services/storage.js` | Modify — v3→v4 save migration: SP refund based on level, reset all skills, delete old fields |
| `js/systems/skills.js` | Stub — SP-based unlock/upgrade, SP granting every 3 levels, Power Strike only |
| `js/systems/zones.js` | Modify — remove MP granting on boss kill |
| `index.html` | Modify — MP→SP labels |
| `js/ui/skills-ui.js` | Minimal — update MP→SP references |
| `js/ui/renderer.js` | Modify — update MP→SP rendering |
| `js/main.js` | Modify — update debug tools (`giveMP`→`giveSP`, update `unlockAllSkills`) |
| `docs/architecture/skill-architecture.md` | **CREATE** — developer implementation guide |

### What to build

1. **Skill data rewrite** — All 25 skills defined with new schema (id, name, description, category, type, tags, mechanic, unlockLevel, unlockCost, upgradeCost, maxLevel, mutation: null, levels: {...})
2. **Constants update** — Replace MP constants with SP system (1 SP every 3 levels, starting at level 3). Energy v2: 3/click, 10/kill, 25/boss, 1/sec regen. Add `RESPEC_COSTS: [1000, 3000, 8000, 20000, 50000, 100000]`
3. **Player state migration** — New player object uses `skillPoints`, `totalSPEarned`, `respecCount`, `unlockedSkills` (map), `equippedActive` (4 slots), `equippedPassive` (3 slots), `skillCooldowns` (map)
4. **Transient state** — Add to game-state.js: `hitModifier: null`, `clickModifiers: {}`, `toggleStates: {}`, `channelState: null`, `passiveStates: {}`, `lastClickTime: 0`
5. **Save migration** — Detect old save, refund all SP based on player level (floor(level / 3) SP), reset skills completely, delete `masteryPoints`, `masterySpent`, old skill arrays
6. **Skills stub** — `init()`, `update(dt)`, `useSkill(skillId)`, `unlockSkill(skillId)`, `upgradeSkill(skillId)`. Only Power Strike effect handler functional. SP granting on level-up (listen `player:levelUp`, grant 1 SP if `newLevel % 3 === 0`)
7. **Zone cleanup** — Remove MP granting from boss kill handler in zones.js
8. **UI fixup** — Find-replace MP→SP in index.html, skills-ui.js, renderer.js
9. **Debug tools** — Replace `giveMP` with `giveSP`, update `unlockAllSkills` for new data structure

### Docs to reference
- `docs/design/skill-system-v2.md` (sections 3, 15, 16)
- `docs/architecture/skill-architecture.md` (created in this phase)

### Playtest checklist
- [ ] Game loads without errors (existing save migrates cleanly)
- [ ] Fresh game starts with 0 SP, Power Strike unlocked at level 1
- [ ] SP display shows "SP: 0" in skills screen header
- [ ] Gain 1 SP at level 3, 6, 9 (verify via debug `giveXP`)
- [ ] Can upgrade Power Strike to level 2 for 1 SP
- [ ] Power Strike activates: queues hit modifier, next click consumes it for 1000% damage
- [ ] Energy values match v2: +3/click, +10/kill, +1/sec regen
- [ ] Old save with MP/skills loads correctly (skills reset, SP refunded)
- [ ] Debug `giveSP(10)` works
- [ ] No console errors on any screen

---

## Phase 7.5b: Skill v2 — Core Mechanics

**Goal:** Implement the SP system, all standard effect types (hit modifiers, click modifiers, instant, buff, utility), combat integration with multi-hit pipeline, and the respec system.

### Files to modify

| File | Change |
|------|--------|
| `js/systems/skills.js` | **MAJOR** — effect context factory, 13 EFFECT_HANDLERS, respec system, tick-based cooldowns |
| `js/systems/combat.js` | **MAJOR** — multi-hit pipeline (Flurry), hit/click modifier consumption, `combat:crit` event, instant skill damage handler |
| `js/systems/energy.js` | Modify — update constants to v2 values (if not done in 7.5a) |
| `js/systems/player.js` | Modify — `getComputedStats()` for simple stat passives |
| `js/ui/skills-ui.js` | Moderate — respec button, unlock/upgrade with SP cost display |
| `js/ui/renderer.js` | Modify — render new skill states |

### What to build

1. **Effect context factory** — Create a context object passed to each effect handler with methods:
   - `setHitModifier(skillId, multiplier)` — queue a hit modifier (replaces any existing)
   - `setClickModifier(skillId, charges)` — set a click modifier with N charges
   - `dealInstantDamage(hits, damagePerHit)` — emit `skill:instantDamage` for combat.js to apply
   - `startBuff(skillId, duration, effects)` — add a timed buff to `activeBuffs`
   - `grantEnergy(amount)` — add energy (capped at max)
   - `grantShield(amount, duration)` — set player shield
   - `costHP(percent)` — deduct % of current HP

2. **EFFECT_HANDLERS** — Implement handlers for:
   - Hit modifiers: `power_strike`, `execute`, `shatter`
   - Click modifier: `precision`
   - Instant damage: `barrage`, `arcane_bolt`, `chain_lightning`, `shield_bash`
   - Buffs: `flurry`, `adrenaline_rush`
   - Utility: `energy_surge`, `overcharge`, `life_tap`

3. **Combat multi-hit pipeline** — Rewrite `handleClick()`:
   - Check Flurry buff → determine `hitsPerClick` (1, 2, or 3)
   - For each hit: roll crit, compute base damage, apply hit modifier on PRIMARY hit only, apply passive bonuses, apply monster defenses
   - After all hits: consume click modifier (decrement Precision charges), emit `combat:click` with total damage
   - Emit `combat:crit` event on each critical hit (for Critical Flow passive in 7.5c)

4. **Instant skill damage** — combat.js listens for `skill:instantDamage`, applies each hit to current monster (crit rolls, passive bonuses, defenses)

5. **Respec system** — `respecSkills()`: validate gold cost, refund all SP, clear all unlock/upgrade/equip state, increment `respecCount`, emit `skill:respecCompleted`

6. **Tick-based cooldowns** — In `skills.update(dt)`: decrement each `skillCooldowns[id]` by dt, remove when ≤ 0, emit `skill:cooldownReady`

### Docs to reference
- `docs/design/skill-system-v2.md` (sections 5, 6, 8, 11, 15)
- `docs/architecture/skill-architecture.md` (sections 6, 8, 9)

### Playtest checklist
- [ ] Power Strike: queues hit modifier, consumed on click, 1000% damage at Lv1
- [ ] Execute: checks monster HP threshold, strong/weak multiplier works correctly
- [ ] Shatter: deals ATK damage + %maxHP flat damage (ignores armor)
- [ ] Precision: N guaranteed crits, counter decrements per click (not per hit)
- [ ] Barrage: fires 5 hits at 60% each, each can crit, independent of clicks
- [ ] Arcane Bolt: instant 400% damage, shortest cooldown
- [ ] Chain Lightning: 600% damage, overkill carries 40% to next spawn
- [ ] Shield Bash: 200% damage + shield (12% max HP, 6s duration)
- [ ] Flurry: 2 hits per click for 4s, hit modifier only on primary, crits on all
- [ ] Adrenaline Rush: crit chance = energy%, energy drains 12/sec
- [ ] Energy Surge: +35 energy, no energy cost
- [ ] Overcharge: reduces all other skill CDs by 3s
- [ ] Life Tap: costs 20% current HP, gains 25 energy
- [ ] Respec: costs correct gold, refunds all SP, clears all skills
- [ ] Cooldowns decrement smoothly (no jumps or freezes)
- [ ] Energy v2 values feel right (can sustain ~2 skills per rotation)

---

## Phase 7.5c: Skill v2 — Advanced Mechanics

**Goal:** Implement toggle skills, channel skills, and all 10 passive skill handlers with subscribe/unsubscribe lifecycle.

### Files to modify

| File | Change |
|------|--------|
| `js/systems/skills.js` | **MAJOR** — toggle/channel mechanics, PASSIVE_HANDLERS map with subscribe/unsubscribe |
| `js/systems/combat.js` | **MAJOR** — channel release damage, `combat:crit` emission, overkill carry for Chain Lightning |
| `js/systems/energy.js` | Modify — Heavy Handed energy override |
| `js/systems/player.js` | Modify — Berserker/Heavy Handed conditional stat modifiers in `getComputedStats()` |

### What to build

1. **Toggle skills** — Add to skills.js:
   - `toggleSkill(skillId)`: flip toggle state, start energy drain if ON
   - Toggle state management: track `stacks`, drain energy per tick, auto-toggle OFF at 0 energy
   - Momentum: +damage/stack on consecutive clicks (within 0.8s), decay timer, max stacks

2. **Channel skills** — Add to skills.js:
   - `startChannel(skillId, channelRange)`: set channel state, block clicks, start charging
   - `releaseChannel()`: export for UI, calculate damage from hold duration (linear between min/max), fire auto-hit at current monster
   - Channel state: `{ skillId, startTime, minDuration, maxDuration, minMult, maxMult }`

3. **PASSIVE_HANDLERS map** — Each passive defines `{ events[], init?(), handler(), cleanup?() }`:
   - `click_mastery` — consecutive click stacking: track lastClickTime, increment/reset stack count, apply damage bonus
   - `vampiric_strikes` — heal on click damage: listen `combat:click`, heal `damage * percent`
   - `critical_flow` — energy on crit: listen `combat:crit`, grant energy
   - `heavy_handed` — stat modifier: modify click damage in `getComputedStats()` + override energy per click in energy.js
   - `combo_artist` — 2 skills in window → damage buff: listen `skill:used`, track timestamps, start buff
   - `berserker` — conditional stat modifier: check HP threshold each tick, apply damage/crit bonus in `getComputedStats()`
   - `efficient_casting` — cost reduction: modify energy cost calculation in `useSkill()`
   - `spell_weaver` — CDR on skill use: listen `skill:used`, reduce all other CDs
   - `residual_energy` — energy on `skill:effectEnded`: grant energy when buffs expire, modifiers consumed, toggle OFF
   - `focused_mind` — idle energy regen: track lastClickTime, grant extra energy/sec when idle >0.5s

4. **Passive lifecycle** — On equip: subscribe handlers to events. On unequip: unsubscribe. Prevents orphaned listeners.

5. **Cooldown floor enforcement** — All CDR applications (Spell Weaver, Overcharge) enforce minimum CD = 50% of base cooldown

### Docs to reference
- `docs/design/skill-system-v2.md` (sections 5, 6, 8.9-8.12, 9)
- `docs/architecture/skill-architecture.md` (sections 5, 7, 9)

### Playtest checklist
- [ ] Momentum toggle ON: energy drains, stacks build on consecutive clicks (within 0.8s)
- [ ] Momentum: stacks reset if no click within decay timer (1.5s at Lv1)
- [ ] Momentum: auto-toggles OFF at 0 energy, stacks lost
- [ ] Momentum: toggling OFF manually resets stacks
- [ ] Charge Up: hold skill button to charge, screen indicates charging progress
- [ ] Charge Up: release fires auto-hit, damage scales with hold duration
- [ ] Charge Up: cannot click monster during channel
- [ ] Charge Up: does NOT consume hit modifiers or Precision charges
- [ ] Click Mastery: stacks build on fast clicks, reset on pause, damage bonus applies
- [ ] Vampiric Strikes: heal on click damage, applies per-hit (works with Flurry)
- [ ] Critical Flow: energy gained on each crit (clicks, skills, all sources)
- [ ] Heavy Handed: +40% click damage, energy per click reduced to 1.5
- [ ] Combo Artist: using 2 different skills within 3s → +30% damage buff for 4s
- [ ] Berserker: below 50% HP → +20% damage, +10% crit
- [ ] Efficient Casting: -15% energy cost on all active skills
- [ ] Spell Weaver: using any skill reduces all other CDs by 0.8s
- [ ] Residual Energy: gain 8 energy when buff/modifier expires or toggle OFF
- [ ] Focused Mind: +3 energy/sec when not clicking for 0.5s
- [ ] CDR floor: no cooldown goes below 50% of base CD
- [ ] Passives subscribe on equip, unsubscribe on unequip (no orphaned listeners)
- [ ] All 25 skills functional

---

## Phase 7.5d: Skill v2 — UI & UX

**Goal:** Rewrite the skills screen for the new system, polish the skill bar for toggle/channel interactions, add buff indicators and multi-hit damage feedback.

### Files to modify

| File | Change |
|------|--------|
| `js/ui/skills-ui.js` | **REWRITE** — category-grouped skill list, SP counter, unlock/upgrade with preview, respec UI |
| `js/ui/combat-ui.js` | Modify — multi-hit damage numbers, instant skill damage floats, channel display, execute threshold marker |
| `index.html` | Modify — add buff indicator row above skill bar |
| `css/components.css` | Modify — toggle pulse, channel charge animation, buff indicators, skill card badges |
| `css/animations.css` | Modify — new keyframes for toggle glow, charge fill, buff pulse |

### What to build

1. **Skills screen rewrite** — `skills-ui.js`:
   - Header with "Skills" title and SP counter ("SP: 12")
   - Two tabs: Active | Passive
   - Skill list grouped by category (Speed, Power, Crit, Mage, Utility), sorted by unlockLevel within category
   - Locked skills: greyed card with "Unlocks at Lv X"
   - Available skills: name, description, level (stars or bar 1-5), upgrade button with SP cost
   - Skill detail expand: full description, current level stats, next level preview (stat comparison), equip/unequip button
   - Mechanic badges on skill cards (e.g., "Hit Modifier", "Toggle", "Channel", "Instant")
   - Respec button at bottom with gold cost + confirmation modal

2. **Skill bar polish**:
   - Toggle button: pulsing glow border when ON, stack count number overlay
   - Channel button: hold-to-charge interaction (pointerdown starts, pointerup releases), fill ring animation
   - Buff indicator row above skill bar: small icons for active buffs with remaining duration
   - Next-click modifier indicator: icon above skill bar when hit modifier queued

3. **Combat feedback**:
   - Multi-hit damage numbers: stagger display (slight delay between Flurry hits)
   - Instant skill damage: different color/style floats (e.g., purple for Arcane Bolt)
   - Channel release: large dramatic damage number
   - Execute threshold marker: visual indicator on monster HP bar at the threshold %

### Docs to reference
- `docs/design/skill-system-v2.md` (section 14 — UI Requirements)
- `docs/systems/ui.system.md`

### Playtest checklist
- [ ] Skills screen shows all 25 skills organized by category
- [ ] SP counter updates on earn/spend
- [ ] Locked skills show "Unlocks at Lv X" with correct levels
- [ ] Unlock button appears at correct player level, costs 1 SP
- [ ] Upgrade button shows SP cost, next level stat preview
- [ ] Equip/unequip works (4 active slots, 3 passive slots)
- [ ] Respec button shows correct gold cost, confirmation required
- [ ] Toggle skill button pulses when ON, shows stack count
- [ ] Channel skill responds to hold (pointerdown/pointerup), shows charge progress
- [ ] Buff indicators show above skill bar with timers
- [ ] Hit modifier indicator shows when queued (Power Strike, Execute, Shatter)
- [ ] Flurry multi-hit damage numbers stagger nicely
- [ ] Arcane Bolt/Chain Lightning damage floats have distinct style
- [ ] Execute threshold marker visible on monster HP bar
- [ ] All interactions feel good on mobile (44px targets, responsive)

---

## Phase 7.5e: Skill v2 — Balance, Testing & Cleanup

**Goal:** Balance pass on all skills, test example builds, remove old documentation, clean dead code, full regression testing.

### Files to modify

| File | Change |
|------|--------|
| `js/data/skills.data.js` | Balance — verify DPS framework targets from v2 spec section 12 |
| `js/core/game-state.js` | Cleanup — remove any leftover v1 transient fields |
| `js/systems/skills.js` | Cleanup — remove old effect types, dead code |
| `js/systems/health.js` | Update — verify shield interaction with new system |
| `docs/ROADMAP.md` | Update — mark all 7.5 phases complete |
| `docs/architecture/skill-architecture.md` | Update — reflect any changes from implementation |
| `docs/systems/skill.system.md` | **DELETE** — replaced by `docs/design/skill-system-v2.md` |
| `docs/data/skills.data.md` | **DELETE** — replaced by `docs/design/skill-system-v2.md` |

### What to build

1. **Balance pass** — For each skill, verify:
   - Cycle DPS contribution within target (+25-50% at Lv1, +60-120% at Lv5)
   - Energy cost = ~2-4 seconds of clicking energy income
   - No skill combo exceeds 5x pure clicking DPS
   - Verify against DPS framework in v2 spec section 12

2. **Build testing** — Play through all 4 example builds:
   - Speed Demon: Flurry + Barrage + Momentum + Energy Surge / Click Mastery + Combo Artist + Critical Flow
   - Executioner: Power Strike + Precision + Execute + Charge Up / Heavy Handed + Focused Mind + Combo Artist
   - Arcane Caster: Arcane Bolt + Chain Lightning + Overcharge + Energy Surge / Spell Weaver + Efficient Casting + Combo Artist
   - Adrenaline Junkie: Adrenaline Rush + Precision + Execute + Energy Surge / Critical Flow + Berserker + Residual Energy

3. **Edge case testing**:
   - Death during active buffs (buffs should clear)
   - Tab switch during channel (should cancel)
   - Save/load cycle preserves all skill state correctly
   - Respec with active buffs/modifiers (should clear everything)
   - Toggle ON → death → respawn (toggle should be OFF)

4. **Dead code cleanup**:
   - Remove `timingMode` handling from old skills
   - Remove old effect type handlers
   - Remove any `masteryPoints` references
   - Remove old MP-related events

5. **Doc cleanup**:
   - Delete `docs/systems/skill.system.md`
   - Delete `docs/data/skills.data.md`
   - `docs/design/skill-system-v2.md` becomes the canonical skill reference
   - Update `docs/_INDEX.md` to reflect document changes

### Docs to reference
- `docs/design/skill-system-v2.md` (section 12 — Balance Framework)
- `docs/architecture/skill-architecture.md`

### Playtest checklist
- [ ] Speed Demon build: ~3x pure clicking DPS (~2200 DPS at Lv50)
- [ ] Executioner build: ~2.6x pure clicking DPS, massive single hits
- [ ] Arcane Caster build: ~3.3x pure clicking DPS, near-permanent skill uptime
- [ ] Adrenaline Junkie build: ~3-5.5x during crit windows, ~2.9x sustained
- [ ] Energy sustainability: 2 skills/rotation easy, 3 tight, 4 requires energy passives
- [ ] No skill combo exceeds 5x pure clicking DPS sustained
- [ ] Save/load preserves all skill state (SP, unlocks, cooldowns, equipped)
- [ ] Death clears all buffs, modifiers, toggles, channels
- [ ] Tab switch cancels channels without crashing
- [ ] Respec works with active buffs (clears everything)
- [ ] No console errors, no dead code references
- [ ] Old docs removed, no broken links
- [ ] Full game playthrough: Level 1→20 feels smooth with skill unlocks

---

## Phase 9: Ascension & Vault

**Goal:** Prestige system, equipment vault, permanent bonuses, ascended mode.

### What to build

**Systems:**
- `js/systems/ascension.js` — ascension check, vault selection, reset, bonuses, ascended mode

**UI:**
- Ascension screen, vault screen, vault selection (pre-ascension)

### Docs to reference
- `docs/systems/ascension.system.md`

### Playtest checklist
- [ ] Ascension available at level 100 + final boss defeated
- [ ] Ascension screen shows gains and losses
- [ ] Vault selection screen (max 8 items)
- [ ] Type "ASCEND" confirmation
- [ ] Full reset: level, gold, skills, zones
- [ ] Permanent bonuses apply (+5% damage/gold/XP, +50 HP per ascension)
- [ ] Starting SP bonus (scaled per ascension level)
- [ ] Skill level cap increases with ascension
- [ ] Vault items accessible from shop
- [ ] Vault withdrawal costs gold (25% of buy price)
- [ ] Ascended mode toggle (after ascension 3)
- [ ] Ascended monsters have +50% HP/damage, +75% rewards

---

## Phase 10: Save/Load Hardening

**Goal:** Robust persistence, export/import, migration, edge case handling.

### What to build

- Harden `js/services/storage.js`
- Save migration system
- Export/import via clipboard
- Settings modal (save controls)

### Docs to reference
- `docs/schemas/player.schema.md`
- `docs/_INDEX.md` (save version)

### Playtest checklist
- [ ] Auto-save every 30 seconds
- [ ] Save on all critical events (level-up, boss kill, zone change, etc.)
- [ ] Save on tab close (beforeunload)
- [ ] Load correctly restores full state
- [ ] Corrupted save handled gracefully
- [ ] Export save to clipboard works
- [ ] Import save from clipboard works
- [ ] New Game resets everything
- [ ] Save version migration works

---

## Phase 11: Polish & Accessibility

**Goal:** Production-quality animations, responsive design, accessibility, edge cases.

### What to build

- CSS animation polish (damage floats, level-up particles, screen shakes)
- Responsive design tuning (tablet, desktop breakpoints)
- Accessibility pass (focus management, aria labels, keyboard nav)
- Performance profiling and optimization
- Edge case fixes from testing

### Docs to reference
- `docs/systems/ui.system.md`
- `docs/architecture/coding-standards.md`

### Playtest checklist
- [ ] Smooth on mobile (no jank)
- [ ] 44px minimum touch targets
- [ ] Readable at 200% zoom
- [ ] Keyboard navigable
- [ ] Screen reader announces key changes
- [ ] prefers-reduced-motion respected
- [ ] No content flashes
- [ ] Gold counter animates smoothly
- [ ] Damage numbers float and fade correctly
- [ ] Level-up celebration looks great
- [ ] All screens transition smoothly
- [ ] Works on iOS Safari, Chrome Android, desktop Chrome/Firefox

---

## Phase 12: Item System v2

**Goal:** Complete item system overhaul — 6 equipment slots, random affixes, 5 rarities, crafting (reforge/imbue/temper), boss materials, legendary items with unique effects.

**Status:** ✅ Complete (all 8 sub-phases)

**Detailed roadmap:** `docs/design/item-system-v2-roadmap.md` (8 sub-phases with verification checklists)
**Architecture guide:** `docs/architecture/item-system-v2-architecture.md` (module structure, events, DI wiring)
**Design doc:** `docs/design/item-system-v2.md` (canonical specification — all design questions resolved)

### Sub-phases

| Phase | Name | Est. Lines | Status |
|-------|------|-----------|--------|
| 12.1 | Data Layer Foundation | ~800 | ✅ |
| 12.2 | Item Generation Engine | ~400 | ✅ |
| 12.3 | Item Crafting Engine | ~350 | ✅ |
| 12.4 | Core Item System + Migration | ~700 | ✅ |
| 12.5 | System Integrations | ~600 | ✅ |
| 12.6 | Crafting Integration | ~150 | ✅ |
| 12.7 | UI | ~900 | ✅ |
| 12.8 | Legendary Effects + Polish | ~600 | ✅ |

**Total: ~5000 lines, 8-10 sessions**

### What's new
- 6 equipment slots (weapon, helmet, chest, gloves, boots, accessory)
- 63 affixes across 7 categories with tier scaling
- 5 rarities: Common (1 affix) → Legendary (4 + unique effect)
- Random item generation with slot-weighted affix pools
- 3 modification systems: Reforge (fix bad rolls), Imbue (add missing affix), Temper (push to perfection)
- Boss material system: farm materials, spend to challenge bosses
- Boss scaling: boss level = max(baseLv, playerLv - 5)
- 15 legendary items with build-defining unique effects
- Shop v2: 4 randomly generated items, 15-min refresh
- Item skill level bonuses (+level to skills, beyond-max scaling)
- Weapon base name determines click damage type (physical vs magic)
- v4→v5 save migration: complete item wipe with 50% gold compensation

---

## Workflow Per Phase

```
1. "Let's do Phase X"
2. Claude reads the relevant docs listed for that phase
3. Claude implements the system(s) and UI
4. User tests in browser (python -m http.server 8000 or npx serve .)
5. Fix any issues found
6. Git commit
7. Update this roadmap (mark phase ✅, add commit hash)
8. Next phase
```

---

*Estimated total: 10-15 sessions. Each phase is self-contained and produces a playable game.*

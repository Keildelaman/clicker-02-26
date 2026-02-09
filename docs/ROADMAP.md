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
| 7 | Skills (all 25) | ✅ Complete | — |
| 8 | Tutorial System | ✅ Complete | — |
| 9 | Ascension & Vault | ⬜ Not Started | — |
| 10 | Save/Load Hardening | ⬜ Not Started | — |
| 11 | Polish & Accessibility | ⬜ Not Started | — |

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

## Phase 7: Skills (all 25)

**Goal:** Full skill system — mastery points, unlock, upgrade, active/passive skills, buffs.

### What to build

**Systems:**
- `js/systems/skills.js` — MP tracking, unlock, upgrade, cooldowns, all 25 effect handlers, buff management

**Data:**
- `js/data/skills.data.js` — all 25 skill definitions

**UI:**
- `js/ui/skills-ui.js` — skill screen, skill bar (4 active slots), passive display, MP counter

### Docs to reference
- `docs/systems/skill.system.md`
- `docs/data/skills.data.md`
- `docs/schemas/skill.schema.md`

### Playtest checklist
- [ ] MP awarded at level milestones and boss kills
- [ ] Skills screen shows all 25 skills
- [ ] Unlock costs correct MP per tier
- [ ] Upgrade costs scale correctly (1, 2, 3, 4 MP)
- [ ] Power Strike works (free, pre-equipped)
- [ ] Active skills: energy cost, cooldown, visual effect
- [ ] Passive skills: stat bonuses apply correctly
- [ ] Skill bar shows 4 active slots with cooldown timers
- [ ] Skill swap works outside combat
- [ ] Buff timers display and expire correctly
- [ ] All 16 active skill effects work
- [ ] All 9 passive skill effects work
- [ ] Stat cache invalidates on skill changes

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
- [ ] Starting MP bonus (3 per ascension level)
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

*Estimated total: 8-12 sessions. Each phase is self-contained and produces a playable game.*

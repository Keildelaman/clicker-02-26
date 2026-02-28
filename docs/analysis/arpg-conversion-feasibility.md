# ARPG Conversion Feasibility Analysis

**Date:** 2026-02-28
**Codebase:** Realms of Clickoria (~16,000 lines JS)
**Question:** What would it take to transform this clicker game into an ARPG?

---

## Executive Summary

The clicker game's event-driven, decoupled architecture makes it **surprisingly well-suited** for an ARPG conversion. Roughly 70-75% of the backend logic (combat math, skills, items, status effects, progression, economy) carries over with minimal changes. The major new work is in rendering (2D canvas/WebGL), spatial systems (movement, AI, collision), and art assets.

---

## Reusable Systems (~70-75% of backend)

| System | File(s) | Lines | Reuse % | Notes |
|--------|---------|-------|---------|-------|
| Core (event bus, state, loop) | `js/core/*` | ~140 | 100% | Already game-engine-grade. rAF + delta time is ARPG-ready |
| Player stats | `player.js` | ~420 | 95% | Stat computation, equipment bonuses, buff aggregation, caching |
| Skills engine | `skills.js`, `skill-effects.js`, `skill-passives.js` | ~1,670 | 85% | Cooldowns, energy costs, buff/debuff framework, active/passive slots |
| Status effects | `status-effects.js` | ~550 | 90% | Burn, poison, bleed, slow, freeze — already ARPG-grade |
| Items | `items.js`, `item-gen.js`, `item-crafting.js`, `item-effects.js` | ~1,370 | 90% | Equipment slots, procedural generation, affixes, legendaries, crafting |
| Combat math | Core of `combat.js` | ~200 | 90% | `applyDamageToMonster()` with armor pen, magic resist, shields, damage types |
| Monster types | `monster.js` + data | ~300 | 70% | Aggressive, swift, armored, shielded, regen — ARPG archetypes |
| Data layer | `js/data/*` | ~2,450 | 80% | 35 monsters, 22+ skills, 96+ items, affixes, legendaries |
| Economy | `economy.js` | ~220 | 95% | Gold, shop, pricing — works as-is |
| Progression | `progression.js` | ~190 | 95% | XP curves, leveling, milestones |
| Health/Energy | `health.js`, `energy.js` | ~400 | 90% | HP regen, damage, shields, energy management |
| Save/Load | `storage.js` | ~150 | 95% | localStorage persistence |
| Balance formulas | `balance.js` | ~360 | 80% | XP curves, stat scaling, damage reduction |
| Constants | `constants.js` | ~330 | 75% | Structure stays, numbers need retuning |

### Why It Works

The key architectural decisions that enable reuse:

1. **Event-driven communication** — Systems emit events (`combat:hit`, `combat:monsterKilled`). They don't know if the hit came from a click or a sword swing animation.
2. **Dependency injection** — Cross-system calls use `init(deps)` wiring. Easy to swap implementations.
3. **Clean separation** — Systems never import other systems or UI. UI never imports systems.
4. **Delta-time game loop** — Already frame-based, not click-based.
5. **Rich RPG data model** — Player state has equipment slots, skill slots, HP/energy, stats — standard ARPG character sheet.

---

## New Systems Required (~30% of total)

### 1. Rendering Engine (~3,000-5,000 lines)
- **Current:** DOM-based UI with CSS animations
- **Needed:** 2D canvas or WebGL renderer
  - Tile-based or free-roam map rendering
  - Sprite animation system (idle, walk, attack, hit, death × directions)
  - Camera system (follow player)
  - Layered rendering (ground → objects → entities → effects → HUD)
- **Recommendation:** Use **PixiJS** or **Phaser** to cut this by ~70%

### 2. Movement System (~1,000-2,000 lines)
- Player movement (WASD/virtual joystick)
- Collision detection (entity-entity, entity-environment)
- Physics for knockback, dashes
- Mobile virtual joystick controls

### 3. Monster AI (~1,500-3,000 lines)
- Pathfinding (A* or grid-based)
- Behavior trees / state machines (patrol → chase → attack → flee)
- Aggro ranges, attack ranges, leashing
- Group behavior (packs, support units)
- *Existing monster types provide archetypes to build on*

### 4. Spatial Combat (~1,500-2,500 lines)
- Replace click handler → attack animations with hitboxes
- Attack ranges, AoE shapes (cone, circle, line)
- Projectile system for ranged attacks/skills
- Hit detection (spatial queries, not DOM click events)
- Dodge/roll mechanics

### 5. Level Design System (~1,500-3,000 lines)
- Tile map format and loader (Tiled JSON or custom)
- Room/dungeon generation (procedural or hand-crafted)
- Zone transitions, portals, doors
- Environmental hazards, destructibles
- *7 existing zone themes provide design direction*

### 6. UI Overhaul (~2,000-3,000 lines)
- Replace full-screen pages → overlay HUD
- Floating enemy health bars (world space)
- Skill bar at bottom of gameplay view
- Minimap
- Inventory/shop as modal overlays
- Targeting indicators

### 7. Audio System (~500 lines + assets)
- Spatial audio tied to world position
- Attack/hit/death sounds
- Ambient zone music
- UI feedback sounds

---

## Art Assets (The Biggest Bottleneck)

This is separate from code but dominates the timeline:

| Asset Type | Scope | Notes |
|------------|-------|-------|
| Player character | 8-direction sprites × 5+ states = ~40+ frames | Idle, walk, attack, hit, death |
| 35 monsters | Each needs sprite sheet with animations | Could start with fewer, add over time |
| 7 zone tilesets | Ground, walls, decorations per theme | Whisperwood, Ember Caverns, etc. |
| Skill/spell VFX | Per-skill visual effects | Particle systems help |
| UI elements | HUD, buttons, frames, icons | Some existing CSS could inform style |
| Items | Equipment icons | Already have item data, need visuals |

**Art is ~80% of the calendar time if doing original work.**
Options: AI-generated sprites, asset packs, pixel art (simpler but stylish).

---

## Effort Breakdown

| Category | Code Effort | Calendar Time | Notes |
|----------|-------------|---------------|-------|
| Fork + setup | Low | 1 day | Copy systems/data/core/services |
| Rendering (with library) | Medium | 2-4 weeks | PixiJS/Phaser cuts this significantly |
| Movement + collision | Medium | 1-2 weeks | Standard 2D game problem |
| Spatial combat | Medium-High | 2-3 weeks | Hitboxes, ranges, projectiles |
| Monster AI | Medium-High | 2-3 weeks | Pathfinding + behavior |
| Level design system | Medium | 1-2 weeks | Tiled integration |
| UI overhaul | Medium | 2-3 weeks | New HUD, floating bars, modals |
| Art assets | Very High | 4-12 weeks | Biggest variable |
| Integration + polish | Medium | 2-4 weeks | Making it feel good |
| **Total** | | **~16-34 weeks** | As a side project |

---

## Recommended Approach

1. **Use a rendering library** (PixiJS or Phaser) — don't build a renderer from scratch
2. **Fork, don't rewrite** — Copy `js/systems/`, `js/data/`, `js/core/`, `js/services/` as-is
3. **Prototype first** — Single room, player movement, one monster, existing combat math
4. **The event bus is the bridge** — `combat:hit` doesn't care if it came from a click or a sword animation
5. **Art can come last** — Use colored rectangles or free assets initially
6. **Keep vanilla JS** — The existing architecture proves you don't need a framework

---

## Verdict

**Feasibility: HIGH.** The clicker game's backend is essentially an ARPG engine wearing a different UI. The decoupled, event-driven architecture was (intentionally or not) built for exactly this kind of transformation. The real investment is in rendering, spatial systems, and art — not in game mechanics, which are already done.

*"Your backend is already an ARPG engine wearing a clicker costume."*

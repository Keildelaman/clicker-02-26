# Plan: Instant Monster Transitions & Overkill Carry

## Problem
When a monster dies, there's an **800ms dead zone** (300ms death animation + 500ms spawn delay) where clicks do nothing. For players in a flow state spam-clicking, this feels unresponsive. Additionally, damage that exceeds a monster's remaining HP is wasted instead of carrying to the next target.

## Goal
1. **Instant transitions** - Next monster appears immediately when the current one dies; no gap where clicks are ignored
2. **Overkill carry** - Excess damage from the killing blow applies to the next monster automatically

## Design Decisions
- **Bosses keep current behavior** - Boss kills are special moments; they retain the death animation + spawn delay for ceremony
- **Death feedback becomes non-blocking** - A brief visual overlay (death emoji particle) plays while the new monster is already active underneath
- **Overkill works for all damage sources** - Clicks, instant skills, and channel skills all carry overflow damage (not just Chain Lightning)
- **Overkill skips armor/shield on carry** - Carried damage applies as raw HP damage to keep the flow feeling rewarding

---

## Changes by File

### 1. `js/data/constants.js`
- Add `OVERKILL_CARRY_PERCENT = 100` constant (percentage of overkill that carries over; 100% = full carry)
- Keep existing `DEATH_ANIMATION_DURATION` and `MONSTER_SPAWN_DELAY` (used only for boss kills now)

### 2. `js/systems/combat.js` (core changes)

**a) Track overkill in `applyDamageToMonster()`:**
- After reducing monster HP to 0, calculate `overkill = abs(monster.currentHealth)` before clamping to 0
- Store overkill on the monster instance (`monster.overkillAmount`) so `killMonster` can read it

**b) Modify `killMonster()`:**
- Calculate overkill carry: `state.overkillCarry = Math.floor(monster.overkillAmount * OVERKILL_CARRY_PERCENT / 100)`
- For **non-boss** kills: skip the dying state entirely. Instead:
  - Set `state.combatState = 'spawning'` (brief transitional state)
  - Emit `combat:monsterKilled` (for rewards/loot)
  - Emit `combat:requestImmediateSpawn` (new event for monster.js)
- For **boss** kills: keep existing behavior (dying timer + spawn delay)

**c) Modify `onMonsterSpawned()`:**
- Generalize overkill carry to apply from any source (not just Chain Lightning)
- Remove the `setTimeout(0)` hack - apply overkill synchronously since the monster is fully initialized by the time `combat:monsterSpawned` fires
- Skip overkill carry for bosses

**d) Modify `update(dt)`:**
- The `dying` state timer path remains but only triggers for boss kills now

### 3. `js/systems/monster.js`

**a) Add `spawnImmediate()` function:**
- Cancels any pending spawn timer
- Calls `spawnNext()` directly with no delay
- Used when a non-boss monster dies

**b) Listen to `combat:requestImmediateSpawn`:**
- Wire up the new event to call `spawnImmediate()`

**c) Keep `scheduleSpawn()` as-is:**
- Still used for: boss `combat:dyingComplete`, `player:respawned`, `zone:changed`

### 4. `js/ui/combat-ui.js`

**a) Modify `onMonsterKilled()`:**
- Instead of just adding `monster-area--dead` class and waiting, spawn a floating death emoji element that fades out independently
- This "death particle" animates on top of whatever comes next

**b) Add `showDeathParticle(emoji)` function:**
- Creates a positioned element with the death emoji
- Applies a CSS animation (fade + float up) over ~400ms
- Self-removes after animation completes
- Does NOT block or affect the monster area's interactive state

**c) Modify `onMonsterSpawned()`:**
- Works as before but should handle being called immediately after a kill (no class conflicts)
- Ensure `monster-area--dead` class is removed even if it was just added

### 5. `js/css/animations.css`
- Add `@keyframes deathParticleFade` for the non-blocking death emoji animation (float up + fade out, ~400ms)

### 6. `js/css/components.css`
- Add `.death-particle` styles: absolute positioned, pointer-events: none, z-index above monster area

---

## Event Flow (After Changes)

### Non-boss kill:
```
Click deals lethal damage
  -> monster.currentHealth goes below 0
  -> overkill calculated and stored
  -> killMonster() called
    -> state.overkillCarry set
    -> combat:monsterKilled emitted (rewards, loot, stats)
    -> combat:requestImmediateSpawn emitted
      -> monster.spawnImmediate() called
        -> spawnNext() creates new monster
        -> state.combatState = 'active'
        -> combat:monsterSpawned emitted
          -> UI shows new monster (with death particle overlay from old one)
          -> overkillCarry applied to new monster's HP
```

### Boss kill (unchanged):
```
Click deals lethal damage
  -> killMonster() called
    -> state.combatState = 'dying'
    -> dyingTimer = 300ms
    -> combat:monsterKilled emitted
  -> update() counts down dyingTimer
    -> combat:dyingComplete emitted
      -> scheduleSpawn() with 500ms delay
        -> spawnNext()
```

---

## Edge Cases
- **Overkill chain**: If overkill carry kills the NEXT monster too, it should chain (apply recursively). Cap at 3 chains max to prevent infinite loops with very high damage.
- **Aggressive monster punishment**: If new monster is aggressive and in attack phase on spawn, overkill carry should not trigger the punishment mechanic (carry damage is not a "click").
- **Boss as next spawn**: Overkill carry skips bosses (already handled).
- **Zone change during transition**: `scheduleSpawn` already handles zone changes; immediate spawn only fires for regular kills.
- **Player death during transition**: If player dies between kill and spawn, the respawn flow takes over normally.

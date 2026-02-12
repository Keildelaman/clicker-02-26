# Skill System v2 — Complete Specification

> **Status:** Implementation-Ready Draft (all stats defined, pending playtesting)
> **Replaces:** `docs/systems/skill.system.md`, `docs/data/skills.data.md`
> **Date:** 2026-02-11

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [Energy System (v2)](#2-energy-system-v2)
3. [Skill Points & Progression](#3-skill-points--progression)
4. [Skill Slot Structure](#4-skill-slot-structure)
5. [Skill Mechanic Types](#5-skill-mechanic-types)
6. [Skill Interaction Rules](#6-skill-interaction-rules)
7. [Skill Unlock Schedule](#7-skill-unlock-schedule)
8. [Active Skills (15)](#8-active-skills)
9. [Passive Skills (10)](#9-passive-skills)
10. [Example Builds](#10-example-builds)
11. [Respec System](#11-respec-system)
12. [Balance Framework](#12-balance-framework)
13. [Skill Mutations (Future — v1.1)](#13-skill-mutations-future--v11)
14. [UI Requirements](#14-ui-requirements)
15. [Architecture & Data Structures](#15-architecture--data-structures)
16. [Migration from v1](#16-migration-from-v1)

---

## 1. Core Philosophy

1. **Skills transform HOW you play**, not just add numbers.
2. **Clicking is always the backbone.** Skills amplify clicks. Even the mage build clicks between cooldowns.
3. **Skills must feel powerful.** Considering cooldowns + energy costs, burst windows should be dramatic (8-20x a normal click), not marginal.
4. **Players discover builds organically.** No forced paths. Natural buff stacking, no hardcoded combo chains.
5. **Easily extensible.** New skill = data definition + one effect handler. Existing passives automatically interact.
6. **Energy creates decisions.** Spending energy for a skill means not having it for another. Some passives tie stats to energy level, creating tension.

---

## 2. Energy System (v2)

Energy fuels active skills. How you generate, spend, and value energy defines your build.

### Constants

| Constant | Value | Notes |
|----------|-------|-------|
| `MAX_ENERGY` | 100 | Unchanged |
| `ENERGY_PER_CLICK` | 3 | Reduced from doc v1 (was 5) |
| `ENERGY_ON_KILL` | 10 | Reduced from doc v1 (was 15) |
| `ENERGY_ON_BOSS_KILL` | 25 | Reduced from doc v1 (was 50) |
| `ENERGY_REGEN_PER_SECOND` | 1 | Passive, always active |
| `ENERGY_GAIN_COOLDOWN` | 200ms | Max 5 energy-granting clicks/sec |

### Energy Income Profile (base, no passives)

| Click Rate | Click Energy | Regen | Kill Bonus (~1/10s) | Total |
|------------|-------------|-------|---------------------|-------|
| 2/sec (slow) | 6/sec | 1/sec | ~1/sec | ~8/sec |
| 2.5/sec (casual) | 7.5/sec | 1/sec | ~1/sec | ~9.5/sec |
| 3/sec (fast) | 9/sec | 1/sec | ~1/sec | ~11/sec |
| 5/sec (max) | 15/sec | 1/sec | ~1/sec | ~17/sec |

### Design Intent

- **2 skills per rotation:** Easy to sustain (~50-60 energy / 10s vs ~95 income)
- **3 skills per rotation:** Tight (~90 energy / 10s vs ~95 income)
- **4 skills per rotation:** Requires energy passives/skills (~120 energy / 10s vs ~95 income = deficit)

This creates meaningful build differentiation based on energy management.

---

## 3. Skill Points & Progression

### Earning Rate

| Progression | SP Rate | SP at Lv 50 | SP at Lv 75 | SP at Lv 100 |
|-------------|---------|-------------|-------------|--------------|
| First run | 1 SP every 3 levels | 16 | 25 | 33 |
| Ascension 1+ | TBD (faster rate) | TBD | TBD | TBD |

> Ascension SP rates are **out of scope** for v1.0. Design the system knowing they'll increase later.

First SP earned at Level 3, then 6, 9, 12, 15, ... 99.

### SP Costs

| Action | Cost |
|--------|------|
| Unlock Power Strike | FREE (0 SP) |
| Unlock any other skill | 1 SP |
| Upgrade skill (per level, Lv2-5) | 1 SP each |
| **Full max one skill** | **1 unlock + 4 upgrades = 5 SP** (Power Strike: 4 SP) |

### SP Budget Analysis (First Run, ~33 SP)

| Strategy | Unlocks | Upgrades | SP Used |
|----------|---------|----------|---------|
| Balanced: 7 skills, moderate upgrades | 6 SP | 4 skills to Lv4 + 3 skills to Lv2 = 15 SP | 21 SP |
| Deep: 7 skills, max 3 favorites | 6 SP | 3 skills to Lv5 + 4 skills to Lv1 = 12 SP | 18 SP |
| Wide: 12 skills, minimal upgrades | 11 SP | 7 skills to Lv2 = 7 SP | 18 SP |

All leave 12-15 SP for additional unlocks or upgrades. Player can't max everything — must specialize.

---

## 4. Skill Slot Structure

| Slot Type | Count | Selection |
|-----------|-------|-----------|
| Active | 4 | From 15 active skills |
| Passive | 3 | From 10 passive skills |

Swapping skills: free, anytime (outside combat only — when on combat screen, swapping triggers a 50% cooldown penalty on the swapped-in skill's first use).

> **Future (Ascension):** Additional slots (+1 active or +1 passive) as prestige rewards. Not in v1.0.

---

## 5. Skill Mechanic Types

### Active Skill Types

| Type | Behavior | Examples |
|------|----------|---------|
| **Next-Click (Hit Modifier)** | Empowers the PRIMARY hit of your next physical click. Consumed on click. | Power Strike, Execute, Shatter |
| **Next-Click (Click Modifier)** | Affects the entire click action for N clicks (all hits including Flurry bonus). Counter decrements per CLICK, not per hit. | Precision |
| **Buff (Timed)** | Enhances all attacks/clicks for a duration. Timer-based. | Flurry, Adrenaline Rush |
| **Toggle** | Always active while ON, drains energy continuously. No cooldown. Toggle OFF resets state. | Momentum |
| **Channel** | Hold skill button to charge. Cannot click during channel. Auto-fires on release. | Charge Up |
| **Instant** | Fires immediately on use. Deals damage or grants resource. Independent of clicks. | Barrage, Arcane Bolt, Chain Lightning, Energy Surge, Shield Bash |
| **HP-Cost** | Costs HP instead of energy. | Life Tap |
| **Cooldown-Utility** | Affects other skills. No damage. | Overcharge |

### Buff Stacking Rules

- Multiple buffs can be active simultaneously (natural buff stacking)
- Damage bonuses stack **multiplicatively**: Power Strike 1000% × Combo Artist +30% × Berserker +20% = 1000% × 1.3 × 1.2 = 1560%
- Same buff cannot stack with itself (refreshes duration instead)

---

## 6. Skill Interaction Rules

These rules are critical for implementation. Read carefully.

### Rule 1: Hit Modifiers vs Click Modifiers

**Hit Modifiers** (Power Strike, Execute, Shatter): Apply ONLY to the primary hit of the next click. If Flurry is active (2 hits per click), the primary hit gets the modifier, the bonus hit deals normal damage. Consumed after one click.

**Click Modifiers** (Precision): Apply to the ENTIRE click, including all bonus hits from Flurry. Counter decrements per click, not per hit.

### Rule 2: Multiple Hit Modifiers Stack

If both Power Strike and Execute are buffered: the next click's primary hit receives BOTH multipliers (multiplicatively). Both are consumed.

Example: Power Strike Lv1 (1000%) + Execute Lv1 on low-HP monster (800%) = primary hit at 1000% × 8 = 8000%? No — they don't multiply each other's multiplier. Instead: base damage × max(Power Strike mult, Execute mult) + min(the other). Actually this gets complex.

**Simplified rule:** Only ONE hit modifier can be active at a time. Activating a new one replaces the previous. Last activated wins. This prevents exploits and keeps the system simple.

### Rule 3: Charge Up Is Independent

Charge Up auto-fires on button release. This auto-fire:
- Does NOT consume or interact with hit modifiers (Power Strike, etc.)
- Does NOT consume Precision charges
- CAN crit at normal crit rate
- DOES benefit from passive damage bonuses (Berserker, Combo Artist buff, Click Mastery stacks)
- After Charge Up fires, any queued hit modifier (Power Strike) applies to the next regular click

### Rule 4: Instant Skills Are Independent

Barrage, Arcane Bolt, Chain Lightning, Shield Bash deal damage independently of clicks:
- Do NOT consume hit modifiers
- Do NOT consume Precision charges
- Each hit CAN crit at normal crit rate
- DO benefit from passive damage bonuses and active buff bonuses (Combo Artist, Berserker, etc.)

### Rule 5: Cooldown Floor

No skill's effective cooldown can go below **50% of its base cooldown**, regardless of CDR sources (Spell Weaver, Overcharge, item CDR).

| Skill | Base CD | Minimum CD |
|-------|---------|-----------|
| Power Strike | 10s | 5s |
| Barrage | 8s | 4s |
| Arcane Bolt | 6s | 3s |
| Overcharge | 16s | 8s |
| etc. | | 50% of base |

### Rule 6: Toggle Skills

Momentum (only toggle skill in v1.0):
- No cooldown. Toggle ON/OFF freely.
- While ON: drains energy per second. If energy hits 0, auto-toggles OFF.
- Toggling OFF resets all stacks.
- Toggling OFF triggers Residual Energy passive (if equipped).
- Toggle state is a separate UI indicator (not a cooldown).

---

## 7. Skill Unlock Schedule

Skills become available to unlock at specific player levels. Until that level, the skill is hidden in the skills screen.

### Active Skills (15)

| Level | Skill | Category | Why Here |
|-------|-------|----------|----------|
| 1 | Power Strike | Power | Starter. Simple "hit harder" concept. |
| 3 | Barrage | Speed | First choice. Instant burst, easy to grasp. |
| 8 | Precision | Crit | Introduces crits as a concept. |
| 12 | Execute | Crit | Introduces conditional timing. |
| 14 | Energy Surge | Utility | Universal energy tool once energy costs felt. |
| 16 | Arcane Bolt | Mage | First "auto-damage" spell. New mechanic. |
| 20 | Shield Bash | Utility | Defensive option once aggressive monsters appear. |
| 22 | Flurry | Speed | Multi-hit mechanic. Builds on speed identity. |
| 30 | Adrenaline Rush | Crit | Complex energy-crit interaction. Requires understanding. |
| 36 | Chain Lightning | Mage | Overkill chaining. Farming reward. |
| 39 | Charge Up | Power | Bold channel mechanic. Late unlock = experienced player. |
| 45 | Momentum | Speed | Toggle mechanic. Requires energy management skill. |
| 52 | Overcharge | Mage | CDR engine. Build-completing for mage. |
| 60 | Shatter | Power | %HP damage. Endgame specialization. |
| 65 | Life Tap | Utility | HP→Energy risk/reward. Most advanced utility. |

### Passive Skills (10)

| Level | Skill | Category | Why Here |
|-------|-------|----------|----------|
| 5 | Click Mastery | Speed | Natural first passive. "Click faster = stronger." |
| 10 | Vampiric Strikes | Sustain | Early sustain option once taking damage. |
| 18 | Critical Flow | Crit | Introduces energy-from-crits loop. |
| 24 | Heavy Handed | Power | Trade-off passive. Requires understanding energy costs. |
| 26 | Combo Artist | Combo | Rewards using multiple skills. Needs 3+ active skills. |
| 28 | Berserker | Power/Crit | Risk/reward. Player comfortable with HP management. |
| 33 | Efficient Casting | Mage | Energy cost reduction. Meaningful once using 3+ skills. |
| 42 | Spell Weaver | Mage | CDR loop. Core mage passive. Complex interaction. |
| 48 | Residual Energy | Energy | Buff expiry → energy. Niche but powerful. |
| 52 | Focused Mind | Power | Idle energy regen. Enables patient playstyles. |

### Progression Summary

| Level Range | New Skills Available | Running Total |
|-------------|---------------------|---------------|
| 1-10 | 5 (3 active + 2 passive) | 5 |
| 11-20 | 5 (4 active + 1 passive) | 10 |
| 21-30 | 5 (2 active + 3 passive) | 15 |
| 31-45 | 5 (4 active + 1 passive) | 20 |
| 46-65 | 5 (2 active + 3 passive) | 25 |

~2 new skills every 5 levels. Steady drip throughout the game.

---

## 8. Active Skills

All damage multipliers are percentage of player's attack stat (ATK) unless noted.
All values are **initial balance targets** — subject to playtesting adjustment.

---

### 8.1 Power Strike

| | |
|---|---|
| **Category** | Power |
| **Mechanic** | Next-Click (Hit Modifier) |
| **Tags** | `power`, `attack` |
| **Unlock** | Level 1 — FREE (0 SP) |
| **Description** | Empowers your next click to deal massive damage. |

| Level | Damage | Cooldown | Energy | Upgrade Cost |
|-------|--------|----------|--------|-------------|
| 1 | 1000% | 10s | 35 | — |
| 2 | 1200% | 10s | 35 | 1 SP |
| 3 | 1500% | 9s | 33 | 1 SP |
| 4 | 1800% | 9s | 33 | 1 SP |
| 5 | 2200% | 8s | 30 | 1 SP |

**Notes:**
- Buff icon appears above skill bar when active. Persists until player clicks.
- If Precision is also active, the Power Strike click is a guaranteed crit.
- Crit Power Strike Lv5: 2200% × 2.0 = 4400% ATK. That's 44× a normal click.

---

### 8.2 Barrage

| | |
|---|---|
| **Category** | Speed |
| **Mechanic** | Instant (multi-hit) |
| **Tags** | `speed`, `attack` |
| **Unlock** | Level 3 — 1 SP |
| **Description** | Unleash a rapid volley of hits instantly. Each hit can crit independently. |

| Level | Hits | Damage/Hit | Total | Cooldown | Energy | Upgrade |
|-------|------|-----------|-------|----------|--------|---------|
| 1 | 5 | 60% | 300% | 8s | 25 | — |
| 2 | 6 | 60% | 360% | 8s | 25 | 1 SP |
| 3 | 7 | 65% | 455% | 7s | 23 | 1 SP |
| 4 | 8 | 65% | 520% | 7s | 23 | 1 SP |
| 5 | 10 | 70% | 700% | 6s | 20 | 1 SP |

**Notes:**
- Fires independently of clicks. Does NOT consume hit modifiers.
- Each hit rolls crit independently (at 5% base, expect ~0-1 crits per Barrage).
- Benefits from passive damage bonuses (Combo Artist buff, Berserker, etc.).
- Visual: rapid damage numbers cascade from monster.

---

### 8.3 Precision

| | |
|---|---|
| **Category** | Crit |
| **Mechanic** | Next-Click (Click Modifier) — N charges |
| **Tags** | `crit`, `buff` |
| **Unlock** | Level 8 — 1 SP |
| **Description** | Your next N clicks are guaranteed critical hits. |

| Level | Crit Clicks | Cooldown | Energy | Upgrade |
|-------|------------|----------|--------|---------|
| 1 | 3 | 12s | 25 | — |
| 2 | 4 | 12s | 25 | 1 SP |
| 3 | 5 | 11s | 23 | 1 SP |
| 4 | 6 | 10s | 23 | 1 SP |
| 5 | 8 | 9s | 20 | 1 SP |

**Notes:**
- Click modifier: applies to ALL hits from the click (including Flurry bonus hits).
- Counter decrements per CLICK, not per hit. Flurry click = 1 charge consumed, 2-3 hits all crit.
- Does NOT apply to Charge Up auto-fire or Instant skills (Barrage, Arcane Bolt).
- Charge counter visible as a number badge on the skill button.

---

### 8.4 Execute

| | |
|---|---|
| **Category** | Crit |
| **Mechanic** | Next-Click (Hit Modifier), conditional |
| **Tags** | `crit`, `attack` |
| **Unlock** | Level 12 — 1 SP |
| **Description** | Empowers next click. Devastating if monster is wounded, weak if used too early. |

| Level | HP Threshold | Strong Mult | Weak Mult | CD | Energy | Upgrade |
|-------|-------------|------------|-----------|-----|--------|---------|
| 1 | < 30% | 800% | 150% | 8s | 20 | — |
| 2 | < 33% | 1000% | 150% | 8s | 20 | 1 SP |
| 3 | < 35% | 1200% | 150% | 7s | 18 | 1 SP |
| 4 | < 38% | 1500% | 180% | 7s | 18 | 1 SP |
| 5 | < 40% | 1800% | 200% | 6s | 15 | 1 SP |

**Notes:**
- Threshold checked when the click lands (not when skill is activated).
- Replaces any other active hit modifier (only one hit modifier at a time).
- Short cooldown rewards learning monster HP breakpoints.
- UI: monster HP bar shows a threshold marker when Execute is equipped.

---

### 8.5 Energy Surge

| | |
|---|---|
| **Category** | Utility |
| **Mechanic** | Instant (resource generation) |
| **Tags** | `utility`, `energy` |
| **Unlock** | Level 14 — 1 SP |
| **Description** | Instantly restore a chunk of energy. |

| Level | Energy Gained | Cooldown | Upgrade |
|-------|-------------|----------|---------|
| 1 | 35 | 22s | — |
| 2 | 40 | 20s | 1 SP |
| 3 | 45 | 18s | 1 SP |
| 4 | 55 | 16s | 1 SP |
| 5 | 65 | 14s | 1 SP |

**Notes:**
- No energy cost. This skill generates energy, it doesn't spend it.
- Capped at MAX_ENERGY (100). Excess is wasted.
- Key combo: use at high energy before Adrenaline Rush to maximize crit window.

---

### 8.6 Arcane Bolt

| | |
|---|---|
| **Category** | Mage |
| **Mechanic** | Instant (direct damage) |
| **Tags** | `spell`, `attack` |
| **Unlock** | Level 16 — 1 SP |
| **Description** | Fire a bolt of arcane energy at the monster. Scales with ATK. |

| Level | Damage | Cooldown | Energy | Upgrade |
|-------|--------|----------|--------|---------|
| 1 | 400% | 6s | 20 | — |
| 2 | 500% | 6s | 20 | 1 SP |
| 3 | 650% | 5s | 18 | 1 SP |
| 4 | 800% | 5s | 18 | 1 SP |
| 5 | 1000% | 4s | 15 | 1 SP |

**Notes:**
- Fires on button press, no click needed. Damage applied immediately.
- Shortest base cooldown of any damage skill. Bread-and-butter for mage builds.
- Can crit at normal crit rate.
- Benefits from all passive damage bonuses.

---

### 8.7 Shield Bash

| | |
|---|---|
| **Category** | Utility |
| **Mechanic** | Instant (damage + shield) |
| **Tags** | `utility`, `attack`, `defensive` |
| **Unlock** | Level 20 — 1 SP |
| **Description** | Slam the monster for damage and gain a temporary shield. |

| Level | Damage | Shield (% Max HP) | Shield Duration | CD | Energy | Upgrade |
|-------|--------|-------------------|----------------|-----|--------|---------|
| 1 | 200% | 12% | 6s | 15s | 30 | — |
| 2 | 250% | 14% | 7s | 14s | 30 | 1 SP |
| 3 | 300% | 16% | 8s | 13s | 28 | 1 SP |
| 4 | 350% | 18% | 9s | 12s | 26 | 1 SP |
| 5 | 450% | 22% | 10s | 10s | 25 | 1 SP |

**Notes:**
- Shield absorbs damage before HP. Does not stack with itself (refreshes).
- At Level 50 (590 max HP), Lv1 shield = 70 HP. Absorbs ~1 aggressive monster hit.
- Shield expiry triggers Residual Energy passive.

---

### 8.8 Flurry

| | |
|---|---|
| **Category** | Speed |
| **Mechanic** | Buff (timed, click modifier) |
| **Tags** | `speed`, `buff` |
| **Unlock** | Level 22 — 1 SP |
| **Description** | For a duration, every click strikes multiple times. |

| Level | Hits/Click | Duration | Cooldown | Energy | Upgrade |
|-------|-----------|----------|----------|--------|---------|
| 1 | 2 | 4s | 14s | 30 | — |
| 2 | 2 | 5s | 13s | 30 | 1 SP |
| 3 | 2 | 5s | 12s | 28 | 1 SP |
| 4 | 3 | 5s | 12s | 28 | 1 SP |
| 5 | 3 | 6s | 10s | 25 | 1 SP |

**Notes:**
- All hits deal 100% ATK damage. Extra hits are BONUS, not split.
- Click modifiers (Precision crits) apply to ALL hits. Hit modifiers (Power Strike) apply only to the primary hit.
- Lv5 during 6s at 3 clicks/sec: 18 hits × 3 = 54 total hits. Devastating.
- Buff expiry triggers Residual Energy passive.

---

### 8.9 Adrenaline Rush

| | |
|---|---|
| **Category** | Crit |
| **Mechanic** | Buff (timed, self-draining) |
| **Tags** | `crit`, `buff` |
| **Unlock** | Level 30 — 1 SP |
| **Description** | Your crit chance equals your current energy%. Energy drains rapidly. A closing window of incredible power. |

| Level | Duration | Drain Rate | Cooldown | Upgrade |
|-------|----------|-----------|----------|---------|
| 1 | 4s | 12/sec | 20s | — |
| 2 | 5s | 11/sec | 19s | 1 SP |
| 3 | 5s | 10/sec | 18s | 1 SP |
| 4 | 6s | 9/sec | 17s | 1 SP |
| 5 | 7s | 8/sec | 15s | 1 SP |

**Notes:**
- **No energy cost to activate.** Instead, drains energy during the effect.
- Crit chance = current energy% each moment (100 energy = 100% crit, 50 = 50%).
- With Critical Flow passive: crits restore energy, partially fighting the drain. At high enough crit rate, this creates a self-sustaining loop.
- Lv5 starting at 100 energy: 7s duration, 8/sec drain. Average crit ≈ 72%. With Critical Flow Lv5 (15 energy/crit): at 2.5 clicks/sec with 72% crit = 1.8 crits/sec × 15 = 27 energy/sec restored vs 8 drained. **Self-sustaining!** This is the dream crit build.
- Buff expiry triggers Residual Energy passive.

---

### 8.10 Chain Lightning

| | |
|---|---|
| **Category** | Mage |
| **Mechanic** | Instant (direct damage, chaining) |
| **Tags** | `spell`, `attack` |
| **Unlock** | Level 36 — 1 SP |
| **Description** | Blast the monster with lightning. If it dies, excess damage chains to the next spawn. |

| Level | Damage | Overkill Carry | Cooldown | Energy | Upgrade |
|-------|--------|---------------|----------|--------|---------|
| 1 | 600% | 40% | 12s | 30 | — |
| 2 | 750% | 45% | 11s | 30 | 1 SP |
| 3 | 900% | 50% | 10s | 28 | 1 SP |
| 4 | 1100% | 55% | 9s | 26 | 1 SP |
| 5 | 1400% | 60% | 8s | 25 | 1 SP |

**Notes:**
- Overkill carry: if damage kills the monster, `(damage - remainingHP) × carryPercent` applied to next monster as instant damage on spawn.
- Carry damage can chain again if it kills the next monster too (rare but satisfying).
- Less effective against bosses (won't overkill). Primarily a farming/grinding skill.
- Can crit. Crit overkill = bigger chain.

---

### 8.11 Charge Up

| | |
|---|---|
| **Category** | Power |
| **Mechanic** | Channel |
| **Tags** | `power`, `attack`, `channel` |
| **Unlock** | Level 39 — 1 SP |
| **Description** | Hold to charge. Release to unleash a devastating strike. Longer charge = more damage. |

| Level | Min Mult (min charge) | Max Mult (full charge) | Channel Range | CD | Energy | Upgrade |
|-------|----------------------|----------------------|--------------|-----|--------|---------|
| 1 | 500% | 1500% | 1-3s | 16s | 40 | — |
| 2 | 600% | 1800% | 1-3s | 15s | 40 | 1 SP |
| 3 | 700% | 2200% | 1-3s | 14s | 38 | 1 SP |
| 4 | 900% | 2800% | 0.8-2.5s | 13s | 35 | 1 SP |
| 5 | 1000% | 3500% | 0.8-2.5s | 12s | 33 | 1 SP |

**Notes:**
- Damage scales **linearly** between min and max based on channel duration.
- Player HOLDS the skill button. Cannot click monster area during channel.
- Release fires the empowered hit automatically at the current monster. No additional click needed.
- Channel does NOT consume hit modifiers or Precision charges (it's an auto-fire, not a click).
- Focused Mind passive generates energy during channel (not clicking).
- Lv5 full charge crit: 3500% × 2.0 = 7000% ATK. 70× a normal click. Boss-melting.
- Visual: skill button shows charging animation with intensity scaling. Screen tint/glow at max charge.

---

### 8.12 Momentum

| | |
|---|---|
| **Category** | Speed |
| **Mechanic** | Toggle |
| **Tags** | `speed`, `buff`, `toggle` |
| **Unlock** | Level 45 — 1 SP |
| **Description** | Toggle ON to build stacking damage from consecutive clicks. Drains energy while active. |

| Level | Dmg/Stack | Max Stacks | Max Bonus | Decay Timer | Drain/sec | Upgrade |
|-------|----------|-----------|-----------|-------------|----------|---------|
| 1 | +6% | 8 | +48% | 1.5s | 2 | — |
| 2 | +7% | 9 | +63% | 1.6s | 2 | 1 SP |
| 3 | +8% | 10 | +80% | 1.8s | 1.8 | 1 SP |
| 4 | +9% | 11 | +99% | 1.9s | 1.5 | 1 SP |
| 5 | +10% | 12 | +120% | 2.0s | 1.2 | 1 SP |

**Notes:**
- Click within **0.8 seconds** of previous click to gain a stack. If no click within decay timer, lose ALL stacks.
- Toggling OFF resets stacks and triggers Residual Energy passive.
- If energy reaches 0, auto-toggles OFF (stacks lost).
- Efficient Casting passive reduces drain rate (e.g., -35% at Lv5: 2/sec → 1.3/sec).
- Stack count shown as number on skill button. Pulsing glow effect at max stacks.
- At max stacks Lv5: +120% damage on every click. Combined with Click Mastery (+96%): 1.0 × 2.2 × 1.96 = 4.3× base click damage. Fast clicking becomes devastating.

---

### 8.13 Overcharge

| | |
|---|---|
| **Category** | Mage |
| **Mechanic** | Instant (cooldown utility) |
| **Tags** | `spell`, `utility` |
| **Unlock** | Level 52 — 1 SP |
| **Description** | Surge with arcane power, reducing all other skill cooldowns. |

| Level | CDR Amount | Cooldown | Energy | Upgrade |
|-------|-----------|----------|--------|---------|
| 1 | 3s | 16s | 25 | — |
| 2 | 3.5s | 15s | 25 | 1 SP |
| 3 | 4s | 14s | 23 | 1 SP |
| 4 | 4.5s | 13s | 21 | 1 SP |
| 5 | 5s | 12s | 20 | 1 SP |

**Notes:**
- Reduces cooldown of ALL OTHER equipped active skills by CDR amount.
- Cannot reduce below 50% of base cooldown (cooldown floor).
- With Spell Weaver passive: using Overcharge ALSO triggers Spell Weaver (-0.8s to -1.5s on all others). Combined CDR = 3.8s to 6.5s per use.
- This is the mage build engine. Doesn't deal damage itself but enables near-permanent uptime of other skills.

---

### 8.14 Shatter

| | |
|---|---|
| **Category** | Power |
| **Mechanic** | Next-Click (Hit Modifier), %HP-based |
| **Tags** | `power`, `attack` |
| **Unlock** | Level 60 — 1 SP |
| **Description** | Next click deals bonus damage equal to a percentage of the monster's maximum HP. |

| Level | % Monster Max HP | Cooldown | Energy | Upgrade |
|-------|-----------------|----------|--------|---------|
| 1 | 8% | 12s | 30 | — |
| 2 | 10% | 12s | 30 | 1 SP |
| 3 | 13% | 11s | 28 | 1 SP |
| 4 | 16% | 10s | 26 | 1 SP |
| 5 | 20% | 9s | 25 | 1 SP |

**Notes:**
- Next click deals normal ATK damage PLUS flat damage = `monster.maxHP × percent`.
- The %HP portion **ignores armor** (flat damage, not reduced by damage reduction).
- Anti-tank skill: devastating against bosses and armored enemies, less useful vs weak monsters.
- Replaces any other active hit modifier (only one at a time).
- Lv5 vs Boss Xal'theron (400,000 HP): 80,000 flat damage per use. On 9s CD, that's 8,888 DPS from %HP alone.
- Lv5 vs Zone 1 sprite (85 HP): 17 flat damage. Not worth a slot here.

---

### 8.15 Life Tap

| | |
|---|---|
| **Category** | Utility |
| **Mechanic** | Instant (HP → Energy conversion) |
| **Tags** | `utility`, `energy` |
| **Unlock** | Level 65 — 1 SP |
| **Description** | Sacrifice HP for energy. Costs percentage of CURRENT HP (can never kill you). |

| Level | HP Cost (% current) | Energy Gained | Cooldown | Upgrade |
|-------|-------------------|-------------|----------|---------|
| 1 | 20% | 25 | 12s | — |
| 2 | 20% | 30 | 11s | 1 SP |
| 3 | 18% | 35 | 10s | 1 SP |
| 4 | 15% | 40 | 9s | 1 SP |
| 5 | 12% | 50 | 8s | 1 SP |

**Notes:**
- **No energy cost.** This is an alternative energy source.
- % of CURRENT HP, not max. At 500 HP, costs 100 HP. At 100 HP, costs 20 HP. Self-limiting.
- Berserker synergy: Life Tap → lower HP → Berserker activates → more damage.
- Vampiric Strikes synergy: click damage heals back the HP cost.
- At Lv5: 12% current HP for 50 energy. At full HP (590 at Lv50): costs 71 HP, gains 50 energy = 70% of a full bar.

---

## 9. Passive Skills

Passives are always active when equipped. No energy cost, no cooldown. They fundamentally alter game mechanics.

---

### 9.1 Click Mastery

| | |
|---|---|
| **Category** | Speed |
| **Tags** | `speed` |
| **Unlock** | Level 5 — 1 SP |
| **Description** | Consecutive fast clicks build stacking damage. |

| Level | Damage/Stack | Max Stacks | Click Window | Max Bonus | Upgrade |
|-------|-------------|-----------|-------------|-----------|---------|
| 1 | +4% | 8 | 0.50s | +32% | — |
| 2 | +5% | 9 | 0.55s | +45% | 1 SP |
| 3 | +6% | 10 | 0.60s | +60% | 1 SP |
| 4 | +7% | 11 | 0.65s | +77% | 1 SP |
| 5 | +8% | 12 | 0.70s | +96% | 1 SP |

**Mechanic:** Each click within `window` of the previous click adds a stack. If no click within the window, stacks reset to 0. Stack count shown as a small indicator near the monster area.

**Interaction Notes:**
- At 2.5 clicks/sec (0.4s gap): easily maintains max stacks at all levels.
- At 2.0 clicks/sec (0.5s gap): just barely maintains at Lv1, comfortable at Lv3+.
- Affects click damage only. Does not affect Instant skill damage (Arcane Bolt, etc.).
- Stacks apply to ALL hits in a click (including Flurry bonus hits).

---

### 9.2 Vampiric Strikes

| | |
|---|---|
| **Category** | Sustain |
| **Tags** | `sustain` |
| **Unlock** | Level 10 — 1 SP |
| **Description** | Your clicks heal you for a percentage of damage dealt. |

| Level | Heal % of Click Damage | Upgrade |
|-------|----------------------|---------|
| 1 | 3% | — |
| 2 | 4% | 1 SP |
| 3 | 5% | 1 SP |
| 4 | 7% | 1 SP |
| 5 | 10% | 1 SP |

**Mechanic:** On each click damage instance, heal player for `damage × percent`. Applies to each hit individually (Flurry hits each heal separately).

**Reference Points:**
- Level 35, ATK ~159: Lv1 heals ~4.8 HP/click, ~12 HP/sec at 2.5 clicks/sec (2% max HP/sec)
- Level 70, ATK ~474: Lv5 heals ~47 HP/click, ~118 HP/sec (15% max HP/sec). Very strong sustain.
- Does NOT apply to Instant skill damage (Barrage, Arcane Bolt, Chain Lightning, Shield Bash).

---

### 9.3 Critical Flow

| | |
|---|---|
| **Category** | Crit / Energy |
| **Tags** | `crit`, `energy` |
| **Unlock** | Level 18 — 1 SP |
| **Description** | Critical hits restore energy. |

| Level | Energy per Crit | Upgrade |
|-------|----------------|---------|
| 1 | 5 | — |
| 2 | 7 | 1 SP |
| 3 | 9 | 1 SP |
| 4 | 12 | 1 SP |
| 5 | 15 | 1 SP |

**Mechanic:** Triggers on ANY critical hit — clicks, Barrage hits, Arcane Bolt crits, Chain Lightning crits, etc. Each crit independently triggers the energy gain.

**Reference Points:**
- Base 5% crit, 2.5 clicks/sec: ~0.125 crits/sec × 5 = 0.6 energy/sec. Minor.
- With 30% crit (gear + Berserker): ~0.75 crits/sec × 5 = 3.75 energy/sec. Meaningful.
- During Adrenaline Rush at 80% crit: ~2.0 crits/sec × 15 (Lv5) = 30 energy/sec. Self-sustaining loop.
- Barrage Lv5 (10 hits, each can crit): at 30% crit = 3 crits × 5 = 15 instant energy. Nice burst.

---

### 9.4 Heavy Handed

| | |
|---|---|
| **Category** | Power |
| **Tags** | `power` |
| **Unlock** | Level 24 — 1 SP |
| **Description** | Your clicks hit much harder, but generate less energy. |

| Level | Click Damage Bonus | Energy per Click | Upgrade |
|-------|-------------------|-----------------|---------|
| 1 | +40% | 1.5 (base 3 → 1.5) | — |
| 2 | +50% | 1.5 | 1 SP |
| 3 | +60% | 1.8 | 1 SP |
| 4 | +70% | 2.0 | 1 SP |
| 5 | +80% | 2.0 | 1 SP |

**Mechanic:** Modifies base click damage and energy gain per click. Does NOT affect Instant skill damage.

**Energy Impact:**
- Base: 3/click × 2.5 clicks/sec = 7.5 energy/sec from clicks
- With HH Lv1: 1.5/click × 2.5 = 3.75 energy/sec from clicks (-50%)
- With HH Lv5: 2.0/click × 2.5 = 5.0 energy/sec from clicks (-33%)
- Compensated by: Focused Mind (idle regen), Energy Surge, kill energy, natural regen

**Design Intent:** Defines the heavy hitter identity. Each click matters more, but skills must be chosen carefully due to limited energy.

---

### 9.5 Combo Artist

| | |
|---|---|
| **Category** | Combo |
| **Tags** | `combo` |
| **Unlock** | Level 26 — 1 SP |
| **Description** | Using two different skills in quick succession grants a damage bonus. |

| Level | Damage Bonus | Buff Duration | Trigger Window | Upgrade |
|-------|-------------|---------------|----------------|---------|
| 1 | +30% | 4s | 3.0s | — |
| 2 | +35% | 4.5s | 3.0s | 1 SP |
| 3 | +40% | 5.0s | 3.5s | 1 SP |
| 4 | +45% | 5.5s | 3.5s | 1 SP |
| 5 | +50% | 6.0s | 4.0s | 1 SP |

**Mechanic:** When 2 DIFFERENT active skills are used within the trigger window, a damage buff activates. Applies to ALL damage (clicks AND skills). Using another 2-skill combo during the buff refreshes the duration.

**Uptime Analysis:**
- With 4 active skills and ~10s average CDs: can proc roughly every 5-8 seconds.
- Lv5 buff lasts 6s with 4s trigger window: near-permanent uptime with good skill usage.
- Average DPS increase with ~75% uptime: Lv1 = +22.5%, Lv5 = +37.5%.

---

### 9.6 Berserker

| | |
|---|---|
| **Category** | Power / Crit |
| **Tags** | `power`, `crit` |
| **Unlock** | Level 28 — 1 SP |
| **Description** | Below an HP threshold: bonus damage and crit chance. |

| Level | HP Threshold | Damage Bonus | Crit Bonus | Upgrade |
|-------|-------------|-------------|-----------|---------|
| 1 | < 50% HP | +20% | +10% | — |
| 2 | < 50% | +25% | +12% | 1 SP |
| 3 | < 55% | +30% | +15% | 1 SP |
| 4 | < 55% | +35% | +18% | 1 SP |
| 5 | < 60% | +40% | +20% | 1 SP |

**Mechanic:** Always active when player HP is below threshold. Checked each tick. Applies to ALL damage.

**Synergies:**
- Life Tap: intentionally lower HP to activate Berserker.
- Vampiric Strikes: sustain at low HP without dying.
- At Lv5 with base 5% crit: effective 25% crit chance while active. Strong.
- Risk: aggressive/swift monsters can kill you at low HP. Shield Bash mitigates.

---

### 9.7 Efficient Casting

| | |
|---|---|
| **Category** | Mage |
| **Tags** | `spell`, `energy` |
| **Unlock** | Level 33 — 1 SP |
| **Description** | All skill energy costs are reduced. |

| Level | Cost Reduction | Upgrade |
|-------|---------------|---------|
| 1 | -15% | — |
| 2 | -20% | 1 SP |
| 3 | -25% | 1 SP |
| 4 | -30% | 1 SP |
| 5 | -35% | 1 SP |

**Mechanic:** Reduces energy cost of all active skills. Also reduces Momentum's toggle drain rate. Rounds down (floor).

**Examples at Lv5 (-35%):**

| Skill | Base Cost | Reduced Cost |
|-------|-----------|-------------|
| Power Strike | 35 | 23 |
| Arcane Bolt | 20 | 13 |
| Barrage | 25 | 16 |
| Momentum drain | 2/sec | 1.3/sec |

---

### 9.8 Spell Weaver

| | |
|---|---|
| **Category** | Mage |
| **Tags** | `spell` |
| **Unlock** | Level 42 — 1 SP |
| **Description** | Using any active skill reduces all other skill cooldowns. |

| Level | CDR per Skill Use | Upgrade |
|-------|------------------|---------|
| 1 | 0.8s | — |
| 2 | 1.0s | 1 SP |
| 3 | 1.2s | 1 SP |
| 4 | 1.4s | 1 SP |
| 5 | 1.5s | 1 SP |

**Mechanic:** When any active skill is used (including Momentum toggle), reduce ALL OTHER equipped active skill cooldowns by the CDR amount. Subject to 50% base cooldown floor.

**Loop Analysis:**
- 4 skills, Lv5: each use reduces 3 others by 1.5s.
- If using a skill every 3-4s: each skill gets 2-3 procs of -1.5s per cycle = 3-4.5s CDR.
- Arcane Bolt (6s base, 3s floor): with Spell Weaver, effective CD ≈ 3-4s. Near-permanent uptime.
- This is THE mage-defining passive. Without it, mage builds feel clunky. With it, chain-casting flows.

---

### 9.9 Residual Energy

| | |
|---|---|
| **Category** | Energy |
| **Tags** | `energy` |
| **Unlock** | Level 48 — 1 SP |
| **Description** | When a skill effect ends, gain energy. |

| Level | Energy on Effect End | Upgrade |
|-------|-------------------|---------|
| 1 | 8 | — |
| 2 | 10 | 1 SP |
| 3 | 12 | 1 SP |
| 4 | 15 | 1 SP |
| 5 | 18 | 1 SP |

**Triggers on:**
- Timed buff expiry: Flurry, Adrenaline Rush, Combo Artist damage buff, Shield Bash shield
- Hit modifier consumed by click: Power Strike, Execute, Shatter
- Precision: when last charge consumed
- Momentum: when toggled OFF
- Does NOT trigger on: Instant skills (no lingering effect), Overcharge (instant)

**Analysis:** With 4 active skills, roughly 4 triggers per ~15s rotation = Lv1: 32 energy/15s = 2.1 energy/sec. Lv5: 72/15 = 4.8 energy/sec. Very strong energy economy passive.

---

### 9.10 Focused Mind

| | |
|---|---|
| **Category** | Power / Energy |
| **Tags** | `energy`, `power` |
| **Unlock** | Level 52 — 1 SP |
| **Description** | Gain energy while not clicking. Rewards patience and synergizes with channel skills. |

| Level | Idle Energy Regen | Upgrade |
|-------|------------------|---------|
| 1 | +3/sec | — |
| 2 | +4/sec | 1 SP |
| 3 | +5/sec | 1 SP |
| 4 | +6/sec | 1 SP |
| 5 | +8/sec | 1 SP |

**Mechanic:** Active when player has NOT clicked in the last **0.5 seconds**. Stacks with base energy regen (1/sec).

**When It Activates:**
- Between monster spawns (0.5s MONSTER_SPAWN_DELAY)
- During Charge Up channel (1-3s of no clicking!)
- During aggressive monster attack phases (shouldn't click)
- Deliberate pauses (heavy hitter playstyle)

**Charge Up Synergy:**
- Lv5 during 2.5s channel: 20 energy gained. Almost pays for Charge Up's 33 energy cost.
- Combined with base regen: 2.5s × (8 + 1) = 22.5 energy during channel.

---

## 10. Example Builds

Updated with final numbers. All builds use Level 50 reference point (ATK ~54 base + ~220 weapon = ~274 ATK, 2.5 clicks/sec).

Pure clicking DPS at Level 50: 274 × 2.5 × 1.05 = ~719 DPS.

### Build 1: Speed Demon

| Slot | Skill |
|------|-------|
| Active 1 | Flurry (Lv3) |
| Active 2 | Barrage (Lv3) |
| Active 3 | Momentum (Lv1) |
| Active 4 | Energy Surge (Lv2) |
| Passive 1 | Click Mastery (Lv3) |
| Passive 2 | Combo Artist (Lv2) |
| Passive 3 | Critical Flow (Lv1) |

**Effective DPS:** ~2200 DPS (~3x pure clicking)

**How It Plays:** Toggle Momentum ON, click fast to build stacks (max +48%). Click Mastery adds another +60% from stacking. Flurry doubles clicks for 5s burst windows. Barrage fills gaps. Combo Artist procs constantly from Flurry + Barrage. Energy Surge keeps the engine running. Critical Flow contributes minor energy.

---

### Build 2: Executioner (Heavy Hitter)

| Slot | Skill |
|------|-------|
| Active 1 | Power Strike (Lv4) |
| Active 2 | Precision (Lv2) |
| Active 3 | Execute (Lv2) |
| Active 4 | Charge Up (Lv1) |
| Passive 1 | Heavy Handed (Lv3) |
| Passive 2 | Focused Mind (Lv1) |
| Passive 3 | Combo Artist (Lv1) |

**Effective DPS:** ~1900 DPS (~2.6x pure clicking)

**How It Plays:** Click steadily (each hit +60% from Heavy Handed). Precision → Power Strike = guaranteed 1800% crit = 3600% one hit. Execute finishes wounded monsters. Charge Up for bosses (full charge = 1500%, with Focused Mind gaining energy during channel). Combo Artist triggers on Precision + Power Strike. Lower total DPS than Speed Demon but MASSIVE single hits.

---

### Build 3: Arcane Caster

| Slot | Skill |
|------|-------|
| Active 1 | Arcane Bolt (Lv4) |
| Active 2 | Chain Lightning (Lv2) |
| Active 3 | Overcharge (Lv2) |
| Active 4 | Energy Surge (Lv2) |
| Passive 1 | Spell Weaver (Lv3) |
| Passive 2 | Efficient Casting (Lv2) |
| Passive 3 | Combo Artist (Lv2) |

**Effective DPS:** ~2400 DPS (~3.3x pure clicking)

**How It Plays:** Chain-cast. Arcane Bolt every 3-4s (with Spell Weaver CDR). Chain Lightning for farming. Overcharge resets all CDs. Efficient Casting (-20%) makes energy go far. Energy Surge as backup. Combo Artist always active. Clicking fills gaps between casts for base DPS + energy generation.

---

### Build 4: Adrenaline Junkie (Crit)

| Slot | Skill |
|------|-------|
| Active 1 | Adrenaline Rush (Lv3) |
| Active 2 | Precision (Lv3) |
| Active 3 | Execute (Lv3) |
| Active 4 | Energy Surge (Lv3) |
| Passive 1 | Critical Flow (Lv3) |
| Passive 2 | Berserker (Lv2) |
| Passive 3 | Residual Energy (Lv1) |

**Effective DPS:** ~2100 DPS sustained, ~4000+ DPS during Adrenaline windows (~3-5.5x)

**How It Plays:** Hoard energy, pop Adrenaline Rush at 100 energy for massive crit window. Critical Flow restores energy from crits, extending the window. Between Adrenaline CDs, use Precision + Execute for reliable crit damage. Berserker adds damage when low HP. Residual Energy refunds energy when buffs expire. Boom-bust cycle of devastating crit windows.

---

## 11. Respec System

### Rules

- Full SP refund. All unlocked skills and upgrades reset.
- Must reassign all SP from scratch. No partial respec.
- Can be done from the Skills screen. Not available during active combat.

### Costs

| Respec # | Gold Cost |
|----------|----------|
| 1st | 1,000 |
| 2nd | 3,000 |
| 3rd | 8,000 |
| 4th | 20,000 |
| 5th | 50,000 |
| 6th+ | 100,000 |

**Respec counter is permanent.** Does not reset.

> Future: Ascension may grant free respecs or reset the counter. Not in v1.0 scope.

### Context

| Gold Reference | Amount |
|----------------|--------|
| Zone 1 total earnings | ~2,000 |
| Zone 3 total earnings | ~15,000 |
| Zone 5 total earnings | ~50,000 |
| Zone 7 total earnings | ~200,000+ |

1st respec = trivial (half a zone's income). 3rd = meaningful (half a zone). 5th = a full zone of grinding. 6th+ = punishing on purpose.

---

## 12. Balance Framework

### Skill Power Budget

**Target DPS contribution per skill slot:**
- Level 1 skill: +25-50% DPS increase over its cycle
- Level 5 skill: +60-120% DPS increase over its cycle
- 4 skills combined: 2-4× pure clicking DPS (stacking is multiplicative, diminishing returns natural)

### DPS Calculation Formula

For direct damage skills:
```
cycle_dps = (damage_multiplier × ATK) / cooldown
dps_increase = cycle_dps / base_clicking_dps
base_clicking_dps = ATK × clicks_per_sec × (1 + critChance × (critMult - 1))
                  ≈ ATK × 2.5 × 1.05 = ATK × 2.625
```

For buff skills:
```
avg_dps_increase = buff_strength × (buff_duration / cooldown)
```

### Reference: Pure Clicking DPS by Level

| Level | Base ATK | With Weapon | Clicking DPS (2.5/sec, 5% crit) |
|-------|----------|------------|--------------------------------|
| 5 | 9 | ~13 | 34 |
| 15 | 19 | ~44 | 116 |
| 25 | 29 | ~89 | 234 |
| 35 | 39 | ~159 | 417 |
| 50 | 54 | ~274 | 719 |
| 70 | 74 | ~474 | 1,244 |
| 100 | 104 | ~1,100 | 2,888 |

### Monster Kill Time Targets

| Scenario | Kill Time |
|----------|----------|
| Pure clicking, mid-zone monster | 8-15 seconds |
| With skills, mid-zone monster | 3-6 seconds |
| With skill combos, weak monster | Near-instant |
| Boss, with skills | 30-90 seconds |
| Boss, pure clicking | Very long (not viable for later bosses) |

### Adding New Skills — Balance Checklist

When designing a new skill:
1. Calculate its cycle DPS contribution using the formulas above
2. Target: +30-60% at Lv1, +80-120% at Lv5
3. Energy cost should equal ~2-4 seconds of clicking energy income
4. Cooldown should be long enough that the player clicks 15-30 times between uses
5. Check that it doesn't break any existing combo beyond 5× pure clicking DPS
6. Verify energy sustainability: can a build using this + 3 other skills sustain energy?

---

## 13. Skill Mutations (Future — v1.1)

Skill mutations activate when a skill reaches **max upgrade level (Lv5)**. They add a bonus mechanic without changing the base skill. Mutations are an endgame reward for deep investment in a single skill.

**Implementation Status: NOT in v1.0.** The data structure should include a `mutation` field set to `null`. Mutation content defined here for future reference.

| Skill | Mutation Name | Effect |
|-------|-------------|--------|
| Power Strike | Devastating Strike | Also slows monster attack speed by 30% for 4s |
| Barrage | Bullet Storm | Each hit reduces Flurry cooldown by 0.3s |
| Precision | Eagle Eye | Guaranteed crits also deal +25% crit damage |
| Execute | Reaper's Mark | Kill with Execute grants +15 energy and -2s on Execute CD |
| Energy Surge | Overflow | Excess energy beyond 100 converts to a 5s damage buff (+1% per excess energy) |
| Arcane Bolt | Arcane Barrage | Fires 3 bolts instead of 1 (each at 50% of base, total 150% of single bolt) |
| Shield Bash | Fortress | Shield no longer expires; instead it persists until broken by damage |
| Flurry | Tempest | During Flurry, each hit has 10% chance to generate +2 energy |
| Adrenaline Rush | Blood Frenzy | Also grants +15% damage during the effect |
| Chain Lightning | Storm Caller | Overkill chains can bounce up to 3 monsters deep |
| Charge Up | Overload | Full charge also releases a shockwave dealing 200% ATK to all (future AoE hook) |
| Momentum | Unstoppable | Stacks above 6 no longer decay |
| Overcharge | Temporal Surge | Also grants +20% damage for 3s after use |
| Shatter | Seismic Impact | %HP damage increased by 50% against armored monsters |
| Life Tap | Blood Pact | HP cost converted to a 6s bleed on the monster (deals the lost HP as damage over time) |

> These are conceptual. Exact numbers subject to design review when v1.1 is scoped.

---

## 14. UI Requirements

### Skill Bar (Combat Screen)

- 4 skill buttons at bottom of combat area (above stats bar)
- Each button shows: skill icon/emoji, cooldown overlay (clockwise sweep), energy cost
- Toggle skills: pulsing border/glow when ON, stack count visible
- Channel skills: hold animation (fill ring around button while held)
- Next-click buffs: buff indicator icon above skill bar when active
- Disabled state (grey) when: on cooldown, insufficient energy, or in channel

### Skills Screen

- Header: "Skills" title + SP counter ("SP: 12")
- Two tabs: Active | Passive
- Skill list: cards with name, icon, description, level (1-5 stars or bar), unlock/upgrade button
- Locked skills (not yet at required level): shown greyed with "Unlocks at Lv X"
- Equipped indicator on skill cards
- Equip/unequip from skill detail view
- Respec button at bottom of screen with cost displayed

### Skill Detail View (tap a skill card)

- Full description with current level stats
- Next level preview (stat comparison)
- Upgrade button with SP cost
- Equip/Unequip button
- Tags displayed as small badges

---

## 15. Architecture & Data Structures

### Skill Data Object

```javascript
{
  id: 'power_strike',
  name: 'Power Strike',
  description: 'Next click deals {damage}% damage.',
  category: 'power',           // speed | power | crit | spell | utility
  type: 'active',              // active | passive
  tags: ['power', 'attack'],
  mechanic: 'next_click_hit',  // next_click_hit | next_click_click | buff |
                                // toggle | channel | instant | hp_cost | cd_utility
  unlockLevel: 1,
  unlockCost: 0,               // SP (0 = free)
  upgradeCost: 1,              // SP per upgrade level
  maxLevel: 5,
  mutation: null,               // null for v1.0, mutation id for v1.1
  levels: {
    1: { damage: 1000, cooldown: 10, energyCost: 35 },
    2: { damage: 1200, cooldown: 10, energyCost: 35 },
    3: { damage: 1500, cooldown: 9,  energyCost: 33 },
    4: { damage: 1800, cooldown: 9,  energyCost: 33 },
    5: { damage: 2200, cooldown: 8,  energyCost: 30 }
  }
}
```

### Player State (skill-related)

```javascript
player: {
  skillPoints: 0,                  // current unspent SP
  totalSPEarned: 0,                // lifetime SP earned (for tracking)
  respecCount: 0,                  // number of respecs done (for cost scaling)
  unlockedSkills: {                // map of skill_id → level
    'power_strike': 1
  },
  equippedActive: [null, null, null, null],  // 4 slots, skill_id or null
  equippedPassive: [null, null, null],       // 3 slots, skill_id or null
  skillCooldowns: {},              // skill_id → remaining cooldown (seconds)
  activeBuffs: {},                 // skill_id → { remaining, ...buff_data }
  toggleStates: {},                // skill_id → { active: bool, stacks: 0, ... }
  hitModifier: null,               // currently queued hit modifier (only one)
  clickModifiers: {},              // skill_id → { remaining_charges }
}
```

### Effect Handler Pattern

```javascript
// Active skills
const EFFECT_HANDLERS = {
  power_strike: (skill, ctx) => { ctx.setHitModifier('power_strike', skill.damage); },
  barrage:      (skill, ctx) => { ctx.dealInstantDamage(skill.hits, skill.damagePerHit); },
  precision:    (skill, ctx) => { ctx.setClickModifier('precision', skill.charges); },
  momentum:     (skill, ctx) => { ctx.toggleSkill('momentum'); },
  charge_up:    (skill, ctx) => { ctx.startChannel('charge_up', skill.channelRange); },
  // ... one entry per skill
};

// Passive skills - subscribe to events
const PASSIVE_HANDLERS = {
  click_mastery:    { event: 'combat:click',       handler: (e, ctx) => { ... } },
  critical_flow:    { event: 'combat:crit',        handler: (e, ctx) => { ... } },
  spell_weaver:     { event: 'skill:used',         handler: (e, ctx) => { ... } },
  combo_artist:     { event: 'skill:used',         handler: (e, ctx) => { ... } },
  residual_energy:  { event: 'skill:effectEnded',  handler: (e, ctx) => { ... } },
  // ...
};
```

### Key Events

| Event | Payload | Used By |
|-------|---------|---------|
| `skill:used` | `{ skillId, tags }` | Spell Weaver, Combo Artist, Residual Energy |
| `skill:effectEnded` | `{ skillId, reason }` | Residual Energy |
| `skill:hitModifierSet` | `{ skillId }` | UI (buff indicator) |
| `skill:hitModifierConsumed` | `{ skillId }` | Residual Energy |
| `skill:toggleChanged` | `{ skillId, active }` | UI, Residual Energy |
| `skill:channelStart` | `{ skillId }` | UI, combat (disable clicks) |
| `skill:channelRelease` | `{ skillId, damage }` | combat (auto-fire hit) |
| `combat:click` | `{ damage, isCrit }` | Click Mastery, Vampiric Strikes |
| `combat:crit` | `{ damage }` | Critical Flow |
| `energy:changed` | `{ energy, maxEnergy }` | Adrenaline Rush crit calc |

---

## 16. Migration from v1

### What Changes

| Component | v1 | v2 |
|-----------|----|----|
| `js/data/skills.data.js` | 25 skills (16A + 9P) | 25 skills (15A + 10P), complete rewrite |
| `js/systems/skills.js` | Basic cooldown + effects | New mechanics: toggles, channels, click/hit modifiers |
| `js/data/constants.js` | MP constants, old energy | SP constants, v2 energy values |
| Player schema | `masteryPoints` | `skillPoints`, `respecCount`, `hitModifier`, `toggleStates`, etc. |
| `docs/systems/skill.system.md` | Old spec | Replaced by this document |
| `docs/data/skills.data.md` | Old data | Replaced by this document |

### What Stays

| Component | Notes |
|-----------|-------|
| Event-driven architecture | EFFECT_HANDLERS pattern preserved |
| 4 active + 3 passive slots | Same slot count |
| Skill bar UI (4 buttons) | Layout unchanged, interaction updated |
| Energy system (core) | Same events, updated constants |
| Game loop tick integration | `skills.update(dt)` pattern unchanged |

### Energy Constants Migration

Update `js/data/constants.js`:
```
ENERGY_PER_CLICK:       5 → 3
ENERGY_ON_KILL:        15 → 10
ENERGY_ON_BOSS_KILL:   50 → 25
ENERGY_REGEN_PER_SECOND: 2 → 1
```

> Note: Code currently has ENERGY_PER_CLICK = 1, ENERGY_ON_KILL = 5 (different from both v1 docs and v2). The v2 values above are the canonical source of truth.

---

*This document is the complete specification for Skill System v2. All stats, costs, unlock levels, and interaction rules are defined. Multipliers are balance targets — expect adjustment during playtesting. The architecture is designed so balance changes are data-only (no code changes needed to adjust numbers).*

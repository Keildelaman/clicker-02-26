# Item System v2 — Complete Design Document

> **Status:** DESIGN COMPLETE
> **Created:** 2026-02-17
> **Scope:** Full item system overhaul — equipment slots, random affixes, rarities, crafting, gold sinks

---

## Table of Contents

1. [Design Goals](#1-design-goals)
2. [Equipment Slots](#2-equipment-slots)
3. [Rarity System](#3-rarity-system)
4. [Affix System](#4-affix-system)
5. [Item Generation](#5-item-generation)
6. [Legendary Items](#6-legendary-items)
7. [Item Modification Systems](#7-item-modification-systems)
8. [Drop System](#8-drop-system)
9. [Boss Material System](#9-boss-material-system)
10. [Inventory System](#10-inventory-system)
11. [Shop v2](#11-shop-v2)
12. [Item Naming](#12-item-naming)
13. [Balance Targets](#13-balance-targets)
14. [Weapon Damage Type](#14-weapon-damage-type)
15. [Status Effect Proc Rules](#15-status-effect-proc-rules)
16. [Skill Level from Items](#16-skill-level-from-items)
17. [UI/UX Outline](#17-uiux-outline)
18. [Resolved Decisions](#18-resolved-decisions)
19. [Migration from v1](#19-migration-from-v1)

---

## 1. Design Goals

### What We Want
- Every drop is a moment of excitement — "Is this one better?"
- Build identity through gear — a physical build LOOKS different from a magic build
- Meaningful gold sinks — gold matters throughout the entire game
- Chase items — legendaries with unique effects that define builds
- Items feel rare and valuable — not drowning in loot
- Depth without overwhelming a mobile player

### What v1 Got Wrong
- Fixed stats = no excitement on drops (always know exactly what you get)
- 3 slots = too few meaningful choices
- Items drop too frequently = shop is pointless
- No gold sink = gold is meaningless
- No modification system = equip and forget

### Design Pillars
1. **Randomness creates replayability** — same item can be great or mediocre
2. **Rarity = affix count** — higher rarity means more stats, not just bigger numbers
3. **Gold is always valuable** — reforging, imbuing, tempering consume gold endlessly
4. **Legendaries are chase goals** — rare, powerful, build-defining
5. **Items complement the damage/defense type system** — all stats from the combat system appear on gear

---

## 2. Equipment Slots

### Expanded from 3 to 6

| Slot | Fantasy | Primary Stat Lean | Notes |
|------|---------|-------------------|-------|
| **Weapon** | Swords, staffs, daggers, wands | Offensive + Status | Defines primary damage type |
| **Helmet** | Crowns, hoods, helms, circlets | Defensive + Skill | Protects the mind |
| **Chest** | Plate, robes, chainmail, tunics | Defensive (heavy) | Main armor/MR source |
| **Gloves** | Gauntlets, wraps, bracers, grips | Offensive + Status | Precision and application |
| **Boots** | Greaves, sandals, treads, sabatons | Utility + Defensive | Movement and resources |
| **Accessory** | Rings, amulets, pendants, charms | Wildcard | Can roll anything equally |

### Slot Rules
- One item per slot (equipping replaces)
- Unequipped item returns to inventory
- Each slot has weighted affix pools (see [Section 4.3](#43-slot-weighting))
- Player starts with **no equipment** — must find gear through drops or buy from shop

---

## 3. Rarity System

### Rarity = Number of Affixes

| Rarity | Color | Affixes on Drop | Max Affixes | Can Imbue? | Can Temper? |
|--------|-------|-----------------|-------------|------------|-------------|
| **Common** | `#9d9d9d` (grey) | 1 | 1 | No | No |
| **Uncommon** | `#1eff00` (green) | 1-2 | 2 | Yes (if dropped with 1) | No |
| **Rare** | `#0070dd` (blue) | 2-3 | 3 | Yes (if dropped with 2) | Yes |
| **Epic** | `#a335ee` (purple) | 3-4 | 4 | Yes (if dropped with 3) | Yes |
| **Legendary** | `#ff8000` (orange) | 4 + unique effect | 4 + unique | No (always full) | Yes |

### Drop Affix Distribution
When an item drops, it rolls whether it has the maximum affixes for its rarity:

| Rarity | Chance of Max Affixes | Chance of Max - 1 |
|--------|-----------------------|---------------------|
| Uncommon | 60% (2 affixes) | 40% (1 affix) |
| Rare | 50% (3 affixes) | 50% (2 affixes) |
| Epic | 40% (4 affixes) | 60% (3 affixes) |

Items that drop with fewer than max affixes can be **Imbued** to add the missing slot (see [Section 7.2](#72-imbue)).

---

## 4. Affix System

### 4.1 Complete Affix Pool

Every affix belongs to a category. Categories determine slot weighting.

#### Offensive Affixes

| Affix ID | Display Name | Range Style | Notes |
|----------|-------------|-------------|-------|
| `flat_attack` | +X Attack | Flat value | Physical damage |
| `flat_magic_power` | +X Magic Power | Flat value | Magic damage |
| `crit_chance` | +X% Crit Chance | Percentage | Applies to both types |
| `crit_damage` | +X% Crit Damage | Percentage | Applies to both types |
| `armor_pen` | +X% Armor Penetration | Percentage | vs physical defense |
| `magic_pen` | +X% Magic Penetration | Percentage | vs magic defense |

#### Defensive Affixes

| Affix ID | Display Name | Range Style | Notes |
|----------|-------------|-------------|-------|
| `flat_armor` | +X Armor | Flat value | Physical defense |
| `flat_magic_resist` | +X Magic Resist | Flat value | Magic defense |
| `flat_max_hp` | +X Max HP | Flat value | Raw survivability |
| `flat_max_shield` | +X Max Shield | Flat value | Status immunity layer |
| `hp_regen` | +X% HP Regen/sec | Percentage | Sustain |

#### Utility Affixes

| Affix ID | Display Name | Range Style | Notes |
|----------|-------------|-------------|-------|
| `gold_find` | +X% Gold Find | Percentage | More gold per kill |
| `xp_bonus` | +X% XP Bonus | Percentage | Faster leveling |
| `energy_gain` | +X% Energy Gain | Percentage | More energy per click/kill |
| `skill_cooldown` | +X% Cooldown Reduction | Percentage | Faster skill use |

#### Status Effect Affixes — Chance

| Affix ID | Display Name | Range Style | Notes |
|----------|-------------|-------------|-------|
| `bleed_chance` | +X% Bleed Chance | Percentage | Physical-scaling DoT |
| `poison_chance` | +X% Poison Chance | Percentage | Physical-scaling stacking DoT |
| `burn_chance` | +X% Burn Chance | Percentage | Magic-scaling DoT |
| `slow_chance` | +X% Slow Chance | Percentage | Magic-scaling CC |
| `freeze_chance` | +X% Freeze Chance | Percentage | Magic-scaling hard CC |

#### Status Effect Affixes — Potency

| Affix ID | Display Name | Range Style | Notes |
|----------|-------------|-------------|-------|
| `bleed_potency` | +X% Bleed Damage | Percentage | Bleed ticks hit harder |
| `poison_potency` | +X% Poison Damage | Percentage | Poison ticks hit harder |
| `burn_potency` | +X% Burn Damage | Percentage | Burn ticks hit harder |
| `slow_strength` | +X% Slow Effectiveness | Percentage | Slow is stronger |
| `freeze_duration` | +X% Freeze Duration | Percentage | Freeze lasts longer |

#### Skill Category Affixes — Power Boost

| Affix ID | Display Name | Range Style | Notes |
|----------|-------------|-------------|-------|
| `skill_speed_boost` | +X% Speed Skill Power | Percentage | Flurry, Barrage, etc. |
| `skill_power_boost` | +X% Power Skill Power | Percentage | Power Strike, Execute, etc. |
| `skill_crit_boost` | +X% Crit Skill Power | Percentage | Precision Strike, etc. |
| `skill_mage_boost` | +X% Mage Skill Power | Percentage | Arcane Bolt, Ice Shard, etc. |
| `skill_utility_boost` | +X% Utility Skill Power | Percentage | Heal, Shield Bash, etc. |

#### Skill Category Affixes — Level Boost

| Affix ID | Display Name | Range Style | Notes |
|----------|-------------|-------------|-------|
| `skill_speed_level` | +X to Speed Skills | Zone-based | Raises effective level of all Speed skills |
| `skill_power_level` | +X to Power Skills | Zone-based | Raises effective level of all Power skills |
| `skill_crit_level` | +X to Crit Skills | Zone-based | Raises effective level of all Crit skills |
| `skill_mage_level` | +X to Mage Skills | Zone-based | Raises effective level of all Mage skills |
| `skill_utility_level` | +X to Utility Skills | Zone-based | Raises effective level of all Utility skills |
| `skill_all_level` | +X to All Skills | Zone-based | Raises effective level of ALL skills — very rare |

#### Individual Skill Level Affixes

Each of the 25 skills (15 active + 10 passive) has a dedicated affix that boosts only that skill's effective level.

**Active Skill Affixes (15):**

| Affix ID | Display Name | Skill | Category |
|----------|-------------|-------|----------|
| `skill_power_strike_level` | +X to Power Strike | power_strike | Power |
| `skill_charge_up_level` | +X to Charge Up | charge_up | Power |
| `skill_shatter_level` | +X to Shatter | shatter | Power |
| `skill_flurry_level` | +X to Flurry | flurry | Speed |
| `skill_barrage_level` | +X to Barrage | barrage | Speed |
| `skill_momentum_level` | +X to Momentum | momentum | Speed |
| `skill_precision_level` | +X to Precision | precision | Crit |
| `skill_execute_level` | +X to Execute | execute | Crit |
| `skill_adrenaline_rush_level` | +X to Adrenaline Rush | adrenaline_rush | Crit |
| `skill_arcane_bolt_level` | +X to Arcane Bolt | arcane_bolt | Mage |
| `skill_chain_lightning_level` | +X to Chain Lightning | chain_lightning | Mage |
| `skill_overcharge_level` | +X to Overcharge | overcharge | Mage |
| `skill_energy_surge_level` | +X to Energy Surge | energy_surge | Utility |
| `skill_shield_bash_level` | +X to Shield Bash | shield_bash | Utility |
| `skill_life_tap_level` | +X to Life Tap | life_tap | Utility |

**Passive Skill Affixes (10):**

| Affix ID | Display Name | Skill | Category |
|----------|-------------|-------|----------|
| `skill_click_mastery_level` | +X to Click Mastery | click_mastery | Speed |
| `skill_heavy_handed_level` | +X to Heavy Handed | heavy_handed | Power |
| `skill_berserker_level` | +X to Berserker | berserker | Power |
| `skill_focused_mind_level` | +X to Focused Mind | focused_mind | Power |
| `skill_critical_flow_level` | +X to Critical Flow | critical_flow | Crit |
| `skill_vampiric_strikes_level` | +X to Vampiric Strikes | vampiric_strikes | Sustain |
| `skill_combo_artist_level` | +X to Combo Artist | combo_artist | Combo |
| `skill_efficient_casting_level` | +X to Efficient Casting | efficient_casting | Mage |
| `skill_spell_weaver_level` | +X to Spell Weaver | spell_weaver | Mage |
| `skill_residual_energy_level` | +X to Residual Energy | residual_energy | Energy |

#### Skill Level Affix — Zone-Based Ranges

Skill level affixes do NOT use the tier formula system. Instead, the bonus level is determined by the item's zone:

| Zone | Min | Max | Weight Distribution |
|------|-----|-----|---------------------|
| 1-2 | +1 | +1 | Always +1 |
| 3-4 | +1 | +2 | 80% +1 / 20% +2 |
| 5-6 | +1 | +2 | 60% +1 / 40% +2 |
| 7 | +1 | +3 | 50% +1 / 35% +2 / 15% +3 |

#### Beyond-Max Skill Level Scaling

Skill level affixes **can exceed the skill's max level (5)**. When effective level goes beyond max, a universal scaling formula applies:

```
Each level beyond max → +20% to all numerical skill stats (based on level 5 values)

Level 6 = level 5 stats × 1.20
Level 7 = level 5 stats × 1.40
Level 8 = level 5 stats × 1.60
```

This scaling is **additive** (+20% per extra level), not compounding. Simple, universal, doesn't require defining extra levels per skill.

**How +Level works:**
- Skill acts as if it's N upgrade levels higher than the player has invested
- Affects all level-scaling properties: damage, duration, cost reduction, etc.
- **Can exceed max level 5** — beyond-max scaling applies (see formula above)
- +Level from multiple sources stacks: category affix + individual affix + all-skills affix all add up
- Category level affixes boost ALL skills in that category (actives + passives)
- `skill_all_level` boosts every equipped skill — extremely powerful, extremely rare
- Skill must be **unlocked AND equipped** for the bonus to apply
- Unequipping the boosting item immediately removes the bonus level

**Total: 63 affixes** across 7 categories (6 offensive, 5 defensive, 4 utility, 5 status chance, 5 status potency, 5 power boost, 6 category level, 25 individual skill level, 1 all-skills level → organized into 6 categories for slot weighting purposes; skill power boost + category level + individual level + all-skills level are all in the "Skill Category" group).

### 4.2 Affix Tier Ranges (Scaling Formulas)

Rather than defining individual values for every affix at every tier, affixes use **base values at T1** and a **tier multiplier** to derive values at higher tiers.

#### Flat Stat Tier Multipliers

```
T1: 1.0x   T2: 2.0x   T3: 3.8x   T4: 6.5x   T5: 11.0x   T6: 18.0x   T7: 30.0x
```

#### Percentage Stat Tier Multipliers

```
T1: 1.0x   T2: 1.3x   T3: 1.7x   T4: 2.2x   T5: 2.8x   T6: 3.6x   T7: 4.5x
```

#### Base Values (T1 Min-Max)

| Affix | T1 Min | T1 Max | Scale Type |
|-------|--------|--------|------------|
| `flat_attack` | 2 | 6 | Flat |
| `flat_magic_power` | 2 | 6 | Flat |
| `crit_chance` | 1% | 2% | Percentage |
| `crit_damage` | 3% | 6% | Percentage |
| `armor_pen` | 1% | 3% | Percentage |
| `magic_pen` | 1% | 3% | Percentage |
| `flat_armor` | 3 | 8 | Flat |
| `flat_magic_resist` | 3 | 8 | Flat |
| `flat_max_hp` | 8 | 20 | Flat |
| `flat_max_shield` | 5 | 12 | Flat |
| `hp_regen` | 0.2% | 0.5% | Percentage |
| `gold_find` | 3% | 6% | Percentage |
| `xp_bonus` | 3% | 6% | Percentage |
| `energy_gain` | 2% | 5% | Percentage |
| `skill_cooldown` | 2% | 4% | Percentage |
| `bleed_chance` | 2% | 5% | Percentage |
| `poison_chance` | 2% | 5% | Percentage |
| `burn_chance` | 2% | 5% | Percentage |
| `slow_chance` | 1% | 3% | Percentage |
| `freeze_chance` | 1% | 2% | Percentage |
| `bleed_potency` | 3% | 7% | Percentage |
| `poison_potency` | 3% | 7% | Percentage |
| `burn_potency` | 3% | 7% | Percentage |
| `slow_strength` | 2% | 5% | Percentage |
| `freeze_duration` | 2% | 5% | Percentage |
| `skill_*_boost` | 3% | 6% | Percentage |

Skill level affixes use the **zone-based +1/+2/+3 table** (see Section 4.1), not this formula.

#### Derivation Example

```
flat_attack at T4 (Ironhold):
  min = 2 × 6.5 = 13
  max = 6 × 6.5 = 39

crit_chance at T5 (Emberfell):
  min = 1% × 2.8 = 2.8%
  max = 2% × 2.8 = 5.6%

flat_max_hp at T7 (Voidrift):
  min = 8 × 30.0 = 240
  max = 20 × 30.0 = 600
```

> **NOTE:** These base values and multipliers are initial balance targets. The key principles:
> - Flat stats scale aggressively (~30x from T1 to T7) to keep items relevant
> - Percentage stats scale more gently (~4.5x) to prevent runaway multiplicative stacking
> - All values subject to adjustment during playtesting

### 4.3 Slot Weighting

When an item generates an affix, the category is selected first (weighted by slot), then a random affix within that category is chosen.

| Category | Weapon | Helmet | Chest | Gloves | Boots | Accessory |
|----------|--------|--------|-------|--------|-------|-----------|
| Offensive | 45% | 15% | 10% | 35% | 10% | 20% |
| Defensive | 10% | 35% | 50% | 10% | 25% | 20% |
| Utility | 10% | 20% | 15% | 10% | 40% | 20% |
| Status Chance | 20% | 10% | 10% | 25% | 10% | 20% |
| Status Potency | 10% | 10% | 10% | 15% | 10% | 10% |
| Skill Category | 5% | 10% | 5% | 5% | 5% | 10% |

**Reading this table:** A weapon has a 45% chance of rolling an offensive affix per affix slot. If offensive is selected, the specific affix within that category is chosen using **affix rarity weighting** (see Section 4.5).

**Accessory is the wildcard** — equal 20% across offense/defense/utility/status, making it the most flexible slot for completing a build.

### 4.5 Affix Rarity Weighting (Within Categories)

Not all affixes within a category are equally likely. Stronger affixes are rarer. When a category is selected, the specific affix is chosen using these weights.

#### Offensive (6 affixes)

| Affix | Weight | Relative Chance | Why |
|-------|--------|-----------------|-----|
| `flat_attack` | 25 | Common | Core physical stat |
| `flat_magic_power` | 25 | Common | Core magic stat |
| `crit_chance` | 18 | Uncommon | Universally useful |
| `crit_damage` | 18 | Uncommon | Strong with crit builds |
| `armor_pen` | 7 | Rare | Very strong vs tanks |
| `magic_pen` | 7 | Rare | Very strong vs tanks |

#### Defensive (5 affixes)

| Affix | Weight | Relative Chance | Why |
|-------|--------|-----------------|-----|
| `flat_armor` | 25 | Common | Core physical defense |
| `flat_magic_resist` | 25 | Common | Core magic defense |
| `flat_max_hp` | 22 | Common | Always useful |
| `flat_max_shield` | 15 | Uncommon | Status immunity makes it premium |
| `hp_regen` | 13 | Uncommon | Sustain is powerful |

#### Utility (4 affixes)

| Affix | Weight | Relative Chance | Why |
|-------|--------|-----------------|-----|
| `gold_find` | 28 | Common | Nice but not build-defining |
| `xp_bonus` | 28 | Common | Nice but not build-defining |
| `energy_gain` | 24 | Uncommon | Enables more skill use |
| `skill_cooldown` | 20 | Uncommon | CDR is very strong |

#### Status Chance (5 affixes)

| Affix | Weight | Relative Chance | Why |
|-------|--------|-----------------|-----|
| `bleed_chance` | 25 | Common | Standard physical DoT |
| `poison_chance` | 25 | Common | Standard physical DoT |
| `burn_chance` | 22 | Uncommon | Strong magic DoT |
| `slow_chance` | 18 | Uncommon | Soft CC |
| `freeze_chance` | 10 | Rare | Hard CC — extremely powerful |

#### Status Potency (5 affixes)

| Affix | Weight | Relative Chance | Why |
|-------|--------|-----------------|-----|
| `bleed_potency` | 25 | Common | Matches bleed chance rarity |
| `poison_potency` | 25 | Common | Matches poison chance rarity |
| `burn_potency` | 22 | Uncommon | Matches burn chance rarity |
| `slow_strength` | 18 | Uncommon | Matches slow chance rarity |
| `freeze_duration` | 10 | Rare | Matches freeze chance rarity |

#### Skill Category (36 affixes)

| Affix | Weight | Relative Chance | Why |
|-------|--------|-----------------|-----|
| `skill_speed_boost` | 14 | Common | % boost to category |
| `skill_power_boost` | 14 | Common | % boost to category |
| `skill_crit_boost` | 14 | Common | % boost to category |
| `skill_mage_boost` | 14 | Common | % boost to category |
| `skill_utility_boost` | 14 | Common | % boost to category |
| `skill_speed_level` | 5 | Rare | +level is very strong |
| `skill_power_level` | 5 | Rare | +level is very strong |
| `skill_crit_level` | 5 | Rare | +level is very strong |
| `skill_mage_level` | 5 | Rare | +level is very strong |
| `skill_utility_level` | 5 | Rare | +level is very strong |
| `skill_power_strike_level` | 2 | Very Rare | Individual skill boost |
| `skill_charge_up_level` | 2 | Very Rare | Individual skill boost |
| `skill_shatter_level` | 2 | Very Rare | Individual skill boost |
| `skill_flurry_level` | 2 | Very Rare | Individual skill boost |
| `skill_barrage_level` | 2 | Very Rare | Individual skill boost |
| `skill_momentum_level` | 2 | Very Rare | Individual skill boost |
| `skill_precision_level` | 2 | Very Rare | Individual skill boost |
| `skill_execute_level` | 2 | Very Rare | Individual skill boost |
| `skill_adrenaline_rush_level` | 2 | Very Rare | Individual skill boost |
| `skill_arcane_bolt_level` | 2 | Very Rare | Individual skill boost |
| `skill_chain_lightning_level` | 2 | Very Rare | Individual skill boost |
| `skill_overcharge_level` | 2 | Very Rare | Individual skill boost |
| `skill_energy_surge_level` | 2 | Very Rare | Individual skill boost |
| `skill_shield_bash_level` | 2 | Very Rare | Individual skill boost |
| `skill_life_tap_level` | 2 | Very Rare | Individual skill boost |
| `skill_click_mastery_level` | 2 | Very Rare | Individual skill boost |
| `skill_heavy_handed_level` | 2 | Very Rare | Individual skill boost |
| `skill_berserker_level` | 2 | Very Rare | Individual skill boost |
| `skill_focused_mind_level` | 2 | Very Rare | Individual skill boost |
| `skill_critical_flow_level` | 2 | Very Rare | Individual skill boost |
| `skill_vampiric_strikes_level` | 2 | Very Rare | Individual skill boost |
| `skill_combo_artist_level` | 2 | Very Rare | Individual skill boost |
| `skill_efficient_casting_level` | 2 | Very Rare | Individual skill boost |
| `skill_spell_weaver_level` | 2 | Very Rare | Individual skill boost |
| `skill_residual_energy_level` | 2 | Very Rare | Individual skill boost |
| `skill_all_level` | 1 | Ultra Rare | Build-defining, chase affix |

**Category weight breakdown:** Power boosts 70 (48%) + Category level 25 (17%) + Individual skill level 50 (34%) + All-skills level 1 (0.7%) = **146 total weight**.

Individual skill affixes are rare per-skill (~1.4% each within category), but collectively the 25 of them represent 34% of the skill category — so you'll see individual skill boosts fairly often, just not the one you want.

> **NOTE:** These weights are initial balance targets. The key principle is: **generically useful stats (flat attack, armor, HP) are common; powerful specialized stats (pen, freeze, +skill level) are rare.** This means most items have solid but unremarkable affixes, while truly special rolls create excitement.

### 4.6 Affix Rules

1. **No duplicate affixes** — an item cannot roll `flat_attack` twice
2. **Status chance and potency are separate affixes** — an item CAN have both `bleed_chance` and `bleed_potency` (same family, counts as 2 status affixes)
3. **Max 2 status affixes per item** — any combination of chance/potency, but max 2 total. This prevents junk items with 3+ unfocused status effects (e.g., bleed+poison+slow)
4. **Max 1 skill level affix per item** — cannot stack `skill_speed_level` and `skill_mage_level` on the same item. This applies to category level, individual skill level, and all-skills level affixes. Power boost affixes (+X%) are not restricted.
5. **`skill_all_level` cannot coexist with any other skill level affix** — if you roll `skill_all_level`, no other skill level affix is allowed (redundant with rule 4)
6. **Individual skill level affixes naturally cannot duplicate** — rule 1 covers this. An item cannot have two copies of `skill_flurry_level`. Combined with rule 4, an item gets exactly 0 or 1 skill level affix total.

---

## 5. Item Generation

### 5.1 Generation Flow

When an item drops or appears in the shop:

```
1. Determine ZONE TIER (from zone where it drops/is sold)
2. Determine SLOT (weapon/helmet/chest/gloves/boots/accessory)
3. Roll RARITY (weighted by source — see drop/shop tables)
4. Determine AFFIX COUNT (rarity max, with chance of max-1)
5. For each affix slot:
   a. Roll CATEGORY (using slot weighting table — Section 4.3)
   b. Roll AFFIX within category (using affix rarity weighting — Section 4.5)
   c. Validate against affix rules (no duplicates, status cap, skill level cap — Section 4.6)
   d. If invalid, re-roll from step 5a (max 10 retries, then skip affix)
   e. Roll VALUE:
      - For skill level affixes: use zone-based +1/+2/+3 table (Section 4.1)
      - For all other affixes: use tier formula (base × tier_multiplier, uniform random within range)
6. Generate NAME (see Section 12)
7. Calculate PRICES (buy/sell based on zone + rarity + affix quality)
8. Set REQUIRED LEVEL (zone-based minimum)
```

### 5.2 Required Level per Zone

| Zone | Required Level |
|------|---------------|
| Whisperwood | 1 |
| Dustwind | 10 |
| Shadowmire | 20 |
| Ironhold | 30 |
| Emberfell | 45 |
| Frostpeak | 60 |
| Voidrift | 75 |

### 5.3 Item Data Structure (Runtime)

```javascript
{
  // Identity
  id: 'item_uuid_12345',        // Unique generated ID
  name: 'Searing Blade of Precision',
  slot: 'weapon',
  zone: 'emberfell',            // Zone tier that generated it
  rarity: 'rare',
  requiredLevel: 45,
  emoji: '⚔️',

  // Affixes (array of rolled stats)
  affixes: [
    { id: 'flat_attack',   value: 42, tier: 5 },
    { id: 'crit_chance',   value: 0.05, tier: 5 },
    { id: 'burn_chance',   value: 0.11, tier: 5 }
  ],

  // Modification state
  reforgedAffix: null,           // Which affix ID has been selected for reforging (locks others)
  reforgeCount: 0,               // Times reforged (drives cost escalation)
  imbued: false,                 // Whether an affix was added via Imbue
  temperLevel: 0,                // 0-12
  temperSelections: [],          // Which affix was selected at levels 1, 5, 9
  temperBrickCount: 0,           // Times tempered total (for bricking — see Section 7.3)

  // Pricing
  buyPrice: 24000,
  sellPrice: 6000,

  // Legendary only
  legendaryId: null,             // References LEGENDARY_ITEMS definition
  uniqueEffect: null             // { id, description, ... }
}
```

---

## 6. Legendary Items

### 6.1 Design Philosophy

Legendaries are **hand-crafted, named items** with a unique effect that cannot appear on any other item. They are:
- The only items with fixed identities (name, art, unique effect)
- Still have 4 randomly rolled affixes (so each drop is different)
- Build-defining — the unique effect changes how you play
- Rare and exciting — chase goals for dedicated players

### 6.2 Complete Legendary List

15 legendaries total (2-3 per zone). Slot distribution: 4 weapons, 3 helmets, 2 chests, 2 gloves, 1 boots, 3 accessories.

| # | Name | Slot | Zone | Unique Effect |
|---|------|------|------|---------------|
| 1 | Whisperwood Heart | Accessory | 1 | Energy regen doubled while below 30% HP |
| 2 | Thornweave Wraps | Gloves | 1 | Bleed stacks deal 50% bonus damage to slowed targets |
| 3 | Sandstorm Fang | Weapon | 2 | Attacks hit twice at 60% damage each |
| 4 | Mirage Band | Accessory | 2 | 20% chance to dodge monster attacks (take 0 damage) |
| 5 | Venom Lord's Grip | Gloves | 3 | Poison stacks have no maximum limit |
| 6 | Shadowmire Cowl | Helmet | 3 | Status effect durations on monsters increased by 40% |
| 7 | Ironforge Crown | Helmet | 4 | Armor also applies as 50% Magic Resist |
| 8 | Titan's Greaves | Boots | 4 | While above 80% HP, gain 25% bonus damage |
| 9 | Embercaller's Staff | Weapon | 5 | Burn damage can critically strike |
| 10 | Ashen Plate | Chest | 5 | Taking fire damage heals instead (converts burn to HoT) |
| 11 | Frostbite Edge | Weapon | 6 | Critical hits freeze the target for 0.5s |
| 12 | Glacial Mantle | Chest | 6 | Shield regenerates 5% per second while not taking damage |
| 13 | Crown of the Void King | Helmet | 7 | Kills have 10% chance to fully restore shield |
| 14 | Soulreaver | Weapon | 7 | 5% of damage dealt is gained as shield |
| 15 | Void Eternal | Accessory | 7 | All skill cooldowns reduced by 1s on kill |

### 6.3 Legendary Affix Behavior
- 4 affixes roll randomly using the same zone tier and slot weighting as non-legendary items
- Legendaries dropped from scaled bosses use the **boss affix tier mapping** (see [Section 9.2](#92-boss-scaling)) for higher affix values
- The unique effect is always the same for that legendary — only the 4 affixes vary
- Legendaries CANNOT be Imbued (they always have 4 affixes)
- Legendaries CAN be Tempered and Reforged

### 6.4 Early Zone Legendaries vs Late Zone

Design approach: **unique effects are build-enabling regardless of zone. Affix numbers scale with zone.**

This means:
- Zone 1 legendary "Whisperwood Heart" has powerful energy synergy at any level
- But its 4 affixes roll at T1 ranges (small numbers)
- A player at level 70 might still use it for the unique effect while sacrificing raw stats
- This creates an interesting tradeoff: unique power vs raw stats from higher-zone epics

Boss scaling (see [Section 9.2](#92-boss-scaling)) allows higher-tier affix rolls on early-zone legendaries when the boss is fought at higher player levels.

---

## 7. Item Modification Systems

Three systems for investing gold into items. Each serves a different purpose.

### 7.1 Reforge

> *"I have a good item with one bad roll. Let me fix it."*

**How it works:**
1. Select an item with 2+ affixes
2. Choose ONE affix to reforge
3. All OTHER affixes are **permanently locked** (can never be reforged)
4. The selected affix re-rolls its value within the zone tier range
5. Can repeat on the same affix with escalating cost
6. The reforged affix can roll higher OR lower — it's a gamble

**Cost Formula:**
```
reforge_cost = base_cost × rarity_mult × (escalation ^ reforge_count)

base_cost (per zone):
  Zone 1: 200    Zone 2: 600     Zone 3: 1,500
  Zone 4: 4,000  Zone 5: 10,000  Zone 6: 25,000  Zone 7: 60,000

rarity_mult:
  Uncommon: 1.0x  Rare: 1.5x  Epic: 2.5x  Legendary: 4.0x

escalation: 2.2 (near-exponential)
```

**Example — Reforging a Rare item from Zone 5:**
```
Attempt 1: 10,000 × 1.5 × 2.2^0 = 15,000 gold
Attempt 2: 10,000 × 1.5 × 2.2^1 = 33,000 gold
Attempt 3: 10,000 × 1.5 × 2.2^2 = 72,600 gold
Attempt 4: 10,000 × 1.5 × 2.2^3 = 159,720 gold
Attempt 5: 10,000 × 1.5 × 2.2^4 = 351,384 gold
```

After 4-5 reforges it becomes extremely expensive. Player must decide if the item is worth continued investment.

**Rules:**
- Available on: Uncommon, Rare, Epic, Legendary
- NOT available on: Common (only 1 affix, nothing to lock)
- Once you select an affix to reforge, that choice is permanent for the item
- The lock icon appears on all other affixes to show they're frozen

### 7.2 Imbue

> *"My item dropped with fewer affixes than its rarity allows. Let me fill the gap."*

**How it works:**
1. Item must have fewer affixes than its rarity's maximum
2. Pay gold to add one affix to the empty slot
3. The new affix rolls randomly (category weighted by slot, then random within category)
4. You CANNOT choose what affix you get — it's a gamble
5. One-time operation per empty slot

**Cost:**
```
imbue_cost = zone_base × rarity_mult

zone_base:
  Zone 1: 500     Zone 2: 1,500   Zone 3: 4,000
  Zone 4: 10,000  Zone 5: 25,000  Zone 6: 60,000  Zone 7: 150,000

rarity_mult:
  Uncommon: 1.0x  Rare: 2.0x  Epic: 4.0x
```

**Example:** Imbuing a Rare from Zone 4 that dropped with 2/3 affixes:
```
Cost: 10,000 × 2.0 = 20,000 gold
Result: random 3rd affix added
```

**Rules:**
- Available on: Uncommon (if dropped with 1/2), Rare (if dropped with 2/3), Epic (if dropped with 3/4)
- NOT available on: Common (max is 1, always drops with 1), Legendary (always drops with 4)
- The imbued affix follows normal slot weighting and no-duplicate rules
- If item later gets Reforged, the imbued affix CAN be the reforge target

### 7.3 Temper

> *"My item is already great. Let me push it to perfection."*

**How it works:**
- 12 levels of tempering
- At **selection levels (1, 5, 9)**: system randomly picks one of the item's affixes as the "focus"
- At **boost levels (2-3-4, 6-7-8, 10-11-12)**: the focused affix is boosted by a percentage

**Boost Per Level:**
```
Cycle 1 (levels 1-4): +5% per boost level = +15% total
Cycle 2 (levels 5-8): +7% per boost level = +21% total
Cycle 3 (levels 9-12): +10% per boost level = +30% total
```

**Maximum boost to a single affix:**
- Single selection (1 cycle): +15%, +21%, or +30% depending on which cycle
- Double selection (2 cycles): +36%, +35%, or +51% depending on which two
- Triple selection (all 3 cycles): **+66%** — the dream

**Odds of triple-hit on a specific affix:**
- 4-affix item: (1/4)³ = 1.56%
- 3-affix item: (1/3)³ = 3.7%

**Cost Per Level:**
```
temper_cost = level_base × zone_mult × rarity_mult

level_base:
  Level 1: 1,000    Level 2: 1,500    Level 3: 2,000    Level 4: 3,000
  Level 5: 5,000    Level 6: 7,000    Level 7: 10,000   Level 8: 15,000
  Level 9: 25,000   Level 10: 35,000  Level 11: 50,000  Level 12: 75,000

  Total (all 12): 229,500 × zone_mult × rarity_mult

zone_mult:
  Zone 1: 0.3x  Zone 2: 0.5x   Zone 3: 0.8x   Zone 4: 1.0x
  Zone 5: 1.5x  Zone 6: 2.5x   Zone 7: 4.0x

rarity_mult:
  Rare: 1.0x  Epic: 1.5x  Legendary: 2.5x
```

**Reset:**
- Costs: **Free** (you already lose all temper progress)
- Wipes temper level back to 0, clears all selections and boosts
- All affix values return to their base (pre-temper) values
- Increases `temperBrickCount` by 1

**Bricking:**
- After a certain number of total temper attempts (resets), the item **bricks** and can no longer be tempered
- Brick threshold: **5 full resets** (so 6 total temper attempts including the final one)
- Once bricked, temper progress at time of bricking is kept — it just can't be reset/retried
- This prevents infinite gold-sink loops on a single item and encourages finding new gear

**Brick threshold: 5 full resets** — confirmed. Enough attempts to chase perfection, but forces commitment eventually.

**Rules:**
- Available on: Rare, Epic, Legendary only
- NOT available on: Common, Uncommon
- Temper applies AFTER reforging (so reforge first, temper second is optimal)
- Temper boost is calculated as percentage of the affix's current base value (not compounding)

---

## 8. Drop System

### 8.1 Drop Philosophy

Items should feel **rare and valuable**. The v1 problem was constant drops making loot trivial. v2 targets:

- Common drops: frequent enough to feel rewarding, mostly scrap fodder
- Uncommon: occasional upgrade candidate
- Rare: exciting, worth examining carefully
- Epic: an event — player stops to compare and consider
- Legendary: boss-exclusive, gated by materials, truly special

### 8.2 Monster Drop Rates

Every non-boss monster has a chance to drop an item on kill:

| Monster Rarity/Zone | Drop Chance | If Drop → Rarity Weights |
|---------------------|-------------|--------------------------|
| Zone 1 monsters | 8% | Common 70%, Uncommon 25%, Rare 5% |
| Zone 2 monsters | 7% | Common 65%, Uncommon 28%, Rare 7% |
| Zone 3 monsters | 6% | Common 60%, Uncommon 30%, Rare 8%, Epic 2% |
| Zone 4 monsters | 5% | Common 55%, Uncommon 30%, Rare 10%, Epic 5% |
| Zone 5 monsters | 5% | Common 50%, Uncommon 30%, Rare 12%, Epic 8% |
| Zone 6 monsters | 4% | Common 45%, Uncommon 30%, Rare 15%, Epic 10% |
| Zone 7 monsters | 4% | Common 40%, Uncommon 28%, Rare 18%, Epic 14% |

**Expected drops per 100 kills (Zone 5 example):**
- 5 drops total
- ~2.5 Common, ~1.5 Uncommon, ~0.6 Rare, ~0.4 Epic

### 8.3 Boss Drop Rates

Bosses have guaranteed drops plus legendary chance:

| Drop | Chance | Notes |
|------|--------|-------|
| Guaranteed Rare+ item | 100% | Rare 60%, Epic 35%, Legendary 5% |
| Second item (any) | 40% | Normal rarity weights |
| Boss material (own zone) | 100% | 2-4 materials returned |

**Legendary odds per boss kill: ~5%**

With material gating (see [Section 9](#9-boss-material-system)), this means roughly:
- ~100 monster kills to gather materials for 1 boss attempt (varies by zone)
- ~5% legendary per attempt
- Expected: **~2,000 monster kills per legendary** (zone-dependent)

### 8.4 Drop Slot Selection

When an item drops, the slot is selected randomly with even weighting:
- Weapon: 1/6
- Helmet: 1/6
- Chest: 1/6
- Gloves: 1/6
- Boots: 1/6
- Accessory: 1/6

The item generates using the current zone's tier for affix ranges.

---

## 9. Boss Material System

### 9.1 Zone Materials

Each zone has a unique material dropped by regular monsters. Materials are spent to challenge the zone boss.

| Zone | Material | Material Name | Base Drop Rate | Cost to Challenge Boss |
|------|----------|---------------|----------------|----------------------|
| Whisperwood | `mat_whisperwood` | Whisperwood Sap | ~10% per kill | 5 |
| Dustwind | `mat_dustwind` | Dustwind Crystal | ~8% per kill | 6 |
| Shadowmire | `mat_shadowmire` | Shadow Essence | ~7% per kill | 7 |
| Ironhold | `mat_ironhold` | Iron Core | ~6% per kill | 8 |
| Emberfell | `mat_emberfell` | Ember Shard | ~5% per kill | 9 |
| Frostpeak | `mat_frostpeak` | Frost Fragment | ~4% per kill | 10 |
| Voidrift | `mat_voidrift` | Void Particle | ~3% per kill | 12 |

#### Material Drop Rate Scaling

Previous zone drop rates decrease when the player unlocks new zones, naturally discouraging trivial farming without making it impossible.

```
effective_rate = base_rate × (0.7 ^ zones_above)
zones_above = highest_unlocked_zone_index - this_zone_index
```

**Example — Zone 1 (base 10%) as player progresses:**

| Highest Zone | zones_above | Effective Rate |
|-------------|-------------|----------------|
| Zone 1 | 0 | 10.0% |
| Zone 2 | 1 | 7.0% |
| Zone 3 | 2 | 4.9% |
| Zone 5 | 4 | 2.4% |
| Zone 7 | 6 | 1.2% |

The boss fight is still the real gate — this decay just prevents mindless speed-farming of Zone 1 materials at level 70. Combined with boss scaling (9.2), early-zone legendaries remain worth farming but require real engagement.

**Expected kills per boss attempt (at zone's own tier, no decay):**

| Zone | Drop Rate | Materials Needed | Expected Kills |
|------|-----------|-----------------|----------------|
| Whisperwood | 10% | 5 | ~50 |
| Dustwind | 8% | 6 | ~75 |
| Shadowmire | 7% | 7 | ~100 |
| Ironhold | 6% | 8 | ~133 |
| Emberfell | 5% | 9 | ~180 |
| Frostpeak | 4% | 10 | ~250 |
| Voidrift | 3% | 12 | ~400 |

Materials are stored in `player.materials` as a simple count object: `{ mat_whisperwood: 12, mat_dustwind: 3, ... }`.

### 9.2 Boss Scaling

**Problem:** Early zone bosses become trivial when revisited at high levels. A level 70 player one-shots the Whisperwood boss.

**Solution:** Boss level scales with player level.

```
boss_effective_level = max(boss_base_level, player_level - 5)
```

- Whisperwood boss base level: ~10
- Player at level 70: boss becomes level 65
- This means the boss is always a meaningful fight
- The `-5` buffer means the boss is slightly below player level (beatable but not trivial)

#### Boss HP and Damage Formulas

```
boss_hp = base_hp × (1 + 0.12 × boss_effective_level)
boss_damage = base_damage × (1 + 0.10 × boss_effective_level)
```

Where `base_hp` and `base_damage` are the boss's definition values at its base level. The HP scaling factor means a level 65 boss has ~8.8x the HP of a level 1 boss — significantly tankier but not unkillable.

#### Boss Legendary Affix Tier Mapping

When a boss drops a legendary, the affix tier is determined by the boss's effective level, mapped to the nearest zone tier:

```
affix_tier = clamp(1, 7, ceil(boss_effective_level / 14))
```

| Boss Effective Level | Affix Tier | Equivalent Zone |
|---------------------|-----------|-----------------|
| 1-14 | T1 | Whisperwood |
| 15-28 | T2 | Dustwind |
| 29-42 | T3 | Shadowmire |
| 43-56 | T4 | Ironhold |
| 57-70 | T5 | Emberfell |
| 71-84 | T6 | Frostpeak |
| 85-100 | T7 | Voidrift |

**Important implication:** Farming Zone 1 boss at player level 70 gives a Zone 1 legendary (with the Zone 1 unique effect) but with **T5 affix rolls** (because boss effective level is 65). The unique effect is Zone 1's, but the raw stats compete with late-game gear. This makes early-zone legendaries worth farming at any point in the game.

**Boss scaling affects:**
- Boss HP (scales with level — see formula above)
- Boss damage output (scales with level — see formula above)
- Boss affix tier for legendary drops (higher level = better affix rolls — see tier mapping)

**Boss scaling does NOT affect:**
- Which legendary can drop (always the zone's specific legendaries)
- The unique effect of the legendary (fixed)
- Material cost to challenge

### 9.3 Regular Monster Scaling

Zone monsters do NOT scale with player level. They remain at their fixed zone levels.

- This means early zone farming for materials is fast (monsters die quickly)
- The material grind is the gate, not the monster difficulty
- Players feel powerful when returning to early zones — that's satisfying
- Boss fights remain the meaningful challenge
- Material drop rate decay (see Section 9.1) prevents trivial farming from being too efficient

---

## 10. Inventory System

### 10.1 Inventory Cap

**Main Inventory: 30 slots**

This forces decisions:
- Can't hoard everything — must scrap (sell) or compare regularly
- Creates natural gold income from selling junk
- Inventory management is part of the gameplay loop

### 10.2 Overflow Stash

When inventory is full and an item drops:

1. Item goes to **Overflow Stash** (3 slots maximum)
2. Toast notification: "Inventory full! Item saved to overflow — make space soon!"
3. Overflow items are visible in a special section of inventory UI
4. Items in overflow CANNOT be equipped, reforged, or tempered — must move to main inventory first
5. To move from overflow: scrap or sell a main inventory item to make space, then tap overflow item

**If overflow is also full:**

6. New drop is **auto-scrapped** for gold value
7. Warning toast: "Overflow full! [Item Name] was auto-scrapped for [X] gold."
8. The gold is still granted — the player doesn't lose economic value

### 10.3 Inventory Sorting

Items can be sorted by:
- Slot (weapon → helmet → chest → gloves → boots → accessory)
- Rarity (legendary → epic → rare → uncommon → common)
- Zone tier (highest first)
- Newest first

### 10.4 Quick Compare

When tapping an inventory item:
- Show item stats
- Show currently equipped item in same slot side-by-side
- Green/red indicators for stat differences
- Buttons: Equip, Scrap, Reforge, Imbue, Temper (based on eligibility)

---

## 11. Shop v2

### 11.1 Shop Overhaul

The shop now sells **randomly generated items** (not fixed definitions):

| Aspect | v1 | v2 |
|--------|----|----|
| Items | Fixed definitions | Randomly generated with affixes |
| Slots shown | 3 | 4 |
| Refresh timer | 10 minutes | 15 minutes |
| Manual refresh | Escalating gold | Fixed cost per zone |
| Rarity weights | Common-heavy | Common/Uncommon only |
| Relevance | Often useless | Always current zone |

### 11.2 Shop Rarity Weights

| Rarity | Weight | Notes |
|--------|--------|-------|
| Common | 55% | Floor items, cheap |
| Uncommon | 35% | Decent options |
| Rare | 10% | Exciting shop find |
| Epic | 0% | Drops only |
| Legendary | 0% | Boss only |

**The shop is for filling gaps, not for best-in-slot.** Best items come from drops + crafting.

### 11.3 Shop Pricing

```
buy_price = zone_base × rarity_mult × affix_quality_mult

zone_base:
  Zone 1: 100     Zone 2: 400     Zone 3: 1,000
  Zone 4: 3,000   Zone 5: 8,000   Zone 6: 20,000  Zone 7: 50,000

rarity_mult:
  Common: 1.0x  Uncommon: 2.5x  Rare: 6.0x

affix_quality_mult: average(affix_value / tier_max) across all affixes
  Range: 0.7x (bad rolls) to 1.3x (great rolls)

sell_price = buy_price × 0.25
```

### 11.4 Manual Refresh Cost

Flat cost per zone (not escalating — removed the punishing escalation):

| Zone | Refresh Cost |
|------|-------------|
| Zone 1 | 200 |
| Zone 2 | 800 |
| Zone 3 | 2,000 |
| Zone 4 | 6,000 |
| Zone 5 | 15,000 |
| Zone 6 | 40,000 |
| Zone 7 | 100,000 |

Players can refresh the shop repeatedly but it costs meaningful gold each time. A minor gold sink alongside the major sinks (reforge, imbue, temper).

---

## 12. Item Naming

### 12.1 Naming Structure

**Non-legendary items** use generated names: `[Prefix] [Base Name] [Suffix]`

**Legendary items** have hand-crafted fixed names.

### 12.2 Base Names (Per Slot)

| Slot | Base Names |
|------|-----------|
| Weapon | Blade, Sword, Staff, Dagger, Mace, Wand, Axe, Hammer, Spear, Scepter |
| Helmet | Crown, Hood, Helm, Circlet, Mask, Visor, Cap, Diadem |
| Chest | Plate, Robe, Vest, Chainmail, Tunic, Hauberk, Mantle, Cuirass |
| Gloves | Gauntlets, Wraps, Grips, Bracers, Mitts, Handguards, Claws |
| Boots | Greaves, Sandals, Treads, Sabatons, Striders, Walkers, Stompers |
| Accessory | Ring, Amulet, Pendant, Charm, Talisman, Band, Brooch, Locket |

Base name is selected randomly on generation.

### 12.3 Prefixes (Hint at Strongest Offensive/Status Affix)

| Condition | Prefix Options |
|-----------|---------------|
| Highest affix is `flat_attack` | Brutal, Savage, Mighty, Heavy |
| Highest affix is `flat_magic_power` | Arcane, Mystic, Enchanted, Ethereal |
| Highest affix is `crit_chance` or `crit_damage` | Keen, Precise, Deadly, Razor |
| Highest affix is `armor_pen` or `magic_pen` | Piercing, Sundering, Rending, Breaching |
| Highest affix is `bleed_*` | Bleeding, Jagged, Serrated, Barbed |
| Highest affix is `poison_*` | Venomous, Toxic, Festering, Noxious |
| Highest affix is `burn_*` | Searing, Blazing, Scorching, Molten |
| Highest affix is `slow_*` or `freeze_*` | Frosted, Glacial, Chilling, Frozen |
| No offensive/status affixes | Sturdy, Reliable, Solid, Stalwart |

One prefix is randomly selected from the matching set.

### 12.4 Suffixes (Hint at Strongest Defensive/Utility Affix)

| Condition | Suffix Options |
|-----------|---------------|
| Has `flat_armor` | of Iron, of Stone, of the Fortress, of Warding |
| Has `flat_magic_resist` | of the Mind, of Warding, of Spirit, of Clarity |
| Has `flat_max_hp` | of the Bear, of Vitality, of the Giant, of Life |
| Has `flat_max_shield` | of the Aegis, of Protection, of the Barrier, of Shelter |
| Has `hp_regen` | of Mending, of Recovery, of Renewal, of the Healer |
| Has `gold_find` | of Greed, of Fortune, of Wealth, of the Merchant |
| Has `xp_bonus` | of Wisdom, of the Scholar, of Learning, of Growth |
| Has `energy_gain` | of Vigor, of Zeal, of the Dynamo, of Flow |
| Has `skill_cooldown` | of Haste, of Swiftness, of Alacrity, of Readiness |
| Has `skill_*_boost` | of Mastery, of Expertise, of the Adept, of Prowess |
| Has `skill_*_level` | of Ascendancy, of Transcendence, of the Sage, of Eminence |
| Has `skill_all_level` | of Omniscience, of the Paragon, of Perfection |
| No defensive/utility affixes | *(no suffix)* |

### 12.5 Rarity Prefix Override

Epic and Legendary items can override the standard prefix with a rarity-flavored one:

| Rarity | Optional Prefix Pool |
|--------|---------------------|
| Epic | Mythic, Abyssal, Celestial, Infernal, Primordial |
| Legendary | *(fixed name, no generated prefix)* |

**50% chance** for an Epic to use its rarity prefix instead of the stat-based one.

### 12.6 Examples

```
Common:   "Sturdy Vest of Iron"
Uncommon: "Venomous Dagger of Vigor"
Rare:     "Searing Gauntlets of the Bear"
Epic:     "Abyssal Crown of Mastery"
Epic:     "Deadly Greaves of Haste"  (stat prefix won the coin flip)
Legendary: "Frostbite Edge"  (fixed name)
```

---

## 13. Balance Targets

### 13.1 Gold Economy

Target gold flow per zone (rough estimates — needs playtesting):

| Zone | Avg Gold/Kill | Kills to Reforge (1st) | Kills to Imbue | Kills to Full Temper |
|------|---------------|----------------------|----------------|---------------------|
| 1 | ~10-20 | ~15 | ~30 | ~500 |
| 4 | ~200-400 | ~15 | ~30 | ~600 |
| 7 | ~2,000-4,000 | ~20 | ~40 | ~800 |

The first reforge should feel cheap (encouraging engagement). Full tempering should be a long-term gold investment.

### 13.2 Power Progression

Items should feel like meaningful upgrades when moving to a new zone:

```
Zone N+1 Common ≈ Zone N Uncommon (in raw stat value)
Zone N+1 Uncommon > Zone N Rare (slightly)
Zone N Legendary with great rolls ≈ Zone N+2 Epic (competitive due to unique effect)
```

### 13.3 Fight Duration Targets (from brainstorming)

These targets exist independently of the item system but items must be balanced around them:

| Phase | Duration Per Normal Monster |
|-------|-----------------------------|
| Early game (Zone 1-2) | 2-3 seconds |
| Mid game (Zone 3-5) | 5-8 seconds |
| Late game (Zone 6-7) | 8-15 seconds |
| Bosses | 30-60+ seconds |

Items contribute to player power but should not single-handedly break these targets. A well-geared player can be at the fast end of the range; a poorly-geared player at the slow end.

---

## 14. Weapon Damage Type

### 14.1 Weapon Base Name Determines Click Damage Type

The weapon's **base name** determines the damage type of basic (non-skill) clicks:

| Physical Weapons | Magic Weapons |
|------------------|---------------|
| Blade, Sword, Dagger, Mace, Axe, Hammer, Spear | Staff, Wand, Scepter |

### 14.2 Rules

- **Basic clicks** deal the equipped weapon's damage type
- **No weapon equipped** defaults to Physical damage
- **Skills** have their own `damageType` defined per skill — the weapon does NOT affect skill damage type
- Weapon choice influences which monster defense stat basic clicks hit (armor vs magic resist)
- Implementation: read `weapon.damageType` (derived from base name) in `handleClick()` instead of hardcoded `DAMAGE_TYPES.PHYSICAL`

### 14.3 Strategic Implications

- Physical weapon users deal basic click damage against armor — stronger vs low-armor/high-MR monsters
- Magic weapon users deal basic click damage against magic resist — stronger vs high-armor/low-MR monsters
- Skill damage type is independent, so a player with a physical weapon can still use mage skills for magic damage
- This creates a meaningful weapon choice beyond raw stats

---

## 15. Status Effect Proc Rules

### 15.1 Item Status Chance Procs on Skill Damage Only

Item status chance affixes (e.g., `bleed_chance: 12%`) proc on **skill damage only**, not basic clicks.

### 15.2 Rules

- When a skill deals damage, the system checks total equipped status chance (sum across all gear)
- **Roll once per skill use** — not per hit for multi-hit skills (e.g., Barrage rolls once, not per arrow)
- Basic clicks do **NOT** proc status effects from items
- This reinforces "skills matter" and prevents click-spam from trivializing status builds

### 15.3 Exception: Legendary Items

Legendary items or a very rare special affix could enable click-based proc as a unique effect.

Example: A legendary might have *"Basic clicks can trigger your equipped status effects at 25% effectiveness"* — but this would be a specific, unique legendary power, not a default mechanic.

### 15.4 Implementation

```
On skill damage:
  1. Calculate total status chance from all equipped items (e.g., 12% bleed from gloves + 8% from weapon = 20%)
  2. Roll once per status type that has >0% chance
  3. If triggered, apply status using standard status effect system
  4. Status potency affixes increase the applied effect's power
```

---

## 16. Skill Level from Items

### 16.1 Effective Level Calculation

`+level` affixes directly modify the skill's effective level at runtime:

```
effectiveLevel = player.unlockedSkills[id] + itemBonusLevels
```

Where `itemBonusLevels` is the sum of all applicable +level sources:
- Individual skill affix (e.g., `skill_flurry_level: +1`)
- Category level affix (e.g., `skill_speed_level: +2` applies to all Speed skills)
- All-skills level affix (`skill_all_level: +1` applies to every skill)

### 16.2 Rules

- Skill must be **unlocked AND equipped** for the bonus to apply
- **Can exceed max level 5** — beyond-max scaling applies (+20% per level over 5, see Section 4.1)
- Unequipping the item immediately removes the bonus level
- Stacks from multiple sources: category affix + individual affix + all-skills affix all add up
- Affix rule 4 (max 1 skill level affix per item) limits per-item stacking, but different items can each contribute

### 16.3 Implementation

Modify `skills.js` to compute effective level by adding item bonuses before looking up `levelData`:

```javascript
function getEffectiveSkillLevel(skillId) {
  const baseLevel = state.player.unlockedSkills[skillId] || 0;
  if (baseLevel === 0) return 0; // not unlocked
  const itemBonus = getItemSkillLevelBonus(skillId); // sum from all equipped items
  return baseLevel + itemBonus;
}
```

When effective level exceeds max (5), use the beyond-max formula:
```javascript
function getSkillStats(skillId, effectiveLevel) {
  const maxLevel = 5;
  if (effectiveLevel <= maxLevel) {
    return SKILLS[skillId].levelData[effectiveLevel];
  }
  const baseStats = SKILLS[skillId].levelData[maxLevel];
  const bonusLevels = effectiveLevel - maxLevel;
  // Apply +20% per bonus level to all numerical stats
  const multiplier = 1 + (0.20 * bonusLevels);
  return scaleStats(baseStats, multiplier);
}
```

---

## 17. UI/UX Outline

### 17.1 Equipment Screen

- 6 equipment slots arranged in a **2x3 or 3x2 grid** (mobile-friendly)
- Tap slot to see equipped item detail + unequip option
- Empty slots show ghost outline with slot name

### 17.2 Inventory Screen

- **Grid layout:** 5 columns x 6 rows = 30 slots
- Items color-coded by rarity border
- **Overflow stash:** 3 slots highlighted in red/amber below main grid
- **Sort buttons:** Slot / Rarity / Zone / Newest
- **Bulk action:** "Scrap All Common" button

### 17.3 Item Detail View

- Item name (colored by rarity)
- Slot + zone + required level
- All affixes listed with values
- Modification state: lock icons (reforged), imbue slot (if available), temper level bar
- **Compare panel:** currently equipped item in same slot shown side-by-side
- **Action buttons:** Equip / Scrap / Reforge / Imbue / Temper (contextual, shown only when eligible)

### 17.4 Modification Screens

- **Reforge:** select affix to target → confirm → animation → result
- **Imbue:** show empty slot → confirm → animation → reveal new affix
- **Temper:** show 12-level bar → level up → on selection levels show which affix was picked → confirm continue or reset

### 17.5 Boss Challenge UI

- Material count display on boss entry modal
- "Challenge Boss (costs X materials)" button
- Greyed out if insufficient materials

---

## 18. Resolved Decisions

Decisions made during design review:

| # | Topic | Decision |
|---|-------|----------|
| Q1 | Status affix conflict | **Max 2 status affixes per item** (any combination). Prevents unfocused junk items. See rule 3 in Section 4.6. |
| Q2 | Temper brick threshold | **5 resets.** Enough to chase, forces commitment. |
| Q3 | Material drop rate scaling | **Decay formula:** `effective_rate = base_rate × (0.7 ^ zones_above)`. Previous zone rates decrease as player unlocks new zones. See Section 9.1. |
| Q4 | Inventory cap | **30 main + 3 overflow.** Confirmed. |
| Q5 | Item power score | **Not needed.** Keep it simple, players compare stats directly. |
| Q6 | Starter items | **No starter items.** Player starts empty, finds gear through drops and shop. |
| Q7 | Sell value of modified items | **Base sell price only.** Modifications don't increase sell value. Gold sink works as intended. |
| Q8 | Full affix tier tables | **Scaling formula approach.** Base values at T1 with flat (up to 30x) and percentage (up to 4.5x) tier multipliers. See Section 4.2. |
| Q9 | Complete legendary item list | **15 legendaries** (2-3 per zone). Diverse slot and effect distribution. See Section 6.2. |
| Q10 | Weapon damage type | **Base name determines type.** Physical: Blade, Sword, Dagger, Mace, Axe, Hammer, Spear. Magic: Staff, Wand, Scepter. See Section 14. |
| Q11 | Status effect proc from items | **Skill damage only.** Basic clicks do not proc. Roll once per skill use. See Section 15. |
| Q12 | Skill level from items | **Direct level modification.** `effectiveLevel = base + itemBonus`. Can exceed max level 5 with +20%/level beyond-max scaling. See Section 16. |
| Q13 | Boss scaling formulas | **HP:** `base_hp × (1 + 0.12 × level)`. **Damage:** `base_damage × (1 + 0.10 × level)`. See Section 9.2. |
| Q14 | Boss legendary affix tier | **Map boss level to zone tier:** `ceil(boss_effective_level / 14)`. Level 65 boss → T5 affixes. See Section 9.2. |
| Q15 | UI/UX outline | **Defined.** Equipment grid, 5x6 inventory, compare panel, modification flows, boss challenge UI. See Section 17. |
| Q16 | Save migration strategy | **Complete v1 wipe.** Clear all items, expand to 6 slots, give gold compensation (50% of total buyPrice). See Section 19. |

**All design questions resolved. No remaining blockers for implementation.**

---

## 19. Migration from v1

### 19.1 What Changes
- 96 fixed items → removed (replaced by generation system)
- 3 equipment slots → 6 equipment slots
- Player inventory (array of item IDs) → array of generated item objects
- Item stats (fixed) → affix arrays with rolled values
- Monster loot tables (fixed item IDs) → drop chance + rarity weights
- Shop (fixed item pool) → randomly generated items

### 19.2 Save Migration (v4 → v5)

**Decision: Complete v1 item wipe with gold compensation.**

Migration steps:
1. Calculate gold compensation: `total buyPrice of all previously owned items × 0.5`
2. Grant compensation gold to player
3. Clear `player.equipment` → expand to 6 empty slots: `{ weapon: null, helmet: null, chest: null, gloves: null, boots: null, accessory: null }`
4. Clear `player.inventory` → empty array `[]`
5. Add `player.materials` → `{}`
6. Add `player.inventoryOverflow` → `[]`
7. Reset shop state
8. Save version: `v4` → `v5` (key: `clickoria_save_v5`)

### 19.3 Why Complete Wipe?

- Converting v1 items to v2 equivalents is complex and would produce weird hybrid items
- v1 items have fixed stats that don't map cleanly to the affix system
- Gold compensation (50% of buyPrice) gives players a head start on the new system
- Clean break is simpler to implement and test
- Players who haven't progressed far lose little; players who have progressed get meaningful gold to jumpstart item modification

---

*This document is the single source of truth for Item System v2 design. All implementation should reference this document. Update this document when design decisions change.*

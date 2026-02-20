# Realms of Clickoria - Master Specification Index

> **This is the single source of truth.** All other documents must align with definitions here.
> When in doubt, this document wins.

---

## Document Map

| Path | Purpose | Status |
|------|---------|--------|
| `docs/_INDEX.md` | Master reference (this file) | ✅ |
| **Schemas** | Data structure contracts | |
| `docs/schemas/player.schema.md` | Player state structure | ✅ |
| `docs/schemas/monster.schema.md` | Monster definition structure | ✅ |
| `docs/schemas/item.schema.md` | Item/equipment structure | ✅ |
| `docs/schemas/zone.schema.md` | Zone definition structure | ✅ |
| **Systems** | Game logic & formulas | |
| `docs/systems/combat.system.md` | Combat mechanics, monster types, damage | ✅ |
| `docs/systems/energy.system.md` | Energy resource system | ✅ |
| `docs/systems/health.system.md` | Player HP, damage, healing, death | ✅ |
| `docs/systems/loot.system.md` | Drop rates & reward calculation | ✅ |
| `docs/systems/progression.system.md` | XP, leveling, unlocks | ✅ |
| `docs/systems/economy.system.md` | Gold flow & pricing | ✅ |
| `docs/systems/tutorial.system.md` | Onboarding, tips, first-time bonuses | ✅ |
| `docs/systems/ascension.system.md` | Prestige system, permanent bonuses | ✅ |
| `docs/systems/ui.system.md` | User interface & screens | ✅ |
| **Architecture** | Code structure & standards | |
| `docs/architecture/architecture.md` | System architecture | ✅ |
| `docs/architecture/coding-standards.md` | Code conventions | ✅ |
| `docs/architecture/skill-architecture.md` | Skill system implementation guide | ✅ |
| **Data** | Actual game content | |
| `docs/data/zones.data.md` | All zone definitions | ✅ |
| `docs/data/monsters.data.md` | All monster definitions (with types) | ✅ |
| `docs/data/items.data.md` | Legacy v1 item definitions (superseded by v2) | ⚠️ |
| **Design** | Game design specifications | |
| `docs/design/skill-system-v2.md` | Skill system v2 design (canonical) | ✅ |
| `docs/design/item-system-v2.md` | Item system v2 design (canonical) | ✅ |
| `docs/design/item-system-v2-roadmap.md` | Item system v2 implementation roadmap | ✅ |
| **Architecture** (continued) | | |
| `docs/architecture/item-system-v2-architecture.md` | Item system v2 module structure & events | ✅ |
| **Balance** | Tuning & curves | |
| `docs/balance/curves.balance.md` | Scaling formulas & tables | ✅ |

---

## Global Constants

These values are referenced across multiple documents. **Change here = change everywhere.**

### Game Identity
```
GAME_NAME = "Realms of Clickoria"
VERSION = "1.0.0"
MAX_PLAYER_LEVEL = 100
```

### Timing (milliseconds)
```
AUTO_SAVE_INTERVAL = 30000      # 30 seconds
MONSTER_SPAWN_DELAY = 500       # 0.5 seconds after kill
DAMAGE_NUMBER_DURATION = 800    # Floating damage display
LEVEL_UP_CELEBRATION = 3500     # Level up screen duration
ENERGY_GAIN_COOLDOWN = 200      # 0.2s between Energy gains from clicks
```

### Combat Defaults
```
BASE_PLAYER_ATTACK = 5          # Starting attack power
BASE_CRIT_CHANCE = 0.05         # 5% base crit chance
BASE_CRIT_MULTIPLIER = 2.0      # Crits deal 2x damage
MIN_DAMAGE = 1                  # Minimum damage per click
```

### Health Defaults
```
BASE_PLAYER_HP = 100            # Starting max HP
HP_PER_LEVEL = 10               # +10 max HP per level
BASE_HP_REGEN = 0.015           # 1.5% HP regen per second (~66s to full heal)
HP_CAUTION_THRESHOLD = 0.5      # Yellow bar below 50%
HP_CRITICAL_THRESHOLD = 0.25    # Red bar below 25%
```

### Energy Defaults
```
MAX_ENERGY = 100                # Base Energy cap
ENERGY_PER_CLICK = 3            # Energy gained per click (v2)
ENERGY_ON_KILL = 10             # Energy gained on monster kill (v2)
ENERGY_ON_BOSS_KILL = 25        # Energy gained on boss kill (v2)
ENERGY_REGEN_PER_SECOND = 1     # Passive Energy regen (v2)
```

### Death Penalties
```
DEATH_GOLD_LOSS = 0.5           # Lose 50% gold on death
DEATH_RESPAWN_DELAY = 1500      # ms before respawn after death
```

### Economy Defaults
```
STARTING_GOLD = 0
SELL_PRICE_RATIO = 0.25         # Legacy v1 sell ratio
SELL_PRICE_RATIO_V2 = 0.25      # Scrap value = 25% of base buy price
```

### Equipment Slots (v2)
```
EQUIPMENT_SLOTS_V2 = ["weapon", "helmet", "chest", "gloves", "boots", "accessory"]
INVENTORY_MAX = 30              # Maximum inventory size
INVENTORY_OVERFLOW_MAX = 3      # Overflow slots for drops when inventory full
```

### Progression Defaults
```
STARTING_LEVEL = 1
BASE_XP_REQUIREMENT = 100       # XP needed for level 2
XP_GROWTH_RATE = 0.12           # 12% more XP per level
```

### Skill Defaults
```
ACTIVE_SKILL_SLOTS = 4          # Max equipped active skills
PASSIVE_SKILL_SLOTS = 3         # Max equipped passive skills
BASE_SKILL_MAX_LEVEL = 5        # Max skill level
TOTAL_SKILLS = 25               # Total skills in the game (15 active + 10 passive)
BEYOND_MAX_SKILL_BONUS_PER_LEVEL = 0.20  # +20% per skill level above 5 (from items)
```

### Skill Points System (v2)
```
SP_PER_LEVEL_INTERVAL = 3      # Gain 1 SP every 3 levels (3, 6, 9, ...)
SP_UNLOCK_COST = 1              # 1 SP to unlock most skills (Power Strike is free)
SP_UPGRADE_COST = 1             # 1 SP per upgrade level
RESPEC_COSTS = [1000, 3000, 8000, 20000, 50000, 100000]
SKILL_SWAP_COOLDOWN_PENALTY = 0.5  # 50% of base CD applied on equip
# Max SP first run: ~33 (levels 3 to 99)
```

### Vault System
```
VAULT_MAX_SLOTS = 8             # Maximum items stored in vault
VAULT_WITHDRAW_COST = 0.25      # 25% of buy price to withdraw
VAULT_SELL_RATIO = 0.25         # 25% of buy price when selling
```

### Ascension Defaults
```
ASCENSION_DAMAGE_BONUS = 0.05   # +5% damage per ascension
ASCENSION_GOLD_BONUS = 0.05     # +5% gold per ascension
ASCENSION_XP_BONUS = 0.05       # +5% XP per ascension
ASCENSION_HP_BONUS = 50         # +50 HP per ascension
ASCENSION_SP_BONUS = 3          # +3 starting Skill Points per ascension
```

### Item System v2

Full specification: `docs/design/item-system-v2.md`

#### Rarity Affix Counts
```
common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 4 (+ unique effect)
```

#### Affix System
```
Total affixes: 63
Categories: offensive (6), defensive (5), utility (4),
            statusChance (5), statusPotency (5), skillCategory (38)
MAX_STATUS_AFFIXES_PER_ITEM = 2
MAX_SKILL_LEVEL_AFFIXES_PER_ITEM = 1
AFFIX_REROLL_MAX_ATTEMPTS = 10
```

#### Tier Multipliers (T1–T7, maps to zone tier)
```
FLAT_TIER_MULTIPLIERS  = [1.0, 2.0, 3.8, 6.5, 11.0, 18.0, 30.0]
PERCENT_TIER_MULTIPLIERS = [1.0, 1.3, 1.7, 2.2, 2.8, 3.6, 4.5]
ZONE_TIERS = { whisperwood:1, dustwind:2, shadowmire:3, ironhold:4,
               emberfell:5, frostpeak:6, voidrift:7 }
```

#### Crafting
```
Reforge: re-roll one affix (escalating cost × 2.2)
Imbue: add one affix to items with fewer than rarity max (one-time)
Temper: 12 levels in 3 cycles of 4, boost selected affix 5%/7%/10%
TEMPER_BRICK_THRESHOLD = 5     # Full resets before item bricks
```

#### Materials
```
ZONE_MATERIALS: whisperwood(Sap, 10%, boss 5) → voidrift(Void Particle, 3%, boss 12)
MATERIAL_DECAY_FACTOR = 0.7    # effective_rate = base_rate × 0.7^(zones_above)
```

#### Boss Scaling
```
BOSS_HP_SCALING_FACTOR = 0.12   # boss_hp = base_hp × (1 + 0.12 × level)
BOSS_DAMAGE_SCALING_FACTOR = 0.10
BOSS_LEVEL_BUFFER = 5           # boss level = max(baseLv, playerLv - 5)
BOSS_AFFIX_TIER_DIVISOR = 14    # affix tier = ceil(level / 14)
```

#### Shop v2
```
SHOP_SLOTS_V2 = 4
SHOP_REFRESH_INTERVAL_V2 = 900000  # 15 minutes
SHOP_RARITY_WEIGHTS_V2 = { common:55, uncommon:35, rare:10, epic:0, legendary:0 }
SHOP_REFRESH_COSTS = { whisperwood:200 → voidrift:100000 }
```

#### Drop Rates
```
DROP_CHANCE_BY_ZONE = { whisperwood:0.04 → voidrift:0.02 }
BOSS_DROP_RARITY_WEIGHTS = { rare:60, epic:35, legendary:5 }
BOSS_SECOND_DROP_CHANCE = 0.40
BOSS_MATERIAL_RETURN = { min:2, max:4 }
```

#### Legendary Effects (14 balance constants)
```
DOUBLE_HIT_MULT = 0.6           DODGE_CHANCE = 0.2
STATUS_DURATION_BONUS = 0.4     ARMOR_TO_MR_RATIO = 0.5
HIGH_HP_THRESHOLD = 0.8         HIGH_HP_DAMAGE_BONUS = 0.25
LOW_HP_THRESHOLD = 0.3          BLEED_SLOW_BONUS = 0.5
CRIT_FREEZE_DURATION = 0.5      SHIELD_REGEN_RATE = 0.05
SHIELD_REGEN_IDLE_TIME = 3.0    KILL_SHIELD_CHANCE = 0.1
DAMAGE_TO_SHIELD_RATIO = 0.05   CDR_ON_KILL = 1.0
```

---

## Rarity System

Used by: Items, Monsters (future), Loot drops

| ID | Name | Color (Hex) | Drop Weight | Stat Multiplier |
|----|------|-------------|-------------|-----------------|
| `common` | Common | `#9d9d9d` (gray) | 70 | 1.0x |
| `uncommon` | Uncommon | `#1eff00` (green) | 20 | 1.5x |
| `rare` | Rare | `#0070dd` (blue) | 8 | 2.0x |
| `epic` | Epic | `#a335ee` (purple) | 1.8 | 3.0x |
| `legendary` | Legendary | `#ff8000` (orange) | 0.2 | 5.0x |

**Drop Weight Calculation:**
```
Total weight = 70 + 20 + 8 + 1.8 + 0.2 = 100
P(common) = 70/100 = 70%
P(legendary) = 0.2/100 = 0.2%
```

---

## Stat Definitions

All stats used in the game. Referenced by: Player, Items, Skills, Monsters

### Core Combat Stats

| Stat ID | Display Name | Description | Base Value | Stacks |
|---------|--------------|-------------|------------|--------|
| `attack` | Attack | Physical damage per click | 5 | Additive |
| `magicPower` | Magic Power | Magic damage scaling | 0 | Additive |
| `critChance` | Crit Chance | % chance for critical hit | 0.05 (5%) | Additive |
| `critDamage` | Crit Damage | Multiplier on critical | 2.0 (200%) | Additive |
| `armorPen` | Armor Pen | Flat armor ignored | 0 | Additive |
| `magicPen` | Magic Pen | Flat magic resist ignored | 0 | Additive |

### Defensive Stats

| Stat ID | Display Name | Description | Base Value | Stacks |
|---------|--------------|-------------|------------|--------|
| `maxHP` | Max HP | Flat bonus to max HP | 0 | Additive |
| `hpRegen` | HP Regen | % HP regeneration per second | 0.015 (1.5%) | Additive |
| `armor` | Armor | Physical damage reduction (formula-based) | level-based | Additive |
| `magicResist` | Magic Resist | Magic damage reduction (formula-based) | level-based | Additive |
| `maxShield` | Max Shield | Maximum shield capacity | 0 | Additive |

### Utility Stats

| Stat ID | Display Name | Description | Base Value | Stacks |
|---------|--------------|-------------|------------|--------|
| `goldFind` | Gold Find | % bonus gold from kills | 0 (0%) | Additive |
| `xpBonus` | XP Bonus | % bonus XP from kills | 0 (0%) | Additive |
| `energyGain` | Energy Gain | % bonus Energy from clicks/kills | 0 (0%) | Additive |
| `cooldownReduction` | CDR | % cooldown reduction on skills | 0 (0%) | Additive |

### Status Effect Stats (from item affixes)

| Stat ID | Display Name | Description |
|---------|--------------|-------------|
| `bleedChance` | Bleed Chance | % chance to apply bleed on skill damage |
| `poisonChance` | Poison Chance | % chance to apply poison on skill damage |
| `burnChance` | Burn Chance | % chance to apply burn on skill damage |
| `slowChance` | Slow Chance | % chance to apply slow on skill damage |
| `freezeChance` | Freeze Chance | % chance to apply freeze on skill damage |
| `bleedPotency` | Bleed Potency | % bonus to bleed damage |
| `poisonPotency` | Poison Potency | % bonus to poison damage |
| `burnPotency` | Burn Potency | % bonus to burn damage |
| `slowPotency` | Slow Potency | % bonus to slow duration |
| `freezePotency` | Freeze Potency | % bonus to freeze duration |

### Defense Formula
```
reduction = defense / (defense + DEFENSE_SCALING_FACTOR)
DEFENSE_SCALING_FACTOR = 100
BASE_ARMOR_PER_LEVEL = 1
BASE_MAGIC_RESIST_PER_LEVEL = 1
```

**Stacking Rules:**
- `Additive`: Sum all sources. Example: 5 base attack + 10 weapon + 3 skill = 18 total

---

## Zone Progression

Linear progression through 7 zones. Each zone has level requirements and a boss gate.

| Order | Zone ID | Name | Level Range | Unlock Condition |
|-------|---------|------|-------------|------------------|
| 1 | `whisperwood` | Whisperwood Glen | 1-10 | Starting zone |
| 2 | `dustwind` | Dustwind Plains | 10-20 | Defeat `boss_mossback` |
| 3 | `shadowmire` | Shadowmire Swamp | 20-30 | Defeat `boss_redfang` |
| 4 | `ironhold` | Ironhold Peaks | 30-45 | Defeat `boss_mire_mother` |
| 5 | `emberfell` | Emberfell Wastes | 45-60 | Defeat `boss_grimstone` |
| 6 | `frostpeak` | Frostpeak Summit | 60-75 | Defeat `boss_pyrax` |
| 7 | `voidrift` | The Void Rift | 75-100 | Defeat `boss_glacielle` |

---

## ID Naming Conventions

Consistent naming for all game entities.

| Entity | Pattern | Examples |
|--------|---------|----------|
| Zone | `{zonename}` | `whisperwood`, `dustwind` |
| Monster | `{zone}_{name}` | `whisperwood_sprite`, `dustwind_bandit` |
| Boss | `boss_{name}` | `boss_mossback`, `boss_redfang` |
| Item (v2) | `item_{timestamp}_{random}` (UUID) | `item_1708905432_7a3f` |
| Skill | `{name}` | `power_strike`, `execute`, `flurry` |

## Monster Types

| Type ID | Mechanic | First Zone |
|---------|----------|------------|
| `normal` | Standard HP, no special mechanic | Whisperwood (Zone 1) |
| `swift` | Escape timer, damages player on escape | Dustwind (Zone 2) |
| `aggressive` | Attack cycle, damages player if clicked during attack | Dustwind (Zone 2) |
| `regenerating` | Regenerates HP over time | Shadowmire (Zone 3) |
| `armored` | Flat damage reduction per hit | Ironhold (Zone 4) |
| `shielded` | Shield bar, damage reduction while shielded | Ironhold (Zone 4) |

Bosses are always `aggressive` and may have a secondary type (e.g., `aggressive+armored`).

---

## Formula Quick Reference

Detailed explanations in respective system docs.

### XP to Next Level
```javascript
xpToNextLevel = floor(BASE_XP_REQUIREMENT * (1 + XP_GROWTH_RATE) ^ (level - 1))
```

### Damage Calculation
```javascript
baseDamage = player.attack
isCrit = random() < player.critChance
damage = isCrit ? floor(baseDamage * player.critDamage) : baseDamage
finalDamage = max(damage, MIN_DAMAGE)
```

### Gold Drop
```javascript
baseGold = monster.goldMin + random(monster.goldMax - monster.goldMin)
bonusGold = floor(baseGold * player.goldFind)
totalGold = baseGold + bonusGold
```

### XP Drop
```javascript
baseXP = monster.xpMin + random(monster.xpMax - monster.xpMin)
bonusXP = floor(baseXP * player.xpBonus)
totalXP = baseXP + bonusXP
```

---

## Save Data Version

For future migration support.

```
SAVE_KEY = "clickoria_save_v5"
SAVE_VERSION = 5
```

**Version History:**
- v1: Initial release
- v2: Added HP, Energy, skills, ascension, tutorial state
- v3: Equipment system expansion
- v4: Skill System v2 (SP replaces MP, new skill schema)
- v5: Item System v2 (6 slots, random affixes, materials, crafting; complete item wipe + gold compensation)

Save structure defined in `schemas/player.schema.md`.

---

## Implementation Priority

MVP (Version 1.0):

1. ✅ Specifications complete
2. ✅ Core click combat loop
3. ✅ Monster spawning & death (with 6 types)
4. ✅ Gold & XP rewards
5. ✅ Player leveling
6. ✅ Player HP and Energy system
7. ✅ Skill system v2 (15 active + 10 passive, SP-based)
8. ✅ All 7 zones with bosses
9. ✅ Status effect system (bleed, poison, burn, slow, freeze)
10. ✅ Damage/defense type system (physical + magic)
11. ✅ Item system v2 (6 slots, random affixes, crafting, legendaries)
12. ✅ Tutorial system
13. [ ] Save/Load hardening
14. [ ] Mobile-responsive UI polish

Remaining:
- [ ] Ascension/Prestige system
- [ ] Sound effects
- [ ] Accessibility pass
- [ ] PWA support

---

## Cross-Reference Checklist

When modifying any document, verify:

- [ ] IDs match naming conventions
- [ ] Stats use defined stat IDs
- [ ] Zones use defined zone IDs
- [ ] Rarities use defined rarity IDs
- [ ] Formulas match system docs
- [ ] Numbers are within balance curves

---

*Last updated: Phase 12 (Item System v2) complete*

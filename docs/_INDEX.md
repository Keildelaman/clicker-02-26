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
| `docs/data/items.data.md` | All item definitions (with new stats) | ✅ |
| **Design** | Game design specifications | |
| `docs/design/skill-system-v2.md` | Skill system v2 design (canonical) | ✅ |
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
LEVEL_UP_CELEBRATION = 2000     # Level up screen duration
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
DEATH_LEVEL_MILESTONE = 10      # Reset to nearest 10 (1, 10, 20, etc)
```

### Economy Defaults
```
STARTING_GOLD = 0
SELL_PRICE_RATIO = 0.25         # Sell items for 25% of buy price
```

### Equipment Slots
```
EQUIPMENT_SLOTS = ["weapon", "armor", "accessory"]  # 3 equipment slots
INVENTORY_CAPACITY = unlimited  # No artificial limit on inventory
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
BASE_SKILL_MAX_LEVEL = 5        # Max skill level (before ascension)
ASCENDED_SKILL_MAX_LEVEL = 10   # Max skill level (with ascension)
TOTAL_SKILLS = 25               # Total skills in the game (15 active + 10 passive)
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

| Stat ID | Display Name | Description | Base Value | Stacks |
|---------|--------------|-------------|------------|--------|
| `attack` | Attack | Damage per click | 5 | Additive |
| `critChance` | Crit Chance | % chance for critical hit | 0.05 (5%) | Additive |
| `critDamage` | Crit Damage | Multiplier on critical | 2.0 (200%) | Additive |
| `goldFind` | Gold Find | % bonus gold from kills | 0 (0%) | Additive |
| `xpBonus` | XP Bonus | % bonus XP from kills | 0 (0%) | Additive |
| `maxHP` | Max HP | Flat bonus to max HP | 0 | Additive |
| `hpRegen` | HP Regen | % HP regeneration per second | 0.015 (1.5%) | Additive |
| `damageReduction` | Damage Reduction | % damage reduced from monsters | 0 (0%) | Multiplicative |
| `energyGain` | Energy Gain | % bonus Energy from clicks/kills | 0 (0%) | Additive |
| `armorPen` | Armor Penetration | Flat armor ignored on armored monsters | 0 | Additive |

**Stacking Rules:**
- `Additive`: Sum all sources. Example: 5 base attack + 10 weapon + 3 skill = 18 total
- `Multiplicative`: Multiply together. Example: 50% Iron Skin + 10% item = 1 - (0.5 × 0.9) = 55% total reduction

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
| Item | `{type}_{zone}_{rarity}_{number}` | `weapon_whisperwood_common_01` |
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
SAVE_VERSION = 4
```

**Version History:**
- v1: Initial release
- v2: Added HP, Energy, skills, ascension, tutorial state
- v3: Equipment system expansion
- v4: Skill System v2 (SP replaces MP, new skill schema)

Save structure defined in `schemas/player.schema.md`.

---

## Implementation Priority

MVP (Version 1.0) must include:

1. ✅ Specifications complete
2. [ ] Core click combat loop
3. [ ] Monster spawning & death (with 6 types)
4. [ ] Gold & XP rewards
5. [ ] Player leveling
6. [ ] Player HP and Energy system
7. [ ] Skill system (active + passive)
8. [ ] All 7 zones with bosses
9. [ ] Shop with weapons and accessories
10. [ ] Save/Load system
11. [ ] Mobile-responsive UI
12. [ ] Tutorial system

Post-MVP (v1.1):
- Equipment drops from monsters
- Sound effects
- Advanced monster AI patterns

Future (v2.0):
- Ascension/Prestige system (specs complete, implementation later)
- Achievements
- Offline progress
- PWA support

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

*Last updated: Session start*
*Next: Define schemas for each entity type*

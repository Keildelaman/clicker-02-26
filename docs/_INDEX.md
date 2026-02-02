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
| `docs/schemas/skill.schema.md` | Skill definition structure | ✅ |
| **Systems** | Game logic & formulas | |
| `docs/systems/combat.system.md` | Combat mechanics & formulas | ✅ |
| `docs/systems/loot.system.md` | Drop rates & reward calculation | ✅ |
| `docs/systems/progression.system.md` | XP, leveling, unlocks | ✅ |
| `docs/systems/economy.system.md` | Gold flow & pricing | ✅ |
| **Data** | Actual game content | |
| `docs/data/zones.data.md` | All zone definitions | ✅ |
| `docs/data/monsters.data.md` | All monster definitions | ✅ |
| `docs/data/items.data.md` | All item definitions | ✅ |
| `docs/data/skills.data.md` | All skill definitions | ✅ |
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
```

### Combat Defaults
```
BASE_PLAYER_ATTACK = 5          # Starting attack power
BASE_CRIT_CHANCE = 0.05         # 5% base crit chance
BASE_CRIT_MULTIPLIER = 2.0      # Crits deal 2x damage
MIN_DAMAGE = 1                  # Minimum damage per click
```

### Economy Defaults
```
STARTING_GOLD = 0
SELL_PRICE_RATIO = 0.25         # Sell items for 25% of buy price
```

### Progression Defaults
```
STARTING_LEVEL = 1
BASE_XP_REQUIREMENT = 100       # XP needed for level 2
XP_GROWTH_RATE = 0.12           # 12% more XP per level
STAT_POINTS_PER_LEVEL = 1       # Skill points gained per level
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
| `autoAttack` | Auto Attack | Clicks per second | 0 | Additive |
| `maxHealth` | Max Health | Player max HP (future) | 100 | Additive |
| `defense` | Defense | Damage reduction (future) | 0 | Additive |

**Stacking Rules:**
- `Additive`: Sum all sources. Example: 5 base attack + 10 weapon + 3 skill = 18 total
- `Multiplicative` (future): Multiply together. Example: 1.1 × 1.2 = 1.32 (32% bonus)

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
| Skill Active | `skill_active_{name}` | `skill_active_power_strike` |
| Skill Passive | `skill_passive_{name}` | `skill_passive_sharp_blades` |

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
SAVE_VERSION = 1
```

Save structure defined in `schemas/player.schema.md`.

---

## Implementation Priority

MVP (Version 1.0) must include:

1. ✅ Core click combat loop
2. ✅ Monster spawning & death
3. ✅ Gold & XP rewards
4. ✅ Player leveling
5. ✅ 3 zones (Whisperwood, Dustwind, Shadowmire)
6. ✅ Basic weapons (shop purchase)
7. ✅ Save/Load system
8. ✅ Mobile-responsive UI

Post-MVP:
- Skills system
- All 7 zones
- Equipment rarities & drops
- Boss battles
- Achievements
- Sound effects
- Prestige system

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

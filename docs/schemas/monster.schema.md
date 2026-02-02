# Monster Schema

> Defines the structure for all monsters and bosses in the game.

## Overview

Monsters are the core enemies players click to defeat. Each monster has stats, rewards, and belongs to a specific zone.

---

## Complete Schema

```typescript
interface Monster {
  // === Identity ===
  id: string;                   // Unique identifier (see naming convention)
  name: string;                 // Display name
  description: string;          // Flavor text (shown on hover/tap-hold)

  // === Classification ===
  zone: string;                 // Zone ID where this monster appears
  isBoss: boolean;              // Is this a zone boss?

  // === Level Scaling ===
  levelMin: number;             // Minimum spawn level
  levelMax: number;             // Maximum spawn level

  // === Combat Stats ===
  baseHealth: number;           // HP at levelMin
  healthPerLevel: number;       // Additional HP per level above min

  // === Rewards ===
  goldMin: number;              // Minimum gold drop
  goldMax: number;              // Maximum gold drop
  goldPerLevel: number;         // Additional gold per level
  xpMin: number;                // Minimum XP reward
  xpMax: number;                // Maximum XP reward
  xpPerLevel: number;           // Additional XP per level

  // === Loot Table (future) ===
  lootTable: LootEntry[];       // Possible item drops

  // === Visuals ===
  emoji: string;                // Display emoji (MVP)
  sprite: string | null;        // Sprite path (future)
  deathEmoji: string;           // Shown on death

  // === Spawn Weight ===
  spawnWeight: number;          // Relative spawn chance in zone
}

interface LootEntry {
  itemId: string;               // Item that can drop
  chance: number;               // 0.0 to 1.0 drop chance
}
```

---

## Field Details

### Identity Fields

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| `id` | string | Unique, follows naming convention | `"whisperwood_sprite"` |
| `name` | string | 1-50 characters | `"Forest Sprite"` |
| `description` | string | 1-200 characters | `"A mischievous nature spirit..."` |

### Classification Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `zone` | string | Required | Must match valid zone ID |
| `isBoss` | boolean | `false` | Bosses have special mechanics |

**Boss Differences:**
- Only one per zone
- Doesn't respawn after defeated (unlocks next zone)
- Higher stats multiplier
- Guaranteed special loot
- Special death animation

### Level Scaling

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `levelMin` | number | 1-100 | Should match zone level range |
| `levelMax` | number | 1-100 | Must be >= levelMin |

**Level Assignment:**
When spawning, monster level is randomly chosen between levelMin and levelMax.
```javascript
monsterLevel = randomInt(levelMin, levelMax);
```

### Combat Stats

| Field | Type | Min | Notes |
|-------|------|-----|-------|
| `baseHealth` | number | 1 | HP at minimum level |
| `healthPerLevel` | number | 0 | Extra HP per level |

**Health Calculation:**
```javascript
health = baseHealth + (healthPerLevel * (monsterLevel - levelMin));
```

**Example:**
- Forest Sprite: baseHealth=25, healthPerLevel=5, levelMin=1
- At level 1: 25 + (5 × 0) = 25 HP
- At level 5: 25 + (5 × 4) = 45 HP

### Reward Fields

| Field | Type | Min | Notes |
|-------|------|-----|-------|
| `goldMin` | number | 0 | Minimum base gold |
| `goldMax` | number | 0 | Maximum base gold (>= goldMin) |
| `goldPerLevel` | number | 0 | Bonus gold per level |
| `xpMin` | number | 1 | Minimum base XP |
| `xpMax` | number | 1 | Maximum base XP (>= xpMin) |
| `xpPerLevel` | number | 0 | Bonus XP per level |

**Gold Calculation:**
```javascript
baseGold = randomInt(goldMin, goldMax);
levelBonus = goldPerLevel * (monsterLevel - levelMin);
totalGold = baseGold + levelBonus;
// Then apply player goldFind bonus
```

**XP Calculation:**
```javascript
baseXP = randomInt(xpMin, xpMax);
levelBonus = xpPerLevel * (monsterLevel - levelMin);
totalXP = baseXP + levelBonus;
// Then apply player xpBonus
```

### Loot Table

```typescript
lootTable: [
  { itemId: "weapon_whisperwood_common_01", chance: 0.10 },  // 10% drop
  { itemId: "weapon_whisperwood_uncommon_01", chance: 0.02 } // 2% drop
]
```

- Each entry is rolled independently
- Monster can drop multiple items
- Bosses have guaranteed drops (chance: 1.0)
- Empty array = no item drops

### Visual Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `emoji` | string | Required | Single emoji for MVP display |
| `sprite` | string \| null | `null` | Future: path to sprite image |
| `deathEmoji` | string | `"💀"` | Shown briefly on death |

**Emoji Guidelines:**
- Use nature/creature emojis
- Should be visually distinct within zone
- Examples: 🌿🐗🐺🌳 (Whisperwood)

### Spawn Weight

| Field | Type | Default | Range |
|-------|------|---------|-------|
| `spawnWeight` | number | `10` | 1-100 |

**Spawn Calculation:**
```javascript
// Sum all weights in zone
totalWeight = zone.monsters.reduce((sum, m) => sum + m.spawnWeight, 0);

// Roll for spawn
roll = random() * totalWeight;
cumulativeWeight = 0;
for (monster of zone.monsters) {
  cumulativeWeight += monster.spawnWeight;
  if (roll < cumulativeWeight) {
    return monster;
  }
}
```

**Weight Guidelines:**
- Common monsters: 20-30
- Uncommon monsters: 10-15
- Rare monsters: 5-8
- Bosses: N/A (spawned explicitly)

---

## Runtime Monster Instance

When a monster spawns, create an instance:

```typescript
interface MonsterInstance {
  definitionId: string;         // Reference to Monster.id
  level: number;                // Rolled level
  maxHealth: number;            // Calculated max HP
  currentHealth: number;        // Current HP (starts at max)
  goldReward: number;           // Pre-calculated gold
  xpReward: number;             // Pre-calculated XP
}
```

---

## Example Monsters

### Regular Monster
```javascript
{
  id: "whisperwood_sprite",
  name: "Forest Sprite",
  description: "A mischievous nature spirit that flickers between the trees.",
  zone: "whisperwood",
  isBoss: false,
  levelMin: 1,
  levelMax: 5,
  baseHealth: 25,
  healthPerLevel: 5,
  goldMin: 2,
  goldMax: 5,
  goldPerLevel: 1,
  xpMin: 8,
  xpMax: 12,
  xpPerLevel: 2,
  lootTable: [
    { itemId: "weapon_whisperwood_common_01", chance: 0.05 }
  ],
  emoji: "🧚",
  sprite: null,
  deathEmoji: "✨",
  spawnWeight: 25
}
```

### Boss Monster
```javascript
{
  id: "boss_mossback",
  name: "Old Mossback",
  description: "An ancient treant who has guarded Whisperwood for centuries. His bark is thick with age and fury.",
  zone: "whisperwood",
  isBoss: true,
  levelMin: 10,
  levelMax: 10,
  baseHealth: 500,
  healthPerLevel: 0,
  goldMin: 100,
  goldMax: 150,
  goldPerLevel: 0,
  xpMin: 200,
  xpMax: 250,
  xpPerLevel: 0,
  lootTable: [
    { itemId: "weapon_whisperwood_rare_01", chance: 1.0 }  // Guaranteed
  ],
  emoji: "🌳",
  sprite: null,
  deathEmoji: "🪵",
  spawnWeight: 0  // Not random spawned
}
```

---

## Validation Rules

1. `id` must be unique across all monsters
2. `id` must follow naming convention: `{zone}_{name}` or `boss_{name}`
3. `zone` must reference valid zone ID
4. `levelMin` <= `levelMax`
5. `levelMin` >= zone's `levelMin`
6. `levelMax` <= zone's `levelMax`
7. `goldMax` >= `goldMin`
8. `xpMax` >= `xpMin`
9. `emoji` must be a valid emoji character
10. If `isBoss`, only one boss per zone

---

## Monster Balance Guidelines

See `balance/curves.balance.md` for detailed formulas.

**General Principles:**
- Early zones: Kill in 5-15 clicks
- Mid zones: Kill in 15-40 clicks
- Late zones: Kill in 40-100 clicks
- Bosses: 100-500 clicks (with current gear)

**Reward Scaling:**
- XP should allow ~10-20 kills per level (early game)
- Gold should allow upgrades every 20-50 kills

---

*Referenced by: combat.js, monsters.js, zones.js*
*References: _INDEX.md, zone.schema.md, item.schema.md*

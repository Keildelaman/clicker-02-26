# Player Schema

> Defines the complete player state structure. This is what gets saved/loaded.

## Overview

The player object contains all persistent state: identity, progression, stats, inventory, and unlocks.

---

## Complete Schema

```typescript
interface Player {
  // === Meta ===
  saveVersion: number;          // For migration support
  createdAt: number;            // Unix timestamp of first save
  lastSavedAt: number;          // Unix timestamp of last save
  totalPlayTime: number;        // Milliseconds of active play

  // === Identity ===
  name: string;                 // Player-chosen name (default: "Hero")

  // === Progression ===
  level: number;                // Current level (1-100)
  xp: number;                   // Current XP (resets on level up)
  xpToNextLevel: number;        // Calculated, cached for display
  totalXpEarned: number;        // Lifetime XP (for stats)

  // === Currency ===
  gold: number;                 // Current gold
  totalGoldEarned: number;      // Lifetime gold (for stats)
  totalGoldSpent: number;       // Lifetime spent (for stats)

  // === Combat Stats ===
  stats: {
    attack: number;             // Base attack power
    critChance: number;         // 0.0 to 1.0 (0% to 100%)
    critDamage: number;         // Multiplier (2.0 = 200%)
    goldFind: number;           // 0.0 to X (0% to X%)
    xpBonus: number;            // 0.0 to X (0% to X%)
    autoAttack: number;         // Clicks per second
  };

  // === Equipment ===
  equipment: {
    weapon: string | null;      // Item ID or null
    armor: string | null;       // Item ID or null (future)
    accessory: string | null;   // Item ID or null (future)
  };

  // === Inventory ===
  inventory: string[];          // Array of owned Item IDs

  // === Skills ===
  skillPoints: number;          // Unspent skill points
  skills: {
    [skillId: string]: {
      level: number;            // Current skill level (0 = not unlocked)
      lastUsed: number | null;  // Timestamp for cooldown (active skills)
    };
  };

  // === Zone Progress ===
  currentZone: string;          // Zone ID where player is
  unlockedZones: string[];      // Array of unlocked Zone IDs
  bossesDefeated: string[];     // Array of defeated Boss IDs

  // === Statistics ===
  statistics: {
    totalClicks: number;        // Lifetime clicks
    totalKills: number;         // Lifetime monster kills
    totalBossKills: number;     // Lifetime boss kills
    highestDamage: number;      // Highest single hit
    totalCriticals: number;     // Lifetime critical hits
    timePlayed: number;         // Total milliseconds played
  };
}
```

---

## Field Details

### Meta Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `saveVersion` | number | `1` | Save format version for migrations |
| `createdAt` | number | `Date.now()` | When save was first created |
| `lastSavedAt` | number | `Date.now()` | Last save timestamp |
| `totalPlayTime` | number | `0` | Accumulated play time in ms |

### Identity Fields

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `name` | string | `"Hero"` | 1-20 characters, alphanumeric + spaces |

### Progression Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `level` | number | `1` | Min: 1, Max: 100 (MAX_PLAYER_LEVEL) |
| `xp` | number | `0` | Resets to 0 on level up |
| `xpToNextLevel` | number | `100` | Calculated via formula |
| `totalXpEarned` | number | `0` | Never resets |

### Currency Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `gold` | number | `0` | Can only be >= 0 |
| `totalGoldEarned` | number | `0` | Never decreases |
| `totalGoldSpent` | number | `0` | Never decreases |

### Stats Object

| Stat | Type | Default | Range | Source |
|------|------|---------|-------|--------|
| `attack` | number | `5` | 1 - ∞ | Base + Equipment + Skills |
| `critChance` | number | `0.05` | 0.0 - 1.0 | Base + Equipment + Skills |
| `critDamage` | number | `2.0` | 1.0 - ∞ | Base + Equipment + Skills |
| `goldFind` | number | `0.0` | 0.0 - ∞ | Equipment + Skills |
| `xpBonus` | number | `0.0` | 0.0 - ∞ | Equipment + Skills |
| `autoAttack` | number | `0.0` | 0.0 - 100.0 | Skills only |

### Equipment Object

| Slot | Type | Default | Accepts |
|------|------|---------|---------|
| `weapon` | string \| null | `null` | Item IDs with type `weapon` |
| `armor` | string \| null | `null` | Item IDs with type `armor` |
| `accessory` | string \| null | `null` | Item IDs with type `accessory` |

### Inventory

- Type: `string[]`
- Default: `[]`
- Contains: Item IDs of owned items (not equipped)
- Max size: `100` items (MVP), expandable later

### Skills Object

```typescript
skills: {
  "skill_passive_sharp_blades": { level: 3, lastUsed: null },
  "skill_active_power_strike": { level: 1, lastUsed: 1699999999999 }
}
```

- `level: 0` means skill is visible but not unlocked
- `lastUsed` is only used for active skills with cooldowns

### Zone Progress

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `currentZone` | string | `"whisperwood"` | Must be in unlockedZones |
| `unlockedZones` | string[] | `["whisperwood"]` | Grows as bosses defeated |
| `bossesDefeated` | string[] | `[]` | Tracks completed bosses |

### Statistics Object

All statistics are lifetime values, never reset (until prestige system).

| Stat | Type | Default |
|------|------|---------|
| `totalClicks` | number | `0` |
| `totalKills` | number | `0` |
| `totalBossKills` | number | `0` |
| `highestDamage` | number | `0` |
| `totalCriticals` | number | `0` |
| `timePlayed` | number | `0` |

---

## Default New Player

```javascript
const DEFAULT_PLAYER = {
  saveVersion: 1,
  createdAt: Date.now(),
  lastSavedAt: Date.now(),
  totalPlayTime: 0,

  name: "Hero",

  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalXpEarned: 0,

  gold: 0,
  totalGoldEarned: 0,
  totalGoldSpent: 0,

  stats: {
    attack: 5,
    critChance: 0.05,
    critDamage: 2.0,
    goldFind: 0.0,
    xpBonus: 0.0,
    autoAttack: 0.0
  },

  equipment: {
    weapon: null,
    armor: null,
    accessory: null
  },

  inventory: [],

  skillPoints: 0,
  skills: {},

  currentZone: "whisperwood",
  unlockedZones: ["whisperwood"],
  bossesDefeated: [],

  statistics: {
    totalClicks: 0,
    totalKills: 0,
    totalBossKills: 0,
    highestDamage: 0,
    totalCriticals: 0,
    timePlayed: 0
  }
};
```

---

## Calculated Properties

These are derived from the player state, not stored:

```javascript
// Total attack including equipment and skills
function getTotalAttack(player) {
  let total = player.stats.attack;
  // Add equipment bonuses
  // Add skill bonuses
  return total;
}

// Check if can afford purchase
function canAfford(player, cost) {
  return player.gold >= cost;
}

// Check if zone is unlocked
function isZoneUnlocked(player, zoneId) {
  return player.unlockedZones.includes(zoneId);
}
```

---

## Save/Load Considerations

### LocalStorage Key
```
SAVE_KEY = "clickoria_save_v1"
```

### Save Format
```javascript
// Save
localStorage.setItem(SAVE_KEY, JSON.stringify(player));

// Load
const player = JSON.parse(localStorage.getItem(SAVE_KEY));
```

### Migration
When `saveVersion` doesn't match current version, run migration:
```javascript
function migrate(oldSave) {
  if (oldSave.saveVersion === 1) {
    // Already current
    return oldSave;
  }
  // Future: handle older versions
}
```

---

## Validation Rules

Before saving, validate:

1. `level` is between 1 and MAX_PLAYER_LEVEL
2. `xp` is >= 0
3. `gold` is >= 0
4. `stats.critChance` is between 0.0 and 1.0
5. All IDs in `equipment` exist in item definitions or are null
6. All IDs in `inventory` exist in item definitions
7. All IDs in `unlockedZones` exist in zone definitions
8. `currentZone` is in `unlockedZones`

---

*Referenced by: storage.js, game.js, ui.js*
*References: _INDEX.md (global constants), item.schema.md, zone.schema.md, skill.schema.md*

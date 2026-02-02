# Zone Schema

> Defines the structure for all game zones/areas.

## Overview

Zones are the game's world regions. Players progress through zones linearly, each with unique monsters, items, and a boss gate to the next zone.

---

## Complete Schema

```typescript
interface Zone {
  // === Identity ===
  id: string;                   // Unique identifier
  name: string;                 // Display name
  description: string;          // Flavor text / lore

  // === Progression ===
  order: number;                // Zone order (1-7)
  levelMin: number;             // Minimum level for zone
  levelMax: number;             // Maximum level for zone

  // === Unlock ===
  unlockCondition: UnlockCondition;

  // === Content ===
  monsters: string[];           // Monster IDs that spawn here
  bossId: string;               // Boss monster ID
  items: string[];              // Item IDs available in this zone

  // === Visuals ===
  theme: ZoneTheme;
  emoji: string;                // Zone icon
  backgroundCSS: string;        // CSS gradient/color for background
}

interface UnlockCondition {
  type: "default" | "boss" | "level";
  bossId?: string;              // Required if type is "boss"
  level?: number;               // Required if type is "level"
}

interface ZoneTheme {
  primary: string;              // Primary color (hex)
  secondary: string;            // Secondary color (hex)
  accent: string;               // Accent color (hex)
  atmosphere: string;           // Description for mood
}
```

---

## Field Details

### Identity Fields

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| `id` | string | Unique, lowercase | `"whisperwood"` |
| `name` | string | 1-50 characters | `"Whisperwood Glen"` |
| `description` | string | 1-500 characters | Full zone lore text |

### Progression Fields

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `order` | number | 1-7 | Display and progression order |
| `levelMin` | number | 1-100 | Recommended minimum level |
| `levelMax` | number | 1-100 | Monsters won't exceed this |

**Zone Progression Table:**

| Order | Zone ID | Level Range |
|-------|---------|-------------|
| 1 | `whisperwood` | 1-10 |
| 2 | `dustwind` | 10-20 |
| 3 | `shadowmire` | 20-30 |
| 4 | `ironhold` | 30-45 |
| 5 | `emberfell` | 45-60 |
| 6 | `frostpeak` | 60-75 |
| 7 | `voidrift` | 75-100 |

### Unlock Condition

```typescript
unlockCondition: {
  type: "default" | "boss" | "level",
  bossId?: string,
  level?: number
}
```

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `default` | Always unlocked (starting zone) | None |
| `boss` | Unlock by defeating a boss | `bossId` |
| `level` | Unlock at certain level (alternative) | `level` |

**Examples:**
```javascript
// Starting zone
{ type: "default" }

// Unlock after boss
{ type: "boss", bossId: "boss_mossback" }

// Level-based unlock (future alternative)
{ type: "level", level: 50 }
```

### Content Fields

| Field | Type | Notes |
|-------|------|-------|
| `monsters` | string[] | Array of Monster IDs |
| `bossId` | string | Single Boss Monster ID |
| `items` | string[] | Array of Item IDs sold/dropped here |

**Content Rules:**
- `monsters` should contain 4-6 regular monsters
- `bossId` must reference a monster with `isBoss: true`
- `items` should contain items for all rarities
- All IDs must exist in respective data files

### Visual Fields

| Field | Type | Example |
|-------|------|---------|
| `emoji` | string | `"🌲"` |
| `backgroundCSS` | string | `"linear-gradient(180deg, #2d5a27 0%, #1a3518 100%)"` |

### Theme Object

| Field | Type | Usage |
|-------|------|-------|
| `primary` | string (hex) | Main UI elements |
| `secondary` | string (hex) | Secondary elements |
| `accent` | string (hex) | Highlights, buttons |
| `atmosphere` | string | Mood description for AI/future |

---

## Zone Themes Reference

| Zone | Primary | Secondary | Accent | Atmosphere |
|------|---------|-----------|--------|------------|
| Whisperwood | `#2d5a27` | `#1a3518` | `#90EE90` | Peaceful, dappled sunlight |
| Dustwind | `#c2a366` | `#8b7355` | `#FFD700` | Windy, golden, frontier |
| Shadowmire | `#2d4a3e` | `#1a2f28` | `#00ff88` | Eerie, foggy, dark |
| Ironhold | `#5a5a5a` | `#3d3d3d` | `#87CEEB` | Rocky, echoing, ancient |
| Emberfell | `#8b2500` | `#4a1200` | `#ff4500` | Hot, dangerous, volcanic |
| Frostpeak | `#a5c7d3` | `#7ba3b3` | `#00BFFF` | Cold, pristine, silent |
| Voidrift | `#2d1b4e` | `#1a0f2e` | `#9370DB` | Otherworldly, chaotic |

---

## Example Zone Definition

```javascript
{
  id: "whisperwood",
  name: "Whisperwood Glen",
  description: "A peaceful forest where new adventurers take their first steps. Ancient oaks tower overhead, their leaves whispering secrets of old. The creatures here are wary but not yet corrupted by the Void's influence.",

  order: 1,
  levelMin: 1,
  levelMax: 10,

  unlockCondition: {
    type: "default"
  },

  monsters: [
    "whisperwood_sprite",
    "whisperwood_boar",
    "whisperwood_wolf",
    "whisperwood_treant"
  ],
  bossId: "boss_mossback",

  items: [
    "weapon_whisperwood_common_01",
    "weapon_whisperwood_common_02",
    "weapon_whisperwood_uncommon_01",
    "weapon_whisperwood_rare_01",
    "accessory_whisperwood_common_01",
    "accessory_whisperwood_uncommon_01"
  ],

  theme: {
    primary: "#2d5a27",
    secondary: "#1a3518",
    accent: "#90EE90",
    atmosphere: "Peaceful forest, dappled sunlight, rustling leaves"
  },

  emoji: "🌲",
  backgroundCSS: "linear-gradient(180deg, #2d5a27 0%, #1a3518 100%)"
}
```

---

## Zone Navigation Rules

### Traveling Between Zones
1. Player can only travel to unlocked zones
2. Changing zones is instant (no travel time)
3. Monster spawns change to new zone's pool
4. UI theme updates to new zone's theme

### Zone Selection UI
```
┌─────────────────────────────┐
│ SELECT ZONE                 │
├─────────────────────────────┤
│ 🌲 Whisperwood Glen    ✓    │  ← Current (highlighted)
│ 🌾 Dustwind Plains    ✓    │  ← Unlocked
│ 🌫️ Shadowmire Swamp   🔒    │  ← Locked (boss not killed)
│ ⛰️ Ironhold Peaks     🔒    │
│ 🌋 Emberfell Wastes   🔒    │
│ ❄️ Frostpeak Summit   🔒    │
│ 🌀 The Void Rift      🔒    │
└─────────────────────────────┘
```

---

## Boss Mechanics

### Boss Encounter
- Boss spawns when player clicks "Fight Boss" button
- Boss only available if player level >= zone's levelMin
- Boss is a single fight (doesn't respawn during attempt)
- If player dies (future), boss resets

### Boss Defeat
1. Award XP and gold
2. Drop guaranteed loot
3. Add `bossId` to `player.bossesDefeated`
4. Add next zone to `player.unlockedZones`
5. Show celebration UI
6. Enable travel to next zone

### Boss Respawn (for farming)
- Bosses respawn 24 hours after defeat (future feature)
- Or can be re-fought with "Challenge" button
- No zone unlock reward on re-fights

---

## Validation Rules

1. `id` must be unique across all zones
2. `id` must be lowercase, no spaces
3. `order` must be unique (1-7)
4. `levelMin` < `levelMax`
5. Zone N's `levelMin` should equal Zone N-1's `levelMax` (smooth progression)
6. All `monsters` IDs must exist in monster data
7. `bossId` must exist in monster data with `isBoss: true`
8. All `items` IDs must exist in item data
9. Colors must be valid hex codes
10. `unlockCondition.bossId` must match previous zone's `bossId`

---

## Zone Difficulty Scaling

See `balance/curves.balance.md` for formulas.

**Per-Zone Multipliers:**

| Zone | HP Mult | Damage Mult | Gold Mult | XP Mult |
|------|---------|-------------|-----------|---------|
| Whisperwood | 1.0x | 1.0x | 1.0x | 1.0x |
| Dustwind | 2.5x | 2.0x | 2.0x | 1.8x |
| Shadowmire | 5.0x | 3.5x | 3.5x | 3.0x |
| Ironhold | 10x | 6.0x | 6.0x | 5.0x |
| Emberfell | 20x | 10x | 10x | 8.0x |
| Frostpeak | 40x | 18x | 18x | 14x |
| Voidrift | 80x | 30x | 30x | 24x |

---

*Referenced by: zones.js, game.js, ui.js*
*References: _INDEX.md, monster.schema.md, item.schema.md*

# Player Schema

> Defines the complete player state structure. This is what gets saved/loaded.

## Overview

The player object contains all persistent state: identity, progression, equipment, inventory, materials, skills, zones, ascension, and settings. Stats are computed at runtime from base values + equipment + buffs (not stored).

---

## Complete Schema

```typescript
interface Player {
  // === Meta ===
  saveVersion: number;          // Current: 5
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

  // === Health & Energy ===
  hp: number;                   // Current HP
  maxHP: number;                // Calculated max HP (base + level + equipment)
  energy: number;               // Current Energy (0-100)
  maxEnergy: number;            // Max Energy (100)

  // === Equipment (v2 — 6 object slots) ===
  equipment: {
    weapon: Item | null;        // Full item object or null
    helmet: Item | null;
    chest: Item | null;
    gloves: Item | null;
    boots: Item | null;
    accessory: Item | null;
  };

  // === Inventory (v2 — item objects, not IDs) ===
  inventory: Item[];            // Array of item objects (max 30)
  inventoryOverflow: Item[];    // Overflow slots for drops (max 3)

  // === Materials ===
  materials: {                  // Zone materials for boss challenges
    [materialId: string]: number;  // e.g. { mat_whisperwood: 5 }
  };

  // === Skill System (v2 — SP-based) ===
  skillPoints: number;          // Current available SP
  totalSPEarned: number;        // Lifetime SP earned
  respecCount: number;          // Times respecced (drives cost escalation)
  unlockedSkills: {             // Map of skill ID → level (not an array)
    [skillId: string]: number;  // e.g. { power_strike: 1, flurry: 3 }
  };
  equippedActive: (string | null)[];    // 4 slots for active skills
  equippedPassive: (string | null)[];   // 3 slots for passive skills
  skillCooldowns: {             // Tick-based cooldowns in seconds
    [skillId: string]: number;  // Decremented by dt each tick
  };

  // === Zone Progress ===
  currentZone: string;          // Zone ID where player is
  unlockedZones: string[];      // Array of unlocked Zone IDs
  bossesDefeated: string[];     // Array of defeated Boss IDs
  zoneKills: {                  // Kill counts per zone
    [zoneId: string]: number;
  };

  // === Ascension ===
  ascension: {
    level: number;              // Current ascension level (0 = never ascended)
    totalAscensions: number;    // Lifetime count
    damageBonus: number;        // Permanent % bonus
    goldBonus: number;          // Permanent % bonus
    xpBonus: number;            // Permanent % bonus
    flatHP: number;             // Permanent flat HP bonus
    fastestRun: number | null;  // Fastest time to 100 (ms)
    history: AscensionRecord[]; // Past ascension records
  };

  // === Vault (for ascension) ===
  vault: Item[];                // Item objects stored in vault (max 8)

  // === Statistics ===
  statistics: {
    totalClicks: number;
    totalKills: number;
    totalBossKills: number;
    highestDamage: number;
    totalCriticals: number;
    timePlayed: number;
    totalDeaths: number;
    totalHealingDone: number;
    totalDamageTaken: number;
  };

  // === Settings ===
  settings: {
    soundVolume: number;        // 0.0-1.0
    musicVolume: number;        // 0.0-1.0
    showDamageNumbers: boolean;
    screenShake: boolean;
    autoSave: boolean;
  };

  // === Tutorial State ===
  tutorial: {
    completed: {                // Map of tutorial flag → boolean
      [flagId: string]: boolean;
    };
    tipsShown: number;
    lastTipTime: number | null;
    tutorialEnabled: boolean;
  };
}

interface AscensionRecord {
  level: number;
  timestamp: number;
  runTime: number;
}
```

---

## Runtime State (Not Saved)

These fields exist in `game-state.js` during gameplay but are NOT persisted:

```typescript
interface RuntimeState {
  player: Player;                       // The saved player object

  // === Combat ===
  currentMonster: MonsterInstance | null;
  combatState: 'idle' | 'spawning' | 'active' | 'dying' | 'waiting' | 'dead';
  overkillCarry: number;                // Overflow damage for overkill chains

  // === UI ===
  currentScreen: string;                // 'combat' | 'shop' | 'skills' | etc.

  // === Skill v2 Runtime ===
  activeBuffs: {                        // Map of skill ID → buff state
    [skillId: string]: {
      remaining: number;                // Seconds remaining
      effects: { [key: string]: any };  // Buff-specific effect data
    };
  };
  hitModifier: {                        // Single queued hit modifier (consumed on click)
    skillId: string;
    multiplier: number;
  } | null;
  clickModifiers: {                     // Per-click modifiers with charges
    [skillId: string]: { charges: number };
  };
  toggleStates: {                       // Active toggle skills
    [skillId: string]: {
      active: boolean;
      stacks: number;
      // ... toggle-specific state
    };
  };
  channelState: {                       // Active channel skill
    skillId: string;
    startTime: number;
    // ... channel-specific state
  } | null;
  playerShield: {                       // Temporary shield from skills
    amount: number;
    maxAmount: number;
    remaining: number;
  } | null;
  passiveStates: {                      // Passive-specific runtime state
    [skillId: string]: { /* varies */ };
  };
  lastClickTime: number;                // performance.now() of last combat click

  // === Item v2 Runtime ===
  computedStats: { [stat: string]: number }; // Cached stat totals
  equipmentStats: { [stat: string]: number }; // Sum of equipment affixes
  shopItems: Item[];                    // Current shop inventory (regenerated)
  activeLegendaryEffects: Set<string>;  // Active legendary effect IDs (rebuilt from equipment)
}
```

---

## Default New Player

From `js/systems/player.js` → `createNewPlayer()`:

```javascript
const DEFAULT_PLAYER = {
  saveVersion: 5,
  createdAt: Date.now(),
  lastSavedAt: Date.now(),
  totalPlayTime: 0,

  name: 'Hero',

  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalXpEarned: 0,

  gold: 0,
  totalGoldEarned: 0,
  totalGoldSpent: 0,

  hp: 100,         // BASE_PLAYER_HP
  maxHP: 100,
  energy: 0,
  maxEnergy: 100,  // MAX_ENERGY

  equipment: {
    weapon: null, helmet: null, chest: null,
    gloves: null, boots: null, accessory: null
  },
  inventory: [],
  inventoryOverflow: [],
  materials: {},

  skillPoints: 0,
  totalSPEarned: 0,
  respecCount: 0,
  unlockedSkills: { 'power_strike': 1 },   // Power Strike free at level 1
  equippedActive: ['power_strike', null, null, null],
  equippedPassive: [null, null, null],
  skillCooldowns: {},

  currentZone: 'whisperwood',
  unlockedZones: ['whisperwood'],
  bossesDefeated: [],
  zoneKills: {},

  ascension: {
    level: 0,
    totalAscensions: 0,
    damageBonus: 0,
    goldBonus: 0,
    xpBonus: 0,
    flatHP: 0,
    fastestRun: null,
    history: []
  },

  vault: [],

  statistics: {
    totalClicks: 0,
    totalKills: 0,
    totalBossKills: 0,
    highestDamage: 0,
    totalCriticals: 0,
    timePlayed: 0,
    totalDeaths: 0,
    totalHealingDone: 0,
    totalDamageTaken: 0
  },

  settings: {
    soundVolume: 0.8,
    musicVolume: 0.5,
    showDamageNumbers: true,
    screenShake: false,
    autoSave: true
  },

  tutorial: {
    completed: {},
    tipsShown: 0,
    lastTipTime: null,
    tutorialEnabled: true
  }
};
```

---

## Stat Computation

Stats are computed at runtime, not stored. `getComputedStats()` in `player.js` aggregates:

1. **Base stats** from level (attack + level bonuses, armor/MR per level)
2. **Equipment stats** summed from all equipped item affixes (`equipmentStats`)
3. **Passive skill bonuses** (stat-only passives like heavy_handed, berserker)
4. **Active buffs** (temporary multipliers from skills)
5. **Ascension bonuses** (permanent % bonuses)

The stat cache is invalidated on equip/unequip, level-up, skill change, buff change, or HP change (for berserker conditional).

---

## HP Calculation

```javascript
maxHP = BASE_PLAYER_HP + (HP_PER_LEVEL * (level - 1))
       + ascension.flatHP
       + equipmentBonus('maxHP')
```

---

## Skill System (v2)

### Key differences from v1
- `unlockedSkills` is a **map** `{ id: level }`, not an array
- Skill IDs have **no prefix**: `'power_strike'` not `'skill_power_strike'`
- `skillPoints` replaces `masteryPoints` (earned every 3 levels)
- `equippedActive`/`equippedPassive` (not `equippedActiveSkills`/`equippedPassiveSkills`)
- Cooldowns are tick-based seconds in `skillCooldowns`, not timestamps

### Equip
```javascript
function equipActiveSkill(skillId, slotIndex) {
  // slotIndex: 0-3
  // skillId must exist in unlockedSkills
  // Apply SKILL_SWAP_COOLDOWN_PENALTY (50% of base CD) on equip
}
```

### Unlock & Upgrade
```javascript
function unlockSkill(skillId) {
  // Costs 1 SP, requires player level >= skill.unlockLevel
  // Adds to unlockedSkills map at level 1
}
function upgradeSkill(skillId) {
  // Costs 1 SP per level, max level 5
  // Increments unlockedSkills[skillId]
}
```

### Respec
```javascript
function respecSkills() {
  // Cost: RESPEC_COSTS[min(respecCount, 5)]
  // [1000, 3000, 8000, 20000, 50000, 100000]
  // Refunds all SP, clears all unlocks/equips, cleans up passives
}
```

---

## Save/Load

### LocalStorage Key
```
SAVE_KEY = "clickoria_save_v5"
```

### Migration Chain
```
v1 → v2: Add HP, Energy, skills, ascension, tutorial
v2 → v3: Equipment system expansion
v3 → v4: Skill v2 (SP replaces MP, new skill schema, refund SP = floor(level/3))
v4 → v5: Item v2 (6 slots, wipe all items, compensate 50% gold from LEGACY_ITEM_PRICES)
```

Each migration step is applied sequentially. The save key is always `clickoria_save_v5` (latest). Old save keys are checked as fallbacks during load.

---

*Referenced by: storage.js, player.js, combat.js, skills.js, items.js*
*References: _INDEX.md, item.schema.md, zone.schema.md, docs/design/skill-system-v2.md*

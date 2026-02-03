# Player Schema

> Defines the complete player state structure. This is what gets saved/loaded.

## Overview

The player object contains all persistent state: identity, progression, stats, inventory, skills, and ascension data.

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

  // === Health & Energy (NEW) ===
  hp: number;                   // Current HP
  maxHP: number;                // Calculated max HP
  energy: number;               // Current Energy (0-100)
  maxEnergy: number;            // Max Energy (100, can increase)

  // === Combat Stats ===
  stats: {
    attack: number;             // Base attack power
    critChance: number;         // 0.0 to 1.0 (5% base)
    critDamage: number;         // Multiplier (2.0 = 200%)
    goldFind: number;           // 0.0 to X (bonus %)
    xpBonus: number;            // 0.0 to X (bonus %)
    hpRegen: number;            // % of max HP per second (0.005 = 0.5%)
    damageReduction: number;    // 0.0 to 1.0 (reduction %)
    energyGain: number;         // Bonus % to energy from clicks
    armorPen: number;           // % of armor ignored
  };

  // === Equipment ===
  equipment: {
    weapon: string | null;      // Item ID or null
    accessory: string | null;   // Item ID or null
  };

  // === Inventory ===
  inventory: string[];          // Array of owned Item IDs

  // === Skills (NEW STRUCTURE) ===
  skills: {
    [skillId: string]: {
      unlocked: boolean;        // Has player unlocked this skill
      level: number;            // Current skill level (1-5, or 1-10 with ascension)
      lastUsed: number | null;  // Timestamp for cooldown (active skills)
    };
  };

  // === Equipped Skills (NEW) ===
  equippedActiveSkills: (string | null)[];   // 4 slots for active skills
  equippedPassiveSkills: (string | null)[];  // 3 slots for passive skills

  // === Zone Progress ===
  currentZone: string;          // Zone ID where player is
  unlockedZones: string[];      // Array of unlocked Zone IDs
  bossesDefeated: string[];     // Array of defeated Boss IDs

  // === Ascension (NEW) ===
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
  vault: string[];              // Item IDs stored in vault

  // === Statistics ===
  statistics: {
    totalClicks: number;
    totalKills: number;
    totalBossKills: number;
    highestDamage: number;
    totalCriticals: number;
    timePlayed: number;
    totalDeaths: number;        // NEW
    totalHealingDone: number;   // NEW
    totalDamageTaken: number;   // NEW
  };

  // === Settings ===
  settings: {
    soundVolume: number;
    musicVolume: number;
    showDamageNumbers: boolean;
    screenShake: boolean;
    autoSave: boolean;
  };

  // === Tutorial State (EXPANDED) ===
  tutorial: {
    completed: {
      first_load: boolean;
      first_kill: boolean;
      first_level_up: boolean;
      first_skill_unlock: boolean;
      first_skill_use: boolean;
      first_energy_full: boolean;
      first_shop_visit: boolean;
      first_item_bought: boolean;
      first_aggressive_monster: boolean;
      first_damage_taken: boolean;
      first_zone_unlock: boolean;
      first_boss_killed: boolean;
      first_death: boolean;
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

These fields exist during gameplay but are NOT persisted:

```typescript
interface RuntimeState {
  // === Active Buffs ===
  buffs: {
    [buffId: string]: {
      stat: string;
      value: number;
      duration: number;
      expiresAt: number;
      // Additional buff-specific data
      damageMultiplier?: number;
      damageTakenMultiplier?: number;
      damageReduction?: number;
      reflectMultiplier?: number;
      survivePercent?: number;
      invulnerable?: boolean;
    };
  };

  // === Combat Modifiers ===
  nextAttackModifier: number | null;

  // === Current Combat ===
  currentMonster: MonsterInstance | null;
  combatState: 'idle' | 'spawning' | 'active' | 'monster_attacking' | 'dying' | 'waiting';

  // === Timing Mode (Perfect Strike) ===
  timingMode: {
    active: boolean;
    expiresAt: number | null;
    goodMultiplier: number;
    perfectMultiplier: number;
    missMultiplier: number;
  } | null;

  // === Shield (temporary) ===
  shield: number;
  maxShield: number;

  // === UI State ===
  currentScreen: 'combat' | 'shop' | 'skills' | 'zones' | 'stats';
  isModalOpen: boolean;
  activeModal: string | null;

  // === Energy Tracking ===
  lastEnergyGain: number;       // Timestamp for internal cooldown
}
```

---

## Default New Player

```javascript
const DEFAULT_PLAYER = {
  saveVersion: 2,
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

  hp: 100,
  maxHP: 100,
  energy: 0,
  maxEnergy: 100,

  stats: {
    attack: 5,
    critChance: 0.05,
    critDamage: 2.0,
    goldFind: 0.0,
    xpBonus: 0.0,
    hpRegen: 0.005,      // 0.5% per second
    damageReduction: 0.0,
    energyGain: 0.0,
    armorPen: 0.0
  },

  equipment: {
    weapon: null,
    accessory: null
  },

  inventory: [],

  skills: {
    // Power Strike (active) is auto-unlocked at level 1
    "skill_power_strike": { unlocked: true, level: 1, lastUsed: null }
  },

  equippedActiveSkills: ["skill_power_strike", null, null, null],
  equippedPassiveSkills: [null, null, null],

  currentZone: "whisperwood",
  unlockedZones: ["whisperwood"],
  bossesDefeated: [],

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
    completed: {
      first_load: false,
      first_kill: false,
      first_level_up: false,
      first_skill_unlock: false,
      first_skill_use: false,
      first_energy_full: false,
      first_shop_visit: false,
      first_item_bought: false,
      first_aggressive_monster: false,
      first_damage_taken: false,
      first_zone_unlock: false,
      first_boss_killed: false,
      first_death: false
    },
    tipsShown: 0,
    lastTipTime: null,
    tutorialEnabled: true
  }
};
```

---

## HP Calculation

```javascript
function calculateMaxHP(player) {
  const BASE_HP = 100;
  const HP_PER_LEVEL = 10;

  // Base HP from level
  let maxHP = BASE_HP + (HP_PER_LEVEL * (player.level - 1));

  // Add ascension flat HP
  maxHP += player.ascension.flatHP;

  // Apply Thick Skin passive (if equipped)
  const thickSkinBonus = getPassiveBonus(player, 'skill_thick_skin', 'maxHP');
  maxHP = Math.floor(maxHP * (1 + thickSkinBonus));

  // Apply equipment bonuses
  maxHP = Math.floor(maxHP * (1 + getEquipmentBonus(player, 'maxHP')));

  return maxHP;
}
```

---

## Skill Slot Management

```javascript
// Equip active skill
function equipActiveSkill(player, skillId, slotIndex) {
  if (slotIndex < 0 || slotIndex >= 4) return false;
  if (!player.skills[skillId]?.unlocked) return false;

  // Remove from current slot if already equipped
  const currentSlot = player.equippedActiveSkills.indexOf(skillId);
  if (currentSlot !== -1) {
    player.equippedActiveSkills[currentSlot] = null;
  }

  player.equippedActiveSkills[slotIndex] = skillId;
  return true;
}

// Equip passive skill
function equipPassiveSkill(player, skillId, slotIndex) {
  if (slotIndex < 0 || slotIndex >= 3) return false;
  if (!player.skills[skillId]?.unlocked) return false;

  const skill = getSkill(skillId);
  if (skill.type !== 'passive') return false;

  const currentSlot = player.equippedPassiveSkills.indexOf(skillId);
  if (currentSlot !== -1) {
    player.equippedPassiveSkills[currentSlot] = null;
  }

  player.equippedPassiveSkills[slotIndex] = skillId;
  return true;
}
```

---

## Ascension Functions

```javascript
function performAscension(player) {
  // Record history
  player.ascension.history.push({
    level: player.ascension.level + 1,
    timestamp: Date.now(),
    runTime: player.totalPlayTime
  });

  // Increment ascension
  player.ascension.level++;
  player.ascension.totalAscensions++;

  // Add permanent bonuses
  player.ascension.damageBonus += 0.05;
  player.ascension.goldBonus += 0.05;
  player.ascension.xpBonus += 0.05;
  player.ascension.flatHP += 50;

  // Track fastest run
  if (!player.ascension.fastestRun ||
      player.totalPlayTime < player.ascension.fastestRun) {
    player.ascension.fastestRun = player.totalPlayTime;
  }

  // Move equipment to vault
  for (const slot of Object.keys(player.equipment)) {
    if (player.equipment[slot]) {
      player.vault.push(player.equipment[slot]);
      player.equipment[slot] = null;
    }
  }
  for (const itemId of player.inventory) {
    player.vault.push(itemId);
  }
  player.inventory = [];

  // Reset progress
  player.level = 1;
  player.xp = 0;
  player.gold = 0;
  player.totalPlayTime = 0;

  // Reset skill levels (keep unlocks)
  for (const skillId of Object.keys(player.skills)) {
    if (player.skills[skillId].unlocked) {
      player.skills[skillId].level = 1;
      player.skills[skillId].lastUsed = null;
    }
  }

  // Full heal
  player.hp = calculateMaxHP(player);
  player.energy = 0;
}
```

---

## Save/Load

### LocalStorage Key
```
SAVE_KEY = "clickoria_save_v2"
```

### Migration
```javascript
function migrate(oldSave) {
  if (oldSave.saveVersion === 1) {
    // Migrate from v1 to v2
    return {
      ...oldSave,
      saveVersion: 2,
      hp: 100,
      maxHP: 100,
      energy: 0,
      maxEnergy: 100,
      stats: {
        ...oldSave.stats,
        hpRegen: 0.005,
        damageReduction: 0,
        energyGain: 0,
        armorPen: 0
      },
      equippedActiveSkills: [null, null, null, null],
      equippedPassiveSkills: [null, null, null],
      ascension: { level: 0, totalAscensions: 0, damageBonus: 0, goldBonus: 0, xpBonus: 0, flatHP: 0, fastestRun: null, history: [] },
      vault: [],
      tutorial: { completed: {}, tipsShown: 0, lastTipTime: null, tutorialEnabled: true }
    };
  }
  return oldSave;
}
```

---

*Referenced by: storage.js, game.js, combat.js, skills.js*
*References: _INDEX.md, item.schema.md, zone.schema.md, skill.schema.md*

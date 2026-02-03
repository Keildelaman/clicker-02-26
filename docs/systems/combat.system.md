# Combat System

> Defines all combat mechanics, damage calculations, monster types, and fight flow.

---

## Overview

Combat is the core loop with strategic depth:
- Player clicks to deal damage and build Energy
- Monsters have unique mechanics requiring adaptation
- Some monsters attack back, requiring timing
- Skills provide tactical options
- Health management adds stakes

---

## Combat Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       COMBAT LOOP                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  SPAWN  │───▶│   COMBAT    │───▶│    DEATH    │          │
│  │ Monster │    │             │    │  (Rewards)  │          │
│  └─────────┘    │ ┌─────────┐ │    └─────────────┘          │
│       ▲         │ │ Player  │ │           │                  │
│       │         │ │ Clicks  │ │           │                  │
│       │         │ └────┬────┘ │           │                  │
│       │         │      │      │           │                  │
│       │         │ ┌────▼────┐ │           │                  │
│       │         │ │ Monster │ │           │                  │
│       │         │ │ Actions │ │           │                  │
│       │         │ └─────────┘ │           │                  │
│       │         └─────────────┘           │                  │
│       │                                   │                  │
│       └───────────────────────────────────┘                  │
│                   (500ms delay)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### State Machine

```javascript
const CombatState = {
  SPAWNING: "spawning",         // Monster appearing
  ACTIVE: "active",             // Normal combat
  MONSTER_ATTACKING: "attacking", // Monster attack window (don't click!)
  DYING: "dying",               // Death animation
  WAITING: "waiting"            // Delay before next spawn
};
```

---

## Monster Types

### Overview

Six distinct monster types with unique mechanics:

| Type | Mechanic | Counter Strategy |
|------|----------|------------------|
| Normal | Standard HP | Basic clicking |
| Armored | Damage reduction | Big hits (skills) |
| Swift | Escape timer | Fast damage |
| Regenerating | HP regen | Sustained DPS |
| Shielded | Shield bar | Break shield first |
| Aggressive | Attacks player | Time clicks carefully |

---

### Type 1: Normal

```javascript
// No special mechanics
// Standard HP pool
// Does not attack

const NORMAL_MONSTER = {
  type: "normal",
  mechanics: null,
  attacksPlayer: false
};
```

**Behavior:**
- Spawns with HP
- Player clicks to damage
- Dies when HP reaches 0
- No special considerations

**Examples:** Forest Sprite (early), some later monsters

---

### Type 2: Armored

```javascript
const ARMORED_MONSTER = {
  type: "armored",
  mechanics: {
    armor: 10,  // Flat damage reduction
    armorScaling: 2  // +2 armor per monster level above base
  },
  attacksPlayer: false
};

function calculateDamageVsArmor(baseDamage, monster) {
  const armor = monster.mechanics.armor +
    (monster.mechanics.armorScaling * (monster.level - monster.levelMin));

  // Armor reduces damage by flat amount (minimum 1 damage)
  return Math.max(baseDamage - armor, 1);
}
```

**Behavior:**
- Each hit is reduced by armor value
- Small hits are nearly useless
- Big skill hits are effective

**Visual:** 🛡️ icon, metallic sheen on monster

**Counter:** Use Power Strike, Execute, or other high-damage skills

**Examples:** Grumpy Treant, Stone Golem, Iron Elemental

---

### Type 3: Swift

```javascript
const SWIFT_MONSTER = {
  type: "swift",
  mechanics: {
    escapeTime: 8000,  // ms before escape
    escapeTimeScaling: -500  // Faster in later zones
  },
  attacksPlayer: false,
  onEscape: {
    playerDamage: 0.05,  // 5% max HP damage
    lootLost: true
  }
};

function updateSwiftTimer(monster, deltaTime) {
  monster.escapeTimer -= deltaTime;

  if (monster.escapeTimer <= 0) {
    // Monster escapes!
    handleMonsterEscape(monster);
  }
}

function handleMonsterEscape(monster) {
  // Damage player
  const damage = Math.floor(player.maxHP * 0.05);
  player.hp -= damage;
  showDamageToPlayer(damage);

  // No loot
  showMessage("The monster escaped!");

  // Spawn next
  spawnNextMonster();
}
```

**Behavior:**
- Timer bar appears above HP
- Timer counts down (8-5 seconds based on zone)
- If timer expires: monster escapes, player takes 5% HP damage, no rewards
- Killing before timer = normal rewards

**Visual:** ⏱️ timer bar, speed lines on monster

**Counter:** Fast clicking, Time Warp skill, burst damage

**Examples:** Forest Sprite (some), Dust Devil, Shadow Wisp

---

### Type 4: Regenerating

```javascript
const REGENERATING_MONSTER = {
  type: "regenerating",
  mechanics: {
    regenPercent: 0.03,  // 3% max HP per second
    regenCap: 1.0  // Cannot regen above spawn HP
  },
  attacksPlayer: false
};

function updateRegeneration(monster, deltaTime) {
  const regenAmount = monster.maxHealth * monster.mechanics.regenPercent * deltaTime;
  const newHP = monster.currentHealth + regenAmount;

  // Cap at max (spawn) HP
  monster.currentHealth = Math.min(newHP, monster.maxHealth);
}
```

**Behavior:**
- Regenerates 3% max HP per second
- Never heals above spawn HP
- Must deal damage faster than regen to kill

**Visual:** 💚 pulses, HP bar has green tint

**Counter:** Sustained high damage, Berserk Rage, don't stop clicking

**Examples:** Mire Hag, Swamp Husk, Void Horror

---

### Type 5: Shielded

```javascript
const SHIELDED_MONSTER = {
  type: "shielded",
  mechanics: {
    shieldPercent: 0.30,  // Shield = 30% of HP
    shieldDamageReduction: 0.50  // 50% damage reduction while shielded
  },
  attacksPlayer: false
};

function createShieldedMonster(definition) {
  const monster = createMonsterInstance(definition);
  monster.shield = Math.floor(monster.maxHealth * 0.30);
  monster.maxShield = monster.shield;
  return monster;
}

function damageShieldedMonster(monster, damage) {
  if (monster.shield > 0) {
    // Damage reduction while shielded
    const reducedDamage = Math.floor(damage * 0.5);

    if (reducedDamage >= monster.shield) {
      // Shield breaks
      const overflow = reducedDamage - monster.shield;
      monster.shield = 0;
      monster.currentHealth -= overflow;
      showShieldBreak();
    } else {
      monster.shield -= reducedDamage;
    }
  } else {
    // No shield, normal damage
    monster.currentHealth -= damage;
  }
}
```

**Behavior:**
- Spawns with shield bar (30% of HP)
- While shielded, takes 50% reduced damage
- Must break shield, then deal HP damage
- Shield does not regenerate

**Visual:** 🔷 blue bar above HP bar, shimmer effect

**Counter:** Shield Breaker skill, high sustained damage

**Examples:** Void Walker, Crystal Elemental, Frost Sentinel

---

### Type 6: Aggressive

```javascript
const AGGRESSIVE_MONSTER = {
  type: "aggressive",
  mechanics: {
    attackCycle: 4000,      // ms between attack cycles
    warningDuration: 1500,  // ms of warning before attack
    attackDuration: 500,    // ms of attack window
    safeDuration: 2000,     // ms of safe window after attack
    damagePercent: 0.10     // 10% of player max HP
  },
  attacksPlayer: true
};

// Attack cycle phases
const AttackPhase = {
  SAFE: "safe",         // Can click freely
  WARNING: "warning",   // Monster glowing, attack coming
  ATTACKING: "attacking" // DON'T CLICK or take damage
};
```

**Attack Cycle:**

```
TIME:    0s      2s       3.5s    4s       6s       7.5s    8s
         │       │        │       │        │        │       │
PHASE:   ├─SAFE──┤WARNING─┤ATTACK─┤─SAFE───┤WARNING─┤ATTACK─┤
         │       │        │       │        │        │       │
ACTION:  Click!  Prepare! STOP!   Click!   Prepare! STOP!
```

**Implementation:**

```javascript
function updateAggressiveMonster(monster, deltaTime) {
  monster.attackTimer += deltaTime;

  const cycle = monster.mechanics.attackCycle;
  const warning = monster.mechanics.warningDuration;
  const attack = monster.mechanics.attackDuration;

  const cyclePosition = monster.attackTimer % cycle;

  if (cyclePosition < cycle - warning - attack) {
    // Safe phase
    monster.attackPhase = AttackPhase.SAFE;
    combatState = CombatState.ACTIVE;
  } else if (cyclePosition < cycle - attack) {
    // Warning phase
    monster.attackPhase = AttackPhase.WARNING;
    combatState = CombatState.ACTIVE;
    showWarningIndicator();
  } else {
    // Attack phase
    monster.attackPhase = AttackPhase.ATTACKING;
    combatState = CombatState.MONSTER_ATTACKING;
  }
}

function onPlayerClick() {
  // ... existing checks ...

  // Check if clicking during attack phase
  if (currentMonster.type === "aggressive" &&
      currentMonster.attackPhase === AttackPhase.ATTACKING) {
    // Player takes damage!
    const damage = Math.floor(player.maxHP * currentMonster.mechanics.damagePercent);
    damagePlayer(damage);
    showMessage("Hit during attack!");
    return;
  }

  // Normal damage to monster
  dealDamageToMonster();
}
```

**Behavior:**
- Cycles through Safe → Warning → Attack phases
- During Warning: Monster glows red, "!" appears
- During Attack: If player clicks, player takes damage
- Must time clicks to avoid attack window

**Visual:**
- Safe: Normal appearance
- Warning: Red glow, "!" icon, pulsing
- Attack: Full red, attack animation

**Counter:** Watch for warning, stop clicking during attack, Quick Reflexes passive

**Examples:** Timber Wolf, Bandit, all Bosses

---

## Player Damage

### Taking Damage

```javascript
function damagePlayer(amount) {
  // Check for damage reduction buffs
  let finalDamage = amount;

  // Iron Skin reduction
  if (player.buffs.ironSkin) {
    finalDamage = Math.floor(finalDamage * (1 - player.buffs.ironSkinReduction));
  }

  // Equipment damage reduction
  finalDamage = Math.floor(finalDamage * (1 - player.stats.damageReduction));

  // Check Undying
  if (player.hp - finalDamage <= 0 && player.buffs.undying) {
    player.hp = Math.floor(player.maxHP * player.buffs.undyingSurvivePercent);
    player.buffs.undying = null;
    showUndyingTrigger();
    return;
  }

  // Check Reflect
  if (player.buffs.reflect) {
    const reflectDamage = Math.floor(finalDamage * player.buffs.reflectMultiplier);
    currentMonster.currentHealth -= reflectDamage;
    showReflectAnimation(reflectDamage);
    player.buffs.reflect = null;

    if (currentMonster.currentHealth <= 0) {
      killMonster();
    }
    return;
  }

  // Apply damage
  player.hp -= finalDamage;

  // Visual feedback
  showPlayerDamage(finalDamage);
  flashScreen("red");

  // Check death
  if (player.hp <= 0) {
    handlePlayerDeath();
  }
}
```

### Player Death

```javascript
function handlePlayerDeath() {
  // Reset to last milestone
  const milestone = Math.floor(player.level / 10) * 10;
  const levelsLost = player.level - Math.max(milestone, 1);
  player.level = Math.max(milestone, 1);

  // Lose 50% gold
  const goldLost = Math.floor(player.gold * 0.5);
  player.gold -= goldLost;

  // Full heal
  player.hp = player.maxHP;
  player.energy = 0;

  // Clear current monster
  currentMonster = null;
  combatState = CombatState.WAITING;

  // Show death modal
  showDeathModal({
    levelsLost: levelsLost,
    goldLost: goldLost,
    newLevel: player.level
  });

  // Spawn new monster after modal dismissed
}
```

---

## Click Mechanics

### Click Handler

```javascript
function onPlayerClick() {
  // State checks
  if (combatState !== CombatState.ACTIVE) {
    if (combatState === CombatState.MONSTER_ATTACKING) {
      // Clicked during attack - take damage (handled above)
    }
    return;
  }
  if (currentMonster === null) return;

  // Calculate damage
  const result = calculateDamage();

  // Apply damage (considering monster type)
  applyDamageToMonster(result.damage);

  // Grant Energy (with internal cooldown)
  grantEnergy();

  // Update statistics
  player.statistics.totalClicks++;
  if (result.isCritical) {
    player.statistics.totalCriticals++;
  }
  if (result.damage > player.statistics.highestDamage) {
    player.statistics.highestDamage = result.damage;
  }

  // Show damage number
  displayDamageNumber(result.damage, result.isCritical);

  // Check death
  if (currentMonster.currentHealth <= 0) {
    killMonster();
  }
}
```

### Energy on Click

```javascript
let lastEnergyGain = 0;
const ENERGY_GAIN_COOLDOWN = 200; // ms

function grantEnergy() {
  const now = Date.now();

  // Internal cooldown
  if (now - lastEnergyGain < ENERGY_GAIN_COOLDOWN) {
    return;
  }

  lastEnergyGain = now;

  // Base Energy gain
  let energyGain = ENERGY_PER_CLICK; // 5

  // Energy Flow passive bonus
  const energyFlowLevel = player.passiveSkills.energyFlow || 0;
  energyGain = Math.floor(energyGain * (1 + energyFlowLevel * 0.10));

  // Apply
  player.energy = Math.min(player.energy + energyGain, player.maxEnergy);
}
```

### Damage Calculation

```javascript
function calculateDamage() {
  // Base attack from all sources
  const attack = getTotalAttack(player);

  // Roll for critical
  const critChance = getTotalCritChance(player);
  const isCritical = Math.random() < critChance;

  // Calculate damage
  let damage = attack;
  if (isCritical) {
    const critDamage = getTotalCritDamage(player);
    damage = Math.floor(attack * critDamage);
  }

  // Apply next attack modifier (from skills)
  if (player.nextAttackModifier) {
    damage = Math.floor(damage * player.nextAttackModifier);
    player.nextAttackModifier = null;
  }

  // Ascension bonus
  damage = Math.floor(damage * (1 + player.ascension.damageBonus));

  // Ensure minimum damage
  damage = Math.max(damage, MIN_DAMAGE);

  return { damage, isCritical };
}
```

### Applying Damage to Monster

```javascript
function applyDamageToMonster(damage) {
  switch (currentMonster.type) {
    case "armored":
      damage = calculateDamageVsArmor(damage, currentMonster);
      break;
    case "shielded":
      damageShieldedMonster(currentMonster, damage);
      return; // Already applied
    default:
      // Normal damage
      break;
  }

  currentMonster.currentHealth -= damage;
}
```

---

## Skill Usage in Combat

### Using Active Skills

```javascript
function useActiveSkill(slotIndex) {
  const skillId = player.equippedActiveSkills[slotIndex];
  if (!skillId) {
    showMessage("No skill in this slot!");
    return false;
  }

  const skill = getSkill(skillId);
  const playerSkill = player.skills[skillId];

  // Check Energy
  if (player.energy < skill.energyCost) {
    showMessage("Not enough Energy!");
    flashEnergyBar("red");
    return false;
  }

  // Check cooldown
  const now = Date.now();
  const cooldownRemaining = (playerSkill.lastUsed + skill.cooldown) - now;
  if (cooldownRemaining > 0) {
    showMessage(`Cooldown: ${Math.ceil(cooldownRemaining / 1000)}s`);
    return false;
  }

  // Spend Energy
  player.energy -= skill.energyCost;

  // Apply effect
  applySkillEffect(skill, playerSkill.level);

  // Start cooldown
  playerSkill.lastUsed = now;

  // Visual feedback
  showSkillActivation(skill);

  return true;
}
```

### Skill Effects

```javascript
function applySkillEffect(skill, level) {
  const effects = skill.effectsAtLevel[level];

  switch (skill.effectType) {
    case "nextAttackMultiplier":
      player.nextAttackModifier = effects.multiplier;
      showMessage(`Next attack: ${effects.multiplier}x damage!`);
      break;

    case "buff":
      player.buffs[skill.id] = {
        ...effects,
        expiresAt: Date.now() + effects.duration
      };
      showBuffActivation(skill.name);
      break;

    case "instantHeal":
      const healAmount = Math.floor(player.maxHP * effects.healPercent);
      player.hp = Math.min(player.hp + healAmount, player.maxHP);
      showHealNumber(healAmount);
      break;

    case "monsterFreeze":
      currentMonster.frozen = true;
      currentMonster.frozenUntil = Date.now() + effects.duration;
      showFreezeEffect();
      break;

    case "percentDamage":
      // Soul Rend - damage based on monster HP
      const damage = Math.floor(currentMonster.maxHealth * effects.percent);
      const clampedDamage = Math.max(
        Math.min(damage, player.stats.attack * 10),
        player.stats.attack
      );
      applyDamageToMonster(clampedDamage);
      displayDamageNumber(clampedDamage, false, "purple");
      break;

    case "shieldBreak":
      if (currentMonster.shield > 0) {
        currentMonster.shield = 0;
        showShieldBreak();
      }
      // Bonus damage to shielded monsters
      player.buffs.shieldBreakerBonus = {
        damageBonus: effects.bonusDamage,
        expiresAt: Date.now() + effects.duration
      };
      break;
  }
}
```

---

## Monster Spawning

### Spawn Logic

```javascript
function spawnNextMonster() {
  combatState = CombatState.SPAWNING;

  // Select monster
  const monster = selectMonster(currentZone);

  // Create instance
  currentMonster = createMonsterInstance(monster);

  // Initialize type-specific mechanics
  initializeMonsterMechanics(currentMonster);

  // Play spawn animation
  playSpawnAnimation(currentMonster);

  // Enter combat
  setTimeout(() => {
    combatState = CombatState.ACTIVE;
  }, SPAWN_ANIMATION_DURATION);
}

function initializeMonsterMechanics(monster) {
  switch (monster.type) {
    case "swift":
      monster.escapeTimer = monster.mechanics.escapeTime;
      break;
    case "shielded":
      monster.shield = Math.floor(monster.maxHealth * 0.30);
      monster.maxShield = monster.shield;
      break;
    case "aggressive":
      monster.attackTimer = 0;
      monster.attackPhase = AttackPhase.SAFE;
      break;
    case "regenerating":
      // No special init needed
      break;
    case "armored":
      // No special init needed
      break;
  }
}
```

### Monster Selection

```javascript
function selectMonster(zone) {
  const monsters = getZoneMonsters(zone.id).filter(m => !m.isBoss);

  // Calculate total spawn weight
  const totalWeight = monsters.reduce((sum, m) => sum + m.spawnWeight, 0);

  // Weighted random selection
  let roll = Math.random() * totalWeight;
  for (const monster of monsters) {
    roll -= monster.spawnWeight;
    if (roll <= 0) {
      return monster;
    }
  }

  return monsters[0]; // Fallback
}
```

---

## Monster Death

### Kill Handler

```javascript
function killMonster() {
  combatState = CombatState.DYING;

  // Calculate rewards
  const goldReward = calculateGoldReward(currentMonster);
  const xpReward = calculateXPReward(currentMonster);

  // Grant rewards
  giveGold(player, goldReward);
  giveXP(player, xpReward);

  // Grant bonus Energy
  const bonusEnergy = currentMonster.isBoss ? ENERGY_ON_BOSS_KILL : ENERGY_ON_KILL;
  player.energy = Math.min(player.energy + bonusEnergy, player.maxEnergy);

  // Update statistics
  player.statistics.totalKills++;
  if (currentMonster.isBoss) {
    player.statistics.totalBossKills++;
  }

  // Roll for loot
  rollLootDrops(currentMonster);

  // Play death animation
  playDeathAnimation(currentMonster.deathEmoji);

  // Check for boss-specific handling
  if (currentMonster.isBoss) {
    handleBossDeath();
  }

  // Schedule next spawn
  setTimeout(() => {
    combatState = CombatState.WAITING;
    setTimeout(spawnNextMonster, MONSTER_SPAWN_DELAY);
  }, DEATH_ANIMATION_DURATION);
}
```

---

## Boss Combat

### How to Access Boss Fights

Boss fights are accessed via the Zone Selection screen:

```javascript
function canFightBoss(player, zone) {
  // Player must be in the zone
  if (player.currentZone !== zone.id) return false;

  // Player must have unlocked the zone
  if (!player.unlockedZones.includes(zone.id)) return false;

  // Boss must not already be defeated (for zone unlock purposes)
  // BUT can be re-fought for loot (reduced rewards)
  return true;
}
```

**Boss Fight Access:**
- Boss is always accessible once you're in the zone
- No minimum level requirement (but under-leveled = difficult)
- No kill count requirement
- "FIGHT BOSS" button in Zone Selection modal
- Can re-fight bosses after defeating (for loot, no zone unlock)

### Boss Differences

Bosses are always Aggressive type PLUS may have additional type:

```javascript
function createBossInstance(bossDefinition) {
  const boss = createMonsterInstance(bossDefinition);
  boss.isBoss = true;

  // Bosses always attack
  boss.attacksPlayer = true;
  boss.attackPhase = AttackPhase.SAFE;
  boss.attackTimer = 0;

  // Boss attack cycle (faster, more dangerous)
  boss.mechanics = {
    ...boss.mechanics,
    attackCycle: 3000,      // Faster than regular aggressive
    warningDuration: 1200,
    attackDuration: 600,
    damagePercent: 0.15     // 15% damage (more than regular)
  };

  return boss;
}
```

### Boss Death

```javascript
function handleBossDeath() {
  const bossId = currentMonster.definitionId;

  // First kill only
  if (!player.bossesDefeated.includes(bossId)) {
    player.bossesDefeated.push(bossId);

    // Unlock next zone
    const nextZone = getNextZone(currentZone.id);
    if (nextZone && !player.unlockedZones.includes(nextZone.id)) {
      player.unlockedZones.push(nextZone.id);
    }

    // Guaranteed drops
    const boss = getMonster(bossId);
    for (const loot of boss.lootTable.filter(l => l.chance >= 1.0)) {
      giveItem(player, loot.itemId);
    }

    // Celebration modal
    showBossDefeatCelebration(boss, nextZone);
  } else {
    // Repeat kill - reduced rewards
    // Regular loot rolls only, no guarantees
  }
}
```

---

## Game Loop Updates

### Monster Updates

```javascript
function updateCombat(deltaTime) {
  if (!currentMonster || combatState !== CombatState.ACTIVE) return;

  // Type-specific updates
  switch (currentMonster.type) {
    case "swift":
      updateSwiftTimer(currentMonster, deltaTime);
      break;
    case "regenerating":
      updateRegeneration(currentMonster, deltaTime);
      break;
    case "aggressive":
      updateAggressiveMonster(currentMonster, deltaTime);
      break;
  }

  // Check frozen status
  if (currentMonster.frozen) {
    if (Date.now() >= currentMonster.frozenUntil) {
      currentMonster.frozen = false;
    }
  }
}
```

### Buff Updates

```javascript
function updateBuffs(deltaTime) {
  const now = Date.now();

  for (const [buffId, buff] of Object.entries(player.buffs)) {
    if (buff.expiresAt && buff.expiresAt <= now) {
      delete player.buffs[buffId];
      showBuffExpired(buffId);
    }
  }
}
```

### HP Regeneration

```javascript
function updatePlayerRegen(deltaTime) {
  if (player.hp >= player.maxHP) return;

  const regenRate = calculateRegenRate(player);
  const regenAmount = player.maxHP * regenRate * deltaTime;

  player.hp = Math.min(player.hp + regenAmount, player.maxHP);
}
```

### Energy Regeneration

```javascript
function updateEnergyRegen(deltaTime) {
  if (player.energy >= player.maxEnergy) return;

  const regenAmount = ENERGY_REGEN_PER_SECOND * deltaTime;
  player.energy = Math.min(player.energy + regenAmount, player.maxEnergy);
}
```

---

## Constants Reference

```javascript
const COMBAT_CONSTANTS = {
  // Timing
  MONSTER_SPAWN_DELAY: 500,         // ms
  SPAWN_ANIMATION_DURATION: 200,    // ms
  DEATH_ANIMATION_DURATION: 300,    // ms
  DAMAGE_NUMBER_DURATION: 800,      // ms

  // Base stats
  MIN_DAMAGE: 1,
  BASE_PLAYER_ATTACK: 5,
  BASE_CRIT_CHANCE: 0.05,
  BASE_CRIT_MULTIPLIER: 2.0,

  // Energy
  ENERGY_PER_CLICK: 5,
  ENERGY_GAIN_COOLDOWN: 200,        // ms
  ENERGY_ON_KILL: 15,
  ENERGY_ON_BOSS_KILL: 50,
  ENERGY_REGEN_PER_SECOND: 2,

  // Monster type defaults
  SWIFT_BASE_TIME: 8000,            // ms
  REGEN_PERCENT_PER_SECOND: 0.03,
  SHIELD_PERCENT: 0.30,
  SHIELD_DAMAGE_REDUCTION: 0.50,

  // Aggressive monsters
  ATTACK_CYCLE: 4000,               // ms
  WARNING_DURATION: 1500,           // ms
  ATTACK_DURATION: 500,             // ms
  ATTACK_DAMAGE_PERCENT: 0.10,

  // Boss modifiers
  BOSS_ATTACK_CYCLE: 3000,
  BOSS_DAMAGE_PERCENT: 0.15
};
```

---

*Combat is the heart of the game. Every click should feel impactful, every monster should require thought, and victory should feel earned.*

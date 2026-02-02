# Combat System

> Defines all combat mechanics, damage calculations, and fight flow.

## Overview

Combat is the core loop: Player clicks → Monster takes damage → Monster dies → Rewards given → New monster spawns. Simple but satisfying.

---

## Combat Flow

```
┌─────────────────────────────────────────────────────┐
│                    COMBAT LOOP                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  SPAWN  │───▶│   COMBAT    │───▶│    DEATH    │  │
│  │ Monster │    │   (Click)   │    │  (Rewards)  │  │
│  └─────────┘    └─────────────┘    └─────────────┘  │
│       ▲                                    │         │
│       │                                    │         │
│       └────────────────────────────────────┘         │
│                   (500ms delay)                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### State Machine

```javascript
const CombatState = {
  SPAWNING: "spawning",     // Monster appearing
  ACTIVE: "active",         // Monster alive, can attack
  DYING: "dying",           // Death animation playing
  WAITING: "waiting"        // Delay before next spawn
};
```

---

## Monster Spawning

### Spawn Trigger
- On game start (if no active monster)
- After MONSTER_SPAWN_DELAY (500ms) following monster death
- When changing zones (immediate)

### Spawn Selection Algorithm

```javascript
function spawnMonster(zone) {
  // 1. Get all non-boss monsters in zone
  const monsters = getZoneMonsters(zone.id).filter(m => !m.isBoss);

  // 2. Calculate total spawn weight
  const totalWeight = monsters.reduce((sum, m) => sum + m.spawnWeight, 0);

  // 3. Random weighted selection
  let roll = Math.random() * totalWeight;
  for (const monster of monsters) {
    roll -= monster.spawnWeight;
    if (roll <= 0) {
      return createMonsterInstance(monster);
    }
  }
}
```

### Monster Instance Creation

```javascript
function createMonsterInstance(definition) {
  // Roll level within range
  const level = randomInt(definition.levelMin, definition.levelMax);

  // Calculate stats
  const levelBonus = level - definition.levelMin;
  const maxHealth = definition.baseHealth + (definition.healthPerLevel * levelBonus);

  // Pre-calculate rewards
  const baseGold = randomInt(definition.goldMin, definition.goldMax);
  const goldReward = baseGold + (definition.goldPerLevel * levelBonus);

  const baseXP = randomInt(definition.xpMin, definition.xpMax);
  const xpReward = baseXP + (definition.xpPerLevel * levelBonus);

  return {
    definitionId: definition.id,
    name: definition.name,
    level: level,
    maxHealth: maxHealth,
    currentHealth: maxHealth,
    goldReward: goldReward,
    xpReward: xpReward,
    emoji: definition.emoji,
    deathEmoji: definition.deathEmoji
  };
}
```

---

## Click Attack

### Click Event Handler

```javascript
function onPlayerClick() {
  if (combatState !== CombatState.ACTIVE) return;
  if (currentMonster === null) return;

  // Calculate damage
  const result = calculateDamage();

  // Apply damage
  currentMonster.currentHealth -= result.damage;

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

### Damage Calculation

```javascript
function calculateDamage() {
  // Get total attack (base + equipment + skills)
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

  // Ensure minimum damage
  damage = Math.max(damage, MIN_DAMAGE);

  return {
    damage: damage,
    isCritical: isCritical
  };
}
```

### Total Stat Calculations

```javascript
function getTotalAttack(player) {
  let total = player.stats.attack;  // Base attack (starts at 5)

  // Add equipment
  if (player.equipment.weapon) {
    const weapon = getItem(player.equipment.weapon);
    total += weapon.stats.attack || 0;
  }

  // Add skill bonuses (percentage based)
  const sharpBlades = getSkillLevel(player, "skill_passive_sharp_blades");
  if (sharpBlades > 0) {
    const bonus = 5 + (5 * (sharpBlades - 1));  // 5% per level
    total = Math.floor(total * (1 + bonus / 100));
  }

  // Add active skill modifiers
  if (player.nextAttackModifier) {
    total = Math.floor(total * player.nextAttackModifier);
    player.nextAttackModifier = null;  // Consume modifier
  }

  return total;
}

function getTotalCritChance(player) {
  let total = player.stats.critChance;  // Base 0.05 (5%)

  // Add equipment
  for (const slot of ["weapon", "accessory"]) {
    if (player.equipment[slot]) {
      const item = getItem(player.equipment[slot]);
      total += item.stats.critChance || 0;
    }
  }

  // Add skill bonus
  const luckyStrikes = getSkillLevel(player, "skill_passive_lucky_strikes");
  if (luckyStrikes > 0) {
    total += (2 + (2 * (luckyStrikes - 1))) / 100;  // 2% per level
  }

  // Add active buffs
  if (player.buffs.criticalFrenzy) {
    total = 1.0;  // 100% crit during frenzy
  }

  // Cap at 100%
  return Math.min(total, 1.0);
}

function getTotalCritDamage(player) {
  let total = player.stats.critDamage;  // Base 2.0 (200%)

  // Add equipment
  for (const slot of ["weapon", "accessory"]) {
    if (player.equipment[slot]) {
      const item = getItem(player.equipment[slot]);
      total += item.stats.critDamage || 0;
    }
  }

  return total;
}
```

---

## Monster Death

### Death Handler

```javascript
function killMonster() {
  combatState = CombatState.DYING;

  // Calculate final rewards (with player bonuses)
  const goldFind = getTotalGoldFind(player);
  const xpBonus = getTotalXPBonus(player);

  const goldReward = Math.floor(currentMonster.goldReward * (1 + goldFind));
  const xpReward = Math.floor(currentMonster.xpReward * (1 + xpBonus));

  // Award rewards
  giveGold(player, goldReward);
  giveXP(player, xpReward);

  // Update statistics
  player.statistics.totalKills++;

  // Roll for loot drops
  rollLootDrops(currentMonster.definitionId);

  // Play death animation
  playDeathAnimation(currentMonster.deathEmoji);

  // After animation, spawn next
  setTimeout(() => {
    combatState = CombatState.WAITING;
    setTimeout(() => {
      spawnNextMonster();
    }, MONSTER_SPAWN_DELAY);
  }, DEATH_ANIMATION_DURATION);
}
```

### Gold Find Calculation

```javascript
function getTotalGoldFind(player) {
  let total = player.stats.goldFind;  // Base 0

  // Equipment
  if (player.equipment.accessory) {
    const acc = getItem(player.equipment.accessory);
    total += acc.stats.goldFind || 0;
  }

  // Skills
  const deepPockets = getSkillLevel(player, "skill_passive_deep_pockets");
  if (deepPockets > 0) {
    total += (5 + (5 * (deepPockets - 1))) / 100;
  }

  // Active buffs
  if (player.buffs.goldRush) {
    total += 1.0;  // +100% during Gold Rush
  }

  return total;
}
```

---

## Auto Attack

### Auto Attack System

```javascript
let autoAttackInterval = null;

function updateAutoAttack() {
  // Clear existing interval
  if (autoAttackInterval) {
    clearInterval(autoAttackInterval);
    autoAttackInterval = null;
  }

  // Get auto attack speed
  const autoAttackSpeed = getTotalAutoAttack(player);
  if (autoAttackSpeed <= 0) return;

  // Calculate interval (attacks per second → ms between attacks)
  const intervalMs = Math.floor(1000 / autoAttackSpeed);

  // Start auto attacking
  autoAttackInterval = setInterval(() => {
    if (combatState === CombatState.ACTIVE) {
      onPlayerClick();  // Simulate click
    }
  }, intervalMs);
}

function getTotalAutoAttack(player) {
  let total = player.stats.autoAttack;  // Base 0

  // Skills only (no equipment gives auto attack)
  const autoClicker = getSkillLevel(player, "skill_passive_auto_clicker");
  if (autoClicker > 0) {
    total += autoClicker;  // 1 click/sec per level
  }

  return total;
}
```

---

## Active Skills in Combat

### Using Active Skills

```javascript
function useActiveSkill(skillId) {
  const skill = getSkill(skillId);
  const playerSkill = player.skills[skillId];

  // Check if unlocked
  if (!playerSkill || playerSkill.level === 0) {
    showMessage("Skill not unlocked!");
    return false;
  }

  // Check cooldown
  const now = Date.now();
  if (playerSkill.lastUsed && now - playerSkill.lastUsed < skill.cooldown) {
    const remaining = Math.ceil((skill.cooldown - (now - playerSkill.lastUsed)) / 1000);
    showMessage(`Skill on cooldown: ${remaining}s`);
    return false;
  }

  // Apply effect
  applySkillEffect(skill, playerSkill.level);

  // Start cooldown
  playerSkill.lastUsed = now;

  return true;
}

function applySkillEffect(skill, level) {
  const value = skill.effect.baseValue + (skill.effect.perLevel * (level - 1));

  switch (skill.effect.type) {
    case "next_attack":
      player.nextAttackModifier = value;
      showMessage(`Next attack: ${value}x damage!`);
      break;

    case "buff":
      player.buffs[skill.id] = {
        stat: skill.effect.stat,
        value: skill.effect.value,
        expiresAt: Date.now() + skill.effect.duration
      };
      showMessage(`${skill.name} activated!`);
      break;

    case "instant":
      if (skill.id === "skill_active_monster_slayer") {
        if (currentMonster && !currentMonster.isBoss) {
          currentMonster.currentHealth = 0;
          killMonster();
          showMessage("Monster slain!");
        } else {
          showMessage("Cannot use on bosses!");
        }
      }
      break;
  }
}
```

### Buff Management

```javascript
function updateBuffs() {
  const now = Date.now();

  for (const [buffId, buff] of Object.entries(player.buffs)) {
    if (buff.expiresAt <= now) {
      delete player.buffs[buffId];
      showMessage(`${getSkill(buffId).name} expired`);
    }
  }
}

// Call in game loop
setInterval(updateBuffs, 100);
```

---

## Boss Combat

### Boss Encounter

```javascript
function startBossFight(bossId) {
  // Check if already defeated
  if (player.bossesDefeated.includes(bossId)) {
    showMessage("Boss already defeated!");
    return;
  }

  // Check level requirement
  const boss = getMonster(bossId);
  if (player.level < boss.levelMin) {
    showMessage(`Reach level ${boss.levelMin} first!`);
    return;
  }

  // Spawn boss
  currentMonster = createMonsterInstance(boss);
  currentMonster.isBoss = true;
  combatState = CombatState.ACTIVE;

  showMessage(`${boss.name} appears!`);
  playBossMusic();  // Future
}
```

### Boss Death

```javascript
function killBoss() {
  // Normal rewards
  const goldReward = calculateGoldReward(currentMonster);
  const xpReward = calculateXPReward(currentMonster);
  giveGold(player, goldReward);
  giveXP(player, xpReward);

  // Mark defeated
  player.bossesDefeated.push(currentMonster.definitionId);
  player.statistics.totalBossKills++;

  // Unlock next zone
  const nextZone = getNextZone(player.currentZone);
  if (nextZone && !player.unlockedZones.includes(nextZone.id)) {
    player.unlockedZones.push(nextZone.id);
    showZoneUnlockCelebration(nextZone);
  }

  // Guaranteed loot
  const boss = getMonster(currentMonster.definitionId);
  for (const loot of boss.lootTable) {
    if (loot.chance >= 1.0) {
      giveItem(player, loot.itemId);
    }
  }

  // Celebration
  showBossDefeatCelebration();
}
```

---

## Damage Numbers

### Display System

```javascript
function displayDamageNumber(damage, isCritical) {
  const damageEl = document.createElement("div");
  damageEl.className = "damage-number";
  damageEl.textContent = damage;

  if (isCritical) {
    damageEl.classList.add("critical");
    damageEl.textContent = damage + "!";
  }

  // Random horizontal offset
  const offsetX = (Math.random() - 0.5) * 60;
  damageEl.style.left = `calc(50% + ${offsetX}px)`;

  // Add to container
  combatContainer.appendChild(damageEl);

  // Remove after animation
  setTimeout(() => {
    damageEl.remove();
  }, DAMAGE_NUMBER_DURATION);
}
```

### CSS Animation

```css
.damage-number {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 0 black;
  animation: float-up 0.8s ease-out forwards;
  pointer-events: none;
}

.damage-number.critical {
  font-size: 32px;
  color: #ff4444;
  animation: float-up-crit 0.8s ease-out forwards;
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px);
  }
}

@keyframes float-up-crit {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-40px) scale(1.3);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px) scale(1);
  }
}
```

---

## Constants Reference

From `_INDEX.md`:

```javascript
const COMBAT_CONSTANTS = {
  MONSTER_SPAWN_DELAY: 500,       // ms
  DAMAGE_NUMBER_DURATION: 800,    // ms
  DEATH_ANIMATION_DURATION: 300,  // ms
  MIN_DAMAGE: 1,
  BASE_PLAYER_ATTACK: 5,
  BASE_CRIT_CHANCE: 0.05,
  BASE_CRIT_MULTIPLIER: 2.0
};
```

---

*Referenced by: combat.js, game.js, ui.js*
*References: _INDEX.md, player.schema.md, monster.schema.md, skill.schema.md*

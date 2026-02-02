# Progression System

> Defines XP curves, leveling, zone unlocks, and skill progression.

## Overview

Progression is the backbone of player engagement:
1. **XP & Leveling** - Core power growth
2. **Zone Unlocks** - Content gates via boss kills
3. **Skill Points** - Build customization
4. **Equipment Tiers** - Gear progression

---

## XP System

### XP to Next Level Formula

```javascript
function calculateXPToNextLevel(level) {
  // From _INDEX.md:
  // BASE_XP_REQUIREMENT = 100
  // XP_GROWTH_RATE = 0.12 (12%)

  return Math.floor(
    BASE_XP_REQUIREMENT * Math.pow(1 + XP_GROWTH_RATE, level - 1)
  );
}
```

### XP Table (Levels 1-100)

| Level | XP Required | Total XP | Est. Kills* |
|-------|-------------|----------|-------------|
| 1→2 | 100 | 100 | 10 |
| 2→3 | 112 | 212 | 11 |
| 3→4 | 125 | 337 | 12 |
| 4→5 | 140 | 477 | 14 |
| 5→6 | 157 | 634 | 15 |
| 10→11 | 277 | 1,976 | 25 |
| 15→16 | 489 | 4,865 | 35 |
| 20→21 | 861 | 10,336 | 50 |
| 25→26 | 1,517 | 19,997 | 70 |
| 30→31 | 2,674 | 36,616 | 100 |
| 40→41 | 8,310 | 106,097 | 200 |
| 50→51 | 25,827 | 298,236 | 350 |
| 60→61 | 80,256 | 815,765 | 500 |
| 70→71 | 249,424 | 2,195,139 | 700 |
| 80→81 | 775,165 | 5,850,527 | 900 |
| 90→91 | 2,409,193 | 15,467,821 | 1200 |
| 99→100 | 6,348,579 | 38,942,621 | 1500 |

*Estimated kills at average XP for that zone range

### Gaining XP

```javascript
function giveXP(player, amount) {
  player.xp += amount;
  player.totalXpEarned += amount;

  // Check for level up (can be multiple levels)
  while (player.xp >= player.xpToNextLevel) {
    levelUp(player);
  }

  updateXPBar();
}
```

---

## Level Up

### Level Up Process

```javascript
function levelUp(player) {
  // Overflow XP carries over
  player.xp -= player.xpToNextLevel;

  // Increment level
  player.level++;

  // Calculate new XP requirement
  player.xpToNextLevel = calculateXPToNextLevel(player.level);

  // Award stat increases
  applyLevelUpStats(player);

  // Award skill point
  player.skillPoints++;

  // Check for unlocks
  checkLevelUnlocks(player);

  // Celebration!
  showLevelUpCelebration(player.level);
}
```

### Level Up Stat Gains

```javascript
function applyLevelUpStats(player) {
  // Base attack increases slightly
  // This is a small boost - main power comes from equipment
  player.stats.attack += 1;  // +1 attack per level

  // Future: maxHealth increases
  // player.stats.maxHealth += 5;
}
```

### Stats by Level (Base Only)

| Level | Attack | Crit % | Crit DMG |
|-------|--------|--------|----------|
| 1 | 5 | 5% | 200% |
| 10 | 14 | 5% | 200% |
| 25 | 29 | 5% | 200% |
| 50 | 54 | 5% | 200% |
| 75 | 79 | 5% | 200% |
| 100 | 104 | 5% | 200% |

*Note: Crit stays flat - improved via gear and skills*

---

## Level Up Celebration

### UI Display

```
┌─────────────────────────────┐
│                             │
│      ⭐ LEVEL UP! ⭐         │
│                             │
│      Level 15               │
│                             │
│      +1 Attack              │
│      +1 Skill Point         │
│                             │
│   🎉 New zone available! 🎉  │
│      Shadowmire Swamp       │
│                             │
└─────────────────────────────┘
```

### Animation Timing

| Element | Delay | Duration |
|---------|-------|----------|
| Screen overlay | 0ms | 2000ms |
| "LEVEL UP!" text | 100ms | Bounce in |
| Level number | 300ms | Scale up |
| Stat gains | 500ms | Fade in |
| Unlock notice | 800ms | Slide in |
| Auto-dismiss | 2000ms | Fade out |

---

## Zone Progression

### Zone Unlock Flow

```
Whisperwood (default)
     │
     ▼ [Defeat Boss Mossback]
     │
Dustwind Plains
     │
     ▼ [Defeat Boss Redfang]
     │
Shadowmire Swamp
     │
     ▼ [Defeat Boss Mire Mother]
     │
Ironhold Peaks
     │
     ▼ [Defeat Boss Grimstone]
     │
Emberfell Wastes
     │
     ▼ [Defeat Boss Pyrax]
     │
Frostpeak Summit
     │
     ▼ [Defeat Boss Glacielle]
     │
The Void Rift
     │
     ▼ [Defeat Final Boss Xal'theron]
     │
GAME COMPLETE! (Prestige unlocked)
```

### Zone Unlock Handler

```javascript
function checkZoneUnlock(player, defeatedBossId) {
  const zones = getAllZones();

  for (const zone of zones) {
    if (zone.unlockCondition.type === "boss" &&
        zone.unlockCondition.bossId === defeatedBossId &&
        !player.unlockedZones.includes(zone.id)) {

      // Unlock the zone
      player.unlockedZones.push(zone.id);

      // Show celebration
      showZoneUnlockCelebration(zone);

      return zone;
    }
  }

  return null;
}
```

### Zone Unlock Celebration

```
┌─────────────────────────────────────┐
│                                     │
│     🗺️ NEW ZONE DISCOVERED! 🗺️      │
│                                     │
│     ═════════════════════════       │
│                                     │
│     🌫️ Shadowmire Swamp             │
│                                     │
│     "A cursed swamp where dark      │
│      magic festers..."              │
│                                     │
│     Recommended Level: 20-30        │
│                                     │
│     [TRAVEL NOW]  [STAY HERE]       │
│                                     │
└─────────────────────────────────────┘
```

---

## Skill Point System

### Earning Skill Points

| Source | Points |
|--------|--------|
| Level up | +1 per level |
| Boss kill (first time) | +1 bonus (future) |
| Achievements (future) | Varies |

### Spending Skill Points

Skill points are NOT spent directly. Instead:
- Skills cost **gold** to unlock/upgrade
- Skill points gate what you can access

Actually, let me revise - in the skill schema we defined gold costs. Let's keep it simple:

**Skills use GOLD only, not skill points.**

Skill points were planned but removed for simplicity. Skills are gold-gated.

*(This is a design simplification - one currency is easier)*

---

## Content Unlocks by Level

### Level-Gated Content

| Level | Unlock |
|-------|--------|
| 1 | Starting skills: Sharp Blades |
| 2 | Power Strike skill |
| 3 | Deep Pockets, Fast Learner skills |
| 5 | Lucky Strikes skill |
| 8 | Gold Rush skill |
| 10 | Auto Clicker skill |
| 15 | Critical Frenzy skill |
| 20 | Monster Slayer skill |

### Level Check Function

```javascript
function checkLevelUnlocks(player) {
  const level = player.level;

  // Check each skill
  for (const skill of getAllSkills()) {
    if (skill.unlockLevel === level) {
      showSkillUnlockNotification(skill);
    }
  }

  // Check for milestone messages
  const milestones = {
    10: "You can now unlock Auto Clicker!",
    25: "Halfway to level 50!",
    50: "You've reached the halfway point!",
    75: "The Void Rift awaits...",
    100: "Maximum level achieved!"
  };

  if (milestones[level]) {
    showMilestoneMessage(milestones[level]);
  }
}
```

---

## Recommended Level Ranges

### Zone vs Player Level

| Zone | Zone Range | Recommended Entry | Comfortable Clear |
|------|------------|-------------------|-------------------|
| Whisperwood | 1-10 | 1 | 8-10 |
| Dustwind | 10-20 | 10 | 18-20 |
| Shadowmire | 20-30 | 20 | 28-30 |
| Ironhold | 30-45 | 30 | 42-45 |
| Emberfell | 45-60 | 45 | 57-60 |
| Frostpeak | 60-75 | 60 | 72-75 |
| Voidrift | 75-100 | 75 | 95-100 |

### Under-leveled Penalties

No hard restrictions, but:
- Monsters take many more clicks
- Death risk (future HP system)
- Slower XP/gold per time invested

### Over-leveled Benefits

- Faster clears
- Easy farming
- But reduced XP efficiency (better to push forward)

---

## Progression Pacing Goals

### Target Time per Level

| Level Range | Target Time | Notes |
|-------------|-------------|-------|
| 1-10 | 30sec - 2min | Rapid early dopamine |
| 10-20 | 2-5min | Still quick |
| 20-35 | 5-10min | Meaningful sessions |
| 35-50 | 10-20min | Engaged grinding |
| 50-70 | 20-45min | Dedicated sessions |
| 70-85 | 45min-1.5hr | Long-term investment |
| 85-100 | 1-3hr | End-game dedication |

### Total Time to Max Level

Estimated: **50-100 hours** of active play

This can vary significantly based on:
- Equipment quality
- Skill investments
- Click speed / auto-attack level
- Zone efficiency

---

## Progress Save Points

### Auto-save Triggers

| Event | Auto-save? |
|-------|------------|
| Level up | Yes |
| Boss kill | Yes |
| Zone change | Yes |
| Item equip | Yes |
| Skill purchase | Yes |
| Every 30 seconds | Yes |
| Tab close/minimize | Yes (beforeunload) |

### Save Implementation

```javascript
function saveGame() {
  player.lastSavedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(player));
}

// Auto-save interval
setInterval(saveGame, AUTO_SAVE_INTERVAL);

// Save on critical events
function levelUp(player) {
  // ... level up logic
  saveGame();
}

// Save before leaving
window.addEventListener("beforeunload", saveGame);
```

---

## Prestige System (Future - v2.0)

### Concept

After defeating the final boss:
- Option to "Rebirth" (reset progress)
- Gain permanent multipliers
- New cosmetics/titles
- Harder mode unlocked

### Prestige Bonuses

| Prestige Level | Bonus |
|----------------|-------|
| 1 | +10% all XP |
| 2 | +10% all gold |
| 3 | +5% crit chance |
| 4 | +20% attack |
| 5 | +25% all stats |
| ... | Escalating |

### What Resets

| Keeps | Resets |
|-------|--------|
| Prestige level | Player level (→1) |
| Prestige bonuses | Gold (→0) |
| Total statistics | Equipment |
| Achievements | Zone progress |
| Cosmetics | Skills |

---

*Referenced by: player.js, game.js, ui.js*
*References: _INDEX.md, player.schema.md, zone.schema.md, skill.schema.md*

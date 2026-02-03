# Tutorial System

> Defines onboarding, first-time experiences, and milestone celebrations.

---

## Overview

The tutorial system ensures new players:
- Understand core mechanics immediately
- Feel rewarded for early progress
- Learn systems as they become relevant
- Never feel lost or confused

---

## Tutorial Philosophy

### Principles

1. **Show, Don't Tell** - Interactive prompts, not text walls
2. **Just-In-Time** - Teach when relevant, not all at once
3. **Celebrate Progress** - Every first feels special
4. **Non-Intrusive** - Can be dismissed, doesn't block gameplay
5. **Contextual** - Highlights appear on the actual UI elements

---

## First Load Experience

### Step 1: Welcome Screen

```
┌─────────────────────────────────────────┐
│                                         │
│          ⚔️ REALMS OF CLICKORIA ⚔️       │
│                                         │
│     Welcome, adventurer!                │
│                                         │
│     The Void threatens the realm.       │
│     Only your clicking power can        │
│     stop the corruption.                │
│                                         │
│     Tap anywhere to begin...            │
│                                         │
└─────────────────────────────────────────┘

Duration: Until player taps
Audio: Epic intro music (if enabled)
```

### Step 2: First Monster

```
┌─────────────────────────────────────────┐
│ 🌲 Whisperwood Glen                     │
├─────────────────────────────────────────┤
│                                         │
│            ┌───────────────┐            │
│            │     ╔═══╗     │            │
│            │     ║🧚 ║     │ ← Pulsing
│            │     ╚═══╝     │   highlight
│            │ Forest Sprite │            │
│            └───────────────┘            │
│                                         │
│      ┌─────────────────────────┐        │
│      │   👆 TAP THE MONSTER!   │        │
│      │      to attack          │        │
│      └─────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘

Trigger: First load, monster spawned
Action: Highlight monster area with pulsing border
Dismissal: Player taps monster
```

### Step 3: First Kill

```
┌─────────────────────────────────────────┐
│                                         │
│        ⚔️ FIRST BLOOD! ⚔️                │
│                                         │
│     You defeated your first monster!    │
│                                         │
│     +3 Gold 💰                          │
│     +8 XP ⭐                            │
│                                         │
│     Keep clicking to grow stronger!     │
│                                         │
│           [CONTINUE]                    │
└─────────────────────────────────────────┘

Trigger: First monster killed
Reward: Bonus 10 gold (first kill bonus)
Animation: Celebration particles
```

---

## Progressive Tutorial Steps

### Tutorial Flow

| Step | Trigger | What's Taught |
|------|---------|---------------|
| 1 | First load | Tap to attack |
| 2 | First kill | Gold and XP rewards |
| 3 | First level up | Stats and progression |
| 4 | First skill unlock | How skills work |
| 5 | First energy full | Energy and skill usage |
| 6 | First shop access | Buying equipment |
| 7 | First item bought | Equipping gear |
| 8 | First aggressive monster | Dodging attacks |
| 9 | First zone unlock | Zone travel |
| 10 | First boss | Boss mechanics |

### Step 4: First Level Up (Level 2)

```
┌─────────────────────────────────────────┐
│          ✨ LEVEL UP! ✨                 │
│                                         │
│              Level 2                    │
│                                         │
│           ────────────                  │
│                                         │
│           +1 Base Attack                │
│           +10 Max HP                    │
│                                         │
│           [AWESOME!]                    │
└─────────────────────────────────────────┘
```

### Step 4b: Skill Bar Introduction (After First Kill)

Power Strike is available from the start. After the player's first kill:

```
┌──────────────────────────────────────┐
│ This is your SKILL BAR               │
│ You have Power Strike equipped!      │
│ Tap it when you have enough Energy.  │
└──────────────────────────────────────┘
      ↓
[⚔️ Power Strike] [ Empty ] [ Empty ] [ Empty ]
```

### Step 5: First Energy Full

```
Trigger: Energy reaches 100 for first time

┌─────────────────────────────────────┐
│ ⚡ ENERGY FULL!                      │
│                                     │
│ Your Energy bar is full.            │
│ Use a SKILL to spend it!            │
│                                     │
│ Tap Power Strike now →              │
└─────────────────────────────────────┘
              ↓
    [⚔️ Power Strike] (pulsing)
```

### Step 6: First Shop Access (Level 3)

```
Trigger: Player reaches level 3 OR has 50+ gold

Toast notification:
┌─────────────────────────────────────┐
│ 💡 TIP: Visit the SHOP to buy       │
│ better equipment!                   │
│ [🛒 Shop] → (pulsing highlight)     │
└─────────────────────────────────────┘
```

### Step 7: First Item Bought

```
Trigger: Player buys first item

┌─────────────────────────────────────────┐
│          🗡️ NEW WEAPON! 🗡️              │
│                                         │
│          Rusty Sword                    │
│          +4 Attack                      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Your weapon is AUTO-EQUIPPED!   │    │
│  │                                 │    │
│  │ Old attack: 6                   │    │
│  │ New attack: 10 (+4)  ↑          │    │
│  └─────────────────────────────────┘    │
│                                         │
│          [START SLAYING!]               │
└─────────────────────────────────────────┘
```

### Step 8: First Aggressive Monster (Level 5)

```
Trigger: First Aggressive-type monster spawns

Pre-spawn warning:
┌─────────────────────────────────────────┐
│          ⚠️ NEW THREAT! ⚠️               │
│                                         │
│     This monster FIGHTS BACK!           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  When it GLOWS RED:             │    │
│  │  ❌ DON'T CLICK!                 │    │
│  │                                 │    │
│  │  Wait for it to attack,         │    │
│  │  then resume clicking.          │    │
│  └─────────────────────────────────┘    │
│                                         │
│          [I'M READY!]                   │
└─────────────────────────────────────────┘

During fight, show helper:
┌──────────────────────────┐
│ Monster is ATTACKING!    │
│ Wait for the red to fade │
└──────────────────────────┘
```

### Step 9: First Zone Unlock

```
Trigger: Boss killed, new zone unlocked

Boss Defeated modal includes:

│     🗺️ NEW ZONE UNLOCKED!               │
│        Dustwind Plains                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Zones have stronger monsters   │    │
│  │  but BETTER rewards!            │    │
│  │                                 │    │
│  │  You can always return to       │    │
│  │  previous zones to farm.        │    │
│  └─────────────────────────────────┘    │
│                                         │
│     [CONTINUE]    [TRAVEL NOW]          │
```

### Step 10: First Boss

```
Trigger: Player clicks "FIGHT BOSS" first time

┌─────────────────────────────────────────┐
│           ⚔️ BOSS FIGHT! ⚔️              │
│                                         │
│        Old Mossback Awaits...           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  BOSS TIPS:                     │    │
│  │                                 │    │
│  │  • Bosses have HIGH HP          │    │
│  │  • They ATTACK frequently       │    │
│  │  • Use skills wisely!           │    │
│  │  • Heal when HP is low          │    │
│  │                                 │    │
│  │  Defeating the boss unlocks     │    │
│  │  the next zone!                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│          [BEGIN BATTLE]                 │
└─────────────────────────────────────────┘
```

---

## First-Time Bonuses

### Bonus Rewards

| First-Time Event | Bonus Reward |
|------------------|--------------|
| First kill | +10 gold |
| First level up | Full HP heal |
| First skill use | +25 Energy |
| First item bought | +25 gold back |
| First boss killed | +50% gold and XP |
| First zone travel | Full HP and Energy |
| First death | Mercy: no gold loss |

### Implementation

```javascript
function checkFirstTimeBonus(eventType, player) {
  const key = `first_${eventType}`;

  if (!player.tutorial.completed[key]) {
    player.tutorial.completed[key] = true;

    switch(eventType) {
      case 'kill':
        giveGold(player, 10);
        showToast('First Blood! +10 gold bonus!');
        break;
      case 'boss_killed':
        // Already handled in boss reward
        break;
      case 'death':
        player.gold = player.goldBeforeDeath; // No loss first time
        showToast('First defeat! No gold lost this time.');
        break;
      // ... etc
    }
  }
}
```

---

## Contextual Tips

### Tip System

Tips appear as small toast notifications when relevant:

```
Condition: Player at full HP for 30+ seconds, has Heal skill
Tip: "💡 Your HP is full. Save Heal for when you need it!"

Condition: Player has 1000+ gold, hasn't visited shop
Tip: "💡 You have a lot of gold! Check the Shop for upgrades."

Condition: Player dying repeatedly in zone
Tip: "💡 This zone might be too hard. Try the previous zone to level up!"

Condition: Player has skill but hasn't used it in 60+ seconds
Tip: "💡 Don't forget your skills! Tap [Power Strike] for bonus damage."
```

### Tip Frequency

```javascript
const TIP_CONSTANTS = {
  MIN_TIME_BETWEEN_TIPS: 60,      // seconds
  MAX_TIPS_PER_SESSION: 10,       // don't annoy player
  TIP_DISPLAY_DURATION: 5,        // seconds visible
  TIPS_DISABLED_AFTER_LEVEL: 20   // experienced player
};
```

---

## Tutorial State Tracking

### Player Tutorial Object

```javascript
player.tutorial = {
  completed: {
    first_load: true,
    first_kill: true,
    first_level_up: true,
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
  tipsShown: 3,
  lastTipTime: 1234567890,
  tutorialEnabled: true  // User can disable
};
```

---

## Skipping Tutorial

### For Returning Players

```
On load, if save exists:
- Skip all tutorial steps
- Don't show first-time modals
- Tips still enabled (can disable in settings)
```

### Manual Skip

```
Settings → Tutorial

[x] Show gameplay tips
[ ] Reset tutorial (for testing)

Note: Tutorial resets on New Game
```

---

## Visual Highlighting

### Highlight Styles

```css
/* Pulsing highlight for tutorial focus */
.tutorial-highlight {
  animation: tutorial-pulse 1.5s infinite;
  box-shadow: 0 0 20px var(--accent-color);
}

@keyframes tutorial-pulse {
  0%, 100% { box-shadow: 0 0 10px var(--accent-color); }
  50% { box-shadow: 0 0 30px var(--accent-color); }
}

/* Arrow pointing to element */
.tutorial-arrow {
  position: absolute;
  animation: bounce 1s infinite;
}

/* Dimmed background */
.tutorial-backdrop {
  background: rgba(0, 0, 0, 0.7);
}
```

### Highlight Targets

| Element | When Highlighted |
|---------|------------------|
| Monster area | First load |
| Skill bar | After first skill unlock |
| Specific skill | When teaching skill usage |
| Shop button | When suggesting shop visit |
| HP bar | First time taking damage |
| Energy bar | First time full |

---

## Tutorial Messages

### Writing Style

- Short sentences
- Action-oriented
- Positive tone
- No jargon
- Use emojis sparingly for emphasis

### Examples

```
✓ "Tap the monster to attack!"
✗ "Click on the enemy unit to initiate a standard attack action"

✓ "Nice! You earned 10 gold."
✗ "Currency has been added to your account balance."

✓ "This monster attacks! Watch for the red glow."
✗ "Aggressive-type enemies have a periodic attack pattern."
```

---

## Constants Reference

```javascript
const TUTORIAL_CONSTANTS = {
  // First-time bonuses
  FIRST_KILL_BONUS_GOLD: 10,
  FIRST_BOSS_BONUS_MULTIPLIER: 1.5,

  // Tips
  MIN_TIME_BETWEEN_TIPS: 60,
  MAX_TIPS_PER_SESSION: 10,
  TIP_DISPLAY_DURATION: 5,
  TIPS_DISABLED_AFTER_LEVEL: 20,

  // Highlight
  HIGHLIGHT_PULSE_DURATION: 1500,    // ms
  ARROW_BOUNCE_DURATION: 1000,       // ms

  // Modal display times
  FIRST_BLOOD_DISPLAY: 3000,         // ms
  LEVEL_UP_DISPLAY: 2500,            // ms
  BOSS_DEFEATED_DISPLAY: 4000        // ms
};
```

---

*The tutorial should feel like a helpful guide, not a roadblock. Players should learn by doing, with gentle nudges in the right direction.*

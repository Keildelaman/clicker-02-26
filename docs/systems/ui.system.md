# UI System

> Defines all user interface elements, screens, navigation, and feedback systems.

---

## Screen Layout (Mobile-First)

### Primary Combat Screen

```
┌─────────────────────────────────────────┐
│ 🌲 Whisperwood Glen           Lv. 12 🎮 │ ← Header (zone + level + menu)
├─────────────────────────────────────────┤
│                                         │
│            ┌───────────────┐            │
│            │               │            │
│            │      🐗       │  ← Monster Area
│            │   Wild Boar   │     (tappable)
│            │    Lv. 5      │            │
│            │               │            │
│            └───────────────┘            │
│                                         │
│         ████████████░░░░░░              │ ← Monster Health Bar
│            45 / 100 HP                  │
│                                         │
├─────────────────────────────────────────┤
│  ⚔️ 24    💰 1,234    ⭐ 15%    ⚡ 2/s   │ ← Stats Bar
├─────────────────────────────────────────┤
│  ████████████████░░░░  Lv.12 (75%)      │ ← XP Bar
├─────────────────────────────────────────┤
│ [💥 30s] [🪙 45s] [⚡ 1:20] [☠️ Ready]  │ ← Skills Bar
├─────────────────────────────────────────┤
│ [🗺️ Zones] [🛒 Shop] [📊 Skills] [⚙️]  │ ← Navigation
└─────────────────────────────────────────┘
```

### Screen Components

| Area | Size (Mobile) | Content |
|------|---------------|---------|
| Header | 48px height | Zone name, player level, menu button |
| Monster Area | ~50% height | Monster emoji/sprite, name, level, tap target |
| Health Bar | 32px height | HP bar, current/max HP text |
| Stats Bar | 40px height | Attack, gold, crit%, auto-attack |
| XP Bar | 24px height | XP progress, level indicator |
| Skills Bar | 56px height | Active skill buttons with cooldowns |
| Navigation | 56px height | Screen switching buttons |

---

## Navigation Flow

```
                    ┌──────────────┐
                    │   COMBAT     │ ← Default screen
                    │   (Main)     │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  ZONES   │    │   SHOP   │    │  SKILLS  │
    │ (Modal)  │    │ (Screen) │    │ (Screen) │
    └──────────┘    └──────────┘    └──────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
             ┌──────────┐  ┌──────────┐
             │ Weapons  │  │ Access.  │
             │  (Tab)   │  │  (Tab)   │
             └──────────┘  └──────────┘

    ┌──────────┐
    │ SETTINGS │ ← From gear icon
    │ (Modal)  │
    └──────────┘
```

### Screen Types

| Type | Behavior | Example |
|------|----------|---------|
| Main | Always visible, game runs | Combat |
| Screen | Replaces main, game pauses | Shop, Skills |
| Modal | Overlay on current, dimmed background | Zones, Settings, Level Up |

---

## Shop Screen

```
┌─────────────────────────────────────────┐
│ ← Back        SHOP           💰 1,234   │
├─────────────────────────────────────────┤
│  [⚔️ Weapons]  [🛡️ Armor]  [💍 Access]  │ ← Tabs
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🗡️ Hunter's Blade               │    │
│  │ Uncommon Weapon                  │    │
│  │ +8 Attack  +2% Crit             │    │
│  │ Requires: Level 5               │    │
│  │ ─────────────────────────────── │    │
│  │ [BUY 125g]           [EQUIPPED] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🌿 Mossback's Branch   🔒       │ ← Locked (not owned)
│  │ Rare Weapon                      │    │
│  │ +12 Attack  +3% Crit            │    │
│  │ Requires: Level 8               │    │
│  │ ─────────────────────────────── │    │
│  │ [DROP ONLY]                      │ ← Can't buy
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Shop Item States

| State | Visual | Action |
|-------|--------|--------|
| Owned + Equipped | Green border, "EQUIPPED" badge | Unequip button |
| Owned + Unequipped | Normal, in inventory | Equip button |
| Buyable | Price shown, button enabled | Buy button |
| Too Expensive | Price in red, button grayed | None (show cost) |
| Level Locked | Lock icon, grayed | Show requirement |
| Drop Only | "Drop Only" text, no button | None |

---

## Skills Screen

```
┌─────────────────────────────────────────┐
│ ← Back       SKILLS         SP: 5       │
├─────────────────────────────────────────┤
│  [⚔️ Offense]  [💰 Utility]  [⚙️ Auto]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚔️ Sharp Blades        Lv 3/10  │    │
│  │ [████████░░░░░░░░░░░░]          │    │
│  │ +15% Attack                      │    │
│  │                                  │    │
│  │ Next: +20% Attack (200g)        │    │
│  │ [UPGRADE 200g]                   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🍀 Lucky Strikes       Lv 0/10  │ ← Not unlocked
│  │ [░░░░░░░░░░░░░░░░░░░░]          │    │
│  │ +2% Crit Chance per level       │    │
│  │                                  │    │
│  │ Unlock at: Level 5 (100g)       │    │
│  │ [LOCKED - Level 5]               │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Zone Selection (Modal)

```
┌─────────────────────────────────────────┐
│              SELECT ZONE           ✕    │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🌲 Whisperwood Glen     ✓ Current │  │
│  │    Levels 1-10                    │  │
│  │    [TRAVEL]                       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🌾 Dustwind Plains      ✓ Unlocked│  │
│  │    Levels 10-20                   │  │
│  │    [TRAVEL]                       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🌫️ Shadowmire Swamp    🔒 Locked  │  │
│  │    Levels 20-30                   │  │
│  │    Defeat: Redfang                │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ⛰️ Ironhold Peaks      🔒 Locked  │  │
│  │ 🌋 Emberfell Wastes    🔒 Locked  │  │ ← Collapsed
│  │ ❄️ Frostpeak Summit    🔒 Locked  │  │
│  │ 🌀 The Void Rift       🔒 Locked  │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│              [FIGHT BOSS]               │ ← If boss available
└─────────────────────────────────────────┘
```

---

## Settings Modal

```
┌─────────────────────────────────────────┐
│              SETTINGS              ✕    │
├─────────────────────────────────────────┤
│                                         │
│  Sound Effects        [████████░░] 80%  │
│  Music                [░░░░░░░░░░] Off  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Auto-Save            [ON] / OFF        │
│  Damage Numbers       [ON] / OFF        │
│  Screen Shake         ON / [OFF]        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [EXPORT SAVE]     Copy save to clipboard│
│  [IMPORT SAVE]     Paste save from clipboard│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [NEW GAME]        ⚠️ Deletes all progress│
│                                         │
└─────────────────────────────────────────┘
```

---

## Notification System

### Toast Notifications

```
┌─────────────────────────────────────────┐
│                                         │
│    ┌──────────────────────────────┐     │
│    │ ✓ Purchased Hunter's Blade!  │ ← Success (green)
│    └──────────────────────────────┘     │
│                                         │
│    ┌──────────────────────────────┐     │
│    │ ⚠️ Not enough gold!          │ ← Warning (yellow)
│    └──────────────────────────────┘     │
│                                         │
│    ┌──────────────────────────────┐     │
│    │ ❌ Save failed!              │ ← Error (red)
│    └──────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### Notification Types

| Type | Color | Icon | Duration | Sound |
|------|-------|------|----------|-------|
| Success | Green | ✓ | 2s | Ding |
| Info | Blue | ℹ️ | 3s | None |
| Warning | Yellow | ⚠️ | 4s | Alert |
| Error | Red | ❌ | 5s | Error |
| Achievement | Gold | 🏆 | 5s | Fanfare |

### Notification Queue

```javascript
// Max 3 visible at once
// New notifications push from top
// Auto-dismiss after duration
// Swipe to dismiss (mobile)
```

---

## Celebration Modals

### Level Up

```
┌─────────────────────────────────────────┐
│          ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨          │
│                                         │
│              ⭐ LEVEL UP! ⭐             │
│                                         │
│               Level 15                  │
│                                         │
│              ───────────                │
│                                         │
│              +1 Attack                  │
│                                         │
│     🆕 New skill available: Gold Rush   │
│                                         │
│          ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨          │
│                                         │
│              [AWESOME!]                 │
└─────────────────────────────────────────┘

Duration: 2 seconds or tap to dismiss
Animation: Bounce in, particles, confetti
```

### Boss Defeated

```
┌─────────────────────────────────────────┐
│          ⚔️ ⚔️ ⚔️ ⚔️ ⚔️ ⚔️ ⚔️ ⚔️          │
│                                         │
│           💀 BOSS DEFEATED! 💀          │
│                                         │
│            Old Mossback                 │
│                                         │
│              ───────────                │
│                                         │
│        Rewards:                         │
│        💰 125 Gold                      │
│        ⭐ 225 XP                        │
│        🌿 Mossback's Branch             │
│                                         │
│              ───────────                │
│                                         │
│     🗺️ NEW ZONE UNLOCKED!               │
│        Dustwind Plains                  │
│                                         │
│     [CONTINUE]    [TRAVEL NOW]          │
└─────────────────────────────────────────┘
```

### Rare Item Drop

```
┌─────────────────────────────────────────┐
│         💎 💎 💎 💎 💎 💎 💎 💎         │
│                                         │
│           ★ RARE DROP! ★                │
│                                         │
│           🌿 Mossback's Branch          │
│              Rare Weapon                │
│                                         │
│           +12 Attack                    │
│           +3% Critical                  │
│                                         │
│         💎 💎 💎 💎 💎 💎 💎 💎         │
│                                         │
│       [EQUIP NOW]    [LATER]            │
└─────────────────────────────────────────┘
```

---

## Combat Feedback

### Damage Numbers

```
Position: Float from monster center
Movement: Rise 80px over 800ms
Fade: 100% to 0% opacity

Normal hit:   White, 24px, "42"
Critical:     Red, 32px, "84!", scale pulse
Skill boost:  Orange, 36px, "420!"
```

### Health Bar Animation

```css
/* Smooth health decrease */
.health-bar-fill {
  transition: width 0.3s ease-out;
}

/* Flash red on damage */
.health-bar-fill.damaged {
  animation: flash-red 0.2s;
}

/* Low health warning */
.health-bar-fill.critical {
  animation: pulse-red 1s infinite;
}
```

### Monster Death

```
1. Monster fades (300ms)
2. Death emoji appears (deathEmoji from data)
3. Gold coins animate to gold counter
4. XP bar flashes and fills
5. Delay (500ms)
6. New monster spawns (fade in 200ms)
```

---

## Touch Interactions

### Tap Targets

| Element | Min Size | Spacing |
|---------|----------|---------|
| Monster area | Full width | - |
| Buttons | 44×44px | 8px |
| Skill buttons | 48×48px | 4px |
| List items | Full width, 48px height | - |

### Gestures

| Gesture | Context | Action |
|---------|---------|--------|
| Tap | Monster | Attack |
| Tap | Skill button | Use skill |
| Tap | Nav button | Switch screen |
| Swipe left | Notification | Dismiss |
| Long press | Item | Show details |
| Pull down | Main screen | Manual refresh (future) |

### Haptic Feedback (PWA future)

| Event | Vibration |
|-------|-----------|
| Attack | 10ms light |
| Critical | 30ms medium |
| Level up | 100ms strong |
| Error | 50ms, 50ms, 50ms |

---

## Responsive Breakpoints

```css
/* Mobile (default) */
/* 320px - 767px */

/* Tablet */
@media (min-width: 768px) {
  /* Side-by-side layouts */
  /* Larger touch targets */
  /* More visible stats */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Keyboard shortcuts */
  /* Hover states */
  /* Wider layouts */
  /* Mouse cursors */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Max-width container */
  /* Optional side panels */
}
```

### Mobile Constraints

```css
/* Prevent accidental zoom */
input, select, textarea {
  font-size: 16px;  /* iOS zoom prevention */
}

/* Safe area for notched devices */
padding-bottom: env(safe-area-inset-bottom);

/* Prevent pull-to-refresh interference */
html {
  overscroll-behavior: none;
}
```

---

## Loading States

### Initial Load

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│          ⚔️ Realms of Clickoria        │
│                                         │
│          [████████████░░░░░]            │
│               Loading...                │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Screen Transition

```
Fade out: 150ms
Fade in: 150ms
Total: 300ms

Or instant swap with animation on new content
```

---

## Error States

### Save Failed

```
Toast: "Save failed! Check storage space."
Action: Retry button in settings
Fallback: Offer export to clipboard
```

### Corrupted Save

```
Modal:
"Save data corrupted.
 Would you like to start a new game?"

[START FRESH]   [TRY ANYWAY]
```

### Offline (Future PWA)

```
Banner at top:
"You're offline. Progress will save when connected."
```

---

## Accessibility Checklist

- [ ] All interactive elements focusable
- [ ] Focus order logical
- [ ] Focus indicators visible
- [ ] Color contrast ≥ 4.5:1
- [ ] Text resizable to 200%
- [ ] Touch targets ≥ 44px
- [ ] Animations reduceable (prefers-reduced-motion)
- [ ] Screen reader announcements for:
  - Level up
  - Monster killed
  - Zone change
  - Notifications
- [ ] No flashing content

---

*All UI must be mobile-first, accessible, and satisfying.*

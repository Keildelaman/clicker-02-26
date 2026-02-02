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
│            │   AGGRESSIVE  │  ← Monster Type Badge
│            │               │            │
│            └───────────────┘            │
│                                         │
│         ████████████░░░░░░              │ ← Monster Health Bar
│            45 / 100 HP                  │
│         [🛡️ SHIELD: ███░░]              │ ← Shield Bar (if shielded)
│         [⏱️ ESCAPE: 4.2s]               │ ← Escape Timer (if swift)
│                                         │
├─────────────────────────────────────────┤
│ ❤️ ████████████████░░░░  180/220 HP     │ ← Player Health Bar
│ ⚡ ████████████░░░░░░░░  62/100 Energy  │ ← Player Energy Bar
├─────────────────────────────────────────┤
│  ⚔️ 24    💰 1,234    ⭐ 15%            │ ← Stats Bar
├─────────────────────────────────────────┤
│  ████████████████░░░░  Lv.12 (75%)      │ ← XP Bar
├─────────────────────────────────────────┤
│ [⚔️ Ready] [💚 20s] [🛡️ 45s] [☠️ 1:20] │ ← Active Skills Bar (4 slots)
├─────────────────────────────────────────┤
│ [🗺️ Zones] [🛒 Shop] [📊 Skills] [⚙️]  │ ← Navigation
└─────────────────────────────────────────┘
```

### Screen Components

| Area | Size (Mobile) | Content |
|------|---------------|---------|
| Header | 48px height | Zone name, player level, menu button |
| Monster Area | ~40% height | Monster emoji/sprite, name, level, type badge, tap target |
| Monster Health | 32px height | HP bar, shield bar (if shielded), escape timer (if swift) |
| Player Bars | 48px height | Player HP bar and Energy bar |
| Stats Bar | 32px height | Attack, gold, crit% |
| XP Bar | 24px height | XP progress, level indicator |
| Active Skills | 56px height | 4 active skill buttons with cooldowns |
| Navigation | 56px height | Screen switching buttons |

### Monster Type Indicators

| Type | Visual Indicator |
|------|------------------|
| Normal | No badge |
| Swift | ⏱️ Timer countdown + yellow pulsing border |
| Aggressive | ⚔️ Badge + attack phase indicator |
| Regenerating | 💚 Badge + HP regen animation |
| Armored | 🛡️ Badge + armor value shown |
| Shielded | Shield bar above HP bar |

### Aggressive Monster Attack Phases

```
SAFE PHASE:        Monster border = normal
                   "TAP TO ATTACK"

WARNING PHASE:     Monster border = yellow pulse
                   ⚠️ WARNING icon appears
                   "ATTACK INCOMING!"

ATTACK PHASE:      Monster border = red
                   Monster glows red
                   "DON'T CLICK!"
                   Screen edges flash red
```

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
│ ← Back         SKILLS                   │
├─────────────────────────────────────────┤
│  [⚔️ Active]  [📈 Passive]  [🔮 All]   │ ← Tabs
├─────────────────────────────────────────┤
│                                         │
│  EQUIPPED ACTIVE SKILLS (4 Slots)       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ⚔️  │ │ 💚  │ │ 🛡️  │ │ ➕  │       │
│  │ Lv3 │ │ Lv2 │ │ Lv1 │ │Empty│       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│  EQUIPPED PASSIVE SKILLS (3 Slots)      │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │ 🗡️ Lv2│ │ 💰 Lv1│ │ ➕    │         │
│  │ Sharp │ │ Gold  │ │ Empty │         │
│  └───────┘ └───────┘ └───────┘         │
│                                         │
├─────────────────────────────────────────┤
│  ALL SKILLS                             │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚔️ Power Strike        Lv 3/5   │    │
│  │ Deal 4x damage on next click    │    │
│  │ Energy: 15 | Cooldown: 5s       │    │
│  │ ─────────────────────────────── │    │
│  │ [UPGRADE 500g]    [UNEQUIP]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💚 Heal                 Lv 2/5  │    │
│  │ Restore 30% max HP              │    │
│  │ Energy: 20 | Cooldown: 15s      │    │
│  │ ─────────────────────────────── │    │
│  │ [UPGRADE 400g]    [UNEQUIP]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ☠️ Execute           🔒 LOCKED  │    │
│  │ Instant kill if monster <15% HP │    │
│  │ Unlocks at: Level 10            │    │
│  │ ─────────────────────────────── │    │
│  │ [LOCKED]                         │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Skill Unlock Modal

When player reaches a skill unlock milestone:

```
┌─────────────────────────────────────────┐
│          🎉 NEW SKILL AVAILABLE! 🎉     │
├─────────────────────────────────────────┤
│                                         │
│     Choose ONE skill to unlock:         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚔️ Power Strike                 │    │
│  │ Deal 3x damage on next click    │    │
│  │ Great for burst damage          │    │
│  │ ─────────────────────────────── │    │
│  │         [CHOOSE THIS]           │    │
│  └─────────────────────────────────┘    │
│                                         │
│              ── OR ──                   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💚 Heal                          │    │
│  │ Restore 25% max HP              │    │
│  │ Essential for survival          │    │
│  │ ─────────────────────────────── │    │
│  │         [CHOOSE THIS]           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Note: Unchosen skill can be bought     │
│  later from the shop (500g)             │
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
│              +1 Base Attack             │
│              +10 Max HP                 │
│              ❤️ Full HP Restored!       │
│                                         │
│          ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨          │
│                                         │
│              [AWESOME!]                 │
└─────────────────────────────────────────┘

At skill unlock milestones:
┌─────────────────────────────────────────┐
│              [AWESOME!]                 │
│                                         │
│     🆕 NEW SKILL AVAILABLE!             │
│        Choose your new skill →          │
└─────────────────────────────────────────┘

Duration: 2 seconds or tap to dismiss
Animation: Bounce in, particles, confetti
```

### Player Death (Retreat)

```
┌─────────────────────────────────────────┐
│              💀 RETREAT! 💀              │
│                                         │
│     You've been forced to retreat...    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  LOST:                                  │
│  ├── Level progress (37 → 30)           │
│  ├── 50% of gold (1,240g lost)          │
│  └── Current monster escaped            │
│                                         │
│  KEPT:                                  │
│  ├── All equipment                      │
│  ├── All skills                         │
│  └── Zone unlocks                       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Tip: Use Heal skill when HP is low!    │
│                                         │
│              [CONTINUE]                 │
└─────────────────────────────────────────┘
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

## Player Resource Bars

### HP Bar

```
Visual states:
- Green (>50%):  ❤️ ████████████████████ 220/220 HP
- Yellow (25-50%): ❤️ ██████████░░░░░░░░░░ 110/220 HP (pulses slowly)
- Red (<25%):    ❤️ ███░░░░░░░░░░░░░░░░░ 50/220 HP (pulses fast)

Damage taken:
- Bar depletes with animation
- Red flash on screen edges (100ms)
- Damage number floats up in red

Healing:
- Bar fills with green glow
- Heal number floats up in green
- Sparkle effect at bar edge
```

### Energy Bar

```
Visual states:
- Normal:       ⚡ ████████████░░░░░░░░ 62/100
- Full:         ⚡ ████████████████████ 100/100 (glows, "Energy Full!")
- Low (<20):    ⚡ ███░░░░░░░░░░░░░░░░░ 15/100 (dimmed)

On click: "+5" floats up (small, quick)
On skill use: Bar depletes with animation
On kill: "+15" floats up (gold color)
```

### Consumables Tray

```
┌─────────────────────────────────────────┐
│  [❤️ x5 | Ready] [⚡ x3 | 45s] [🔷 x2]  │
└─────────────────────────────────────────┘

Tap to use. Shows cooldown countdown.
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
Armor reduced: Gray, 20px, "42 (-15)" for armored
Shield hit:   Blue, 24px, "42 🛡️"
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
5. Energy +15 floats up
6. Delay (500ms)
7. New monster spawns (fade in 200ms)
```

### Player Takes Damage

```
1. Screen edges flash red (100ms)
2. Damage number floats above player HP bar
3. HP bar depletes with animation
4. If HP < 25%: Bar pulses, warning tone
5. If HP = 0: Death modal appears
```

### Swift Monster Escapes

```
1. Monster starts fleeing animation
2. Timer reaches 0
3. "ESCAPED!" text appears
4. Player takes damage (screen flash)
5. Monster fades quickly
6. New monster spawns
```

### Aggressive Monster Attack

```
WARNING PHASE:
1. Monster border turns yellow
2. ⚠️ icon pulses above monster
3. "INCOMING ATTACK!" text

ATTACK PHASE:
1. Monster glows red
2. Border turns red
3. "DON'T CLICK!" warning

If player clicks during attack:
1. Player takes damage
2. Screen flash red
3. "OUCH!" feedback

After attack ends:
1. Monster returns to normal
2. Safe to click again
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

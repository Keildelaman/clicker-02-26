# Realms of Clickoria - Game Design Document

## Vision Statement
A mobile-first clicker RPG that captures the satisfying grind of classic MMOs. Every click feels impactful, every level-up is rewarding, and there's always "just one more thing" to achieve. Simple to learn, deep enough to master.

---

## The World of Clickoria

### Lore
Long ago, the Realm of Clickoria was a peaceful land where heroes trained through the ancient art of **The Click** - a mystical combat technique passed down through generations. But darkness has spread from the Void Rift, corrupting creatures across all lands. You are a new adventurer, armed only with a rusty sword and the power of The Click. Your destiny: become legend.

### Tone
- **Light-hearted but not silly** - Self-aware humor, but stakes feel real
- **Classic fantasy** - Swords, magic, monsters, loot
- **Nostalgic MMO vibes** - Zone progression, grinding, "ding!" level-ups
- **Rewarding** - Constant sense of progress and achievement

---

## Zones & Progression

Each zone has unique monsters, a level range, and a boss to unlock the next area.

### Zone 1: Whisperwood Glen (Level 1-10)
*A peaceful forest where new adventurers take their first steps.*
- **Monsters**: Forest Sprites, Wild Boars, Timber Wolves, Grumpy Treants
- **Boss**: Old Mossback (Ancient Treant)
- **Theme**: Green, peaceful, birdsong vibes
- **Drops**: Copper coins, basic herbs

### Zone 2: Dustwind Plains (Level 10-20)
*Rolling golden plains plagued by bandits and beasts.*
- **Monsters**: Prairie Dogs, Dust Devils, Bandit Scouts, Plains Stalkers
- **Boss**: Redfang the Bandit King
- **Theme**: Golden wheat, dusty roads, frontier feel
- **Drops**: Silver coins, leather scraps

### Zone 3: Shadowmire Swamp (Level 20-30)
*A cursed swamp where dark magic festers.*
- **Monsters**: Bog Crawlers, Will-o-Wisps, Swamp Hags, Rotting Husks
- **Boss**: The Mire Mother
- **Theme**: Dark, foggy, eerie green glow
- **Drops**: Shadow essence, cursed coins

### Zone 4: Ironhold Peaks (Level 30-45)
*Ancient mountains home to dwarven ruins and stone creatures.*
- **Monsters**: Rock Elementals, Cave Bats, Kobold Miners, Crystal Golems
- **Boss**: Grimstone the Eternal
- **Theme**: Grey stone, mine shafts, glowing crystals
- **Drops**: Gold ore, gemstones

### Zone 5: Emberfell Wastes (Level 45-60)
*Volcanic badlands where fire reigns supreme.*
- **Monsters**: Magma Slimes, Fire Imps, Ash Wraiths, Molten Giants
- **Boss**: Pyrax the Flamelord
- **Theme**: Red, orange, lava flows, ash
- **Drops**: Ember shards, obsidian

### Zone 6: Frostpeak Summit (Level 60-75)
*The frozen roof of the world, home to ancient ice creatures.*
- **Monsters**: Frost Sprites, Snow Prowlers, Ice Wraiths, Frozen Giants
- **Boss**: Queen Glacielle
- **Theme**: White, blue, blizzards, aurora
- **Drops**: Frost crystals, eternal ice

### Zone 7: The Void Rift (Level 75-100)
*The source of corruption - a tear between realms.*
- **Monsters**: Void Walkers, Chaos Imps, Reality Benders, Eldritch Horrors
- **Boss**: Xal'theron, the Void King (Final Boss)
- **Theme**: Purple, black, reality warping, cosmic horror
- **Drops**: Void essence, reality shards

---

## Core Mechanics

### Combat (Clicking)
- **Tap/Click** to attack the current monster
- Each click deals damage based on your **Attack Power**
- **Critical Hits** (chance-based) deal 2x damage with special effects
- **Damage numbers** float up from monster (satisfying feedback)
- Monster health bar depletes, death animation, loot drops

### Stats
| Stat | Description |
|------|-------------|
| **Attack** | Base damage per click |
| **Critical Chance** | % chance for 2x damage |
| **Critical Damage** | Multiplier for crits (starts at 2x) |
| **Gold Find** | % bonus gold from monsters |
| **XP Bonus** | % bonus experience gained |
| **Auto-Attack Speed** | Clicks per second (when unlocked) |

### Leveling
- Kill monsters → Gain XP
- Level up → Stats increase, unlock new content
- **"DING!"** sound/visual effect on level-up (classic MMO feel)
- Each level: +2 Attack, +5 Max HP, skill points

### Gold & Economy
- Monsters drop gold on death
- Gold scales with zone difficulty
- Spend gold on: Equipment, Skills, Upgrades
- No premium currency - ever

---

## Equipment System

### Slots
1. **Weapon** - Primary attack power
2. **Armor** - Defense (reduces damage taken, future feature)
3. **Accessory** - Special bonuses

### Rarities
| Rarity | Color | Drop Chance | Stat Bonus |
|--------|-------|-------------|------------|
| Common | White | 70% | 1x |
| Uncommon | Green | 20% | 1.5x |
| Rare | Blue | 8% | 2x |
| Epic | Purple | 1.8% | 3x |
| Legendary | Orange | 0.2% | 5x |

### Example Weapons (Whisperwood)
- Rusty Sword (Common) - +2 Attack
- Hunter's Blade (Uncommon) - +4 Attack
- Wolfswood Axe (Rare) - +6 Attack, +2% Crit

---

## Skills & Abilities

### Active Skills (Tap to use, have cooldowns)
1. **Power Strike** - Deal 5x damage on next click (30s cooldown)
2. **Gold Rush** - 2x gold for 10 seconds (60s cooldown)
3. **Critical Frenzy** - 100% crit chance for 5 seconds (90s cooldown)
4. **Monster Magnet** - Instant kill current monster (120s cooldown)

### Passive Skills (Always active, upgrade with points)
1. **Sharp Blades** - +X% base attack
2. **Lucky Strikes** - +X% critical chance
3. **Deep Pockets** - +X% gold find
4. **Fast Learner** - +X% XP bonus
5. **Auto-Clicker** - X clicks per second automatically

---

## Prestige System (Future Feature)

After defeating Xal'theron:
- **Rebirth** - Reset progress for permanent multipliers
- **Legacy Points** - Spend on powerful permanent upgrades
- **Mythic Items** - Ultra-rare gear that persists through rebirths
- **New Game+** - Harder monsters, better rewards

---

## UI/UX Design

### Mobile-First Layout
```
┌─────────────────────────────┐
│  Zone Name          Lv. 12  │  ← Header
├─────────────────────────────┤
│                             │
│      [ MONSTER SPRITE ]     │  ← Monster Area
│         ████████░░          │     (tap target)
│        HP: 45/100           │
│                             │
├─────────────────────────────┤
│  ⚔️ 24    💰 1,234   ⭐ 45%  │  ← Stats Bar
├─────────────────────────────┤
│ [SKILL 1] [SKILL 2] [SKILL] │  ← Skills Bar
├─────────────────────────────┤
│ [SHOP] [INVENTORY] [STATS]  │  ← Navigation
└─────────────────────────────┘
```

### Visual Feedback
- **Damage numbers** - Float up and fade
- **Screen shake** - On critical hits (subtle)
- **Gold coins** - Animate flying to counter
- **Level up** - Full screen celebration
- **New zone** - Transition animation

### Sound Design (Future)
- Click/hit sounds
- Monster death sounds
- "DING!" on level up
- Ambient zone music

---

## Technical Decisions

### Why Vanilla JS?
- No build step required
- GitHub Pages serves directly
- Easy to understand and modify
- Perfect for this scope
- Fast load times

### Why CSS Animations?
- Hardware accelerated
- Smooth on mobile
- No JS overhead for visuals

### Save System
- Auto-save every 30 seconds
- Save to localStorage
- Export/Import as JSON string (backup)
- Offline progress (future: calculate gains while away)

---

## MVP Features (Version 1.0)

### Must Have
- [x] Basic click combat
- [ ] Monster spawning with health
- [ ] Damage numbers floating up
- [ ] Gold drops and counter
- [ ] XP and leveling system
- [ ] 3 zones (Whisperwood, Dustwind, Shadowmire)
- [ ] Basic equipment (weapon upgrades)
- [ ] Save/Load system
- [ ] Mobile-responsive UI

### Nice to Have (v1.1+)
- [ ] Skills with cooldowns
- [ ] More zones
- [ ] Equipment rarities
- [ ] Boss battles
- [ ] Achievements
- [ ] Sound effects

### Future (v2.0+)
- [ ] Prestige/Rebirth system
- [ ] Offline progress
- [ ] Daily rewards
- [ ] Leaderboards
- [ ] Character classes

---

## Monetization
**None.** This is a free, open-source passion project. No ads, no premium currency, no pay-to-win. Just pure clicking satisfaction.

---

## Success Metrics
1. Player can't stop clicking
2. "Just one more level" feeling
3. Satisfying feedback on every action
4. Smooth performance on mobile
5. Easy to pick up, rewarding to master

---

*Let the clicking begin!*

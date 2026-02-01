# CLAUDE.md - Project Context

## Project Overview
**Realms of Clickoria** - A mobile-first browser clicker/idle RPG inspired by classic MMO grinding experiences. Built with vanilla web technologies for simplicity and portability.

## Tech Stack
- **HTML5** - Semantic markup, mobile viewport
- **CSS3** - Flexbox/Grid, animations, CSS variables for theming
- **Vanilla JavaScript (ES6+)** - Modules, classes, no frameworks
- **localStorage** - Save/load game state
- **GitHub Pages** - Free hosting

## Project Structure
```
clicker-02-26/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All styles, mobile-first
├── js/
│   ├── main.js         # Entry point, game loop
│   ├── game.js         # Core game state & logic
│   ├── player.js       # Player stats, leveling, skills
│   ├── combat.js       # Combat calculations, damage
│   ├── monsters.js     # Monster definitions & spawning
│   ├── items.js        # Equipment & shop system
│   ├── zones.js        # Zone progression & unlocks
│   ├── ui.js           # DOM manipulation, animations
│   └── storage.js      # Save/load functionality
├── assets/             # Images, sounds (future)
├── CLAUDE.md           # This file
├── GAME_DESIGN.md      # Full game design document
└── README.md           # Public readme
```

## Development Commands
```bash
# Local testing (if Python available)
python -m http.server 8000

# Or with Node.js
npx serve .

# Primary testing: GitHub Pages
# Settings → Pages → Source: main branch
```

## Code Conventions
- **Mobile-first CSS** - Base styles for mobile, media queries for larger screens
- **ES6 modules** - Use import/export for clean separation
- **Descriptive naming** - `currentMonsterHealth` not `cmh`
- **Comments for game logic** - Explain formulas and balance decisions
- **No magic numbers** - Use constants in config objects

## Game Balance Philosophy
- Early game: Fast progression, instant gratification
- Mid game: Meaningful choices, build diversity
- Late game: Prestige systems, long-term goals
- Always: "Just one more click" feeling

## Key Files to Understand
1. `js/game.js` - Central game state, start here
2. `js/player.js` - All player progression logic
3. `js/zones.js` - World structure and unlocks
4. `GAME_DESIGN.md` - Full design document

## Common Tasks
- **Add new monster**: Edit `js/monsters.js`, add to zone in `js/zones.js`
- **Add new item**: Edit `js/items.js`, add to shop category
- **Add new zone**: Edit `js/zones.js`, define monsters and requirements
- **Adjust balance**: Check config objects at top of relevant files

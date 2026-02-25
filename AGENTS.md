# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the only HTML shell; it loads all CSS and JavaScript modules directly, so broken imports surface immediately during manual reloads.
- CSS lives in `css/`, split by responsibility: `variables.css` for tokens, `layout.css` + `responsive.css` for scaffolding, `components.css`/`animations.css` for interactive pieces, and small files (e.g. `styles.css`) for legacy overrides.
- JavaScript is organized by layer in `js/`. `core/` hosts the event bus, game state, and loop; `data/` contains `.data.js` registries (`monsters`, `skills`, `zones`, etc.); `systems/` implements gameplay domains (combat, items, economy, status effects); `services/` offers cross-cutting helpers such as `storage.js`; `ui/` renders screens and widgets. `debug.js` exposes `window.DEBUG` helpers for iteration.
- Long-form documentation, formulas, and balance notes live under `docs/` (`architecture/`, `design/`, `systems/`, `balance/`). Update the relevant paper when changing a subsystem, even if code diffs feel self-explanatory.

## Build, Test, and Development Commands
- No bundler is configured; serve the root statically to avoid CORS issues: `npx http-server . -p 4173` or `python -m http.server 4173` and open `http://localhost:4173/index.html`.
- Hot reload is manual—refresh after edits. Keep DevTools’ “Disable cache” on when tweaking assets.
- Use the debug harness once the UI is loaded: `DEBUG.giveGold(1e6)`, `DEBUG.unlockAllZones()`, `DEBUG.killMonster()`, etc., to jump to the scenario you need to verify.

## Coding Style & Naming Conventions
- Follow `docs/architecture/coding-standards.md`: prefer `const`, fall back to `let`, never `var`; camelCase functions/variables, UPPER_SNAKE_CASE constants, PascalCase only for classes.
- Keep modules ES6-native with named exports. Limit functions to a single responsibility (<30 lines) and document nontrivial ones with JSDoc.
- Place reusable selectors or timing constants in `css/variables.css`; component classes should remain BEM-ish (`.combat-panel__button`) to match `components.css`.

## Testing Guidelines
- Automated tests are not wired yet, so every change must be validated through manual play sessions. Exercise at least one loop of combat, loot, shop, and skill spending.
- Use `DEBUG` shortcuts to reach edge cases (e.g., `DEBUG.giveLegendary('stormbinder')` before touching legendary drop code). Record the commands you ran in the PR description.
- When modifying data tables, re-run through at least two zones plus the tutorial to ensure unlock pacing still works.

## Commit & Pull Request Guidelines
- Follow the existing conventional style: `<type>: <summary — optional scope>`, where `type` mirrors recent history (`feat`, `fix`, `balance`, `chore`). Keep summaries in imperative mood and under 72 characters.
- Each PR should link design notes (e.g., `docs/design/item-system-v2.md`) it impacts, list manual test steps/results, and include screenshots or short clips for UI-facing work.
- Do not mix gameplay balancing with refactors; raise separate PRs so reviewers can diff intent quickly.***

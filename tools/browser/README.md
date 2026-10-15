# Browser tests (`npm run test:browser`, C3)

The game tested in a real browser (Chromium, through Playwright). Runs in GitHub on every push and pull request
(`.github/workflows/checks.yml`, job `browser`) and weekly.

| File | What it checks |
|---|---|
| `games.mjs` | Whole games played by tapping the real buttons (`?fast`, reduced motion), then the same seed replayed in the engine inside the page: at every turn the board shows each token where the engine has it, with the right player and round; the winner and the final board match. Includes a reload and a Leave in the middle of a game, each continued (the board must come back exactly). |
| `screens.mjs` | 16 screens and popups × 19 screen sizes (280 × 653 folded phone … 2560 × 1440): no button off screen or cut, no popup or page needing to scroll, no overlapping buttons, no squeezed words, nothing spilling out of the turn panel, no button under 40 px. |
| `published.mjs` | The game built like the published one: the test build is a real production build; no security-policy violation in a game with a reload; another app's cache on the same address is left alone; offline start with the site's server really stopped; tampered storage; the first-visit guide; sound (off at first, nothing downloaded before, all 19 files decode, the sounds load as the game plays, the in-game speaker, the choice kept); the keyboard (Tab to the board, arrows, Enter, Escape); an accessibility scan (axe-core: no serious or critical problem); no fast-forward in the real published build. |
| `run.mjs` | Runs all of it and prints one line per check; fails if any check fails (a 40-minute watchdog turns a hang into a failure). |
| `common.mjs` | The browser, the development server, the test build, the error collector. |

`QUICK=1 npm run test:browser` plays 2 games and checks 6 sizes (a few minutes; the full run takes 10–20).
Chromium: `npx playwright install chromium` once, or `CHROMIUM_PATH=/path/to/chrome npm run test:browser`.

The test build (`vite build --mode browsertest`) is the published build with `?fast` allowed; the real published build
never fast-forwards (S4), which the last check confirms.

Every build in these tests is made with `NODE_ENV=production` (`productionBuild` in `common.mjs`): Vite's development
server switches the whole Node process to development, and a build made after it would silently leave out the
offline worker.

# dgm-game

"Don't Get Mad!" — a family board game drawn on paper, turned into a free web + Android game.

- [Game Concept Document](docs/GCD.md)
- [Project Plan](docs/PROJECT_PLAN.md)
- [Rules engine](src/engine/README.md)
- [Board rendering](src/render/README.md)

## Develop

Node 22. `npm install`, then:

| Command | What |
|---|---|
| `npm run dev` | Local app (Vite) |
| `npm test` | Rule tests + game-by-game check against the simulator (`tools/sim/`) |
| `npm run test:sim` | Slow (~1 min): reproduces the published 100,000-game measurements |
| `npm run test:browser` | The game in a real browser (10–20 min; `QUICK=1` for a few): whole games checked against the engine turn by turn, every screen at 19 sizes, the published build (security policy, offline, guide, keyboard, accessibility). Needs Chromium: `npx playwright install chromium` once (or `CHROMIUM_PATH=…`). See `tools/browser/` |
| `npm run typecheck` / `npm run build` | TypeScript check / production build in `dist/` |
| `npm run android:assets` | Builds the game and copies it into the Android app (`android/app/src/main/assets/`) |

## Android app

`android/` is the Android Studio project: the game inside a WebView, built like the owner's KAJ app, with no
permissions (plan and decisions: `docs/prompts/Step8_android_app.md`). Run `npm run android:assets` first, then open
`android/` in Android Studio. The icon comes from `android/icon-source.png` (`tools/android/icons.py`).

## Copyright and privacy

© 2026 Connect AL. All rights reserved (see `LICENSE`). The game shows the notice on its start screen, with links to
two pages that ship with it (they also open offline) and are published with the game on GitHub Pages:

| Page | File | Address once `main` is published (for the Google Play listing) |
|---|---|---|
| Copyright | `public/copyright.html` | https://albmarketsautopilot-lab.github.io/dgm-game/copyright.html |
| Privacy Policy | `public/privacy.html` | https://albmarketsautopilot-lab.github.io/dgm-game/privacy.html |

Third-party material (the font, the CC0 sounds, a small piece of build-tool code) and its licences:
`public/licenses/third-party.txt`. `test/legal.test.ts` keeps them in step with the game: every sound credited, and
every kind of data the game saves on the device named in the privacy policy.

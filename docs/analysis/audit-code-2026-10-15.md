# Code audit: security, performance, correctness, user experience (15 Oct 2026)

Every source file was read line by line (engine, UI, rendering, service worker, build and CI files, about 5,300
lines). Everything below was also **tested for real**: whole games played through the real game screen in Chromium,
the production build on a 6× slower processor (about a budget Android phone), offline use, tampered storage, a strict
security policy, accessibility scans, and 100,000 engine games with random choices.

Part 1 is what was wrong and is **fixed in this change**. Part 2 is what was measured. Part 3 is **proposals that wait
for the owner's approval**: nothing in Part 3 is built.

## 1. Found and fixed

| # | Area | What was wrong | How it showed | Fix |
|---|---|---|---|---|
| 1 | Correctness | The die faces on the board marked the square **6 ahead** as reachable. A 6 always throws again (R2), so a token never stops 6 squares ahead | A 6 die face on a square nobody can land on with one throw | Faces 1–5 only. The rule is one function (`reachSteps`), used by the board and the tip, tested against the engine (`test/reach.test.ts`) |
| 2 | Correctness | The player tip said "a 6 ▲ Farm Taxi"; tapping a square 6 ahead said "Blue gets here with a 6" | Advice that cannot happen | Same rule: 1–5; "A 6 throws again" added to the tip |
| 3 | Correctness | Doubled throw (Ice Cream Break) and Puddle (move exactly 1) were ignored by the die faces, the tip and the turn line | With a double, "Needs exactly 3" (a 3 moves 6 and overshoots); with the Puddle, six die faces although only 1 square is possible | Double: faces mark 2, 4, 6, 8, 10 squares and the line says "exactly a 2 reaches the festival" or "no throw lands exactly this turn". Puddle: no faces |
| 4 | Correctness | The round under "Blue's turn" changed only after the roll | At the prompt of round 2 it still said "Round 1"; the first turn showed no round | The round is worked out before the prompt. Checked on 317 turns against the engine |
| 5 | Correctness | Texts left over from the removed stair steps: "You set off anyway, two steps slower", "you go anyway, slower" | Wrong rule on screen (the third throw now moves you by that throw) | "You set off anyway, and that third throw moves you"; Start info likewise. The story lines "One more step down the porch" / "another stone" were kept (owner's narrative), see 3.4 |
| 6 | Security / reliability | The offline worker deleted **every cache of the website** on its first start, not only its own. On GitHub Pages all projects of the account share one website address, so this game wiped other projects' offline files | Test: another app's cache existed before, gone after the first visit | Only caches named `dgm-…` are touched. Test: the other cache now survives |
| 7 | Security / reliability | The worker searched every cache of the website for files, and stored any address a page sent it | Another project on the same address could feed it files | It searches only its own cache and stores only files inside the game's own folder |
| 8 | Reliability | Offline did not start when the server sends `Vary: Origin` (the game's own `npm run preview`, and some hosts): scripts and styles were cached but never found | Blank page offline | Cached files are found whatever the `Vary` header says (file names change with every build, so this is safe). The cache name moved to `dgm-v2`, which also clears the old files that piled up since Step 7. Tested: first visit, offline reload, and an update from the old version |
| 9 | Performance (memory) | Every roll made with the button left a click listener on the die until the end of the game | Listeners piled up, about one per roll | The waiting listener is dropped when the roll is made another way |
| 10 | User experience | Zooming into a square at the board's edge showed up to half a panel of empty background | Screenshot: top-row square, top half empty | The zoom stays inside the board |
| 11 | Tests | `npm run test:sim` (the 100,000-game check) failed 6 of 6: it still expected the numbers from before today's rule changes. `docs/analysis/measure-long.md` / `measure-short.md` still described the Shortcuts and the old six rule | Red slow suite; outdated published numbers | Both regenerated for today's rules (same command, same seeds). The TypeScript engine and the simulator agree exactly on all six 100,000-game runs. Suite green |

After the fixes: `npm test` 170 / 170, `npm run test:sim` 6 / 6, typecheck and build clean.

## 2. What was measured

### 2.1 Correctness

| Test | Size | Result |
|---|---|---|
| Whole games through the real game screen (Chromium), every turn: where the board shows each token vs where the engine has it (same seed replayed), plus the winner | 21 games (both boards, 2–4 players, "Play again" in between): 16 with people only, 1,608 turns compared one by one; 5 with computer players, winner and final board compared | **0 differences** |
| Engine with random choices (Bonus card defend / spoil at random), checks after every turn: legal places, no negative counters, no two tokens on one square, winner on END, no endless game | 100,000 games, 13.5 million turns | **0 violations**, no game stopped by the round limit (longest: 1,006 turns) |
| TypeScript engine vs the measured simulator | 6 × 100,000 games | Identical win % by seat and game length |
| Fairness, 100,000 games | long 4p: 25.06 / 25.02 / 24.93 / 24.99 · short 4p: 25.36 / 25.10 / 24.84 / 24.69 | Fair. The short board gives the first seat about +0.4 points (see 3.3) |
| Game length (4 players, rounds) | long 50.8 (median 47), short 28.9 (median 26) | Matches the start screen's "about 50 / about 30 rounds" |

### 2.2 Performance (production build)

| Measure | Normal phone | 6× slower phone |
|---|---|---|
| Download for a first visit | 97 KB (game 57 KB + style 5 KB + one font 24 KB, compressed) | |
| Start screen ready | | 0.97 s (first paint 0.71 s) |
| Main thread busy while waiting for a tap (animated pictures running) | | 0.5% |
| Tap to screen response, 40 taps | | median 64 ms, 90% under 120 ms, worst 352 ms (the tap that builds the game screen) |
| Turning the phone (board redrawn) | | about 1.1 s of work per turn of the phone, almost all of it the browser painting the big board picture, not our code |
| Engine speed | 0.1 ms per whole game | |
| Memory over 15 games in a row ("Play again") | 3.3 MB after game 1, 4.0 MB after game 15; page elements and listeners back to the same level each game (old games are released). About 45 KB per game: nothing to fix | |

### 2.3 Security

| Check | Result |
|---|---|
| Dependencies (`npm audit`) | 0 known vulnerabilities; one runtime dependency (the font) |
| Requests to other websites | None. No trackers, no accounts, nothing leaves the device |
| Built files | No source maps, no `eval`, no secrets |
| Places where the game writes HTML | All filled from the game's own files (board files, texts), never from typing, the address or storage. Postcard storage is only compared to a fixed list |
| Tampered storage (broken JSON, wrong type, HTML in the data, 200,000 entries) and storage blocked | No crash, no script ran, the game plays on |
| A strict Content-Security-Policy (only the game's own files may run) | A whole 108-turn game under it: **0 violations**, so it can be switched on (3.2) |
| Offline worker | Issues 6–8 above, fixed |
| GitHub workflow | Least permissions; tests run before publishing. Actions are pinned by version tag, not by exact commit (3.2) |

### 2.4 User experience

| Check | Result |
|---|---|
| Accessibility scan (axe-core) on start screen, album, intro, game screen, player popup | No serious or critical problems. 2 moderate: the game screen has no top-level heading; the album's text sits outside a page landmark |
| Screen sizes 320×568, 390×844, 740×360 (sideways), 768×1024, 1366×768 | No sideways or up-down scrolling; the action button always on screen; every button at least 44 px (the size a finger needs) |
| Keyboard only | Every button reachable with Tab. The board's squares are not (they can only be tapped), and Escape does not close a popup |
| Visual | The "START: a 6 to enter" label is covered by the tokens waiting there |

## 3. Proposals for the owner's approval

Each one is small enough to be one step. Nothing here changes the rules.

### 3.1 Correctness

| # | Proposal | Why | Effort |
|---|---|---|---|
| C1 | Run the 100,000-game check (`npm run test:sim`, 1 minute) in the GitHub workflow, at least weekly | It was red for a whole day without anyone seeing it (fix 11) | Small |
| C2 | Remove the dead code of the Shortcut and the stair steps from the screen (choosing a road, crossroads texts, stair drawing); keep it in the engine only as long as the old reports must be reproducible | About 150 lines no player can reach; every later change has to keep them right | Medium |
| C3 | Add the real-browser game check used for this audit (whole games, board vs engine every turn) to the repository as `npm run test:browser` | It found no differences today; it would catch a screen that drifts from the rules in a later change | Medium |

### 3.2 Security

| # | Proposal | Why | Effort |
|---|---|---|---|
| S1 | Switch on the strict Content-Security-Policy tested in 2.3 (one line in `index.html`) | If a future change ever put outside text into the page, the browser would refuse to run it | Small, tested |
| S2 | Pin the GitHub Actions to exact commits (and let Dependabot update them) | A tag can be moved by whoever controls that action; a commit cannot | Small |
| S3 | Write player-visible text through one escaping helper | Today all text is our own, so nothing can go wrong. The day player names, custom boards or the Android app arrive, it matters | Small |
| S4 | Make `?fast` (fast-forward, for testing) work only in the development build | Harmless today; a player who finds it just gets a fast game. Tidier without it | Small |

### 3.3 Performance

| # | Proposal | Why | Effort |
|---|---|---|---|
| P1 | Draw the board's paper and walls once as a picture, with only tokens and markers live on top | Turning a cheap phone costs ~1 s of work today; this would make it near instant and lighten every board update | Medium |
| P2 | Redraw the player row and the cards only when they change (today they are rebuilt many times per turn) | Small gain on cheap phones (~15–20 ms per update at 6× slower) | Small |

### 3.4 User experience

| # | Proposal | Why | Effort |
|---|---|---|---|
| U1 | **Continue a game after closing the app.** The game is fully decided by its seed and the choices made, so saving those two lets it be replayed to the same spot | A long game is ~50 rounds (30–60 min). Today a reload, a phone call or a closed tab loses it | Medium |
| U2 | A "Leave game" button (back to the start screen, with "Are you sure?") | Today the only way out of a game is to finish it or reload | Small |
| U3 | Pick the first player at random (a short "who starts" moment) | The first seat wins 25.4% on the short board (0.4 points above fair); random order spreads that, and it is a nice moment at the table | Small |
| U4 | Move the "START: a 6 to enter" label so the waiting tokens do not cover it | Visible on every game start | Small |
| U5 | Keyboard and screen reader: Escape closes a popup, the board's squares can be reached with Tab, the game screen gets a heading | The 2 moderate scan findings plus the keyboard gaps (2.4) | Small |
| U6 | Story texts "One more step down the porch" / "You lay another stone" still describe stair steps, which no longer exist. Keep as story, or reword? | The owner's narrative; not changed without approval | Owner's words |
| U7 | Optional sound and vibration for the die, a 6, a bump and the win (off by default, one switch) | Phones at a family table; the 6 party is silent today | Medium |

## 4. How the tests were run

- Browser: Chromium (Playwright), phone size 390×844 unless stated; whole games played by tapping the real buttons; the game's seed read from the page and the same game replayed in the engine.
- "6× slower": Chrome's processor slow-down, the usual stand-in for a budget Android phone.
- Offline: the built game served like GitHub Pages and like `npm run preview`; first visit, offline reload, and an update from the previous version.
- The test scripts are not part of this change (proposal C3).

# Don't Get Mad! — Project Plan

**Deadline:** Sunday 18 October 2026 (5 days) · **Budget:** Claude Pro weekly allowance (1% used at the start).
**Working rule:** one step at a time. After each step Claude stops and waits for confirmation.
**Saving resources:** start a **new Claude Code session for each step**. The new session reads `docs/GCD.md` + this file, so no context has to be re-explained.

## Effort guide

| Effort | Use for |
|---|---|
| **High** | Rules engine and anything where a wrong rule would break the game |
| **Medium** | Rendering, animation, UI, Android build |
| **Low** | Small fixes, text changes, deploy config, docs updates |

## Steps

| Step | Day | What | Output in repo | Effort | New session? |
|---|---|---|---|---|---|
| 0 | Wed 14 | GCD + Project Plan from the photos | `docs/GCD.md`, `docs/PROJECT_PLAN.md` | High | – (this one) ✅ |
| 1a | Wed 14 | Answers recorded + game simulator + baseline report of the paper board ✅ | `tools/sim/`, `data/board-v0-paper.json`, `docs/analysis/SIM_REPORT_v0.md` | High | – ✅ |
| 1b | Wed 14 | Market & audience report: target categories, social & intellectual niches, how to make the game appealing (web research) ✅ | `docs/analysis/MARKET_REPORT.md` | **Medium** | Yes |
| 1c | Wed 14 | Rebuild attempt v1 — **archived** (capped swings; not the concept) | `docs/archive/SIM_REPORT_v1_exploration.md` | High | – |
| I-6 ✅ | Wed 14 | Logic Layer + luck proposals: rules R17–R21 added, **all game rules frozen** (GCD §8.2b) | `docs/analysis/I-6_*`, `lifelines-*` | High | – ✅ |
| I-4 ✅ | Wed 14 | **Journey story** square by square over the frozen board (grown-up voice, GCD §9.2) — prompt: `docs/prompts/I-4_journey_story.md` | `data/board-long.json` (texts), `docs/analysis/I-4_story_log.md` | Medium | – ✅ |
| I-5 ✅ | Wed 14 | **Short board** "The Quick Trip": 23 long-board events, measured (all §11.3 targets met), with the story (GCD §10.1) — prompt: `docs/prompts/I-5_short_board.md` | `data/board-short.json`, `docs/analysis/measure-short.md`, `docs/analysis/I-5_short_board_log.md` | High | – ✅ |
| I-7 ✅ | Wed 14 | **Final freeze**: GCD marked FROZEN (owner); Step 2 below now reads the final board files | `docs/GCD.md`, `docs/analysis/I-7_freeze_log.md` | Low | – ✅ |
| I-1…I-7 | Wed 14 → | **Ideation restart: GCD v2 steps I-1 to I-7 (see `docs/GCD.md` §13). Coding (Step 2+) starts only after I-7 FREEZE.** | `docs/GCD.md`, `data/board-*.json`, reports | High | per step |
| 2 ✅ | Thu 15 | Project skeleton (Vite + TypeScript + Vitest) + rules engine in TypeScript, ported from `tools/sim/engine.mjs`, reading `data/board-long.json` and `data/board-short.json` (GCD §10, §15) + unit tests for every tile type. Plays the simulator's games exactly (checked game by game) and reproduces the published 100,000-game numbers (`npm run test:sim`). API: `src/engine/README.md` | `src/engine/*`, `test/*` | **High** | – ✅ |
| 3 ✅ | Thu 15 | **Game screen (owner's design, 14 Oct):** two panels — the whole board (squares only, no numbers, tokens) above / left, and the stage below / right: one big square with its animated illustration; the token hops square by square, event jumps glide back or forward; "Blue's turn is over" → OK → next player. Start screen (journey, 2–4 players, person / computer), win screen. Long board = paper spiral; short board = 10 × 10 grid. Notes: `src/ui/README.md`, `src/render/README.md` | `src/ui/*`, `src/render/*` | **Medium** | – ✅ |
| 4 ✅ | Thu 15 | **Illustrations:** an animated storybook illustration (filled SVG shapes + CSS motion) for every icon in both boards: all event squares, Shortcut stones, landmarks, stairs, Home, END — 57 in all, checked by a test. Review page: `npm run dev` → `/gallery.html` | `src/render/art*.ts` | **Medium** | – ✅ |
| 5 ✅ | Fri 16 | UI polish (owner, 15 Oct): accessibility fixes; labyrinth whole board (info area, tap a square, die faces for the reach); stage = action area with popups for every story moment, new narrative (`src/ui/tales.ts`), player avatars, card designs per held card; grown-up redraw of the pictures (`src/render/art-modern.ts`, owner-approved); stamps on the square; journey postcards with an album (device only) | `src/ui/*` | **Medium** | – ✅ |
| 5b ✅ | Thu 15 | **Spoil setting and narrative** — prompt: `docs/prompts/Step5b_spoil_setting_and_narrative.md`. Part A ✅ (owner approved): the spoil question (R14) gets a third button, "Don't ask me again this game" (a person is asked about 0.7 times a game on average, but up to dozens of times when keeping the card). Part B: owner kept the narrative as it is (the voice sample was longer, not approved) | `src/ui/*` | **Medium** | – ✅ |
| 6 ✅ | Sat 17 | Computer players as in GCD §8.6 (the measured simple player). Delivered with Steps 3–5: `simplePlayer` from the engine plays the computer seats in `src/ui/app.ts`; their avatars wear a robot badge; owner marked it done | `src/ui/app.ts` | **Low** | – ✅ |
| 7 | Sat 17 | PWA (offline) + free deploy to GitHub Pages via GitHub Actions. Built: manifest + icons, offline cache (checked: the game starts with no network), Pages workflow; computer players wear a robot badge instead of "CPU" (owner). Live once merged to `main` and Pages is set to "GitHub Actions" | `.github/workflows/pages.yml`, `public/*` | **Low** | Yes |
| 7b | Thu 15 | **Owner playtest fixes and full audit** (`docs/analysis/audit-2026-10-15.md`): no engine counting bug; screen fixes (die total, ring openings drawn as arrows, overlaps, {p}, waiting reasons, a person rolls every die, a 6 is celebrated, no die passing to robots, "needs exactly N", region pictures and signs, Bonus card text, end buttons), 10 screen sizes, slow-phone check. Owner's rule changes after the real-life test: a 6 only lets you in (6, 2 → square 2), no stair steps, every 6 gives one more throw, Shortcut removed (GCD R2, R17, R20). A second Bonus card: measured, waiting for the owner | `src/ui/*`, `src/render/layout.ts`, report | **High** | – |
| 8 | Sat 17 | **Android app** — the only reference: `docs/prompts/Step8_android_app.md` (owner's plan, approved 16 Oct). The web game inside a WebView, built like the owner's KAJ app (no Capacitor, no permissions); the owner builds and signs it in **their own Android Studio** on Windows; every step approved first | `android/` | **Medium** | Yes |
| 9 | Sun 18 | Family playtest → bug list → fixes | fixes | **Low/Medium** | Yes |

## Notes

- We are already in **Claude Code** (cloud session). Every step above runs in Claude Code; "new session" means start a fresh Claude Code session on this repo and say e.g. *"Do Step 2 of docs/PROJECT_PLAN.md"*.
- The effort level is chosen by you when you start the session; Claude cannot change it.
- If a step runs out of time, Step 6 (computer players) is the first to drop.
- Steps 1a–1c were added on 14 Oct to rebuild the rules from simulation data. This puts the schedule under pressure: Steps 3–5 may need to share Friday.

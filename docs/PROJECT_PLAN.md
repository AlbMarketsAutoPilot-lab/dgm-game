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
| 3 ✅ | Thu 15 | Board rendering on Canvas: paper texture, purple wobbly tiles, crayon colours, icons, ladders, snakes, layout: long board follows the paper path (GCD §8.4); short board layout designed as a classic 10 × 10 snakes-and-ladders grid (portrait). Notes: `src/render/README.md` | `src/render/*`, `test/layout.test.ts` | **Medium** | – ✅ |
| **4 (next)** | Fri 16 | Token animation step-by-step + ladders/snakes paths + camera follow / pan / zoom | `src/render/animation*`, `camera*` | **Medium** | Yes |
| 5 | Fri 16 | UI: player setup (2–4), dice, turn flow, card inventory + "use card?" prompts, win screen, accessibility as in GCD §14 (colour + icon, big buttons, high contrast, reduced motion, no timers; no read-aloud) | `src/ui/*` | **Medium** | Yes |
| 6 | Sat 17 | Computer players as in GCD §8.6 (the measured simple player; optional) | `src/ai/*` | **Low** | Yes |
| 7 | Sat 17 | PWA (offline) + free deploy to GitHub Pages via GitHub Actions | `.github/workflows/pages.yml`, manifest | **Low** | Yes |
| 8 | Sat 17 | Android app with Capacitor, built by GitHub Actions, uploaded to Google Play with the owner's existing account (cost 0) | `android/`, workflow | **Medium** | Yes |
| 9 | Sun 18 | Family playtest → bug list → fixes | fixes | **Low/Medium** | Yes |

## Notes

- We are already in **Claude Code** (cloud session). Every step above runs in Claude Code; "new session" means start a fresh Claude Code session on this repo and say e.g. *"Do Step 2 of docs/PROJECT_PLAN.md"*.
- The effort level is chosen by you when you start the session; Claude cannot change it.
- If a step runs out of time, Step 6 (computer players) is the first to drop.
- Steps 1a–1c were added on 14 Oct to rebuild the rules from simulation data. This puts the schedule under pressure: Steps 3–5 may need to share Friday.

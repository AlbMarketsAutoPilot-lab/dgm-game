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
| 1 | Wed 14 | You answer the open questions Q1–Q22 in GCD §9; Claude writes the answers into the GCD | updated `docs/GCD.md` | **Low** | same session is fine |
| 2 | Thu 15 | Project skeleton (Vite + TypeScript + Vitest) + `src/data/board.json` (all tiles from GCD §6) + rules engine + unit tests for every special tile | `src/engine/*`, `src/data/board.json`, tests | **High** | **Yes** |
| 3 | Thu 15 | Board rendering on Canvas: paper texture, purple wobbly tiles, crayon colours, icons, ladders, snakes, layout from GCD §8.4 | `src/render/*` | **Medium** | Yes |
| 4 | Fri 16 | Token animation step-by-step + ladders/snakes paths + camera follow / pan / zoom | `src/render/animation*`, `camera*` | **Medium** | Yes |
| 5 | Fri 16 | UI: player setup (2–4), dice, turn flow, card inventory + "use card?" prompts, win screen, accessibility (read-aloud, high contrast, reduced motion) | `src/ui/*` | **Medium** | Yes |
| 6 | Sat 17 | Simple computer players (optional) | `src/ai/*` | **Low** | Yes |
| 7 | Sat 17 | PWA (offline) + free deploy to GitHub Pages via GitHub Actions | `.github/workflows/pages.yml`, manifest | **Low** | Yes |
| 8 | Sat 17 | Android APK with Capacitor, built by GitHub Actions, published as a GitHub Release (cost 0) | `android/`, workflow | **Medium** | Yes |
| 9 | Sun 18 | Family playtest → bug list → fixes | fixes | **Low/Medium** | Yes |

## Notes

- We are already in **Claude Code** (cloud session). Every step above runs in Claude Code; "new session" means start a fresh Claude Code session on this repo and say e.g. *"Do Step 2 of docs/PROJECT_PLAN.md"*.
- The effort level is chosen by you when you start the session; Claude cannot change it.
- If a step runs out of time, Step 6 (computer players) is the first to drop.

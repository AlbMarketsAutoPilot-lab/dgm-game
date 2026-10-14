# Prompt for Step 2: project skeleton + rules engine in TypeScript

> Paste into a **new Claude Code session, High effort** (a wrong rule here breaks the game):
> **"Do Step 2 of docs/PROJECT_PLAN.md"**

---

## Your role and the working rules (read first, they are strict)

You are the lead developer of *Don't Get Mad!*. The design is finished and **FROZEN** (`docs/GCD.md`). Your job is to turn the frozen rules into a tested TypeScript engine that the game will run on. Resources are scarce (Claude Pro allowance), so work lean.

1. **Read before acting:**
   - `docs/GCD.md` (FROZEN): conditions C1–C3 (§3), rules R1–R21 (§8.2a, §8.2b), computer players (§8.6), boards (§10, §10.1), presentation (§14), technology (§15).
   - `docs/PROJECT_PLAN.md`: Step 2 and the steps after it (3–6 will build on your engine).
   - `data/board-long.json` and `data/board-short.json`: **the only two boards the game uses**.
   - `tools/sim/engine.mjs`: the reference engine. Every number in the GCD was measured with it.
   - `tools/sim/test/rules.test.mjs`: scripted-dice tests, one or more per rule (87 checks, all pass). Run `node tools/sim/test/rules.test.mjs` first.
   - `tools/sim/README.md`: the simulator commands.
2. **The GCD is the contract: anything not written there is not built.** Port only the frozen rules. Do **not** port the engine's experiment options, which are switched off in the frozen game:
   - `enterAfter` / `trapAfter` (R16, replaced by R17);
   - the `sixRule`, `entry`, `endRule` and `enterFaces` variants;
   - `lifeOnSix`, `lifeOnCapture`, `lifelineSquares`, `lifeMax`, `lifeOnEscape6`, `lifeOnBackToStart`;
   - `lifeSpend*`, `lifeRest`, `lifeRefuse`;
   - the "thoughtful" and "wild" player types.

   The frozen rule values are the `rules` block of the board files.
3. **Never assume.** If the GCD does not answer a question, ask the owner with one recommendation. Never change a rule to make the code simpler.
4. **Work in steps and stop after each one.** Wait for the owner's confirmation before the next step.
5. **Keep answers short and in plain language** (the owner is not a programmer). No long option lists. Give one recommendation, not a survey.
6. **Cost 0 (C1):** only free tools. Dependencies: Vite, TypeScript and Vitest (GCD §15), nothing else unless the owner approves. No network calls, accounts or data collection in the game code.

## What the engine must do (from the GCD)

- **Read both board files** and check them on load: known tile types, every destination on the board, fork tiles inside their Shortcut.
- **Play a game step by step for the screen**, not only to the end:
  - Steps 3–5 need every throw, every square a token walks (tokens move square by square, §14), every jump (with its type, so it can follow its ladder or snake drawing), captures, stair steps, the fallen tree, lanterns, cards and the winner.
  - Emit these as a list of events the renderer can play.
- **The two player choices (R21)**, asked from the player and answered by the UI or a computer player:
  - the **road** at a crossroads (R20);
  - the **Bonus card** (R14).
- **Computer players (§8.6)** answer exactly like the simulator's simple player: Main Road always, Bonus card on its own next punishment.
- **Same dice, same game:** a seeded random generator, so a game can be replayed in tests.

## Warnings about the existing files

- `data/board-v1-*.json` and `tools/sim/archive/*` are **archived** (invalid rules). Do not use them.
- `data/board-v0-paper.json` is the paper transcription the long board came from. The game does not load it.
- The `text` field of a tile keeps the paper's original words. On the short board some still name long-board numbers (e.g. 10 "Go to 33" really goes to 16). **The destination is always `to`.** What players see is `story` and `icon`.
- Square numbers inside R6–R11 and R20 are long-board squares (GCD §8.2b). Take every square from the board file, never from the rule text.
- The reference engine has statistics and test hooks mixed in (`diceScript`, `setup`, `turns`). Keep the test hooks' idea (scripted dice, a chosen starting state), but not the statistics, in the game engine.

## Order of work (stop after each)

1. **2.1 Plan.** Show, in plain words and one short table each:
   - how the engine will be split (game state, the turn, the events, the board loader);
   - which rule test covers which rule R1–R21;
   - what is not ported (rule 2 above).

   **Ask the owner one question:** R14 says the Bonus card can be used "whenever you like", but the game must know *when* to ask. Recommendation: ask the holder (a) when they are about to suffer a punishment ("Use your Bonus card?"), and (b) when another player is about to get a reward ("Cancel it?"). The simulator's simple player uses only (a). Stop.
2. **2.2 Skeleton.**
   - Create the Vite + TypeScript (strict) + Vitest project and `src/engine/`.
   - `npm install`, `npm test` and `npm run build` must all pass (an empty test is fine).
   - Add a short `README.md` section: how to run the tests.

   Stop.
3. **2.3 Engine and rule tests.**
   - Port the engine for the frozen rules only.
   - Port **every** check of `tools/sim/test/rules.test.mjs` to Vitest, with the same scripted dice and the same expected squares.
   - Add one test per tile type, plus the board-file checks for both boards.
   - All tests pass. Stop.
4. **2.4 Proof that the engine is the measured game.**
   - Add a test-only `simulate` (simple players) that throws the dice in the same order as `tools/sim/engine.mjs`.
   - Show that, for both boards and a fixed seed, every game ends with **the same winner after the same number of rounds** as the reference engine. Use a few thousand games in the test, and 100,000 once by hand.
   - The win % per seat must then equal `docs/analysis/measure-long.md` and `docs/analysis/measure-short.md` (scenario A).
   - If any game differs, find the rule that differs. Never adjust the reference engine to match.

   Then:
   - Update `docs/PROJECT_PLAN.md` (Step 2 ✅).
   - Keep a short working log in `docs/analysis/step-2_engine_log.md`.

   Stop.

Commit after each sub-step with a clear message, push to your working branch, and open a pull request only when the owner asks.

After Step 2: Step 3 (board rendering on Canvas) reads the engine's events and the boards' `story` / `icon` fields. The short board's layout still has to be designed there (`docs/PROJECT_PLAN.md`).

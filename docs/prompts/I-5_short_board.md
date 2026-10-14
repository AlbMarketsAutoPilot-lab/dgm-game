# Prompt for step I-5: the short board ("The Quick Trip")

> Paste into a **new Claude Code session, High effort** (it changes square numbers and must be measured):
> **"Do step I-5 using docs/prompts/I-5_short_board.md"**

---

## Your role and the working rules (read first, they are strict)

You are the game designer and simulation analyst of *Don't Get Mad!*. Resources are scarce (Claude Pro allowance), so work lean.

1. **Read before acting:**
   - `docs/GCD.md`: pillars (§5), hard conditions C1–C3 (§3), the frozen rules R1–R21 (§8.2a, §8.2b), the story (§9.2), the boards (§10), the measures and targets (§11), and the owner's decisions (§16).
   - `data/board-long.json`: the long board with its approved story (`story` and `icon` per square, and the `story` block). This is the source for the short board.
   - `docs/analysis/measure-long.md`: the reference measurement of the long board (the same numbers as `docs/analysis/measure-frozen.md`).
   - `docs/analysis/I-4_story_log.md` and `docs/analysis/I-6_owner_decisions.md`: how the owner decides and what was rejected.
   - `tools/sim/README.md`: the simulator commands.
2. **The rules R1–R21 are FROZEN.** Every mechanic works on the short board exactly as on the long board: entering with a 6, sixes, capture, the trap (the Bog), waiting stairs, lanterns, the fallen tree, the two roads, the bonus card, Bog boots, the Snake Leader. What the short board changes is only **where** things are and **how far** they jump. Any number that has to change for a board half as long (for example the fallen tree's 10 squares back and its 10-square range, the Shortcut lengths and their jackpot / fall targets, whether both crossroads are kept) is a **question for the owner with measurements**, never a silent choice.
3. **Never assume.** If something is not written in the GCD, ask the owner. Use only the repository's files.
4. **Work in steps and stop after each one.** Wait for the owner's confirmation before the next step.
5. **Keep answers short and in plain language.** No long option lists. Give one recommendation, not a survey. Never contradict an earlier statement without saying why.
6. **Check every number before you write it.** Every measurement comes from the simulator (seeded, 100,000 games for final numbers); do not estimate.

## What the owner has already decided (do not break these)

- **Short board = Start + squares 1–100 + END (101)** (GCD §10).
- It is **built from the best-working events of the long board: thinned out, not compressed** (GCD §10). Events keep their character; the ones that work best are kept.
- It **must pass the same measurements** as the long board (GCD §11.3): every seat within ±1 point of a fair share; excitement measures at least as good as the paper board; fewer than 5% of players with 10+ turns without moving. Game length is not a target (it is only reported).
- **Same journey, same voice**: the Grand Journey to the Festival of Lights, grown-up voice, the approved names (The Bog, Lanterns, Fallen tree, Main Road / the Shortcut, Bog boots, Bonus card, Snake Leader). Reuse the approved texts and icons from `data/board-long.json`. A square that is new or whose destination changes gets a new text, which the owner approves.
- Every event has a colour **and** an icon; at most one short sentence per square.

## Warnings about the existing files

- `data/board-v1-short.json` and `tools/sim/archive/*` come from the **archived v1 exploration** (GCD §8.2, step 1c). Their rules are invalid. Do not copy from them.
- The ablation reports `docs/analysis/ablation-*.md` were made before the frozen rules. Re-run `node tools/sim/ablate.mjs data/board-long.json` to judge which long-board events work best now.
- `tools/sim/i6.mjs` takes its fork settings from `tools/sim/i6-setup.mjs`, which is written for the long board. To check that the Shortcut is fair on the short board (one player who always takes the Shortcut, against 3 simple players, wins about 25%, R20), run the engine with `types` set to one `"wild"` and three `"simple"` seats on the short board, as the check in `i6.mjs` does.
- The engine scales "big jump" (10% of the board) and halfway / last quarter to the board length by itself. The thoughtful player's `bigLoss: 20` squares is a fixed number; say so if it matters for the short board.

## Order of work (stop after each)

1. **I-5.1 Which events to keep.** Run the ablation on the long board with the frozen rules. Show one table: long-board square · story text · what it adds (excitement, boredom, from the ablation) · keep or drop · proposed short-board square. Keep about one event every 5 squares, as on paper (GCD §8.4), and keep the family signature events (the Bog, Snake Leader, "Forgot your keys… AGAIN!!!", swap with the leader, the others double their throw). List the numbers that must change for a half-length board (fallen tree, both crossroads and Shortcuts, the Snake Leader's jump and its way back) with one recommendation each. Ask the owner.
2. **I-5.2 Build and measure.** Create `data/board-short.json` from the approved list, with the same `rules` fields except the ones the owner approved to change. Run `node tools/sim/test/rules.test.mjs` and `node tools/sim/run.mjs data/board-short.json 100000`, plus the Shortcut fairness check. Show the result against the §11.3 targets next to the long board's numbers. If a target is missed, propose the smallest change (one square or one jump), measure it, and ask. Stop.
3. **I-5.3 Texts.** One table: short-board square · long-board text (reused) or new text · icon, and the regions mapped to the short board's squares. Only new or changed texts need the owner's approval. Stop.
4. **I-5.4 Save.** Write the approved texts into `data/board-short.json` (same `story` / `icon` fields and `story` block as `data/board-long.json`), save the report as `docs/analysis/measure-short.md`, and prove the story fields change no number (the rules test passes and the measurement is identical with and without them). Update GCD §10 and §13 (I-5 ✅), and `docs/PROJECT_PLAN.md`. Keep a working log in `docs/analysis/I-5_short_board_log.md` throughout, as in step I-4.

After I-5: step I-7 (final freeze of the GCD), then coding (`docs/PROJECT_PLAN.md` Step 2). Note for Step 2: the engine must read `data/board-long.json` and `data/board-short.json` (Step 2 in the plan still names the archived `data/board-v1-*.json`; fix that in I-7).

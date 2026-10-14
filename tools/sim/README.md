# Game simulator

All measurements behind the game design come from this folder. Node 22, no dependencies.
The engine implements the owner's core rules (docs/GCD.md §8.2a).

| Command | What it does |
|---|---|
| `node tools/sim/test/rules.test.mjs` | **Run first.** Scripted-dice tests: one per owner rule (entering, sixes, capture, trap, END, events, bonus card, Snake Leader) |
| `node tools/sim/run.mjs <board.json> [games] [out.md]` | All measures (fairness, length, excitement, boredom, every event square) for the board's rules and rule variants |
| `node tools/sim/ablate.mjs <board.json> [games] [out.md]` | With vs without: removes one event square at a time, with a noise row |
| `node tools/sim/sixes.mjs <board.json> [games] [out.md]` | Sixes in a row and captures per player, 2–4 players, short vs long games |
| `node tools/sim/lifelines.mjs <board.json> [games] [out.md]` | Owner idea: lifelines lost at Start/trap and when captured, +1 per 6: chance of being kicked out, lifelines left |
| `node tools/sim/lifelines-final.mjs <board.json> [games] [out.md]` | Owner's final lifeline rules: kicked out, lifelines left, whole game vs baseline |
| `node tools/sim/lifelines-compare.mjs <board.json> [games] [out.md]` | Lifeline versions side by side (A, B, B2) for the owner's choice |
| `node tools/sim/i6.mjs <board.json> [games] [out.md]` | Step I-6: each proposal on its own (stairs, lifelines, roadblock, two roads) and the thinking target (thoughtful vs simple players) |
| `node tools/sim/shortcut.mjs <board.json> [games]` | R20 check: one player who always takes the Shortcut against 3 simple players (fair = 25%) |
| `node tools/sim/i5-draft.mjs [games] [out.md]` | Step I-5.1: the draft short board (built from the long board's kept events) with the owner's options, and the Shortcut fairness check |
| `node tools/sim/options.mjs <board.json> [games] [out.md]` | Small rule options measured against the boredom target |

`archive/` holds earlier engines whose results are invalid or exploratory. Do not use them.

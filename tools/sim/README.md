# Game simulator

All measurements behind the game design come from this folder. Node 22, no dependencies.
The engine implements the owner's core rules (docs/GCD.md §8.2a).

| Command | What it does |
|---|---|
| `node tools/sim/test/rules.test.mjs` | **Run first.** Scripted-dice tests: one per owner rule (entering, sixes, capture, trap, END, events, bonus card, Snake Leader) |
| `node tools/sim/run.mjs <board.json> [games] [out.md]` | All measures (fairness, length, excitement, boredom, every event square) for the board's rules and rule variants |
| `node tools/sim/ablate.mjs <board.json> [games] [out.md]` | With vs without: removes one event square at a time, with a noise row |
| `node tools/sim/i6.mjs <board.json> [games] [out.md]` | Step I-6: each proposal on its own (stairs, lifelines, roadblock, two roads) and the thinking target (thoughtful vs simple players) |
| `node tools/sim/options.mjs <board.json> [games] [out.md]` | Small rule options measured against the boredom target |

`archive/` holds earlier engines whose results are invalid or exploratory. Do not use them.

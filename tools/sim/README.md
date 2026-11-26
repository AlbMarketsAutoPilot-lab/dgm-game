# Game simulator

All measurements behind the game design come from this folder. Node 22, no dependencies.
The engine implements the owner's core rules (docs/GCD.md §8.2a).

| Command | What it does |
|---|---|
| `tools/sim/engine3.mjs` | **Step I (v3 rules, GCD R1–R20):** the simulator for the v3 destination files (`data/lantern-festival.json`); robot and simple player. Rule tests: `test/v3-sim.test.ts` (run by `npm test`) |
| `node tools/sim/stepI.mjs [games] [out.md]` | Step I phase A3: the v3 rules on the Lantern Festival, robots and simple players (`docs/analysis/stepI-A_measure.md`; the app engine `src/engine/v3/` plays the same games: `test/v3-equivalence.test.ts`) |
`rng.mjs` is the random-number source shared by the v3 simulator and the app engine (`src/engine/rng.ts`).

`archive/` holds earlier engines whose results are invalid or exploratory. Do not use them. `archive/v2/` holds the v2
simulator (`engine.mjs`), its scripts and rule tests, and the paper boards they read (`data/`), moved there when the v2
rules were removed (Step I phase C8, owner 26 Nov 2026). They are the record behind the v2 reports in `docs/analysis/`;
their paths are no longer fixed, so they do not run as they are.

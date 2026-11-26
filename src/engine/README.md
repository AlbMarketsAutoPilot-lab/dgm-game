# Rules engine

Since Step I phase C (owner, 26 Nov 2026) the game plays the **v3 rules** (`docs/GCD.md` §8.2a R1–R20) on a v3
destination file (`data/lantern-festival.json`): `src/engine/v3/`. No DOM: the screens (`src/ui/`) drive it.
The v2 engine and its boards (202 and 100 squares) were removed in phase C8; they are in the git history, and the v2
simulator is in `tools/sim/archive/v2/`.

**Same seed, same game.** The engine draws its random numbers (`rng.ts`) in the same order as the v3 simulator
(`tools/sim/engine3.mjs`), so it plays exactly the simulator's games: `test/v3-equivalence.test.ts` checks this game by
game, so every number in `docs/analysis/stepI-A_measure.md` holds for the app.

## Use

```ts
import { DESTINATIONS, Game3, robot, runTurn3 } from "./v3";

const game = new Game3(DESTINATIONS["lantern-festival"], { players: 4, robots: [true, true, true, true] });
while (!game.over) runTurn3(game, robot);   // a game of robots
game.winner; game.events;                   // the winner's seat, and everything that happened (for the screens)
```

A turn is a generator: it runs until a person must choose (R19), yields the question and goes on with the answer.
`runTurn3` plays a turn with a decider function; the screen answers with Mr. Lin's panel instead.

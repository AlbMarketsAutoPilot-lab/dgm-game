# Rules engine (Step 2)

TypeScript port of `tools/sim/engine.mjs` for the frozen rules R1–R21 (`docs/GCD.md` §8.2a, §8.2b).
No DOM: the renderer (Step 3–4), the UI (Step 5) and the computer players (Step 6) all drive it.

**Same seed, same game.** The engine draws its random numbers in the same order as the simulator, so it plays
exactly the simulator's games. `test/equivalence.test.ts` checks this game by game against the simulator itself
(both boards, 2–4 players), and `npm run test:sim` reproduces the published 100,000-game numbers of
`docs/analysis/measure-long.md` and `measure-short.md` exactly. The app draws the first player at random (`first`);
the simulator always starts with seat 0, which is the engine's default, so the comparison is unchanged.

## Use

```ts
import { BOARDS, Game, runTurn, simplePlayer } from "./engine";

const game = new Game(BOARDS.long, { players: 4 });   // optional: seed, first (the seat that opens every round, default 0)
while (!game.over) runTurn(game, simplePlayer);       // a computer game
game.winner; game.events;                             // seat of the winner, everything that happened
```

A turn is a generator. It stops only when a player must choose (R21) and yields a `Decision`:

| `kind` | When | Answer |
|---|---|---|
| `road` | Standing on a crossroads, **before the throw** (R20) | `"main"` or `"shortcut"` |
| `bonusDefend` | Landing on a punishment while holding a bonus card (R14) | `true` = use the card |
| `bonusAttack` | Another player lands on a reward while you hold a bonus card (R14) | `true` = cancel it |

```ts
const turn = game.turn();
let r = turn.next();
while (!r.done) r = turn.next(await askThePlayer(r.value)); // the UI shows a prompt
```

Events (`GameEvent` in `types.ts`) are appended to `game.events` in order: `roll`, `move` (with the square-by-square
`path`, stair steps included), `jump` (ladder / snake / fallen tree / swap), `capture`, `tile`, `trapped`,
`lanternLost`, `win`, … The renderer animates them; the state in `game.players` is already the result.

Places (`Pos`): `-1` at Home, `-2` out, `0` the Start square, `1..lastTile`, `endTile` = END, and Shortcut
square `i` of fork `k` = `shortcutPos(k, i)` (= 1000 × (k + 1) + i, the simulator's numbering).

The computer player is `simplePlayer` (GCD §8.6): Main Road, bonus card on its own next punishment, never against
another player.

## Files

| File | What |
|---|---|
| `types.ts` | Board file types, player state, decisions, events |
| `board.ts` | Loads and checks `data/board-long.json`, `data/board-short.json` (`BOARDS`); refuses any rule value that is not the frozen one; place helpers |
| `game.ts` | `Game`, `runTurn`, `simplePlayer` |
| `rng.ts` | The simulator's seeded random numbers |
| `sim.ts` | `playGame`, `playGames`: many computer games and their figures (tests, measurements) |

## Kept exactly as measured

These follow the simulator (the frozen measurements depend on them). Any change needs the owner and a new measurement.

- **R10 swap:** the leader you swap with is treated like a captured player before taking your old square: their
  waiting turns, trap and failed throws are cleared (no capture event is shown).
- **R9 "next turn move 1":** that turn has no throw at all, and a pending "double your next throw" is used up by it.
- **Bonus card and Bog boots on the trap:** the bonus card is offered first; Bog boots work only if it is not used.
- **R14 against another player:** the simulator only measured "defend" (and an "attack the leader" variant). The
  engine offers the card against any other player's reward, as R14 says; computer players never use it that way, so
  the measured numbers are unchanged.

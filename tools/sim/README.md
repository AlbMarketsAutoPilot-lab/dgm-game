# Game simulator

All measurements behind the game design come from this folder. Node 22, no dependencies.

| Command | What it does |
|---|---|
| `node tools/sim/run.mjs <board.json> [games] [out.md]` | All measures for a board under its `rules`, plus rule variants (players, start, END, Tailwind) |
| `node tools/sim/ablate.mjs <board.json> [games] [out.md]` | "With vs without": removes one event square at a time and shows how each measure changes, plus a noise row |
| `node tools/sim/test/snapshot.mjs check` | Regression test: the paper board must give exactly the stored numbers |
| `node tools/sim/test/metrics.mjs` | Sanity tests of the excitement measures on tiny boards with known answers |

## Measures (GCD §11)

| Group | Measure | Meaning |
|---|---|---|
| A Fairness | Win % by seat | Turn order must not matter |
| B Excitement | Lead changes / game | How often the leader changes (checked after every round) |
| | Win % leader at half / last at half | Lower / higher = more open game |
| | Jackpots / falls per game | Jumps of at least 10% of the board forward / back (all players) |
| | Late overtakes / game | Lead changes once the new leader is in the last quarter of the board |
| | Win % of first into last quarter | Lower = the race is still open near the end |
| | Avg finish gap, close finishes | Squares between winner and runner-up at the end; close = 6 or less |
| C Boredom | Turns lost, 10+ turn no-move runs | Waiting without moving |
| Per event | Landing chance, win % if landed, impact | Impact = win % when the die put the player on the square minus when it made them just miss it |

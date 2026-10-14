> **INVALID (14 Oct 2026):** measured without the real core rules (entering with a 6 onto Start, extra throws on 6, capture). See `docs/GCD.md` §8.2a. To be redone.

# Simulation Report v0 — the paper board as drawn

**Source of every number:** [`sim-v0-results.md`](sim-v0-results.md), produced by
`node tools/sim/simulate.mjs data/board-v0-paper.json 100000` (seeded, reproducible), using the tile data in
[`data/board-v0-paper.json`](../../data/board-v0-paper.json).
100,000 games per scenario. The CI95 for a seat's win % is about ±0.3 points.

## 1. Simulation settings (where the paper board says nothing)

These are **settings, not facts**. Each one can be changed in the simulator, and the redesign (Step 1c) will decide them for real.

| Setting | Value used in baseline A | Tested alternative |
|---|---|---|
| Start | Must roll a 6, then move 6 | E: no 6 needed |
| END | Exact roll needed, otherwise stay | D: any roll that reaches END wins |
| Prison (30, via 97/148, or landing on it) | Leave only on a 6, then move 6 | – |
| Hospital 50 | Skip 3 turns | – |
| 45 / 123 | Roll 2 / 3 dice, move the sum, landing tile applies | – |
| 143 | Every other player's **next** throw is doubled | – |
| 15 | Next move is exactly 1 square | – |
| 75 | Swap with the nearest player ahead (none ahead → nothing) | – |
| 65 / 128 | Go **forward** to the nearest reward/punishment tile and apply it | – |
| 178 | Back to 167 (Q2 unconfirmed) | – |
| Cards | Free Jail Pass is used automatically when entering prison. Skip Punishment is used automatically on the next punishment tile. | F: cards off |
| Chaining | None, except when the text says so (97/148 → prison, 113 → hospital, 198 → skip 2). Matches answer Q4. | – |
| Capture / extra throw on 6 | None | – |
| Reward (R) / Punishment (P) tags | Shown in `board-v0-paper.json` (forward jump, card or extra throw = R; backward jump, skip or prison = P) | – |

## 2. Key findings (4 players, baseline A unless stated)

| # | Finding | Evidence |
|---|---|---|
| 1 | **Turn order is fair.** No seat has an advantage. | Win % by seat: 25.07 / 25.20 / 24.97 / 24.76 (fair is 25.0) |
| 2 | **Games are long.** About 50 rounds, so 200+ dice throws with 4 players; 2 players is even longer. | Median 50 rounds, 90th percentile 78. With 2 players: median 63, 90th percentile 114. |
| 3 | **A lot of waiting.** Each player loses about 12 turns, and more than half of those (6.7) are spent waiting at Start for a 6. | Turns lost 11.8; waiting at Start 6.7 |
| 4 | **Frustration risk.** Almost 1 in 3 players has a run of 10 or more turns without moving. | 28.9% have a streak of 10+ turns. **Without "need 6": 8.8%** (E). |
| 5 | **Rewards and punishments cancel out.** Players hit about 4 of each and the squares won and lost are almost equal. The tiles create big swings, but they don't change who is likely to win. | Hits: 4.30 rewards, 3.79 punishments. Squares: +99.8 vs −97.7. |
| 6 | **Very high resilience.** Being behind is never hopeless. | The leader at the halfway point wins only 33.9% (fair 25%). The last player at halfway still wins 16.9%. 66.1% of games are won by someone who was not leading at halfway. |
| 7 | **The outcome is almost pure luck. Players make no decisions.** Good for small children, but nothing for players who like to think. | Cards are used automatically. Turning them off changes almost nothing (F: 54.9 vs 52.6 mean rounds). |
| 8 | **The exact-END rule adds about 6 rounds.** | 52.6 → 46.2 mean rounds (D) |
| 9 | **With 2 players the board pushes backwards on balance.** | 2 players: squares +136 vs −155 per player |

## 3. What this means for the rebuild (input for Step 1c)

1. Keep the good parts: equal seats, strong comeback chances, and the stories.
2. Cut the waiting: drop or soften "need 6" (for example, allow 1 or 6), and limit how many turns in a row a player can lose.
3. Shorten the game: set a target game length (to be decided with the market report in Step 1b), then tune the board length and jumps to reach it.
4. Give players real choices, so the game also appeals to people who like to think. For example: choose when to play a card, choose between two paths, or decide whether to take a risky shortcut. Then measure in the simulator that choices help without making the game unfair.
5. Balance each tile individually. The next simulator version will measure each special tile's effect on win chance, so no single tile decides games.

## 4. Limits of this report

- It tests the paper rules under the settings in §1. Different readings of the unclear tiles (§10 of the GCD) would change the numbers somewhat.
- The simulated players always use cards automatically. Real players who choose could do better or worse.

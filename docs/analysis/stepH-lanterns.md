# Step H: nobody out, the lantern shield, Easy and Normal computer players

Owner, 22 Oct 2026 (GCD R14, R17, R18, R21). Measured with the real simulator (`tools/sim/engine.mjs`, which
`test/equivalence.test.ts` checks game by game against the app's engine, Easy and Normal players included).
40,000 games per row, 4 players. "1 X among 3 Y": the X player sits on each seat for 10,000 games,
so its win % has no seat effect (fair share 25%, ±0.42 at 95%). Command: `node tools/sim/stepH.mjs`.

- **Easy** = the simple player measured since I-7 (never spends a lantern, the Bonus card on its own next punishment,
  always the Bog boots).
- **Normal** = spends a spare lantern to leave the Bog at once (at Home it rolls for a 6); uses the Bonus card like Easy,
  except on the Bog itself when it holds the Bog boots (it wears the boots); otherwise shields a punishment worth 10
  squares or more (a square back = 1, a missed turn = 4, the Bog = 10 without boots, "nearest punishment" = 0: it is
  asked again on the square it reaches); never tries the last lantern.

## Long board

| Row | Win % | Rounds | Close finish | Lead changes | Waits 10+ turns | Players out | Lanterns spent / game | Lanterns lost (3 misses) / player |
|---|---|---|---|---|---|---|---|---|
| Rules until 21 Oct: 4 Easy | seats 25.6 / 24.8 / 25.1 / 24.5 | 50.6 | 11.2% | 7.7 | 1.1% | 0.08% | 0.00 | 0.83 |
| New rules: 4 Easy | seats 24.9 / 25.1 / 25.2 / 24.8 | 50.7 | 11.4% | 7.7 | 1.4% | 0.00% | 0.00 | 0.82 |
| New rules: 1 Normal among 3 Easy | Normal **30.4%** | 47.7 | 11.7% | 7.1 | 1.8% | 0.00% | 1.27 | 0.75 |
| New rules: 1 Easy among 3 Normal | Easy **20.3%** | 43.2 | 14.2% | 6.3 | 2.3% | 0.00% | 3.66 | 0.63 |
| New rules: 4 Normal | seats 25.3 / 25.1 / 25.0 / 24.5 | 41.4 | 15.5% | 6.0 | 2.6% | 0.00% | 4.78 | 0.58 |

## Short board

| Row | Win % | Rounds | Close finish | Lead changes | Waits 10+ turns | Players out | Lanterns spent / game | Lanterns lost (3 misses) / player |
|---|---|---|---|---|---|---|---|---|
| Rules until 21 Oct: 4 Easy | seats 25.4 / 25.0 / 24.7 / 24.9 | 28.9 | 21.8% | 6.5 | 0.7% | 0.08% | 0.00 | 0.81 |
| New rules: 4 Easy | seats 25.1 / 25.2 / 24.8 / 24.9 | 28.8 | 21.1% | 6.5 | 0.8% | 0.00% | 0.00 | 0.80 |
| New rules: 1 Normal among 3 Easy | Normal **31.9%** | 26.9 | 24.1% | 5.9 | 0.9% | 0.00% | 0.87 | 0.74 |
| New rules: 1 Easy among 3 Normal | Easy **18.9%** | 24.3 | 29.7% | 5.1 | 0.9% | 0.00% | 2.38 | 0.63 |
| New rules: 4 Normal | seats 25.2 / 24.8 / 25.1 / 24.8 | 23.1 | 32.5% | 4.8 | 0.8% | 0.00% | 3.03 | 0.58 |

## What it shows

- **Nobody is out** any more (before: 0.08% of players). Seats stay fair: every seat 24.5–25.6% in every row
  (fair share 25%, ±0.42).
- **The new rules alone change almost nothing for Easy players** (the same game length, close finishes and lead
  changes), so the old measurements still describe a game of Easy robots. Published 100,000-game reports regenerated:
  `measure-long.md`, `measure-short.md`.
- **The thinking target (GCD §11.3: a thoughtful player wins 27–32% against 3 simple players) is met for the first
  time:** 1 Normal among 3 Easy wins 30.4% (long) / 31.9% (short). A player who never uses lanterns among 3 Normal
  players wins 20.3% / 18.9%.
- **With 4 Normal players** (every player uses lanterns): shorter games (long 41.4 rounds instead of 50.7, short 23.1
  instead of 28.8), more close finishes (15.5% instead of 11.4%, short 32.5% instead of 21.1%), fewer lead changes
  (6.0 instead of 7.7, short 4.8 instead of 6.5), and more players waiting 10+ turns in a row on the long board (2.6%
  instead of 1.4%; short 0.8%, unchanged): a player who has spent every spare lantern waits at Home or in the Bog
  for a 6.
- These numbers agree with the previous session's scratch measurement (30.4% / 31.7%, 20.5% / 19.5%, 41 / 23 rounds,
  15.5% / 32.6% close finishes, 6.0 / 4.9 lead changes, 2.6% / 0.8% waiting 10+ turns).

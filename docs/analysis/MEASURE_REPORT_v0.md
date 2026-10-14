# Measurement Report — the paper board with the real rules (14 Oct 2026)

**Rules measured:** owner's core rules R1–R13 (`docs/GCD.md` §8.2a), coded in `tools/sim/engine.mjs` and checked by **30 scripted-dice rule tests** (`node tools/sim/test/rules.test.mjs`, all pass), e.g. "6, 6, 1, 5 moves 18" and "a captured player goes to Start".
**Board:** `data/board-v0-paper.json` (paper squares unchanged; bonus card measured on square **60**, as written on the board; the owner said 66, which is still to be confirmed).
**Raw numbers:** [measure-v0-paper.md](measure-v0-paper.md) (100,000 games per scenario) · [ablation-v0-paper.md](ablation-v0-paper.md) (with vs without each square, 40,000 games per run) · [options-v0-paper.md](options-v0-paper.md) (rule options, 50,000 games each).
No rule is frozen. This report only measures.

## 1. Results against the agreed criteria (4 players)

| Group | Criterion (GCD §11.3) | Paper board | Met? |
|---|---|---|---|
| A Fairness | Each seat within 25% ±1 | 25.17 / 24.93 / 24.84 / 25.06 | ✅ (also with 2 and 3 players, and in every rule variant) |
| B Excitement | Baseline to beat in later steps | See §2 | — (this is the baseline) |
| C Boredom | Fewer than 5% of players with 10+ turns without moving | **21%** | ❌ |

## 2. What the paper game does well (excitement), in numbers

| Measure | Value |
|---|---|
| Games with at least one capture | 97.4% |
| Captures per game | 5.4 (1.06 of them in the last quarter of the board) |
| Players captured at least once | 72% |
| Lead changes per game | 6.7 |
| Games with a late overtake (new leader in the last quarter) | 73% |
| The first player into the last quarter wins | only 38.7% (fair is 25%), so the end stays open |
| The player last at halfway still wins | 21.6% |
| Jackpots (20+ squares forward) / falls (20+ back) per game | 6.7 / 4.5 |

**The most exciting squares** (with vs without, ablation file):
- **75 "change place with the player closest to END"** is by far the strongest. It adds +1.3 lead changes and +0.55 late overtakes, and lowers the win % of the first player into the last quarter by 16 points.
- **202 Snake Leader's duty** adds +0.43 late overtakes (−5 points).
- **198 "Forgot keys again"** adds +0.31 late overtakes (−3.3 points).
- **188 "go downstairs"** adds +0.29.
- **65 "nearest reward"** adds +0.23 (−5.3 points).

**Rule effects:**
- **Exact END:** much more drama than "any total reaching END": 73% vs 59% of games have a late overtake, and 10.3% vs 2.5% are close finishes.
- **Capture:** creates the falls and resets. Without it, games are calmer: 0 captures, more close finishes (21.6%) but fewer lead resets.
- **Sixes:** your rule (6, 6, 1, 5 = 18) and the standard rule (6, 6, 1 = 13) give practically the same numbers.
- **Bonus card:** using it to attack the leader's reward gives slightly more excitement (+0.18 late overtakes) than using it to defend yourself.

## 3. Your "need a 6" reasoning, tested

You introduced "need a 6 to enter" so that players don't start together and knock each other out early. **The data confirms it.**

| | Need a 6 (paper) | No 6 needed |
|---|---|---|
| Captures in squares 1–20 per game | **1.57** | **3.87** (2.5× more) |
| Players captured at least once | 72% | 87% |

**But it is also the main cause of boredom.** Players wait **5 turns** on average to enter, and 21% of players have 10+ turns without moving. The trap (prison 30 and the squares sending you there) is the second cause: +2 points of 10-turn waits for square 30 alone.

## 4. Small options that keep the spacing and fix the boredom (measured, not decided)

| Option | 10+ turns without moving (target < 5%) | Captures in squares 1–20 | Late overtakes / game | Seats |
|---|---|---|---|---|
| Paper rules | 21% ❌ | 1.57 | 1.77 | fair |
| Enter with 6; after 3 failed tries you enter anyway | 5.5% ❌ (just above) | 2.95 | 1.79 | fair |
| Enter with 1 or 6 | 7% ❌ | 2.42 | 1.78 | fair |
| **Enter after 3 tries + trap: out with 6 or after 3 tries** | **1.1%** ✅ | 2.96 | 1.82 | fair |
| **Enter with 1 or 6 + trap: out with 6 or after 3 tries** | **2.9%** ✅ | **2.39** (keeps the most spacing) | 1.82 | fair |

Both ✅ options keep every excitement measure at least as high as the paper board, and the seats stay fair. The second one keeps more of your start spacing.

## 5. Questions for the owner
1. **Bonus card square: 60** (written on the board) **or 66** (your answer)?
2. Which boredom option (§4), if any, do you want to test further, or keep the paper rules?

# Step I-6: owner decisions and open questions (log)

Working log for step I-6 (`docs/prompts/I-6_logic_and_luck_proposals.md`). Nothing here is final until it is written into `docs/GCD.md` in step I-6.5.

## I-6.1 round 1: owner answers (14 Oct 2026)

| Topic | Owner decision |
|---|---|
| **L1 Waiting stairs** | ✅ Replaced by the owner's version: every throw at Start or in the trap that is not a 6 adds one stair step to the next square (trap 30 → 31, 31/1, 31/2…; Start → 1, 1/1, 1/2…). On the **third** throw the player moves anyway, but walks the stair steps first. Example: 2 failed throws, third throw 5 → 31, 31/1, 31/2, 32, 33 (slowed by 2 squares). |
| **Lifelines (stars)** | ✅ New: every player has lifelines. One is removed every time the player makes three throws without a 6. A player who loses all lifelines is kicked out. Message: "You did not get a 6 in three throws, so you lose a lifeline. Careful! If you lose all your lifelines you are out." |
| **Computer players** | ✅ The simple and thoughtful player types are agreed. |
| **Logic Layer G2–G4** | ❌ Rejected: "boring (not thrilling at all) or just dumb". New proposals needed. |

## Questions asked in round 2 (all answered in round 2, below)

My reading of the stairs and lifelines, to confirm or correct:
1. The stairs replace R16: you leave on your **3rd** throw (after 2 failed throws), not on your 4th turn as R16 works today.
2. A 6 on throw 1 or 2 frees you as today. If a stair step already exists, you still walk it.
3. A 6 on the 3rd throw counts as a normal 6: you throw again, add the throws, and walk the stairs.
4. The stair steps belong only to the waiting player: no events, no capture on them, and other players walk 31 → 32 normally. If you stop on 31/1, you continue from there next turn.
5. You lose a lifeline **only** at Start or in the trap (3 throws without a 6). If it applied to normal play, everyone would be out within about 10 turns (58% of 3-throw runs have no 6).
6. How many lifelines at the start? Rough estimate (to be measured): 1 lifeline → about 70% of players kicked out, most before they even enter; 2 → about 20%; 3 → about 5%.
7. With 3–4 players, the game goes on without the kicked-out player. The last player left wins.
8. Can lifelines be won back (e.g. on a few reward squares)?
9. Logic target: a thoughtful player against 3 simple players wins 27–32%. Yes or no?

## New Logic Layer proposals (round 2, waiting for the owner)

| # | Proposal | The choice | Price / risk | Simple choice | Thoughtful player |
|---|---|---|---|---|---|
| N1 | **Risk a lifeline!** | When something bad happens to you (captured, or your throw lands on a punishment), accept it or risk a lifeline: throw once. 5–6: it does not happen (if you were captured, the attacker goes to Start instead). 1–4: it happens and you lose a lifeline. | A lifeline; losing all = out | Accept | Risk only for a big loss (captured past square 60, a fall of 20+ squares, the trap) with 2+ lifelines; never the last one |
| N2 | **Roadblock** | Each player owns 1 roadblock. Before throwing, put it on an empty square up to 10 squares in front of any player. The first player to land on it (even its owner) goes back 10 squares, and the roadblock returns to its owner. | You can hit it yourself; while it waits on the board you cannot use it elsewhere | The game suggests the square in front of the leader | 1–5 squares in front of the leader, on the square that does not help them |
| N3 | **Two roads** | At 2 places the road splits: a safe road (longer, no events) or a wild road (shorter, with one big jackpot and one big fall). Choose at the fork. | Pure risk; the simulator makes both roads equal on average | Safe road | Wild road when 20+ squares behind the leader |

Dropped: "throw again and add, stop or push" (pushing is almost always best, so it is not a real choice) and "steady die vs wild die" (too close to the forbidden "choose between dice").

## I-6.1 round 2: owner answers (14 Oct 2026)

| Topic | Owner decision |
|---|---|
| Stairs and lifelines, questions 1–8 | ✅ Agreed as written above, with **3 lifelines** (owner first thought 5; 3 chosen from the numbers). |
| Winning lifelines back | ✅ Yes. The owner sees it as a possible part of the Logic Layer. |
| N1 Risk a lifeline | Not chosen. |
| N2 Roadblock | ✅ To measure, but **as a game event, not a player decision**: the game places it, anyone can fall on it. Keep it simple. |
| N3 Two roads | ✅ To measure ("I love this"). |
| N2 and N3 final approval | After the data. |
| Logic target 27–32% | ✅ Yes. |
| The owner's view | The Logic Layer is still lacking. |

Measured in step I-6.3: `docs/analysis/I-6_measurements.md`.

## I-6.3: owner answers (14 Oct 2026)

| Topic | Owner decision |
|---|---|
| Waiting stairs, 3 lifelines, roadblock (game event), two roads, spend a lifeline on a big punishment | ✅ Approved (still "not final" until written into the GCD in I-6.5) |
| Winning lifelines back on reward squares | ❌ Rejected: "not through luck". A lifeline may be won back only **through logic, and not easily**: "you lose through logic, you win through logic". |
| Reminder | The luck rules are frozen. |

Candidates for winning a lifeline back by a choice, measured in I-6.4 (`docs/analysis/I-6_combination.md`):
- **Rest:** instead of throwing, rest; 3 turns of rest in a row = 1 lifeline (also measured: 2 turns).
- **Refuse a big reward:** when a reward would move you 20+ squares forward, you may refuse it and take a lifeline instead.

## I-6.4: owner answers (14 Oct 2026)

| Topic | Owner decision |
|---|---|
| Spend a lifeline to cancel a punishment | ❌ Rejected. It mixes luck (punishment squares) with the logic lifelines. Lifelines are already lost through luck at Start and in the trap, so a player cannot afford to spend them. |
| Rest 3 turns = 1 lifeline | ❌ Rejected: not real logic. |
| Refuse a reward = 1 lifeline | ❌ (measured: does not help) |
| Still approved | Waiting stairs, 3 lifelines (lost only at Start / in the trap), roadblock (game event), two roads. |
| Open | How to win a lifeline back through logic, not easily. Asked: brain challenge / mind duel / planning on the board → owner: no preference. |

Engine options `lifeSpend`, `lifeRest`, `lifeRefuse`, `lifeSpendMax`, `lifeSpendUntil` stay in the code, switched off (they are not part of any approved set).

## Owner rule (14 Oct 2026, after the mind-duel proposal)

**Lifelines are too scarce to play with.** A player can lose two lifelines at Start and in the trap and keep only one. So **no logic rule may put a lifeline at risk** (no spending, no betting, no duels for lifelines). Mind duel: ❌ rejected.

## Lifelines: owner's final rules (14 Oct 2026)

Measured as ideas and dropped: −1 lifeline when captured, +1 lifeline for every 6 (`docs/analysis/lifelines-six-capture.md`).

| Rule | Owner decision |
|---|---|
| Start | 3 lifelines |
| Losing | −1 each time a player fails to get out of Start or the trap with a 6 (3 throws without a 6, waiting stairs) |
| At 0 | The player plays on. Message: "Attention! You have no lifelines left…". The **4th** loss = out. |
| Winning | +1 **only** for three 6s in a row in one turn |
| Captures | Cost no lifeline |

Measured: `docs/analysis/lifelines-final.md`.

# Step I-6: owner decisions and open questions (log)

Working log for step I-6 (`docs/prompts/I-6_logic_and_luck_proposals.md`). Nothing here is final until it is written into `docs/GCD.md` in step I-6.5.

## I-6.1 round 1: owner answers (14 Oct 2026)

| Topic | Owner decision |
|---|---|
| **L1 Waiting stairs** | ✅ Replaced by the owner's version: every throw at Start or in the trap that is not a 6 adds one stair step to the next square (trap 30 → 31, 31/1, 31/2…; Start → 1, 1/1, 1/2…). On the **third** throw the player moves anyway, but walks the stair steps first. Example: 2 failed throws, third throw 5 → 31, 31/1, 31/2, 32, 33 (slowed by 2 squares). |
| **Lifelines (stars)** | ✅ New: every player has lifelines. One is removed every time the player makes three throws without a 6. A player who loses all lifelines is kicked out. Message: "You did not get a 6 in three throws, so you lose a lifeline. Careful! If you lose all your lifelines you are out." |
| **Computer players** | ✅ The simple and thoughtful player types are agreed. |
| **Logic Layer G2–G4** | ❌ Rejected: "boring (not thrilling at all) or just dumb". New proposals needed. |

## Open questions (round 2)

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

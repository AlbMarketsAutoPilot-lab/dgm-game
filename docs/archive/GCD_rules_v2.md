# GCD v2 rules R1–R21 and computer players (archived)

> Replaced by the rules v3 in `docs/GCD.md` §8.2 (owner, 25 Nov 2026, Step I). Kept as the record of the frozen v2 rules (14 Oct – 22 Oct 2026).

### 8.2a Core rules of the original game ✅ (owner answers, 14 Oct 2026)

These are the paper game's real rules. Any change to them must be small, measured, and approved by the owner.

| # | Rule |
|---|---|
| R1 | **Entering:** players begin off the board. A **6** puts the token on the **Start square** (no number). Because it is a 6, the player throws again and advances from Start. |
| R2 | **Sixes** (changed by the owner, 15 Oct 2026, after the real-life test): **every 6 gives exactly one more throw.** The throws add up and the token moves **once** by the total (6, 2 → 8; 6, 6, 1 → 13, then the turn ends). **Maximum three 6s:** on the third 6 the player moves 6 × 3 = 18 and the turn ends. (Before: "6, 6, 1, 5 → 18", two 6s earned two extra throws.) |
| R3 | **Passing over:** squares passed during a move have no effect and capture nobody. Only the final square counts. |
| R4 | **Capture (universal):** a player who lands on a square occupied by another player, **by a throw or by any jump** (ladder, snake, "go to X", swap), sends that player back to the **Start square**. No safe squares; only Start can hold several players. |
| R5 | **Back on Start:** a player sent to Start (by capture or by square 10) moves normally from their next turn and does **not** need another 6. |
| R6 | **Trap square (paper: Prison 30), and the "danger road" squares that send you there:** landing on it by a normal throw also traps you. Only a 6 gets you out; that 6 does not move you. Because it is a 6, you throw again and move normally. The out-6 counts as the first of the maximum three (6 out, 6, 6 → move 12, end). |
| R7 | **Hospital 50:** miss 3 turns. |
| R8 | **END:** needs an exact throw; if the total is too big, you stay where you are. |
| R9 | **15:** next turn you move exactly 1, whatever the die shows. **45:** throw twice, one move with the total. **123:** throw 3 times, one move with the total; the square you land on applies. **143:** the other players double their next throw only. |
| R10 | **75:** change place with the player closest to the END (the leader). |
| R11 | **65 / 128:** the nearest reward / punishment **forward only**. **178:** back to **167**. |
| R12 | 2–4 players, one token each. |
| R13 | **Content:** the trap mechanic stays. Only its name and story change (e.g. "prison" → a neutral journey trap) to protect the family rating. |

| R14 | **Bonus card** (photos 5 and 21 are the same card): received on the "skip a punishment" square. Used **once, whenever you like**: either avoid one of your own punishments, or cancel a reward of another player of your choice. **Owner, 22 Oct 2026:** a spare lantern can also cancel your own punishment (R18). Only the Bonus card can cancel another player's reward. |
| R15 | The 6 used to enter or to leave the trap counts as a 6 (first of the three) but gives no points. |

| R16 | ~~Enter with a 6, or automatically after 3 failed tries; trap: out with a 6, or automatically after 3 failed tries.~~ **Replaced by R17** (owner, step I-6). |

Bonus card square confirmed: **60**. Bonus card use: **avoid your own next punishment** (the paper's "defend" use; this is how it is measured).

### 8.2b Rules added in step I-6 ✅ (owner, 14 Oct 2026)

| # | Rule |
|---|---|
| R17 | **Third throw** (changed by the owner, 22 Oct 2026): at Home or in the Bog, a 6 lets you in (or out) and **moves nobody** (R15); you throw again and move by that throw: 6, 2 → square 2, always. **On the 3rd throw without a 6:** if you have a spare lantern, one is used automatically and you move by that 3rd throw. If you have only your last lantern, you lose nothing and keep throwing on your next turns until you throw a 6, with no limit. **Spend a lantern:** with a spare lantern you may spend it before throwing to leave at once, then throw and move as on any turn (a 6 throws again). There are no stair steps, so two players never share a square: square 1 is a square like any other (R4). *(Before 22 Oct: the 3rd throw without a 6 always cost a lantern, and a lantern could be spent with only 1 left.)* |
| R18 | **Lanterns** (the lifelines; changed by the owner, 22 Oct 2026). Every player starts with **3**. **Your last lantern is never lost or spent:** you keep it to light on the last square, so **nobody is ever out of the game**. Lanterns above the last one are *spare*. A spare lantern goes: (a) automatically after 3 throws without a 6 (R17); (b) by choice, to leave Home or the Bog at once (R17); (c) by choice, as a **shield**: when you land on a red ▼ square (any punishment, including the Bog and the squares that send you there), spend one to cancel it. A shield never works against a bump (R4) or the fallen tree (R19), it protects only you, and it never works on the square where the other players double their next throw (long 143, short 72): that would cancel their reward (owner, 22 Oct 2026). You **win 1** by throwing three 6s in a row in one turn (the 6 that lets you in or out counts as the first); no upper limit. Trying to use the last lantern only shows a message. Bumps never touch lanterns. *(Before 22 Oct: the 4th loss put the player out; with 3–4 players the last player left won.)* |
| R19 | **Roadblock** (a game event, nobody decides). At the start of each round, if no roadblock is on the board, the game puts one on a random free plain square 1–10 squares in front of the leader (not an event square, not occupied, not a crossroads). The first player to land on it, by a throw or any jump, goes **back 10 squares** (no chaining; capture applies). It is then removed and placed again at the start of the next round (if the leader is on a wild road, it waits until the leader is back on the main road). Passing over it does nothing (R3). |
| R20 | ~~Two roads (Main Road and the Shortcut).~~ **Removed by the owner, 15 Oct 2026:** there are no crossroads and no Shortcut on either board; a throw is always counted in full. |
| R21 | **Who decides what** (changed by the owner, 22 Oct 2026). A player chooses: when to use the **Bonus card** (R14); whether to **spend a spare lantern** to leave Home or the Bog (R17); whether to use the **lantern shield** (R18); whether to wear the **Bog boots**. Computer players have **two levels**, chosen on the start screen: **Easy** is the simple player measured since I-7 (unchanged: never spends a lantern, the Bonus card on its own next punishment, always the Bog boots); **Normal** uses spare lanterns (strategy in §8.6). Measured: `docs/analysis/stepH-lanterns.md`. |

**Owner, 22 Oct 2026 (step H):** R14, R17, R18 and R21 changed as written above: nobody is out any more, a spare lantern is a shield against your own punishments, and computer players are Easy or Normal. Report: `docs/analysis/stepH-lanterns.md`.

**Owner, 15 Oct 2026: a second Bonus card square** (long 155, short 85; same card as R14), chosen from the five calculations in `docs/analysis/audit-2026-10-15.md` §4: fewer falls, more close finishes, shorter games, still fair (seats 24.7–25.6%). The order of good and bad squares stays (spreading them evenly measured worse).

**Owner, 15 Oct 2026 (real-life test):** R2, R17 and R20 changed as written above; the computer players are unchanged (they never had a choice left but the Bonus card). Measured, 40,000 games per board: every seat wins 24.7–25.2% (±0.42); long 52.1 rounds, short 30.1. Report: `docs/analysis/audit-2026-10-15.md`.

**Status (14 Oct 2026): rules R1–R21 are FROZEN (owner).** Boards: the long board `data/board-long.json` (the paper squares; its `rules` are identical to `data/board-v0-paper.json`) and the short board `data/board-short.json` (§10.1). **Square numbers in R6–R11 and R20 are long-board squares;** the short board's own squares (trap 15, crossroads 41 and 80, …) are in §10.1 and in its file. Measurements of the frozen game: `docs/analysis/measure-frozen.md`, `docs/analysis/lifelines-final.md`, `docs/analysis/lifelines-compare.md` (version A = R18), `docs/analysis/sixes-and-captures.md`.

**Logic Layer result (honest):** the thinking target (a thoughtful player wins 27–32% against 3 simple players) is **not met**. With the bonus card and the road choice, a thoughtful player wins **25.2–25.5%** (`docs/analysis/I-6_measurements.md`). Ideas that met it (spending lifelines) were rejected because lifelines are too scarce to risk (owner rule: no logic choice may put a lifeline at risk, and luck squares and lifelines are never mixed). The game is a chance game with two small choices. History of every proposal and decision: `docs/analysis/I-6_owner_decisions.md`.

**All measurements made before 14 Oct evening ignored R1–R6 and are invalid** (`docs/analysis/*` v0 reports, the old ablations). They were redone with the corrected engine: `measure-v0-paper.md`, `measure-frozen.md`, `measure-long.md`, `measure-short.md`, `ablation-long.md`.

### 8.6 Computer players ✅ (owner, step I-7; levels: owner, 22 Oct 2026)
- Any seat can be a computer player. The Easy level plays as the **simple player** the simulator measured (`types: "simple"` in `tools/sim/engine.mjs`), so every fairness and excitement number in this document holds for it:
  - (there are no crossroads any more: R20 was removed, owner 15 Oct 2026);
  - it uses its **Bonus card** on its own next punishment (R14, the "defend" use);
  - Bog boots: always worn (a person is asked, owner 15 Oct). Never spends a lantern to leave Home or the Bog.
- It has no other choice to make: everything else is the dice (R21).
- **Two levels** (owner, 22 Oct 2026), chosen on the start screen ("Computer players: Easy / Normal", the same for every computer seat; Normal unless chosen otherwise):
  - **Easy** = the simple player above, unchanged.
  - **Normal** = spends a spare lantern to leave the Bog at once (at Home it rolls for a 6); uses the Bonus card like Easy, except on the Bog itself when it holds the Bog boots: then it wears the boots; otherwise shields a punishment worth 10 squares or more (a square back = 1, a missed turn = 4, the Bog = 10 without boots); never tries the last lantern. Measured: wins 30.4% (long) / 31.9% (short) against 3 Easy (`docs/analysis/stepH-lanterns.md`).

# Step I-7: final freeze of the GCD (working log)

Step I-7 (`docs/GCD.md` §13): owner approval, then the GCD is marked FROZEN and coding (`docs/PROJECT_PLAN.md` Step 2) starts.

## I-7.1 Clean-up before the freeze ✅ (owner approved, 14 Oct 2026)

Only text that disagreed with a decision **already recorded** was changed. No rule, number, board or story changed.

| Where | Was | Now | Recorded decision |
|---|---|---|---|
| Header, references | paper measurements in `SIM_REPORT_v0.md`, `sim-v0-paper-engine-results.md` (both marked INVALID) | `MEASURE_REPORT_v0.md`, `measure-v0-paper.md` (real rules) | §8.2a: older reports invalid |
| §6 emotional curve | 💡 | ✅ | §16 item 2 |
| §8.2b status | board = `data/board-v0-paper.json` | the long and short board files; square numbers in R6–R11 and R20 are long-board squares, the short board's are in §10.1 | I-4, I-5 |
| §8.2b measurements note | "will be redone" | names the redone reports | measure-frozen / -long / -short, ablation-long |
| §8.3 event families | "decided in the tuning step" | decided with the simulator, in the board files | I-3 to I-6, I-5 |
| §8.4 heritage | 💡 (keys, swap, doubling; one event every 5 squares) | ✅ | I-4, I-5 |
| §11.3 targets | 💡 "owner to confirm" | ✅; paper values from `measure-v0-paper.md`; paper boredom 21% (was 27–29% from the invalid report) | §16 item 5 |
| §12 replay pull | 💡 | ✅ (all) | §16 item 6 |
| §13 I-1 | no mark | ✅ | §16 |
| §15 technology | "the frozen board files" | names `data/board-long.json`, `data/board-short.json` | I-4, I-5 |
| `PROJECT_PLAN.md` Step 2 | reads the archived `data/board-v1-*.json` | reads `data/board-long.json` and `data/board-short.json` | I-5 note |

## Questions for the owner (I-7): all three answered yes

1. **Target B wording.** §11.3 says "better than the paper board on every excitement measure". The frozen long board has close finishes 10.2% against the paper's 10.3%. That is a tie: the 95% margin at 100,000 games is ±0.19 points. Every other measure is better. **Recommendation:** reword to "at least as good as the paper board on every excitement measure (within the measurement margin)". This is how I-5 was judged, and both boards pass.
2. **Two plan items the GCD does not contain.** The GCD says "anything not written here is not built".
   - **Computer players** (Plan Step 6, optional). **Recommendation:** add them to the GCD as the measured "simple" player: Main Road always, Bonus card used on its own next punishment. Their play is the one the simulator measured, so fairness is proven for them.
   - **Read-aloud** (Plan Step 5). C3 forbids numbers read aloud. **Recommendation:** drop read-aloud, and keep the other accessibility items in §14 (colour + icon, big buttons, high contrast, reduced motion, no timers).
3. **Freeze.** With the answers above written in, mark the GCD **FROZEN** (version 2, 14 Oct 2026) and start coding?

## I-7.2 Freeze ✅ (owner, 14 Oct 2026)

Written into `docs/GCD.md`:
- Title and status: **FROZEN** (v2, 14 Oct 2026). A later change needs the owner's approval and, for a rule or a board, a new measurement.
- §11.3 B: "at least as good as the paper board on every excitement measure, within the measurement margin".
- §8.6 (new): computer players = the measured simple player (Main Road always, Bonus card on its own next punishment).
- §14: no read-aloud.
- §13: I-7 ✅. §16: owner decisions on I-7.

`docs/PROJECT_PLAN.md`: I-7 ✅, Step 2 next. Step 5 accessibility follows GCD §14 (no read-aloud). Step 6 computer players follow GCD §8.6.

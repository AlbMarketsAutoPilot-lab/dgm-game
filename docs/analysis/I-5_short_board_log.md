# Step I-5: the short board, "The Quick Trip" (working log)

Working log for step I-5 (`docs/prompts/I-5_short_board.md`). Nothing here is final until it is written into `docs/GCD.md` §10 in step I-5.4. Rules R1–R21 are frozen: the short board changes only **where** events are and **how far** they jump.

## I-5.1 Which events to keep (proposal, waiting for the owner)

**Method.**
1. Ablation of the long board with the frozen rules (`node tools/sim/ablate.mjs data/board-long.json 100000`, report `docs/analysis/ablation-long.md`). It removes one event at a time; the noise row is ≤ 0.3 points.
2. A draft short board built from the kept events. It was measured with every event removed or added once (20,000 games each), and then in full (`node tools/sim/i5-draft.mjs 100000`, report `docs/analysis/I-5_draft_measure.md`).

**Placement.** Every kept event goes to about half its long-board square, and every jump goes to about half its long-board destination. Each event therefore stays in the same region and goes to the same story place (the Lodge, Central Station, the river…). Regions on the short board: Home Town 0–9 · Countryside 10–24 · Forest 25–40 · River & Lake 41–53 · Mountains 54–68 · Seaside 69–79 · Big City 80–94 · Festival Road 95–100.

**Result: 23 events out of 41**, about one every 4–5 squares, as on paper. All the signature events are kept.

"What it adds" = long-board ablation, with minus without (100,000 games): lead changes, late overtakes, win % of the first player into the last quarter (lower = more open), turns lost (boredom). Only differences above the noise are named.

| Long sq | Story | What it adds (long board) | Keep? | Short sq (→ to) |
|---|---|---|---|---|
| 5 | Shoelace untied. Again. Wait one turn. | boredom: +0.7 turns lost, no excitement | drop | – |
| 10 | Wait… did you lock the door? Back home. | less hope for the last player (−0.5) | drop | – |
| 15 | Ankle-deep puddle. Next turn: one careful step. | neutral | keep (the one small event at home) | 7 |
| 20 | A farmer offers a lift. Don't overthink it. | more open (−0.4), −0.3 turns lost | keep | 10 → 16 |
| 25 | Sheep have right of way. Wait one turn. | less hope (−0.4), +0.2 turns lost | drop | – |
| 30 | The Bog. Your shoes live here now. Roll a 6. | signature, frozen mechanic | **keep** | 15 |
| 35 | Hay cart to the forest. Not glamorous, but fast. | more open (−0.4) | keep | 17 → 33 |
| 40 | Hot-air balloon. See you at the river! | weak (−0.3 lead changes), but it is the big early jackpot; on the short draft it adds +0.85 jackpots/game, needed for the target | keep | 20 → 51 |
| 45 | It's all downhill from here. Throw twice, add up. | neutral (on the short draft: less hope, −0.9) | drop | – |
| 50 | Fog rolls in… Wait three turns. | boredom: +0.6 turns lost | drop | – |
| 55 | Forest Station. A train that's actually on time! | less open (+0.5) | drop | – |
| 60 | A kind stranger slips you a Bonus card. | frozen mechanic (R14) | **keep** | 30 |
| 65 | A local knows a shortcut: next good square! | +0.3 lead changes, +0.25 late overtakes, far more open (−5.3) | keep (its next good square is the swap, as on the long board) | 32 |
| 70 | Train cancelled. Of course. Back to Forest Station. | neutral (needs 55) | drop | – |
| 75 | Plot twist! Swap places with the leader. | the strongest event: +1.3 lead changes, −15.8 | **keep** | 37 |
| 80 | Cable car to the Mountain Lodge. Window seat! | +1.4 close finishes, +0.18 late overtakes, −0.5 turns lost | keep | 40 → 67 |
| 85 | Free boat ride to the Harbour. Best day ever. | small | drop | – |
| 90 | Bog boots. Mud? Never heard of it. | frozen card | **keep** (on the Main Road, as on the long board) | 45 |
| 95 | Ducks on the bridge… Wait one turn. | neutral | drop | – |
| 97 | Riverbank selfie. Slipped. Straight into the Bog. | +0.2 lead changes, more open (−0.6); on the short draft +0.3 lead changes, needed for the target | keep | 49 → Bog 15 |
| 101 | Missed the boat. Literally. Back to the Pier. | neutral | drop | – |
| 108 | Spontaneous weekend off. Straight to the Mountain Lodge. | +0.7 close finishes, more open (−1.0) | keep | 54 → 67 |
| 113 | Wrong turn. Back down into the fog, wait three turns. | +0.4 lead changes, but +0.6 turns lost (and needs the fog) | drop | – |
| 118 | Free ski lift. Every little helps. | neutral | drop | – |
| 123 | Sledge run! Throw three times, add them all up. | neutral | keep (the only "throw 3 times"; fills the Mountains) | 61 |
| 128 | You trust the map app again. Next bad square. | slightly negative | drop | – |
| 133 | Lodge booking? What booking? Back to Base Camp. | +0.2 lead changes | keep | 66 → 55 |
| 138 | A sea snake gives you a lift. Snake Leader! | signature: +2.4 close finishes, −0.6 turns lost | **keep** | 69 → 97 |
| 143 | Ice cream break. Everyone else doubles their next throw. | signature, neutral | **keep** | 72 |
| 148 | Wrong ferry. All the way back to the Bog. | +0.5 lead changes | keep | 74 → Bog 15 |
| 153 | Waiting for the tide. Wait one turn. | neutral | drop | – |
| 158 | Wrong snake. This one goes all the way back. | +0.6 lead changes, more open (−1.3) | keep | 79 → 24 |
| 163 | Green lights all the way. Throw again. | neutral | drop | – |
| 168 | Friends saved you a spot at the Fair! | neutral | drop | – |
| 173 | Last e-scooter in town. Zoom to Central Station! | slightly negative | drop | – |
| 178 | Forgot your Fair ticket. Go back for it. | neutral | drop | – |
| 183 | Fell asleep on the train. Woke up at the river. | +0.5 lead changes, more open (−1.7) | keep | 91 → 48 |
| 188 | Missed your stop. Back to the seaside. | +0.5 lead changes, +0.33 late overtakes, −2.0 | keep | 94 → 78 |
| 193 | Forgot your keys! Back to Central Station. | +0.12 late overtakes, −0.9 | keep ("AGAIN" needs it) | 96 → 92 |
| 198 | Forgot your keys AGAIN!!! … wait two turns. | signature: +0.35 late overtakes, −3.3 | **keep** | 99 → 92, wait 2 |
| 202 | Snake Leader? The snake wants its ride back. | signature: +0.6 lead changes, +0.45 late overtakes, −4.7 | **keep** | 100 → 82 (Snake Leader only) |

Landmarks used on the short board: Base Camp 55, Mountain Lodge 67, Central Station 92. The texts are step I-5.3.

### Numbers that must change for a half-length board (one recommendation each)

| # | Number | Long board | Recommendation for the short board | Measured (100,000 games, `I-5_draft_measure.md`) |
|---|---|---|---|---|
| 1 | Fallen tree (R19) | back 10, range 10 | **No change: back 10, range 10** | Falls/game 5.82 (paper 4.48) and lead changes 6.8 (paper 6.7) both pass. With the tree halved (5/5), falls drop to 4.26 and lead changes to 6.6, so **both fail** |
| 2 | Crossroads (R20) | two: 82 and 160 | **Keep both**, at 41 (roads meet at 48) and 80 (roads meet at 90). Both choices of R21 stay | With only one crossroads, lead changes drop to 6.7: equal to the paper board, so the target is not beaten |
| 3 | Shortcut 1 | 13 squares; Shortcut sq 2 → 100; sq 5 → Bog | **6 squares; Shortcut square 1 → 50; square 2 → Bog (15)** | A player who always takes the Shortcut wins **25.45%** (±0.19; long board 25.1%): fair |
| 4 | Shortcut 2 | 19 squares; sq 3 → 185; sq 7 → Bog | **9 squares; Shortcut square 1 → 92 (Central Station); square 3 → Bog (15)** | (same check, both forks together) |
| 5 | Snake Leader | 138 → 195 (57 ahead); 202 → 165 (37 back, badge only) | **69 → 97 (28 ahead); 100 → 82 (18 back, badge only)** | It stays the biggest late-game swing |
| 6 | All other jumps | long squares | about half, same story place (table above) | – |

Note: the thoughtful computer player counts a loss of 20+ squares as "big" (`bigLoss: 20`, fixed). None of the I-5 targets uses that player, so it does not matter here. It only matters if the thinking target is measured again on the short board.

### Draft against the §11.3 targets (100,000 games; final numbers come in I-5.2)

| Target | Paper board (`measure-v0-paper.md`) | Long board | **Short draft** | Pass? |
|---|---|---|---|---|
| A. Every seat 24–26% | – | 24.84–25.30 | **24.76–25.22** | ✅ |
| B. Lead changes / game ↑ | 6.7 | 7.6 | **6.8** | ✅ (narrowly) |
| B. Win % leader at half ↓ | 29.6% | 28.9% | **27.8%** | ✅ |
| B. Win % last at half ↑ | 21.6% | 22.7% | **23.4%** | ✅ |
| B. Late overtakes / game ↑ | 1.76 | 1.89 | **2.68** | ✅ |
| B. Games with a late overtake ↑ | 73.3% | 75.2% | **83.1%** | ✅ |
| B. Win % first into last quarter ↓ | 38.7% | 37.5% | **34.0%** | ✅ |
| B. Close finishes (≤ 6 squares) ↑ | 10.3% | 10.3% | **18.1%** | ✅ |
| B. Jackpots / game ↑ | 6.68 | 6.94 | **7.55** | ✅ |
| B. Falls / game ↑ | 4.48 | 4.59 | **5.82** | ✅ |
| C. 10+ turns without moving < 5% | 21% | 1.2% | **0.7%** | ✅ |
| Game length (reported only) | 51.9 rounds | 52 rounds | **31 rounds** | – |

The average finish gap is counted in squares (paper 57.5, short 23.9), so it shrinks with the board and is not compared.

**Questions to the owner (I-5.1):**
1. The list of 23 events (keep / drop): agree?
2. Fallen tree unchanged (10 back, range 10): agree?
3. Both crossroads, with the halved Shortcuts (#3, #4): agree?
4. Snake Leader 69 → 97 and back 100 → 82: agree?

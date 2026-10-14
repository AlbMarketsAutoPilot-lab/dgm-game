# Step I-5: the short board, "The Quick Trip" (working log)

Working log for step I-5 (`docs/prompts/I-5_short_board.md`). Nothing here is final until it is written into `docs/GCD.md` §10 in step I-5.4. Rules R1–R21 are frozen: the short board changes only **where** events are and **how far** they jump.

## I-5.1 Which events to keep ✅ (owner approved all four answers, 14 Oct 2026)

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

**Questions to the owner (I-5.1), all answered yes:**
1. The list of 23 events (keep / drop): agree?
2. Fallen tree unchanged (10 back, range 10): agree?
3. Both crossroads, with the halved Shortcuts (#3, #4): agree?
4. Snake Leader 69 → 97 and back 100 → 82: agree?

## I-5.2 Build and measure ✅ (owner approved, 14 Oct 2026: Shortcut left as it is)

`data/board-short.json` is built from the approved list (the same mapping as `tools/sim/i5-draft.mjs`). It has 23 event squares; destinations are short-board squares. Its `rules` are identical to the long board's except `forks` (crossroads 41 and 80, halved Shortcuts). The fallen tree is unchanged (back 10, range 10). `text` keeps the paper's original words, so a few of them still name long-board numbers (e.g. 10 "Go to 33" now goes to 16); the real destination is `to`, and the story texts (I-5.3) replace these words on screen.

Commands: `node tools/sim/test/rules.test.mjs` (ALL PASS) · `node tools/sim/run.mjs data/board-short.json 100000` (report `docs/analysis/measure-short.md`) · `node tools/sim/shortcut.mjs data/board-short.json 100000` (Shortcut check).

| Target (§11.3) | Paper board | Long board | **Short board** | Pass? |
|---|---|---|---|---|
| A. Every seat within ±1 point (4 players) | – | 25.15 / 24.78 / 25.05 / 25.02 | **24.95 / 25.18 / 24.83 / 25.04** | ✅ |
| A. 3 players / 2 players | – | 33.25–33.45 / 49.73–50.27 | **33.13–33.47 / 49.78–50.22** | ✅ |
| B. Lead changes / game ↑ | 6.7 | 7.6 | **6.8** | ✅ (narrowly) |
| B. Win % leader at half ↓ | 29.6% | 28.7% | **27.5%** | ✅ |
| B. Win % last at half ↑ | 21.6% | 22.6% | **23.4%** | ✅ |
| B. Comeback wins ↑ | 70.4% | 71.3% | **72.5%** | ✅ |
| B. Late overtakes / game ↑ | 1.76 | 1.9 | **2.67** | ✅ |
| B. Games with a late overtake ↑ | 73.3% | 75.4% | **83%** | ✅ |
| B. Win % first into last quarter ↓ | 38.7% | 37.3% | **34.2%** | ✅ |
| B. Close finishes (≤ 6 squares) ↑ | 10.3% | 10.2% | **17.8%** | ✅ |
| B. Jackpots / game ↑ | 6.68 | 6.96 | **7.53** | ✅ |
| B. Falls / game ↑ | 4.48 | 4.59 | **5.8** | ✅ |
| B. Captures / game (information) | 5.44 | 7.47 | **6.94** | – |
| C. 10+ turns without moving < 5% | 21% | 1.2% | **0.7%** (3p 1.3%, 2p 2.5%) | ✅ |
| R20. Always-Shortcut player wins ≈ 25% | – | 24.96% (same check) | **25.45%** (±0.19) | ✅ |
| Game length (reported only) | 51.9 rounds | 52 rounds | **30.9 rounds** (median 28; 10% of games ≤ 16, 10% ≥ 49) | – |

Jackpot / fall = a jump of at least 10% of the board (long 20 squares, short 10). Average finish gap is in squares, so it is not compared (paper 57.5, short 24.1).

**Result: every target is met, no change needed.** The Shortcut is 0.45 points above fair (the long board is at fair). That is far inside the ±1 point allowed for seats, so I recommend leaving it. The smallest change that lowers it would be to move a Shortcut jackpot target down one square. Lead changes pass with the smallest margin (6.8 vs 6.7).

## I-5.3 Texts (waiting for the owner)

**Check.** Every kept event is in the same region on the short board as on the long board, and every jump lands in the same region as its long-board jump (checked square by square against `data/board-long.json` `story.regions`). So every approved text still tells the truth, and **all 23 texts and icons are reused unchanged. No square needs a new text.**

### Regions on the short board (long-board squares halved)

| Region | Long board | Short board |
|---|---|---|
| Home Town | Start–19 | Start–9 |
| Countryside | 20–49 | 10–24 |
| Forest | 50–81 | 25–40 |
| River & Lake | 82–107 | 41–53 |
| Mountains | 108–137 | 54–68 |
| Seaside | 138–159 | 69–79 |
| Big City | 160–189 | 80–94 |
| Festival Road | 190–202 | 95–100 |

### Event squares

| Short sq | Text (reused from long sq) | Icon | Goes to |
|---|---|---|---|
| 7 | Ankle-deep puddle. Next turn: one careful step. (15) | puddle | – |
| 10 | A farmer offers a lift. Don't overthink it. (20) | tractor | 16 |
| 15 | The Bog. Your shoes live here now. Roll a 6. (30) | boot-in-mud | – |
| 17 | Hay cart to the forest. Not glamorous, but fast. (35) | hay-cart | 33 (Forest) |
| 20 | Hot-air balloon. See you at the river! (40) | balloon | 51 (River & Lake) |
| 30 | A kind stranger slips you a Bonus card. (60) | card | – |
| 32 | A local knows a shortcut: next good square! (65) | signpost | 37 (the swap) |
| 37 | Plot twist! Swap places with the leader. (75) | swap-arrows | – |
| 40 | Cable car to the Mountain Lodge. Window seat! (80) | cable-car | 67 (Mountain Lodge) |
| 45 | Bog boots. Mud? Never heard of it. (90) | boots | – |
| 49 | Riverbank selfie. Slipped. Straight into the Bog. (97) | slide-mud | Bog 15 |
| 54 | Spontaneous weekend off. Straight to the Mountain Lodge. (108) | suitcase | 67 (Mountain Lodge) |
| 61 | Sledge run! Throw three times, add them all up. (123) | sledge | – |
| 66 | Lodge booking? What booking? Back to Base Camp. (133) | crossed-bed | 55 (Base Camp) |
| 69 | A sea snake gives you a lift. Snake Leader! (138) | snake-crown | 97 (Festival Road) |
| 72 | Ice cream break. Everyone else doubles their next throw. (143) | ice-cream | – |
| 74 | Wrong ferry. All the way back to the Bog. (148) | ferry | Bog 15 |
| 79 | Wrong snake. This one goes all the way back. (158) | snake-down | 24 (Countryside) |
| 91 | Fell asleep on the train. Woke up at the river. (183) | sleeping-face | 48 (River & Lake) |
| 94 | Missed your stop. Back to the seaside. (188) | train-back | 78 (Seaside) |
| 96 | Forgot your keys! Back to Central Station. (193) | key | 92 (Central Station) |
| 99 | Forgot your keys AGAIN!!! Back to Central Station, wait two turns. (198) | two-keys | 92 (Central Station) |
| 100 | Snake Leader? The snake wants its ride back. Down you go. (202) | snake-down | 82 (Snake Leader only) |

### Rule elements and landmarks

| Element | Short board | Text and icon |
|---|---|---|
| Title | **The Quick Trip** (GCD §10) | destination: Festival of Lights |
| Start / END | Home / Festival of Lights (101) | reused |
| The Bog | square **15** (long 30) | reused |
| Porch steps / Stepping stones | stones from **15 towards 16** (long 30 → 31) | texts reused; only the square numbers in the picture note change |
| Lanterns, Fallen tree, Bonus card, Bog boots, Snake Leader badge | – | reused |
| Crossroads 1 | **41**, roads meet at **48** | "Crossroads. Main Road, or the Shortcut?" reused |
| Shortcut 1 jackpot | Shortcut square **1** → 50 (long square 2 → 100) | "Rope swing over the river. Worth it!" reused |
| Shortcut 1 fall | Shortcut square **2** → Bog (long square 5) | "Shortcuts never work. Into the Bog." reused |
| Crossroads 2 | **80**, roads meet at **90** | "City crossroads. Main Road, or the Shortcut?" reused |
| Shortcut 2 jackpot | Shortcut square **1** → 92 (long square 3 → 185) | "Through the park. Wait, it actually worked!" reused |
| Shortcut 2 fall | Shortcut square **3** → Bog (long square 7) | "Lost in the alleys. Somehow, the Bog." reused |
| Main Road, roads meet | – | reused |
| Landmarks kept | **Base Camp 55, Mountain Lodge 67, Central Station 92** | names and icons reused |
| Landmarks dropped | Forest Station, Hill Station, River Pier, Harbour, The Fair | no short-board square leads there |

**One thing to know:** the Forest (25–40) keeps no square that names the forest. Its forest-themed squares were the fog and the trains, and they were dropped in I-5.1. Its four squares (Bonus card, the local's shortcut, the swap, the cable car) fit anywhere on the trip, so the forest is carried by the drawing on the board. I recommend no change.

**Question to the owner (I-5.3):** reuse all texts and icons as listed, with no new text?

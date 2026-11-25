# Don't Get Mad! — Game Concept Document (GCD) v3 — rules decided and measured

> **Status: v3, rules decided 25 Nov 2026 (owner, Step I), measured in phase A (`docs/analysis/stepI-A_measure.md`, results accepted by the owner).** Game rules R1–R20 are in §8.2a and the computer player in §8.6. Every Step I decision (areas, squares, guide, leaderboard, postcards, destinations, narrative) is in `docs/prompts/StepI_destinations.md`, Part 2; the story (§9), boards (§10) and replay sections (§12) below still describe v2 and are rewritten in the Step I phases that build them. The v2 rules are archived in `docs/archive/GCD_rules_v2.md`.
> *(v2 status, for the record: FROZEN 14 Oct 2026, owner, step I-7.)*
> This document is the contract for coding: anything not written here is not built. Any change after the freeze needs the owner's approval and, for a rule or a board, a new measurement.
> **Legend:** ✅ = decided by the owner · 📊 = measured in code (file named) · 💡 = proposal, waiting for the owner's decision.
> **References:** the paper board transcription is in `docs/archive/GCD_v0-v1_paper_transcription.md`. The paper-board measurements with the real rules are in `docs/analysis/MEASURE_REPORT_v0.md` and `docs/analysis/measure-v0-paper.md` (the older `SIM_REPORT_v0.md` and `sim-v0-paper-engine-results.md` are marked INVALID). The market research is in `docs/analysis/MARKET_REPORT.md`.

---

## 1. Origin

A parent and their daughter drew a board game on paper: 202 numbered squares, ladders, snakes, a Snake Leader, and little stories ("Forgot keys again!!!"). They had so much fun playing it that they decided to share it with everyone as a free game for phone and browser.
**The paper board is the creation.** The digital game keeps its soul (a long, surprising race full of ups and downs and small stories) and makes it fair, measurable and safe for everyone.

## 2. Vision (one sentence)

**A free, beautifully hand-drawn race game where anything can happen until the very last square: equal for everyone at the start, full of surprises during play, and so much fun that you want to play again right away.**

## 3. Hard conditions ✅

| # | Condition |
|---|---|
| C1 | **Cost 0, always.** No ads, no in-app purchases, no accounts, no online play, no chat, no data collected. Works offline. |
| C2 | **For all ages, as inclusive as possible**, while keeping a **family / kids-safe store rating**: no violence, crime, alcohol, gambling references or other risky content. |
| C3 | **Not childish.** It must not look like a learning app (no numbers read aloud). Young adults 18–34 must enjoy it as much as children. |
| C4 | **Platforms:** web browser + Android (Google Play, owner's existing account). |
| C5 | **Scientific basis:** every rule is checked in the simulator before it is frozen. No rule is based on a guess. |

## 4. Audience ✅

- **Core:** families with young children.
- **Strongly wanted:** young adults 18–34, playing with friends, siblings or parents.
- **What brings them together:** in a chance game a child can beat an adult, so everyone sits at the table as an equal. Market evidence: `docs/analysis/MARKET_REPORT.md`. The biggest digital race game, *Ludo King*, reports most of its players are 18–34. That figure comes from the company itself, so it is weak evidence.

## 5. Design pillars

Every rule, tile and screen must serve these. If something fails a pillar, it is cut.

| # | Pillar | What it means |
|---|---|---|
| P1 | **Fair at the start** | Before the first throw, every player has exactly the same chance to win: same rules, same tiles, same probabilities. Turn order must not matter. |
| P2 | **Anything can happen** | Big swings are wanted: jackpots that fly you forward, falls that send you back, overtakes near the end. Nobody is safe and nobody is lost. |
| P3 | **Never bored** | Nobody waits many turns doing nothing. Every turn has something to watch or hope for. |
| P4 | **One journey** | The whole board is one continuous, neutral story, a trip where each square is the next moment of the same adventure. |
| P5 | **"One more game!"** | The end of a game makes you want to start another one. |
| P6 | **Hand-made soul** | It looks and feels like the original paper board: paper texture, purple ink, crayon colours, button tokens. |

## 6. Player experience: what a game should feel like

✅ The intended emotional curve of one game, which the rules must produce and the simulator must check:

1. **Start:** a quick, easy start, with everyone moving straight away (P3).
2. **Early game:** small events; players learn the board and the story.
3. **Middle:** the first big jackpots and falls, with leaders changing (P2).
4. **Late game:** the biggest drama. Someone close to the finish can still fall, and someone behind can still fly forward (P2, P5).
5. **Finish:** a close, exciting end more often than an easy walk-over.
6. **After the game:** "Rematch!", one tap to play again (P5).

## 7. The two stages of the game ✅

| Stage | Content | When |
|---|---|---|
| **Stage 1: the Chance Game** | Dice, board and events only. Pure probability, frozen first. | Now |
| **Stage 2: the Logic Layer** | Decisions that add thinking on top of the chance game. | Designed only after Stage 1 is frozen |

### 7.1 Rules any Logic Layer must respect ✅ (from the owner's feedback)
- A decision must **never** let a player escape the dice's risks for free, or move faster for free. Example of what is **forbidden**: "throw 2 dice and pick one". It lets a player advance faster *and* dodge setbacks.
- Every decision must have a **price or a risk** (e.g. gain now, lose later).
- Every decision must be **measured in the simulator**, so a smart choice helps a little but never guarantees a win, and Stage 1's fairness stays intact.

## 8. Stage 1: the Chance Game

### 8.1 Components ✅ (from the paper game)
- 1 die (1–6), 2–4 players, 1 token each. The tokens are buttons, each with its own shape and colour.

### 8.2 Core loop ✅
Throw the die → move forward square by square → if you land on an event square, the event happens → next player. The first to reach **END** wins.
**No chaining** ✅ (owner, Q4): arriving on a square because of an event does not trigger that square's event, unless the event says so.

### 8.2a Game rules v3 ✅ (owner, 25 Nov 2026, Step I)

Decided in the Step I planning session (`docs/prompts/StepI_destinations.md`, Part 2); **Measured in phase A** (`docs/analysis/stepI-A_measure.md`): seats fair, every excitement target met except jackpots (4.6 per game, paper 6.7: accepted by the owner), 2.1% of players wait 10+ turns. Simulator `tools/sim/engine3.mjs`; the app engine `src/engine/v3/` plays the same games (`test/v3-equivalence.test.ts`). The v2 rules (R1–R21 of 14–22 Oct 2026) are archived in `docs/archive/GCD_rules_v2.md`. Square numbers are on the 100-square board (END = 101).

| # | Rule |
|---|---|
| R1 | **Home.** Every player starts **at Home** with **1 Bonus card**. To leave Home you need a **6**: one roll per turn, no limit. Instead of the 6 you may use a Bonus card. The 6 or the card only frees you; then you roll again and move by that roll. |
| R2 | **Sixes.** Every 6 gives one more roll, **with no limit**. The rolls add up and the token moves **once** by the total (6, 6, 2 → 14). The 6 that frees you from Home or the fallen tree does not move you and does not count in a run of sixes. |
| R3 | **Passing over.** Squares passed have no effect; only the square where you stop counts. |
| R4 | **Bump.** Landing on a square where another player stands, by a roll or a jump, sends that player **Home**. Home and the finish can hold several players. Swaps exchange places and bump nobody. |
| R5 | **Back Home.** A bumped player leaves Home on their next turn **without** needing a 6. |
| R6 | **Fallen tree** (square 27, Forest). Landing on it by a roll: you are stuck. Each turn, roll for a 6 or use a Bonus card; the 6 or the card frees you, then you roll again to move. A stuck player can be bumped. If your Forest backward move is pending, it happens on your next turn and frees you. |
| R7 | **Finish.** You need the **exact** number; a total that is too big leaves you where you are. A 6 can never finish (it always rolls again). |
| R8 | **Event moves.** A fixed jump moves **at most 20 squares** and never onto another event square. Exceptions: the Dragon Boat (69), Plot Twist (37) and "next good square" (32). Moves made with dice have no limit and trigger the square they end on, except the Forest's backward move. Swaps never trigger a square. **No chaining:** a square reached by an event does not act, unless its rule says so (32). |
| R9 | **Special squares.** Move exactly 1 square next turn (7) · roll 3 times and move by the total (61) · every other player's next roll counts double (72) · miss 2 turns (99, after its jump). |
| R10 | **Plot Twist** (37). Swap places with the leader. If nobody is ahead, nothing happens. |
| R11 | **Next good square** (32). Move forward to the next reward square, and it applies to you. |
| R12 | **Players.** 2–4 players; any seat can be a person or a robot. |
| R13 | **Content.** All ages, family rating: no violence, crime, alcohol or gambling. |
| R14 | **Bonus card.** Uses: (a) leave Home without a 6; (b) get free from the fallen tree; (c) cancel one of your own punishments (red squares, square 72, the bad area effects). It **never** works against a bump, Plot Twist, the area swaps, the Swap Market or the Dragon Boat, and it cannot cancel another player's reward. More cards: squares 30, 45 and 85, the Seaside effect, the Swap Market. |
| R15 | **Areas.** Home Town Home–9 · Countryside 10–22 · Forest 23–38 · Mountains 39–56 · Seaside 57–76 · Big City 77–100. |
| R16 | **Area effects.** The **first time** each player enters an area **by a plain roll** (never by someone else's swap), its effect happens. Home Town has none. **Entering an area through an event (a green or red square's move, or another area's effect) gives no area effect** at that moment (owner, 25 Nov 2026: an event never lands on another event); the area is not used up, so the player's first later entry by a plain roll still gives it. Example: arriving at 97 by the Dragon Boat gives no Big City effect. **Countryside:** a gifted 6: roll again at once and move by 6 + the roll (a 6 keeps rolling). **Forest:** your next move goes **backward** by your roll (6s keep rolling, everything goes back, never past Home); no square event where you land, but a bump happens. **Mountains:** your next roll counts double (the whole total). **Seaside:** swap with the player just in front if within 20 squares; otherwise, or if you are leading, a Bonus card. **Big City:** swap with the player just behind if within 10 squares; otherwise, or if you are last, lose your next turn. |
| R17 | **The Dragon Boat** (69). Forward to 97. On your next **played** turn the die must show **exactly 4**: you win. Anything else (a 6 too, with no extra roll) takes you back to 69, bumping anyone there. A doubled roll is ignored; the Bonus card cannot help. If you are bumped on 97 the deal ends; a player who swaps onto 97 does not take over the deal. |
| R18 | **The Swap Market** (79, blue ◆). If you hold a Bonus card, you give one to another player; if you hold none, you take one from a player who has one. With 3–4 players you choose; with 2 it is automatic. If no card can move, nothing happens. |
| R19 | **Who decides what.** A person chooses: using the card at Home and at the tree (asked every turn while they hold one), on a punishment, and the partner at the Swap Market. Everything else is the dice. |
| R20 | **The robot** (one level). Rolls for the 6 at Home and at the tree; **on its 3rd throw there without a 6 it must use its Bonus card, if it has one, and moves by that throw** in the same turn, as the v2 third throw did (owner, 25 Nov 2026; people are never forced); otherwise uses its card on the first punishment it meets; at the Swap Market gives to the player furthest behind and takes from the leader among the players holding a card. |

**Removed (owner, 25 Nov 2026):** lanterns (v2 R18), the third throw (v2 R15–R17), the maximum of three 6s, the moving fallen tree (v2 R19), the Bog and the Bog boots (v2 R6), Hospital (v2 R7, long board only), the Snake Leader, cancelling another player's reward, the two robot levels, the 202-square board, crossroads (v2 R20, removed 15 Oct 2026).

### 8.3 Event families
All events belong to a few families. The exact squares, sizes and amounts were decided with the simulator (steps I-3 to I-6 for the long board, I-5 for the short board) and are in the board files.

| Family | What happens | Paper-board origin | Purpose |
|---|---|---|---|
| **Jackpot** | Big jump forward | Ladders "upstairs", 138 → 195 snake | P2 surprise, joy |
| **Boost** | Small jump forward, or throw again | 20 → 33, "throw one more time" | Steady good moments |
| **Fall** | Big jump back | Snakes, ladders "downstairs" | P2 drama, "Don't get mad!" |
| **Setback** | Small step back, or wait 1 turn | "skip one turn", "forgot keys" | Light tension |
| **Interaction** | Changes another player's fortune (swap with the player ahead, others double their next throw) | 75, 143 | Social fun at the table |
| **Card** | Keep an item and use it later (protects from one setback) | "Free jail pass", "Skip a punishment" | Hope, collecting |
| **Badge** | Special status with a duty | **Snake Leader** (138 → 195; the badge holder must take the 202 snake back to 165) | Family signature, late drama |
| **Landmark** | A named place, no event | Airport, Bank, Hotel, Work, Party | Story anchors |

### 8.4 Heritage that stays ✅
- ✅ Long board of 202 squares + END (203); short board of 100 + END (101).
- ✅ Snake Leader: landing on 138 → slide to 195 and get the badge; only the badge holder landing on 202 follows the snake back to 165. Its exact numbers will be confirmed by measurement (§11), not by signature.
- ✅ "Forgot keys!" and "Forgot keys AGAIN!!!" near the end, swap with the player ahead, and others doubling their throw, all re-told inside the journey (I-4, both boards).
- ✅ An event square about every 5 squares, as on paper (long: 41 on 202; short: 23 on 100).

### 8.5 Measurements of the paper game with the real rules (before I-6)
See `docs/analysis/MEASURE_REPORT_v0.md` (14 Oct 2026). Seats are fair. Excitement is high (captures, late overtakes). Boredom fails the target (21% of players wait 10+ turns, mostly waiting to enter and in the trap). Small options are measured there and wait for the owner's decision.

### 8.6 Computer players ✅ (owner, 25 Nov 2026, Step I)
- Any seat can be a computer player. There is **one level** (the Easy/Normal choice is removed): rule R20 in §8.2a.
- Measured in phase A against a simple player that exists only in the simulator (uses its card at the first chance): the robot wins 25.4% among 3 simple players, the simple player 24.7% among 3 robots (fair 25%). The card choice counts little; accepted by the owner (25 Nov 2026). The v2 robots (Easy, Normal with lanterns) are archived in `docs/archive/GCD_rules_v2.md`.

## 9. Story: "The Journey" (P4)

> **Step I (owner, 25 Nov 2026):** the whole narrative is rewritten in phase B (voice first, then area by area; a guide figure on the right, short facts on the left). Areas from now on: §8.2a R15. See `docs/prompts/StepI_destinations.md`.

### 9.1 Principle ✅
The board is **one continuous neutral journey**. Each square is the next moment of the same trip, not a collection of unrelated events. Every event is a travel moment: transport, weather, forgetting things, friendly help, shortcuts, getting lost.

### 9.2 The Grand Journey ✅ (owner, step I-4, 14 Oct 2026)
- **Destination:** the **Festival of Lights** (END). Every player travels from Home to the festival, carrying lanterns.
- **Voice:** grown-up (owner's choice: "an 18–34 story can appeal to kids, but not the other way round"). Dry humour from moments every adult has lived (missed trains, "did I lock the door?"), still simple enough for a 6-year-old and within C2. At most one short sentence per square, plus an icon.
- **Regions in order:** Home Town (Start–19) → Countryside (20–49) → Forest (50–81) → River & Lake (82–107) → Mountains (108–137) → Seaside (138–159) → Big City (160–189) → Festival Road (190–202).
- **Names:** trap (paper "prison") = **The Bog**; waiting stairs (R17) = **porch steps** at Start and **stepping stones** in the Bog; lifelines (R18) = **Lanterns**; roadblock (R19) = **Fallen tree**; two roads (R20) = **Main Road** (safe) and **the Shortcut** (wild); free pass (90) = **Bog boots**; the **Bonus card** and the **Snake Leader** keep their names.
- **Landmarks:** Forest Station 55 and Hill Station 71 (paper Airport), River Pier 86 and Harbour 102 (Bank), Base Camp 109 and Mountain Lodge 135 (Hotel), The Fair 179 (Party), Central Station 184 (Work).
- **The texts**, square by square, are in `data/board-long.json` (`story` and `icon` per square, and the `story` block for the rule elements). The paper's own words stay in `text`. Every rule field is identical to `data/board-v0-paper.json`, and the measurement is unchanged (`docs/analysis/measure-long.md` = `docs/analysis/measure-frozen.md`). Working log with every version and decision: `docs/analysis/I-4_story_log.md`.

## 10. Boards ✅

> **Step I (owner, 25 Nov 2026):** the long 202-square board is removed; only the 100-square board stays, redesigned in phase B, and 4 more 100-square **Destinations** follow in phase D. See `docs/prompts/StepI_destinations.md`.

| Board | Size | Role |
|---|---|---|
| **Long, "The Grand Journey"** | Start + 202 + END | **The base**, the original creation. Designed and tuned first. |
| **Short, "The Quick Trip"** | Start + 100 + END | Built **from the best-working events of the long board**: thinned out, not compressed. It must pass the same measurements. |

### 10.1 The short board ✅ (owner, step I-5, 14 Oct 2026)
- **File:** `data/board-short.json` (same fields as `data/board-long.json`: `story` and `icon` per square, and the `story` block).
- **Events:** 23 of the long board's 41 (chosen by the ablation `docs/analysis/ablation-long.md`; all signature events kept). Each sits at about half its long-board square and jumps to about half its long-board destination, so it stays in the same region and goes to the same story place: 7 puddle · 10 → 16 lift · **15 the Bog** · 17 → 33 hay cart · 20 → 51 balloon · 30 Bonus card · 32 next good square · 37 swap with the leader · 40 → 67 cable car · 45 Bog boots · 49 → Bog · 54 → 67 weekend off · 61 throw 3 times · 66 → 55 booking · 69 → 97 Snake Leader · 72 others double · 74 → Bog · 79 → 24 · 91 → 48 · 94 → 78 · 96 → 92 forgot keys · 99 → 92 keys AGAIN + wait 2 · 100 → 82 Snake Leader only.
- **Rules:** R1–R21 unchanged. Only these numbers follow the shorter board: **crossroads 41** (roads meet at 48; Shortcut 6 squares, square 1 → 50, square 2 → the Bog) and **crossroads 80** (roads meet at 90; Shortcut 9 squares, square 1 → 92, square 3 → the Bog); the trap is square 15 (stepping stones 15 → 16). The fallen tree stays at 10 squares back, within 10 squares of the leader.
- **Story:** the same journey and voice; every text and icon is reused from the long board. Regions: Home Town Start–9 · Countryside 10–24 · Forest 25–40 · River & Lake 41–53 · Mountains 54–68 · Seaside 69–79 · Big City 80–94 · Festival Road 95–100. Landmarks: Base Camp 55, Mountain Lodge 67, Central Station 92.
- **Measured** 📊 (`docs/analysis/measure-short.md`, 100,000 games): seats 24.83–25.18%; every excitement measure better than the paper board (lead changes 6.8 vs 6.7, late overtakes 2.67 vs 1.76, close finishes 17.8% vs 10.3%, jackpots 7.53 vs 6.68, falls 5.8 vs 4.48); 0.7% of players wait 10+ turns; always-Shortcut player wins 25.45% (`tools/sim/shortcut.mjs`). About 31 rounds per game (long: 52). Working log: `docs/analysis/I-5_short_board_log.md`.

Game duration is **not** a target ✅. It comes from luck, and the simulator only reports its spread.

## 11. Scientific basis: how the game is measured

### 11.1 The three groups of measures ✅ (agreed principle) / 📊 (engine)

| Group | Question | Measures | Status in code (`tools/sim/engine.mjs`) |
|---|---|---|---|
| **A. Fairness** (before the game) | Does every player start with the same chance? | Win % by seat (turn order), with 95% confidence interval | 📊 exists |
| **B. Excitement** (during the game) | Is it full of swings and surprises until the end? | Lead changes per game; win % of the player leading at halfway (lower = more open); win % of the player last at halfway (higher = more hope); **late overtakes**; **close finishes**; **jackpots and falls per game**; % of games where someone hits a jackpot | 📊 all exist (step I-2) |
| **C. Boredom** | Does anyone wait too long? | Turns lost per player; % of players with 10+ turns without moving; longest no-move run | 📊 exists |

### 11.2 How a single event is judged
For every event square, the simulator reports:
- **Landing chance:** % of players who land on it in a game (📊 exists).
- **Win % if landed vs not landed** (📊 exists).
- **Effect on the game:** how much it raises the excitement measures (group B) and the boredom measures (group C) when it is present compared with removed (📊 `tools/sim/ablate.mjs`, with a noise row).

**Key principle ✅ (from the owner's feedback):** a big event is **not unfair**, because every player has the same chance to land on it. Fairness is judged only by group A. A big event is judged by whether it adds excitement (B) without adding boredom (C).

### 11.3 Targets ✅ (owner, I-1 §16 item 5)
| Group | Target |
|---|---|
| A | Every seat within ±1 point of a fair share (25% with 4 players), at 100,000 games |
| B | At least as good as the paper board on every excitement measure, within the measurement margin (owner, I-7; paper values with the real rules in `docs/analysis/measure-v0-paper.md`) |
| C | Fewer than 5% of players with 10+ turns without moving (paper with the real rules: 21%) |

## 12. "One more game" — replay pull (P5) ✅ (owner, I-1 §16 item 6: all)

> **Step I (owner, 25 Nov 2026):** a device-only leaderboard of human win times and new postcards (one set per destination) are added; see `docs/prompts/StepI_destinations.md`.

No accounts and no data leave the device (C1). Everything below lives on the device only.

| Idea | Why it pulls players back | Cost / risk |
|---|---|---|
| **Rematch button** on the win screen | Zero effort to play again | None |
| **Jackpot and fall moments celebrated** (animation, sound) | Big moments get remembered and retold | None |
| **Journey postcards:** one postcard per region or special event, collected over many games ("Snake Leader", "Forgot keys AGAIN!!!") | A collection you want to complete; it rewards playing again, not winning | Stored only on the device |
| **Near-miss visible:** the board shows the jackpot you just missed by one square | "So close! Next time…" | None |
| **Short board** for a quick game | Easy to say "just one more" | None |

## 13. Ideation steps before freezing (each one stops for the owner's approval)

| # | Step | Output |
|---|---|---|
| I-1 ✅ | **Approve this GCD v2**: vision, pillars, stages, event families, measurement principle, proposals (💡) | Owner decisions written into this file |
| I-2 ✅ | **Engine upgrade**: add the missing measures (late overtakes, close finishes, jackpots and falls per game, with-vs-without event runs) | `tools/sim/engine.mjs` + test that the paper board still gives the same numbers |
| I-3 ✅ | **Long board, Chance Game** (done as: the paper squares kept + rules R17–R20, measured in I-6): place and size the events, start rule, end rule and waiting rules, tuned to the targets in §11.3 | `data/board-long.json` + measurement report |
| I-4 ✅ | **Journey story** written over the tuned long board, square by square | Texts in `data/board-long.json` |
| I-5 ✅ | **Short board** built from the best long-board events | `data/board-short.json` + measurement report |
| I-6 ✅ | **Logic Layer** designed under the rules in §7.1 and measured (14 Oct: rules R17–R21 frozen) | §8.2b + `docs/analysis/I-6_*` |
| I-7 ✅ | **Freeze**: owner approval; GCD marked FROZEN (14 Oct 2026) | Coding starts (`docs/PROJECT_PLAN.md` Step 2) |

## 14. Presentation (from the original brief) ✅
- Hand-drawn paper look: off-white textured paper, purple-ink tiles, crayon-coloured event squares, colourful button tokens.
- Tokens move **square by square** (no teleporting); jumps follow their ladder or snake drawing; the camera follows smoothly, with pan and zoom.
- Card inventory visible for each player.
- Inclusive: every event has a colour **and** an icon; big buttons; one-tap play; high contrast; reduced motion; no timers. **No read-aloud** (owner, I-7; C3).

## 15. Technology ✅ (all free)
TypeScript + Vite, HTML Canvas, PWA on GitHub Pages; Android: the web game inside a WebView on Google Play, built like the owner's KAJ app (owner, 16 Oct 2026: no Capacitor; plan: `docs/prompts/Step8_android_app.md`). The rules engine reads the frozen board files (`data/board-long.json`, `data/board-short.json`) and is covered by tests that reproduce the simulator's numbers.

## 16. Owner decisions on I-1 (14 Oct 2026)

| # | Topic | Decision |
|---|---|---|
| 1 | Vision & pillars (§2, §5) | ✅ Agreed |
| 2 | Emotional curve (§6) | ✅ Agreed |
| 3 | Event families (§8.3) | ✅ Agreed |
| 4 | Story (§9.2) | ✅ **Approved in step I-4 (14 Oct 2026)** after seeing it square by square: the Grand Journey to the Festival of Lights, grown-up voice (version B), with the new names in §9.2. |
| 5 | Measurement targets (§11.3) | ✅ Agreed |
| 6 | Replay pull ideas (§12) | ✅ Agreed (all) |

### Owner decisions on I-7 (14 Oct 2026)

| # | Topic | Decision |
|---|---|---|
| 1 | Target B (§11.3) | ✅ "At least as good as the paper board, within the measurement margin" (the long board's close finishes, 10.2% vs 10.3%, are a tie at ±0.19) |
| 2 | Computer players | ✅ Added as the measured simple player (§8.6) |
| 3 | Read-aloud | ✅ Dropped (C3, §14) |
| 4 | Freeze | ✅ GCD FROZEN |

### Original questions (I-1)
1. Vision and pillars (§2, §5): agree, or change?
2. Emotional curve (§6): is this the experience you want?
3. Event families (§8.3): anything missing or unwanted?
4. Story proposal (§9.2): the journey Home → Festival through regions, or another destination or theme?
5. Measurement targets (§11.3): agree?
6. Replay pull ideas (§12): which ones?

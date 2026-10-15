# Don't Get Mad! — Game Concept Document (GCD) v2 — FROZEN

> **Status: FROZEN (v2, 14 Oct 2026, owner, step I-7).** Game rules R1–R21 (§8.2a, §8.2b), the story (§9), both boards (§10) and the computer players (§8.6) are final.
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

| R14 | **Bonus card** (photos 5 and 21 are the same card): received on the "skip a punishment" square. Used **once, whenever you like**: either avoid one of your own punishments, or cancel a reward of another player of your choice. |
| R15 | The 6 used to enter or to leave the trap counts as a 6 (first of the three) but gives no points. |

| R16 | ~~Enter with a 6, or automatically after 3 failed tries; trap: out with a 6, or automatically after 3 failed tries.~~ **Replaced by R17** (owner, step I-6). |

Bonus card square confirmed: **60**. Bonus card use: **avoid your own next punishment** (the paper's "defend" use; this is how it is measured).

### 8.2b Rules added in step I-6 ✅ (owner, 14 Oct 2026)

| # | Rule |
|---|---|
| R17 | **Third throw** (changed by the owner, 15 Oct 2026, after the real-life test): at Home or in the trap, a 6 frees you and **only lets you in** (it moves nobody, R15); you throw again and move by that throw: 6, 2 → square 2, always. **On the 3rd throw without a 6 you move anyway** by that throw, and a lantern goes out (R18). There are **no stair steps** any more, so two players never share a square: square 1 is a square like any other (R4). **Spend a lantern** (owner, 15 Oct 2026): waiting at Home or in the trap with at least 1 lantern, the player may instead **spend a lantern to leave at once**, before throwing; then they throw and move as on any turn (a 6 throws again). Never offered with 0 lanterns. Measured: `docs/analysis/measure-choices.md` (at most about 2 rounds shorter when everyone spends at every chance; one player who spends whenever they can wins at most 1.7 points above the fair share). |
| R18 | **Lifelines.** Every player starts with **3**. You **lose 1** each time you make 3 throws without a 6 at Start or in the trap (R17): "You did not get a 6 in three throws, so you lose a lifeline." You **win 1 only by throwing three 6s in a row** in one turn (the 6 that enters or leaves the trap counts as the first). No upper limit. Captures and punishment squares never touch lifelines. When you lose your 3rd lifeline you play on: "**Attention! You have no lifelines left…**". The next loss (the 4th) = **out**. With 3–4 players the game goes on without that player; the last player left wins. A lantern spent to leave Home or the trap (R17) counts as a lost lantern. |
| R19 | **Roadblock** (a game event, nobody decides). At the start of each round, if no roadblock is on the board, the game puts one on a random free plain square 1–10 squares in front of the leader (not an event square, not occupied, not a crossroads). The first player to land on it, by a throw or any jump, goes **back 10 squares** (no chaining; capture applies). It is then removed and placed again at the start of the next round (if the leader is on a wild road, it waits until the leader is back on the main road). Passing over it does nothing (R3). |
| R20 | ~~Two roads (Main Road and the Shortcut).~~ **Removed by the owner, 15 Oct 2026:** there are no crossroads and no Shortcut on either board; a throw is always counted in full. |
| R21 | **Who decides what.** The only player choice is the **bonus card** (R14). (Until 15 Oct 2026 nothing a player chose could cost or win a lifeline.) (The road choice went with R20, owner 15 Oct 2026.) Added by the owner (15 Oct 2026): **spending a lantern** to leave Home or the trap (R17), and **wearing the Bog boots** when the trap would catch you (asked, no longer automatic). The computer player never spends a lantern and always wears the boots, so every measured number for it holds. |

**Owner, 15 Oct 2026: a second Bonus card square** (long 155, short 85; same card as R14), chosen from the five calculations in `docs/analysis/audit-2026-10-15.md` §4: fewer falls, more close finishes, shorter games, still fair (seats 24.7–25.6%). The order of good and bad squares stays (spreading them evenly measured worse).

**Owner, 15 Oct 2026 (real-life test):** R2, R17 and R20 changed as written above; the computer players are unchanged (they never had a choice left but the Bonus card). Measured, 40,000 games per board: every seat wins 24.7–25.2% (±0.42); long 52.1 rounds, short 30.1. Report: `docs/analysis/audit-2026-10-15.md`.

**Status (14 Oct 2026): rules R1–R21 are FROZEN (owner).** Boards: the long board `data/board-long.json` (the paper squares; its `rules` are identical to `data/board-v0-paper.json`) and the short board `data/board-short.json` (§10.1). **Square numbers in R6–R11 and R20 are long-board squares;** the short board's own squares (trap 15, crossroads 41 and 80, …) are in §10.1 and in its file. Measurements of the frozen game: `docs/analysis/measure-frozen.md`, `docs/analysis/lifelines-final.md`, `docs/analysis/lifelines-compare.md` (version A = R18), `docs/analysis/sixes-and-captures.md`.

**Logic Layer result (honest):** the thinking target (a thoughtful player wins 27–32% against 3 simple players) is **not met**. With the bonus card and the road choice, a thoughtful player wins **25.2–25.5%** (`docs/analysis/I-6_measurements.md`). Ideas that met it (spending lifelines) were rejected because lifelines are too scarce to risk (owner rule: no logic choice may put a lifeline at risk, and luck squares and lifelines are never mixed). The game is a chance game with two small choices. History of every proposal and decision: `docs/analysis/I-6_owner_decisions.md`.

**All measurements made before 14 Oct evening ignored R1–R6 and are invalid** (`docs/analysis/*` v0 reports, the old ablations). They were redone with the corrected engine: `measure-v0-paper.md`, `measure-frozen.md`, `measure-long.md`, `measure-short.md`, `ablation-long.md`.

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

### 8.6 Computer players ✅ (owner, step I-7)
- Any seat can be a computer player. It plays as the **simple player** the simulator measured (`types: "simple"` in `tools/sim/engine.mjs`), so every fairness and excitement number in this document holds for it:
  - (there are no crossroads any more: R20 was removed, owner 15 Oct 2026);
  - it uses its **Bonus card** on its own next punishment (R14, the "defend" use);
  - Bog boots: always worn (a person is asked, owner 15 Oct). Never spends a lantern to leave Home or the Bog.
- It has no other choice to make: everything else is the dice (R21).

## 9. Story: "The Journey" (P4)

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
TypeScript + Vite, HTML Canvas, PWA on GitHub Pages, Android via Capacitor on Google Play. The rules engine reads the frozen board files (`data/board-long.json`, `data/board-short.json`) and is covered by tests that reproduce the simulator's numbers.

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

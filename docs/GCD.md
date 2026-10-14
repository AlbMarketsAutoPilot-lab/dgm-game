# Don't Get Mad! — Game Concept Document (GCD) v2

> **Status:** v2 — I-1 approved except the story (§16). **Not frozen.**
> When frozen, this document is the contract for coding: anything not written here is not built.
> **Legend:** ✅ = decided by the owner · 📊 = measured in code (file named) · 💡 = proposal, waiting for the owner's decision.
> **References:** the paper board transcription is in `docs/archive/GCD_v0-v1_paper_transcription.md`. The paper-board measurements are in `docs/analysis/SIM_REPORT_v0.md` and `docs/analysis/sim-v0-paper-engine-results.md`. The market research is in `docs/analysis/MARKET_REPORT.md`.

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

💡 The intended emotional curve of one game, which the rules must produce and the simulator must check:

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
| R2 | **Sixes:** every 6 gives an extra throw. The throws add up and the token moves **once** by the total (e.g. 6, 6, 1, 5 → 18). **Maximum three 6s:** on the third 6 the player moves 6 × 3 = 18 and the turn ends. |
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

| R16 | ✅ Owner decision (14 Oct, after measurement): **enter with a 6, or automatically after 3 failed tries**; **trap: out with a 6, or automatically after 3 failed tries**. (`docs/analysis/MEASURE_REPORT_v0.md` §4) |

Bonus card square confirmed: **60**. None of these rules is final until the luck rules are frozen.

**All measurements made before 14 Oct evening ignored R1–R6 and are invalid** (`docs/analysis/*` v0 reports, ablation). They will be redone with the corrected engine.

### 8.3 Event families
All events belong to a few families. The exact squares, sizes and amounts are decided in the tuning step (§13), with the simulator.

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

### 8.4 Heritage that stays ✅ / 💡
- ✅ Long board of 202 squares + END (203); short board of 100 + END (101).
- ✅ Snake Leader: landing on 138 → slide to 195 and get the badge; only the badge holder landing on 202 follows the snake back to 165. Its exact numbers will be confirmed by measurement (§11), not by signature.
- 💡 "Forgot keys!" and "Forgot keys AGAIN!!!" near the end, swap with the player ahead, and others doubling their throw, all re-told inside the journey.
- 💡 An event square about every 5 squares, as on paper.

### 8.5 Measurements of the paper game with the real rules
See `docs/analysis/MEASURE_REPORT_v0.md` (14 Oct 2026). Seats are fair. Excitement is high (captures, late overtakes). Boredom fails the target (21% of players wait 10+ turns, mostly waiting to enter and in the trap). Small options are measured there and wait for the owner's decision.

## 9. Story: "The Journey" (P4)

### 9.1 Principle ✅
The board is **one continuous neutral journey**. Each square is the next moment of the same trip, not a collection of unrelated events. Every event is a travel moment: transport, weather, forgetting things, friendly help, shortcuts, getting lost.

### 9.2 Proposal 💡
- **From Home to a big celebration at the destination** (e.g. a Festival of Lights).
- The board passes through **regions in order** (e.g. Home Town → Countryside → Forest → River & Lake → Mountains → Seaside → Big City → Festival Road), so the landscape changes as you advance and players feel the progress.
- Paper landmarks become journey landmarks (Airport → Station, Hotel → Mountain Lodge, Party → Fair, Work → Central Station). The prison, police, robbery, stolen car, hospital and lottery are replaced with neutral travel moments.
- Event texts are short and funny, written so a 6-year-old understands them and a 25-year-old smiles.

## 10. Boards ✅

| Board | Size | Role |
|---|---|---|
| **Long, "The Grand Journey"** | Start + 202 + END | **The base**, the original creation. Designed and tuned first. |
| **Short, "The Quick Trip"** | Start + 100 + END | Built **from the best-working events of the long board**: thinned out, not compressed. It must pass the same measurements. |

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

### 11.3 Targets 💡 (proposed, owner to confirm before tuning)
| Group | Target |
|---|---|
| A | Every seat within ±1 point of a fair share (25% with 4 players), at 100,000 games |
| B | Better than the paper board on every excitement measure (paper values in `docs/analysis/sim-v0-paper-engine-results.md`) |
| C | Fewer than 5% of players with 10+ turns without moving (paper: 27–29%) |

## 12. "One more game" — replay pull (P5) 💡

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
| I-1 | **Approve this GCD v2**: vision, pillars, stages, event families, measurement principle, proposals (💡) | Owner decisions written into this file |
| I-2 ✅ | **Engine upgrade**: add the missing measures (late overtakes, close finishes, jackpots and falls per game, with-vs-without event runs) | `tools/sim/engine.mjs` + test that the paper board still gives the same numbers |
| I-3 | **Long board, Chance Game**: place and size the events, start rule, end rule and waiting rules, tuned to the targets in §11.3 | `data/board-long.json` + measurement report |
| I-4 | **Journey story** written over the tuned long board, square by square | Texts in `data/board-long.json` |
| I-5 | **Short board** built from the best long-board events | `data/board-short.json` + measurement report |
| I-6 | **Logic Layer** designed under the rules in §7.1 and measured | Logic Layer section + report |
| I-7 | **Freeze**: owner approval; GCD marked FROZEN | Coding starts |

## 14. Presentation (from the original brief) ✅
- Hand-drawn paper look: off-white textured paper, purple-ink tiles, crayon-coloured event squares, colourful button tokens.
- Tokens move **square by square** (no teleporting); jumps follow their ladder or snake drawing; the camera follows smoothly, with pan and zoom.
- Card inventory visible for each player.
- Inclusive: every event has a colour **and** an icon; big buttons; one-tap play; high contrast; reduced motion; no timers.

## 15. Technology ✅ (all free)
TypeScript + Vite, HTML Canvas, PWA on GitHub Pages, Android via Capacitor on Google Play. The rules engine reads the frozen board files and is covered by tests that reproduce the simulator's numbers.

## 16. Owner decisions on I-1 (14 Oct 2026)

| # | Topic | Decision |
|---|---|---|
| 1 | Vision & pillars (§2, §5) | ✅ Agreed |
| 2 | Emotional curve (§6) | ✅ Agreed |
| 3 | Event families (§8.3) | ✅ Agreed |
| 4 | Story (§9.2) | ⏸ **Not decided.** The owner will judge it only after seeing the full story written square by square, showing how it fits all ages and every event (step I-4). |
| 5 | Measurement targets (§11.3) | ✅ Agreed |
| 6 | Replay pull ideas (§12) | ✅ Agreed (all) |

### Original questions (I-1)
1. Vision and pillars (§2, §5): agree, or change?
2. Emotional curve (§6): is this the experience you want?
3. Event families (§8.3): anything missing or unwanted?
4. Story proposal (§9.2): the journey Home → Festival through regions, or another destination or theme?
5. Measurement targets (§11.3): agree?
6. Replay pull ideas (§12): which ones?

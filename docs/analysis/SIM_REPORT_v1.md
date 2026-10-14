# Simulation Report v1 — "The Great Journey" (rebuilt story + rules)

**Step 1c** · 14 Oct 2026
**Data (source of truth):** [`data/board-v1-long.json`](../../data/board-v1-long.json) · [`data/board-v1-short.json`](../../data/board-v1-short.json)
**Engine:** [`tools/sim/engine.mjs`](../../tools/sim/engine.mjs). Before it was used for v1, it was checked against the paper board: same numbers as the v0 report (median 50 rounds, 11.7 vs 11.8 lost turns).
**Raw results (100,000 games per scenario):** [v0 paper](sim-v0-paper-engine-results.md) · [v1 long](sim-v1-long-engine-results.md) · [v1 short](sim-v1-short-engine-results.md)
Reproduce: `node tools/sim/run-v1.mjs data/board-v1-long.json 100000 out.md`

---

## 1. The story: one journey, not separate events

From **Home** to the **Festival of Lights**, through 8 regions in order. Every tile is a small moment of the same trip:

| Region | Long board | Short board | Typical moments |
|---|---|---|---|
| Home Town | Start–25 | Start–12 | shoelaces, forgot the ticket, early bus |
| Countryside | 26–50 | 13–25 | flat bike tyre, tractor ride, hot-air balloon, rainstorm |
| Forest | 51–75 | 26–37 | forest railway, umbrella, trail marker, shared ride |
| River & Lake | 76–102 | 38–51 | canoe, boat, compass, bridge repairs, reed shortcut |
| Mountains | 103–135 | 52–67 | mountain bus, cable car, muddy slide, goat path, fog, full lodge |
| Seaside | 136–160 | 68–79 | **Great Snake Slide (Snake Leader)**, photo stop, ferry, beach buggy |
| Big City | 161–184 | 80–92 | green lights, City Fair invitation, scooter, wrong tram |
| Festival Road | 185–202 → END | 93–100 → END | last hill, forgot keys (and again!!!), Snake Leader's duty |

**Rating check:** the paper board's prison, police, robbery, stolen car, hospital, lottery and the word "punishment" are all gone. Every tile is a travel moment, such as weather, transport, forgetting things, or a friendly ride.
**Family heritage kept:** the Snake Leader badge and duty, "Forgot keys AGAIN!!!", the swap with the player ahead, the photo stop that doubles the others' next throw (the paper's "others double their throw"), the ladders/snakes (now balloon, slides, snakes), and special tiles about every 5 squares.

## 2. Rules v1 (both boards)

1. 2–4 players, one token each, one die. Tokens can share a tile; nobody is knocked out.
2. **Start:** everyone starts at Home and moves with any roll. There is no "need a 6".
3. A tile's effect applies when you land on it. Arriving somewhere because of a jump does **not** trigger that tile (owner answer Q4), unless the text says "then".
4. **Waiting is limited:**
   - A "move on with 4, 5 or 6" tile gives at most **2 tries**.
   - Skips are at most **2 turns**.
5. **Tailwind:** the traveller who is alone in last place adds **+2 to every throw**.
6. **Cards (you choose when to use them, max 2 in hand):**
   - **Umbrella:** ignore one setback.
   - **Compass:** throw again once.
7. **Choice tiles** (long: reeds shortcut, cable car, last hill; short: the same 3): the player decides.
8. **Snake Leader:** the Great Snake Slide (long 138 / short 68) sends you forward and gives you the badge. Only the badge holder must take the snake back at the last tile (long 202 → 165 / short 100 → 82).
9. **END needs an exact roll.** If the throw is too high, you stay (a Compass card can help).
10. **Thinker mode (optional):** throw 2 dice and choose one.

## 3. Targets and results (4 players)

| Target (set before tuning) | Paper v0 | **v1 long** | **v1 short** | Met? |
|---|---|---|---|---|
| Every seat wins 25% ±1 | 25.2 / 25.2 / 24.9 / 24.8 | 25.0 / 24.8 / 24.9 / 25.3 | 25.2 / 24.9 / 24.8 / 25.1 | ✅ |
| Fewer than 5% of players wait 10+ turns in a row | 26.8% | **0.3%** | **0.1%** | ✅ |
| Turns lost per player (as low as possible) | 11.7 | **2.3** | **2.1** | ✅ |
| Boosts ≈ setbacks hit (ratio 0.9–1.1) | 4.31 / 3.79 | 4.69 / 4.93 (0.95) | 4.51 / 4.49 (1.00) | ✅ |
| Comebacks: leader at halfway wins ≤ 40% | 33.6% | **31.8%** | **31.1%** | ✅ |
| Comebacks: last at halfway wins ≥ 15% | 16.9% | **21.6%** | **21.7%** | ✅ |
| No single tile decides: impact within ±12 points | 10 tiles outside (up to ±27) | 1 outside: Snake Leader's duty (−17) | 1 outside: Snake Leader's duty (−13) | ✅ except the deliberate heritage tile |
| Family mode: being thoughtful helps only a little (25–30%) | 25.2% | 26.7% | 25.7% | ✅ |
| Thinker mode: thinking clearly matters | – | 74% | 64% | ✅ (a skill mode) |

**Resulting game length (reported, not targeted):** long board median **47 rounds** (10% of games ≥ 53); short board median **23 rounds** (≥ 28). The paper board's games varied much more: median 50, but 1 game in 10 lasted 78+ rounds.

## 4. What changed and why (each change backed by data)

| Change | Evidence |
|---|---|
| Removed "need a 6" at Start | Keeping it costs **+6.3 lost turns per player**, and 20.8% of players would wait 10+ turns (long board, "start needs a 6" row) |
| Prison / Hospital → "4–6, max 2 tries" / skip at most 2 | Lost turns 11.7 → 2.3; 10-turn waits 26.8% → 0.3% |
| **Tailwind +2 for last place** | Without it: leader at halfway wins 40%, last wins 14.3%, and seat 1 has an edge. With it: 31.8% / 21.6%, and the seats are even |
| **Exact END** | More comebacks than "any roll reaches END" (31.8% vs 35.5% leader win), for only +0.9 lost turns |
| Late setbacks made small; big jumps moved early or shortened | On the paper board a late setback was decisive (183: −26, 198: −25, 188: −21 points), while early ones barely mattered (113: −4) |
| Great Snake Slide 138 → 152 (was → 195) | At → 195 the slide was **+48 points**, which almost wins the game. At → 152 it is within the target |
| Two waiting tiles turned into boosts (25, 153) | Backward jumps make players pass setbacks twice, so setbacks were hit more often (5.4 vs 4.3). The ratio is now 0.95 |
| Choices and cards are used by choice | Thinker mode shows that choices *can* matter. Family mode stays luck-based, so children can beat adults |

## 5. Decisions for the owner

1. **Snake Leader's duty (202 → 165)** is the only tile outside the ±12 target (−17, and only for the badge holder, 5.7% of players). Keep it as the family's signature, or soften it (for example → 185)?
2. **Short board density:** it has 45 special tiles on 100 squares (about every 2nd square), compared with every 4th on the long board. The balance numbers are fine, but it is busier. Keep it, or thin it out?
3. **Great Snake Slide destination** changed from 195 to 152 (the balance reason is in §4). OK?
4. **Thinker mode:** only offer it when **all** players choose it (a thoughtful player beats casual ones 74% of the time)?

## 6. Limits
- The simulated "thoughtful" player follows simple rules (it values a lost turn at 3.5 squares). Real players may do better or worse.
- The tile impact compares players the die put *on* a tile with players it made just miss it. This is a fair natural experiment, but late tiles are measured on fewer players.

# Prompt for step I-6 — Logic Layer + proposals for luck rules

> Paste into a **new Claude Code session, High effort**:
> **"Do step I-6 using docs/prompts/I-6_logic_and_luck_proposals.md"**

---

## Your role and the working rules (read first, they are strict)

You are the game designer and simulation engineer of *Don't Get Mad!*.
1. **Read before acting:**
   - `docs/GCD.md`: vision, pillars, §7.1 Logic Layer rules, §8.2a core rules R1–R16, §11 measurement.
   - `docs/analysis/MEASURE_REPORT_v0.md` and `docs/analysis/measure-v1-agreed.md`: the current numbers.
   - `tools/sim/README.md`, `tools/sim/engine.mjs` and `tools/sim/test/rules.test.mjs`.
2. **Never assume a rule.** If something is not written in the GCD, ask the owner first. Use only data from the repository's code and files.
3. **Work in steps and stop after each one.** Wait for the owner's confirmation before the next step. If the owner asks about a step, explain only that step.
4. **Every rule you add gets:** an engine option in `tools/sim/engine.mjs`, at least one scripted-dice test in `tools/sim/test/rules.test.mjs`, and a measurement with `run.mjs` / `ablate.mjs` / a new comparison script. The baseline (the luck rules as frozen) must keep giving its current numbers when the new option is off.
5. **Nothing is final** until the owner says so. The luck rules are "frozen as baseline, not final".
6. **Simple enough for young children:** at most one new thing to remember per proposal; icons instead of reading; a child must be able to play by always taking the "simple" choice and still have a fair chance.
7. Keep answers short and use plain language. Resources are scarce.

## Measurement targets (approved in GCD §11.3, plus one proposal for the Logic Layer)

| Group | Target |
|---|---|
| A Fairness | Every seat within ±1 point of a fair share |
| B Excitement | At least as good as the baseline (`measure-v1-agreed.md`, scenario A) |
| C Boredom | Fewer than 5% of players with 10+ turns without moving (baseline 1.1%) |
| **Logic (proposed, owner must approve)** | A thoughtful player against 3 simple players wins **27–32%** (fair 25%). Thinking helps a little, but a child who always takes the simple choice keeps a real chance. |

To measure the Logic target, add two player types to the engine:
- **simple:** always takes the default or simple choice;
- **thoughtful:** follows clear, written decision rules.

Rotate the thoughtful player through every seat.

## Proposals to evaluate (the owner's ideas first; each one is measured on its own, then the best ones together)

### Part 1: Proposals for the luck rules (add or replace)

| # | Proposal | Idea source | Why |
|---|---|---|---|
| L1 | **Waiting stairs:** next to Start and next to the trap, a small staircase of 3 steps. Each failed throw climbs one step, and at the top you are released (this is rule R16 made visible). | Owner ("vertical cards… kind of stairs") | Waiting becomes visible progress instead of nothing. It is the same maths as R16, so check that the numbers are identical. |
| L2 | **Release with a price:** released by the stairs (not by a 6)? You lose 1 star (see G2), or, if there are no stars, your next throw is halved. | Owner ("released anyway but lose something") | Keeps the value of throwing a 6. Measure whether it brings back boredom. |
| L3 | **Consolation for the captured:** a captured player gets 1 star. | Proposal | Softens "getting mad" for young children. Measure the effect on the comeback numbers. |
| L4 | **More late drama where the data shows it works:** square 75 "change place with the player closest to END" is the most exciting square (+1.3 lead changes, +0.55 late overtakes). Test turning 1–2 of the weakest squares of the second half into a similar square (candidates from the with-vs-without file: 153, 168, 178). | Data (`ablation-v1-agreed.md`) | More excitement without new rules to learn. |
| L5 | **Weak squares:** 14 squares change the race very little (5, 10, 45, 50, 70, 85, 90, 95, 101, 118, 153, 163, 168, 178). Keep them as story moments **unless** the owner wants some strengthened. Only list options; do not remove anything. | Data | They may be story value, not mistakes. |

### Part 2: Proposals for the Logic Layer (each with a price or a risk, GCD §7.1)

| # | Proposal | Price / risk | Simple choice for kids |
|---|---|---|---|
| G1 | **Bonus card (square 60), already owned:** once, whenever you like, either avoid one of your own punishments **or** cancel a reward of another player of your choice. | Used once; using it now means not having it later | "Use it on my next punishment" |
| G2 | **Stars (one simple currency):** collect a star on some reward squares (and from L3). Spend **3 stars** for one of: (a) throw again once, (b) leave the trap or Start immediately, or (c) protect yourself from one capture. **Max 1 spend per turn, max 5 stars held.** | Stars spent are gone; saving vs spending now | Keep collecting; the game offers "spend?" only when it clearly helps |
| G3 | **Risk square (1–2 squares on the board):** choose "safe: stay" or "risk: throw — 4–6 jump forward X, 1–3 go back Y". | Pure risk; the expected value is set close to zero by the simulator | "Safe" |
| G4 | **Hand limit:** at most 2 cards / items at once | Forces choices | — |

**Forbidden** (GCD §7.1): any choice that lets a player avoid the dice's risk for free or move faster for free, such as choosing between two dice.

## Order of work (stop after each)

1. **I-6.1:** Restate the proposals in a short table, ask the owner which to measure (the owner may add or remove ideas), and confirm the Logic target (27–32%).
2. **I-6.2:** Engine: add the player types (simple / thoughtful) and the chosen options, with tests. The baseline numbers must be unchanged.
3. **I-6.3:** Measure each chosen proposal on its own: fairness, excitement, boredom, and for logic proposals the thoughtful-vs-simple win %. One table, plain-language verdict per proposal.
4. **I-6.4:** Measure the best combination, then propose a final set to the owner.
5. **I-6.5:** Write the approved rules into `docs/GCD.md` (R17+) and `data/board-v0-paper.json` `rules`, still "not final".

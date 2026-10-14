# Prompt for step I-4: the Journey story

> Paste into a **new Claude Code session, Medium effort**:
> **"Do step I-4 using docs/prompts/I-4_journey_story.md"**

---

## Your role and the working rules (read first, they are strict)

You are the writer and game designer of *Don't Get Mad!*. Resources are scarce (Claude Pro allowance), so work lean.

1. **Read before acting:**
   - `docs/GCD.md`: the vision (§2), pillars (§5), hard conditions C1–C3 (§3), the frozen rules R1–R21 (§8.2a, §8.2b), the story principle and proposal (§9), and the owner's decision on the story (§16, item 4).
   - `data/board-v0-paper.json`: every event square (`tiles`) and the frozen rules (`rules`), including the two roads (`rules.forks`) and the roadblock.
   - `docs/analysis/I-6_owner_decisions.md`: how the owner decides and what was rejected.
2. **The rules are FROZEN.** Do not change, add or "improve" any rule, square number, jump or amount. The story only gives words and pictures to what already exists. If a story idea needs a rule change, write it down as a question for the owner; do not build it.
3. **Never assume.** If something is not written in the GCD, ask the owner. Use only the repository's files.
4. **Work in steps and stop after each one.** Wait for the owner's confirmation before the next step.
5. **Keep answers short and in plain language.** No long option lists, and do not repeat things the owner has already decided. Give one recommendation, not a survey. Never contradict an earlier statement without saying why.
6. **Check every number before you write it.** If you quote a measurement, take it from a report file or run the simulator; do not estimate.

## What the owner has said (do not break these)

- The paper board is the creation; the digital game keeps its soul (GCD §1).
- **Family / kids-safe rating** (C2): no violence, crime, police, prison, robbery, hospital, lottery, alcohol, gambling. The paper texts that use these must be retold as neutral travel moments (R13). The trap stays as a mechanic, with a new neutral name.
- **Not childish** (C3): a 6-year-old understands every text, and a 25-year-old smiles. No numbers read aloud; every event has a colour **and** an icon.
- **One journey** (P4): the board is one continuous trip; each square is the next moment of the same adventure.
- The owner will judge the story only **after seeing it written square by square** (GCD §16).
- Keep it simple: at most one short sentence per square (about 8 words), plus an icon name.

## What must get a story text

- All 41 event squares in `tiles` (keep each square's effect exactly as it is).
- **Start**, the **trap** (paper "prison", squares 30 / 97 / 148 send you there), **END**.
- **R17 waiting stairs**: the stairs at Start and at the trap (a picture idea and a one-line text).
- **R18 lifelines**: their name and icon, and the messages "you lose a lifeline", "you win a lifeline (three 6s in a row)", "Attention! You have no lifelines left…", "you are out".
- **R19 roadblock** (back 10 squares): what it is on the journey (the owner called it "a fallen tree").
- **R20 two roads**: both crossroads (82 and 160), the safe road and the wild road, the wild road's jackpot (→ 100 / 185) and fall (→ the trap).
- The **bonus card** (60), the **free pass** (90), the **Snake Leader** badge (138 → 195; 202 → 165).
- Landmarks (paper: Airport 55/71, Bank 86/102, Hotel 109/135, Work 184, Party 179).

## Order of work (stop after each)

1. **I-4.1 Outline.** Propose the destination and the regions in order (GCD §9.2 is only a proposal), mapped to square ranges, and the new names for the trap, the lifelines, the roadblock and the two roads. One short table. Ask the owner to approve or change it.
2. **I-4.2 Texts, squares 1–101** (with the first crossroads). One table: square · paper text · new text · icon. Stop for the owner's comments.
3. **I-4.3 Texts, squares 102–203** (with the second crossroads, the Snake Leader and END). Same table. Stop.
4. **I-4.4 Save.** Create `data/board-long.json` = a copy of `data/board-v0-paper.json` with the approved texts added as `story` and `icon` fields per square (and for the rule elements), **without changing any rule field**. Prove it: `node tools/sim/test/rules.test.mjs` passes, and `node tools/sim/run.mjs data/board-long.json 100000` gives exactly the numbers in `docs/analysis/measure-frozen.md`. Update GCD §9 and §16 item 4 with the owner's decision.

After I-4: step I-5 (the short board), then I-7 (final freeze), then coding (`docs/PROJECT_PLAN.md` Step 2).

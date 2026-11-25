# Step I, phase B: board redesign and narrative (Lantern Festival), prompt for a new session

> Prepared at the end of phase A (owner, 25 Nov 2026; phase A merged in PR #46). Kept as the record of the request.

```text
Step I, phase B of docs/prompts/StepI_destinations.md for "Don't Get Mad!" (repository AlbMarketsAutoPilot-lab/dgm-game).
Work on a new branch claude/stepI-B, from main (phase A is merged: PR #46).

HOW TO WORK (my rules; DGM has no CLAUDE.md):
* One step at a time. When I have to do something, give exactly ONE step with the exact clicks or Command Prompt line (I am on Windows) and what I should see. Stop. Continue only when I say "done".
* No change, commit, push or PR without my approval. First explain the problem, the proposed change, its cost and risk, then ask.
* EVERY text a player sees (guide, notifications, square stories, area names, buttons) is shown to me for approval before it goes into any file.
* Never guess. Verify in the code, the docs or what I paste. If unsure, ASK.
* I am on a limited plan: short plain answers, no repeated research, no long logs.

READ FIRST (Part 2 of StepI_destinations.md is what counts):
docs/GCD.md (v3: §8.2a R1–R20, §8.6, §9, §14), docs/prompts/StepI_destinations.md Part 2 (including "Owner decisions on the phase A plan"), docs/analysis/stepI-A_measure.md, data/lantern-festival.json, src/engine/v3/, tools/sim/engine3.mjs, tools/sim/stepI.mjs, data/board-short.json (the old v2 stories and icons, for reference only), src/ui/tales.ts and src/ui/guide.ts (how texts are shown today), src/render/ (how icons are drawn).

PHASE B = board redesign + full narrative for the Lantern Festival (100 squares), no screen work (that is phase C):
1. Narrative voice first: 4–5 key moments (e.g. the guide's welcome, entering the Forest, the fallen tree, the Dragon Boat, the finish) written in 2–3 styles (e.g. calm and wise / warm and festive / dramatic). I choose one.
2. Then area by area (Home Town, Countryside, Forest, Mountains, Seaside, Big City), each approved before the next: area name and sign, the guide's area announcement, each square's story and short notification, the area effect texts.
   - The guide (an Asian wise man, respectful, no stereotypes) carries the story on the right.
   - Left notifications carry only short facts and never repeat the guide.
   - No square numbers in any text; distances only ("Go back 18 squares"); die numbers are fine.
   - All ages, family rating; "spiritual" = wonder, light, journey, gratitude, not religion.
3. Squares still open: 54 needs a new destination (its old one, 67, is no longer the Lodge). Squares 10, 17, 37, 61, 66, 72, 94, 96, 99 may be revisited in this phase. Every change keeps rule R8 (event jumps at most 20 squares, never onto another event square) and passes the board check in src/engine/v3/board.ts.
4. New pictures to propose (shown to me before drawing): the fallen tree, the Dragon Boat, the Swap Market (blue ◆), the area signs. Seaside takes the sailboat icon.
5. Texts and icons go into data/lantern-festival.json (with the board check and tests extended), not into the app yet.
6. Measure again after any square change: node tools/sim/stepI.mjs, compared with docs/analysis/stepI-A_measure.md. The simulator (tools/sim/engine3.mjs) and the app engine (src/engine/v3/) must change the same way, and test/v3-equivalence.test.ts must stay green.

FIRST TASK (no code, no texts yet): read the files, then give me (1) a few lines on what you found, (2) unclear points and risks, (3) a step-by-step plan for phase B with cost and risk per step. Then wait for my approval.
```

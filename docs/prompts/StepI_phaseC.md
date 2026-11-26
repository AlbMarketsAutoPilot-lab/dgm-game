# Step I, phase C: the screens (Lantern Festival, v3 rules), prompt for a new session

> Prepared at the end of phase B (owner, 26 Nov 2026; phase B merged in PR #48). Kept as the record of the request.

```text
Step I, phase C of docs/prompts/StepI_destinations.md for "Don't Get Mad!" (repository AlbMarketsAutoPilot-lab/dgm-game).
Work on a new branch claude/stepI-C, from main (phase B is merged: PR #48).

HOW TO WORK (my rules; DGM has no CLAUDE.md):
* One step at a time. When I have to do something, give exactly ONE step with the exact clicks or Command Prompt line (I am on Windows) and what I should see. Stop. Continue only when I say "done".
* No change, commit, push or PR without my approval. First explain the problem, the proposed change, its cost and risk, then ask.
* EVERY text a player sees (buttons, popups, notifications, labels) is shown to me for approval before it goes into any file. Texts already approved in data/lantern-festival.json are used word for word.
* Every picture is shown to me (screenshot, large and at real size) before it is approved. Pictures must be detailed and grown-up, never childish. Do not draw people unless I ask.
* Never guess. Verify in the code, the docs or what I paste. If unsure, ASK.
* I am on a limited plan: short plain answers, no repeated research, no long logs.

READ FIRST:
docs/GCD.md (§8.2a R1–R20, §8.6, §9.3, §14), docs/prompts/StepI_destinations.md Part 2 ("Screens and the guide", Rules, "Owner decisions on the phase A plan", "Owner decisions in phase B"), data/lantern-festival.json, src/engine/v3/, src/engine/ (v2, to be replaced), src/ui/ (the game screens), src/render/ (art-lantern.ts: new pictures and areaSign()), test/.

PHASE C = the screens of the Lantern Festival with the v3 rules (no leaderboard: phase E; no opening guide or tips: phase F; no app release: phase G):
1. The app plays with the v3 engine (src/engine/v3/) and data/lantern-festival.json. The v2 engine, the 202-square board, their files and tests are deleted; saved games of the old version are dropped (the save version goes up), collected postcards are kept. test/v3-equivalence.test.ts stays green.
2. The action area holds only "Roll die". Every choice is a guide popup on the right, covering the die, shown only after the pieces stop moving: the card at Home and at the fallen tree (every turn while a person holds a card), the card on a punishment or a bad area effect, the Swap Market partner, "Skip this turn" and "Pass the die to …". Each button names its action (texts to approve). Robots get no popups; Mr. Lin never tells the story for robots.
3. Left notifications: the approved patterns only, no square numbers anywhere except the "→ 24" label on the zoomed square (the box that opens when a square is tapped included); screen-reader labels keep square numbers.
4. Home: one square called "Home" (no "a 6 to enter"); the "needs 6" tag only when a 6 is really needed; the "free to go" popup; the bumped player's "no 6 needed" notification.
5. Player badge: the Bonus card with the number held (a faded 0 when none) replaces the lantern badge; the card area keeps only the Bonus card slot. Start screen: no board choice, no Easy/Normal choice. "Spoil it?" and "Don't ask me again" are removed.
6. Board: the new pictures (art-lantern.ts), the area signs (areaSign()), the blue ◆ colour for the Swap Market, Seaside with the sailboat, the landmarks.
7. Mr. Lin, the guide figure: propose how he is made before anything is drawn (my rule: no people drawn without asking).

FIRST TASK (no code, no texts yet): read the files, then give me (1) a few lines on what you found, (2) unclear points and risks (for example: where the new and removed postcards of Part 2 belong, since no phase names them; how Mr. Lin's figure is made), (3) a step-by-step plan for phase C with cost and risk per step. Then wait for my approval.
```

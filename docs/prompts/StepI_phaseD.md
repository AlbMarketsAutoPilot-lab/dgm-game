# Step I, phase D: the destinations (4 new boards with their own designs), prompt for a new session

> Prepared at the end of the audit before phase G (owner, 27 Nov 2026; the audit and its fixes are merged in PR #55).
> Owner, 27 Nov 2026: the next session works on phase D. Kept as the record of the request.

```text
Step I, phase D of docs/prompts/StepI_destinations.md for "Don't Get Mad!" (repository AlbMarketsAutoPilot-lab/dgm-game).
Work on a new branch claude/stepI-D, from main (the audit before phase G is merged: PR #55).

HOW TO WORK (my rules; DGM has no CLAUDE.md):
* One step at a time. When I have to do something, give exactly ONE step with the exact clicks or Command Prompt line (I am on Windows) and what I should see. Stop. Continue only when I say "done".
* No change, commit, push or PR without my approval. First explain the problem, the proposed change, its cost and risk, then ask.
* EVERY text a player sees (names, stories, notifications, buttons, popups, labels, summaries) is shown to me for approval before it goes into any file. Approved texts are used word for word: an approved text is never "fixed" without asking me.
* Every picture or screen is shown to me (screenshot, large and at real size) before it is approved. Pictures must be detailed and grown-up, never childish ("4 years old drawings" were rejected). Show one picture at a time. Do not draw people unless I ask. Each guide figure is an image I make myself (as Mr. Lin): propose what it should show, I supply it.
* Never guess. Verify in the code, the docs or what I paste. If unsure, ASK.
* Check your own work as a player would before you show it to me (phone upright, phone sideways, PC). Never show me half-empty or placeholder screens.
* I am on a limited plan: short plain answers, no repeated research, no long logs.

READ FIRST:
docs/prompts/StepI_destinations.md Part 2 (all of it: "Destinations", "Rules", "Squares", "Screens and the guide", "Postcards", "Leaderboard", and every "Owner decisions" section, A to F and the audit before phase G), docs/GCD.md (§8.2a rules v3, §9.3 the Lantern Festival's narrative, §11 measurement, §12, §14), docs/analysis/stepI-A_measure.md (how the Lantern Festival was measured), docs/analysis/audit-2026-11-27.md, data/lantern-festival.json (the model for a destination file), src/engine/v3/ (board.ts checks a destination file), tools/sim/engine3.mjs and tools/sim/stepI.mjs (the simulator and the measurement), src/render/layout.ts (the board's shape: only the spiral so far), src/render/art-lantern.ts (the newest pictures), src/ui/ (app.ts, setup.ts, postcards.ts, records-page.ts, guide-panel.ts, tips.ts, save.ts), test/, tools/browser/ (screens.mjs: the 22 sizes).
In this cloud container the browser checks need: CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:browser

PHASE D (agreed in Part 2, "Destinations"; the plan's row D):
1. A destination screen, chosen FIRST (a slideshow with a picture and a short summary of each trip), then the players.
2. 4 new destinations of 100 squares each, next to the Lantern Festival. Option (b): the same kinds of squares and the same rules (players do not learn a new game), but each destination places them its own way, with its own areas (starting from Home), area effects, guide, board shape (not only spirals: e.g. a snake or a zig-zag), narrative, pictures and postcards. I decide what to call them.
3. Each destination is designed, written and measured on its own, one at a time (the measurement targets of GCD §11.3, as the Lantern Festival in phase A), and each is a later app update.
4. Postcards: one set per destination; the album sorted by destination. Records: one list for all, or one per destination (to decide; records already keep their destination's id).

What the code does today (checked at the end of the audit, 27 Nov 2026; verify again): the engine reads any destination file that passes src/engine/v3/board.ts (Home + 100 squares, exactly one fallen tree, at most one Dragon Boat, the five area effects); the app plays only "lantern-festival" (DEST in src/ui/app.ts, the start screen's picture, the Records page's picture); the board is drawn only as a spiral (src/render/layout.ts); the postcards, the album title and Mr. Lin's figure are the Lantern Festival's (src/ui/postcards.ts, src/ui/guide-panel.ts); some words in the code name the festival (src/ui/app.ts "squares to the festival", the tip "exact" in src/ui/tips.ts); the saved game keeps its destination (save version 4).

FIRST TASK (no code, no texts, no pictures yet): read the files, then give me
(1) a few lines on what you found,
(2) unclear points and risks (for example: the order of phase G and phase D; what may differ between destinations and what must stay the same; the destination screen's place and design; one Records list or one per destination; how each new board shape is drawn and checked; how each guide figure is made),
(3) a step-by-step plan for phase D with cost and risk per step: first the shared work (destination screen, board shapes, one set of postcards per destination), then destinations 1–4 one at a time (concept, areas and squares, measurement, narrative, pictures, screens), each ending with its own tests, browser checks and docs.
Then wait for my approval.
```

# Step H: lanterns as shields, no kick-out, Easy and Normal robots, then new app versions (owner, 22 Oct 2026)

> **Status: done.** Steps H.1–H.5 and the new Android and Windows versions are merged (PRs #32, #34, #35). Kept as
> the record of what the owner decided and asked for. The prompt below is as given to the session on 22 Oct 2026.

Copy everything below the line into a new session on the repository AlbMarketsAutoPilot-lab/dgm-game.

---

HOW TO WORK (the owner's rules; DGM has no CLAUDE.md, these are the same as in the KAJ repo):

* One step at a time. When I have to do something (Android Studio, Play Console, GitHub), give exactly ONE step with the exact clicks or the exact Command Prompt line (I am on Windows), say in one plain sentence what it does and what I should see. Stop. Continue only when I say "done", and check what I paste before the next step.
* No change, commit, push or PR without my approval. First explain the problem, the proposed change, its cost and risk, then ask. Every text a player will see (guide, popups, buttons) is shown to me for approval before it goes into the code.
* Never guess. Verify in the code, the docs or what I paste. If you are not sure what a screen shows, ASK me to paste it.
* I am on a limited plan: short plain answers, no repeated research, no long logs.
* Read first: docs/GCD.md §8.2a and §8.2b (rules R1–R21, marked FROZEN: I am unfreezing R14, R17, R18 and R21 for this step only), docs/prompts/Step8_android_app.md and docs/prompts/StepF_google_play.md (how the Android app is built and published).

GOAL: three rule changes decided by me (22 Oct 2026), the guide and popups updated to match, the web game published, and a new Android version built in Android Studio for Google Play.

THE DECIDED RULES (do not change them; ask me if something is unclear):

1. Nobody is kicked out of the game. Every player always keeps their last lantern until the end (it is kept "to light on the last square"). Only lanterns above the last one can be spent.
   - A player stuck in the Bog with only their last lantern keeps rolling every turn until they roll a 6. No limit.
   - No 6 after three rolls at the start or in the Bog: with a spare lantern, one is used automatically and the player moves by that third roll (as today). Without a spare lantern: no lantern is lost, the player keeps rolling until a 6.
   - Players still win a lantern by rolling three 6s in a row (no upper limit, as today).
   - Trying to use the last lantern shows a popup. My text: "You can't use your last lantern: you have to light it on the festival square." (propose better English for approval).
2. A lantern is a shield. When a player lands on any red ▼ square (every punishment square, including the Bog and the squares that send you into the Bog, i.e. punishments that ask you to roll a 6), they may spend a spare lantern to cancel it.
   - NOT against being bumped, and NOT against the fallen tree.
   - It protects only the player who lands; a lantern can never cancel another player's reward (only the Bonus card can).
   - Spending a spare lantern to start at once or to leave the Bog at once stays as today.
   - The Bonus card and the Bog boots stay exactly as today.
   - No new popup: the bad-square popup that already appears gets one more button, "Use a lantern (N left)", shown only when the player has a spare lantern (next to the Bonus card button when they also hold the card). Propose the exact popup layout for approval.
3. Robots have two levels, chosen on the start screen: Easy and Normal.
   - Easy = today's computer player (simplePlayer), unchanged.
   - Normal = uses lanterns: spends a spare lantern to leave the Bog at once; uses the lantern shield on punishments worth about 10 squares or more; on the Bog it wears the Bog boots rather than the Bonus card; never tries the last lantern. Propose the exact strategy and the start-screen control for approval.

WHAT THE PREVIOUS SESSION MEASURED (40,000 computer games per row, 4 players, in a scratch copy of the engine; redo this with the real simulator and put a report in docs/analysis/ before any rule code is merged):
* Strategy: 1 Normal player against 3 Easy robots wins 30.4% (long board) / 31.7% (short) instead of 25.2% / 25.5% today (design target 27–32%).
* A player who never uses lanterns against 3 Normal robots: 20.5% / 19.5%.
* Seats stay fair: 24.7–25.4%. Nobody out (today 0.1% of players).
* Games shorter: about 41 rounds instead of 50 (long), 23 instead of 29 (short).
* Close finishes up: 15.5% instead of 11.5% (long), 32.6% instead of 21.4% (short).
* Lead changes down: about 6.0 instead of 7.8 (long), 4.9 instead of 6.6 (short).
* Players waiting 10+ turns in a row: 2.6% instead of 1.2% (long), 0.8% instead of 0.7% (short).

WHAT THE CHANGE TOUCHES (checked in the code on 22 Oct; verify again):
* Engine: src/engine/game.ts (waitingTurn, loseLantern, applyTile, the decision kinds), src/engine/types.ts, src/engine/board.ts (it refuses any rule that is not the frozen one: "outAfterZero" etc.), and the simulator tools/sim/engine.mjs, which test/equivalence.test.ts compares game by game with the engine: both must change the same way.
* Robots: src/ui/app.ts uses simplePlayer for computer seats (line ~402); the start screen needs the Easy/Normal choice.
* Popups and texts (src/ui/app.ts, src/ui/tales.ts): remove "Lights Out" (out), "Last Light / one more slip and out", winLast, nobody; change "A Lantern Goes Out", the Bog texts, the Start-square text (still says "Roll a 6 to set off"), the tip line, the player panel, the "A 6!" popup; the lantern badge must not show "✕" any more.
* Saves: src/ui/save.ts VERSION goes up (old unfinished games would replay wrong; postcards are kept). Check the "out" sound and postcards.
* Tests: test/rules.test.ts (23 lantern checks), test/equivalence.test.ts, the browser checks in tools/browser/ (games.mjs, screens.mjs: new buttons on every screen size).
* Rules document: docs/GCD.md R14, R17, R18, R21 rewritten with today's date and "owner, 22 Oct 2026".

THE GUIDE (src/ui/guide.ts, 8 slides; current texts were approved on 21 Oct, PR #31):
* Change only the slides the new rules touch (slide 2 start, slide 3 lanterns, slide 5 or 6 for the shield, maybe 7 "Bump!": add that a lantern cannot undo a bump). Do not touch pictures or colours (Green ▲ and red ▼ stay coloured).
* No story words at all: a new player does not know the story. Say "the last square", never "festival".
* Be explicit: "roll a 6" (never just "a 6" or "get a 6"), "win on the last square".
* Show me every slide's text for approval, with the word count against today's text, then check all slides fit every screen size (tools/browser/screens.mjs).

ORDER OF WORK (each step: propose, wait for my "approved", do it, test, then ask before commit/push/PR):
1. Rules: write the new R14/R17/R18/R21 text for docs/GCD.md for approval.
2. Engine + simulator + tests, then the measurement report (docs/analysis/).
3. Robots Easy/Normal + start-screen control.
4. Popups and texts (all of them shown to me first).
5. Guide.
6. Full checks: npm test, npm run test:browser (all 25 checks), then one PR. I merge; the web game updates by itself (.github/workflows/pages.yml).
7. Android version: versionCode 1 → 2 and versionName "1.0.0" → "1.1.0" in android/app/build.gradle.kts (ask me first). Then guide me, one step at a time, on my Windows PC:
   - git pull of main, npm ci, npm run android:assets (builds the game and copies it into the app; the offline worker stays out);
   - open android/ in Android Studio; Build > Generate Signed App Bundle with my existing signing key (never put the key or passwords on GitHub); where the .aab file ends up;
   - uploading it to Google Play Console as a new release (follow docs/prompts/StepF_google_play.md).
   IMPORTANT: my first version may still be in review at Google Play. Before the upload, ask me whether it has been approved: sending a new release during a review would probably replace the one under review and restart it (check Google's current help page before saying so).
8. Windows app (Microsoft Store, approved 21 Oct): only after my approval, the version in windows/DGM/Package.appxmanifest goes from 1.0.0.0 to 1.1.0.0 and the Windows workflow builds the new upload file; guide me through Partner Center.

Start by reading the files above, tell me in a few lines what you found (and anything in this prompt that does not match the code), then give me step 1 only.

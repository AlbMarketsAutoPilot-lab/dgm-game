# Step F: Google Play, for families and for all ages (owner's request, 16 Oct 2026)

> Paste into a new Claude Code session: **"Do Step F using docs/prompts/StepF_google_play.md"**.
> The Android app is built and works on the owner's Galaxy S25 (Step 8, Steps A–D). Bugs found while testing the app
> on the phone are handled in the Step 8 session, not here.

## 1. Read first, all of it, before giving any opinion (strict)

1. `docs/PROJECT_PLAN.md`: the working rule and every step.
2. `docs/GCD.md`, whole: hard conditions C1–C5 (§3), audience (§4), pillars (§5), the story and its voice (§9),
   presentation (§14). The game must be judged against these objectives.
3. `docs/prompts/Step8_android_app.md`: the Android app's rules and decisions D1–D13.
4. `docs/analysis/MARKET_REPORT.md`: who plays race games and why (families, young adults 18–34).
5. `README.md`, `public/privacy.html`, `public/copyright.html`, `public/licenses/third-party.txt`, `LICENSE`.
6. `src/ui/README.md`, `src/render/README.md`: every screen, popup, picture, sound and what is saved on the device.
7. `docs/analysis/audit-2026-10-15.md` and `docs/analysis/audit-code-2026-10-15.md`: what was checked and fixed.
8. Every other `docs/prompts/*.md`: how the owner works and what was decided before.

Then play the whole game in a browser (`npm install`, `npm run build`, `npm run preview`, or the screenshots the
`npm run test:browser` tools make), on the long and the short board, so the analysis is of the real app, not of the
documents only.

## 2. Working rules (strict; they come from the owner's project files and earlier sessions)

1. **One step at a time.** After each step (section 4) stop and wait for the owner's "approved". A guide for the owner
   is also given one step at a time; after each step wait for "done" (`docs/PROJECT_PLAN.md`).
2. **Nothing without the owner's approval:** no text, no picture, no change to the game, the app or a document, no
   push. Propose first, then do only what was approved. A problem found on the way is reported with a proposed fix,
   then the session waits.
3. **Never assume.** Anything not written in the project files is a question for the owner. Never assume how the
   owner did something before (for example in the KAJ app): ask.
4. **The KAJ app is an example, not code or text to copy.**
5. **Facts about Google Play are checked on the day** on Google's own pages (Play Console Help, the Developer Program
   Policy, the Families Policy, Teacher Approved), with the link given. Rules change; nothing from memory.
6. **Keep answers short and in plain language.** Give one recommendation, not a list of options.
7. **The owner does everything on his own PC and in his own Play Console.** Every command is a Command Prompt line with
   one plain sentence on what it does. The owner already knows Android Studio and has published the KAJ app; do not
   tell him to run commands for things he does in Android Studio himself.
8. **Never anything secret on GitHub:** no signing key, no passwords. Pushing to GitHub only after the owner's
   "approved", then a pull request; the owner merges.
9. **Be creative where it helps the goal:** if something in the game, the store texts or the pictures would make the
   app more likely to be accepted for families, or more attractive to children, parents and players 18–34, propose
   it, with the reason. The game's rules (frozen, GCD) and its approved look are changed only if the owner approves.

## 3. The owner's goals

- **Accepted for families on Google Play**: in the target audience that includes children, under the Families
  Policy, and, if possible, rated for all ages (for example PEGI 3 / IARC 3+ / Everyone). If it fits, also consider
  "Teacher Approved", without promising it.
- **Attractive in the store** to three groups at once: children, parents, and players 18–34 (GCD §4, the market
  report), without looking childish (C3).
- **Cost 0, no ads, no purchases, no accounts, no data collected** (C1): the store forms must say exactly this, and say
  it truthfully, including the Android backup (`privacy.html` §3).

## 4. Steps (stop after each one)

- **F1. The full analysis.** The whole app (every screen, text, picture, sound, link, what is saved, the Android
  manifest and permissions) checked against Google's current Families Policy, content rating questions, Data safety
  questions and listing rules. One short table: what · passes or not · why (with Google's link) · the proposed fix.
  Also: what would make the app stronger for families and for all ages (creative proposals, each with a reason).
- **F2. The owner's decisions** on F1: what to change before submitting, the target age groups, the category and tags,
  the content rating answers, the Data safety answers, contact details.
- **F3. Changes to the game or the app**, only those approved in F2, with all the existing checks (`npm run
  typecheck`, `npm test`, `npm run build`, `npm run test:browser`). Pull request; the owner merges.
- **F4. The store texts**: app name (Play's length limit), short description, full description, in the GCD's voice
  (grown-up, dry humour, simple enough for a child, C2 and C3). For the owner's approval, word by word.
- **F5. The pictures**: which screens of the game make the best screenshots for children, parents and 18–34 players,
  in which order, upright or sideways, and a short caption for each; exactly how the owner takes them on his phone
  (one step at a time); Play's sizes and rules for screenshots, the feature graphic (1024 × 500) and the 512 × 512 icon
  (made from the approved icon, `android/icon-source.png`). Propose the feature graphic and the captions for approval
  before making anything.
- **F6. Play Console, form by form**, one step at a time: app details, privacy policy address (README.md), app access,
  ads, content rating, target audience and content, Data safety, government apps, news, the store listing, countries.
- **F7. The release**: the App Bundle (`.aab`) signed with the owner's existing key, the version number, Play App
  Signing, the testing track Google requires for this account, then production. Every step one at a time.

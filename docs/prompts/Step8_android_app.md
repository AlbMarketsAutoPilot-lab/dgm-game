# Prompt for Step 8: the Android app (built and signed by the owner in Android Studio)

> Paste into a **new Claude Code session, Medium effort** (High if the session should also try a Gradle build in the
> cloud): **"Do Step 8 using docs/prompts/Step8_android_app.md"**

This replaces the old plan for Step 8 ("built by GitHub Actions"). The owner builds, signs and uploads the app
**on their own computer, in their own Android Studio**. The session prepares the repository so that this is easy and
repeatable, adapts the few things a phone app needs, and writes the owner's step-by-step guide. **No signing, no
keys and no store upload happen in GitHub or in the session.**

---

## Your role and the working rules (read first, they are strict)

You are the Android developer of *Don't Get Mad!*, a free family race game (web + Android). Resources are scarce
(Claude Pro allowance), so work lean.

1. **Never change anything without the owner's approval.** Not the design, not a text, not a behaviour. Propose first
   (a short table, one recommendation per question), wait for "approved", then build exactly that. A bug found on the
   way: report it with the proposed fix, and wait.
2. **Read before acting:** `docs/GCD.md` §3 (hard conditions C1–C4), `README.md` (incl. "Copyright and privacy"),
   `src/ui/README.md`, `docs/analysis/audit-code-2026-10-15.md` §6–§9 (screen sizes, sound, offline, copyright and
   privacy), `public/privacy.html` (every promise in it must stay true in the app), `vite.config.ts`, `public/sw.js`,
   `src/main.ts`, `src/ui/sound.ts`, `src/ui/popup.ts`, `tools/browser/README.md`.
3. **The rules engine (`src/engine/`) and the board files stay frozen.** The game's look stays as approved.
4. **Work in the parts below and stop after each one** for the owner. Plain language, short answers.
5. **Nothing secret in the repository, ever:** no keystore (`*.jks`, `*.keystore`), no passwords, no
   `keystore.properties`, no `google-services.json`, no Play Console credentials. Add them to `.gitignore` first.
6. **No GitHub Actions for Android** (no build, no signing, no upload workflow), unless the owner asks later.
7. Keep every existing check green: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`
   (`CHROMIUM_PATH=/opt/pw-browsers/chromium` in the cloud). The web game must work exactly as before.

## What is already decided (do not break)

- **C1:** cost 0, no ads, no purchases, no accounts, no data collected, works offline. The privacy policy promises
  that saved data **never leaves the device** and that the app **needs no internet**.
- **The web version** on GitHub Pages stays as it is, with its offline worker (`public/sw.js`, file list made by the
  build). The app is the same web game wrapped with **Capacitor** (free).
- Sound and music are part of the package (`src/assets/sounds/`), on by default and muted at will with its two switches; vibration goes with the
  sound switch.
- Copyright notice on the start screen; `copyright.html`, `privacy.html` and `licenses/third-party.txt` ship with the
  game and must open inside the app, with their way back to the game.
- Both orientations, every screen size from 280 × 653 to tablets (checked by the browser tests).

## The owner's own process (what the session prepares for)

1. On the owner's computer: `git pull`, `npm ci`, `npm run android` (one command: web build → copy into the Android
   project; then opens Android Studio, or prints how to open the `android/` folder).
2. In Android Studio: run on an emulator or a real phone; **Build → Generate Signed App Bundle**, with the owner's
   own **upload key** (made once in that same wizard, kept outside the repository and backed up).
3. In the Play Console: **Play App Signing** (Google keeps the app signing key; the owner keeps only the upload key),
   upload the `.aab` to a testing track first, then production.

The session never sees or creates the key; the guide tells the owner how, and how to back it up.

---

## Part A: proposal (stop here for approval)

Check the facts first (current versions and Google Play rules change; look them up, do not trust memory), then give the
owner **one short table** with your recommendation for each:

| # | Question | What to check / recommend |
|---|---|---|
| A1 | **Application ID** (permanent: it can never change after the first upload) | Recommend one based on the owner's name, e.g. `al.connect.dontgetmad`; the owner decides |
| A2 | **App name** on the phone | "Don't Get Mad!" (note: the apostrophe must be escaped in `strings.xml`) |
| A3 | **Versions** | Capacitor: the current stable major, exact pinned versions. Target SDK: the level Google Play **currently requires for new apps** (expected API 36 from 31 Aug 2026: verify); min SDK as Capacitor's default. JDK and Android Gradle Plugin as that Capacitor version needs |
| A4 | **Version numbers** | One source: `package.json` `version` → `versionName`; `versionCode` a whole number that grows with every upload (a small script, e.g. `npm run android:version`, sets both). First release: 1.0.0 / 1 |
| A5 | **Offline worker in the app** | Recommend: **not registered inside the app** (the files are already on the phone; a worker could keep an old version after an update). Only the web version keeps it |
| A6 | **Internet permission** | Recommend: **remove `INTERNET`** from the manifest if the app works without it (it should: Capacitor serves the files locally). Makes "needs no internet" true by construction. External links (GitHub, Google on the legal pages) must open in the phone's browser |
| A7 | **Backup** | Android's automatic backup would copy the saved game to Google Drive, which breaks the privacy policy ("never leaves the device"). Recommend `android:allowBackup="false"` and empty data-extraction rules |
| A8 | **Android Back button / back gesture** | Recommend: closes the popup, album or guide on top (like Escape); on the game screen asks the existing "Leave?" question; on the start screen leaves the app. Never loses a game (it is saved) |
| A9 | **Vibration** | Check whether `navigator.vibrate` works in the Android WebView; if not, propose the Capacitor Haptics plugin, still only when the sound switch is on. Needs the `VIBRATE` permission (the only one) |
| A10 | **Screen edges** | Android 15+ draws apps edge to edge: buttons must not sit under the status bar, the notch or the navigation bar (gesture and 3-button), in both orientations. Propose how (Capacitor's current system-bars / safe-area way, the game's existing `env(safe-area-inset-*)`) |
| A11 | **Icon and splash** | Adaptive icon from the existing artwork (`public/icons/icon-maskable-512.png`), splash = Android 12+ splash API, background `#4b2377`. Show the owner the icon on a round, square and squircle mask before building |
| A12 | **Sound when the app is in the background** | The game already goes quiet on `visibilitychange`; check it also happens on Android when the app is switched away or the screen locks (else use Capacitor's app-state events) |
| A13 | **Other promises** | No analytics, crash reporting, ads SDK or Google services added by any plugin. List every plugin you plan to add, with what it does and its licence |

Also report, from the Play Console help pages (current text): whether the owner's account type needs **closed testing
with at least 12 testers for 14 days** before production (personal accounts created after 13 Nov 2023 do), and what the
**Families policy** requires if the target audience includes children (the game is a family game).

## Part B: build it (after "approved")

- Capacitor added with the approved versions; `capacitor.config.ts` (app ID, name, `webDir: "dist"`); the `android/`
  project **committed** (so Android Studio opens it directly), with build outputs, `local.properties` and all key files
  in `.gitignore`.
- npm scripts: `android` (build + sync + open), `android:sync`, `android:version`.
- The app-only changes approved in Part A (A5–A12), each behind a check for the native app so the **web version is
  unchanged** (prove it: the full browser test suite passes, and the web build still has its offline worker).
- `allowBackup` off, only the approved permissions; manifest, `strings.xml`, icons, splash, theme colours.
- If the cloud environment allows (Google's Maven and the Android SDK reachable): `./gradlew assembleDebug` as a
  build check, **unsigned debug only**. If not, say so; the owner's Android Studio build is the real check.
- Tests: a unit test for the version script; a test that the native-only code paths are not taken on the web; keep
  `test/legal.test.ts` passing (if the app adds anything the privacy policy must mention, propose the policy change
  first).

## Part C: the owner's guide (with Part B)

Write `docs/android/README.md`, plain language, numbered, for someone using Android Studio on their own computer:

1. **One-time setup:** Node version, Android Studio (current), JDK (the one Android Studio bundles, if suitable), SDK
   platform for the target API, an emulator; `git clone`, `npm ci`.
2. **Run the app:** `npm run android`, then Run ▶ in Android Studio (emulator and a real phone with USB debugging).
3. **What to check on the phone** (a short checklist): start screen fits in both orientations; a whole game; Back
   button behaviour; sound, music and vibration with the switches; leave and continue a game; app switched away and
   back; airplane mode (whole game works); copyright and privacy pages and their way back; external links open the
   browser; large system font; a small and a large phone; a tablet.
4. **The upload key (once):** create it in *Generate Signed App Bundle → Create new…*; where to keep it (outside the
   project folder); **back up the key file and both passwords in two safe places** (lost upload key = a reset request
   to Google, days of delay); never commit it, never email it.
5. **Each release:** `npm run android:version` (new version number, `versionCode` +1), `npm run android`, *Build →
   Generate Signed App Bundle → release*, where the `.aab` lands, upload to the testing track, then promote.
6. **First upload in the Play Console:** create the app (default language, name, free, app/game: Game, category:
   Board), enrol in Play App Signing, store listing, content rating (IARC questionnaire), target audience and content,
   **Data safety** ("No data collected, no data shared", consistent with `privacy.html`), privacy policy URL
   (https://albmarketsautopilot-lab.github.io/dgm-game/privacy.html), ads: none, app access: no login needed, testing
   track and testers (12 for 14 days if the account needs it), then production.
7. **When something goes wrong:** the usual errors (Gradle sync, JDK version, SDK missing, "version code already
   used", signing mismatch) and the fix for each.

## Part D: the store listing draft (stop for approval)

`docs/android/PLAY_LISTING.md`, for the owner to copy into the Play Console, **all texts for approval**:

- Short description (max 80 characters) and full description (max 4000), in the game's voice (GCD §9.2), no claims
  the game does not keep (cost 0, offline, no ads, no accounts, family-friendly).
- The answers for content rating, target audience, Data safety, and "contains ads: no", each matching
  `privacy.html` and GCD C1–C2.
- Graphics list: app icon 512 × 512, feature graphic 1024 × 500 (propose a design from the existing art, for
  approval), phone screenshots (2–8; propose which screens, made with the browser tools at phone size or by the owner
  on the phone), 7" and 10" tablet screenshots if the app is offered on tablets.

## How to check your work

- Every existing check green (rule 7), the web version unchanged.
- The app build (Part B) and the owner's checklist (Part C, 3). Ask the owner to send screenshots or a short note from
  their phone; fix only what they approve.
- Update `docs/PROJECT_PLAN.md` row 8 and `README.md` (a short "Android app" section pointing to
  `docs/android/README.md`) when the owner confirms the app runs on their phone.

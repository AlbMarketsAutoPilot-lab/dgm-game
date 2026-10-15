# Prompt for Step 8: the Android app (Google Play)

> Paste into a **new Claude Code session, Medium effort**:
> **"Do Step 8 using docs/prompts/Step8_android.md"**

---

## Your role and the working rules (read first, they are strict)

You are the developer of *Don't Get Mad!*, a free family race game (web + Android). Resources are scarce (Claude Pro
allowance), so work lean.

1. **Never change the game without the owner's approval.** Not the rules, the design, a text or a behaviour. This step
   only packages the existing web game as an Android app. If you find a bug, report it with a proposed fix and wait.
2. **Ask before deciding anything the owner must decide** (listed below), one recommendation per question, short and in
   plain language. Do not ask about things you can check yourself.
3. **When the owner reports a problem from a real test, believe it.** Reproduce it exactly as described before saying
   anything else.
4. **Report honestly.** For each item say DONE, PARTLY (and what is missing) or NOT DONE. Never call something done
   without having checked it.
5. **When the owner says STOP, stop at once:** no more commands, no commits, no pushes.
6. **Do not open a pull request until the owner asks.** Commit and push to your session's branch.

## Read before acting

- `docs/GCD.md`: C1 (cost 0, no accounts, nothing leaves the device), C2 (family-safe), C4 (web + Android, Google Play,
  the owner's existing account).
- `docs/PROJECT_PLAN.md` (Step 8 row), `src/ui/README.md` (offline and install, Step 7).
- `vite.config.ts` (`base: "./"`, already relative for Android), `public/manifest.webmanifest`, `public/sw.js`,
  `.github/workflows/pages.yml` (the existing Pages workflow; do not break it).

## What is already true

- The web game is live on GitHub Pages and works offline (service worker). `npm run build` writes `dist/`.
- 167 tests (`npm test`), `npm run typecheck`, `npm run build` all pass. Keep them passing.
- This container has **no Android SDK**: the Android build must run on **GitHub Actions** (ubuntu runner, Java 17/21,
  Android SDK preinstalled there).

## The owner's decisions to ask for FIRST (before building anything)

1. **App ID** (permanent on Google Play, can never change after the first upload). Recommend
   `com.albmarkets.dontgetmad`; if the owner owns a web domain, the reversed domain is better.
2. **Google Play audience:** recommend "13 and older" (the game is family-safe; "under 13" brings the Families policy).
3. **Signing key:** the upload key must be created and kept by the owner, never by you. Give the owner one `keytool`
   command to run on their own computer, and the exact names of 4 GitHub secrets to add (keystore as base64, store
   password, key alias, key password). Test builds do not need it, so build first and add signing when the secrets exist.

## Part A: build it (after the owner answers 1 and 2)

1. Add **Capacitor** (Android only): `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` as dependencies;
   `capacitor.config.ts` with the approved app ID, app name "Don't Get Mad!", `webDir: "dist"`.
2. Commit the generated `android/` project (Capacitor's standard layout). App icon and splash from the existing
   `public/icons` (the four tokens on purple, owner-approved in Step 7); status bar purple `#4b2377`. Portrait and
   landscape both allowed (the game is responsive). No extra permissions: the app needs no internet, camera, location
   or storage permission (C1). The service worker must not break the app (register it only on the web, not inside
   Capacitor, if it causes trouble).
3. A workflow `.github/workflows/android.yml`: on push to `main` and on manual run; `npm ci`, `npm test`,
   `npm run build`, `npx cap sync android`, then Gradle: a **debug APK** (for testing on any phone) and, only when the
   signing secrets exist, a **signed release AAB** (for Google Play). Both as downloadable workflow artifacts.
   `versionCode` from the run number, `versionName` from `package.json`.
4. Checks: the existing tests, typecheck and build; the workflow passes on GitHub (read its logs with the GitHub tools;
   fix and push until green); the APK artifact exists. Tell the owner how to install the APK on their phone to test.

## Part B: Google Play (the owner does the clicking; you write the steps)

Write `docs/android/PLAY_RELEASE.md`, short and step by step, for the owner's existing Play Console account:
create the app (name, default language English, Game, Free), upload the first signed AAB **by hand** (Google requires
the first upload manually), internal testing track first; store listing texts (short and full description, written
from the game as it is, family-safe, no exclamation-mark cheerfulness; show them to the owner for approval before
using them); content rating questionnaire (no violence, no gambling, no user content); **data safety: no data
collected or shared** (C1); target audience as approved; privacy policy: a one-page "this app collects nothing" page
published with the game on GitHub Pages (`public/privacy.html`), owner approves the text first.

## Output

- `capacitor.config.ts`, `android/`, `.github/workflows/android.yml`, `docs/android/PLAY_RELEASE.md`,
  `public/privacy.html` (after approval).
- `docs/PROJECT_PLAN.md`: mark Step 8 with what is done (one line), and what waits on the owner (secrets, Play upload).
- A final list for the owner: each item of this prompt with DONE / PARTLY / NOT DONE.

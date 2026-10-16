# Prompt for Step 8b: build the Android app (Part A already approved)

> Paste into a **new Claude Code session, High effort** (it should try a Gradle build in the cloud):
> **"Do Step 8b using docs/prompts/Step8b_android_build.md"**

This continues `docs/prompts/Step8_android_app.md`. **Part A of that prompt is done and approved by the owner
(16 Oct 2026)**: the decisions are below, do not ask them again. This session does **Part B (build) and Part C (the
owner's guide)**, then stops for the owner's phone test. Part D (store listing) comes after, in its own round.

---

## Your role and the working rules (strict)

You are the Android developer of *Don't Get Mad!*, a free family race game (web + Android). Resources are scarce
(Claude Pro allowance): work lean, no long explanations.

1. **Never change anything the owner has not approved** (design, texts, behaviour). Everything in "Approved" below is
   approved. Anything else: propose first (a short table, one recommendation each), wait for "approved". A bug found on
   the way: report it with the proposed fix, and wait. **Show a screenshot before changing anything the player sees.**
2. **Read before acting:** `docs/prompts/Step8_android_app.md` (the full plan; its Part A is answered below),
   `docs/GCD.md` §3 (C1–C4), `README.md` ("Copyright and privacy"), `public/privacy.html` (every promise must stay
   true in the app), `vite.config.ts`, `public/sw.js`, `src/main.ts`, `src/ui/app.ts` (`leave()`), `src/ui/popup.ts`,
   `src/ui/sound.ts`, `src/ui/README.md`, `tools/browser/README.md`.
3. **The rules engine (`src/engine/`) and the board files stay frozen.** The game's look stays as approved.
4. **Nothing secret in the repository, ever:** no keystore (`*.jks`, `*.keystore`), no passwords, no
   `keystore.properties`, no `google-services.json`, no Play Console credentials. Add them to `.gitignore` **first**.
   You never create, see or ask for the owner's key.
5. **No GitHub Actions for Android** (no build, signing or upload workflow).
6. **Keep every check green:** `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`
   (`CHROMIUM_PATH=/opt/pw-browsers/chromium` in the cloud). **The web version must work exactly as before** (the
   browser tests prove it; the web build keeps its offline worker).
7. **Git:** work on the branch the session gives you. Before every push, check whether the pull request for that
   branch is already merged; if it is, start the branch again from `main` and open a **new** pull request (on 16 Oct
   a commit pushed after a merge was left out of `main`). Open the pull request when Parts B and C are ready.
8. **The owner is not a programmer and uses Windows.** Every command you give is a Command Prompt line to copy, with
   one plain sentence on what it does. No "just run…" without the exact text.

## Approved (owner, 16 Oct 2026): build exactly this

| # | Decision |
|---|---|
| A1 | **Application ID: `al.connect.dontgetmad`** (permanent) |
| A2 | **App name: "Don't Get Mad!"** (escaped as `Don\'t Get Mad!` in `strings.xml`) |
| A3 | **Capacitor 8.5.3** (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`), exact pinned versions. **targetSdk 36 and compileSdk 36** (Google Play requires API 36 for new apps and updates since 31 Aug 2026), **minSdk 24** (Capacitor's default). JDK 21 (the one inside Android Studio), Android Gradle Plugin as Capacitor 8.5.3's template has it (8.13.x). Check these are still current on npm before pinning; if a newer 8.x patch exists, use it and say so |
| A4 | **One source for the version:** `package.json` `version` → `versionName`; `versionCode` a whole number in one small file in the repository, +1 on every upload. `npm run android:version 1.0.1` sets both. First release **1.0.0 / 1** |
| A5 | **The offline worker is not registered inside the app** (the files are already on the phone; a worker could keep an old version after an update). The web version keeps it |
| A6 | **No `INTERNET` permission** (remove it with `tools:node="remove"`, so no plugin can add it back). Links on the copyright and privacy pages (GitHub, Google) open in the phone's browser (Capacitor sends outside links there). **Risk to test first:** some Android WebViews may refuse even the app's own local files without `INTERNET`. Test it on the emulator if the cloud allows; else it is on the owner's phone checklist. If it fails: put `INTERNET` back and tell the owner (the privacy promise still holds: the game loads only its own files) |
| A7 | **No backup:** `android:allowBackup="false"`, `fullBackupContent` and `dataExtractionRules` that exclude everything (cloud backup and device transfer). The privacy policy says saved data never leaves the device |
| A8 | **Android Back button / back gesture** (needs `@capacitor/app`, MIT): closes whatever is on top (a popup, the postcard album, the guide), exactly like Escape; on the game screen it shows the **same "Leave this game?" popup** as the Leave button (`GameScreen.leave()`); on the start screen it leaves the app. A game is never lost (it is saved) |
| A9 | **Vibration:** keep `navigator.vibrate` (it works in the Android WebView once the app holds the **`VIBRATE`** permission, the app's **only** permission). No Haptics plugin unless the phone test shows it does not buzz |
| A10 | **Screen edges (Android 15+ draws edge to edge):** use Capacitor 8's built-in System Bars handling (`insetsHandling: "css"` gives `--safe-area-inset-*`). In the CSS use `var(--safe-area-inset-X, env(safe-area-inset-X))`, so the **web version stays exactly as it is**. Today only the bottom is respected; add top and the sides (status bar, notch, both orientations, gesture and 3-button navigation) |
| A11 | **Icon:** adaptive icon from `public/icons/icon-maskable-512.png`, background `#4b2377`; **splash** = Android 12+ system splash from the theme (no splash plugin), background `#4b2377`. **Show the owner the icon on a round, square and squircle mask (a picture) before building it.** `@capacitor/assets` (MIT) may be used as a dev-only tool to make the icon files; it never goes into the app |
| A12 | **Sound in the background:** the game already goes quiet on `visibilitychange`; also silence on `@capacitor/app`'s app-state event (background) and resume on return |
| A13 | **Plugins in the app: only `@capacitor/core`, `@capacitor/android`, `@capacitor/app`** (all MIT). Dev-only: `@capacitor/cli`, `@capacitor/assets`. No analytics, crash reporting, ads, Firebase or Google services. After the build, read the **merged manifest** and list every permission and component in it for the owner |
| — | **No Kodular.** The owner builds in **Android Studio on Windows** |

Every app-only code path sits behind one check for the native app (`Capacitor.isNativePlatform()` or equivalent),
so the web version is unchanged. Add a unit test that the native-only paths are not taken on the web, and a unit test
for the version script.

## What the owner will do (the guide must make this easy)

The owner **does not run the app from Android Studio onto the phone**. They want to be sure it works anywhere, so:

1. On Windows: `git clone` (first time) or `git pull`, then `npm ci`, then `npm run android` (one command: web build →
   copy into `android/` → open Android Studio, or print how to open the `android/` folder if Android Studio is not
   found).
2. In Android Studio: **Build → Generate Signed App Bundle or APK → APK → release**, with their own key (made once in
   that wizard: **Create new…**).
3. Copy the `.apk` to their **Samsung Galaxy S25** and install it (allow "Install unknown apps" for the file manager,
   once), then test.
4. Later, for Google Play: the same wizard, **Android App Bundle** (`.aab`), Play App Signing, testing track first.

## Part B: build it

- `.gitignore` first (keys, `local.properties`, build outputs, `android/app/release/`, `*.apk`, `*.aab`).
- Capacitor added with the approved versions; `capacitor.config.ts` (`appId`, `appName`, `webDir: "dist"`, System
  Bars config); the `android/` project **committed** so Android Studio opens it directly.
- npm scripts: `android` (build + sync + open), `android:sync`, `android:version`.
- The app-only changes A5–A12, each behind the native check. Manifest: only `VIBRATE`, `INTERNET` removed,
  `allowBackup="false"`, backup rules, `strings.xml`, icons, splash, theme colours, both orientations.
- **Try `./gradlew assembleDebug` in the cloud** (unsigned debug only): on 16 Oct `dl.google.com` and
  `maven.google.com` were reachable from the cloud session. Install the Android command-line tools and SDK platform 36
  into the scratchpad (not the repository). If it builds, say so; if not, say why. The owner's Android Studio build is
  the real check. If an emulator can run, test A6 (no `INTERNET`) and A8 (Back) on it.
- `test/legal.test.ts` must keep passing. If the app adds anything the privacy policy must mention, **propose the
  policy change first**.

## Part C: the owner's guide, `docs/android/README.md`

Plain language, numbered, **every command as a Command Prompt line to copy**, for Windows:

1. **One-time setup:** Git, Node.js LTS, Android Studio (current) with SDK Platform 36; where each download is; how
   to check each works (`git --version`, `node --version`). The JDK: the one inside Android Studio.
2. **Get the project:** `cd %USERPROFILE%\Documents`, `git clone …`, `cd dgm-game`, `npm ci`.
3. **Make the app:** `npm run android`; what Android Studio shows the first time (Gradle sync, how long, what to wait
   for).
4. **The key (once):** *Build → Generate Signed App Bundle or APK → APK → Create new…*; what to fill in; **keep the key
   file outside the project folder** (for example `Documents\keys\`); **back up the key file and both passwords in two
   safe places** (lost key = a reset request to Google, days of delay); never commit it, never email it.
5. **Build the APK:** *release*, where the `.apk` lands, how to copy it to the Galaxy S25 (USB cable or Google Drive
   of their own), "Install unknown apps", install.
6. **What to check on the phone** (a short checklist): start screen in both orientations; a whole game; **Back
   button** (popup closes; on the game screen "Leave this game?"; on the start screen the app closes); sound, music
   and vibration with the switches; leave and continue a game; app switched away and back (silent while away);
   **airplane mode: a whole game works**; the copyright and privacy pages and their way back; links on them open the
   browser; large system font; the notes under the picture and the "what's ahead" notice; status bar and navigation
   bar never cover a button.
7. **Each new version:** `git pull`, `npm run android:version 1.0.1`, `npm run android`, build again with the same
   key.
8. **Google Play later** (short; the details come with Part D): App Bundle instead of APK, Play App Signing,
   testing track; personal accounts created after 13 Nov 2023 need a closed test with 12 testers for 14 days.
9. **When something goes wrong:** Gradle sync failed, wrong JDK, SDK 36 missing, "App not installed" (an older copy
   signed with another key: uninstall it first), "version code already used", and the fix for each.

Also: `README.md` gets a short "Android app" section pointing to `docs/android/README.md`; `docs/PROJECT_PLAN.md` row
8 is updated **only when the owner confirms the app runs on the phone**.

## Stop here

Report in a short table: what was built, the cloud Gradle result, the merged manifest's permissions (should be only
`VIBRATE`), every check's result, and the exact Command Prompt lines the owner runs first. Then wait for the owner's
phone test. Fix only what the owner approves.

Part D (store listing, `docs/android/PLAY_LISTING.md`) is the next round, as written in `Step8_android_app.md`.

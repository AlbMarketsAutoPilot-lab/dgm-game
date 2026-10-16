# Step 8: the Android app (owner's plan, approved 16 Oct 2026)

> **The only reference for the Android app.** Every session reads this first. It replaces all earlier Android plans
> and prompts (the Capacitor plan and the Step 8b prompt are withdrawn).
> Paste into a new Claude Code session: **"Do Step 8 using docs/prompts/Step8_android_app.md"**, and say which step
> (A–F, section 4) to work on.

## 1. Working rules (strict)

1. **Nothing without the owner's approval.** Every design, text, decision and action is proposed first and waits for
   "approved". Then only that step is done. A bug found on the way is reported with a proposed fix, then the session
   waits.
2. **No Capacitor.** No version of it, and none of its plugins or tools.
3. **The app is a WebView.** It is built the same way as the owner's KAJ app: one Android screen, the web game inside
   a WebView, every file inside the app (section 2).
4. **The owner builds the app** in Android Studio on Windows, and runs every command on his own PC. The session writes
   the code and gives each command as a Command Prompt line, with one plain sentence on what it does.
5. **The game stays as it is.** The rules engine, the board files and the approved look don't change. The web version
   on GitHub Pages must keep working exactly as before. A change to the web code is allowed only when the app needs
   it, and only after approval.
6. **Never anything secret on GitHub:** no signing key, no passwords.
7. **No GitHub Actions for Android.**
8. **The app asks for nothing (owner, 16 Oct): no permission at all**, not internet, not vibration, not anything
   else. If a part of the game would need a permission, that part is removed from the app. Privacy follows the KAJ
   app's example in everything.
9. **Git (D5):** the session pushes only after the owner's "approved" for that step, then opens a pull request; the
   owner merges.

## 2. How the KAJ app works, and what carries over

The owner's KAJ app (`com.kaj.game`, its `MainActivity` shown to the session on 16 Oct) is the model:

| KAJ `MainActivity` | For *Don't Get Mad!* |
|---|---|
| The web build is put inside the app (`assets/`) and served from `https://appassets.androidplatform.net/assets/index.html` by `WebViewAssetLoader` (`androidx.webkit`), in a `ComponentActivity` | Same. The game already loads its files by relative paths (`base: "./"`), and its security rule "only the game's own files" works with that address. So it plays fully offline, and its saved data has one fixed home. |
| JavaScript and storage on; file and content access off; no bridge to the phone; every other web address blocked | Same. The game needs JavaScript, and it saves the game, postcards, sound choice and guide on the device. |
| Back button → `window.kajBack()` in the page; if the page doesn't take it, the app closes | Same idea with `window.dgmBack()`: on the game screen it opens the existing **"Leave this game?"** popup (owner, 16 Oct). On the start screen, the app closes. Needs a small addition to the web code (Step B). |
| `kaj://leave` closes the app | Not needed: Leave in this game goes back to the start screen. |
| Full screen, bars hidden (a swipe shows them for a moment), camera cut-out passed to the page (`--cut-*`) | Same (D6). |
| Web engine stopped by Android (low memory) → the game opens again | Same. The start screen then offers "Continue game", which already exists. |
| App paused or phone locked → `webView.onPause()`, so the page goes quiet | Same. The game already goes silent when it is hidden. |
| Background colour while loading | The game's ink purple `#4b2377` (D7). |

What the web game must not do inside the app (Step B):
- **Register its offline worker:** all the files are already on the phone, and the worker could keep an old version.
- **Vibrate:** vibration needs a permission, so it is removed from the app (rule 8). The web version keeps it.
- **Open outside links inside the app:** the links on the copyright and privacy pages (GitHub, Google) open in the
  phone's browser (D8).

## 3. The owner's decisions (16 Oct 2026)

| # | Question | Decision |
|---|---|---|
| D1 | App ID (permanent after the first upload) | **`com.dontgetmad.game`** |
| D2 | App name on the phone | **"Don’t Get Mad"** (no exclamation mark) |
| D3 | Android versions | Target / compile the level Google Play requires now (checked on the day of building). Lowest Android version as in KAJ |
| D4 | Where the Android Studio project lives | In this repository, folder `android/`, so every session sees the same code. The owner builds from it on his PC |
| D5 | Who puts code on GitHub | The session pushes only after the owner's "approved" for that step, then opens a pull request; the owner merges |
| D6 | Screen edges | As in KAJ: full screen, bars hidden, a swipe shows them for a moment. The page keeps its buttons clear of the camera cut-out |
| D7 | Loading colour | The game's ink purple `#4b2377` |
| D8 | Links on the copyright and privacy pages | Open in the phone's browser. **The app never asks for online access or any other access.** Giving internet access when opening a link is the user's own choice |
| D9 | Permissions | **None. If any permission is required, that part is removed** (rule 8) |
| D10 | Backup | Off, following the same method as KAJ. `privacy.html` promises saved data never leaves the device. No outside access; for everything on privacy, follow the KAJ example |
| D11 | App icon | **The owner's own picture** (a robot runner on a winding numbered road to a crown, on marble), given in the chat on 16 Oct. It is added to the repository and shown on the phone's icon shapes (round, square, squircle) for approval before it is built in (Step C) |

## 4. Steps (each one stops for the owner's approval)

- **Step A: the decisions.** ✅ Done (section 3).
- **Step B: the small web changes the app needs.** They work only inside the app; the web version stays exactly the
  same:
  - `window.dgmBack()`;
  - no offline worker in the app;
  - no vibration in the app;
  - the camera cut-out edges (D6);
  - outside links to the phone's browser (D8).

  Screenshots first, then the code, then all the existing checks (`npm run typecheck`, `npm test`, `npm run build`,
  `npm run test:browser`). If a text in `privacy.html` must change (for example about vibration in the app), it is
  proposed first.
- **Step C: the Android project in `android/`.** `MainActivity.java` (KAJ's, adapted as in section 2), the manifest
  with no permissions (D9) and backup as in KAJ (D10), the colours, the name (D2), the icon (D11, shown first). Plus
  one command that builds the game and copies it into the app, like KAJ's `npm run android:assets`. The session asks
  the owner for the KAJ app's `AndroidManifest.xml` and Gradle files, so the privacy and backup settings are exactly
  KAJ's.
- **Step D: the owner builds it.** A guide with every Command Prompt line: get the project; copy the game in; open it
  in Android Studio; make the signing key once and back it up (outside the project folder); build the signed APK;
  install it on the Galaxy S25.
- **Step E: the phone test.** A short checklist: a whole game, upright and sideways; Back (popup closes / "Leave this
  game?" / the app closes on the start screen); sound and music; switching away and back; airplane mode; leaving and
  continuing a game; the copyright and privacy pages, and their links opening the browser. The owner reports back;
  only approved fixes are made.
- **Step F: Google Play** (later): the App Bundle, Play App Signing, the store texts for approval.

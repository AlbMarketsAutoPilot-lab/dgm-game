# The Android app: how to make it on your own computer (Windows)

*Don't Get Mad!* for Android is the same game as the web version, packed into an app with **Capacitor**. You make the
app yourself, in **Android Studio**, and sign it with **your own key**. Nobody else ever sees the key.

Every command below is one line to copy into **Command Prompt** (press the Windows key, type `cmd`, press Enter).
Paste a line with a right-click in the Command Prompt window, then press Enter.

What the app is (decided 16 Oct 2026): app ID `al.connect.dontgetmad` (it can never change after the first upload to
Google Play), name "Don't Get Mad!", Android 7.0 or newer, built for Android 16 (API 36, what Google Play requires).
Its only permission is **vibration**. It has **no internet permission** and makes **no backup** of the saved game,
as the privacy policy promises.

---

## 1. One-time setup

Install these three programs (the free versions, all default choices in the installers are fine):

| Program | Where | Check that it works (in a new Command Prompt) |
|---|---|---|
| **Git** | https://git-scm.com/download/win | `git --version` prints a version |
| **Node.js**, the **LTS** version | https://nodejs.org | `node --version` prints a version |
| **Android Studio**, the current version | https://developer.android.com/studio | it opens and shows "Welcome to Android Studio" |

The first time Android Studio opens, choose **Standard** setup and let it download what it wants (a few GB).

Then check the Android 16 tools are there: in the Welcome window **More Actions → SDK Manager** (or, with a project
open, **Tools → SDK Manager**), tab **SDK Platforms**: **Android 16 ("Baklava", API 36)** must be ticked. If it is not, tick
it and press **OK**.

Java: you need nothing extra. Android Studio brings its own (JDK 21), and the project uses it.

## 2. Get the project (once)

Make a folder for it in your Documents and copy the project there:

```
cd %USERPROFILE%\Documents
```

```
git clone https://github.com/AlbMarketsAutoPilot-lab/dgm-game.git
```

(If Git asks you to sign in, sign in with your GitHub account in the window that opens.)

Go into the project folder:

```
cd %USERPROFILE%\Documents\dgm-game
```

Install what the project needs (a few minutes the first time):

```
npm ci
```

## 3. Make the app

In the project folder (`cd %USERPROFILE%\Documents\dgm-game` first, if you opened a new Command Prompt):

```
npm run android
```

This builds the game, copies it into the `android` folder and opens that folder in Android Studio. If Android
Studio does not open by itself, the command prints the folder: open Android Studio, **File → Open**, pick
`Documents\dgm-game\android`, press **OK**.

**The first time**, Android Studio "syncs" the project: it downloads the build tools (Gradle) from Google. This takes
**5 to 15 minutes**. Wait until the bar at the bottom of the window stops moving and says nothing more is running
(the **Build** tab at the bottom shows "BUILD SUCCESSFUL" or "Sync finished"). If it asks "Trust Gradle project?",
choose **Trust Project**. If it offers to "upgrade" the Android Gradle Plugin, choose **Don't ask again for this
project** (the version is chosen on purpose).

## 4. Your key (once, very important)

Google Play and your phone know the app by the key it is signed with. **Every new version must be signed with the
same key.**

1. In Android Studio: **Build → Generate Signed App Bundle or APK…**
2. Choose **APK**, press **Next**.
3. Under "Key store path" press **Create new…** and fill in:
   - **Key store path**: a folder **outside the project**, for example `C:\Users\<you>\Documents\keys\dontgetmad.jks`
     (make the `keys` folder first in File Explorer).
   - **Password** and **Confirm**: a strong password for the key file.
   - **Alias**: `upload`
   - **Password** under Key (and Confirm): a second strong password (it may be the same as the first).
   - **Validity (years)**: `25` (the default) or more.
   - **First and Last Name**: your name; **Organization**: `Connect AL`; **Country Code**: `AL`. The rest may stay empty.
4. Press **OK**. Android Studio fills in the key for you.

**Back up the key now**, in **two safe places** (for example a USB stick kept at home and your own cloud drive or
password manager): the file `dontgetmad.jks` **and** both passwords and the alias `upload`.
If the key is lost, Google Play needs a key reset request, which takes days.

**Never** put the key file in the `dgm-game` folder, never send it by email, never upload it to GitHub. (The project
refuses to save key files to GitHub anyway, but keep it outside the project folder.)

## 5. Build the APK and put it on your phone

1. **Build → Generate Signed App Bundle or APK…** → **APK** → **Next**.
2. Your key file, both passwords and the alias `upload` are filled in (tick **Remember passwords** if you like) →
   **Next**.
3. Choose **release** → **Create**.
4. After a minute a note appears bottom right: "APK(s) generated successfully". Press **locate**. The file is
   `Documents\dgm-game\android\app\release\app-release.apk`.

Copy it to your **Samsung Galaxy S25**, one of two ways:

- **USB cable**: connect the phone, on the phone allow "File transfer", then in File Explorer copy `app-release.apk`
  into the phone's **Download** folder.
- **Your own Google Drive**: upload the file, then on the phone open it in the Drive app and download it.

Install it on the phone:

1. Open **My Files** → **Downloads** (or Drive), tap `app-release.apk`.
2. The first time the phone says it cannot install apps from this source: tap **Settings**, switch on **Allow from
   this source**, go back.
3. Tap **Install**. If Google Play Protect asks, tap **More details → Install anyway** (the app is yours, it is not on
   Google Play yet).
4. Tap **Open**. The icon "Don't Get Mad!" is now in your apps.

## 6. What to check on the phone

Tick each one, and tell me what is not right (a screenshot helps: press **side key + volume down** together).

- [ ] The start screen fits, upright **and** sideways (turn the phone).
- [ ] A whole game, to the winner.
- [ ] **Back** (the Back button, or a swipe from the left or right edge): a popup closes; the postcard album and "How
      to play" close; on the game screen it asks **"Leave this game?"** (Back again = Stay); on the start screen the
      app closes.
- [ ] Sound, music and vibration, each switch on and off (vibration comes with the sound switch, for example on a 6).
- [ ] Leave a game, then **Continue game** on the start screen: the game comes back.
- [ ] Switch to another app (or lock the screen) during the game: **silent while away**; back in the game: sound again.
- [ ] **Airplane mode** on: open the app and play a whole game. Everything works.
- [ ] On the start screen, **Copyright** and **Privacy** open, and "Back to the game" (or Back) brings you back.
- [ ] The links on those pages (GitHub, Google) open in the phone's browser.
- [ ] **Large font**: Settings → Display → Font size and style → font size at the biggest; the game is still usable.
- [ ] The notes under the picture ("Blue ▼ Roll a 2: back to Start") and the "what's ahead" notice show as on the web.
- [ ] The status bar (clock, battery) and the navigation bar at the bottom **never cover a button**, upright and
      sideways (also with Settings → Display → Navigation bar → **Buttons** instead of **Swipe gestures**).

## 7. Each new version

In the project folder, get the newest project:

```
cd %USERPROFILE%\Documents\dgm-game
```

```
git pull
```

```
npm ci
```

Give it a new version number (higher than the last one; this also raises the hidden "version code" by 1, which Google
Play needs for every upload):

```
npm run android:version 1.0.1
```

Make the app again:

```
npm run android
```

Then build it as in step 5, **with the same key**. On the phone, install the new APK over the old one (your saved game
stays).

Then save the new number on GitHub right away, so the next version follows from it and the next `git pull` works:

```
git commit -am "Version 1.0.1" && git push
```

(The very first time, Git asks who you are. Tell it once, with your own name and email, then run the line above again:
`git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`.)

## 8. Google Play, later (the details come with the store listing)

- For Google Play you build an **Android App Bundle** (`.aab`) instead of an APK: same wizard, choose **Android App
  Bundle**, same key. The file lands in `Documents\dgm-game\android\app\release\app-release.aab`.
- In the Play Console, turn on **Play App Signing**: Google keeps the key that signs the app for the phones; your key
  becomes the **upload key**.
- Upload first to a **testing track**. A **personal** developer account created after 13 November 2023 must run a
  **closed test with at least 12 testers for 14 days in a row** before it can publish to everyone.

## 9. When something goes wrong

| What you see | What to do |
|---|---|
| `'git' is not recognized` or `'npm' is not recognized` | Close Command Prompt and open a new one (needed after installing). Still there: install Git or Node.js again (step 1). |
| `npm ci` fails | Check `node --version` works. Then run `npm ci` again (the internet may have dropped). |
| **Gradle sync failed** in Android Studio | **File → Sync Project with Gradle Files**. Still failing: **File → Invalidate Caches… → Invalidate and Restart**. Send me the red text from the **Build** tab. |
| "Unsupported Java" / "requires Java 21" | **File → Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK**: choose the one called **jbr-21** (Android Studio's own) → **OK**, then sync again. |
| "Failed to find target android-36" / "SDK Platform 36 missing" | **Tools → SDK Manager → SDK Platforms**: tick **Android 16 (API 36)** → **OK**, then sync again. |
| "SDK location not found" | Open the `android` folder with **File → Open** in Android Studio once (it writes the location itself). |
| On the phone: **"App not installed"** | An older copy of the app signed with another key is on the phone: uninstall "Don't Get Mad!" (long-press the icon → **Uninstall**), then install again. (This deletes the saved game on the phone.) |
| On the phone: install blocked, "Auto Blocker" | Settings → Security and privacy → **Auto Blocker** → off, install, then switch it on again. |
| Google Play: **"Version code 1 has already been used"** | Run `npm run android:version` with a higher number (step 7), build again, upload the new file. |
| Google Play: "signed with the wrong key" | Use the same key file as the first upload (step 4). Lost: in the Play Console, **Setup → App signing → Request upload key reset**. |
| Android Studio did not open after `npm run android` | Open it yourself: **File → Open** → `Documents\dgm-game\android`. |

## For developers

- `npm run android:sync`: web build + copy into `android/` (no Android Studio). `npm run android:version X.Y.Z`:
  `package.json` `version` (→ `versionName`) and `android/version-code.txt` (→ `versionCode`, +1).
- The app-only code is `src/ui/native.ts`, behind `inApp()` (Capacitor's bridge in the page): the Back button
  (`@capacitor/app`), quiet in the background; the offline worker is not registered in the app (`src/main.ts`).
  The screen edges: `--sa-*` in `src/ui/app.css` (Capacitor's `--safe-area-inset-*`, else the browser's `env()`).
- The icon files are made by `python3 tools/android/icons.py` from `public/icons/icon-maskable-512.png`.
- Plugins in the app: `@capacitor/core`, `@capacitor/android`, `@capacitor/app` (MIT). No analytics, ads, crash
  reporting, Firebase or Google services.

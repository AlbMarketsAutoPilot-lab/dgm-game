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
| D10 | Backup | **As KAJ: `android:allowBackup="true"`** (owner, 16 Oct: "do as KAJ, change privacy"). `privacy.html` is changed to say so; its new text is approved by the owner before it is built. No outside access; for everything on privacy, follow the KAJ example |
| D11 | App icon | **The owner's own picture** (a robot runner on a winding numbered road to a crown, on marble), given in the chat on 16 Oct. It is added to the repository and shown on the phone's icon shapes (round, square, squircle) for approval before it is built in (Step C) |
| D12 | Orientation | **Both, upright and sideways** (owner, 16 Oct): the game is built and tested for both. Unlike KAJ, which is locked sideways (`sensorLandscape`) |
| D13 | Back button | **As KAJ** (owner, 16 Oct): on the game screen it shows the existing "Leave this game?" popup, the same as the Leave button on the web. On the start screen the app closes |

## 4. Steps (each one stops for the owner's approval)

- **Step A: the decisions.** ✅ Done (section 3).
- **Step B: the small web changes the app needs.** They work only inside the app; the web version stays exactly the
  same. Approved by the owner on 16 Oct (B2–B6; B1 waits for the owner's answer):
  - B1: how the page knows it is inside the app;
  - B2: `window.dgmBack()` (D13);
  - B3: no offline worker in the app;
  - B4: no vibration in the app. The sound popup's text in the app becomes "Sound effects and quiet music under the
    game. Saved on this device." (owner's approved text);
  - B5: the camera cut-out (D6): the app tells the page its size (`--cut-l`, `--cut-t`, `--cut-r`, `--cut-b`, as in
    KAJ); on the web it is 0, so nothing moves;
  - B6: `privacy.html` §5 becomes (owner's approved text): "In the web version on phones, when the sound switch is on,
    the game can make the phone vibrate briefly at exciting moments (for example a 6 or a win); this uses no personal
    information and is off when sound is off. The Android app never vibrates: it asks for no permissions at all." The
    backup text (D10) is added once the owner approves its wording.

  The outside links (D8) need no web change: the app opens them in the phone's browser (Step C), and Back on the
  copyright and privacy pages returns to the game. Then all the existing checks (`npm run typecheck`, `npm test`,
  `npm run build`, `npm run test:browser`).
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

## 5. The KAJ app's files (given by the owner on 16 Oct, the model for Step C)

Copied as the owner gave them. For *Don't Get Mad!* only the decisions in section 3 differ (app ID, name, orientation;
versions checked on the day of building, D3).

`AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- No permissions: the game is fully offline. -->
    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:appCategory="game"
        android:allowBackup="true"
        android:theme="@style/Theme.KAJ">
        <!-- configChanges: turning the phone must not restart the game. -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="sensorLandscape"
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboardHidden|uiMode">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

`app/build.gradle.kts`:

```kotlin
plugins {
    id("com.android.application")
}

android {
    namespace = "com.kaj.game"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.kaj.game"
        minSdk = 24 // Android 7.0
        targetSdk = 36
        versionCode = 3 // 1: first review; 2: internal test of 1.0.0
        versionName = "1.0.1"
    }

    // R8 shrinks the Java part (owner, 2026-10-14, Play Console's advice); the game itself is the
    // web page in assets, which R8 does not touch. Upload the mapping file Play asks for.
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.activity:activity:1.10.1")
    implementation("androidx.webkit:webkit:1.17.1")
}
```

Project `build.gradle.kts`:

```kotlin
plugins {
    id("com.android.application") version "8.10.1" apply false
}
```

The KAJ `MainActivity.java` is described in section 2 (one WebView, `WebViewAssetLoader` on
`https://appassets.androidplatform.net/assets/index.html`, `window.kajBack()`, cut-out sizes as `--cut-*`, bars hidden,
`onRenderProcessGone`, `onPause` / `onResume`).

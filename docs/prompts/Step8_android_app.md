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
  same. Approved by the owner on 16 Oct (B1–B6). **Built** (`src/ui/android.ts`, `test/android.test.ts`):
  - B1: how the page knows it is inside the app: its address `appassets.androidplatform.net`, the same as KAJ
    (owner: "do the same as KAJ");
  - B2: `window.dgmBack()` (D13): returns `true` when the page showed "Leave this game?", `false` when the app
    should close;
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

`MainActivity.java` (the owner's KAJ app, given on 16 Oct):

```java
package com.kaj.game;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.DisplayCutout;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.webkit.WebViewAssetLoader;

import java.util.Locale;

// One screen: the game (assets/index.html, built from the web code) inside a WebView.
// Files are served from the APK on a fixed https address, so the game works offline
// and its saved games (localStorage) stay in one place.
public class MainActivity extends ComponentActivity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/index.html";
    // The game's "Leave" button opens this address; the app then closes (owner, 2026-10-10).
    private static final String LEAVE_URL = "kaj://leave";
    // The game's background colour (style.css), shown while the game loads (audit U1).
    private static final int BACKGROUND = Color.rgb(0x0a, 0x3a, 0x40);

    private WebViewAssetLoader loader;
    private WebView webView;
    // The camera cut-out in screen points (CSS px): the page keeps its buttons out of it (audit U2).
    private int cutLeft, cutTop, cutRight, cutBottom;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        // Full screen (owner's request, task 14 B1): the game also uses the camera cut-out area.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attrs = getWindow().getAttributes();
            attrs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attrs);
        }
        showGame(savedInstanceState);
        hideSystemBars();

        // Back button and back gesture, on every Android version: ask before leaving the game (audit C1).
        // The game asks in its own popup (owner, 2026-10-10): Android's box looked out of place and
        // made the map shake. If the game has not loaded yet, the app closes at once.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView == null) {
                    finish();
                    return;
                }
                webView.evaluateJavascript("window.kajBack ? (window.kajBack(), 1) : 0", result -> {
                    if (!"1".equals(result)) finish();
                });
            }
        });
    }

    // Builds the web view and opens the game; again after the web engine was stopped (audit C2).
    // Reviewed (audit S1): the game needs JavaScript. It runs only its own file from the app, has no
    // text input and no bridge to the phone, and every other address is blocked.
    @SuppressLint("SetJavaScriptEnabled")
    private void showGame(Bundle savedInstanceState) {
        webView = new WebView(this);
        webView.setBackgroundColor(BACKGROUND);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        webView.setWebViewClient(new GameClient());
        webView.setOnApplyWindowInsetsListener((v, insets) -> {
            readCutout(insets);
            return v.onApplyWindowInsets(insets);
        });
        setContentView(webView);
        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(START_URL);
        }
    }

    private class GameClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(@NonNull WebView view, @NonNull WebResourceRequest request) {
            return loader.shouldInterceptRequest(request.getUrl());
        }

        // The game never leaves the app; its "Leave" button closes the app.
        @Override
        public boolean shouldOverrideUrlLoading(@NonNull WebView view, @NonNull WebResourceRequest request) {
            if (LEAVE_URL.equals(request.getUrl().toString())) {
                finish();
                return true;
            }
            return !HOST.equals(request.getUrl().getHost());
        }

        @Override
        public void onPageFinished(@NonNull WebView view, @NonNull String url) {
            sendCutout();
        }

        // Android stopped the web engine (low memory or a crash): open the game again instead of
        // closing the app. The start screen then offers to continue the saved game.
        @Override
        @RequiresApi(Build.VERSION_CODES.O)
        public boolean onRenderProcessGone(@NonNull WebView view, @NonNull RenderProcessGoneDetail detail) {
            if (view == webView) {
                removeWebView();
                showGame(null);
                hideSystemBars();
            }
            return true;
        }
    }

    private void removeWebView() {
        if (webView == null) return;
        if (webView.getParent() instanceof ViewGroup) ((ViewGroup) webView.getParent()).removeView(webView);
        webView.destroy();
        webView = null;
    }

    private void readCutout(WindowInsets insets) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) return;
        DisplayCutout cut = insets.getDisplayCutout();
        float dp = getResources().getDisplayMetrics().density;
        int l = cut == null ? 0 : Math.round(cut.getSafeInsetLeft() / dp);
        int t = cut == null ? 0 : Math.round(cut.getSafeInsetTop() / dp);
        int r = cut == null ? 0 : Math.round(cut.getSafeInsetRight() / dp);
        int b = cut == null ? 0 : Math.round(cut.getSafeInsetBottom() / dp);
        if (l == cutLeft && t == cutTop && r == cutRight && b == cutBottom) return;
        cutLeft = l;
        cutTop = t;
        cutRight = r;
        cutBottom = b;
        sendCutout();
    }

    // Tells the page the size of the camera cut-out (style.css: --cut-l, --cut-t, --cut-r, --cut-b).
    private void sendCutout() {
        if (webView == null) return;
        webView.evaluateJavascript(String.format(Locale.ROOT,
                "(function(s){s.setProperty('--cut-l','%dpx');s.setProperty('--cut-t','%dpx');"
                        + "s.setProperty('--cut-r','%dpx');s.setProperty('--cut-b','%dpx');})"
                        + "(document.documentElement.style)",
                cutLeft, cutTop, cutRight, cutBottom), null);
    }

    // Clock, notifications and the back/home bar stay hidden; a swipe from the edge shows them
    // for a moment, then they hide again.
    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController bars = getWindow().getInsetsController();
            if (bars != null) {
                bars.hide(WindowInsets.Type.systemBars());
                bars.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            hideSystemBarsBeforeAndroid11();
        }
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBarsBeforeAndroid11() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    // Leaving the app or locking the phone pauses the game page; the page then pauses its music
    // and sounds (audit C3).
    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        removeWebView();
        super.onDestroy();
    }
}
```

What Step C changes for *Don't Get Mad!* (everything else as KAJ; each point is in section 3 or Step B):

- package and app ID `com.dontgetmad.game` (D1), name "Don’t Get Mad" (D2), loading colour `#4b2377` (D7);
- the Back button calls `window.dgmBack ? (window.dgmBack() ? 1 : 0) : 0`: `1` = the page showed "Leave this game?";
  `0` = the app closes (D13). On the copyright and privacy pages (no `dgmBack`), Back first returns to the game page;
- no `kaj://leave`: Leave in this game goes back to the start screen;
- outside links (D8): instead of only blocking them, the app hands them to the phone's browser; the app itself still
  loads nothing from outside and asks for no permission;
- the manifest: no permissions (D9), `allowBackup="true"` as KAJ (D10), both orientations instead of
  `sensorLandscape` (D12);
- the game's files: `npm run build` makes `dist/`, which goes into the app's `assets/` (one command, like KAJ's
  `npm run android:assets`), so the start address is `https://appassets.androidplatform.net/assets/index.html`.

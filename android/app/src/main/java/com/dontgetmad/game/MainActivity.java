package com.dontgetmad.game;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
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

// One screen: the game (assets/index.html, built from the web code by "npm run android:assets") inside a WebView,
// built like the owner's KAJ app (docs/prompts/Step8_android_app.md). Files are served from the APK on a fixed https
// address, so the game works offline and its saved games (localStorage) stay in one place.
public class MainActivity extends ComponentActivity {
    // The game knows it is inside the app by this address (src/ui/android.ts, APP_HOST).
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/index.html";
    // "Back to the game" on the copyright and privacy pages opens the game's folder ("./"); the app serves files
    // only, so the folder opens the game (index.html).
    private static final String FOLDER = "/assets/";
    // The game's ink purple (D7), shown while the game loads.
    private static final int BACKGROUND = Color.rgb(0x4b, 0x23, 0x77);

    private WebViewAssetLoader loader;
    private WebView webView;
    // The camera cut-out in screen points (CSS px): the page keeps its buttons out of it (D6, B5).
    private int cutLeft, cutTop, cutRight, cutBottom;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loader = new WebViewAssetLoader.Builder()
                .addPathHandler(FOLDER, new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        // Full screen (D6): the game also uses the camera cut-out area.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attrs = getWindow().getAttributes();
            attrs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attrs);
        }
        showGame(savedInstanceState);
        hideSystemBars();

        // Back button and back gesture, on every Android version (D13): on the game screen the game shows its own
        // "Leave this game?" popup (window.dgmBack() is true); on the start screen the app closes. On the copyright
        // and privacy pages (no dgmBack) Back returns to the game. If the game has not loaded yet, the app closes.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView == null) {
                    finish();
                    return;
                }
                webView.evaluateJavascript("window.dgmBack ? (window.dgmBack() ? 1 : 0) : -1", result -> {
                    if ("1".equals(result)) return;
                    if ("-1".equals(result) && webView != null && webView.canGoBack()) webView.goBack();
                    else finish();
                });
            }
        });
    }

    // Builds the web view and opens the game; again after the web engine was stopped.
    // The game needs JavaScript. It runs only its own files from the app, has no text input and no bridge to the
    // phone, and loads nothing from other addresses.
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
            Uri url = request.getUrl();
            if (HOST.equals(url.getHost()) && FOLDER.equals(url.getPath())) url = Uri.parse(START_URL);
            return loader.shouldInterceptRequest(url);
        }

        // The game's own pages open inside the app. Outside links (GitHub, Google on the copyright and privacy
        // pages) open in the phone's browser (D8): the app itself loads nothing from outside and asks for no
        // permission.
        @Override
        public boolean shouldOverrideUrlLoading(@NonNull WebView view, @NonNull WebResourceRequest request) {
            Uri url = request.getUrl();
            if (HOST.equals(url.getHost())) return false;
            if (request.isForMainFrame() && ("https".equals(url.getScheme()) || "http".equals(url.getScheme()))) {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, url).addCategory(Intent.CATEGORY_BROWSABLE));
                } catch (ActivityNotFoundException e) {
                    // No browser on the phone: the link does nothing.
                }
            }
            return true;
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

    // Tells the page the size of the camera cut-out (app.css: --cut-l, --cut-t, --cut-r, --cut-b).
    private void sendCutout() {
        if (webView == null) return;
        webView.evaluateJavascript(String.format(Locale.ROOT,
                "(function(s){s.setProperty('--cut-l','%dpx');s.setProperty('--cut-t','%dpx');"
                        + "s.setProperty('--cut-r','%dpx');s.setProperty('--cut-b','%dpx');})"
                        + "(document.documentElement.style)",
                cutLeft, cutTop, cutRight, cutBottom), null);
    }

    // Clock, notifications and the back/home bar stay hidden; a swipe from the edge shows them
    // for a moment, then they hide again (D6).
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

    // Leaving the app or locking the phone pauses the game page; the page then pauses its music and sounds.
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

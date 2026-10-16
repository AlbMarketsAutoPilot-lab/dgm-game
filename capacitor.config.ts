// The Android app (Step 8, owner approved 16 Oct 2026): the same web game, wrapped by Capacitor. The game's files are
// on the phone (`dist`, copied in by `npm run android:sync`); nothing is loaded from the internet.
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "al.connect.dontgetmad", // A1: permanent, can never change after the first upload to Google Play
  appName: "Don't Get Mad!",
  webDir: "dist",
  backgroundColor: "#4b2377",
  android: {
    // Release builds cannot be inspected from a computer; debug builds can (Capacitor's default)
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    // A10: Android 15+ draws the app edge to edge; Capacitor gives the page the real insets as --safe-area-inset-*
    // (app.css uses them, with env() for the web). Dark icons on the game's light table colour.
    SystemBars: { insetsHandling: "css", initialViewportFitValueHint: "cover", style: "LIGHT" },
  },
};

export default config;

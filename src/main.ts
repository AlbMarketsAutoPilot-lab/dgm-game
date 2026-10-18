// The app: start screen → game screen → "Play again" or a new game.
import "@fontsource/patrick-hand";
import "./ui/app.css";
import { GameScreen, type Setup } from "./ui/app";
import type { SavedGame } from "./ui/save";
import { guideSeen, showGuide } from "./ui/guide";
import { showSetup } from "./ui/setup";
import { back, inApp } from "./ui/android";
import { startWindowsApp, windowsApp } from "./ui/windows";

const root = document.querySelector<HTMLElement>("#app")!;
let last: Setup | null = null;

/** A new game, or a saved one continued (U1). */
function play(s: Setup, resume?: SavedGame): void {
  last = s;
  new GameScreen(root, s, (again) => (again ? play(s) : menu()), resume);
}

function menu(): void {
  showSetup(root, last, play);
}

// The first time on this device: the short "How to play" guide, then the start screen.
document.fonts.load('100px "Patrick Hand"').finally(() => (guideSeen() ? menu() : void showGuide().then(menu)));

// The Android app (Step 8): its Back button asks the page first (B2). Not on the web.
if (inApp()) (window as Window & { dgmBack?: () => boolean }).dgmBack = () => back();

// The Windows app: Esc works like the Android Back button, F11 is full screen. Not on the web or Android.
const windows = windowsApp();
if (windows) startWindowsApp(windows);

// Offline (Step 7): only in the built game, so development always shows the latest code. Works without it too.
// Not in the Android or Windows app (B3): its files are already on the device, and a worker could keep an old version.
if (import.meta.env.PROD && "serviceWorker" in navigator && !inApp() && !windows) {
  navigator.serviceWorker.register("./sw.js").then(() => navigator.serviceWorker.ready).then((r) => {
    const files = performance.getEntriesByType("resource").map((e) => e.name).filter((u) => u.startsWith(location.origin));
    r.active?.postMessage({ cache: files });
  }).catch(() => {});
}

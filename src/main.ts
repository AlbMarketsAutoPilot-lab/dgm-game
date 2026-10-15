// The app: start screen → game screen → "Play again" or a new game.
import "@fontsource/patrick-hand";
import "./ui/app.css";
import { GameScreen, type Setup } from "./ui/app";
import { showSetup } from "./ui/setup";

const root = document.querySelector<HTMLElement>("#app")!;
let last: Setup | null = null;

function play(s: Setup): void {
  last = s;
  new GameScreen(root, s, (again) => (again ? play(s) : menu()));
}

function menu(): void {
  showSetup(root, last, play);
}

document.fonts.load('100px "Patrick Hand"').finally(menu);

// Offline (Step 7): only in the built game, so development always shows the latest code. Works without it too.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(() => navigator.serviceWorker.ready).then((r) => {
    const files = performance.getEntriesByType("resource").map((e) => e.name).filter((u) => u.startsWith(location.origin));
    r.active?.postMessage({ cache: files });
  }).catch(() => {});
}

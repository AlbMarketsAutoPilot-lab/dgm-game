// The Android app only (Step 8, owner approved 16 Oct 2026). Everything here sits behind one check, `inApp()`, so the
// web version is unchanged: in a browser nothing below runs and the app's plugin is never even loaded.
// A8: the Android Back button (or back gesture) closes whatever is on top, exactly like Escape (a popup, the postcard
// album, the guide); on the game screen it asks "Leave this game?", like the Leave button; on the start screen it
// leaves the app. A game is never lost: it is saved after every turn.
// A12: quiet while the app is in the background, back on return.
import type { PluginListenerHandle } from "@capacitor/core";

/** Whether the game runs inside the Android app (Capacitor puts its bridge in the page before the game starts). */
export function inApp(): boolean {
  const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

/** What the Back button does; false when nothing in the page took it (the start screen: the app is left). */
export function back(): boolean {
  const esc = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  document.dispatchEvent(esc);
  if (esc.defaultPrevented) return true; // a popup, the album or the guide closed itself
  const leave = document.querySelector<HTMLButtonElement>(".game .leave");
  if (leave) { leave.click(); return true; } // the same "Leave this game?" popup as the Leave button
  return !document.querySelector(".setup"); // anything else (the guide before the first start screen): stays
}

/** Starts the app-only behaviour. Does nothing on the web. `quiet(true)`: the app went to the background. */
export async function startApp(quiet: (away: boolean) => void): Promise<boolean> {
  if (!inApp()) return false;
  const { App } = await import("@capacitor/app");
  const handles: PluginListenerHandle[] = await Promise.all([
    App.addListener("backButton", () => { if (!back()) void App.exitApp(); }),
    App.addListener("appStateChange", ({ isActive }) => quiet(!isActive)),
  ]);
  return handles.length > 0;
}

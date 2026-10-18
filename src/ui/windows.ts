// The Windows app (windows/DGM, owner approved 18 Oct 2026). As in the owner's KAJ app, it shows the game's own files
// in WebView2, which gives the page `chrome.webview` to talk to the app: that is how the game knows it is inside it.
// Only there do these parts run, so the web version and the Android app stay exactly as they are.
import { back } from "./android";

/** What the page uses of WebView2: sending a message to the app (GameWindow.cs, OnGameMessage). */
export type AppView = { postMessage(message: string): void };

/** The app's WebView2, or undefined outside the Windows app. */
export const windowsApp = (w: Window = window): AppView | undefined =>
  (w as Window & { chrome?: { webview?: AppView } }).chrome?.webview;

/**
 * Esc works like the Android Back button: on the game screen it shows "Leave this game?", on the start screen it closes
 * the app (owner, 18 Oct). A popup, the guide or the postcards take Esc first, as they always do (they prevent its
 * default, and they listen on the document, before the window). F11 switches full screen.
 */
export function onWindowsKey(e: Pick<KeyboardEvent, "key" | "defaultPrevented" | "preventDefault">, view: AppView,
  doc: Pick<Document, "querySelector"> = document): void {
  if (e.defaultPrevented) return;
  if (e.key === "Escape") { if (!back(doc)) view.postMessage("leave"); }
  else if (e.key === "F11") view.postMessage("fullscreen");
  else return;
  e.preventDefault();
}

/** Inside the Windows app: the keys above, and no text selection (app.css, .windows-app). */
export function startWindowsApp(view: AppView): void {
  document.documentElement.classList.add("windows-app");
  window.addEventListener("keydown", (e) => onWindowsKey(e, view));
}

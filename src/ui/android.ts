// The Android app (Step 8, docs/prompts/Step8_android_app.md, owner approved 16 Oct 2026). As in the owner's KAJ app, the
// app serves the game's own files from inside the APK at https://appassets.androidplatform.net/assets/index.html, so it
// needs no internet and no permission. That address is how the game knows it is inside the app (B1): only there do the
// app-only parts run, so the web version stays exactly as it is.

/** The address the app serves the game from (MainActivity, `WebViewAssetLoader`). */
export const APP_HOST = "appassets.androidplatform.net";

/** Whether the game runs inside the Android app. */
export const inApp = (host: string = location.hostname): boolean => host === APP_HOST;

/**
 * B2, the Android Back button (owner: as in KAJ). The app calls `window.dgmBack()`: on the game screen it shows the
 * existing "Leave this game?" popup, the same as the Leave button (true: the page took it); anywhere else the page does
 * not take it (false) and the app closes.
 */
export function back(doc: Pick<Document, "querySelector"> = document): boolean {
  const leave = doc.querySelector<HTMLButtonElement>(".game .leave");
  if (!leave) return false;
  if (!doc.querySelector('.pop[aria-label="Leave this game?"]:not([hidden])')) leave.click(); // already shown: once is enough
  return true;
}

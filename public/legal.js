// The Copyright and Privacy pages inside the Windows app (src/ui/windows.ts): Esc goes back to the game, as the
// Android Back button does there, and F11 is full screen. On the web and in the Android app this does nothing.
const view = window.chrome && window.chrome.webview;
if (view) {
  document.documentElement.style.userSelect = "none";
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") location.href = "./index.html";
    else if (e.key === "F11") view.postMessage("fullscreen");
    else return;
    e.preventDefault();
  });
}

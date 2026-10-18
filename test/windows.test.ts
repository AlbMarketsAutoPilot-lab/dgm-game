// The Windows app (windows/DGM, owner approved 18 Oct 2026): Esc works like the Android Back button, F11 is full
// screen, and the app-only parts run only inside the app (chrome.webview), so the web and Android stay the same.
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { onWindowsKey, windowsApp } from "../src/ui/windows";

const read = (f: string) => fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

/** A key press, the messages sent to the app and the clicks on Leave, on the game screen or the start screen. */
const press = (key: string, o: { game?: boolean; leaveOpen?: boolean; taken?: boolean } = {}) => {
  const sent: string[] = [];
  let clicks = 0, prevented = false;
  const doc = {
    querySelector: (sel: string) => {
      if (sel === ".game .leave") return o.game ? { click: () => { clicks++; } } : null;
      if (sel.startsWith(".pop[")) return o.leaveOpen ? {} : null;
      return null;
    },
  } as unknown as Pick<Document, "querySelector">;
  onWindowsKey({ key, defaultPrevented: !!o.taken, preventDefault: () => { prevented = true; } }, { postMessage: (m) => sent.push(m) }, doc);
  return { sent, clicks, prevented };
};

describe("inside the Windows app or not", () => {
  it("only where WebView2 gives the page chrome.webview", () => {
    const view = { postMessage: () => {} };
    expect(windowsApp({ chrome: { webview: view } } as unknown as Window)).toBe(view);
    expect(windowsApp({} as Window)).toBeUndefined();
    expect(windowsApp({ chrome: {} } as unknown as Window)).toBeUndefined();
  });

  it("the web keeps its offline worker; the Windows parts sit behind windowsApp()", () => {
    const main = read("src/main.ts");
    expect(main).toContain('if (import.meta.env.PROD && "serviceWorker" in navigator && !inApp() && !windows)');
    expect(main).toContain("if (windows) startWindowsApp(windows);");
  });
});

describe("Esc and F11", () => {
  it("Esc on the game screen: the same \"Leave this game?\" popup as the Leave button", () => {
    expect(press("Escape", { game: true })).toEqual({ sent: [], clicks: 1, prevented: true });
  });

  it("Esc with that popup already shown: nothing more", () => {
    expect(press("Escape", { game: true, leaveOpen: true })).toEqual({ sent: [], clicks: 0, prevented: true });
  });

  it("Esc on the start screen: the app closes", () => {
    expect(press("Escape")).toEqual({ sent: ["leave"], clicks: 0, prevented: true });
  });

  it("Esc already taken by a popup, the guide or the postcards: the app does nothing", () => {
    expect(press("Escape", { taken: true })).toEqual({ sent: [], clicks: 0, prevented: false });
    expect(press("Escape", { game: true, taken: true })).toEqual({ sent: [], clicks: 0, prevented: false });
  });

  it("F11: full screen; other keys: left alone", () => {
    expect(press("F11")).toEqual({ sent: ["fullscreen"], clicks: 0, prevented: true });
    expect(press("Enter", { game: true })).toEqual({ sent: [], clicks: 0, prevented: false });
  });
});

describe("the Copyright and Privacy pages", () => {
  it("load only the game's own small script, which goes back to the game on Esc in the Windows app", () => {
    for (const f of ["public/copyright.html", "public/privacy.html"]) {
      const page = read(f);
      expect(page).toContain("script-src 'self'");
      expect(page).toContain('<script src="./legal.js" defer></script>');
    }
    const js = read("public/legal.js");
    expect(js).toContain("window.chrome && window.chrome.webview");
    expect(js).toContain('location.href = "./index.html"');
  });
});

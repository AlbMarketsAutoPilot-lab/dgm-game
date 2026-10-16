// The Android app (Step 8, owner approved 16 Oct 2026): the app-only parts run only at the app's own address, and the
// Back button shows the existing "Leave this game?" popup.
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { APP_HOST, back, inApp } from "../src/ui/android";

const read = (f: string) => fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

describe("inside the Android app or not (B1)", () => {
  it("only the app's own address, as in the KAJ app", () => {
    expect(APP_HOST).toBe("appassets.androidplatform.net");
    expect(inApp("appassets.androidplatform.net")).toBe(true);
    for (const web of ["albmarketsautopilot-lab.github.io", "localhost", "127.0.0.1", "", "appassets.androidplatform.net.example.com"]) expect(inApp(web)).toBe(false);
  });

  it("the web keeps its offline worker, Back hook and vibration: each app-only part sits behind inApp()", () => {
    const main = read("src/main.ts"), sound = read("src/ui/sound.ts");
    expect(main).toContain('if (import.meta.env.PROD && "serviceWorker" in navigator && !inApp())'); // B3
    expect(main).toContain("if (inApp()) (window as Window & { dgmBack?: () => boolean }).dgmBack"); // B2
    expect(sound).toContain("if (buzz !== undefined && !inApp())"); // B4
  });
});

describe("the Back button (B2)", () => {
  /** A page with or without the game screen and the Leave popup. */
  const page = (game: boolean, leaveOpen = false) => {
    let clicks = 0;
    const doc = {
      querySelector: (sel: string) => {
        if (sel === ".game .leave") return game ? { click: () => { clicks++; } } : null;
        if (sel.startsWith(".pop[")) return leaveOpen ? {} : null;
        return null;
      },
    } as unknown as Pick<Document, "querySelector">;
    return { doc, clicks: () => clicks };
  };

  it("on the game screen: the same \"Leave this game?\" popup as the Leave button", () => {
    const p = page(true);
    expect(back(p.doc)).toBe(true);
    expect(p.clicks()).toBe(1);
  });

  it("the popup already shown: nothing more, the app stays", () => {
    const p = page(true, true);
    expect(back(p.doc)).toBe(true);
    expect(p.clicks()).toBe(0);
  });

  it("anywhere else (the start screen): the page does not take it, so the app closes", () => {
    expect(back(page(false).doc)).toBe(false);
  });
});

describe("the camera cut-out and the privacy page (B5, B6)", () => {
  it("the cut-out sizes are 0 unless the app sets them", () => {
    expect(read("src/ui/app.css")).toContain("#app { padding: var(--cut-t, 0px) var(--cut-r, 0px) var(--cut-b, 0px) var(--cut-l, 0px); }");
  });

  it("the privacy policy says the app never vibrates (the owner's text)", () => {
    expect(read("public/privacy.html").replace(/\s+/g, " ")).toContain("The Android app never vibrates: it asks for no permissions at all.");
  });
});

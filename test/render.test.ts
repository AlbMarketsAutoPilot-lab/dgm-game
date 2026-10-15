// Board painting data (Step 3): every icon and every event colour the boards need exists.
import { describe, expect, it } from "vitest";
import { BOARDS } from "../src/engine";
import { ART } from "../src/render/art";
import { ICONS } from "../src/render/icons";
import { crayonFor } from "../src/render/palette";

function iconNames(o: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(o)) o.forEach((v) => iconNames(v, out));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) (k === "icon" && typeof v === "string" ? out.add(v) : iconNames(v, out));
  return out;
}

describe.each(["long", "short"] as const)("%s board", (id) => {
  it("every icon named in the board file has an animated illustration (not just a line icon)", () => {
    const missing = [...iconNames(BOARDS[id])].filter((n) => !ART[n]);
    expect(missing).toEqual([]);
  });
  it("every icon named in the board file has a line icon too (small UI)", () => {
    const missing = [...iconNames(BOARDS[id])].filter((n) => !ICONS[n]);
    expect(missing).toEqual([]);
  });
  it("every event square has its paper crayon colour (the short board reuses the long board's)", () => {
    const grey = Object.entries(BOARDS[id].tiles).filter(([k, t]) => crayonFor(BOARDS[id], Number(k), t) === "#9a9a9a").map(([k]) => Number(k));
    // Grey is also the fallback for a square without a colour, so only the paper's own grey squares (long 45 "throw two times", 178 "forgot your ticket") are grey.
    expect(grey).toEqual(id === "long" ? [45, 178] : []);
  });
});

describe("illustration motions", () => {
  it("motion settings are plain numbers (the CSS adds the units)", async () => {
    const { A } = await import("../src/render/art-kit");
    expect(A("bob", { d: 1.5, dl: 0.3, a: 4 })).toBe(' class="a-bob" style="--d:1.5;--dl:0.3;--a:4"');
  });
  it("every motion an illustration uses exists in the shared CSS", async () => {
    const { KIT_CSS } = await import("../src/render/art-kit");
    const used = new Set(Object.values(ART).flatMap((a) => [...a.svg.matchAll(/class="a-([a-z]+)"/g)].map((m) => m[1])));
    for (const m of used) expect(KIT_CSS, m).toContain(`.a-${m} {`);
  });
});

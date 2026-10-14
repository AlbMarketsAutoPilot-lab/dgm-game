// Board painting data (Step 3): every icon and every event colour the boards need exists.
import { describe, expect, it } from "vitest";
import { BOARDS } from "../src/engine";
import { ICONS } from "../src/render/icons";
import { crayonFor } from "../src/render/palette";

function iconNames(o: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(o)) o.forEach((v) => iconNames(v, out));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) (k === "icon" && typeof v === "string" ? out.add(v) : iconNames(v, out));
  return out;
}

describe.each(["long", "short"] as const)("%s board", (id) => {
  it("every icon named in the board file has a drawing", () => {
    const missing = [...iconNames(BOARDS[id])].filter((n) => !ICONS[n]);
    expect(missing).toEqual([]);
  });
  it("every event square has its paper crayon colour (the short board reuses the long board's)", () => {
    const grey = Object.entries(BOARDS[id].tiles).filter(([k, t]) => crayonFor(BOARDS[id], Number(k), t) === "#9a9a9a").map(([k]) => Number(k));
    // Grey is also the fallback for a square without a colour, so only the paper's own grey squares (long 45 "throw two times", 178 "forgot your ticket") are grey.
    expect(grey).toEqual(id === "long" ? [45, 178] : []);
  });
});

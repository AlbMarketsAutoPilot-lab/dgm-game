// Board painting data (Step 3; Step I phase C8: the Lantern Festival file): every picture the destination names exists.
import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "../src/engine/v3";
import { ART } from "../src/render/art";

function iconNames(o: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(o)) o.forEach((v) => iconNames(v, out));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) (k === "icon" && typeof v === "string" ? out.add(v) : iconNames(v, out));
  return out;
}

describe("the Lantern Festival", () => {
  it("every picture named in the destination file has an animated illustration (not just a line icon)", () => {
    const missing = [...iconNames(DESTINATIONS["lantern-festival"])].filter((n) => !ART[n]);
    expect(missing).toEqual([]);
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

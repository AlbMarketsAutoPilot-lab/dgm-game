// What the stage shows for each kind of place (the card and its caption). Step I phase C3: the Lantern Festival file;
// no square numbers on the cards, only an event square's "→ 24" destination label (Part 2, rule 1).
import { describe as group, expect, it } from "vitest";
import { DESTINATIONS } from "../src/engine/v3";
import { describe } from "../src/ui/stage";

const LF = DESTINATIONS["lantern-festival"];

group("stage cards", () => {
  it("an event square: its card in its kind's colour, picture, title and destination label", () => {
    const d = describe(LF, 40);
    expect(d.cls).toContain("ev");
    expect(d.html).toContain("art-cable-car");
    expect(d.html).toContain("→ 56");
    expect(d.caption).toBe("The Cable Car");
    expect(describe(LF, 69).html).toContain("→ 97");
    expect(describe(LF, 79).style).toContain("#2f6fc4"); // the Swap Market's blue
  });
  it("no square numbers on any card", () => {
    for (let pos = 0; pos <= LF.endTile; pos++) expect(describe(LF, pos).html, `square ${pos}`).not.toMatch(/class="cnum"/);
    expect(describe(LF, 21).html).not.toContain(">21<");
  });
  it("a plain square shows its area's picture", () => {
    expect(describe(LF, 21).caption).toBe("Countryside");
    expect(describe(LF, 60).html).toContain("art-sailboat");
  });
  it("Home and the destination", () => {
    expect(describe(LF, 0).caption).toBe("Home");
    expect(describe(LF, -1).caption).toBe("Home");
    expect(describe(LF, LF.endTile).caption).toBe("The Lantern Festival");
    expect(describe(LF, LF.endTile).html).toContain("art-lanterns");
  });
  it("landmarks", () => {
    expect(describe(LF, 92).caption).toBe("Central Station");
    expect(describe(LF, 97).caption).toBe("Festival Pier");
  });
});

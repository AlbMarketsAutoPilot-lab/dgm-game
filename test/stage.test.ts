// What the stage shows for each kind of place (the card, its picture and its name). Step I phase C3: the Lantern Festival file;
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
    expect(d.html).toContain('aria-label="The Cable Car"');
    expect(describe(LF, 69).html).toContain("→ 97");
    expect(describe(LF, 79).style).toContain("#2f6fc4"); // the Swap Market's blue
  });
  it("every square's card shows its number; Home and the destination do not (owner, Part 2 rule 1)", () => {
    for (let pos = 1; pos <= LF.lastTile; pos++) expect(describe(LF, pos).html, `square ${pos}`).toContain(`<span class="cnum">${pos}</span>`);
    for (const pos of [0, LF.endTile]) expect(describe(LF, pos).html).not.toMatch(/class="cnum"/);
  });
  it("a plain square shows its area's picture", () => {
    expect(describe(LF, 21).html).toContain('aria-label="Countryside"');
    expect(describe(LF, 60).html).toContain("art-sailboat");
  });
  it("Home and the destination", () => {
    expect(describe(LF, 0).html).toContain('aria-label="Home"');
    expect(describe(LF, -1).html).toContain('aria-label="Home"');
    expect(describe(LF, LF.endTile).html).toContain('aria-label="The Lantern Festival"');
    expect(describe(LF, LF.endTile).html).toContain("art-lanterns");
  });
  it("landmarks", () => {
    expect(describe(LF, 92).html).toContain('aria-label="Central Station"');
    expect(describe(LF, 97).html).toContain('aria-label="Festival Pier"');
  });
});

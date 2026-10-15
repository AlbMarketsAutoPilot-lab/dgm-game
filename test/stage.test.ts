// What the stage shows for each kind of place (the card and its caption).
import { describe as group, expect, it } from "vitest";
import { BOARDS, OFF } from "../src/engine";
import { describe } from "../src/ui/stage";

const L = BOARDS.long, S = BOARDS.short;

group("stage cards", () => {
  it("an event square: its crayon card, illustration and story", () => {
    const d = describe(L, 40);
    expect(d.cls).toContain("ev");
    expect(d.html).toContain("art-balloon");
    expect(d.html).toContain("→ 103");
    expect(d.caption).toBe(L.tiles[40].story);
  });
  it("a plain square shows its number and region", () => {
    const d = describe(L, 21);
    expect(d.html).toContain(">21<");
    expect(d.caption).toBe("Countryside");
  });
  it("Home, Start and END", () => {
    expect(describe(L, OFF).caption).toBe("Bags packed. Roll a 6 to leave.");
    expect(describe(L, 0).caption).toBe("Start");
    expect(describe(L, L.endTile).html).toContain("art-lanterns");
  });
  it("landmarks; no crossroads any more (Shortcut removed, owner 15 Oct)", () => {
    expect(describe(L, 184).caption).toBe("Central Station");
    expect(describe(S, 41).caption).toBe("River & Lake");
  });
});

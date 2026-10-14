// What the stage shows for each kind of place (the card and its caption).
import { describe as group, expect, it } from "vitest";
import { BOARDS, OFF, shortcutPos } from "../src/engine";
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
  it("stair steps: porch steps after Home, stepping stones after the Bog", () => {
    expect(describe(L, 1, 2).caption).toBe("Porch steps: step 2");
    expect(describe(L, 31, 1).caption).toBe("Stepping stones: step 1");
    expect(describe(S, 16, 1).caption).toBe("Stepping stones: step 1");
  });
  it("Shortcut squares: the jackpot and the fall with their story", () => {
    expect(describe(L, shortcutPos(0, 2)).caption).toBe("Rope swing over the river. Worth it!");
    expect(describe(L, shortcutPos(0, 5)).cls).toContain("ev");
    expect(describe(L, shortcutPos(0, 1)).caption).toBe("The Shortcut");
  });
  it("landmarks and crossroads", () => {
    expect(describe(L, 184).caption).toBe("Central Station");
    expect(describe(S, 41).caption).toBe("Crossroads");
  });
});

// Step I phase A: the v3 destination file (data/lantern-festival.json) holds exactly the agreed squares and areas
// (docs/prompts/StepI_destinations.md Part 2) and the checker refuses anything the v3 rules do not allow.
import { describe, expect, it } from "vitest";
import { DESTINATIONS, TEXT_LIMITS, areaOf, parseBoard3, sentences } from "../src/engine/v3/board";
import { ART } from "../src/render/art";

const LF = DESTINATIONS["lantern-festival"];
const withTile = (sq: number, t: object) => ({ ...LF, tiles: { ...LF.tiles, [sq]: t } });

describe("Lantern Festival (v3)", () => {
  it("has the agreed squares", () => {
    const short = Object.fromEntries(Object.entries(LF.tiles).map(([k, t]) => [k, t.to ?? t.type]));
    expect(short).toEqual({
      7: "slowNext", 10: 16, 17: 33, 20: 36, 27: "tree", 30: "card", 32: "nearest", 37: "swapLeader", 40: 56, 45: "card",
      49: 31, 54: 65, 61: "rollSum", 66: 55, 69: 97, 72: "doubleOthers", 74: 57, 79: "swapMarket", 85: "card", 91: 71,
      94: 78, 96: 92, 99: 92, 100: 82,
    });
    expect(LF.tiles[69].need).toBe(4);
    expect(LF.tiles[79].cat).toBe("S");
    expect(LF.tiles[99].then).toBe("skip2");
  });

  it("has the agreed areas (R15) and effects (R16)", () => {
    expect(LF.areas.map((a) => [a.name, a.from, a.to, a.effect?.type ?? null])).toEqual([
      ["Home Town", 0, 9, null], ["Countryside", 10, 22, "gifted6"], ["Forest", 23, 38, "backward"],
      ["Mountains", 39, 56, "double"], ["Seaside", 57, 76, "swapAhead"], ["Big City", 77, 100, "swapBehind"],
    ]);
    expect(areaOf(LF, 0).name).toBe("Home Town");
    expect(areaOf(LF, 27).name).toBe("Forest");
    expect(areaOf(LF, 100).name).toBe("Big City");
    expect(LF.rules).toEqual({ version: 3, startCards: 1, capture: true, endRule: "exact", maxEventJump: 20, robotForceAfter: 3 });
  });

  it("refuses a jump longer than 20 squares or onto an event square (R8)", () => {
    expect(() => parseBoard3(withTile(50, { cat: "P", type: "jump", to: 29, name: "x" }))).toThrow(/jump of 21/);
    expect(() => parseBoard3(withTile(50, { cat: "P", type: "jump", to: 45, name: "x" }))).toThrow(/onto event square 45/);
  });

  it("refuses unknown tiles, a second tree, a wrong Dragon Boat and gaps between areas", () => {
    expect(() => parseBoard3(withTile(5, { cat: "R", type: "teleport", name: "x" }))).toThrow(/unknown type/);
    expect(() => parseBoard3(withTile(5, { cat: "P", type: "tree", name: "x" }))).toThrow(/one fallen tree/);
    expect(() => parseBoard3(withTile(69, { cat: "R", type: "dragonBoat", to: 97, need: 3, name: "x" }))).toThrow(/finish/);
    const gap = { ...LF, areas: LF.areas.map((a, i) => (i === 2 ? { ...a, from: 24 } : a)) };
    expect(() => parseBoard3(gap)).toThrow(/must start at 23/);
    expect(() => parseBoard3({ ...LF, rules: { ...LF.rules, endRule: "overshoot" } })).toThrow(/exact/);
  });
});

// Phase B (owner, 25 Nov 2026): every text a player sees is approved by the owner, area by area, and follows the rules
// below. An area joins DONE_AREAS once all its texts are approved and in the file.
const DONE_AREAS: string[] = ["Home Town", "Forest"];
// Texts in, picture still to draw in B10 (owner, 26 Nov 2026): the Countryside (the Village Bus), the Mountains (the Rockslide).
const withAny = (patch: object) => ({ ...LF, ...patch });

describe("Lantern Festival (v3): texts and pictures", () => {
  it("refuses square numbers, unknown placeholders and over-long texts", () => {
    expect(() => parseBoard3(withTile(96, { ...LF.tiles[96], guide: "Back to square 92." }))).toThrow(/no square numbers/);
    expect(() => parseBoard3(withTile(96, { ...LF.tiles[96], guide: "Roll a 6. Then roll a 4." }))).not.toThrow();
    expect(() => parseBoard3(withAny({ notes: { jumpBack: "{p}: back {x} squares." } }))).toThrow(/unknown placeholder/);
    expect(() => parseBoard3(withAny({ notes: { bump: "{p} bumps {q} back Home." } }))).not.toThrow();
    expect(() => parseBoard3(withAny({ notes: { jumpBack: "x".repeat(TEXT_LIMITS.noteChars + 1) } }))).toThrow(/at most 50/);
    expect(() => parseBoard3(withTile(96, { ...LF.tiles[96], guide: "One. Two. Three." }))).toThrow(/2 sentences/);
    expect(() => parseBoard3(withTile(96, { ...LF.tiles[96], title: " " }))).toThrow(/not be empty/);
  });

  it("counts sentences without breaking at Mr.", () => {
    expect(sentences("I am Mr. Lin. Welcome!")).toBe(2);
    expect(sentences("Roll a 6, or use your Bonus card.")).toBe(1);
  });

  it("refuses a landmark on an event square, an unknown moment and an effect text where there is no effect", () => {
    expect(() => parseBoard3(withAny({ landmarks: { 69: { name: "Pier" } } }))).toThrow(/landmark 69 is on an event square/);
    expect(() => parseBoard3(withAny({ moments: { lunch: { guide: "x" } } }))).toThrow(/unknown moment/);
    const areas = LF.areas.map((a, i) => (i === 0 ? { ...a, effectText: "x" } : a));
    expect(() => parseBoard3(withAny({ areas }))).toThrow(/effect text without an effect/);
  });

  it("every picture named in the file is drawn", () => {
    const icons = [
      ...Object.values(LF.tiles).map((t) => t.icon), ...LF.areas.map((a) => a.icon),
      ...Object.values(LF.landmarks ?? {}).map((l) => l.icon), LF.destination?.icon,
    ].filter((x): x is string => x !== undefined);
    for (const i of icons) expect(ART, i).toHaveProperty(i);
  });

  it("every approved area has all its texts", () => {
    for (const name of DONE_AREAS) {
      const a = LF.areas.find((x) => x.name === name)!;
      expect(a.icon && a.announce, name).toBeTruthy(); // the announcement also tells the effect (owner, 26 Nov 2026)
      for (const [sq, t] of Object.entries(LF.tiles)) {
        if (Number(sq) >= a.from && Number(sq) <= a.to) expect(t.title && t.guide && t.icon, `square ${sq}`).toBeTruthy();
      }
    }
  });
});

// Step I phase A: the v3 destination file (data/lantern-festival.json) holds exactly the agreed squares and areas
// (docs/prompts/StepI_destinations.md Part 2) and the checker refuses anything the v3 rules do not allow.
import { describe, expect, it } from "vitest";
import { DESTINATIONS, areaOf, parseBoard3 } from "../src/engine/v3/board";

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

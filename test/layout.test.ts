// Board layout (Step 3): every square has a place, nothing overlaps, the long board follows the paper path.
import { describe, expect, it } from "vitest";
import { BOARDS, OFF, shortcutPos } from "../src/engine";
import { layoutFor, pointOf, type Point } from "../src/render/layout";

const d = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const minGap = (ps: Point[], qs: Point[] = ps, same = qs === ps) => {
  let m = Infinity;
  ps.forEach((p, i) => qs.forEach((q, j) => { if (!(same && j <= i)) m = Math.min(m, d(p, q)); }));
  return m;
};

describe.each(["long", "short"] as const)("%s board layout", (id) => {
  const L = layoutFor(BOARDS[id]);
  it("a place for Start, every square and END", () => {
    expect(L.squares).toHaveLength(BOARDS[id].lastTile + 1);
    expect(pointOf(L, BOARDS[id].endTile)).toBe(L.end);
    expect(pointOf(L, OFF)).toBe(L.home);
  });
  it("squares never overlap (centres at least 0.88 apart, tiles 0.84 wide)", () => {
    expect(minGap([...L.squares, L.end])).toBeGreaterThanOrEqual(0.88);
  });
  it("neighbouring squares are close (one continuous path; the short board's rows are 1.6 apart)", () => {
    const max = id === "long" ? 1.0001 : 1.6001;
    for (let n = 1; n < L.squares.length; n++) expect(d(L.squares[n - 1], L.squares[n]), `square ${n}`).toBeLessThanOrEqual(max);
    expect(d(L.squares.at(-1)!, L.end)).toBeLessThanOrEqual(max);
  });
  it("Shortcut stones sit in the corridors, clear of the Main Road", () => {
    for (const s of L.shortcuts) {
      expect(s.stones).toHaveLength(BOARDS[id].rules.forks[s.fork].len);
      expect(minGap(s.stones, L.squares, false)).toBeGreaterThanOrEqual(0.7);
      expect(minGap(s.stones)).toBeGreaterThanOrEqual(0.5); // stones are drawn 0.46 wide
      expect(pointOf(L, shortcutPos(s.fork, 1))).toBe(s.stones[0]);
    }
  });
  it("ladders and snakes join their squares", () => {
    expect(L.drawings.length).toBeGreaterThan(0);
    for (const dr of L.drawings) {
      expect(dr.path[0]).toEqual(L.squares[dr.from]);
      expect(dr.path.at(-1)).toEqual(L.squares[dr.to]);
    }
  });
});

describe("long board = the paper path", () => {
  const L = layoutFor(BOARDS.long);
  const dir = (a: number, b: number) => {
    const p = L.squares[a], q = L.squares[b];
    return Math.abs(q.x - p.x) > Math.abs(q.y - p.y) ? (q.x > p.x ? "right" : "left") : (q.y > p.y ? "down" : "up");
  };
  it.each([
    [0, 19, "right"], [20, 36, "down"], [37, 55, "left"], [56, 70, "up"], [71, 88, "right"], [89, 101, "down"],
    [102, 116, "left"], [117, 127, "up"], [128, 141, "right"], [142, 150, "down"], [151, 161, "left"], [162, 168, "up"],
    [169, 178, "right"], [179, 183, "down"], [184, 190, "left"], [191, 193, "up"], [194, 198, "right"], [199, 200, "down"],
    [201, 202, "left"],
  ])("%i → %i goes %s", (a, b, want) => expect(dir(a, b)).toBe(want));
  it("END is above 202", () => expect(L.end.y).toBeLessThan(L.squares[202].y));
  it("the seven paper drawings: ladders 40, 80, 113, 188; snakes 138, 158, 202", () => {
    expect(L.drawings.map((x) => `${x.kind} ${x.from}→${x.to}`)).toEqual([
      "ladder 40→103", "ladder 80→135", "ladder 113→50", "ladder 188→157", "snake 138→195", "snake 158→48", "snake 202→165",
    ]);
  });
});

describe("short board drawings come from the same paper events", () => {
  it("balloon and cable car are ladders; the Snake Leader snakes", () => {
    expect(layoutFor(BOARDS.short).drawings.map((x) => `${x.kind} ${x.from}→${x.to}`)).toEqual(
      expect.arrayContaining(["ladder 20→51", "ladder 40→67", "snake 69→97", "snake 100→82"]));
  });
});

describe("short board = a snakes-and-ladders grid", () => {
  const L = layoutFor(BOARDS.short);
  it("1 bottom left, 10 bottom right, 11 above 10, 100 top left, END above 100", () => {
    const at = (n: number) => [L.squares[n].x, L.squares[n].y];
    expect(at(1)[0]).toBe(0);
    expect(at(10)[0]).toBe(9);
    expect(at(11)[0]).toBe(9);
    expect(at(11)[1]).toBeLessThan(at(10)[1]);
    expect(at(100)[0]).toBe(0);
    expect(L.end.y).toBeLessThan(at(100)[1]);
    expect(Math.min(...L.squares.map((p) => p.y))).toBe(at(100)[1]);
  });
});

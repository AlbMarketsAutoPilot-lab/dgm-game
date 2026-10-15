// Whole-board layout (owner, 15 Oct): a labyrinth spiral of touching squares, walls between the rings, the
// Shortcuts inside the walls, a big Start pad and the festival in the middle.
import { describe, expect, it } from "vitest";
import { BOARDS, OFF, shortcutPos } from "../src/engine";
import { WALL_THIN, layoutFor, pointOf, type Point } from "../src/render/layout";

const d = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
/** Chebyshev distance: squares are axis-aligned, so this says whether they overlap. */
const box = (a: Point, b: Point) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

describe.each(["long", "short"] as const)("%s board layout", (id) => {
  const B = BOARDS[id], L = layoutFor(B), sq = L.squares.slice(1);
  it("a place for every square, END, Home and Start (Home and Start share the big pad)", () => {
    expect(L.squares).toHaveLength(B.lastTile + 1);
    expect(pointOf(L, B.endTile)).toBe(L.end);
    expect(pointOf(L, OFF)).toEqual(pointOf(L, 0));
  });
  it("squares never overlap (about one unit apart), the festival included", () => {
    const all = [...sq, L.end]; // audit 15 Oct: the short board's festival sat on top of square 100
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) expect(box(all[i], all[j]), `${i + 1}/${j + 1}`).toBeGreaterThanOrEqual(0.89);
  });
  it("Shortcut stones never bunch up (audit 15 Oct: they overlapped at the corners)", () => {
    for (const s of L.shortcuts) for (let i = 1; i < s.stones.length; i++) expect(d(s.stones[i - 1], s.stones[i]), `fork ${s.fork} stone ${i}`).toBeGreaterThan(0.5);
  });
  it("one continuous road: neighbours touch, or step through a wall opening into the next ring", () => {
    for (let n = 2; n <= B.lastTile; n++) expect(d(L.squares[n - 1], L.squares[n]), `square ${n}`).toBeLessThanOrEqual(1.45); // a ring gap, or a short inner side
    // the festival fills the middle (owner: no empty space); the last square touches it
    const E = L.endPad, q = L.squares[B.lastTile];
    expect(Math.max(0, Math.abs(q.x - E.centre.x) - E.w / 2) + Math.max(0, Math.abs(q.y - E.centre.y) - E.h / 2)).toBeLessThanOrEqual(0.5 + WALL_THIN + 0.05); // one wall away
  });
  it("the long Start square at the top left (room for four tokens), then square 1, going right", () => {
    expect(L.start.w).toBeGreaterThan(3.5);
    expect(L.squares[1].y).toBe(0);
    expect(L.squares[1].x).toBeGreaterThan(L.start.centre.x + L.start.w / 2 - 0.1);
    expect(L.squares[2].x).toBeGreaterThan(L.squares[1].x);
  });
  it("no empty margin: the board is the labyrinth", () => expect(L.bounds).toEqual(L.maze));
  it("the festival is inside the labyrinth", () => {
    expect(L.end.x).toBeGreaterThan(1);
    expect(L.end.y).toBeGreaterThan(1);
  });
  it("Shortcut stones sit in the walls, clear of every square", () => {
    for (const s of L.shortcuts) {
      expect(s.stones).toHaveLength(B.rules.forks[s.fork].len);
      for (const st of s.stones) for (const q of sq) expect(box(st, q)).toBeGreaterThanOrEqual(0.6);
      expect(pointOf(L, shortcutPos(s.fork, 1))).toBe(s.stones[0]);
    }
  });
  it("cable cars go forward and rivers go back, joining their squares", () => {
    expect(L.drawings.length).toBeGreaterThan(0);
    for (const dr of L.drawings) {
      expect(dr.kind).toBe(dr.to > dr.from ? "cable" : "river");
      expect(dr.path[0]).toEqual(L.squares[dr.from]);
      expect(dr.path.at(-1)).toEqual(L.squares[dr.to]);
    }
  });
});

describe("drawings: the paper's ladders and snakes", () => {
  it("long board: the seven paper drawings", () => {
    expect(layoutFor(BOARDS.long).drawings.map((x) => `${x.from}→${x.to}`)).toEqual(["40→103", "80→135", "113→50", "188→157", "138→195", "158→48", "202→165"]);
  });
  it("short board: the same paper events", () => {
    expect(layoutFor(BOARDS.short).drawings.map((x) => `${x.kind} ${x.from}→${x.to}`)).toEqual(
      expect.arrayContaining(["cable 20→51", "cable 40→67", "cable 69→97", "river 100→82"]));
  });
});

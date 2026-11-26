// Whole-board layout (owner, 15 Oct): a labyrinth spiral of touching squares, walls between the rings, a big Home pad
// and the destination in the middle. Step I phase C3: drawn from the Lantern Festival file; Home is place 0.
import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "../src/engine/v3";
import { WALL_THIN, layoutFor, pointOf, type Point } from "../src/render/layout";

const d = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
/** Chebyshev distance: squares are axis-aligned, so this says whether they overlap. */
const box = (a: Point, b: Point) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

describe("Lantern Festival board layout", () => {
  const B = DESTINATIONS["lantern-festival"], L = layoutFor(B), sq = L.squares.slice(1);
  it("a place for every square, the destination and Home (the big pad)", () => {
    expect(L.squares).toHaveLength(B.lastTile + 1);
    expect(pointOf(L, B.endTile)).toBe(L.end);
    expect(pointOf(L, 0)).toBe(L.start.centre);
  });
  it("squares never overlap (about one unit apart), the destination included", () => {
    const all = [...sq, L.end];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) expect(box(all[i], all[j]), `${i + 1}/${j + 1}`).toBeGreaterThanOrEqual(0.89);
  });
  it("one continuous road: neighbours touch, or step through a wall opening into the next ring", () => {
    for (let n = 2; n <= B.lastTile; n++) expect(d(L.squares[n - 1], L.squares[n]), `square ${n}`).toBeLessThanOrEqual(1.45);
    const E = L.endPad, q = L.squares[B.lastTile];
    expect(Math.max(0, Math.abs(q.x - E.centre.x) - E.w / 2) + Math.max(0, Math.abs(q.y - E.centre.y) - E.h / 2)).toBeLessThanOrEqual(0.5 + WALL_THIN + 0.05);
  });
  it("the long Home square at the top left (room for four tokens), then square 1, going right", () => {
    expect(L.start.w).toBeGreaterThan(3.5);
    expect(L.squares[1].y).toBe(0);
    expect(L.squares[1].x).toBeGreaterThan(L.start.centre.x + L.start.w / 2 - 0.1);
    expect(L.squares[2].x).toBeGreaterThan(L.squares[1].x);
  });
  it("no empty margin: the board is the labyrinth", () => expect(L.bounds).toEqual(L.maze));
  it("the destination is inside the labyrinth", () => {
    expect(L.end.x).toBeGreaterThan(1);
    expect(L.end.y).toBeGreaterThan(1);
  });
});

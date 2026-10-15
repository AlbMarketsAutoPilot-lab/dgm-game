// Where everything sits on the whole board, in board units (1 unit = one square).
// Pure geometry: the board view (src/ui/overview.ts) reads it.
//
// Both boards are a labyrinth spiral, like the hand-drawn paper board: square 1 at the top left, the road runs
// clockwise round the outside and winds inwards ring by ring to the Festival of Lights in the middle. Squares touch;
// the rings are separated by a thin wall (RING - 1 wide), with one opening where the road steps into the next ring.
// A Shortcut (R20) runs inside the wall, beside the Main Road squares it replaces (it has exactly as many squares).
// The big Start pad (room for four tokens, and Home) and the legend sit in a column on the left.
import { BOARDS, OFF, OUT, isShortcut, shortcutOf } from "../engine";
import type { Board, Pos } from "../engine";

export interface Point {
  x: number;
  y: number;
}

/** A paper ladder or snake, redrawn for the journey: a cable car (forward) or a river (back). */
export interface Drawing {
  kind: "cable" | "river";
  from: number;
  to: number;
  path: Point[];
}

export interface ShortcutLayout {
  fork: number;
  /** Crossroads and meeting square (Main Road squares). */
  at: number;
  merge: number;
  /** Centre of each Shortcut square: stones[i - 1] = Shortcut square i. */
  stones: Point[];
  /** The trail drawn under the stones, from the crossroads to the meeting square. */
  trail: Point[];
}

export interface Pad {
  centre: Point;
  w: number;
  h: number;
}

export interface BoardLayout {
  board: Board;
  /** Board area in units. */
  bounds: { x: number; y: number; w: number; h: number };
  /** The labyrinth itself (walls are drawn over this rectangle, squares on top). */
  maze: { x: number; y: number; w: number; h: number };
  /** squares[n] = centre of square n (1..lastTile); squares[0] = the centre of the Start pad. */
  squares: Point[];
  /** Length of each square along the road (about 1; the width across is always 1). */
  along: number[];
  /** Unit vector of the direction of travel at each square. */
  heading: Point[];
  /** Start pad (Start and Home: the tokens wait here), END pad (the festival). */
  start: Pad;
  endPad: Pad;
  end: Point;
  home: Point;
  /** Where the legend goes (under the Start pad). */
  legend: { x: number; y: number; w: number; h: number };
  shortcuts: ShortcutLayout[];
  drawings: Drawing[];
}

/** Distance between two rings (1 square + the wall). */
export const RING = 1.36;

const DESIGNS: Record<string, { w: number; h: number }> = {
  long: { w: 15.5, h: 15 },
  short: { w: 10, h: 11 },
};

/** The paper drawings (archived transcription §6.1, §8.1): ladders and snakes, by their long-board squares. */
const LONG_DRAWINGS: [from: number, to: number][] = [[40, 103], [80, 135], [113, 50], [188, 157], [138, 195], [158, 48], [202, 165]];

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** The road: square 1 at (0, 0), clockwise and inwards. Returns `count` centres and their lengths along the road. */
function spiral(w: number, h: number, count: number): { pts: Point[]; along: number[] } {
  const pts: Point[] = [], along: number[] = [];
  for (let k = 0; pts.length < count; k++) {
    const a = k * RING, x1 = w - a, y1 = h - a;
    if (x1 - a < 0.9 || y1 - a < 0.9) throw new Error("the board is too small for its squares");
    const sides: [Point, Point, boolean][] = [
      [{ x: a, y: a }, { x: x1, y: a }, true], [{ x: x1, y: a }, { x: x1, y: y1 }, false],
      [{ x: x1, y: y1 }, { x: a, y: y1 }, false], [{ x: a, y: y1 }, { x: a, y: a + RING }, false],
    ];
    for (const [A, B, first] of sides) {
      const n = Math.max(1, Math.round(dist(A, B))), s = dist(A, B) / n;
      for (let i = first ? 0 : 1; i <= n && pts.length < count; i++) {
        pts.push(lerp(A, B, i / n));
        along.push(i === 0 || i === n ? 1 : s); // corners are whole squares
      }
    }
  }
  return { pts, along };
}

const cache = new Map<Board, BoardLayout>();

export function layoutFor(board: Board): BoardLayout {
  const hit = cache.get(board);
  if (hit) return hit;
  const design = DESIGNS[board.id];
  if (!design) throw new Error(`no layout for board "${board.id}"`);
  const { w, h } = design, last = board.lastTile;
  // squares 1..last, then one more point: where END sits
  const road = spiral(w, h, last + 1);
  const start: Pad = { centre: { x: -1.85, y: 0.9 }, w: 2.3, h: 2.8 };
  const squares = [start.centre, ...road.pts.slice(0, last)], along = [2.3, ...road.along.slice(0, last)];
  const end = road.pts[last];
  const endPad: Pad = { centre: end, w: 1.5, h: 1.5 };
  const next = (n: number) => (n < last ? squares[n + 1] : end);
  const heading = squares.map((p, n) => {
    if (n === 0) return { x: 1, y: 0 };
    const q = next(n), d = dist(p, q) || 1;
    return { x: (q.x - p.x) / d, y: (q.y - p.y) / d };
  });
  // inwards = the heading turned right (the road turns clockwise)
  const inward = (n: number) => ({ x: -heading[n].y, y: heading[n].x });
  // Each Shortcut runs in the wall beside its Main Road squares, on the inner or the outer side, whichever is clear.
  const shortcuts = board.rules.forks.map((f, k) => {
    const lane = (side: 1 | -1) => Array.from({ length: f.len }, (_, j) => {
      const n = f.at + 1 + j, a = inward(n - 1), b = inward(n), d = side * ((RING - 1) / 2 + 0.5);
      const off = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < 0.01 ? a : { x: a.x + b.x, y: a.y + b.y }; // at a corner: the corner of the wall
      return { x: squares[n].x + off.x * d, y: squares[n].y + off.y * d };
    });
    const clear = (st: Point[]) => Math.min(...st.flatMap((p) => squares.slice(1).map((q) => Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)))))
      - (st.some((p) => p.x < -0.5 || p.y < -0.5 || p.x > w + 0.5 || p.y > h + 0.5) ? 9 : 0);
    const inner = lane(1), outer = lane(-1), stones = clear(inner) >= clear(outer) ? inner : outer;
    return { fork: k, at: f.at, merge: f.merge, stones, trail: [squares[f.at], ...stones, squares[f.merge]] };
  });
  const drawings = drawingsFor(board).map(([from, to]): Drawing => {
    const a = squares[from], b = squares[to];
    const path = to > from ? [a, b] : riverPath(a, b);
    path[0] = a; path[path.length - 1] = b; // exactly on the squares
    return { kind: to > from ? "cable" : "river", from, to, path };
  });
  const layout: BoardLayout = {
    board, squares, along, heading, shortcuts, drawings, start, endPad, end,
    home: start.centre,
    maze: { x: -0.5 - (RING - 1), y: -0.5 - (RING - 1), w: w + 1 + 2 * (RING - 1), h: h + 1 + 2 * (RING - 1) },
    legend: { x: -3.0, y: 2.5, w: 2.3, h: h - 2.0 },
    bounds: { x: -3.1, y: -0.75, w: w + 3.85, h: h + 1.5 },
  };
  cache.set(board, layout);
  return layout;
}

/** The paper drawings on this board. The short board reuses long-board events (same story = same drawing). */
function drawingsFor(board: Board): [number, number][] {
  if (board.id === "long") return LONG_DRAWINGS;
  const long = BOARDS.long.tiles, out: [number, number][] = [];
  for (const [k, t] of Object.entries(board.tiles)) {
    if (t.type === "jump" && t.to !== undefined && LONG_DRAWINGS.some(([from]) => long[from]?.story === t.story)) out.push([Number(k), t.to]);
  }
  return out;
}

/** A river: gentle bends from the square it starts on to its destination. */
function riverPath(a: Point, b: Point): Point[] {
  const L = dist(a, b), nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L, waves = Math.max(1, Math.round(L / 4)), amp = Math.min(0.6, 0.08 * L);
  return Array.from({ length: 41 }, (_, i) => {
    const t = i / 40, p = lerp(a, b, t), s = amp * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * waves * t);
    return { x: p.x + nx * s, y: p.y + ny * s };
  });
}

/** Centre of a token's place (engine `Pos`). `stair` = R17 stair step (0 = the square itself). */
export function pointOf(layout: BoardLayout, pos: Pos, stair = 0): Point {
  if (pos === OFF || pos === OUT || pos === 0) return layout.start.centre;
  if (pos === layout.board.endTile) return layout.end;
  if (isShortcut(pos)) {
    const { fork, index } = shortcutOf(pos);
    return layout.shortcuts[fork].stones[index - 1];
  }
  const p = layout.squares[pos];
  if (!stair) return p;
  const hd = layout.heading[pos];
  return { x: p.x + hd.x * 0.12 * stair, y: p.y + hd.y * 0.12 * stair - 0.12 * stair };
}

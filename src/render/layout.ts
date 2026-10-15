// Where everything sits on the whole board, in board units (1 unit = one square).
// Pure geometry: the board view (src/ui/overview.ts) reads it.
//
// Both boards are a labyrinth spiral, like the hand-drawn paper board: the long Start square at the top left (four
// squares long, it holds all the tokens), then the road runs clockwise round the outside and winds inwards ring by
// ring to the Festival of Lights in the middle. Squares touch; a thin wall separates the rings, with one opening where
// the road steps into the next ring. A Shortcut (R20) runs inside a wider wall, beside the Main Road squares it
// replaces (it has exactly as many squares). No empty margins: the squares get all the space.
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
  /** Unused (the legend was removed, owner 15 Oct). */
  legend: { x: number; y: number; w: number; h: number };
  shortcuts: ShortcutLayout[];
  drawings: Drawing[];
}

/** Walls between rings: thin, and wider where a Shortcut runs inside them. */
export const WALL_THIN = 0.14;
export const WALL_WIDE = 0.44;
/** How long the Start square is (it holds up to four tokens side by side). */
export const START_LEN = 4;

/**
 * Board sizes (w × h units) where the spiral fills the board with (almost) no empty space in the middle (owner,
 * 15 Oct: no empty space, bigger squares). Each suits a different panel shape, from tall to wide; the board view
 * takes the one that gives the biggest squares in its panel. The first is the default.
 */
const DESIGNS: Record<string, [number, number][]> = {
  long: [[16.25, 12.5], [12.5, 16.25], [12.75, 16], [14.25, 15.25], [15.5, 14.25], [15.5, 13.5], [17.75, 13.25], [19.5, 13], [20, 12.75], [19.5, 10.25]],
  short: [[11, 9.75], [8.25, 12], [9.5, 11.75], [10, 10.25], [10.25, 10], [11.5, 9.25], [12.5, 9.25], [12, 8], [15, 9.25], [15.25, 9]],
};

/** The paper drawings (archived transcription §6.1, §8.1): ladders and snakes, by their long-board squares. */
const LONG_DRAWINGS: [from: number, to: number][] = [[40, 103], [80, 135], [113, 50], [188, 157], [138, 195], [158, 48], [202, 165]];

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** The road from the top left corner, clockwise and inwards: `count` centres, their lengths along the road and ring. */
function spiral(w: number, h: number, count: number, gaps: number[]): { pts: Point[]; along: number[]; ring: number[] } {
  const pts: Point[] = [], along: number[] = [], ring: number[] = [];
  let a = 0;
  for (let k = 0; pts.length < count; k++) {
    const x1 = w - a, y1 = h - a, g = gaps[k] ?? WALL_THIN;
    if (x1 - a < 0.9 || y1 - a < 0.9) throw new Error("the board is too small for its squares");
    const sides: [Point, Point, boolean][] = [
      [{ x: a, y: a }, { x: x1, y: a }, true], [{ x: x1, y: a }, { x: x1, y: y1 }, false],
      [{ x: x1, y: y1 }, { x: a, y: y1 }, false], [{ x: a, y: y1 }, { x: a, y: a + 1 + g }, false],
    ];
    for (const [A, B, first] of sides) {
      const n = Math.max(1, Math.round(dist(A, B))), s = dist(A, B) / n;
      for (let i = first ? 0 : 1; i <= n && pts.length < count; i++) {
        pts.push(lerp(A, B, i / n));
        along.push(i === 0 || i === n ? 1 : s); // corners are whole squares
        ring.push(k);
      }
    }
    a += 1 + g;
  }
  return { pts, along, ring };
}

const cache = new Map<Board, Map<string, BoardLayout>>();

/** The board size that gives the biggest squares in a panel of panelW × panelH pixels (no panel: the default). */
export function designFor(board: Board, panelW = 0, panelH = 0): [number, number] {
  const list = DESIGNS[board.id];
  if (!list) throw new Error(`no layout for board "${board.id}"`);
  if (!(panelW > 0 && panelH > 0)) return list[0];
  const side = ([w, h]: [number, number]) => Math.min(panelW / (w + 1 + 2 * WALL_THIN), panelH / (h + 1 + 2 * WALL_THIN));
  return list.reduce((best, d) => (side(d) > side(best) + 0.01 ? d : best));
}

export function layoutFor(board: Board, panelW = 0, panelH = 0): BoardLayout {
  const [w, h] = designFor(board, panelW, panelH), key = `${w}x${h}`;
  let byBoard = cache.get(board);
  if (!byBoard) cache.set(board, (byBoard = new Map()));
  let layout = byBoard.get(key);
  if (!layout) byBoard.set(key, (layout = layoutForDesign(board, w, h)));
  return layout;
}

/** The layout on a board of w × h units (tests try other sizes). */
export function layoutForDesign(board: Board, w: number, h: number): BoardLayout {
  const last = board.lastTile;
  // The first START_LEN places are the Start square, then squares 1..last, then one more: END.
  // The walls beside a Shortcut are widened; that moves the inner rings, so repeat until it settles.
  let gaps: number[] = [], road = spiral(w, h, START_LEN + last + 1, gaps);
  for (let i = 0; i < 6; i++) {
    const wide: number[] = [];
    for (const f of board.rules.forks) for (let n = f.at + 1; n < f.merge; n++) {
      const k = road.ring[START_LEN - 1 + n];
      wide[k] = WALL_WIDE;
      if (k > 0) wide[k - 1] = WALL_WIDE;
    }
    if (JSON.stringify(wide) === JSON.stringify(gaps)) break;
    gaps = wide;
    road = spiral(w, h, START_LEN + last + 1, gaps);
  }
  const s0 = road.pts[0], s1 = road.pts[START_LEN - 1];
  const start: Pad = { centre: lerp(s0, s1, 0.5), w: dist(s0, s1) + dist(s0, road.pts[1]), h: 1 };
  const squares = [start.centre, ...road.pts.slice(START_LEN, START_LEN + last)], along = [START_LEN, ...road.along.slice(START_LEN, START_LEN + last)];
  const roadEnd = road.pts[START_LEN + last];
  const next = (n: number) => (n < last ? squares[n + 1] : roadEnd);
  const heading = squares.map((p, n) => {
    if (n === 0) return { x: 1, y: 0 };
    const q = next(n), d = dist(p, q) || 1;
    return { x: (q.x - p.x) / d, y: (q.y - p.y) / d };
  });
  // The festival grows into whatever space the spiral leaves in the middle, so the board has no empty hole.
  const boxes = squares.map((p, n) => {
    if (n === 0) return { x0: p.x - start.w / 2, x1: p.x + start.w / 2, y0: p.y - 0.5, y1: p.y + 0.5 };
    const horiz = Math.abs(heading[n].x) > Math.abs(heading[n].y), a = along[n], bw = horiz ? a : 1, bh = horiz ? 1 : a;
    return { x0: p.x - bw / 2, x1: p.x + bw / 2, y0: p.y - bh / 2, y1: p.y + bh / 2 };
  });
  type Box = { x0: number; x1: number; y0: number; y1: number };
  const clear = (q: Box) => q.x0 >= -0.5 && q.y0 >= -0.5 && q.x1 <= w + 0.5 && q.y1 <= h + 0.5
    && boxes.every((b) => b.x1 <= q.x0 + 1e-6 || b.x0 >= q.x1 - 1e-6 || b.y1 <= q.y0 + 1e-6 || b.y0 >= q.y1 - 1e-6);
  let pad: Box = { x0: roadEnd.x - 0.45, x1: roadEnd.x + 0.45, y0: roadEnd.y - 0.45, y1: roadEnd.y + 0.45 };
  for (let grew = clear(pad); grew;) {
    grew = false;
    for (const [k, d] of [["x0", -0.05], ["x1", 0.05], ["y0", -0.05], ["y1", 0.05]] as const) {
      const t = { ...pad, [k]: pad[k] + d };
      if (clear(t)) { pad = t; grew = true; }
    }
  }
  const end = { x: (pad.x0 + pad.x1) / 2, y: (pad.y0 + pad.y1) / 2 };
  const endPad: Pad = { centre: end, w: pad.x1 - pad.x0, h: pad.y1 - pad.y0 };
  // inwards = the heading turned right (the road turns clockwise)
  const inward = (n: number) => ({ x: -heading[n].y, y: heading[n].x });
  // Each Shortcut runs in the wall beside its Main Road squares, on the inner or the outer side, whichever is clear.
  const shortcuts = board.rules.forks.map((f, k) => {
    // The wall beside the Main Road squares it replaces; the stones are spread evenly along it, so they never
    // bunch up at a corner, however few stones the Shortcut has.
    const lane = (side: 1 | -1) => {
      const wall = Array.from({ length: f.merge - f.at - 1 }, (_, j) => {
        const n = f.at + 1 + j, a = inward(n - 1), b = inward(n), d = side * (WALL_WIDE / 2 + 0.5);
        const off = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < 0.01 ? a : { x: a.x + b.x, y: a.y + b.y }; // at a corner: the corner of the wall
        return { x: squares[n].x + off.x * d, y: squares[n].y + off.y * d };
      });
      const seg = wall.slice(1).map((q, i) => dist(wall[i], q)), total = seg.reduce((x, y) => x + y, 0);
      return Array.from({ length: f.len }, (_, j) => {
        let t = f.len === 1 ? total / 2 : (total * j) / (f.len - 1), i = 0;
        while (i < seg.length - 1 && t > seg[i]) { t -= seg[i]; i++; }
        return seg.length ? lerp(wall[i], wall[i + 1], seg[i] ? Math.min(1, t / seg[i]) : 0) : wall[0];
      });
    };
    const clear = (st: Point[]) => Math.min(...st.flatMap((p) => squares.slice(1).map((q) => Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)))))
      - (st.some((p) => p.x < -0.5 || p.y < -0.5 || p.x > w + 0.5 || p.y > h + 0.5) ? 9 : 0);
    const inner = lane(1), outer = lane(-1), stones = clear(inner) >= clear(outer) ? inner : outer;
    return { fork: k, at: f.at, merge: f.merge, stones, trail: [squares[f.at], ...stones, squares[f.merge]] };
  });
  const drawings = drawingsFor(board).map(([from, to]): Drawing => ({ kind: to > from ? "cable" : "river", from, to, path: [squares[from], squares[to]] }));
  const layout: BoardLayout = {
    board, squares, along, heading, shortcuts, drawings, start, endPad, end,
    home: start.centre,
    maze: { x: -0.5 - WALL_THIN, y: -0.5 - WALL_THIN, w: w + 1 + 2 * WALL_THIN, h: h + 1 + 2 * WALL_THIN },
    legend: { x: 0, y: 0, w: 0, h: 0 },
    bounds: { x: -0.5 - WALL_THIN, y: -0.5 - WALL_THIN, w: w + 1 + 2 * WALL_THIN, h: h + 1 + 2 * WALL_THIN },
  };
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

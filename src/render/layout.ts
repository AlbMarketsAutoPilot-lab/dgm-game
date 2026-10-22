// Where everything sits on the whole board, in board units (1 unit = one square).
// Pure geometry: the board view (src/ui/overview.ts) reads it.
//
// Both boards are a labyrinth spiral, like the hand-drawn paper board: the long Start square at the top left (four
// squares long, it holds all the tokens), then the road runs clockwise round the outside and winds inwards ring by
// ring to the Festival of Lights in the middle. Squares touch; a thin wall separates the rings, with one opening where
// the road steps into the next ring. No empty margins: the squares get all the space.
// The boards have no Shortcut (owner, 15 Oct) and no stair steps; a board with a Shortcut is refused (C2).
import { BOARDS, OFF } from "../engine";
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
  drawings: Drawing[];
}

/** Walls between rings. */
export const WALL_THIN = 0.38; // owner, 15 Oct: a clear purple wall between the rings, as on the first boards
/** How long the Start square is (it holds up to four tokens side by side). */
export const START_LEN = 4;

/**
 * Board sizes (w × h units) where the spiral, with a clear wall between the rings, leaves a well-shaped plaza in
 * the middle for the Festival of Lights and no other empty space (owner, 15 Oct). The board view takes the one that
 * gives the biggest squares in its panel. The first is the default.
 */
const DESIGNS: Record<string, [number, number][]> = {
  long: [[16.25, 15.75]],
  short: [[12.25, 11], [11.25, 12]],
};

/** The paper drawings (archived transcription §6.1, §8.1): ladders and snakes, by their long-board squares. */
const LONG_DRAWINGS: [from: number, to: number][] = [[40, 103], [80, 135], [113, 50], [188, 157], [138, 195], [158, 48], [202, 165]];

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** The road from the top left corner, clockwise and inwards: `count` centres, their lengths along the road and ring. */
function spiral(w: number, h: number, count: number): { pts: Point[]; along: number[] } {
  const pts: Point[] = [], along: number[] = [];
  let a = 0;
  for (let k = 0; pts.length < count; k++) {
    const x1 = w - a, y1 = h - a, g = WALL_THIN;
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
      }
    }
    a += 1 + g;
  }
  return { pts, along };
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
  if (board.rules.forks.length) throw new Error(`board "${board.id}": the Shortcut (R20) is not drawn by this game (removed, owner 15 Oct)`);
  // The first START_LEN places are the Start square, then squares 1..last, then one more: END.
  const road = spiral(w, h, START_LEN + last + 1);
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
  const g = WALL_THIN; // the festival keeps a wall's width from the squares around it
  const clear = (q: Box) => q.x0 >= -0.5 && q.y0 >= -0.5 && q.x1 <= w + 0.5 && q.y1 <= h + 0.5
    && boxes.every((b) => b.x1 + g <= q.x0 + 1e-6 || b.x0 - g >= q.x1 - 1e-6 || b.y1 + g <= q.y0 + 1e-6 || b.y0 - g >= q.y1 - 1e-6);
  let pad: Box = { x0: roadEnd.x - 0.3, x1: roadEnd.x + 0.3, y0: roadEnd.y - 0.3, y1: roadEnd.y + 0.3 };
  for (let grew = clear(pad); grew;) {
    grew = false;
    for (const [k, d] of [["x0", -0.05], ["x1", 0.05], ["y0", -0.05], ["y1", 0.05]] as const) {
      const t = { ...pad, [k]: pad[k] + d };
      if (clear(t)) { pad = t; grew = true; }
    }
  }
  const end = { x: (pad.x0 + pad.x1) / 2, y: (pad.y0 + pad.y1) / 2 };
  const endPad: Pad = { centre: end, w: pad.x1 - pad.x0, h: pad.y1 - pad.y0 };
  const drawings = drawingsFor(board).map(([from, to]): Drawing => ({ kind: to > from ? "cable" : "river", from, to, path: [squares[from], squares[to]] }));
  const layout: BoardLayout = {
    board, squares, along, heading, drawings, start, endPad, end,
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

/** Centre of a token's place (engine `Pos`). */
export function pointOf(layout: BoardLayout, pos: Pos): Point {
  if (pos === OFF || pos === 0) return layout.start.centre;
  if (pos === layout.board.endTile) return layout.end;
  return layout.squares[pos];
}

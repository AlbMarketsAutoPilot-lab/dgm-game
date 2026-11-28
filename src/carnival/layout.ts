// The Carnival's board (Step I phase D, owner 28 Nov 2026): a zig-zag snake, like the canals. 100 equal squares in
// 10 rows of 10: row 1 runs left to right, row 2 right to left, and so on; the road steps straight down into the next
// row through the thin wall between the rows. Home sits just before square 1, the destination (the Flight of the
// Dove) just after square 100, outside the grid, on the side that has room:
//   "tall" (phones held upright): Home across the top, the destination's plaza across the bottom;
//   "wide" (phones held sideways, PC): Home and the plaza in a column on the left.
// Pure geometry, the same shape of answer as the Lantern Festival's spiral (src/render/layout.ts, not changed), so
// the Carnival's board view (board-view.ts) can place tokens, notifications and taps the same way.
import type { BoardLayout, Drawable, Pad, Place, Point } from "../render/layout";

/** Squares in a row, and rows. */
export const COLS = 10;
export const ROWS = 10;
/** The wall between the rows (and around the board), in squares. */
export const GAP = 0.36;
export const RIM = 0.38;
/** Upright: the plaza's height. Sideways: the left column's width. */
const PLAZA_H = 1.9;
const SIDE_W = 3.2;

export type Design = "tall" | "wide";

const rowY = (r: number) => r * (1 + GAP);

/** Centre of square n (1..100) on the grid. */
export function squarePoint(n: number): Point {
  const r = Math.floor((n - 1) / COLS), i = (n - 1) % COLS;
  return { x: r % 2 === 0 ? i : COLS - 1 - i, y: rowY(r) };
}

/** The outer size (w × h units) of each design. */
function sizeOf(d: Design): [number, number] {
  const gridW = COLS, gridH = rowY(ROWS - 1) + 1;
  return d === "tall" ? [gridW + 2 * RIM, 1 + GAP + gridH + GAP + PLAZA_H + 2 * RIM] : [SIDE_W + GAP + gridW + 2 * RIM, gridH + 2 * RIM];
}

/** The design that gives the biggest squares in a panel of panelW × panelH pixels (no panel: "tall"). */
export function designFor(_board: Drawable, panelW = 0, panelH = 0): Design {
  if (!(panelW > 0 && panelH > 0)) return "tall";
  const side = (d: Design) => { const [w, h] = sizeOf(d); return Math.min(panelW / w, panelH / h); };
  return side("wide") > side("tall") + 0.01 ? "wide" : "tall";
}

const cache = new Map<string, BoardLayout>();

export function layoutFor(board: Drawable, panelW = 0, panelH = 0): BoardLayout {
  const d = designFor(board, panelW, panelH), key = `${board.id}:${d}`;
  let l = cache.get(key);
  if (!l) cache.set(key, (l = layoutForDesign(board, d)));
  return l;
}

/** The layout of one design. */
export function layoutForDesign(board: Drawable, d: Design): BoardLayout {
  if (board.lastTile !== COLS * ROWS) throw new Error(`the snake needs ${COLS * ROWS} squares`);
  const left = -0.5, right = COLS - 0.5, top = -0.5, bottom = rowY(ROWS - 1) + 0.5;
  let start: Pad, endPad: Pad;
  if (d === "tall") {
    start = { centre: { x: (left + right) / 2, y: top - GAP - 0.5 }, w: COLS, h: 1 };
    endPad = { centre: { x: (left + right) / 2, y: bottom + GAP + PLAZA_H / 2 }, w: COLS, h: PLAZA_H };
  } else {
    const x = left - GAP - SIDE_W / 2, homeBottom = rowY(2) + 0.5; // Home beside rows 1–3, the plaza beside rows 4–10
    start = { centre: { x, y: (top + homeBottom) / 2 }, w: SIDE_W, h: homeBottom - top };
    endPad = { centre: { x, y: (homeBottom + GAP + bottom) / 2 }, w: SIDE_W, h: bottom - homeBottom - GAP };
  }
  const squares: Point[] = [start.centre], along: number[] = [start.w];
  for (let n = 1; n <= board.lastTile; n++) { squares.push(squarePoint(n)); along.push(1); }
  const end = endPad.centre;
  const heading = squares.map((p, n) => {
    if (n === 0) return d === "tall" ? { x: 0, y: 1 } : { x: 1, y: 0 };
    if (n === board.lastTile) return d === "tall" ? { x: 0, y: 1 } : { x: -1, y: 0 };
    const q = squares[n + 1], len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: (q.x - p.x) / len, y: (q.y - p.y) / len };
  });
  const x0 = Math.min(start.centre.x - start.w / 2, endPad.centre.x - endPad.w / 2, left) - RIM;
  const y0 = Math.min(start.centre.y - start.h / 2, top) - RIM;
  const x1 = right + RIM, y1 = Math.max(endPad.centre.y + endPad.h / 2, bottom) + RIM;
  const box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  return { board, squares, along, heading, start, endPad, end, home: start.centre, maze: box, bounds: box, legend: { x: 0, y: 0, w: 0, h: 0 } };
}

/** Centre of a token's place (engine `Pos`). */
export function pointOf(layout: BoardLayout, pos: Place): Point {
  if (pos <= 0) return layout.start.centre;
  if (pos === layout.board.endTile) return layout.end;
  return layout.squares[pos];
}

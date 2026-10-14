// Where everything sits on the board, in board units (1 unit = the distance between two neighbouring squares).
// Pure geometry, no canvas: the painter (Step 3), the animation and the camera (Step 4) all read it.
//
// Long board: the paper path (archived transcription §8.4), an inward square spiral: top row Start → 19 left to
// right, right column 20 → 36 down, bottom row 37 → 55 right to left, left column 56 → 70 up, then the next ring…
// up to 201 → 202 and END above 202. Rings sit one square apart, so the gap between two rings is a corridor: the
// Shortcuts (R20) run there, beside the Main Road they replace.
// Short board (GCD §10.1, layout designed here): a classic snakes-and-ladders grid (see SHORT_PATH).
import { BOARDS, OFF, OUT, isShortcut, shortcutOf } from "../engine";
import type { Board, Pos } from "../engine";

export interface Point {
  x: number;
  y: number;
}

/** A ladder or a snake as drawn on the paper; `path` runs from the square it starts on to its destination. */
export interface Drawing {
  kind: "ladder" | "snake";
  from: number;
  to: number;
  /** Crayon colour of the drawing (paper colours, archived transcription §6, §8.1). */
  colour: string;
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

export interface BoardLayout {
  board: Board;
  /** Board area (squares and drawings) in units, including a margin. */
  bounds: { x: number; y: number; w: number; h: number };
  /** Drawn size of a square (a little smaller than 1, so neighbours do not touch). */
  tile: number;
  /** squares[n] = centre of square n (0 = Start). */
  squares: Point[];
  end: Point;
  /** Where tokens wait before entering (R1), beside Start. */
  home: Point;
  /** Unit vector of the direction of travel at each square (for arrows and stair steps). */
  heading: Point[];
  shortcuts: ShortcutLayout[];
  drawings: Drawing[];
}

type Seg = [first: number, last: number, from: [number, number], to: [number, number]];

// The paper path, segment by segment (Start = 0). Rings are 2 units apart; the paper's own square counts per side
// are kept, so a few top rows are slightly tighter than 1 unit, as on the hand-drawn board.
const LONG_PATH: Seg[] = [
  [0, 19, [0, 0], [19, 0]], [20, 36, [19, 1], [19, 17]], [37, 55, [18, 17], [0, 17]], [56, 70, [0, 16], [0, 2]],
  [71, 88, [1, 2], [17, 2]], [89, 101, [17, 3], [17, 15]], [102, 116, [16, 15], [2, 15]], [117, 127, [2, 14], [2, 4]],
  [128, 141, [3, 4], [15, 4]], [142, 150, [15, 5], [15, 13]], [151, 161, [14, 13], [4, 13]], [162, 168, [4, 12], [4, 6]],
  [169, 178, [5, 6], [13, 6]], [179, 183, [13, 7], [13, 11]], [184, 190, [12, 11], [6, 11]], [191, 193, [6, 10], [6, 8]],
  [194, 198, [7, 8], [11, 8]], [199, 200, [11, 9], [11, 10]], [201, 202, [10, 10], [9, 10]],
];

// The Quick Trip (layout designed in Step 3): the classic snakes-and-ladders grid, 10 rows of 10 winding upwards
// (1 bottom left, 100 top left, END above 100), rows 1.6 apart so each gap is a corridor for a Shortcut.
// Portrait, so it suits a phone held upright.
const ROW = 1.6;
const rowY = (k: number) => (10 - k) * ROW; // row k holds squares 10k+1 … 10k+10
const SHORT_PATH: Seg[] = [
  [0, 0, [-1, rowY(0)], [-1, rowY(0)]],
  ...Array.from({ length: 10 }, (_, k): Seg => [10 * k + 1, 10 * k + 10, [k % 2 ? 9 : 0, rowY(k)], [k % 2 ? 0 : 9, rowY(k)]]),
];

interface Design {
  path: Seg[];
  end: [number, number];
  home: [number, number];
  /** Corridor waypoints of each Shortcut, between its crossroads and its meeting square. */
  trails: [number, number][][];
}

const DESIGNS: Record<string, Design> = {
  long: {
    path: LONG_PATH,
    end: [9, 9],
    home: [-1.6, 0],
    trails: [
      [[11.35, 1], [18, 1], [18, 10]], // 82 → up into the corridor, right, down the right corridor → 96
      [[5, 12], [14, 12], [14, 8]], // 160 → down into the corridor, right, up the right corridor → 180
    ],
  },
  short: {
    path: SHORT_PATH,
    end: [0, rowY(10)],
    home: [-2.4, rowY(0)],
    trails: [
      [[0.5, rowY(4) - ROW / 2], [6.5, rowY(4) - ROW / 2]], // 41 → the corridor above its row → 48
      [[0.5, rowY(7) - ROW / 2], [8.5, rowY(7) - ROW / 2]], // 80 → the corridor above its row → 90 (next row)
    ],
  },
};

/** Paper drawings (archived transcription §6.1, §8.1). The short board inherits them through the shared stories. */
const LONG_DRAWINGS: Omit<Drawing, "path">[] = [
  { kind: "ladder", from: 40, to: 103, colour: "#d8433b" },
  { kind: "ladder", from: 80, to: 135, colour: "#8a5a3c" },
  { kind: "ladder", from: 113, to: 50, colour: "#e8862f" },
  { kind: "ladder", from: 188, to: 157, colour: "#3d74c4" },
  { kind: "snake", from: 138, to: 195, colour: "#e8862f" },
  { kind: "snake", from: 158, to: 48, colour: "#3d74c4" },
  { kind: "snake", from: 202, to: 165, colour: "#2a3f7a" },
];

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const pt = ([x, y]: [number, number]): Point => ({ x, y });

/** Evenly spaced points strictly between the ends of a polyline: n points at 1/(n+1), 2/(n+1), … of its length. */
export function spaced(line: Point[], n: number): Point[] {
  const lens = line.slice(1).map((p, i) => dist(line[i], p)), total = lens.reduce((a, b) => a + b, 0), out: Point[] = [];
  for (let k = 1; k <= n; k++) {
    let d = (total * k) / (n + 1), i = 0;
    while (i < lens.length - 1 && d > lens[i]) d -= lens[i++];
    out.push(lerp(line[i], line[i + 1], lens[i] ? d / lens[i] : 0));
  }
  return out;
}

function ladderPath(a: Point, b: Point): Point[] {
  return Array.from({ length: 21 }, (_, i) => lerp(a, b, i / 20));
}

/** A snake's body: a few gentle S-bends from head (start square) to tail (destination), calm at both ends. */
function snakePath(a: Point, b: Point): Point[] {
  const L = dist(a, b), nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L, waves = Math.max(2, Math.round(L / 3)), amp = Math.min(0.8, 0.12 * L);
  return Array.from({ length: 81 }, (_, i) => {
    const t = i / 80, p = lerp(a, b, t), s = amp * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * waves * t);
    return { x: p.x + nx * s, y: p.y + ny * s };
  });
}

function drawingsFor(board: Board, squares: Point[]): Drawing[] {
  let list = LONG_DRAWINGS;
  if (board.id !== "long") { // same story text = the same paper event, so the same drawing
    const long = BOARDS.long.tiles;
    list = [];
    for (const [k, t] of Object.entries(board.tiles)) {
      if (t.type !== "jump") continue;
      const src = LONG_DRAWINGS.find((d) => long[d.from]?.story === t.story);
      if (src) list.push({ ...src, from: Number(k), to: t.to! });
    }
  }
  return list.map((d) => {
    const a = squares[d.from], b = squares[d.to], path = (d.kind === "ladder" ? ladderPath : snakePath)(a, b);
    path[0] = a; path[path.length - 1] = b; // exactly on the squares
    return { ...d, path };
  });
}

const cache = new Map<Board, BoardLayout>();

export function layoutFor(board: Board): BoardLayout {
  const hit = cache.get(board);
  if (hit) return hit;
  const design = DESIGNS[board.id];
  if (!design) throw new Error(`no layout for board "${board.id}"`);
  const squares: Point[] = [];
  for (const [first, last, from, to] of design.path) {
    const n = last - first + 1;
    for (let i = 0; i < n; i++) squares[first + i] = lerp(pt(from), pt(to), n === 1 ? 0 : i / (n - 1));
  }
  if (squares.length !== board.lastTile + 1 || squares.some((p) => !p)) throw new Error(`layout of "${board.id}" does not cover Start..${board.lastTile}`);
  const end = pt(design.end);
  const next = (n: number) => (n < board.lastTile ? squares[n + 1] : end);
  const heading = squares.map((p, n) => {
    const q = next(n), d = dist(p, q) || 1;
    return { x: (q.x - p.x) / d, y: (q.y - p.y) / d };
  });
  const shortcuts = board.rules.forks.map((f, k) => {
    const trail = [squares[f.at], ...design.trails[k].map(pt), squares[f.merge]];
    return { fork: k, at: f.at, merge: f.merge, trail, stones: spaced(trail, f.len) };
  });
  const drawings = drawingsFor(board, squares);
  const all = [...squares, end, pt(design.home)];
  const minX = Math.min(...all.map((p) => p.x)) - 1, minY = Math.min(...all.map((p) => p.y)) - 1;
  const maxX = Math.max(...all.map((p) => p.x)) + 1, maxY = Math.max(...all.map((p) => p.y)) + 1;
  const layout: BoardLayout = {
    board, squares, end, heading, shortcuts, drawings,
    home: pt(design.home),
    tile: 0.84,
    bounds: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
  };
  cache.set(board, layout);
  return layout;
}

/**
 * Centre of a token's place (engine `Pos`), for drawing and animating tokens. `stair` = R17 stair step on top of the
 * square (0 = the square itself): steps go sideways from the square, against the direction of travel's left side.
 */
export function pointOf(layout: BoardLayout, pos: Pos, stair = 0): Point {
  if (pos === OFF || pos === OUT) return layout.home;
  if (pos === layout.board.endTile) return layout.end;
  if (isShortcut(pos)) {
    const { fork, index } = shortcutOf(pos);
    return layout.shortcuts[fork].stones[index - 1];
  }
  const p = layout.squares[pos];
  if (!stair) return p;
  const h = layout.heading[pos];
  return { x: p.x + h.y * 0.22 * stair, y: p.y - h.x * 0.22 * stair };
}

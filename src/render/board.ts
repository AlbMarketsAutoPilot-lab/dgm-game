// Paints a board as it looks on paper (GCD §14, P6): purple wobbly squares, crayon-coloured events with an icon and a
// good / bad marker (shape, not only colour), the Shortcuts as stepping stones, ladders and snakes on top.
// Everything is drawn in board units (see layout.ts); `renderBoard` makes a cached bitmap for the camera (Step 4).
import type { Tile } from "../engine";
import { drawIcon } from "./icons";
import { type BoardLayout, type Point, layoutFor } from "./layout";
import { INK, INK_SOFT, PAPER, PUNISH, REGION_WASH, REWARD, SHORTCUT_COLOURS, crayonFor, regionOf } from "./palette";
import { crayonFill, hand, inkStroke, paintPaper, pen, wobblyBox, wobblyLine } from "./sketch";
import type { Board } from "../engine";

const INK_W = 0.035;

/** Good square: a small up chevron in green; bad square: a down chevron in red. */
function marker(ctx: CanvasRenderingContext2D, cat: "R" | "P", x: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = cat === "R" ? REWARD : PUNISH;
  ctx.lineWidth = 0.05;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const s = cat === "R" ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x - 0.075, y - 0.035 * s);
  ctx.lineTo(x, y + 0.04 * s);
  ctx.lineTo(x + 0.075, y - 0.035 * s);
  ctx.stroke();
  ctx.restore();
}

/** An icon on a small paper disc, so it stays readable on every crayon colour. */
function badge(ctx: CanvasRenderingContext2D, icon: string, x: number, y: number, r: number, ink = INK): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = PAPER;
  ctx.globalAlpha = 0.88;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = ink;
  drawIcon(ctx, icon, x, y, r * 1.55, 1.8);
}

function destination(t: Tile): string | null {
  if (t.type !== "jump" || t.to === undefined) return null;
  if (t.to === 0) return "→ Start";
  return `→ ${t.to}`;
}

/** Splits a landmark name over two lines when it is long. */
function lines(name: string): string[] {
  if (name.length <= 9 || !name.includes(" ")) return [name];
  const i = name.indexOf(" ");
  return [name.slice(0, i), name.slice(i + 1)];
}

/** The square itself: wobbly ink box, crayon colour (events) or the region's wash (plain squares). */
function paintSquareBase(ctx: CanvasRenderingContext2D, L: BoardLayout, n: number): void {
  const { board, tile: T } = L, p = L.squares[n], r = pen(`${board.id}:${n}`), t = board.tiles[n];
  const box = { x: p.x - T / 2 - 0.05, y: p.y - T / 2 - 0.05, w: T + 0.1, h: T + 0.1 };
  const shape = wobblyBox(p.x, p.y, T, T, r);
  ctx.fillStyle = PAPER;
  ctx.fill(shape);
  if (t) crayonFill(ctx, shape, crayonFor(board, n, t), box, r);
  else {
    ctx.fillStyle = REGION_WASH[regionOf(board, n)];
    ctx.fill(shape);
  }
  inkStroke(ctx, shape, INK, INK_W, r);
}

/** What is written on a square (above the ladders and snakes, so a drawing never hides it). */
function paintSquareLabels(ctx: CanvasRenderingContext2D, L: BoardLayout, n: number): void {
  const { board, tile: T } = L, p = L.squares[n], t = board.tiles[n];
  if (n === 0) {
    hand(ctx, "Start", p.x, p.y, 0.3, INK, "center", true);
    return;
  }
  hand(ctx, String(n), p.x - T / 2 + 0.07, p.y - T / 2 + 0.13, 0.21, INK, "left", true);
  if (t) {
    badge(ctx, t.icon ?? "card", p.x, p.y + 0.04, 0.23);
    marker(ctx, t.cat, p.x + T / 2 - 0.13, p.y - T / 2 + 0.13);
    const dest = destination(t);
    if (dest) hand(ctx, dest, p.x + T / 2 - 0.05, p.y + T / 2 - 0.1, 0.16, INK, "right", true);
    return;
  }
  const lm = board.story.landmarks[n];
  if (lm) {
    ctx.strokeStyle = INK_SOFT;
    drawIcon(ctx, lm.icon, p.x, p.y - 0.02, 0.32, 1.8);
    lines(lm.name).forEach((s, i, a) => hand(ctx, s, p.x, p.y + T / 2 - 0.1 - (a.length - 1 - i) * 0.12, 0.13, INK, "center", true));
    return;
  }
  const fork = board.rules.forks.findIndex((f) => f.at === n), merge = board.rules.forks.findIndex((f) => f.merge === n);
  if (fork >= 0 || merge >= 0) {
    ctx.strokeStyle = INK_SOFT;
    drawIcon(ctx, fork >= 0 ? "signpost" : "joining-paths", p.x, p.y + 0.04, 0.36, 1.8);
  }
}

function paintShortcuts(ctx: CanvasRenderingContext2D, L: BoardLayout): void {
  const roads = (L.board.story.roads ?? {}) as { forks?: { tiles?: Record<string, { icon?: string }> }[] };
  for (const s of L.shortcuts) {
    const r = pen(`${L.board.id}:shortcut${s.fork}`), fork = L.board.rules.forks[s.fork];
    ctx.save();
    ctx.setLineDash([0.08, 0.12]);
    ctx.strokeStyle = INK_SOFT;
    ctx.lineWidth = 0.035;
    ctx.lineCap = "round";
    ctx.stroke(wobblyLine(s.trail, r, 0.01));
    ctx.restore();
    s.stones.forEach((q, i) => {
      const t = fork.tiles[i + 1], rs = pen(`${L.board.id}:stone${s.fork}:${i}`);
      const rx = t ? 0.3 : 0.23, ry = t ? 0.27 : 0.19;
      const stone = new Path2D();
      stone.ellipse(q.x, q.y, rx + (rs() - 0.5) * 0.03, ry + (rs() - 0.5) * 0.03, (rs() - 0.5) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = PAPER;
      ctx.fill(stone);
      crayonFill(ctx, stone, t ? SHORTCUT_COLOURS[t.cat] : "#a39e93", { x: q.x - rx, y: q.y - rx, w: 2 * rx, h: 2 * rx }, rs, 1.4);
      inkStroke(ctx, stone, INK, 0.028, rs);
      if (t) {
        const icon = roads.forks?.[s.fork]?.tiles?.[String(i + 1)]?.icon ?? (t.cat === "R" ? "rope-swing" : "maze");
        badge(ctx, icon, q.x, q.y, 0.17);
        marker(ctx, t.cat, q.x + rx * 0.9, q.y - ry - 0.04);
      }
    });
  }
}

function paintLadder(ctx: CanvasRenderingContext2D, a: Point, b: Point, colour: string, seed: string): void {
  const r = pen(seed), dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, w = 0.17;
  const rail = (s: number) => {
    const line = wobblyLine(Array.from({ length: 9 }, (_, i) => ({ x: a.x + (dx * i) / 8 + nx * w * s, y: a.y + (dy * i) / 8 + ny * w * s })), r, 0.015);
    ctx.lineWidth = 0.075; ctx.strokeStyle = INK; ctx.stroke(line);
    ctx.lineWidth = 0.05; ctx.strokeStyle = colour; ctx.stroke(line);
  };
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.lineCap = "round";
  const rungs = Math.floor(len / 0.38);
  for (let i = 1; i < rungs; i++) {
    const t = i / rungs, x = a.x + dx * t, y = a.y + dy * t;
    ctx.beginPath();
    ctx.moveTo(x - nx * w, y - ny * w);
    ctx.lineTo(x + nx * w + (r() - 0.5) * 0.02, y + ny * w + (r() - 0.5) * 0.02);
    ctx.lineWidth = 0.05; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = 0.03; ctx.strokeStyle = colour; ctx.stroke();
  }
  rail(-1);
  rail(1);
  ctx.restore();
}

function paintSnake(ctx: CanvasRenderingContext2D, path: Point[], colour: string): void {
  const n = path.length - 1, width = (i: number) => 0.07 + 0.17 * Math.pow(1 - i / n, 0.6);
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.92;
  for (const [extra, style] of [[0.05, INK], [0, colour]] as const) { // outline, then body
    for (let i = n; i > 0; i--) {
      ctx.beginPath();
      ctx.moveTo(path[i - 1].x, path[i - 1].y);
      ctx.lineTo(path[i].x, path[i].y);
      ctx.lineWidth = width(i) + extra;
      ctx.strokeStyle = style;
      ctx.stroke();
    }
  }
  ctx.fillStyle = INK; // back pattern
  for (let i = 6; i < n - 2; i += 5) {
    ctx.beginPath();
    ctx.arc(path[i].x, path[i].y, width(i) * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  const h = path[0], d = path[3], a = Math.atan2(h.y - d.y, h.x - d.x); // head, facing away from the body
  ctx.translate(h.x, h.y);
  ctx.rotate(a);
  ctx.beginPath();
  ctx.ellipse(0.04, 0, 0.21, 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.lineWidth = 0.035;
  ctx.strokeStyle = INK;
  ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(0.1, 0.065 * s, 0.035, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0.11, 0.065 * s, 0.017, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  }
  ctx.beginPath(); // tongue
  ctx.moveTo(0.25, 0);
  ctx.lineTo(0.36, 0);
  ctx.lineTo(0.41, -0.03);
  ctx.moveTo(0.36, 0);
  ctx.lineTo(0.41, 0.03);
  ctx.strokeStyle = PUNISH;
  ctx.lineWidth = 0.02;
  ctx.stroke();
  ctx.restore();
}

function paintEndBase(ctx: CanvasRenderingContext2D, L: BoardLayout): void {
  const r = pen(`${L.board.id}:end`), e = L.end, S = 0.96;
  const shape = wobblyBox(e.x, e.y, S, S, r, 0.03);
  ctx.fillStyle = PAPER;
  ctx.fill(shape);
  crayonFill(ctx, shape, "#f2c230", { x: e.x - S / 2 - 0.05, y: e.y - S / 2 - 0.05, w: S + 0.1, h: S + 0.1 }, r);
  inkStroke(ctx, shape, INK, 0.05, r);
}

function paintEndAndHomeLabels(ctx: CanvasRenderingContext2D, L: BoardLayout): void {
  const e = L.end;
  ctx.strokeStyle = INK;
  drawIcon(ctx, "lanterns", e.x, e.y - 0.12, 0.5, 1.7);
  hand(ctx, "END", e.x, e.y + 0.27, 0.26, INK, "center", true);
  const h = L.home, start = (L.board.story as { start?: { name?: string; icon?: string } }).start;
  ctx.strokeStyle = INK;
  drawIcon(ctx, start?.icon ?? "house", h.x, h.y - 0.1, 0.62, 1.6);
  hand(ctx, start?.name ?? "Home", h.x, h.y + 0.38, 0.22, INK);
}

/** Paints the whole board in board units onto `ctx` (the caller sets the transform). */
export function paintBoard(ctx: CanvasRenderingContext2D, L: BoardLayout): void {
  paintShortcuts(ctx, L);
  for (let n = 0; n < L.squares.length; n++) paintSquareBase(ctx, L, n);
  paintEndBase(ctx, L);
  L.drawings.forEach((d) => {
    if (d.kind === "ladder") paintLadder(ctx, d.path[0], d.path.at(-1)!, d.colour, `${L.board.id}:ladder${d.from}`);
    else paintSnake(ctx, d.path, d.colour);
  });
  for (let n = 0; n < L.squares.length; n++) paintSquareLabels(ctx, L, n);
  paintEndAndHomeLabels(ctx, L);
}

/**
 * The board as a bitmap on paper, `pxPerUnit` pixels per board unit. Returns the canvas and the transform that maps
 * board units to its pixels (x_px = (x - origin.x) * scale).
 */
export function renderBoard(board: Board, pxPerUnit: number): { canvas: HTMLCanvasElement; origin: Point; scale: number } {
  const L = layoutFor(board), b = L.bounds;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(b.w * pxPerUnit);
  canvas.height = Math.ceil(b.h * pxPerUnit);
  const ctx = canvas.getContext("2d")!;
  paintPaper(ctx, canvas.width, canvas.height);
  ctx.setTransform(pxPerUnit, 0, 0, pxPerUnit, -b.x * pxPerUnit, -b.y * pxPerUnit);
  paintBoard(ctx, L);
  return { canvas, origin: { x: b.x, y: b.y }, scale: pxPerUnit };
}

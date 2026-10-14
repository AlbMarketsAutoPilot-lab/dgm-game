// Hand-drawn primitives: wobbly ink outlines, crayon hatching, paper texture, handwriting.
// Every wobble comes from a seeded random source, so the board looks the same each time it is drawn.
import { type Rng, rng } from "../engine";
import { PAPER } from "./palette";

export const FONT = '"Patrick Hand", "Comic Sans MS", cursive';

/** A random source for one drawn element, from a name (the same name always wobbles the same way). */
export function pen(name: string): Rng {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  return rng(h);
}

const jit = (r: Rng, a: number) => (r() * 2 - 1) * a;

/** A slightly wobbly box centred on (cx, cy). */
export function wobblyBox(cx: number, cy: number, w: number, h: number, r: Rng, wob = 0.025): Path2D {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  const P = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => [x + jit(r, wob), y + jit(r, wob)]);
  const path = new Path2D();
  path.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i <= 4; i++) {
    const a = P[i - 1], b = P[i % 4];
    path.quadraticCurveTo((a[0] + b[0]) / 2 + jit(r, wob), (a[1] + b[1]) / 2 + jit(r, wob), b[0], b[1]);
  }
  path.closePath();
  return path;
}

/** Ink outline: the path drawn twice with a small offset, like a pen going over its line. */
export function inkStroke(ctx: CanvasRenderingContext2D, path: Path2D, colour: string, width: number, r: Rng): void {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.stroke(path);
  ctx.globalAlpha = 0.45;
  ctx.translate(jit(r, width * 0.6), jit(r, width * 0.6));
  ctx.lineWidth = width * 0.6;
  ctx.stroke(path);
  ctx.restore();
}

/** Crayon fill of a path: a light wash and diagonal strokes, clipped to the path; `box` = the path's bounds. */
export function crayonFill(ctx: CanvasRenderingContext2D, path: Path2D, colour: string, box: { x: number; y: number; w: number; h: number }, r: Rng, density = 1): void {
  ctx.save();
  ctx.clip(path);
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = colour;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = colour;
  ctx.lineCap = "round";
  const step = 0.055 / density, span = box.w + box.h;
  for (let t = -span; t < span; t += step) {
    ctx.lineWidth = 0.03 + r() * 0.025;
    ctx.beginPath();
    ctx.moveTo(box.x + t + jit(r, 0.02), box.y + box.h + 0.05);
    ctx.lineTo(box.x + t + box.h + jit(r, 0.04), box.y - 0.05);
    ctx.stroke();
  }
  ctx.restore();
}

/** Handwritten text centred on (x, y), `size` units high; `halo` = a paper-coloured outline for contrast. */
export function hand(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, colour: string, align: CanvasTextAlign = "center", halo = false): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.font = `100px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  if (halo) {
    ctx.lineWidth = 18;
    ctx.lineJoin = "round";
    ctx.strokeStyle = PAPER;
    ctx.globalAlpha = 0.85;
    ctx.strokeText(text, 0, 0);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = colour;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** A wobbly polyline through `pts`. */
export function wobblyLine(pts: { x: number; y: number }[], r: Rng, wob = 0.02): Path2D {
  const path = new Path2D();
  pts.forEach((p, i) => (i ? path.lineTo(p.x + jit(r, wob), p.y + jit(r, wob)) : path.moveTo(p.x, p.y)));
  return path;
}

/** Paints off-white paper (fibres, speckles, two fold lines) over a w × h pixel canvas. */
export function paintPaper(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const r = pen("paper");
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(160,130,90,0.16)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const n = Math.round((w * h) / 900);
  for (let i = 0; i < n; i++) { // speckles
    ctx.fillStyle = r() < 0.5 ? "rgba(120,100,70,0.10)" : "rgba(255,255,255,0.35)";
    ctx.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  ctx.strokeStyle = "rgba(150,125,90,0.07)";
  for (let i = 0; i < n / 6; i++) { // fibres
    const x = r() * w, y = r() * h, a = r() * Math.PI, l = 4 + r() * 10;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  for (const [x0, y0, x1, y1] of [[w / 2, 0, w / 2, h], [0, h / 2, w, h / 2]]) { // fold lines
    const g = ctx.createLinearGradient(x0 - (y1 - y0 ? 6 : 0), y0 - (x1 - x0 ? 6 : 0), x0 + (y1 - y0 ? 6 : 0), y0 + (x1 - x0 ? 6 : 0));
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.5, "rgba(120,95,60,0.13)");
    g.addColorStop(0.55, "rgba(255,255,255,0.4)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    if (x0 === x1) ctx.fillRect(x0 - 6, 0, 12, h); else ctx.fillRect(0, y0 - 6, w, 12);
  }
  ctx.restore();
}

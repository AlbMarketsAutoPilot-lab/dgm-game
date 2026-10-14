// Hand-drawn primitives as SVG markup: wobbly ink outlines, crayon hatching, paper texture.
// Every wobble comes from a seeded random source, so the board looks the same each time it is drawn.
import { type Rng, rng } from "../engine";

/** A random source for one drawn element, from a name (the same name always wobbles the same way). */
export function pen(name: string): Rng {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  return rng(h);
}

const jit = (r: Rng, a: number) => (r() * 2 - 1) * a;
const f = (x: number) => +x.toFixed(2);

/** SVG path data of a slightly wobbly box centred on (cx, cy). */
export function wobblyBox(cx: number, cy: number, w: number, h: number, r: Rng, wob = 2.5): string {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  const P = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => [x + jit(r, wob), y + jit(r, wob)]);
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 1; i <= 4; i++) {
    const a = P[i - 1], b = P[i % 4];
    d += `Q${f((a[0] + b[0]) / 2 + jit(r, wob))} ${f((a[1] + b[1]) / 2 + jit(r, wob))} ${f(b[0])} ${f(b[1])}`;
  }
  return d + "Z";
}

/** SVG path data of a wobbly line through `pts`. */
export function wobblyLine(pts: { x: number; y: number }[], r: Rng, wob = 1.5): string {
  return pts.map((p, i) => `${i ? "L" : "M"}${f(p.x + (i ? jit(r, wob) : 0))} ${f(p.y + (i ? jit(r, wob) : 0))}`).join("");
}

/** A crayon hatch pattern of one colour (id from the colour), for SVG <defs>. */
export function hatchPattern(id: string, colour: string): string {
  return `<pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">`
    + `<rect width="7" height="7" fill="${colour}" opacity="0.38"/>`
    + `<path d="M0 1.5h7M0 5h7" stroke="${colour}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/></pattern>`;
}

/** Off-white paper grain as a small tiling background image (rendered once by the browser). */
export const PAPER_TEXTURE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>`
  + `<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0.11 0"/></filter>`
  + `<rect width="240" height="240" fill="#f7f1e3"/><rect width="240" height="240" filter="url(#n)"/></svg>`,
)}")`;

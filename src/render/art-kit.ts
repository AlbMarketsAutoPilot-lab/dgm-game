// Shared pieces for the illustrations: palette, ink outlines, reusable motions and small scenery helpers.
// Motions are CSS animations on transform / opacity only (cheap on phones), tuned per element with CSS variables:
//   --d duration (s), --dl delay (s), --a distance (px), --r angle (deg), --x / --y offset (px), --s scale.

export const INK = "#4b2377";
/** Ink outline, normal and thin. */
export const S = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
export const S2 = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;

export const C = {
  sky: "#cfeaff", water: "#7fc8f8", deep: "#3d74c4", grass: "#a8c94a", leaf: "#4c9a52", pine: "#2f7a45",
  red: "#d8433b", orange: "#e8862f", yellow: "#f2c230", gold: "#f6d55c", brown: "#a0683f", dbrown: "#6b4f34",
  mud: "#7a5c3e", grey: "#b8b2a6", steel: "#8d99a6", dark: "#3a2f45", white: "#fffdf6", snow: "#ffffff",
  skin: "#f5c9a0", pink: "#f08bb4", purple: "#9b59b6", teal: "#2aa198", paper: "#f7f1e3", glass: "#bfe6ff",
  sand: "#f1d9a6", cream: "#f7e2b8",
};

type Motion = "bob" | "sway" | "spin" | "drift" | "slide" | "move" | "puff" | "fall" | "twinkle" | "flicker" | "pulse"
  | "ripple" | "blink" | "hop" | "wave" | "shake" | "dash" | "tilt";

interface MotionOpts {
  d?: number; dl?: number; a?: number; r?: number; x?: number; y?: number; s?: number;
  /** Pivot point on the 100 × 100 grid (rotations and scaling around it); default: the element's own centre. */
  o?: [number, number];
  /** Play backwards / alternate the other way. */
  rev?: boolean;
}

/** class + style attributes that give an element one of the shared motions. */
export function A(kind: Motion, o: MotionOpts = {}): string {
  const v: string[] = [];
  if (o.d !== undefined) v.push(`--d:${o.d}`);
  if (o.dl !== undefined) v.push(`--dl:${o.dl}`);
  if (o.a !== undefined) v.push(`--a:${o.a}`);
  if (o.r !== undefined) v.push(`--r:${o.r}`);
  if (o.x !== undefined) v.push(`--x:${o.x}`);
  if (o.y !== undefined) v.push(`--y:${o.y}`);
  if (o.s !== undefined) v.push(`--s:${o.s}`);
  if (o.o) v.push(`transform-box:view-box;transform-origin:${o.o[0]}px ${o.o[1]}px`);
  if (o.rev) v.push("animation-direction:alternate-reverse");
  return ` class="a-${kind}"${v.length ? ` style="${v.join(";")}"` : ""}`;
}

/** The shared motions (added to the page once, with the illustrations). */
export const KIT_CSS = `
.a-bob { animation: k-bob calc(var(--d, 2) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite alternate; }
@keyframes k-bob { from { transform: translateY(0); } to { transform: translateY(calc(var(--a, 3) * -1px)); } }
.a-sway { animation: k-sway calc(var(--d, 2) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite alternate; }
@keyframes k-sway { from { transform: rotate(calc(var(--r, 5) * -1deg)); } to { transform: rotate(calc(var(--r, 5) * 1deg)); } }
.a-tilt { animation: k-tilt calc(var(--d, 2) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite alternate; }
@keyframes k-tilt { from { transform: rotate(0); } to { transform: rotate(calc(var(--r, 5) * 1deg)); } }
.a-spin { animation: k-spin calc(var(--d, 2) * 1s) linear calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-spin { to { transform: rotate(calc(var(--r, 360) * 1deg)); } }
.a-drift { animation: k-drift calc(var(--d, 6) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite alternate; }
@keyframes k-drift { from { transform: translateX(calc(var(--x, 6) * -1px)); } to { transform: translateX(calc(var(--x, 6) * 1px)); } }
.a-slide { animation: k-slide calc(var(--d, 3) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite alternate; }
@keyframes k-slide { from { transform: translate(0, 0); } to { transform: translate(calc(var(--x, 10) * 1px), calc(var(--y, 0) * 1px)); } }
.a-move { animation: k-move calc(var(--d, 3) * 1s) linear calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-move { 0% { transform: translate(0, 0); opacity: 0; } 12%, 85% { opacity: 1; } 100% { transform: translate(calc(var(--x, 20) * 1px), calc(var(--y, 0) * 1px)); opacity: 0; } }
.a-puff { animation: k-puff calc(var(--d, 3) * 1s) ease-out calc(var(--dl, 0) * 1s) infinite; opacity: 0; }
@keyframes k-puff { 0% { transform: translate(0, 0) scale(.4); opacity: 0; } 20% { opacity: .95; } 100% { transform: translate(calc(var(--x, 6) * 1px), calc(var(--y, -18) * 1px)) scale(var(--s, 1.5)); opacity: 0; } }
.a-fall { animation: k-fall calc(var(--d, 3) * 1s) linear calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-fall { 0% { transform: translate(0, 0); opacity: 0; } 12%, 85% { opacity: 1; } 100% { transform: translate(calc(var(--x, 0) * 1px), calc(var(--y, 40) * 1px)); opacity: 0; } }
.a-twinkle { animation: k-twinkle calc(var(--d, 1.8) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-twinkle { 0%, 100% { transform: scale(.3) rotate(0); opacity: 0; } 50% { transform: scale(1) rotate(45deg); opacity: 1; } }
.a-flicker { animation: k-flicker calc(var(--d, 1.2) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite alternate; }
@keyframes k-flicker { from { opacity: .45; } to { opacity: 1; } }
.a-pulse { animation: k-pulse calc(var(--d, 1.2) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite alternate; }
@keyframes k-pulse { from { transform: scale(1); } to { transform: scale(var(--s, 1.12)); } }
.a-ripple { animation: k-ripple calc(var(--d, 2.4) * 1s) ease-out calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-ripple { 0% { transform: scale(.2); opacity: .9; } 100% { transform: scale(var(--s, 1.6)); opacity: 0; } }
.a-blink { animation: k-blink calc(var(--d, 3.6) * 1s) linear calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-blink { 0%, 90%, 100% { transform: scaleY(1); } 94% { transform: scaleY(.1); } }
.a-hop { animation: k-hop calc(var(--d, 1) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-hop { 0%, 55%, 100% { transform: translateY(0); } 25% { transform: translateY(calc(var(--a, 6) * -1px)); } }
.a-wave { animation: k-wave calc(var(--d, 1.6) * 1s) linear calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-wave { from { transform: translateX(0); } to { transform: translateX(20px); } }
.a-shake { animation: k-shake calc(var(--d, .5) * 1s) ease-in-out calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(calc(var(--r, 4) * -1deg)); } 75% { transform: rotate(calc(var(--r, 4) * 1deg)); } }
.a-dash { animation: k-dash calc(var(--d, 1.5) * 1s) linear calc(var(--dl, 0) * 1s) infinite; }
@keyframes k-dash { to { stroke-dashoffset: -20; } }
`;

// ---- Scenery helpers (return SVG markup on the 100 × 100 grid) ----

/** A circle path (for compound shapes). */
export const circ = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

/** Water from height y down, with two rolling wave lines. */
export function water(y: number, colour: string = C.water, line: string = C.deep): string {
  return `<rect x="-10" y="${y}" width="120" height="${110 - y}" fill="${colour}"/>` + waves(y, line) + waves(y + 10, line, 2.4, 0.6);
}

/** A rolling wave line at height y. */
export function waves(y: number, colour: string = C.deep, d = 1.6, opacity = 1): string {
  let p = `M-20 ${y}`;
  for (let i = 0; i < 14; i++) p += "q5-4 10 0";
  return `<g${A("wave", { d })}><path d="${p}" fill="none" stroke="${colour}" stroke-width="2.6" stroke-linecap="round" opacity="${opacity}"/></g>`;
}

/** A fluffy cloud, drifting. */
export function cloud(x: number, y: number, k = 1, d = 7): string {
  return `<g${A("drift", { d, x: 5 })}><path transform="translate(${x} ${y}) scale(${k})" d="M0 8c0-5 6-7 9-4 2-5 10-5 12 0 4-1 7 2 6 6H2c-1 0-2-1-2-2z" fill="${C.white}" ${S2}/></g>`;
}

/** A sun with turning rays. */
export function sun(x: number, y: number, r = 8): string {
  let rays = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
    rays += `M${(x + c * (r + 3)).toFixed(1)} ${(y + s * (r + 3)).toFixed(1)}L${(x + c * (r + 7)).toFixed(1)} ${(y + s * (r + 7)).toFixed(1)}`;
  }
  return `<g${A("spin", { d: 14, o: [x, y] })}><path d="${rays}" ${S2} stroke="${C.orange}"/></g><circle cx="${x}" cy="${y}" r="${r}" fill="${C.yellow}" ${S2}/>`;
}

/** Puffs of smoke or steam rising from (x, y). */
export function puffs(x: number, y: number, n = 3, colour: string = C.white, d = 3): string {
  return Array.from({ length: n }, (_, i) =>
    `<circle cx="${x}" cy="${y}" r="${4 + (i % 2)}" fill="${colour}" ${S2}${A("puff", { d, dl: (i * d) / n, x: 8, y: -20 })}/>`).join("");
}

/** A four-point sparkle. */
export function sparkle(x: number, y: number, k = 1, dl = 0): string {
  const s = 5 * k;
  return `<path d="M${x} ${y - s}l${s * 0.3} ${s * 0.7} ${s * 0.7} ${s * 0.3} ${-s * 0.7} ${s * 0.3} ${-s * 0.3} ${s * 0.7} ${-s * 0.3} ${-s * 0.7} ${-s * 0.7} ${-s * 0.3} ${s * 0.7} ${-s * 0.3}z" fill="#fff6b0" ${S2}${A("twinkle", { dl })}/>`;
}

/** A spoked wheel centred on (x, y), turning. */
export function wheel(x: number, y: number, r: number, fill: string = C.dark, d = 0.8, back = false): string {
  const sp = `M${x - r * 0.7} ${y}h${r * 1.4}M${x} ${y - r * 0.7}v${r * 1.4}M${x - r * 0.5} ${y - r * 0.5}l${r} ${r}M${x + r * 0.5} ${y - r * 0.5}l${-r} ${r}`;
  return `<g${A("spin", { d, o: [x, y], r: back ? -360 : 360 })}><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${S}/><path d="${sp}" stroke="${C.grey}" stroke-width="1.8"/><circle cx="${x}" cy="${y}" r="${r * 0.25}" fill="${C.grey}" ${S2}/></g>`;
}

/** A pine tree with its foot at (x, y). */
export function pine(x: number, y: number, k = 1, sway = true): string {
  const f = (n: number) => +n.toFixed(1);
  const pts = [[0, -34], [10, -20], [5, -20], [12, -6], [-12, -6], [-5, -20], [-10, -20]].map(([dx, dy]) => `${f(x + dx * k)} ${f(y + dy * k)}`);
  const t = `<path d="M${pts.join("L")}z" fill="${C.pine}" ${S2}/>`;
  const trunk = `<rect x="${f(x - 2 * k)}" y="${f(y - 6 * k)}" width="${f(4 * k)}" height="${f(6 * k)}" fill="${C.dbrown}" ${S2}/>`;
  return trunk + (sway ? `<g${A("sway", { r: 2, d: 3, o: [x, y] })}>${t}</g>` : t);
}

/** Grass ground from height y, with a few tufts. */
export function ground(y: number, fill: string = C.grass): string {
  return `<path d="M-5 ${y}h110v20H-5z" fill="${fill}" ${S}/><path d="M12 ${y}l2-5 2 5M70 ${y}l2-6 2 6M86 ${y}l2-4 2 4" fill="none" ${S2}/>`;
}

/** A small person (head at x, y): body colour. */
export function person(x: number, y: number, body: string, k = 1): string {
  return `<path d="M${x - 6 * k} ${y + 24 * k}l${2 * k} ${-14 * k}c${1 * k} ${-4 * k} ${7 * k} ${-4 * k} ${8 * k} 0l${2 * k} ${14 * k}z" fill="${body}" ${S2}/>`
    + `<circle cx="${x}" cy="${y}" r="${5.5 * k}" fill="${C.skin}" ${S2}/>`
    + `<circle cx="${x - 2 * k}" cy="${y - 0.5 * k}" r="${0.9 * k}" fill="${INK}"/><circle cx="${x + 2 * k}" cy="${y - 0.5 * k}" r="${0.9 * k}" fill="${INK}"/>`;
}

/** Snowflakes / raindrops falling over the whole picture. */
export function falling(kind: "snow" | "rain", n = 6, d = 3.2): string {
  return Array.from({ length: n }, (_, i) => {
    const x = 10 + ((i * 37) % 82), y = 4 + ((i * 23) % 20), dl = (i * d) / n;
    return kind === "snow"
      ? `<circle cx="${x}" cy="${y}" r="1.8" fill="${C.snow}" stroke="${INK}" stroke-width=".8"${A("fall", { d, dl, y: 60, x: 4 })}/>`
      : `<path d="M${x} ${y}l-1.5 5" stroke="${C.deep}" stroke-width="2" stroke-linecap="round"${A("fall", { d: d / 2, dl: dl / 2, y: 50, x: -6 })}/>`;
  }).join("");
}

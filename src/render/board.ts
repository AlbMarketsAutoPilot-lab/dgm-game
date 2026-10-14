// The board as a zoomable "world" of SVG and HTML (vector, so it stays sharp at square level on any phone).
// Layers, bottom to top: paper and square frames (one SVG), ladders and snakes (one SVG), then each square's number,
// illustration and labels (HTML), so a drawing never hides what a square says. Animated illustrations run only
// while their square is on screen (`setLive`).
import type { Board, Tile } from "../engine";
import { artCss, artFor } from "./art";
import { type BoardLayout, type Point, layoutFor } from "./layout";
import { INK, PAPER, PUNISH, REGION_WASH, REWARD, SHORTCUT_COLOURS, crayonFor, regionOf } from "./palette";
import { PAPER_TEXTURE, hatchPattern, pen, wobblyBox, wobblyLine } from "./sketch";
import "./board.css";

/** World pixels per board unit (the camera scales the world to the screen). */
export const UNIT = 100;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const f = (x: number) => +x.toFixed(1);

export interface BoardView {
  layout: BoardLayout;
  /** The world element (give it to the Camera). */
  world: HTMLElement;
  /** Board point → world pixel. */
  px: (p: Point) => Point;
  /** Starts animating the illustrations on screen inside `viewport`, pauses the others. */
  setLive: (viewport: HTMLElement) => void;
}

let cssInjected = false;
function injectArtCss(): void {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement("style");
  style.textContent = artCss();
  document.head.append(style);
}

function destination(t: Tile): string | null {
  if (t.type !== "jump" || t.to === undefined) return null;
  return t.to === 0 ? "→ Start" : `→ ${t.to}`;
}

const chevron = (cat: "R" | "P") =>
  `<svg class="mark" viewBox="0 0 20 14" aria-hidden="true"><path d="${cat === "R" ? "M3 11L10 3l7 8" : "M3 3l7 8 7-8"}" fill="none" stroke="${cat === "R" ? REWARD : PUNISH}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function snakeSvg(path: Point[], colour: string, P: (p: Point) => Point): string {
  const pts = path.map(P), n = pts.length - 1, width = (i: number) => (7 + 17 * Math.pow(1 - i / n, 0.6)) / 2;
  const left: string[] = [], right: string[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len, w = width(i);
    left.push(`${f(p.x + nx * w)} ${f(p.y + ny * w)}`);
    right.unshift(`${f(p.x - nx * w)} ${f(p.y - ny * w)}`);
  });
  const dots = pts.filter((_, i) => i > 4 && i < n - 3 && i % 5 === 0).map((p, k) => `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${k % 2 ? 2.4 : 3.2}" fill="${INK}" opacity=".7"/>`).join("");
  const h = pts[0], d = pts[3], ang = (Math.atan2(h.y - d.y, h.x - d.x) * 180) / Math.PI;
  return `<g class="snake"><path d="M${left.join("L")}L${right.join("L")}Z" fill="${colour}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>${dots}`
    + `<g transform="translate(${f(h.x)} ${f(h.y)}) rotate(${f(ang)})">`
    + `<g class="snake-tongue"><path d="M20 0h11l5-4M31 0l5 4" fill="none" stroke="${PUNISH}" stroke-width="2.4" stroke-linecap="round"/></g>`
    + `<ellipse cx="3" cy="0" rx="20" ry="14" fill="${colour}" stroke="${INK}" stroke-width="3.5"/>`
    + `<circle cx="10" cy="-6" r="3.6" fill="#fff"/><circle cx="11" cy="-6" r="1.8" fill="${INK}"/>`
    + `<circle cx="10" cy="6" r="3.6" fill="#fff"/><circle cx="11" cy="6" r="1.8" fill="${INK}"/></g></g>`;
}

function ladderSvg(a: Point, b: Point, colour: string, seed: string): string {
  const r = pen(seed), dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, w = 17;
  const rail = (s: number) => wobblyLine(Array.from({ length: 9 }, (_, i) => ({ x: a.x + (dx * i) / 8 + nx * w * s, y: a.y + (dy * i) / 8 + ny * w * s })), r, 1.2);
  let rungs = "";
  const k = Math.floor(len / 38);
  for (let i = 1; i < k; i++) {
    const x = a.x + (dx * i) / k, y = a.y + (dy * i) / k;
    rungs += `M${f(x - nx * w)} ${f(y - ny * w)}L${f(x + nx * w)} ${f(y + ny * w)}`;
  }
  return `<g class="ladder"><path d="${rungs}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="${rungs}" stroke="${colour}" stroke-width="4" stroke-linecap="round"/>`
    + [rail(-1), rail(1)].map((d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${colour}" stroke-width="5.5" stroke-linecap="round"/>`).join("")
    + "</g>";
}

/** Builds the world of `board`. */
export function createBoardView(board: Board): BoardView {
  injectArtCss();
  const L = layoutFor(board), B = L.bounds, W = B.w * UNIT, H = B.h * UNIT, T = L.tile * UNIT;
  const P = (p: Point): Point => ({ x: (p.x - B.x) * UNIT, y: (p.y - B.y) * UNIT });

  // ---- Paper, Shortcut trails and stones, square frames ----
  const colours = new Map<string, string>();
  const patternFor = (c: string) => { if (!colours.has(c)) colours.set(c, `h${colours.size}`); return `url(#${colours.get(c)})`; };
  let ground = "";
  for (const s of L.shortcuts) {
    const r = pen(`${board.id}:trail${s.fork}`);
    ground += `<path d="${wobblyLine(s.trail.map(P), r, 1)}" fill="none" stroke="${INK}" stroke-opacity=".45" stroke-width="3.5" stroke-dasharray="7 10" stroke-linecap="round"/>`;
    s.stones.forEach((q, i) => {
      const t = board.rules.forks[s.fork].tiles[i + 1], c = P(q), rx = t ? 30 : 23, ry = t ? 27 : 19;
      const fill = t ? patternFor(SHORTCUT_COLOURS[t.cat]) : patternFor("#a39e93");
      ground += `<ellipse cx="${f(c.x)}" cy="${f(c.y)}" rx="${rx}" ry="${ry}" fill="${PAPER}"/>`
        + `<ellipse cx="${f(c.x)}" cy="${f(c.y)}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${INK}" stroke-width="3"/>`;
    });
  }
  const frame = (key: string, c: Point, size: number, fill: string, width = 3.5) => {
    const r = pen(key), d = wobblyBox(c.x, c.y, size, size, r);
    return `<path d="${d}" fill="${PAPER}"/><path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${width}" stroke-linejoin="round"/>`;
  };
  L.squares.forEach((q, n) => {
    const t = board.tiles[n];
    ground += frame(`${board.id}:${n}`, P(q), T, t ? patternFor(crayonFor(board, n, t)) : REGION_WASH[regionOf(board, n)]);
  });
  ground += frame(`${board.id}:end`, P(L.end), 0.96 * UNIT, patternFor("#f2c230"), 5);
  const defs = [...colours].map(([c, id]) => hatchPattern(id, c)).join("");

  // ---- Ladders and snakes ----
  const drawings = L.drawings.map((d) =>
    d.kind === "ladder" ? ladderSvg(P(d.path[0]), P(d.path.at(-1)!), d.colour, `${board.id}:ladder${d.from}`) : snakeSvg(d.path, d.colour, P)).join("");

  // ---- What each square says ----
  const place = (c: Point, size: number) => `left:${f(c.x - size / 2)}px;top:${f(c.y - size / 2)}px;width:${f(size)}px;height:${f(size)}px`;
  let labels = "";
  L.squares.forEach((q, n) => {
    const t = board.tiles[n], c = P(q);
    if (n === 0) { labels += `<div class="sq start" style="${place(c, T)}"><span class="title">Start</span></div>`; return; }
    let inner = `<span class="num">${n}</span>`;
    if (t) {
      inner += chevron(t.cat) + artFor(t.icon ?? "card", esc(t.story ?? t.text));
      const dest = destination(t);
      if (dest) inner += `<span class="dest">${dest}</span>`;
      labels += `<div class="sq ev" style="${place(c, T)}">${inner}</div>`;
      return;
    }
    const lm = board.story.landmarks[n];
    const fork = board.rules.forks.findIndex((x) => x.at === n), merge = board.rules.forks.findIndex((x) => x.merge === n);
    if (lm) inner += `<div class="soft">${artFor(lm.icon, esc(lm.name))}</div><span class="name">${esc(lm.name)}</span>`;
    else if (fork >= 0) inner += `<div class="soft">${artFor("signpost", "Crossroads")}</div><span class="name">Crossroads</span>`;
    else if (merge >= 0) inner += `<div class="soft">${artFor("joining-paths", "The roads meet")}</div>`;
    labels += `<div class="sq${lm || fork >= 0 || merge >= 0 ? " lm" : ""}" style="${place(c, T)}">${inner}</div>`;
  });
  const roads = (board.story.roads ?? {}) as { forks?: { tiles?: Record<string, { icon?: string; story?: string }> }[] };
  for (const s of L.shortcuts) s.stones.forEach((q, i) => {
    const t = board.rules.forks[s.fork].tiles[i + 1];
    if (!t) return;
    const st = roads.forks?.[s.fork]?.tiles?.[String(i + 1)];
    labels += `<div class="sq stone" style="${place(P(q), 52)}">${chevron(t.cat)}${artFor(st?.icon ?? "signpost", esc(st?.story ?? t.text))}</div>`;
  });
  const start = (board.story as { start?: { name?: string; icon?: string; story?: string } }).start;
  labels += `<div class="sq home" style="${place(P(L.home), 120)}">${artFor(start?.icon ?? "house", esc(start?.story ?? "Home"))}<span class="name">${esc(start?.name ?? "Home")}</span></div>`;
  const endStory = (board.story as { end?: { story?: string } }).end?.story ?? "END";
  labels += `<div class="sq end" style="${place(P(L.end), 0.96 * UNIT)}">${artFor("lanterns", esc(endStory))}<span class="title">END</span></div>`;

  const world = document.createElement("div");
  world.className = "board-world";
  world.style.width = `${W}px`;
  world.style.height = `${H}px`;
  world.style.backgroundImage = PAPER_TEXTURE;
  world.innerHTML = `<svg class="layer" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${defs}</defs>${ground}</svg>`
    + `<svg class="layer" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${drawings}</svg>`
    + `<div class="labels">${labels}</div>`;

  let observer: IntersectionObserver | null = null;
  return {
    layout: L, world, px: P,
    setLive(viewport) {
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        for (const e of entries) e.target.classList.toggle("live", e.isIntersecting);
      }, { root: viewport, rootMargin: "15%" });
      world.querySelectorAll(".sq, .snake").forEach((el) => observer!.observe(el));
    },
  };
}

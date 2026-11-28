// The Carnival's whole board (Step I phase D, owner 28 Nov 2026): the zig-zag snake of layout.ts. A copy of the
// Lantern Festival's board view (src/ui/overview.ts, not changed), so work on the Carnival never touches it: the same
// taps, zoom, keyboard, tokens and notification place; only the drawing differs (rows and the walls between them,
// each area's soft tint, the destination's plaza with its name).
import type { Board3 } from "../engine/v3";
import type { BoardLayout, Place as Pos, Point } from "../render/layout";
import { designFor, layoutFor, pointOf } from "./layout";
import { INK, catColour } from "../render/palette";

/** Squares smaller than this on screen (px) are zoomed in on first. */
const TAP = 40;
import { PLAYERS } from "../ui/players";
import { maskAt } from "./masks";
import { esc } from "../render/html";

const U = 100;
/** The carnival's colours (owner, 28 Nov 2026: its own look, not the Lantern Festival's; one plain colour around the
 * squares, no pattern): Venetian red with a gold rim, and each district in its own light carnival colour. */
const WALL = "#7a1f33";
const GOLD = "#e9b949";
const NAVY = "#3d1220"; // the dark ink of the texts and arrows: a deep wine
/** Event squares keep the game's green / red / blue frames on bright paper. */
const EVENT_PAPER = "#fffaf0";
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

/**
 * How far one throw of each face moves a token, for the faces that can end a move: 1–5. A 6 always throws again and
 * adds up (R2), so a token never stops 6 squares ahead (audit, 15 Oct). A doubled throw (R9) moves twice as far.
 */
export const reachSteps = (double: boolean): { face: number; steps: number }[] =>
  [1, 2, 3, 4, 5].map((face) => ({ face, steps: double ? 2 * face : face }));

/** Soft paper tints of the six areas, in their order on the road (plain squares only; the event frames keep their colours). */
// ivory stone · terracotta · saffron · turquoise · amethyst · rose
const TINTS = ["#f8f2e4", "#f6d6c6", "#f9e6a8", "#c8ece7", "#e4d9f6", "#f8d5e0"];

/** A w × h box with sharp corners, but for one corner rounded with radius r (the outside of a bend). */
function box(x: number, y: number, w: number, h: number, corner: "" | "tl" | "tr" | "br" | "bl", r: number): string {
  const R = (c: string) => (c === corner ? r : 0);
  return `M${x + R("tl")} ${y}H${x + w - R("tr")}${R("tr") ? `A${r} ${r} 0 0 1 ${x + w} ${y + r}` : ""}V${y + h - R("br")}${R("br") ? `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` : ""}`
    + `H${x + R("bl")}${R("bl") ? `A${r} ${r} 0 0 1 ${x} ${y + h - r}` : ""}V${y + R("tl")}${R("tl") ? `A${r} ${r} 0 0 1 ${x + r} ${y}` : ""}Z`;
}

export class CarnivalBoard {
  layout!: BoardLayout;
  private readonly board: Board3;
  private svg!: SVGSVGElement;
  /** The die faces, over the board with the same view (they change once a turn at most). */
  private live!: SVGSVGElement;
  /**
   * P1 (owner approved, 15 Oct): the tokens are page elements over the board, not part of its drawing. A glide inside
   * the drawing made the browser lay out and repaint the whole board on every frame of every hop (measured:
   * 3.4× the work on a slow phone); a page element glides on the graphics chip.
   */
  private readonly tokenLayer: HTMLElement;
  /** The part of the board shown (the viewBox), for placing the tokens. */
  private box = { x: 0, y: 0, w: 1, h: 1 };
  private tokenSize = 0;
  private tokens: HTMLElement[] = [];
  private readonly places: Pos[] = [];
  private reach!: SVGGElement;
  private readonly end: number;
  private full = "";
  private readonly zoomOut: HTMLButtonElement;
  private zoomed = false;
  /** What is shown, so the board can be drawn again in another shape (the screen turned). */
  private current = -1;
  private reachFrom: Pos | null = null;
  private reachDouble = false;
  /** The square that has the board's Tab stop (U5). */
  private focusPos = 0;
  private design = "";

  constructor(private readonly host: HTMLElement, board: Board3, private readonly players: number, private readonly onPick: (pos: Pos) => void) {
    this.board = board;
    this.end = board.endTile;
    for (let i = 0; i < players; i++) this.places.push(0);
    this.zoomOut = document.createElement("button");
    this.zoomOut.className = "zoom-out";
    this.zoomOut.textContent = "Whole board";
    this.zoomOut.hidden = true;
    this.zoomOut.onclick = () => this.zoom(null);
    this.tokenLayer = document.createElement("div");
    this.tokenLayer.className = "ov-tokens";
    this.tokenLayer.setAttribute("aria-hidden", "true");
    host.append(this.tokenLayer, this.zoomOut);
    this.build();
    // the board takes the shape that gives the biggest squares in its panel (owner: no empty space)
    new ResizeObserver(() => {
      if (designFor(board, host.clientWidth, host.clientHeight) !== this.design) this.build();
      else this.layoutTokens();
    }).observe(host);
  }

  private build(): void {
    const host = this.host, board = this.board, players = this.players, onPick = this.onPick;
    this.design = designFor(board, host.clientWidth, host.clientHeight);
    const L = (this.layout = layoutFor(board, host.clientWidth, host.clientHeight)), B = L.bounds;
    this.zoomed = false;
    this.zoomOut.hidden = true;
    const P = (p: Point) => ({ x: (p.x - B.x) * U, y: (p.y - B.y) * U });
    const M = L.maze, m = P({ x: M.x, y: M.y });
    let s = `<rect x="${m.x}" y="${m.y}" width="${M.w * U}" height="${M.h * U}" rx="22" fill="${WALL}" stroke="${GOLD}" stroke-width="10"/>`;
    // the squares, each tinted by its area
    const areaOf = (n: number) => Math.max(0, board.areas.findIndex((a) => n >= a.from && n <= a.to));
    // Squares have sharp corners; at each bend of the snake the two squares of the turn round their outside corner, so the
    // road reads as one canal winding down the board. Every square stays a square of its own (owner, 28 Nov 2026).
    const COLS = 10, BEND = 0.5 * U;
    const bendOf = (n: number): "" | "tl" | "tr" | "br" | "bl" => {
      const right = L.squares[n].x > (COLS - 1) / 2;
      if (n % COLS === 0 && n < board.lastTile) return right ? "tr" : "tl";
      if (n % COLS === 1 && n > 1) return right ? "br" : "bl";
      return "";
    };
    for (let n = 1; n <= board.lastTile; n++) {
      const c = P(L.squares[n]), h = L.heading[n], w = U - 4, ht = U - 4, t = board.tiles[n], bend = bendOf(n);
      const frame = t ? catColour(t.cat) : null, fill = t ? EVENT_PAPER : TINTS[areaOf(n) % TINTS.length];
      const kind = t ? (t.cat === "R" ? ", good square" : t.cat === "P" ? ", bad square" : ", swap square") : "";
      s += `<g class="pick sq" data-pos="${n}" tabindex="-1" role="button" aria-label="Square ${n}${kind}">`;
      s += `<path d="${box(c.x - w / 2, c.y - ht / 2, w, ht, bend, BEND)}" fill="${fill}"/>`;
      if (frame) {
        s += `<path d="${box(c.x - w / 2 + 7, c.y - ht / 2 + 7, w - 14, ht - 14, bend, BEND - 7)}" fill="none" stroke="${frame}" stroke-width="10"/>`
          + `<path d="${t!.cat === "R" ? `M${c.x + w / 2 - 34} ${c.y - ht / 2 + 34}l10-14 10 14z` : t!.cat === "P" ? `M${c.x + w / 2 - 34} ${c.y - ht / 2 + 20}l10 14 10-14z` : `M${c.x + w / 2 - 24} ${c.y - ht / 2 + 16}l10 11-10 11-10-11z`}" fill="${frame}"/>`;
      } else if (n % 3 === 1 && Math.abs(h.x) > 0.5 && !bend) { // which way the row runs
        const ang = (Math.atan2(h.y, h.x) * 180) / Math.PI;
        s += `<path d="M-8 -12l12 12-12 12" transform="translate(${c.x} ${c.y}) rotate(${ang})" fill="none" stroke="${NAVY}" stroke-opacity=".35" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      s += `</g>`;
    }
    // Home (everyone waits here) and the destination's plaza (the notifications show over it)
    const home = board.moments?.home?.title ?? "Home", dest = board.destination?.name ?? "";
    const sp = P(L.start.centre), sw = L.start.w * U - 4, sh = L.start.h * U - 4;
    s += `<g class="pick" data-pos="0" tabindex="-1" role="button" aria-label="${esc(home)}"><rect x="${sp.x - sw / 2}" y="${sp.y - sh / 2}" width="${sw}" height="${sh}" rx="10" fill="#fff4c8" stroke="${GOLD}" stroke-width="8"/>`
      + `<text x="${sp.x}" y="${sp.y - sh / 2 + 34}" text-anchor="middle" class="ov-sub" style="fill:${NAVY}">${esc(home)}</text></g>`; // the tokens wait below it (U4)
    const e = P(L.endPad.centre), ew = L.endPad.w * U - 8, eh = L.endPad.h * U - 8;
    // the destination's name on as few lines as fit the plaza's width
    const tall = L.endPad.h > 4, fs = tall ? 46 : 58, perLine = Math.max(6, Math.floor((ew - 50) / (fs * 0.44))), lines: string[] = [];
    for (const word of dest.split(" ")) {
      const lastLine = lines[lines.length - 1];
      if (lastLine !== undefined && (lastLine + " " + word).length <= perLine) lines[lines.length - 1] = lastLine + " " + word;
      else lines.push(word);
    }
    const lh = fs * 1.15;
    const legend: typeof board.areas = []; // owner, 28 Nov 2026: no colour key in the plaza, only the destination's name
    const chipFs = 30, chipLine = Math.floor((ew - 90) / (chipFs * 0.44)); // one size for all six, long names on two lines
    const wrap = (t: string): string[] => { // one line if it fits, else two lines of about the same length
      if (t.length <= chipLine) return [t];
      const w = t.split(" ");
      let best = 1;
      for (let k = 1; k < w.length; k++) if (Math.max(w.slice(0, k).join(" ").length, w.slice(k).join(" ").length) < Math.max(w.slice(0, best).join(" ").length, w.slice(best).join(" ").length)) best = k;
      return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
    };
    const chips = legend.map((a) => wrap(a.name)), chipH = (n: number) => 22 + n * chipFs * 1.1, chipGap = 14;
    const blockH = lines.length * lh + (legend.length ? 36 + chips.reduce((t, c) => t + chipH(c.length) + chipGap, -chipGap) : 0);
    const top = e.y - blockH / 2 + fs * 0.8;
    let plaza = lines.map((l, i) => `<text x="${e.x}" y="${top + i * lh}" text-anchor="middle" class="ov-fest" style="font-size:${fs}px;fill:${NAVY}">${esc(l)}</text>`).join("");
    let y = top + (lines.length - 1) * lh + fs * 0.4 + 36;
    chips.forEach((c, i) => {
      const cw = ew - 60, h = chipH(c.length);
      plaza += `<rect x="${e.x - cw / 2}" y="${y}" width="${cw}" height="${h}" rx="12" fill="${TINTS[i % TINTS.length]}" stroke="${NAVY}" stroke-opacity=".35" stroke-width="3"/>`
        + c.map((l, k) => `<text x="${e.x}" y="${y + 11 + chipFs * 0.85 + k * chipFs * 1.1}" text-anchor="middle" style="font-size:${chipFs}px;fill:${NAVY}">${esc(l)}</text>`).join("");
      y += h + chipGap;
    });
    s += `<g class="pick" data-pos="${board.endTile}" tabindex="-1" role="button" aria-label="${esc(dest)}"><rect x="${e.x - ew / 2}" y="${e.y - eh / 2}" width="${ew}" height="${eh}" rx="24" fill="${GOLD}" stroke="${NAVY}" stroke-width="6"/>`
      + `<rect x="${e.x - ew / 2 + 14}" y="${e.y - eh / 2 + 14}" width="${ew - 28}" height="${eh - 28}" rx="14" fill="#fff4c8" stroke="${NAVY}" stroke-opacity=".5" stroke-width="3" stroke-dasharray="10 8"/>`
      + plaza
      + `</g>`;
    { // owner, 28 Nov 2026: two golden arrows only, from Home into square 1 and from square 100 into the destination
      const arrow = (a: Point, b: Point) => {
        const p = P(a), q = P(b), ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI, len = Math.hypot(q.x - p.x, q.y - p.y);
        return `<g transform="translate(${p.x} ${p.y}) rotate(${ang})"><path d="M0 0H${len - 8}" stroke="#f2a530" stroke-width="12" stroke-linecap="round"/>`
          + `<path d="M${len - 26} -17L${len - 4} 0L${len - 26} 17z" fill="#f2a530" stroke="#f2a530" stroke-width="6" stroke-linejoin="round"/></g>`;
      };
      const one = L.squares[1], hd = L.heading[0], last = L.squares[board.lastTile], he = L.heading[board.lastTile];
      const homeEdge = hd.y ? { x: one.x, y: L.start.centre.y + L.start.h / 2 } : { x: L.start.centre.x + L.start.w / 2, y: one.y };
      const endEdge = he.y ? { x: last.x, y: L.endPad.centre.y - L.endPad.h / 2 } : { x: L.endPad.centre.x + L.endPad.w / 2, y: last.y };
      s += arrow({ x: homeEdge.x - hd.x * 0.05, y: homeEdge.y - hd.y * 0.05 }, { x: one.x - hd.x * 0.36, y: one.y - hd.y * 0.36 });
      s += arrow({ x: last.x + he.x * 0.36, y: last.y + he.y * 0.36 }, { x: endEdge.x + he.x * 0.05, y: endEdge.y + he.y * 0.05 });
    }
    const view = `viewBox="0 0 ${B.w * U} ${B.h * U}" preserveAspectRatio="xMidYMid meet"`;
    const markup = `<svg class="overview-board" ${view} role="group" aria-label="The whole board">${s}</svg>`
      + `<svg class="overview-live" ${view} aria-hidden="true">`
      + `<g class="reach"></g></svg>`;
    const tmp = document.createElement("div");
    tmp.innerHTML = markup;
    const svg = tmp.firstElementChild as SVGSVGElement, live = tmp.lastElementChild as SVGSVGElement;
    if (this.svg) { this.svg.replaceWith(svg); this.live.replaceWith(live); } else host.prepend(svg, live);
    this.svg = svg;
    this.live = live;
    this.reach = live.querySelector(".reach")!;
    this.full = `0 0 ${B.w * U} ${B.h * U}`;
    // U5, the keyboard: the board is one Tab stop; the arrow keys walk the road (Home, the squares … the destination), Enter or
    // Space tells what the square does. The square last visited keeps the Tab stop.
    const order = [0, ...Array.from({ length: board.lastTile }, (_, i) => i + 1), board.endTile];
    const pickOf = (pos: number) => this.svg.querySelector<SVGGElement>(`.pick[data-pos="${pos}"]`)!;
    pickOf(order.includes(this.focusPos) ? this.focusPos : 0).setAttribute("tabindex", "0");
    this.svg.addEventListener("keydown", (ev) => {
      const g = (ev.target as Element).closest<SVGGElement>(".pick");
      if (!g) return;
      const i = order.indexOf(Number(g.dataset.pos)), step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, PageDown: 10, PageUp: -10 };
      let to = i;
      if (ev.key in step) to = Math.max(0, Math.min(order.length - 1, i + step[ev.key]));
      else if (ev.key === "Home") to = 0;
      else if (ev.key === "End") to = order.length - 1;
      else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onPick(order[i]); return; }
      else return;
      ev.preventDefault();
      g.setAttribute("tabindex", "-1");
      const next = pickOf(order[to]);
      next.setAttribute("tabindex", "0");
      next.focus();
      this.focusPos = order[to];
    });
    this.svg.addEventListener("click", (ev) => {
      const g = (ev.target as Element).closest<SVGGElement>(".pick");
      if (!g) return;
      if (!this.zoomed && Math.min(this.svg.clientWidth / L.bounds.w, this.svg.clientHeight / L.bounds.h) < TAP) return this.zoom(ev);
      onPick(Number(g.dataset.pos));
    });
    this.box = { x: 0, y: 0, w: B.w * U, h: B.h * U };
    if (!this.tokens.length) for (let i = 0; i < players; i++) {
      const t = document.createElement("div");
      t.className = "ov-token";
      t.dataset.seat = String(i);
      t.innerHTML = `<svg viewBox="-60 -60 120 120"><circle class="halo" r="58" fill="none" stroke="${NAVY}" stroke-width="8" stroke-dasharray="14 10"/>`
        + `${maskAt(i, -56, -56, 112)}</svg>`; // the Carnival's masks (owner, 28 Nov 2026)
      this.tokenLayer.append(t);
      this.tokens.push(t);
    }
    this.layoutTokens();
    if (this.current >= 0) this.setCurrent(this.current);
    this.setReach(this.reachFrom, this.reachDouble);
  }

  /** Back to the whole board (a new turn). */
  zoomOutAll(): void {
    if (this.zoomed) this.zoom(null);
  }

  /** Zooms in around a tap so the squares are big enough to tap (null = the whole board again). */
  private zoom(ev: MouseEvent | null): void {
    if (!ev) { this.view(this.full); this.zoomed = false; this.zoomOut.hidden = true; return; }
    const r = this.svg.getBoundingClientRect(), B = this.layout.bounds;
    const fit = Math.min(r.width / B.w, r.height / B.h); // px per unit now
    const k = Math.max(1.5, 54 / fit), vw = (r.width / fit / k) * U, vh = (r.height / fit / k) * U;
    // the tapped point in board coordinates (the drawing is centred in the svg)
    const ox = (r.width - B.w * fit) / 2, oy = (r.height - B.h * fit) / 2;
    const bx = ((ev.clientX - r.left - ox) / fit) * U, by = ((ev.clientY - r.top - oy) / fit) * U;
    // the tapped square in the middle, but never past the board's edge (audit: a top-row tap showed half a panel of nothing)
    const keep = (v: number, size: number, full: number) => (size >= full ? (full - size) / 2 : Math.max(0, Math.min(full - size, v)));
    const x = keep(bx - vw / 2, vw, B.w * U), y = keep(by - vh / 2, vh, B.h * U);
    this.view(`${x} ${y} ${vw} ${vh}`);
    this.zoomed = true;
    this.zoomOut.hidden = false;
  }

  /** The part of the board shown, on both layers. */
  private view(box: string): void {
    this.svg.setAttribute("viewBox", box);
    this.live.setAttribute("viewBox", box);
    const [x, y, w, h] = box.split(" ").map(Number);
    this.box = { x, y, w, h };
    this.layoutTokens();
  }

  /** Puts a token on a place (the token glides there). */
  setPlace(seat: number, pos: Pos): void {
    this.places[seat] = pos;
    this.layoutTokens();
  }

  /** Highlights the player whose turn it is. */
  setCurrent(seat: number): void {
    this.current = seat;
    this.tokens.forEach((t, i) => t.classList.toggle("current", i === seat));
    this.tokens[seat].parentNode!.append(this.tokens[seat]);
  }

  /** Die faces on the squares one throw reaches from `pos` (null = none), see `reachSteps`. */
  setReach(pos: Pos | null, double = false): void {
    this.reachFrom = pos;
    this.reachDouble = double;
    let s = "";
    if (pos !== null && pos > 0) {
      for (const { face, steps } of reachSteps(double)) {
        const n = this.ahead(pos, steps);
        if (n === null) break;
        const c = this.px(pointOf(this.layout, n));
        s += `<g transform="translate(${c.x - 30} ${c.y + 6})"><rect x="-17" y="-17" width="34" height="34" rx="8" fill="#fffdf6" stroke="${INK}" stroke-width="4"/>`
          + PIPS[face].map(([dx, dy]) => `<circle cx="${dx * 8.5}" cy="${dy * 8.5}" r="3.6" fill="${INK}"/>`).join("") + `</g>`;
      }
    }
    this.reach.innerHTML = s;
  }

  /** The place k squares ahead along the road (no further than END). */
  private ahead(pos: Pos, k: number): Pos | null {
    const n = pos + k;
    return n > this.end ? null : n;
  }

  private px(p: Point): Point {
    const B = this.layout.bounds;
    return { x: (p.x - B.x) * U, y: (p.y - B.y) * U };
  }

  /** Tokens on the same place sit side by side; on the Home pad, each in its own place. */
  private layoutTokens(): void {
    const key = (pos: Pos) => (pos <= 0 ? "pad" : String(pos));
    const groups = new Map<string, number[]>();
    this.places.forEach((pos, i) => { groups.set(key(pos), [...(groups.get(key(pos)) ?? []), i]); });
    // board units → pixels of the token layer, as the drawing is fitted ("meet") into the same box
    const W = this.tokenLayer.clientWidth, H = this.tokenLayer.clientHeight, b = this.box, zoom = Math.min(W / b.w, H / b.h) || 0;
    const ox = (W - b.w * zoom) / 2 - b.x * zoom, oy = (H - b.h * zoom) / 2 - b.y * zoom, size = Math.round(120 * zoom);
    if (size !== this.tokenSize) { this.tokenSize = size; this.tokens.forEach((t) => { t.style.width = t.style.height = `${size}px`; }); }
    this.places.forEach((pos, i) => {
      const t = this.tokens[i];
      const same = groups.get(key(pos))!, k = same.indexOf(i), n = same.length, pad = key(pos) === "pad";
      const c = this.px(pointOf(this.layout, pos));
      let dx = 0, dy = 0, scale = "";
      // At Home each seat has its own place, smaller and in the lower half: the "Home" label above stays readable (U4)
      if (pad && this.layout.start.h > 1.5) { dx = ((i % 2) - 0.5) * U * 1.15; dy = (Math.floor(i / 2) - 0.3) * U * 1.05 + 20; scale = " scale(.9)"; }
      else if (pad) { dx = (i - 1.5) * U; dy = 20; scale = " scale(.6)"; }
      else if (n > 1) { dx = (k - (n - 1) / 2) * 30; dy = n > 2 ? (k % 2 ? 14 : -14) : 0; scale = " scale(.8)"; }
      t.style.opacity = "1";
      const x = ox + (c.x + dx) * zoom - size / 2, y = oy + (c.y + dy) * zoom - size / 2;
      t.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)${scale}`;
    });
    // the notifications sit over the destination's square, as big as it (owner, 27 Nov 2026); when the board is zoomed
    // in and the square is out of view, they stay inside the board panel
    const E = this.layout.endPad, ec = this.px(E.centre), ew = (E.w * U - 8) * zoom, eh = (E.h * U - 8) * zoom;
    const hw = this.host.clientWidth, hh = this.host.clientHeight, lx = this.tokenLayer.offsetLeft, ly = this.tokenLayer.offsetTop;
    const keep = (v: number, size: number, full: number) => Math.max(0, Math.min(full - size, v));
    const st = this.host.style;
    st.setProperty("--end-x", `${keep(lx + ox + ec.x * zoom - ew / 2, ew, hw).toFixed(1)}px`);
    st.setProperty("--end-y", `${keep(ly + oy + ec.y * zoom - eh / 2, eh, hh).toFixed(1)}px`);
    st.setProperty("--end-w", `${Math.min(ew, hw).toFixed(1)}px`);
    st.setProperty("--end-h", `${Math.min(eh, hh).toFixed(1)}px`);
    const where = (pos: Pos) => pos <= 0 ? "at Home" : pos === this.end ? `at ${this.board.destination?.name ?? "the end"}` : `on square ${pos}`;
    this.svg.setAttribute("aria-label", `The whole board. ${this.places.map((pos, i) => `${PLAYERS[i].name} ${where(pos)}`).join(", ")}.`);
  }

}

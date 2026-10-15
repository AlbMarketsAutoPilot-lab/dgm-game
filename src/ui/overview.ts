// The whole board (the info area, owner 15 Oct): where am I, and what is ahead of me?
// A labyrinth spiral of plain paper squares with thin ink walls between the rings, as big as the panel allows. No
// numbers, no colours, no lines: good squares have a green frame (and ▲), bad squares a red frame (and ▼). Tap any
// square to see what happens there; where squares are small (the long board), the first tap zooms in.
// The squares the current player can reach with one die show a small die face.
import { OFF, OUT, isShortcut, shortcutPos, type Board, type Pos } from "../engine";
import { WALL_WIDE, type BoardLayout, type Point, designFor, layoutFor, pointOf } from "../render/layout";
import { INK, PAPER, PUNISH, REWARD } from "../render/palette";

/** Squares smaller than this on screen (px) are zoomed in on first. */
const TAP = 40;
import { PLAYERS, tokenSvg } from "./players";
import { artFor } from "../render/art";

const U = 100;
const WALL = "#3b1f5e";
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

export class Overview {
  layout!: BoardLayout;
  private readonly board: Board;
  private svg!: SVGSVGElement;
  private tokens: SVGGElement[] = [];
  private readonly places: { pos: Pos; stair: number }[] = [];
  private tree!: SVGGElement;
  private reach!: SVGGElement;
  private readonly end: number;
  private full = "";
  private readonly zoomOut: HTMLButtonElement;
  private zoomed = false;
  /** What is shown, so the board can be drawn again in another shape (the screen turned). */
  private current = -1;
  private roadblock: number | null = null;
  private reachFrom: Pos | null = null;
  private design = "";

  constructor(private readonly host: HTMLElement, board: Board, private readonly players: number, private readonly onPick: (pos: Pos) => void) {
    this.board = board;
    this.end = board.endTile;
    for (let i = 0; i < players; i++) this.places.push({ pos: OFF, stair: 0 });
    this.zoomOut = document.createElement("button");
    this.zoomOut.className = "zoom-out";
    this.zoomOut.textContent = "Whole board";
    this.zoomOut.hidden = true;
    this.zoomOut.onclick = () => this.zoom(null);
    host.append(this.zoomOut);
    this.build();
    // the board takes the shape that gives the biggest squares in its panel (owner: no empty space)
    new ResizeObserver(() => { if (designFor(board, host.clientWidth, host.clientHeight).join("x") !== this.design) this.build(); }).observe(host);
  }

  private build(): void {
    const host = this.host, board = this.board, players = this.players, onPick = this.onPick;
    this.design = designFor(board, host.clientWidth, host.clientHeight).join("x");
    const L = (this.layout = layoutFor(board, host.clientWidth, host.clientHeight)), B = L.bounds;
    this.zoomed = false;
    this.zoomOut.hidden = true;
    const P = (p: Point) => ({ x: (p.x - B.x) * U, y: (p.y - B.y) * U });
    const M = L.maze, m = P({ x: M.x, y: M.y });
    let s = `<rect x="${m.x}" y="${m.y}" width="${M.w * U}" height="${M.h * U}" rx="22" fill="${WALL}"/>`;
    // the road: openings in the wall where it steps into the next ring, and on to the festival
    // An opening is a thin arrow through the wall, not a strip of paper: it must never look like a square (audit).
    const link = (a: Point, b: Point) => {
      const p = P(a), q = P(b), ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI, mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#f2c230" stroke-width="12" stroke-linecap="round"/>`
        + `<path d="M-14 -18L6 0-14 18" transform="translate(${mx} ${my}) rotate(${ang})" fill="none" stroke="#f2c230" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
    };
    // squares touch (at most 1.11 apart); only a step into the next ring crosses a wall (1.14 or more)
    for (let n = 1; n < board.lastTile; n++) if (Math.hypot(L.squares[n + 1].x - L.squares[n].x, L.squares[n + 1].y - L.squares[n].y) > 1.12) s += link(L.squares[n], L.squares[n + 1]);
    { // the last square points into the festival: the arrow stops at its edge
      const q = L.squares[board.lastTile], E = L.endPad, edge = { x: Math.max(E.centre.x - E.w / 2, Math.min(E.centre.x + E.w / 2, q.x)), y: Math.max(E.centre.y - E.h / 2, Math.min(E.centre.y + E.h / 2, q.y)) };
      s += link(q, edge);
    }
    // Shortcut stones (small squares inside the wider walls)
    for (const sc of L.shortcuts) {
      sc.stones.forEach((q, i) => {
        const t = board.rules.forks[sc.fork].tiles[i + 1], c = P(q), r = (WALL_WIDE * U) / 2 - 2;
        s += `<g class="pick" data-pos="${shortcutPos(sc.fork, i + 1)}"><rect x="${c.x - r - 10}" y="${c.y - r - 10}" width="${2 * r + 20}" height="${2 * r + 20}" fill="transparent"/>`
          + `<rect x="${c.x - r}" y="${c.y - r}" width="${2 * r}" height="${2 * r}" rx="5" fill="#d9d2c4" stroke="${t ? (t.cat === "R" ? REWARD : PUNISH) : INK}" stroke-width="${t ? 7 : 3}"/></g>`;
      });
    }
    // the squares
    for (let n = 1; n <= board.lastTile; n++) {
      const c = P(L.squares[n]), h = L.heading[n], horiz = Math.abs(h.x) > Math.abs(h.y), a = L.along[n] * U;
      const w = (horiz ? a : U) - 4, ht = (horiz ? U : a) - 4, t = board.tiles[n];
      const frame = t ? (t.cat === "R" ? REWARD : PUNISH) : null;
      s += `<g class="pick sq" data-pos="${n}"><rect x="${c.x - w / 2}" y="${c.y - ht / 2}" width="${w}" height="${ht}" rx="7" fill="${PAPER}" stroke="${INK}" stroke-opacity=".35" stroke-width="3"/>`;
      if (frame) {
        s += `<rect x="${c.x - w / 2 + 7}" y="${c.y - ht / 2 + 7}" width="${w - 14}" height="${ht - 14}" rx="6" fill="none" stroke="${frame}" stroke-width="10"/>`
          + `<path d="${t!.cat === "R" ? `M${c.x + w / 2 - 34} ${c.y - ht / 2 + 34}l10-14 10 14z` : `M${c.x + w / 2 - 34} ${c.y - ht / 2 + 20}l10 14 10-14z`}" fill="${frame}"/>`;
      } else if (board.rules.forks.some((f) => f.at === n)) {
        s += `<path d="M${c.x} ${c.y + 26}v-20l-16-16M${c.x} ${c.y + 6}l16-16" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (n % 3 === 1) { // which way the road goes
        const ang = (Math.atan2(h.y, h.x) * 180) / Math.PI;
        s += `<path d="M-8 -12l12 12-12 12" transform="translate(${c.x} ${c.y}) rotate(${ang})" fill="none" stroke="${INK}" stroke-opacity=".3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      s += `</g>`;
    }
    // Start (four squares long: everyone waits here) and the festival
    const sp = P(L.start.centre), sw = L.start.w * U - 4, sh = U - 4;
    s += `<g class="pick" data-pos="0"><rect x="${sp.x - sw / 2}" y="${sp.y - sh / 2}" width="${sw}" height="${sh}" rx="10" fill="#fff4c8" stroke="${INK}" stroke-width="7"/>`
      + `<text x="${sp.x - sw / 2 + 14}" y="${sp.y - sh / 2 + 32}" class="ov-sub">START: a 6 to enter</text></g>`;
    // The Festival of Lights: the destination, a golden plaza in the middle of the spiral with its lanterns
    const e = P(L.endPad.centre), ew = L.endPad.w * U - 8, eh = L.endPad.h * U - 8, pic = Math.min(ew * 0.8, eh * 0.62), big = ew >= 180 && eh >= 150;
    s += `<g class="pick" data-pos="${board.endTile}"><rect x="${e.x - ew / 2}" y="${e.y - eh / 2}" width="${ew}" height="${eh}" rx="24" fill="#f2c230" stroke="${INK}" stroke-width="8"/>`
      + `<rect x="${e.x - ew / 2 + 14}" y="${e.y - eh / 2 + 14}" width="${ew - 28}" height="${eh - 28}" rx="14" fill="#fff4c8" stroke="${INK}" stroke-width="3" stroke-dasharray="10 8"/>`
      + (big ? artFor("lanterns", "Festival of Lights").replace("<svg ", `<svg x="${e.x - pic / 2}" y="${e.y - eh / 2 + 22}" width="${pic}" height="${pic}" `)
        + `<text x="${e.x}" y="${e.y + eh / 2 - 30}" text-anchor="middle" class="ov-fest" style="font-size:${Math.min(46, (ew - 40) / 7.6)}px">Festival of Lights</text>`
        : `<path d="M0 -30l8 17 19 3-14 13 4 19-17-9-17 9 4-19-14-13 19-3z" transform="translate(${e.x} ${e.y})" fill="#f2c230" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`)
      + `</g>`;
    const markup = `<svg class="overview-board" viewBox="0 0 ${B.w * U} ${B.h * U}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="The whole board">`
      + s
      + `<g class="reach" aria-hidden="true"></g>`
      + `<g class="tree" opacity="0" aria-hidden="true"><path d="M-34 16l64-28M-30 26l64-28" stroke="#6b4f34" stroke-width="13" stroke-linecap="round"/><circle cx="32" cy="-16" r="18" fill="#3c8c50" stroke="${INK}" stroke-width="4"/></g>`
      + `<g class="tokens"></g></svg>`;
    const tmp = document.createElement("div");
    tmp.innerHTML = markup;
    const svg = tmp.firstElementChild as SVGSVGElement;
    if (this.svg) this.svg.replaceWith(svg); else host.prepend(svg);
    this.svg = svg;
    this.tree = this.svg.querySelector(".tree")!;
    this.reach = this.svg.querySelector(".reach")!;
    this.full = `0 0 ${B.w * U} ${B.h * U}`;
    this.svg.addEventListener("click", (ev) => {
      const g = (ev.target as Element).closest<SVGGElement>(".pick");
      if (!g) return;
      if (!this.zoomed && Math.min(this.svg.clientWidth / L.bounds.w, this.svg.clientHeight / L.bounds.h) < TAP) return this.zoom(ev);
      onPick(Number(g.dataset.pos));
    });
    const layer = this.svg.querySelector(".tokens")!;
    this.tokens = [];
    for (let i = 0; i < players; i++) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("ov-token");
      g.innerHTML = `<circle class="halo" r="58" fill="none" stroke="${INK}" stroke-width="8" stroke-dasharray="14 10"/>`
        + `<g transform="translate(-40 -40) scale(.8)">${tokenSvg(i).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>`;
      layer.append(g);
      this.tokens.push(g);
    }
    this.layoutTokens();
    if (this.current >= 0) this.setCurrent(this.current);
    this.setRoadblock(this.roadblock);
    this.setReach(this.reachFrom);
  }

  /** Zooms in around a tap so the squares are big enough to tap (null = the whole board again). */
  /** Back to the whole board (a new turn). */
  zoomOutAll(): void {
    if (this.zoomed) this.zoom(null);
  }

  private zoom(ev: MouseEvent | null): void {
    if (!ev) { this.svg.setAttribute("viewBox", this.full); this.zoomed = false; this.zoomOut.hidden = true; return; }
    const r = this.svg.getBoundingClientRect(), B = this.layout.bounds;
    const fit = Math.min(r.width / B.w, r.height / B.h); // px per unit now
    const k = Math.max(1.5, 54 / fit), vw = (r.width / fit / k) * U, vh = (r.height / fit / k) * U;
    // the tapped point in board coordinates (the drawing is centred in the svg)
    const ox = (r.width - B.w * fit) / 2, oy = (r.height - B.h * fit) / 2;
    const bx = ((ev.clientX - r.left - ox) / fit) * U, by = ((ev.clientY - r.top - oy) / fit) * U;
    const x = bx - vw / 2, y = by - vh / 2; // the tapped square in the middle, never under the "Whole board" button
    this.svg.setAttribute("viewBox", `${x} ${y} ${vw} ${vh}`);
    this.zoomed = true;
    this.zoomOut.hidden = false;
  }

  /** Puts a token on a place (the token glides there). */
  setPlace(seat: number, pos: Pos, stair = 0): void {
    this.places[seat] = { pos, stair };
    this.layoutTokens();
  }

  /** Highlights the player whose turn it is. */
  setCurrent(seat: number): void {
    this.current = seat;
    this.tokens.forEach((t, i) => t.classList.toggle("current", i === seat));
    this.tokens[seat].parentNode!.append(this.tokens[seat]);
  }

  setRoadblock(square: number | null): void {
    this.roadblock = square;
    if (square === null) { this.tree.setAttribute("opacity", "0"); return; }
    const c = this.px(this.layout.squares[square]);
    this.tree.setAttribute("transform", `translate(${c.x} ${c.y})`);
    this.tree.setAttribute("opacity", "1");
  }

  /** Die faces on the squares 1–6 ahead of `pos` (Main Road; null = none). */
  setReach(pos: Pos | null): void {
    this.reachFrom = pos;
    let s = "";
    if (pos !== null && pos !== OFF && pos !== OUT) {
      for (let k = 1; k <= 6; k++) {
        const n = this.ahead(pos, k);
        if (n === null) break;
        const c = this.px(pointOf(this.layout, n));
        s += `<g transform="translate(${c.x - 30} ${c.y + 6})"><rect x="-17" y="-17" width="34" height="34" rx="8" fill="#fffdf6" stroke="${INK}" stroke-width="4"/>`
          + PIPS[k].map(([dx, dy]) => `<circle cx="${dx * 8.5}" cy="${dy * 8.5}" r="3.6" fill="${INK}"/>`).join("") + `</g>`;
      }
    }
    this.reach.innerHTML = s;
  }

  /** The place k squares ahead along the road (no further than END). */
  private ahead(pos: Pos, k: number): Pos | null {
    if (isShortcut(pos)) {
      const fork = Math.floor(pos / 1000) - 1, i = pos % 1000 + k, f = this.board.rules.forks[fork];
      return i <= f.len ? shortcutPos(fork, i) : Math.min(f.merge + (i - f.len - 1), this.end);
    }
    const n = pos + k;
    return n > this.end ? null : n;
  }

  private px(p: Point): Point {
    const B = this.layout.bounds;
    return { x: (p.x - B.x) * U, y: (p.y - B.y) * U };
  }

  /** Tokens on the same place sit side by side; on the Start pad, in a 2 × 2 block. */
  private layoutTokens(): void {
    const key = (pl: { pos: Pos; stair: number }) => (pl.pos === OFF || pl.pos === 0 ? "pad" : `${pl.pos}:${pl.stair}`);
    const groups = new Map<string, number[]>();
    this.places.forEach((pl, i) => { if (pl.pos !== OUT) groups.set(key(pl), [...(groups.get(key(pl)) ?? []), i]); });
    this.places.forEach((pl, i) => {
      const t = this.tokens[i];
      if (pl.pos === OUT) { t.style.opacity = "0"; return; }
      const same = groups.get(key(pl))!, k = same.indexOf(i), n = same.length;
      const c = this.px(pointOf(this.layout, pl.pos, pl.stair));
      let dx = 0, dy = 0;
      if (key(pl) === "pad") { dx = (i - 1.5) * U; dy = 8; }
      else if (n > 1) { dx = (k - (n - 1) / 2) * 30; dy = n > 2 ? (k % 2 ? 14 : -14) : 0; }
      t.style.opacity = pl.pos === OFF ? ".75" : "1";
      t.style.transform = `translate(${c.x + dx}px, ${c.y + dy}px)${n > 1 && key(pl) !== "pad" ? " scale(.8)" : ""}`;
    });
    const where = ({ pos }: { pos: Pos }) => pos === OFF ? "at Home" : pos === OUT ? "out" : pos === 0 ? "on Start"
      : pos === this.end ? "at the festival" : isShortcut(pos) ? "on the Shortcut" : `on square ${pos}`;
    this.svg.setAttribute("aria-label", `The whole board. ${this.places.map((pl, i) => `${PLAYERS[i].name} ${where(pl)}`).join(", ")}.`);
  }
}

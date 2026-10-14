// The whole board at a glance: squares only (no numbers), event squares in their crayon colour, the Shortcut
// stones, Home and END, and where every token is. Tokens glide between places when the stage moves them.
import { OFF, OUT, START, isShortcut, type Board, type Pos } from "../engine";
import { type BoardLayout, type Point, layoutFor, pointOf } from "../render/layout";
import { INK, PAPER, REGION_WASH, SHORTCUT_COLOURS, crayonFor, regionOf } from "../render/palette";
import { pen, wobblyBox } from "../render/sketch";
import { PLAYERS, tokenSvg } from "./players";

const U = 100;

export class Overview {
  readonly layout: BoardLayout;
  private readonly svg: SVGSVGElement;
  private readonly tokens: SVGGElement[] = [];
  private readonly places: { pos: Pos; stair: number }[] = [];
  private readonly tree: SVGGElement;
  private readonly end: number;

  constructor(host: HTMLElement, board: Board, players: number) {
    const L = (this.layout = layoutFor(board)), B = L.bounds;
    this.end = board.endTile;
    const P = (p: Point) => ({ x: (p.x - B.x) * U, y: (p.y - B.y) * U }), T = L.tile * U;
    let squares = "";
    for (const s of L.shortcuts) {
      squares += `<polyline points="${s.trail.map((q) => `${P(q).x},${P(q).y}`).join(" ")}" fill="none" stroke="${INK}" stroke-opacity=".3" stroke-width="5" stroke-dasharray="8 10"/>`;
      s.stones.forEach((q, i) => {
        const t = board.rules.forks[s.fork].tiles[i + 1], c = P(q);
        squares += `<ellipse cx="${c.x}" cy="${c.y}" rx="${t ? 26 : 20}" ry="${t ? 22 : 16}" fill="${t ? SHORTCUT_COLOURS[t.cat] : "#bdb7ab"}" stroke="${INK}" stroke-width="3"/>`;
      });
    }
    L.squares.forEach((q, n) => {
      const t = board.tiles[n], c = P(q), d = wobblyBox(c.x, c.y, T, T, pen(`${board.id}:${n}`), 2);
      const fill = t ? crayonFor(board, n, t) : REGION_WASH[regionOf(board, n)];
      squares += `<path d="${d}" fill="${PAPER}"/><path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    });
    const e = P(L.end), h = P(L.home);
    squares += `<path d="${wobblyBox(e.x, e.y, T * 1.1, T * 1.1, pen(`${board.id}:end`), 2)}" fill="#f2c230" stroke="${INK}" stroke-width="6"/>`
      + `<path d="M${e.x - 22} ${e.y + 8}l22-30 22 30-22-8z" fill="#fff6b0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M${h.x - 34} ${h.y + 8}L${h.x} ${h.y - 26}l34 34v30h-68z" fill="#f7e2b8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
    host.innerHTML = `<svg class="overview-board" viewBox="0 0 ${B.w * U} ${B.h * U}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="The whole board">`
      + `${squares}<g class="tree" opacity="0"><path d="M-30 14l56-24M-26 22l56-24" stroke="#6b4f34" stroke-width="10" stroke-linecap="round"/><circle cx="28" cy="-14" r="16" fill="#3c8c50" stroke="${INK}" stroke-width="3"/></g>`
      + `<g class="tokens"></g></svg>`;
    this.svg = host.querySelector("svg")!;
    this.tree = this.svg.querySelector(".tree")!;
    const layer = this.svg.querySelector(".tokens")!;
    for (let i = 0; i < players; i++) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("ov-token");
      g.innerHTML = `<circle class="halo" r="62" fill="none" stroke="${INK}" stroke-width="7" stroke-dasharray="14 10"/>`
        + `<g transform="translate(-42 -42) scale(.84)">${tokenSvg(i).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>`;
      layer.append(g);
      this.tokens.push(g);
      this.places.push({ pos: OFF, stair: 0 });
    }
    this.layoutTokens();
  }

  /** Puts a token on a place (the token glides there). */
  setPlace(seat: number, pos: Pos, stair = 0): void {
    this.places[seat] = { pos, stair };
    this.layoutTokens();
  }

  /** Highlights the player whose turn it is. */
  setCurrent(seat: number): void {
    this.tokens.forEach((t, i) => t.classList.toggle("current", i === seat));
    // the current token on top
    this.tokens[seat].parentNode!.append(this.tokens[seat]);
  }

  setRoadblock(square: number | null): void {
    if (square === null) { this.tree.setAttribute("opacity", "0"); return; }
    const c = this.px(this.layout.squares[square]);
    this.tree.setAttribute("transform", `translate(${c.x} ${c.y})`);
    this.tree.setAttribute("opacity", "1");
  }

  private px(p: Point): Point {
    const B = this.layout.bounds;
    return { x: (p.x - B.x) * U, y: (p.y - B.y) * U };
  }

  /** Tokens on the same place sit side by side. */
  private layoutTokens(): void {
    const groups = new Map<string, number[]>();
    this.places.forEach((pl, i) => {
      if (pl.pos === OUT) return;
      const key = `${pl.pos}:${pl.stair}`;
      groups.set(key, [...(groups.get(key) ?? []), i]);
    });
    this.places.forEach((pl, i) => {
      const t = this.tokens[i];
      if (pl.pos === OUT) { t.style.opacity = "0"; return; }
      const same = groups.get(`${pl.pos}:${pl.stair}`)!, k = same.indexOf(i), n = same.length;
      const c = this.px(pointOf(this.layout, pl.pos, pl.stair));
      const dx = n > 1 ? (k - (n - 1) / 2) * 34 : 0, dy = n > 2 ? (k % 2 ? 14 : -14) : 0;
      t.style.opacity = "1";
      t.style.transform = `translate(${c.x + dx}px, ${c.y + dy}px)`;
    });
    // For screen readers: where everyone is.
    const where = ({ pos }: { pos: Pos }) => pos === OFF ? "at Home" : pos === OUT ? "out" : pos === START ? "on Start"
      : pos === this.end ? "at the festival" : isShortcut(pos) ? "on the Shortcut" : `on square ${pos}`;
    this.svg.setAttribute("aria-label", `The whole board. ${this.places.map((pl, i) => `${PLAYERS[i].name} ${where(pl)}`).join(", ")}.`);
  }
}

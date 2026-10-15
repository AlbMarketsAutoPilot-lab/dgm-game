// The whole board (the info area, owner 15 Oct): where am I, and what is ahead of me?
// A labyrinth spiral of plain paper squares with ink walls between the rings. No numbers and no crayon colours:
// good squares have a green frame (and ▲), bad squares a red frame (and ▼). The only colours are the players'
// tokens and the paper's old ladders and snakes, now cable cars (forward) and rivers (back). Tap any square, stone
// or pad to see what happens there. The squares the current player can reach with one die show a small die face.
import { OFF, OUT, isShortcut, shortcutPos, type Board, type Pos } from "../engine";
import { artFor } from "../render/art";
import { type BoardLayout, type Point, layoutFor, pointOf } from "../render/layout";
import { INK, PAPER, PUNISH, REWARD } from "../render/palette";
import { PLAYERS, tokenSvg } from "./players";

const U = 100;
const WALL = "#3b1f5e";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

export class Overview {
  readonly layout: BoardLayout;
  private readonly board: Board;
  private readonly svg: SVGSVGElement;
  private readonly tokens: SVGGElement[] = [];
  private readonly places: { pos: Pos; stair: number }[] = [];
  private readonly tree: SVGGElement;
  private readonly reach: SVGGElement;
  private readonly end: number;

  constructor(host: HTMLElement, board: Board, players: number, onPick: (pos: Pos) => void) {
    const L = (this.layout = layoutFor(board)), B = L.bounds;
    this.board = board;
    this.end = board.endTile;
    const P = (p: Point) => ({ x: (p.x - B.x) * U, y: (p.y - B.y) * U });
    const M = L.maze, m = P({ x: M.x, y: M.y });
    let s = `<rect x="${m.x}" y="${m.y}" width="${M.w * U}" height="${M.h * U}" rx="22" fill="${WALL}"/>`;
    // the road: openings in the wall where it steps into the next ring, and on to the festival
    const link = (a: Point, b: Point) => {
      const p = P(a), q = P(b), horiz = Math.abs(q.x - p.x) > Math.abs(q.y - p.y);
      const x = Math.min(p.x, q.x) - (horiz ? 0 : 46), y = Math.min(p.y, q.y) - (horiz ? 46 : 0);
      return `<rect x="${x}" y="${y}" width="${horiz ? Math.abs(q.x - p.x) : 92}" height="${horiz ? 92 : Math.abs(q.y - p.y)}" fill="${PAPER}"/>`;
    };
    for (let n = 1; n < board.lastTile; n++) if (Math.hypot(L.squares[n + 1].x - L.squares[n].x, L.squares[n + 1].y - L.squares[n].y) > 1.1) s += link(L.squares[n], L.squares[n + 1]);
    s += link(L.squares[board.lastTile], L.end);
    // Shortcut trails and stones (inside the walls)
    for (const sc of L.shortcuts) {
      s += `<polyline points="${sc.trail.map((q) => `${P(q).x},${P(q).y}`).join(" ")}" fill="none" stroke="#cbbfe0" stroke-width="5" stroke-dasharray="4 9" stroke-linecap="round"/>`;
      sc.stones.forEach((q, i) => {
        const t = board.rules.forks[sc.fork].tiles[i + 1], c = P(q), r = t ? 17 : 13;
        s += `<g class="pick" data-pos="${shortcutPos(sc.fork, i + 1)}"><circle cx="${c.x}" cy="${c.y}" r="${r + 9}" fill="transparent"/>`
          + `<ellipse cx="${c.x}" cy="${c.y}" rx="${r}" ry="${r * 0.82}" fill="#d9d2c4" stroke="${t ? (t.cat === "R" ? REWARD : PUNISH) : INK}" stroke-width="${t ? 7 : 3}"/></g>`;
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
    // Start pad (Home and Start: room for four tokens) and the festival
    const sp = P(L.start.centre), sw = L.start.w * U, sh = L.start.h * U, first = P(L.squares[1]);
    s += `<path d="M${sp.x + sw / 2 - 4} ${first.y}H${first.x - 52}" stroke="${INK}" stroke-width="8" stroke-dasharray="2 14" stroke-linecap="round"/>`
      + `<g class="pick" data-pos="0"><rect x="${sp.x - sw / 2}" y="${sp.y - sh / 2}" width="${sw}" height="${sh}" rx="22" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>`
      + `<rect x="${sp.x - sw / 2 + 10}" y="${sp.y - sh / 2 + 10}" width="${sw - 20}" height="${sh - 20}" rx="15" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 7"/>`
      + `<text x="${sp.x}" y="${sp.y - sh / 2 + 50}" text-anchor="middle" class="ov-title">START</text>`
      + `<text x="${sp.x}" y="${sp.y - sh / 2 + 82}" text-anchor="middle" class="ov-sub">a 6 to set off</text></g>`;
    const e = P(L.end), ew = L.endPad.w * U;
    s += `<g class="pick" data-pos="${board.endTile}"><rect x="${e.x - ew / 2}" y="${e.y - ew / 2}" width="${ew}" height="${ew}" rx="24" fill="#fff4c8" stroke="${INK}" stroke-width="8"/>`
      + artFor("lanterns", "Festival of Lights").replace("<svg ", `<svg x="${e.x - ew / 2 + 14}" y="${e.y - ew / 2 + 38}" width="${ew - 28}" height="${ew - 52}" `)
      + `<text x="${e.x}" y="${e.y - ew / 2 + 30}" text-anchor="middle" class="ov-sub">FESTIVAL</text></g>`;
    // cable cars (forward) and rivers (back)
    L.drawings.forEach((d, i) => {
      const pts = d.path.map(P), line = pts.map((q) => `${q.x},${q.y}`).join(" ");
      if (d.kind === "river") {
        s += `<polyline points="${line}" fill="none" stroke="#3d74c4" stroke-opacity=".55" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`
          + `<polyline class="flow" points="${line}" fill="none" stroke="#bfe6ff" stroke-width="6" stroke-dasharray="10 22" stroke-linecap="round"/>`;
      } else {
        const [a, b] = [pts[0], pts.at(-1)!], id = `cable${i}`;
        s += `<path id="${id}" d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#3a2f45" stroke-width="5"/>`
          + [a, b].map((q) => `<circle cx="${q.x}" cy="${q.y}" r="11" fill="#3a2f45"/>`).join("")
          + `<g><rect x="-17" y="-4" width="34" height="26" rx="6" fill="#d8433b" stroke="${INK}" stroke-width="4"/><path d="M0 -4v-12" stroke="#3a2f45" stroke-width="4"/><rect x="-11" y="2" width="22" height="9" rx="2" fill="#bfe6ff"/>`
          + (reduced() ? `<animateMotion dur="1s" fill="freeze" keyPoints=".5;.5" keyTimes="0;1" calcMode="linear"><mpath href="#${id}"/></animateMotion>` : `<animateMotion dur="${(5 + i).toFixed(1)}s" repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;.42;.5;.92;1" calcMode="linear"><mpath href="#${id}"/></animateMotion>`)
          + `</g>`;
      }
    });
    host.innerHTML = `<svg class="overview-board" viewBox="0 0 ${B.w * U} ${B.h * U}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="The whole board">`
      + s + this.legend(P)
      + `<g class="reach" aria-hidden="true"></g>`
      + `<g class="tree" opacity="0" aria-hidden="true"><path d="M-34 16l64-28M-30 26l64-28" stroke="#6b4f34" stroke-width="13" stroke-linecap="round"/><circle cx="32" cy="-16" r="18" fill="#3c8c50" stroke="${INK}" stroke-width="4"/></g>`
      + `<g class="tokens"></g></svg>`;
    this.svg = host.querySelector("svg")!;
    this.tree = this.svg.querySelector(".tree")!;
    this.reach = this.svg.querySelector(".reach")!;
    this.svg.addEventListener("click", (ev) => {
      const g = (ev.target as Element).closest<SVGGElement>(".pick");
      if (g) onPick(Number(g.dataset.pos));
    });
    const layer = this.svg.querySelector(".tokens")!;
    for (let i = 0; i < players; i++) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("ov-token");
      g.innerHTML = `<circle class="halo" r="58" fill="none" stroke="${INK}" stroke-width="8" stroke-dasharray="14 10"/>`
        + `<g transform="translate(-40 -40) scale(.8)">${tokenSvg(i).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>`;
      layer.append(g);
      this.tokens.push(g);
      this.places.push({ pos: OFF, stair: 0 });
    }
    this.layoutTokens();
  }

  private legend(P: (p: Point) => Point): string {
    const g = this.layout.legend, o = P({ x: g.x, y: g.y }), row = 84;
    const items: [string, string][] = [
      [`<rect x="0" y="-22" width="44" height="44" rx="6" fill="${PAPER}" stroke="${REWARD}" stroke-width="9"/>`, "good luck"],
      [`<rect x="0" y="-22" width="44" height="44" rx="6" fill="${PAPER}" stroke="${PUNISH}" stroke-width="9"/>`, "bad luck"],
      [`<rect x="-4" y="-26" width="52" height="52" rx="8" fill="${WALL}"/><ellipse cx="22" cy="0" rx="15" ry="12" fill="#d9d2c4" stroke="${INK}" stroke-width="3"/>`, "Shortcut"],
      [`<path d="M0 0H44" stroke="#3a2f45" stroke-width="5"/><rect x="11" y="-6" width="22" height="18" rx="4" fill="#d8433b" stroke="${INK}" stroke-width="3"/>`, "cable car: up"],
      [`<path d="M0 0q11-12 22 0t22 0" fill="none" stroke="#3d74c4" stroke-opacity=".7" stroke-width="16" stroke-linecap="round"/>`, "river: back"],
    ];
    return `<g class="legend" transform="translate(${o.x + 8} ${o.y + 30})" aria-hidden="true">`
      + items.map(([icon, label], i) => `<g transform="translate(0 ${i * row})">${icon}<text x="62" y="12" class="ov-legend">${label}</text></g>`).join("")
      + `<text x="0" y="${items.length * row + 6}" class="ov-legend ov-tip">Tap a square</text><text x="0" y="${items.length * row + 50}" class="ov-legend ov-tip">to see what's there</text></g>`;
  }

  /** Puts a token on a place (the token glides there). */
  setPlace(seat: number, pos: Pos, stair = 0): void {
    this.places[seat] = { pos, stair };
    this.layoutTokens();
  }

  /** Highlights the player whose turn it is. */
  setCurrent(seat: number): void {
    this.tokens.forEach((t, i) => t.classList.toggle("current", i === seat));
    this.tokens[seat].parentNode!.append(this.tokens[seat]);
  }

  setRoadblock(square: number | null): void {
    if (square === null) { this.tree.setAttribute("opacity", "0"); return; }
    const c = this.px(this.layout.squares[square]);
    this.tree.setAttribute("transform", `translate(${c.x} ${c.y})`);
    this.tree.setAttribute("opacity", "1");
  }

  /** Die faces on the squares 1–6 ahead of `pos` (Main Road; null = none). */
  setReach(pos: Pos | null): void {
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
      if (key(pl) === "pad") { dx = (k % 2 ? 1 : -1) * 50; dy = 14 + Math.floor(k / 2) * 84; }
      else if (n > 1) { dx = (k - (n - 1) / 2) * 30; dy = n > 2 ? (k % 2 ? 14 : -14) : 0; }
      t.style.opacity = pl.pos === OFF ? ".75" : "1";
      t.style.transform = `translate(${c.x + dx}px, ${c.y + dy}px)${n > 1 && key(pl) !== "pad" ? " scale(.8)" : ""}`;
    });
    const where = ({ pos }: { pos: Pos }) => pos === OFF ? "at Home" : pos === OUT ? "out" : pos === 0 ? "on Start"
      : pos === this.end ? "at the festival" : isShortcut(pos) ? "on the Shortcut" : `on square ${pos}`;
    this.svg.setAttribute("aria-label", `The whole board. ${this.places.map((pl, i) => `${PLAYERS[i].name} ${where(pl)}`).join(", ")}.`);
  }
}

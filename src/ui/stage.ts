// The stage: one big square at a time, with its illustration and story. Moving slides a row of squares under the
// token: a throw walks square by square (the token hops over each one), an event jump glides along the row
// (ladders, snakes, "go back to 6"), passing the squares in between quickly.
import { BoardIndex, OFF, OUT, isShortcut, shortcutOf, type Board, type Pos, type Spot } from "../engine";
import { artCss, artFor } from "../render/art";
import { PUNISH, REGION_WASH, REWARD, SHORTCUT_COLOURS, crayonFor, regionOf } from "../render/palette";
import { tokenSvg } from "./players";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reduced() ? Math.min(ms, 60) : ms));

/** How long one hop takes. */
export const STEP_MS = 340;

type Story = {
  start?: { name?: string; story?: string; icon?: string };
  end?: { name?: string; story?: string; icon?: string };
  stairs?: { start?: { name?: string; icon?: string }; trap?: { name?: string; icon?: string } };
  roads?: { forks?: { tiles?: Record<string, { icon?: string; story?: string }> }[]; safe?: { name?: string }; wild?: { name?: string } };
};

const chevron = (cat: "R" | "P") =>
  `<svg class="cmark" viewBox="0 0 20 14" aria-hidden="true"><path d="${cat === "R" ? "M3 11L10 3l7 8" : "M3 3l7 8 7-8"}" fill="none" stroke="${cat === "R" ? REWARD : PUNISH}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** What the stage says about a place: the card's look, and a caption for when a token stands there. */
export function describe(board: Board, pos: Pos, stair = 0): { html: string; cls: string; style: string; caption: string } {
  const story = board.story as unknown as Story;
  if (pos === OFF || pos === OUT) {
    return { cls: "home", style: "", caption: story.start?.story ?? "Home", html: `<div class="cart">${artFor("house", "Home")}</div><span class="cname">${esc(story.start?.name ?? "Home")}</span>` };
  }
  if (pos === board.endTile) {
    return { cls: "end ev", style: "--c:#f2c230", caption: story.end?.story ?? "END", html: `<div class="cart">${artFor("lanterns", "END")}</div><span class="cname big">${esc(story.end?.name ?? "END")}</span>` };
  }
  if (isShortcut(pos)) {
    const { fork, index } = shortcutOf(pos), t = board.rules.forks[fork].tiles[index], st = story.roads?.forks?.[fork]?.tiles?.[String(index)];
    const name = story.roads?.wild?.name ?? "The Shortcut";
    if (!t) return { cls: "stone", style: "", caption: name, html: `<span class="cnum small">${esc(name)}</span><div class="cart">${artFor("stones", name)}</div>` };
    return {
      cls: "ev stone", style: `--c:${SHORTCUT_COLOURS[t.cat]}`, caption: st?.story ?? t.text,
      html: `<span class="cnum small">${esc(name)}</span>${chevron(t.cat)}<div class="cart">${artFor(st?.icon ?? "signpost", esc(st?.story ?? t.text))}</div>`,
    };
  }
  const region = board.story.regions[regionOf(board, pos)]?.name ?? "";
  const wash = `--wash:${REGION_WASH[regionOf(board, pos)]}`;
  if (stair > 0) { // R17 stair steps on top of the square after Home or the trap
    const s = pos === 1 ? story.stairs?.start : story.stairs?.trap; // porch steps after Home, stepping stones after the Bog
    const name = s?.name ?? "Step";
    return { cls: "plain", style: wash, caption: `${name}: step ${stair}`, html: `<span class="cnum">${pos}</span><div class="cart soft">${artFor(s?.icon ?? "steps", name)}</div><span class="cname">${esc(name)} · ${stair}</span>` };
  }
  if (pos === 0) return { cls: "plain start", style: wash, caption: "Start", html: `<span class="cname big">Start</span>` };
  const t = board.tiles[pos];
  if (t) {
    const dest = t.type === "jump" && t.to !== undefined ? `<span class="cdest">→ ${t.to === 0 ? "Start" : t.to}</span>` : "";
    return {
      cls: "ev", style: `--c:${crayonFor(board, pos, t)}`, caption: t.story ?? t.text,
      html: `<span class="cnum">${pos}</span>${chevron(t.cat)}<div class="cart">${artFor(t.icon ?? "card", esc(t.story ?? t.text))}</div>${dest}`,
    };
  }
  const lm = board.story.landmarks[pos];
  if (lm) return { cls: "plain lm", style: wash, caption: lm.name, html: `<span class="cnum">${pos}</span><div class="cart soft">${artFor(lm.icon, esc(lm.name))}</div><span class="cname">${esc(lm.name)}</span>` };
  const fork = board.rules.forks.findIndex((f) => f.at === pos);
  if (fork >= 0) return { cls: "plain lm", style: wash, caption: "Crossroads", html: `<span class="cnum">${pos}</span><div class="cart soft">${artFor("signpost", "Crossroads")}</div><span class="cname">Crossroads</span>` };
  return { cls: "plain", style: wash, caption: region, html: `<span class="cnum">${pos}</span><span class="cname">${esc(region)}</span>` };
}

let artStyled = false;
/** The illustrations' animations, added to the page once. */
function styleArt(): void {
  if (artStyled) return;
  artStyled = true;
  const style = document.createElement("style");
  style.textContent = artCss();
  document.head.append(style);
}

export class Stage {
  private readonly board: Board;
  private readonly index_: BoardIndex;
  private readonly wrap: HTMLElement;
  private readonly strip: HTMLElement;
  private readonly token: HTMLElement;
  private readonly cap: HTMLElement;
  private cards: HTMLElement[] = [];
  private index = 0;

  constructor(host: HTMLElement, board: Board) {
    styleArt();
    this.board = board;
    this.index_ = new BoardIndex(board);
    host.innerHTML = `<div class="strip-wrap"><div class="strip"></div><div class="stage-token"></div></div><p class="caption" aria-live="polite"></p>`;
    this.wrap = host.querySelector(".strip-wrap")!;
    this.strip = host.querySelector(".strip")!;
    this.token = host.querySelector(".stage-token")!;
    this.cap = host.querySelector(".caption")!;
    new ResizeObserver(() => this.resize()).observe(this.wrap);
  }

  /** Shows one place, with this player's token on it. */
  show(seat: number, pos: Pos, stair = 0, caption = true): void {
    this.token.innerHTML = tokenSvg(seat);
    this.setCards([{ pos, stair }], 0);
    if (caption) this.caption(describe(this.board, pos, stair).caption);
  }

  caption(text: string, tone: "" | "good" | "bad" | "info" = ""): void {
    this.cap.textContent = text;
    this.cap.className = `caption ${tone}`;
    this.cap.animate?.([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: reduced() ? 0 : 220 });
  }

  /** Throw move: hops square by square along `path` (the squares after the current one). */
  async walk(path: Spot[], onStep: (s: Spot) => void): Promise<void> {
    const here = this.current;
    this.setCards([here, ...path], 0);
    for (let i = 1; i <= path.length; i++) {
      this.moveTo(i, STEP_MS);
      this.token.classList.remove("hop");
      void this.token.offsetWidth;
      this.token.classList.add("hop");
      onStep(path[i - 1]);
      await wait(STEP_MS);
    }
    this.token.classList.remove("hop");
    this.settle();
  }

  /** Event move (ladder, snake, "go to", fallen tree, swap): glides along the row to `to`. */
  async fly(to: Pos): Promise<void> {
    const from = this.current.pos, end = this.board.endTile;
    const main = (p: Pos) => p >= 0 && p < end && !isShortcut(p);
    let spots: Spot[];
    if (main(from) && main(to) && Math.abs(to - from) <= 30) {
      const lo = Math.min(from, to), hi = Math.max(from, to);
      spots = Array.from({ length: hi - lo + 1 }, (_, i) => ({ pos: lo + i, stair: 0 }));
    } else {
      spots = [{ pos: from, stair: 0 }, { pos: NaN, stair: 0 }, { pos: to, stair: 0 }]; // far: a blur in between
      if (this.index_.progress(to) < this.index_.progress(from)) spots.reverse(); // backwards: slide the other way
    }
    const a = spots.findIndex((s) => s.pos === from), b = spots.findIndex((s) => s.pos === to);
    this.setCards(spots, a < 0 ? 0 : a);
    const ms = Math.min(1700, 520 + 45 * Math.abs(b - a));
    this.token.classList.add("fly");
    this.moveTo(b, ms, "cubic-bezier(.55,0,.35,1)");
    await wait(ms);
    this.token.classList.remove("fly");
    this.settle();
  }

  /** A little bounce of the current square (an event happens here). */
  pulse(): void {
    if (reduced()) return;
    this.cards[this.index]?.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
  }

  private get current(): Spot {
    const c = this.cards[this.index];
    return { pos: Number(c?.dataset.pos ?? OFF), stair: Number(c?.dataset.stair ?? 0) };
  }

  private card(s: Spot): HTMLElement {
    const el = document.createElement("div");
    if (Number.isNaN(s.pos)) {
      el.className = "card blur";
      el.innerHTML = `<div class="speed"></div>`;
    } else {
      const d = describe(this.board, s.pos, s.stair);
      el.className = `card ${d.cls}`;
      el.setAttribute("style", d.style);
      el.innerHTML = d.html;
      el.dataset.pos = String(s.pos);
      el.dataset.stair = String(s.stair);
    }
    return el;
  }

  private setCards(spots: Spot[], index: number): void {
    this.cards = spots.map((s) => this.card(s));
    this.strip.replaceChildren(...this.cards);
    this.index = index;
    this.moveTo(index, 0);
  }

  /** After a move: keep only the square the token stands on. */
  private settle(): void {
    const s = this.current;
    this.setCards([s], 0);
  }

  private moveTo(i: number, ms: number, easing = "ease-in-out"): void {
    this.index = i;
    const card = parseFloat(getComputedStyle(this.wrap).getPropertyValue("--card")) || 200, gap = card * 0.12;
    const x = this.wrap.clientWidth / 2 - (i * (card + gap) + card / 2);
    this.strip.style.transition = ms && !reduced() ? `transform ${ms}ms ${easing}` : "none";
    this.strip.style.transform = `translateX(${x}px)`;
  }

  private resize(): void {
    const w = this.wrap.clientWidth, h = this.wrap.clientHeight;
    this.wrap.style.setProperty("--card", `${Math.max(120, Math.min(w * 0.62, h * 0.86))}px`);
    this.moveTo(this.index, 0);
  }
}

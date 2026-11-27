// The stage: one big square at a time, with its picture. Moving slides a row of squares under the token: a throw walks
// square by square (the token hops over each one), an event's move glides along the row (a lift, the Rockslide, a
// swap), passing the squares in between quickly.
// Step I phase C3 (owner, 26 Nov 2026): drawn from a v3 destination file. No square numbers on the card; only an event
// square's destination keeps its "→ 24" label (Part 2, rule 1). Place 0 (and below) is Home.
import { areaOf, type Board3 } from "../engine/v3";
import { type Place as Pos } from "../render/layout";
import { areaSignFor, artCss, artFor } from "../render/art";
import { esc } from "../render/html";
import { cardFace } from "../render/art-modern";
import { AREA_WASH, catColour } from "../render/palette";
import { tokenSvg } from "./players";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reduced() ? Math.min(ms, 60) : ms));

/** How long one hop takes. */
export const STEP_MS = 340;

/** The kind's mark: ▲ reward, ▼ punishment, ◆ the Swap Market. */
const mark = (cat: "R" | "P" | "S") => {
  const d = cat === "R" ? "M3 11L10 3l7 8" : cat === "P" ? "M3 3l7 8 7-8" : "M10 1.5l6.5 5.5-6.5 5.5-6.5-5.5z";
  return `<svg class="cmark" viewBox="0 0 20 14" aria-hidden="true"><path d="${d}" fill="${cat === "S" ? catColour(cat) : "none"}" stroke="${catColour(cat)}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};

/** What the stage shows for a place: the card's look. */
export function describe(board: Board3, pos: Pos): { html: string; cls: string; style: string } {
  const home = board.moments?.home?.title ?? "Home", dest = board.destination?.name ?? "";
  if (pos <= 0) return { cls: "home", style: "", html: `<div class="cart">${artFor("house", home)}</div><span class="cname">${esc(home)}</span>` };
  if (pos >= board.endTile) {
    return { cls: "end ev", style: "--c:#f2c230", html: `<div class="cart">${artFor(board.destination?.icon ?? "lanterns", dest)}</div><span class="cname big">${esc(dest)}</span>` };
  }
  const area = areaOf(board, pos), wash = `--wash:${AREA_WASH[board.areas.indexOf(area)] ?? "transparent"}`;
  const t = board.tiles[pos];
  if (t) {
    const title = t.title ?? "", to = t.type === "jump" || t.type === "dragonBoat" ? t.to : undefined;
    const destLabel = to !== undefined ? `<span class="cdest">→ ${to}</span>` : "";
    const art = t.icon === "card" ? cardFace("bonus", title) : artFor(t.icon ?? "card", title);
    return { cls: "ev", style: `--c:${catColour(t.cat)}`, html: `${mark(t.cat)}<div class="cart">${art}</div>${destLabel}` };
  }
  const lm = board.landmarks?.[pos];
  if (lm) return { cls: "plain lm", style: wash, html: `<div class="cart soft">${artFor(lm.icon ?? area.icon ?? "", lm.name)}</div><span class="cname">${esc(lm.name)}</span>` };
  // A plain square shows where you are with the area's picture (owner: no repeated area names on every square).
  return { cls: "plain rg", style: wash, html: `<div class="cart soft">${artFor(area.icon ?? "", area.name)}</div>` };
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
  private readonly board: Board3;
  private readonly wrap: HTMLElement;
  private readonly strip: HTMLElement;
  private readonly token: HTMLElement;
  private readonly fx: HTMLElement;
  /** When the stamp showing now is gone (stamps never overlap). */
  private stampFree = 0;
  private cards: HTMLElement[] = [];
  private index = 0;

  constructor(host: HTMLElement, board: Board3) {
    styleArt();
    this.board = board;
    host.innerHTML = `<div class="strip-wrap"><div class="strip"></div><div class="stage-token"></div><div class="fx" aria-hidden="true"></div></div>`;
    this.wrap = host.querySelector(".strip-wrap")!;
    this.strip = host.querySelector(".strip")!;
    this.token = host.querySelector(".stage-token")!;
    this.fx = host.querySelector(".fx")!;
    new ResizeObserver(() => this.resize()).observe(this.wrap);
  }

  /** Shows one place, with this player's token on it. */
  show(seat: number, pos: Pos): void {
    this.token.innerHTML = tokenSvg(seat);
    this.setCards([pos], 0);
  }

  /** The big moments: a burst of sparks (good), a jolt and a red flash (bad), a bump, confetti (win). */
  celebrate(kind: "good" | "bad" | "bump" | "win"): void {
    const card = this.cards[this.index];
    card?.classList.remove("glow-good", "glow-bad");
    if (kind === "good" || kind === "bad") { void card?.offsetWidth; card?.classList.add(`glow-${kind}`); }
    if (reduced()) return;
    if (kind === "bad" || kind === "bump") this.wrap.animate([{ transform: "none" }, { transform: "translateX(-9px) rotate(-1deg)" }, { transform: "translateX(8px) rotate(1deg)" }, { transform: "translateX(-5px)" }, { transform: "none" }], { duration: 420 });
    const colours = kind === "bad" ? ["#c0392b", "#7a5c3e", "#4b2377"] : ["#f2c230", "#2e8b3e", "#e8562f", "#3d74c4", "#f08bb4"];
    const n = kind === "win" ? 70 : kind === "good" ? 26 : 14;
    const bits = Array.from({ length: n }, (_, i) => {
      const b = document.createElement("i"), a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 140;
      b.style.background = colours[i % colours.length];
      if (kind === "win") { b.style.left = `${Math.random() * 100}%`; b.style.top = "-6%"; }
      this.fx.append(b);
      const to = kind === "win" ? `translate(${(Math.random() - 0.5) * 120}px, ${this.wrap.clientHeight * 1.1}px) rotate(${Math.random() * 900}deg)`
        : `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + (kind === "bad" ? 60 : 0)}px) rotate(${Math.random() * 600}deg)`;
      b.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: to + " scale(.6)", opacity: 0 }], { duration: kind === "win" ? 2600 + Math.random() * 1800 : 900 + Math.random() * 500, easing: "cubic-bezier(.15,.7,.4,1)", delay: kind === "win" ? Math.random() * 900 : 0, fill: "forwards" });
      return b;
    });
    setTimeout(() => bits.forEach((b) => b.remove()), kind === "win" ? 5600 : 1600);
  }

  /** How long the stamps and the area sign still waiting or showing take (ms): Mr. Lin's panel waits for them, so it
   * never covers them (audit, 27 Nov 2026: C2). */
  busyFor(): number {
    return Math.max(0, this.stampFree - performance.now());
  }

  /** A big stamp over the square: "Lucky!", "Don't get mad!" … */
  stamp(kind: "good" | "bad", say?: string): string {
    const words = say ? [say] : kind === "good" ? ["Lucky!", "Yes!", "Woohoo!", "Nice one!", "Jackpot!", "Look at you!"] : ["Don't get mad!", "Oh no!", "Ouch!", "Seriously?!", "Not again!", "Typical."];
    const word = words[Math.floor(Math.random() * words.length)];
    // one stamp at a time: a second one waits until the first has gone
    const now = performance.now(), start = Math.max(now, this.stampFree);
    this.stampFree = start + 1500;
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = `stamp ${kind}`;
      el.textContent = word;
      this.fx.append(el);
      el.animate(reduced() ? [{ opacity: 1 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }] : [{ transform: "translate(-50%, -50%) scale(2.6) rotate(-14deg)", opacity: 0 }, { transform: "translate(-50%, -50%) scale(1) rotate(-8deg)", opacity: 1, offset: 0.18 },
        { transform: "translate(-50%, -50%) scale(1.06) rotate(-8deg)", opacity: 1, offset: 0.75 }, { transform: "translate(-50%, -80%) scale(.9) rotate(-8deg)", opacity: 0 }], { duration: 1500, easing: "ease-out", fill: "forwards" });
      setTimeout(() => el.remove(), 1600);
    }, start - now);
    return word;
  }

  /** The area's sign when a token reaches a new area of the journey: "Now entering · Countryside". */
  sign(name: string): void {
    const area = this.board.areas.find((a) => a.name === name);
    if (!area) return;
    const now = performance.now(), start = Math.max(now, this.stampFree);
    this.stampFree = start + 2200;
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "region-sign";
      el.innerHTML = `<div class="rs-board"><div class="rs-pic">${areaSignFor(area.icon ?? "", "")}</div><div><small>Now entering</small><b>${esc(name)}</b></div></div><div class="rs-post"></div>`;
      this.fx.append(el);
      el.animate(reduced() ? [{ opacity: 1 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }] : [{ transform: "translate(-50%, -140%)", opacity: 0 }, { transform: "translate(-50%, 0)", opacity: 1, offset: 0.15 },
        { transform: "translate(-50%, 0)", opacity: 1, offset: 0.85 }, { transform: "translate(-50%, 0)", opacity: 0 }], { duration: 2200, easing: "ease-out", fill: "forwards" });
      setTimeout(() => el.remove(), 2300);
    }, start - now);
  }

  /** The Bonus card flies onto the square and flips away. */
  cardPlayed(): void {
    if (reduced()) return;
    const c = document.createElement("div");
    c.className = "played-card";
    c.innerHTML = cardFace("bonus", "");
    this.fx.append(c);
    c.animate([{ transform: "translate(-50%, 120%) scale(.4) rotate(-30deg)", opacity: 0 }, { transform: "translate(-50%, -50%) scale(1.2) rotate(6deg)", opacity: 1, offset: 0.4 },
      { transform: "translate(-50%, -50%) scale(1.1) rotate(-4deg)", opacity: 1, offset: 0.7 }, { transform: "translate(-50%, -160%) scale(.6) rotateY(90deg)", opacity: 0 }], { duration: 1400, easing: "ease-in-out", fill: "forwards" });
    setTimeout(() => c.remove(), 1500);
  }

  /** Throw move: hops square by square along `path` (the squares after the current one). */
  async walk(path: Pos[], onStep: (pos: Pos) => void): Promise<void> {
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

  /** An event's move (a square's jump, "next good square", the Dragon Boat, a swap): glides along the row to `to`. */
  async fly(to: Pos): Promise<void> {
    const from = this.current, end = this.board.endTile;
    const main = (p: Pos) => p >= 0 && p < end;
    let spots: Pos[];
    if (main(from) && main(to) && Math.abs(to - from) <= 30) {
      const lo = Math.min(from, to), hi = Math.max(from, to);
      spots = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    } else {
      spots = [from, NaN, to]; // far: a blur in between
      if (to < from) spots.reverse(); // backwards: slide the other way
    }
    const a = spots.indexOf(from), b = spots.indexOf(to);
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

  private get current(): Pos {
    const c = this.cards[this.index];
    return Number(c?.dataset.pos ?? 0);
  }

  private card(pos: Pos): HTMLElement {
    const el = document.createElement("div");
    if (Number.isNaN(pos)) {
      el.className = "card blur";
      el.innerHTML = `<div class="speed"></div>`;
    } else {
      const d = describe(this.board, pos);
      el.className = `card ${d.cls}`;
      el.setAttribute("style", d.style);
      el.innerHTML = d.html;
      el.dataset.pos = String(pos);
    }
    return el;
  }

  private setCards(spots: Pos[], index: number): void {
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
    // The token stands half over the card's bottom edge: at most .74 of the height keeps it whole.
    // (No more than that even on the smallest phones: the note's lane under it must never touch the token, owner 16 Oct.)
    this.wrap.style.setProperty("--card", `${Math.max(36, Math.min(w * 0.7, h * 0.74))}px`);
    this.moveTo(this.index, 0);
  }
}

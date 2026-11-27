// The notifications (Step I phase C4, owner 25–26 Nov 2026): short facts for every player, robots included: "Blue: back
// 18 squares." Only the approved patterns of the destination file; no square numbers. They never repeat the guide's
// story. One shows at a time; each fades after a few seconds. Owner, 27 Nov 2026: over the destination's square in the
// middle of the board, as big as that square (app.css, .notes; overview.ts gives its place).
import { PLAYERS, tokenSvg } from "./players";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/** How long a notification stays when nothing waits after it, and at least when the next one waits. */
const SHOW_MS = 4200, MIN_MS = 1500;

interface Item { seat: number | null; html: string; tone: "good" | "bad" | "" }

/**
 * One notification at a time over the destination's square, filling it (owner, 27 Nov 2026): the next one waits until
 * the one on show has been there at least MIN_MS, then takes its place; the last one stays SHOW_MS, then fades.
 */
export class Notes {
  private readonly list: HTMLElement;
  private queue: Item[] = [];
  private shown: HTMLElement | null = null;
  private since = 0;
  private timer = 0;

  constructor(host: HTMLElement) {
    this.list = document.createElement("div");
    this.list.className = "notes";
    this.list.setAttribute("role", "status");
    this.list.setAttribute("aria-live", "polite");
    host.append(this.list);
  }

  /** `html`: the filled pattern (names already escaped). */
  push(seat: number | null, html: string, tone: "good" | "bad" | "" = ""): void {
    this.queue.push({ seat, html, tone });
    if (!this.shown || performance.now() - this.since >= MIN_MS) this.next();
  }

  clear(): void {
    clearTimeout(this.timer);
    this.queue = [];
    this.shown = null;
    this.list.replaceChildren();
  }

  private next(): void {
    clearTimeout(this.timer);
    const it = this.queue.shift();
    if (!it) return;
    const el = document.createElement("p");
    el.className = `note ${it.tone}`;
    el.innerHTML = (it.seat === null ? "" : tokenSvg(it.seat, "tok", true)) + `<span>${it.html}</span>`;
    if (it.seat !== null) el.style.setProperty("--who", PLAYERS[it.seat].colour);
    this.list.replaceChildren(el);
    this.shown = el;
    this.since = performance.now();
    if (!reduced()) el.animate([{ opacity: 0, transform: "scale(.92)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: "ease-out" });
    this.timer = window.setTimeout(() => {
      if (this.queue.length) return this.next();
      this.timer = window.setTimeout(() => this.fade(el), SHOW_MS - MIN_MS);
    }, MIN_MS);
  }

  private fade(el: HTMLElement): void {
    if (this.shown !== el) return;
    this.shown = null;
    if (reduced()) { el.remove(); return; }
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).onfinish = () => el.remove();
  }
}

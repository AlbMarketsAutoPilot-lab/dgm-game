// The notifications (Step I phase C4, owner 25–26 Nov 2026): short facts on the left (over the board on phones held
// upright), for every player, robots included: "Blue: back 18 squares." Only the approved patterns of the destination
// file; no square numbers. They never repeat the guide's story. Each fades after a few seconds; at most three show.
import { PLAYERS, tokenSvg } from "./players";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const SHOW_MS = 4200, MAX = 3;

export class Notes {
  private readonly list: HTMLElement;

  constructor(host: HTMLElement) {
    this.list = document.createElement("div");
    this.list.className = "notes";
    this.list.setAttribute("role", "status");
    this.list.setAttribute("aria-live", "polite");
    host.append(this.list);
  }

  /** `html`: the filled pattern (names already escaped). */
  push(seat: number | null, html: string, tone: "good" | "bad" | "" = ""): void {
    const el = document.createElement("p");
    el.className = `note ${tone}`;
    el.innerHTML = (seat === null ? "" : tokenSvg(seat, "tok", true)) + `<span>${html}</span>`;
    if (seat !== null) el.style.setProperty("--who", PLAYERS[seat].colour);
    this.list.append(el);
    while (this.list.childElementCount > MAX) this.list.firstElementChild!.remove();
    if (!reduced()) el.animate([{ opacity: 0, transform: "translateX(-1rem)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "ease-out" });
    setTimeout(() => {
      if (!el.isConnected) return;
      if (reduced()) return el.remove();
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).onfinish = () => el.remove();
    }, SHOW_MS);
  }

  clear(): void {
    this.list.replaceChildren();
  }
}

// Mr. Lin's panel (Step I phase C4, owner 25–26 Nov 2026): the guide's popup on the right (on phones held upright, the
// lower panel), covering the zoomed square and the die. It tells the story of a person's turn (never for robots) and
// holds every choice: its buttons name their action. It shows only after the pieces have stopped moving. While it is
// open, the next action's button (roll, pass the die) is in it, so the action area under it is never needed.
// Phase C7 (owner, 26 Nov 2026): his figure is the owner's own picture (src/assets/guide/mr-lin.webp, the white
// background taken out), in a round medallion at the top right, his name on its left (owner, 26 Nov 2026), breathing gently (still with "reduce motion").
import { esc } from "../render/html";
import face from "../assets/guide/mr-lin.webp";

export interface GuideButton {
  label: string;
  value: string;
  primary?: boolean;
}

export interface GuideContent {
  title?: string;
  /** Mr. Lin's words (our own text, HTML allowed). */
  text?: string;
  /** What happens, in plain words (e.g. "Without the card: back 18 squares."). */
  outcome?: string;
  tone?: "good" | "bad" | "";
  /** The question of a choice. */
  question?: string;
  buttons?: GuideButton[];
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export class GuidePanel {
  private el: HTMLElement | null = null;
  private done: ((v: string) => void) | null = null;

  /**
   * `host`: the panel it covers (the zoomed square, the die and the action area). `wide`: the whole game screen, for
   * small screens where his words do not fit in `host` (a folded phone, a small phone, a phone held sideways): then the
   * panel covers everything, so nothing has to scroll.
   */
  constructor(private readonly host: HTMLElement, private readonly name: string, private readonly wide?: HTMLElement) {
    addEventListener("resize", () => this.fit());
  }

  /** In its own panel if the words fit there, else over the whole game screen. */
  private fit(): void {
    const back = this.el?.parentElement;
    if (!back || !this.wide) return;
    const body = back.querySelector<HTMLElement>(".gp-body")!, over = () => body.scrollHeight > body.clientHeight + 2;
    back.classList.remove("gp-wide");
    if (back.parentElement !== this.host) this.host.append(back);
    if (over()) { back.classList.add("gp-wide"); this.wide.append(back); }
  }

  /** Opens the panel (replacing what it showed). Resolves with the button pressed, or "replaced". */
  show(c: GuideContent): Promise<string> {
    this.close();
    const el = (this.el = document.createElement("section"));
    el.className = `guide-panel ${c.tone ?? ""}`;
    el.setAttribute("role", c.buttons?.length ? "alertdialog" : "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", this.name);
    el.innerHTML = `
      <header class="gp-head"><p class="gp-name">${esc(this.name)}</p><div class="gp-face" aria-hidden="true"><img src="${face}" alt=""></div></header>
      <div class="gp-body"><div class="gp-words">
        ${c.title ? `<h2 class="gp-title">${c.title}</h2>` : ""}
        ${c.text ? `<p class="gp-text">${c.text}</p>` : ""}
        ${c.outcome ? `<p class="gp-outcome">${c.outcome}</p>` : ""}
        ${c.question ? `<p class="gp-question">${c.question}</p>` : ""}
      </div></div>
      <div class="gp-buttons"></div>`;
    // owner, 26 Nov 2026: a little space around it, so it reads as a popup; the space is a dark backdrop, so what is
    // behind does not show through
    const back = document.createElement("div");
    back.className = "gp-back";
    back.append(el);
    this.host.append(back);
    this.fit();
    if (!reduced()) el.animate([{ opacity: 0, transform: "translateY(.75rem)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: "ease-out" });
    const p = new Promise<string>((r) => (this.done = r));
    if (c.buttons?.length) void this.buttons(c.buttons);
    this.fit();
    return p;
  }

  /** Puts buttons in the open panel; resolves with the one pressed (or "replaced"). Null when the panel is closed. */
  buttons(list: GuideButton[]): Promise<string> | null {
    const el = this.el;
    if (!el) return null;
    const row = el.querySelector(".gp-buttons")!;
    const p = new Promise<string>((r) => {
      const prev = this.done;
      this.done = (v) => { prev?.(v); r(v); };
    });
    row.replaceChildren(...list.map((b) => {
      const btn = document.createElement("button");
      btn.textContent = b.label; // plain text (S3)
      btn.className = b.primary || list.length === 1 ? "primary big" : "big";
      btn.onclick = () => this.answer(b.value);
      return btn;
    }));
    row.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    this.fit();
    return p;
  }

  /** Takes the buttons away (the panel stays). */
  noButtons(): void {
    this.el?.querySelector(".gp-buttons")?.replaceChildren();
  }

  get open(): boolean {
    return !!this.el;
  }

  close(): void {
    const d = this.done;
    this.el?.parentElement?.remove();
    this.el = null;
    this.done = null;
    d?.("replaced");
  }

  private answer(v: string): void {
    const d = this.done;
    this.el?.parentElement?.remove();
    this.el = null;
    this.done = null;
    d?.(v);
  }
}

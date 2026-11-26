// Mr. Lin's panel (Step I phase C4, owner 25–26 Nov 2026): the guide's popup on the right (on phones held upright, the
// lower panel), covering the zoomed square and the die. It tells the story of a person's turn (never for robots) and
// holds every choice: its buttons name their action. It shows only after the pieces have stopped moving. While it is
// open, the next action's button (roll, pass the die) is in it, so the action area under it is never needed.
// The guide's figure comes in phase C7; until then the panel shows his name.
import { esc } from "../render/html";

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

  /** `host`: the panel it covers (the zoomed square, the die and the action area). */
  constructor(private readonly host: HTMLElement, private readonly name: string) {}

  /** Opens the panel (replacing what it showed). Resolves with the button pressed, or "replaced". */
  show(c: GuideContent): Promise<string> {
    this.close();
    const el = (this.el = document.createElement("section"));
    el.className = `guide-panel ${c.tone ?? ""}`;
    el.setAttribute("role", c.buttons?.length ? "alertdialog" : "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", this.name);
    el.innerHTML = `
      <header class="gp-head"><p class="gp-name">${esc(this.name)}</p></header>
      <div class="gp-body">
        ${c.title ? `<h2 class="gp-title">${c.title}</h2>` : ""}
        ${c.text ? `<p class="gp-text">${c.text}</p>` : ""}
        ${c.outcome ? `<p class="gp-outcome">${c.outcome}</p>` : ""}
        ${c.question ? `<p class="gp-question">${c.question}</p>` : ""}
      </div>
      <div class="gp-buttons"></div>`;
    this.host.append(el);
    if (!reduced()) el.animate([{ opacity: 0, transform: "translateY(.75rem)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: "ease-out" });
    const p = new Promise<string>((r) => (this.done = r));
    if (c.buttons?.length) void this.buttons(c.buttons);
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
    this.el?.remove();
    this.el = null;
    this.done = null;
    d?.("replaced");
  }

  private answer(v: string): void {
    const d = this.done;
    this.el?.remove();
    this.el = null;
    this.done = null;
    d?.(v);
  }
}

// Mr. Lin's panel (Step I phase C4, owner 25–26 Nov 2026): the guide's popup on the right (on phones held upright, the
// lower panel), covering the zoomed square and the die. It tells the story of a person's turn (never for robots) and
// holds every choice: its buttons name their action. It shows only after the pieces have stopped moving. Step I phase F
// (owner, 27 Nov 2026): it stays until one of its own buttons is tapped (a story or a tip: "I understand") and the game
// waits; "Roll die" is never in it, only in the action area (game time, not talking time).
// Phase C7 (owner, 26 Nov 2026): his figure is the owner's own picture (src/assets/guide/mr-lin.webp, the white
// background taken out), in a round medallion at the top right, his name on its left (owner, 26 Nov 2026), breathing gently (still with "reduce motion").
// Audit of 27 Nov 2026 (D1–D3): where there is room, the panel also shows the picture of what he speaks about (the
// square, the area, Home, the tree, the boat: the game's own pictures) and his words are larger, so a big panel is never
// half empty; his words are his quote at every size where it fits, also when the panel covers the whole screen, and
// also when his words are a question.
import { esc } from "../render/html";
import face from "../assets/guide/mr-lin.webp";

export interface GuideButton {
  label: string;
  value: string;
  primary?: boolean;
}

export interface GuideContent {
  title?: string;
  /** The picture of what he speaks about (inline SVG), shown where there is room. */
  art?: string;
  /** Mr. Lin's words (our own text, HTML allowed). */
  text?: string;
  /** What happens, in plain words (e.g. "Without the card: back 18 squares."). */
  outcome?: string;
  tone?: "good" | "bad" | "";
  /** The question of a choice. */
  question?: string;
  /** The question is his own words (at Home and at the fallen tree, owner 26–27 Nov 2026): it goes inside his quote,
   * after his story. */
  says?: boolean;
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
  private readonly onResize = () => this.fit();

  constructor(private readonly host: HTMLElement, private readonly name: string, private readonly wide?: HTMLElement) {
    addEventListener("resize", this.onResize);
  }

  /** The game screen goes: stop listening to the window (audit, B10). */
  dispose(): void {
    removeEventListener("resize", this.onResize);
  }

  /**
   * In its own panel if the words fit there, else over the whole game screen. Step I phase F (owner, 27 Nov 2026): where
   * there is room, his words read as his quote (a card with quote marks), smaller when space is short, plain when the
   * quote would not fit; nothing ever scrolls for it.
   */
  private fit(): void {
    const el = this.el, back = el?.parentElement;
    if (!el || !back) return;
    const body = back.querySelector<HTMLElement>(".gp-body")!, over = () => body.scrollHeight > body.clientHeight + 2;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const art = !!el.querySelector(".gp-art"), quote = !!el.querySelector(".gp-text");
    // the best that fits: picture and quote, picture and small quote, quote, small quote, picture and plain words, plain
    const tries: [boolean, "" | "gp-quote" | "small"][] = [[true, "gp-quote"], [true, "small"], [false, "gp-quote"], [false, "small"], [true, ""], [false, ""]];
    const place = (): boolean => {
      for (const [pic, q] of tries) {
        if (pic && !art) continue;
        if (q && !(quote && body.clientWidth > 17 * rem)) continue;
        el.classList.toggle("gp-noart", !pic);
        el.classList.toggle("gp-quote", !!q);
        el.classList.toggle("small", q === "small");
        if (!over()) return true;
      }
      return false;
    };
    if (this.wide) {
      back.classList.remove("gp-wide");
      if (back.parentElement !== this.host) this.host.append(back);
    }
    if (place() || !this.wide) return;
    back.classList.add("gp-wide"); // the whole game screen; the quote is tried again there (audit, D2)
    this.wide.append(back);
    place();
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
      <div class="gp-body">${c.art ? `<div class="gp-art" aria-hidden="true">${c.art}</div>` : ""}<div class="gp-words">
        ${c.title ? `<h2 class="gp-title">${c.title}</h2>` : ""}
        ${c.text ? `<p class="gp-text">${c.text}${c.question && c.says ? `<span class="gp-says">${c.question}</span>` : ""}</p>` : ""}
        ${c.outcome ? `<p class="gp-outcome">${c.outcome}</p>` : ""}
        ${c.question && !(c.text && c.says) ? `<p class="${c.text ? "gp-question" : "gp-text"}">${c.question}</p>` : "" /* his question alone is his quote (D3) */}
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

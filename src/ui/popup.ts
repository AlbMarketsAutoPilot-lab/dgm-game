// Popups over the whole-board panel (owner, 15 Oct): every story moment, choice and info card is a popup. The
// stage stays free for the action. A story popup stays open until the next one replaces it, or until the player
// closes it with ✕ to look at the board. A choice popup can be put aside with ✕ (to look at the board first) and
// brought back with "Back to your choice". Info popups (a square, a player, a card) open on top and, when closed,
// give back the popup that was there before.
export interface PopupButton {
  label: string;
  value: string;
  primary?: boolean;
}

export interface PopupContent {
  /** Picture (inline SVG). */
  art?: string;
  title: string;
  /** The tale (HTML allowed: it is our own text). */
  text?: string;
  /** What happens, in plain words. */
  outcome?: string;
  tone?: "good" | "bad" | "";
  /** More below the outcome (HTML: e.g. this turn's earlier moments). */
  more?: string;
  /** An exclamation in the stamp style ("Woohoo!", "Ouch!"), on the picture's corner. */
  shout?: string;
  /** Small line above the title (who / where). */
  kicker?: string;
  buttons?: PopupButton[];
  /** "story" (default), "choice" (must be answered), "info" (on top of the rest), "win". */
  kind?: "story" | "choice" | "info" | "win";
}

interface Open {
  c: PopupContent;
  el: HTMLElement;
  done: (v: string) => void;
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export class Popups {
  private readonly layer: HTMLElement;
  private readonly back: HTMLButtonElement;
  /** The open story / choice popup, and info popups stacked on top of it. */
  private base: Open | null = null;
  private infos: Open[] = [];

  constructor(host: HTMLElement) {
    this.layer = document.createElement("div");
    this.layer.className = "pop-layer";
    this.back = document.createElement("button");
    this.back.className = "pop-back primary";
    this.back.textContent = "Back to your choice";
    this.back.hidden = true;
    this.back.onclick = () => { if (this.base) { this.base.el.hidden = false; this.back.hidden = true; this.focus(this.base.el); } };
    host.append(this.layer, this.back);
  }

  /** Shows a popup. Resolves with the button pressed, or "close" (✕), or "replaced" (a newer popup took its place). */
  show(c: PopupContent): Promise<string> {
    return new Promise((done) => {
      const el = this.build(c);
      const open: Open = { c, el, done };
      if (c.kind === "info") {
        this.infos.push(open);
        if (this.base) this.base.el.hidden = true;
        this.infos.slice(0, -1).forEach((o) => (o.el.hidden = true));
      } else {
        this.closeInfos();
        this.drop(this.base, "replaced");
        this.base = open;
        this.back.hidden = true;
      }
      this.layer.append(el);
      if (!reduced()) el.animate([{ opacity: 0, transform: "translateY(14px) scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(.2,1.4,.4,1)" });
      if (c.kind === "info") this.focus(el); // no auto-focus elsewhere: the game is played by tapping, not by holding Enter
    });
  }

  /** Closes everything (a new turn). */
  clear(): void {
    this.closeInfos();
    this.drop(this.base, "replaced");
    this.base = null;
    this.back.hidden = true;
  }

  /** Whether a story / choice popup is showing. */
  get showing(): boolean {
    return !!this.base && !this.base.el.hidden;
  }

  private focus(el: HTMLElement): void {
    el.querySelector<HTMLElement>(".pop-buttons button, .pop-x")?.focus({ preventScroll: true });
  }

  private closeInfos(): void {
    for (const o of this.infos) this.drop(o, "close");
    this.infos = [];
  }

  private drop(o: Open | null, why: string): void {
    if (!o) return;
    o.el.remove();
    o.done(why);
  }

  private answer(o: Open, v: string): void {
    if (o.c.kind === "info") {
      this.infos = this.infos.filter((x) => x !== o);
      this.drop(o, v);
      const top = this.infos.at(-1) ?? this.base;
      if (top) top.el.hidden = false;
      return;
    }
    if (o.c.kind === "choice" && v === "close") { // put aside, not answered
      o.el.hidden = true;
      this.back.hidden = false;
      this.back.focus({ preventScroll: true });
      return;
    }
    if (this.base === o) this.base = null;
    this.drop(o, v);
  }

  private build(c: PopupContent): HTMLElement {
    const el = document.createElement("section");
    el.className = `pop ${c.kind ?? "story"} ${c.tone ?? ""}`;
    el.setAttribute("role", c.kind === "choice" || c.kind === "win" ? "alertdialog" : "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", c.title);
    el.innerHTML = `
      <button class="pop-x" aria-label="${c.kind === "choice" ? "Look at the board first" : "Close"}">✕</button>
      ${c.art ? `<div class="pop-art">${c.art}</div>` : ""}
      ${c.shout ? `<span class="pop-shout ${c.tone === "bad" ? "bad" : "good"}">${c.shout}</span>` : ""}
      <div class="pop-head">
        ${c.kicker ? `<p class="pop-kicker">${c.kicker}</p>` : ""}
        <h2 class="pop-title">${c.title}</h2>
      </div>
      <div class="pop-body">
        ${c.text ? `<p class="pop-text">${c.text}</p>` : ""}
        ${c.outcome ? `<p class="pop-outcome">${c.outcome}</p>` : ""}
        ${c.more ?? ""}
        ${c.buttons?.length ? `<div class="pop-buttons"></div>` : ""}
      </div>`;
    const open = () => (c.kind === "info" ? this.infos.find((o) => o.el === el) : this.base?.el === el ? this.base : null);
    el.querySelector<HTMLButtonElement>(".pop-x")!.onclick = () => { const o = open(); if (o) this.answer(o, "close"); };
    const row = el.querySelector(".pop-buttons");
    for (const b of c.buttons ?? []) {
      const btn = document.createElement("button");
      btn.textContent = b.label;
      if (b.primary) btn.classList.add("primary");
      btn.onclick = () => { const o = open(); if (o) this.answer(o, b.value); };
      row!.append(btn);
    }
    return el;
  }
}

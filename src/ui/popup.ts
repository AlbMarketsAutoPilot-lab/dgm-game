// Popups over the whole-board panel (owner, 15 Oct): every story moment, choice and info card is a popup. The
// stage stays free for the action. A story popup stays open until the next one replaces it, or until the player
// closes it with ✕ to look at the board. A choice popup can be put aside with ✕ (to look at the board first) and
// brought back with "Back to your choice". Info popups (a square, a player, a card) open on top and, when closed,
// give back the popup that was there before.
//
// Fitting (owner, 15 Oct: "buttons cut, you need to scroll to see them"): a popup sits over the board when it fits
// there. When it does not (phones: the board is under half the screen), it moves to the big layer, over everything
// above the die and the action button (so a choice's buttons stay in view). When even that is too small, the popup gets
// compact, and only its text scrolls: its own buttons stay pinned at its bottom. Fitted again when the screen turns.
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
  /** Over everything above the controls, for popups that do not fit over the board. */
  private readonly big: HTMLElement;
  /** Over the whole screen, for a popup with its own buttons or an info popup (the controls are not needed then). */
  private readonly full: HTMLElement;
  private readonly back: HTMLButtonElement;
  /** The open story / choice popup, and info popups stacked on top of it. */
  private base: Open | null = null;
  private infos: Open[] = [];

  /** `host`: the board panel; `screen`: the whole game screen; `controls`: the die and action button (never covered). */
  constructor(host: HTMLElement, screen: HTMLElement, controls: HTMLElement) {
    this.layer = document.createElement("div");
    this.layer.className = "pop-layer";
    this.big = document.createElement("div");
    this.big.className = "pop-layer pop-big";
    this.full = document.createElement("div");
    this.full.className = "pop-layer pop-big pop-full";
    screen.append(this.big, this.full);
    new ResizeObserver(() => {
      screen.style.setProperty("--ctl", `${controls.offsetHeight}px`);
      this.refit();
    }).observe(screen);
    this.back = document.createElement("button");
    this.back.className = "pop-back primary";
    this.back.textContent = "Back to your choice";
    this.back.hidden = true;
    this.back.onclick = () => { if (this.base) { this.base.el.hidden = false; this.fit(this.base.el); this.back.hidden = true; this.focus(this.base.el); } };
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
      this.fit(el);
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

  /** Over the board if it fits there; else in the big layer; else compact, with only the text scrolling. */
  private fit(el: HTMLElement): void {
    if (el.hidden) return;
    const over = () => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    el.classList.remove("compact");
    if (el.parentElement !== this.layer) this.layer.append(el);
    if (!over()) return;
    (el.dataset.own ? this.full : this.big).append(el);
    if (over()) el.classList.add("compact");
  }

  /** The screen changed size: fit the open popups again. */
  private refit(): void {
    for (const o of [this.base, ...this.infos]) if (o) this.fit(o.el);
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
      if (top) { top.el.hidden = false; this.fit(top.el); }
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
    if (c.kind === "info" || c.kind === "win" || c.buttons?.length) el.dataset.own = "1"; // needs no controls while open
    el.setAttribute("role", c.kind === "choice" || c.kind === "win" ? "alertdialog" : "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", c.title);
    el.innerHTML = `
      <button class="pop-x" aria-label="${c.kind === "choice" ? "Look at the board first" : "Close"}">✕</button>
      ${c.art ? `<div class="pop-art">${c.art}</div>` : ""}
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

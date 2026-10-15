// The die: tumbles, then shows the thrown face. A row beside it lists the throws of the move being made
// ("6 + 6 + 3 = 15"). A 6 that only lets you enter or leave the Bog moves nobody (R15), so it is shown apart
// ("6 to enter · 2"): the total is always exactly the squares the token walks (audit, 15 Oct).
const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export class Dice {
  private readonly die: HTMLElement;
  private readonly list: HTMLElement;
  /** What a screen reader hears: every throw, and the total. */
  private readonly said: HTMLElement;
  private throws: number[] = [];
  /** A throw that moved nobody (the 6 to enter, the 6 out of the Bog), shown before the list. */
  private note = "";
  /** The next throw starts a new list (after a move: a new move). */
  private stale = false;
  /** The waiting tap listener, dropped when the throw was made with the button instead (audit: they piled up). */
  private tap: AbortController | null = null;

  constructor(host: HTMLElement) {
    host.innerHTML = `<button class="die" aria-label="Die" disabled></button><span class="throws" aria-hidden="true"></span><span class="sr" aria-live="polite"></span>`;
    this.die = host.querySelector(".die")!;
    this.list = host.querySelector(".throws")!;
    this.said = host.querySelector(".sr")!;
    this.face(6);
  }

  private face(n: number): void {
    this.die.innerHTML = Array.from({ length: 9 }, (_, i) => `<i class="${PIPS[n].includes(i) ? "pip" : ""}"></i>`).join("");
    this.die.setAttribute("aria-label", `Die shows ${n}`);
  }

  /** The die can be tapped to roll (it bounces, inviting). */
  ready(on: boolean): void {
    (this.die as HTMLButtonElement).disabled = !on;
    this.die.classList.toggle("ready", on);
    if (on) this.die.setAttribute("aria-label", "Tap the die to roll");
    else { this.tap?.abort(); this.tap = null; }
  }

  /** Resolves when the die is tapped. */
  tapped(): Promise<void> {
    this.tap?.abort();
    const tap = (this.tap = new AbortController());
    return new Promise((r) => this.die.addEventListener("click", () => r(), { once: true, signal: tap.signal }));
  }

  clear(): void {
    this.throws = [];
    this.note = "";
    this.stale = false;
    this.list.textContent = "";
    this.said.textContent = "";
  }

  /** The last throw was the 6 that let the player enter (or leave the Bog): it moves nobody. */
  released(where: "start" | "trap"): void {
    const six = this.throws.pop();
    this.note = `${six ?? 6} ${where === "start" ? "to enter" : "out of the Bog"}`;
    this.show();
  }

  /** A move was made: the next throw begins a new list. */
  moved(): void {
    this.stale = true;
  }

  private show(): void {
    const total = this.throws.reduce((a, b) => a + b, 0), sum = this.throws.length > 1 ? `${this.throws.join(" + ")} = ${total}` : this.throws.join("");
    this.list.textContent = this.note ? [this.note, sum].filter(Boolean).join(" · ") : this.throws.length > 1 ? sum : "";
    this.said.textContent = this.list.textContent || (this.throws.length ? `Rolled ${this.throws[this.throws.length - 1]}` : "");
  }

  /** Tumbles and lands on `n`. */
  async roll(n: number): Promise<void> {
    if (!reduced()) {
      this.die.classList.add("tumble");
      for (let i = 0; i < 7; i++) {
        this.face(1 + Math.floor(Math.random() * 6));
        await new Promise((r) => setTimeout(r, 65));
      }
      this.die.classList.remove("tumble");
    }
    this.face(n);
    this.die.classList.remove("landed");
    void this.die.offsetWidth;
    if (!reduced()) this.die.classList.add("landed");
    if (this.stale) { this.throws = []; this.note = ""; this.stale = false; }
    this.throws.push(n);
    this.show();
    await new Promise((r) => setTimeout(r, reduced() ? 50 : n === 6 ? 650 : 380));
  }
}

// The die: tumbles, then shows the thrown face. A row beside it lists this turn's throws ("6 + 6 + 3").
const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export class Dice {
  private readonly die: HTMLElement;
  private readonly list: HTMLElement;
  private throws: number[] = [];

  constructor(host: HTMLElement) {
    host.innerHTML = `<div class="die" role="img" aria-label="Die"></div><span class="throws" aria-live="polite"></span>`;
    this.die = host.querySelector(".die")!;
    this.list = host.querySelector(".throws")!;
    this.face(6);
  }

  private face(n: number): void {
    this.die.innerHTML = Array.from({ length: 9 }, (_, i) => `<i class="${PIPS[n].includes(i) ? "pip" : ""}"></i>`).join("");
    this.die.setAttribute("aria-label", `Die shows ${n}`);
  }

  clear(): void {
    this.throws = [];
    this.list.textContent = "";
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
    this.throws.push(n);
    const total = this.throws.reduce((a, b) => a + b, 0);
    this.list.textContent = this.throws.length > 1 ? `${this.throws.join(" + ")} = ${total}` : "";
    await new Promise((r) => setTimeout(r, reduced() ? 50 : n === 6 ? 650 : 380));
  }
}

// The spoil question (R14, the attack use of the Bonus card; owner, Step 5b): a person may press "Don't ask me again
// this game"; from then on the engine gets "Let it go" (false) for that seat, as if they had pressed it. One game only.

export class SpoilQuestion {
  private readonly quiet: Set<number>;

  /** `quiet`: seats that already said "Don't ask me again" (a continued game, U1). */
  constructor(quiet: Iterable<number> = []) {
    this.quiet = new Set(quiet);
  }

  /** The seats that said "Don't ask me again this game" (saved with the game). */
  get silenced(): number[] {
    return [...this.quiet];
  }

  /** Ask this seat? No once it pressed "Don't ask me again this game". */
  asks(seat: number): boolean {
    return !this.quiet.has(seat);
  }

  /** The engine's answer for the button pressed ("yes", "no", "never"); "never" also stops the questions. */
  answer(seat: number, button: string): boolean {
    if (button === "never") this.quiet.add(seat);
    return button === "yes";
  }
}

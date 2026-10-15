// The spoil question (R14, the attack use of the Bonus card; owner, Step 5b): a person may press "Don't ask me again
// this game"; from then on the engine gets "Let it go" (false) for that seat, as if they had pressed it. One game only.

export class SpoilQuestion {
  private readonly quiet = new Set<number>();

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

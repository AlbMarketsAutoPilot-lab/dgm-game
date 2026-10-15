// The spoil question (R14, Step 5b): "Don't ask me again this game" answers "Let it go" from then on, per seat.
import { describe, expect, it } from "vitest";
import { SpoilQuestion } from "../src/ui/spoil";

describe("the spoil question", () => {
  it("asks every seat by default, and answers the engine as pressed", () => {
    const q = new SpoilQuestion();
    expect([0, 1, 2, 3].every((s) => q.asks(s))).toBe(true);
    expect(q.answer(1, "yes")).toBe(true);
    expect(q.answer(1, "no")).toBe(false);
    expect(q.asks(1)).toBe(true);
  });
  it("'Don't ask me again' answers false (the card is kept) and stops asking that seat only", () => {
    const q = new SpoilQuestion();
    expect(q.answer(2, "never")).toBe(false);
    expect(q.asks(2)).toBe(false);
    expect([0, 1, 3].every((s) => q.asks(s))).toBe(true);
  });
  it("lasts one game: a new game asks again", () => {
    const q = new SpoilQuestion();
    q.answer(0, "never");
    expect(new SpoilQuestion().asks(0)).toBe(true);
  });
});

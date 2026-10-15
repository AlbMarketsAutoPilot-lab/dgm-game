// The narrative (owner, 15 Oct): every event square tells a tale, and says what it does.
import { describe, expect, it } from "vitest";
import { BOARDS } from "../src/engine";
import { SQUARE_TALES, outcome, taleOf } from "../src/ui/tales";

describe.each(["long", "short"] as const)("%s board tales", (id) => {
  const B = BOARDS[id];
  it("every event square has its own tale and a plain-words outcome", () => {
    for (const [k, t] of Object.entries(B.tiles)) {
      const x = taleOf(B, Number(k));
      expect(x, `square ${k}`).not.toBeNull();
      if (!t.requires) expect(SQUARE_TALES[t.icon!], `square ${k} (${t.icon})`).toBeDefined();
      expect(outcome(B, t).length).toBeGreaterThan(5);
    }
  });
});

describe("outcomes follow the rules", () => {
  const L = BOARDS.long.tiles;
  it.each([
    [10, "Back to Start."], [20, "Jump ahead to square 33."], [97, "Back to the Bog. Stuck there: a 6 gets you out, or spend a lantern."],
    [50, "Miss 3 turns."], [5, "Miss your next turn."], [45, "Throw 2 times and move the total."],
    [202, "Only the Snake Leader: back to square 165. Everyone else is safe here."],
  ])("square %i: %s", (n, want) => expect(outcome(BOARDS.long, L[n])).toBe(want));
});

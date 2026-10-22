// The narrative (owner, 15 Oct): every event square tells a tale, and says what it does.
import { describe, expect, it } from "vitest";
import { BOARDS } from "../src/engine";
import { SQUARE_TALES, brief, outcome, taleOf } from "../src/ui/tales";

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
  // Owner, 16 Oct: one short sentence each, and a computer player's note says only the rule, about that player
  it("every tale is short, and every square has a rule-only note", () => {
    for (const [k, t] of Object.entries(B.tiles)) {
      expect(taleOf(B, Number(k))!.tale.text.split(/\s+/).length, `square ${k}`).toBeLessThanOrEqual(14);
      const n = brief(B, t);
      expect(n.length, `square ${k}`).toBeGreaterThan(5);
      expect(n, `square ${k}`).not.toMatch(/\byou(r)?\b/i);
    }
  });
});

describe("outcomes follow the rules", () => {
  const L = BOARDS.long.tiles;
  it.each([
    [10, "Back to Start."], [20, "Jump ahead to square 33."], [97, "Back to the Bog. Stuck there: roll a 6 to get out, or spend a spare lantern."],
    [50, "Miss 3 turns."], [5, "Miss your next turn."], [45, "Throw 2 times and move the total."],
    [202, "Only the Snake Leader: back to square 165. Everyone else is safe here."],
  ])("square %i: %s", (n, want) => expect(outcome(BOARDS.long, L[n])).toBe(want));
  it.each([
    [10, "back to Start"], [97, "back to the Bog, stuck until a 6"], [5, "misses the next turn"], [50, "misses 3 turns"],
    [202, "the snake wants its ride back: back to square 165"],
  ])("note for square %i: %s", (n, want) => expect(brief(BOARDS.long, L[n])).toBe(want));
});

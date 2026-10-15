// The die faces on the whole board and the "Next throw" tip (audit, 15 Oct): they show where one throw stops, and
// must agree with the engine. A 6 always throws again (R2), so no face ever marks the square 6 ahead.
import { describe, expect, it } from "vitest";
import { reachSteps } from "../src/ui/overview";
import { play } from "./helpers";

const moved = (o: { dice: number[]; double?: boolean }) => {
  const { events } = play({ dice: o.dice, turns: 1, players: 1, setup: [{ pos: 50, double: !!o.double }] });
  const m = events.find((e) => e.type === "move");
  return m && m.type === "move" ? m.to - m.from : 0;
};

describe("where one throw stops", () => {
  it("faces 1–5 only, and each moves exactly as the engine moves it", () => {
    expect(reachSteps(false).map((r) => r.face)).toEqual([1, 2, 3, 4, 5]);
    for (const { face, steps } of reachSteps(false)) expect(moved({ dice: [face] })).toBe(steps);
  });

  it("a 6 never stops 6 squares ahead: it always throws again", () => {
    for (let k = 1; k <= 5; k++) expect(moved({ dice: [6, k] })).toBe(6 + k);
    expect(reachSteps(false).some((r) => r.steps === 6)).toBe(false);
  });

  it("a doubled throw moves twice the face, as the engine does", () => {
    for (const { face, steps } of reachSteps(true)) {
      expect(steps).toBe(2 * face);
      expect(moved({ dice: [face], double: true })).toBe(steps);
    }
  });
});

// The v3 app engine (src/engine/v3) plays exactly the same games as the v3 simulator (tools/sim/engine3.mjs):
// same seed -> same throws, same winner, same length and the same record for every player, with 2–4 robots.
// So every number in docs/analysis/stepI-A_measure.md (robot rows) holds for the app (owner, 25 Nov 2026: both engines kept).
import { describe, expect, it } from "vitest";
import { rng } from "../src/engine";
import { DESTINATIONS, playGame3 } from "../src/engine/v3";
// @ts-expect-error -- plain JavaScript without type declarations
import { simulate3 } from "../tools/sim/engine3.mjs";

const SEEDS = 400;
const board = DESTINATIONS["lantern-festival"];

describe("Lantern Festival (v3): game by game against the simulator", () => {
  it.each([2, 3, 4])("%i robots, " + SEEDS + " seeds", (players) => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const js = simulate3(board, { players, perGame: true }, 1, seed);
      const ts = playGame3(board, players, rng(seed));
      if (js.games === 0) { expect(ts, `seed ${seed}`).toBeNull(); continue; }
      expect({ seed, ...ts }).toEqual({ seed, ...js.records[0] });
    }
  });

  it("many games from one random source: the same games, one after another", () => {
    const js = simulate3(board, { players: 4, perGame: true }, 3000, 9000);
    const rand = rng(9000), ts = [];
    for (let g = 0; g < 3000; g++) { const r = playGame3(board, 4, rand); if (r) ts.push(r); }
    expect(js.capped).toBe(3000 - ts.length);
    expect(ts).toEqual(js.records);
  });
});

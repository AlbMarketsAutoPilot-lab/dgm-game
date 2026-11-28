// The Carnival (Step I phase D, owner 28 Nov 2026): its own board file, played by the same engine, unchanged.
// 1. The file passes the engine's board check. 2. The app engine (src/engine/v3) and the simulator
// (tools/sim/engine3.mjs) play exactly the same Carnival games, so docs/analysis/carnival-measure.md holds for the app.
import { describe, expect, it } from "vitest";
import { rng } from "../src/engine/rng";
import { parseBoard3, playGame3 } from "../src/engine/v3";
// @ts-expect-error -- plain JavaScript without type declarations
import { simulate3 } from "../tools/sim/engine3.mjs";
import carnivalJson from "../data/carnival.json";

const board = parseBoard3(carnivalJson);
const SEEDS = 400;

describe("Carnival: the board file", () => {
  it("passes the engine's board check, with the approved areas and squares", () => {
    expect(board.id).toBe("carnival");
    expect(board.areas.map((a) => [a.from, a.to])).toEqual([[0, 6], [7, 26], [27, 46], [47, 66], [67, 86], [87, 100]]);
    expect(Object.keys(board.tiles).map(Number)).toEqual([4, 9, 14, 19, 25, 29, 33, 37, 41, 45, 50, 54, 58, 62, 65, 69, 73, 77, 81, 88, 91, 95, 98, 100]);
  });
});

describe("Carnival: game by game against the simulator", () => {
  it.each([2, 3, 4])("%i robots, " + SEEDS + " seeds", (players) => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const js = simulate3(board, { players, perGame: true }, 1, seed);
      const ts = playGame3(board, players, rng(seed));
      if (js.games === 0) { expect(ts, `seed ${seed}`).toBeNull(); continue; }
      expect({ seed, ...ts }).toEqual({ seed, ...js.records[0] });
    }
  });
});

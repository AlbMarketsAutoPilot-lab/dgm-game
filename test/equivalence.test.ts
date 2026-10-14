// The TypeScript engine plays exactly the same games as the measured simulator (tools/sim/engine.mjs):
// same seed -> same throws, same winner, same length, same captures and lanterns, for both boards and 2–4 players.
// So every number in docs/analysis/measure-long.md and measure-short.md holds for the app (GCD §15).
import { describe, expect, it } from "vitest";
import { BOARDS, playGame, playGames, rng } from "../src/engine";
import { simulate } from "./simulator";

const SEEDS = 400;

describe.each(["long", "short"] as const)("%s board: game by game against the simulator", (id) => {
  const board = BOARDS[id];
  it.each([2, 3, 4])(`%i players, ${SEEDS} seeds`, (players) => {
    let compared = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const js = simulate(board, { ...board.rules, players, perGame: true }, 1, seed);
      const ts = playGame(board, players, rng(seed));
      if (js.games === 0) { expect(ts).toBeNull(); continue; }
      expect(ts, `seed ${seed}`).not.toBeNull();
      const jr = js.records![0];
      expect({ seed, winner: ts!.winner, rounds: ts!.rounds }).toEqual({ seed, winner: js.fairness.seatWinPct.indexOf(100), rounds: jr.rounds });
      ts!.players.forEach((p, i) => {
        const q = jr.players[i];
        expect({ seed, seat: i, ...p }).toEqual({
          seed, seat: i,
          captured: q.captured, lanterns: Math.max(0, q.life), minLanterns: q.minLife, out: q.out, outRound: q.outRound,
          enterRound: q.enterRound, lanternsLost: q.lostWait, lanternsWon: q.gainTriple, throwTurns: q.throwTurns,
          sixes: [q.six1, q.six2, q.six3],
        });
      });
      compared++;
    }
    expect(compared).toBe(SEEDS);
  });

  it("many games from one random source: same win % by seat and same length", () => {
    const js = simulate(board, board.rules as unknown as Record<string, unknown>, 3000, 9000);
    const ts = playGames(board, 3000, 9000);
    expect(ts.seatWinPct).toEqual(js.fairness.seatWinPct);
    expect(ts.length).toEqual(js.length);
    expect(ts.capped).toBe(js.capped);
  });
});

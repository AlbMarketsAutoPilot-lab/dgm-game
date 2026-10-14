// The TypeScript engine reproduces the published measurements of the frozen game exactly
// (docs/analysis/measure-long.md and measure-short.md, scenarios A–C: 100,000 games each, seeds 9000–9002 as in
// tools/sim/run.mjs). Slow: run with `npm run test:sim`.
import { describe, expect, it } from "vitest";
import { BOARDS, playGames } from "../src/engine";

const N = 100_000;
const PUBLISHED = {
  long: [
    { players: 4, seat: [25.15, 24.78, 25.05, 25.02], mean: 52, p10: 30, median: 48, p90: 79 },
    { players: 3, seat: [33.45, 33.25, 33.3] },
    { players: 2, seat: [50.27, 49.73] },
  ],
  short: [
    { players: 4, seat: [24.95, 25.18, 24.83, 25.04], mean: 30.9, p10: 16, median: 28, p90: 49 },
    { players: 3, seat: [33.47, 33.13, 33.4] },
    { players: 2, seat: [50.22, 49.78] },
  ],
};

describe.each(["long", "short"] as const)("%s board, published numbers", (id) => {
  it.each(PUBLISHED[id].map((p, i) => ({ ...p, seed: 9000 + i })))("$players players (seed $seed)", (p) => {
    const r = playGames(BOARDS[id], N, p.seed, p.players);
    expect(r.games).toBe(N);
    expect(r.seatWinPct).toEqual(p.seat);
    if ("mean" in p) expect(r.length).toEqual({ mean: p.mean, p10: p.p10, median: p.median, p90: p.p90 });
  });
});

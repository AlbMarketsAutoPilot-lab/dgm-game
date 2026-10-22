// The TypeScript engine reproduces the published measurements of the frozen game exactly
// (docs/analysis/measure-long.md and measure-short.md, scenarios A–C: 100,000 games each, seeds 9000–9002 as in
// tools/sim/run.mjs). Slow: run with `npm run test:sim`.
// Numbers re-measured on 22 Oct 2026 for the owner's rules of that day (nobody out, the lantern shield; step H); the docs
// were regenerated with the same command at the same time.
import { describe, expect, it } from "vitest";
import { BOARDS, playGames } from "../src/engine";

const N = 100_000;
const PUBLISHED = {
  long: [
    { players: 4, seat: [25.14, 24.93, 25.19, 24.74], mean: 50.8, p10: 30, median: 47, p90: 76 },
    { players: 3, seat: [33.3, 33.39, 33.32] },
    { players: 2, seat: [50.4, 49.6] },
  ],
  short: [
    { players: 4, seat: [25.39, 24.95, 24.88, 24.78], mean: 28.9, p10: 16, median: 26, p90: 44 },
    { players: 3, seat: [33.62, 33.28, 33.09] },
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

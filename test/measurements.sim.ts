// The TypeScript engine reproduces the published measurements of the frozen game exactly
// (docs/analysis/measure-long.md and measure-short.md, scenarios A–C: 100,000 games each, seeds 9000–9002 as in
// tools/sim/run.mjs). Slow: run with `npm run test:sim`.
// Numbers re-measured on 15 Oct 2026 for the owner's rules of that day (6 only enters, every 6 one more throw, no stair
// steps, no Shortcut, second Bonus card); the docs were regenerated with the same command at the same time.
import { describe, expect, it } from "vitest";
import { BOARDS, playGames } from "../src/engine";

const N = 100_000;
const PUBLISHED = {
  long: [
    { players: 4, seat: [25.06, 25.02, 24.93, 24.99], mean: 50.8, p10: 30, median: 47, p90: 76 },
    { players: 3, seat: [33.51, 33.11, 33.39] },
    { players: 2, seat: [49.91, 50.09] },
  ],
  short: [
    { players: 4, seat: [25.36, 25.1, 24.84, 24.69], mean: 28.9, p10: 16, median: 26, p90: 44 },
    { players: 3, seat: [33.57, 33.36, 33.08] },
    { players: 2, seat: [50.33, 49.67] },
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

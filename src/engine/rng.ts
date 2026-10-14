// Seeded random numbers (mulberry32), bit-for-bit the same as `rng` in tools/sim/engine.mjs,
// so a seed gives the same games in the app as in the simulator.

export type Rng = () => number;

export function rng(seed: number): Rng {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One die throw, 1–6, from a random source. */
export const d6 = (rand: Rng): number => 1 + Math.floor(rand() * 6);

/** A seed for a new game when none is given. */
export const randomSeed = (): number => Math.floor(Math.random() * 2 ** 31);

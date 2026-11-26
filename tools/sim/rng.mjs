// The simulator's random numbers (mulberry32), shared by the v3 simulator (engine3.mjs) and the app engine
// (src/engine/rng.ts draws the same numbers). Step I phase C8: moved out of the v2 simulator, now in archive/.
export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

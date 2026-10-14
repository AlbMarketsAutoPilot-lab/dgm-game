// The measured simulator (tools/sim/engine.mjs), imported as the reference the TypeScript engine must match.
// @ts-expect-error -- plain JavaScript without type declarations
import { simulate as simulateJs } from "../tools/sim/engine.mjs";

export interface SimPlayerRecord {
  six1: number; six2: number; six3: number; throwTurns: number; captured: number; life: number; out: boolean;
  gainTriple: number; minLife: number; outRound: number | null; enterRound: number; lostWait: number;
}
export interface SimResult {
  games: number;
  capped: number;
  fairness: { seatWinPct: number[]; ci95: number };
  length: { mean: number; p10: number; median: number; p90: number };
  records?: { rounds: number; players: SimPlayerRecord[] }[];
  players?: Record<string, unknown>[];
}

export const simulate = simulateJs as (board: unknown, rules: Record<string, unknown>, games: number, seed: number) => SimResult;

// R20 check for any board: one player who always takes the Shortcut against 3 simple players, rotated through every seat
// (the same check as in i6.mjs). Fair = 25%.
// Usage: node tools/sim/shortcut.mjs <board.json> [games=100000]
import { readFileSync } from "node:fs";
import { simulate } from "./engine.mjs";

const [, , path, gamesArg = "100000"] = process.argv;
const board = JSON.parse(readFileSync(path, "utf8")), N = Number(gamesArg);
let w = 0;
for (let seat = 0; seat < 4; seat++) {
  const types = ["simple", "simple", "simple", "simple"]; types[seat] = "wild";
  w += simulate(board, { ...board.rules, types }, N / 2, 9000 + seat).fairness.seatWinPct[seat] / 4;
}
console.log(`Always-Shortcut player against 3 simple players (\`${board.id}\`, ${(N / 2).toLocaleString("en")} games per seat): ${w.toFixed(2)}% (±${(196 * Math.sqrt(0.1875 / (2 * N))).toFixed(2)}, fair 25%)`);

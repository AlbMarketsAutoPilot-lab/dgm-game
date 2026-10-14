// Writes (or checks) a regression snapshot: the paper board must always give the same numbers.
// Usage: node tools/sim/test/snapshot.mjs write | check
import { readFileSync, writeFileSync } from "node:fs";
import { loadBoard, simulate } from "../engine.mjs";

const raw = JSON.parse(readFileSync(new URL("../../../data/board-v0-paper.json", import.meta.url), "utf8"));
const res = simulate(loadBoard(raw), raw.rules, 20000, 4242);
const file = new URL("./v0-snapshot.json", import.meta.url);
const pick = (r) => ({ seatWinPct: r.seatWinPct, rounds: r.rounds, perPlayer: r.perPlayer, resilience: r.resilience, tiles: r.tiles });

if (process.argv[2] === "write") { writeFileSync(file, JSON.stringify(pick(res), null, 1)); console.log("snapshot written"); }
else {
  const want = JSON.parse(readFileSync(file, "utf8")), got = pick(res);
  // every value in the snapshot must be identical; new fields may be added
  const diffs = [];
  const cmp = (a, b, path) => {
    if (a && typeof a === "object") { for (const k of Object.keys(a)) cmp(a[k], b?.[k], `${path}.${k}`); }
    else if (a !== b) diffs.push(`${path}: snapshot ${a} vs now ${b}`);
  };
  cmp(want, got, "v0");
  if (diffs.length) { console.error("FAIL\n" + diffs.join("\n")); process.exit(1); }
  console.log("PASS: paper board numbers identical to snapshot");
}

// Step H (owner, 22 Oct 2026): nobody out, the lantern shield, Easy / Normal computer players (GCD R14, R17, R18, R21).
// 40,000 games per row, 4 players, both boards. A seat-rotated row puts the one different player on each seat for
// 10,000 games, so its win % is free of seat effects. Run: node tools/sim/stepH.mjs > docs/analysis/stepH-lanterns.md
import { readFileSync } from "node:fs";
import { simulate } from "./engine.mjs";

const N = 40_000, P = 4;
const load = (id) => JSON.parse(readFileSync(new URL(`../../data/board-${id}.json`, import.meta.url)));
const pct = (x) => `${x.toFixed(1)}%`;

// The rules until 21 Oct 2026: the 4th loss puts a player out, no shield.
const before = (b) => ({ ...b.rules, keepLast: false, shield: false, outAfterZero: true });

/** `one` on each seat in turn (N / 4 games each) among `rest`; or the same type everywhere when one === rest. */
function row(b, rules, one, rest, seed) {
  const runs = [];
  for (let k = 0; k < P; k++) {
    const types = Array.from({ length: P }, (_, i) => (i === k ? one : rest));
    runs.push({ k, r: simulate(b, { ...rules, players: P, types }, N / P, seed + k) });
  }
  const avg = (f) => runs.reduce((a, { r }) => a + f(r), 0) / P;
  const seats = Array.from({ length: P }, (_, i) => avg((r) => r.fairness.seatWinPct[i]));
  return {
    target: runs.reduce((a, { k, r }) => a + r.fairness.seatWinPct[k], 0) / P,
    seats, rounds: avg((r) => r.length.mean), close: avg((r) => r.excitement.pctCloseFinish),
    leads: avg((r) => r.excitement.leadChanges), dry10: avg((r) => r.boredom.pctNoMove10),
    out: avg((r) => r.i6.pctPlayersOut), spent: avg((r) => r.i6.lifelinesSpentPerGame),
    lost: avg((r) => r.i6.lifelinesLostPerPlayer), capped: runs.reduce((a, { r }) => a + r.capped, 0),
  };
}

let md = `# Step H: nobody out, the lantern shield, Easy and Normal computer players

Owner, 22 Oct 2026 (GCD R14, R17, R18, R21). Measured with the real simulator (\`tools/sim/engine.mjs\`, which
\`test/equivalence.test.ts\` checks game by game against the app's engine, Easy and Normal players included).
${N.toLocaleString("en")} games per row, ${P} players. "1 X among 3 Y": the X player sits on each seat for ${(N / P).toLocaleString("en")} games,
so its win % has no seat effect (fair share 25%, ±0.42 at 95%). Command: \`node tools/sim/stepH.mjs\`.

- **Easy** = the simple player measured since I-7 (never spends a lantern, the Bonus card on its own next punishment,
  always the Bog boots).
- **Normal** = spends a spare lantern to leave the Bog at once (at Home it rolls for a 6); uses the Bonus card like Easy,
  except on the Bog itself when it holds the Bog boots (it wears the boots); otherwise shields a punishment worth 10
  squares or more (a square back = 1, a missed turn = 4, the Bog = 10 without boots, "nearest punishment" = 0: it is
  asked again on the square it reaches); never tries the last lantern.

`;
for (const id of ["long", "short"]) {
  const b = load(id), now = b.rules;
  const rows = [
    ["Rules until 21 Oct: 4 Easy", "seats", row(b, before(b), "simple", "simple", 7100)],
    ["New rules: 4 Easy", "seats", row(b, now, "simple", "simple", 7200)],
    ["New rules: 1 Normal among 3 Easy", "Normal", row(b, now, "normal", "simple", 7300)],
    ["New rules: 1 Easy among 3 Normal", "Easy", row(b, now, "simple", "normal", 7400)],
    ["New rules: 4 Normal", "seats", row(b, now, "normal", "normal", 7500)],
  ];
  md += `## ${id === "long" ? "Long" : "Short"} board\n\n`;
  md += `| Row | Win % | Rounds | Close finish | Lead changes | Waits 10+ turns | Players out | Lanterns spent / game | Lanterns lost (3 misses) / player |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const [name, what, r] of rows) {
    const win = what === "seats" ? `seats ${r.seats.map((x) => x.toFixed(1)).join(" / ")}` : `${what} **${pct(r.target)}**`;
    md += `| ${name} | ${win} | ${r.rounds.toFixed(1)} | ${pct(r.close)} | ${r.leads.toFixed(1)} | ${pct(r.dry10)} | ${r.out.toFixed(2)}% | ${r.spent.toFixed(2)} | ${r.lost.toFixed(2)} |\n`;
    if (r.capped) md += `\n(${r.capped} games stopped at 3,000 rounds)\n`;
  }
  md += "\n";
}
process.stdout.write(md);

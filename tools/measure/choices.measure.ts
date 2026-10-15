// Owner, 15 Oct: two new choices. (1) Bog boots are offered, not worn automatically. (2) Waiting at Home or in the Bog
// with a lantern left, a player may spend it to leave at once instead of throwing for a 6 (then throws to move).
// Measured: how the game changes when everyone plays a way, and how much one player gains by a way against three
// players who never spend (the computer player). Written to docs/analysis/measure-choices.md.
import fs from "node:fs";
import { it } from "vitest";
import { BOARDS, simplePlayer } from "../../src/engine";
import type { Decider } from "../../src/engine";
import { type GameRecord, playGame } from "../../src/engine/sim";
import { rng } from "../../src/engine/rng";

const N = Number(process.env.N ?? 20000);
type Way = { name: string; d: Decider };
const spend = (rule: (d: { where: string; tries: number; lanterns: number }) => boolean): Decider =>
  (d, g) => (d.kind === "spendLantern" ? rule(d) : simplePlayer(d, g));
const WAYS: Way[] = [
  { name: "never spends (today's game; the computer)", d: simplePlayer },
  { name: "spends at once, keeping 1 lantern spare (≥ 2)", d: spend((d) => d.lanterns >= 2) },
  { name: "spends at once, whenever it has 1", d: spend((d) => d.lanterns >= 1) },
  { name: "spends instead of the 3rd throw (≥ 2)", d: spend((d) => d.tries === 2 && d.lanterns >= 2) },
  { name: "spends only in the Bog (≥ 2)", d: spend((d) => d.where === "trap" && d.lanterns >= 2) },
  { name: "spends only at Home (≥ 2)", d: spend((d) => d.where === "start" && d.lanterns >= 2) },
  { name: "never wears the Bog boots", d: (d, g) => (d.kind === "bogBoots" ? false : simplePlayer(d, g)) },
];

interface Stats { games: number; rounds: number[]; lastStanding: number; out: number; lost: number; enter: number; wins: number[] }
function run(board: keyof typeof BOARDS, players: number, deciders: (seat: number, g: number) => Decider[], seed: number): Stats {
  const rand = rng(seed), s: Stats = { games: 0, rounds: [], lastStanding: 0, out: 0, lost: 0, enter: 0, wins: Array(players).fill(0) };
  for (let g = 0; g < N; g++) {
    const r: GameRecord | null = playGame(BOARDS[board], players, rand, deciders(0, g));
    if (!r) continue;
    s.games++; s.rounds.push(r.rounds); if (r.lastStanding) s.lastStanding++;
    s.wins[r.winner]++;
    for (const p of r.players) { if (p.out) s.out++; s.lost += p.lanternsLost; s.enter += p.enterRound; }
  }
  return s;
}
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const pct = (x: number, n: number) => `${((100 * x) / n).toFixed(1)}%`;

it("measure the new choices", () => {
  const out: string[] = [
    "# The new choices, measured (owner, 15 Oct 2026)",
    "",
    "Proposed: (1) the Bog boots are offered (\"wear them?\"), not worn by themselves; (2) waiting at Home or in the Bog",
    "with at least one lantern, a player may spend a lantern to leave at once instead of throwing for a 6, then throws to",
    `move. Computer players for every seat; ${N.toLocaleString("en")} games per line; \`npx vitest run --config vitest.measure.config.ts\`.`,
    "",
  ];
  for (const board of ["short", "long"] as const) {
    for (const players of [4, 2]) {
      const P = players;
      out.push(`## ${board === "long" ? "The Grand Journey (long board)" : "The Quick Trip (short board)"}, ${P} players`, "",
        "### 1. Everyone plays the same way", "",
        "| Everyone… | Rounds: mean | median | 90% of games under | Won as the last one left | Players out per game | Lanterns lost per player | Round leaving Home |",
        "|---|---|---|---|---|---|---|---|");
      WAYS.forEach((w, i) => {
        const s = run(board, P, () => Array(P).fill(w.d), 7000 + i);
        const r = [...s.rounds].sort((a, b) => a - b);
        out.push(`| ${w.name} | ${mean(r).toFixed(1)} | ${r[Math.floor(r.length / 2)]} | ${r[Math.floor(r.length * 0.9)]} | ${pct(s.lastStanding, s.games)} | ${(s.out / s.games).toFixed(2)} | ${(s.lost / s.games / P).toFixed(2)} | ${(s.enter / s.games / P).toFixed(1)} |`);
      });
      out.push("", `### 2. One player plays a way, the others never spend (fair share ${(100 / P).toFixed(0)}%; the player sits at each seat in turn)`, "",
        "| The one player… | Wins | Gain over the fair share |", "|---|---|---|");
      WAYS.slice(1).forEach((w, i) => {
        let wins = 0, games = 0;
        for (let seat = 0; seat < P; seat++) {
          const s = run(board, P, () => Array.from({ length: P }, (_, k) => (k === seat ? w.d : simplePlayer)), 8000 + 10 * i + seat);
          wins += s.wins[seat]; games += s.games;
        }
        const share = (100 * wins) / games;
        out.push(`| ${w.name} | ${share.toFixed(1)}% | ${(share - 100 / P >= 0 ? "+" : "")}${(share - 100 / P).toFixed(1)} points |`);
      });
      out.push("");
    }
  }
  fs.writeFileSync("docs/analysis/measure-choices.md", out.join("\n") + "\n");
  console.log(out.join("\n"));
});

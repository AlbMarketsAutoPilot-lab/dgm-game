// Audit 15 Oct 2026 (owner questions): a shorter Shortcut, no Shortcut, a second Bonus card square.
// (The stair-step options were measured with the game engine itself: see the report.)
// Usage: node tools/sim/audit-variants.mjs [games=40000]  (one row per variant, as in docs/analysis/audit-2026-10-15.md)
import { readFileSync } from "node:fs";
import { simulate } from "./engine.mjs";
const N = Number(process.argv[2] ?? 40000);
const load = (id) => JSON.parse(readFileSync(new URL(`../../data/board-${id}.json`, import.meta.url), "utf8"));
const clone = (x) => JSON.parse(JSON.stringify(x));
const jack = (to) => ({ cat: "R", type: "jump", to, text: "Wild road: shortcut over the hill" });
const fall = (trap) => ({ cat: "P", type: "jump", to: trap, then: "prison", text: "Wild road: lost, into the trap" });
function forks(b, spec) { const c = clone(b); c.rules.forks = spec.map(([i, len, tiles]) => ({ ...c.rules.forks[i], len, tiles })); return c; }
function noForks(b) { const c = clone(b); c.rules.forks = []; return c; }
function addCard(b, sq) { const c = clone(b); c.tiles[sq] = { cat: "R", type: "card", card: "bonus", text: "Bonus card" }; return c; }
function row(name, b, rules = {}) {
  const r = simulate(b, { ...b.rules, ...rules }, N, 9100);
  let wild = "";
  if (b.rules.forks.length) { let w = 0; for (let seat = 0; seat < 4; seat++) { const t = ["simple","simple","simple","simple"]; t[seat] = "wild"; w += simulate(b, { ...b.rules, ...rules, types: t }, N / 4, 9200 + seat).fairness.seatWinPct[seat] / 4; } wild = w.toFixed(1); }
  const f = r.fairness.seatWinPct, e = r.excitement, bo = r.boredom;
  console.log(`| ${name} | ${(Math.max(...f) - Math.min(...f)).toFixed(1)} | ${wild || "–"} | ${r.length.mean} | ${e.leadChanges} | ${e.lateOvertakes} | ${e.pctCloseFinish} | ${e.jackpots} | ${e.falls} | ${e.captures} | ${bo.turnsLost} | ${bo.pctNoMove10} | ${r.i6.pctPlayersOut} |`);
}
console.log(`| Variant (${N} games) | seat spread pts | always-Shortcut win % | rounds | lead changes | late overtakes | close finish % | jackpots | falls | captures | turns lost | % players 10+ turns stuck | % out |`);
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
const L = load("long"), S = load("short");
row("LONG today", L);
row("LONG Shortcut half length (6 / 9 stones)", forks(L, [[0, 6, { 2: jack(100), 4: fall(30) }], [1, 9, { 3: jack(185), 6: fall(30) }]]));
row("LONG Shortcut very short (3 / 4 stones), no jackpot, 1 fall", forks(L, [[0, 3, { 2: fall(30) }], [1, 4, { 3: fall(30) }]]));
row("LONG Shortcut very short (3 / 4 stones), 1 fall, 1 jackpot", forks(L, [[0, 4, { 1: jack(100), 3: fall(30) }], [1, 5, { 2: jack(185), 4: fall(30) }]]));
row("LONG no Shortcut", noForks(L));
row("LONG + Bonus card on 155", addCard(L, 155));
row("LONG + Bonus card on 175", addCard(L, 175));
row("SHORT today", S);
row("SHORT Shortcut 3 / 4 stones, jackpot + fall", forks(S, [[0, 3, { 1: jack(50), 2: fall(15) }], [1, 4, { 1: jack(92), 3: fall(15) }]]));
row("SHORT Shortcut 2 / 3 stones, 1 fall only", forks(S, [[0, 2, { 1: fall(15) }], [1, 3, { 2: fall(15) }]]));
row("SHORT no Shortcut", noForks(S));
row("SHORT + Bonus card on 85", addCard(S, 85));

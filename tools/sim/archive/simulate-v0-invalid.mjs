// Monte-Carlo simulator for Don't Get Mad! boards.
// Usage: node tools/sim/simulate.mjs data/board-v0-paper.json [games=100000] [out=docs/analysis/sim-results.md]
// Every rule detail not written on the paper board is a named SETTING below, reported in the output.
import { readFileSync, writeFileSync } from "node:fs";

const [, , boardPath = "data/board-v0-paper.json", gamesArg = "100000", outPath] = process.argv;
const board = JSON.parse(readFileSync(boardPath, "utf8"));
const GAMES = Number(gamesArg);
const END = board.endTile;
const MID = Math.floor(board.lastTile / 2);

// Seeded RNG (mulberry32) so every run is reproducible.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEFAULTS = {
  players: 4,
  startRule: "need6",   // need6 = must roll 6 to leave Start, then move 6 | free = no rule
  endRule: "exact",     // exact = must hit END exactly, else stay | overshoot = any roll reaching END wins
  useCards: true,       // cards auto-used: jailPass on entering prison, skipPunishment on next punishment tile
  prisonExit: "six",    // leave prison only on a 6, then move 6
};

function simulate(settings, seed) {
  const s = { ...DEFAULTS, ...settings };
  const rand = rng(seed);
  const d6 = () => 1 + Math.floor(rand() * 6);
  const T = board.tiles;
  const agg = {
    wins: Array(s.players).fill(0), rounds: [], leadChanges: 0, comebackWins: 0,
    midLastWin: 0, midLastN: 0, midFirstWin: 0, midFirstN: 0,
    lost: 0, rewards: 0, punish: 0, gained: 0, lostSq: 0, startWait: 0,
    drought: 0, drought10: 0, landings: {}, cardsUsed: 0, capped: 0, playerGames: 0,
  };

  for (let g = 0; g < GAMES; g++) {
    const P = Array.from({ length: s.players }, () => ({
      pos: 0, skip: 0, prison: false, slow: false, dbl: false, leader: false,
      cards: { skipPunishment: 0, jailPass: 0 },
      lost: 0, rewards: 0, punish: 0, gained: 0, lostSq: 0, startWait: 0, dry: 0, maxDry: 0,
    }));
    let winner = -1, round = 0, leader = -1, midRanks = null;

    const enterPrison = (p) => {
      if (s.useCards && p.cards.jailPass > 0) { p.cards.jailPass--; agg.cardsUsed++; }
      else p.prison = true;
    };
    const jumpTo = (p, to) => {
      const d = to - p.pos;
      if (d >= 0) p.gained += d; else p.lostSq -= d;
      p.pos = to;
    };
    const applyTile = (pi, depth = 0) => {
      const p = P[pi];
      const t = T[p.pos];
      if (!t || depth > 5) return;
      if (t.requires && !p[t.requires === "snakeLeader" ? "leader" : t.requires]) return;
      if (t.cat === "P" && s.useCards && p.cards.skipPunishment > 0) {
        p.cards.skipPunishment--; agg.cardsUsed++; return;
      }
      if (t.cat === "P") p.punish++; else p.rewards++;
      switch (t.type) {
        case "skip": p.skip += t.turns; break;
        case "hospital": p.skip += t.turns; break;
        case "prison": enterPrison(p); break;
        case "slowNext": p.slow = true; break;
        case "card": p.cards[t.card]++; break;
        case "doubleOthers": P.forEach((q, i) => { if (i !== pi) q.dbl = true; }); break;
        case "extraRoll": moveBy(pi, d6(), depth + 1); break;
        case "rollSum": { let sum = 0; for (let i = 0; i < t.dice; i++) sum += d6(); moveBy(pi, sum, depth + 1); break; }
        case "jump":
          jumpTo(p, t.to);
          if (t.grant === "snakeLeader") p.leader = true;
          if (t.then === "prison") enterPrison(p);
          if (t.then === "hospital") p.skip += T[t.to]?.turns ?? 3;
          if (t.then === "skip2") p.skip += 2;
          break;
        case "nearest": {
          let k = p.pos + 1;
          while (k < END && !(T[k] && T[k].cat === t.target && !T[k].requires)) k++;
          if (k < END) { jumpTo(p, k); applyTile(pi, depth + 1); }
          break;
        }
        case "swapAhead": {
          let best = -1;
          P.forEach((q, i) => { if (q.pos > p.pos && q.pos < END && (best < 0 || q.pos < P[best].pos)) best = i; });
          if (best >= 0) { const q = P[best]; const a = p.pos; jumpTo(p, q.pos); q.pos = a; }
          break;
        }
      }
    };
    const moveBy = (pi, n, depth = 0) => {
      const p = P[pi];
      let to = p.pos + n;
      if (to > END) {
        if (s.endRule === "exact") { p.lost++; return false; }
        to = END;
      }
      p.pos = to;
      agg.landings[to] = (agg.landings[to] || 0) + 1;
      if (to === END) return true;
      applyTile(pi, depth);
      return true;
    };

    while (winner < 0 && round < 5000) {
      round++;
      for (let pi = 0; pi < s.players && winner < 0; pi++) {
        const p = P[pi];
        const before = p.pos;
        if (p.skip > 0) { p.skip--; p.lost++; }
        else {
          let roll = d6();
          if (p.dbl) { roll *= 2; p.dbl = false; }
          if (p.slow) { roll = 1; p.slow = false; }
          if (p.pos === 0 && s.startRule === "need6") {
            if (roll === 6) moveBy(pi, 6); else { p.lost++; p.startWait++; }
          } else if (p.prison) {
            if (roll === 6) { p.prison = false; moveBy(pi, 6); } else p.lost++;
          } else moveBy(pi, roll);
        }
        if (p.pos > before) { p.dry = 0; } else { p.dry++; p.maxDry = Math.max(p.maxDry, p.dry); }
        if (p.pos >= END) winner = pi;
      }
      // leader tracking
      let li = 0; P.forEach((q, i) => { if (q.pos > P[li].pos) li = i; });
      if (leader >= 0 && li !== leader) agg.leadChanges++;
      leader = li;
      if (!midRanks && P[li].pos >= MID) {
        const order = P.map((q, i) => [q.pos, i]).sort((a, b) => b[0] - a[0]);
        midRanks = { first: order[0][1], last: order[order.length - 1][1] };
      }
    }
    if (winner < 0) { agg.capped++; continue; }
    agg.wins[winner]++;
    agg.rounds.push(round);
    if (midRanks) {
      agg.midFirstN++; if (midRanks.first === winner) agg.midFirstWin++;
      agg.midLastN++; if (midRanks.last === winner) agg.midLastWin++;
      if (midRanks.first !== winner) agg.comebackWins++;
    }
    for (const p of P) {
      agg.playerGames++;
      agg.lost += p.lost; agg.rewards += p.rewards; agg.punish += p.punish;
      agg.gained += p.gained; agg.lostSq += p.lostSq; agg.startWait += p.startWait;
      agg.drought += p.maxDry; if (p.maxDry >= 10) agg.drought10++;
    }
  }
  return { settings: s, agg };
}

function summarize({ settings, agg }) {
  const n = agg.rounds.length;
  const r = [...agg.rounds].sort((a, b) => a - b);
  const q = (x) => r[Math.min(n - 1, Math.floor(x * n))];
  const pg = agg.playerGames;
  const ci = (k) => 1.96 * Math.sqrt((k / n) * (1 - k / n) / n) * 100;
  return {
    settings,
    games: n, capped: agg.capped,
    seatWinPct: agg.wins.map((w) => +(100 * w / n).toFixed(2)),
    seatCI95: +ci(agg.wins[0]).toFixed(2),
    rounds: { mean: +(r.reduce((a, b) => a + b, 0) / n).toFixed(1), p10: q(0.1), median: q(0.5), p90: q(0.9) },
    perPlayer: {
      turnsLost: +(agg.lost / pg).toFixed(1),
      startWaitTurns: +(agg.startWait / pg).toFixed(1),
      rewardsHit: +(agg.rewards / pg).toFixed(2),
      punishmentsHit: +(agg.punish / pg).toFixed(2),
      squaresGainedByTiles: +(agg.gained / pg).toFixed(1),
      squaresLostByTiles: +(agg.lostSq / pg).toFixed(1),
      longestNoMoveStreak: +(agg.drought / pg).toFixed(1),
      pctWithNoMoveStreak10plus: +(100 * agg.drought10 / pg).toFixed(1),
    },
    resilience: {
      leadChangesPerGame: +(agg.leadChanges / n).toFixed(1),
      winPctIfLeadingAtMidpoint: +(100 * agg.midFirstWin / agg.midFirstN).toFixed(1),
      winPctIfLastAtMidpoint: +(100 * agg.midLastWin / agg.midLastN).toFixed(1),
      comebackWinPct: +(100 * agg.comebackWins / agg.midFirstN).toFixed(1),
    },
    topLandings: Object.entries(agg.landings).filter(([t]) => T(t)).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([t, c]) => `${t} (${(c / pg).toFixed(2)}/player)`),
  };
}
const T = (t) => board.tiles[t];

const SCENARIOS = [
  ["A  Baseline, 4 players", {}],
  ["B  Baseline, 2 players", { players: 2 }],
  ["C  Baseline, 3 players", { players: 3 }],
  ["D  4p, END reached by any roll (no exact)", { endRule: "overshoot" }],
  ["E  4p, no 'need 6' at Start", { startRule: "free" }],
  ["F  4p, cards switched off", { useCards: false }],
];

const results = SCENARIOS.map(([name, set], i) => ({ name, ...summarize(simulate(set, 1234 + i)) }));
const json = JSON.stringify({ board: board.id, games: GAMES, results }, null, 2);

let md = `# Simulation results — board \`${board.id}\`\n\n`;
md += `Generated by \`node tools/sim/simulate.mjs ${boardPath} ${GAMES}\` (seeded, reproducible). ${GAMES.toLocaleString("en")} games per scenario.\n\n`;
md += `Fair seat share = ${results.map((x) => `${x.settings.players}p: ${(100 / x.settings.players).toFixed(1)}%`).filter((v, i, a) => a.indexOf(v) === i).join(", ")}.\n\n`;
md += `| Scenario | Win % by seat (1st..last) | ±CI95 | Rounds mean / median / p90 | Turns lost per player | Waiting at Start | Rewards / Punishments hit | Squares + / − by tiles | Longest no-move streak | ≥10-turn streak | Lead changes | Win % if leading at mid | Win % if last at mid | Comeback wins |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const x of results) {
  const p = x.perPlayer, rs = x.resilience;
  md += `| ${x.name} | ${x.seatWinPct.join(" / ")} | ${x.seatCI95} | ${x.rounds.mean} / ${x.rounds.median} / ${x.rounds.p90} | ${p.turnsLost} | ${p.startWaitTurns} | ${p.rewardsHit} / ${p.punishmentsHit} | +${p.squaresGainedByTiles} / −${p.squaresLostByTiles} | ${p.longestNoMoveStreak} | ${p.pctWithNoMoveStreak10plus}% | ${rs.leadChangesPerGame} | ${rs.winPctIfLeadingAtMidpoint}% | ${rs.winPctIfLastAtMidpoint}% | ${rs.comebackWinPct}% |\n`;
}
md += `\n## Most landed-on special tiles (scenario A)\n\n${results[0].topLandings.join(" · ")}\n`;
md += `\n## Raw JSON\n\n\`\`\`json\n${json}\n\`\`\`\n`;

if (outPath) writeFileSync(outPath, md);
console.log(md.split("## Raw JSON")[0]);

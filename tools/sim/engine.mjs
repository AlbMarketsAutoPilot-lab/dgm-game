// Game engine + Monte-Carlo runner for Don't Get Mad! — implements the owner's core rules (docs/GCD.md §8.2a).
// Pure function of (board, rules, games, seed). All randomness comes from the seeded RNG.

export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULTS = {
  players: 4,
  entry: "six",          // R1: six = a 6 puts you on Start, then you throw again | free = everyone begins on Start
  sixRule: "owner",      // R2: owner = after k sixes you get k throws (owner's example 6,6,1,5 = 18)
                         //     standard = keep throwing while you throw 6 (6,6,1 = 13) | none = no extra throws
  maxSixes: 3,           // R2: the third six ends the throwing
  enterFaces: [6],       // option: die faces that let you enter (paper: only 6)
  enterAfter: Infinity,  // option: after this many failed tries you enter anyway on your next turn (paper: never)
  trapAfter: Infinity,   // option: after this many failed tries in the trap you get out anyway on your next turn (paper: never)
  capture: true,         // R4: landing on an occupied square (by throw or jump) sends that player to Start
  endRule: "exact",      // R8: exact = a total that passes END and you stay | overshoot = any total reaching END wins
  bonusPolicy: "defend", // bonus card: defend = avoid own next punishment | attack = cancel the leader's next reward
                         //             | first = whichever happens first | none = card never used
  bigJump: null,         // a jump of at least this many squares is a jackpot (forward) / fall (back); default 10% of board
};

const OFF = -1; // not yet on the board

export function simulate(board, rules, games, seed) {
  const s = { ...DEFAULTS, ...rules };
  const rand = rng(seed);
  // Test hooks: diceScript = fixed dice values; setup = starting state per player; turns = stop after N player turns.
  const script = s.diceScript ? [...s.diceScript] : null;
  const d6 = script ? () => { if (!script.length) throw new Error("dice script ran out"); return script.shift(); }
                    : () => 1 + Math.floor(rand() * 6);
  const T = board.tiles, END = board.endTile, LAST = board.lastTile;
  const MID = Math.floor(LAST / 2), LATE = Math.ceil(LAST * 0.75);
  const BIG = s.bigJump ?? Math.round(LAST * 0.1);
  const keys = Object.keys(T);
  const zero = () => Object.fromEntries(keys.map((k) => [k, 0]));

  const A = {
    wins: Array(s.players).fill(0), rounds: [], capped: 0, playerGames: 0,
    lost: 0, waitEnter: 0, waitTrap: 0, maxDry: 0, dry10: 0,
    rewards: 0, punish: 0, gained: 0, lostSq: 0,
    leadChanges: 0, midN: 0, midFirstWin: 0, midLastWin: 0, comeback: 0,
    lateOvertakes: 0, gamesLate: 0, lateFirstN: 0, lateFirstWin: 0, finishGap: 0, close: 0,
    jackpots: 0, falls: 0, gamesJack: 0, gamesFall: 0,
    captures: 0, capturesEarly: 0, capturesLate: 0, gamesCapture: 0, capturedPlayers: 0,
    bonusDefend: 0, bonusAttack: 0, jailPassUsed: 0,
    hit: zero(), hitWin: zero(), oppLand: zero(), oppLandWin: zero(), oppMiss: zero(), oppMissWin: zero(),
  };

  for (let g = 0; g < games; g++) {
    const P = Array.from({ length: s.players }, () => ({
      pos: s.entry === "six" ? OFF : 0, skip: 0, trapped: false, slow: false, dbl: false, leader: false,
      bonus: 0, jailPass: 0, captured: 0, tries: 0,
      lost: 0, waitEnter: 0, waitTrap: 0, dry: 0, maxDry: 0, rewards: 0, punish: 0, gained: 0, lostSq: 0,
      hits: new Set(), opp: new Map(),
    }));
    if (s.setup) s.setup.forEach((st, i) => Object.assign(P[i], st));
    let turnCount = 0;
    let gJack = 0, gFall = 0, gLate = 0, gCap = 0, lateFirst = -1;
    const leaderIdx = () => { let li = 0; P.forEach((q, i) => { if (q.pos > P[li].pos) li = i; }); return li; };

    const capture = (pi, sq) => {
      if (!s.capture || sq <= 0 || sq >= END) return;
      P.forEach((q, i) => {
        if (i === pi || q.pos !== sq) return;
        q.pos = 0; q.trapped = false; q.skip = 0; q.tries = 0; q.captured++; // back to Start; the token leaves its trap / waiting
        gCap++; A.captures++;
        if (sq <= 20) A.capturesEarly++;
        if (sq >= LATE) A.capturesLate++;
      });
    };
    const trap = (p) => { if (p.jailPass > 0) { p.jailPass--; A.jailPassUsed++; } else p.trapped = true; };
    // Moved by an event: no chaining (the destination square's own event does not trigger), but capture applies.
    const jumpTo = (pi, to) => {
      const p = P[pi], d = to - p.pos;
      if (d >= 0) p.gained += d; else p.lostSq -= d;
      if (d >= BIG) gJack++; else if (-d >= BIG) gFall++;
      p.pos = to;
      capture(pi, to);
    };

    const effect = (pi, t, depth) => {
      const p = P[pi];
      switch (t.type) {
        case "skip": case "hospital": p.skip += t.turns; break;
        case "prison": trap(p); break;
        case "slowNext": p.slow = true; break;
        case "card": p[t.card] += 1; break;
        case "doubleOthers": P.forEach((q, i) => { if (i !== pi) q.dbl = true; }); break;
        case "extraRoll": moveBy(pi, throwSequence(0), depth + 1); break;
        case "rollSum": { let n = 0; for (let i = 0; i < t.dice; i++) n += d6(); moveBy(pi, n, depth + 1); break; }
        case "jump":
          jumpTo(pi, t.to);
          if (t.grant === "snakeLeader") p.leader = true;
          if (t.then === "prison") trap(p);
          if (t.then === "hospital") p.skip += 3;
          if (t.then === "skip2") p.skip += 2;
          break;
        case "nearest": { // R11: forward only, then "do it"
          let k = p.pos + 1;
          while (k < END && !(T[k] && T[k].cat === t.target && !T[k].requires)) k++;
          if (k < END) { jumpTo(pi, k); applyTile(pi, depth + 1); }
          break;
        }
        case "swapLeader": { // R10: change place with the player closest to END
          let best = -1;
          P.forEach((q, i) => { if (i !== pi && q.pos > p.pos && q.pos < END && (best < 0 || q.pos > P[best].pos)) best = i; });
          if (best >= 0) { const q = P[best], a = p.pos; jumpTo(pi, q.pos); q.pos = a; }
          break;
        }
      }
    };

    const applyTile = (pi, depth = 0) => {
      const p = P[pi], t = T[p.pos];
      if (!t || depth > 6 || (t.requires === "snakeLeader" && !p.leader)) return;
      if (t.cat === "P" && p.bonus > 0 && (s.bonusPolicy === "defend" || s.bonusPolicy === "first")) {
        p.bonus--; A.bonusDefend++; return;
      }
      if (t.cat === "R" && pi === leaderIdx() && (s.bonusPolicy === "attack" || s.bonusPolicy === "first")) {
        const h = P.findIndex((q, i) => i !== pi && q.bonus > 0);
        if (h >= 0) { P[h].bonus--; A.bonusAttack++; return; }
      }
      p.hits.add(String(p.pos));
      if (t.cat === "P") p.punish++; else if (t.cat === "R") p.rewards++;
      effect(pi, t, depth);
    };

    const moveBy = (pi, n, depth = 0) => {
      const p = P[pi];
      if (n <= 0) return;
      let to = p.pos + n;
      if (to > END) { if (s.endRule === "exact") { p.lost++; return; } to = END; }
      p.pos = to;
      if (to === END) return;
      capture(pi, to);
      applyTile(pi, depth);
    };

    // R2: number of squares to move. k0 = sixes already thrown this turn to enter / leave the trap (no points).
    function throwSequence(k0) {
      if (s.sixRule === "none") return d6();
      let k = k0, total = 0;
      if (s.sixRule === "standard") {
        for (;;) { const r = d6(); total += r; if (r !== 6 || ++k >= s.maxSixes) return total; }
      }
      // owner: throw while 6; after k sixes you have k throws in total after them (the chain-ending one included);
      // a 6 among those throws counts as another six and gives one more throw.
      for (;;) {
        const r = d6(); total += r;
        if (r !== 6) break;
        if (++k >= s.maxSixes) return total;
      }
      let owed = Math.max(0, k - 1);
      while (owed > 0) {
        const r = d6(); owed--; total += r;
        if (r === 6) { if (++k >= s.maxSixes) return total; owed++; }
      }
      return total;
    }

    let winner = -1, round = 0, leader = -1, mid = null;
    while (winner < 0 && round < 3000) {
      round++;
      for (let pi = 0; pi < s.players && winner < 0; pi++) {
        const p = P[pi], before = p.pos;
        if (p.skip > 0) { p.skip--; p.lost++; }
        else if (p.pos === OFF || p.trapped) { // R1 / R6: only a 6 lets you in / out; that 6 gives the extra throw
          const off = p.pos === OFF, limit = off ? s.enterAfter : s.trapAfter;
          if (p.tries >= limit) { // option: released after too many failed tries -> a normal turn
            p.tries = 0; if (off) p.pos = 0; else p.trapped = false;
            let n = p.slow ? 1 : throwSequence(0); p.slow = false; if (p.dbl) { n *= 2; p.dbl = false; } moveBy(pi, n);
          } else {
            const r = d6();
            if (off ? s.enterFaces.includes(r) : r === 6) {
              p.tries = 0;
              if (off) p.pos = 0; else p.trapped = false;
              if (r !== 6) { /* entered without a 6: no extra throw, move next turn */ }
              else if (p.slow) { p.slow = false; moveBy(pi, 1); }
              else { let n = throwSequence(1); if (p.dbl) { n *= 2; p.dbl = false; } moveBy(pi, n); }
            } else { p.tries++; p.lost++; if (off) p.waitEnter++; else p.waitTrap++; }
          }
        } else if (p.slow) { p.slow = false; p.dbl = false; moveBy(pi, 1); } // R9: move exactly 1
        else {
          const from = p.pos;
          let n = throwSequence(0);
          const single = n <= 5 && !p.dbl; // a single non-six throw: which square you reach is decided by the die alone
          if (p.dbl) { n *= 2; p.dbl = false; }
          moveBy(pi, n);
          if (single) for (let k = from + 1; k <= from + 5 && k < END; k++) if (T[k] && !p.opp.has(k)) p.opp.set(k, from + n === k);
        }
        if (p.pos !== before) p.dry = 0; else if (++p.dry > p.maxDry) p.maxDry = p.dry;
        if (p.pos >= END) winner = pi;
        if (s.turns && ++turnCount >= s.turns) return { players: P.map(({ hits, opp, ...rest }) => rest), diceLeft: script?.length };
      }
      const li = leaderIdx();
      if (leader >= 0 && li !== leader) { A.leadChanges++; if (P[li].pos >= LATE) gLate++; }
      leader = li;
      if (lateFirst < 0 && P[li].pos >= LATE) lateFirst = li;
      if (!mid && P[li].pos >= MID) {
        const order = P.map((q, i) => [q.pos, i]).sort((a, b) => b[0] - a[0]);
        mid = { first: order[0][1], last: order[order.length - 1][1] };
      }
    }
    if (winner < 0) { A.capped++; continue; }
    A.wins[winner]++; A.rounds.push(round);
    A.jackpots += gJack; A.falls += gFall; if (gJack) A.gamesJack++; if (gFall) A.gamesFall++;
    A.lateOvertakes += gLate; if (gLate) A.gamesLate++; if (gCap) A.gamesCapture++;
    if (lateFirst >= 0) { A.lateFirstN++; if (lateFirst === winner) A.lateFirstWin++; }
    if (mid) { A.midN++; if (mid.first === winner) A.midFirstWin++; else A.comeback++; if (mid.last === winner) A.midLastWin++; }
    const runnerUp = Math.max(...P.filter((_, i) => i !== winner).map((q) => q.pos));
    A.finishGap += END - runnerUp; if (END - runnerUp <= 6) A.close++;
    P.forEach((p, i) => {
      A.playerGames++;
      A.lost += p.lost; A.waitEnter += p.waitEnter; A.waitTrap += p.waitTrap;
      A.maxDry += p.maxDry; if (p.maxDry >= 10) A.dry10++;
      A.rewards += p.rewards; A.punish += p.punish; A.gained += p.gained; A.lostSq += p.lostSq;
      if (p.captured) A.capturedPlayers++;
      for (const k of p.hits) { A.hit[k]++; if (i === winner) A.hitWin[k]++; }
      for (const [k, landed] of p.opp) {
        if (landed) { A.oppLand[k]++; if (i === winner) A.oppLandWin[k]++; } else { A.oppMiss[k]++; if (i === winner) A.oppMissWin[k]++; }
      }
    });
  }
  return summarize(board, s, A, BIG);
}

function summarize(board, s, A, BIG) {
  const n = A.rounds.length, pg = A.playerGames, fair = 1 / s.players;
  const r = [...A.rounds].sort((a, b) => a - b), q = (x) => r[Math.min(n - 1, Math.floor(x * n))];
  const f = (x, d = 1) => +x.toFixed(d);
  return {
    rules: s, games: n, capped: A.capped,
    fairness: { seatWinPct: A.wins.map((w) => f(100 * w / n, 2)), ci95: f(196 * Math.sqrt(fair * (1 - fair) / n), 2) },
    length: { mean: f(r.reduce((a, b) => a + b, 0) / n), p10: q(0.1), median: q(0.5), p90: q(0.9) },
    excitement: {
      leadChanges: f(A.leadChanges / n), winIfLeadingAtHalf: f(100 * A.midFirstWin / A.midN), winIfLastAtHalf: f(100 * A.midLastWin / A.midN),
      comebackPct: f(100 * A.comeback / A.midN), lateOvertakes: f(A.lateOvertakes / n, 2), pctGamesLateOvertake: f(100 * A.gamesLate / n),
      winIfFirstIntoLastQuarter: f(100 * A.lateFirstWin / A.lateFirstN), avgFinishGap: f(A.finishGap / n), pctCloseFinish: f(100 * A.close / n),
      bigJump: BIG, jackpots: f(A.jackpots / n, 2), falls: f(A.falls / n, 2), pctGamesJackpot: f(100 * A.gamesJack / n), pctGamesFall: f(100 * A.gamesFall / n),
      captures: f(A.captures / n, 2), capturesEarly: f(A.capturesEarly / n, 2), capturesLate: f(A.capturesLate / n, 2),
      pctGamesCapture: f(100 * A.gamesCapture / n), pctPlayersCaptured: f(100 * A.capturedPlayers / pg),
    },
    boredom: {
      turnsLost: f(A.lost / pg), waitingToEnter: f(A.waitEnter / pg), waitingInTrap: f(A.waitTrap / pg),
      longestNoMove: f(A.maxDry / pg), pctNoMove10: f(100 * A.dry10 / pg),
    },
    events: {
      rewardsHit: f(A.rewards / pg, 2), punishmentsHit: f(A.punish / pg, 2), squaresGained: f(A.gained / pg), squaresLost: f(A.lostSq / pg),
      bonusDefendPerGame: f(A.bonusDefend / n, 2), bonusAttackPerGame: f(A.bonusAttack / n, 2), jailPassPerGame: f(A.jailPassUsed / n, 2),
    },
    tiles: Object.keys(board.tiles).map((k) => ({
      tile: +k, cat: board.tiles[k].cat, title: board.tiles[k].text,
      landedPct: f(100 * A.hit[k] / pg),
      winIfLanded: A.hit[k] ? f(100 * A.hitWin[k] / A.hit[k]) : null,
      impact: A.oppLand[k] > 300 && A.oppMiss[k] > 300 ? f(100 * (A.oppLandWin[k] / A.oppLand[k] - A.oppMissWin[k] / A.oppMiss[k])) : null,
    })).sort((a, b) => a.tile - b.tile),
  };
}

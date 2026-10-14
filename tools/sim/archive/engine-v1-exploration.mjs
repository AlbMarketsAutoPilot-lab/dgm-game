// Generic game engine + Monte-Carlo runner for Don't Get Mad! boards (v1 schema, also runs v0).
// Pure functions of (board, settings, seed) -> statistics. No randomness outside the seeded RNG.

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
  startRule: "free",   // free | need6 (must roll 6, then move 6)
  endRule: "overshoot",// overshoot = any roll reaching END finishes | exact = must hit END, else stay
  thinker: false,      // optional mode: roll 2 dice, choose one
  handLimit: 2,        // max cards held
  policies: null,      // array of "casual" | "smart" per seat (default all casual)
  catchUp: 0,
  bigJump: null,       // a jump of at least this many squares counts as a jackpot (forward) or a fall (back); default 10% of the board          // "Tailwind": the traveller alone in last place adds this to every throw
};

// Normalise a v0 (paper) tile into the v1 effect vocabulary.
function normalise(tile) {
  const t = { ...tile };
  if (t.cat === "R") t.cat = "B";
  if (t.cat === "P") t.cat = "S";
  if (t.type === "prison") Object.assign(t, { type: "wait", min: 6, max: Infinity, pass: "jailPass" });
  if (t.type === "hospital") t.type = "skip";
  if (t.then === "prison") Object.assign(t, { then: { type: "wait", min: 6, max: Infinity, pass: "jailPass" } });
  if (t.then === "hospital") Object.assign(t, { then: { type: "skip", turns: 3 } });
  if (t.then === "skip2") Object.assign(t, { then: { type: "skip", turns: 2 } });
  if (t.card === "skipPunishment") t.card = "umbrella";
  return t;
}

export function loadBoard(raw) {
  const tiles = {};
  for (const [k, v] of Object.entries(raw.tiles)) tiles[k] = normalise(v);
  return { ...raw, tiles };
}

export function simulate(board, settings, games, seed) {
  const s = { ...DEFAULTS, ...settings };
  const rand = rng(seed);
  const d6 = () => 1 + Math.floor(rand() * 6);
  const T = board.tiles, END = board.endTile, MID = Math.floor(board.lastTile / 2);
  const LATE = Math.ceil(board.lastTile * 0.75);           // the last quarter of the board
  const BIG = s.bigJump ?? Math.round(board.lastTile * 0.1);
  const policies = s.policies ?? Array(s.players).fill("casual");
  const tileKeys = Object.keys(T);

  // Rough value (in squares) of landing on a tile — used by the "smart" policy only.
  const LOST_TURN = 3.5;
  const effectValue = (pos, e, p) => {
    if (!e) return 0;
    switch (e.type) {
      case "jump": return (e.requires && !p?.leader ? 0 : e.to - pos + effectValue(e.to, e.then, p));
      case "skip": return -LOST_TURN * e.turns;
      case "wait": return -LOST_TURN * Math.min(e.max, 1 / ((7 - e.min) / 6) - 1);
      case "slowNext": return -2.5;
      case "rollSum": return 3.5 * e.dice;
      case "extraRoll": return 3.5;
      case "card": return 4;
      case "tailwindOthers": case "doubleOthers": return -3.5;
      case "swapAhead": return 5;
      case "nearest": return 3;
      case "gamble": { const pw = (7 - e.min) / 6; return pw * effectValue(pos, e.win, p) + (1 - pw) * effectValue(pos, e.lose, p); }
      case "choice": return Math.max(...e.options.map((o) => effectValue(pos, o, p)));
      default: return 0;
    }
  };
  const tileValue = (pos, p) => {
    const t = T[pos];
    if (!t || (t.requires && !p.leader)) return 0;
    return effectValue(pos, t, p);
  };
  const landValue = (p, roll) => {
    let to = p.pos + roll;
    if (to > END) return s.endRule === "exact" ? -LOST_TURN : 1000;
    if (to === END) return 1000;
    return roll + tileValue(to, p);
  };
  const avgFresh = (p) => { let a = 0; for (let r = 1; r <= 6; r++) a += landValue(p, r); return a / 6; };

  const agg = {
    wins: Array(s.players).fill(0), rounds: [], leadChanges: 0, comeback: 0,
    midFirstWin: 0, midLastWin: 0, midN: 0,
    lost: 0, boosts: 0, setbacks: 0, gained: 0, lostSq: 0, maxDry: 0, dry10: 0, playerGames: 0,
    tileHits: Object.fromEntries(tileKeys.map((k) => [k, 0])),
    tileHitWins: Object.fromEntries(tileKeys.map((k) => [k, 0])),
    tileHitPlayers: Object.fromEntries(tileKeys.map((k) => [k, 0])),
    // natural experiment: first time a player is within one die roll of tile k
    oppLand: Object.fromEntries(tileKeys.map((k) => [k, 0])), oppLandWin: Object.fromEntries(tileKeys.map((k) => [k, 0])),
    oppMiss: Object.fromEntries(tileKeys.map((k) => [k, 0])), oppMissWin: Object.fromEntries(tileKeys.map((k) => [k, 0])),
    cardsUsed: 0, capped: 0,
    // excitement measures (step I-2)
    lateOvertakes: 0, gamesLateOvertake: 0, lateFirstN: 0, lateFirstWin: 0,
    finishGap: 0, closeFinish: 0, jackpots: 0, falls: 0, gamesJackpot: 0, gamesFall: 0,
  };

  for (let g = 0; g < games; g++) {
    const P = Array.from({ length: s.players }, (_, i) => ({
      pos: 0, skip: 0, wait: null, slow: false, tail: false, leader: false,
      cards: { umbrella: 0, compass: 0, jailPass: 0 }, smart: policies[i] === "smart",
      lost: 0, boosts: 0, setbacks: 0, gained: 0, lostSq: 0, dry: 0, maxDry: 0, hit: new Set(), maxPos: 0, opp: new Map(), land: -1,
    }));
    const hand = (p) => p.cards.umbrella + p.cards.compass + p.cards.jailPass;

    let gJack = 0, gFall = 0, gLate = 0, lateFirst = -1;
    const jumpTo = (p, to) => {
      const d = to - p.pos;
      if (d >= 0) p.gained += d; else p.lostSq -= d;
      if (d >= BIG) gJack++; else if (-d >= BIG) gFall++;
      p.pos = to;
    };
    const startWait = (p, e) => {
      if (e.pass && p.cards[e.pass] > 0) { p.cards[e.pass]--; agg.cardsUsed++; return; }
      p.wait = { min: e.min, left: e.max };
    };

    // Apply an effect object (a tile, a "then", a choice option...).
    const apply = (pi, e, depth) => {
      const p = P[pi];
      if (!e || depth > 6) return;
      switch (e.type) {
        case "skip": p.skip += e.turns; break;
        case "wait": startWait(p, e); break;
        case "slowNext": p.slow = true; break;
        case "card": if (hand(p) < s.handLimit) p.cards[e.card]++; break;
        case "tailwindOthers": case "doubleOthers": P.forEach((q, i) => { if (i !== pi) q.tail = true; }); break;
        case "extraRoll": moveBy(pi, d6(), depth + 1); break;
        case "rollSum": { let sum = 0; for (let i = 0; i < e.dice; i++) sum += d6(); moveBy(pi, sum, depth + 1); break; }
        case "jump":
          jumpTo(p, e.to);
          if (e.grant === "snakeLeader") p.leader = true;
          if (e.then) apply(pi, e.then, depth + 1);
          break;
        case "nearest": {
          const want = e.target === "R" ? "B" : e.target === "P" ? "S" : e.target;
          let k = p.pos + 1;
          while (k < END && !(T[k] && T[k].cat === want && !T[k].requires)) k++;
          if (k < END) { jumpTo(p, k); applyTile(pi, depth + 1, true); }
          break;
        }
        case "swapAhead": {
          let best = -1;
          P.forEach((q, i) => { if (q.pos > p.pos && q.pos < END && (best < 0 || q.pos < P[best].pos)) best = i; });
          if (best >= 0) { const q = P[best]; const a = p.pos; jumpTo(p, q.pos); q.pos = a; }
          break;
        }
        case "gamble": apply(pi, d6() >= e.min ? e.win : e.lose, depth + 1); break;
        case "choice": {
          let idx;
          if (p.smart) {
            let bv = -Infinity;
            e.options.forEach((o, i) => { const v = effectValue(p.pos, o, p); if (v > bv) { bv = v; idx = i; } });
          } else idx = Math.floor(rand() * e.options.length);
          apply(pi, e.options[idx], depth + 1);
          break;
        }
      }
    };

    const applyTile = (pi, depth, forced = false) => {
      const p = P[pi];
      const t = T[p.pos];
      if (!t || (t.requires && !p.leader)) return;
      if (t.cat === "S" && p.cards.umbrella > 0) {
        // casual: always shields; smart: shields only real setbacks (worth more than a lost turn)
        const v = effectValue(p.pos, t, p);
        if (!p.smart || v <= -LOST_TURN) { p.cards.umbrella--; agg.cardsUsed++; return; }
      }
      p.hit.add(String(p.pos));
      if (t.cat === "S") p.setbacks++; else if (t.cat === "B") p.boosts++;
      apply(pi, t, depth);
    };

    const moveBy = (pi, n, depth = 0) => {
      const p = P[pi];
      let to = p.pos + n;
      if (to > END) { if (s.endRule === "exact") { p.lost++; return; } to = END; }
      p.pos = to;
      if (depth === 0) p.land = to;
      if (to === END) return;
      applyTile(pi, depth);
    };

    const throwFor = (p) => {
      let roll = d6();
      if (s.thinker) {
        const r2 = d6();
        roll = p.smart ? (landValue(p, r2) > landValue(p, roll) ? r2 : roll) : (rand() < 0.5 ? roll : r2);
      }
      // Compass card: re-roll once.
      if (p.cards.compass > 0 && !p.wait && !(p.pos === 0 && s.startRule === "need6")) {
        const use = p.smart ? landValue(p, roll) < avgFresh(p) - 2 : roll === 1;
        if (use) { p.cards.compass--; agg.cardsUsed++; roll = d6(); }
      }
      if (s.catchUp && P.every((q) => q === p || q.pos > p.pos)) roll += s.catchUp;
      if (p.tail) { roll *= 2; p.tail = false; }
      if (p.slow) { roll = 1; p.slow = false; }
      return roll;
    };

    let winner = -1, round = 0, leader = -1, mid = null;
    while (winner < 0 && round < 5000) {
      round++;
      for (let pi = 0; pi < s.players && winner < 0; pi++) {
        const p = P[pi];
        const before = p.pos;
        if (p.skip > 0) { p.skip--; p.lost++; }
        else {
          const roll = throwFor(p);
          if (p.pos === 0 && s.startRule === "need6") { if (roll === 6) moveBy(pi, 6); else p.lost++; }
          else if (p.wait) {
            if (roll >= p.wait.min) { p.wait = null; moveBy(pi, roll); }
            else { p.lost++; if (--p.wait.left <= 0) p.wait = null; }
          } else {
            const from = p.pos; p.land = -1;
            moveBy(pi, roll);
            for (let k = from + 1; k <= from + 6 && k < END; k++)
              if (T[k] && !p.opp.has(k)) p.opp.set(k, p.land === k);
          }
        }
        if (p.pos > p.maxPos) p.maxPos = p.pos;
        if (p.pos !== before) p.dry = 0; else { p.dry++; if (p.dry > p.maxDry) p.maxDry = p.dry; }
        if (p.pos >= END) winner = pi;
      }
      let li = 0; P.forEach((q, i) => { if (q.pos > P[li].pos) li = i; });
      if (leader >= 0 && li !== leader) { agg.leadChanges++; if (P[li].pos >= LATE) gLate++; }
      if (lateFirst < 0 && P[li].pos >= LATE) lateFirst = li;
      leader = li;
      if (!mid && P[li].pos >= MID) {
        const order = P.map((q, i) => [q.pos, i]).sort((a, b) => b[0] - a[0]);
        mid = { first: order[0][1], last: order[order.length - 1][1] };
      }
    }
    if (winner < 0) { agg.capped++; continue; }
    agg.wins[winner]++; agg.rounds.push(round);
    agg.jackpots += gJack; agg.falls += gFall; if (gJack) agg.gamesJackpot++; if (gFall) agg.gamesFall++;
    agg.lateOvertakes += gLate; if (gLate) agg.gamesLateOvertake++;
    if (lateFirst >= 0) { agg.lateFirstN++; if (lateFirst === winner) agg.lateFirstWin++; }
    const runnerUp = Math.max(...P.filter((_, i) => i !== winner).map((q) => q.pos));
    agg.finishGap += END - runnerUp; if (END - runnerUp <= 6) agg.closeFinish++;
    if (mid) {
      agg.midN++;
      if (mid.first === winner) agg.midFirstWin++; else agg.comeback++;
      if (mid.last === winner) agg.midLastWin++;
    }
    P.forEach((p, i) => {
      agg.playerGames++;
      agg.lost += p.lost; agg.boosts += p.boosts; agg.setbacks += p.setbacks;
      agg.gained += p.gained; agg.lostSq += p.lostSq; agg.maxDry += p.maxDry; if (p.maxDry >= 10) agg.dry10++;
      for (const k of p.hit) { agg.tileHitPlayers[k]++; if (i === winner) agg.tileHitWins[k]++; }
      for (const [k, landed] of p.opp) {
        if (landed) { agg.oppLand[k]++; if (i === winner) agg.oppLandWin[k]++; }
        else { agg.oppMiss[k]++; if (i === winner) agg.oppMissWin[k]++; }
      }
    });
  }
  return summarize(board, s, agg);
}

function summarize(board, s, agg) {
  const n = agg.rounds.length, pg = agg.playerGames;
  const r = [...agg.rounds].sort((a, b) => a - b);
  const q = (x) => r[Math.min(n - 1, Math.floor(x * n))];
  const fair = 1 / s.players;
  const tiles = Object.keys(board.tiles).map((k) => {
    const hp = agg.tileHitPlayers[k];
    const t = board.tiles[k];
    return {
      tile: +k, cat: t.cat ?? "-", type: t.type,
      hitPct: +(100 * hp / pg).toFixed(1),
      winPctIfHit: hp ? +(100 * agg.tileHitWins[k] / hp).toFixed(1) : null,
      // impact = win% when the die put you on this tile minus win% when the die made you just miss it
      // (first time each player came within one roll of it — a natural experiment decided only by the die)
      impactPts: agg.oppLand[k] > 200 && agg.oppMiss[k] > 200
        ? +(100 * (agg.oppLandWin[k] / agg.oppLand[k] - agg.oppMissWin[k] / agg.oppMiss[k])).toFixed(1) : null,
    };
  }).sort((a, b) => a.tile - b.tile);
  return {
    settings: { ...s, policies: s.policies ? s.policies.join(",") : "all casual" },
    games: n, capped: agg.capped,
    seatWinPct: agg.wins.map((w) => +(100 * w / n).toFixed(2)),
    seatCI95: +(196 * Math.sqrt(fair * (1 - fair) / n)).toFixed(2),
    rounds: { mean: +(r.reduce((a, b) => a + b, 0) / n).toFixed(1), p10: q(0.1), median: q(0.5), p90: q(0.9), max: r[n - 1] },
    perPlayer: {
      turnsLost: +(agg.lost / pg).toFixed(1),
      boostsHit: +(agg.boosts / pg).toFixed(2),
      setbacksHit: +(agg.setbacks / pg).toFixed(2),
      squaresGained: +(agg.gained / pg).toFixed(1),
      squaresLost: +(agg.lostSq / pg).toFixed(1),
      longestNoMove: +(agg.maxDry / pg).toFixed(1),
      pctNoMove10: +(100 * agg.dry10 / pg).toFixed(1),
    },
    resilience: {
      leadChanges: +(agg.leadChanges / n).toFixed(1),
      winIfLeadingAtMid: +(100 * agg.midFirstWin / agg.midN).toFixed(1),
      winIfLastAtMid: +(100 * agg.midLastWin / agg.midN).toFixed(1),
      comebackPct: +(100 * agg.comeback / agg.midN).toFixed(1),
    },
    excitement: {
      bigJumpSquares: s.bigJump ?? Math.round(board.lastTile * 0.1),
      jackpotsPerGame: +(agg.jackpots / n).toFixed(2),
      fallsPerGame: +(agg.falls / n).toFixed(2),
      pctGamesWithJackpot: +(100 * agg.gamesJackpot / n).toFixed(1),
      pctGamesWithFall: +(100 * agg.gamesFall / n).toFixed(1),
      lateOvertakesPerGame: +(agg.lateOvertakes / n).toFixed(2),
      pctGamesWithLateOvertake: +(100 * agg.gamesLateOvertake / n).toFixed(1),
      winIfFirstIntoLastQuarter: +(100 * agg.lateFirstWin / agg.lateFirstN).toFixed(1),
      avgFinishGap: +(agg.finishGap / n).toFixed(1),
      pctCloseFinish: +(100 * agg.closeFinish / n).toFixed(1),
    },
    tiles,
  };
}

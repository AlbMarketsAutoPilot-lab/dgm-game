// Step I (v3) simulator: the rules of docs/GCD.md §8.2a R1–R20 (owner, 25 Nov 2026) on a v3 destination file
// (data/lantern-festival.json). Built next to the v2 simulator (engine.mjs), which the app's v2 engine still matches.
// Pure function of (board, options, games, seed): all dice come from the seeded RNG, in a fixed order, so the app's
// v3 engine (phase A4) can play exactly the same games.
//
// Player types: "robot" (GCD R20, the app's computer player) and "simple" (simulator only: uses its Bonus card at the
// first chance it gets, and picks the Swap Market partner at random).
import { rng } from "./engine.mjs";

export { rng };

export const OPTIONS = {
  players: 4,
  types: null, // per seat: "robot" | "simple"; null = all robots
  maxRounds: 3000, // the game stops without a winner (counted as capped)
  // Test hooks: diceScript = fixed die faces; setup = starting state per seat; turns = stop after N player turns
  // and return the players; perGame = keep a record of every game (for the app's engine to compare with).
};

export function simulate3(board, options, games, seed) {
  const s = { ...OPTIONS, ...options };
  const rand = rng(seed);
  const choice = rng((seed ^ 0x5eed) | 0); // simple players' random choices: a separate source, so the dice never shift
  const script = s.diceScript ? [...s.diceScript] : null;
  const d6 = script ? () => { if (!script.length) throw new Error("dice script ran out"); return script.shift(); }
                    : () => 1 + Math.floor(rand() * 6);
  const END = board.endTile, LAST = board.lastTile, R = board.rules;
  const T = board.tiles;
  const AREA = new Int8Array(END);
  board.areas.forEach((a, i) => { for (let k = a.from; k <= a.to; k++) AREA[k] = i; });
  const FX = board.areas.map((a) => a.effect);
  const boatSq = Number(Object.keys(T).find((k) => T[k].type === "dragonBoat") ?? -1);
  const MID = Math.floor(LAST / 2), LATE = Math.ceil(LAST * 0.75), BIG = Math.round(LAST * 0.1);
  const typeOf = (i) => (s.types ? s.types[i] : "robot");

  const A = {
    wins: Array(s.players).fill(0), rounds: [], capped: 0, records: s.perGame ? [] : undefined,
    leadChanges: 0, lateOvertakes: 0, gamesLate: 0, midN: 0, midFirstWin: 0, midLastWin: 0, lateFirstN: 0, lateFirstWin: 0,
    close: 0, finishGap: 0, jackpots: 0, falls: 0, bumps: 0, playerGames: 0,
    waitHome: 0, waitTree: 0, skipped: 0, maxDry: 0, dry10: 0, homeRun10: 0, treeRun10: 0, maxHomeRun: 0, maxTreeRun: 0,
    treeStuck: 0, boatRides: 0, boatWins: 0, boatBack: 0, winsByBoat: 0,
    cardGot: { square: 0, seaside: 0, market: 0 }, cardUsed: { home: 0, tree: 0, forced: 0, square: 0, area: 0 }, marketMoves: 0,
    fx: Object.fromEntries(FX.filter(Boolean).map((f) => [f.type, 0])), fxOther: { card: 0, loseTurn: 0 }, fxSkippedByEvent: 0,
    sixRuns: [0, 0, 0, 0], // runs of 3, 4, 5, 6+ sixes in a row
  };

  for (let g = 0; g < games; g++) {
    const P = Array.from({ length: s.players }, () => ({
      pos: 0, home: true, cards: R.startCards, stuck: false, skip: 0, slow: false, dbl: false, back: false, boat: false, tries: 0,
      done: FX.map(() => false),
      waitHome: 0, waitTree: 0, homeRun: 0, treeRun: 0, maxHomeRun: 0, maxTreeRun: 0, skipped: 0, dry: 0, maxDry: 0,
      bumped: 0, bumps: 0, treeStuck: 0, boatRides: 0,
      got: { square: 0, seaside: 0, market: 0 }, used: { home: 0, tree: 0, forced: 0, square: 0, area: 0 },
      fx: 0, sixRuns: [0, 0, 0, 0],
    }));
    if (s.setup) s.setup.forEach((st, i) => Object.assign(P[i], st));
    let winner = -1, gJack = 0, gFall = 0, gLate = 0, byBoat = false, turnCount = 0;

    // ---- decisions (R19, R20) ----
    const useCardWaiting = (pi) => P[pi].cards > 0 && typeOf(pi) === "simple"; // the robot always rolls for the 6
    const cancels = (pi) => P[pi].cards > 0; // robot and simple player: the card on the first punishment met
    const pickPartner = (pi, cands, give) => {
      if (cands.length === 1) return cands[0];
      if (typeOf(pi) === "simple") return cands[Math.floor(choice() * cands.length)];
      // robot: give to the player furthest behind, take from the leader; ties: the next player in turn order
      let best = cands[0];
      for (const q of cands) if (give ? P[q].pos < P[best].pos : P[q].pos > P[best].pos) best = q;
      return best;
    };
    const others = (pi) => { const o = []; for (let k = 1; k < s.players; k++) o.push((pi + k) % s.players); return o; };

    // ---- moves ----
    const rollRun = (pi) => { // R2: every 6 rolls again, no limit; one move by the total
      let total = 0, sixes = 0, r;
      do { r = d6(); total += r; if (r === 6) sixes++; } while (r === 6);
      if (sixes >= 3) P[pi].sixRuns[Math.min(sixes, 6) - 3]++;
      return total;
    };
    const bump = (pi, sq) => { // R4: back Home, no 6 needed to leave (R5)
      if (sq < 1 || sq > LAST) return;
      P.forEach((q, i) => {
        if (i === pi || q.pos !== sq) return;
        q.pos = 0; q.home = false; q.stuck = false; q.boat = false; q.back = false; q.tries = 0; q.skip = 0; q.treeRun = 0;
        q.bumped++; P[pi].bumps++;
      });
    };
    const jumpTo = (pi, to) => { // a fixed event move (R8): no square event, no area effect, a bump happens
      const d = to - P[pi].pos;
      if (d >= BIG) gJack++; else if (-d >= BIG) gFall++;
      P[pi].pos = to; bump(pi, to);
    };
    const swap = (a, b) => { // swaps bump nobody, trigger nothing, and end a Dragon Boat deal (R17)
      const t = P[a].pos; P[a].pos = P[b].pos; P[b].pos = t;
      P[a].boat = false; P[b].boat = false;
    };
    const ahead = (pi) => { let best = -1; for (const q of others(pi)) if (P[q].pos > P[pi].pos && P[q].pos < END && (best < 0 || P[q].pos < P[best].pos)) best = q; return best; };
    const behind = (pi) => { let best = -1; for (const q of others(pi)) if (P[q].pos < P[pi].pos && P[q].pos >= 1 && (best < 0 || P[q].pos > P[best].pos)) best = q; return best; };
    const leaderAhead = (pi) => { let best = -1; for (const q of others(pi)) if (P[q].pos > P[pi].pos && P[q].pos < END && (best < 0 || P[q].pos > P[best].pos)) best = q; return best; };

    // A forward move by dice. how = "roll" (a plain roll: may give an area effect) | "dice" (an event's dice: no area effect)
    const forward = (pi, n, how) => {
      const p = P[pi], from = p.pos, to = from + n;
      if (to > END) return; // R7: exact; too big = stay
      if (to === END) { p.pos = END; winner = pi; return; }
      p.pos = to; bump(pi, to);
      if (T[to]) squareEvent(pi, to, T[to]);
      if (how === "roll" && winner < 0) areaEntry(pi, from, to);
    };
    const backward = (pi, n) => { // Forest effect: never past Home; no square event, no area effect; a bump happens
      const p = P[pi];
      p.stuck = false;
      p.pos = Math.max(0, p.pos - n);
      if (p.pos === 0) p.home = false; else bump(pi, p.pos);
    };

    const squareEvent = (pi, sq, t) => {
      const p = P[pi];
      if (t.cat === "P" && t.type !== "tree" && cancels(pi)) { p.cards--; p.used.square++; return; } // R14 (c)
      switch (t.type) {
        case "tree": p.stuck = true; p.tries = 0; p.treeRun = 0; p.treeStuck++; break; // R6
        case "slowNext": p.slow = true; break;
        case "doubleOthers": for (const q of others(pi)) P[q].dbl = true; break;
        case "jump": jumpTo(pi, t.to); if (t.then === "skip2") p.skip += 2; break;
        case "card": p.cards++; p.got.square++; break;
        case "nearest": { // R11: the next square of that category, and it applies
          let k = sq + 1;
          while (k <= LAST && !(T[k] && T[k].cat === t.target)) k++;
          if (k > LAST) break;
          jumpTo(pi, k); squareEvent(pi, k, T[k]);
          break;
        }
        case "swapLeader": { const q = leaderAhead(pi); if (q >= 0) swap(pi, q); break; } // R10
        case "rollSum": { let n = 0; for (let i = 0; i < t.dice; i++) n += d6(); forward(pi, n, "dice"); break; }
        case "dragonBoat": jumpTo(pi, t.to); p.boat = true; p.boatRides++; break; // R17
        case "swapMarket": { // R18
          if (p.cards > 0) {
            const q = pickPartner(pi, others(pi), true);
            p.cards--; P[q].cards++; P[q].got.market++; A.marketMoves++;
          } else {
            const c = others(pi).filter((q) => P[q].cards > 0);
            if (!c.length) break;
            const q = pickPartner(pi, c, false);
            P[q].cards--; p.cards++; p.got.market++; A.marketMoves++;
          }
          break;
        }
      }
    };

    // R16: the first entry into an area by a plain roll gives its effect, after the square's own event, if the player is
    // still in that area. An entry by an event gives nothing and does not use the area up.
    const areaEntry = (pi, from, to) => {
      const p = P[pi], a = AREA[to], fx = FX[a];
      if (a === AREA[from] || !fx || p.done[a]) return;
      if (p.pos >= END || AREA[p.pos] !== a) { A.fxSkippedByEvent++; return; }
      p.done[a] = true; p.fx++; A.fx[fx.type]++;
      switch (fx.type) {
        case "gifted6": forward(pi, 6 + rollRun(pi), "dice"); break;
        case "backward": if (cancels(pi)) { p.cards--; p.used.area++; } else p.back = true; break;
        case "double": p.dbl = true; break;
        case "swapAhead": { const q = ahead(pi); if (q >= 0 && P[q].pos - p.pos <= fx.range) swap(pi, q); else { p.cards++; p.got.seaside++; A.fxOther.card++; } break; }
        case "swapBehind": {
          const q = behind(pi);
          if (q >= 0 && p.pos - P[q].pos <= fx.range) swap(pi, q);
          else if (cancels(pi)) { p.cards--; p.used.area++; }
          else { p.skip++; A.fxOther.loseTurn++; }
          break;
        }
      }
    };

    // A turn that moves (also after leaving Home or the tree). `given`: the throw that already counts (a robot's forced card).
    const moveTurn = (pi, given) => {
      const p = P[pi];
      if (p.slow) { p.slow = false; forward(pi, 1, "roll"); return; } // R9 (7): exactly 1; a pending double or backward waits
      let n = given ?? rollRun(pi);
      if (p.dbl) { n *= 2; p.dbl = false; } // Mountains / square 72: never more than ×2
      if (p.back) { p.back = false; backward(pi, n); return; }
      forward(pi, n, "roll");
    };

    const waitingTurn = (pi) => { // R1 / R6: at Home or stuck at the tree
      const p = P[pi], home = p.home;
      if (!home && p.back) { moveTurn(pi); return; } // R6: a pending Forest move happens at once and frees you
      const free = () => { p.tries = 0; if (home) p.home = false; else p.stuck = false; p.homeRun = 0; p.treeRun = 0; };
      if (useCardWaiting(pi)) { p.cards--; p.used[home ? "home" : "tree"]++; free(); moveTurn(pi); return; }
      const r = d6();
      if (r === 6) { free(); moveTurn(pi); return; } // the freeing 6 does not move you and is no run of sixes
      p.tries++;
      if (typeOf(pi) === "robot" && p.tries >= R.robotForceAfter && p.cards > 0) { // R20: forced, moves by that throw
        p.cards--; p.used.forced++; free(); moveTurn(pi, r); return;
      }
      if (home) { p.waitHome++; if (++p.homeRun > p.maxHomeRun) p.maxHomeRun = p.homeRun; }
      else { p.waitTree++; if (++p.treeRun > p.maxTreeRun) p.maxTreeRun = p.treeRun; }
    };

    const boatTurn = (pi) => { // R17: exactly `need` (4) wins; anything else back to the boat's square (a pending double is lost)
      const p = P[pi], r = d6();
      p.dbl = false; p.boat = false;
      if (r === T[boatSq].need) { p.pos = END; winner = pi; byBoat = true; return; }
      A.boatBack++;
      jumpTo(pi, boatSq);
    };

    // ---- the game ----
    let round = 0, leader = -1, mid = null, lateFirst = -1;
    const leaderIdx = () => { let li = 0; P.forEach((q, i) => { if (q.pos > P[li].pos) li = i; }); return li; };
    while (winner < 0 && round < s.maxRounds) {
      round++;
      for (let pi = 0; pi < s.players && winner < 0; pi++) {
        const p = P[pi], before = p.pos;
        if (p.skip > 0) { p.skip--; p.skipped++; }
        else if (p.boat) boatTurn(pi);
        else if (p.home || p.stuck) waitingTurn(pi);
        else moveTurn(pi);
        if (p.pos !== before) p.dry = 0; else if (++p.dry > p.maxDry) p.maxDry = p.dry;
        if (s.turns && ++turnCount >= s.turns) return { players: P };
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
    if (s.turns) return { players: P };
    if (winner < 0) { A.capped++; continue; }
    A.wins[winner]++; A.rounds.push(round);
    if (A.records) A.records.push({ rounds: round, winner, players: P.map((q) => record(q)) });
    A.jackpots += gJack; A.falls += gFall; A.lateOvertakes += gLate; if (gLate) A.gamesLate++;
    if (byBoat) A.winsByBoat++;
    if (lateFirst >= 0) { A.lateFirstN++; if (lateFirst === winner) A.lateFirstWin++; }
    if (mid) { A.midN++; if (mid.first === winner) A.midFirstWin++; if (mid.last === winner) A.midLastWin++; }
    const runnerUp = Math.max(...P.filter((_, i) => i !== winner).map((q) => q.pos));
    A.finishGap += END - runnerUp; if (END - runnerUp <= 6) A.close++;
    for (const p of P) {
      A.playerGames++;
      A.waitHome += p.waitHome; A.waitTree += p.waitTree; A.skipped += p.skipped;
      A.maxDry += p.maxDry; if (p.maxDry >= 10) A.dry10++;
      A.maxHomeRun += p.maxHomeRun; if (p.maxHomeRun >= 10) A.homeRun10++;
      A.maxTreeRun += p.maxTreeRun; if (p.maxTreeRun >= 10) A.treeRun10++;
      A.bumps += p.bumps; A.treeStuck += p.treeStuck; A.boatRides += p.boatRides;
      for (const k in A.cardGot) A.cardGot[k] += p.got[k];
      for (const k in A.cardUsed) A.cardUsed[k] += p.used[k];
      p.sixRuns.forEach((v, k) => { A.sixRuns[k] += v; });
    }
  }
  return summarize(s, A);
}

/** What the app's engine must reproduce for each player, game by game. */
function record(q) {
  return {
    pos: q.pos, cards: q.cards, bumped: q.bumped, bumps: q.bumps, waitHome: q.waitHome, waitTree: q.waitTree, skipped: q.skipped,
    maxDry: q.maxDry, treeStuck: q.treeStuck, boatRides: q.boatRides, fx: q.fx, sixRuns: [...q.sixRuns],
    got: { ...q.got }, used: { ...q.used },
  };
}

function summarize(s, A) {
  const n = A.rounds.length, pg = A.playerGames, fair = 1 / s.players;
  const r = [...A.rounds].sort((a, b) => a - b), q = (x) => r[Math.min(n - 1, Math.floor(x * n))];
  const f = (x, d = 1) => +x.toFixed(d), per = (x, d = 2) => f(x / n, d), perP = (x, d = 2) => f(x / pg, d);
  const map = (o, fn) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fn(v)]));
  return {
    options: s, games: n, capped: A.capped, records: A.records,
    fairness: { seatWinPct: A.wins.map((w) => f(100 * w / n, 2)), ci95: f(196 * Math.sqrt(fair * (1 - fair) / n), 2) },
    length: { mean: f(r.reduce((a, b) => a + b, 0) / n), p10: q(0.1), median: q(0.5), p90: q(0.9) },
    excitement: {
      leadChanges: per(A.leadChanges, 1), lateOvertakes: per(A.lateOvertakes), pctGamesLateOvertake: f(100 * A.gamesLate / n),
      winIfLeadingAtHalf: f(100 * A.midFirstWin / A.midN), winIfLastAtHalf: f(100 * A.midLastWin / A.midN),
      winIfFirstIntoLastQuarter: f(100 * A.lateFirstWin / A.lateFirstN), avgFinishGap: per(A.finishGap, 1), pctCloseFinish: f(100 * A.close / n),
      jackpots: per(A.jackpots), falls: per(A.falls), bumps: per(A.bumps),
    },
    boredom: {
      waitHome: perP(A.waitHome), waitTree: perP(A.waitTree), skipped: perP(A.skipped),
      longestNoMove: perP(A.maxDry, 1), pctNoMove10: f(100 * A.dry10 / pg),
      longestHomeWait: perP(A.maxHomeRun), pctHomeWait10: f(100 * A.homeRun10 / pg),
      longestTreeWait: perP(A.maxTreeRun), pctTreeWait10: f(100 * A.treeRun10 / pg, 2),
    },
    places: {
      treeStuckPerGame: per(A.treeStuck), boatRidesPerGame: per(A.boatRides), boatMissesPerGame: per(A.boatBack),
      pctWinsByBoat: f(100 * A.winsByBoat / n), areaEffectsPerGame: map(A.fx, (v) => per(v)),
      seasideCardPerGame: per(A.fxOther.card), bigCityLoseTurnPerGame: per(A.fxOther.loseTurn), areaSkippedByEventPerGame: per(A.fxSkippedByEvent),
    },
    cards: {
      gotPerGame: map(A.cardGot, (v) => per(v)), usedPerGame: map(A.cardUsed, (v) => per(v)), swapMarketMovesPerGame: per(A.marketMoves),
    },
    sixes: { runsOf3_4_5_6PerGame: A.sixRuns.map((v) => per(v, 3)) },
  };
}

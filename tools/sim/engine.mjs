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
  // --- Step I-6 options (all off by default, so the baseline numbers do not change) ---
  stairs: false,         // L1 waiting stairs (owner): each throw at Start / in the trap without a 6 adds one stair step on the
                         // next square; on the 3rd throw you move anyway, walking the stair steps first (replaces enterAfter/trapAfter)
  lifelines: 0,          // lifelines per player (0 = off): 3 throws without a 6 at Start / in the trap cost one; none left = out
  lifelineSquares: [],   // squares that give a lifeline back (never above the starting number)
  roadblock: null,       // N2 roadblock event: { back, range } = the game puts it on a free plain square 1..range in front of the
                         // leader; the first player to land on it (anyone) goes back `back` squares, then it is placed again
  forks: [],             // N3 two roads: [{ at, merge, len, tiles }] = every token stops at the crossroads `at`; next turn it takes
                         // the safe road (the normal squares) or the wild road (`len` squares, own `tiles`) that rejoins at `merge`
  lifeSpend: false,      // give up a lifeline to cancel a big punishment, never the last one (simple players never do)
  lifeRest: 0,           // candidate: rest (do not throw) this many turns in a row to win a lifeline back (0 = off)
  lifeRefuse: 0,         // candidate: refuse a reward worth at least this many squares to win a lifeline back (0 = off)
  types: null,           // player type per seat: "simple" (default choices) | "thoughtful" (written rules) | "wild" (always the wild road)
  bigLoss: 20,           // thoughtful player: a punishment / reward this big (squares) is "big"
};

const OFF = -1; // not yet on the board
const OUT = -2; // kicked out (no lifelines left)

export function simulate(board, rules, games, seed) {
  const s = { ...DEFAULTS, ...rules };
  const rand = rng(seed);
  // Test hooks: diceScript = fixed dice values; setup = starting state per player; turns = stop after N player turns.
  const script = s.diceScript ? [...s.diceScript] : null;
  const d6 = script ? () => { if (!script.length) throw new Error("dice script ran out"); return script.shift(); }
                    : () => 1 + Math.floor(rand() * 6);
  const END = board.endTile, LAST = board.lastTile;
  // Wild roads: square i (1..len) of fork k has the id 1000*(k+1)+i; prog() gives its place in the race.
  const forks = s.forks ?? [], isWild = (pos) => pos > 1000, forkOf = (pos) => forks[Math.floor(pos / 1000) - 1];
  const prog = (pos) => { if (!isWild(pos)) return pos; const f = forkOf(pos); return f.at + (pos % 1000) * (f.merge - f.at) / (f.len + 1); };
  const T = forks.length ? { ...board.tiles } : board.tiles;
  forks.forEach((f, k) => { for (const [i, t] of Object.entries(f.tiles ?? {})) T[1000 * (k + 1) + Number(i)] = t; });
  const isStop = (sq) => forks.some((f) => f.at === sq);
  const lifeSquares = new Set(s.lifelineSquares ?? []);
  const typeOf = (i) => (s.types ? s.types[i] : "simple");
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
    kicked: 0, outBySeat: Array(s.players).fill(0), gamesLastStanding: 0, lifeSpent: 0, lifeRested: 0, lifeRefused: 0, restTurns: 0, lifeLost: 0, lifeGained: 0, roadblockHits: 0, wildTaken: 0, safeTaken: 0, stairSteps: 0,
    hit: zero(), hitWin: zero(), oppLand: zero(), oppLandWin: zero(), oppMiss: zero(), oppMissWin: zero(),
  };

  for (let g = 0; g < games; g++) {
    const P = Array.from({ length: s.players }, () => ({
      pos: s.entry === "six" ? OFF : 0, skip: 0, trapped: false, slow: false, dbl: false, leader: false,
      bonus: 0, jailPass: 0, captured: 0, tries: 0, rest: 0, life: s.lifelines, out: false, stairAt: 0, stairLeft: 0, onStair: false,
      lost: 0, waitEnter: 0, waitTrap: 0, dry: 0, maxDry: 0, rewards: 0, punish: 0, gained: 0, lostSq: 0,
      hits: new Set(), opp: new Map(),
    }));
    if (s.setup) s.setup.forEach((st, i) => Object.assign(P[i], st));
    let turnCount = 0;
    let gJack = 0, gFall = 0, gLate = 0, gCap = 0, lateFirst = -1, rb = s.roadblockStart ?? null, winner = -1; // roadblockStart: test hook
    const leaderIdx = () => { let li = 0; P.forEach((q, i) => { if (prog(q.pos) > prog(P[li].pos)) li = i; }); return li; };
    const clearStairs = (q) => { q.stairLeft = 0; q.onStair = false; };

    const capture = (pi, sq) => {
      if (!s.capture || sq <= 0 || sq === END || isStop(sq) || P[pi].onStair) return; // the crossroads holds several players
      P.forEach((q, i) => {
        if (i === pi || q.pos !== sq || q.onStair) return; // nobody is captured on a stair step
        q.pos = 0; q.trapped = false; q.skip = 0; q.tries = 0; q.captured++; clearStairs(q); // back to Start; the token leaves its trap / waiting
        gCap++; A.captures++;
        if (sq <= 20) A.capturesEarly++;
        if (prog(sq) >= LATE) A.capturesLate++;
      });
    };
    // N2: the first player to land on the roadblock (by a throw or any jump) goes back; no chaining, capture applies.
    const hitRoadblock = (pi) => {
      if (rb === null || P[pi].pos !== rb) return;
      rb = null; A.roadblockHits++;
      jumpTo(pi, Math.max(0, P[pi].pos - s.roadblock.back));
    };
    const placeRoadblock = () => {
      const L = P[leaderIdx()];
      if (L.pos < 0 || isWild(L.pos)) return;
      const c = [];
      for (let k = L.pos + 1; k <= L.pos + s.roadblock.range && k < END; k++)
        if (!T[k] && !isStop(k) && !P.some((q) => q.pos === k)) c.push(k);
      if (c.length) rb = c[Math.floor(rand() * c.length)];
    };
    // Lifelines: returns true when the player is out.
    const loseLife = (pi) => {
      const p = P[pi];
      p.life--; A.lifeLost++;
      if (p.life > 0) return false;
      p.out = true; p.pos = OUT; p.trapped = false; p.skip = 0; clearStairs(p); A.kicked++; A.outBySeat[pi]++;
      const left = P.map((q, i) => i).filter((i) => !P[i].out);
      if (left.length === 1) { winner = left[0]; A.gamesLastStanding++; }
      return true;
    };
    const setStairs = (p, off, k) => { if (k > 0) { p.stairAt = off ? 1 : p.pos + 1; p.stairLeft = k; A.stairSteps += k; } };
    const trap = (p) => { if (p.jailPass > 0) { p.jailPass--; A.jailPassUsed++; } else p.trapped = true; };
    // Moved by an event: no chaining (the destination square's own event does not trigger), but capture applies.
    const jumpTo = (pi, to) => {
      const p = P[pi], d = prog(to) - prog(p.pos);
      if (d >= 0) p.gained += d; else p.lostSq -= d;
      if (d >= BIG) gJack++; else if (-d >= BIG) gFall++;
      p.pos = to; clearStairs(p);
      capture(pi, to);
      hitRoadblock(pi);
    };
    // How many squares a tile would move the player (thoughtful player's estimate); trap / hospital count as big.
    const swing = (pi, t, depth = 0) => {
      const p = P[pi], here = prog(p.pos);
      switch (t.type) {
        case "prison": case "hospital": return -s.bigLoss;
        case "skip": return -3.5 * t.turns;
        case "slowNext": return -2.5;
        case "doubleOthers": return -3.5;
        case "extraRoll": return 3.5;
        case "rollSum": return 3.5 * t.dice;
        case "jump": return t.then === "prison" || t.then === "hospital" ? Math.min(-s.bigLoss, prog(t.to) - here) : prog(t.to) - here;
        case "swapLeader": return Math.max(0, prog(P[leaderIdx()].pos) - here);
        case "nearest": {
          if (depth > 0 || isWild(p.pos)) return 0;
          let k = p.pos + 1;
          while (k < END && !(T[k] && T[k].cat === t.target && !T[k].requires)) k++;
          if (k >= END) return 0;
          const save = p.pos; p.pos = k; const v = swing(pi, T[k], 1); p.pos = save;
          return k - save + v;
        }
        default: return 0;
      }
    };
    const wantsDefend = (i, t) => typeOf(i) === "thoughtful" ? swing(i, t) <= -s.bigLoss : s.bonusPolicy === "defend" || s.bonusPolicy === "first";
    const wantsAttack = (i, pi, t) => typeOf(i) === "thoughtful" ? swing(pi, t) >= s.bigLoss : s.bonusPolicy === "attack" || s.bonusPolicy === "first";
    // N3: the road taken from the crossroads.
    const takesWild = (pi) => {
      const ty = typeOf(pi);
      if (ty === "wild") return true;
      if (ty !== "thoughtful") return false;
      return prog(P[leaderIdx()].pos) - prog(P[pi].pos) >= 20;
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
          P.forEach((q, i) => { if (i !== pi && prog(q.pos) > prog(p.pos) && q.pos !== END && (best < 0 || prog(q.pos) > prog(P[best].pos))) best = i; });
          if (best >= 0) { const q = P[best], a = p.pos; jumpTo(pi, q.pos); q.pos = a; clearStairs(q); }
          break;
        }
      }
    };

    const applyTile = (pi, depth = 0) => {
      const p = P[pi], t = T[p.pos];
      if (!t || depth > 6 || (t.requires === "snakeLeader" && !p.leader)) return;
      if (t.cat === "P" && p.bonus > 0 && wantsDefend(pi, t)) {
        p.bonus--; A.bonusDefend++; return;
      }
      if (s.lifeSpend && t.cat === "P" && typeOf(pi) === "thoughtful" && p.life >= 2 && swing(pi, t) <= -s.bigLoss) {
        p.life--; A.lifeSpent++; return;
      }
      if (t.cat === "R" && pi === leaderIdx()) {
        const h = P.findIndex((q, i) => i !== pi && q.bonus > 0 && wantsAttack(i, pi, t));
        if (h >= 0) { P[h].bonus--; A.bonusAttack++; return; }
      }
      if (lifeSquares.has(p.pos) && p.life < s.lifelines) { p.life++; A.lifeGained++; }
      if (s.lifeRefuse && t.cat === "R" && typeOf(pi) === "thoughtful" && p.life === 1 && swing(pi, t) >= s.lifeRefuse) {
        p.life++; A.lifeRefused++; return; // refuse the reward, take a lifeline instead
      }
      p.hits.add(String(p.pos));
      if (t.cat === "P") p.punish++; else if (t.cat === "R") p.rewards++;
      effect(pi, t, depth);
    };

    const moveBy = (pi, n, depth = 0) => {
      const p = P[pi];
      if (n <= 0) return;
      let from = p.pos;
      if (p.stairLeft > 0 && from <= p.stairAt) { // L1: walk the stair steps on top of the square stairAt first
        const toBase = p.stairAt - from;
        if (n > toBase) {
          const c = Math.min(n - toBase, p.stairLeft);
          p.stairLeft -= c; n -= toBase + c; from = p.stairAt;
          if (n === 0) { p.pos = from; p.onStair = true; return; } // standing on a stair step: no event, no capture
        }
      }
      p.onStair = false;
      let to;
      if (isWild(from) || (forks.length && isStop(from))) {
        const k = isWild(from) ? Math.floor(from / 1000) - 1 : forks.findIndex((f) => f.at === from), f = forks[k];
        const wild = isWild(from) || takesWild(pi);
        if (!isWild(from)) { if (wild) A.wildTaken++; else A.safeTaken++; }
        if (wild) { const i = (isWild(from) ? from % 1000 : 0) + n; to = i <= f.len ? 1000 * (k + 1) + i : f.merge + (i - f.len - 1); }
        else to = from + n;
      } else {
        to = from + n;
        for (const f of forks) if (from < f.at && to > f.at) { to = f.at; break; } // every token stops at the crossroads
      }
      if (!isWild(to) && to > END) { if (s.endRule === "exact") { p.lost++; return; } to = END; }
      p.pos = to;
      if (to === END) return;
      capture(pi, to);
      if (rb !== null && to === rb) { hitRoadblock(pi); return; }
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

    let round = 0, leader = -1, mid = null;
    while (winner < 0 && round < 3000) {
      round++;
      if (s.roadblock && rb === null) placeRoadblock();
      for (let pi = 0; pi < s.players && winner < 0; pi++) {
        const p = P[pi], before = p.pos * 8 + p.stairLeft;
        if (p.out) continue;
        if (p.skip > 0) { p.skip--; p.lost++; }
        else if (p.pos === OFF || p.trapped) { // R1 / R6: only a 6 lets you in / out; that 6 gives the extra throw
          const off = p.pos === OFF, limit = off ? s.enterAfter : s.trapAfter;
          if (!s.stairs && p.tries >= limit) { // option: released after too many failed tries -> a normal turn
            p.tries = 0; if (off) p.pos = 0; else p.trapped = false;
            let n = p.slow ? 1 : throwSequence(0); p.slow = false; if (p.dbl) { n *= 2; p.dbl = false; } moveBy(pi, n);
          } else {
            const r = d6();
            if (off ? s.enterFaces.includes(r) : r === 6) {
              const moved3 = p.tries >= 2;
              if (s.stairs) setStairs(p, off, p.tries); // each earlier failed throw left one stair step
              p.tries = 0;
              if (off) p.pos = 0; else p.trapped = false;
              if (r !== 6) { /* entered without a 6: no extra throw, move next turn */ }
              else if (p.slow) { p.slow = false; moveBy(pi, 1); }
              else { // L1: on the 3rd throw (stairs) the 6 is a normal moving 6; otherwise the out-6 does not move (R6)
                let n = (s.stairs && moved3 ? 6 : 0) + throwSequence(1); if (p.dbl) { n *= 2; p.dbl = false; } moveBy(pi, n);
              }
            } else if (s.stairs && p.tries >= 2) { // L1: 3rd throw without a 6 -> move anyway, walking the 2 stair steps
              p.tries = 0;
              if (!(s.lifelines && loseLife(pi))) {
                setStairs(p, off, 2);
                if (off) p.pos = 0; else p.trapped = false;
                let n = p.slow ? 1 : r; p.slow = false; if (p.dbl) { n *= 2; p.dbl = false; } moveBy(pi, n);
              }
            } else {
              p.tries++; p.lost++; if (off) p.waitEnter++; else p.waitTrap++;
              if (s.lifelines && !s.stairs && p.tries === 3) loseLife(pi); // R16 version: 3 failed throws cost a lifeline
            }
          }
        } else if (s.lifeRest && typeOf(pi) === "thoughtful" && p.life === 1 && s.lifelines > 1) { // rest instead of throwing
          p.lost++; A.restTurns++;
          if (++p.rest >= s.lifeRest) { p.rest = 0; p.life++; A.lifeRested++; }
        } else if (p.slow) { p.rest = 0; p.slow = false; p.dbl = false; moveBy(pi, 1); } // R9: move exactly 1
        else {
          const from = p.pos;
          p.rest = 0;
          let n = throwSequence(0);
          const single = n <= 5 && !p.dbl; // a single non-six throw: which square you reach is decided by the die alone
          if (p.dbl) { n *= 2; p.dbl = false; }
          moveBy(pi, n);
          if (single && !isWild(from)) for (let k = from + 1; k <= from + 5 && k < END; k++) if (T[k] && !p.opp.has(k)) p.opp.set(k, from + n === k);
        }
        if (p.pos * 8 + p.stairLeft !== before) p.dry = 0; else if (++p.dry > p.maxDry) p.maxDry = p.dry;
        if (p.pos === END) winner = pi;
        if (s.turns && ++turnCount >= s.turns) return { players: P.map(({ hits, opp, ...rest }) => rest), diceLeft: script?.length };
      }
      const li = leaderIdx();
      if (leader >= 0 && li !== leader) { A.leadChanges++; if (prog(P[li].pos) >= LATE) gLate++; }
      leader = li;
      if (lateFirst < 0 && prog(P[li].pos) >= LATE) lateFirst = li;
      if (!mid && prog(P[li].pos) >= MID) {
        const order = P.map((q, i) => [prog(q.pos), i]).sort((a, b) => b[0] - a[0]);
        mid = { first: order[0][1], last: order[order.length - 1][1] };
      }
    }
    if (winner < 0) { A.capped++; continue; }
    A.wins[winner]++; A.rounds.push(round);
    A.jackpots += gJack; A.falls += gFall; if (gJack) A.gamesJack++; if (gFall) A.gamesFall++;
    A.lateOvertakes += gLate; if (gLate) A.gamesLate++; if (gCap) A.gamesCapture++;
    if (lateFirst >= 0) { A.lateFirstN++; if (lateFirst === winner) A.lateFirstWin++; }
    if (mid) { A.midN++; if (mid.first === winner) A.midFirstWin++; else A.comeback++; if (mid.last === winner) A.midLastWin++; }
    const others = P.filter((q, i) => i !== winner && !q.out).map((q) => prog(q.pos));
    const runnerUp = others.length ? Math.max(...others) : 0;
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
    i6: {
      pctPlayersOut: f(100 * A.kicked / pg, 2), pctOutBySeat: A.outBySeat.map((k) => f(100 * k / n, 2)), pctGamesLastStanding: f(100 * A.gamesLastStanding / n, 2),
      lifelinesLostPerPlayer: f(A.lifeLost / pg, 2), lifelinesGainedPerPlayer: f(A.lifeGained / pg, 2), lifelinesSpentPerGame: f(A.lifeSpent / n, 2), lifelinesRestedPerGame: f(A.lifeRested / n, 2), restTurnsPerGame: f(A.restTurns / n, 2), lifelinesRefusedPerGame: f(A.lifeRefused / n, 2),
      roadblockHitsPerGame: f(A.roadblockHits / n, 2), wildPerGame: f(A.wildTaken / n, 2), safePerGame: f(A.safeTaken / n, 2),
      stairStepsPerPlayer: f(A.stairSteps / pg, 2),
    },
    tiles: Object.keys(board.tiles).map((k) => ({
      tile: +k, cat: board.tiles[k].cat, title: board.tiles[k].text,
      landedPct: f(100 * A.hit[k] / pg),
      winIfLanded: A.hit[k] ? f(100 * A.hitWin[k] / A.hit[k]) : null,
      impact: A.oppLand[k] > 300 && A.oppMiss[k] > 300 ? f(100 * (A.oppLandWin[k] / A.oppLand[k] - A.oppMissWin[k] / A.oppMiss[k])) : null,
    })).sort((a, b) => a.tile - b.tile),
  };
}

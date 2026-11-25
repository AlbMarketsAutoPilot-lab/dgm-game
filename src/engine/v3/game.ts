// The v3 rules engine (Step I, owner 25 Nov 2026): one game under docs/GCD.md §8.2a R1–R20 on a v3 destination file.
// Ported from the v3 simulator (tools/sim/engine3.mjs): with the same seed it plays exactly the same games, throw for
// throw; test/v3-equivalence.test.ts checks this game by game. Built next to the v2 engine (src/engine/game.ts), which
// the app uses until phase C.
//
// A turn is a generator: it runs until a player must choose (R19), yields a Decision3 and continues with the answer
// passed to next(). `runTurn3` plays a turn with a decider function (the robot, simulations, tests).
import { type Rng, d6, randomSeed, rng } from "../rng";
import type { AreaEffect, Board3, Tile3 } from "./types";

export interface Player3 {
  seat: number;
  /** 0 = Home, 1..lastTile, endTile = finished. */
  pos: number;
  /** R1: still at Home at the start, needs a 6 (or the card) to leave. False after a bump (R5). */
  home: boolean;
  cards: number;
  /** R6: stuck at the fallen tree. */
  stuck: boolean;
  /** Turns to miss. */
  skip: number;
  /** Square 7: next turn exactly 1 square. */
  slow: boolean;
  /** Mountains / square 72: the next roll counts double. */
  dbl: boolean;
  /** Forest: the next move goes backward. */
  back: boolean;
  /** R17: waiting on the Dragon Boat's square for the exact roll. */
  boat: boolean;
  /** Throws without a 6 in this stay at Home or at the tree (R20). */
  tries: number;
  /** R16: the areas whose effect this player has had (by area index). */
  done: boolean[];
  // Statistics, the same as the simulator's per-game record.
  waitHome: number; waitTree: number; homeRun: number; treeRun: number; maxHomeRun: number; maxTreeRun: number;
  skipped: number; dry: number; maxDry: number; bumped: number; bumps: number; treeStuck: number; boatRides: number; fx: number;
  /** Runs of 3, 4, 5, 6+ sixes in a row. */
  sixRuns: number[];
  got: { square: number; seaside: number; market: number };
  used: { home: number; tree: number; forced: number; square: number; area: number };
}

export type Decision3 =
  /** R1 / R6: at Home or stuck at the tree, holding a card: use it (true) or roll for a 6 (false). Asked every turn. */
  | { kind: "waitCard"; player: number; where: "home" | "tree"; tries: number }
  /** R14: a punishment of your own, holding a card: cancel it with the card (true) or take it (false). */
  | { kind: "punishment"; player: number; square: number; tile: Tile3 | null; area: AreaEffect["type"] | null }
  /** R18 with 3–4 players: the partner at the Swap Market (a seat from `candidates`, in turn order after the player). */
  | { kind: "swapMarket"; player: number; give: boolean; candidates: number[] };

export type Answer3 = boolean | number;

export interface GameView3 {
  board: Board3;
  players: readonly Player3[];
  round: number;
}

export type Decider3 = (d: Decision3, g: Readonly<GameView3>) => Answer3;

export interface GameOptions3 {
  players: number;
  seed?: number;
  rng?: Rng;
  /** Replaces the die (tests). */
  dice?: () => number;
  /** R20: seats played by the robot (its forced card on the 3rd throw at Home or the tree). */
  robots?: boolean[];
  /** Tests: starting state per seat. */
  setup?: Partial<Player3>[];
  /** The game stops (no winner) instead of starting this round + 1. Default 3000, as in the simulator. */
  maxRounds?: number;
}

type Turn = Generator<Decision3, void, Answer3>;

export class Game3 implements GameView3 {
  readonly board: Board3;
  readonly players: Player3[];
  round = 0;
  winner: number | null = null;
  capped = false;
  /** Whether the winner finished with the Dragon Boat's exact roll. */
  wonByBoat = false;

  private seat: number;
  private readonly die: () => number;
  private readonly maxRounds: number;
  private readonly robots: boolean[];
  private readonly END: number;
  private readonly LAST: number;
  private readonly area: Int8Array;
  private readonly boatSq: number;

  constructor(board: Board3, opts: GameOptions3) {
    if (!Number.isInteger(opts.players) || opts.players < 1 || opts.players > 4) throw new Error("players must be 1–4");
    this.board = board;
    const rand = opts.rng ?? rng(opts.seed ?? randomSeed());
    this.die = opts.dice ?? (() => d6(rand));
    this.maxRounds = opts.maxRounds ?? 3000;
    this.robots = opts.robots ?? [];
    this.END = board.endTile;
    this.LAST = board.lastTile;
    this.area = new Int8Array(this.END);
    board.areas.forEach((a, i) => { for (let k = a.from; k <= a.to; k++) this.area[k] = i; });
    const boat = Object.keys(board.tiles).find((k) => board.tiles[k].type === "dragonBoat");
    this.boatSq = boat === undefined ? -1 : Number(boat);
    this.players = Array.from({ length: opts.players }, (_, seat) => ({
      seat, pos: 0, home: true, cards: board.rules.startCards, stuck: false, skip: 0, slow: false, dbl: false, back: false,
      boat: false, tries: 0, done: board.areas.map(() => false),
      waitHome: 0, waitTree: 0, homeRun: 0, treeRun: 0, maxHomeRun: 0, maxTreeRun: 0, skipped: 0, dry: 0, maxDry: 0,
      bumped: 0, bumps: 0, treeStuck: 0, boatRides: 0, fx: 0, sixRuns: [0, 0, 0, 0],
      got: { square: 0, seaside: 0, market: 0 }, used: { home: 0, tree: 0, forced: 0, square: 0, area: 0 },
    }));
    opts.setup?.forEach((s, i) => Object.assign(this.players[i], s));
    this.seat = opts.players - 1;
  }

  get over(): boolean {
    return this.winner !== null || this.capped;
  }

  /** The seat that plays the next turn. */
  get next(): number {
    return (this.seat + 1) % this.players.length;
  }

  /** Plays the next player's turn. */
  *turn(): Turn {
    if (this.over) throw new Error("the game is over");
    this.seat = this.next;
    if (this.seat === 0) {
      if (this.round >= this.maxRounds) { this.capped = true; return; }
      this.round++;
    }
    const pi = this.seat, p = this.players[pi], before = p.pos;
    if (p.skip > 0) { p.skip--; p.skipped++; }
    else if (p.boat) this.boatTurn(pi);
    else if (p.home || p.stuck) yield* this.waitingTurn(pi);
    else yield* this.moveTurn(pi);
    if (p.pos !== before) p.dry = 0; else if (++p.dry > p.maxDry) p.maxDry = p.dry;
  }

  // ---- helpers ----

  private others(pi: number): number[] {
    const o: number[] = [];
    for (let k = 1; k < this.players.length; k++) o.push((pi + k) % this.players.length);
    return o;
  }

  private rollRun(pi: number): number { // R2: every 6 rolls again, no limit; one move by the total
    let total = 0, sixes = 0, r: number;
    do { r = this.die(); total += r; if (r === 6) sixes++; } while (r === 6);
    if (sixes >= 3) this.players[pi].sixRuns[Math.min(sixes, 6) - 3]++;
    return total;
  }

  private bump(pi: number, sq: number): void { // R4: back Home, no 6 needed to leave (R5)
    if (sq < 1 || sq > this.LAST) return;
    this.players.forEach((q, i) => {
      if (i === pi || q.pos !== sq) return;
      q.pos = 0; q.home = false; q.stuck = false; q.boat = false; q.back = false; q.tries = 0; q.skip = 0; q.treeRun = 0;
      q.bumped++; this.players[pi].bumps++;
    });
  }

  private jumpTo(pi: number, to: number): void { // a fixed event move (R8): no square event, no area effect, a bump
    this.players[pi].pos = to;
    this.bump(pi, to);
  }

  private swap(a: number, b: number): void { // swaps bump nobody, trigger nothing, and end a Dragon Boat deal
    const P = this.players, t = P[a].pos;
    P[a].pos = P[b].pos; P[b].pos = t;
    P[a].boat = false; P[b].boat = false;
  }

  private ahead(pi: number): number {
    const P = this.players;
    let best = -1;
    for (const q of this.others(pi)) if (P[q].pos > P[pi].pos && P[q].pos < this.END && (best < 0 || P[q].pos < P[best].pos)) best = q;
    return best;
  }

  private behind(pi: number): number {
    const P = this.players;
    let best = -1;
    for (const q of this.others(pi)) if (P[q].pos < P[pi].pos && P[q].pos >= 1 && (best < 0 || P[q].pos > P[best].pos)) best = q;
    return best;
  }

  private leaderAhead(pi: number): number {
    const P = this.players;
    let best = -1;
    for (const q of this.others(pi)) if (P[q].pos > P[pi].pos && P[q].pos < this.END && (best < 0 || P[q].pos > P[best].pos)) best = q;
    return best;
  }

  /** R14: asked only when the player holds a card. True = the card cancels it. */
  private *cancels(pi: number, square: number, tile: Tile3 | null, area: AreaEffect["type"] | null): Generator<Decision3, boolean, Answer3> {
    if (this.players[pi].cards <= 0) return false;
    return (yield { kind: "punishment", player: pi, square, tile, area }) === true;
  }

  // ---- moves ----

  /** A forward move by dice. "roll" = a plain roll (may give an area effect); "dice" = an event's dice (no area effect). */
  private *forward(pi: number, n: number, how: "roll" | "dice"): Turn {
    const p = this.players[pi], from = p.pos, to = from + n;
    if (to > this.END) return; // R7: exact; too big = stay
    if (to === this.END) { p.pos = this.END; this.winner = pi; return; }
    p.pos = to;
    this.bump(pi, to);
    const t = this.board.tiles[to];
    if (t) yield* this.squareEvent(pi, to, t);
    if (how === "roll" && this.winner === null) yield* this.areaEntry(pi, from, to);
  }

  private backward(pi: number, n: number): void { // Forest: never past Home; no square event or area effect; a bump
    const p = this.players[pi];
    p.stuck = false;
    p.pos = Math.max(0, p.pos - n);
    if (p.pos === 0) p.home = false; else this.bump(pi, p.pos);
  }

  private *squareEvent(pi: number, sq: number, t: Tile3): Turn {
    const P = this.players, p = P[pi];
    if (t.cat === "P" && t.type !== "tree" && (yield* this.cancels(pi, sq, t, null))) { p.cards--; p.used.square++; return; }
    switch (t.type) {
      case "tree": p.stuck = true; p.tries = 0; p.treeRun = 0; p.treeStuck++; break;
      case "slowNext": p.slow = true; break;
      case "doubleOthers": for (const q of this.others(pi)) P[q].dbl = true; break;
      case "jump": this.jumpTo(pi, t.to!); if (t.then === "skip2") p.skip += 2; break;
      case "card": p.cards++; p.got.square++; break;
      case "nearest": { // R11: the next square of that category, and it applies
        let k = sq + 1;
        while (k <= this.LAST && !(this.board.tiles[k] && this.board.tiles[k].cat === t.target)) k++;
        if (k > this.LAST) break;
        this.jumpTo(pi, k);
        yield* this.squareEvent(pi, k, this.board.tiles[k]);
        break;
      }
      case "swapLeader": { const q = this.leaderAhead(pi); if (q >= 0) this.swap(pi, q); break; } // R10
      case "rollSum": {
        let n = 0;
        for (let i = 0; i < t.dice!; i++) n += this.die();
        yield* this.forward(pi, n, "dice");
        break;
      }
      case "dragonBoat": this.jumpTo(pi, t.to!); p.boat = true; p.boatRides++; break; // R17
      case "swapMarket": { // R18
        const give = p.cards > 0;
        const cands = give ? this.others(pi) : this.others(pi).filter((q) => P[q].cards > 0);
        if (!cands.length) break;
        let q = cands[0];
        if (cands.length > 1) {
          const a = yield { kind: "swapMarket", player: pi, give, candidates: cands };
          if (typeof a !== "number" || !cands.includes(a)) throw new Error("swapMarket: answer a seat from the candidates");
          q = a;
        }
        if (give) { p.cards--; P[q].cards++; P[q].got.market++; } else { P[q].cards--; p.cards++; p.got.market++; }
        break;
      }
    }
  }

  /** R16: the first entry into an area by a plain roll, after the square's event, if the player is still there. */
  private *areaEntry(pi: number, from: number, to: number): Turn {
    const p = this.players[pi], a = this.area[to], fx = this.board.areas[a].effect;
    if (a === this.area[from] || !fx || p.done[a]) return;
    if (p.pos >= this.END || this.area[p.pos] !== a) return;
    p.done[a] = true; p.fx++;
    switch (fx.type) {
      case "gifted6": yield* this.forward(pi, 6 + this.rollRun(pi), "dice"); break;
      case "backward":
        if (yield* this.cancels(pi, p.pos, null, "backward")) { p.cards--; p.used.area++; } else p.back = true;
        break;
      case "double": p.dbl = true; break;
      case "swapAhead": {
        const q = this.ahead(pi);
        if (q >= 0 && this.players[q].pos - p.pos <= fx.range) this.swap(pi, q); else { p.cards++; p.got.seaside++; }
        break;
      }
      case "swapBehind": {
        const q = this.behind(pi);
        if (q >= 0 && p.pos - this.players[q].pos <= fx.range) this.swap(pi, q);
        else if (yield* this.cancels(pi, p.pos, null, "swapBehind")) { p.cards--; p.used.area++; }
        else p.skip++;
        break;
      }
    }
  }

  /** A turn that moves (also after leaving Home or the tree). `given`: a throw that already counts (the forced card). */
  private *moveTurn(pi: number, given?: number): Turn {
    const p = this.players[pi];
    if (p.slow) { p.slow = false; yield* this.forward(pi, 1, "roll"); return; } // square 7: exactly 1
    let n = given ?? this.rollRun(pi);
    if (p.dbl) { n *= 2; p.dbl = false; } // never more than ×2
    if (p.back) { p.back = false; this.backward(pi, n); return; }
    yield* this.forward(pi, n, "roll");
  }

  private *waitingTurn(pi: number): Turn { // R1 / R6
    const p = this.players[pi], home = p.home;
    if (!home && p.back) { yield* this.moveTurn(pi); return; } // R6: the pending Forest move frees you
    const free = () => { p.tries = 0; if (home) p.home = false; else p.stuck = false; p.homeRun = 0; p.treeRun = 0; };
    if (p.cards > 0 && (yield { kind: "waitCard", player: pi, where: home ? "home" : "tree", tries: p.tries }) === true) {
      p.cards--; p.used[home ? "home" : "tree"]++; free();
      yield* this.moveTurn(pi);
      return;
    }
    const r = this.die();
    if (r === 6) { free(); yield* this.moveTurn(pi); return; } // the freeing 6 does not move you
    p.tries++;
    if (this.robots[pi] && p.tries >= this.board.rules.robotForceAfter && p.cards > 0) { // R20
      p.cards--; p.used.forced++; free();
      yield* this.moveTurn(pi, r);
      return;
    }
    if (home) { p.waitHome++; if (++p.homeRun > p.maxHomeRun) p.maxHomeRun = p.homeRun; }
    else { p.waitTree++; if (++p.treeRun > p.maxTreeRun) p.maxTreeRun = p.treeRun; }
  }

  private boatTurn(pi: number): void { // R17: exactly `need` wins; anything else back to the boat's square
    const p = this.players[pi], r = this.die();
    p.dbl = false; p.boat = false;
    if (r === this.board.tiles[this.boatSq].need) { p.pos = this.END; this.winner = pi; this.wonByBoat = true; return; }
    this.jumpTo(pi, this.boatSq);
  }
}

/** Plays one turn, answering every choice with `decide`. */
export function runTurn3(game: Game3, decide: Decider3): void {
  const t = game.turn();
  for (let r = t.next(); !r.done; r = t.next(decide(r.value, game)));
}

/**
 * The robot (GCD R20, §8.6): rolls for the 6 at Home and at the tree (the engine forces its card on the 3rd throw),
 * uses its card on the first punishment it meets, and at the Swap Market gives to the player furthest behind and takes
 * from the leader among the players holding a card (ties: the next player in turn order).
 */
export const robot: Decider3 = (d, g) => {
  switch (d.kind) {
    case "waitCard": return false;
    case "punishment": return true;
    case "swapMarket": {
      let best = d.candidates[0];
      for (const q of d.candidates) {
        const a = g.players[q].pos, b = g.players[best].pos;
        if (d.give ? a < b : a > b) best = q;
      }
      return best;
    }
  }
};

/** What the simulator records for each player, game by game. */
export interface PlayerRecord3 {
  pos: number; cards: number; bumped: number; bumps: number; waitHome: number; waitTree: number; skipped: number;
  maxDry: number; treeStuck: number; boatRides: number; fx: number; sixRuns: number[];
  got: Player3["got"]; used: Player3["used"];
}
export interface GameRecord3 { rounds: number; winner: number; players: PlayerRecord3[] }

export function recordOf3(g: Game3): GameRecord3 {
  return {
    rounds: g.round, winner: g.winner!,
    players: g.players.map((q) => ({
      pos: q.pos, cards: q.cards, bumped: q.bumped, bumps: q.bumps, waitHome: q.waitHome, waitTree: q.waitTree, skipped: q.skipped,
      maxDry: q.maxDry, treeStuck: q.treeStuck, boatRides: q.boatRides, fx: q.fx, sixRuns: [...q.sixRuns],
      got: { ...q.got }, used: { ...q.used },
    })),
  };
}

/** One whole game of robots. Returns null when it stopped at the round limit without a winner. */
export function playGame3(board: Board3, players: number, rand: Rng, maxRounds = 3000): GameRecord3 | null {
  const game = new Game3(board, { players, rng: rand, maxRounds, robots: Array(players).fill(true) });
  while (!game.over) runTurn3(game, robot);
  return game.winner === null ? null : recordOf3(game);
}

// The v3 rules engine (Step I, owner 25 Nov 2026): one game under docs/GCD.md §8.2a R1–R20 on a v3 destination file.
// Ported from the v3 simulator (tools/sim/engine3.mjs): with the same seed it plays exactly the same games, throw for
// throw; test/v3-equivalence.test.ts checks this game by game. Built next to the v2 engine (src/engine/game.ts), which
// the app uses until phase C.
//
// A turn is a generator: it runs until a player must choose (R19), yields a Decision3 and continues with the answer
// passed to next(). `runTurn3` plays a turn with a decider function (the robot, simulations, tests).
// Phase C1 (owner, 26 Nov 2026): every thing that happens is also written to `events`, in order, for the screens
// (moving the tokens, Mr. Lin's popups, the notifications, the postcards). Writing them never throws a die, so the games
// stay throw for throw the simulator's (test/v3-equivalence.test.ts).
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

/** Why a die is thrown: `move` a plain move, `wait` at Home or the tree, `boat` the Dragon Boat's
 * roll, `dice` an event's dice (square 61, the Countryside's extra roll). */
export type RollWhy = "move" | "wait" | "boat" | "dice";

/** What happens in a turn, in order (phase C1). Squares are numbers here; the screens never show them (R1 of Part 2). */
export type Event3 =
  | { type: "turn"; player: number }
  /** A missed turn; `left` = turns still to miss after this one. */
  | { type: "skip"; player: number; left: number }
  /** One throw of the die. */
  | { type: "roll"; player: number; value: number; why: RollWhy }
  /** R2: a run of 3 or more 6s (the sixes postcards). */
  | { type: "sixes"; player: number; count: number }
  /** R1 / R6: a throw without a 6 at Home or at the tree; `tries` = throws without a 6 in this stay. */
  | { type: "noSix"; player: number; where: "home" | "tree"; tries: number }
  /** R1 / R6 / R20: free to go; then the player rolls to move (`forced`: the robot's card, moving by that same throw). */
  | { type: "free"; player: number; where: "home" | "tree"; by: "six" | "card" | "forced" }
  /** A move by dice, square by square: `dir` -1 = the Forest's backward move. `doubled`: a pending double was used. */
  | { type: "move"; player: number; from: number; to: number; dir: 1 | -1; by: "roll" | "slow" | "dice"; doubled: boolean }
  /** R7: the total passes the finish, the token stays. */
  | { type: "overshoot"; player: number; squares: number }
  /** The square's event starts (before any Bonus card question). */
  | { type: "square"; player: number; square: number; tile: Tile3 }
  /** A fixed move by an event: a square's jump, "next good square", the Dragon Boat there and back. */
  | { type: "jump"; player: number; from: number; to: number; cause: "tile" | "nearest" | "boat" | "boatBack" }
  /** R4: `victim` goes Home. */
  | { type: "bump"; player: number; victim: number; square: number }
  /** R10 / R16: places swapped. */
  | { type: "swap"; player: number; other: number; cause: "leader" | "ahead" | "behind" }
  /** R10: Plot Twist with nobody ahead. */
  | { type: "noLeader"; player: number }
  /** R16: an area's effect starts (before any Bonus card question). */
  | { type: "area"; player: number; area: number; effect: AreaEffect["type"] }
  /** Something waits for a later turn: exactly 1 (7), a double (Mountains, 72), backward (Forest), turns to miss. */
  | { type: "pending"; player: number; what: "slow" | "double" | "back" | "skip"; turns?: number }
  /** A Bonus card gained: a card square, the Seaside, the Swap Market (`from` = the giver). */
  | { type: "card"; player: number; source: "square" | "seaside" | "market"; from?: number }
  /** A Bonus card used: leave Home, leave the tree, the robot's forced card, cancel a square or an area effect. */
  | { type: "cardUsed"; player: number; use: "home" | "tree" | "forced" | "square" | "area" }
  /** R18: nobody can give or take a card. */
  | { type: "marketNone"; player: number }
  | { type: "win"; player: number; boat: boolean };

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
  /** Everything that happened, in order (phase C1). */
  readonly events: Event3[] = [];

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
    this.emit({ type: "turn", player: pi });
    if (p.skip > 0) { p.skip--; p.skipped++; this.emit({ type: "skip", player: pi, left: p.skip }); }
    else if (p.boat) this.boatTurn(pi);
    else if (p.home || p.stuck) yield* this.waitingTurn(pi);
    else yield* this.moveTurn(pi);
    if (p.pos !== before) p.dry = 0; else if (++p.dry > p.maxDry) p.maxDry = p.dry;
  }

  // ---- helpers ----

  private emit(e: Event3): void {
    this.events.push(e);
  }

  private others(pi: number): number[] {
    const o: number[] = [];
    for (let k = 1; k < this.players.length; k++) o.push((pi + k) % this.players.length);
    return o;
  }

  private roll(pi: number, why: RollWhy): number {
    const value = this.die();
    this.emit({ type: "roll", player: pi, value, why });
    return value;
  }

  private rollRun(pi: number, why: RollWhy): number { // R2: every 6 rolls again, no limit; one move by the total
    let total = 0, sixes = 0, r: number;
    do { r = this.roll(pi, why); total += r; if (r === 6) sixes++; } while (r === 6);
    if (sixes >= 3) { this.players[pi].sixRuns[Math.min(sixes, 6) - 3]++; this.emit({ type: "sixes", player: pi, count: sixes }); }
    return total;
  }

  private bump(pi: number, sq: number): void { // R4: back Home, no 6 needed to leave (R5)
    if (sq < 1 || sq > this.LAST) return;
    this.players.forEach((q, i) => {
      if (i === pi || q.pos !== sq) return;
      q.pos = 0; q.home = false; q.stuck = false; q.boat = false; q.back = false; q.tries = 0; q.skip = 0; q.treeRun = 0;
      q.bumped++; this.players[pi].bumps++;
      this.emit({ type: "bump", player: pi, victim: i, square: sq });
    });
  }

  private jumpTo(pi: number, to: number, cause: "tile" | "nearest" | "boat" | "boatBack"): void { // a fixed event move (R8): no square event, no area effect, a bump
    this.emit({ type: "jump", player: pi, from: this.players[pi].pos, to, cause });
    this.players[pi].pos = to;
    this.bump(pi, to);
  }

  private swap(a: number, b: number, cause: "leader" | "ahead" | "behind"): void { // swaps bump nobody, trigger nothing, and end a Dragon Boat deal
    this.emit({ type: "swap", player: a, other: b, cause });
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
  private *forward(pi: number, n: number, how: "roll" | "dice", by: "roll" | "slow" | "dice" = how, doubled = false): Turn {
    const p = this.players[pi], from = p.pos, to = from + n;
    if (to > this.END) { this.emit({ type: "overshoot", player: pi, squares: n }); return; } // R7: exact; too big = stay
    this.emit({ type: "move", player: pi, from, to, dir: 1, by, doubled });
    if (to === this.END) { p.pos = this.END; this.winner = pi; this.emit({ type: "win", player: pi, boat: false }); return; }
    p.pos = to;
    this.bump(pi, to);
    const t = this.board.tiles[to];
    if (t) yield* this.squareEvent(pi, to, t);
    if (how === "roll" && this.winner === null) yield* this.areaEntry(pi, from, to);
  }

  private backward(pi: number, n: number, doubled: boolean): void { // Forest: never past Home; no square event or area effect; a bump
    const p = this.players[pi], to = Math.max(0, p.pos - n);
    this.emit({ type: "move", player: pi, from: p.pos, to, dir: -1, by: "roll", doubled });
    p.stuck = false;
    p.pos = to;
    if (p.pos === 0) p.home = false; else this.bump(pi, p.pos);
  }

  private *squareEvent(pi: number, sq: number, t: Tile3): Turn {
    const P = this.players, p = P[pi];
    this.emit({ type: "square", player: pi, square: sq, tile: t });
    if (t.cat === "P" && t.type !== "tree" && (yield* this.cancels(pi, sq, t, null))) {
      p.cards--; p.used.square++; this.emit({ type: "cardUsed", player: pi, use: "square" }); return;
    }
    switch (t.type) {
      case "tree": p.stuck = true; p.tries = 0; p.treeRun = 0; p.treeStuck++; break;
      case "slowNext": p.slow = true; this.emit({ type: "pending", player: pi, what: "slow" }); break;
      case "doubleOthers": for (const q of this.others(pi)) { P[q].dbl = true; this.emit({ type: "pending", player: q, what: "double" }); } break;
      case "jump":
        this.jumpTo(pi, t.to!, "tile");
        if (t.then === "skip2") { p.skip += 2; this.emit({ type: "pending", player: pi, what: "skip", turns: p.skip }); }
        break;
      case "card": p.cards++; p.got.square++; this.emit({ type: "card", player: pi, source: "square" }); break;
      case "nearest": { // R11: the next square of that category, and it applies
        let k = sq + 1;
        while (k <= this.LAST && !(this.board.tiles[k] && this.board.tiles[k].cat === t.target)) k++;
        if (k > this.LAST) break;
        this.jumpTo(pi, k, "nearest");
        yield* this.squareEvent(pi, k, this.board.tiles[k]);
        break;
      }
      case "swapLeader": { // R10
        const q = this.leaderAhead(pi);
        if (q >= 0) this.swap(pi, q, "leader"); else this.emit({ type: "noLeader", player: pi });
        break;
      }
      case "rollSum": {
        let n = 0;
        for (let i = 0; i < t.dice!; i++) n += this.roll(pi, "dice");
        yield* this.forward(pi, n, "dice");
        break;
      }
      case "dragonBoat": this.jumpTo(pi, t.to!, "boat"); p.boat = true; p.boatRides++; break; // R17
      case "swapMarket": { // R18
        const give = p.cards > 0;
        const cands = give ? this.others(pi) : this.others(pi).filter((q) => P[q].cards > 0);
        if (!cands.length) { this.emit({ type: "marketNone", player: pi }); break; }
        let q = cands[0];
        if (cands.length > 1) {
          const a = yield { kind: "swapMarket", player: pi, give, candidates: cands };
          if (typeof a !== "number" || !cands.includes(a)) throw new Error("swapMarket: answer a seat from the candidates");
          q = a;
        }
        if (give) { p.cards--; P[q].cards++; P[q].got.market++; this.emit({ type: "card", player: q, source: "market", from: pi }); }
        else { P[q].cards--; p.cards++; p.got.market++; this.emit({ type: "card", player: pi, source: "market", from: q }); }
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
    this.emit({ type: "area", player: pi, area: a, effect: fx.type });
    const cardUsed = () => { p.cards--; p.used.area++; this.emit({ type: "cardUsed", player: pi, use: "area" }); };
    switch (fx.type) {
      case "gifted6": yield* this.forward(pi, 6 + this.rollRun(pi, "dice"), "dice"); break;
      case "backward":
        if (yield* this.cancels(pi, p.pos, null, "backward")) cardUsed();
        else { p.back = true; this.emit({ type: "pending", player: pi, what: "back" }); }
        break;
      case "double": p.dbl = true; this.emit({ type: "pending", player: pi, what: "double" }); break;
      case "swapAhead": {
        const q = this.ahead(pi);
        if (q >= 0 && this.players[q].pos - p.pos <= fx.range) this.swap(pi, q, "ahead");
        else { p.cards++; p.got.seaside++; this.emit({ type: "card", player: pi, source: "seaside" }); }
        break;
      }
      case "swapBehind": {
        const q = this.behind(pi);
        if (q >= 0 && p.pos - this.players[q].pos <= fx.range) this.swap(pi, q, "behind");
        else if (yield* this.cancels(pi, p.pos, null, "swapBehind")) cardUsed();
        else { p.skip++; this.emit({ type: "pending", player: pi, what: "skip", turns: p.skip }); }
        break;
      }
    }
  }

  /** A turn that moves (also after leaving Home or the tree). `given`: a throw that already counts (the forced card). */
  private *moveTurn(pi: number, given?: number): Turn {
    const p = this.players[pi];
    if (p.slow) { p.slow = false; yield* this.forward(pi, 1, "roll", "slow"); return; } // square 7: exactly 1
    let n = given ?? this.rollRun(pi, "move");
    const doubled = p.dbl;
    if (p.dbl) { n *= 2; p.dbl = false; } // never more than ×2
    if (p.back) { p.back = false; this.backward(pi, n, doubled); return; }
    yield* this.forward(pi, n, "roll", "roll", doubled);
  }

  private *waitingTurn(pi: number): Turn { // R1 / R6
    const p = this.players[pi], home = p.home;
    if (!home && p.back) { yield* this.moveTurn(pi); return; } // R6: the pending Forest move frees you
    const where = home ? "home" : "tree";
    const free = (by: "six" | "card" | "forced") => {
      p.tries = 0; if (home) p.home = false; else p.stuck = false; p.homeRun = 0; p.treeRun = 0;
      this.emit({ type: "free", player: pi, where, by });
    };
    if (p.cards > 0 && (yield { kind: "waitCard", player: pi, where, tries: p.tries }) === true) {
      p.cards--; p.used[where]++; this.emit({ type: "cardUsed", player: pi, use: where }); free("card");
      yield* this.moveTurn(pi);
      return;
    }
    const r = this.roll(pi, "wait");
    if (r === 6) { free("six"); yield* this.moveTurn(pi); return; } // the freeing 6 does not move you
    p.tries++;
    if (this.robots[pi] && p.tries >= this.board.rules.robotForceAfter && p.cards > 0) { // R20
      p.cards--; p.used.forced++; this.emit({ type: "cardUsed", player: pi, use: "forced" }); free("forced");
      yield* this.moveTurn(pi, r);
      return;
    }
    this.emit({ type: "noSix", player: pi, where, tries: p.tries });
    if (home) { p.waitHome++; if (++p.homeRun > p.maxHomeRun) p.maxHomeRun = p.homeRun; }
    else { p.waitTree++; if (++p.treeRun > p.maxTreeRun) p.maxTreeRun = p.treeRun; }
  }

  private boatTurn(pi: number): void { // R17: exactly `need` wins; anything else back to the boat's square
    const p = this.players[pi], r = this.roll(pi, "boat");
    p.dbl = false; p.boat = false;
    if (r === this.board.tiles[this.boatSq].need) {
      this.emit({ type: "move", player: pi, from: p.pos, to: this.END, dir: 1, by: "roll", doubled: false }); // ashore
      p.pos = this.END; this.winner = pi; this.wonByBoat = true; this.emit({ type: "win", player: pi, boat: true }); return;
    }
    this.jumpTo(pi, this.boatSq, "boatBack");
  }
}

/** Plays one turn, answering every choice with `decide`. Returns the events of that turn. */
export function runTurn3(game: Game3, decide: Decider3): Event3[] {
  const first = game.events.length, t = game.turn();
  for (let r = t.next(); !r.done; r = t.next(decide(r.value, game)));
  return game.events.slice(first);
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

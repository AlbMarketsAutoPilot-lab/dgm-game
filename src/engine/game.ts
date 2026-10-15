// The rules engine: one game of Don't Get Mad! under the frozen rules R1–R21 (docs/GCD.md §8.2a, §8.2b).
// Ported from tools/sim/engine.mjs (the measured simulator). With the same seed it plays exactly the same games,
// throw for throw; test/equivalence.test.ts checks this against the simulator itself.
//
// A turn is a generator: it runs until the engine needs a player's choice (R21: the road at a crossroads, the bonus
// card), yields a Decision, and continues with the Answer passed to next(). Everything that happens is appended to
// `events`, in order, for the renderer and the UI. `runTurn` plays a turn with a decider function (computer players,
// simulations, tests).
import { BoardIndex, OFF, OUT, START, isShortcut, shortcutOf, shortcutPos } from "./board";
import { type Rng, d6, randomSeed, rng } from "./rng";
import type { Answer, Board, Decider, Decision, GameEvent, GameView, PlayerState, Pos, Road, Spot, Tile } from "./types";

export interface GameOptions {
  /** 1–4 players (the app offers 2–4, R12). */
  players: number;
  /** Seed for the dice and the fallen tree. Ignored when `rng` is given. */
  seed?: number;
  /** Random source shared with other games (the simulator plays many games from one source). */
  rng?: Rng;
  /** Replaces the die (tests: scripted throws). The fallen tree still uses the random source. */
  dice?: () => number;
  /** Tests: starting state per seat. */
  setup?: Partial<PlayerState>[];
  /** Tests: a fallen tree already on this square. */
  roadblock?: number | null;
  /** The game stops (no winner) instead of starting this round + 1. Default 3000, as in the simulator. */
  maxRounds?: number;
}

type Turn = Generator<Decision, void, Answer>;

/** How deep events may start new moves inside one turn (throw again, nearest square), as in the simulator. */
const MAX_DEPTH = 6;

export class Game implements GameView {
  readonly board: Board;
  readonly index: BoardIndex;
  readonly players: PlayerState[];
  /** Everything that has happened, in order. */
  readonly events: GameEvent[] = [];
  round = 0;
  /** R19: the square of the fallen tree, or null. */
  roadblock: number | null;
  winner: number | null = null;
  /** True when the winner won as the last player left in the game (R18). */
  lastStanding = false;
  /** True when the game stopped at maxRounds without a winner. */
  capped = false;

  private seat: number;
  private readonly rand: Rng;
  private readonly die: () => number;
  private readonly maxRounds: number;
  // R18: three 6s in a row in one turn win a lantern. Counts the 6s from the start of the turn until the first other face.
  private run = 0;
  private runOn = false;
  private thrower: PlayerState | null = null;

  constructor(board: Board, opts: GameOptions) {
    if (!Number.isInteger(opts.players) || opts.players < 1 || opts.players > 4) throw new Error("players must be 1–4");
    this.board = board;
    this.index = new BoardIndex(board);
    this.rand = opts.rng ?? rng(opts.seed ?? randomSeed());
    this.die = opts.dice ?? (() => d6(this.rand));
    this.maxRounds = opts.maxRounds ?? 3000;
    this.roadblock = opts.roadblock ?? null;
    this.players = Array.from({ length: opts.players }, (_, seat) => ({
      seat, pos: OFF, skip: 0, trapped: false, tries: 0, slow: false, double: false, snakeLeader: false,
      bonus: 0, jailPass: 0, lanterns: board.rules.lifelines, out: false,
      stairAt: 0, stairLeft: 0, stairTotal: 0, onStair: false, road: null, captured: 0,
    }));
    opts.setup?.forEach((s, i) => Object.assign(this.players[i], s));
    this.seat = opts.players - 1;
  }

  get over(): boolean {
    return this.winner !== null || this.capped;
  }

  /** Seat of the turn being played, or of the last turn played. */
  get currentSeat(): number {
    return this.seat;
  }

  /** The player closest to END (ties: the earlier seat). */
  leader(): number {
    let li = 0;
    this.players.forEach((q, i) => { if (this.progress(q.pos) > this.progress(this.players[li].pos)) li = i; });
    return li;
  }

  /** One player's turn. Yields when a player must choose; returns at the end of the turn. */
  *turn(): Turn {
    if (this.over) throw new Error("the game is over");
    if (!this.advance()) return;
    const pi = this.seat, p = this.players[pi];
    this.emit({ type: "turn", player: pi });
    this.run = 0; this.runOn = true; this.thrower = p;
    if (p.skip > 0) {
      p.skip--;
      this.emit({ type: "skipTurn", player: pi, turnsLeft: p.skip });
    } else if (p.pos === OFF || p.trapped) {
      yield* this.waitingTurn(pi);
    } else if (p.slow) { // R9: move exactly 1, whatever the die shows (a pending double is lost)
      yield* this.askRoad(pi);
      p.slow = false; p.double = false;
      yield* this.moveBy(pi, 1);
    } else {
      yield* this.askRoad(pi);
      let n = this.throwSequence(0);
      if (p.double) { n *= 2; p.double = false; }
      yield* this.moveBy(pi, n);
    }
    this.runOn = false;
    p.road = null;
    if (p.pos === this.index.end) { this.winner = pi; this.emit({ type: "win", player: pi, lastStanding: false }); }
  }

  // ---- Turn order ----

  /** Moves to the next seat still in the game; a new round starts after the last seat (R19 places the tree then). */
  private advance(): boolean {
    if (this.players.every((q) => q.out)) { this.capped = true; return false; }
    do {
      this.seat++;
      if (this.seat >= this.players.length) {
        if (this.round >= this.maxRounds) { this.capped = true; return false; }
        this.seat = 0;
        this.round++;
        this.emit({ type: "round", round: this.round });
        if (this.roadblock === null) this.placeRoadblock();
      }
    } while (this.players[this.seat].out);
    return true;
  }

  // ---- Dice (R2) ----

  private throwDie(): number {
    const r = this.die();
    const p = this.thrower!;
    this.emit({ type: "roll", player: p.seat, value: r });
    if (this.runOn) {
      if (r === 6) {
        if (++this.run === 3 && !p.out) { p.lanterns++; this.emit({ type: "lanternWon", player: p.seat, total: p.lanterns }); }
      } else this.runOn = false;
    }
    return r;
  }

  /**
   * R2 (owner, 15 Oct): every 6 gives one more throw and the throws add up; the third 6 ends the throwing.
   * k0 = sixes already thrown this turn to enter or leave the Bog (R15: they count, but move nobody).
   */
  private throwSequence(k0: number): number {
    const max = this.board.rules.maxSixes;
    let k = k0, total = 0;
    for (;;) {
      const r = this.throwDie(); total += r;
      if (r !== 6 || ++k >= max) return total;
    }
  }

  // ---- Waiting at Home or in the trap (R1, R6, R17, R18) ----

  private *waitingTurn(pi: number): Turn {
    const p = this.players[pi], off = p.pos === OFF, where = off ? "start" : "trap";
    const r = this.throwDie();
    if (r === 6) { // freed; the 6 itself never moves you, you throw again (owner, 15 Oct: "6 to enter, 2 to move")
      p.tries = 0;
      if (off) p.pos = START; else p.trapped = false;
      this.emit({ type: "released", player: pi, where, bySix: true, stairs: 0 });
      if (p.slow) { p.slow = false; yield* this.moveBy(pi, 1); }
      else {
        let n = this.throwSequence(1);
        if (p.double) { n *= 2; p.double = false; }
        yield* this.moveBy(pi, n);
      }
    } else if (p.tries >= 2) { // 3rd throw without a 6: a lantern goes out, and you move anyway by that throw
      p.tries = 0;
      if (!this.loseLantern(pi)) {
        if (off) p.pos = START; else p.trapped = false;
        this.emit({ type: "released", player: pi, where, bySix: false, stairs: 0 });
        let n = p.slow ? 1 : r;
        p.slow = false;
        if (p.double) { n *= 2; p.double = false; }
        yield* this.moveBy(pi, n);
      }
    } else {
      p.tries++;
      this.emit({ type: "noSix", player: pi, where, tries: p.tries });
    }
  }

  private clearStairs(p: PlayerState): void {
    p.stairLeft = 0; p.onStair = false;
  }

  /** R18. Returns true when the player is out. */
  private loseLantern(pi: number): boolean {
    const p = this.players[pi];
    p.lanterns--;
    if (p.lanterns >= 0) { this.emit({ type: "lanternLost", player: pi, left: p.lanterns }); return false; }
    p.lanterns = 0;
    p.out = true; p.pos = OUT; p.trapped = false; p.skip = 0; this.clearStairs(p);
    this.emit({ type: "out", player: pi });
    const left = this.players.filter((q) => !q.out);
    if (left.length === 1) {
      this.winner = left[0].seat; this.lastStanding = true;
      this.emit({ type: "win", player: this.winner, lastStanding: true });
    }
    return true;
  }

  // ---- Crossroads (R20) ----

  private *askRoad(pi: number): Turn {
    const p = this.players[pi], fork = this.index.forkAt(p.pos);
    if (fork >= 0 && p.road === null) yield* this.chooseRoad(pi, fork);
  }

  private *chooseRoad(pi: number, fork: number): Turn {
    const p = this.players[pi];
    p.road = (yield { kind: "road", player: pi, fork, square: p.pos }) as Road;
    if (p.road !== "main" && p.road !== "shortcut") throw new Error(`road must be "main" or "shortcut", got ${String(p.road)}`);
    this.emit({ type: "road", player: pi, fork, road: p.road });
  }

  // ---- Moving ----

  /** A move by a throw: stair steps first (R17), Main Road or Shortcut, stop at crossroads (R20), exact END (R8). */
  private *moveBy(pi: number, n: number, depth = 0): Turn {
    const p = this.players[pi];
    if (n <= 0) return;
    const start = p.pos, path: Spot[] = [];
    let from = p.pos;
    if (p.stairLeft > 0 && from <= p.stairAt) {
      const toBase = p.stairAt - from;
      if (n > toBase) {
        const climb = Math.min(n - toBase, p.stairLeft), done = p.stairTotal - p.stairLeft;
        for (let s = from + 1; s <= p.stairAt; s++) path.push({ pos: s, stair: 0 });
        for (let j = 1; j <= climb; j++) path.push({ pos: p.stairAt, stair: done + j });
        p.stairLeft -= climb; n -= toBase + climb; from = p.stairAt;
        if (n === 0) { // standing on a stair step: no event, no capture
          p.pos = from; p.onStair = true;
          this.emit({ type: "move", player: pi, from: start, to: from, path, crossroads: false });
          return;
        }
      }
    }
    p.onStair = false;
    let to: Pos, crossroads = false;
    const fork = isShortcut(from) ? shortcutOf(from).fork : this.index.forkAt(from);
    const steps: Pos[] = [];
    if (fork >= 0) {
      const f = this.index.forks[fork];
      let wild = isShortcut(from);
      if (!wild) {
        if (p.road === null) yield* this.chooseRoad(pi, fork); // normally chosen before the throw (askRoad)
        wild = p.road === "shortcut";
        p.road = null;
      }
      if (wild) {
        const i0 = isShortcut(from) ? shortcutOf(from).index : 0, along = (i: number) => (i <= f.len ? shortcutPos(fork, i) : f.merge + (i - f.len - 1));
        to = along(i0 + n);
        for (let i = i0 + 1; i <= i0 + n; i++) steps.push(along(i));
      } else to = from + n;
    } else {
      to = from + n;
      for (const f of this.index.forks) if (from < f.at && to > f.at) { to = f.at; crossroads = true; break; } // every token stops
    }
    if (!isShortcut(to) && to > this.index.end) { this.emit({ type: "overshoot", player: pi, squares: n }); return; }
    if (!steps.length) for (let s = from + 1; s <= to; s++) steps.push(s);
    for (const s of steps) path.push({ pos: s, stair: 0 });
    p.pos = to;
    this.emit({ type: "move", player: pi, from: start, to, path, crossroads });
    if (to === this.index.end) return;
    this.capture(pi, to);
    if (this.roadblock !== null && to === this.roadblock) { this.hitRoadblock(pi); return; }
    yield* this.applyTile(pi, depth);
  }

  /** A move by an event (no chaining: the destination's own event does not happen), with capture (R4). */
  private jumpTo(pi: number, to: Pos, cause: "tile" | "roadblock" | "nearest" | "swap", swapWith = -1): void {
    const p = this.players[pi];
    this.emit({ type: "jump", player: pi, from: p.pos, to, cause });
    p.pos = to; this.clearStairs(p);
    this.capture(pi, to, swapWith);
    this.hitRoadblock(pi);
  }

  /**
   * R4: everyone else on the square goes back to Start. Not at Start, END or a crossroads (they hold several players),
   * and nobody on a stair step. `swapWith`: the player being swapped with (R10) is treated as captured (waiting turns,
   * trap and tries cleared) before taking the mover's old place, exactly as in the measured simulator; no capture event.
   */
  private capture(pi: number, sq: Pos, swapWith = -1): void {
    if (sq <= 0 || sq === this.index.end || this.index.isCrossroads(sq) || this.players[pi].onStair) return;
    this.players.forEach((q, i) => {
      if (i === pi || q.pos !== sq || q.onStair) return;
      q.pos = START; q.trapped = false; q.skip = 0; q.tries = 0; q.captured++; this.clearStairs(q);
      if (i !== swapWith) this.emit({ type: "capture", player: pi, victim: i, square: sq });
    });
  }

  // ---- Fallen tree (R19) ----

  private placeRoadblock(): void {
    const L = this.players[this.leader()];
    if (L.pos < 0 || isShortcut(L.pos)) return;
    const c: number[] = [];
    for (let k = L.pos + 1; k <= L.pos + this.board.rules.roadblock.range && k < this.index.end; k++)
      if (!this.index.tile(k) && !this.index.isCrossroads(k) && !this.players.some((q) => q.pos === k)) c.push(k);
    if (c.length) {
      this.roadblock = c[Math.floor(this.rand() * c.length)];
      this.emit({ type: "roadblockPlaced", square: this.roadblock });
    }
  }

  private hitRoadblock(pi: number): void {
    const p = this.players[pi];
    if (this.roadblock === null || p.pos !== this.roadblock) return;
    this.emit({ type: "roadblockHit", player: pi, square: this.roadblock });
    this.emit({ type: "roadblockRemoved", square: this.roadblock });
    this.roadblock = null;
    this.jumpTo(pi, Math.max(START, p.pos - this.board.rules.roadblock.back), "roadblock");
  }

  // ---- Event squares ----

  private trap(pi: number): void {
    const p = this.players[pi];
    if (p.jailPass > 0) { p.jailPass--; this.emit({ type: "bogBoots", player: pi }); }
    else { p.trapped = true; this.emit({ type: "trapped", player: pi, square: p.pos }); }
  }

  private *applyTile(pi: number, depth: number): Turn {
    const p = this.players[pi], t = this.index.tile(p.pos), square = p.pos;
    if (!t || depth > MAX_DEPTH || (t.requires === "snakeLeader" && !p.snakeLeader)) return;
    this.emit({ type: "tile", player: pi, square, tile: t });
    // R14: the bonus card, used once: avoid one of your own punishments, or cancel another player's reward.
    if (t.cat === "P" && p.bonus > 0 && (yield { kind: "bonusDefend", player: pi, square, tile: t })) {
      p.bonus--; this.emit({ type: "bonusUsed", player: pi, use: "defend", target: pi, square }); return;
    }
    if (t.cat === "R") {
      for (const q of this.players) {
        if (q.seat === pi || q.out || q.bonus <= 0) continue;
        if (yield { kind: "bonusAttack", player: q.seat, target: pi, square, tile: t }) {
          q.bonus--; this.emit({ type: "bonusUsed", player: q.seat, use: "attack", target: pi, square }); return;
        }
      }
    }
    yield* this.effect(pi, t, depth);
  }

  private *effect(pi: number, t: Tile, depth: number): Turn {
    const p = this.players[pi];
    switch (t.type) {
      case "skip": case "hospital":
        p.skip += t.turns!; this.emit({ type: "wait", player: pi, turns: t.turns! }); break;
      case "prison":
        this.trap(pi); break;
      case "slowNext":
        p.slow = true; this.emit({ type: "slowNext", player: pi }); break;
      case "card":
        if (t.card === "bonus") p.bonus++; else p.jailPass++;
        this.emit({ type: "card", player: pi, card: t.card! }); break;
      case "doubleOthers": {
        const others = this.players.filter((q) => q.seat !== pi);
        others.forEach((q) => { q.double = true; });
        this.emit({ type: "doubleNext", players: others.filter((q) => !q.out).map((q) => q.seat) });
        break;
      }
      case "extraRoll":
        yield* this.moveBy(pi, this.throwSequence(0), depth + 1); break;
      case "rollSum": {
        let n = 0;
        for (let i = 0; i < t.dice!; i++) n += this.throwDie();
        yield* this.moveBy(pi, n, depth + 1);
        break;
      }
      case "jump":
        this.jumpTo(pi, t.to!, "tile");
        if (t.grant === "snakeLeader") { p.snakeLeader = true; this.emit({ type: "snakeLeader", player: pi }); }
        if (t.then === "prison") this.trap(pi);
        if (t.then === "hospital") { p.skip += 3; this.emit({ type: "wait", player: pi, turns: 3 }); }
        if (t.then === "skip2") { p.skip += 2; this.emit({ type: "wait", player: pi, turns: 2 }); }
        break;
      case "nearest": { // R11: forward only, then do it
        let k = p.pos + 1;
        for (; k < this.index.end; k++) {
          const u = this.index.tile(k);
          if (u && u.cat === t.target && !u.requires) break;
        }
        if (k < this.index.end) { this.jumpTo(pi, k, "nearest"); yield* this.applyTile(pi, depth + 1); }
        break;
      }
      case "swapLeader": { // R10: change place with the player closest to END
        let best = -1;
        this.players.forEach((q, i) => {
          if (i !== pi && this.progress(q.pos) > this.progress(p.pos) && q.pos !== this.index.end
            && (best < 0 || this.progress(q.pos) > this.progress(this.players[best].pos))) best = i;
        });
        if (best >= 0) {
          const q = this.players[best], a = p.pos;
          this.emit({ type: "swap", player: pi, other: best });
          this.jumpTo(pi, q.pos, "swap", best);
          q.pos = a; this.clearStairs(q);
        }
        break;
      }
    }
  }

  private progress(pos: Pos): number {
    return this.index.progress(pos);
  }

  private emit(e: GameEvent): void {
    this.events.push(e);
  }
}

/** Plays one turn, answering every choice with `decide`. Returns the events of that turn. */
export function runTurn(game: Game, decide: Decider): GameEvent[] {
  const first = game.events.length, t = game.turn();
  for (let r = t.next(); !r.done; r = t.next(decide(r.value, game)));
  return game.events.slice(first);
}

/**
 * The computer player (GCD §8.6) = the simulator's "simple" player, so every measured number holds for it:
 * always the Main Road, the bonus card on its own next punishment, never against another player.
 */
export const simplePlayer: Decider = (d: Decision): Answer => {
  switch (d.kind) {
    case "road": return "main";
    case "bonusDefend": return true;
    case "bonusAttack": return false;
  }
};

// Board files: checking them against the frozen rules, and the place helpers (Main Road, Shortcut, progress).
import longJson from "../../data/board-long.json";
import shortJson from "../../data/board-short.json";
import type { Board, Fork, Pos, Tile, TileType } from "./types";

export const OFF: Pos = -1; // waiting at Home, not yet on the board (R1)
export const OUT: Pos = -2; // out of the game (R18)
export const START: Pos = 0;

const TILE_TYPES: readonly TileType[] = [
  "skip", "hospital", "prison", "slowNext", "card", "doubleOthers", "extraRoll", "rollSum", "jump", "nearest", "swapLeader",
];

/** The rule values the engine implements (GCD R1–R21). A board file with any other value is refused, not half-played. */
const FROZEN = {
  entry: "six",
  sixRule: "standard", // owner 15 Oct: every 6 gives one more throw, at most three 6s
  capture: true,
  endRule: "exact",
  bonusPolicy: "defend",
  stairs: true,
  lifeOnTriple: true,
  outAfterZero: true,
} as const;

/** Rule fields of the simulator that the frozen game does not use. Refused if switched on. */
const NOT_BUILT = [
  "lifelineSquares", "lifeOnSix", "lifeOnCapture", "lifeMax", "lifeOnEscape6", "lifeOnBackToStart",
  "lifeSpend", "lifeRest", "lifeRefuse", "types", "enterFaces",
];

function fail(id: string, msg: string): never {
  throw new Error(`Board "${id}": ${msg}`);
}

function checkTile(id: string, where: string, t: Tile, endTile: number): void {
  if (t.cat !== "R" && t.cat !== "P") fail(id, `${where}: unknown category ${String(t.cat)}`);
  if (!TILE_TYPES.includes(t.type)) fail(id, `${where}: unknown type ${String(t.type)}`);
  const num = (v: unknown) => typeof v === "number" && Number.isInteger(v);
  switch (t.type) {
    case "skip": case "hospital":
      if (!num(t.turns) || t.turns! < 1) fail(id, `${where}: ${t.type} needs turns`);
      break;
    case "card":
      if (t.card !== "bonus" && t.card !== "jailPass") fail(id, `${where}: unknown card ${String(t.card)}`);
      break;
    case "rollSum":
      if (!num(t.dice) || t.dice! < 1) fail(id, `${where}: rollSum needs dice`);
      break;
    case "jump":
      if (!num(t.to) || t.to! < 0 || t.to! >= endTile) fail(id, `${where}: jump needs a square 0..${endTile - 1}`);
      if (t.then !== undefined && !["prison", "hospital", "skip2"].includes(t.then)) fail(id, `${where}: unknown then ${t.then}`);
      break;
    case "nearest":
      if (t.target !== "R" && t.target !== "P") fail(id, `${where}: nearest needs target R or P`);
      break;
  }
  if (t.grant !== undefined && t.grant !== "snakeLeader") fail(id, `${where}: unknown badge ${t.grant}`);
  if (t.requires !== undefined && t.requires !== "snakeLeader") fail(id, `${where}: unknown badge ${t.requires}`);
}

/** Checks a board file and returns it typed. Throws on anything the engine does not implement. */
export function parseBoard(json: unknown): Board {
  const b = json as Board;
  const id = String(b?.id ?? "?");
  if (!Number.isInteger(b.lastTile) || b.endTile !== b.lastTile + 1) fail(id, "endTile must be lastTile + 1");
  const r = b.rules as unknown as Record<string, unknown>;
  if (!r) fail(id, "no rules");
  for (const [k, v] of Object.entries(FROZEN)) if (r[k] !== v) fail(id, `rule ${k} must be ${JSON.stringify(v)} (frozen), got ${JSON.stringify(r[k])}`);
  for (const k of NOT_BUILT) {
    const v = r[k];
    if (v !== undefined && v !== false && v !== 0 && !(Array.isArray(v) && v.length === 0) && v !== null)
      fail(id, `rule ${k} is not part of the frozen game`);
  }
  if (!Number.isInteger(b.rules.maxSixes) || b.rules.maxSixes < 1) fail(id, "maxSixes");
  if (!Number.isInteger(b.rules.lifelines) || b.rules.lifelines < 1) fail(id, "lifelines");
  const rb = b.rules.roadblock;
  if (!rb || !Number.isInteger(rb.back) || !Number.isInteger(rb.range)) fail(id, "roadblock needs back and range");
  for (const [k, t] of Object.entries(b.tiles)) {
    const sq = Number(k);
    if (!Number.isInteger(sq) || sq < 1 || sq > b.lastTile) fail(id, `tile ${k} is not a square`);
    checkTile(id, `tile ${k}`, t, b.endTile);
  }
  b.rules.forks.forEach((f: Fork, i) => {
    if (!(f.at > 0 && f.merge > f.at && f.merge <= b.lastTile && f.len >= 1)) fail(id, `fork ${i}: bad at / merge / len`);
    if (b.tiles[f.at]) fail(id, `fork ${i}: the crossroads ${f.at} must not be an event square`);
    for (const [k, t] of Object.entries(f.tiles)) {
      const n = Number(k);
      if (!Number.isInteger(n) || n < 1 || n > f.len) fail(id, `fork ${i}: Shortcut tile ${k} is outside 1..${f.len}`);
      checkTile(id, `fork ${i} tile ${k}`, t, b.endTile);
    }
  });
  return b;
}

export const BOARDS = {
  long: parseBoard(longJson),
  short: parseBoard(shortJson),
} as const;

export type BoardId = keyof typeof BOARDS;

// ---- Places ----

/** Square i (1..len) of the Shortcut of fork k. */
export const shortcutPos = (fork: number, i: number): Pos => 1000 * (fork + 1) + i;
export const isShortcut = (pos: Pos): boolean => pos > 1000;
/** For a Shortcut place: which fork and which Shortcut square. */
export const shortcutOf = (pos: Pos): { fork: number; index: number } => ({ fork: Math.floor(pos / 1000) - 1, index: pos % 1000 });

/** A board with its lookups prepared once. */
export class BoardIndex {
  readonly board: Board;
  readonly end: number;
  readonly forks: readonly Fork[];
  private readonly tiles = new Map<Pos, Tile>();
  /** The crossroads squares (R20). */
  readonly crossroads: ReadonlySet<number>;

  constructor(board: Board) {
    this.board = board;
    this.end = board.endTile;
    this.forks = board.rules.forks;
    for (const [k, t] of Object.entries(board.tiles)) this.tiles.set(Number(k), t);
    this.forks.forEach((f, k) => { for (const [i, t] of Object.entries(f.tiles)) this.tiles.set(shortcutPos(k, Number(i)), t); });
    this.crossroads = new Set(this.forks.map((f) => f.at));
  }

  tile(pos: Pos): Tile | undefined {
    return this.tiles.get(pos);
  }

  isCrossroads(pos: Pos): boolean {
    return this.crossroads.has(pos);
  }

  /** Index of the fork whose crossroads is `pos`, or -1. */
  forkAt(pos: Pos): number {
    return this.forks.findIndex((f) => f.at === pos);
  }

  /** Place in the race (who is ahead): a Shortcut square counts as its share of the Main Road it replaces. */
  progress(pos: Pos): number {
    if (!isShortcut(pos)) return pos;
    const { fork, index } = shortcutOf(pos);
    const f = this.forks[fork];
    return f.at + (index * (f.merge - f.at)) / (f.len + 1);
  }
}

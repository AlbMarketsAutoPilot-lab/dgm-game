// Types of the frozen board files (data/board-long.json, data/board-short.json) and of a game in progress.
// Rules: docs/GCD.md §8.2a (R1–R16) and §8.2b (R17–R21).

/** "R" = reward (good for the player who lands), "P" = punishment. */
export type Category = "R" | "P";

export type TileType =
  | "skip" // wait `turns` turns
  | "hospital" // R7: wait `turns` turns (paper "Hospital", story: the fog)
  | "prison" // R6: the trap (story: the Bog)
  | "slowNext" // R9 (long 15): next turn move exactly 1
  | "card" // R14 bonus card, or the free pass (Bog boots)
  | "doubleOthers" // R9 (long 143): every other player doubles their next throw
  | "extraRoll" // throw again (a full throw with the sixes rule)
  | "rollSum" // R9 (long 45, 123): throw `dice` times, one move by the total
  | "jump" // go to `to` (ladder, snake, "go to X"); optional `then` and badge
  | "nearest" // R11: to the nearest square of category `target`, forward only, then do it
  | "swapLeader"; // R10: change place with the player closest to END

export type CardKind = "bonus" | "jailPass";

export interface Tile {
  cat: Category;
  type: TileType;
  /** skip / hospital: turns to wait. */
  turns?: number;
  /** jump: destination square. */
  to?: number;
  /** jump: what happens after landing. */
  then?: "prison" | "hospital" | "skip2";
  /** jump: badge given (the Snake Leader, long 138 / short 69). */
  grant?: "snakeLeader";
  /** The square only works for the holder of this badge (long 202 / short 100). */
  requires?: "snakeLeader";
  card?: CardKind;
  /** rollSum: number of throws. */
  dice?: number;
  /** nearest: the category looked for. */
  target?: Category;
  /** The paper's original words. */
  text: string;
  /** Story text (GCD §9.2) and icon name. Absent on the Shortcut tiles: their story is in `board.story.roads`. */
  story?: string;
  icon?: string;
}

/** R20: a crossroads. The Shortcut has `len` squares and meets the Main Road again at `merge`. */
export interface Fork {
  at: number;
  merge: number;
  len: number;
  /** Shortcut squares by their number on the Shortcut (1..len). */
  tiles: Record<string, Tile>;
}

/** The rule fields of a board file. Only the frozen values are accepted (see `parseBoard`). */
export interface BoardRules {
  entry: "six";
  sixRule: "owner";
  maxSixes: number;
  capture: true;
  endRule: "exact";
  bonusPolicy: "defend";
  stairs: true;
  lifelines: number;
  lifeOnTriple: true;
  outAfterZero: true;
  roadblock: { back: number; range: number };
  forks: Fork[];
  /** Replaced by R17 (stairs); kept in the files only so older reports can be reproduced. Ignored. */
  enterAfter?: number;
  trapAfter?: number;
}

export interface Board {
  id: string;
  description?: string;
  /** Last numbered square (long 202, short 100). */
  lastTile: number;
  /** END (long 203, short 101). */
  endTile: number;
  /** Event squares by square number. */
  tiles: Record<string, Tile>;
  rules: BoardRules;
  /** Names, texts and icons of the journey (GCD §9.2, §10.1). Not used by the rules. */
  story: BoardStory;
}

export interface BoardStory {
  title: string;
  destination: string;
  regions: { name: string; from: number; to: number }[];
  trap: { tile: number; name: string; icon: string };
  landmarks: Record<string, { name: string; icon: string }>;
  [key: string]: unknown;
}

/**
 * A token's place. Numbers keep the simulator's encoding so the two engines can be compared game by game:
 * -1 = not yet on the board (waiting at Home), -2 = out of the game, 0 = the Start square, 1..lastTile = squares,
 * endTile = END, and square i (1..len) of the Shortcut of fork k is 1000 × (k + 1) + i (see `board.ts`).
 */
export type Pos = number;

/** One place a token walks through. `stair` = number of the stair step (R17) on top of the square, 0 = the square. */
export interface Spot {
  pos: Pos;
  stair: number;
}

export type Road = "main" | "shortcut";

export interface PlayerState {
  seat: number;
  pos: Pos;
  /** Turns still to wait (skip, hospital, "wait 2"). */
  skip: number;
  /** In the trap (R6). */
  trapped: boolean;
  /** Failed throws so far at Home or in the trap (R17: 0, 1 or 2). */
  tries: number;
  /** R9: next turn move exactly 1. */
  slow: boolean;
  /** R9: next throw is doubled. */
  double: boolean;
  /** Snake Leader badge. */
  snakeLeader: boolean;
  /** Bonus cards held (R14). */
  bonus: number;
  /** Free passes (Bog boots) held: used by themselves when the trap would catch the player. */
  jailPass: number;
  /** R18 lifelines (story: Lanterns). Can reach 0 and the player still plays; the next loss is out. */
  lanterns: number;
  out: boolean;
  /** R17 stair steps still to walk, on top of square `stairAt`; `stairTotal` = steps built. */
  stairAt: number;
  stairLeft: number;
  stairTotal: number;
  /** Standing on a stair step (no event, no capture). */
  onStair: boolean;
  /** Road chosen at the crossroads for this turn's move (R20). */
  road: Road | null;
  /** Times sent back to Start by another player (statistics; counted exactly as the simulator counts it). */
  captured: number;
}

/** A choice the engine needs from a player (R21: only the road and the bonus card). */
export type Decision =
  | { kind: "road"; player: number; fork: number; square: number }
  | { kind: "bonusDefend"; player: number; square: Pos; tile: Tile }
  | { kind: "bonusAttack"; player: number; target: number; square: Pos; tile: Tile };

/** The answer to a Decision: a Road for "road", true / false (use the card or not) for the bonus card. */
export type Answer = Road | boolean;

export type Decider = (decision: Decision, game: Readonly<GameView>) => Answer;

/** What a decider may look at. */
export interface GameView {
  board: Board;
  players: readonly PlayerState[];
  round: number;
  roadblock: number | null;
}

export type GameEvent =
  | { type: "round"; round: number }
  | { type: "roadblockPlaced"; square: number }
  | { type: "roadblockRemoved"; square: number }
  | { type: "turn"; player: number }
  | { type: "roll"; player: number; value: number }
  | { type: "skipTurn"; player: number; turnsLeft: number }
  /** R17: a throw without a 6 at Home ("start") or in the trap; one stair step added. */
  | { type: "noSix"; player: number; where: "start" | "trap"; tries: number }
  /** R1 / R6 / R17: the player leaves Home or the trap; `bySix` false = third throw, moving anyway. */
  | { type: "released"; player: number; where: "start" | "trap"; bySix: boolean; stairs: number }
  | { type: "road"; player: number; fork: number; road: Road }
  /** A move by a throw, square by square. `crossroads` = stopped at a crossroads with squares left (R20). */
  | { type: "move"; player: number; from: Pos; to: Pos; path: Spot[]; crossroads: boolean }
  /** R8: the total passes END, the token stays. */
  | { type: "overshoot"; player: number; squares: number }
  | { type: "tile"; player: number; square: Pos; tile: Tile }
  /** A move by an event, along its ladder or snake drawing. */
  | { type: "jump"; player: number; from: Pos; to: Pos; cause: "tile" | "roadblock" | "nearest" | "swap" }
  | { type: "capture"; player: number; victim: number; square: Pos }
  | { type: "roadblockHit"; player: number; square: number }
  | { type: "trapped"; player: number; square: Pos }
  | { type: "bogBoots"; player: number }
  | { type: "card"; player: number; card: CardKind }
  | { type: "bonusUsed"; player: number; use: "defend" | "attack"; target: number; square: Pos }
  | { type: "wait"; player: number; turns: number }
  | { type: "slowNext"; player: number }
  | { type: "doubleNext"; players: number[] }
  | { type: "snakeLeader"; player: number }
  | { type: "swap"; player: number; other: number }
  | { type: "lanternLost"; player: number; left: number }
  | { type: "lanternWon"; player: number; total: number }
  | { type: "out"; player: number }
  | { type: "win"; player: number; lastStanding: boolean };

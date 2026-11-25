// Types of a v3 destination file (data/lantern-festival.json). Rules: docs/GCD.md §8.2a R1–R20 (owner, 25 Nov 2026).
// Step I phase A: built next to the v2 engine (src/engine/*.ts), which the app still uses until phase C.

/** R = reward (green ▲), P = punishment (red ▼), S = the Swap Market (blue ◆). */
export type Category3 = "R" | "P" | "S";

export type TileType3 =
  | "slowNext" // R9: next turn move exactly 1 square
  | "jump" // a fixed move to `to` (at most rules.maxEventJump squares, never onto another event square, R8)
  | "tree" // R6: the fallen tree
  | "card" // R14: a Bonus card
  | "nearest" // R11: forward to the next square of category `target`, and it applies
  | "swapLeader" // R10: Plot Twist
  | "rollSum" // R9: throw `dice` times, one move by the total
  | "dragonBoat" // R17: forward to `to`; next played turn the die must show exactly `need`
  | "doubleOthers" // R9: every other player's next roll counts double
  | "swapMarket"; // R18

export interface Tile3 {
  cat: Category3;
  type: TileType3;
  to?: number;
  then?: "skip2";
  target?: "R" | "P";
  dice?: number;
  need?: number;
  /** Working label, never shown to players (the story comes in phase B). */
  name: string;
}

export type AreaEffect =
  | { type: "gifted6" }
  | { type: "backward" }
  | { type: "double" }
  | { type: "swapAhead"; range: number; otherwise: "card" }
  | { type: "swapBehind"; range: number; otherwise: "loseTurn" };

export interface Area {
  name: string;
  from: number;
  to: number;
  effect: AreaEffect | null;
}

export interface Rules3 {
  version: 3;
  startCards: number;
  capture: true;
  endRule: "exact";
  maxEventJump: number;
  /** R20: on its throw number `robotForceAfter` at Home or at the tree without a 6, a robot must use its Bonus card (if it has one) and moves by that throw. */
  robotForceAfter: number;
}

export interface Board3 {
  id: string;
  description: string;
  lastTile: number;
  endTile: number;
  rules: Rules3;
  areas: Area[];
  tiles: Record<string, Tile3>;
}

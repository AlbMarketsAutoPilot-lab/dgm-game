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
  /** Working label, never shown to players. */
  name: string;
  /** Phase B texts (owner-approved, shown to people only): the square's title and Mr. Lin's story. */
  title?: string;
  guide?: string;
  /** Picture name (src/render). */
  icon?: string;
  /** Own notification, only where the shared pattern (`Board3.notes`) does not fit. */
  note?: string;
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
  /** Phase B texts: the area sign's picture and the guide's announcement (owner, 26 Nov 2026: one text with a saying that also tells the effect). `effectText` is kept for a separate effect text, unused so far. */
  icon?: string;
  announce?: string;
  effectText?: string;
  /** Step I phase F: where a traveller stands, as Mr. Lin says it ("in the Mountains", "at the Seaside"). */
  at?: string;
}

/** A named plain square (no event). */
export interface Landmark {
  name: string;
  icon?: string;
}

/** The story moments tied to places (owner, 25 Nov 2026: phase B writes them; buttons and tips come in C/E/F). */
export const MOMENT_KEYS = [
  "home", "backHome", "freeToGo", "treeStuck", "boatWait", "boatMiss", "boatWin", "swapMarket", "finish",
] as const;
export type MomentKey = (typeof MOMENT_KEYS)[number];

/**
 * Mr. Lin's words when a person passes the die (owner, Step I phase F, 27 Nov 2026): where they stand (road, Home, the
 * fallen tree, the Dragon Boat), then the others (nearest ahead and behind, leading, last, nobody left Home).
 * Placeholders: {a} the area's `at`, {n} a distance; {q} / {n} the nearest ahead, {b} / {m} the nearest behind.
 */
export const STANDING_KEYS = ["road", "home", "tree", "boat", "both", "leader", "last", "othersHome", "noneLeft"] as const;
export type StandingKey = (typeof STANDING_KEYS)[number];

export interface Moment {
  title?: string;
  guide?: string;
  note?: string;
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
  /** Phase B: the destination's name and picture, and the guide. */
  destination?: { name: string; icon?: string };
  guide?: { name: string };
  /** Notification patterns, one per kind of square; {p} = the player, {q} = the other player, {n} = a distance in squares. */
  notes?: Record<string, string>;
  landmarks?: Record<string, Landmark>;
  moments?: Partial<Record<MomentKey, Moment>>;
  standing?: Partial<Record<StandingKey, string>>;
}

// What the game screen says about a player's next move: the "needs N" tag, the turn line, the die faces on the board
// and "gets here with a N" in a tapped square's box (audit of 27 Nov 2026, B5–B8 and B13: they must follow a doubled
// roll, "exactly 1 square", the Forest's backward move and the fallen tree as the engine does). Pure functions, so the
// tests can check them against the engine.
import type { Board3, Player3 } from "../engine/v3";

type Next = Pick<Player3, "home" | "stuck" | "skip" | "slow" | "dbl" | "back" | "boat">;

/** The Dragon Boat's number (R17): the die must show exactly this. */
export const boatNeed = (b: Board3): number => Object.values(b.tiles).find((t) => t.type === "dragonBoat")?.need ?? 4;

/** Waiting for a 6: at Home before the first start, or at the fallen tree (unless the Forest's backward move frees it, R6). */
export const needsSix = (p: Next, pos: number): boolean => (pos <= 0 && p.home) || (p.stuck && !p.back);

/** Whether the next move is one plain throw forward (no missed turn, no boat, no 6 needed, not exactly 1, not backward). */
export const plainThrow = (p: Next, pos: number): boolean => !(p.skip > 0 || p.boat || needsSix(p, pos) || p.stuck || p.slow || p.back);

/** The die face that moves a plain throw exactly `steps` squares (a doubled roll moves twice the face), or 0. A 6 never
 * stops: it always rolls again (R2), so only 1–5. */
export function faceFor(steps: number, dbl: boolean): number {
  const f = dbl ? (steps % 2 === 0 ? steps / 2 : 0) : steps;
  return f >= 1 && f <= 5 ? f : 0;
}

/** The face that finishes from `pos` with the player's next roll (a missed turn waits, the roll is the same), or 0. */
export function finishFace(b: Board3, p: Next, pos: number): number {
  if (pos < 1 || pos >= b.endTile || p.boat || p.stuck || p.slow || p.back) return 0;
  return faceFor(b.endTile - pos, p.dbl);
}

/** The tag on the avatar: "needs 6", the boat's number, the face that finishes, or nothing. */
export function needTag(b: Board3, p: Next, pos: number): string {
  if (needsSix(p, pos)) return "needs 6";
  if (p.boat) return `needs ${boatNeed(b)}`;
  const f = finishFace(b, p, pos);
  return f ? `needs ${f}` : "";
}

/** The face that brings the current player from `from` to `pos` this turn, or 0 (not one plain throw away). */
export const reachFace = (p: Next, from: number, pos: number): number => (plainThrow(p, from) ? faceFor(pos - from, p.dbl) : 0);

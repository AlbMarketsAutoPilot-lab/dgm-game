// Mr. Lin's words when a person passes the die to another person (owner, Step I phase F, 27 Nov 2026): where the player
// who just played stands (on the road, at Home, at the fallen tree, on the Dragon Boat), then the nearest traveller
// ahead and behind. Players still at Home are not "behind". Two sentences, from the destination's `standing` texts
// (approved word for word; checked by the board check): {a} the area's "at", {n} a distance; {q} / {n} the nearest
// ahead, {b} / {m} the nearest behind. "1 squares" is said "1 square" ("1 square still lies").
import type { Board3 } from "../engine/v3";
import { esc } from "../render/html";

/**
 * `places`: every player's square (0 = Home), as on screen; `name(i)`: a player's name as HTML (escaped).
 * Returns HTML: the texts escaped, the names as given.
 */
export function standingWords(board: Board3, seat: number, places: readonly number[], at: { boat: boolean; stuck: boolean }, name: (i: number) => string): string {
  const S = board.standing ?? {}, pos = places[seat];
  const area = board.areas.find((a) => pos >= a.from && pos <= a.to);
  // one square: "1 square", and "1 square still lies" (owner, 27 Nov 2026)
  const one = (s: string) => s.replace(/\b1 squares\b/g, "1 square").replace(/\b1 square still lie\b/g, "1 square still lies");
  const first = at.boat ? S.boat : at.stuck ? S.tree : pos <= 0 ? S.home : S.road;
  const others = places.map((q, i) => ({ q, i })).filter((o) => o.i !== seat && o.q > 0);
  const ahead = others.filter((o) => o.q > pos).sort((x, y) => x.q - y.q)[0];
  const behind = others.filter((o) => o.q < pos).sort((x, y) => y.q - x.q)[0];
  const second = !others.length ? (pos > 0 ? S.othersHome : S.noneLeft) : ahead && behind ? S.both : behind ? S.leader : S.last;
  const where = (s?: string) => (s ? one(esc(s).replace(/\{a\}/g, esc(area?.at ?? "")).replace(/\{n\}/g, String(board.endTile - pos))) : "");
  const others2 = (s?: string) => (s ? one(esc(s)
    .replace(/\{q\}/g, ahead ? name(ahead.i) : "").replace(/\{n\}/g, ahead ? String(ahead.q - pos) : "")
    .replace(/\{b\}/g, behind ? name(behind.i) : "").replace(/\{m\}/g, behind ? String(pos - behind.q) : "")) : "");
  return [where(first), others2(second)].filter(Boolean).join(" ");
}

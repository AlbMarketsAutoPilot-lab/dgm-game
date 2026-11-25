// A v3 destination file: checked against the rules the engine implements (GCD §8.2a R1–R20), refused otherwise.
import lanternJson from "../../../data/lantern-festival.json";
import type { Area, Board3, Tile3, TileType3 } from "./types";

const TYPES: readonly TileType3[] = [
  "slowNext", "jump", "tree", "card", "nearest", "swapLeader", "rollSum", "dragonBoat", "doubleOthers", "swapMarket",
];
const EFFECTS = ["gifted6", "backward", "double", "swapAhead", "swapBehind"];

function fail(id: string, msg: string): never {
  throw new Error(`Destination "${id}": ${msg}`);
}

const int = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/** Checks a v3 destination file and returns it typed. Throws on anything the v3 engine does not implement. */
export function parseBoard3(json: unknown): Board3 {
  const b = json as Board3;
  const id = String(b?.id ?? "?");
  if (b.lastTile !== 100 || b.endTile !== 101) fail(id, "every destination is Home + 100 squares + the finish (101)");
  const r = b.rules;
  if (!r || r.version !== 3) fail(id, "rules.version must be 3");
  if (r.capture !== true || r.endRule !== "exact") fail(id, "capture must be true and endRule exact (R4, R7)");
  for (const k of ["startCards", "maxEventJump", "robotForceAfter"] as const) if (!int(r[k]) || r[k] < 1) fail(id, `rules.${k} must be a whole number ≥ 1`);

  // R15: areas follow each other with no gap from Home (0) to the last square; the first (Home Town) has no effect.
  const areas: Area[] = b.areas;
  if (!Array.isArray(areas) || areas.length < 2) fail(id, "at least two areas");
  let next = 0;
  for (const a of areas) {
    if (a.from !== next || !int(a.to) || a.to < a.from) fail(id, `area ${a.name}: must start at ${next}`);
    next = a.to + 1;
    if (a.effect === null) continue;
    if (!EFFECTS.includes(a.effect.type)) fail(id, `area ${a.name}: unknown effect ${String(a.effect.type)}`);
    if (a.effect.type === "swapAhead" || a.effect.type === "swapBehind") {
      if (!int(a.effect.range) || a.effect.range < 1) fail(id, `area ${a.name}: a swap needs a range`);
      const other = a.effect.type === "swapAhead" ? "card" : "loseTurn";
      if (a.effect.otherwise !== other) fail(id, `area ${a.name}: otherwise must be ${other}`);
    }
  }
  if (next !== b.endTile) fail(id, `areas must end at square ${b.lastTile}`);
  if (areas[0].effect !== null) fail(id, "the first area (Home Town) has no effect");

  const tiles = Object.entries(b.tiles).map(([k, t]) => [Number(k), t] as [number, Tile3]);
  const isEvent = new Set(tiles.map(([sq]) => sq));
  let trees = 0, boats = 0;
  for (const [sq, t] of tiles) {
    const where = `square ${sq}`;
    if (!int(sq) || sq < 1 || sq > b.lastTile) fail(id, `${where} is not a square`);
    if (t.cat !== "R" && t.cat !== "P" && t.cat !== "S") fail(id, `${where}: unknown category ${String(t.cat)}`);
    if (!TYPES.includes(t.type)) fail(id, `${where}: unknown type ${String(t.type)}`);
    if (!t.name) fail(id, `${where}: needs a working name`);
    switch (t.type) {
      case "jump": {
        // R8: a fixed jump moves at most maxEventJump squares and never onto another event square (or Home).
        if (!int(t.to) || t.to < 1 || t.to > b.lastTile) fail(id, `${where}: jump needs a square 1..${b.lastTile}`);
        if (Math.abs(t.to - sq) > r.maxEventJump) fail(id, `${where}: jump of ${Math.abs(t.to - sq)} squares (at most ${r.maxEventJump})`);
        if (isEvent.has(t.to)) fail(id, `${where}: jumps onto event square ${t.to}`);
        if (t.then !== undefined && t.then !== "skip2") fail(id, `${where}: unknown then ${String(t.then)}`);
        break;
      }
      case "dragonBoat":
        // R17: an exception to the 20-square limit; from `to` the die must show exactly `need` to finish.
        if (!int(t.to) || !int(t.need) || t.need < 1 || t.need > 5 || t.to + t.need !== b.endTile) fail(id, `${where}: the boat's square + need must be the finish`);
        if (t.to <= sq || isEvent.has(t.to)) fail(id, `${where}: the boat goes forward to a plain square`);
        boats++;
        break;
      case "rollSum":
        if (!int(t.dice) || t.dice < 1) fail(id, `${where}: rollSum needs dice`);
        break;
      case "nearest":
        if (t.target !== "R" && t.target !== "P") fail(id, `${where}: nearest needs target R or P`);
        break;
      case "tree":
        trees++;
        break;
    }
  }
  if (trees !== 1) fail(id, `exactly one fallen tree (found ${trees})`);
  if (boats > 1) fail(id, "at most one Dragon Boat");
  return b;
}

export const DESTINATIONS = {
  "lantern-festival": parseBoard3(lanternJson),
} as const;

/** The area a square (0 = Home .. lastTile) belongs to. */
export function areaOf(b: Board3, sq: number): Area {
  const a = b.areas.find((x) => sq >= x.from && sq <= x.to);
  if (!a) throw new Error(`square ${sq} is in no area`);
  return a;
}

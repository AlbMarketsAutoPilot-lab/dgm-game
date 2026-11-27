// A v3 destination file: checked against the rules the engine implements (GCD §8.2a R1–R20), refused otherwise.
import lanternJson from "../../../data/lantern-festival.json";
import { MOMENT_KEYS, STANDING_KEYS } from "./types";
import type { Area, Board3, Tile3, TileType3 } from "./types";

const TYPES: readonly TileType3[] = [
  "slowNext", "jump", "tree", "card", "nearest", "swapLeader", "rollSum", "dragonBoat", "doubleOthers", "swapMarket",
];
const EFFECTS = ["gifted6", "backward", "double", "swapAhead", "swapBehind"];

function fail(id: string, msg: string): never {
  throw new Error(`Destination "${id}": ${msg}`);
}

const int = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/** Owner rules for every text a player sees (phase B, 25 Nov 2026). */
export const TEXT_LIMITS = { noteChars: 50, guideSentences: 2 } as const;

/** Sentences in a text ("Mr." is not a sentence end). */
export const sentences = (s: string): number => (s.replace(/\bMr\. /g, "Mr ").match(/[.!?]+["”’)]?(\s|$)/g) ?? []).length;

/**
 * Checks one text: not empty; no square numbers (any number above 6; die numbers 1–6 are allowed); only the
 * placeholders {p}, {q} and {n}; a notification at most TEXT_LIMITS.noteChars characters; a guide text at most
 * TEXT_LIMITS.guideSentences sentences.
 */
function checkText(id: string, where: string, s: unknown, kind: "name" | "guide" | "note", marks = ["{p}", "{q}", "{n}"]): void {
  if (typeof s !== "string" || !s.trim()) fail(id, `${where}: text must not be empty`);
  for (const m of s.match(/\d+/g) ?? []) if (Number(m) > 6) fail(id, `${where}: no square numbers in texts (found ${m})`);
  for (const m of s.match(/\{[^}]*\}/g) ?? []) if (!marks.includes(m)) fail(id, `${where}: unknown placeholder ${m}`);
  if (kind === "note" && s.length > TEXT_LIMITS.noteChars) fail(id, `${where}: a notification has at most ${TEXT_LIMITS.noteChars} characters (${s.length})`);
  if (kind === "guide" && sentences(s) > TEXT_LIMITS.guideSentences) fail(id, `${where}: a guide text has at most ${TEXT_LIMITS.guideSentences} sentences`);
}

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
    if (t.title !== undefined) checkText(id, `${where} title`, t.title, "name");
    if (t.guide !== undefined) checkText(id, `${where} guide`, t.guide, "guide");
    if (t.note !== undefined) checkText(id, `${where} note`, t.note, "note");
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

  // Phase B texts (owner, 25 Nov 2026).
  for (const a of areas) {
    if (a.announce !== undefined) checkText(id, `area ${a.name} announce`, a.announce, "guide");
    if (a.at !== undefined) checkText(id, `area ${a.name} at`, a.at, "name");
    if (a.effectText !== undefined) {
      if (a.effect === null) fail(id, `area ${a.name}: effect text without an effect`);
      checkText(id, `area ${a.name} effectText`, a.effectText, "guide");
    }
  }
  if (b.destination !== undefined) checkText(id, "destination name", b.destination.name, "name");
  if (b.guide !== undefined) checkText(id, "guide name", b.guide.name, "name");
  for (const [k, s] of Object.entries(b.notes ?? {})) checkText(id, `notes.${k}`, s, "note");
  for (const [k, l] of Object.entries(b.landmarks ?? {})) {
    const sq = Number(k);
    if (!int(sq) || sq < 1 || sq > b.lastTile) fail(id, `landmark ${k} is not a square`);
    if (isEvent.has(sq)) fail(id, `landmark ${k} is on an event square`);
    checkText(id, `landmark ${k} name`, l.name, "name");
  }
  for (const [k, m] of Object.entries(b.moments ?? {})) {
    if (!(MOMENT_KEYS as readonly string[]).includes(k)) fail(id, `unknown moment ${k}`);
    if (m.title !== undefined) checkText(id, `moment ${k} title`, m.title, "name");
    if (m.guide !== undefined) checkText(id, `moment ${k} guide`, m.guide, "guide");
    if (m.note !== undefined) checkText(id, `moment ${k} note`, m.note, "note");
  }
  // Step I phase F: Mr. Lin's words when a person passes the die (one sentence each: two are said together)
  for (const [k, t] of Object.entries(b.standing ?? {})) {
    if (!(STANDING_KEYS as readonly string[]).includes(k)) fail(id, `unknown standing text ${k}`);
    checkText(id, `standing ${k}`, t, "guide", ["{a}", "{n}", "{q}", "{b}", "{m}"]);
    if (sentences(t) > 1) fail(id, `standing ${k}: one sentence (two are said together)`);
  }
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

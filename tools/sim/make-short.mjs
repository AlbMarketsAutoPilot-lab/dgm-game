// Builds the short board (Start + 1-100 + END) by scaling the long journey to half length.
// Same story and chapters; positions and jump targets are scaled, collisions are moved to the next free tile.
// Usage: node tools/sim/make-short.mjs  (reads data/board-v1-long.json, writes data/board-v1-short.json)
import { readFileSync, writeFileSync } from "node:fs";

const long = JSON.parse(readFileSync("data/board-v1-long.json", "utf8"));
const LAST = 100, f = LAST / long.lastTile;
const sc = (x) => (x === 0 ? 0 : Math.max(1, Math.min(LAST, Math.round(x * f))));

const scaleEffect = (e) => {
  if (!e || typeof e !== "object") return e;
  const o = { ...e };
  if (typeof o.to === "number") o.to = sc(o.to);
  for (const k of ["then", "win", "lose"]) if (o[k]) o[k] = scaleEffect(o[k]);
  if (o.options) o.options = o.options.map(scaleEffect);
  return o;
};

const tiles = {};
const order = Object.keys(long.tiles).map(Number).sort((a, b) => a - b);
for (const p of order) {
  let q = sc(p);
  while (tiles[q] && q < LAST) q++;
  if (tiles[q]) continue;
  const t = scaleEffect(long.tiles[p]);
  tiles[q] = { ...t, longTile: p };
}
// Remove effects that became no-ops (jump to itself) after scaling.
for (const [k, t] of Object.entries(tiles)) if (t.type === "jump" && t.to === +k) delete tiles[k];

const short = {
  ...long,
  id: "v1-short",
  description: "Short board: Start + tiles 1-100 + END (101 tiles after Start). Same journey as v1-long, scaled to half length by tools/sim/make-short.mjs.",
  lastTile: LAST,
  endTile: LAST + 1,
  chapters: long.chapters.map((c) => ({ ...c, from: sc(c.from), to: c.to >= long.endTile ? LAST + 1 : sc(c.to) })),
  tiles,
};
writeFileSync("data/board-v1-short.json", JSON.stringify(short, null, 1));
console.log(Object.entries(tiles).map(([k, t]) => `${k}${t.to !== undefined ? "→" + t.to : ""}(${t.longTile})`).join(" "));

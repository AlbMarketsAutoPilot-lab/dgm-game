// Sanity tests for the excitement measures on tiny boards where the right answer is known.
import { loadBoard, simulate } from "../engine.mjs";
let fail = 0;
const ok = (name, cond, got) => { console.log(`${cond ? "PASS" : "FAIL"} ${name} (got ${JSON.stringify(got)})`); if (!cond) fail++; };
const base = { lastTile: 100, endTile: 101 };

// 1. Empty board: no jumps at all.
let r = simulate(loadBoard({ ...base, tiles: {} }), { players: 4 }, 2000, 1).excitement;
ok("empty board has no jackpots/falls", r.jackpotsPerGame === 0 && r.fallsPerGame === 0, r);

// 2. Tiles 1-6 all jump to 50: every player's first throw is a jackpot (>= 10 squares).
const jackTiles = Object.fromEntries([1, 2, 3, 4, 5, 6].map((k) => [k, { cat: "B", type: "jump", to: 50 }]));
r = simulate(loadBoard({ ...base, tiles: jackTiles }), { players: 4 }, 2000, 2).excitement;
ok("jackpot on first throw: 100% of games, >= 4 per game", r.pctGamesWithJackpot === 100 && r.jackpotsPerGame >= 4, r);

// 3. A fall: tile 60 sends back to 10 (50 squares).
r = simulate(loadBoard({ ...base, tiles: { 60: { cat: "S", type: "jump", to: 10 } } }), { players: 4 }, 2000, 3).excitement;
ok("fall tile produces falls", r.fallsPerGame > 0 && r.jackpotsPerGame === 0, r);

// 4. Close finish % and finish gap are within valid ranges.
ok("close finish in 0..100 and gap >= 1", r.pctCloseFinish >= 0 && r.pctCloseFinish <= 100 && r.avgFinishGap >= 1, r);

// 5. One player: the first into the last quarter always wins.
r = simulate(loadBoard({ ...base, tiles: {} }), { players: 1 }, 500, 4).excitement;
ok("1 player: first into last quarter wins 100%", r.winIfFirstIntoLastQuarter === 100, r.winIfFirstIntoLastQuarter);

process.exit(fail ? 1 : 0);

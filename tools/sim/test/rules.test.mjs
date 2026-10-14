// Rule tests with scripted dice: each test checks one owner rule from docs/GCD.md §8.2a.
// Run: node tools/sim/test/rules.test.mjs
import { simulate } from "../engine.mjs";

const board = (tiles = {}) => ({ id: "test", lastTile: 202, endTile: 203, tiles });
const OFF = -1;
let fail = 0;
function play(name, { tiles, dice, setup, turns, rules = {}, players = 2 }, check) {
  const r = simulate(board(tiles), { players, diceScript: dice, setup, turns, ...rules }, 1, 1);
  const res = check(r.players);
  console.log(`${res === true ? "PASS" : "FAIL"}  ${name}${res === true ? "" : "  -> " + res}`);
  if (res !== true) fail++;
}
const eq = (got, want, what) => (got === want ? true : `${what}: got ${got}, want ${want}`);

// R1 entering
play("R1 no 6: stays off the board", { dice: [3], turns: 1 }, (P) => eq(P[0].pos, OFF, "pos"));
play("R1 6 enters Start, extra throw moves from Start (6, 4 -> square 4)", { dice: [6, 4], turns: 1 }, (P) => eq(P[0].pos, 4, "pos"));
play("R1+R2 enter 6, then 6, 6 -> third six: move 12, turn ends", { dice: [6, 6, 6], turns: 1 }, (P) => eq(P[0].pos, 12, "pos"));
// R2 sixes (owner rule)
play("R2 normal throw 4 -> 4 squares", { dice: [4], setup: [{ pos: 10 }], turns: 1 }, (P) => eq(P[0].pos, 14, "pos"));
play("R2 6, 3 -> 9 squares", { dice: [6, 3], setup: [{ pos: 10 }], turns: 1 }, (P) => eq(P[0].pos, 19, "pos"));
play("R2 owner example 6, 6, 1, 5 -> 18 squares", { dice: [6, 6, 1, 5], setup: [{ pos: 10 }], turns: 1 }, (P) => eq(P[0].pos, 28, "pos"));
play("R2 6, 6, 6 -> 18 squares and stop", { dice: [6, 6, 6], setup: [{ pos: 10 }], turns: 1 }, (P) => eq(P[0].pos, 28, "pos"));
// R3 passing over has no effect
play("R3 passing over an event square does nothing", { tiles: { 12: { cat: "P", type: "jump", to: 0 } }, dice: [5], setup: [{ pos: 10 }], turns: 1 }, (P) => eq(P[0].pos, 15, "pos"));
// R4 capture
play("R4 landing on a player sends them to Start", { dice: [3], setup: [{ pos: 10 }, { pos: 13 }], turns: 1 }, (P) => eq(P[1].pos, 0, "captured pos") === true ? eq(P[0].pos, 13, "mover") : "not captured");
play("R4 capture also by a jump", { tiles: { 12: { cat: "R", type: "jump", to: 40 } }, dice: [2], setup: [{ pos: 10 }, { pos: 40 }], turns: 1 }, (P) => eq(P[1].pos, 0, "captured pos"));
play("R4 passing over a player does not capture", { dice: [5], setup: [{ pos: 10 }, { pos: 12 }], turns: 1 }, (P) => eq(P[1].pos, 12, "other pos"));
play("R4 Start holds several players (a captured player joins one already on Start)", { dice: [3], setup: [{ pos: 10 }, { pos: 13 }, { pos: 0 }], turns: 1, players: 3 }, (P) => (P[1].pos === 0 && P[2].pos === 0 ? true : `positions ${P[1].pos}, ${P[2].pos}`));
// R5 back on Start moves without a 6
play("R5 captured player moves next turn without a 6", { dice: [3, 2], setup: [{ pos: 10 }, { pos: 13 }], turns: 2 }, (P) => eq(P[1].pos, 2, "pos"));
// R6 trap
const trapTiles = { 30: { cat: "P", type: "prison" } };
play("R6 landing on 30 traps", { tiles: trapTiles, dice: [2, 5], setup: [{ pos: 28 }], turns: 2, players: 1 }, (P) => eq(P[0].pos, 30, "still in trap"));
play("R6 6 frees, the 6 does not move, extra throw 5 moves 5", { tiles: trapTiles, dice: [6, 5], setup: [{ pos: 30, trapped: true }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 35, "pos"));
play("R6 out-6 counts as first six: 6, 6, 6 -> move 12", { tiles: trapTiles, dice: [6, 6, 6], setup: [{ pos: 30, trapped: true }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 42, "pos"));
// R7 hospital
play("R7 hospital: miss 3 turns", { tiles: { 50: { cat: "P", type: "hospital", turns: 3 } }, dice: [2, 4], setup: [{ pos: 48 }], turns: 5, players: 1 }, (P) => eq(P[0].pos, 54, "pos after 3 missed turns"));
// R8 exact END
play("R8 too big: stay", { dice: [5], setup: [{ pos: 200 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 200, "pos"));
play("R8 exact: finish", { dice: [3], setup: [{ pos: 200 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 203, "pos"));
// R9 events
play("R9 15: next turn moves exactly 1", { tiles: { 15: { cat: "P", type: "slowNext" } }, dice: [5, 4], setup: [{ pos: 10 }], turns: 2, players: 1 }, (P) => eq(P[0].pos, 16, "pos"));
play("R9 45: throw twice, one move with the total", { tiles: { 45: { cat: "R", type: "rollSum", dice: 2 } }, dice: [5, 3, 4], setup: [{ pos: 40 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 52, "pos"));
play("R9 143: others double their next throw", { tiles: { 143: { cat: "P", type: "doubleOthers" } }, dice: [3, 4], setup: [{ pos: 140 }, { pos: 10 }], turns: 2 }, (P) => eq(P[1].pos, 18, "doubled"));
// R10 swap with the leader
play("R10 75: swap with the player closest to END", { tiles: { 75: { cat: "R", type: "swapLeader" } }, dice: [5], setup: [{ pos: 70 }, { pos: 120 }, { pos: 90 }], turns: 1, players: 3 }, (P) => eq(P[0].pos, 120, "mover") === true ? eq(P[1].pos, 75, "leader") : "no swap");
// R11 nearest forward
play("R11 nearest punishment forward, then do it", { tiles: { 128: { cat: "P", type: "nearest", target: "P" }, 133: { cat: "P", type: "jump", to: 109 } }, dice: [3], setup: [{ pos: 125 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 109, "pos"));
// No chaining
play("No chaining: sent to 55 by 70 does not fly to 71", { tiles: { 55: { cat: "R", type: "jump", to: 71 }, 70: { cat: "P", type: "jump", to: 55 } }, dice: [2], setup: [{ pos: 68 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 55, "pos"));
// Bonus card
play("Bonus card avoids own punishment (defend)", { tiles: { 12: { cat: "P", type: "jump", to: 0 } }, dice: [2], setup: [{ pos: 10, bonus: 1 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 12, "pos") === true ? eq(P[0].bonus, 0, "card used") : "not avoided");
play("Bonus card cancels the leader's reward (attack)", { tiles: { 112: { cat: "R", type: "jump", to: 150 } }, dice: [2], setup: [{ pos: 110 }, { pos: 20, bonus: 1 }], turns: 1, rules: { bonusPolicy: "attack" } }, (P) => eq(P[0].pos, 112, "reward cancelled"));
// Snake Leader
const snake = { 138: { cat: "R", type: "jump", to: 195, grant: "snakeLeader" }, 202: { cat: "P", type: "jump", to: 165, requires: "snakeLeader" } };
play("Snake: 138 -> 195 and badge", { tiles: snake, dice: [3], setup: [{ pos: 135 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 195, "pos") === true ? eq(P[0].leader, true, "badge") : "no slide");
play("Snake Leader on 202 -> 165", { tiles: snake, dice: [2], setup: [{ pos: 200, leader: true }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 165, "pos"));
play("Non-leader on 202 stays", { tiles: snake, dice: [2], setup: [{ pos: 200 }], turns: 1, players: 1 }, (P) => eq(P[0].pos, 202, "pos"));

// ---- Step I-6 options ----
const both = (...r) => r.find((x) => x !== true) ?? true;
// L1 waiting stairs (owner's example: trapped on 30, two failed throws, third throw 5 -> 31, 31/1, 31/2, 32, 33)
const ST = { stairs: true };
play("L1 stairs: 2 failed throws, 3rd throw 5 -> 33 (slowed by 2)", { tiles: trapTiles, dice: [3, 2, 5], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1, rules: ST }, (P) => eq(P[0].pos, 33, "pos"));
play("L1 stairs: 3rd throw 3 -> stands on stair step 31/2", { tiles: trapTiles, dice: [3, 2, 3], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1, rules: ST }, (P) => both(eq(P[0].pos, 31, "pos"), eq(P[0].onStair, true, "on stair"), eq(P[0].stairLeft, 0, "steps left")));
play("L1 stairs: from stair 31/1, next throw 4 -> 1 step + 3 squares = 34", { tiles: trapTiles, dice: [3, 2, 2, 4], setup: [{ pos: 30, trapped: true }], turns: 4, players: 1, rules: ST }, (P) => eq(P[0].pos, 34, "pos"));
play("L1 stairs: 3rd throw 1 -> lands on 31 itself, both steps still to climb", { tiles: trapTiles, dice: [3, 2, 1], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1, rules: ST }, (P) => both(eq(P[0].pos, 31, "pos"), eq(P[0].stairLeft, 2, "steps left"), eq(P[0].onStair, false, "on the real square")));
play("L1 stairs: a 6 on throw 2 frees; the one step is still walked (6, 4 -> 31, 31/1, 32, 33)", { tiles: trapTiles, dice: [3, 6, 4], setup: [{ pos: 30, trapped: true }], turns: 2, players: 1, rules: ST }, (P) => eq(P[0].pos, 33, "pos"));
play("L1 stairs: a 6 on throw 1 frees as today (6, 4 -> 34)", { tiles: trapTiles, dice: [6, 4], setup: [{ pos: 30, trapped: true }], turns: 1, players: 1, rules: ST }, (P) => eq(P[0].pos, 34, "pos"));
play("L1 stairs at Start: 2 failed throws, 3rd throw 5 -> 1, 1/1, 1/2, 2, 3", { dice: [2, 3, 5], turns: 3, players: 1, rules: ST }, (P) => eq(P[0].pos, 3, "pos"));
play("L1 stairs: 3rd throw is a 6 -> moves like a normal 6 (6 + 3 = 9, 2 of them on the steps -> 37)", { tiles: trapTiles, dice: [3, 2, 6, 3], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1, rules: ST }, (P) => eq(P[0].pos, 37, "pos"));
play("L1 stairs: nobody is captured on a stair step", { dice: [1], setup: [{ pos: 30 }, { pos: 31, onStair: true, stairAt: 31, stairLeft: 1 }], turns: 1, rules: ST }, (P) => both(eq(P[1].pos, 31, "other pos"), eq(P[0].pos, 31, "mover")));
// Lifelines
const LL = (n) => ({ stairs: true, lifelines: n });
play("Lifelines: 3 throws without a 6 cost one, and the player still moves", { dice: [2, 3, 5], turns: 3, players: 1, rules: LL(3) }, (P) => both(eq(P[0].life, 2, "lifelines"), eq(P[0].pos, 3, "pos")));
play("Lifelines: a 6 within 3 throws costs nothing", { dice: [2, 6, 4], turns: 2, players: 1, rules: LL(3) }, (P) => eq(P[0].life, 3, "lifelines"));
play("Lifelines: losing the last one = out", { dice: [2, 3, 5], setup: [{}, { skip: 9 }, { skip: 9 }], turns: 9, players: 3, rules: LL(1) }, (P) => both(eq(P[0].out, true, "out"), eq(P[0].pos, -2, "off the board")));
{
  const r = simulate(board(), { players: 2, diceScript: [2, 3, 5], setup: [{}, { skip: 9 }], ...LL(1) }, 1, 1);
  const ok = r.fairness.seatWinPct[1] === 100 && r.i6.pctGamesLastStanding === 100;
  console.log(`${ok ? "PASS" : "FAIL"}  Lifelines: 2 players, one is out -> the other wins`); if (!ok) fail++;
}
play("Lifelines: a lifeline square gives one back", { tiles: { 12: { cat: "R", type: "skip", turns: 0 } }, dice: [2], setup: [{ pos: 10, life: 2 }], turns: 1, players: 1, rules: { lifelines: 3, lifelineSquares: [12] } }, (P) => eq(P[0].life, 3, "lifelines"));
play("Lifelines: never above the starting number", { tiles: { 12: { cat: "R", type: "skip", turns: 0 } }, dice: [2], setup: [{ pos: 10 }], turns: 1, players: 1, rules: { lifelines: 3, lifelineSquares: [12] } }, (P) => eq(P[0].life, 3, "lifelines"));
// N2 roadblock (game event)
const RB = { roadblock: { back: 10, range: 10 }, roadblockStart: 15 };
play("N2 landing on the roadblock: back 10", { dice: [3], setup: [{ pos: 12 }], turns: 1, players: 1, rules: RB }, (P) => eq(P[0].pos, 5, "pos"));
play("N2 passing over the roadblock does nothing", { dice: [5], setup: [{ pos: 12 }], turns: 1, players: 1, rules: RB }, (P) => eq(P[0].pos, 17, "pos"));
play("N2 the roadblock is used up after one hit", { dice: [3, 2, 3], setup: [{ pos: 12 }, { pos: 13 }], turns: 2, rules: { ...RB, roadblock: { back: 10, range: 0 } } }, (P) => eq(P[1].pos, 15, "second player passes"));
play("N2 a jump that ends on the roadblock also hits it", { tiles: { 12: { cat: "R", type: "jump", to: 15 } }, dice: [2], setup: [{ pos: 10 }], turns: 1, players: 1, rules: RB }, (P) => eq(P[0].pos, 5, "pos"));
// N3 two roads
const FK = { forks: [{ at: 20, merge: 40, len: 5, tiles: { 2: { cat: "R", type: "jump", to: 60 } } }] };
play("N3 every token stops at the crossroads", { dice: [5], setup: [{ pos: 17 }], turns: 1, players: 1, rules: FK }, (P) => eq(P[0].pos, 20, "pos"));
play("N3 simple player takes the safe road", { dice: [4], setup: [{ pos: 20 }], turns: 1, players: 1, rules: FK }, (P) => eq(P[0].pos, 24, "pos"));
play("N3 wild road: square 2 is the jackpot -> 60", { dice: [2], setup: [{ pos: 20 }], turns: 1, players: 1, rules: { ...FK, types: ["wild"] } }, (P) => eq(P[0].pos, 60, "pos"));
play("N3 wild road rejoins at the merge (4 then 3 -> 41)", { dice: [4, 3], setup: [{ pos: 20 }], turns: 2, players: 1, rules: { ...FK, types: ["wild"] } }, (P) => eq(P[0].pos, 41, "pos"));
play("N3 the crossroads holds several players", { dice: [3], setup: [{ pos: 17 }, { pos: 20 }], turns: 1, rules: FK }, (P) => both(eq(P[0].pos, 20, "mover"), eq(P[1].pos, 20, "other")));
play("N3 thoughtful: 20+ behind the leader -> wild road", { dice: [2], setup: [{ pos: 20 }, { pos: 45 }], turns: 1, rules: { ...FK, types: ["thoughtful", "simple"] } }, (P) => eq(P[0].pos, 60, "pos"));
play("N3 thoughtful: close to the leader -> safe road", { dice: [2], setup: [{ pos: 20 }, { pos: 30 }], turns: 1, rules: { ...FK, types: ["thoughtful", "simple"] } }, (P) => eq(P[0].pos, 22, "pos"));
// Thoughtful bonus card
const TH = { types: ["thoughtful", "simple"] };
play("Thoughtful keeps the bonus card for a small punishment", { tiles: { 12: { cat: "P", type: "skip", turns: 1 } }, dice: [2], setup: [{ pos: 10, bonus: 1 }], turns: 1, rules: TH }, (P) => eq(P[0].bonus, 1, "card kept"));
play("Thoughtful uses the bonus card on a big fall", { tiles: { 52: { cat: "P", type: "jump", to: 20 } }, dice: [2], setup: [{ pos: 50, bonus: 1 }], turns: 1, rules: TH }, (P) => both(eq(P[0].pos, 52, "pos"), eq(P[0].bonus, 0, "card used")));
play("Thoughtful uses the bonus card on the trap", { tiles: trapTiles, dice: [2], setup: [{ pos: 28, bonus: 1 }], turns: 1, rules: TH }, (P) => both(eq(P[0].trapped, false, "not trapped"), eq(P[0].bonus, 0, "card used")));
play("Thoughtful cancels the leader's big reward", { tiles: { 112: { cat: "R", type: "jump", to: 150 } }, dice: [2], setup: [{ pos: 110 }, { pos: 20, bonus: 1 }], turns: 1, rules: { types: ["simple", "thoughtful"] } }, (P) => eq(P[0].pos, 112, "reward cancelled"));
play("Thoughtful lets the leader's small reward go", { tiles: { 112: { cat: "R", type: "jump", to: 118 } }, dice: [2], setup: [{ pos: 110 }, { pos: 20, bonus: 1 }], turns: 1, rules: { types: ["simple", "thoughtful"] } }, (P) => both(eq(P[0].pos, 118, "reward kept"), eq(P[1].bonus, 1, "card kept")));
// Candidate: spend a lifeline to cancel a big punishment (thoughtful only, never the last lifeline)
const SP = { stairs: true, lifelines: 3, lifeSpend: true, types: ["thoughtful"] };
play("Spend: thoughtful gives a lifeline to cancel a big fall", { tiles: { 52: { cat: "P", type: "jump", to: 20 } }, dice: [2], setup: [{ pos: 50 }], turns: 1, players: 1, rules: SP }, (P) => both(eq(P[0].pos, 52, "pos"), eq(P[0].life, 2, "lifelines")));
play("Spend: never the last lifeline", { tiles: { 52: { cat: "P", type: "jump", to: 20 } }, dice: [2], setup: [{ pos: 50, life: 1 }], turns: 1, players: 1, rules: SP }, (P) => both(eq(P[0].pos, 20, "pos"), eq(P[0].life, 1, "lifelines")));
play("Spend: a simple player never spends", { tiles: { 52: { cat: "P", type: "jump", to: 20 } }, dice: [2], setup: [{ pos: 50 }], turns: 1, players: 1, rules: { ...SP, types: ["simple"] } }, (P) => eq(P[0].pos, 20, "pos"));
// Winning a lifeline back by a choice
play("Rest: thoughtful with 1 lifeline rests 3 turns, wins 1 lifeline, does not move", { dice: [], setup: [{ pos: 50, life: 1 }], turns: 3, players: 1, rules: { ...SP, lifeRest: 3 } }, (P) => both(eq(P[0].pos, 50, "pos"), eq(P[0].life, 2, "lifelines")));
play("Rest: after winning it back, throws again", { dice: [4], setup: [{ pos: 50, life: 1 }], turns: 4, players: 1, rules: { ...SP, lifeRest: 3 } }, (P) => both(eq(P[0].pos, 54, "pos"), eq(P[0].life, 2, "lifelines")));
play("Rest: a simple player never rests", { dice: [4], setup: [{ pos: 50, life: 1 }], turns: 1, players: 1, rules: { ...SP, lifeRest: 3, types: ["simple"] } }, (P) => eq(P[0].pos, 54, "pos"));
play("Refuse: thoughtful with 1 lifeline refuses a big reward and takes a lifeline", { tiles: { 52: { cat: "R", type: "jump", to: 90 } }, dice: [2], setup: [{ pos: 50, life: 1 }], turns: 1, players: 1, rules: { ...SP, lifeRefuse: 20 } }, (P) => both(eq(P[0].pos, 52, "pos"), eq(P[0].life, 2, "lifelines")));
play("Refuse: a small reward is taken", { tiles: { 52: { cat: "R", type: "jump", to: 60 } }, dice: [2], setup: [{ pos: 50, life: 1 }], turns: 1, players: 1, rules: { ...SP, lifeRefuse: 20 } }, (P) => both(eq(P[0].pos, 60, "pos"), eq(P[0].life, 1, "lifelines")));
play("Spend: not allowed on the last stretch (from 190)", { tiles: { 195: { cat: "P", type: "jump", to: 150 } }, dice: [2], setup: [{ pos: 193 }], turns: 1, players: 1, rules: { ...SP, lifeSpendUntil: 190 } }, (P) => both(eq(P[0].pos, 150, "pos"), eq(P[0].life, 3, "lifelines")));
play("Spend: limit per game", { tiles: { 52: { cat: "P", type: "jump", to: 20 } }, dice: [2], setup: [{ pos: 50, spent: 1 }], turns: 1, players: 1, rules: { ...SP, lifeSpendMax: 1 } }, (P) => eq(P[0].pos, 20, "pos"));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASS");
process.exit(fail ? 1 : 0);

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

console.log(fail ? `\n${fail} FAILED` : "\nALL PASS");
process.exit(fail ? 1 : 0);

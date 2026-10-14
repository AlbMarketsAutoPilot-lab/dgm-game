// One test per rule (docs/GCD.md R1–R21) and per tile type, with scripted dice.
// Most mirror tools/sim/test/rules.test.mjs, now under the frozen rule set.
import { describe, expect, it } from "vitest";
import { OUT, simplePlayer } from "../src/engine";
import type { Decider, Fork, GameEvent } from "../src/engine";
import { OFF, play, tile } from "./helpers";

const trap = { 30: tile({ cat: "P", type: "prison" }) };
const types = (ev: GameEvent[]) => ev.map((e) => e.type);
const human = (answers: Partial<Record<"road" | "bonusDefend" | "bonusAttack", string | boolean>>): Decider =>
  (d, g) => (answers[d.kind] ?? simplePlayer(d, g)) as never;

describe("R1 entering", () => {
  it("no 6: stays at Home", () => expect(play({ dice: [3], turns: 1 }).P[0].pos).toBe(OFF));
  it("a 6 enters Start, the extra throw moves from Start (6, 4 -> 4)", () => expect(play({ dice: [6, 4], turns: 1 }).P[0].pos).toBe(4));
  it("enter 6, then 6, 6: the third six, move 12, turn ends", () => expect(play({ dice: [6, 6, 6], turns: 1 }).P[0].pos).toBe(12));
});

describe("R2 sixes", () => {
  const from10 = (dice: number[]) => play({ dice, setup: [{ pos: 10 }], turns: 1 }).P[0].pos - 10;
  it("4 -> 4 squares", () => expect(from10([4])).toBe(4));
  it("6, 3 -> 9", () => expect(from10([6, 3])).toBe(9));
  it("owner's example 6, 6, 1, 5 -> 18", () => expect(from10([6, 6, 1, 5])).toBe(18));
  it("6, 6, 6 -> 18 and stop", () => expect(from10([6, 6, 6])).toBe(18));
  it("6, 6, 1, 6 -> a 6 among the owed throws is the third six: stop (19)", () => expect(from10([6, 6, 1, 6])).toBe(19));
  it("the token moves once, by the total (one move event)", () => {
    const { events } = play({ dice: [6, 6, 1, 5], setup: [{ pos: 10 }], turns: 1 });
    expect(events.filter((e) => e.type === "move")).toHaveLength(1);
    expect(events.filter((e) => e.type === "roll")).toHaveLength(4);
  });
});

describe("R3 passing over", () => {
  it("an event square passed over does nothing", () =>
    expect(play({ tiles: { 12: tile({ cat: "P", type: "jump", to: 0 }) }, dice: [5], setup: [{ pos: 10 }], turns: 1 }).P[0].pos).toBe(15));
  it("a player passed over is not captured", () =>
    expect(play({ dice: [5], setup: [{ pos: 10 }, { pos: 12 }], turns: 1 }).P[1].pos).toBe(12));
});

describe("R4 capture", () => {
  it("landing on a player sends them to Start", () => {
    const { P, events } = play({ dice: [3], setup: [{ pos: 10 }, { pos: 13 }], turns: 1 });
    expect([P[0].pos, P[1].pos, P[1].captured]).toEqual([13, 0, 1]);
    expect(events).toContainEqual({ type: "capture", player: 0, victim: 1, square: 13 });
  });
  it("also by a jump", () =>
    expect(play({ tiles: { 12: tile({ cat: "R", type: "jump", to: 40 }) }, dice: [2], setup: [{ pos: 10 }, { pos: 40 }], turns: 1 }).P[1].pos).toBe(0));
  it("Start holds several players", () => {
    const { P } = play({ dice: [3], setup: [{ pos: 10 }, { pos: 13 }, { pos: 0 }], turns: 1, players: 3 });
    expect([P[1].pos, P[2].pos]).toEqual([0, 0]);
  });
  it("a captured player leaves the trap and its waiting", () => {
    const { P } = play({ tiles: trap, dice: [2], setup: [{ pos: 28 }, { pos: 30, trapped: true, tries: 1 }], turns: 1 });
    expect([P[1].pos, P[1].trapped, P[1].tries]).toEqual([0, false, 0]);
  });
});

describe("R5 back on Start", () => {
  it("a captured player moves next turn without a 6", () =>
    expect(play({ dice: [3, 2], setup: [{ pos: 10 }, { pos: 13 }], turns: 2 }).P[1].pos).toBe(2));
});

describe("R6 the trap (prison tile)", () => {
  it("landing on it traps", () => {
    const { P, events } = play({ tiles: trap, dice: [2, 5], setup: [{ pos: 28 }], turns: 2, players: 1 });
    expect([P[0].pos, P[0].trapped]).toEqual([30, true]);
    expect(types(events)).toContain("trapped");
  });
  it("a 6 frees; the 6 does not move, the extra throw 5 moves 5", () =>
    expect(play({ tiles: trap, dice: [6, 5], setup: [{ pos: 30, trapped: true }], turns: 1, players: 1 }).P[0].pos).toBe(35));
  it("the out-6 counts as the first six: 6, 6, 6 -> move 12", () =>
    expect(play({ tiles: trap, dice: [6, 6, 6], setup: [{ pos: 30, trapped: true }], turns: 1, players: 1 }).P[0].pos).toBe(42));
  it("Bog boots (free pass) keep you out of the trap, used by themselves", () => {
    const { P, events } = play({ tiles: trap, dice: [2, 4], setup: [{ pos: 28, jailPass: 1 }], turns: 2, players: 1 });
    expect([P[0].pos, P[0].jailPass, P[0].trapped]).toEqual([34, 0, false]);
    expect(types(events)).toContain("bogBoots");
  });
});

describe("R7 hospital", () => {
  it("miss 3 turns", () => {
    const { P, events } = play({ tiles: { 50: tile({ cat: "P", type: "hospital", turns: 3 }) }, dice: [2, 4], setup: [{ pos: 48 }], turns: 5, players: 1 });
    expect(P[0].pos).toBe(54);
    expect(events.filter((e) => e.type === "skipTurn")).toHaveLength(3);
  });
});

describe("R8 END", () => {
  it("too big: stay", () => {
    const { P, events } = play({ dice: [5], setup: [{ pos: 200 }], turns: 1, players: 1 });
    expect(P[0].pos).toBe(200);
    expect(events).toContainEqual({ type: "overshoot", player: 0, squares: 5 });
  });
  it("exact: win, and the game is over", () => {
    const { P, game, events } = play({ dice: [3], setup: [{ pos: 200 }], turns: 1, players: 2 });
    expect([P[0].pos, game.winner, game.over]).toEqual([203, 0, true]);
    expect(events.at(-1)).toEqual({ type: "win", player: 0, lastStanding: false });
    expect(() => game.turn().next()).toThrow();
  });
});

describe("R9 special throws", () => {
  it("slowNext: next turn moves exactly 1, with no throw (as measured)", () => {
    const { P, events } = play({ tiles: { 15: tile({ cat: "P", type: "slowNext" }) }, dice: [5], setup: [{ pos: 10 }], turns: 2, players: 1 });
    expect(P[0].pos).toBe(16);
    expect(events.filter((e) => e.type === "roll")).toHaveLength(1);
  });
  it("rollSum 2: throw twice, one move with the total", () =>
    expect(play({ tiles: { 45: tile({ cat: "R", type: "rollSum", dice: 2 }) }, dice: [5, 3, 4], setup: [{ pos: 40 }], turns: 1, players: 1 }).P[0].pos).toBe(52));
  it("rollSum 3: the square you land on applies", () => {
    const tiles = { 123: tile({ cat: "R", type: "rollSum", dice: 3 }), 133: tile({ cat: "P", type: "jump", to: 109 }) };
    expect(play({ tiles, dice: [3, 4, 3, 3], setup: [{ pos: 120 }], turns: 1, players: 1 }).P[0].pos).toBe(109);
  });
  it("doubleOthers: the others double their next throw only", () => {
    const { P } = play({ tiles: { 143: tile({ cat: "P", type: "doubleOthers" }) }, dice: [3, 4, 2, 4], setup: [{ pos: 140 }, { pos: 10 }], turns: 4 });
    expect(P[1].pos).toBe(10 + 8 + 4);
  });
});

describe("R10 swap with the leader", () => {
  const swap = { 75: tile({ cat: "R", type: "swapLeader" }) };
  it("change place with the player closest to END", () => {
    const { P } = play({ tiles: swap, dice: [5], setup: [{ pos: 70 }, { pos: 120 }, { pos: 90 }], turns: 1, players: 3 });
    expect([P[0].pos, P[1].pos, P[2].pos]).toEqual([120, 75, 90]);
  });
  it("nobody ahead: nothing happens", () =>
    expect(play({ tiles: swap, dice: [5], setup: [{ pos: 70 }, { pos: 20 }], turns: 1 }).P[0].pos).toBe(75));
  it("as measured: the swapped leader's waiting turns are cleared", () => {
    const { P } = play({ tiles: swap, dice: [5], setup: [{ pos: 70 }, { pos: 95, skip: 1 }], turns: 1 });
    expect([P[1].pos, P[1].skip]).toEqual([75, 0]);
  });
});

describe("R11 nearest square, forward only", () => {
  it("nearest punishment, then do it", () => {
    const tiles = { 128: tile({ cat: "P", type: "nearest", target: "P" }), 133: tile({ cat: "P", type: "jump", to: 109 }) };
    expect(play({ tiles, dice: [3], setup: [{ pos: 125 }], turns: 1, players: 1 }).P[0].pos).toBe(109);
  });
  it("nearest reward skips a Snake-Leader-only square", () => {
    const tiles = {
      65: tile({ cat: "R", type: "nearest", target: "R" }), 70: tile({ cat: "R", type: "jump", to: 0, requires: "snakeLeader" }),
      80: tile({ cat: "R", type: "jump", to: 135 }),
    };
    expect(play({ tiles, dice: [5], setup: [{ pos: 60 }], turns: 1, players: 1 }).P[0].pos).toBe(135);
  });
});

describe("other tile types", () => {
  it("skip: wait 1 turn", () => {
    const { P } = play({ tiles: { 5: tile({ cat: "P", type: "skip", turns: 1 }) }, dice: [2, 3], setup: [{ pos: 3 }], turns: 3, players: 1 });
    expect(P[0].pos).toBe(8);
  });
  it("extraRoll: throw again (a full throw with sixes)", () =>
    expect(play({ tiles: { 163: tile({ cat: "R", type: "extraRoll" }) }, dice: [3, 6, 2], setup: [{ pos: 160 }], turns: 1, players: 1 }).P[0].pos).toBe(171));
  it("card: the bonus card is kept", () => {
    const { P, events } = play({ tiles: { 60: tile({ cat: "R", type: "card", card: "bonus" }) }, dice: [2], setup: [{ pos: 58 }], turns: 1, players: 1 });
    expect(P[0].bonus).toBe(1);
    expect(events).toContainEqual({ type: "card", player: 0, card: "bonus" });
  });
  it("jump then prison: to the trap and trapped", () => {
    const { P } = play({ tiles: { ...trap, 97: tile({ cat: "P", type: "jump", to: 30, then: "prison" }) }, dice: [2], setup: [{ pos: 95 }], turns: 1, players: 1 });
    expect([P[0].pos, P[0].trapped]).toEqual([30, true]);
  });
  it("jump then hospital: wait 3 turns", () => {
    const { P } = play({ tiles: { 113: tile({ cat: "P", type: "jump", to: 50, then: "hospital" }) }, dice: [3], setup: [{ pos: 110 }], turns: 1, players: 1 });
    expect([P[0].pos, P[0].skip]).toEqual([50, 3]);
  });
  it("jump then skip2: forgot keys AGAIN, wait 2 turns", () => {
    const { P } = play({ tiles: { 198: tile({ cat: "P", type: "jump", to: 184, then: "skip2" }) }, dice: [3], setup: [{ pos: 195 }], turns: 1, players: 1 });
    expect([P[0].pos, P[0].skip]).toEqual([184, 2]);
  });
  it("no chaining: sent to 55 by 70 does not fly on to 71", () => {
    const tiles = { 55: tile({ cat: "R", type: "jump", to: 71 }), 70: tile({ cat: "P", type: "jump", to: 55 }) };
    expect(play({ tiles, dice: [2], setup: [{ pos: 68 }], turns: 1, players: 1 }).P[0].pos).toBe(55);
  });
});

describe("Snake Leader", () => {
  const snake = { 138: tile({ cat: "R", type: "jump", to: 195, grant: "snakeLeader" }), 202: tile({ cat: "P", type: "jump", to: 165, requires: "snakeLeader" }) };
  it("138 -> 195 and the badge", () => {
    const { P } = play({ tiles: snake, dice: [3], setup: [{ pos: 135 }], turns: 1, players: 1 });
    expect([P[0].pos, P[0].snakeLeader]).toEqual([195, true]);
  });
  it("the Snake Leader on 202 goes back to 165", () =>
    expect(play({ tiles: snake, dice: [2], setup: [{ pos: 200, snakeLeader: true }], turns: 1, players: 1 }).P[0].pos).toBe(165));
  it("anyone else on 202 stays", () =>
    expect(play({ tiles: snake, dice: [2], setup: [{ pos: 200 }], turns: 1, players: 1 }).P[0].pos).toBe(202));
});

describe("R14 bonus card", () => {
  const fall = { 12: tile({ cat: "P", type: "jump", to: 0 }) };
  const prize = { 112: tile({ cat: "R", type: "jump", to: 150 }) };
  it("computer player: avoids its own punishment", () => {
    const { P, decisions } = play({ tiles: fall, dice: [2], setup: [{ pos: 10, bonus: 1 }], turns: 1, players: 1 });
    expect([P[0].pos, P[0].bonus]).toEqual([12, 0]);
    expect(decisions.map((d) => d.kind)).toEqual(["bonusDefend"]);
  });
  it("a player may keep the card and take the punishment", () => {
    const { P } = play({ tiles: fall, dice: [2], setup: [{ pos: 10, bonus: 1 }], turns: 1, players: 1, decide: human({ bonusDefend: false }) });
    expect([P[0].pos, P[0].bonus]).toEqual([0, 1]);
  });
  it("a player may cancel another player's reward", () => {
    const { P, events } = play({ tiles: prize, dice: [2], setup: [{ pos: 110 }, { pos: 20, bonus: 1 }], turns: 1, decide: human({ bonusAttack: true }) });
    expect([P[0].pos, P[1].bonus]).toEqual([112, 0]);
    expect(events).toContainEqual({ type: "bonusUsed", player: 1, use: "attack", target: 0, square: 112 });
  });
  it("the computer never uses it against another player", () => {
    const { P } = play({ tiles: prize, dice: [2], setup: [{ pos: 110 }, { pos: 20, bonus: 1 }], turns: 1 });
    expect([P[0].pos, P[1].bonus]).toEqual([150, 1]);
  });
  it("not asked without a card", () =>
    expect(play({ tiles: fall, dice: [2], setup: [{ pos: 10 }], turns: 1, players: 1 }).decisions).toEqual([]));
});

describe("R17 waiting stairs", () => {
  it("owner's example: trapped, 2 failed throws, 3rd throw 5 -> 31, 31/1, 31/2, 32, 33", () => {
    const { P, events } = play({ tiles: trap, dice: [3, 2, 5], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1 });
    expect(P[0].pos).toBe(33);
    const move = events.find((e) => e.type === "move");
    expect(move && move.type === "move" && move.path).toEqual([
      { pos: 31, stair: 0 }, { pos: 31, stair: 1 }, { pos: 31, stair: 2 }, { pos: 32, stair: 0 }, { pos: 33, stair: 0 },
    ]);
  });
  it("3rd throw 3 -> stands on stair step 31/2", () => {
    const { P } = play({ tiles: trap, dice: [3, 2, 3], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1 });
    expect([P[0].pos, P[0].onStair, P[0].stairLeft]).toEqual([31, true, 0]);
  });
  it("from stair 31/1, next throw 4 -> 1 step + 3 squares = 34", () =>
    expect(play({ tiles: trap, dice: [3, 2, 2, 4], setup: [{ pos: 30, trapped: true }], turns: 4, players: 1 }).P[0].pos).toBe(34));
  it("3rd throw 1 -> on 31 itself, both steps still to climb", () => {
    const { P } = play({ tiles: trap, dice: [3, 2, 1], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1 });
    expect([P[0].pos, P[0].stairLeft, P[0].onStair]).toEqual([31, 2, false]);
  });
  it("a 6 on throw 2 frees; the one step is still walked (6, 4 -> 33)", () =>
    expect(play({ tiles: trap, dice: [3, 6, 4], setup: [{ pos: 30, trapped: true }], turns: 2, players: 1 }).P[0].pos).toBe(33));
  it("a 6 on throw 1 frees with no step (6, 4 -> 34)", () =>
    expect(play({ tiles: trap, dice: [6, 4], setup: [{ pos: 30, trapped: true }], turns: 1, players: 1 }).P[0].pos).toBe(34));
  it("at Home: 2 failed throws, 3rd throw 5 -> 1, 1/1, 1/2, 2, 3", () =>
    expect(play({ dice: [2, 3, 5], turns: 3, players: 1 }).P[0].pos).toBe(3));
  it("3rd throw a 6 -> moves like a normal 6 (6 + 3, 2 of them on the steps -> 37)", () =>
    expect(play({ tiles: trap, dice: [3, 2, 6, 3], setup: [{ pos: 30, trapped: true }], turns: 3, players: 1 }).P[0].pos).toBe(37));
  it("nobody is captured on a stair step", () => {
    const { P } = play({ dice: [1], setup: [{ pos: 30 }, { pos: 31, onStair: true, stairAt: 31, stairLeft: 1, stairTotal: 2 }], turns: 1 });
    expect([P[0].pos, P[1].pos]).toEqual([31, 31]);
  });
});

describe("R18 lanterns (lifelines)", () => {
  it("3 throws without a 6 cost one, and the player still moves", () => {
    const { P, events } = play({ dice: [2, 3, 5], turns: 3, players: 1 });
    expect([P[0].lanterns, P[0].pos]).toEqual([2, 3]);
    expect(events).toContainEqual({ type: "lanternLost", player: 0, left: 2 });
  });
  it("a 6 within 3 throws costs nothing", () => expect(play({ dice: [2, 6, 4], turns: 2, players: 1 }).P[0].lanterns).toBe(3));
  it("three 6s in a row win one", () => expect(play({ dice: [6, 6, 6], setup: [{ pos: 10 }], turns: 1, players: 1 }).P[0].lanterns).toBe(4));
  it("two 6s in a row win nothing", () => expect(play({ dice: [6, 6, 2, 3], setup: [{ pos: 10 }], turns: 1, players: 1 }).P[0].lanterns).toBe(3));
  it("the entering 6 + two 6s = three in a row", () => expect(play({ dice: [6, 6, 6], turns: 1, players: 1 }).P[0].lanterns).toBe(4));
  it("a capture costs none", () => expect(play({ dice: [3], setup: [{ pos: 10 }, { pos: 13 }], turns: 1 }).P[1].lanterns).toBe(3));
  it("losing the 3rd -> 0 left, still playing", () => {
    const { P } = play({ tiles: trap, dice: [3, 2, 5], setup: [{ pos: 30, trapped: true, lanterns: 1 }], turns: 3, players: 1 });
    expect([P[0].lanterns, P[0].out, P[0].pos]).toEqual([0, false, 33]);
  });
  it("the 4th loss -> out; with 3 players the game goes on", () => {
    const { P, game } = play({ tiles: trap, dice: [3, 2, 5], setup: [{ pos: 30, trapped: true, lanterns: 0 }, { skip: 9 }, { skip: 9 }], turns: 9, players: 3 });
    expect([P[0].out, P[0].pos, game.over]).toEqual([true, OUT, false]);
  });
  it("2 players, one is out -> the other wins as the last player left", () => {
    const { game } = play({ dice: [2, 3, 5], setup: [{ lanterns: 0 }, { skip: 9 }], turns: 9 });
    expect([game.winner, game.lastStanding]).toEqual([1, true]);
  });
});

describe("R19 fallen tree", () => {
  it("landing on it: back 10, and it is removed", () => {
    const { P, game, events } = play({ dice: [3], setup: [{ pos: 12 }], turns: 1, players: 1, roadblock: 15 });
    expect([P[0].pos, game.roadblock]).toEqual([5, null]);
    expect(types(events)).toContain("roadblockHit");
  });
  it("passing over it does nothing", () => expect(play({ dice: [5], setup: [{ pos: 12 }], turns: 1, players: 1, roadblock: 15 }).P[0].pos).toBe(17));
  it("only the first player to land on it", () =>
    expect(play({ dice: [3, 2], setup: [{ pos: 12 }, { pos: 13 }], turns: 2, roadblock: 15 }).P[1].pos).toBe(15));
  it("a jump that ends on it also hits it", () =>
    expect(play({ tiles: { 12: tile({ cat: "R", type: "jump", to: 15 }) }, dice: [2], setup: [{ pos: 10 }], turns: 1, players: 1, roadblock: 15 }).P[0].pos).toBe(5));
  it("never below Start", () => expect(play({ dice: [3], setup: [{ pos: 2 }], turns: 1, players: 1, roadblock: 5 }).P[0].pos).toBe(0));
  it("placed at the start of a round on a free plain square 1–10 in front of the leader", () => {
    const tiles = { 14: tile({ cat: "P", type: "skip", turns: 1 }), 15: tile({ cat: "P", type: "skip", turns: 1 }) };
    const seen = new Set<number>();
    for (let seed = 1; seed <= 200; seed++) {
      const { events } = play({ tiles, dice: [1], setup: [{ pos: 10 }, { pos: 12 }], turns: 1, roadblockRange: 10, seed });
      expect(types(events).slice(0, 3)).toEqual(["round", "roadblockPlaced", "turn"]);
      const placed = events[1];
      if (placed.type === "roadblockPlaced") seen.add(placed.square);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([13, 16, 17, 18, 19, 20, 21, 22]); // the leader is on 12; 14, 15 are event squares
  });
});

describe("R20 two roads", () => {
  const fork: Fork = { at: 20, merge: 40, len: 5, tiles: { 2: tile({ cat: "R", type: "jump", to: 60 }), 4: tile({ cat: "P", type: "jump", to: 30, then: "prison" }) } };
  const F = { forks: [fork], tiles: trap };
  it("every token stops at the crossroads, even with squares left", () => {
    const { P, events } = play({ ...F, dice: [5], setup: [{ pos: 17 }], turns: 1, players: 1 });
    expect(P[0].pos).toBe(20);
    expect(events.find((e) => e.type === "move")).toMatchObject({ crossroads: true });
  });
  it("the player chooses before throwing", () => {
    const { events } = play({ ...F, dice: [4], setup: [{ pos: 20 }], turns: 1, players: 1, decide: human({ road: "main" }) });
    expect(types(events).slice(0, 4)).toEqual(["round", "turn", "road", "roll"]);
  });
  it("no choice on a turn the player waits", () => {
    const { decisions } = play({ ...F, dice: [], setup: [{ pos: 20, skip: 1 }], turns: 1, players: 1 });
    expect(decisions).toEqual([]);
  });
  it("the computer takes the Main Road", () => {
    const { P, decisions } = play({ ...F, dice: [4], setup: [{ pos: 20 }], turns: 1, players: 1 });
    expect(P[0].pos).toBe(24);
    expect(decisions).toEqual([{ kind: "road", player: 0, fork: 0, square: 20 }]);
  });
  it("Shortcut: square 2 is the jackpot", () =>
    expect(play({ ...F, dice: [2], setup: [{ pos: 20 }], turns: 1, players: 1, decide: human({ road: "shortcut" }) }).P[0].pos).toBe(60));
  it("Shortcut: square 4 is the fall into the trap", () => {
    const { P } = play({ ...F, dice: [4], setup: [{ pos: 20 }], turns: 1, players: 1, decide: human({ road: "shortcut" }) });
    expect([P[0].pos, P[0].trapped]).toEqual([30, true]);
  });
  it("a move past the end of the Shortcut continues from the meeting square (5, then 3 -> 42)", () =>
    expect(play({ ...F, dice: [5, 3], setup: [{ pos: 20 }], turns: 2, players: 1, decide: human({ road: "shortcut" }) }).P[0].pos).toBe(42));
  it("the crossroads holds several players", () => {
    const { P } = play({ ...F, dice: [3], setup: [{ pos: 17 }, { pos: 20 }], turns: 1 });
    expect([P[0].pos, P[1].pos]).toEqual([20, 20]);
  });
});

describe("R21 the only choices", () => {
  it("a whole game of computer players asks only for roads and the bonus card", async () => {
    const { BOARDS, Game, runTurn } = await import("../src/engine");
    const kinds = new Set<string>();
    const game = new Game(BOARDS.long, { players: 4, seed: 7 });
    while (!game.over) runTurn(game, (d, g) => { kinds.add(d.kind); return simplePlayer(d, g); });
    expect([...kinds].every((k) => ["road", "bonusDefend", "bonusAttack"].includes(k))).toBe(true);
    expect(game.winner).not.toBeNull();
  });
});

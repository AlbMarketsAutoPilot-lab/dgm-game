// The frozen board files load, use only what the engine implements, and play their own numbers (GCD §10).
import { describe, expect, it } from "vitest";
import { BOARDS, Game, parseBoard, runTurn } from "../src/engine";
import type { Answer, Decision } from "../src/engine";

const scripted = (dice: number[]) => () => { if (!dice.length) throw new Error("dice ran out"); return dice.shift()!; };
const shortcut = (d: Decision): Answer => (d.kind === "road" ? "main" : d.kind === "bonusDefend");

describe("board files", () => {
  it.each(["long", "short"] as const)("%s: every event square has a story and an icon", (id) => {
    for (const t of Object.values(BOARDS[id].tiles)) {
      expect(t.story, t.text).toBeTruthy();
      expect(t.icon, t.text).toBeTruthy();
    }
  });

  it("sizes: long Start + 202 + END, short Start + 100 + END; 41 and 23 event squares", () => {
    expect([BOARDS.long.lastTile, BOARDS.long.endTile, Object.keys(BOARDS.long.tiles).length]).toEqual([202, 203, 41]);
    expect([BOARDS.short.lastTile, BOARDS.short.endTile, Object.keys(BOARDS.short.tiles).length]).toEqual([100, 101, 23]);
  });

  it("every tile type in the boards has a rule test", () => {
    const tested = ["skip", "hospital", "prison", "slowNext", "card", "doubleOthers", "extraRoll", "rollSum", "jump", "nearest", "swapLeader"];
    for (const b of Object.values(BOARDS)) {
      const all = [...Object.values(b.tiles), ...b.rules.forks.flatMap((f) => Object.values(f.tiles))];
      for (const t of all) expect(tested).toContain(t.type);
    }
  });

  it("refuses a rule that is not part of the frozen game", () => {
    expect(() => parseBoard({ ...BOARDS.long, rules: { ...BOARDS.long.rules, endRule: "overshoot" } })).toThrow(/endRule/);
    expect(() => parseBoard({ ...BOARDS.long, rules: { ...BOARDS.long.rules, lifeSpend: true } })).toThrow(/lifeSpend/);
  });

  it("refuses an unknown tile", () => {
    expect(() => parseBoard({ ...BOARDS.long, tiles: { 5: { cat: "R", type: "teleport", text: "?" } } })).toThrow(/unknown type/);
    expect(() => parseBoard({ ...BOARDS.long, tiles: { 5: { cat: "R", type: "jump", to: 999, text: "?" } } })).toThrow(/jump/);
  });
});

describe("no Shortcut (owner 15 Oct): nobody stops at 82 or 160, a throw is counted in full", () => {
  it("long: 80 + 6, 5 = 91 straight past 82", () => {
    const g = new Game(BOARDS.long, { players: 1, seed: 1, roadblock: null, dice: scripted([6, 5]), setup: [{ pos: 76 }] });
    runTurn(g, shortcut);
    expect(g.players[0].pos).toBe(87);
  });
  it("both boards have no crossroads", () => expect([BOARDS.long.rules.forks, BOARDS.short.rules.forks]).toEqual([[], []]));
});

describe("short board, its own numbers", () => {
  it("the Bog is square 15: two throws without a 6, the third throw 2 moves 2 (15 -> 17, the hay cart -> 33)", () => {
    const g = new Game(BOARDS.short, { players: 1, seed: 1, roadblock: null, dice: scripted([1, 2, 3, 2]), setup: [{ pos: 14 }] });
    for (let i = 0; i < 4; i++) runTurn(g, shortcut);
    expect(g.players[0].pos).toBe(33);
  });
  it("the owner's real tests (short board): 6 then 2 from Home -> square 2, after 0, 1 or 2 misses", () => {
    for (const misses of [[], [5], [5, 1]]) {
      const g = new Game(BOARDS.short, { players: 1, seed: 1, roadblock: null, dice: scripted([...misses, 6, 2]) });
      for (let i = 0; i <= misses.length; i++) runTurn(g, shortcut);
      expect(g.players[0].pos, `misses ${misses}`).toBe(2);
    }
  });
  it("the owner's real tests: 6 + 2 moves 8; 6 + 5 moves 11; 6 + 6 + 1 moves 13 and the turn ends", () => {
    for (const [dice, to] of [[[6, 2], 28], [[6, 5], 31], [[6, 6, 1], 33]] as [number[], number][]) {
      const g = new Game(BOARDS.short, { players: 1, seed: 1, roadblock: null, dice: scripted(dice), setup: [{ pos: 20 }] });
      runTurn(g, shortcut);
      expect(g.players[0].pos, `${dice}`).toBe(to);
    }
  });
  it("square 1 is a square like any other: landing there sends the player on it back to Start", () => {
    const g = new Game(BOARDS.short, { players: 2, seed: 1, roadblock: null, dice: scripted([6, 1]), setup: [{}, { pos: 1 }] });
    runTurn(g, shortcut);
    expect([g.players[0].pos, g.players[1].pos]).toEqual([1, 0]);
  });
  it("99: back to 92 and miss 2 turns", () => {
    const g = new Game(BOARDS.short, { players: 1, seed: 1, roadblock: null, dice: scripted([4, 3]), setup: [{ pos: 95 }] });
    runTurn(g, shortcut);
    expect([g.players[0].pos, g.players[0].skip]).toEqual([92, 2]);
    runTurn(g, shortcut); runTurn(g, shortcut); // two turns missed, no throw
    expect(g.players[0].skip).toBe(0);
    runTurn(g, shortcut);
    expect(g.players[0].pos).toBe(95);
  });
  it("the Snake Leader: 69 -> 97 with the badge, and 100 -> 82 for the badge holder only", () => {
    const g = new Game(BOARDS.short, { players: 1, seed: 1, dice: scripted([3, 3]), setup: [{ pos: 66 }] });
    runTurn(g, shortcut);
    expect([g.players[0].pos, g.players[0].snakeLeader]).toEqual([97, true]);
    runTurn(g, shortcut);
    expect(g.players[0].pos).toBe(82);
  });
});

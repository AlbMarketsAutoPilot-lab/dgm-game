// The frozen board files load, use only what the engine implements, and play their own numbers (GCD §10).
import { describe, expect, it } from "vitest";
import { BOARDS, Game, parseBoard, runTurn, shortcutPos } from "../src/engine";
import type { Answer, Decision } from "../src/engine";

const scripted = (dice: number[]) => () => { if (!dice.length) throw new Error("dice ran out"); return dice.shift()!; };
const shortcut = (d: Decision): Answer => (d.kind === "road" ? "shortcut" : d.kind === "bonusDefend");

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

describe("long board, its own numbers", () => {
  it("Shortcut of the first crossroads (82): square 2 -> 100, square 5 -> the Bog (30)", () => {
    let g = new Game(BOARDS.long, { players: 1, seed: 1, dice: scripted([2]), setup: [{ pos: 82 }] });
    runTurn(g, shortcut);
    expect(g.players[0].pos).toBe(100);
    g = new Game(BOARDS.long, { players: 1, seed: 1, dice: scripted([5]), setup: [{ pos: 82 }] });
    runTurn(g, shortcut);
    expect([g.players[0].pos, g.players[0].trapped]).toEqual([30, true]);
  });
  it("the Shortcut of 160 has 19 squares and meets the Main Road at 180", () => {
    const g = new Game(BOARDS.long, { players: 1, seed: 1, dice: scripted([6, 6, 6, 4]), setup: [{ pos: 160 }] });
    runTurn(g, shortcut); // 18 squares: Shortcut square 18
    expect(g.players[0].pos).toBe(shortcutPos(1, 18));
    runTurn(g, shortcut); // 4 more: square 19, then 180, 181, 182
    expect(g.players[0].pos).toBe(182);
  });
});

describe("short board, its own numbers", () => {
  it("the Bog is square 15 and its stepping stones lead to 16", () => {
    const g = new Game(BOARDS.short, { players: 1, seed: 1, dice: scripted([1, 2, 3, 4]), setup: [{ pos: 14 }] });
    for (let i = 0; i < 4; i++) runTurn(g, shortcut);
    // 14 -> 15 trapped; two throws without a 6; third throw 4: 16, 16/1, 16/2, 17 -> the hay cart 17 -> 33
    expect(g.players[0].pos).toBe(33);
  });
  it("Shortcut of crossroads 41: square 1 -> 50, square 2 -> the Bog", () => {
    let g = new Game(BOARDS.short, { players: 1, seed: 1, dice: scripted([1]), setup: [{ pos: 41 }] });
    runTurn(g, shortcut);
    expect(g.players[0].pos).toBe(50);
    g = new Game(BOARDS.short, { players: 1, seed: 1, dice: scripted([2]), setup: [{ pos: 41 }] });
    runTurn(g, shortcut);
    expect([g.players[0].pos, g.players[0].trapped]).toEqual([15, true]);
  });
  it("the Snake Leader: 69 -> 97 with the badge, and 100 -> 82 for the badge holder only", () => {
    const g = new Game(BOARDS.short, { players: 1, seed: 1, dice: scripted([3, 3]), setup: [{ pos: 66 }] });
    runTurn(g, shortcut);
    expect([g.players[0].pos, g.players[0].snakeLeader]).toEqual([97, true]);
    runTurn(g, shortcut);
    expect(g.players[0].pos).toBe(82);
  });
});

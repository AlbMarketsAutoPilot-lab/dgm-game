// The v3 app engine's choices for people (GCD R19): what it asks, when, and what each answer does. The robot's own
// games are checked against the simulator in test/v3-equivalence.test.ts.
import { describe, expect, it } from "vitest";
import { DESTINATIONS, Game3, robot, runTurn3, type Decision3, type Player3 } from "../src/engine/v3";

const LF = DESTINATIONS["lantern-festival"];
const allDone = () => LF.areas.map(() => true);
const scripted = (dice: number[]) => () => { if (!dice.length) throw new Error("dice ran out"); return dice.shift()!; };

/** Plays `turns` turns; answers every question with `answer` and returns the questions asked. */
function play(o: { dice: number[]; setup: Partial<Player3>[]; turns: number; answer: (d: Decision3) => boolean | number; robots?: boolean[] }) {
  const g = new Game3(LF, { players: o.setup.length, dice: scripted(o.dice), robots: o.robots,
    setup: o.setup.map((s) => ({ home: false, cards: 0, done: allDone(), ...s })) });
  const asked: Decision3[] = [];
  for (let t = 0; t < o.turns; t++) runTurn3(g, (d) => { asked.push(d); return o.answer(d); });
  return { g, asked };
}

describe("v3 engine: what a person is asked", () => {
  it("at Home with a card: asked every turn; a person is never forced after 3 throws", () => {
    const { g, asked } = play({ dice: [1, 2, 3, 4], turns: 4, setup: [{ pos: 0, home: true, cards: 1 }], answer: () => false });
    expect(asked.map((d) => d.kind)).toEqual(["waitCard", "waitCard", "waitCard", "waitCard"]);
    expect([g.players[0].home, g.players[0].cards]).toEqual([true, 1]);
  });
  it("using the card at the tree frees you, then you roll to move", () => {
    const { g, asked } = play({ dice: [3], turns: 1, setup: [{ pos: 27, stuck: true, cards: 1 }], answer: () => true });
    expect(asked).toEqual([{ kind: "waitCard", player: 0, where: "tree", tries: 0 }]);
    expect([g.players[0].pos, g.players[0].cards, g.players[0].stuck]).toEqual([30, 1, false]);
  });
  it("no card, no question", () => {
    const { asked } = play({ dice: [3, 1], turns: 2, setup: [{ pos: 0, home: true }, { pos: 48 }], answer: () => true });
    expect(asked).toEqual([]);
  });
  it("a red square with a card: asked; keeping the card takes the punishment", () => {
    const { g, asked } = play({ dice: [1], turns: 1, setup: [{ pos: 48, cards: 1 }], answer: () => false });
    expect(asked.map((d) => d.kind === "punishment" && d.square)).toEqual([49]);
    expect([g.players[0].pos, g.players[0].cards]).toEqual([31, 1]);
  });
  it("an area punishment with a card: asked, with the area effect named", () => {
    const { g, asked } = play({ dice: [4], turns: 1, setup: [{ pos: 21, cards: 1, done: [true, true, false, true, true, true] }], answer: () => true });
    expect(asked).toEqual([{ kind: "punishment", player: 0, square: 25, tile: null, area: "backward" }]);
    expect([g.players[0].back, g.players[0].cards]).toEqual([false, 0]);
  });
  it("Swap Market: with 3–4 players the person chooses (candidates in turn order); with 2, nothing is asked", () => {
    const three = play({ dice: [1], turns: 1, setup: [{ pos: 78, cards: 1 }, { pos: 50 }, { pos: 20 }], answer: () => 1 });
    expect(three.asked).toEqual([{ kind: "swapMarket", player: 0, give: true, candidates: [1, 2] }]);
    expect(three.g.players.map((p) => p.cards)).toEqual([0, 1, 0]);
    const two = play({ dice: [1], turns: 1, setup: [{ pos: 78 }, { pos: 50, cards: 2 }], answer: () => 1 });
    expect(two.asked).toEqual([]);
    expect(two.g.players.map((p) => p.cards)).toEqual([1, 1]);
    expect(() => play({ dice: [1], turns: 1, setup: [{ pos: 78, cards: 1 }, { pos: 50 }, { pos: 20 }], answer: () => 0 })).toThrow(/candidates/);
  });
  it("the robot: rolls at Home, cancels punishments, gives to the player furthest behind", () => {
    const g = new Game3(LF, { players: 3, dice: scripted([1]), robots: [true, true, true],
      setup: [{ pos: 78, cards: 1, home: false, done: allDone() }, { pos: 50, cards: 0, home: false }, { pos: 20, cards: 0, home: false }] });
    runTurn3(g, robot);
    expect(g.players.map((p) => p.cards)).toEqual([0, 0, 1]);
    expect(robot({ kind: "waitCard", player: 0, where: "home", tries: 0 }, g)).toBe(false);
    expect(robot({ kind: "punishment", player: 0, square: 49, tile: null, area: null }, g)).toBe(true);
  });
  it("whole games of robots end with a winner and keep the rounds", () => {
    const g = new Game3(LF, { players: 4, seed: 5, robots: [true, true, true, true] });
    while (!g.over) runTurn3(g, robot);
    expect(g.winner).not.toBeNull();
    expect(g.players[g.winner!].pos).toBe(101);
  });
});

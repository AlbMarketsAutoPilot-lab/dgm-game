// Phase C1 (owner, 26 Nov 2026): the v3 engine writes what happens to `events`, in order, for the screens. These tests
// check that the events tell the whole story: replaying them gives every token's square and every player's cards after
// every turn, every die thrown is in them, and the main moments come out in the right order.
import { describe, expect, it } from "vitest";
import { rng, d6 } from "../src/engine/rng";
import { DESTINATIONS, Game3, robot, runTurn3, type Event3, type Player3 } from "../src/engine/v3";

const LF = DESTINATIONS["lantern-festival"];
const allDone = () => LF.areas.map(() => true);
const scripted = (dice: number[]) => () => { if (!dice.length) throw new Error("dice ran out"); return dice.shift()!; };

function oneTurn(dice: number[], setup: Partial<Player3>[], answer: (d: unknown) => boolean | number = () => false): { g: Game3; ev: Event3[] } {
  const g = new Game3(LF, { players: setup.length, dice: scripted(dice), setup: setup.map((s) => ({ home: false, cards: 0, done: allDone(), ...s })) });
  const ev = runTurn3(g, answer);
  return { g, ev: ev.filter((e) => e.type !== "turn") };
}

describe("v3 events: the whole story of every game", () => {
  it("replaying the events gives every square and every card count, turn by turn (300 games of robots)", () => {
    const rand = rng(77);
    for (let n = 0; n < 300; n++) {
      const players = 2 + (n % 3);
      let thrown = 0;
      const g = new Game3(LF, { players, dice: () => { thrown++; return d6(rand); }, robots: Array(players).fill(true) });
      const pos = Array(players).fill(0), cards = Array(players).fill(LF.rules.startCards);
      let rolls = 0;
      while (!g.over) {
        for (const e of runTurn3(g, robot)) {
          switch (e.type) {
            case "roll": rolls++; break;
            case "move": case "jump": expect(pos[e.player]).toBe(e.from); pos[e.player] = e.to; break;
            case "swap": [pos[e.player], pos[e.other]] = [pos[e.other], pos[e.player]]; break;
            case "bump": expect(pos[e.victim]).toBe(e.square); pos[e.victim] = 0; break;
            case "card": cards[e.player]++; if (e.from !== undefined) cards[e.from]--; break;
            case "cardUsed": cards[e.player]--; break;
          }
        }
        expect(pos).toEqual(g.players.map((p) => p.pos));
        expect(cards).toEqual(g.players.map((p) => p.cards));
        expect(rolls).toBe(thrown);
      }
      const wins = g.events.filter((e) => e.type === "win");
      expect(wins).toEqual(g.winner === null ? [] : [{ type: "win", player: g.winner, boat: g.wonByBoat }]);
    }
  });
});

describe("v3 events: the moments, in order", () => {
  it("Home: a 6 frees you (it does not move you), then the roll moves you", () => {
    expect(oneTurn([6, 3], [{ pos: 0, home: true }]).ev).toEqual([
      { type: "roll", player: 0, value: 6, why: "wait" }, { type: "free", player: 0, where: "home", by: "six" },
      { type: "roll", player: 0, value: 3, why: "move" }, { type: "move", player: 0, from: 0, to: 3, dir: 1, by: "roll", doubled: false },
    ]);
  });
  it("Home: no 6", () => {
    expect(oneTurn([2], [{ pos: 0, home: true }]).ev).toEqual([
      { type: "roll", player: 0, value: 2, why: "wait" }, { type: "noSix", player: 0, where: "home", tries: 1 },
    ]);
  });
  it("the tree: the card frees you, then you roll", () => {
    const { ev } = oneTurn([2], [{ pos: 27, stuck: true, cards: 1 }], () => true);
    expect(ev.slice(0, 2)).toEqual([{ type: "cardUsed", player: 0, use: "tree" }, { type: "free", player: 0, where: "tree", by: "card" }]);
  });
  it("a red square cancelled with the card: the square, then the card, nothing else", () => {
    const { ev } = oneTurn([1], [{ pos: 48, cards: 1 }], () => true);
    expect(ev.slice(3)).toEqual([{ type: "cardUsed", player: 0, use: "square" }]);
    expect(ev[2]).toMatchObject({ type: "square", square: 49 });
  });
  it("a red square's jump bumps the player standing there", () => {
    const { ev } = oneTurn([1], [{ pos: 48 }, { pos: 31 }]);
    expect(ev.slice(3)).toEqual([
      { type: "jump", player: 0, from: 49, to: 31, cause: "tile" }, { type: "bump", player: 0, victim: 1, square: 31 },
    ]);
  });
  it("sixes: a run of three 6s is told", () => {
    const { ev } = oneTurn([6, 6, 6, 1], [{ pos: 1 }]);
    expect(ev.filter((e) => e.type === "sixes")).toEqual([{ type: "sixes", player: 0, count: 3 }]);
  });
  it("too far: the token stays", () => {
    expect(oneTurn([5], [{ pos: 98 }]).ev).toEqual([{ type: "roll", player: 0, value: 5, why: "move" }, { type: "overshoot", player: 0, squares: 5 }]);
  });
  it("entering the Forest: the area effect, then the backward move waiting", () => {
    const { ev } = oneTurn([3], [{ pos: 21, done: [true, true, false, true, true, true] }]);
    expect(ev.slice(2)).toEqual([{ type: "area", player: 0, area: 2, effect: "backward" }, { type: "pending", player: 0, what: "back" }]);
  });
  it("Plot Twist with nobody ahead", () => {
    expect(oneTurn([1], [{ pos: 36 }, { pos: 10 }]).ev.at(-1)).toEqual({ type: "noLeader", player: 0 });
  });
  it("the Dragon Boat: there, then the 4 wins; any other roll goes back", () => {
    expect(oneTurn([1], [{ pos: 68 }]).ev.slice(3)).toEqual([{ type: "jump", player: 0, from: 69, to: 97, cause: "boat" }]);
    expect(oneTurn([4], [{ pos: 97, boat: true }]).ev).toEqual([
      { type: "roll", player: 0, value: 4, why: "boat" }, { type: "move", player: 0, from: 97, to: 101, dir: 1, by: "roll", doubled: false },
      { type: "win", player: 0, boat: true },
    ]);
    expect(oneTurn([6], [{ pos: 97, boat: true }]).ev.at(-1)).toEqual({ type: "jump", player: 0, from: 97, to: 69, cause: "boatBack" });
  });
  it("the Swap Market: who gives the card to whom", () => {
    expect(oneTurn([1], [{ pos: 78, cards: 1 }, { pos: 50 }]).ev.at(-1)).toEqual({ type: "card", player: 1, source: "market", from: 0 });
    expect(oneTurn([1], [{ pos: 78 }, { pos: 50 }]).ev.at(-1)).toEqual({ type: "marketNone", player: 0 });
  });
  it("a missed turn", () => {
    expect(oneTurn([], [{ pos: 5, skip: 2 }]).ev).toEqual([{ type: "skip", player: 0, left: 1 }]);
  });
});

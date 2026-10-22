// The first player is drawn at random by the app (owner, 15 Oct: U3). The engine takes it as `first`: that seat opens
// every round. The default (seat 0) is the measured simulator's order.
import { describe, expect, it } from "vitest";
import { BOARDS, Game, runTurn, simplePlayer } from "../src/engine";

const order = (g: Game, turns: number) => {
  const seats: [number, number][] = [];
  for (let i = 0; i < turns && !g.over; i++) { runTurn(g, simplePlayer); seats.push([g.currentSeat, g.round]); }
  return seats;
};

describe("first player", () => {
  it("default: seat 0 opens every round", () => {
    expect(order(new Game(BOARDS.short, { players: 3, seed: 5 }), 4)).toEqual([[0, 1], [1, 1], [2, 1], [0, 2]]);
  });

  it("seat 2 of 4 opens round 1 and every round after it", () => {
    expect(order(new Game(BOARDS.short, { players: 4, seed: 5, first: 2 }), 6)).toEqual([[2, 1], [3, 1], [0, 1], [1, 1], [2, 2], [3, 2]]);
  });

  it("refuses a seat that does not exist", () => {
    expect(() => new Game(BOARDS.short, { players: 2, first: 2 })).toThrow();
  });

  it("the same seed and first seat play the same game", () => {
    const a = new Game(BOARDS.long, { players: 4, seed: 77, first: 3 }), b = new Game(BOARDS.long, { players: 4, seed: 77, first: 3 });
    while (!a.over) runTurn(a, simplePlayer);
    while (!b.over) runTurn(b, simplePlayer);
    expect(b.events).toEqual(a.events);
  });
});

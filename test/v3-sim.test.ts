// Step I phase A2: the v3 simulator (tools/sim/engine3.mjs) with scripted dice, one test per rule of docs/GCD.md
// §8.2a R1–R20 and the owner's decisions of 25 Nov 2026 (docs/prompts/StepI_destinations.md Part 2).
import { describe, expect, it } from "vitest";
import lf from "../data/lantern-festival.json";
// @ts-expect-error -- plain JavaScript without type declarations
import { simulate3 } from "../tools/sim/engine3.mjs";

interface P3 {
  pos: number; home: boolean; cards: number; stuck: boolean; skip: number; slow: boolean; dbl: boolean; back: boolean;
  boat: boolean; tries: number; done: boolean[]; bumped: number; waitHome: number; waitTree: number; sixRuns: number[];
  used: Record<string, number>; got: Record<string, number>;
}
// Areas: 0 Home Town, 1 Countryside, 2 Forest, 3 Mountains, 4 Seaside, 5 Big City.
const HT = 0, CS = 1, FO = 2, MO = 3, SE = 4, BC = 5;
/** Every area effect already used, except the ones listed. */
const fresh = (...open: number[]) => [0, 1, 2, 3, 4, 5].map((a) => !open.includes(a));

function play(o: { dice: number[]; turns: number; setup?: Partial<P3>[]; players?: number; types?: string[] }): P3[] {
  const setup = (o.setup ?? []).map((st) => ({ home: false, cards: 0, done: fresh(), ...st }));
  const run = () => simulate3(lf, { players: o.players ?? setup.length ?? 1, types: o.types ?? null, diceScript: o.dice, setup, turns: o.turns }, 1, 1);
  const r = run() as { players: P3[] };
  return r.players;
}
const HOME = { pos: 0, home: true, cards: 1, done: fresh(CS, FO, MO, SE, BC) };

describe("v3 simulator: Home and sixes (R1, R2, R5)", () => {
  it("R1: everyone starts at Home with 1 Bonus card", () => {
    const P = simulate3(lf, { players: 3, diceScript: [1, 1, 1], turns: 3 }, 1, 1).players as P3[];
    for (const p of P) expect([p.pos, p.home, p.cards]).toEqual([0, true, 1]);
  });
  it("R1: no 6, the robot stays at Home and keeps its card", () => {
    const [p] = play({ dice: [3], turns: 1, setup: [HOME] });
    expect([p.pos, p.home, p.cards, p.waitHome]).toEqual([0, true, 1, 1]);
  });
  it("R1: the 6 only frees you, then you roll to move (6, 4 -> square 4)", () => {
    expect(play({ dice: [6, 4], turns: 1, setup: [HOME] })[0].pos).toBe(4);
  });
  it("R1: the simple player uses its card at Home and rolls to move", () => {
    const [p] = play({ dice: [3], turns: 1, setup: [HOME], types: ["simple"] });
    expect([p.pos, p.cards, p.used.home]).toEqual([3, 0, 1]);
  });
  it("R20: the robot is forced to use its card on the 3rd throw without a 6 and moves by that throw", () => {
    const [p] = play({ dice: [1, 2, 3], turns: 3, setup: [HOME] });
    expect([p.pos, p.home, p.cards, p.used.forced, p.waitHome]).toEqual([3, false, 0, 1, 2]);
  });
  it("R20: without a card the robot keeps rolling for a 6 (nothing forced)", () => {
    const [p] = play({ dice: [1, 2, 3, 5], turns: 4, setup: [{ ...HOME, cards: 0 }] });
    expect([p.pos, p.home, p.waitHome]).toEqual([0, true, 4]);
  });
  it("R2: every 6 rolls again with no limit, one move by the total", () => {
    expect(play({ dice: [6, 6, 6, 6, 1], turns: 1, setup: [{ pos: 40 }] })[0].pos).toBe(65);
    expect(play({ dice: [6, 6, 6, 6, 1], turns: 1, setup: [{ pos: 40 }] })[0].sixRuns).toEqual([0, 1, 0, 0]);
  });
  it("R2: the 6 that frees you is not part of the run (6 | 6, 6, 1 = 13, no run of three)", () => {
    const [p] = play({ dice: [6, 6, 6, 1], turns: 1, setup: [{ ...HOME, done: fresh() }] });
    expect([p.pos, p.sixRuns[0]]).toEqual([13, 0]);
  });
  it("R3: passing over an event square does nothing", () => {
    expect(play({ dice: [5], turns: 1, setup: [{ pos: 3 }] })[0].pos).toBe(8);
  });
});

describe("v3 simulator: bump and finish (R4, R5, R7)", () => {
  it("R4: landing on a player sends them Home; R5: they leave without a 6", () => {
    const P = play({ dice: [3, 2], turns: 2, setup: [{ pos: 1 }, { pos: 4 }] });
    expect([P[0].pos, P[1].pos, P[1].bumped]).toEqual([4, 2, 1]);
  });
  it("R4: a jump bumps too (10 -> 16)", () => {
    const P = play({ dice: [2], turns: 1, setup: [{ pos: 8 }, { pos: 16 }] });
    expect([P[0].pos, P[1].pos, P[1].home]).toEqual([16, 0, false]);
  });
  it("R7: exact finish; too big stays; a 6 never finishes", () => {
    expect(play({ dice: [5], turns: 1, setup: [{ pos: 98 }] })[0].pos).toBe(98);
    expect(play({ dice: [3], turns: 1, setup: [{ pos: 98 }] })[0].pos).toBe(101);
    expect(play({ dice: [6, 1], turns: 1, setup: [{ pos: 95 }] })[0].pos).toBe(95);
  });
});

describe("v3 simulator: the fallen tree (R6)", () => {
  it("landing on 27 by a roll: stuck; no 6 = wait", () => {
    const [p] = play({ dice: [2, 3], turns: 2, setup: [{ pos: 25 }] });
    expect([p.pos, p.stuck, p.waitTree]).toEqual([27, true, 1]);
  });
  it("a 6 frees you, then you roll to move", () => {
    expect(play({ dice: [6, 2], turns: 1, setup: [{ pos: 27, stuck: true }] })[0].pos).toBe(29);
  });
  it("the robot is forced on its 3rd throw with a card; the simple player uses it at once", () => {
    const [r] = play({ dice: [1, 2, 4], turns: 3, setup: [{ pos: 27, stuck: true, cards: 1 }] });
    expect([r.pos, r.stuck, r.cards, r.used.forced]).toEqual([31, false, 0, 1]);
    const [s] = play({ dice: [4], turns: 1, setup: [{ pos: 27, stuck: true, cards: 1 }], types: ["simple"] });
    expect([s.pos, s.used.tree]).toEqual([31, 1]);
  });
  it("a stuck player can be bumped (goes Home, no longer stuck)", () => {
    const P = play({ dice: [2], turns: 1, setup: [{ pos: 25 }, { pos: 27, stuck: true }] });
    expect([P[1].pos, P[1].stuck, P[0].stuck]).toEqual([0, false, true]);
  });
  it("a pending Forest backward move happens at once and frees you", () => {
    const [p] = play({ dice: [4], turns: 1, setup: [{ pos: 27, stuck: true, back: true }] });
    expect([p.pos, p.stuck, p.back]).toEqual([23, false, false]);
  });
  it("entering the Forest on the tree: stuck, and the backward move is pending", () => {
    const [p] = play({ dice: [6, 2], turns: 1, setup: [{ pos: 19, done: fresh(FO) }] });
    expect([p.pos, p.stuck, p.back]).toEqual([27, true, true]);
  });
});

describe("v3 simulator: event squares (R8–R11, R14)", () => {
  it("R8: a fixed jump does not trigger the square it lands on, and a dice move does (61: 1+2+2 -> 66 -> 55)", () => {
    expect(play({ dice: [1], turns: 1, setup: [{ pos: 48 }] })[0].pos).toBe(31);
    expect(play({ dice: [1, 1, 2, 2], turns: 1, setup: [{ pos: 60 }] })[0].pos).toBe(55);
  });
  it("R9 (7): next turn exactly 1 square, without rolling", () => {
    const [p] = play({ dice: [3], turns: 2, setup: [{ pos: 4 }], players: 1 });
    expect(p.pos).toBe(8);
  });
  it("R9 (72): every other player's next roll counts double; two doubles never stack", () => {
    const P = play({ dice: [2, 3], turns: 2, setup: [{ pos: 70 }, { pos: 40, dbl: true }] });
    expect([P[0].pos, P[1].pos, P[1].dbl]).toEqual([72, 46, false]);
  });
  it("R9 (99): back to 92 and miss 2 turns", () => {
    const [p] = play({ dice: [1], turns: 3, setup: [{ pos: 98 }], players: 1 });
    expect([p.pos, p.skip]).toEqual([92, 0]);
  });
  it("R10: Plot Twist swaps with the leader; nobody ahead, nothing happens", () => {
    const P = play({ dice: [4], turns: 1, setup: [{ pos: 33 }, { pos: 60 }, { pos: 50 }] });
    expect([P[0].pos, P[1].pos, P[2].pos]).toEqual([60, 37, 50]);
    expect(play({ dice: [4], turns: 1, setup: [{ pos: 33 }, { pos: 10 }] })[0].pos).toBe(37);
  });
  it("R11: 32 goes to the next reward square (37) and it applies", () => {
    const P = play({ dice: [2], turns: 1, setup: [{ pos: 30 }, { pos: 80 }] });
    expect([P[0].pos, P[1].pos]).toEqual([80, 37]);
  });
  it("R14: the card cancels your own punishment (you stay); without a card it happens", () => {
    const [a] = play({ dice: [1], turns: 1, setup: [{ pos: 48, cards: 1 }] });
    expect([a.pos, a.cards, a.used.square]).toEqual([49, 0, 1]);
    expect(play({ dice: [1], turns: 1, setup: [{ pos: 99, cards: 0 }] })[0].pos).toBe(82);
  });
  it("R14: card squares 30, 45, 85 give one", () => {
    expect(play({ dice: [5], turns: 1, setup: [{ pos: 40 }] })[0].cards).toBe(1);
  });
});

describe("v3 simulator: area effects (R16, owner 25 Nov 2026)", () => {
  it("Countryside: a gifted 6 + a new roll, one move (8 +3 -> 11, then 6+4 -> 21)", () => {
    const [p] = play({ dice: [3, 4], turns: 1, setup: [{ pos: 8, done: fresh(CS) }] });
    expect([p.pos, p.done[CS]]).toEqual([21, true]);
  });
  it("the gifted 6 is an event: it carries you into the Forest with no Forest effect, and the Forest is not used up", () => {
    const [p] = play({ dice: [4, 5], turns: 1, setup: [{ pos: 9, done: fresh(CS, FO) }] });
    expect([p.pos, p.back, p.done[FO]]).toEqual([24, false, false]);
  });
  it("Forest: your next move goes backward (no square event where you land), never past Home", () => {
    const [p] = play({ dice: [4, 3], turns: 2, setup: [{ pos: 21, done: fresh(FO) }], players: 1 });
    expect([p.pos, p.back]).toEqual([22, false]);
    const [h] = play({ dice: [6, 6, 6, 6, 1], turns: 1, setup: [{ pos: 24, back: true }] });
    expect([h.pos, h.home]).toEqual([0, false]);
  });
  it("Forest: the robot cancels it with its card", () => {
    const [p] = play({ dice: [4], turns: 1, setup: [{ pos: 21, cards: 1, done: fresh(FO) }] });
    expect([p.back, p.cards, p.used.area]).toEqual([false, 0, 1]);
  });
  it("Mountains: the next roll counts double", () => {
    const [p] = play({ dice: [5, 3], turns: 2, setup: [{ pos: 36, done: fresh(MO) }], players: 1 });
    expect(p.pos).toBe(47);
  });
  it("Seaside: swap with the player just in front within 20; otherwise (or leading) a card", () => {
    const P = play({ dice: [4], turns: 1, setup: [{ pos: 54, done: fresh(SE) }, { pos: 70 }, { pos: 90 }] });
    expect([P[0].pos, P[1].pos]).toEqual([70, 58]);
    const Q = play({ dice: [4], turns: 1, setup: [{ pos: 54, done: fresh(SE) }, { pos: 80 }] });
    expect([Q[0].pos, Q[0].cards]).toEqual([58, 1]);
  });
  it("Big City: swap with the player just behind within 10; otherwise lose your next turn (the card cancels that)", () => {
    const P = play({ dice: [5], turns: 1, setup: [{ pos: 75, done: fresh(BC) }, { pos: 73 }] });
    expect([P[0].pos, P[1].pos]).toEqual([73, 80]);
    const Q = play({ dice: [5], turns: 1, setup: [{ pos: 75, done: fresh(BC) }, { pos: 40 }] });
    expect([Q[0].pos, Q[0].skip]).toEqual([80, 1]);
    const C = play({ dice: [5], turns: 1, setup: [{ pos: 75, cards: 1, done: fresh(BC) }, { pos: 40 }] });
    expect([C[0].skip, C[0].cards]).toEqual([0, 0]);
  });
  it("entering an area through a square's event gives nothing and does not use it up (17 -> 33, 20 -> 36, 69 -> 97)", () => {
    const [a] = play({ dice: [3], turns: 1, setup: [{ pos: 14, done: fresh(CS, FO) }] });
    expect([a.pos, a.back, a.done[FO]]).toEqual([33, false, false]);
    const [b] = play({ dice: [2], turns: 1, setup: [{ pos: 67, done: fresh(BC) }] });
    expect([b.pos, b.boat, b.skip, b.done[BC]]).toEqual([97, true, 0, false]);
  });
  it("a roll into a new area whose square's event takes you out of it: no effect (8 +9 -> 17 -> 33)", () => {
    const [p] = play({ dice: [6, 3], turns: 1, setup: [{ pos: 8, done: fresh(CS, FO) }] });
    expect([p.pos, p.back, p.done[CS], p.done[FO]]).toEqual([33, false, false, false]);
  });
  it("each area once per player: entering again gives nothing; Home Town has none", () => {
    const [p] = play({ dice: [4], turns: 1, setup: [{ pos: 21 }] });
    expect(p.back).toBe(false);
    const [h] = play({ dice: [6, 3], turns: 1, setup: [{ ...HOME, done: fresh(HT) }] });
    expect(h.pos).toBe(3);
  });
});

describe("v3 simulator: the Dragon Boat (R17) and the Swap Market (R18)", () => {
  it("69 -> 97; next played turn a 4 wins", () => {
    const [p] = play({ dice: [2, 4], turns: 2, setup: [{ pos: 67 }], players: 1 });
    expect(p.pos).toBe(101);
  });
  it("anything else (a 6 too, no extra roll) takes you back to 69 and bumps whoever is there", () => {
    const P = play({ dice: [6], turns: 1, setup: [{ pos: 97, boat: true }, { pos: 69 }] });
    expect([P[0].pos, P[0].boat, P[1].pos]).toEqual([69, false, 0]);
  });
  it("a missed turn waits; a pending double is ignored", () => {
    const [p] = play({ dice: [4], turns: 2, setup: [{ pos: 97, boat: true, skip: 1 }], players: 1 });
    expect(p.pos).toBe(101);
    const [d] = play({ dice: [2], turns: 1, setup: [{ pos: 97, boat: true, dbl: true }] });
    expect([d.pos, d.dbl]).toEqual([69, false]);
  });
  it("bumped on 97: the deal ends; the card cannot help", () => {
    const P = play({ dice: [2], turns: 1, setup: [{ pos: 95, done: fresh() }, { pos: 97, boat: true, cards: 1 }] });
    expect([P[1].pos, P[1].boat, P[0].boat]).toEqual([0, false, false]);
  });
  it("2 players: give your card automatically; with none, take one; nothing if no card can move", () => {
    const G = play({ dice: [1], turns: 1, setup: [{ pos: 78, cards: 1 }, { pos: 10 }] });
    expect([G[0].cards, G[1].cards]).toEqual([0, 1]);
    const T = play({ dice: [1], turns: 1, setup: [{ pos: 78 }, { pos: 10, cards: 2 }] });
    expect([T[0].cards, T[1].cards]).toEqual([1, 1]);
    const N = play({ dice: [1], turns: 1, setup: [{ pos: 78 }, { pos: 10 }] });
    expect([N[0].cards, N[1].cards]).toEqual([0, 0]);
  });
  it("robot: gives to the player furthest behind; takes from the leader among the players holding a card", () => {
    const G = play({ dice: [1], turns: 1, setup: [{ pos: 78, cards: 1 }, { pos: 50 }, { pos: 20 }, { pos: 90 }] });
    expect(G.map((p) => p.cards)).toEqual([0, 0, 1, 0]);
    const T = play({ dice: [1], turns: 1, setup: [{ pos: 78 }, { pos: 50, cards: 1 }, { pos: 60, cards: 1 }, { pos: 90 }] });
    expect(T.map((p) => p.cards)).toEqual([1, 1, 0, 0]);
  });
});

describe("v3 simulator: whole games", () => {
  it("2–4 robots: every game ends, seats near fair", () => {
    for (const players of [2, 3, 4]) {
      const r = simulate3(lf, { players }, 4000, 7);
      expect(r.capped).toBe(0);
      for (const w of r.fairness.seatWinPct) expect(Math.abs(w - 100 / players)).toBeLessThan(4);
    }
  });
  it("the same seed plays the same games", () => {
    const a = simulate3(lf, { players: 4, perGame: true }, 50, 3), b = simulate3(lf, { players: 4, perGame: true }, 50, 3);
    expect(a.records).toEqual(b.records);
  });
});

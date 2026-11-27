// What the game screen says about a player's next move (audit of 27 Nov 2026: B5–B8, B13): the "needs N" tag, the
// turn line's finish, the die faces and "gets here with a N" follow the engine: a doubled roll, "exactly 1 square", the
// Forest's backward move, the fallen tree and the Dragon Boat.
import { describe, expect, it } from "vitest";
import { DESTINATIONS, Game3, robot, type Player3 } from "../src/engine/v3";
import { boatNeed, faceFor, finishFace, needTag, plainThrow, reachFace } from "../src/ui/turn-info";

const LF = DESTINATIONS["lantern-festival"];
const P = (o: Partial<Player3> = {}) => ({ home: false, stuck: false, skip: 0, slow: false, dbl: false, back: false, boat: false, ...o });

describe("the needs tag", () => {
  it("at Home before the first start: needs 6; after a bump: nothing", () => {
    expect(needTag(LF, P({ home: true }), 0)).toBe("needs 6");
    expect(needTag(LF, P(), 0)).toBe("");
  });
  it("at the fallen tree: needs 6, unless the Forest's backward move frees it (R6)", () => {
    expect(needTag(LF, P({ stuck: true }), 27)).toBe("needs 6");
    expect(needTag(LF, P({ stuck: true, back: true }), 27)).toBe("");
  });
  it("on the Dragon Boat: the boat's own number", () => {
    expect(boatNeed(LF)).toBe(4);
    expect(needTag(LF, P({ boat: true }), 97)).toBe("needs 4");
  });
  it("near the end: the face that finishes, never a 6", () => {
    expect(needTag(LF, P(), 98)).toBe("needs 3");
    expect(needTag(LF, P(), 95)).toBe(""); // 6 squares: a 6 rolls again
  });
  it("with a doubled roll: half the distance, or nothing when no face lands exactly", () => {
    expect(needTag(LF, P({ dbl: true }), 97)).toBe("needs 2");
    expect(needTag(LF, P({ dbl: true }), 98)).toBe("");
    expect(needTag(LF, P({ dbl: true }), 91)).toBe("needs 5");
  });
  it("with exactly 1 square or a backward move: nothing", () => {
    expect(needTag(LF, P({ slow: true }), 98)).toBe("");
    expect(needTag(LF, P({ back: true }), 98)).toBe("");
  });
});

describe("the faces of one throw", () => {
  it("1–5 only; a doubled roll moves twice the face", () => {
    expect([1, 2, 3, 4, 5, 6].map((n) => faceFor(n, false))).toEqual([1, 2, 3, 4, 5, 0]);
    expect([1, 2, 3, 4, 10, 12].map((n) => faceFor(n, true))).toEqual([0, 1, 0, 2, 5, 0]);
  });
  it("no faces ahead while a backward move, exactly 1, a missed turn, the boat or a 6 waits", () => {
    for (const o of [{ back: true }, { slow: true }, { skip: 1 }, { boat: true }, { stuck: true }]) expect(plainThrow(P(o), 30), JSON.stringify(o)).toBe(false);
    expect(plainThrow(P({ home: true }), 0)).toBe(false);
    expect(plainThrow(P(), 0)).toBe(true); // bumped: no 6 needed
    expect(reachFace(P({ back: true }), 30, 33)).toBe(0);
    expect(reachFace(P({ dbl: true }), 30, 36)).toBe(3);
  });
});

describe("against the engine", () => {
  it("the face the tag names finishes in the engine, and with no tag no face finishes", () => {
    for (const dbl of [false, true]) for (let pos = 90; pos <= 100; pos++) {
      const f = finishFace(LF, P({ dbl }), pos);
      for (let face = 1; face <= 5; face++) {
        const g = new Game3(LF, { players: 2, setup: [{ pos, home: false, dbl, cards: 0 }, { pos: 0 }], dice: () => face });
        while (!g.over && g.round < 2) { const t = g.turn(); for (let r = t.next(); !r.done; r = t.next(robot(r.value, g))); if (g.current === 0) break; }
        expect(g.winner === 0, `square ${pos}, double ${dbl}, face ${face}`).toBe(face === f);
      }
    }
  });
});

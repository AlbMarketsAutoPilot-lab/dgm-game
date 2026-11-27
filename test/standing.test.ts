// Mr. Lin's words when a person passes the die (owner, Step I phase F, 27 Nov 2026): where the player stands, then the
// nearest traveller ahead and behind; the texts approved word for word.
import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "../src/engine/v3";
import { standingWords } from "../src/ui/standing";

const LF = DESTINATIONS["lantern-festival"];
const NAMES = ["Blue", "Red", "Green", "Yellow"];
const say = (places: number[], at: { boat?: boolean; stuck?: boolean } = {}, seat = 0) =>
  standingWords(LF, seat, places, { boat: !!at.boat, stuck: !!at.stuck }, (i) => NAMES[i]);

describe("Mr. Lin at the passing of the die", () => {
  it("on the road, with a traveller ahead and one behind", () => {
    expect(say([56, 66, 51, 0])).toBe("You stand in the Mountains, and 45 squares still lie between you and the festival lights. Red walks 10 squares ahead of you, and Green follows 5 squares behind.");
  });

  it("leading: nobody ahead", () => {
    expect(say([80, 66, 51, 0])).toBe("You stand in the Big City, and 21 squares still lie between you and the festival lights. You lead all travellers, and Red follows 14 squares behind.");
  });

  it("last: nobody behind (players still at Home do not count as behind)", () => {
    expect(say([12, 66, 51, 30])).toBe("You stand in the Countryside, and 89 squares still lie between you and the festival lights. Yellow walks 18 squares ahead, and no one follows in your footsteps.");
  });

  it("the others all still at Home", () => {
    expect(say([8, 0, 0, 0])).toBe("You stand in Home Town, and 93 squares still lie between you and the festival lights. The other travellers have not yet left Home.");
  });

  it("at Home", () => {
    expect(say([0, 0, 0])).toBe("You are still at Home, and the whole road waits for your first step. No traveller has left Home yet.");
    expect(say([0, 30, 0])).toBe("You are still at Home, and the whole road waits for your first step. Red walks 30 squares ahead, and no one follows in your footsteps.");
  });

  it("at the fallen tree and on the Dragon Boat", () => {
    expect(say([27, 66, 0, 0], { stuck: true })).toBe("The fallen tree still bars your way, 74 squares from the festival lights. Red walks 39 squares ahead, and no one follows in your footsteps.");
    expect(say([97, 66, 51, 30], { boat: true })).toBe("You wait on the Dragon Boat; only a 4 will bring you ashore. You lead all travellers, and Red follows 31 squares behind.");
  });

  it("says \"1 square\" (and \"1 square still lies\"), never \"1 squares\"", () => {
    expect(say([100, 99, 0])).toBe("You stand in the Big City, and 1 square still lies between you and the festival lights. You lead all travellers, and Red follows 1 square behind.");
    expect(say([40, 41, 39])).toContain("Red walks 1 square ahead of you, and Green follows 1 square behind.");
  });

  it("speaks of the player who passes the die, whoever's seat it is", () => {
    expect(say([56, 66, 51, 0], {}, 2)).toBe("You stand in the Mountains, and 50 squares still lie between you and the festival lights. Blue walks 5 squares ahead, and no one follows in your footsteps.");
  });
});

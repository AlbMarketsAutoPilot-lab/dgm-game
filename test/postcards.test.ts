// Journey postcards (GCD §12): which events earn which postcard, people only; the album survives blocked storage.
// Step I phase C6 (owner, 25–26 Nov 2026): the Lantern Festival's set, earned from the v3 engine's events.
import { afterEach, describe, expect, it, vi } from "vitest";
import { DESTINATIONS, Game3, robot, runTurn3, type Event3 } from "../src/engine/v3";
import { ART } from "../src/render/art";
import { POSTCARDS, loadAlbum, postcardsFor, saveAlbum } from "../src/ui/postcards";

const LF = DESTINATIONS["lantern-festival"], person = () => true, ids = (e: Event3) => postcardsFor(LF, e, person).map((c) => c.id);

describe("which events earn which postcard", () => {
  it("17 postcards: 6 areas and 11 moments, unique ids, each with its own picture", () => {
    expect(POSTCARDS).toHaveLength(17);
    expect(new Set(POSTCARDS.map((p) => p.id)).size).toBe(17);
    for (const p of POSTCARDS) expect(ART, p.id).toHaveProperty(p.icon);
  });
  it("the removed postcards are gone from the album; kept ids keep what was collected", () => {
    for (const gone of ["bog-boots", "three-sixes", "the-bog", "snake-leader", "river-lake", "festival-road"]) expect(POSTCARDS.some((p) => p.id === gone)).toBe(false);
    expect(POSTCARDS.find((p) => p.id === "forgot-keys")?.title).toBe("Out Again!");
    expect(POSTCARDS.find((p) => p.id === "festival")?.title).toBe("The Lantern Festival");
  });
  it("every area has its postcard", () => {
    for (const a of LF.areas) expect(ids({ type: "move", player: 0, from: 1, to: Math.max(1, a.from), dir: 1, by: "roll", doubled: false }), a.name).toHaveLength(1);
  });
  const sq = (n: number): Event3 => ({ type: "square", player: 0, square: n, tile: LF.tiles[n] });
  it.each([
    [{ type: "move", player: 0, from: 0, to: 5, dir: 1, by: "roll", doubled: false }, ["home-town"]],
    [{ type: "move", player: 0, from: 0, to: 11, dir: 1, by: "roll", doubled: false }, ["home-town", "countryside"]],
    [{ type: "jump", player: 0, from: 69, to: 97, cause: "boat" }, ["big-city", "dragon-boat"]],
    [{ type: "win", player: 0, boat: false }, ["festival"]],
    [{ type: "win", player: 0, boat: true }, ["festival", "straight-off-the-boat"]],
    [sq(27), ["fallen-tree"]],
    [sq(99), ["forgot-keys"]],
    [sq(96), []], // the first flame out is not "Out Again!"
    [{ type: "sixes", player: 0, count: 3 }, ["sixes-3"]],
    [{ type: "sixes", player: 0, count: 5 }, ["sixes-3", "sixes-4", "sixes-5"]],
    [{ type: "sixes", player: 0, count: 8 }, ["sixes-3", "sixes-4", "sixes-5", "sixes-6"]],
    [{ type: "cardUsed", player: 0, use: "square" }, ["dodged-it"]],
    [{ type: "cardUsed", player: 0, use: "home" }, []],
    [{ type: "swap", player: 0, other: 1, cause: "leader" }, ["plot-twist"]],
    [{ type: "swap", player: 0, other: 1, cause: "ahead" }, []],
    [{ type: "roll", player: 0, value: 6, why: "move" }, []],
  ] as [Event3, string[]][])("%o → %o", (e, want) => expect(ids(e)).toEqual(want));
  it("robots collect nothing", () => {
    expect(postcardsFor(LF, { type: "win", player: 1, boat: false }, (seat) => seat === 0)).toEqual([]);
  });
  it("a whole game: every postcard a person earns is in the list", () => {
    const g = new Game3(LF, { players: 2, seed: 7 });
    while (!g.over) runTurn3(g, robot);
    const got = new Set(g.events.flatMap((e) => postcardsFor(LF, e, person).map((c) => c.id)));
    expect(got.has("home-town")).toBe(true);
    for (const id of got) expect(POSTCARDS.some((p) => p.id === id)).toBe(true);
  });
});

describe("the album on this device", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("is saved and loaded", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) });
    saveAlbum(new Set(["seaside", "the-bog"]));
    expect([...loadAlbum()].sort()).toEqual(["seaside", "the-bog"]);
  });
  it("blocked storage: no error, an empty album, the game goes on", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
    expect(() => saveAlbum(new Set(["seaside"]))).not.toThrow();
    expect(loadAlbum().size).toBe(0);
  });
});

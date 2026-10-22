// Journey postcards (GCD §12): which events earn which postcard, people only; the album survives blocked storage.
import { afterEach, describe, expect, it, vi } from "vitest";
import { BOARDS, Game, simplePlayer, type GameEvent } from "../src/engine";
import { POSTCARDS, loadAlbum, postcardsFor, saveAlbum } from "../src/ui/postcards";

const L = BOARDS.long, S = BOARDS.short, person = () => true, ids = (e: GameEvent, b = L) => postcardsFor(b, e, person).map((c) => c.id);

describe("which events earn which postcard", () => {
  it("16 postcards: 8 regions and 8 special moments, unique ids", () => {
    expect(POSTCARDS).toHaveLength(16);
    expect(new Set(POSTCARDS.map((p) => p.id)).size).toBe(16);
  });
  it("every region of both boards has its postcard", () => {
    for (const b of [L, S]) for (const r of b.story.regions) {
      const got = ids({ type: "move", player: 0, from: r.from, to: Math.max(1, r.from), path: [], crossroads: false }, b);
      expect(got, `${b.id} ${r.name}`).toHaveLength(1);
    }
  });
  it.each([
    [{ type: "released", player: 0, where: "start", bySix: true, stairs: 0 }, ["home-town"]],
    [{ type: "released", player: 0, where: "trap", bySix: true, stairs: 0 }, []],
    [{ type: "move", player: 0, from: 1, to: 140, path: [], crossroads: false }, ["seaside"]],
    [{ type: "jump", player: 0, from: 40, to: 103, cause: "tile" }, ["river-lake"]],
    [{ type: "win", player: 0 }, ["festival"]],
    [{ type: "snakeLeader", player: 0 }, ["snake-leader"]],
    [{ type: "tile", player: 0, square: 198, tile: L.tiles[198] }, ["forgot-keys"]],
    [{ type: "tile", player: 0, square: 193, tile: L.tiles[193] }, []], // forgot keys (once) is not AGAIN
    [{ type: "bonusUsed", player: 0, use: "defend", target: 0, square: 30 }, ["dodged-it"]],
    [{ type: "bonusUsed", player: 0, use: "attack", target: 1, square: 20 }, []],
    [{ type: "trapped", player: 0, square: 30 }, ["the-bog"]],
    [{ type: "swap", player: 0, other: 1 }, ["plot-twist"]],
    [{ type: "bogBoots", player: 0 }, ["bog-boots"]],
    [{ type: "lanternWon", player: 0, total: 4 }, ["three-sixes"]],
    [{ type: "roll", player: 0, value: 6 }, []],
  ] as [GameEvent, string[]][])("%o → %o", (e, want) => expect(ids(e)).toEqual(want));
  it("computer players collect nothing", () => {
    expect(postcardsFor(L, { type: "win", player: 1 }, (seat) => seat === 0)).toEqual([]);
  });
  it("a whole game: every postcard a person earns is in the list", () => {
    const g = new Game(S, { players: 2, seed: 7 });
    while (!g.over) { const t = g.turn(); let r = t.next(); while (!r.done) r = t.next(simplePlayer(r.value, g)); }
    const got = new Set(g.events.flatMap((e) => postcardsFor(S, e, person).map((c) => c.id)));
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

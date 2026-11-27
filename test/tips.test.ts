// Mr. Lin's tips (Step I phase F, owner 27 Nov 2026): once per device, at most one per turn, in the agreed order;
// "How to play" shows them again; blocked or tampered storage never gives an error.
import { afterEach, describe, expect, it, vi } from "vitest";

const KEY = "dgm.tips.v1";
let store: Map<string, string>;

function storage(): void {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
}

/** A fresh copy of the module (it remembers blocked storage for the page's life). */
async function tips() {
  vi.resetModules();
  return import("../src/ui/tips");
}

afterEach(() => vi.unstubAllGlobals());

describe("Mr. Lin's tips", () => {
  it("has the six texts approved by the owner, word for word", async () => {
    const { TIPS } = await tips();
    expect(Object.keys(TIPS)).toEqual(["sixes", "tap", "bump", "card", "exact", "records"]);
    expect(TIPS.tap).toBe("A wise traveller looks at the road before walking it. Tap any square on the board, and it will tell you what waits there.");
    expect(TIPS.records).toBe("The fastest journeys are remembered in the Records. But only a journey travelled without interruption is counted.");
  });

  it("shows each tip once on this device, across games", async () => {
    storage();
    const { Tips, TIPS } = await tips();
    const a = new Tips();
    expect(a.quiet(false)).toBe(TIPS.tap);
    a.newTurn();
    expect(a.quiet(false)).toBe(TIPS.records); // T6 only after T2
    a.newTurn();
    expect(a.quiet(false)).toBeNull();
    expect(a.sixes()).toBe(TIPS.sixes);
    const b = new Tips(); // a new game on the same device
    expect(b.quiet(true)).toBe(TIPS.exact);
    b.newTurn();
    expect([b.quiet(true), b.sixes()]).toEqual([null, null]);
    expect(JSON.parse(store.get(KEY)!)).toEqual(["sixes", "tap", "exact", "records"]);
  });

  it("gives at most one tip per turn", async () => {
    storage();
    const { Tips, TIPS } = await tips();
    const t = new Tips();
    expect(t.quiet(true)).toBe(TIPS.exact);
    expect(t.sixes()).toBeNull(); // the same turn: the sixes tip waits
    expect(t.quiet(true)).toBeNull();
    t.newTurn();
    expect(t.sixes()).toBe(TIPS.sixes);
  });

  it("keeps the agreed order at a quiet turn: exact number, tap a square, Records", async () => {
    storage();
    const { Tips, TIPS } = await tips();
    const t = new Tips();
    const got: (string | null)[] = [];
    for (let i = 0; i < 4; i++) { t.newTurn(); got.push(t.quiet(true)); }
    expect(got).toEqual([TIPS.exact, TIPS.tap, TIPS.records, null]);
  });

  it("gives the bump and Bonus card tips at the end of the same turn, to the person it happened to, never later (owner, 27 Nov 2026)", async () => {
    storage();
    const { Tips, TIPS } = await tips();
    const t = new Tips();
    store.set(KEY, JSON.stringify(["tap", "records"]));
    t.newTurn();
    t.earn(1, "bump");
    expect(t.quiet(false)).toBeNull(); // never at a quiet turn
    expect(t.endOfTurn(0)).toBeNull(); // seat 0 did not bump anyone
    t.newTurn();
    t.earn(1, "bump");
    expect(t.endOfTurn(1)).toBe(TIPS.bump);
    t.newTurn();
    t.earn(1, "bump"); // shown already: not earned again
    expect(t.endOfTurn(1)).toBeNull();
    t.newTurn();
    t.earn(2, "card");
    t.newTurn(); // the turn ended without its tip (another tip was given): it never comes later
    expect(t.endOfTurn(2)).toBeNull();
    t.earn(2, "card");
    expect(t.endOfTurn(2)).toBe(TIPS.card);
  });

  it("forgets an earned tip with the game: a new game needs a new bump or punishment", async () => {
    storage();
    const { Tips } = await tips();
    store.set(KEY, JSON.stringify(["tap", "records"]));
    new Tips().earn(0, "card");
    expect(new Tips().endOfTurn(0)).toBeNull();
  });

  it("\"How to play\" shows them again", async () => {
    storage();
    const { Tips, TIPS, resetTips } = await tips();
    const t = new Tips();
    expect(t.quiet(false)).toBe(TIPS.tap);
    resetTips();
    expect(store.has(KEY)).toBe(false);
    expect(new Tips().quiet(false)).toBe(TIPS.tap);
  });

  it("blocked storage: no tips at all (they would come back every game), and no error", async () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } });
    const { Tips, resetTips } = await tips();
    const t = new Tips();
    expect(() => t.earn(0, "bump")).not.toThrow();
    expect(t.endOfTurn(0)).toBeNull();
    expect([t.quiet(true), t.sixes()]).toEqual([null, null]);
    expect(() => resetTips()).not.toThrow();
  });

  it("storage that cannot be written: the tip shows once, then no more tips, and no error", async () => {
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("full"); }, removeItem: () => {} });
    const { Tips, TIPS } = await tips();
    const t = new Tips();
    expect(t.quiet(false)).toBe(TIPS.tap);
    t.newTurn();
    expect([t.quiet(true), t.sixes()]).toEqual([null, null]);
  });

  it("tampered storage reads as none shown, and no error", async () => {
    for (const bad of ["{not json", "42", '{"tap":true}', '["tap", 7, "lunch"]']) {
      storage();
      store.set(KEY, bad);
      const { Tips, TIPS, shownTips } = await tips();
      expect(() => shownTips()).not.toThrow();
      const t = new Tips();
      // only real tip names count: '["tap", 7, "lunch"]' has shown "tap", so the Records tip comes next
      expect(t.quiet(false)).toBe(bad.startsWith("[") ? TIPS.records : TIPS.tap);
    }
  });
});

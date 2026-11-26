// The Records (Step I phase E, owner 26 Nov 2026): the top 10 win times on this device, ties, the 11th time, the first
// record, and blocked or tampered storage (never an error). Robots' wins never reach the ranking: their clock gives no
// time (test/clock.test.ts).
import { afterEach, describe, expect, it, vi } from "vitest";
import { TOP, addRecord, formatDate, formatTime, loadRecords, ordinal, parseRecord, recordOf, type WinRecord } from "../src/ui/records";

const KEY = "dgm.records.v1";
let store: Map<string, string>;

function memoryStorage() {
  store = new Map();
  vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) });
}
function blockedStorage() {
  vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
}

const rec = (s: number, seat = 0, date = "2026-11-26"): WinRecord => ({ s, seat, date, players: 4, destination: "lantern-festival" });

afterEach(() => vi.unstubAllGlobals());

describe("the Records", () => {
  it("the first time on this device sets the first record", () => {
    memoryStorage();
    expect(loadRecords()).toEqual([]);
    expect(addRecord(rec(600))).toEqual({ kind: "ranked", rank: 1, first: true });
    expect(loadRecords()).toEqual([rec(600)]);
  });

  it("ranks each time among the others, fastest first", () => {
    memoryStorage();
    addRecord(rec(600)); addRecord(rec(900));
    expect(addRecord(rec(500))).toEqual({ kind: "ranked", rank: 1, first: false }); // beating all previous records
    expect(addRecord(rec(700))).toEqual({ kind: "ranked", rank: 3, first: false });
    expect(loadRecords().map((r) => r.s)).toEqual([500, 600, 700, 900]);
  });

  it("ties: an equal newer time ranks below the older one", () => {
    memoryStorage();
    addRecord(rec(600, 0)); addRecord(rec(800, 1));
    expect(addRecord(rec(600, 2))).toEqual({ kind: "ranked", rank: 2, first: false });
    expect(addRecord(rec(600, 3))).toEqual({ kind: "ranked", rank: 3, first: false });
    expect(loadRecords().map((r) => r.seat)).toEqual([0, 2, 3, 1]);
  });

  it("keeps only the top 10: a slower 11th time is not ranked and nothing is written", () => {
    memoryStorage();
    for (let i = 1; i <= TOP; i++) addRecord(rec(100 * i));
    const before = store.get(KEY);
    expect(addRecord(rec(5000))).toEqual({ kind: "out" });
    expect(addRecord(rec(1000))).toEqual({ kind: "out" }); // equal to the 10th: the older one stays
    expect(store.get(KEY)).toBe(before);
    expect(addRecord(rec(50))).toEqual({ kind: "ranked", rank: 1, first: false });
    const list = loadRecords();
    expect(list).toHaveLength(TOP);
    expect(list[0].s).toBe(50);
    expect(list.at(-1)!.s).toBe(900); // the old 10th left the list
  });

  it("blocked storage gives no error: no records shown, and the win is told it cannot be kept", () => {
    blockedStorage();
    expect(loadRecords()).toEqual([]);
    expect(addRecord(rec(600))).toEqual({ kind: "blocked" });
  });

  it("storage that reads but cannot write (full) is told it cannot be kept", () => {
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("full"); } });
    expect(addRecord(rec(600))).toEqual({ kind: "blocked" });
  });

  it("tampered storage gives no error: broken records are left out, the rest kept in order", () => {
    memoryStorage();
    store.set(KEY, "{not json");
    expect(loadRecords()).toEqual([]);
    expect(addRecord(rec(600))).toEqual({ kind: "ranked", rank: 1, first: true });
    store.set(KEY, JSON.stringify({ s: 1 }));
    expect(loadRecords()).toEqual([]);
    store.set(KEY, JSON.stringify([
      rec(900), null, "x", { ...rec(10), s: -1 }, { ...rec(10), s: 1.5 }, { ...rec(10), seat: 4 }, { ...rec(10), players: 1 },
      { ...rec(10), date: "2026-02-30" }, { ...rec(10), date: "<b>" }, { ...rec(10), destination: "<img>" }, { ...rec(10), destination: 7 },
      rec(300), { ...rec(400), extra: "dropped" },
    ]));
    expect(loadRecords()).toEqual([rec(300), rec(400), rec(900)]);
  });

  it("more than 10 stored records: only the best 10 are shown", () => {
    memoryStorage();
    store.set(KEY, JSON.stringify(Array.from({ length: 15 }, (_, i) => rec(1500 - i * 100))));
    expect(loadRecords().map((r) => r.s)).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
  });

  it("a record checks its fields", () => {
    expect(parseRecord(rec(60))).toEqual(rec(60));
    expect(parseRecord({ ...rec(60), seat: 3, players: 3 })).toBeNull(); // Yellow plays only in a 4-player game
    expect(parseRecord({ ...rec(60), s: 360000 })).toBeNull(); // over 99:59:59
  });

  it("a win now: whole seconds rounded down, today's date on this device", () => {
    expect(recordOf(754_999, 2, 3, "lantern-festival", new Date(2026, 10, 26, 23, 59))).toEqual({ s: 754, seat: 2, players: 3, destination: "lantern-festival", date: "2026-11-26" });
    expect(recordOf(5_000, 0, 2, "lantern-festival", new Date(2027, 0, 3)).date).toBe("2027-01-03");
  });

  it("shows times, dates and ranks as approved", () => {
    expect(formatTime(754)).toBe("12:34");
    expect(formatTime(45)).toBe("0:45");
    expect(formatTime(3723)).toBe("1:02:03");
    expect(formatDate("2026-11-26")).toBe("26 Nov 2026");
    expect(formatDate("2027-01-03")).toBe("3 Jan 2027");
    expect([1, 2, 3, 4, 10, 11, 12, 13, 21, 22].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "10th", "11th", "12th", "13th", "21st", "22nd"]);
  });
});

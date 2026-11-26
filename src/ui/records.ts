// The Records (Step I phase E, owner 26 Nov 2026): the 10 fastest win times on this device, whoever played. Only
// people's wins in games played without interruption get a time (clock.ts); robots never do. Kept only on this device
// (C1), apart from the saved game and the postcards. Blocked or tampered storage never gives an error: a broken record
// is left out, and a device that blocks storage is told so (R12).
// Ties (owner, 26 Nov 2026): to the whole second; an equal newer time ranks below the older one.

const KEY = "dgm.records.v1";
export const TOP = 10;
/** The longest time kept: 99:59:59. */
const MAX_S = 99 * 3600 + 59 * 60 + 59;

export interface WinRecord {
  /** The win time in whole seconds. */
  s: number;
  /** The winner's colour (PLAYERS[seat]). */
  seat: number;
  /** The day of the win on this device, "2026-11-26". */
  date: string;
  /** How many players the game had. */
  players: number;
  /** The destination's id (kept when a destination's board changes). */
  destination: string;
}

/** What adding a time gave: its rank (1–10; `first`: the first record on this device), outside the top 10, or no storage. */
export type Ranking = { kind: "ranked"; rank: number; first: boolean } | { kind: "out" } | { kind: "blocked" };

const isInt = (x: unknown, lo: number, hi: number): x is number => Number.isInteger(x) && (x as number) >= lo && (x as number) <= hi;

/** A real day, written "YYYY-MM-DD". */
function isDay(x: unknown): x is string {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const [y, m, d] = x.split("-").map(Number), t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** Checks one stored record; anything unexpected gives null. */
export function parseRecord(x: unknown): WinRecord | null {
  const r = x as WinRecord;
  if (!r || typeof r !== "object") return null;
  if (!isInt(r.s, 0, MAX_S) || !isInt(r.players, 2, 4) || !isInt(r.seat, 0, r.players - 1) || !isDay(r.date)) return null;
  if (typeof r.destination !== "string" || !/^[a-z0-9-]{1,40}$/.test(r.destination)) return null;
  return { s: r.s, seat: r.seat, date: r.date, players: r.players, destination: r.destination };
}

/** The stored list, checked and in order (fastest first; equal times keep their stored order). */
function parse(raw: string | null): WinRecord[] {
  if (!raw) return [];
  let list: unknown;
  try {
    list = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  const ok: WinRecord[] = [];
  for (const x of list) { const r = parseRecord(x); if (r) ok.push(r); }
  return ok.sort((a, b) => a.s - b.s).slice(0, TOP); // a stable sort: ties keep their order
}

/** The records on this device (none when storage is blocked). */
export function loadRecords(): WinRecord[] {
  try {
    return parse(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

/** Adds a win time and says where it ranks. Nothing is written when it is outside the top 10. */
export function addRecord(r: WinRecord): Ranking {
  let list: WinRecord[];
  try {
    list = parse(localStorage.getItem(KEY));
  } catch {
    return { kind: "blocked" };
  }
  let i = 0;
  while (i < list.length && list[i].s <= r.s) i++; // after every equal older time
  if (i >= TOP) return { kind: "out" };
  const first = list.length === 0;
  list.splice(i, 0, r);
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, TOP)));
  } catch {
    return { kind: "blocked" };
  }
  return { kind: "ranked", rank: i + 1, first };
}

/** A record for a win now: the time in whole seconds (rounded down) and today's date on this device. */
export function recordOf(ms: number, seat: number, players: number, destination: string, now = new Date()): WinRecord {
  const p = (n: number) => String(n).padStart(2, "0");
  return { s: Math.min(MAX_S, Math.floor(Math.max(0, ms) / 1000)), seat, players, destination, date: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}` };
}

/** "12:34", "0:45", or "1:02:03" from an hour on (owner, 26 Nov 2026). */
export function formatTime(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60, p = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(sec)}` : `${m}:${p(sec)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "26 Nov 2026" (owner, 26 Nov 2026: the same on every device). */
export function formatDate(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "1st", "2nd", "3rd", "4th" … "10th". */
export function ordinal(n: number): string {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

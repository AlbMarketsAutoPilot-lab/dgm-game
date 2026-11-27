// Mr. Lin's tips (Step I phase F, owner 27 Nov 2026): six game tips in his own words, in his panel, each shown once on
// this device, to people only (never for robots), never when he already says something at that moment; "How to play"
// shows them again. A tip stays until the person taps its button (the turn's own "Roll die" or "Roll again"): no
// reading timer, and nothing happens while it is open. At most one tip per turn.
//   T1 sixes: the first "Roll again" after a 6 that moves (not the 6 that frees), if his panel is closed.
//   The others wait for a "quiet turn" (a person's turn where he says nothing at the start), in this order:
//   T5 exact (the last square 6 or fewer squares away) · T3 bump (after this person bumped someone) · T4 card (after
//   this person met a punishment the card could have cancelled, holding none) · T2 tap · T6 records (after T2).
// Storage: the list of tips shown, apart from the other saved data. Blocked storage: no tips at all (so they never
// repeat every game); tampered storage: read as none shown. Neither ever shows an error.

/** The texts approved by the owner word for word (27 Nov 2026). */
export const TIPS = {
  sixes: "Each 6 you roll opens the door to one more roll, and there is no end to such luck. All your rolls then join into a single move.",
  tap: "A wise traveller looks at the road before walking it. Tap any square on the board, and it will tell you what waits there.",
  bump: "On this road, each square has room for only one traveller: land on another, and they must return Home. Do not worry for them; they need no 6 to set off again.",
  card: "A Bonus card is like an umbrella: light to carry, yet it can turn away your own bad luck. Some green squares, the Seaside and the Swap Market may place one in your hands.",
  exact: "The last steps of a journey ask for the most care: only the exact number brings you into the festival. A 6 never ends the road, for it always asks for another roll.",
  records: "The fastest journeys are remembered in the Records. But only a journey travelled without interruption is counted.",
} as const;

export type TipId = keyof typeof TIPS;

const KEY = "dgm.tips.v1";
const IDS = Object.keys(TIPS) as TipId[];
let blocked = false;

/** The tips this device has shown. Blocked storage: all of them (no tips); anything unreadable counts as none. */
export function shownTips(): Set<TipId> {
  if (blocked) return new Set(IDS);
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    blocked = true;
    return new Set(IDS);
  }
  try {
    const list: unknown = JSON.parse(raw ?? "[]");
    return new Set(Array.isArray(list) ? IDS.filter((id) => list.includes(id)) : []);
  } catch {
    return new Set();
  }
}

/** Remembers that a tip was shown. Storage that cannot be written: no more tips (they would come back every game). */
function markShown(id: TipId): void {
  const all = shownTips();
  all.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify(IDS.filter((t) => all.has(t))));
  } catch {
    blocked = true;
  }
}

/** "How to play" shows the tips again. */
export function resetTips(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // storage blocked: there is nothing to reset
  }
}

/** One game's tips: what waits for a person's next quiet turn, and one tip per turn. */
export class Tips {
  private readonly waiting = new Map<number, Set<"bump" | "card">>();
  private given = false;

  /** A new turn: a tip may show again. */
  newTurn(): void {
    this.given = false;
  }

  /** T3 / T4: a person's moment that earns a tip at their next quiet turn (nothing if it was shown already). */
  earn(seat: number, id: "bump" | "card"): void {
    if (shownTips().has(id)) return;
    let w = this.waiting.get(seat);
    if (!w) this.waiting.set(seat, (w = new Set()));
    w.add(id);
  }

  /** T1: the tip for a person's first "Roll again", or null. */
  sixes(): string | null {
    return this.take("sixes");
  }

  /** The tip for a person's quiet turn (T5, T3, T4, T2, T6), or null. `near`: the last square is 1–6 squares away. */
  quiet(seat: number, near: boolean): string | null {
    if (this.given) return null;
    const shown = shownTips(), w = this.waiting.get(seat);
    const order: TipId[] = ["exact", "bump", "card", "tap", "records"];
    for (const id of order) {
      if (shown.has(id)) continue;
      if (id === "exact" && !near) continue;
      if ((id === "bump" || id === "card") && !w?.has(id)) continue;
      if (id === "records" && !shown.has("tap")) continue;
      w?.delete(id as "bump" | "card");
      return this.take(id);
    }
    return null;
  }

  private take(id: TipId): string | null {
    if (this.given || shownTips().has(id)) return null;
    this.given = true;
    markShown(id);
    return TIPS[id];
  }
}

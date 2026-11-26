// Journey postcards (GCD §12, owner approved 15 Oct): one per region and eight special moments, collected over many
// games by the people at the table (computer players do not collect). The album belongs to the device: it is saved
// only in this browser (C1: no accounts, nothing leaves the device), and the game works the same when saving is blocked.
import type { Board3, Event3 } from "../engine/v3";
import { artFor } from "../render/art";
import { esc } from "../render/html";

export interface Postcard {
  id: string;
  /** Picture (an approved illustration). */
  icon: string;
  title: string;
  line: string;
  /** How to get it (shown on a postcard not collected yet). */
  how: string;
}

/**
 * Step I phase C6 (owner, 25–26 Nov 2026): the Lantern Festival's postcards, in the order of the journey. Removed from
 * the album: Bog Boots, Three Sixes (the lantern one), The Bog, Snake Leader, River & Lake, Festival Road (their ids
 * stay in a device's album, unseen). Kept ids keep what was collected: "forgot-keys" is now "Out Again!" (the same
 * square, 99), "festival" is now "The Lantern Festival". One set per destination; the album shows it under its name.
 */
const AREAS: Record<string, Postcard> = {
  "Home Town": { id: "home-town", icon: "house", title: "Home Town", line: "Wish you were here. Actually, you were. You just left.", how: "Set off from Home" },
  Countryside: { id: "countryside", icon: "sheep", title: "Countryside", line: "Fresh air, open fields and a traffic jam of sheep.", how: "Reach the Countryside" },
  Forest: { id: "forest", icon: "forest", title: "Forest", line: "Tall trees, no signal, and not one straight path.", how: "Reach the Forest" },
  Mountains: { id: "mountains", icon: "cabin", title: "Mountains", line: "The view was worth every step. Mostly.", how: "Reach the Mountains" },
  Seaside: { id: "seaside", icon: "sailboat", title: "Seaside", line: "Salt in the air, sand in everything.", how: "Reach the Seaside" },
  "Big City": { id: "big-city", icon: "traffic-light", title: "Big City", line: "Bright lights, green lights, no parking.", how: "Reach the Big City" },
};

const SPECIAL = {
  festival: { id: "festival", icon: "lanterns", title: "The Lantern Festival", line: "Made it. Lanterns up!", how: "Win a game" },
  tree: { id: "fallen-tree", icon: "great-tree", title: "Fallen Tree", line: "We waited. The tree did not move. Then a 6 did.", how: "Get stuck at the fallen tree" },
  six3: { id: "sixes-3", icon: "sixes-3", title: "Three Sixes", line: "Three sixes in a row. The die is on my side.", how: "Roll three 6s in a row" },
  six4: { id: "sixes-4", icon: "sixes-4", title: "Four Sixes", line: "Four sixes. Nobody believes me.", how: "Roll four 6s in a row" },
  six5: { id: "sixes-5", icon: "sixes-5", title: "Five Sixes", line: "Five sixes. I checked the die. Twice.", how: "Roll five 6s in a row" },
  six6: { id: "sixes-6", icon: "sixes-6", title: "Six Sixes", line: "Six sixes. This postcard is proof.", how: "Roll six 6s in a row" },
  boat: { id: "dragon-boat", icon: "dragon-boat", title: "The Dragon Boat", line: "Rowed by a real crew, all the way to the pier.", how: "Ride the Dragon Boat" },
  ashore: { id: "straight-off-the-boat", icon: "pier", title: "Straight Off the Boat", line: "One roll, one 4, one perfect landing.", how: "Win with the Dragon Boat's 4" },
  dodged: { id: "dodged-it", icon: "card", title: "Dodged It!", line: "Bad luck came. I showed it a card. It left.", how: "Cancel a punishment with your Bonus card" },
  twist: { id: "plot-twist", icon: "swap-arrows", title: "Plot Twist", line: "Swapped places with the leader. Still smiling.", how: "Swap places with the leader" },
  outAgain: { id: "forgot-keys", icon: "lantern-torn", title: "Out Again!", line: "The wind won twice. The third time, I held the lantern closer.", how: "Land on Out Again!" },
} satisfies Record<string, Postcard>;

/** All postcards, in album order. */
export const POSTCARDS: Postcard[] = [...Object.values(AREAS), ...Object.values(SPECIAL)];
/** The destination whose set the album shows. */
export const ALBUM_TITLE = "The Lantern Festival";

/** The postcards one engine event earns, for the people at the table (`person(seat)`); robots earn none. */
export function postcardsFor(board: Board3, e: Event3, person: (seat: number) => boolean): Postcard[] {
  if (!person(e.player)) return [];
  const area = (sq: number) => {
    if (sq < 1 || sq > board.lastTile) return [];
    const a = board.areas.find((x) => sq >= x.from && sq <= x.to);
    return a && AREAS[a.name] ? [AREAS[a.name]] : [];
  };
  switch (e.type) {
    case "move": return e.from === 0 && e.to > 0 ? [...new Set([AREAS["Home Town"], ...area(e.to)])] : area(e.to);
    case "jump": return [...area(e.to), ...(e.cause === "boat" ? [SPECIAL.boat] : [])];
    case "swap": return [...(e.cause === "leader" ? [SPECIAL.twist] : [])];
    case "win": return [SPECIAL.festival, ...(e.boat ? [SPECIAL.ashore] : [])];
    case "square": return e.tile.type === "tree" ? [SPECIAL.tree] : e.tile.icon === "lantern-torn" ? [SPECIAL.outAgain] : [];
    case "sixes": return [SPECIAL.six3, SPECIAL.six4, SPECIAL.six5, SPECIAL.six6].slice(0, Math.min(4, e.count - 2));
    case "cardUsed": return e.use === "square" || e.use === "area" ? [SPECIAL.dodged] : [];
    default: return [];
  }
}

// ---- The album on this device ----

const KEY = "dgm.postcards.v1";

/** The postcards collected on this device (empty when the browser blocks storage). */
export function loadAlbum(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/** Saves the album (does nothing when the browser blocks storage). */
export function saveAlbum(ids: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // storage blocked: the game goes on, the postcards just aren't kept
  }
}

/** One postcard as HTML: picture, title, line; not collected yet: greyed, "?", how to get it. */
export function postcardHtml(p: Postcard, have: boolean): string {
  return `<div class="pc${have ? "" : " locked"}" role="listitem" aria-label="${esc(have ? p.title : `Not collected yet: ${p.how}`)}">`
    + `<div class="pic">${artFor(p.icon, p.title)}</div><div class="side"><span class="post"></span><span class="mark"></span>`
    + `<h3>${have ? esc(p.title) : "?"}</h3><p${have ? "" : ` class="how"`}>${esc(have ? p.line : p.how)}</p></div></div>`;
}

/** The album, over the whole screen; resolves when it is closed. */
export function showAlbum(): Promise<void> {
  return new Promise((done) => {
    const have = loadAlbum();
    const el = document.createElement("div");
    el.className = "album";
    // U5: a dialog over the whole screen; the focus goes to Back, Escape closes it
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Postcards");
    el.innerHTML = `<div class="album-top"><h2>Postcards <span>${POSTCARDS.filter((p) => have.has(p.id)).length} / ${POSTCARDS.length}</span></h2><button class="primary">Back</button></div>`
      + `<h3 class="album-dest">${esc(ALBUM_TITLE)}</h3><div class="album-grid" role="list">${POSTCARDS.map((p) => postcardHtml(p, have.has(p.id))).join("")}</div>`;
    const back = el.querySelector("button")!, before = document.activeElement as HTMLElement | null;
    const close = () => { document.removeEventListener("keydown", onKey); el.remove(); before?.focus?.({ preventScroll: true }); done(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    back.onclick = close;
    document.addEventListener("keydown", onKey);
    document.body.append(el);
    back.focus({ preventScroll: true });
  });
}

// Journey postcards (GCD §12, owner approved 15 Oct): one per region and eight special moments, collected over many
// games by the people at the table (computer players do not collect). The album belongs to the device: it is saved
// only in this browser (C1: no accounts, nothing leaves the device), and the game works the same when saving is blocked.
import { OFF, isShortcut, shortcutOf, type Board, type GameEvent, type Pos } from "../engine";
import { artFor } from "../render/art";

export interface Postcard {
  id: string;
  /** Picture (an approved illustration). */
  icon: string;
  title: string;
  line: string;
  /** How to get it (shown on a postcard not collected yet). */
  how: string;
}

/** Region postcards, in the order of the journey (both boards share the region names). */
const REGIONS: Record<string, Postcard> = {
  "Home Town": { id: "home-town", icon: "house", title: "Home Town", line: "Wish you were here. Actually, you were. You just left.", how: "Set off from Home" },
  Countryside: { id: "countryside", icon: "sheep", title: "Countryside", line: "Fresh air, open fields and a traffic jam of sheep.", how: "Reach the Countryside" },
  Forest: { id: "forest", icon: "train", title: "Forest", line: "Tall trees, no signal, and one train actually on time.", how: "Reach the Forest" },
  "River & Lake": { id: "river-lake", icon: "sailboat", title: "River & Lake", line: "Water everywhere, and not one boat waited for us.", how: "Reach the River & Lake" },
  Mountains: { id: "mountains", icon: "cabin", title: "Mountains", line: "The view was worth every step. Mostly.", how: "Reach the Mountains" },
  Seaside: { id: "seaside", icon: "waves", title: "Seaside", line: "Salt in the air, sand in everything.", how: "Reach the Seaside" },
  "Big City": { id: "big-city", icon: "traffic-light", title: "Big City", line: "Bright lights, green lights, no parking.", how: "Reach the Big City" },
  "Festival Road": { id: "festival-road", icon: "bunting", title: "Festival Road", line: "Almost there. You can hear the music.", how: "Reach Festival Road" },
};

const SPECIAL = {
  festival: { id: "festival", icon: "lanterns", title: "Festival of Lights", line: "Made it. Lanterns up!", how: "Win a game" },
  snakeLeader: { id: "snake-leader", icon: "snake-crown", title: "Snake Leader", line: "I rode a sea serpent. Ask me how.", how: "Become the Snake Leader" },
  keys: { id: "forgot-keys", icon: "two-keys", title: "Forgot Keys AGAIN!!!", line: "Same keys. Same café. Same look from the waiter.", how: "Land on Forgot your keys AGAIN" },
  bog: { id: "the-bog", icon: "boot-in-mud", title: "The Bog", line: "Greetings from the Bog. Send boots.", how: "Get stuck in the Bog" },
  jackpot: { id: "shortcut-jackpot", icon: "rope-swing", title: "Shortcut Jackpot", line: "Took the Shortcut. It worked. Nobody believes me.", how: "Hit the jackpot on the Shortcut" },
  twist: { id: "plot-twist", icon: "swap-arrows", title: "Plot Twist", line: "Swapped places with the leader. Still smiling.", how: "Swap places with the leader" },
  boots: { id: "bog-boots", icon: "boots", title: "Bog Boots", line: "Walked straight through the Bog. Didn't even look down.", how: "Bog boots save you" },
  sixes: { id: "three-sixes", icon: "lantern", title: "Three Sixes", line: "Three sixes in a row. The lantern lit itself.", how: "Throw three 6s in a row" },
} satisfies Record<string, Postcard>;

/** All postcards, in album order. */
export const POSTCARDS: Postcard[] = [...Object.values(REGIONS), ...Object.values(SPECIAL)];

/** The region postcard of a place (a Shortcut stone belongs to the region of its crossroads). */
function regionCard(board: Board, pos: Pos): Postcard | null {
  const sq = isShortcut(pos) ? board.rules.forks[shortcutOf(pos).fork].at : pos;
  if (sq < 1 || sq > board.lastTile) return null;
  const r = board.story.regions.find((x) => sq >= x.from && sq <= x.to);
  return r ? REGIONS[r.name] ?? null : null;
}

/** The postcards one engine event earns, for the people at the table (`person(seat)`); computer players earn none. */
export function postcardsFor(board: Board, e: GameEvent, person: (seat: number) => boolean): Postcard[] {
  const who = "player" in e ? e.player : null;
  if (who === null || !person(who)) return [];
  switch (e.type) {
    case "released": return e.where === "start" ? [REGIONS["Home Town"]] : [];
    case "move": case "jump": { const c = e.to === OFF ? null : regionCard(board, e.to); return c ? [c] : []; }
    case "win": return [SPECIAL.festival];
    case "snakeLeader": return [SPECIAL.snakeLeader];
    case "tile":
      if (e.tile.icon === "two-keys") return [SPECIAL.keys];
      if (isShortcut(e.square) && e.tile.cat === "R") return [SPECIAL.jackpot];
      return [];
    case "trapped": return [SPECIAL.bog];
    case "swap": return [SPECIAL.twist];
    case "bogBoots": return [SPECIAL.boots];
    case "lanternWon": return [SPECIAL.sixes];
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
  return `<div class="pc${have ? "" : " locked"}" role="listitem" aria-label="${have ? p.title : `Not collected yet: ${p.how}`}">`
    + `<div class="pic">${artFor(p.icon, p.title)}</div><div class="side"><span class="post"></span><span class="mark"></span>`
    + `<h3>${have ? p.title : "?"}</h3><p${have ? "" : ` class="how"`}>${have ? p.line : p.how}</p></div></div>`;
}

/** The album, over the whole screen; resolves when it is closed. */
export function showAlbum(): Promise<void> {
  return new Promise((done) => {
    const have = loadAlbum();
    const el = document.createElement("div");
    el.className = "album";
    el.innerHTML = `<div class="album-top"><h2>Postcards <span>${POSTCARDS.filter((p) => have.has(p.id)).length} / ${POSTCARDS.length}</span></h2><button class="primary">Back</button></div>`
      + `<div class="album-grid" role="list">${POSTCARDS.map((p) => postcardHtml(p, have.has(p.id))).join("")}</div>`;
    el.querySelector("button")!.onclick = () => { el.remove(); done(); };
    document.body.append(el);
  });
}

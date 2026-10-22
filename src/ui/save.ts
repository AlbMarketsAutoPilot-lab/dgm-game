// Continue a game after closing the app (owner, 15 Oct: U1). A game is fully decided by its seed, its first player
// and the answers given to the engine's questions, so those are saved after every turn and the game is played again
// up to the same turn when it is continued. Saved only in this browser (C1: nothing leaves the device). Reloading in
// the middle of a turn brings back the start of that turn, with the same throws: no luck to be won by reloading.
import { BOARDS, Game, type Answer, type Board, type BoardId } from "../engine";
import type { Level } from "./app";

/** Bump when a rule change in the engine would play a saved game differently (old saves are then dropped). */
const VERSION = 3; // 2 (owner, 15 Oct): the Bog boots and spending a lantern are answers too; 3 (owner, 22 Oct 2026): nobody
// is out, the lantern shield ("card" / "lantern" / "take"). Older saves would replay wrong
const KEY = "dgm.game.v1";

export interface SavedGame {
  v: number;
  board: BoardId;
  /** The board's contents when saved: a changed board file cannot replay an old game. */
  boardHash: string;
  players: number;
  computer: boolean[];
  /** The computer players' level (owner, 22 Oct 2026). */
  level: Level;
  seed: number;
  first: number;
  /** Every answer given to the engine, in order (roads, Bonus cards; people and computer players). */
  answers: Answer[];
  /** Whole turns played. */
  turns: number;
  /** Seats that said "Don't ask me again this game" to the spoil question. */
  quiet: number[];
  /** Postcards earned in this game (for the end of the game). */
  cards: string[];
  /** For the start screen: the round of the next turn. */
  round: number;
}

/** A short fingerprint of a board's rules and squares. */
export function boardHash(b: Board): string {
  const s = JSON.stringify([b.lastTile, b.tiles, b.rules]);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

const isInt = (x: unknown, lo: number, hi: number): x is number => Number.isInteger(x) && (x as number) >= lo && (x as number) <= hi;

/** Checks a stored value; anything unexpected (an older version, a changed board, tampering) gives null. */
export function parseSave(x: unknown): SavedGame | null {
  const s = x as SavedGame;
  if (!s || typeof s !== "object" || s.v !== VERSION) return null;
  if (!Object.prototype.hasOwnProperty.call(BOARDS, s.board) || s.boardHash !== boardHash(BOARDS[s.board])) return null;
  if (!isInt(s.players, 1, 4) || !isInt(s.seed, 0, 2 ** 32) || !isInt(s.first, 0, s.players - 1)) return null;
  if (!Array.isArray(s.computer) || s.computer.length !== s.players || !s.computer.every((c) => typeof c === "boolean")) return null;
  if (s.level !== "easy" && s.level !== "normal") return null;
  if (!Array.isArray(s.answers) || !s.answers.every((a) => a === true || a === false || a === "main" || a === "shortcut" || a === "card" || a === "lantern" || a === "take")) return null;
  if (!isInt(s.turns, 0, 1e6) || !isInt(s.round, 0, 1e6)) return null;
  if (!Array.isArray(s.quiet) || !s.quiet.every((q) => isInt(q, 0, s.players - 1))) return null;
  if (!Array.isArray(s.cards) || !s.cards.every((c) => typeof c === "string")) return null;
  return s;
}

/** The saved game, if there is one that can be continued. */
export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseSave(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveGame(s: Omit<SavedGame, "v" | "boardHash">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, boardHash: boardHash(BOARDS[s.board]), ...s }));
  } catch {
    // storage blocked or full: the game goes on, it just can't be continued later
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}

/** Plays the saved game again up to where it was saved. Null if the answers do not fit (the save is then useless). */
export function replay(s: SavedGame): Game | null {
  const game = new Game(BOARDS[s.board], { players: s.players, seed: s.seed, first: s.first });
  let next = 0;
  try {
    for (let i = 0; i < s.turns; i++) {
      if (game.over) return null;
      const t = game.turn();
      for (let r = t.next(); !r.done; ) {
        if (next >= s.answers.length) return null;
        r = t.next(s.answers[next++]);
      }
    }
  } catch {
    return null;
  }
  return next === s.answers.length && !game.over ? game : null;
}

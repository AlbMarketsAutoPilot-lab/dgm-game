// Scripted-dice games on small test boards (the frozen rules, with only the squares a test needs).
import { BOARDS, Game, OFF, parseBoard, runTurn, simplePlayer } from "../src/engine";
import type { Board, Decider, Decision, Fork, GameEvent, PlayerState, Tile } from "../src/engine";

export { OFF };

export interface Play {
  tiles?: Record<number, Tile>;
  forks?: Fork[];
  dice: number[];
  setup?: Partial<PlayerState>[];
  turns: number;
  players?: number;
  /** A fallen tree already on this square; by default no tree is ever placed (range 0). */
  roadblock?: number;
  roadblockRange?: number;
  decide?: Decider;
  /** Seed of the random source (only the fallen tree uses it in these tests). */
  seed?: number;
}

export function testBoard(tiles: Record<number, Tile> = {}, forks: Fork[] = [], range = 0): Board {
  const base = BOARDS.long;
  return parseBoard({ ...base, id: "test", tiles, rules: { ...base.rules, forks, roadblock: { back: 10, range } } });
}

export interface Played {
  game: Game;
  P: PlayerState[];
  events: GameEvent[];
  decisions: Decision[];
}

/** Plays `turns` turns with exactly the scripted throws (fails if a throw is missing or left over). */
export function play(o: Play): Played {
  const script = [...o.dice], decisions: Decision[] = [];
  const game = new Game(testBoard(o.tiles, o.forks, o.roadblockRange ?? 0), {
    players: o.players ?? 2,
    seed: o.seed ?? 1,
    setup: o.setup,
    roadblock: o.roadblock ?? null,
    dice: () => {
      if (!script.length) throw new Error("dice script ran out");
      return script.shift()!;
    },
  });
  const decide = o.decide ?? simplePlayer;
  for (let i = 0; i < o.turns && !game.over; i++) runTurn(game, (d, g) => { decisions.push(d); return decide(d, g); });
  if (script.length) throw new Error(`${script.length} scripted throws not used`);
  return { game, P: game.players, events: game.events, decisions };
}

export const tile = (t: Partial<Tile> & Pick<Tile, "cat" | "type">): Tile => ({ text: "test", ...t });

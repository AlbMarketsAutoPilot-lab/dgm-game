// Many games with computer players, for measurements and for the tests that compare the engine with the simulator.
import { Game, runTurn, simplePlayer } from "./game";
import { type Rng, rng } from "./rng";
import type { Board, Decider, GameEvent } from "./types";

export interface PlayerRecord {
  /** Times sent back to Start by another player. */
  captured: number;
  /** Lanterns at the end. */
  lanterns: number;
  minLanterns: number;
  /** Round in which the player left Home. */
  enterRound: number;
  /** Lanterns lost (3 throws without a 6), spent (to leave Home or the Bog, or as a shield) and won (three 6s in a row). */
  lanternsLost: number;
  lanternsSpent: number;
  lanternsWon: number;
  /** Turns with at least one throw, and turns that began with at least 1 / 2 / 3 sixes in a row. */
  throwTurns: number;
  sixes: [number, number, number];
}

export interface GameRecord {
  winner: number;
  rounds: number;
  players: PlayerRecord[];
}

/** Reads the per-player figures of a finished game from its events. */
export function recordOf(game: Game): GameRecord {
  const L = game.board.rules.lifelines;
  const P: PlayerRecord[] = game.players.map(() => ({
    captured: 0, lanterns: 0, minLanterns: L, enterRound: 0,
    lanternsLost: 0, lanternsSpent: 0, lanternsWon: 0, throwTurns: 0, sixes: [0, 0, 0],
  }));
  let round = 0, cur = -1, rolls = 0, run = 0, runOn = false;
  const endTurn = () => {
    if (cur < 0 || !rolls) return;
    const r = P[cur];
    r.throwTurns++;
    for (let k = 0; k < 3; k++) if (run > k) r.sixes[k]++;
  };
  for (const e of game.events as GameEvent[]) {
    switch (e.type) {
      case "round": round = e.round; break;
      case "turn": endTurn(); cur = e.player; rolls = 0; run = 0; runOn = true; break;
      case "roll":
        rolls++;
        if (runOn) { if (e.value === 6) run++; else runOn = false; }
        break;
      case "released": if (e.where === "start") P[e.player].enterRound = round; break;
      case "lanternLost":
        if (e.why === "wait") P[e.player].lanternsLost++; else P[e.player].lanternsSpent++;
        P[e.player].minLanterns = Math.min(P[e.player].minLanterns, e.left);
        break;
      case "lanternWon": P[e.player].lanternsWon++; break;
    }
  }
  endTurn();
  game.players.forEach((p, i) => { P[i].captured = p.captured; P[i].lanterns = p.lanterns; });
  return { winner: game.winner!, rounds: game.round, players: P };
}

/** Plays one whole game. Returns null when it stopped at the round limit without a winner. */
export function playGame(board: Board, players: number, rand: Rng, deciders: Decider[] = [], maxRounds = 3000): GameRecord | null {
  const game = new Game(board, { players, rng: rand, maxRounds });
  while (!game.over) {
    runTurn(game, (d, g) => (deciders[d.player] ?? simplePlayer)(d, g));
  }
  return game.winner === null ? null : recordOf(game);
}

export interface Summary {
  games: number;
  capped: number;
  /** Win % by seat, 2 decimals, as in the simulator's reports. */
  seatWinPct: number[];
  /** ±95% confidence interval of a fair seat share, 2 decimals. */
  ci95: number;
  /** Game length in rounds: mean (1 decimal), 10% / 50% / 90% points. */
  length: { mean: number; p10: number; median: number; p90: number };
  records: GameRecord[];
}

/** `games` games from one seed (one random source for all of them, as the simulator does). */
export function playGames(board: Board, games: number, seed: number, players = 4, deciders: Decider[] = []): Summary {
  const rand = rng(seed), records: GameRecord[] = [], wins = Array(players).fill(0);
  let capped = 0;
  for (let g = 0; g < games; g++) {
    const r = playGame(board, players, rand, deciders);
    if (!r) { capped++; continue; }
    records.push(r); wins[r.winner]++;
  }
  const n = records.length, fair = 1 / players, f = (x: number, d = 1) => +x.toFixed(d);
  const rounds = records.map((r) => r.rounds).sort((a, b) => a - b), q = (x: number) => rounds[Math.min(n - 1, Math.floor(x * n))];
  return {
    games: n, capped, records,
    seatWinPct: wins.map((w) => f((100 * w) / n, 2)),
    ci95: f(196 * Math.sqrt((fair * (1 - fair)) / n), 2),
    length: { mean: f(rounds.reduce((a, b) => a + b, 0) / n), p10: q(0.1), median: q(0.5), p90: q(0.9) },
  };
}

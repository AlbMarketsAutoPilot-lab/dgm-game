// Continue a game after closing the app (U1): the seed, the first player and the answers bring back the same game.
import { describe, expect, it } from "vitest";
import { BOARDS, Game, runTurn, simplePlayer, type Answer } from "../src/engine";
import { boardHash, parseSave, replay, type SavedGame } from "../src/ui/save";

/** Plays `turns` turns, answering like a table where some spoil and some do not, and returns the save and the game. */
function played(board: "short" | "long", players: number, seed: number, first: number, turns: number) {
  const g = new Game(BOARDS[board], { players, seed, first }), answers: Answer[] = [];
  if (turns < 0) { // halfway through this game, however long it turns out to be
    const full = played(board, players, seed, first, 1e6).g;
    turns = Math.floor(full.events.filter((e) => e.type === "turn").length / 2);
  }
  for (let i = 0; i < turns && !g.over; i++) runTurn(g, (d, view) => {
    const a = d.kind === "bonusAttack" ? d.player % 2 === 0 : simplePlayer(d, view);
    answers.push(a);
    return a;
  });
  const save: SavedGame = {
    v: 3, board, boardHash: boardHash(BOARDS[board]), players, computer: Array(players).fill(false), seed, first,
    answers, turns, quiet: [], cards: [], round: g.round,
  };
  return { g, save };
}

describe("saved games", () => {
  it.each([["short", 2, 11, 1, -1], ["short", 4, 12, 3, -1], ["long", 3, 13, 2, -1], ["long", 4, 14, 0, -1]] as const)(
    "%s board, %i players, halfway: the replayed game is the same game, event by event", (board, players, seed, first, turns) => {
      const { g, save } = played(board, players, seed, first, turns);
      expect(g.over).toBe(false);
      const back = replay(parseSave(JSON.parse(JSON.stringify(save)))!)!;
      expect(back.events).toEqual(g.events);
      expect(back.players).toEqual(g.players);
      // and it goes on exactly as the original would
      runTurn(g, simplePlayer); runTurn(back, simplePlayer);
      expect(back.events).toEqual(g.events);
    });

  it("refuses saves that cannot be continued: other version, changed board, tampered fields", () => {
    const { save } = played("short", 2, 21, 0, 10);
    expect(parseSave(save)).not.toBeNull();
    expect(parseSave({ ...save, v: 0 })).toBeNull();
    expect(parseSave({ ...save, boardHash: "x" })).toBeNull();
    expect(parseSave({ ...save, board: "__proto__" })).toBeNull();
    expect(parseSave({ ...save, first: 2 })).toBeNull();
    expect(parseSave({ ...save, computer: [true] })).toBeNull();
    expect(parseSave({ ...save, answers: ["<b>"] })).toBeNull();
    expect(parseSave(null)).toBeNull();
    expect(parseSave("x")).toBeNull();
  });

  it("answers that do not fit the game give no game (never a different one)", () => {
    const { save } = played("short", 3, 22, 0, 60);
    expect(replay({ ...save, answers: [...save.answers, true] })).toBeNull();
    expect(replay({ ...save, turns: save.turns + 500 })).toBeNull();
  });
});

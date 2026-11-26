// Continue a game after closing the app (U1): the seed, the first player and the answers bring back the same game.
// Step I phase C4: the v3 rules (save version 4); saves of the old version are dropped.
import { describe, expect, it } from "vitest";
import { DESTINATIONS, robot, runTurn3, type Answer3 } from "../src/engine/v3";
import { boardHash, newGame, parseSave, replay, type SavedGame } from "../src/ui/save";

const LF = DESTINATIONS["lantern-festival"];

/** Plays `turns` turns (people answer like a table that uses its cards every other time), returns the save and the game. */
function played(players: number, seed: number, first: number, turns: number) {
  const computer = Array.from({ length: players }, (_, i) => i % 2 === 1);
  const g = newGame("lantern-festival", players, computer, seed, first), answers: Answer3[] = [];
  for (let i = 0; i < turns && !g.over; i++) runTurn3(g, (d, view) => {
    const a = computer[d.player] ? robot(d, view) : d.kind === "swapMarket" ? d.candidates.at(-1)! : answers.length % 2 === 0;
    answers.push(a);
    return a;
  });
  const save: SavedGame = { v: 4, destination: "lantern-festival", boardHash: boardHash(LF), players, computer, seed, first, answers, turns, cards: [], round: g.round };
  return { g, save };
}

describe("saved games", () => {
  it.each([[2, 11, 1], [3, 12, 2], [4, 14, 0]] as const)("%i players: the replayed game is the same game, event by event", (players, seed, first) => {
    const { g, save } = played(players, seed, first, 20);
    expect(g.over).toBe(false);
    const back = replay(parseSave(JSON.parse(JSON.stringify(save)))!)!;
    expect(back.events).toEqual(g.events);
    expect(back.players).toEqual(g.players);
    // and it goes on exactly as the original would
    runTurn3(g, robot); runTurn3(back, robot);
    expect(back.events).toEqual(g.events);
  });

  it("the first player plays first, and the rounds start with them", () => {
    const g = newGame("lantern-festival", 3, [true, true, true], 5, 2);
    expect(runTurn3(g, robot)[0]).toEqual({ type: "turn", player: 2 });
    expect(g.round).toBe(1);
    runTurn3(g, robot); runTurn3(g, robot);
    expect(g.round).toBe(1);
    runTurn3(g, robot);
    expect(g.round).toBe(2);
  });

  it("refuses saves that cannot be continued: other version, changed board, tampered fields", () => {
    const { save } = played(2, 21, 0, 10);
    expect(parseSave(save)).not.toBeNull();
    expect(parseSave({ ...save, v: 3 })).toBeNull(); // the old version is dropped
    expect(parseSave({ ...save, boardHash: "x" })).toBeNull();
    expect(parseSave({ ...save, destination: "__proto__" as never })).toBeNull();
    expect(parseSave({ ...save, first: 2 })).toBeNull();
    expect(parseSave({ ...save, computer: [true] })).toBeNull();
    expect(parseSave({ ...save, answers: ["<b>" as never] })).toBeNull();
    expect(parseSave(null)).toBeNull();
    expect(parseSave("x")).toBeNull();
  });

  it("answers that do not fit the game give no game (never a different one)", () => {
    const { save } = played(3, 22, 0, 60);
    expect(replay({ ...save, turns: save.turns + 500 })).toBeNull();
  });
});

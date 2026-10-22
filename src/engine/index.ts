// The rules engine (Step 2). Pure TypeScript, no DOM: used by the UI, the computer players and the tests.
export * from "./types";
export { BOARDS, BoardIndex, OFF, START, isShortcut, parseBoard, shortcutOf, shortcutPos, type BoardId } from "./board";
export { Game, SHIELD_WORTH, normalPlayer, punishmentWorth, runTurn, simplePlayer, type GameOptions } from "./game";
export { rng, d6, randomSeed, type Rng } from "./rng";
export { playGame, playGames, recordOf, type GameRecord, type PlayerRecord, type Summary } from "./sim";

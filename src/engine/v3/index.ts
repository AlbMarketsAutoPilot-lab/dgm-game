// The v3 rules engine (Step I): pure TypeScript, no DOM. Used by the tests now and by the app from phase C.
export * from "./types";
export { DESTINATIONS, areaOf, parseBoard3 } from "./board";
export {
  Game3, playGame3, recordOf3, robot, runTurn3,
  type Answer3, type Decider3, type Decision3, type GameOptions3, type GameRecord3, type GameView3, type Player3, type PlayerRecord3,
} from "./game";

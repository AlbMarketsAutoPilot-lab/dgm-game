// Placeholder page for Step 2: plays one game of computer players with the rules engine and shows the result.
// The board rendering (Step 3) and the UI (Step 5) replace it.
import { BOARDS, Game, randomSeed, runTurn, simplePlayer } from "./engine";

const seed = randomSeed();
const game = new Game(BOARDS.long, { players: 4, seed });
while (!game.over) runTurn(game, simplePlayer);

const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = `
  <h1>Don't Get Mad!</h1>
  <p>${BOARDS.long.story.title}: four computer players travelled to the ${BOARDS.long.story.destination}.</p>
  <p>${game.winner === null ? "Nobody arrived." : `Player ${game.winner + 1} won after ${game.round} rounds`} (seed ${seed}, ${game.events.length} events).</p>
`;

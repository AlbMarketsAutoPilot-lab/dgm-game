// The app: start screen → game screen → "Play again" or a new game.
import "@fontsource/patrick-hand";
import "./ui/app.css";
import { GameScreen, type Setup } from "./ui/app";
import { showSetup } from "./ui/setup";

const root = document.querySelector<HTMLElement>("#app")!;
let last: Setup | null = null;

function play(s: Setup): void {
  last = s;
  new GameScreen(root, s, (again) => (again ? play(s) : menu()));
}

function menu(): void {
  showSetup(root, last, play);
}

document.fonts.load('100px "Patrick Hand"').finally(menu);

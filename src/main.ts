// The app: start screen → game screen → "Play again" or a new game.
import "@fontsource/cinzel/700.css";
import "@fontsource/cinzel/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./ui/app.css";
import { artDefs } from "./render/art";
import { GameScreen, type Setup } from "./ui/app";
import { showSetup } from "./ui/setup";

const root = document.querySelector<HTMLElement>("#app")!;
document.body.insertAdjacentHTML("afterbegin", artDefs()); // the light every illustration and token uses
let last: Setup | null = null;

function play(s: Setup): void {
  last = s;
  new GameScreen(root, s, (again) => (again ? play(s) : menu()));
}

function menu(): void {
  showSetup(root, last, play);
}

Promise.all([document.fonts.load('700 20px "Cinzel"'), document.fonts.load('20px "Inter"')]).finally(menu);

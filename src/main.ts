// Step 3 preview: the two boards, drawn as on paper. Step 4 adds the camera (pan, zoom, follow) and the tokens;
// Step 5 the game screens.
import "@fontsource/patrick-hand";
import { BOARDS, type BoardId } from "./engine";
import { renderBoard } from "./render/board";

const PX_PER_UNIT = 64;
const view = document.querySelector<HTMLElement>("#view")!;
const fitButton = document.querySelector<HTMLButtonElement>("#fit")!;
let current: BoardId = "long", fit = false;

function show(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { canvas } = renderBoard(BOARDS[current], PX_PER_UNIT * dpr);
  const w = canvas.width / dpr, h = canvas.height / dpr;
  const k = fit ? Math.min(view.clientWidth / w, view.clientHeight / h) : 1;
  canvas.style.width = `${w * k}px`;
  canvas.style.height = `${h * k}px`;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", `${BOARDS[current].story.title}: the board`);
  view.replaceChildren(canvas);
}

document.querySelectorAll<HTMLButtonElement>("button[data-board]").forEach((b) =>
  b.addEventListener("click", () => {
    current = b.dataset.board as BoardId;
    document.querySelectorAll("button[data-board]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    show();
  }));
fitButton.addEventListener("click", () => {
  fit = !fit;
  fitButton.setAttribute("aria-pressed", String(fit));
  show();
});
window.addEventListener("resize", () => { if (fit) show(); });

document.fonts.load('100px "Patrick Hand"').finally(show);

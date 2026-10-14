// Preview of the board at square level (Step 3, redone): drag to move, pinch / wheel / buttons to zoom.
// Step 4 adds the tokens and the camera following them; Step 5 the game screens.
import "@fontsource/patrick-hand";
import { BOARDS, type BoardId } from "./engine";
import { type BoardView, UNIT, createBoardView } from "./render/board";
import { Camera } from "./render/camera";

const viewport = document.querySelector<HTMLElement>("#view")!;
let view: BoardView | null = null, camera: Camera | null = null;

/** Square level, with Start in the upper left part of the screen. */
function toStart(ms?: number): void {
  if (!view || !camera) return;
  const s = view.layout.squares[0];
  camera.focus(s.x + 1, s.y + 0.6, ms);
}

function show(id: BoardId): void {
  view = createBoardView(BOARDS[id]);
  viewport.replaceChildren(view.world);
  camera = new Camera(viewport, view.world, view.layout.bounds, UNIT);
  view.setLive(viewport);
  toStart(0);
  if (import.meta.env.DEV) Object.assign(window, { dgm: { view, camera } }); // for screenshots while developing
}

document.querySelectorAll<HTMLButtonElement>("button[data-board]").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("button[data-board]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    show(b.dataset.board as BoardId);
  }));
document.querySelector("#zin")!.addEventListener("click", () => camera?.zoomBy(1.5));
document.querySelector("#zout")!.addEventListener("click", () => camera?.zoomBy(1 / 1.5));
document.querySelector("#all")!.addEventListener("click", () => camera?.overview());
document.querySelector("#home")!.addEventListener("click", () => toStart());

document.fonts.load('100px "Patrick Hand"').finally(() => show("long"));

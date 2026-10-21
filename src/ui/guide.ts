// How to play (owner, 15 Oct: "a very short pre-game guide the first time"; 16 Oct: eight short pages, rules only, no
// story words, with pictures of the real game screen): shown once on this device before the start screen, and any time
// from "How to play" there. Skip, Back / Next, the arrow keys and Escape all work. Every rule in it is the engine's.
// The pictures are made from the game itself: `npm run guide:shots` (tools/browser/guide-shots.mjs) makes them again.
import { artFor } from "../render/art";
import { tokenSvg } from "./players";
import lanternsShot from "../assets/guide/lanterns.png";
import squareShot from "../assets/guide/square.png";
import cardsShot from "../assets/guide/cards.png";

interface Page {
  art: () => string;
  title: string;
  text: string;
  /** The art is a picture of the game screen (wider than the square drawings). */
  shot?: boolean;
}

const shot = (src: string, alt: string) => () => `<img src="${src}" alt="${alt}">`;

/** Three dice: 6 + 6 + 3. */
function dice(): string {
  const PIPS: Record<number, [number, number][]> = { 6: [[7, 6], [7, 12], [7, 18], [17, 6], [17, 12], [17, 18]], 3: [[6, 6], [12, 12], [18, 18]] };
  const die = (n: number, x: number) => `<g transform="translate(${x} 38)"><rect x="1" y="1" width="22" height="22" rx="5" fill="#fffdf6" stroke="#4b2377" stroke-width="2"/>${PIPS[n].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.2" fill="#4b2377"/>`).join("")}</g>`;
  return `<svg class="art" viewBox="0 0 100 100" role="img" aria-label="Dice: 6, 6 and 3">${die(6, 8)}${die(6, 38)}${die(3, 68)}</svg>`;
}

export const GUIDE: Page[] = [
  {
    art: () => artFor("lanterns", "The Festival of Lights"), title: "Welcome to Don't Get Mad!",
    text: "A race game for 2 to 4 players: humans or computer. <b>Be the first to reach the final square of the board</b> and you win!",
  },
  {
    art: () => artFor("house", "Home"), title: "Roll a 6 to enter the game",
    text: "Roll a <b>6</b> to start the game. No 6 in three turns? You start, but <b>lose a lantern</b>. Or decide to <b>spend a lantern</b> to start at once, without waiting for a 6.",
  },
  {
    art: shot(lanternsShot, "The players at the top of the screen, each with their number of lanterns"), shot: true, title: "Lanterns are your lives",
    text: "You start with <b>3 lanterns</b>. <b>Three 6s in a row</b> earn you one lantern! If you need a lantern but have none, you are <b>out of the game</b>!",
  },
  {
    art: dice, title: "Sixes add up",
    text: "Roll a <b>6</b> and you earn the right to roll again! Up to three rolls if they are all 6s. Then you move by the total: <b>6 + 6 + 3 = 15 squares</b> in one move.",
  },
  {
    art: shot(squareShot, "A square tapped on the board, telling what it does"), shot: true, title: "Good and bad squares",
    text: "<b class=\"g\">Green ▲</b> helps, <b class=\"r\">red ▼</b> sets you back. Read what lies on your path in the game notifications, or <b>tap any square</b> on the game board to discover your destiny.",
  },
  {
    art: shot(cardsShot, "The Bonus card and the Bog boots, at the top of the screen"), shot: true, title: "Bonus card",
    text: "Win cards during the game. <b>Bonus card</b>: cancels your punishment or another player's reward. <b>Bog boots</b>: escape the Bog at once!",
  },
  {
    art: () => `<div class="g-two">${tokenSvg(0, "tok", true)}${tokenSvg(1, "tok", true)}</div>`, title: "Bump!",
    text: "Only one player per square. If you land on another player's square, <b>they go back to the start</b>!",
  },
  {
    art: () => artFor("lanterns", "The finish"), title: "The exact number",
    text: "If you are 1 square away from the last square, you need to <b>roll a 1</b> to land there and win. If you roll more, you have just <b>wasted this turn</b>.",
  },
];

const KEY = "dgm.guide.v1";

/** Whether this device has seen the guide (the guide shows itself once). Blocked storage: seen, so it never nags. */
export function guideSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === "seen";
  } catch {
    return true;
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(KEY, "seen");
  } catch {
    // storage blocked: nothing to remember
  }
}

/** Shows the guide over the whole screen; resolves when it is closed (finished or skipped). */
export function showGuide(): Promise<void> {
  return new Promise((done) => {
    const el = document.createElement("div");
    el.className = "howto";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "How to play");
    document.body.append(el);
    const before = document.activeElement as HTMLElement | null;
    let page = 0;
    const close = () => {
      markSeen();
      document.removeEventListener("keydown", onKey);
      el.remove();
      before?.focus?.({ preventScroll: true });
      done();
    };
    const go = (to: number) => {
      if (to >= GUIDE.length) return close();
      page = Math.max(0, to);
      const p = GUIDE[page], last = page === GUIDE.length - 1;
      el.innerHTML = `<div class="g-card">`
        + `<button class="g-skip" aria-label="Skip the guide">Skip</button>`
        + `<div class="g-art${p.shot ? " shot" : ""}">${p.art()}</div>`
        + `<p class="g-step">How to play · ${page + 1} of ${GUIDE.length}</p>`
        + `<h2>${p.title}</h2><p class="g-text">${p.text}</p>`
        + `<div class="g-dots" aria-hidden="true">${GUIDE.map((_, i) => `<i${i === page ? ' class="on"' : ""}></i>`).join("")}</div>`
        + `<div class="g-buttons">${page ? `<button class="g-back">Back</button>` : ""}<button class="g-next primary">${last ? "Let's play!" : "Next"}</button></div>`
        + `</div>`;
      el.querySelector<HTMLButtonElement>(".g-skip")!.onclick = close;
      el.querySelector<HTMLButtonElement>(".g-back")?.addEventListener("click", () => go(page - 1));
      el.querySelector<HTMLButtonElement>(".g-next")!.onclick = () => go(page + 1);
      el.querySelector<HTMLButtonElement>(".g-next")!.focus({ preventScroll: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" && page < GUIDE.length - 1) go(page + 1);
      else if (e.key === "ArrowLeft") go(page - 1);
    };
    document.addEventListener("keydown", onKey);
    go(0);
  });
}

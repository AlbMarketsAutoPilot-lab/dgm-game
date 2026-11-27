// How to play (owner, 15 Oct: "a very short pre-game guide the first time"; 16 Oct: eight short pages, rules only, no
// story words, with pictures of the real game screen; Step I phase F, 27 Nov 2026: the v3 rules, a picture on every page): shown once on this device before the start screen, and any time
// from "How to play" there. Skip, Back / Next, the arrow keys and Escape all work. Every rule in it is the engine's.
// The pictures are made from the game itself: `npm run guide:shots` (tools/browser/guide-shots.mjs) makes them again.
import { esc } from "../render/html";
import { resetTips } from "./tips";
import welcomeShot from "../assets/guide/welcome.png";
import homeShot from "../assets/guide/home.png";
import sixesShot from "../assets/guide/sixes.png";
import squaresShot from "../assets/guide/squares.png";
import cardShot from "../assets/guide/card.png";
import areasShot from "../assets/guide/areas.png";
import bumpShot from "../assets/guide/bump.png";
import finishShot from "../assets/guide/finish.png";

interface Page {
  /** A picture of the game screen and its hidden label (both approved by the owner, Step I phase F2). */
  pic: string;
  alt: string;
  title: string;
  text: string;
}

// Step I phase F (owner, 27 Nov 2026): the v3 rules; texts (F1) and pictures with their labels (F2) approved word for word.
export const GUIDE: Page[] = [
  {
    pic: welcomeShot, alt: "The game screen: the players at the top and the board", title: "Welcome to Don't Get Mad!",
    text: "A race game for 2 to 4 players: people or computer players. <b>Be the first to reach the last square</b> and you win!",
  },
  {
    pic: homeShot, alt: "Blue's turn at Home, needing a 6 to set off, with a Bonus card in hand", title: "Roll a 6 to leave Home",
    text: "Everyone starts at <b>Home</b> with <b>1 Bonus card</b>. Roll a <b>6</b> to leave: one roll per turn, as many turns as it takes. Or <b>use your Bonus card</b> to leave without a 6. Then roll again to move.",
  },
  {
    pic: sixesShot, alt: 'A 6 on the die, the sign "A six!" and the button "Roll again"', title: "Sixes add up",
    text: "Every <b>6</b> gives you another roll, <b>with no limit</b>. Your rolls add up into one move: <b>6 + 6 + 3 = 15 squares</b>. The 6 that lets you leave Home only frees you: it does not move you.",
  },
  {
    pic: squaresShot, alt: "A square tapped on the board: the box tells what the Swap Market does", title: "Good and bad squares",
    text: "<b class=\"g\">Green ▲</b> helps you, <b class=\"r\">red ▼</b> sets you back, and <b class=\"b\">blue ◆</b> makes a Bonus card change hands. Only the square where you stop counts. <b>Tap any square</b> on the board to see what it does.",
  },
  {
    pic: cardShot, alt: "The players at the top of the screen; the small card next to each player shows how many Bonus cards they hold, and is shown large below", title: "Bonus card",
    text: "Use it to <b>leave Home</b> or <b>pass the fallen tree</b> without a 6, or to <b>cancel your own bad luck</b>. It cannot stop a bump or a swap. One use per card; win more on the way.",
  },
  {
    pic: areasShot, alt: 'A token entering a new area: the sign "Now entering · Mountains"', title: "Areas",
    text: "The board has <b>6 areas</b>. The first time you enter a new area with your own roll, something happens: a free 6, a move backward, a roll that counts double, a swap, a Bonus card or a lost turn. You are told which as you arrive.",
  },
  {
    pic: bumpShot, alt: "A bump: Blue lands on Red's square, Red goes back Home and needs no 6 to leave", title: "Bump!",
    text: "Only one player per square. Land on another player and <b>they go back Home</b>. After a bump, they need <b>no 6</b> to leave again.",
  },
  {
    pic: finishShot, alt: "Blue needs exactly 3 to finish, but the die shows 5: Blue stays where it is", title: "The exact number",
    text: "To reach the last square you need the <b>exact number</b>. Roll too much and you stay where you are. A <b>6</b> never finishes: it always rolls again.",
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
  resetTips(); // Mr. Lin's tips are shown again after "How to play" (owner, Step I phase F)
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
        + `<div class="g-art shot"><img src="${p.pic}" alt="${esc(p.alt)}"></div>`
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

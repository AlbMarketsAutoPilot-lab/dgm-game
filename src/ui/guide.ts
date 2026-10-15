// How to play (owner, 15 Oct: "a very short pre-game guide the first time"): four short pages over the whole screen,
// shown once on this device before the start screen, and any time from "How to play" there. Skip, Back / Next, the
// arrow keys and Escape all work. The texts are a DRAFT for the owner's approval; every rule in them is the engine's.
import { artFor } from "../render/art";
import { cardFace } from "../render/art-modern";

interface Page {
  art: () => string;
  title: string;
  text: string;
}

export const GUIDE: Page[] = [
  {
    art: () => artFor("lanterns", "The Festival of Lights"), title: "Race to the Festival of Lights",
    text: "Everyone sets off from Home. Follow the road round the spiral to the Festival of Lights in the middle. <b>The first one there wins.</b>",
  },
  {
    art: () => artFor("house", "Home"), title: "Roll a 6 to set off",
    text: "You need a <b>6</b> to step onto the board. Every 6 gives you one more throw, and the throws add up. No 6 after three tries? You set off anyway, but one of your lanterns goes out. In a hurry? Spend a lantern to set off at once, without waiting for a 6 (the Bog works the same way).",
  },
  {
    art: () => cardFace("bonus", "Bonus card"), title: "Good and bad squares",
    text: "<b class=\"g\">Green ▲</b> squares help you, <b class=\"r\">red ▼</b> squares set you back. Tap any square on the board to see what it does. Land on another player, and they go back to Start.",
  },
  {
    art: () => artFor("lantern", "A lantern"), title: "Lanterns, and the finish",
    text: "You carry 3 lanterns. With none left, one more slip ends your journey; three 6s in a row light one again. To finish you need <b>the exact number</b>: too much, and you stay where you are.",
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
        + `<div class="g-art">${p.art()}</div>`
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

// Development page (npm run dev → /gallery.html): every illustration on its square card, for review.
import "@fontsource/patrick-hand";
import "./ui/app.css";
import { ART, artCss, artFor } from "./render/art";
import { SNAKE_DOWN_DRAFTS } from "./render/art-modern";

const style = document.createElement("style");
style.textContent = artCss() + `
  body { background: #f7f1e3; }
  #gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px; padding: 16px; }
  figure { margin: 0; text-align: center; font-size: 15px; color: #4b2377; }
  .card { --card: 180px; margin: 0 auto 4px; }`;
document.head.append(style);
document.querySelector("#gallery")!.innerHTML = Object.keys(ART).sort().map((name) =>
  `<figure><div class="card ev" style="--c:#e8c25a"><div class="cart">${artFor(name, name)}</div></div><figcaption>${name}</figcaption></figure>`).join("");

// ?compare: the owner's review of the snake-down drafts, the current picture first
if (new URLSearchParams(location.search).has("compare")) {
  style.textContent += "#gallery { grid-template-columns: repeat(3, 280px); justify-content: center; } .card { --card: 260px; }";
  const draw = (svg: string, box = "6 6 88 88") => `<svg class="art" viewBox="${box}" role="img">${svg}</svg>`;
  document.querySelector("#gallery")!.innerHTML = `<figure><div class="card ev" style="--c:#e8c25a"><div class="cart">${artFor("snake-down", "snake-down")}</div></div><figcaption>snake-down · now</figcaption></figure>`
    + Object.entries(SNAKE_DOWN_DRAFTS).map(([name, a]) => `<figure><div class="card ev" style="--c:#e8c25a"><div class="cart">${draw(a.svg, a.box)}</div></div><figcaption>${name}</figcaption></figure>`).join("");
}

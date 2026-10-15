// Development page (npm run dev → /gallery.html): every illustration on its square card, for review.
import "@fontsource/patrick-hand";
import "./ui/app.css";
import { ART, artCss, artFor } from "./render/art";
import { CARD_DESIGNS, MODERN, cardFace } from "./render/art-modern";

const style = document.createElement("style");
style.textContent = artCss() + `
  body { background: #f7f1e3; }
  #gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px; padding: 16px; }
  figure { margin: 0; text-align: center; font-size: 15px; color: #4b2377; }
  .card { --card: 180px; margin: 0 auto 4px; }`;
document.head.append(style);
document.querySelector("#gallery")!.innerHTML = Object.keys(ART).sort().map((name) =>
  `<figure><div class="card ev" style="--c:#e8c25a"><div class="cart">${artFor(name, name)}</div></div><figcaption>${name}</figcaption></figure>`).join("");

// ?compare: the owner's review of the draft redraws, current picture on the left, draft on the right; then the cards
if (new URLSearchParams(location.search).has("compare")) {
  style.textContent += `#gallery { grid-template-columns: repeat(4, 200px); justify-content: center; } .card { --card: 180px; }
    figure.pair-new figcaption { font-weight: bold; } .card-face { width: 180px; display: block; margin: 0 auto 4px; }`;
  const names = Object.keys(ART).sort();
  document.querySelector("#gallery")!.innerHTML = names.map((name) => {
    const a = MODERN[name];
    return `<figure><div class="card ev" style="--c:#e8c25a"><div class="cart">${artFor(name, name)}</div></div><figcaption>${name} · now</figcaption></figure>`
      + `<figure class="pair-new"><div class="card ev" style="--c:#e8c25a"><div class="cart">${a ? `<svg class="art" viewBox="${a.box ?? "6 6 88 88"}" role="img" aria-label="${name}">${a.svg}</svg>` : "missing"}</div></div><figcaption>${name} · new</figcaption></figure>`;
  }).join("") + Object.keys(CARD_DESIGNS).map((k) => `<figure>${cardFace(k as keyof typeof CARD_DESIGNS, k)}<figcaption>card · ${k}</figcaption></figure>`).join("");
}

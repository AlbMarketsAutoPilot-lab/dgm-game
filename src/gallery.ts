// Development page (npm run dev → /gallery.html): every illustration on its square card, for review.
import "@fontsource/patrick-hand";
import "./ui/app.css";
import { ART, artCss, artFor } from "./render/art";

const style = document.createElement("style");
style.textContent = artCss() + `
  body { background: #f7f1e3; }
  #gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px; padding: 16px; }
  figure { margin: 0; text-align: center; font-size: 15px; color: #4b2377; }
  .card { --card: 180px; margin: 0 auto 4px; }`;
document.head.append(style);
document.querySelector("#gallery")!.innerHTML = Object.keys(ART).sort().map((name) =>
  `<figure><div class="card ev" style="--c:#e8c25a"><div class="cart">${artFor(name, name)}</div></div><figcaption>${name}</figcaption></figure>`).join("");

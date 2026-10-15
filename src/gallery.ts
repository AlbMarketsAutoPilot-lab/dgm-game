// Development page (npm run dev → /gallery.html): every illustration, lit, on its stage tile, for review.
import "./ui/app.css";
import { ART, artCss, artDefs, artFor } from "./render/art";

const style = document.createElement("style");
style.textContent = artCss() + `
  body { background: radial-gradient(circle at 50% 0%, #1f5a5c, #0b2427 70%); min-height: 100vh; }
  #gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px; padding: 16px; }
  figure { margin: 0; text-align: center; font-size: 15px; color: #e9dcb4; }
  .tile { width: 180px; height: 180px; margin: 0 auto 6px; border-radius: 22px; overflow: hidden; background: radial-gradient(circle at 50% 35%, #fdf6e3, #d9c9a0); box-shadow: 0 10px 30px rgba(0,0,0,.5), inset 0 0 0 2px rgba(255,255,255,.4); }
  .tile .art { width: 100%; height: 100%; display: block; }`;
document.head.append(style);
document.body.insertAdjacentHTML("afterbegin", artDefs());
const only = new URLSearchParams(location.search).get("only")?.split(",");
document.querySelector("#gallery")!.innerHTML = Object.keys(ART).sort().filter((n) => !only || only.includes(n)).map((name) =>
  `<figure><div class="tile">${artFor(name, name)}</div><figcaption>${name}</figcaption></figure>`).join("");

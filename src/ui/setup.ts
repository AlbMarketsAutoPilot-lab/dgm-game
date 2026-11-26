// Start screen: how many players, and which seats the computer plays (GCD §8.6). Step I phase C4 (owner, 25–26 Nov
// 2026): one destination, the Lantern Festival (no board choice), and one robot level (no Easy/Normal choice).
import { DESTINATIONS } from "../engine/v3";
import type { Setup } from "./app";
import { esc } from "../render/html";
import { PLAYERS, tokenSvg } from "./players";
import { POSTCARDS, loadAlbum, showAlbum } from "./postcards";
import { showGuide } from "./guide";
import { loadGame, type SavedGame } from "./save";
import { sound } from "./sound";
import { switchButtons, wireSwitches } from "./sound-switch";

/** Start screen. `start` gets the saved game too when the players continue it (U1). */
export function showSetup(root: HTMLElement, last: Setup | null, start: (s: Setup, resume?: SavedGame) => void): void {
  let players = last?.players ?? 2;
  const computer = last ? [...last.computer] : [false, true, true, true];
  while (computer.length < 4) computer.push(true);
  sound.music("menu");
  const render = () => {
    const album = loadAlbum(), saved = loadGame();
    // Groups, so the screen can lay them out in one column (portrait) or two (sideways phones, tablets, PC).
    root.innerHTML = `
      <div class="setup">
        <header class="s-head"><h1>Don't Get Mad!</h1><p class="sub">A hand-drawn journey to the Lantern Festival</p></header>
        ${saved ? `<button class="continue primary">Continue game<small>${esc(DESTINATIONS[saved.destination].destination?.name ?? "")} · ${saved.players} players · round ${saved.round}</small></button>` : ""}
        <section class="s-players"><h2>Players</h2>
          <div class="row">${[2, 3, 4].map((n) => `<button class="pick num" data-players="${n}" aria-pressed="${players === n}">${n}</button>`).join("")}</div>
          <div class="seats">${PLAYERS.slice(0, players).map((p, i) => `<button class="seat" data-seat="${i}">${tokenSvg(i, "mini")}<span>${esc(p.name)}</span><b>${computer[i] ? "Computer" : "Person"}</b></button>`).join("")}</div>
        </section>
        <footer class="s-go"><button class="go primary">Let's go!</button>${switchButtons()}<div class="s-more"><button class="album-open">Postcards · ${POSTCARDS.filter((p) => album.has(p.id)).length} / ${POSTCARDS.length}</button><button class="how-open">How to play</button></div></footer>
        <p class="s-legal">© 2026 Connect AL · <a href="./copyright.html">Copyright</a> · <a href="./privacy.html">Privacy</a></p>
      </div>`;
    root.querySelectorAll<HTMLButtonElement>("[data-players]").forEach((b) => b.onclick = () => { players = Number(b.dataset.players); render(); });
    root.querySelectorAll<HTMLButtonElement>("[data-seat]").forEach((b) => b.onclick = () => { const i = Number(b.dataset.seat); computer[i] = !computer[i]; render(); });
    root.querySelector<HTMLButtonElement>(".album-open")!.onclick = () => void showAlbum().then(render);
    wireSwitches(root);
    root.querySelector<HTMLButtonElement>(".how-open")!.onclick = () => void showGuide().then(render);
    const cont = root.querySelector<HTMLButtonElement>(".continue");
    if (cont && saved) cont.onclick = () => start({ players: saved.players, computer: [...saved.computer] }, saved);
    root.querySelector<HTMLButtonElement>(".go")!.onclick = () => start({ players, computer: computer.slice(0, players) });
  };
  render();
}

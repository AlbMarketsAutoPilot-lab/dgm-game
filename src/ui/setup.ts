// Start screen: which board, how many players, and which seats the computer plays (GCD §8.6).
import { BOARDS, type BoardId } from "../engine";
import type { Setup } from "./app";
import { PLAYERS, tokenSvg } from "./players";
import { artFor } from "../render/art";

export function showSetup(root: HTMLElement, last: Setup | null, start: (s: Setup) => void): void {
  let board: BoardId = (last?.board.id as BoardId) ?? "short", players = last?.players ?? 2;
  const computer = last ? [...last.computer] : [false, true, true, true];
  const render = () => {
    root.innerHTML = `
      <div class="setup">
        <div class="hero">${artFor("lanterns", "The Festival of Lights")}</div>
        <h1>Don't Get Mad!</h1>
        <p class="sub">A race to the Festival of Lights. Anything can happen on the way.</p>
        <h2>Which journey?</h2>
        <div class="row">${(["short", "long"] as BoardId[]).map((id) => `<button class="pick" data-board="${id}" aria-pressed="${board === id}">${BOARDS[id].story.title}<small>${id === "short" ? "100 squares, about 30 rounds" : "202 squares, about 50 rounds"}</small></button>`).join("")}</div>
        <h2>Players</h2>
        <div class="row">${[2, 3, 4].map((n) => `<button class="pick num" data-players="${n}" aria-pressed="${players === n}">${n}</button>`).join("")}</div>
        <div class="seats">${PLAYERS.slice(0, players).map((p, i) => `<button class="seat" data-seat="${i}">${tokenSvg(i, "mini")}<span>${p.name}</span><b>${computer[i] ? "Computer" : "Person"}</b></button>`).join("")}</div>
        <button class="go primary">Let's go!</button>
      </div>`;
    root.querySelectorAll<HTMLButtonElement>("[data-board]").forEach((b) => b.onclick = () => { board = b.dataset.board as BoardId; render(); });
    root.querySelectorAll<HTMLButtonElement>("[data-players]").forEach((b) => b.onclick = () => { players = Number(b.dataset.players); render(); });
    root.querySelectorAll<HTMLButtonElement>("[data-seat]").forEach((b) => b.onclick = () => { const i = Number(b.dataset.seat); computer[i] = !computer[i]; render(); });
    root.querySelector<HTMLButtonElement>(".go")!.onclick = () => start({ board: BOARDS[board], players, computer: computer.slice(0, players) });
  };
  render();
}

// The Records page (Step I phase E, owner 26 Nov 2026): over the whole screen, like the postcard album; opened from
// the start screen and from the win popup, "Back" closes it. All its words were approved word for word (R2–R7).
import { DESTINATIONS } from "../engine/v3";
import { artFor } from "../render/art";
import { esc } from "../render/html";
import { PLAYERS, tokenSvg } from "./players";
import { formatDate, formatTime, loadRecords, ordinal, type Ranking, type WinRecord } from "./records";

export const RT = {
  button: "Records", // R1
  back: "Back", // R2
  title: "Records", // R3
  intro: "The 10 fastest win times on this device.", // R4
  rule: "Only people's wins count, in games played from Home to the finish without interruption.", // R5
  cols: ["Rank", "Player", "Time", "Date", "Players", "Destination"], // R6
  empty: "No records yet. Win a game without interruption to set the first one.", // R7
  first: "Your win time, {t}, sets the first record.", // R8
  best: "Your win time, {t}, ranks 1st, beating all previous records.", // R9
  ranked: "Your win time, {t}, ranks {n} of all-time records.", // R10
  out: "Your win time, {t}, is not in the top 10 this time.", // R11
  blocked: "Your win time is {t}. This device does not let the game keep records.", // R12
  void: "Records count only games played without interruption.", // R13
  narrowPlayers: "Players: ", // phones under 390 px: each record on two lines, "Players: 3" (owner, 26 Nov 2026)
};

/** The win popup's line for a person's win: where the time ranks (R8–R12), or R13 when the time does not count. */
export function rankingLine(r: Ranking | null, s: number): string {
  if (!r) return RT.void;
  const t = formatTime(s);
  if (r.kind === "blocked") return RT.blocked.replace("{t}", t);
  if (r.kind === "out") return RT.out.replace("{t}", t);
  const line = r.first ? RT.first : r.rank === 1 ? RT.best : RT.ranked;
  return line.replace("{t}", t).replace("{n}", ordinal(r.rank));
}

function destName(id: string): string {
  return Object.prototype.hasOwnProperty.call(DESTINATIONS, id) ? DESTINATIONS[id as keyof typeof DESTINATIONS].destination?.name ?? "" : "";
}

function row(r: WinRecord, i: number): string {
  // roles: the table stays a table for screen readers when narrow phones show each record on two lines
  return `<tr role="row"><td role="cell" class="r-rank">${ordinal(i + 1)}</td>`
    + `<td role="cell" class="r-player">${tokenSvg(r.seat, "mini", true)}<span>${esc(PLAYERS[r.seat].name)}</span></td>`
    + `<td role="cell" class="r-time">${formatTime(r.s)}</td><td role="cell" class="r-date">${formatDate(r.date)}</td>`
    + `<td role="cell" class="r-players"><span class="r-lbl" aria-hidden="true">${RT.narrowPlayers}</span>${r.players}</td>`
    + `<td role="cell" class="r-dest">${esc(destName(r.destination))}</td></tr>`;
}

/** The Records, over the whole screen; resolves when it is closed. */
export function showRecords(): Promise<void> {
  return new Promise((done) => {
    const list = loadRecords();
    const el = document.createElement("div");
    el.className = "album records"; // the album's page: over everything, Back at the top
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", RT.title);
    const table = list.length
      ? `<table class="r-table" role="table"><thead><tr role="row">${RT.cols.map((c, i) => `<th role="columnheader" scope="col" class="${["r-rank", "r-player", "r-time", "r-date", "r-players", "r-dest"][i]}">${c}</th>`).join("")}</tr></thead>`
        + `<tbody>${list.map(row).join("")}</tbody></table>`
      : `<p class="r-empty">${RT.empty}</p>`;
    el.innerHTML = `<div class="album-top"><h2>${RT.title}</h2><button class="primary">${RT.back}</button></div>`
      + `<div class="r-head"><div class="r-art" aria-hidden="true">${artFor("lanterns", "")}</div><div><p class="r-intro">${RT.intro}</p><p class="r-rule">${RT.rule}</p></div></div>`
      + table;
    const back = el.querySelector("button")!, before = document.activeElement as HTMLElement | null;
    const close = () => { document.removeEventListener("keydown", onKey); el.remove(); before?.focus?.({ preventScroll: true }); done(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    back.onclick = close;
    document.addEventListener("keydown", onKey);
    document.body.append(el);
    back.focus({ preventScroll: true });
  });
}

// Whole games through the real game screen, then the same games replayed in the engine: at every turn the board
// must show each token where the engine has it, the round and the player must match, and the winner too.
// A game can be reloaded or left in the middle and continued: it must come back exactly as it was.
import { newPage } from "./common.mjs";

const STATE = () => ({
  act: [...document.querySelectorAll(".act button")].map((b) => b.textContent),
  pop: [...document.querySelectorAll(".pop:not([hidden]) .pop-buttons button")].map((b) => b.textContent),
  win: !!document.querySelector(".pop.win:not([hidden])"),
  save: (() => { try { return localStorage.getItem("dgm.game.v1"); } catch { return null; } })(),
  board: document.querySelector(".overview-board")?.getAttribute("aria-label"),
  who: document.querySelector(".hud b")?.textContent,
  round: document.querySelector(".hud .st")?.textContent,
  // A lantern spent to leave: the popup's count must be the one the players' bar shows (owner, 16 Oct: it said
  // "0 lanterns left" with one still on the player)
  spent: [...document.querySelectorAll(".pop:not([hidden])")].filter((p) => /^A Lantern for (the Road|a Way Out)$/.test(p.querySelector(".pop-title")?.textContent ?? ""))
    .map((p) => { const who = p.querySelector(".pop-kicker")?.textContent?.trim(); return { who, said: p.querySelector(".pop-outcome")?.textContent, bar: document.querySelector(`.avatar[aria-label^="${who}"]`)?.getAttribute("aria-label") }; })[0],
});

// The players' answers: roll, use the Bonus card on their own bad luck, wear the Bog boots, let others' luck go (the
// computer players' answers too, so the engine can replay a mixed table with its own computer player). With `spend`,
// people spend a lantern whenever they wait at Home or in the Bog with one left (owner, 15 Oct).
const pick = (list, spend = false) => (spend ? list.find((t) => t.startsWith("Spend a lantern")) : undefined)
  ?? list.find((t) => /^Roll the die|^Roll for a 6|^Roll to move|^OK, skip|^Roll again|^Throw \d/.test(t)) ?? list.find((t) => t === "Use the card: dodge it!")
  ?? list.find((t) => t.startsWith("Wear the boots")) ?? list.find((t) => t === "Let it go") ?? list.find((t) => /^Pass the die|^Let's go/.test(t)) ?? list[0];

/** Plays one game; `brk` = { kind: "reload" | "leave", at: n } interrupts it at the n-th turn and continues it. */
export async function playGame(browser, url, { board, players, people, brk, spend = false }) {
  const { ctx, page, errors } = await newPage(browser);
  await page.goto(`${url}/?fast`);
  await page.waitForSelector(".setup .go");
  await page.click(`[data-board="${board}"]`);
  await page.click(`[data-players="${players}"]`);
  for (let i = 0; i < players; i++) {
    const computer = (await page.textContent(`[data-seat="${i}"] b`)) === "Computer";
    if (computer === people.includes(i)) await page.click(`[data-seat="${i}"]`);
  }
  await page.click(".setup .go");
  const turns = [], t0 = Date.now();
  let save = null, end = null, broke = null;
  const spent = [];
  let spends = 0;
  while (Date.now() - t0 < 15 * 60_000) {
    const s = await page.evaluate(STATE);
    if (s.save) save = JSON.parse(s.save);
    if (s.spent) {
      spends++;
      const said = s.spent.said?.match(/^(\d+) lanterns? left/)?.[1], bar = s.spent.bar?.match(/: (\d+) lanterns/)?.[1];
      if (said === undefined || said !== bar) spent.push(`${s.spent.who} spent a lantern: popup "${s.spent.said}", players' bar "${s.spent.bar}"`);
    }
    if (s.win) { end = { board: s.board, title: await page.textContent(".pop.win .pop-title") }; break; }
    if (s.act.length) {
      const t = pick(s.act, spend), start = /^(Roll the die|Roll for a 6|Spend a lantern|OK, skip this turn)/.test(t);
      if (start && brk && !broke && turns.length === brk.at) {
        const before = s.board;
        if (brk.kind === "reload") await page.reload();
        else { await page.click(".players .leave"); await page.locator(".pop.info button", { hasText: "Leave" }).click(); }
        await page.click(".setup .continue");
        await page.locator(".pop button", { hasText: "Let's go on!" }).click();
        await page.locator(".act button").first().waitFor();
        broke = { kind: brk.kind, same: before === (await page.evaluate(STATE)).board };
        continue;
      }
      if (start) turns.push({ who: s.who, board: s.board, round: s.round });
      await page.locator(".act button", { hasText: t }).first().click();
    } else if (s.pop.length) await page.locator(".pop:not([hidden]) .pop-buttons button", { hasText: pick(s.pop, spend) }).first().click();
    else await page.waitForTimeout(25);
  }
  // The same game in the engine, in the page (the development server serves the engine's source)
  const check = await page.evaluate(async ({ board, players, people, save, turns, end, spend }) => {
    const { BOARDS, Game, OFF, OUT, runTurn, simplePlayer: computer } = await import("/src/engine/index.ts");
    const simplePlayer = (d, g) => (d.kind === "spendLantern" ? spend && people.includes(d.player) : computer(d, g));
    const NAMES = ["Blue", "Red", "Green", "Yellow"], g = new Game(BOARDS[board], { players, seed: save.seed, first: save.first });
    const where = (p) => p === OFF ? "at Home" : p === OUT ? "out" : p === 0 ? "on Start" : p === g.board.endTile ? "at the festival" : `on square ${p}`;
    const label = () => `The whole board. ${g.players.map((p, i) => `${NAMES[i]} ${where(p.pos)}`).join(", ")}.`;
    const next = () => { let s = g.currentSeat; do s = (s + 1) % players; while (g.players[s].out); return s; };
    const diffs = [], allPeople = people.length === players;
    let i = 0;
    while (!g.over) {
      const t = allPeople ? turns[i++] : null, seat = next();
      runTurn(g, simplePlayer);
      if (!t) continue;
      if (t.who !== `${NAMES[seat]}'s turn`) diffs.push(`turn ${i}: screen says ${t.who}, engine ${NAMES[seat]}`);
      if (t.round !== `Round ${g.round}`) diffs.push(`turn ${i}: screen ${t.round}, engine round ${g.round}`);
      if (diffs.length > 5) break;
    }
    // the board at each turn's start = the engine just before that turn
    const h = new Game(BOARDS[board], { players, seed: save.seed, first: save.first });
    if (allPeople) for (const [k, t] of turns.entries()) {
      const want = (() => { const p = h.players; return `The whole board. ${p.map((q, j) => `${NAMES[j]} ${q.pos === OFF ? "at Home" : q.pos === OUT ? "out" : q.pos === 0 ? "on Start" : q.pos === h.board.endTile ? "at the festival" : `on square ${q.pos}`}`).join(", ")}.`; })();
      if (t.board !== want) { diffs.push(`turn ${k + 1}: screen "${t.board}", engine "${want}"`); break; }
      runTurn(h, simplePlayer);
    }
    const winner = g.winner === null ? "Nobody" : NAMES[g.winner];
    if (!end?.title?.startsWith(winner)) diffs.push(`winner: screen "${end?.title}", engine ${winner}`);
    if (end?.board !== label()) diffs.push(`final board: screen "${end?.board}", engine "${label()}"`);
    return { diffs, compared: allPeople ? turns.length : 0 };
  }, { board, players, people, save, turns, end, spend });
  await ctx.close();
  return { ...check, diffs: [...check.diffs, ...new Set(spent)], turns: turns.length, spends, broke, errors, ms: Date.now() - t0 };
}

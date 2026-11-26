// Whole games through the real game screen, then the same games replayed in the engine: at every turn the board
// must show each token where the engine has it, the round and the player must match, and the winner too.
// A game can be reloaded or left in the middle and continued: it must come back exactly as it was.
// Step I phase C8: the Lantern Festival and the v3 engine. Mr. Lin's panel holds the people's choices; it must never
// open during a robot's turn (owner: he never tells the robots' story), and robots must show notifications.
import { newPage } from "./common.mjs";

const STATE = () => ({
  act: [...document.querySelectorAll(".act button")].map((b) => b.textContent),
  panel: [...document.querySelectorAll(".guide-panel .gp-buttons button")].map((b) => b.textContent),
  words: document.querySelector(".guide-panel .gp-body")?.textContent.replace(/\s+/g, " ").trim() ?? "",
  pop: [...document.querySelectorAll(".pop:not([hidden]) .pop-buttons button")].map((b) => b.textContent),
  win: !!document.querySelector(".pop.win:not([hidden])"),
  save: (() => { try { return localStorage.getItem("dgm.game.v1"); } catch { return null; } })(),
  board: document.querySelector(".overview-board")?.getAttribute("aria-label"),
  who: document.querySelector(".hud b")?.textContent,
  round: document.querySelector(".hud .st")?.textContent,
  notes: [...document.querySelectorAll(".notes .note")].map((n) => n.textContent.trim()),
});

// The people's answers, the same in the engine below: no card at Home and at the tree, the card on every punishment,
// the first player offered at the Swap Market; then whatever moves the game on.
const PANEL = (list) => list.find((t) => t === "No Bonus card this turn") ?? list.find((t) => t === "Use Bonus card") ?? list[0];
const people = (d) => (d.kind === "waitCard" ? false : d.kind === "punishment" ? true : d.candidates[0]);

/**
 * The Records (Step I phase E, owner 26 Nov 2026), on a device with no records yet: a person's uninterrupted win is
 * the first record; after a reload or Leave and Continue the time does not count (R13) and nothing is stored; a
 * robot's win gets no line and nothing is stored.
 */
function recordsCheck(winner, seats, players, brk, end) {
  if (!end || winner === null) return [];
  const bad = [], person = seats.includes(winner);
  if (!person) {
    if (end.recLine) bad.push(`a robot's win has a Records line: "${end.recLine}"`);
    if (end.records.length) bad.push("a robot's win was stored in the Records");
  } else if (brk) {
    if (end.recLine !== "Records count only games played without interruption.") bad.push(`interrupted game: Records line "${end.recLine}"`);
    if (end.records.length) bad.push("an interrupted game was stored in the Records");
  } else {
    if (!/^Your win time, \d+:\d\d(:\d\d)?, sets the first record\.$/.test(end.recLine ?? "")) bad.push(`uninterrupted win: Records line "${end.recLine}"`);
    const r = end.records[0];
    if (end.records.length !== 1 || r.seat !== winner || r.players !== players || r.destination !== "lantern-festival") bad.push(`uninterrupted win: stored ${JSON.stringify(end.records)}`);
  }
  return bad;
}

/** Plays one game; `brk` = { kind: "reload" | "leave", at: n } interrupts it at the n-th turn and continues it. */
export async function playGame(browser, url, { players, people: seats, brk }) {
  const { ctx, page, errors } = await newPage(browser);
  await page.goto(`${url}/?fast`);
  await page.waitForSelector(".setup .go");
  await page.click(`[data-players="${players}"]`);
  for (let i = 0; i < players; i++) {
    const computer = (await page.textContent(`[data-seat="${i}"] b`)) === "Computer";
    if (computer === seats.includes(i)) await page.click(`[data-seat="${i}"]`);
  }
  await page.click(".setup .go");
  const NAMES = ["Blue", "Red", "Green", "Yellow"], turns = [], t0 = Date.now(), robotPanels = new Set();
  let save = null, end = null, broke = null, lastWho = "", fresh = false, lastWords = "", robotNotes = 0;
  const seen = new Set();
  while (Date.now() - t0 < 15 * 60_000) {
    const s = await page.evaluate(STATE);
    if (s.save) save = JSON.parse(s.save);
    for (const n of s.notes) if (!seen.has(n)) { seen.add(n); if (!seats.includes(NAMES.indexOf(n.split(/[ :]/)[0]))) robotNotes++; }
    const whoSeat = NAMES.indexOf(s.who?.replace("'s turn", "") ?? "");
    if (s.words && s.words !== lastWords && whoSeat >= 0 && !seats.includes(whoSeat) && !s.panel.some((t) => t.startsWith("Pass the die")) && !(turns.length === 0 && s.panel.includes("Let's go"))) robotPanels.add(`Mr. Lin's panel in ${NAMES[whoSeat]}'s turn (a robot): "${s.words.slice(0, 40)}"`);
    lastWords = s.words;
    if (s.who !== lastWho) { lastWho = s.who; fresh = true; } // a new turn on screen
    if (s.win) {
      end = {
        board: s.board, title: await page.textContent(".pop.win .pop-title"),
        recLine: (await page.locator(".pop.win .rec-line").textContent().catch(() => null)) || null,
        records: await page.evaluate(() => JSON.parse(localStorage.getItem("dgm.records.v1") ?? "[]")),
      };
      break;
    }
    const buttons = s.panel.length ? s.panel : s.act;
    if (buttons.length) {
      const t = s.panel.length ? PANEL(s.panel) : buttons[0];
      const start = fresh && seats.includes(whoSeat) && !/^Pass the die|^Let's go$/.test(t);
      if (start && brk && !broke && turns.length === brk.at) {
        const before = s.board;
        if (brk.kind === "reload") await page.reload();
        else { await page.click(".players .leave"); await page.locator(".pop.info button", { hasText: "Leave" }).click(); }
        await page.click(".setup .continue");
        await page.locator(".pop button", { hasText: "Let's go on!" }).click();
        await page.locator(".act button, .guide-panel button").first().waitFor();
        broke = { kind: brk.kind, same: before === (await page.evaluate(STATE)).board };
        lastWho = ""; fresh = false;
        continue;
      }
      if (start) { turns.push({ who: s.who, board: s.board, round: s.round }); fresh = false; }
      await page.locator(s.panel.length ? ".guide-panel .gp-buttons button" : ".act button", { hasText: t }).first().click();
    } else if (s.pop.length) await page.locator(".pop:not([hidden]) .pop-buttons button").first().click();
    else await page.waitForTimeout(25);
  }
  // The same game in the engine, in the page (the development server serves the engine's source)
  const check = await page.evaluate(async ({ players, seats, save, turns, end, people }) => {
    const { robot, runTurn3 } = await import("/src/engine/v3/index.ts");
    const { newGame } = await import("/src/ui/save.ts");
    const decide = new Function("return " + people)();
    const NAMES = ["Blue", "Red", "Green", "Yellow"], computer = Array.from({ length: players }, (_, i) => !seats.includes(i));
    const answer = (d, g) => (computer[d.player] ? robot(d, g) : decide(d));
    const label = (g) => `The whole board. ${g.players.map((p, i) => `${NAMES[i]} ${p.pos <= 0 ? "at Home" : p.pos === g.board.endTile ? `at ${g.board.destination.name}` : `on square ${p.pos}`}`).join(", ")}.`;
    const g = newGame("lantern-festival", players, computer, save.seed, save.first), diffs = [], allPeople = seats.length === players;
    let i = 0;
    while (!g.over) {
      // a turn of "exactly 1 square" (square 7) needs no tap, so the screen recorded no start for it
      if (allPeople && turns[i] && g.players[g.next].slow && turns[i].who !== `${NAMES[g.next]}'s turn`) { runTurn3(g, answer); continue; }
      if (allPeople && turns[i]) {
        const t = turns[i], seat = g.next;
        if (t.who !== `${NAMES[seat]}'s turn`) diffs.push(`turn ${i + 1}: screen says ${t.who}, engine ${NAMES[seat]}`);
        if (t.board !== label(g)) diffs.push(`turn ${i + 1}: screen "${t.board}", engine "${label(g)}"`);
        if (diffs.length > 3) break;
      }
      i++;
      runTurn3(g, answer);
    }
    const winner = g.winner === null ? "Nobody" : NAMES[g.winner];
    if (!end?.title?.startsWith(winner)) diffs.push(`winner: screen "${end?.title}", engine ${winner}`);
    if (end?.board !== label(g)) diffs.push(`final board: screen "${end?.board}", engine "${label(g)}"`);
    return { diffs, compared: allPeople ? turns.length : 0, winner: g.winner };
  }, { players, seats, save, turns, end, people: people.toString() });
  await ctx.close();
  return { ...check, diffs: [...check.diffs, ...recordsCheck(check.winner, seats, players, brk, end), ...robotPanels, ...(seats.length < players && !robotNotes ? ["no robot notification seen"] : [])], turns: turns.length, notes: robotNotes, broke, errors, ms: Date.now() - t0 };
}

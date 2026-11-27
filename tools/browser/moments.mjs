// Audit of 27 Nov 2026: chosen moments of real games, each started from a saved game with a known seed ("Continue
// game" plays it again from the start), played by the game's own buttons (`?fast`, development server):
//   - leaving while choosing at the Swap Market: no error (B1);
//   - leaving at "Pass the die": the next turn does not go on unseen, so no tip is used up (B2);
//   - Skipping Stones: a 6 on a stone gives no "Roll again" (B3);
//   - a robot's forced Bonus card at Home is told as leaving Home, not the tree (B4).
// The seeds were found with the engine (src/engine/v3); a change of the rules or the board changes them.
import { newPage } from "./common.mjs";

const SEL = ".act button, .guide-panel button, .pop:not([hidden]) .pop-buttons button";
const PLAIN = ["Let's go on!", "Let's go", "I understand", "Roll die", "Roll again", "No Bonus card this turn", "Keep my card", "Skip this turn"];

/** A page with a saved game of this seed, continued; `tips`: the tips already shown on the device. */
async function open(browser, url, { seed, computer, tips }) {
  const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1366, height: 768 } });
  await page.goto(`${url}/?fast`);
  const hash = await page.evaluate(async () => (await import("/src/ui/save.ts")).boardHash((await import("/src/engine/v3/index.ts")).DESTINATIONS["lantern-festival"]));
  const save = { v: 4, destination: "lantern-festival", boardHash: hash, players: computer.length, computer, seed, first: 0, answers: [], turns: 0, cards: [], round: 1 };
  await page.evaluate(([s, t]) => { localStorage.setItem("dgm.game.v1", s); localStorage.setItem("dgm.tips.v1", t); }, [JSON.stringify(save), JSON.stringify(tips)]);
  await page.reload();
  await page.click(".continue");
  return { ctx, page, errors };
}

/** Plays by the buttons (the first partner at the Swap Market) until `stop(state)` is true; returns that state. */
async function playUntil(page, stop, steps = 6000) {
  for (let i = 0; i < steps; i++) {
    const st = await page.evaluate((sel) => ({
      buttons: [...document.querySelectorAll(sel)].filter((b) => b.offsetParent).map((b) => b.textContent),
      words: document.querySelector(".guide-panel")?.textContent ?? "",
      notes: [...document.querySelectorAll(".note")].map((n) => n.textContent),
      turns: JSON.parse(localStorage.getItem("dgm.game.v1") || "{}").turns ?? -1,
    }), SEL);
    if (stop(st)) return st;
    const pick = st.buttons.find((b) => PLAIN.includes(b) || /^Pass the die/.test(b)) ?? st.buttons.find((b) => /^Give it to|^Take /.test(b));
    if (pick) await page.evaluate(([sel, l]) => [...document.querySelectorAll(sel)].find((b) => b.offsetParent && b.textContent === l)?.click(), [SEL, pick]);
    else await page.waitForTimeout(25);
  }
  return null;
}

async function leave(page) {
  await page.click(".leave");
  await page.waitForSelector('.pop[aria-label="Leave this game?"]');
  await page.evaluate(() => [...document.querySelectorAll(".pop button")].find((b) => b.textContent === "Leave")?.click());
  await page.waitForSelector(".setup");
  await page.waitForTimeout(500);
}

export async function checkMoments(browser, url, report) {
  const G = "chosen moments";
  { // B1: 3 players, the Swap Market's choice comes in the 12th turn
    const { ctx, page, errors } = await open(browser, url, { seed: 13331, computer: [false, false, true], tips: ["sixes", "tap", "bump", "card", "exact", "records"] });
    const st = await playUntil(page, (s) => s.buttons.some((b) => /^Give it to|^Take /.test(b)));
    if (st) await leave(page);
    report.add(G, "Leave while choosing at the Swap Market", !!st && !errors.length, !st ? "the choice never came" : errors.length ? errors.slice(0, 2).join(" | ") : "no error, back at the start screen");
    await ctx.close();
  }
  { // B2: 2 people, the Records tip still to come; Leave at the first "Pass the die" to a player on the road
    const { ctx, page, errors } = await open(browser, url, { seed: 4242, computer: [false, false], tips: ["sixes", "tap", "bump", "card", "exact"] });
    const st = await playUntil(page, (s) => s.buttons.some((b) => /^Pass the die/.test(b)) && s.turns >= 2);
    if (st) await leave(page);
    const tips = await page.evaluate(() => localStorage.getItem("dgm.tips.v1"));
    report.add(G, "Leave at \"Pass the die\": nothing more happens", !!st && !tips.includes("records") && !errors.length, !st ? "no Pass the die" : tips.includes("records") ? "a tip was used up after Leave" : errors.length ? errors[0] : "no tip used up, no error");
    await ctx.close();
  }
  { // B3: 4 people, a 6 on the second stone in the 12th turn
    const { ctx, page, errors } = await open(browser, url, { seed: 5494, computer: [false, false, false, false], tips: ["sixes", "tap", "bump", "card", "exact", "records"] });
    let stones = false, again = false;
    const st = await playUntil(page, (s) => {
      if (s.words.includes("Skipping Stones")) stones = true;
      if (stones && s.buttons.includes("Roll again")) again = true;
      return s.turns >= 12;
    });
    report.add(G, "Skipping Stones: a 6 gives no \"Roll again\"", !!st && stones && !again && !errors.length, !stones ? "Skipping Stones never came" : again ? "\"Roll again\" at Skipping Stones" : errors.length ? errors[0] : "three rolls, no \"Roll again\"");
    await ctx.close();
  }
  { // B4: a person and a robot; the robot's forced card at Home in the 6th turn
    const { ctx, page, errors } = await open(browser, url, { seed: 2, computer: [false, true], tips: ["sixes", "tap", "bump", "card", "exact", "records"] });
    const seen = new Set();
    const st = await playUntil(page, (s) => { s.notes.forEach((n) => seen.add(n)); return s.turns >= 6; });
    const home = [...seen].some((n) => n.includes("Red uses a Bonus card to leave Home")), tree = [...seen].some((n) => n.includes("Red uses a Bonus card to pass the tree"));
    report.add(G, "A robot's forced card at Home is told as leaving Home", !!st && home && !tree && !errors.length, tree ? "told as the tree" : !home ? "no note seen" : errors.length ? errors[0] : "\"Red uses a Bonus card to leave Home.\"");
    await ctx.close();
  }
}

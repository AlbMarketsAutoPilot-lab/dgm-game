// Step I phase F (owner, 27 Nov 2026), in the published build: Mr. Lin's tips in real games (people only, each with
// "I understand", at most one per turn, once per device, again after "How to play"), "game time" (no popup when a
// person rolls, no notification left after the tap, never a roll button in a popup), his words when the die is passed,
// and blocked storage (no tips, no error).
import fs from "node:fs";
import { ROOT, newPage } from "./common.mjs";

// the approved tip texts, read from the game's own file
const src = fs.readFileSync(`${ROOT}src/ui/tips.ts`, "utf8");
const TIPS = Object.fromEntries([...src.slice(src.indexOf("export const TIPS"), src.indexOf("} as const")).matchAll(/^\s+(\w+): "(.+)",$/gm)].map((m) => [m[1], m[2]]));
const tipOf = (words) => Object.keys(TIPS).find((k) => TIPS[k] === words.trim()) ?? null;
const WELCOME = JSON.parse(fs.readFileSync(`${ROOT}data/lantern-festival.json`, "utf8")).areas[0].announce;
const WHERE = /^(You stand |You are still at Home|The fallen tree still bars your way|You wait on the Dragon Boat)/;

/** Plays by the game's own buttons (Mr. Lin's panel first, else the action area) and watches every step. */
async function play(page, steps, until = () => false) {
  const out = { tips: [], pass: [], bad: new Set(), rolls: 0 };
  for (let i = 0; i < steps && !until(out); i++) {
    const st = await page.evaluate(() => ({
      panel: [...document.querySelectorAll(".guide-panel .gp-buttons button")].map((b) => b.textContent),
      words: document.querySelector(".guide-panel .gp-text")?.textContent ?? "",
      act: [...document.querySelectorAll(".act button")].map((b) => b.textContent),
      who: document.querySelector(".avatar.now")?.getAttribute("data-seat") ?? "",
      robot: !!document.querySelector(".avatar.now .cpu"),
      round: document.querySelector(".who .st")?.textContent ?? "",
      win: !!document.querySelector(".pop.win"),
    }));
    if (st.win) break;
    if (st.panel.some((b) => /^Roll/.test(b))) out.bad.add("a roll button in Mr. Lin's panel");
    if (st.panel.length && st.act.some((b) => /^Roll/.test(b))) out.bad.add("a popup open at a roll");
    if (st.panel.length) {
      // his welcome opens every game before the first turn, whoever starts (a robot too): not a robot's turn
      const welcome = st.panel.join() === "Let's go" && st.words.trim() === WELCOME;
      if (st.robot && !welcome && !st.panel.some((b) => /^Pass the die/.test(b))) out.bad.add(`Mr. Lin's panel in a robot's turn: ${st.panel.join("/")}`);
      const tip = tipOf(st.words);
      if (tip) out.tips.push({ tip, turn: `${st.who}/${st.round}`, button: st.panel.join(" / ") });
      if (st.panel.some((b) => /^Pass the die/.test(b))) out.pass.push(st.words.trim());
      await page.locator(".guide-panel .gp-buttons button").first().click();
    } else if (st.act.some((b) => /^Roll/.test(b))) {
      await page.locator(".act button").first().click();
      out.rolls++;
      if (await page.locator(".note").count()) out.bad.add("notifications left after a person's roll");
    } else if (st.act.length) await page.locator(".act button").first().click();
    else await page.waitForTimeout(40);
  }
  return out;
}

const twice = (list) => list.filter((t, i) => list.indexOf(t) !== i);

export async function checkTips(browser, url, report, G) {
  // 1. One person and three robots: two games, then "How to play"
  {
    const { ctx, page, errors } = await newPage(browser);
    await page.goto(url + "/?fast");
    await page.waitForSelector(".setup .go");
    await page.click(".setup .go");
    const one = await play(page, 500, (o) => o.tips.length >= 4);
    const names = one.tips.map((t) => t.tip), turns = one.tips.map((t) => t.turn);
    const buttons = one.tips.every((t) => t.button === "I understand");
    report.add(G, `Mr. Lin's tips in a game: ${names.join(", ") || "none"}; each with "I understand", one per turn, never twice; never in a robot's turn`,
      names.length >= 2 && buttons && !twice(names).length && !twice(turns).length && !one.bad.size && !errors.length,
      [names.length < 2 && `${names.length} tips`, !buttons && "a tip without \"I understand\"", twice(names).length && "a tip twice", twice(turns).length && "two tips in one turn", ...one.bad, ...errors].filter(Boolean).join(", "));
    report.add(G, `game time: ${one.rolls} rolls by the person, never a popup open, no notification left after the tap, no roll button in a popup`, one.rolls > 0 && !one.bad.size, [...one.bad].join(", "));

    await page.reload();
    await page.waitForSelector(".setup .go");
    await page.click(".setup .go"); // a new game on the same device
    const two = await play(page, 300);
    const again = two.tips.map((t) => t.tip).filter((t) => names.includes(t));
    report.add(G, `a second game shows no tip seen before (new: ${two.tips.map((t) => t.tip).join(", ") || "none"})`, !again.length && !two.bad.size && !errors.length, [again.length && `shown again: ${again.join(", ")}`, ...two.bad, ...errors].filter(Boolean).join(", "));

    await page.reload();
    await page.waitForSelector(".setup .go");
    await page.click(".how-open"); await page.waitForSelector(".howto");
    await page.keyboard.press("Escape");
    await page.click(".setup .go");
    const three = await play(page, 400, (o) => o.tips.length >= 1);
    const back = three.tips.map((t) => t.tip), before = [...names, ...two.tips.map((t) => t.tip)];
    report.add(G, `after "How to play" a tip already seen shows again (${back.join(", ") || "none"})`, back.some((t) => before.includes(t)) && !three.bad.size && !errors.length, [!back.length && "no tip", ...three.bad, ...errors].filter(Boolean).join(", "));
    await ctx.close();
  }

  // 2. Two people: Mr. Lin's words when the die is passed
  {
    const { ctx, page, errors } = await newPage(browser);
    await page.goto(url + "/?fast");
    await page.waitForSelector(".setup .go");
    await page.click('[data-seat="1"]'); // Red: a person
    await page.click(".setup .go");
    const g = await play(page, 400, (o) => o.pass.length >= 3);
    const ok = g.pass.length > 0 && g.pass.every((w) => WHERE.test(w) && (w.match(/\. /g) ?? []).length === 1 && !/\{|\}/.test(w));
    report.add(G, `"Pass the die": Mr. Lin says where the player stands (${g.pass.length} times; e.g. "${(g.pass[0] ?? "").slice(0, 60)}…")`, ok && !g.bad.size && !errors.length,
      [!g.pass.length && "never passed", g.pass.length && !ok && `words: ${g.pass.find((w) => !WHERE.test(w)) ?? g.pass[0]}`, ...g.bad, ...errors].filter(Boolean).join(", "));
    await ctx.close();
  }

  // 3. Blocked storage: a game with no tips and no error
  {
    const { ctx, page, errors } = await newPage(browser);
    await ctx.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } }));
    await page.goto(url + "/?fast");
    await page.waitForSelector(".setup .go");
    await page.click(".setup .go");
    const g = await play(page, 200);
    report.add(G, `blocked storage: a game plays (${g.rolls} rolls) with no tip and no error`, g.rolls > 0 && !g.tips.length && !g.bad.size && !errors.length,
      [g.tips.length && `tips: ${g.tips.map((t) => t.tip).join(", ")}`, !g.rolls && "no roll", ...g.bad, ...errors].filter(Boolean).join(", "));
    await ctx.close();
  }
}

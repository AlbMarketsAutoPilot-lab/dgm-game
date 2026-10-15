// The game as it is published (its security policy and offline worker), plus the first visit, the keyboard and an
// accessibility scan. The test build is the published build with `?fast` allowed (S4: never in the real one).
import fs from "node:fs";
import { createRequire } from "node:module";
import { ROOT, newPage, productionBuild } from "./common.mjs";

const AXE = fs.readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

/** Clicks through a game for a while (people at every seat), returns the errors seen. */
async function someTurns(page, clicks) {
  for (let i = 0; i < clicks; i++) {
    const b = page.locator(".act button").first();
    if (await b.count()) await b.click(); else await page.waitForTimeout(40);
  }
}

/** `pub`: the test build's server; `pub.serve()` starts another one for the same build. */
export async function checkPublished(browser, pub, report) {
  const url = pub.url;
  report.add("published build", "the test build is a real production build (offline worker included)", pub.hasOfflineWorker);
  const G = "published build";

  // 1. First visit: the guide, once; then from "How to play"; Escape closes it
  {
    const { ctx, page, errors } = await newPage(browser, { guideSeen: false });
    await page.goto(url + "/");
    const shown = await page.locator(".howto").waitFor({ timeout: 8000 }).then(() => true, () => false);
    for (let i = 0; i < 3 && shown; i++) await page.click(".g-next");
    const last = shown && (await page.textContent(".g-next")) === "Let's play!";
    if (shown) await page.click(".g-next");
    const setupAfter = await page.locator(".setup .go").waitFor({ timeout: 5000 }).then(() => true, () => false);
    await page.reload();
    await page.waitForSelector(".setup .go");
    const notAgain = !(await page.locator(".howto").count());
    await page.click(".how-open"); await page.waitForSelector(".howto");
    await page.keyboard.press("Escape");
    const escClosed = !(await page.locator(".howto").count());
    report.add(G, "first visit: the guide shows once, 4 pages, then the start screen; How to play; Escape", shown && last && setupAfter && notAgain && escClosed && !errors.length,
      [!shown && "no guide", !last && "last page", !setupAfter && "no start screen", !notAgain && "shown again", !escClosed && "Escape", ...errors].filter(Boolean).join(", "));
    await ctx.close();
  }

  // 1b. Sound (U7): off at first; the two switches on the start screen; every file there and playable; sounds load
  // as the game is played; the speaker in the game; the choice kept after a reload
  {
    const { ctx, page, errors } = await newPage(browser);
    const loaded = new Set();
    page.on("response", (r) => { const m = /\/sounds\/([\w-]+)\.mp3$/.exec(r.url()); if (m && r.ok()) loaded.add(m[1]); });
    await page.goto(url + "/?fast");
    await page.waitForSelector(".setup .go");
    const offAtFirst = await page.evaluate(() => [...document.querySelectorAll("[data-snd]")].map((b) => b.getAttribute("aria-pressed")).join() === "false,false");
    const before = loaded.size;
    await page.click('[data-snd="fx"]'); await page.click('[data-snd="music"]');
    const on = await page.evaluate(() => [...document.querySelectorAll("[data-snd]")].every((b) => b.getAttribute("aria-pressed") === "true"));
    const files = ["dice", "step", "six", "good", "bad", "bump", "jump-up", "jump-down", "bog", "card", "lantern-out", "lantern-on", "postcard", "tap", "win", "out", "menu-intro", "menu-loop", "game"];
    const broken = await page.evaluate(async (names) => {
      const ac = new AudioContext(), bad = [];
      for (const n of names) {
        try { const b = await ac.decodeAudioData(await (await fetch(`./sounds/${n}.mp3`)).arrayBuffer()); if (!(b.duration > 0.05 && b.duration < 60)) bad.push(`${n} ${b.duration}s`); }
        catch (e) { bad.push(`${n}: ${e}`); }
      }
      return bad;
    }, files);
    const atStart = ["tap", "menu-intro", "menu-loop"].filter((n) => !loaded.has(n)); // a button's click and the start screen's music
    loaded.clear();
    await page.click('[data-players="2"]');
    await page.click('[data-seat="1"]'); // both people: the test taps every turn
    await page.click(".setup .go");
    await page.locator(".pop button", { hasText: "Let's go" }).click();
    await someTurns(page, 40);
    const inGame = ["dice", "step", "game"].filter((n) => !loaded.has(n));
    await page.click(".snd-open");
    await page.locator(".pop button", { hasText: "Music: on" }).click();
    const switched = await page.locator(".pop button", { hasText: "Music: off" }).count() === 1;
    await page.locator(".pop button", { hasText: "Done" }).click();
    await page.reload();
    await page.waitForSelector(".setup .go");
    const kept = await page.evaluate(() => [...document.querySelectorAll("[data-snd]")].map((b) => b.getAttribute("aria-pressed")).join() === "true,false");
    const ok = offAtFirst && before === 0 && on && !broken.length && !atStart.length && !inGame.length && switched && kept && !errors.length;
    report.add(G, `sound: off at first, nothing loaded before; ${files.length} files play; the sounds load as they play; the speaker; kept after a reload`, ok,
      [!offAtFirst && "not off at first", before && "loaded before the switch", !on && "switches", ...broken, atStart.length && `not loaded on the start screen: ${atStart.join(", ")}`, inGame.length && `not loaded in the game: ${inGame.join(", ")}`, !switched && "speaker popup", !kept && "not kept", ...errors].filter(Boolean).join(", "));
    await ctx.close();
  }

  // 2. Security policy and offline: a game with a reload, then the site gone; another app's cache on the same address
  // survives. Offline is tested by really stopping this check's own server (the browser tool's "offline" switch can
  // bypass the game's offline worker, which is not what a player's phone does).
  {
    const own = await pub.serve(), url = own.url;
    const { ctx, page, errors } = await newPage(browser);
    await page.goto(url + "/manifest.webmanifest");
    await page.evaluate(async () => (await caches.open("another-app")).put("/x", new Response("x")));
    await page.goto(url + "/?fast");
    await page.waitForSelector(".setup .go");
    await page.click('[data-players="3"]');
    for (const i of [1, 2]) await page.click(`[data-seat="${i}"]`);
    await page.click(".setup .go");
    await page.locator(".pop button", { hasText: "Let's go" }).click();
    await someTurns(page, 60);
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.reload();
    await page.click(".setup .continue");
    await page.locator(".pop button", { hasText: "Let's go on!" }).click();
    await someTurns(page, 40);
    const caches = await page.evaluate(() => caches.keys());
    report.add(G, "security policy: no violation in a game with a reload and Continue", !errors.length, errors.slice(0, 3).join(" | "));
    report.add(G, "another app's cache on the same address is left alone", caches.includes("another-app"), caches.join(", "));
    // offline only once the worker has the page and its script stored (it stores them in the background)
    const stored = await page.waitForFunction(async () => {
      const c = await caches.open("dgm-v2"), keys = (await c.keys()).map((r) => new URL(r.url).pathname);
      const script = document.querySelector("script[type=module]")?.getAttribute("src")?.replace(/^\./, "");
      return !!navigator.serviceWorker.controller && keys.includes("/") && !!script && keys.includes(script);
    }, null, { timeout: 30000, polling: 500 }).then(() => true, () => false);
    let offline = false, starts = false, why = stored ? "" : "the offline worker did not store the game within 30 s";
    if (stored) {
      await own.close(); // the site is gone
      errors.length = 0; // from now on, failed downloads are expected (the worker answers instead)
      try {
        await page.goto(url + "/"); // opening the game again, offline, as a player would
        offline = await page.locator(".setup .go").waitFor({ timeout: 8000 }).then(() => true, () => false);
        if (offline) { await page.click(".setup .go"); starts = await page.locator(".pop button", { hasText: "Let's go" }).waitFor({ timeout: 8000 }).then(() => true, () => false); }
      } catch (e) {
        const state = await page.evaluate(async () => ({ controlled: !!navigator.serviceWorker.controller, keys: (await (await caches.open("dgm-v2")).keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search) })).catch((x) => String(x));
        why = `${String(e).split("\n")[0]}; worker: ${JSON.stringify(state)}`;
      }
    }
    report.add(G, "offline (the site gone): the game opens and a new game starts", offline && starts, why);
    await ctx.close();
    await own.close().catch(() => {});
  }

  // 3. Tampered or blocked storage: no crash, nothing runs, no Continue for a broken save
  for (const [name, setup] of [
    ["broken values", () => { localStorage.setItem("dgm.postcards.v1", "{not json"); localStorage.setItem("dgm.game.v1", '{"v":1,"board":"__proto__"}'); }],
    ["markup in the data", () => { localStorage.setItem("dgm.postcards.v1", JSON.stringify(['<img src=x onerror="window.__x=1">'])); localStorage.setItem("dgm.game.v1", JSON.stringify({ v: 1, board: "short", answers: ["<b>"] })); }],
  ]) {
    const { ctx, page, errors } = await newPage(browser);
    await page.goto(url + "/"); await page.evaluate(setup); await page.reload();
    await page.waitForSelector(".setup .go");
    await page.click(".album-open"); await page.waitForSelector(".album");
    const ran = await page.evaluate(() => !!window.__x), cont = await page.locator(".continue").count();
    report.add(G, `tampered storage (${name}): no error, nothing runs, no Continue`, !errors.length && !ran && !cont, [...errors, ran && "script ran", cont && "Continue shown"].filter(Boolean).join(", "));
    await ctx.close();
  }

  // 4. The keyboard (U5): Tab reaches the board; arrows walk it; Enter tells what a square does; Escape closes
  {
    const { ctx, page, errors } = await newPage(browser);
    // computer players at normal speed: nothing interrupts the check (a person's new turn would close the popup)
    await page.goto(url + "/"); await page.waitForSelector(".setup .go");
    await page.click('[data-seat="0"]');
    await page.click(".setup .go");
    await page.waitForSelector(".overview-board .pick");
    let onBoard = false;
    for (let i = 0; i < 30 && !onBoard; i++) { await page.keyboard.press("Tab"); onBoard = await page.evaluate(() => !!document.activeElement?.closest?.(".overview-board")); }
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
    const at = await page.evaluate(() => document.activeElement?.getAttribute("data-pos"));
    await page.keyboard.press("Enter");
    const info = await page.locator(".pop.info .pop-kicker").textContent().catch(() => "");
    await page.keyboard.press("Escape");
    const closed = !(await page.locator(".pop.info:not([hidden])").count());
    report.add(G, "keyboard: Tab to the board, arrows, Enter, Escape", onBoard && at === "3" && info === "Square 3" && closed && !errors.length,
      `board ${onBoard}, focus on ${at}, popup "${info}", closed ${closed}${errors.length ? ", " + errors[0] : ""}`);
    await ctx.close();
  }

  // 5. Accessibility scan (axe-core): no serious or critical problem on any screen
  {
    // the scanner is injected into the page: this test window lets it past the security policy (the game's own
    // scripts are unchanged; section 2 checks the policy itself)
    const { ctx, page } = await newPage(browser, { guideSeen: false, bypassCSP: true });
    const scan = async (where) => {
      await page.addScriptTag({ content: AXE });
      const v = await page.evaluate(async () => (await window.axe.run(document)).violations.filter((x) => x.impact === "serious" || x.impact === "critical").map((x) => `${x.id} (${x.nodes.length})`));
      report.add(G, `accessibility: ${where}`, !v.length, v.join(", "));
    };
    await page.goto(url + "/"); await page.waitForSelector(".howto"); await scan("the guide");
    await page.keyboard.press("Escape"); await page.waitForSelector(".setup .go"); await scan("the start screen");
    await page.click(".album-open"); await scan("the postcard album"); await page.keyboard.press("Escape");
    await page.click(".setup .go"); await page.locator(".pop button", { hasText: "Let's go" }).waitFor(); await scan("the game screen with a popup");
    await ctx.close();
  }

  // 6. S4: the real published build cannot be fast-forwarded (the `?fast` code is not even in it)
  {
    const outDir = `${ROOT}node_modules/.browsertest-prod`;
    await productionBuild(outDir);
    const js = fs.readdirSync(`${outDir}/assets`).filter((f) => f.endsWith(".js")).map((f) => fs.readFileSync(`${outDir}/assets/${f}`, "utf8")).join("");
    fs.rmSync(outDir, { recursive: true, force: true });
    // the minifier may write the word with any quote: "fast", 'fast' or `fast`
    report.add(G, "the published build has no fast-forward", !/["'`]fast["'`]/.test(js));
  }
}

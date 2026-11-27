// npm run guide:shots — the 8 pictures of the game screen in "How to play" (owner, 16 Oct; Step I phase F2, 27 Nov 2026:
// a picture on every page, each approved by the owner), taken from the game itself at phone size (390 × 844, sharp at
// 3×: audit of 27 Nov 2026, sharp on high-density phones too), so they always show the game as it looks now. Writes src/assets/guide/*.png; run it again after a change to the
// players' bar, the board, the zoomed square, the die, the notifications or the square boxes. CHROMIUM_PATH=… uses
// another Chromium.
import fs from "node:fs";
import path from "node:path";
import { ROOT, devServer, launch, newPage } from "./common.mjs";

const OUT = path.join(ROOT, "src/assets/guide");

const browser = await launch();
const dev = await devServer();

/** A game in the middle: Blue (a person) to play, three robots; private parts reached on purpose, as in the browser tests. */
async function scene(state) {
  const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await page.goto(dev.url + "/gallery.html");
  await page.evaluate(async (st) => {
    document.body.innerHTML = "";
    await import("/node_modules/@fontsource/patrick-hand/index.css");
    await import("/src/ui/app.css");
    await document.fonts.load('20px "Patrick Hand"');
    const { GameScreen } = await import("/src/ui/app.ts");
    const root = document.body.appendChild(Object.assign(document.createElement("main"), { id: "app" }));
    const s = new GameScreen(root, { players: 4, computer: [false, true, true, true] }, () => {});
    s.gone = true;
    await new Promise((r) => setTimeout(r, 50));
    s.pops.clear(); s.guide.close();
    if (st.pos) {
      s.game.players.forEach((p, i) => Object.assign(p, { pos: st.pos[i], home: false, cards: st.cards[i] }));
      s.game.players.forEach((p, i) => { s.places[i] = p.pos; s.cards[i] = p.cards; s.overview.setPlace(i, p.pos); });
    }
    if (st.show !== undefined) s.stage.show(0, st.show);
    s.overview.setCurrent(0);
    s.seat = 0; s.drawn = { bar: "", who: "", hand: "" }; s.render();
    window.__screen = s;
  }, state);
  return { ctx, page };
}

const box = (page, sel, edge) => page.evaluate(([s, e]) => document.querySelector(s).getBoundingClientRect()[e], [sel, edge]);
const clip = async (page, top, bottom) => ({ x: 0, y: top, width: 390, height: bottom - top });

/** The board around its notification over the destination's square (owner, 27 Nov 2026), above a part of the game
 * screen; `between` runs after the lower part is taken (e.g. waiting for the next notification). */
async function stacked(page, below, between) {
  const bottom = await page.screenshot({ clip: below });
  if (between) await between();
  // the band of the board around the destination's square, where the notification is
  const top = await page.screenshot({ clip: await clip(page, (await box(page, ".notes", "top")) - 14, (await box(page, ".notes", "bottom")) + 14) });
  return page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const c = Object.assign(document.createElement("canvas"), { width: ia.width, height: ia.height + ib.height });
    const g = c.getContext("2d");
    g.drawImage(ia, 0, 0);
    g.drawImage(ib, 0, ia.height);
    return c.toDataURL("image/png").split(",")[1];
  }, ["data:image/png;base64," + top.toString("base64"), "data:image/png;base64," + bottom.toString("base64")]);
}

const save = (name, data) => fs.writeFileSync(path.join(OUT, name), typeof data === "string" ? Buffer.from(data, "base64") : data);
const MID = { pos: [12, 30, 7, 21], cards: [1, 2, 0, 1] };

try {
  // 1. Welcome: the game at the start, the players and the whole board
  {
    const { ctx, page } = await scene({});
    await page.waitForTimeout(800);
    save("welcome.png", await page.screenshot({ clip: await clip(page, 0, await box(page, ".overview", "bottom")) }));
    await ctx.close();
  }
  // 2. Home: Blue's turn at Home, the card in hand, the zoomed Home square
  {
    const { ctx, page } = await scene({ show: 0 });
    await page.waitForTimeout(800);
    save("home.png", await page.screenshot({ clip: await clip(page, await box(page, ".hud", "top"), await box(page, ".stage", "bottom")) }));
    await ctx.close();
  }
  // 3. Sixes: a 6 on the die, "A six!" and "Roll again"
  {
    const { ctx, page } = await scene({ ...MID, show: 12 });
    await page.evaluate(async () => {
      const s = window.__screen;
      await s.dice.roll(6);
      s.stage.stamp("good", "A six!");
      void s.setAct([{ label: "Roll again", value: "roll", primary: true }]);
    });
    await page.waitForTimeout(500);
    save("sixes.png", await page.screenshot({ clip: await clip(page, await box(page, ".stage", "top"), await box(page, ".controls", "bottom")) }));
    await ctx.close();
  }
  // 4. Squares: the Swap Market's box, opened by a tap, over the board
  {
    const { ctx, page } = await scene({ ...MID, show: 12 });
    await page.evaluate(() => { window.__screen.squareInfo(79); document.activeElement?.blur(); });
    await page.waitForTimeout(500);
    save("squares.png", await page.screenshot({ clip: await clip(page, await box(page, ".overview", "top"), await box(page, ".overview", "bottom")) }));
    await ctx.close();
  }
  // 5. Bonus card: the players with their card counts; Blue's small card circled and shown large below (owner)
  {
    const { ctx, page } = await scene({ ...MID, show: 12 });
    const r = await page.evaluate(async () => {
      const { cardFace } = await import("/src/render/art-modern.ts");
      const bar = document.querySelector(".players").cloneNode(true);
      bar.querySelector(".leave")?.remove();
      bar.style.cssText = "display:flex;justify-content:center;padding:.375rem .5rem";
      const comp = Object.assign(document.createElement("div"), { id: "comp" });
      comp.style.cssText = "position:fixed;left:0;top:0;width:330px;background:var(--paper);z-index:99;overflow:hidden";
      const below = document.createElement("div");
      below.style.height = "205px";
      comp.append(bar, below);
      document.body.append(comp);
      const b = bar.querySelector('.avatar[data-seat="0"] .badge').getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2, rad = Math.max(b.width, b.height) / 2 + 7;
      const cw = 112, ch = 157, left = 330 / 2 + 40 - cw / 2, top = bar.getBoundingClientRect().bottom + 30;
      const ov = document.createElement("div");
      ov.style.cssText = "position:absolute;left:0;top:0";
      ov.innerHTML = `<svg width="330" height="${top + ch + 20}" style="position:absolute;left:0;top:0;overflow:visible">`
        + `<path d="M${cx - rad * 0.7} ${cy + rad * 0.7} L${left + 6} ${top + 6} M${cx + rad * 0.7} ${cy + rad * 0.7} L${left + cw - 6} ${top + 6}" stroke="#f2c230" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7"/>`
        + `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="#4b2377" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="#f2c230" stroke-width="3.5"/></svg>`;
      const big = document.createElement("div");
      big.innerHTML = cardFace("bonus", "");
      big.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${cw}px;height:${ch}px;filter:drop-shadow(0 4px 0 rgba(43,18,72,.35))`;
      big.firstElementChild.style.cssText = "width:100%;height:100%;display:block";
      comp.append(ov, big);
      return comp.getBoundingClientRect().height;
    });
    await page.waitForTimeout(300);
    save("card.png", await page.screenshot({ clip: { x: 0, y: 0, width: 330, height: r } }));
    await ctx.close();
  }
  // 6. Areas: "Now entering · Mountains" over the first plain square of the Mountains
  {
    const { ctx, page } = await scene({ pos: [39, 30, 7, 21], cards: MID.cards, show: 39 });
    await page.evaluate(() => window.__screen.stage.sign("Mountains"));
    await page.waitForTimeout(500);
    save("areas.png", await page.screenshot({ clip: await clip(page, await box(page, ".stage", "top"), await box(page, ".stage", "bottom")) }));
    await ctx.close();
  }
  // 7. Bump: the board with "Red is Home: no 6 needed to leave." over the festival, above the zoomed square with "Bump!"
  {
    const { ctx, page } = await scene({ pos: [24, 30, 7, 21], cards: MID.cards, show: 24 });
    await page.evaluate(() => {
      const s = window.__screen;
      s.stage.stamp("bad", "Bump!");
      s.places[1] = 0; s.game.players[1].pos = 0; s.overview.setPlace(1, 0);
      s.note("bump", 0, "bad", 1);
      s.notes.push(1, s.fill(s.board.moments.backHome.note, 1), "");
      s.render();
    });
    await page.waitForTimeout(500);
    // the stage with "Bump!" first; then the board once the second notification ("…: no 6 needed to leave.") shows
    save("bump.png", await stacked(page, await clip(page, await box(page, ".stage", "top"), await box(page, ".stage", "bottom")), () => page.waitForTimeout(2200)));
    await ctx.close();
  }
  // 8. The exact number: the board with "Blue needs exactly 3 to finish." over the festival, above the square and the die on 5
  {
    const { ctx, page } = await scene({ pos: [98, 30, 7, 21], cards: MID.cards, show: 98 });
    await page.evaluate(async () => {
      const s = window.__screen;
      await s.dice.roll(5);
      s.notes.push(0, s.fill("{p} needs exactly {n} to finish.", 0, undefined, 3), "bad");
      s.render();
    });
    await page.waitForTimeout(700);
    save("finish.png", await stacked(page, await clip(page, await box(page, ".stage", "top"), await box(page, ".controls", "bottom"))));
    await ctx.close();
  }
  console.log(`✓ 8 pictures in ${path.relative(ROOT, OUT)}`);
} finally {
  await browser.close();
  await dev.close?.();
}
process.exit(0);

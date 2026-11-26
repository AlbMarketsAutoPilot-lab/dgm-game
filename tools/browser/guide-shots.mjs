// npm run guide:shots — the pictures of the game screen in "How to play" (owner, 16 Oct), taken from the game itself
// at phone size, so they always show the game as it looks now. Writes src/assets/guide/*.png; run it again after a
// change to the players' bar, the cards or the square popups. CHROMIUM_PATH=… uses another Chromium.
import path from "node:path";
import { ROOT, devServer, launch, newPage } from "./common.mjs";

const OUT = path.join(ROOT, "src/assets/guide");
const browser = await launch();
const dev = await devServer();
try {
  const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(dev.url + "/gallery.html");
  await page.evaluate(async () => {
    document.body.innerHTML = "";
    await import("/node_modules/@fontsource/patrick-hand/index.css");
    await import("/src/ui/app.css");
    await document.fonts.load('20px "Patrick Hand"');
    const { GameScreen } = await import("/src/ui/app.ts");
    const root = document.body.appendChild(Object.assign(document.createElement("main"), { id: "app" }));
    // A game in the middle (private parts reached on purpose: this is a tool, like the browser tests). Step I phase C8:
    // the Lantern Festival; the opening guide and its pictures are redone in phase F.
    const s = new GameScreen(root, { players: 4, computer: [false, true, true, true] }, () => {});
    s.gone = true;
    await new Promise((r) => setTimeout(r, 50));
    s.pops.clear();
    s.game.players.forEach((p, i) => Object.assign(p, { pos: [12, 30, 7, 21][i], home: false, cards: [1, 2, 0, 1][i] }));
    s.game.players.forEach((p, i) => { s.places[i] = p.pos; s.cards[i] = p.cards; });
    s.seat = 0;
    s.drawn = { bar: "", who: "", hand: "" };
    s.render();
    window.__screen = s;
  });
  await page.waitForTimeout(300);
  await page.locator(".players").screenshot({ path: path.join(OUT, "lanterns.png") });
  await page.locator(".hud .hand").screenshot({ path: path.join(OUT, "cards.png") });
  // the fallen tree, tapped on the board
  await page.evaluate(() => { const s = window.__screen; s.squareInfo(27); document.activeElement?.blur(); });
  await page.waitForTimeout(300);
  await page.locator(".pop:not([hidden])").last().screenshot({ path: path.join(OUT, "square.png") });
  await ctx.close();
  console.log(`✓ 3 pictures in ${path.relative(ROOT, OUT)}`);
} finally {
  await browser.close();
  await dev.close?.();
}
process.exit(0);

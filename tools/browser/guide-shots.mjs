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
    const { BOARDS } = await import("/src/engine/index.ts");
    const root = document.body.appendChild(Object.assign(document.createElement("main"), { id: "app" }));
    // A game in the middle: Blue has a Bonus card, the players have 3, 2, 3 and 1 lanterns (private parts reached on
    // purpose: this is a tool, like the browser tests)
    const s = new GameScreen(root, { board: BOARDS.long, players: 4, computer: [false, true, true, true] }, () => {});
    s.gone = true;
    await new Promise((r) => setTimeout(r, 50));
    s.pops.clear();
    s.game.players.forEach((p, i) => Object.assign(p, { pos: [12, 30, 7, 21][i], lanterns: [3, 2, 3, 1][i] }));
    Object.assign(s.game.players[0], { bonus: 1 });
    s.seat = 0;
    s.drawn = { bar: "", who: "", hand: "" };
    s.render();
    window.__screen = s;
  });
  await page.waitForTimeout(300);
  await page.locator(".players").screenshot({ path: path.join(OUT, "lanterns.png") });
  await page.locator(".hud .hand").screenshot({ path: path.join(OUT, "cards.png") });
  // the Bog, tapped on the board
  await page.evaluate(() => { const s = window.__screen; s.squareInfo(s.board.story.trap.tile); document.activeElement?.blur(); });
  await page.waitForTimeout(300);
  await page.locator(".pop:not([hidden])").last().screenshot({ path: path.join(OUT, "square.png") });
  await ctx.close();
  console.log(`✓ 3 pictures in ${path.relative(ROOT, OUT)}`);
} finally {
  await browser.close();
  await dev.close?.();
}
process.exit(0);

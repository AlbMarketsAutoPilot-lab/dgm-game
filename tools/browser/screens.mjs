// Every screen and popup at every screen size, from a folded phone to a 2560 × 1440 PC screen (owner, 15 Oct: "buttons
// cut, you need to scroll"). Checked: buttons off screen or cut, popups or the page needing to scroll, buttons
// overlapping, words squeezed, anything spilling out of the turn panel, and buttons under 40 px.
import { newPage } from "./common.mjs";

export const SIZES = [
  [280, 653, "fold"], [320, 568, "se1"], [360, 640, "android-s"], [375, 667, "iphone8"], [390, 844, "iphone14"], [412, 915, "pixel"], [430, 932, "promax"],
  [568, 320, "se1-land"], [653, 280, "fold-land"], [640, 360, "android-land"], [740, 360, "galaxy-land"], [667, 375, "iphone8-land"], [844, 390, "iphone14-land"], [915, 412, "pixel-land"],
  [768, 1024, "ipad"], [1024, 768, "ipad-land"], [820, 1180, "ipad-air"], [1280, 720, "pc-720"], [1366, 768, "laptop"], [1440, 900, "mac"],
  [1920, 1080, "pc-1080"], [2560, 1440, "pc-1440"],
];

// In the page: every problem on the screen as it is now.
const CHECK = () => {
  const bad = [], vw = innerWidth, vh = innerHeight;
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
  const cover = document.querySelector(".album, .howto"); // a full-screen page over everything: only its own buttons count
  for (const b of document.querySelectorAll("button")) {
    if (!visible(b) || b.closest("[hidden]") || (cover && !cover.contains(b))) continue;
    const r = b.getBoundingClientRect(), name = (b.getAttribute("aria-label") || b.textContent || "").trim().slice(0, 30);
    if (r.top < -1 || r.left < -1 || r.bottom > vh + 1 || r.right > vw + 1) { bad.push(`off screen: "${name}"`); continue; }
    for (let a = b.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
        const q = a.getBoundingClientRect();
        if (r.top < q.top - 1 || r.bottom > q.bottom + 1 || r.left < q.left - 1 || r.right > q.right + 1) { bad.push(`cut: "${name}" by .${[...a.classList].join(".")}`); break; }
      }
    }
  }
  // buttons overlapping each other in the same area, and button text squeezed (cut with … or spilling out)
  const shown = [...document.querySelectorAll("button")].filter((b) => visible(b) && !b.closest("[hidden]") && (!cover || cover.contains(b)));
  const area = (b) => b.closest(".players, .setup, .controls, .pop-buttons, .hud, .album-top, .pop");
  for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < shown.length; j++) {
    const a = shown[i], c = shown[j];
    if (a.contains(c) || c.contains(a) || area(a) !== area(c) || !area(a)) continue;
    const r = a.getBoundingClientRect(), q = c.getBoundingClientRect();
    const ix = Math.min(r.right, q.right) - Math.max(r.left, q.left), iy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
    if (ix > 3 && iy > 3) bad.push(`overlap: "${(a.getAttribute("aria-label") || a.textContent).trim().slice(0, 20)}" / "${(c.getAttribute("aria-label") || c.textContent).trim().slice(0, 20)}"`);
  }
  for (const b of shown) for (const t of [b, ...b.querySelectorAll("span, b, small")]) {
    if (t.closest(".badge, .need, .gc-n, .cpu")) continue;
    if (t.scrollWidth > t.clientWidth + 1 && getComputedStyle(t).overflow !== "visible") { bad.push(`squeezed text: "${t.textContent.trim().slice(0, 24)}"`); break; }
  }
  // text or pictures spilling out of the turn panel or the players' bar (not counting popups, which float over them)
  for (const panel of document.querySelectorAll(".stage-panel, .players")) {
    const q = panel.getBoundingClientRect();
    for (const el of panel.querySelectorAll(".hud *, .controls *, .avs, .leave")) {
      if (el.closest(".pop-layer, .fx, .badge, .need, .cpu, .gc-n")) continue;
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.top < q.top - 2 || r.bottom > q.bottom + 2 || r.left < q.left - 2 || r.right > q.right + 2)) { bad.push(`spills out of .${panel.className.split(" ")[0]}: ${el.tagName.toLowerCase()}.${[...el.classList].join(".")} "${(el.textContent || "").trim().slice(0, 20)}"`); break; }
    }
  }
  // the note under the picture (owner, 16 Oct) stays in its lane, and never touches the square or the token
  for (const n of document.querySelectorAll(".note:not([hidden])")) {
    const r = n.getBoundingClientRect(), q = n.parentElement.getBoundingClientRect();
    const p = n.querySelector("p"); if (p && p.scrollHeight > p.clientHeight + 1) bad.push(`note cut: "${p.textContent.slice(0, 30)}…"`);
    if (r.top < q.top - 1 || r.bottom > q.bottom + 1 || r.left < q.left - 1 || r.right > q.right + 1) bad.push(`note spills out of its lane (${Math.round(r.width)}×${Math.round(r.height)} in ${Math.round(q.width)}×${Math.round(q.height)})`);
    for (const el of document.querySelectorAll(".strip .card, .stage-token")) {
      const c = el.getBoundingClientRect();
      if (c.width && c.bottom > q.top + 1 && c.left < q.right && c.right > q.left && c.top < q.bottom) bad.push(`the note's lane touches the ${el.classList.contains("stage-token") ? "token" : "square"}`);
    }
  }
  // no popup covers the action buttons (owner, 16 Oct: "Spoil it!" was under its own popup), unless a popup with its
  // own buttons deliberately takes the whole screen
  if (!cover && !document.querySelector(".pop-full .pop:not([hidden])")) for (const b of document.querySelectorAll(".act button")) {
    const r = b.getBoundingClientRect(); if (!r.width) continue;
    for (const [x, y] of [[r.left + r.width / 2, r.top + 3], [r.left + r.width / 2, r.top + r.height / 2], [r.left + r.width / 2, r.bottom - 3]]) {
      const hit = document.elementFromPoint(x, y);
      if (hit && !b.contains(hit)) { bad.push(`covered: "${b.textContent.trim().slice(0, 20)}" under .${[...(hit.closest(".pop, .pop-layer") ?? hit).classList].join(".")}`); break; }
    }
  }
  // the guide's pictures of the game are loaded and shown
  for (const img of document.querySelectorAll(".howto img")) if (!img.complete || !img.naturalWidth || img.getBoundingClientRect().height < 20) bad.push(`guide picture not shown: ${img.alt.slice(0, 30)}`);
  for (const p of document.querySelectorAll(".pop:not([hidden])")) if (p.scrollHeight > p.clientHeight + 2) bad.push(`popup scrolls: "${p.querySelector(".pop-title")?.textContent}" (${p.scrollHeight} > ${p.clientHeight})`);
  const se = document.scrollingElement; if (!cover && se.scrollHeight > vh + 1 || se.scrollWidth > vw + 1) bad.push(`page scrolls ${se.scrollWidth}x${se.scrollHeight}`);
  const smallest = Math.min(...[...document.querySelectorAll("button")].filter((b) => visible(b) && !b.closest("[hidden]")).map((b) => { const r = b.getBoundingClientRect(); return Math.min(r.width, r.height); }));
  return { bad, smallest: Math.round(smallest) };
};
// Opens a game screen, stops its own play loop, and shows one kind of popup in it (private parts of the game screen
// are reached on purpose: this is a test).
const SETUP_GAME = async (kind) => {
  const { GameScreen } = await import("/src/ui/app.ts");
  const { BOARDS } = await import("/src/engine/index.ts");
  const { SQUARE_TALES } = await import("/src/ui/tales.ts");
  const root = document.querySelector("#app") ?? document.body.appendChild(Object.assign(document.createElement("main"), { id: "app" }));
  // the gallery page's own style fixes the squares at 180 px: not part of the game (the stage sizes them itself)
  for (const st of document.head.querySelectorAll("style")) st.textContent = st.textContent.replace(/\.card \{ --card: 180px;[^}]*\}/, "");
  const s = new GameScreen(root, { board: BOARDS.long, players: 4, computer: [false, false, false, false], level: "normal" }, () => {});
  s.gone = true; // the play loop stops at its next pause; the screen stays
  await new Promise((r) => setTimeout(r, 50));
  s.pops.clear();
  const p = s.game.players[0];
  Object.assign(p, { pos: 120, bonus: 2, jailPass: 1, snakeLeader: true, skip: 2, double: true, lanterns: 0 });
  s.places[0] = { pos: 120, stair: 0 };
  s.render();
  const B = BOARDS.long, longest = Object.entries(B.tiles).sort(([, a], [, b]) => (SQUARE_TALES[b.icon]?.text.length ?? 0) - (SQUARE_TALES[a.icon]?.text.length ?? 0))[0];
  const tile = longest[1], sq = Number(longest[0]);
  const act = (n) => s.setAct([{ label: "Use the card: dodge it!", value: "a", primary: true }, { label: "Keep the card", value: "b" }, { label: "Don't ask me again this game", value: "c" }].slice(0, n));
  switch (kind) {
    case "turn": Object.assign(p, { pos: -1, skip: 0, double: false }); s.places[0] = { pos: -1, stair: 0 }; s.render(); s.setAct([{ label: "Pass the die to Yellow ▶", value: "roll" }]); s.dice.ready(true); break;
    case "intro": s.pops.show({ kind: "info", art: "", kicker: "Red starts", title: "You need a 6 to enter", text: "Everyone starts at Home, off the board. <b>Roll a 6 to step onto the board.</b> No 6 in three throws: you set off anyway, but a lantern goes out. In a hurry? Spend a lantern to set off at once. Careful: <b>lanterns are your lives</b>. With none left, the next one you lose puts you out of the game.", buttons: [{ label: "Let's go!", value: "ok", primary: true }] }); break;
    case "story": s.story(0, { ...SQUARE_TALES[tile.icon] }, "Back to square 2. Then miss 3 turns.", "bad"); s.setAct([{ label: "Pass the die to Red ▶", value: "ok" }]); break;
    case "defend": s.choose({ kind: "punishment", player: 0, square: sq, tile, card: true, shield: false, lanterns: 3 }); break;
    case "spoil": s.choose({ kind: "bonusAttack", player: 1, target: 0, square: sq, tile: { ...tile, cat: "R" } }); break;
    case "player": s.playerInfo(0); break;
    case "card": s.cardInfo("bonus"); break;
    case "square": s.squareInfo(sq); break;
    case "leave": s.gone = false; void s.leave(); break;
    case "win": s.pops.show({ kind: "win", tone: "good", art: "", kicker: "The end of the journey", title: "Yellow made it!", text: "Thousands of lanterns rise over the square as Yellow walks into the Festival of Lights. Music, food stalls, and a very well-earned sit-down.", more: `<p class="pop-sub">New postcards: <b>Home Town, Countryside, Forest, River &amp; Lake, The Bog, Three Sixes</b></p>`, buttons: [{ label: "Play again: same players", value: "again", primary: true }, { label: "New game: change players or board", value: "new" }, { label: "Postcard album", value: "album" }] }); break;
    case "sound": void s.soundSwitches(); break;
    case "home": Object.assign(p, { pos: -1, skip: 0, double: false, lanterns: 3 }); s.places[0] = { pos: -1, stair: 0 }; s.render(); s.setAct([{ label: "Roll for a 6", value: "roll", primary: true }, { label: "Spend a lantern (3 left)", value: "spend" }]); s.dice.ready(true); break;
    // a computer player's note under the picture (owner, 16 Oct), the longest one the boards can make
    case "note": s.note(1, "▼ Forgot Your Keys AGAIN!!!: back to square 92, then misses 2 turns", "bad"); break;
    // a person's turn with what is ahead (owner, 16 Oct): the longest notice the board makes
    case "ahead": Object.assign(p, { pos: 17, skip: 0, double: true, snakeLeader: false, slow: false }); s.places[0] = 17; s.stage.show(0, 17); s.render();
      s.note(0, "▼ Roll a 5 (doubled): back to square 92, then misses 2 turns", "bad"); s.setAct([{ label: "Roll the die", value: "roll" }]); s.dice.ready(true); break;
    case "boots": void s.choose({ kind: "bogBoots", player: 0, square: 30 }); break;
    case "welcome": s.pops.show({ kind: "info", art: "", kicker: "Saved game", title: "Welcome back!", text: "The journey goes on where you left it: round 23, <b>Yellow</b> plays next.", buttons: [{ label: "Let's go on!", value: "ok", primary: true }] }); break;
  }
  if (kind === "defend") act(2); if (kind === "spoil") act(3);
};
const GUIDE_PAGES = 8;
export const SCREENS = ["setup", "album", ...Array.from({ length: GUIDE_PAGES }, (_, i) => `guide-${i + 1}`), "turn", "note", "ahead", "intro", "story", "defend", "spoil", "player", "card", "square", "leave", "win", "welcome", "sound", "home", "boots"];

/** Checks every screen at every size; returns the problems found. */
export async function checkScreens(browser, url, sizes = SIZES) {
  const problems = [];
  let combos = 0;
  for (const [w, h, name] of sizes) {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: w, height: h } });
    for (const scr of SCREENS) {
      if (scr === "setup" || scr === "album" || scr.startsWith("guide")) {
        await page.goto(url + "/");
        await page.evaluate(() => localStorage.setItem("dgm.game.v1", "{}")); // the Continue button's room is kept
        await page.waitForSelector(".go");
        await page.click('[data-players="4"]');
        if (scr === "album") { await page.click(".album-open"); await page.waitForSelector(".album"); }
        if (scr.startsWith("guide")) { await page.click(".how-open"); await page.waitForSelector(".howto"); for (let i = 1; i < Number(scr.slice(6)); i++) await page.click(".g-next"); }
      } else {
        await page.goto(url + "/gallery.html");
        await page.evaluate(async () => { document.body.innerHTML = ""; await import("/node_modules/@fontsource/patrick-hand/index.css"); await import("/src/ui/app.css"); await document.fonts.load('20px "Patrick Hand"'); });
        await page.evaluate(SETUP_GAME, scr);
      }
      await page.waitForTimeout(250);
      await page.evaluate(() => Promise.all([...document.querySelectorAll(".howto img")].map((m) => m.decode().catch(() => {}))));
      const r = await page.evaluate(CHECK);
      if (r.smallest < 40) r.bad.push(`a button only ${r.smallest}px`);
      combos++;
      for (const b of r.bad) problems.push(`${name} ${w}×${h} ${scr}: ${b}`);
    }
    for (const e of errors) problems.push(`${name}: error ${e}`);
    await ctx.close();
  }
  return { problems, combos };
}

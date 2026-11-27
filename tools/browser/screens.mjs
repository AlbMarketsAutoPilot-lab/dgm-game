// Every screen and popup at every screen size, from a folded phone to a 2560 × 1440 PC screen (owner, 15 Oct: "buttons
// cut, you need to scroll"). Checked: buttons off screen or cut, popups or the page needing to scroll, buttons
// overlapping, words squeezed, anything spilling out of the turn panel, and buttons under 40 px.
// Step I phase C8: the Lantern Festival screens: Mr. Lin's panel (its questions, his longest words; it must never
// scroll), the notifications, and the rest.
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
  const area = (b) => b.closest(".players, .setup, .controls, .pop-buttons, .gp-buttons, .hud, .album-top, .pop");
  for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < shown.length; j++) {
    const a = shown[i], c = shown[j];
    if (a.contains(c) || c.contains(a) || area(a) !== area(c) || !area(a)) continue;
    const r = a.getBoundingClientRect(), q = c.getBoundingClientRect();
    const ix = Math.min(r.right, q.right) - Math.max(r.left, q.left), iy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
    if (ix > 3 && iy > 3) bad.push(`overlap: "${(a.getAttribute("aria-label") || a.textContent).trim().slice(0, 20)}" / "${(c.getAttribute("aria-label") || c.textContent).trim().slice(0, 20)}"`);
  }
  for (const b of shown) for (const t of [b, ...b.querySelectorAll("span, b, small")]) {
    if (t.closest(".badge, .need, .gc-n, .cpu, .sr")) continue; // .sr: text for screen readers only, hidden on purpose
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
  // Mr. Lin's panel (owner, 26 Nov 2026): everything fits, nothing scrolls; the notifications stay over the board
  for (const g of document.querySelectorAll(".gp-body")) if (g.scrollHeight > g.clientHeight + 2) bad.push(`Mr. Lin's panel scrolls (${g.scrollHeight} > ${g.clientHeight})`);
  for (const n of document.querySelectorAll(".notes .note")) {
    const r = n.getBoundingClientRect(), q = document.querySelector(".overview").getBoundingClientRect();
    if (r.right > q.right + 1 || r.bottom > q.bottom + 1 || r.left < q.left - 1) bad.push(`notification outside the board: "${n.textContent.trim().slice(0, 30)}"`);
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
// are reached on purpose: this is a test). The longest texts of the destination file are used.
const SETUP_GAME = async (kind) => {
  const { GameScreen } = await import("/src/ui/app.ts");
  const { TIPS } = await import("/src/ui/tips.ts"); // Mr. Lin's tips (Step I phase F)
  const root = document.querySelector("#app") ?? document.body.appendChild(Object.assign(document.createElement("main"), { id: "app" }));
  // the gallery page's own style fixes the squares at 180 px: not part of the game (the stage sizes them itself)
  for (const st of document.head.querySelectorAll("style")) st.textContent = st.textContent.replace(/\.card \{ --card: 180px;[^}]*\}/, "");
  const s = new GameScreen(root, { players: 4, computer: [false, false, false, false] }, () => {});
  s.wait = () => new Promise(() => {}); // the play loop stops at its next pause; the screen stays (not "gone": a game left shows no panel)
  await new Promise((r) => setTimeout(r, 50));
  s.pops.clear(); s.guide.close();
  const B = s.board, p = s.game.players[0];
  Object.assign(p, { pos: 40, home: false, cards: 2, skip: 2, dbl: true });
  s.places[0] = 40; s.cards[0] = 2;
  s.render();
  const long = (list, f) => list.sort((a, b) => f(b).length - f(a).length)[0];
  const tiles = Object.entries(B.tiles).map(([k, t]) => [Number(k), t]);
  const [sq, bad] = long(tiles.filter(([, t]) => t.cat === "P" && t.type !== "tree"), ([, t]) => t.guide ?? "");
  const area = long([...B.areas.filter((a) => a.effect)], (a) => a.announce ?? "");
  switch (kind) {
    case "turn": Object.assign(p, { skip: 0, dbl: false }); s.render(); s.setAct([{ label: "Roll die", value: "roll", primary: true }]); s.dice.ready(true); break;
    case "home": Object.assign(p, { pos: 0, home: true, skip: 0 }); s.places[0] = 0; s.homeTold[0] = false; s.render(); void s.decide({ kind: "waitCard", player: 0, where: "home", tries: 0 }); break;
    case "tree": Object.assign(p, { pos: 27, stuck: true, skip: 0 }); s.places[0] = 27; s.render(); void s.decide({ kind: "waitCard", player: 0, where: "tree", tries: 2 }); break;
    case "punish": void s.decide({ kind: "punishment", player: 0, square: sq, tile: bad, area: null }); break;
    case "area": void s.decide({ kind: "punishment", player: 0, square: 80, tile: null, area: long([...B.areas.filter((a) => a.effect?.type === "backward" || a.effect?.type === "swapBehind")], (a) => a.announce ?? "").effect.type }); break;
    case "market": s.places[0] = 79; void s.decide({ kind: "swapMarket", player: 0, give: true, candidates: [1, 2, 3] }); break;
    case "story": void s.guide.show({ title: area.name, text: area.announce, buttons: [{ label: "I understand", value: "ok", primary: true }] }); break;
    case "tip": void s.guide.show({ text: long(Object.values(TIPS), (t) => t), buttons: [{ label: "I understand", value: "ok", primary: true }] }); break;
    case "pass": s.places[1] = 61; s.places[2] = 19; void s.guide.show({ text: s.standing(0), buttons: [{ label: "Pass the die to Yellow ▶", value: "ok", primary: true }] }); break; // Mr. Lin's words at the passing (phase F)
    case "skip": void s.guide.show({ text: "Rest for now. The road will still be there tomorrow.", buttons: [{ label: "Skip this turn", value: "ok", primary: true }] }); break;
    case "welcome-lin": void s.guide.show({ text: B.areas[0].announce, buttons: [{ label: "Let's go", value: "ok", primary: true }] }); break;
    case "notes": for (const [seat, k] of [[1, "swapMarketTake"], [2, "jumpBackSkip2"], [3, "dragonBoat"]]) s.note(k, seat, "bad", 0, 20); break;
    case "player": s.playerInfo(0); break;
    case "card": s.cardInfo(); break;
    case "square": s.squareInfo(sq); break;
    case "leave": s.gone = false; void s.leave(); break;
    case "win": { // phase E: the longest Records line (R12) and the 3 buttons
      const { RT, rankingLine } = await import("/src/ui/records-page.ts");
      s.pops.show({ kind: "win", tone: "good", art: "", kicker: B.destination.name, title: "Yellow made it!", text: B.moments.finish.guide.replace("{p}", "Yellow"), more: `<p class="pop-sub rec-line">${rankingLine({ kind: "blocked" }, 3723)}</p><p class="pop-sub">New postcards: <b>Home Town, Countryside, Forest, Mountains, Straight Off the Boat, Six Sixes</b></p>`, buttons: [{ label: "New game", value: "new", primary: true }, { label: "Postcard album", value: "album" }, { label: RT.button, value: "records" }] });
      break;
    }
    case "sound": void s.soundSwitches(); break;
    case "welcome": s.pops.show({ kind: "info", art: "", kicker: "Saved game", title: "Welcome back!", text: "The journey goes on where you left it: round 23, <b>Yellow</b> plays next.", buttons: [{ label: "Let's go on!", value: "ok", primary: true }] }); break;
  }
};
const GUIDE_PAGES = 8;
export const SCREENS = ["setup", "album", "records", "records-empty", ...Array.from({ length: GUIDE_PAGES }, (_, i) => `guide-${i + 1}`), "turn", "home", "tree", "punish", "area", "market", "story", "tip", "pass", "skip", "welcome-lin", "notes", "player", "card", "square", "leave", "win", "welcome", "sound"];

/** Checks every screen at every size; returns the problems found. */
export async function checkScreens(browser, url, sizes = SIZES) {
  const problems = [];
  let combos = 0;
  for (const [w, h, name] of sizes) {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: w, height: h } });
    for (const scr of SCREENS) {
      if (scr === "setup" || scr === "album" || scr.startsWith("records") || scr.startsWith("guide")) {
        await page.goto(url + "/");
        await page.evaluate(() => localStorage.setItem("dgm.game.v1", "{}")); // the Continue button's room is kept
        // phase E: 10 records with the longest cells (the slowest time, the longest colour name), or none
        await page.evaluate((full) => { if (full) localStorage.setItem("dgm.records.v1", JSON.stringify(Array.from({ length: 10 }, (_, i) => ({ s: 3600 + 3723 * i, seat: 3, date: "2026-11-26", players: 4, destination: "lantern-festival" })))); else localStorage.removeItem("dgm.records.v1"); }, scr === "records");
        await page.waitForSelector(".go");
        await page.click('[data-players="4"]');
        if (scr === "album") { await page.click(".album-open"); await page.waitForSelector(".album"); }
        if (scr.startsWith("records")) { await page.click(".records-open"); await page.waitForSelector(".records"); }
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

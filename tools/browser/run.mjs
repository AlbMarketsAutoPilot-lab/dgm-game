// npm run test:browser (C3, owner approved 15 Oct): the game tested in a real browser.
//   1. Whole games through the game screen, replayed in the engine turn by turn (reload and Leave included).
//   2. Every screen and popup at 19 screen sizes, from a folded phone to a 2560 × 1440 PC screen.
//   3. The published build: security policy, offline, other apps' caches, tampered storage, the first-visit guide,
//      the keyboard, an accessibility scan, no fast-forward.
// QUICK=1 plays fewer games and checks fewer sizes. CHROMIUM_PATH=… uses another Chromium than Playwright's own.
import fs from "node:fs";
import { ROOT, Report, devServer, launch, testBuild } from "./common.mjs";
import { playGame } from "./games.mjs";
import { SIZES, checkScreens } from "./screens.mjs";
import { checkPublished } from "./published.mjs";

const quick = !!process.env.QUICK;
// A watchdog: a check that waits forever is a failure, not a hang
setTimeout(() => { console.error("✗ the browser tests took over 40 minutes: stopped"); process.exit(1); }, 40 * 60_000).unref();
const report = new Report();
const browser = await launch();
const dev = await devServer();
let pub = null;
try {
  // 1. Whole games (in parallel)
  const GAMES = [
    { name: "short board, 4 people, reloaded at turn 12", board: "short", players: 4, people: [0, 1, 2, 3], brk: { kind: "reload", at: 12 } },
    { name: "long board, 3 people, left at turn 20 and continued", board: "long", players: 3, people: [0, 1, 2], brk: { kind: "leave", at: 20 } },
    { name: "short board, 1 person and 3 Easy computer players", board: "short", players: 4, people: [0], level: "easy" },
    { name: "long board, 2 people", board: "long", players: 2, people: [0, 1] },
    { name: "short board, 2 people and 1 Normal computer player", board: "short", players: 3, people: [0, 2], level: "normal" },
    { name: "short board, 3 people who spend lanterns to leave Home and the Bog, and as shields", board: "short", players: 3, people: [0, 1, 2], spend: true },
  ].slice(0, quick ? 2 : undefined);
  const results = await Promise.all(GAMES.map((g) => playGame(browser, dev.url, g).catch((e) => ({ diffs: [String(e)], errors: [], turns: 0, compared: 0 }))));
  results.forEach((r, i) => {
    const g = GAMES[i], bad = [...r.diffs, ...r.errors, ...(g.brk && !r.broke?.same ? [`${g.brk.kind}: board not the same after Continue`] : [])];
    report.add("whole games", g.name, !bad.length, bad.length ? bad.slice(0, 3).join(" | ") : `${r.turns} turns${r.spends ? `, lantern count checked in ${r.spends} "spent a lantern" popups` : ""}${r.notes ? `, ${r.notes} computer notes and no computer popup` : ""}${r.aheads ? `, ${r.aheads} "what's ahead" notices` : ""}${r.compared ? `, ${r.compared} compared with the engine` : ", winner and final board compared"}`);
  });

  // 2. Screen sizes
  const sizes = quick ? SIZES.filter(([, , n]) => ["fold", "se1", "iphone14", "se1-land", "ipad-land", "pc-1080"].includes(n)) : SIZES;
  const { problems, combos } = await checkScreens(browser, dev.url, sizes);
  report.add("screen sizes", `${combos} screen / size combinations`, !problems.length, problems.length ? `${problems.length} problems: ${problems.slice(0, 5).join(" | ")}` : "no problem");

  // 3. The published build
  pub = await testBuild();
  await checkPublished(browser, pub, report).catch((e) => report.add("published build", "the checks ran to the end", false, String(e).split("\n")[0]));
} finally {
  await browser.close();
  await dev.close();
  await pub?.close();
  fs.rmSync(`${ROOT}node_modules/.browsertest`, { recursive: true, force: true });
}
const failed = report.rows.filter((r) => !r.ok).length;
console.log(`\n${report.rows.length - failed} of ${report.rows.length} browser checks passed.`);
process.exit(report.ok ? 0 : 1);

// The Windows app (owner approved, 18 Oct 2026): copies the built game (dist/, made by "npm run build") into
// windows/DGM/Game/, which the app serves at https://dgm.example/. Run as "npm run windows:assets" (it builds first).
// Unlike KAJ, the game is a whole folder, so the whole folder is copied, as for Android. The offline worker (sw.js)
// stays out: the app does not use it (B3).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "dist"), game = path.join(root, "windows/DGM/Game");
if (!fs.existsSync(path.join(dist, "index.html"))) throw new Error("dist/index.html is missing: run npm run build first");
fs.rmSync(game, { recursive: true, force: true });
fs.cpSync(dist, game, { recursive: true, filter: (f) => path.relative(dist, f) !== "sw.js" });
console.log(`The game is copied into ${path.relative(root, game)}`);

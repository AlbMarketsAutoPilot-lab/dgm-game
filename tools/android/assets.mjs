// Step 8: copies the built game (dist/, made by "npm run build") into the Android app's assets/ folder, which the app
// serves at https://appassets.androidplatform.net/assets/. Run as "npm run android:assets" (it builds first).
// The offline worker (sw.js) stays out: the app does not use it (B3).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "dist"), assets = path.join(root, "android/app/src/main/assets");
if (!fs.existsSync(path.join(dist, "index.html"))) throw new Error("dist/index.html is missing: run npm run build first");
fs.rmSync(assets, { recursive: true, force: true });
fs.cpSync(dist, assets, { recursive: true, filter: (f) => path.relative(dist, f) !== "sw.js" });
console.log(`The game is copied into ${path.relative(root, assets)}`);

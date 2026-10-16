// `npm run android`, last step: opens the android folder in Android Studio, or says how to open it by hand.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const folder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "android");
const r = spawnSync("npx", ["cap", "open", "android"], { stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0) {
  console.log(`\nAndroid Studio was not found. Open it yourself, choose File → Open, and pick this folder:\n  ${folder}\n`);
}

// A4 (owner, 16 Oct 2026): the app's version, from one place.  npm run android:version 1.0.1
// Sets "version" in package.json (and package-lock.json), which the app shows as its versionName, and adds 1 to the
// versionCode in android/version-code.txt (Google Play needs a bigger whole number for every upload).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** "1.2.3" → [1, 2, 3], or null when it is not three whole numbers. */
export function parse(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v ?? "").trim());
  return m ? m.slice(1).map(Number) : null;
}

/** The new version and versionCode, or an error message in plain words. */
export function next(current, code, wanted) {
  const to = parse(wanted), from = parse(current);
  if (!to) return { error: `"${wanted ?? ""}" is not a version number. Write it like this: npm run android:version 1.0.1` };
  if (from && to.reduce((d, n, i) => d || n - from[i], 0) <= 0) return { error: `The new version must be higher than ${current}.` };
  if (!Number.isInteger(code) || code < 1) return { error: "android/version-code.txt must hold one whole number (1 or more)." };
  return { version: to.join("."), code: code + 1 };
}

/** Writes the new version into the project folder `root`. */
export function apply(root, wanted) {
  const pkgFile = path.join(root, "package.json"), lockFile = path.join(root, "package-lock.json");
  const codeFile = path.join(root, "android", "version-code.txt");
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  const r = next(pkg.version, Number(fs.readFileSync(codeFile, "utf8").trim()), wanted);
  if (r.error) return r;
  const set = (file, fn) => { const j = JSON.parse(fs.readFileSync(file, "utf8")); fn(j); fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n"); };
  set(pkgFile, (j) => { j.version = r.version; });
  if (fs.existsSync(lockFile)) set(lockFile, (j) => { j.version = r.version; if (j.packages?.[""]) j.packages[""].version = r.version; });
  fs.writeFileSync(codeFile, `${r.code}\n`);
  return r;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = apply(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".."), process.argv[2]);
  if (r.error) { console.error(r.error); process.exit(1); }
  console.log(`Version ${r.version}, versionCode ${r.code}. Next: npm run android`);
}

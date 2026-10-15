import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vitest/config";

// S1 (owner approved, 15 Oct): only the game's own files may run, load or connect; nothing from other websites.
// Inline styles are allowed (the illustrations' animations are styles the game writes itself), inline scripts are not.
// Built game only: the development server needs its own live-reload connection. Tested with a whole game: 0 violations.
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data:", "font-src 'self'",
  "connect-src 'self'", "manifest-src 'self'", "worker-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'none'",
].join("; ");

const csp = (): Plugin => ({
  name: "content-security-policy",
  apply: "build",
  transformIndexHtml: () => [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" }],
});

// Full offline (owner, 15 Oct: "all sound should be part of the package, the game fully offline"): after the build,
// the offline worker gets the list of every file of the game, so it stores all of them when it is installed, and a
// cache name made from their contents, so a new version replaces the old files at once.
const offline = (): Plugin => {
  let outDir = "";
  return {
    name: "offline-files",
    apply: "build",
    configResolved: (c) => { outDir = path.resolve(c.root, c.build.outDir); },
    closeBundle() {
      const sw = path.join(outDir, "sw.js");
      const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
      const files = walk(outDir).filter((f) => f !== sw).map((f) => path.relative(outDir, f).split(path.sep).join("/")).sort();
      const hash = createHash("sha256");
      for (const f of files) hash.update(f).update(fs.readFileSync(path.join(outDir, f)));
      const src = fs.readFileSync(sw, "utf8");
      const out = src.replace('const CACHE = PREFIX + "dev";', `const CACHE = PREFIX + ${JSON.stringify(hash.digest("hex").slice(0, 12))};`)
        .replace("const FILES = [];", `const FILES = ${JSON.stringify(files.map((f) => "./" + f))};`);
      if (out === src || out.includes("const FILES = [];")) throw new Error("sw.js: the offline file list could not be filled in");
      fs.writeFileSync(sw, out);
    },
  };
};

export default defineConfig({
  // Relative asset paths, so the build works on GitHub Pages and inside the Android app (Steps 7–8).
  base: "./",
  plugins: [csp(), offline()],
  // Sounds are always separate files in the package (never written into the script): the offline worker stores them,
  // and the security policy loads only the game's own files.
  build: { assetsInlineLimit: (file) => (file.endsWith(".mp3") ? false : undefined) },
  test: {
    include: ["test/**/*.test.ts"],
  },
});

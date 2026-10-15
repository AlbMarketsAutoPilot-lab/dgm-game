// Shared pieces of the browser tests (C3): the browser, the servers, and the results table.
import { chromium } from "playwright";
import { createServer, preview, build } from "vite";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../..", import.meta.url));

/** Chromium from Playwright; CHROMIUM_PATH points at another copy (e.g. a pre-installed one). */
export const launch = () => chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

/** The development server (the source as it is: the tests can import the engine into the page). */
export async function devServer() {
  const server = await createServer({ root: ROOT, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
  await server.listen();
  return { url: server.resolvedUrls.local[0].replace(/\/$/, ""), close: () => server.close() };
}

/**
 * A production build. Vite's development server switches the whole Node process to "development" (NODE_ENV), and a
 * build made after it would silently leave out what only production builds have, the offline worker among them: so
 * every build here is made with NODE_ENV=production, whatever ran before.
 */
export async function productionBuild(outDir, mode = "production") {
  const before = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    await build({ root: ROOT, mode, logLevel: "error", build: { outDir, emptyOutDir: true } });
  } finally {
    if (before === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = before;
  }
}

/** The game built like the published one (same security policy, same offline worker), but with `?fast` allowed. */
export async function testBuild() {
  const outDir = `${ROOT}node_modules/.browsertest`; // outside what the development server watches
  await productionBuild(outDir, "browsertest");
  const js = fs.readdirSync(`${outDir}/assets`).filter((f) => f.endsWith(".js")).map((f) => fs.readFileSync(`${outDir}/assets/${f}`, "utf8")).join("");
  return { ...(await serve(outDir)), serve: () => serve(outDir), hasOfflineWorker: js.includes("serviceWorker.register") };
}

/** A server for a built game (a second one can be started, and stopped, to test the game with its site gone). */
async function serve(outDir) {
  const server = await preview({ root: ROOT, logLevel: "error", build: { outDir }, preview: { port: 0, host: "127.0.0.1" } });
  return { url: server.resolvedUrls.local[0].replace(/\/$/, ""), close: () => new Promise((r) => { server.httpServer.closeAllConnections?.(); server.httpServer.close(() => r()); }) };
}

/** A page that collects errors (script errors, failed promises, console errors, security-policy violations). */
export async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", ...opts });
  if (opts.guideSeen !== false) await ctx.addInitScript(() => { try { localStorage.setItem("dgm.guide.v1", "seen"); } catch {} });
  await ctx.addInitScript(() => {
    addEventListener("unhandledrejection", (e) => console.error(`unhandled promise: ${e.reason}`));
    document.addEventListener("securitypolicyviolation", (e) => console.error(`security policy: ${e.violatedDirective} ${e.blockedURI}`));
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // failed downloads are reported by their address below; the browser's own favicon request does not count
  page.on("console", (m) => { if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(m.text()); });
  page.on("response", (r) => { if (r.status() >= 400 && !r.url().endsWith("/favicon.ico")) errors.push(`${r.status()} ${r.url()}`); });
  return { ctx, page, errors };
}

/** Results: one line per check, and whether everything passed. */
export class Report {
  rows = [];
  add(group, name, ok, detail = "") { this.rows.push({ group, name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${group}: ${name}${detail ? ` (${detail})` : ""}`); }
  get ok() { return this.rows.every((r) => r.ok); }
}

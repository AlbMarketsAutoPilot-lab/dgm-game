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

export default defineConfig({
  // Relative asset paths, so the build works on GitHub Pages and inside the Android app (Steps 7–8).
  base: "./",
  plugins: [csp()],
  test: {
    include: ["test/**/*.test.ts"],
  },
});

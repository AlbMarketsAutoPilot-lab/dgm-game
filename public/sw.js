// Offline (Step 7): the whole game is stored on the device when it is installed, the first time it is opened: every
// file of the build (scripts, styles, fonts, pictures, sounds), listed here by the build (vite.config.ts, `offline`).
// The worker is installed only once all of them are stored. Pages come from the network first (so a new version
// arrives), everything else from the cache first (file names change with every build).
// Only caches named "dgm-…" are ours: on GitHub Pages every project of the account shares one origin, and its caches
// with it (audit, 15 Oct: the first visit deleted every other app's cache). A new name drops our own old files once.
const PREFIX = "dgm-";
// Both filled in by the build: one cache per version of the game, holding all of its files.
const CACHE = PREFIX + "dev";
const FILES = [];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", ...FILES])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// File names change with every build, so a cached file is the right one whatever the server's Vary header says
// (audit: with "Vary: Origin" the scripts were never found offline).
// Only our own cache is searched (caches.match alone would search every app's caches on the origin).
const match = (req) => caches.open(CACHE).then((c) => c.match(req, { ignoreVary: true }));

// The page also sends the files it loaded before this worker was in charge (all already listed; kept as a second net).
self.addEventListener("message", (e) => {
  const files = e.data && Array.isArray(e.data.cache) ? e.data.cache.filter((u) => typeof u === "string" && u.startsWith(self.registration.scope)) : [];
  if (files.length) e.waitUntil(caches.open(CACHE).then((c) => c.addAll(files)).catch(() => {}));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const keep = (res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(keep).catch(() => match(req).then((r) => r || match("./"))));
  } else {
    e.respondWith(match(req).then((r) => r || fetch(req).then(keep)));
  }
});

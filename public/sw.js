// Offline (Step 7): the game is cached on the device the first time it is opened. Pages come from the network first
// (so a new version arrives), everything else from the cache first (file names change with every build).
const CACHE = "dgm-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./manifest.webmanifest"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// The page sends the files it loaded before this worker was in charge (scripts, styles, fonts), so they are kept too.
self.addEventListener("message", (e) => {
  if (e.data && e.data.cache) e.waitUntil(caches.open(CACHE).then((c) => c.addAll(e.data.cache)).catch(() => {}));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const keep = (res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(keep).catch(() => caches.match(req).then((r) => r || caches.match("./"))));
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then(keep)));
  }
});

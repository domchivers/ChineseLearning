/* Service worker: caches every app asset so it runs offline on the device.
 * NOTE: browsers only register a service worker over HTTPS or localhost — over
 * a plain http:// LAN address it stays inactive (the app still works online).
 * Bump CACHE when you change app files so devices pick up the new version. */
const CACHE = "zh-beginner-a-v163";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js?v=163",
  "./data.js?v=163",
  "./hanzi-data.js?v=163",
  "./vendor/hanzi-writer.min.js",
  "./manifest.webmanifest?v=163",
  "./icons/icon-192.png?v=163",
  "./icons/icon-512.png?v=163",
  "./icons/apple-touch-icon.png?v=163",
  "./images/panda-teacher.png?v=163",
  "./images/panda-celebrate.png?v=163",
  "./images/panda-sad.png?v=163",
  "./images/panda-idle.png?v=163",
  "./images/panda-waving.png?v=163",
  "./images/panda-peek.png?v=163",
  "./images/sprite-reading.png?v=163",
  "./images/sprite-baozi.png?v=163",
  "./images/sprite-writing.png?v=163",
  "./images/sprite-listening.png?v=163",
  "./images/sprite-puzzled.png?v=163",
  "./images/sprite-sleeping.png?v=163",
  "./images/welcome-light.webp?v=163",
  "./images/welcome-dark.webp?v=163",
  "./images/card-light.webp?v=163",
  "./images/card-dark.webp?v=163",
  "./vendor/fonts/nunito-latin.woff2",
  "./sounds/correct.mp3?v=163",
  "./sounds/wrong.mp3?v=163",
  "./sounds/complete.mp3?v=163",
  "./sounds/goal.mp3?v=163"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    // cache:'reload' — otherwise addAll can be served stale from the HTTP
    // cache, so a bumped version would re-cache the OLD bytes.
    .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page (index.html / navigations) is NETWORK-FIRST WITH A TIMEOUT: when online
// it fetches fresh, so an update lands on the FIRST open (stale-while-revalidate
// made updates take two opens, which left the phone perpetually a version behind).
// But it waits at most PAGE_TIMEOUT — on a slow/offline launch it falls back to the
// cached page fast, so there's no long black screen. Versioned assets below are
// cache-first for speed; they change URL on a ?v= bump so they can't go stale.
const PAGE_TIMEOUT = 2500;
function isPage(req) {
  if (req.mode === "navigate") return true;
  const p = new URL(req.url).pathname;
  return p === "/" || p.endsWith("/") || p.endsWith(".html");
}
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (isPage(e.request)) {
    e.respondWith(new Promise(resolve => {
      let settled = false;
      const settle = r => { if (!settled && r) { settled = true; resolve(r); } };
      // fast fallback: if the network hasn't answered by the timeout, use cache
      const timer = setTimeout(() => caches.match("./index.html").then(settle), PAGE_TIMEOUT);
      // cache:'reload' — go to the NETWORK, not the browser's HTTP cache. GitHub
      // Pages caches index.html for 10 min, so a plain fetch() could return a
      // stale page even when online, defeating network-first.
      fetch(new Request(e.request, { cache: "reload" })).then(resp => {
        clearTimeout(timer);
        caches.open(CACHE).then(c => c.put("./index.html", resp.clone()));
        settle(resp);
      }).catch(() => {
        clearTimeout(timer);
        caches.match("./index.html").then(c => settle(c || Response.error()));
      });
    }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        const copy = resp.clone();
        if (e.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
    )
  );
});

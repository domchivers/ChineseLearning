/* Service worker: caches every app asset so it runs offline on the device.
 * NOTE: browsers only register a service worker over HTTPS or localhost — over
 * a plain http:// LAN address it stays inactive (the app still works online).
 * Bump CACHE when you change app files so devices pick up the new version. */
const CACHE = "zh-beginner-a-v153";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js?v=153",
  "./data.js?v=153",
  "./hanzi-data.js?v=153",
  "./vendor/hanzi-writer.min.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./images/dragon-teacher.png?v=153",
  "./images/dragon-celebrate.png?v=153",
  "./images/dragon-thinking.png?v=153",
  "./images/dragon-sad.png?v=153",
  "./images/dragon-idle.png?v=153",
  "./images/dragon-waving.png?v=153",
  "./images/sprite-reading.png?v=153",
  "./images/sprite-ox-baozi.png?v=153",
  "./images/sprite-panda-puzzled.png?v=153",
  "./images/sprite-panda-baozi.png?v=153",
  "./images/sprite-joy.png?v=153",
  "./images/sprite-baozi.png?v=153",
  "./images/sprite-puzzled.png?v=153",
  "./sounds/correct.mp3?v=153",
  "./sounds/wrong.mp3?v=153",
  "./sounds/complete.mp3?v=153",
  "./sounds/goal.mp3?v=153"
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
      fetch(e.request).then(resp => {
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

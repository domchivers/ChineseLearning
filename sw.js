/* Service worker: caches every app asset so it runs offline on the device.
 * NOTE: browsers only register a service worker over HTTPS or localhost — over
 * a plain http:// LAN address it stays inactive (the app still works online).
 * Bump CACHE when you change app files so devices pick up the new version. */
const CACHE = "zh-beginner-a-v147";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js?v=147",
  "./data.js?v=147",
  "./hanzi-data.js?v=147",
  "./vendor/hanzi-writer.min.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./images/dragon-teacher.png?v=147",
  "./images/dragon-celebrate.png?v=147",
  "./images/dragon-thinking.png?v=147",
  "./images/dragon-sad.png?v=147",
  "./images/dragon-idle.png?v=147",
  "./images/dragon-waving.png?v=147",
  "./images/sprite-reading.png?v=147",
  "./images/sprite-ox-baozi.png?v=147",
  "./images/sprite-panda-puzzled.png?v=147",
  "./images/sprite-panda-baozi.png?v=147",
  "./images/sprite-joy.png?v=147",
  "./images/sprite-baozi.png?v=147",
  "./images/sprite-puzzled.png?v=147",
  "./sounds/correct.mp3?v=147",
  "./sounds/wrong.mp3?v=147",
  "./sounds/complete.mp3?v=147",
  "./sounds/goal.mp3?v=147"
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

// The page itself (index.html / navigations) is STALE-WHILE-REVALIDATE: serve the
// cached copy INSTANTLY (no black screen while a launch waits on the network, and
// it opens the same way offline), then refresh the cache in the background so the
// next launch picks up any new layout. The scripts/images it references are
// versioned (?v=) and the SW skipWaiting()s, so a real update still lands next open.
// Everything else (versioned scripts, images, vendor) is CACHE-FIRST for speed.
function isPage(req) {
  if (req.mode === "navigate") return true;
  const p = new URL(req.url).pathname;
  return p === "/" || p.endsWith("/") || p.endsWith(".html");
}
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (isPage(e.request)) {
    e.respondWith(
      caches.match("./index.html").then(cached => {
        const fresh = fetch(e.request).then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy));
          return resp;
        }).catch(() => cached);
        return cached || fresh;   // instant when cached; first-ever load waits on network
      })
    );
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

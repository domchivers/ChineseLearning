/* Service worker: caches every app asset so it runs offline on the device.
 * NOTE: browsers only register a service worker over HTTPS or localhost — over
 * a plain http:// LAN address it stays inactive (the app still works online).
 * Bump CACHE when you change app files so devices pick up the new version. */
const CACHE = "zh-beginner-a-v170";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js?v=170",
  "./data.js?v=170",
  "./hanzi-data.js?v=170",
  "./vendor/hanzi-writer.min.js",
  "./manifest.webmanifest?v=170",
  "./icons/icon-192.png?v=170",
  "./icons/icon-512.png?v=170",
  "./icons/apple-touch-icon.png?v=170",
  "./images/panda-teacher.png?v=170",
  "./images/panda-celebrate.png?v=170",
  "./images/panda-sad.png?v=170",
  "./images/panda-idle.png?v=170",
  "./images/panda-waving.png?v=170",
  "./images/panda-peek.png?v=170",
  "./images/sprite-reading.png?v=170",
  "./images/sprite-baozi.png?v=170",
  "./images/sprite-writing.png?v=170",
  "./images/sprite-listening.png?v=170",
  "./images/sprite-puzzled.png?v=170",
  "./images/sprite-sleeping.png?v=170",
  "./images/welcome-light.webp?v=170",
  "./images/welcome-dark.webp?v=170",
  "./images/card-light.webp?v=170",
  "./images/card-dark.webp?v=170",
  "./vendor/fonts/nunito-latin.woff2",
  "./vendor/fonts/longcang-subset.woff2",
  "./images/path/cluster-left-bamboo-dark.webp?v=170",
  "./images/path/cluster-left-bamboo-light.webp?v=170",
  "./images/path/cluster-right-bamboo-dark.webp?v=170",
  "./images/path/cluster-right-bamboo-light.webp?v=170",
  "./images/path/cluster-right-temple-dark.webp?v=170",
  "./images/path/cluster-right-temple-light.webp?v=170",
  "./images/path/land-0-light.webp?v=170",
  "./images/path/land-0-dark.webp?v=170",
  "./images/path/land-1-light.webp?v=170",
  "./images/path/land-1-dark.webp?v=170",
  "./images/path/land-2-light.webp?v=170",
  "./images/path/land-2-dark.webp?v=170",
  "./images/path/land-3-light.webp?v=170",
  "./images/path/land-3-dark.webp?v=170",
  "./images/path/land-4-light.webp?v=170",
  "./images/path/land-4-dark.webp?v=170",
  "./images/path/land-5-light.webp?v=170",
  "./images/path/land-5-dark.webp?v=170",
  "./images/path/land-6-light.webp?v=170",
  "./images/path/land-6-dark.webp?v=170",
  "./images/path/land-7-light.webp?v=170",
  "./images/path/land-7-dark.webp?v=170",
  "./images/path/land-8-light.webp?v=170",
  "./images/path/land-8-dark.webp?v=170",
  "./images/path/land-9-light.webp?v=170",
  "./images/path/land-9-dark.webp?v=170",
  "./images/path/land-10-light.webp?v=170",
  "./images/path/land-10-dark.webp?v=170",
  "./images/path/land-11-light.webp?v=170",
  "./images/path/land-11-dark.webp?v=170",
  "./images/path/fol-0-light.webp?v=170",
  "./images/path/fol-0-dark.webp?v=170",
  "./images/path/fol-1-light.webp?v=170",
  "./images/path/fol-1-dark.webp?v=170",
  "./images/path/fol-2-light.webp?v=170",
  "./images/path/fol-2-dark.webp?v=170",
  "./images/path/fol-3-light.webp?v=170",
  "./images/path/fol-3-dark.webp?v=170",
  "./images/path/fol-4-light.webp?v=170",
  "./images/path/fol-4-dark.webp?v=170",
  "./images/path/fol-5-light.webp?v=170",
  "./images/path/fol-5-dark.webp?v=170",
  "./images/path/fol-6-light.webp?v=170",
  "./images/path/fol-6-dark.webp?v=170",
  "./images/path/fol-7-light.webp?v=170",
  "./images/path/fol-7-dark.webp?v=170",
  "./images/path/fol-8-light.webp?v=170",
  "./images/path/fol-8-dark.webp?v=170",
  "./images/path/fol-9-light.webp?v=170",
  "./images/path/fol-9-dark.webp?v=170",
  "./images/path/fol-10-light.webp?v=170",
  "./images/path/fol-10-dark.webp?v=170",
  "./images/path/fol-11-light.webp?v=170",
  "./images/path/fol-11-dark.webp?v=170",
  "./images/path/panda-walking-dark.webp?v=170",
  "./images/path/panda-walking-light.webp?v=170",
  "./images/path/stone-dark-done-0.webp?v=170",
  "./images/path/stone-dark-done-1.webp?v=170",
  "./images/path/stone-dark-done-2.webp?v=170",
  "./images/path/stone-dark-done-3.webp?v=170",
  "./images/path/stone-dark-done-4.webp?v=170",
  "./images/path/stone-dark-locked-0.webp?v=170",
  "./images/path/stone-dark-locked-1.webp?v=170",
  "./images/path/stone-dark-locked-2.webp?v=170",
  "./images/path/stone-dark-locked-3.webp?v=170",
  "./images/path/stone-dark-locked-4.webp?v=170",
  "./images/path/stone-dark-now-0.webp?v=170",
  "./images/path/stone-dark-now-1.webp?v=170",
  "./images/path/stone-dark-now-2.webp?v=170",
  "./images/path/stone-dark-now-3.webp?v=170",
  "./images/path/stone-dark-now-4.webp?v=170",
  "./images/path/stone-light-done-0.webp?v=170",
  "./images/path/stone-light-done-1.webp?v=170",
  "./images/path/stone-light-done-2.webp?v=170",
  "./images/path/stone-light-done-3.webp?v=170",
  "./images/path/stone-light-done-4.webp?v=170",
  "./images/path/stone-light-locked-0.webp?v=170",
  "./images/path/stone-light-locked-1.webp?v=170",
  "./images/path/stone-light-locked-2.webp?v=170",
  "./images/path/stone-light-locked-3.webp?v=170",
  "./images/path/stone-light-locked-4.webp?v=170",
  "./images/path/stone-light-now-0.webp?v=170",
  "./images/path/stone-light-now-1.webp?v=170",
  "./images/path/stone-light-now-2.webp?v=170",
  "./images/path/stone-light-now-3.webp?v=170",
  "./images/path/stone-light-now-4.webp?v=170",
  "./sounds/correct.mp3?v=170",
  "./sounds/wrong.mp3?v=170",
  "./sounds/complete.mp3?v=170",
  "./sounds/goal.mp3?v=170"
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

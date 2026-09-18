/* Service worker: caches every app asset so it runs offline on the device.
 * NOTE: browsers only register a service worker over HTTPS or localhost — over
 * a plain http:// LAN address it stays inactive (the app still works online).
 * Bump CACHE when you change app files so devices pick up the new version. */
const CACHE = "zh-beginner-a-v228";
const AVATAR_CACHE = "bubu-avatar-catalogue-v1";
const ASSETS = [
  "./images/profile/dark_avatarBackground.webp?v=228",
  "./images/profile/dark_learningPathBackground.webp?v=228",
  "./images/profile/dark_quoteFoliage.webp?v=228",
  "./images/profile/light_avatarBackground.webp?v=228",
  "./images/profile/light_learningPathBackground.webp?v=228",
  "./images/profile/light_quoteFoliage.webp?v=228",

  "./avatar-modular-data.js?v=228",
  "./avatar-modular.js?v=228",
  "./images/avatar-modular-v006/df4ee8eeb8bc14a51448.webp?v=228",
  "./images/avatar-modular-v006/5a1fd36c5697c586e25a.webp?v=228",
  "./images/avatar-modular-v006/9995b6e883db0d2915f2.webp?v=228",
  "./images/avatar-modular-v006/cc07ac066bd078e0941f.webp?v=228",
  "./images/avatar-modular-v006/43da716cf2d35f14a1b4.webp?v=228",
  "./images/avatar-modular-v006/3ea394fa7014c035a57f.webp?v=228",
  "./images/avatar-modular-v006/9d7d73535fdc617fa34c.webp?v=228",
  "./images/avatar-modular-v006/a832b44566f24400932a.webp?v=228",

  "./images/avatar-catalogue/a824c3a24cd00b44c1dd.webp?v=228",
  "./images/avatar-catalogue/c1ab30d44b2ef1a9317f.webp?v=228",
  "./images/avatar-catalogue/d3db329f1d7aefe6c95a.webp?v=228",
  "./images/avatar-catalogue/265149d454822c2c8087.webp?v=228",
  "./images/avatar-catalogue/1108c1d4c2285201c571.webp?v=228",

  "./avatar-catalogue.js?v=228",
  "./avatar-model.js?v=228",
  "./avatar-wardrobe.js?v=228",
  "./",
  "./index.html",
  "./app.js?v=228",
  "./data.js?v=228",
  "./hanzi-data.js?v=228",
  "./vendor/hanzi-writer.min.js",
  "./manifest.webmanifest?v=228",
  "./icons/icon-192.png?v=228",
  "./icons/icon-512.png?v=228",
  "./icons/apple-touch-icon.png?v=228",
  "./images/panda-teacher.png?v=228",
  "./images/panda-celebrate.png?v=228",
  "./images/panda-sad.png?v=228",
  "./images/panda-idle.png?v=228",
  "./images/panda-waving.png?v=228",
  "./images/panda-peek.png?v=228",
  "./images/sprite-reading.png?v=228",
  "./images/sprite-baozi.png?v=228",
  "./images/sprite-writing.png?v=228",
  "./images/sprite-listening.png?v=228",
  "./images/sprite-puzzled.png?v=228",
  "./images/sprite-sleeping.png?v=228",
  "./images/welcome-light.webp?v=228",
  "./images/welcome-dark.webp?v=228",
  "./images/card-light.webp?v=228",
  "./images/card-dark.webp?v=228",
  "./vendor/fonts/nunito-latin.woff2",
  "./vendor/fonts/longcang-subset.woff2",
  "./images/path/cluster-left-bamboo-dark.webp?v=228",
  "./images/path/cluster-left-bamboo-light.webp?v=228",
  "./images/path/cluster-right-bamboo-dark.webp?v=228",
  "./images/path/cluster-right-bamboo-light.webp?v=228",
  "./images/path/cluster-right-temple-dark.webp?v=228",
  "./images/path/cluster-right-temple-light.webp?v=228",
  "./images/path/fol-bamboo.webp?v=228",
  "./images/path/fol-pine.webp?v=228",
  "./images/path/fol-blossom-light.webp?v=228",
  "./images/path/fol-blossom-dark.webp?v=228",
  "./images/path/fol-banana.webp?v=228",
  "./images/path/land-torii.webp?v=228",
  "./images/path/land-pagoda-light.webp?v=228",
  "./images/path/land-pagoda-dark.webp?v=228",
  "./images/path/land-pavilion.webp?v=228",
  "./images/path/land-house.webp?v=228",
  "./images/path/fol-oak.webp?v=228",
  "./images/path/land-bridge.webp?v=228",
  "./images/path/land-waterfall.webp?v=228",
  "./images/path/grass-1.webp?v=228",
  "./images/path/grass-2.webp?v=228",
  "./images/path/grass-3.webp?v=228",
  "./images/path/land-cliff.webp?v=228",
  "./images/path/panda-celebrate.webp?v=228",
  "./images/path/panda-idle.webp?v=228",
  "./images/path/panda-peek.webp?v=228",
  "./images/path/panda-sad.webp?v=228",
  "./images/path/panda-teacher.webp?v=228",
  "./images/path/panda-waving.webp?v=228",
  "./images/path/panda-reading.webp?v=228",
  "./images/path/panda-baozi.webp?v=228",
  "./images/path/panda-writing-light.webp?v=228",
  "./images/path/panda-writing-dark.webp?v=228",
  "./images/path/panda-listening.webp?v=228",
  "./images/path/panda-puzzled.webp?v=228",
  "./images/path/panda-sleeping-light.webp?v=228",
  "./images/path/panda-sleeping-dark.webp?v=228",
  "./images/path/panda-walking-dark.webp?v=228",
  "./images/path/panda-walking-light.webp?v=228",
  "./images/home/cloud-a-light.webp?v=228",
  "./images/home/temple-light.webp?v=228",
  "./images/home/cloud-b-light.webp?v=228",
  "./images/home/cloud-a-dark.webp?v=228",
  "./images/home/temple-dark.webp?v=228",
  "./images/home/cloud-b-dark.webp?v=228",
  "./images/home/bottom-light.webp?v=228",
  "./images/avatar/bottom-shorts-brown.webp?v=228",
  "./images/avatar/bottom-shorts-dark.webp?v=228",
  "./images/avatar/bottom-shorts-deep.webp?v=228",
  "./images/avatar/bottom-shorts-light.webp?v=228",
  "./images/avatar/bottom-shorts-tan.webp?v=228",
  "./images/avatar/bottom-shorts-warm.webp?v=228",
  "./images/avatar/bottom-skirt-brown.webp?v=228",
  "./images/avatar/bottom-skirt-dark.webp?v=228",
  "./images/avatar/bottom-skirt-deep.webp?v=228",
  "./images/avatar/bottom-skirt-light.webp?v=228",
  "./images/avatar/bottom-skirt-tan.webp?v=228",
  "./images/avatar/bottom-skirt-warm.webp?v=228",
  "./images/avatar/bottom-trousers-brown.webp?v=228",
  "./images/avatar/bottom-trousers-dark.webp?v=228",
  "./images/avatar/bottom-trousers-deep.webp?v=228",
  "./images/avatar/bottom-trousers-light.webp?v=228",
  "./images/avatar/bottom-trousers-tan.webp?v=228",
  "./images/avatar/bottom-trousers-warm.webp?v=228",
  "./images/avatar/brows-concerned.webp?v=228",
  "./images/avatar/brows-none.webp?v=228",
  "./images/avatar/brows-raised.webp?v=228",
  "./images/avatar/brows-relaxed.webp?v=228",
  "./images/avatar/eyes-happy.webp?v=228",
  "./images/avatar/eyes-open.webp?v=228",
  "./images/avatar/eyes-squeezed.webp?v=228",
  "./images/avatar/eyes-wink.webp?v=228",
  "./images/avatar/hair-bob.webp?v=228",
  "./images/avatar/hair-bun.webp?v=228",
  "./images/avatar/hair-curls.webp?v=228",
  "./images/avatar/hair-pigtails.webp?v=228",
  "./images/avatar/hair-tousled.webp?v=228",
  "./images/avatar/hair-waves.webp?v=228",
  "./images/avatar/head-brown.webp?v=228",
  "./images/avatar/head-dark.webp?v=228",
  "./images/avatar/head-deep.webp?v=228",
  "./images/avatar/head-light.webp?v=228",
  "./images/avatar/head-tan.webp?v=228",
  "./images/avatar/head-warm.webp?v=228",
  "./images/avatar/mouth-neutral.webp?v=228",
  "./images/avatar/mouth-open.webp?v=228",
  "./images/avatar/mouth-smile.webp?v=228",
  "./images/avatar/shoes-charcoal.webp?v=228",
  "./images/avatar/shoes-cream.webp?v=228",
  "./images/avatar/top-hoodie-brown.webp?v=228",
  "./images/avatar/top-hoodie-dark.webp?v=228",
  "./images/avatar/top-hoodie-deep.webp?v=228",
  "./images/avatar/top-hoodie-light.webp?v=228",
  "./images/avatar/top-hoodie-tan.webp?v=228",
  "./images/avatar/top-hoodie-warm.webp?v=228",
  "./images/avatar/top-jacket-brown.webp?v=228",
  "./images/avatar/top-jacket-dark.webp?v=228",
  "./images/avatar/top-jacket-deep.webp?v=228",
  "./images/avatar/top-jacket-light.webp?v=228",
  "./images/avatar/top-jacket-tan.webp?v=228",
  "./images/avatar/top-jacket-warm.webp?v=228",
  "./images/home/bottom-dark.webp?v=228",
  "./images/path/panda-teacher.webp?v=228",
  "./images/path/panda-celebrate.webp?v=228",
  "./images/path/panda-sad.webp?v=228",
  "./images/path/stone-dark-done-0.webp?v=228",
  "./images/path/stone-dark-done-1.webp?v=228",
  "./images/path/stone-dark-done-2.webp?v=228",
  "./images/path/stone-dark-done-3.webp?v=228",
  "./images/path/stone-dark-done-4.webp?v=228",
  "./images/path/stone-dark-locked-0.webp?v=228",
  "./images/path/stone-dark-locked-1.webp?v=228",
  "./images/path/stone-dark-locked-2.webp?v=228",
  "./images/path/stone-dark-locked-3.webp?v=228",
  "./images/path/stone-dark-locked-4.webp?v=228",
  "./images/path/stone-dark-now-0.webp?v=228",
  "./images/path/stone-dark-now-1.webp?v=228",
  "./images/path/stone-dark-now-2.webp?v=228",
  "./images/path/stone-dark-now-3.webp?v=228",
  "./images/path/stone-dark-now-4.webp?v=228",
  "./images/path/stone-light-done-0.webp?v=228",
  "./images/path/stone-light-done-1.webp?v=228",
  "./images/path/stone-light-done-2.webp?v=228",
  "./images/path/stone-light-done-3.webp?v=228",
  "./images/path/stone-light-done-4.webp?v=228",
  "./images/path/stone-light-locked-0.webp?v=228",
  "./images/path/stone-light-locked-1.webp?v=228",
  "./images/path/stone-light-locked-2.webp?v=228",
  "./images/path/stone-light-locked-3.webp?v=228",
  "./images/path/stone-light-locked-4.webp?v=228",
  "./images/path/stone-light-now-0.webp?v=228",
  "./images/path/stone-light-now-1.webp?v=228",
  "./images/path/stone-light-now-2.webp?v=228",
  "./images/path/stone-light-now-3.webp?v=228",
  "./images/path/stone-light-now-4.webp?v=228",
  "./sounds/correct.mp3?v=228",
  "./sounds/wrong.mp3?v=228",
  "./sounds/complete.mp3?v=228",
  "./sounds/goal.mp3?v=228"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    // cache:'reload' — otherwise addAll can be served stale from the HTTP
    // cache, so a bumped version would re-cache the OLD bytes.
    .then(c => c.addAll([...new Set(ASSETS)].map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== AVATAR_CACHE).map(k => caches.delete(k))))
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
  // Content-addressed catalogue assets load on demand and survive app updates.
  if (new URL(e.request.url).origin === self.location.origin && new URL(e.request.url).pathname.includes('/images/avatar-catalogue/')) {
    const key = new Request(e.request.url.split('?')[0]);
    const response = caches.open(AVATAR_CACHE).then(async cache => {
      const cached = await cache.match(key) || await caches.match(e.request);
      if (cached) return cached;
      const fresh = await fetch(e.request);
      if (fresh.ok) { try { await cache.put(key, fresh.clone()); } catch (_) { /* A full cache must not prevent viewing. */ } }
      return fresh;
    });
    e.respondWith(response);e.waitUntil(response.then(() => {}, () => {}));return;
  }
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

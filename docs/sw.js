// Bǎizì offline cache. The version changes whenever the game is rebuilt, which replaces the old cache.
const CACHE = 'baizi-8617dc59e0';
const CORE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Pages: network first so updates arrive, cached copy when offline.
  if (req.mode === 'navigate' && url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { if (r.ok && /\/(index\.html)?$/.test(url.pathname)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)); } return r; }).catch(() => caches.match('./')));
    return;
  }
  // Everything else (icons, Google's Chinese font files): cache first, then network.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
});

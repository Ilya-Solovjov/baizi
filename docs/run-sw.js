// Night Market Run offline cache. Version changes whenever the game is rebuilt, which replaces the old cache.
const CACHE = 'night-market-e41abe04d6';
const CORE = ['run.html', 'run.webmanifest', 'icons/run-192.png', 'icons/run-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('night-market-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // The game page: try the network first so updates arrive, fall back to the cached copy offline.
  if (url.origin === location.origin && (url.pathname.endsWith('/run.html') || req.mode === 'navigate')) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('run.html'))));
    return;
  }
  // Everything else (icons, Google's Chinese font files): cache first, then network.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
});

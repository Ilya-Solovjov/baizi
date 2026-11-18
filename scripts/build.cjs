// Builds two single-file versions of the app from src/:
//   docs/index.html   — a complete page for GitHub Pages (or to open locally)
//   dist/artifact.html — the same page as a fragment, for hosts that add their own <head>/<body>
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const DATA = ['vocab.js', 'grammar.js', 'speaking.js', 'culture.js', 'partner.js', 'generated.js', 'strokes.js'];
const HANZI_WRITER = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';
const FONTS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=ZCOOL+KuaiLe&family=Figtree:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;700&display=swap';
const head = [
  '<title>Bǎizì Chinese Study</title>',
  '<meta name="description" content="Flashcards, stroke-checked handwriting, grammar drills and mock oral interviews for Modern Chinese 1A, Units 1–4.">',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  `<link rel="stylesheet" href="${FONTS}">`,
  `<style>\n${read('styles.css')}\n</style>`,
].join('\n');
const body = [
  '<div id="app"></div>',
  `<script src="${HANZI_WRITER}"></script>`,
  ...DATA.map(f => `<script>\n${read('data/' + f)}\n</script>`),
  `<script>\n${read('app.js')}\n</script>`,
].join('\n');
const full = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
const fragment = `${head}\n${body}\n`;
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'index.html'), full);
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), fragment);
console.log('docs/index.html', Math.round(full.length / 1024) + ' KB');

// The word-card roguelike lives on its own page and reuses the course data (no stroke data needed).
// The game is split into section files under src/run/parts, joined in name order inside one closure.
function gameJs() {
  const dir = path.join(root, 'src', 'run', 'parts');
  const parts = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  const header = '/* 夜市 Night Market Run: a word-card roguelike built on the Bǎizì course data.\n   Every card is a Chinese word. To play it you answer a question about it. Source: src/run/parts/*.js */\n';
  return header + "(function () {\n  'use strict';\n" + parts.map(f => '  // ── ' + f + '\n' + fs.readFileSync(path.join(dir, f), 'utf8')).join('') + '})();';
}
const RUN_FONTS = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&display=swap';
// Pixelify Sans and IBM Plex Sans Condensed are embedded (small Latin subsets, SIL OFL) so the installed app looks right offline.
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const embedFont = (family, file, weight, range) => `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;unicode-range:${range};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'src', 'run', 'fonts', file)).toString('base64')}) format("woff2")}`;
const RUN_FONT_CSS = [
  ['Pixelify Sans', 'pixelify-sans-latin-400-normal.woff2', 400, LATIN], ['Pixelify Sans', 'pixelify-sans-latin-600-normal.woff2', 600, LATIN], ['Pixelify Sans', 'pixelify-sans-latin-700-normal.woff2', 700, LATIN],
  ['Pixelify Sans', 'pixelify-sans-latin-ext-400-normal.woff2', 400, LATIN_EXT], ['Pixelify Sans', 'pixelify-sans-latin-ext-600-normal.woff2', 600, LATIN_EXT],
  ['IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-400-normal.woff2', 400, LATIN], ['IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-600-normal.woff2', 600, LATIN],
  ['IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-ext-400-normal.woff2', 400, LATIN_EXT], ['IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-ext-600-normal.woff2', 600, LATIN_EXT],
].map(f => embedFont(...f)).join('\n');
const runHead = [
  '<title>Night Market Run</title>',
  '<meta name="description" content="A word-card roguelike for Modern Chinese 1A: every card is a Chinese word you answer to play.">',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  `<link rel="stylesheet" href="${RUN_FONTS}">`,
  `<style>\n${RUN_FONT_CSS}\n${read('run/game.css')}\n</style>`,
].join('\n');
const runBody = ['<div id="game"></div>', ...['vocab.js', 'grammar.js', 'culture.js', 'partner.js', 'generated.js'].map(f => `<script>\n${read('data/' + f)}\n</script>`), `<script>\n${gameJs()}\n</script>`].join('\n');
// The GitHub Pages copy is also an installable app (PWA): a manifest, icons, and a service worker that caches the game for offline play.
const runVersion = require('crypto').createHash('sha1').update(runHead + runBody).digest('hex').slice(0, 10);
const pwaHead = [
  '<link rel="manifest" href="run.webmanifest">',
  '<meta name="theme-color" content="#0C0908">',
  '<link rel="icon" type="image/png" sizes="192x192" href="icons/run-192.png">',
  '<link rel="apple-touch-icon" href="icons/run-180.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Night Market">',
].join('\n');
const pwaBody = `<script>if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) addEventListener('load', () => navigator.serviceWorker.register('run-sw.js').catch(() => {}));</script>`;
const runFull = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${runHead}\n${pwaHead}\n</head>\n<body>\n${runBody}\n${pwaBody}\n</body>\n</html>\n`;
fs.writeFileSync(path.join(root, 'docs', 'run.html'), runFull);
fs.writeFileSync(path.join(root, 'docs', 'run.webmanifest'), JSON.stringify({
  name: 'Night Market Run', short_name: 'Night Market', description: 'A word-card roguelike for Modern Chinese 1A.',
  start_url: 'run.html', scope: './', display: 'standalone', background_color: '#0C0908', theme_color: '#0C0908',
  icons: [{ src: 'icons/run-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icons/run-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icons/run-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
}, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'docs', 'run-sw.js'), `// Night Market Run offline cache. Version changes whenever the game is rebuilt, which replaces the old cache.
const CACHE = 'night-market-${runVersion}';
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
`);
fs.writeFileSync(path.join(root, 'dist', 'run-artifact.html'), `${runHead}\n${runBody}\n`);
console.log('docs/run.html', Math.round(runFull.length / 1024) + ' KB');

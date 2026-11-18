// Builds Bǎizì from src/ into single-file pages:
//   docs/index.html     the game, for GitHub Pages (also an installable offline app: manifest, icons, service worker)
//   docs/run.html       forwards the game's old address to index.html
//   dist/artifact.html  the same game as a fragment, for hosts that add their own <head>/<body>
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');

// The game is split into section files under src/game/parts, joined in name order inside one closure.
function gameJs() {
  const dir = path.join(root, 'src', 'game', 'parts');
  const parts = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  const header = '/* 百字 Bǎizì: a word-card roguelike for Modern Chinese 1A.\n   Every card is a Chinese word. To play it you answer a question about it. Source: src/game/parts/*.js */\n';
  return header + "(function () {\n  'use strict';\n" + parts.map(f => '  // ── ' + f + '\n' + fs.readFileSync(path.join(dir, f), 'utf8')).join('') + '})();';
}

// Fonts. Pixelify Sans (labels), Jersey 10 (digits) and IBM Plex Sans Condensed (body) are small Latin subsets,
// embedded so the installed app looks right offline (all SIL OFL). Noto Serif SC is too large to embed; it loads
// from Google Fonts and falls back to the system's Chinese serif.
const SERIF_SC = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&display=swap';
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const font64 = file => fs.readFileSync(path.join(root, 'src', 'game', 'fonts', file)).toString('base64');
const face = (family, file, weight, range, extra = '') => `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;unicode-range:${range};${extra}src:url(data:font/woff2;base64,${font64(file)}) format("woff2")}`;
const FONT_CSS = [
  face('Pixelify Sans', 'pixelify-sans-latin-400-normal.woff2', 400, LATIN), face('Pixelify Sans', 'pixelify-sans-latin-600-normal.woff2', 600, LATIN), face('Pixelify Sans', 'pixelify-sans-latin-700-normal.woff2', 700, LATIN),
  face('Pixelify Sans', 'pixelify-sans-latin-ext-400-normal.woff2', 400, LATIN_EXT), face('Pixelify Sans', 'pixelify-sans-latin-ext-600-normal.woff2', 600, LATIN_EXT),
  face('IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-400-normal.woff2', 400, LATIN), face('IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-600-normal.woff2', 600, LATIN),
  face('IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-ext-400-normal.woff2', 400, LATIN_EXT), face('IBM Plex Sans Condensed', 'ibm-plex-sans-condensed-latin-ext-600-normal.woff2', 600, LATIN_EXT),
  // Digits come from Jersey 10: Pixelify's 2 and 8 are too alike at small sizes.
  face('PX Digits', 'jersey-10-latin-400-normal.woff2', '400 700', 'U+0030-0039', 'size-adjust:118%;'),
].join('\n');

const head = [
  '<title>Bǎizì</title>',
  '<meta name="description" content="A pixel-art deckbuilding roguelike for Modern Chinese 1A: every card is a Chinese word you answer to play.">',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  `<link rel="stylesheet" href="${SERIF_SC}">`,
  `<style>\n${FONT_CSS}\n${read('game/game.css')}\n</style>`,
].join('\n');
const body = ['<div id="game"></div>', ...['vocab.js', 'grammar.js', 'culture.js', 'partner.js', 'generated.js'].map(f => `<script>\n${read('data/' + f)}\n</script>`), `<script>\n${gameJs()}\n</script>`].join('\n');

// Installable app (PWA). The manifest id stays "run.html" so an app installed from the old address keeps its identity.
const version = crypto.createHash('sha1').update(head + body).digest('hex').slice(0, 10);
const pwaHead = [
  '<link rel="manifest" href="manifest.webmanifest">',
  '<meta name="theme-color" content="#0C0908">',
  '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">',
  '<link rel="apple-touch-icon" href="icons/icon-180.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Bǎizì">',
].join('\n');
const pwaBody = `<script>if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>`;
const page = (h, b) => `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${h}\n</head>\n<body>\n${b}\n</body>\n</html>\n`;

fs.mkdirSync(path.join(root, 'docs', 'icons'), { recursive: true });
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const full = page(`${head}\n${pwaHead}`, `${body}\n${pwaBody}`);
fs.writeFileSync(path.join(root, 'docs', 'index.html'), full);
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), `${head}\n${body}\n`);
fs.writeFileSync(path.join(root, 'docs', 'run.html'), page('<title>Bǎizì</title>\n<meta http-equiv="refresh" content="0; url=./">\n<link rel="canonical" href="./">', '<p>Bǎizì has moved to <a href="./">the main page</a>.</p>\n<script>location.replace(\'./\' + location.hash);</script>'));
fs.writeFileSync(path.join(root, 'docs', 'manifest.webmanifest'), JSON.stringify({
  id: 'run.html', name: 'Bǎizì', short_name: 'Bǎizì', description: 'A pixel-art deckbuilding roguelike for Modern Chinese 1A.',
  start_url: './', scope: './', display: 'standalone', background_color: '#0C0908', theme_color: '#0C0908',
  icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
}, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'docs', 'sw.js'), `// Bǎizì offline cache. The version changes whenever the game is rebuilt, which replaces the old cache.
const CACHE = 'baizi-${version}';
const CORE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Pages: network first so updates arrive, cached copy when offline.
  if (req.mode === 'navigate' && url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { if (r.ok && /\\/(index\\.html)?$/.test(url.pathname)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)); } return r; }).catch(() => caches.match('./')));
    return;
  }
  // Everything else (icons, Google's Chinese font files): cache first, then network.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
});
`);
console.log('docs/index.html', Math.round(full.length / 1024) + ' KB');

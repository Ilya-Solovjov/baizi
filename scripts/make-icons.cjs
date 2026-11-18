// Renders the app icons for the installable game from the player's pixel sprite. Needs Playwright.
// Usage: node scripts/build.cjs && node scripts/make-icons.cjs
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + path.join(__dirname, '..', 'docs', 'run.html'));
  const out = await page.evaluate(async () => {
    const src = /src="([^"]+)"/.exec(window.__NMR.art('you'))[1];
    const img = new Image(); img.src = src; await img.decode();
    const make = (size, inset) => {
      const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const grd = g.createRadialGradient(size * .62, size * .4, 0, size * .5, size * .5, size * .75); grd.addColorStop(0, '#4a1410'); grd.addColorStop(1, '#0c0908');
      g.fillStyle = grd; g.fillRect(0, 0, size, size);
      const k = Math.floor(size * (1 - 2 * inset) / img.width); const w = img.width * k;
      g.drawImage(img, Math.round((size - w) / 2), Math.round((size - w) / 2 + size * .02), w, w);
      return c.toDataURL('image/png').split(',')[1];
    };
    return { 180: make(180, .06), 192: make(192, .06), 512: make(512, .06), m512: make(512, .14) };
  });
  const dir = path.join(__dirname, '..', 'docs', 'icons');
  fs.writeFileSync(path.join(dir, 'run-180.png'), Buffer.from(out[180], 'base64'));
  fs.writeFileSync(path.join(dir, 'run-192.png'), Buffer.from(out[192], 'base64'));
  fs.writeFileSync(path.join(dir, 'run-512.png'), Buffer.from(out[512], 'base64'));
  fs.writeFileSync(path.join(dir, 'run-maskable-512.png'), Buffer.from(out.m512, 'base64'));
  console.log('icons written to docs/icons'); await b.close();
})();

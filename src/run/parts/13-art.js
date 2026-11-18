  // ───────────── Art ─────────────
  // Characters are pixel sprites (12b-sprites.js), rendered once to PNG data URLs and shown with crisp scaling.
  const SPRITE_CACHE = {};
  function spriteURL(kind) {
    if (SPRITE_CACHE[kind]) return SPRITE_CACHE[kind];
    const f = SPRITES[kind]; if (!f) return null;
    const img = f(); const cv = PX.toCanvas(img, 1);
    return (SPRITE_CACHE[kind] = { url: cv.toDataURL('image/png'), n: img.N });
  }
  const KIND_ALIAS = { lantern: 'lanternbeast' };
  function art(kind, mood) {
    const s = spriteURL(KIND_ALIAS[kind] || kind); if (!s) return '';
    return '<img class="art art-' + kind + (mood ? ' m-' + mood : '') + '" src="' + s.url + '" width="' + s.n + '" height="' + s.n + '" style="--px:' + s.n + '" alt="" draggable="false">';
  }
  // For the map's boss node, which is drawn inside an SVG.
  function artSvgImage(kind, x, y, size) { const s = spriteURL(KIND_ALIAS[kind] || kind); return s ? '<image href="' + s.url + '" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" style="image-rendering:pixelated"/>' : ''; }
  // Emblem: a square red seal with a character.
  const sealMark = (ch, cls) => '<span class="seal-mark' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><span class="han">' + ch + '</span></span>';

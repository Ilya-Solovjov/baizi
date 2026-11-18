  // ───────────── Pixel icons ─────────────
  // Tiny letter grids: each letter maps to a colour, '.' is empty; a 1px dark outline is added around everything.
  const ICON_GRIDS = {
    sword: ['......bb', '.....bab', '....bab.', 'c..bab..', '.cbab...', '..hb....', '.h.c....', 'h...c...'],
    shield: ['bbbbbbb', 'baaaaac', 'baaaaac', 'baaaaac', '.baaac.', '..bac..', '...c...'],
    ask: ['.aaaa.', 'aa..aa', '....aa', '...aa.', '..aa..', '......', '..aa..'],
    talk: ['aaaaaaaa', 'abbbbbba', 'ab.b.bba', 'abbbbbba', 'aaaaaaaa', '.aa.....', '.a......'],
    heart: ['.aa.aa.', 'abaaaaa', 'aaaaaaa', 'aaaaaaa', '.aaaaa.', '..aaa..', '...a...'],
    up: ['...a...', '..aaa..', '.aaaaa.', 'aaaaaaa', '..aaa..', '..aaa..', '..aaa..'],
    down: ['..aaa..', '..aaa..', '..aaa..', 'aaaaaaa', '.aaaaa.', '..aaa..', '...a...'],
    noise: ['a...a...', '.a.a.a.a', '..a...a.', '........', 'a...a...', '.a.a.a.a', '..a...a.'],
    coin: ['.aaaa.', 'abbbac', 'abaaac', 'abaaac', 'aaaacc', '.cccc.'],
    hp: ['.aa.aa.', 'abaaaaa', 'aaaaaaa', 'aaaaaaa', '.aaaaa.', '..aaa..', '...a...'],
  };
  const ICON_COLORS = {
    sword: { a: '#c4ccd6', b: '#ffffff', c: '#5a6370', h: '#b8924c' }, shield: { a: '#6f8fb3', b: '#bcd2ec', c: '#2b4a6b' },
    ask: { a: '#8fb0d6' }, talk: { a: '#e39bb5', b: '#3a1424' }, heart: { a: '#83be8e', b: '#d6f2da' }, up: { a: '#e3c27c' }, down: { a: '#8fb0d6' },
    noise: { a: '#b79ad6' }, coin: { a: '#e3c27c', b: '#fff1c4', c: '#8a6c34' }, hp: { a: '#e0644f', b: '#ffb8a8' },
  };
  const ICON_CACHE = {};
  function iconURL(name) {
    if (ICON_CACHE[name]) return ICON_CACHE[name];
    const g = ICON_GRIDS[name], col = ICON_COLORS[name]; const h = g.length + 2, w = Math.max(...g.map(r => r.length)) + 2;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    const at = (r, c) => r >= 1 && c >= 1 && r <= g.length && c <= g[r - 1].length && g[r - 1][c - 1] !== '.';
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      if (at(r, c)) { x.fillStyle = col[g[r - 1][c - 1]] || col.a; x.fillRect(c, r, 1, 1); }
      else if (at(r - 1, c) || at(r + 1, c) || at(r, c - 1) || at(r, c + 1)) { x.fillStyle = '#090504'; x.fillRect(c, r, 1, 1); }
    }
    return (ICON_CACHE[name] = { url: cv.toDataURL('image/png'), w, h });
  }
  const icon = (name, scale = 2) => { const i = iconURL(name); return '<img class="ico" src="' + i.url + '" width="' + i.w * scale + '" height="' + i.h * scale + '" alt="">'; };
  // The energy orb, drawn with the sprite renderer.
  let ORB = null;
  function orbURL() {
    if (ORB) return ORB;
    const img = PX.render({ size: 20, layers: [{ shape: PX.S.circ(10, 10, 8.6), ramp: ['#3a0907', '#6e1611', '#a3241a', '#d23b2b', '#f0663f', '#ffb27a'], center: [8, 8] }, { shape: PX.S.ring(10, 10, 7.2, 8.7), ramp: ['#4d3812', '#7d602a', '#b8924c', '#e3c27c'], noInner: true }], details: [[6, 5, '#ffe0c0'], [7, 5, '#ffd0a8'], [5, 6, '#ffd0a8']] });
    return (ORB = PX.toCanvas(img, 1).toDataURL('image/png'));
  }

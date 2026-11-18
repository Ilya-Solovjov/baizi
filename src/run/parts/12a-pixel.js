  // ───────────── Pixel renderer ─────────────
  /* Tiny pixel-art renderer: characters are built from shapes, each with a colour ramp.
     Shapes are rasterised on a small grid, shaded from a top-left light with ordered dithering,
     then given a dark outline, inner edge lines, emissive glows and hand-placed detail pixels. */
  (function () {
    const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]].map(r => r.map(v => v / 16 - 0.47));
    const OUT = '#090504';
    const rad = d => d * Math.PI / 180;
    // Shape predicates
    const S = {
      ell: (cx, cy, rx, ry, deg = 0) => (x, y) => { const a = rad(deg), dx = x - cx, dy = y - cy, u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a); return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1; },
      circ: (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r,
      ring: (cx, cy, r1, r2) => (x, y) => { const d = (x - cx) ** 2 + (y - cy) ** 2; return d <= r2 * r2 && d >= r1 * r1; },
      rect: (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1,
      poly: pts => (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; },
      line: (x0, y0, x1, y1, w = 1) => (x, y) => { const dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy || 1; let t = ((x - x0) * dx + (y - y0) * dy) / L; t = Math.max(0, Math.min(1, t)); const px = x0 + t * dx, py = y0 + t * dy; return (x - px) ** 2 + (y - py) ** 2 <= (w / 2) ** 2 + 0.15; },
      // A tube along sampled points, radius r(t)
      tube: (pts, r) => { const s = []; const n = 80; for (let i = 0; i <= n; i++) { const t = i / n; s.push([sample(pts, t), r(t)]); } return (x, y) => s.some(([[px, py], rr]) => (x - px) ** 2 + (y - py) ** 2 <= rr * rr); },
      or: (...fs) => (x, y) => fs.some(f => f(x, y)),
      and: (...fs) => (x, y) => fs.every(f => f(x, y)),
      not: f => (x, y) => !f(x, y),
    };
    function sample(pts, t) { // Catmull-Rom through pts
      const n = pts.length - 1, f = t * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
      const c = (a, b, c2, d) => 0.5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
      return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
    }
    // spec: { size, layers: [{ shape, ramp, mode: 'lit'|'flat'|'glow', center?, light? , noOutline? }], details: [[x,y,color]...], glows: [{x,y,r,color}] , shadow: {cx, cy, rx} }
    function render(spec) {
      const N = spec.size, grid = Array.from({ length: N }, () => Array(N).fill(null)), owner = Array.from({ length: N }, () => Array(N).fill(-1));
      const masks = spec.layers.map(L => { const m = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => L.shape(x + 0.5, y + 0.5))); return m; });
      spec.layers.forEach((L, li) => {
        const m = masks[li]; let sx = 0, sy = 0, c = 0, minx = N, maxx = 0, miny = N, maxy = 0;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m[y][x]) { sx += x; sy += y; c++; minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
        if (!c) return;
        const [cx, cy] = L.center || [sx / c, sy / c]; const R = Math.max(maxx - minx, maxy - miny) / 2 + 1;
        const n = L.ramp.length;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          if (!m[y][x]) continue;
          let v;
          if (L.mode === 'flat') v = L.level != null ? L.level : n - 1;
          else if (L.mode === 'glow') { const d = Math.hypot(x - cx, y - cy) / R; v = (1 - d) * (n - 0.2) + BAYER[y % 4][x % 4] * 0.9; }
          else {
            const nx = (x - cx) / R, ny = (y - cy) / R; const [lx, ly] = L.light || [-0.55, -0.83];
            let l = 0.5 - 0.55 * (nx * -lx + ny * -ly); // brighter toward the light
            // edge terms
            const inside = (xx, yy) => xx >= 0 && yy >= 0 && xx < N && yy < N && m[yy][xx];
            if (!inside(x - 1, y) || !inside(x, y - 1)) l += 0.22;
            if (!inside(x + 1, y) || !inside(x, y + 1)) l -= 0.25;
            v = l * (n - 1) + BAYER[y % 4][x % 4] * (L.dither == null ? 0.5 : L.dither);
          }
          const idx = Math.max(0, Math.min(n - 1, Math.round(v)));
          grid[y][x] = L.ramp[idx]; owner[y][x] = li;
        }
      });
      // inner edges: where a layer sits on top of another, darken its lower/right boundary pixels against the layer behind
      const inner = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const o = owner[y][x]; if (o < 0) continue; const L = spec.layers[o]; if (L.noInner) continue;
        for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue; const o2 = owner[yy][xx]; if (o2 >= 0 && o2 < o && !spec.layers[o2].noInner) { inner.push([x, y, L.ramp[0]]); break; } }
      }
      inner.forEach(([x, y, c]) => grid[y][x] = c);
      (spec.pre || []).forEach(([x, y, c]) => { if (y >= 0 && y < N && x >= 0 && x < N) { grid[y][x] = c; if (c === null) owner[y][x] = -1; } });
      // outline
      const filled = (x, y) => x >= 0 && y >= 0 && x < N && y < N && grid[y][x] && grid[y][x] !== OUT;
      const out = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!grid[y][x] && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))) {
        const own = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].map(([a, b]) => filled(a, b) ? owner[b][a] : -1).filter(o => o >= 0);
        if (own.length && own.every(o => spec.layers[o].noOutline)) continue;
        out.push([x, y]);
      }
      out.forEach(([x, y]) => grid[y][x] = OUT);
      (spec.details || []).forEach(([x, y, c]) => { if (y >= 0 && y < N && x >= 0 && x < N) grid[y][x] = c; });
      return { N, grid, glows: spec.glows || [], shadow: spec.shadow };
    }
    function toCanvas(img, scale, canvas) {
      const { N, grid } = img; const cv = canvas || document.createElement('canvas'); cv.width = N; cv.height = N;
      const g = cv.getContext('2d'); g.clearRect(0, 0, N, N);
      if (img.shadow) { const { cx, cy, rx } = img.shadow; for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x, cy, 1, 1); if (Math.abs(x - cx) < rx - 3) g.fillRect(x, cy + 1, 1, 1); } }
      for (const gl of img.glows) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const d = Math.hypot(x - gl.x, y - gl.y) / gl.r; if (d < 1 && !grid[y][x]) { const a = (1 - d) * (gl.a || 0.35); if (a + BAYER[y % 4][x % 4] * 0.12 > 0.06) { g.fillStyle = gl.color.replace('A', a.toFixed(2)); g.fillRect(x, y, 1, 1); } } }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (grid[y][x]) { g.fillStyle = grid[y][x]; g.fillRect(x, y, 1, 1); }
      cv.style.width = N * scale + 'px'; cv.style.height = N * scale + 'px'; cv.style.imageRendering = 'pixelated';
      return cv;
    }
    window.PX = { S, render, toCanvas, OUT };
  })();

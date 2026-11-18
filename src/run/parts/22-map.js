  // ───────────── Map ─────────────
  const ROWS = 8, COLS = 5;
  const NODE = {
    fight: { zh: '战', en: 'Fight' }, elite: { zh: '精', en: 'Elite' }, rest: { zh: '茶', en: 'Teahouse' },
    shop: { zh: '店', en: 'Shop' }, event: { zh: '问', en: 'Event' }, treasure: { zh: '宝', en: 'Treasure' }, boss: { zh: '王', en: 'Boss' },
  };
  function genMap() {
    const nodes = {}, edges = new Set(), key = (r, c) => r + ':' + c;
    const starts = shuffle([0, 1, 2, 3, 4]).slice(0, 3).concat([rint(0, 4)]);
    for (const s of starts) {
      let c = s;
      for (let r = 0; r < ROWS; r++) {
        nodes[key(r, c)] = nodes[key(r, c)] || { r, c };
        if (r < ROWS - 1) { const nc = Math.max(0, Math.min(COLS - 1, c + rint(-1, 1))); edges.add(key(r, c) + '>' + key(r + 1, nc)); c = nc; }
      }
    }
    for (const n of Object.values(nodes)) {
      const r = n.r;
      if (r === 0) n.t = 'fight';
      else if (r === 4) n.t = 'treasure';
      else if (r === ROWS - 1) n.t = 'rest';
      else { const x = Math.random(); n.t = x < 0.42 ? 'fight' : x < 0.62 ? 'event' : x < 0.75 && r >= 2 ? 'elite' : x < 0.86 ? 'shop' : r >= 2 && r <= 5 ? 'rest' : 'fight'; }
    }
    return { nodes, edges: [...edges] };
  }
  const reachable = () => {
    const m = RUN.map;
    if (!RUN.pos) return Object.keys(m.nodes).filter(k => m.nodes[k].r === 0);
    if (m.nodes[RUN.pos].r === ROWS - 1) return ['boss'];
    return m.edges.filter(e => e.startsWith(RUN.pos + '>')).map(e => e.split('>')[1]);
  };


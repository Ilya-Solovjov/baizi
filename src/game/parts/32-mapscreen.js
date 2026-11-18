  // ───────────── Map screen ─────────────
  function mapScreen() {
    if (!RUN) return title();
    F = null;
    const m = RUN.map, reach = new Set(reachable()), done = new Set(RUN.done || []);
    const cs = Object.values(m.nodes).map(n => n.c), shift = ((COLS - 1) - (Math.min(...cs) + Math.max(...cs))) / 2;
    const W = 420, H = 680, px = c => 50 + (c + shift) * ((W - 100) / (COLS - 1)), py = r => H - 44 - r * ((H - 190) / (ROWS - 1));
    const lines = m.edges.map(e => { const [a, b] = e.split('>'); const A = m.nodes[a], Bn = m.nodes[b]; const on = done.has(a) && (done.has(b) || reach.has(b)); return '<line x1="' + px(A.c) + '" y1="' + py(A.r) + '" x2="' + px(Bn.c) + '" y2="' + py(Bn.r) + '" class="edge' + (on ? ' on' : '') + '"/>'; }).join('') +
      Object.values(m.nodes).filter(n => n.r === ROWS - 1).map(n => '<line x1="' + px(n.c) + '" y1="' + py(n.r) + '" x2="' + W / 2 + '" y2="70" class="edge"/>').join('');
    const nodes = Object.entries(m.nodes).map(([k, n]) => {
      const cls = ['node', 'n-' + n.t, reach.has(k) ? 'reach' : '', done.has(k) ? 'done' : '', RUN.pos === k ? 'here' : ''].join(' ');
      return '<g class="' + cls + '" data-k="' + k + '" transform="translate(' + px(n.c) + ' ' + py(n.r) + ')"' + (reach.has(k) ? ' tabindex="0" role="button" aria-label="' + NODE[n.t].en + '"' : '') + '><rect class="bg" x="-17" y="-17" width="34" height="34"/><text class="lbl" y="6.5" text-anchor="middle">' + NODE[n.t].zh + '</text></g>';
    }).join('');
    const bossId = RUN.bosses[RUN.act - 1], BE = ENEMIES[bossId];
    const bossNode = '<g class="node n-boss' + (reach.has('boss') ? ' reach' : '') + '" data-k="boss" transform="translate(' + W / 2 + ' 70)"' + (reach.has('boss') ? ' tabindex="0" role="button" aria-label="Boss: ' + esc(BE.en) + '"' : '') + '><rect class="bg" x="-46" y="-46" width="92" height="92"/>' + artSvgImage(BE.art, -40, -42, 80) + '</g>';
    root.innerHTML = topbar() +
      '<section class="map-screen"><div class="map-head"><p class="eyebrow">Act ' + RUN.act + ' of 2</p><h2>' + (RUN.act === 1 ? 'The lantern stalls' : 'The midnight alleys') + '</h2><p class="muted small">Pick a glowing stall. <b class="han">' + BE.zh + '</b> ' + esc(BE.en) + ' waits at the top.</p></div>' +
      '<div class="map-wrap act' + RUN.act + '"><svg class="map" viewBox="0 0 ' + W + ' ' + H + '">' + lines + nodes + bossNode + '</svg></div>' +
      '<div class="legend">' + Object.entries(NODE).map(([k, v]) => '<span><b class="han n-' + k + '-c">' + v.zh + '</b> ' + v.en + '</span>').join('') + '</div>' +
      '<div class="row center"><button class="ghost" id="quitRun">Title screen</button></div></section>';
    bindTop();
    $('#quitRun').addEventListener('click', title);
    $$('.node.reach').forEach(g => { const go = () => enterNode(g.dataset.k); g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    const here = $('.node.reach'); if (here && here.scrollIntoView) here.scrollIntoView({ block: 'center' });
  }
  function enterNode(k) {
    const t = k === 'boss' ? 'boss' : RUN.map.nodes[k].t;
    RUN.next = k; saveRun();
    if (t === 'fight') return combat(pick(RUN.act === 1 && RUN.floor < 2 ? ['tangyuan', 'chili', 'teapot'] : NORMALS[RUN.act]));
    if (t === 'elite') return combat(pick(ELITES));
    if (t === 'boss') return combat(RUN.bosses[RUN.act - 1]);
    if (t === 'rest') return rest();
    if (t === 'shop') return shop();
    if (t === 'event') return pick([fortuneEvent, touristEvent, calligraphyEvent])();
    if (t === 'treasure') return treasure();
  }
  function advance() {
    if (RUN.next && RUN.next !== 'boss') { RUN.pos = RUN.next; RUN.done = (RUN.done || []).concat(RUN.next); RUN.floor = RUN.map.nodes[RUN.next].r + 1; }
    RUN.next = null; META.bestFloor = Math.max(META.bestFloor, RUN.floor + (RUN.act - 1) * (ROWS + 1)); saveMeta(); saveRun(); mapScreen();
  }


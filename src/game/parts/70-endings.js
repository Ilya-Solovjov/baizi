  // ───────────── Endings ─────────────
  function summary() {
    const words = Object.entries(RUN.log).filter(([k]) => !/^[§¶]/.test(k));
    const nailed = words.filter(([, v]) => v.r && !v.w).map(([k]) => k);
    const review = words.filter(([, v]) => v.w).sort((a, b) => b[1].w - a[1].w).map(([k]) => k);
    const grammar = Object.entries(RUN.log).filter(([k, v]) => k.startsWith('§') && v.w).map(([k]) => k.slice(1));
    const talks = Object.entries(RUN.log).filter(([k, v]) => k.startsWith('¶') && v.w).map(([k]) => k.slice(1));
    const row = h => { const w = wordOf(h) || { p: '', e: '' }; return '<li><button class="say" data-say="' + esc(h) + '" aria-label="Play ' + esc(h) + '">▶</button><b class="han">' + esc(h) + '</b> <span class="py">' + esc(w.p) + '</span> <span class="muted">' + esc(short(w.e)) + '</span></li>'; };
    const S = RUN.stats, acc = S.casts ? Math.round(100 * S.right / S.casts) : 0;
    return '<div class="stat-tiles"><div><b>' + acc + '%</b><span>cards answered right · ' + S.right + ' of ' + S.casts + '</span></div><div><b>' + S.combos + '</b><span>grammar combos</span></div><div><b>' + S.talksRight + ' / ' + S.talks + '</b><span>conversations handled</span></div><div><b>' + RUN.deck.filter(c => c.m).length + '</b><span>words mastered this run</span></div><div><b>' + (S.best || 0) + '</b><span>biggest single card</span></div><div><b>' + (S.spoken || 0) + '</b><span>cards typed from memory while Tongue-tied</span></div></div>' +
      '<div class="summary"><div><h3>Words to review · ' + review.length + '</h3>' + (review.length ? '<ul>' + review.map(row).join('') + '</ul><p class="small muted">The ones you miss most join your next starting deck.</p>' : '<p class="muted small">None! Every word you cast, you got right.</p>') + '</div>' +
      '<div><h3>Words you nailed · ' + nailed.length + '</h3>' + (nailed.length ? '<ul>' + nailed.slice(0, 30).map(row).join('') + '</ul>' : '<p class="muted small">Words you get right every time show up here.</p>') + '</div>' +
      (grammar.length || talks.length ? '<div>' + (grammar.length ? '<h3>Grammar to revisit</h3><ul>' + grammar.map(g => '<li>' + esc(g) + '</li>').join('') + '</ul>' : '') + (talks.length ? '<h3>Conversation lines to practice</h3><ul>' + talks.map(t => '<li><button class="say" data-say="' + esc(t) + '" aria-label="Play">▶</button><span class="han">' + esc(t) + '</span></li>').join('') + '</ul>' : '') + '<p class="small muted">Drill these in Bǎizì’s Grammar section and partner quests.</p></div>' : '') + '</div>';
  }
  function bindSay() { $$('[data-say]').forEach(b => b.addEventListener('click', () => speak(b.dataset.say, true))); }
  function gameOver() {
    sfx('bad'); const fl = RUN.floor + 1;
    root.innerHTML = '<section class="ending"><div class="ending-art">' + sealMark('败') + '</div><p class="eyebrow">Run over</p><h1>You fell on act ' + RUN.act + ', floor ' + fl + '.</h1><p class="lead">Every word you missed this run is listed below, and the ones you missed most join your next starting deck.</p>' + summary() +
      '<div class="row center"><button class="btn primary big" id="again">New run</button><button class="ghost" id="alb">Word album</button></div></section>';
    RUN = null; F = null; saveRun(); bindSay(); $('#again').addEventListener('click', title); $('#alb').addEventListener('click', album);
  }
  function victory() {
    META.wins++;
    const lvl = RUN.asc || 0, unlocked = lvl >= (META.ascMax || 0) && lvl < SPICE.length;
    if (unlocked) { META.ascMax = lvl + 1; META.ascPick = lvl + 1; }
    saveMeta();
    if (unlocked) setTimeout(() => toastMsg('Spice level ' + (lvl + 1) + ' unlocked: ' + SPICE[lvl]), 600);
        root.innerHTML = '<section class="ending win"><div class="ending-art">' + sealMark('胜') + '</div><p class="eyebrow">Run complete</p><h1>Both bosses are down.</h1><p class="lead"><span class="han">你真棒！</span> Nǐ zhēn bàng! You cleared the night market.</p>' + summary() +
      '<div class="row center"><button class="btn primary big" id="again">Play again</button><button class="ghost" id="alb">Word album</button></div></section>';
    if (!reduced()) confetti();
    RUN = null; F = null; saveRun(); bindSay(); $('#again').addEventListener('click', title); $('#alb').addEventListener('click', album);
  }
  function confetti() {
    const c = document.createElement('canvas'); c.className = 'confetti'; const dpr = devicePixelRatio || 1, W = innerWidth, H = innerHeight; c.width = W * dpr; c.height = H * dpr; document.body.appendChild(c);
    const x = c.getContext('2d'); x.scale(dpr, dpr); const cols = ['#C9A45C', '#B3261E', '#E9DFCC'];
    const P = Array.from({ length: 90 }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, r: Math.random() * 7 + 4, c: pick(cols), a: Math.random() * 6 }));
    let f = 0; const tick = () => { x.clearRect(0, 0, W, H); for (const p of P) { p.vy += .33; p.x += p.vx; p.y += p.vy; p.a += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - f / 140); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); } if (++f < 140) requestAnimationFrame(tick); else c.remove(); }; tick();
  }


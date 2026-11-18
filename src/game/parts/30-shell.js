  // ───────────── UI shell ─────────────
  const root = document.getElementById('game');
  function topbar() {
    if (!RUN) return '';
    return '<header class="bar"><div class="bar-l"><span class="hp-chip" title="Health">' + icon('hp') + '<b>' + Math.max(0, RUN.hp) + '</b>/' + RUN.maxHp + '</span><span class="coin-chip" title="Coins">' + icon('coin') + RUN.coins + '</span>' +
      '<span class="relics">' + RUN.relics.map(relicIcon).join('') + '</span>' +
      '<span class="potions">' + [0, 1].map(i => { const p = RUN.potions[i]; return p ? '<button class="potion" data-pi="' + i + '" title="' + esc(POTIONS[p].en + ': ' + POTIONS[p].d + (F ? ' Tap to use.' : ' Use it during a fight.')) + '" aria-label="' + esc(POTIONS[p].en + ' potion: ' + POTIONS[p].d) + '"><span class="han">' + POTIONS[p].zh + '</span></button>' : '<span class="potion empty" title="Empty potion slot"></span>'; }).join('') + '</span></div>' +
      '<div class="bar-r">' + (RUN.asc ? '<span class="floor spice-chip" title="Spice level ' + RUN.asc + '">辣 ' + RUN.asc + '</span>' : '') + '<span class="floor">Act ' + RUN.act + ' · ' + Math.min(RUN.floor + 1, ROWS + 1) + '</span><button class="ghost" id="deckBtn">Deck ' + RUN.deck.length + '</button></div></header>';
  }
  function bindTop() {
    const d = $('#deckBtn'); if (d) d.addEventListener('click', showDeck);
    $$('.potion[data-pi]').forEach(b => b.addEventListener('click', () => usePotion(+b.dataset.pi)));
  }
  // opts: live (fight numbers), combo (would combo), up (force upgraded preview: 1)
  function cardHTML(c, opts = {}) {
    const d = def(c), u = opts.up != null ? opts.up : (c.up ? 1 : 0), n = [...c.h].length;
    const cc = Object.assign({}, c, { up: !!u });
    const kws = kwOf(cc).filter(k => k !== 'Power');
    const cost = d.t === 'junk' ? '' : costOf(cc);
    const A = d.a && ARCH[d.a];
    return '<div class="card t-' + d.t + ' r-' + d.r + (u ? ' up' : '') + (c.cracked ? ' cracked' : '') + '">' +
      (d.t === 'junk' ? '' : '<span class="cost">' + cost + '</span>') +
      '<span class="card-name han' + (n >= 4 ? ' l4' : n === 3 ? ' l3' : '') + '">' + esc(c.h) + (u ? '<sup>+</sup>' : '') + '</span>' +
      '<span class="card-type">' + TYPES[d.t] + (POSNAME[c.pos] ? ' · ' + POSNAME[c.pos] : '') + '</span>' +
      '<span class="card-txt">' + (kws.length ? '<span class="kws">' + kws.join(' · ') + '</span>' : '') + describe(cc, opts.live, opts.up) + '</span>' +
      '<span class="card-foot">' + (A ? '<span class="arch a-' + d.a + '" title="' + esc(A.en + ' build: ' + A.d) + '">' + A.zh + '</span>' : '<span></span>') +
        (d.t === 'junk' ? '' : c.m ? '<span class="mastered" title="Mastered (熟): you get the hardest questions for this word">熟</span>' : '<span class="pips" title="Answer right 3 times to master this word">' + [0, 1, 2].map(i => '<i class="' + (i < c.xp ? 'on' : '') + '"></i>').join('') + '</span>') + '</span>' +
      (opts.combo ? '<span class="combo-tag">combo</span>' : '') + '</div>';
  }
  function archCounts(deck) {
    const out = {};
    for (const c of deck) { const d = def(c); if (!d.a || (BASIC_ATK.includes(c.tid) || ['guard'].includes(c.tid))) continue; out[d.a] = (out[d.a] || 0) + 1; }
    return out;
  }
  function showDeck() {
    const ov = document.createElement('div'); ov.className = 'overlay';
    const ac = archCounts(RUN.deck);
    const order = Object.keys(ARCH);
    const sorted = RUN.deck.slice().sort((a, b) => (order.indexOf(def(a).a) - order.indexOf(def(b).a)) || a.h.localeCompare(b.h));
    ov.innerHTML = '<div class="sheet"><div class="sheet-head"><h2>Deck · ' + RUN.deck.length + '</h2><button class="ghost" id="closeDeck">Close</button></div>' +
      '<div class="builds">' + (Object.keys(ac).length ? Object.entries(ac).sort((a, b) => b[1] - a[1]).map(([k, n]) => '<span class="build a-' + k + '"><b class="han">' + ARCH[k].zh + '</b> ' + ARCH[k].en + ' <i>' + n + '</i></span>').join('') : '<span class="muted small">No builds yet. Card rewards lean toward builds you start.</span>') + '</div>' +
      '<div class="deck-grid">' + sorted.map(c => '<div class="deck-item">' + cardHTML(c) + '<div class="small"><b class="han">' + esc(c.h) + '</b> ' + esc(c.p) + '<br><span class="muted">' + esc(short(c.e)) + '</span></div></div>').join('') + '</div>' +
      '<details class="glossary"><summary>Builds, keywords and grammar combos</summary><div class="gloss-cols">' +
        '<div><h3>Builds</h3><dl>' + Object.entries(ARCH).map(([k, A]) => '<dt class="a-' + k + '"><b class="han">' + A.zh + '</b> ' + A.en + '</dt><dd>' + esc(A.d) + '</dd>').join('') + '</dl></div>' +
        '<div><h3>Keywords</h3><dl>' + Object.entries(KEYWORDS).map(([k, v]) => '<dt>' + k + '</dt><dd>' + esc(v) + '</dd>').join('') + '</dl></div>' +
        '<div><h3>Grammar combos</h3><dl>' + COMBOS.map(x => '<dt>' + esc(x.name) + ' <span class="han">' + esc(x.ex) + '</span></dt><dd>' + esc(x.d) + ' on the second card.</dd>').join('') + '</dl></div>' +
      '</div></details></div>';
    document.body.appendChild(ov);
    const close = () => ov.remove();
    $('#closeDeck', ov).addEventListener('click', close); ov.addEventListener('click', e => { if (e.target === ov) close(); });
  }
  function toastMsg(m) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = m; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => { t.hidden = true; }, 2800); }

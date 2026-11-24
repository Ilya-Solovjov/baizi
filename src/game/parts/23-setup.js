  // ───────────── Run setup ─────────────
  // Starter deck, like a deckbuilder's basics: 4 plain verb attacks, 4 plain noun blocks, 1 adjective, 1 question word.
  // Words you missed most in earlier runs replace some of them.
  const BASIC_ATK = ['strike', 'flurry', 'jab', 'guardstrike'], BASIC_DEF = ['guard', 'scout', 'steady', 'ally', 'snack', 'plan', 'topic'];
  function newRun(path) {
    const P = PATHS.find(p => p.id === path) || PATHS[0];
    const asc = Math.max(0, Math.min(META.ascPick || 0, META.ascMax || 0));
    RUN = { lessons: P.lessons, path: P.id, bosses: P.bosses, asc, act: 1, hp: 64, maxHp: 64, coins: 40, relics: [], potions: ['tea'], deck: [], floor: 0, pos: null, done: [], map: null, log: {}, seen: [], stats: newStats() };
    RUN.map = genMap();
    if (spice(6)) RUN.hp = Math.round(RUN.maxHp * 0.8);
    const ws = WORDS.filter(w => P.lessons.includes(w.l) && (w.tier === 'L' || w.tier === 'R')).filter((w, i, a) => a.findIndex(x => x.h === w.h) === i);
    const by = ids => shuffle(ws.filter(w => ids.includes(tplId(w)) && [...w.h].length <= 3));
    const score = h => META.words[h].w - META.words[h].r * 0.5;
    const weak = ws.filter(w => META.words[w.h] && META.words[w.h].w > 0 && !mastered(META.words[w.h]) && T[tplId(w)].r === 'C' && T[tplId(w)].t !== 'pow').sort((a, b) => score(b.h) - score(a.h)).slice(0, 3);
    const atk = by(['strike']).concat(by(BASIC_ATK)).filter((w, i, a) => a.indexOf(w) === i);
    const def0 = by(['guard']).concat(by(BASIC_DEF)).filter((w, i, a) => a.indexOf(w) === i);
    const base = atk.slice(0, 4).concat(def0.slice(0, 4), by(['hex', 'sting', 'wither']).slice(0, 1), by(['what', 'which', 'howabout', 'ne']).slice(0, 1));
    const starter = weak.concat(base.filter(w => !weak.some(x => x.h === w.h))).slice(0, 10 + Math.min(2, weak.length));
    RUN.deck = starter.map(makeCard); RUN.seen = starter.map(w => w.h); RUN.weak = weak.map(w => w.h);
    if (spice(9)) RUN.deck.push({ uid: UID++, h: '乱', p: 'luàn', e: 'noise', pos: 'noise', tid: 'noise', up: false, xp: 0 });
    META.runs++; saveMeta(); saveRun();
    track('run-start', 'Run started'); if (META.runs === 1) track('first-run', 'New player: first run');
    if (weak.length) toastMsg('Words you missed last time joined your deck: ' + weak.map(w => w.h).join(' '));
  }
  // Like a deckbuilder's opening blessing: pick one uncommon card from three different builds to point your run somewhere.
  function openingPick() {
    const ws = shuffle(pool()).filter((w, i, a) => a.findIndex(x => x.h === w.h) === i);
    const out = [], archs = new Set();
    for (const w of ws) { const d = T[tplId(w)]; if (d.r !== 'U' || archs.has(d.a) || RUN.deck.some(c => c.h === w.h)) continue; out.push(w); archs.add(d.a); if (out.length === 3) break; }
    if (!out.length) return mapScreen();
    root.innerHTML = topbar() + '<section class="reward"><p class="eyebrow">Before the market opens</p><h2>Choose an opening card</h2><p class="muted small">Each one starts a different build. Your starter deck is plain on purpose; this is the first piece of a plan.</p>' +
      '<div class="choices">' + out.map(rewardCard).join('') + '</div><button class="ghost" id="skip">Skip</button></section>';
    bindTop();
    $$('.choice').forEach(b => b.addEventListener('click', () => { const w = out[+b.dataset.i]; RUN.deck.push(makeCard(w)); RUN.seen.push(w.h); speak(w.h); saveRun(); mapScreen(); }));
    $('#skip').addEventListener('click', mapScreen);
  }

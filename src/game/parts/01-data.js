  // ───────────── Course data ─────────────
  const LESSON_IDS = B.LESSONS.map(l => l.id);
  const WORDS = [];
  for (const l of LESSON_IDS) for (const line of B.VOCAB_RAW[l].trim().split('\n')) {
    const [tier, h, p, pos, e] = line.split('|');
    if (tier === 'N') continue;
    WORDS.push({ l, tier, h, p, pos: pos.split(',')[0].trim(), e, syl: (B.SYL || {})[l + '|' + h] || null });
  }
  const wordOf = h => WORDS.find(w => w.h === h);
  const DRILLS = B.GRAMMAR.flatMap(g => g.drills.filter(d => d.t === 'mc' || d.t === 'pick').map(d => Object.assign({ l: g.l, gtitle: g.title }, d)));
  const sentPy = s => (B.SENT_PY && B.SENT_PY[s]) || '';
  const frag = s => (B.FRAG_PY && B.FRAG_PY[s]) || ({ '。': '.', '！': '!', '？': '?', '，': ',' }[s] || s);
  const PATHS = [
    { id: 'u34', label: 'Units 3–4', sub: 'Time, birthdays, food · Thursday prep', lessons: ['3.1', '3.2', '4.1', '4.2'], bosses: ['dragon', 'chef'] },
    { id: 'u12', label: 'Units 1–2', sub: 'Greetings, family, jobs', lessons: ['1.1', '1.2', '2.1', '2.2'], bosses: ['grandma', 'dragon'] },
    { id: 'all', label: 'Everything', sub: 'All of Units 1–4', lessons: LESSON_IDS.slice(), bosses: ['grandma', 'chef'] },
  ];

  // Conversation lines from the language-partner practice sheets, each with its best reply.
  // English for conversation lines: from the phrase lists, the role-play cues' model answers, and PARTNER_EN.
  const LINE_EN = Object.assign({}, B.PARTNER_EN || {});
  (function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.zh && o.en && !LINE_EN[o.zh]) LINE_EN[o.zh] = o.en; Object.values(o).forEach(walk); } })(B.PARTNER || []);
  const TALKS = [];
  for (const P of B.PARTNER || []) {
    const resolve = a => {
      if (!a.startsWith('@')) return { zh: a, py: sentPy(a) };
      const m = P.mine.find(x => x.id === a.slice(1));
      if (!m || m.parts.some(p => typeof p !== 'string' && p.text)) return null;
      let zh = ''; const py = [];
      for (const p of m.parts) { const z = typeof p === 'string' ? p : m.slots[p.s][0][0]; zh += z; py.push(frag(z)); }
      const s = py.join(' ').replace(/\s+([,.?!])/g, '$1').replace(/\s+/g, ' ').trim();
      return { zh, py: s.charAt(0).toUpperCase() + s.slice(1) };
    };
    const turns = [];
    for (const r of P.roles) for (const t of r.turns) if (t.p) { const a = resolve(t.a); if (a) turns.push({ p: t.p, cue: t.cue, a }); }
    for (const m of P.mine) { const a = resolve('@' + m.id); if (a && !turns.some(t => t.p === m.q)) turns.push({ p: m.q, cue: 'Answer about yourself: ' + m.en.toLowerCase() + '.', a }); }
    for (const t of turns) TALKS.push({ unit: P.n, p: t.p, py: sentPy(t.p), cue: t.cue, a: t.a, others: turns.filter(o => o.a.zh !== t.a.zh).map(o => o.a) });
  }


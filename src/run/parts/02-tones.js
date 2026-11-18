  // ───────────── Pinyin tone helpers (for the tone question) ─────────────
  const MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
  const plain = s => s.normalize('NFD').replace(/[̀́̄̌]/g, '').normalize('NFC');
  function markTone(syl, t) {
    const base = plain(syl); if (t === 5 || !t) return base;
    const low = base.toLowerCase(); let i = low.indexOf('a'); if (i < 0) i = low.indexOf('e'); if (i < 0 && low.includes('ou')) i = low.indexOf('o');
    if (i < 0) { for (let k = low.length - 1; k >= 0; k--) if ('aeiouü'.includes(low[k])) { i = k; break; } }
    if (i < 0) return base;
    const ch = MARKS[low[i]][t - 1]; const out = base[i] !== low[i] ? ch.toUpperCase() : ch;
    return base.slice(0, i) + out + base.slice(i + 1);
  }
  function toneVariants(w, n) {
    if (!w.syl) return [];
    const seen = new Set([w.p]); const out = [];
    for (let tries = 0; tries < 40 && out.length < n; tries++) {
      let p = w.p; const k = rint(0, w.syl.length - 1); const [seg, t] = w.syl[k];
      const idx = p.indexOf(seg); if (idx < 0) continue;
      p = p.slice(0, idx) + markTone(seg, pick([1, 2, 3, 4].filter(x => x !== t))) + p.slice(idx + seg.length);
      if (w.syl.length > 1 && Math.random() < 0.5) { const [s2, t2] = w.syl[(k + 1) % w.syl.length]; const i2 = p.indexOf(s2); if (i2 >= 0) p = p.slice(0, i2) + markTone(s2, pick([1, 2, 3, 4].filter(x => x !== t2))) + p.slice(i2 + s2.length); }
      if (!seen.has(p)) { seen.add(p); out.push(p); }
    }
    return out;
  }
  const typed = s => plain(s).toLowerCase().replace(/v/g, 'ü').replace(/[^a-zü]/g, '');


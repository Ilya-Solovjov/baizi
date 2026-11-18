  // ───────────── Questions ─────────────
  function modal(html) { const ov = document.createElement('div'); ov.className = 'overlay q-overlay'; ov.innerHTML = '<div class="qbox">' + html + '</div>'; document.body.appendChild(ov); return ov; }
  function distractors(c, field, n) {
    const same = shuffle(WORDS.filter(w => w.h !== c.h && w.pos === c.pos && RUN.lessons.includes(w.l)));
    const any = shuffle(WORDS.filter(w => w.h !== c.h && RUN.lessons.includes(w.l)));
    const out = []; const val = w => field === 'e' ? short(w.e) : w[field];
    for (const w of same.concat(any)) { const v = val(w); if (v !== val(c) && !out.includes(v)) out.push(v); if (out.length >= n) break; }
    return out;
  }
  function questionMode(c) {
    const lvl = c.up ? 3 : c.xp; const w = wordOf(c.h) || {};
    if (lvl === 0) return 'meaning';
    if (lvl === 1) return 'pinyin';
    if (lvl === 2) return w.syl && toneVariants(w, 3).length >= 2 ? 'tones' : 'pinyin';
    const modes = ['reverse', 'type']; if (tts.ok && tts.voice && META.voice) modes.push('listen');
    return pick(modes);
  }
  const QLABEL = { meaning: 'What does it mean?', pinyin: 'How do you say it?', tones: 'Which tones are right?', reverse: 'Which characters?', type: 'Type the pinyin (tone marks optional)', listen: 'Listen. What does it mean?' };
  // Ask about a card; resolves true/false. `force` picks the question type.
  function castQuestion(c, force, speaking) {
    const mode = force || questionMode(c); const w = wordOf(c.h) || c;
    let opts = null, right;
    if (mode === 'meaning' || mode === 'listen') { right = short(c.e); opts = shuffle([right].concat(distractors(c, 'e', 3))); }
    else if (mode === 'pinyin') { right = c.p; opts = shuffle([right].concat(distractors(c, 'p', 3))); }
    else if (mode === 'tones') { right = c.p; opts = shuffle([right].concat(toneVariants(w, 3))); }
    else if (mode === 'reverse') { right = c.h; opts = shuffle([right].concat(distractors(c, 'h', 3))); }
    else right = c.p;
    debug.right = right; debug.mode = mode;
    const prompt = mode === 'reverse' ? '<div class="q-en">' + esc(short(c.e)) + '</div>' : mode === 'listen' ? '<button class="listen-btn" id="replay" aria-label="Play the word again">▶ Play again</button>' : '<div class="q-han">' + esc(c.h) + '</div>';
    return new Promise(res => {
      const d = def(c), spent = kwOf(c).includes('Spent');
      const head = speaking ? '<b>说 Speak.</b> Type it from memory. Right: it plays twice, then it’s Spent for this fight.' : TYPES[d.t] + ' · ' + describe(c, true) + (c.cracked ? ' · <b>Cracked: answer right to repair it</b>' : '');
      const ov = modal('<div class="q-kind t-' + d.t + '">' + head + '</div>' + prompt + '<p class="q-ask">' + QLABEL[mode] + '</p>' +
        (opts ? '<div class="q-opts">' + opts.map((o, i) => '<button data-o="' + esc(o) + '"><span class="k">' + (i + 1) + '</span><span class="' + (mode === 'reverse' ? 'han big' : '') + '">' + esc(o) + '</span></button>').join('') + '</div>'
          : '<form class="q-type" id="qtype"><input id="qin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="pinyin, e.g. ni hao" aria-label="Pinyin"><button class="btn primary" type="submit">Play</button><button class="ghost" type="button" id="dunno">I don’t know</button></form>') +
        '<div class="q-fb" aria-live="polite"></div>');
      if (mode === 'listen') { speak(c.h, true); $('#replay', ov).addEventListener('click', () => speak(c.h, true)); }
      let done = false, key = () => { };
      const finish = ok => {
        done = true;
        $('.q-fb', ov).innerHTML = '<span class="han">' + esc(c.h) + '</span> <span class="py">' + esc(c.p) + '</span> · ' + esc(short(c.e)) + (ok ? '' : '<br><b class="bad">' + (speaking ? 'It plays once at half strength and cracks.' : spent ? 'Half effect.' : 'Half effect, and the card cracks: it comes back next turn.') + '</b>');
        sfx(ok ? 'good' : 'bad'); if (mode !== 'listen') speak(c.h); noteWord(c.h, ok);
        setTimeout(() => { ov.remove(); document.removeEventListener('keydown', key); res(ok); }, ok ? 750 : 1900);
      };
      if (opts) {
        const choose = b => {
          if (done) return; const ok = b.dataset.o === right;
          $$('.q-opts button', ov).forEach(x => { x.disabled = true; if (x.dataset.o === right) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
          finish(ok);
        };
        $$('.q-opts button', ov).forEach(b => b.addEventListener('click', () => choose(b)));
        key = e => { const i = +e.key - 1; const b = $$('.q-opts button', ov)[i]; if (b) { e.preventDefault(); choose(b); } };
        document.addEventListener('keydown', key);
      } else {
        const inp = $('#qin', ov); setTimeout(() => inp.focus(), 50);
        $('#qtype', ov).addEventListener('submit', e => { e.preventDefault(); if (done || !inp.value.trim()) return; const ok = typed(inp.value) === typed(c.p); inp.disabled = true; inp.classList.add(ok ? 'right' : 'wrong'); finish(ok); });
        $('#dunno', ov).addEventListener('click', () => { if (done) return; inp.disabled = true; finish(false); });
      }
    });
  }
  function optionsQuestion(header, body, opts, rightIdx, onDone, delays = [1300, 2400]) {
    return new Promise(res => {
      const order = shuffle(opts.map((_, i) => i));
      debug.right = opts[rightIdx].zh || opts[rightIdx]; debug.mode = 'options';
      const ov = modal(header + body + '<div class="q-opts">' + order.map((oi, i) => { const o = opts[oi]; return '<button data-oi="' + oi + '" data-o="' + esc(o.zh || o) + '"><span class="k">' + (i + 1) + '</span><span><span class="han">' + esc(o.zh || o) + '</span>' + (o.py ? '<br><small class="py">' + esc(o.py) + '</small>' : '') + '</span></button>'; }).join('') + '</div><div class="q-fb" aria-live="polite"></div>');
      let done = false;
      const choose = b => {
        if (done) return; done = true; const ok = +b.dataset.oi === rightIdx;
        $$('.q-opts button', ov).forEach(x => { x.disabled = true; if (+x.dataset.oi === rightIdx) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
        $('.q-fb', ov).innerHTML = onDone(ok); sfx(ok ? 'good' : 'bad');
        setTimeout(() => { ov.remove(); document.removeEventListener('keydown', key); res(ok); }, ok ? delays[0] : delays[1]);
      };
      $$('.q-opts button', ov).forEach(b => b.addEventListener('click', () => choose(b)));
      const key = e => { const i = +e.key - 1; const b = $$('.q-opts button', ov)[i]; if (b) { e.preventDefault(); choose(b); } };
      document.addEventListener('keydown', key);
      const en = $('#showEn', ov); if (en) en.addEventListener('click', () => { $('#enHint', ov).hidden = false; en.hidden = true; });
      const rp = $('#replayTalk', ov); if (rp) rp.addEventListener('click', () => speak(rp.dataset.say, true));
    });
  }
  function askQuestion(enemy, dmg) {
    const P = DRILLS.filter(d => RUN.lessons.includes(d.l)); const d = pick(P.length ? P : DRILLS);
    const header = '<div class="q-kind k-ask-enemy"><b class="han">' + esc(enemy.zh) + '</b> quizzes you on grammar! Answer right to block ' + dmg + ' damage.</div>';
    const body = '<p class="q-ask">' + esc(d.en) + '</p>' + (d.q ? '<div class="q-sent han">' + esc(d.q).replace(/＿/g, '<span class="blank">　</span>') + '</div>' + (sentPy(d.q) && !d.nopy ? '<div class="py small">' + esc(sentPy(d.q)).replace(/＿/g, '___') + '</div>' : '') : '');
    return optionsQuestion(header, body, d.opts.map(o => ({ zh: o })), d.a, ok => {
      const full = d.q && d.q.includes('＿') ? d.q.replace('＿', d.opts[d.a]) : d.opts[d.a]; if (/[一-鿿]/.test(full)) speak(full.replace(/^[AB]: /, ''));
      RUN.log['§' + d.gtitle] = RUN.log['§' + d.gtitle] || { r: 0, w: 0 }; ok ? RUN.log['§' + d.gtitle].r++ : RUN.log['§' + d.gtitle].w++;
      return (ok ? '<b class="good">Blocked!</b> ' : '<b class="bad">Ouch.</b> ') + esc(d.why || '') + '<div class="small muted">Pattern: ' + esc(d.gtitle) + '</div>';
    });
  }
  function talkQuestion(enemy, dmg, intro) {
    const units = [...new Set(RUN.lessons.map(l => +l[0]))];
    const P = TALKS.filter(t => units.includes(t.unit)); const t = pick(P.length ? P : TALKS);
    const wrong = shuffle(t.others).filter((o, i, a) => a.findIndex(x => x.zh === o.zh) === i && o.zh !== t.a.zh).slice(0, 2);
    const header = '<div class="q-kind k-talk">' + (intro || '<b class="han">' + esc(enemy.zh) + '</b> starts a conversation! Pick the best reply to block ' + dmg + ' damage.') + '</div>';
    const body = '<div class="talk-line"><span class="eyebrow">' + esc(enemy.zh) + ' says</span><div class="row center"><span class="han q-sent">' + esc(t.p) + '</span><button class="say" id="replayTalk" data-say="' + esc(t.p) + '" aria-label="Play again">▶</button></div><div class="py small">' + esc(t.py) + '</div>' +
      '<button class="linkish" id="showEn" type="button">Hint</button><div id="enHint" class="small muted" hidden>' + esc(t.cue) + '</div></div><p class="q-ask">Your reply:</p>';
    setTimeout(() => speak(t.p), 200);
    RUN.stats.talks++;
    return optionsQuestion(header, body, [t.a].concat(wrong), 0, ok => {
      if (ok) RUN.stats.talksRight++;
      speak(t.a.zh);
      RUN.log['¶' + t.p] = RUN.log['¶' + t.p] || { r: 0, w: 0 }; ok ? RUN.log['¶' + t.p].r++ : RUN.log['¶' + t.p].w++;
      return (ok ? '<b class="good">Nice reply!</b>' : '<b class="bad">Not the best reply.</b> A good answer: <span class="han">' + esc(t.a.zh) + '</span>') + '<div class="small muted">From the language-partner practice sheets.</div>';
    }, [1400, 2800]);
  }


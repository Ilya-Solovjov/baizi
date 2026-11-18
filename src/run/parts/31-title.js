  // ───────────── Title + album ─────────────
  function albumCounts() {
    const uniq = [...new Set(WORDS.filter(w => w.tier !== 'O').map(w => w.h))];
    return { total: uniq.length, seen: uniq.filter(h => META.words[h]).length, mastered: uniq.filter(h => mastered(META.words[h])).length };
  }
  function title() {
    F = null;
    const A = albumCounts();
    root.innerHTML =
      '<section class="title-screen">' +
        '<div class="title-mark">' + sealMark('夜市', 'xl') + '</div>' +
        '<h1>Night Market Run</h1>' +
        '<p class="lead">A deckbuilding roguelike for Modern Chinese 1A. Every card is a word from the course; to play one, answer a question about it. Climb two acts and beat both bosses.</p>' +
        (RUN ? '<button class="btn primary big" id="continue">Continue · act ' + RUN.act + ', floor ' + (RUN.floor + 1) + '</button>' : '') +
        '<div class="paths">' + PATHS.map(p => '<button class="path-btn" data-path="' + p.id + '"><b>' + esc(p.label) + '</b><span>' + esc(p.sub) + '</span><span class="boss-line">Bosses: ' + p.bosses.map(b => '<span class="han">' + ENEMIES[b].zh + '</span>').join(' → ') + '</span></button>').join('') + '</div>' +
        '<button class="album-btn" id="album"><span class="album-bar"><i style="width:' + Math.round(100 * A.mastered / A.total) + '%"></i><i class="seen" style="width:' + Math.round(100 * (A.seen - A.mastered) / A.total) + '%"></i></span><span><b>Word album</b> · ' + A.mastered + ' mastered · ' + A.seen + ' seen · ' + A.total + ' words</span></button>' +
        '<details class="howto"><summary>How to play</summary><ul>' +
          '<li><b>Cards are words.</b> Tap a card and answer a question about it. Right: full effect. Wrong: half effect, and the card <b>cracks</b> and comes straight back so you can fix it.</li>' +
          '<li><b>Questions get harder as a card levels up:</b> meaning → pinyin → tones → typing, listening or picking characters. Three right answers master a card (熟): it upgrades, and you can <b>Speak</b> it (说 button) for a double play.</li>' +
          '<li><b>Grammar drives the builds.</b> Verbs build <b>Flow</b> that 了 cashes in. Numbers build <b>Count</b> that measure words spend as multi-hits. Adjectives <b>Fluster</b> (damage over time) and 很 / 真 / 太 multiply it. Nouns stack Block and 是 hits for your Block. 因为 / 都 / 们 make the next card play twice. Helping verbs give Strength.</li>' +
          '<li><b>Keywords:</b> Keep stays in hand · Fleeting is Spent if unplayed · Spent leaves for the fight · Echo plays twice · Opener starts in hand · Powers last all fight.</li>' +
          '<li><b>Grammar combos:</b> play words in natural order (想 → 吃, 很 → 好, 两 → 个, 吃 → 了) for a bonus. Gold-edged cards combo.</li>' +
          '<li><b>Enemies talk.</b> 问 Quiz asks a grammar question and 说 Talk says a line from your partner sheets: answer right and you take no damage.</li>' +
          '<li>3 energy a turn; Block resets each turn. Map: 战 fight · 精 elite · 茶 rest · 店 shop · 问 event · 宝 treasure · 王 boss.</li></ul></details>' +
        '<div class="title-foot"><label><input type="checkbox" id="snd"' + (META.sound ? ' checked' : '') + '> Sound</label><label><input type="checkbox" id="vc"' + (META.voice ? ' checked' : '') + '> Read words aloud</label><span class="muted small">Runs ' + META.runs + ' · wins ' + META.wins + ' · best floor ' + META.bestFloor + '</span></div>' +
      '</section>';
    const c = $('#continue'); if (c) c.addEventListener('click', mapScreen);
    $$('[data-path]').forEach(b => b.addEventListener('click', () => { if (RUN && !confirmNew(b)) return; newRun(b.dataset.path); openingPick(); }));
    $('#album').addEventListener('click', album);
    $('#snd').addEventListener('change', e => { META.sound = e.target.checked; saveMeta(); });
    $('#vc').addEventListener('change', e => { META.voice = e.target.checked; saveMeta(); });
  }
  function confirmNew(b) {
    if (b.dataset.armed) return true;
    $$('[data-armed]').forEach(x => { delete x.dataset.armed; x.classList.remove('armed'); });
    b.dataset.armed = '1'; b.classList.add('armed'); b.querySelector('span').textContent = 'Tap again to abandon your current run';
    return false;
  }
  function album() {
    const A = albumCounts();
    root.innerHTML = '<section class="album"><div class="sheet-head"><div><p class="eyebrow">Across all your runs</p><h2>Word album</h2></div><button class="ghost" id="back">Back</button></div>' +
      '<p class="muted">' + A.mastered + ' mastered (right 3+ times with 75%+ accuracy) · ' + A.seen + ' seen · ' + A.total + ' total. Tap a word to hear it.</p>' +
      '<div class="album-legend"><span><i class="t-un"></i>Not met yet</span><span><i class="t-seen"></i>Seen</span><span><i class="t-weak"></i>Needs review</span><span><i class="t-mast"></i>Mastered</span></div>' +
      '<div id="albumInfo" class="album-info" aria-live="polite">Tap a word.</div>' +
      B.LESSONS.map(L => {
        const ws = WORDS.filter(w => w.l === L.id && w.tier !== 'O').filter((w, i, a) => a.findIndex(x => x.h === w.h) === i);
        return '<div class="album-lesson"><h3><span class="tag">' + L.id + '</span> ' + esc(L.title) + '</h3><div class="tiles">' + ws.map(w => { const m = META.words[w.h]; const cls = !m ? 't-un' : mastered(m) ? 't-mast' : m.w > m.r ? 't-weak' : 't-seen'; return '<button class="tile ' + cls + '" data-h="' + esc(w.h) + '">' + esc(w.h) + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</section>';
    $('#back').addEventListener('click', title);
    $$('.tile').forEach(t => t.addEventListener('click', () => { const w = wordOf(t.dataset.h); const m = META.words[w.h]; speak(w.h, true); $('#albumInfo').innerHTML = '<b class="han">' + esc(w.h) + '</b> <span class="py">' + esc(w.p) + '</span> · ' + esc(w.e) + ' <span class="muted small">(' + TYPES[T[tplId(w)].t] + (T[tplId(w)].a ? ' · ' + ARCH[T[tplId(w)].a].en : '') + ' card' + (m ? ' · ' + m.r + ' right, ' + m.w + ' missed' : '') + ')</span>'; }));
  }


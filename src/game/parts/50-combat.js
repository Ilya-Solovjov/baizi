  // ───────────── Combat ─────────────
  let F = null;
  function combat(eid) {
    const E = ENEMIES[eid]; const act = RUN.act;
    const normal = !E.boss && !E.elite;
    const scale = (normal ? 1.1 : 1) * (act === 2 && !E.boss && !E.act ? 1.45 : 1) * (E.elite && spice(3) ? 1.2 : 1) * (E.boss && spice(4) ? 1.1 : 1) * (normal && spice(7) ? 1.15 : 1);
    const hp = Math.round((rint(E.hp[0], E.hp[1]) + (E.boss ? 0 : Math.floor(RUN.floor * 1.5))) * scale);
    F = { eid, E, ehp: hp, emax: hp, eblock: 0, estr: (act === 2 && !E.boss ? 2 : 0) + (E.elite && spice(3) ? 1 : 0), dmgMult: 1.15 + (normal && spice(2) ? 0.1 : 0) + (E.boss && spice(4) ? 0.1 : 0), evuln: 0, eweak: 0, fluster: 0, mi: 0, turn: 0,
      draw: shuffle(RUN.deck.map(c => c.uid)), hand: [], disc: [], exh: [], junk: {}, energy: 3, block: 0, str: 0, pweak: 0, vigor: 0,
      flow: 0, count: 0, tongue: 0, echo: 0, echoVerb: 0, fdouble: false, dblTurn: false, firstAtk: true, firstCard: true, busy: false, enraged: false,
      played: [], spent: 0, pw: {}, next: { block: 0, energy: 0, draw: 0 } };
    RUN.deck.forEach(c => { c.cracked = false; });
    // Openers go on top of the draw pile (the end of the array is the top).
    const op = F.draw.filter(u => kwOf(card(u)).includes('Opener')); F.draw = F.draw.filter(u => !op.includes(u)).concat(op);
    if (RUN.relics.includes('dumpling')) F.block = 8;
    if (RUN.relics.includes('abacus')) F.count = 4;
    if (RUN.relics.includes('gong')) F.str = 1;
    if (E.boss) bossIntro(E).then(startTurn); else startTurn();
  }
  function bossIntro(E) {
    return new Promise(res => {
      sfx('boss');
      const ov = document.createElement('div'); ov.className = 'overlay boss-intro';
      ov.innerHTML = '<div class="boss-card">' + art(E.art) + '<p class="eyebrow">Act ' + RUN.act + ' boss</p><h1><span class="han">' + esc(E.zh) + '</span></h1><p class="lead">' + esc(E.en) + '</p><p class="small muted">Tap to begin</p></div>';
      document.body.appendChild(ov); speak(E.zh);
      const go = () => { if (!document.body.contains(ov)) return; ov.remove(); res(); };
      ov.addEventListener('click', go); setTimeout(go, reduced() ? 600 : 2600);
    });
  }
  const card = uid => uid < 0 ? F.junk[uid] : RUN.deck.find(c => c.uid === uid);
  const lastPlayed = () => { const p = F && F.played[F.played.length - 1]; return p && p.ok ? p.c : null; };
  const lastPlayedCard = () => { const p = F && F.played[F.played.length - 1]; return p ? p.c : null; };
  function drawN(n) {
    for (let i = 0; i < n; i++) {
      if (!F.draw.length) { if (!F.disc.length) break; F.draw = shuffle(F.disc); F.disc = []; }
      if (F.hand.length >= 10) break;
      F.hand.push(F.draw.pop());
    }
  }
  function startTurn() {
    F.turn++;
    F.energy = 3 + (F.turn === 1 && RUN.relics.includes('lantern') ? 1 : 0) + F.next.energy;
    if (F.turn > 1 && !F.pw.keepBlock) F.block = RUN.relics.includes('jade') ? Math.min(F.block, 6) : 0;
    F.block += F.next.block;
    F.played = []; F.dblTurn = false; F.echo = 0; F.echoVerb = 0; F.fdouble = false;
    F.flow = (RUN.relics.includes('drum') ? 1 : 0) + (F.pw.flowStart || 0);
    F.count += F.pw.countStart || 0;
    F.str += F.pw.strTurn || 0;
    if (F.pw.flusterTurn) F.fluster += F.pw.flusterTurn + (RUN.relics.includes('pepper') ? 1 : 0);
    const n = 5 + (F.turn === 1 && RUN.relics.includes('fan') ? 1 : 0) + (RUN.relics.includes('scroll') ? 1 : 0) + F.next.draw;
    F.next = { block: 0, energy: 0, draw: 0 };
    drawN(n);
    renderFight();
  }
  const intent = () => F.E.moves[F.mi % F.E.moves.length];
  const edmg = v => Math.floor((v + F.estr) * F.dmgMult * (F.eweak ? 0.75 : 1));
  function incoming() { if (!F) return 0; const [t, v, n] = intent(); return t === 'atk' ? edmg(v) * (n || 1) : (t === 'ask' || t === 'talk') ? edmg(v) : 0; }
  function intentHTML() {
    const [t, v, n] = intent(); const dmg = edmg(v);
    const I = {
      atk: ['i-atk', 'Attack ' + dmg + (n ? ' ×' + n : ''), 'Will attack for ' + dmg + (n ? ', ' + n + ' times' : '') + '.'],
      ask: ['i-ask', '问 Quiz · ' + dmg, 'Will ask you a grammar question. Wrong answer: you take ' + dmg + '.'],
      talk: ['i-talk', '说 Talk · ' + dmg, 'Will say a line to you. Pick the wrong reply: you take ' + dmg + '.'],
      block: ['i-block', 'Block ' + v, 'Will gain ' + v + ' Block.'],
      str: ['i-buff', 'Strength +' + v, 'Will get stronger: +' + v + ' damage.'],
      heal: ['i-buff', 'Heal ' + v, 'Will heal ' + v + ' HP.'],
      curse: ['i-curse', 'Noise ×' + v, 'Will shuffle ' + v + ' Noise cards into your discard pile.'],
      weaken: ['i-curse', 'Weaken ' + v, 'Will make you Weak for ' + v + ' turns (you deal 25% less).'],
      calm: ['i-buff', 'Calm', 'Will shake off half its Fluster.'],
      tongue: ['i-curse', '舌 Tongue-tie ' + v, 'Will tie your tongue: your next ' + v + ' cards must be typed from memory (pinyin).'],
    }[t];
    const ic = { atk: 'sword', ask: 'ask', talk: 'talk', block: 'shield', str: 'up', heal: 'heart', curse: 'noise', weaken: 'down', tongue: 'talk', calm: 'heart' }[t];
    return '<span class="intent ' + I[0] + '" title="' + esc(I[2]) + '">' + icon(ic) + '<span>' + I[1] + '</span></span><span class="intent-cap">' + esc(I[2]) + '</span>';
  }
  function bar(cur, max, block, cls) { return '<div class="hpbar ' + cls + '"><i style="width:' + Math.max(0, 100 * cur / max) + '%"></i><span>' + (block ? '<b class="blk">' + block + '</b> ' : '') + Math.max(0, cur) + ' / ' + max + '</span></div>'; }
  const st = (cls, label, n, tip) => '<span class="st ' + cls + '" title="' + esc(tip) + '">' + label + (n != null ? ' <b>' + n + '</b>' : '') + '</span>';
  const PWLABEL = { strTurn: ['要', 'Strength each turn'], onVerbBlock: ['会', 'Block per verb'], onRight: ['喜欢', 'damage per right answer'], flowStart: ['来', 'Flow each turn'], onSpendBlock: ['学', 'Block per Spent card'], onSpendDraw: ['教', 'draw per Spent card'], onSpendDmg: ['请客', 'damage per Spent card'], onBlockDmg: ['做饭', 'damage per Block card'], keepBlock: ['还', 'Block stays'], endBlock: ['这', 'Block at end of turn'], flusterTurn: ['酸', 'Fluster each turn'], countStart: ['号', 'Count each turn'] };
  function renderFight(mood = {}) {
    const E = F.E, es = [], ps = [];
    if (F.fluster) es.push(st('fl', '慌 Fluster', F.fluster, 'Fluster: loses ' + F.fluster + ' HP at the end of your turn, then drops by 1'));
    if (F.evuln) es.push(st('vul', 'Vulnerable', F.evuln, 'Takes 50% more attack damage (' + F.evuln + ' turns)'));
    if (F.eweak) es.push(st('weak', 'Weak', F.eweak, 'Deals 25% less damage (' + F.eweak + ' turns)'));
    if (F.estr) es.push(st('str', 'Strength', F.estr, 'Extra damage on attacks'));
    if (F.str) ps.push(st('str', '力', F.str, 'Strength: +' + F.str + ' damage per hit'));
    if (F.flow) ps.push(st('flow', '势 Flow', F.flow, 'Flow: +1 per verb this turn. Resets at end of turn'));
    if (F.count) ps.push(st('count', '数 Count', F.count, 'Count: measure words spend it'));
    if (F.vigor) ps.push(st('str', '气', '+' + F.vigor, 'Your next Attack deals +' + F.vigor));
    if (F.echo) ps.push(st('echo', '回 Echo', F.echo, 'Your next ' + (F.echo > 1 ? F.echo + ' cards play' : 'card plays') + ' twice'));
    if (F.echoVerb) ps.push(st('echo', '一下', null, 'Your next verb plays twice'));
    if (F.fdouble) ps.push(st('fl', '很 ×2', null, 'Your next Fluster is doubled'));
    if (F.pweak) ps.push(st('weak', 'Weak', F.pweak, 'You deal 25% less damage'));
    if (F.tongue) ps.push(st('fl', '舌 Tongue-tied', F.tongue, 'Your next ' + F.tongue + ' cards must be typed from memory'));
    if (F.dblTurn) ps.push(st('str', '辣油 ×2', null, 'Chili oil: attacks deal double this turn'));
    for (const [k, v] of Object.entries(F.pw)) if (v && PWLABEL[k]) ps.push(st('pw', PWLABEL[k][0], k === 'keepBlock' ? null : v, 'Power: ' + (k === 'keepBlock' ? 'your Block stays between turns' : v + ' ' + PWLABEL[k][1])));
    const last = lastPlayed();
    const hint = F.tongue ? '<b>舌 Tongue-tied:</b> type the pinyin from memory for your next ' + (F.tongue > 1 ? F.tongue + ' cards' : 'card') + '.' : F.echo ? 'Your next card plays twice.' : F.fdouble ? 'Your next Fluster is doubled.' : last ? 'Last: <b class="han">' + esc(last.h) + '</b>' + (COMBOS.some(x => x.a === gcls(last)) ? ' · combos into ' + COMBOS.filter(x => x.a === gcls(last)).map(x => x.name.split(' + ')[1]).join(' / ') : '') : 'Gold-edged cards make a grammar combo with the card you just played.';
    root.innerHTML = topbar() +
      '<section class="fight' + (E.boss ? ' boss-fight' : '') + '">' +
        '<div class="arena">' +
          '<div class="fighter you' + (mood.you ? ' ' + mood.you : '') + '"><div class="sprite">' + art('you', mood.youFace || 'idle') + '</div><b class="name">You</b>' + bar(RUN.hp, RUN.maxHp, F.block, 'p') + '<div class="sts">' + ps.join('') + '</div></div>' +
          '<div class="fighter foe' + (E.boss ? ' boss' : E.elite ? ' elite' : '') + (mood.foe ? ' ' + mood.foe : '') + '"><div class="intent-wrap">' + intentHTML() + '</div><div class="sprite">' + art(E.art, mood.foeFace || 'idle') + '</div><b class="name"><span class="han">' + esc(E.zh) + '</span> ' + esc(E.en) + '</b>' + bar(F.ehp, F.emax, F.eblock, 'e') + '<div class="sts">' + es.join('') + '</div></div>' +
        '</div>' +
        '<div class="last-played">' + hint + '</div>' +
        '<div class="tray"><div class="energy" title="Energy" style="background-image:url(' + orbURL() + ')"><b>' + F.energy + '</b><span>energy</span></div>' +
          '<div class="hand">' + F.hand.map((u, i) => {
            const c = card(u), d = def(c), cost = costOf(c); const cb = !!comboFor(last, c) && d.t !== 'junk';
            return '<div class="hand-slot" style="--i:' + i + ';--n:' + F.hand.length + '"><button class="hand-card' + (d.t === 'junk' || cost > F.energy ? ' cant' : '') + (cb ? ' combo-ready' : '') + '" data-u="' + u + '" aria-label="' + esc(TYPES[d.t] + ' ' + c.h + ', cost ' + cost + (cb ? ', combo' : '')) + '">' + cardHTML(c, { live: true, combo: cb }) + '</button>' +
              '</div>';
          }).join('') + '</div>' +
          '<div class="piles"><span title="Draw pile">Draw <b>' + F.draw.length + '</b></span><span title="Discard pile">Discard <b>' + F.disc.length + '</b></span>' + (F.exh.length ? '<span title="Spent this fight">Spent <b>' + F.exh.length + '</b></span>' : '') + '<button class="btn primary" id="endTurn">End turn <kbd>E</kbd></button></div>' +
        '</div>' +
      '</section>';
    bindTop();
    $$('.hand-card').forEach(b => b.addEventListener('click', () => playCard(+b.dataset.u, b)));
    $('#endTurn').addEventListener('click', endTurn);
  }
  function floatNum(sel, text, cls) { const host = $(sel); if (!host) return; const s = document.createElement('span'); s.className = 'float ' + cls; s.textContent = text; host.appendChild(s); setTimeout(() => s.remove(), 1000); }
  function shake(big) { const a = $('.arena'); if (!a || reduced()) return; a.classList.remove('quake', 'quake-big'); void a.offsetWidth; a.classList.add(big ? 'quake-big' : 'quake'); }
  function flyCard(fromEl, c, toSel) {
    if (reduced() || !fromEl || !fromEl.animate || !document.body.contains(fromEl)) return Promise.resolve();
    const to = $(toSel); if (!to) return Promise.resolve();
    const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
    const clone = document.createElement('div'); clone.className = 'fly'; clone.innerHTML = cardHTML(c); document.body.appendChild(clone);
    clone.style.left = a.left + 'px'; clone.style.top = a.top + 'px';
    fromEl.style.visibility = 'hidden';
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = clone.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 40) + 'px) scale(.9)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.3)', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.4,0,.6,1)' });
    return new Promise(r => { anim.onfinish = () => { clone.remove(); r(); }; });
  }
  function hitEnemy(dmg) {
    if (F.evuln) dmg = Math.floor(dmg * 1.5);
    const absorbed = Math.min(F.eblock, dmg); F.eblock -= absorbed; F.ehp -= dmg - absorbed; RUN.stats.dmg += dmg - absorbed;
    return dmg - absorbed;
  }
  function hitPlayer(dmg) { const absorbed = Math.min(F.block, dmg); F.block -= absorbed; RUN.hp -= dmg - absorbed; return dmg - absorbed; }
  const isMeasure = c => ['tally', 'tallylite', 'portion'].includes(c.tid);
  // Per-hit attack damage before the enemy's Vulnerable.
  function atkValue(base, c, combo) {
    let v = Math.floor(base) + F.str + F.vigor + (combo && combo.bonus.dmg || 0) + (RUN.relics.includes('tally') && isMeasure(c) ? 1 : 0);
    if (F.pweak) v = Math.floor(v * 0.75);
    if (F.dblTurn) v *= 2;
    return Math.max(0, v);
  }
  function atkPreview(base, c) { let v = atkValue(base, c, comboFor(lastPlayed(), c)); if (F.evuln) v = Math.floor(v * 1.5); return v; }
  function lose(n, why) { if (n <= 0) return; F.ehp -= n; RUN.stats.dmg += n; floatNum('.foe .sprite', '-' + n + (why ? ' ' + why : ''), 'dmg'); }
  function spendCard(uid, silent) {
    F.hand = F.hand.filter(u => u !== uid);
    if (uid < 0) delete F.junk[uid]; else F.exh.push(uid);
    if (silent) return;
    F.spent++;
    if (F.pw.onSpendBlock) F.block += F.pw.onSpendBlock;
    if (RUN.relics.includes('incense')) F.block += 2;
    if (F.pw.onSpendDmg) lose(F.pw.onSpendDmg);
    if (F.pw.onSpendDraw) drawN(F.pw.onSpendDraw);
  }
  function pickModal(title, sub, cards, cancelable) {
    return new Promise(res => {
      if (!cards.length) { toastMsg('Nothing to pick.'); return res(null); }
      debug.pick = cards.map(c => c.uid);
      const ov = document.createElement('div'); ov.className = 'overlay q-overlay pick-ov';
      ov.innerHTML = '<div class="qbox wide"><p class="eyebrow">' + esc(sub) + '</p><h2>' + esc(title) + '</h2><div class="pick-row">' + cards.map(c => '<button class="pick" data-u="' + c.uid + '">' + cardHTML(c) + '</button>').join('') + '</div>' + (cancelable ? '<button class="ghost" id="pickNone">Skip</button>' : '') + '</div>';
      document.body.appendChild(ov);
      const done = v => { ov.remove(); res(v); };
      $$('.pick', ov).forEach(b => b.addEventListener('click', () => done(+b.dataset.u)));
      const n = $('#pickNone', ov); if (n) n.addEventListener('click', () => done(null));
    });
  }
  function chooseModal(title, options) {
    return new Promise(res => {
      debug.choose = options.map(o => o[0]);
      const ov = document.createElement('div'); ov.className = 'overlay q-overlay';
      ov.innerHTML = '<div class="qbox"><h2>' + esc(title) + '</h2><div class="q-opts">' + options.map((o, i) => '<button data-i="' + i + '"><span class="k">' + (i + 1) + '</span><span>' + esc(o[0]) + '</span></button>').join('') + '</div></div>';
      document.body.appendChild(ov);
      $$('button', ov).forEach(b => b.addEventListener('click', () => { ov.remove(); res(+b.dataset.i); }));
    });
  }
  // The action helpers a card's effect uses. m = 1 for a right answer, 0.5 for a wrong one.
  function actions(c, m, combo) {
    const sc = n => n <= 0 ? 0 : Math.max(1, Math.floor(n * m));
    const x = {
      m,
      async hit(base, hits = 1) {
        const per = atkValue(base * m, c, combo); let total = 0;
        for (let i = 0; i < hits; i++) total += hitEnemy(per);
        if (F.firstAtk) F.firstAtk = false;
        RUN.stats.best = Math.max(RUN.stats.best, total);
        sfx(total >= 15 ? 'big' : 'hit'); renderFight({ foe: 'hurt', you: 'lunge', foeFace: 'hurt' }); shake(total >= 15);
        floatNum('.foe .sprite', total ? '-' + total + (hits > 1 ? ' (' + hits + ' hits)' : '') : 'Blocked', total ? 'dmg' + (total >= 15 ? ' crit' : '') : 'blk');
        await sleep(hits > 1 ? 360 : 240);
        return total;
      },
      block(n, raw) {
        const b = raw ? n : sc(n) + (RUN.relics.includes('brush') ? 1 : 0) + (combo && combo.bonus.block || 0);
        if (b <= 0) return; F.block += b; sfx('block'); floatNum('.you .sprite', '+' + b + ' Block', 'blk');
        if (F.pw.onBlockDmg) lose(F.pw.onBlockDmg);
      },
      fluster(n, raw) {
        let f = raw ? n : sc(n) + (RUN.relics.includes('pepper') ? 1 : 0) + (combo && combo.bonus.fl || 0);
        if (!raw && F.fdouble) { f *= 2; F.fdouble = false; }
        if (f <= 0) return; F.fluster += f; floatNum('.foe .sprite', '慌 +' + f, 'fl');
      },
      count(n) { F.count += sc(n); },
      spendCount(max) { const k = Math.min(F.count, max); F.count -= k; return k; },
      flow(n) { F.flow += sc(n); },
      draw(n) { drawN(m < 1 ? Math.max(1, Math.floor(n / 2)) : n); },
      energy(n) { F.energy += n; },
      str(n) { F.str += sc(n); floatNum('.you .sprite', 'Strength +' + sc(n), 'str'); },
      weak(n) { F.eweak += sc(n); },
      vuln(n) { F.evuln += sc(n); },
      heal(n) { const h = Math.min(RUN.maxHp - RUN.hp, sc(n)); RUN.hp += h; if (h) floatNum('.you .sprite', '+' + h + ' HP', 'heal'); },
      loseHp(n) { lose(Math.floor(n * m)); },
      nextTurn(k, n) { F.next[k] += sc(n); },
      power(k, n) { F.pw[k] = (F.pw[k] || 0) + (m < 1 ? Math.max(1, Math.floor(n / 2)) : n); },
      handSize() { return F.hand.length; },
      async look(k) {
        const top = F.draw.slice(-k).reverse().map(card);
        const u = await pickModal('Put one in your hand', 'Top ' + top.length + ' of your draw pile', top, true);
        if (u != null && F.hand.length < 10) { F.draw = F.draw.filter(v => v !== u); F.hand.push(u); }
      },
      async fromDiscard() {
        const u = await pickModal('Take a card back', 'Your discard pile', F.disc.map(card).filter((c, i, a) => a.indexOf(c) === i), true);
        if (u != null && F.hand.length < 10) { F.disc = F.disc.filter(v => v !== u); F.hand.push(u); }
      },
      async choose(opts) { const i = await chooseModal('Choose one', opts); await opts[i][1](); },
      spendRandom() { const pool = F.hand.slice(); if (!pool.length) return 0; spendCard(pick(pool)); return 1; },
      spendAll(filter) { const list = F.hand.filter(u => !filter || filter(def(card(u)))); list.forEach(u => spendCard(u)); return list.length; },
      async replayLast() {
        const prev = F.played.slice(0, -1).reverse().find(p => p.c.tid !== 'also');
        if (!prev) return;
        toastMsg('也: ' + prev.c.h + ' again');
        await runEffect(prev.c, 1, null);
      },
    };
    return x;
  }
  async function runEffect(c, m, combo) {
    const d = def(c); await d.run(valsOf(c), actions(c, m, combo));
  }
  async function playCard(uid, el) {
    if (!F || F.busy) return; const c = card(uid); const d = def(c); const cost = costOf(c);
    const deny = msg => { if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } sfx('bad'); if (msg) toastMsg(msg); };
    if (d.t === 'junk') return deny('Noise can’t be played. It’s Spent at the end of your turn.');
    if (cost > F.energy) return deny('Not enough energy. End your turn to refill.');
    F.busy = true; sfx('card');
    const prev = lastPlayed();
    // Tongue-tied (an enemy debuff): this card has to be typed from memory.
    const speaking = F.tongue > 0; if (speaking) F.tongue--;
    const ok = await castQuestion(c, speaking ? 'type' : null, speaking);
    if (speaking && ok) RUN.stats.spoken++;
    if (!ok && RUN.asc >= 8) { RUN.hp = Math.max(1, RUN.hp - 2); floatNum('.you .sprite', '-2', 'dmg'); }
    const kws = kwOf(c);
    const combo = ok ? comboFor(prev, c) : null;
    if (ok && c.cracked) { c.cracked = false; F.block += 3; toastMsg('Repaired ' + c.h + ': +3 Block'); if (RUN.relics.includes('knot')) RUN.hp = Math.min(RUN.maxHp, RUN.hp + 3); }
    if (ok && !c.m) { c.xp++; if (c.xp >= 3) { c.m = true; toastMsg('Mastered ' + c.h + ' (熟): its questions are now the hardest kind.'); } }
    F.energy -= cost; F.hand = F.hand.filter(u => u !== uid);
    // How many times it plays.
    let plays = 1;
    if (ok && kws.includes('Echo')) plays++;
    if (F.echo > 0) { F.echo--; plays++; }
    if (isVerb(c) && F.echoVerb > 0) { F.echoVerb--; plays++; }
    if (F.firstCard && RUN.relics.includes('bell')) plays++;
    if (d.t === 'atk' && F.firstAtk && RUN.relics.includes('chopsticks')) plays++;
    plays = Math.min(plays, 2); if (plays > 1) RUN.stats.echoes++;
    F.firstCard = false;
    F.played.push({ c, ok });
    if (isVerb(c)) { F.flow++; if (F.pw.onVerbBlock) F.block += F.pw.onVerbBlock; }
    await flyCard(el, c, d.t === 'atk' ? '.foe .sprite' : '.you .sprite');
    if (combo) {
      RUN.stats.combos++; sfx('combo'); if (RUN.relics.includes('seal')) F.energy += 1;
      if (combo.bonus.count) F.count += combo.bonus.count; if (combo.bonus.flow) F.flow += combo.bonus.flow;
      const banner = document.createElement('div'); banner.className = 'combo-banner'; banner.setAttribute('role', 'status'); banner.innerHTML = '<span>Grammar combo</span><b class="han">' + esc(prev.h) + ' ' + esc(c.h) + '</b><small>' + esc(combo.name) + ' · ' + esc(combo.d) + '</small>'; document.body.appendChild(banner); setTimeout(() => banner.remove(), 1500);
    }
    if (plays > 1) floatNum('.you .sprite', 'Twice', 'echo');
    const vigorUsed = d.t === 'atk' && F.vigor;
    for (let i = 0; i < plays; i++) {
      await runEffect(c, ok ? 1 : 0.5, combo);
      if (F.ehp <= 0) break;
    }
    if (vigorUsed) F.vigor = 0;
    if (ok && F.pw.onRight) lose(F.pw.onRight);
    // Where the card goes.
    if (d.t === 'pow') F.exh.push(uid);
    else if (kws.includes('Spent')) spendCard(uid);
    else if (!ok) { c.cracked = true; F.draw.push(uid); }
    else F.disc.push(uid);
    if (speaking && ok && RUN.relics.includes('ink')) drawN(1);
    saveRun();
    await sleep(200);
    F.busy = false;
    if (F.ehp <= 0) return winFight();
    renderFight();
  }
  function usePotion(i) {
    const p = RUN.potions[i]; if (!p) return;
    if (!F || F.busy) { toastMsg(POTIONS[p].en + ': use it during a fight.'); return; }
    RUN.potions.splice(i, 1);
    if (p === 'tea') RUN.hp = Math.min(RUN.maxHp, RUN.hp + 12);
    if (p === 'oil') F.dblTurn = true;
    if (p === 'coffee') F.energy += 2;
    if (p === 'soymilk') F.block += 12;
    if (p === 'stick') drawN(3);
    if (p === 'vinegar') F.fluster += 10;
    if (p === 'wine') F.str += 3;
    sfx('good'); saveRun(); renderFight(); toastMsg(POTIONS[p].zh + ' ' + POTIONS[p].en + ': ' + POTIONS[p].d);
    if (p === 'tea') floatNum('.you .sprite', '+12 HP', 'heal');
  }
  async function endTurn() {
    if (!F || F.busy) return; F.busy = true;
    if (F.pw.endBlock) { F.block += F.pw.endBlock; floatNum('.you .sprite', '+' + F.pw.endBlock + ' Block', 'blk'); }
    // Keep stays, Fleeting is Spent, the rest is discarded.
    const keep = [];
    for (const u of F.hand.slice()) {
      const c = card(u), k = kwOf(c);
      if (k.includes('Keep')) keep.push(u);
      else if (k.includes('Fleeting')) spendCard(u);
      else F.disc.push(u);
    }
    F.hand = keep; if (F.pweak) F.pweak--;
    F.flow = 0; F.echo = 0; F.echoVerb = 0; F.fdouble = false;
    renderFight(); await sleep(220);
    if (F.fluster > 0) {
      lose(F.fluster, '慌'); F.fluster -= Math.max(1, Math.ceil(F.fluster / 4)); renderFight({ foe: 'hurt', foeFace: 'hurt' }); await sleep(380);
      if (F.ehp <= 0) { F.busy = false; return winFight(); }
    }
    const [t, v, n] = intent(); const E = F.E;
    const dmg = edmg(v);
    F.eblock = 0;
    if (t === 'atk') {
      for (let i = 0; i < (n || 1); i++) { const took = hitPlayer(dmg); sfx(took >= 12 ? 'big' : 'hit'); renderFight({ foe: 'lunge-l', you: 'hurt', youFace: 'hurt' }); shake(took >= 12); floatNum('.you .sprite', took ? '-' + took : 'Blocked', took ? 'dmg' : 'blk'); await sleep(420); if (RUN.hp <= 0) break; }
    } else if (t === 'ask' || t === 'talk') {
      const ok = await (t === 'ask' ? askQuestion(E, dmg) : talkQuestion(E, dmg));
      if (ok) { F.eweak += 1; renderFight({ foeFace: 'hurt' }); floatNum('.foe .sprite', 'Weak', 'blk'); }
      else { const took = hitPlayer(dmg); renderFight({ you: 'hurt', youFace: 'hurt' }); shake(took >= 12); floatNum('.you .sprite', took ? '-' + took : 'Blocked', took ? 'dmg' : 'blk'); }
      await sleep(400);
    } else if (t === 'block') { F.eblock += v; renderFight(); floatNum('.foe .sprite', '+' + v + ' Block', 'blk'); await sleep(350); }
    else if (t === 'str') { F.estr += v; renderFight({ foeFace: 'angry' }); floatNum('.foe .sprite', 'Strength +' + v, 'dmg'); await sleep(350); }
    else if (t === 'heal') { F.ehp = Math.min(F.emax, F.ehp + v); renderFight(); floatNum('.foe .sprite', '+' + v, 'heal'); await sleep(350); }
    else if (t === 'curse') { for (let i = 0; i < v; i++) { const id = JUID--; F.junk[id] = { uid: id, h: '乱', p: 'luàn', e: 'noise', pos: 'noise', tid: 'noise', up: false, xp: 0 }; F.disc.push(id); } renderFight(); floatNum('.you .sprite', '+' + v + ' Noise', 'dmg'); await sleep(400); }
    else if (t === 'calm') { const lost = Math.ceil(F.fluster / 2); F.fluster -= lost; renderFight(); floatNum('.foe .sprite', lost ? 'Calm −' + lost + ' 慌' : 'Calm', 'blk'); await sleep(380); }
    else if (t === 'tongue') { F.tongue += v; renderFight({ youFace: 'hurt' }); floatNum('.you .sprite', 'Tongue-tied', 'fl'); await sleep(400); }
    else if (t === 'weaken') { F.pweak += v; renderFight({ youFace: 'hurt' }); floatNum('.you .sprite', 'Weak ' + v, 'dmg'); await sleep(400); }
    if (E.boss && !F.enraged && F.ehp <= F.emax / 2) { F.enraged = true; F.estr += 3; toastMsg(E.zh + ' is enraged: 太生气了！ tài shēngqì le! (+3 Strength)'); }
    F.mi++; if (F.evuln) F.evuln--; if (F.eweak) F.eweak--;
    saveRun();
    F.busy = false;
    if (RUN.hp <= 0) return gameOver();
    startTurn();
  }

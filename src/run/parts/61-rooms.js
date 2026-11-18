  // ───────────── Teahouse, shop, events, treasure ─────────────
  function rest() {
    const heal = Math.floor(RUN.maxHp * 0.3);
    root.innerHTML = topbar() + '<section class="room"><div class="room-art">' + sealMark('茶') + '</div><h2>Teahouse</h2><p class="muted">Rest, or study one word until it sticks.</p>' +
      '<div class="room-opts"><button class="path-btn" id="sip"><b>喝茶 · Rest</b><span>Heal ' + heal + ' HP</span></button><button class="path-btn" id="study"><b>学习 · Study</b><span>Upgrade one card. Upgrades add effects, not just numbers</span></button></div></section>';
    bindTop();
    $('#sip').addEventListener('click', () => { RUN.hp = Math.min(RUN.maxHp, RUN.hp + heal); sfx('good'); advance(); });
    $('#study').addEventListener('click', () => pickCardScreen('Study a word', 'Pick a card to upgrade. Each shows its upgraded version.', c => !c.up && def(c).t !== 'junk', c => { c.up = true; c.xp = 3; speak(c.h, true); toastMsg(c.h + ' ' + c.p + ' · ' + short(c.e) + ': upgraded'); advance(); }, rest, true));
  }
  function pickCardScreen(titleTxt, sub, filter, onPick, back, preview) {
    const list = RUN.deck.filter(filter);
    root.innerHTML = topbar() + '<section class="room"><h2>' + esc(titleTxt) + '</h2><p class="muted">' + esc(sub) + '</p><div class="deck-grid' + (preview ? ' wide' : '') + '">' +
      list.map(c => '<button class="deck-item pickable' + (preview ? ' pair' : '') + '" data-u="' + c.uid + '">' + (preview ? '<span class="up-pair">' + cardHTML(c, { up: 0 }) + '<span class="arrow">→</span>' + cardHTML(c, { up: 1 }) + '</span>' : cardHTML(c)) + '<span class="small"><b class="han">' + esc(c.h) + '</b> ' + esc(c.p) + '<br><span class="muted">' + esc(short(c.e)) + '</span></span></button>').join('') + '</div><button class="ghost" id="back">Back</button></section>';
    bindTop();
    $$('.pickable').forEach(b => b.addEventListener('click', () => onPick(RUN.deck.find(x => x.uid === +b.dataset.u))));
    $('#back').addEventListener('click', back);
  }
  function shop() {
    if (!RUN.shopStock || RUN.shopStock.at !== RUN.next) {
      RUN.shopStock = { at: RUN.next, cards: cardChoices(4, true).map(w => ({ h: w.h, l: w.l, price: { C: rint(40, 52), U: rint(65, 80), R: rint(120, 145) }[T[tplId(w)].r], sold: false })), relic: randomRelic() || null, relicPrice: rint(95, 120), relicSold: false, potion: pick(Object.keys(POTIONS)), potionPrice: rint(25, 35), potionSold: false, removed: false };
      saveRun();
    }
    const S = RUN.shopStock;
    const wOf = it => WORDS.find(x => x.h === it.h && x.l === it.l) || wordOf(it.h);
    root.innerHTML = topbar() + '<section class="room"><div class="room-art">' + sealMark('店') + '</div><h2>Shop</h2><p class="muted">Word cards, relics and drinks. You have <b class="coin-txt">' + RUN.coins + ' coins</b>.</p>' +
      '<div class="choices">' + S.cards.map((it, i) => { const w = wOf(it); const c = makeCard(w); return '<button class="choice' + (it.sold ? ' sold' : '') + '" data-ci="' + i + '"' + (it.sold || RUN.coins < it.price ? ' disabled' : '') + '>' + cardHTML(c) + '<span class="choice-info"><b class="han">' + esc(w.h) + '</b> <span class="py">' + esc(w.p) + '</span><br>' + esc(short(w.e)) + '<br><b class="price">' + (it.sold ? 'Sold' : it.price + ' coins') + '</b></span></button>'; }).join('') + '</div>' +
      '<div class="room-opts">' + (S.relic ? '<button class="path-btn" id="buyRelic"' + (S.relicSold || RUN.coins < S.relicPrice ? ' disabled' : '') + '><b><span class="han">' + RELICS[S.relic].zh + '</span> ' + RELICS[S.relic].en + '</b><span>' + esc(RELICS[S.relic].d) + ' · ' + (S.relicSold ? 'Sold' : S.relicPrice + ' coins') + '</span></button>' : '') +
      '<button class="path-btn" id="buyPotion"' + (S.potionSold || RUN.coins < S.potionPrice || RUN.potions.length >= 2 ? ' disabled' : '') + '><b><span class="han">' + POTIONS[S.potion].zh + '</span> ' + POTIONS[S.potion].en + '</b><span>' + esc(POTIONS[S.potion].d) + ' · ' + (S.potionSold ? 'Sold' : RUN.potions.length >= 2 ? 'Potion slots full' : S.potionPrice + ' coins') + '</span></button>' +
      '<button class="path-btn" id="remove"' + (S.removed || RUN.coins < 60 || RUN.deck.length <= 5 ? ' disabled' : '') + '><b>扔 · Remove a card</b><span>Thin your deck so your best cards come up more · 60 coins</span></button></div>' +
      '<button class="btn primary" id="leave">Leave the shop</button></section>';
    bindTop();
    $$('[data-ci]').forEach(b => b.addEventListener('click', () => { const it = S.cards[+b.dataset.ci]; if (it.sold || RUN.coins < it.price) return; RUN.coins -= it.price; it.sold = true; const w = wOf(it); RUN.deck.push(makeCard(w)); RUN.seen.push(w.h); speak(w.h); sfx('good'); saveRun(); shop(); }));
    const br = $('#buyRelic'); if (br) br.addEventListener('click', () => { if (S.relicSold || RUN.coins < S.relicPrice) return; RUN.coins -= S.relicPrice; S.relicSold = true; gainRelic(S.relic); sfx('good'); saveRun(); shop(); });
    $('#buyPotion').addEventListener('click', () => { if (S.potionSold || RUN.coins < S.potionPrice || RUN.potions.length >= 2) return; RUN.coins -= S.potionPrice; S.potionSold = true; RUN.potions.push(S.potion); sfx('good'); saveRun(); shop(); });
    $('#remove').addEventListener('click', () => pickCardScreen('Remove a card', 'Pick a card to remove from your deck.', () => true, c => { RUN.coins -= 60; S.removed = true; RUN.deck = RUN.deck.filter(x => x.uid !== c.uid); saveRun(); shop(); }, shop));
    $('#leave').addEventListener('click', () => { RUN.shopStock = null; advance(); });
  }
  function eventFrame(sign, titleTxt, lead, extra) {
    root.innerHTML = topbar() + '<section class="room event"><div class="room-art">' + sealMark(sign) + '</div><h2>' + titleTxt + '</h2><p class="muted" style="max-width:52ch">' + lead + '</p>' + (extra || '') + '<div class="q-fb"></div></section>';
    bindTop();
  }
  function fortuneEvent() {
    const units = [...new Set(RUN.lessons.map(l => +l[0]))];
    const qs = (B.CULTURE || []).filter(c => units.includes(c.u)); const q = pick(qs.length ? qs : B.CULTURE);
    const order = shuffle(q.opts.map((_, i) => i));
    const prize = pick([['coins', 35, '+35 coins'], ['heal', 15, 'heal 15 HP'], ['maxhp', 5, '+5 max HP'], ['potion', 1, 'a free potion']]);
    debug.right = q.opts[q.a]; debug.mode = 'event';
    eventFrame('卦', 'A fortune teller stops you', '“Answer my riddle about China,” she says. Right: <b>' + prize[2] + '</b>. Wrong: lose 6 HP.',
      '<p class="q-ask" style="max-width:40ch;margin:0 auto">' + esc(q.q) + '</p><div class="q-opts">' + order.map((oi, i) => '<button data-oi="' + oi + '" data-o="' + esc(q.opts[oi]) + '"><span class="k">' + (i + 1) + '</span><span>' + esc(q.opts[oi]) + '</span></button>').join('') + '</div>');
    let done = false;
    $$('.q-opts button').forEach(b => b.addEventListener('click', () => {
      if (done) return; done = true; const ok = +b.dataset.oi === q.a;
      $$('.q-opts button').forEach(x => { x.disabled = true; if (+x.dataset.oi === q.a) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
      if (ok) { if (prize[0] === 'coins') RUN.coins += prize[1]; if (prize[0] === 'heal') RUN.hp = Math.min(RUN.maxHp, RUN.hp + prize[1]); if (prize[0] === 'maxhp') { RUN.maxHp += 5; RUN.hp += 5; } if (prize[0] === 'potion') gainPotion(); sfx('good'); }
      else { RUN.hp = Math.max(1, RUN.hp - 6); sfx('bad'); }
      saveRun(); bindTop();
      $('.q-fb').innerHTML = (ok ? '<b class="good">Correct! You get ' + prize[2] + '.</b> ' : '<b class="bad">Not quite. −6 HP.</b> ') + esc(q.why) + '<div><button class="btn primary" id="on">Continue</button></div>';
      $('#on').addEventListener('click', advance);
    }));
  }
  function touristEvent() {
    eventFrame('游', 'A lost tourist needs help', 'A visitor practicing Chinese asks you something. Give a good reply and they’ll tip you 30 coins.', '<div class="row center"><button class="btn primary" id="talk">Talk to them</button><button class="ghost" id="leaveE">Walk on</button></div>');
    $('#leaveE').addEventListener('click', advance);
    $('#talk').addEventListener('click', async () => {
      $('#talk').disabled = true;
      const ok = await talkQuestion({ zh: '游客' }, 0, '<b class="han">游客</b> (yóukè, the tourist) asks you something. Pick the best reply.');
      if (ok) RUN.coins += 30; saveRun();
      root.querySelector('.room .row').hidden = true;
      $('.q-fb').innerHTML = (ok ? '<b class="good">谢谢！ +30 coins.</b>' : '<span class="muted">They smile and wander off.</span>') + '<div><button class="btn primary" id="on">Continue</button></div>';
      $('#on').addEventListener('click', advance);
    });
  }
  function calligraphyEvent() {
    const cands = RUN.deck.filter(c => !c.up);
    eventFrame('书', 'A calligrapher’s stall', 'An old calligrapher offers to brush one of your words. Pick a card, then type its pinyin from memory. Get it right and the card upgrades for free.',
      cands.length ? '<div class="row center"><button class="btn primary" id="pickW">Choose a word</button><button class="ghost" id="leaveE">No thanks</button></div>' : '<button class="btn primary" id="leaveE">Every card is already mastered. Move on</button>');
    $('#leaveE').addEventListener('click', advance);
    const pw = $('#pickW'); if (pw) pw.addEventListener('click', () => pickCardScreen('Choose a word to brush', 'Then type its pinyin.', c => !c.up && def(c).t !== 'junk', async c => {
      const ok = await castQuestion(c, 'type');
      if (ok) { c.up = true; c.xp = 3; toastMsg('The calligrapher brushes ' + c.h + '. Upgraded.'); } else toastMsg('“多练习。 Practice more,” says the calligrapher.');
      saveRun(); advance();
    }, calligraphyEvent));
  }
  function treasure() {
    const r = randomRelic(); gainRelic(r); saveRun();
    root.innerHTML = topbar() + '<section class="room"><div class="room-art">' + sealMark('宝') + '</div><h2>Treasure</h2>' +
      (r ? '<div class="relic-big"><span class="han">' + RELICS[r].zh + '</span></div><p><b>' + esc(RELICS[r].en) + '</b>: ' + esc(RELICS[r].d) + '</p>' : '<p>Empty. You already carry every relic.</p>') +
      '<button class="btn primary" id="on">Continue</button></section>';
    bindTop(); sfx('win'); $('#on').addEventListener('click', advance);
  }


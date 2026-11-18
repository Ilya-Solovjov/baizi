  // ───────────── After a fight ─────────────
  // Card rewards: each slot rolls a rarity, and half the time leans toward a build your deck has already started.
  function cardChoices(n, elite) {
    const have = new Set(RUN.deck.map(c => c.h));
    const ws = shuffle(pool().filter(w => !have.has(w.h))).filter((w, i, a) => a.findIndex(x => x.h === w.h) === i);
    const tpl = w => T[tplId(w)];
    const ac = archCounts(RUN.deck), builds = Object.keys(ac);
    const out = [];
    for (let slot = 0; slot < n; slot++) {
      const roll = Math.random(), rare = elite ? 0.12 : 0.04, unc = elite ? 0.5 : 0.36;
      const want = roll < rare ? 'R' : roll < unc ? 'U' : 'C';
      const lean = builds.length && Math.random() < 0.5 ? pick(builds.flatMap(b => Array(ac[b]).fill(b))) : null;
      const ok = w => !out.includes(w) && !out.some(o => tplId(o) === tplId(w));
      const tiers = [w => tpl(w).r === want && (!lean || tpl(w).a === lean), w => tpl(w).r === want, w => !lean || tpl(w).a === lean, () => true];
      let got = null;
      for (const f of tiers) { const fresh = ws.filter(w => ok(w) && f(w)); got = fresh.find(w => !RUN.seen.includes(w.h)) || fresh[0]; if (got) break; }
      if (got) out.push(got);
    }
    return out;
  }
  function gainRelic(id) { if (!id || RUN.relics.includes(id)) return; RUN.relics.push(id); if (id === 'panda') { RUN.maxHp += 10; RUN.hp += 10; } }
  // Relics lean toward your builds too.
  function randomRelic(bossTier) {
    const free = Object.keys(RELICS).filter(r => !RUN.relics.includes(r) && (bossTier || !BOSS_ONLY.includes(r)));
    if (!free.length) return null;
    const ac = archCounts(RUN.deck);
    const fit = free.filter(r => RELICS[r].a && ac[RELICS[r].a]);
    return fit.length && Math.random() < 0.6 ? pick(fit) : pick(free);
  }
  function gainPotion() { if (RUN.potions.length >= 2) return null; const p = pick(Object.keys(POTIONS)); RUN.potions.push(p); return p; }
  function rewardCard(w, i) {
    const c = makeCard(w); c.uid = 0; const d = T[c.tid];
    return '<button class="choice" data-i="' + i + '">' + cardHTML(c) + '<span class="choice-info"><b class="han">' + esc(w.h) + '</b> <span class="py">' + esc(w.p) + '</span><br>' + esc(short(w.e)) + '<br><span class="rar r-' + d.r + '">' + RARITY[d.r] + '</span>' + (d.a ? ' · <span class="a-' + d.a + '">' + ARCH[d.a].en + '</span>' : '') + '</span></button>';
  }
  function winFight() {
    const E = F.E; sfx('win');
    if (E.boss) return RUN.act === 1 ? actClear() : victory();
    let coins = E.elite ? rint(28, 36) : rint(12, 20); if (RUN.relics.includes('envelope')) coins += 15;
    RUN.coins += coins;
    if (RUN.relics.includes('teacup')) RUN.hp = Math.min(RUN.maxHp, RUN.hp + 4);
    let relic = null; if (E.elite) { relic = randomRelic(); gainRelic(relic); }
    const potion = (E.elite || Math.random() < 0.4) ? gainPotion() : null;
    const turns = F.turn;
    F = null; saveRun();
    const choices = cardChoices(spice(10) ? 2 : 3, E.elite);
    root.innerHTML = topbar() + '<section class="reward"><p class="eyebrow">Victory · ' + turns + ' turn' + (turns === 1 ? '' : 's') + '</p><h2><span class="han">' + esc(E.zh) + '</span> is down.</h2>' +
      '<div class="loot"><span class="loot-item coin">+' + coins + ' coins</span>' + (relic ? '<span class="loot-item" title="' + esc(RELICS[relic].d) + '"><b class="han">' + RELICS[relic].zh + '</b> ' + esc(RELICS[relic].en) + '</span>' : '') + (potion ? '<span class="loot-item" title="' + esc(POTIONS[potion].d) + '"><b class="han">' + POTIONS[potion].zh + '</b> ' + esc(POTIONS[potion].en) + '</span>' : '') + '</div>' +
      (relic ? '<p class="small muted">' + esc(RELICS[relic].en) + ': ' + esc(RELICS[relic].d) + '</p>' : '') + (potion ? '<p class="small muted">' + esc(POTIONS[potion].en) + ': ' + esc(POTIONS[potion].d) + ' Tap it in the top bar during a fight.</p>' : '') +
      '<h3>Add a word to your deck</h3><p class="small muted">Rewards lean toward the builds you’ve started. Tap a card to hear it.</p>' +
      '<div class="choices">' + choices.map(rewardCard).join('') + '</div>' +
      '<button class="ghost" id="skip">Skip</button></section>';
    bindTop();
    $$('.choice').forEach(b => b.addEventListener('click', () => { const w = choices[+b.dataset.i]; RUN.deck.push(makeCard(w)); RUN.seen.push(w.h); speak(w.h); advance(); }));
    $$('.choice').forEach(b => b.addEventListener('mouseenter', () => speak(choices[+b.dataset.i].h)));
    $('#skip').addEventListener('click', advance);
  }
  function actClear() {
    const E = F.E; F = null;
    const heal = Math.ceil((RUN.maxHp - RUN.hp) * 0.6); RUN.hp += heal; RUN.coins += 50;
    const offers = [];
    for (let i = 0; i < 3; i++) { const r = randomRelic(true); if (r && !offers.includes(r)) offers.push(r); else { const f = Object.keys(RELICS).filter(x => !RUN.relics.includes(x) && !offers.includes(x)); if (f.length) offers.push(pick(f)); } }
    saveRun();
    root.innerHTML = topbar() + '<section class="reward"><div class="reward-art">' + art(E.art, 'hurt') + '</div><p class="eyebrow">Act 1 cleared</p><h2><span class="han">' + esc(E.zh) + '</span> is beaten.</h2>' +
      '<p class="muted">You rest before the midnight alleys: +' + heal + ' HP, +50 coins. Choose one relic.</p>' +
      '<div class="room-opts">' + offers.map(r => '<button class="path-btn" data-r="' + r + '"><b><span class="han">' + RELICS[r].zh + '</span> ' + esc(RELICS[r].en) + '</b><span>' + esc(RELICS[r].d) + '</span></button>').join('') + '</div></section>';
    bindTop();
    $$('[data-r]').forEach(b => b.addEventListener('click', () => { gainRelic(b.dataset.r); RUN.act = 2; RUN.map = genMap(); RUN.pos = null; RUN.done = []; RUN.floor = 0; RUN.next = null; saveRun(); mapScreen(); }));
  }

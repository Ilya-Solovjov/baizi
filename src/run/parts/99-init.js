  // Keyboard: 1–9 play cards, E ends the turn.
  document.addEventListener('keydown', e => {
    if (!F || !$('.fight') || $('.overlay') || e.metaKey || e.ctrlKey || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key.toLowerCase() === 'e') { e.preventDefault(); endTurn(); }
    else if (/^[1-9]$/.test(e.key)) { const b = $$('.hand-card')[+e.key - 1]; if (b) { e.preventDefault(); b.click(); } }
  });

  title();
  Object.defineProperty(debug, 'run', { get: () => RUN }); Object.defineProperty(debug, 'fight', { get: () => F });
  debug.allCards = () => WORDS.filter(w => w.tier !== 'O').map(w => { const c = { h: w.h, pos: w.pos, e: w.e, up: false }; c.tid = tplId(c); return [w.l, w.h, c.tid, T[c.tid].r, costOf(c), describe(c, false), describe(c, false, 1)]; });
  debug.give = h => { const w = WORDS.find(x => x.h === h); const c = makeCard(w); RUN.deck.push(c); return c.uid; }; debug.render = () => renderFight();
  debug.art = art;

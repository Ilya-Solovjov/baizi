  // ───────────── Saved state ─────────────
  const MKEY = 'baizi-run:meta', RKEY = 'baizi-run:run';
  const newStats = () => ({ casts: 0, right: 0, combos: 0, dmg: 0, talks: 0, talksRight: 0, spoken: 0, echoes: 0, best: 0 });
  let META = { sound: true, voice: true, runs: 0, wins: 0, bestFloor: 0, words: {}, ascMax: 0, ascPick: 0 };
  // Spice levels (辣度): optional difficulty steps, like Ascension. Each level adds its rule to all the ones below it.
  // Winning a run at your highest level unlocks the next one.
  const SPICE = [
    'More elites on the map.',
    'Normal enemies deal 10% more damage.',
    'Elites have 20% more HP and start with 1 Strength.',
    'Bosses have 10% more HP and deal 10% more damage.',
    'Teahouses heal 15% of your max HP instead of 25%.',
    'You start each run at 80% HP.',
    'Normal enemies have 15% more HP.',
    'Every wrong answer also costs you 2 HP.',
    'Your deck starts with a permanent Noise card.',
    'Card rewards offer 2 cards instead of 3.',
  ];
  const spice = n => !!RUN && (RUN.asc || 0) >= n;
  try { const m = JSON.parse(localStorage.getItem(MKEY)); if (m) META = Object.assign(META, m); } catch (e) { }
  const saveMeta = () => { try { localStorage.setItem(MKEY, JSON.stringify(META)); } catch (e) { } };
  let RUN = null;
  try {
    RUN = JSON.parse(localStorage.getItem(RKEY));
    if (RUN) { UID = Math.max(UID, ...RUN.deck.map(c => c.uid + 1)); RUN.act = RUN.act || 1; RUN.potions = RUN.potions || []; RUN.stats = RUN.stats || newStats(); RUN.bosses = RUN.bosses || PATHS[0].bosses; RUN.done = RUN.done || RUN.path_ || []; RUN.deck.forEach(c => { c.tid = tplId(c); delete c.kind; if (c.xp >= 3) c.m = true; }); RUN.stats = Object.assign(newStats(), RUN.stats); }
  } catch (e) { RUN = null; }
  const saveRun = () => { try { RUN ? localStorage.setItem(RKEY, JSON.stringify(RUN)) : localStorage.removeItem(RKEY); } catch (e) { } };
  const pool = () => WORDS.filter(w => RUN.lessons.includes(w.l) && w.tier !== 'O');
  const mastered = m => !!m && m.r >= 3 && m.r / (m.r + m.w) >= 0.75;
  function noteWord(h, ok) {
    const m = META.words[h] = META.words[h] || { r: 0, w: 0 }; ok ? m.r++ : m.w++; m.last = Date.now();
    const r = RUN.log[h] = RUN.log[h] || { r: 0, w: 0 }; ok ? r.r++ : r.w++;
    RUN.stats.casts++; if (ok) RUN.stats.right++;
    saveMeta();
  }


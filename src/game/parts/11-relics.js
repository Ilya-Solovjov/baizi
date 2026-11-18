  // ───────────── Relics and potions ─────────────
  // Relics carry a build tag so shops and treasure can lean toward what your deck is doing.
  const RELICS = {
    envelope: { zh: '红包', en: 'Red envelope', d: '+15 coins after every fight.' },
    teacup: { zh: '茶杯', en: 'Teacup', d: 'Heal 4 HP after every fight.' },
    lantern: { zh: '灯笼', en: 'Paper lantern', d: '+1 energy on the first turn of each fight.' },
    panda: { zh: '玉佩', en: 'Jade pendant', d: '+10 max HP.' },
    fan: { zh: '扇子', en: 'Paper fan', d: 'Draw 1 extra card on the first turn of each fight.' },
    knot: { zh: '中国结', en: 'Knot', d: 'Repairing a cracked card heals 3 HP.' },
    seal: { zh: '印章', en: 'Name seal', d: 'Grammar combos also give 1 energy.' },
    chopsticks: { zh: '筷子', en: 'Iron chopsticks', a: 'flow', d: 'Your first Attack each fight plays twice.' },
    drum: { zh: '鼓', en: 'War drum', a: 'flow', d: 'Start each turn with 1 Flow.' },
    brush: { zh: '毛笔', en: 'Writing brush', a: 'topic', d: 'Cards that give Block give 1 more.' },
    jade: { zh: '玉', en: 'Jade disc', a: 'topic', d: 'At the start of your turn, keep up to 6 of your Block.' },
    dumpling: { zh: '石狮', en: 'Stone lion', a: 'topic', d: 'Start every fight with 8 Block.' },
    abacus: { zh: '算盘', en: 'Abacus', a: 'count', d: 'Start each fight with 4 Count.' },
    tally: { zh: '筹', en: 'Counting rods', a: 'count', d: 'Measure words deal +1 per hit.' },
    pepper: { zh: '花椒', en: 'Sichuan pepper', a: 'fluster', d: 'Each Fluster you apply is +1.' },
    incense: { zh: '香', en: 'Incense', a: 'mastery', d: 'Whenever a card is Spent, gain 2 Block.' },
    ink: { zh: '墨', en: 'Ink stick', d: 'While Tongue-tied, typing a card right also draws 1.' },
    gong: { zh: '锣', en: 'Gong', a: 'power', d: 'Start each fight with 1 Strength.' },
    bell: { zh: '铃', en: 'Temple bell', a: 'echo', d: 'The first card you play each fight plays twice.' },
    scroll: { zh: '卷轴', en: 'Scroll', a: 'question', d: 'Draw 1 extra card each turn.' },
  };
  const BOSS_ONLY = ['scroll'];
  const POTIONS = {
    tea: { zh: '茶', en: 'Tea', d: 'Heal 12 HP.' },
    oil: { zh: '辣油', en: 'Chili oil', d: 'Your attacks deal double damage this turn.' },
    coffee: { zh: '咖啡', en: 'Coffee', d: '+2 energy.' },
    soymilk: { zh: '豆浆', en: 'Soy milk', d: 'Gain 12 Block.' },
    stick: { zh: '签', en: 'Fortune stick', d: 'Draw 3 cards.' },
    vinegar: { zh: '醋', en: 'Black vinegar', d: 'Fluster 10.' },
    wine: { zh: '酒', en: 'Rice wine', d: '+3 Strength this fight.' },
  };
  const relicIcon = id => '<span class="relic" title="' + esc(RELICS[id].en + ': ' + RELICS[id].d) + '" aria-label="' + esc(RELICS[id].en + ': ' + RELICS[id].d) + '"><span class="han">' + RELICS[id].zh + '</span></span>';

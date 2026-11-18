  // ───────────── Cards ─────────────
  // Every word maps to one card template (the same word always makes the same card).
  // Part of speech sets the family; signature words get their own cards so the grammar drives the builds:
  //   Flow (verbs chain into 了), Count (numbers feed measure words), Fluster (adjectives, multiplied by 很 / 太 / 真),
  //   Topic (nouns stack Block, 是 turns Block into damage), Echo (因为 / 都 / 们 / 一下 make the next card play twice),
  //   Mastery (Spent cards and Speaking mastered words), Questions (look ahead and fetch cards).
  const NUMVAL = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 十九: 19, 二十: 20 };
  const TYPES = { atk: 'Attack', skl: 'Skill', pow: 'Power', junk: 'Noise' };
  const RARITY = { C: 'Common', U: 'Uncommon', R: 'Rare' };
  const ARCH = {
    flow: { zh: '势', en: 'Flow', d: 'Verbs build Flow; 了 and 那么 cash it in.' },
    count: { zh: '数', en: 'Count', d: 'Numbers build Count; measure words spend it for multi-hits.' },
    fluster: { zh: '慌', en: 'Fluster', d: 'Adjectives Fluster the enemy; 很, 真 and 太 multiply it.' },
    topic: { zh: '题', en: 'Topic', d: 'Nouns stack Block; 是 and 吃饱 turn Block into damage.' },
    echo: { zh: '回', en: 'Echo', d: '因为, 都, 们 and 一下 make your next card play twice.' },
    mastery: { zh: '熟', en: 'Mastery', d: 'Spend cards and Speak mastered words; 学, 教 and 说 pay off.' },
    question: { zh: '问', en: 'Questions', d: 'Question words look ahead and fetch the card you need.' },
    power: { zh: '力', en: 'Strength', d: 'Helping verbs give Strength, which boosts every hit.' },
  };
  const POSNAME = { v: 'Verb', vo: 'Verb', rv: 'Verb', n: 'Noun', pr: 'Pronoun', adj: 'Adjective', adv: 'Adverb', mw: 'Measure word', nu: 'Number', qw: 'Question word', qph: 'Question', p: 'Particle', cj: 'Conjunction', ie: 'Expression', av: 'Helping verb', surname: 'Name' };
  const KEYWORDS = {
    Keep: 'Stays in your hand at the end of your turn.',
    Fleeting: 'If it’s still in your hand at the end of your turn, it’s Spent.',
    Spent: 'Removed for the rest of the fight after you play it.',
    Echo: 'Plays twice when you answer right.',
    Opener: 'Always in your first hand.',
    Power: 'Lasts for the rest of the fight.',
    Flow: 'Each verb you play adds 1. Resets at the end of your turn.',
    Count: 'Numbers add to it. Measure words spend it. Lasts all fight.',
    Fluster: 'At the end of your turn the enemy loses that much HP, then it drops by 1.',
    Strength: '+1 damage on every hit.',
    Weak: 'Deals 25% less attack damage.',
    Vulnerable: 'Takes 50% more attack damage.',
    Speak: 'Mastered (熟) cards have a 说 button: type the pinyin from memory and the card plays twice, then is Spent.',
  };
  const isVerb = c => ['v', 'vo', 'rv'].includes(c.pos);
  const PEOPLE = /teacher|classmate|Mr\.|Mrs\.|Miss|Ms\.|person|American|Canadian|dad|mom|brother|sister|father|mother|daughter|son\b|child|boy|girl|friend|student|waiter|businessperson|professor|lawyer|everyone|family|siblings|husband|wife/i;
  const FOOD = /coffee|tea\b|dish|food|dumpling|chicken|vegetable|soup|meal|rice|water|meat|dinner|breakfast|lunch|cake/i;
  const TIME = /week|time|Wednesday|evening|o'clock|half|now|quarter|minute|second|morning|noon|afternoon|hour|today|day|tomorrow|yesterday|year|month/i;

  // Template fields: t type, r rarity, a archetype, cost (n or u => n), kw (u => keywords), v (u => numbers),
  // txt (v, L) => card text (L formats live numbers), run (v, x) => effect, via the combat action helpers in x.
  const kwIf = (cond, k) => cond ? [k] : [];
  const T = {
    // ── Attacks (verbs)
    strike: { t: 'atk', r: 'C', a: 'flow', cost: 1, v: u => ({ d: 6 + 3 * u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '.', run: (v, x) => x.hit(v.d) },
    flurry: { t: 'atk', r: 'C', a: 'flow', cost: 1, v: u => ({ d: 3 + u, n: 2 }), txt: (v, L) => 'Deal ' + L.d(v.d) + ' twice.', run: (v, x) => x.hit(v.d, v.n) },
    jab: { t: 'atk', r: 'C', a: 'flow', cost: 0, v: u => ({ d: 4 + 2 * u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '.', run: (v, x) => x.hit(v.d) },
    guardstrike: { t: 'atk', r: 'C', a: 'flow', cost: 1, v: u => ({ d: 5 + 2 * u, b: 4 + 2 * u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. Gain ' + L.b(v.b) + ' Block.', run: async (v, x) => { await x.hit(v.d); x.block(v.b); } },
    heavy: { t: 'atk', r: 'U', a: 'flow', cost: 2, v: u => ({ d: 13 + 5 * u, vul: 1 + u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. Vulnerable ' + v.vul + '.', run: async (v, x) => { await x.hit(v.d); x.vuln(v.vul); } },
    momentum: { t: 'atk', r: 'U', a: 'flow', cost: 1, v: u => ({ d: 4, per: 2 + u }), txt: (v, L) => 'Deal 4, +' + v.per + ' per Flow' + (L.live ? ' (' + L.d(4 + v.per * (F.flow + 1)) + ')' : '') + '.', run: (v, x) => x.hit(v.d + v.per * F.flow) },
    dash: { t: 'atk', r: 'C', a: 'flow', cost: 0, kw: () => ['Fleeting'], v: u => ({ d: 4 + 2 * u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. Draw 1.', run: async (v, x) => { await x.hit(v.d); x.draw(1); } },
    gift: { t: 'atk', r: 'C', a: 'fluster', cost: 1, v: u => ({ d: 6 + 3 * u, w: 1 + u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. Weak ' + v.w + '.', run: async (v, x) => { await x.hit(v.d); x.weak(v.w); } },
    sip: { t: 'atk', r: 'C', a: 'topic', cost: 1, v: u => ({ d: 5 + 2 * u, h: 2 + u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. Heal ' + v.h + '.', run: async (v, x) => { await x.hit(v.d); x.heal(v.h); } },
    have: { t: 'atk', r: 'C', a: 'count', cost: 1, v: u => ({ d: 5 + 2 * u, k: 2 + u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. +' + v.k + ' Count.', run: async (v, x) => { await x.hit(v.d); x.count(v.k); } },
    try: { t: 'atk', r: 'C', a: 'echo', cost: 0, kw: () => ['Echo'], v: u => ({ d: 3 + 2 * u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '.', run: (v, x) => x.hit(v.d) },
    feast: { t: 'atk', r: 'R', a: 'flow', cost: 2, kw: () => ['Spent'], v: u => ({ d: 11 + 4 * u, hp: 3 + u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. If this defeats the enemy, +' + v.hp + ' max HP.', run: async (v, x) => { await x.hit(v.d); if (F.ehp <= 0) { RUN.maxHp += v.hp; RUN.hp += v.hp; toastMsg('吃饱了！ +' + v.hp + ' max HP'); } } },
    body: { t: 'atk', r: 'R', a: 'topic', cost: u => u ? 0 : 1, v: () => ({}), txt: (v, L) => 'Deal damage equal to your Block' + (L.live ? ' (' + L.d(F.block) + ')' : '') + '.', run: (v, x) => x.hit(F.block) },
    full: { t: 'atk', r: 'U', a: 'topic', cost: 1, v: u => ({ b: 3 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block, then deal damage equal to your Block' + (L.live ? ' (' + L.d(F.block + v.b) + ')' : '') + '.', run: async (v, x) => { x.block(v.b); await x.hit(F.block); } },
    finish: { t: 'atk', r: 'U', a: 'flow', cost: 1, v: u => ({ d: 3, per: 4 + u }), txt: (v, L) => 'Deal 3, +' + v.per + ' per Flow' + (L.live ? ' (' + L.d(3 + v.per * F.flow) + ')' : '') + '.', run: (v, x) => x.hit(v.d + v.per * F.flow) },
    then: { t: 'atk', r: 'U', a: 'flow', cost: 1, v: u => ({ per: 3 + u }), txt: (v, L) => 'Deal ' + v.per + ' for each card played this turn' + (L.live ? ' (' + L.d(v.per * (F.played.length + 1)) + ')' : '') + '.', run: (v, x) => x.hit(v.per * F.played.length) },
    recite: { t: 'atk', r: 'R', a: 'mastery', cost: 1, v: u => ({ per: 3 + u }), txt: (v, L) => 'Deal ' + v.per + ' for each card Spent this fight' + (L.live ? ' (' + L.d(v.per * F.spent) + ')' : '') + '.', run: (v, x) => x.hit(v.per * Math.max(1, F.spent)) },
    use: { t: 'atk', r: 'U', a: 'mastery', cost: 1, v: u => ({ d: 12 + 4 * u }), txt: (v, L) => 'Spend a random other card in your hand. Deal ' + L.d(v.d) + '.', run: async (v, x) => { x.spendRandom(); await x.hit(v.d); } },
    only: { t: 'atk', r: 'U', a: 'flow', cost: 1, v: u => ({ d: 4, big: 18 + 6 * u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. If it’s the only card in your hand, deal ' + L.d(v.big) + ' instead.', run: (v, x) => x.hit(x.handSize() === 0 ? v.big : v.d) },
    almost: { t: 'atk', r: 'U', a: 'fluster', cost: 1, v: u => ({ k: 2 + u }), txt: (v, L) => 'Deal ' + v.k + '× the enemy’s Fluster' + (L.live ? ' (' + L.d(v.k * F.fluster) + ')' : '') + '.', run: (v, x) => x.hit(v.k * F.fluster) },
    zero: { t: 'atk', r: 'C', a: 'count', cost: 1, v: u => ({ d: 6 + 3 * u }), txt: (v, L) => 'Remove the enemy’s Block. Deal ' + L.d(v.d) + '.', run: (v, x) => { F.eblock = 0; return x.hit(v.d); } },
    big: { t: 'atk', r: 'C', a: 'fluster', cost: 1, v: u => ({ d: 7 + 3 * u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. Vulnerable 1.', run: async (v, x) => { await x.hit(v.d); x.vuln(1); } },
    sting: { t: 'atk', r: 'C', a: 'fluster', cost: 1, v: u => ({ d: 4 + 2 * u, f: 3 + u }), txt: (v, L) => 'Deal ' + L.d(v.d) + '. Fluster ' + L.f(v.f) + '.', run: async (v, x) => { await x.hit(v.d); x.fluster(v.f); } },
    goodbye: { t: 'atk', r: 'R', a: 'mastery', cost: u => u ? 1 : 2, kw: () => ['Spent'], v: u => ({ per: 6 + 2 * u }), txt: (v, L) => 'Spend every other card in your hand. Deal ' + L.d(v.per) + ' for each.', run: (v, x) => { const n = x.spendAll(); return x.hit(v.per, n); } },
    // ── Count (numbers and measure words)
    num: { t: 'skl', r: 'C', a: 'count', cost: 0, v: (u, c) => ({ k: NUMVAL[c.h] + u, dr: u }), txt: v => '+' + v.k + ' Count.' + (v.dr ? ' Draw 1.' : ''), run: (v, x) => { x.count(v.k); if (v.dr) x.draw(1); } },
    numblock: { t: 'skl', r: 'C', a: 'count', cost: 1, v: (u, c) => ({ k: NUMVAL[c.h] + u, b: NUMVAL[c.h] + 3 * u }), txt: (v, L) => '+' + v.k + ' Count. Gain ' + L.b(v.b) + ' Block.', run: (v, x) => { x.count(v.k); x.block(v.b); } },
    ten: { t: 'skl', r: 'U', a: 'count', cost: 1, kw: u => kwIf(u, 'Keep'), v: (u, c) => ({ k: NUMVAL[c.h] }), txt: v => '+' + v.k + ' Count.', run: (v, x) => x.count(v.k) },
    bignum: { t: 'skl', r: 'R', a: 'count', cost: u => u ? 1 : 2, v: (u, c) => ({ k: NUMVAL[c.h] }), txt: v => '+' + v.k + ' Count. Draw 2.', run: (v, x) => { x.count(v.k); x.draw(2); } },
    month: { t: 'skl', r: 'C', a: 'count', cost: 1, v: u => ({ b: 4 + 2 * u, k: 2 + u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. +' + v.k + ' Count.', run: (v, x) => { x.block(v.b); x.count(v.k); } },
    howmany: { t: 'skl', r: 'U', a: 'count', cost: u => u ? 0 : 1, v: () => ({}), txt: (v, L) => '+1 Count for each other card in your hand' + (L.live ? ' (+' + Math.max(0, F.hand.length - 1) + ')' : '') + '.', run: (v, x) => x.count(x.handSize()) },
    tally: { t: 'atk', r: 'C', a: 'count', cost: 1, v: u => ({ d: 3 + u, max: 8 }), txt: (v, L) => 'Spend your Count (up to 8): deal ' + L.d(v.d) + ' once per Count' + (L.live ? ' (×' + Math.max(1, Math.min(8, F.count)) + ')' : '') + '.', run: (v, x) => x.hit(v.d, Math.max(1, x.spendCount(v.max))) },
    tallylite: { t: 'atk', r: 'C', a: 'count', cost: 0, v: u => ({ d: 3 + u, max: 4 }), txt: (v, L) => 'Spend up to 4 Count: deal ' + L.d(v.d) + ' once per Count' + (L.live ? ' (×' + Math.max(1, Math.min(4, F.count)) + ')' : '') + '.', run: (v, x) => x.hit(v.d, Math.max(1, x.spendCount(v.max))) },
    polite: { t: 'skl', r: 'U', a: 'count', cost: 1, v: u => ({ b: 3 + u }), txt: (v, L) => 'Spend your Count (up to 8): gain ' + L.b(v.b) + ' Block per Count.', run: (v, x) => { const n = Math.max(1, x.spendCount(8)); x.block(v.b * n); } },
    household: { t: 'skl', r: 'U', a: 'count', cost: 1, v: u => ({ f: 2 + u }), txt: (v, L) => 'Spend your Count (up to 8): Fluster ' + L.f(v.f) + ' per Count.', run: (v, x) => { const n = Math.max(1, x.spendCount(8)); x.fluster(v.f * n); } },
    portion: { t: 'atk', r: 'U', a: 'count', cost: 1, v: u => ({ d: 2 + u, b: 2 + u }), txt: (v, L) => 'Spend your Count (up to 8): per Count, deal ' + L.d(v.d) + ' and gain ' + v.b + ' Block.', run: async (v, x) => { const n = Math.max(1, x.spendCount(8)); await x.hit(v.d, n); x.block(v.b * n); } },
    // ── Fluster (adjectives, adverbs)
    hex: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ f: 5 + 2 * u }), txt: (v, L) => 'Fluster ' + L.f(v.f) + '.', run: (v, x) => x.fluster(v.f) },
    wither: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ f: 3 + u, w: 1 + u }), txt: (v, L) => 'Fluster ' + L.f(v.f) + '. Weak ' + v.w + '.', run: (v, x) => { x.fluster(v.f); x.weak(v.w); } },
    simple: { t: 'skl', r: 'C', a: 'fluster', cost: 0, v: u => ({ f: 2 + 2 * u }), txt: (v, L) => 'Fluster ' + L.f(v.f) + '.', run: (v, x) => x.fluster(v.f) },
    fleet: { t: 'skl', r: 'C', a: 'fluster', cost: 0, kw: () => ['Fleeting'], v: u => ({ f: 3 + 2 * u }), txt: (v, L) => 'Fluster ' + L.f(v.f) + '.', run: (v, x) => x.fluster(v.f) },
    spicy: { t: 'skl', r: 'U', a: 'fluster', cost: 2, v: u => ({ f: 12 + 4 * u }), txt: (v, L) => 'Fluster ' + L.f(v.f) + '.', run: (v, x) => x.fluster(v.f) },
    sweet: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ f: 3 + 2 * u, h: 3 }), txt: (v, L) => 'Fluster ' + L.f(v.f) + '. Heal ' + v.h + '.', run: (v, x) => { x.fluster(v.f); x.heal(v.h); } },
    wrong: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ vul: 2 + u, f: 2 }), txt: (v, L) => 'Vulnerable ' + v.vul + '. Fluster ' + L.f(v.f) + '.', run: (v, x) => { x.vuln(v.vul); x.fluster(v.f); } },
    goodhex: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ b: 5 + 2 * u, f: 3 }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. Fluster ' + L.f(v.f) + '.', run: (v, x) => { x.block(v.b); x.fluster(v.f); } },
    newhex: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ f: 4 + 2 * u }), txt: (v, L) => 'Fluster ' + L.f(v.f) + '. Draw 1.', run: (v, x) => { x.fluster(v.f); x.draw(1); } },
    many: { t: 'skl', r: 'U', a: 'fluster', cost: 1, v: u => ({ per: 2 + u }), txt: (v, L) => 'Fluster ' + v.per + ' for each other card in your hand' + (L.live ? ' (' + L.f(v.per * Math.max(0, F.hand.length - 1)) + ')' : '') + '.', run: (v, x) => x.fluster(v.per * x.handSize()) },
    bitter: { t: 'skl', r: 'R', a: 'fluster', cost: u => u ? 0 : 1, v: () => ({}), txt: (v, L) => 'The enemy loses HP equal to its Fluster' + (L.live ? ' (' + F.fluster + ')' : '') + '.', run: (v, x) => x.loseHp(F.fluster) },
    very: { t: 'skl', r: 'C', a: 'fluster', cost: 0, kw: u => kwIf(u, 'Keep'), v: () => ({}), txt: () => 'Your next Fluster this turn is doubled. Draw 1.', run: (v, x) => { F.fdouble = true; x.draw(1); } },
    really: { t: 'skl', r: 'U', a: 'fluster', cost: u => u ? 0 : 1, kw: () => ['Spent'], v: () => ({ k: 2 }), txt: (v, L) => 'Double the enemy’s Fluster' + (L.live ? ' (' + F.fluster + ' → ' + F.fluster * 2 + ')' : '') + '.', run: (v, x) => x.fluster(F.fluster, true) },
    too: { t: 'skl', r: 'R', a: 'fluster', cost: u => u ? 1 : 2, kw: () => ['Spent'], v: () => ({ k: 3 }), txt: (v, L) => 'Triple the enemy’s Fluster' + (L.live ? ' (' + F.fluster + ' → ' + F.fluster * 3 + ')' : '') + '.', run: (v, x) => x.fluster(F.fluster * 2, true) },
    not: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ w: 2 + u, f: 2 }), txt: (v, L) => 'Weak ' + v.w + '. Fluster ' + L.f(v.f) + '.', run: (v, x) => { x.weak(v.w); x.fluster(v.f); } },
    nohave: { t: 'skl', r: 'C', a: 'fluster', cost: 1, v: u => ({ w: 1 + u, f: 3 + u }), txt: (v, L) => 'Remove the enemy’s Block. Weak ' + v.w + '. Fluster ' + L.f(v.f) + '.', run: (v, x) => { F.eblock = 0; x.weak(v.w); x.fluster(v.f); } },
    // ── Topic (nouns, pronouns)
    guard: { t: 'skl', r: 'C', a: 'topic', cost: 1, v: u => ({ b: 5 + 3 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block.', run: (v, x) => x.block(v.b) },
    wall: { t: 'skl', r: 'C', a: 'topic', cost: 2, v: u => ({ b: 12 + 4 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block.', run: (v, x) => x.block(v.b) },
    bash: { t: 'atk', r: 'C', a: 'topic', cost: 1, v: u => ({ b: 4 + 2 * u, d: 4 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. Deal ' + L.d(v.d) + '.', run: async (v, x) => { x.block(v.b); await x.hit(v.d); } },
    steady: { t: 'skl', r: 'C', a: 'topic', cost: 1, v: u => ({ b: 4 + u, nb: 4 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block now and ' + v.nb + ' next turn.', run: (v, x) => { x.block(v.b); x.nextTurn('block', v.nb); } },
    scout: { t: 'skl', r: 'C', a: 'question', cost: 1, v: u => ({ b: 4 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. Draw 1.', run: (v, x) => { x.block(v.b); x.draw(1); } },
    topic: { t: 'skl', r: 'C', a: 'topic', cost: 1, kw: () => ['Keep'], v: u => ({ b: 6 + 3 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block.', run: (v, x) => x.block(v.b) },
    ally: { t: 'skl', r: 'C', a: 'power', cost: 1, v: u => ({ b: 4 + 2 * u, vg: 3 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. Your next Attack deals +' + v.vg + '.', run: (v, x) => { x.block(v.b); F.vigor += Math.floor(v.vg * x.m); } },
    snack: { t: 'skl', r: 'C', a: 'topic', cost: 1, v: u => ({ b: 5 + 2 * u, h: 1 + u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. Heal ' + v.h + '.', run: (v, x) => { x.block(v.b); x.heal(v.h); } },
    plan: { t: 'skl', r: 'C', a: 'topic', cost: 1, v: u => ({ b: 4 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. Next turn, +1 energy.', run: (v, x) => { x.block(v.b); x.nextTurn('energy', 1); } },
    double: { t: 'skl', r: 'U', a: 'topic', cost: u => u ? 1 : 2, v: () => ({}), txt: (v, L) => 'Double your Block' + (L.live ? ' (' + F.block + ' → ' + F.block * 2 + ')' : '') + '.', run: (v, x) => x.block(F.block, true) },
    chars: { t: 'skl', r: 'R', a: 'mastery', cost: 1, v: u => ({ per: 3 + u }), txt: (v, L) => 'Gain ' + v.per + ' Block for each mastered (熟) card in your deck' + (L.live ? ' (' + L.b(v.per * RUN.deck.filter(c => c.up).length) + ')' : '') + '.', run: (v, x) => x.block(v.per * RUN.deck.filter(c => c.up).length) },
    sit: { t: 'skl', r: 'C', a: 'topic', cost: 1, kw: () => ['Keep'], v: u => ({ b: 7 + 3 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block.', run: (v, x) => x.block(v.b) },
    notyet: { t: 'skl', r: 'C', a: 'topic', cost: 1, v: u => ({ b: 5 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block. Next turn, draw 1 more.', run: (v, x) => { x.block(v.b); x.nextTurn('draw', 1); } },
    but: { t: 'skl', r: 'U', a: 'topic', cost: u => u ? 0 : 1, v: () => ({}), txt: (v, L) => 'Gain Block equal to the enemy’s planned damage' + (L.live ? ' (' + L.b(Math.min(25, incoming())) + ')' : '') + ', up to 25.', run: (v, x) => x.block(Math.min(25, incoming())) },
    // ── Echo (cause and effect)
    because: { t: 'skl', r: 'U', a: 'echo', cost: u => u ? 0 : 1, v: () => ({}), txt: () => 'Your next card this turn plays twice. Draw 1.', run: (v, x) => { F.echo++; x.draw(1); } },
    all: { t: 'skl', r: 'U', a: 'echo', cost: u => u ? 0 : 1, v: () => ({}), txt: () => 'Your next card this turn plays twice.', run: () => { F.echo++; } },
    plural: { t: 'skl', r: 'C', a: 'echo', cost: u => u ? 0 : 1, kw: () => ['Spent'], v: () => ({}), txt: () => 'Your next card this turn plays twice.', run: () => { F.echo++; } },
    abit: { t: 'skl', r: 'C', a: 'echo', cost: 0, v: u => ({ dr: u }), txt: v => 'Your next verb this turn plays twice.' + (v.dr ? ' Draw 1.' : ''), run: (v, x) => { F.echoVerb++; if (v.dr) x.draw(1); } },
    also: { t: 'skl', r: 'U', a: 'echo', cost: u => u ? 0 : 1, v: () => ({}), txt: (v, L) => 'Play the last card you played this turn again' + (L.live && lastPlayedCard() ? ' (' + esc(lastPlayedCard().h) + ')' : '') + '.', run: (v, x) => x.replayLast() },
    and: { t: 'skl', r: 'C', a: 'echo', cost: 0, v: u => ({ k: 1 + u }), txt: v => 'Draw 1. +' + v.k + ' Flow and +' + v.k + ' Count.', run: (v, x) => { x.draw(1); x.flow(v.k); x.count(v.k); } },
    or: { t: 'skl', r: 'C', a: 'question', cost: 1, v: u => ({ dr: 2 + u, b: 7 + 3 * u }), txt: (v, L) => 'Choose: draw ' + v.dr + ', or gain ' + L.b(v.b) + ' Block.', run: (v, x) => x.choose([['Draw ' + v.dr, () => x.draw(v.dr)], ['Gain ' + v.b + ' Block', () => x.block(v.b)]]) },
    besides: { t: 'skl', r: 'C', a: 'mastery', cost: 0, kw: () => ['Spent'], v: u => ({ dr: 1 + u }), txt: v => '+1 energy. Draw ' + v.dr + '.', run: (v, x) => { x.energy(1); x.draw(v.dr); } },
    // ── Questions
    what: { t: 'skl', r: 'C', a: 'question', cost: 0, v: u => ({ k: 3 + 2 * u }), txt: v => 'Look at the top ' + v.k + ' cards of your draw pile. Put 1 in your hand.', run: (v, x) => x.look(v.k) },
    which: { t: 'skl', r: 'C', a: 'question', cost: u => u ? 0 : 1, v: () => ({}), txt: () => 'Draw 2.', run: (v, x) => x.draw(2) },
    who: { t: 'skl', r: 'U', a: 'question', cost: u => u ? 0 : 1, v: () => ({}), txt: () => 'Put a card from your discard pile into your hand.', run: (v, x) => x.fromDiscard() },
    howabout: { t: 'skl', r: 'C', a: 'question', cost: 1, v: u => ({ b: 3 + 2 * u }), txt: (v, L) => 'Draw 2. Gain ' + L.b(v.b) + ' Block.', run: (v, x) => { x.draw(2); x.block(v.b); } },
    why: { t: 'skl', r: 'U', a: 'mastery', cost: 0, kw: () => ['Spent'], v: u => ({ dr: 2 + u }), txt: v => 'Draw ' + v.dr + '.', run: (v, x) => x.draw(v.dr) },
    ma: { t: 'skl', r: 'C', a: 'question', cost: 0, kw: () => ['Fleeting'], v: u => ({ dr: 1 + u }), txt: v => 'Draw ' + v.dr + '.', run: (v, x) => x.draw(v.dr) },
    ne: { t: 'skl', r: 'C', a: 'question', cost: 0, kw: () => ['Keep'], v: u => ({ dr: 1 + u }), txt: v => 'Draw ' + v.dr + '.', run: (v, x) => x.draw(v.dr) },
    order: { t: 'skl', r: 'C', a: 'question', cost: 1, v: u => ({ b: 2 * u }), txt: (v, L) => 'Put a card from your discard pile into your hand.' + (v.b ? ' Gain ' + L.b(v.b) + ' Block.' : ''), run: (v, x) => { x.fromDiscard(); if (v.b) x.block(v.b); } },
    // ── Particles
    de: { t: 'skl', r: 'C', a: 'mastery', cost: 0, kw: () => ['Spent'], v: u => ({ dr: u }), txt: v => '+1 energy.' + (v.dr ? ' Draw 1.' : ''), run: (v, x) => { x.energy(1); if (v.dr) x.draw(1); } },
    ba: { t: 'skl', r: 'C', a: 'flow', cost: 0, v: u => ({ k: 2 + u }), txt: v => '+' + v.k + ' Flow.', run: (v, x) => x.flow(v.k) },
    soft: { t: 'skl', r: 'C', a: 'topic', cost: 0, kw: () => ['Fleeting'], v: u => ({ b: 3 + 2 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block.', run: (v, x) => x.block(v.b) },
    begin: { t: 'skl', r: 'U', a: 'flow', cost: 0, kw: () => ['Opener'], v: u => ({ k: 2 + u }), txt: v => '+' + v.k + ' Flow. Draw 1.', run: (v, x) => { x.flow(v.k); x.draw(1); } },
    look: { t: 'skl', r: 'C', a: 'question', cost: 0, v: u => ({ k: 3 + u }), txt: v => 'Look at the top ' + v.k + ' cards of your draw pile. Put 1 in your hand.', run: (v, x) => x.look(v.k) },
    // ── Expressions (one-shot rituals)
    hello: { t: 'skl', r: 'C', a: 'mastery', cost: 0, kw: () => ['Opener', 'Spent'], v: u => ({ dr: 2 + u }), txt: v => 'Draw ' + v.dr + '.', run: (v, x) => x.draw(v.dr) },
    thanks: { t: 'skl', r: 'C', a: 'mastery', cost: 1, kw: () => ['Spent'], v: u => ({ h: 4 + 2 * u }), txt: v => 'Heal ' + v.h + '.', run: (v, x) => x.heal(v.h) },
    excuse: { t: 'skl', r: 'C', a: 'mastery', cost: 0, kw: () => ['Spent'], v: u => ({ w: 2 + u }), txt: v => 'Weak ' + v.w + '.', run: (v, x) => x.weak(v.w) },
    sorry: { t: 'skl', r: 'C', a: 'mastery', cost: 1, kw: () => ['Spent'], v: u => ({ b: 11 + 4 * u }), txt: (v, L) => 'Gain ' + L.b(v.b) + ' Block.', run: (v, x) => x.block(v.b) },
    nevermind: { t: 'skl', r: 'U', a: 'mastery', cost: 0, kw: () => ['Spent'], v: u => ({ dr: 2 + u }), txt: v => 'Spend all Noise in your hand. Draw ' + v.dr + '.', run: (v, x) => { x.spendAll(c => c.t === 'junk'); x.draw(v.dr); } },
    bday: { t: 'skl', r: 'R', a: 'power', cost: 1, kw: () => ['Spent'], v: u => ({ s: 2 + u, h: 4 }), txt: v => '+' + v.s + ' Strength. Heal ' + v.h + '.', run: (v, x) => { x.str(v.s); x.heal(v.h); } },
    welcome: { t: 'skl', r: 'U', a: 'mastery', cost: 0, kw: () => ['Opener', 'Spent'], v: u => ({ dr: u }), txt: v => '+2 energy.' + (v.dr ? ' Draw 1.' : ''), run: (v, x) => { x.energy(2); if (v.dr) x.draw(1); } },
    // ── Powers (last all fight)
    want: { t: 'pow', r: 'U', a: 'power', cost: 1, v: u => ({ s: 2 + u }), txt: v => '+' + v.s + ' Strength.', run: (v, x) => x.str(v.s) },
    will: { t: 'pow', r: 'R', a: 'power', cost: u => u ? 2 : 3, v: () => ({ s: 1 }), txt: () => 'At the start of each turn, +1 Strength.', run: (v, x) => x.power('strTurn', 1) },
    can: { t: 'pow', r: 'U', a: 'flow', cost: 1, v: u => ({ b: 2 + u }), txt: v => 'Whenever you play a verb, gain ' + v.b + ' Block.', run: (v, x) => x.power('onVerbBlock', v.b) },
    like: { t: 'pow', r: 'U', a: 'mastery', cost: 1, v: u => ({ d: 2 + u }), txt: v => 'Whenever you answer a card right, the enemy loses ' + v.d + ' HP.', run: (v, x) => x.power('onRight', v.d) },
    come: { t: 'pow', r: 'U', a: 'flow', cost: u => u ? 0 : 1, v: () => ({ k: 2 }), txt: v => 'At the start of each turn, +' + v.k + ' Flow.', run: (v, x) => x.power('flowStart', v.k) },
    study: { t: 'pow', r: 'U', a: 'mastery', cost: 1, v: u => ({ b: 3 + u }), txt: v => 'Whenever a card is Spent, gain ' + v.b + ' Block.', run: (v, x) => x.power('onSpendBlock', v.b) },
    teach: { t: 'pow', r: 'R', a: 'mastery', cost: u => u ? 1 : 2, v: () => ({}), txt: () => 'Whenever a card is Spent, draw 1.', run: (v, x) => x.power('onSpendDraw', 1) },
    treat: { t: 'pow', r: 'U', a: 'mastery', cost: 1, v: u => ({ d: 3 + 2 * u }), txt: v => 'Whenever a card is Spent, the enemy loses ' + v.d + ' HP.', run: (v, x) => x.power('onSpendDmg', v.d) },
    cook: { t: 'pow', r: 'U', a: 'topic', cost: 1, v: u => ({ d: 2 + u }), txt: v => 'Whenever you gain Block from a card, the enemy loses ' + v.d + ' HP.', run: (v, x) => x.power('onBlockDmg', v.d) },
    still: { t: 'pow', r: 'R', a: 'topic', cost: u => u ? 2 : 3, v: () => ({}), txt: () => 'Your Block no longer goes away at the start of your turn.', run: (v, x) => x.power('keepBlock', 1) },
    this: { t: 'pow', r: 'U', a: 'topic', cost: 1, v: u => ({ b: 4 + 2 * u }), txt: v => 'At the end of each turn, gain ' + v.b + ' Block.', run: (v, x) => x.power('endBlock', v.b) },
    sour: { t: 'pow', r: 'U', a: 'fluster', cost: 1, v: u => ({ f: 3 + u }), txt: v => 'At the start of each turn, Fluster ' + v.f + '.', run: (v, x) => x.power('flusterTurn', v.f) },
    dayno: { t: 'pow', r: 'U', a: 'count', cost: 1, v: u => ({ k: 2 + u }), txt: v => 'At the start of each turn, +' + v.k + ' Count.', run: (v, x) => x.power('countStart', v.k) },
    // ── Noise (enemy curse)
    noise: { t: 'junk', r: 'C', a: null, cost: 0, kw: () => ['Fleeting'], v: () => ({}), txt: () => 'Can’t be played.', run: () => { } },
  };
  // Signature cards: hanzi (or hanzi|pos when a character has two words).
  const SIG = {
    是: 'body', 吃饱: 'full', 了: 'finish', 吃: 'feast', 试: 'try', 说: 'recite', 用: 'use', 给: 'gift', 送: 'gift', 喝: 'sip', 有: 'have', 看: 'look', 开始: 'begin',
    来: 'come', 学: 'study', 教: 'teach', 请客: 'treat', 做饭: 'cook', 点菜: 'order', 坐: 'sit', 走: 'dash', 问: 'look', 写: 'flurry', 做: 'heavy', 吃饭: 'momentum', 去: 'strike', 见: 'strike', 叫: 'strike', 请: 'guardstrike', 姓: 'jab', 祝: 'guardstrike', 欢迎: 'jab', 吃素: 'sip',
    零: 'zero', 十: 'ten', 十九: 'bignum', 二十: 'bignum', 几: 'howmany', 几位: 'howmany', 号: 'dayno',
    个: 'tallylite', '只|mw': 'tally', 条: 'tally', 杯: 'tally', 碗: 'tally', 盘: 'tally', 口: 'tally', 位: 'polite', '家|mw': 'household', 份: 'portion', 一下: 'abit',
    辣: 'spicy', 苦: 'bitter', 甜: 'sweet', 酸: 'sour', 错: 'wrong', 多: 'many', 大: 'big', 好: 'goodhex', 不错: 'goodhex', 新: 'newhex', 晚: 'fleet', 早: 'fleet', 简单: 'simple', 咸: 'sting', 饿: 'wither', 渴: 'wither',
    很: 'very', 真: 'really', 太: 'too', 差不多: 'almost', 不: 'not', 没: 'nohave', '只|adv': 'only', 也: 'also', 都: 'all', '还|adv': 'still', 还没有: 'notyet',
    这: 'this', 那: 'double', 汉字: 'chars',
    因为: 'because', 们: 'plural', 那么: 'then', 和: 'and', 可是: 'but', 还是: 'or', '还|cj': 'besides',
    什么: 'what', 星期几: 'what', 什么时候: 'what', 哪: 'which', 谁: 'who', 怎么样: 'howabout', 为什么: 'why', 吗: 'ma', 呢: 'ne',
    的: 'de', 吧: 'ba', 哦: 'soft', 啊: 'soft',
    你好: 'hello', 谢谢: 'thanks', 请问: 'excuse', 再见: 'goodbye', 对不起: 'sorry', 没关系: 'nevermind', 生日快乐: 'bday', 欢迎光临: 'welcome',
    想: 'want', 要: 'will', 会: 'can', 喜欢: 'like',
  };
  const hashPick = (h, list) => list[[...h].reduce((s, ch) => s + ch.charCodeAt(0), 0) % list.length];
  function tplId(c) {
    if (c.pos === 'noise') return 'noise';
    const sig = SIG[c.h + '|' + c.pos] || SIG[c.h];
    if (sig) return sig;
    const p = c.pos, e = c.e || '';
    if (/\(measure/.test(e) && p === 'n') return 'tally';
    if (p === 'nu') return NUMVAL[c.h] >= 4 ? 'numblock' : 'num';
    if (['v', 'vo', 'rv'].includes(p)) return hashPick(c.h, ['strike', 'strike', 'flurry', 'jab', 'guardstrike', 'momentum', 'heavy']);
    if (p === 'n' && /^[一二三四五六七八九十]+月$/.test(c.h)) return 'month';
    if (p === 'n' && PEOPLE.test(e)) return 'ally';
    if (p === 'n' && FOOD.test(e)) return 'snack';
    if (p === 'n' && TIME.test(e)) return 'plan';
    if (p === 'pr') return 'topic';
    if (p === 'adj') return hashPick(c.h, ['hex', 'sting', 'wither']);
    if (p === 'mw') return 'tally';
    if (p === 'qw' || p === 'qph') return 'what';
    if (p === 'av') return 'want';
    return hashPick(c.h, ['guard', 'guard', 'wall', 'bash', 'steady', 'scout']);
  }
  let UID = 1, JUID = -1;
  const def = c => T[c.tid] || T[(c.tid = tplId(c))];
  function makeCard(w) { const c = { uid: UID++, h: w.h, p: w.p, e: w.e, pos: w.pos, l: w.l, up: false, xp: 0 }; c.tid = tplId(c); return c; }
  const costOf = c => { const d = def(c); return typeof d.cost === 'function' ? d.cost(c.up ? 1 : 0) : d.cost; };
  const kwOf = c => { const d = def(c); return (d.kw ? d.kw(c.up ? 1 : 0) : []).concat(d.t === 'pow' ? ['Power'] : []); };
  const valsOf = (c, up) => def(c).v(up == null ? (c.up ? 1 : 0) : up, c);
  const archOf = c => def(c).a;
  const typeOf = c => def(c).t;
  const rarOf = c => def(c).r;

  // Live number formatting for card text. Damage includes Strength, the next-Attack bonus, Weak and Vulnerable.
  function liveFmt(c, live) {
    const on = live && F;
    const hi = (v, base) => on && v !== base ? '<b class="' + (v > base ? 'up' : 'down') + '">' + v + '</b>' : String(v);
    return {
      live: on,
      d: base => { if (!on) return String(base); const v = atkPreview(base, c); return hi(v, base); },
      b: base => { if (!on) return String(base); return hi(base + (RUN.relics.includes('brush') ? 1 : 0), base); },
      f: base => { if (!on) return String(base); return hi((base + (RUN.relics.includes('pepper') ? 1 : 0)) * (F.fdouble ? 2 : 1), base); },
    };
  }
  const KWRE = new RegExp('\\b(' + ['Flow', 'Count', 'Fluster', 'Strength', 'Weak', 'Vulnerable', 'Block', 'Spent', 'Spend', 'Echo', 'Keep', 'Fleeting', 'Noise'].join('|') + ')\\b', 'g');
  function describe(c, live, up) {
    const d = def(c), u = up == null ? (c.up ? 1 : 0) : up;
    if (d.t === 'junk') return 'Can’t be played.';
    let s = d.txt(d.v(u, c), liveFmt(c, live && up == null));
    return s.replace(KWRE, '<i class="kw">$1</i>');
  }

  // Grammar combos: playing a word right after one it naturally follows gives a bonus.
  const gcls = c => ({ vo: 'v', rv: 'v', qph: 'qw', surname: 'n' }[c.pos] || (c.pos === 'n' && /\(measure/.test(c.e || '') ? 'mw' : c.pos));
  const COMBOS = [
    { a: 'av', b: 'v', name: 'Helping verb + verb', bonus: { dmg: 4 }, ex: '想 + 吃', d: '+4 damage' },
    { a: 'adv', b: 'adj', name: 'Adverb + adjective', bonus: { fl: 3 }, ex: '很 + 好', d: '+3 Fluster' },
    { a: 'adv', b: 'v', name: 'Adverb + verb', bonus: { dmg: 3 }, ex: '也 + 是', d: '+3 damage' },
    { a: 'nu', b: 'mw', name: 'Number + measure word', bonus: { count: 2 }, ex: '两 + 个', d: '+2 Count first' },
    { a: 'mw', b: 'n', name: 'Measure word + noun', bonus: { block: 4 }, ex: '一碗 + 饭', d: '+4 Block' },
    { a: 'pr', b: 'v', name: 'Subject + verb', bonus: { dmg: 3 }, ex: '我 + 去', d: '+3 damage' },
    { a: 'v', b: 'p', name: 'Verb + particle', bonus: { flow: 2 }, ex: '吃 + 了', d: '+2 Flow' },
    { a: 'qw', b: 'n', name: 'Question + noun', bonus: { block: 3 }, ex: '什么 + 菜', d: '+3 Block' },
  ];
  const comboFor = (prev, c) => prev && c.tid !== 'noise' ? COMBOS.find(x => x.a === gcls(prev) && x.b === gcls(c)) || null : null;

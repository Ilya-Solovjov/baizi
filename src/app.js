/* Bǎizì (百字) — a study hub for Modern Chinese 1A, Units 1–4.
   Plain JavaScript, no build step needed to run. Progress is saved in localStorage. */
(function () {
  'use strict';
  const B = window.BAIZI;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const DAY = 864e5;
  const isHan = c => /\p{Script=Han}/u.test(c);

  // ───────────────────────── Data ─────────────────────────
  const LESSON_IDS = B.LESSONS.map(l => l.id);
  const LESSON = Object.fromEntries(B.LESSONS.map(l => [l.id, l]));
  const VOCAB = [];
  for (const l of LESSON_IDS) for (const line of B.VOCAB_RAW[l].trim().split('\n')) {
    const [tier, h, p, pos, e] = line.split('|');
    VOCAB.push({ id: l + '|' + h + '|' + p, l, tier, h, p, pos, e, syl: B.SYL[l + '|' + h] || null });
  }
  const WRITE = [];
  for (const l of LESSON_IDS) for (const line of B.WRITE_RAW[l].trim().split('\n')) {
    const [c, p, m, w] = line.split('|');
    WRITE.push({ c, p, m, w, l });
  }
  const WRITE_BY_CHAR = Object.fromEntries(WRITE.map(w => [w.c, w]));
  const GRAMMAR = B.GRAMMAR.map(g => Object.assign({}, g, { drills: g.drills.map((d, i) => Object.assign({}, d, { id: g.id + '-' + i, gid: g.id })) }));
  const G_BY_ID = Object.fromEntries(GRAMMAR.map(g => [g.id, g]));
  const ALL_DRILLS = GRAMMAR.flatMap(g => g.drills);
  const SPEAK = B.SPEAKING.map((s, i) => Object.assign({ key: 's' + i }, s));
  const CULTURE = B.CULTURE.map((c, i) => Object.assign({ key: 'c' + i }, c));

  // ───────────────────────── Storage ─────────────────────────
  const KEY = 'baizi:v1';
  const defaults = () => ({
    settings: { lessons: LESSON_IDS.slice(), optional: false, tones: true, pinyin: true, dir: 'recog', writeMode: 'dictation', dictLesson: '1.1', sound: true, quest: 'p4', sessionDate: { p3: '2026-11-19', p4: '2026-11-19' } },
    srs: {}, write: {}, gram: {}, speak: {}, culture: {}, tonesq: { right: 0, total: 0 }, cando: {}, dict: {}, days: {}, xp: 0, xpDays: {}, partner: {},
  });
  let S = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const saved = JSON.parse(raw); S = Object.assign(defaults(), saved); S.settings = Object.assign(defaults().settings, saved.settings || {}); }
  } catch (e) { /* storage unavailable: run without saving */ }
  if (!S.settings.sessionDate || !S.settings.sessionDate.p3) S.settings.sessionDate = Object.assign({ p3: '2026-11-19' }, S.settings.sessionDate);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const markDay = () => { S.days[todayKey()] = (S.days[todayKey()] || 0) + 1; };
  const streak = () => {
    let n = 0; const d = new Date();
    if (!S.days[todayKey()]) d.setDate(d.getDate() - 1);
    for (;;) { const k = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); if (!S.days[k]) break; n++; d.setDate(d.getDate() - 1); }
    return n;
  };

  // ───────────────────────── Game: XP, levels, sound, celebrations ─────────────────────────
  const LEVELS = [[0, '新手', 'Newcomer'], [80, '学生', 'Student'], [220, '好学生', 'Good student'], [450, '大学生', 'College student'],
    [800, '汉语通', 'Chinese whiz'], [1300, '老师', 'Teacher'], [2000, '教授', 'Professor'], [3000, '大师', 'Master']];
  const DAILY_GOAL = 60;
  const levelOf = xp => { let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++; return i; };
  const todayXP = () => S.xpDays[todayKey()] || 0;
  let audioCtx = null;
  function sfx(kind) {
    if (!S.settings.sound || !kind) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { good: [660, 880], bad: [233, 196], up: [523, 659, 784, 1047], done: [784, 988, 1175] }[kind] || [660];
      notes.forEach((f, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain(); const t = audioCtx.currentTime + i * 0.085;
        o.type = kind === 'bad' ? 'triangle' : 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + 0.22);
      });
    } catch (e) { }
  }
  function award(n, kind = 'good') {
    if (!(n > 0)) return;
    const before = levelOf(S.xp || 0), hadGoal = todayXP() >= DAILY_GOAL;
    S.xp = (S.xp || 0) + n; S.xpDays[todayKey()] = todayXP() + n; markDay(); save();
    const after = levelOf(S.xp);
    renderHUD(); popXP('+' + n); react(kind);
    if (after > before) { sfx('up'); celebrate('Level ' + (after + 1) + ' · ' + LEVELS[after][1] + ' · ' + LEVELS[after][2]); }
    else if (!hadGoal && todayXP() >= DAILY_GOAL) { sfx('done'); celebrate('Daily goal reached! 今天很好！'); }
    else sfx(kind);
  }
  function renderHUD() {
    const h = document.getElementById('hud'); if (!h) return;
    const xp = S.xp || 0, li = levelOf(xp), next = LEVELS[li + 1];
    const t = Math.min(1, todayXP() / DAILY_GOAL), C = 2 * Math.PI * 15;
    h.innerHTML = '<svg viewBox="0 0 36 36" class="ring" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--sunk)" stroke-width="4"/>' +
      (t > 0 ? '<circle cx="18" cy="18" r="15" fill="none" stroke="var(--jade)" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (C * t).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 18 18)"/>' : '') +
      '<text x="18" y="22.5" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink)" font-family="system-ui">' + (li + 1) + '</text></svg>' +
      '<span class="hud-text"><b class="han">' + LEVELS[li][1] + '</b><small class="tnum">' + todayXP() + ' / ' + DAILY_GOAL + ' XP today</small></span>';
    h.setAttribute('aria-label', 'Level ' + (li + 1) + ', ' + LEVELS[li][2] + '. ' + xp + ' XP total' + (next ? ', ' + (next[0] - xp) + ' to the next level' : '') + '. ' + todayXP() + ' of ' + DAILY_GOAL + ' XP toward today’s goal.');
    h.title = h.getAttribute('aria-label');
  }
  function popXP(text) { const h = document.getElementById('hud'); if (!h) return; const s = document.createElement('span'); s.className = 'xp-pop'; s.textContent = text; h.appendChild(s); setTimeout(() => s.remove(), 1000); }
  function celebrate(msg) {
    let b = document.querySelector('.banner'); if (!b) { b = document.createElement('div'); b.className = 'banner'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.innerHTML = mascot('cheer', 40) + '<span>' + esc(msg) + '</span>'; b.hidden = false; clearTimeout(b._t); b._t = setTimeout(() => { b.hidden = true; }, 3400);
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.className = 'confetti'; const dpr = window.devicePixelRatio || 1, W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; document.body.appendChild(c);
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    const cols = ['--t1', '--t2', '--t3', '--t4', '--jade'].map(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim());
    const parts = Array.from({ length: 130 }, () => ({ x: W / 2 + (Math.random() - 0.5) * 160, y: H * 0.3, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 12 - 4, r: Math.random() * 7 + 4, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4 }));
    let f = 0; const tick = () => { ctx.clearRect(0, 0, W, H); for (const p of parts) { p.vy += 0.33; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - f / 120); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); } if (++f < 120) requestAnimationFrame(tick); else c.remove(); };
    tick();
  }

  const inScope = l => S.settings.lessons.includes(l);
  const scopeUnits = () => [...new Set(S.settings.lessons.map(l => LESSON[l].unit))];
  const cardPool = () => VOCAB.filter(v => inScope(v.l) && v.tier !== 'N' && (v.tier !== 'O' || S.settings.optional));

  // ───────────────────────── Pinyin & characters ─────────────────────────
  function pyHTML(v) {
    if (!v.syl) return '<span class="py">' + esc(v.p) + '</span>';
    let out = '', i = 0;
    for (const [seg, t] of v.syl) {
      const k = v.p.indexOf(seg, i);
      if (k < 0) return '<span class="py">' + esc(v.p) + '</span>';
      out += esc(v.p.slice(i, k)) + '<span class="tc' + t + '">' + esc(seg) + '</span>';
      i = k + seg.length;
    }
    return out + esc(v.p.slice(i));
  }
  function hanHTML(v, color = true) {
    const chars = [...v.h];
    if (!color || !v.syl || v.syl.length !== chars.length) return esc(v.h);
    return chars.map((c, i) => '<span class="tc' + v.syl[i][1] + '">' + esc(c) + '</span>').join('');
  }
  const sentPy = s => (B.SENT_PY && B.SENT_PY[s]) || '';
  const TONE_MARKS = /[̀́̄̌]/g;
  const plainSyl = s => s.normalize('NFD').replace(TONE_MARKS, '').normalize('NFC');

  // ───────────────────────── Audio ─────────────────────────
  const tts = { ok: typeof window.speechSynthesis !== 'undefined', voice: null, warned: false };
  const pickVoice = () => { try { const vs = speechSynthesis.getVoices(); tts.voice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^(zh|cmn)/i.test(v.lang)) || null; } catch (e) { } };
  if (tts.ok) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { } }
  function speak(text, rate = 0.8) {
    if (!tts.ok) { toast('This browser can’t play audio.'); return; }
    const t = String(text).replace(/[［］\[\]＿]/g, '').replace(/／/g, '，');
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'zh-CN'; if (tts.voice) u.voice = tts.voice; u.rate = rate;
      speechSynthesis.speak(u);
      if (!tts.voice && !tts.warned) { tts.warned = true; toast('No Chinese voice found on this device, so audio may sound off.'); }
    } catch (e) { }
  }
  const ICON = {
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg>',
  };
  const sayBtn = (text, label = 'Play audio', big = false) => '<button class="icon-btn" data-say="' + esc(text) + '" aria-label="' + esc(label) + '"' + (big ? ' style="width:56px;height:56px"' : '') + '>' + ICON.speaker + '</button>';

  // ───────────────────────── Mascots: 小饺 the dumpling and 包包 the bun ─────────────────────────
  function mascot(mood = 'idle', size = 64, kind = 'jiao') {
    const line = 'var(--dough-line)';
    const eyes = {
      happy: '<path d="M43 61q5-7 10 0M67 61q5-7 10 0" fill="none" stroke="' + line + '" stroke-width="3" stroke-linecap="round"/>',
      wow: '<circle cx="48" cy="60" r="5.2" fill="' + line + '"/><circle cx="72" cy="60" r="5.2" fill="' + line + '"/><circle cx="49.6" cy="58.2" r="1.7" fill="#fff"/><circle cx="73.6" cy="58.2" r="1.7" fill="#fff"/>',
      sad: '<circle cx="48" cy="62" r="4" fill="' + line + '"/><circle cx="72" cy="62" r="4" fill="' + line + '"/><path d="M41 53l9 3M79 53l-9 3" stroke="' + line + '" stroke-width="2.6" stroke-linecap="round"/>',
      idle: '<circle cx="48" cy="61" r="4.2" fill="' + line + '"/><circle cx="72" cy="61" r="4.2" fill="' + line + '"/><circle cx="49.4" cy="59.6" r="1.4" fill="#fff"/><circle cx="73.4" cy="59.6" r="1.4" fill="#fff"/>',
      boss: '<circle cx="48" cy="62" r="4.2" fill="' + line + '"/><circle cx="72" cy="62" r="4.2" fill="' + line + '"/><path d="M40 53l11 4M80 53l-11 4" stroke="' + line + '" stroke-width="3" stroke-linecap="round"/>',
    };
    eyes.cheer = eyes.happy;
    const mouth = { happy: '<path d="M53 70q7 8 14 0" fill="var(--blush-deep)" stroke="' + line + '" stroke-width="2.6" stroke-linejoin="round"/>', cheer: '<path d="M52 69q8 11 16 0z" fill="var(--blush-deep)" stroke="' + line + '" stroke-width="2.6" stroke-linejoin="round"/>',
      wow: '<ellipse cx="60" cy="72" rx="4" ry="5" fill="var(--blush-deep)" stroke="' + line + '" stroke-width="2.4"/>', sad: '<path d="M54 75q6-5 12 0" fill="none" stroke="' + line + '" stroke-width="2.6" stroke-linecap="round"/>',
      idle: '<path d="M55 70q5 5 10 0" fill="none" stroke="' + line + '" stroke-width="2.6" stroke-linecap="round"/>', boss: '<path d="M54 72q6 3 12 0" fill="none" stroke="' + line + '" stroke-width="2.6" stroke-linecap="round"/>' };
    const arms = mood === 'cheer' ? '<path d="M17 62L7 44M103 62l10-18" stroke="' + line + '" stroke-width="3.2" stroke-linecap="round"/><circle cx="7" cy="42" r="4" fill="var(--dough)" stroke="' + line + '" stroke-width="2.4"/><circle cx="113" cy="42" r="4" fill="var(--dough)" stroke="' + line + '" stroke-width="2.4"/>' : '';
    const body = kind === 'bao'
      ? '<path d="M16 74C16 44 36 30 60 30s44 14 44 44c0 15-17 20-44 20S16 89 16 74z" fill="var(--dough)" stroke="' + line + '" stroke-width="3"/><path d="M50 36q10-12 20 0q-10 7-20 0z" fill="var(--dough)" stroke="' + line + '" stroke-width="2.4"/>' +
        '<path d="M38 26h44v-6c8 0 11-11 3-14c-2-8-13-9-17-3c-5-6-15-5-17 2c-9 0-11 11-3 15z" fill="var(--hat)" stroke="' + line + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M38 26h44" stroke="' + line + '" stroke-width="2.6"/>'
      : '<path d="M12 72C12 42 38 24 60 24s48 18 48 48c0 14-16 20-48 20S12 86 12 72z" fill="var(--dough)" stroke="' + line + '" stroke-width="3"/>' +
        '<path d="M36 32q5 7 1 13M48 27q5 7 1 13M60 25q5 7 1 13M72 27q5 7 1 13M84 32q4 6 1 12" fill="none" stroke="' + line + '" stroke-width="2.3" stroke-linecap="round" opacity=".55"/>';
    return '<svg class="mascot m-' + mood + '" viewBox="0 0 120 100" width="' + size + '" height="' + Math.round(size * 100 / 120) + '" aria-hidden="true">' + arms + body +
      '<ellipse cx="36" cy="71" rx="6.5" ry="3.8" fill="var(--blush)"/><ellipse cx="84" cy="71" rx="6.5" ry="3.8" fill="var(--blush)"/>' + (eyes[mood] || eyes.idle) + (mouth[mood] || mouth.idle) + '</svg>';
  }
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const BUDDY = {
    start: [['加油！', 'jiāyóu!', 'You’ve got this.'], ['一点儿一点儿。', 'yìdiǎnr yìdiǎnr.', 'A little at a time.'], ['我们走吧！', 'wǒmen zǒu ba!', 'Let’s go!'], ['五分钟就好！', 'wǔ fēnzhōng jiù hǎo!', 'Just five minutes!']],
    good: [['对！', 'duì!', 'Right!'], ['很好！', 'hěn hǎo!', 'Very good!'], ['太好了！', 'tài hǎo le!', 'Great!'], ['不错！', 'búcuò!', 'Not bad!']],
    bad: [['没关系！', 'méi guānxi!', 'It’s OK!'], ['再试一下！', 'zài shì yíxià!', 'Try again!'], ['差不多！', 'chàbuduō!', 'Almost!']],
    done: [['你真棒！', 'nǐ zhēn bàng!', 'You’re awesome!'], ['太好了！', 'tài hǎo le!', 'Great!'], ['加油！', 'jiāyóu!', 'Keep it up!']],
  };
  const buddyLine = ([zh, py, en]) => '<span class="buddy-zh">' + esc(zh) + '</span> <span class="buddy-py">' + esc(py) + '</span> <span class="buddy-en">' + esc(en) + '</span>';
  const buddy = (mood, key, size = 96) => '<div class="buddy"><div class="buddy-face">' + mascot(mood, size) + '</div><div class="buddy-bubble">' + buddyLine(pickOne(BUDDY[key])) + '</div></div>';
  let reactTimer;
  function react(kind) {
    const host = document.querySelector('.stage-buddy'); if (!host || !kind || (kind !== 'good' && kind !== 'bad' && kind !== 'done')) return;
    const mood = kind === 'good' ? 'happy' : kind === 'bad' ? 'sad' : 'cheer';
    host.innerHTML = '<div class="buddy-face hop">' + mascot(mood, 52) + '</div><div class="buddy-bubble small">' + buddyLine(pickOne(BUDDY[kind])) + '</div>';
    clearTimeout(reactTimer); reactTimer = setTimeout(() => { if (document.body.contains(host)) host.innerHTML = '<div class="buddy-face">' + mascot('idle', 52) + '</div>'; }, 2200);
  }

  let toastTimer;
  function toast(msg) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ───────────────────────── Stroke drawing (Hanzi Writer) ─────────────────────────
  const hasWriter = () => typeof window.HanziWriter !== 'undefined';
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function makeWriter(el, ch, opts = {}) {
    if (!hasWriter() || !B.STROKES[ch]) return null;
    const size = Math.max(80, Math.floor(el.getBoundingClientRect().width) || 260);
    return window.HanziWriter.create(el, ch, Object.assign({
      width: size, height: size, padding: Math.round(size * 0.07),
      showOutline: true, strokeColor: cssVar('--ink'), outlineColor: cssVar('--line'), drawingColor: cssVar('--jade'),
      highlightColor: cssVar('--jade'), drawingWidth: Math.max(10, Math.round(size / 20)),
      strokeAnimationSpeed: 1.1, delayBetweenStrokes: 160, showHintAfterMisses: 3, highlightOnComplete: true,
      charDataLoader: (c, done) => done(B.STROKES[c]),
    }, opts));
  }
  // Animate each character of a word in its own grid square.
  function strokeStrip(host, word) {
    const chars = [...word].filter(c => isHan(c) && B.STROKES[c]);
    if (!hasWriter()) { host.innerHTML = '<p class="notice">Stroke animations need the drawing library, which loads from the internet.</p>'; return; }
    host.innerHTML = '<div class="strip">' + chars.map(() => '<div class="mzg"><div class="w"></div></div>').join('') + '</div>';
    const writers = $$('.w', host).map((el, i) => makeWriter(el, chars[i], { showCharacter: false, showOutline: true }));
    let i = 0; const next = () => { if (i >= writers.length || !document.body.contains(host)) return; const w = writers[i++]; if (w) w.animateCharacter({ onComplete: next }); else next(); };
    next();
  }

  // ───────────────────────── Spaced repetition ─────────────────────────
  function nextInterval(st, g) {
    const iv = st.iv || 0, reps = st.reps || 0, ease = st.ease || 2.5;
    if (g === 0) return 0;
    if (g === 1) return reps === 0 ? 1 : Math.max(1, Math.round(iv * 1.2));
    if (g === 2) return reps === 0 ? 1 : reps === 1 ? 3 : Math.max(iv + 1, Math.round(iv * ease));
    return reps === 0 ? 4 : Math.max(iv + 2, Math.round(Math.max(iv, 1) * ease * 1.4));
  }
  function gradeCard(key, g) {
    const now = Date.now();
    const st = S.srs[key] || { iv: 0, ease: 2.5, reps: 0, lapses: 0, due: 0 };
    const iv = nextInterval(st, g);
    if (g === 0) { st.lapses++; st.reps = 0; st.iv = 0; st.ease = Math.max(1.3, st.ease - 0.2); st.due = now + 60e3; }
    else { st.iv = iv; st.reps++; if (g === 1) st.ease = Math.max(1.3, st.ease - 0.15); if (g === 3) st.ease += 0.15; st.due = now + iv * DAY; }
    st.last = now; S.srs[key] = st; markDay(); save();
    award(g === 0 ? 1 : [0, 3, 5, 6][g], g === 0 ? '' : 'good');
  }
  const fmtIv = d => d === 0 ? '1 min' : d < 30 ? d + 'd' : d < 365 ? Math.round(d / 30) + 'mo' : Math.round(d / 365) + 'y';
  const cardKey = (v, dir) => v.id + '#' + dir;
  const wordStatus = v => {
    const sts = ['recog', 'recall', 'listen'].map(d => S.srs[cardKey(v, d)]).filter(Boolean);
    if (!sts.length) return 'new';
    return sts.some(s => s.iv >= 7) ? 'solid' : 'learning';
  };

  // ───────────────────────── Shell ─────────────────────────
  const ROUTES = [
    { id: 'quest', label: 'Quests', han: '任' },
    { id: 'progress', label: 'Progress', han: '进' },
    { id: 'cards', label: 'Cards', han: '词' },
    { id: 'write', label: 'Write', han: '写' },
    { id: 'grammar', label: 'Grammar', han: '法' },
    { id: 'speak', label: 'Speak', han: '说' },
    { id: 'tones', label: 'Tones', han: '声' },
    { id: 'culture', label: 'Culture', han: '文' },
  ];
  const app = document.getElementById('app');
  app.innerHTML =
    '<header class="top"><div class="top-inner">' +
      '<a class="brand" href="#quest">' + mascot('happy', 34) + '<span class="han">百字</span><b>Bǎizì</b><span>Modern Chinese 1A · Units 1–4</span></a>' +
      '<a class="hud" id="hud" href="#progress"></a>' +
      '<button class="scope-btn" id="scopeBtn" aria-expanded="false" aria-controls="scopePanel">Lessons: <b id="scopeLabel"></b></button>' +
    '</div>' +
    '<div class="top-inner" style="padding-top:0"><nav class="tabs" id="tabs" aria-label="Sections">' +
      ROUTES.map(r => '<a class="tab" href="#' + r.id + '" data-route="' + r.id + '"><span class="han">' + r.han + '</span>' + r.label + '</a>').join('') +
    '</nav></div>' +
    '<div class="top-inner" id="scopePanel" hidden><div class="scope-panel" style="width:100%">' +
      '<span class="eyebrow">Study these lessons</span><div class="chips" id="scopeChips"></div>' +
      '<button class="linkbtn" data-scope="all">All</button><button class="linkbtn" data-scope="unit">Only the latest unit</button>' +
    '</div></div></header>' +
    '<main class="wrap" id="view"></main>';
  const viewEl = $('#view');

  function scopeLabel() {
    const ls = S.settings.lessons;
    if (ls.length === LESSON_IDS.length) return 'All (1.1–4.2)';
    const idx = ls.map(l => LESSON_IDS.indexOf(l)).sort((a, b) => a - b);
    const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
    return contiguous && idx.length > 1 ? LESSON_IDS[idx[0]] + '–' + LESSON_IDS[idx[idx.length - 1]] : ls.slice().sort().join(', ');
  }
  function renderScope() {
    $('#scopeLabel').textContent = scopeLabel();
    $('#scopeChips').innerHTML = LESSON_IDS.map(l => '<button class="chip" data-lesson="' + l + '" aria-pressed="' + inScope(l) + '" title="' + esc(LESSON[l].title) + '">' + l + '</button>').join('');
  }
  $('#scopeBtn').addEventListener('click', () => { const p = $('#scopePanel'); p.hidden = !p.hidden; $('#scopeBtn').setAttribute('aria-expanded', String(!p.hidden)); });
  $('#scopePanel').addEventListener('click', e => {
    const chip = e.target.closest('[data-lesson]'); const sc = e.target.closest('[data-scope]');
    if (chip) {
      const l = chip.dataset.lesson; const set = new Set(S.settings.lessons);
      if (set.has(l)) { if (set.size === 1) { toast('Keep at least one lesson selected.'); return; } set.delete(l); } else set.add(l);
      S.settings.lessons = LESSON_IDS.filter(x => set.has(x));
    } else if (sc) S.settings.lessons = sc.dataset.scope === 'all' ? LESSON_IDS.slice() : ['4.1', '4.2'];
    else return;
    save(); renderScope(); route();
  });

  // Global handlers: audio buttons and per-view keyboard shortcuts.
  document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) { e.preventDefault(); speak(b.dataset.say); } });
  let keyHandler = null;
  document.addEventListener('keydown', e => {
    if (!keyHandler || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    keyHandler(e);
  });

  let cleanup = [];
  function route() {
    cleanup.forEach(f => { try { f(); } catch (e) { } }); cleanup = []; keyHandler = null;
    if (tts.ok) try { speechSynthesis.cancel(); } catch (e) { }
    const id = (location.hash || '').slice(1);
    const r = ROUTES.find(x => x.id === id) || ROUTES[0];
    $$('#tabs .tab').forEach(t => { if (t.dataset.route === r.id) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    document.documentElement.classList.toggle('no-tones', !S.settings.tones);
    VIEWS[r.id](viewEl);
    const active = $('#tabs [aria-current="page"]'); if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });

  // ───────────────────────── Today ─────────────────────────
  function writeState(c) {
    const w = S.write[c]; if (!w || !w.tries) return '';
    return w.clean >= 2 ? 'solid' : w.clean >= 1 ? 'clean' : 'tried';
  }
  function renderToday(el) {
    const pool = cardPool();
    const now = Date.now();
    const dueCount = pool.reduce((n, v) => n + ['recog', 'recall', 'listen'].filter(d => { const s = S.srs[cardKey(v, d)]; return s && s.due <= now; }).length, 0);
    const started = pool.filter(v => wordStatus(v) !== 'new').length;
    const canWrite = WRITE.filter(w => (S.write[w.c] || {}).clean >= 1).length;
    const d = new Date();
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const gAll = Object.values(S.gram).reduce((a, g) => [a[0] + g.r, a[1] + g.r + g.w], [0, 0]);

    const board = WRITE.map(w => '<button class="' + [writeState(w.c), inScope(w.l) ? '' : 'out'].join(' ') + '" data-char="' + w.c + '" title="' + esc(w.c + ' ' + w.p + ' · ' + w.m + ' (' + w.l + ')') + '">' + w.c + '</button>').join('');

    const rows = B.LESSONS.map(L => {
      const words = VOCAB.filter(v => v.l === L.id && (v.tier === 'L' || v.tier === 'R'));
      const wDone = words.filter(v => wordStatus(v) !== 'new').length;
      const chars = WRITE.filter(w => w.l === L.id); const cDone = chars.filter(w => (S.write[w.c] || {}).clean >= 1).length;
      const drills = ALL_DRILLS.filter(dr => G_BY_ID[dr.gid].l === L.id);
      let gr = 0, gt = 0; drills.forEach(dr => { const s = S.gram[dr.id]; if (s) { gr += s.r; gt += s.r + s.w; } });
      const sp = SPEAK.filter(s => s.l === L.id); const spDone = sp.filter(s => S.speak[s.key]).length;
      const meter = (a, b, label) => '<div class="meter"><div class="bar"><i style="width:' + (b ? Math.round(100 * a / b) : 0) + '%"></i></div><small>' + label + '</small></div>';
      return '<tr' + (inScope(L.id) ? '' : ' style="opacity:.5"') + '><td><b class="tnum">' + L.id + '</b> ' + esc(L.title) + '<div class="han small muted">' + esc(L.zh) + '</div></td>' +
        '<td>' + meter(wDone, words.length, wDone + ' / ' + words.length + ' words') + '</td>' +
        '<td>' + meter(cDone, chars.length, cDone + ' / ' + chars.length + ' written') + '</td>' +
        '<td>' + meter(gr, gt, gt ? Math.round(100 * gr / gt) + '% of ' + gt + ' answers' : 'not drilled yet') + '</td>' +
        '<td>' + meter(spDone, sp.length, spDone + ' / ' + sp.length + ' questions') + '</td></tr>';
    }).join('');

    const cando = B.CANDO.map(u => {
      const title = u.u === 0 ? 'Prelude · 中文' : 'Unit ' + u.u + ' · ' + B.UNITS[u.u - 1].zh + ' ' + B.UNITS[u.u - 1].en;
      return '<div><h3>' + esc(title) + '</h3><ul>' + u.items.map((it, i) => { const k = u.u + '-' + i; return '<li><label><input type="checkbox" data-cando="' + k + '"' + (S.cando[k] ? ' checked' : '') + '><span>' + esc(it) + '</span></label></li>'; }).join('') + '</ul></div>';
    }).join('');

    el.innerHTML =
      '<section class="hero">' +
        '<div class="stack">' +
          '<p class="eyebrow">' + esc(dateStr) + '</p>' +
          '<h1>You can write <span class="tnum" style="color:var(--jade)">' + canWrite + '</span> of the 120 characters.</h1>' +
          '<p class="muted">The course asks you to handwrite about 100 characters from memory and recognize 200 more. Each square on the board is one character from the book’s stroke-order pages.</p>' +
          '<div class="stats">' +
            '<div class="stat"><b>' + dueCount + '</b><span>cards due for review</span></div>' +
            '<div class="stat"><b>' + started + '<small class="muted" style="font-size:.9rem"> / ' + pool.length + '</small></b><span>words started in your lessons</span></div>' +
            '<div class="stat"><b>' + streak() + '</b><span>day' + (streak() === 1 ? '' : 's') + ' in a row</span></div>' +
          '</div><div class="stats">' +
            '<div class="stat"><b>' + (S.xp || 0) + '</b><span>total XP</span></div>' +
            '<div class="stat"><b class="han">' + LEVELS[levelOf(S.xp || 0)][1] + '</b><span>level ' + (levelOf(S.xp || 0) + 1) + ' · ' + LEVELS[levelOf(S.xp || 0)][2] + '</span></div>' +
            '<div class="stat"><b>' + (LEVELS[levelOf(S.xp || 0) + 1] ? LEVELS[levelOf(S.xp || 0) + 1][0] - (S.xp || 0) : 0) + '</b><span>XP to the next level</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="panel stack">' +
          '<div class="spread"><h3><span class="han" style="color:var(--jade)">百字</span> board</h3><span class="small muted tnum">' + (gAll[1] ? Math.round(100 * gAll[0] / gAll[1]) + '% grammar accuracy' : '') + '</span></div>' +
          '<div class="board" id="board">' + board + '</div>' +
          '<div class="legend"><span><i></i>Not yet</span><span><i style="border-color:var(--ink-3)"></i>Tried</span><span><i style="background:var(--jade-soft);border-color:var(--jade)"></i>Written once</span><span><i style="background:var(--jade);border-color:var(--jade)"></i>Written twice</span></div>' +
        '</div>' +
      '</section>' +
      '<section class="quick">' +
        '<a href="#cards"><b><span class="han">词</span>Review cards</b><span>' + (dueCount ? dueCount + ' due now, plus new words' : 'Learn new words from your lessons') + '</span></a>' +
        '<a href="#write"><b><span class="han">写</span>Write characters</b><span>Draw from memory; strokes are checked as you go</span></a>' +
        '<a href="#grammar"><b><span class="han">法</span>Grammar drill</b><span>10 mixed questions, weakest patterns first</span></a>' +
        '<a href="#speak"><b><span class="han">说</span>Mock interview</b><span>Oral-test questions with model answers</span></a>' +
      '</section>' +
      '<section class="panel stack"><div class="spread"><h2>By lesson</h2><span class="small muted">Faded rows are outside your current lesson filter.</span></div>' +
        '<div class="scroll-x"><table class="lesson-table"><thead><tr><th>Lesson</th><th>Words</th><th>Characters</th><th>Grammar</th><th>Speaking</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<section class="panel stack"><div class="spread"><h2>Can you do it?</h2><span class="small muted">Tick a goal when you can do it without notes.</span></div><div class="cando">' + cando + '</div></section>' +
      '<section class="panel stack"><h2>Settings</h2>' +
        '<div class="row" style="gap:18px">' +
          '<label class="toggle"><input type="checkbox" id="setTones"' + (S.settings.tones ? ' checked' : '') + '> Color pinyin by tone</label>' +
          '<label class="toggle"><input type="checkbox" id="setPinyin"' + (S.settings.pinyin ? ' checked' : '') + '> Show pinyin under sentences</label>' +
          '<label class="toggle"><input type="checkbox" id="setSound"' + (S.settings.sound ? ' checked' : '') + '> Sound effects</label>' +
          '<label class="toggle"><input type="checkbox" id="setOptional"' + (S.settings.optional ? ' checked' : '') + '> Include optional vocabulary</label>' +
        '</div>' +
        '<div class="spread"><p class="small muted">Progress is saved in this browser only. Clearing site data erases it.</p><span id="resetArea"><button class="btn sm ghost" id="resetBtn">Reset all progress</button></span></div>' +
      '</section>';

    $('#board', el).addEventListener('click', e => { const b = e.target.closest('[data-char]'); if (!b) return; S.writeFocus = b.dataset.char; S.settings.writeMode = 'dictation'; save(); location.hash = 'write'; });
    $$('[data-cando]', el).forEach(cb => cb.addEventListener('change', () => { if (cb.checked) S.cando[cb.dataset.cando] = true; else delete S.cando[cb.dataset.cando]; save(); }));
    $('#setTones', el).addEventListener('change', e => { S.settings.tones = e.target.checked; save(); document.documentElement.classList.toggle('no-tones', !S.settings.tones); });
    $('#setPinyin', el).addEventListener('change', e => { S.settings.pinyin = e.target.checked; save(); });
    $('#setSound', el).addEventListener('change', e => { S.settings.sound = e.target.checked; save(); });
    $('#setOptional', el).addEventListener('change', e => { S.settings.optional = e.target.checked; save(); route(); });
    $('#resetBtn', el).addEventListener('click', () => {
      $('#resetArea', el).innerHTML = '<span class="confirm"><span class="small">Erase every card, score and checkmark?</span><button class="btn sm" id="resetYes" style="color:var(--bad)">Erase</button><button class="btn sm ghost" id="resetNo">Keep</button></span>';
      $('#resetYes', el).addEventListener('click', () => { const keep = S.settings; S = defaults(); S.settings = keep; save(); toast('Progress erased.'); route(); });
      $('#resetNo', el).addEventListener('click', () => route());
    });
  }

  // ───────────────────────── Cards ─────────────────────────
  const DIRS = [['recog', '汉字 → meaning'], ['recall', 'English → 汉字'], ['listen', 'Listen → meaning']];
  let cardSession = null;
  function buildCardQueue(practice) {
    const dir = S.settings.dir; const now = Date.now(); const pool = cardPool();
    if (practice) return shuffle(pool).slice(0, 15).map(v => ({ v, dir }));
    const due = pool.filter(v => { const s = S.srs[cardKey(v, dir)]; return s && s.due <= now; }).sort((a, b) => S.srs[cardKey(a, dir)].due - S.srs[cardKey(b, dir)].due);
    const fresh = pool.filter(v => !S.srs[cardKey(v, dir)]).filter(v => v.tier !== 'O' || S.settings.optional);
    // New words in lesson order, lesson vocabulary before required.
    fresh.sort((a, b) => LESSON_IDS.indexOf(a.l) - LESSON_IDS.indexOf(b.l) || 'LRO'.indexOf(a.tier) - 'LRO'.indexOf(b.tier));
    return due.slice(0, 60).concat(fresh.slice(0, 12)).map(v => ({ v, dir }));
  }
  function renderCards(el) {
    const dir = S.settings.dir; const now = Date.now(); const pool = cardPool();
    const due = pool.filter(v => { const s = S.srs[cardKey(v, dir)]; return s && s.due <= now; }).length;
    const fresh = pool.filter(v => !S.srs[cardKey(v, dir)]).length;
    el.innerHTML =
      '<section class="panel stack">' +
        '<div class="spread"><h2>Flashcards</h2><div class="seg" role="group" aria-label="Card direction">' + DIRS.map(([k, l]) => '<button data-dir="' + k + '" aria-pressed="' + (dir === k) + '">' + esc(l) + '</button>').join('') + '</div></div>' +
        '<div id="cardArea"></div>' +
      '</section>' +
      '<section class="panel stack"><div class="spread"><h2>Word list</h2><input class="search" id="wordSearch" type="search" placeholder="Search 汉字, pinyin or English" aria-label="Search words"></div><div class="scroll-x" id="wordTable"></div></section>';
    $$('[data-dir]', el).forEach(b => b.addEventListener('click', () => { S.settings.dir = b.dataset.dir; save(); cardSession = null; renderCards(el); }));
    const area = $('#cardArea', el);
    if (cardSession && cardSession.dir === dir && cardSession.i < cardSession.q.length) showCard(area);
    else {
      cardSession = null;
      area.innerHTML = '<div class="empty"><div class="big-num">' + due + '<span class="muted" style="font-size:1rem;font-weight:500"> due · ' + Math.min(fresh, 12) + ' new</span></div>' +
        '<p>' + (due + fresh ? 'Cards come from the lessons in your filter. Rate each one honestly; cards you miss come back sooner.' : 'Nothing due in these lessons right now.') + '</p>' +
        '<div class="row" style="justify-content:center">' + (due + fresh ? '<button class="btn primary" id="startCards">Start session <kbd>Enter</kbd></button>' : '') + '<button class="btn" id="practiceCards">Practice 15 random cards</button></div></div>';
      const start = practice => { cardSession = { q: buildCardQueue(practice), i: 0, again: 0, done: 0, dir }; if (!cardSession.q.length) { toast('No cards in these lessons.'); return; } showCard(area); };
      const sb = $('#startCards', area); if (sb) sb.addEventListener('click', () => start(false));
      $('#practiceCards', area).addEventListener('click', () => start(true));
      keyHandler = e => { if (e.key === 'Enter' && sb) { e.preventDefault(); start(false); } };
      if (pendingStart === 'cards') { pendingStart = null; start(!buildCardQueue(false).length); }
    }
    // word list
    const table = $('#wordTable', el);
    const drawTable = q => {
      q = q.trim().toLowerCase(); const qp = plainSyl(q);
      const rows = VOCAB.filter(v => inScope(v.l) && v.tier !== 'N' && (!q || v.h.includes(q) || plainSyl(v.p.toLowerCase()).replace(/\s/g, '').includes(qp.replace(/\s/g, '')) || v.e.toLowerCase().includes(q))).slice(0, 400);
      const label = { new: 'New', learning: 'Learning', solid: 'Solid' };
      table.innerHTML = rows.length ? '<table class="words"><thead><tr><th>汉字</th><th>Pinyin</th><th>Meaning</th><th>Lesson</th><th>Status</th><th></th></tr></thead><tbody>' + rows.map(v => {
        const st = wordStatus(v);
        return '<tr><td class="han">' + hanHTML(v, S.settings.tones) + '</td><td>' + pyHTML(v) + '</td><td>' + esc(v.e) + ' <span class="muted small">' + esc(v.pos) + '</span></td><td><span class="tag">' + v.l + (v.tier === 'O' ? ' opt' : v.tier === 'R' ? ' req' : '') + '</span></td><td><span class="tag' + (st === 'solid' ? ' jade' : '') + '">' + label[st] + '</span></td><td>' + sayBtn(v.h, 'Play ' + v.h) + '</td></tr>';
      }).join('') + '</tbody></table>' : '<p class="muted">No words match.</p>';
    };
    drawTable(''); $('#wordSearch', el).addEventListener('input', e => drawTable(e.target.value));
  }
  function showCard(area) {
    const sess = cardSession; const { v, dir } = sess.q[sess.i]; const key = cardKey(v, dir);
    const st = S.srs[key] || { iv: 0, reps: 0, ease: 2.5 };
    let front;
    if (dir === 'recog') front = '<div class="prompt-han han">' + esc(v.h) + '</div>';
    else if (dir === 'recall') front = '<div class="prompt-en">' + esc(v.e) + '</div><div class="muted small">' + esc(v.pos) + ' · write or say it in Chinese</div>';
    else front = sayBtn(v.h, 'Play the word', true) + '<div class="muted small">Listen, then recall the meaning</div>';
    area.innerHTML =
      '<div class="study">' +
        '<div class="progress" aria-label="Session progress"><i style="width:' + Math.round(100 * sess.i / sess.q.length) + '%"></i></div>' +
        '<div class="meta-line"><span class="tag">' + v.l + '</span>' + (st.reps ? '' : '<span class="tag jade">new</span>') + '<span class="tag tnum">' + (sess.i + 1) + ' / ' + sess.q.length + '</span></div>' +
        front +
        '<button class="btn primary" id="reveal">Show answer <kbd>Space</kbd></button>' +
        '<div class="answer" id="answer" hidden>' +
          '<div class="row" style="justify-content:center"><span class="han" style="font-size:2.6rem;line-height:1.1">' + hanHTML(v, S.settings.tones) + '</span>' + sayBtn(v.h) + '</div>' +
          '<div class="prompt-py">' + pyHTML(v) + '</div>' +
          '<div>' + esc(v.e) + ' <span class="muted small">(' + esc(v.pos) + ')</span></div>' +
          '<button class="linkbtn" id="strokesBtn">Watch stroke order</button><div id="strokeHost"></div>' +
          '<div class="grade" style="margin-top:8px">' +
            [['again', 'Again', 0], ['', 'Hard', 1], ['good', 'Good', 2], ['', 'Easy', 3]].map(([cls, l, g]) => '<button class="' + cls + '" data-g="' + g + '">' + l + '<small>' + fmtIv(nextInterval(st, g)) + ' · ' + (g + 1) + '</small></button>').join('') +
          '</div>' +
        '</div>' +
      '</div>';
    if (dir === 'listen') setTimeout(() => speak(v.h), 150);
    const reveal = () => { if (!$('#answer', area).hidden) return; $('#answer', area).hidden = false; $('#reveal', area).hidden = true; if (dir !== 'listen') speak(v.h); };
    $('#reveal', area).addEventListener('click', reveal);
    $('#strokesBtn', area).addEventListener('click', () => strokeStrip($('#strokeHost', area), v.h));
    const grade = g => {
      gradeCard(key, g); sess.done++;
      if (g === 0) { sess.again++; sess.q.splice(Math.min(sess.q.length, sess.i + 4), 0, { v, dir }); }
      sess.i++;
      if (sess.i >= sess.q.length) {
        area.innerHTML = '<div class="empty"><div class="big-num">' + sess.done + '</div><p>cards reviewed' + (sess.again ? ', ' + sess.again + ' sent back for another look' : '') + '.</p><div class="row" style="justify-content:center"><button class="btn primary" id="again">Another session</button><a class="btn" href="#write">Write characters next</a></div></div>';
        cardSession = null; keyHandler = null;
        $('#again', area).addEventListener('click', () => route());
      } else showCard(area);
    };
    $$('[data-g]', area).forEach(b => b.addEventListener('click', () => grade(+b.dataset.g)));
    keyHandler = e => {
      if ((e.key === ' ' || e.key === 'Enter') && $('#answer', area) && $('#answer', area).hidden) { e.preventDefault(); reveal(); }
      else if (/^[1-4]$/.test(e.key) && !$('#answer', area).hidden) { e.preventDefault(); grade(+e.key - 1); }
      else if (e.key.toLowerCase() === 'p') speak(v.h);
    };
  }

  // ───────────────────────── Write ─────────────────────────
  let writeSession = null;
  function buildWriteQueue() {
    const pool = WRITE.filter(w => inScope(w.l));
    const score = w => { const s = S.write[w.c]; if (!s || !s.tries) return -1000 + LESSON_IDS.indexOf(w.l) * 20 + WRITE.indexOf(w) % 15; return (s.clean / s.tries) * 100 + Math.min(50, (Date.now() - (s.last || 0)) / -DAY); };
    let q = pool.slice().sort((a, b) => score(a) - score(b)).slice(0, 10);
    if (S.writeFocus && WRITE_BY_CHAR[S.writeFocus]) { const f = WRITE_BY_CHAR[S.writeFocus]; q = [f].concat(q.filter(w => w !== f)).slice(0, 10); }
    S.writeFocus = null; save();
    return q;
  }
  function renderWrite(el) {
    const mode = S.settings.writeMode;
    el.innerHTML =
      '<section class="panel stack">' +
        '<div class="spread"><h2>Write characters</h2><div class="seg" role="group" aria-label="Writing mode">' +
          [['dictation', 'From memory'], ['learn', 'Learn strokes'], ['paper', 'Mock dictation']].map(([k, l]) => '<button data-mode="' + k + '" aria-pressed="' + (mode === k) + '">' + l + '</button>').join('') +
        '</div></div>' +
        '<p class="small muted" id="writeHelp"></p>' +
        '<div id="writeArea"></div>' +
      '</section>';
    $$('[data-mode]', el).forEach(b => b.addEventListener('click', () => { S.settings.writeMode = b.dataset.mode; save(); writeSession = null; renderWrite(el); }));
    const help = {
      dictation: 'You see the meaning and pinyin. Draw the character stroke by stroke in the grid. Wrong strokes are rejected, and a hint flashes after three misses. One miss or fewer counts as a clean write.',
      learn: 'Watch the stroke order once, then trace over the outline. Tracing doesn’t count toward the 百字 board.',
      paper: 'Like the in-class dictation: number a sheet of paper, play each item, and write the characters, pinyin and English. Then check your answers and mark each one.',
    };
    $('#writeHelp', el).textContent = help[mode];
    if (mode === 'paper') return renderDictation($('#writeArea', el));
    if (!hasWriter()) { $('#writeArea', el).innerHTML = '<p class="notice">The stroke-checking library didn’t load (it comes from cdn.jsdelivr.net). Check your connection and reload, or use Mock dictation with paper.</p>'; return; }
    if (!writeSession || writeSession.mode !== mode || writeSession.i >= writeSession.q.length) writeSession = { mode, q: buildWriteQueue(), i: 0, clean: 0 };
    if (!writeSession.q.length) { $('#writeArea', el).innerHTML = '<p class="muted">No characters in these lessons.</p>'; return; }
    showWrite($('#writeArea', el));
  }
  function showWrite(area) {
    const sess = writeSession; const w = sess.q[sess.i]; const learn = sess.mode === 'learn';
    const wordMasked = [...w.w].map(c => c === w.c ? '＿' : c).join('');
    const vocab = VOCAB.find(v => v.h === w.w) || VOCAB.find(v => v.h.includes(w.c));
    area.innerHTML =
      '<div class="progress"><i style="width:' + Math.round(100 * sess.i / sess.q.length) + '%"></i></div>' +
      '<div class="write-layout" style="margin-top:14px">' +
        '<div class="stack">' +
          '<div class="meta-line" style="justify-content:flex-start"><span class="tag">' + w.l + '</span><span class="tag tnum">' + (sess.i + 1) + ' / ' + sess.q.length + '</span></div>' +
          '<div class="prompt-en" style="font-family:var(--font-display);font-size:1.6rem;font-weight:700">' + esc(w.m) + '</div>' +
          '<div class="row"><span style="font-size:1.4rem" class="tc' + tonePy(w.p) + '">' + esc(w.p) + '</span>' + sayBtn(w.w === w.c ? w.c : w.w, 'Play the word') + '</div>' +
          (w.w !== w.c ? '<p class="muted">In the word <span class="han" style="font-size:1.25rem;color:var(--ink)">' + esc(wordMasked) + '</span>' + (vocab ? ' · ' + esc(vocab.p) + ' · ' + esc(vocab.e) : '') + '</p>' : '') +
          '<div id="writeResult" aria-live="polite"></div>' +
          '<div class="row">' +
            (learn ? '' : '<button class="btn sm" id="hintBtn">Show outline</button>') +
            '<button class="btn sm" id="animBtn">Watch strokes</button>' +
            '<button class="btn sm ghost" id="skipBtn">Skip</button>' +
            '<button class="btn sm primary" id="nextBtn" hidden>Next <kbd>Enter</kbd></button>' +
          '</div>' +
        '</div>' +
        '<div><div class="mzg pad"><div id="pad"></div></div><p class="small muted" style="text-align:center;margin-top:6px">Draw with your finger, pen or mouse</p></div>' +
      '</div>';
    let usedHint = false, finished = false;
    const pad = $('#pad', area);
    const writer = makeWriter(pad, w.c, { showOutline: learn, showCharacter: false });
    cleanup.push(() => { try { writer && writer.cancelQuiz(); } catch (e) { } });
    const done = mistakes => {
      if (finished) return; finished = true;
      const s = S.write[w.c] || { tries: 0, clean: 0, traced: 0 };
      const clean = !learn && !usedHint && mistakes <= 1;
      if (learn) s.traced = (s.traced || 0) + 1; else { s.tries++; if (clean) { s.clean++; sess.clean++; } s.last = Date.now(); s.lastMistakes = mistakes; }
      S.write[w.c] = s; markDay(); save(); award(learn ? 5 : clean ? 15 : 4, learn || clean ? 'good' : 'bad');
      $('#writeResult', area).innerHTML = learn ? '<div class="result ok">Traced. Try it from memory next.</div>'
        : clean ? '<div class="result ok">Clean! ' + (mistakes ? '1 slip.' : 'No mistakes.') + '</div>'
        : '<div class="result no">' + (usedHint ? 'Done with the outline showing.' : mistakes + ' mistakes.') + ' It’ll come back sooner.</div>';
      $('#nextBtn', area).hidden = false; $('#skipBtn', area).hidden = true; const hb = $('#hintBtn', area); if (hb) hb.hidden = true;
      $('#nextBtn', area).focus();
    };
    const startQuiz = () => writer && writer.quiz({ onComplete: s => done(s.totalMistakes) });
    if (learn && writer) writer.animateCharacter({ onComplete: () => { writer.hideCharacter(); startQuiz(); } }); else startQuiz();
    const hb = $('#hintBtn', area); if (hb) hb.addEventListener('click', () => { usedHint = true; writer && writer.showOutline(); });
    $('#animBtn', area).addEventListener('click', () => { if (!writer) return; usedHint = true; writer.cancelQuiz(); writer.animateCharacter({ onComplete: () => { if (!finished) { writer.hideCharacter(); startQuiz(); } } }); });
    const next = () => { sess.i++; if (sess.i >= sess.q.length) finishWrite(area); else showWrite(area); };
    $('#skipBtn', area).addEventListener('click', next);
    $('#nextBtn', area).addEventListener('click', next);
    keyHandler = e => { if (e.key === 'Enter' && finished) { e.preventDefault(); next(); } else if (e.key.toLowerCase() === 'p') speak(w.w); };
  }
  const tonePy = p => { for (const ch of p.normalize('NFD')) { const t = { '̄': 1, '́': 2, '̌': 3, '̀': 4 }[ch]; if (t) return t; } return 5; };
  function finishWrite(area) {
    const sess = writeSession; writeSession = null; keyHandler = null;
    area.innerHTML = '<div class="empty"><div class="big-num">' + sess.clean + ' / ' + sess.q.length + '</div><p>' + (sess.mode === 'learn' ? 'characters traced.' : 'written cleanly from memory.') + '</p>' +
      '<div class="strip">' + sess.q.map(w => '<div class="mzg" style="width:56px;display:grid;place-items:center"><span class="han" style="font-size:1.8rem;color:' + (writeState(w.c) === 'solid' || writeState(w.c) === 'clean' ? 'var(--jade)' : 'var(--ink-2)') + '">' + w.c + '</span></div>').join('') + '</div>' +
      '<div class="row" style="justify-content:center"><button class="btn primary" id="moreWrite">Ten more</button><a class="btn" href="#progress">See the 百字 board</a></div></div>';
    $('#moreWrite', area).addEventListener('click', () => route());
  }
  function renderDictation(area) {
    const lessons = LESSON_IDS.filter(inScope);
    if (!lessons.includes(S.settings.dictLesson)) S.settings.dictLesson = lessons[lessons.length - 1];
    const l = S.settings.dictLesson;
    const chars = new Set(WRITE.filter(w => w.l === l).map(w => w.c));
    const words = shuffle(VOCAB.filter(v => v.l === l && (v.tier === 'L' || v.tier === 'R') && [...v.h].some(c => chars.has(c))))
      .filter((v, i, a) => a.findIndex(x => x.h === v.h) === i).slice(0, 7);
    const sents = shuffle(GRAMMAR.filter(g => g.l === l).flatMap(g => g.ex).filter(([zh]) => [...zh].length <= 12 && !zh.includes(':')))
      .slice(0, Math.min(3, 10 - words.length));
    const items = words.map(v => ({ zh: v.h, py: v.p, en: v.e })).concat(sents.map(([zh, en]) => ({ zh, py: sentPy(zh), en })));
    const prev = S.dict[l];
    area.innerHTML =
      '<div class="spread" style="margin-bottom:12px"><label class="row small">Lesson <select id="dictLesson" class="search" style="width:auto">' + lessons.map(x => '<option value="' + x + '"' + (x === l ? ' selected' : '') + '>' + x + ' · ' + esc(LESSON[x].title) + '</option>').join('') + '</select></label>' +
      '<span class="small muted">' + (prev ? 'Last score: ' + prev.score + ' / ' + prev.total : 'No score yet for this lesson') + '</span></div>' +
      '<div class="row" style="margin-bottom:10px"><label class="toggle"><input type="checkbox" id="dictHint"> Show English prompts</label><button class="btn sm" id="dictNew">New list</button></div>' +
      '<ol class="dict-list" id="dictList">' + items.map((it, i) =>
        '<li><div class="stack" style="gap:2px">' +
          '<div class="row">' + sayBtn(it.zh, 'Play item ' + (i + 1)) + '<span class="hint small muted" hidden>' + esc(it.en) + '</span></div>' +
          '<div class="ans"><span class="han" style="font-size:1.3rem">' + esc(it.zh) + '</span> <span class="py">' + esc(it.py) + '</span><div class="small muted">' + esc(it.en) + '</div></div>' +
        '</div><div class="mark" data-i="' + i + '"><button class="y" aria-pressed="false">Got it</button><button class="n" aria-pressed="false">Missed</button></div></li>').join('') + '</ol>' +
      '<div class="row" style="margin-top:12px"><button class="btn primary" id="dictCheck">Check answers</button><span id="dictScore" class="small" aria-live="polite"></span></div>';
    $('#dictLesson', area).addEventListener('change', e => { S.settings.dictLesson = e.target.value; save(); renderDictation(area); });
    $('#dictNew', area).addEventListener('click', () => renderDictation(area));
    $('#dictHint', area).addEventListener('change', e => $$('.hint', area).forEach(h => h.hidden = !e.target.checked));
    const marks = new Array(items.length).fill(null);
    $('#dictCheck', area).addEventListener('click', () => { $('#dictList', area).classList.add('revealed'); $('#dictCheck', area).hidden = true; $('#dictScore', area).textContent = 'Mark each item to save your score.'; });
    $$('.mark', area).forEach(m => m.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const i = +m.dataset.i;
      marks[i] = b.classList.contains('y'); $$('button', m).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      if (marks.every(x => x !== null)) {
        const score = marks.filter(Boolean).length; S.dict[l] = { score, total: items.length, at: Date.now() }; markDay(); save(); award(score * 3 + 5, 'done');
        $('#dictScore', area).innerHTML = '<b>' + score + ' / ' + items.length + '</b> saved for lesson ' + l + '.';
      }
    }));
  }

  // ───────────────────────── Grammar ─────────────────────────
  let drillSession = null;
  const gAcc = g => { let r = 0, t = 0; g.drills.forEach(d => { const s = S.gram[d.id]; if (s) { r += s.r; t += s.r + s.w; } }); return [r, t]; };
  function renderGrammar(el, detailId) {
    if (pendingStart === 'grammar') { pendingStart = null; return startDrill(el, pickMixed(GRAMMAR.filter(g => inScope(g.l)))); }
    if (drillSession) return runDrill(el);
    const pats = GRAMMAR.filter(g => inScope(g.l));
    if (detailId && G_BY_ID[detailId]) return renderPattern(el, G_BY_ID[detailId]);
    let tr = 0, tt = 0; pats.forEach(g => { const [r, t] = gAcc(g); tr += r; tt += t; });
    el.innerHTML =
      '<section class="panel spread"><div class="stack" style="gap:4px"><h2>Grammar patterns</h2><p class="muted small">' + pats.length + ' patterns in your lessons' + (tt ? ' · ' + Math.round(100 * tr / tt) + '% correct so far' : '') + '</p></div>' +
      '<button class="btn primary" id="mixed">Mixed drill · 10 questions</button></section>' +
      LESSON_IDS.filter(inScope).map(l => {
        const ps = pats.filter(g => g.l === l); if (!ps.length) return '';
        return '<section class="lesson-group"><h3><span class="tag">' + l + '</span>' + esc(LESSON[l].title) + '</h3><div class="pattern-list">' + ps.map(g => {
          const [r, t] = gAcc(g);
          return '<button class="pattern" data-g="' + g.id + '"><b>' + esc(g.title) + '</b><span class="form">' + esc(g.form) + '</span><span class="acc">' + (t ? Math.round(100 * r / t) + '%<br>' + r + '/' + t : g.drills.length + ' drills') + '</span></button>';
        }).join('') + '</div></section>';
      }).join('');
    $('#mixed', el).addEventListener('click', () => startDrill(el, pickMixed(pats)));
    $$('[data-g]', el).forEach(b => b.addEventListener('click', () => { renderPattern(el, G_BY_ID[b.dataset.g]); window.scrollTo(0, 0); }));
  }
  function pickMixed(pats) {
    const drills = pats.flatMap(g => g.drills);
    const weight = d => { const s = S.gram[d.id]; if (!s) return 2 + Math.random(); return (s.w + 1) / (s.r + s.w + 1) + Math.random() * 0.8; };
    return drills.map(d => [weight(d), d]).sort((a, b) => b[0] - a[0]).slice(0, 10).map(x => x[1]);
  }
  function renderPattern(el, g) {
    const showPy = S.settings.pinyin;
    el.innerHTML =
      '<section class="panel stack">' +
        '<div class="row"><button class="icon-btn" id="backG" aria-label="Back to patterns">' + ICON.back + '</button><span class="tag">' + g.l + '</span></div>' +
        '<h2>' + esc(g.title) + '</h2>' +
        '<p class="han" style="font-size:1.2rem;color:var(--jade)">' + esc(g.form) + '</p>' +
        '<p style="max-width:62ch">' + esc(g.note) + '</p>' +
        '<div>' + g.ex.map(([zh, en]) => '<div class="example"><div><div class="zh">' + esc(zh) + '</div>' + (showPy ? '<div class="py small">' + esc(sentPy(zh)) + '</div>' : '') + '<div class="en">' + esc(en) + '</div></div>' + sayBtn(zh) + '</div>').join('') + '</div>' +
        '<div class="row"><button class="btn primary" id="drillThis">Drill this pattern · ' + g.drills.length + '</button></div>' +
      '</section>';
    $('#backG', el).addEventListener('click', () => renderGrammar(el));
    $('#drillThis', el).addEventListener('click', () => startDrill(el, shuffle(g.drills)));
  }
  function startDrill(el, drills) { drillSession = { q: drills, i: 0, right: 0, missed: [] }; runDrill(el); window.scrollTo(0, 0); }
  function runDrill(el) {
    const sess = drillSession; const d = sess.q[sess.i]; const g = G_BY_ID[d.gid]; const showPy = S.settings.pinyin && !d.nopy;
    const qHTML = d.q ? '<div class="drill-q">' + esc(d.q).replace(/＿/g, '<span class="blank">　</span>') + '</div>' + (showPy && sentPy(d.q) ? '<div class="py small">' + esc(sentPy(d.q)).replace(/＿/g, '___') + '</div>' : '') : '';
    let body = '';
    let order = null;
    if (d.t === 'mc' || d.t === 'pick') {
      order = shuffle(d.opts.map((o, i) => i));
      body = '<div class="opts">' + order.map((oi, k) => '<button class="opt" data-oi="' + oi + '"><span class="k">' + (k + 1) + '</span><span class="zh">' + esc(d.opts[oi]) + '</span>' + (showPy && sentPy(d.opts[oi]) ? '<span class="py">' + esc(sentPy(d.opts[oi])) + '</span>' : '') + '</button>').join('') + '</div>';
    } else {
      let sh = shuffle(d.words.map((w, i) => i)); let guard = 0;
      while (d.words.length > 1 && sh.map(i => d.words[i]).join('') === d.words.join('') && guard++ < 10) sh = shuffle(sh);
      body = '<div class="tiles answer-line" id="answerLine" aria-label="Your sentence"></div><div class="tiles" id="bank">' + sh.map(i => '<button class="tile" data-wi="' + i + '">' + esc(d.words[i]) + '</button>').join('') + '</div><button class="btn primary" id="checkOrder" disabled>Check</button>';
    }
    el.innerHTML =
      '<section class="panel study">' +
        '<div class="progress"><i style="width:' + Math.round(100 * sess.i / sess.q.length) + '%"></i></div>' +
        '<div class="spread" style="width:100%"><button class="linkbtn" id="quitDrill">End drill</button><span class="small muted">' + esc(g.title) + ' · <span class="tnum">' + (sess.i + 1) + ' / ' + sess.q.length + '</span></span></div>' +
        '<p class="eyebrow">' + (d.t === 'mc' ? 'Fill the blank' : d.t === 'pick' ? 'Choose the correct sentence' : 'Put the words in order') + '</p>' +
        '<p class="prompt-en" style="font-size:1.1rem">' + esc(d.en) + '</p>' +
        qHTML + body +
        '<div id="fb" style="width:100%;display:grid;justify-items:center;gap:10px"></div>' +
      '</section>';
    $('#quitDrill', el).addEventListener('click', () => { drillSession = null; renderGrammar(el); });
    let answered = false;
    const record = ok => {
      answered = true; const s = S.gram[d.id] || { r: 0, w: 0 }; ok ? s.r++ : s.w++; s.last = Date.now(); S.gram[d.id] = s; markDay(); save();
      sess.combo = ok ? (sess.combo || 0) + 1 : 0; award(ok ? 10 + Math.min(10, 2 * (sess.combo - 1)) : 2, ok ? 'good' : 'bad');
      if (ok) sess.right++; else if (!sess.missed.includes(d.gid)) sess.missed.push(d.gid);
      const correct = d.t === 'order' ? d.words.join('') : d.opts[d.a];
      const fullSentence = d.t === 'mc' && d.q && d.q.includes('＿') ? d.q.replace('＿', d.opts[d.a]) : correct;
      $('#fb', el).innerHTML = '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Correct.' + (sess.combo >= 3 ? ' Combo ×' + sess.combo + '!' : '') : 'Not quite.') + '</b>' +
        (ok ? '' : '<div><span class="han" style="font-size:1.1rem">' + esc(correct) + '</span></div>') + (d.why ? '<div class="small">' + esc(d.why) + '</div>' : '') + '</div>' +
        '<div class="row">' + (/[一-鿿]/.test(fullSentence) ? sayBtn(fullSentence.replace(/^[AB]: /, '')) : '') + '<button class="btn primary" id="nextQ">' + (sess.i + 1 < sess.q.length ? 'Next' : 'See results') + ' <kbd>Enter</kbd></button></div>';
      $('#nextQ', el).addEventListener('click', nextQ); $('#nextQ', el).focus();
    };
    const nextQ = () => { sess.i++; if (sess.i >= sess.q.length) finishDrill(el); else runDrill(el); };
    if (d.t === 'mc' || d.t === 'pick') {
      const choose = btn => { if (answered) return; const oi = +btn.dataset.oi; $$('.opt', el).forEach(b => { b.disabled = true; if (+b.dataset.oi === d.a) b.classList.add('right'); }); if (oi !== d.a) btn.classList.add('wrong'); record(oi === d.a); };
      $$('.opt', el).forEach(b => b.addEventListener('click', () => choose(b)));
      keyHandler = e => { if (!answered && /^[1-9]$/.test(e.key)) { const b = $$('.opt', el)[+e.key - 1]; if (b) { e.preventDefault(); choose(b); } } else if (answered && e.key === 'Enter') { e.preventDefault(); nextQ(); } };
    } else {
      const line = $('#answerLine', el), bank = $('#bank', el), check = $('#checkOrder', el); const picked = [];
      const sync = () => { line.innerHTML = picked.map((wi, k) => '<button class="tile" data-k="' + k + '">' + esc(d.words[wi]) + '</button>').join(''); $$('.tile', bank).forEach(t => t.classList.toggle('used', picked.includes(+t.dataset.wi))); check.disabled = picked.length !== d.words.length; };
      bank.addEventListener('click', e => { const t = e.target.closest('.tile'); if (!t || answered || picked.includes(+t.dataset.wi)) return; picked.push(+t.dataset.wi); sync(); });
      line.addEventListener('click', e => { const t = e.target.closest('.tile'); if (!t || answered) return; picked.splice(+t.dataset.k, 1); sync(); });
      check.addEventListener('click', () => { if (answered) return; const ok = picked.map(i => d.words[i]).join('') === d.words.join(''); check.hidden = true; line.style.borderColor = ok ? 'var(--good)' : 'var(--bad)'; record(ok); });
      keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); if (answered) nextQ(); else if (!check.disabled) check.click(); } else if (e.key === 'Backspace' && !answered && picked.length) { e.preventDefault(); picked.pop(); sync(); } };
    }
  }
  function finishDrill(el) {
    const sess = drillSession; drillSession = null; keyHandler = null;
    el.innerHTML = '<section class="panel empty"><div class="big-num">' + sess.right + ' / ' + sess.q.length + '</div><p>correct.</p>' +
      (sess.missed.length ? '<div class="stack" style="justify-items:center"><span class="eyebrow">Review these patterns</span><div class="row" style="justify-content:center">' + sess.missed.map(id => '<button class="btn sm" data-g="' + id + '">' + esc(G_BY_ID[id].title) + '</button>').join('') + '</div></div>' : '<p class="muted">No misses. Nice work.</p>') +
      '<div class="row" style="justify-content:center"><button class="btn primary" id="again">Another mixed drill</button><button class="btn" id="toList">All patterns</button></div></section>';
    $('#again', el).addEventListener('click', () => startDrill(el, pickMixed(GRAMMAR.filter(g => inScope(g.l)))));
    $('#toList', el).addEventListener('click', () => renderGrammar(el));
    $$('[data-g]', el).forEach(b => b.addEventListener('click', () => renderPattern(el, G_BY_ID[b.dataset.g])));
  }

  // ───────────────────────── Speak ─────────────────────────
  let speakSession = null;
  function renderSpeak(el) {
    const pool = SPEAK.filter(s => inScope(s.l));
    el.innerHTML =
      '<section class="panel stack" id="interview"></section>' +
      '<section class="panel stack"><h2>Question bank</h2><p class="small muted">Every question for your lessons. Tap play to hear it.</p>' +
      LESSON_IDS.filter(inScope).map(l => {
        const qs = pool.filter(s => s.l === l); if (!qs.length) return '';
        return '<div class="lesson-group"><h3><span class="tag">' + l + '</span>' + esc(LESSON[l].title) + '</h3>' + qs.map(s => { const r = S.speak[s.key];
          return '<div class="example"><div><div class="zh">' + esc(s.q) + '</div>' + (S.settings.pinyin ? '<div class="py small">' + esc(sentPy(s.q)) + '</div>' : '') + '<div class="en">' + esc(s.en) + (r ? ' · <span class="tag' + (r.rating === 'smooth' ? ' jade' : '') + '">' + esc(r.rating) + '</span>' : '') + '</div></div>' + sayBtn(s.q) + '</div>'; }).join('') + '</div>';
      }).join('') + '</section>';
    const box = $('#interview', el);
    if (speakSession) return showSpeak(box);
    const practiced = pool.filter(s => S.speak[s.key]).length;
    box.innerHTML = '<div class="spread"><h2>Mock interview</h2><span class="small muted tnum">' + practiced + ' / ' + pool.length + ' questions practiced</span></div>' +
      '<p class="muted" style="max-width:62ch">Like the one-on-one oral tests. You’ll get 5 questions. Answer out loud in full sentences before you look at the model answer. In model answers, ［brackets］ mark the parts to swap for your own details.</p>' +
      '<div class="row"><button class="btn primary" id="startInt">Start interview <kbd>Enter</kbd></button></div>';
    const start = () => {
      const fresh = shuffle(pool.filter(s => !S.speak[s.key])); const rest = shuffle(pool.filter(s => S.speak[s.key])).sort((a, b) => (S.speak[a.key].rating === 'smooth') - (S.speak[b.key].rating === 'smooth'));
      speakSession = { q: fresh.concat(rest).slice(0, 5), i: 0, smooth: 0 }; showSpeak(box);
    };
    $('#startInt', box).addEventListener('click', start);
    if (pendingStart === 'speak') { pendingStart = null; start(); return; }
    keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); start(); } };
  }
  function showSpeak(box) {
    const sess = speakSession; const s = sess.q[sess.i];
    box.innerHTML =
      '<div class="study" style="padding:6px 0">' +
        '<div class="progress"><i style="width:' + Math.round(100 * sess.i / sess.q.length) + '%"></i></div>' +
        '<div class="spread" style="width:100%"><button class="linkbtn" id="quitInt">End interview</button><span class="tag tnum">' + s.l + ' · ' + (sess.i + 1) + ' / ' + sess.q.length + '</span></div>' +
        '<p class="eyebrow">Your teacher asks</p>' +
        '<div class="row" style="justify-content:center"><span class="han" style="font-size:clamp(1.6rem,6vw,2.4rem)">' + esc(s.q) + '</span>' + sayBtn(s.q) + '</div>' +
        '<div class="py" id="qPy"' + (S.settings.pinyin ? '' : ' hidden') + '>' + esc(sentPy(s.q)) + '</div>' +
        '<div class="row" style="justify-content:center"><button class="btn sm ghost" id="showEn">Show English</button>' + (S.settings.pinyin ? '' : '<button class="btn sm ghost" id="showPy">Show pinyin</button>') + '</div>' +
        '<p class="muted" id="qEn" hidden>' + esc(s.en) + '</p>' +
        '<button class="btn primary" id="showA">I answered out loud · show model <kbd>Space</kbd></button>' +
        '<div class="answer" id="ans" hidden>' +
          '<p class="eyebrow">A model answer</p>' +
          '<div class="row" style="justify-content:center"><span class="han" style="font-size:1.5rem">' + esc(s.a) + '</span>' + sayBtn(s.a) + '</div>' +
          '<div class="py">' + esc(sentPy(s.a)) + '</div><div class="muted">' + esc(s.ae) + '</div>' +
          '<p class="eyebrow" style="margin-top:10px">How did your answer go?</p>' +
          '<div class="row" style="justify-content:center">' + [['smooth', 'Smooth', 1], ['hesitant', 'Hesitant', 2], ['stuck', 'Got stuck', 3]].map(([k, l, n]) => '<button class="btn" data-rate="' + k + '">' + l + ' <kbd>' + n + '</kbd></button>').join('') + '</div>' +
        '</div>' +
      '</div>';
    setTimeout(() => speak(s.q), 150);
    $('#quitInt', box).addEventListener('click', () => { speakSession = null; route(); });
    $('#showEn', box).addEventListener('click', e => { $('#qEn', box).hidden = false; e.target.hidden = true; });
    const sp = $('#showPy', box); if (sp) sp.addEventListener('click', () => { $('#qPy', box).hidden = false; sp.hidden = true; });
    const reveal = () => { $('#ans', box).hidden = false; $('#showA', box).hidden = true; };
    $('#showA', box).addEventListener('click', reveal);
    const rate = k => {
      const r = S.speak[s.key] || { n: 0 }; r.n++; r.rating = k; r.last = Date.now(); S.speak[s.key] = r; markDay(); save(); award({ smooth: 10, hesitant: 6, stuck: 3 }[k], k === 'smooth' ? 'good' : '');
      if (k === 'smooth') sess.smooth++;
      sess.i++;
      if (sess.i >= sess.q.length) {
        const n = sess.smooth; speakSession = null; keyHandler = null;
        box.innerHTML = '<div class="empty"><div class="big-num">' + n + ' / 5</div><p>answered smoothly.</p><div class="row" style="justify-content:center"><button class="btn primary" id="again">Another interview</button></div></div>';
        $('#again', box).addEventListener('click', () => route());
      } else showSpeak(box);
    };
    $$('[data-rate]', box).forEach(b => b.addEventListener('click', () => rate(b.dataset.rate)));
    keyHandler = e => {
      if ((e.key === ' ' || e.key === 'Enter') && $('#ans', box).hidden) { e.preventDefault(); reveal(); }
      else if (!$('#ans', box).hidden && /^[1-3]$/.test(e.key)) { e.preventDefault(); rate(['smooth', 'hesitant', 'stuck'][+e.key - 1]); }
      else if (e.key.toLowerCase() === 'p') speak(s.q);
    };
  }

  // ───────────────────────── Tones ─────────────────────────
  let toneSession = { right: 0, total: 0 };
  function contourSVG(t) {
    const paths = { 1: 'M10 14 H70', 2: 'M10 40 L70 12', 3: 'M10 28 Q32 58 48 50 T70 18', 4: 'M10 10 L70 54' };
    return '<svg viewBox="0 0 80 64" role="img" aria-label="Tone ' + t + ' contour"><g stroke="var(--line)" stroke-width="1">' + [8, 20, 32, 44, 56].map(y => '<line x1="6" x2="74" y1="' + y + '" y2="' + y + '"/>').join('') + '</g><path d="' + paths[t] + '" fill="none" stroke="var(--t' + t + ')" stroke-width="4.5" stroke-linecap="round"/></svg>';
  }
  function renderTones(el) {
    el.innerHTML =
      '<section class="panel stack"><div class="spread"><h2>Tone quiz</h2><span class="small muted tnum" id="toneScore"></span></div>' +
        '<p class="small muted">Pick the tone for each syllable. Use · for a neutral tone. Play the word for a hint.</p>' +
        '<div id="toneArea"></div></section>' +
      '<section class="panel stack"><h2>The four tones</h2>' +
        '<div class="contour">' + [[1, 'mā', 'high, level'], [2, 'má', 'rising'], [3, 'mǎ', 'dips, then rises'], [4, 'mà', 'sharp fall']].map(([t, s, d]) => '<figure>' + contourSVG(t) + '<figcaption><b class="tc' + t + '" style="font-size:1.1rem">' + s + '</b><br>' + d + '</figcaption></figure>').join('') + '</div>' +
        '<p class="small muted">Neutral tone syllables (like the second 妈 in 妈妈, māma) are short and light, with no mark.</p>' +
      '</section>' +
      '<section class="panel stack"><h2>Tone change rules</h2>' + B.SANDHI.map(r => '<div class="rule"><h3>' + esc(r.rule) + '</h3><p class="small muted">' + esc(r.how) + '</p><div class="ex">' + r.ex.map(([h, from, to]) => '<span class="row" style="gap:6px"><span class="han" style="font-size:1.15rem">' + esc(h) + '</span><s>' + esc(from) + '</s> → <b>' + esc(to) + '</b>' + sayBtn(h) + '</span>').join('') + '</div></div>').join('') + '</section>';
    nextTone($('#toneArea', el), el);
  }
  function nextTone(area, el) {
    const pool = cardPool().filter(v => v.syl && v.syl.length <= 4 && v.syl.length === [...v.h].length);
    if (!pool.length) { area.innerHTML = '<p class="muted">No words available.</p>'; return; }
    const v = pool[Math.floor(Math.random() * pool.length)];
    const chars = [...v.h]; const picks = new Array(chars.length).fill(0);
    $('#toneScore', el).textContent = toneSession.total ? toneSession.right + ' / ' + toneSession.total + ' this session' : '';
    area.innerHTML =
      '<div class="study" style="padding:8px 0">' +
        '<div class="syl-row">' + chars.map((c, i) => '<div class="syl"><span class="han">' + esc(c) + '</span><span class="plain" data-plain="' + i + '">' + esc(plainSyl(v.syl[i][0])) + '</span><div class="tone-pick" data-i="' + i + '">' + [1, 2, 3, 4, 5].map(t => '<button data-t="' + t + '" aria-pressed="false" aria-label="Tone ' + (t === 5 ? 'neutral' : t) + '">' + (t === 5 ? '·' : t) + '</button>').join('') + '</div></div>').join('') + '</div>' +
        '<div class="row" style="justify-content:center">' + sayBtn(v.h, 'Play the word') + '<button class="btn primary" id="toneCheck" disabled>Check <kbd>Enter</kbd></button></div>' +
        '<div id="toneFb" style="display:grid;gap:4px;justify-items:center"></div>' +
      '</div>';
    let checked = false;
    $$('.tone-pick', area).forEach(tp => tp.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || checked) return; const i = +tp.dataset.i; picks[i] = +b.dataset.t;
      $$('button', tp).forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('#toneCheck', area).disabled = picks.some(p => !p);
    }));
    const check = () => {
      if (checked || picks.some(p => !p)) return; checked = true;
      let all = true;
      $$('.tone-pick', area).forEach(tp => { const i = +tp.dataset.i; const want = v.syl[i][1]; $$('button', tp).forEach(b => { b.disabled = true; const t = +b.dataset.t; if (t === want) b.classList.add('right'); else if (t === picks[i]) b.classList.add('wrong'); }); if (picks[i] !== want) all = false; $('[data-plain="' + i + '"]', area).innerHTML = '<span class="tc' + want + '">' + esc(v.syl[i][0]) + '</span>'; });
      toneSession.total++; if (all) toneSession.right++; S.tonesq.total++; if (all) S.tonesq.right++; markDay(); save(); award(all ? 8 : 2, all ? 'good' : 'bad');
      $('#toneCheck', area).hidden = true;
      $('#toneFb', area).innerHTML = '<div class="result ' + (all ? 'ok' : 'no') + '">' + (all ? 'All tones right.' : 'Check the highlighted syllables.') + '</div><div>' + pyHTML(v) + ' · ' + esc(v.e) + '</div><button class="btn primary" id="toneNext">Next word <kbd>Enter</kbd></button>';
      $('#toneNext', area).addEventListener('click', () => nextTone(area, el)); $('#toneNext', area).focus(); speak(v.h);
    };
    $('#toneCheck', area).addEventListener('click', check);
    keyHandler = e => {
      if (e.key === 'Enter') { e.preventDefault(); if (checked) nextTone(area, el); else check(); }
      else if (!checked && /^[1-5]$/.test(e.key)) { const i = picks.findIndex(p => !p); const idx = i < 0 ? picks.length - 1 : i; const tp = $$('.tone-pick', area)[idx]; $$('button', tp)[+e.key - 1].click(); }
      else if (e.key.toLowerCase() === 'p') speak(v.h);
    };
  }

  // ───────────────────────── Culture ─────────────────────────
  let cultSession = null;
  function renderCulture(el) {
    const units = scopeUnits(); const pool = CULTURE.filter(c => units.includes(c.u));
    if (!cultSession) cultSession = { q: shuffle(pool), i: 0, right: 0 };
    const sess = cultSession;
    if (sess.i >= sess.q.length) {
      el.innerHTML = '<section class="panel empty"><div class="big-num">' + sess.right + ' / ' + sess.q.length + '</div><p>culture questions right.</p><button class="btn primary" id="cAgain">Start over</button></section>';
      $('#cAgain', el).addEventListener('click', () => { cultSession = null; renderCulture(el); }); keyHandler = null; return;
    }
    const c = sess.q[sess.i]; const order = shuffle(c.opts.map((o, i) => i));
    el.innerHTML =
      '<section class="panel study">' +
        '<div class="progress"><i style="width:' + Math.round(100 * sess.i / sess.q.length) + '%"></i></div>' +
        '<div class="spread" style="width:100%"><span class="eyebrow">Unit ' + c.u + ' · ' + esc(B.UNITS[c.u - 1].en) + '</span><span class="tag tnum">' + (sess.i + 1) + ' / ' + sess.q.length + '</span></div>' +
        '<h2 style="max-width:30ch">' + esc(c.q) + '</h2>' +
        '<div class="opts">' + order.map((oi, k) => '<button class="opt" data-oi="' + oi + '"><span class="k">' + (k + 1) + '</span><span>' + esc(c.opts[oi]) + '</span></button>').join('') + '</div>' +
        '<div id="cFb" style="width:100%;display:grid;justify-items:center;gap:10px"></div>' +
      '</section>';
    let answered = false;
    const next = () => { sess.i++; renderCulture(el); };
    const choose = b => {
      if (answered) return; answered = true; const oi = +b.dataset.oi; const ok = oi === c.a;
      $$('.opt', el).forEach(x => { x.disabled = true; if (+x.dataset.oi === c.a) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
      if (ok) sess.right++; const r = S.culture[c.key] || { r: 0, w: 0 }; ok ? r.r++ : r.w++; S.culture[c.key] = r; markDay(); save(); award(ok ? 6 : 1, ok ? 'good' : 'bad');
      $('#cFb', el).innerHTML = '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Right.' : 'Not quite.') + '</b><div class="small">' + esc(c.why) + '</div></div><button class="btn primary" id="cNext">Next <kbd>Enter</kbd></button>';
      $('#cNext', el).addEventListener('click', next); $('#cNext', el).focus();
    };
    $$('.opt', el).forEach(b => b.addEventListener('click', () => choose(b)));
    keyHandler = e => { if (!answered && /^[1-3]$/.test(e.key)) { e.preventDefault(); choose($$('.opt', el)[+e.key - 1]); } else if (answered && e.key === 'Enter') { e.preventDefault(); next(); } };
  }

  // ───────────────────────── Quests ─────────────────────────
  // A side quest prepares one language-partner session in six short steps.
  // The main campaign walks through each lesson's words, characters, grammar and speaking.
  const PARTNER = B.PARTNER || [];
  const P_BY_ID = Object.fromEntries(PARTNER.map(p => [p.id, p]));
  const STAGES = [
    { id: 'learn', place: '茶馆 · The teahouse', han: '学', title: 'Learn the lines', min: 8, desc: 'Study four lines at a time, say them out loud, then match just those.' },
    { id: 'match', place: '夜市 · The night market', han: '配', title: 'Mix and match', min: 3, desc: 'Every line shuffled together, as review.' },
    { id: 'mine', place: '我的家 · Your room', han: '我', title: 'Make it yours', min: 4, desc: 'Pick your own answers. They become your script.' },
    { id: 'build', place: '书房 · The study', han: '造', title: 'Build the sentences', min: 3, desc: 'Put the word tiles in order.' },
    { id: 'boss', place: '饭馆 · The restaurant', han: '演', title: 'Role-play boss', min: 6, desc: 'Your partner speaks; you answer out loud.' },
    { id: 'ready', place: '大门 · The town gate', han: '备', title: 'Ready check', min: 3, desc: 'Conversation-flow questions, the grading checklist, and your cheat sheet.' },
  ];
  const pState = id => { S.partner[id] = S.partner[id] || { done: {}, mine: {}, ready: {}, boss: {} }; return S.partner[id]; };
  let questRun = null;
  // Practices that share a session date are played as one quest, in practice order.
  const groupFor = P => { const d = (S.settings.sessionDate || {})[P.id]; return d ? PARTNER.filter(x => (S.settings.sessionDate || {})[x.id] === d) : [P]; };
  const nextInGroup = G => { for (const P of G) { const s = STAGES.find(st => !pState(P.id).done[st.id]); if (s) return { P, s }; } return null; };
  let pendingStart = null;
  const fragPy = s => (B.FRAG_PY && B.FRAG_PY[s]) || ({ '。': '.', '！': '!', '？': '?', '，': ',' }[s] || s);
  function mineSentence(P, m) {
    const st = pState(P.id).mine[m.id] || {};
    let zh = ''; const py = [];
    for (const part of m.parts) {
      if (typeof part === 'string') { zh += part; py.push(fragPy(part)); }
      else if (part.text) { const v = String(st[part.s] || '').trim(); zh += v || '［' + part.ph + '］'; py.push(v || '[' + part.ph + ']'); }
      else { const list = m.slots[part.s]; const i = Math.min(st[part.s] || 0, list.length - 1); zh += list[i][0]; py.push(fragPy(list[i][0])); }
    }
    let p = py.join(' ').replace(/\s+([,.?!])/g, '$1').replace(/\s+/g, ' ').trim();
    p = p.charAt(0).toUpperCase() + p.slice(1);
    return { zh, py: p };
  }
  function modelOf(P, a) {
    if (a.startsWith('@')) { const m = P.mine.find(x => x.id === a.slice(1)); if (m) return mineSentence(P, m); }
    return { zh: a, py: sentPy(a) };
  }
  function completeStage(P, sid) {
    const st = pState(P.id);
    if (st.done[sid]) { save(); return false; }
    st.done[sid] = Date.now(); save(); award(50, 'done');
    if (STAGES.every(s => st.done[s.id])) { st.complete = Date.now(); save(); setTimeout(() => { award(150, ''); sfx('up'); celebrate('Quest complete: ' + P.title + '! 你准备好了！'); }, 400); }
    return true;
  }

  // Campaign: four stages per lesson, each checked against your real progress.
  const CAMP = [
    { id: 'words', han: '词', label: 'Words', test: l => { const ws = VOCAB.filter(v => v.l === l && (v.tier === 'L' || v.tier === 'R')); return ws.filter(v => wordStatus(v) !== 'new').length >= Math.ceil(ws.length * 0.8); } },
    { id: 'chars', han: '写', label: 'Characters', test: l => WRITE.filter(w => w.l === l && (S.write[w.c] || {}).clean >= 1).length >= 10 },
    { id: 'grammar', han: '法', label: 'Grammar', test: l => { const ds = ALL_DRILLS.filter(d => G_BY_ID[d.gid].l === l); let r = 0, t = 0; for (const d of ds) { const s = S.gram[d.id]; if (!s) return false; r += s.r; t += s.r + s.w; } return t > 0 && r / t >= 0.7; } },
    { id: 'speak', han: '说', label: 'Speaking', test: l => SPEAK.filter(s => s.l === l).every(s => S.speak[s.key]) },
  ];
  function goCampaign(l, sid) {
    S.settings.lessons = [l]; renderScope();
    if (sid === 'words') { S.settings.dir = 'recog'; cardSession = null; pendingStart = 'cards'; save(); location.hash = 'cards'; }
    else if (sid === 'chars') { S.settings.writeMode = 'dictation'; writeSession = null; save(); location.hash = 'write'; }
    else if (sid === 'grammar') { drillSession = null; pendingStart = 'grammar'; save(); location.hash = 'grammar'; }
    else { speakSession = null; pendingStart = 'speak'; save(); location.hash = 'speak'; }
    toast('Studying lesson ' + l + ' only. Change it with the Lessons button.');
  }

  function renderQuest(el) {
    if (questRun) return runStage(el);
    const P = P_BY_ID[S.settings.quest] || PARTNER[PARTNER.length - 1];
    const G = groupFor(P);
    const steps = G.length * STAGES.length;
    const doneN = G.reduce((n, x) => n + STAGES.filter(s => pState(x.id).done[s.id]).length, 0);
    const nx = nextInGroup(G);
    const left = G.reduce((n, x) => n + STAGES.filter(s => !pState(x.id).done[s.id]).reduce((m, s) => m + s.min, 0), 0);
    const date = (S.settings.sessionDate || {})[P.id] || '';
    let when = 'No session date set';
    if (date) {
      const d = new Date(date + 'T12:00'); const days = Math.ceil((d - new Date()) / DAY);
      when = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) + ' · ' + (days > 1 ? 'in ' + days + ' days' : days === 1 ? 'tomorrow' : days === 0 ? 'today' : 'done');
    }
    const multi = G.length > 1;
    const title = multi ? G.map(x => esc(x.title)).join(' <span class="muted-on">+</span> ') : esc(P.title);
    const zh = G.map(x => x.zh).join(' · ');
    const campaign = B.LESSONS.map(L => {
      const states = CAMP.map(c => c.test(L.id));
      return '<li class="camp-row' + (states.every(Boolean) ? ' cleared' : '') + '"><div class="camp-name"><b class="tnum">' + L.id + '</b> ' + esc(L.title) + '</div><div class="camp-stages">' +
        CAMP.map((c, i) => '<button class="camp-stage' + (states[i] ? ' done' : '') + '" data-l="' + L.id + '" data-c="' + c.id + '" title="' + esc(c.label + ' · lesson ' + L.id) + '"><span class="han">' + c.han + '</span>' + c.label + '</button>').join('') + '</div></li>';
    }).join('');
    let contL = null, contC = null;
    outer: for (const L of B.LESSONS) for (const c of CAMP) if (!c.test(L.id)) { contL = L.id; contC = c; break outer; }

    el.innerHTML =
      '<section class="quest-hero">' +
        '<div class="stack">' +
          '<p class="eyebrow">Lantern trail · Partner practice' + (multi ? 's ' + G.map(x => x.n).join(' + ') : ' ' + P.n) + '</p>' +
          '<h1>' + title + ' <span class="han">' + esc(zh) + '</span></h1>' +
          '<div class="row small"><span class="muted">Your session:</span><b>' + esc(when) + '</b><label class="linkbtn" style="position:relative">Change<input type="date" id="sessDate" value="' + esc(date) + '" aria-label="Session date" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label></div>' +
          '<div class="qprog" style="grid-template-columns:repeat(' + steps + ',minmax(0,1fr))" aria-label="' + doneN + ' of ' + steps + ' steps done">' + G.flatMap(x => STAGES.map(s => '<i class="' + (pState(x.id).done[s.id] ? 'on' : '') + '"></i>')).join('') + '</div>' +
          '<div class="row"><button class="btn primary big" id="goNext">' + (nx ? 'Start: ' + (multi ? 'Practice ' + nx.P.n + ' · ' : '') + esc(nx.s.title) + ' <span class="muted-on">· ' + nx.s.min + ' min</span>' : 'Replay the role-play boss') + '</button></div>' +
          '<p class="small muted">' + (nx ? doneN + ' of ' + steps + ' steps done · about ' + left + ' minutes left · +50 XP per step' + (multi ? ' · Practice ' + G[0].n + ' first, then ' + G.slice(1).map(x => x.n).join(', ') : '') : 'All steps done. Run the bosses again the night before, and open your cheat sheets in the Ready checks.') + '</p>' +
        '</div>' +
        '<div class="quest-side">' + buddy(doneN ? 'happy' : 'wow', doneN && !nx ? 'done' : 'start', 120) + '</div>' +
        '<div class="quest-switch"><span class="eyebrow">Other practices</span><div class="chips">' + PARTNER.map(p => '<button class="chip" data-p="' + p.id + '" aria-pressed="' + G.includes(p) + '">' + p.n + ' · ' + esc(p.zh) + '</button>').join('') + '</div></div>' +
      '</section>' +
      G.map(x => {
        const xs = pState(x.id);
        return (multi ? '<h2 class="path-head"><span class="tag">Practice ' + x.n + '</span>' + esc(x.title) + ' <span class="han">' + esc(x.zh) + '</span></h2>' : '') +
        '<ol class="path">' + STAGES.map((s, i) => {
          const done = !!xs.done[s.id], isNext = nx && nx.P === x && nx.s.id === s.id;
          return '<li class="node' + (done ? ' done' : '') + (isNext ? ' next' : '') + '"><span class="dot han"><span>' + s.han + '</span></span>' +
            '<div class="node-body"><span class="place">' + esc(s.place) + '</span><b>' + (i + 1) + '. ' + esc(s.title) + (done ? ' <span class="lit">lit</span>' : '') + '</b><span class="small muted">' + esc(s.desc) + ' · ' + s.min + ' min</span></div>' +
            '<button class="btn sm' + (isNext ? ' primary' : '') + '" data-pid="' + x.id + '" data-stage="' + s.id + '">' + (done ? 'Replay' : 'Play') + '</button></li>';
        }).join('') + '</ol>';
      }).join('') +
      '<section class="panel stack"><div class="spread"><div class="stack" style="gap:2px"><h2>Main campaign</h2><p class="small muted">Clear all four stages in each lesson. Stages light up from your real progress.</p></div>' +
        (contL ? '<button class="btn" id="contCamp">Continue: ' + contL + ' ' + esc(contC.label) + '</button>' : '<span class="tag jade">All lessons cleared</span>') + '</div>' +
        '<ol class="camp">' + campaign + '</ol></section>';

    $('#goNext', el).addEventListener('click', () => { questRun = nx ? { pid: nx.P.id, stage: nx.s.id } : { pid: G[G.length - 1].id, stage: 'boss' }; route(); window.scrollTo(0, 0); });
    $$('[data-stage]', el).forEach(b => b.addEventListener('click', () => { questRun = { pid: b.dataset.pid, stage: b.dataset.stage }; route(); window.scrollTo(0, 0); }));
    $$('[data-p]', el).forEach(b => b.addEventListener('click', () => { S.settings.quest = b.dataset.p; save(); route(); }));
    $('#sessDate', el).addEventListener('change', e => { S.settings.sessionDate = Object.assign({}, S.settings.sessionDate, { [P.id]: e.target.value }); save(); route(); });
    $$('.camp-stage', el).forEach(b => b.addEventListener('click', () => goCampaign(b.dataset.l, b.dataset.c)));
    const cc = $('#contCamp', el); if (cc) cc.addEventListener('click', () => goCampaign(contL, contC.id));
    keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); $('#goNext', el).click(); } };
  }

  function runStage(el) {
    const P = P_BY_ID[questRun.pid]; const S0 = STAGES.find(s => s.id === questRun.stage); const idx = STAGES.indexOf(S0);
    el.innerHTML = '<section class="panel study stage">' +
      '<div class="spread" style="width:100%"><button class="linkbtn" id="toMap">' + ICON.back.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"') + ' Quest map</button><span class="small muted">Practice ' + P.n + ' · step ' + (idx + 1) + ' of 6</span></div>' +
      '<div class="progress"><i id="stageBar" style="width:0%"></i></div>' +
      '<div class="stage-title"><span class="dot han"><span>' + S0.han + '</span></span><div><span class="place">' + esc(S0.place) + '</span><h2>' + esc(S0.title) + '</h2></div><div class="stage-buddy" aria-live="polite"><div class="buddy-face">' + mascot('idle', 52) + '</div></div></div>' +
      '<div id="stageBody" style="width:100%;display:grid;gap:14px;justify-items:center"></div></section>';
    $('#toMap', el).addEventListener('click', () => { questRun = null; route(); });
    const body = $('#stageBody', el);
    const bar = pct => { $('#stageBar', el).style.width = Math.round(pct * 100) + '%'; };
    const finish = (msg) => {
      bar(1); const first = completeStage(P, S0.id); const ng = nextInGroup(groupFor(P)); const nxt = ng && ng.s; const nP = ng ? ng.P : P;
      body.innerHTML = '<div class="empty">' + buddy('cheer', 'done', 110) + '<div class="big-num coin-num">' + (first ? '+50 XP' : 'Cleared') + '</div><p>' + esc(msg) + '</p><div class="row" style="justify-content:center">' +
        (nxt ? '<button class="btn primary" id="nextStage">Next: ' + (nP !== P ? 'Practice ' + nP.n + ' · ' : '') + esc(nxt.title) + ' <kbd>Enter</kbd></button>' : '') + '<button class="btn" id="mapBtn">Quest map</button></div></div>';
      $('#mapBtn', body).addEventListener('click', () => { questRun = null; route(); });
      const ns = $('#nextStage', body); if (ns) ns.addEventListener('click', () => { questRun = { pid: nP.id, stage: nxt.id }; route(); window.scrollTo(0, 0); });
      keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); (ns || $('#mapBtn', body)).click(); } };
    };
    ({ learn: stageLearn, match: stageMatch, mine: stageMine, build: stageBuild, boss: stageBoss, ready: stageReady })[S0.id](body, P, bar, finish);
  }

  // Word-by-word glosses for a line, using the course word list (longest match first).
  const GLOSS_EXTRA = { 几点: ['jǐ diǎn', 'what time'], 几月: ['jǐ yuè', 'which month'], 几号: ['jǐ hào', 'which day (of the month)'], 几岁: ['jǐ suì', 'how old (a child)'], 几口人: ['jǐ kǒu rén', 'how many people (in a family)'], 周末: ['zhōumò', 'weekend'], 起床: ['qǐchuáng', 'to get up'], 睡觉: ['shuìjiào', 'to sleep'], 认识: ['rènshi', 'to meet, to know (a person)'], 哪里: ['nǎlǐ', 'where'], 最: ['zuì', 'most'], 过: ['guò', 'to spend (a day), to celebrate'], 这边: ['zhèbiān', 'this way'], 稍等: ['shāo děng', 'wait a moment'], 四川: ['Sìchuān', 'Sichuan (province)'], 怎么: ['zěnme', 'how'], 上个: ['shàng ge', 'last (one)'], 我们: ['wǒmen', 'we, us'], 你们: ['nǐmen', 'you (plural)'], 这个: ['zhège', 'this'], 高兴: ['gāoxìng', 'glad'] };
  const GLOSS = new Map();
  for (const [h, x] of Object.entries(GLOSS_EXTRA)) GLOSS.set(h, x);
  for (const v of VOCAB) if (v.tier !== 'N' && !GLOSS.has(v.h)) GLOSS.set(v.h, [v.p, v.e]);
  function glossWords(line) {
    const chars = [...line]; const out = []; let i = 0;
    while (i < chars.length) {
      if (!isHan(chars[i])) { i++; continue; }
      let hit = null;
      for (let L = Math.min(6, chars.length - i); L >= 1; L--) { const w = chars.slice(i, i + L).join(''); if (GLOSS.has(w)) { hit = w; break; } }
      if (hit) { if (!out.some(o => o[0] === hit)) out.push([hit].concat(GLOSS.get(hit))); i += [...hit].length; } else i++;
    }
    return out;
  }

  // One round of matching. A wrong pair shows what the Chinese line really means.
  function matchRound(host, set, onDone) {
    const L = shuffle(set.map((_, i) => i)), R = shuffle(set.map((_, i) => i));
    host.innerHTML = '<div class="match"><div class="mcol">' + L.map(i => '<button class="mcard" data-side="zh" data-i="' + i + '"><span class="han">' + esc(set[i].zh) + '</span>' + (S.settings.pinyin ? '<small class="py">' + esc(sentPy(set[i].zh)) + '</small>' : '') + '</button>').join('') + '</div>' +
      '<div class="mcol">' + R.map(i => '<button class="mcard" data-side="en" data-i="' + i + '">' + esc(set[i].en) + '</button>').join('') + '</div></div><p class="match-note small" aria-live="polite"></p>';
    let pick = { zh: null, en: null }, left = set.length, misses = 0;
    $$('.mcard', host).forEach(b => b.addEventListener('click', () => {
      if (b.classList.contains('matched')) return;
      const side = b.dataset.side; if (pick[side]) pick[side].classList.remove('sel');
      pick[side] = b; b.classList.add('sel');
      if (side === 'zh') speak(set[+b.dataset.i].zh);
      if (!(pick.zh && pick.en)) return;
      const a = pick.zh, c = pick.en; pick = { zh: null, en: null };
      if (a.dataset.i === c.dataset.i) {
        [a, c].forEach(x => { x.classList.remove('sel'); x.classList.add('matched'); x.disabled = true; }); award(2); left--;
        $('.match-note', host).textContent = '';
        if (!left) setTimeout(() => onDone(misses), 450);
      } else {
        misses++; sfx('bad'); react('bad'); const real = set[+a.dataset.i];
        [a, c].forEach(x => { x.classList.remove('sel'); x.classList.add('miss'); setTimeout(() => x.classList.remove('miss'), 450); });
        $('.match-note', host).innerHTML = 'Not that one. <span class="han">' + esc(real.zh) + '</span> means “' + esc(real.en) + (/[.?!…)]$/.test(real.en) ? '' : '.') + '”';
      }
    }));
  }

  // Step 1: study a few lines, say them, then match just those lines.
  function stageLearn(body, P, bar, finish) {
    const lines = P.lines; const groups = [];
    for (let i = 0; i < lines.length; i += 4) groups.push(lines.slice(i, i + 4));
    if (groups.length > 1 && groups[groups.length - 1].length < 2) { const last = groups.pop(); groups[groups.length - 1].push(...last); }
    const WHO = { ask: 'Question', say: 'You say', kit: 'Keep it going' };
    let g = 0, totalMiss = 0;
    const study = () => {
      const set = groups[g]; bar(g / groups.length);
      body.innerHTML = '<p class="eyebrow">Group ' + (g + 1) + ' of ' + groups.length + ' · study these ' + set.length + '</p>' +
        '<p class="muted small" style="max-width:56ch">Play each line and say it out loud twice. The chips break it into words. When they feel familiar, test yourself.</p>' +
        '<div class="learn-list">' + set.map(l => '<div class="learn-item"><div class="spread"><span class="tag">' + WHO[l.who] + '</span>' + sayBtn(l.zh) + '</div>' +
          '<div class="han learn-zh">' + esc(l.zh) + '</div><div class="py">' + esc(sentPy(l.zh)) + '</div><div><b>' + esc(l.en) + '</b></div>' +
          '<div class="chips-row">' + glossWords(l.zh).map(([h, p, e]) => '<span class="gloss"><span class="han">' + esc(h) + '</span> <span class="py">' + esc(p) + '</span> ' + esc(e) + '</span>').join('') + '</div></div>').join('') + '</div>' +
        '<div class="row" style="justify-content:center"><button class="btn" id="playAll">Play all</button><button class="btn primary" id="testMe">Test me on these ' + set.length + ' <kbd>Enter</kbd></button></div>';
      $('#playAll', body).addEventListener('click', () => { let k = 0; const nextLine = () => { if (k >= set.length || !document.body.contains(body)) return; const u = set[k++].zh; speak(u); setTimeout(nextLine, 650 + [...u].length * 380); }; nextLine(); });
      $('#testMe', body).addEventListener('click', test);
      keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); test(); } };
    };
    const test = () => {
      keyHandler = null;
      body.innerHTML = '<p class="eyebrow">Group ' + (g + 1) + ' of ' + groups.length + ' · tap a Chinese line, then its meaning</p><div id="mr" style="width:100%;display:grid;justify-items:center"></div><button class="linkbtn" id="back">Look at them again</button>';
      $('#back', body).addEventListener('click', study);
      matchRound($('#mr', body), groups[g], misses => {
        totalMiss += misses; award(5, ''); g++;
        if (g < groups.length) study(); else finish('You’ve studied all ' + lines.length + ' lines' + (totalMiss ? ' (' + totalMiss + ' slip' + (totalMiss > 1 ? 's' : '') + ' along the way)' : ' with no slips') + '. Next, mix them all up.');
      });
    };
    study();
  }

  // Step 2: every line, mixed, as review.
  function stageMatch(body, P, bar, finish) {
    const lines = shuffle(P.lines); const rounds = [];
    for (let i = 0; i < lines.length; i += 5) rounds.push(lines.slice(i, i + 5));
    if (rounds.length > 1 && rounds[rounds.length - 1].length < 3) { const last = rounds.pop(); rounds[rounds.length - 1].push(...last); }
    let r = 0, misses = 0;
    const draw = () => {
      bar(r / rounds.length); keyHandler = null;
      body.innerHTML = '<p class="eyebrow">Round ' + (r + 1) + ' of ' + rounds.length + ' · all lines, mixed up</p><div id="mr" style="width:100%;display:grid;justify-items:center"></div>';
      matchRound($('#mr', body), rounds[r], m => { misses += m; r++; if (r < rounds.length) draw(); else finish('All lines matched' + (misses ? ' with ' + misses + ' slip' + (misses > 1 ? 's' : '') : ' with no slips') + '.'); });
    };
    draw();
  }

  function stageMine(body, P, bar, finish) {
    const st = pState(P.id);
    bar(0.5);
    body.innerHTML = '<p class="muted" style="max-width:60ch">Choose what’s true for you. These sentences become your answers in the role-play boss and your cheat sheet for the session.</p>' +
      '<div class="mine-list">' + P.mine.map(m => {
        const cur = st.mine[m.id] || {};
        const controls = m.parts.filter(p => typeof p !== 'string').map(p => p.text
          ? '<input class="search" style="width:min(100%,220px)" data-m="' + m.id + '" data-s="' + p.s + '" placeholder="' + esc(p.ph) + '" value="' + esc(cur[p.s] || '') + '" aria-label="' + esc(p.ph) + '">'
          : '<select class="search" style="width:auto;max-width:100%" data-m="' + m.id + '" data-s="' + p.s + '" aria-label="' + esc(m.en) + '">' + m.slots[p.s].map(([zh, en], i) => '<option value="' + i + '"' + ((cur[p.s] || 0) == i ? ' selected' : '') + '>' + esc(zh + ' · ' + en) + '</option>').join('') + '</select>').join('');
        return '<div class="mine-item"><div class="spread"><span class="eyebrow">' + esc(m.en) + '</span><span class="han small muted">' + esc(m.q) + '</span></div><div class="row">' + controls + '</div><div class="mine-out" data-out="' + m.id + '"></div></div>';
      }).join('') + '</div><button class="btn primary" id="saveMine">Save my script</button>';
    const paint = id => { const m = P.mine.find(x => x.id === id); const s = mineSentence(P, m); $('[data-out="' + id + '"]', body).innerHTML = '<div class="row"><span class="han" style="font-size:1.25rem">' + esc(s.zh) + '</span>' + sayBtn(s.zh) + '</div><div class="py small">' + esc(s.py) + '</div>'; };
    P.mine.forEach(m => paint(m.id));
    $$('[data-m]', body).forEach(c => c.addEventListener(c.tagName === 'INPUT' ? 'input' : 'change', () => {
      const cur = st.mine[c.dataset.m] = st.mine[c.dataset.m] || {}; cur[c.dataset.s] = c.tagName === 'INPUT' ? c.value : +c.value; save(); paint(c.dataset.m);
    }));
    $('#saveMine', body).addEventListener('click', () => {
      P.mine.forEach(m => { st.mine[m.id] = st.mine[m.id] || {}; m.parts.forEach(p => { if (typeof p !== 'string' && !p.text && st.mine[m.id][p.s] == null) st.mine[m.id][p.s] = 0; }); });
      const missing = P.mine.some(m => m.parts.some(p => typeof p !== 'string' && p.text && !String(st.mine[m.id][p.s] || '').trim()));
      if (missing) { toast('Fill in the blank boxes first.'); return; }
      save(); finish('Your script is saved. The boss will use your answers.');
    });
    keyHandler = null;
  }

  function stageBuild(body, P, bar, finish) {
    let i = 0, right = 0;
    const draw = () => {
      const d = P.build[i]; bar(i / P.build.length);
      let sh = shuffle(d.w.map((_, k) => k)); let g = 0; while (sh.map(k => d.w[k]).join('') === d.w.join('') && g++ < 10) sh = shuffle(sh);
      body.innerHTML = '<p class="eyebrow">' + (i + 1) + ' / ' + P.build.length + '</p><p class="prompt-en" style="font-size:1.15rem">' + esc(d.en) + '</p>' +
        '<div class="tiles answer-line" id="line"></div><div class="tiles" id="bank">' + sh.map(k => '<button class="tile" data-k="' + k + '">' + esc(d.w[k]) + '</button>').join('') + '</div>' +
        '<button class="btn primary" id="chk" disabled>Check <kbd>Enter</kbd></button><div id="bfb" style="display:grid;gap:8px;justify-items:center;width:100%"></div>';
      const picked = []; let done = false;
      const sync = () => { $('#line', body).innerHTML = picked.map((k, j) => '<button class="tile" data-j="' + j + '">' + esc(d.w[k]) + '</button>').join(''); $$('#bank .tile', body).forEach(t => t.classList.toggle('used', picked.includes(+t.dataset.k))); $('#chk', body).disabled = picked.length !== d.w.length; };
      $('#bank', body).addEventListener('click', e => { const t = e.target.closest('.tile'); if (!t || done || picked.includes(+t.dataset.k)) return; picked.push(+t.dataset.k); sync(); });
      $('#line', body).addEventListener('click', e => { const t = e.target.closest('.tile'); if (!t || done) return; picked.splice(+t.dataset.j, 1); sync(); });
      const next = () => { i++; if (i < P.build.length) draw(); else finish(right + ' of ' + P.build.length + ' sentences built right on the first try.'); };
      const check = () => {
        if (done || picked.length !== d.w.length) return; done = true;
        const ok = picked.map(k => d.w[k]).join('') === d.w.join(''); if (ok) right++; award(ok ? 8 : 2, ok ? 'good' : 'bad');
        const full = d.w.join(''); $('#chk', body).hidden = true;
        $('#bfb', body).innerHTML = '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Correct.' : 'The right order:') + '</b><div class="row"><span class="han" style="font-size:1.2rem">' + esc(full) + '</span>' + sayBtn(full) + '</div><div class="py small">' + esc(d.w.map(w => sentPy(w)).join(' ')) + '</div></div><button class="btn primary" id="bnext">Next <kbd>Enter</kbd></button>';
        speak(full); $('#bnext', body).addEventListener('click', next);
      };
      $('#chk', body).addEventListener('click', check);
      keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); done ? next() : check(); } else if (e.key === 'Backspace' && !done && picked.length) { e.preventDefault(); picked.pop(); sync(); } };
    };
    draw();
  }

  function stageBoss(body, P, bar, finish) {
    const st = pState(P.id);
    const pickRole = () => {
      if (P.roles.length === 1) return start(0);
      body.innerHTML = '<p class="muted">Pick a scene. Clearing any one finishes this step; play them all before your session.</p><div class="opts">' +
        P.roles.map((r, k) => '<button class="opt" data-r="' + k + '"><span class="k">' + (k + 1) + '</span><span><b>' + esc(r.name) + '</b><br><span class="small muted">' + r.turns.length + ' turns' + (st.boss[k] ? ' · best ' + st.boss[k] + '%' : '') + '</span></span></button>').join('') + '</div>';
      $$('[data-r]', body).forEach(b => b.addEventListener('click', () => start(+b.dataset.r)));
      keyHandler = e => { const k = +e.key - 1; if (P.roles[k]) { e.preventDefault(); start(k); } };
    };
    const start = ri => {
      const role = P.roles[ri]; let t = 0, score = 0; const max = role.turns.length;
      const draw = () => {
        const turn = role.turns[t]; bar(t / max);
        const nerves = Math.max(0, Math.round(100 - (score / max) * 100));
        const model = modelOf(P, turn.a);
        body.innerHTML = '<div class="hp">' + mascot(t === max - 1 ? 'wow' : 'boss', 40, 'bao') + '<span class="small"><b class="han">包包</b> HP</span><div class="hpbar"><i style="width:' + nerves + '%"></i></div><span class="small tnum">' + (t + 1) + ' / ' + max + '</span></div>' +
          '<div class="bubble">' + (turn.p ? '<span class="eyebrow">包包 Bāobāo, your partner</span><div class="row"><span class="han" style="font-size:clamp(1.3rem,4.6vw,1.8rem)">' + esc(turn.p) + '</span>' + sayBtn(turn.p) + '</div>' + '<div class="py small" id="bpy"' + (S.settings.pinyin ? '' : ' hidden') + '>' + esc(sentPy(turn.p)) + '</div>' : '<span class="eyebrow">You start</span>') + '</div>' +
          '<p class="cue"><b>Your turn:</b> ' + esc(turn.cue) + '</p>' +
          '<button class="btn primary" id="reveal">I answered out loud · show model <kbd>Space</kbd></button>' +
          '<div class="answer" id="ans" hidden><span class="eyebrow">A model answer' + (turn.a.startsWith('@') ? ' (from your script)' : '') + '</span><div class="row" style="justify-content:center"><span class="han" style="font-size:1.4rem">' + esc(model.zh) + '</span>' + sayBtn(model.zh) + '</div><div class="py small">' + esc(model.py) + '</div>' +
          '<div class="row" style="justify-content:center;margin-top:8px">' + [['smooth', 'Smooth', 1], ['hesitant', 'Hesitant', 2], ['stuck', 'Got stuck', 3]].map(([k, l, n]) => '<button class="btn" data-rate="' + k + '">' + l + ' <kbd>' + n + '</kbd></button>').join('') + '</div></div>';
        if (turn.p) setTimeout(() => speak(turn.p), 150);
        const reveal = () => { if (!$('#ans', body).hidden) return; $('#ans', body).hidden = false; $('#reveal', body).hidden = true; };
        $('#reveal', body).addEventListener('click', reveal);
        const rate = k => {
          const pts = { smooth: 1, hesitant: 0.5, stuck: 0 }[k]; score += pts; award(k === 'smooth' ? 8 : k === 'hesitant' ? 4 : 1, k === 'smooth' ? 'good' : '');
          t++; if (t < max) draw(); else end();
        };
        $$('[data-rate]', body).forEach(b => b.addEventListener('click', () => rate(b.dataset.rate)));
        keyHandler = e => {
          if ((e.key === ' ' || e.key === 'Enter') && $('#ans', body).hidden) { e.preventDefault(); reveal(); }
          else if (!$('#ans', body).hidden && /^[1-3]$/.test(e.key)) { e.preventDefault(); rate(['smooth', 'hesitant', 'stuck'][+e.key - 1]); }
          else if (e.key.toLowerCase() === 'p' && turn.p) speak(turn.p);
        };
      };
      const end = () => {
        const pct = Math.round(100 * score / max); st.boss[ri] = Math.max(st.boss[ri] || 0, pct); save();
        if (pct >= 70) { finish('Boss cleared: “' + role.name + '” at ' + pct + '% confidence.' + (P.roles.length > 1 ? ' Try the other scenes too.' : '')); return; }
        bar(1);
        body.innerHTML = '<div class="empty"><div class="big-num">' + pct + '%</div><p>You need 70% to clear this scene. Hesitant counts as half. Run it again; the second time is always easier.</p><div class="row" style="justify-content:center"><button class="btn primary" id="retry">Try again <kbd>Enter</kbd></button>' + (P.roles.length > 1 ? '<button class="btn" id="other">Pick another scene</button>' : '') + '</div></div>';
        $('#retry', body).addEventListener('click', () => start(ri)); const o = $('#other', body); if (o) o.addEventListener('click', pickRole);
        keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); start(ri); } };
      };
      draw();
    };
    pickRole();
  }

  function stageReady(body, P, bar, finish) {
    const st = pState(P.id); let q = 0, right = 0;
    const R = B.PARTNER_RUBRIC || [];
    const quiz = () => {
      const f = P.flow[q]; bar(q / (P.flow.length + 1)); const order = shuffle(f.opts.map((_, i) => i));
      body.innerHTML = '<p class="eyebrow">Conversation flow · ' + (q + 1) + ' / ' + P.flow.length + '</p><h3 style="max-width:40ch">' + esc(f.q) + '</h3>' +
        '<div class="opts">' + order.map((oi, k) => '<button class="opt" data-oi="' + oi + '"><span class="k">' + (k + 1) + '</span><span class="zh" style="font-family:var(--font-han)">' + esc(f.opts[oi]) + '</span>' + (sentPy(f.opts[oi]) && S.settings.pinyin ? '<span class="py">' + esc(sentPy(f.opts[oi])) + '</span>' : '') + '</button>').join('') + '</div><div id="rfb" style="display:grid;gap:8px;justify-items:center;width:100%"></div>';
      let done = false;
      const next = () => { q++; q < P.flow.length ? quiz() : checklist(); };
      const choose = b => {
        if (done) return; done = true; const ok = +b.dataset.oi === f.a; if (ok) right++;
        $$('.opt', body).forEach(x => { x.disabled = true; if (+x.dataset.oi === f.a) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
        award(ok ? 6 : 1, ok ? 'good' : 'bad');
        $('#rfb', body).innerHTML = '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Right.' : 'Not quite.') + '</b><div class="small">' + esc(f.why) + '</div></div><button class="btn primary" id="rnext">Next <kbd>Enter</kbd></button>';
        $('#rnext', body).addEventListener('click', next);
      };
      $$('.opt', body).forEach(b => b.addEventListener('click', () => choose(b)));
      keyHandler = e => { if (!done && /^[1-3]$/.test(e.key)) { e.preventDefault(); const b = $$('.opt', body)[+e.key - 1]; if (b) choose(b); } else if (done && e.key === 'Enter') { e.preventDefault(); next(); } };
    };
    const checklist = () => {
      bar(P.flow.length / (P.flow.length + 1)); keyHandler = null;
      const asks = P.lines.filter(l => l.who === 'ask');
      body.innerHTML = '<div class="stack" style="width:100%;max-width:640px;text-align:left">' +
        '<h3>How you’re graded</h3><p class="small muted">Tick each one only when it’s true. These match the three grading levels on the syllabus.</p>' +
        '<ul class="ready-list">' + R.map(([k, v], i) => '<li><label><input type="checkbox" data-rk="' + i + '"' + (st.ready[i] ? ' checked' : '') + '><span><b>' + esc(k) + '.</b> ' + esc(v) + '</span></label></li>').join('') + '</ul>' +
        '<button class="btn primary" id="imReady" style="justify-self:start">I’m ready</button>' +
        '<h3 style="margin-top:10px">Cheat sheet</h3><p class="small muted">Glance at this before you start. During the session, aim for 90–100% Chinese.</p>' +
        '<div class="sheet"><div><span class="eyebrow">Questions to ask</span>' + asks.map(l => '<div class="sheet-row"><span class="han">' + esc(l.zh) + '</span><span class="py small">' + esc(sentPy(l.zh)) + '</span></div>').join('') + '</div>' +
        '<div><span class="eyebrow">My answers</span>' + P.mine.map(m => { const s = mineSentence(P, m); return '<div class="sheet-row"><span class="han">' + esc(s.zh) + '</span><span class="py small">' + esc(s.py) + '</span></div>'; }).join('') + '</div>' +
        '<div><span class="eyebrow">Keep it going</span>' + P.lines.filter(l => l.who === 'kit').map(l => '<div class="sheet-row"><span class="han">' + esc(l.zh) + '</span><span class="small muted">' + esc(l.en) + '</span></div>').join('') + '</div></div></div>';
      const sync = () => { $('#imReady', body).disabled = !R.every((_, i) => st.ready[i]); };
      $$('[data-rk]', body).forEach(c => c.addEventListener('change', () => { st.ready[c.dataset.rk] = c.checked; save(); sync(); }));
      sync();
      $('#imReady', body).addEventListener('click', () => finish(right + ' of ' + P.flow.length + ' flow questions right, and every checklist item ticked. Your cheat sheet stays here in the Ready check.'));
    };
    if (st.done.ready) checklist(); else quiz();
  }

  const VIEWS = { quest: renderQuest, progress: renderToday, cards: renderCards, write: renderWrite, grammar: el => renderGrammar(el), speak: renderSpeak, tones: renderTones, culture: renderCulture };
  renderScope();
  renderHUD();
  route();
})();

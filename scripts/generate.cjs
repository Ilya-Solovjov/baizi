// Builds src/data/generated.js: stroke data, sentence pinyin, and per-syllable tones.
const fs = require('fs'), path = require('path');
const { pinyin } = require('pinyin-pro');
const B = require('./load-data.cjs')(['vocab.js', 'grammar.js', 'speaking.js', 'culture.js', 'partner.js']);
const OVERRIDES = require('./pinyin-overrides.cjs');

const isHan = c => /\p{Script=Han}/u.test(c);
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');

// 1) Stroke data for every character in the course.
const chars = new Set();
const addChars = s => [...s].forEach(c => isHan(c) && chars.add(c));
for (const t of Object.values(B.VOCAB_RAW)) addChars(t);
for (const t of Object.values(B.WRITE_RAW)) addChars(t);
const strokes = {}; const missing = [];
for (const c of chars) {
  const f = path.join(__dirname, '..', 'node_modules', 'hanzi-writer-data', c + '.json');
  if (fs.existsSync(f)) { const d = JSON.parse(fs.readFileSync(f, 'utf8')); strokes[c] = { strokes: d.strokes, medians: d.medians }; }
  else missing.push(c);
}

// 2) Pinyin for every practice sentence, spelled the way the textbook spells words.
// Sentences are split into words by longest match against the course word list;
// anything not in the list falls back to pinyin-pro (with tone sandhi for 一 and 不).
const DICT = new Map();
const SINGLE_KEEP = new Set(['谁', '了', '个', '还', '都', '那', '哪', '这', '叫', '会', '要', '教', '的', '吗', '呢', '吧', '们', '么', '啊', '哦', '家', '号', '刻', '半', '点']);
const addWord = (h, p) => { if (!DICT.has(h)) DICT.set(h, p); };
for (const t of Object.values(B.VOCAB_RAW)) for (const line of t.trim().split('\n')) {
  const [tier, h, p] = line.split('|');
  if (h === '只' || h === '了' && false) continue;           // 只 is resolved by context below
  if ([...h].length === 1 && !SINGLE_KEEP.has(h)) continue;   // single characters: let context (tone sandhi) decide
  addWord(h, p);
}
const EXTRA = { 我们: 'wǒmen', 你们: 'nǐmen', 他们: 'tāmen', 一个: 'yí ge', 两个: 'liǎng ge', 几个: 'jǐ ge', 这个: 'zhège', 那个: 'nàge',
  玛丽: 'Mǎlì', 大东: 'Dàdōng', 小美: 'Xiǎoměi', 孙: 'Sūn', 陈: 'Chén', 今年: 'jīnnián', 刘: 'Liú', 周末: 'zhōumò', 起床: 'qǐchuáng', 睡觉: 'shuìjiào', 上个: 'shàng ge', 认识: 'rènshi', 哪里: 'nǎlǐ', 四川菜: 'Sìchuān cài', 日本菜: 'Rìběn cài', 美国菜: 'Měiguó cài', 墨西哥菜: 'Mòxīgē cài', 这边: 'zhèbiān', 稍等: 'shāo děng', 好的: 'hǎo de', 怎么说: 'zěnme shuō', 怎么: 'zěnme', 好朋友: 'hǎo péngyou', 送了: 'sòngle', 几月: 'jǐ yuè', 几号: 'jǐ hào', 几点: 'jǐ diǎn', 几岁: 'jǐ suì', 时候: 'shíhou', 刀叉: 'dāochā', 还没: 'hái méi', 来了: 'lái le', 有一点儿: 'yǒu yìdiǎnr', 喜不喜欢: 'xǐ bu xǐhuan', 好不好吃: 'hǎo bu hǎochī' };
for (const [h, p] of Object.entries(EXTRA)) DICT.set(h, p);
{ const D = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  for (let n = 11; n < 100; n++) { const h = (n < 20 ? '' : D[Math.floor(n / 10)]) + '十' + (n % 10 ? D[n % 10] : ''); if (!DICT.has(h)) DICT.set(h, pinyin(h, { type: 'array' }).map((x, i) => i && /^[aeoāáǎàēéěèōóǒò]/.test(x) ? "'" + x : x).join('')); } }
const MAXLEN = Math.max(...[...DICT.keys()].map(k => k.length));
const PUNCT = { '，': ',', '。': '.', '？': '?', '！': '!', '：': ':', '、': ',', '／': ' /', '；': ';', '［': '[', '］': ']' };
function sentencePinyin(s, capStart = true) {
  const fb = pinyin(s, { type: 'array', toneSandhi: true, nonZh: 'removed' });
  const hanIdx = []; let k = 0; for (const c of s) hanIdx.push(isHan(c) ? k++ : -1);
  const chars = [...s]; const out = []; let i = 0;
  while (i < chars.length) {
    const c = chars[i];
    if (!isHan(c)) {
      if (PUNCT[c] !== undefined) { const p = PUNCT[c]; if (p === '[') out.push({ open: true }); else if (p === ']') out.push({ close: true }); else out.push({ punct: p }); }
      else if (c === '＿') out.push({ w: '＿' });
      else if (/\s/.test(c)) out.push({ space: true });
      else { let j = i; while (j < chars.length && !isHan(chars[j]) && PUNCT[chars[j]] === undefined && chars[j] !== '＿' && !/\s/.test(chars[j])) j++; out.push({ w: chars.slice(i, j).join('') }); i = j; continue; }
      i++; continue;
    }
    let matched = null;
    for (let L = Math.min(MAXLEN, chars.length - i); L >= 1; L--) { const w = chars.slice(i, i + L).join(''); if (DICT.has(w)) { matched = [w, DICT.get(w)]; break; } }
    if (c === '只' && (!matched || matched[0] === '只')) {
      const prev = chars[i - 1] || ''; const isMW = /[一两三四五六七八九十几这那＿]/.test(prev);
      out.push({ w: isMW ? 'zhī' : 'zhǐ' }); i++; continue;
    }
    if (matched) { out.push({ w: matched[1] }); i += matched[0].length; }
    else { out.push({ w: fb[hanIdx[i]] }); i++; }
  }
  // Join tokens with spaces, attach punctuation, capitalize sentence starts.
  let str = ''; let cap = capStart && /[。？！]/.test(s);
  for (const t of out) {
    if (t.punct) { str = str.replace(/\s+$/, '') + t.punct + ' '; if (/[.?!]/.test(t.punct)) cap = true; continue; }
    if (t.open) { str += '['; continue; }
    if (t.close) { str = str.replace(/\s+$/, '') + '] '; continue; }
    if (t.space) continue;
    let w = t.w; if (cap && w !== '＿' && /^[a-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ]/.test(w)) w = w[0].toUpperCase() + w.slice(1);
    cap = /:$/.test(w);
    str += w + ' ';
  }
  return str.replace(/\s+/g, ' ').replace(/ ([,.?!:;])/g, '$1').trim();
}
const sentences = new Set();
for (const g of B.GRAMMAR) { g.ex.forEach(e => sentences.add(e[0])); g.drills.forEach(d => { if (d.nopy) return; if (d.q) sentences.add(d.q); (d.opts || []).forEach(o => sentences.add(o)); (d.words || []).forEach(w => sentences.add(w)); }); }
for (const s of B.SPEAKING) { s.q.split('').length; sentences.add(s.q); sentences.add(s.a); }
for (const P of B.PARTNER) {
  P.lines.forEach(l => sentences.add(l.zh)); P.build.forEach(b => b.w.forEach(w => sentences.add(w)));
  P.roles.forEach(r => r.turns.forEach(t => { if (t.p) sentences.add(t.p); if (!t.a.startsWith('@')) sentences.add(t.a); }));
  P.flow.forEach(f => f.opts.forEach(o => sentences.add(o)));
  P.mine.forEach(m => sentences.add(m.q));
}
const sentPy = {};
for (const s of sentences) { if (![...s].some(isHan)) continue; sentPy[s] = OVERRIDES[s] || sentencePinyin(s); }
// Fragments for "your own answer" templates: no capitals here; the app capitalizes the joined sentence.
const fragPy = {};
for (const P of B.PARTNER) for (const m of P.mine) {
  m.parts.forEach(pt => { if (typeof pt === 'string' && [...pt].some(isHan)) fragPy[pt] = sentencePinyin(pt, false); });
  Object.values(m.slots || {}).forEach(list => list.forEach(([zh]) => { fragPy[zh] = sentencePinyin(zh, false); }));
}

// 3) Syllables with tone numbers for each vocab word, aligned to the book's pinyin.
const TONE = { '̄': 1, '́': 2, '̌': 3, '̀': 4 };
const toneOf = syl => { for (const ch of syl.normalize('NFD')) if (TONE[ch]) return TONE[ch]; return 5; };
const syl = {}; const unaligned = [];
for (const [l, t] of Object.entries(B.VOCAB_RAW)) for (const line of t.trim().split('\n')) {
  const [tier, h, p] = line.split('|');
  if (tier === 'N') continue;
  const book = p.normalize('NFC').replace(/[\s'’]/g, '');
  const bookPlain = strip(book).toLowerCase();
  const parts = pinyin(h, { type: 'array', toneType: 'none', v: false });
  let i = 0, out = [], ok = true;
  if ([...h].length === 1) { syl[l + '|' + h] = [[book, toneOf(book)]]; continue; }
  for (const part of parts) {
    let target = part.replace(/v/g, 'ü');
    if (bookPlain.startsWith(target, i)) { const seg = book.slice(i, i + target.length); out.push([seg, toneOf(seg)]); i += target.length; }
    else if (part === 'er' && bookPlain[i] === 'r' && i === bookPlain.length - 1) { out[out.length - 1][0] += 'r'; i += 1; }
    else if (part === 'shui' && bookPlain.startsWith('shei', i)) { const seg = book.slice(i, i + 4); out.push([seg, toneOf(seg)]); i += 4; }
    else { ok = false; break; }
  }
  if (ok && i === bookPlain.length) syl[l + '|' + h] = out; else unaligned.push(l + ' ' + h + ' ' + p);
}

const js = '// Generated by scripts/generate.cjs. Do not edit by hand.\n' +
  'window.BAIZI = window.BAIZI || {};\n' +
  'BAIZI.SENT_PY = ' + JSON.stringify(sentPy) + ';\n' +
  'BAIZI.SYL = ' + JSON.stringify(syl) + ';\n' +
  'BAIZI.FRAG_PY = ' + JSON.stringify(fragPy) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'generated.js'), js);
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'strokes.js'), '// Stroke data from hanzi-writer-data (Make Me a Hanzi), see LICENSE notes.\nwindow.BAIZI = window.BAIZI || {};\nBAIZI.STROKES = ' + JSON.stringify(strokes) + ';\n');
console.log('chars', chars.size, 'missing strokes', missing.join('') || 'none');
console.log('sentences', Object.keys(sentPy).length, 'aligned words', Object.keys(syl).length, 'unaligned:', unaligned.join('; '));
console.log('strokes.js KB', Math.round(fs.statSync(path.join(__dirname, '..', 'src', 'data', 'strokes.js')).size / 1024));
if (process.argv.includes('--print')) for (const [s, p] of Object.entries(sentPy)) console.log(s, '\t', p);

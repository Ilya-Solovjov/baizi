const { pinyin } = require('pinyin-pro');
const B = require('./load-data.cjs')(['vocab.js']);
const norm = s => s.normalize('NFC').toLowerCase().replace(/[\s'’\-]/g, '');
let bad = 0;
for (const [l, txt] of Object.entries(B.VOCAB_RAW)) for (const line of txt.trim().split('\n')) {
  const [t, h, p] = line.split('|');
  const auto = pinyin(h, { type: 'array', toneSandhi: true }).join('');
  if (norm(auto) !== norm(p)) { bad++; console.log(l, h, 'book:', p, ' lib:', pinyin(h)); }
}
for (const [l, txt] of Object.entries(B.WRITE_RAW)) for (const line of txt.trim().split('\n')) {
  const [h, p] = line.split('|'); const auto = pinyin(h);
  if (norm(auto) !== norm(p)) console.log('WRITE', l, h, p, auto);
}
console.log('mismatches', bad);

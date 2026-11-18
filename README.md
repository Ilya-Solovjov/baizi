# 百字 Bǎizì

A game-style study hub for first-quarter Mandarin, hosted by 小饺 (a dumpling) along a lantern trail,, built around *Modern Chinese 1A* (2nd ed.), Units 1–4. The name means "a hundred characters": the course goal is to handwrite about 100 characters from memory.

**Live:** `https://<your-username>.github.io/baizi/` (after you turn on GitHub Pages, see below)

## What it does

| Section | What you practice |
| --- | --- |
| **Quests** | The home page. A side quest for each language-partner practice (six short steps: learn the lines a few at a time, mix-and-match review, pick your own answers, build sentences, a role-play boss, and a ready check with a cheat sheet), plus a main campaign through every lesson |
| **Progress** | The 百字 board (all 120 characters from the stroke-order pages, filled in as you write them), progress by lesson, and a can-do checklist per unit |
| **Cards** | Spaced-repetition flashcards in three directions: 汉字 → meaning, English → 汉字, listen → meaning. Plus a searchable word list |
| **Write** | Draw characters from memory; each stroke is checked as you draw. "Learn strokes" mode animates, then lets you trace. "Mock dictation" gives you a 10-item list to write on paper and self-mark |
| **Grammar** | 50 patterns from the structure notes, each with a short explanation, examples, and drills (fill the blank, pick the right sentence, put words in order) |
| **Speak** | Mock oral interviews: hear a question, answer out loud, then compare against a model answer |
| **Tones** | A tone quiz on course vocabulary, tone contours, and the tone-change rules (3rd + 3rd, 不, 一) |
| **Culture** | Short quiz on the cultural notes from each unit |

Everything earns XP: levels run from 新手 (newcomer) to 大师 (master), with a 60 XP daily goal shown as a ring in the header.

The lesson filter at the top limits every section to the lessons you pick. Progress is saved in your browser's localStorage.

## Bonus: 夜市 Night Market Run

`docs/run.html` is an experimental word-card roguelike built on the same data, with two acts and a boss at the end of each.

- **Cards are words, and grammar decides the builds.** Each word maps to one card (Attack, Skill or Power; common, uncommon or rare). Verbs build *Flow* that 了 and 那么 cash in. Numbers build *Count* that measure words spend as multi-hits. Adjectives apply *Fluster* (damage over time) and 很 / 真 / 太 multiply it. Nouns stack Block and 是 / 吃饱 hit for your Block. 因为 / 都 / 们 / 一下 make the next card play twice. Helping verbs give Strength, and 学 / 教 / 请客 reward Spent cards.
- **Keywords** in the deckbuilder tradition: Keep, Fleeting, Spent, Echo, Opener, and Powers that last all fight. Upgrades add effects, not just bigger numbers, and card rewards lean toward the builds you've started.
- **To play a card you answer a question about it**, and the question gets harder as the card levels up: meaning → pinyin → tones → typing the pinyin, listening, or picking the characters. A wrong answer gives half the effect and cracks the card. Three right answers master it (熟), which upgrades it and lets you *Speak* it: type the pinyin from memory and it plays twice.
- **Grammar combos** reward playing cards in natural order (想 + 吃, 很 + 好, 两 + 个, 吃 + 了).
- **Enemies quiz you:** some ask grammar questions, others say lines from the language-partner practice sheets and you choose the best reply.
- **A word album** tracks every word across runs, and the words you miss most join your next starting deck.

### Install it as an app

`docs/run.html` is an installable web app with an offline cache. Once the repo is on GitHub Pages, open `https://<your-username>.github.io/<repo>/run.html` and:

- **Chrome or Edge (Mac, Windows, Linux):** click the install icon at the right end of the address bar (or menu → *Cast, save and share* → *Install page as app*). It gets its own window and a Dock / Start menu icon, and works offline after the first visit.
- **Safari on a Mac:** *File → Add to Dock*.

Progress is saved in the browser for that address, so the installed app keeps its own saves separate from other copies of the game.

## Run it

Open `docs/index.html` in a browser. That's it: it's a single self-contained file. (The stroke-drawing library and fonts load from public CDNs, so you need to be online.)

### Put it on GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, pick **Deploy from a branch**, branch `main`, folder `/docs`.

## Project layout

```
src/
  styles.css          design tokens + all styles
  app.js              the whole app (vanilla JS, hash routing)
  data/
    vocab.js          word lists and the 120 handwriting characters, per lesson
    grammar.js        patterns, examples and drills
    speaking.js       oral-test questions + can-do goals
    culture.js        culture quiz + tone-change rules
    partner.js        language-partner quests (lines, answer templates, role plays)
  run/
    run/game.css      Night Market Run styles
    run/parts/*.js    Night Market Run source, joined in name order by the build (cards in 10-cards.js, combat in 50-combat.js)
    generated.js      (built) sentence pinyin and per-syllable tones
    strokes.js        (built) stroke data for every character
scripts/
  generate.cjs        builds generated.js and strokes.js
  build.cjs           inlines everything into docs/index.html
  check-pinyin.cjs    flags vocab pinyin that differs from a dictionary
docs/index.html       the built app (what GitHub Pages serves)
```

## Editing content

Add or fix words in `src/data/vocab.js` (one word per line: `tier|汉字|pinyin|part of speech|English`), drills in `src/data/grammar.js`, then rebuild:

```
npm install
npm run build
```

`generate.cjs` spells sentence pinyin using the course word list first, so words come out the way the textbook writes them (míngzi, xuésheng, yí ge).

## Built with

- [Hanzi Writer](https://hanziwriter.org) for stroke animation and stroke checking (MIT)
- [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) / Make Me a Hanzi stroke data (Arphic Public License, see `licenses/`)
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) at build time for pinyin of practice sentences (MIT)
- Browser speech synthesis for audio (needs a Chinese voice on your device)

Built with help from Claude.

## Content note

The word lists follow the lesson vocabulary of *Modern Chinese 1A* (Better Chinese). No lesson texts, dialogues, exercises or images from the book are included. Grammar explanations, drills, speaking prompts and culture questions are original. This project isn't affiliated with Better Chinese.

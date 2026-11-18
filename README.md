# 百字 Bǎizì

Two study games for first-quarter Mandarin, built around *Modern Chinese 1A* (2nd ed.), Units 1–4:

- **[Bǎizì](https://ilya-solovjov.github.io/baizi/)**, a study hub with flashcards, stroke-checked handwriting, grammar drills, mock oral interviews and language-partner quests. The name means "a hundred characters": the course goal is to handwrite about 100 characters from memory.
- **[夜市 Night Market Run](https://ilya-solovjov.github.io/baizi/run.html)**, a pixel-art deckbuilding roguelike in the style of *Slay the Spire*, where every card is a word from the course and you answer a question about it to play it.

Both run in the browser, have no accounts and no server, and save your progress in the browser.

## Bǎizì: the study hub

| Section | What you practice |
| --- | --- |
| **Quests** | The home page. A side quest for each language-partner practice (learn the lines a few at a time, mix-and-match review, pick your own answers, build sentences, a role-play boss, and a ready check with a cheat sheet), plus a main campaign through every lesson |
| **Progress** | The 百字 board (all 120 characters from the stroke-order pages, filled in as you write them), progress by lesson, and a can-do checklist per unit |
| **Cards** | Spaced-repetition flashcards in three directions: 汉字 → meaning, English → 汉字, listen → meaning, plus a searchable word list |
| **Write** | Draw characters from memory; each stroke is checked as you draw. "Learn strokes" animates and then lets you trace. "Mock dictation" gives a 10-item list to write on paper and self-mark |
| **Grammar** | 50 patterns, each with a short explanation, examples and drills (fill the blank, pick the right sentence, put words in order) |
| **Speak** | Mock oral interviews: hear a question, answer out loud, then compare with a model answer |
| **Tones** | A tone quiz on course vocabulary, tone contours and the tone-change rules (3rd + 3rd, 不, 一) |
| **Culture** | A short quiz on the cultural notes from each unit |

Everything earns XP, from 新手 (newcomer) to 大师 (master), with a daily goal ring in the header. The lesson filter at the top limits every section to the lessons you pick.

## 夜市 Night Market Run

Climb two acts of a night market and beat a boss at the end of each, on a branching map of fights, elites, shops, teahouses, events and treasure.

- **To play a card, answer a question about its word.** Questions get harder as a card levels up: meaning → pinyin → tones → typing the pinyin, listening, or picking the characters. A wrong answer gives half the effect and cracks the card so it comes straight back. Three right answers master a card (熟): it upgrades, and you can **Speak** it (type the pinyin from memory) to play it twice.
- **Grammar decides the builds.** Verbs build *Flow* that 了 and 那么 cash in. Numbers build *Count* that measure words spend as multi-hits. Adjectives apply *Fluster* (damage over time) and 很 / 真 / 太 multiply it. Nouns stack Block and 是 / 吃饱 hit for your Block. 因为 / 都 / 们 / 一下 make the next card play twice. Helping verbs give Strength, and 学 / 教 / 请客 reward Spent cards. Question words look ahead and fetch cards.
- **Deckbuilder rules:** Attacks, Skills and Powers; common, uncommon and rare cards; keywords such as Keep, Fleeting, Spent, Echo and Opener; upgrades that add effects; relics and potions. Each run starts with a choice of opening card, and card rewards lean toward the builds you've started.
- **Grammar combos** reward playing words in natural order (想 → 吃, 很 → 好, 两 → 个, 吃 → 了).
- **Enemies quiz you.** Some ask grammar questions; others say lines from the language-partner practice sheets and you choose the best reply.
- **A word album** tracks every word across runs, and the words you miss most join your next starting deck.
- **Paths:** Units 3–4, Units 1–2, or everything.

All characters, icons and frames are pixel art drawn in code (`src/run/parts/12b-sprites.js`), rendered by a small renderer that shades shapes, dithers and outlines them.

### Install it as an app

Night Market Run is an installable web app that works offline after your first visit. Open https://ilya-solovjov.github.io/baizi/run.html, then:

- **Chrome or Edge (Mac, Windows, Linux):** click the install icon at the right end of the address bar, or open the menu → *Cast, save and share* → *Install page as app*. It gets its own window and a Dock / Start menu icon.
- **Safari on a Mac:** *File → Add to Dock*.

Saves belong to the address you play at, so the installed app keeps its own progress.

## Run it locally

Open `docs/index.html` (Bǎizì) or `docs/run.html` (Night Market Run) in a browser. Each is one self-contained file. Bǎizì loads its stroke library and fonts from public CDNs, so it needs internet; Night Market Run embeds its fonts and only fetches the Chinese serif font, falling back to your system's.

## Host it on GitHub Pages

In the repository, go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/docs`, and save. The site appears at `https://<username>.github.io/<repo>/` after a minute or two.

## Project layout

```
src/
  app.js, styles.css      Bǎizì (vanilla JS, hash routing)
  data/
    vocab.js              word lists and the 120 handwriting characters, per lesson
    grammar.js            patterns, examples and drills
    speaking.js           oral-test questions and can-do goals
    culture.js            culture quiz and tone-change rules
    partner.js            language-partner quests (lines, answer templates, role plays)
    generated.js          (built) sentence pinyin and per-syllable tones
    strokes.js            (built) stroke data for every character
  run/
    game.css              Night Market Run styles
    fonts/                Pixelify Sans and IBM Plex Sans Condensed subsets (embedded at build)
    parts/*.js            Night Market Run source, joined in name order by the build:
                          10-cards (card templates), 11-relics, 12-enemies, 12a-pixel (renderer),
                          12b-sprites, 12c-icons, 50-combat, 60-rewards, 61-rooms, …
scripts/
  generate.cjs            builds generated.js and strokes.js
  build.cjs               inlines everything into docs/index.html and docs/run.html, plus the app manifest and offline worker
  make-icons.cjs          renders the app icons from the player sprite (needs Playwright)
  check-pinyin.cjs        flags vocab pinyin that differs from a dictionary
docs/                     the built site (what GitHub Pages serves)
```

## Editing content

Add or fix words in `src/data/vocab.js` (one word per line: `tier|汉字|pinyin|part of speech|English`) and drills in `src/data/grammar.js`, then rebuild:

```
npm install
npm run build
```

`generate.cjs` spells sentence pinyin from the course word list first, so words come out the way the textbook writes them (míngzi, xuésheng, yí ge). A new word becomes a Night Market Run card automatically: its part of speech picks a card family, and signature words can be given their own card in `SIG` in `src/run/parts/10-cards.js`.

## Built with

- [Hanzi Writer](https://hanziwriter.org) for stroke animation and stroke checking (MIT)
- [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) / Make Me a Hanzi stroke data (Arphic Public License, see `licenses/`)
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) at build time for pinyin of practice sentences (MIT)
- [Pixelify Sans](https://github.com/eifetx/Pixelify-Sans) and [IBM Plex Sans Condensed](https://github.com/IBM/plex) (SIL Open Font License, see `licenses/`)
- Browser speech synthesis for audio (needs a Chinese voice on your device)

Built with help from Claude.

## Content note

The word lists follow the lesson vocabulary of *Modern Chinese 1A* (Better Chinese). No lesson texts, dialogues, exercises or images from the book are included. Grammar explanations, drills, speaking prompts and culture questions are original. This project isn't affiliated with Better Chinese.

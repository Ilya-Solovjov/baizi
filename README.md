# 百字 Bǎizì

**Play:** https://ilya-solovjov.github.io/baizi/

A pixel-art deckbuilding roguelike for first-quarter Mandarin, built around *Modern Chinese 1A* (2nd ed.), Units 1–4, in the spirit of *Slay the Spire*. Every card is a word from the course, and to play a card you answer a question about it. Climb two acts of a night market, build a deck around Chinese grammar, and beat a boss at the end of each act.

The name means "a hundred characters": the course goal is to know about 100 characters by heart.

## How it plays

- **Answer to play.** Questions get harder as you learn a word: meaning → pinyin → tones → typing the pinyin, listening, or picking the characters. A wrong answer gives half the effect and cracks the card so it comes straight back. Three right answers master a word (熟), which switches it to the hardest questions.
- **Grammar decides the builds.** Verbs build *Flow* that 了 cashes in. Numbers build *Count* that measure words spend as multi-hits. Adjectives apply *Fluster* (damage each turn) and 很 / 真 / 太 multiply it. Nouns stack Block and 是 / 吃饱 hit for your Block. 因为 / 都 / 们 / 一下 make the next card play twice. Helping verbs give Strength, and 学 / 教 / 请客 reward Spent cards. Question words look ahead and fetch cards.
- **Deckbuilder rules:** Attacks, Skills and Powers; common, uncommon and rare cards; keywords such as Keep, Fleeting, Spent, Echo and Opener; upgrades that add effects; relics and potions. Each run starts with a choice of opening card, and card rewards lean toward the builds you've started.
- **Grammar combos** reward playing words in natural order (想 → 吃, 很 → 好, 两 → 个, 吃 → 了).
- **Enemies quiz you.** Some ask grammar questions. Others say lines from the language-partner practice sheets; you pick the best reply, then see both lines in English. Some tie your tongue (舌 Tongue-tied), so your next cards have to be played by typing their pinyin from memory, and some calm down and shed Fluster.
- **Paths:** Units 3–4, Units 1–2, or everything.
- **Spice levels (辣度):** ten optional difficulty steps, like Ascension. Winning a run unlocks the next level, and each adds a rule on top of the ones below it.
- **A word album** tracks every word across runs, and the words you miss most join your next starting deck.

All characters, icons and frames are pixel art drawn in code (`src/game/parts/12b-sprites.js`) by a small renderer that shades, dithers and outlines simple shapes.

## Install it as an app

Bǎizì installs as an app and works offline after your first visit. Open https://ilya-solovjov.github.io/baizi/, then:

- **Chrome or Edge (Mac, Windows, Linux):** click the install icon at the right end of the address bar, or open the menu → *Cast, save and share* → *Install page as app*.
- **Safari on a Mac:** *File → Add to Dock*.

The app updates itself the next time you open it online. Progress is saved in the browser for that address.

## Run it locally

Open `docs/index.html` in a browser. It's one self-contained file; only the Chinese serif font comes from Google Fonts, and it falls back to your system's.

## Host it on GitHub Pages

In the repository, go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/docs`, and save.

## Project layout

```
src/
  data/
    vocab.js              word lists per lesson
    grammar.js            grammar patterns and drills (enemy quiz questions)
    culture.js            culture questions (fortune-teller event)
    partner.js            language-partner conversations and their English
    generated.js          (built) sentence pinyin and per-syllable tones
  game/
    game.css              styles
    fonts/                Pixelify Sans, Jersey 10 and IBM Plex Sans Condensed subsets (embedded at build)
    parts/*.js            the game, joined in name order by the build:
                          10-cards (card templates), 11-relics, 12-enemies, 12a-pixel (renderer),
                          12b-sprites, 12c-icons, 50-combat, 60-rewards, 61-rooms, …
scripts/
  generate.cjs            builds generated.js (pinyin spelled the way the textbook spells words)
  build.cjs               builds docs/index.html, the app manifest and the offline service worker
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

A new word becomes a card automatically: its part of speech picks a card family, and signature words can get their own card in `SIG` in `src/game/parts/10-cards.js`.

## Built with

- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) at build time for the pinyin of practice sentences (MIT)
- [Pixelify Sans](https://github.com/eifetx/Pixelify-Sans), [Jersey 10](https://fonts.google.com/specimen/Jersey+10) (digits) and [IBM Plex Sans Condensed](https://github.com/IBM/plex) (SIL Open Font License, see `licenses/`)
- Browser speech synthesis for audio (needs a Chinese voice on your device)

Built with help from Claude.

## Content note

The word lists follow the lesson vocabulary of *Modern Chinese 1A* (Better Chinese). No lesson texts, dialogues, exercises or images from the book are included. Grammar explanations, drills and culture questions are original. This project isn't affiliated with Better Chinese.

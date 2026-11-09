# Hajime はじめ — learn a language from zero

A playful, game-like language app that runs in the browser and installs on your phone like an app.
Five beginner courses: **Japanese, Chinese, French and Spanish** (taught from English) and **English for
French speakers**. Short daily lessons, a winding learning path, streaks, XP, hearts — and spaced
repetition that keeps bringing back what you are about to forget. Kuri the shiba cheers you on.

**Live app:** https://tedtomato.github.io/learn-japanese/

## The courses

Open the app and pick a language; the language screen shows your progress in each one, and the flag at
the top switches at any time. Every course keeps its own progress, streak and gems.

| Course | Sections → units | Size |
|---|---|---|
| 🇯🇵 **Japanese** | *First trip to Japan:* Hello & thank you · Getting around · Food & drinks · Shopping & help · Numbers, prices & time · At the hotel · Eating out · Trains & taxis · Help & health — *Everyday Japanese:* People & jobs · Food words · Verbs: do and don't · Days, dates & time · Asking questions · Around you — *Real Japanese:* Casual & slang · Kana corner | 210 words, 101 sentences, 75 hiragana + katakana for loanwords, 48 kanji with 74 compound words, 30 sign situations |
| 🇨🇳 **Chinese** (Mandarin, simplified) | *First trip to China:* Hello & thank you · Getting around · Numbers, prices & time · Food & drinks · Shopping & help · At the hotel · Eating out · Trains & taxis · Help & health — *Everyday Chinese:* People & jobs · Food words · Around you · Everyday verbs · Days, dates & time · No, not & did · Asking questions — *Real Chinese:* Casual & slang | 214 words, 111 sentences, 58 characters with 102 compound words, 31 sign situations, tone trainer |
| 🇫🇷 **French** | *First trip to France:* Hello & thank you · Getting around · Food & drinks · Shopping & money — *Everyday French:* Numbers & time · People & family · Home & daily life · Weather & seasons — *Real French:* Feelings & small talk · Help & health · Casual & slang | 255 words, 117 sentences |
| 🇪🇸 **Spanish** (Castilian, with Latin American notes) | same units as French, for Spain | 284 words, 128 sentences |
| 🇬🇧 **English for French speakers** | same units as French, for the UK; meanings, notes, grammar and the whole interface in French | 265 words, 119 sentences |

Every course also has 14–19 grammar cards, 10 verbs with full conjugation tables, 11–18 real-life
missions (one per unit), 13–14 pattern drills, 22–32 dialogues, a phrasebook, 100–200 fun facts with
their quiz, and 20 pronunciation tips.

## What's inside

- **The path**: themed units of essential words, starting with what a first-time visitor needs (hello,
  getting around, ordering, paying), then everyday life (numbers, time and dates, people, verbs,
  negation and past, questions), then casual speech. Each unit ends with a review trophy and unlocks a
  mission; a locked unit can be skipped with a *Test out* quiz (85% or more).
- **Japanese reading**: short *Read it* lessons spread through the units from unit 2 (hiragana, then
  katakana for the loanwords the course uses); romaji sits over each syllable until you can read the
  word, then fades. **Kanji the radical + mnemonic way**: radicals, then each kanji with its parts and a
  micro-story, then compound words; kanji spotted in fun-fact breaks come back as questions. **Chinese**:
  pinyin over each character until the word is known, stroke-order tracing, a tone trainer and tone
  questions inside lessons.
- **Exercises**: new-word cards with memory tricks, guess-first, trace the character, reading / listening
  / meaning questions, match pairs, build sentences from tiles, fill the gap, type what you hear, type the
  word or sentence, type the meaning, pick the article (le / la, un / una), verb forms, fast natural-speed
  listening, say it out loud (speech recognition), 15-second grammar cards and two-person dialogues with
  comprehension questions. From the second level on, at least 40% of a lesson asks you to *produce* the
  language rather than recognise it, and question difficulty follows how well you know each word.
- **Games**: missions (role-plays with one of the cast, graded with stars), pattern drills (one sentence,
  many words), the fun-facts quiz, the sign spotter (Japanese and Chinese) and the tone trainer (Chinese).
  Hands-free **listening mode** for walks.
- **A cast of characters** speaks every line with your phone's voice for that language and moves their
  mouths while talking — Yuki & Mika, Lìlì & Xiǎoměi, Camille & Léa, Lucía & Sofía, Emma & Olivia.
- **Speed challenge** (off for your first two lessons): a countdown per task; quick answers earn a bonus.
  Correct answers move on automatically.
- **Keep repeating**: spaced repetition per word and character with a one-day grace for new words. Wrong
  *or hesitant* answers come back in a "Let's correct the exercises you missed" round and return sooner
  later. *Explain my answer* breaks any answer down word by word.
- **Game layer**: streak with freezes and milestones, daily goal, hearts (none lost in a lesson's first
  play), gems, treasure chests, trophies, achievements, weekly recap, petals when you finish.
- **Breaks**: fun facts, phrases, pronunciation tips and (Japanese / Chinese) a character to spot, all
  collected in Practice → Library.
- **Accessible**: screen-reader announcements and focus management, keyboard operation with optional
  number-key shortcuts, "Show text" mode for listening tasks, timer that can be turned off, reduced
  motion, scalable type, 44 px touch targets. **Dark mode**, works **offline**, **backup / restore** per
  course, "can't listen / speak now" pauses those tasks.

## Install on your phone

1. Open https://tedtomato.github.io/learn-japanese/ on the phone.
2. **iPhone (Safari):** Share → *Add to Home Screen*. **Android (Chrome):** menu → *Install app*.
3. Open it from the home-screen icon. It runs full screen and works offline (only the language you are
   learning is stored; the others download on demand).

Progress lives on the phone. Use **Profile → Backup** now and then (to Google Drive or iCloud Drive) so
you can restore it on another device. Backups are per course.

## How updates reach your phone

There is no server: GitHub hosts everything.

1. A push to `main` runs the **Test and deploy** GitHub Action: unit tests, content validator, build,
   phone-screen check, then publish to GitHub Pages (two to three minutes).
2. The installed app checks for a new version when opened or brought back to the foreground. It downloads
   only the files that changed, then applies the update straight away if you just opened the app, or shows
   *"A new version is ready — Update"* if you are busy (never during a lesson, mission or game).
3. Your progress is untouched by updates; when a course's path is reshaped, finished lessons are carried
   over. The version and the change log are in **Profile → App version**.

**One-time setup:** in the repository go to **Settings → Pages → Build and deployment → Source** and
choose **GitHub Actions**.

## Development

No dependencies, no framework: plain HTML, CSS and JavaScript modules. You only need Node 20+.

```sh
npm test          # unit tests for all five courses + content validator (about 130 tests)
npm run check     # content validator only (articles, glosses, ids, missions, lesson sizes…)
npm run build     # copies app/ to dist/, stamps the version, writes the per-course offline file lists
npm run serve     # build + serve dist/ on http://localhost:4173
npm run screens   # build + open every screen of every course on a 393×851 phone (needs Playwright)
```

```
app/
  index.html, manifest.webmanifest, sw.js   app shell (static start screen), install info, offline + updates
  css/app.css                               design tokens (light + dark) and all styles
  js/lang.js, js/content/pack.js            the five courses and the active course's content pack
  js/content/                               Japanese pack at the top level; zh/, fr/, es/, en/ packs
  js/course.js                              builds sections → units → path nodes (kana / kanji pacing)
  js/lesson/generate.js, js/lesson/player.js   exercise generation and the lesson screen
  js/srs.js, js/progress.js                 spaced repetition, XP, streak, hearts, test-out, saving
  js/normalise.js, js/strings.js, js/a11y.js   per-course text matching, UI strings (French for the English course), accessibility helpers
  js/screens/                               Learn path, Practice, Profile, language screen, missions, drills, games
scripts/build.mjs                           build step used locally and by GitHub Actions
scripts/check-content.mjs                   content validator
scripts/screens.mjs                         phone-screen check used in the deploy pipeline
tests/                                      node:test unit tests
docs/                                       roadmap, design system, request tracker, content style guide per language
```

Each course is a content pack: `units.js` (words, sentences, dialogues), `grammar.js` (grammar cards,
glossary, conjugations), `extras.js` (facts, phrases), `fact-quiz.js`, `missions.js`, `patterns.js`,
`pronunciation.js`, plus `kanji.js` / `hanzi.js`, `signs.js`, `mnemonics.js` and `strokes.js` for the
character-based courses. French, Spanish and English words are written `[word, meaning, art]` and their
sentences need no romanisation. The style guide for each language is in `docs/content-style-<code>.md`;
`npm run check` enforces the mechanical rules.

Two dev scripts refresh bundled third-party data (run them only when adding characters or pictures):

```sh
node scripts/strokes.mjs /path/to/kanjivg          # → app/js/content/strokes.js
node scripts/strokes-zh.mjs /path/to/makemeahanzi  # → app/js/content/zh/strokes.js
node scripts/art.mjs /path/to/twemoji              # → app/art/*.svg
```

## Credits

- Japanese stroke-order data: [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel, CC BY-SA 3.0 —
  `app/js/content/strokes.js` is derived from it and shared under the same licence.
- Chinese stroke-order data: [Make Me a Hanzi](https://github.com/skishore/makemeahanzi), Arphic Public
  License (`app/js/content/zh/strokes.js`).
- Illustrations: [Twemoji](https://github.com/jdecked/twemoji) © Twitter / X and contributors,
  CC BY 4.0 (`app/art/`).

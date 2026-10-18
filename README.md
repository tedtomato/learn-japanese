# Hajime はじめ — learn Japanese from zero

A playful, game-like Japanese course that runs in the browser and installs on your phone like an app.
Short daily lessons, a winding learning path, streaks, XP, hearts — and spaced repetition that keeps
bringing back what you are about to forget. Kuri the shiba cheers you on.

**Live app:** https://tedtomato.github.io/learn-japanese/

## What's inside

**The path** — themed units of essential words, starting with what a first-time visitor to Japan needs:

| Section | Units |
|---|---|
| **First trip to Japan** | Hello & thank you (casual / polite / formal), Getting around, Food & drinks, Shopping & help |
| **Everyday Japanese** | Numbers, People & jobs, Food words, Around you |
| **Real Japanese** | Casual & slang, plus a Kana corner for the rest of the chart |

- **Reading is spread through the units**: each unit has short *Read it* lessons for the characters
  its own words use (hiragana, katakana, small っ/ゃ), most frequent first. Romaji is written over
  each syllable until you can read every character of a word, then it fades away.
- **Kanji, the radical + mnemonic way**: radicals first (人 口 木 氵 日 田 力 女 子), every kanji with
  its parts (木 + 木 = 林) and a micro-story, then straight into compound words (入口 entrance,
  出口 exit, 先生 teacher, 日本酒 sake). Kanji you spot in "Did you know?" cards come back in practice
  as questions with their tip as a clue.
- **Exercises**: new-word cards, trace the character (stroke order, direction, from memory), reading /
  listening / meaning questions, match pairs, build sentences, fast natural-speed listening, say it out
  loud (speech recognition), 15-second grammar cards, and two-person dialogues to understand.
- **A cast of characters** — Ken, Yuki, Sora and Hana — speak every line with their own voice and
  move their mouths while talking. Kuri the shiba stars on the main screens.
- **Speed challenge**: every task has a countdown with a ticking finish; answers in time earn a speed
  bonus. Correct answers move on automatically after a second.
- **Keep repeating**: spaced repetition per word and character. Wrong *or hesitant* answers are noted,
  come back in a "Let's correct the exercises you missed" round, and return sooner in later reviews.
  *Explain my answer* breaks any answer down word by word.
- **Game layer**: streak and week view, daily goal, hearts, gems, treasure chests, trophies,
  achievements, sakura petals when you finish.
- **Fun facts & phrases** about the unit's theme as breaks, all collected in the Practice tab.
- **Dark mode**, works **offline**, **backup / restore**, "can't listen / speak now" pauses those tasks
  for an hour.

## Install on your phone

1. Open https://tedtomato.github.io/learn-japanese/ on the phone.
2. **iPhone (Safari):** Share → *Add to Home Screen*. **Android (Chrome):** menu → *Install app*.
3. Open it from the home-screen icon. It runs full screen and works offline.

Progress lives on the phone. Use **Profile → Save backup** now and then (e.g. to iCloud Drive or
Google Drive) so you can restore it on another device.

## How updates reach your phone

There is no server: GitHub hosts everything.

1. A push to `main` runs the **Test and deploy** GitHub Action: unit tests, then build, then publish to
   GitHub Pages (about a minute).
2. The installed app checks for a new version every time it is opened or brought back to the
   foreground. It downloads the update in the background, then:
   - applies it straight away if you just opened the app, or
   - shows *"A new version is ready — Update"* if you are busy (never in the middle of a lesson).
3. Your progress is untouched by updates. The version is shown in **Profile → About**, which also has
   a *Check for updates* button.

**One-time setup:** in the repository go to **Settings → Pages → Build and deployment → Source** and
choose **GitHub Actions**.

## Development

No dependencies, no framework: plain HTML, CSS and JavaScript modules. You only need Node 20+.

```sh
npm test          # unit tests (course data, spaced repetition, streaks, lesson generator)
npm run build     # copies app/ to dist/ and stamps the version into the service worker
npm run serve     # build + serve dist/ on http://localhost:4173
```

```
app/
  index.html, manifest.webmanifest, sw.js   app shell, install info, offline + updates
  css/app.css                               design tokens (light + dark) and all styles
  js/content/                               kana, words & sentences, facts / phrases / kanji
  js/course.js                              builds sections → units → path nodes
  js/srs.js, js/progress.js                 spaced repetition, XP, streak, hearts, saving
  js/lesson/generate.js, js/lesson/player.js   exercise generation and the lesson screen
  js/screens/                               Learn path, Practice, Profile
scripts/build.mjs                           build step used locally and by GitHub Actions
tests/                                      node:test unit tests
docs/                                       roadmap and design system
```

Adding content is mostly editing `app/js/content/units.js` (words, sentences, dialogues),
`kanji.js` and `grammar.js`. The course builder works out which characters each unit teaches; the
tests check that every word becomes readable and every illustration and stroke file is bundled.

Two dev scripts refresh bundled third-party data (run them only when adding characters or pictures):

```sh
node scripts/strokes.mjs /path/to/kanjivg     # → app/js/content/strokes.js
node scripts/art.mjs /path/to/twemoji         # → app/art/*.svg
```

## Credits

- Stroke-order data: [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel, CC BY-SA 3.0 —
  `app/js/content/strokes.js` is derived from it and shared under the same licence.
- Illustrations: [Twemoji](https://github.com/jdecked/twemoji) © Twitter / X and contributors,
  CC BY 4.0 (`app/art/`).

# Hajime はじめ — learn Japanese from zero

A playful, game-like Japanese course that runs in the browser and installs on your phone like an app.
Short daily lessons, a winding learning path, streaks, XP, hearts — and spaced repetition that keeps
bringing back what you are about to forget. Kuri the shiba cheers you on.

**Live app:** https://tedtomato.github.io/learn-japanese/

## What's inside (v1)

- **Section 1 — Hiragana:** all 46 base characters + 25 voiced ones (が, ぱ…), taught in small groups,
  each followed by real words written only with characters you already know.
- **Section 2 — First words:** greetings, numbers 1–10, introducing yourself, ordering food and drink,
  and your first sentences.
- **Exercises:** new-character cards with memory hints, multiple choice (read / listen / recall),
  match the pairs, spell words with kana tiles, and build sentences from a word bank.
- **Listening:** every character, word and sentence is spoken with the device's Japanese voice
  (normal and 🐢 slow).
- **Keep repeating:** every item has its own memory strength (Leitner-style spaced repetition).
  Lessons mix in about 30% review, mistakes come back before the lesson ends, lessons you are
  forgetting get an orange refresh badge on the path, and the Practice tab builds a session from your
  weakest items. Each lesson can be replayed up to level 5 with harder exercises and fewer romaji hints.
- **Game layer:** streak with streak freezes, daily XP goal, 5 hearts (refill over time or through
  practice), gems, treasure chests, unit trophies and achievements.
- **Fun facts & phrases:** 200 facts about Japan, 52 travel phrases and 66 kanji pop up on the path and
  as a quick break in lessons. Everything you discover is collected in the Practice tab, and the
  phrasebook is always available with audio.
- **Dark mode** (automatic or manual), works **offline**, progress saved on the device with
  **backup / restore** to a file.

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

Adding content is mostly editing `app/js/content/*.js`. The tests check that every word in a hiragana
unit only uses characters taught up to that unit.

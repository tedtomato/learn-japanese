# Roadmap

## ✅ Phase 1 — Foundations (v1)
- Installable offline web app, hosted on GitHub Pages, auto-updating from `main`
- Learning path: sections → units → lessons, chests, unit review trophies, 5 levels per lesson
- Hiragana (71 characters) + first words and sentences (greetings, numbers, introductions, food)
- Exercises: intro cards, multiple choice (read / listen / recall), match pairs, kana spelling, sentence building
- Japanese text-to-speech with slow mode
- Spaced repetition per item, review mixed into lessons, fading lessons flagged on the path, Practice session
- Streak + freezes, daily goal, XP, hearts, gems, achievements
- Fun facts, travel phrasebook and kanji peeks, shown between lessons and collected in the Practice tab
- Light / dark mode, backup and restore

## Phase 2 — Smarter repetition
- Replace the Leitner boxes with a **forgetting-curve model** (half-life regression / FSRS-style): each
  item gets a memory half-life that grows with correct answers and shrinks with mistakes; items come
  back when predicted recall drops below a threshold
- **Adaptive difficulty:** estimate the chance of answering each exercise correctly and choose
  exercises that keep the success rate around 75–85% (not boring, not discouraging)
- **Mistakes inbox:** Practice hub sections for *Today's review*, *Weak words*, *Listening review*
- Typing answers (romaji → kana keyboard) as an advanced exercise

## Phase 3 — Listening & speaking
- **Speaking exercises** with the browser's speech recognition (read aloud, shadowing) and feedback
- **Dictation:** type what you hear, at full speed or slow
- **Fill in the blank (cloze):** choose the missing particle (は / が / を / に), word or verb ending
- Pre-recorded natural audio as an option instead of device voices

## Phase 4 — Characters tab, katakana & kanji
- A dedicated **Characters (文字)** tab: hiragana, katakana and kanji charts with strength, tap to hear
- **Katakana** section (loanwords: コーヒー, テレビ…)
- **Stroke-order drawing** using KanjiVG stroke data:
  1. animated demonstration (direction, curves, stops / flicks / sweeps)
  2. guided tracing with numbered arrows — strokes in the wrong order or direction reset with feedback
  3. faded outline only
  4. recall in an empty 4-square practice grid
  - pronunciation plays while tracing
- **Kanji module** for the ~80–100 easiest kanji (starting from the 66 already in the app), taught with
  their words, broken into components / radicals, reinforcing stroke rules
- **Display options:** romaji on · furigana on / romaji off · furigana off

## Phase 5 — Stories & more game
- **Interactive stories and dialogues** (café, station, shop, asking directions) with choices and
  comprehension questions
- **Rapid recall:** timed matching rounds
- **Daily quests** (e.g. "score 90% in 3 lessons") and **monthly challenge badges**
- **Streak milestones** (7, 30, 100, 365 days) with celebrations
- **Leagues:** weekly leaderboards with promotion / relegation — simulated rivals first; real friends and
  friend quests need a shared backend, which we only add if it is still wanted (GitHub-only for now)
- Mascot moods, more sound and haptic polish, optional reminder notifications

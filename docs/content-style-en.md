# Content style guide: English for French speakers (`en`)

Folder: `app/js/content/en/`. Taught text is British English; every explanation, meaning, note,
grammar rule/tip, mission text and pronunciation tip is written in French. Only FACTS and
FACT_QUIZ stay in simple English (they double as reading practice).

## Words and sentences
- Word shape: `[english, sens en français, emoji, { note?, alt? }]`. The English word is its own
  id (`w-<slug>`), so two different words may never slug to the same id.
- Words are lowercase, except `I`, proper nouns and nationalities, days, months and `OK`. Keep the
  British form first; give the American form in the `note` or in `alt` (`soccer`, `movie`).
- No article is added to nouns in the word list (`station`, not `the station`). Tell the learner
  when a noun is used with `a / an` in the `note`.
- Sentence chunks are lowercase words, one chunk per word, except `I`, `I'm`, `I'd`, `I've`,
  `I'll` and names. Fixed units may be one chunk: `half past`, `fish and chips`. No final
  punctuation. Every chunk must be a taught word or have a `GLOSSARY` entry (lookup is exact).
- `en` (the French translation) has no final punctuation either. `alt` lists every other
  natural French rendering (tu / vous, masculine / feminine, contractions).
- Lessons hold 3-5 items (words or sentences). A sentence lesson names its grammar card.

## Notes (voice)
- One or two short sentences in French, addressed to the learner ("on", "vous" for rules).
- Cover one thing: a false friend, an irregular form, a British / American difference or a
  culture tip. Show the English first, then the French meaning after `=`.
- Irregular verbs: give the three forms once (`Go, went, gone`).

## Pronunciation (`say`)
- `say` respells English for French readers, with stressed syllables in CAPITALS and hyphens
  between syllables: `THènk-iou`, `OUÈNZ-dei`.
- The dental th is always written `TH` (voiceless and voiced alike); explain the difference in
  PRONUNCIATION, not in the respelling. Use `ou` for w, `tch` for ch, `dj` for j, `aï` for the
  vowel of "my", `eu` for the schwa, `ii` for a long i.

## Pictures
- Use only emoji that exist in the art set (`art-emoji.txt`) plus the flags: for an abstract
  word, pick the object that the sentence usually involves. Numbers use the keycap or `🔢`.
- Duplicates are fine when no better picture exists (days and months share `📅`).

## Grammar cards
- `{ title, rule, blocks, en, tip, check }`: all text in French; `blocks[].jp` is the English
  part, `blocks[].en` its French label. The check has exactly one gap and the answer is among
  the options. Roles: noun, particle (small grammar words), verb, end.

## Verbs, conjugations and drills
- CONJUGATIONS: `forms` maps a label (`I`, `you`, `he / she`, `we`, `they`, `past`) to the verb
  form without the pronoun. Add `past` only for irregular verbs worth drilling.
- PATTERNS: `jp` is the fixed English part, `slotLast: true` puts the verb or noun after it,
  `en(word)` builds the French meaning. Slot ids are real word ids, ideally 6+ per pattern.

## Dialogues and missions
- Dialogues: 3-5 lines, `who` 0/1 alternate; the first question stays in `question/options`
  and every question also appears in `questions: [{ question, options }]` (right answer first).
- Missions: 5-6 steps, one right reply and two plausible wrong ones with a French `note`.

## Facts
- FACTS: simple English, one idea per fact, category from the unit list, `icon` from the
  tidbit emoji names. FACT_QUIZ: one question per id, the answer never appears in the question,
  exactly three plausible wrong answers.

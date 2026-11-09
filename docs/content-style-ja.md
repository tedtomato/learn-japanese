# Content style guide: Japanese (ja)

Applies to `app/js/content/` (units, grammar, missions, patterns, mnemonics, kana, kana-words, pronunciation).

## Scripts and chunks
- Words are written in kana (hiragana; katakana for loanwords). Common kanji go in `alt: ['駅']` so a learner who types or speaks them is accepted. Kanji are taught in their own lessons (kanji.js).
- Sentence `jp` is an array of chunks, one chunk per word or particle: `['わたし', 'は', 'がくせい', 'です']`. Verb and adjective endings stay with the stem (たべます, おいしい); `です`, `か`, particles and `でした` are their own chunks.
- `romaji` is lowercase, Hepburn, with long vowels written as kana spells them (ou, ii, aa, ee, oo). One romaji word per chunk (the course throws if the counts differ). Particles are written as pronounced: は = wa, を = o, へ = e.
- Never put a space inside a chunk's romaji. Write `tabemasen`, `deshita` as separate chunks.
- Every chunk of every sentence must be a taught word or have a `GLOSSARY` entry (conjugated forms like たべません are glossary entries, not words).

## Words
- Shape: `[jp, romaji, english, picture, { note, alt }]`. English meaning is lowercase, short, with polite/casual in brackets: `eat / will eat (polite)`.
- Default register is polite (です/ます). Mark casual words in the meaning: `thanks (friends & family)`.
- Verbs are taught in the polite ます form, with the dictionary form only in the note or in `CONJUGATIONS`.
- Every word needs a mnemonic in `mnemonics.js` keyed `w-<romaji slug>`: an English sound-alike, a vivid scene, ending in one or two emoji.
- Word ids come from the romaji slug; two different words never share one (so `にち` and `にちようび` are fine, two readings of the same romaji are not).

## `note` voice
- One or two short sentences, plain English, addressed to the learner. Say when to use it, a trap, or the pattern (`Month = number + がつ`). Quote Japanese in kana, no romaji unless the point is sound.

## Pictures
- Only emoji that have bundled art (see `app/art`; the test `every illustration used is bundled` checks it). Pick the object, not the abstraction (🍽️ eat, 🥤 drink). It is fine to reuse a picture inside a unit.

## Lessons and units
- 3 to 5 items per lesson (words plus sentences). A new word is taught before the sentence that uses it, in the same or an earlier lesson.
- Units have a theme, a mission (5 to 6 steps), at least two dialogues, and `grammar` ids that exist in `GRAMMAR`.
- Grammar cards: a rule in one sentence, coloured blocks, a one-gap `check` whose answer is among its options.
- Mission `unit` keys are `<section>-<unit>` (e.g. `everyday-verbs`). Every wrong reply has a `note` explaining the mistake.
- Dialogues: 3 to 5 lines, natural polite speech; first option of each question is the right one. Use `questions` for more than one question; the first is mirrored in `question`/`options`.

## Pronunciation tips (`pronunciation.js`)
- `{ id, title, text, example, say, icon }`; `say` is kana the speaker can read aloud; `icon` is a name from `EMOJI` in `tidbits.js`.

## Katakana
- `KATAKANA_ROWS` holds the whole chart plus ー ッ ャ ュ ョ ァ ィ ゥ ェ ォ. Every katakana character a course word uses must be in it and have a `KANA_WORDS` example (same shape as hiragana: `[word, romaji, picture, meaning]`).

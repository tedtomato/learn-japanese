# French content style guide (`app/js/content/fr/`)

Standard metropolitan French, meanings in English. Keep new content consistent with these rules.

## Words
- Shape: `[french, english, emoji, { note?, alt? }]`. The id comes from the slug of the French text (`w-la-gare`),
  so no two different words may slug the same.
- Nouns always carry their article: `le`, `la`, `l'` (vowel or silent h), `les` (always-plural nouns such as
  `les toilettes`). Gender is learned with the word. The article exercise only asks about le/la/un/une nouns.
- Verbs are infinitives (`aller`, `avoir besoin de`); their forms live in `CONJUGATIONS` (grammar.js) and
  the `note` gives the irregular present.
- Adjectives and nationalities are masculine; the feminine goes in `note` and in `alt` (`désolée`).
- Everything is lowercase, except names (Camille, Paris). Days, months, languages and nationalities have no
  capital in French. Numbers carry the digit in `alt` (`['70']`).
- Meanings: short, lowercase English, "to" before verbs (`to go`), alternatives with ` / `.

## Sentences
- `{ jp: [chunks], en, alt? }`. Chunks are lowercase tiles (except names), 2 to 6 per sentence, with no final
  punctuation and no space before `?` or `!`. Elided words stay joined (`j'ai`, `l'eau`, `n'est`, `s'il vous plaît`).
- Every chunk must be a taught word or have a `GLOSSARY` entry.
- `en` is the natural translation without final punctuation; list contractions and sensible variants in `alt`.
- Use `ne … pas` in full in sentences; mention the spoken drop of `ne` in the card `tip`.

## Notes (voice)
- One or two sentences, friendly, practical: when to use it, a trap, a cultural detail. Say "a woman writes
  X" for gender forms. Mention how it is said when the spelling misleads ("the p is silent: set").

## Pictures
- One emoji per word from the cartoon art set (tests fail for missing art). Reuse is allowed for families
  (all numbers 🔢, all days/months 📅), but pick a distinct picture when the word is concrete.
- 🪭 is madame (not a kimono), 👔 monsieur, 🇫🇷 français, 🇬🇧 anglais, 🇺🇸 américain.

## Respelling (`say`, in PHRASES and PRONUNCIATION)
- English-reader syllables joined by hyphens, stress in CAPITALS on the last syllable of the phrase:
  `bohn-ZHOOR`, `sahn-TAY`. `ahn`/`ohn`/`an` mark nasal vowels, `zh` is the j in je, `ew` is French u,
  `uh` is the schwa. Liaison is shown (`lay-zah-MEE`). No IPA.

## Romanisation
- None: `romaji` repeats the French. Typed answers forgive accents and punctuation (`soeur` = `sœur`).

## Lessons and units
- Lessons have 3 to 5 items, all words or all sentences. A sentence lesson names its grammar card in
  `grammar` and comes after the words it uses. Units hold 6 to 17 lessons, a mission (`<section>-<unit>`)
  and two dialogues (`d-x`, `d-x2`) of 3 to 5 lines.
- Dialogues: `question`/`options` is the first comprehension question and `questions[0]` repeats it; the
  first option is the right answer. Speakers: woman = Camille, woman2 = Léa.
- Facts: category from the eight `FACT` groups, a one-to-two-sentence text, an `icon` name from tidbits,
  and a quiz entry (`q`, `a`, three `wrong`) whose question never contains the answer.

# Spanish course: content style guide

Source: `app/js/content/es/`. Castilian (Spain) is the base; Latin American forms go in `note`.
Meanings are in English (`L.gloss`). Keep to these rules when adding words, sentences or lessons.

## Words (`units.js`)
Shape: `[spanish, english, emoji, { note?, alt? }]`.
- **Articles**: every noun carries its article in the text (`el baño`, `la estación`, `los zapatos`). Plural articles (`los`, `las`) are fine but are not
  used in the el/la article drill.
- **Capitalisation**: lowercase everything, including days, months, languages and nationalities (`el lunes`, `mayo`,
  `español`). Only proper names (Lucía, Madrid) keep a capital.
- **Punctuation**: word texts may keep `¿ ?` or `¡ !` when the word is a question or exclamation (`¿dónde?`,
  `¡genial!`). Sentence chunks never contain `¿ ¡ . ? !`; dialogue and mission lines may.
- **Verbs** are infinitives (`comer`, `ir`); forms live in `CONJUGATIONS` and in sentences.
- **Gender pairs**: the masculine form is the word, the feminine goes in the note (`encantado` / `encantada`).
- **Ids** come from the slug of the text (accents and `¿?` dropped): `ser`, `él` and `el` would collide, so avoid
  adding a word whose slug equals another word's.
- **Lesson size**: 3 to 5 items. Words first, then a sentence lesson that uses only taught words; any other chunk
  needs a `GLOSSARY` entry (`grammar.js`, exact text including accents).

## Sentences
- `jp` is an array of chunks (single words or fixed groups such as `por favor`, `a las`, `voy a`).
- `en` is the main translation; list natural alternatives in `alt` (contractions, order variants, Latin America).
- Do not repeat a sentence: the id comes from its text.

## `alt` policy
Use `alt` on words for forms speech recognition may return (`sí` / `si`, `encantado` / `encantada`) and on
sentences for every reasonable English rendering. Never add an alternative that changes the meaning.

## `note` voice
One or two short sentences in friendly English. Say when to use the word, one irregularity, or a tip from real life.
Mention Spain first and Latin America after: "In Latin America: boleto." No grammar jargon without an example.

## Pronunciation (`say`, `PRONUNCIATION`, `PHRASES`)
English-friendly respelling: syllables joined by hyphens, **stressed syllable in capitals** (`gah-RAH-heh`).
Castilian sounds: z / ce / ci as "th" (`GRAH-thyahs`); note the Latin American "s" in the text, not in `say`.
j and g before e/i = `h`; ll and y = `y`; ñ = `ny`; rr = `rr`; the h is silent (not written in `say`).
There is no separate romanisation: Spanish is already written in Latin letters, so `romaji` is empty or equals `jp`.

## Pictures
Use the emoji of the shared art set only (the list in `app/art`, plus 🇪🇸). Prefer a concrete object (🛏 for `la cama`),
else a gesture or sign (👌 for `entender`). Several words may share one picture (🔢 for numbers).

## Grammar cards, patterns, missions, dialogues
- Cards: `title`, `rule`, `blocks` (roles `noun`, `particle`, `verb`, `end`), `en`, `tip`, `check` with exactly one gap.
- Patterns: slot words are real word ids; the slot keeps its article, so write English that reads right with it.
  Verb patterns take the infinitive after a conjugated helper (`quiero`, `puedo`, `tengo que`, `vamos a`).
- Missions: one per unit (`<section>-<unit>`), 5 to 6 steps, replies reuse the unit's sentences; every wrong reply has a `note`.
- Dialogues: 3 to 5 lines; two per unit. The first answer of every `options` / `questions[].options` is the right one.

## Facts and quizzes
Spain-centred, each with a category from `units.js` (`FACT`), an icon name from `tidbits.js`, and a quiz entry
(`q`, `a`, three `wrong`) whose question never contains its answer. Currently 103 facts.

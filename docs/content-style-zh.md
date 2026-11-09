# Content style guide: Mandarin Chinese (zh)

Standard mainland usage, simplified characters. Content lives in `app/js/content/zh/`.

## Words and chunks
- A word is `[hanzi, pinyin, meaning, emoji, extras?]`. The field called `jp` holds hanzi, `romaji` holds pinyin.
- Pinyin carries tone marks, one syllable per character, no spaces inside a word (`xièxie`, `Běijīng`).
  Multi-word items may use a space (`zǎoshang hǎo`, `shénme shíhou`) but a sentence chunk is ONE token
  (`shénmeshíhou`), because a sentence has one pinyin word per chunk.
- Write tone changes as spoken: 不 is `bú` before a 4th tone (`bú shì`) and `bù` otherwise; 一 is `yí`
  before a 4th tone, `yì` before 1st/2nd/3rd (`yí ge`, `yì bēi`) and `yī` alone or in numbers/days (`xīngqīyī`).
  Third-tone sandhi (你好) keeps the written tone marks (`nǐhǎo`); teach it in PRONUNCIATION.
- Proper names and places are capitalised (`Běijīng`, `Ānnà`); everything else is lowercase.
- Ids come from the pinyin with tone numbers (`w-chi1`, `w-xing1qi1yi1`). Two words must not make the same
  id: 他 and 她 are both `tā`, so 她/它 are explained in the note of 他 and in GLOSSARY, not added as words.
- Chunks are lowercase hanzi words, not single characters, unless the character is a real word or particle
  (我, 不, 了, 吗). Question words and particles that are not words go into GLOSSARY.

## Sentences and `alt`
- No final punctuation in `jp` chunks; the English translation has no final full stop either.
- `en` is the natural English sentence; `alt` lists every other accepted wording (contractions, he/she,
  "I'd like" for "I want"). Include a gender-neutral alternative where 他/她 sound the same.
- New sentences use only taught words, or a GLOSSARY entry per untaught chunk.
- Lessons hold 3 to 5 items (words or sentences). Grammar cards go on the first sentence lesson that needs them.

## Notes and mnemonics
- `note` voice: one or two plain sentences, say when/how to use the word, add a culture hook when it is useful,
  and warn about false friends (买 mǎi / 卖 mài, 哪 nǎ / 那 nà). Don't repeat the meaning.
- Every word needs a MNEMONIC (`mnemonics.js`, keyed by the word id): an English sound-alike for the
  pinyin tied to the meaning in one vivid image, ideally hinting the tone. End with one emoji.

## `say` respelling (PRONUNCIATION, PHRASES)
- Respell in plain English letters: `Nee how`, `Shyeh-shyeh`. Hyphens split syllables.
- In PRONUNCIATION, arrows show the tone: → high flat, ↗ rising, ↘↗ dipping, ↘ falling.
- Pinyin letters that fool English readers: q = ch, x = sh, c = ts, z = ds, zh = j, ü = "ee" with round lips.

## Pictures
- Only emoji from the art set (see `art-emoji.txt` in the art pipeline) plus 🇨🇳 🇬🇧 🇺🇸. Pick the most literal image:
  🍽️ for eat, 🥤 for drink, 📅 for days. Reuse is fine when words are siblings (all numbers 🔢).
- Mission `art` and pattern `art` follow the same rule. Fact `icon` is a name from the tidbits `EMOJI` table.

## Grammar cards, patterns, conjugations
- `GRAMMAR[id]`: title, one-sentence rule, blocks with roles (noun, verb, particle, end), a tip, a one-gap check.
- `PATTERNS`: `jp`/`romaji` are the fixed part; `slotLast: true` puts the slot after it. Slots are word ids.
- `CONJUGATIONS` forms are fixed labels: affirmative, negative (不), completed (了), did not (没);
  `formsRomaji` gives the pinyin.

## Dialogues and missions
- Dialogues have 3 to 5 lines; the first option of each question is correct. The first question also
  stays in `question`/`options`; `questions: [{ question, options }]` lists all of them.
- Missions are 5 or 6 steps, mix listening (`E`) and speaking (`R`) steps, use the unit's sentences, and every
  wrong reply has a short, kind `note`. Unit keys are `<section>-<unit>` (`everyday-verbs`).

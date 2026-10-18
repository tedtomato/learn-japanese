// Grammar cards: a visual rule (coloured blocks) followed by a 15-second interactive check.
// Block roles: noun, particle, end (です/か/ください), verb.
// check: { prompt: chunks with one null gap, en, options, answer }

export const GRAMMAR = {
  desu: {
    title: 'です — "is / am / are"',
    rule: 'Put です at the end to make a polite statement.',
    blocks: [{ jp: 'げんき', role: 'noun', en: 'well' }, { jp: 'です', role: 'end', en: 'am / is' }],
    en: 'I am well.',
    tip: 'Japanese often drops "I" — the situation makes it clear.',
    check: { prompt: ['げんき', null], en: 'I am well', options: ['です', 'か', 'と'], answer: 'です' },
  },
  ka: {
    title: 'か — the question mark you can hear',
    rule: 'Add か after です to turn a statement into a question. No word-order change!',
    blocks: [{ jp: 'えき', role: 'noun', en: 'station' }, { jp: 'は', role: 'particle', en: 'as for' }, { jp: 'どこ', role: 'noun', en: 'where' }, { jp: 'です', role: 'end', en: 'is' }, { jp: 'か', role: 'end', en: '?' }],
    en: 'Where is the station?',
    tip: 'は (as for…) is read "wa" when it is a particle.',
    check: { prompt: ['トイレ', 'は', 'どこ', 'です', null], en: 'Where is the toilet?', options: ['か', 'と', 'を'], answer: 'か' },
  },
  to: {
    title: 'と — "and" between things',
    rule: 'と joins two nouns: A と B = "A and B".',
    blocks: [{ jp: 'みず', role: 'noun', en: 'water' }, { jp: 'と', role: 'particle', en: 'and' }, { jp: 'おちゃ', role: 'noun', en: 'tea' }],
    en: 'Water and tea.',
    tip: 'と only links nouns. It is not used to join sentences.',
    check: { prompt: ['ビール', null, 'みず'], en: 'Beer and water', options: ['と', 'は', 'か'], answer: 'と' },
  },
  de: {
    title: 'で — "by / with" (how you do it)',
    rule: 'で after a noun says how something is done: カード で = "by card".',
    blocks: [{ jp: 'カード', role: 'noun', en: 'card' }, { jp: 'で', role: 'particle', en: 'by' }, { jp: 'おねがいします', role: 'end', en: 'please' }],
    en: 'By card, please.',
    tip: 'Also: でんしゃ で = by train.',
    check: { prompt: ['げんきん', null, 'おねがいします'], en: 'Cash, please (by cash)', options: ['で', 'と', 'か'], answer: 'で' },
  },
  wa: {
    title: 'は — "as for…" (the topic)',
    rule: 'X は Y です = "X is Y". は marks what you are talking about.',
    blocks: [{ jp: 'わたし', role: 'noun', en: 'I' }, { jp: 'は', role: 'particle', en: 'as for' }, { jp: 'がくせい', role: 'noun', en: 'student' }, { jp: 'です', role: 'end', en: 'am' }],
    en: 'I am a student.',
    tip: 'Written は but pronounced "wa" as a particle.',
    check: { prompt: ['わたし', null, 'いしゃ', 'です'], en: 'I am a doctor', options: ['は', 'と', 'で'], answer: 'は' },
  },
  san: {
    title: 'さん — polite name ending',
    rule: 'Add さん after someone else\'s name — like Mr / Ms. Never after your own name!',
    blocks: [{ jp: 'たなか', role: 'noun', en: 'Tanaka' }, { jp: 'さん', role: 'particle', en: 'Mr / Ms' }],
    en: 'Mr / Ms Tanaka',
    tip: 'さま is extra polite (customers), くん is for boys, ちゃん for children and close friends.',
    check: { prompt: ['ゆき', null, 'は', 'せんせい', 'です'], en: 'Ms Yuki is a teacher', options: ['さん', 'です', 'を'], answer: 'さん' },
  },
  ga: {
    title: 'が すき — saying what you like',
    rule: 'X が すき です = "I like X".',
    blocks: [{ jp: 'すし', role: 'noun', en: 'sushi' }, { jp: 'が', role: 'particle', en: '(subject)' }, { jp: 'すき', role: 'noun', en: 'liked' }, { jp: 'です', role: 'end', en: 'is' }],
    en: 'I like sushi.',
    tip: 'Literally "sushi is liked".',
    check: { prompt: ['ねこ', null, 'すき', 'です'], en: 'I like cats', options: ['が', 'と', 'か'], answer: 'が' },
  },
};

// Particles and small words, for "Explain my answer".
export const GLOSSARY = {
  は: { en: 'as for… (topic)', note: 'Marks what the sentence is about. Pronounced "wa".' },
  が: { en: '(subject)', note: 'Marks the subject — with すき, it marks what you like.' },
  を: { en: '(object)', note: 'Marks the thing being acted on. Pronounced "o".' },
  と: { en: 'and', note: 'Joins two nouns: A と B.' },
  で: { en: 'by / with', note: 'How something is done: カード で = by card.' },
  の: { en: '\'s / of', note: 'Possession: わたし の なまえ = my name.' },
  か: { en: '?', note: 'Turns the sentence into a question.' },
  です: { en: 'is / am / are', note: 'Polite ending for statements.' },
  さん: { en: 'Mr / Ms', note: 'Polite ending after someone else\'s name.' },
  なん: { en: 'what', note: 'Before です: なん です か = what is it?' },
  とても: { en: 'very', note: 'Polite "very". Casual: めっちゃ.' },
  それ: { en: 'that', note: 'Something near the other person.' },
  ちょっと: { en: 'a little / a moment', note: 'Also used to softly say no.' },
  まって: { en: 'wait', note: 'From まつ (to wait).' },
  はなせます: { en: 'can speak', note: 'Polite "can speak".' },
  おげんき: { en: 'well (polite, about someone else)', note: 'お makes it polite when talking about the other person.' },
  ゆき: { en: 'Yuki (a name)', note: 'A common name — it also means "snow".' },
  たなか: { en: 'Tanaka (a family name)', note: 'One of the most common family names.' },
};

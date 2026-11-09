// Pronunciation tips for the Spanish course (wired into the app later). Same fields as the tidbits:
// icon is a name from EMOJI in ../../tidbits.js; `say` respells the Castilian sound for English speakers
// (stressed syllable in capitals); Latin American differences are noted in the text.
export const PRONUNCIATION = [
  { id: 'vowels', title: 'Five pure vowels', text: 'Spanish has only five vowel sounds: a (ah), e (eh), i (ee), o (oh), u (oo). They are short and never glide into "ay" or "oh-oo" as in English.', example: 'patata', say: 'pah-TAH-tah', icon: 'music' },
  { id: 'silent-h', title: 'The silent h', text: 'The letter h is never pronounced. Hola starts with the "o" sound, and hotel with "o" too.', example: 'hola', say: 'OH-lah', icon: 'speech' },
  { id: 'single-r', title: 'The single r', text: 'Between vowels, r is one quick tap of the tongue, like the "tt" in the American "butter" or the British "very".', example: 'pero', say: 'PEH-roh', icon: 'speech' },
  { id: 'double-rr', title: 'The rolled rr', text: 'Double rr is a trill: let the tip of your tongue flutter against the roof of your mouth. The difference matters: pero = but, perro = dog.', example: 'perro', say: 'PEH-rroh', icon: 'dog' },
  { id: 'initial-r', title: 'R at the start of a word', text: 'An r at the start of a word, or after n, l or s, is rolled like rr: rojo, Enrique.', example: 'rojo', say: 'RROH-hoh', icon: 'star' },
  { id: 'j', title: 'The Spanish j', text: 'The j is a rough sound from the back of the throat, like the ch in Scottish "loch". In much of Latin America it is softer, almost an English h.', example: 'jamón', say: 'hah-MOHN', icon: 'food' },
  { id: 'g', title: 'g before e and i', text: 'Before e or i, g sounds like j: gente, gigante. Before a, o, u it is a hard g as in "go": gato, gusto.', example: 'gente', say: 'HEN-teh', icon: 'person' },
  { id: 'll-y', title: 'll and y', text: 'The ll and the y are pronounced like the y in "yes" in most of Spain. In Argentina and Uruguay they sound like the "zh" in "measure".', example: 'calle', say: 'KAH-yeh', icon: 'city' },
  { id: 'c-z', title: 'c and z', text: 'Before e or i, c and z sound like "th" in "think" in most of Spain. In Latin America, the Canaries and much of Andalusia they sound like s. Both are understood everywhere.', example: 'gracias', say: 'GRAH-thyahs', icon: 'sun' },
  { id: 'qu', title: 'qu is k', text: 'Qu is always a k sound and the u is silent: queso, quiero, aquí. The k sound before a, o, u is written c.', example: 'queso', say: 'KEH-soh', icon: 'cheese' },
  { id: 'gu', title: 'gue, gui and güe', text: 'In gue and gui the u is silent and the g is hard: guitarra. A dieresis (ü) makes the u sound: pingüino, vergüenza.', example: 'guitarra', say: 'gee-TAH-rrah', icon: 'music' },
  { id: 'enye', title: 'The letter ñ', text: 'Ñ is a separate letter pronounced "ny" as in "canyon". Don\'t drop the tilde: año (year) is not the same as ano.', example: 'mañana', say: 'mah-NYAH-nah', icon: 'calendar' },
  { id: 'b-v', title: 'b and v sound the same', text: 'The letters b and v are pronounced identically: a soft b, with the lips barely touching between vowels. Vino and bino rhyme.', example: 'vino', say: 'BEE-noh', icon: 'wine' },
  { id: 'soft-d', title: 'A soft d', text: 'Between vowels or at the end of a word, d is soft, like the "th" in "this" spoken lightly. At the end of a word it can almost vanish: Madrid, usted.', example: 'nada', say: 'NAH-dhah', icon: 'speech' },
  { id: 'stress', title: 'Where the stress falls', text: 'Without an accent mark, words ending in a vowel, n or s are stressed on the second-to-last syllable; words ending in any other consonant are stressed on the last. An accent mark breaks the rule.', example: 'hablan', say: 'AH-blahn', icon: 'star' },
  { id: 'accents', title: 'Accent marks matter', text: 'The accent mark tells you where to stress a word, and it separates look-alikes: sí (yes) vs si (if), tú (you) vs tu (your), él (he) vs el (the).', example: 'teléfono', say: 'teh-LEH-foh-noh', icon: 'book' },
  { id: 'ch', title: 'ch', text: 'Ch is one sound, like in "church", and it was a separate letter of the alphabet until 2010.', example: 'chocolate', say: 'choh-koh-LAH-teh', icon: 'sweets' },
  { id: 'diphthongs', title: 'Two vowels, one beat', text: 'A strong vowel (a, e, o) next to a weak one (i, u) glides into a single syllable: bue-no, cuan-do, cia-o. Two strong vowels stay apart: le-er, ca-er.', example: 'bueno', say: 'BWEH-noh', icon: 'school' },
  { id: 'x', title: 'The letter x', text: 'X is usually "ks" as in "taxi", but in México (and Mexican place names) it keeps the old sound of a rough j.', example: 'México', say: 'MEH-hee-koh', icon: 'flag' },
  { id: 'questions', title: 'Rising voice for questions', text: 'A yes/no question has no extra word: only the voice rises at the end, as the inverted mark ¿ warns you. Statements fall at the end.', example: '¿vienes?', say: 'bee-EH-nes', icon: 'speech' },
];

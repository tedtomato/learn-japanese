// The one place that decides when two pieces of text "are the same", per course: typed answers,
// what the speech recogniser heard, ids (slugs) and tile comparison. Latin-alphabet courses
// (French, Spanish, English) compare letters only: case, accents, apostrophes and spaces don't
// matter, but vowels never fold into each other (vous ≠ vos, pour ≠ poor, año ≠ ano).
import { L } from './lang.js';
import { toneNumbers } from './pinyin.js';

export function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}

export const similarity = (a, b) => (!a || !b ? 0 : 1 - editDistance(a, b) / Math.max(a.length, b.length));

// Latin courses: lowercase, accents stripped (œ → oe, æ → ae), only letters and digits kept.
// ñ is a different letter in Spanish, so it stays distinct from n.
const ENYE = '';
export const latinKey = (s) => s.toLowerCase().replace(/ñ/g, ENYE).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(new RegExp(`[^a-z0-9${ENYE}]`, 'g'), '');

// Japanese / Chinese typed romaji: long vowels (ou / oo / ō), ü as u, v as u and tone marks don't matter.
const romajiKey = (r) => r.toLowerCase().replace(/[üǖǘǚǜ]/g, 'u').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/v/g, 'u')
  .replace(/[^a-z]/g, '').replace(/ou/g, 'o').replace(/([aeiou])\1+/g, '$1');

// Typed answers: 'exact', 'close' (one slip in a word of five letters or more) or false.
export function romajiMatch(typed, answer) {
  const key = L.latin ? latinKey : romajiKey;
  const [t, a] = [key(typed), key(answer)];
  if (!t) return false;
  if (t === a) return 'exact';
  return a.length >= 5 && editDistance(t, a) === 1 ? 'close' : false;
}

// Speech recognition: kana (not katakana) without punctuation, or the Latin letters.
const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
export const speechKey = (s) => (L.latin ? latinKey(s) : toHira(s).replace(/[\s、。！？!?.,・～〜ー，：；“”]/g, ''));

// Ids: pinyin tones become numbers (买 mǎi → mai3), Latin accents are dropped (le café → le-cafe).
const plainLatin = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');
export const slug = (s) => (L.latin ? plainLatin(s) : toneNumbers(s)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Translations into the language of the meanings: case, apostrophes and punctuation don't matter.
export const glossKey = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

// Tiles of a target-language sentence: Latin courses compare word by word (par + le is not parle);
// Japanese and Chinese chunks run together.
export function sameTiles(a, b) {
  if (L.latin) return a.length === b.length && a.every((t, i) => latinKey(t) === latinKey(b[i]));
  return a.join('') === b.join('');
}

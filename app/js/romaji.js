// Splits kana text into syllables (mora) with their romaji, for the small romaji shown above each
// syllable (きゅう → きゅ kyu · う u). Small ゃゅょ join the syllable before them; small っ joins the
// next one and doubles its consonant; ー stretches the vowel.
import { HIRAGANA_ROWS } from './content/kana.js';

const BASE = new Map();
for (const row of HIRAGANA_ROWS) for (const [k, r] of row.kana) BASE.set(k, r);
BASE.set('ぢ', 'ji');
BASE.set('づ', 'zu');
BASE.set('を', 'o');

const SMALL_Y = { ゃ: 'a', ゅ: 'u', ょ: 'o' };
const SMALL_VOWEL = { ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o' };
const toHiragana = (ch) => {
  const c = ch.charCodeAt(0);
  return c >= 0x30a1 && c <= 0x30f6 ? String.fromCharCode(c - 0x60) : ch;
};
const isKana = (ch) => /[ぁ-ゖァ-ヺー]/.test(ch);

function joinSmall(base, small) {
  const v = SMALL_Y[small];
  if (base === 'shi') return `sh${v}`;
  if (base === 'chi') return `ch${v}`;
  if (base === 'ji') return `j${v}`;
  return `${base.slice(0, -1)}y${v}`; // きゃ kya, にょ nyo, びゅ byu
}

// Returns [{ text, romaji }] for each syllable; non-kana characters come back with romaji ''.
export function syllables(text) {
  const out = [];
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const h = toHiragana(ch);
    if (h === 'っ' && i + 1 < chars.length && isKana(chars[i + 1])) {
      // Attach the small tsu to the next syllable and double its first consonant.
      const nextH = toHiragana(chars[i + 1]);
      let text2 = chars[i + 1];
      let r = BASE.get(nextH) || '';
      if (i + 2 < chars.length && SMALL_Y[toHiragana(chars[i + 2])]) {
        r = joinSmall(r, toHiragana(chars[i + 2]));
        text2 += chars[i + 2];
        i += 1;
      }
      out.push({ text: ch + text2, romaji: (r.startsWith('ch') ? 't' : r[0]) + r });
      i += 1;
      continue;
    }
    if (h === 'ー') {
      const prev = out[out.length - 1];
      out.push({ text: ch, romaji: prev?.romaji ? prev.romaji.slice(-1) : '' });
      continue;
    }
    if (SMALL_Y[h] || SMALL_VOWEL[h]) {
      const prev = out[out.length - 1];
      if (prev && prev.romaji) {
        prev.text += ch;
        prev.romaji = SMALL_Y[h] ? joinSmall(prev.romaji, h) : prev.romaji.replace(/[aiueo]$/, '') + SMALL_VOWEL[h];
        continue;
      }
    }
    out.push({ text: ch, romaji: BASE.get(h) || '' });
  }
  return out;
}

const squash = (s) => s.toLowerCase().replace(/[^a-z]/g, '').replace(/tch/g, 'cch').replace(/ou/g, 'oo').replace(/(.)\1/g, '$1');

// Syllables for a word whose official romaji is known. Particles and words like こんにちは read は as
// "wa"; when the syllables still don't match the official romaji, returns null (show the plain
// romaji line instead).
export function syllablesFor(text, romaji) {
  const list = syllables(text);
  const words = romaji.toLowerCase().split(/\s+/);
  if (text === 'は' && romaji === 'wa') return [{ text, romaji: 'wa' }];
  if (text === 'へ' && romaji === 'e') return [{ text, romaji: 'e' }];
  const last = list[list.length - 1];
  if (last && last.text === 'は' && /wa$/.test(words[words.length - 1])) last.romaji = 'wa';
  return squash(list.map((s) => s.romaji).join('')) === squash(romaji) ? list : null;
}

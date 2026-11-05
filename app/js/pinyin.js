// Pinyin helpers for the Chinese course: split a word's pinyin into one syllable per character (to
// show it above each character, like romaji over kana), strip or number its tones (for ids and for
// lenient typing checks).

const INITIALS = ['', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const FINALS = ['a', 'o', 'e', 'i', 'u', 'v', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'er', 'ia', 'ie', 'iao', 'iu', 'ian', 'in',
  'iang', 'ing', 'iong', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang', 'ueng', 've', 'ue', 'van', 'vn', 'n', 'ng', 'm'];
// A syllable without an initial can only start with a, o or e (ai, ang, er…): i, u and ü finals are
// written yi, wu, yu there, so "fàngǔan" cannot be mistaken for fang + uan (饭馆 is fàn + guǎn).
const SYLLABLES = new Set(INITIALS.flatMap((i) => FINALS.filter((f) => i || /^[aoe]/.test(f)).map((f) => i + f)));

const TONE_MARKS = { '̄': 1, '́': 2, '̌': 3, '̀': 4 };
const isHanzi = (ch) => /\p{Script=Han}/u.test(ch);

// One plain letter per pinyin letter: ā → a, ǚ / ü → v, other characters as they are.
function base(ch) {
  const d = ch.normalize('NFD');
  if (d[0] === 'u' && d.includes('̈')) return 'v';
  if (d[0] === 'U' && d.includes('̈')) return 'v';
  return d[0].toLowerCase();
}

export const stripTones = (s) => [...s].map(base).join('');

// "nǐhǎo" → "ni3hao3" (for ids: 买 mǎi and 卖 mài must not clash).
export function toneNumbers(s) {
  let out = '';
  for (const word of s.split(/(\s+)/)) {
    if (/^\s+$/.test(word)) {
      out += word;
      continue;
    }
    // Put each tone number at the end of its syllable: find syllables first when possible.
    const parts = splitSyllables(word);
    if (!parts) {
      out += [...word].map((ch) => base(ch) + (TONE_MARKS[[...ch.normalize('NFD')].find((c) => TONE_MARKS[c])] || '')).join('');
      continue;
    }
    out += parts.map((p) => {
      const tone = [...p.normalize('NFD')].map((c) => TONE_MARKS[c]).find(Boolean) || '';
      return stripTones(p) + tone;
    }).join('');
  }
  return out;
}

// Splits one pinyin word into syllables, with exactly `count` syllables when given. Returns the
// original slices (tone marks kept) or null when it can't be split.
export function splitSyllables(word, count = null) {
  const chars = [...word.replace(/['’]/g, '\u0000')];
  const plain = chars.map((c) => (c === '\u0000' ? '|' : base(c)));
  const n = chars.length;
  const memo = new Map();
  const solve = (pos, left) => {
    if (pos === n) return left === 0 || left === null ? [] : null;
    if (left === 0) return null;
    const key = `${pos},${left}`;
    if (memo.has(key)) return memo.get(key);
    let start = pos;
    if (plain[start] === '|') start += 1;
    let found = null;
    for (let len = Math.min(6, n - start); len >= 1 && !found; len--) {
      const s = plain.slice(start, start + len).join('');
      if (!SYLLABLES.has(s) && !(s === 'r' && start > 0)) continue;
      const rest = solve(start + len, left === null ? null : left - 1);
      if (rest) found = [chars.slice(start, start + len).join(''), ...rest];
    }
    memo.set(key, found);
    return found;
  };
  return solve(0, count);
}

// [{ text: 你, romaji: nǐ }, { text: 好, romaji: hǎo }] for 你好 / nǐhǎo, or null when the pinyin
// doesn't give one syllable per character (then the whole word's pinyin is shown above it).
export function pinyinParts(text, pinyin) {
  const chars = [...text];
  if (!chars.length || !chars.every(isHanzi)) return null;
  const words = pinyin.trim().split(/\s+/);
  const out = [];
  let i = 0;
  for (let wi = 0; wi < words.length; wi++) {
    // How many characters this word covers: the fewest that split cleanly, leaving at least one
    // character for each word after it (the last word takes all the rest).
    const last = wi === words.length - 1;
    let parts = null;
    for (let k = last ? chars.length - i : 1; k <= chars.length - i - (words.length - wi - 1) && !parts; k++) parts = splitSyllables(words[wi], k);
    if (!parts) return null;
    for (const p of parts) out.push({ text: chars[i++], romaji: p });
  }
  return i === chars.length ? out : null;
}

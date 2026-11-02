// The Chinese (Mandarin) course content, in the same shapes as the Japanese course (see ../pack.js).
// Chinese has no kana: no "Read it" lessons, kana charts or kana words.
export { SECTIONS_DATA, DIALOGUES } from './units.js';
export { KANJI, RADICALS, KANJI_LESSONS } from './hanzi.js';
export { FACTS, PHRASES, KANJI as PEEK_KANJI } from './extras.js';
export { FACT_QUIZ } from './fact-quiz.js';
export { GRAMMAR, GLOSSARY } from './grammar.js';
export { SIGN_SCENES } from './signs.js';

export const MNEMONICS = {};
export const MISSIONS = [];
export const PATTERNS = [];
export const STROKES = {};
export const KANA = new Map();
export const HIRAGANA_ROWS = [];
export const KATAKANA_ROWS = [];
export const KANA_WORDS = {};

// Small grammar words offered as extra tiles in sentence building, and their pinyin.
export const FILLERS = ['的', '吗', '是', '很', '不', '了', '在', '和'];
export const FILLER_ROMAJI = { 的: 'de', 吗: 'ma', 是: 'shì', 很: 'hěn', 不: 'bù', 了: 'le', 在: 'zài', 和: 'hé', 也: 'yě', 呢: 'ne' };

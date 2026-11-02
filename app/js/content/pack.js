// The active course's content (chosen in lang.js): every screen imports content from here, so the
// same code runs the Japanese and the Chinese course.
import { LANG } from '../lang.js';
import * as ja from './ja.js';

const PACKS = { ja };
// Courses that can be picked from the flag.
export const AVAILABLE = Object.keys(PACKS);
const P = PACKS[LANG] || ja;

export const {
  SECTIONS_DATA, DIALOGUES, KANJI, RADICALS, KANJI_LESSONS, FACTS, PHRASES, PEEK_KANJI, FACT_QUIZ, GRAMMAR, GLOSSARY,
  MNEMONICS, MISSIONS, PATTERNS, SIGN_SCENES, STROKES, KANA, HIRAGANA_ROWS, KATAKANA_ROWS, KANA_WORDS, FILLERS, FILLER_ROMAJI,
} = P;

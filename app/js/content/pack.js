// The active course's content (chosen in lang.js): every screen imports content from here, so the
// same code runs the Japanese and the Chinese course.
import { LANG } from '../lang.js';
import * as ja from './ja.js';
import * as zh from './zh/index.js';
import * as fr from './fr/index.js';
import * as es from './es/index.js';
import * as en from './en/index.js';

const PACKS = { ja, zh, fr, es, en };
// Courses that can be picked from the flag.
export const AVAILABLE = Object.keys(PACKS);
const P = PACKS[LANG] || ja;
// Extra tiles in the language of the meanings (English, or French in the English course).
export const GLOSS_FILLERS = P.GLOSS_FILLERS || null;

export const {
  SECTIONS_DATA, DIALOGUES, KANJI, RADICALS, KANJI_LESSONS, FACTS, PHRASES, PEEK_KANJI, FACT_QUIZ, GRAMMAR, GLOSSARY,
  MNEMONICS, MISSIONS, PATTERNS, SIGN_SCENES, STROKES, KANA, HIRAGANA_ROWS, KATAKANA_ROWS, KANA_WORDS, FILLERS, FILLER_ROMAJI,
} = P;

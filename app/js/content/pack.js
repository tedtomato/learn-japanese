// The active course's content (chosen in lang.js): every screen imports content from here, so the
// same code runs the Japanese and the Chinese course.
import { LANG } from '../lang.js';

// Only the active course's pack is downloaded: one literal `import()` per course (the build adds the
// ?v= version to each literal) and a top-level await, so importers still read the names synchronously.
const LOADERS = {
  ja: () => import('./ja.js'),
  zh: () => import('./zh/index.js'),
  fr: () => import('./fr/index.js'),
  es: () => import('./es/index.js'),
  en: () => import('./en/index.js'),
};
// Courses that can be picked from the flag.
export const AVAILABLE = ['ja', 'zh', 'fr', 'es', 'en'];
const P = await LOADERS[LANG]();
// Extra tiles in the language of the meanings (English, or French in the English course).
export const GLOSS_FILLERS = P.GLOSS_FILLERS || null;

export const {
  SECTIONS_DATA, DIALOGUES, KANJI, RADICALS, KANJI_LESSONS, FACTS, PHRASES, PEEK_KANJI, FACT_QUIZ, GRAMMAR, GLOSSARY,
  MNEMONICS, MISSIONS, PATTERNS, SIGN_SCENES, STROKES, KANA, HIRAGANA_ROWS, KATAKANA_ROWS, KANA_WORDS, FILLERS, FILLER_ROMAJI,
} = P;
// Added by the content packs as they grow; empty until a pack provides them.
export const CONJUGATIONS = P.CONJUGATIONS || [];
export const PRONUNCIATION = P.PRONUNCIATION || [];

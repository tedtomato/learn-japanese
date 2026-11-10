// Which language course is active, and the few words and settings that differ between courses.
// The course is chosen with the flag in the top bar and kept on the device; switching reloads the
// app, because the whole course tree is built once at start-up. Each course has its own progress.
// (Content field names come from the Japanese course: `jp` holds the target-language text and
// `romaji` its romanisation — pinyin in Chinese.)

export const COURSES = {
  ja: {
    code: 'ja', tag: 'ja', name: 'Japanese', native: '日本語', country: 'Japan', flag: 'jp', gloss: 'English',
    speech: 'ja-JP', roman: 'romaji', chars: 'kanji', Chars: 'Kanji', charOne: 'kanji', glyph: '漢',
    titleNative: 'はじめ', titleSay: 'はじめ！', voiceTest: 'こんにちは', hasKana: true,
    roadworks: '工事中',
    cast: { woman: 'Yuki', woman2: 'Mika' },
    cheers: [['がんばって！', 'You can do it!'], ['いいね！', 'Nice!'], ['すごい！', 'Amazing!'], ['ファイト！', 'Keep going!']],
    storageKey: 'hajime.progress.v1', testKey: 'hajime.test-progress.v1',
  },
  zh: {
    code: 'zh', tag: 'zh-Hans', name: 'Chinese', native: '中文', country: 'China', flag: 'cn', gloss: 'English',
    speech: 'zh-CN', roman: 'pinyin', chars: 'characters', Chars: 'Characters', charOne: 'character', glyph: '字',
    titleNative: '开始', titleSay: '开始！', voiceTest: '你好', hasKana: false,
    roadworks: '施工中',
    cast: { woman: 'Lìlì', woman2: 'Xiǎoměi' },
    cheers: [['加油！', 'Keep going!'], ['很好！', 'Very good!'], ['太棒了！', 'Awesome!'], ['你可以的！', 'You can do it!']],
    storageKey: 'hajime.zh.progress.v1', testKey: 'hajime.zh.test-progress.v1',
  },
  // Latin-alphabet courses: no characters to learn, so no kana, kanji, strokes or romanisation
  // (`romaji` holds the word itself). `gloss` is the language of the meanings (the `en` fields).
  fr: {
    code: 'fr', tag: 'fr', name: 'French', native: 'Français', country: 'France', flag: 'fr', flagEmoji: '🇫🇷', latin: true, gloss: 'English',
    speech: 'fr-FR', roman: 'French', chars: 'words', Chars: 'Words', charOne: 'word', glyph: 'Fr',
    titleNative: 'C\'est parti !', titleSay: 'C\'est parti !', voiceTest: 'Bonjour !', hasKana: false,
    roadworks: 'Travaux',
    cast: { woman: 'Camille', woman2: 'Léa' },
    cheers: [['Allez !', 'Come on!'], ['Bravo !', 'Well done!'], ['Super !', 'Great!'], ['Tu peux le faire !', 'You can do it!']],
    storageKey: 'hajime.fr.progress.v1', testKey: 'hajime.fr.test-progress.v1',
  },
  es: {
    code: 'es', tag: 'es', name: 'Spanish', native: 'Español', country: 'Spain', flag: 'es', flagEmoji: '🇪🇸', latin: true, gloss: 'English',
    speech: 'es-ES', roman: 'Spanish', chars: 'words', Chars: 'Words', charOne: 'word', glyph: 'Es',
    titleNative: '¡Vamos!', titleSay: '¡Vamos!', voiceTest: '¡Hola!', hasKana: false,
    roadworks: 'Obras',
    cast: { woman: 'Lucía', woman2: 'Sofía' },
    cheers: [['¡Ánimo!', 'Keep going!'], ['¡Muy bien!', 'Very good!'], ['¡Genial!', 'Great!'], ['¡Tú puedes!', 'You can do it!']],
    storageKey: 'hajime.es.progress.v1', testKey: 'hajime.es.test-progress.v1',
  },
  en: {
    code: 'en', tag: 'en-GB', name: 'English', native: 'English', country: 'the UK', flag: 'gb', flagEmoji: '🇬🇧', latin: true, gloss: 'French',
    speech: 'en-GB', roman: 'English', chars: 'words', Chars: 'Words', charOne: 'word', glyph: 'En',
    titleNative: 'Let\'s go!', titleSay: 'Let\'s go!', voiceTest: 'Hello!', hasKana: false,
    roadworks: 'Roadworks',
    cast: { woman: 'Emma', woman2: 'Olivia' },
    cheers: [['Keep going!', 'Continue !'], ['Well done!', 'Bravo !'], ['Brilliant!', 'Génial !'], ['You can do it!', 'Tu peux le faire !']],
    storageKey: 'hajime.en.progress.v1', testKey: 'hajime.en.test-progress.v1',
  },
};

const COURSE_KEY = 'hajime.course';
// Whether the learner has picked a language yet: the first launch opens the language screen.
export function courseChosen() {
  if (globalThis.__HAJIME_COURSE__) return true;
  try {
    return !!globalThis.localStorage?.getItem(COURSE_KEY);
  } catch {
    return true;
  }
}
function readCourse() {
  if (globalThis.__HAJIME_COURSE__) return globalThis.__HAJIME_COURSE__; // tests
  try {
    return globalThis.localStorage?.getItem(COURSE_KEY) || 'ja';
  } catch {
    return 'ja';
  }
}

export const LANG = COURSES[readCourse()] ? readCourse() : 'ja';
export const L = COURSES[LANG];

// The text shown under words (romanisation) — none in Latin-alphabet courses, where it is the word itself.
// Sentence chunks as one line of text: spaces between words in Latin-alphabet courses, none in Japanese / Chinese.
export const joinChunks = (chunks) => chunks.join(L.latin ? ' ' : '');

export const withRoman = (jp, romaji) => (L.latin || !romaji || romaji === jp ? jp : `${jp} · ${romaji}`);

// The language menu opens every time the app starts; once a language is picked (or the menu is
// closed) it stays away until the next start, including the reload that switching language needs.
const PICKED_KEY = 'hajime.language-picked';
export function languagePicked() {
  try {
    return globalThis.sessionStorage?.getItem(PICKED_KEY) === '1';
  } catch {
    return true;
  }
}
export function markLanguagePicked() {
  try {
    globalThis.sessionStorage?.setItem(PICKED_KEY, '1');
  } catch {
    /* ignore */
  }
}

// switchCourse reloads the page; the start screen was already shown, so the reload skips it (once).
const SKIP_SPLASH_KEY = 'hajime.skip-splash';
export function takeSkipSplash() {
  try {
    const skip = globalThis.sessionStorage?.getItem(SKIP_SPLASH_KEY) === '1';
    if (skip) globalThis.sessionStorage.removeItem(SKIP_SPLASH_KEY);
    return skip;
  } catch {
    return false;
  }
}

export function switchCourse(code) {
  if (!COURSES[code]) return;
  markLanguagePicked();
  try {
    localStorage.setItem(COURSE_KEY, code);
  } catch {
    return;
  }
  if (code === LANG) {
    // Same course: just go to the path (once; the hash change or the explicit event routes it).
    if (location.hash === '#/learn') window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = '#/learn';
    return;
  }
  try {
    sessionStorage.setItem(SKIP_SPLASH_KEY, '1');
  } catch {
    /* ignore */
  }
  location.hash = '#/learn';
  location.reload();
}

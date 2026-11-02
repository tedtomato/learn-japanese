// Which language course is active, and the few words and settings that differ between courses.
// The course is chosen with the flag in the top bar and kept on the device; switching reloads the
// app, because the whole course tree is built once at start-up. Each course has its own progress.
// (Content field names come from the Japanese course: `jp` holds the target-language text and
// `romaji` its romanisation — pinyin in Chinese.)

export const COURSES = {
  ja: {
    code: 'ja', name: 'Japanese', native: '日本語', country: 'Japan', flag: 'jp',
    speech: 'ja-JP', roman: 'romaji', chars: 'kanji', Chars: 'Kanji', charOne: 'kanji',
    titleNative: 'はじめ', titleSay: 'はじめ！', voiceTest: 'こんにちは', hasKana: true,
    cast: { woman: 'Yuki', woman2: 'Mika' },
    cheers: [['がんばって！', 'You can do it!'], ['いいね！', 'Nice!'], ['すごい！', 'Amazing!'], ['ファイト！', 'Keep going!']],
    storageKey: 'hajime.progress.v1', testKey: 'hajime.test-progress.v1',
  },
  zh: {
    code: 'zh', name: 'Chinese', native: '中文', country: 'China', flag: 'cn',
    speech: 'zh-CN', roman: 'pinyin', chars: 'characters', Chars: 'Characters', charOne: 'character',
    titleNative: '开始', titleSay: '开始！', voiceTest: '你好', hasKana: false,
    cast: { woman: 'Lìlì', woman2: 'Xiǎoměi' },
    cheers: [['加油！', 'Keep going!'], ['很好！', 'Very good!'], ['太棒了！', 'Awesome!'], ['你可以的！', 'You can do it!']],
    storageKey: 'hajime.zh.progress.v1', testKey: 'hajime.zh.test-progress.v1',
  },
};

const COURSE_KEY = 'hajime.course';
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

export function switchCourse(code) {
  if (!COURSES[code] || code === LANG) return;
  try {
    localStorage.setItem(COURSE_KEY, code);
  } catch {
    return;
  }
  location.hash = '#/learn';
  location.reload();
}

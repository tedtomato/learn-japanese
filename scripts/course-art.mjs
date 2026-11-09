// The pictures (Twemoji illustrations in app/art/) each course uses. Shared by scripts/build.mjs (per-course
// offline precache) and usable by scripts/art.mjs. The course tree is built for one language per process, so
// each course lists its pictures in a child run: node scripts/course-art.mjs <code> prints a JSON array of emoji.
import { execFileSync } from 'node:child_process';
import { artCode } from '../app/js/art.js';

export const COURSE_CODES = ['ja', 'zh', 'fr', 'es', 'en'];
// Pictures every course shows regardless of its content (flags, stats, tab icons…): see scripts/art.mjs.
export const EXTRA_EMOJIS = ['🇫🇷', '🇪🇸', '🇬🇧', '🔥', '💎', '❤️', '⭐', '🏆', '🎁', '🧊', '🌱', '🎯', '⚡', '🗾', '📚', '💬', '🈁', '🎌', '⏱️', '🌸', '🔤', '❓', '🎧', '🪧', '🍜', '🎫', '🚉', '🏨', '🛍️', '☕', '🍣', '🚕', '🗺️', '🧳', '🙋', '🏮', '🍱', '💾'];

export const courseEmojis = (code) => JSON.parse(execFileSync(process.execPath, [new URL(import.meta.url).pathname, code]).toString());
export const artFile = (emoji) => `art/${artCode(emoji)}.svg`;

if (process.argv[1] === new URL(import.meta.url).pathname && process.argv[2]) {
  globalThis.__HAJIME_COURSE__ = process.argv[2];
  const { ITEMS } = await import('../app/js/course.js');
  const { EMOJI_USED } = await import('../app/js/tidbits.js');
  const { MISSIONS, PATTERNS } = await import('../app/js/content/pack.js');
  const list = [...ITEMS.values()].flatMap((i) => [i.art, i.example?.art]);
  console.log(JSON.stringify([...new Set([...list, ...EMOJI_USED, ...MISSIONS.map((m) => m.art), ...PATTERNS.map((p) => p.art)].filter(Boolean))]));
}

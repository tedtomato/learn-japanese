// Dev tool: copies the Twemoji illustrations the app uses into app/art/.
// Usage: node scripts/art.mjs /path/to/twemoji   (Twemoji graphics © Twitter/X and contributors, CC BY 4.0)
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { artCode } from '../app/js/art.js';

// The course tree is built for one language per run, so each course lists its pictures in a child run.
if (process.argv[2] === '--course-emojis') {
  globalThis.__HAJIME_COURSE__ = process.argv[3];
  const { ITEMS } = await import('../app/js/course.js');
  const { EMOJI_USED } = await import('../app/js/tidbits.js');
  const { MISSIONS, PATTERNS } = await import('../app/js/content/pack.js');
  const list = [...ITEMS.values()].flatMap((i) => [i.art, i.example?.art]);
  console.log(JSON.stringify([...list, ...EMOJI_USED, ...MISSIONS.map((m) => m.art), ...PATTERNS.map((p) => p.art)].filter(Boolean)));
  process.exit(0);
}
const COURSES = ['ja', 'zh'];
const courseEmojis = (code) => JSON.parse(execFileSync(process.execPath, [new URL(import.meta.url).pathname, '--course-emojis', code]).toString());

const src = process.argv[2];
const out = new URL('../app/art/', import.meta.url).pathname;
const wanted = new Set(COURSES.flatMap(courseEmojis));
['🔥', '💎', '❤️', '⭐', '🏆', '🎁', '🧊', '🌱', '🎯', '⚡', '🗾', '📚', '💬', '🈁', '🎌', '⏱️', '🌸', '🔤', '❓', '🎧', '🪧', '🍜', '🎫', '🚉', '🏨', '🛍️', '☕', '🍣', '🚕', '🗺️', '🧳', '🙋', '🏮', '🍱', '💾'].forEach((e) => wanted.add(e));

if (process.argv.includes('--list')) {
  console.log([...wanted].map((e) => `/assets/svg/${artCode(e)}.svg`).join('\n'));
  process.exit(0);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const missing = [];
for (const e of wanted) {
  const file = join(src, 'assets', 'svg', `${artCode(e)}.svg`);
  if (existsSync(file)) copyFileSync(file, join(out, `${artCode(e)}.svg`));
  else missing.push(e);
}
console.log(`${readdirSync(out).length} illustrations copied; missing: ${missing.join(' ') || 'none'}`);

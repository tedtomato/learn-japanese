// Dev tool: copies the Twemoji illustrations the app uses into app/art/.
// Usage: node scripts/art.mjs /path/to/twemoji   (Twemoji graphics © Twitter/X and contributors, CC BY 4.0)
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { artCode } from '../app/js/art.js';
import { ITEMS } from '../app/js/course.js';
import { EMOJI_USED } from '../app/js/tidbits.js';

const src = process.argv[2];
const out = new URL('../app/art/', import.meta.url).pathname;
const wanted = new Set([...ITEMS.values()].flatMap((i) => [i.art, i.example?.art]).filter(Boolean));
EMOJI_USED.forEach((e) => wanted.add(e));
['🔥', '💎', '❤️', '⭐', '🏆', '🎁', '🧊', '🌱', '🎯', '⚡', '🗾', '📚', '💬', '🈁', '🎌', '⏱️', '🌸', '🔤', '❓'].forEach((e) => wanted.add(e));

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

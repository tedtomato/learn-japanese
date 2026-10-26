// Phone-screen check: opens every screen of the built app at a real phone size (393×851, the
// author's phone) and fails if text spills off the screen, overflows its box, or is too small to
// read, or if a page throws. Run after `npm run build`: node scripts/screens.mjs [--shots dir]
// Needs Playwright (locally set PLAYWRIGHT_PATH if it is elsewhere). SCREENS_CHANNEL=chrome uses the
// machine's installed Chrome instead of a downloaded Chromium (CI does this: no browser download).
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const load = (p) => { try { return require(p); } catch { return null; } };
const playwright = load('playwright') || load(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
if (!playwright) throw new Error('Playwright not found: npm i --no-save playwright && npx playwright install chromium');

const PORT = 4190;
const MIN_TEXT = 13; // px, any text you read
const MIN_RUBY = 10.5; // px, romaji above Japanese
const shotsAt = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (shotsAt) mkdirSync(shotsAt, { recursive: true });

const server = spawn(process.execPath, [new URL('./serve.mjs', import.meta.url).pathname, String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const problems = [];
const browser = await playwright.chromium.launch(process.env.SCREENS_CHANNEL ? { channel: process.env.SCREENS_CHANNEL } : {});
try {
  const page = await (await browser.newContext({
    viewport: { width: 393, height: 851 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce',
    userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36',
  })).newPage();
  let screen = 'start';
  page.on('pageerror', (e) => problems.push(`${screen}: page error — ${e.message}`));

  // Everything visible on screen right now that is too small, off-screen or clipped.
  const check = async (name, theme) => {
    screen = `${name} (${theme})`;
    const found = await page.evaluate(({ MIN_TEXT, MIN_RUBY }) => {
      const out = [];
      const W = innerWidth;
      if (document.documentElement.scrollWidth > W + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px wide)`);
      const seen = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent.trim();
        const el = n.parentElement;
        if (!text || !el || seen.has(el) || el.closest('[hidden], svg, .splash, [aria-hidden="true"]')) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        if (r.bottom < 0 || r.top > innerHeight) continue; // only what is on screen
        const label = `"${text.slice(0, 30)}"`;
        const size = parseFloat(cs.fontSize);
        const ruby = !!el.closest('rt');
        if (ruby ? size < MIN_RUBY : size < MIN_TEXT) out.push(`${label} is ${size}px`);
        if (r.right > W + 1 || r.left < -1) out.push(`${label} goes off the screen`);
        // Text cut by its own box (overflow hidden / ellipsis is allowed only where it is meant).
        if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible' && cs.textOverflow !== 'ellipsis' && !el.closest('.word-main')) out.push(`${label} is cut off`);
      }
      // Answer boxes and bubbles must hold their content.
      for (const box of document.querySelectorAll('.option, .tile, .bubble, .chat-bubble, .card, .sign')) {
        const r = box.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
        if (box.scrollWidth > box.clientWidth + 2) out.push(`"${box.textContent.trim().slice(0, 30)}" overflows its ${box.className.split(' ')[0]}`);
      }
      return out;
    }, { MIN_TEXT, MIN_RUBY });
    for (const f of found) problems.push(`${screen}: ${f}`);
    if (shotsAt) await page.screenshot({ path: `${shotsAt}/${name}-${theme}.png` });
  };
  const go = async (hash, wait = 450) => { await page.evaluate((h) => (location.hash = h), hash); await page.waitForTimeout(wait); };
  const continueLesson = () => page.evaluate(() => {
    const b = document.querySelector('.lesson-foot .check');
    if (b) { b.disabled = false; b.click(); }
  });

  await page.goto(`http://localhost:${PORT}/`);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('hajime.test-mode', '1'); });
  await page.reload();
  await page.waitForTimeout(500);
  await page.tap('.splash');
  await page.waitForTimeout(500);
  // A learner part-way through section 1, so every screen has content.
  await page.evaluate(async () => {
    const src = [...document.scripts].find((s) => s.type === 'module').src;
    const q = src.includes('?') ? src.slice(src.indexOf('?')) : '';
    const base = src.replace(/main\.js.*/, '');
    const { app } = await import(`${base}app.js${q}`);
    const { NODES } = await import(`${base}course.js${q}`);
    const now = Date.now();
    for (const n of NODES) {
      if (n.unit.id === 'tokyo-shopping') break;
      app.state.nodes[n.id] = { level: 1 };
      for (const id of n.items || []) app.state.items[id] = { box: 1, seen: 2, right: 2, wrong: id.length % 3 ? 0 : 1, last: now, due: now + 1e8, ...(id.length % 5 ? {} : { missed: now }) };
    }
    app.state.seen.fact = ['f1', 'f2', 'f3', 'f4', 'f5'];
    app.save();
  });

  const SCREENS = [
    ['#/learn', 'learn'], ['#/practice/today', 'practice'], ['#/practice/games', 'practice-games'], ['#/practice/library', 'practice-library'],
    ['#/practice/kanji', 'practice-kanji'], ['#/practice/kana', 'practice-kana'],
    ['#/profile', 'profile'], ['#/collection/phrase', 'phrasebook'], ['#/collection/fact', 'facts'], ['#/quiz', 'facts-quiz'],
    ['#/signs', 'signs'], ['#/mission/cafe', 'mission'], ['#/mission/izakaya', 'mission-izakaya'], ['#/drill/kudasai', 'drill'], ['#/listen', 'listening'],
  ];
  const LAB = ['intro', 'read', 'build', 'match', 'grammar', 'dialogue', 'kanji', 'listen', 'fast', 'speak', 'trace'];
  // Sizes are the same in both themes: dark only (the app's usual look) keeps the check quick.
  for (const theme of ['dark']) {
    await page.emulateMedia({ colorScheme: theme });
    for (const [hash, name] of SCREENS) {
      await go(hash);
      await check(name, theme);
      if (name.startsWith('practice')) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(200);
        await check(`${name}-bottom`, theme);
      }
    }
    for (const kind of LAB) {
      await go(`#/lab/${kind}`, 600);
      await check(`lab-${kind}`, theme);
    }
    // A real lesson at level 2: the first ten screens, each one checked.
    await go('#/lesson/tokyo-hello-l1', 900);
    for (let k = 1; k <= 10; k++) {
      await check(`lesson-${k}`, theme);
      await continueLesson();
      await page.waitForTimeout(350);
    }
  }
} finally {
  await browser.close();
  server.kill();
}

if (problems.length) {
  console.error(`✗ ${problems.length} phone-screen problem(s):\n${[...new Set(problems)].map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('✓ Every screen fits a 393×851 phone, text readable, no page errors');

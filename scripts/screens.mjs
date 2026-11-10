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

const PORT = Number(process.env.SCREENS_PORT) || 4190; // SCREENS_PORT lets several checks run side by side
const MIN_TEXT = 13; // px, any text you read
const MIN_RUBY = 12; // px, romaji above Japanese
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
        // A swipeable card that is not the one showing sits beside the track on purpose.
        const card = el.closest('.intro-card');
        if (card && Math.abs(card.getBoundingClientRect().left - card.parentElement.getBoundingClientRect().left) > 2) continue;
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

  // Each course: a learner part-way through section 1, so every screen has content.
  const COURSES = [
    { code: 'ja', stopAt: 'tokyo-shopping', lesson: 'tokyo-hello-l1', extra: [['#/practice/kana', 'practice-kana'], ['#/mission/cafe', 'mission'], ['#/mission/izakaya', 'mission-izakaya'], ['#/drill/kudasai', 'drill']] },
    { code: 'zh', stopAt: 'china-shopping', lesson: 'china-hello-l1', extra: [['#/practice/tones', 'practice-tones'], ['#/tones', 'tones'], ['#/mission/tea-house', 'mission'], ['#/mission/hot-pot', 'mission-hotpot'], ['#/drill/wo-yao', 'drill'], ['#/drill/zai-nali', 'drill-where']] },
    { code: 'fr', stopAt: 'france-shopping', lesson: 'france-hello-l1', extra: [['#/mission/cafe-terrace', 'mission'], ['#/drill/ou-est', 'drill']] },
    { code: 'es', stopAt: 'spain-shopping', lesson: 'spain-hello-l1', extra: [['#/mission/tapas-bar', 'mission'], ['#/drill/donde-esta', 'drill']] },
    { code: 'en', stopAt: 'uk-shopping', lesson: 'uk-hello-l1', extra: [['#/mission/cafe-london', 'mission'], ['#/drill/where-is', 'drill']] },
  ];
  const SCREENS = [
    ['#/learn', 'learn'], ['#/practice/today', 'practice'], ['#/practice/games', 'practice-games'], ['#/practice/library', 'practice-library'],
    ['#/practice/kanji', 'practice-kanji'], ['#/profile', 'profile'], ['#/collection/phrase', 'phrasebook'], ['#/collection/fact', 'facts'],
    ['#/quiz', 'facts-quiz'], ['#/signs', 'signs'], ['#/listen', 'listening'], ['#/courses', 'languages'],
  ];
  const LAB = ['intro', 'read', 'build', 'match', 'grammar', 'dialogue', 'kanji', 'listen', 'fast', 'speak', 'trace'];
  // Sizes are the same in both themes: dark only (the app's usual look) keeps the check quick.
  await page.emulateMedia({ colorScheme: 'dark' });
  // First launch: the language screen comes before anything else.
  await page.goto(`http://localhost:${PORT}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.splash[data-ready]');
  await page.waitForTimeout(500);
  await page.tap('.splash');
  await page.waitForTimeout(500);
  if (!(await page.$('.course-card'))) problems.push('first launch: the language screen is not shown');
  await check('first-launch', 'none');
  for (const course of COURSES) {
    await page.goto(`http://localhost:${PORT}/`);
    await page.evaluate((code) => { localStorage.clear(); localStorage.setItem('hajime.test-mode', '1'); localStorage.setItem('hajime.course', code); }, course.code);
    await page.reload();
    await page.waitForSelector('.splash[data-ready]');
    await page.waitForTimeout(500);
    await page.tap('.splash');
    await page.waitForTimeout(500);
    await page.evaluate(async (stopAt) => {
      const src = [...document.scripts].find((s) => s.type === 'module').src;
      const q = src.includes('?') ? src.slice(src.indexOf('?')) : '';
      const base = src.replace(/main\.js.*/, '');
      const { app } = await import(`${base}app.js${q}`);
      const { NODES } = await import(`${base}course.js${q}`);
      const now = Date.now();
      for (const n of NODES) {
        if (n.unit.id === stopAt) break;
        app.state.nodes[n.id] = { level: 1 };
        for (const id of n.items || []) app.state.items[id] = { box: 1, seen: 2, right: 2, wrong: id.length % 3 ? 0 : 1, last: now, due: now + 1e8, ...(id.length % 5 ? {} : { missed: now }) };
      }
      app.state.seen.fact = ['f1', 'f2', 'f3', 'f4', 'f5', '1', '2', '3', '4', '5'];
      app.save();
    }, course.stopAt);
    const theme = course.code;
    for (const [hash, name] of [...SCREENS, ...course.extra]) {
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
    await go(`#/lesson/${course.lesson}`, 900);
    for (let k = 1; k <= 10; k++) {
      await check(`lesson-${k}`, theme);
      await continueLesson();
      await page.waitForTimeout(350);
    }

    // ---- Usability ----
    const need = async (selector, what) => { if (!(await page.$(selector))) problems.push(`${course.code}: ${what} is missing`); };
    const press = async (selector) => { await page.click(selector); await page.waitForTimeout(350); };
    // Resume: leaving mid-lesson offers it on the Learn screen and when the lesson is opened again.
    await go('#/learn', 700);
    await need('.resume-card', 'the "continue where you left off" card');
    await check('learn-resume', theme);
    await go(`#/lesson/${course.lesson}`, 700);
    await need('#modal.open .sheet', 'the resume question');
    await check('resume-modal', theme);
    await press('#modal [data-i="0"]');
    await check('resume-continued', theme);
    await go('#/learn', 500);
    await go(`#/lesson/${course.lesson}`, 700);
    await press('#modal [data-i="1"]'); // Start again
    // "I mistyped": a typed answer marked wrong can be counted as right (twice at most).
    await go('#/lab/typed', 800);
    for (let round = 1; round <= 3; round++) {
      if (!(await page.$('.recall-input:not([disabled])'))) { problems.push(`${course.code}: typed task ${round} did not appear`); break; }
      await page.fill('.recall-input', 'qqqq');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      if (round === 1) await check('typed-wrong', theme);
      const shown = !!(await page.$('.mistyped'));
      if (shown !== (round <= 2)) problems.push(`${course.code}: "I mistyped" ${shown ? 'shown' : 'missing'} on try ${round}`);
      if (shown) {
        await press('.mistyped');
        if (!(await page.$('.lesson-foot.good'))) problems.push(`${course.code}: "I mistyped" did not turn the answer into a right one`);
        if (round === 1) await check('typed-mistyped', theme);
      }
      await continueLesson();
      await page.waitForTimeout(500);
    }
    // Hardest words (Library) and the practice session on them.
    await go('#/practice/library', 500);
    await need('.hardest-card', 'the hardest-words list');
    await go('#/practice/hardest-go', 800);
    await need('.lesson-body', 'the hardest-words practice session');
    // Search and the show-to-staff card in the phrasebook.
    await go('#/collection/phrase', 500);
    await page.fill('.search-input', 'qzxqzx');
    await page.waitForTimeout(150);
    await need('.search-none:not([hidden])', 'the "nothing matches" line');
    await check('phrasebook-search-none', theme);
    await page.fill('.search-input', '');
    await page.dispatchEvent('.search-input', 'input');
    await press('.show-btn');
    await need('.show-card', 'the show card');
    await check('show-card', theme);
    await page.click('.show-card');
    await page.waitForTimeout(200);
    // The first-run cards, from Profile.
    await go('#/profile', 500);
    await press('.how-it-works');
    await need('.intro-card', 'the first-run cards');
    await check('intro-1', theme);
    for (let k = 2; k <= 4; k++) { await press('.intro-next'); await check(`intro-${k}`, theme); }
    await press('.intro-next');
  }

  // Large text: the same learner, a few screens, nothing may overflow.
  for (const course of COURSES.filter((c) => ['ja', 'fr', 'en'].includes(c.code))) {
    await page.goto(`http://localhost:${PORT}/`);
    await page.evaluate((code) => { localStorage.setItem('hajime.course', code); localStorage.setItem('hajime.test-mode', '1'); }, course.code);
    await page.reload();
    await page.waitForSelector('.splash[data-ready]');
    await page.waitForTimeout(500);
    await page.tap('.splash');
    await page.waitForTimeout(500);
    await page.evaluate(async (stopAt) => {
      const src = [...document.scripts].find((s) => s.type === 'module').src;
      const q = src.includes('?') ? src.slice(src.indexOf('?')) : '';
      const base = src.replace(/main\.js.*/, '');
      const { app } = await import(`${base}app.js${q}`);
      const { NODES } = await import(`${base}course.js${q}`);
      const now = Date.now();
      for (const n of NODES) {
        if (n.unit.id === stopAt) break;
        app.state.nodes[n.id] = { level: 1 };
        for (const id of n.items || []) app.state.items[id] = { box: 1, seen: 2, right: 2, wrong: id.length % 3 ? 0 : 1, last: now, due: now + 1e8, ...(id.length % 5 ? {} : { missed: now }) };
      }
      app.state.settings.textSize = 'large';
      app.save();
    }, course.stopAt);
    for (const [hash, name] of [['#/learn', 'learn'], ['#/practice/library', 'practice-library'], ['#/profile', 'profile'], ['#/collection/phrase', 'phrasebook'], ['#/courses', 'languages']]) {
      await go(hash);
      await check(`large-${name}`, course.code);
    }
    await go(`#/lesson/${course.lesson}`, 900);
    for (let k = 1; k <= 4; k++) {
      await check(`large-lesson-${k}`, course.code);
      await continueLesson();
      await page.waitForTimeout(350);
    }
    const root = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
    if (root !== '18.4px') problems.push(`${course.code}: Large text should make the root font 18.4px, it is ${root}`);
  }

  // A tablet: the layout centres at a maximum width instead of stretching.
  await page.setViewportSize({ width: 820, height: 1180 });
  for (const [hash, name] of [['#/learn', 'learn'], ['#/practice/library', 'practice-library'], ['#/collection/phrase', 'phrasebook']]) {
    await go(hash);
    await check(`tablet-${name}`, 'tablet');
    const wide = await page.evaluate(() => Math.round((document.querySelector('.page')?.getBoundingClientRect().width) || 0));
    if (wide > 640) problems.push(`tablet ${name}: the page is ${wide}px wide, it should stop at a maximum width`);
  }
  await page.setViewportSize({ width: 393, height: 851 });
} finally {
  await browser.close();
  server.kill();
}

if (problems.length) {
  console.error(`✗ ${problems.length} phone-screen problem(s):\n${[...new Set(problems)].map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('✓ Every screen of every course fits a 393×851 phone, text readable, no page errors');

// Start-up cost guards: a course only loads its own content, the build lists what each course needs
// offline, and the pieces that keep the first paint fast stay in place.
globalThis.__HAJIME_COURSE__ = 'fr';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const app = (f) => readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8');

test('pack.js loads only the active course (no static import of any course pack)', async () => {
  const src = app('js/content/pack.js');
  assert.ok(!/^\s*import[^;]*from\s*['"]\.\/(ja|zh|fr|es|en)(\/index)?\.js['"]/m.test(src), 'a course pack is imported statically');
  assert.ok(!/import\s+['"]\.\/(zh|fr|es|en)\//.test(src));
  // One literal import() per course, so the build can stamp each with ?v=…
  for (const spec of ['./ja.js', './zh/index.js', './fr/index.js', './es/index.js', './en/index.js']) {
    assert.ok(src.includes(`import('${spec}')`), `${spec} is not loaded through a literal import()`);
  }
  assert.ok(/await\s+LOADERS\[LANG\]\(\)/.test(src), 'only the active pack should be awaited');
  const pack = await import('../app/js/content/pack.js');
  assert.deepEqual(pack.AVAILABLE, ['ja', 'zh', 'fr', 'es', 'en']);
  assert.ok(Array.isArray(pack.SECTIONS_DATA) && pack.SECTIONS_DATA.length > 0);
  assert.ok(Array.isArray(pack.CONJUGATIONS) && Array.isArray(pack.PRONUNCIATION));
  assert.equal(pack.KANA ? Object.keys(pack.KANA).length : 0, 0, 'the French pack has no kana');
});

test('the start screen does not pull in the version list, and the release number agrees with it', async () => {
  for (const f of ['js/fx.js', 'js/update.js', 'js/main.js', 'js/version.js']) {
    assert.ok(!/(from\s*|import\s*\(?\s*)['"][^'"]*changelog\.js/.test(app(f)), `${f} imports the changelog`);
  }
  const { APP_RELEASE, APP_RELEASE_DATE } = await import('../app/js/version.js');
  const { CHANGELOG } = await import('../app/js/content/changelog.js');
  assert.equal(CHANGELOG[0].version, APP_RELEASE, 'version.js and CHANGELOG[0] name different releases');
  const [, month, year] = /^\d+ (\w+) \d\d(\d\d)$/.exec(CHANGELOG[0].date);
  assert.equal(APP_RELEASE_DATE, `${month} ${year}`);
});

test('the road-works sign is in the course language, with that course\'s font', async () => {
  const { ROADBLOCK } = await import('../app/js/scenery.js');
  const { COURSES } = await import('../app/js/lang.js');
  for (const [code, word] of [['ja', '工事中'], ['zh', '施工中'], ['fr', 'Travaux'], ['es', 'Obras'], ['en', 'Roadworks']]) assert.equal(COURSES[code].roadworks, word);
  assert.ok(ROADBLOCK.includes('Travaux') && !ROADBLOCK.includes('工事中') && !ROADBLOCK.includes('M PLUS'));
});

test('index.html: splash markup in the page, fonts do not block rendering', () => {
  const html = app('index.html');
  assert.ok(html.includes('<!--SPLASH-->'), 'the build injects the splash here');
  const sheet = html.match(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/g) || [];
  assert.ok(sheet.some((l) => /media="print"/.test(l) && /onload="this\.media='all'"/.test(l)), 'Google Fonts stylesheet must load asynchronously');
  assert.ok(/<noscript>\s*<link[^>]*fonts\.googleapis\.com/.test(html), 'needs a <noscript> fallback');
});

test('build output: shared + per-course precache lists, hashes, versioned dynamic imports', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hajime-build-'));
  try {
    execFileSync(process.execPath, [new URL('../scripts/build.mjs', import.meta.url).pathname], { env: { ...process.env, BUILD_OUT: dir, APP_VERSION: 'perftest' }, stdio: 'pipe' });
    const m = JSON.parse(readFileSync(join(dir, 'files.json'), 'utf8'));
    assert.equal(m.version, 'perftest');
    const courses = ['ja', 'zh', 'fr', 'es', 'en'];
    assert.deepEqual(Object.keys(m.courses), courses);
    const all = [...m.shared, ...courses.flatMap((c) => m.courses[c])];
    for (const u of all) if (u !== './') assert.ok(existsSync(join(dir, u.split('?')[0])), `${u} is listed but missing`);
    // Nothing is precached that the app does not need to open offline.
    for (const bad of ['icons/share.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png']) assert.ok(!all.includes(bad), `${bad} should not be precached`);
    // Every course's own pack is in its list and in nobody else's, and never in the shared list.
    const packOf = (c) => (c === 'ja' ? 'js/content/ja.js' : `js/content/${c}/index.js`);
    for (const c of courses) {
      const mine = m.courses[c].map((u) => u.split('?')[0]);
      if (c !== 'ja') assert.ok(mine.includes(packOf(c)), `${c} list lacks its pack`);
      for (const other of courses.filter((x) => x !== c && x !== 'ja')) {
        assert.ok(!mine.some((u) => u.startsWith(`js/content/${other}/`)), `${c}'s list holds ${other} content`);
      }
    }
    assert.ok(!m.shared.some((u) => /^js\/content\/(zh|fr|es|en)\//.test(u)), 'shared list holds course content');
    const sizeOf = (list) => list.reduce((n, u) => n + (u === './' ? 0 : readFileSync(join(dir, u.split('?')[0])).length), 0);
    const total = sizeOf(all) + 0;
    for (const c of courses) assert.ok(sizeOf(m.shared) + sizeOf(m.courses[c]) < total * 0.75, `${c}'s offline set should be well under everything`);
    // Hashes let an update copy unchanged files.
    for (const path of Object.keys(m.files)) assert.ok(/^[0-9a-f]{12}$/.test(m.files[path]), path);
    assert.ok(m.files['js/content/pack.js'] && m.files['css/app.css']);
    // The five lazy pack imports carry the version stamp; the worker has no placeholders left.
    const pack = readFileSync(join(dir, 'js/content/pack.js'), 'utf8');
    assert.equal((pack.match(/import\('\.\/[^']*\.js\?v=perftest'\)/g) || []).length, 5);
    const sw = readFileSync(join(dir, 'sw.js'), 'utf8');
    assert.ok(!/__[A-Z_]+__/.test(sw) && sw.includes("'perftest'"));
    // The splash is in the page itself.
    const index = readFileSync(join(dir, 'index.html'), 'utf8');
    assert.ok(index.includes('class="splash"') && index.includes('splash-go') && index.includes('class="mascot'));
    assert.ok(!index.includes('<!--SPLASH-->'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

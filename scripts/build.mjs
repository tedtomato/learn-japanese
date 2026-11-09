// Copies app/ to dist/ and stamps the version + offline file list into the service worker.
// No dependencies: runs with plain Node, locally and on GitHub Actions.
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep, dirname, posix } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mascotSvg } from '../app/js/mascot.js';
import { APP_RELEASE, APP_RELEASE_DATE } from '../app/js/version.js';
import { COURSE_CODES, EXTRA_EMOJIS, courseEmojis, artFile } from './course-art.mjs';

const root = new URL('..', import.meta.url).pathname;
const src = join(root, 'app');
const out = join(root, 'dist');

function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'dev';
  }
}

const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, (c) => (c === 'T' ? '.' : ''));
const version = process.env.APP_VERSION || `${stamp}-${commit()}`;

rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true });

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name !== 'sw.js' && !name.startsWith('.')) files.push(relative(out, path).split(sep).join('/'));
  }
})(out);
files.sort();

const replace = (file, pairs) => {
  const path = join(out, file);
  let text = readFileSync(path, 'utf8');
  for (const [from, to] of pairs) {
    if (!text.includes(from)) throw new Error(`${from} not found in ${file}`);
    text = text.replaceAll(from, to);
  }
  writeFileSync(path, text);
};

replace('js/version.js', [['__APP_VERSION__', version]]);

// ---- What each course needs offline -------------------------------------------------------------------------
// Follow the imports from main.js the way the browser will: pack.js picks one course pack at run time, so a
// course's graph only includes its own pack. Everything every course loads is "shared"; the rest is per course.
const sources = new Map(files.filter((f) => f.endsWith('.js')).map((f) => [f, readFileSync(join(out, f), 'utf8')]));
const STATIC_IMPORT = /(?:\bfrom\s*|^\s*import\s*)(['"])(\.{1,2}\/[^'"?]+\.js)\1/gm;
const DYNAMIC_IMPORT = /\bimport\s*\(\s*(['"])(\.{1,2}\/[^'"?]+\.js)\1/g;
const packEntry = (code) => (code === 'ja' ? 'js/content/ja.js' : `js/content/${code}/index.js`);
const PACK_ENTRIES = new Set(COURSE_CODES.map(packEntry));
function reachable(code) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file) || !sources.has(file)) return;
    seen.add(file);
    const text = sources.get(file);
    const resolve = (spec) => posix.normalize(posix.join(dirname(file), spec));
    for (const m of text.matchAll(STATIC_IMPORT)) visit(resolve(m[2]));
    for (const m of text.matchAll(DYNAMIC_IMPORT)) {
      const target = resolve(m[2]);
      // pack.js loads exactly one course pack; every other lazy import is followed for every course.
      if (file === 'js/content/pack.js' && PACK_ENTRIES.has(target)) {
        if (target === packEntry(code)) visit(target);
      } else visit(target);
    }
  };
  visit('js/main.js');
  return seen;
}
const graphs = Object.fromEntries(COURSE_CODES.map((c) => [c, reachable(c)]));
const everyCourse = (f) => COURSE_CODES.every((c) => graphs[c].has(f));
const anyCourse = (f) => COURSE_CODES.some((c) => graphs[c].has(f));

// Pictures: shared if every course shows them (or the app shows them whatever the course); unused ones are not
// precached at all (they are still served on demand).
const courseArt = Object.fromEntries(COURSE_CODES.map((c) => [c, new Set(courseEmojis(c).map(artFile))]));
const extraArt = new Set(EXTRA_EMOJIS.map(artFile));
const artFiles = files.filter((f) => f.startsWith('art/'));
const artShared = (f) => extraArt.has(f) || COURSE_CODES.every((c) => courseArt[c].has(f));
const artUsed = (f) => artShared(f) || COURSE_CODES.some((c) => courseArt[c].has(f));

// Not needed to open the app offline: the link-preview image and the big install icons.
const NOT_PRECACHED = new Set(['icons/share.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png']);
const kind = (f) => {
  if (NOT_PRECACHED.has(f)) return 'none';
  if (f.endsWith('.js')) return !anyCourse(f) || everyCourse(f) ? 'shared' : 'course';
  if (f.startsWith('art/')) return artShared(f) ? 'shared' : artUsed(f) ? 'course' : 'none';
  return 'shared';
};

// ---- Hashes, so an update can copy unchanged files from the previous cache ------------------------------------
// Scripts are hashed as written in app/ (before the ?v= stamps are added): the service worker re-stamps a copy.
const hashOf = (text) => createHash('sha1').update(text).digest('hex').slice(0, 12);
const hashes = {};
for (const f of files) {
  if (f === 'index.html' || f.endsWith('.js')) continue;
  hashes[f] = hashOf(readFileSync(join(out, f)));
}
for (const f of files.filter((x) => x.endsWith('.js'))) hashes[f] = hashOf(sources.get(f));

// Give every script and stylesheet a versioned address (main.js?v=…) so a new release never
// picks up old copies from a browser or CDN cache. The service worker caches these exact URLs.
const v = encodeURIComponent(version);
const versioned = (url) => `${url}?v=${v}`;
for (const file of files.filter((f) => f.endsWith('.js'))) {
  const path = join(out, file);
  const text = readFileSync(path, 'utf8').replace(
    /(\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)(['"])(\.{1,2}\/[^'"?]+\.js)\2/gm,
    (_, lead, q, url) => `${lead}${q}${versioned(url)}${q}`,
  );
  writeFileSync(path, text);
}
// The start screen is part of the page, so the first paint is meaningful before any script has run
// (js/fx.js splash() adopts it). Same markup as fx.js builds when it has to create the splash itself.
const splashHtml = `<div class="splash"><div class="splash-inner">${mascotSvg('cheer', 150)}<h1>Hajime</h1><p>Learn languages, one day at a time</p>
    <div class="splash-flags" style="min-height:25px"></div><button class="btn btn-white splash-go">Tap to start</button></div>
  <div class="splash-credits"><span class="beta">Beta version - ${APP_RELEASE_DATE} · v${APP_RELEASE}</span>
    <span class="made">Created by Seb and Claude AI</span></div></div>`;
replace('index.html', [['href="css/app.css"', `href="${versioned('css/app.css')}"`], ['src="js/main.js"', `src="${versioned('js/main.js')}"`], ['<!--SPLASH-->', splashHtml]]);

// Precache lists: what every course needs, and what each course adds. The page tells the service worker which
// course is active; files of the other courses are fetched when first needed. files.json carries the lists
// and the hashes (the worker fetches it while installing, and keeps a copy in the cache for the next update).
const url = (f) => (/\.(js|css)$/.test(f) ? versioned(f) : f);
const allFiles = [...files, 'files.json'].filter((f, i, a) => a.indexOf(f) === i);
const shared = ['./', ...allFiles.filter((f) => kind(f) === 'shared').map(url)];
const perCourse = Object.fromEntries(COURSE_CODES.map((c) => [c, files.filter((f) => kind(f) === 'course' && (graphs[c].has(f) || courseArt[c].has(f))).map(url)]));
const manifest = { version, v, shared, courses: perCourse, files: hashes };
writeFileSync(join(out, 'files.json'), JSON.stringify(manifest) + '\n');
replace('sw.js', [['__APP_VERSION__', version]]);
writeFileSync(join(out, 'version.json'), JSON.stringify({ version }) + '\n');

const kb = (list) => Math.round(list.reduce((n, u) => n + (u === './' ? 0 : statSync(join(out, u.split('?')[0])).size), 0) / 1024);
console.log(`Built ${files.length} files into dist/ — version ${version}`);
console.log(`Offline cache: shared ${shared.length} files (${kb(shared)} KB) + per course ${COURSE_CODES.map((c) => `${c} ${perCourse[c].length} (${kb(perCourse[c])} KB)`).join(', ')}`);

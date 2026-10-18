// Copies app/ to dist/ and stamps the version + offline file list into the service worker.
// No dependencies: runs with plain Node, locally and on GitHub Actions.
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { execSync } from 'node:child_process';

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
replace('index.html', [['href="css/app.css"', `href="${versioned('css/app.css')}"`], ['src="js/main.js"', `src="${versioned('js/main.js')}"`]]);
const precache = ['./', ...files.map((f) => (/\.(js|css)$/.test(f) ? versioned(f) : f))];
replace('sw.js', [['__APP_VERSION__', version], ['__PRECACHE_FILES__', JSON.stringify(precache, null, 2)]]);
writeFileSync(join(out, 'version.json'), JSON.stringify({ version }) + '\n');

console.log(`Built ${files.length} files into dist/ — version ${version}`);

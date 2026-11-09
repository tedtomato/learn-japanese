// Service worker: keeps the app working offline and installs new versions in the background.
// The build stamps VERSION; files.json (written by the build) lists what to cache: the files every course
// needs, plus one list per course. The page tells the worker which course is active (postMessage); the other
// courses' files are fetched, then kept, the first time they are needed.
const VERSION = '__APP_VERSION__';
const CACHE = `hajime-${VERSION}`;
const FONT_CACHE = 'hajime-fonts';
const NOTE_CACHE = 'course-note'; // not "hajime-…": survives every cleanup
const COURSE_NOTE = './__course.json';
const reload = (f) => new Request(f, { cache: 'reload' });

let manifestPromise = null;
// files.json of this version, straight from the network (a different version means the site is mid-publish).
function manifest() {
  manifestPromise ||= fetch(reload('./files.json')).then(async (res) => {
    if (!res.ok) throw new Error(`files.json ${res.status}`);
    const m = await res.json();
    if (m.version !== VERSION) throw new Error('files.json is from another version');
    return m;
  }).catch((err) => { manifestPromise = null; throw err; });
  return manifestPromise;
}

async function savedCourse() {
  try {
    const res = await (await caches.open(NOTE_CACHE)).match(COURSE_NOTE);
    return res ? (await res.json()).course : null;
  } catch { return null; }
}
async function saveCourse(course) {
  const cache = await caches.open(NOTE_CACHE);
  await cache.put(COURSE_NOTE, new Response(JSON.stringify({ course }), { headers: { 'Content-Type': 'application/json' } }));
}

// The install waits briefly for the page to say which course it is showing (first ever install).
let courseWaiters = [];
const courseFromPage = (ms) => new Promise((resolve) => {
  courseWaiters.push(resolve);
  setTimeout(() => resolve(null), ms);
});

// Files the previous version cached that this version has byte-identical (same hash) are copied, not downloaded.
// Scripts carry the version in their import addresses (?v=…), so a copy gets the new stamp.
async function previousCache() {
  for (const key of (await caches.keys()).sort().reverse()) {
    if (!key.startsWith('hajime-') || key === CACHE || key === FONT_CACHE) continue;
    const cache = await caches.open(key);
    const res = await cache.match('./files.json');
    if (res) return { cache, manifest: await res.json() };
  }
  return null;
}

async function fill(cache, urls, m, previous) {
  const missing = [];
  for (const url of urls) if (!(await cache.match(url))) missing.push(url);
  const fresh = [];
  for (const url of missing) {
    const path = url.split('?')[0];
    const same = previous && m.files[path] && previous.manifest.files?.[path] === m.files[path];
    const old = same ? await previous.cache.match(path, { ignoreSearch: true }) : null;
    if (!old) { fresh.push(url); continue; }
    if (path.endsWith('.js') && previous.manifest.v) {
      const text = (await old.text()).replaceAll(`?v=${previous.manifest.v}`, `?v=${m.v}`);
      await cache.put(url, new Response(text, { headers: { 'Content-Type': old.headers.get('Content-Type') || 'text/javascript' } }));
    } else await cache.put(url, old);
  }
  // addAll is all-or-nothing per call, and what is already stored is kept: an install that failed half-way resumes.
  await cache.addAll(fresh.map(reload));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const m = await manifest();
    const cache = await caches.open(CACHE);
    const previous = await previousCache();
    const course = (await savedCourse()) || (await courseFromPage(4000));
    await fill(cache, [...m.shared, ...(m.courses[course] || [])], m, previous);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('hajime-') && k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// { course } from the page (on every start and when the course changes): remember it and cache that course's files.
async function useCourse(course) {
  await saveCourse(course);
  const m = await manifest();
  if (!m.courses[course]) return;
  await fill(await caches.open(CACHE), m.courses[course], m, null);
}

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  const course = event.data?.course;
  if (typeof course !== 'string') return;
  courseWaiters.splice(0).forEach((resolve) => resolve(course));
  event.waitUntil(useCourse(course).catch(() => {}));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((res) => {
          if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
          return res;
        }).catch(() => cached || Response.error());
        return cached || network;
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin || url.pathname.endsWith('/version.json')) return;
  if (request.cache === 'reload' || request.cache === 'no-store') return; // explicit fresh downloads
  if (request.mode === 'navigate') {
    event.respondWith(caches.match('./index.html', { cacheName: CACHE }).then((res) => res || fetch(request)));
    return;
  }
  event.respondWith(caches.match(request, { cacheName: CACHE, ignoreSearch: true }).then((res) => res || fetchAndKeep(request)));
});

// A file that was not precached (another course's content, a picture): from the network, then kept for offline.
async function fetchAndKeep(request) {
  const res = await fetch(request);
  if (res.ok && res.type === 'basic' && !new URL(request.url).pathname.endsWith('/sw.js')) {
    const copy = res.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
  }
  return res;
}

// ---- Daily reminder ----
// The phone wakes the worker about once a day (periodic background sync, Android Chrome with the app on
// the home screen). If reminders are on and the learner has not studied today, show a nudge — not at night.
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

async function remind() {
  const res = await caches.open('reminder-note').then((c) => c.match('./__reminder.json'));
  if (!res) return;
  const note = await res.json();
  const now = new Date();
  if (!note.on || note.lastDay === dayKey(now) || now.getHours() < 9 || now.getHours() >= 22) return;
  const name = note.name || 'your language';
  const body = note.streak > 0
    ? `Keep your ${note.streak}-day streak going 🔥${note.due ? ` — ${note.due} words to review` : ''}`
    : note.due ? `${note.due} words are ready to review. Two minutes is enough!` : `A quick lesson keeps your ${name} fresh.`;
  try {
    await self.registration.showNotification(note.name ? `Time for ${note.name}! ${note.say || ''}`.trim() : 'Time to practise!', {
      body, icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'daily-reminder', renotify: false,
    });
  } catch { /* notifications blocked since */ }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') event.waitUntil(remind());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => 'focus' in c);
    return open ? open.focus() : self.clients.openWindow('./');
  }));
});

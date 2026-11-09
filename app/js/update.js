// Keeps the installed app up to date. On open, and whenever the app comes back to the foreground,
// it asks GitHub Pages for version.json (bypassing every cache). If a newer version is published,
// the service worker downloads it and the app reloads into it — straight away if the app was just
// opened, otherwise via an "Update" button (never mid-lesson). A slow download is simply waited for. If the
// download fails the old version keeps running (offline copy included) and the next time the app comes to
// the foreground it tries again; only after repeated failures does the app say so and offer the last resort:
// clearing its cached files and reloading. Progress lives in localStorage, which none of this touches.
import { app, toast } from './app.js';
import { VERSION } from './version.js';
import { LANG } from './lang.js';

// Lessons and other screens that run a session (missions, drills, quiz…) must never be reloaded under the learner.
const busy = () => app.inLesson || app.busy;

let registration = null;
let openedAt = Date.now();
let checking = null;
const FRESH_MS = 15000;
// How long an automatic update waits for the download before leaving it to finish in the background.
const INSTALL_WAIT_MS = 20000;
const FAILS_BEFORE_TOAST = 3;
const isDev = VERSION.startsWith('__');

export async function latestVersion() {
  const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`version.json ${res.status}`);
  return (await res.json()).version;
}

let latestSeen = null;
const GUARD_KEY = 'hajime.hardRefresh';
const GUARD_MS = 10 * 60 * 1000;

function apply(worker) {
  if (worker) return worker.postMessage('skipWaiting');
  // Only force a fresh load once per new version every 10 minutes, so a CDN that is still serving
  // the old files cannot trap the app in a reload loop.
  let last = null;
  try {
    last = JSON.parse(localStorage.getItem(GUARD_KEY) || 'null');
  } catch {
    /* ignore */
  }
  if (last && last.version === latestSeen && Date.now() - last.at < GUARD_MS) {
    toast('The new version is still being published. Try again in a few minutes.');
    return;
  }
  try {
    localStorage.setItem(GUARD_KEY, JSON.stringify({ version: latestSeen, at: Date.now() }));
  } catch {
    /* ignore */
  }
  hardRefresh();
}

function offer(worker, { force = false } = {}) {
  if (force || (!busy() && Date.now() - openedAt < FRESH_MS)) return apply(worker);
  toast('A new version of Hajime is ready.', { action: 'Update', onAction: () => apply(worker), ms: 0 });
}

// Re-downloads the few unversioned files (page, worker, manifests) so the browser's own HTTP cache (GitHub
// Pages allows 10 minutes) cannot hand back old copies after the reload. Scripts and styles are addressed
// by version (?v=…), so the new page asks for new addresses anyway.
async function refreshHttpCache() {
  await Promise.all(['./', 'index.html', 'sw.js', 'files.json'].map((f) => fetch(f, { cache: 'reload' }).catch(() => {})));
}

// Last resort: drop the cached app files and the service worker, then load fresh from GitHub.
// Order matters: the old service worker must lose its cached files before we re-download,
// otherwise it would answer those downloads with the very copies we are replacing.
export async function hardRefresh() {
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('hajime-') && k !== 'hajime-fonts').map((k) => caches.delete(k)));
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {
    /* carry on */
  }
  try {
    await refreshHttpCache();
  } catch {
    /* offline: reload whatever we have */
  }
  location.reload();
}

// How the new version's download ended: { worker } when it is ready, { failed: true } when the install failed
// (the worker became redundant) or no new worker showed up at all. Never resolves while it is still downloading.
function installOutcome(reg) {
  if (reg.waiting) return Promise.resolve({ worker: reg.waiting });
  return new Promise((resolve) => {
    let tracked = null;
    const track = (worker) => {
      if (!worker || worker === tracked) return;
      tracked = worker;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') resolve({ worker });
        if (worker.state === 'redundant') resolve({ failed: true });
      });
      tellCourse(worker);
    };
    if (reg.installing) track(reg.installing);
    else resolve({ failed: true }); // update() found no new worker: the site is still serving the old files
    reg.addEventListener('updatefound', () => track(reg.installing), { once: true });
  });
}

// Failed downloads of this version in a row, kept across restarts so "try again later" really adds up.
const FAIL_KEY = 'hajime.updateFails';
function noteFailure(version) {
  let n = 1;
  try {
    const last = JSON.parse(localStorage.getItem(FAIL_KEY) || 'null');
    if (last?.version === version) n = last.n + 1;
    localStorage.setItem(FAIL_KEY, JSON.stringify({ version, n }));
  } catch {
    /* ignore */
  }
  return n;
}
function clearFailures() {
  try {
    localStorage.removeItem(FAIL_KEY);
  } catch {
    /* ignore */
  }
}

// The download ended: install it (or offer to), or keep running the old version and try again later.
function settle(outcome, { force }) {
  if (outcome.worker) {
    clearFailures();
    offer(outcome.worker, { force: force && !busy() });
    return;
  }
  const n = noteFailure(latestSeen);
  if (n >= FAILS_BEFORE_TOAST && !busy()) {
    toast('The new version could not be downloaded. Hajime keeps working as it is.', { action: 'Update anyway', onAction: () => apply(null), ms: 0 });
  }
}

// Returns 'latest' | 'updating' | 'offline'.
async function check({ manual = false } = {}) {
  if (isDev) return 'latest';
  let latest;
  try {
    latest = await latestVersion();
  } catch {
    return 'offline';
  }
  if (latest === VERSION) {
    clearFailures();
    return 'latest';
  }
  latestSeen = latest;
  // Decide now whether to update without asking: downloading can outlast the "just opened" window.
  const force = manual || (!busy() && Date.now() - openedAt < FRESH_MS);
  if (!registration) {
    offer(null, { force });
    return 'updating';
  }
  if (manual) toast('Downloading the new version…', { ms: 0 });
  try {
    await registration.update();
  } catch {
    /* offline or the file is not published yet: the outcome below says so */
  }
  const outcome = installOutcome(registration);
  const first = await Promise.race([outcome, new Promise((r) => setTimeout(r, INSTALL_WAIT_MS, null))]);
  if (first) settle(first, { force });
  else {
    // A slow connection: leave the download to finish in the background and offer the update when it does.
    if (manual) toast('Still downloading… the update will be offered when it is ready.', { ms: 6000 });
    outcome.then((late) => settle(late, { force: false }));
  }
  return 'updating';
}

function checkOnce(opts) {
  checking ||= check(opts).finally(() => (checking = null));
  return checking;
}

// Lets a service worker know the active course (the worker caches that course's content for offline use).
function tellCourse(worker) {
  try {
    worker?.postMessage({ course: LANG });
  } catch {
    /* the worker is going away */
  }
}

export function initUpdates() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((reg) => {
    registration = reg;
    // Tell the worker which course is showing, so it keeps that course's files for offline use.
    [reg.installing, reg.waiting, reg.active].forEach(tellCourse);
    reg.addEventListener('updatefound', () => tellCourse(reg.installing));
    // A new version may have finished downloading during the last visit.
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    checkOnce();
  }).catch(() => checkOnce());

  // Reload when a new version takes over — but not on the very first visit, when the service
  // worker simply starts controlling a page that is already up to date.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !hadController) return;
    reloading = true;
    location.reload();
  });
  // Installed apps are usually resumed rather than reopened, so check whenever the app comes back.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    openedAt = Date.now();
    checkOnce();
  });
  setInterval(() => checkOnce(), 30 * 60 * 1000);
}

export async function checkForUpdate() {
  toast('Checking for updates…', { ms: 0 });
  const result = await checkOnce({ manual: true });
  if (result === 'latest') toast('You have the latest version ✅');
  else if (result === 'offline') toast('Could not reach GitHub. Are you offline?');
}

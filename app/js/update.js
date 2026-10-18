// Keeps the installed app up to date. On open, and whenever the app comes back to the foreground,
// it asks GitHub Pages for version.json (bypassing every cache). If a newer version is published,
// the service worker downloads it and the app reloads into it — straight away if the app was just
// opened, otherwise via an "Update" button (never mid-lesson). If the browser's own service worker
// update gets stuck (some phones hold on to old files), the app clears its cached files and reloads.
// Progress lives in localStorage, which none of this touches.
import { app, toast } from './app.js';
import { VERSION } from './version.js';

let registration = null;
let openedAt = Date.now();
let checking = null;
const FRESH_MS = 15000;
const INSTALL_TIMEOUT_MS = 20000;
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
  if (force || (!app.inLesson && Date.now() - openedAt < FRESH_MS)) return apply(worker);
  toast('A new version of Hajime is ready.', { action: 'Update', onAction: () => apply(worker), ms: 0 });
}

// Re-downloads every app file so the browser's own HTTP cache (GitHub Pages allows 10 minutes)
// cannot hand back old copies after the reload. The file list is read from the published sw.js.
async function refreshHttpCache() {
  const text = await (await fetch(`./sw.js?t=${Date.now()}`, { cache: 'no-store' })).text();
  const match = text.match(/const FILES = (\[[\s\S]*?\]);/);
  const files = match ? JSON.parse(match[1]) : ['./', 'index.html'];
  await Promise.all([...files, 'sw.js'].map((f) => fetch(f, { cache: 'reload' }).catch(() => {})));
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

// Resolves with the waiting worker once the new version is downloaded, or null if it never arrives.
function waitForWaiting(reg) {
  if (reg.waiting) return Promise.resolve(reg.waiting);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(reg.waiting || null), INSTALL_TIMEOUT_MS);
    const track = (worker) => worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed') { clearTimeout(timer); resolve(worker); }
      if (worker.state === 'redundant') { clearTimeout(timer); resolve(null); }
    });
    track(reg.installing);
    reg.addEventListener('updatefound', () => track(reg.installing), { once: true });
  });
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
  if (latest === VERSION) return 'latest';
  latestSeen = latest;
  // Decide now whether to update without asking: downloading can outlast the "just opened" window.
  const force = manual || (!app.inLesson && Date.now() - openedAt < FRESH_MS);
  if (!registration) {
    offer(null, { force });
    return 'updating';
  }
  if (manual) toast('Downloading the new version…', { ms: 0 });
  try {
    await registration.update();
  } catch {
    /* fall through to the wait / hard refresh */
  }
  const worker = await waitForWaiting(registration);
  offer(worker, { force: force && !app.inLesson });
  return 'updating';
}

function checkOnce(opts) {
  checking ||= check(opts).finally(() => (checking = null));
  return checking;
}

export function initUpdates() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((reg) => {
    registration = reg;
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

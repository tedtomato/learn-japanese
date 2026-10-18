// Keeps the installed app up to date: a new version published on GitHub is downloaded in the
// background, then applied straight away if the app was just opened, or offered with a button.
import { app, toast } from './app.js';

let registration = null;
let openedAt = Date.now();
const FRESH_MS = 15000;

function offer(worker) {
  const apply = () => worker.postMessage('skipWaiting');
  if (!app.inLesson && Date.now() - openedAt < FRESH_MS) return apply();
  toast('A new version of Hajime is ready.', { action: 'Update', onAction: apply, ms: 0 });
}

function watch(reg) {
  if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
  reg.addEventListener('updatefound', () => {
    const worker = reg.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) offer(worker);
    });
  });
}

export function initUpdates() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    registration = reg;
    watch(reg);
  }).catch(() => {});

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
  // Installed apps are often resumed rather than reopened, so check whenever the app comes back.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    openedAt = Date.now();
    registration?.update().catch(() => {});
  });
  setInterval(() => registration?.update().catch(() => {}), 30 * 60 * 1000);
}

export async function checkForUpdate() {
  if (!registration) return toast('Updates start working once the app is opened from its website.');
  toast('Checking for updates…', { ms: 0 });
  try {
    await registration.update();
  } catch {
    return toast('Could not reach GitHub. Are you offline?');
  }
  if (registration.waiting) toast('A new version is ready.', { action: 'Update', onAction: () => registration.waiting?.postMessage('skipWaiting'), ms: 0 });
  else if (registration.installing) toast('Downloading the new version…');
  else toast('You have the latest version ✅');
}

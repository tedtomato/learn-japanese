// Entry point: routing between screens and the bottom navigation.
import { app, applySettings } from './app.js';
import { html, mount, $ } from './dom.js';
import { icon } from './icons.js';
import { renderLearn } from './screens/learn.js';
import { renderPractice, renderCollection } from './screens/practice.js';
import { renderProfile } from './screens/profile.js';
import { renderLab } from './screens/lab.js';
import { startSession, lessonKey } from './lesson/player.js';
import { initUpdates } from './update.js';
import { splash } from './fx.js';
import { mascot } from './mascot.js';
import { showStreakCalendar } from './screens/streak.js';

const TABS = [
  ['learn', 'Learn', 'learn'],
  ['practice', 'Practice', 'practice'],
  ['profile', 'Profile', 'profile'],
];

let lastTab = null;
function renderNav(active) {
  const changed = active !== lastTab;
  lastTab = active;
  mount($('#nav'), html`${TABS.map(([id, label, ic]) => html`<a href="#/${id}" class="${active === id ? 'on' : ''} ${active === id && changed ? 'bounce' : ''}">${icon(ic, 26)}<span>${label}</span></a>`)}`);
}

// Phones only: progress lives on one device and cannot be shared yet, so computers and tablets
// get a friendly "open it on your phone" screen instead of the app.
function isPhone() {
  const ua = navigator.userAgent;
  const mobile = /Android|iPhone|iPod|Mobile/i.test(ua);
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const small = Math.min(screen.width, screen.height) <= 600;
  return mobile && touch && small;
}

function phoneOnly() {
  document.body.classList.add('desktop-gate');
  const url = location.href.split('#')[0].split('?')[0];
  mount($('#view'), html`<div class="gate">
    ${mascot('happy', 130)}
    <h1>Hajime is made for your phone</h1>
    <p>Lessons, listening and speaking are designed for a phone in your hand — and your progress is saved on one device, so it can't move between computer and phone yet.</p>
    <p>Open this address on your phone:</p>
    <p class="gate-url">${url.replace(/^https?:\/\//, '')}</p>
    <p class="muted small">Then add it to your home screen to install it.</p>
  </div>`);
}

function route() {
  const [, name = 'learn', arg] = location.hash.split('/');
  const view = $('#view');
  const root = document.createElement('div');
  root.className = 'screen';
  view.replaceChildren(root);
  $('#modal').classList.remove('open');
  app.inLesson = false;

  const inSession = name === 'lesson' || (name === 'practice' && arg === 'go') || (name === 'lab' && !!arg);
  document.body.classList.toggle('in-lesson', inSession);
  if (name === 'lesson') startSession(root, { nodeId: arg });
  else if (name === 'practice' && arg === 'go') startSession(root, {});
  else if (name === 'lab' && arg) startSession(root, { demo: arg });
  else if (name === 'lab') renderLab(root);
  else if (name === 'practice') renderPractice(root, arg);
  else if (name === 'collection') renderCollection(root, arg);
  else if (name === 'profile') renderProfile(root);
  else renderLearn(root);
  if (!inSession) {
    renderNav(name === 'collection' ? 'practice' : name === 'lab' ? 'profile' : TABS.some(([id]) => id === name) ? name : 'learn');
    window.scrollTo(0, 0);
  }
}

// The flame in the top bar opens the streak calendar on every screen.
document.addEventListener('click', (e) => {
  if (e.target.closest('.stat-streak')) showStreakCalendar();
});

document.addEventListener('keydown', (e) => {
  const root = $('#view .screen');
  if (root?.__session) lessonKey(root, e);
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applySettings);

applySettings();
if (isPhone()) {
  window.addEventListener('hashchange', route);
  splash();
  route();
} else phoneOnly();
initUpdates();

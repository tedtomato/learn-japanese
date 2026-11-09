// Entry point: routing between screens and the bottom navigation.
import { app, applySettings, closeLayer, toast } from './app.js';
import { html, mount, $, fitText } from './dom.js';
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
import { showHearts } from './screens/hearts.js';
import { renderCourses } from './screens/courses.js';
import { courseChosen, languagePicked } from './lang.js';
import { renderFactQuiz } from './screens/factquiz.js';
import { renderListen } from './screens/listen.js';
import { renderSigns } from './screens/signs.js';
import { renderMission } from './screens/mission.js';
import { renderDrill } from './screens/drill.js';
import { renderTones } from './screens/tones.js';
import { mistakeIds } from './progress.js';
import { t } from './strings.js';

const TABS = [
  ['learn', 'Learn', 'learn'],
  ['practice', 'Practice', 'practice'],
  ['profile', 'Profile', 'profile'],
];

// Screens that run an activity: the bottom bar stays, but an update never reloads the page mid-run.
const ACTIVITIES = ['mission', 'drill', 'signs', 'tones', 'quiz', 'listen'];

let lastTab = null;
function renderNav(active) {
  const changed = active !== lastTab;
  lastTab = active;
  mount($('#nav'), html`${TABS.map(([id, label, ic]) => html`<a href="#/${id}" ${active === id ? 'aria-current="page"' : ''} class="${active === id ? 'on' : ''} ${active === id && changed ? 'bounce' : ''}">${icon(ic, 26)}<span>${label}</span></a>`)}`);
}

// Phones only: progress lives on one device and cannot be shared yet, so computers and tablets
// get a friendly "open it on your phone" screen instead of the app.
// Computers and tablets are let through by "Continue anyway" (screen-reader and keyboard users are mostly there);
// the choice is remembered on this device.
const DESKTOP_OK = 'hajime.desktop-ok';
function desktopOk() {
  try {
    return localStorage.getItem(DESKTOP_OK) === '1';
  } catch {
    return false;
  }
}

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
    <button class="btn btn-secondary gate-go">Continue anyway</button>
    <p class="muted small">It works on a computer too — your progress just stays on this device.</p>
  </div>`);
  $('.gate-go').addEventListener('click', () => {
    try {
      localStorage.setItem(DESKTOP_OK, '1');
    } catch {
      /* ignore: the choice then lasts until the page is reloaded */
    }
    document.body.classList.remove('desktop-gate');
    // No start screen here: the tap just made is the one that unlocks sound. (index.html removes its static
    // start screen on non-phones, and splash() builds its own when it is asked for on a later visit.)
    start(false);
  });
  $('.gate-go').focus();
}

function route() {
  // Until a language is picked, the language screen comes first, whatever the address.
  const [, name = 'learn', arg] = courseChosen() ? location.hash.split('/') : ['', 'courses'];
  const view = $('#view');
  const root = document.createElement('div');
  root.className = 'screen';
  view.replaceChildren(root);
  closeLayer($('#modal'));
  app.inLesson = false;
  app.busy = ACTIVITIES.includes(name);

  const inSession = name === 'courses' || name === 'lesson' || (name === 'practice' && (arg === 'go' || arg === 'kanji-go' || arg === 'mistakes-go' || arg === 'hiragana-go' || arg === 'katakana-go')) || (name === 'lab' && !!arg);
  document.body.classList.toggle('in-lesson', inSession);
  if (name === 'courses') renderCourses(root);
  else if (name === 'lesson') startSession(root, { nodeId: arg });
  else if (name === 'practice' && arg === 'go') startSession(root, {});
  else if (name === 'practice' && arg === 'kanji-go') startSession(root, { kanjiOnly: true });
  else if (name === 'practice' && arg === 'mistakes-go') startSession(root, { itemIds: mistakeIds(app.state).slice(0, 8) });
  else if (name === 'practice' && /^(hiragana|katakana)-go$/.test(arg)) startSession(root, { kanaScript: arg.replace('-go', '') });
  else if (name === 'lab' && arg) startSession(root, { demo: arg });
  else if (name === 'lab') renderLab(root);
  else if (name === 'practice') renderPractice(root, arg);
  else if (name === 'collection') renderCollection(root, arg);
  else if (name === 'quiz') renderFactQuiz(root);
  else if (name === 'listen') renderListen(root);
  else if (name === 'signs') renderSigns(root);
  else if (name === 'mission') renderMission(root, arg);
  else if (name === 'drill') renderDrill(root, arg);
  else if (name === 'tones') renderTones(root);
  else if (name === 'profile') renderProfile(root, arg);
  else renderLearn(root);
  if (!inSession) {
    renderNav(name === 'collection' || ACTIVITIES.includes(name) ? 'practice' : name === 'lab' ? 'profile' : TABS.some(([id]) => id === name) ? name : 'learn');
    window.scrollTo(0, 0);
    // Focus moves to the new screen's heading, so a screen reader starts at the top of what changed.
    const head = $('h1', root) || root;
    head.setAttribute('tabindex', '-1');
    head.focus({ preventScroll: true });
  }
}

// The flame in the top bar opens the streak calendar on every screen.
document.addEventListener('click', (e) => {
  if (e.target.closest('.stat-streak')) showStreakCalendar();
  if (e.target.closest('.stat-flag') && !document.body.classList.contains('in-lesson')) app.go('#/courses');
  if (e.target.closest('.stat-hearts') && !document.body.classList.contains('in-lesson')) showHearts();
  if (e.target.closest('.stat-gems')) toast(t('You have {n} gems. Earn them from lessons, chests, missions and your daily goal.', { n: app.state.gems }));
});

document.addEventListener('keydown', (e) => {
  const root = $('#view .screen');
  if (root?.__session) lessonKey(root, e);
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applySettings);
// A rotation or a resized window gives words more (or less) room.
let resizing = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizing);
  resizing = setTimeout(() => fitText(document), 150);
});

function start(withSplash = true) {
  window.addEventListener('hashchange', route);
  // Each start of the app opens on the language menu (links into a lesson or screen go straight there).
  if (!languagePicked() && /^#?(\/learn)?$/.test(location.hash)) history.replaceState(null, '', '#/courses');
  if (withSplash) splash();
  route();
}

applySettings();
if (isPhone() || desktopOk()) start();
else phoneOnly();
initUpdates();

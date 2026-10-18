// Entry point: routing between screens and the bottom navigation.
import { app, applySettings } from './app.js';
import { html, mount, $ } from './dom.js';
import { icon } from './icons.js';
import { renderLearn } from './screens/learn.js';
import { renderPractice, renderCollection } from './screens/practice.js';
import { renderProfile } from './screens/profile.js';
import { startSession, lessonKey } from './lesson/player.js';
import { initUpdates } from './update.js';

const TABS = [
  ['learn', 'Learn', 'learn'],
  ['practice', 'Practice', 'practice'],
  ['profile', 'Profile', 'profile'],
];

function renderNav(active) {
  mount($('#nav'), html`${TABS.map(([id, label, ic]) => html`<a href="#/${id}" class="${active === id ? 'on' : ''}">${icon(ic, 26)}<span>${label}</span></a>`)}`);
}

function route() {
  const [, name = 'learn', arg] = location.hash.split('/');
  const view = $('#view');
  const root = document.createElement('div');
  root.className = 'screen';
  view.replaceChildren(root);
  $('#modal').classList.remove('open');
  app.inLesson = false;

  const inSession = name === 'lesson' || (name === 'practice' && arg === 'go');
  document.body.classList.toggle('in-lesson', inSession);
  if (name === 'lesson') startSession(root, { nodeId: arg });
  else if (name === 'practice' && arg === 'go') startSession(root, {});
  else if (name === 'practice') renderPractice(root);
  else if (name === 'collection') renderCollection(root, arg);
  else if (name === 'profile') renderProfile(root);
  else renderLearn(root);
  if (!inSession) {
    renderNav(name === 'collection' ? 'practice' : TABS.some(([id]) => id === name) ? name : 'learn');
    window.scrollTo(0, 0);
  }
}

document.addEventListener('keydown', (e) => {
  const root = $('#view .screen');
  if (root?.__session) lessonKey(root, e);
});
window.addEventListener('hashchange', route);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applySettings);

applySettings();
route();
initUpdates();

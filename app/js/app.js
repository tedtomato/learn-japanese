// Shared app context: progress state, saving, navigation, toasts and modals.
import { loadState, saveState, currentHearts, displayStreak, studiedToday, STORAGE_KEY, TEST_STORAGE_KEY } from './progress.js';
import { html, mount, $ } from './dom.js';
import { icon } from './icons.js';
import { setSfx, setVoiceRate, setVoiceChoice } from './audio.js';

const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();

// Test mode (hidden, from Profile) plays on a separate copy of the progress so the real one is
// never touched. The flag survives reloads until test mode is switched off.
const TEST_FLAG = 'hajime.test-mode';
const readFlag = () => {
  try {
    return storage?.getItem(TEST_FLAG) === '1';
  } catch {
    return false;
  }
};
const keyFor = (test) => (test ? TEST_STORAGE_KEY : STORAGE_KEY);

export const app = {
  testMode: readFlag(),
  state: loadState(storage, Date.now(), keyFor(readFlag())),
  now: () => Date.now(),
  save() {
    saveState(storage, app.state, keyFor(app.testMode));
    applySettings();
  },
  setTestMode(on) {
    app.save();
    app.testMode = on;
    try {
      if (on) storage?.setItem(TEST_FLAG, '1');
      else storage?.removeItem(TEST_FLAG);
    } catch {
      /* ignore */
    }
    app.state = loadState(storage, Date.now(), keyFor(on));
    applySettings();
  },
  replaceState(next) {
    app.state = next;
    app.save();
  },
  go(hash) {
    if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
  },
  inLesson: false,
};

export function applySettings() {
  const { theme, sfx, voiceRate, voices } = app.state.settings;
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.dataset.theme = theme;
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg || '#f7f9fa'));
  document.body.classList.toggle('test-mode', app.testMode);
  setSfx(sfx);
  setVoiceRate(voiceRate);
  setVoiceChoice(voices);
}

export function statsBar() {
  const { state } = app;
  const now = app.now();
  const streak = displayStreak(state, now);
  const hearts = currentHearts(state, now);
  return html`<div class="stats">
    <span class="stat stat-flag" title="Japanese"><svg width="34" height="24" viewBox="0 0 34 24" aria-hidden="true"><rect x="1" y="1" width="32" height="22" rx="5" fill="#fff" stroke="var(--border)" stroke-width="2"/><circle cx="17" cy="12" r="6" fill="#bc002d"/></svg></span>
    <span class="stat stat-streak ${studiedToday(state, now) ? 'on' : ''}" title="Day streak">${icon('flame', 22)}<b>${streak}</b></span>
    <span class="stat stat-gems" title="Gems">${icon('gem', 22)}<b>${state.gems}</b></span>
    <span class="stat stat-hearts" title="Hearts">${icon('heart', 22)}<b>${hearts}</b></span>
  </div>`;
}

let toastTimer;
export function toast(message, { action, onAction, ms = 3500 } = {}) {
  const el = $('#toast');
  mount(el, html`<span>${message}</span>${action ? html`<button class="toast-action">${action}</button>` : ''}`);
  el.classList.add('show');
  el.querySelector('.toast-action')?.addEventListener('click', () => {
    el.classList.remove('show');
    onAction?.();
  });
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// Shows a modal. buttons: [{ label, kind, onClick }]. Returns a close function.
export function modal(content, buttons = [], { dismissable = true } = {}) {
  const root = $('#modal');
  mount(root, html`<div class="scrim"></div>
    <div class="sheet" role="dialog" aria-modal="true">
      ${content}
      <div class="sheet-actions">${buttons.map((b, i) => html`<button class="btn btn-${b.kind || 'primary'} btn-block" data-i="${i}">${b.label}</button>`)}</div>
    </div>`);
  root.classList.add('open');
  const close = () => {
    root.classList.remove('open');
    root.innerHTML = '';
  };
  root.querySelectorAll('[data-i]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const b = buttons[Number(btn.dataset.i)];
      if (b.close !== false) close();
      b.onClick?.();
    }),
  );
  if (dismissable) root.querySelector('.scrim').addEventListener('click', close);
  return close;
}

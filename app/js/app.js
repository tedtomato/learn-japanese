// Shared app context: progress state, saving, navigation, toasts and modals.
import { loadState, saveState, currentHearts, displayStreak, studiedToday, courseSummary, STORAGE_KEY, TEST_STORAGE_KEY, SUMMARY_KEY } from './progress.js';
import { html, mount, raw, $ } from './dom.js';
import { L } from './lang.js';
import { icon } from './icons.js';
import { setSfx, setVoiceRate } from './audio.js';
import { writeReminderNote } from './reminders.js';

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

let saveWarned = false;
export const app = {
  testMode: readFlag(),
  state: loadState(storage, Date.now(), keyFor(readFlag())),
  now: () => Date.now(),
  save() {
    if (!saveState(storage, app.state, keyFor(app.testMode)) && !saveWarned) {
      saveWarned = true; // once, so a full phone does not nag on every answer
      toast('Could not save your progress — the phone may be full or in private mode. Save a backup from Profile.', { ms: 8000 });
    }
    applySettings();
    if (!app.testMode) {
      writeReminderNote(app.state, app.now());
      saveSummary();
    }
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
  busy: false, // on a screen that runs an activity (mission, drill, signs, tones, quiz, listening) — no update reloads
};

// The language screen reads each course's summary (see courseSummary).
export function saveSummary() {
  try {
    storage?.setItem(SUMMARY_KEY, JSON.stringify(courseSummary(app.state, app.now())));
  } catch {
    /* ignore */
  }
}

export function applySettings() {
  const { theme, sfx, voiceRate } = app.state.settings;
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.dataset.theme = theme;
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg || '#f7f9fa'));
  document.body.classList.toggle('test-mode', app.testMode);
  // Latin-alphabet courses show their words in the main font.
  document.body.classList.toggle('latin', !!L.latin);
  setSfx(sfx);
  setVoiceRate(voiceRate);
}

// Course flags, drawn small and rounded like the other top-bar items.
const STAR = 'M0,-1L0.224,-0.309L0.951,-0.309L0.363,0.118L0.588,0.809L0,0.382L-0.588,0.809L-0.363,0.118L-0.951,-0.309L-0.224,-0.309Z';
const FLAGS = {
  jp: () => '<rect x="1" y="1" width="32" height="22" fill="#fff"/><circle cx="17" cy="12" r="6" fill="#bc002d"/>',
  cn: () => `<rect x="1" y="1" width="32" height="22" fill="#de2910"/><path d="${STAR}" fill="#ffde00" transform="translate(8 8) scale(3.6)"/>`
    + [[14, 4, 20], [16.5, 7, 45], [16.5, 11, 0], [14, 14, 20]].map(([x, y, r]) => `<path d="${STAR}" fill="#ffde00" transform="translate(${x} ${y}) rotate(${r}) scale(1.2)"/>`).join(''),
  fr: () => '<rect x="1" y="1" width="11" height="22" fill="#0055a4"/><rect x="12" y="1" width="10" height="22" fill="#fff"/><rect x="22" y="1" width="11" height="22" fill="#ef4135"/>',
  es: () => '<rect x="1" y="1" width="32" height="22" fill="#c60b1e"/><rect x="1" y="6.5" width="32" height="11" fill="#ffc400"/>',
  gb: () => '<rect x="1" y="1" width="32" height="22" fill="#012169"/><path d="M1 1L33 23M33 1L1 23" stroke="#fff" stroke-width="4.5"/><path d="M1 1L33 23M33 1L1 23" stroke="#c8102e" stroke-width="1.6"/>'
    + '<path d="M17 1v22M1 12h32" stroke="#fff" stroke-width="7"/><path d="M17 1v22M1 12h32" stroke="#c8102e" stroke-width="4"/>',
};
export function flagSvg(code, w = 34) {
  const h = Math.round((w * 24) / 34);
  const id = `flag-${code}-${w}`;
  // Clipped to the rounded card so stripes and crosses keep the rounded corners.
  return `<svg width="${w}" height="${h}" viewBox="0 0 34 24" aria-hidden="true"><defs><clipPath id="${id}"><rect x="1" y="1" width="32" height="22" rx="5"/></clipPath></defs>`
    + `<g clip-path="url(#${id})">${(FLAGS[code] || FLAGS.jp)()}</g><rect x="1" y="1" width="32" height="22" rx="5" fill="none" stroke="var(--border)" stroke-width="2"/></svg>`;
}

export function statsBar() {
  const { state } = app;
  const now = app.now();
  const streak = displayStreak(state, now);
  const hearts = currentHearts(state, now);
  return html`<div class="stats">
    <button class="stat stat-flag" aria-label="Course: ${L.name}. Change course">${raw(flagSvg(L.flag))}</button>
    <button class="stat stat-streak ${studiedToday(state, now) ? 'on' : ''}" aria-label="Day streak: ${streak}. Open calendar">${icon('flame', 22)}<b>${streak}</b></button>
    <span class="stat stat-gems" title="Gems">${icon('gem', 22)}<b>${state.gems}</b></span>
    <button class="stat stat-hearts" aria-label="Hearts: ${hearts}. Refill">${icon('heart', 22)}<b>${hearts}</b></button>
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

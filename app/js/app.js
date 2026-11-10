// Shared app context: progress state, saving, navigation, toasts and modals.
import { loadState, saveState, currentHearts, displayStreak, studiedToday, courseSummary, STORAGE_KEY, TEST_STORAGE_KEY, SUMMARY_KEY } from './progress.js';
import { html, mount, raw, $ } from './dom.js';
import { L } from './lang.js';
import { icon } from './icons.js';
import { setSfx, setVoiceRate } from './audio.js';
import { writeReminderNote } from './reminders.js';
import { textSizePercent } from './usability.js';
import { t } from './strings.js';

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
  // Text size: everything is sized in rem, so the root font size scales the whole app.
  root.style.fontSize = `${textSizePercent(app.state.settings)}%`;
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
    <button class="stat stat-gems" aria-label="${t('Gems: {n}', { n: state.gems })}">${icon('gem', 22)}<b>${state.gems}</b></button>
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

// A persistent polite live region for short announcements (combo, timer, answers) that have no element of their own.
let live = null;
let pending = [];
let pendingTimer = null;
export function announce(text) {
  if (typeof document === 'undefined') return;
  if (!live) {
    live = Object.assign(document.createElement('div'), { id: 'sr-live', className: 'sr-only' });
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    document.body.append(live);
  }
  // Calls within a moment of each other are read together (an answer and a combo, say) instead of cutting each other off.
  live.textContent = '';
  if (text) pending.push(text);
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    live.textContent = pending.join('. ');
    pending = [];
  }, 80);
}

// While a dialog is open the page behind it is inert (unreachable by Tab and by screen readers); the first
// control gets focus, Escape closes a dismissable dialog and focus goes back to where it was.
const layer = { opener: null, onKey: null };
export function inertBehind(on) {
  for (const el of [$('#view'), $('#nav')]) {
    if (!el) continue;
    if ('inert' in el) el.inert = on;
    else if (on) el.setAttribute('aria-hidden', 'true');
    else el.removeAttribute('aria-hidden');
  }
}
export function openLayer(root, { dismiss = null, focus = '[data-i], button' } = {}) {
  if (!root.classList.contains('open')) layer.opener = document.activeElement;
  root.classList.add('open');
  inertBehind(true);
  const dialog = root.querySelector('[role="dialog"]');
  const title = dialog?.querySelector('h1, h2, h3');
  if (title) {
    title.id ||= 'dialog-title';
    dialog.setAttribute('aria-labelledby', title.id);
  }
  if (layer.onKey) document.removeEventListener('keydown', layer.onKey, true);
  layer.onKey = dismiss ? (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    dismiss();
  } : null;
  if (layer.onKey) document.addEventListener('keydown', layer.onKey, true);
  if (dialog) dialog.tabIndex = -1;
  (root.querySelector(focus) || dialog)?.focus({ preventScroll: true });
}
export function closeLayer(root = $('#modal')) {
  if (!root.classList.contains('open')) return;
  root.classList.remove('open');
  root.innerHTML = '';
  inertBehind(false);
  if (layer.onKey) document.removeEventListener('keydown', layer.onKey, true);
  layer.onKey = null;
  const back = layer.opener;
  layer.opener = null;
  if (back?.isConnected && back !== document.body) back.focus({ preventScroll: true });
}

// Shows a modal. buttons: [{ label, kind, onClick }]. Returns a close function.
export function modal(content, buttons = [], { dismissable = true } = {}) {
  const root = $('#modal');
  mount(root, html`<div class="scrim"></div>
    <div class="sheet" role="dialog" aria-modal="true">
      ${content}
      <div class="sheet-actions">${buttons.map((b, i) => html`<button class="btn btn-${b.kind || 'primary'} btn-block" data-i="${i}">${b.label}</button>`)}</div>
    </div>`);
  const close = () => closeLayer(root);
  openLayer(root, { dismiss: dismissable ? close : null });
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

// Keeps the live region at hand from the start, so the first announcement is not lost.
if (typeof document !== 'undefined') announce('');

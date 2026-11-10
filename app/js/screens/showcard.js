// "Show" card: a phrase in very large target-language text on a full screen, to hold up to a shop assistant,
// a taxi driver or a waiter. The meaning is small; the screen stays awake while it is open; tap to close.
import { html, mount, $ } from '../dom.js';
import { icon } from '../icons.js';
import { inertBehind } from '../app.js';
import { t } from '../strings.js';

// Bigger text for shorter phrases (measured in characters; Latin letters are narrower than Japanese or Chinese).
export function showSize(text, latin) {
  const n = [...text].length * (latin ? 0.62 : 1);
  if (n <= 4) return 7;
  if (n <= 8) return 5;
  if (n <= 16) return 3.5;
  return 2.5;
}

export function showCard({ text, meaning, say = '' }) {
  document.querySelector('.show-card')?.remove();
  const latin = /^[\p{Script=Latin}\s\p{P}\p{N}]+$/u.test(text);
  const card = document.createElement('div');
  card.className = 'show-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-label', t('Show to someone'));
  mount(card, html`<button class="show-close" aria-label="${t('Close')}">${icon('close', 28)}</button>
    <div class="show-body"><p class="show-text jp" style="font-size:${showSize(text, latin)}rem">${text}</p>
    ${say ? html`<p class="show-say">${say}</p>` : ''}
    ${meaning ? html`<p class="show-meaning">${meaning}</p>` : ''}</div>
    <p class="show-tap">${t('Tap anywhere to close')}</p>`);
  document.body.append(card);
  inertBehind(true);
  let lock = null;
  navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
  const opener = document.activeElement;
  const close = () => {
    card.remove();
    document.removeEventListener('keydown', onKey, true);
    lock?.release?.().catch?.(() => {});
    if (!document.querySelector('#modal.open')) inertBehind(false);
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  };
  const onKey = (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    close();
  };
  document.addEventListener('keydown', onKey, true);
  card.addEventListener('click', close);
  $('.show-close', card).focus({ preventScroll: true });
  return close;
}

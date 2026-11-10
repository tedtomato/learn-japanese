// Celebration effects: the startup splash, and reward pop-ups (chests, bonuses) with an animated
// chest that bursts open and gems flying out.
import { L, COURSES, courseChosen, takeSkipSplash } from './lang.js';
import { AVAILABLE } from './content/pack.js';
import { flagSvg, announce, openLayer, closeLayer, inertBehind } from './app.js';
import { t } from './strings.js';
import { html, mount, raw, $ } from './dom.js';
import { mascot } from './mascot.js';
import { sfx, speak } from './audio.js';
import { icon } from './icons.js';
import { celebrationHtml, pickCelebration } from './celebrate.js';
import { APP_RELEASE, APP_RELEASE_DATE } from './version.js';

const CHEST = `<svg class="fx-chest" viewBox="0 0 120 100" aria-hidden="true">
  <g class="fx-rays">${Array.from({ length: 12 }, (_, i) => `<rect x="58" y="-30" width="4" height="34" rx="2" transform="rotate(${i * 30} 60 50)"/>`).join('')}</g>
  <rect x="18" y="48" width="84" height="46" rx="8" fill="#c97a2b"/><rect x="18" y="48" width="84" height="12" fill="#a8611f"/>
  <rect x="52" y="54" width="16" height="20" rx="4" fill="#ffc800"/><rect x="18" y="86" width="84" height="8" rx="4" fill="#a8611f"/>
  <g class="fx-lid"><path d="M18 50V34a14 14 0 0 1 14-14h56a14 14 0 0 1 14 14v16z" fill="#e0913a"/><rect x="18" y="42" width="84" height="8" fill="#ffc800"/></g>
</svg>`;

// kind: 'chest' | 'bonus'. reward: html for the prize line.
export function rewardPopup({ kind = 'chest', title, reward, text = '', onDone } = {}) {
  const root = $('#modal');
  sfx(kind === 'chest' ? 'chest' : 'bonus');
  mount(root, html`<div class="scrim"></div>
    <div class="reward-pop" role="dialog" aria-modal="true">
      <div class="fx-stage">${kind === 'chest' ? raw(CHEST) : html`${raw(`<svg class="fx-chest fx-rays-only" viewBox="0 0 120 100" aria-hidden="true"><g class="fx-rays">${Array.from({ length: 12 }, (_, i) => `<rect x="58" y="-30" width="4" height="34" rx="2" transform="rotate(${i * 30} 60 50)"/>`).join('')}</g></svg>`)}<div class="fx-bonus">${icon('bolt', 64)}</div>`}
        <div class="fx-gems">${raw(Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36}deg;--d:${(i % 3) * 60}ms"></i>`).join(''))}</div>
      </div>
      <h2>${title}</h2>
      <p class="big-reward">${reward}</p>
      ${text ? html`<p class="muted">${text}</p>` : ''}
      <button class="btn btn-primary btn-block">Collect</button>
    </div>`);
  openLayer(root, { focus: 'button' });
  root.querySelector('button').addEventListener('click', () => {
    closeLayer(root);
    onDone?.();
  });
}

// The Claude spark (simplified), drawn as rays that slowly turn and pulse.
const CLAUDE_SPARK = `<svg class="claude-spark" viewBox="0 0 40 40" aria-label="Claude">
  ${[0, 32, 61, 95, 128, 160, 197, 229, 262, 298, 330].map((a, i) => `<rect x="18.6" y="${i % 2 ? 4 : 2}" width="2.8" height="${i % 2 ? 14 : 16}" rx="1.4" transform="rotate(${a} 20 20)"/>`).join('')}
</svg>`;

// The start screen: name, mascot, credits. Tapping it says "Hajime!" out loud (phones only allow
// sound after a tap) and opens the app.
export function splash() {
  // index.html already carries the splash (so the first paint is meaningful): fill in the parts that depend on
  // the course and take it over. Without it (unbuilt app, the lab) the splash is created here.
  const existing = [...document.querySelectorAll('.splash')].find((e) => !e.__adopted);
  if (takeSkipSplash()) {
    // Reloaded by a course switch: the start screen was already shown.
    existing?.remove();
    return;
  }
  const el = existing || document.createElement('div');
  el.className = 'splash';
  el.__adopted = true;
  el.dataset.ready = '1'; // scripts and tests can wait for [data-ready]: the tap is handled from here on
  // Before a language is picked, the splash speaks for every course.
  const first = !courseChosen();
  // The flags of every language the app teaches, the current one in front.
  const flags = AVAILABLE.map((code) => COURSES[code]).map((c) => html`<span class="${c.code === L.code && !first ? 'on' : ''}" title="${c.name}">${raw(flagSvg(c.flag, 34))}</span>`);
  const title = html`Hajime ${first ? '' : html`<span class="jp">${L.titleNative}</span>`}`;
  const tagline = `${first ? 'Japanese, Chinese, French, Spanish, English' : `Learn ${L.name}`}, one day at a time`;
  const flagRow = html`<div class="splash-flags" role="img" aria-label="Languages: ${AVAILABLE.map((code) => COURSES[code].name).join(', ')}">${flags}</div>`;
  const inner = existing && el.querySelector('.splash-inner');
  if (inner) {
    // Keep the mascot and button in place (no flicker, the entrance animation is not replayed).
    el.querySelector('h1').innerHTML = title.__raw;
    el.querySelector('.splash-inner > p').textContent = tagline;
    el.querySelector('.splash-flags').outerHTML = flagRow.__raw;
    if (!el.querySelector('.claude-spark')) el.querySelector('.made')?.insertAdjacentHTML('beforeend', ` ${CLAUDE_SPARK}`);
  } else {
    mount(el, html`<div class="splash-inner">${mascot('cheer', 150)}<h1>${title}</h1><p>${tagline}</p>
      ${flagRow}
      <button class="btn btn-white splash-go">Tap to start</button></div>
    <div class="splash-credits"><span class="beta">Beta version - ${APP_RELEASE_DATE} · v${APP_RELEASE}</span>
      <span class="made">Created by Seb and Claude AI ${raw(CLAUDE_SPARK)}</span></div>`);
  }
  if (!existing) document.body.append(el);
  // The start screen is a dialog over the app: what is behind it is out of reach until it is dismissed.
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  const heading = el.querySelector('h1');
  if (heading) {
    heading.id ||= 'splash-title';
    el.setAttribute('aria-labelledby', heading.id);
  }
  inertBehind(true);
  const go = el.querySelector('.splash-go');
  go?.focus({ preventScroll: true });
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    if (!first) speak(L.titleSay, { speaker: 'woman' });
    sfx('bonus');
    inertBehind(false);
    el.classList.add('out');
    setTimeout(() => el.remove(), 450);
    // Focus goes to the screen's heading, so a screen reader starts reading the app.
    const head = document.querySelector('#view h1');
    if (head) {
      head.setAttribute('tabindex', '-1');
      head.focus({ preventScroll: true });
    }
  };
  el.addEventListener('click', close);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

let lastCombo = null;
// "5 in a row!" burst over the lesson: a flame, the count and a ring of sparks; gone after ~1.6 s.
export function comboBurst(count) {
  document.querySelector('.combo')?.remove();
  const el = document.createElement('div');
  el.className = 'combo';
  el.setAttribute('aria-hidden', 'true');
  // Said through the shared live region (no extra element): the burst itself is only for the eyes.
  announce(`${t('{n} in a row!', { n: count })} ${t(count >= 10 ? 'Unstoppable!' : 'On fire!')}`);
  const sparks = Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join('');
  el.innerHTML = `<div class="combo-card"><div class="combo-sparks">${sparks}</div><div class="combo-flame">🔥</div>
    <b>${t('{n} in a row!', { n: count })}</b><span>${t(count >= 10 ? 'Unstoppable!' : 'On fire!')}</span></div>`;
  // Sometimes confetti or fireworks behind the card too (the dance is for the lesson end).
  const extra = pickCelebration('x', lastCombo);
  lastCombo = extra;
  if (extra !== 'dance') el.insertAdjacentHTML('afterbegin', celebrationHtml(extra));
  document.body.append(el);
  setTimeout(() => el.remove(), 1700);
}

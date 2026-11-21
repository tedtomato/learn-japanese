// Celebration effects: the startup splash, and reward pop-ups (chests, bonuses) with an animated
// chest that bursts open and gems flying out.
import { L, COURSES, courseChosen, takeSkipSplash } from './lang.js';
import { AVAILABLE } from './content/pack.js';
import { flagSvg, announce, openLayer, closeLayer, inertBehind } from './app.js';
import { t } from './strings.js';
import { html, mount, raw, $ } from './dom.js';
import { mascot, mascotSvg, setMood } from './mascot.js';
import { sfx, speak } from './audio.js';
import { icon } from './icons.js';
import { celebrationHtml, pickCelebration } from './celebrate.js';
import { APP_RELEASE, APP_RELEASE_DATE } from './version.js';
import { flyGems, reduced, pop } from './motion.js';
import { sayLine } from './moments.js';

const CHEST = `<svg class="fx-chest" viewBox="0 0 120 100" aria-hidden="true">
  <g class="fx-rays">${Array.from({ length: 12 }, (_, i) => `<rect x="58" y="-30" width="4" height="34" rx="2" transform="rotate(${i * 30} 60 50)"/>`).join('')}</g>
  <rect x="18" y="48" width="84" height="46" rx="8" fill="#c97a2b"/><rect x="18" y="48" width="84" height="12" fill="#a8611f"/>
  <rect x="52" y="54" width="16" height="20" rx="4" fill="#ffc800"/><rect x="18" y="86" width="84" height="8" rx="4" fill="#a8611f"/>
  <g class="fx-lid"><path d="M18 50V34a14 14 0 0 1 14-14h56a14 14 0 0 1 14 14v16z" fill="#e0913a"/><rect x="18" y="42" width="84" height="8" fill="#ffc800"/></g>
</svg>`;

// kind: 'chest' | 'bonus'. reward: html for the prize line.
export function rewardPopup({ kind = 'chest', title, reward, text = '', onDone, gems = kind === 'chest' } = {}) {
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
      <button class="btn btn-primary btn-block">${t('Collect')}</button>
    </div>`);
  openLayer(root, { focus: 'button' });
  root.querySelector('button').addEventListener('click', () => {
    // Gems fly up to the counter in the top bar (when this screen has one).
    if (gems) flyGems(root.querySelector('.big-reward') || root.querySelector('.fx-stage'));
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
  const line = sayLine(count >= 10 ? 'run10' : count >= 5 ? 'run5' : 'run3');
  announce(`${t('{n} in a row!', { n: count })} ${line}`);
  const sparks = Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join('');
  el.innerHTML = `<div class="combo-card"><div class="combo-sparks">${sparks}</div><div class="combo-flame">🔥</div>
    <b>${t('{n} in a row!', { n: count })}</b><span>${line}</span></div>`;
  // Sometimes confetti or fireworks behind the card too (the dance is for the lesson end).
  const extra = pickCelebration('x', lastCombo);
  lastCombo = extra;
  if (extra !== 'dance') el.insertAdjacentHTML('afterbegin', celebrationHtml(extra));
  document.body.append(el);
  setTimeout(() => el.remove(), 1700);
}

// The thunder combo (3 / 5 / 10 in a row): Kuri charges up and vibrates among sparks while the screen dims, a bolt
// strikes down from the top edge (drawn in 90 ms) with a white flash and a screen shake, the number slams in with
// heavy overshoot over a shockwave, and it all eases out: ~1.1 s, over the lesson, never blocking input. Electric blue
// with a white core and the app's gold for the number; at 10 the bolt turns gold too. Reduced motion (and no DOM):
// the old combo card, which just fades. The run flame on the progress bar keeps a bolt afterwards.
const rnd = (a, b) => a + Math.random() * (b - a);
function boltPath(x0, y0, x1, y1, segments = 6, jitter = 18) {
  const pts = [[x0, y0]];
  for (let i = 1; i < segments; i++) {
    const p = i / segments;
    pts.push([x0 + (x1 - x0) * p + rnd(-jitter, jitter), y0 + (y1 - y0) * p + rnd(-jitter * 0.4, jitter * 0.4)]);
  }
  pts.push([x1, y1]);
  return { d: pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(''), pts };
}
export function thunderCombo(count) {
  if (typeof document === 'undefined') return;
  if (reduced()) {
    comboBurst(count);
    return;
  }
  document.querySelector('.combo')?.remove();
  document.querySelector('.thunder')?.remove();
  const lvl = count >= 10 ? 10 : count >= 5 ? 5 : 3;
  const line = sayLine(lvl === 10 ? 'run10' : lvl === 5 ? 'run5' : 'run3');
  announce(`${t('{n} in a row!', { n: count })} ${line}`);
  const el = document.createElement('div');
  el.className = 'thunder charging';
  el.dataset.lvl = String(lvl);
  el.setAttribute('aria-hidden', 'true');
  // Electric sparks around the mascot: 3–5 short jagged lines, each flickering on its own beat.
  const sparks = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 + rnd(0, 1);
    const r0 = rnd(54, 66);
    const pts = Array.from({ length: 4 }, (_, k) => {
      const r = r0 + k * rnd(10, 18);
      const ang = a + rnd(-0.25, 0.25) * (k % 2 ? 1 : -1);
      return `${(100 + Math.cos(ang) * r).toFixed(1)},${(100 + Math.sin(ang) * r).toFixed(1)}`;
    });
    return `<polyline points="${pts.join(' ')}" style="--d:${i * 37}ms"/>`;
  }).join('');
  // "in a row!" without the number: the same string the card uses, so every language already has it.
  const label = t('{n} in a row!', { n: '' }).trim();
  el.innerHTML = `<i class="th-dim"></i>
    <svg class="th-bolt" aria-hidden="true"><path class="th-glow"/><path class="th-core"/><path class="th-fork-glow"/><path class="th-fork"/></svg>
    <i class="th-flash"></i>
    <div class="th-stage"><svg class="th-sparks" viewBox="0 0 200 200">${sparks}</svg><div class="th-mascot">${mascotSvg('happy', 120)}</div>
      <div class="th-numwrap"><i class="th-ring"></i><b class="th-num">${count}</b><span class="th-label">${label}</span></div></div>`;
  document.body.append(el);
  const timers = [];
  const later = (ms, fn) => timers.push(setTimeout(() => { if (el.isConnected) fn(); }, ms));
  // Strike: the bolt comes down from the top edge to the mascot's head, drawn with stroke-dashoffset in 90 ms.
  later(250, () => {
    el.classList.remove('charging');
    el.classList.add('strike');
    const host = el.querySelector('.th-mascot');
    const m = host.getBoundingClientRect();
    const W = window.innerWidth;
    const H = window.innerHeight;
    const svg = el.querySelector('.th-bolt');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const tx = m.left + m.width / 2;
    const ty = m.top + m.height * 0.12;
    const main = boltPath(tx + rnd(-W * 0.18, W * 0.18), 0, tx, ty, 7, Math.min(26, W * 0.07));
    const forkFrom = (k, dir) => {
      const [x, y] = main.pts[k];
      return boltPath(x, y, x + dir * rnd(40, 70), y + rnd(40, 70), 3, 10).d;
    };
    const forks = `${forkFrom(2, -1)} ${forkFrom(4, 1)}`;
    svg.querySelector('.th-glow').setAttribute('d', main.d);
    svg.querySelector('.th-core').setAttribute('d', main.d);
    svg.querySelector('.th-fork-glow').setAttribute('d', forks);
    svg.querySelector('.th-fork').setAttribute('d', forks);
    for (const path of svg.querySelectorAll('path')) {
      const len = path.getTotalLength?.() || 1000;
      path.style.strokeDasharray = `${len} ${len}`;
      path.animate?.([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 90, easing: 'linear', fill: 'forwards' });
    }
    const lesson = document.querySelector('.lesson');
    if (lesson) pop(lesson, 'th-shake', 400);
    // The mascot takes the hit in style: shades from 5, the party hat at 10, charged eyes glowing briefly.
    const fresh = setMood(host.querySelector('.mascot'), lvl === 10 ? 'party' : lvl === 5 ? 'cool' : 'cheer');
    fresh.classList.add('charged');
  });
  later(400, () => el.classList.add('slam'));
  later(700, () => {
    el.classList.add('settle');
    const run = document.querySelector('.run');
    if (run && !run.querySelector('.run-bolt')) run.insertAdjacentHTML('beforeend', `<span class="run-bolt">${icon('bolt', 12).__raw}</span>`);
  });
  later(1150, () => el.remove());
  el.__timers = timers;
  return el;
}

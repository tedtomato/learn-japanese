// Celebration effects: the startup splash, and reward pop-ups (chests, bonuses) with an animated
// chest that bursts open and gems flying out.
import { html, mount, raw, $ } from './dom.js';
import { mascot } from './mascot.js';
import { sfx, speak } from './audio.js';
import { icon } from './icons.js';
import { APP_RELEASE } from './content/changelog.js';

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
  root.classList.add('open');
  root.querySelector('button').addEventListener('click', () => {
    root.classList.remove('open');
    root.innerHTML = '';
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
  const el = document.createElement('div');
  el.className = 'splash';
  mount(el, html`<div class="splash-inner">${mascot('cheer', 150)}<h1>Hajime <span class="jp">はじめ</span></h1><p>Learn Japanese, one day at a time</p>
      <button class="btn btn-white splash-go">Tap to start</button></div>
    <div class="splash-credits"><span class="beta">Beta version - Oct 26 · v${APP_RELEASE}</span>
      <span class="made">Created by Seb and Claude AI ${raw(CLAUDE_SPARK)}</span></div>`);
  document.body.append(el);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    speak('はじめ！', { speaker: 'girl' });
    sfx('bonus');
    el.classList.add('out');
    setTimeout(() => el.remove(), 450);
  };
  el.addEventListener('click', close);
}

// The daily goal as an energy meter (Learn screen goal card): a capsule with a liquid fill whose top edge is two
// gently moving waves, four tick marks that light up as the level passes them, a glow that strengthens with the level
// and bubbles while the fill moves. Back from a lesson the fill pours from the old level to the new one (~900 ms,
// ease-out, a slosh at the end) while the XP counts up; at 100% the capsule flashes, sparks fly off the top and the
// card pulses once. Reduced motion: the fill jumps and the waves are flat (CSS). The markup keeps the progressbar role.
import { raw } from './dom.js';
import { t } from './strings.js';
import { reduced, pop, countUp, easeOut } from './motion.js';
import { sfx } from './audio.js';

export const TICKS = [20, 40, 60, 80];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const levelOf = (xp, goal) => clamp01((xp || 0) / Math.max(1, goal || 1));

// Two periods of a wave over 800 user units: translating by 400 loops seamlessly. `a` is the amplitude, `up` the
// starting phase (crest first or trough first).
const WAVE = (a, up) => `M0 ${a} Q50 ${up ? 0 : a * 2} 100 ${a} T200 ${a} T300 ${a} T400 ${a} T500 ${a} T600 ${a} T700 ${a} T800 ${a} V200 H0 Z`;

let instances = 0;
export function energyMeterHtml(xp, goal) {
  const lvl = levelOf(xp, goal);
  const u = (++instances).toString(36);
  const ticks = TICKS.map((p) => `<i style="left:${p}%" class="${lvl * 100 >= p ? 'lit' : ''}" data-at="${p}"></i>`).join('');
  const bubbles = Array.from({ length: 6 }, (_, i) => `<i style="--x:${10 + i * 15}%;--d:${(i * 0.17).toFixed(2)}s"></i>`).join('');
  const sparks = Array.from({ length: 7 }, (_, i) => `<i style="--x:${15 + i * 11}%;--dx:${((i % 3) - 1) * 14}px;--d:${(i * 0.05).toFixed(2)}s"></i>`).join('');
  return `<div class="energy ${lvl >= 1 ? 'full' : ''}" role="progressbar" aria-label="${t('Daily goal')}" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(xp, goal)}" style="--lvl:${lvl.toFixed(4)}">
    <div class="energy-body">
      <svg class="energy-liquid" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs><linearGradient id="eg-${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc800"/><stop offset=".55" stop-color="#9fdc2a"/><stop offset="1" stop-color="#58cc02"/></linearGradient></defs>
        <g class="energy-fill"><path class="wave wave-b" d="${WAVE(8, false)}" fill="url(#eg-${u})"/><path class="wave wave-a" d="${WAVE(6, true)}" fill="url(#eg-${u})"/></g>
      </svg>
      <i class="energy-glow"></i><i class="energy-sheen"></i>
      <div class="energy-ticks">${ticks}</div>
      <div class="energy-bubbles">${bubbles}</div>
    </div>
    <i class="energy-cap"></i>
    <div class="energy-sparks">${sparks}</div>
  </div>`;
}
export const energyMeter = (xp, goal) => raw(energyMeterHtml(xp, goal));

function setLevel(meter, lvl, xpNow, goal) {
  meter.style.setProperty('--lvl', lvl.toFixed(4));
  for (const tick of meter.querySelectorAll('.energy-ticks i')) tick.classList.toggle('lit', lvl * 100 >= Number(tick.dataset.at));
  if (xpNow != null) meter.setAttribute('aria-valuenow', String(Math.min(xpNow, goal)));
}

// Pours the meter in `card` (a .goal-card) from `fromXp` to `toXp`. Returns a cancel function.
export function pourEnergy(card, fromXp, toXp, goal, { ms = 900 } = {}) {
  const meter = card?.querySelector?.('.energy');
  if (!meter) return () => {};
  const from = levelOf(fromXp, goal);
  const to = levelOf(toXp, goal);
  const num = card.querySelector('.goal-xp');
  const reached = to >= 1 && from < 1;
  const land = () => {
    setLevel(meter, to, toXp, goal);
    meter.classList.remove('pouring', 'slosh');
    card.classList.remove('pouring');
    if (to >= 1) meter.classList.add('full');
    if (!reached) return;
    const pill = card.querySelector('.pill');
    if (pill) pop(pill, 'pop', 500);
    if (reduced()) return;
    meter.classList.add('full-flash');
    pop(card, 'pulse', 700);
    sfx('gem');
    setTimeout(() => meter.classList.remove('full-flash'), 900);
  };
  if (reduced() || from === to) {
    if (num) num.textContent = String(Math.min(toXp, goal));
    land();
    return () => {};
  }
  setLevel(meter, from, fromXp, goal);
  meter.classList.remove('full');
  meter.classList.add('pouring');
  if (reached) card.classList.add('pouring');
  if (num) countUp(num, Math.min(fromXp, goal), Math.min(toXp, goal), ms, { punch: true });
  sfx('xp');
  let stopped = false;
  const frame = globalThis.requestAnimationFrame ? (f) => globalThis.requestAnimationFrame(f) : (f) => setTimeout(() => f(Date.now()), 16);
  const t0 = Date.now();
  const slosh = 450; // the wobble after the pour lands
  const tick = () => {
    if (stopped || !meter.isConnected) return;
    const el = Date.now() - t0;
    if (el < ms) {
      setLevel(meter, from + (to - from) * easeOut(el / ms));
      frame(tick);
      return;
    }
    if (el === ms || !meter.classList.contains('slosh')) {
      meter.classList.remove('pouring');
      meter.classList.add('slosh');
      sfx('xp-end');
    }
    const p = (el - ms) / slosh;
    if (p < 1 && to < 1) {
      // A damped wobble around the new level: the liquid overshoots and settles.
      setLevel(meter, clamp01(to + (to - from) * 0.08 * Math.sin(p * Math.PI * 3) * (1 - p)));
      frame(tick);
      return;
    }
    land();
  };
  frame(tick);
  return () => {
    stopped = true;
    land();
  };
}

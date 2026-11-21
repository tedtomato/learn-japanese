// Kuri, the shiba inu mascot (a panda in the Chinese course, same moods and poses). Moods: see MOODS (happy, cheer, sad, dance + the
// reward poses jump, trophy, cool, party, sleepy, think). Drawn with volume (v1.1): gradient fur with a lit side and a shaded side,
// ambient occlusion under the head and ears, a specular on the forehead and nose, a rim light on the right edge and a soft contact
// shadow. Each part is its own layer (.m-shadow, .m-tail, .m-body, .m-paws, .m-head > .m-ears / .m-face / .m-features > .m-brows,
// .m-eyes, .m-muzzle, .m-mouth) so the CSS can breathe, turn the head with parallax (lookAt), wag, blink and flick the ears.
// The old class names (ear, ear-l, dog-eyes, shadow, shades, hat, cup, zzz) stay, so every pose animation in app.css still applies.
// Purely decorative, so hidden from screen readers (the text beside it says everything).
import { raw } from './dom.js';
import { L } from './lang.js';
import { reduced } from './motion.js';

export const MOODS = ['happy', 'cheer', 'sad', 'dance', 'jump', 'trophy', 'cool', 'party', 'sleepy', 'think'];

// Several mascots render on one page: every instance gets its own gradient ids (u = the suffix).
let instances = 0;
const INK = '#2b2b2b';

// ---------- Gradients ----------
function defs(u, panda) {
  const fur = panda
    ? `<radialGradient id="fur-${u}" cx="40%" cy="32%" r="78%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f4f3ee"/><stop offset="1" stop-color="#c9c8c0"/></radialGradient>`
    : `<radialGradient id="fur-${u}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#ffc77d"/><stop offset=".5" stop-color="#f0a04b"/><stop offset="1" stop-color="#bf6a22"/></radialGradient>`;
  const ink = `<radialGradient id="ink-${u}" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#5b5b5b"/><stop offset=".55" stop-color="${INK}"/><stop offset="1" stop-color="#0e0e0e"/></radialGradient>`;
  return `<defs>${fur}${ink}
    <linearGradient id="cream-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="${panda ? '#e4e3dc' : '#f1d7b8'}"/></linearGradient>
    <radialGradient id="earin-${u}" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="${panda ? '#7a7a7a' : '#ffd6c6'}"/><stop offset="1" stop-color="${panda ? '#3a3a3a' : '#e39a82'}"/></radialGradient>
    <radialGradient id="iris-${u}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#5a4638"/><stop offset=".6" stop-color="#2a221e"/><stop offset="1" stop-color="#111"/></radialGradient>
    <radialGradient id="nose-${u}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#5c5252"/><stop offset="1" stop-color="#151212"/></radialGradient>
    <radialGradient id="blush-${u}"><stop offset="0" stop-color="#ff8a94" stop-opacity=".8"/><stop offset="1" stop-color="#ff8a94" stop-opacity="0"/></radialGradient>
    <radialGradient id="sh-${u}"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset=".7" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>`;
}

// ---------- Faces (eyes at 46/74, 56; nose at 60, 68; mouth around 76) ----------
const eye = (cx, cy, u, rx = 5.2, ry = 6.6) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#iris-${u})"/><circle cx="${cx + 1.8}" cy="${cy - 2.6}" r="1.9" fill="#fff"/><circle cx="${cx - 1.6}" cy="${cy + 2.2}" r=".9" fill="#fff" opacity=".75"/>`;
const pandaEye = (cx, cy, u, dy = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="4.8" ry="6" fill="#fff"/><circle cx="${cx + 0.4}" cy="${cy + 0.8 + dy}" r="2.9" fill="url(#iris-${u})"/><circle cx="${cx + 1.3}" cy="${cy - 0.6 + dy}" r="1.1" fill="#fff"/>`;
const ARCS = (c, y = 57) => `<path d="M40 ${y}q6-8 12 0M68 ${y}q6-8 12 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
const CLOSED = (c) => `<path d="M40 57q6 6 12 0M68 57q6 6 12 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`;

function eyes(mood, panda, u) {
  const kind = ['cheer', 'dance', 'jump', 'party'].includes(mood) ? 'cheer' : mood === 'sad' ? 'sad' : mood === 'sleepy' ? 'closed' : 'open';
  if (kind === 'cheer') return ARCS(panda ? '#fff' : INK);
  if (kind === 'closed') return CLOSED(panda ? '#fff' : INK);
  if (kind === 'sad') return panda ? pandaEye(46, 58, u, 0.8) + pandaEye(74, 58, u, 0.8) : eye(46, 58, u, 4.6, 5.6) + eye(74, 58, u, 4.6, 5.6);
  return panda ? pandaEye(46, 56, u) + pandaEye(74, 56, u) : eye(46, 56, u) + eye(74, 56, u);
}
function brows(mood, panda) {
  const c = panda ? '#fff' : INK;
  if (mood === 'sad') return `<path d="M39 48l13-3M81 48l-13-3" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="${panda ? '.85' : '1'}"/>`;
  if (mood === 'think') return `<path d="M38 46q8-6 16-1" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" opacity="${panda ? '.85' : '1'}"/>`;
  return '';
}
function mouth(mood) {
  switch (mood) {
    case 'cheer': case 'dance': case 'jump': case 'party':
      // An open mouth with depth: a dark inside, the tongue, and the outline.
      return `<path d="M50 74q10 17 20 0z" fill="#4a1b24"/><ellipse cx="60" cy="80.5" rx="5.2" ry="3.4" fill="#ff7b8a"/><path d="M50 74q10 17 20 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linejoin="round"/>`;
    case 'sad': return `<path d="M60 73v3M52 81q8-6 16 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    case 'think': return `<path d="M60 73v4M54 80h12" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    case 'sleepy': return `<path d="M60 73v3M55 78q5 4 10 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    default: return `<path d="M60 73v3M52 76q8 7 16 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  }
}

// ---------- Props drawn over the face, per pose (arms, a cup, shades, a party hat, Zzz, a paw on the chin) ----------
function props(mood, panda, u) {
  const fur = panda ? `url(#ink-${u})` : `url(#fur-${u})`;
  const arm = (d) => `<path d="${d}" stroke="${fur}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  const paws = (y) => `<ellipse cx="42" cy="${y}" rx="7" ry="5.5" fill="${fur}"/><ellipse cx="78" cy="${y}" rx="7" ry="5.5" fill="${fur}"/>`;
  switch (mood) {
    case 'jump': return `<g class="m-arms">${arm('M38 98Q8 86 10 48')}${arm('M82 98Q112 86 110 48')}<circle cx="10" cy="46" r="7" fill="${fur}"/><circle cx="110" cy="46" r="7" fill="${fur}"/></g>`;
    case 'cheer': case 'dance': return `<g class="m-arms">${arm('M38 100Q14 96 14 70')}${arm('M82 100Q106 96 106 70')}<circle cx="14" cy="68" r="6.5" fill="${fur}"/><circle cx="106" cy="68" r="6.5" fill="${fur}"/></g>`;
    case 'trophy': return `<g class="cup"><path d="M44 96h-6a6 6 0 0 0 6 10M76 96h6a6 6 0 0 1-6 10" stroke="#e5a500" stroke-width="3" fill="none"/><path d="M44 92h32v10a16 16 0 0 1-32 0z" fill="#ffc800" stroke="#e5a500" stroke-width="2"/><path d="M50 97q3-3 3 4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></g>${paws(102)}`;
    case 'cool': return '<g class="shades"><rect x="32" y="47" width="26" height="16" rx="6" fill="#16202a"/><rect x="62" y="47" width="26" height="16" rx="6" fill="#16202a"/><path d="M58 53h4M32 52l-7-3M88 52l7-3" stroke="#16202a" stroke-width="3" stroke-linecap="round"/><path d="M37 51l6 0M67 51l6 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></g>';
    case 'party': return '<g class="hat"><path d="M42 26 60 -10 78 26z" fill="#ce82ff" stroke="#a559e3" stroke-width="2" stroke-linejoin="round"/><path d="M47 18l26 0M51 8l18 0" stroke="#fff" stroke-width="3" opacity=".7"/><circle cx="60" cy="-11" r="5" fill="#ffc800"/></g><circle cx="8" cy="22" r="3" fill="#ff4b4b"/><circle cx="112" cy="14" r="3" fill="#1cb0f6"/><circle cx="106" cy="52" r="2.5" fill="#ffc800"/><circle cx="12" cy="58" r="2.5" fill="#58cc02"/>';
    case 'sleepy': return '<g class="zzz" font-family="sans-serif" font-weight="800" fill="#1cb0f6"><text x="88" y="24" font-size="18">Z</text><text x="100" y="10" font-size="13">z</text><text x="108" y="-1" font-size="9">z</text></g>';
    case 'think': return `<circle cx="70" cy="87" r="8.5" fill="${fur}"/><g fill="#9aa5ab"><circle cx="100" cy="30" r="3"/><circle cx="108" cy="18" r="4.5"/></g>`;
    default: return '';
  }
}

// ---------- The body (shadow, tail, body, paws) and the head (ears, face, features) ----------
function shiba(mood, u) {
  const fur = `url(#fur-${u})`;
  const cream = `url(#cream-${u})`;
  return `<g class="m-shadow"><ellipse class="shadow" cx="60" cy="116" rx="36" ry="4.5" fill="url(#sh-${u})"/></g>
  <g class="m-tail"><path d="M86 100c12-3 18-12 11-20-5-6-14-3-12 5" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="85" cy="85" r="4" fill="${cream}"/></g>
  <g class="m-body"><ellipse cx="60" cy="96" rx="31" ry="21" fill="${fur}"/><path d="M60 116c-12 0-21-8-21-17 0-5 4-7 9-5 5 2 8 3 12 3s7-1 12-3c5-2 9 0 9 5 0 9-9 17-21 17z" fill="${cream}"/><ellipse cx="60" cy="93" rx="34" ry="7" fill="#000" opacity=".15"/></g>
  <g class="m-paws"><ellipse cx="46" cy="112" rx="9" ry="5" fill="${cream}" stroke="#d8b08a" stroke-width="1"/><ellipse cx="74" cy="112" rx="9" ry="5" fill="${cream}" stroke="#d8b08a" stroke-width="1"/></g>
  <g class="m-head">
    <g class="m-ears"><g class="ear ear-l"><path d="M24 48 30 8 58 32z" fill="${fur}"/><path d="M31 41 34 19 48 31z" fill="url(#earin-${u})"/></g><g class="ear ear-r"><path d="M96 48 90 8 62 32z" fill="${fur}"/><path d="M89 41 86 19 72 31z" fill="url(#earin-${u})"/></g></g>
    <g class="m-face"><ellipse cx="60" cy="58" rx="40" ry="36" fill="${fur}"/><path d="M93 34q10 22-3 46" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".3"/><ellipse cx="50" cy="31" rx="13" ry="5" fill="#fff" opacity=".26"/>
      <path d="M60 93c-20 0-34-10-34-24 0-6 6-9 12-7 8 3 13 4 22 4s14-1 22-4c6-2 12 1 12 7 0 14-14 24-34 24z" fill="${cream}"/><ellipse cx="41" cy="44" rx="7" ry="4" fill="${cream}"/><ellipse cx="79" cy="44" rx="7" ry="4" fill="${cream}"/></g>
    <g class="m-features"><g class="m-brows">${brows(mood, false)}</g><g class="dog-eyes m-eyes">${eyes(mood, false, u)}</g>
      <g class="m-muzzle"><ellipse cx="34" cy="70" rx="7.5" ry="4.8" fill="url(#blush-${u})"/><ellipse cx="86" cy="70" rx="7.5" ry="4.8" fill="url(#blush-${u})"/><ellipse cx="60" cy="68" rx="7" ry="5" fill="url(#nose-${u})"/><ellipse cx="57.4" cy="66.2" rx="2.1" ry="1.1" fill="#fff" opacity=".55"/></g>
      <g class="m-mouth">${mouth(mood)}</g></g>
  </g>`;
}

function panda(mood, u) {
  const fur = `url(#fur-${u})`;
  const ink = `url(#ink-${u})`;
  return `<g class="m-shadow"><ellipse class="shadow" cx="60" cy="116" rx="36" ry="4.5" fill="url(#sh-${u})"/></g>
  <g class="m-tail"><circle cx="90" cy="98" r="6" fill="${ink}"/></g>
  <g class="m-body"><ellipse cx="60" cy="96" rx="31" ry="21" fill="${fur}"/><path d="M29 96c0-8 8-14 14-10 6 4 10 12 6 20-3 6-9 8-14 4-5-3-6-9-6-14z" fill="${ink}"/><path d="M91 96c0-8-8-14-14-10-6 4-10 12-6 20 3 6 9 8 14 4 5-3 6-9 6-14z" fill="${ink}"/><ellipse cx="60" cy="92" rx="34" ry="8" fill="#000" opacity=".18"/></g>
  <g class="m-paws"><ellipse cx="46" cy="112" rx="9" ry="5" fill="${ink}"/><ellipse cx="74" cy="112" rx="9" ry="5" fill="${ink}"/></g>
  <g class="m-head">
    <g class="m-ears"><g class="ear ear-l"><circle cx="28" cy="24" r="14" fill="${ink}"/><circle cx="29" cy="26" r="6.5" fill="url(#earin-${u})"/></g><g class="ear ear-r"><circle cx="92" cy="24" r="14" fill="${ink}"/><circle cx="91" cy="26" r="6.5" fill="url(#earin-${u})"/></g></g>
    <g class="m-face"><ellipse cx="60" cy="58" rx="40" ry="36" fill="${fur}"/><path d="M93 34q10 22-3 46" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/><ellipse cx="50" cy="31" rx="13" ry="5" fill="#fff" opacity=".5"/>
      <path d="M27 50c-2-10 6-16 13-12 7 5 11 12 9 20-2 8-9 11-15 8-5-3-6-9-7-16z" fill="${ink}"/><path d="M93 50c2-10-6-16-13-12-7 5-11 12-9 20 2 8 9 11 15 8 5-3 6-9 7-16z" fill="${ink}"/></g>
    <g class="m-features"><g class="m-brows">${brows(mood, true)}</g><g class="dog-eyes m-eyes">${eyes(mood, true, u)}</g>
      <g class="m-muzzle"><ellipse cx="33" cy="72" rx="7" ry="4.5" fill="url(#blush-${u})"/><ellipse cx="87" cy="72" rx="7" ry="4.5" fill="url(#blush-${u})"/><ellipse cx="60" cy="68" rx="7" ry="5" fill="url(#nose-${u})"/><ellipse cx="57.4" cy="66.2" rx="2.1" ry="1.1" fill="#fff" opacity=".55"/></g>
      <g class="m-mouth">${mouth(mood)}</g></g>
  </g>`;
}

export function mascotSvg(mood = 'happy', size = 96, isPanda = L.code === 'zh') {
  if (!MOODS.includes(mood)) mood = 'happy';
  const u = (++instances).toString(36);
  // A per-instance phase, so two mascots on one screen do not blink and tilt in step.
  const seed = ((instances * 37) % 11) / 11;
  return `<svg class="mascot ${isPanda ? 'panda ' : ''}mood-${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" style="--seed:${seed.toFixed(2)}" aria-hidden="true" focusable="false">${defs(u, isPanda)}
  ${isPanda ? panda(mood, u) : shiba(mood, u)}
  ${props(mood, isPanda, u)}
</svg>`;
}

export const mascot = (mood, size) => raw(mascotSvg(mood, size));

// ---------- Live control ----------
const clamp = (v) => Math.max(-1, Math.min(1, v));

// Turns a mascot (or a lesson character: anything with the --lx/--ly CSS vars wired in app.css) towards a point.
// `x, y` are viewport coordinates, or `x` is an element (its centre is used); no target looks straight ahead again.
// `range` is how far (px) from the mascot's centre counts as fully to the side. The vars are −1..1; data-look
// says which way, for the coarse head turn.
export function lookAt(el, x, y, range) {
  if (!el?.style || !el.getBoundingClientRect) return;
  if (x == null) {
    el.style.removeProperty('--lx');
    el.style.removeProperty('--ly');
    delete el.dataset.look;
    return;
  }
  if (typeof x === 'object') {
    const t = x.getBoundingClientRect?.();
    if (!t) return;
    x = t.left + t.width / 2;
    y = t.top + t.height / 2;
  }
  const r = el.getBoundingClientRect();
  if (!r.width) return;
  const span = range || r.width * 1.5;
  const lx = clamp((x - (r.left + r.width / 2)) / span);
  const ly = clamp(((y ?? r.top + r.height / 2) - (r.top + r.height / 2)) / span);
  el.style.setProperty('--lx', lx.toFixed(2));
  el.style.setProperty('--ly', ly.toFixed(2));
  const look = Math.abs(lx) > 0.35 ? (lx < 0 ? 'left' : 'right') : ly < -0.35 ? 'up' : '';
  if (look) el.dataset.look = look;
  else delete el.dataset.look;
}

// Swaps the pose of a mascot already on screen (same size and species; its look direction and extra classes are kept).
// Returns the new element, which replaces the old one.
export function setMood(el, mood) {
  if (!el || typeof document === 'undefined') return el;
  const size = Number(el.getAttribute('width')) || 96;
  const box = document.createElement('div');
  box.innerHTML = mascotSvg(mood, size, el.classList.contains('panda'));
  const fresh = box.firstElementChild;
  for (const c of el.classList) if (c !== 'mascot' && c !== 'panda' && !c.startsWith('mood-')) fresh.classList.add(c);
  if (el.dataset.look) fresh.dataset.look = el.dataset.look;
  for (const v of ['--lx', '--ly', '--lean']) {
    const val = el.style.getPropertyValue(v);
    if (val) fresh.style.setProperty(v, val);
  }
  el.replaceWith(fresh);
  return fresh;
}

// The mascot on the path follows the finger a little (throttled to one update per frame), leans into it, glances in
// the direction of a scroll, and otherwise looks at the current node. The pointer listener is wired once per host
// (the screen element), the scroll listener once per page; calling again only re-aims at the node (after a re-render).
let idle = 0;
let scrollWired = false;
export function followFinger(host, sel = '.node-mascot .mascot', restSel = '.node.st-current') {
  if (!host?.querySelector) return;
  const find = () => host.querySelector(sel);
  const rest = () => {
    const el = find();
    if (!el) return;
    el.style.removeProperty('--lean');
    lookAt(el, host.querySelector(restSel) || null);
  };
  const aim = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f) => setTimeout(f, 16);
  aim(rest);
  if (host.__follow) return;
  host.__follow = true;
  let px = 0;
  let py = 0;
  let frame = 0;
  const apply = () => {
    frame = 0;
    const el = find();
    if (!el || reduced()) return;
    lookAt(el, px, py, 240);
    el.style.setProperty('--lean', (Number(el.style.getPropertyValue('--lx')) * 0.6).toFixed(2));
  };
  host.addEventListener('pointermove', (e) => {
    px = e.clientX;
    py = e.clientY;
    if (!frame) frame = aim(apply);
    clearTimeout(idle);
    idle = setTimeout(rest, 1400);
  }, { passive: true });
  if (scrollWired || !globalThis.addEventListener) return;
  scrollWired = true;
  let lastY = globalThis.scrollY || 0;
  globalThis.addEventListener('scroll', () => {
    const el = document.querySelector(sel);
    const y = globalThis.scrollY || 0;
    const dy = y - lastY;
    lastY = y;
    if (!el || reduced() || Math.abs(dy) < 2) return;
    el.style.setProperty('--ly', dy > 0 ? '.5' : '-.5');
    el.style.setProperty('--lx', '0');
    delete el.dataset.look;
    clearTimeout(idle);
    idle = setTimeout(() => {
      el.style.removeProperty('--lean');
      lookAt(el, document.querySelector(restSel) || null);
    }, 900);
  }, { passive: true });
}

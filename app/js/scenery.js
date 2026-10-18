// Garden scenery for the learning path: a stepping-stone trail between the lesson circles and
// little bonsai trees, zen stones, bushes and lanterns beside it.
import { raw } from './dom.js';

const DECOR = {
  bonsai: `<svg viewBox="0 0 64 64"><path d="M20 54h24l-3 8H23z" fill="#a8613a"/><rect x="17" y="51" width="30" height="5" rx="2" fill="#c97a4a"/>
    <path d="M32 52c0-8-6-10-4-18s9-7 8-14" stroke="#6b4a2f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M31 36c-6-1-10 1-13 4" stroke="#6b4a2f" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="16" cy="38" rx="10" ry="6" fill="#58a700"/><ellipse cx="38" cy="18" rx="13" ry="8" fill="#58cc02"/><ellipse cx="46" cy="28" rx="9" ry="5.5" fill="#58a700"/><ellipse cx="34" cy="14" rx="7" ry="4" fill="#7ae034"/></svg>`,
  stones: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="58" rx="22" ry="4" fill="rgba(0,0,0,.12)"/><ellipse cx="32" cy="50" rx="18" ry="8" fill="#9aa5ad"/>
    <ellipse cx="31" cy="38" rx="13" ry="6.5" fill="#b5bec4"/><ellipse cx="33" cy="28" rx="9" ry="5" fill="#9aa5ad"/><ellipse cx="32" cy="20" rx="5.5" ry="3.5" fill="#c7cfd4"/>
    <path d="M22 47q4-3 9-2" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  bush: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="58" rx="22" ry="4" fill="rgba(0,0,0,.1)"/><circle cx="20" cy="46" r="11" fill="#58a700"/><circle cx="34" cy="40" r="14" fill="#58cc02"/><circle cx="46" cy="48" r="10" fill="#58a700"/>
    <circle cx="28" cy="36" r="3" fill="#ff9ec4"/><circle cx="40" cy="44" r="2.5" fill="#ffc4d6"/><circle cx="22" cy="48" r="2.5" fill="#ff9ec4"/></svg>`,
  grass: `<svg viewBox="0 0 64 64"><path d="M20 58c-2-10 0-16 4-22M28 58c0-12 2-20 6-26M36 58c1-9 5-14 10-17M44 58c0-6 2-9 6-11M24 58c-4-6-8-8-12-9" stroke="#58a700" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
  lantern: `<svg viewBox="0 0 64 64"><rect x="26" y="50" width="12" height="8" rx="2" fill="#9aa5ad"/><rect x="29" y="38" width="6" height="12" fill="#b5bec4"/>
    <rect x="22" y="26" width="20" height="12" rx="2" fill="#b5bec4"/><rect x="27" y="29" width="10" height="6" rx="1" fill="#ffd23f"/><path d="M16 26l16-10 16 10z" fill="#9aa5ad"/><circle cx="32" cy="14" r="3" fill="#9aa5ad"/></svg>`,
};
const ORDER = ['bonsai', 'grass', 'stones', 'bush', 'lantern', 'grass', 'bonsai', 'bush', 'stones'];

// A decoration for the given path position (some rows stay empty so it doesn't feel crowded).
export function decorFor(i) {
  if (i % 3 === 2) return '';
  const kind = ORDER[i % ORDER.length];
  return raw(`<span class="decor decor-${kind}" aria-hidden="true">${DECOR[kind]}</span>`);
}

// Draws the trail behind the nodes of each unit's track (call after the path is on screen).
export function drawTrails(root) {
  root.querySelectorAll('.track').forEach((track) => {
    track.querySelector('.trail')?.remove();
    const box = track.getBoundingClientRect();
    const pts = [...track.querySelectorAll('.node')].map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    if (pts.length < 2) return;
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const my = (a.y + b.y) / 2;
      d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'trail');
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    svg.innerHTML = `<path d="${d}" class="trail-bed"/><path d="${d}" class="trail-stones"/>`;
    track.prepend(svg);
  });
}

// Garden scenery for the learning path: a stepping-stone trail between the lesson circles and
// little bonsai trees, zen stones, bushes and lanterns beside it, with pebbles and moss along its edges,
// and small streams crossed on stepping stones.
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
    const rows = [...track.querySelectorAll('.node-row')];
    const streams = rows.flatMap((row, i) => (row.classList.contains('stream-after') && pts[i + 1] ? [(pts[i].y + pts[i + 1].y) / 2] : []));
    // Water over the trail, so where they meet only the stepping stones show.
    svg.innerHTML = `<path d="${d}" class="trail-bed"/><path d="${d}" class="trail-stones"/>`
      + streams.map((y) => streamPath(y, box.width)).join('');
    const bed = svg.querySelector('.trail-bed');
    svg.insertAdjacentHTML('beforeend', edging(bed, box.width, pts, streams) + streams.map((y) => bridge(bed, y)).join(''));
    track.prepend(svg);
  });
}

// Same numbers on every redraw, so the pebbles don't jump around.
const noise = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Zen pebbles and moss tufts scattered along both edges of the trail.
function edging(path, width, nodes, streams = []) {
  const len = path.getTotalLength();
  const out = [];
  for (let at = 20, i = 0; at < len - 20; at += 12 + noise(i) * 14, i += 1) {
    const p = path.getPointAtLength(at);
    const q = path.getPointAtLength(Math.min(at + 1, len));
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const n = Math.hypot(dx, dy) || 1;
    const side = noise(i + 0.5) < 0.5 ? -1 : 1;
    const off = side * (28 + noise(i + 0.25) * 40);
    const x = p.x - (dy / n) * off;
    const y = p.y + (dx / n) * off;
    if (x < 8 || x > width - 8 || nodes.some((c) => Math.hypot(c.x - x, c.y - y) < 48)
      || streams.some((sy) => Math.abs(sy - y) < 24)) continue;
    out.push(noise(i + 0.75) < 0.55 ? pebbles(x, y, i) : moss(x, y, i));
  }
  return `<g class="edging">${out.join('')}</g>`;
}

function pebbles(x, y, i) {
  const count = 1 + Math.floor(noise(i + 0.1) * 3);
  let g = '';
  for (let k = 0; k < count; k++) {
    const rx = 4.5 + noise(i * 3 + k) * 4;
    const px = x + (k - (count - 1) / 2) * 11 + noise(i + k + 0.3) * 3;
    const py = y + (noise(i + k + 0.6) - 0.5) * 6;
    g += `<ellipse class="pebble pebble-${(i + k) % 3}" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.68).toFixed(1)}"/>`;
  }
  return g;
}

function moss(x, y, i) {
  const r = 7 + noise(i + 0.9) * 5;
  return `<g class="moss"><circle cx="${(x - r * 0.7).toFixed(1)}" cy="${(y + 1).toFixed(1)}" r="${(r * 0.75).toFixed(1)}" class="moss-dark"/>`
    + `<circle cx="${x.toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="${r.toFixed(1)}" class="moss-mid"/>`
    + `<circle cx="${(x + r * 0.8).toFixed(1)}" cy="${(y + 1.5).toFixed(1)}" r="${(r * 0.6).toFixed(1)}" class="moss-light"/></g>`;
}

// A gently winding stream right across the garden at height y.
function streamPath(y, width) {
  let d = `M-20 ${y}`;
  for (let x = -20, k = 0; x < width + 20; x += 60, k += 1) d += ` Q${x + 30} ${y + (k % 2 ? 7 : -7)} ${x + 60} ${y}`;
  return `<g class="stream"><path d="${d}" class="stream-bank"/><path d="${d}" class="stream-water"/><path d="${d}" class="stream-ripple"/></g>`;
}

// Where the trail meets a stream, it crosses on flat stepping stones in the water.
function bridge(path, y) {
  const len = path.getTotalLength();
  let lo = 0;
  let hi = len;
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).y < y) lo = mid;
    else hi = mid;
  }
  const sizes = [[11, 7], [13, 8], [12, 7.5]];
  const stones = [-16, 0, 16].map((d, i) => {
    const p = path.getPointAtLength(Math.min(len, Math.max(0, lo + d)));
    const [rx, ry] = sizes[i];
    const x = p.x + (i === 1 ? 3 : -2);
    return `<ellipse cx="${x.toFixed(1)}" cy="${(p.y + 3).toFixed(1)}" rx="${rx + 3}" ry="${ry + 2}" class="stone-ripple"/>
      <ellipse cx="${x.toFixed(1)}" cy="${(p.y + 2).toFixed(1)}" rx="${rx}" ry="${ry}" class="stone-side"/>
      <ellipse cx="${x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${rx - 1}" ry="${ry - 1.5}" class="stone-top"/>`;
  }).join('');
  return `<g class="bridge">${stones}</g>`;
}

// End of the path: a roadblock with cones and a 工事中 ("under construction") sign.
export const ROADBLOCK = `<svg class="roadblock" viewBox="0 0 220 150" role="img" aria-label="Road under construction">
  <defs><pattern id="rb-stripes" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="24" height="24" fill="#ff9600"/><rect width="12" height="24" fill="#fff"/></pattern></defs>
  <ellipse cx="110" cy="138" rx="100" ry="9" fill="rgba(0,0,0,.18)"/>
  <rect x="38" y="40" width="10" height="96" rx="3" fill="#9aa5ad"/><rect x="172" y="40" width="10" height="96" rx="3" fill="#9aa5ad"/>
  <rect x="30" y="128" width="26" height="8" rx="3" fill="#6b7780"/><rect x="164" y="128" width="26" height="8" rx="3" fill="#6b7780"/>
  <rect x="18" y="50" width="184" height="26" rx="6" fill="url(#rb-stripes)" stroke="#e08500" stroke-width="3"/>
  <rect x="18" y="88" width="184" height="22" rx="6" fill="url(#rb-stripes)" stroke="#e08500" stroke-width="3"/>
  <circle cx="43" cy="36" r="7" fill="#ffd23f"><animate attributeName="opacity" values="1;.25;1" dur="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="177" cy="36" r="7" fill="#ffd23f"><animate attributeName="opacity" values=".25;1;.25" dur="1.2s" repeatCount="indefinite"/></circle>
  <g transform="translate(86 8)"><rect width="48" height="30" rx="5" fill="#fff" stroke="#e5484d" stroke-width="3"/>
    <text x="24" y="21" text-anchor="middle" font-size="15" font-weight="800" fill="#e5484d" font-family="'M PLUS Rounded 1c', sans-serif">工事中</text></g>
  <g transform="translate(2 100)"><path d="M10 36 16 4h6l6 32z" fill="#ff9600"/><path d="M12 26h14l1 5H11z" fill="#fff"/><rect x="4" y="34" width="30" height="5" rx="2" fill="#e08500"/></g>
  <g transform="translate(184 100)"><path d="M10 36 16 4h6l6 32z" fill="#ff9600"/><path d="M12 26h14l1 5H11z" fill="#fff"/><rect x="4" y="34" width="30" height="5" rx="2" fill="#e08500"/></g>
</svg>`;

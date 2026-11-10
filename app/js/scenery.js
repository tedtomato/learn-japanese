// Garden scenery for the learning path: a stepping-stone trail between the lesson circles and
// little trees, stones, bushes and landmarks beside it (bonsai and lanterns for Japanese, a pagoda and bamboo
// for Chinese, lavender and a tower for French, olive trees and a fountain for Spanish, a phone box and
// hedges for English), with pebbles and moss along its edges, and small streams crossed on stepping stones.
import { raw } from './dom.js';
import { L } from './lang.js';

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
  // ---- Chinese: bamboo, a small pagoda, round red lanterns ----
  bamboo: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="59" rx="20" ry="3.5" fill="rgba(0,0,0,.1)"/>
    ${[[20, 22], [32, 8], [44, 18]].map(([x, top]) => `<rect x="${x - 3}" y="${top}" width="6" height="${58 - top}" rx="3" fill="#58a700"/><rect x="${x - 3.5}" y="${top + 12}" width="7" height="2.5" rx="1" fill="#3f7d00"/><rect x="${x - 3.5}" y="${top + 28}" width="7" height="2.5" rx="1" fill="#3f7d00"/>`).join('')}
    <path d="M23 24q10-4 14 0q-8 3-14 0zM35 12q9-6 14-2q-8 5-14 2zM41 22q8-3 12 2q-8 2-12-2z" fill="#7ae034"/></svg>`,
  pagoda: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,.12)"/>
    <rect x="22" y="48" width="20" height="11" fill="#c0392b"/><rect x="29" y="52" width="6" height="7" fill="#7b241c"/>
    <path d="M12 48 32 40l20 8z" fill="#8b5a2b"/><rect x="25" y="34" width="14" height="8" fill="#c0392b"/>
    <path d="M16 36 32 29l16 7z" fill="#8b5a2b"/><rect x="28" y="22" width="8" height="7" fill="#c0392b"/>
    <path d="M20 24 32 17l12 7z" fill="#8b5a2b"/><rect x="31" y="8" width="2" height="9" fill="#d4a017"/><circle cx="32" cy="8" r="2.5" fill="#ffd23f"/></svg>`,
  redlantern: `<svg viewBox="0 0 64 64"><rect x="31" y="6" width="2" height="12" fill="#6b4a2f"/><rect x="26" y="16" width="12" height="4" rx="1.5" fill="#d4a017"/>
    <g class="lamp"><ellipse cx="32" cy="34" rx="15" ry="15" fill="#e5322d"/><ellipse cx="32" cy="34" rx="8" ry="15" fill="#f0524b"/><path d="M32 19v30" stroke="#b8211d" stroke-width="1.5"/></g>
    <rect x="26" y="48" width="12" height="4" rx="1.5" fill="#d4a017"/><path d="M32 52v8M29 52l-1 7M35 52l1 7" stroke="#e5322d" stroke-width="2" stroke-linecap="round"/></svg>`,
  // ---- French: lavender, a tower silhouette, a street lamp, a café table ----
  lavender: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="59" rx="22" ry="3.5" fill="rgba(0,0,0,.1)"/>
    ${[14, 24, 34, 44, 52].map((x, i) => `<path d="M${x} 58V${30 + (i % 2) * 6}" stroke="#58a700" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="${x}" cy="${24 + (i % 2) * 6}" rx="4" ry="11" fill="${i % 2 ? '#a77bd8' : '#8e5fc9'}"/>`).join('')}</svg>`,
  tower: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,.12)"/>
    <path d="M32 4 26 26 22 40 14 58h8l4-10h12l4 10h8L42 40 38 26z" fill="#6b7780"/><path d="M26 48h12M24 38h16M28 26h8" stroke="#9aa5ad" stroke-width="2.5"/>
    <path d="M26 58c0-8 3-12 6-12s6 4 6 12z" fill="#131f24" opacity=".35"/></svg>`,
  streetlamp: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="14" ry="3" fill="rgba(0,0,0,.12)"/><rect x="29" y="22" width="6" height="36" rx="2" fill="#6b7780"/>
    <rect x="24" y="52" width="16" height="7" rx="2" fill="#6b7780"/><path d="M32 26q-14 0-14-12" stroke="#6b7780" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g class="lamp"><path d="M12 14h12l-2 9H14z" fill="#ffd23f"/></g><rect x="11" y="10" width="14" height="4" rx="2" fill="#6b7780"/></svg>`,
  cafe: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="22" ry="3.5" fill="rgba(0,0,0,.12)"/><ellipse cx="32" cy="34" rx="18" ry="5" fill="#c0392b"/><rect x="30" y="36" width="4" height="20" fill="#2f3a40"/>
    <rect x="22" y="55" width="20" height="4" rx="2" fill="#2f3a40"/><path d="M26 22h12l-2 10H28z" fill="#fff" stroke="#c0392b" stroke-width="1.5"/><path d="M38 24q5 0 5 4t-5 3" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <path d="M30 18q-2-3 0-5M34 18q-2-3 0-5" stroke="#9aa5ad" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  // ---- Spanish: an olive tree, a tiled fountain, the sun ----
  olive: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,.1)"/>
    <path d="M30 58c0-10-2-14-6-22M34 58c0-12 2-18 8-26M32 58V34" stroke="#7a5a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="22" cy="30" rx="12" ry="8" fill="#7d9a5a"/><ellipse cx="44" cy="26" rx="13" ry="8" fill="#6f8c4e"/><ellipse cx="32" cy="18" rx="14" ry="8" fill="#8aa866"/>
    <circle cx="26" cy="34" r="2" fill="#3d4a2a"/><circle cx="46" cy="31" r="2" fill="#3d4a2a"/><circle cx="36" cy="24" r="2" fill="#3d4a2a"/></svg>`,
  fountain: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="24" ry="4" fill="rgba(0,0,0,.12)"/>
    <path d="M8 44h48l-5 14H13z" fill="#1c6fb5"/><path d="M8 44h48" stroke="#ffd23f" stroke-width="3"/><path d="M16 50h8M30 50h8M44 50h4M22 55h8M36 55h8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="29" y="28" width="6" height="16" fill="#e8e0d0"/><ellipse cx="32" cy="28" rx="12" ry="4" fill="#d6ccb8"/>
    <path d="M32 26q-10-10-14 2M32 26q10-10 14 2M32 26V12" stroke="#8fd3ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  sun: `<svg viewBox="0 0 64 64"><g class="rays" stroke="#ff9600" stroke-width="4" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => `<path d="M32 6v7" transform="rotate(${i * 45} 32 32)"/>`).join('')}</g>
    <circle cx="32" cy="32" r="14" fill="#ffc800"/><circle cx="32" cy="32" r="14" fill="none" stroke="#ff9600" stroke-width="2"/><circle cx="27" cy="30" r="1.8" fill="#8a4800"/><circle cx="37" cy="30" r="1.8" fill="#8a4800"/><path d="M27 36q5 4 10 0" stroke="#8a4800" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  // ---- English: a red phone box, a clipped hedge, a lamp post ----
  phonebox: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="16" ry="3" fill="rgba(0,0,0,.12)"/><rect x="18" y="12" width="28" height="46" rx="4" fill="#d42a2a"/>
    <path d="M18 14q14-8 28 0" fill="#b01f1f"/><rect x="22" y="18" width="20" height="30" fill="#8fd3ff" opacity=".85"/><path d="M32 18v30M22 28h20M22 38h20" stroke="#d42a2a" stroke-width="2"/>
    <rect x="22" y="50" width="20" height="5" fill="#b01f1f"/><rect x="26" y="9" width="12" height="4" rx="1" fill="#fff"/></svg>`,
  hedge: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="59" rx="24" ry="4" fill="rgba(0,0,0,.1)"/><rect x="8" y="30" width="48" height="28" rx="9" fill="#3f8f1f"/>
    <rect x="8" y="30" width="48" height="10" rx="5" fill="#58a700"/><circle cx="20" cy="46" r="2" fill="#ff9ec4"/><circle cx="40" cy="48" r="2" fill="#ffd23f"/><circle cx="30" cy="42" r="2" fill="#ff9ec4"/></svg>`,
  lamppost: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="12" ry="3" fill="rgba(0,0,0,.12)"/><rect x="29" y="22" width="6" height="36" rx="2" fill="#1f5f3f"/>
    <rect x="25" y="52" width="14" height="7" rx="2" fill="#1f5f3f"/><g class="lamp"><path d="M24 10h16l-3 12H27z" fill="#ffd23f"/></g><path d="M23 10h18l-9-7z" fill="#1f5f3f"/></svg>`,
};
// What each course puts beside its path, in this order (shared plants and stones, plus its own landmarks).
const ORDERS = {
  ja: ['bonsai', 'grass', 'stones', 'bush', 'lantern', 'grass', 'bonsai', 'bush', 'stones'],
  zh: ['bamboo', 'grass', 'pagoda', 'bush', 'redlantern', 'grass', 'bamboo', 'stones', 'redlantern'],
  fr: ['lavender', 'grass', 'tower', 'bush', 'streetlamp', 'cafe', 'lavender', 'bush', 'stones'],
  es: ['olive', 'grass', 'fountain', 'bush', 'sun', 'grass', 'olive', 'stones', 'fountain'],
  en: ['hedge', 'grass', 'phonebox', 'bush', 'lamppost', 'grass', 'hedge', 'stones', 'phonebox'],
};
const ORDER = ORDERS[L.code] || ORDERS.ja;

// A decoration for the given path position (some rows stay empty so it doesn't feel crowded).
export function decorFor(i) {
  if (i % 3 === 2) return '';
  const kind = ORDER[i % ORDER.length];
  return raw(`<span class="decor decor-${kind}" aria-hidden="true">${DECOR[kind]}</span>`);
}

// The trail as a polyline of its cubic segments, so points along it come from arithmetic instead of the
// browser's getPointAtLength (which cost ~350 ms per redraw). 64 samples per segment keeps it within about a pixel.
const SAMPLES = 64;
function trailCurve(pts) {
  const xs = [pts[0].x];
  const ys = [pts[0].y];
  const cum = [0];
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const my = (a.y + b.y) / 2;
    d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
    for (let k = 1; k <= SAMPLES; k++) {
      const t = k / SAMPLES;
      const u = 1 - t;
      // Control points (a.x, my) and (b.x, my): the x and y polynomials of the cubic.
      const x = u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x;
      const y = u * u * u * a.y + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * b.y;
      const n = xs.length - 1;
      cum.push(cum[n] + Math.hypot(x - xs[n], y - ys[n]));
      xs.push(x);
      ys.push(y);
    }
  }
  const total = cum[cum.length - 1];
  // Point at arc length s (clamped), linear between samples.
  const at = (s) => {
    if (s <= 0) return { x: xs[0], y: ys[0] };
    if (s >= total) return { x: xs[xs.length - 1], y: ys[ys.length - 1] };
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= s) lo = mid;
      else hi = mid;
    }
    const f = (s - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
    return { x: xs[lo] + (xs[hi] - xs[lo]) * f, y: ys[lo] + (ys[hi] - ys[lo]) * f };
  };
  return { d, total, at };
}

// Draws the trail behind the nodes of each unit's track (call after the path is on screen).
// All layout reads happen first, then the SVGs are written, so the browser lays out once. A track whose
// size and node positions did not change keeps its trail (the second call after fonts load is then free).
export function drawTrails(root) {
  const jobs = [...root.querySelectorAll('.track')].map((track) => {
    const box = track.getBoundingClientRect();
    const pts = [...track.querySelectorAll('.node')].map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    const rows = [...track.querySelectorAll('.node-row')].map((row) => row.classList.contains('stream-after'));
    const sig = `${box.width.toFixed(1)}x${box.height.toFixed(1)}|${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}|${rows.map((r) => (r ? 1 : 0)).join('')}`;
    return { track, box, pts, rows, sig };
  });
  for (const { track, box, pts, rows, sig } of jobs) {
    if (track.__trailSig === sig && track.querySelector('.trail')) continue;
    track.querySelector('.trail')?.remove();
    track.__trailSig = sig;
    if (pts.length < 2) continue;
    const curve = trailCurve(pts);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'trail');
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    const streams = rows.flatMap((after, i) => (after && pts[i + 1] ? [(pts[i].y + pts[i + 1].y) / 2] : []));
    // Water over the trail, so where they meet only the stepping stones show.
    svg.innerHTML = `<path d="${curve.d}" class="trail-bed"/><path d="${curve.d}" class="trail-stones"/>`
      + streams.map((y) => streamPath(y, box.width)).join('')
      + edging(curve, box.width, pts, streams) + streams.map((y) => bridge(curve, y)).join('');
    track.prepend(svg);
  }
}

// Same numbers on every redraw, so the pebbles don't jump around.
const noise = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Zen pebbles and moss tufts scattered along both edges of the trail.
function edging(path, width, nodes, streams = []) {
  const len = path.total;
  const out = [];
  for (let at = 20, i = 0; at < len - 20; at += 12 + noise(i) * 14, i += 1) {
    const p = path.at(at);
    const q = path.at(Math.min(at + 1, len));
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
  const len = path.total;
  let lo = 0;
  let hi = len;
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2;
    if (path.at(mid).y < y) lo = mid;
    else hi = mid;
  }
  const sizes = [[11, 7], [13, 8], [12, 7.5]];
  const stones = [-16, 0, 16].map((d, i) => {
    const p = path.at(Math.min(len, Math.max(0, lo + d)));
    const [rx, ry] = sizes[i];
    const x = p.x + (i === 1 ? 3 : -2);
    return `<ellipse cx="${x.toFixed(1)}" cy="${(p.y + 3).toFixed(1)}" rx="${rx + 3}" ry="${ry + 2}" class="stone-ripple"/>
      <ellipse cx="${x.toFixed(1)}" cy="${(p.y + 2).toFixed(1)}" rx="${rx}" ry="${ry}" class="stone-side"/>
      <ellipse cx="${x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${rx - 1}" ry="${ry - 1.5}" class="stone-top"/>`;
  }).join('');
  return `<g class="bridge">${stones}</g>`;
}

// End of the path: a roadblock with cones and a "roadworks" sign in the course's language (工事中, 施工中, Travaux…).
// Japanese and Chinese use their own fonts; the Latin courses use the app font, never the Japanese one.
const SIGN_W = L.latin ? 80 : 48;
const SIGN_FONT = L.latin ? "'Nunito Sans', system-ui, sans-serif" : L.code === 'ja' ? "'M PLUS Rounded 1c', sans-serif" : "system-ui, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
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
  <g transform="translate(${110 - SIGN_W / 2} 8)"><rect width="${SIGN_W}" height="30" rx="5" fill="#fff" stroke="#e5484d" stroke-width="3"/>
    <text x="${SIGN_W / 2}" y="${L.latin ? 20 : 21}" text-anchor="middle" font-size="${L.latin ? 13 : 15}" font-weight="800" fill="#e5484d" font-family="${SIGN_FONT}">${L.roadworks}</text></g>
  <g transform="translate(2 100)"><path d="M10 36 16 4h6l6 32z" fill="#ff9600"/><path d="M12 26h14l1 5H11z" fill="#fff"/><rect x="4" y="34" width="30" height="5" rx="2" fill="#e08500"/></g>
  <g transform="translate(184 100)"><path d="M10 36 16 4h6l6 32z" fill="#ff9600"/><path d="M12 26h14l1 5H11z" fill="#fff"/><rect x="4" y="34" width="30" height="5" rx="2" fill="#e08500"/></g>
</svg>`;

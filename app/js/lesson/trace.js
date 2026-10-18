// Trace a character stroke by stroke. Round 1 is guided (outline, start dot and dashed arrow);
// round 2 (kana) is from memory with only a faint outline. A stroke counts when it starts near
// the stroke's start, ends near its end and follows its shape — so order and direction matter.
import { STROKES } from '../content/strokes.js';
import { sfx, buzz } from '../audio.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

export function mountTrace(host, char, { rounds = 2, onDone, onProgress } = {}) {
  const paths = STROKES[char] || [];
  const svg = el('svg', { viewBox: '0 0 109 109', class: 'trace-svg' });
  svg.append(
    el('path', { d: 'M54.5 4v101M4 54.5h101', class: 'trace-grid' }),
    el('rect', { x: 2, y: 2, width: 105, height: 105, rx: 10, class: 'trace-frame' }),
  );
  const outline = el('g', { class: 'trace-outline' });
  const done = el('g', { class: 'trace-done' });
  const guide = el('g', { class: 'trace-guide' });
  const ink = el('path', { class: 'trace-ink', d: '' });
  svg.append(outline, done, guide, ink);
  const strokeEls = paths.map((d) => {
    const p = el('path', { d });
    outline.append(p);
    return p;
  });
  host.replaceChildren(svg);

  let round = 1;
  let index = 0;
  let fails = 0;
  let points = [];
  let drawing = false;
  let locked = true;

  const len = (p) => p.getTotalLength();
  const at = (p, t) => p.getPointAtLength(t);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function animateStroke(d, cls, ms = 600) {
    const p = el('path', { d, class: cls });
    done.append(p);
    const L = p.getTotalLength();
    p.style.strokeDasharray = `${L}`;
    p.style.strokeDashoffset = `${L}`;
    p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
    return new Promise((r) => setTimeout(r, ms + 60)).then(() => p);
  }

  async function demo() {
    locked = true;
    host.dataset.stage = 'watch';
    done.replaceChildren();
    for (const d of paths) {
      const p = await animateStroke(d, 'trace-demo', 520);
      p.classList.add('faded');
    }
    await new Promise((r) => setTimeout(r, 300));
    done.replaceChildren();
    startRound();
  }

  function startRound() {
    index = 0;
    done.replaceChildren();
    host.dataset.stage = round === 1 ? 'guided' : 'memory';
    outline.classList.toggle('faint', round > 1);
    locked = false;
    showGuide();
    onProgress?.({ round, rounds, index, total: paths.length });
  }

  function showGuide() {
    guide.replaceChildren();
    if (index >= paths.length) return;
    if (round > 1) return; // from memory: no hints
    const p = strokeEls[index];
    const start = at(p, 0);
    const hi = el('path', { d: paths[index], class: 'trace-current' });
    const arrow = el('path', { d: paths[index], class: 'trace-arrow' });
    guide.append(hi, arrow, el('circle', { cx: start.x, cy: start.y, r: 5.5, class: 'trace-start' }));
  }

  function toLocal(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function judge() {
    const p = strokeEls[index];
    const L = len(p);
    if (points.length < 2) return false;
    const drawn = points.slice(1).reduce((s, q, i) => s + dist(q, points[i]), 0);
    if (drawn < Math.max(6, L * 0.4)) return false;
    if (dist(points[0], at(p, 0)) > 20 || dist(points[points.length - 1], at(p, L)) > 22) return false;
    const samples = 24;
    let hits = 0;
    for (let i = 0; i <= samples; i++) {
      const q = at(p, (L * i) / samples);
      if (points.some((u) => dist(u, q) < 16)) hits += 1;
    }
    return hits / (samples + 1) >= 0.75;
  }

  async function accept() {
    sfx('stroke');
    await animateStroke(paths[index], 'trace-good', 160);
    index += 1;
    fails = 0;
    onProgress?.({ round, rounds, index, total: paths.length });
    if (index < paths.length) return showGuide();
    guide.replaceChildren();
    if (round < rounds) {
      round += 1;
      locked = true;
      setTimeout(startRound, 600);
    } else {
      locked = true;
      onDone?.({ perfect: true });
    }
  }

  async function reject() {
    fails += 1;
    buzz(40);
    host.classList.add('shake');
    setTimeout(() => host.classList.remove('shake'), 380);
    locked = true;
    const p = await animateStroke(paths[index], 'trace-hint', 520);
    setTimeout(() => p.remove(), 250);
    locked = false;
    if (fails >= 3) accept(); // show it and move on rather than getting stuck
  }

  svg.addEventListener('pointerdown', (e) => {
    if (locked || index >= paths.length) return;
    drawing = true;
    svg.setPointerCapture(e.pointerId);
    points = [toLocal(e)];
    ink.setAttribute('d', `M${points[0].x} ${points[0].y}`);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const q = toLocal(e);
    points.push(q);
    ink.setAttribute('d', `${ink.getAttribute('d')} L${q.x} ${q.y}`);
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    ink.setAttribute('d', '');
    if (judge()) accept();
    else reject();
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  demo();
  return { replay: demo, strokeCount: paths.length };
}

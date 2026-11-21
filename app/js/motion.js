// Motion helpers shared by the lesson player, the path and the celebrations.
// Rules: transform / opacity only, 150–450 ms for interactions, never blocks input, and nothing moves
// when the learner asked for reduced motion (colour and opacity changes still say what happened).

export const SPRING = 'cubic-bezier(.34,1.56,.64,1)'; // keep in step with --ease-spring in app.css
export const SPRING_BIG = 'cubic-bezier(.2,1.4,.4,1)'; // a wilder overshoot, for the moments that should feel like a game (--ease-bounce)
export const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
export const EASE_IN_OUT = 'cubic-bezier(.65,0,.35,1)';

// True when the learner (or the phone) asked for less motion: the OS "reduce motion" switch, or the app's own
// Animations: Calm setting (app.js puts the `calm` class on <html>). Safe without a browser (tests).
export function reduced() {
  try {
    if (globalThis.document?.documentElement?.classList.contains('calm')) return true;
    return !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// Ease-out cubic: fast start, soft landing.
export const easeOut = (p) => 1 - (1 - Math.min(1, Math.max(0, p))) ** 3;
// The number shown `p` (0..1) of the way through a count-up.
export const countAt = (from, to, p) => Math.round(from + (to - from) * easeOut(p));

// Adds a class that plays a CSS animation, and removes it again when the animation ends (so it can be replayed).
export function pop(el, cls = 'pop', ms = 700) {
  if (!el) return el;
  el.classList.remove(cls);
  void el.offsetWidth; // restart the animation
  el.classList.add(cls);
  if (reduced()) {
    // The CSS rule kills the animation, so animationend may never fire.
    setTimeout(() => el.classList.remove(cls), 50);
    return el;
  }
  const done = () => {
    el.classList.remove(cls);
    el.removeEventListener('animationend', onEnd);
    clearTimeout(timer);
  };
  const onEnd = (e) => {
    if (e.target === el) done();
  };
  el.addEventListener('animationend', onEnd);
  const timer = setTimeout(done, ms); // safety net: an animation that never ran (hidden tab) still cleans up
  return el;
}

// Counts the number in `el` from `from` to `to` over `ms`. format(n) → text. done() runs when the number lands
// (punch: the element also pops, a "scale punch" on the last digit). Returns a cancel function.
export function countUp(el, from, to, ms = 600, { delay = 0, format = String, done = null, punch = false } = {}) {
  if (!el) return () => {};
  if (reduced() || from === to || ms <= 0) {
    el.textContent = format(to);
    done?.();
    return () => {};
  }
  const land = () => {
    if (punch) pop(el, 'punch', 500);
    done?.();
  };
  el.textContent = format(from);
  let stopped = false;
  let timer = null;
  const frame = globalThis.requestAnimationFrame ? (f) => globalThis.requestAnimationFrame(f) : (f) => setTimeout(() => f(Date.now()), 16);
  const run = () => {
    const t0 = Date.now();
    const tick = () => {
      if (stopped) return;
      if (el.isConnected === false) return;
      const p = (Date.now() - t0) / ms;
      el.textContent = format(p >= 1 ? to : countAt(from, to, p));
      if (p < 1) frame(tick);
      else land();
    };
    tick();
  };
  if (delay > 0) timer = setTimeout(run, delay);
  else run();
  return () => {
    stopped = true;
    clearTimeout(timer);
    if (el.isConnected !== false) el.textContent = format(to);
  };
}

// The movement from one box to another: what a FLIP animation starts from. Null when it did not move.
export function flipDelta(first, last) {
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  return Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 ? null : { dx, dy };
}

// FLIP: measures `el`, runs fn() (which changes the layout and may return the element that now stands for `el`),
// then animates that element from where `el` was to where it is now, with the Web Animations API. Layout stays
// the source of truth (fill: 'none'). arc: the flight lifts by that many px half-way (a thrown tile, not a slide);
// spin: it turns by up to that many degrees on the way. Returns the Animation, or null when nothing moved / reduced motion.
export function flip(el, fn, { ms = 260, easing = 'cubic-bezier(.2,.95,.35,1.06)', settle = null, arc = 0, spin = 0 } = {}) {
  const first = el.getBoundingClientRect();
  const target = fn() || el;
  if (reduced() || !target?.animate) return null;
  const d = flipDelta(first, target.getBoundingClientRect());
  if (!d) return null;
  const frames = [{ transform: `translate(${d.dx}px, ${d.dy}px)` }];
  if (arc || spin) {
    const turn = spin ? (d.dx < 0 ? -spin : spin) : 0;
    frames.push({ transform: `translate(${d.dx / 2}px, ${d.dy / 2 - arc}px) rotate(${turn}deg)`, offset: 0.5 });
  }
  frames.push({ transform: 'none' });
  const anim = target.animate(frames, { duration: ms, easing, fill: 'none' });
  if (settle) anim.finished.then(() => pop(target, settle), () => {});
  return anim;
}

// FLIP for a whole set: elements matched by key (a data attribute) glide from their old place to their new one.
// snapshot() before the change, then play(snap, elements) after it.
export function snapshot(els, key = (e) => e.dataset.i) {
  return new Map(els.map((e) => [key(e), e.getBoundingClientRect()]));
}
export function playFrom(snap, els, key = (e) => e.dataset.i, opts = {}) {
  if (reduced()) return;
  for (const e of els) {
    const first = snap.get(key(e));
    const d = first && flipDelta(first, e.getBoundingClientRect());
    if (d && e.animate) e.animate([{ transform: `translate(${d.dx}px, ${d.dy}px)` }, { transform: 'none' }], { duration: opts.ms || 220, easing: opts.easing || EASE_OUT, fill: 'none' });
  }
}

// The task that was on screen leaves while the next one arrives: a faded copy slides away to the left and
// is removed again (input goes to the new task at once: the copy is inert and pointer-events none).
export function leaveGhost(body, ms = 120) {
  if (reduced() || !body?.firstElementChild || !body.animate) return;
  const r = body.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const ghost = body.cloneNode(true);
  ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  ghost.removeAttribute('id');
  ghost.className = 'lesson-body leave-ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  Object.assign(ghost.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0', pointerEvents: 'none', zIndex: '1' });
  (body.closest('.lesson') || document.body).append(ghost);
  const a = ghost.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-28px)' }], { duration: ms, easing: 'ease-in', fill: 'forwards' });
  const gone = () => ghost.remove();
  a.finished.then(gone, gone);
  setTimeout(gone, ms + 200);
}

// A whole-screen beat under everything else: 'good' is a green flash (0 → .18 → 0 in 220 ms), 'bad' a red
// vignette at the edges, 'combo' a green glow at the edges. Pointer events pass through; gone when it ends.
export function screenFlash(kind = 'good') {
  if (reduced() || typeof document === 'undefined') return;
  const el = document.createElement('i');
  el.className = `screen-flash ${kind}`;
  el.setAttribute('aria-hidden', 'true');
  document.body.append(el);
  const gone = () => el.remove();
  el.addEventListener('animationend', gone, { once: true });
  setTimeout(gone, 700);
}

// A ring of sparkles bursts out of `host` (the feedback bar at 5 in a row).
export function sparkleRing(host, n = 12) {
  if (reduced() || !host) return;
  const ring = document.createElement('span');
  ring.className = 'sparkle-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--a:${(i * 360) / n}deg;--d:${(i % 3) * 40}ms"></i>`).join('');
  host.append(ring);
  setTimeout(() => ring.remove(), 1000);
}

// The heart in the top bar breaks when one is lost: it swells, splits into two halves that fall apart and fade,
// while the real heart hides and then pops back (with one fewer in the counter).
export function crackHeart(stat) {
  if (reduced() || !stat) return;
  const svg = stat.querySelector('svg');
  if (!svg || !svg.animate) return;
  const r = svg.getBoundingClientRect();
  const s = stat.getBoundingClientRect();
  for (const side of ['l', 'r']) {
    const half = document.createElement('i');
    half.className = `heart-half ${side}`;
    half.setAttribute('aria-hidden', 'true');
    half.innerHTML = svg.outerHTML;
    Object.assign(half.style, { left: `${r.left - s.left}px`, top: `${r.top - s.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    stat.append(half);
    const dx = side === 'l' ? -7 : 7;
    const rot = side === 'l' ? -22 : 22;
    const a = half.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.3)', opacity: 1, offset: 0.3 },
      { transform: `translate(${dx}px, 12px) rotate(${rot}deg) scale(1)`, opacity: 0 },
    ], { duration: 520, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
    const gone = () => half.remove();
    a.finished.then(gone, gone);
  }
  svg.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: 560, fill: 'none' });
}

// Confetti bursts from a point inside `host` (percentages of its box): `n` pieces in three shapes, in `bursts`
// waves. Each piece is thrown out and falls back, turning as it goes, then is removed.
const CONFETTI = ['#ff4b4b', '#ffc800', '#58cc02', '#1cb0f6', '#ce82ff', '#ff9600'];
export function burstConfetti(host, { n = 80, bursts = 2, x = 50, y = 30, gap = 350, spread = 1 } = {}) {
  if (reduced() || !host || !host.animate) return;
  const layer = document.createElement('div');
  layer.className = 'burst';
  layer.setAttribute('aria-hidden', 'true');
  host.prepend(layer);
  const per = Math.ceil(n / bursts);
  let alive = 0;
  for (let b = 0; b < bursts; b++) {
    setTimeout(() => {
      if (!layer.isConnected) return;
      for (let i = 0; i < per; i++) {
        const p = document.createElement('i');
        p.className = `shape-${i % 3}`;
        p.style.background = CONFETTI[(i + b) % CONFETTI.length];
        p.style.left = `${x}%`;
        p.style.top = `${y}%`;
        layer.append(p);
        const angle = (Math.random() * 2 - 1) * Math.PI * 0.55 * spread; // mostly upwards
        const power = 140 + Math.random() * 220;
        const dx = Math.sin(angle) * power;
        const up = -Math.cos(angle) * power;
        const rot = (Math.random() * 2 - 1) * 720;
        const ms = 1300 + Math.random() * 700;
        alive += 1;
        const a = p.animate([
          { transform: 'translate(0, 0) rotate(0) scale(.6)', opacity: 1 },
          { transform: `translate(${dx * 0.75}px, ${up}px) rotate(${rot * 0.4}deg) scale(1.1)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${dx}px, ${up + 260}px) rotate(${rot}deg) scale(1)`, opacity: 1, offset: 0.85 },
          { transform: `translate(${dx * 1.05}px, ${up + 340}px) rotate(${rot * 1.1}deg) scale(.9)`, opacity: 0 },
        ], { duration: ms, easing: 'cubic-bezier(.2,.7,.5,1)', fill: 'forwards' });
        const gone = () => {
          p.remove();
          if (--alive === 0 && b === bursts - 1) layer.remove();
        };
        a.finished.then(gone, gone);
      }
    }, b * gap);
  }
  setTimeout(() => layer.remove(), bursts * gap + 2600);
  return layer;
}

// A number that rolls like a slot machine: `steps` stops between `from` and `to`, each one flicking in from
// below, the last one with a punch. Reduced motion writes the final number at once.
export function rollUp(el, from, to, ms = 700, { delay = 0, format = String, steps = 12 } = {}) {
  if (!el) return () => {};
  if (reduced() || from === to || !el.animate) {
    el.textContent = format(to);
    return () => {};
  }
  el.textContent = format(from);
  let stopped = false;
  const timers = [];
  const n = Math.max(1, Math.min(steps, Math.abs(to - from)));
  for (let k = 1; k <= n; k++) {
    // Steps bunch up at the end (ease-out), like a wheel slowing down.
    const p = easeOut(k / n);
    timers.push(setTimeout(() => {
      if (stopped || el.isConnected === false) return;
      const value = k === n ? to : countAt(from, to, k / n);
      el.textContent = format(value);
      el.animate([{ transform: 'translateY(55%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: Math.max(60, (ms / n) * 0.9), easing: EASE_OUT, fill: 'none' });
      if (k === n) pop(el, 'punch', 500);
    }, delay + p * ms));
  }
  return () => {
    stopped = true;
    timers.forEach(clearTimeout);
    if (el.isConnected !== false) el.textContent = format(to);
  };
}

// Scrolls the window to `y` over `ms` with an ease-in-out (the camera on the path). A touch, wheel or key stops
// it, so the learner is never fought. Resolves when it ends.
export function smoothScrollTo(y, ms = 600) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    const y0 = window.scrollY;
    const dy = y - y0;
    if (reduced() || Math.abs(dy) < 2 || ms <= 0) {
      window.scrollTo(0, y);
      return resolve();
    }
    let stopped = false;
    const stop = () => { stopped = true; };
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    evs.forEach((ev) => window.addEventListener(ev, stop, { passive: true, once: true }));
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
    const t0 = performance.now();
    const tick = (now) => {
      if (stopped) return finish();
      const p = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, y0 + dy * ease(p));
      if (p < 1) requestAnimationFrame(tick);
      else finish();
    };
    const finish = () => {
      evs.forEach((ev) => window.removeEventListener(ev, stop));
      resolve();
    };
    requestAnimationFrame(tick);
  });
}

// Gems fly from `from` (an element) to the gem counter in the top bar, one after another.
export function flyGems(from, target = document.querySelector('.stat-gems'), n = 6) {
  if (reduced() || !from || !target || !document.body.animate) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height / 2;
  const x1 = b.left + b.width / 2;
  const y1 = b.top + b.height / 2;
  for (let i = 0; i < n; i++) {
    const g = document.createElement('i');
    g.className = 'fly-gem';
    g.setAttribute('aria-hidden', 'true');
    const spread = (i - (n - 1) / 2) * 16;
    Object.assign(g.style, { left: `${x0}px`, top: `${y0}px` });
    document.body.append(g);
    const anim = g.animate([
      { transform: 'translate(-50%, -50%) scale(.4)', opacity: 0 },
      { transform: `translate(calc(-50% + ${spread}px), calc(-50% - 36px)) scale(1)`, opacity: 1, offset: 0.25 },
      { transform: `translate(calc(${x1 - x0}px - 50%), calc(${y1 - y0}px - 50%)) scale(.6)`, opacity: 1, offset: 0.92 },
      { transform: `translate(calc(${x1 - x0}px - 50%), calc(${y1 - y0}px - 50%)) scale(.2)`, opacity: 0 },
    ], { duration: 650, delay: i * 55, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'both' });
    const done = () => g.remove();
    anim.finished.then(done, done);
    if (i === n - 1) anim.finished.then(() => pop(target, 'bump'), () => {});
  }
}

// A button that is the only thing to do breathes gently once the learner has been idle for a while.
export function breathe(btn, idleMs = 4000) {
  if (!btn || reduced()) return () => {};
  let timer = setTimeout(on, idleMs);
  function on() {
    if (!btn.isConnected) return;
    btn.classList.add('breathe');
  }
  const reset = () => {
    btn.classList.remove('breathe');
    clearTimeout(timer);
    timer = setTimeout(on, idleMs);
  };
  const stop = () => {
    clearTimeout(timer);
    btn.classList.remove('breathe');
    for (const ev of ['pointerdown', 'keydown']) document.removeEventListener(ev, reset, true);
  };
  for (const ev of ['pointerdown', 'keydown']) document.addEventListener(ev, reset, true);
  btn.addEventListener('click', stop, { once: true });
  // Stops by itself once the button has left the page.
  const watch = setInterval(() => {
    if (!btn.isConnected) {
      clearInterval(watch);
      stop();
    }
  }, 1000);
  return stop;
}

// The bottom bar's active-tab pill slides from the tab that was active to the new one. The nav is redrawn on every
// route change, so this watches it and animates the fresh pill from the old place.
let lastPillLeft = null;
export function watchNav(nav = typeof document !== 'undefined' ? document.getElementById('nav') : null) {
  if (!nav || nav.__pill || typeof MutationObserver === 'undefined') return;
  nav.__pill = true;
  const sync = () => {
    const on = nav.querySelector('a.on');
    if (!on || !nav.getClientRects().length) return;
    if (!on.querySelector('.nav-pill')) on.insertAdjacentHTML('afterbegin', '<i class="nav-pill" aria-hidden="true"></i>');
    const left = on.getBoundingClientRect().left;
    const pill = on.querySelector('.nav-pill');
    if (lastPillLeft != null && Math.abs(lastPillLeft - left) > 1 && !reduced() && pill.animate) {
      pill.animate([{ transform: `translateX(${lastPillLeft - left}px)` }, { transform: 'none' }], { duration: 280, easing: SPRING, fill: 'none' });
    }
    lastPillLeft = left;
  };
  new MutationObserver(sync).observe(nav, { childList: true });
  sync();
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => watchNav());
  else watchNav();
}

// Every chunky button bounces back when it is released (the press itself is CSS :active). One listener for the
// whole app; the class plays a short keyframe and is removed again.
const PRESSABLE = '.btn:not(:disabled), .node:not([aria-disabled="true"]), .tile:not(.used), .option:not(:disabled):not(.selected), .match-btn:not(:disabled), .speaker, .say-inline, #nav a';
export function watchPresses(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__presses) return;
  doc.__presses = true;
  let pressed = null;
  doc.addEventListener('pointerdown', (e) => {
    pressed = e.target.closest?.(PRESSABLE) || null;
  }, { passive: true, capture: true });
  doc.addEventListener('pointerup', (e) => {
    const el = pressed;
    pressed = null;
    if (!el || reduced() || !el.isConnected) return;
    if (!el.contains(e.target) && el !== e.target) return;
    pop(el, 'released', 300);
  }, { passive: true, capture: true });
}
if (typeof document !== 'undefined') watchPresses();

// What the path should celebrate when the learner comes back from a lesson (set by the lesson player, read once
// by the Learn screen), and which unit banners have already slid in this session.
export const pathFx = { pending: null, unitsSeen: new Set() };

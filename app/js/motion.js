// Motion helpers shared by the lesson player, the path and the celebrations.
// Rules: transform / opacity only, 150–450 ms for interactions, never blocks input, and nothing moves
// when the learner asked for reduced motion (colour and opacity changes still say what happened).

export const SPRING = 'cubic-bezier(.34,1.56,.64,1)'; // keep in step with --ease-spring in app.css
export const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';

// True when the learner (or the phone) asked for less motion. Safe without a browser (tests).
export function reduced() {
  try {
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

// Counts the number in `el` from `from` to `to` over `ms`. format(n) → text. Returns a cancel function.
export function countUp(el, from, to, ms = 600, { delay = 0, format = String } = {}) {
  if (!el) return () => {};
  if (reduced() || from === to || ms <= 0) {
    el.textContent = format(to);
    return () => {};
  }
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
// the source of truth (fill: 'none'). Returns the Animation, or null when nothing moved / reduced motion.
export function flip(el, fn, { ms = 260, easing = 'cubic-bezier(.2,.95,.35,1.06)', settle = null } = {}) {
  const first = el.getBoundingClientRect();
  const target = fn() || el;
  if (reduced() || !target?.animate) return null;
  const d = flipDelta(first, target.getBoundingClientRect());
  if (!d) return null;
  const anim = target.animate([{ transform: `translate(${d.dx}px, ${d.dy}px)` }, { transform: 'none' }], { duration: ms, easing, fill: 'none' });
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

// What the path should celebrate when the learner comes back from a lesson (set by the lesson player, read once
// by the Learn screen), and which unit banners have already slid in this session.
export const pathFx = { pending: null, unitsSeen: new Set() };

// The pure parts of js/motion.js: the count-up curve, FLIP geometry and the reduced-motion check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easeOut, countAt, countUp, flipDelta, flip, reduced } from '../app/js/motion.js';

const withMedia = (matches, fn) => {
  const old = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches });
  try {
    return fn();
  } finally {
    if (old) globalThis.matchMedia = old;
    else delete globalThis.matchMedia;
  }
};

test('countUp eases out: fast start, exact ends, clamped', () => {
  assert.equal(easeOut(0), 0);
  assert.equal(easeOut(1), 1);
  assert.ok(easeOut(0.5) > 0.5, 'more than half done at half time');
  assert.equal(easeOut(2), 1);
  assert.equal(easeOut(-1), 0);
  assert.equal(countAt(0, 100, 0), 0);
  assert.equal(countAt(0, 100, 1), 100);
  assert.equal(countAt(10, 20, 0.5), 19);
  assert.equal(countAt(20, 10, 1), 10);
  let last = -1;
  for (let p = 0; p <= 1; p += 0.1) {
    const n = countAt(0, 50, p);
    assert.ok(n >= last, 'never goes backwards');
    last = n;
  }
});

test('countUp writes the final number at once when nothing would change or motion is reduced', () => {
  const el = { textContent: '', isConnected: true };
  countUp(el, 5, 5, 600);
  assert.equal(el.textContent, '5');
  withMedia(true, () => countUp(el, 0, 40, 600, { format: (n) => `${n}%` }));
  assert.equal(el.textContent, '40%');
});

test('countUp runs and ends on the target, and can be cancelled', async () => {
  const el = { textContent: '', isConnected: true };
  withMedia(false, () => countUp(el, 0, 30, 60));
  assert.equal(el.textContent, '0');
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(el.textContent, '30');
  const el2 = { textContent: '', isConnected: true };
  const cancel = withMedia(false, () => countUp(el2, 0, 99, 5000));
  cancel();
  assert.equal(el2.textContent, '99');
});

test('flip does nothing when the box did not move', () => {
  const rect = { left: 10, top: 20, width: 50, height: 40 };
  const calls = [];
  const el = { getBoundingClientRect: () => rect, animate: (...a) => calls.push(a) };
  assert.equal(flipDelta(rect, { ...rect }), null);
  assert.equal(flipDelta(rect, { ...rect, left: 10.3 }), null);
  assert.equal(withMedia(false, () => flip(el, () => el)), null);
  assert.equal(calls.length, 0);
});

test('flip animates from the old place to the new one, layout stays the source of truth', () => {
  let rect = { left: 10, top: 20 };
  const calls = [];
  const el = { getBoundingClientRect: () => rect, animate: (frames, opts) => (calls.push({ frames, opts }), { finished: Promise.resolve() }) };
  withMedia(false, () => flip(el, () => { rect = { left: 110, top: 70 }; }));
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].frames, [{ transform: 'translate(-100px, -50px)' }, { transform: 'none' }]);
  assert.equal(calls[0].opts.fill, 'none');
  assert.ok(calls[0].opts.duration >= 150 && calls[0].opts.duration <= 450);
});

test('flip is skipped when the learner asked for reduced motion', () => {
  let rect = { left: 0, top: 0 };
  const calls = [];
  const el = { getBoundingClientRect: () => rect, animate: (...a) => calls.push(a) };
  assert.equal(withMedia(true, () => flip(el, () => { rect = { left: 99, top: 99 }; })), null);
  assert.equal(calls.length, 0);
});

test('reduced() follows the media query and is false without one', () => {
  assert.equal(reduced(), false);
  assert.equal(withMedia(true, reduced), true);
  assert.equal(withMedia(false, reduced), false);
});

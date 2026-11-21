// The 2.5D mascot (js/mascot.js): every mood renders for the shiba and the panda with its layers, gradient ids are unique per
// instance and always resolve, the drawing stays light, and the live helpers are safe without a browser. Also the thunder
// combo (fx.js) and the energy meter (energy.js) outside a DOM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mascotSvg, MOODS, lookAt, setMood, followFinger } from '../app/js/mascot.js';
import { thunderCombo, comboBurst } from '../app/js/fx.js';
import { energyMeterHtml, pourEnergy, levelOf, TICKS } from '../app/js/energy.js';

const LAYERS = ['m-shadow', 'm-tail', 'm-body', 'm-paws', 'm-head', 'm-ears', 'ear-l', 'ear-r', 'm-face', 'm-features', 'm-brows', 'm-eyes', 'm-muzzle', 'm-mouth'];
const ids = (svg) => [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const refs = (svg) => [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
// Drawn elements: everything but the containers and the gradient plumbing.
const drawn = (svg) => (svg.match(/<(?!\/|svg|g\b|defs|stop|linearGradient|radialGradient)[a-zA-Z]+/g) || []).length;

test('every mood renders for both mascots with its layers, and the old pose hooks', () => {
  for (const mood of MOODS) for (const panda of [false, true]) {
    const svg = mascotSvg(mood, 96, panda);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>') && svg.includes(`mood-${mood}`), `${mood} ${panda}`);
    assert.ok(svg.includes('viewBox="0 0 120 120"') && svg.includes('aria-hidden="true"'));
    for (const c of LAYERS) assert.ok(svg.includes(`class="${c}"`) || svg.includes(` ${c}"`) || svg.includes(`"${c} `), `${mood} ${panda ? 'panda' : 'shiba'} has .${c}`);
    assert.ok(svg.includes('class="shadow"') && svg.includes('dog-eyes'), 'the shadow and blink hooks stay');
    assert.ok(svg.includes('<radialGradient') && svg.includes('<linearGradient'), 'shaded with gradients');
    assert.ok(drawn(svg) <= 40, `${mood} ${panda ? 'panda' : 'shiba'} draws ${drawn(svg)} elements`);
    assert.equal((svg.match(/<filter/g) || []).length, 0, 'no filters');
  }
  assert.ok(mascotSvg('cool', 80).includes('class="shades"') && mascotSvg('party', 80).includes('class="hat"') && mascotSvg('trophy', 80).includes('class="cup"') && mascotSvg('sleepy', 80).includes('class="zzz"'));
  assert.ok(mascotSvg('nonsense', 80).includes('mood-happy'), 'an unknown mood falls back to happy');
});

test('gradient ids are unique per instance and every fill resolves inside its own svg', () => {
  const a = mascotSvg('happy', 96, false);
  const b = mascotSvg('happy', 96, false);
  const c = mascotSvg('cheer', 96, true);
  const ia = new Set(ids(a));
  assert.ok(ia.size > 0 && ids(b).every((id) => !ia.has(id)), 'two instances never share an id');
  for (const svg of [a, b, c]) {
    const own = new Set(ids(svg));
    assert.ok(refs(svg).length > 5);
    for (const r of refs(svg)) assert.ok(own.has(r), `${r} is defined in this svg`);
  }
});

test('lookAt, setMood and followFinger are no-ops without a DOM or a usable element', () => {
  assert.doesNotThrow(() => lookAt(null, 10, 10));
  assert.doesNotThrow(() => lookAt({}, 10, 10));
  assert.equal(setMood(null, 'cheer'), null);
  const fake = { getAttribute: () => '96', classList: { contains: () => false } };
  assert.equal(setMood(fake, 'cheer'), fake, 'without document the element is returned untouched');
  assert.doesNotThrow(() => followFinger(null));
  // A minimal element: the vars land in −1..1 and data-look says which way.
  const vars = {};
  const el = {
    style: { setProperty: (k, v) => { vars[k] = v; }, removeProperty: (k) => { delete vars[k]; } },
    dataset: {},
    getBoundingClientRect: () => ({ left: 100, top: 100, width: 100, height: 100 }),
  };
  lookAt(el, 400, 150);
  assert.equal(vars['--lx'], '1.00');
  assert.equal(el.dataset.look, 'right');
  lookAt(el, { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 40 }) });
  assert.ok(Number(vars['--lx']) < 0 && Number(vars['--ly']) < 0);
  assert.equal(el.dataset.look, 'left');
  lookAt(el, 150, -400);
  assert.equal(el.dataset.look, 'up');
  lookAt(el);
  assert.equal(vars['--lx'], undefined);
  assert.equal(el.dataset.look, undefined);
});

test('thunderCombo exists and does nothing without a DOM', () => {
  assert.equal(typeof thunderCombo, 'function');
  assert.equal(typeof comboBurst, 'function');
  assert.equal(thunderCombo(5), undefined);
});

test('energy meter: progressbar role and values, ticks lit up to the level, flat without a DOM', () => {
  const h = energyMeterHtml(40, 100);
  assert.ok(h.includes('role="progressbar"') && h.includes('aria-valuenow="40"') && h.includes('aria-valuemax="100"'));
  assert.ok(h.includes('--lvl:0.4000') && h.includes('class="wave wave-a"') && h.includes('class="wave wave-b"'));
  assert.equal((h.match(/class="lit"/g) || []).length, 2, '20 and 40 are lit at 40%');
  assert.deepEqual(TICKS, [20, 40, 60, 80]);
  assert.equal(levelOf(150, 100), 1);
  assert.equal(levelOf(0, 0), 0);
  assert.ok(energyMeterHtml(120, 100).includes('aria-valuenow="100"') && energyMeterHtml(120, 100).includes('class="energy full"'));
  // Two meters never share a gradient id.
  const a = h.match(/id="([^"]+)"/)[1];
  const b = energyMeterHtml(40, 100).match(/id="([^"]+)"/)[1];
  assert.notEqual(a, b);
  assert.equal(typeof pourEnergy(null, 0, 10, 100), 'function');
});

// Accessibility checks that need no browser: the colour tokens of both themes (contrast of the pairs that carry
// text), the lesson's keyboard guards, and the settings helpers.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, lessonKeyIgnored, shortcutsEnabled, listeningMode, isControl } from '../app/js/a11y.js';

const css = readFileSync(new URL('../app/css/app.css', import.meta.url), 'utf8');

// The custom properties declared in the first block that starts with `selector`.
function tokens(selector, from = 0) {
  const start = css.indexOf(selector, from);
  assert.ok(start >= 0, `${selector} not found`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start));
  const out = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[name] = value;
  return out;
}
const light = tokens(':root {');
const dark = { ...light, ...tokens(":root[data-theme='dark'] {") };

// [foreground, background, minimum ratio, what it is]
const AA = 4.5;
const PAIRS = [
  ['text', 'bg', AA, 'body text'], ['text', 'card', AA, 'text on cards'], ['text-strong', 'card', AA, 'headings'],
  ['muted', 'bg', AA, 'muted text'], ['muted', 'card', AA, 'muted text on cards'], ['muted', 'card-2', AA, 'muted on chips'],
  ['green-text', 'green-soft', AA, 'right-answer text'], ['green-text', 'card', AA, 'green text on cards'], ['green-text', 'bg', AA, 'green text'],
  ['blue-text', 'blue-soft', AA, 'selected option text'], ['blue-text', 'card', AA, 'blue text on cards'], ['blue-text', 'bg', AA, 'links'],
  ['gold-text', 'gold-soft', AA, 'gold pill'], ['gold-text', 'card', AA, 'gold text'],
  ['orange-text', 'orange-soft', AA, 'orange pill'], ['orange-text', 'card', AA, 'orange text (streak)'],
  ['red-text', 'red-soft', AA, 'wrong-answer text'], ['red-text', 'card', AA, 'red text'], ['red-text', 'bg', AA, 'late timer'],
  ['purple-text', 'purple-soft', AA, 'purple pill'],
  // Buttons and banners with white text.
  ['white', 'green-btn', AA, 'primary button'], ['white', 'blue-btn', AA, 'secondary button'], ['white', 'red-btn', AA, 'danger button'],
  ['white', 'orange-btn', AA, 'orange badge'], ['white', 'purple-btn', AA, 'purple banner'], ['on-gold', 'gold', AA, 'gold banner'],
  // Not text, but things that must be seen: icons, the disabled label, the focus ring.
  ['faint', 'card', 3, 'icons and dim labels'], ['muted', 'disabled', 3, 'disabled button label'],
  ['focus', 'bg', 3, 'focus ring'], ['focus', 'card', 3, 'focus ring on cards'],
];

for (const [name, theme] of [['light', light], ['dark', dark]]) {
  test(`${name} theme: colour pairs reach their contrast`, () => {
    const colour = (token) => (token === 'white' ? '#ffffff' : theme[token]);
    const failures = [];
    for (const [fg, bg, min, what] of PAIRS) {
      // White-on-colour buttons are the same in both themes (the darker dark-theme card colours do not matter there).
      const a = colour(fg);
      const b = colour(bg);
      assert.ok(a && b, `token missing for ${fg} on ${bg}`);
      const ratio = contrast(a, b);
      if (ratio < min) failures.push(`${what}: ${fg} ${a} on ${bg} ${b} = ${ratio.toFixed(2)} (needs ${min})`);
    }
    assert.deepEqual(failures, []);
  });
}

test('the reduced-motion rule stops animations and transitions', () => {
  const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce) {\n  *'));
  assert.match(block, /animation-duration: \.01ms !important/);
  assert.match(block, /animation-iteration-count: 1 !important/);
  assert.match(block, /transition-duration: \.01ms !important/);
});

test('type sizes are rem and the page respects the reader\'s text size', () => {
  assert.doesNotMatch(css, /text-size-adjust/);
  assert.match(css, /html \{ font-size: 100%; \}/);
  assert.equal([...css.matchAll(/font-size:\s*[\d.]+px/g)].length, 0, 'font sizes should be in rem');
});

test('lesson keys are ignored while a dialog is open, in controls, and when already handled', () => {
  const key = (over = {}) => ({ key: 'Enter', target: { tagName: 'BODY' }, ...over });
  assert.equal(lessonKeyIgnored(key()), false);
  assert.equal(lessonKeyIgnored(key(), { modalOpen: true }), true, 'dialog open');
  assert.equal(lessonKeyIgnored(key(), { sheetOpen: true }), true, 'explain sheet open');
  assert.equal(lessonKeyIgnored(key({ target: { tagName: 'BUTTON' } })), true, 'Enter on "Keep learning" must not also check the answer');
  assert.equal(lessonKeyIgnored(key({ target: { tagName: 'INPUT' } })), true);
  assert.equal(lessonKeyIgnored(key({ target: { tagName: 'TEXTAREA' } })), true);
  assert.equal(lessonKeyIgnored(key({ defaultPrevented: true })), true);
  assert.equal(lessonKeyIgnored(key({ ctrlKey: true })), true);
  assert.equal(isControl({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(isControl({ tagName: 'DIV' }), false);
});

test('number-key shortcuts: on by default only with a fine pointer, then the setting decides', () => {
  assert.equal(shortcutsEnabled({}, true), true);
  assert.equal(shortcutsEnabled({}, false), false);
  assert.equal(shortcutsEnabled({ keys: false }, true), false);
  assert.equal(shortcutsEnabled({ keys: true }, false), true);
});

test('listening tasks setting: on, off or show text', () => {
  assert.equal(listeningMode({}), 'on');
  assert.equal(listeningMode({ listening: 'off' }), 'off');
  assert.equal(listeningMode({ listening: 'text' }), 'text');
  assert.equal(listeningMode({ listening: 'nonsense' }), 'on');
});

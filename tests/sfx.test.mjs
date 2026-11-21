// The designed sound effects: every name has a small MP3, the renders peak at -1 dBFS, sfx() ignores unknown names.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { SFX_NAMES, SFX_ALIASES, sfx, buzz, HAPTIC } from '../app/js/audio.js';
import { SFX_NAMES as DESIGNED, render, maxSeconds, SR, PEAK } from '../scripts/sfx.mjs';

const dir = new URL('../app/sfx/', import.meta.url);

test('every sound has an MP3: not empty, at most 60 KB, 300 KB in all', () => {
  let total = 0;
  for (const name of SFX_NAMES) {
    const size = statSync(new URL(`${name}.mp3`, dir)).size;
    assert.ok(size > 0 && size <= 60 * 1024, `${name}: ${size} bytes`);
    total += size;
  }
  assert.ok(total <= 300 * 1024, `total ${total} bytes`);
  assert.deepEqual(readdirSync(dir).filter((f) => f.endsWith('.mp3')).sort(), SFX_NAMES.map((n) => `${n}.mp3`).sort(), 'no stray files');
  for (const name of SFX_NAMES) assert.equal(readFileSync(new URL(`${name}.mp3`, dir)).subarray(0, 3).toString('latin1') === 'ID3' || readFileSync(new URL(`${name}.mp3`, dir))[0] === 0xff, true, `${name} looks like an MP3`);
});

test('the player and the sound designer agree on the names; old names are aliases', () => {
  assert.deepEqual([...SFX_NAMES].sort(), [...DESIGNED].sort());
  for (const [old, now] of Object.entries(SFX_ALIASES)) assert.ok(SFX_NAMES.includes(now), `${old} -> ${now}`);
});

test('renders are clean, peak at -1 dBFS and stay short', () => {
  for (const name of DESIGNED) {
    const x = render(name);
    let peak = 0;
    for (const v of x) {
      assert.ok(Number.isFinite(v), `${name} has a non-finite sample`);
      peak = Math.max(peak, Math.abs(v));
    }
    assert.ok(peak <= PEAK + 1e-6 && peak > PEAK - 0.01, `${name} peak ${peak}`);
    assert.ok(x.length / SR <= maxSeconds(name) + 0.001 && x.length / SR >= 0.03, `${name} is ${x.length / SR} s`);
    assert.deepEqual(render(name), x, `${name} renders the same every time`);
  }
});

test('sfx() with an unknown name does nothing, and without a browser nothing throws', () => {
  assert.equal(sfx('no-such-sound'), undefined);
  assert.doesNotThrow(() => { sfx('tap'); sfx('bonus'); buzz(HAPTIC.tap); buzz(HAPTIC.combo10); });
});

test('haptic patterns', () => {
  assert.deepEqual(HAPTIC.correct, [18, 30, 28]);
  assert.deepEqual(HAPTIC.wrong, [70, 40, 90]);
  assert.equal(HAPTIC.tap, 8);
  assert.equal(HAPTIC.levelup, 35);
  assert.equal(HAPTIC.combo10.length, 13);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { pickCelebration, celebrations, celebrationHtml } from '../app/js/celebrate.js';
import { toneOf } from '../app/js/pinyin.js';
import { voiceQuality } from '../app/js/audio.js';

test('celebrations: petals only for Japanese, never repeats the previous one', () => {
  assert.ok(celebrations('ja').includes('petals'));
  assert.ok(!celebrations('fr').includes('petals'));
  for (const prev of celebrations('zh')) for (let i = 0; i < 20; i++) assert.notEqual(pickCelebration('zh', prev, () => i / 20), prev);
  for (const k of celebrations('ja')) assert.ok(celebrationHtml(k).includes('aria-hidden'));
});

test('toneOf reads the tone mark', () => {
  assert.deepEqual(['mā', 'má', 'mǎ', 'mà', 'ma'].map(toneOf), [1, 2, 3, 4, 0]);
  assert.equal(toneOf('nǚ'), 3);
});

test('voiceQuality ranks better-sounding voices higher', () => {
  assert.ok(voiceQuality('Samantha (Enhanced)') > voiceQuality('Google US English'));
  assert.ok(voiceQuality('Google 普通话') > voiceQuality('Ting-Ting'));
  assert.ok(voiceQuality('Microsoft Xiaoxiao Online (Natural)') >= 3);
});

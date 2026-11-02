// The Chinese course: built from the same code with the zh content pack.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.__HAJIME_COURSE__ = 'zh';
const { ITEMS, NODES, SECTIONS } = await import('../app/js/course.js');
const { generateLesson, generatePractice, makeRng } = await import('../app/js/lesson/generate.js');
const { defaultState } = await import('../app/js/progress.js');
const { pinyinParts } = await import('../app/js/pinyin.js');
const { L } = await import('../app/js/lang.js');

const T0 = new Date(2026, 10, 2, 10, 0).getTime();

test('the Chinese course is built from the Chinese pack', () => {
  assert.equal(L.code, 'zh');
  assert.equal(SECTIONS[0].id, 'china');
  assert.ok(NODES.length > 60);
  assert.ok(!NODES.some((n) => n.kind === 'read'), 'no kana lessons in Chinese');
  assert.ok(NODES.some((n) => n.kind === 'kanji'), 'character lessons');
});

test('every word and sentence chunk has one pinyin syllable per character', () => {
  const bad = [];
  for (const it of ITEMS.values()) {
    if (it.type === 'word' && /^\p{Script=Han}+$/u.test(it.jp) && !pinyinParts(it.jp, it.romaji)) bad.push(`${it.jp} ${it.romaji}`);
    if (it.type === 'sentence') it.jp.forEach((c, i) => /^\p{Script=Han}+$/u.test(c) && !pinyinParts(c, it.romajiChunks[i]) && bad.push(`${c} ${it.romajiChunks[i]}`));
  }
  assert.deepEqual(bad, []);
});

test('every Chinese node makes valid exercises at every level', () => {
  const state = defaultState(T0);
  for (const node of NODES) {
    if (node.kind === 'chest') continue;
    for (const level of [0, 2]) {
      const { exercises } = generateLesson(node, state, { rng: makeRng(1), now: T0, level, canListen: true });
      assert.ok(exercises.length > 0, node.id);
    }
    for (const id of node.items || []) state.items[id] = { box: 3, seen: 2, right: 2, wrong: 0, last: T0, due: T0 };
  }
  assert.ok(generatePractice(state, { now: T0 }).exercises.length > 0);
});

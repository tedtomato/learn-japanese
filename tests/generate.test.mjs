import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLesson, generatePractice, makeRng } from '../app/js/lesson/generate.js';
import { NODES, ITEMS } from '../app/js/course.js';
import { defaultState, completeSession } from '../app/js/progress.js';
import { nextTidbit } from '../app/js/tidbits.js';

const T0 = new Date(2026, 9, 18, 10, 0).getTime();

function checkExercise(ex, where) {
  if (ex.type === 'intro') return assert.ok(ITEMS.has(ex.itemId), where);
  if (ex.type === 'choice') {
    assert.ok(ex.options.includes(ex.itemId), `${where}: answer missing from options`);
    assert.equal(new Set(ex.options).size, ex.options.length, `${where}: duplicate options`);
    assert.ok(ex.options.length >= 2, `${where}: too few options`);
  } else if (ex.type === 'build') {
    const bank = [...ex.tiles];
    for (const t of ex.answer) {
      const i = bank.indexOf(t);
      assert.ok(i >= 0, `${where}: tile ${t} missing`);
      bank.splice(i, 1);
    }
  } else if (ex.type === 'match') {
    assert.ok(ex.pairs.length >= 3, where);
  } else assert.fail(`${where}: unknown type ${ex.type}`);
}

test('every node generates valid exercises at every level, walking the whole course', () => {
  const state = defaultState(T0);
  let now = T0;
  for (const node of NODES) {
    if (node.kind === 'chest') {
      state.nodes[node.id] = { level: 1 };
      continue;
    }
    for (const level of [0, 2, 4]) {
      for (const hasVoice of [true, false]) {
        const { exercises } = generateLesson(node, state, { level, hasVoice, rng: makeRng(node.index * 31 + level), now });
        assert.ok(exercises.filter((e) => e.type !== 'intro').length >= 6, `${node.id} too short`);
        exercises.forEach((ex, i) => checkExercise(ex, `${node.id} L${level} #${i}`));
        if (!hasVoice) assert.ok(!exercises.some((e) => e.prompt === 'audio' || e.mode === 'audio'), `${node.id}: audio without a voice`);
      }
    }
    const results = new Map(node.items.map((id) => [id, { right: 1, wrong: 0 }]));
    completeSession(state, { node, mode: 'lesson', results, mistakes: 0, now });
    now += 3600000;
  }
});

test('first lesson introduces each new kana before asking about it', () => {
  const { exercises } = generateLesson(NODES[0], defaultState(T0), { rng: makeRng(1), now: T0 });
  for (const id of NODES[0].items) {
    const intro = exercises.findIndex((e) => e.type === 'intro' && e.itemId === id);
    const first = exercises.findIndex((e) => e.type !== 'intro' && e.itemIds.includes(id));
    assert.ok(intro >= 0 && intro < first, id);
  }
});

test('practice uses learned items only', () => {
  const state = defaultState(T0);
  assert.equal(generatePractice(state, { now: T0 }).exercises.length, 0);
  const node = NODES[0];
  completeSession(state, { node, mode: 'lesson', results: new Map(node.items.map((id) => [id, { right: 1, wrong: 0 }])), mistakes: 0, now: T0 });
  const { exercises, itemIds } = generatePractice(state, { now: T0 + 86400000, rng: makeRng(3) });
  assert.ok(exercises.length >= 5);
  assert.ok(itemIds.every((id) => node.items.includes(id)));
  exercises.forEach((ex, i) => checkExercise(ex, `practice #${i}`));
});

test('tidbits are not repeated until all have been seen', () => {
  const state = defaultState(T0);
  const rng = makeRng(9);
  const seen = new Set();
  for (let i = 0; i < 52; i++) {
    const { item } = nextTidbit(state, rng, ['phrase']);
    assert.ok(!seen.has(item.id));
    seen.add(item.id);
  }
  assert.equal(state.seen.phrase.length, 52);
});

test('sentence tiles never offer the same word twice', () => {
  const node = NODES.find((n) => n.id === 'words-me-l3');
  for (let seed = 0; seed < 30; seed++) {
    const { exercises } = generateLesson(node, defaultState(T0), { rng: makeRng(seed), now: T0 });
    for (const ex of exercises.filter((e) => e.type === 'build' && e.mode === 'jp2en')) {
      const extra = [...ex.tiles];
      ex.answer.forEach((t) => extra.splice(extra.indexOf(t), 1));
      const keys = extra.map((t) => t.toLowerCase());
      assert.equal(new Set(keys).size, keys.length, ex.tiles.join(' '));
      assert.ok(keys.every((k) => !ex.answer.some((a) => a.toLowerCase() === k)), ex.tiles.join(' '));
    }
  }
});

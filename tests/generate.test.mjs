import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLesson, generatePractice, generateRetry, makeRng, knownChars, canRead } from '../app/js/lesson/generate.js';
import { NODES, ITEMS } from '../app/js/course.js';
import { defaultState, completeSession } from '../app/js/progress.js';
import { nextTidbit } from '../app/js/tidbits.js';
import { GRAMMAR } from '../app/js/content/grammar.js';
import { STROKES } from '../app/js/content/strokes.js';

const T0 = new Date(2026, 9, 18, 10, 0).getTime();

function checkExercise(ex, where) {
  if (['intro', 'tidbit'].includes(ex.type)) return assert.ok(ex.type === 'tidbit' || ITEMS.has(ex.itemId), where);
  if (ex.type === 'trace') return assert.ok(STROKES[ITEMS.get(ex.itemId).jp], `${where}: no strokes`);
  if (ex.type === 'speak') return assert.ok(ITEMS.has(ex.itemId), where);
  if (ex.type === 'grammar') return assert.ok(GRAMMAR[ex.grammarId], where);
  if (ex.type === 'dialogue') {
    assert.ok(ex.options.includes(ex.answer), `${where}: dialogue answer missing`);
    return assert.equal(new Set(ex.options).size, ex.options.length, where);
  }
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
      for (const canListen of [true, false]) {
        const { exercises } = generateLesson(node, state, { level, canListen, canSpeak: canListen, rng: makeRng(node.index * 31 + level), now });
        if (node.kind !== 'story') assert.ok(exercises.filter((e) => e.type !== 'intro').length >= 6, `${node.id} too short`);
        exercises.forEach((ex, i) => checkExercise(ex, `${node.id} L${level} #${i}`));
        if (!canListen) {
          assert.ok(!exercises.some((e) => e.prompt === 'audio' || ['audio', 'fast'].includes(e.mode) || e.type === 'speak'), `${node.id}: listening without a voice`);
        }
      }
    }
    const items = node.kind === 'story' ? [] : [...node.items, ...(node.readWords || [])];
    completeSession(state, { node, mode: 'lesson', results: new Map(items.map((id) => [id, { right: 1, wrong: 0 }])), mistakes: 0, now });
    now += 3600000;
  }
});

test('new items are introduced (and new characters traced) before being asked about', () => {
  const read = NODES.find((n) => n.kind === 'read');
  for (const node of [NODES[0], read]) {
    const { exercises } = generateLesson(node, defaultState(T0), { rng: makeRng(1), now: T0 });
    for (const id of node.items) {
      const intro = exercises.findIndex((e) => e.type === 'intro' && e.itemId === id);
      const first = exercises.findIndex((e) => !['intro', 'trace'].includes(e.type) && e.itemIds?.includes(id));
      assert.ok(intro >= 0 && intro < first, `${node.id} ${id}`);
    }
    if (node.kind === 'read') assert.ok(exercises.some((e) => e.type === 'trace'), 'reading lesson traces its characters');
  }
});

test('romaji hints fade once every character of a word has been learned', () => {
  const state = defaultState(T0);
  const word = [...ITEMS.values()].find((i) => i.type === 'word' && i.jp === 'いいえ');
  assert.equal(canRead(word, knownChars(state)), false);
  for (const ch of word.chars) state.items[`k-${ch}`] = { box: 1, due: T0 + 1e9, seen: 1, right: 1, wrong: 0 };
  assert.equal(canRead(word, knownChars(state)), true);
});

test('retry round asks new questions about missed items', () => {
  const ids = NODES[0].items;
  const retry = generateRetry(ids, defaultState(T0), { rng: makeRng(5) });
  assert.equal(retry.length, ids.length);
  retry.forEach((ex, i) => checkExercise(ex, `retry #${i}`));
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

test('sentence tiles never offer the same word twice', () => {
  const node = NODES.find((n) => n.items?.some((id) => ITEMS.get(id).type === 'sentence' && ITEMS.get(id).jp.length >= 4));
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

test('tidbits follow the unit theme and are not repeated until all have been seen', () => {
  const state = defaultState(T0);
  const rng = makeRng(9);
  const seen = new Set();
  for (let i = 0; i < 52; i++) {
    const { item } = nextTidbit(state, rng, ['phrase']);
    assert.ok(!seen.has(item.id));
    seen.add(item.id);
  }
  const themed = nextTidbit(defaultState(T0), rng, ['fact'], { facts: ['Food Culture & Culinary Mastery'] });
  assert.equal(themed.item.category, 'Food Culture & Culinary Mastery');
  const peek = nextTidbit(state, rng, ['kanji']);
  assert.ok(state.items[`xk-${peek.item.id}`], 'a spotted kanji joins practice');
});

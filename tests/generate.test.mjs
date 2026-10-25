import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLesson, generatePractice, generateRetry, makeRng, knownChars, canRead, kanjiPracticeIds } from '../app/js/lesson/generate.js';
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
  } else if (ex.type === 'guess') {
    assert.ok(ex.options.includes(ITEMS.get(ex.itemId).en) && new Set(ex.options).size === ex.options.length, where);
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

test('romaji hints fade only once every character of a word is well known', () => {
  const state = defaultState(T0);
  const word = [...ITEMS.values()].find((i) => i.type === 'word' && i.jp === 'いいえ');
  assert.equal(canRead(word, knownChars(state)), false);
  for (const ch of word.chars) state.items[`k-${ch}`] = { box: 1, due: T0 + 1e9, seen: 1, right: 1, wrong: 0 };
  assert.equal(canRead(word, knownChars(state)), false, 'seen once is not enough');
  for (const ch of word.chars) state.items[`k-${ch}`].box = 3;
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

test('kanji only spotted in a fact card are not asked on the path, only in practice', () => {
  const peek = [...ITEMS.values()].find((i) => i.peek);
  const state = defaultState();
  state.items[peek.id] = { box: 0, seen: 0, right: 0, wrong: 0, last: 0, due: 0 };
  for (let i = 0; i < 20; i++) {
    const { exercises } = generateLesson(NODES[0], state, { rng: makeRng(i), now: T0 });
    assert.ok(!exercises.some((e) => (e.itemIds || []).includes(peek.id) || (e.options || []).includes(peek.id)));
  }
  const practice = generatePractice(state, { now: T0 });
  assert.ok(practice.itemIds.includes(peek.id));
  // Shown once, with its memory clue, before any question about it.
  const first = practice.exercises.findIndex((e) => e.itemId === peek.id);
  assert.equal(practice.exercises[first].type, 'intro');
});

test('first "Read it" lesson is gentle: check after each new kana, fewer choices, no look-alikes, no countdown', () => {
  const node = NODES.find((n) => n.kind === 'read');
  const state = defaultState(T0);
  const LOOK = ['さちき', 'ねれわ', 'ぬめ', 'はほけ', 'るろ', 'いりこ', 'うらつ', 'あお', 'まも', 'たな'];
  for (let seed = 0; seed < 15; seed++) {
    const { exercises } = generateLesson(node, state, { rng: makeRng(seed), now: T0, level: 0 });
    for (const id of node.items) {
      const intro = exercises.findIndex((e) => e.type === 'intro' && e.itemId === id);
      const check = exercises.findIndex((e, i) => i > intro && e.type === 'choice' && e.itemId === id);
      const nextIntro = exercises.findIndex((e, i) => i > intro && e.type === 'intro');
      assert.ok(check > intro && (nextIntro === -1 || check < nextIntro), `${id} is checked before the next character`);
      assert.equal(exercises[check].options.length, 2);
    }
    for (const e of exercises.filter((x) => x.type === 'choice' && ITEMS.get(x.itemId).type === 'kana')) {
      assert.ok(e.options.length <= 3 && e.untimed);
      const me = ITEMS.get(e.itemId).jp;
      for (const o of e.options) if (o !== e.itemId) assert.ok(!LOOK.some((g) => g.includes(me) && g.includes(ITEMS.get(o).jp)), `${me} vs ${ITEMS.get(o).jp}`);
    }
  }
});

test('reading lessons practise familiar words (すし, ねこ…) once their characters are known', () => {
  const nodes = NODES.filter((n) => n.kind === 'read');
  const state = defaultState(T0);
  let lessonsWithFamiliar = 0;
  for (const node of nodes) {
    const { exercises } = generateLesson(node, state, { rng: makeRng(3), now: T0, level: 0 });
    const fam = exercises.filter((e) => ITEMS.get(e.itemId)?.type === 'fword');
    if (fam.length) lessonsWithFamiliar += 1;
    for (const e of fam) assert.ok(ITEMS.get(e.itemId).chars.every((c) => state.items[`k-${c}`] || node.items.includes(`k-${c}`)));
    for (const id of node.items) state.items[id] = { box: 1, seen: 1, right: 1, wrong: 0, last: T0, due: T0 };
  }
  assert.ok(lessonsWithFamiliar >= nodes.length / 2, `${lessonsWithFamiliar} of ${nodes.length}`);
});

test('kanji practice uses only kanji, each character once', () => {
  const state = defaultState(T0);
  for (const it of ITEMS.values()) if (['kanji', 'kword', 'radical', 'word', 'kana'].includes(it.type)) state.items[it.id] = { box: 1, seen: 1, right: 1, wrong: 0, last: T0, due: T0 };
  const ids = kanjiPracticeIds(state, T0);
  assert.ok(ids.length >= 3);
  assert.ok(ids.every((id) => ['kanji', 'kword', 'radical'].includes(ITEMS.get(id).type)));
  assert.equal(new Set(ids.map((id) => ITEMS.get(id).jp)).size, ids.length);
  const { exercises } = generatePractice(state, { itemIds: ids, now: T0 });
  assert.ok(exercises.every((e) => (e.itemIds || [e.itemId]).every((id) => !id || ['kanji', 'kword', 'radical'].includes(ITEMS.get(id).type))));
});

test('first Read it lesson teaches two characters, practises them together, then the next two', () => {
  const node = NODES.find((n) => n.kind === 'read' && n.items.length === 4);
  const { exercises } = generateLesson(node, defaultState(T0), { rng: makeRng(5), now: T0, level: 0, canListen: true });
  const [a, b, c] = node.items;
  const introC = exercises.findIndex((e) => e.type === 'intro' && e.itemId === c);
  const pairQs = exercises.slice(0, introC).filter((e) => e.kind === 'audio2kana');
  assert.equal(pairQs.length, 2);
  for (const q of pairQs) assert.deepEqual([...q.options].sort(), [a, b].sort());
});

test('kana practice: weakest characters of one script, gentle questions', async () => {
  const { kanaPracticeIds } = await import('../app/js/lesson/generate.js');
  const state = defaultState(T0);
  for (const it of ITEMS.values()) if (it.type === 'kana') state.items[it.id] = { box: 1, seen: 1, right: 1, wrong: 0, last: T0, due: T0 };
  const ids = kanaPracticeIds(state, T0, 'hiragana');
  assert.equal(ids.length, 8);
  assert.ok(ids.every((id) => ITEMS.get(id).script === 'hiragana'));
  const { exercises } = generatePractice(state, { itemIds: ids, now: T0, gentle: true });
  for (const e of exercises.filter((x) => x.type === 'choice')) assert.ok(e.options.length <= 3 && e.untimed);
});

test('listening tiles never offer a sound-alike of the answer (を + げんき for おげんき)', () => {
  const item = [...ITEMS.values()].find((i) => i.type === 'sentence' && i.jp.includes('おげんき'));
  const node = NODES.find((n) => n.kind === 'lesson' && n.items.includes(item.id));
  const state = defaultState(T0);
  for (let seed = 0; seed < 30; seed++) {
    const { exercises } = generateLesson(node, state, { rng: makeRng(seed), now: T0, level: 2, canListen: true });
    for (const e of exercises.filter((x) => x.type === 'build' && x.itemId === item.id && ['audio', 'fast', 'en2jp'].includes(x.mode))) {
      assert.ok(!e.tiles.includes('を') && !e.tiles.includes('げんき'), e.tiles.join(' '));
    }
  }
});

test('new words are guessed first (not scored), at most two per lesson, right before their card', () => {
  const node = NODES.find((n) => n.kind === 'lesson');
  const { exercises } = generateLesson(node, defaultState(T0), { rng: makeRng(2), now: T0, level: 0 });
  const guesses = exercises.filter((e) => e.type === 'guess');
  assert.ok(guesses.length >= 1 && guesses.length <= 2);
  for (const g of guesses) {
    const i = exercises.indexOf(g);
    assert.deepEqual([exercises[i + 1].type, exercises[i + 1].itemId], ['intro', g.itemId]);
    assert.ok(g.options.includes(ITEMS.get(g.itemId).en) && g.options.length === 3);
    assert.deepEqual(g.itemIds, []);
  }
});

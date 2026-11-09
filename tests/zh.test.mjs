// The Chinese course: built from the same code with the zh content pack.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.__HAJIME_COURSE__ = 'zh';
const { ITEMS, NODES, SECTIONS } = await import('../app/js/course.js');
const { generateLesson, generatePractice, makeRng, demoExercises, DEMO_KINDS, tonePattern, toneLabel, PRODUCTION_SHARE } = await import('../app/js/lesson/generate.js');
const { playThrough, learnedState, productionShare } = await import('./sim.mjs');
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

test('Chinese extras: every word has a memory trick, missions and drills point at real units and words', async () => {
  const { MISSIONS, PATTERNS } = await import('../app/js/content/pack.js');
  const units = new Set(SECTIONS.flatMap((s) => s.units.map((u) => u.id)));
  assert.deepEqual([...ITEMS.values()].filter((i) => i.type === 'word' && !i.memory).map((i) => i.id), []);
  assert.ok(MISSIONS.length >= 9 && MISSIONS.every((m) => units.has(m.unit) && m.steps.every((s) => s.replies.some((r) => r.ok))));
  for (const p of PATTERNS) for (const [id] of p.slots) assert.equal(ITEMS.get(id)?.type, 'word', `${p.id}: ${id}`);
});

test('Chinese typed answers ignore tones and ü, and 饭馆 splits as fàn + guǎn', async () => {
  const { romajiMatch } = await import('../app/js/normalise.js');
  assert.equal(romajiMatch('nihao', 'nǐhǎo'), 'exact');
  assert.equal(romajiMatch('lv', 'lǚ'), 'exact');
  assert.deepEqual(pinyinParts('饭馆', 'fànguǎn').map((p) => p.romaji), ['fàn', 'guǎn']);
});

test('tone tasks: hear a word, pick its tone pattern; only learned, audible words without sandhi', () => {
  assert.ok(DEMO_KINDS.tone);
  const tones = new Set();
  for (let seed = 1; seed <= 5; seed++) {
    const made = demoExercises('tone', defaultState(T0), { rng: makeRng(seed) });
    assert.ok(made.length >= 3);
    for (const ex of made) {
      const item = ITEMS.get(ex.itemId);
      assert.equal(ex.type, 'tone');
      assert.equal(ex.prompt, 'audio');
      assert.equal(ex.answer, toneLabel(tonePattern(item)));
      assert.ok(ex.options.includes(ex.answer) && new Set(ex.options).size === ex.options.length && ex.options.length === 4);
      assert.ok(!/[不一]/.test(item.jp) && tonePattern(item) !== '33');
      tones.add(tonePattern(item));
    }
  }
  assert.ok(tones.size >= 4, 'several tone patterns');
  assert.equal(tonePattern(ITEMS.get('w-mai3')), '3');
  // In lessons: needs listening and a word that was answered before.
  const learned = learnedState(T0 + 9e8);
  let heard = 0;
  for (const node of NODES.filter((n) => n.kind === 'lesson' || n.kind === 'review')) {
    for (const canListen of [true, false]) {
      const { exercises } = generateLesson(node, learned, { rng: makeRng(node.index), now: T0 + 9e8, level: 3, canListen });
      const n = exercises.filter((e) => e.type === 'tone').length;
      if (canListen) heard += n;
      else assert.equal(n, 0, `${node.id}: tone task without a voice`);
    }
  }
  assert.ok(heard >= 5, `${heard} tone tasks in lessons`);
  assert.equal(generateLesson(NODES[0], defaultState(T0), { rng: makeRng(1), now: T0, level: 3 }).exercises.filter((e) => e.type === 'tone').length, 0, 'not for unseen words');
});

test('Chinese: verb forms (了 / 不 / 没), typed sentences and the 40% production share', () => {
  const kinds = new Set();
  for (let seed = 1; seed <= 6; seed++) for (const ex of demoExercises('conjugation', defaultState(T0), { rng: makeRng(seed) })) {
    kinds.add(ex.kind);
    assert.ok(ex.options.includes(ex.answer) && new Set(ex.options).size === ex.options.length && ex.options.length >= 3);
    assert.ok(Object.keys(ex.optionRomaji || {}).length >= ex.options.length - 1, 'pinyin under the options');
  }
  assert.deepEqual([...kinds].sort(), ['conj-sentence', 'conjugation']);
  const { log } = playThrough({ levels: [0, 1, 2], kinds: ['lesson', 'review'] });
  const mix = (pick) => productionShare(log.filter(pick).flatMap((l) => l.exercises));
  assert.ok(mix((l) => l.level === 2 && l.node.kind === 'lesson').share >= PRODUCTION_SHARE);
  assert.ok(mix((l) => l.level >= 1 && l.node.kind === 'review').share >= PRODUCTION_SHARE);
});

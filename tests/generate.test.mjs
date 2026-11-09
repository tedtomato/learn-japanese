import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLesson, generatePractice, generateRetry, makeRng, knownChars, canRead, kanjiPracticeIds, romajiMatch, demoExercises, DEMO_KINDS, PRODUCTION_SHARE } from '../app/js/lesson/generate.js';
import { playThrough, learnedState, productionShare } from './sim.mjs';
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
  } else if (ex.type === 'recall') {
    assert.equal(ITEMS.get(ex.itemId).type, 'word', where);
  } else if (ex.type === 'type-sentence') {
    assert.equal(ITEMS.get(ex.itemId).type, 'sentence', where);
  } else if (ex.type === 'conjugation') {
    assert.ok(ex.options.includes(ex.answer), `${where}: answer missing from options`);
    assert.equal(new Set(ex.options.map((o) => o.toLowerCase())).size, ex.options.length, `${where}: duplicate options`);
    assert.ok(ex.options.length >= 3 && ex.options.length <= 4, `${where}: ${ex.options.length} options`);
    if (ex.prompt) assert.equal(ex.prompt.filter((c) => c === null).length, 1, where);
    assert.ok(ex.verb && ex.meaning && ex.label, where);
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

test('recall: from level 1 a known word is typed from memory, with lenient romaji', () => {
  const node = NODES.find((n) => n.kind === 'lesson');
  const state = defaultState(T0);
  for (const id of node.items) state.items[id] = { box: 1, seen: 1, right: 1, wrong: 0, last: T0, due: T0 };
  const { exercises } = generateLesson(node, state, { rng: makeRng(4), now: T0, level: 1 });
  assert.equal(exercises.filter((e) => e.type === 'recall').length, 1);
  assert.equal(romajiMatch('Arigatō', 'arigatou'), 'exact');
  assert.equal(romajiMatch('kon nichi wa', 'konnichiwa'), 'exact');
  assert.equal(romajiMatch('konichiwa', 'konnichiwa'), 'close');
  assert.equal(romajiMatch('mizo', 'mizu'), false);
});

test('production weighting: from level 2, in reviews and in practice, at least 40% of scored tasks are typed or built', () => {
  const { log, state, now } = playThrough({ levels: [0, 1, 2] });
  const share = (levelOf, kinds) => productionShare(log.filter((l) => levelOf(l) && kinds.includes(l.node.kind)).flatMap((l) => l.exercises));
  const l2 = share((l) => l.level === 2, ['lesson']);
  assert.ok(l2.scored > 500 && l2.share >= PRODUCTION_SHARE, `level 2 lessons: ${(l2.share * 100).toFixed(1)}% of ${l2.scored}`);
  const reviews = share((l) => l.level >= 1, ['review']);
  assert.ok(reviews.share >= PRODUCTION_SHARE, `reviews: ${(reviews.share * 100).toFixed(1)}%`);
  const gentle = share((l) => l.level === 0, ['lesson']);
  assert.ok(gentle.share < PRODUCTION_SHARE, `level 0 stays gentle: ${(gentle.share * 100).toFixed(1)}%`);
  // Practice over words and sentences (characters and kanji have no typed tasks).
  const wordsOnly = learnedState(now);
  for (const id of Object.keys(wordsOnly.items)) if (!['word', 'sentence'].includes(ITEMS.get(id).type)) delete wordsOnly.items[id];
  let practiced = { scored: 0, production: 0 };
  for (let seed = 1; seed <= 20; seed++) {
    const p = productionShare(generatePractice(wordsOnly, { rng: makeRng(seed), now, size: 12 }).exercises);
    practiced = { scored: practiced.scored + p.scored, production: practiced.production + p.production };
  }
  assert.ok(practiced.production / practiced.scored >= PRODUCTION_SHARE, `practice: ${practiced.production}/${practiced.scored}`);
});

test('recall can ask for a whole sentence, checked leniently', () => {
  const state = learnedState(T0 + 9e8);
  const sentence = [...ITEMS.values()].find((i) => i.type === 'sentence');
  const { exercises } = generatePractice(state, { itemIds: [sentence.id], rng: makeRng(2), now: T0 + 9e8, size: 30 });
  const typed = exercises.filter((e) => e.type === 'type-sentence');
  assert.ok(typed.length >= 1, 'a sentence is typed from memory');
  assert.equal(romajiMatch(sentence.romaji.toUpperCase().replace(/ /g, '  '), sentence.romaji), 'exact');
});

test('Japanese reading: kana from the second unit, katakana after ~16 hiragana, kanji after ~20 kana', () => {
  const units = SECTIONS_OF(NODES);
  const reads = (u) => u.nodes.filter((n) => n.kind === 'read');
  assert.equal(reads(units[0]).length, 0, 'the first unit teaches no kana');
  assert.ok(units.slice(1, 9).every((u) => reads(u).length === 1 && reads(u)[0].items.length === 4), 'one Read-it lesson of 4 kana per unit in section 1');
  let taught = 0;
  let hira = 0;
  const firstKata = { at: null };
  for (const u of units) {
    for (const n of u.nodes) {
      if (n.kind === 'kanji') assert.ok(taught >= 20, `${n.id}: kanji only after ~20 kana (${taught})`);
      if (n.kind !== 'read' || u.id === 'kana-corner') continue;
      for (const id of n.items) {
        const k = ITEMS.get(id);
        if (k.script === 'katakana') {
          firstKata.at ??= hira;
          assert.ok(/[ァ-ヶー]/.test(k.jp));
        } else hira += 1;
        taught += 1;
      }
    }
  }
  assert.ok(firstKata.at >= 16, `katakana after ${firstKata.at} hiragana`);
  assert.ok(units.find((u) => u.id === 'tokyo-eating-out').nodes.some((n) => n.kind === 'kanji'), 'kanji lessons are spread over later units');
  const sec1Kana = units.slice(0, 9).flatMap(reads).flatMap((n) => n.items).length;
  assert.ok(sec1Kana >= 30, `${sec1Kana} kana taught in section 1`);
  // Only characters that have stroke data are taught (the small ァィゥェォ are not in KANA).
  for (const n of NODES.filter((x) => x.kind === 'read')) for (const id of n.items) assert.ok(STROKES[ITEMS.get(id).jp], n.id);
});
const SECTIONS_OF = (nodes) => [...new Map(nodes.map((n) => [n.unit.id, n.unit])).values()];

test('reading tasks appear in section 1 and romaji fades once characters are known', () => {
  const { log } = playThrough({ levels: [0, 1, 2], kinds: ['lesson', 'read'] });
  const sec1 = log.filter((l) => l.node.sectionIndex === 0 && l.node.kind === 'lesson').flatMap((l) => l.exercises);
  assert.ok(sec1.filter((e) => e.kind === 'read').length >= 5, 'read tasks in section 1');
  assert.ok(sec1.filter((e) => e.kind === 'spell').length >= 5, 'spell tasks in section 1');
  const hinted = (from) => log.filter((l) => l.node.index >= from && l.node.kind === 'lesson').flatMap((l) => l.exercises).filter((e) => ITEMS.get(e.itemId)?.type === 'word' && e.hint !== undefined);
  const late = hinted(NODES.find((n) => n.sectionIndex === 1).index);
  assert.ok(late.some((e) => e.hint === false), 'romaji hints fade for words made of known kana');
  assert.ok(sec1.some((e) => e.hint === true), 'and stay for words with unknown kana');
});

test('verb forms: conjugation tasks name a form or fill a gap, never repeat an option', () => {
  assert.ok(DEMO_KINDS.conjugation);
  const state = defaultState(T0);
  const seen = new Set();
  for (let seed = 1; seed <= 8; seed++) {
    for (const ex of demoExercises('conjugation', state, { rng: makeRng(seed) })) {
      checkExercise(ex, `conj demo ${seed}`);
      seen.add(ex.kind);
    }
  }
  assert.deepEqual([...seen].sort(), ['conj-sentence', 'conjugation']);
  // Asked in lessons and practice once the verb has been answered.
  const learned = learnedState(T0);
  let n = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const { exercises } = generatePractice(learned, { rng: makeRng(seed), now: T0 + 1e6 });
    n += exercises.filter((e) => e.type === 'conjugation').length;
    exercises.forEach((e, i) => checkExercise(e, `practice ${seed} #${i}`));
  }
  assert.ok(n >= 20, `${n} conjugation tasks in 40 practice sessions`);
  assert.equal(generatePractice(defaultState(T0), { now: T0 }).exercises.filter((e) => e.type === 'conjugation').length, 0, 'not before the verbs are met');
});

test('difficulty follows strength: shaky items get easy tasks, solid ones hard and typed tasks', () => {
  const node = NODES.find((n) => n.kind === 'lesson' && n.items.filter((id) => ITEMS.get(id).type === 'word').length >= 3);
  const ids = node.items.filter((id) => ITEMS.get(id).type === 'word');
  const EASY = ['jp2en', 'audio2jp'];
  const make = (record) => {
    const state = defaultState(T0);
    for (const id of node.items) state.items[id] = { ...record };
    return generatePractice(state, { itemIds: ids, rng: makeRng(11), now: T0 + 1000, size: 12 }).exercises.filter((e) => ids.includes(e.itemId) && e.type === 'choice');
  };
  const shaky = make({ box: 1, seen: 6, right: 1, wrong: 5, last: T0, due: T0 + 1e9 });
  assert.ok(shaky.length >= 3 && shaky.every((e) => EASY.includes(e.kind)), shaky.map((e) => e.kind).join());
  const solid = make({ box: 4, seen: 8, right: 8, wrong: 0, last: T0, due: T0 + 1e9 });
  assert.ok(solid.length >= 3 && solid.every((e) => e.kind !== 'jp2en'), solid.map((e) => e.kind).join());
});

test('dialogues with several questions ask different ones; story nodes ask two', () => {
  const multi = [...ITEMS.values()].filter((i) => i.type === 'dialogue' && i.questions?.length >= 2);
  assert.ok(multi.length >= 3);
  const d = multi[0];
  const asked = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const ex = demoExercises('dialogue', defaultState(T0), { rng: makeRng(seed) }).find((e) => e.itemId === d.id);
    checkExercise(ex, d.id);
    const q = d.questions.find((x) => x.question === ex.instruction);
    assert.ok(q && ex.answer === q.options[0], 'the answer is the question\'s first option');
    asked.add(ex.instruction);
  }
  assert.ok(asked.size >= 2, 'a random question each time');
  const story = NODES.find((n) => n.kind === 'story' && n.items.some((id) => ITEMS.get(id).questions?.length >= 2));
  const { exercises } = generateLesson(story, defaultState(T0), { rng: makeRng(3), now: T0 });
  const first = story.items.find((id) => ITEMS.get(id).questions?.length >= 2);
  const mine = exercises.filter((e) => e.itemId === first);
  assert.equal(mine.length, 2);
  assert.notEqual(mine[0].instruction, mine[1].instruction);
});

test('pronunciation tips are tidbits, collected in state.seen.pron', () => {
  const state = defaultState(T0);
  assert.deepEqual(state.seen.pron, []);
  const rng = makeRng(4);
  const kinds = new Set();
  for (let i = 0; i < 80; i++) kinds.add(nextTidbit(state, rng).kind);
  assert.ok(kinds.has('pron'));
  assert.ok(state.seen.pron.length >= 3);
  const { item } = nextTidbit(state, () => 0.99, ['pron']);
  assert.ok(item.title && item.text && item.example && item.say);
});

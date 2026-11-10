// Usability helpers: resuming a lesson, "I mistyped", search, text size and the hardest words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeSnapshot, usableSnapshot, applySnapshot, RESUME_MAX_MS, MISTYPE_MAX, canMistype, forgiveMistype, foldText, matchesQuery,
  textSizePercent, TEXT_SIZES, hardestItems,
} from '../app/js/usability.js';
import { defaultState } from '../app/js/progress.js';
import { generateLesson } from '../app/js/lesson/generate.js';
import { NODES } from '../app/js/course.js';

const NOW = new Date(2026, 10, 10, 10, 0).getTime();

function session(node, exercises) {
  return {
    node, queue: exercises.slice(1), current: exercises[0], total: exercises.length, done: 3, mistakes: 1, answered: 4, speedBonus: 2, timedCount: 4,
    combo: 2, mistypes: 1, passAnswered: 4, passWrong: 1, retryRound: false, retryMisses: new Map([['a', 1]]),
    results: new Map([['w1', { right: 2, wrong: 1, hesitated: 0 }]]), missed: new Set(['w1']),
  };
}

test('resume: a real lesson survives JSON and comes back with the same score', () => {
  const node = NODES.find((n) => n.kind === 'lesson');
  const { exercises } = generateLesson(node, defaultState(NOW), { now: NOW, level: 1, canListen: true, canSpeak: true });
  const s = session(node, exercises);
  const snap = JSON.parse(JSON.stringify(makeSnapshot(s, NOW)));
  assert.equal(snap.queue.length, exercises.length, 'the current task is part of what is left');
  assert.deepEqual(snap.queue, JSON.parse(JSON.stringify(exercises)));
  const back = applySnapshot({}, snap);
  assert.equal(back.queue.length, exercises.length);
  assert.equal(back.mistakes, 1);
  assert.equal(back.done, 3);
  assert.equal(back.mistypes, 1);
  assert.deepEqual(back.results.get('w1'), { right: 2, wrong: 1, hesitated: 0 });
  assert.ok(back.missed.has('w1') && back.retryMisses.get('a') === 1);
  // After an answer the task is gone from the queue.
  assert.equal(makeSnapshot(s, NOW, { includeCurrent: false }).queue.length, exercises.length - 1);
});

test('resume: a snapshot expires after 24 hours and must match the lesson and the course content', () => {
  const node = NODES.find((n) => n.kind === 'lesson');
  const snap = JSON.parse(JSON.stringify(makeSnapshot({ ...session(node, [{ type: 'choice', itemId: 'x1', itemIds: ['x1'] }]) }, NOW)));
  const has = (id) => id === 'x1' || id === 'w1';
  assert.equal(usableSnapshot(snap, NOW + 1000, { nodeId: node.id, hasItem: has }), true);
  assert.equal(usableSnapshot(snap, NOW + RESUME_MAX_MS, { nodeId: node.id, hasItem: has }), true, 'exactly 24 h is still fine');
  assert.equal(usableSnapshot(snap, NOW + RESUME_MAX_MS + 1, { nodeId: node.id, hasItem: has }), false, 'older than 24 h is dropped');
  assert.equal(usableSnapshot(snap, NOW, { nodeId: 'another-lesson', hasItem: has }), false, 'another lesson');
  assert.equal(usableSnapshot(snap, NOW, { nodeId: node.id, hasItem: (id) => id === 'w1' }), false, 'an item the course no longer has');
  assert.equal(usableSnapshot({ ...snap, savedAt: NOW + 10 * 60000 }, NOW, { nodeId: node.id, hasItem: has }), false, 'saved in the future');
  assert.equal(usableSnapshot(null, NOW), false);
  assert.equal(usableSnapshot({ ...snap, v: 99 }, NOW, { nodeId: node.id }), false);
});

test('resume: hearts and XP are not part of a snapshot', () => {
  const node = NODES.find((n) => n.kind === 'lesson');
  const snap = makeSnapshot(session(node, [{ type: 'intro', itemId: 'w1', itemIds: [] }]), NOW);
  assert.ok(!('xp' in snap) && !('hearts' in snap) && !('gems' in snap));
});

test('mistyped: at most twice per lesson', () => {
  assert.equal(MISTYPE_MAX, 2);
  assert.deepEqual([0, 1, 2, 3].map(canMistype), [true, true, false, false]);
  assert.equal(canMistype(undefined), true);
});

test('mistyped: a wrong answer becomes right + shaky, so the word still comes back', () => {
  const results = new Map([['a', { right: 0, wrong: 1, hesitated: 0 }], ['b', { right: 1, wrong: 0, hesitated: 0 }]]);
  forgiveMistype(results, ['a', 'b', 'missing']);
  assert.deepEqual(results.get('a'), { right: 1, wrong: 0, hesitated: 1 });
  assert.deepEqual(results.get('b'), { right: 1, wrong: 0, hesitated: 0 }, 'nothing wrong, nothing to forgive');
});

test('search: accents, tone marks, capitals and punctuation do not matter; every word must match', () => {
  assert.equal(foldText('Café, s’il vous plaît!'), 'cafe s il vous plait');
  assert.equal(foldText('Nǐ hǎo'), 'ni hao');
  assert.equal(matchesQuery('CAFE', 'un café', 'a coffee'), true);
  assert.equal(matchesQuery('plait', "s'il vous plaît", 'please'), true);
  assert.equal(matchesQuery('ni hao', '你好', 'nǐ hǎo', 'hello'), true);
  assert.equal(matchesQuery('hello ni', '你好', 'nǐ hǎo', 'hello'), true);
  assert.equal(matchesQuery('arigatou', 'ありがとう', 'arigatou', 'thank you'), true);
  assert.equal(matchesQuery('thanks', 'ありがとう', 'arigatou', 'thank you'), false);
  assert.equal(matchesQuery('ありが', 'ありがとう', 'arigatou', 'thank you'), true, 'target text matches too');
  assert.equal(matchesQuery('  ', 'anything'), true, 'an empty search shows everything');
  assert.equal(matchesQuery('señor', 'el senor', 'mr'), true);
});

test('text size: four steps, normal is 100% and anything unknown falls back to it', () => {
  assert.deepEqual(Object.keys(TEXT_SIZES), ['small', 'normal', 'large', 'xlarge']);
  assert.equal(textSizePercent({}), 100);
  assert.equal(textSizePercent({ textSize: 'large' }), 115);
  assert.equal(textSizePercent({ textSize: 'huge' }), 100);
  assert.ok(TEXT_SIZES.small < 100 && TEXT_SIZES.large > 100 && TEXT_SIZES.xlarge > TEXT_SIZES.large);
});

test('hardest words: worst accuracy first, at least 3 answers, never a perfect one, at most 15', () => {
  const state = defaultState(NOW);
  const rec = (right, wrong) => ({ box: 1, seen: right + wrong, right, wrong, last: NOW, due: NOW });
  state.items = {
    a: rec(1, 2), // 33%
    b: rec(1, 3), // 25%
    c: rec(0, 2), // only 2 answers: too few
    d: rec(5, 0), // never wrong
    e: rec(2, 1), // 67%
    f: rec(2, 2), // 50%
    g: rec(1, 2), // 33% with the same answers as a: by id
  };
  const ranked = hardestItems(state, Object.keys(state.items));
  assert.deepEqual(ranked.map((x) => x.id), ['b', 'a', 'g', 'f', 'e']);
  assert.equal(Math.round(ranked[0].accuracy * 100), 25);
  state.items = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`w${i}`, rec(1, 3)]));
  assert.equal(hardestItems(state, Object.keys(state.items)).length, 15);
  assert.deepEqual(hardestItems(state, ['unknown']), []);
});

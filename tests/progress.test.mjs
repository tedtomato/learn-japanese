import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState, currentHearts, loseHeart, recordActivity, displayStreak, completeSession, migrate, exportBackup, importBackup,
  currentNodeIndex, mistakeIds, HEART_REFILL_MS, MAX_HEARTS,
} from '../app/js/progress.js';
import { review, INTERVALS, MAX_BOX } from '../app/js/srs.js';
import { NODES } from '../app/js/course.js';

const DAY = 86400000;
const T0 = new Date(2026, 9, 18, 10, 0).getTime();

test('hearts drop on mistakes and refill over time', () => {
  const s = defaultState(T0);
  loseHeart(s, T0);
  loseHeart(s, T0);
  assert.equal(currentHearts(s, T0), MAX_HEARTS - 2);
  assert.equal(currentHearts(s, T0 + HEART_REFILL_MS), MAX_HEARTS - 1);
  assert.equal(currentHearts(s, T0 + 10 * HEART_REFILL_MS), MAX_HEARTS);
});

test('streak grows on consecutive days, resets after a gap, freezes cover a missed day', () => {
  const s = defaultState(T0);
  recordActivity(s, T0);
  recordActivity(s, T0 + DAY);
  assert.equal(s.streak.count, 2);
  recordActivity(s, T0 + DAY + 3600000);
  assert.equal(s.streak.count, 2, 'same day does not count twice');
  s.streak.freezes = 1;
  recordActivity(s, T0 + 3 * DAY);
  assert.equal(s.streak.count, 3);
  assert.equal(s.streak.freezes, 0);
  assert.equal(displayStreak(s, T0 + 6 * DAY), 0);
  recordActivity(s, T0 + 6 * DAY);
  assert.equal(s.streak.count, 1);
});

test('spaced repetition moves items up on success and down on mistakes', () => {
  let r = review(null, { right: 1, wrong: 0 }, T0);
  assert.equal(r.box, 1);
  assert.equal(r.due, T0 + INTERVALS[1]);
  for (let i = 0; i < 10; i++) r = review(r, { right: 1, wrong: 0 }, T0);
  assert.equal(r.box, MAX_BOX);
  r = review(r, { right: 0, wrong: 1 }, T0);
  assert.equal(r.box, MAX_BOX - 2);
});

test('completing a lesson saves items, XP, level and unlocks the next node', () => {
  const s = defaultState(T0);
  const node = NODES[0];
  const results = new Map(node.items.map((id) => [id, { right: 2, wrong: 0 }]));
  const summary = completeSession(s, { node, mode: 'lesson', results, mistakes: 0, now: T0 });
  assert.equal(summary.xp, 15);
  assert.equal(s.nodes[node.id].level, 1);
  assert.equal(currentNodeIndex(s), 1);
  assert.ok(node.items.every((id) => s.items[id]));
  assert.equal(s.streak.count, 1);
});

test('backups round-trip and old saves gain new fields', () => {
  const s = defaultState(T0);
  s.xp = 123;
  const back = importBackup(exportBackup(s, T0), T0);
  assert.equal(back.xp, 123);
  assert.throws(() => importBackup('{"foo":1}'));
  const old = migrate({ xp: 5, settings: { theme: 'dark' } }, T0);
  assert.deepEqual(old.seen, { fact: [], phrase: [], kanji: [] });
  assert.equal(old.settings.theme, 'dark');
  assert.equal(old.settings.sfx, true);
});

test('after a course rebuild, lessons whose words were learned stay done', () => {
  const lesson = NODES.find((n) => n.kind === 'lesson');
  const kanji = NODES.find((n) => n.kind === 'kanji' && n.unit === lesson.unit);
  const items = Object.fromEntries(lesson.items.map((id) => [id, { box: 2, seen: 1, right: 1, wrong: 0, last: 0, due: 0 }]));
  const state = migrate({ nodes: { [`${lesson.unit.id}-l9`]: { level: 2 }, [`${lesson.unit.id}-chest`]: { level: 1 } }, items });
  assert.ok(state.nodes[lesson.id]);
  assert.ok(state.nodes[`${lesson.unit.id}-chest`]);
  assert.ok(!state.nodes[kanji.id], 'new kanji lesson still to do');
  assert.deepEqual(migrate(state).nodes, state.nodes);
});

test('a mistake stays in the Mistakes review until answered right, and fixing them all pays 5 gems', () => {
  const s = defaultState(T0);
  const [a, b] = NODES[0].items;
  completeSession(s, { mode: 'lesson', node: NODES[0], results: new Map([[a, { right: 0, wrong: 1 }], [b, { right: 1, wrong: 0 }]]), mistakes: 1, now: T0 });
  assert.deepEqual(mistakeIds(s), [a]);
  completeSession(s, { mode: 'practice', results: new Map([[a, { right: 1, wrong: 0, hesitated: 1 }]]), mistakes: 0, now: T0 + 1 });
  assert.deepEqual(mistakeIds(s), [a], 'a hesitant answer does not clear it');
  const gems = s.gems;
  const r = completeSession(s, { mode: 'practice', results: new Map([[a, { right: 1, wrong: 0 }]]), mistakes: 0, now: T0 + 2 });
  assert.deepEqual(mistakeIds(s), []);
  assert.ok(r.mistakesCleared && s.gems > gems + 5);
});

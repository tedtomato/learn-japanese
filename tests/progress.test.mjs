import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState, currentHearts, loseHeart, recordActivity, displayStreak, completeSession, migrate, exportBackup, importBackup,
  streakAt, courseSummary, currentNodeIndex, mistakeIds, completeListening, completeMission, backupStale, HEART_REFILL_MS, MAX_HEARTS, COURSE_VERSION,
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
  assert.equal(r.due, T0 + DAY, 'the first review is a day away (grace period)');
  assert.equal(review(r, { right: 1, wrong: 0 }, T0 + DAY).due, T0 + DAY + INTERVALS[2], 'later reviews follow the boxes');
  for (let i = 0; i < 10; i++) r = review(r, { right: 1, wrong: 0 }, T0);
  assert.equal(r.box, MAX_BOX);
  r = review(r, { right: 0, wrong: 1 }, T0);
  assert.equal(r.box, MAX_BOX - 2);
});

test('review dates drift by at most 10% and the same item always drifts the same way', () => {
  const dues = new Set();
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    const r = review({ box: 3, seen: 4, right: 4, wrong: 0, slow: 0 }, { right: 1, wrong: 0 }, T0, id);
    const wait = r.due - T0;
    assert.ok(wait >= INTERVALS[4] * 0.9 && wait <= INTERVALS[4] * 1.1, `${id}: ${wait}`);
    assert.equal(wait, review({ box: 3, seen: 4, right: 4, wrong: 0, slow: 0 }, { right: 1, wrong: 0 }, T0, id).due - T0);
    dues.add(wait);
  }
  assert.ok(dues.size > 1, 'not all the same');
  assert.equal(review({ box: 2, seen: 3, right: 3, wrong: 0, slow: 0 }, { right: 0, wrong: 1 }, T0, 'x').due, T0, 'a mistake on a known item is due at once');
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
  assert.deepEqual(old.seen, { fact: [], phrase: [], kanji: [], pron: [] });
  assert.equal(old.settings.theme, 'dark');
  assert.equal(old.settings.sfx, true);
});

test('after a course rebuild, lessons whose words were learned stay done', () => {
  const lesson = NODES.find((n) => n.kind === 'lesson');
  const kanji = NODES.find((n) => n.kind === 'kanji');
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

test('listening mode gives XP towards the daily goal once 10 phrases are heard', () => {
  const s = defaultState(T0);
  assert.equal(completeListening(s, 9, T0), 0);
  assert.equal(completeListening(s, 12, T0), 5);
  assert.equal(s.xp, 5);
  assert.equal(s.streak.count, 1);
});

test('missions pay XP each time and 2 gems per star above the best', () => {
  const s = defaultState(T0);
  const g = s.gems;
  assert.deepEqual(completeMission(s, 'cafe', 2, T0), { xp: 10, gems: 4, best: 2, improved: true });
  assert.equal(completeMission(s, 'cafe', 1, T0).gems, 0);
  assert.equal(completeMission(s, 'cafe', 3, T0).gems, 2);
  assert.equal(s.gems, g + 6);
  assert.equal(s.missions.cafe, 3);
  assert.deepEqual(migrate({ nodes: {} }).missions, {});
});

test('backups: due after two weeks once there is something to keep, and the date survives a restore', () => {
  const s = defaultState(T0);
  assert.equal(backupStale(s, T0), false, 'nothing learned yet');
  [...new Set(NODES.flatMap((n) => n.items || []))].slice(0, 10).forEach((id) => (s.items[id] = { box: 1, seen: 1, right: 1, wrong: 0, last: T0, due: T0 }));
  assert.equal(backupStale(s, T0), true, 'never backed up');
  s.backupAt = T0;
  assert.equal(backupStale(s, T0 + 13 * DAY), false);
  assert.equal(backupStale(s, T0 + 15 * DAY), true);
  assert.equal(importBackup(exportBackup(s)).backupAt, T0);
});

test('backups remember their course and refuse another course', () => {
  const s = defaultState(T0);
  const file = JSON.parse(exportBackup(s, T0));
  assert.equal(file.course, 'ja');
  const other = JSON.stringify({ ...file, course: 'fr' });
  assert.throws(() => importBackup(other, T0), /French backup/);
  const older = JSON.stringify({ ...file, course: undefined });
  assert.equal(importBackup(older, T0).xp, 0, 'backups from before the course was saved still restore');
});

test('the language screen can work out a lapsed streak from the saved summary', () => {
  const s = defaultState(T0);
  s.streak = { count: 5, lastDay: '2026-10-18', freezes: 1, best: 5 };
  const sum = courseSummary(s, T0);
  assert.deepEqual([sum.streakCount, sum.lastDay, sum.freezes], [5, '2026-10-18', 1]);
  assert.equal(streakAt({ count: sum.streakCount, lastDay: sum.lastDay, freezes: sum.freezes }, T0 + DAY), 5);
  assert.equal(streakAt({ count: 5, lastDay: sum.lastDay, freezes: 1 }, T0 + 7 * DAY), 0);
});

test('XP alone (listening, missions) counts as started', () => {
  const s = defaultState(T0);
  s.xp = 10;
  assert.equal(courseSummary(s, T0).started, true);
});

test('rebuilding the path keeps finished lessons, including kanji and reading lessons that moved to another unit', () => {
  // A learner on the previous path: finished the first units' lessons, including the kanji lessons that
  // used to sit in the first unit (now they come later), and has never opened the unit they moved to.
  const doneNodes = NODES.filter((n) => n.sectionIndex === 0 && ['lesson', 'read', 'kanji'].includes(n.kind) && n.unit.id !== 'tokyo-hotel');
  const items = {};
  for (const n of NODES.filter((x) => ['lesson', 'read', 'kanji'].includes(x.kind) && x.index <= doneNodes.at(-1).index + 20)) {
    for (const id of [...n.items, ...(n.readWords || [])]) items[id] = { box: 2, seen: 2, right: 2, wrong: 0, last: 0, due: 0 };
  }
  const old = {};
  for (const n of NODES) if (['lesson', 'chest', 'review'].includes(n.kind) && n.sectionIndex === 0) old[n.id] = { level: 2 };
  old['tokyo-hello-k1'] = { level: 1 };
  const state = migrate({ course: COURSE_VERSION - 1, nodes: old, items }, T0);
  assert.equal(state.course, COURSE_VERSION);
  for (const n of doneNodes.filter((x) => x.kind === 'lesson')) assert.ok(state.nodes[n.id]?.level >= 1, `${n.id} stays done`);
  // A kanji or reading lesson whose items were all learned counts as done wherever it now sits.
  const kanji = NODES.find((n) => n.kind === 'kanji');
  assert.ok(kanji.items.every((id) => items[id]) && state.nodes[kanji.id], 'the moved kanji lesson is still done');
  // Nothing the learner has not learned is marked done, and a second migration changes nothing.
  for (const n of NODES.filter((x) => ['lesson', 'read', 'kanji'].includes(x.kind) && state.nodes[x.id])) assert.ok(n.items.every((id) => items[id]), `${n.id} was not learned`);
  assert.deepEqual(migrate(state, T0).nodes, state.nodes);
});

test('every course has its own bumped version, so rebuilt paths are migrated', async () => {
  const { COURSE_VERSIONS } = await import('../app/js/progress.js');
  assert.deepEqual(Object.keys(COURSE_VERSIONS).sort(), ['en', 'es', 'fr', 'ja', 'zh']);
  assert.ok(COURSE_VERSIONS.ja >= 10 && COURSE_VERSIONS.zh >= 11 && COURSE_VERSIONS.fr >= 11 && COURSE_VERSIONS.es >= 11 && COURSE_VERSIONS.en >= 10);
});

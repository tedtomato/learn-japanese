// Usability rules: hearts, the review grace period, testing out of a unit, the review estimate, the
// weekly recap, goal suggestion, streak milestones and the speed-timer default.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState, costsHeart, retryAgain, RETRY_MAX_MISSES, completeSession, nodeNeedsReview, reviewEstimate, REVIEW_ITEMS,
  unitIsLocked, unitReview, testOutUnit, isNodeDone, currentNodeIndex, weeklyRecap, showRecap, weekKey, suggestGoal, speedOn,
  unitLessonsDone, migrate, dayKey,
} from '../app/js/progress.js';
import { review } from '../app/js/srs.js';
import { NODES, SECTIONS } from '../app/js/course.js';

const DAY = 86400000;
const T0 = new Date(2026, 10, 9, 10, 0).getTime();
const units = SECTIONS.flatMap((s) => s.units);

test('hearts: no loss in a first play or in the retry round; replays of finished nodes still cost one', () => {
  assert.equal(costsHeart({ mode: 'lesson', level: 0 }), false, 'first play is free');
  assert.equal(costsHeart({ mode: 'lesson', level: 1, retryRound: true }), false, 'retry round is free');
  assert.equal(costsHeart({ mode: 'lesson', level: 1, noHeart: true }), false, 'speech misses are free');
  assert.equal(costsHeart({ mode: 'practice', level: 0 }), false, 'practice is free');
  assert.equal(costsHeart({ mode: 'lesson', level: 2 }), true, 'a replay costs a heart');
});

test('retry round: a task comes back once, after the second miss the answer is shown and we move on', () => {
  assert.equal(RETRY_MAX_MISSES, 2);
  assert.equal(retryAgain(1), true);
  assert.equal(retryAgain(2), false);
  assert.equal(retryAgain(3), false);
});

test('grace period: something just learned is not due (or flagged for review) for a day', () => {
  for (const outcome of [{ right: 1, wrong: 0 }, { right: 1, wrong: 0, hesitated: 1 }, { right: 0, wrong: 1 }]) {
    const r = review(null, outcome, T0, 'w');
    assert.ok(r.due - T0 >= DAY, `first review is at least a day away (${JSON.stringify(outcome)})`);
  }
  // A finished lesson is not flagged "needs review" minutes later, even if every word was shaky.
  const s = defaultState(T0);
  const node = NODES.find((n) => n.kind === 'lesson');
  const results = new Map(node.items.map((id) => [id, { right: 1, wrong: 1, hesitated: 0 }]));
  completeSession(s, { node, mode: 'lesson', results, mistakes: node.items.length, now: T0 });
  assert.equal(nodeNeedsReview(s, node, T0 + 5 * 60000), false, 'not stale five minutes later');
  assert.equal(nodeNeedsReview(s, node, T0 + 2 * DAY), true, 'stale once the words are due');
  // An item that is already known keeps the normal schedule (a mistake is due at once).
  const known = review({ box: 2, seen: 5, right: 5, wrong: 0, slow: 0, first: T0 - 9 * DAY }, { right: 0, wrong: 1 }, T0, 'w');
  assert.equal(known.due, T0);
  assert.equal(known.first, T0 - 9 * DAY, 'the first-seen time is kept');
});

test('review estimate follows the real session size (8 words), not everything that is due', () => {
  assert.deepEqual(reviewEstimate(0), { items: 0, minutes: 0 });
  const e = reviewEstimate(114);
  assert.equal(e.items, REVIEW_ITEMS);
  assert.ok(e.minutes >= 2 && e.minutes <= 4, `about 3 minutes, got ${e.minutes}`);
  assert.equal(reviewEstimate(3).items, 3);
  assert.equal(reviewEstimate(114).minutes, reviewEstimate(9).minutes, 'a long backlog does not change the length of one session');
});

test('test out: a unit ahead of the path is locked; passing marks its lessons played, the review and chests stay', () => {
  const s = defaultState(T0);
  const ahead = units[2];
  assert.ok(unitReview(ahead), 'unit has a review to play');
  assert.equal(unitIsLocked(s, units[0]), false, 'the first unit is open');
  assert.equal(unitIsLocked(s, ahead), true, 'a later unit is locked');
  const marked = testOutUnit(s, ahead);
  const lessons = ahead.nodes.filter((n) => ['lesson', 'read', 'kanji'].includes(n.kind));
  assert.equal(marked, lessons.length);
  assert.ok(lessons.every((n) => s.nodes[n.id].level === 1), 'lessons count as level 1');
  assert.equal(unitLessonsDone(s, ahead), true, 'so its mission is open');
  assert.equal(isNodeDone(s, unitReview(ahead)), false, 'the trophy still has to be earned');
  assert.equal(unitIsLocked(s, ahead), false, 'the unit is no longer locked');
  assert.equal(currentNodeIndex(s), 0, 'the path itself still starts at the beginning');
  assert.equal(testOutUnit(s, ahead), 0, 'doing it twice changes nothing');
});

test('test out is a session of its own: XP and streak count, the review node and hearts are not touched', () => {
  const s = defaultState(T0);
  const review = unitReview(units[3]);
  const results = new Map(review.items.slice(0, 3).map((id) => [id, { right: 1, wrong: 0 }]));
  const sum = completeSession(s, { node: null, mode: 'test', results, mistakes: 0, now: T0 });
  assert.ok(sum.xp > 0);
  assert.equal(s.hearts.count, 5);
  assert.equal(s.nodes[review.id], undefined);
  assert.equal(sum.levelUp, null);
});

test('streak milestones are reported on the day the streak reaches 7, 30 and 100', () => {
  const s = defaultState(T0);
  const node = NODES.find((n) => n.kind === 'lesson');
  const results = new Map(node.items.map((id) => [id, { right: 1, wrong: 0 }]));
  const got = [];
  for (let d = 0; d < 100; d++) {
    const sum = completeSession(s, { node, mode: 'lesson', results, mistakes: 0, now: T0 + d * DAY });
    if (sum.milestone) got.push([sum.streak, sum.milestone]);
  }
  assert.deepEqual(got, [[7, 7], [30, 30], [100, 100]]);
});

test('weekly recap: new words, accuracy, weakest words, streak; shown once a week', () => {
  const s = defaultState(T0 - 10 * DAY);
  const node = NODES.find((n) => n.kind === 'lesson');
  const results = new Map(node.items.map((id) => [id, { right: 3, wrong: 1 }]));
  completeSession(s, { node, mode: 'lesson', results, mistakes: 1, now: T0 - 2 * DAY });
  const r = weeklyRecap(s, T0);
  assert.equal(r.accuracy, 75);
  assert.ok(r.newWords >= 1);
  assert.equal(r.daysStudied, 1);
  assert.ok(r.weakest.length >= 1 && r.weakest.length <= 5);
  assert.equal(showRecap(s, T0), true);
  s.recapWeek = weekKey(T0);
  assert.equal(showRecap(s, T0), false, 'dismissed for this week');
  assert.equal(showRecap(defaultState(T0), T0), false, 'nothing to recap for a brand-new learner');
  // Old saves have no answer log: the recap still works.
  assert.equal(migrate({ xp: 5 }, T0).answers && typeof migrate({ xp: 5 }, T0).answers, 'object');
});

test('goal suggestion follows the last 7 days', () => {
  const s = defaultState(T0 - 30 * DAY);
  assert.equal(suggestGoal(s, T0), null, 'no history, no suggestion');
  for (const d of [1, 2, 3, 5]) s.daily[dayKey(T0 - d * DAY)] = 35;
  assert.equal(suggestGoal(s, T0), 30, 'studies ~35 XP a day: Serious');
  s.dailyGoal = 30;
  assert.equal(suggestGoal(s, T0), null, 'already fits');
  s.dailyGoal = 50;
  for (const d of [1, 2, 3, 5]) s.daily[dayKey(T0 - d * DAY)] = 12;
  assert.equal(suggestGoal(s, T0), 10, 'studies ~12 XP a day: Casual');
});

test('speed timer is off for a new learner until two lessons are finished; a chosen setting wins', () => {
  const s = defaultState(T0);
  assert.equal(speedOn(s), false);
  s.stats.lessons = 2;
  assert.equal(speedOn(s), true);
  s.settings.speed = false;
  assert.equal(speedOn(s), false, 'chosen off stays off');
  const old = migrate({ settings: { speed: true } }, T0);
  assert.equal(speedOn(old), true, 'an existing learner who had it on keeps it');
});

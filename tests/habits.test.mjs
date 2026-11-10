// Daily habits: quests, double XP, streak repair, trip countdown, word of the day.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState, completeSession, recordActivity, displayStreak, ensureQuests, questList, pickQuests, bumpQuests, claimQuestChest, QUEST_POOL,
  doubleXpActive, grantDoubleXp, DOUBLE_XP_MS, repairOffer, repairStreak, REPAIR_PRICE, tripDaysLeft, tripPlan, wordOfTheDay, recordSigns, migrate,
} from '../app/js/progress.js';
import { NODES } from '../app/js/course.js';

const DAY = 86400000;
const MON = new Date(2026, 9, 19, 10, 0).getTime(); // a Monday
const SUN = new Date(2026, 9, 18, 10, 0).getTime();
const results = (n, wrong = 0) => new Map(Array.from({ length: n }, (_, i) => [`x${i}`, { right: 1, wrong: i < wrong ? 1 : 0 }]));
const lesson = (s, now, extra = {}) => completeSession(s, { node: NODES[0], mode: 'lesson', results: results(6), mistakes: 0, now, ...extra });

test('quests: three different ones per day, same all day, new after midnight', () => {
  const s = defaultState(MON);
  const list = questList(s, MON);
  assert.equal(list.length, 3);
  assert.equal(new Set(list.map((q) => q.def.metric)).size, 3);
  assert.deepEqual(pickQuests('2026-10-19').map((q) => q.id), list.map((q) => q.def.id));
  s.quests.items[0].p = 1; // some progress
  assert.equal(ensureQuests(s, MON + 3600000).items[0].p, 1, 'same day keeps progress');
  const next = ensureQuests(s, MON + DAY);
  assert.equal(next.day, '2026-10-20');
  assert.ok(next.items.every((it) => it.p === 0 && !it.paid), 'a fresh set at midnight');
  assert.equal(next.chest, false);
});

test('quests: progress comes from sessions, pays gems once, and all three open the chest', () => {
  const s = defaultState(MON);
  s.quests = { day: '2026-10-19', items: [{ id: 'lessons2', p: 0, paid: false }, { id: 'run5', p: 0, paid: false }, { id: 'game1', p: 0, paid: false }], chest: false };
  const gems = s.gems;
  let r = lesson(s, MON, { bestRun: 6 });
  assert.deepEqual(r.quests.done.map((q) => q.id), ['run5']);
  assert.equal(questList(s, MON)[0].p, 1);
  r = lesson(s, MON + 1000, { bestRun: 2 });
  assert.deepEqual(r.quests.done.map((q) => q.id), ['lessons2']);
  assert.equal(r.quests.chestReady, false);
  const res = recordSigns(s, new Map(), 3, MON + 2000);
  assert.deepEqual(res.done.map((q) => q.id), ['game1']);
  assert.equal(res.chestReady, true);
  assert.equal(s.quests.chest, 'ready');
  // 2 lessons paid 2 gems each, +5 for the daily goal (30 XP), quest gems 5 + 4 + 4, and 3 gems from the game
  assert.equal(s.gems, gems + 2 * 2 + 5 + 5 + 4 + 4 + 3);
  assert.equal(bumpQuests(s, MON + 3000, { games: 1 }).done.length, 0, 'a finished quest pays only once');
  const before = s.gems;
  const claim = claimQuestChest(s, MON + 4000);
  assert.equal(claim.minutes, 15);
  assert.ok(s.gems > before);
  assert.equal(doubleXpActive(s, MON + 5000), true);
  assert.equal(claimQuestChest(s, MON + 6000), null, 'the chest opens once a day');
});

test('quests: 90% accuracy needs a lesson with enough answers, review words count practice items', () => {
  const s = defaultState(MON);
  s.quests = { day: '2026-10-19', items: [{ id: 'acc90', p: 0, paid: false }, { id: 'words10', p: 0, paid: false }, { id: 'goal', p: 0, paid: false }], chest: false };
  completeSession(s, { node: NODES[0], mode: 'lesson', results: results(10, 3), mistakes: 3, now: MON });
  assert.equal(s.quests.items[0].paid, false, '7 of 10 is under 90%');
  completeSession(s, { node: null, mode: 'practice', results: results(10), mistakes: 0, now: MON });
  assert.equal(s.quests.items[1].paid, true, '10 words reviewed');
  assert.equal(s.quests.items[2].paid, true, 'the daily goal (20 XP) was reached by then');
  completeSession(s, { node: NODES[0], mode: 'lesson', results: results(10, 1), mistakes: 1, now: MON });
  assert.equal(s.quests.items[0].paid, true);
});

test('quests: old saves load and get quests on first use', () => {
  const s = migrate({ xp: 5 }, MON);
  assert.equal(s.quests, null);
  assert.equal(questList(s, MON).length, 3);
  assert.ok(QUEST_POOL.every((q) => q.gems > 0 && q.target > 0));
});

test('double XP: doubles lesson XP for 15 minutes, then stops', () => {
  const s = defaultState(MON);
  grantDoubleXp(s, MON);
  assert.equal(s.doubleXpUntil, MON + DOUBLE_XP_MS);
  assert.equal(lesson(s, MON + 1000).xp, 30, '(10 + 5 perfect) x 2');
  assert.equal(lesson(s, MON + DOUBLE_XP_MS + 1).xp, 15, 'back to normal');
  assert.equal(doubleXpActive(s, MON + DOUBLE_XP_MS + 1), false);
});

test('double XP: the first lesson on a Sunday starts the window, once', () => {
  const s = defaultState(SUN);
  const first = lesson(s, SUN);
  assert.equal(first.sundayBonus, true);
  assert.equal(first.xp, 30);
  assert.equal(doubleXpActive(s, SUN + 60000), true);
  const later = new Date(2026, 9, 18, 18, 0).getTime();
  assert.equal(lesson(s, later).sundayBonus, false, 'only the first lesson of the Sunday');
  assert.equal(lesson(s, later).xp, 15);
  const monday = lesson(defaultState(MON), MON);
  assert.equal(monday.sundayBonus, false);
  assert.equal(monday.xp, 15);
});

test('streak repair: a streak that broke within 2 days can be bought back, once', () => {
  const s = defaultState(MON);
  s.gems = 150;
  s.streak = { count: 12, lastDay: '2026-10-19', freezes: 0, best: 12, lost: null };
  const now = MON + 2 * DAY; // missed the 20th: lapsed
  assert.equal(displayStreak(s, now), 0);
  assert.equal(repairOffer(s, now).count, 12);
  assert.equal(repairOffer(s, MON + DAY), null, 'not broken yet');
  assert.equal(repairOffer(s, MON + 5 * DAY), null, 'too long ago');
  assert.equal(repairStreak(s, now), 12);
  assert.equal(s.gems, 150 - REPAIR_PRICE);
  assert.equal(displayStreak(s, now), 12);
  assert.equal(repairOffer(s, now), null, 'nothing left to repair');
  recordActivity(s, now);
  assert.equal(s.streak.count, 13);
});

test('streak repair: also after the streak restarted at 1, with the days studied since added', () => {
  const s = defaultState(MON);
  s.gems = 99;
  s.streak = { count: 8, lastDay: '2026-10-19', freezes: 0, best: 8, lost: null };
  const back = MON + 2 * DAY;
  recordActivity(s, back); // restarts at 1, remembers 8
  assert.equal(s.streak.count, 1);
  assert.equal(s.streak.lost.count, 8);
  assert.equal(repairStreak(s, back), 0, 'not enough gems');
  s.gems = 100;
  assert.equal(repairOffer(s, back).count, 9);
  assert.equal(repairStreak(s, back), 9);
  assert.equal(repairOffer(s, back), null, 'only once');
  assert.equal(s.streak.best, 9);
});

test('streak repair: a freeze that saved the streak means nothing to repair; late repairs expire', () => {
  const s = defaultState(MON);
  s.streak = { count: 5, lastDay: '2026-10-19', freezes: 1, best: 5, lost: null };
  assert.equal(repairOffer(s, MON + 2 * DAY), null, 'the freeze covers the missed day');
  s.streak = { count: 8, lastDay: '2026-10-19', freezes: 0, best: 8, lost: null };
  recordActivity(s, MON + 2 * DAY);
  assert.equal(repairOffer(s, MON + 5 * DAY), null, 'expired after 2 days');
});

test('trip countdown: days left, the day itself, and gone afterwards', () => {
  const s = defaultState(MON);
  assert.equal(tripDaysLeft(s, MON), null, 'no date');
  s.settings.tripDate = '2026-11-11';
  assert.equal(tripDaysLeft(s, MON), 23);
  assert.equal(tripDaysLeft(s, new Date(2026, 10, 11, 23, 50).getTime()), 0, 'the day itself');
  assert.equal(tripDaysLeft(s, new Date(2026, 10, 12, 0, 5).getTime()), null, 'hidden after the date');
  s.settings.tripDate = 'soon';
  assert.equal(tripDaysLeft(s, MON), null, 'junk is ignored');
});

test('trip plan: lessons a day to finish section 1, and the goal that fits', () => {
  const s = defaultState(MON);
  s.settings.tripDate = '2026-11-02'; // 14 days
  const plan = tripPlan(s, MON);
  assert.equal(plan.days, 14);
  assert.ok(plan.left > 10);
  assert.equal(plan.perDay, Math.ceil(plan.left / 14));
  assert.ok([10, 20, 30, 50].includes(plan.goal));
  assert.ok(plan.goal >= Math.min(50, plan.perDay * 10));
  s.settings.tripDate = '2026-10-19';
  assert.equal(tripPlan(s, MON), null, 'on the day there is no plan');
});

test('word of the day: the learned word due soonest, with its meaning', () => {
  const s = defaultState(MON);
  assert.equal(wordOfTheDay(s, MON), null);
  const ids = [...new Set(NODES.flatMap((n) => n.items || []))].filter((id) => id.startsWith('w-')).slice(0, 3);
  s.items[ids[0]] = { box: 1, seen: 2, right: 2, wrong: 0, last: MON, due: MON + 10 * DAY };
  assert.equal(wordOfTheDay(s, MON), null, 'nothing due soon');
  s.items[ids[1]] = { box: 1, seen: 2, right: 2, wrong: 0, last: MON, due: MON + DAY };
  s.items[ids[2]] = { box: 1, seen: 2, right: 2, wrong: 0, last: MON, due: MON - DAY };
  const w = wordOfTheDay(s, MON);
  assert.ok(w.en && w.jp);
  assert.equal(w.en, wordOfTheDay(s, MON).en);
});

test('reminder text: evening variant warns the streak ends tonight, and both carry the word of the day', async () => {
  const { reminderText } = await import('../app/js/reminders.js');
  const s = defaultState(MON);
  const ids = [...new Set(NODES.flatMap((n) => n.items || []))].filter((id) => id.startsWith('w-')).slice(0, 2);
  for (const id of ids) s.items[id] = { box: 1, seen: 2, right: 2, wrong: 0, last: MON, due: MON };
  s.streak = { count: 5, lastDay: '2026-10-19', freezes: 0, best: 5, lost: null };
  const text = reminderText(s, MON + DAY);
  assert.match(text.body, /5-day streak/);
  assert.match(text.evening, /ends tonight/);
  assert.match(text.body, /Word of the day: /);
  assert.match(text.evening, /Word of the day: /);
  s.streak = { count: 0, lastDay: null, freezes: 0, best: 0, lost: null };
  assert.equal(reminderText(s, MON).evening, reminderText(s, MON).body, 'no streak, nothing at risk');
});

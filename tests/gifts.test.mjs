// Daily gift, lucky lessons, perfect runs, weekly treasure, unit completion and streak states.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState, migrate, completeSession, dailyGift, claimGift, giftReady, luckyNode, streakState, weeklyTreasureIn, milestoneRow,
  unitFinished, openUnitGift, dayKey, MAX_FREEZES, GEMS_BONUS_CHEST, GEMS_WEEKLY, GEMS_LUCKY, GEMS_UNIT_GIFT, DOUBLE_XP_MS, doubleXpActive,
} from '../app/js/progress.js';
import { NODES, SECTIONS } from '../app/js/course.js';

const DAY = 86400000;
const T0 = new Date(2026, 10, 9, 10, 0).getTime();
const lessons = NODES.filter((n) => n.kind === 'lesson');
const results = (node) => new Map(node.items.map((id) => [id, { right: 1, wrong: 0 }]));
const finish = (state, node, now, mistakes = 0) => completeSession(state, { node, mode: 'lesson', results: results(node), mistakes, now });
const started = (now = T0) => {
  const s = defaultState(now);
  s.stats.lessons = 1;
  return s;
};

test('daily gift: seeded by the day, claimed once, from the contract rewards', () => {
  const s = started();
  assert.equal(giftReady(s, T0), true);
  assert.deepEqual(dailyGift(s, T0), dailyGift(s, T0 + 3 * 3600000), 'same all day');
  const kinds = new Set();
  for (let d = 0; d < 200; d++) {
    const r = dailyGift(started(), T0 + d * DAY);
    if (r.gems && !r.text) assert.ok(r.gems >= 5 && r.gems <= 15);
    kinds.add(r.freeze ? 'freeze' : r.doubleXpMs ? 'xp' : r.text ? 'text' : 'gems');
  }
  assert.deepEqual([...kinds].sort(), ['freeze', 'gems', 'text', 'xp']);
  const before = s.gems;
  const reward = claimGift(s, T0);
  assert.ok(reward);
  assert.equal(s.gift.claimed, true);
  assert.equal(giftReady(s, T0), false);
  assert.equal(claimGift(s, T0 + 1000), null, 'only once a day');
  assert.ok(s.gems >= before);
  assert.equal(giftReady(s, T0 + DAY), true, 'a new one tomorrow');
});

test('daily gift: applies each reward, and never overfills the freezes', () => {
  let freeze = null;
  let xp = null;
  for (let d = 0; d < 300 && !(freeze && xp); d++) {
    const now = T0 + d * DAY;
    const r = dailyGift(started(), now);
    if (r.freeze) freeze = now;
    if (r.doubleXpMs) xp = now;
  }
  const a = started(freeze);
  claimGift(a, freeze);
  assert.equal(a.streak.freezes, 1);
  const full = started(freeze);
  full.streak.freezes = MAX_FREEZES;
  assert.ok(dailyGift(full, freeze).gems, 'a full set of freezes turns into gems');
  const b = started(xp);
  claimGift(b, xp);
  assert.equal(doubleXpActive(b, xp), true);
  assert.ok(b.doubleXpUntil - xp >= DOUBLE_XP_MS - 1);
});

test('daily gift: waits for the first lesson, and older saves migrate', () => {
  assert.equal(giftReady(defaultState(T0), T0), false);
  const old = { ...defaultState(T0) };
  delete old.gift;
  delete old.unitGifts;
  old.stats = { lessons: 4, perfect: 1 };
  const m = migrate(old, T0);
  assert.equal(m.gift, null);
  assert.deepEqual(m.unitGifts, {});
  assert.equal(m.stats.perfectRun, 0);
  assert.equal(giftReady(m, T0), true);
  assert.deepEqual(migrate({ ...old, gift: { day: dayKey(T0), claimed: true } }, T0).gift, { day: dayKey(T0), claimed: true });
});

test('lucky lesson: stable per day, about one in six, never for finished lessons', () => {
  const s = defaultState(T0);
  const day = dayKey(T0);
  let lucky = 0;
  let total = 0;
  for (let d = 0; d < 40; d++) {
    const k = dayKey(T0 + d * DAY);
    for (const n of lessons) {
      const a = luckyNode(s, n.id, k);
      assert.equal(a, luckyNode(s, n.id, k), 'same answer all day');
      total += 1;
      if (a) lucky += 1;
    }
  }
  const share = lucky / total;
  assert.ok(share > 0.1 && share < 0.23, `about 1 in 6 (got ${share.toFixed(3)})`);
  const pick = lessons.find((n) => luckyNode(s, n.id, day));
  assert.ok(pick);
  s.nodes[pick.id] = { level: 1 };
  assert.equal(luckyNode(s, pick.id, day), false, 'finished lessons are not lucky');
  assert.equal(luckyNode(s, NODES.find((n) => n.kind === 'chest').id, day), false);
});

test('lucky lesson: finishing it the first time pays the bonus gems', () => {
  const s = started();
  const day = dayKey(T0);
  const node = lessons.find((n) => luckyNode(s, n.id, day));
  const plain = lessons.find((n) => !luckyNode(s, n.id, day));
  const gems = s.gems;
  const sum = finish(s, node, T0);
  assert.equal(sum.luckyGems, GEMS_LUCKY);
  assert.ok(s.gems >= gems + GEMS_LUCKY);
  assert.equal(finish(s, plain, T0 + 1).luckyGems, 0);
  assert.equal(finish(s, node, T0 + 2).luckyGems, 0, 'a replay is not lucky');
});

test('perfect run: three perfect lessons open a bonus chest, then the run starts again', () => {
  const s = started();
  const out = [];
  for (let i = 0; i < 4; i++) out.push(finish(s, lessons[i], T0 + i));
  assert.deepEqual(out.map((o) => o.bonusChest), [false, false, true, false]);
  assert.deepEqual(out.map((o) => o.perfectRun), [1, 2, 3, 1]);
  assert.equal(s.stats.perfectRun, 1);
  const g = s.gems;
  const miss = finish(s, lessons[4], T0 + 10, 2);
  assert.equal(miss.perfectRun, 0, 'a mistake breaks the run');
  assert.equal(s.gems - g, miss.gems);
  const t = started();
  for (let i = 0; i < 2; i++) finish(t, lessons[i], T0 + i);
  const before = t.gems;
  const third = finish(t, lessons[2], T0 + 5);
  assert.ok(t.gems - before >= third.gems + GEMS_BONUS_CHEST);
});

test('weekly treasure: the 7th and 14th streak days', () => {
  const s = started(T0);
  const flags = [];
  for (let d = 0; d < 15; d++) {
    const gems = s.gems;
    const sum = finish(s, lessons[d % lessons.length], T0 + d * DAY);
    flags.push(sum.weeklyChest);
    if (sum.weeklyChest) assert.ok(s.gems - gems >= GEMS_WEEKLY);
  }
  assert.deepEqual(flags.map((f, i) => (f ? i + 1 : 0)).filter(Boolean), [7, 14]);
  assert.equal(finish(s, lessons[0], T0 + 14 * DAY + 3600000).weeklyChest, false, 'a second lesson the same day pays nothing');
  assert.equal(weeklyTreasureIn(s, T0 + 14 * DAY), 7 - (15 % 7), 'counts down from day 15');
  assert.equal(weeklyTreasureIn(defaultState(T0), T0), 7);
});

test('unit complete: fires once, on the unit\'s last lesson, and leaves a gift box', () => {
  const unit = SECTIONS[0].units[0];
  const playable = unit.nodes.filter((n) => ['lesson', 'read', 'kanji'].includes(n.kind));
  const s = started();
  const fired = [];
  playable.forEach((n, i) => fired.push(finish(s, n, T0 + i).unitComplete));
  assert.deepEqual(fired.slice(0, -1).filter(Boolean), []);
  assert.deepEqual(fired.at(-1), { title: unit.title, color: unit.color });
  assert.equal(unitFinished(s, unit), true);
  assert.equal(s.unitGifts[unit.id], 'ready');
  assert.equal(finish(s, playable[0], T0 + 99).unitComplete, null, 'a replay does not fire again');
  assert.equal(openUnitGift(s, unit.id), GEMS_UNIT_GIFT);
  assert.equal(openUnitGift(s, unit.id), 0, 'opens once');
});

test('streak states: open, secured, and at risk after 20:00', () => {
  const s = started();
  const morning = new Date(2026, 10, 9, 9, 0).getTime();
  const evening = new Date(2026, 10, 9, 21, 0).getTime();
  assert.equal(streakState(s, evening), 'open', 'no streak, nothing to lose');
  finish(s, lessons[0], morning - DAY);
  assert.equal(streakState(s, morning), 'open');
  assert.equal(streakState(s, evening), 'risk');
  assert.equal(streakState(s, new Date(2026, 10, 9, 19, 59).getTime()), 'open');
  finish(s, lessons[1], morning);
  assert.equal(streakState(s, evening), 'secured');
  const m = milestoneRow(s, evening);
  assert.equal(m.next, 7);
  assert.equal(m.toGo, 5);
  assert.deepEqual(m.badges.map((b) => b.earned), [false, false, false, false]);
});

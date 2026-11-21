import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQueue, queueMoment, pendingMoments, clearMoments, weekOf, LINES, mascotLine, MOMENT_KINDS } from '../app/js/moments.js';
import { mascotSvg, MOODS } from '../app/js/mascot.js';
import { SFX_NAMES, SFX_ALIASES } from '../app/js/audio.js';
import { t } from '../app/js/strings.js';

const full = { streakExtended: true, streak: 7, milestone: 7, goalReached: true, xp: 15, quests: { chestReady: true }, bonusChest: true, weeklyChest: true, unitComplete: { title: 'Greetings', color: '#58cc02' }, levelUp: 3 };
const ach = [{ title: 'First steps', desc: 'Finish your first lesson', icon: '🌱' }, { title: 'First steps', desc: 'dup', icon: '🌱' }, { title: 'On fire', desc: 'Reach a 7 day streak', icon: '🔥' }];

test('buildQueue: order is streak, goal, chests, unit, achievements, level-up', () => {
  const q = buildQueue(full, ach, { week: [], goal: 50, xpToday: 55, questsChest: { gems: 20, minutes: 15 }, maxLevel: 3, nodeTitle: 'Hello' });
  assert.deepEqual(q.map((m) => m.kind), ['streak', 'goal', 'chest', 'chest', 'chest', 'unit', 'achievement', 'achievement']); // level-up is skipped after a unit
  assert.deepEqual(q.filter((m) => m.kind === 'chest').map((m) => m.source), ['quests', 'perfect3', 'weekly']);
  assert.equal(q[0].milestone, 7);
  assert.equal(new Set(q.map((m) => m.kind + m.title + m.source)).size, q.length, 'no duplicates');
});

test('buildQueue: nothing to celebrate, nothing queued; level-up only at the top level', () => {
  assert.deepEqual(buildQueue({}, []), []);
  assert.deepEqual(buildQueue({ levelUp: 2 }, [], { maxLevel: 3, nodeTitle: 'x' }), []);
  assert.equal(buildQueue({ levelUp: 3 }, [], { maxLevel: 3, nodeTitle: 'x' })[0].kind, 'levelup');
});

test('queueMoment ignores repeats and unknown input', () => {
  clearMoments();
  queueMoment({ kind: 'gift', title: 'a' });
  queueMoment({ kind: 'gift', title: 'a' });
  queueMoment({ kind: 'gift', title: 'b' });
  queueMoment(null);
  assert.equal(pendingMoments(), 2);
  clearMoments();
  assert.equal(pendingMoments(), 0);
  assert.ok(MOMENT_KINDS.includes('streak'));
});

test('weekOf marks today and the days with XP', () => {
  const now = Date.UTC(2026, 10, 21, 12);
  const key = (ms) => new Date(ms).toISOString().slice(0, 10);
  const w = weekOf(now, { [key(now)]: 10, [key(now - 86400000)]: 5 }, key);
  assert.equal(w.length, 7);
  assert.deepEqual(w.map((d) => d.on), [false, false, false, false, false, true, true]);
  assert.equal(w.filter((d) => d.today).length, 1);
});

test('mascot poses render for the shiba and the panda', () => {
  for (const mood of MOODS) for (const panda of [false, true]) {
    const svg = mascotSvg(mood, 80, panda);
    assert.ok(svg.includes(`mood-${mood}`) && svg.startsWith('<svg') && svg.endsWith('</svg>'), `${mood} ${panda}`);
  }
  for (const m of ['jump', 'trophy', 'cool', 'party', 'sleepy', 'think']) assert.ok(MOODS.includes(m));
  assert.notEqual(mascotSvg('cool', 80, false), mascotSvg('happy', 80, false));
});

test('sound effects for the moments exist', () => {
  for (const n of ['fanfare', 'coins', 'whoosh', 'chest', 'levelup', 'gift', 'flame']) assert.ok(SFX_NAMES.includes(SFX_ALIASES[n] || n), n);
});

test('mascot lines: 8+ per situation, varied, never repeating the previous one', () => {
  for (const sit of ['start', 'gift', 'run3', 'run5', 'run10', 'wrong', 'end', 'streak', 'goal', 'quit']) {
    assert.ok(LINES[sit].length >= 8, sit);
    assert.equal(new Set(LINES[sit]).size, LINES[sit].length);
    for (let i = 0; i < 20; i++) assert.notEqual(mascotLine(sit, LINES[sit][0], () => i / 20), LINES[sit][0]);
  }
  assert.equal(t('Open'), 'Open'); // English course: the key itself
});

test('every mascot line and moment string has a French entry', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../app/js/strings.js', import.meta.url), 'utf8');
  const has = (k) => src.includes(`'${k.replace(/'/g, "\\'")}':`) || src.includes(`${JSON.stringify(k)}:`) || src.includes(`"${k}":`);
  for (const [sit, list] of Object.entries(LINES)) for (const l of list) assert.ok(has(l), `${sit}: ${l}`);
  for (const k of ['Skip all', 'Open', 'Surprise!', 'Achievement unlocked', 'Unit complete!', 'Streak started!', 'A gift for you!']) assert.ok(has(k), k);
});

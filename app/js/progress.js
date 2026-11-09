// Learner progress: pure functions over a plain state object, plus saving to the device.
import { NODES, MAX_LEVEL, ITEMS } from './course.js';
import { review, isDue, strength } from './srs.js';
import { L, COURSES } from './lang.js';

// Each course keeps its own progress; test mode keeps its own copy too.
export const STORAGE_KEY = L.storageKey;
export const TEST_STORAGE_KEY = L.testKey;
export const MAX_HEARTS = 5;
export const HEART_REFILL_MS = 30 * 60 * 1000;
export const XP_LESSON = 10;
export const XP_PERFECT_BONUS = 5;
export const GEMS_LESSON = 2;
export const GEMS_CHEST = 15;
export const FREEZE_PRICE = 50;
export const HEARTS_PRICE = 30; // gems for a full set of hearts
export const MAX_FREEZES = 2;

// Bumped when a course's path is rebuilt, so finished lessons are carried over. One number per course,
// so rebuilding the Japanese path does not re-migrate the others.
// Bumped per course when its path is rebuilt (lessons moved or added), so finished lessons carry over.
export const COURSE_VERSIONS = { ja: 10, zh: 11, fr: 11, es: 11, en: 10 };
export const COURSE_VERSION = COURSE_VERSIONS[L.code] ?? 9;

export function defaultState(now = Date.now()) {
  return {
    version: 1,
    course: COURSE_VERSION,
    createdAt: now,
    xp: 0,
    daily: {},
    dailyGoal: 20,
    gems: 20,
    streak: { count: 0, lastDay: null, freezes: 0, best: 0 },
    hearts: { count: MAX_HEARTS, updatedAt: now },
    nodes: {},
    items: {},
    stats: { lessons: 0, perfect: 0 },
    seen: { fact: [], phrase: [], kanji: [], pron: [] },
    missions: {}, // mission id → best stars (1–3)
    answers: {}, // day → [right, wrong] answers that day (for the weekly recap)
    recapWeek: null, // the week (its Monday) whose recap card was dismissed
    backupAt: null, // when the last backup was saved
    settings: { theme: 'system', sfx: true, voiceRate: 0.85, speaking: true }, // speed: unset = on after 2 lessons (see speedOn)
  };
}

// Fills in anything missing so older saved progress keeps working after an update.
export function migrate(raw, now = Date.now()) {
  const base = defaultState(now);
  if (!raw || typeof raw !== 'object') return base;
  const state = {
    ...base,
    ...raw,
    streak: { ...base.streak, ...raw.streak },
    hearts: { ...base.hearts, ...raw.hearts },
    stats: { ...base.stats, ...raw.stats },
    settings: { ...base.settings, ...raw.settings },
    seen: { ...base.seen, ...raw.seen },
    nodes: raw.nodes || {},
    items: raw.items || {},
    daily: raw.daily || {},
    missions: raw.missions || {},
    answers: raw.answers || {},
  };
  if (raw.course !== COURSE_VERSION) state.nodes = carryOverNodes(state, raw.nodes || {});
  state.course = COURSE_VERSION;
  return state;
}

// After the path is rebuilt, node ids may point at different lessons: a lesson counts as done
// when all its words were already learned; chests, reviews and stories keep their old state.
function carryOverNodes(state, old) {
  const nodes = {};
  const unitStarted = new Set(Object.keys(old).filter((k) => old[k]?.level > 0).map((k) => k.replace(/-[^-]+$/, '')));
  for (const n of NODES) {
    const unitId = n.unit.id;
    if (n.kind === 'chest' || n.kind === 'review') {
      if (old[n.id]) nodes[n.id] = old[n.id];
    } else if (n.kind === 'story') {
      const lessonsDone = n.unit.nodes.filter((x) => x.kind === 'lesson').every((x) => nodes[x.id]);
      if (lessonsDone && Object.keys(old).some((k) => k.startsWith(`${unitId}-s`) && old[k]?.level > 0)) nodes[n.id] = { level: 1 };
    } else if ((unitStarted.has(unitId) || n.kind === 'kanji' || n.kind === 'read') && n.items.every((id) => state.items[id])) {
      // Reading and kanji lessons may have moved to another unit: what was learned stays done wherever it now sits.
      nodes[n.id] = { level: Math.max(1, old[n.id]?.level || 0) };
    }
  }
  return nodes;
}

// The speed-challenge countdown: whatever the learner chose, else off until they have finished 2 lessons
// (the very first graded question should not come with a 12 s clock).
export const SPEED_AFTER_LESSONS = 2;
export const speedOn = (state) => (state.settings.speed === undefined ? state.stats.lessons >= SPEED_AFTER_LESSONS : state.settings.speed !== false);

// ---- Days (local time) ----
export function dayKey(time) {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(fromKey, toKey) {
  const [a, b] = [fromKey, toKey].map((k) => {
    const [y, m, d] = k.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86400000);
}

// ---- Hearts ----
export function currentHearts(state, now) {
  const { count, updatedAt } = state.hearts;
  if (count >= MAX_HEARTS) return MAX_HEARTS;
  return Math.min(MAX_HEARTS, count + Math.floor((now - updatedAt) / HEART_REFILL_MS));
}

function settleHearts(state, now) {
  const { count, updatedAt } = state.hearts;
  const refills = Math.floor((now - updatedAt) / HEART_REFILL_MS);
  const settled = Math.min(MAX_HEARTS, count + refills);
  state.hearts = { count: settled, updatedAt: settled >= MAX_HEARTS ? now : updatedAt + refills * HEART_REFILL_MS };
}

// A mistake costs a heart only when replaying a lesson that was already finished: never during a node's
// first play (level 0), in the retry round, in practice, or when the app itself could not judge (speech).
export function costsHeart({ mode, level = 0, retryRound = false, noHeart = false }) {
  return mode === 'lesson' && level > 0 && !retryRound && !noHeart;
}
// In the retry round a missed task comes back once; after the second miss the answer is shown and we move on.
export const RETRY_MAX_MISSES = 2;
export const retryAgain = (misses) => misses < RETRY_MAX_MISSES;

export function loseHeart(state, now) {
  settleHearts(state, now);
  if (state.hearts.count >= MAX_HEARTS) state.hearts.updatedAt = now;
  state.hearts.count = Math.max(0, state.hearts.count - 1);
  return state.hearts.count;
}

export function gainHeart(state, now) {
  settleHearts(state, now);
  state.hearts.count = Math.min(MAX_HEARTS, state.hearts.count + 1);
  if (state.hearts.count >= MAX_HEARTS) state.hearts.updatedAt = now;
}

export function msToNextHeart(state, now) {
  if (currentHearts(state, now) >= MAX_HEARTS) return 0;
  return HEART_REFILL_MS - ((now - state.hearts.updatedAt) % HEART_REFILL_MS);
}

// ---- Streak ----
// The streak to show for { count, lastDay, freezes }: it lapses once more days passed than freezes cover.
export function streakAt({ count, lastDay, freezes = 0 }, now) {
  if (!lastDay) return 0;
  const gap = daysBetween(lastDay, dayKey(now));
  return gap <= 1 + freezes ? count : 0;
}
export const displayStreak = (state, now) => streakAt(state.streak, now);

export function recordActivity(state, now) {
  const today = dayKey(now);
  const s = state.streak;
  if (s.lastDay === today) return { extended: false, usedFreezes: 0 };
  let usedFreezes = 0;
  if (!s.lastDay) s.count = 1;
  else {
    const missed = daysBetween(s.lastDay, today) - 1;
    if (missed <= 0) s.count += 1;
    else if (missed <= s.freezes) {
      usedFreezes = missed;
      s.freezes -= missed;
      s.count += 1;
    } else s.count = 1;
  }
  s.lastDay = today;
  s.best = Math.max(s.best, s.count);
  return { extended: true, usedFreezes };
}

export const studiedToday = (state, now) => state.streak.lastDay === dayKey(now);
export const todayXp = (state, now) => state.daily[dayKey(now)] || 0;

export function buyFreeze(state) {
  if (state.gems < FREEZE_PRICE || state.streak.freezes >= MAX_FREEZES) return false;
  state.gems -= FREEZE_PRICE;
  state.streak.freezes += 1;
  return true;
}

// ---- Path ----
export const nodeLevel = (state, node) => state.nodes[node.id]?.level || 0;
export const isNodeDone = (state, node) => nodeLevel(state, node) > 0;

export function currentNodeIndex(state) {
  const i = NODES.findIndex((n) => !isNodeDone(state, n));
  return i === -1 ? NODES.length : i;
}

export const isNodeUnlocked = (state, node) => isNodeDone(state, node) || node.index <= currentNodeIndex(state);

export function nodeNeedsReview(state, node, now) {
  if (!['lesson', 'read', 'kanji'].includes(node.kind) || !isNodeDone(state, node)) return false;
  const due = node.items.filter((id) => isDue(state.items[id], now)).length;
  return due > 0 && due >= node.items.length / 2;
}

export function openChest(state, node) {
  if (isNodeDone(state, node)) return 0;
  state.nodes[node.id] = { level: 1 };
  state.gems += GEMS_CHEST;
  return GEMS_CHEST;
}

// ---- Reviews ----
// A review session takes the 8 most urgent items and fills out to about 11 tasks (see generatePractice),
// each about 17 seconds. The estimate follows that, not the number of words that are due in total.
export const REVIEW_ITEMS = 8;
export const REVIEW_TASKS = 11;
export const REVIEW_FIRST_MIN = 8; // this many words fading: suggest a review before a new lesson
export function reviewEstimate(dueCount) {
  const items = Math.min(dueCount, REVIEW_ITEMS);
  return { items, minutes: items ? Math.max(1, Math.round((REVIEW_TASKS * 17) / 60)) : 0 };
}

// ---- Test out of a unit ----
export const TESTOUT_PASS = 0.85;
// A unit is "locked" until the path reaches it; its review can be played to skip ahead.
export const unitIsLocked = (state, unit) => !unit.nodes.some((n) => isNodeUnlocked(state, n)) && !unit.nodes.every((n) => isNodeDone(state, n));
export const unitReview = (unit) => unit.nodes.find((n) => n.kind === 'review');
// Passing marks the unit's lessons (and reading / kanji lessons) as played once.
export function testOutUnit(state, unit) {
  let marked = 0;
  for (const n of unit.nodes) {
    if (!['lesson', 'read', 'kanji'].includes(n.kind) || isNodeDone(state, n)) continue;
    state.nodes[n.id] = { level: 1 };
    marked += 1;
  }
  return marked;
}

// ---- Items ----
export const learnedItemIds = (state) => Object.keys(state.items).filter((id) => ITEMS.has(id));
export const dueItemIds = (state, now) => learnedItemIds(state).filter((id) => isDue(state.items[id], now));
// Words got wrong recently and not answered right since, latest mistake first.
const MISTAKE_TYPES = ['word', 'sentence', 'kanji', 'kword', 'radical', 'kana', 'fword'];
export const mistakeIds = (state) => learnedItemIds(state)
  .filter((id) => state.items[id].missed && MISTAKE_TYPES.includes(ITEMS.get(id).type))
  .sort((a, b) => state.items[b].missed - state.items[a].missed);

// ---- Finishing a session ----
export const STREAK_MILESTONES = [7, 30, 100];
const ANSWER_DAYS = 60; // how long the right / wrong log is kept
function logAnswers(state, results, now) {
  let right = 0;
  let wrong = 0;
  for (const r of results.values()) {
    right += r.right || 0;
    wrong += r.wrong || 0;
  }
  const day = dayKey(now);
  const prev = state.answers[day] || [0, 0];
  state.answers[day] = [prev[0] + right, prev[1] + wrong];
  const keep = dayKey(now - ANSWER_DAYS * 86400000);
  for (const k of Object.keys(state.answers)) if (k < keep) delete state.answers[k];
}

// results: Map itemId → { right, wrong }. mode: 'lesson' | 'practice'.
export function completeSession(state, { node, mode, results, mistakes, now, bonusXp = 0 }) {
  const missedBefore = mistakeIds(state).length;
  for (const [id, r] of results) state.items[id] = review(state.items[id], r, now, id);
  logAnswers(state, results, now);
  const mistakesLeft = mistakeIds(state).length;
  const mistakesCleared = missedBefore > 0 && mistakesLeft === 0;

  const perfect = mistakes === 0;
  const xp = XP_LESSON + (perfect ? XP_PERFECT_BONUS : 0) + bonusXp;
  state.xp += xp;
  const today = dayKey(now);
  const goalBefore = (state.daily[today] || 0) >= state.dailyGoal;
  state.daily[today] = (state.daily[today] || 0) + xp;
  const goalReached = !goalBefore && state.daily[today] >= state.dailyGoal;

  let levelUp = null;
  if (mode === 'lesson' && node) {
    const level = nodeLevel(state, node);
    const next = node.kind === 'review' ? Math.max(level, 1) : Math.min(MAX_LEVEL, level + 1);
    state.nodes[node.id] = { level: next };
    if (next !== level) levelUp = next;
  }

  let gems = GEMS_LESSON + (goalReached ? 5 : 0);
  state.gems += gems;
  if (mode === 'practice') gainHeart(state, now);

  state.stats.lessons += 1;
  if (perfect) state.stats.perfect += 1;
  const streak = recordActivity(state, now);
  if (mistakesCleared) state.gems += 5;
  const milestone = streak.extended && STREAK_MILESTONES.includes(state.streak.count) ? state.streak.count : 0;
  return { xp, gems, perfect, levelUp, goalReached, mistakesCleared, streakExtended: streak.extended, streak: state.streak.count, milestone };
}

// Hands-free listening: XP (counts for the daily goal and streak) once enough phrases were heard.
export const LISTEN_XP_MIN = 10;
export function completeListening(state, heard, now) {
  if (heard < LISTEN_XP_MIN) return 0;
  const xp = 5;
  state.xp += xp;
  const today = dayKey(now);
  state.daily[today] = (state.daily[today] || 0) + xp;
  recordActivity(state, now);
  return xp;
}

// Sign spotter: each answer is a review of the sign's kanji; +1 gem per right answer.
export function recordSigns(state, results, gems, now) {
  for (const [id, r] of results) if (state.items[id]) state.items[id] = review(state.items[id], r, now, id);
  state.gems += gems;
}

// Missions: 10 XP each time (daily goal + streak); 2 gems per star above your best.
export const unitLessonsDone = (state, unit) => unit.nodes.filter((n) => n.kind === 'lesson').every((n) => isNodeDone(state, n));
export function completeMission(state, id, stars, now) {
  const best = state.missions[id] || 0;
  const gems = Math.max(0, stars - best) * 2;
  state.missions[id] = Math.max(best, stars);
  state.gems += gems;
  const xp = 10;
  state.xp += xp;
  const today = dayKey(now);
  state.daily[today] = (state.daily[today] || 0) + xp;
  recordActivity(state, now);
  return { xp, gems, best: Math.max(best, stars), improved: stars > best };
}

// ---- Weekly recap & goal suggestion ----
const GOAL_STEPS = [10, 20, 30, 50];
const lastDays = (n, now) => Array.from({ length: n }, (_, i) => dayKey(now - i * 86400000));

// The last 7 days: words met for the first time, accuracy, the weakest words and the streak.
export function weeklyRecap(state, now) {
  const days = lastDays(7, now);
  const since = now - 7 * 86400000;
  const learned = learnedItemIds(state);
  const newWords = learned.filter((id) => ['word', 'sentence'].includes(ITEMS.get(id).type) && (state.items[id].first || 0) >= since).length;
  let right = 0;
  let wrong = 0;
  for (const d of days) {
    right += state.answers[d]?.[0] || 0;
    wrong += state.answers[d]?.[1] || 0;
  }
  const weakest = learned.filter((id) => ['word', 'sentence'].includes(ITEMS.get(id).type))
    .map((id) => ({ id, st: strength(state.items[id], now) })).sort((a, b) => a.st - b.st).slice(0, 5).map((x) => x.id);
  return {
    newWords,
    accuracy: right + wrong ? Math.round((right / (right + wrong)) * 100) : null,
    daysStudied: days.filter((d) => (state.daily[d] || 0) > 0).length,
    xp: days.reduce((sum, d) => sum + (state.daily[d] || 0), 0),
    weakest,
    streak: displayStreak(state, now),
  };
}
// Monday of the week of `now`, as a day key: the recap card shows once per week.
export function weekKey(now) {
  const d = new Date(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(d.getTime());
}
// The recap is offered once the learner has some history and has studied in the last week.
export const showRecap = (state, now) => state.recapWeek !== weekKey(now)
  && now - state.createdAt > 6 * 86400000 && lastDays(7, now).some((d) => (state.daily[d] || 0) > 0);

// A goal that fits the last 7 days: the average XP of the days studied (at least 3 of them) picks the
// nearest goal step; null when the current goal already fits.
export function suggestGoal(state, now) {
  const xps = lastDays(7, now).map((d) => state.daily[d] || 0).filter((x) => x > 0);
  if (xps.length < 3) return null;
  const avg = xps.reduce((a, b) => a + b, 0) / xps.length;
  const fits = GOAL_STEPS.filter((g) => g <= avg * 1.1);
  const goal = fits.length ? fits[fits.length - 1] : GOAL_STEPS[0];
  return goal === state.dailyGoal ? null : goal;
}

// ---- Saving on the device ----
export function loadState(storage, now = Date.now(), key = STORAGE_KEY) {
  let raw = null;
  try {
    raw = storage?.getItem(key);
    return migrate(raw ? JSON.parse(raw) : null, now);
  } catch {
    // Unreadable progress: keep the text aside, as the next save would replace it.
    try {
      if (raw) storage.setItem(`${key}.corrupt`, raw);
    } catch {
      /* nowhere to keep it */
    }
    return defaultState(now);
  }
}

export function saveState(storage, state, key = STORAGE_KEY) {
  try {
    storage?.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// A backup is due after two weeks (once there is something worth keeping: 10 things learned).
export const BACKUP_DAYS = 14;
export const backupStale = (state, now) => Object.keys(state.items).length >= 10
  && (!state.backupAt || now - state.backupAt > BACKUP_DAYS * 86400000);

export function exportBackup(state, now = Date.now()) {
  return JSON.stringify({ app: 'hajime', course: L.code, exportedAt: new Date(now).toISOString(), progress: state }, null, 1);
}

export function importBackup(text, now = Date.now()) {
  const data = JSON.parse(text);
  if (!data || data.app !== 'hajime' || typeof data.progress !== 'object') throw new Error('This is not a Hajime backup file.');
  // A backup remembers its course; restoring another course's file would overwrite this one's progress.
  if (data.course && data.course !== L.code) {
    throw new Error(`This is a ${COURSES[data.course]?.name || data.course} backup, but you are learning ${L.name}. Switch language first, then restore it.`);
  }
  return migrate(data.progress, now);
}

// Gems for a full set of hearts (only when some are missing).
export function buyHearts(state, now) {
  if (state.gems < HEARTS_PRICE || currentHearts(state, now) >= MAX_HEARTS) return false;
  state.gems -= HEARTS_PRICE;
  state.hearts = { count: MAX_HEARTS, updatedAt: now };
  return true;
}

// A short summary of this course's progress, kept beside it so the language screen can show every
// course's progress without building the other courses.
export const SUMMARY_KEY = `hajime.summary.${L.code}`;
export function courseSummary(state, now) {
  const at = currentNodeIndex(state);
  const unit = NODES[Math.min(at, NODES.length - 1)]?.unit;
  return {
    xp: state.xp,
    streak: displayStreak(state, now),
    // The streak fields, so the language screen can tell later whether it has lapsed (streakAt).
    streakCount: state.streak.count,
    lastDay: state.streak.lastDay,
    freezes: state.streak.freezes,
    done: NODES.filter((n) => isNodeDone(state, n)).length,
    total: NODES.length,
    words: learnedItemIds(state).filter((id) => ['word', 'sentence'].includes(ITEMS.get(id).type)).length,
    unit: at >= NODES.length ? 'Course complete' : unit?.title || '',
    started: state.stats.lessons > 0 || Object.keys(state.nodes).length > 0 || state.xp > 0,
  };
}

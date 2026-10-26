// Learner progress: pure functions over a plain state object, plus saving to the device.
import { NODES, MAX_LEVEL, ITEMS } from './course.js';
import { review, isDue } from './srs.js';

export const STORAGE_KEY = 'hajime.progress.v1';
export const TEST_STORAGE_KEY = 'hajime.test-progress.v1'; // test mode keeps its own copy
export const MAX_HEARTS = 5;
export const HEART_REFILL_MS = 30 * 60 * 1000;
export const XP_LESSON = 10;
export const XP_PERFECT_BONUS = 5;
export const GEMS_LESSON = 2;
export const GEMS_CHEST = 15;
export const FREEZE_PRICE = 50;
export const HEARTS_PRICE = 30; // gems for a full set of hearts
export const MAX_FREEZES = 2;

export const COURSE_VERSION = 6; // bumped when the path is rebuilt, so finished lessons are carried over

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
    seen: { fact: [], phrase: [], kanji: [] },
    missions: {}, // mission id → best stars (1–3)
    settings: { theme: 'system', sfx: true, voiceRate: 0.85, speed: true, speaking: true },
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
    } else if (unitStarted.has(unitId) && n.items.every((id) => state.items[id])) {
      nodes[n.id] = { level: Math.max(1, old[n.id]?.level || 0) };
    }
  }
  return nodes;
}

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
export function displayStreak(state, now) {
  const { count, lastDay, freezes } = state.streak;
  if (!lastDay) return 0;
  const gap = daysBetween(lastDay, dayKey(now));
  return gap <= 1 + freezes ? count : 0;
}

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

// ---- Items ----
export const learnedItemIds = (state) => Object.keys(state.items).filter((id) => ITEMS.has(id));
export const dueItemIds = (state, now) => learnedItemIds(state).filter((id) => isDue(state.items[id], now));
// Words got wrong recently and not answered right since, latest mistake first.
const MISTAKE_TYPES = ['word', 'sentence', 'kanji', 'kword', 'radical', 'kana', 'fword'];
export const mistakeIds = (state) => learnedItemIds(state)
  .filter((id) => state.items[id].missed && MISTAKE_TYPES.includes(ITEMS.get(id).type))
  .sort((a, b) => state.items[b].missed - state.items[a].missed);

// ---- Finishing a session ----
// results: Map itemId → { right, wrong }. mode: 'lesson' | 'practice'.
export function completeSession(state, { node, mode, results, mistakes, now, bonusXp = 0 }) {
  const missedBefore = mistakeIds(state).length;
  for (const [id, r] of results) state.items[id] = review(state.items[id], r, now);
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
  return { xp, gems, perfect, levelUp, goalReached, mistakesCleared, streakExtended: streak.extended, streak: state.streak.count };
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
  for (const [id, r] of results) if (state.items[id]) state.items[id] = review(state.items[id], r, now);
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

// ---- Saving on the device ----
export function loadState(storage, now = Date.now(), key = STORAGE_KEY) {
  try {
    const raw = storage?.getItem(key);
    return migrate(raw ? JSON.parse(raw) : null, now);
  } catch {
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

export function exportBackup(state, now = Date.now()) {
  return JSON.stringify({ app: 'hajime', exportedAt: new Date(now).toISOString(), progress: state }, null, 1);
}

export function importBackup(text, now = Date.now()) {
  const data = JSON.parse(text);
  if (!data || data.app !== 'hajime' || typeof data.progress !== 'object') throw new Error('This is not a Hajime backup file.');
  return migrate(data.progress, now);
}

// Gems for a full set of hearts (only when some are missing).
export function buyHearts(state, now) {
  if (state.gems < HEARTS_PRICE || currentHearts(state, now) >= MAX_HEARTS) return false;
  state.gems -= HEARTS_PRICE;
  state.hearts = { count: MAX_HEARTS, updatedAt: now };
  return true;
}

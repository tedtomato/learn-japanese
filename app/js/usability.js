// Small pure helpers for the usability features: resuming a lesson, "I mistyped", search, text size and
// the hardest words. Nothing here touches the page, so tests can run it as it is.

// ---- Resume a lesson ----
// A snapshot of a lesson in progress is kept on the device for a day; after that it is dropped.
export const RESUME_MAX_MS = 24 * 60 * 60 * 1000;
export const RESUME_VERSION = 1;

// What is kept: where the learner is (the exercises still to come) and what they have scored so far.
// Hearts are saved with the progress at once, and XP is only paid when the lesson finishes, so a
// snapshot never needs to carry either.
export function makeSnapshot(s, now, { includeCurrent = true } = {}) {
  return {
    v: RESUME_VERSION,
    savedAt: now,
    nodeId: s.node?.id || null,
    queue: [...(includeCurrent && s.current ? [s.current] : []), ...s.queue],
    total: s.total, done: s.done, mistakes: s.mistakes, answered: s.answered,
    speedBonus: s.speedBonus, timedCount: s.timedCount, combo: s.combo || 0, mistypes: s.mistypes || 0,
    passAnswered: s.passAnswered, passWrong: s.passWrong, retryRound: !!s.retryRound,
    retryMisses: [...s.retryMisses],
    results: [...s.results],
    missed: [...s.missed],
  };
}

// A snapshot is usable when it is the right shape, less than a day old, for this lesson, and every
// exercise still points at things the course has (an update may have changed the content).
export function usableSnapshot(snap, now, { nodeId, hasItem = () => true } = {}) {
  if (!snap || typeof snap !== 'object' || snap.v !== RESUME_VERSION) return false;
  if (!snap.nodeId || (nodeId && snap.nodeId !== nodeId)) return false;
  if (typeof snap.savedAt !== 'number' || now - snap.savedAt > RESUME_MAX_MS || snap.savedAt > now + 60000) return false;
  if (!Array.isArray(snap.queue) || !Array.isArray(snap.results)) return false;
  const ids = [...snap.queue.flatMap((e) => [e.itemId, ...(e.itemIds || []), ...(e.pairs || [])]), ...snap.results.map(([id]) => id)].filter(Boolean);
  return ids.every(hasItem);
}

// Puts a snapshot back into a fresh session object.
export function applySnapshot(s, snap) {
  s.queue = [...snap.queue];
  for (const key of ['total', 'done', 'mistakes', 'answered', 'speedBonus', 'timedCount', 'combo', 'mistypes', 'passAnswered', 'passWrong']) s[key] = snap[key] || 0;
  s.retryRound = !!snap.retryRound;
  s.retryMisses = new Map(snap.retryMisses);
  s.results = new Map(snap.results);
  s.missed = new Set(snap.missed);
  return s;
}

// ---- "I mistyped" ----
export const MISTYPE_MAX = 2;
export const canMistype = (used) => (used || 0) < MISTYPE_MAX;

// A typed answer that was marked wrong is moved to "right, but shaky": one wrong becomes one right plus
// one hesitation, so the word still comes back for review. results: Map itemId → { right, wrong, hesitated }.
export function forgiveMistype(results, ids) {
  for (const id of ids) {
    const r = results.get(id);
    if (!r || !r.wrong) continue;
    r.wrong -= 1;
    r.right += 1;
    r.hesitated = (r.hesitated || 0) + 1;
  }
}

// ---- Search ----
// Lower case, no accents or tone marks (é = e, ǎ = a), no punctuation: "cafe" finds "café".
export function foldText(text) {
  return String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}
// Every word typed must be found somewhere in the entry's text (target text, romanisation, meaning).
export function matchesQuery(query, ...fields) {
  const words = foldText(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  const hay = foldText(fields.filter(Boolean).join(' '));
  return words.every((w) => hay.includes(w));
}

// ---- Text size ----
export const TEXT_SIZES = { small: 95, normal: 100, large: 115, xlarge: 130 };
export const textSizePercent = (settings) => TEXT_SIZES[settings?.textSize] ?? 100;

// ---- Hardest words ----
export const HARDEST_MIN_ANSWERS = 3;
export const HARDEST_MAX = 15;
// The items answered wrong most often: at least 3 answers and at least one mistake, lowest accuracy
// first (more answers first when equal, then by id so the order is steady).
export function hardestItems(state, ids, { min = HARDEST_MIN_ANSWERS, limit = HARDEST_MAX } = {}) {
  return ids
    .map((id) => {
      const rec = state.items[id] || {};
      const answers = (rec.right || 0) + (rec.wrong || 0);
      return { id, answers, right: rec.right || 0, accuracy: answers ? (rec.right || 0) / answers : 1 };
    })
    .filter((x) => x.answers >= min && x.accuracy < 1)
    .sort((a, b) => a.accuracy - b.accuracy || b.answers - a.answers || (a.id < b.id ? -1 : 1))
    .slice(0, limit);
}

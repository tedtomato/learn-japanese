// Spaced repetition: a Leitner-style box per item. Each correct session moves an item up a box
// (longer wait before it comes back); a mistake moves it down so it returns soon.

const DAY = 24 * 60 * 60 * 1000;
export const INTERVALS = [0, 0.5 * DAY, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
export const MAX_BOX = INTERVALS.length - 1;

// A hesitation (correct but slow) keeps the item in its box and brings it back sooner.
// `missed` marks a recent mistake until the item is answered right again (the Mistakes review).
export function review(record, { right, wrong, hesitated = 0 }, now) {
  const prev = record || { box: 0, seen: 0, right: 0, wrong: 0, slow: 0 };
  let box;
  if (wrong > 0) box = Math.max(0, prev.box - 2);
  else if (hesitated > 0) box = Math.max(prev.box, 1);
  else box = Math.min(MAX_BOX, prev.box + 1);
  const wait = hesitated > 0 && !wrong ? INTERVALS[box] / 2 : INTERVALS[box];
  const missed = wrong > 0 ? now : right > 0 && !hesitated ? undefined : prev.missed;
  return {
    box,
    seen: prev.seen + 1,
    right: prev.right + right,
    wrong: prev.wrong + wrong,
    slow: (prev.slow || 0) + hesitated,
    last: now,
    due: now + wait,
    ...(missed ? { missed } : {}),
  };
}

export const isDue = (record, now) => !!record && record.due <= now;

// 0..1: how well the item is known right now, for the progress bars. Mostly how often it is answered
// right (trusted once there are a handful of answers), plus how well it has lasted between reviews
// (full once it has survived a gap of about 3 days); fades when a review is overdue.
export function strength(record, now) {
  if (!record || !record.seen) return 0;
  const answers = (record.right || 0) + (record.wrong || 0);
  const accuracy = answers ? record.right / answers : 0;
  const confidence = Math.min(1, answers / 6);
  const lasting = Math.min(1, record.box / 3);
  const base = 0.65 * accuracy * confidence + 0.35 * lasting;
  if (now <= record.due) return Math.max(0.15, base);
  const overdue = (now - record.due) / Math.max(INTERVALS[record.box], DAY);
  return Math.max(0.05, base * Math.max(0.4, 1 - overdue * 0.3));
}

// Most urgent first: overdue items, then weak boxes, then the rest by due date.
export function byUrgency(records, now) {
  return (a, b) => {
    const ra = records[a];
    const rb = records[b];
    const da = isDue(ra, now) ? 0 : 1;
    const db = isDue(rb, now) ? 0 : 1;
    if (da !== db) return da - db;
    if (ra.box !== rb.box) return ra.box - rb.box;
    return ra.due - rb.due;
  };
}

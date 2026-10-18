// Spaced repetition: a Leitner-style box per item. Each correct session moves an item up a box
// (longer wait before it comes back); a mistake moves it down so it returns soon.

const DAY = 24 * 60 * 60 * 1000;
export const INTERVALS = [0, 0.5 * DAY, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
export const MAX_BOX = INTERVALS.length - 1;

// A hesitation (correct but slow) keeps the item in its box and brings it back sooner.
export function review(record, { right, wrong, hesitated = 0 }, now) {
  const prev = record || { box: 0, seen: 0, right: 0, wrong: 0, slow: 0 };
  let box;
  if (wrong > 0) box = Math.max(0, prev.box - 2);
  else if (hesitated > 0) box = Math.max(prev.box, 1);
  else box = Math.min(MAX_BOX, prev.box + 1);
  const wait = hesitated > 0 && !wrong ? INTERVALS[box] / 2 : INTERVALS[box];
  return {
    box,
    seen: prev.seen + 1,
    right: prev.right + right,
    wrong: prev.wrong + wrong,
    slow: (prev.slow || 0) + hesitated,
    last: now,
    due: now + wait,
  };
}

export const isDue = (record, now) => !!record && record.due <= now;

// 0..1: how well the item is remembered right now. Fades as it gets overdue.
export function strength(record, now) {
  if (!record) return 0;
  const base = record.box / MAX_BOX;
  if (now <= record.due) return Math.max(0.15, base);
  const overdue = (now - record.due) / Math.max(INTERVALS[record.box], DAY);
  return Math.max(0.05, base * Math.max(0, 1 - overdue * 0.5));
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

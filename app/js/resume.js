// A lesson left half-way (app closed, phone locked, learner walked away) is kept on the device for a day,
// one snapshot per course, so it can be picked up again. The rules for what counts live in usability.js.
import { L } from './lang.js';
import { ITEMS, NODE_BY_ID } from './course.js';
import { makeSnapshot, usableSnapshot } from './usability.js';

const key = (test) => `hajime.resume.${L.code}${test ? '.test' : ''}`;
const hasItem = (id) => ITEMS.has(id);

export function saveResume(s, now, test, opts) {
  try {
    if (s.node && !s.testOut) localStorage.setItem(key(test), JSON.stringify(makeSnapshot(s, now, opts)));
  } catch {
    /* a full phone just means no resume */
  }
}

export function clearResume(test) {
  try {
    localStorage.removeItem(key(test));
  } catch {
    /* ignore */
  }
}

// The saved lesson (for nodeId, or any when it is left out) if it is still usable; stale ones are removed.
export function readResume(now, test, nodeId = null) {
  try {
    const snap = JSON.parse(localStorage.getItem(key(test)) || 'null');
    if (!snap) return null;
    if (usableSnapshot(snap, now, { nodeId, hasItem }) && NODE_BY_ID.has(snap.nodeId)) return snap;
    if (!usableSnapshot(snap, now, { hasItem }) || !NODE_BY_ID.has(snap.nodeId)) clearResume(test);
  } catch {
    clearResume(test);
  }
  return null;
}

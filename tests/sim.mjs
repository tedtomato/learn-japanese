// Helpers for the engine tests: play a whole course with perfect answers and measure the exercise mix.
import { NODES, ITEMS } from '../app/js/course.js';
import { generateLesson, generatePractice, makeRng, isProduction, isScored } from '../app/js/lesson/generate.js';
import { defaultState, completeSession } from '../app/js/progress.js';

export const T0 = new Date(2026, 9, 18, 10, 0).getTime();

// Plays every node at each level in turn (path order), answering everything right, and logs the exercises.
export function playThrough({ seed = 1, levels = [0, 1, 2], step = 3600000, kinds = ['lesson', 'review', 'read', 'story', 'kanji'] } = {}) {
  const state = defaultState(T0);
  let now = T0;
  const log = [];
  for (const node of NODES) {
    if (node.kind === 'chest') {
      state.nodes[node.id] = { level: 1 };
      continue;
    }
    const items = node.kind === 'story' ? [] : [...node.items, ...(node.readWords || [])];
    for (const level of levels) {
      if (kinds.includes(node.kind)) {
        const { exercises } = generateLesson(node, state, { level, rng: makeRng(node.index * 17 + seed + level), now, canListen: true });
        log.push({ node, level, exercises });
      }
      completeSession(state, { node, mode: 'lesson', results: new Map(items.map((id) => [id, { right: 2, wrong: 0 }])), mistakes: 0, now });
      now += step;
    }
  }
  return { state, log, now };
}

// Everything learned (box 3, seen several times), as after a finished course.
export function learnedState(now = T0) {
  const state = defaultState(now);
  for (const it of ITEMS.values()) {
    if (it.peek) continue;
    state.items[it.id] = { box: 3, seen: 4, right: 4, wrong: 0, slow: 0, first: now - 9e8, last: now - 3e8, due: now - 1000 };
  }
  return state;
}

// Share of the scored tasks that are typed or built into the language (see PRODUCTION_KINDS).
export function productionShare(exercises) {
  const scored = exercises.filter(isScored);
  return { scored: scored.length, production: scored.filter(isProduction).length, share: scored.filter(isProduction).length / (scored.length || 1) };
}

export { generateLesson, generatePractice, makeRng };

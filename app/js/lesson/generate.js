// Turns a path node (or a practice request) into a list of exercises.
import { ITEMS, sectionOf } from '../course.js';
import { byUrgency } from '../srs.js';

export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

const QUESTION_TYPES = {
  kana: { easy: ['kana2romaji', 'audio2kana'], hard: ['romaji2kana', 'audio2kana'] },
  word: { easy: ['jp2en', 'audio2jp'], hard: ['en2jp', 'spell', 'audio2jp'] },
  sentence: { easy: ['build-jp2en'], hard: ['build-en2jp', 'build-audio'] },
};

const JP_FILLERS = ['は', 'が', 'を', 'の', 'です', 'か'];
const FILLER_ROMAJI = { は: 'wa', が: 'ga', を: 'o', の: 'no', です: 'desu', か: 'ka' };

// Romaji for any sentence chunk, used to label Japanese tiles while hints are on.
let chunkRomaji;
function romajiOfChunk(chunk) {
  if (!chunkRomaji) {
    chunkRomaji = new Map(Object.entries(FILLER_ROMAJI));
    for (const item of ITEMS.values()) {
      if (item.type === 'sentence') item.jp.forEach((c, i) => chunkRomaji.has(c) || chunkRomaji.set(c, item.romajiChunks[i]));
    }
  }
  return chunkRomaji.get(chunk) || '';
}
const EN_FILLERS = ['the', 'is', 'a', 'you', 'I', 'my', 'please', 'what', 'this', 'like', 'are'];

export const enWords = (en) => en.split(/\s+/).filter(Boolean);

function allowed(type, item, ctx) {
  if (type.startsWith('audio') || type === 'build-audio') return ctx.hasVoice;
  if (type === 'spell') return sectionOf(item).readsKana && [...item.jp].length <= 5;
  return true;
}

function questionType(item, difficulty, ctx) {
  const types = QUESTION_TYPES[item.type];
  const list = difficulty === 'any' ? [...types.easy, ...types.hard] : types[difficulty];
  const ok = list.filter((t) => allowed(t, item, ctx));
  return ok.length ? pick(ok, ctx.rng) : types.easy[0];
}

// Items of the same type the learner already knows (plus this session's), for wrong answers.
function distractorPool(item, ctx) {
  const same = (id) => ITEMS.get(id).type === item.type && id !== item.id;
  let pool = [...new Set([...ctx.sessionIds, ...ctx.knownIds])].filter(same);
  if (pool.length < 3) {
    const extra = [...ITEMS.values()].filter((i) => i.type === item.type && i.section === item.section && i.id !== item.id && !pool.includes(i.id));
    pool = [...pool, ...extra.slice(0, 6 - pool.length).map((i) => i.id)];
  }
  return pool;
}

const LABEL = { romaji: (i) => i.romaji, kana: (i) => i.jp, jp: (i) => i.jp, en: (i) => i.en };

function choiceOptions(item, answerKind, ctx) {
  const label = LABEL[answerKind];
  const seen = new Set([label(item)]);
  const options = [];
  for (const id of shuffle(distractorPool(item, ctx), ctx.rng)) {
    const l = label(ITEMS.get(id));
    if (seen.has(l)) continue;
    seen.add(l);
    options.push(id);
    if (options.length === 3) break;
  }
  return shuffle([...options, item.id], ctx.rng);
}

function tileDistractors(answer, candidates, count, ctx) {
  const lower = new Set(answer.map((w) => w.toLowerCase()));
  const pool = candidates.filter((w) => {
    const key = w.toLowerCase();
    if (lower.has(key)) return false;
    lower.add(key);
    return true;
  });
  return shuffle(pool, ctx.rng).slice(0, count);
}

function sentencePool(ctx) {
  return [...new Set([...ctx.sessionIds, ...ctx.knownIds])].map((id) => ITEMS.get(id)).filter((i) => i.type === 'sentence');
}

function buildExercise(item, type, ctx) {
  const base = { itemIds: [item.id], itemId: item.id, hint: ctx.romajiHint(item) };
  switch (type) {
    case 'kana2romaji':
      return { ...base, type: 'choice', prompt: 'jp', answerKind: 'romaji', options: choiceOptions(item, 'romaji', ctx), instruction: 'What sound is this?' };
    case 'romaji2kana':
      return { ...base, type: 'choice', prompt: 'romaji', answerKind: 'kana', options: choiceOptions(item, 'kana', ctx), instruction: `Which one is “${item.romaji}”?` };
    case 'audio2kana':
      return { ...base, type: 'choice', prompt: 'audio', answerKind: 'kana', options: choiceOptions(item, 'kana', ctx), instruction: 'What do you hear?' };
    case 'jp2en':
      return { ...base, type: 'choice', prompt: 'jp', answerKind: 'en', options: choiceOptions(item, 'en', ctx), instruction: 'What does this mean?' };
    case 'en2jp':
      return { ...base, type: 'choice', prompt: 'en', answerKind: 'jp', options: choiceOptions(item, 'jp', ctx), instruction: `How do you say “${item.en}”?` };
    case 'audio2jp':
      return { ...base, type: 'choice', prompt: 'audio', answerKind: 'jp', options: choiceOptions(item, 'jp', ctx), instruction: 'What do you hear?' };
    case 'spell': {
      const answer = [...item.jp];
      const kana = [...ITEMS.values()].filter((i) => i.type === 'kana' && (ctx.knownIds.includes(i.id) || i.section === 'hiragana')).map((i) => i.jp);
      const nearby = ctx.knownIds.map((id) => ITEMS.get(id)).filter((i) => i.type === 'kana').map((i) => i.jp);
      const extra = tileDistractors(answer, nearby.length >= 3 ? nearby : kana.slice(0, 15), Math.min(3, Math.max(2, answer.length)), ctx);
      return { ...base, type: 'build', mode: 'spell', answer, tiles: shuffle([...answer, ...extra], ctx.rng), instruction: 'Spell it in hiragana' };
    }
    case 'build-jp2en': {
      const answer = enWords(item.en);
      const others = sentencePool(ctx).flatMap((s) => enWords(s.en));
      const extra = tileDistractors(answer, [...others, ...EN_FILLERS], 3, ctx);
      return { ...base, type: 'build', mode: 'jp2en', answer, tiles: shuffle([...answer, ...extra], ctx.rng), instruction: 'Translate this sentence' };
    }
    case 'build-en2jp':
    case 'build-audio': {
      const answer = item.jp;
      const others = sentencePool(ctx).flatMap((s) => s.jp);
      const extra = tileDistractors(answer, [...others, ...JP_FILLERS], 3, ctx);
      const mode = type === 'build-audio' ? 'audio' : 'en2jp';
      const tiles = shuffle([...answer, ...extra], ctx.rng);
      const tileRomaji = base.hint ? tiles.map(romajiOfChunk) : null;
      return { ...base, type: 'build', mode, answer, tiles, tileRomaji, instruction: mode === 'audio' ? 'Tap what you hear' : 'Translate into Japanese' };
    }
    default:
      throw new Error(`Unknown question type ${type}`);
  }
}

function matchExercise(ids, ctx) {
  const pairable = ids.filter((id) => ITEMS.get(id).type !== 'sentence');
  const byType = {};
  pairable.forEach((id) => (byType[ITEMS.get(id).type] ||= []).push(id));
  const [type, list] = Object.entries(byType).sort((a, b) => b[1].length - a[1].length)[0] || [];
  if (!list || list.length < 3) return null;
  const right = type === 'kana' ? 'romaji' : 'en';
  const labels = new Set();
  const pairs = list.filter((id) => {
    const l = LABEL[right](ITEMS.get(id));
    if (labels.has(l)) return false;
    labels.add(l);
    return true;
  }).slice(0, 5);
  if (pairs.length < 3) return null;
  return { type: 'match', itemIds: pairs, pairs, right, hint: ctx.romajiHint(ITEMS.get(pairs[0])), instruction: 'Tap the matching pairs' };
}

// Spread exercises so the same item does not come up twice in a row when avoidable.
function spread(list, rng) {
  const rest = shuffle(list, rng);
  const out = [];
  while (rest.length) {
    const last = out[out.length - 1];
    const i = rest.findIndex((e) => !last || e.itemId !== last.itemId);
    out.push(rest.splice(i === -1 ? 0 : i, 1)[0]);
  }
  return out;
}

function context({ state, sessionIds, level, hasVoice, rng }) {
  const knownIds = Object.keys(state.items).filter((id) => ITEMS.has(id));
  return {
    rng,
    hasVoice,
    sessionIds,
    knownIds,
    romajiHint: (item) => item.type !== 'kana' && level < sectionOf(item).romajiUntilLevel,
  };
}

function pickReview(state, exclude, count, rng, now) {
  const learned = Object.keys(state.items).filter((id) => ITEMS.has(id) && !exclude.includes(id));
  const urgent = learned.sort(byUrgency(state.items, now)).slice(0, Math.max(count * 2, 6));
  return shuffle(urgent, rng).slice(0, count);
}

export function generateLesson(node, state, { level = 0, hasVoice = true, rng = makeRng(), now = Date.now() } = {}) {
  const isReview = node.kind === 'review';
  if (isReview) level = Math.max(level, 1);
  const targets = isReview ? shuffle(node.items, rng).slice(0, 10) : node.items;
  const reviewIds = pickReview(state, node.items, isReview ? 2 : Math.max(2, Math.round(targets.length * 0.8)), rng, now);
  const ctx = context({ state, sessionIds: [...targets, ...reviewIds], level, hasVoice, rng });
  const goal = isReview ? 14 : 9 + Math.min(level, 4);

  const head = [];
  const rest = [];
  for (const id of targets) {
    const item = ITEMS.get(id);
    if (!state.items[id]) head.push({ type: 'intro', itemId: id, itemIds: [], hint: true });
    const first = buildExercise(item, questionType(item, level >= 2 || isReview ? 'any' : 'easy', ctx), ctx);
    (state.items[id] || isReview ? rest : head).push(first);
    if (!isReview) rest.push(buildExercise(item, questionType(item, level >= 1 ? 'hard' : 'any', ctx), ctx));
  }
  for (const id of reviewIds) rest.push(buildExercise(ITEMS.get(id), questionType(ITEMS.get(id), 'any', ctx), ctx));

  const match = matchExercise(shuffle([...targets, ...reviewIds], rng), ctx);
  let scored = head.filter((e) => e.type !== 'intro').length + rest.length + (match ? 1 : 0);
  let n = 0;
  while (scored < goal && n < 40) {
    const item = ITEMS.get(targets[n % targets.length]);
    rest.push(buildExercise(item, questionType(item, level >= 1 ? 'hard' : 'any', ctx), ctx));
    scored += 1;
    n += 1;
  }
  const body = spread(rest, rng);
  if (match) body.splice(Math.max(1, Math.floor(body.length * 0.6)), 0, match);
  return { exercises: [...head, ...body], itemIds: ctx.sessionIds };
}

// A practice session made from the learner's weakest and most overdue items.
export function generatePractice(state, { hasVoice = true, rng = makeRng(), now = Date.now(), itemIds = null, size = 10 } = {}) {
  const ids = itemIds || pickReview(state, [], 8, rng, now);
  if (!ids.length) return { exercises: [], itemIds: [] };
  const ctx = context({ state, sessionIds: ids, level: 3, hasVoice, rng });
  const list = ids.map((id) => buildExercise(ITEMS.get(id), questionType(ITEMS.get(id), 'any', ctx), ctx));
  let n = 0;
  while (list.length < size - 1 && n < 20) {
    const item = ITEMS.get(ids[n % ids.length]);
    list.push(buildExercise(item, questionType(item, 'hard', ctx), ctx));
    n += 1;
  }
  const body = spread(list, rng);
  const match = matchExercise(ids, ctx);
  if (match) body.splice(Math.floor(body.length / 2), 0, match);
  return { exercises: body, itemIds: ids };
}

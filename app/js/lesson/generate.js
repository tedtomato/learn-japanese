// Turns a path node (or a practice request) into a list of exercises.
import { ITEMS } from '../course.js';
import { byUrgency } from '../srs.js';
import { GRAMMAR } from '../content/grammar.js';
import { STROKES } from '../content/strokes.js';

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
  kana: { easy: ['kana2romaji', 'audio2kana'], hard: ['romaji2kana', 'audio2kana', 'kana2romaji'] },
  word: { easy: ['jp2en', 'audio2jp'], hard: ['en2jp', 'spell', 'audio2jp', 'read', 'speak'] },
  sentence: { easy: ['build-jp2en'], hard: ['build-en2jp', 'build-audio', 'fast', 'speak'] },
  kanji: { easy: ['kanji2meaning'], hard: ['meaning2kanji', 'kanji2meaning'] },
  kword: { easy: ['kword2meaning'], hard: ['kword2reading', 'kword2meaning'] },
  radical: { easy: ['radical2meaning'], hard: ['meaning2radical'] },
};

const JP_FILLERS = ['は', 'が', 'を', 'の', 'です', 'か', 'と'];
const FILLER_ROMAJI = { は: 'wa', が: 'ga', を: 'o', の: 'no', です: 'desu', か: 'ka', と: 'to', で: 'de' };
const EN_FILLERS = ['the', 'is', 'a', 'you', 'I', 'my', 'please', 'what', 'this', 'like', 'are', 'and'];

// Romaji for any sentence chunk, used to label Japanese tiles while hints are on.
let chunkRomaji;
export function romajiOfChunk(chunk) {
  if (!chunkRomaji) {
    chunkRomaji = new Map(Object.entries(FILLER_ROMAJI));
    for (const item of ITEMS.values()) {
      if (item.type === 'sentence') item.jp.forEach((c, i) => chunkRomaji.has(c) || chunkRomaji.set(c, item.romajiChunks[i]));
      if (item.type === 'word' && !chunkRomaji.has(item.jp)) chunkRomaji.set(item.jp, item.romaji);
    }
  }
  return chunkRomaji.get(chunk) || '';
}

export const enWords = (en) => en.split(/\s+/).filter(Boolean);
const isNew = (state, id) => !state.items[id];

// ---- What the learner can read ----
export function knownChars(state, extraIds = []) {
  const set = new Set();
  for (const id of [...Object.keys(state.items), ...extraIds]) {
    const it = ITEMS.get(id);
    if (it?.type === 'kana') set.add(it.jp);
  }
  return set;
}
export const canRead = (item, chars) => item.chars?.length > 0 && item.chars.every((c) => chars.has(c));

function allowed(type, item, ctx) {
  if (type.startsWith('audio') || type === 'build-audio' || type === 'fast') return ctx.canListen && (type !== 'fast' || ctx.advanced);
  if (type === 'speak') return ctx.canSpeak && ctx.level >= 1;
  if (type === 'spell') return canRead(item, ctx.chars) && [...item.jp].length <= 5;
  if (type === 'read') return canRead(item, ctx.chars);
  if (type === 'meaning2radical' || type === 'meaning2kanji') return distractorPool(item, ctx).length >= 2;
  return true;
}

function questionType(item, difficulty, ctx) {
  const types = QUESTION_TYPES[item.type];
  const list = difficulty === 'any' ? [...types.easy, ...types.hard] : types[difficulty];
  const ok = list.filter((t) => allowed(t, item, ctx));
  return ok.length ? pick(ok, ctx.rng) : types.easy[0];
}

// Items of the same type the learner knows (plus this session's), used as wrong answers.
function distractorPool(item, ctx) {
  const same = (id) => ITEMS.get(id)?.type === item.type && id !== item.id;
  let pool = [...new Set([...ctx.sessionIds, ...ctx.knownIds])].filter(same);
  if (pool.length < 3) {
    const extra = [...ITEMS.values()].filter((i) => i.type === item.type && !i.peek && i.id !== item.id && !pool.includes(i.id)
      && (i.unit === item.unit || item.type !== 'word'));
    pool = [...pool, ...shuffle(extra, ctx.rng).slice(0, 6 - pool.length).map((i) => i.id)];
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
    if (!l || seen.has(l)) continue;
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

const sentencePool = (ctx) => [...new Set([...ctx.sessionIds, ...ctx.knownIds])].map((id) => ITEMS.get(id)).filter((i) => i?.type === 'sentence');

function buildExercise(item, type, ctx) {
  const base = { itemIds: [item.id], itemId: item.id, hint: ctx.romajiHint(item), kind: type };
  const choice = (prompt, answerKind, instruction) => ({ ...base, type: 'choice', prompt, answerKind, options: choiceOptions(item, answerKind, ctx), instruction });
  switch (type) {
    case 'kana2romaji': return choice('jp', 'romaji', 'What sound is this?');
    case 'romaji2kana': return choice('romaji', 'kana', `Which one is “${item.romaji}”?`);
    case 'audio2kana': return choice('audio', 'kana', 'What do you hear?');
    case 'jp2en': return choice('jp', 'en', 'What does this mean?');
    case 'en2jp': return choice('en', 'jp', `How do you say “${item.en}”?`);
    case 'audio2jp': return choice('audio', 'jp', 'What do you hear?');
    case 'read': return { ...choice('jp', 'romaji', 'How do you read this?'), hint: false };
    case 'kanji2meaning':
    case 'kword2meaning':
    case 'radical2meaning':
      return { ...choice('kanji', 'en', 'What does this mean?'), hint: false, clue: item.story || null };
    case 'meaning2kanji':
    case 'meaning2radical':
      return { ...choice('en', 'jp', `Which one means “${item.en}”?`), hint: false, clue: item.story || null };
    case 'kword2reading':
      return { ...choice('kanji', 'romaji', 'How do you read this?'), hint: false, clue: item.kanji.map((k) => `${k} = ${ITEMS.get(`kj-${k}`)?.en || ''}`).join(' · ') };
    case 'speak':
      return { ...base, type: 'speak', instruction: 'Say it out loud' };
    case 'spell': {
      const answer = [...item.jp];
      const known = [...ctx.chars];
      const extra = tileDistractors(answer, known.length >= 4 ? known : ['あ', 'い', 'う', 'え', 'お', 'か'], Math.min(3, Math.max(2, answer.length)), ctx);
      return { ...base, type: 'build', mode: 'spell', answer, tiles: shuffle([...answer, ...extra], ctx.rng), instruction: 'Spell it' };
    }
    case 'build-jp2en': {
      const answer = enWords(item.en);
      const others = sentencePool(ctx).flatMap((s) => enWords(s.en));
      const extra = tileDistractors(answer, [...others, ...EN_FILLERS], 3, ctx);
      return { ...base, type: 'build', mode: 'jp2en', answer, accept: item.accept, tiles: shuffle([...answer, ...extra], ctx.rng), instruction: 'Translate this sentence' };
    }
    case 'build-en2jp':
    case 'build-audio':
    case 'fast': {
      const answer = item.jp;
      const others = sentencePool(ctx).flatMap((s) => s.jp);
      const extra = tileDistractors(answer, [...others, ...JP_FILLERS], 3, ctx);
      const mode = { 'build-audio': 'audio', fast: 'fast', 'build-en2jp': 'en2jp' }[type];
      const tiles = shuffle([...answer, ...extra], ctx.rng);
      const tileRomaji = base.hint ? tiles.map(romajiOfChunk) : null;
      const instruction = { audio: 'Tap what you hear', fast: 'Fast talk! Tap the words you hear', en2jp: 'Translate into Japanese' }[mode];
      return { ...base, type: 'build', mode, answer, tiles, tileRomaji, instruction };
    }
    default:
      throw new Error(`Unknown question type ${type}`);
  }
}

function matchExercise(ids, ctx) {
  const pairable = ids.filter((id) => ['kana', 'word', 'kword', 'kanji'].includes(ITEMS.get(id)?.type));
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
  return { type: 'match', itemIds: pairs, pairs, right, hint: type === 'word' && pairs.some((id) => ctx.romajiHint(ITEMS.get(id))), instruction: 'Tap the matching pairs' };
}

function dialogueExercise(id, ctx) {
  const d = ITEMS.get(id);
  return { type: 'dialogue', itemId: id, itemIds: [], options: shuffle(d.options, ctx.rng), answer: d.options[0], instruction: d.question };
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

export function context({ state, sessionIds, level, rng, canListen = true, canSpeak = false, advanced = false, readMode = false }) {
  const knownIds = Object.keys(state.items).filter((id) => ITEMS.has(id));
  const chars = knownChars(state, sessionIds);
  return {
    rng, level, canListen, canSpeak, advanced, sessionIds, knownIds, chars,
    // Romaji over Japanese: until the learner can read every character of the word, and on the
    // very first lesson; reading lessons always hide it for words they can read.
    romajiHint: (item) => {
      if (!['word', 'sentence'].includes(item.type)) return false;
      if (!canRead(item, chars)) return true;
      return !readMode && level < 1 && isNew(state, item.id);
    },
  };
}

function pickReview(state, exclude, count, rng, now) {
  const learned = Object.keys(state.items).filter((id) => ITEMS.has(id) && !exclude.includes(id) && ITEMS.get(id).type !== 'dialogue');
  const urgent = learned.sort(byUrgency(state.items, now)).slice(0, Math.max(count * 2, 6));
  return shuffle(urgent, rng).slice(0, count);
}

const hasStrokes = (item) => (item.type === 'kana' || item.type === 'kanji' || item.type === 'radical') && STROKES[item.jp];

// opts: level, rng, now, canListen, canSpeak
export function generateLesson(node, state, opts = {}) {
  const { rng = makeRng(), now = Date.now() } = opts;
  let level = opts.level || 0;
  if (node.kind === 'story') return generateStory(node, state, opts);
  const isReview = node.kind === 'review';
  if (isReview) level = Math.max(level, 1);
  const readMode = node.kind === 'read';
  const targets = isReview ? shuffle(node.items, rng).slice(0, 10) : node.items;
  const readWords = readMode ? node.readWords || [] : [];
  const reviewIds = pickReview(state, [...node.items, ...readWords], isReview ? 2 : Math.max(2, Math.round(targets.length * 0.6)), rng, now);
  const ctx = context({ state, sessionIds: [...targets, ...readWords, ...reviewIds], level, rng, readMode,
    canListen: opts.canListen !== false, canSpeak: !!opts.canSpeak, advanced: node.sectionIndex > 0 || level >= 2 });
  const goal = isReview ? 14 : 9 + Math.min(level, 4);

  const head = [];
  const rest = [];
  for (const id of targets) {
    const item = ITEMS.get(id);
    if (isNew(state, id)) {
      head.push({ type: 'intro', itemId: id, itemIds: [], hint: ctx.romajiHint(item) || item.type === 'kana' });
      if (hasStrokes(item) && item.type !== 'radical') head.push({ type: 'trace', itemId: id, itemIds: [id], kind: 'trace' });
    }
    const first = buildExercise(item, questionType(item, level >= 2 || isReview ? 'any' : 'easy', ctx), ctx);
    (!isNew(state, id) || isReview ? rest : head).push(first);
    if (!isReview) rest.push(buildExercise(item, questionType(item, level >= 1 ? 'hard' : 'any', ctx), ctx));
  }
  for (const id of readWords) rest.push(buildExercise(ITEMS.get(id), pick(['read', 'jp2en'].filter((t) => allowed(t, ITEMS.get(id), ctx)), rng) || 'jp2en', ctx));
  for (const id of reviewIds) rest.push(buildExercise(ITEMS.get(id), questionType(ITEMS.get(id), 'any', ctx), ctx));

  const match = matchExercise(shuffle([...targets, ...readWords, ...reviewIds], rng), ctx);
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

  // A grammar card goes right before the first sentence exercise (always the first time).
  if (node.grammar && GRAMMAR[node.grammar] && (level === 0 || rng() < 0.3)) {
    const at = body.findIndex((e) => ITEMS.get(e.itemId)?.type === 'sentence');
    body.splice(at === -1 ? 0 : at, 0, { type: 'grammar', grammarId: node.grammar, itemIds: [], kind: 'grammar' });
  }
  // From the second level on, units with conversations add one to listen to.
  const dialogues = node.unit?.dialogueIds || [];
  if (dialogues.length && level >= 1 && ctx.canListen) body.splice(Math.floor(body.length * 0.8), 0, dialogueExercise(pick(dialogues, rng), ctx));
  return { exercises: [...head, ...body], itemIds: ctx.sessionIds };
}

// Story node: listen to each conversation and answer a question about it.
function generateStory(node, state, { rng = makeRng() } = {}) {
  const ctx = { rng };
  return { exercises: node.items.map((id) => dialogueExercise(id, ctx)), itemIds: [] };
}

// A practice session made from the learner's weakest and most overdue items.
export function generatePractice(state, { rng = makeRng(), now = Date.now(), itemIds = null, size = 10, canListen = true, canSpeak = false } = {}) {
  const ids = itemIds || pickReview(state, [], 8, rng, now);
  if (!ids.length) return { exercises: [], itemIds: [] };
  const ctx = context({ state, sessionIds: ids, level: 3, rng, canListen, canSpeak, advanced: true });
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

// Fresh questions for items the learner got wrong or hesitated on, for the end-of-lesson retry.
export function generateRetry(itemIds, state, { rng = makeRng(), canListen = true } = {}) {
  const ctx = context({ state, sessionIds: itemIds, level: 1, rng, canListen });
  return itemIds.map((id) => ITEMS.get(id)).filter((it) => QUESTION_TYPES[it?.type])
    .map((it) => ({ ...buildExercise(it, questionType(it, 'easy', ctx), ctx), retry: true }));
}

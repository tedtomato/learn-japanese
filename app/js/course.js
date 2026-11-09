// Builds the course tree (sections → units → path nodes) and the global item index from content.
// Beginners learn to read from the second unit on: every unit gets one short "Read it" lesson (4 kana).
// Hiragana comes first (the characters of that unit's words), katakana joins after ~16 hiragana
// (only the characters of the loanwords the course uses), kanji lessons start once ~20 kana are
// taught, and whatever is left comes in the "Kana corner" at the end.
import { kanaId } from './content/kana.js';
import { slug } from './normalise.js';
import { L, joinChunks } from './lang.js';
import { KANA, KANA_WORDS, SECTIONS_DATA, DIALOGUES, KANJI, RADICALS, KANJI_LESSONS, PEEK_KANJI, MNEMONICS } from './content/pack.js';

export const ITEMS = new Map();
export const MAX_LEVEL = 5;
const UNIT_COLORS = ['green', 'blue', 'purple', 'orange', 'red'];
const READ_PER_UNIT = 4; // new kana per unit (one "Read it" lesson), from the second unit on
const READ_PER_LESSON = 4;
const KATA_AFTER = 16; // katakana joins the reading lessons once this many hiragana are taught
const KATA_PER_UNIT = 2; // at most; one when the unit has no katakana words of its own
const KANJI_AFTER = 20; // kanji lessons start once this many kana are taught
const KANJI_PER_UNIT = 2; // pinned kanji lessons held back are released at this pace
const isHiragana = (c) => KANA.get(c).script === 'hiragana';
const isKatakana = (c) => KANA.get(c).script === 'katakana';
const HAS_KANA = [...KANA.keys()].some(isHiragana);

function addItem(item) {
  if (ITEMS.has(item.id)) {
    const old = ITEMS.get(item.id);
    if (old.jp.toString() !== item.jp.toString()) throw new Error(`Item id clash: "${old.jp}" and "${item.jp}" both make the id ${item.id}`);
    return item.id; // the same word reused later in the course
  }
  ITEMS.set(item.id, item);
  return item.id;
}

export { slug };
const kanaChars = (text) => [...text].filter((c) => KANA.has(c));

function kanaItem(ch) {
  const info = KANA.get(ch);
  const [word, wordRomaji, art, en] = KANA_WORDS[ch] || [];
  return addItem({ id: kanaId(ch), type: 'kana', jp: ch, romaji: info.romaji, hint: info.hint, script: info.script, say: info.say,
    example: word && { jp: word, romaji: wordRomaji, art, en } });
}

// Latin-alphabet courses write words without romanisation: [word, meaning, art, extras?].
function wordItem(w, ctx) {
  const [jp, romaji, en, art, extra = {}] = L.latin ? [w[0], w[0], ...w.slice(1)] : w;
  const id = `w-${slug(romaji)}`;
  return addItem({ id, type: 'word', jp, romaji, en, art, note: extra.note, memory: MNEMONICS[id], alt: extra.alt || [], unit: ctx.unit, section: ctx.section, chars: kanaChars(jp) });
}

function sentenceItem({ jp, romaji = jp.join(' '), en, alt = [] }, ctx) {
  const romajiChunks = L.latin ? jp : romaji.split(' ');
  if (romajiChunks.length !== jp.length) throw new Error(`Romaji "${romaji}" must have one word per chunk`);
  const text = joinChunks(jp);
  return addItem({ id: `s-${slug(romaji)}`, type: 'sentence', jp, text, romaji, romajiChunks, en, accept: [en, ...alt], unit: ctx.unit, section: ctx.section, chars: kanaChars(text) });
}

// Kanji, their compound words, and radicals.
const KANJI_BY_CHAR = new Map(KANJI.map((k) => [k.k, k]));
function kanjiItem(ch) {
  const k = KANJI_BY_CHAR.get(ch);
  const wordIds = k.words.map(([jp, kana, romaji, en]) =>
    addItem({ id: `kw-${jp}`, type: 'kword', jp, kana, romaji, en, kanji: [...jp].filter((c) => KANJI_BY_CHAR.has(c)), chars: [] }));
  return { id: addItem({ id: `kj-${ch}`, type: 'kanji', jp: ch, en: k.meaning, on: k.on, kun: k.kun, parts: k.parts, story: k.story, say: k.words[0][1], words: wordIds, chars: [] }), wordIds };
}
function radicalItem(r) {
  const rad = RADICALS.find((x) => x.r === r);
  return addItem({ id: `rd-${r}`, type: 'radical', jp: r, en: rad.name, story: rad.story, chars: [] });
}
// Kanji peeks from the fun-facts collection: asked in practice with their tip as a clue.
for (const k of PEEK_KANJI) {
  const reading = (k.kun || '').split(' ')[0].replace(/[()]/g, '');
  addItem({ id: `xk-${k.id}`, type: 'kanji', peek: true, jp: k.k, en: k.en, on: k.on, kun: k.kun, story: k.tip, say: reading || k.k, words: [], chars: [] });
}
export const peekId = (tidbitKanji) => `xk-${tidbitKanji.id}`;

// Words learners already know (すし, ねこ, タクシー…), for reading practice as soon as their characters are learned.
export const FAMILIAR_IDS = [];
for (const [word, romaji, art, en] of new Map(Object.values(KANA_WORDS).map((w) => [w[0], w])).values()) {
  const id = `fw-${word}`;
  addItem({ id, type: 'fword', jp: word, romaji: romaji.toLowerCase(), en: en ? `${romaji} (${en})` : romaji, art, chars: kanaChars(word) });
  FAMILIAR_IDS.push(id);
}

for (const d of Object.entries(DIALOGUES)) addItem({ id: `dl-${d[0]}`, type: 'dialogue', jp: d[0], ...d[1], chars: [] });

// ---- Build the path ----
const taught = new Set();
let carry = [];
const kanjiQueue = KANJI_LESSONS.filter((l) => !l.unit);
const kanjiPinned = KANJI_LESSONS.filter((l) => l.unit);
let kanjiBacklog = []; // pinned kanji lessons whose unit came before the learner could read kana

// Katakana the course's words and sentences actually use, most frequent first (small ァィゥェォ have no
// stroke data and are not in KANA, so they are never taught).
const KATAKANA_USED = (() => {
  const freq = new Map();
  let order = 0;
  for (const s of SECTIONS_DATA) for (const u of s.units) for (const l of u.lessons) {
    const texts = [...(l.words || []).map((w) => w[0]), ...(l.sentences || []).map((x) => x.jp.join(''))];
    for (const c of texts.join('')) {
      if (!KANA.has(c) || !isKatakana(c)) continue;
      const f = freq.get(c) || { n: 0, first: order++ };
      f.n += 1;
      freq.set(c, f);
    }
  }
  return [...freq].sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first).map(([c]) => c);
})();

// Marks words that every taught character can now spell, returning up to `max` of them.
function newlyReadable(unitId, max = 6) {
  const readable = [...ITEMS.values()].filter((it) => (it.type === 'word' || it.type === 'sentence') && !it.readAt
    && it.chars.length && it.chars.every((c) => taught.has(c)));
  readable.forEach((it) => (it.readAt = unitId));
  return readable.slice(0, max).map((it) => it.id);
}

function readLessons(unitItems, unitId, perUnit) {
  const freq = new Map();
  unitItems.forEach((id, i) => ITEMS.get(id).chars.forEach((c) => {
    if (taught.has(c)) return;
    const f = freq.get(c) || { n: 0, first: i };
    f.n += 1;
    freq.set(c, f);
  }));
  const byUnit = [...freq].sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first).map(([c]) => c);
  const hiraPool = [...new Set([...byUnit.filter(isHiragana), ...carry.filter((c) => !taught.has(c))])];
  // Katakana comes in once the first hiragana are known: this unit's loanword characters first.
  const hiraganaTaught = [...taught].filter(isHiragana).length;
  const kataPool = hiraganaTaught >= KATA_AFTER && perUnit
    ? [...new Set([...byUnit.filter(isKatakana), ...KATAKANA_USED.filter((c) => !taught.has(c))])] : [];
  const kata = kataPool.slice(0, Math.min(Math.max(1, Math.min(KATA_PER_UNIT, byUnit.filter(isKatakana).length)), perUnit));
  const hira = hiraPool.slice(0, perUnit - kata.length);
  const now = [...hira, ...kata];
  carry = hiraPool.filter((c) => !hira.includes(c));
  const lessons = [];
  for (let i = 0; i < now.length; i += READ_PER_LESSON) {
    const chars = now.slice(i, i + READ_PER_LESSON);
    chars.forEach((c) => taught.add(c));
    lessons.push({ kind: 'read', title: `Read it: ${chars.join(' ')}`, items: chars.map(kanaItem), readWords: newlyReadable(unitId), icon: 'kana' });
  }
  return lessons;
}

function kanjiLesson(spec) {
  if (spec.radicals) return { kind: 'kanji', title: spec.title, items: spec.radicals.map(radicalItem), icon: 'radical' };
  const made = spec.kanji.map(kanjiItem);
  return { kind: 'kanji', title: spec.title, items: [...made.map((m) => m.id), ...new Set(made.flatMap((m) => m.wordIds))], icon: 'kanji' };
}

function buildUnit(section, unit, u, unitIndex, totalUnits) {
  const ctx = { unit: unit.id, section: section.id };
  const vocab = unit.lessons.map((l) => {
    const words = (l.words || []).map((w) => wordItem(w, ctx));
    const sentences = (l.sentences || []).map((s) => sentenceItem(s, ctx));
    const items = [...words, ...sentences];
    return { kind: 'lesson', title: l.title, items, grammar: l.grammar, icon: sentences.length && !words.length ? 'chat' : 'art', art: ITEMS.get(items[0]).art };
  });
  const reads = readLessons(vocab.flatMap((l) => l.items), unit.id, unitIndex === 0 ? 0 : READ_PER_UNIT);
  // Interleave: two vocabulary lessons, then a reading lesson, and so on.
  const seq = [];
  vocab.forEach((l, i) => {
    seq.push(l);
    if (i % 2 === 1 && reads.length) seq.push(reads.shift());
  });
  seq.push(...reads);
  // Kanji: lessons pinned to this unit, then the rest spread over every unit, travel signs first. They start
  // once the learner has met ~20 kana; pinned lessons of earlier units wait and follow, two per unit.
  const canKanji = !HAS_KANA || taught.size >= KANJI_AFTER;
  kanjiBacklog.push(...kanjiPinned.filter((spec) => spec.unit === unit.id));
  const pinned = canKanji ? kanjiBacklog.splice(0, HAS_KANA ? KANJI_PER_UNIT : kanjiBacklog.length) : [];
  pinned.forEach((spec) => seq.push(kanjiLesson(spec)));
  const take = !canKanji || kanjiBacklog.length || pinned.length ? 0 : Math.ceil(kanjiQueue.length / (totalUnits - unitIndex));
  kanjiQueue.splice(0, take).forEach((spec) => seq.push(kanjiLesson(spec)));
  if (unit.dialogues?.length) seq.push({ kind: 'story', title: 'Story time', items: unit.dialogues.map((d) => `dl-${d}`), icon: 'story' });

  const id = `${section.id}-${unit.id}`;
  // Ids count per kind (l1, l2…, k1…), so adding a kanji or reading lesson keeps the others' ids.
  const counts = {};
  const nodes = seq.map((n) => ({ ...n, id: `${id}-${n.kind[0]}${(counts[n.kind] = (counts[n.kind] || 0) + 1)}` }));
  if (nodes.length >= 3) nodes.splice(2, 0, { id: `${id}-chest`, kind: 'chest', title: 'Treasure chest' });
  const reviewItems = [...new Set(seq.filter((n) => n.kind === 'lesson' || n.kind === 'read').flatMap((n) => [...n.items, ...(n.readWords || [])]))];
  nodes.push({ id: `${id}-review`, kind: 'review', title: 'Unit review', items: reviewItems });
  return { id, title: unit.title, desc: unit.desc, facts: unit.facts || [], phrases: unit.phrases || [], dialogueIds: (unit.dialogues || []).map((d) => `dl-${d}`), color: UNIT_COLORS[unitIndex % UNIT_COLORS.length], nodes };
}

const allUnits = SECTIONS_DATA.flatMap((s) => s.units.map((u) => [s, u]));
let unitCounter = 0;
export const SECTIONS = SECTIONS_DATA.map((s) => ({
  id: s.id,
  title: s.title,
  units: s.units.map((u, i) => buildUnit(s, u, i, unitCounter++, allUnits.length)),
}));

// Kana still untaught (words' leftovers first, then the rest of the hiragana chart, then the katakana the
// words use): a final "Kana corner" so every word becomes readable and the full hiragana chart can be learned.
// Kanji lessons still held back (a very short course) are added to their last unit.
const leftovers = [...new Set([...carry, ...[...KANA.keys()].filter(isHiragana), ...KATAKANA_USED])].filter((c) => !taught.has(c));
if (kanjiBacklog.length) {
  const last = SECTIONS[SECTIONS.length - 1].units.at(-1);
  const at = last.nodes.findIndex((n) => n.kind === 'review');
  const ids = last.nodes.filter((n) => n.kind === 'kanji').length;
  last.nodes.splice(at, 0, ...kanjiBacklog.map((spec, i) => ({ ...kanjiLesson(spec), id: `${last.id}-k${ids + i + 1}` })));
}
if (leftovers.length) {
  const nodes = [];
  for (let i = 0; i < leftovers.length; i += READ_PER_LESSON) {
    const chars = leftovers.slice(i, i + READ_PER_LESSON);
    chars.forEach((c) => taught.add(c));
    nodes.push({ id: `kana-corner-r${nodes.length + 1}`, kind: 'read', title: `Read it: ${chars.join(' ')}`, items: chars.map(kanaItem), readWords: newlyReadable('kana-corner'), icon: 'kana' });
  }
  nodes.push({ id: 'kana-corner-review', kind: 'review', title: 'Kana review', items: nodes.flatMap((n) => n.items) });
  SECTIONS[SECTIONS.length - 1].units.push({ id: 'kana-corner', title: 'Kana corner', desc: 'The rest of the kana charts', facts: [], phrases: [], dialogueIds: [], color: 'blue', nodes });
}

export const NODES = [];
export const NODE_BY_ID = new Map();
SECTIONS.forEach((section, s) =>
  section.units.forEach((unit, u) =>
    unit.nodes.forEach((node) => {
      Object.assign(node, { section, unit, sectionIndex: s, unitIndex: u, index: NODES.length });
      NODES.push(node);
      NODE_BY_ID.set(node.id, node);
    }),
  ),
);

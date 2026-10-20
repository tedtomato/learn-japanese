// Builds the course tree (sections → units → path nodes) and the global item index from content.
// Kana are not taught in separate sections: each unit gets "Read it" lessons for the characters
// its own words use (most frequent first), so reading grows alongside vocabulary.
import { KANA_WORDS } from './content/kana-words.js';
import { KANA, kanaId } from './content/kana.js';
import { SECTIONS_DATA, DIALOGUES } from './content/units.js';
import { KANJI, RADICALS, KANJI_LESSONS } from './content/kanji.js';
import { KANJI as PEEK_KANJI } from './content/extras.js';

export const ITEMS = new Map();
export const MAX_LEVEL = 5;
const UNIT_COLORS = ['green', 'blue', 'purple', 'orange', 'red'];
const READ_PER_UNIT = 12; // new characters per unit, split into "Read it" lessons of up to 4
const READ_PER_LESSON = 4;

function addItem(item) {
  if (ITEMS.has(item.id)) {
    const old = ITEMS.get(item.id);
    if (old.jp.toString() !== item.jp.toString()) throw new Error(`Item id clash: ${item.id}`);
    return item.id; // the same word reused later in the course
  }
  ITEMS.set(item.id, item);
  return item.id;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const kanaChars = (text) => [...text].filter((c) => KANA.has(c));

function kanaItem(ch) {
  const info = KANA.get(ch);
  const [word, wordRomaji, art, en] = KANA_WORDS[ch] || [];
  return addItem({ id: kanaId(ch), type: 'kana', jp: ch, romaji: info.romaji, hint: info.hint, script: info.script, say: info.say,
    example: word && { jp: word, romaji: wordRomaji, art, en } });
}

function wordItem([jp, romaji, en, art, extra = {}], ctx) {
  return addItem({ id: `w-${slug(romaji)}`, type: 'word', jp, romaji, en, art, note: extra.note, alt: extra.alt || [], unit: ctx.unit, section: ctx.section, chars: kanaChars(jp) });
}

function sentenceItem({ jp, romaji, en, alt = [] }, ctx) {
  const romajiChunks = romaji.split(' ');
  if (romajiChunks.length !== jp.length) throw new Error(`Romaji "${romaji}" must have one word per chunk`);
  const text = jp.join('');
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
const kanjiQueue = [...KANJI_LESSONS];

// Marks words that every taught character can now spell, returning up to `max` of them.
function newlyReadable(unitId, max = 6) {
  const readable = [...ITEMS.values()].filter((it) => (it.type === 'word' || it.type === 'sentence') && !it.readAt
    && it.chars.length && it.chars.every((c) => taught.has(c)));
  readable.forEach((it) => (it.readAt = unitId));
  return readable.slice(0, max).map((it) => it.id);
}

function readLessons(unitItems, unitId) {
  const freq = new Map();
  unitItems.forEach((id, i) => ITEMS.get(id).chars.forEach((c) => {
    if (taught.has(c)) return;
    const f = freq.get(c) || { n: 0, first: i };
    f.n += 1;
    freq.set(c, f);
  }));
  const fromUnit = [...freq].sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first).map(([c]) => c);
  const pool = [...new Set([...fromUnit, ...carry.filter((c) => !taught.has(c))])];
  const now = pool.slice(0, READ_PER_UNIT);
  carry = pool.slice(READ_PER_UNIT);
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
  const reads = readLessons(vocab.flatMap((l) => l.items), unit.id);
  // Interleave: two vocabulary lessons, then a reading lesson, and so on.
  const seq = [];
  vocab.forEach((l, i) => {
    seq.push(l);
    if (i % 2 === 1 && reads.length) seq.push(reads.shift());
  });
  seq.push(...reads);
  // Kanji: spread the kanji lessons over the units after the first.
  if (unitIndex > 0) {
    const left = totalUnits - unitIndex;
    const take = Math.ceil(kanjiQueue.length / left);
    kanjiQueue.splice(0, take).forEach((spec) => seq.push(kanjiLesson(spec)));
  }
  if (unit.dialogues?.length) seq.push({ kind: 'story', title: 'Story time', items: unit.dialogues.map((d) => `dl-${d}`), icon: 'story' });

  const id = `${section.id}-${unit.id}`;
  const nodes = seq.map((n, i) => ({ ...n, id: `${id}-${n.kind[0]}${i + 1}` }));
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

// Characters still untaught (words' leftovers first, then the rest of hiragana): a final
// "Kana corner" so every word becomes readable and the full chart can be learned.
const leftovers = [...new Set([...carry, ...[...KANA.keys()].filter((c) => KANA.get(c).script === 'hiragana')])].filter((c) => !taught.has(c));
if (leftovers.length) {
  const nodes = [];
  for (let i = 0; i < leftovers.length; i += 5) {
    const chars = leftovers.slice(i, i + 5);
    chars.forEach((c) => taught.add(c));
    nodes.push({ id: `kana-corner-r${nodes.length + 1}`, kind: 'read', title: `Read it: ${chars.join(' ')}`, items: chars.map(kanaItem), readWords: newlyReadable('kana-corner'), icon: 'kana' });
  }
  nodes.push({ id: 'kana-corner-review', kind: 'review', title: 'Kana review', items: nodes.flatMap((n) => n.items) });
  SECTIONS[SECTIONS.length - 1].units.push({ id: 'kana-corner', title: 'Kana corner', desc: 'The rest of the hiragana chart', facts: [], phrases: [], dialogueIds: [], color: 'blue', nodes });
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

export const unitOfItem = (item) => SECTIONS.flatMap((s) => s.units).find((u) => u.id.endsWith(`-${item.unit}`));

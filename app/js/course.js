// Builds the course tree (sections → units → path nodes) and the global item index from content.
import { HIRAGANA_ROWS, kanaId } from './content/kana.js';
import { KANA_UNIT_WORDS, WORD_UNITS } from './content/words.js';
import { TOKYO_UNITS } from './content/tokyo.js';

export const ITEMS = new Map();
const UNIT_COLORS = ['green', 'blue', 'purple', 'orange', 'red'];

function addItem(item) {
  if (ITEMS.has(item.id)) throw new Error(`Duplicate item id ${item.id}`);
  ITEMS.set(item.id, item);
  return item.id;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function addWord([jp, romaji, en, emoji], section, prefix = '') {
  return addItem({ id: `${prefix}w-${slug(romaji)}`, type: 'word', jp, romaji, en, emoji, section });
}

function addSentence({ jp, romaji, en }, section, prefix = '') {
  const romajiChunks = romaji.split(' ');
  if (romajiChunks.length !== jp.length) throw new Error(`Romaji "${romaji}" must have one word per chunk`);
  return addItem({ id: `${prefix}s-${slug(romaji)}`, type: 'sentence', jp, text: jp.join(''), romaji, romajiChunks, en, section });
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

// Lessons, a chest after the second lesson, and a unit review trophy at the end.
function buildNodes(unitId, lessons) {
  const nodes = lessons.map((l, i) => ({ id: `${unitId}-l${i + 1}`, kind: 'lesson', title: l.title, items: l.items, icon: l.icon }));
  if (nodes.length >= 3) nodes.splice(2, 0, { id: `${unitId}-chest`, kind: 'chest', title: 'Treasure chest' });
  nodes.push({ id: `${unitId}-review`, kind: 'review', title: 'Unit review', items: lessons.flatMap((l) => l.items) });
  return nodes;
}

function buildHiraganaSection() {
  const units = HIRAGANA_ROWS.map((row, u) => {
    const kanaIds = row.kana.map(([kana, romaji, hint]) =>
      addItem({ id: kanaId(kana), type: 'kana', jp: kana, romaji, hint, section: 'hiragana' }),
    );
    const groupSize = kanaIds.length > 6 ? 5 : 3;
    const kanaLessons = chunk(kanaIds, groupSize).map((ids) => ({
      title: ids.map((id) => ITEMS.get(id).jp).join(' '),
      items: ids,
      icon: 'kana',
    }));
    const wordIds = (KANA_UNIT_WORDS[row.id] || []).map((w) => addWord(w, 'hiragana'));
    const wordLessons = chunk(wordIds, wordIds.length > 6 ? 5 : 3).map((ids, i) => ({
      title: i === 0 ? 'First words' : 'More words',
      items: ids,
      icon: 'word',
    }));
    return {
      id: `hira-${row.id}`,
      title: row.title,
      desc: `Hiragana: ${row.kana.map((k) => k[0]).slice(0, 6).join(' ')}${row.kana.length > 6 ? ' …' : ''}`,
      color: UNIT_COLORS[u % UNIT_COLORS.length],
      nodes: buildNodes(`hira-${row.id}`, [...kanaLessons, ...wordLessons]),
    };
  });
  return { id: 'hiragana', title: 'Hiragana', romajiUntilLevel: 1, readsKana: true, units };
}

// Sections taught with words and sentences (romajiUntilLevel: show romaji below this lesson level).
function buildPhraseSection({ id, title, units: source, romajiUntilLevel, readsKana, prefix = '', colorShift = 0 }) {
  const units = source.map((unit, u) => {
    const lessons = unit.lessons.map((l) => {
      const words = (l.words || []).map((w) => addWord(w, id, prefix));
      const sentences = (l.sentences || []).map((s) => addSentence(s, id, prefix));
      return { title: l.title, items: [...words, ...sentences], icon: sentences.length ? 'chat' : 'emoji' };
    });
    return {
      id: `${id}-${unit.id}`,
      title: unit.title,
      desc: unit.desc,
      color: UNIT_COLORS[(u + colorShift) % UNIT_COLORS.length],
      nodes: buildNodes(`${id}-${unit.id}`, lessons),
    };
  });
  return { id, title, romajiUntilLevel, readsKana, units };
}

// The Tokyo section comes first in the path but its items get a prefix so they never clash with
// the same words taught again (in kana) later on.
const tokyo = buildPhraseSection({ id: 'tokyo', title: 'Tokyo trip', units: TOKYO_UNITS, romajiUntilLevel: Infinity, readsKana: false, prefix: 't' });
const hiragana = buildHiraganaSection();
const words = buildPhraseSection({ id: 'words', title: 'First words', units: WORD_UNITS, romajiUntilLevel: 2, readsKana: true, colorShift: 1 });
export const SECTIONS = [tokyo, hiragana, words];

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

export const MAX_LEVEL = 5;
export const sectionOf = (item) => SECTIONS.find((s) => s.id === item.section);

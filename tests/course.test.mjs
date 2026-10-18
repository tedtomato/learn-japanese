import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, NODES, SECTIONS } from '../app/js/course.js';
import { KANA } from '../app/js/content/kana.js';
import { FACTS, PHRASES, KANJI as PEEKS } from '../app/js/content/extras.js';
import { KANJI, KANJI_LESSONS } from '../app/js/content/kanji.js';
import { GRAMMAR } from '../app/js/content/grammar.js';
import { STROKES } from '../app/js/content/strokes.js';
import { syllables, syllablesFor } from '../app/js/romaji.js';
import { artCode } from '../app/js/art.js';
import { existsSync } from 'node:fs';

test('the course starts with Tokyo phrases and has no hiragana-only sections', () => {
  assert.equal(SECTIONS[0].id, 'tokyo');
  assert.ok(SECTIONS.every((s) => !/hiragana/i.test(s.title)));
  assert.equal(new Set(NODES.map((n) => n.id)).size, NODES.length);
  // Reading lessons are spread through the themed units.
  const unitsWithReading = SECTIONS.flatMap((s) => s.units).filter((u) => u.nodes.some((n) => n.kind === 'read'));
  assert.ok(unitsWithReading.length >= 8);
});

test('every word and sentence becomes readable within the course', () => {
  const unreadable = [...ITEMS.values()].filter((i) => (i.type === 'word' || i.type === 'sentence') && !i.readAt);
  assert.deepEqual(unreadable.map((i) => i.jp.toString()), []);
});

test('every node points at real items, and every taught character can be traced', () => {
  for (const node of NODES) {
    if (node.kind === 'chest') continue;
    assert.ok(node.items.length > 0, node.id);
    for (const id of [...node.items, ...(node.readWords || [])]) assert.ok(ITEMS.has(id), `${node.id} → ${id}`);
  }
  for (const ch of KANA.keys()) assert.ok(STROKES[ch], `no strokes for ${ch}`);
  for (const k of KANJI) assert.ok(STROKES[k.k], `no strokes for ${k.k}`);
});

test('kanji lessons cover every kanji, with stories and compound words', () => {
  const taught = new Set(KANJI_LESSONS.flatMap((l) => l.kanji || []));
  for (const k of KANJI) {
    assert.ok(taught.has(k.k), `${k.k} not taught`);
    assert.ok(k.story && k.words.length, `${k.k} needs a story and words`);
  }
  assert.ok(NODES.some((n) => n.kind === 'kanji'));
});

test('grammar cards referenced by lessons exist and their checks are answerable', () => {
  for (const g of Object.values(GRAMMAR)) assert.ok(g.check.options.includes(g.check.answer));
});

test('syllable romaji matches the official romaji for every word', () => {
  for (const it of ITEMS.values()) {
    if (it.type === 'word') assert.ok(syllablesFor(it.jp, it.romaji), `${it.jp} ≠ ${it.romaji}: ${syllables(it.jp).map((s) => s.romaji).join('-')}`);
  }
  assert.deepEqual(syllables('きっぷ').map((s) => s.romaji), ['ki', 'ppu']);
  assert.deepEqual(syllables('でんしゃ').map((s) => s.romaji), ['de', 'n', 'sha']);
});

test('every illustration used is bundled', () => {
  for (const it of ITEMS.values()) {
    if (it.art) assert.ok(existsSync(new URL(`../app/art/${artCode(it.art)}.svg`, import.meta.url)), `missing art for ${it.jp} ${it.art}`);
  }
});

test('extras data is complete, with data corrections applied', () => {
  assert.equal(FACTS.length, 200);
  assert.equal(PHRASES.length, 52);
  assert.equal(PEEKS.length, 66);
  const byId = Object.fromEntries(PHRASES.map((p) => [p.id, p]));
  assert.equal(byId[35].jp, 'コンビニ');
  assert.match(byId[34].romaji, /^Kurejitto/);
  assert.equal(byId[49].romaji, 'Yakkyoku');
});


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
  // No kana in section 1, a little hiragana per unit after that, never katakana.
  assert.ok(SECTIONS[0].units.every((u) => !u.nodes.some((n) => n.kind === 'read')));
  const unitsWithReading = SECTIONS.flatMap((s) => s.units).filter((u) => u.nodes.some((n) => n.kind === 'read'));
  assert.ok(unitsWithReading.length >= 4);
  const readChars = NODES.filter((n) => n.kind === 'read').flatMap((n) => n.items.map((id) => ITEMS.get(id)));
  assert.ok(readChars.every((k) => k.script === 'hiragana'));
});

test('every hiragana word and sentence becomes readable within the course', () => {
  const unreadable = [...ITEMS.values()].filter((i) => (i.type === 'word' || i.type === 'sentence') && !i.readAt && i.chars.every((c) => KANA.get(c).script === 'hiragana'));
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


test('gems buy a full set of hearts, only when some are missing and gems suffice', async () => {
  const { defaultState, buyHearts, loseHeart, currentHearts, HEARTS_PRICE, MAX_HEARTS } = await import('../app/js/progress.js');
  const now = Date.now();
  const s = defaultState(now);
  s.gems = HEARTS_PRICE + 5;
  assert.equal(buyHearts(s, now), false, 'full hearts: nothing to buy');
  loseHeart(s, now); loseHeart(s, now);
  assert.equal(buyHearts(s, now), true);
  assert.equal(currentHearts(s, now), MAX_HEARTS);
  assert.equal(s.gems, 5);
  loseHeart(s, now);
  assert.equal(buyHearts(s, now), false, 'not enough gems');
});

test('every fun fact has a fair quiz question', async () => {
  const { FACT_QUIZ } = await import('../app/js/content/fact-quiz.js');
  for (const f of FACTS) {
    const e = FACT_QUIZ[f.id];
    assert.ok(e, `fact ${f.id} has a question`);
    assert.equal(e.wrong.length, 3);
    assert.ok(!e.q.toLowerCase().includes(e.a.toLowerCase()), `fact ${f.id}: answer not in the question`);
    assert.equal(new Set([e.a, ...e.wrong].map((x) => x.toLowerCase())).size, 4, `fact ${f.id}: four different answers`);
  }
});

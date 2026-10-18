import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, NODES, SECTIONS } from '../app/js/course.js';
import { HIRAGANA_ROWS } from '../app/js/content/kana.js';
import { KANA_UNIT_WORDS } from '../app/js/content/words.js';
import { FACTS, PHRASES, KANJI } from '../app/js/content/extras.js';

test('course has all 71 hiragana and unique node ids', () => {
  assert.equal([...ITEMS.values()].filter((i) => i.type === 'kana').length, 71);
  assert.equal(new Set(NODES.map((n) => n.id)).size, NODES.length);
  assert.ok(SECTIONS.length >= 2);
});

test('every lesson and review node points at real items', () => {
  for (const node of NODES) {
    if (node.kind === 'chest') continue;
    assert.ok(node.items.length > 0, node.id);
    for (const id of node.items) assert.ok(ITEMS.has(id), `${node.id} → ${id}`);
  }
});

test('words in hiragana units only use kana taught so far', () => {
  const known = new Set();
  for (const row of HIRAGANA_ROWS) {
    row.kana.forEach(([k]) => known.add(k));
    for (const [jp] of KANA_UNIT_WORDS[row.id] || []) {
      for (const ch of jp) assert.ok(known.has(ch), `${jp} uses ${ch} before it is taught (unit ${row.id})`);
    }
  }
});

test('extras data is complete', () => {
  assert.equal(FACTS.length, 200);
  assert.equal(PHRASES.length, 52);
  assert.equal(KANJI.length, 66);
  for (const f of FACTS) assert.ok(f.title && f.text && f.icon, `fact ${f.id}`);
  for (const p of PHRASES) assert.ok(p.jp && p.romaji && p.en, `phrase ${p.id}`);
});

test('known data corrections stay applied', () => {
  const byId = Object.fromEntries(PHRASES.map((p) => [p.id, p]));
  assert.equal(byId[35].jp, 'コンビニ');
  assert.match(byId[34].romaji, /^Kurejitto/);
  assert.equal(byId[49].romaji, 'Yakkyoku');
});

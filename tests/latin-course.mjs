// Shared checks for the Latin-alphabet courses (French, Spanish, English). Each *.test.mjs file
// picks its course with __HAJIME_COURSE__ before importing this, as the course is built at load.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const { ITEMS, NODES, SECTIONS } = await import('../app/js/course.js');
const { generateLesson, generatePractice, makeRng } = await import('../app/js/lesson/generate.js');
const { defaultState } = await import('../app/js/progress.js');
const { L } = await import('../app/js/lang.js');
const { romajiMatch, speechKey, sameTiles } = await import('../app/js/normalise.js');
const { speechMatches } = await import('../app/js/audio.js');
const pack = await import('../app/js/content/pack.js');
const { artCode } = await import('../app/js/art.js');
const { EMOJI_NAMES } = await import('../app/js/tidbits.js');

const T0 = new Date(2026, 10, 2, 10, 0).getTime();
const hasArt = (emoji) => existsSync(new URL(`../app/art/${artCode(emoji)}.svg`, import.meta.url));

export function latinCourseTests(code) {
  test(`${code}: the course is built from its own pack, words only (no kana, characters or strokes)`, () => {
    assert.equal(L.code, code);
    assert.ok(L.latin);
    assert.ok(SECTIONS.length >= 3, 'at least three sections');
    assert.ok(SECTIONS.flatMap((s) => s.units).length >= 9, 'at least nine units');
    assert.ok(!NODES.some((n) => n.kind === 'read' || n.kind === 'kanji'));
    assert.ok([...ITEMS.values()].filter((i) => i.type === 'word').length >= 120, 'at least 120 words');
    assert.ok([...ITEMS.values()].filter((i) => i.type === 'sentence').length >= 40, 'at least 40 sentences');
  });

  test(`${code}: every word, sentence and lesson is well formed`, () => {
    for (const it of ITEMS.values()) {
      if (it.type === 'word') {
        assert.ok(it.jp && it.en && it.art, `word ${it.id}`);
        assert.ok(hasArt(it.art), `missing art for ${it.jp} ${it.art}`);
      }
      if (it.type === 'sentence') {
        assert.ok(it.jp.length >= 2, `sentence ${it.text} needs at least two chunks`);
        assert.ok(it.jp.every((c) => c.trim() === c && c), `sentence ${it.text}: empty or padded chunk`);
        assert.ok(!/[.?!]$/.test(it.text), `sentence ${it.text}: no final punctuation`);
      }
    }
    for (const n of NODES) if (n.kind === 'lesson') assert.ok(n.items.length >= 2, `${n.id} has too few items`);
  });

  test(`${code}: every node makes valid exercises at every level`, () => {
    const state = defaultState(T0);
    for (const node of NODES) {
      if (node.kind === 'chest') continue;
      for (const level of [0, 2]) {
        const { exercises } = generateLesson(node, state, { rng: makeRng(1), now: T0, level, canListen: true });
        assert.ok(exercises.length > 0, node.id);
      }
      for (const id of node.items || []) state.items[id] = { box: 3, seen: 2, right: 2, wrong: 0, last: T0, due: T0 };
    }
    assert.ok(generatePractice(state, { now: T0 }).exercises.length > 0);
  });

  test(`${code}: grammar cards, dialogues, facts, phrases, missions and drills fit together`, () => {
    const { GRAMMAR, DIALOGUES, FACTS, PHRASES, FACT_QUIZ, MISSIONS, PATTERNS } = pack;
    for (const n of NODES) if (n.grammar) assert.ok(GRAMMAR[n.grammar], `${n.id}: grammar card ${n.grammar}`);
    for (const [id, g] of Object.entries(GRAMMAR)) {
      assert.ok(g.title && g.rule && g.blocks.length && g.en && g.tip, id);
      assert.equal(g.check.prompt.filter((c) => c === null).length, 1, `${id}: one gap`);
      assert.ok(g.check.options.includes(g.check.answer), `${id}: answer among options`);
    }
    for (const [id, d] of Object.entries(DIALOGUES)) {
      assert.ok(d.lines.length >= 2 && d.options.length >= 3 && d.question, id);
      for (const l of d.lines) assert.ok([0, 1].includes(l.who) && l.jp && l.en, id);
    }
    const dialogueIds = new Set(Object.keys(DIALOGUES));
    for (const u of pack.SECTIONS_DATA.flatMap((s) => s.units)) for (const d of u.dialogues || []) assert.ok(dialogueIds.has(d), `${u.id}: dialogue ${d}`);
    const categories = new Set(FACTS.map((f) => f.category));
    const phraseCats = new Set(PHRASES.map((p) => p.category));
    for (const u of pack.SECTIONS_DATA.flatMap((s) => s.units)) {
      for (const c of u.facts || []) assert.ok(categories.has(c), `${u.id}: fact category ${c}`);
      for (const c of u.phrases || []) assert.ok(phraseCats.has(c), `${u.id}: phrase category ${c}`);
    }
    assert.ok(FACTS.length >= 30, 'at least 30 facts');
    assert.equal(new Set(FACTS.map((f) => f.id)).size, FACTS.length, 'unique fact ids');
    for (const f of FACTS) {
      assert.ok(EMOJI_NAMES.includes(f.icon), `fact ${f.id}: unknown icon ${f.icon}`);
      const q = FACT_QUIZ[f.id];
      assert.ok(q && q.q && q.a && q.wrong.length === 3, `fact ${f.id}: quiz question`);
    }
    assert.ok(PHRASES.length >= 20, 'at least 20 phrases');
    for (const p of PHRASES) assert.ok(p.jp && p.say && p.en && EMOJI_NAMES.includes(p.icon), `phrase ${p.id}`);
    const units = new Set(SECTIONS.flatMap((s) => s.units.map((u) => u.id)));
    assert.ok(MISSIONS.length >= 4);
    for (const m of MISSIONS) {
      assert.ok(units.has(m.unit), `${m.id}: unit ${m.unit}`);
      assert.ok(hasArt(m.art), `${m.id}: art ${m.art}`);
      assert.ok(m.steps.every((s) => s.replies.some((r) => r.ok)), `${m.id}: every step has a right reply`);
    }
    assert.ok(PATTERNS.length >= 4);
    for (const p of PATTERNS) {
      assert.ok(hasArt(p.art), `${p.id}: art ${p.art}`);
      for (const [id] of p.slots) assert.equal(ITEMS.get(id)?.type, 'word', `${p.id}: ${id}`);
    }
  });

  test(`${code}: typed answers keep letters apart (no romaji vowel folding) but forgive accents and punctuation`, () => {
    assert.equal(romajiMatch('vos', 'vous'), false);
    assert.equal(romajiMatch('poor', 'pour'), false);
    assert.equal(romajiMatch('too', 'to'), false);
    assert.equal(romajiMatch('ano', 'año'), false);
    assert.equal(romajiMatch('soeur', 'sœur'), 'exact');
    assert.equal(romajiMatch('cafe', 'café'), 'exact');
    assert.equal(romajiMatch('ou est', 'où est'), 'exact');
    assert.equal(romajiMatch("L'eau", 'l’eau'), 'exact');
    assert.equal(romajiMatch('bonjuor', 'bonjour'), false);
    assert.equal(romajiMatch('bonjou', 'bonjour'), 'close');
    assert.equal(romajiMatch('', 'bonjour'), false);
  });

  test(`${code}: speech matching is strict for short and similar words`, () => {
    assert.ok(speechMatches(['Bonjour'], ['bonjour']));
    assert.ok(speechMatches(['oh bonjour madame'], ['bonjour']));
    assert.ok(!speechMatches(['bonsoir'], ['bonjour']));
    assert.ok(!speechMatches(['nom'], ['non']));
    assert.ok(!speechMatches(['cola'], ['hola']));
    assert.equal(speechKey('Où est ?'), 'ouest');
  });

  test(`${code}: tiles are compared word by word`, () => {
    assert.ok(!sameTiles(['par', 'le'], ['parle']));
    assert.ok(!sameTiles(['un', 'a'], ['una']));
    assert.ok(sameTiles(['Je', 'parle'], ['je', 'parle']));
    assert.ok(!sameTiles(['je', 'parle'], ['parle', 'je']));
  });
}

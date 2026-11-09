// Shared checks for the Latin-alphabet courses (French, Spanish, English). Each *.test.mjs file
// picks its course with __HAJIME_COURSE__ before importing this, as the course is built at load.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const { ITEMS, NODES, SECTIONS } = await import('../app/js/course.js');
const { generateLesson, generatePractice, makeRng, demoExercises, DEMO_KINDS, articleParts, PRODUCTION_SHARE } = await import('../app/js/lesson/generate.js');
const { playThrough, learnedState, productionShare } = await import('./sim.mjs');
const { latinKey } = await import('../app/js/normalise.js');
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

  test(`${code}: dictation, cloze, type-translate and article tasks are generated and well formed`, () => {
    const state = defaultState(T0);
    const kinds = { dictation: 'dictation', cloze: 'cloze', translate: 'type-translate', article: 'article' };
    for (const k of Object.keys(kinds)) assert.ok(DEMO_KINDS[k], `${k} is in the test lab`);
    const made = {};
    for (let seed = 1; seed <= 6; seed++) {
      for (const [demo, kind] of Object.entries(kinds)) {
        for (const ex of demoExercises(demo, state, { rng: makeRng(seed) })) {
          assert.equal(ex.kind, kind);
          (made[kind] ||= []).push(ex);
          const item = ITEMS.get(ex.itemId);
          assert.deepEqual(ex.itemIds, [ex.itemId]);
          if (kind === 'dictation' || kind === 'type-translate') {
            assert.equal(ex.type, 'recall');
            assert.ok(item.type === 'sentence' || kind === 'dictation');
          } else {
            assert.equal(ex.type, 'cloze');
            assert.ok(ex.options.includes(ex.answer) && new Set(ex.options.map(latinKey)).size === ex.options.length, `${kind}: answer among distinct options`);
            assert.equal(ex.prompt.filter((c) => c === null).length, 1, `${kind}: one gap`);
          }
          if (kind === 'cloze') {
            assert.equal(ex.options.length, 3);
            assert.ok(item.jp.includes(ex.answer));
            assert.ok(ex.prompt.every((c, i) => c === null ? item.jp[i] === ex.answer : c === item.jp[i]));
            for (const o of ex.options.filter((o) => o !== ex.answer)) assert.ok(!item.jp.some((c) => latinKey(c) === latinKey(o)), `distractor ${o} is not in ${item.text}`);
          }
          if (kind === 'article') {
            const p = articleParts(item);
            assert.ok(p && p.article === ex.answer && ex.prompt[1] === p.noun && ex.options.length === 2);
          }
        }
      }
    }
    for (const kind of ['dictation', 'cloze', 'type-translate']) assert.ok(made[kind]?.length, `${kind} was generated`);
    if (code !== 'en') assert.ok(made.article?.length, 'article was generated');
    // Words whose article is ambiguous are never asked about.
    for (const w of [...ITEMS.values()].filter((i) => i.type === 'word' && /^(l'|les |los |las )/i.test(i.jp))) assert.equal(articleParts(w), null, w.jp);
    // They appear in lessons too, and dictation needs listening.
    const types = new Set();
    const heard = new Set();
    for (const node of NODES.filter((n) => n.kind === 'lesson')) {
      for (const canListen of [true, false]) {
        for (const ex of generateLesson(node, state, { rng: makeRng(7), now: T0, level: 3, canListen }).exercises) {
          if (['dictation', 'cloze', 'type-translate', 'article'].includes(ex.kind)) (canListen ? types : heard).add(ex.kind);
        }
      }
    }
    assert.ok(types.size >= 2, 'new task types turn up in lessons');
    assert.ok(!heard.has('dictation'), 'no dictation when the learner cannot listen');
  });

  test(`${code}: wrong-article distractors are made up for nouns with an article, and never for ambiguous ones`, () => {
    const state = defaultState(T0);
    const nouns = [...ITEMS.values()].filter((i) => articleParts(i)).map((i) => i.id);
    if (code === 'en') return;
    assert.ok(nouns.length >= 10, 'enough nouns with an article');
    let fakes = 0;
    for (let seed = 1; seed <= 30; seed++) {
      for (const ex of generatePractice(state, { rng: makeRng(seed), now: T0, itemIds: nouns.slice(0, 10) }).exercises) {
        for (const [id, fake] of Object.entries(ex.fakes || {})) {
          fakes += 1;
          const item = ITEMS.get(ex.itemId);
          const p = articleParts(item);
          assert.equal(ex.answerKind, 'jp');
          assert.equal(fake.jp, `${p.wrong} ${p.noun}`);
          assert.ok(ex.options.includes(id) && ex.options.includes(item.id) && new Set(ex.options).size === ex.options.length);
        }
      }
    }
    assert.ok(fakes > 0, 'some questions offer the wrong article');
  });

  test(`${code}: verb-form tasks name a form or fill a gap, with distinct options`, () => {
    assert.ok(pack.CONJUGATIONS.length >= 8, 'conjugation tables');
    for (const c of pack.CONJUGATIONS) {
      assert.ok(Object.keys(c.forms).length >= 3 && c.verb && c.meaning, c.id);
      assert.ok(ITEMS.get(`w-${latinKey(c.verb)}`) || [...ITEMS.values()].some((i) => i.type === 'word' && i.jp.toLowerCase().endsWith(c.verb)), `${c.id}: the verb is a word of the course`);
    }
    assert.ok(DEMO_KINDS.conjugation);
    const kinds = new Set();
    for (let seed = 1; seed <= 6; seed++) {
      for (const ex of demoExercises('conjugation', defaultState(T0), { rng: makeRng(seed) })) {
        kinds.add(ex.kind);
        assert.equal(ex.type, 'conjugation');
        assert.ok(ex.options.includes(ex.answer), 'answer among options');
        assert.equal(new Set(ex.options.map(latinKey)).size, ex.options.length, 'no duplicate options');
        assert.ok(ex.options.length >= 3 && ex.options.length <= 4);
        if (ex.kind === 'conj-sentence') assert.equal(ex.prompt.filter((c) => c === null).length, 1);
        else assert.ok(ex.verb && ex.label && ex.meaning);
      }
    }
    assert.deepEqual([...kinds].sort(), ['conj-sentence', 'conjugation']);
    // They show up in practice once a verb has been met.
    let asked = 0;
    for (let seed = 1; seed <= 30; seed++) asked += generatePractice(learnedState(T0), { rng: makeRng(seed), now: T0 + 1e6 }).exercises.filter((e) => e.type === 'conjugation').length;
    assert.ok(asked >= 15, `${asked} verb-form tasks in 30 sessions`);
  });

  test(`${code}: from level 2 and in reviews, at least 40% of scored tasks are typed or built`, () => {
    const { log } = playThrough({ levels: [0, 1, 2], kinds: ['lesson', 'review'] });
    const mix = (pick) => productionShare(log.filter(pick).flatMap((l) => l.exercises));
    const l2 = mix((l) => l.level === 2 && l.node.kind === 'lesson');
    assert.ok(l2.share >= PRODUCTION_SHARE, `level 2: ${(l2.share * 100).toFixed(1)}%`);
    const reviews = mix((l) => l.level >= 1 && l.node.kind === 'review');
    assert.ok(reviews.share >= PRODUCTION_SHARE, `reviews: ${(reviews.share * 100).toFixed(1)}%`);
  });

  test(`${code}: dialogues with several questions give different questions with the answer first`, () => {
    const multi = Object.values(pack.DIALOGUES).filter((d) => d.questions?.length);
    assert.ok(multi.length >= 5, 'dialogues with questions');
    for (const d of multi) for (const q of d.questions) assert.ok(q.question && q.options.length >= 3 && new Set(q.options).size === q.options.length);
    const asked = new Set();
    for (let seed = 1; seed <= 30; seed++) {
      for (const ex of demoExercises('dialogue', defaultState(T0), { rng: makeRng(seed) })) {
        assert.ok(ex.options.includes(ex.answer));
        asked.add(ex.instruction);
      }
    }
    assert.ok(asked.size > multi.length, 'more than one question per dialogue is asked');
  });

  test(`${code}: pronunciation tips are well formed`, () => {
    assert.ok(pack.PRONUNCIATION.length >= 10);
    for (const p of pack.PRONUNCIATION) assert.ok(p.id && p.title && p.text && p.example && p.say && p.icon, p.id);
  });
}

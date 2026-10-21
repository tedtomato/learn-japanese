// Practice hub: personalised review session, collections, kana charts, kanji and words learned.
import { ITEMS } from '../course.js';
import { HIRAGANA_ROWS, KATAKANA_ROWS, kanaId } from '../content/kana.js';
import { app, statsBar } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { art } from '../art.js';
import { speak } from '../audio.js';
import { strength } from '../srs.js';
import { learnedItemIds, dueItemIds } from '../progress.js';
import { KINDS, emojiFor, phraseSpeech, tidbitCard } from '../tidbits.js';
import { wireShare } from '../share.js';
import { jpItem, speechOf } from '../lesson/text.js';

const level = (st) => (st === 0 ? 'none' : st < 0.34 ? 'weak' : st < 0.67 ? 'mid' : 'strong');

function chart(rows, state, now) {
  return html`<div class="kana-chart">${rows.flatMap((r) => r.kana).map(([k, romaji]) => {
    const st = strength(state.items[kanaId(k)], now);
    return html`<button class="kana-cell s-${level(st)}" data-say="${k}"><span class="jp">${k}</span><small>${romaji}</small></button>`;
  })}</div>`;
}

// Same character learned through different lessons (radical 人, kanji 人, Kanji peek 人): listed once,
// with the fullest entry (kanji word > kanji > radical > peek) and the weakest strength.
const KANJI_RANK = { kword: 0, kanji: 1, radical: 2 };
function uniqueKanji(items, state, now) {
  const byChar = new Map();
  for (const it of items) {
    const prev = byChar.get(it.jp);
    const rank = it.peek ? 3 : KANJI_RANK[it.type];
    const st = strength(state.items[it.id], now);
    if (!prev) byChar.set(it.jp, { it, rank, st });
    else byChar.set(it.jp, { it: rank < prev.rank ? it : prev.it, rank: Math.min(rank, prev.rank), st: Math.min(st, prev.st) });
  }
  return [...byChar.values()].sort((x, y) => x.st - y.st);
}

let lastTab = 'words';

export function renderPractice(root, focus) {
  const { state } = app;
  const now = app.now();
  const learned = learnedItemIds(state);
  const due = dueItemIds(state, now);
  const tab = ['words', 'kanji', 'kana'].includes(focus) ? focus : lastTab;
  lastTab = tab;
  const words = learned.map((id) => ITEMS.get(id)).filter((i) => i.type === 'word' || i.type === 'sentence')
    .map((it) => ({ it, st: strength(state.items[it.id], now) })).sort((x, y) => x.st - y.st);
  const kanji = uniqueKanji(learned.map((id) => ITEMS.get(id)).filter((i) => ['kanji', 'radical', 'kword'].includes(i.type)), state, now);
  const meter = (st) => html`<span class="meter s-${level(st)}"><i style="width:${Math.round(st * 100)}%"></i></span>`;
  const reading = (k) => (k.type === 'kword' ? `${k.kana} · ${k.romaji}` : [k.kun, k.on].filter(Boolean)[0] || '');

  const lists = {
    words: () => (words.length ? html`<div class="word-list">${words.map(({ it: w, st }) => html`<button class="word-row" data-say="${speechOf(w)}">
        ${w.art ? art(w.art, 'art-row') : html`<span class="art-row"></span>`}
        <span class="word-main"><span class="word-jp">${jpItem(w, false)}</span><small>${w.romaji} · ${w.en}</small></span>
        ${meter(st)}</button>`)}</div>`
      : html`<p class="muted">Words you learn will be listed here, weakest first.</p>`),
    kanji: () => (kanji.length ? html`<section class="card kanji-practice">
        <span class="kanji-chip jp">漢</span>
        <div><b>Kanji practice</b><small>${kanji.length >= 3 ? 'Only kanji, weakest first — about 2 min' : 'Learn 3 kanji to unlock'}</small></div>
        <button class="btn btn-secondary start-kanji" ${kanji.length >= 3 ? '' : 'disabled'}>Start</button>
      </section>
      <div class="word-list">${kanji.map(({ it: k, st }) => html`<button class="word-row" data-say="${speechOf(k)}">
        <span class="kanji-chip jp ${[...k.jp].length > 1 ? 'wide' : ''} ${[...k.jp].length > 2 ? 'xwide' : ''}">${k.jp}</span>
        <span class="word-main"><b>${k.en}</b><small>${reading(k)}</small></span>
        ${meter(st)}</button>`)}</div>`
      : html`<p class="muted">Kanji lessons appear along the path from the second unit.</p>`),
    kana: () => html`${kanaCard('hiragana', 'あ', 'Hiragana practice')}${kanaCard('katakana', 'ア', 'Katakana practice')}<p class="muted legend"><i class="dot strong"></i>Strong <i class="dot mid"></i>Okay <i class="dot weak"></i>Fading <i class="dot none"></i>Not learned</p>
      <h3 class="sub-title small-title">Hiragana</h3>${chart(HIRAGANA_ROWS, state, now)}
      <h3 class="sub-title small-title">Katakana</h3>${chart(KATAKANA_ROWS, state, now)}`,
  };
  // Drill cards for each script: gentle questions on the 8 weakest characters (from 3 learned).
  const kanaCount = (script) => learned.filter((id) => ITEMS.get(id).type === 'kana' && ITEMS.get(id).script === script).length;
  const kanaCard = (script, ch, title) => {
    const n = kanaCount(script);
    if (!n) return '';
    return html`<section class="card kanji-practice"><span class="kanji-chip jp">${ch}</span>
      <div><b>${title}</b><small>${n >= 3 ? 'Your weakest characters, with hints — no rush' : 'Learn 3 characters to unlock'}</small></div>
      <button class="btn btn-secondary start-kana" data-script="${script}" ${n >= 3 ? '' : 'disabled'}>Start</button></section>`;
  };
  const TABS = [['words', 'Words', words.length], ['kanji', 'Kanji', kanji.length], ['kana', 'Kana', null]];

  mount(root, html`<header class="topbar">${statsBar()}</header>
  <main class="page">
    <h1 class="page-title">Practice</h1>
    <section class="card practice-hero">
      ${mascot(due.length ? 'happy' : 'cheer', 84)}
      <div>
        <h2>${learned.length ? (due.length ? `${due.length} to review` : 'All fresh!') : 'Nothing to review yet'}</h2>
        <p class="muted">${learned.length
          ? 'A quick mix of what you are close to forgetting. No hearts lost, and you earn one back.'
          : 'Finish your first lesson and your reviews will show up here.'}</p>
        <button class="btn btn-secondary start-practice" ${learned.length ? '' : 'disabled'}>${icon('refresh', 18)} Start practice</button>
      </div>
    </section>

    <h2 class="sub-title">Collections</h2>
    <div class="collections">
      <a class="card collection" href="#/collection/phrase">${art('💬', 'art-col')}<b>Phrasebook</b><small>${KINDS.phrase.list.length} phrases</small></a>
      <a class="card collection" href="#/collection/fact">${art('🗾', 'art-col')}<b>Fun facts</b><small>${state.seen.fact.length} / ${KINDS.fact.list.length}</small></a>
      <a class="card collection" href="#/collection/kanji"><span class="col-emoji jp">漢</span><b>Kanji spotted</b><small>${state.seen.kanji.length} / ${KINDS.kanji.list.length}</small></a>
    </div>

    <h2 class="sub-title" id="sec-learned">What you've learned</h2>
    <div class="seg practice-tabs" role="tablist">${TABS.map(([id, label, n]) => html`<button role="tab" class="${id === tab ? 'on' : ''}" data-tab="${id}">${label}${n != null ? html` <small>${n}</small>` : ''}</button>`)}</div>
    <div class="practice-list">${lists[tab]()}</div>
  </main>`);

  $('.start-practice', root).addEventListener('click', () => app.go('#/practice/go'));
  $('.start-kanji', root)?.addEventListener('click', () => app.go('#/practice/kanji-go'));
  $$('.start-kana', root).forEach((b) => b.addEventListener('click', () => app.go(`#/practice/${b.dataset.script}-go`)));
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => {
    lastTab = b.dataset.tab;
    renderPractice(root, b.dataset.tab);
    $('#sec-learned', root)?.scrollIntoView({ block: 'start' });
  }));
  if (focus && focus !== 'go') requestAnimationFrame(() => $('#sec-learned', root)?.scrollIntoView({ block: 'start' }));
}

// Phrasebook (always complete), discovered facts and spotted kanji.
export function renderCollection(root, kind) {
  const info = KINDS[kind];
  if (!info) return app.go('#/practice');
  const seen = new Set(app.state.seen[kind]);
  const items = kind === 'phrase' ? info.list : info.list.filter((x) => seen.has(x.id));
  const groups = new Map();
  items.forEach((x) => {
    const g = x.category || '';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(x);
  });
  const locked = info.list.length - items.length;

  mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/practice" aria-label="Back">${icon('close', 24)}</a><h1>${info.collection}</h1></header>
  <main class="page">
    ${kind !== 'phrase' ? html`<p class="muted">${items.length ? `${items.length} of ${info.list.length} found.` : 'Nothing found yet.'} ${locked ? 'Keep doing lessons to discover more — they pop up on your path and during lessons.' : 'You found them all!'}${kind === 'kanji' ? ' Spotted kanji also come back in practice, with their tip as a clue.' : ''}</p>` : html`<p class="muted">Tap a phrase to hear it.</p>`}
    ${[...groups].map(([g, list]) => html`${g && g !== 'Basic kanji' ? html`<h2 class="sub-title">${g}</h2>` : ''}
      ${kind === 'phrase'
        ? html`<div class="word-list">${list.map((p) => html`<button class="word-row phrase-row" data-say="${phraseSpeech(p)}">
            ${art(emojiFor(p.icon), 'art-row')}
            <span class="phrase-main"><span class="jp word-jp">${p.jp}</span><small>${p.romaji} · ${p.en}</small></span></button>`)}</div>`
        : html`<div class="tidbit-list">${list.map((x) => tidbitCard(kind, x))}</div>`}`)}
  </main>`);
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  wireShare(root);
}

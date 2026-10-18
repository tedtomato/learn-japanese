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
import { KINDS, emojiFor, phraseSpeech, tidbitBody } from '../tidbits.js';
import { jpItem, speechOf } from '../lesson/text.js';

const level = (st) => (st === 0 ? 'none' : st < 0.34 ? 'weak' : st < 0.67 ? 'mid' : 'strong');

function chart(rows, state, now) {
  return html`<div class="kana-chart">${rows.flatMap((r) => r.kana).map(([k, romaji]) => {
    const st = strength(state.items[kanaId(k)], now);
    return html`<button class="kana-cell s-${level(st)}" data-say="${k}"><span class="jp">${k}</span><small>${romaji}</small></button>`;
  })}</div>`;
}

export function renderPractice(root, focus) {
  const { state } = app;
  const now = app.now();
  const learned = learnedItemIds(state);
  const due = dueItemIds(state, now);
  const byStrength = (list) => list.sort((a, b) => strength(state.items[a.id], now) - strength(state.items[b.id], now));
  const words = byStrength(learned.map((id) => ITEMS.get(id)).filter((i) => i.type === 'word' || i.type === 'sentence'));
  const kanji = byStrength(learned.map((id) => ITEMS.get(id)).filter((i) => ['kanji', 'radical', 'kword'].includes(i.type)));
  const meter = (it) => {
    const st = strength(state.items[it.id], now);
    return html`<span class="meter s-${level(st)}"><i style="width:${Math.round(st * 100)}%"></i></span>`;
  };

  mount(root, html`<header class="topbar">${statsBar()}</header>
  <main class="page">
    <h1 class="page-title">Practice</h1>
    <section class="card practice-hero">
      ${mascot(due.length ? 'happy' : 'cheer', 84)}
      <div>
        <h2>${learned.length ? (due.length ? `${due.length} to review` : 'All fresh!') : 'Nothing to review yet'}</h2>
        <p class="muted">${learned.length
          ? 'A quick mix of what you are close to forgetting — including words you hesitated on. No hearts lost, and you earn one back.'
          : 'Finish your first lesson and your reviews will show up here.'}</p>
        <button class="btn btn-secondary start-practice" ${learned.length ? '' : 'disabled'}>${icon('refresh', 18)} Start practice</button>
      </div>
    </section>

    <h2 class="sub-title">Collections</h2>
    <div class="collections">
      <a class="card collection" href="#/collection/phrase">${art('💬', 'art-col')}<b>Phrasebook</b><small>${KINDS.phrase.list.length} travel phrases</small></a>
      <a class="card collection" href="#/collection/fact">${art('🗾', 'art-col')}<b>Fun facts</b><small>${state.seen.fact.length} / ${KINDS.fact.list.length} discovered</small></a>
      <a class="card collection" href="#/collection/kanji"><span class="col-emoji jp">漢</span><b>Kanji spotted</b><small>${state.seen.kanji.length} / ${KINDS.kanji.list.length} seen</small></a>
    </div>

    <h2 class="sub-title" id="sec-words">Your words (${words.length})</h2>
    ${words.length ? html`<div class="word-list">${words.map((w) => html`<button class="word-row" data-say="${speechOf(w)}">
        ${w.art ? art(w.art, 'art-row') : html`<span class="art-row"></span>`}
        <span class="word-main"><span class="word-jp">${jpItem(w, false)}</span><small>${w.romaji} · ${w.en}</small></span>
        ${meter(w)}</button>`)}</div>`
      : html`<p class="muted">Words you learn will be listed here, weakest first.</p>`}

    <h2 class="sub-title" id="sec-kanji">Kanji & radicals (${kanji.length})</h2>
    ${kanji.length ? html`<div class="word-list">${kanji.map((k) => html`<button class="word-row" data-say="${speechOf(k)}">
        <span class="kanji-chip jp">${k.jp}</span>
        <span class="word-main"><b>${k.en}</b><small>${k.type === 'kword' ? `${k.kana} · ${k.romaji}` : k.story || ''}</small></span>
        ${meter(k)}</button>`)}</div>`
      : html`<p class="muted">Kanji lessons appear along the path from the second unit.</p>`}

    <h2 class="sub-title" id="sec-kana">Hiragana</h2>
    <p class="muted legend"><i class="dot strong"></i>Strong <i class="dot mid"></i>Okay <i class="dot weak"></i>Fading <i class="dot none"></i>Not learned</p>
    ${chart(HIRAGANA_ROWS, state, now)}
    <h2 class="sub-title">Katakana</h2>
    ${chart(KATAKANA_ROWS, state, now)}
  </main>`);

  $('.start-practice', root).addEventListener('click', () => app.go('#/practice/go'));
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  const target = { words: '#sec-words', kana: '#sec-kana', kanji: '#sec-kanji' }[focus];
  if (target) requestAnimationFrame(() => $(target, root)?.scrollIntoView({ block: 'start' }));
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
        : html`<div class="tidbit-list">${list.map((x) => html`<section class="card tidbit tidbit-${kind}">${tidbitBody(kind, x)}</section>`)}</div>`}`)}
  </main>`);
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
}

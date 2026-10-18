// Practice hub: personalised review session plus a hiragana chart showing what is strong or fading.
import { ITEMS } from '../course.js';
import { HIRAGANA_ROWS, kanaId } from '../content/kana.js';
import { app, statsBar } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { speak } from '../audio.js';
import { strength } from '../srs.js';
import { learnedItemIds, dueItemIds } from '../progress.js';
import { KINDS, emojiFor, phraseSpeech, tidbitBody } from '../tidbits.js';

const level = (st) => (st === 0 ? 'none' : st < 0.34 ? 'weak' : st < 0.67 ? 'mid' : 'strong');

export function renderPractice(root) {
  const { state } = app;
  const now = app.now();
  const learned = learnedItemIds(state);
  const due = dueItemIds(state, now);
  const words = learned.map((id) => ITEMS.get(id)).filter((i) => i.type !== 'kana');
  words.sort((a, b) => strength(state.items[a.id], now) - strength(state.items[b.id], now));

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
      <a class="card collection" href="#/collection/phrase"><span class="col-emoji">💬</span><b>Phrasebook</b><small>${KINDS.phrase.list.length} travel phrases</small></a>
      <a class="card collection" href="#/collection/fact"><span class="col-emoji">🗾</span><b>Fun facts</b><small>${state.seen.fact.length} / ${KINDS.fact.list.length} discovered</small></a>
      <a class="card collection" href="#/collection/kanji"><span class="col-emoji">漢</span><b>Kanji spotted</b><small>${state.seen.kanji.length} / ${KINDS.kanji.list.length} seen</small></a>
    </div>

    <h2 class="sub-title">Hiragana</h2>
    <p class="muted legend"><i class="dot strong"></i>Strong <i class="dot mid"></i>Okay <i class="dot weak"></i>Fading <i class="dot none"></i>Not learned</p>
    <div class="kana-chart">
      ${HIRAGANA_ROWS.flatMap((r) => r.kana).map(([k, romaji]) => {
        const st = strength(state.items[kanaId(k)], now);
        return html`<button class="kana-cell s-${level(st)}" data-say="${k}"><span class="jp">${k}</span><small>${romaji}</small></button>`;
      })}
    </div>

    ${words.length ? html`<h2 class="sub-title">Your words (${words.length})</h2>
    <div class="word-list">${words.map((w) => {
      const st = strength(state.items[w.id], now);
      return html`<button class="word-row" data-say="${w.text || w.jp}">
        <span class="jp word-jp">${w.type === 'sentence' ? w.jp.join('') : w.jp}</span>
        <span class="word-en">${w.emoji || ''} ${w.en}</span>
        <span class="meter s-${level(st)}"><i style="width:${Math.round(st * 100)}%"></i></span>
      </button>`;
    })}</div>` : ''}
  </main>`);

  $('.start-practice', root).addEventListener('click', () => app.go('#/practice/go'));
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
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
    ${kind !== 'phrase' ? html`<p class="muted">${items.length ? `${items.length} of ${info.list.length} found.` : 'Nothing found yet.'} ${locked ? 'Keep doing lessons to discover more — they pop up on your path and during lessons.' : 'You found them all!'}</p>` : html`<p class="muted">Tap a phrase to hear it.</p>`}
    ${[...groups].map(([g, list]) => html`${g && g !== 'Basic kanji' ? html`<h2 class="sub-title">${g}</h2>` : ''}
      ${kind === 'phrase'
        ? html`<div class="word-list">${list.map((p) => html`<button class="word-row phrase-row" data-say="${phraseSpeech(p)}">
            <span class="phrase-main"><span class="jp word-jp">${p.jp}</span><small>${p.romaji}</small></span>
            <span class="word-en">${emojiFor(p.icon)} ${p.en}</span></button>`)}</div>`
        : html`<div class="tidbit-list">${list.map((x) => html`<section class="card tidbit tidbit-${kind}">${tidbitBody(kind, x)}</section>`)}</div>`}`)}
  </main>`);
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
}

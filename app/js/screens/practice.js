// Practice hub: personalised review session, collections, kana charts, kanji and words learned.
import { ITEMS } from '../course.js';
import { HIRAGANA_ROWS, KATAKANA_ROWS, kanaId } from '../content/kana.js';
import { app, statsBar, modal } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { art } from '../art.js';
import { speak } from '../audio.js';
import { strength } from '../srs.js';
import { learnedItemIds, dueItemIds, mistakeIds, backupStale } from '../progress.js';
import { KINDS, emojiFor, phraseSpeech, tidbitCard } from '../tidbits.js';
import { wireShare } from '../share.js';
import { QUIZ_MIN_FACTS, seenFacts } from './factquiz.js';
import { signScenes, SIGNS_MIN } from './signs.js';
import { missionCards } from './mission.js';
import { drillCards } from './drill.js';
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
// Practice is split in three: Today (reviews), Games (missions, signs, drills, quiz) and Library
// (collections and everything learned).
let lastSection = 'today';
const SECTIONS = [['today', 'Today', '🔁'], ['games', 'Games', '🎮'], ['library', 'Library', '📚']];

const LEVEL_NAME = { strong: 'Strong', mid: 'Okay', weak: 'Fading', none: 'Not learned' };
const DAY = 24 * 60 * 60 * 1000;

// What a progress bar means, for this word: how it is measured and where this one stands.
function explainMeter(item, state, now) {
  const rec = state.items[item.id] || {};
  const st = strength(rec, now);
  const answers = (rec.right || 0) + (rec.wrong || 0);
  const days = Math.round(((rec.due || now) - now) / DAY);
  const next = !rec.seen ? 'after your first answer' : days <= 0 ? (now - rec.due > DAY ? 'overdue — practise it soon' : 'today') : days === 1 ? 'tomorrow' : `in ${days} days`;
  modal(html`<div class="meter-help">
    <p class="meter-word"><span class="jp">${item.jp}</span> · ${item.en}</p>
    <span class="meter meter-lg s-${level(st)}"><i style="width:${Math.round(st * 100)}%"></i></span>
    <p><b>${LEVEL_NAME[level(st)]}</b> — ${Math.round(st * 100)}% known</p>
    <ul>
      <li>Right <b>${rec.right || 0}</b> of <b>${answers}</b> times</li>
      <li>Next review: <b>${next}</b></li>
    </ul>
    <p class="muted small">The bar shows how well you know it: mostly how often you answer it right, plus how well it has stuck between reviews (full once you remember it after a few days). Reviews then space out — 1 day, 3 days, a week, 2 weeks, 5 weeks — and the bar fades if one is overdue. <b>Green</b> strong · <b>yellow</b> okay · <b>orange</b> fading.</p>
  </div>`, [{ label: 'Got it', kind: 'secondary' }]);
}

// Travel situations answered with real-looking signs, from the first kanji learned.
function signsCard(state) {
  const n = signScenes(state).length;
  if (!Object.keys(state.items).some((id) => id.startsWith('kj-'))) return '';
  return html`<a class="card kanji-practice" href="${n >= SIGNS_MIN ? '#/signs' : '#/practice'}"><span class="kanji-chip">${art('🪧', 'art-row')}</span>
    <div><b>Sign spotter</b><small>${n >= SIGNS_MIN ? 'Exits, toilets, station signs — tap the right one · +1 gem each' : 'Learn a few more travel kanji (exits, toilets…) to unlock'}</small></div>
    <span class="btn btn-secondary" ${n >= SIGNS_MIN ? '' : 'aria-disabled="true"'}>${n >= SIGNS_MIN ? 'Play' : '🔒'}</span></a>`;
}

// Words got wrong lately, until answered right again; fixing them all earns 5 gems.
function mistakesCard(state) {
  const ids = mistakeIds(state);
  if (!ids.length) return Object.values(state.items).some((r) => r.wrong)
    ? html`<section class="card kanji-practice mistakes-card done"><span class="kanji-chip">${art('✨', 'art-row')}</span><div><b>No mistakes to fix</b><small>Everything you got wrong has been put right</small></div></section>`
    : '';
  const preview = ids.slice(0, 3).map((id) => ITEMS.get(id).en).join(' · ');
  return html`<section class="card kanji-practice mistakes-card"><span class="kanji-chip">${art('🎯', 'art-row')}</span>
    <div><b>Fix your mistakes (${ids.length})</b><small>${preview}${ids.length > 3 ? ' …' : ''}</small><small>Fix them all: +5 gems</small></div>
    <button class="btn btn-secondary start-mistakes">Start</button></section>`;
}

export function renderPractice(root, focus) {
  const { state } = app;
  const now = app.now();
  const learned = learnedItemIds(state);
  const due = dueItemIds(state, now);
  const tab = ['words', 'kanji', 'kana'].includes(focus) ? focus : lastTab;
  lastTab = tab;
  const section = SECTIONS.some(([id]) => id === focus) ? focus : ['words', 'kanji', 'kana'].includes(focus) ? 'library' : lastSection;
  lastSection = section;
  const words = learned.map((id) => ITEMS.get(id)).filter((i) => i.type === 'word' || i.type === 'sentence')
    .map((it) => ({ it, st: strength(state.items[it.id], now) })).sort((x, y) => x.st - y.st);
  const kanji = uniqueKanji(learned.map((id) => ITEMS.get(id)).filter((i) => ['kanji', 'radical', 'kword'].includes(i.type)), state, now);
  // The bar sits in a bigger tap area that explains it.
  const meter = (st, id) => html`<span class="meter-hit" data-meter="${id}" role="button" aria-label="What this bar means"><span class="meter s-${level(st)}"><i style="width:${Math.round(st * 100)}%"></i></span></span>`;
  const reading = (k) => (k.type === 'kword' ? `${k.kana} · ${k.romaji}` : [k.kun, k.on].filter(Boolean)[0] || '');

  const lists = {
    words: () => (words.length ? html`<div class="word-list">${words.map(({ it: w, st }) => html`<button class="word-row" data-say="${speechOf(w)}">
        ${w.art ? art(w.art, 'art-row') : html`<span class="art-row"></span>`}
        <span class="word-main"><span class="word-jp">${jpItem(w, false)}</span><small>${w.romaji} · ${w.en}</small></span>
        ${meter(st, w.id)}</button>`)}</div>`
      : html`<p class="muted">Words you learn will be listed here, weakest first.</p>`),
    kanji: () => (kanji.length ? html`<section class="card kanji-practice">
        <span class="kanji-chip jp">漢</span>
        <div><b>Kanji practice</b><small>${kanji.length >= 3 ? 'Only kanji, weakest first — about 2 min' : 'Learn 3 kanji to unlock'}</small></div>
        <button class="btn btn-secondary start-kanji" ${kanji.length >= 3 ? '' : 'disabled'}>Start</button>
      </section>
      <div class="word-list">${kanji.map(({ it: k, st }) => html`<button class="word-row" data-say="${speechOf(k)}">
        <span class="kanji-chip jp ${[...k.jp].length > 1 ? 'wide' : ''} ${[...k.jp].length > 2 ? 'xwide' : ''}">${k.jp}</span>
        <span class="word-main"><b>${k.en}</b><small>${reading(k)}</small></span>
        ${meter(st, k.id)}</button>`)}</div>`
      : html`<p class="muted">Kanji lessons appear along the path from the first unit.</p>`),
    kana: () => html`${kanaCard('hiragana', 'あ', 'Hiragana practice')}${kanaCard('katakana', 'ア', 'Katakana practice')}<p class="muted legend"><i class="dot strong"></i>Strong <i class="dot mid"></i>Okay <i class="dot weak"></i>Fading <i class="dot none"></i>Not learned</p>
      <h3 class="sub-title small-title">Hiragana</h3>${chart(HIRAGANA_ROWS, state, now)}
      ${kanaCount('katakana') ? html`<h3 class="sub-title small-title">Katakana</h3>${chart(KATAKANA_ROWS, state, now)}` : ''}`,
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
    <div class="seg practice-sections" role="tablist">${SECTIONS.map(([id, label, emo]) => html`<button role="tab" class="${id === section ? 'on' : ''}" data-section="${id}">${emo} ${label}</button>`)}</div>

    ${section === 'today' ? html`<section class="card practice-hero">
      ${mascot(due.length ? 'happy' : 'cheer', 84)}
      <div>
        <h2>${learned.length ? (due.length ? `${due.length} to review` : 'All fresh!') : 'Nothing to review yet'}</h2>
        <p class="muted">${learned.length
          ? 'A quick mix of what you are close to forgetting. No hearts lost, and you earn one back.'
          : 'Finish your first lesson and your reviews will show up here.'}</p>
        <button class="btn btn-secondary start-practice" ${learned.length ? '' : 'disabled'}>${icon('refresh', 18)} Start practice</button>
      </div>
    </section>
    ${mistakesCard(state)}
    ${backupStale(state, now) ? html`<a class="card kanji-practice backup-nudge" href="#/profile/backup"><span class="kanji-chip">${art('💾', 'art-row')}</span>
      <div><b>Back up your progress</b><small>${state.backupAt ? 'Your last backup is over 2 weeks old' : 'Keep it safe in Google Drive — takes 10 seconds'}</small></div><span class="btn btn-secondary">Back up</span></a>` : ''}
    ${words.length >= 3 ? html`<a class="card kanji-practice listen-entry" href="#/listen"><span class="kanji-chip">${art('🎧', 'art-row')}</span>
      <div><b>Listening mode</b><small>Hands-free for walks: hear it, say it, repeat</small></div><span class="btn btn-secondary">Play</span></a>` : ''}
    ${kanji.length >= 3 ? html`<a class="card kanji-practice" href="#/practice/kanji-go"><span class="kanji-chip jp">漢</span>
      <div><b>Kanji practice</b><small>Only kanji, weakest first — about 2 min</small></div><span class="btn btn-secondary">Start</span></a>` : ''}
    <p class="muted small section-more">More to play in <button class="link" data-section="games">🎮 Games</button></p>` : ''}

    ${section === 'games' ? html`<h2 class="sub-title">Missions</h2>
    <p class="muted small list-help">Real situations in Japan — one after each unit.</p>
    ${missionCards(state)}
    <h2 class="sub-title">Quick games</h2>
    ${signsCard(state)}
    ${seenFacts(state).length >= QUIZ_MIN_FACTS ? html`<a class="card kanji-practice" href="#/quiz"><span class="kanji-chip">${art('❓', 'art-row')}</span>
      <div><b>Fun facts quiz</b><small>5 questions about facts you've read · +1 gem each</small></div><span class="btn btn-secondary">Play</span></a>` : ''}
    <h2 class="sub-title">Pattern drills</h2>
    <p class="muted small list-help">One sentence, many words: swap words in until it's automatic.</p>
    ${drillCards(state)}` : ''}

    ${section === 'library' ? html`<div class="collections">
      <a class="card collection" href="#/collection/phrase">${art('💬', 'art-col')}<b>Phrasebook</b><small>${KINDS.phrase.list.length} phrases</small></a>
      <a class="card collection" href="#/collection/fact">${art('🗾', 'art-col')}<b>Fun facts</b><small>${state.seen.fact.length} / ${KINDS.fact.list.length}</small></a>
      <a class="card collection" href="#/collection/kanji"><span class="col-emoji jp">漢</span><b>Kanji spotted</b><small>${state.seen.kanji.length} / ${KINDS.kanji.list.length}</small></a>
    </div>

    <h2 class="sub-title" id="sec-learned">What you've learned</h2>
    <div class="seg practice-tabs" role="tablist">${TABS.map(([id, label, n]) => html`<button role="tab" class="${id === tab ? 'on' : ''}" data-tab="${id}">${label}${n != null ? html` <small>${n}</small>` : ''}</button>`)}</div>
    ${tab !== 'kana' ? html`<p class="muted small list-help">Weakest first. Tap a bar to see what it means.</p>` : ''}
    <div class="practice-list">${lists[tab]()}</div>` : ''}
  </main>`);

  $('.start-practice', root)?.addEventListener('click', () => app.go('#/practice/go'));
  $$('[data-section]', root).forEach((b) => b.addEventListener('click', () => {
    lastSection = b.dataset.section;
    renderPractice(root, b.dataset.section);
    window.scrollTo(0, 0);
  }));
  $('.start-mistakes', root)?.addEventListener('click', () => app.go('#/practice/mistakes-go'));
  $('.start-kanji', root)?.addEventListener('click', () => app.go('#/practice/kanji-go'));
  $$('.start-kana', root).forEach((b) => b.addEventListener('click', () => app.go(`#/practice/${b.dataset.script}-go`)));
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  $$('[data-meter]', root).forEach((m) => m.addEventListener('click', (e) => {
    e.stopPropagation();
    explainMeter(ITEMS.get(m.dataset.meter), state, now);
  }));
  $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => {
    lastTab = b.dataset.tab;
    renderPractice(root, b.dataset.tab);
    $('#sec-learned', root)?.scrollIntoView({ block: 'start' });
  }));
  if (['words', 'kanji', 'kana'].includes(focus)) requestAnimationFrame(() => $('#sec-learned', root)?.scrollIntoView({ block: 'start' }));
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
    ${kind === 'fact' ? (items.length >= QUIZ_MIN_FACTS
      ? html`<a class="card kanji-practice" href="#/quiz"><span class="kanji-chip">${art('❓', 'art-row')}</span><div><b>Quiz me</b><small>5 questions about facts you have read · +1 gem each</small></div><span class="btn btn-secondary">Start</span></a>`
      : html`<p class="muted small">Discover ${QUIZ_MIN_FACTS} facts to unlock the quiz.</p>`) : ''}
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

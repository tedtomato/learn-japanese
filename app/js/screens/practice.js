// Practice hub: personalised review session, collections, kana charts, kanji and words learned.
import { L } from '../lang.js';
import { ITEMS } from '../course.js';
import { kanaId } from '../content/kana.js';
import { HIRAGANA_ROWS, KATAKANA_ROWS, MISSIONS, PATTERNS } from '../content/pack.js';
import { app, statsBar, modal } from '../app.js';
import { html, mount, raw, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { art } from '../art.js';
import { speak } from '../audio.js';
import { strength } from '../srs.js';
import { learnedItemIds, dueItemIds, mistakeIds, backupStale } from '../progress.js';
import { KINDS, phraseSpeech, tidbitCard } from '../tidbits.js';
import { wireShare } from '../share.js';
import { QUIZ_MIN_FACTS, seenFacts } from './factquiz.js';
import { signScenes, SIGNS_MIN } from './signs.js';
import { missionCards } from './mission.js';
import { toneChart } from './tones.js';
import { drillCards } from './drill.js';
import { jpItem, speechOf } from '../lesson/text.js';
import { t, countryIn } from '../strings.js';

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
// A word's picture, for phrasebook rows whose phrase is also a taught word.
let artByText = null;
const phraseArt = (p) => {
  artByText ||= new Map([...ITEMS.values()].filter((i) => i.art && i.jp).map((i) => [i.jp, i.art]));
  return artByText.get(p.jp.replace(/[～~]/g, '')) || '';
};

const LEVEL_NAME = { strong: 'Strong', mid: 'Okay', weak: 'Fading', none: 'Not learned' };
const DAY = 24 * 60 * 60 * 1000;

// What a progress bar means, for this word: how it is measured and where this one stands.
function explainMeter(item, state, now) {
  const rec = state.items[item.id] || {};
  const st = strength(rec, now);
  const answers = (rec.right || 0) + (rec.wrong || 0);
  const days = Math.round(((rec.due || now) - now) / DAY);
  const next = !rec.seen ? t('after your first answer') : days <= 0 ? (now - rec.due > DAY ? t('overdue — practise it soon') : t('today')) : days === 1 ? t('tomorrow') : t('in {n} days', { n: days });
  modal(html`<div class="meter-help">
    <p class="meter-word"><span class="jp">${item.jp}</span> · ${item.en}</p>
    <span class="meter meter-lg s-${level(st)}"><i style="width:${Math.round(st * 100)}%"></i></span>
    <p><b>${t(LEVEL_NAME[level(st)])}</b> — ${t('{n}% known', { n: Math.round(st * 100) })}</p>
    <ul>
      <li>${t('Right {a} of {b} times', { a: rec.right || 0, b: answers })}</li>
      <li>${t('Next review:')} <b>${next}</b></li>
    </ul>
    <p class="muted small">${t('The bar shows how well you know it: mostly how often you answer it right, plus how well it has stuck between reviews (full once you remember it after a few days). Reviews then space out — 1 day, 3 days, a week, 2 weeks, 5 weeks — and the bar fades if one is overdue. Green strong · yellow okay · orange fading.')}</p>
  </div>`, [{ label: t('Got it'), kind: 'secondary' }]);
}

// Travel situations answered with real-looking signs, from the first kanji learned.
function signsCard(state) {
  const n = signScenes(state).length;
  if (!Object.keys(state.items).some((id) => id.startsWith('kj-'))) return '';
  return html`<a class="card kanji-practice" href="${n >= SIGNS_MIN ? '#/signs' : '#/practice'}"><span class="kanji-chip">${art('🪧', 'art-row')}</span>
    <div><b>${t('Sign spotter')}</b><small>${n >= SIGNS_MIN ? t('Exits, toilets, station signs — tap the right one · +1 gem each') : t('Learn a few more travel {what} (exits, toilets…) to unlock', { what: L.chars })}</small></div>
    <span class="btn btn-secondary" ${n >= SIGNS_MIN ? '' : 'aria-disabled="true"'}>${n >= SIGNS_MIN ? t('Play') : '🔒'}</span></a>`;
}

// Words got wrong lately, until answered right again; fixing them all earns 5 gems.
function mistakesCard(state) {
  const ids = mistakeIds(state);
  if (!ids.length) return Object.values(state.items).some((r) => r.wrong)
    ? html`<section class="card kanji-practice mistakes-card done"><span class="kanji-chip">${art('✨', 'art-row')}</span><div><b>${t('No mistakes to fix')}</b><small>${t('Everything you got wrong has been put right')}</small></div></section>`
    : '';
  const preview = ids.slice(0, 3).map((id) => ITEMS.get(id).en).join(' · ');
  return html`<section class="card kanji-practice mistakes-card"><span class="kanji-chip">${art('🎯', 'art-row')}</span>
    <div><b class="title-count">${t('Fix your mistakes')} <span class="pill pill-orange">${ids.length}</span></b><small>${preview}${ids.length > 3 ? ' …' : ''}</small><small>${t('Fix them all: +5 gems')}</small></div>
    <button class="btn btn-secondary start-mistakes">${t('Start')}</button></section>`;
}

export function renderPractice(root, focus) {
  const { state } = app;
  const now = app.now();
  const learned = learnedItemIds(state);
  const due = dueItemIds(state, now);
  let tab = ['words', 'kanji', 'kana', 'tones'].includes(focus) ? focus : lastTab;
  lastTab = tab;
  const section = SECTIONS.some(([id]) => id === focus) ? focus : ['words', 'kanji', 'kana', 'tones'].includes(focus) ? 'library' : lastSection;
  lastSection = section;
  const words = learned.map((id) => ITEMS.get(id)).filter((i) => i.type === 'word' || i.type === 'sentence')
    .map((it) => ({ it, st: strength(state.items[it.id], now) })).sort((x, y) => x.st - y.st);
  const kanji = uniqueKanji(learned.map((id) => ITEMS.get(id)).filter((i) => ['kanji', 'radical', 'kword'].includes(i.type)), state, now);
  // The bar sits in a bigger tap area that explains it.
  const meter = (st, id) => html`<span class="meter-hit" data-meter="${id}" role="button" aria-label="${t('What this bar means')}"><span class="meter s-${level(st)}"><i style="width:${Math.round(st * 100)}%"></i></span></span>`;
  const reading = (k) => (k.type === 'kword' ? `${k.kana} · ${k.romaji}` : [k.kun, k.on].filter(Boolean)[0] || '');

  const lists = {
    words: () => (words.length ? html`<div class="word-list">${words.map(({ it: w, st }) => html`<button class="word-row" data-say="${speechOf(w)}">
        ${w.art ? art(w.art, 'art-row') : html`<span class="art-row"></span>`}
        <span class="word-main"><span class="word-jp">${jpItem(w, false)}</span><small>${L.latin ? w.en : `${w.romaji} · ${w.en}`}</small></span>
        ${meter(st, w.id)}</button>`)}</div>`
      : html`<p class="muted">${t('Words you learn will be listed here, weakest first.')}</p>`),
    kanji: () => (kanji.length ? html`<section class="card kanji-practice">
        <span class="kanji-chip jp">${L.glyph}</span>
        <div><b>${t('Kanji practice')}</b><small>${kanji.length >= 3 ? t('Only kanji, weakest first — about 2 min') : t('Learn 3 kanji to unlock')}</small></div>
        <button class="btn btn-secondary start-kanji" ${kanji.length >= 3 ? '' : 'disabled'}>${t('Start')}</button>
      </section>
      <div class="word-list">${kanji.map(({ it: k, st }) => html`<button class="word-row" data-say="${speechOf(k)}">
        <span class="kanji-chip jp ${[...k.jp].length > 1 ? 'wide' : ''} ${[...k.jp].length > 2 ? 'xwide' : ''}">${k.jp}</span>
        <span class="word-main"><b>${k.en}</b><small>${reading(k)}</small></span>
        ${meter(st, k.id)}</button>`)}</div>`
      : html`<p class="muted">${t('{what} lessons appear along the path from the first unit.', { what: L.Chars === 'Kanji' ? 'Kanji' : t('Character') })}</p>`),
    tones: () => html`${toneCard()}${toneChart()}`,
    kana: () => html`${kanaCard('hiragana', 'あ', t('Hiragana practice'))}${kanaCard('katakana', 'ア', t('Katakana practice'))}<p class="muted legend"><i class="dot strong"></i>${t('Strong')} <i class="dot mid"></i>${t('Okay')} <i class="dot weak"></i>${t('Fading')} <i class="dot none"></i>${t('Not learned')}</p>
      <h3 class="sub-title small-title">Hiragana</h3>${chart(HIRAGANA_ROWS, state, now)}
      ${kanaCount('katakana') ? html`<h3 class="sub-title small-title">Katakana</h3>${chart(KATAKANA_ROWS, state, now)}` : ''}`,
  };
  // Drill cards for each script: gentle questions on the 8 weakest characters (from 3 learned).
  const kanaCount = (script) => learned.filter((id) => ITEMS.get(id).type === 'kana' && ITEMS.get(id).script === script).length;
  const kanaCard = (script, ch, title) => {
    const n = kanaCount(script);
    if (!n) return '';
    return html`<section class="card kanji-practice"><span class="kanji-chip jp">${ch}</span>
      <div><b>${title}</b><small>${n >= 3 ? t('Your weakest characters, with hints — no rush') : t('Learn 3 characters to unlock')}</small></div>
      <button class="btn btn-secondary start-kana" data-script="${script}" ${n >= 3 ? '' : 'disabled'}>${t('Start')}</button></section>`;
  };
  // Chinese: the tone trainer, from the first words learned.
  const toneCard = () => html`<a class="card kanji-practice" href="#/tones"><span class="kanji-chip">${raw('<svg width="28" height="26" viewBox="0 0 52 48"><path d="M6 24 Q20 46 30 42 T46 14" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>')}</span>
    <div><b>${t('Tone trainer')}</b><small>${t('Hear a syllable, pick its tone · +1 gem each')}</small></div><span class="btn btn-secondary">${t('Play')}</span></a>`;
  // Latin-alphabet courses only have words to list.
  const TABS = L.latin ? [['words', t('Words'), words.length]]
    : [['words', t('Words'), words.length], ['kanji', L.Chars, kanji.length], ...(L.hasKana ? [['kana', 'Kana', null]] : [['tones', t('Tones'), null]])];
  // Quick games: shown only when there is at least one to show (fr / es / en have none until a quiz unlocks).
  const quickGames = [signsCard(state), seenFacts(state).length >= QUIZ_MIN_FACTS ? html`<a class="card kanji-practice" href="#/quiz"><span class="kanji-chip">${art('❓', 'art-row')}</span>
      <div><b>${t('Fun facts quiz')}</b><small>${t('5 questions about facts you\'ve read · +1 gem each')}</small></div><span class="btn btn-secondary">${t('Play')}</span></a>` : ''].filter(Boolean);
  if (!TABS.some(([id]) => id === tab)) tab = 'words';

  mount(root, html`<header class="topbar">${statsBar()}</header>
  <main class="page">
    <h1 class="page-title">${t('Practice')}</h1>
    <div class="seg practice-sections" role="tablist">${SECTIONS.map(([id, label, emo]) => html`<button role="tab" aria-selected="${id === section}" class="${id === section ? 'on' : ''}" data-section="${id}">${emo} ${t(label)}</button>`)}</div>

    ${section === 'today' ? html`<section class="card practice-hero">
      ${mascot(due.length ? 'happy' : 'cheer', 84)}
      <div>
        <h2>${learned.length ? (due.length ? t('{n} to review', { n: due.length }) : t('All fresh!')) : t('Nothing to review yet')}</h2>
        <p class="muted">${learned.length
          ? t('A quick mix of what you are close to forgetting. No hearts lost, and you earn one back.')
          : t('Finish your first lesson and your reviews will show up here.')}</p>
        <button class="btn btn-secondary start-practice" ${learned.length ? '' : 'disabled'}>${icon('refresh', 18)} ${t('Start practice')}</button>
      </div>
    </section>
    ${mistakesCard(state)}
    ${backupStale(state, now) ? html`<a class="card kanji-practice backup-nudge" href="#/profile/backup"><span class="kanji-chip">${art('☁️', 'art-row')}</span>
      <div><b>${t('Back up your progress')}</b><small>${state.backupAt ? t('Your last backup is over 2 weeks old') : t('Keep it safe in Google Drive — takes 10 seconds')}</small></div><span class="btn btn-secondary">${t('Back up')}</span></a>` : ''}
    ${words.length >= 3 ? html`<a class="card kanji-practice listen-entry" href="#/listen"><span class="kanji-chip">${art('🎧', 'art-row')}</span>
      <div><b>${t('Listening mode')}</b><small>${t('Hands-free for walks: hear it, say it, repeat')}</small></div><span class="btn btn-secondary">${t('Play')}</span></a>` : ''}
    ${L.code === 'zh' ? toneCard() : ''}
    ${kanji.length >= 3 ? html`<a class="card kanji-practice" href="#/practice/kanji-go"><span class="kanji-chip jp">${L.glyph}</span>
      <div><b>${t('{what} practice', { what: L.Chars === 'Kanji' ? 'Kanji' : t('Character') })}</b><small>${t('Only {what}, weakest first — about 2 min', { what: L.chars })}</small></div><span class="btn btn-secondary">${t('Start')}</span></a>` : ''}
    <p class="muted small section-more">${t('More to play in')} <button class="link" data-section="games">🎮 ${t('Games')}</button></p>` : ''}

    ${section === 'games' ? html`${MISSIONS.length ? html`<h2 class="sub-title">${t('Missions')}</h2>
    <p class="muted small list-help">${t('Real situations {where} — one after each unit.', { where: countryIn() })}</p>
    ${missionCards(state)}` : ''}
    ${quickGames.length ? html`<h2 class="sub-title">${t('Quick games')}</h2>${quickGames}` : ''}
    ${PATTERNS.length ? html`<h2 class="sub-title">${t('Pattern drills')}</h2>
    <p class="muted small list-help">${t('One sentence, many words: swap words in until it\'s automatic.')}</p>
    ${drillCards(state)}` : ''}` : ''}

    ${section === 'library' ? html`<div class="collections ${KINDS.kanji.list.length ? '' : 'two'}">
      <a class="card collection" href="#/collection/phrase">${art('💬', 'art-col')}<b>${t('Phrasebook')}</b><small>${t('{n} phrases', { n: KINDS.phrase.list.length })}</small></a>
      <a class="card collection" href="#/collection/fact">${art(L.flagEmoji || '🗾', 'art-col')}<b>${t('Fun facts')}</b><small>${state.seen.fact.length} / ${KINDS.fact.list.length}</small></a>
      ${KINDS.kanji.list.length ? html`<a class="card collection" href="#/collection/kanji"><span class="col-emoji jp">${L.glyph}</span><b>${t('{what} spotted', { what: L.Chars })}</b><small>${state.seen.kanji.length} / ${KINDS.kanji.list.length}</small></a>` : ''}
    </div>

    <h2 class="sub-title" id="sec-learned">${t('What you\'ve learned')}</h2>
    ${TABS.length > 1 ? html`<div class="seg practice-tabs" role="tablist">${TABS.map(([id, label, n]) => html`<button role="tab" aria-selected="${id === tab}" class="${id === tab ? 'on' : ''}" data-tab="${id}">${label}${n != null ? html` <small>${n}</small>` : ''}</button>`)}</div>`
      : html`<h3 class="sub-title small-title">${TABS[0][1]} <small class="muted">${TABS[0][2]}</small></h3>`}
    ${tab !== 'kana' ? html`<p class="muted small list-help">${t('Weakest first. Tap a bar to see what it means.')}</p>` : ''}
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
  if (['words', 'kanji', 'kana', 'tones'].includes(focus)) requestAnimationFrame(() => $('#sec-learned', root)?.scrollIntoView({ block: 'start' }));
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

  mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/practice" aria-label="${t('Back')}">${icon('close', 24)}</a><h1>${t(info.collection)}</h1></header>
  <main class="page">
    ${kind === 'fact' ? (items.length >= QUIZ_MIN_FACTS
      ? html`<a class="card kanji-practice" href="#/quiz"><span class="kanji-chip">${art('❓', 'art-row')}</span><div><b>${t('Quiz me')}</b><small>${t('5 questions about facts you have read · +1 gem each')}</small></div><span class="btn btn-secondary">${t('Start')}</span></a>`
      : html`<p class="muted small">${t('Discover {n} facts to unlock the quiz.', { n: QUIZ_MIN_FACTS })}</p>`) : ''}
    ${kind !== 'phrase' ? html`<p class="muted">${items.length ? t('{a} of {b} found.', { a: items.length, b: info.list.length }) : t('Nothing found yet.')} ${locked ? t('Keep doing lessons to discover more — they pop up on your path and during lessons.') : t('You found them all!')}${kind === 'kanji' ? ` ${t('Spotted kanji also come back in practice, with their tip as a clue.')}` : ''}</p>` : html`<p class="muted">${t('Tap a phrase to hear it.')}</p>`}
    ${[...groups].map(([g, list]) => html`${g && g !== 'Basic kanji' ? html`<h2 class="sub-title">${g}</h2>` : ''}
      ${kind === 'phrase'
        ? html`<div class="word-list">${list.map((p) => html`<button class="word-row phrase-row" data-say="${phraseSpeech(p)}">
            ${phraseArt(p) ? art(phraseArt(p), 'art-row') : ''}
            <span class="phrase-main"><span class="jp word-jp">${p.jp}</span><small>${p.romaji ? `${p.romaji} · ${p.en}` : `${p.say} · ${p.en}`}</small></span></button>`)}</div>`
        : html`<div class="tidbit-list">${list.map((x) => tidbitCard(kind, x))}</div>`}`)}
  </main>`);
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  wireShare(root);
}

// Fun facts, travel phrases and kanji shown now and then. Seen ones are collected in the Practice tab.
import { L, LANG } from './lang.js';
import { FACTS, PHRASES, PEEK_KANJI as KANJI, PRONUNCIATION } from './content/pack.js';
import { html } from './dom.js';
import { icon } from './icons.js';
import { art } from './art.js';
import { shareButton, tidbitShareText } from './share.js';
import { t } from './strings.js';

export const KINDS = {
  fact: { list: FACTS, title: 'Did you know?', collection: 'Fun facts' },
  phrase: { list: PHRASES, title: 'Useful phrase', collection: 'Phrasebook' },
  kanji: { list: KANJI, title: 'Kanji peek', collection: 'Kanji spotted' },
  pron: { list: PRONUNCIATION, title: 'Pronunciation tip', collection: 'Pronunciation' },
};
// Kinds shown in the short breaks of a lesson.
export const BREAK_KINDS = ['fact', 'kanji', 'pron'];

const EMOJI = {
  bed: '🛏️', train: '🚆', fruit: '🍉', vending: '🥤', bin: '🗑️', heart: '❤️', music: '🎵', onsen: '♨️', food: '🍱',
  toilet: '🚽', camera: '📸', umbrella: '☂️', rabbit: '🐇', fox: '🦊', cat: '🐈', deer: '🦌', monkey: '🐒', sun: '☀️',
  leaf: '🍃', wave: '🌊', calendar: '📅', volcano: '🌋', bridge: '🌉', tower: '🗼', bullet: '🚄', snowflake: '❄️',
  mail: '📮', bike: '🚲', shop: '🏪', drink: '🍶', tea: '🍵', sushi: '🍣', fish: '🐟', sweets: '🍡', onigiri: '🍙',
  ramen: '🍜', city: '🏙️', dog: '🐕', house: '🏠', police: '👮', castle: '🏯', torii: '⛩️', lantern: '🏮', sakura: '🌸',
  tree: '🌳', sumo: '🤼', martial: '🥋', sword: '⚔️', kimono: '👘', vase: '🏺', crane: '🕊️', book: '📚', mask: '🎭',
  game: '🎮', bear: '🐻', robot: '🤖', quake: '🌏', person: '🧓', briefcase: '💼', bowing: '🙇', speech: '💬',
  school: '🏫', pearl: '🦪', rocks: '🪨', taxi: '🚕', ticket: '🎫', coin: '💴', mountain: '🗻', bow: '🏹',
  globe: '🌐', bus: '🚌', plane: '✈️', siren: '🚨', medical: '🏥', hotel: '🏨', bank: '🏦',
  wine: '🍷', cheese: '🧀', bread: '🍞', football: '⚽', beer: '🍺', coffee: '☕', star: '⭐', sea: '🌊', flower: '💐',
  flag: L.flagEmoji || '🎌',
};
export const EMOJI_NAMES = Object.keys(EMOJI);
export const emojiFor = (name) => EMOJI[name] || L.flagEmoji || '🎌';
export const EMOJI_USED = [...Object.values(EMOJI), '🎌', '🇫🇷', '🇪🇸', '🇬🇧'];

// Text to speak for a phrase (drops the "～" placeholder).
export const phraseSpeech = (p) => p.jp.replace(/[～~]/g, '');

const KIND_WEIGHTS = [['fact', 0.5], ['phrase', 0.35], ['kanji', 0.15], ['pron', 0.15]];
// Kinds with nothing to show (no kanji peeks in Latin-alphabet courses) are never picked.
export const tidbitKinds = (kinds) => kinds.filter((k) => KINDS[k].list.length);

// Picks something the learner has not seen yet (or anything, once all are seen) and marks it seen.
// theme: { facts: [categories], phrases: [categories] } keeps breaks on the current unit's topic.
export function nextTidbit(state, rng = Math.random, kinds = ['fact', 'phrase', 'kanji', 'pron'], theme = {}) {
  const weights = KIND_WEIGHTS.filter(([k]) => tidbitKinds(kinds).includes(k));
  const total = weights.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  const kind = (weights.find(([, w]) => (r -= w) < 0) || weights[0])[0];
  state.seen[kind] ||= [];
  const seen = new Set(state.seen[kind]);
  const all = KINDS[kind].list;
  const cats = kind === 'fact' ? theme.facts : kind === 'phrase' ? theme.phrases : null;
  const themed = cats?.length ? all.filter((x) => cats.includes(x.category)) : [];
  const list = themed.length ? themed : all;
  const fresh = list.filter((x) => !seen.has(x.id));
  const pool = fresh.length ? fresh : list;
  const item = pool[Math.floor(rng() * pool.length)];
  if (!seen.has(item.id)) state.seen[kind] = [...state.seen[kind], item.id];
  // A spotted kanji joins practice, where it comes back as a question with its tip as a clue.
  if (kind === 'kanji' && !state.items[`xk-${item.id}`]) state.items[`xk-${item.id}`] = { box: 0, seen: 0, right: 0, wrong: 0, last: 0, due: 0 };
  return { kind, item };
}

// What to speak for a pronunciation tip: the example words in the course's own script (without the
// romaji or glosses written after them); `say` is only a respelling for the eye.
export function pronSpeech(item) {
  const plain = item.example.replace(/\([^)]*\)/g, ' ');
  if (L.latin) return plain.replace(/\s+/g, ' ').trim();
  const words = plain.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]+/gu);
  return words ? words.join('、') : item.say;
}

const pronShareText = (item) => `${L.flagEmoji || '🌍'} ${L.name} pronunciation: ${item.title}. ${item.text}\n— I'm learning ${L.name} with Hajime`;

export function tidbitBody(kind, item) {
  if (kind === 'pron') {
    return html`<div class="tidbit-head"><span class="tidbit-emoji">${art(emojiFor(item.icon))}</span><b>${item.title}</b></div>
      <p class="tidbit-text">${item.text}</p>
      <div class="tidbit-phrase">
        <button class="say-inline" data-say="${pronSpeech(item)}" aria-label="${t('Play sound')}">${icon('speaker', 22)}</button>
        <div><div class="jp jp-lg">${item.example}</div>${item.say ? html`<div class="tidbit-romaji muted">${t('Sounds like:')} ${item.say}</div>` : ''}</div></div>`;
  }
  if (kind === 'fact') {
    return html`<div class="tidbit-head"><span class="tidbit-emoji">${art(emojiFor(item.icon))}</span><b>${item.title}</b></div>
      <p class="tidbit-text">${item.text}</p><small class="muted">${item.category}</small>`;
  }
  if (kind === 'phrase') {
    return html`<div class="tidbit-phrase">
      <button class="say-inline" data-say="${phraseSpeech(item)}" aria-label="${t('Play sound')}">${icon('speaker', 22)}</button>
      <div><div class="jp jp-lg">${item.jp}</div><div class="tidbit-romaji">${item.romaji ? html`${item.romaji} <span class="muted">(${item.say})</span>` : html`<span class="muted">${t('Sounds like:')} ${item.say}</span>`}</div>
      <div class="tidbit-en">${art(emojiFor(item.icon), 'art-inline')} ${item.en}</div></div></div>`;
  }
  return html`<div class="tidbit-kanji">
    <button class="kanji-big jp" data-say="${item.kun ? item.kun.split(' ')[0].replace(/[()]/g, '') : item.k}" aria-label="Play">${item.k}</button>
    <div><b>${item.en}</b>${readings(item.on, item.kun)}
    <div class="small">${t('Example word:')} <span class="jp">${item.ex}</span></div>
    ${item.tip ? html`<div class="small muted">💡 ${item.tip}</div>` : ''}</div></div>`;
}

// A kanji's two kinds of reading (Japanese), in plain words: its native word when it stands alone (kun)
// and the sound it borrows from Chinese inside longer words (on).
export function readings(on, kun) {
  if (!on && !kun) return '';
  // A Chinese character has one reading (its pinyin).
  if (LANG === 'zh') return html`<div class="readings"><div><span class="rd-label">${t('Say')}</span> ${on || kun}</div></div>`;
  return html`<div class="readings">${kun ? html`<div><span class="rd-label">${t('Alone, say')}</span> ${kun}</div>` : ''}${on ? html`<div><span class="rd-label">${t('In longer words')}</span> ${on}</div>` : ''}</div>`;
}

export function tidbitCard(kind, item, { next = false } = {}) {
  return html`<section class="card tidbit tidbit-${kind}">
    <div class="tidbit-kicker"><span>${t(KINDS[kind].title)}</span>${next ? html`<button class="link next-tidbit">${t('Another')} ${icon('arrow', 14)}</button>` : ''}</div>
    ${tidbitBody(kind, item)}
    <div class="tidbit-actions">${shareButton(kind === 'pron' ? pronShareText(item) : tidbitShareText(kind, item))}</div>
  </section>`;
}

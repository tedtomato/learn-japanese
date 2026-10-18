// Fun facts, travel phrases and kanji shown now and then. Seen ones are collected in the Practice tab.
import { FACTS, PHRASES, KANJI } from './content/extras.js';
import { html } from './dom.js';
import { icon } from './icons.js';

export const KINDS = {
  fact: { list: FACTS, title: 'Did you know?', collection: 'Fun facts' },
  phrase: { list: PHRASES, title: 'Useful phrase', collection: 'Phrasebook' },
  kanji: { list: KANJI, title: 'Kanji peek', collection: 'Kanji spotted' },
};

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
};
export const emojiFor = (name) => EMOJI[name] || '🎌';

// Text to speak for a phrase (drops the "～" placeholder).
export const phraseSpeech = (p) => p.jp.replace(/[～~]/g, '');

const KIND_WEIGHTS = [['fact', 0.5], ['phrase', 0.35], ['kanji', 0.15]];

// Picks something the learner has not seen yet (or anything, once all are seen) and marks it seen.
export function nextTidbit(state, rng = Math.random, kinds = ['fact', 'phrase', 'kanji']) {
  const weights = KIND_WEIGHTS.filter(([k]) => kinds.includes(k));
  const total = weights.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  const kind = (weights.find(([, w]) => (r -= w) < 0) || weights[0])[0];
  const seen = new Set(state.seen[kind]);
  const { list } = KINDS[kind];
  const fresh = list.filter((x) => !seen.has(x.id));
  const pool = fresh.length ? fresh : list;
  const item = pool[Math.floor(rng() * pool.length)];
  if (!seen.has(item.id)) state.seen[kind] = [...state.seen[kind], item.id];
  return { kind, item };
}

export function tidbitBody(kind, item) {
  if (kind === 'fact') {
    return html`<div class="tidbit-head"><span class="tidbit-emoji">${emojiFor(item.icon)}</span><b>${item.title}</b></div>
      <p class="tidbit-text">${item.text}</p><small class="muted">${item.category}</small>`;
  }
  if (kind === 'phrase') {
    return html`<div class="tidbit-phrase">
      <button class="say-inline" data-say="${phraseSpeech(item)}" aria-label="Play">${icon('speaker', 22)}</button>
      <div><div class="jp jp-lg">${item.jp}</div><div class="tidbit-romaji">${item.romaji} <span class="muted">(${item.say})</span></div>
      <div class="tidbit-en">${emojiFor(item.icon)} ${item.en}</div></div></div>`;
  }
  return html`<div class="tidbit-kanji">
    <button class="kanji-big jp" data-say="${item.kun ? item.kun.split(' ')[0].replace(/[()]/g, '') : item.k}" aria-label="Play">${item.k}</button>
    <div><b>${item.en}</b><div class="muted small">${item.kun ? `kun: ${item.kun} · ` : ''}on: ${item.on}</div>
    <div class="small">e.g. <span class="jp">${item.ex}</span></div>
    ${item.tip ? html`<div class="small muted">💡 ${item.tip}</div>` : ''}</div></div>`;
}

export function tidbitCard(kind, item, { next = false } = {}) {
  return html`<section class="card tidbit tidbit-${kind}">
    <div class="tidbit-kicker"><span>${KINDS[kind].title}</span>${next ? html`<button class="link next-tidbit">Another ${icon('arrow', 14)}</button>` : ''}</div>
    ${tidbitBody(kind, item)}
  </section>`;
}

// Japanese text with optional romaji over each syllable (like furigana), as <ruby> markup.
import { html, raw } from '../dom.js';
import { art } from '../art.js';
import { syllablesFor } from '../romaji.js';
import { romajiOfChunk } from './generate.js';

function rubyWord(text, romaji) {
  const parts = romaji ? syllablesFor(text, romaji) : null;
  if (!parts) return romaji ? html`<ruby class="ruby-word">${text}<rt>${romaji}</rt></ruby>` : html`${text}`;
  return html`${parts.map((p) => html`<ruby>${p.text}<rt>${p.romaji}</rt></ruby>`)}`;
}

// A word (or a single chunk) with romaji over it when `hint` is on.
export function jpWord(text, romaji, hint) {
  return hint ? html`<span class="jp ruby-on">${rubyWord(text, romaji)}</span>` : html`<span class="jp">${text}</span>`;
}

// An item (word / sentence / kana / kanji word) as Japanese text.
// Particles said on their own sound different from their letters: は "wa", へ "e", を "o".
const PARTICLE_SOUND = { は: 'わ', へ: 'え', を: 'お' };

export function jpItem(item, hint) {
  if (item.type === 'sentence') {
    return html`<span class="jp ${hint ? 'ruby-on' : ''}">${item.jp.map((c, i) => html`<span class="chunk" data-chunk="${PARTICLE_SOUND[c] || c}">${hint ? rubyWord(c, item.romajiChunks[i]) : c}</span>`)}</span>`;
  }
  if (item.type === 'kword') return hint ? html`<span class="jp ruby-on"><ruby>${item.jp}<rt>${item.kana}</rt></ruby></span>` : html`<span class="jp">${item.jp}</span>`;
  return jpWord(item.jp, item.romaji, hint && item.type === 'word');
}

// A Japanese tile / chunk label, with romaji above when available.
export function jpChunk(text, hint, romaji = romajiOfChunk(text)) {
  return hint && romaji ? rubyWord(text, romaji) : raw(text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]));
}

// "As in すし (sushi)" for a kana: a word the learner already knows, with the kana highlighted.
export function kanaExample(item) {
  const ex = item.example;
  if (!ex) return '';
  const word = [...ex.jp].map((c) => (c === item.jp ? html`<mark>${c}</mark>` : c));
  return html`<button class="kana-example" data-say="${ex.jp}">${ex.art ? art(ex.art, 'art-ex') : ''}
    <span><small>As in</small> <b class="jp">${word}</b> <span class="ex-romaji">${ex.romaji}</span>${ex.en ? html` <small>(${ex.en})</small>` : ''}</span></button>`;
}

// What to say out loud for an item.
export const speechOf = (item) => item.say || item.text || item.kana || item.jp;

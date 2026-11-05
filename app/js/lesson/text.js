// Japanese text with optional romaji over each syllable (like furigana), as <ruby> markup.
import { html, raw } from '../dom.js';
import { art } from '../art.js';
import { syllablesFor } from '../romaji.js';
import { romajiOfChunk } from './generate.js';
import { L, LANG } from '../lang.js';

// Marks text in the course language, so screen readers use the right voice for it.
export const LANG_ATTR = L.speech.slice(0, 2);

function rubyWord(text, romaji) {
  const parts = romaji ? syllablesFor(text, romaji) : null;
  if (!parts) return romaji ? html`<ruby class="ruby-word">${text}<rt>${romaji}</rt></ruby>` : html`${text}`;
  return html`${parts.map((p) => html`<ruby>${p.text}<rt>${p.romaji}</rt></ruby>`)}`;
}

// A word (or a single chunk) with romaji over it when `hint` is on.
export function jpWord(text, romaji, hint) {
  return hint && !L.latin ? html`<span class="jp ruby-on" lang="${LANG_ATTR}">${rubyWord(text, romaji)}</span>` : html`<span class="jp" lang="${LANG_ATTR}">${text}</span>`;
}

// An item (word / sentence / kana / kanji word) as Japanese text.
// Particles said on their own sound different from their letters: は "wa", へ "e", を "o".
const PARTICLE_SOUND = L.hasKana ? { は: 'わ', へ: 'え', を: 'お' } : {};

export function jpItem(item, hint) {
  if (L.latin) hint = false; // the word is its own reading
  if (item.type === 'sentence') {
    // Latin-alphabet sentences keep the spaces between their chunks.
    return html`<span class="jp ${hint ? 'ruby-on' : ''}" lang="${LANG_ATTR}">${item.jp.map((c, i) => html`${L.latin && i ? ' ' : ''}<span class="chunk" data-chunk="${PARTICLE_SOUND[c] || c}">${hint ? rubyWord(c, item.romajiChunks[i]) : c}</span>`)}</span>`;
  }
  if (item.type === 'kword') return hint ? html`<span class="jp ruby-on" lang="${LANG_ATTR}"><ruby>${item.jp}<rt>${item.kana}</rt></ruby></span>` : html`<span class="jp" lang="${LANG_ATTR}">${item.jp}</span>`;
  return jpWord(item.jp, item.romaji, hint && item.type === 'word');
}

// A Japanese tile / chunk label, with romaji above when available.
export function jpChunk(text, hint, romaji = romajiOfChunk(text)) {
  return hint && romaji && !L.latin ? rubyWord(text, romaji) : raw(text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]));
}

// "As in すし (sushi)" for a kana: a word the learner already knows, with the kana highlighted.
// asHint: in a question, show only the picture and the word in kana, so the learner recalls the sound.
export function kanaExample(item, { asHint = false } = {}) {
  const ex = item.example;
  if (!ex) return '';
  const word = [...ex.jp].map((c) => (c === item.jp ? html`<mark>${c}</mark>` : c));
  if (asHint) {
    // The word in romaji with this character's sound highlighted (e·moji), since the kana can't be read yet.
    const parts = syllablesFor(ex.jp, ex.romaji);
    const sound = parts ? parts.map((p) => (p.text.includes(item.jp) ? html`<mark>${p.romaji}</mark>` : p.romaji)) : ex.romaji;
    return html`<span class="kana-example">${ex.art ? art(ex.art, 'art-ex') : ''}<span><small>${parts && parts[0].text.includes(item.jp) ? 'Like the start of' : 'Like in'}</small> <b class="ex-romaji">${sound}</b>${ex.en ? html` <small>(${ex.en})</small>` : ''}<br><span class="jp hint-kana">${word}</span></span></span>`;
  }
  return html`<button class="kana-example" data-say="${ex.jp}">${ex.art ? art(ex.art, 'art-ex') : ''}
    <span><small>As in</small> <b class="jp">${word}</b> <span class="ex-romaji">${ex.romaji}</span>${ex.en ? html` <small>(${ex.en})</small>` : ''}</span></button>`;
}

// What to say out loud for an item.
// What the voice reads. Chinese voices read characters, never pinyin (which sits in the reading fields).
const chineseText = (item) => item.text || (Array.isArray(item.jp) ? item.jp.join('') : item.jp);
export const speechOf = (item) => (LANG === 'zh' ? item.say && /\p{Script=Han}/u.test(item.say) ? item.say : chineseText(item) : item.say || item.text || item.kana || item.jp);

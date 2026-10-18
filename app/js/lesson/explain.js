// "Explain my answer": a breakdown of the item — each chunk with its meaning, usage notes,
// particles, kanji parts and stories — shown after checking an answer.
import { ITEMS } from '../course.js';
import { GLOSSARY } from '../content/grammar.js';
import { html } from '../dom.js';
import { jpItem, jpChunk, kanaExample } from './text.js';
import { readings } from '../tidbits.js';

const wordByJp = () => {
  const map = new Map();
  for (const it of ITEMS.values()) if (it.type === 'word' && !map.has(it.jp)) map.set(it.jp, it);
  return map;
};
let WORDS;

function chunkInfo(chunk) {
  WORDS ||= wordByJp();
  const w = WORDS.get(chunk);
  if (w) return { en: w.en, note: w.note };
  return GLOSSARY[chunk] || null;
}

function examplesWith(chunk, exceptId) {
  return [...ITEMS.values()].filter((it) => it.type === 'sentence' && it.id !== exceptId && it.jp.includes(chunk)).slice(0, 2);
}

// One explanation card per chunk (sentences) or a single card (anything else).
export function explainCards(item, { chosenLabel } = {}) {
  const cards = [];
  if (item.type === 'sentence') {
    cards.push({ chip: 'All', body: html`<p class="ex-lead">${jpItem(item, true)}</p><p>means <b>“${item.en}”</b>.</p>
      ${item.accept?.length > 1 ? html`<p class="muted small">Also accepted: ${item.accept.slice(1).join(' · ')}</p>` : ''}` });
    item.jp.forEach((c) => {
      const info = chunkInfo(c);
      const ex = examplesWith(c, item.id);
      cards.push({ chip: c, body: html`<p class="ex-lead"><span class="jp ex-key">${jpChunk(c, true)}</span> ${info ? html`means <b>“${info.en}”</b>.` : ''}</p>
        ${info?.note ? html`<p>${info.note}</p>` : ''}
        ${ex.length ? html`<p class="muted small">Also in:</p><ul>${ex.map((s) => html`<li><span class="jp">${s.text}</span> — ${s.en}</li>`)}</ul>` : ''}` });
    });
  } else if (item.type === 'word') {
    const ex = examplesWith(item.jp, item.id);
    cards.push({ chip: item.jp, body: html`<p class="ex-lead">${jpItem(item, true)} means <b>“${item.en}”</b>.</p>
      ${item.note ? html`<p>${item.note}</p>` : ''}
      ${ex.length ? html`<p class="muted small">Used in:</p><ul>${ex.map((s) => html`<li><span class="jp">${s.text}</span> — ${s.en}</li>`)}</ul>` : ''}` });
  } else if (item.type === 'kana') {
    cards.push({ chip: item.jp, body: html`<p class="ex-lead"><span class="jp ex-key">${item.jp}</span> is read <b>“${item.romaji}”</b>.</p>
      ${kanaExample(item)}<p>${item.script === 'katakana' ? 'Katakana' : 'Hiragana'}. ${item.hint}</p>` });
  } else if (item.type === 'kanji' || item.type === 'radical') {
    cards.push({ chip: item.jp, body: html`<p class="ex-lead"><span class="jp ex-key">${item.jp}</span> means <b>“${item.en}”</b>.</p>
      ${item.parts?.length > 1 ? html`<p class="parts">${item.parts.map(([p, m], i) => html`${i ? ' + ' : ''}<span class="part"><b class="jp">${p}</b> ${m}</span>`)} = <b class="jp">${item.jp}</b></p>` : ''}
      ${item.story ? html`<p>📖 ${item.story}</p>` : ''}
      ${readings(item.on, item.kun)}` });
  } else if (item.type === 'kword') {
    cards.push({ chip: item.jp, body: html`<p class="ex-lead">${jpItem(item, true)} (${item.romaji}) means <b>“${item.en}”</b>.</p>
      <p class="parts">${item.kanji.map((k, i) => html`${i ? ' + ' : ''}<span class="part"><b class="jp">${k}</b> ${ITEMS.get(`kj-${k}`)?.en || ''}</span>`)}</p>
      <p class="muted small">Kanji compounds (jukugo) combine the readings of their kanji.</p>` });
  }
  if (chosenLabel) cards[0].body = html`<p class="ex-wrong">You picked <b>${chosenLabel}</b>.</p>${cards[0].body}`;
  return cards;
}

// Pattern drill: eight quick rounds on one sentence pattern with learned words swapped in. Most rounds
// fill the blank (pick the word); some ask for the whole sentence typed in romaji. Answers count as
// reviews of the slot word; +1 gem per right answer.
import { L } from '../lang.js';
import { ITEMS } from '../course.js';
import { app, statsBar } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { art } from '../art.js';
import { sfx, speak } from '../audio.js';
import { mascot } from '../mascot.js';
import { PATTERNS } from '../content/pack.js';
import { recordSigns } from '../progress.js';
import { romajiMatch, shuffle } from '../lesson/generate.js';
import { t } from '../strings.js';
import { hideNav } from './activity.js';

export const DRILL_MIN = 3;
const ROUNDS = ['fill', 'fill', 'fill', 'type', 'fill', 'fill', 'type', 'type'];

export const drillSlots = (state, p) => p.slots.filter(([id]) => state.items[id]?.seen && ITEMS.has(id))
  .map(([id, en]) => ({ id, en, word: ITEMS.get(id) }));

export function renderDrill(root, id) {
  const p = PATTERNS.find((x) => x.id === id);
  const slots = p ? drillSlots(app.state, p) : [];
  if (slots.length < DRILL_MIN) return app.go('#/practice');
  let order = [];
  const nextSlot = () => {
    if (!order.length) order = shuffle(slots);
    return order.pop();
  };
  const rounds = ROUNDS.map((kind) => ({ kind, slot: nextSlot() }));
  const results = new Map();
  let i = 0;
  let score = 0;
  hideNav();

  // The blank comes first in Japanese (___ をください) and often last in Chinese (我要 ___: slotLast).
  const sentence = (slot, sep = ' ') => (p.slotLast ? `${p.jp}${sep}${slot.word.jp}` : `${slot.word.jp}${sep}${p.jp}`);
  const romaji = (slot) => (p.slotLast ? `${p.romaji ?? p.jp} ${slot.word.romaji}` : `${slot.word.romaji} ${p.romaji ?? p.jp}`);
  // Latin-alphabet courses: no reading line under the words (it would repeat them).
  const sub = (text) => (L.latin ? '' : html`<small>${text}</small>`);

  const show = () => {
    const { kind, slot } = rounds[i];
    mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/practice" aria-label="${t('Close')}">${icon('close', 24)}</a><h1>${p.title}</h1></header>
    <main class="page quiz drill">
      <p class="muted quiz-count">${t('{a} of {b}', { a: i + 1, b: rounds.length })} · ${p.meaning}</p>
      <section class="card quiz-card">${slot.word.art ? art(slot.word.art, 'art-lg') : ''}<p class="quiz-text"><b>${p.en(slot.en)}</b></p></section>
      ${kind === 'fill'
        ? html`<p class="drill-pattern">${p.slotLast
          ? html`<span class="jp">${p.jp}</span><span class="drill-blank jp">＿＿</span>${sub(`${p.romaji} ___`)}`
          : html`<span class="drill-blank jp">＿＿</span><span class="jp">${p.jp}</span>${sub(`___ ${p.romaji}`)}`}</p>
          <div class="options list">${shuffle([slot, ...shuffle(slots.filter((x) => x.id !== slot.id)).slice(0, 2)]).map((o) => html`<button class="option drill-opt" data-id="${o.id}">
            <span class="opt-label"><span class="jp">${o.word.jp}</span>${sub(o.word.romaji)}</span></button>`)}</div>`
        : html`<p class="muted small">${t('Now the whole sentence, from memory — type it in {what}.', { what: L.roman })}</p>
          <input class="recall-input drill-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${t('Type the sentence in {what}', { what: L.roman })}">
          <button class="btn btn-primary btn-block drill-check" disabled>${t('Check')}</button>`}
      <div class="quiz-after" hidden></div>
    </main>`);
    if (kind === 'fill') $$('.drill-opt', root).forEach((b) => b.addEventListener('click', () => answer(b.dataset.id === slot.id, b)));
    else {
      const input = $('.drill-input', root);
      const btn = $('.drill-check', root);
      const check = () => {
        if (!input.value.trim() || input.disabled) return;
        const m = romajiMatch(input.value, romaji(slot));
        input.disabled = true;
        btn.remove();
        input.classList.add(m ? 'right' : 'wrong');
        answer(!!m, null, m === 'close');
      };
      input.addEventListener('input', () => (btn.disabled = !input.value.trim()));
      input.addEventListener('keydown', (e) => e.key === 'Enter' && check());
      btn.addEventListener('click', check);
      setTimeout(() => input.focus(), 250);
    }
  };

  const answer = (ok, btn, almost = false) => {
    const { slot } = rounds[i];
    if (ok) score += 1;
    sfx(ok ? 'correct' : 'wrong');
    const r = results.get(slot.id) || { right: 0, wrong: 0 };
    r[ok ? 'right' : 'wrong'] += 1;
    results.set(slot.id, r);
    $$('.drill-opt', root).forEach((b) => {
      b.disabled = true;
      if (b.dataset.id === slot.id) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    const blank = $('.drill-blank', root);
    if (blank) {
      blank.textContent = slot.word.jp;
      blank.classList.add('filled');
    }
    speak(sentence(slot, L.latin ? ' ' : ''), { speaker: 'woman2' });
    const after = $('.quiz-after', root);
    after.hidden = false;
    mount(after, html`<p class="quiz-reveal"><span><b>${ok ? (almost ? t('Almost — watch the spelling!') : t('Right!')) : t('Not quite.')}</b>
      <span class="jp">${sentence(slot)}</span>${L.latin ? '' : ` · ${romaji(slot)}`}</span></p>
      <button class="btn btn-primary btn-block quiz-next">${t(i + 1 < rounds.length ? 'Next' : 'See my score')}</button>`);
    $('.quiz-next', root).addEventListener('click', () => {
      i += 1;
      if (i < rounds.length) show();
      else finish();
    });
  };

  const finish = () => {
    recordSigns(app.state, results, score, app.now());
    app.save();
    if (score) sfx('bonus');
    mount(root, html`<header class="topbar">${statsBar()}</header>
    <main class="page quiz quiz-end">
      ${mascot(score >= rounds.length - 1 ? 'cheer' : 'happy', 110)}
      <h1>${score} / ${rounds.length}</h1>
      <p class="muted">${score === rounds.length ? t('You can say “{what}” with anything now!', { what: p.meaning }) : score >= 5 ? t('Nice! The pattern is sinking in.') : t('Patterns take a few goes. Try again!')}</p>
      ${score ? html`<p class="pill pill-gold">${icon('gem', 16)} +${score} ${t('gems')}</p>` : ''}
      <button class="btn btn-primary btn-block quiz-again">${t('Again')}</button>
      <a class="btn btn-white btn-block" href="#/practice">${t('Back to practice')}</a>
    </main>`);
    $('.quiz-again', root).addEventListener('click', () => renderDrill(root, id));
  };

  show();
}

// Practice cards: each pattern, or how many more words it needs.
export function drillCards(state) {
  return html`<div class="missions">${PATTERNS.map((p) => {
    const n = drillSlots(state, p).length;
    const open = n >= DRILL_MIN;
    return html`<a class="card mission-card ${open ? '' : 'locked'}" href="${open ? `#/drill/${p.id}` : '#/practice'}">
      ${art(p.art, 'art-col')}<b class="jp">${p.title}</b><small>${p.meaning}</small>
      ${open ? '' : html`<small>🔒 ${t(DRILL_MIN - n > 1 ? 'Learn {n} more words for it' : 'Learn {n} more word for it', { n: DRILL_MIN - n })}</small>`}</a>`;
  })}</div>`;
}

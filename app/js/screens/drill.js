// Pattern drill: eight quick rounds on one sentence pattern with learned words swapped in. Most rounds
// fill the blank (pick the word); some ask for the whole sentence typed in romaji. Answers count as
// reviews of the slot word; +1 gem per right answer.
import { ITEMS } from '../course.js';
import { app, statsBar } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { art } from '../art.js';
import { sfx, speak } from '../audio.js';
import { mascot } from '../mascot.js';
import { PATTERNS } from '../content/patterns.js';
import { recordSigns } from '../progress.js';
import { romajiMatch } from '../lesson/generate.js';

export const DRILL_MIN = 3;
const ROUNDS = ['fill', 'fill', 'fill', 'type', 'fill', 'fill', 'type', 'type'];
const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

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

  const sentence = (slot, sep = ' ') => `${slot.word.jp}${sep}${p.jp}`;
  const romaji = (slot) => `${slot.word.romaji} ${p.romaji}`;

  const show = () => {
    const { kind, slot } = rounds[i];
    mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/practice" aria-label="Close">${icon('close', 24)}</a><h1>${p.title}</h1></header>
    <main class="page quiz drill">
      <p class="muted quiz-count">${i + 1} of ${rounds.length} · ${p.meaning}</p>
      <section class="card quiz-card">${slot.word.art ? art(slot.word.art, 'art-lg') : ''}<p class="quiz-text"><b>${p.en(slot.en)}</b></p></section>
      ${kind === 'fill'
        ? html`<p class="drill-pattern"><span class="drill-blank jp">＿＿</span><span class="jp">${p.jp}</span><small>___ ${p.romaji}</small></p>
          <div class="options list">${shuffle([slot, ...shuffle(slots.filter((x) => x.id !== slot.id)).slice(0, 2)]).map((o) => html`<button class="option drill-opt" data-id="${o.id}">
            <span class="opt-label"><span class="jp">${o.word.jp}</span><small>${o.word.romaji}</small></span></button>`)}</div>`
        : html`<p class="muted small">Now the whole sentence, from memory — type it in romaji.</p>
          <input class="recall-input drill-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Type the sentence in romaji">
          <button class="btn btn-primary btn-block drill-check" disabled>Check</button>`}
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
    speak(sentence(slot, ''), { speaker: 'woman2' });
    const after = $('.quiz-after', root);
    after.hidden = false;
    mount(after, html`<p class="quiz-reveal"><span><b>${ok ? (almost ? 'Almost — watch the spelling!' : 'Right!') : 'Not quite.'}</b>
      <span class="jp">${sentence(slot)}</span> · ${romaji(slot)}</span></p>
      <button class="btn btn-primary btn-block quiz-next">${i + 1 < rounds.length ? 'Next' : 'See my score'}</button>`);
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
      <p class="muted">${score === rounds.length ? `You can say “${p.meaning}” with anything now!` : score >= 5 ? 'Nice! The pattern is sinking in.' : 'Patterns take a few goes. Try again!'}</p>
      ${score ? html`<p class="pill pill-gold">${icon('gem', 16)} +${score} gems</p>` : ''}
      <button class="btn btn-primary btn-block quiz-again">Again</button>
      <a class="btn btn-white btn-block" href="#/practice">Back to practice</a>
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
      ${open ? '' : html`<small>🔒 Learn ${DRILL_MIN - n} more word${DRILL_MIN - n > 1 ? 's' : ''} for it</small>`}</a>`;
  })}</div>`;
}

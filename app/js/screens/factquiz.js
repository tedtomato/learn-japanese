// Fun-fact quiz: five multiple-choice questions about facts the learner has already discovered.
// Each shows a fact with its name hidden; pick its name from four. +1 gem per right answer.
import { app, statsBar } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { art } from '../art.js';
import { sfx } from '../audio.js';
import { KINDS, emojiFor } from '../tidbits.js';
import { mascot } from '../mascot.js';

export const QUIZ_MIN_FACTS = 4;
const QUESTIONS = 5;

const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
const core = (title) => title.replace(/\s*\(.*?\)\s*/g, '').trim();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// The fact's text without its own name, so the question is not given away.
const hideName = (fact) => fact.text.replace(new RegExp(escapeRe(core(fact.title)), 'gi'), '…');

export function seenFacts(state) {
  const seen = new Set(state.seen.fact);
  return KINDS.fact.list.filter((f) => seen.has(f.id));
}

export function renderFactQuiz(root) {
  const facts = seenFacts(app.state);
  if (facts.length < QUIZ_MIN_FACTS) return app.go('#/collection/fact');
  const questions = shuffle(facts).slice(0, QUESTIONS).map((fact) => ({
    fact,
    options: shuffle([fact, ...shuffle(facts.filter((f) => f.id !== fact.id)).slice(0, 3)]),
  }));
  let i = 0;
  let score = 0;

  const show = () => {
    const q = questions[i];
    mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/collection/fact" aria-label="Close">${icon('close', 24)}</a><h1>Fun facts quiz</h1></header>
    <main class="page quiz">
      <p class="muted quiz-count">Question ${i + 1} of ${questions.length}</p>
      <section class="card quiz-card">${art(emojiFor(q.fact.icon), 'art-lg')}<p class="quiz-text">${hideName(q.fact)}</p></section>
      <p class="instruction">Which fact is this?</p>
      <div class="options list">${q.options.map((o, k) => html`<button class="option" data-id="${o.id}"><span class="key">${k + 1}</span><span class="opt-label">${o.title}</span></button>`)}</div>
      <div class="quiz-after" hidden></div>
    </main>`);
    $$('.option', root).forEach((b) => b.addEventListener('click', () => answer(b)));
  };

  const answer = (btn) => {
    const q = questions[i];
    const ok = Number(btn.dataset.id) === q.fact.id;
    if (ok) score += 1;
    sfx(ok ? 'correct' : 'wrong');
    $$('.option', root).forEach((b) => {
      b.disabled = true;
      if (Number(b.dataset.id) === q.fact.id) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    const after = $('.quiz-after', root);
    after.hidden = false;
    mount(after, html`<p class="quiz-reveal"><b>${ok ? 'Right!' : 'Not quite.'}</b> ${q.fact.title}: ${q.fact.text}</p>
      <button class="btn btn-primary btn-block quiz-next">${i + 1 < questions.length ? 'Next' : 'See my score'}</button>`);
    $('.quiz-next', root).addEventListener('click', () => {
      i += 1;
      if (i < questions.length) show();
      else finish();
    });
  };

  const finish = () => {
    app.state.gems += score;
    app.save();
    if (score) sfx('bonus');
    mount(root, html`<header class="topbar">${statsBar()}</header>
    <main class="page quiz quiz-end">
      ${mascot(score >= questions.length - 1 ? 'cheer' : 'happy', 110)}
      <h1>${score} / ${questions.length}</h1>
      <p class="muted">${score === questions.length ? 'Perfect — you really know Japan!' : score >= 3 ? 'Nice! A few more to remember.' : 'Every fact you read counts. Try again!'}</p>
      ${score ? html`<p class="pill pill-gold">${icon('gem', 16)} +${score} gems</p>` : ''}
      <button class="btn btn-primary btn-block quiz-again">Another quiz</button>
      <a class="btn btn-white btn-block" href="#/collection/fact">Back to fun facts</a>
    </main>`);
    $('.quiz-again', root).addEventListener('click', () => renderFactQuiz(root));
  };

  show();
}

// Sign spotter: eight travel situations. Most ask you to tap the right real-looking sign; some show a
// sign and ask what it means. Only situations whose kanji are learned are asked. Answers count as
// kanji reviews; +1 gem per right one.
import { app, statsBar } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { art } from '../art.js';
import { sfx, speak } from '../audio.js';
import { mascot } from '../mascot.js';
import { SIGN_SCENES } from '../content/signs.js';
import { recordSigns } from '../progress.js';

export const SIGNS_MIN = 3;
const QUESTIONS = 8;
const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
const kanjiIds = (text) => [...text].map((c) => `kj-${c}`);

export const signScenes = (state) => SIGN_SCENES.filter((s) => s.need.every((k) => state.items[`kj-${k}`]?.seen));

const sign = (s, style, k) => html`<button class="sign sign-${style}" data-k="${k}">
  ${s.art ? art(s.art, 'sign-art') : ''}<span class="sign-text jp ${[...s.t].length >= 4 ? 'long' : ''}">${s.t}</span><small class="sign-meaning" hidden>${s.r} · ${s.en}</small></button>`;

export function renderSigns(root) {
  const scenes = signScenes(app.state);
  if (scenes.length < SIGNS_MIN) return app.go('#/practice');
  // Repeat situations only when fewer than eight are unlocked; about one in three is "what does it mean?".
  const picked = shuffle(scenes);
  const questions = Array.from({ length: QUESTIONS }, (_, n) => picked[n % picked.length])
    .map((scene, n) => ({ scene, read: n % 3 === 2, options: shuffle([scene.answer, ...scene.wrong]) }));
  const results = new Map();
  let i = 0;
  let score = 0;

  const show = () => {
    const { scene, options, read } = questions[i];
    mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/practice" aria-label="Close">${icon('close', 24)}</a><h1>Sign spotter</h1></header>
    <main class="page quiz signs">
      <p class="muted quiz-count">Sign ${i + 1} of ${questions.length}</p>
      ${read
        ? html`<section class="card quiz-card"><p class="quiz-text">You see this sign. What does it mean?</p></section>
          <div class="sign-grid n1">${sign(scene.answer, scene.style, 'x')}</div>
          <div class="options list">${options.map((o, k) => html`<button class="option sign-meaning-opt" data-k="${k}"><span class="opt-label">${o.en}</span></button>`)}</div>`
        : html`<section class="card quiz-card"><p class="quiz-text">${scene.q}</p></section>
          <div class="sign-grid n${options.length}">${options.map((o, k) => sign(o, scene.style, k))}</div>`}
      <div class="quiz-after" hidden></div>
    </main>`);
    if (read) {
      const shown = $('.sign', root);
      shown.disabled = true;
      $$('.sign-meaning-opt', root).forEach((b) => b.addEventListener('click', () => answer(b)));
    } else $$('.sign', root).forEach((b) => b.addEventListener('click', () => answer(b)));
  };

  const answer = (btn) => {
    const { scene, options } = questions[i];
    const ok = options[Number(btn.dataset.k)] === scene.answer;
    if (ok) score += 1;
    sfx(ok ? 'correct' : 'wrong');
    for (const id of kanjiIds(scene.answer.t)) {
      const r = results.get(id) || { right: 0, wrong: 0 };
      r[ok ? 'right' : 'wrong'] += 1;
      results.set(id, r);
    }
    $$('.sign', root).forEach((b) => {
      b.disabled = true;
      b.querySelector('.sign-meaning').hidden = false;
      if (options[Number(b.dataset.k)] === scene.answer) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    $$('.sign-meaning-opt', root).forEach((b) => {
      b.disabled = true;
      if (options[Number(b.dataset.k)] === scene.answer) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    speak(scene.answer.say, { speaker: 'woman' });
    const after = $('.quiz-after', root);
    after.hidden = false;
    mount(after, html`<p class="quiz-reveal"><span><b>${ok ? 'Right!' : 'Not quite.'}</b> <span class="jp">${scene.answer.t}</span> (${scene.answer.r}) means <b>${scene.answer.en}</b>.</span></p>
      <button class="btn btn-primary btn-block quiz-next">${i + 1 < questions.length ? 'Next' : 'See my score'}</button>`);
    $('.quiz-next', root).addEventListener('click', () => {
      i += 1;
      if (i < questions.length) show();
      else finish();
    });
  };

  const finish = () => {
    recordSigns(app.state, results, score, app.now());
    app.save();
    if (score) sfx('bonus');
    mount(root, html`<header class="topbar">${statsBar()}</header>
    <main class="page quiz quiz-end">
      ${mascot(score >= questions.length - 1 ? 'cheer' : 'happy', 110)}
      <h1>${score} / ${questions.length}</h1>
      <p class="muted">${score === questions.length ? 'Perfect — you can find your way around Japan!' : score >= 4 ? 'Nice! Nearly a local.' : 'Signs take practice. Try again!'}</p>
      ${score ? html`<p class="pill pill-gold">${icon('gem', 16)} +${score} gems</p>` : ''}
      <button class="btn btn-primary btn-block quiz-again">More signs</button>
      <a class="btn btn-white btn-block" href="#/practice">Back to practice</a>
    </main>`);
    $('.quiz-again', root).addEventListener('click', () => renderSigns(root));
  };

  show();
}

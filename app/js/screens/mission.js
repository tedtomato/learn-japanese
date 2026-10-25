// A real-world mission: a short chat with one of the cast. They speak (Japanese + romaji, English on
// tap), you pick what to say; wrong picks explain themselves and can be tried again. Stars: 3 with
// no mistakes, 2 with one or two, else 1.
import { SECTIONS } from '../course.js';
import { app } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { art } from '../art.js';
import { person, nameOf } from '../characters.js';
import { speak, sfx, buzz } from '../audio.js';
import { MISSIONS } from '../content/missions.js';
import { completeMission, unitLessonsDone } from '../progress.js';

const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
export const missionUnit = (m) => SECTIONS.flatMap((s) => s.units).find((u) => u.id === m.unit);
export const missionOpen = (state, m) => app.testMode || unitLessonsDone(state, missionUnit(m));
const starsFor = (mistakes) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);
const starRow = (n) => html`<span class="stars">${[1, 2, 3].map((k) => html`<i class="${k <= n ? 'on' : ''}">★</i>`)}</span>`;

export function renderMission(root, id) {
  const m = MISSIONS.find((x) => x.id === id);
  if (!m || !missionOpen(app.state, m)) return app.go('#/practice');
  let step = 0;
  let mistakes = 0;

  mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/practice" aria-label="Close">${icon('close', 24)}</a><h1>${m.title}</h1></header>
  <main class="page mission">
    <section class="mission-scene">${art(m.art, 'art-lg')}<p>${m.setting}</p></section>
    <div class="chat"></div>
    <div class="mission-act"></div>
  </main>`);
  const chat = $('.chat', root);
  const act = $('.mission-act', root);
  const scroll = () => act.scrollIntoView({ block: 'end', behavior: 'smooth' });

  const bubble = (who, line, mine = false) => {
    const el = document.createElement('div');
    el.className = `chat-line ${mine ? 'mine' : ''}`;
    mount(el, html`${mine ? '' : html`<div class="chat-who">${person(who, 56)}<small>${nameOf(who)}</small></div>`}
      <button class="chat-bubble">${line.jp ? html`<span class="jp">${line.jp}</span><small class="chat-romaji">${line.romaji}</small>` : ''}
        <small class="chat-en" ${mine || !line.jp ? '' : 'hidden'}>${line.en}</small>${line.jp && !mine ? html`<small class="chat-tap">Tap for English</small>` : ''}</button>`);
    chat.append(el);
    $('.chat-bubble', el).addEventListener('click', () => {
      $('.chat-en', el).hidden = false;
      $('.chat-tap', el)?.remove();
      if (line.jp) speak(line.jp, { speaker: mine ? 'woman' : who });
    });
    return el;
  };

  const show = () => {
    const s = m.steps[step];
    if (s.who) {
      bubble(s.who, s);
      speak(s.jp, { speaker: s.who });
    }
    const replies = shuffle(s.replies);
    mount(act, html`<p class="mission-prompt">${s.prompt || 'What do you say?'}</p>
      <div class="options list">${replies.map((r, k) => html`<button class="option reply" data-k="${k}">
        ${r.jp ? html`<span class="opt-label"><span class="jp">${r.jp}</span><small>${r.romaji}</small></span>` : html`<span class="opt-label">${r.en}</span>`}</button>`)}</div>
      <p class="mission-note" hidden></p>`);
    $$('.reply', act).forEach((b) => b.addEventListener('click', () => pick(b, replies[Number(b.dataset.k)])));
    scroll();
  };

  const pick = (btn, r) => {
    const note = $('.mission-note', act);
    if (!r.ok) {
      mistakes += 1;
      sfx('wrong');
      buzz();
      btn.disabled = true;
      btn.classList.add('wrong');
      note.hidden = false;
      note.className = 'mission-note bad';
      note.textContent = `${r.jp ? `${r.jp} = "${r.en}". ` : ''}${r.note}`;
      return;
    }
    sfx('correct');
    bubble('you', r, true);
    if (r.jp) speak(r.jp, { speaker: 'woman' });
    mount(act, html`${r.note ? html`<p class="mission-note good">${r.note}</p>` : ''}
      <button class="btn btn-primary btn-block mission-next">${step + 1 < m.steps.length ? 'Continue' : 'Finish'}</button>`);
    $('.mission-next', act).addEventListener('click', () => {
      step += 1;
      if (step < m.steps.length) show();
      else finish();
    });
    scroll();
  };

  const finish = () => {
    const stars = starsFor(mistakes);
    const res = completeMission(app.state, m.id, stars, app.now());
    app.save();
    sfx('complete');
    mount(root, html`<main class="page mission-done">
      ${art(m.art, 'art-xl')}
      <h1>Mission complete!</h1>
      ${starRow(stars)}
      <p>${m.reward}</p>
      <div class="extras"><p class="pill pill-gold">${icon('bolt', 16)} +${res.xp} XP</p>${res.gems ? html`<p class="pill pill-blue">${icon('gem', 16)} +${res.gems} gems</p>` : ''}</div>
      ${stars < 3 ? html`<p class="muted small">Play again with no mistakes for 3 stars.</p>` : ''}
      <button class="btn btn-primary btn-block mission-again">Play again</button>
      <a class="btn btn-white btn-block" href="#/practice">Back to practice</a>
    </main>`);
    $('.mission-again', root).addEventListener('click', () => renderMission(root, id));
  };

  show();
}

// Practice cards: each mission with its stars, or what unlocks it.
export function missionCards(state) {
  return html`<div class="missions">${MISSIONS.map((m) => {
    const open = missionOpen(state, m);
    const stars = state.missions[m.id] || 0;
    return html`<a class="card mission-card ${open ? '' : 'locked'}" href="${open ? `#/mission/${m.id}` : '#/practice'}">
      ${art(m.art, 'art-col')}<b>${m.title}</b>
      ${open ? (stars ? starRow(stars) : html`<small class="new">New!</small>`) : html`<small>🔒 Finish “${missionUnit(m).title}”</small>`}</a>`;
  })}</div>`;
}

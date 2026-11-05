// The language screen: shown first (before anything else) until a language is picked, and opened
// from the flag in the top bar. Every course keeps its own progress, shown here so the learner sees
// what they come back to: lessons done, XP, streak, words, and the unit they are on.
import { COURSES, LANG, courseChosen, switchCourse, markLanguagePicked } from '../lang.js';
import { AVAILABLE } from '../content/pack.js';
import { app, flagSvg, saveSummary } from '../app.js';
import { streakAt } from '../progress.js';
import { html, mount, raw, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

// The course's summary (saved whenever that course saves), or what can be read from its progress.
function progressOf(course) {
  const summary = read(`hajime.summary.${course.code}`);
  if (summary?.started) {
    // Computed now from the saved streak fields (older summaries only have the number saved then).
    const streak = summary.lastDay !== undefined ? streakAt({ count: summary.streakCount, lastDay: summary.lastDay, freezes: summary.freezes }, Date.now()) : summary.streak;
    return { ...summary, streak };
  }
  const saved = read(course.storageKey);
  if (!saved || !(saved.stats?.lessons > 0 || saved.xp > 0 || Object.keys(saved.nodes || {}).length)) return null;
  return { xp: saved.xp || 0, streak: saved.streak ? streakAt(saved.streak, Date.now()) : 0, done: Object.values(saved.nodes || {}).filter((n) => n?.level > 0).length, total: 0, words: null, unit: '' };
}

const pct = (p) => (p.total ? Math.min(100, Math.round((p.done / p.total) * 100)) : 0);

function courseCard(c) {
  const p = progressOf(c);
  const current = c.code === LANG && courseChosen();
  return html`<button class="course-card ${current ? 'on' : ''}" data-course="${c.code}">
    <span class="course-top">${raw(flagSvg(c.flag, 52))}
      <span class="course-name"><b>${c.name}</b><small>${c.native !== c.name ? html`<span class="native">${c.native}</span> · ` : ''}${c.gloss === 'French' ? 'for French speakers' : 'from English'}</small></span>
      ${current ? html`<span class="pill pill-green">Current</span>` : html`<span class="course-go">${icon('arrow', 20)}</span>`}</span>
    ${p ? html`<span class="course-progress">
        ${p.total ? html`<span class="course-bar" role="progressbar" aria-valuenow="${pct(p)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(pct(p), 3)}%"></i></span>
          <span class="course-pct">${pct(p)}%</span>` : ''}
      </span>
      <span class="course-stats">
        <span class="c-orange">${icon('flame', 16)} ${p.streak} day${p.streak === 1 ? '' : 's'}</span>
        <span class="c-gold">${icon('bolt', 16)} ${p.xp} XP</span>
        ${p.words != null ? html`<span class="c-green">${icon('word', 16)} ${p.words} words</span>` : ''}
        ${p.total ? html`<span class="muted">${p.done} / ${p.total} lessons</span>` : ''}
      </span>
      ${p.unit ? html`<span class="course-unit">${p.unit === 'Course complete' ? '🏆 Course complete' : html`Next up: <b>${p.unit}</b>`}</span>` : ''}`
    : html`<span class="course-new">Not started yet — tap to begin</span>`}
  </button>`;
}

export function renderCourses(root) {
  const chosen = courseChosen();
  if (!app.testMode) saveSummary(); // the loaded course's numbers, fresh (Japanese on a first launch)
  const list = AVAILABLE.map((code) => COURSES[code]);
  const started = list.filter((c) => progressOf(c));
  mount(root, html`${chosen ? html`<header class="topbar topbar-back"><a class="icon-btn" href="#/learn" aria-label="Back">${icon('close', 24)}</a><h1>Languages</h1></header>` : ''}
  <main class="page courses-page">
    <section class="courses-hero">${mascot(chosen ? 'happy' : 'cheer', 96)}
      <div><h1>${chosen ? 'Which language today?' : 'What do you want to learn?'}</h1>
      <p class="muted">${started.length ? `You are learning ${started.length} language${started.length > 1 ? 's' : ''}. Each one keeps its own progress, streak and gems.` : 'Pick a language to start. You can switch any time from the flag at the top — each language keeps its own progress.'}</p></div>
    </section>
    <div class="course-cards">${list.map(courseCard)}</div>
  </main>`);
  window.scrollTo(0, 0);
  $$('.topbar-back .icon-btn', root).forEach((a) => a.addEventListener('click', markLanguagePicked));
  $$('[data-course]', root).forEach((b) => b.addEventListener('click', () => {
    if (app.testMode && b.dataset.course !== LANG) app.setTestMode(false);
    switchCourse(b.dataset.course);
  }));
}

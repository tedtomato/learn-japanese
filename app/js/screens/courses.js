// Course picker, opened from the flag in the top bar: switch between Japanese and Chinese. Each
// course keeps its own progress, shown here so the learner sees what they come back to.
import { COURSES, LANG, switchCourse } from '../lang.js';
import { AVAILABLE } from '../content/pack.js';
import { modal, flagSvg } from '../app.js';
import { html, raw } from '../dom.js';

function summary(course) {
  try {
    const saved = JSON.parse(localStorage.getItem(course.storageKey) || 'null');
    if (!saved) return 'Not started yet';
    return `${saved.xp || 0} XP · 🔥 ${saved.streak?.count || 0} day streak`;
  } catch {
    return 'Not started yet';
  }
}

export function showCoursePicker() {
  const list = AVAILABLE.map((code) => COURSES[code]);
  const close = modal(html`<h2 class="center">Which language?</h2>
    <div class="course-list">${list.map((c) => html`<button class="course-row ${c.code === LANG ? 'on' : ''}" data-course="${c.code}">
      ${raw(flagSvg(c.flag, 48))}<span><b>${c.name} <span class="native">${c.native}</span></b><small>${summary(c)}</small></span>
      ${c.code === LANG ? html`<span class="pill pill-green">Current</span>` : ''}</button>`)}
    ${Object.values(COURSES).filter((c) => !AVAILABLE.includes(c.code)).map((c) => html`<div class="course-row soon">
      ${raw(flagSvg(c.flag, 48))}<span><b>${c.name} <span class="native">${c.native}</span></b><small>Coming soon</small></span></div>`)}</div>
    <p class="muted small center">Each language keeps its own progress, streak and gems.</p>`, [{ label: 'Close', kind: 'secondary' }]);
  document.querySelectorAll('[data-course]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.course === LANG) return close();
    switchCourse(b.dataset.course);
  }));
}

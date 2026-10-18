// Streak calendar: opened by tapping the flame in the top bar. Shows each month with the days
// studied (flame), daily goal reached (gold), and today; arrows move between months.
import { app, modal } from '../app.js';
import { html, $ } from '../dom.js';
import { icon } from '../icons.js';
import { dayKey, displayStreak, studiedToday } from '../progress.js';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function monthGrid(year, month, state, now) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const today = dayKey(now);
  const cells = Array.from({ length: lead }, () => html`<span class="cal-day empty"></span>`);
  for (let d = 1; d <= days; d++) {
    const key = dayKey(new Date(year, month, d).getTime());
    const xp = state.daily[key] || 0;
    const cls = [xp > 0 ? 'studied' : '', xp >= state.dailyGoal ? 'goal' : '', key === today ? 'today' : '', key > today ? 'future' : ''].join(' ');
    cells.push(html`<span class="cal-day ${cls}" title="${xp ? `${xp} XP` : ''}">${xp > 0 ? icon('flame', 16) : ''}<small>${d}</small></span>`);
  }
  return cells;
}

export function showStreakCalendar() {
  const { state } = app;
  const now = app.now();
  const at = new Date(now);
  let year = at.getFullYear();
  let month = at.getMonth();
  const streak = displayStreak(state, now);
  const daysStudied = Object.values(state.daily).filter((xp) => xp > 0).length;

  modal(html`<div class="streak-cal">
    <div class="streak-head"><span class="streak-flame ${studiedToday(state, now) ? 'on' : ''}">${icon('flame', 40)}</span>
      <div><b>${streak} day streak</b><small>${studiedToday(state, now) ? 'You studied today. See you tomorrow!' : streak ? 'Do a lesson today to keep it going.' : 'Do a lesson today to start a streak.'}</small></div></div>
    <div class="cal-nav"><button class="icon-btn cal-prev" aria-label="Previous month">‹</button><b class="cal-title"></b><button class="icon-btn cal-next" aria-label="Next month">›</button></div>
    <div class="cal-grid cal-weekdays">${WEEKDAYS.map((w) => html`<span>${w}</span>`)}</div>
    <div class="cal-grid cal-days"></div>
    <div class="streak-stats"><div><b>${Math.max(state.streak.best, streak)}</b><small>Best streak</small></div><div><b>${daysStudied}</b><small>Days studied</small></div><div><b>${state.streak.freezes}</b><small>Streak freezes</small></div></div>
    <p class="muted small cal-legend"><i class="dot studied"></i>Studied <i class="dot goal"></i>Daily goal reached</p>
  </div>`, [{ label: 'Close', kind: 'secondary' }]);

  const render = () => {
    const root = $('#modal');
    $('.cal-title', root).textContent = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    $('.cal-days', root).innerHTML = monthGrid(year, month, state, now).map((c) => c.__raw).join('');
    $('.cal-next', root).disabled = year === at.getFullYear() && month === at.getMonth();
  };
  const step = (n) => {
    month += n;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    render();
  };
  $('#modal .cal-prev').addEventListener('click', () => step(-1));
  $('#modal .cal-next').addEventListener('click', () => step(1));
  render();
}

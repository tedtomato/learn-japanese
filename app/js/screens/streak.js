// Streak calendar: opened by tapping the flame in the top bar. Shows each month with the days
// studied (flame), daily goal reached (gold), and today; arrows move between months.
import { app, modal } from '../app.js';
import { L } from '../lang.js';
import { html, $ } from '../dom.js';
import { icon } from '../icons.js';
import { dayKey, displayStreak, studiedToday, repairOffer, streakState, milestoneRow, weeklyTreasureIn, MAX_FREEZES, GEMS_WEEKLY } from '../progress.js';
import { snowSvg } from '../rewardicons.js';
import { shareButton, wireShare } from '../share.js';
import { doRepair } from './quests.js';
import { t } from '../strings.js';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function monthGrid(year, month, state, now) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const today = dayKey(now);
  const cells = Array.from({ length: lead }, () => html`<span class="cal-day empty"></span>`);
  let order = 0;
  for (let d = 1; d <= days; d++) {
    const key = dayKey(new Date(year, month, d).getTime());
    const xp = state.daily[key] || 0;
    const cls = [xp > 0 ? 'studied' : '', xp >= state.dailyGoal ? 'goal' : '', key === today ? 'today' : '', key > today ? 'future' : ''].join(' ');
    cells.push(html`<span class="cal-day ${cls}" style="--i:${xp > 0 ? order++ : 0}" title="${xp ? `${xp} XP` : ''}">${xp > 0 ? html`<i class="cal-flame">${icon('flame', 16)}</i>` : ''}<small>${d}</small></span>`);
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
  const repair = repairOffer(state, now);
  const daysStudied = Object.values(state.daily).filter((xp) => xp > 0).length;
  const mood = streakState(state, now);
  const marks = milestoneRow(state, now);
  const weekly = weeklyTreasureIn(state, now);
  const freezes = state.streak.freezes;

  modal(html`<div class="streak-cal">
    <div class="streak-head"><span class="streak-flame ${mood === 'secured' ? 'on' : mood}">${icon('flame', 40)}</span>
      <div><b>${t('{n} day streak', { n: streak })}</b><small>${t(studiedToday(state, now) ? 'You studied today. See you tomorrow!' : streak ? 'Do a lesson today to keep it going.' : 'Do a lesson today to start a streak.')}</small></div></div>
    ${repair ? html`<div class="repair-row"><button class="btn btn-secondary btn-block do-repair" ${state.gems >= repair.price ? '' : 'disabled'}>${t('Repair your streak')} · ${icon('gem', 16)} ${repair.price}</button></div>` : ''}
    <div class="streak-extras">
      <div class="milestones" aria-label="${t('Streak milestones')}">${marks.badges.map((m) => html`<span class="mile ${m.earned ? 'earned' : ''}" aria-label="${t('{n} days', { n: m.days })}${m.earned ? `, ${t('earned')}` : ''}">${icon('flame', 18)}<b>${m.days}</b></span>`)}</div>
      <p class="mile-next">${marks.next ? t('{n} days to go until the {m}-day badge', { n: marks.toGo, m: marks.next }) : t('Every streak badge earned. Legend!')}</p>
      <div class="freeze-row"><div class="freeze-tokens" aria-hidden="true">${Array.from({ length: MAX_FREEZES }, (_, i) => html`<span class="freeze ${i < freezes ? 'on' : ''}">${snowSvg(22)}</span>`)}</div>
        <small>${freezes ? t('{n} streak freeze equipped: it is used automatically if you miss a day.', { n: freezes }) : t('No streak freeze yet. One is equipped automatically when you have it.')}</small></div>
      <p class="weekly-hint">${icon('gem', 14)} ${t(weekly === 1 ? 'Weekly treasure: {n} more day (+{g} gems)' : 'Weekly treasure: {n} more days (+{g} gems)', { n: weekly, g: GEMS_WEEKLY })}</p>
    </div>
    <div class="cal-nav"><button class="icon-btn cal-prev" aria-label="${t('Previous month')}">‹</button><b class="cal-title"></b><button class="icon-btn cal-next" aria-label="${t('Next month')}">›</button></div>
    <div class="cal-grid cal-weekdays">${WEEKDAYS.map((w) => html`<span>${w}</span>`)}</div>
    <div class="cal-grid cal-days"></div>
    <div class="streak-stats"><div><b>${Math.max(state.streak.best, streak)}</b><small>${t('Best streak')}</small></div><div><b>${daysStudied}</b><small>${t('Days studied')}</small></div><div><b>${state.streak.freezes}</b><small>${t('Streak freezes')}</small></div></div>
    ${streak >= 2 ? shareButton(`🔥 ${streak}-day streak learning ${L.name} with Hajime!`, t('Share my streak')) : ''}
    <p class="muted small cal-legend"><i class="dot studied"></i>${t('Studied')} <i class="dot goal"></i>${t('Daily goal reached')}</p>
  </div>`, [{ label: t('Close'), kind: 'secondary' }]);

  const render = () => {
    const root = $('#modal');
    $('.cal-title', root).textContent = new Date(year, month, 1).toLocaleDateString(L.gloss === 'French' ? 'fr-FR' : 'en-GB', { month: 'long', year: 'numeric' });
    $('.cal-days', root).innerHTML = monthGrid(year, month, state, now).map((c) => c.__raw).join('');
    $('.cal-next', root).disabled = year === at.getFullYear() && month === at.getMonth();
  };
  const step = (n) => {
    month += n;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    render();
  };
  $('#modal .do-repair')?.addEventListener('click', () => {
    if (!doRepair()) return;
    window.dispatchEvent(new HashChangeEvent('hashchange')); // the screen behind shows the repaired streak
    showStreakCalendar();
  });
  $('#modal .cal-prev').addEventListener('click', () => step(-1));
  $('#modal .cal-next').addEventListener('click', () => step(1));
  wireShare($('#modal'));
  render();
}

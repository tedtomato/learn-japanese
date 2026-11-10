// Daily habits on the Learn screen: the quests card, the trip countdown, the streak repair offer and the
// reward pop-ups that go with them.
import { app, toast } from '../app.js';
import { rewardPopup } from '../fx.js';
import { html } from '../dom.js';
import { icon } from '../icons.js';
import { t, countryName } from '../strings.js';
import { questList, ensureQuests, claimQuestChest, tripDaysLeft, tripPlan, repairOffer, repairStreak, QUEST_CHEST_GEMS, DOUBLE_XP_MS } from '../progress.js';

// Today's three quests with progress bars. Once all are done the chest waits here until it is opened.
export function questsCard(state, now) {
  const list = questList(state, now);
  const doneCount = list.filter((q) => q.done).length;
  const chest = ensureQuests(state, now).chest;
  const minutes = DOUBLE_XP_MS / 60000;
  return html`<section class="card quests-card" aria-label="${t('Daily quests')}">
    <div class="quests-head"><b>${icon('star', 18)} ${t('Daily quests')}</b><span class="quests-count">${doneCount}/${list.length}</span></div>
    <ul class="quest-list">${list.map((q) => html`<li class="quest ${q.done ? 'done' : ''}">
      <span class="quest-text">${q.done ? icon('check', 16) : ''}${t(q.def.text)}</span>
      <span class="quest-gems">${q.def.target > 1 ? `${q.p}/${q.def.target} · ` : ''}${icon('gem', 14)} +${q.def.gems}</span>
      <div class="bar" role="progressbar" aria-label="${t(q.def.text)}" aria-valuemin="0" aria-valuemax="${q.def.target}" aria-valuenow="${q.p}"><div class="bar-fill" style="width:${(q.p / q.def.target) * 100}%"></div></div>
    </li>`)}</ul>
    ${chest === 'ready' ? html`<button class="btn btn-primary btn-block open-quest-chest">${icon('chest', 20)} ${t('Open your chest')}</button>`
      : html`<p class="quests-foot">${chest === 'opened' ? t('All done today! Fresh quests tomorrow.') : t('All three: a chest with {gems} gems and {n} minutes of double XP', { gems: QUEST_CHEST_GEMS, n: minutes })}</p>`}
  </section>`;
}

// Opens the chest the finished quests earned: gems and a double-XP window. next runs afterwards.
export function questChest(next) {
  const prize = claimQuestChest(app.state, app.now());
  if (!prize) return next?.();
  app.save();
  rewardPopup({
    kind: 'chest',
    title: t('All quests done!'),
    reward: html`${icon('gem', 30)} +${prize.gems} ${t('gems')}`,
    text: t('Double XP for the next {n} minutes!', { n: prize.minutes }),
    onDone: next,
  });
}

// After a game: a note for each quest just finished, and the chest if that was the last one.
export function announceQuests(res) {
  if (!res) return;
  if (res.done.length) toast(t('Quest done: {text} +{n} gems', { text: t(res.done[0].text), n: res.done[0].gems }), { ms: 4500 });
  if (res.chestReady) setTimeout(() => questChest(), 900);
}

// "about 2 lessons a day"
export const lessonRate = (n) => t(n === 1 ? '1 lesson a day' : '{n} lessons a day', { n });

// "23 days to Japan ✈️", from the date set in Profile; on the day, "Have a great trip!". Gone after the date.
export function tripBanner(state, now) {
  const days = tripDaysLeft(state, now);
  if (days === null) return '';
  const plan = tripPlan(state, now);
  const title = days === 0 ? t('Have a great trip! ✈️') : t(days === 1 ? '{n} day to {country} ✈️' : '{n} days to {country} ✈️', { n: days, country: countryName() });
  const sub = !plan ? '' : plan.left === 0 ? t('Section 1 is done — you are ready!')
    : t('To finish section 1 in time: about {rate}.', { rate: lessonRate(plan.perDay) });
  return html`<section class="card trip-banner">
    <div><b>${title}</b>${sub ? html`<small>${sub}</small>` : ''}</div></section>`;
}

// A streak that broke in the last 2 days: bring it back for gems (once).
export function repairCard(state, now) {
  const offer = repairOffer(state, now);
  if (!offer) return '';
  const can = state.gems >= offer.price;
  return html`<section class="card repair-card">
    <div><b>${icon('flame', 18)} ${t('Your {n}-day streak ended', { n: offer.count })}</b><small>${can ? t('Repair it and carry on where you left off.') : t('You need {n} gems to repair it.', { n: offer.price })}</small></div>
    <button class="btn btn-secondary btn-small do-repair" ${can ? '' : 'disabled'}>${t('Repair your streak')} · ${icon('gem', 14)} ${offer.price}</button>
  </section>`;
}

// Pays for the repair and says so. Returns true when it worked.
export function doRepair() {
  const count = repairStreak(app.state, app.now());
  if (!count) return false;
  app.save();
  toast(t('Streak repaired: {n} days 🔥', { n: count }));
  return true;
}

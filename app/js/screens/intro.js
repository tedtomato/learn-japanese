// "How it works": three or four short swipeable cards (hearts, gems and chests, daily goal and streak, the
// flag that switches language). Shown once per device to a new learner after their first language pick,
// and re-openable from Profile.
import { L } from '../lang.js';
import { app, flagSvg, openLayer, closeLayer } from '../app.js';
import { html, mount, raw, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { t } from '../strings.js';
import { HEART_REFILL_MS, GEMS_CHEST, FREEZE_PRICE, HEARTS_PRICE } from '../progress.js';

const SEEN_KEY = 'hajime.intro-seen';
const seen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true; // no storage: do not nag
  }
};
const markSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
};

// The cards: a picture, a title and two or three short lines each.
const cards = () => [
  { pic: html`<span class="intro-pic c-red">${icon('heart', 56)}</span>`, title: t('Hearts'), lines: [
    t('Your first time through a lesson is free — no hearts are lost.'),
    t('Replaying a finished lesson costs a heart for each mistake. Hearts come back by themselves, one every {n} minutes.', { n: HEART_REFILL_MS / 60000 }),
    t('A practice session never costs hearts and earns one back.'),
  ] },
  { pic: html`<span class="intro-pic c-blue">${icon('gem', 52)}</span>`, title: t('Gems & chests'), lines: [
    t('Lessons, missions and your daily goal earn gems. Treasure chests on the path hold {n} gems.', { n: GEMS_CHEST }),
    t('Spend them on a streak freeze ({a} gems) or a full set of hearts ({b} gems).', { a: FREEZE_PRICE, b: HEARTS_PRICE }),
  ] },
  { pic: html`<span class="intro-pic c-orange">${icon('flame', 56)}</span>`, title: t('Daily goal & streak'), lines: [
    t('Every lesson earns XP. Reach your daily XP goal for bonus gems — you can change the goal any time.'),
    t('Study a little each day to grow your flame streak. A streak freeze saves it if you miss a day.'),
  ] },
  { pic: html`<span class="intro-pic intro-flag">${raw(flagSvg(L.flag, 72))}</span>`, title: t('Change language'), lines: [
    t('Tap the flag at the top to switch language at any time.'),
    t('Each language keeps its own progress, streak and gems.'),
  ] },
];

export function showIntro() {
  const root = $('#modal');
  const list = cards();
  const finish = () => {
    markSeen();
    closeLayer(root);
  };
  mount(root, html`<div class="scrim"></div>
    <div class="sheet intro" role="dialog" aria-modal="true">
      <div class="intro-top"><h2 class="intro-heading">${t('How Hajime works')}</h2><button class="link intro-skip">${t('Skip')}</button></div>
      <div class="intro-track" tabindex="0" role="group" aria-label="${t('How Hajime works')}">${list.map((c, i) => html`<section class="intro-card" aria-label="${i + 1} / ${list.length}">
        ${c.pic}<h3>${c.title}</h3>${c.lines.map((l) => html`<p>${l}</p>`)}</section>`)}</div>
      <div class="intro-dots" aria-hidden="true">${list.map((_, i) => html`<i class="${i === 0 ? 'on' : ''}"></i>`)}</div>
      <div class="sheet-actions"><button class="btn btn-primary btn-block intro-next">${t('Next')}</button></div>    </div>`);
  openLayer(root, { dismiss: finish, focus: '.intro-next' });
  const track = $('.intro-track', root);
  const next = $('.intro-next', root);
  let at = 0;
  const show = (i) => {
    at = i;
    $$('.intro-dots i', root).forEach((d, j) => d.classList.toggle('on', j === i));
    next.textContent = i === list.length - 1 ? t('Let\'s go!') : t('Next');
  };
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== at && i >= 0 && i < list.length) show(i);
  });
  next.addEventListener('click', () => {
    if (at >= list.length - 1) return finish();
    track.scrollTo({ left: (at + 1) * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    show(at + 1);
  });
  $('.intro-skip', root).addEventListener('click', finish);
  $('.scrim', root).addEventListener('click', finish);
}

// The first time on the path, for a learner who has not started: show the cards. Someone who already has
// progress (an update reaching an existing learner) is never shown them.
export function maybeShowIntro() {
  if (seen() || app.testMode) return;
  const { state } = app;
  if (state.stats.lessons > 0 || state.xp > 0 || Object.keys(state.nodes).length) return markSeen();
  showIntro();
}

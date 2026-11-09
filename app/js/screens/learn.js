// The learning path: sections → unit banners → winding track of lesson nodes.
import { L } from '../lang.js';
import { SECTIONS, ITEMS, MAX_LEVEL, NODE_BY_ID } from '../course.js';
import { jpItem, speechOf } from '../lesson/text.js';
import { rewardPopup } from '../fx.js';
import { decorFor, drawTrails, ROADBLOCK } from '../scenery.js';
import { app, statsBar, toast, modal } from '../app.js';
import { html, mount, raw, $, $$, fitText } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { speak } from '../audio.js';
import { art } from '../art.js';
import { MISSIONS } from '../content/pack.js';
import { t } from '../strings.js';
import {
  currentNodeIndex, nodeLevel, isNodeDone, isNodeUnlocked, nodeNeedsReview, openChest, todayXp, currentHearts, dueItemIds, studiedToday,
  reviewEstimate, REVIEW_FIRST_MIN, unitIsLocked, unitReview, TESTOUT_PASS, weeklyRecap, showRecap, weekKey, suggestGoal, unitLessonsDone,
} from '../progress.js';
import { strength } from '../srs.js';

const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];
const CHEERS = L.cheers;

// Words learned before that are due again today (spaced repetition), with a one-tap review.
function reviewCard(state, now) {
  const due = dueItemIds(state, now).filter((id) => state.items[id].seen > 0);
  if (!due.length) return '';
  const words = due.map((id) => ITEMS.get(id)).filter((it) => it && it.type !== 'kana').slice(0, 4);
  // The estimate follows the real session (the 8 most urgent words), not everything that is due.
  const est = reviewEstimate(due.length);
  const line = due.length > est.items ? t('{a} of {n} words today · about {m} min', { a: est.items, n: due.length, m: est.minutes })
    : t(due.length === 1 ? '{n} word to refresh · about {m} min' : '{n} words to refresh · about {m} min', { n: due.length, m: est.minutes });
  return html`<section class="card review-card">
    <div class="review-head"><div class="review-icon">${icon('refresh', 22)}</div>
      <div><b>${t('Today\'s review')}</b><span>${line}</span></div></div>
    ${words.length ? html`<p class="review-words">${words.map((w) => html`<span class="jp">${w.jp}</span>`)}${due.length > words.length ? html`<span class="muted">+${due.length - words.length}</span>` : ''}</p>` : ''}
    <button class="btn btn-secondary btn-block start-review">${t('Review now')}</button>
  </section>`;
}

// What XP and the daily goal are, with a quick way to change the goal.
const GOALS = [[10, 'Casual', '1 lesson'], [20, 'Regular', '2 lessons'], [30, 'Serious', '3 lessons'], [50, 'Intense', '5 lessons']];
const goalName = (v) => t(GOALS.find((g) => g[0] === v)?.[1] || 'Regular');
function explainGoal() {
  const { state } = app;
  const xp = todayXp(state, app.now());
  const suggested = suggestGoal(state, app.now());
  const render = () => html`<div class="goal-help">
    <h2>${t('Daily goal')}</h2>
    <p><b>XP</b> ${t('(experience points) measure how much you practised. Today:')} <b class="goal-today">${xp} / ${state.dailyGoal} XP</b>.</p>
    <ul>
      <li>${icon('star', 16)} ${t('Each lesson or practice:')} <b>+10 XP</b></li>
      <li>${icon('check', 16)} ${t('No mistakes:')} <b>+5 XP</b></li>
      <li>${icon('bolt', 16)} ${t('Answers in under half the time:')} <b>+1 XP</b> ${t('each, up to')} <b>+5 XP</b> ${t('speed bonus')}</li>
    </ul>
    <p>${t('Reach your goal to earn')} <b>+5 ${t('gems')}</b>. ${t('Studying any amount each day keeps your 🔥 streak going.')}</p>
    ${suggested ? html`<p class="goal-suggest">${icon('bolt', 16)} ${t('Based on your last 7 days, {name} ({v} XP) would fit you.', { name: goalName(suggested), v: suggested })}</p>` : ''}
    <p class="muted small">${t('Choose your goal:')}</p>
    <div class="goal-choices">${GOALS.map(([v, name, hint]) => html`<button class="goal-choice ${state.dailyGoal === v ? 'on' : ''} ${suggested === v ? 'suggested' : ''}" data-goal="${v}"><b>${t(name)}</b><small>${v} XP · ${t(hint)}</small></button>`)}</div>
  </div>`;
  // The path behind shows the new goal once the sheet is closed.
  modal(render(), [{ label: t('Got it'), kind: 'secondary', onClick: () => window.dispatchEvent(new HashChangeEvent('hashchange')) }]);
  const wire = () => $$('#modal .goal-choice').forEach((b) => b.addEventListener('click', () => {
    state.dailyGoal = Number(b.dataset.goal);
    app.save();
    $$('#modal .goal-choice').forEach((x) => x.classList.toggle('on', x === b));
    $('#modal .goal-today').textContent = `${xp} / ${state.dailyGoal} XP`;
  }));
  wire();
}

function nodeState(node, current, now) {
  const { state } = app;
  if (node.index === current) return 'current';
  if (!isNodeUnlocked(state, node)) return 'locked';
  if (nodeNeedsReview(state, node, now)) return 'stale';
  return 'done';
}

function nodeIcon(node, st) {
  if (st === 'locked') return node.kind === 'chest' ? icon('chest', 34) : node.kind === 'review' ? icon('trophy', 34) : icon('lock', 30);
  if (node.kind === 'chest') return icon('chest', 36);
  if (node.kind === 'review') return icon('trophy', 36);
  if (st === 'done' && nodeLevel(app.state, node) >= MAX_LEVEL) return icon('star', 34);
  if (node.kind === 'read' || node.kind === 'kanji') return html`<span class="node-kana jp">${ITEMS.get(node.items[0]).jp}</span>`;
  if (node.kind === 'story') return icon('story', 36);
  if (node.icon === 'art' && node.art) return art(node.art, 'node-art');
  return icon(node.icon === 'chat' ? 'chat' : 'star', 34);
}

// Titles of the structural nodes, in the interface language (the course's own titles are content).
const nodeTitle = (node) => (node.kind === 'chest' ? t('Treasure chest') : node.kind === 'review' ? t('Unit review') : node.kind === 'story' ? t('Story time') : node.title);

function levelPips(node) {
  if (!['lesson', 'read', 'kanji'].includes(node.kind) || !isNodeDone(app.state, node)) return '';
  const level = nodeLevel(app.state, node);
  return html`<span class="pips" aria-hidden="true">${Array.from({ length: MAX_LEVEL }, (_, i) => html`<i class="${i < level ? 'on' : ''}"></i>`)}</span>`;
}

// What a screen reader says for a node: its name, then where it stands (the colours say the same to the eye).
function nodeLabel(node, st) {
  const status = t(st === 'locked' ? 'locked' : st === 'current' ? 'current lesson' : st === 'stale' ? 'needs review' : 'completed');
  const lvl = st !== 'locked' && st !== 'current' && ['lesson', 'read', 'kanji'].includes(node.kind) ? nodeLevel(app.state, node) : 0;
  return `${nodeTitle(node)}, ${status}${lvl ? `, ${t('Level {a} of {b}', { a: lvl, b: MAX_LEVEL })}` : ''}`;
}

function renderNode(node, i, current, now, firstRun) {
  const st = nodeState(node, current, now);
  const offset = OFFSETS[i % OFFSETS.length];
  const showCheer = st === 'current' && node.kind !== 'chest';
  const cheer = CHEERS[node.index % CHEERS.length];
  const side = offset > 0 ? 'left' : 'right';
  // Every few steps the path crosses a little stream on a red garden bridge (drawn by drawTrails).
  const k = node.unit.nodes.indexOf(node);
  const stream = k % 4 === 2 && k < node.unit.nodes.length - 1;
  return html`<div class="node-row ${stream ? 'stream-after' : ''}" style="--x:${offset}px">
    ${showCheer ? html`<div class="node-mascot ${side} ${firstRun ? 'first-run' : ''}">
      ${firstRun ? html`<div class="bubble"><b>${t('Tap the green circle to start — about 3 minutes')}</b></div>`
        : html`<div class="bubble"><b class="jp">${cheer[0]}</b><small>${cheer[1]}</small></div>`}${mascot('happy', 64)}</div>`
      : html`<div class="decor-slot ${side}">${decorFor(i)}</div>`}
    <div class="node-wrap">
      ${st === 'current' ? html`<div class="start-bubble" aria-hidden="true">${t(node.kind === 'chest' ? 'OPEN' : 'START')}</div>` : ''}
      <button class="node node-${node.kind} st-${st} c-${node.unit.color}" data-node="${node.id}" aria-label="${nodeLabel(node, st)}" ${st === 'locked' ? raw('aria-disabled="true"') : ''} ${st === 'current' ? raw('aria-current="step"') : ''}>
        ${nodeIcon(node, st)}
        ${st === 'stale' ? html`<span class="node-badge" aria-hidden="true">${icon('refresh', 14)}</span>` : ''}
        ${st === 'done' && node.kind !== 'chest' ? html`<span class="node-check" aria-hidden="true">${icon('check', 14)}</span>` : ''}
      </button>
      ${levelPips(node)}
      ${node.kind === 'review' ? html`<div class="node-label">${t('{unit} trophy', { unit: node.unit.title })}</div>` : ''}
    </div>
  </div>`;
}

function unitGuide(unit) {
  const ids = [...new Set(unit.nodes.flatMap((n) => [...(n.items || []), ...(n.readWords || [])]))];
  const items = ids.map((id) => ITEMS.get(id)).filter((it) => it.type !== 'dialogue');
  modal(
    html`<p class="unit-kicker guide-kicker">${t('Section {n} – Unit {m}', { n: unit.nodes[0].sectionIndex + 1, m: unit.nodes[0].unitIndex + 1 })}</p><h2>${unit.title}</h2><p class="muted">${t('Tap any card to hear it.')}</p>
    <div class="guide">${items.map((it) => html`<button class="guide-card ${it.type}" data-say="${speechOf(it)}">
      ${it.art ? art(it.art, 'art-guide') : ''}
      <span class="guide-jp fit">${jpItem(it, it.type === 'word' || it.type === 'sentence' || it.type === 'kword')}</span>
      ${it.type === 'kana' ? html`<span class="guide-romaji">${it.romaji}</span>${it.example ? html`<span class="guide-ex">${t('as in')} <b class="jp">${it.example.jp}</b> ${it.example.romaji}</span>` : ''}` : ''}
      ${it.en ? html`<span class="guide-en">${it.en}</span>` : ''}
      ${it.hint || it.note || it.story ? html`<span class="guide-hint">${it.note || it.story || it.hint}</span>` : ''}
    </button>`)}</div>`,
    [{ label: t('Close'), kind: 'secondary' }],
  );
  $$('#modal [data-say]').forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  fitText($('#modal'));
}

function nodePopover(nodeEl, node, st) {
  document.querySelector('.popover')?.remove();
  if (st === 'locked') {
    toast(t('Finish the steps above to unlock this.'));
    return;
  }
  if (node.kind === 'chest') {
    if (isNodeDone(app.state, node)) return toast(t('You already opened this chest.'));
    const gems = openChest(app.state, node);
    app.save();
    rewardPopup({ kind: 'chest', title: t('Treasure!'), reward: html`${icon('gem', 30)} +${gems} ${t('gems')}`, onDone: () => app.go('#/learn') });
    return;
  }
  const level = nodeLevel(app.state, node);
  const hearts = currentHearts(app.state, app.now());
  const isReview = node.kind === 'review';
  const sub = t(isReview
    ? (level ? 'Trophy earned — review the whole unit again' : 'Review everything in this unit to earn the trophy')
    : st === 'stale'
      ? 'Some of this is fading. A quick refresh will lock it in.'
      : level >= MAX_LEVEL ? 'Legendary! Keep it fresh with a replay.' : level ? '' : 'New lesson') || t('Level {a} of {b}', { a: level, b: MAX_LEVEL });
  const label = t(level ? (level >= MAX_LEVEL && !isReview ? 'Replay +10 XP' : 'Practice +10 XP') : 'Start +10 XP');
  // Before a new lesson, a nudge when many words are fading: a short review first keeps them.
  const due = dueItemIds(app.state, app.now()).filter((id) => app.state.items[id].seen > 0).length;
  const nudge = !level && !isReview && due >= REVIEW_FIRST_MIN;
  const pop = document.createElement('div');
  pop.className = `popover c-${node.unit.color}`;
  mount(pop, html`<small class="pop-kicker">${t('Section {n} – Unit {m}', { n: node.sectionIndex + 1, m: node.unitIndex + 1 })}</small><b>${nodeTitle(node)}</b><span>${sub}</span>
    ${nudge ? html`<span class="pop-nudge">${icon('refresh', 14)} ${t('{n} words are fading — review first?', { n: due })}</span>` : ''}
    <button class="btn btn-white btn-block go-node">${hearts > 0 || level === 0 ? label : t('No hearts — practice to refill')}</button>
    ${nudge ? html`<button class="btn btn-ghost btn-block pop-review">${t('Review first')} · ${t('about {m} min', { m: reviewEstimate(due).minutes })}</button>` : ''}`);
  nodeEl.closest('.node-wrap').append(pop);
  // Place the popover under its node but always fully on screen (nodes sit left or right on the path).
  const wrap = nodeEl.closest('.node-wrap').getBoundingClientRect();
  const width = pop.offsetWidth;
  const margin = 12;
  const left = Math.min(Math.max(wrap.left + wrap.width / 2 - width / 2, margin), document.documentElement.clientWidth - margin - width);
  pop.style.left = `${left - wrap.left}px`;
  pop.style.transform = 'none';
  // Hearts are only at stake when replaying a finished node, so a new node can always be started.
  pop.querySelector('.go-node').addEventListener('click', () => app.go(hearts > 0 || level === 0 ? `#/lesson/${node.id}` : '#/practice'));
  pop.querySelector('.pop-review')?.addEventListener('click', () => app.go('#/practice/go'));
}

// The unit's headline goal: its mission. Locked until the unit's lessons are done, then ready, then starred.
const missionOf = (unit) => MISSIONS.find((m) => m.unit === unit.id);
const starsText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
function unitGoal(unit, state) {
  const m = missionOf(unit);
  if (!m) return '';
  const stars = state.missions[m.id] || 0;
  const open = unitLessonsDone(state, unit);
  return html`<span class="unit-goal ${stars ? 'done' : open ? 'ready' : 'locked'}">${stars ? html`<b>${starsText(stars)}</b>` : open ? '🎯' : '🔒'} ${t('Goal:')} ${m.title}</span>`;
}
// When the unit's lessons are done the mission appears right under its path.
function missionOnPath(unit, state) {
  const m = missionOf(unit);
  if (!m || !unitLessonsDone(state, unit)) return '';
  const stars = state.missions[m.id] || 0;
  return html`<a class="card mission-path ${stars ? 'done' : 'ready'}" href="#/mission/${m.id}">${art(m.art, 'art-col')}
    <div><b>${t('Mission: {title}', { title: m.title })}</b><small>${stars ? t('Best: {s} — play again for 3 stars', { s: starsText(stars) }) : t('You know enough to do this for real. Try it!')}</small></div>
    <span class="btn ${stars ? 'btn-secondary' : 'btn-primary'}">${t(stars ? 'Replay' : 'Play')}</span></a>`;
}

// Jump ahead: play the unit's review; 85% or better marks its lessons as played.
function testOutSheet(unit) {
  const review = unitReview(unit);
  if (!review) return;
  modal(html`<div class="center"><h2>${t('Know this already?')}</h2>
    <p class="muted">${t('Play the review of “{unit}” without doing its lessons first. Score {n}% or more and its lessons count as played.', { unit: unit.title, n: Math.round(TESTOUT_PASS * 100) })}</p>
    <p class="muted small">${t('No hearts are lost, and nothing is lost if you do not pass.')}</p></div>`, [
    { label: t('Test out'), onClick: () => app.go(`#/lesson/${review.id}/testout`) },
    { label: t('Not now'), kind: 'secondary' },
  ]);
}

// Once a week: what the last 7 days added up to, and the words that need the most love.
function recapCard(state, now) {
  if (!showRecap(state, now)) return '';
  const r = weeklyRecap(state, now);
  const goal = suggestGoal(state, now);
  const words = r.weakest.map((id) => ITEMS.get(id)).filter(Boolean);
  const accuracyTone = r.accuracy == null ? '' : r.accuracy < 70 ? 'low' : '';
  return html`<section class="card recap-card">
    <div class="recap-head"><b>${icon('star', 18)} ${t('Your week')}</b><button class="link recap-dismiss">${t('Got it')}</button></div>
    <div class="recap-tiles">
      <div><b>${r.newWords}</b><small>${t('new words')}</small></div>
      <div class="${accuracyTone}"><b>${r.accuracy == null ? '–' : `${r.accuracy}%`}</b><small>${t('accuracy')}</small></div>
      <div><b>${r.daysStudied}/7</b><small>${t('days studied')}</small></div>
      <div><b>${r.streak}</b><small>${t('day streak')}</small></div>
    </div>
    ${words.length ? html`<p class="recap-weak"><small>${t('Needs the most love:')}</small> ${words.map((w) => html`<span class="chip jp">${w.jp}</span>`)}</p>` : ''}
    ${goal ? html`<p class="recap-goal"><small>${t('You study about {xp} XP on the days you do. Try the {name} goal?', { xp: Math.round(r.xp / Math.max(1, r.daysStudied)), name: goalName(goal) })}</small>
      <button class="btn btn-secondary btn-small set-goal" data-goal="${goal}">${goalName(goal)} · ${goal} XP</button></p>` : ''}
  </section>`;
}

// Once per launch: how many words are waiting, when the learner has been away.
let welcomed = false;
function welcomeBack(state, now) {
  if (welcomed) return;
  welcomed = true;
  const due = dueItemIds(state, now).filter((id) => state.items[id].seen > 0).length;
  if (due < 5 || studiedToday(state, now) || !state.stats.lessons) return;
  toast(t('Welcome back! {n} words are ready to review.', { n: due }), { action: t('Review'), onAction: () => app.go('#/practice/go'), ms: 7000 });
}

export function renderLearn(root) {
  const now = app.now();
  const { state } = app;
  const current = currentNodeIndex(state);
  const xp = todayXp(state, now);
  const goal = state.dailyGoal;
  let n = 0;
  const firstRun = state.stats.lessons === 0;

  mount(root, html`<header class="topbar">${statsBar()}</header>
  <main class="page learn">
    <h1 class="sr-only">${t('Learn')}</h1>
    <section class="card goal-card" role="button" tabindex="0" aria-label="${t('About the daily goal')}">
      <div class="goal-icon">${icon('bolt', 22)}</div>
      <div class="goal-text"><b>${t('Daily goal')}</b><span>${Math.min(xp, goal)} / ${goal} XP</span></div>
      ${xp >= goal ? html`<span class="pill pill-gold">${icon('check', 14)} ${t('Done!')}</span>` : ''}
      <div class="bar"><div class="bar-fill" style="width:${Math.min(100, (xp / goal) * 100)}%"></div></div>
    </section>
    ${reviewCard(state, now)}
    ${recapCard(state, now)}
    ${SECTIONS.map((section, s) => html`
      <h2 class="section-title"><span>${t('Section {n}', { n: s + 1 })}</span>${section.title}</h2>
      ${section.units.map((unit, u) => html`
        <section class="unit" id="unit-${unit.id}">
          <div class="unit-banner c-${unit.color}">
            <div><span class="unit-kicker">${t('Section {n} – Unit {m}', { n: s + 1, m: u + 1 })}</span><h3>${unit.title}</h3><p>${unit.desc}</p>${unitGoal(unit, state)}</div>
            <div class="banner-btns">
              <button class="btn-guide" data-guide="${unit.id}">${icon('book', 18)}<span>${t('Guide')}</span></button>
              ${unitIsLocked(state, unit) && unitReview(unit) ? html`<button class="btn-guide btn-testout" data-testout="${unit.id}">${icon('arrow', 18)}<span>${t('Jump here')}</span></button>` : ''}
            </div>
          </div>
          <div class="track">${unit.nodes.map((node) => renderNode(node, n++, current, now, firstRun && node.index === 0))}</div>
          ${missionOnPath(unit, state)}
        </section>`)}`)}
    <div class="path-end">${raw(ROADBLOCK)}<p><b>${t(current >= n ? 'You finished every lesson!' : 'Road under construction')}</b><br>${current >= n ? t('More units are coming — keep practising.') : t('More units are on the way: phrases, {what} and conversations.', { what: L.latin ? t('grammar') : L.chars })}</p></div>
  </main>`);

  $$('.node', root).forEach((el) =>
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const node = NODE_BY_ID.get(el.dataset.node);
      nodePopover(el, node, [...el.classList].find((c) => c.startsWith('st-')).slice(3));
    }),
  );
  root.addEventListener('click', () => document.querySelector('.popover')?.remove());
  $('.start-review', root)?.addEventListener('click', () => app.go('#/practice/go'));
  $('.goal-card', root).addEventListener('click', explainGoal);
  $('.goal-card', root).addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    explainGoal();
  });
  $$('[data-guide]', root).forEach((b) =>
    b.addEventListener('click', () => unitGuide(SECTIONS.flatMap((s) => s.units).find((u) => u.id === b.dataset.guide))),
  );
  $$('[data-testout]', root).forEach((b) =>
    b.addEventListener('click', () => testOutSheet(SECTIONS.flatMap((s) => s.units).find((u) => u.id === b.dataset.testout))),
  );
  $('.recap-dismiss', root)?.addEventListener('click', () => {
    state.recapWeek = weekKey(now);
    app.save();
    $('.recap-card', root)?.remove();
  });
  $('.set-goal', root)?.addEventListener('click', (e) => {
    state.dailyGoal = Number(e.currentTarget.dataset.goal);
    state.recapWeek = weekKey(now);
    app.save();
    renderLearn(root);
  });

  // Bring the current node into view on first paint (the path is long: a new learner starts at the top, a
  // returning one where they left off). Done now, so there is no jump, and again once the trails are drawn.
  const target = $('.st-current', root) || $('.unit', root);
  const reveal = () => target?.scrollIntoView({ block: 'center' });
  reveal();
  requestAnimationFrame(() => {
    drawTrails(root);
    reveal();
  });
  welcomeBack(state, now);
  document.fonts?.ready.then(() => drawTrails(root));
}

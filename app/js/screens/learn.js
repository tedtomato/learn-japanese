// The learning path: sections → unit banners → winding track of lesson nodes.
import { SECTIONS, ITEMS, MAX_LEVEL, NODE_BY_ID } from '../course.js';
import { jpItem, speechOf } from '../lesson/text.js';
import { rewardPopup } from '../fx.js';
import { decorFor, drawTrails } from '../scenery.js';
import { app, statsBar, toast, modal } from '../app.js';
import { html, mount, $, $$, fitText } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { speak } from '../audio.js';
import { art } from '../art.js';
import {
  currentNodeIndex, nodeLevel, isNodeDone, isNodeUnlocked, nodeNeedsReview, openChest, todayXp, currentHearts, dueItemIds,
} from '../progress.js';

const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];
const CHEERS = [['がんばって！', 'You can do it!'], ['いいね！', 'Nice!'], ['すごい！', 'Amazing!'], ['ファイト！', 'Keep going!']];

// Words learned before that are due again today (spaced repetition), with a one-tap review.
function reviewCard(state, now) {
  const due = dueItemIds(state, now).filter((id) => state.items[id].seen > 0);
  if (!due.length) return '';
  const words = due.map((id) => ITEMS.get(id)).filter((it) => it && it.type !== 'kana').slice(0, 4);
  const minutes = Math.max(1, Math.round(Math.min(due.length, 8) * 0.3));
  return html`<section class="card review-card">
    <div class="review-head"><div class="review-icon">${icon('refresh', 22)}</div>
      <div><b>Today's review</b><span>${due.length} ${due.length === 1 ? 'word' : 'words'} to refresh · about ${minutes} min</span></div></div>
    ${words.length ? html`<p class="review-words">${words.map((w) => html`<span class="jp">${w.jp}</span>`)}${due.length > words.length ? html`<span class="muted">+${due.length - words.length}</span>` : ''}</p>` : ''}
    <button class="btn btn-secondary btn-block start-review">Review now</button>
  </section>`;
}

// What XP and the daily goal are, with a quick way to change the goal.
const GOALS = [[10, 'Casual', '1 lesson'], [20, 'Regular', '2 lessons'], [30, 'Serious', '3 lessons'], [50, 'Intense', '5 lessons']];
function explainGoal() {
  const { state } = app;
  const xp = todayXp(state, app.now());
  const render = () => html`<div class="goal-help">
    <h2>Daily goal</h2>
    <p><b>XP</b> (experience points) measure how much you practised. Today: <b class="goal-today">${xp} / ${state.dailyGoal} XP</b>.</p>
    <ul>
      <li>${icon('star', 16)} Each lesson or practice: <b>+10 XP</b></li>
      <li>${icon('check', 16)} No mistakes: <b>+5 XP</b></li>
      <li>${icon('bolt', 16)} Quick answers: up to <b>+10 XP</b> speed bonus</li>
    </ul>
    <p>Reach your goal to earn <b>+5 gems</b>. Studying any amount each day keeps your 🔥 streak going.</p>
    <p class="muted small">Choose your goal:</p>
    <div class="goal-choices">${GOALS.map(([v, name, hint]) => html`<button class="goal-choice ${state.dailyGoal === v ? 'on' : ''}" data-goal="${v}"><b>${name}</b><small>${v} XP · ${hint}</small></button>`)}</div>
  </div>`;
  // The path behind shows the new goal once the sheet is closed.
  modal(render(), [{ label: 'Got it', kind: 'secondary', onClick: () => window.dispatchEvent(new HashChangeEvent('hashchange')) }]);
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

function levelPips(node) {
  if (!['lesson', 'read', 'kanji'].includes(node.kind) || !isNodeDone(app.state, node)) return '';
  const level = nodeLevel(app.state, node);
  return html`<span class="pips" aria-label="Level ${level} of ${MAX_LEVEL}">${Array.from({ length: MAX_LEVEL }, (_, i) => html`<i class="${i < level ? 'on' : ''}"></i>`)}</span>`;
}

function renderNode(node, i, current, now) {
  const st = nodeState(node, current, now);
  const offset = OFFSETS[i % OFFSETS.length];
  const showCheer = st === 'current' && node.kind !== 'chest';
  const cheer = CHEERS[node.index % CHEERS.length];
  const side = offset > 0 ? 'left' : 'right';
  // Every few steps the path crosses a little stream on a red garden bridge (drawn by drawTrails).
  const k = node.unit.nodes.indexOf(node);
  const stream = k % 4 === 2 && k < node.unit.nodes.length - 1;
  return html`<div class="node-row ${stream ? 'stream-after' : ''}" style="--x:${offset}px">
    ${showCheer ? html`<div class="node-mascot ${side}">
      <div class="bubble"><b class="jp">${cheer[0]}</b><small>${cheer[1]}</small></div>${mascot('happy', 64)}</div>`
      : html`<div class="decor-slot ${side}">${decorFor(i)}</div>`}
    <div class="node-wrap">
      ${st === 'current' ? html`<div class="start-bubble">${node.kind === 'chest' ? 'OPEN' : 'START'}</div>` : ''}
      <button class="node node-${node.kind} st-${st} c-${node.unit.color}" data-node="${node.id}" aria-label="${node.title}">
        ${nodeIcon(node, st)}
        ${st === 'stale' ? html`<span class="node-badge" title="Needs review">${icon('refresh', 14)}</span>` : ''}
        ${st === 'done' && node.kind !== 'chest' ? html`<span class="node-check">${icon('check', 14)}</span>` : ''}
      </button>
      ${levelPips(node)}
      ${node.kind === 'review' ? html`<div class="node-label">${node.unit.title} trophy</div>` : ''}
    </div>
  </div>`;
}

function unitGuide(unit) {
  const ids = [...new Set(unit.nodes.flatMap((n) => [...(n.items || []), ...(n.readWords || [])]))];
  const items = ids.map((id) => ITEMS.get(id)).filter((it) => it.type !== 'dialogue');
  modal(
    html`<h2>${unit.title}</h2><p class="muted">Tap any card to hear it.</p>
    <div class="guide">${items.map((it) => html`<button class="guide-card ${it.type}" data-say="${speechOf(it)}">
      ${it.art ? art(it.art, 'art-guide') : ''}
      <span class="guide-jp fit">${jpItem(it, it.type === 'word' || it.type === 'sentence' || it.type === 'kword')}</span>
      ${it.type === 'kana' ? html`<span class="guide-romaji">${it.romaji}</span>${it.example ? html`<span class="guide-ex">as in <b class="jp">${it.example.jp}</b> ${it.example.romaji}</span>` : ''}` : ''}
      ${it.en ? html`<span class="guide-en">${it.en}</span>` : ''}
      ${it.hint || it.note || it.story ? html`<span class="guide-hint">${it.note || it.story || it.hint}</span>` : ''}
    </button>`)}</div>`,
    [{ label: 'Close', kind: 'secondary' }],
  );
  $$('#modal [data-say]').forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  fitText($('#modal'));
}

function nodePopover(nodeEl, node, st) {
  document.querySelector('.popover')?.remove();
  if (st === 'locked') {
    toast('Finish the steps above to unlock this.');
    return;
  }
  if (node.kind === 'chest') {
    if (isNodeDone(app.state, node)) return toast('You already opened this chest.');
    const gems = openChest(app.state, node);
    app.save();
    rewardPopup({ kind: 'chest', title: 'Treasure!', reward: html`${icon('gem', 30)} +${gems} gems`, onDone: () => app.go('#/learn') });
    return;
  }
  const level = nodeLevel(app.state, node);
  const hearts = currentHearts(app.state, app.now());
  const isReview = node.kind === 'review';
  const sub = isReview
    ? (level ? 'Trophy earned — review the whole unit again' : 'Review everything in this unit to earn the trophy')
    : st === 'stale'
      ? 'Some of this is fading. A quick refresh will lock it in.'
      : level >= MAX_LEVEL ? 'Legendary! Keep it fresh with a replay.' : level ? `Level ${level} of ${MAX_LEVEL}` : 'New lesson';
  const label = level ? (level >= MAX_LEVEL && !isReview ? 'Replay +10 XP' : 'Practice +10 XP') : 'Start +10 XP';
  const pop = document.createElement('div');
  pop.className = `popover c-${node.unit.color}`;
  mount(pop, html`<small class="pop-kicker">Section ${node.sectionIndex + 1} – Unit ${node.unitIndex + 1}</small><b>${node.title}</b><span>${sub}</span>
    <button class="btn btn-white btn-block">${hearts > 0 ? label : 'No hearts — practice to refill'}</button>`);
  nodeEl.closest('.node-wrap').append(pop);
  // Place the popover under its node but always fully on screen (nodes sit left or right on the path).
  const wrap = nodeEl.closest('.node-wrap').getBoundingClientRect();
  const width = pop.offsetWidth;
  const margin = 12;
  const left = Math.min(Math.max(wrap.left + wrap.width / 2 - width / 2, margin), document.documentElement.clientWidth - margin - width);
  pop.style.left = `${left - wrap.left}px`;
  pop.style.transform = 'none';
  pop.querySelector('button').addEventListener('click', () => app.go(hearts > 0 ? `#/lesson/${node.id}` : '#/practice'));
}

export function renderLearn(root) {
  const now = app.now();
  const { state } = app;
  const current = currentNodeIndex(state);
  const xp = todayXp(state, now);
  const goal = state.dailyGoal;
  let n = 0;

  mount(root, html`<header class="topbar">${statsBar()}</header>
  <main class="page learn">
    <section class="card goal-card" role="button" tabindex="0" aria-label="About the daily goal">
      <div class="goal-icon">${icon('bolt', 22)}</div>
      <div class="goal-text"><b>Daily goal</b><span>${Math.min(xp, goal)} / ${goal} XP</span></div>
      ${xp >= goal ? html`<span class="pill pill-gold">${icon('check', 14)} Done!</span>` : ''}
      <div class="bar"><div class="bar-fill" style="width:${Math.min(100, (xp / goal) * 100)}%"></div></div>
    </section>
    ${reviewCard(state, now)}
    ${SECTIONS.map((section, s) => html`
      <h2 class="section-title"><span>Section ${s + 1}</span>${section.title}</h2>
      ${section.units.map((unit, u) => html`
        <section class="unit" id="unit-${unit.id}">
          <div class="unit-banner c-${unit.color}">
            <div><span class="unit-kicker">Unit ${u + 1}</span><h3>${unit.title}</h3><p>${unit.desc}</p></div>
            <button class="btn-guide" data-guide="${unit.id}">${icon('book', 18)}<span>Guide</span></button>
          </div>
          <div class="track">${unit.nodes.map((node) => renderNode(node, n++, current, now))}</div>
        </section>`)}`)}
    <div class="path-end">${mascot(current >= n ? 'cheer' : 'happy', 90)}<p>${current >= n ? 'You finished every lesson! More units are coming — keep practising.' : 'More units are on the way: katakana, kanji and conversations.'}</p></div>
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
  $$('[data-guide]', root).forEach((b) =>
    b.addEventListener('click', () => unitGuide(SECTIONS.flatMap((s) => s.units).find((u) => u.id === b.dataset.guide))),
  );

  const target = $('.st-current', root) || $('.unit', root);
  requestAnimationFrame(() => {
    drawTrails(root);
    target?.scrollIntoView({ block: 'center' });
  });
  document.fonts?.ready.then(() => drawTrails(root));
}

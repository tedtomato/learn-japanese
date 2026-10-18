// Plays a session of exercises: lessons from the path, or practice.
import { ITEMS, NODE_BY_ID, MAX_LEVEL } from '../course.js';
import { app, modal } from '../app.js';
import { html, mount, raw, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { speak, sfx, buzz, canSpeak } from '../audio.js';
import { generateLesson, generatePractice } from './generate.js';
import { completeSession, currentHearts, loseHeart, nodeLevel, isNodeUnlocked } from '../progress.js';
import { nextTidbit, tidbitCard } from '../tidbits.js';

const PRAISE = ['Nicely done!', 'Great job!', 'Correct!', 'Awesome!', 'すごい！', 'You got it!', 'Perfect!'];
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const say = (item) => item.text || item.jp;

// Text to show for an item in a given role.
function label(item, kind) {
  if (kind === 'romaji') return item.romaji;
  if (kind === 'en') return item.en;
  return item.jp;
}

export function startSession(root, { nodeId, itemIds } = {}) {
  const now = app.now();
  const node = nodeId ? NODE_BY_ID.get(nodeId) : null;
  if (nodeId && (!node || node.kind === 'chest' || !isNodeUnlocked(app.state, node))) return app.go('#/learn');
  const mode = node ? 'lesson' : 'practice';
  if (mode === 'lesson' && currentHearts(app.state, now) <= 0) return app.go('#/practice');

  const opts = { hasVoice: canSpeak(), now };
  const session = node
    ? generateLesson(node, app.state, { ...opts, level: nodeLevel(app.state, node) })
    : generatePractice(app.state, { ...opts, itemIds });
  if (!session.exercises.length) return app.go('#/practice');
  // Now and then, a fun fact or useful phrase as a short break halfway through.
  if (session.exercises.length >= 8 && Math.random() < 0.5) {
    session.exercises.splice(Math.floor(session.exercises.length / 2), 0, { type: 'tidbit', itemIds: [] });
  }

  const s = {
    node,
    mode,
    queue: [...session.exercises],
    total: session.exercises.length,
    done: 0,
    mistakes: 0,
    answered: 0,
    results: new Map(),
    startedAt: now,
    current: null,
    answer: null,
    checked: false,
  };
  app.inLesson = true;
  root.__session = s;
  renderShell(root, s);
  next(root, s);
}

function renderShell(root, s) {
  const level = s.node ? nodeLevel(app.state, s.node) : 0;
  mount(root, html`<div class="lesson">
    <header class="lesson-top">
      <button class="icon-btn quit" aria-label="Quit">${icon('close', 26)}</button>
      <div class="bar bar-lg"><div class="bar-fill" style="width:0%"></div></div>
      ${s.mode === 'lesson' ? html`<span class="stat stat-hearts">${icon('heart', 24)}<b class="hearts-n">${currentHearts(app.state, app.now())}</b></span>`
        : html`<span class="pill pill-blue">Practice</span>`}
    </header>
    ${s.node ? html`<div class="lesson-meta">${s.node.unit.title} · ${s.node.title}${s.node.kind === 'lesson' ? ` · Level ${Math.min(level + 1, MAX_LEVEL)}` : ''}</div>` : ''}
    <main class="lesson-body"></main>
    <footer class="lesson-foot"></footer>
  </div>`);
  $('.quit', root).addEventListener('click', () =>
    modal(html`<div class="center">${mascot('sad', 96)}<h2>Wait, don't go!</h2><p class="muted">You'll lose your progress in this lesson.</p></div>`, [
      { label: 'Keep learning' },
      { label: 'End session', kind: 'danger-ghost', onClick: () => quit() },
    ]),
  );
}

function quit() {
  app.inLesson = false;
  app.go(location.hash.startsWith('#/practice') ? '#/practice' : '#/learn');
}

function updateProgress(root, s) {
  $('.lesson-top .bar-fill', root).style.width = `${(s.done / s.total) * 100}%`;
  const h = $('.hearts-n', root);
  if (h) h.textContent = currentHearts(app.state, app.now());
}

function next(root, s) {
  updateProgress(root, s);
  s.current = s.queue.shift();
  s.answer = null;
  s.checked = false;
  s.keyHandler = null;
  if (!s.current) return finish(root, s);
  const body = $('.lesson-body', root);
  body.classList.remove('enter');
  void body.offsetWidth;
  body.classList.add('enter');
  RENDERERS[s.current.type](root, s);
}

// ---------- Footer: check / feedback ----------
function footer(root, s, { canCheck = false, onCheck, text = 'Check', skip } = {}) {
  const foot = $('.lesson-foot', root);
  foot.className = 'lesson-foot';
  mount(foot, html`<div class="foot-inner">
    ${skip ? html`<button class="btn btn-ghost skip">${skip}</button>` : ''}
    <button class="btn btn-primary check" ${canCheck ? '' : 'disabled'}>${text}</button></div>`);
  $('.check', foot).addEventListener('click', onCheck);
  $('.skip', foot)?.addEventListener('click', () => {
    s.done += 1;
    next(root, s);
  });
}

const setCheckEnabled = (root, on) => ($('.lesson-foot .check', root).disabled = !on);

function record(s, ids, ok) {
  for (const id of ids) {
    const r = s.results.get(id) || { right: 0, wrong: 0 };
    r[ok ? 'right' : 'wrong'] += 1;
    s.results.set(id, r);
  }
}

function feedback(root, s, ok, { answerText, meaning } = {}) {
  s.checked = true;
  s.answered += 1;
  const ex = s.current;
  record(s, ex.itemIds, ok);
  if (ok) {
    s.done += 1;
    sfx('correct');
  } else {
    s.mistakes += 1;
    sfx('wrong');
    buzz();
    s.queue.push({ ...ex, retry: true });
    if (s.mode === 'lesson') {
      loseHeart(app.state, app.now());
      app.save();
    }
  }
  updateProgress(root, s);
  const outOfHearts = s.mode === 'lesson' && currentHearts(app.state, app.now()) <= 0;
  const foot = $('.lesson-foot', root);
  foot.className = `lesson-foot ${ok ? 'good' : 'bad'}`;
  mount(foot, html`<div class="foot-inner feedback">
    <div class="fb-text">
      <span class="fb-icon">${icon(ok ? 'check' : 'close', 26)}</span>
      <div><b>${ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : 'Correct answer:'}</b>
      ${!ok && answerText ? html`<p class="jp-mix">${answerText}</p>` : ''}
      ${meaning ? html`<p class="fb-meaning">${meaning}</p>` : ''}</div>
    </div>
    <button class="btn ${ok ? 'btn-primary' : 'btn-danger'} check">${ok ? 'Continue' : 'Got it'}</button></div>`);
  $('.check', foot).focus({ preventScroll: true });
  $('.check', foot).addEventListener('click', () => (outOfHearts ? noHearts(root, s) : next(root, s)));
}

function noHearts(root, s) {
  modal(html`<div class="center">${mascot('sad', 100)}<h2>Out of hearts</h2><p class="muted">Hearts refill over time. A practice session earns one back right away — and practice never costs hearts.</p></div>`, [
    { label: 'Practice to earn hearts', onClick: () => { app.inLesson = false; app.go('#/practice/go'); } },
    { label: 'End lesson', kind: 'danger-ghost', onClick: () => quit() },
  ], { dismissable: false });
}

// ---------- Prompts ----------
function speakerButtons(text) {
  return html`<div class="speakers">
    <button class="speaker" data-say="${text}" aria-label="Play">${icon('speaker', 40)}</button>
    <button class="speaker slow" data-say="${text}" data-slow="1" aria-label="Play slowly">${icon('turtle', 30)}</button></div>`;
}

function promptBubble(content) {
  return html`<div class="prompt">${mascot('happy', 84)}<div class="bubble bubble-lg">${content}</div></div>`;
}

function jpPrompt(item, hint) {
  const big = item.type === 'kana';
  return promptBubble(html`<button class="say-inline" data-say="${say(item)}" aria-label="Play">${icon('speaker', 22)}</button>
    <div><div class="jp ${big ? 'jp-huge' : 'jp-lg'}">${item.type === 'sentence' ? item.jp.join('') : item.jp}</div>
    ${hint ? html`<div class="romaji-hint">${item.romaji}</div>` : ''}</div>`);
}

function wirePlay(root) {
  $$('[data-say]', root).forEach((b) =>
    b.addEventListener('click', () => speak(b.dataset.say, { slow: !!b.dataset.slow })),
  );
}

// ---------- Exercise renderers ----------
function renderIntro(root, s) {
  const item = ITEMS.get(s.current.itemId);
  const kindLabel = { kana: 'New character', word: 'New word', sentence: 'New phrase' }[item.type];
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-gold">${icon('star', 14)} ${kindLabel}</span></p>
    <div class="intro-card card">
      <div class="jp ${item.type === 'kana' ? 'jp-giant' : 'jp-xl'}">${item.type === 'sentence' ? item.jp.join('') : item.jp}</div>
      <div class="intro-romaji">${item.romaji}</div>
      ${item.en ? html`<div class="intro-en">${item.emoji ? html`<span class="emoji">${item.emoji}</span>` : ''}${item.en}</div>` : ''}
      ${item.hint ? html`<p class="intro-hint">💡 ${item.hint}</p>` : ''}
      ${speakerButtons(say(item))}
    </div>`);
  wirePlay(root);
  speak(say(item));
  footer(root, s, {
    canCheck: true,
    text: 'Continue',
    onCheck: () => {
      s.done += 1;
      next(root, s);
    },
  });
}

function renderChoice(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  let prompt;
  if (ex.prompt === 'jp') prompt = jpPrompt(item, ex.hint);
  else if (ex.prompt === 'audio') prompt = speakerButtons(say(item));
  else if (ex.prompt === 'romaji') prompt = promptBubble(html`<div class="romaji-big">${item.romaji}</div>`);
  else prompt = promptBubble(html`<div class="en-prompt">${item.emoji ? html`<span class="emoji">${item.emoji}</span>` : ''}${item.en}</div>`);
  const jpOptions = ex.answerKind === 'kana' || ex.answerKind === 'jp';
  const grid = ex.answerKind === 'kana' || ex.answerKind === 'romaji';

  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${prompt}
    <div class="options ${grid ? 'grid' : 'list'}">${ex.options.map((id, i) => {
      const opt = ITEMS.get(id);
      return html`<button class="option" data-id="${id}"><span class="key">${i + 1}</span>
        <span class="${jpOptions ? 'jp' : ''} opt-label ${ex.answerKind === 'kana' ? 'jp-lg' : ''}">${label(opt, ex.answerKind)}</span>
        ${jpOptions && ex.hint && opt.type !== 'kana' ? html`<small class="opt-romaji">${opt.romaji}</small>` : ''}</button>`;
    })}</div>`);
  wirePlay(root);
  if (ex.prompt === 'audio' || (ex.prompt === 'jp' && item.type !== 'kana')) speak(say(item));

  const choose = (btn) => {
    if (s.checked) return;
    $$('.option', root).forEach((b) => b.classList.toggle('selected', b === btn));
    s.answer = btn.dataset.id;
    sfx('tap');
    if (jpOptions) speak(say(ITEMS.get(s.answer)));
    setCheckEnabled(root, true);
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => choose(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) choose(b);
  };
  footer(root, s, {
    skip: ex.prompt === 'audio' ? "Can't listen now" : null,
    onCheck: () => {
      const ok = s.answer === ex.itemId;
      $$('.option', root).forEach((b) => {
        b.disabled = true;
        if (b.dataset.id === ex.itemId) b.classList.add('right');
        else if (b.dataset.id === s.answer) b.classList.add('wrong');
      });
      speak(say(item));
      const meaning = item.en && ex.answerKind !== 'en' ? `${item.jp} = ${item.en}` : item.type === 'kana' ? `${item.jp} = ${item.romaji}` : null;
      feedback(root, s, ok, { answerText: label(item, ex.answerKind), meaning });
    },
  });
}

function tileButton(ex, i, jpTiles, extra = '') {
  const sub = ex.tileRomaji?.[i];
  return html`<button class="tile ${extra} ${jpTiles ? 'jp' : ''}" data-i="${i}">${ex.tiles[i]}${sub ? html`<small class="tile-romaji">${sub}</small>` : ''}</button>`;
}

function renderBuild(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const jpTiles = ex.mode !== 'jp2en';
  let prompt;
  if (ex.mode === 'jp2en') prompt = jpPrompt(item, ex.hint);
  else if (ex.mode === 'audio') prompt = speakerButtons(say(item));
  else prompt = promptBubble(html`<button class="say-inline" data-say="${say(item)}" aria-label="Play">${icon('speaker', 22)}</button>
    <div class="en-prompt">${item.emoji ? html`<span class="emoji">${item.emoji}</span>` : ''}${item.en}
    ${ex.hint && ex.mode === 'spell' ? html`<div class="romaji-hint">${item.romaji}</div>` : ''}</div>`);

  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${prompt}
    <div class="answer-line" aria-label="Your answer"></div>
    <div class="bank">${ex.tiles.map((t, i) => tileButton(ex, i, jpTiles))}</div>`);
  wirePlay(root);
  if (ex.mode !== 'spell' && ex.mode !== 'en2jp') speak(say(item));

  const placed = [];
  const line = $('.answer-line', root);
  const redraw = () => {
    mount(line, html`${placed.map((i) => tileButton(ex, i, jpTiles, 'placed'))}`);
    $$('.bank .tile', root).forEach((b) => b.classList.toggle('used', placed.includes(Number(b.dataset.i))));
    $$('.tile.placed', line).forEach((b) =>
      b.addEventListener('click', () => {
        if (s.checked) return;
        placed.splice(placed.indexOf(Number(b.dataset.i)), 1);
        redraw();
      }),
    );
    setCheckEnabled(root, placed.length > 0);
  };
  $$('.bank .tile', root).forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (s.checked || placed.includes(i)) return;
      placed.push(i);
      sfx('tap');
      if (jpTiles) speak(ex.tiles[i]);
      redraw();
    }),
  );
  footer(root, s, {
    skip: ex.mode === 'audio' ? "Can't listen now" : null,
    onCheck: () => {
      const given = placed.map((i) => ex.tiles[i]);
      const sep = jpTiles ? '' : ' ';
      const ok = norm(given.join(sep)) === norm(ex.answer.join(sep));
      line.classList.add(ok ? 'right' : 'wrong');
      speak(say(item));
      const answerText = jpTiles ? ex.answer.join('') : ex.answer.join(' ');
      const meaning = ex.mode === 'jp2en' ? `${item.romaji}` : `${item.romaji} — ${item.en}`;
      feedback(root, s, ok, { answerText, meaning });
    },
  });
}

function renderMatch(root, s) {
  const ex = s.current;
  const left = ex.pairs;
  const right = [...ex.pairs].sort(() => Math.random() - 0.5);
  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    <div class="match">
      <div class="match-col">${left.map((id) => html`<button class="option match-btn jp" data-side="l" data-id="${id}">${ITEMS.get(id).jp}${ex.hint ? html`<small class="opt-romaji">${ITEMS.get(id).romaji}</small>` : ''}</button>`)}</div>
      <div class="match-col">${right.map((id) => html`<button class="option match-btn" data-side="r" data-id="${id}">${label(ITEMS.get(id), ex.right)}</button>`)}</div>
    </div>`);
  const sel = { l: null, r: null };
  const wrongIds = new Set();
  let matched = 0;
  footer(root, s, { canCheck: false, text: 'Check', onCheck: () => {} });
  $$('.match-btn', root).forEach((b) =>
    b.addEventListener('click', () => {
      if (b.classList.contains('right')) return;
      const side = b.dataset.side;
      $$(`.match-btn[data-side="${side}"]`, root).forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      sel[side] = b;
      if (side === 'l') speak(ITEMS.get(b.dataset.id).jp);
      else sfx('tap');
      if (!sel.l || !sel.r) return;
      const [l, r] = [sel.l, sel.r];
      sel.l = sel.r = null;
      if (l.dataset.id === r.dataset.id) {
        [l, r].forEach((x) => { x.classList.remove('selected'); x.classList.add('right'); x.disabled = true; });
        sfx('correct');
        matched += 1;
        if (matched === left.length) {
          for (const id of left) record(s, [id], !wrongIds.has(id));
          s.checked = true;
          s.done += 1;
          s.answered += 1;
          updateProgress(root, s);
          const foot = $('.lesson-foot', root);
          foot.className = 'lesson-foot good';
          mount(foot, html`<div class="foot-inner feedback"><div class="fb-text"><span class="fb-icon">${icon('check', 26)}</span><div><b>All matched!</b></div></div>
            <button class="btn btn-primary check">Continue</button></div>`);
          $('.check', foot).addEventListener('click', () => next(root, s));
        }
      } else {
        wrongIds.add(l.dataset.id);
        wrongIds.add(r.dataset.id);
        [l, r].forEach((x) => { x.classList.remove('selected'); x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 400); });
        sfx('wrong');
        buzz();
      }
    }),
  );
}

function renderTidbit(root, s) {
  const t = nextTidbit(app.state, Math.random, ['fact', 'phrase']);
  app.save();
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-purple">Quick break</span></p>
    <div class="prompt">${mascot('cheer', 84)}<div class="bubble">${t.kind === 'fact' ? 'Here is something fun about Japan!' : 'Here is a phrase you can use on a trip!'}</div></div>
    ${tidbitCard(t.kind, t.item)}`);
  wirePlay(root);
  footer(root, s, { canCheck: true, text: 'Continue', onCheck: () => { s.done += 1; next(root, s); } });
}

const RENDERERS = { tidbit: renderTidbit, intro: renderIntro, choice: renderChoice, build: renderBuild, match: renderMatch };

// ---------- Finish ----------
function finish(root, s) {
  app.inLesson = false;
  const now = app.now();
  const summary = completeSession(app.state, { node: s.node, mode: s.mode, results: s.results, mistakes: s.mistakes, now });
  app.save();
  sfx('complete');
  const secs = Math.round((now - s.startedAt) / 1000);
  const accuracy = s.answered ? Math.round(((s.answered - s.mistakes) / s.answered) * 100) : 100;
  const title = s.mode === 'practice' ? 'Practice complete!' : summary.perfect ? 'Perfect lesson!' : 'Lesson complete!';
  const extras = [];
  if (summary.streakExtended) extras.push(html`<p class="pill pill-orange">${icon('flame', 16)} ${summary.streak} day streak!</p>`);
  if (summary.goalReached) extras.push(html`<p class="pill pill-gold">${icon('bolt', 16)} Daily goal reached! +5 gems</p>`);
  if (s.mode === 'practice') extras.push(html`<p class="pill pill-red">${icon('heart', 16)} +1 heart</p>`);
  if (summary.levelUp && s.node?.kind === 'lesson') extras.push(html`<p class="pill pill-green">${icon('star', 16)} Level ${summary.levelUp} of ${MAX_LEVEL}</p>`);

  mount(root, html`<div class="complete">
    <div class="confetti" aria-hidden="true">${raw(Array.from({ length: 24 }, (_, i) => `<i style="--i:${i}"></i>`).join(''))}</div>
    ${mascot('cheer', 140)}
    <h1>${title}</h1>
    <div class="extras">${extras}</div>
    <div class="result-tiles">
      <div class="result gold"><span>Total XP</span><b>${icon('bolt', 20)} ${summary.xp}</b></div>
      <div class="result green"><span>${accuracy === 100 ? 'Amazing' : 'Accuracy'}</span><b>${icon('check', 20)} ${accuracy}%</b></div>
      <div class="result blue"><span>Time</span><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    <button class="btn btn-primary btn-block continue">Continue</button>
  </div>`);
  $('.continue', root).addEventListener('click', () => app.go(s.mode === 'practice' ? '#/practice' : '#/learn'));
}

// Keyboard: 1–4 pick an option, Enter checks / continues.
export function lessonKey(root, e) {
  const s = root.__session;
  if (!s) return;
  if (e.key === 'Enter') {
    const btn = $('.lesson-foot .check', root) || $('.complete .continue', root);
    if (btn && !btn.disabled) btn.click();
  } else if (/^[1-9]$/.test(e.key) && s.keyHandler && !s.checked) s.keyHandler(e.key);
}

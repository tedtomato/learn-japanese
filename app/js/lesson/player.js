// Plays a session of exercises: lessons from the path, stories, or practice.
// Each task has a countdown (speed bonus when answered in time). Correct answers move on
// automatically after a second; wrong or hesitant answers are noted and come back at the end in a
// "Let's correct the exercises you missed" round.
import { ITEMS, NODE_BY_ID, MAX_LEVEL } from '../course.js';
import { app, modal } from '../app.js';
import { html, mount, raw, $, $$, fitText } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { person, nameOf } from '../characters.js';
import { art } from '../art.js';
import { speak, stopSpeaking, sfx, buzz, canSpeakAloud, canRecognise, listen, speechMatches, SPEAKERS } from '../audio.js';
import { generateLesson, generatePractice, generateRetry, demoExercises, kanjiPracticeIds, kanaPracticeIds, romajiOfChunk } from './generate.js';
import { completeSession, currentHearts, loseHeart, nodeLevel, isNodeUnlocked, dayKey, buyHearts, HEARTS_PRICE } from '../progress.js';
import { nextTidbit, tidbitCard, readings } from '../tidbits.js';
import { GRAMMAR } from '../content/grammar.js';
import { jpItem, jpChunk, speechOf, kanaExample } from './text.js';
import { explainCards } from './explain.js';
import { mountTrace } from './trace.js';
import { rewardPopup, comboBurst } from '../fx.js';
import { shareButton, wireShare } from '../share.js';

const PRAISE = ['Nicely done!', 'Great job!', 'Correct!', 'Awesome!', 'すごい！', 'You got it!', 'Perfect!', 'いいね！'];
const HOUR = 60 * 60 * 1000;
const norm = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

// Seconds allowed for a task; null = untimed.
function timeLimit(ex) {
  if (ex.untimed) return null;
  const audio = ex.prompt === 'audio' || ex.mode === 'audio' || ex.mode === 'fast' ? 3 : 0;
  switch (ex.type) {
    case 'choice': return (ex.kind === 'read' ? 10 : 12) + audio;
    case 'build': return Math.round(14 + ex.answer.length * 2.5 + audio);
    case 'match': return 8 + ex.pairs.length * 5;
    case 'speak': return 15;
    default: return null;
  }
}

function label(item, kind) {
  if (kind === 'romaji') return item.romaji;
  if (kind === 'en') return item.en;
  return item.jp;
}

const listenOff = () => (app.state.settings.listenOffUntil || 0) > app.now();
const speakOff = () => (app.state.settings.speakOffUntil || 0) > app.now();
const needsListening = (ex) => ex.prompt === 'audio' || ['audio', 'fast'].includes(ex.mode) || ex.type === 'dialogue' || ex.type === 'speak';

export function startSession(root, { nodeId, itemIds, demo, kanjiOnly, kanaScript } = {}) {
  const now = app.now();
  const node = nodeId ? NODE_BY_ID.get(nodeId) : null;
  if (nodeId && (!node || node.kind === 'chest' || (!isNodeUnlocked(app.state, node) && !app.testMode))) return app.go('#/learn');
  const mode = node ? 'lesson' : 'practice';
  if (demo && !app.testMode) return app.go('#/profile'); // demos only ever touch test progress
  if (mode === 'lesson' && currentHearts(app.state, now) <= 0) return app.go('#/practice');

  const opts = {
    now,
    canListen: canSpeakAloud() && !listenOff(),
    canSpeak: canRecognise() && canSpeakAloud() && !speakOff() && app.state.settings.speaking !== false,
  };
  const session = demo
    ? { exercises: demoExercises(demo, app.state), itemIds: [] }
    : node
      ? generateLesson(node, app.state, { ...opts, level: nodeLevel(app.state, node) })
      : kanaScript
        ? generatePractice(app.state, { ...opts, itemIds: kanaPracticeIds(app.state, now, kanaScript), gentle: true })
        : generatePractice(app.state, { ...opts, itemIds: kanjiOnly ? kanjiPracticeIds(app.state, now) : itemIds });
  if (!session.exercises.length) return app.go('#/practice');
  // Now and then, an interesting fact about Japan (on the unit's theme) as a short break.
  if (!demo && !kanjiOnly && !kanaScript && session.exercises.length >= 8 && node?.kind !== 'story' && Math.random() < 0.5) {
    session.exercises.splice(Math.floor(session.exercises.length / 2), 0, { type: 'tidbit', itemIds: [] });
  }

  const s = {
    node, mode, opts,
    queue: [...session.exercises],
    total: session.exercises.length,
    done: 0, mistakes: 0, answered: 0, speedBonus: 0, timedCount: 0,
    results: new Map(),
    missed: new Set(),
    retryRound: false,
    startedAt: now,
    current: null, checked: false,
    timer: null,
  };
  app.inLesson = true;
  root.__session = s;
  renderShell(root, s);
  next(root, s);
}

function renderShell(root, s) {
  const level = s.node ? nodeLevel(app.state, s.node) : 0;
  const timed = app.state.settings.speed !== false;
  mount(root, html`<div class="lesson">
    <header class="lesson-top">
      <button class="icon-btn quit" aria-label="Quit">${icon('close', 26)}</button>
      <div class="bar bar-lg"><div class="bar-fill" style="width:0%"></div></div>
      ${s.mode === 'lesson' ? html`<span class="stat stat-hearts">${icon('heart', 24)}<b class="hearts-n">${currentHearts(app.state, app.now())}</b></span>`
        : html`<span class="pill pill-blue">Practice</span>`}
    </header>
    <div class="timer ${timed ? '' : 'off'}" aria-live="off"><span class="timer-n"></span><div class="timer-bar"><i></i></div></div>
    ${s.node ? html`<div class="lesson-meta"><b>Section ${s.node.sectionIndex + 1} – Unit ${s.node.unitIndex + 1}</b> · ${s.node.title}${s.node.kind === 'lesson' ? ` · Level ${Math.min(level + 1, MAX_LEVEL)}` : ''}</div>` : ''}
    <main class="lesson-body"></main>
    <footer class="lesson-foot"></footer>
    <div class="explain-sheet" hidden></div>
  </div>`);
  $('.quit', root).addEventListener('click', () =>
    modal(html`<div class="center">${mascot('sad', 96)}<h2>Wait, don't go!</h2><p class="muted">You'll lose your progress in this lesson.</p></div>`, [
      { label: 'Keep learning' },
      { label: 'End session', kind: 'danger-ghost', onClick: () => quit(s) },
    ]),
  );
}

function cleanup(s) {
  stopTimer(s);
  stopSpeaking();
}

function quit(s) {
  cleanup(s);
  app.inLesson = false;
  app.go(location.hash.startsWith('#/practice') ? '#/practice' : location.hash.startsWith('#/lab') ? '#/lab' : '#/learn');
}

function updateProgress(root, s) {
  $('.lesson-top .bar-fill', root).style.width = `${Math.min(100, (s.done / s.total) * 100)}%`;
  const h = $('.hearts-n', root);
  if (h) h.textContent = currentHearts(app.state, app.now());
}

// ---------- Timer ----------
function startTimer(root, s, seconds) {
  stopTimer(s);
  const box = $('.timer', root);
  if (!seconds || app.state.settings.speed === false) {
    box.classList.add('idle');
    return;
  }
  box.classList.remove('idle', 'late', 'urgent');
  const t = { limit: seconds * 1000, started: performance.now(), late: false, lastTick: null };
  s.timer = t;
  const n = $('.timer-n', box);
  const bar = $('.timer-bar i', box);
  const tick = () => {
    const left = t.limit - (performance.now() - t.started);
    const secs = Math.max(0, Math.ceil(left / 1000));
    n.textContent = `${secs}s`;
    bar.style.width = `${Math.max(0, (left / t.limit) * 100)}%`;
    if (secs <= 3 && secs > 0 && t.lastTick !== secs) {
      t.lastTick = secs;
      box.classList.add('urgent');
      sfx('tick');
    }
    if (left <= 0 && !t.late) {
      t.late = true;
      box.classList.add('late');
      sfx('timeup');
      n.textContent = "Time's up";
    }
  };
  tick();
  t.handle = setInterval(tick, 200);
}

function stopTimer(s) {
  const t = s.timer;
  if (!t) return null;
  clearInterval(t.handle);
  s.timer = null;
  const elapsed = performance.now() - t.started;
  return { elapsed, late: t.late || elapsed > t.limit, ratio: elapsed / t.limit };
}

// ---------- Flow ----------
function next(root, s) {
  stopTimer(s);
  stopSpeaking();
  $('.explain-sheet', root).hidden = true;
  updateProgress(root, s);
  s.current = s.queue.shift();
  s.checked = false;
  s.keyHandler = null;
  if (!s.current) {
    if (s.missed.size && !s.retryRound) return retryIntro(root, s);
    return finish(root, s);
  }
  if (needsListening(s.current) && ((s.current.type === 'speak' && speakOff()) || listenOff())) {
    s.done += 1;
    return next(root, s);
  }
  const body = $('.lesson-body', root);
  body.classList.remove('enter');
  void body.offsetWidth;
  body.classList.add('enter');
  s.speaker = pickOne(SPEAKERS);
  startTimer(root, s, null);
  RENDERERS[s.current.type](root, s);
  fitText(root);
  // Tap a word of the Japanese sentence to hear it (not in reading tests, where it would give the answer).
  if (s.current.kind !== 'read') {
    $$('.prompt-person .chunk', root).forEach((c) => c.addEventListener('click', () => {
      c.classList.add('chunk-say');
      setTimeout(() => c.classList.remove('chunk-say'), 700);
      sayAs(root, s.speaker, c.dataset.chunk, { highlight: c });
    }));
  }
  $$('.show-romaji', root).forEach((b) => b.addEventListener('click', () => {
    b.previousElementSibling?.classList.remove('rt-hidden');
    b.remove();
  }));
}

function retryIntro(root, s) {
  s.retryRound = true;
  stopTimer(s);
  const retry = generateRetry([...s.missed], app.state);
  s.queue.push(...retry);
  s.total += retry.length + 1;
  mount($('.lesson-body', root), html`<div class="interlude">
    <div class="bubble bubble-lg">Let's correct the exercises you missed!</div>
    ${mascot('cheer', 150)}</div>`);
  footer(root, s, { canCheck: true, text: 'Continue', onCheck: () => { s.done += 1; next(root, s); } });
}

// ---------- Footer & feedback ----------
function footer(root, s, { canCheck = false, onCheck, text = 'Check', skip } = {}) {
  const foot = $('.lesson-foot', root);
  foot.className = 'lesson-foot';
  mount(foot, html`<div class="foot-inner">
    ${skip ? html`<button class="btn btn-ghost skip">${skip.label}</button>` : ''}
    <button class="btn btn-primary check" ${canCheck ? '' : 'disabled'}>${text}</button></div>`);
  $('.check', foot).addEventListener('click', onCheck);
  $('.skip', foot)?.addEventListener('click', skip?.onSkip);
}

const setCheckEnabled = (root, on) => {
  const b = $('.lesson-foot .check', root);
  if (b) b.disabled = !on;
};

function record(s, ids, key) {
  for (const id of ids) {
    const r = s.results.get(id) || { right: 0, wrong: 0, hesitated: 0 };
    r[key] += 1;
    s.results.set(id, r);
  }
}

// Scores the current exercise and shows the feedback bar. opts: answerText, meaning, chosenLabel,
// item (for "explain"), noHeart (speech recognition misses), timing (from stopTimer).
function result(root, s, ok, opts = {}) {
  if (s.checked) return;
  s.checked = true;
  s.answered += 1;
  const ex = s.current;
  const timing = opts.timing ?? stopTimer(s);
  const ids = ex.itemIds || [];
  const hesitated = ok && ((timing && timing.ratio > 0.6) || !!ex.hinted);
  const onTime = ok && timing && !timing.late;
  if (timing) s.timedCount += 1;
  if (onTime) s.speedBonus += 1;

  if (ok) {
    s.done += 1;
    record(s, ids, 'right');
    // Every 5 right answers in a row (that count), a short celebration.
    s.combo = (s.combo || 0) + 1;
    if (s.combo % 5 === 0) {
      comboBurst(s.combo);
      setTimeout(() => sfx('bonus'), 150);
    }
    if (hesitated) {
      record(s, ids, 'hesitated');
      ids.forEach((id) => s.missed.add(id));
    }
    sfx('correct');
  } else {
    s.mistakes += 1;
    s.combo = 0;
    record(s, ids, 'wrong');
    ids.forEach((id) => s.missed.add(id));
    sfx('wrong');
    buzz();
    if (s.retryRound) s.queue.push({ ...ex }); // in the retry round, keep going until it is right
    else s.done += 1; // it comes back in the retry round instead
    if (s.mode === 'lesson' && !opts.noHeart) {
      loseHeart(app.state, app.now());
      app.save();
    }
  }
  updateProgress(root, s);
  const outOfHearts = s.mode === 'lesson' && currentHearts(app.state, app.now()) <= 0;
  const item = opts.item || ITEMS.get(ex.itemId);
  const canExplain = item && ['word', 'sentence', 'kana', 'kanji', 'kword', 'radical'].includes(item.type);
  const foot = $('.lesson-foot', root);
  foot.className = `lesson-foot ${ok ? 'good' : 'bad'}`;
  const badges = [];
  if (onTime && !hesitated) badges.push(html`<span class="pill pill-gold">${icon('bolt', 14)} Speed bonus</span>`);
  if (hesitated) badges.push(html`<span class="pill pill-orange">${ex.hinted ? 'Used a hint' : 'A bit slow'} — we'll practise it again</span>`);
  mount(foot, html`<div class="foot-inner feedback">
    <div class="fb-text">
      <span class="fb-icon">${icon(ok ? 'check' : 'close', 26)}</span>
      <div><b>${ok ? pickOne(PRAISE) : 'Correct answer:'}</b>
      ${!ok && opts.answerText ? html`<p class="jp-mix">${opts.answerText}</p>` : ''}
      ${opts.meaning ? html`<p class="fb-meaning">${item?.type === 'fword' && item.art ? art(item.art, 'art-inline') : ''} ${opts.meaning}</p>` : ''}
      ${badges.length ? html`<p class="fb-badges">${badges}</p>` : ''}</div>
    </div>
    <div class="fb-actions">
      ${canExplain ? html`<button class="btn btn-ghost explain">Explain</button>` : ''}
      <button class="btn ${ok ? 'btn-primary' : 'btn-danger'} check">${ok ? 'Continue' : 'Got it'}</button>
    </div></div>`);
  // No auto-continue: the learner moves on when ready, so there is always time to tap Explain.
  const go = () => {
    if (outOfHearts) noHearts(root, s);
    else next(root, s);
  };
  $('.check', foot).addEventListener('click', go);
  $('.explain', foot)?.addEventListener('click', () => {
    showExplain(root, s, item, ok ? null : opts.chosenLabel, go);
  });
}

function showExplain(root, s, item, chosenLabel, go) {
  const cards = explainCards(item, { chosenLabel });
  const sheet = $('.explain-sheet', root);
  sheet.hidden = false;
  const render = (i) => mount(sheet, html`<div class="ex-head"><button class="icon-btn back" aria-label="Back">${icon('arrow', 24)}</button><h2>Explain my answer</h2></div>
    <div class="ex-chips">${cards.map((c, j) => html`<button class="tile ex-chip jp ${j === i ? 'on' : ''}" data-i="${j}">${c.chip}</button>`)}</div>
    <div class="card ex-card">${cards[i].body}</div>
    <button class="btn btn-secondary btn-block ex-continue">Continue lesson</button>`);
  const wire = (i) => {
    render(i);
    $$('.ex-chip', sheet).forEach((b) => b.addEventListener('click', () => wire(Number(b.dataset.i))));
    $('.back', sheet).addEventListener('click', () => (sheet.hidden = true));
    $('.ex-continue', sheet).addEventListener('click', () => {
      sheet.hidden = true;
      go();
    });
  };
  wire(0);
}

function noHearts(root, s) {
  cleanup(s);
  const canBuy = app.state.gems >= HEARTS_PRICE;
  modal(html`<div class="center">${mascot('sad', 100)}<h2>Out of hearts</h2><p class="muted">Hearts refill over time. A practice session earns one back right away — and practice never costs hearts.${canBuy ? '' : ` A full refill costs ${HEARTS_PRICE} gems (you have ${app.state.gems}).`}</p></div>`, [
    // Gems refill every heart and the lesson carries on where it stopped.
    ...(canBuy ? [{ label: html`Refill hearts · ${icon('gem', 16)} ${HEARTS_PRICE}`, onClick: () => {
      buyHearts(app.state, app.now());
      app.save();
      sfx('bonus');
      updateProgress(root, s);
      next(root, s);
    } }] : []),
    { label: 'Practice to earn hearts', kind: canBuy ? 'secondary' : 'primary', onClick: () => { app.inLesson = false; app.go('#/practice/go'); } },
    { label: 'End lesson', kind: 'danger-ghost', onClick: () => quit(s) },
  ], { dismissable: false });
}

function skipListening(root, s, kind) {
  const key = kind === 'speak' ? 'speakOffUntil' : 'listenOffUntil';
  app.state.settings[key] = app.now() + HOUR;
  app.save();
  // Drop the rest of this kind of task from the session too.
  s.queue = s.queue.filter((e) => (kind === 'speak' ? e.type !== 'speak' : !needsListening(e)));
  s.done += 1;
  next(root, s);
}

// ---------- Characters & audio ----------
function speakerBubble(s, content, { big = false } = {}) {
  return html`<div class="prompt prompt-person">
    <div class="person-wrap" data-who="${s.speaker}">${person(s.speaker, big ? 110 : 92)}<span class="person-name">${nameOf(s.speaker)}</span></div>
    <div class="bubble bubble-lg">${content}</div></div>`;
}

// Speaks as the exercise's character, animating their mouth while the voice plays and lighting
// up each syllable of the Japanese on screen as it is said.
let activeKaraoke = null;

// opts.highlight: the element showing the text (else the matching word on screen is found).
function sayAs(root, who, text, { highlight, ...opts } = {}) {
  const wrap = $(`.person-wrap[data-who="${who}"]`, root) || $('.person-wrap', root);
  activeKaraoke?.stop(); // a new voice cuts the previous one, so its highlight goes too
  const k = karaoke(root, text, highlight);
  activeKaraoke = k;
  return speak(text, {
    ...opts,
    speaker: who,
    onStart: (info) => { wrap?.classList.add('talking'); k?.start(info?.rate || 1); },
    onBoundary: (i) => k?.at(i),
    onEnd: () => { wrap?.classList.remove('talking'); k?.stop(); },
  });
}

const plain = (t) => t.replace(/[\s、。！？!?.,…]/g, '');
const rubyText = (el) => [...el.childNodes].filter((n) => n.nodeName !== 'RT').map((n) => n.textContent).join('');
const withoutRomaji = (el) => {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('rt').forEach((r) => r.remove());
  return copy.textContent;
};

// Syllable highlighting for the Japanese being spoken: steps through the syllables (romaji ruby, or
// the characters) at the voice's pace, and jumps to where the voice is when the device reports it.
function karaoke(root, text, el) {
  const target = el || $$('.intro-card .jp-xl, .intro-card .jp-l2, .intro-card .jp-l3, .prompt-person .jp-lg, .prompt-person .jp-xl', root)
    .find((x) => plain(withoutRomaji(x)) === plain(text));
  if (!target) return null;
  let units = [...target.querySelectorAll('ruby')];
  if (!units.length) {
    // No romaji: light up the characters themselves (split into spans once).
    if (!target.querySelector('.k-char')) {
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
      nodes.forEach((n) => {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach((c) => {
          const span = document.createElement('span');
          span.className = 'k-char';
          span.textContent = c;
          frag.append(span);
        });
        n.replaceWith(frag);
      });
    }
    units = [...target.querySelectorAll('.k-char')].filter((u) => plain(u.textContent));
  }
  // Character offset of each syllable in the spoken text, for boundary events.
  const starts = [];
  let pos = 0;
  units.forEach((u) => {
    const t = u.tagName === 'RUBY' ? rubyText(u) : u.textContent;
    const at = text.indexOf(t, pos);
    starts.push(at === -1 ? pos : at);
    pos = (at === -1 ? pos : at) + t.length;
  });
  let timer = null;
  let current = -1;
  const show = (i) => {
    if (i === current || i >= units.length) return;
    units[current]?.classList.remove('k-on');
    current = i;
    units[i]?.classList.add('k-on');
  };
  const stop = () => {
    clearInterval(timer);
    units.forEach((u) => u.classList.remove('k-on'));
    current = -1;
  };
  return {
    start(rate) {
      stop();
      show(0);
      // About 6 syllables a second at normal speed.
      timer = setInterval(() => (current < units.length - 1 ? show(current + 1) : clearInterval(timer)), 170 / rate);
    },
    at(charIndex) {
      let i = 0;
      while (i + 1 < starts.length && starts[i + 1] <= charIndex) i += 1;
      show(i);
    },
    stop,
  };
}

function playButtons(text, { slow = true } = {}) {
  return html`<div class="speakers">
    <button class="speaker" data-play="${text}" aria-label="Play">${icon('speaker', 36)}</button>
    ${slow ? html`<button class="speaker slow" data-play="${text}" data-slow="1" aria-label="Play slowly">${icon('turtle', 28)}</button>` : ''}</div>`;
}

function wirePlay(root, s, extra = {}) {
  $$('[data-play]', root).forEach((b) =>
    b.addEventListener('click', () => sayAs(root, s.speaker, b.dataset.play, { slow: !!b.dataset.slow, ...extra })),
  );
}

// ---------- Exercise renderers ----------
function introHtml(item, hint) {
  switch (item.type) {
    case 'kana':
      return html`<div class="jp jp-giant">${item.jp}</div><div class="intro-romaji">${item.romaji}</div>
        <p class="pill pill-blue">${item.script === 'katakana' ? 'Katakana' : 'Hiragana'}</p>${kanaExample(item)}${item.hint ? html`<p class="intro-hint">💡 ${item.hint}</p>` : ''}`;
    case 'kanji':
    case 'radical':
      return html`<div class="jp jp-giant">${item.jp}</div><div class="intro-en">${item.en}</div>
        ${item.parts?.length > 1 ? html`<p class="parts">${item.parts.map(([p, m], i) => html`${i ? html`<b class="op">+</b>` : ''}<span class="part"><b class="jp">${p}</b><small>${m}</small></span>`)}<b class="op">=</b><span class="part"><b class="jp">${item.jp}</b><small>${item.en}</small></span></p>` : ''}
        <p class="intro-clue">💡 <b>Remember it:</b> ${item.story}</p>
        ${readings(item.on, item.kun)}
        ${item.words?.length ? html`<div class="jukugo">${item.words.map((id) => { const w = ITEMS.get(id); return html`<button class="jukugo-row" data-say="${w.kana}"><span class="jp">${jpItem(w, true)}</span><span>${w.en}</span></button>`; })}</div>` : ''}`;
    case 'kword':
      return html`<div class="jp-xl">${jpItem(item, true)}</div><div class="intro-romaji">${item.romaji}</div><div class="intro-en">${item.en}</div>
        <p class="parts">${item.kanji.map((k, i) => html`${i ? html`<b class="op">+</b>` : ''}<span class="part"><b class="jp">${k}</b><small>${ITEMS.get(`kj-${k}`)?.en || ''}</small></span>`)}</p>`;
    default: {
      const len = (item.text || item.jp).length;
      const size = len <= 4 ? 'jp-xl' : len <= 7 ? 'jp-l2' : 'jp-l3';
      return html`${item.art ? art(item.art, 'art-xl') : ''}
        <div class="${size} fit">${jpItem(item, hint)}</div>
        ${!hint ? html`<div class="intro-romaji">${item.romaji}</div>` : ''}
        <div class="intro-en">${item.en}</div>
        ${item.note ? html`<p class="intro-hint">💡 ${item.note}</p>` : ''}`;
    }
  }
}

function renderIntro(root, s) {
  const item = ITEMS.get(s.current.itemId);
  const kindLabel = { kana: 'New character', word: 'New word', sentence: 'New phrase', kanji: 'New kanji', kword: 'New kanji word', radical: 'New radical' }[item.type];
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-gold">${icon('star', 14)} ${kindLabel}</span></p>
    ${speakerBubble(s, html`<div class="intro-card">${introHtml(item, s.current.hint)}
      <div class="intro-play"><button class="speaker small-speaker" data-play="${speechOf(item)}" aria-label="Play">${icon('speaker', 24)}</button>
      <button class="speaker small-speaker slow" data-play="${speechOf(item)}" data-slow="1" aria-label="Play slowly">${icon('turtle', 22)}</button></div></div>`)}`);
  wirePlay(root, s);
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => sayAs(root, s.speaker, b.dataset.say)));
  sayAs(root, s.speaker, speechOf(item));
  footer(root, s, { canCheck: true, text: 'Continue', onCheck: () => { s.done += 1; next(root, s); } });
}

function renderTrace(root, s) {
  const item = ITEMS.get(s.current.itemId);
  const kana = item.type === 'kana';
  mount($('.lesson-body', root), html`<p class="instruction">Trace the character</p>
    <div class="trace-head"><button class="speaker small-speaker" data-play="${speechOf(item)}" aria-label="Play">${icon('speaker', 26)}</button>
      <div><b class="jp">${item.jp}</b><small>${item.romaji || item.en}</small></div>
      <button class="link replay">${icon('play', 14)} Watch again</button></div>
    <div class="trace-stage"><p class="trace-status">Watch the strokes…</p><div class="trace-host"></div></div>`);
  wirePlay(root, s);
  sayAs(root, s.speaker, speechOf(item));
  const status = $('.trace-status', root);
  const t = mountTrace($('.trace-host', root), item.jp, {
    rounds: kana ? 2 : 1,
    onProgress: ({ round, rounds, index, total }) => {
      status.textContent = `${round === 1 ? 'Follow the arrow' : 'Now from memory'} · stroke ${Math.min(index + 1, total)} of ${total}${rounds > 1 ? ` · round ${round}/${rounds}` : ''}`;
    },
    onDone: () => result(root, s, true, { meaning: `${item.jp} = ${item.romaji || item.en}`, timing: null }),
  });
  $('.replay', root).addEventListener('click', () => t.replay());
  footer(root, s, { canCheck: false, text: 'Continue', skip: { label: 'Skip', onSkip: () => { s.done += 1; next(root, s); } } });
}

function promptFor(root, s, ex, item) {
  if (ex.prompt === 'audio') return speakerBubble(s, playButtons(speechOf(item)));
  if (ex.prompt === 'romaji') return speakerBubble(s, html`<div class="romaji-big">${item.romaji}</div>`);
  if (ex.prompt === 'en') return speakerBubble(s, html`<div class="en-prompt">${item.art ? art(item.art, 'art-lg') : ''}<span>${item.en}</span></div>`);
  if (ex.prompt === 'kanji') {
    return html`<div class="kanji-prompt"><div class="jp kanji-big-q">${item.jp}</div>
      ${ex.clue ? html`<button class="link clue-btn">💡 Show a clue</button><p class="clue" hidden>${ex.clue}</p>` : ''}</div>`;
  }
  const big = item.type === 'kana';
  // No play button when the task is to read it — hearing it would give the answer away.
  // Romaji hidden: offer it on demand (not when the task is to read it), kept in place so nothing jumps.
  const canPeek = !big && !ex.hint && ex.kind !== 'read' && ['word', 'sentence'].includes(item.type);
  // Reading tests (a word, or a kana asked for its sound) have no play button: hearing it is the answer.
  const isReading = ex.kind === 'read' || (item.type === 'kana' && ex.answerKind === 'romaji');
  return speakerBubble(s, html`${isReading ? '' : html`<button class="say-inline" data-play="${speechOf(item)}" aria-label="Play">${icon('speaker', 22)}</button>`}
    <div class="jp-prompt-wrap"><div class="${big ? 'jp-huge' : 'jp-lg fit'} ${canPeek ? 'rt-hidden' : ''}">${big ? html`<span class="jp">${item.jp}</span>` : jpItem(item, ex.hint || canPeek)}</div>
    ${canPeek ? html`<button class="show-romaji">Show romaji</button>` : ''}</div>`);
}

function optionHtml(opt, ex) {
  if (ex.answerKind === 'en') return html`<span class="opt-label">${opt.en}</span>`;
  if (ex.answerKind === 'romaji') return html`<span class="opt-label">${opt.romaji}</span>`;
  const isKana = opt.type === 'kana';
  const isKanji = ['kanji', 'radical'].includes(opt.type);
  return html`<span class="opt-label fit ${isKana ? 'jp-lg' : ''} ${isKanji ? 'opt-kanji' : ''}">${isKana || isKanji ? html`<span class="jp">${opt.jp}</span>` : jpItem(opt, ex.hint)}</span>`;
}

function renderChoice(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const grid = ['kana', 'romaji'].includes(ex.answerKind) || (ex.answerKind === 'jp' && ['kanji', 'radical'].includes(item.type));
  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${promptFor(root, s, ex, item)}
    ${item.type === 'kana' && item.example ? html`<div class="kana-hint"><button class="link hint-btn">💡 Hint</button><div class="hint-body" hidden>${kanaExample(item, { asHint: true })}</div></div>` : ''}
    <div class="options ${grid ? 'grid' : 'list'}">${ex.options.map((id, i) => html`<button class="option" data-id="${id}"><span class="key">${i + 1}</span>${optionHtml(ITEMS.get(id), ex)}</button>`)}</div>`);
  wirePlay(root, s);
  // The memory word as a hint; using it brings the character back sooner (like a hesitation).
  $('.hint-btn', root)?.addEventListener('click', (e) => {
    e.currentTarget.remove();
    $('.hint-body', root).hidden = false;
    ex.hinted = true;
  });
  $('.clue-btn', root)?.addEventListener('click', (e) => {
    e.currentTarget.hidden = true;
    $('.clue', root).hidden = false;
  });
  const audioFirst = ex.prompt === 'audio' || (ex.prompt === 'jp' && item.type !== 'kana' && ex.kind !== 'read');
  if (audioFirst) sayAs(root, s.speaker, speechOf(item));
  startTimer(root, s, timeLimit(ex));

  let chosen = null;
  const check = () => {
    if (!chosen || s.checked) return;
    const ok = chosen === ex.itemId;
    $$('.option', root).forEach((b) => {
      b.disabled = true;
      if (b.dataset.id === ex.itemId) b.classList.add('right');
      else if (b.dataset.id === chosen) b.classList.add('wrong');
    });
    if (['word', 'sentence', 'kana', 'kword'].includes(item.type)) sayAs(root, s.speaker, speechOf(item));
    const meaning = item.en && ex.answerKind !== 'en' ? `${item.jp} = ${item.en}` : item.type === 'kana' ? `${item.jp} = ${item.romaji}${item.example ? ` — as in ${item.example.jp} (${item.example.romaji})` : ''}` : item.romaji ? `${item.jp} · ${item.romaji}` : null;
    result(root, s, ok, { answerText: label(item, ex.answerKind === 'kana' ? 'jp' : ex.answerKind), meaning, chosenLabel: ok ? null : label(ITEMS.get(chosen), ex.answerKind === 'kana' ? 'jp' : ex.answerKind) });
  };
  const choose = (btn) => {
    if (s.checked) return;
    $$('.option', root).forEach((b) => b.classList.toggle('selected', b === btn));
    chosen = btn.dataset.id;
    sfx('tap');
    if (['jp', 'kana'].includes(ex.answerKind) && ex.prompt !== 'audio') speak(speechOf(ITEMS.get(chosen)), { speaker: s.speaker });
    setCheckEnabled(root, true);
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => choose(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) choose(b);
  };
  footer(root, s, {
    onCheck: check,
    skip: ex.prompt === 'audio' ? { label: "Can't listen now", onSkip: () => skipListening(root, s, 'listen') } : null,
  });
}

function tileButton(ex, i, jpTiles, extra = '') {
  const sub = ex.tileRomaji?.[i];
  // The word's syllables sit side by side in one row (the tile itself stacks its content).
  return html`<button class="tile ${extra} ${jpTiles ? 'jp' : ''}" data-i="${i}">${jpTiles && sub ? html`<span class="ruby-on tile-word">${jpChunk(ex.tiles[i], true, sub)}</span>` : ex.tiles[i]}</button>`;
}

function renderBuild(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const jpTiles = ex.mode !== 'jp2en';
  let prompt;
  if (ex.mode === 'jp2en') prompt = promptFor(root, s, { ...ex, prompt: 'jp' }, item);
  else if (ex.mode === 'audio') prompt = speakerBubble(s, playButtons(speechOf(item)));
  else if (ex.mode === 'fast') prompt = speakerBubble(s, html`${playButtons(speechOf(item), { slow: false })}<p class="muted small">Natural speed — no slow mode!</p>`);
  else prompt = speakerBubble(s, html`<div class="en-prompt">${item.art ? art(item.art, 'art-lg') : ''}<span>${item.en}</span>
    ${ex.mode === 'spell' && ex.hint ? html`<div class="romaji-hint">${item.romaji}</div>` : ''}</div>`);

  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${prompt}
    <div class="answer-line" aria-label="Your answer"></div>
    <div class="bank">${ex.tiles.map((t, i) => tileButton(ex, i, jpTiles))}</div>`);
  wirePlay(root, s, ex.mode === 'fast' ? { fast: true } : {});
  if (ex.mode === 'audio' || ex.mode === 'jp2en') sayAs(root, s.speaker, speechOf(item));
  if (ex.mode === 'fast') sayAs(root, s.speaker, speechOf(item), { fast: true });
  startTimer(root, s, timeLimit(ex));

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
      if (jpTiles && ex.mode !== 'fast' && ex.mode !== 'audio') speak(ex.tiles[i], { speaker: s.speaker });
      redraw();
    }),
  );
  footer(root, s, {
    skip: ex.mode === 'audio' || ex.mode === 'fast' ? { label: "Can't listen now", onSkip: () => skipListening(root, s, 'listen') } : null,
    onCheck: () => {
      const given = placed.map((i) => ex.tiles[i]);
      // When listening, tiles that sound the same as the answer count too.
      const sound = (chunks) => chunks.map(romajiOfChunk).join('').replace(/ /g, '');
      const ok = jpTiles
        ? given.join('') === ex.answer.join('') || ((ex.mode === 'audio' || ex.mode === 'fast') && given.every(romajiOfChunk) && sound(given) === sound(ex.answer))
        : (ex.accept || [ex.answer.join(' ')]).some((a) => norm(a) === norm(given.join(' ')));
      line.classList.add(ok ? 'right' : 'wrong');
      sayAs(root, s.speaker, speechOf(item));
      result(root, s, ok, {
        answerText: jpTiles ? ex.answer.join(jpTiles && ex.mode !== 'spell' ? ' ' : '') : ex.answer.join(' '),
        meaning: `${item.romaji}${ex.mode === 'jp2en' ? '' : ` — ${item.en}`}`,
        chosenLabel: ok ? null : given.join(jpTiles ? '' : ' '),
      });
    },
  });
}

function renderMatch(root, s) {
  const ex = s.current;
  const left = [...ex.pairs].sort(() => Math.random() - 0.5);
  const right = [...ex.pairs].sort(() => Math.random() - 0.5);
  // One grid, row by row, so every card in both columns has the same height.
  const cells = left.flatMap((id, i) => {
    const l = ITEMS.get(id);
    const r = ITEMS.get(right[i]);
    return [
      html`<button class="option match-btn" data-side="l" data-id="${id}">${l.type === 'kana' ? html`<span class="jp jp-lg">${l.jp}</span>` : ['kanji', 'radical'].includes(l.type) ? html`<span class="jp match-kanji">${l.jp}</span>` : jpItem(l, ex.hint)}</button>`,
      html`<button class="option match-btn" data-side="r" data-id="${right[i]}">${label(r, ex.right)}</button>`,
    ];
  });
  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p><div class="match">${cells}</div>`);
  startTimer(root, s, timeLimit(ex));
  const sel = { l: null, r: null };
  const wrongIds = new Set();
  let matched = 0;
  footer(root, s, { canCheck: false, text: 'Check', onCheck: () => {} });
  $$('.match-btn', root).forEach((b) =>
    b.addEventListener('click', () => {
      if (b.classList.contains('right') || s.checked) return;
      const side = b.dataset.side;
      $$(`.match-btn[data-side="${side}"]`, root).forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      sel[side] = b;
      if (side === 'l') speak(speechOf(ITEMS.get(b.dataset.id)), { speaker: s.speaker });
      else sfx('tap');
      if (!sel.l || !sel.r) return;
      const [l, r] = [sel.l, sel.r];
      sel.l = sel.r = null;
      if (l.dataset.id === r.dataset.id) {
        [l, r].forEach((x) => { x.classList.remove('selected'); x.classList.add('right'); x.disabled = true; });
        sfx('correct');
        matched += 1;
        if (matched === left.length) {
          for (const id of left) {
            if (wrongIds.has(id)) {
              record(s, [id], 'wrong');
              s.missed.add(id);
            }
          }
          s.current = { ...ex, itemIds: left.filter((id) => !wrongIds.has(id)) };
          result(root, s, true, { meaning: wrongIds.size ? `${wrongIds.size} mix-up${wrongIds.size > 1 ? 's' : ''} — they'll come back at the end` : 'All matched!' });
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

function renderSpeak(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  mount($('.lesson-body', root), html`<p class="instruction">Listen, then say it out loud</p>
    ${speakerBubble(s, html`<button class="say-inline" data-play="${speechOf(item)}" aria-label="Play">${icon('speaker', 22)}</button>
      <div><div class="jp-lg">${jpItem(item, true)}</div><div class="muted">${item.en}</div></div>`)}
    <div class="mic-area"><button class="mic" aria-label="Start speaking">${icon('mic', 40)}</button><p class="mic-status">Tap the microphone and repeat.</p></div>`);
  wirePlay(root, s);
  sayAs(root, s.speaker, speechOf(item));
  let tries = 0;
  const status = $('.mic-status', root);
  const mic = $('.mic', root);
  mic.addEventListener('click', async () => {
    if (s.checked || mic.classList.contains('listening')) return;
    stopSpeaking();
    if (!s.timer) startTimer(root, s, timeLimit(ex));
    mic.classList.add('listening');
    status.textContent = 'Listening…';
    const heard = await listen();
    mic.classList.remove('listening');
    const targets = [item.text || item.jp, ...(item.alt || [])];
    if (speechMatches(heard, targets)) {
      status.textContent = `You said: ${heard[0]}`;
      result(root, s, true, { meaning: `${item.text || item.jp} — ${item.en}` });
    } else if (++tries < 2) {
      sfx('wrong');
      status.textContent = heard.length ? `I heard “${heard[0]}”. Try again!` : "I didn't catch that. Try again!";
    } else {
      result(root, s, false, { answerText: item.text || item.jp, meaning: item.romaji, noHeart: true });
    }
  });
  footer(root, s, { canCheck: false, text: 'Check', skip: { label: "Can't speak now", onSkip: () => skipListening(root, s, 'speak') } });
}

function renderGrammar(root, s) {
  const g = GRAMMAR[s.current.grammarId];
  const blocks = html`<div class="g-blocks">${g.blocks.map((b) => html`<div class="g-block g-${b.role}"><span class="jp">${jpChunk(b.jp, true)}</span><small>${b.en}</small></div>`)}</div>`;
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-purple">Grammar in 15 seconds</span></p>
    <div class="card grammar-card"><h2>${g.title}</h2>${blocks}<p class="g-en">= ${g.en}</p><p>${g.rule}</p><p class="muted small">💡 ${g.tip}</p></div>`);
  speak(g.blocks.map((b) => b.jp).join(''), { speaker: s.speaker });
  footer(root, s, { canCheck: true, text: 'Test me (15 s)', onCheck: () => grammarCheck(root, s, g) });
}

function grammarCheck(root, s, g) {
  const { check } = g;
  mount($('.lesson-body', root), html`<p class="instruction">Fill the gap — ${check.en}</p>
    <div class="g-blocks g-quiz">${check.prompt.map((c) => (c ? html`<div class="g-block g-noun"><span class="jp">${jpChunk(c, true)}</span></div>` : html`<div class="g-block g-gap">?</div>`))}</div>
    <div class="options grid">${check.options.map((o, i) => html`<button class="option" data-o="${o}"><span class="key">${i + 1}</span><span class="jp jp-lg">${jpChunk(o, true)}</span></button>`)}</div>`);
  startTimer(root, s, 15);
  const pickIt = (b) => {
    if (s.checked) return;
    const ok = b.dataset.o === check.answer;
    $$('.option', root).forEach((x) => {
      x.disabled = true;
      if (x.dataset.o === check.answer) x.classList.add('right');
      else if (x === b) x.classList.add('wrong');
    });
    $('.g-gap', root).textContent = check.answer;
    result(root, s, ok, { answerText: check.answer, meaning: g.rule });
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => pickIt(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) pickIt(b);
  };
  footer(root, s, { canCheck: false, text: 'Pick an answer', onCheck: () => {} });
}

function renderDialogue(root, s) {
  const ex = s.current;
  const d = ITEMS.get(ex.itemId);
  const [a, b] = d.cast;
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-blue">${icon('chat', 14)} ${d.title}</span></p>
    <div class="dialogue">
      <div class="dl-cast"><div class="person-wrap" data-who="${a}">${person(a, 84)}<span class="person-name">${nameOf(a)}</span></div>
        <div class="person-wrap" data-who="${b}">${person(b, 84)}<span class="person-name">${nameOf(b)}</span></div></div>
      <div class="dl-lines">${d.lines.map((l, i) => html`<div class="dl-line side-${l.who}" data-i="${i}" hidden><span class="dl-who">${nameOf(d.cast[l.who])}</span><span class="jp dl-jp">…</span><small class="dl-en" hidden>${l.en}</small></div>`)}</div>
      <button class="link replay-dl" hidden>${icon('play', 14)} Listen again</button>
    </div>
    <div class="dl-question" hidden><p class="instruction">${ex.instruction}</p>
      <div class="options list">${ex.options.map((o, i) => html`<button class="option" data-o="${o}"><span class="key">${i + 1}</span><span class="opt-label">${o}</span></button>`)}</div></div>`);
  const play = async () => {
    for (const [i, l] of d.lines.entries()) {
      const row = $(`.dl-line[data-i="${i}"]`, root);
      if (!row) return;
      row.hidden = false;
      row.classList.add('speaking');
      const shown = $('.dl-jp', row);
      await sayAs(root, d.cast[l.who], l.jp, { highlight: shown.textContent === '…' ? null : shown });
      row.classList.remove('speaking');
      await new Promise((r) => setTimeout(r, 250));
    }
    $('.dl-question', root) && ($('.dl-question', root).hidden = false);
    $('.replay-dl', root) && ($('.replay-dl', root).hidden = false);
  };
  play();
  $('.replay-dl', root).addEventListener('click', play);
  const pickIt = (btn) => {
    if (s.checked) return;
    const ok = btn.dataset.o === ex.answer;
    $$('.dl-question .option', root).forEach((x) => {
      x.disabled = true;
      if (x.dataset.o === ex.answer) x.classList.add('right');
      else if (x === btn) x.classList.add('wrong');
    });
    // Reveal the conversation with its translation.
    d.lines.forEach((l, i) => {
      const row = $(`.dl-line[data-i="${i}"]`, root);
      row.hidden = false;
      $('.dl-jp', row).textContent = l.jp;
      $('.dl-en', row).hidden = false;
      row.classList.add('tappable');
      row.onclick = () => sayAs(root, d.cast[l.who], l.jp, { highlight: $('.dl-jp', row) });
    });
    result(root, s, ok, { answerText: ex.answer, noHeart: true });
  };
  $$('.dl-question .option', root).forEach((btn) => btn.addEventListener('click', () => pickIt(btn)));
  s.keyHandler = (key) => {
    const btn = $$('.dl-question .option', root)[Number(key) - 1];
    if (btn && !$('.dl-question', root).hidden) pickIt(btn);
  };
  footer(root, s, { canCheck: false, text: 'Listen…', onCheck: () => {}, skip: { label: "Can't listen now", onSkip: () => skipListening(root, s, 'listen') } });
}

function renderTidbit(root, s) {
  const unit = s.node?.unit;
  // Mostly a fact about Japan; about one break in four shows a kanji to spot (it then comes back in Practice).
  const t = nextTidbit(app.state, Math.random, ['fact', 'kanji'], { facts: unit?.facts });
  app.save();
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-purple">Quick break</span></p>
    ${speakerBubble(s, t.kind === 'kanji' ? "Here's a kanji you'll see in Japan…" : 'Did you know? A fun fact about Japan…')}
    ${tidbitCard(t.kind, t.item)}`);
  $$('.tidbit [data-say]', root).forEach((b) => b.addEventListener('click', () => sayAs(root, s.speaker, b.dataset.say)));
  wireShare($('.lesson-body', root));
  if (t.kind === 'phrase') sayAs(root, s.speaker, t.item.jp.replace(/[～~]/g, ''));
  footer(root, s, { canCheck: true, text: 'Continue', onCheck: () => { s.done += 1; next(root, s); } });
}

const RENDERERS = {
  intro: renderIntro, trace: renderTrace, choice: renderChoice, build: renderBuild, match: renderMatch,
  speak: renderSpeak, grammar: renderGrammar, dialogue: renderDialogue, tidbit: renderTidbit,
};

// ---------- Finish ----------
function weekStrip(now) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const t = now - i * 86400000;
    days.push({ label: new Date(t).toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2), on: (app.state.daily[dayKey(t)] || 0) > 0, today: i === 0 });
  }
  return html`<div class="week">${days.map((d) => html`<div class="day ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}"><small>${d.label}</small><i>${d.on ? icon('check', 16) : ''}</i></div>`)}</div>`;
}

function finish(root, s) {
  cleanup(s);
  app.inLesson = false;
  const now = app.now();
  const bonusXp = Math.min(10, s.speedBonus);
  const summary = completeSession(app.state, { node: s.node, mode: s.mode, results: s.results, mistakes: s.mistakes, now, bonusXp });
  app.save();
  sfx('complete');
  const secs = Math.round((now - s.startedAt) / 1000);
  const accuracy = s.answered ? Math.round(((s.answered - s.mistakes) / s.answered) * 100) : 100;
  const title = s.mode === 'practice' ? 'Practice complete!' : s.node?.kind === 'story' ? 'Story complete!' : summary.perfect ? 'Perfect lesson!' : 'Lesson complete!';
  const extras = [];
  if (summary.streakExtended) extras.push(html`<p class="pill pill-orange">${icon('flame', 16)} ${summary.streak} day streak!</p>`);
  if (bonusXp) extras.push(html`<p class="pill pill-gold">${icon('bolt', 16)} Speed bonus +${bonusXp} XP</p>`);
  if (summary.goalReached) extras.push(html`<p class="pill pill-gold">${icon('star', 16)} Daily goal reached! +5 gems</p>`);
  if (s.mode === 'practice') extras.push(html`<p class="pill pill-red">${icon('heart', 16)} +1 heart</p>`);
  if (summary.levelUp && s.node?.kind !== 'review') extras.push(html`<p class="pill pill-green">${icon('star', 16)} Level ${summary.levelUp} of ${MAX_LEVEL}</p>`);

  mount(root, html`<div class="complete">
    <div class="petals" aria-hidden="true">${raw(Array.from({ length: 28 }, (_, i) => `<i style="--i:${i};--x:${(i * 37) % 100}"></i>`).join(''))}</div>
    ${mascot('cheer', 140)}
    <h1>${title}</h1>
    <div class="extras">${extras}</div>
    <div class="result-tiles">
      <div class="result gold"><span>Total XP</span><b>${icon('bolt', 20)} ${summary.xp}</b></div>
      <div class="result green"><span>${accuracy === 100 ? 'Amazing' : 'Accuracy'}</span><b>${icon('check', 20)} ${accuracy}%</b></div>
      <div class="result blue"><span>Time</span><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    ${weekStrip(now)}
    ${s.node?.kind === 'review' ? html`<div class="trophy-share">${art('🏆', 'art-lg')}<div><b>${s.node.unit.title} trophy earned!</b>${shareButton(`🏆 I earned the "${s.node.unit.title}" trophy learning Japanese with Hajime! ${summary.streak > 1 ? `🔥 ${summary.streak} day streak.` : ''}`, 'Share on WhatsApp')}</div></div>` : ''}
    <button class="btn btn-primary btn-block continue">Continue</button>
  </div>`);
  wireShare(root);
  $('.continue', root).addEventListener('click', () => {
    const go = () => app.go(location.hash.startsWith('#/lab') ? '#/lab' : s.mode === 'practice' ? '#/practice' : '#/learn');
    if (summary.goalReached) rewardPopup({ kind: 'bonus', title: 'Daily goal reached!', reward: html`${icon('gem', 30)} +5 gems`, text: 'Come back tomorrow to keep your streak going.', onDone: go });
    else go();
  });
}

// Keyboard: 1–9 pick an option, Enter checks / continues.
export function lessonKey(root, e) {
  const s = root.__session;
  if (!s) return;
  if (e.key === 'Enter') {
    const btn = $('.lesson-foot .check', root) || $('.complete .continue', root);
    if (btn && !btn.disabled) btn.click();
  } else if (/^[1-9]$/.test(e.key) && s.keyHandler && !s.checked) s.keyHandler(e.key);
}

// Plays a session of exercises: lessons from the path, stories, or practice.
// Each task has a countdown (speed bonus when answered in time). Correct answers move on
// automatically after a second; wrong or hesitant answers are noted and come back at the end in a
// "Let's correct the exercises you missed" round.
import { L, withRoman, joinChunks } from '../lang.js';
import { glossKey, sameTiles } from '../normalise.js';
import { ITEMS, NODE_BY_ID, MAX_LEVEL } from '../course.js';
import { app, modal, announce, doubleXpPill } from '../app.js';
import { lessonKeyIgnored, shortcutsEnabled, listeningMode } from '../a11y.js';
import { html, mount, raw, $, $$, fitText } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { person, nameOf } from '../characters.js';
import { art } from '../art.js';
import { speak, stopSpeaking, sfx, buzz, HAPTIC, canSpeakAloud, canRecognise, listen, speechMatches, SPEAKERS } from '../audio.js';
import { generateLesson, generatePractice, generateRetry, demoExercises, kanjiPracticeIds, kanaPracticeIds, romajiOfChunk, romajiMatch } from './generate.js';
import {
  completeSession, currentHearts, loseHeart, nodeLevel, isNodeUnlocked, dayKey, buyHearts, HEARTS_PRICE, costsHeart, retryAgain, testOutUnit, TESTOUT_PASS, unitIsLocked, speedOn,
} from '../progress.js';
import { nextTidbit, tidbitCard, readings, BREAK_KINDS } from '../tidbits.js';
import { GRAMMAR } from '../content/pack.js';
import { jpItem, jpChunk, speechOf, kanaExample, LANG_ATTR } from './text.js';
import { t, langName, countryName, countryIn } from '../strings.js';
import { explainCards } from './explain.js';
import { mountTrace } from './trace.js';
import { rewardPopup, comboBurst } from '../fx.js';
import { celebrationHtml, pickCelebration } from '../celebrate.js';

let lastParty = null; // the last celebration shown, so the next one differs
import { questChest } from '../screens/quests.js';
import { shareButton, wireShare } from '../share.js';
import { saveResume, clearResume, readResume } from '../resume.js';
import { applySnapshot, canMistype, forgiveMistype } from '../usability.js';

const PRAISE = ['Nicely done!', 'Great job!', 'Correct!', 'Awesome!', L.cheers[2][0], 'You got it!', 'Perfect!', L.cheers[1][0]].map((p) => t(p));
const SPEED_BONUS_MAX = 5; // XP a session can earn from quick answers
// Share of the time limit after which a right answer counts as hesitant: a bit more room when building or typing.
const hesitationRatio = (ex) => (ex.type === 'build' || ex.type === 'recall' ? 0.75 : 0.6);
const HOUR = 60 * 60 * 1000;
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
    case 'cloze': return 15;
    default: return null;
  }
}

function label(item, kind) {
  if (kind === 'romaji') return item.romaji;
  if (kind === 'en') return item.en;
  return item.jp;
}

// Listening tasks: Off in Profile is permanent; "Can't listen now" mutes them for an hour.
const listenOff = () => listeningMode(app.state.settings) === 'off' || (app.state.settings.listenOffUntil || 0) > app.now();
// "Show text": audio prompts and dialogue lines also show the words, for learners who cannot hear.
const showText = () => listeningMode(app.state.settings) === 'text';
const speakOff = () => (app.state.settings.speakOffUntil || 0) > app.now();
const needsListening = (ex) => ex.prompt === 'audio' || ['audio', 'fast', 'dictation'].includes(ex.mode) || ex.type === 'dialogue' || ex.type === 'speak';

export function startSession(root, { nodeId, itemIds, demo, kanjiOnly, kanaScript } = {}) {
  const now = app.now();
  const node = nodeId ? NODE_BY_ID.get(nodeId) : null;
  // "Test out" (#/lesson/<unit review>/testout): play the review of a locked unit; 85% or better skips its lessons.
  const testOut = !!node && node.kind === 'review' && location.hash.endsWith('/testout') && unitIsLocked(app.state, node.unit);
  if (nodeId && (!node || node.kind === 'chest' || (!isNodeUnlocked(app.state, node) && !app.testMode && !testOut))) return app.go('#/learn');
  const mode = node ? 'lesson' : 'practice';
  if (demo && !app.testMode) return app.go('#/profile'); // demos only ever touch test progress
  // Hearts only matter when replaying a finished node: a node's first play never costs any.
  if (mode === 'lesson' && !testOut && nodeLevel(app.state, node) > 0 && currentHearts(app.state, now) <= 0) return app.go('#/practice');

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
    node, mode, opts, testOut,
    level: node ? nodeLevel(app.state, node) : 0, // hearts are only at stake when replaying a finished node
    retryMisses: new Map(), passAnswered: 0, passWrong: 0,
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
  offerResume(root, s);
}

// A lesson left half-way is offered again for 24 hours: continue exactly where it stopped, or start over.
// (#/lesson/<id>/resume, from the Learn screen's card, continues without asking.)
function offerResume(root, s) {
  const snap = s.node && !s.testOut && !location.hash.includes('lab') ? readResume(app.now(), app.testMode, s.node.id) : null;
  const fresh = () => {
    if (s.node) clearResume(app.testMode);
    next(root, s);
  };
  const carryOn = () => {
    applySnapshot(s, snap);
    next(root, s);
  };
  if (!snap) return fresh();
  if (location.hash.endsWith('/resume')) return carryOn();
  const left = snap.queue.length;
  modal(html`<div class="center">${mascot('happy', 96)}<h2>${t('Continue where you left off?')}</h2>
    <p class="muted">${t(left === 1 ? '{n} exercise left in this lesson.' : '{n} exercises left in this lesson.', { n: left })}</p></div>`, [
    { label: t('Continue where you left off'), onClick: carryOn },
    { label: t('Start again'), kind: 'secondary', onClick: fresh },
  ], { dismissable: false });
}

// Jumps straight to the lesson-complete screen (used by the phone-screen check, never by the app itself).
export function finishNow(root) {
  const s = root.__session;
  if (!s) return;
  s.queue.length = 0;
  s.missed.clear();
  finish(root, s);
}

function renderShell(root, s) {
  const level = s.node ? nodeLevel(app.state, s.node) : 0;
  const timed = speedOn(app.state);
  const hearts = currentHearts(app.state, app.now());
  mount(root, html`<div class="lesson">
    <h1 class="sr-only">${s.node ? s.node.title : t('Practice')}</h1>
    <header class="lesson-top">
      <button class="icon-btn quit" aria-label="${t('Quit')}">${icon('close', 26)}</button>
      <div class="bar bar-lg" role="progressbar" aria-label="${t('Lesson progress')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar-fill" style="width:0%"></div></div>
      ${doubleXpPill()}
      ${s.mode === 'lesson' ? html`<span class="stat stat-hearts" role="img" aria-label="${t('Hearts: {n}', { n: hearts })}">${icon('heart', 24)}<b class="hearts-n">${hearts}</b></span>`
        : html`<span class="pill pill-blue">${t('Practice')}</span>`}
    </header>
    <div class="timer ${timed ? '' : 'off'}" role="timer" aria-live="off"><span class="timer-n"></span><div class="timer-bar" aria-hidden="true"><i></i></div><button class="link timer-off" hidden>${t('Turn off timer')}</button></div>
    ${s.node ? html`<div class="lesson-meta"><b>${t('Section {n} – Unit {m}', { n: s.node.sectionIndex + 1, m: s.node.unitIndex + 1 })}</b> · ${s.node.title}${s.node.kind === 'lesson' ? ` · ${t('Level {n}', { n: Math.min(level + 1, MAX_LEVEL) })}` : ''}</div>` : ''}
    <main class="lesson-body"></main>
    <footer class="lesson-foot"></footer>
    <div class="explain-sheet" role="dialog" aria-modal="true" aria-label="${t('Explain my answer')}" hidden></div>
  </div>`);
  $('.timer-off', root).addEventListener('click', () => timerOff(root, s));
  $('.quit', root).addEventListener('click', () =>
    modal(html`<div class="center">${mascot('sad', 96)}<h2>${t('Wait, don\'t go!')}</h2><p class="muted">${t('You\'ll lose your progress in this lesson.')}</p></div>`, [
      { label: t('Keep learning') },
      ...(speedOn(app.state) ? [{ label: t('Turn off timer'), kind: 'ghost', onClick: () => timerOff(root, s) }] : []),
      { label: t('End session'), kind: 'danger-ghost', onClick: () => quit(s) },
    ]),
  );
}

// The countdown can be switched off for good (it is a setting in Profile too).
function timerOff(root, s) {
  app.state.settings.speed = false;
  app.save();
  stopTimer(s);
  const box = $('.timer', root);
  box.classList.add('idle');
  $('.timer-off', root).hidden = true;
  announce(t('Timer turned off. You can turn it back on in Profile.'));
}

// Focus follows the lesson: after a new task is drawn it lands on the task's heading, so a keyboard or screen-reader
// user starts reading at the question (the controls come right after).
function focusTask(root) {
  const target = $('.lesson-body .instruction', root) || $('.lesson-body .bubble', root) || $('.lesson-body', root);
  if (!target) return;
  target.id ||= 'task-instr';
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

// The explain sheet covers the lesson: keep Tab (and screen readers) out of what is behind it.
function sheetOpen(root, open) {
  $('.explain-sheet', root).hidden = !open;
  for (const sel of ['.lesson-top', '.timer', '.lesson-body', '.lesson-foot']) {
    const el = $(sel, root);
    if (el) el.inert = open;
  }
}

// Marks an option after the check and says so in words (colour alone is not enough).
function markOption(b, kind) {
  b.classList.add(kind);
  b.insertAdjacentHTML('beforeend', `<span class="sr-only">, ${kind === 'right' ? t('Correct') : t('Your answer, not correct')}</span>`);
}

function cleanup(s) {
  stopTimer(s);
  stopSpeaking();
}

function quit(s) {
  cleanup(s);
  if (s.node) clearResume(app.testMode);
  app.inLesson = false;
  app.go(location.hash.startsWith('#/practice') ? '#/practice' : location.hash.startsWith('#/lab') ? '#/lab' : '#/learn');
}

function updateProgress(root, s) {
  const pct = Math.min(100, (s.done / s.total) * 100);
  $('.lesson-top .bar-fill', root).style.width = `${pct}%`;
  $('.lesson-top .bar', root).setAttribute('aria-valuenow', String(Math.round(pct)));
  const h = $('.hearts-n', root);
  if (h) {
    h.textContent = currentHearts(app.state, app.now());
    h.parentElement.setAttribute('aria-label', t('Hearts: {n}', { n: h.textContent }));
  }
}

// ---------- Timer ----------
function startTimer(root, s, seconds) {
  stopTimer(s);
  const box = $('.timer', root);
  if (!seconds || !speedOn(app.state)) {
    box.classList.add('idle');
    return;
  }
  box.classList.remove('idle', 'late', 'urgent');
  const tm = { limit: seconds * 1000, started: performance.now(), late: false, lastTick: null };
  s.timer = tm;
  const n = $('.timer-n', box);
  const bar = $('.timer-bar i', box);
  // The first countdown a learner meets says how to turn it off.
  const tip = $('.timer-off', box);
  tip.hidden = !(s.timedCount === 0 && !app.state.settings.timerTipSeen);
  if (!tip.hidden) app.state.settings.timerTipSeen = true;
  const tick = () => {
    const left = tm.limit - (performance.now() - tm.started);
    const secs = Math.max(0, Math.ceil(left / 1000));
    n.textContent = `${secs}s`;
    bar.style.width = `${Math.max(0, (left / tm.limit) * 100)}%`;
    if (secs <= 3 && secs > 0 && tm.lastTick !== secs) {
      if (!tm.lastTick) announce(t('{n} seconds left', { n: secs }));
      tm.lastTick = secs;
      box.classList.add('urgent');
      sfx('tick');
    }
    if (left <= 0 && !tm.late) {
      tm.late = true;
      box.classList.add('late');
      sfx('timeup');
      n.textContent = t("Time's up");
      announce(t("Time's up"));
    }
  };
  tick();
  tm.handle = setInterval(tick, 200);
}

function stopTimer(s) {
  const tm = s.timer;
  if (!tm) return null;
  clearInterval(tm.handle);
  s.timer = null;
  const elapsed = performance.now() - tm.started;
  return { elapsed, late: tm.late || elapsed > tm.limit, ratio: elapsed / tm.limit };
}

// ---------- Flow ----------
function next(root, s) {
  stopTimer(s);
  stopSpeaking();
  sheetOpen(root, false);
  updateProgress(root, s);
  s.current = s.queue.shift();
  s.checked = false;
  s.keyHandler = null;
  if (!s.current) {
    if (s.missed.size && !s.retryRound && !s.testOut) return retryIntro(root, s);
    return finish(root, s);
  }
  saveResume(s, app.now(), app.testMode);
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
  focusTask(root);
  // Tap a word of the Japanese sentence to hear it (not in reading tests, where it would give the answer).
  if (s.current.kind !== 'read') {
    $$('.prompt-person .chunk', root).forEach((c) => {
      c.setAttribute('tabindex', '0');
      c.setAttribute('role', 'button');
      const say = () => {
        c.classList.add('chunk-say');
        setTimeout(() => c.classList.remove('chunk-say'), 700);
        sayAs(root, s.speaker, c.dataset.chunk, { highlight: c });
      };
      c.addEventListener('click', say);
      c.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        say();
      });
    });
  }
  $$('.show-romaji', root).forEach((b) => b.addEventListener('click', () => {
    b.previousElementSibling?.classList.remove('rt-hidden');
    b.remove();
  }));
}

function retryIntro(root, s) {
  s.retryRound = true;
  startTimer(root, s, null); // no countdown on this screen
  const retry = generateRetry([...s.missed], app.state);
  s.queue.push(...retry);
  s.total += retry.length + 1;
  // Slow answers and hints come back too, but they were not mistakes: say so.
  const wrong = [...s.missed].filter((id) => s.results.get(id)?.wrong).length;
  const slow = s.missed.size - wrong;
  const text = t(!wrong ? 'You got everything right! Let\'s go over the ones that took you a little longer.'
    : slow ? 'Let\'s go over the ones you missed, and the ones that took you a little longer.'
      : 'Let\'s correct the exercises you missed!');
  mount($('.lesson-body', root), html`<div class="interlude">
    <div class="bubble bubble-lg">${text}</div>
    ${mascot('cheer', 150)}</div>`);
  footer(root, s, { canCheck: true, text: t('Continue'), onCheck: () => { s.done += 1; next(root, s); } });
  focusTask(root);
}

// ---------- Footer & feedback ----------
function footer(root, s, { canCheck = false, onCheck, text = t('Check'), skip } = {}) {
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
// item (for "explain"), noHeart (speech recognition misses), timing (from stopTimer), close (a typing slip: comes back like a slow answer).
function result(root, s, ok, opts = {}) {
  if (s.checked) return;
  s.checked = true;
  s.answered += 1;
  const ex = s.current;
  const timing = opts.timing ?? stopTimer(s);
  const ids = ex.itemIds || [];
  const hesitated = ok && ((timing && timing.ratio > hesitationRatio(ex)) || !!ex.hinted || !!opts.close);
  // The speed bonus is for answers in under half the time, and a session pays at most SPEED_BONUS_MAX of it.
  const onTime = ok && timing && !timing.late && timing.ratio < 0.5 && s.speedBonus < SPEED_BONUS_MAX;
  if (timing) s.timedCount += 1;
  if (!s.retryRound) {
    s.passAnswered += 1;
    if (!ok) s.passWrong += 1;
  }
  if (onTime) s.speedBonus += 1;

  if (ok) {
    s.done += 1;
    record(s, ids, 'right');
    // Every 5 right answers in a row (that count), a short celebration.
    s.combo = (s.combo || 0) + 1;
    s.bestRun = Math.max(s.bestRun || 0, s.combo);
    if (s.combo % 5 === 0) {
      comboBurst(s.combo);
      setTimeout(() => sfx('bonus'), 150);
    }
    if (hesitated) {
      record(s, ids, 'hesitated');
      ids.forEach((id) => s.missed.add(id));
    }
    sfx('correct');
    buzz(HAPTIC.right);
  } else {
    s.mistakes += 1;
    s.combo = 0;
    record(s, ids, 'wrong');
    ids.forEach((id) => s.missed.add(id));
    sfx('wrong');
    buzz();
    // In the retry round a missed task comes back once more; after the second miss the answer is on screen
    // below and we move on. Otherwise it comes back in the retry round instead.
    if (s.retryRound) {
      const key = ids.join('+') || ex.type;
      const misses = (s.retryMisses.get(key) || 0) + 1;
      s.retryMisses.set(key, misses);
      if (retryAgain(misses)) s.queue.push({ ...ex });
      else s.done += 1;
    } else s.done += 1;
    // No hearts in a node's first play, in the retry round, or for speech misses (see costsHeart).
    if (costsHeart({ mode: s.mode, level: s.level, retryRound: s.retryRound, noHeart: opts.noHeart })) {
      loseHeart(app.state, app.now());
      app.save();
    }
  }
  updateProgress(root, s);
  saveResume(s, app.now(), app.testMode, { includeCurrent: false });
  const outOfHearts = s.mode === 'lesson' && currentHearts(app.state, app.now()) <= 0;
  const item = opts.item || ITEMS.get(ex.itemId);
  const canExplain = item && ['word', 'sentence', 'kana', 'kanji', 'kword', 'radical'].includes(item.type);
  const foot = $('.lesson-foot', root);
  foot.className = `lesson-foot ${ok ? 'good' : 'bad'}`;
  const verdict = ok ? pickOne(PRAISE) : t('Correct answer:');
  const badges = [];
  if (onTime && !hesitated) badges.push(html`<span class="pill pill-gold">${icon('bolt', 14)} ${t('Speed bonus')}</span>`);
  if (hesitated) badges.push(html`<span class="pill pill-orange">${opts.mistyped ? t('You mistyped') : opts.close ? t('Almost right') : ex.hinted ? t('Used a hint') : t('A bit slow')} — ${t('we\'ll practise it again')}</span>`);
  // How sure were you? A lucky guess comes back like a slow answer; a slow answer you knew does not.
  const sureable = ok && !opts.mistyped && ids.length && !ex.hinted && ex.type !== 'intro' && ex.type !== 'match';
  if (sureable) badges.push(html`<button class="pill pill-sure" data-sure="${hesitated ? 'knew' : 'guessed'}">${t(hesitated ? '😎 I knew it' : '🤔 I guessed')}</button>`);
  mount(foot, html`<div class="foot-inner feedback">
    <div class="fb-text">
      ${ok ? html`<span class="fb-icon">${icon('check', 26)}</span>` : html`<span class="fb-icon fb-sad">${mascot('sad', 44)}</span>`}
      <div><b>${verdict}</b>
      ${!ok && opts.answerText ? html`<p class="jp-mix">${opts.answerText}</p>` : ''}
      ${opts.meaning ? html`<p class="fb-meaning">${item?.type === 'fword' && item.art ? art(item.art, 'art-inline') : ''} ${opts.meaning}</p>` : ''}
      ${badges.length ? html`<p class="fb-badges">${badges}</p>` : ''}</div>
    </div>
    <div class="fb-actions">
      ${!ok && opts.typed && canMistype(s.mistypes) ? html`<button class="btn btn-ghost mistyped">${t('I mistyped')}</button>` : ''}
      ${canExplain ? html`<button class="btn btn-ghost explain">${t('Explain')}</button>` : ''}
      <button class="btn ${ok ? 'btn-primary' : 'btn-danger'} check">${ok ? t('Continue') : t('Got it')}</button>
    </div></div>`);
  // No auto-continue: the learner moves on when ready, so there is always time to tap Explain.
  // (A held-down Enter must not skip straight through the feedback: clicks in the first moments are ignored.)
  const shownAt = performance.now();
  const go = () => {
    if (performance.now() - shownAt < 250) return;
    if (outOfHearts) noHearts(root, s);
    else next(root, s);
  };
  announce(`${ok ? '' : `${t('Not quite.')} `}${verdict}${!ok && opts.answerText ? ` ${opts.answerText}.` : ''}${opts.meaning ? ` ${opts.meaning}` : ''}`);
  $('.check', foot).addEventListener('click', go);
  $('.check', foot).focus({ preventScroll: true });
  $('.pill-sure', foot)?.addEventListener('click', (e) => {
    const knew = e.currentTarget.dataset.sure === 'knew';
    for (const id of ids) {
      const r = s.results.get(id);
      if (!r) continue;
      r.hesitated = Math.max(0, (r.hesitated || 0) + (knew ? -1 : 1));
      // Still missed if it was wrong or slow elsewhere in this lesson.
      if (knew && !r.wrong && !r.hesitated) s.missed.delete(id);
      if (!knew) s.missed.add(id);
    }
    $$('.fb-badges .pill-orange', foot).forEach((p) => p.remove());
    e.currentTarget.replaceWith(Object.assign(document.createElement('span'), {
      className: 'pill pill-orange',
      textContent: knew ? `👍 ${t('No extra practice')}` : `👍 ${t('It will come back soon')}`,
    }));
  });
  $('.mistyped', foot)?.addEventListener('click', () => mistyped(root, s, ids, opts));
  $('.explain', foot)?.addEventListener('click', () => {
    showExplain(root, s, item, ok ? null : opts.chosenLabel, go);
  });
}

// "I mistyped": a typed answer marked wrong counts as right (no heart was lost for typing anyway), but is
// kept as a slip, so the word still comes back like a slow answer. At most twice a lesson. The wrong answer
// is taken back out of the score and the task is marked again as a right one.
function mistyped(root, s, ids, opts) {
  if (!s.checked || !canMistype(s.mistypes)) return;
  s.mistypes = (s.mistypes || 0) + 1;
  s.mistakes -= 1;
  s.answered -= 1;
  if (!s.retryRound) {
    s.passAnswered -= 1;
    s.passWrong -= 1;
    s.done -= 1;
  } else {
    // The retry round put the task back in the queue, or showed the answer and moved on.
    const key = ids.join('+') || s.current.type;
    const misses = s.retryMisses.get(key) || 0;
    s.retryMisses.set(key, Math.max(0, misses - 1));
    if (retryAgain(misses)) s.queue.pop();
    else s.done -= 1;
  }
  forgiveMistype(s.results, ids);
  $('.recall-input', root)?.classList.replace('wrong', 'right');
  s.checked = false;
  result(root, s, true, { ...opts, close: true, mistyped: true, typed: false, timing: null, meaning: opts.answerText ? `${opts.answerText}${opts.meaning ? ` — ${opts.meaning}` : ''}` : opts.meaning });
}

function showExplain(root, s, item, chosenLabel, go) {
  const cards = explainCards(item, { chosenLabel });
  const sheet = $('.explain-sheet', root);
  sheetOpen(root, true);
  const render = (i) => mount(sheet, html`<div class="ex-head"><button class="icon-btn back" aria-label="${t('Back')}">${icon('arrow', 24)}</button><h2>${t('Explain my answer')}</h2></div>
    <div class="ex-chips">${cards.map((c, j) => html`<button class="tile ex-chip jp ${j === i ? 'on' : ''}" aria-pressed="${String(j === i)}" data-i="${j}">${c.chip}</button>`)}</div>
    <div class="card ex-card">${cards[i].body}</div>
    <button class="btn btn-secondary btn-block ex-continue">${t('Continue lesson')}</button>`);
  const wire = (i) => {
    render(i);
    $$('.ex-chip', sheet).forEach((b) => b.addEventListener('click', () => wire(Number(b.dataset.i))));
    $('.back', sheet).addEventListener('click', () => {
      sheetOpen(root, false);
      $('.lesson-foot .explain', root)?.focus({ preventScroll: true });
    });
    $('.ex-continue', sheet).addEventListener('click', () => {
      sheetOpen(root, false);
      go();
    });
    $('.back', sheet).focus({ preventScroll: true });
  };
  wire(0);
}

function noHearts(root, s) {
  cleanup(s);
  const canBuy = app.state.gems >= HEARTS_PRICE;
  modal(html`<div class="center">${mascot('sad', 100)}<h2>${t('Out of hearts')}</h2><p class="muted">${t('Hearts refill over time. A practice session earns one back right away — and practice never costs hearts.')}${canBuy ? '' : ` ${t('A full refill costs {price} gems (you have {n}). Earn gems from lessons, chests, missions and your daily goal.', { price: HEARTS_PRICE, n: app.state.gems })}`}</p></div>`, [
    // Gems refill every heart and the lesson carries on where it stopped.
    ...(canBuy ? [{ label: html`${t('Refill hearts')} · ${icon('gem', 16)} ${HEARTS_PRICE}`, onClick: () => {
      buyHearts(app.state, app.now());
      app.save();
      sfx('bonus');
      updateProgress(root, s);
      next(root, s);
    } }] : []),
    { label: t('Practice to earn hearts'), kind: canBuy ? 'secondary' : 'primary', onClick: () => { app.inLesson = false; app.go('#/practice/go'); } },
    { label: t('End lesson'), kind: 'danger-ghost', onClick: () => quit(s) },
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
// stacked: the character stands above the bubble (tall new-item cards get the full width).
function speakerBubble(s, content, { big = false, stacked = false } = {}) {
  return html`<div class="prompt prompt-person ${stacked ? 'stacked' : ''}">
    <div class="person-wrap" data-who="${s.speaker}">${person(s.speaker, stacked ? 64 : big ? 110 : 92)}<span class="person-name">${nameOf(s.speaker)}</span></div>
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
        // Latin alphabet: light up whole words (with the space after them), not letters.
        (L.latin ? n.textContent.match(/\S+\s*|\s+/g) || [] : [...n.textContent]).forEach((c) => {
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
    const piece = (u.tagName === 'RUBY' ? rubyText(u) : u.textContent).trim();
    const at = text.indexOf(piece, pos);
    starts.push(at === -1 ? pos : at);
    pos = (at === -1 ? pos : at) + piece.length;
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
      timer = setInterval(() => (current < units.length - 1 ? show(current + 1) : clearInterval(timer)), (L.latin ? 330 : 170) / rate);
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
    <button class="speaker" data-play="${text}" aria-label="${t('Play sound')}">${icon('speaker', 36)}</button>
    ${slow ? html`<button class="speaker slow" data-play="${text}" data-slow="1" aria-label="${t('Play slowly')}">${icon('turtle', 28)}</button>` : ''}</div>`;
}

// An audio prompt: the play buttons, and (setting "Show text") the words themselves under them.
function audioPrompt(item, opts) {
  return html`<div class="audio-wrap">${playButtons(speechOf(item), opts)}${showText() ? html`<div class="audio-text">${jpItem(item, false)}</div>` : ''}</div>`;
}

function wirePlay(root, s, extra = {}) {
  $$('[data-play]', root).forEach((b) =>
    b.addEventListener('click', () => sayAs(root, s.speaker, b.dataset.play, { slow: !!b.dataset.slow, ...extra })),
  );
}

// ---------- Exercise renderers ----------
// The word's memory trick as a hint, when asked to come up with the Japanese (using it counts like a
// slow answer, so the word comes back sooner).
function memoryHint(item, show) {
  if (!show || item.type !== 'word' || !item.memory) return '';
  return html`<div class="kana-hint"><button class="link hint-btn">💡 ${t('Hint')}</button><div class="hint-body" hidden><p class="intro-clue">🧠 ${item.memory}</p></div></div>`;
}

function introHtml(item, hint) {
  switch (item.type) {
    case 'kana':
      return html`<div class="jp jp-giant">${item.jp}</div><div class="intro-romaji">${item.romaji}</div>
        <p class="pill pill-blue">${item.script === 'katakana' ? t('Katakana') : t('Hiragana')}</p>${kanaExample(item)}${item.hint ? html`<p class="intro-hint">💡 ${item.hint}</p>` : ''}`;
    case 'kanji':
    case 'radical':
      return html`<div class="jp jp-giant">${item.jp}</div><div class="intro-en">${item.en}</div>
        ${item.parts?.length > 1 ? html`<p class="parts">${item.parts.map(([p, m], i) => html`${i ? html`<b class="op">+</b>` : ''}<span class="part"><b class="jp">${p}</b><small>${m}</small></span>`)}<b class="op">=</b><span class="part"><b class="jp">${item.jp}</b><small>${item.en}</small></span></p>` : ''}
        <p class="intro-clue">💡 <b>${t('Remember it:')}</b> ${item.story}</p>
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
        ${!hint && !L.latin ? html`<div class="intro-romaji">${item.romaji}</div>` : ''}
        <div class="intro-en">${item.en}</div>
        ${item.memory ? html`<p class="intro-clue">🧠 <b>${t('Memory trick:')}</b> ${item.memory}</p>` : ''}
        ${item.note ? html`<p class="intro-hint">💡 ${item.note}</p>` : ''}`;
    }
  }
}

function renderIntro(root, s) {
  const item = ITEMS.get(s.current.itemId);
  const kindLabel = t({ kana: 'New character', word: 'New word', sentence: 'New phrase', kanji: 'New kanji', kword: 'New kanji word', radical: 'New radical' }[item.type]);
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-gold">${icon('star', 14)} ${kindLabel}</span></p>
    ${speakerBubble(s, html`<div class="intro-card">${introHtml(item, s.current.hint)}
      <div class="intro-play"><button class="speaker small-speaker" data-play="${speechOf(item)}" aria-label="${t('Play sound')}">${icon('speaker', 24)}</button>
      <button class="speaker small-speaker slow" data-play="${speechOf(item)}" data-slow="1" aria-label="${t('Play slowly')}">${icon('turtle', 22)}</button></div></div>`, { stacked: true })}`);
  wirePlay(root, s);
  $$('[data-say]', root).forEach((b) => b.addEventListener('click', () => sayAs(root, s.speaker, b.dataset.say)));
  sayAs(root, s.speaker, speechOf(item));
  footer(root, s, { canCheck: true, text: t('Continue'), onCheck: () => { s.done += 1; next(root, s); } });
}

function renderTrace(root, s) {
  const item = ITEMS.get(s.current.itemId);
  const kana = item.type === 'kana';
  mount($('.lesson-body', root), html`<p class="instruction">${t('Trace the character')}</p>
    <div class="trace-head"><button class="speaker small-speaker" data-play="${speechOf(item)}" aria-label="${t('Play sound')}">${icon('speaker', 26)}</button>
      <div><b class="jp">${item.jp}</b><small>${item.romaji || item.en}</small></div>
      <button class="link replay">${icon('play', 14)} ${t('Watch again')}</button></div>
    <div class="trace-stage"><p class="trace-status" role="status" aria-live="polite">${t('Watch the strokes…')}</p><div class="trace-host"></div></div>`);
  wirePlay(root, s);
  sayAs(root, s.speaker, speechOf(item));
  const status = $('.trace-status', root);
  const tracer = mountTrace($('.trace-host', root), item.jp, {
    rounds: kana ? 2 : 1,
    onProgress: ({ round, rounds, index, total }) => {
      status.textContent = `${t(round === 1 ? 'Follow the arrow' : 'Now from memory')} · ${t('stroke {a} of {b}', { a: Math.min(index + 1, total), b: total })}${rounds > 1 ? ` · ${t('round {a}/{b}', { a: round, b: rounds })}` : ''}`;
    },
    onDone: () => result(root, s, true, { meaning: `${item.jp} = ${item.romaji || item.en}`, timing: null }),
  });
  $('.replay', root).addEventListener('click', () => tracer.replay());
  footer(root, s, { canCheck: false, text: t('Continue'), skip: { label: t('Skip'), onSkip: () => { s.done += 1; next(root, s); } } });
}

function promptFor(root, s, ex, item) {
  if (ex.prompt === 'audio') return speakerBubble(s, audioPrompt(item));
  if (ex.prompt === 'romaji') return speakerBubble(s, html`<div class="romaji-big">${item.romaji}</div>`);
  if (ex.prompt === 'en') return speakerBubble(s, html`<div class="en-prompt">${item.art ? art(item.art, 'art-lg') : ''}<span>${item.en}</span></div>`);
  if (ex.prompt === 'kanji') {
    return html`<div class="kanji-prompt"><div class="jp kanji-big-q">${item.jp}</div>
      ${ex.clue ? html`<button class="link clue-btn">💡 ${t('Show a clue')}</button><p class="clue" hidden>${ex.clue}</p>` : ''}</div>`;
  }
  const big = item.type === 'kana';
  // No play button when the task is to read it — hearing it would give the answer away.
  // Romaji hidden: offer it on demand (not when the task is to read it), kept in place so nothing jumps.
  const canPeek = !L.latin && !big && !ex.hint && ex.kind !== 'read' && ['word', 'sentence'].includes(item.type);
  // Reading tests (a word, or a kana asked for its sound) have no play button: hearing it is the answer.
  const isReading = ex.kind === 'read' || (item.type === 'kana' && ex.answerKind === 'romaji');
  return speakerBubble(s, html`${isReading ? '' : html`<button class="say-inline" data-play="${speechOf(item)}" aria-label="${t('Play sound')}">${icon('speaker', 22)}</button>`}
    <div class="jp-prompt-wrap"><div class="${big ? 'jp-huge' : 'jp-lg fit'} ${canPeek ? 'rt-hidden' : ''}">${big ? html`<span class="jp">${item.jp}</span>` : jpItem(item, ex.hint || canPeek)}</div>
    ${canPeek ? html`<button class="show-romaji">Show ${L.roman}</button>` : ''}</div>`);
}

// A wrong answer made up for the question (the noun under the wrong article) is carried by the exercise.
const optionItem = (ex, id) => ex.fakes?.[id] || ITEMS.get(id);

function optionHtml(opt, ex) {
  if (ex.answerKind === 'en') return html`<span class="opt-label">${opt.en}</span>`;
  if (ex.answerKind === 'romaji') return html`<span class="opt-label">${opt.romaji}</span>`;
  const isKana = opt.type === 'kana';
  const isKanji = ['kanji', 'radical'].includes(opt.type);
  return html`<span class="opt-label fit ${isKana ? 'jp-lg' : ''} ${isKanji ? 'opt-kanji' : ''}">${isKana || isKanji ? html`<span class="jp">${opt.jp}</span>` : jpItem(opt, ex.hint)}</span>`;
}

// Recall without options, typed. By default the meaning is shown and the learner types the word in
// romaji. Latin-alphabet courses add two more: `dictation` (hear a word or sentence, type it) and
// `translate` (read a sentence, type its meaning). Typing is harder than picking, so a miss costs no heart.
function renderRecall(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const target = item.type === 'sentence' ? joinChunks(item.jp) : item.jp; // what is typed in dictation
  const answers = [item.en, ...(item.accept || [])]; // what is accepted when translating
  const help = t(L.latin ? 'Accents and capitals don\'t matter.' : L.code === 'zh' ? 'Tone marks and spaces don\'t matter.' : 'Spaces and long vowels (ou / o) don\'t matter.');
  const mode = ex.mode;
  let prompt = speakerBubble(s, html`<div class="en-prompt">${item.art ? art(item.art, 'art-lg') : ''}<span>${item.en}</span></div>`);
  let placeholder = t('Type it in {lang}…', { lang: langName() });
  let instruction = t('How do you say this in {lang}?', { lang: langName() });
  let intro = t('From memory — no choices this time!');
  if (mode === 'dictation') {
    prompt = speakerBubble(s, audioPrompt(item));
    [placeholder, instruction, intro] = [t('Type what you hear…'), ex.instruction, t('Listen, then type what you hear.')];
  } else if (mode === 'translate') {
    prompt = promptFor(root, s, { ...ex, prompt: 'jp' }, item);
    [placeholder, instruction, intro] = [t('Type the meaning…'), ex.instruction, t('Type it in your own words.')];
  }
  mount($('.lesson-body', root), html`<p class="instruction">${instruction}</p>
    ${prompt}
    <input class="recall-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${placeholder}" aria-label="${t('Your answer')}" aria-describedby="task-instr" ${mode === 'translate' ? '' : html`lang="${LANG_ATTR}"`}>
    <p class="muted small recall-help">${intro} ${mode === 'translate' ? t('Capitals and punctuation don\'t matter.') : help}</p>
    ${mode ? '' : memoryHint(item, true)}`);
  wirePlay(root, s);
  $('.hint-btn', root)?.addEventListener('click', (e) => {
    e.currentTarget.remove();
    $('.hint-body', root).hidden = false;
    ex.hinted = true;
  });
  if (mode === 'dictation' || mode === 'translate') sayAs(root, s.speaker, speechOf(item));
  startTimer(root, s, null);
  const input = $('.recall-input', root);
  const answerText = mode === 'translate' ? item.en : mode === 'dictation' ? target : withRoman(item.jp, item.romaji);
  const said = mode ? `${target} = ${item.en}` : `${withRoman(item.jp, item.romaji)} = ${item.en}`;
  const check = () => {
    if (s.checked || !input.value.trim()) return;
    const match = mode === 'translate' ? (answers.some((a) => glossKey(a) === glossKey(input.value)) ? 'exact' : false)
      : romajiMatch(input.value, mode === 'dictation' ? target : item.romaji);
    input.disabled = true;
    input.classList.add(match ? 'right' : 'wrong');
    if (mode !== 'translate') sayAs(root, s.speaker, speechOf(item));
    result(root, s, !!match, { answerText, close: match === 'close', typed: true,
      meaning: match === 'close' ? t('Almost! It\'s spelled {w}', { w: L.latin ? target : `${item.romaji} (${item.jp})` }) : match || mode ? said : t('means “{en}”', { en: item.en }),
      chosenLabel: input.value, noHeart: true, timing: null });
  };
  input.addEventListener('input', () => setCheckEnabled(root, !!input.value.trim()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      check();
    }
  });
  footer(root, s, {
    onCheck: check,
    skip: mode === 'dictation' ? { label: t("Can't listen now"), onSkip: () => skipListening(root, s, 'listen') }
      : { label: t("I don't know"), onSkip: () => {
        if (s.checked) return;
        input.disabled = true;
        sayAs(root, s.speaker, speechOf(item));
        result(root, s, false, { answerText, meaning: mode ? said : t('means “{en}”', { en: item.en }), noHeart: true, timing: null });
      } },
  });
  setTimeout(() => input.focus(), 250);
}

// Guess first: hear and see a new word, guess what it means. Not scored, no countdown, no hearts.
function renderGuess(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  startTimer(root, s, null);
  mount($('.lesson-body', root), html`<p class="instruction">${t('New word — have a guess!')}</p>
    ${speakerBubble(s, html`<button class="say-inline" aria-label="${t('Play sound')}">${icon('speaker', 22)}</button><span class="jp-lg guess-word">${jpItem(item, true)}</span>`)}
    <p class="muted small guess-help">${t('No pressure: guessing first, even wrong, helps you remember it.')}</p>
    <div class="options list">${ex.options.map((en, i) => html`<button class="option" data-i="${i}" aria-pressed="false"><span class="key" aria-hidden="true">${i + 1}</span><span class="opt-label">${en}</span></button>`)}</div>`);
  const say = () => sayAs(root, s.speaker, speechOf(item));
  $('.say-inline', root).addEventListener('click', say);
  say();
  const pickGuess = (btn) => {
    if (s.checked) return;
    s.checked = true;
    const ok = ex.options[Number(btn.dataset.i)] === item.en;
    $$('.option', root).forEach((b) => {
      b.disabled = true;
      if (ex.options[Number(b.dataset.i)] === item.en) markOption(b, 'right');
      else if (b === btn) b.classList.add('guess-miss');
    });
    sfx(ok ? 'correct' : 'tap');
    const foot = $('.lesson-foot', root);
    foot.className = `lesson-foot ${ok ? 'good' : 'guess'}`;
    mount(foot, html`<div class="foot-inner feedback"><div class="fb-text"><span class="fb-icon">${ok ? icon('check', 26) : '💡'}</span>
      <div><b>${ok ? t('Good guess!') : t('Nice try!')}</b><p class="fb-meaning">${withRoman(item.jp, item.romaji)} = ${item.en}</p></div></div>
      <div class="fb-actions"><button class="btn btn-primary check">${t('Continue')}</button></div></div>`);
    $('.check', foot).addEventListener('click', () => { s.done += 1; next(root, s); });
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => pickGuess(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) pickGuess(b);
  };
  footer(root, s, { text: t('Pick a guess') });
}

function renderChoice(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const grid = ['kana', 'romaji'].includes(ex.answerKind) || (ex.answerKind === 'jp' && ['kanji', 'radical'].includes(item.type));
  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${promptFor(root, s, ex, item)}
    ${item.type === 'kana' && item.example ? html`<div class="kana-hint"><button class="link hint-btn">💡 ${t('Hint')}</button><div class="hint-body" hidden>${kanaExample(item, { asHint: true })}</div></div>` : ''}
    ${memoryHint(item, ex.kind === 'en2jp' || ex.kind === 'jp2en')}
    <div class="options ${grid ? 'grid' : 'list'}">${ex.options.map((id, i) => html`<button class="option" data-id="${id}" aria-pressed="false"><span class="key" aria-hidden="true">${i + 1}</span>${optionHtml(optionItem(ex, id), ex)}</button>`)}</div>`);
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
      if (b.dataset.id === ex.itemId) markOption(b, 'right');
      else if (b.dataset.id === chosen) markOption(b, 'wrong');
    });
    if (['word', 'sentence', 'kana', 'kword'].includes(item.type)) sayAs(root, s.speaker, speechOf(item));
    const meaning = item.en && ex.answerKind !== 'en' ? `${item.jp} = ${item.en}` : item.type === 'kana' ? `${item.jp} = ${item.romaji}${item.example ? ` — as in ${item.example.jp} (${item.example.romaji})` : ''}` : item.romaji && !L.latin ? `${item.jp} · ${item.romaji}` : null;
    result(root, s, ok, { answerText: label(item, ex.answerKind === 'kana' ? 'jp' : ex.answerKind), meaning, chosenLabel: ok ? null : label(optionItem(ex, chosen), ex.answerKind === 'kana' ? 'jp' : ex.answerKind) });
  };
  const choose = (btn) => {
    if (s.checked) return;
    $$('.option', root).forEach((b) => {
      b.classList.toggle('selected', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    chosen = btn.dataset.id;
    sfx('tap');
    if (['jp', 'kana'].includes(ex.answerKind) && ex.prompt !== 'audio') speak(speechOf(optionItem(ex, chosen)), { speaker: s.speaker });
    setCheckEnabled(root, true);
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => choose(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) choose(b);
  };
  footer(root, s, {
    onCheck: check,
    skip: ex.prompt === 'audio' ? { label: t("Can't listen now"), onSkip: () => skipListening(root, s, 'listen') } : null,
  });
}

function tileButton(ex, i, jpTiles, extra = '') {
  const sub = ex.tileRomaji?.[i];
  // The word's syllables sit side by side in one row (the tile itself stacks its content).
  return html`<button class="tile ${extra} ${jpTiles ? 'jp' : ''}" ${jpTiles ? html`lang="${LANG_ATTR}"` : ''} data-i="${i}">${jpTiles && sub ? html`<span class="ruby-on tile-word">${jpChunk(ex.tiles[i], true, sub)}</span>` : ex.tiles[i]}</button>`;
}

function renderBuild(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const jpTiles = ex.mode !== 'jp2en';
  let prompt;
  if (ex.mode === 'jp2en') prompt = promptFor(root, s, { ...ex, prompt: 'jp' }, item);
  else if (ex.mode === 'audio') prompt = speakerBubble(s, audioPrompt(item));
  else if (ex.mode === 'fast') prompt = speakerBubble(s, html`${audioPrompt(item, { slow: false })}<p class="muted small">${t('Natural speed — no slow mode!')}</p>`);
  else prompt = speakerBubble(s, html`<div class="en-prompt">${item.art ? art(item.art, 'art-lg') : ''}<span>${item.en}</span>
    ${ex.mode === 'spell' && ex.hint ? html`<div class="romaji-hint">${item.romaji}</div>` : ''}</div>`);

  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${prompt}
    <div class="answer-line" role="group" aria-label="${t('Your answer')}"></div>
    <div class="bank">${ex.tiles.map((t, i) => tileButton(ex, i, jpTiles))}</div>`);
  wirePlay(root, s, ex.mode === 'fast' ? { fast: true } : {});
  if (ex.mode === 'audio' || ex.mode === 'jp2en') sayAs(root, s.speaker, speechOf(item));
  if (ex.mode === 'fast') sayAs(root, s.speaker, speechOf(item), { fast: true });
  startTimer(root, s, timeLimit(ex));

  const placed = [];
  const line = $('.answer-line', root);
  const redraw = () => {
    mount(line, html`${placed.map((i) => tileButton(ex, i, jpTiles, 'placed'))}`);
    $$('.bank .tile', root).forEach((b) => {
      const used = placed.includes(Number(b.dataset.i));
      b.classList.toggle('used', used);
      b.setAttribute('aria-disabled', String(used));
    });
    $$('.tile.placed', line).forEach((b) =>
      b.addEventListener('click', () => {
        if (s.checked) return;
        const i = Number(b.dataset.i);
        placed.splice(placed.indexOf(i), 1);
        redraw();
        // The tile left the answer: focus goes back to its place in the bank.
        $(`.bank .tile[data-i="${i}"]`, root)?.focus({ preventScroll: true });
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
    skip: ex.mode === 'audio' || ex.mode === 'fast' ? { label: t("Can't listen now"), onSkip: () => skipListening(root, s, 'listen') } : null,
    onCheck: () => {
      const given = placed.map((i) => ex.tiles[i]);
      // When listening, tiles that sound the same as the answer count too.
      const sound = (chunks) => chunks.map(romajiOfChunk).map((r) => r.replace(/ /g, '')).join(L.latin ? ' ' : '');
      const ok = jpTiles
        ? sameTiles(given, ex.answer) || ((ex.mode === 'audio' || ex.mode === 'fast') && given.every(romajiOfChunk) && sound(given) === sound(ex.answer))
        : (ex.accept || [ex.answer.join(' ')]).some((a) => glossKey(a) === glossKey(given.join(' ')));
      line.classList.add(ok ? 'right' : 'wrong');
      sayAs(root, s.speaker, speechOf(item));
      result(root, s, ok, {
        answerText: jpTiles ? ex.answer.join(jpTiles && ex.mode !== 'spell' ? ' ' : '') : ex.answer.join(' '),
        meaning: L.latin ? (ex.mode === 'jp2en' ? item.text : item.en) : `${item.romaji}${ex.mode === 'jp2en' ? '' : ` — ${item.en}`}`,
        chosenLabel: ok ? null : given.join(jpTiles && !L.latin ? '' : ' '),
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
      html`<button class="option match-btn" data-side="l" data-id="${id}" aria-pressed="false">${l.type === 'kana' ? html`<span class="jp jp-lg">${l.jp}</span>` : ['kanji', 'radical'].includes(l.type) ? html`<span class="jp match-kanji">${l.jp}</span>` : jpItem(l, ex.hint)}</button>`,
      html`<button class="option match-btn" data-side="r" data-id="${right[i]}" aria-pressed="false">${label(r, ex.right)}</button>`,
    ];
  });
  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p><div class="match">${cells}</div>`);
  startTimer(root, s, timeLimit(ex));
  const sel = { l: null, r: null };
  const wrongIds = new Set();
  let matched = 0;
  footer(root, s, { canCheck: false, text: t('Check'), onCheck: () => {} });
  $$('.match-btn', root).forEach((b) =>
    b.addEventListener('click', () => {
      if (b.classList.contains('right') || s.checked) return;
      const side = b.dataset.side;
      $$(`.match-btn[data-side="${side}"]`, root).forEach((x) => { x.classList.remove('selected'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('selected');
      b.setAttribute('aria-pressed', 'true');
      sel[side] = b;
      if (side === 'l') speak(speechOf(ITEMS.get(b.dataset.id)), { speaker: s.speaker });
      else sfx('tap');
      if (!sel.l || !sel.r) return;
      const [l, r] = [sel.l, sel.r];
      sel.l = sel.r = null;
      if (l.dataset.id === r.dataset.id) {
        [l, r].forEach((x) => { x.classList.remove('selected'); x.classList.add('right'); x.disabled = true; x.insertAdjacentHTML('beforeend', `<span class="sr-only">, ${t('Matched')}</span>`); });
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
          result(root, s, true, { meaning: wrongIds.size ? t(wrongIds.size > 1 ? '{n} mix-ups — they\'ll come back at the end' : '{n} mix-up — it\'ll come back at the end', { n: wrongIds.size }) : t('All matched!') });
        }
      } else {
        wrongIds.add(l.dataset.id);
        wrongIds.add(r.dataset.id);
        [l, r].forEach((x) => { x.classList.remove('selected'); x.setAttribute('aria-pressed', 'false'); x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 400); });
        sfx('wrong');
        buzz();
      }
    }),
  );
}

function renderSpeak(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  mount($('.lesson-body', root), html`<p class="instruction">${t('Listen, then say it out loud')}</p>
    ${speakerBubble(s, html`<button class="say-inline" data-play="${speechOf(item)}" aria-label="${t('Play sound')}">${icon('speaker', 22)}</button>
      <div class="speak-text"><div class="jp-lg fit">${jpItem(item, true)}</div><div class="muted">${item.en}</div></div>`)}
    <div class="mic-area"><button class="mic" aria-label="${t('Start speaking')}">${icon('mic', 40)}</button><p class="mic-status" role="status" aria-live="polite">${t('Tap the microphone and repeat.')}</p></div>`);
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
    status.textContent = t('Listening…');
    const heard = await listen();
    mic.classList.remove('listening');
    const targets = [item.text || item.jp, ...(item.alt || [])];
    if (speechMatches(heard, targets)) {
      status.textContent = t('You said: {w}', { w: heard[0] });
      result(root, s, true, { meaning: `${item.text || item.jp} — ${item.en}` });
    } else if (++tries < 2) {
      sfx('wrong');
      status.textContent = heard.length ? t('I heard “{w}”. Try again!', { w: heard[0] }) : t('I didn\'t catch that. Try again!');
    } else {
      result(root, s, false, { answerText: item.text || item.jp, meaning: L.latin ? item.en : item.romaji, noHeart: true });
    }
  });
  footer(root, s, { canCheck: false, text: t('Check'), skip: { label: t("Can't speak now"), onSkip: () => skipListening(root, s, 'speak') } });
}

function renderGrammar(root, s) {
  const g = GRAMMAR[s.current.grammarId];
  const blocks = html`<div class="g-blocks">${g.blocks.map((b) => html`<div class="g-block g-${b.role}"><span class="jp" lang="${LANG_ATTR}">${jpChunk(b.jp, true)}</span><small>${b.en}</small></div>`)}</div>`;
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-purple">${t('Grammar in 15 seconds')}</span></p>
    <div class="card grammar-card"><h2>${g.title}</h2>${blocks}<p class="g-en">= ${g.en}</p><p>${g.rule}</p><p class="muted small">💡 ${g.tip}</p></div>`);
  speak(joinChunks(g.blocks.map((b) => b.jp)), { speaker: s.speaker });
  footer(root, s, { canCheck: true, text: t('Test me (15 s)'), onCheck: () => grammarCheck(root, s, g) });
}

function grammarCheck(root, s, g) {
  const { check } = g;
  mount($('.lesson-body', root), html`<p class="instruction">${t('Fill the gap — {en}', { en: check.en })}</p>
    <div class="g-blocks g-quiz">${check.prompt.map((c) => (c ? html`<div class="g-block g-noun"><span class="jp" lang="${LANG_ATTR}">${jpChunk(c, true)}</span></div>` : html`<div class="g-block g-gap">?</div>`))}</div>
    <div class="options grid">${check.options.map((o, i) => html`<button class="option" data-o="${o}"><span class="key" aria-hidden="true">${i + 1}</span><span class="jp jp-lg" lang="${LANG_ATTR}">${jpChunk(o, true)}</span></button>`)}</div>`);
  startTimer(root, s, 15);
  const pickIt = (b) => {
    if (s.checked) return;
    const ok = b.dataset.o === check.answer;
    $$('.option', root).forEach((x) => {
      x.disabled = true;
      if (x.dataset.o === check.answer) markOption(x, 'right');
      else if (x === b) markOption(x, 'wrong');
    });
    $('.g-gap', root).textContent = check.answer;
    result(root, s, ok, { answerText: check.answer, meaning: g.rule });
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => pickIt(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) pickIt(b);
  };
  footer(root, s, { canCheck: false, text: t('Pick an answer'), onCheck: () => {} });
}

// A sentence (or a noun) with a gap, and three (or two) tiles to fill it with.
function renderCloze(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${ex.art ? html`<div class="cloze-art">${art(ex.art, 'art-lg')}</div>` : ''}
    <div class="g-blocks g-quiz">${ex.prompt.map((c) => (c === null ? html`<div class="g-block g-gap">?</div>` : html`<div class="g-block g-noun"><span class="jp" lang="${LANG_ATTR}">${c}</span></div>`))}</div>
    <div class="options grid">${ex.options.map((o, i) => html`<button class="option" data-o="${o}"><span class="key" aria-hidden="true">${i + 1}</span><span class="jp jp-lg" lang="${LANG_ATTR}">${o}</span></button>`)}</div>`);
  startTimer(root, s, timeLimit(ex));
  const pickIt = (b) => {
    if (s.checked) return;
    const ok = b.dataset.o === ex.answer;
    $$('.option', root).forEach((x) => {
      x.disabled = true;
      if (x.dataset.o === ex.answer) markOption(x, 'right');
      else if (x === b) markOption(x, 'wrong');
    });
    $('.g-gap', root).textContent = ex.answer;
    sayAs(root, s.speaker, speechOf(item));
    result(root, s, ok, { answerText: ex.answer, meaning: `${item.type === 'sentence' ? joinChunks(item.jp) : item.jp} = ${item.en}`, chosenLabel: ok ? null : b.dataset.o });
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => pickIt(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) pickIt(b);
  };
  footer(root, s, { canCheck: false, text: t('Pick an answer'), onCheck: () => {} });
}

function renderDialogue(root, s) {
  const ex = s.current;
  const d = ITEMS.get(ex.itemId);
  const [a, b] = d.cast;
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-blue">${icon('chat', 14)} ${d.title}</span></p>
    <div class="dialogue">
      <div class="dl-cast"><div class="person-wrap" data-who="${a}">${person(a, 84)}<span class="person-name">${nameOf(a)}</span></div>
        <div class="person-wrap" data-who="${b}">${person(b, 84)}<span class="person-name">${nameOf(b)}</span></div></div>
      <div class="dl-lines">${d.lines.map((l, i) => html`<div class="dl-line side-${l.who}" data-i="${i}" hidden><span class="dl-who">${nameOf(d.cast[l.who])}</span><span class="jp dl-jp">${showText() ? l.jp : '…'}</span><small class="dl-en" hidden>${l.en}</small></div>`)}</div>
      <button class="link replay-dl" hidden>${icon('play', 14)} ${t('Listen again')}</button>
    </div>
    <div class="dl-question" hidden><p class="instruction">${ex.instruction}</p>
      <div class="options list">${ex.options.map((o, i) => html`<button class="option" data-o="${o}"><span class="key" aria-hidden="true">${i + 1}</span><span class="opt-label">${o}</span></button>`)}</div></div>`);
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
      if (x.dataset.o === ex.answer) markOption(x, 'right');
      else if (x === btn) markOption(x, 'wrong');
    });
    // Reveal the conversation with its translation.
    d.lines.forEach((l, i) => {
      const row = $(`.dl-line[data-i="${i}"]`, root);
      row.hidden = false;
      $('.dl-jp', row).textContent = l.jp;
      $('.dl-en', row).hidden = false;
      row.classList.add('tappable');
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.onclick = () => sayAs(root, d.cast[l.who], l.jp, { highlight: $('.dl-jp', row) });
      row.onkeydown = (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        row.click();
      };
    });
    result(root, s, ok, { answerText: ex.answer, noHeart: true });
  };
  $$('.dl-question .option', root).forEach((btn) => btn.addEventListener('click', () => pickIt(btn)));
  s.keyHandler = (key) => {
    const btn = $$('.dl-question .option', root)[Number(key) - 1];
    if (btn && !$('.dl-question', root).hidden) pickIt(btn);
  };
  footer(root, s, { canCheck: false, text: t('Listen…'), onCheck: () => {}, skip: { label: t("Can't listen now"), onSkip: () => skipListening(root, s, 'listen') } });
}

function renderTidbit(root, s) {
  const unit = s.node?.unit;
  // Mostly a fun fact about the country; about one break in four shows a kanji to spot (it then comes back in Practice).
  const tid = nextTidbit(app.state, Math.random, BREAK_KINDS, { facts: unit?.facts });
  app.save();
  mount($('.lesson-body', root), html`<p class="instruction"><span class="pill pill-purple">${t('Quick break')}</span></p>
    ${speakerBubble(s, tid.kind === 'kanji' ? t('Here\'s a {thing} you\'ll see {where}…', { thing: L.charOne, where: countryIn() }) : t('Did you know? A fun fact about {country}…', { country: countryName() }))}
    ${tidbitCard(tid.kind, tid.item)}`);
  $$('.tidbit [data-say]', root).forEach((b) => b.addEventListener('click', () => sayAs(root, s.speaker, b.dataset.say)));
  wireShare($('.lesson-body', root));
  if (tid.kind === 'phrase') sayAs(root, s.speaker, tid.item.jp.replace(/[～~]/g, ''));
  footer(root, s, { canCheck: true, text: t('Continue'), onCheck: () => { s.done += 1; next(root, s); } });
}

const RENDERERS = {
  recall: renderRecall, guess: renderGuess, intro: renderIntro, trace: renderTrace, choice: renderChoice, build: renderBuild, match: renderMatch,
  speak: renderSpeak, cloze: renderCloze, grammar: renderGrammar, dialogue: renderDialogue, tidbit: renderTidbit,
  conjugation: renderPick, tone: renderPick, 'type-sentence': renderTypeSentence,
};

// ---------- Finish ----------
function weekStrip(now) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = now - i * 86400000;
    days.push({ label: new Date(day).toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2), on: (app.state.daily[dayKey(day)] || 0) > 0, today: i === 0 });
  }
  return html`<div class="week">${days.map((d) => html`<div class="day ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}"><small>${d.label}</small><i>${d.on ? icon('check', 16) : ''}</i></div>`)}</div>`;
}

function finish(root, s) {
  cleanup(s);
  if (s.node) clearResume(app.testMode);
  app.inLesson = false;
  const now = app.now();
  const bonusXp = Math.min(SPEED_BONUS_MAX, s.speedBonus);
  // Testing out of a unit: first-pass accuracy decides; passing marks the unit's lessons as played once.
  const passed = s.testOut && s.passAnswered > 0 && 1 - s.passWrong / s.passAnswered >= TESTOUT_PASS;
  const summary = completeSession(app.state, { node: s.testOut ? null : s.node, mode: s.testOut ? 'test' : s.mode, results: s.results, mistakes: s.mistakes, now, bonusXp, bestRun: s.bestRun || 0 });
  const skipped = passed ? testOutUnit(app.state, s.node.unit) : 0;
  app.save();
  // Google Drive sync (only when the owner has set it up and the learner turned it on): loaded on demand.
  if (!s.testOut) import('../drive.js').then((d) => d.syncOn() && d.autoSync(app.state, now)).catch(() => {});
  sfx('complete');
  const secs = Math.round((now - s.startedAt) / 1000);
  const accuracy = s.answered ? Math.round(((s.answered - s.mistakes) / s.answered) * 100) : 100;
  const title = s.testOut ? t(passed ? 'Unit skipped — nice!' : 'Not quite yet')
    : t(s.mode === 'practice' ? 'Practice complete!' : s.node?.kind === 'story' ? 'Story complete!' : summary.perfect ? 'Perfect lesson!' : 'Lesson complete!');
  const extras = [];
  if (s.testOut) extras.push(html`<p class="pill ${passed ? 'pill-green' : 'pill-orange'}">${passed ? t('{n} lessons unlocked as played', { n: skipped }) : t('You need {n}% to skip — the lessons will get you there', { n: Math.round(TESTOUT_PASS * 100) })}</p>`);
  if (summary.streakExtended) extras.push(html`<p class="pill pill-orange">${icon('flame', 16)} ${t('{n} day streak!', { n: summary.streak })}</p>`);
  if (summary.milestone) extras.push(html`<p class="pill pill-gold">${icon('flame', 16)} ${t('{n}-day streak milestone!', { n: summary.milestone })}</p>`);
  if (summary.sundayBonus) extras.push(html`<p class="pill pill-purple">${icon('bolt', 16)} ${t('Sunday bonus: double XP for 15 minutes!')}</p>`);
  for (const q of summary.quests.done) extras.push(html`<p class="pill pill-purple">${icon('check', 16)} ${t('Quest done: {text} +{n} gems', { text: t(q.text), n: q.gems })}</p>`);
  if (bonusXp) extras.push(html`<p class="pill pill-gold">${icon('bolt', 16)} ${t('Speed bonus +{n} XP', { n: bonusXp })}</p>`);
  if (summary.goalReached) extras.push(html`<p class="pill pill-gold">${icon('star', 16)} ${t('Daily goal reached! +5 gems')}</p>`);
  if (summary.mistakesCleared) extras.push(html`<p class="pill pill-green">${icon('check', 16)} ${t('All mistakes fixed! +5 gems')}</p>`);
  if (s.mode === 'practice') extras.push(html`<p class="pill pill-red">${icon('heart', 16)} ${t('+1 heart')}</p>`);
  if (summary.levelUp && s.node?.kind !== 'review') extras.push(html`<p class="pill pill-green">${icon('star', 16)} ${t('Level {a} of {b}', { a: summary.levelUp, b: MAX_LEVEL })}</p>`);

  // A random celebration each time (a perfect lesson always gets the fireworks and a bigger cheer).
  const party = accuracy === 100 && !s.testOut ? 'fireworks' : pickCelebration(L.code, lastParty);
  lastParty = party;
  mount(root, html`<div class="complete">
    ${raw(celebrationHtml(party))}
    ${mascot(party === 'dance' ? 'dance' : 'cheer', accuracy === 100 ? 180 : 140)}
    <h1>${title}</h1>
    <div class="extras">${extras}</div>
    <div class="result-tiles">
      <div class="result gold"><span>${t('Total XP')}</span><b>${icon('bolt', 20)} ${summary.xp}</b></div>
      <div class="result green ${accuracy < 70 ? 'low' : ''}"><span>${t(accuracy === 100 ? 'Amazing' : 'Accuracy')}</span><b>${icon('check', 20)} ${accuracy}%</b></div>
      <div class="result blue"><span>${t('Time')}</span><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    ${weekStrip(now)}
    ${s.node?.kind === 'review' && !s.testOut ? html`<div class="trophy-share">${art('🏆', 'art-lg')}<div><b>${t('{unit} trophy earned!', { unit: s.node.unit.title })}</b>${shareButton(`🏆 I earned the "${s.node.unit.title}" trophy learning ${L.name} with Hajime! ${summary.streak > 1 ? `🔥 ${summary.streak} day streak.` : ''}`, t('Share on WhatsApp'))}</div></div>` : ''}
    <button class="btn btn-primary btn-block continue">${t('Continue')}</button>
  </div>`);
  wireShare(root);
  const heading = $('h1', root);
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
  $('.continue', root).addEventListener('click', () => {
    const go = () => app.go(location.hash.startsWith('#/lab') ? '#/lab' : s.mode === 'practice' ? '#/practice' : '#/learn');
    // Pop-ups one after the other: daily goal, streak milestone, the quests chest.
    const steps = [];
    if (summary.goalReached) steps.push((next) => rewardPopup({ kind: 'bonus', title: t('Daily goal reached!'), reward: html`${icon('gem', 30)} +5 gems`, text: t('Come back tomorrow to keep your streak going.'), onDone: next }));
    if (summary.milestone) steps.push((next) => rewardPopup({ kind: 'bonus', title: t('{n}-day streak!', { n: summary.milestone }), reward: html`${icon('flame', 30)} ${summary.milestone}`, text: t(summary.milestone >= 100 ? 'A hundred days in a row. Legendary!' : summary.milestone >= 30 ? 'A whole month without missing a day. Amazing!' : 'A full week in a row. Keep it going!'), onDone: next }));
    if (summary.quests.chestReady) steps.push((next) => questChest(next));
    const run = (i) => (i < steps.length ? steps[i](() => run(i + 1)) : go());
    run(0);
  });
}

// Keyboard: 1–9 pick an option (a setting), Enter checks / continues. Keys are left alone while a dialog or the
// explain sheet is open, and when a control has focus (it handles Enter itself — otherwise "Keep learning" would
// also submit the answer behind it).
export function lessonKey(root, e) {
  const s = root.__session;
  if (!s) return;
  const ctx = { modalOpen: !!$('#modal.open'), sheetOpen: !!$('.explain-sheet:not([hidden])', root) };
  if (e.key === 'Escape' && ctx.sheetOpen && !ctx.modalOpen) {
    sheetOpen(root, false);
    $('.lesson-foot .explain', root)?.focus({ preventScroll: true });
    return;
  }
  if (lessonKeyIgnored(e, ctx)) return;
  if (e.key === 'Enter') {
    const btn = $('.lesson-foot .check', root) || $('.complete .continue', root);
    if (btn && !btn.disabled) btn.click();
  } else if (/^[1-9]$/.test(e.key) && s.keyHandler && !s.checked && shortcutsEnabled(app.state.settings, matchMedia('(pointer: fine)').matches)) s.keyHandler(e.key);
}

// ---------- Verb forms, tones and typed sentences (engine tasks) ----------
// Pick a text option: a verb form ("tu" + aller → tu vas, or a sentence with the form missing) or the tone
// of a word you hear.
function renderPick(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const tone = ex.type === 'tone';
  const gap = html`<div class="g-block g-gap">?</div>`;
  const verb = html`<div class="g-block g-noun"><span class="jp" lang="${LANG_ATTR}">${ex.verb}</span>${ex.verbRomaji ? html`<small class="muted">${ex.verbRomaji}</small>` : ''}</div>`;
  const labelBlock = html`<div class="g-block"><span>${ex.label}</span></div>`;
  let head;
  if (tone) head = speakerBubble(s, audioPrompt(item));
  else if (Array.isArray(ex.prompt)) head = html`<div class="g-blocks g-quiz">${ex.prompt.map((c) => (c === null ? gap : html`<div class="g-block g-noun"><span class="jp" lang="${LANG_ATTR}">${c}</span></div>`))}</div>`;
  else head = html`<div class="g-blocks g-quiz">${L.latin ? html`${labelBlock}${verb}` : html`${verb}${labelBlock}`}${gap}</div>
    <p class="muted small">${ex.meaning}</p>`;
  mount($('.lesson-body', root), html`<p class="instruction">${ex.instruction}</p>
    ${head}
    <div class="options ${tone ? 'list' : 'grid'}">${ex.options.map((o, i) => html`<button class="option" data-o="${o}"><span class="key" aria-hidden="true">${i + 1}</span>${tone
      ? html`<span class="opt-label">${o}</span>`
      : html`<span class="opt-label"><span class="jp jp-lg" lang="${LANG_ATTR}">${o}</span>${ex.optionRomaji?.[o] ? html`<small class="muted">${ex.optionRomaji[o]}</small>` : ''}</span>`}</button>`)}</div>`);
  wirePlay(root, s);
  if (tone) sayAs(root, s.speaker, speechOf(item));
  startTimer(root, s, tone ? 20 : 25);
  const filled = Array.isArray(ex.prompt) ? ex.prompt.map((c) => (c === null ? ex.answer : c)).join(L.latin || ex.prompt.some((c) => /\s/.test(c || '')) ? ' ' : '') : ex.answer;
  const pickIt = (b) => {
    if (s.checked) return;
    const ok = b.dataset.o === ex.answer;
    $$('.option', root).forEach((x) => {
      x.disabled = true;
      if (x.dataset.o === ex.answer) markOption(x, 'right');
      else if (x === b) markOption(x, 'wrong');
    });
    if (!tone && $('.g-gap', root)) $('.g-gap', root).textContent = ex.answer;
    sayAs(root, s.speaker, tone ? speechOf(item) : filled);
    const meaning = tone ? `${item.jp} · ${item.romaji} = ${item.en}` : ex.prompt ? `${filled} = ${ex.en}` : `${ex.verb} (${ex.meaning}) · ${ex.label}: ${ex.answer}`;
    result(root, s, ok, { answerText: ex.answer, meaning, chosenLabel: ok ? null : b.dataset.o });
  };
  $$('.option', root).forEach((b) => b.addEventListener('click', () => pickIt(b)));
  s.keyHandler = (key) => {
    const b = $$('.option', root)[Number(key) - 1];
    if (b) pickIt(b);
  };
  footer(root, s, { canCheck: false, text: t('Pick an answer'), onCheck: () => {},
    skip: tone ? { label: t("Can't listen now"), onSkip: () => skipListening(root, s, 'listen') } : null });
}

// Type a whole sentence from its meaning (lenient: spaces, capitals, accents, tone marks and long vowels
// do not matter). A miss costs no heart, like the word recall.
function renderTypeSentence(root, s) {
  const ex = s.current;
  const item = ITEMS.get(ex.itemId);
  const target = joinChunks(item.jp);
  const shown = withRoman(target, item.romaji);
  const help = t(L.latin ? 'Accents and capitals don\'t matter.' : L.code === 'zh' ? 'Tone marks and spaces don\'t matter.' : 'Spaces and long vowels (ou / o) don\'t matter.');
  mount($('.lesson-body', root), html`<p class="instruction">${t('How do you say this in {lang}?', { lang: langName() })}</p>
    ${speakerBubble(s, html`<div class="en-prompt"><span>${item.en}</span></div>`)}
    <input class="recall-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${t('Type it in {lang}…', { lang: langName() })}" aria-label="${t('Your answer')}" lang="${LANG_ATTR}">
    <p class="muted small recall-help">${t('From memory — no choices this time!')} ${help}</p>`);
  startTimer(root, s, null);
  const input = $('.recall-input', root);
  const check = () => {
    if (s.checked || !input.value.trim()) return;
    const match = romajiMatch(input.value, L.latin ? target : item.romaji);
    input.disabled = true;
    input.classList.add(match ? 'right' : 'wrong');
    sayAs(root, s.speaker, speechOf(item));
    result(root, s, !!match, { answerText: shown, close: match === 'close', typed: true, meaning: `${shown} = ${item.en}`, chosenLabel: input.value, noHeart: true, timing: null });
  };
  input.addEventListener('input', () => setCheckEnabled(root, !!input.value.trim()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      check();
    }
  });
  footer(root, s, {
    onCheck: check,
    skip: { label: t("I don't know"), onSkip: () => {
      if (s.checked) return;
      input.disabled = true;
      sayAs(root, s.speaker, speechOf(item));
      result(root, s, false, { answerText: shown, meaning: `${shown} = ${item.en}`, noHeart: true, timing: null });
    } },
  });
  setTimeout(() => input.focus(), 250);
}

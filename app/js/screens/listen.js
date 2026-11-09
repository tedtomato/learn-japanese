// Hands-free listening, for walks and commutes: for each phrase the app says the English, leaves a
// pause to say it yourself, then gives the Japanese twice. Due and weakest phrases come first.
// The screen is kept awake (it stops when the phone locks). +5 XP for 10 phrases or more.
import { L, joinChunks } from '../lang.js';
import { ITEMS } from '../course.js';
import { app } from '../app.js';
import { html, mount, $ } from '../dom.js';
import { icon } from '../icons.js';
import { art } from '../art.js';
import { mascot } from '../mascot.js';
import { speak, speakGloss, stopSpeaking, canSpeakAloud } from '../audio.js';
import { strength } from '../srs.js';
import { learnedItemIds, completeListening, LISTEN_XP_MIN } from '../progress.js';
import { speechOf } from '../lesson/text.js';
import { t, langName } from '../strings.js';
import { hideNav } from './activity.js';

const MAX = 20;
const THINK_MS = 3500;
const GAP_MS = 1200;

export function listenPlaylist(state, now) {
  return learnedItemIds(state).map((id) => ITEMS.get(id)).filter((it) => it.type === 'word' || it.type === 'sentence')
    .sort((a, b) => strength(state.items[a.id], now) - strength(state.items[b.id], now)).slice(0, MAX);
}

export function renderListen(root) {
  const list = listenPlaylist(app.state, app.now());
  if (!list.length || !canSpeakAloud()) return app.go('#/practice');
  let i = 0;
  let heard = 0;
  let paused = false;
  let run = 0; // bumped to cancel the running sequence
  let lock = null;
  hideNav();
  navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});

  mount(root, html`<header class="topbar topbar-back"><button class="icon-btn quit" aria-label="${t('Close')}">${icon('close', 24)}</button><h1>${t('Listening mode')}</h1></header>
  <main class="page listen">
    <p class="muted listen-count"></p>
    <section class="card listen-card">
      <div class="listen-art"></div>
      <p class="listen-en"></p>
      <p class="listen-step"></p>
      <div class="listen-jp" hidden><p class="jp"></p><small></small></div>
    </section>
    <div class="listen-controls">
      <button class="btn btn-secondary listen-pause">${icon('pause', 20)} ${t('Pause')}</button>
      <button class="btn btn-ghost listen-next">${t('Next')} ${icon('arrow', 18)}</button>
    </div>
    <p class="muted small listen-help">${t('Hear the {gloss}, say it in {lang} before {who} does, then repeat after her. Keep the screen on — the phone can go in your pocket with headphones.', { gloss: L.gloss === 'French' ? 'français' : L.gloss, lang: langName(), who: L.cast.woman2 })}</p>
  </main>`);

  const pauseLabel = () => html`${icon(paused ? 'play' : 'pause', 20)} ${t(paused ? 'Resume' : 'Pause')}`;
  const wait = (ms, id) => new Promise((r) => setTimeout(r, ms)).then(() => id === run && !paused);
  const step = (text) => ($('.listen-step', root).textContent = text);

  async function play() {
    const id = ++run;
    if (i >= list.length) return done();
    const it = list[i];
    $('.listen-count', root).textContent = t('Phrase {a} of {b}', { a: i + 1, b: list.length });
    $('.listen-art', root).replaceChildren();
    if (it.art) mount($('.listen-art', root), art(it.art, 'art-lg'));
    $('.listen-en', root).textContent = it.en;
    $('.listen-jp', root).hidden = true;
    step(`🎧 ${t('Listen…')}`);
    await speakGloss(it.en);
    if (id !== run || paused) return;
    step(`🗣️ ${t('Say it in {lang}!', { lang: langName() })}`);
    if (!(await wait(THINK_MS, id))) return;
    $('.listen-jp .jp', root).textContent = Array.isArray(it.jp) ? joinChunks(it.jp) : it.jp;
    $('.listen-jp small', root).textContent = L.latin ? it.en : it.romaji;
    $('.listen-jp', root).hidden = false;
    step(`👂 ${t('{who} says…', { who: L.cast.woman2 })}`);
    await speak(speechOf(it), { speaker: 'woman2' });
    if (!(await wait(GAP_MS, id))) return;
    step(`🔁 ${t('Repeat after her')}`);
    await speak(speechOf(it), { speaker: 'woman2' });
    if (!(await wait(GAP_MS * 2, id))) return;
    heard += 1;
    i += 1;
    play();
  }

  function stop() {
    run += 1;
    stopSpeaking();
    lock?.release?.().catch(() => {});
  }

  function done() {
    stop();
    const xp = completeListening(app.state, heard, app.now());
    app.save();
    mount(root, html`<main class="page listen listen-done">
      ${mascot('cheer', 130)}
      <h1>${t('Nice listening!')}</h1>
      <p class="muted">${t('{n} phrases heard', { n: heard })}${xp ? html` · <b>+${xp} XP</b>` : ` · ${t('listen to {n} or more for XP', { n: LISTEN_XP_MIN })}`}</p>
      <button class="btn btn-primary btn-block listen-again">${t('Listen again')}</button>
      <button class="btn btn-ghost btn-block listen-close">${t('Done')}</button>
    </main>`);
    $('.listen-again', root).addEventListener('click', () => renderListen(root));
    $('.listen-close', root).addEventListener('click', () => app.go('#/practice'));
  }

  $('.quit', root).addEventListener('click', () => (heard >= LISTEN_XP_MIN ? done() : (stop(), app.go('#/practice'))));
  $('.listen-next', root).addEventListener('click', () => {
    stopSpeaking();
    i += 1;
    paused = false;
    mount($('.listen-pause', root), pauseLabel());
    play();
  });
  $('.listen-pause', root).addEventListener('click', (e) => {
    paused = !paused;
    mount(e.currentTarget, pauseLabel());
    if (paused) {
      run += 1;
      stopSpeaking();
      step(`⏸️ ${t('Paused')}`);
    } else play();
  });
  root.__cleanup = stop;
  window.addEventListener('hashchange', stop, { once: true });
  play();
}

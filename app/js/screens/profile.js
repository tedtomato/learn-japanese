// Profile: stats, achievements, settings, backup and app version.
import { ITEMS, NODES } from '../course.js';
import { app, statsBar, toast, modal } from '../app.js';
import { html, mount, raw, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { speak, voiceStatus } from '../audio.js';
import { versionLabel } from '../version.js';
import { CHANGELOG, APP_RELEASE } from '../content/changelog.js';
import { checkForUpdate, hardRefresh } from '../update.js';
import { askOpenLab } from './lab.js';
import { shareButton, wireShare } from '../share.js';
import {
  displayStreak, learnedItemIds, isNodeDone, buyFreeze, exportBackup, importBackup, defaultState, FREEZE_PRICE, MAX_FREEZES,
} from '../progress.js';

function achievements(state, now) {
  const learned = learnedItemIds(state).map((id) => ITEMS.get(id));
  const kana = learned.filter((i) => i.type === 'kana' && i.script === 'hiragana').length;
  const words = learned.filter((i) => i.type === 'word' || i.type === 'sentence').length;
  const unitsDone = NODES.filter((n) => n.kind === 'review' && isNodeDone(state, n)).length;
  const best = Math.max(state.streak.best, displayStreak(state, now));
  return [
    { icon: '🌱', title: 'First steps', desc: 'Finish your first lesson', value: state.stats.lessons, goal: 1 },
    { icon: 'あ', title: 'Kana collector', desc: 'Learn 25 hiragana', value: kana, goal: 25 },
    { icon: '🏆', title: 'Hiragana master', desc: 'Learn all 71 hiragana', value: kana, goal: 71 },
    { icon: '💬', title: 'Wordsmith', desc: 'Learn 50 words and phrases', value: words, goal: 50 },
    { icon: '漢', title: 'Kanji explorer', desc: 'Learn 10 kanji', value: learned.filter((i) => i.type === 'kanji' && !i.peek).length, goal: 10 },
    { icon: '🔥', title: 'On fire', desc: 'Reach a 7 day streak', value: best, goal: 7 },
    { icon: '🎯', title: 'Sharpshooter', desc: '10 perfect lessons', value: state.stats.perfect, goal: 10 },
    { icon: '⚡', title: 'XP hunter', desc: 'Earn 500 XP', value: state.xp, goal: 500 },
    { icon: '🗾', title: 'Explorer', desc: 'Complete 5 units', value: unitsDone, goal: 5 },
    { icon: '📚', title: 'Curious mind', desc: 'Discover 50 fun facts', value: state.seen.fact.length, goal: 50 },
  ];
}

const VOICE_TEXT = {
  yes: 'Japanese voice ready.',
  unknown: 'Your device has not listed its voices yet. Tap test to check.',
  no: 'No Japanese voice found. Install one in your phone settings (Accessibility → Spoken content / Text-to-speech) to hear audio.',
};

const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function renderProfile(root) {
  const { state } = app;
  const now = app.now();
  const learned = learnedItemIds(state);
  const count = (...types) => learned.filter((id) => types.includes(ITEMS.get(id).type)).length;
  const s = state.settings;
  const seg = (name, value, options) => html`<div class="seg" data-setting="${name}">${options.map(([v, label]) =>
    html`<button class="${String(value) === String(v) ? 'on' : ''}" data-v="${v}">${label}</button>`)}</div>`;

  mount(root, html`<header class="topbar">${statsBar()}</header>
  <main class="page profile">
    ${app.testMode ? html`<a class="card test-banner" href="#/lab"><b>🧪 Test mode is on</b><span>Open the test lab ›</span></a>` : ''}
    <section class="profile-head">
      <div class="avatar">${mascot('happy', 92)}</div>
      <div><h1>My progress</h1><p class="muted">Learning since ${fmtDate(state.createdAt)}</p><p class="app-ver">Hajime v${APP_RELEASE}</p></div>
    </section>

    <div class="stat-grid">
      <div class="card stat-card"><span class="c-orange">${icon('flame', 26)}</span><b>${displayStreak(state, now)}</b><small>Day streak</small></div>
      <div class="card stat-card"><span class="c-gold">${icon('bolt', 26)}</span><b>${state.xp}</b><small>Total XP</small></div>
      <a class="card stat-card link-card" href="#/practice/kana"><span class="c-blue">${icon('kana', 26)}</span><b>${count('kana')}</b><small>Kana learned ›</small></a>
      <a class="card stat-card link-card" href="#/practice/words"><span class="c-green">${icon('word', 26)}</span><b>${count('word', 'sentence')}</b><small>Words & phrases ›</small></a>
      <a class="card stat-card link-card" href="#/practice/kanji"><span class="c-purple">${raw('<b class="jp" style="font-size:22px">漢</b>')}</span><b>${count('kanji', 'kword', 'radical')}</b><small>Kanji & radicals ›</small></a>
      <a class="card stat-card link-card" href="#/collection/fact"><span class="c-orange">${icon('book', 26)}</span><b>${state.seen.fact.length}</b><small>Fun facts ›</small></a>
    </div>

    <h2 class="sub-title">Achievements</h2>
    <div class="card achievements">${achievements(state, now).map((a) => {
      const done = a.value >= a.goal;
      return html`<div class="ach ${done ? 'done' : ''}"><span class="ach-icon jp">${a.icon}</span>
        <div class="ach-body"><b>${a.title}</b><small>${a.desc}</small>
        <div class="bar"><div class="bar-fill" style="width:${Math.min(100, (a.value / a.goal) * 100)}%"></div></div></div>
        ${done ? shareButton(`🏆 I unlocked "${a.title}" (${a.desc}) learning Japanese with Hajime!`, '') : html`<span class="ach-count">${Math.min(a.value, a.goal)}/${a.goal}</span>`}</div>`;
    })}</div>

    <h2 class="sub-title">Shop</h2>
    <div class="card shop-row">
      <span class="shop-icon">🧊</span>
      <div><b>Streak freeze</b><small class="muted">Keeps your streak if you miss a day. You have ${state.streak.freezes}/${MAX_FREEZES}.</small></div>
      <button class="btn btn-white buy-freeze" ${state.gems < FREEZE_PRICE || state.streak.freezes >= MAX_FREEZES ? 'disabled' : ''}>${icon('gem', 16)} ${FREEZE_PRICE}</button>
    </div>

    <h2 class="sub-title">Settings</h2>
    <div class="card settings">
      <div class="setting"><span>Appearance</span>${seg('theme', s.theme, [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']])}</div>
      <div class="setting"><span>Daily goal</span>${seg('dailyGoal', state.dailyGoal, [[10, 'Casual'], [20, 'Regular'], [30, 'Serious'], [50, 'Intense']])}</div>
      <div class="setting"><span>Auto-continue</span>${seg('autoNext', s.autoNext || 'normal', [['normal', 'Normal'], ['relaxed', 'Relaxed'], ['off', 'Off']])}</div>
      <div class="setting"><span>Speed challenge</span>${seg('speed', s.speed !== false, [[true, 'On'], [false, 'Off']])}</div>
      <div class="setting"><span>Speaking tasks</span>${seg('speaking', s.speaking !== false, [[true, 'On'], [false, 'Off']])}</div>
      <div class="setting"><span>Sound effects</span>${seg('sfx', s.sfx, [[true, 'On'], [false, 'Off']])}</div>
      <div class="setting"><span>Voice speed</span>${seg('voiceRate', s.voiceRate, [[0.7, 'Slow'], [0.85, 'Normal'], [1, 'Fast']])}</div>
      <div class="setting column"><span>Japanese voice</span><small class="muted voice-status">${VOICE_TEXT[voiceStatus()]}</small>
        <button class="btn btn-white test-voice">${icon('speaker', 18)} Test: こんにちは</button></div>
    </div>

    <h2 class="sub-title">Backup</h2>
    <div class="card settings">
      <p class="muted small">Your progress is saved on this device only. Save a backup file now and then (to iCloud, Google Drive…) so you can restore it on a new phone.</p>
      <div class="row-btns">
        <button class="btn btn-white export">${icon('download', 18)} Save backup</button>
        <label class="btn btn-white import">${icon('upload', 18)} Restore<input type="file" accept="application/json,.json" hidden></label>
      </div>
    </div>

    <h2 class="sub-title">About</h2>
    <div class="card settings">
      <button class="setting version-row"><span>App version</span><span class="version">v${APP_RELEASE} · ${versionLabel()} ›</span></button>
      <button class="btn btn-white check-update">${icon('refresh', 18)} Check for updates</button>
      <button class="btn btn-ghost hard-refresh">Reload latest version</button>
      <p class="muted small">Not seeing an update? “Reload latest version” clears the app's cached files and loads it fresh from GitHub. Your progress is kept.</p>
      <button class="btn btn-danger-ghost reset">Reset all progress</button>
    </div>
    <p class="muted small center">Hajime — はじめ — means “beginning”.</p>
    <p class="muted small center credits">Stroke order data: <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener">KanjiVG</a> (CC BY-SA 3.0). Illustrations: <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener">Twemoji</a> (CC BY 4.0).</p>
  </main>`);

  $$('.seg', root).forEach((segEl) =>
    segEl.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const name = segEl.dataset.setting;
      const raw = b.dataset.v;
      const v = raw === 'true' ? true : raw === 'false' ? false : Number.isNaN(Number(raw)) ? raw : Number(raw);
      if (name === 'dailyGoal') state.dailyGoal = v;
      else state.settings[name] = v;
      app.save();
      renderProfile(root);
      if (name === 'voiceRate') speak('こんにちは');
    }),
  );
  $('.test-voice', root).addEventListener('click', () => {
    speak('こんにちは');
    setTimeout(() => ($('.voice-status', root).textContent = VOICE_TEXT[voiceStatus()]), 600);
  });
  $('.buy-freeze', root).addEventListener('click', () => {
    if (buyFreeze(state)) {
      app.save();
      toast('Streak freeze equipped 🧊');
      renderProfile(root);
    }
  });
  $('.export', root).addEventListener('click', () => {
    const blob = new Blob([exportBackup(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hajime-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $('.import input', root).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const next = importBackup(await file.text());
      modal(html`<h2>Restore this backup?</h2><p class="muted">It has ${next.xp} XP and replaces the progress on this device.</p>`, [
        { label: 'Restore', onClick: () => { app.replaceState(next); toast('Progress restored ✅'); renderProfile(root); } },
        { label: 'Cancel', kind: 'secondary' },
      ]);
    } catch (err) {
      toast(err.message || 'Could not read that file.');
    }
  });
  wireShare(root);
  // Hidden: a double tap on the avatar opens the test lab.
  let lastTap = 0;
  $('.avatar', root).addEventListener('click', () => {
    const t = Date.now();
    if (t - lastTap < 400) askOpenLab();
    lastTap = t;
  });
  $('.check-update', root).addEventListener('click', () => checkForUpdate());
  $('.version-row', root).addEventListener('click', () =>
    modal(html`<h2>What's new</h2>
      <div class="changelog">${CHANGELOG.map((r) => html`<section><h3>v${r.version} <small>${r.date}</small></h3>
        <ul>${r.changes.map((c) => html`<li>${c}</li>`)}</ul></section>`)}</div>`, [{ label: 'Close', kind: 'secondary' }]));
  $('.hard-refresh', root).addEventListener('click', () => hardRefresh());
  $('.reset', root).addEventListener('click', () =>
    modal(html`<div class="center">${mascot('sad', 90)}<h2>Reset everything?</h2><p class="muted">All XP, streaks and lessons on this device will be erased. This cannot be undone.</p></div>`, [
      { label: 'Keep my progress' },
      { label: 'Erase progress', kind: 'danger-ghost', onClick: () => { app.replaceState(defaultState()); app.go('#/learn'); } },
    ]),
  );
}

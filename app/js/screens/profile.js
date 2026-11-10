// Profile: stats, achievements, settings, backup and app version.
import { L } from '../lang.js';
import { ITEMS, NODES } from '../course.js';
import { app, statsBar, toast, modal } from '../app.js';
import { html, mount, raw, $, $$, wireArrows } from '../dom.js';
import { listeningMode, shortcutsEnabled } from '../a11y.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { speak, voiceStatus } from '../audio.js';
import { versionLabel, APP_RELEASE } from '../version.js';
import { checkForUpdate, hardRefresh } from '../update.js';
import { askOpenLab } from './lab.js';
import { showStreakCalendar } from './streak.js';
import { enableReminders, disableReminders } from '../reminders.js';
import { shareButton, wireShare } from '../share.js';
import { t, langName } from '../strings.js';
import {
  displayStreak, learnedItemIds, isNodeDone, buyFreeze, exportBackup, importBackup, backupStale, defaultState, FREEZE_PRICE, MAX_FREEZES, speedOn,
} from '../progress.js';

function achievements(state, now) {
  const learned = learnedItemIds(state).map((id) => ITEMS.get(id));
  const kana = learned.filter((i) => i.type === 'kana' && i.script === 'hiragana').length;
  const words = learned.filter((i) => i.type === 'word' || i.type === 'sentence').length;
  const unitsDone = NODES.filter((n) => n.kind === 'review' && isNodeDone(state, n)).length;
  const best = Math.max(state.streak.best, displayStreak(state, now));
  return [
    { icon: '🌱', title: t('First steps'), desc: t('Finish your first lesson'), value: state.stats.lessons, goal: 1 },
    ...(L.hasKana ? [
      { icon: 'あ', title: t('Kana collector'), desc: t('Learn 25 hiragana'), value: kana, goal: 25 },
      { icon: '🏆', title: t('Hiragana master'), desc: t('Learn all 71 hiragana'), value: kana, goal: 71 },
    ] : []),
    { icon: '💬', title: t('Wordsmith'), desc: t('Learn 50 words and phrases'), value: words, goal: 50 },
    ...(L.latin ? [{ icon: '📖', title: t('Bookworm'), desc: t('Learn 150 words and phrases'), value: words, goal: 150 }]
      : [{ icon: L.glyph, title: t(L.Chars === 'Kanji' ? 'Kanji explorer' : 'Character explorer'), desc: t('Learn 10 {what}', { what: L.chars }), value: learned.filter((i) => i.type === 'kanji' && !i.peek).length, goal: 10 }]),
    { icon: '🔥', title: t('On fire'), desc: t('Reach a 7 day streak'), value: best, goal: 7 },
    { icon: '🎯', title: t('Sharpshooter'), desc: t('10 perfect lessons'), value: state.stats.perfect, goal: 10 },
    { icon: '⚡', title: t('XP hunter'), desc: t('Earn 500 XP'), value: state.xp, goal: 500 },
    { icon: L.flagEmoji || '🗾', title: t('Explorer'), desc: t('Complete 5 units'), value: unitsDone, goal: 5 },
    { icon: '📚', title: t('Curious mind'), desc: t('Discover 50 fun facts'), value: state.seen.fact.length, goal: 50 },
  ];
}

const voiceText = () => ({
  yes: t('{lang} voice ready.', { lang: langName() }),
  unknown: t('Your device has not listed its voices yet. Tap test to check.'),
  no: t('No {lang} voice found. Install one in your phone settings (Accessibility → Spoken content / Text-to-speech) to hear audio.', { lang: langName() }),
});

const fmtDate = (time) => new Date(time).toLocaleDateString(L.gloss === 'French' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Backups go through the phone's share menu (→ Drive: Save) where it can share files, else to
// Downloads. Shared as .txt: Android only shares a short list of file types, and JSON isn't one.
const backupFile = (state) => new File([exportBackup(state)], `hajime-backup-${L.code}-${new Date().toISOString().slice(0, 10)}.txt`, { type: 'text/plain' });
const canShareFiles = () => {
  try {
    return !!navigator.canShare?.({ files: [new File(['x'], 'x.txt', { type: 'text/plain' })] });
  } catch {
    return false;
  }
};
async function saveBackup(state) {
  const file = backupFile({ ...state, backupAt: Date.now() });
  if (canShareFiles()) {
    try {
      await navigator.share({ files: [file], title: 'Hajime backup' });
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return null; // closed the share menu
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return 'downloaded';
}
function backupAgeText(state, now) {
  if (!state.backupAt) return t('No backup yet');
  const days = Math.floor((now - state.backupAt) / 86400000);
  return t('Last backup: {when}', { when: days === 0 ? t('today') : days === 1 ? t('yesterday') : t('{n} days ago', { n: days }) });
}

let pendingFocus = null; // the choice to focus after the screen is drawn again

export function renderProfile(root, focus) {
  const { state } = app;
  const now = app.now();
  const learned = learnedItemIds(state);
  const count = (...types) => learned.filter((id) => types.includes(ITEMS.get(id).type)).length;
  const s = state.settings;
  // A group of choices is a radio group: one is selected, arrow keys move between them.
  const seg = (name, value, options) => html`<div class="seg" role="radiogroup" aria-labelledby="set-${name}" data-setting="${name}">${options.map(([v, label]) =>
    html`<button role="radio" aria-checked="${String(String(value) === String(v))}" class="${String(value) === String(v) ? 'on' : ''}" data-v="${String(v)}">${label}</button>`)}</div>`;

  mount(root, html`<header class="topbar">${statsBar()}</header>
  <main class="page profile">
    ${app.testMode ? html`<a class="card test-banner" href="#/lab"><b>🧪 Test mode is on</b><span>Open the test lab ›</span></a>` : ''}
    <section class="profile-head">
      <div class="avatar">${mascot('happy', 92)}</div>
      <div><h1>${t('My progress')}</h1><p class="muted">${t('Learning since {date}', { date: fmtDate(state.createdAt) })}</p><p class="app-ver">Hajime v${APP_RELEASE}</p></div>
    </section>

    <div class="stat-grid">
      <button class="card stat-card link-card streak-tile"><span class="c-orange">${icon('flame', 26)}</span><b>${displayStreak(state, now)}</b><small>${t('Day streak')} ›</small></button>
      <div class="card stat-card"><span class="c-gold">${icon('bolt', 26)}</span><b>${state.xp}</b><small>${t('Total XP')}</small></div>
      ${L.hasKana ? html`<a class="card stat-card link-card" href="#/practice/kana"><span class="c-blue">${icon('kana', 26)}</span><b>${count('kana')}</b><small>${t('Kana learned')} ›</small></a>` : ''}
      <a class="card stat-card link-card" href="#/practice/words"><span class="c-green">${icon('word', 26)}</span><b>${count('word', 'sentence')}</b><small>${t('Words & phrases')} ›</small></a>
      ${L.latin ? '' : html`<a class="card stat-card link-card" href="#/practice/kanji"><span class="c-purple">${raw(`<b class="jp" style="font-size:22px">${L.glyph}</b>`)}</span><b>${count('kanji', 'kword', 'radical')}</b><small>${t(L.code === 'zh' ? 'Characters' : 'Kanji & radicals')} ›</small></a>`}
      <a class="card stat-card link-card" href="#/collection/fact"><span class="c-orange">${icon('book', 26)}</span><b>${state.seen.fact.length}</b><small>${t('Fun facts')} ›</small></a>
    </div>

    <h2 class="sub-title">${t('Achievements')}</h2>
    <div class="card achievements">${achievements(state, now).map((a) => {
      const done = a.value >= a.goal;
      return html`<div class="ach ${done ? 'done' : ''}"><span class="ach-icon jp">${a.icon}</span>
        <div class="ach-body"><b>${a.title}</b><small>${a.desc}</small>
        <div class="bar" role="progressbar" aria-label="${a.title}" aria-valuemin="0" aria-valuemax="${a.goal}" aria-valuenow="${Math.min(a.value, a.goal)}"><div class="bar-fill" style="width:${Math.min(100, (a.value / a.goal) * 100)}%"></div></div></div>
        ${done ? shareButton(`🏆 I unlocked "${a.title}" (${a.desc}) learning ${L.name} with Hajime!`, '') : html`<span class="ach-count">${Math.min(a.value, a.goal)}/${a.goal}</span>`}</div>`;
    })}</div>

    <h2 class="sub-title">${t('Shop')}</h2>
    <div class="card shop-row">
      <span class="shop-icon">🧊</span>
      <div><b>${t('Streak freeze')}</b><small class="muted">${t('Keeps your streak if you miss a day. You have {a}/{b}.', { a: state.streak.freezes, b: MAX_FREEZES })}</small></div>
      <button class="btn btn-white buy-freeze" ${state.gems < FREEZE_PRICE || state.streak.freezes >= MAX_FREEZES ? 'disabled' : ''}>${icon('gem', 16)} ${FREEZE_PRICE}</button>
    </div>

    <h2 class="sub-title">${t('Settings')}</h2>
    <div class="card settings">
      <div class="setting"><span id="set-theme">${t('Appearance')}</span>${seg('theme', s.theme, [['system', t('Auto')], ['light', t('Light')], ['dark', t('Dark')]])}</div>
      <div class="setting"><span id="set-dailyGoal">${t('Daily goal')}</span>${seg('dailyGoal', state.dailyGoal, [[10, t('Casual')], [20, t('Regular')], [30, t('Serious')], [50, t('Intense')]])}</div>
      <div class="setting"><span id="set-speed">${t('Speed challenge')}<small class="muted setting-note">${s.speed === undefined ? t('Starts after your second lesson') : ''}</small></span>${seg('speed', speedOn(state), [[true, t('On')], [false, t('Off')]])}</div>
      <div class="setting"><span id="set-speaking">${t('Speaking tasks')}</span>${seg('speaking', s.speaking !== false, [[true, t('On')], [false, t('Off')]])}</div>
      <div class="setting"><span id="set-listening">${t('Listening tasks')}<small class="muted setting-note">${t('Show text also displays the words you hear')}</small></span>${seg('listening', listeningMode(s), [['on', t('On')], ['off', t('Off')], ['text', t('Show text')]])}</div>
      <div class="setting"><span id="set-keys">${t('Keyboard shortcuts')}<small class="muted setting-note">${t('Number keys pick an answer')}</small></span>${seg('keys', shortcutsEnabled(s, matchMedia('(pointer: fine)').matches), [[true, t('On')], [false, t('Off')]])}</div>
      <div class="setting"><span id="set-sfx">${t('Sound effects')}</span>${seg('sfx', s.sfx, [[true, t('On')], [false, t('Off')]])}</div>
      <div class="setting"><span id="set-haptics">${t('Vibration')}<small class="muted setting-note">${t('A short buzz on right and wrong answers')}</small></span>${seg('haptics', s.haptics !== false, [[true, t('On')], [false, t('Off')]])}</div>
      ${L.code === 'zh' ? html`<div class="setting"><span id="set-toneColors">${t('Tone colours')}<small class="muted setting-note">${t('Pinyin is coloured by tone')}</small></span>${seg('toneColors', s.toneColors !== false, [[true, t('On')], [false, t('Off')]])}</div>` : ''}
      <div class="setting"><span>${t('Daily reminder')}<small class="muted setting-note">${s.reminders ? t('A nudge once a day if you have not studied') : t('Off')}</small></span>
        <button class="btn btn-white btn-small reminder-btn">${s.reminders ? t('Turn off') : t('Turn on')}</button></div>
      ${L.latin ? '' : html`<div class="setting"><span id="set-romaji">${t('Romaji help')}</span>${seg('romaji', s.romaji || 'auto', [['auto', t('Auto')], ['always', t('Always')]])}</div>`}
      <div class="setting"><span id="set-voiceRate">${t('Voice speed')}</span>${seg('voiceRate', s.voiceRate, [[0.7, t('Slow')], [0.85, t('Normal')], [1, t('Fast')]])}</div>
      <div class="setting column"><span>${t('{lang} voice', { lang: langName() })}</span><small class="muted voice-status">${voiceText()[voiceStatus()]}</small>
        <button class="btn btn-white test-voice">${icon('speaker', 18)} ${t('Test:')} ${L.voiceTest}</button></div>
    </div>

    <h2 class="sub-title" id="sec-backup">${t('Backup')}</h2>
    <div class="card settings">
      <p class="muted small">${t('Your progress is saved on this phone only. Save a backup to Google Drive now and then, so you can restore it on a new phone.')}</p>
      <p class="backup-age ${backupStale(state, now) ? 'stale' : ''}">${backupAgeText(state, now)}</p>
      <div class="row-btns">
        <button class="btn btn-white export">${icon('upload', 18)} ${t(canShareFiles() ? 'Save to Drive' : 'Save backup')}</button>
        <label class="btn btn-white import">${icon('download', 18)} ${t('Restore')}<input type="file" accept="application/json,.json,text/plain,.txt" hidden></label>
      </div>
      <p class="muted small">${canShareFiles()
        ? t('Save to Drive opens your phone\'s share menu: pick Drive → Save. To restore, tap Restore, open the menu ☰ in the file picker, choose Drive and pick the newest hajime-backup file.')
        : t('The backup file goes to your Downloads. Keep a copy in Google Drive or iCloud.')}</p>
    </div>

    <h2 class="sub-title">${t('About')}</h2>
    <div class="card settings">
      <button class="setting version-row"><span>${t('App version')}</span><span class="version">v${APP_RELEASE} · ${versionLabel()} ›</span></button>
      <button class="btn btn-white check-update">${icon('refresh', 18)} ${t('Check for updates')}</button>
      <button class="btn btn-ghost hard-refresh">${t('Reload latest version')}</button>
      <p class="muted small">${t('Not seeing an update? “Reload latest version” clears the app\'s cached files and loads it fresh from GitHub. Your progress is kept.')}</p>
      <button class="btn btn-danger-ghost reset">${t('Reset all progress')}</button>
    </div>
    <p class="muted small center">${t('Hajime — はじめ — means “beginning”')}${L.code === 'zh' ? ' (in Chinese: 开始, kāishǐ)' : ''}.</p>
    <p class="muted small center credits">${L.latin ? '' : 'Stroke order data: '}${L.latin ? '' : L.code === 'zh' ? html`<a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noopener">Make Me a Hanzi</a> (Arphic Public License)` : html`<a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener">KanjiVG</a> (CC BY-SA 3.0)`}${L.latin ? '' : '. '}Illustrations: <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener">Twemoji</a> (CC BY 4.0).</p>
  </main>`);

  $$('.seg', root).forEach((segEl) =>
    segEl.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const name = segEl.dataset.setting;
      const raw = b.dataset.v;
      pendingFocus = { name, v: raw };
      const v = raw === 'true' ? true : raw === 'false' ? false : Number.isNaN(Number(raw)) ? raw : Number(raw);
      if (name === 'dailyGoal') state.dailyGoal = v;
      else state.settings[name] = v;
      app.save();
      renderProfile(root);
      if (name === 'voiceRate') speak(L.voiceTest);
    }),
  );
  for (const group of $$('.seg', root)) wireArrows(group, (b) => b.click());
  if (pendingFocus) {
    $(`.seg[data-setting="${pendingFocus.name}"] [data-v="${pendingFocus.v}"]`, root)?.focus({ preventScroll: true });
    pendingFocus = null;
  }
  $('.streak-tile', root).addEventListener('click', showStreakCalendar);
  $('.reminder-btn', root).addEventListener('click', async () => {
    if (state.settings.reminders) {
      await disableReminders();
      state.settings.reminders = false;
      app.save();
      return renderProfile(root);
    }
    const result = await enableReminders();
    if (result === 'denied') return toast(t('Notifications are blocked — allow them for Hajime in your phone settings.'));
    if (result === 'unsupported') {
      return modal(html`<div class="center"><h2>Daily reminder</h2><p class="muted">Reminders need the app on your home screen in Chrome on Android. Open the browser menu → <b>Add to Home screen</b> (or Install app), then open Hajime from its icon and turn this on again.</p></div>`, [{ label: 'OK', kind: 'secondary' }]);
    }
    state.settings.reminders = true;
    app.save();
    toast(`${t('Daily reminder on')} 🔔`);
    renderProfile(root);
  });
  $('.test-voice', root).addEventListener('click', () => {
    speak(L.voiceTest);
    setTimeout(() => ($('.voice-status', root).textContent = voiceText()[voiceStatus()]), 600);
  });
  $('.buy-freeze', root).addEventListener('click', () => {
    if (buyFreeze(state)) {
      app.save();
      toast(`${t('Streak freeze equipped')} 🧊`);
      renderProfile(root);
    }
  });
  $('.export', root).addEventListener('click', async () => {
    const saved = await saveBackup(state);
    if (!saved) return;
    state.backupAt = Date.now();
    app.save();
    toast(t(saved === 'shared' ? 'Backup sent ✅ — check it arrived in Drive' : 'Backup saved to Downloads ✅'));
    renderProfile(root, 'backup');
  });
  $('.import input', root).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const next = importBackup(await file.text());
      modal(html`<h2>${t('Restore this backup?')}</h2><p class="muted">${t('It has {n} XP and replaces the progress on this device.', { n: next.xp })}</p>`, [
        { label: t('Restore'), onClick: () => { app.replaceState(next); toast(t('Progress restored ✅')); renderProfile(root); } },
        { label: t('Cancel'), kind: 'secondary' },
      ]);
    } catch (err) {
      toast(err.message || 'Could not read that file.');
    }
  });
  wireShare(root);
  if (focus === 'backup') requestAnimationFrame(() => $('#sec-backup', root)?.scrollIntoView({ block: 'start' }));
  // Hidden: a double tap on the avatar opens the test lab.
  let lastTap = 0;
  $('.avatar', root).addEventListener('click', () => {
    const tapAt = Date.now();
    if (tapAt - lastTap < 400) askOpenLab();
    lastTap = tapAt;
  });
  $('.check-update', root).addEventListener('click', () => checkForUpdate());
  // The list of releases is a big file that is only read when it is asked for.
  $('.version-row', root).addEventListener('click', async () => {
    const { CHANGELOG } = await import('../content/changelog.js');
    modal(html`<h2>${t('What\'s new')}</h2>
      <div class="changelog">${CHANGELOG.map((r) => html`<section><h3>v${r.version} <small>${r.date}</small></h3>
        <ul>${r.changes.map((c) => html`<li>${c}</li>`)}</ul></section>`)}</div>`, [{ label: t('Close'), kind: 'secondary' }]);
  });
  $('.hard-refresh', root).addEventListener('click', () => hardRefresh());
  $('.reset', root).addEventListener('click', () =>
    modal(html`<div class="center">${mascot('sad', 90)}<h2>${t('Reset everything?')}</h2><p class="muted">${t('All XP, streaks and lessons on this device will be erased. This cannot be undone.')}</p></div>`, [
      { label: t('Keep my progress') },
      { label: t('Erase progress'), kind: 'danger-ghost', onClick: () => { app.replaceState(defaultState()); app.go('#/learn'); } },
    ]),
  );
}

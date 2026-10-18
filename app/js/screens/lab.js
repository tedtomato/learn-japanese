// Hidden test lab (double-tap the dog on Profile). Everything here runs on the separate test copy
// of the progress, so the real progress is never touched.
import { SECTIONS, NODES, ITEMS } from '../course.js';
import { app, toast, modal } from '../app.js';
import { html, mount, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { DEMO_KINDS } from '../lesson/generate.js';
import { defaultState, MAX_HEARTS } from '../progress.js';
import { splash, rewardPopup } from '../fx.js';

export function renderLab(root) {
  if (!app.testMode) return app.go('#/profile');
  mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/profile" aria-label="Back">${icon('close', 24)}</a><h1>Test lab</h1></header>
  <main class="page lab">
    <section class="card lab-banner">${mascot('happy', 64)}<div><b>Test mode is on</b><p class="muted small">You are playing on a separate test copy. Your real progress is safe and comes back when you exit.</p></div></section>
    <button class="btn btn-danger btn-block exit-test">Exit test mode</button>

    <h2 class="sub-title">Progress</h2>
    <div class="lab-grid">
      <button class="btn btn-white" data-act="unlock">Unlock all levels</button>
      <button class="btn btn-white" data-act="kana">Learn all kana</button>
      <button class="btn btn-white" data-act="fill">Fill hearts & gems</button>
      <button class="btn btn-white" data-act="reset">Reset test progress</button>
    </div>

    <h2 class="sub-title">Try a task type</h2>
    <div class="lab-grid">${Object.entries(DEMO_KINDS).map(([k, label]) => html`<a class="btn btn-secondary" href="#/lab/${k}">${label}</a>`)}</div>

    <h2 class="sub-title">Screens</h2>
    <div class="lab-grid">
      <button class="btn btn-white" data-act="splash">Start screen</button>
      <button class="btn btn-white" data-act="chest">Chest pop-up</button>
      <button class="btn btn-white" data-act="bonus">Bonus pop-up</button>
    </div>

    <h2 class="sub-title">Jump to any lesson</h2>
    ${SECTIONS.map((s) => html`${s.units.map((u) => html`<details class="card lab-unit"><summary><b>${u.title}</b> <small class="muted">${s.title}</small></summary>
      <div class="lab-nodes">${u.nodes.filter((n) => n.kind !== 'chest').map((n) => html`<a class="lab-node" href="#/lesson/${n.id}">${n.title}</a>`)}</div></details>`)}`)}
  </main>`);

  const save = (msg) => {
    app.save();
    toast(msg);
  };
  const actions = {
    unlock: () => {
      NODES.forEach((n) => (app.state.nodes[n.id] = { level: Math.max(1, app.state.nodes[n.id]?.level || 0) }));
      save('Every level unlocked (test copy)');
    },
    kana: () => {
      const now = app.now();
      [...ITEMS.values()].filter((i) => i.type === 'kana').forEach((i) => (app.state.items[i.id] ||= { box: 2, seen: 1, right: 1, wrong: 0, last: now, due: now + 864e5 }));
      save('All kana marked as learned (test copy)');
    },
    fill: () => {
      app.state.hearts = { count: MAX_HEARTS, updatedAt: app.now() };
      app.state.gems += 500;
      save('Hearts full, +500 gems');
    },
    reset: () => modal(html`<h2>Reset the test copy?</h2><p class="muted">Only the test progress is cleared. Your real progress is not affected.</p>`, [
      { label: 'Reset test progress', kind: 'danger', onClick: () => { app.replaceState(defaultState()); toast('Test progress reset'); } },
      { label: 'Cancel', kind: 'secondary' },
    ]),
    splash: () => splash(),
    chest: () => rewardPopup({ kind: 'chest', title: 'Treasure!', reward: html`${icon('gem', 30)} +15 gems` }),
    bonus: () => rewardPopup({ kind: 'bonus', title: 'Daily goal reached!', reward: html`${icon('gem', 30)} +5 gems`, text: 'Preview only.' }),
  };
  $$('[data-act]', root).forEach((b) => b.addEventListener('click', () => actions[b.dataset.act]()));
  $('.exit-test', root).addEventListener('click', () => {
    app.setTestMode(false);
    toast('Back to your real progress');
    app.go('#/profile');
  });
}

// Profile hook: a double tap on the avatar asks to open the lab.
export function askOpenLab() {
  if (app.testMode) return app.go('#/lab');
  modal(html`<div class="center">${mascot('cheer', 90)}<h2>Open the test lab?</h2>
    <p class="muted">The lab uses a separate test copy of your progress, so you can unlock everything and try any feature. Your real progress stays untouched.</p></div>`, [
    { label: 'Open test lab', onClick: () => { app.setTestMode(true); app.go('#/lab'); } },
    { label: 'Cancel', kind: 'secondary' },
  ]);
}

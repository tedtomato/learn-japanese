// Reward moments: full-screen, sequenced celebrations (streak flame, daily goal ring, chests, gifts, unit trophy,
// achievements) with sound, haptics and the mascot reacting. Producers call queueMoment({ kind, ... }); the lesson
// player and the Learn screen call playMoments(), which shows them one after another. One tap moves on, "Skip all"
// drops the rest, and nothing blocks input for more than a beat. Reduced motion: no springs, no particles.
//
// Kinds: streak {count, extended, milestone?, week}, goal {xp, goal, gems, lessonXp?}, chest {title, gems, source},
// gift {title, reward:{gems?, freeze?, doubleXpMs?, text?}}, unit {title, unitTitle, color},
// achievement {title, desc, icon}, levelup {level, nodeTitle}.
import { t } from './strings.js';
import { html, raw, esc } from './dom.js';
import { icon } from './icons.js';
import { mascotSvg } from './mascot.js';
import { sfx, buzz, HAPTIC } from './audio.js';
import { reduced, countUp, flyGems } from './motion.js';
import { L } from './lang.js';
import { shareButton, wireShare } from './share.js';
import { celebrationHtml } from './celebrate.js';

// ---------- Mascot lines: what the mascot says, by situation (English; French in strings.js) ----------
export const LINES = {
  start: ["Let's go!", 'Ready when you are!', 'Small steps, big wins.', 'Deep breath. You\'ve got this.', 'A few minutes is all it takes.', "Let's learn something new!", "I'm right here with you.", 'Warm-up time!'],
  run3: ['Three in a row!', "You're warming up!", 'Nice rhythm!', 'Keep it rolling!', "That's the way!", 'Smooth!', 'Look at you go!', "Three! Don't stop now."],
  run5: ['Five in a row, wow!', "You're on a roll!", 'My tail is wagging!', 'Hot streak!', 'Focus mode: on.', 'Unstoppable so far!', 'Five! Impressive.', 'This is your zone!'],
  run10: ['Ten in a row! Legend!', 'Are you even human?', 'Flawless run!', "I'm speechless!", 'Absolute master!', 'Ten! Nothing stops you!', 'The crowd goes wild!', 'Teach me your ways!'],
  wrong: ['No worries, it happens.', 'Mistakes help you learn.', "Next one's yours!", 'Shake it off!', "Now you'll remember it.", 'So close!', 'Try again, you can do it.', 'Every expert missed this once.'],
  end: ['What a lesson!', 'You did it!', "I'm so proud of you!", 'That was great work.', 'Another step forward!', 'You earned a treat!', 'See you for the next one!', "Look how far you've come!"],
  streak: ['The flame is burning!', 'Another day, another spark!', "You showed up. That's everything.", 'Habits are built like this.', 'Keep the fire alive!', 'Day after day, you grow.', 'Warm and glowing!', "Don't break the chain!"],
  gift: ['Ooh, what could it be?', 'A little surprise for you!', 'You earned this!', 'Treasure time!', 'Open it, open it!', 'I love surprises!', 'Shiny!', 'Good things come to those who learn.'],
  goal: ['Goal reached!', 'Bullseye!', 'Today is a success!', 'You hit your target!', 'Gems for you!', 'Daily goal: crushed.', 'Told you that you could!', 'Time to celebrate!'],
  quit: ["Wait, don't go!", 'Hmm... are you sure?', "You're so close to finishing.", 'Just a little more?', 'Let me think... stay?', 'Your progress here will be lost.', 'A short break is okay too.', "I'll be here when you're back."],
};

// One line for a situation, in the interface language, never the same as `prev` twice in a row.
export function mascotLine(situation, prev = null, random = Math.random) {
  const list = (LINES[situation] || LINES.end).filter((l) => l !== prev);
  return list[Math.floor(random() * list.length) % list.length];
}
const lastLine = {};
export function sayLine(situation) {
  const en = mascotLine(situation, lastLine[situation]);
  lastLine[situation] = en;
  return t(en);
}

// ---------- The queue (pure parts, tested) ----------
const queue = [];
const keyOf = (m) => `${m.kind}:${m.source || m.title || m.level || ''}`;

export function queueMoment(m) {
  if (!m || !m.kind) return;
  if (queue.some((q) => keyOf(q) === keyOf(m))) return; // the same moment is never shown twice in one go
  queue.push(m);
}
export const pendingMoments = () => queue.length;
export const clearMoments = () => { queue.length = 0; };

export const MOMENT_KINDS = ['streak', 'goal', 'chest', 'gift', 'unit', 'achievement', 'levelup'];
export const STREAK_BADGES = [7, 30, 100, 365];

// The last seven days as a strip: [{ label, on, today }]. `daily` maps day keys to XP; dayKey turns a time into a key.
export function weekOf(now, daily, dayKey, locale = 'en-GB') {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = now - i * 86400000;
    days.push({ label: new Date(day).toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2), on: (daily[dayKey(day)] || 0) > 0, today: i === 0 });
  }
  return days;
}

// From what a finished session produced to the moments to show, in the order they build up:
// streak, goal, chests, unit, achievements, level-up. `extra`: { week, goal, xpToday, lessonXp, questsChest: {gems},
// perfectGems, weeklyGems, node, ... }. newAch: achievements that were not unlocked before ({icon, title, desc}).
export function buildQueue(summary = {}, newAch = [], extra = {}) {
  const out = [];
  const add = (m) => !out.some((q) => keyOf(q) === keyOf(m)) && out.push(m);
  if (summary.streakExtended) {
    add({ kind: 'streak', count: summary.streak, extended: true, ...(summary.milestone ? { milestone: summary.milestone } : {}), week: extra.week || [] });
  }
  if (summary.goalReached) add({ kind: 'goal', xp: extra.xpToday ?? extra.goal ?? 0, goal: extra.goal ?? 0, gems: 5, lessonXp: extra.lessonXp ?? summary.xp ?? 0 });
  if (summary.quests?.chestReady && extra.questsChest) add({ kind: 'chest', title: t('All quests done!'), gems: extra.questsChest.gems, source: 'quests', minutes: extra.questsChest.minutes });
  if (summary.bonusChest) add({ kind: 'chest', title: t('Perfect streak!'), gems: extra.perfectGems ?? 10, source: 'perfect3' });
  if (summary.weeklyChest) add({ kind: 'chest', title: t('Weekly treasure!'), gems: extra.weeklyGems ?? 25, source: 'weekly' });
  if (summary.unitComplete) add({ kind: 'unit', title: t('Unit complete!'), unitTitle: summary.unitComplete.title, color: summary.unitComplete.color });
  for (const a of newAch || []) add({ kind: 'achievement', title: a.title, desc: a.desc, icon: a.icon });
  if (summary.levelUp && !summary.unitComplete && extra.nodeTitle && extra.maxLevel && summary.levelUp >= extra.maxLevel) add({ kind: 'levelup', level: summary.levelUp, nodeTitle: extra.nodeTitle });
  return out;
}

// ---------- Rendering ----------
const FLAME_PATH = 'M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.2 1-3.8 2.3-5 .2 1.6 1 2.6 2 3-.6-3.3-.3-6.3.7-9z';
const flameSvg = () => `<svg class="mm-flame" viewBox="0 0 24 24" aria-hidden="true">
  <g class="fl fl1"><path d="${FLAME_PATH}" fill="#ff7a00"/></g>
  <g class="fl fl2"><path d="${FLAME_PATH}" fill="#ffb400" transform="translate(12 21.5) scale(.74) translate(-12 -21.5)"/></g>
  <g class="fl fl3"><path d="${FLAME_PATH}" fill="#fff2a8" transform="translate(12 21.5) scale(.46) translate(-12 -21.5)"/></g>
</svg><div class="mm-sparks">${Array.from({ length: 8 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${i * 0.23}s"></i>`).join('')}</div>`;

let uid = 0;
function shieldSvg(count) {
  const id = `mmsh${++uid}`;
  const size = String(count).length > 2 ? 34 : 44;
  return `<svg class="mm-badge" viewBox="0 0 120 140" aria-hidden="true">
  <defs><clipPath id="${id}"><path d="M60 6 108 24v40c0 36-20 60-48 72C32 124 12 100 12 64V24z"/></clipPath>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd84d"/><stop offset="1" stop-color="#ff9600"/></linearGradient></defs>
  <path d="M60 6 108 24v40c0 36-20 60-48 72C32 124 12 100 12 64V24z" fill="url(#${id}g)" stroke="#e08500" stroke-width="5" stroke-linejoin="round"/>
  <path d="M60 18 98 31v33c0 29-16 49-38 59C38 113 22 93 22 64V31z" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
  <g transform="translate(36 14) scale(2)"><path d="${FLAME_PATH}" fill="#d92b2b" opacity=".9"/><path d="${FLAME_PATH}" fill="#fff2a8" transform="translate(12 21.5) scale(.5) translate(-12 -21.5)"/></g>
  <text x="60" y="108" text-anchor="middle" font-size="${size}" font-weight="900" fill="#3d2c00" font-family="inherit">${count}</text>
  <g clip-path="url(#${id})"><rect class="mm-shine" x="-60" y="-10" width="36" height="170" fill="#fff" opacity=".55" transform="skewX(-18)"/></g>
</svg>`;
}

const ringSvg = () => `<svg class="mm-ring" viewBox="0 0 140 140" aria-hidden="true">
  <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="13"/>
  <circle class="mm-arc" cx="70" cy="70" r="58" fill="none" stroke="#ffc800" stroke-width="13" stroke-linecap="round" transform="rotate(-90 70 70)" stroke-dasharray="364.4" stroke-dashoffset="364.4"/>
</svg>`;
const RING_LEN = 364.4;

const chestSvg = () => `<svg class="mm-chest" viewBox="0 0 120 100" aria-hidden="true">
  <rect x="18" y="48" width="84" height="46" rx="8" fill="#c97a2b"/><rect x="18" y="48" width="84" height="12" fill="#a8611f"/>
  <rect x="52" y="54" width="16" height="20" rx="4" fill="#ffc800"/><rect x="18" y="86" width="84" height="8" rx="4" fill="#a8611f"/>
  <g class="mm-lid"><path d="M18 50V34a14 14 0 0 1 14-14h56a14 14 0 0 1 14 14v16z" fill="#e0913a"/><rect x="18" y="42" width="84" height="8" fill="#ffc800"/><rect x="54" y="36" width="12" height="14" rx="3" fill="#ffc800"/></g>
</svg>`;

const raysSvg = (n = 14) => `<svg class="mm-rays" viewBox="0 0 200 200" aria-hidden="true"><g>${Array.from({ length: n }, (_, i) => `<path d="M100 100 L${100 - 9} 0 L${100 + 9} 0z" transform="rotate(${(i * 360) / n} 100 100)"/>`).join('')}</g></svg>`;

const trophySvg = () => {
  const id = `mmtr${++uid}`;
  return `<svg class="mm-trophy" viewBox="0 0 120 130" aria-hidden="true">
  <defs><clipPath id="${id}"><path d="M28 12h64v32c0 22-14 36-32 36S28 66 28 44z"/></clipPath></defs>
  <path d="M30 28H14a6 6 0 0 0-6 7c2 18 14 28 28 30M90 28h16a6 6 0 0 1 6 7c-2 18-14 28-28 30" fill="none" stroke="#e5a500" stroke-width="7" stroke-linecap="round"/>
  <path d="M28 12h64v32c0 22-14 36-32 36S28 66 28 44z" fill="#ffc800" stroke="#e5a500" stroke-width="4" stroke-linejoin="round"/>
  <path d="M40 20q-6 22 6 42" stroke="#fff" stroke-opacity=".6" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="54" y="78" width="12" height="20" fill="#e5a500"/><rect x="36" y="98" width="48" height="14" rx="5" fill="#e5a500"/><rect x="42" y="112" width="36" height="8" rx="4" fill="#b87f00"/>
  <path d="M60 28l5 10 11 1.5-8 7.5 2 11-10-5.5L50 58l2-11-8-7.5L55 38z" fill="#fff" fill-opacity=".9"/>
  <g clip-path="url(#${id})"><rect class="mm-shine" x="-20" y="0" width="22" height="130" fill="#fff" opacity=".5"/></g>
</svg>`;
};

const giftSvg = () => `<svg class="mm-gift" viewBox="0 0 120 120" aria-hidden="true">
  <g class="gb"><rect x="20" y="52" width="80" height="58" rx="8" fill="#ce82ff"/><rect x="52" y="52" width="16" height="58" fill="#ffc800"/><rect x="20" y="86" width="80" height="6" fill="#000" opacity=".08"/></g>
  <g class="gl"><rect x="14" y="36" width="92" height="22" rx="8" fill="#b768f2"/><rect x="52" y="36" width="16" height="22" fill="#ffc800"/>
    <path d="M60 36C44 10 22 18 34 32c6 6 18 4 26 4zM60 36c16-26 38-18 26-4-6 6-18 4-26 4z" fill="#ffc800" stroke="#e5a500" stroke-width="3" stroke-linejoin="round"/></g>
</svg>`;

const dots = (n, cls = 'mm-confetti') => `<div class="${cls}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="--a:${(i * 360) / n}deg;--d:${(i % 4) * 50}ms;--c:${['#ffc800', '#1cb0f6', '#ce82ff', '#58cc02', '#ff4b4b'][i % 5]}"></i>`).join('')}</div>`;
const gemRain = (n = 12) => `<div class="mm-gems" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="--a:${(i * 360) / n}deg;--d:${(i % 4) * 45}ms"></i>`).join('')}</div>`;

const weekHtml = (week) => `<div class="mm-week" role="img" aria-label="${esc(t('Your week'))}">${week.map((d, i) => `<div class="mm-day ${d.today ? 'today' : ''}" data-on="${d.on ? 1 : 0}" style="--i:${i}"><small>${esc(d.label)}</small><i>${icon(d.today ? 'flame' : 'check', 16).__raw}</i></div>`).join('')}</div>`;

// What each kind needs: markup and a setup(ctx) that runs the sequence. ctx: { el, later(ms, fn), sound, done }.
const KINDS = {
  streak(m) {
    const first = m.count <= 1;
    const badge = m.milestone && STREAK_BADGES.includes(m.milestone);
    const from = Math.max(0, m.count - 1);
    const shareText = `🔥 ${m.count}-day streak learning ${L.name} with Hajime!`;
    return {
      mood: badge ? 'party' : 'jump',
      line: sayLine('streak'),
      title: badge ? t('{n}-day streak!', { n: m.milestone }) : first ? t('Streak started!') : t('{n} day streak!', { n: m.count }),
      sub: badge ? t(m.milestone >= 100 ? 'A hundred days in a row. Legendary!' : m.milestone >= 30 ? 'A whole month without missing a day. Amazing!' : 'A full week in a row. Keep it going!') : t('Come back tomorrow to keep the flame alive.'),
      hero: badge ? `<div class="mm-rays-wrap">${raysSvg()}</div>${shieldSvg(m.milestone)}` : `${flameSvg()}<b class="mm-num" data-from="${from}" data-to="${m.count}">${first ? m.count : from}</b>`,
      extra: m.week?.length ? weekHtml(m.week) : '',
      action: badge ? shareButton(shareText, t('Share')).__raw : '',
      haptic: HAPTIC.streak,
      setup({ el, later }) {
        later(0, () => sfx(badge ? 'milestone' : 'streak'));
        const num = el.querySelector('.mm-num');
        if (num && !first) later(750, () => countUp(num, from, m.count, 650));
        later(1100, () => {
          const days = [...el.querySelectorAll('.mm-day')];
          days.forEach((d, i) => later(i * 110, () => { if (d.dataset.on === '1') d.classList.add('on'); }));
          later(days.length * 110 + 80, () => { el.querySelector('.mm-day.today')?.classList.add('hit'); sfx('coins'); });
        });
        if (badge) later(450, () => sfx('levelup'));
      },
    };
  },
  goal(m) {
    const goal = Math.max(1, m.goal || 1);
    const from = Math.min(0.97, Math.max(0, ((m.xp || goal) - (m.lessonXp || 0)) / goal));
    return {
      mood: 'cool',
      line: sayLine('goal'),
      title: t('Daily goal reached!'),
      sub: t('{xp} of {goal} XP today', { xp: Math.max(m.xp || goal, goal), goal }),
      hero: `${ringSvg()}<div class="mm-ring-in">${icon('star', 44).__raw}</div>${gemRain(12)}`,
      extra: `<div class="mm-reward-chip"><span class="mm-gemcount">${icon('gem', 22).__raw}<b class="mm-gemnum">0</b></span><span class="mm-plus">+${m.gems || 5} ${esc(t('gems'))}</span></div>`,
      haptic: HAPTIC.goal,
      setup({ el, later }) {
        const arc = el.querySelector('.mm-arc');
        arc.style.setProperty('--from', String(RING_LEN * (1 - from)));
        later(0, () => sfx('swoosh'));
        later(500, () => sfx('goal'));
        later(80, () => arc.classList.add('fill'));
        later(1000, () => {
          el.querySelector('.mm-hero')?.classList.add('burst');
          sfx('pop');
        });
        later(1350, () => {
          sfx('coins');
          const chip = el.querySelector('.mm-plus');
          const target = el.querySelector('.mm-gemcount');
          flyGems(chip, target, 8);
          countUp(el.querySelector('.mm-gemnum'), 0, m.gems || 5, 500, { delay: 400 });
        });
      },
    };
  },
  chest(m) {
    const source = { quests: t('Daily quests done'), perfect3: t('3 perfect lessons in a row'), weekly: t('7-day treasure'), path: t('Path treasure') }[m.source] || '';
    return {
      mood: 'cheer',
      line: sayLine('gift'),
      title: m.title || t('Treasure!'),
      sub: source,
      hero: `<div class="mm-rays-wrap">${raysSvg(12)}</div>${chestSvg()}${gemRain(14)}`,
      extra: `<div class="mm-reward-chip"><span class="mm-plus mm-big">${icon('gem', 30).__raw}<b class="mm-gemnum">0</b> ${esc(t('gems'))}</span></div>${m.minutes ? `<p class="mm-note">${esc(t('Double XP for the next {n} minutes!', { n: m.minutes }))}</p>` : ''}`,
      haptic: [30, 30, 30],
      setup({ el, later }) {
        const hero = el.querySelector('.mm-hero');
        later(0, () => sfx('whoosh'));
        later(950, () => {
          hero.classList.add('open');
          el.classList.add('is-open');
          sfx('chest');
          buzz(HAPTIC.chest);
        });
        later(1250, () => {
          sfx('coins');
          countUp(el.querySelector('.mm-gemnum'), 0, m.gems || 0, 650);
          flyGems(el.querySelector('.mm-plus'), document.querySelector('.stat-gems'), 6);
        });
      },
    };
  },
  gift(m) {
    const r = m.reward || {};
    const lines = [];
    if (r.gems) lines.push(`<span>${icon('gem', 30).__raw} +${r.gems} ${esc(t('gems'))}</span>`);
    if (r.freeze) lines.push(`<span><b class="mm-emoji">🧊</b> ${esc(t('Streak freeze'))}</span>`);
    if (r.doubleXpMs) lines.push(`<span>${icon('bolt', 30).__raw} ${esc(t('{n} min double XP', { n: Math.round(r.doubleXpMs / 60000) }))}</span>`);
    if (r.text) lines.push(`<span class="mm-fact"><b class="mm-emoji">💡</b> ${esc(r.text)}</span>`);
    return {
      mood: 'party',
      line: sayLine('gift'),
      title: m.title || t('A gift for you!'),
      sub: t('Tap the gift to open it'),
      revealTitle: t('Surprise!'),
      hero: `<div class="mm-rays-wrap">${raysSvg(12)}</div>${giftSvg()}${dots(18)}`,
      extra: `<div class="mm-reveal" aria-live="polite" hidden>${lines.join('')}</div>`,
      closed: true,
      primary: t('Open'),
      haptic: HAPTIC.gift,
      setup({ later }) {
        later(0, () => sfx('tap'));
      },
    };
  },
  unit(m) {
    return {
      mood: 'trophy',
      line: sayLine('end'),
      title: m.title || t('Unit complete!'),
      sub: '',
      unitTitle: m.unitTitle,
      color: m.color,
      hero: `<div class="mm-rays-wrap">${raysSvg(16)}</div>${trophySvg()}${dots(26)}`,
      extra: `<p class="mm-unit" style="--c:${esc(m.color || '#ffc800')}">${esc(m.unitTitle || '')}</p>`,
      haptic: HAPTIC.unit,
      setup({ later }) {
        later(0, () => sfx('unit'));
        later(900, () => sfx('gem'));
      },
    };
  },
  achievement(m) {
    return {
      mood: 'cool',
      line: sayLine('end'),
      title: m.title,
      sub: m.desc || '',
      eyebrow: t('Achievement unlocked'),
      hero: `<div class="mm-rays-wrap">${raysSvg(12)}</div><div class="mm-ach"><span class="mm-ach-icon">${esc(m.icon || '🏆')}</span><i class="mm-sweep"></i></div>${dots(14)}`,
      extra: '',
      haptic: HAPTIC.achievement,
      setup({ later }) {
        later(0, () => sfx('achievement'));
      },
    };
  },
  levelup(m) {
    return {
      mood: null,
      line: '',
      title: m.nodeTitle || t('Level up!'),
      sub: t('Level {n}', { n: m.level }),
      hero: `<div class="mm-crown">${icon('star', 84).__raw}</div>${dots(10)}`,
      extra: '',
      haptic: HAPTIC.levelup,
      light: true,
      setup({ later }) {
        later(0, () => sfx('levelup'));
      },
    };
  },
};

// ---------- The sequencer ----------
let running = null;

function ensureRoot() {
  let root = document.getElementById('moment');
  if (!root) {
    root = document.createElement('div');
    root.id = 'moment';
    document.body.append(root);
  }
  return root;
}

const INERT = ['#view', '#nav', '#modal'];
function setInert(on) {
  for (const sel of INERT) {
    const el = document.querySelector(sel);
    if (!el) continue;
    if ('inert' in el) el.inert = on;
    else if (on) el.setAttribute('aria-hidden', 'true');
    else el.removeAttribute('aria-hidden');
  }
}

export const pendingKinds = () => queue.map((m) => m.kind);

// Shows the queued moments one after another. Resolves when the last one is dismissed or "Skip all" is tapped.
export function playMoments() {
  if (running) return running;
  if (!queue.length || typeof document === 'undefined') {
    queue.length = 0;
    return Promise.resolve();
  }
  running = run().finally(() => { running = null; });
  return running;
}

async function run() {
  const root = ensureRoot();
  const opener = document.activeElement;
  root.className = 'moment';
  setInert(true);
  try {
    while (queue.length) {
      const m = queue.shift();
      const outcome = await show(root, m, queue.length);
      if (outcome === 'skip') queue.length = 0;
    }
  } finally {
    root.className = '';
    root.innerHTML = '';
    setInert(false);
    if (opener?.isConnected && opener !== document.body) opener.focus?.({ preventScroll: true });
  }
}

function show(root, m, remaining) {
  return new Promise((resolve) => {
    const spec = KINDS[m.kind]?.(m);
    if (!spec) return resolve('next');
    const timers = [];
    const quick = reduced();
    const later = (ms, fn) => {
      if (quick) { fn(); return; }
      timers.push(setTimeout(fn, ms));
    };
    const skipBtn = remaining > 0 ? `<button class="mm-skip" type="button">${esc(t('Skip all'))}</button>` : '';
    root.innerHTML = `<div class="mm-card mm-k-${m.kind} ${spec.light ? 'mm-light' : ''} ${quick ? 'mm-still' : ''}" role="dialog" aria-modal="true" aria-labelledby="moment-title" style="--c:${esc(spec.color || '')}">
      <div class="mm-hero ${spec.closed ? 'closed' : ''}">${spec.hero}</div>
      <div class="mm-text">
        ${spec.eyebrow ? `<p class="mm-eyebrow">${esc(spec.eyebrow)}</p>` : ''}
        <h2 id="moment-title" class="mm-title">${esc(spec.title)}</h2>
        ${spec.sub ? `<p class="mm-sub">${esc(spec.sub)}</p>` : ''}
      </div>
      <div class="mm-extra">${spec.extra}</div>
      ${spec.mood ? `<div class="mm-mascot">${mascotSvg(spec.mood, 104)}<p class="mm-bubble">${esc(spec.line)}</p></div>` : '<div class="mm-mascot-gap"></div>'}
      <div class="mm-actions">${spec.action || ''}<button class="btn btn-primary btn-block mm-go" type="button">${esc(spec.primary || t('Continue'))}</button>${skipBtn}</div>
    </div>`;
    const card = root.firstElementChild;
    const go = card.querySelector('.mm-go');
    const hero = card.querySelector('.mm-hero');
    wireShare(card);
    sfxHaptic(spec);
    if (spec.setup) spec.setup({ el: card, later });
    const born = Date.now();
    let closed = spec.closed || false; // a gift stays shut until tapped
    let leaving = false;
    const leave = (outcome) => {
      if (leaving) return;
      leaving = true;
      timers.forEach(clearTimeout);
      document.removeEventListener('keydown', onKey, true);
      if (quick || !card.animate) return resolve(outcome);
      const a = card.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' });
      a.finished.then(() => resolve(outcome), () => resolve(outcome));
    };
    const reveal = () => {
      if (!closed) return;
      closed = false;
      hero.classList.remove('closed');
      hero.classList.add('shake');
      sfx('whoosh');
      buzz(HAPTIC.gift);
      later(520, () => {
        hero.classList.remove('shake');
        hero.classList.add('opened');
        sfx('gift');
        card.querySelector('.mm-title').textContent = spec.revealTitle;
        const sub = card.querySelector('.mm-sub');
        if (sub) sub.remove();
        const box = card.querySelector('.mm-reveal');
        box.hidden = false;
        card.classList.add('revealed');
        go.textContent = t('Continue');
        go.focus({ preventScroll: true });
      });
    };
    // A beat of grace, so the tap that closed the stats screen does not also dismiss the first moment.
    const ready = () => Date.now() - born > (quick ? 0 : 260);
    const advance = () => {
      if (!ready()) return;
      if (closed) return reveal();
      leave('next');
    };
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    }
    go.addEventListener('click', advance);
    hero.addEventListener('click', advance);
    card.querySelector('.mm-skip')?.addEventListener('click', () => leave('skip'));
    document.addEventListener('keydown', onKey, true);
    go.focus({ preventScroll: true });
  });
}

function sfxHaptic(spec) {
  buzz(spec.haptic);
}

// Tone trainer (Chinese course): the four Mandarin tones — the beginner's biggest new hurdle, as kana
// are in Japanese. A chart to hear each tone, and a listening game: hear a syllable, pick its tone.
// Rounds use classic sets that only differ by tone (妈 麻 马 骂) and characters from learned words.
import { ITEMS } from '../course.js';
import { app, statsBar } from '../app.js';
import { html, mount, raw, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { mascot } from '../mascot.js';
import { speak, sfx } from '../audio.js';
import { pinyinParts, stripTones } from '../pinyin.js';

export const TONES = [
  { n: 1, name: 'High & flat', tip: 'Hold it high and steady, like singing a note: māāā', path: 'M6 8 H46', ex: ['妈', 'mā', 'mother'] },
  { n: 2, name: 'Rising', tip: 'Goes up, like asking "huh?"', path: 'M6 38 L46 8', ex: ['麻', 'má', 'hemp, numb'] },
  { n: 3, name: 'Dip & rise', tip: 'Low and dipping, like a doubtful "well…"', path: 'M6 24 Q20 46 30 42 T46 14', ex: ['马', 'mǎ', 'horse'] },
  { n: 4, name: 'Falling', tip: 'Short and sharp, like a firm "No!"', path: 'M6 8 L46 40', ex: ['骂', 'mà', 'to scold'] },
];
// Sets of characters that differ only by tone, said alone by the voice.
const SETS = [
  [['妈', 'mā'], ['麻', 'má'], ['马', 'mǎ'], ['骂', 'mà']],
  [['八', 'bā'], ['拔', 'bá'], ['把', 'bǎ'], ['爸', 'bà']],
  [['汤', 'tāng'], ['糖', 'táng'], ['躺', 'tǎng'], ['烫', 'tàng']],
  [['衣', 'yī'], ['姨', 'yí'], ['椅', 'yǐ'], ['意', 'yì']],
  [['书', 'shū'], ['熟', 'shú'], ['鼠', 'shǔ'], ['树', 'shù']],
  [['夫', 'fū'], ['福', 'fú'], ['斧', 'fǔ'], ['父', 'fù']],
  [['猪', 'zhū'], ['竹', 'zhú'], ['主', 'zhǔ'], ['住', 'zhù']],
  [['烟', 'yān'], ['盐', 'yán'], ['眼', 'yǎn'], ['燕', 'yàn']],
];
const ROUNDS = 10;
const MARKS = { '̄': 1, '́': 2, '̌': 3, '̀': 4 };
export const toneOf = (syllable) => [...syllable.normalize('NFD')].map((c) => MARKS[c]).find(Boolean) || 0;
const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

export const contour = (t, size = 40) => raw(`<svg class="tone-contour" width="${size}" height="${Math.round(size * 0.92)}" viewBox="0 0 52 48" aria-hidden="true">
  <path d="M4 4 H48 M4 24 H48 M4 44 H48" class="tone-lines"/><path d="${TONES[t - 1].path}" class="tone-path"/></svg>`);

// Characters from the learner's words, said alone (one syllable, clear tone). 不 and 一 change tone
// in words, so they are left out.
function learnedSyllables(state) {
  const out = [];
  for (const id of Object.keys(state.items)) {
    const it = ITEMS.get(id);
    if (it?.type !== 'word') continue;
    for (const p of pinyinParts(it.jp, it.romaji) || []) {
      if (toneOf(p.romaji) && !'不一'.includes(p.text)) out.push([p.text, p.romaji.toLowerCase(), it]);
    }
  }
  return out;
}

// Chart for Practice → Library → Tones: hear each tone.
export function toneChart() {
  return html`<section class="card tone-chart">${TONES.map((t) => html`<button class="tone-row" data-say="${t.ex[0]}">
    <span class="tone-n">${t.n}</span>${contour(t.n)}<span class="tone-text"><b>${t.name}</b><small>${t.tip}</small></span>
    <span class="tone-ex"><b class="jp">${t.ex[0]}</b><small>${t.ex[1]}</small></span></button>`)}</section>
    <p class="muted small">The same syllable means different things with each tone: mā 妈 mother, má 麻 numb, mǎ 马 horse, mà 骂 scold. Tap a row to hear it.</p>`;
}

export function renderTones(root) {
  const fromWords = shuffle(learnedSyllables(app.state));
  const fromSets = shuffle(SETS.flat());
  const rounds = Array.from({ length: ROUNDS }, (_, i) => (i % 2 && fromWords.length ? fromWords[(i >> 1) % fromWords.length] : fromSets[i % fromSets.length]));
  let i = 0;
  let score = 0;

  const show = () => {
    const [ch, py] = rounds[i];
    mount(root, html`<header class="topbar topbar-back"><a class="icon-btn" href="#/practice/library" aria-label="Close">${icon('close', 24)}</a><h1>Tone trainer</h1></header>
    <main class="page quiz tones">
      <p class="muted quiz-count">${i + 1} of ${rounds.length}</p>
      <section class="card quiz-card tone-q"><button class="speaker tone-play" aria-label="Play">${icon('speaker', 30)}</button>
        <p class="quiz-text">Which tone is <b>${stripTones(py)}</b>?</p></section>
      <div class="tone-options">${TONES.map((t) => html`<button class="option tone-opt" data-n="${t.n}">${contour(t.n, 44)}<span><b>${t.n}</b> ${t.name}</span></button>`)}</div>
      <div class="quiz-after" hidden></div>
    </main>`);
    const play = () => speak(ch, { speaker: 'woman2' });
    $('.tone-play', root).addEventListener('click', play);
    $$('.tone-opt', root).forEach((b) => b.addEventListener('click', () => answer(b)));
    play();
  };

  const answer = (btn) => {
    const [ch, py, word] = rounds[i];
    const right = toneOf(py);
    const ok = Number(btn.dataset.n) === right;
    if (ok) score += 1;
    sfx(ok ? 'correct' : 'wrong');
    $$('.tone-opt', root).forEach((b) => {
      b.disabled = true;
      if (Number(b.dataset.n) === right) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    speak(ch, { speaker: 'woman2' });
    const after = $('.quiz-after', root);
    after.hidden = false;
    mount(after, html`<p class="quiz-reveal"><span><b>${ok ? 'Right!' : 'Not quite.'}</b> <span class="jp">${ch}</span> <b>${py}</b> — tone ${right} (${TONES[right - 1].name.toLowerCase()})${word ? html`, as in <span class="jp">${word.jp}</span> ${word.romaji} (${word.en})` : ''}.</span></p>
      <button class="btn btn-primary btn-block quiz-next">${i + 1 < rounds.length ? 'Next' : 'See my score'}</button>`);
    $('.quiz-next', root).addEventListener('click', () => {
      i += 1;
      if (i < rounds.length) show();
      else finish();
    });
  };

  const finish = () => {
    app.state.gems += score;
    app.save();
    if (score) sfx('bonus');
    mount(root, html`<header class="topbar">${statsBar()}</header>
    <main class="page quiz quiz-end">
      ${mascot(score >= rounds.length - 2 ? 'cheer' : 'happy', 110)}
      <h1>${score} / ${rounds.length}</h1>
      <p class="muted">${score >= rounds.length - 1 ? 'Great ear — tones are the hardest part of Chinese!' : score >= 6 ? 'Nice! Your ear is getting there.' : 'Tones take time. A few minutes a day works wonders.'}</p>
      ${score ? html`<p class="pill pill-gold">${icon('gem', 16)} +${score} gems</p>` : ''}
      <button class="btn btn-primary btn-block quiz-again">Again</button>
      <a class="btn btn-white btn-block" href="#/practice/library">Back to practice</a>
    </main>`);
    $('.quiz-again', root).addEventListener('click', () => renderTones(root));
  };

  show();
}

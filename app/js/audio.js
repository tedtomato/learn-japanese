// Speech in the course's language (Japanese or Chinese) with the device's voices, voice casting for
// the lesson characters, speech recognition for speaking exercises, and small generated sound effects.
import { L } from './lang.js';
import { speechKey, similarity } from './normalise.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
let jaVoices = [];
let voiceCount = 0;
let baseRate = 0.85;

// Voice names by platform. Japanese: Apple (Kyoko, O-ren / Otoya, Hattori), Microsoft (Haruka, Ayumi,
// Nanami / Ichiro, Keita), Google on Android (ja-jp-x-htm / jab are women, jac / jad are men).
// Chinese: Apple (Tingting, Lili / Li-mu), Microsoft (Xiaoxiao, Huihui, Yaoyao / Kangkang, Yunxi,
// Yunyang), Google 普通话. Mainland voices (zh-CN) come first, then any other Chinese voice.
const FEMALE = /kyoko|o-?ren|haruka|ayumi|nanami|sayaka|mizuki|aoi|shiori|mei|ting-?ting|lili|xiaoxiao|huihui|yaoyao|xiaoyi|female|女性|女|google 日本語|google 普通话|-htm-|-jab-/i;
const MALE = /otoya|hattori|ichiro|keita|daichi|naoki|takumi|kenji|li-?mu|kangkang|yunxi|yunyang|yunjian|\bmale\b|男性|男|-jac-|-jad-/i;
const LANG_PREFIX = new RegExp(`^${L.speech.slice(0, 2)}([-_]|$)`, 'i');
const exactLang = (v) => v.lang.replace('_', '-').toLowerCase() === L.speech.toLowerCase();

// Better-sounding voices first: names that say Enhanced, Premium, Natural, Neural, Online, Google or Siri.
const QUALITY = [[/premium|enhanced|neural|natural/i, 3], [/online|siri/i, 2], [/google/i, 1]];
export const voiceQuality = (name) => QUALITY.reduce((best, [re, n]) => (re.test(name) ? Math.max(best, n) : best), 0);

function loadVoices() {
  if (!synth) return;
  const voices = synth.getVoices();
  voiceCount = voices.length;
  jaVoices = voices.filter((v) => LANG_PREFIX.test(v.lang)).sort((a, b) => exactLang(b) - exactLang(a) || voiceQuality(b.name) - voiceQuality(a.name)).map((v) => ({
    voice: v,
    gender: MALE.test(v.name) ? 'male' : FEMALE.test(v.name) ? 'female' : 'unknown',
  }));
}
if (synth) {
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
}

export const setVoiceRate = (r) => (baseRate = r);

export function voiceStatus() {
  if (!synth) return 'no';
  if (jaVoices.length) return 'yes';
  return voiceCount > 0 ? 'no' : 'unknown';
}
export const canSpeakAloud = () => voiceStatus() !== 'no';

// Lessons use the phone's own Japanese voice as it is: Yuki and Mika share it, unchanged, since
// pitch tricks to fake other voices sound robotic. Kept for later: man, boy and girl casts.
const CAST = {
  woman: { gender: 'female', pitch: 1, rate: 1 },
  woman2: { gender: 'female', pitch: 1, rate: 1 },
  man: { gender: 'male', pitch: 1, rate: 1 },
  boy: { gender: 'male', pitch: 1, rate: 1 },
  girl: { gender: 'female', pitch: 1, rate: 1 },
  narrator: { gender: 'female', pitch: 1, rate: 1 },
};
export const SPEAKERS = ['woman', 'woman2'];

function voiceFor(speaker) {
  const want = CAST[speaker] || CAST.narrator;
  const match = jaVoices.find((v) => v.gender === want.gender) || jaVoices.find((v) => v.gender === 'unknown') || jaVoices[0];
  return { voice: match?.voice || null, pitch: want.pitch, rate: want.rate };
}

// Speaks Japanese. opts: speaker, slow, fast, onStart, onEnd. Resolves when finished.
export function speak(text, { speaker = 'narrator', slow = false, fast = false, onStart, onEnd, onBoundary } = {}) {
  return new Promise((resolve) => {
    if (!synth || !text) {
      resolve();
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const { voice, pitch, rate } = voiceFor(speaker);
    u.lang = L.speech;
    if (voice) u.voice = voice;
    u.pitch = Math.min(2, pitch);
    u.rate = slow ? 0.5 : fast ? Math.min(1.6, baseRate * 1.45) : baseRate * rate;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onEnd?.();
      resolve();
    };
    u.onstart = () => onStart?.({ rate: u.rate });
    // Where the voice is in the text, on devices that report it (used to highlight syllables).
    u.onboundary = (e) => onBoundary?.(e.charIndex);
    u.onend = finish;
    u.onerror = finish;
    // Some browsers never fire onend; give up after a generous estimate.
    setTimeout(finish, 1500 + text.length * 400);
    synth.speak(u);
  });
}

// Prompts in the language of the meanings (English; French in the English course) for the
// hands-free listening mode, in the device's voice for that language.
export function speakGloss(text) {
  return new Promise((resolve) => {
    if (!synth || !text) return resolve();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const code = L.gloss === 'French' ? 'fr' : 'en';
    u.lang = code === 'fr' ? 'fr-FR' : 'en-US';
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(code));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    let done = false;
    const finish = () => !done && (done = true, resolve());
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, 1500 + text.length * 150);
    synth.speak(u);
  });
}

export const stopSpeaking = () => synth?.cancel();

// ---- Speech recognition ----
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
export const canRecognise = () => !!Recognition;

// Listens once in Japanese; resolves with the alternatives heard ([] on silence / error).
export function listen({ timeoutMs = 7000 } = {}) {
  return new Promise((resolve) => {
    if (!Recognition) {
      resolve([]);
      return;
    }
    const rec = new Recognition();
    rec.lang = L.speech;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let heard = [];
    const timer = setTimeout(() => rec.stop(), timeoutMs);
    rec.onresult = (e) => {
      heard = [...e.results[0]].map((r) => r.transcript);
    };
    rec.onerror = () => {};
    rec.onend = () => {
      clearTimeout(timer);
      resolve(heard);
    };
    try {
      rec.start();
    } catch {
      clearTimeout(timer);
      resolve([]);
    }
  });
}

// Is what the recogniser heard close enough to the target (kana) or one of its other spellings?
export function speechMatches(heard, targets) {
  const goals = targets.map(speechKey).filter(Boolean);
  // Latin words are short and close to each other (bonjour / bonsoir, non / nom), so the fuzzy
  // match is stricter, and not used at all for words of four letters or fewer.
  const fuzzy = (g) => (L.latin ? (g.length <= 4 ? 2 : 0.8) : 0.6);
  return heard.some((h) => {
    const n = speechKey(h);
    return goals.some((g) => n.includes(g) || g.includes(n) && n.length >= g.length * 0.7 || similarity(n, g) >= fuzzy(g));
  });
}

// ---- Sound effects ----
// Designed sounds: short MP3s in app/sfx/ (made by scripts/sfx.mjs), decoded once and played through a master
// gain. They load lazily after the first tap (autoplay rules) and never block: while a file is not ready, or if it
// fails to load, the old generated oscillator beeps below play instead.
export const SFX_NAMES = [
  'tap', 'tile', 'tile-off', 'select', 'swoosh', 'pop',
  'correct', 'correct-combo3', 'correct-combo5', 'correct-combo10', 'wrong', 'almost', 'match', 'heart', 'tick', 'timeup',
  'complete', 'perfect', 'xp', 'xp-end',
  'streak', 'milestone', 'goal', 'chest', 'gem', 'gift', 'unlock', 'unit', 'achievement', 'levelup', 'quest', 'flame',
];
// Names older call sites use.
export const SFX_ALIASES = { bonus: 'gem', coins: 'gem', fanfare: 'milestone', whoosh: 'swoosh', stroke: 'select', right: 'correct' };
// Loudness of each file relative to the others (every file is normalised to -1 dBFS).
const LEVEL = {
  tap: 0.5, tile: 0.7, 'tile-off': 0.55, select: 0.55, swoosh: 0.45, pop: 0.6, tick: 0.5, xp: 0.45, wrong: 0.8, almost: 0.7, match: 0.65,
  heart: 0.75, timeup: 0.85, gem: 0.7, flame: 0.7, quest: 0.75, unlock: 0.75, gift: 0.7, correct: 0.75, 'correct-combo3': 0.78,
  'correct-combo5': 0.8, 'correct-combo10': 0.82, chest: 0.8, 'xp-end': 0.7, complete: 0.85, perfect: 0.88, streak: 0.85, goal: 0.85,
  milestone: 0.85, unit: 0.88, achievement: 0.8, levelup: 0.8,
};
// Fetched right after the first tap; the rest on demand.
const COMMON = ['tap', 'tile', 'tile-off', 'select', 'correct', 'wrong', 'swoosh', 'pop', 'complete', 'xp', 'xp-end', 'gem'];
// Small interface sounds are skipped (rather than beeped) while their file is still loading.
const UI_ONLY = new Set(['tap', 'tile', 'tile-off', 'select', 'tick', 'xp', 'pop']);

let ctx;
let master;
let sfxOn = true;
let sfxVol = 1;
export const setSfx = (on) => (sfxOn = on);
export const setSfxVolume = (v) => {
  sfxVol = Math.min(1, Math.max(0, Number(v) || 0));
  if (master) master.gain.value = sfxVol;
};

function audioContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = sfxVol;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const buffers = new Map();
const loading = new Set();
const failed = new Set();
const fileUrl = (name) => new URL(`../sfx/${name}.mp3`, import.meta.url).href;
function load(name) {
  if (buffers.has(name) || loading.has(name) || failed.has(name) || typeof fetch !== 'function') return;
  loading.add(name);
  fetch(fileUrl(name))
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
    .then((b) => buffers.set(name, b))
    .catch(() => failed.add(name))
    .finally(() => loading.delete(name));
}

// ---- Fallback: the generated oscillator beeps (used until a file is ready, or if it cannot load) ----
function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// A burst of filtered noise whose centre frequency sweeps from f0 to f1 (whoosh, creak, flame).
function noise(start, dur, f0, f1, gain = 0.12, q = 1.2) {
  const t = ctx.currentTime + start;
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(f0, t);
  filter.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
}

const SOUNDS = {
  correct: () => { tone(880, 0, 0.12); tone(1318, 0.09, 0.22); },
  wrong: () => { tone(220, 0, 0.18, 'square', 0.06); tone(180, 0.12, 0.25, 'square', 0.06); },
  tap: () => tone(660, 0, 0.05, 'triangle', 0.08),
  tick: () => tone(1200, 0, 0.04, 'square', 0.05),
  timeup: () => { tone(440, 0, 0.12, 'sawtooth', 0.06); tone(330, 0.12, 0.25, 'sawtooth', 0.06); },
  bonus: () => [784, 988, 1175].forEach((f, i) => tone(f, i * 0.07, 0.15, 'triangle', 0.12)),
  complete: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.14)),
  stroke: () => tone(990, 0, 0.08, 'sine', 0.1),
  // Reward moments: a rising three-note chord with a shimmer on top.
  fanfare: () => {
    [[523, 0], [659, 0.12], [784, 0.24]].forEach(([f, d]) => tone(f, d, 0.5, 'triangle', 0.13));
    [1568, 1976, 2349].forEach((f, i) => tone(f, 0.38 + i * 0.07, 0.3, 'sine', 0.05));
  },
  // Three quick descending triplets, like coins falling.
  coins: () => [0, 0.16, 0.32].forEach((d) => [1568, 1318, 1046].forEach((f, i) => tone(f, d + i * 0.04, 0.09, 'square', 0.04))),
  whoosh: () => noise(0, 0.38, 400, 3200, 0.14),
  chest: () => {
    noise(0, 0.28, 180, 420, 0.07, 6); // creak
    tone(300, 0.26, 0.1, 'triangle', 0.14); // pop
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.32 + i * 0.08, 0.25, 'triangle', 0.12));
  },
  levelup: () => [392, 494, 587, 784, 988, 1175].forEach((f, i) => tone(f, i * 0.07, 0.2, 'triangle', 0.11)),
  gift: () => [1568, 2093, 1760, 2349, 2637].forEach((f, i) => tone(f, i * 0.06, 0.18, 'sine', 0.07)),
  flame: () => { noise(0, 0.55, 220, 700, 0.1, 0.8); tone(110, 0, 0.5, 'sine', 0.1); },
};
// Which beep stands in for each designed sound.
const FALLBACK = {
  tile: 'tap', 'tile-off': 'tap', pop: 'tap', select: 'stroke', swoosh: 'whoosh', 'correct-combo3': 'correct', 'correct-combo5': 'correct',
  'correct-combo10': 'correct', almost: 'wrong', match: 'bonus', heart: 'wrong', perfect: 'complete', xp: 'tick', 'xp-end': 'bonus', streak: 'fanfare',
  milestone: 'fanfare', goal: 'fanfare', gem: 'bonus', unlock: 'bonus', unit: 'fanfare', achievement: 'levelup', quest: 'bonus',
};

// ---- Playing ----
const lastAt = {};
let autoTapAt = -1e9;
let xpAt = -1e9;
let xpCount = 0;

function play(key) {
  const now = performance.now();
  if (now - (lastAt[key] ?? -1e9) < (key === 'tap' ? 35 : 25)) return; // cheap to call many times a second
  lastAt[key] = now;
  audioContext();
  const b = buffers.get(key);
  if (b) {
    const src = ctx.createBufferSource();
    src.buffer = b;
    if (key === 'xp') {
      // The slot-roll climbs while ticks keep coming, and starts over after a pause.
      xpCount = now - xpAt > 350 ? 0 : xpCount + 1;
      xpAt = now;
      src.playbackRate.value = 1 + Math.min(xpCount, 24) * 0.025;
    }
    const g = ctx.createGain();
    g.gain.value = LEVEL[key] ?? 0.8;
    src.connect(g).connect(master);
    src.start();
    return;
  }
  const loadingNow = !failed.has(key);
  load(key);
  if (loadingNow && UI_ONLY.has(key)) return;
  (SOUNDS[key] || SOUNDS[FALLBACK[key]])?.();
}

export function sfx(name) {
  if (!sfxOn) return;
  const key = SFX_ALIASES[name] || name;
  if (!SFX_NAMES.includes(key)) return;
  if (key === 'tap' && performance.now() - autoTapAt < 400) return; // the tap on pointer-down already played
  try {
    play(key);
  } catch {
    /* audio not available */
  }
}

// The first tap unlocks audio, starts fetching the common sounds, and from then on every press on a button,
// tab or tile ticks (with a small buzz) without each screen having to ask. Anything with data-silent is left out.
const PRESSABLE = 'button, [role="button"], [role="tab"], [role="radio"], [role="option"], a[href], summary, label, .btn, .tab, .tile, .opt, .option';
if (typeof document !== 'undefined') {
  const unlock = () => {
    try {
      audioContext();
      if (sfxOn) COMMON.forEach(load);
      if (ctx.state === 'running') for (const ev of ['pointerdown', 'touchend', 'keydown', 'click']) document.removeEventListener(ev, unlock, true);
    } catch {
      /* audio not available */
    }
  };
  for (const ev of ['pointerdown', 'touchend', 'keydown', 'click']) document.addEventListener(ev, unlock, { capture: true, passive: true });
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button > 0) return;
    const el = e.target?.closest?.(PRESSABLE);
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[data-silent]')) return;
    if (sfxOn) {
      try {
        play('tap');
        autoTapAt = performance.now();
      } catch {
        /* audio not available */
      }
    }
    buzz(HAPTIC.tap);
  }, { capture: true, passive: true });
}

// ---- Vibration ----
// Patterns in milliseconds, [vibrate, pause, vibrate, ...]. Off in the Profile settings.
let hapticsOn = true;
export const setHaptics = (on) => (hapticsOn = on !== false);
export const HAPTIC = {
  tap: 8, tile: 12, select: 10, correct: [18, 30, 28], wrong: [70, 40, 90], almost: [25, 30, 25],
  combo3: [15, 20, 15, 20, 40], combo5: [15, 15, 15, 15, 15, 15, 60], combo10: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 120],
  complete: [40, 40, 40, 40, 160], streak: [30, 40, 30, 40, 30, 40, 140], goal: [25, 25, 50, 25, 110],
  chest: [20, 20, 20, 20, 20, 20, 40, 30, 100], gift: [15, 25, 15, 25, 90], unit: [40, 40, 40, 40, 200],
  achievement: [25, 30, 25, 30, 120], levelup: 35, heart: [80, 60, 120], tick: 6, unlock: [20, 30, 40],
};
HAPTIC.right = HAPTIC.correct; // the older name

const buzzLength = (p) => (Array.isArray(p) ? p.reduce((a, b) => a + b, 0) : p);
let lastBuzz = { at: -1e9, len: 0 };
// Calls within 30 ms of each other are coalesced: only a longer pattern replaces the one just started.
export function buzz(ms = HAPTIC.wrong) {
  if (!hapticsOn) return;
  const now = performance.now();
  const len = buzzLength(ms);
  if (now - lastBuzz.at < 30 && len <= lastBuzz.len) return;
  lastBuzz = { at: now, len };
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* no vibration */
  }
}

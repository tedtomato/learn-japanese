// Japanese speech with the device's voices, voice casting for the lesson characters, speech
// recognition for speaking exercises, and small generated sound effects.

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
let jaVoices = [];
let voiceCount = 0;
let baseRate = 0.85;

// Voice names by platform: Apple (Kyoko, O-ren / Otoya, Hattori), Microsoft (Haruka, Ayumi, Nanami /
// Ichiro, Keita), Google on Android (ja-jp-x-htm / jab are women, jac / jad are men).
const FEMALE = /kyoko|o-?ren|haruka|ayumi|nanami|sayaka|mizuki|aoi|shiori|mei|female|女性|google 日本語|-htm-|-jab-/i;
const MALE = /otoya|hattori|ichiro|keita|daichi|naoki|takumi|kenji|\bmale\b|男性|-jac-|-jad-/i;

function loadVoices() {
  if (!synth) return;
  const voices = synth.getVoices();
  voiceCount = voices.length;
  jaVoices = voices.filter((v) => /^ja([-_]|$)/i.test(v.lang)).map((v) => ({
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

// Each character has a voice: the one picked in Profile, else a matching male/female device voice,
// else pitch and pace do the work (a deep, slower man; a high girl).
const CAST = {
  man: { gender: 'male', pitch: 0.95, fallbackPitch: 0.45, rate: 1, fallbackRate: 0.92 },
  woman: { gender: 'female', pitch: 1.05, fallbackPitch: 1.05, rate: 1 },
  boy: { gender: 'male', pitch: 1.3, fallbackPitch: 1.2, rate: 1.05 },
  girl: { gender: 'female', pitch: 1.45, fallbackPitch: 1.45, rate: 1.05 },
  narrator: { gender: 'female', pitch: 1, fallbackPitch: 1, rate: 1 },
};
export const SPEAKERS = ['man', 'woman', 'boy', 'girl'];

let chosen = {};
export const setVoiceChoice = (map) => (chosen = map || {});
export const japaneseVoices = () => jaVoices.map((v) => ({ name: v.voice.name, gender: v.gender }));

function voiceFor(speaker) {
  const want = CAST[speaker] || CAST.narrator;
  const fits = (v) => ({ voice: v.voice, pitch: v.gender === want.gender ? want.pitch : want.fallbackPitch,
    rate: v.gender === want.gender ? want.rate : want.fallbackRate || want.rate });
  const picked = jaVoices.find((v) => v.voice.name === chosen[speaker]);
  if (picked) return fits(picked);
  const exact = jaVoices.find((v) => v.gender === want.gender);
  if (exact) return fits(exact);
  // No matching voice: men take a different voice from the women when the phone has several.
  const pool = jaVoices.filter((v) => v.gender === 'unknown');
  const list = pool.length ? pool : jaVoices;
  const other = want.gender === 'male' ? list[list.length - 1] : list[0];
  return other ? fits(other) : { voice: null, pitch: want.fallbackPitch, rate: want.fallbackRate || want.rate };
}

// Speaks Japanese. opts: speaker, slow, fast, onStart, onEnd. Resolves when finished.
export function speak(text, { speaker = 'narrator', slow = false, fast = false, onStart, onEnd } = {}) {
  return new Promise((resolve) => {
    if (!synth || !text) {
      resolve();
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const { voice, pitch, rate } = voiceFor(speaker);
    u.lang = 'ja-JP';
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
    u.onstart = () => onStart?.();
    u.onend = finish;
    u.onerror = finish;
    // Some browsers never fire onend; give up after a generous estimate.
    setTimeout(finish, 1500 + text.length * 400);
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
    rec.lang = 'ja-JP';
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

const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const normJa = (s) => toHira(s).replace(/[\s、。！？!?.,・～〜ー]/g, '');

function similarity(a, b) {
  if (!a || !b) return 0;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length);
}

// Is what the recogniser heard close enough to the target (kana) or one of its other spellings?
export function speechMatches(heard, targets) {
  const goals = targets.map(normJa).filter(Boolean);
  return heard.some((h) => {
    const n = normJa(h);
    return goals.some((g) => n.includes(g) || g.includes(n) && n.length >= g.length * 0.7 || similarity(n, g) >= 0.6);
  });
}

// ---- Sound effects (generated, no audio files) ----
let ctx;
let sfxOn = true;
export const setSfx = (on) => (sfxOn = on);

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

const SOUNDS = {
  correct: () => { tone(880, 0, 0.12); tone(1318, 0.09, 0.22); },
  wrong: () => { tone(220, 0, 0.18, 'square', 0.06); tone(180, 0.12, 0.25, 'square', 0.06); },
  tap: () => tone(660, 0, 0.05, 'triangle', 0.08),
  tick: () => tone(1200, 0, 0.04, 'square', 0.05),
  timeup: () => { tone(440, 0, 0.12, 'sawtooth', 0.06); tone(330, 0.12, 0.25, 'sawtooth', 0.06); },
  bonus: () => [784, 988, 1175].forEach((f, i) => tone(f, i * 0.07, 0.15, 'triangle', 0.12)),
  chest: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle', 0.12)),
  complete: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.14)),
  stroke: () => tone(990, 0, 0.08, 'sine', 0.1),
};

export function sfx(name) {
  if (!sfxOn) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[name]?.();
  } catch {
    /* audio not available */
  }
}

export function buzz(ms = 60) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* no vibration */
  }
}

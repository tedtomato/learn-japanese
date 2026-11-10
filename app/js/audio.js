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

// Vibration for right and wrong answers: a light tap, or a longer double pulse. Off in the Profile settings.
let hapticsOn = true;
export const setHaptics = (on) => (hapticsOn = on !== false);
export const HAPTIC = { right: 12, wrong: [40, 40, 70] };

export function buzz(ms = HAPTIC.wrong) {
  if (!hapticsOn) return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* no vibration */
  }
}

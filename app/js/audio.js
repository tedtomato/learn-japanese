// Japanese speech (the device's built-in voice) and small sound effects.

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
let jaVoice = null;
let voiceCount = 0;
let rate = 0.85;

function chooseVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  voiceCount = voices.length;
  const ja = voices.filter((v) => /^ja([-_]|$)/i.test(v.lang));
  const preferred = ['Google', 'Kyoko', 'O-ren', 'Otoya', 'Hattori', 'Nanami', 'Microsoft'];
  jaVoice = preferred.map((p) => ja.find((v) => v.name.includes(p))).find(Boolean) || ja[0] || null;
}

if (synth) {
  chooseVoice();
  synth.addEventListener?.('voiceschanged', chooseVoice);
}

export const setVoiceRate = (r) => (rate = r);

// 'yes' when a Japanese voice is installed, 'no' when the device lists voices but none are Japanese,
// 'unknown' when the device has not listed its voices (iOS sometimes) — we still try then.
export function voiceStatus() {
  if (!synth) return 'no';
  if (jaVoice) return 'yes';
  return voiceCount > 0 ? 'no' : 'unknown';
}

export const canSpeak = () => voiceStatus() !== 'no';

export function speak(text, { slow = false } = {}) {
  if (!synth || !text) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  if (jaVoice) u.voice = jaVoice;
  u.rate = slow ? 0.5 : rate;
  synth.speak(u);
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
  complete: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.14)),
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

// Designs the app's sound effects offline and writes them to app/sfx/<name>.mp3.
//   node scripts/sfx.mjs            render every sound, encode with ffmpeg (libmp3lame, 64 kbit/s mono)
//   node scripts/sfx.mjs --wav dir  also keep the lossless WAVs in dir
//   node scripts/sfx.mjs tap pop    only these sounds
// A small DSP kit in plain JS (44.1 kHz mono float buffers): oscillators, additive partials with a decay per
// partial (marimba, glass, bell), FM pairs, ADSR, pitch glides, filtered noise, delay and a Schroeder room.
// The palette is "toy wood & glass": rounded, warm, playful. Rendering is deterministic (seeded noise), so
// the same script always makes the same files; tests/sfx.test.mjs re-renders them to check peaks and lengths.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SR = 44100;
const TAU = Math.PI * 2;
export const PEAK = 10 ** (-1 / 20); // -1 dBFS

// ---- Kit ------------------------------------------------------------------------------------------------
let seed = 1;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const N = { C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83, C6: 84, D6: 86, E6: 88, F6: 89, G6: 91, A6: 93, B6: 95, C7: 96, D7: 98, E7: 100, G7: 103 };
const buf = (sec) => new Float32Array(Math.max(1, Math.ceil(sec * SR)));
const scale = (x, g) => { for (let i = 0; i < x.length; i++) x[i] *= g; return x; };
const peakOf = (x) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const norm = (x, p = 1) => scale(x, p / (peakOf(x) || 1));

// Sum buffers: parts are [buffer, startSeconds, gain].
function mix(parts) {
  const len = Math.max(...parts.map(([b, at]) => Math.round(at * SR) + b.length));
  const out = new Float32Array(len);
  for (const [b, at, g = 1] of parts) {
    const o = Math.round(at * SR);
    for (let i = 0; i < b.length; i++) out[o + i] += b[i] * g;
  }
  return out;
}
const extend = (x, sec) => { const y = buf(x.length / SR + sec); y.set(x); return y; };

// Additive voice: parts are [ratio, amplitude, decaySeconds]; each partial decays exponentially.
function partials(f, parts, dur, { attack = 0.002, glide = null } = {}) {
  const out = buf(dur);
  for (const [ratio, amp, decay] of parts) {
    if (f * ratio > 19000) continue;
    let phase = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const fr = glide ? f * (glide.to / glide.from) ** Math.min(1, t / glide.time) * (glide.from / f) : f;
      phase += (TAU * fr * ratio) / SR;
      out[i] += amp * Math.sin(phase) * Math.exp(-t / decay) * Math.min(1, t / attack);
    }
  }
  return out;
}

// Basic oscillators with a pitch glide and an amplitude function of time.
function osc(type, f0, dur, { f1 = f0, glideT = dur, amp = () => 1, vib = 0, vibHz = 6 } = {}) {
  const out = buf(dur);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const f = f0 * (f1 / f0) ** Math.min(1, t / glideT) * (1 + vib * Math.sin(TAU * vibHz * t));
    ph += f / SR;
    const p = ph % 1;
    const w = type === 'sine' ? Math.sin(TAU * p) : type === 'tri' ? 4 * Math.abs(p - 0.5) - 1 : type === 'saw' ? 2 * p - 1 : p < 0.5 ? 1 : -1;
    out[i] = w * amp(t);
  }
  return out;
}

// Frequency modulation pair: carrier fc, modulator fc*ratio, index falling with `decay`.
function fm(fc, ratio, index, dur, decay = 0.2, ampDecay = 0.3) {
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const idx = index * Math.exp(-t / decay);
    out[i] = Math.sin(TAU * fc * t + idx * Math.sin(TAU * fc * ratio * t)) * Math.exp(-t / ampDecay) * Math.min(1, t / 0.004);
  }
  return out;
}

const whiteNoise = (dur) => { const o = buf(dur); for (let i = 0; i < o.length; i++) o[i] = rnd() * 2 - 1; return o; };

// RBJ biquad; `freq` may be a function of time (seconds) for sweeps.
function biquad(x, type, freq, q = 0.707) {
  const fn = typeof freq === 'function' ? freq : () => freq;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  for (let i = 0; i < x.length; i++) {
    if (i % 8 === 0) {
      const w = (TAU * Math.min(fn(i / SR), SR * 0.45)) / SR;
      const c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al;
      if (type === 'lp') { b0 = (1 - c) / 2 / a0; b1 = (1 - c) / a0; b2 = b0; }
      else if (type === 'hp') { b0 = (1 + c) / 2 / a0; b1 = -(1 + c) / a0; b2 = b0; }
      else { b0 = al / a0; b1 = 0; b2 = -al / a0; }
      a1 = (-2 * c) / a0;
      a2 = (1 - al) / a0;
    }
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v;
    y[i] = v;
  }
  return y;
}

// Shape a buffer with an amplitude function of time (seconds).
const shape = (x, fn) => { for (let i = 0; i < x.length; i++) x[i] *= fn(i / SR); return x; };
const expo = (tau) => (t) => Math.exp(-t / tau);
// Bell-shaped swell: rises to its peak at `peak` seconds, then falls.
const swell = (dur, peak, curve = 2) => (t) => (t < peak ? (t / peak) ** curve : Math.max(0, 1 - (t - peak) / (dur - peak)) ** curve);
const adsr = (a, d, s, r, hold) => (t) => (t < a ? t / a : t < a + d ? 1 - (1 - s) * ((t - a) / d) : t < hold ? s : Math.max(0, s * (1 - (t - hold) / r)));

// Feedback delay with a darkening filter on the repeats.
function echo(x, time, fb = 0.4, wet = 0.4, tail = 0.6) {
  const d = Math.round(time * SR);
  const out = extend(x, tail);
  const rep = new Float32Array(out.length);
  let lp = 0;
  for (let i = d; i < out.length; i++) {
    lp += 0.6 * ((i - d < x.length ? x[i - d] : 0) + rep[i - d] * fb - lp);
    rep[i] = lp;
  }
  for (let i = 0; i < out.length; i++) out[i] += rep[i] * wet;
  return out;
}

// Schroeder room: four damped combs into two allpasses. Small and bright, for sparkle.
function room(x, wet = 0.25, size = 1, tail = 0.5) {
  const y = extend(x, tail);
  const combs = [1116, 1188, 1277, 1356].map((n) => Math.round(n * size));
  const acc = new Float32Array(y.length);
  for (const d of combs) {
    const line = new Float32Array(d);
    let idx = 0, damp = 0;
    for (let i = 0; i < y.length; i++) {
      const o = line[idx];
      damp += 0.35 * (o - damp);
      line[idx] = y[i] + damp * 0.8;
      idx = (idx + 1) % d;
      acc[i] += o;
    }
  }
  for (const d of [556, 441]) {
    const line = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < acc.length; i++) {
      const o = line[idx];
      const v = acc[i] + o * 0.5;
      line[idx] = v;
      acc[i] = o - v * 0.5;
      idx = (idx + 1) % d;
    }
  }
  for (let i = 0; i < y.length; i++) y[i] += acc[i] * wet * 0.25;
  return y;
}

const softclip = (x, drive = 1.5) => { const k = Math.tanh(drive); for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * drive) / k; return x; };

// 5 ms fades at both ends, a trim of silence at the tail, then normalise to -1 dBFS.
function finish(x) {
  let end = x.length;
  while (end > 1 && Math.abs(x[end - 1]) < 0.0005) end--;
  const y = x.slice(0, Math.min(x.length, end + Math.round(0.01 * SR)));
  const f = Math.round(0.005 * SR);
  for (let i = 0; i < f && i < y.length; i++) { y[i] *= i / f; y[y.length - 1 - i] *= i / f; }
  return norm(y, PEAK);
}

// ---- Instruments ------------------------------------------------------------------------------------------
// Mallet on a wooden bar: a fundamental, a tuned overtone and a quick click.
function marimba(f, dur = 0.3, g = 1) {
  const body = partials(f, [[1, 1, dur * 0.4], [3.93, 0.32, 0.045], [9.7, 0.07, 0.015]], dur);
  const click = shape(biquad(whiteNoise(0.012), 'lp', 4200), expo(0.003));
  return scale(mix([[body, 0, 1], [click, 0, 0.12]]), g);
}
// Struck glass / bell: inharmonic partials, the high ones dying first.
function glass(f, dur = 0.8, g = 1, bright = 1) {
  return scale(partials(f, [[1, 1, dur * 0.45], [2.76, 0.42 * bright, dur * 0.28], [5.4, 0.22 * bright, dur * 0.16], [8.93, 0.1 * bright, dur * 0.09]], dur, { attack: 0.001 }), g);
}
// Soft horn-like pad for chord stabs: triangle + a little octave, warm low-pass.
function horn(f, dur, g = 1, a = 0.012) {
  const raw = mix([[osc('tri', f, dur), 0, 1], [osc('sine', f * 2, dur), 0, 0.25], [osc('saw', f, dur), 0, 0.1]]);
  return scale(shape(biquad(raw, 'lp', 2600, 0.8), adsr(a, 0.12, 0.55, 0.25, dur - 0.25)), g);
}
// Metallic coin ping.
const coin = (f, dur = 0.18, g = 1) => scale(partials(f, [[1, 1, dur * 0.5], [1.5, 0.35, dur * 0.3], [2.4, 0.3, dur * 0.2], [4.1, 0.15, dur * 0.1]], dur, { attack: 0.0008 }), g);
const click = (f, dur = 0.01, q = 2) => shape(biquad(whiteNoise(dur * 4), 'bp', f, q), expo(dur / 3));

// A rising run of glass sparkles.
function sparkle(notes, step, dur = 0.35, g = 1) {
  return mix(notes.map((n, i) => [glass(hz(n), dur, 1 - i * 0.03), i * step, g]));
}
// A chord stab: horns plus marimba on top.
const stab = (notes, dur, g = 1) => mix(notes.flatMap((n) => [[horn(hz(n), dur, 0.7), 0, g], [marimba(hz(n + 12), 0.25, 0.5), 0, g]]));

// ---- The sounds ---------------------------------------------------------------------------------------------
export const SOUNDS = {
  // UI feedback
  tap: () => mix([[partials(980, [[1, 1, 0.012], [2.3, 0.5, 0.007]], 0.05), 0, 1], [click(2800, 0.004), 0, 0.5]]),
  tile: () => mix([[osc('sine', 320, 0.12, { f1: 560, glideT: 0.05, amp: expo(0.035) }), 0, 1], [click(1800, 0.004), 0, 0.25]]),
  'tile-off': () => mix([[osc('sine', 520, 0.1, { f1: 270, glideT: 0.05, amp: expo(0.03) }), 0, 0.8], [click(1400, 0.003), 0, 0.15]]),
  select: () => glass(1760, 0.12, 1, 0.8).map((v, i, a) => v * Math.exp(-(i / SR) / 0.04)),
  swoosh: () => {
    const n = shape(biquad(whiteNoise(0.26), 'bp', (t) => 500 * (3600 / 500) ** Math.sin((t / 0.26) * Math.PI * 0.6), 0.9), swell(0.26, 0.1));
    return norm(biquad(n, 'hp', 300));
  },
  pop: () => mix([[osc('sine', 380, 0.14, { f1: 720, glideT: 0.06, amp: expo(0.05) }), 0, 1], [osc('sine', 760, 0.1, { f1: 1200, glideT: 0.05, amp: expo(0.025) }), 0, 0.3], [click(2200, 0.004), 0, 0.2]]),

  // Right and wrong
  correct: () => room(mix([[marimba(hz(N.C6), 0.3), 0, 1], [marimba(hz(N.E6), 0.4), 0.09, 1.05], [glass(hz(N.E7), 0.5, 0.18), 0.1, 1]]), 0.3, 0.8, 0.3),
  'correct-combo3': () => room(mix([[marimba(hz(N.C6), 0.28), 0, 1], [marimba(hz(N.E6), 0.28), 0.085, 1], [marimba(hz(N.G6), 0.45), 0.17, 1.05], [glass(hz(N.G7), 0.6, 0.2), 0.18, 1]]), 0.35, 0.8, 0.4),
  'correct-combo5': () => room(mix([[marimba(hz(N.C6), 0.25), 0, 1], [marimba(hz(N.E6), 0.25), 0.075, 1], [marimba(hz(N.G6), 0.25), 0.15, 1], [marimba(hz(N.C7), 0.5), 0.225, 1.05], [glass(hz(N.G7), 0.8, 0.22), 0.23, 1], [glass(hz(N.E7), 0.8, 0.14), 0.3, 1]]), 0.4, 0.9, 0.5),
  'correct-combo10': () => echo(room(mix([[marimba(hz(N.C6), 0.22), 0, 1], [marimba(hz(N.E6), 0.22), 0.065, 1], [marimba(hz(N.G6), 0.22), 0.13, 1], [marimba(hz(N.C7), 0.22), 0.195, 1], [marimba(hz(N.E7), 0.55), 0.26, 1.05], [glass(hz(N.C7), 1, 0.2), 0.26, 1], [glass(hz(N.G7), 1, 0.2), 0.3, 1], [sparkle([96, 100, 103, 108], 0.05, 0.4, 0.15), 0.38, 1]]), 0.45, 1, 0.6), 0.14, 0.45, 0.35, 0.3),
  wrong: () => {
    const note = (f, dur) => shape(biquad(mix([[osc('sine', f, dur), 0, 1], [osc('tri', f, dur), 0, 0.35]]), 'lp', 1100), adsr(0.012, 0.05, 0.6, 0.12, dur - 0.1));
    return mix([[note(hz(59), 0.17), 0, 0.9], [note(hz(56), 0.34), 0.15, 1]]); // B3 -> G#3, a minor third down
  },
  almost: () => shape(biquad(mix([[osc('tri', hz(64), 0.42, { vib: 0.012, vibHz: 7 }), 0, 1], [osc('sine', hz(64) * 2, 0.42, { vib: 0.012, vibHz: 7 }), 0, 0.3]]), 'lp', 1800), adsr(0.015, 0.1, 0.6, 0.2, 0.22)),
  match: () => mix([[glass(1175, 0.2, 1, 0.6).map((v, i) => v * Math.exp(-(i / SR) / 0.05)), 0, 1], [glass(1568, 0.28, 1, 0.6).map((v, i) => v * Math.exp(-(i / SR) / 0.07)), 0.075, 1], [click(3200, 0.004), 0, 0.2], [click(3600, 0.004), 0.075, 0.2]]),
  heart: () => {
    const crack = mix([[shape(biquad(whiteNoise(0.1), 'hp', 2500), expo(0.012)), 0, 1], [click(5000, 0.004), 0.03, 0.8], [click(4000, 0.004), 0.055, 0.6], [click(6000, 0.003), 0.09, 0.5]]);
    return mix([[crack, 0, 0.9], [osc('sine', 760, 0.5, { f1: 170, glideT: 0.4, amp: (t) => Math.exp(-t / 0.18) }), 0.01, 0.8], [glass(hz(N.E6), 0.3, 0.3), 0, 1]]);
  },
  tick: () => mix([[partials(1750, [[1, 1, 0.008], [2.6, 0.4, 0.005]], 0.04), 0, 1], [click(3600, 0.003), 0, 0.5]]),
  timeup: () => mix([[osc('sine', 130, 0.4, { f1: 52, glideT: 0.25, amp: expo(0.12) }), 0, 1], [shape(biquad(whiteNoise(0.1), 'lp', 260), expo(0.025)), 0, 0.5]]),

  // Finishing a lesson
  complete: () => completeSound(false),
  perfect: () => completeSound(true),
  xp: () => mix([[partials(1320, [[1, 1, 0.022], [3.9, 0.3, 0.01]], 0.08), 0, 1], [click(3000, 0.003), 0, 0.3]]),
  'xp-end': () => room(mix([[glass(hz(N.G6), 0.7, 1), 0, 1], [glass(hz(N.D7), 0.5, 0.35), 0.02, 1]]), 0.25, 0.7, 0.3),

  // Rewards
  streak: () => {
    const whoosh = shape(biquad(whiteNoise(0.45), 'bp', (t) => 300 * (2800 / 300) ** (t / 0.45), 0.8), swell(0.45, 0.28, 1.5));
    const crackle = buf(0.6);
    for (let i = 0; i < 38; i++) { const at = 0.1 + rnd() * 0.5; crackle.set(shape(biquad(whiteNoise(0.01), 'hp', 2500 + rnd() * 3000), expo(0.002)).map((v) => v * (0.3 + rnd() * 0.7)), Math.round(at * SR)); }
    const warm = shape(biquad(mix([[osc('tri', hz(48), 1), 0, 1], [osc('tri', hz(55), 1), 0, 0.8], [osc('tri', hz(60), 1), 0, 0.7], [osc('sine', hz(64), 1), 0, 0.4]]), 'lp', 1500), swell(1, 0.45, 1.8));
    return room(mix([[norm(whoosh, 0.7), 0, 1], [norm(crackle, 0.5), 0.1, 1], [warm, 0.1, 0.9], [glass(hz(N.E6), 0.6, 0.35), 0.42, 1]]), 0.2, 0.8, 0.3);
  },
  milestone: () => room(mix([[stab([N.C5, N.E5, N.G5], 0.3), 0, 0.8], [stab([N.F5, N.A5, N.C6], 0.3), 0.2, 0.85], [stab([N.G5, N.B5, N.D6], 0.9), 0.4, 1], [glass(hz(N.G6), 1.2, 0.5), 0.4, 1], [glass(hz(N.D7), 1, 0.25), 0.45, 1], [sparkle([84, 88, 91, 95, 98, 100, 103], 0.06, 0.5, 0.18), 0.65, 1]]), 0.3, 1, 0.5),
  goal: () => {
    const fill = shape(osc('sine', 300, 0.5, { f1: 1300, glideT: 0.5, vib: 0.03, vibHz: 14 }), swell(0.5, 0.45, 1));
    const burst = mix([[shape(biquad(whiteNoise(0.2), 'hp', 1800), expo(0.05)), 0, 0.6], [glass(hz(N.C6), 0.9, 1), 0, 1], [glass(hz(N.G6), 0.9, 0.6), 0.01, 1], [glass(hz(N.E7), 0.7, 0.3), 0.02, 1]]);
    return room(mix([[fill, 0, 0.6], [burst, 0.5, 1], [sparkle([88, 91, 96, 100, 103], 0.05, 0.4, 0.18), 0.6, 1]]), 0.3, 0.9, 0.4);
  },
  chest: () => {
    const creak = shape(biquad(whiteNoise(0.3), 'bp', (t) => 180 + 240 * (t / 0.3) + 25 * Math.sin(t * 90), 7), (t) => (0.5 + 0.5 * Math.sin(t * 60)) * swell(0.3, 0.2, 1));
    const parts = [[norm(creak, 0.5), 0, 1], [osc('sine', 260, 0.1, { f1: 420, glideT: 0.04, amp: expo(0.03) }), 0.29, 0.7]];
    for (let i = 0; i < 12; i++) parts.push([coin(1800 + rnd() * 1700, 0.14, 1), 0.33 + i * 0.045 + rnd() * 0.02, 0.35 + rnd() * 0.3]);
    return room(mix(parts), 0.18, 0.7, 0.2);
  },
  gem: () => mix([[coin(1976, 0.16, 1), 0, 0.8], [coin(2637, 0.3, 1), 0.06, 1]]),
  gift: () => room(sparkle([84, 88, 91, 96, 100, 103, 108, 112], 0.065, 0.4, 0.7), 0.35, 0.8, 0.5),
  unlock: () => room(mix([[click(2200, 0.006, 3), 0, 0.9], [osc('sine', 210, 0.06, { amp: expo(0.015) }), 0, 0.7], [click(3400, 0.005, 4), 0.07, 0.8], [glass(hz(N.E6), 0.5, 0.8), 0.15, 1], [glass(hz(N.B6), 0.6, 0.7), 0.25, 1], [glass(hz(98), 0.4, 0.2), 0.27, 1]]), 0.25, 0.7, 0.3),
  unit: () => room(mix([[stab([N.G4, N.C5, N.E5], 0.22), 0, 0.8], [stab([N.G4, N.C5, N.E5], 0.22), 0.24, 0.85], [stab([N.G4, N.C5, N.E5], 0.22), 0.48, 0.9], [stab([N.C5, N.E5, N.G5, N.C6], 1.1), 0.72, 1.1], [glass(hz(N.C6), 1.3, 0.5), 0.72, 1], [glass(hz(N.G6), 1.2, 0.35), 0.75, 1], [sparkle([96, 100, 103, 108], 0.07, 0.6, 0.2), 1.05, 1]]), 0.3, 1, 0.4),
  achievement: () => {
    const shine = shape(biquad(whiteNoise(0.4), 'bp', (t) => 1800 + 6000 * (t / 0.4), 2.5), swell(0.4, 0.3, 1.2));
    return room(mix([[norm(shine, 0.4), 0, 1], [sparkle([96, 100, 103, 108], 0.05, 0.3, 0.3), 0.05, 1], [glass(hz(N.C7), 1.1, 0.8), 0.3, 1], [glass(hz(N.G6), 1, 0.5), 0.3, 1]]), 0.28, 0.9, 0.5);
  },
  levelup: () => room(mix([...[N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].map((n, i) => [marimba(hz(n), 0.3, 1), i * 0.07, 1]), [glass(hz(N.C7), 0.9, 0.6), 0.42, 1], [glass(hz(N.G6), 0.9, 0.35), 0.42, 1]]), 0.3, 0.9, 0.4),
  quest: () => room(mix([[glass(hz(N.G6), 0.35, 0.8), 0, 1], [glass(hz(N.C7), 0.6, 1), 0.1, 1], [marimba(hz(N.C6), 0.2, 0.5), 0.1, 1]]), 0.25, 0.7, 0.3),
  flame: () => {
    const n = shape(biquad(whiteNoise(0.6), 'lp', (t) => 150 + 900 * Math.sin((t / 0.6) * Math.PI * 0.8), 0.9), swell(0.6, 0.25, 1.6));
    return mix([[norm(n, 0.8), 0, 1], [shape(osc('sine', 90, 0.6, { f1: 140, glideT: 0.4 }), swell(0.6, 0.2, 1.5)), 0, 0.5], [norm(shape(biquad(whiteNoise(0.5), 'hp', 3000), (t) => (0.5 + 0.5 * Math.sin(t * 160)) * swell(0.5, 0.15, 1.5)), 0.15), 0.05, 1]]);
  },
};

function completeSound(perfect) {
  const parts = [[stab([N.C5, N.E5, N.G5], 0.28), 0, 0.85], [stab([N.E5, N.G5, N.C6], 0.28), 0.17, 0.9], [stab([N.G5, N.C6, N.E6], perfect ? 0.95 : 0.8), 0.34, 1], [glass(hz(N.C7), 1.1, 0.45), 0.36, 1]];
  const run = perfect ? [84, 88, 91, 96, 100, 103, 108, 112, 115] : [84, 88, 91, 96, 100, 103];
  parts.push([sparkle(run, perfect ? 0.065 : 0.075, 0.5, 0.2), 0.62, 1]);
  if (perfect) parts.push([glass(hz(N.G7), 1.0, 0.4), 1.15, 1], [glass(hz(N.C7 + 7), 0.8, 0.25), 1.2, 1]);
  return room(mix(parts), 0.32, 1, 0.5);
}

export const SFX_NAMES = Object.keys(SOUNDS);
const MAX_SECONDS = { correct: 0.7, 'correct-combo3': 0.85, 'correct-combo5': 1, streak: 1, chest: 0.95, complete: 1.7, perfect: 2, milestone: 1.9, unit: 2 };
export const maxSeconds = (name) => MAX_SECONDS[name] || 1.2;

// Deterministic render of one sound: float samples in [-1, 1], peak at -1 dBFS.
export function render(name) {
  let h = 7;
  for (const c of name) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  seed = h;
  const out = SOUNDS[name]();
  const y = finish(softclip(norm(out, 1), 1.3));
  const cap = Math.round(maxSeconds(name) * SR);
  if (y.length <= cap) return y;
  const cut = y.slice(0, cap); // a long reverb tail is cut with a smooth 80 ms fade
  const f = Math.round(0.08 * SR);
  for (let i = 0; i < f; i++) cut[cap - 1 - i] *= Math.sin((i / f) * Math.PI / 2);
  return cut;
}

export function wav(x) {
  const pcm = Buffer.alloc(44 + x.length * 2);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + x.length * 2, 4); pcm.write('WAVEfmt ', 8);
  pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(SR, 24);
  pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  return pcm;
}

// ---- CLI --------------------------------------------------------------------------------------------------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const wavDir = args.includes('--wav') ? args[args.indexOf('--wav') + 1] : null;
  const names = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--wav');
  const todo = names.length ? names : SFX_NAMES;
  const outDir = fileURLToPath(new URL('../app/sfx/', import.meta.url));
  mkdirSync(outDir, { recursive: true });
  if (wavDir) mkdirSync(wavDir, { recursive: true });
  const scratch = mkdtempSync(join(tmpdir(), 'sfx-'));
  let total = 0;
  for (const name of todo) {
    const x = render(name);
    const wavPath = join(scratch, `${name}.wav`);
    writeFileSync(wavPath, wav(x));
    if (wavDir) writeFileSync(join(wavDir, `${name}.wav`), wav(x));
    const mp3 = join(outDir, `${name}.mp3`);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wavPath, '-codec:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', '-fflags', '+bitexact', '-flags:a', '+bitexact', mp3]);
    const size = readFileSync(mp3).length;
    total += size;
    console.log(`${name.padEnd(16)} ${(x.length / SR).toFixed(2)} s  ${(size / 1024).toFixed(1)} KB`);
  }
  rmSync(scratch, { recursive: true, force: true });
  console.log(`${todo.length} sounds, ${(total / 1024).toFixed(0)} KB`);
}

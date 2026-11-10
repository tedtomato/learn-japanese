// Celebration variety: which effect a finished lesson or a combo gets, and its markup. Pure (no DOM), so it is
// tested; the styles live in app.css and are switched off for people who asked for less motion.

// Falling cherry blossom petals belong to the Japanese course only.
export const celebrations = (code) => (code === 'ja' ? ['petals', 'confetti', 'fireworks', 'dance'] : ['confetti', 'fireworks', 'dance']);

// A random effect, never the same one twice in a row (pass the previous one).
export function pickCelebration(code, prev = null, random = Math.random) {
  const list = celebrations(code).filter((k) => k !== prev);
  return list[Math.floor(random() * list.length) % list.length];
}

const PALETTE = ['#ff4b4b', '#ffc800', '#58cc02', '#1cb0f6', '#ce82ff', '#ff9600'];

// The decorative layer for an effect (aria-hidden by the caller's wrapper).
export function celebrationHtml(kind) {
  if (kind === 'petals') return `<div class="petals" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--i:${i};--x:${(i * 37) % 100}"></i>`).join('')}</div>`;
  if (kind === 'confetti') {
    return `<div class="cele cele-confetti" aria-hidden="true">${Array.from({ length: 36 }, (_, i) => `<i style="--i:${i};--x:${(i * 29) % 100};--c:${PALETTE[i % PALETTE.length]};--r:${(i * 47) % 360}deg"></i>`).join('')}</div>`;
  }
  if (kind === 'fireworks') {
    const spots = [[22, 24], [74, 18], [48, 36], [14, 52], [84, 46]];
    return `<div class="cele cele-fireworks" aria-hidden="true">${spots.map(([x, y], b) => `<div class="fw" style="left:${x}%;top:${y}%;--d:${b * 0.45}s;--c:${PALETTE[(b * 2) % PALETTE.length]}">${Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join('')}</div>`).join('')}</div>`;
  }
  if (kind === 'dance') return `<div class="cele cele-notes" aria-hidden="true">${['♪', '♫', '♪', '♫', '♪', '♫'].map((n, i) => `<i style="--i:${i};--x:${12 + i * 15}">${n}</i>`).join('')}</div>`;
  return '';
}

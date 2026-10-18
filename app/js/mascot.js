// Kuri, the shiba inu mascot. Moods: happy, cheer, sad.
import { raw } from './dom.js';

const EYES = {
  happy: '<ellipse cx="45" cy="62" rx="5" ry="6.5" fill="#2b2b2b"/><ellipse cx="75" cy="62" rx="5" ry="6.5" fill="#2b2b2b"/><circle cx="46.8" cy="59.5" r="1.8" fill="#fff"/><circle cx="76.8" cy="59.5" r="1.8" fill="#fff"/>',
  cheer: '<path d="M39 63q6-8 12 0M69 63q6-8 12 0" stroke="#2b2b2b" stroke-width="4" fill="none" stroke-linecap="round"/>',
  sad: '<ellipse cx="45" cy="64" rx="4.5" ry="5.5" fill="#2b2b2b"/><ellipse cx="75" cy="64" rx="4.5" ry="5.5" fill="#2b2b2b"/><path d="M38 54l12 3M82 54l-12 3" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/>',
};

const MOUTH = {
  happy: '<path d="M52 82q8 7 16 0" stroke="#2b2b2b" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
  cheer: '<path d="M50 80q10 16 20 0z" fill="#e2445c"/><path d="M50 80q10 16 20 0" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linejoin="round"/>',
  sad: '<path d="M52 86q8-6 16 0" stroke="#2b2b2b" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
};

export function mascotSvg(mood = 'happy', size = 96) {
  return `<svg class="mascot" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Kuri the shiba">
  <path d="M22 50 28 12l30 24z" fill="#e48b3a"/><path d="M98 50 92 12 62 36z" fill="#e48b3a"/>
  <path d="M29 42 32 22l15 13z" fill="#f6c7a1"/><path d="M91 42 88 22 73 35z" fill="#f6c7a1"/>
  <ellipse cx="60" cy="66" rx="44" ry="40" fill="#f0a04b"/>
  <path d="M60 106c-22 0-38-12-38-28 0-6 6-10 12-8 8 3 14 4 26 4s18-1 26-4c6-2 12 2 12 8 0 16-16 28-38 28z" fill="#fff6ea"/>
  <ellipse cx="40" cy="52" rx="7" ry="4" fill="#fff6ea"/><ellipse cx="80" cy="52" rx="7" ry="4" fill="#fff6ea"/>
  ${EYES[mood] || EYES.happy}
  <ellipse cx="60" cy="74" rx="7" ry="5" fill="#2b2b2b"/>
  ${MOUTH[mood] || MOUTH.happy}
  <ellipse cx="33" cy="76" rx="6" ry="4" fill="#ff9aa2" opacity=".7"/><ellipse cx="87" cy="76" rx="6" ry="4" fill="#ff9aa2" opacity=".7"/>
</svg>`;
}

export const mascot = (mood, size) => raw(mascotSvg(mood, size));

// Kuri, the shiba inu mascot (a panda in the Chinese course, same moods and poses). Moods: happy, cheer, sad, dance. Always animated (bob, blink, ear twitch).
// Purely decorative, so hidden from screen readers (the text beside it says everything).
import { raw } from './dom.js';
import { L } from './lang.js';

const EYES = {
  happy: '<ellipse cx="45" cy="62" rx="5" ry="6.5" fill="#2b2b2b"/><ellipse cx="75" cy="62" rx="5" ry="6.5" fill="#2b2b2b"/><circle cx="46.8" cy="59.5" r="1.8" fill="#fff"/><circle cx="76.8" cy="59.5" r="1.8" fill="#fff"/>',
  cheer: '<path d="M39 63q6-8 12 0M69 63q6-8 12 0" stroke="#2b2b2b" stroke-width="4" fill="none" stroke-linecap="round"/>',
  sad: '<ellipse cx="45" cy="64" rx="4.5" ry="5.5" fill="#2b2b2b"/><ellipse cx="75" cy="64" rx="4.5" ry="5.5" fill="#2b2b2b"/><path d="M38 57l12-3M82 57l-12-3" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/>',
};

const MOUTH = {
  happy: '<path d="M52 82q8 7 16 0" stroke="#2b2b2b" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
  cheer: '<path d="M50 80q10 16 20 0z" fill="#e2445c"/><path d="M50 80q10 16 20 0" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linejoin="round"/>',
  sad: '<path d="M52 86q8-6 16 0" stroke="#2b2b2b" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
};

// The panda's eyes sit on its dark patches, so they are white where the dog's are dark.
const PANDA_EYES = {
  happy: '<ellipse cx="45" cy="62" rx="4.6" ry="5.8" fill="#fff"/><ellipse cx="75" cy="62" rx="4.6" ry="5.8" fill="#fff"/><circle cx="45.6" cy="62.6" r="2.6" fill="#2b2b2b"/><circle cx="75.6" cy="62.6" r="2.6" fill="#2b2b2b"/><circle cx="46.4" cy="61" r="1.1" fill="#fff"/><circle cx="76.4" cy="61" r="1.1" fill="#fff"/>',
  cheer: '<path d="M39 64q6-8 12 0M69 64q6-8 12 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>',
  sad: '<ellipse cx="45" cy="64" rx="4.2" ry="5.2" fill="#fff"/><ellipse cx="75" cy="64" rx="4.2" ry="5.2" fill="#fff"/><circle cx="45" cy="65.4" r="2.4" fill="#2b2b2b"/><circle cx="75" cy="65.4" r="2.4" fill="#2b2b2b"/><path d="M36 54l13 2M84 54l-13 2" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/>',
};
PANDA_EYES.dance = PANDA_EYES.cheer;
const PANDA_MOUTH = { ...MOUTH, dance: MOUTH.cheer };

function pandaSvg(mood, size) {
  return `<svg class="mascot panda mood-${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <g class="ear ear-l"><circle cx="28" cy="26" r="15" fill="#2b2b2b"/><circle cx="29" cy="28" r="7" fill="#5a5a5a"/></g>
  <g class="ear ear-r"><circle cx="92" cy="26" r="15" fill="#2b2b2b"/><circle cx="91" cy="28" r="7" fill="#5a5a5a"/></g>
  <ellipse cx="60" cy="68" rx="46" ry="40" fill="#fbfbf8" stroke="#c9c9c0" stroke-width="2"/>
  <path d="M26 56c-2-10 6-16 13-12 7 5 11 12 9 20-2 8-9 11-15 8-5-3-6-9-7-16z" fill="#2b2b2b"/><path d="M94 56c2-10-6-16-13-12-7 5-11 12-9 20 2 8 9 11 15 8 5-3 6-9 7-16z" fill="#2b2b2b"/>
  <g class="dog-eyes">${PANDA_EYES[mood] || PANDA_EYES.happy}</g>
  <ellipse cx="60" cy="74" rx="7" ry="5" fill="#2b2b2b"/>
  ${PANDA_MOUTH[mood] || PANDA_MOUTH.happy}
  <ellipse cx="32" cy="80" rx="6" ry="4" fill="#ff9aa2" opacity=".6"/><ellipse cx="88" cy="80" rx="6" ry="4" fill="#ff9aa2" opacity=".6"/>
</svg>`;
}

export function mascotSvg(mood = 'happy', size = 96, panda = L.code === 'zh') {
  if (panda) return pandaSvg(mood, size);
  return `<svg class="mascot mood-${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <g class="ear ear-l"><path d="M22 50 28 12l30 24z" fill="#e48b3a"/><path d="M29 42 32 22l15 13z" fill="#f6c7a1"/></g>
  <g class="ear ear-r"><path d="M98 50 92 12 62 36z" fill="#e48b3a"/><path d="M91 42 88 22 73 35z" fill="#f6c7a1"/></g>
  <ellipse cx="60" cy="66" rx="44" ry="40" fill="#f0a04b"/>
  <path d="M60 106c-22 0-38-12-38-28 0-6 6-10 12-8 8 3 14 4 26 4s18-1 26-4c6-2 12 2 12 8 0 16-16 28-38 28z" fill="#fff6ea"/>
  <ellipse cx="40" cy="52" rx="7" ry="4" fill="#fff6ea"/><ellipse cx="80" cy="52" rx="7" ry="4" fill="#fff6ea"/>
  <g class="dog-eyes">${EYES[mood] || EYES.happy}</g>
  <ellipse cx="60" cy="74" rx="7" ry="5" fill="#2b2b2b"/>
  ${MOUTH[mood] || MOUTH.happy}
  <ellipse cx="33" cy="76" rx="6" ry="4" fill="#ff9aa2" opacity=".7"/><ellipse cx="87" cy="76" rx="6" ry="4" fill="#ff9aa2" opacity=".7"/>
</svg>`;
}

export const mascot = (mood, size) => raw(mascotSvg(mood, size));

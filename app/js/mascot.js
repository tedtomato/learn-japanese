// Kuri, the shiba inu mascot (a panda in the Chinese course, same moods and poses). Moods: see MOODS (happy, cheer, sad, dance + the reward poses jump, trophy, cool, party, sleepy, think). Always animated (bob, blink, ear twitch).
// Purely decorative, so hidden from screen readers (the text beside it says everything).
import { raw } from './dom.js';
import { L } from './lang.js';

const EYES = {
  happy: '<ellipse cx="45" cy="62" rx="5" ry="6.5" fill="#2b2b2b"/><ellipse cx="75" cy="62" rx="5" ry="6.5" fill="#2b2b2b"/><circle cx="46.8" cy="59.5" r="1.8" fill="#fff"/><circle cx="76.8" cy="59.5" r="1.8" fill="#fff"/>',
  cheer: '<path d="M39 63q6-8 12 0M69 63q6-8 12 0" stroke="#2b2b2b" stroke-width="4" fill="none" stroke-linecap="round"/>',
  sad: '<ellipse cx="45" cy="64" rx="4.5" ry="5.5" fill="#2b2b2b"/><ellipse cx="75" cy="64" rx="4.5" ry="5.5" fill="#2b2b2b"/><path d="M38 57l12-3M82 57l-12-3" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/>',
};

const CLOSED = (c) => `<path d="M39 63q6 6 12 0M69 63q6 6 12 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
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

// Reward poses reuse the faces above and add props on top (arms, a cup, shades, a party hat, Zzz, a paw on the chin).
const FLAT_MOUTH = '<path d="M54 85h12" stroke="#2b2b2b" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
const SMALL_MOUTH = '<path d="M55 83q5 4 10 0" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/>';
const FACE = {
  // mood: [dog eyes, panda eyes, mouth]
  jump: [EYES.cheer, PANDA_EYES.cheer, MOUTH.cheer],
  trophy: [EYES.happy, PANDA_EYES.happy, MOUTH.happy],
  cool: [EYES.happy, PANDA_EYES.happy, MOUTH.happy],
  party: [EYES.cheer, PANDA_EYES.cheer, MOUTH.cheer],
  sleepy: [CLOSED('#2b2b2b'), CLOSED('#fff'), SMALL_MOUTH],
  think: [EYES.happy, PANDA_EYES.happy, FLAT_MOUTH],
};
export const MOODS = ['happy', 'cheer', 'sad', 'dance', 'jump', 'trophy', 'cool', 'party', 'sleepy', 'think'];

// Props drawn over the face, per pose. `fur` is the arm colour (the panda's arms are dark).
function props(mood, panda) {
  const fur = panda ? '#2b2b2b' : '#e48b3a';
  const arm = (d) => `<path d="${d}" stroke="${fur}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  switch (mood) {
    case 'jump': return `<ellipse class="shadow" cx="60" cy="118" rx="30" ry="3.5" fill="#000" opacity=".14"/>${arm('M20 80Q2 64 8 38')}${arm('M100 80Q118 64 112 38')}<circle cx="8" cy="36" r="7" fill="${fur}"/><circle cx="112" cy="36" r="7" fill="${fur}"/>`;
    case 'trophy': return `<g class="cup"><path d="M44 98h-6a6 6 0 0 0 6 10M76 98h6a6 6 0 0 1-6 10" stroke="#e5a500" stroke-width="3" fill="none"/><path d="M44 94h32v10a16 16 0 0 1-32 0z" fill="#ffc800" stroke="#e5a500" stroke-width="2"/><path d="M50 99q3-3 3 4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></g><circle cx="42" cy="104" r="6.5" fill="${fur}"/><circle cx="78" cy="104" r="6.5" fill="${fur}"/>`;
    case 'cool': return '<g class="shades"><rect x="32" y="53" width="26" height="16" rx="6" fill="#16202a"/><rect x="62" y="53" width="26" height="16" rx="6" fill="#16202a"/><path d="M58 59h4M32 58l-7-3M88 58l7-3" stroke="#16202a" stroke-width="3" stroke-linecap="round"/><path d="M37 57l6 0M67 57l6 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></g>';
    case 'party': return '<g class="hat"><path d="M42 30 60 -8 78 30z" fill="#ce82ff" stroke="#a559e3" stroke-width="2" stroke-linejoin="round"/><path d="M47 22l26 0M51 12l18 0" stroke="#fff" stroke-width="3" opacity=".7"/><circle cx="60" cy="-9" r="5" fill="#ffc800"/></g><circle cx="8" cy="22" r="3" fill="#ff4b4b"/><circle cx="112" cy="14" r="3" fill="#1cb0f6"/><circle cx="104" cy="52" r="2.5" fill="#ffc800"/><circle cx="14" cy="58" r="2.5" fill="#58cc02"/><rect x="2" y="40" width="6" height="3" rx="1.5" fill="#ff9600" transform="rotate(30 5 41)"/><rect x="108" y="34" width="6" height="3" rx="1.5" fill="#ce82ff" transform="rotate(-25 111 35)"/>';
    case 'sleepy': return '<g class="zzz" font-family="sans-serif" font-weight="800" fill="#1cb0f6"><text x="88" y="24" font-size="18">Z</text><text x="100" y="10" font-size="13">z</text><text x="108" y="-1" font-size="9">z</text></g>';
    case 'think': return `<circle cx="70" cy="95" r="9" fill="${fur}" stroke="${panda ? '#555' : '#c9701f'}" stroke-width="1.5"/><path d="M36 50q9-6 17-1" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round" opacity="${panda ? 0 : 1}"/><g fill="#9aa5ab"><circle cx="100" cy="30" r="3"/><circle cx="108" cy="18" r="4.5"/></g>`;
    default: return '';
  }
}

function pandaSvg(mood, size) {
  return `<svg class="mascot panda mood-${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <g class="ear ear-l"><circle cx="28" cy="26" r="15" fill="#2b2b2b"/><circle cx="29" cy="28" r="7" fill="#5a5a5a"/></g>
  <g class="ear ear-r"><circle cx="92" cy="26" r="15" fill="#2b2b2b"/><circle cx="91" cy="28" r="7" fill="#5a5a5a"/></g>
  <ellipse cx="60" cy="68" rx="46" ry="40" fill="#fbfbf8" stroke="#c9c9c0" stroke-width="2"/>
  <path d="M26 56c-2-10 6-16 13-12 7 5 11 12 9 20-2 8-9 11-15 8-5-3-6-9-7-16z" fill="#2b2b2b"/><path d="M94 56c2-10-6-16-13-12-7 5-11 12-9 20 2 8 9 11 15 8 5-3 6-9 7-16z" fill="#2b2b2b"/>
  <g class="dog-eyes">${FACE[mood]?.[1] || PANDA_EYES[mood] || PANDA_EYES.happy}</g>
  <ellipse cx="60" cy="74" rx="7" ry="5" fill="#2b2b2b"/>
  ${FACE[mood]?.[2] || PANDA_MOUTH[mood] || PANDA_MOUTH.happy}
  <ellipse cx="32" cy="80" rx="6" ry="4" fill="#ff9aa2" opacity=".6"/><ellipse cx="88" cy="80" rx="6" ry="4" fill="#ff9aa2" opacity=".6"/>
  ${props(mood, true)}
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
  <g class="dog-eyes">${FACE[mood]?.[0] || EYES[mood] || EYES.happy}</g>
  <ellipse cx="60" cy="74" rx="7" ry="5" fill="#2b2b2b"/>
  ${FACE[mood]?.[2] || MOUTH[mood] || MOUTH.happy}
  <ellipse cx="33" cy="76" rx="6" ry="4" fill="#ff9aa2" opacity=".7"/><ellipse cx="87" cy="76" rx="6" ry="4" fill="#ff9aa2" opacity=".7"/>
  ${props(mood, false)}
</svg>`;
}

export const mascot = (mood, size) => raw(mascotSvg(mood, size));

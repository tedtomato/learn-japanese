// The lesson cast: Ken (man), Yuki (woman), Sora (boy) and Hana (girl). Flat cartoon SVGs that
// blink while idle and move their mouth while their voice is speaking (.talking on the wrapper).
import { raw } from './dom.js';

const PEOPLE = {
  man: { name: 'Ken', skin: '#f2c19b', hair: '#2b2b33', top: '#1cb0f6', topDark: '#1899d6', legs: '#3c4a8a', kid: false,
    hairFront: '<path d="M33 46c0-18 12-28 27-28s27 10 27 27c-6-6-14-9-24-9-11 0-20 3-30 10z"/>',
    extra: '<rect x="40" y="48" width="16" height="11" rx="5" fill="none" stroke="#2b2b33" stroke-width="2.5"/><rect x="64" y="48" width="16" height="11" rx="5" fill="none" stroke="#2b2b33" stroke-width="2.5"/><path d="M56 53h8" stroke="#2b2b33" stroke-width="2.5"/>' },
  woman: { name: 'Yuki', skin: '#f6d0b1', hair: '#5a3825', top: '#ff4b9a', topDark: '#d93a80', legs: '#4b4b4b', kid: false,
    hairBack: '<path d="M30 52c-2-22 12-36 30-36s32 14 30 36l2 26c-6 4-14 5-20 3V56H48v25c-6 2-14 1-20-3z"/>',
    hairFront: '<path d="M34 48c2-16 12-25 26-25 15 0 25 9 26 24-10-2-18-8-23-15-5 9-15 15-29 16z"/>' },
  boy: { name: 'Sora', skin: '#e9b48a', hair: '#1f1f26', top: '#ffc800', topDark: '#e5a500', legs: '#2f6fd6', kid: true,
    hairFront: '<path d="M34 44l4-14 8 6 6-12 8 9 8-10 6 12 8-5 2 15c-9-5-20-7-30-6-8 1-15 3-20 5z"/>' },
  girl: { name: 'Hana', skin: '#f7d6bd', hair: '#2a1f1a', top: '#ce82ff', topDark: '#a559e3', legs: '#ce82ff', kid: true,
    hairBack: '<circle cx="28" cy="50" r="10"/><circle cx="92" cy="50" r="10"/>',
    hairFront: '<path d="M34 50c0-18 11-29 26-29s26 11 26 29c-8-1-16-6-21-13-4 8-13 12-31 13z"/>',
    extra: '<circle cx="31" cy="42" r="4" fill="#ff4b4b"/><circle cx="89" cy="42" r="4" fill="#ff4b4b"/>' },
};

export const CAST_NAMES = Object.keys(PEOPLE);
export const nameOf = (who) => PEOPLE[who]?.name || '';

export function personSvg(who, size = 110) {
  const p = PEOPLE[who] || PEOPLE.woman;
  const body = p.kid
    ? `<rect x="42" y="98" width="36" height="34" rx="12" fill="${p.top}"/><rect x="45" y="128" width="11" height="22" rx="5" fill="${p.legs}"/><rect x="64" y="128" width="11" height="22" rx="5" fill="${p.legs}"/>
       <rect x="30" y="100" width="12" height="28" rx="6" fill="${p.top}" transform="rotate(12 36 100)"/><rect x="78" y="100" width="12" height="28" rx="6" fill="${p.top}" transform="rotate(-12 84 100)"/>`
    : `<rect x="38" y="90" width="44" height="46" rx="14" fill="${p.top}"/><path d="M52 90h16l-8 10z" fill="${p.topDark}"/><rect x="43" y="132" width="13" height="24" rx="6" fill="${p.legs}"/><rect x="64" y="132" width="13" height="24" rx="6" fill="${p.legs}"/>
       <rect x="25" y="93" width="13" height="36" rx="6.5" fill="${p.top}" transform="rotate(10 31 93)"/><rect x="82" y="93" width="13" height="36" rx="6.5" fill="${p.top}" transform="rotate(-10 88 93)"/>`;
  const headY = p.kid ? 8 : 0;
  return `<svg class="person person-${who}" width="${size}" height="${Math.round(size * 1.4)}" viewBox="0 0 120 168" role="img" aria-label="${p.name}">
  <ellipse cx="60" cy="158" rx="30" ry="6" class="shadow"/>
  ${body}
  <g transform="translate(0 ${headY})">
    <g fill="${p.hair}">${p.hairBack || ''}</g>
    <rect x="54" y="72" width="12" height="16" rx="5" fill="${p.skin}"/>
    <circle cx="60" cy="52" r="27" fill="${p.skin}"/>
    <circle cx="33" cy="55" r="5" fill="${p.skin}"/><circle cx="87" cy="55" r="5" fill="${p.skin}"/>
    <g fill="${p.hair}">${p.hairFront}</g>
    <g class="eyes"><ellipse cx="48" cy="54" rx="3.2" ry="4" fill="#2b2b2b"/><ellipse cx="72" cy="54" rx="3.2" ry="4" fill="#2b2b2b"/></g>
    <ellipse cx="44" cy="63" rx="4" ry="2.5" fill="#ff9aa2" opacity=".6"/><ellipse cx="76" cy="63" rx="4" ry="2.5" fill="#ff9aa2" opacity=".6"/>
    ${p.extra || ''}
    <path class="mouth-closed" d="M53 66q7 6 14 0" stroke="#2b2b2b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <ellipse class="mouth-open" cx="60" cy="68" rx="5" ry="4" fill="#9b2c3a"/>
  </g>
</svg>`;
}

export const person = (who, size) => raw(personSvg(who, size));

// Inline SVG icons. All use currentColor so they follow the theme.
import { raw } from './dom.js';

const svg = (body, { fill = false, size = 24, view = '0 0 24 24' } = {}) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="${view}" aria-hidden="true" ${
    fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"'
  }>${body}</svg>`;

const PATHS = {
  flame: [`<path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.2 1-3.8 2.3-5 .2 1.6 1 2.6 2 3-.6-3.3-.3-6.3.7-9z"/>`, { fill: true }],
  gem: [`<path d="M7 3h10l4 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6M12 21 9 9m3 12 3-12" stroke="rgba(255,255,255,.55)" stroke-width="1.4" fill="none"/>`, { fill: true }],
  heart: [`<path d="M12 21s-8.5-5.3-8.5-11.4A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 8.5 3.2C20.5 15.7 12 21 12 21z"/>`, { fill: true }],
  speaker: [`<path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>`],
  turtle: [`<path d="M4 15c0-4 3.5-7 8-7s8 3 8 7z" fill="currentColor" stroke="none"/><path d="M20 13.5h1.5a1.5 1.5 0 0 0 0-3H20M7 15v3M17 15v3M3 15h18"/>`],
  close: [`<path d="M6 6l12 12M18 6 6 18"/>`],
  learn: [`<path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5v13c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13"/>`],
  practice: [`<path d="M6.5 6.5l11 11M3 10l7-7M14 21l7-7M4.5 6 6 4.5M18 19.5l1.5-1.5"/>`],
  profile: [`<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/>`],
  lock: [`<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>`],
  star: [`<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>`, { fill: true }],
  check: [`<path d="M5 12.5l4.5 4.5L19 7.5"/>`],
  chest: [`<path d="M3 10h18v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19z"/><path d="M3 10V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/><rect x="10" y="9" width="4" height="5" rx="1" fill="currentColor"/>`],
  trophy: [`<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 20.5h8"/>`],
  kana: [`<text x="12" y="17.5" text-anchor="middle" font-size="17" font-weight="800" fill="currentColor" stroke="none" font-family="'M PLUS Rounded 1c', sans-serif">あ</text>`],
  word: [`<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 10h10M7 14h6"/>`],
  chat: [`<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>`],
  refresh: [`<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>`],
  arrow: [`<path d="M5 12h14M13 6l6 6-6 6"/>`],
  bolt: [`<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>`, { fill: true }],
  book: [`<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z"/><path d="M5 16a4 4 0 0 1 4-4h10"/>`],
  download: [`<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>`],
  upload: [`<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>`],
  sun: [`<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`],
  moon: [`<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>`],
  play: [`<path d="M7 4.5v15L19.5 12z"/>`, { fill: true }],
  mic: [`<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>`],
  story: [`<path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5v13c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z" fill="currentColor" stroke="none" opacity=".25"/><path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5v13c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z"/><path d="M8 9.5h1.5M14.5 9.5H16M8.5 13q3.5 2 7 0"/>`],
};

export function icon(name, size) {
  const [body, opts = {}] = PATHS[name];
  return raw(svg(body, { ...opts, size }));
}

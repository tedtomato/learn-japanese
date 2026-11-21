// Small illustrated icons for gifts, lucky lessons and streak freezes (drawn for this app; they use the theme tokens).
import { raw } from './dom.js';

// A wrapped gift: a box with a lid, a ribbon and a bow.
export const giftSvg = (size = 56) => raw(`<svg class="gift-svg" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <rect x="9" y="28" width="46" height="29" rx="5" fill="var(--purple)" stroke="var(--purple-edge)" stroke-width="3"/>
  <rect x="6" y="19" width="52" height="14" rx="5" fill="var(--purple)" stroke="var(--purple-edge)" stroke-width="3"/>
  <rect x="27" y="19" width="10" height="38" fill="var(--gold)" stroke="var(--gold-edge)" stroke-width="2"/>
  <path d="M32 19C24 5 11 8 15 15c3 5 12 4 17 4zM32 19c8-14 21-11 17-4-3 5-12 4-17 4z" fill="var(--gold)" stroke="var(--gold-edge)" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="32" cy="19" r="4" fill="var(--gold-edge)"/>
</svg>`);

// A four-leaf clover for the lucky lesson.
export const cloverSvg = (size = 22) => raw(`<svg class="clover-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <g fill="var(--green)" stroke="var(--green-edge)" stroke-width="1.4" stroke-linejoin="round">
    <path d="M12 11C8 11 6 8 7 6s5-2 5 2zM13 12c0-4 3-6 5-5s2 5-2 5zM12 13c4 0 6 3 5 5s-5 2-5-2zM11 12c0 4-3 6-5 5s-2-5 2-5z"/>
  </g>
  <path d="M12 12.5C12.5 16 14 19 17 21" stroke="var(--green-edge)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`);

// A snowflake token for a streak freeze.
export const snowSvg = (size = 22) => raw(`<svg class="snow-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2.5L15 4M9 20l3-2.5 3 2.5"/>
</svg>`);

// A small trophy cup for completed units (filled).
export const cupSvg = (size = 22) => raw(`<svg class="cup-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
  <path d="M7 3h10v6a5 5 0 0 1-10 0z"/><path d="M7 5H4v1a4 4 0 0 0 3.4 3.9M17 5h3v1a4 4 0 0 1-3.4 3.9" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <rect x="11" y="13.5" width="2" height="4"/><rect x="7.5" y="18" width="9" height="3" rx="1.2"/>
</svg>`);

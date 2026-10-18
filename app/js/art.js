// Cartoon illustrations (Twemoji, CC BY 4.0) instead of the device's own emoji, so pictures look
// the same flat cartoon style everywhere. art('🍣') → <img src="art/1f363.svg">.
import { html } from './dom.js';

// Twemoji file name: code points in hex joined by "-", without FE0F unless it is a ZWJ sequence.
export function artCode(emoji) {
  const cps = [...emoji].map((c) => c.codePointAt(0).toString(16));
  return (emoji.includes('‍') ? cps : cps.filter((c) => c !== 'fe0f')).join('-');
}

export const artSrc = (emoji) => `art/${artCode(emoji)}.svg`;

export const art = (emoji, cls = '') => (emoji ? html`<img class="art ${cls}" src="${artSrc(emoji)}" alt="" draggable="false">` : '');

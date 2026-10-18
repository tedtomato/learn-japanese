// Sharing to WhatsApp with the Hajime logo picture. Phones that can share files open the share sheet
// with the picture attached; otherwise WhatsApp opens with the message, and the link shows the logo preview.
import { html } from './dom.js';
import { icon } from './icons.js';

export const APP_URL = 'https://tedtomato.github.io/learn-japanese/';

// Fetched ahead of the tap: the share must start straight from the click to be allowed.
let logoFile = null;
function loadLogo() {
  if (logoFile || !navigator.canShare) return;
  fetch('icons/share.png').then((r) => r.blob())
    .then((blob) => { logoFile = new File([blob], 'hajime.png', { type: 'image/png' }); })
    .catch(() => {});
}

export function shareWhatsApp(text) {
  const message = `${text}\n\n${APP_URL}`;
  if (logoFile && navigator.canShare?.({ files: [logoFile], text: message })) {
    navigator.share({ files: [logoFile], text: message }).catch((e) => {
      if (e.name !== 'AbortError') openWhatsApp(message);
    });
    return;
  }
  openWhatsApp(message);
}

function openWhatsApp(message) {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

export function tidbitShareText(kind, item) {
  if (kind === 'fact') return `🇯🇵 Did you know? ${item.title}: ${item.text}\n— I'm learning Japanese with Hajime`;
  if (kind === 'phrase') return `🇯🇵 Useful Japanese: ${item.jp} (${item.romaji}) = "${item.en}"\n— I'm learning Japanese with Hajime`;
  return `🇯🇵 Kanji of the day: ${item.k} = ${item.en}. ${item.tip || ''}\n— I'm learning Japanese with Hajime`;
}

// A small WhatsApp-green share button; data-share holds the message.
export const shareButton = (text, label = 'Share') =>
  html`<button class="share-btn" data-share="${text}" aria-label="Share on WhatsApp">${icon('share', 16)}<span>${label}</span></button>`;

// Wires every [data-share] button inside root.
export function wireShare(root) {
  if (root.querySelector('[data-share]')) loadLogo();
  root.querySelectorAll('[data-share]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    shareWhatsApp(b.dataset.share);
  }));
}

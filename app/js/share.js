// Sharing to WhatsApp: opens WhatsApp (app on phones) with a ready-made message and the app link.
import { html } from './dom.js';
import { icon } from './icons.js';

export const APP_URL = 'https://tedtomato.github.io/learn-japanese/';

export function shareWhatsApp(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${APP_URL}`)}`;
  window.open(url, '_blank', 'noopener');
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
  root.querySelectorAll('[data-share]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    shareWhatsApp(b.dataset.share);
  }));
}

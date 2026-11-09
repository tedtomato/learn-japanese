import { L } from './lang.js';

// Tiny HTML templating: values are escaped unless wrapped with raw().
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

export const raw = (s) => ({ __raw: String(s) });

function value(v) {
  if (v == null || v === false) return '';
  if (Array.isArray(v)) return v.map(value).join('');
  if (typeof v === 'object' && '__raw' in v) return v.__raw;
  return esc(v);
}

export function html(strings, ...values) {
  return raw(strings.reduce((out, s, i) => out + s + (i < values.length ? value(values[i]) : ''), ''));
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Words in the course language are marked with their language, so a screen reader uses the right voice.
const TARGET = '.jp, .word-jp, .guide-jp';
export function tagLang(el) {
  const lang = L.speech.slice(0, 2);
  for (const x of el.querySelectorAll(TARGET)) {
    if (x.hasAttribute('lang') || x.closest('[lang]') !== document.documentElement) continue;
    x.setAttribute('lang', lang);
  }
}

export function mount(el, template) {
  el.innerHTML = template.__raw;
  if (typeof document !== 'undefined' && el.querySelector) tagLang(el);
  return el;
}

// Arrow-key navigation for a row of tabs or radio buttons (roving tabindex): Left/Up and Right/Down move
// to the neighbour and select it, Home / End jump to the ends. `select(button)` is called for the new one.
export function wireArrows(group, select) {
  const items = () => $$('button', group);
  items().forEach((b) => b.setAttribute('tabindex', b.getAttribute('aria-selected') === 'true' || b.getAttribute('aria-checked') === 'true' ? '0' : '-1'));
  group.addEventListener('keydown', (e) => {
    const list = items();
    const at = list.indexOf(document.activeElement);
    if (at < 0) return;
    const to = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: list.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select(list[(to + list.length) % list.length]);
  });
}

// Shrinks a one-line Japanese word until it fits its box (long words on narrow phones): first the
// font, then tighter romaji spacing and a little smaller, and only then lets it wrap.
export function fitText(root) {
  $$('.fit', root).forEach((el) => {
    // Start from the full size again (a rotation or a resize can make more room).
    el.style.fontSize = '';
    el.classList.remove('fit-tight');
    el.style.whiteSpace = '';
    el.style.wordBreak = '';
    $$('.ruby-on', el).forEach((x) => { x.style.whiteSpace = ''; x.style.wordBreak = ''; });
    const over = () => el.scrollWidth > el.clientWidth + 1;
    const shrink = (min) => {
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (over() && size > min) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    };
    shrink(20);
    if (over()) {
      el.classList.add('fit-tight');
      shrink(17);
    }
    if (over()) $$('.ruby-on', el).concat(el).forEach((x) => { x.style.whiteSpace = 'normal'; x.style.wordBreak = 'break-all'; });
  });
}

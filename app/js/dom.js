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

export function mount(el, template) {
  el.innerHTML = template.__raw;
  return el;
}

// Shrinks a one-line Japanese word until it fits its box (long words on narrow phones): first the
// font, then tighter romaji spacing and a little smaller, and only then lets it wrap.
export function fitText(root) {
  $$('.fit', root).forEach((el) => {
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
      shrink(15);
    }
    if (over()) $$('.ruby-on', el).concat(el).forEach((x) => { x.style.whiteSpace = 'normal'; x.style.wordBreak = 'break-all'; });
  });
}

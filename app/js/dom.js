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

// Shrinks a one-line Japanese word until it fits its bubble (long words on narrow phones), then wraps.
export function fitText(root) {
  $$('.fit', root).forEach((el) => {
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth + 1 && size > 20) {
      size -= 2;
      el.style.fontSize = `${size}px`;
    }
    // Still too long: let it wrap onto two lines rather than go tiny.
    if (el.scrollWidth > el.clientWidth + 1) $$('.ruby-on', el).concat(el).forEach((x) => { x.style.whiteSpace = 'normal'; x.style.wordBreak = 'break-all'; });
  });
}

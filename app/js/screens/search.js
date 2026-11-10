// A search box for a list of rows. A row carries its searchable text in data-q (target text, romanisation
// and meaning); typing hides the rows that do not match (accents and capitals do not matter, see matchesQuery).
import { html, $, $$ } from '../dom.js';
import { icon } from '../icons.js';
import { announce } from '../app.js';
import { matchesQuery } from '../usability.js';
import { t } from '../strings.js';

export const searchBox = (label) => html`<div class="search-wrap" role="search">
  <span class="search-icon" aria-hidden="true">${icon('search', 20)}</span>
  <input class="search-input" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${label}" aria-label="${label}">
</div>
<p class="muted small search-none" role="status" hidden>${t('Nothing matches.')}</p>`;

// The text a row is found by.
export const searchText = (...fields) => fields.filter(Boolean).join(' ');

// Wires every search box under root to the rows (data-q) inside its [data-search-scope].
export function wireSearch(root) {
  $$('.search-input', root).forEach((input) => {
    const scope = input.closest('[data-search-scope]') || root;
    const none = $('.search-none', scope);
    input.addEventListener('input', () => {
      let shown = 0;
      $$('[data-q]', scope).forEach((row) => {
        const match = matchesQuery(input.value, row.dataset.q);
        row.hidden = !match;
        if (match) shown += 1;
      });
      // A group (a heading and its rows) disappears when none of its rows is left.
      $$('[data-search-group]', scope).forEach((g) => { g.hidden = !$$('[data-q]:not([hidden])', g).length; });
      if (none) none.hidden = shown > 0 || !input.value.trim();
      if (input.value.trim()) announce(shown ? t(shown === 1 ? '{n} result' : '{n} results', { n: shown }) : t('Nothing matches.'));
    });
  });
}

// Replaced with the build date and commit by scripts/build.mjs when the site is published.
export const VERSION = '__APP_VERSION__';

// "20261018.0533-b0f47a7" → "18 Oct 2026 · 05:33 · b0f47a7" (other stamps are shown as they are).
export function versionLabel(v = VERSION) {
  const m = /^(\d{4})(\d{2})(\d{2})\.(\d{2})(\d{2})-(\w+)$/.exec(v);
  if (!m) return v;
  const date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return `${date} · ${m[4]}:${m[5]} · ${m[6]}`;
}

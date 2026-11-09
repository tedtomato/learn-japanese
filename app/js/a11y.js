// Pure accessibility helpers: no DOM access at import time, so tests/a11y.test.mjs can run them in Node.

// A control that handles Enter / Space / digits itself: global shortcuts must stay out of its way.
export function isControl(target) {
  if (!target) return false;
  return /^(BUTTON|INPUT|TEXTAREA|SELECT|A|SUMMARY)$/.test(String(target.tagName || '').toUpperCase()) || !!target.isContentEditable;
}

// Whether the lesson's keyboard shortcuts (1–9 pick, Enter checks) should ignore this key press.
// ctx: { modalOpen, sheetOpen } — a dialog or the "explain" sheet is on top of the lesson.
export function lessonKeyIgnored(e, { modalOpen = false, sheetOpen = false } = {}) {
  if (e.defaultPrevented || e.isComposing) return true;
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  if (modalOpen || sheetOpen) return true;
  return isControl(e.target);
}

// Number-key shortcuts (WCAG 2.1.4): a setting, on by default only where there is a physical keyboard.
export function shortcutsEnabled(settings = {}, finePointer = false) {
  return settings.keys === undefined ? !!finePointer : settings.keys !== false;
}

// "Listening tasks": on | off (never) | text (play them, and show the words too).
export function listeningMode(settings = {}) {
  return settings.listening === 'off' || settings.listening === 'text' ? settings.listening : 'on';
}

// WCAG contrast ratio of two #rrggbb colours.
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export function luminance(hex) {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

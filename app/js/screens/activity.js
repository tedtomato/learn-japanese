// Activity screens (missions, drills, signs, tones, quiz, listening) have their own close button, so the
// bottom tab bar steps aside and gives its height back. The class is dropped when the route changes.
export function hideNav() {
  document.body.classList.add('activity');
  // Capture phase: runs before the router renders the next screen, which may call hideNav() again.
  window.addEventListener('hashchange', () => document.body.classList.remove('activity'), { once: true, capture: true });
}

// Hearts sheet: opened by tapping the heart in the top bar. Shows hearts, the next free refill,
// and a full refill for gems.
import { app, modal, toast } from '../app.js';
import { html } from '../dom.js';
import { icon } from '../icons.js';
import { currentHearts, msToNextHeart, buyHearts, MAX_HEARTS, HEARTS_PRICE } from '../progress.js';
import { sfx } from '../audio.js';

export function showHearts() {
  const now = app.now();
  const { state } = app;
  const hearts = currentHearts(state, now);
  const full = hearts >= MAX_HEARTS;
  const mins = Math.ceil(msToNextHeart(state, now) / 60000);
  const canBuy = !full && state.gems >= HEARTS_PRICE;
  modal(html`<div class="center hearts-sheet">
    <div class="hearts-row">${Array.from({ length: MAX_HEARTS }, (_, i) => html`<span class="${i < hearts ? 'on' : ''}">${icon('heart', 34)}</span>`)}</div>
    <h2>${full ? 'Hearts full!' : `${hearts} of ${MAX_HEARTS} hearts`}</h2>
    <p class="muted">${full ? 'You lose a heart for each mistake in a lesson. Practice never costs hearts.' : `Next free heart in ${mins} min. A practice session also earns one back.`}</p>
  </div>`, [
    ...(full ? [] : [{ label: html`Refill hearts · ${icon('gem', 16)} ${HEARTS_PRICE}`, kind: canBuy ? 'primary' : 'white', onClick: () => {
      if (!buyHearts(app.state, app.now())) return toast(`You need ${HEARTS_PRICE} gems — you have ${app.state.gems}.`);
      app.save();
      sfx('bonus');
      toast('Hearts refilled!');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } }]),
    { label: 'Close', kind: 'secondary' },
  ]);
}

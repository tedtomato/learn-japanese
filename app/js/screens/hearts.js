// Hearts sheet: opened by tapping the heart in the top bar. Shows hearts, the next free refill,
// and a full refill for gems.
import { app, modal, toast } from '../app.js';
import { html } from '../dom.js';
import { icon } from '../icons.js';
import { currentHearts, msToNextHeart, buyHearts, MAX_HEARTS, HEARTS_PRICE } from '../progress.js';
import { sfx } from '../audio.js';
import { t } from '../strings.js';

export function showHearts() {
  const now = app.now();
  const { state } = app;
  const hearts = currentHearts(state, now);
  const full = hearts >= MAX_HEARTS;
  const mins = Math.ceil(msToNextHeart(state, now) / 60000);
  const canBuy = !full && state.gems >= HEARTS_PRICE;
  modal(html`<div class="center hearts-sheet">
    <div class="hearts-row">${Array.from({ length: MAX_HEARTS }, (_, i) => html`<span class="${i < hearts ? 'on' : ''}">${icon('heart', 34)}</span>`)}</div>
    <h2>${full ? t('Hearts full!') : t('{n} of {max} hearts', { n: hearts, max: MAX_HEARTS })}</h2>
    <p class="muted">${full ? t('You lose a heart for each mistake when you replay a finished lesson. New lessons and practice never cost hearts.') : t('Next free heart in {n} min. A practice session also earns one back.', { n: mins })}</p>
    ${!full && !canBuy ? html`<p class="muted small hearts-earn">${t('A refill costs {price} gems and you have {n}. Earn gems from lessons (+2), treasure chests (+15), missions and your daily goal (+5).', { price: HEARTS_PRICE, n: state.gems })}</p>` : ''}
  </div>`, [
    ...(full ? [] : [{ label: html`${t('Refill hearts')} · ${icon('gem', 16)} ${HEARTS_PRICE}`, kind: canBuy ? 'primary' : 'white', onClick: () => {
      if (!buyHearts(app.state, app.now())) return toast(t('You need {price} gems — you have {n}.', { price: HEARTS_PRICE, n: app.state.gems }));
      app.save();
      sfx('bonus');
      toast(t('Hearts refilled!'));
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } }]),
    ...(!full && !canBuy ? [{ label: t('Practice to earn a heart'), kind: 'primary', onClick: () => app.go('#/practice/go') }] : []),
    { label: t('Close'), kind: 'secondary' },
  ]);
}

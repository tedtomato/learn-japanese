// What changed in each release — shown when tapping the app version in Profile.
// Newest first. Keep entries short: they are read on a phone.
export const CHANGELOG = [
  { version: '0.7', date: '18 Oct 2026', changes: [
    'The learning path is now a garden trail of stepping stones',
    'Bonsai trees, zen stones, bushes, grass and stone lanterns along the way',
  ] },
  { version: '0.6', date: '18 Oct 2026', changes: [
    'Hidden test lab: double-tap the dog on Profile. Uses a separate test copy — your real progress is safe',
    'Lab: unlock all levels, learn all kana, fill hearts & gems, try any task type, jump to any lesson',
    'App version number shown on the start screen and under My progress',
  ] },
  { version: '0.5', date: '18 Oct 2026', changes: [
    'Phone-only: the app now asks you to open it on a mobile phone',
    'Text on screen can no longer be selected by accident',
    '"Tokyo trip" is now "First trip to Japan"',
    'Start screen says the app name out loud, with credits',
    'Bottom menu icons bounce when tapped',
    'This change log, behind the app version',
  ] },
  { version: '0.4', date: '18 Oct 2026', changes: [
    'Course rebuilt around essential words; hiragana and katakana spread through every unit',
    'Romaji over each syllable, fading as you learn to read',
    'Trace the character, speak and repeat, fast listening, grammar cards, dialogues',
    'Kanji with radicals, micro-stories and compound words',
    'Characters with their own voices, countdown and speed bonus, Explain my answer',
    'Missed and hesitant answers come back at the end of a lesson',
    'Cartoon pictures, sakura petals, chest and bonus animations, start screen',
  ] },
  { version: '0.3', date: '18 Oct 2026', changes: [
    'Updates reach your phone reliably, with a "Reload latest version" button',
  ] },
  { version: '0.2', date: '18 Oct 2026', changes: [
    'Course starts with phrases for a first trip to Japan',
    'Fixed lesson pop-up hidden behind the path, and the flag on Windows',
  ] },
  { version: '0.1', date: '18 Oct 2026', changes: [
    'First version: learning path, hiragana, first words, streaks, hearts, gems',
    'Fun facts, travel phrasebook, dark mode, offline, backup and restore',
  ] },
];

export const APP_RELEASE = CHANGELOG[0].version;

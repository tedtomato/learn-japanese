// What changed in each release — shown when tapping the app version in Profile.
// Newest first. Keep entries short: they are read on a phone.
export const CHANGELOG = [
  { version: '0.23', date: '18 Oct 2026', changes: [
    'A kanji is always shown first with its memory clue before you are asked to recognise it (also for kanji spotted in Kanji peek)',
    'The memory clue ("Remember it: …") now stands out on the kanji card',
  ] },
  { version: '0.22', date: '18 Oct 2026', changes: [
    'Lesson breaks now show interesting facts about Japan only, no more useful phrases',
  ] },
  { version: '0.21', date: '18 Oct 2026', changes: [
    'New character: Mika. For now, Yuki and Mika speak in all lessons and dialogues',
    "Everyone uses your phone's normal Japanese voice, unchanged — no more odd-sounding voices",
    'Character voice picker removed (nothing to install)',
  ] },
  { version: '0.20', date: '18 Oct 2026', changes: [
    'Ken no longer sounds robotic on phones without a male voice: only slightly lower, not distorted',
  ] },
  { version: '0.19', date: '18 Oct 2026', changes: [
    'Ken now uses a real male voice when your phone has one (better voice detection)',
    'New: Profile → Character voices, to pick the voice for Ken, Yuki, Sora and Hana',
    'Phones with only one Japanese voice: Ken sounds deeper and calmer',
  ] },
  { version: '0.18', date: '18 Oct 2026', changes: [
    'Kanji readings explained in plain words: "Alone, say…" and "In longer words…" instead of kun / on',
  ] },
  { version: '0.17', date: '18 Oct 2026', changes: [
    'Grammar cards: Japanese words bigger and no longer spread apart, so they read as one word',
  ] },
  { version: '0.16', date: '18 Oct 2026', changes: [
    'Little streams cross the learning path, with red Japanese garden bridges',
  ] },
  { version: '0.15', date: '18 Oct 2026', changes: [
    'WhatsApp shares include the Hajime logo picture',
    'Fixed: long words in the unit Guide spilling over the next card',
  ] },
  { version: '0.14', date: '18 Oct 2026', changes: [
    'Zen pebbles and moss along both sides of the learning path',
  ] },
  { version: '0.13', date: '18 Oct 2026', changes: [
    'No more automatic jump to the next exercise: tap Continue when ready, so there is always time for Explain',
    'Auto-continue setting removed',
  ] },
  { version: '0.12', date: '18 Oct 2026', changes: [
    'Fixed: long Japanese words running off the right of the screen — they now shrink, then wrap',
    'No more pictures next to the answer choices',
    'Kanji from "Did you know" cards are only asked in Practice, never in path lessons',
    'Answer choices never show kanji you have not learned',
  ] },
  { version: '0.11', date: '18 Oct 2026', changes: [
    'Fixed: matching pairs pushed off the screen by long words',
    'Fixed: lesson pop-up on the path cut off at the screen edge',
  ] },
  { version: '0.10', date: '18 Oct 2026', changes: [
    'More time before the next exercise: 2.5 s after a right answer, 5 s after a wrong one',
    'New setting: Auto-continue — Normal, Relaxed (4 s / 8 s) or Off (tap Continue)',
  ] },
  { version: '0.9', date: '18 Oct 2026', changes: [
    'Bigger romaji above the Japanese — easier to read',
    'Smaller play buttons so the answers fit on screen',
    'Words no longer break across lines; "bye" has its own picture',
  ] },
  { version: '0.8', date: '18 Oct 2026', changes: [
    'Share on WhatsApp: "Did you know?" facts, phrases and kanji peeks',
    'Share unlocked achievements from Profile, and unit trophies when you earn them',
  ] },
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

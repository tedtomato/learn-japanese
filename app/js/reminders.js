// Daily reminder (Android Chrome, app added to the home screen): the phone wakes the service worker
// about once a day ("periodic background sync"); if the learner has not studied that day it shows a
// notification. The app leaves the worker a small note in Cache Storage, since the worker cannot read
// the progress kept in localStorage.
import { L } from './lang.js';
import { dayKey, displayStreak, dueItemIds, wordOfTheDay } from './progress.js';
import { t, langName } from './strings.js';

const NOTE_CACHE = 'reminder-note';
const NOTE_URL = './__reminder.json';
const TAG = 'daily-reminder';

export const remindersSupported = () => typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window;

// The words of the notification, written here (in the interface language) because the worker cannot translate.
// body: the usual nudge; evening: after 19:00 with a streak on the line, "your streak ends tonight". Both end with a
// word of the day (a word you know that is due soon, with its meaning).
export function reminderText(state, now) {
  const streak = displayStreak(state, now);
  const due = dueItemIds(state, now).filter((id) => state.items[id].seen > 0).length;
  const w = wordOfTheDay(state, now);
  const word = w ? ` ${t('Word of the day: {word}', { word: `${w.jp}${w.romaji && w.romaji !== w.jp ? ` (${w.romaji})` : ''} = ${w.en}` })}` : '';
  const body = (streak > 0
    ? t('Keep your {n}-day streak going 🔥', { n: streak }) + (due ? ` — ${t('{n} words to review', { n: due })}` : '')
    : due ? t('{n} words are ready to review. Two minutes is enough!', { n: due }) : t('A quick lesson keeps your {lang} fresh.', { lang: langName() })) + word;
  const evening = streak > 0 ? t('Your {n}-day streak ends tonight 🔥 One quick lesson saves it.', { n: streak }) + word : body;
  return { title: t('Time for {lang}! {say}', { lang: langName(), say: L.titleSay || '' }).trim(), body, evening };
}

// Called on every save (real progress only).
export function writeReminderNote(state, now) {
  if (!remindersSupported() || !('caches' in window)) return;
  const note = {
    on: !!state.settings.reminders,
    lastDay: state.streak.lastDay || null,
    streak: displayStreak(state, now),
    due: dueItemIds(state, now).filter((id) => state.items[id].seen > 0).length,
    today: dayKey(now),
    name: L.name,
    say: L.titleSay,
    ...reminderText(state, now),
  };
  caches.open(NOTE_CACHE)
    .then((c) => c.put(NOTE_URL, new Response(JSON.stringify(note), { headers: { 'Content-Type': 'application/json' } })))
    .catch(() => {});
}

// Turns the reminder on: notification permission, then the daily background check.
// Resolves to 'on', 'denied' (notifications blocked) or 'unsupported' (no background check here).
export async function enableReminders() {
  if (!remindersSupported()) return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';
  const reg = await navigator.serviceWorker.ready;
  if (!('periodicSync' in reg)) return 'unsupported';
  try {
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (status.state !== 'granted') return 'unsupported';
    await reg.periodicSync.register(TAG, { minInterval: 12 * 60 * 60 * 1000 });
    return 'on';
  } catch {
    return 'unsupported';
  }
}

export async function disableReminders() {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.periodicSync?.unregister(TAG);
  } catch { /* nothing registered */ }
}

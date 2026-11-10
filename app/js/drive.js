// Optional Google Drive backup. Off until the owner pastes an OAuth client id below (see docs/GOOGLE_DRIVE_SETUP.md):
// while it is empty nothing about Drive shows in the app and no Google script is ever loaded.
// Uses Google Identity Services (token client) and the Drive v3 REST API, in the hidden app-data folder only.
import { L } from './lang.js';
import { exportBackup, importBackup } from './progress.js';

export const DRIVE_CLIENT_ID = '';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GIS_URL = 'https://accounts.google.com/gsi/client';
const API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

// ---- Pure parts (unit-tested) ---------------------------------------------------------------------------------
export const driveConfigured = (clientId = DRIVE_CLIENT_ID) => typeof clientId === 'string' && clientId.trim().length > 0;
// One file per course, so the courses never overwrite each other.
export const driveFileName = (code) => `hajime-backup-${code}.json`;
// A sync is due after a lesson when sync is on and none happened yet today (local calendar day).
export const syncDue = (on, lastAt, now) => !!on && (!lastAt || new Date(lastAt).toDateString() !== new Date(now).toDateString());

// ---- Device-level sync settings (not in the progress, so a restore never switches sync off) ------------------------
const KEY_ON = 'hajime.drive.on';
const keyAt = (code) => `hajime.drive.at.${code}`;
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* storage blocked */ } };
export const syncOn = () => driveConfigured() && read(KEY_ON) === '1';
export const lastSyncAt = (code = L.code) => Number(read(keyAt(code))) || null;
export const setSyncOn = (on) => write(KEY_ON, on ? '1' : null);

// ---- Sign-in -----------------------------------------------------------------------------------------------------
let gisPromise = null;
// The Google script is fetched only when the learner turns sync on (or it was already on).
function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  gisPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GIS_URL;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => { gisPromise = null; reject(new Error('Could not reach Google. Check your connection.')); };
    document.head.append(s);
  });
  return gisPromise;
}

let token = null; // { value, expires }
// An access token; asked again when missing or about to expire. `interactive` may show Google's sign-in popup.
async function accessToken(interactive) {
  if (token && token.expires - 60000 > Date.now()) return token.value;
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: DRIVE_CLIENT_ID,
      scope: SCOPE,
      callback: (res) => {
        if (res.error || !res.access_token) return reject(new Error(res.error === 'access_denied' ? 'Google sign-in was cancelled.' : 'Google sign-in failed.'));
        token = { value: res.access_token, expires: Date.now() + (Number(res.expires_in) || 3600) * 1000 };
        resolve(token.value);
      },
      error_callback: () => reject(new Error('Google sign-in was cancelled.')),
    });
    client.requestAccessToken({ prompt: interactive ? '' : 'none' });
  });
}

// A Drive call with the token; a 401 (expired or revoked) gets a new token and one retry.
async function drive(url, init = {}, interactive = true) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${await accessToken(interactive)}` } });
    if (res.status === 401 && attempt === 0) { token = null; continue; }
    if (!res.ok) throw Object.assign(new Error('Google Drive error {n}.'), { vars: { n: res.status } }); // shown through t()
    return res;
  }
  throw new Error('Google Drive sign-in expired.');
}

async function findFile(code, interactive) {
  const q = encodeURIComponent(`name = '${driveFileName(code)}'`);
  const res = await drive(`${API}?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&pageSize=1`, {}, interactive);
  return (await res.json()).files?.[0] || null;
}

// Saves this course's backup (same JSON as the backup file), creating or replacing the Drive file.
export async function uploadBackup(state, { interactive = true, now = Date.now() } = {}) {
  const existing = await findFile(L.code, interactive);
  const meta = existing ? {} : { name: driveFileName(L.code), parents: ['appDataFolder'] };
  const boundary = 'hajime-boundary';
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`
    + `--${boundary}\r\nContent-Type: application/json\r\n\r\n${exportBackup(state, now)}\r\n--${boundary}--`;
  await drive(`${UPLOAD}${existing ? `/${existing.id}` : ''}?uploadType=multipart`, {
    method: existing ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  }, interactive);
  write(keyAt(L.code), String(now));
  return now;
}

// The saved progress of this course from Drive, ready to replace the local one (null: nothing saved yet).
export async function downloadBackup() {
  const file = await findFile(L.code, true);
  if (!file) return null;
  const res = await drive(`${API}/${file.id}?alt=media`);
  return importBackup(await res.text());
}

// Turn sync on: sign in, then save right away.
export async function enableSync(state) {
  await accessToken(true);
  setSyncOn(true);
  return uploadBackup(state);
}
export const disableSync = () => { setSyncOn(false); token = null; };

// After a lesson: at most one quiet upload a day. Never throws; a failed one is simply tried after the next lesson.
export async function autoSync(state, now = Date.now()) {
  if (!syncOn() || !syncDue(true, lastSyncAt(), now)) return false;
  try {
    await uploadBackup(state, { interactive: false, now });
    return true;
  } catch {
    return false;
  }
}

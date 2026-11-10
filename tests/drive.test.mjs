import test from 'node:test';
import assert from 'node:assert/strict';
import { driveConfigured, driveFileName, syncDue, DRIVE_CLIENT_ID } from '../app/js/drive.js';

test('Drive sync is off until a client id is set', () => {
  assert.equal(DRIVE_CLIENT_ID, '');
  assert.equal(driveConfigured(), false);
  assert.equal(driveConfigured('  '), false);
  assert.equal(driveConfigured('123.apps.googleusercontent.com'), true);
});

test('one Drive file per course', () => {
  const names = ['ja', 'zh', 'fr', 'es', 'en'].map(driveFileName);
  assert.equal(new Set(names).size, 5);
  assert.equal(driveFileName('fr'), 'hajime-backup-fr.json');
});

test('sync is due once a day, only when on', () => {
  const noon = new Date(2026, 5, 10, 12).getTime();
  assert.equal(syncDue(false, null, noon), false);
  assert.equal(syncDue(true, null, noon), true);
  assert.equal(syncDue(true, noon - 3600e3, noon), false, 'same day');
  assert.equal(syncDue(true, new Date(2026, 5, 9, 23).getTime(), noon), true, 'yesterday');
});
